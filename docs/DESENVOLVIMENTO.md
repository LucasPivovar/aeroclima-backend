# Desenvolvimento — AeroClima

## 1. Iniciar e editar

Abra Docker Desktop. Na pasta backend:

```powershell
docker compose up -d
code ..
```

Frontend: http://localhost:5173, apenas H1 AeroClima. Backend: http://localhost:3000, mensagem de confirmação. Saúde: /api/v1/health; conexão PostgreSQL: /api/v1/health/ready; Swagger: /docs.

src/main.ts do frontend registra Vue/Router/Pinia e chama getHealth. O fetch está em src/services/api.ts; Vite encaminha /api ao Nest. O resultado aparece em F12 > Console, sem dados extras na tela.

Editem src/views/HomeView.vue para a interface. Páginas vão em views/, rotas em router/, stores compartilhadas em stores/ e componentes em components/ quando necessários. Nest começa em src/main.ts; controllers recebem requisições, services concentram comportamento, modules organizam as dependências. Criem módulos por funcionalidade quando forem implementá-las.

Salvar arquivos src atualiza Vue e reinicia Nest. Alterações em dependências/configurações precisam de docker compose up --build -d. Cada pessoa tem seu banco local; SQL manual precisa ser compartilhado e aplicado conforme INSTALACAO.md.

## 2. Verificar, atualizar e encerrar

Sem testes unitários ou ferramentas de teste nesta base: vocês vão adicioná-los quando aprenderem e desenvolverem as funcionalidades. A integração contínua verifica build, lint, formatação e imagem Docker.

Na pasta backend:

```powershell
docker compose exec api npm run lint
docker compose exec api npm run format:check
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
docker compose exec frontend npm run format:check
```

Não rode nest build dentro do container enquanto ele está observando src: os dois podem escrever em dist. Para validar normalmente, com Node e dependências locais instaladas, execute npm.cmd run build e npm.cmd run lint em cada clone; isso usa dist local, separado do container.

Recebeu novos package-lock.json? Execute npm.cmd ci em cada clone alterado para atualizar o editor e docker compose up --build -d na pasta backend para atualizar containers. Quem instala uma biblioteca usa npm.cmd install nome-do-pacote e envia package.json e package-lock.json juntos. A outra pessoa não precisa descobrir versões ou instalar bibliotecas individualmente.

```powershell
docker compose logs --tail=100 api frontend db
docker compose down
docker compose up -d
```

Down preserva dados. Down -v apaga o volume PostgreSQL: não use se quiser manter dados. Os healthchecks do Compose permanecem: são verificações operacionais de disponibilidade dos serviços, não testes unitários.

## 3. Entender cada arquivo

### Arquivos com a mesma função nos dois repositórios

| Arquivo | Função | Quando editar |
|---|---|---|
| Dockerfile | Receita da imagem Linux: usa Node fixado por digest, instala dependências com npm ci, copia o projeto e inicia o modo de desenvolvimento. | Ao alterar como o ambiente é construído/executado. |
| .dockerignore | Exclui arquivos do contexto de build, especialmente .env, node_modules local, dist e Git. | Ao adicionar arquivos que não devem ir para a imagem. |
| package.json | Lista bibliotecas e comandos npm. | Ao adicionar bibliotecas ou comandos. |
| package-lock.json | Registra versões exatas de dependências e subdependências. É extenso porque lista as bibliotecas, não porque contém código do app. | Deixe o npm atualizar; não edite à mão. |
| .gitignore | Impede versionar segredos locais e arquivos gerados. | Ao surgir um novo arquivo local/gerado. |
| .gitattributes | Padroniza quebras de linha no Git para Windows/Linux. | Raramente. |
| .prettierrc (backend) / .prettierrc.json (frontend) | Regras de formatação, como aspas e ponto e vírgula. | Ao combinar um padrão com a equipe. |
| .oxlintrc.json | Regras do linter. No frontend inclui scripts Vue; no backend verifica TypeScript. | Ao ajustar verificações de código. |
| README.md | Entrada rápida para executar o projeto. | Quando mudar a forma de executar. |
| .github/workflows/ci.yml | Verificações automáticas no GitHub: compilação, lint, formatação e build Docker. | Ao mudar os comandos de validação. |

### Backend: todos os arquivos específicos

