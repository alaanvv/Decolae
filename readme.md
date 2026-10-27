# Decolaê

A decolaê é uma empresa de voos domésticos, que deseja organizar melhor seus processos internos.

- [Levantamento de requisitos](docs/requisitos.md)
- [Evolução](docs/evolucao.md)
- [Inicializar o banco de dados](docs/guia-banco-de-dados.md)
- [Rodar API](docs/guia-api.md)

---

## TODO

- [x] Diagrama de entidade relacionamento
- [x] Modelo relacional
- [x] Responder ressalvas da primeira entrega
- [x] Criar banco de dados
  - [x] Documentar inicialização
  - [x] Criar scripts auxiliares em `bash`
  - [x] Popular banco
- [x] Criar API
- [ ] Criar protótipo da interface
  - [ ] Tela de login que funciona pra todo tipo de usuário  
        Ainda não tem sistema de token de autenticação nem segurança nas rotas, então o login é só usar a rota `/login` e usar o tipo de usuário retornado pra redirecionar
  - [ ] Dashboard de administrador
    - [ ] Visualizar lista de voos
    - [ ] Criar voo
  - [ ] Dashboard de gerente
    - [ ] Aba "Trajetos"
      - [ ] Visualizar
      - [ ] Criar
    - [ ] Aba "Aeronaves"
      - [ ] Visualizar
      - [ ] Criar
    - [ ] Aba "Tripulantes"
      - [ ] Visualizar
      - [ ] Criar
  - [ ] Dashboard de cliente
    - [ ] Visualizar lista de voos
