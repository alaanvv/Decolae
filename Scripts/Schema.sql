create schema if not exists decolae;
set search_path to decolae;

create table CLIENTE (
	cpf						char(11)		primary key,
	telefone				varchar(20)		not null
);

create table TRAJETO (
	id_trajeto				int				primary key,
	cidade_origem			varchar(20)		not null,
	cidade_destino			varchar(20)		not null
);

create table AERONAVE (
	identificacao			char(6)			primary key,
	modelo					varchar(20)		not null,
	quantidade_assentos		int				not null check (quantidade_assentos > 0),
	status					varchar(10)		not null,
	constraint check_status_aeronave
		check (status in (
			'DISPONIVEL',
		    'MANUTENCAO',
		    'OPERANDO',
		    'INATIVA'
		))
);

create table TRIPULANTE (
	cpf						char(11)		primary key,
	nome					varchar(50)		not null
);



create table USUARIO (
	email					varchar(50)		primary key,
	nome					varchar(50)		not null,
	senha					varchar(50)		not null,
	tipo					varchar(13)		not null,
	cpf_cliente				char(11),
	unique (cpf_cliente),
	foreign key (cpf_cliente) 	references CLIENTE (cpf),
	constraint check_tipo_usuario
		check  (tipo in (
			'GERENTE',
			'ADMINISTRADOR',
			'CLIENTE'
		))
);

create table VOO (
	numero_voo				varchar(10)		primary key,
	status					varchar(12)		not null,
	previsao_partida		timestamptz		not null,
	previsao_chegada		timestamptz		not null,
	id_trajeto				int				not null,
	id_aeronave				char(6)			not null,
	foreign key (id_trajeto) 	references TRAJETO (id_trajeto),
	foreign key (id_aeronave)	references AERONAVE (identificacao),
	constraint check_status_voo
		check (status in (
			'PROGRAMADO',
		    'ATRASADO',
		    'EMBARQUE',
		    'EM_ANDAMENTO',
		    'CONCLUIDO',
		    'CANCELADO'
		)),
	constraint check_data_valida
		check (previsao_partida < previsao_chegada)
);

create table PASSAGEM (
	numero_bilhete 			char(13)		primary key,
	numero_assento			int				not null,
	data_compra				date 			not null,
	preco					numeric(10,2)	not null check (preco > 0),
	status					varchar(9)		not null,
	numero_voo				varchar(10)		not null,
	cpf_cliente				char(11)		not null,
	unique (numero_voo, numero_assento),
	foreign key (numero_voo) references VOO (numero_voo),
	foreign key (cpf_cliente) references CLIENTE (cpf),
	constraint check_status_passagem
		check (status in (
		    'EMITIDA',
		    'CANCELADA',
		    'UTILIZADA'
		))
);

create table TRIPULACAO_VOO (
	numero_voo				varchar(10)		not null,
	cpf_tripulante			char(11)		not null,
	funcao_no_voo			varchar(10)		not null,
	primary key(numero_voo, cpf_tripulante),
	foreign key (numero_voo) references VOO (numero_voo),
	foreign key (cpf_tripulante) references TRIPULANTE (cpf),
	constraint check_funcao_no_voo
		check (funcao_no_voo in (
		    'COMANDANTE',
		    'COPILOTO',
		    'MECANICO',
		    'COMISSARIO'
		))
);

