sudo -u postgres createdb decolae
sudo -u postgres psql -d decolae -f schema.sql
sudo -u postgres psql -d decolae -f triggers.sql
