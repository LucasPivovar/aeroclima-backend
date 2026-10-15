# AeroClima

AeroClima é um planejador de viagens que reúne voos, hospedagens, atividades, lugares salvos, roteiro diário e organização da mala. Consultas de clima e rotas complementam o planejamento.

## MVP

O MVP concentra os dados e funcionalidades em uma única API, com cadastro de usuários, autenticação e acesso aos registros de cada usuário. Os cartões do Trello descrevem funcionalidades planejadas, não necessariamente já implementadas.

Armazenamento no aparelho, uso offline e sincronização ficam para uma fase posterior.

## Estrutura atual

- `aeroclima-backend`: API em NestJS e TypeScript, com TypeORM e PostgreSQL.
- `aeroclima-frontend`: interface em Vue 3, TypeScript e Vite.
- O Docker Compose do backend inicia a API e o PostgreSQL.

Veja [INSTALACAO.md](INSTALACAO.md) para executar o backend localmente.
