# Instalação — AeroClima

Base local: Vue + TypeScript, NestJS + TypeScript e PostgreSQL. A tela tem somente H1 AeroClima. O frontend chama a rota de saúde da API por fetch ao iniciar. Não há telas de produto, CRUD ou tabelas automáticas. Um único .env no backend.

## 1. O que baixar no Windows

Obrigatório:

- Git: https://git-scm.com/downloads/win — para clone, pull, commit e push.
- Docker Desktop: https://docs.docker.com/desktop/setup/install/windows-install/ — para executar Node, frontend, backend e PostgreSQL nos containers.
- Um editor, por exemplo VS Code: https://code.visualstudio.com/ — para editar o projeto. Instale a extensão Vue - Official para os arquivos Vue.
- Conta GitHub e acesso de colaborador aos dois repositórios, para conseguir fazer push.

Não é necessário instalar PostgreSQL, Node, npm, Vue ou Nest separadamente para rodar pelo Docker. Node 24 (>=24.15 e <25) é opcional para instalar dependências locais e ajudar o editor com tipos e autocompletar. Não há uma distribuição Ubuntu separada exigida por este projeto; no Windows, Docker Desktop precisa do WSL 2 e virtualização habilitados.

Abra o Docker Desktop. Se faltar WSL, abra PowerShell como administrador, execute `wsl --install`, reinicie e siga a configuração do Docker Desktop. Se houver erro de virtualização, habilite Intel VT-x ou AMD SVM na BIOS/UEFI. Aguarde o Docker mostrar que o engine está rodando.

Depois, no PowerShell normal:

```powershell
git --version
docker version
docker compose version
```

Docker version deve mostrar Client e Server sem erro. Não prossiga com os containers se o engine ainda estiver desligado.

## 2. Configurar quem fará os commits

Substitua os exemplos pelo nome e email da pessoa que está usando o computador:

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@example.com"
git config --global --get user.name
git config --global --get user.email
```

Use um email cadastrado no GitHub ou o email privado noreply informado em GitHub > Settings > Emails. Nome/email identificam os commits; não fazem login nem concedem permissão de push. No primeiro push por HTTPS, o Git Credential Manager normalmente abre o login do GitHub no navegador. Entre na conta com acesso aos repositórios. Não coloque senha ou token nos arquivos do projeto.

## 3. Criar a pasta e baixar pela primeira vez

No PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\Documents\Projetos\AeroClima"
cd "$env:USERPROFILE\Documents\Projetos\AeroClima"
git clone https://github.com/LucasPivovar/aeroclima-backend.git
git clone https://github.com/LucasPivovar/aeroclima-frontend.git
cd aeroclima-backend
Copy-Item .env.example .env
```

Clone baixa um repositório pela primeira vez. Pull atualiza um clone que já existe. Não execute clone novamente dentro de um projeto existente. Copie o .env apenas na primeira instalação, para não substituir suas configurações.

Estrutura necessária:

```text
AeroClima/
  aeroclima-backend/
    .env
    compose.yaml
    src/
  aeroclima-frontend/
    src/
```

Os dois clones devem ficar lado a lado com esses nomes. A pasta que reúne os clones não precisa ser um terceiro repositório Git.

## 4. Entender o único .env

Abra aeroclima-backend/.env no editor. Os valores de desenvolvimento já permitem iniciar o ambiente:

| Variável | Uso |
|---|---|
| API_PORT | Porta da API no Windows; padrão 3000. |
| WEB_PORT | Porta do frontend no Windows; padrão 5173. |
| CORS_ORIGIN | Endereço permitido para o frontend; padrão http://localhost:5173. |
| DB_NAME, DB_USER, DB_PASSWORD | Nome, usuário e senha do PostgreSQL local. |
| NODE_ENV, PORT, DB_HOST, DB_PORT | Configuração para execução Node direta. No Docker, Compose usa api:3000 e db:5432 internamente. |
| GEOAPIFY_API_KEY | Chave opcional de busca de lugares, endereços e rotas; em branco, a base continua iniciando. |

.env.example é somente o modelo compartilhado. .env é local e ignorado pelo Git. Nenhuma senha/chave de serviço privado deve ir para Vue ou para GitHub. Cada pessoa cria o próprio .env.

## 5. Iniciar frontend, backend e banco

Com Docker Desktop aberto, dentro de aeroclima-backend:

```powershell
docker compose up --build -d
docker compose ps
```

Não precisa clicar em Run de cada container na interface do Docker. O comando cria as imagens, instala as dependências com npm ci, inicia PostgreSQL, aguarda a API ficar saudável e inicia Vue. Na primeira vez baixa as imagens e pacotes, então precisa de internet e pode demorar. -d deixa os containers rodando em segundo plano.

Abra:

- Frontend: http://localhost:5173 — somente H1 AeroClima.
- Início da API: http://localhost:3000 — mensagem AeroClima API.
- API de saúde: http://localhost:3000/api/v1/health — status ok.
- API com banco: http://localhost:3000/api/v1/health/ready — database up.
- Swagger: http://localhost:3000/docs — documentação das rotas existentes.

