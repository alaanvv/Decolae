CREATE SEQUENCE IF NOT EXISTS decolae.numero_bilhete_seq START WITH 1;

SELECT setval(
  'decolae.numero_bilhete_seq',
  coalesce(max(substring(numero_bilhete::text FROM '^BIL([0-9]+)$')::bigint), 0) + 1,
  false
)
FROM decolae.passagem;

ALTER TABLE decolae.passagem
  ALTER COLUMN numero_bilhete SET DEFAULT (
    'BIL' || lpad(nextval('decolae.numero_bilhete_seq')::text, 10, '0')
  );

-- Remove a restrição antiga que também bloqueava reutilizar assentos cancelados.
ALTER TABLE decolae.passagem
  DROP CONSTRAINT IF EXISTS uq_passagem_assento_voo;
DROP INDEX IF EXISTS decolae.uq_passagem_assento_voo;

CREATE UNIQUE INDEX IF NOT EXISTS passagem_assento_ativo_unico
  ON decolae.passagem (numero_voo, numero_assento)
  WHERE status <> 'CANCELADA';
