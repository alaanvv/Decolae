CREATE schema if NOT EXISTS decolae;

SET search_path TO decolae;

CREATE TYPE tipo_usuario AS ENUM (
    'GERENTE',
    'ADMINISTRADOR',
    'CLIENTE'
);

CREATE TYPE status_aeronave AS ENUM (
    'DISPONIVEL',
    'MANUTENCAO',
    'OPERANDO',
    'INATIVA'
);

CREATE TYPE status_voo AS ENUM (
    'PLANEJAMENTO',
    'PROGRAMADO',
    'ATRASADO',
    'EMBARQUE',
    'EM_ANDAMENTO',
    'CONCLUIDO',
    'CANCELADO'
);

CREATE TYPE status_passagem AS ENUM (
    'EMITIDA',
    'CANCELADA',
    'UTILIZADA'
);

CREATE TYPE funcao_tripulante AS ENUM (
    'COMANDANTE',
    'COPILOTO',
    'MECANICO',
    'COMISSARIO'
);

CREATE TABLE CLIENTE (
  cpf char(11) PRIMARY key,
  telefone varchar(20) NOT NULL
);

CREATE TABLE TRAJETO (
  id_trajeto int GENERATED ALWAYS AS IDENTITY PRIMARY key,
  cidade_origem varchar(20) NOT NULL,
  cidade_destino varchar(20) NOT NULL,
  CONSTRAINT check_destino_valido CHECK (cidade_origem <> cidade_destino)
);

CREATE TABLE AERONAVE (
  identificacao char(6) PRIMARY key,
  modelo varchar(20) NOT NULL,
  quantidade_assentos int NOT NULL,
  status status_aeronave NOT NULL DEFAULT 'DISPONIVEL',
  CONSTRAINT check_quantidade_assentos CHECK (quantidade_assentos > 0)
);

CREATE TABLE TRIPULANTE (
  cpf char(11) PRIMARY key,
  nome varchar(50) NOT NULL
);

CREATE TABLE USUARIO (
  email varchar(50) PRIMARY key,
  nome varchar(50) NOT NULL,
  senha varchar(50) NOT NULL,
  tipo tipo_usuario NOT NULL,
  cpf_cliente char(11),
  UNIQUE (cpf_cliente),
  FOREIGN key (cpf_cliente) REFERENCES CLIENTE (cpf),
  CONSTRAINT check_tipo_usuario_valido CHECK (
    (
      tipo = 'CLIENTE'
      AND cpf_cliente IS NOT NULL
    )
    OR (
      tipo <> 'CLIENTE'
      AND cpf_cliente IS NULL
    )
  )
);

CREATE TABLE VOO (
  numero_voo varchar(10) PRIMARY key,
  status status_voo NOT NULL,
  previsao_partida timestamptz NOT NULL,
  previsao_chegada timestamptz NOT NULL,
  id_trajeto int NOT NULL,
  id_aeronave char(6) NOT NULL,
  FOREIGN key (id_trajeto) REFERENCES TRAJETO (id_trajeto),
  FOREIGN key (id_aeronave) REFERENCES AERONAVE (identificacao),
  CONSTRAINT check_data_valida CHECK (previsao_partida < previsao_chegada)
);

CREATE TABLE PASSAGEM (
  numero_bilhete char(13) PRIMARY key,
  numero_assento int NOT NULL,
  data_compra date NOT NULL,
  preco numeric(10, 2) NOT NULL,
  status status_passagem NOT NULL,
  numero_voo varchar(10) NOT NULL,
  cpf_cliente char(11) NOT NULL,
  UNIQUE (numero_voo, numero_assento),
  FOREIGN key (numero_voo) REFERENCES VOO (numero_voo),
  FOREIGN key (cpf_cliente) REFERENCES CLIENTE (cpf),
  CONSTRAINT check_preco CHECK (preco > 0)
);

CREATE TABLE TRIPULACAO_VOO (
  numero_voo varchar(10) NOT NULL,
  cpf_tripulante char(11) NOT NULL,
  funcao_no_voo funcao_tripulante NOT NULL,
  PRIMARY key (numero_voo, cpf_tripulante),
  FOREIGN key (numero_voo) REFERENCES VOO (numero_voo),
  FOREIGN key (cpf_tripulante) REFERENCES TRIPULANTE (cpf)
);
