[__Voltar__](../readme.md)

# Evolução

Para a primeira entrega, fizemos um levantamento de requisitos, criamos um modelo de entidade e relacionamento e também fizemos um mapeamento para modelo relacional.

### Modelos

![DER](diagramas/DER_INICIAL.drawio.png)

[Ver modelo entidade-relacionamento](modelos-relacionais/MR_INICIAL.md)

---

Durante as discussões sobre o trabalho foram levantados dois pontos:

1. Cardinalidades incorreta

A cardinalidade do relacionamento entre passagens e voos indicava que uma passagem podia ser referente a mais de um voo, o que não foi intencional e foi corrigido.

2. Falta de representação de responsabilidades

Foi sugerido que criasse especializações do tipo entidade "Usuário" para representar os diferentes tipos de usuário dentro do sistema, e então com essas especializações criasse relações como por exemplo: "administrador -> cria -> voo", "gerente -> cadastra -> trajeto".
Escolhemos não aderir a essa sugestão.  
Achamos que isso não precisava ser representado nesse diagrama pois parece mais ser parte da implementação, e não tanto do domínio de dados.  

Por fora das sugestões, removemos alguns IDs que estavam servindo de chave onde outros atributos poderiam ser a chave.  
Além disso, foi notado que a modelagem permitia o reaproveitamento de trajetos, porém as datas de partida e chegada do voo ficavam no próprio trajeto, dificultando o reuso. Foi ajustado pra que essas datas pertençam ao voo.

### Modelos

![DER](diagramas/DER_AJUSTES.drawio.png)

[Ver modelo entidade-relacionamento](modelos-relacionais/MR_AJUSTES.md)
