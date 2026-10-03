# AeroClima — Backend

NestJS + TypeScript e PostgreSQL, para desenvolvimento local com Docker. Frontend em Vue + TypeScript, no clone aeroclima-frontend ao lado deste.

## Guias

- [Instalação em outro PC e correção dos imports no editor](docs/INSTALACAO.md)
- [Desenvolvimento, arquivos e integrações](docs/DESENVOLVIMENTO.md)
- [Git/GitHub, modelos de commit e versionamento](docs/DOCUMENTACAO.md)
- [Proposta textual do banco](docs/BANCO.md)

Na primeira instalação, copie .env.example para .env. Depois:

```powershell
docker compose up --build -d
```

Frontend: http://localhost:5173. Início da API: http://localhost:3000. Saúde: http://localhost:3000/api/v1/health. Banco: http://localhost:3000/api/v1/health/ready. Swagger: http://localhost:3000/docs.

Para o editor local, instale Node 24 (>=24.15 e <25) e execute npm.cmd ci nos dois clones. Os pacotes do Docker ficam separados dos pacotes vistos pelo editor Windows.

Único .env no backend. Banco vazio, criado manualmente depois. Clientes Open-Meteo e Geoapify preparados; Geoapify depende de chave opcional. Tela somente H1 AeroClima, com fetch da saúde no console. Sem testes unitários e sem implantação VPS nesta base; CI verifica build/lint/formatação/imagem. Healthchecks do Docker permanecem.
