# Decolaê — Relatório de Evolução e Implementação do Banco de Dados

**Segunda entrega — TP Opção 1**

**Integrantes:** Alan Vale

Esse relatório apresenta a evolução da modelagem conceitual, a estrutura do banco de dados, o povoamento inicial e o protótipo da interface.

---

# Evolução da modelagem

## Modelagem inicial

Pra primeira entrega do trabalho fizemos um levantamento dos requisitos do sistema, um modelo entidade-relacionamento e o mapeamento para o modelo relacional.

![DER](diagramas/DER_INICIAL.drawio.png)

## Discussão entre os grupos

Durante as discussões sobre o trabalho foram levantados dois pontos:

1. Cardinalidades incorreta

A cardinalidade do relacionamento entre passagens e voos indicava que uma passagem podia ser referente a mais de um voo, o que não foi intencional e foi corrigido.

2. Falta de representação de responsabilidades

Foi sugerido que criasse especializações do tipo entidade "Usuário" para representar os diferentes tipos de usuário dentro do sistema, e então com essas especializações criasse relações como por exemplo: "administrador -> cria -> voo", "gerente -> cadastra -> trajeto".
Escolhemos não aderir a essa sugestão.  
Achamos que isso não precisava ser representado nesse diagrama pois parece mais ser parte da implementação, e não tanto do domínio de dados.  

Por fora das sugestões, removemos alguns IDs que estavam servindo de chave onde outros atributos poderiam ser a chave, por exemplo, o cliente possuía `cliente_id`, enquanto o `cpf` já bastava como chave primária.  
Também foi notado que a modelagem permitia o reaproveitamento de trajetos, porém as datas de partida e chegada do voo ficavam no próprio trajeto, dificultando o reuso. Foi ajustado pra que essas datas pertençam ao voo.

## Modelo atualizado

Após as revisões, o diagrama entidade-relacionamento foi atualizado incorporando os ajustes considerados adequados pelo grupo.

![DER](diagramas/DER_AJUSTES.drawio.png)

---

# Implementação do banco de dados

O banco de dados foi implementado utilizando **PostgreSQL**.

A implementação usa definição de tipos, chaves primárias, chaves estrangeiras, restrições de integridade e *triggers* pra garantir determinadas regras de negócio.

## Tabelas

O banco de dados contém oito tabelas principais.

| Tabela | Finalidade |
|---|---|
| `cliente` | Armazena os dados de identificação e contato dos clientes. |
| `usuario` | Armazena as credenciais, os nomes e os tipos de usuário. |
| `trajeto` | Representa as ligações entre cidades de origem e destino. |
| `aeronave` | Registra os modelos, as identificações, as capacidades e os status das aeronaves. |
| `tripulante` | Armazena os dados dos profissionais da tripulação. |
| `voo` | Registra os voos, seus horários, status, trajetos e aeronaves. |
| `passagem` | Representa as passagens emitidas, seus assentos, preços, clientes e voos. |
| `tripulacao_voo` | Associa os tripulantes aos voos e registra suas funções em cada operação. |

A separação entre usuário e cliente permite distinguir as informações de autenticação das informações relacionadas à identificação do cliente.  
Um usuário do tipo cliente deve estar associado a um registro em `cliente`.

A tabela `tripulacao_voo` representa o relacionamento `n:m` entre voos e tripulantes, armazenando a função do tripulante no voo.

## Chaves e integridade referencial

- A identificação da aeronave é única.
- O CPF identifica um cliente e um tripulante.
- O e-mail identifica um usuário.
- Cada voo possui um número único.
- Cada passagem possui um número de bilhete único.
- Cada passagem está associada a um voo e a um cliente existentes.
- Cada voo está associado a um trajeto e a uma aeronave existentes.
- Cada registro de tripulação está associado a um voo e a um tripulante existentes.
- Um mesmo tripulante não pode aparecer duas vezes na tabela associativa para o mesmo voo.

O identificador de trajeto é gerado automaticamente pelo PostgreSQL por meio de uma coluna `IDENTITY`.

## Regras de negócio implementadas

