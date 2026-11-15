SET search_path TO decolae;

DROP TRIGGER IF EXISTS trigger_aeronave_disponivel ON voo;
DROP FUNCTION IF EXISTS verifica_aeronave_disponivel();

ALTER TABLE aeronave DROP COLUMN IF EXISTS status;
DROP TYPE IF EXISTS status_aeronave;
