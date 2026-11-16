SET search_path TO decolae;

-- Emissões serializadas por voo e cliente para impedir sobrelotação, duplicidade
-- de assento e compras simultâneas de voos com horários incompatíveis.
CREATE OR REPLACE FUNCTION verifica_disponibilidade_voo()
RETURNS trigger AS $$
DECLARE
  v_capacidade integer;
  v_ocupados integer;
  v_inicio timestamptz;
  v_fim timestamptz;
BEGIN
  SELECT v.previsao_partida, v.previsao_chegada, a.quantidade_assentos
  INTO v_inicio, v_fim, v_capacidade
  FROM voo v
  JOIN aeronave a ON a.identificacao = v.id_aeronave
  WHERE v.numero_voo = NEW.numero_voo
    AND v.status IN ('PROGRAMADO', 'ATRASADO')
  FOR UPDATE OF v;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Não é possível emitir passagens para voos nesse status'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.numero_assento < 1 OR NEW.numero_assento > v_capacidade THEN
    RAISE EXCEPTION 'Número de assento inválido' USING ERRCODE = '23514';
  END IF;

  PERFORM 1 FROM cliente WHERE cpf = NEW.cpf_cliente FOR UPDATE;

  IF EXISTS (
    SELECT 1 FROM passagem p
    WHERE p.numero_voo = NEW.numero_voo
      AND p.numero_assento = NEW.numero_assento
      AND p.status <> 'CANCELADA'
      AND p.numero_bilhete <> NEW.numero_bilhete
  ) THEN
    RAISE EXCEPTION 'O assento % já está ocupado', NEW.numero_assento
      USING ERRCODE = '23505';
  END IF;

  SELECT count(*) INTO v_ocupados
  FROM passagem p
  WHERE p.numero_voo = NEW.numero_voo
    AND p.status <> 'CANCELADA'
    AND p.numero_bilhete <> NEW.numero_bilhete;

  IF v_ocupados >= v_capacidade THEN
    RAISE EXCEPTION 'Voo lotado' USING ERRCODE = '23514';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM passagem p
    JOIN voo outro ON outro.numero_voo = p.numero_voo
    WHERE p.cpf_cliente = NEW.cpf_cliente
      AND p.status = 'EMITIDA'
      AND p.numero_bilhete <> NEW.numero_bilhete
      AND outro.numero_voo <> NEW.numero_voo
      AND outro.status <> 'CANCELADO'
      AND outro.previsao_partida < v_fim
      AND v_inicio < outro.previsao_chegada
  ) THEN
    RAISE EXCEPTION 'Você já tem uma passagem para um voo com horário sobreposto'
      USING ERRCODE = '23P01';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_disponibilidade_voo ON passagem;
CREATE TRIGGER trigger_disponibilidade_voo
BEFORE INSERT OR UPDATE ON passagem
FOR EACH ROW
WHEN (NEW.status = 'EMITIDA')
EXECUTE FUNCTION verifica_disponibilidade_voo();

CREATE OR REPLACE FUNCTION valida_conflito_aeronave()
RETURNS trigger AS $$
BEGIN
  -- Voos cancelados ou concluídos não ocupam a aeronave.
  IF NEW.status IN ('CANCELADO', 'CONCLUIDO') THEN
    RETURN NEW;
  END IF;
  -- Serializa alocações na mesma aeronave antes de verificar a sobreposição.
  PERFORM 1 FROM aeronave WHERE identificacao = NEW.id_aeronave FOR UPDATE;
  IF EXISTS (
    SELECT 1 FROM voo v
    WHERE v.id_aeronave = NEW.id_aeronave
      AND v.numero_voo <> NEW.numero_voo
      AND v.status NOT IN ('CANCELADO', 'CONCLUIDO')
      AND v.previsao_partida < NEW.previsao_chegada
      AND NEW.previsao_partida < v.previsao_chegada
  ) THEN
    RAISE EXCEPTION 'A aeronave já está alocada em um voo com horário sobreposto'
      USING ERRCODE = '23P01';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_conflito_aeronave ON voo;
CREATE TRIGGER trigger_conflito_aeronave
BEFORE INSERT OR UPDATE OF id_aeronave, previsao_partida, previsao_chegada, status ON voo
FOR EACH ROW
EXECUTE FUNCTION valida_conflito_aeronave();

CREATE OR REPLACE FUNCTION valida_horario_tripulante(
  p_cpf char(11), p_voo varchar(10), p_inicio timestamptz, p_fim timestamptz
)
RETURNS void AS $$
DECLARE
  v_sobrecarga boolean;
