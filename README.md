# AeroClima — Backend

Base local em NestJS + TypeScript, PostgreSQL e Docker. Frontend em [Vue + TypeScript](https://github.com/LucasPivovar/aeroclima-frontend).

**[Guia completo: instalar, clonar, atualizar, desenvolver e entender cada arquivo](docs/GUIA.md).**

## Primeiro acesso

Instale Git e Docker Desktop com WSL 2 e virtualização habilitados. Abra o Docker Desktop e clone os dois projetos lado a lado:

```powershell
git clone https://github.com/LucasPivovar/aeroclima-backend.git
git clone https://github.com/LucasPivovar/aeroclima-frontend.git
cd aeroclima-backend
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Crie `.env` somente no primeiro acesso. O único `.env` fica nesta pasta e o Compose configura os dois projetos. `.env.example` é o modelo versionado. Senhas reais não entram no Git ou no navegador. Os clones precisam conservar os nomes acima.

## Conferir

- Frontend: http://localhost:5173
- API: http://localhost:3000/api/v1/health
- Banco conectado: http://localhost:3000/api/v1/health/ready
- Swagger: http://localhost:3000/docs

As rotas de saúde retornam `status: ok`; readiness também retorna `database: up`. A tela mostra apenas H1 AeroClima. src/main.ts faz fetch da saúde e registra o resultado no console; o Docker verifica a conexão real com o banco. `docker compose ps` deve mostrar api, frontend e db como healthy.

```powershell
docker compose exec api npm run build
docker compose exec api npm test
docker compose exec api npm run test:e2e
docker compose exec api npm run lint
docker compose exec frontend npm run build
docker compose exec frontend npm test
docker compose exec frontend npm run lint
```

## Trabalhar juntos

Compartilhe os repositórios; cada pessoa instala Docker e inicia seu próprio ambiente e banco. Lockfiles versionados e `npm ci` alinham as dependências. Trabalho direto na main, com commit/pull/push e coordenação dos arquivos compartilhados, está explicado no guia. Código src atualiza ao salvar. Ao mudar dependências, Dockerfile ou configurações, execute `docker compose up --build -d` novamente. Cada repositório possui CI para build, lint, formatação, testes e construção da imagem.

```powershell
docker compose logs --tail=100 api frontend db
docker compose down
```

`down` preserva dados; `down -v` apaga o volume do banco. Mudar DB_PASSWORD no `.env` não altera a senha de um volume já inicializado. Node e PostgreSQL estão fixados por digest nas versões testadas; atualizações desses digests devem ser testadas pela equipe.

## Banco manual

Veja o [diagrama](docs/BANCO.md). PostgreSQL inicia vazio: sem ORM, migrations, seed ou tabelas da aplicação. Abra o console para executar o SQL escrito por vocês:

```powershell
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Use `\dt` para listar as tabelas. A porta PostgreSQL não é publicada no Windows.

## Estado atual

Configuração validada, Swagger, prefixo `/api/v1`, CORS, headers de segurança, validação global e health checks. Autenticação, CRUD, mapas e offline serão implementados depois. Mala/bagagem fora do escopo. Publicação em VPS fica para outra etapa.

Node local é opcional (linha 24, >=24.15). Para validar fora do Docker: `npm ci`, `npm run build`, `npm test`, `npm run test:e2e` e `npm run lint`. Testes HTTP simulam o acesso ao banco; readiness testa a conexão real.

## Integrações preparadas

Clientes HTTP de Open-Meteo (clima/cidades) e Geoapify (endereços, pontos turísticos, hotéis e rotas), com timeout. GEOAPIFY_API_KEY é opcional no único .env; o projeto inicia sem ela. Estes clientes ainda não têm endpoints públicos ou telas. Veja o guia para ativação, limites e responsabilidades de cada fornecedor.
