Asterisco denota chave primária

### USUARIO

```
* **email**
- nome
- senha
- tipo
- id_cliente -> **CLIENTE**; quando o usuário for do tipo cliente
```

### CLIENTE

```
* **cpf**
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
- previsao_partida
- previsao_chegada
- id_trajeto -> **TRAJETO**
- id_aeronave -> **AERONAVE**
```

### TRAJETO

```
* **id_trajeto**
- cidade_origem
- cidade_destino
```

### AERONAVE

```
* **identificacao**
- modelo
- quantidade_assentos
- status
```

### TRIPULANTE

```
* **cpf**
- nome
```

### TRIPULACAO_VOO

```
* **id_voo** -> **VOO**
* **id_tripulante** -> **TRIPULANTE**
- funcao_no_voo
```

> Relação que representa a alocação de um tripulante em um voo