BEGIN
  PERFORM 1 FROM tripulante WHERE cpf = p_cpf FOR UPDATE;

  IF EXISTS (
    SELECT 1
    FROM tripulacao_voo tv
    JOIN voo v ON v.numero_voo = tv.numero_voo
    WHERE tv.cpf_tripulante = p_cpf
      AND tv.numero_voo <> p_voo
      AND v.status <> 'CANCELADO'
      AND v.previsao_partida < p_fim
      AND p_inicio < v.previsao_chegada
  ) THEN
    RAISE EXCEPTION 'Tripulante já está escalado em um voo com horário sobreposto'
      USING ERRCODE = '23P01';
  END IF;

  -- Um bloco de trabalho termina após 36 horas sem outro voo. O total de voo
  -- dentro de cada bloco não pode ultrapassar 12 horas.
  WITH escala AS (
    SELECT v.previsao_partida AS inicio, v.previsao_chegada AS fim
    FROM tripulacao_voo tv
    JOIN voo v ON v.numero_voo = tv.numero_voo
    WHERE tv.cpf_tripulante = p_cpf AND tv.numero_voo <> p_voo
      AND v.status <> 'CANCELADO'
    UNION ALL
    SELECT p_inicio, p_fim
  ), ordenada AS (
    SELECT inicio, fim,
           lag(fim) OVER (ORDER BY inicio, fim) AS fim_anterior
    FROM escala
  ), blocos AS (
    SELECT inicio, fim,
           sum(CASE WHEN fim_anterior IS NULL OR inicio - fim_anterior >= interval '36 hours'
                    THEN 1 ELSE 0 END)
             OVER (ORDER BY inicio, fim) AS bloco
    FROM ordenada
  ), carga AS (
    SELECT bloco, sum(extract(epoch FROM (fim - inicio)) / 3600.0) AS horas
    FROM blocos
    GROUP BY bloco
  )
  SELECT coalesce(bool_or(horas > 12), false) INTO v_sobrecarga FROM carga;

  IF v_sobrecarga THEN
    RAISE EXCEPTION 'A escala excede 12 horas de trabalho sem o descanso mínimo de 36 horas'
      USING ERRCODE = '23P01';
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION valida_escala_tripulante()
RETURNS trigger AS $$
DECLARE
  v_inicio timestamptz;
  v_fim timestamptz;
  v_status status_voo;
BEGIN
  -- FOR SHARE bloqueia uma alteração simultânea de horário/status do voo até
  -- esta escala ser confirmada, e a alteração então enxerga o novo tripulante.
  SELECT previsao_partida, previsao_chegada, status INTO v_inicio, v_fim, v_status
  FROM voo WHERE numero_voo = NEW.numero_voo
  FOR SHARE;
  IF FOUND AND v_status <> 'CANCELADO' THEN
    PERFORM valida_horario_tripulante(NEW.cpf_tripulante, NEW.numero_voo, v_inicio, v_fim);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_escala_tripulante ON tripulacao_voo;
CREATE TRIGGER trigger_escala_tripulante
BEFORE INSERT OR UPDATE ON tripulacao_voo
FOR EACH ROW
EXECUTE FUNCTION valida_escala_tripulante();

CREATE OR REPLACE FUNCTION valida_agenda_voo()
RETURNS trigger AS $$
DECLARE
  r record;
BEGIN
  IF NEW.status = 'CANCELADO' OR (
    OLD.status <> 'CANCELADO'
    AND OLD.previsao_partida = NEW.previsao_partida
    AND OLD.previsao_chegada = NEW.previsao_chegada
  ) THEN
    RETURN NEW;
  END IF;
  FOR r IN
    SELECT cpf_tripulante FROM tripulacao_voo
    WHERE numero_voo = NEW.numero_voo ORDER BY cpf_tripulante
  LOOP
    PERFORM valida_horario_tripulante(r.cpf_tripulante, NEW.numero_voo,
                                      NEW.previsao_partida, NEW.previsao_chegada);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agenda_voo ON voo;
CREATE TRIGGER trigger_agenda_voo
BEFORE UPDATE OF previsao_partida, previsao_chegada, status ON voo
FOR EACH ROW
EXECUTE FUNCTION valida_agenda_voo();

CREATE OR REPLACE FUNCTION valida_passageiros_agenda_voo()
RETURNS trigger AS $$
DECLARE
  r record;
BEGIN
  IF NEW.status = 'CANCELADO' OR (
    OLD.status <> 'CANCELADO'
    AND OLD.previsao_partida = NEW.previsao_partida
    AND OLD.previsao_chegada = NEW.previsao_chegada
  ) THEN
    RETURN NEW;
  END IF;
  FOR r IN
    SELECT DISTINCT cpf_cliente FROM passagem
    WHERE numero_voo = NEW.numero_voo AND status = 'EMITIDA'
    ORDER BY cpf_cliente
  LOOP
    PERFORM 1 FROM cliente WHERE cpf = r.cpf_cliente FOR UPDATE;
    IF EXISTS (
      SELECT 1
      FROM passagem p
      JOIN voo outro ON outro.numero_voo = p.numero_voo
      WHERE p.cpf_cliente = r.cpf_cliente
        AND p.status = 'EMITIDA'
        AND p.numero_voo <> NEW.numero_voo
        AND outro.status <> 'CANCELADO'
        AND outro.previsao_partida < NEW.previsao_chegada
        AND NEW.previsao_partida < outro.previsao_chegada
    ) THEN
      RAISE EXCEPTION 'A alteração cria conflito de horário com uma passagem emitida para o cliente %', r.cpf_cliente
        USING ERRCODE = '23P01';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_agenda_passageiros ON voo;