Parte das regras do sistema foi implementada diretamente no PostgreSQL por meio de funções e triggers. Essa abordagem permite centralizar determinadas validações no banco, evitando que elas dependam exclusivamente do comportamento da interface.
Talvez isso não seja o ideal para essas situações por questões de otimização, mas escolhemos implementar pra dar um foco maior no banco de dados, por ser o assunto da disciplina.

Embora parte das validações já esteja implementada, algumas regras previstas no levantamento de requisitos ainda precisam de mecanismos específicos.

| Regra | Situação |
|---|---|
| Impedir a emissão de passagens acima da capacidade | Possui validação por trigger. |
| Evitar a ocupação duplicada de assentos | Possui validação e restrição de unicidade; o tratamento de assentos liberados por cancelamento precisa ser ajustado. |
| Impedir emissão em estados inadequados do voo | Possui validação por trigger. |
| Impedir associação de voos a aeronaves em manutenção ou inativas | Possui validação por trigger. |
| Exigir tripulação mínima ao programar um voo | Possui validação por trigger na mudança de status. |
| Impedir sobreposição de horários para a mesma aeronave | Pendente. |
| Impedir escalas incompatíveis para um tripulante | Pendente. |
| Garantir o descanso mínimo de 36 horas após o limite de trabalho previsto | Pendente. |
| Impedir a compra de passagens para voos com horários incompatíveis para o cliente | Pendente. |
| Garantir a consistência das compras em transações concorrentes | Necessita de aprimoramento. |

A identificação dessas pendências orienta os próximos passos de desenvolvimento. Em particular, as validações de concorrência devem considerar que operações simultâneas podem consultar o mesmo estado do banco antes de efetuar alterações.

# Povoamento do banco de dados

## Estratégia de povoamento

Para permitir a demonstração das funcionalidades, foi elaborado um script SQL de povoamento inicial, denominado *seed*.

O script insere dados fictícios relacionados aos diferentes tipos de usuários, trajetos, aeronaves, tripulantes, voos e passagens.

O conjunto de dados planejado para o povoamento contém os seguintes registros:

| Tabela | Quantidade de registros planejada |
|---|---:|
| `CLIENTE` | 4 |
| `USUARIO` | 6 |
| `TRAJETO` | 4 |
| `AERONAVE` | 4 |
| `TRIPULANTE` | 8 |
| `VOO` | 4 |
| `TRIPULACAO_VOO` | 12 |
| `PASSAGEM` | 6 |

Essas quantidades correspondem aos registros presentes no script de povoamento. A confirmação da carga completa depende da execução bem-sucedida do script no banco de dados.

Os dados incluem aeronaves disponíveis, em manutenção e inativas, permitindo preparar cenários para a verificação das regras de disponibilidade.

Foram definidos quatro voos, dos quais três são destinados ao status `PROGRAMADO` e um permanece em `PLANEJAMENTO`. O último cenário permite representar um voo que ainda não está pronto para a emissão de passagens.

Também foram inseridas passagens com status `EMITIDA` e `CANCELADA`, permitindo diferenciar compras válidas de registros cancelados.

DAQUI PRA BAIXO EU NAO REVISEI NADA AINDA

## 6.3. Consultas para demonstração

Para demonstrar o funcionamento do banco, podem ser utilizadas consultas que recuperam informações relevantes para os diferentes perfis de usuário.

### 6.3.1. Listagem de voos com trajeto e aeronave

```sql
SET search_path TO decolae;

SELECT
    V.numero_voo,
    T.cidade_origem,
    T.cidade_destino,
    V.previsao_partida,
    V.previsao_chegada,
    A.modelo,
    A.quantidade_assentos,
    V.status
FROM VOO V
JOIN TRAJETO T ON T.id_trajeto = V.id_trajeto
JOIN AERONAVE A ON A.identificacao = V.id_aeronave
ORDER BY V.previsao_partida;
```

Essa consulta reúne informações de diferentes tabelas para apresentar os dados necessários à visualização dos voos.

### 6.3.2. Consulta de assentos disponíveis

