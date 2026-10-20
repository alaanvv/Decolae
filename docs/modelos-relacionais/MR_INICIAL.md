Asterisco denota chave primária

### USUARIO

```
* **id_usuario**
- nome
- email
- senha
- tipo
- id_cliente -> **CLIENTE**; quando o usuário for do tipo cliente
```

### CLIENTE

```
* **id_cliente**
- cpf
- telefone
```

### PASSAGEM

```
* **id_passagem**
- numero_assento
- data_compra
- preco
- status
- id_voo -> **VOO**
- id_cliente -> **CLIENTE**
```

### VOO

```
* **id_voo**
- status
- id_trajeto -> **TRAJETO**
- id_aeronave -> **AERONAVE**
```

### TRAJETO

```
* **id_trajeto**
- cidade_origem
- cidade_destino
- previsao_partida
- previsao_chegada
```

### AERONAVE

```
* **id_aeronave**
- modelo
- identificacao
- quantidade_assentos
- status
```

### TRIPULANTE

```
* **id_tripulante**
- nome
- cpf
```

### TRIPULACAO_VOO

```
* **id_voo** -> **VOO**
* **id_tripulante** -> **TRIPULANTE**
- funcao_no_voo
```

> Relação que representa a alocação de um tripulante em um voo
