CREATE SEQUENCE IF NOT EXISTS decolae.numero_bilhete_seq START WITH 1;

ALTER TABLE decolae.passagem
  ALTER COLUMN numero_bilhete SET DEFAULT (
    'BIL' || lpad(nextval('decolae.numero_bilhete_seq')::text, 10, '0')
  );

CREATE UNIQUE INDEX IF NOT EXISTS passagem_assento_ativo_unico
  ON decolae.passagem (numero_voo, numero_assento)
  WHERE status <> 'CANCELADA';