CREATE TRIGGER trigger_agenda_passageiros
BEFORE UPDATE OF previsao_partida, previsao_chegada, status ON voo
FOR EACH ROW
EXECUTE FUNCTION valida_passageiros_agenda_voo();

CREATE OR REPLACE FUNCTION verifica_tripulacao_completa()
RETURNS trigger AS $$
DECLARE
  v_comandantes integer;
  v_copilotos integer;
  v_comissarios integer;
BEGIN
  -- Qualquer status operacional exige a tripulação mínima, não só PROGRAMADO,
  -- para que não seja possível pular de PLANEJAMENTO direto para ATRASADO etc.
  IF NEW.status NOT IN ('PLANEJAMENTO', 'CANCELADO')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    SELECT count(*) FILTER (WHERE funcao_no_voo = 'COMANDANTE'),
           count(*) FILTER (WHERE funcao_no_voo = 'COPILOTO'),
           count(*) FILTER (WHERE funcao_no_voo = 'COMISSARIO')
    INTO v_comandantes, v_copilotos, v_comissarios
    FROM tripulacao_voo WHERE numero_voo = NEW.numero_voo;

    IF v_comandantes < 1 OR v_copilotos < 1 OR v_comissarios < 2 THEN
      RAISE EXCEPTION 'Tripulação incompleta para programar voo % (mínimo: 1 comandante, 1 copiloto e 2 comissários)', NEW.numero_voo
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tripulacao_completa ON voo;
CREATE TRIGGER trigger_tripulacao_completa
BEFORE INSERT OR UPDATE OF status ON voo
FOR EACH ROW
EXECUTE FUNCTION verifica_tripulacao_completa();

CREATE OR REPLACE FUNCTION impede_remocao_tripulacao_minima()
RETURNS trigger AS $$
DECLARE
  v_status status_voo;
  v_comandantes integer;
  v_copilotos integer;
  v_comissarios integer;
BEGIN
  -- FOR SHARE serializa com uma mudança de status simultânea: se outro usuário
  -- estiver programando o voo, um dos dois espera e enxerga o resultado do outro.
  SELECT status INTO v_status FROM voo WHERE numero_voo = OLD.numero_voo FOR SHARE;
  IF v_status NOT IN ('PLANEJAMENTO', 'CANCELADO') THEN
    -- Conta a tripulação como ficará depois da remoção ou alteração da linha.
    SELECT count(*) FILTER (WHERE funcao = 'COMANDANTE'),
           count(*) FILTER (WHERE funcao = 'COPILOTO'),
           count(*) FILTER (WHERE funcao = 'COMISSARIO')
    INTO v_comandantes, v_copilotos, v_comissarios
    FROM (
      SELECT funcao_no_voo AS funcao FROM tripulacao_voo
      WHERE numero_voo = OLD.numero_voo AND cpf_tripulante <> OLD.cpf_tripulante
      UNION ALL
      SELECT NEW.funcao_no_voo
      WHERE TG_OP = 'UPDATE' AND NEW.numero_voo = OLD.numero_voo
    ) tripulacao;
    IF v_comandantes < 1 OR v_copilotos < 1 OR v_comissarios < 2 THEN
      RAISE EXCEPTION 'Reabra o voo para planejamento antes de remover a tripulação mínima'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_protege_tripulacao_minima ON tripulacao_voo;
CREATE TRIGGER trigger_protege_tripulacao_minima
BEFORE DELETE OR UPDATE ON tripulacao_voo
FOR EACH ROW
EXECUTE FUNCTION impede_remocao_tripulacao_minima();

CREATE OR REPLACE FUNCTION impede_reducao_aeronave_abaixo_assentos_vendidos()
RETURNS trigger AS $$
DECLARE
  v_maior_assento integer;
BEGIN
  IF NEW.quantidade_assentos < OLD.quantidade_assentos THEN
    SELECT max(p.numero_assento) INTO v_maior_assento
    FROM passagem p JOIN voo v ON v.numero_voo = p.numero_voo
    WHERE v.id_aeronave = OLD.identificacao AND p.status <> 'CANCELADA';
    IF v_maior_assento > NEW.quantidade_assentos THEN
      RAISE EXCEPTION 'A capacidade não pode ficar abaixo de um assento já vendido'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_capacidade_aeronave_vendida ON aeronave;
CREATE TRIGGER trigger_capacidade_aeronave_vendida
BEFORE UPDATE OF quantidade_assentos ON aeronave
FOR EACH ROW
EXECUTE FUNCTION impede_reducao_aeronave_abaixo_assentos_vendidos();
