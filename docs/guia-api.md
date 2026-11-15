[__Voltar__](../readme.md)

# Ininicialização/Uso da API

Execute os comandos na raiz do projeto (`Decolae`).

Copie `api/.env.example` para `api/.env` e configure a conexão com o PostgreSQL. O servidor carrega esse arquivo mesmo quando iniciado a partir da raiz do projeto.
Pra mim o usuário do banco de dados padrão é `postgres` com a senha sendo a senha do meu usuário do *linux*

1. Instale as dependências dos dois módulos: `npm install`
2. Inicie a interface e a API em modo de desenvolvimento: `npm run dev` e, em outro terminal, `npm start --workspace api`
3. Para gerar a interface e iniciar tudo em um único servidor: `npm start`

No modo integrado, a interface e a API ficam disponíveis em `http://127.0.0.1:3000`. As rotas da API usam o prefixo `/api` (por exemplo, `/api/voos` e `/api/auth/login`).
