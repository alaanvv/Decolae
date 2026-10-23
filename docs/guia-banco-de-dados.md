[__Voltar__](../readme.md)

# Instalação/Uso do PostgreSQL

Guia feito para o **Arch Linux**, adapte os comandos para seu sistema operacional

1. Instale o **PostgreSQL**
  `sudo pacman -S postgresql`
2. Inicialize o banco de dados caso seja a primeira vez instalando
  `sudo -iu postgres initdb -D /var/lib/postgres/data`

Após isso o **PostgreSQL** já está instalado e configurado, pra rodar use o seguinte comando:  
`sudo systemctl start postgresql`

Caso queira que rode automaticamente sempre que ligar o computador:
`sudo systemctl enable postgresql`

Pra abrir o terminal do banco de dados:
`sudo -iu postgres psql`

---

# Scripts úteis

`database/setup.sh` - inicializa o banco de dados `decolae` com o *schema* e as *triggers*
`database/seed.sh` - popula o banco de dados
