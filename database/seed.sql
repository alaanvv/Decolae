SET search_path TO decolae;

-- =========================================
-- 1. CLIENTES
-- =========================================

INSERT INTO CLIENTE (cpf, telefone) VALUES
('11111111111', '(32) 99911-1111'),
('22222222222', '(32) 99922-2222'),
('33333333333', '(32) 99933-3333'),
('44444444444', '(32) 99944-4444');

-- =========================================
-- 2. USUARIOS
-- =========================================

INSERT INTO USUARIO
(email, nome, senha, tipo, cpf_cliente) VALUES
('gerente@decolae.com', 'Carlos Mendes', 'senha123',
 'GERENTE', NULL),
('admin@decolae.com', 'Ana Souza', 'senha123',
 'ADMINISTRADOR', NULL),
('joao@email.com', 'Joao Silva', 'senha123',
 'CLIENTE', '11111111111'),
('maria@email.com', 'Maria Santos', 'senha123',
 'CLIENTE', '22222222222'),
('pedro@email.com', 'Pedro Oliveira', 'senha123',
 'CLIENTE', '33333333333'),
('lucia@email.com', 'Lucia Costa', 'senha123',
 'CLIENTE', '44444444444');

-- =========================================
-- 3. TRAJETOS
-- =========================================

INSERT INTO TRAJETO
(id_trajeto, cidade_origem, cidade_destino) VALUES
(1, 'Sao Paulo', 'Rio de Janeiro'),
(2, 'Belo Horizonte', 'Brasilia'),
(3, 'Rio de Janeiro', 'Salvador'),
(4, 'Brasilia', 'Sao Paulo');

-- =========================================
-- 4. AERONAVES
-- =========================================

INSERT INTO AERONAVE
(identificacao, modelo, quantidade_assentos, status) VALUES
('PT-ABC', 'Boeing 737', 180, 'DISPONIVEL'),
('PT-DEF', 'Airbus A320', 150, 'DISPONIVEL'),
('PT-GHI', 'Embraer E195', 120, 'MANUTENCAO'),
('PT-JKL', 'ATR 72', 70, 'INATIVA');

-- =========================================
-- 5. TRIPULANTES
-- =========================================

INSERT INTO TRIPULANTE (cpf, nome) VALUES
('55555555555', 'Roberto Almeida'),
('66666666666', 'Fernanda Lima'),
('77777777777', 'Marcos Pereira'),
('88888888888', 'Juliana Rocha'),
('99999999999', 'Ricardo Martins'),
('10101010101', 'Beatriz Ferreira'),
('12121212121', 'Felipe Ribeiro'),
('13131313131', 'Camila Alves');

-- =========================================
-- 6. VOOS
-- Inseridos inicialmente em PLANEJAMENTO.
-- Depois da alocacao da tripulacao, os voos
-- poderao ser programados.
-- =========================================

INSERT INTO VOO
(numero_voo, status, previsao_partida, previsao_chegada,
 id_trajeto, id_aeronave) VALUES
('DL1001', 'PLANEJAMENTO',
 '2026-11-10 09:00:00-03',
 '2026-11-10 10:10:00-03', 1, 'PT-ABC'),

('DL1002', 'PLANEJAMENTO',
 '2026-11-10 14:00:00-03',
 '2026-11-10 15:20:00-03', 2, 'PT-DEF'),

('DL1003', 'PLANEJAMENTO',
 '2026-11-11 08:00:00-03',
 '2026-11-11 10:00:00-03', 3, 'PT-ABC'),

('DL1004', 'PLANEJAMENTO',
 '2026-11-12 16:00:00-03',
 '2026-11-12 17:30:00-03', 4, 'PT-DEF');

-- =========================================
-- 7. TRIPULACAO DOS VOOS
-- Cada voo programado tera:
-- 1 comandante, 1 copiloto e 2 comissarios.
-- =========================================

INSERT INTO TRIPULACAO_VOO
(numero_voo, cpf_tripulante, funcao_no_voo) VALUES
('DL1001', '55555555555', 'COMANDANTE'),
('DL1001', '66666666666', 'COPILOTO'),
('DL1001', '77777777777', 'COMISSARIO'),
('DL1001', '88888888888', 'COMISSARIO'),

('DL1002', '99999999999', 'COMANDANTE'),
('DL1002', '10101010101', 'COPILOTO'),
('DL1002', '12121212121', 'COMISSARIO'),
('DL1002', '13131313131', 'COMISSARIO'),

('DL1003', '55555555555', 'COMANDANTE'),
('DL1003', '66666666666', 'COPILOTO'),
('DL1003', '77777777777', 'COMISSARIO'),
('DL1003', '88888888888', 'COMISSARIO');

-- =========================================
-- 8. PROGRAMAR OS VOOS
-- A trigger verificara a tripulacao.
-- =========================================

UPDATE VOO
SET status = 'PROGRAMADO'
WHERE numero_voo IN ('DL1001', 'DL1002', 'DL1003');

-- DL1004 permanece em PLANEJAMENTO.

-- =========================================
-- 9. PASSAGENS
-- Os voos ja estao PROGRAMADOS.
-- =========================================

INSERT INTO PASSAGEM
(numero_bilhete, numero_assento, data_compra,
 preco, status, numero_voo, cpf_cliente) VALUES
('BILHETE000001', 1, '2026-10-20',
 450.00, 'EMITIDA', 'DL1001', '11111111111'),

('BILHETE000002', 2, '2026-10-21',
 450.00, 'EMITIDA', 'DL1001', '22222222222'),

('BILHETE000003', 3, '2026-10-22',
 520.00, 'EMITIDA', 'DL1001', '33333333333'),

('BILHETE000004', 1, '2026-10-22',
 380.00, 'EMITIDA', 'DL1002', '44444444444'),

('BILHETE000005', 2, '2026-10-22',
 380.00, 'CANCELADA', 'DL1002', '11111111111'),

('BILHETE000006', 10, '2026-10-23',
 600.00, 'EMITIDA', 'DL1003', '22222222222');