```sql
SELECT
    V.numero_voo,
    A.quantidade_assentos,
    COUNT(P.numero_bilhete) FILTER (
        WHERE P.status = 'EMITIDA'
    ) AS passagens_emitidas,
    A.quantidade_assentos
        - COUNT(P.numero_bilhete) FILTER (
            WHERE P.status = 'EMITIDA'
        ) AS assentos_disponiveis
FROM VOO V
JOIN AERONAVE A
    ON A.identificacao = V.id_aeronave
LEFT JOIN PASSAGEM P
    ON P.numero_voo = V.numero_voo
GROUP BY
    V.numero_voo,
    A.quantidade_assentos
ORDER BY V.numero_voo;
```

Essa consulta calcula a quantidade de assentos disponíveis considerando a capacidade da aeronave e as passagens atualmente emitidas.

### 6.3.3. Consulta de tripulantes escalados

```sql
SELECT
    TV.numero_voo,
    T.nome,
    TV.funcao_no_voo
FROM TRIPULACAO_VOO TV
JOIN TRIPULANTE T
    ON T.cpf = TV.cpf_tripulante
ORDER BY
    TV.numero_voo,
    TV.funcao_no_voo;
```

Essa consulta permite verificar a composição da tripulação de cada voo e a função atribuída a cada profissional.

### 6.3.4. Consulta de passagens por cliente

```sql
SELECT
    P.numero_bilhete,
    P.numero_assento,
    P.data_compra,
    P.preco,
    P.status,
    P.numero_voo,
    U.nome AS nome_cliente
FROM PASSAGEM P
JOIN CLIENTE C
    ON C.cpf = P.cpf_cliente
JOIN USUARIO U
    ON U.cpf_cliente = C.cpf
ORDER BY
    U.nome,
    P.data_compra;
```

Essa consulta demonstra como recuperar as passagens associadas aos clientes e identificar as informações da compra.

**Observação:** os resultados dessas consultas devem ser inseridos no relatório após a execução no banco. As consultas apresentadas são exemplos de demonstração e não constituem, por si só, evidência de que todos os testes foram executados.

# 7. Protótipo da interface

O protótipo da aplicação foi organizado de acordo com os três perfis de usuário do sistema. O acesso ocorre por uma tela de login, e o tipo de usuário autenticado determina qual painel será apresentado.

As telas a seguir devem ser ilustradas com capturas de tela do protótipo desenvolvido pelo grupo.

## 7.1. Tela de login

A tela inicial permite que o usuário informe suas credenciais. Após a autenticação, a aplicação identifica o tipo de usuário e redireciona para o painel correspondente.

**Figura 3 — Tela de login**

[Inserir captura de tela da tela de login]

## 7.2. Painel do cliente

O cliente é direcionado para uma interface que permite consultar os voos disponíveis, aplicar filtros à listagem e acessar a área de suas reservas.

A listagem de voos permite reunir as informações necessárias para que o cliente encontre uma opção compatível com sua necessidade. A área de reservas permite consultar as passagens associadas à sua conta.

**Figura 4 — Listagem e filtragem de voos**

[Inserir captura de tela da listagem de voos e dos filtros]

**Figura 5 — Minhas reservas**

[Inserir captura de tela da área de reservas do cliente]

## 7.3. Painel do administrador

O administrador é direcionado para uma interface que apresenta a listagem de voos e disponibiliza uma ação para criar novos voos.

Essa organização concentra as operações de gerenciamento dos voos em um único painel, facilitando a consulta dos registros existentes e o acesso ao processo de criação.

**Figura 6 — Painel do administrador**

[Inserir captura de tela da listagem de voos e do botão de criação]

**Figura 7 — Cadastro de voo**

[Inserir captura de tela do formulário de criação de voo, caso já esteja implementado]

## 7.4. Painel do gerente

O painel do gerente possui três abas, destinadas ao gerenciamento de trajetos, aeronaves e tripulantes.

Cada aba apresenta uma listagem dos registros correspondentes e disponibiliza operações de cadastro. A organização por abas separa os diferentes conjuntos de informações e permite acessar diretamente a categoria desejada.

