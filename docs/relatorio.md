# UNIVERSIDADE FEDERAL DE SÃO JOÃO DEL REI

## Departamento de Ciência da Computação

### Bacharelado em Ciência da Computação

### Banco de Dados — 2º semestre de 2026

**Professor:** Leonardo Chaves Dutra da Rocha

# Decolaê — Relatório de Evolução e Implementação do Banco de Dados

**Segunda entrega — Trabalho Prático, Opção 1**

**Integrantes:** [Nome dos integrantes do grupo]

**Data:** Outubro de 2026

---

# 1. Introdução

Este relatório apresenta a evolução do projeto Decolaê, desenvolvido como parte do trabalho prático da disciplina de Banco de Dados. O sistema tem como objetivo gerenciar as principais operações de uma empresa de aviação doméstica, incluindo o cadastro de trajetos, aeronaves e tripulantes, a criação de voos e a comercialização de passagens.

O projeto contempla três tipos principais de usuários: gerente, administrador e cliente. Cada perfil possui responsabilidades específicas, que são refletidas na organização dos dados e nas funcionalidades da aplicação.

Nesta etapa, são apresentados os resultados da evolução da modelagem conceitual, as decisões tomadas durante o desenvolvimento, a estrutura do banco de dados implementado em PostgreSQL, as regras de negócio contempladas, o povoamento inicial e o protótipo da interface.

O relatório também registra as funcionalidades que ainda precisam ser desenvolvidas ou aprimoradas para a entrega final.

# 2. Evolução da modelagem

## 2.1. Modelagem inicial

Na primeira etapa do trabalho, foi realizado o levantamento dos requisitos do sistema, seguido pela elaboração do modelo entidade-relacionamento (DER) e pelo mapeamento para o modelo relacional.

A modelagem inicial buscou representar as principais entidades envolvidas no funcionamento da empresa, seus atributos e os relacionamentos necessários para gerenciar voos e passagens.

As entidades inicialmente consideradas foram Trajeto, Aeronave, Tripulante, Voo, Cliente, Passagem e Usuário.

**Figura 1 — Diagrama entidade-relacionamento inicial**

[Inserir imagem: `diagramas/DER_INICIAL.drawio.png`]

O modelo relacional correspondente está documentado em [MR_INICIAL.md](modelos-relacionais/MR_INICIAL.md).

## 2.2. Dinâmica de discussão entre os grupos

Durante as atividades relacionadas à primeira entrega, os grupos trocaram seus modelos entidade-relacionamento para discutir as soluções propostas e compartilhar sugestões de melhoria.

A dinâmica permitiu analisar diferentes formas de representar os requisitos do sistema, identificar possíveis inconsistências e refletir sobre as decisões de modelagem adotadas.

A partir das discussões, foram identificados pontos que mereciam revisão, além de ideias que poderiam contribuir para o aperfeiçoamento do projeto.

### 2.2.1. Cardinalidade entre passagem e voo

Foi identificada uma inconsistência na cardinalidade do relacionamento entre Passagem e Voo. A representação anterior permitia interpretar que uma mesma passagem poderia estar associada a mais de um voo, comportamento que não correspondia ao funcionamento pretendido.

A modelagem foi corrigida para estabelecer que cada passagem está associada a um único voo, enquanto um voo pode possuir diversas passagens.

Essa alteração torna a representação mais coerente com o processo de venda de passagens e com as regras de negócio do sistema.

### 2.2.2. Representação das responsabilidades dos usuários

Durante as discussões, foi sugerido representar os diferentes tipos de usuário por meio de especializações da entidade Usuário. A partir dessas especializações, poderiam ser estabelecidos relacionamentos que representassem responsabilidades, como o administrador criando voos e o gerente cadastrando trajetos.

O grupo optou por não incorporar essa sugestão ao modelo conceitual.

Essa decisão foi motivada pela distinção entre a representação dos dados do domínio e a representação das responsabilidades operacionais de cada perfil. Na modelagem adotada, o tipo de usuário é um atributo da entidade Usuário, enquanto as permissões e as operações disponíveis para cada perfil são tratadas na aplicação.

Dessa forma, considerou-se que a especialização não era necessária para representar os dados fundamentais do sistema. A decisão não impede que as responsabilidades sejam implementadas e controladas posteriormente na interface e na camada de aplicação.

### 2.2.3. Revisão das chaves das entidades

Além das sugestões recebidas, o grupo revisou os identificadores utilizados na modelagem. Alguns atributos que haviam sido representados por identificadores artificiais poderiam ser utilizados diretamente como chaves, por possuírem características adequadas de identificação no contexto do projeto.

Essa revisão buscou evitar a introdução de identificadores desnecessários e aproximar o modelo das características dos dados representados.

