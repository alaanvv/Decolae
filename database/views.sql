SET search_path TO decolae;

-- ============================================================================
-- 1. VIEWS ANALÍTICAS PARA RELATÓRIOS GERENCIAIS E DASHBOARD
-- ============================================================================

CREATE OR REPLACE VIEW vw_ocupacao_voos AS
SELECT
    v.numero_voo,
    v.status,
    t.cidade_origem,
    t.cidade_destino,
    v.previsao_partida,
    v.previsao_chegada,
    a.identificacao AS aeronave_id,
    a.modelo AS aeronave_modelo,
    a.quantidade_assentos AS capacidade_total,
    COUNT(p.numero_bilhete) FILTER (WHERE p.status <> 'CANCELADA') AS assentos_ocupados,
    (a.quantidade_assentos - COUNT(p.numero_bilhete) FILTER (WHERE p.status <> 'CANCELADA')) AS assentos_disponiveis,
    ROUND(
        (COUNT(p.numero_bilhete) FILTER (WHERE p.status <> 'CANCELADA')::numeric / a.quantidade_assentos) * 100,
        2
    ) AS taxa_ocupacao_percentual,
    COALESCE(SUM(p.preco) FILTER (WHERE p.status <> 'CANCELADA'), 0.00) AS receita_confirmada
FROM voo v
JOIN trajeto t ON t.id_trajeto = v.id_trajeto
JOIN aeronave a ON a.identificacao = v.id_aeronave
LEFT JOIN passagem p ON p.numero_voo = v.numero_voo
GROUP BY
    v.numero_voo,
    v.status,
    t.cidade_origem,
    t.cidade_destino,
    v.previsao_partida,
    v.previsao_chegada,
    a.identificacao,
    a.modelo,
    a.quantidade_assentos;

CREATE OR REPLACE VIEW vw_faturamento_trajeto AS
SELECT
    t.id_trajeto,
    t.cidade_origem,
    t.cidade_destino,
    COUNT(DISTINCT v.numero_voo) AS total_voos,
    COUNT(p.numero_bilhete) FILTER (WHERE p.status <> 'CANCELADA') AS total_passagens_ativas,
    COUNT(p.numero_bilhete) FILTER (WHERE p.status = 'CANCELADA') AS total_passagens_canceladas,
    COALESCE(SUM(p.preco) FILTER (WHERE p.status <> 'CANCELADA'), 0.00) AS faturamento_total
FROM trajeto t
LEFT JOIN voo v ON v.id_trajeto = t.id_trajeto
LEFT JOIN passagem p ON p.numero_voo = v.numero_voo
GROUP BY
    t.id_trajeto,
    t.cidade_origem,
    t.cidade_destino
ORDER BY faturamento_total DESC;

-- ============================================================================
-- 2. AUDITORIA AUTOMÁTICA DE ALTERAÇÕES EM VOOS (TRIGGER + JSONB)
-- ============================================================================

CREATE TABLE IF NOT EXISTS log_auditoria (
    id_log bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tabela_afetada varchar(30) NOT NULL,
    operacao varchar(10) NOT NULL,
    registro_id varchar(30) NOT NULL,
    status_anterior status_voo,
    status_novo status_voo,
    detalhes jsonb NOT NULL,
    registrado_em timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION registrar_auditoria_voo()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO log_auditoria (tabela_afetada, operacao, registro_id, status_novo, detalhes)
        VALUES (
            'VOO',
            'INSERT',
            NEW.numero_voo,
            NEW.status,
            jsonb_build_object(
                'previsao_partida', NEW.previsao_partida,
                'previsao_chegada', NEW.previsao_chegada,
                'id_aeronave', NEW.id_aeronave,
                'id_trajeto', NEW.id_trajeto
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status
           OR OLD.previsao_partida IS DISTINCT FROM NEW.previsao_partida
           OR OLD.previsao_chegada IS DISTINCT FROM NEW.previsao_chegada
           OR OLD.id_aeronave IS DISTINCT FROM NEW.id_aeronave THEN
            INSERT INTO log_auditoria (tabela_afetada, operacao, registro_id, status_anterior, status_novo, detalhes)
            VALUES (
                'VOO',
                'UPDATE',
                NEW.numero_voo,
                OLD.status,
                NEW.status,
                jsonb_build_object(
                    'partida_anterior', OLD.previsao_partida,
                    'partida_nova', NEW.previsao_partida,
                    'chegada_anterior', OLD.previsao_chegada,
                    'chegada_nova', NEW.previsao_chegada,
                    'aeronave_anterior', OLD.id_aeronave,
                    'aeronave_nova', NEW.id_aeronave
                )
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auditoria_voo ON voo;
CREATE TRIGGER trigger_auditoria_voo
AFTER INSERT OR UPDATE ON voo
FOR EACH ROW
EXECUTE FUNCTION registrar_auditoria_voo();

-- ============================================================================
-- 3. ÍNDICES DE PERFORMANCE PARA CONSULTAS FREQUENTES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_voo_trajeto_partida
    ON voo (id_trajeto, previsao_partida);

CREATE INDEX IF NOT EXISTS idx_passagem_cliente_status
    ON passagem (cpf_cliente, status);
