[__Voltar__](../readme.md)

# Testes das regras de negócio

Os testes simulam, em sequência, as situações de conflito e as regras de negócio pedidas nos [requisitos](requisitos.md). Eles mostram que o sistema aceita o que deve aceitar e recusa o que deve recusar. Isso inclui situações de **concorrência**, em que dois ou mais usuários fazem operações conflitantes ao mesmo tempo.

As regras são aplicadas pelo **PostgreSQL**, por meio das triggers de [`database/triggers.sql`](../database/triggers.sql). Por isso os testes falam direto com o banco: qualquer caminho de entrada passa pelas mesmas regras, seja a interface, a API ou um `INSERT` manual.

## Pré-requisitos

1. Banco `decolae` criado e populado. Veja o [guia do banco de dados](guia-banco-de-dados.md).
2. Arquivo `api/.env` configurado. Veja o [guia da API](guia-api.md).
3. Triggers atualizadas no banco. Na raiz do projeto, rode:

   ```bash
   sudo -u postgres psql -v ON_ERROR_STOP=1 -d decolae < database/triggers.sql
   ```

   O comando pode ser repetido quantas vezes quiser, porque recria todas as funções e triggers. A migração `database/migrations/005_regras_concorrencia.sql` faz o mesmo.

## Como executar

### Pela interface (visual)

1. Rode `npm start` e acesse `http://127.0.0.1:3000`.
2. Entre como **gerente** (`gerente@decolae.com` / `senha123`) ou como **administrador** (`admin@decolae.com` / `senha123`).
3. No painel do gerente, abra a aba **Testes de regras**. No painel do administrador, clique em **Testes de regras de negócio**, abaixo da tabela de voos.
4. Clique em **Executar simulação**.

Cada cenário aparece como um cartão, conforme vai sendo executado. Cada verificação mostra:

- ✅ ou ❌, indicando se o comportamento foi o esperado;
- uma etiqueta com o comportamento esperado: **aceitar**, **recusar** ou **concorrência**;
- a resposta real do banco, por exemplo a mensagem de erro da trigger que barrou a operação.

A barra de progresso no topo mostra o total de verificações que passaram e falharam. A opção **Mostrar só falhas** esconde as verificações que passaram.

### Pelo terminal

```bash
npm run debug:regras
```

A saída tem o mesmo conteúdo da tela. O comando termina com código `0` quando tudo passa e `1` quando alguma verificação falha, o que permite usá-lo em scripts.

## Dados de teste

A simulação cria seus próprios trajetos, aeronaves, tripulantes, clientes, voos e passagens:

| Dado | Como é identificado |
| --- | --- |
| Voos | número começando com `DBG` (ex.: `DBG101`) |
| Aeronaves | identificação `DBG-01`, `DBG-02`, … |
| Tripulantes | nome `Debug N` |
| Clientes | telefone `debug` |
| Trajeto | origem `Debug Origem` |

Os voos são marcados para **2030**, para não cruzar com os dados reais. Tudo é **apagado no início e no fim** de cada execução, então os dados reais do banco não são alterados. Só uma simulação roda por vez: se o terminal e a interface tentarem rodar ao mesmo tempo, a segunda recebe o aviso *"Já existe uma simulação em andamento"*.

A rota usada pela interface (`POST /api/debug/regras`) exige login de gerente ou administrador. Ela fica desabilitada quando o servidor roda com `NODE_ENV=production`.

## Regras cobertas

| Código | Regra | Cenários |
| --- | --- | --- |
| RN01 | Uma aeronave não pode estar em dois voos com horários sobrepostos | 1, 2, 8 |
| RN02 | Um voo precisa de no mínimo 1 comandante (piloto), 1 copiloto e 2 comissários | 3, 4, 11 |
| RN03 | Um tripulante não pode ser escalado em voos incompatíveis (sobrepostos) | 5, 6, 8, 12 |
| RN04 | Um tripulante não pode trabalhar mais de 12h sem um descanso mínimo de 36h | 7 |
| RN05 | Não é possível vender passagens acima da capacidade nem o mesmo assento duas vezes | 9, 10 |
| RN06 | Um cliente não pode ter passagens para voos com horários sobrepostos | 9 |