Entretanto, a escolha de uma chave deve considerar sua unicidade e estabilidade. Por esse motivo, a implementação final não elimina identificadores artificiais indiscriminadamente: a entidade Trajeto, por exemplo, utiliza um identificador próprio.

### 2.2.4. Separação entre trajeto e voo

Foi identificado que a modelagem inicial permitia o reaproveitamento de trajetos, mas mantinha as datas e os horários previstos de partida e chegada associados ao próprio trajeto.

Essa organização dificultava a representação de diferentes voos que utilizassem o mesmo trajeto em datas e horários distintos.

Para resolver o problema, as previsões de partida e chegada foram transferidas para a entidade Voo. Assim, o trajeto passou a representar a ligação entre as cidades de origem e destino, enquanto cada voo representa uma ocorrência específica dessa operação, com seus próprios horários, aeronave e status.

Essa separação melhora a reutilização dos trajetos e evita a repetição desnecessária de informações.

## 2.3. Modelo entidade-relacionamento atualizado

Após as revisões, foi elaborado um novo diagrama entidade-relacionamento, incorporando os ajustes considerados adequados pelo grupo.

**Figura 2 — Diagrama entidade-relacionamento atualizado**

[Inserir imagem: `diagramas/DER_AJUSTES.drawio.png`]

O modelo relacional atualizado está documentado em [MR_AJUSTES.md](modelos-relacionais/MR_AJUSTES.md).

As principais alterações foram a correção das cardinalidades, a revisão das chaves e a separação entre os dados permanentes de um trajeto e os dados específicos de cada voo.

# 3. Levantamento de requisitos

O sistema foi projetado para atender às necessidades de três perfis principais de usuários.

## 3.1. Gerente

O gerente é responsável pelo cadastro e pela manutenção das informações básicas da empresa. Suas operações incluem:

- Cadastrar, consultar, alterar e remover trajetos.
- Cadastrar, consultar, alterar e remover aeronaves.
- Cadastrar, consultar, alterar e remover membros da tripulação.

## 3.2. Administrador

O administrador é responsável pela criação e pelo gerenciamento dos voos. Para isso, deve associar cada voo a um trajeto, a uma aeronave e aos profissionais que compõem sua tripulação.

O sistema deve exigir, no mínimo, um comandante, um copiloto e dois comissários para que um voo seja programado.

Também devem ser consideradas restrições relativas à disponibilidade das aeronaves e à compatibilidade das escalas dos tripulantes.

## 3.3. Cliente

O cliente pode consultar os voos disponíveis, visualizar suas informações e adquirir passagens.

Entre as informações relevantes estão a origem, o destino, os horários previstos, a aeronave e a quantidade de assentos disponíveis.

O sistema deve impedir a venda de passagens acima da capacidade da aeronave, a duplicidade de ocupação de assentos e a compra de passagens incompatíveis com os horários de outros voos do cliente.

# 4. Implementação do banco de dados

## 4.1. Tecnologia utilizada

O banco de dados do projeto foi implementado utilizando PostgreSQL. A estrutura está organizada no schema `decolae`, responsável por agrupar as tabelas e os demais objetos relacionados ao sistema.

A implementação utiliza tipos enumerados, chaves primárias, chaves estrangeiras, restrições de integridade e mecanismos de programação no próprio banco de dados para aplicar determinadas regras de negócio.

## 4.2. Estrutura das tabelas

O banco de dados contém oito tabelas principais.

| Tabela | Finalidade |
|---|---|
| `CLIENTE` | Armazena os dados de identificação e contato dos clientes. |
| `USUARIO` | Armazena as credenciais, os nomes e os tipos de usuário. |
| `TRAJETO` | Representa as ligações entre cidades de origem e destino. |
| `AERONAVE` | Registra os modelos, as identificações, as capacidades e os status das aeronaves. |
| `TRIPULANTE` | Armazena os dados dos profissionais da tripulação. |
| `VOO` | Registra os voos, seus horários, status, trajetos e aeronaves. |
| `PASSAGEM` | Representa as passagens emitidas, seus assentos, preços, clientes e voos. |
| `TRIPULACAO_VOO` | Associa os tripulantes aos voos e registra suas funções em cada operação. |

A separação entre Usuário e Cliente permite distinguir as informações de autenticação das informações relacionadas à identificação do cliente. Um usuário do tipo cliente deve estar associado a um registro em `CLIENTE`.

A tabela `TRIPULACAO_VOO` representa um relacionamento muitos-para-muitos entre voos e tripulantes. Essa estrutura permite que um profissional seja associado a diferentes voos, sem que seus dados cadastrais precisem ser repetidos.

A função desempenhada pelo profissional em cada voo é armazenada no atributo `funcao_no_voo`.

