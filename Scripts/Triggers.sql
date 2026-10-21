-- VERIFICA SE EXISTEM ASENTOS DISPONIVEIS NA AERONAVE PARA MARCAR UMA PASSAGEM
create or replace function verifica_disponibilidade_voo()
returns trigger as $$
begin 
	if exists (
		select 1
		from VOO
		where numero_voo = new.numero_voo and status not in('PROGRAMADO', 'ATRASADO')
	) then 
		raise exception 'Não é possivel emitir passagem para voos com esses status';
	end if;
	
	select A.quantidade_assento
	
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
execute function verifica_tripulacao_completa()


