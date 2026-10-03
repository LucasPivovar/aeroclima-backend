# AeroClima — instalar em outro PC e começar a desenvolver

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

Não instale PostgreSQL no Windows: o serviço db do Docker já é PostgreSQL. O desenho em docs/banco-de-dados.png é somente uma proposta visual. Nenhuma tabela é criada ao iniciar.

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

## 8. Desenvolver e verificar

Na pasta backend:

```powershell
code ..
```

Isso abre os dois clones no VS Code, se o comando code estiver disponível. Também pode usar Arquivo > Abrir pasta no editor.

Editem frontend/src/views/HomeView.vue para a interface; frontend/src/main.ts inicia Vue e chama a API. Novas páginas vão em views/, rotas em router/, componentes em components/ quando necessários, stores Pinia em stores/ e chamadas em services/.

No backend, src/main.ts inicia Nest; src/app.controller.ts tem saúde; novos módulos de funcionalidades entram em src/ e são registrados em app.module.ts. TravelProvidersService está registrado para injeção nos serviços futuros. Não há endpoints de busca ou telas criadas agora.

Salvem e vejam o resultado: não reconstruam as imagens para cada mudança em src. Para validar, na pasta backend:

```powershell
docker compose exec api npm run build
docker compose exec api npm test
docker compose exec api npm run lint
docker compose exec api npm run format:check
docker compose exec frontend npm run build
docker compose exec frontend npm test
docker compose exec frontend npm run lint
docker compose exec frontend npm run format:check
```

Para o editor reconhecer as bibliotecas, opcionalmente instalem Node 24 e executem npm ci em cada clone. Isso não muda o modo de execução Docker. node_modules é gerado localmente e não vai para GitHub.

## 9. Trabalhar diretamente na main

Vocês podem trabalhar sem criar branches. Combinem quem mexe em cada funcionalidade e evitem editar os mesmos arquivos simultaneamente. Quem alterar app.module.ts, router/index.ts ou package.json avisa a outra pessoa.

Antes de começar, com o clone sem alterações pendentes, em cada repositório:

```powershell
git status
git pull --ff-only
```

Depois de desenvolver e verificar, no repositório alterado:

```powershell
git add .
git commit -m "feat: descrever a funcionalidade implementada"
git pull --no-rebase --no-edit
git push origin main
```

O pull depois do commit traz commits que o colega enviou enquanto você trabalhava, criando merge se necessário. --no-edit mantém a mensagem automática do merge. Se houver conflito, o Git pausa: abra os arquivos apontados, combine o resultado, remova os marcadores de conflito, valide e execute git add . e git commit -m "merge: conciliar alterações da equipe". Só então faça push. Não use push --force para resolver rejeição.

Se o push for rejeitado porque o colega acabou de enviar algo, faça git pull --no-rebase --no-edit novamente, resolva conflitos se houver, valide e tente o push. Se o GitHub tiver regras exigindo PR, push direto depende dessas regras serem ajustadas pelo dono do repositório.

Frontend e backend são repositórios separados: faça commit/pull/push em cada um que alterou. Cada pessoa deve ter acesso de colaborador aos dois. Na main, um código incompleto fica disponível para o colega assim que você faz push; combinem entregas que continuem rodando.

## 10. Receber atualizações e dependências

Com o trabalho salvo em commits, atualize os dois clones. Se estiverem sem commits locais pendentes:

```powershell
cd ..\aeroclima-frontend
git pull --ff-only
cd ..\aeroclima-backend
git pull --ff-only
docker compose up --build -d
```

O último comando reinstala automaticamente as dependências alteradas nos lockfiles. Não é preciso a outra pessoa instalar cada biblioteca. Quando adicionarem uma dependência, quem faz a mudança envia package.json e package-lock.json no mesmo commit. Não enviem node_modules, dist ou .env. Configurações fora de src também precisam de reconstrução/reinício para chegar aos containers.

## 11. Encerrar e retomar

Na pasta backend:

```powershell
docker compose down
docker compose up -d
```

Down para os serviços e preserva os dados. Up inicia novamente. Não use down -v se quiser manter o banco: -v remove o volume e apaga os dados.

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
| src/integrations/integrations.module.ts | Exporta os clientes de integrações para os futuros módulos Nest. |
| src/integrations/travel-providers.service.ts | Clientes HTTP de clima, cidades, endereços, pontos turísticos, hotéis e rotas; sem endpoints públicos. |
| src/integrations/travel-providers.service.spec.ts | Testa timeout, chave, coordenadas e falhas sem chamadas reais aos fornecedores. |
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
| src/main.ts | Registra Pinia/router, monta Vue e faz fetch de saúde da API; resultado no console. |
| src/App.vue | Componente raiz que exibe a página escolhida pelo router. |
| src/router/index.ts | Mapeia caminhos de navegação às páginas; hoje só existe a página inicial. |
| src/views/HomeView.vue | Somente H1 AeroClima. |
| src/assets/main.css | Estilos gerais e adaptação para telas menores. |
| src/services/api.ts | Fetch dos endpoints de saúde, com timeout e tratamento de falha. |
| src/services/maps.ts | Inicializa MapLibre sob demanda, sem criar mapa na página inicial. |
| src/services/offline.ts | Grava/lê registros em IndexedDB com idb. |
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




