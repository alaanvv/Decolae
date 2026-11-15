[__Voltar__](../readme.md)

# Ininicialização/Uso da API

Execute os comandos na raiz do projeto (`Decolae`).

Copie `api/.env.example` para `api/.env` e configure a conexão com o PostgreSQL. O servidor carrega esse arquivo mesmo quando iniciado a partir da raiz do projeto.
Defina também um valor aleatório e privado para `SESSION_SECRET`. Para bancos criados antes da autenticação com senha protegida, aplique `psql -d decolae -f database/migrations/001_auth.sql` uma vez. Senhas antigas do seed são convertidas para hash no primeiro login.
O preço de venda é definido no servidor por `TICKET_PRICE` (padrão `450.00`). Para bancos existentes, aplique as migrações em ordem: `001_auth.sql`, `002_passagens.sql`, `003_operational_rules.sql` e `004_derived_aircraft_status.sql`. Novos bancos recebem schema e regras atuais por `database/schema.sql` e `database/triggers.sql`.
Pra mim o usuário do banco de dados padrão é `postgres` com a senha sendo a senha do meu usuário do *linux*

1. Na raiz do projeto, instale as dependências: `npm install`.
2. Inicie o sistema: `npm start`. Esse comando compila a interface e sobe o servidor que atende a interface e a API em `http://127.0.0.1:3000`.

As rotas da API usam o prefixo `/api` (por exemplo, `/api/voos` e `/api/auth/login`).