## Cenários

Os horários abaixo são relativos ao início de cada cenário. Por exemplo, "0h–2h" é um voo de duas horas.

### 1. Aeronave em dois voos no mesmo horário (RN01)

| Ação | Esperado |
| --- | --- |
| Criar o voo DBG101 na aeronave DBG-01, das 0h às 2h | aceitar |
| Criar o DBG102 na mesma aeronave, das 1h às 3h | **recusar**: sobrepõe ao DBG101 |
| Criar o DBG103 na mesma aeronave, das 2h às 4h | aceitar: começa quando o outro termina |
| Mudar a partida do DBG103 para 1h | **recusar**: a alteração de horário também é verificada |

### 2. Concorrência na alocação de aeronave (RN01)

Dois administradores criam, **ao mesmo tempo**, dois voos sobrepostos na mesma aeronave. Cada um usa sua própria conexão e transação.

**Esperado:** exatamente um voo é criado. A trigger trava a linha da aeronave (`FOR UPDATE`), então a segunda transação espera a primeira terminar e só então enxerga o conflito.

### 3. Tripulação mínima (RN02)

| Ação | Esperado |
| --- | --- |
| Programar um voo com comandante, copiloto e 1 comissário | **recusar** |
| Adicionar o 2º comissário e programar | aceitar |
| Mudar um voo sem tripulação de PLANEJAMENTO direto para ATRASADO | **recusar** |
| Mudar um voo sem tripulação de PLANEJAMENTO direto para EMBARQUE | **recusar** |
| Criar um voo já com status PROGRAMADO | **recusar** |

### 4. Proteção da tripulação mínima (RN02)

Com o voo já programado:

| Ação | Esperado |
| --- | --- |
| Remover um comissário | **recusar** |
| Trocar a função de um comissário para COMANDANTE (o voo ficaria com 1 comissário) | **recusar** |
| Mudar o voo para ATRASADO e então remover um comissário | **recusar** |

Para mexer na tripulação mínima, o voo precisa voltar para PLANEJAMENTO.

### 5. Tripulante em voos incompatíveis (RN03)

| Ação | Esperado |
| --- | --- |
| Escalar o comandante de um voo das 0h–2h em outro voo das 1h–3h | **recusar** |
| Escalar o mesmo comandante em um voo das 3h–5h | aceitar |

### 6. Concorrência na escala de tripulante (RN03)

O mesmo tripulante é escalado **ao mesmo tempo** em dois voos sobrepostos, cada um em uma transação.

**Esperado:** exatamente uma escala é aceita. A trigger trava a linha do tripulante.

### 7. Jornada de 12h e descanso de 36h (RN04)

Regra implementada: a duração do voo conta como horas trabalhadas. Um intervalo de **36h ou mais** entre a chegada de um voo e a partida do próximo encerra o bloco de trabalho. Dentro de um bloco, a soma das horas não pode passar de **12h**.

| Ação | Total no bloco | Esperado |
| --- | --- | --- |
| Voo de 5h | 5h | aceitar |
| Voo de 5h, 5h depois do anterior | 10h | aceitar |
| Voo de 3h, 5h depois do anterior | 13h | **recusar** |
| Voo de 5h, só 35h depois do anterior | 15h | **recusar** |
| Voo de 5h, 36h depois do anterior | 5h (novo bloco) | aceitar |
| Antecipar esse último voo para 25h depois do anterior | 15h | **recusar**: mudar o horário também é verificado |

### 8. Voo cancelado (RN01 e RN03)

| Ação | Esperado |
| --- | --- |
| Cancelar um voo e escalar o tripulante dele em outro voo no mesmo horário | aceitar: voo cancelado não prende a tripulação |
| Usar a aeronave do voo cancelado em outro voo no mesmo horário | aceitar |
| Reativar o voo cancelado (mudar para PLANEJAMENTO) | **recusar**: aeronave e tripulante agora estão em outro voo |

### 9. Compra de passagens (RN05 e RN06)

A aeronave usada tem só **2 assentos**.

