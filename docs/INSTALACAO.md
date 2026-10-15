# Instalação local da API

## Pré-requisitos

- Git.
- Docker com Docker Compose (no Windows, Docker Desktop iniciado e configurado para containers Linux).
- Um cliente de banco, como DBeaver ou pgAdmin, para consultar tabelas (opcional). O PostgreSQL já roda no Docker; não é necessário instalá-lo separadamente.

## Primeira instalação

```sh
git clone https://github.com/LucasPivovar/aeroclima-backend.git
cd aeroclima-backend
```

Copie `.env.example` para `.env`. No PowerShell:

```powershell
Copy-Item .env.example .env
```

Inicie os serviços dentro da pasta `aeroclima-backend`:

```sh
docker compose up -d --build
```

A API fica em http://localhost:3000. O endpoint `GET /hello` retorna uma mensagem e `status: ok` quando a API está disponível. O Compose atual inicia apenas backend e banco.

## Atualizar uma instalação existente

Com suas alterações locais salvas, execute na pasta do backend:

```sh
git pull
docker compose up -d --build
```

## Consultar as tabelas

Crie uma conexão PostgreSQL no cliente de banco usando os valores do `.env`. Os padrões são:

| Campo | Valor |
| --- | --- |
| Host | localhost |
| Porta | 5432 |
| Banco | aeroclima |
| Usuário | postgres |
| Senha | postgres |

No cliente, abra o banco `aeroclima`, schema `public`, e atualize a lista de tabelas após iniciar a API. Dentro do Docker, a API usa `DB_HOST=db`; no cliente instalado no computador, use `localhost`.

As credenciais de exemplo destinam-se ao desenvolvimento local. Não publique o arquivo `.env`. O projeto atual usa sincronização automática de entidades no TypeORM para desenvolvimento.

## Comandos úteis

```sh
docker compose ps
docker compose logs -f api
docker compose down
```

`down` para os serviços e preserva o volume do banco. Não use `down -v` se quiser manter os dados.

Se a porta 3000 ou 5432 já estiver ocupada, libere a porta antes de iniciar. No Compose atual, `DB_PORT` é compartilhada entre a conexão interna e a porta publicada; mantenha 5432 para a configuração padrão.