| Arquivo | Função |
|---|---|
| .env | Sua configuração local. É o único arquivo de ambiente real dos projetos. |
| .env.example | Modelo para cada pessoa criar sua cópia de .env. |
| compose.yaml | Declara os três serviços, portas, variáveis, volumes, ordem de início e health checks. |
| nest-cli.json | Diz ao CLI do Nest onde fica src e como organizar/compilar o projeto. |
| tsconfig.json | Configuração TypeScript para Nest: tipos estritos, módulos e decorators. |
| tsconfig.build.json | Ajuste de compilação que inclui só src e exclui testes. Isso impede enviar testes para dist. |
| src/main.ts | Ponto de entrada: cria o Nest, aplica configuração e inicia a porta. |
| src/app.module.ts | Módulo principal: registra configuração, controller e conexão do banco. Novos módulos entram aqui. |
| src/app.controller.ts | Resposta na raiz e rotas HTTP de saúde. Usa DatabaseService no readiness. |
| src/integrations/integrations.module.ts | Exporta os clientes de integrações para os futuros módulos Nest. |
| src/integrations/travel-providers.service.ts | Clientes HTTP de clima, cidades, endereços, pontos turísticos, hotéis e rotas; sem endpoints públicos. |
| src/setup-app.ts | Configura prefixo da API, validação de entradas, CORS, headers e Swagger. |
| src/config/environment.ts | Valida variáveis obrigatórias e portas antes de iniciar. |
| src/database/database.service.ts | Gerencia pool PostgreSQL, verifica conexão e fecha o pool ao encerrar. Não cria tabelas. |
| docs/BANCO.md | Proposta textual do banco; nenhuma tabela é criada. |
| docs/INSTALACAO.md | Instalação em outro PC, Docker, dependências locais e acesso ao banco. |
| docs/DESENVOLVIMENTO.md | Fluxo de desenvolvimento, arquivos e integrações. |
| docs/DOCUMENTACAO.md | Git/GitHub, modelos de commit, versões e documentação de funcionalidades. |

### Frontend: todos os arquivos específicos

| Arquivo | Função |
|---|---|
| index.html | HTML inicial com título, favicon e elemento #app. |
| public/favicon.svg | Ícone da aba do navegador; arquivos em public são servidos diretamente. |
| env.d.ts | Habilita os tipos do Vite para TypeScript. Não é um arquivo .env nem guarda configuração/segredos. |
| tsconfig.json | Configuração TypeScript do Vue/Vite, aliases e tipos do Node. |
| vite.config.ts | Plugin Vue, alias @ para src, porta 5173, atualização de código e proxy para API. |
| src/main.ts | Registra Pinia/router, monta Vue e faz fetch de saúde da API; resultado no console. |
| src/App.vue | Componente raiz que exibe a página escolhida pelo router. |
| src/router/index.ts | Mapeia caminhos de navegação às páginas; hoje só existe a página inicial. |
| src/views/HomeView.vue | Somente H1 AeroClima. |
| src/assets/main.css | Estilos gerais e adaptação para telas menores. |
| src/services/api.ts | Fetch dos endpoints de saúde, com timeout e tratamento de falha. |
| src/services/maps.ts | Inicializa MapLibre sob demanda, sem criar mapa na página inicial. |
| src/services/offline.ts | Grava/lê registros em IndexedDB com idb. |

### Pastas geradas: por que aparecem tantos arquivos?

| Pasta/arquivo | O que é |
|---|---|
| .git/ | Histórico e dados internos do Git. Não edite seus arquivos manualmente. |
| node_modules/ | Bibliotecas instaladas pelo npm; pode conter milhares de arquivos. Não é código escrito pela equipe. |
| dist/ | Resultado gerado pelo build. Edite src, não dist. |
| *.tsbuildinfo, logs | Cache de compilação e diagnósticos gerados pelas ferramentas. |

Na pasta original da sua máquina, `tmp/` e `output/` vieram também da extração de frames do vídeo. Não pertencem aos dois repositórios da aplicação e não são baixados pelo seu amigo. O README e Compose da pasta pai são atalhos locais; a configuração compartilhada está no repositório backend.

No cotidiano, concentre-se em **src de cada projeto e .env**. Configurações de ferramentas mudam com menos frequência.

## 4. Mapas, clima e buscas preparados

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

## 5. Se o Nest registrar EADDRINUSE no container

Confira docker compose logs --tail=100 api. O start:dev usa --no-shell para o Nest encerrar diretamente o processo Node anterior ao recompilar. Se houver um processo antigo de uma execução anterior à correção, execute docker compose restart api para limpar e reiniciar o watcher. Não inicie npm run start:dev duas vezes dentro do mesmo container. Se o erro vier do Docker ao publicar a porta no Windows, outro programa está usando a porta local: encerre-o ou ajuste API_PORT no .env.
