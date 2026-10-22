set search_path to decolae;


-- VERIFICA CONDIÇÕES PARA MARCAR UMA PASSAGEM
create or replace function verifica_disponibilidade_voo()
returns trigger as $$
declare
	v_capacidade int;
	v_ocupados int;
begin
	-- checa se o voo ainda pode emitir passagens
	if exists (
		select 1
		from VOO
		where numero_voo = new.numero_voo and status not in ('PROGRAMADO', 'ATRASADO')
	)then
		raise exception 'nao e possivel emitir passagens para voos nesse status';
	end if;
	
	-- checa se o assento esta vazio
	if exists (
		select 1
		from PASSAGEM
		where numero_voo = new.numero_voo and numero_assento = new.numero_assento and status <> 'CANCELADA' and numero_bilhete <> new.numero_bilhete
	) then
		raise exception 'o assento % ja esta ocupado', new.numero_assento;
	end if;
	
	-- pega a quantidade de assentos da aeronave escalada para aquele voo
	select A.quantidade_assentos
	into v_capacidade
	from VOO V join AERONAVE A on V.id_aeronave = A.identificacao
	where V.numero_voo = new.numero_voo;
	
	-- conta as passagens validas excluindo a nova passagem
	select count (*)
	into v_ocupados
	from PASSAGEM
	where numero_voo = new.numero_voo and status = 'EMITIDA' and numero_bilhete <> new.numero_bilhete;
	
	-- verifica se voo esta lotado
	if v_ocupados >= v_capacidade then
		raise exception 'voo lotado';
	end if;
	
	-- verifica se o numero do assento e valido
	if new.numero_assento < 1 or new.numero_assento > v_capacidade then
		raise exception 'Numero de assento invalido';
	end if;

	return new;
end;
$$ language plpgsql;


create trigger trigger_disponibilidade_voo
before insert or update on PASSAGEM
for each row
when (new.status = 'EMITIDA')
execute function verifica_disponibilidade_voo();

-- VERIFICA SE UMA AERONAVE ESTA EM MANUTENCAO PRA COMPRAR UMA PASSAGEM
create or replace function verifica_aeronave_disponivel()
returns trigger as $$
begin
	if exists (
		select 1
		from AERONAVE
		where identificacao = new.id_aeronave and status in ('MANUTENCAO', 'INATIVA')
	) then
		raise exception 'Aeronave inativa ou em manutencao';
	end if;

	return new;
end;
$$ language plpgsql;

create trigger trigger_aeronave_disponivel
before insert or update on VOO
for each row
execute function verifica_aeronave_disponivel();

-- GARANTE QUE UM VOO PROGRAMADO TENHA PELO MENOS 1 COMANDANTE, 1 COPILOTO e 2 COMISSARIOS
create or replace function verifica_tripulacao_completa()
returns trigger as $$
begin
	if new.status = 'PROGRAMADO'
		and old.status is distinct from new.status
	then
		if(
			select count (*)
			from TRIPULACAO_VOO
			where numero_voo = new.numero_voo
			and funcao_no_voo = 'COPILOTO'
		) < 1
		or (
			select count (*)
			from TRIPULACAO_VOO
			where numero_voo = new.numero_voo
			and funcao_no_voo = 'COMANDANTE'
		) < 1
		or (
			select count (*)
			from TRIPULACAO_VOO
			where numero_voo = new.numero_voo
			and funcao_no_voo = 'COMISSARIO'
		) < 2
		then
			raise exception 'tripulacao incompleta para programar voo %',
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