| Ação | Esperado |
| --- | --- |
| Comprar passagem de voo em PLANEJAMENTO | **recusar**: só voos PROGRAMADO ou ATRASADO vendem passagens |
| Cliente 1 compra o assento 1 | aceitar |
| Cliente 2 tenta o assento 1 | **recusar**: assento ocupado |
| Cliente 2 tenta o assento 3 | **recusar**: assento não existe |
| Cliente 2 compra o assento 2 | aceitar |
| Cliente 3 tenta comprar | **recusar**: voo lotado |
| Cliente 1 compra outro voo com horário sobreposto | **recusar**: RN06 |
| Cliente 1 cancela a passagem e compra o outro voo | aceitar |
| Cliente 3 compra o assento liberado pelo cancelamento | aceitar |
| O voo é cancelado e o cliente 3 compra um voo alternativo no mesmo horário | aceitar |
| Reativar o voo cancelado | **recusar**: o cliente 3 passaria a ter dois voos sobrepostos |

### 10. Concorrência na compra (RN05)

**10 clientes** compram **ao mesmo tempo** passagens de um voo com **2 assentos**. Metade tenta o assento 1 e metade o assento 2.

**Esperado:** exatamente 2 passagens são emitidas e as outras 8 são recusadas. A trigger trava a linha do voo, e um índice único impede assento duplicado.

### 11. Remover tripulante enquanto outro usuário programa o voo (RN02)

Duas transações são intercaladas em uma ordem fixa:

1. **A** remove um comissário do voo, que ainda está em PLANEJAMENTO, e ainda não confirma.
2. **B** tenta programar o voo.
3. **A** confirma.

**Esperado:** o voo não termina PROGRAMADO com tripulação incompleta. A remoção trava o voo (`FOR SHARE`), então B espera, enxerga a remoção e a programação é recusada.

### 12. Escalar tripulante enquanto outro usuário muda o horário do voo (RN03)

1. **A** escala um tripulante no voo X (sem conflito no horário atual) e ainda não confirma.
2. **B** muda o horário do voo X para cima de outro voo desse tripulante.
3. **A** confirma.

**Esperado:** o tripulante não termina em dois voos sobrepostos. A escala trava o voo (`FOR SHARE`), então B espera, enxerga o novo tripulante e a mudança de horário é recusada.

## O que foi corrigido para os testes passarem

Na primeira execução, **29 de 39** verificações passaram. As falhas encontradas e as correções feitas em `database/triggers.sql`:

| Problema | Correção |
| --- | --- |
| O voo podia ir de PLANEJAMENTO direto para ATRASADO, EMBARQUE etc. sem tripulação | A tripulação mínima passou a ser exigida em qualquer status operacional, não só em PROGRAMADO |
| A tripulação mínima só era protegida no status PROGRAMADO, e trocar a função (`UPDATE`) não era verificado | A proteção vale em qualquer status operacional e também em alterações da escala |
| Um voo cancelado continuava bloqueando seus tripulantes | Voos cancelados são ignorados na verificação de sobreposição e de jornada |
| Passagens de um voo cancelado impediam o cliente de comprar um voo alternativo | Voos cancelados são ignorados no conflito de horário do cliente, na trigger e na rota `POST /api/passagens` |
| Reativar um voo cancelado não verificava nenhum conflito | Mudanças de status também verificam aeronave, tripulação e passageiros |
| Corrida entre remover tripulante e programar o voo deixava o voo programado com tripulação incompleta | A remoção ou alteração da escala trava o voo com `FOR SHARE` |
| Corrida entre escalar tripulante e mudar o horário do voo deixava o tripulante em dois voos sobrepostos | A escala trava o voo com `FOR SHARE` |

## Arquivos

| Arquivo | Papel |
| --- | --- |
| `api/src/debug/simulacaoRegras.js` | Cenários e verificações (usados pela tela e pelo terminal) |
| `api/scripts/debug-regras.js` | Saída no terminal (`npm run debug:regras`) |
| `api/src/routes/debug.js` | Rota `POST /api/debug/regras`, que envia os resultados aos poucos (NDJSON) |
| `app/src/components/debug/RulesTestPanel.jsx` | Tela de testes no painel do gerente e do administrador |
| `database/triggers.sql` | Regras aplicadas pelo banco |