## 4.3. Chaves e integridade referencial

As tabelas utilizam chaves primárias para identificar seus registros e chaves estrangeiras para manter a consistência dos relacionamentos.

Entre as principais restrições implementadas estão:

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

Também foram utilizadas restrições `CHECK` para impedir o cadastro de trajetos com origem e destino iguais, aeronaves sem assentos e voos com previsão de partida posterior ou igual à previsão de chegada. O preço da passagem também deve ser positivo.

## 4.4. Tipos enumerados

Foram definidos tipos enumerados para representar atributos cujos valores pertencem a conjuntos preestabelecidos.

| Tipo | Valores |
|---|---|
| `tipo_usuario` | `GERENTE`, `ADMINISTRADOR`, `CLIENTE` |
| `status_aeronave` | `DISPONIVEL`, `MANUTENCAO`, `OPERANDO`, `INATIVA` |
| `status_voo` | `PLANEJAMENTO`, `PROGRAMADO`, `ATRASADO`, `EMBARQUE`, `EM_ANDAMENTO`, `CONCLUIDO`, `CANCELADO` |
| `status_passagem` | `EMITIDA`, `CANCELADA`, `UTILIZADA` |
| `funcao_tripulante` | `COMANDANTE`, `COPILOTO`, `MECANICO`, `COMISSARIO` |

A utilização desses tipos restringe os valores aceitos pelos atributos correspondentes, evitando estados inválidos ou inconsistentes com as opções previstas pelo sistema.

No caso de `USUARIO`, também foi implementada uma restrição para garantir que usuários do tipo cliente possuam um cliente associado, enquanto usuários dos demais tipos não possuam essa associação.

## 4.5. Relacionamentos principais

O relacionamento entre Trajeto e Voo permite que um mesmo trajeto seja reutilizado por diferentes voos. Cada voo, entretanto, possui apenas um trajeto associado.

O relacionamento entre Aeronave e Voo permite identificar qual aeronave está designada para cada operação.

O relacionamento entre Cliente, Passagem e Voo permite registrar as compras realizadas e consultar as passagens de cada cliente.

Por fim, o relacionamento entre Tripulante e Voo é implementado por meio de `TRIPULACAO_VOO`, que também registra a função desempenhada por cada profissional em cada voo.

# 5. Regras de negócio implementadas

Parte das regras do sistema foi implementada diretamente no PostgreSQL por meio de funções e triggers. Essa abordagem permite centralizar determinadas validações no banco, evitando que elas dependam exclusivamente do comportamento da interface.

## 5.1. Controle de emissão de passagens

A função `verifica_disponibilidade_voo()` é executada antes da inserção ou atualização de uma passagem com status `EMITIDA`.

Essa função verifica se:

- O voo está em um status que permite a emissão de passagens.
- O assento solicitado não está ocupado por outra passagem não cancelada.
- A quantidade de passagens emitidas não ultrapassa a capacidade da aeronave.
- O número do assento está dentro dos limites da capacidade da aeronave.

A função impede a emissão de passagens para voos que não estejam nos estados `PROGRAMADO` ou `ATRASADO`.

Além disso, a restrição de unicidade sobre o par formado pelo número do voo e pelo número do assento complementa o controle de ocupação.

## 5.2. Controle de disponibilidade da aeronave

A função `verifica_aeronave_disponivel()` é executada antes da inserção ou atualização de um voo.

Sua finalidade é impedir que um voo seja associado a uma aeronave cujo status seja `MANUTENCAO` ou `INATIVA`.

Essa validação evita a utilização de aeronaves explicitamente indisponíveis, embora não substitua o controle de conflitos de horário entre diferentes voos.

## 5.3. Verificação da tripulação mínima

A função `verifica_tripulacao_completa()` é executada antes da alteração do status de um voo.

Quando um voo passa para o status `PROGRAMADO`, a função verifica se há, pelo menos:

- Um comandante.
- Um copiloto.
- Dois comissários.

Caso alguma dessas condições não seja atendida, a operação é interrompida e uma exceção é lançada.

Essa regra impede que um voo seja programado sem a composição mínima prevista para a tripulação.

## 5.4. Regras ainda pendentes

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

# 6. Povoamento do banco de dados

## 6.1. Estratégia de povoamento

Para permitir a demonstração das funcionalidades, foi elaborado um script SQL de povoamento inicial, denominado *seed*.

O script insere dados fictícios relacionados aos diferentes tipos de usuários, trajetos, aeronaves, tripulantes, voos e passagens.

A utilização de dados previamente definidos permite reproduzir cenários de teste e demonstrar o funcionamento das consultas e das restrições implementadas.

## 6.2. Dados cadastrados

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