## 13. Mapas, clima e buscas preparados

| Recurso | Base preparada | O que ainda precisa |
|---|---|---|
| Exibir mapa | maplibre-gl instalado; createMap em services/maps.ts, com CSS carregado sob demanda. | Criar tela/container e passar URL de estilo de um fornecedor. Destruir o mapa com map.remove ao desmontar a página. |
| Armazenar dados offline | idb instalado; saveOfflineRecord/readOfflineRecord em services/offline.ts. | Implementar downloads, cobertura, limites, sincronização e dados que o fornecedor permita armazenar. |
| Clima | TravelProvidersService.weather, via Fetch/Open-Meteo, sem chave no endpoint de desenvolvimento. | Criar contrato, endpoint da aplicação e tela quando desenvolver essa funcionalidade. |
| Cidades | TravelProvidersService.cities, via geocoding Open-Meteo. | Criar endpoint e interface de busca; esse serviço não busca hotéis. |
| Endereços | TravelProvidersService.addresses, via Geoapify. | Configurar a chave e desenvolver endpoint/interface. |
| Pontos turísticos | TravelProvidersService.places com tourism.sights. | Configurar a chave; busca inicial em raio de 5 km, até 20 resultados. |
| Hotéis | TravelProvidersService.places com accommodation.hotel. | Configurar a chave; são lugares, não preços/disponibilidade/reservas. |
| Rotas | TravelProvidersService.route, via Geoapify, modo carro. | Configurar a chave e desenvolver endpoint/interface. Não calcula novas rotas sem internet. |

APIs HTTP não precisam de um pacote npm separado: o Node já tem fetch. Os clientes têm timeout e mensagens de falha sem expor a chave. Ainda retornam o JSON externo como unknown; cada funcionalidade deve definir e validar seu contrato antes de expor dados ao frontend. Nenhuma API paga é chamada ao abrir a página inicial.

Para ativar Geoapify:

1. Acesse https://myprojects.geoapify.com/ e crie sua conta/projeto.
2. Gere uma API key e confira o plano, créditos e limites no painel. Cada pessoa pode usar seu próprio projeto de desenvolvimento.
3. No único .env, preencha GEOAPIFY_API_KEY. Não publique a chave no GitHub.
4. Na pasta backend, execute docker compose up --build -d para aplicar a variável ao container.
5. Injete TravelProvidersService nos módulos de busca/rotas quando os desenvolver. Esses métodos não têm endpoints públicos nesta base.

Open-Meteo permite o endpoint gratuito para uso não comercial, com limites. Para uso comercial, revise o plano/endpoint contratado antes de publicar. Atribuições e condições dos fornecedores devem acompanhar as telas quando implementadas.

MapLibre é o renderizador, não um serviço que entrega automaticamente dados de mapas. Não há mapa carregado nem fornecedor de tiles contratado agora. O armazenamento idb também não transforma o mapa em offline completo: baixar regiões/rotas e usar tiles offline é trabalho posterior, conforme permissões do fornecedor. Não use tiles públicos para downloads em massa sem autorização.

Google Places é uma alternativa para busca de lugares/hotéis, com API key e billing. Quando resultados são exibidos sobre mapa, a política exige Google Map. Por isso, esta base usa Geoapify e não integra Google Places com MapLibre. Busca de passagens, tarifas de hotéis ou reservas exige APIs específicas de fornecedores; não está pronta nesta base.

Referências oficiais:

- MapLibre: https://maplibre.org/maplibre-gl-js/docs/
- IndexedDB/idb: https://github.com/jakearchibald/idb
- Open-Meteo: https://open-meteo.com/en/docs e https://open-meteo.com/en/terms
- Geocoding Open-Meteo: https://open-meteo.com/en/docs/geocoding-api
- Geoapify Places: https://apidocs.geoapify.com/docs/places/
- Geoapify Routing: https://apidocs.geoapify.com/docs/routing/
- Google Places: https://developers.google.com/maps/documentation/places/web-service/usage-and-billing
- Política Google Places: https://developers.google.com/maps/documentation/places/web-service/policies