**Figura 8 — Aba de trajetos**

[Inserir captura de tela da listagem e do cadastro de trajetos]

**Figura 9 — Aba de aeronaves**

[Inserir captura de tela da listagem e do cadastro de aeronaves]

**Figura 10 — Aba de tripulantes**

[Inserir captura de tela da listagem e do cadastro de tripulantes]

## 7.5. Organização e integração da interface

A divisão da interface por perfil busca manter as operações de cada tipo de usuário organizadas de acordo com suas responsabilidades.

O cliente concentra suas atividades na consulta de voos e no acompanhamento de reservas. O administrador dispõe das operações relacionadas à criação de voos. O gerente acessa os cadastros utilizados como base para o funcionamento do sistema.

A integração com o banco de dados deve garantir que as operações realizadas pela interface respeitem as restrições e as regras de negócio estabelecidas. A autenticação e a autorização também devem ser verificadas na camada de aplicação, não apenas pelo redirecionamento visual entre os painéis.

# 8. Estado atual do projeto e próximos passos

A implementação atual estabelece a estrutura principal do banco de dados, incluindo as entidades necessárias ao gerenciamento de trajetos, aeronaves, tripulantes, voos, usuários e passagens.

Também foram definidas restrições de integridade, tipos enumerados e triggers para validar parte das regras de negócio. O script de povoamento prepara dados fictícios para demonstrar os relacionamentos e as operações previstas.

O protótipo da interface está organizado em painéis específicos para gerente, administrador e cliente, de acordo com as responsabilidades descritas no levantamento de requisitos.

Para a entrega final, os próximos passos incluem:

- Completar e testar as validações de conflitos de horário de aeronaves e tripulantes.
- Implementar o controle de descanso mínimo e das escalas de trabalho.
- Aprimorar o controle de concorrência na emissão de passagens.
- Ajustar o tratamento de assentos associados a passagens canceladas.
- Executar e validar o script de povoamento com a estrutura atual do banco.
- Testar as consultas e as operações de cadastro, alteração e remoção.
- Concluir a integração entre a interface e a API, quando aplicável.
- Verificar a autenticação, a autorização por perfil e o armazenamento seguro das senhas.
- Realizar testes integrados das regras de negócio e dos fluxos da aplicação.

Essas atividades buscam garantir que a versão final seja capaz de atender aos requisitos funcionais e às restrições operacionais do sistema.

# 9. Considerações finais

O desenvolvimento do Decolaê permitiu aplicar conceitos de modelagem conceitual, mapeamento relacional, implementação em PostgreSQL e representação de regras de negócio no banco de dados.

A evolução do modelo demonstrou a importância de revisar cardinalidades, avaliar a escolha das chaves e separar adequadamente informações reutilizáveis de informações específicas de cada operação. A implementação também evidenciou a utilidade de restrições de integridade e triggers para centralizar validações.

A organização da interface em diferentes painéis busca refletir as responsabilidades de cada perfil e facilitar o acesso às funcionalidades correspondentes.

Embora a estrutura principal esteja definida, algumas regras de negócio e mecanismos de segurança e concorrência ainda necessitam de implementação e testes. Essas pendências serão consideradas na continuidade do projeto, com o objetivo de entregar uma aplicação integrada e consistente com os requisitos propostos.

---

# Apêndice A — Artefatos do projeto

Os seguintes materiais complementam este relatório:

- `diagramas/DER_INICIAL.drawio.png` — diagrama entidade-relacionamento inicial.
- `diagramas/DER_AJUSTES.drawio.png` — diagrama entidade-relacionamento atualizado.
- `modelos-relacionais/MR_INICIAL.md` — documentação do modelo relacional inicial.
- `modelos-relacionais/MR_AJUSTES.md` — documentação do modelo relacional atualizado.
- `schema.sql` — definição da estrutura do banco de dados.
- `triggers.sql` — funções e triggers para validação de regras de negócio.
- `seed.sql` — script de povoamento inicial.

Os nomes dos arquivos devem ser ajustados para corresponder aos nomes efetivamente utilizados no repositório do grupo.