No navegador da página, pressione F12 e abra Console: deve aparecer AeroClima API com o objeto retornado pelo backend. Na aba Network aparece o GET /api/v1/health. A chamada sai de src/main.ts, usa fetch em src/services/api.ts e passa pelo proxy do Vite. Por ser TypeScript, o ponto de entrada é main.ts, compilado para JavaScript pelo Vite; não precisa criar main.js paralelo.

Para investigar erros:

```powershell
docker compose logs --tail=100 api frontend db
```

Se faltar .env, faça a cópia do passo 3. Se o Docker engine estiver desligado, abra Docker Desktop. Se uma porta estiver ocupada, libere-a ou ajuste as portas no .env; ao mudar WEB_PORT, atualize também CORS_ORIGIN. Se mudar a senha de um banco já inicializado, precisa alterar a senha no PostgreSQL: editar o .env sozinho não altera um volume existente.

## 6. Banco vazio agora; SQL escrito por vocês depois

Não instale PostgreSQL no Windows: o serviço db do Docker já é PostgreSQL. docs/BANCO.md contém a proposta textual. Nenhuma tabela é criada ao iniciar.

Para entrar no banco, usando os nomes padrão do .env:

```powershell
docker compose exec db psql -U aeroclima -d aeroclima
```

Dentro do psql:

```text
\dt
\q
```

O primeiro comando lista tabelas; por enquanto não há tabelas da aplicação. O segundo sai. Quando vocês escreverem o SQL, salvem por exemplo em docs/sql/001-tabelas.sql e enviem pelo GitHub. Só depois de o arquivo existir, apliquem no banco local, na pasta backend:

```powershell
Get-Content -Raw .\docs\sql\001-tabelas.sql | docker compose exec -T db psql -U aeroclima -d aeroclima -v ON_ERROR_STOP=1
```

Se mudaram DB_USER ou DB_NAME, substituam os nomes no comando. Esse exemplo não cria o arquivo SQL agora e não é executado automaticamente. Cada pessoa aplica os mesmos scripts no próprio banco, na ordem combinada. As alterações de banco também precisam acompanhar os commits; o Git não compartilha os dados do volume PostgreSQL.

## 7. Por que usar Docker?

Vocês poderiam rodar sem Docker: instalar a mesma versão de Node em ambos os PCs, instalar/configurar PostgreSQL, executar npm ci nos dois projetos e abrir terminais para iniciar frontend e backend. Isso funciona, mas cada pessoa precisaria manter versões, portas e serviços alinhados manualmente.

Docker executa cada serviço num container com ambiente definido pelo projeto. Dockerfile descreve Node e instalação dos pacotes; compose.yaml liga os três serviços, configura portas, rede, variáveis e volumes. package-lock.json fixa as versões npm. Assim, vocês usam a mesma receita sem instalar cada ferramenta individualmente no Windows.

O código src permanece no computador e é ligado ao container por volume: salvar no editor atualiza Vue e reinicia Nest. O banco usa um volume separado para preservar os dados. Docker padroniza o ambiente; não substitui Git, não compartilha bancos entre computadores e não exige VPS.


## 8. Dependências locais para o editor

Docker instala pacotes dentro das imagens. O VS Code no Windows precisa de node_modules nos clones locais para resolver @nestjs/config, @nestjs/common, pg, Vue e os tipos. Por isso, para desenvolver com o editor local, instale Node 24 (>=24.15 e <25), mesmo que continue executando os serviços no Docker: https://nodejs.org/en/download

Depois da instalação, feche e reabra o terminal. Na pasta backend:

```powershell
node --version
npm.cmd --version
npm.cmd ci
cd ..\aeroclima-frontend
npm.cmd ci
```

npm ci instala exatamente as versões do lockfile. Não precisa instalar cada pacote separadamente, nem instalar Nest global. Em PowerShell, npm.cmd evita bloqueios do script npm.ps1. Não execute npm ci na pasta que apenas reúne os clones, pois ela não é um projeto npm.

No VS Code, abra um arquivo .ts, pressione Ctrl+Shift+P, execute TypeScript: Select TypeScript Version e escolha Use Workspace Version. Depois execute TypeScript: Restart TS Server. No frontend, use Vue - Official. Se ainda houver imports vermelhos, confira se abriu a pasta correta e se npm ci terminou sem erro.

Na máquina atual, Node e os pacotes locais foram verificados. Em outro PC, esse passo cria os pacotes que o editor precisa. node_modules não vai para GitHub e não altera o modo de execução Docker.

Avisos de segurança: a configuração local mantém Helmet/CSP, mas não força HTTPS em localhost. A página não carrega Google Fonts. Erros citando fontes, extensões ou .well-known/appspecific/com.chrome.devtools.json devem ser identificados pela URL/coluna Initiator do Network; não significam automaticamente erro de Nest. Essa rota de descoberta do DevTools não é uma API do AeroClima. Não libere todos os domínios na CSP para esconder mensagens.

Continue em [DESENVOLVIMENTO.md](DESENVOLVIMENTO.md). Versionamento e modelos de commit estão em [DOCUMENTACAO.md](DOCUMENTACAO.md).

Referências: https://code.visualstudio.com/docs/languages/typescript e https://github.com/helmetjs/helmet
