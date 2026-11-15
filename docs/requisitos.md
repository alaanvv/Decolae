[__Voltar__](../readme.md)

# Levantamento de requisitos

## Tipos de usuários

O sistema deve possuir três tipos de usuários principais:

- **Gerente**
  - Cadastra trajetos
  - Altera trajetos
  - Remove trajetos
  - Cadastra aeronaves
  - Altera aeronaves
  - Remove aeronaves
  - Cadastra membros da tripulação
  - Altera membros da tripulação
  - Remove membros da tripulação

- **Administrador**
  - Cria voos

- **Cliente**
  - Consulta voos disponíveis
  - Visualiza informações básicas do voo (origem, destino, horário, aeronave e quantidade de assentos disponíveis)
  - Escolhe um voo e realiza compra

## Entidades

As principais entidades do sistema e seus atributos são:

- **Trajeto**
  - Cidade de origem
  - Cidade de destino

- **Aeronave**
  - Modelo
  - Identificação
  - Número de assentos
  - Status

- **Tripulante**
  - Nome
  - CPF

- **Voo**
  - Trajeto
  - Aeronave
  - Previsão de partida
  - Previsão de chegada
  - Tripulação
  - Status

- **Cliente**
  - Nome
  - CPF
  - Telefone

- **Passagem**
  - Assento
  - Data da compra
  - Status
  - Preço
  - Voo
  - Cliente

- **Usuário**
  - Nome
  - Email
  - Senha
  - Tipo de usuário (gerente, administrador ou cliente)
  - Cliente (associado a usuários do tipo cliente)

## Relacionamentos

- Cada voo deve possuir um piloto (tripulante) na tripulação.
- Cada voo deve possuir um copiloto (tripulante) na tripulação.
- Cada voo deve possuir no mínimo dois comissários (tripulantes) de bordo na tripulação.
- Cada tripulante pode ser alocado em diferentes voos, respeitando as regras de escala.
- Cada voo deve possuir um trajeto.
- Cada voo deve possuir uma aeronave.
- Cada passagem deve possuir um voo, e cada voo pode ter N passagens relacionadas a ele.
- Cada passagem deve possuir um cliente, e cada cliente pode ter N passagens.
- Cada usuário do tipo cliente deve estar associado a um cliente.

## Regras de negócio

O sistema deve garantir que as seguintes regras sejam seguidas:

- Uma mesma aeronave não pode ser alocada em dois voos com horários sobrepostos
- Um membro da tripulação não pode ser escalado pra dois voos incompatíveis
- Um profissional não pode trabalhar mais de 12 horas sem um intervalo de descando de 36 horas
- Não deve ser possível comprar passagens acima da capacidade da aeronave
- Não deve ser possível comprar passagens com horários sobrepostos

## Estado de implementação

O gerente pode cadastrar, alterar e remover trajetos, aeronaves e tripulantes e gerenciar as escalas. O administrador cadastra voos, que começam em planejamento; o gerente programa o voo após registrar a tripulação mínima. O cliente consulta voos com assentos disponíveis, compra passagens com preço configurado no servidor e pode consultar ou cancelar as próprias passagens.

As rotas da API exigem sessão e validam o perfil de acesso. O status da aeronave é calculado como disponível ou em voo conforme os horários dos voos ativos; não é editado manualmente. As regras de conflito de aeronave, tripulação, descanso, capacidade, assento e horários de passageiros são aplicadas pelo PostgreSQL. Para a regra de descanso, a duração do voo é usada como medida de horas trabalhadas e o intervalo entre voos é medido da chegada à próxima partida. O processamento de pagamento externo não está integrado.
