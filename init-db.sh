#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE textile_db_node1;
    CREATE DATABASE textile_db_node2;
    CREATE DATABASE textile_db_node3;
    
    \c textile_db_node1
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    \c textile_db_node2
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    \c textile_db_node3
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL 