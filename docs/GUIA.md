# AeroClima: do primeiro clone ao desenvolvimento

Este guia vale para você e seu amigo. Stack atual: Vue + TypeScript no frontend, NestJS + TypeScript na API e PostgreSQL. Tudo roda localmente em Docker. O banco permanece vazio, para criação manual conforme o desenho.

## 1. Entender a estrutura

```text
AeroClima/                    pasta que reúne os dois clones
  aeroclima-backend/          repositório da API e configuração Docker
    .env                     único arquivo local de ambiente
    compose.yaml             liga API, frontend e banco
    src/                     código da API
    docs/                    guia e desenho do banco
  aeroclima-frontend/         repositório da interface
    src/                     código Vue
```

São dois repositórios porque você os criou separados. Cada um tem seu histórico, package.json e lockfile. Não é necessário adicionar outros serviços ou camadas antes de implementar as funcionalidades.

O fluxo é: navegador → Vue/Vite → proxy `/api/v1` → NestJS → PostgreSQL. O frontend não conecta diretamente ao banco e não recebe a senha. O Compose lê o `.env` do backend e entrega a cada container as variáveis de que precisa.

## 2. Instalar as ferramentas

- Git: baixar e atualizar o código.
- Docker Desktop: executar os containers. Precisa estar instalado e aberto, com WSL 2 e virtualização disponíveis no Windows.
- VS Code: editar arquivos. No frontend, a extensão **Vue - Official** ajuda com `.vue`.
- Node.js 24: opcional para executar pelo Docker, recomendado se quiser instalar dependências locais para autocompletar e verificar tipos no editor. Use a linha 24, versão >=24.15.

No PowerShell, confira:

```powershell
git --version
docker version
docker compose version
```

`docker version` deve mostrar Client e Server. Se mostrar apenas Client com erro de conexão, abra o Docker Desktop e aguarde o mecanismo iniciar.

## 3. Primeira instalação: criar a pasta e clonar

Este passo é para uma máquina que ainda não possui os clones. Na sua máquina, eles já estão em `C:\Users\Blast\Documents\ChatGPT\aeroclima`; pule para a seção 9 para atualizar.

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Documents\Projetos\AeroClima"
cd "$env:USERPROFILE\Documents\Projetos\AeroClima"

git clone https://github.com/LucasPivovar/aeroclima-backend.git
git clone https://github.com/LucasPivovar/aeroclima-frontend.git
```

`git clone` baixa o projeto pela primeira vez e configura a origem no GitHub. `git pull` atualiza um clone que já existe. Mantenha os nomes das duas pastas, pois o Compose procura o frontend em `../aeroclima-frontend`.

## 4. Criar o único .env e iniciar

```powershell
cd aeroclima-backend
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Crie `.env` apenas uma vez. Não copie por cima dele ao atualizar. `.env.example` é um modelo versionado, não um segundo ambiente; `.env` é a configuração local real e fica fora do Git. Cada desenvolvedor tem a sua cópia local desse único arquivo.

`up` inicia os serviços, `--build` constrói as imagens e `-d` mantém os containers em segundo plano. O primeiro início baixa imagens e dependências. PHP, PostgreSQL e Node não precisam ser instalados no Windows para executar os containers.

| Variável | Para que serve |
|---|---|
| API_PORT | Porta da API no Windows; padrão 3000. |
| WEB_PORT | Porta do frontend no Windows; padrão 5173. |
| CORS_ORIGIN | Origem permitida para chamadas diretas à API. Se mudar WEB_PORT, ajuste esta origem também. |
| NODE_ENV, PORT | Opções para executar a API diretamente com Node; o Compose define valores internos de desenvolvimento. |
| DB_HOST, DB_PORT | Host e porta para execução direta. Dentro do Compose, a API usa `db:5432`. |
| DB_NAME, DB_USER, DB_PASSWORD | Nome do banco, usuário e senha usados pelo PostgreSQL e pela API. |

O Compose define alguns endereços internos fixos, como `http://api:3000`, porque `api` e `db` são nomes dos serviços na rede Docker. Eles não são endereços para abrir no navegador.

## 5. Confirmar que funcionou

`docker compose ps` deve mostrar api, frontend e db como `healthy`. Abra:

| Endereço | Resultado esperado |
|---|---|
| http://localhost:5173 | Página AeroClima com “Ambiente conectado”. |
| http://localhost:3000/api/v1/health | JSON com status ok e nome do serviço. |
| http://localhost:3000/api/v1/health/ready | JSON com status ok e database up. |
| http://localhost:3000/docs | Swagger; permite consultar os endpoints com Try it out → Execute. |

Se falhar:

```powershell
docker compose logs --tail=100 api frontend db
```

Readiness verifica conectividade, não a existência das futuras tabelas. Elas ainda não foram criadas.

## 6. Abrir o código e fazer a primeira alteração

No VS Code, use **Arquivo → Abrir Pasta** e selecione a pasta AeroClima que contém os dois clones. Ou, se o comando `code` estiver disponível, estando no backend:

```powershell
code ..
```

Para alterar a interface, edite `aeroclima-frontend/src/views/HomeView.vue`. Troque um texto do `<template>`, salve e veja o navegador atualizar. `<script setup lang="ts">` contém o comportamento em TypeScript; `<template>` contém a estrutura visual. O CSS geral fica em `src/assets/main.css`.

Para alterar a API, edite arquivos de `aeroclima-backend/src`. O Nest observa essa pasta e recompila/reinicia a API ao salvar. Os volumes do Compose ligam as pastas src do Windows às pastas src dos containers.

Para experimentar uma rota, adicione este método **dentro da classe AppController**, em `src/app.controller.ts` (Get já está importado):

```typescript
@Get('demo')
demo() {
  return { message: 'Minha API está funcionando' };
}
```

Depois de salvar, abra http://localhost:3000/api/v1/health/demo. O caminho inclui `/health` porque o controller já possui `@Controller('health')`. Esse exemplo é uma atividade para você fazer; não é um endpoint incluído na base.

## 7. Escrever funcionalidades novas

Na API, agrupe os arquivos por funcionalidade: por exemplo, `src/trips/` para viagens. Controller recebe requisições, service executa as operações e module liga os componentes ao Nest. Crie DTOs quando houver entradas que precisem de validação. Regras de domínio podem ganhar seus próprios arquivos à medida que aparecerem.

Para usar o gerador do Nest, estando no backend:

```powershell
docker compose exec api npx nest generate module trips
docker compose exec api npx nest generate controller trips --no-spec
docker compose exec api npx nest generate service trips --no-spec
```

O gerador grava em src, que está montado na máquina; os arquivos permanecem depois de parar o container. `--no-spec` evita testes vazios gerados automaticamente. Escreva testes para o comportamento real quando implementar os casos de uso. Esses comandos são para quando vocês começarem viagens; a base não contém esse módulo ainda.

No frontend, novas páginas entram em `src/views/`; registre seus caminhos em `src/router/index.ts`. Componentes reutilizáveis podem entrar em `src/components/` quando necessários. Chamadas HTTP ficam em `src/services/`. Pinia já está registrado em src/main.ts; criem stores em src/stores/ quando uma funcionalidade precisar compartilhar estado entre páginas.

## 8. Testar e instalar dependências

Na pasta do backend, execute:

```powershell
docker compose exec api npm run build
docker compose exec api npm test
docker compose exec api npm run lint
docker compose exec frontend npm run build
docker compose exec frontend npm test
docker compose exec frontend npm run lint
```

`build` verifica a compilação (e os tipos no Vue), `test` executa os testes, `lint` procura problemas nos scripts. `format` formata o código; `format:check` apenas confere. No backend, `npm run test:e2e` executa só os testes HTTP; `npm test` já inclui esses testes.

Oxlint inspeciona JavaScript/TypeScript, incluindo scripts de arquivos Vue ([documentação](https://oxc.rs/docs/guide/usage/linter)). A checagem de tipos/template Vue é feita por vue-tsc no build ([documentação Vue](https://vuejs.org/guide/typescript/overview)). Configurações de lint mais específicas podem ser acrescentadas quando houver uma necessidade concreta.

Para dependências locais e autocompletar no VS Code, instale Node 24 e rode `npm ci` uma vez em cada repositório. Isso cria `node_modules` no Windows; o container tem sua própria instalação Linux. Não monte node_modules do Windows dentro do container.

Ao adicionar uma biblioteca, faça `npm install NOME` na pasta do projeto correspondente e versione package.json e package-lock.json. Ao receber mudanças de dependências do amigo, use `npm ci` para alinhar sua instalação local. Em ambos os casos, reconstrua com `docker compose up --build -d` na pasta do backend.

## 9. Atualizar um projeto que já foi clonado

Primeiro confira `git status` em cada repositório. Se tiver trabalho em andamento, faça um commit na sua branch antes de atualizar; não descarte alterações para conseguir executar pull.

Na sua máquina, a sequência para atualizar main é:

```powershell
cd "C:\Users\Blast\Documents\ChatGPT\aeroclima\aeroclima-backend"
git switch main
git pull --ff-only

cd ..\aeroclima-frontend
git switch main
git pull --ff-only

cd ..\aeroclima-backend
docker compose up --build -d
```

No computador do amigo, use a pasta onde ele fez os clones. Não recrie o `.env`.

## 10. Trabalhar com Git

Execute Git dentro do repositório que você alterou. Para começar uma tarefa a partir de main atualizado:

```powershell
git switch -c codex/cadastro-viagens
```

Depois de editar e testar:

```powershell
git status
git add .
git commit -m "feat: iniciar cadastro de viagens"
git push -u origin codex/cadastro-viagens
```

Abra um pull request no GitHub para revisão. Se a tarefa mexer nos dois projetos, cada um terá seu commit/branch/pull request. `.env`, node_modules, dist e logs não entram no commit. GitHub Actions executa as verificações configuradas automaticamente.

## 11. Parar e iniciar novamente

```powershell
docker compose down
docker compose up -d
```

`down` preserva o banco no volume. `down -v` apaga o volume e seus dados. Reiniciar containers não exige novo clone ou outro `.env`. Quando houver mudanças de dependências/configuração, use `up --build -d`.

## 12. Entender cada arquivo

### Arquivos com a mesma função nos dois repositórios

| Arquivo | Função | Quando editar |
|---|---|---|
| Dockerfile | Receita da imagem Linux: usa Node fixado por digest, instala dependências com npm ci, copia o projeto e inicia o modo de desenvolvimento. | Ao alterar como o ambiente é construído/executado. |
| .dockerignore | Exclui arquivos do contexto de build, especialmente .env, node_modules local, dist e Git. | Ao adicionar arquivos que não devem ir para a imagem. |
| package.json | Lista bibliotecas e comandos npm. | Ao adicionar bibliotecas ou comandos. |
| package-lock.json | Registra versões exatas de dependências e subdependências. É extenso porque lista as bibliotecas, não porque contém código do app. | Deixe o npm atualizar; não edite à mão. |
| .gitignore | Impede versionar segredos locais e arquivos gerados. | Ao surgir um novo arquivo local/gerado. |
| .gitattributes | Padroniza quebras de linha no Git para Windows/Linux. Backend também marca PNG como binário. | Raramente. |
| .prettierrc (backend) / .prettierrc.json (frontend) | Regras de formatação, como aspas e ponto e vírgula. | Ao combinar um padrão com a equipe. |
| .oxlintrc.json | Regras do linter. No frontend inclui scripts Vue; no backend verifica TypeScript. | Ao ajustar verificações de código. |
| README.md | Entrada rápida para executar o projeto. | Quando mudar a forma de executar. |
| .github/workflows/ci.yml | Verificações automáticas no GitHub: compilação, lint, formatação, testes e build Docker. | Ao mudar os comandos de validação. |

### Backend: todos os arquivos específicos

| Arquivo | Função |
|---|---|
| .env | Sua configuração local. É o único arquivo de ambiente real dos projetos. |
| .env.example | Modelo para cada pessoa criar sua cópia de .env. |
| compose.yaml | Declara os três serviços, portas, variáveis, volumes, ordem de início e health checks. |
| nest-cli.json | Diz ao CLI do Nest onde fica src e como organizar/compilar o projeto. |
| tsconfig.json | Configuração TypeScript para Nest: tipos estritos, módulos e decorators. |
| tsconfig.build.json | Ajuste de compilação que inclui só src e exclui testes. Isso impede enviar testes para dist. |
| vitest.config.ts | Única configuração dos testes unitários e HTTP do backend. |
| src/main.ts | Ponto de entrada: cria o Nest, aplica configuração e inicia a porta. |
| src/app.module.ts | Módulo principal: registra configuração, controller e conexão do banco. Novos módulos entram aqui. |
| src/app.controller.ts | Rotas HTTP de saúde. Usa DatabaseService no readiness. |
| src/setup-app.ts | Configura prefixo da API, validação de entradas, CORS, headers e Swagger. |
| src/config/environment.ts | Valida variáveis obrigatórias e portas antes de iniciar. |
| src/config/environment.spec.ts | Testa configurações válidas e inválidas sem depender do Docker. |
| src/database/database.service.ts | Gerencia pool PostgreSQL, verifica conexão e fecha o pool ao encerrar. Não cria tabelas. |
| test/app.e2e-spec.ts | Testa endpoints e Swagger por HTTP, usando acesso ao banco simulado. |
| docs/BANCO.md | Explica a proposta de tabelas e relações. |
| docs/banco-de-dados.png | Imagem do banco para implementação manual. |
| docs/GUIA.md | Este passo a passo e explicação dos arquivos. |

### Frontend: todos os arquivos específicos

| Arquivo | Função |
|---|---|
| index.html | HTML inicial com título, favicon e elemento #app. |
| public/favicon.svg | Ícone da aba do navegador; arquivos em public são servidos diretamente. |
| env.d.ts | Habilita os tipos do Vite para TypeScript. Não é um arquivo .env nem guarda configuração/segredos. |
| tsconfig.json | Única configuração TypeScript do frontend: inclui Vue, scripts, testes e configs Vite/Vitest. |
| vite.config.ts | Plugin Vue, alias @ para src, porta 5173, atualização de código e proxy para API. |
| vitest.config.ts | Configura testes Vue em jsdom, reaproveitando o plugin/alias do Vite. |
| src/main.ts | Cria a aplicação Vue, registra Pinia/router, carrega CSS e monta App em #app. |
| src/App.vue | Componente raiz que exibe a página escolhida pelo router. |
| src/router/index.ts | Mapeia caminhos de navegação às páginas; hoje só existe a página inicial. |
| src/views/HomeView.vue | Página mínima de boas-vindas; substituam pelo primeiro recurso do produto. |
| src/assets/main.css | Estilos gerais e adaptação para telas menores. |
| src/services/api.ts | Cliente HTTP dos endpoints de saúde, com timeout e tratamento de falha. |
| src/services/__tests__/api.spec.ts | Testa caminho das chamadas e respostas de erro. |


### Pastas geradas: por que aparecem tantos arquivos?

| Pasta/arquivo | O que é |
|---|---|
| .git/ | Histórico e dados internos do Git. Não edite seus arquivos manualmente. |
| node_modules/ | Bibliotecas instaladas pelo npm; pode conter milhares de arquivos. Não é código escrito pela equipe. |
| dist/ | Resultado gerado pelo build. Edite src, não dist. |
| coverage/ | Relatórios de cobertura quando executar esse tipo de teste. |
| *.tsbuildinfo, logs | Cache de compilação e diagnósticos gerados pelas ferramentas. |

Na pasta original da sua máquina, `tmp/` e `output/` vieram também da extração de frames do vídeo. Não pertencem aos dois repositórios da aplicação e não são baixados pelo seu amigo. O README e Compose da pasta pai são atalhos locais; a configuração compartilhada está no repositório backend.

No cotidiano, concentre-se em **src de cada projeto, testes e .env**. Configurações de ferramentas mudam com menos frequência.


## 13. Dividir funcionalidades entre duas pessoas

Cada pessoa roda a mesma base no próprio computador. Não precisam de VPS para isso. Combinem uma funcionalidade completa por pessoa, por exemplo: uma implementa viagens (API e tela), outra implementa lugares (API e tela). Antes de começar, combinem nomes de campos, URLs, tipos das respostas e quem altera arquivos compartilhados, como router/index.ts e app.module.ts.

Em cada repositório que sua tarefa usar, partam da main atualizada e criem uma branch própria:

```powershell
git switch main
git pull --ff-only
git switch -c codex/viagens
```

Desenvolvam, validem e enviem sua branch:

```powershell
git add .
git commit -m "feat: adicionar viagens"
git push -u origin codex/viagens
```

Abram um pull request para main. A outra pessoa revisa e vocês fazem o merge quando as verificações passarem. Se houver API e tela, abram um PR em cada repositório. Para começar outra tarefa, voltem à main, executem git pull --ff-only e criem uma nova branch. Não alternem branches com alterações pendentes: façam commit primeiro.

Depois de atualizar os dois clones, na pasta do backend:

```powershell
docker compose up --build -d
```

Esse comando instala automaticamente as dependências versionadas nos lockfiles e inicia os serviços. Não precisa instalar globalmente Nest, Vue, PostgreSQL ou bibliotecas individuais. Docker e Git continuam necessários em cada máquina; Node local é opcional para suporte do editor.

O Git compartilha código, não os dados do PostgreSQL de cada computador. Quando criarem tabelas manualmente, salvem o SQL correspondente em docs/sql/ na mesma tarefa e expliquem como executá-lo. A outra pessoa executa o mesmo SQL no próprio banco. A base não cria nem aplica scripts de tabelas automaticamente.

## 14. Bibliotecas da base

Frontend: Vue + TypeScript para componentes, Vue Router para navegação, Pinia já registrado para estado compartilhado, Fetch nativo para HTTP e proxy do Vite para a API. Vitest e Vue Test Utils para testes; Oxlint e Prettier para lint e formatação.

Backend: NestJS + Express, configuração de ambiente validada, class-validator e class-transformer para entradas, Swagger para documentação, Helmet e CORS, pg para conexão e pool PostgreSQL. Vitest, Supertest, Oxlint e Prettier para verificações. Docker fornece Node e PostgreSQL.

A infraestrutura está pronta para começar as funcionalidades. Autenticação, biblioteca de mapas e cache offline ainda exigem decisões de implementação; não há integração fictícia pronta. Quando decidirem uma biblioteca nova, uma pessoa a adiciona, envia package.json e package-lock.json no mesmo PR, e a outra só atualiza o clone e reconstrói o Docker. Não é possível prever todas as dependências futuras, mas a instalação fica reproduzível para os dois.
