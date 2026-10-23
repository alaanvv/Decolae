set search_path to decolae;

-- Verifica condições para marcar uma passagem
create or replace function verifica_disponibilidade_voo()
returns trigger as $$
declare
  v_capacidade int;
  v_ocupados int;
begin
  -- Checa se o voo ainda pode emitir passagens
  if exists (
    select 1
    from VOO
    where numero_voo = new.numero_voo and status not in ('PROGRAMADO', 'ATRASADO')
  ) then
    raise exception 'Não é possível emitir passagens para voos nesse status';
  end if;
  
  -- Checa se o assento esta vazio
  if exists (
    select 1
    from PASSAGEM
    where numero_voo = new.numero_voo and numero_assento = new.numero_assento and status <> 'CANCELADA' and numero_bilhete <> new.numero_bilhete
  ) then
    raise exception 'O assento % ja esta ocupado', new.numero_assento;
  end if;
  
  -- Pega a quantidade de assentos da aeronave escalada para aquele voo
  select A.quantidade_assentos
  into v_capacidade
  from VOO V join AERONAVE A on V.id_aeronave = A.identificacao
  where V.numero_voo = new.numero_voo;
  
  -- Conta as passagens válidas excluindo a nova passagem
  select count(*)
  into v_ocupados
  from PASSAGEM
  where numero_voo = new.numero_voo and status = 'EMITIDA' and numero_bilhete <> new.numero_bilhete;
  
  -- Verifica se voo está lotado
  if v_ocupados >= v_capacidade then
    raise exception 'Voo lotado';
  end if;
  
  -- Verifica se o numero do assento e válido
  if new.numero_assento < 1 or new.numero_assento > v_capacidade then
    raise exception 'Número de assento inválido';
  end if;

  return new;
end;

$$ language plpgsql;

create trigger trigger_disponibilidade_voo
before insert or update on PASSAGEM
for each row
when (new.status = 'EMITIDA')
execute function verifica_disponibilidade_voo();

-- Verifica se uma aeronave está em manutenção pra comprar uma passagem
create or replace function verifica_aeronave_disponivel()
returns trigger as $$
begin
  if exists (
    select 1
    from AERONAVE
    where identificacao = new.id_aeronave and status in ('MANUTENCAO', 'INATIVA')
  ) then
    raise exception 'Aeronave inativa ou em manutenção';
  end if;

  return new;
end;

$$ language plpgsql;

create trigger trigger_aeronave_disponivel
before insert or update on VOO
for each row
execute function verifica_aeronave_disponivel();

-- Garante que um voo programado tenha pelo menos 1 comandante, 1 copiloto e 2 comissários
create or replace function verifica_tripulacao_completa()
returns trigger as $$
begin
  if new.status = 'PROGRAMADO'
    and old.status is distinct from new.status
  then
    if (
      select count(*)
      from TRIPULACAO_VOO
      where numero_voo = new.numero_voo
      and funcao_no_voo = 'COPILOTO'
    ) < 1
    or (
      select count(*)
      from TRIPULACAO_VOO
      where numero_voo = new.numero_voo
      and funcao_no_voo = 'COMANDANTE'
    ) < 1
    or (
      select count(*)
      from TRIPULACAO_VOO
      where numero_voo = new.numero_voo
      and funcao_no_voo = 'COMISSARIO'
    ) < 2
    then
      raise exception 'Tripulação incompleta para programar voo %',
      new.numero_voo;
    end if;
  end if;
  return new;
END;

$$ language plpgsql;

create trigger trigger_tripulacao_completa
before update of status on VOO
for each row
execute function verifica_tripulacao_completa();
