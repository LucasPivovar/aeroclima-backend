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

Google Places é uma alternativa para busca de lugares/hotéis, com API key e billing. Quando resultados são exibidos sobre mapa, a política exige Google Map. Por isso, esta base usa Geoapify e não integra Google Places com MapLibre. Pesquisa de passagens/hotéis com redirecionamento e franquias de bagagem entram no escopo atualizado da seção 6. Tarifas automáticas dependem de acesso adequado confirmado; não estão implementadas nesta base.

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

## 6. Escopo atualizado — catálogo de descoberta e planejamento

Esta seção atualiza os briefings anteriores. AeroClima reúne cidades, aeroportos, passagens, hospedagens, atrações e experiências para ajudar a planejar uma viagem. A compra/reserva acontece no site externo; o usuário depois registra manualmente o que contratou no AeroClima. Abrir um link não confirma compra, pagamento ou reserva. Autenticação, offline e proteção continuam no bloco final.

### 6.1. Fluxo principal

Pesquisar destino → explorar hotéis/atrações/experiências e opções de transporte → abrir site externo para consultar preços/comprar → cadastrar voo, hospedagem ou atividade na viagem → organizar roteiro, deslocamentos, mapa e lembretes.

O catálogo e o planejamento são separados: hotel descoberto é um lugar; hospedagem contratada é stays. Atração descoberta é um lugar; passeio agendado é activities. Aeroporto é catálogo; voo contratado é flights. Nada passa automaticamente a comprado porque o usuário abriu um site.

### 6.2. Fontes e dependências

| Recurso | Fonte/base da primeira versão | Limite e alternativa |
|---|---|---|
| Aeroportos | OurAirports, catálogo importado gratuitamente. | Não fornece tarifas ou disponibilidade de passagens. |
| Cidades, hotéis e pontos turísticos | Geoapify Geocoding, Places e Place Details no plano Free. | Chave necessária; cota e atribuição do fornecedor. Campos e cobertura podem estar incompletos. |
| Fotos e enriquecimento de atrações | Wikidata para identificar o lugar; Wikimedia Commons/MediaWiki para mídia e metadados. | Não há garantia de fotos de todo hotel/passeio. Confirmar identidade, autor, licença e atribuição de cada arquivo. |
| Fotos comerciais de hotel/passeio | Material autorizado pelo estabelecimento/operador ou API de parceiro aprovada. | Não copiar automaticamente galerias do Booking, Google ou de qualquer site só porque uma imagem está acessível. Sem autorização/foto adequada, mostrar estado sem foto. |
| Preços reais | API de ofertas aprovada e comprovadamente disponível sem custo dentro do uso definido, se houver acesso. | Fora da dependência obrigatória desta versão. Sem acesso confirmado, botão Consultar preços no site. |
| Links de compra/reserva | URL oficial do hotel, companhia, atração ou operador; link de pesquisa externa quando não houver link direto confiável. | Não presumir que toda URL aceita datas/passageiros como parâmetros. Usar somente formatos conhecidos e identificar o destino externo. |
| Mapas e rotas | MapLibre já instalado; APIs Geoapify já previstas. | Continuam separados de tarifas, reservas e conteúdo comercial. |

API key ou Bearer token é autenticação, não comprovação de gratuidade. Booking Demand API tem preços, fotos e redirecionamento, mas exige parceria e acesso contratual; não será requisito para iniciar. Não foi confirmado nesta revisão um acesso aberto, completo e sem custo obrigatório a tarifas aéreas reais. Dados de sandbox/mock não devem aparecer como ofertas reais.

As consultas propostas usam HTTP com fetch nativo do Node. Não é preciso instalar SDK de Booking, Amadeus ou Wikimedia para este escopo. Nenhum novo pacote, serviço Docker, credencial ou endpoint foi adicionado nesta revisão: somente planejamento/documentação. Providers externos serão implementados em tarefas futuras.

### 6.3. Briefing: catálogo unificado por destino

- Objetivo: pesquisar uma cidade e consultar categorias hotéis, atrações, natureza, restaurantes e experiências locais, sem misturar os tipos de resultado.
- Implementação: normalizar identificadores, coordenadas, descrição disponível, fontes, links e indicador de campos ausentes. Oferecer filtros e paginação compatíveis com cada fonte; não prometer busca completa global com uma única API.
- Banco: places para registros de lugares importados/curados; experiences para passeios/serviços curados. Consultas externas não precisam ser salvas integralmente a cada pesquisa; salvar somente o necessário e permitido.
- Rotas propostas: GET /api/v1/catalog?cityId=...&category=... e GET /api/v1/catalog/places/:id.
- Critério: diferenciar resultados externos e catálogo próprio, tratar duplicação, cidade homônima e fornecedor indisponível. Sem resultado não significa que a atração/hotel não existe.

### 6.4. Briefing: pesquisar passagens e direcionar a compra

- Objetivo: receber aeroportos/cidades de origem e destino, datas, ida/volta e quantidade de passageiros.
- Primeira entrega gratuita: pesquisar aeroportos no catálogo OurAirports e preparar links/ações para consultar voos em sites externos. Não entregar uma lista fictícia de voos/tarifas com base no catálogo de aeroportos.
- Evolução opcional: adaptador de ofertas reais somente após confirmar acesso, custos, cobertura e permissão do fornecedor. Retornar companhia, trechos, horários, moeda, preço, contexto dos passageiros, fonte, consulta e link de compra, se a API realmente fornecer o link.
- Banco: airports para catálogo. flights só depois de cadastro manual do voo contratado; não salvar todas as ofertas como reservas. Histórico privado de pesquisa não é obrigatório.
- Rota proposta: POST /api/v1/search/flights. O contrato deve distinguir external_search de live_offers e devolver ações externas no primeiro modo.
- Critério: nunca derivar preço de distância, aeroporto ou modelo do avião. Oferta não é reserva; URL de compra não deve ser inventada quando o fornecedor não a fornecer.

### 6.5. Briefing: pesquisar hospedagens e consultar preços

- Objetivo: buscar hotéis por cidade, com mapa, endereço, descrição e informações disponíveis. Receber também período e hóspedes para preparar a consulta externa ou uma futura busca real de disponibilidade.
- Fonte: Geoapify para estabelecimentos; conteúdo próprio/autorizado e Wikimedia quando existir correspondência confiável para enriquecer. API de parceiro é uma evolução opcional para preços, disponibilidade e galeria comercial.
- Banco: places e catalog_media para catálogo/fotos; stays para hospedagem contratada cadastrada pelo usuário.
- Rotas propostas: GET /api/v1/search/hotels e GET /api/v1/catalog/places/:id. Pesquisa de oferta com datas pode usar POST quando o adaptador aprovado for implementado.
- Critério: sem API de tarifa, mostrar preço não disponível e Consultar preços no site. Não interpretar preço ausente como zero ou gratuito. Foto ilustrativa de cidade não pode ser apresentada como foto do hotel/quarto.

### 6.6. Briefing: detalhes de pontos turísticos e ingressos

- Objetivo: mostrar atração, localização, descrição disponível, imagens autorizadas, horários quando conhecidos e informação de ingresso.
- Fonte: Geoapify + enriquecimento identificado no Wikidata/Commons + curadoria de links oficiais. Informação comercial incompleta admite complemento manual pela equipe.
- Banco: places, catalog_media; campos/referências de site oficial e URL de ingresso no lugar. Registrar fonte e data de verificação dos dados comerciais.
- Estado de ingresso: gratuito, pago, depende da atividade ou desconhecido. Entrada do local e atividade paga dentro dele podem ter condições diferentes.
- Critério: desconhecido não significa gratuito; sem link de ingresso confirmado, oferecer site oficial/consultar informações. Não afirmar a situação atual do Jardim Botânico ou de outra atração sem uma fonte verificada.

### 6.7. Briefing: experiências e passeios de operadores

- Objetivo: catalogar passeios como buggy, barcos, tours guiados e atividades oferecidas por operadores em uma cidade.
- Implementação: catálogo curado inicial com operador, descrição, ponto de encontro, duração estimada, restrições informadas, lugares de parada e site/contato externo. Uma API de pontos turísticos não garante inventário de passeios ou disponibilidade por data.
- Banco: experiences, experience_stops e catalog_media; vínculo a places quando houver local/ponto de encontro. Ao adicionar ao roteiro, criar activities com referência opcional à experiência.
- Rotas propostas: GET /api/v1/catalog/experiences?cityId=... e GET /api/v1/catalog/experiences/:id.
- Critério: distinguir atração física de serviço comercial. Não garantir passeio, preço ou disponibilidade sem confirmação do operador. Curadoria/cadastro de operador no catálogo é trabalho da equipe; cadastro de marketplace para operadores não entra agora.

### 6.8. Briefing: fotos, fontes e atribuições

- Objetivo: devolver mídia associada ao estabelecimento, atração ou experiência correta, com autoria/licença e imagem de fallback quando faltar foto.
- Implementação: confirmar identificadores, nome e localização antes de associar mídia; preferir vínculo conhecido no Wikidata a uma correspondência por nome apenas. Consultar metadados de arquivo no Commons/MediaWiki, mantendo fonte, autor, licença, URL e atribuição exigida.
- Banco: catalog_media, vinculado a place_id ou experience_id (exatamente um alvo por registro), com fonte e verificação. Guardar arquivo só quando a licença/contrato permitir.
- Critério: rejeitar mídia sem direitos de uso claros; manter créditos e atender remoções. Não exibir dados de uma galeria como se todas as propriedades estivessem cobertas.

### 6.9. Briefing: preço informativo e links externos

- Objetivo: centralizar a comparação/consulta sem cobrar ou reservar no AeroClima.
- Contrato: preço é opcional; quando existir, incluir valor, moeda, unidade (pessoa/noite/pacote), quantidade de hóspedes/passageiros, período, origem, consulta e validade informada. Não comparar totais diferentes como equivalentes.
- Banco: metadados em places/experiences para preços curados, claramente indicativos; valores reais de ofertas somente conforme autorização de cache do fornecedor. Valor que o usuário efetivamente pagou pode ser gravado manualmente em flights, stays ou activities, separado da oferta externa.
- Critério: link externo não muda status para comprado. Preço antigo aparece como referência datada; condições completas, taxas e confirmação ficam no site externo. Se a equipe não conseguir manter preços curados, usar apenas Consultar preços.
- Links: tipos site oficial, ingressos, reservar hospedagem e pesquisar passagens. Validar URLs HTTPS e identificar o fornecedor; não confiar em URLs arbitrárias para redirecionamento aberto ou downloads pelo backend.

### 6.10. Briefing: cadastrar o que foi contratado

- Objetivo: depois da compra externa, permitir registro manual no planejamento.
- Voo: companhia, número, aeroportos, datas/horários/fusos, reserva opcional, notas e franquias de bagagem.
- Hospedagem: estabelecimento, período, check-in/out, reserva e observações.
- Atividade/passeio: data, horário, operador, local de encontro, duração, link e observações.
- Banco: flights, stays, activities e relações com trips/places/experiences; status registrado pelo próprio usuário não representa verificação de compra pelo AeroClima.
- Critério: permitir preencher e corrigir manualmente mesmo quando as buscas externas falharem. Valor pago e referência de reserva são dados privados, tratados na etapa final de autorização/proteção.

### 6.11. Briefing: bagagens incluídas por voo

Esta alteração reintroduz franquias de bagagem por voo; não reintroduz checklist de mala ou sugestões de itens.

- Objetivo: exibir três categorias com ícones distintos: item pessoal/mochila, mala de cabine e bagagem despachada.
- Banco: flight_baggage_allowances, relacionado a flights. Guardar categoria, quantidade, peso máximo, dimensões quando conhecidas, fonte, data de consulta e confirmação do usuário; se necessário, diferenciar passageiro/tarifa.
- Estado: incluída, não incluída, comprada à parte ou não informado. Não informado é diferente de proibido.
- Rotas propostas: GET/PUT /api/v1/flights/:flightId/baggage. Edição das franquias de um voo não altera as de todos os voos da companhia.
- Automação opcional: preencher somente quando a informação vier da oferta/reserva/tarifa aplicável ao passageiro e ao trecho, ou de política claramente identificada que ainda precisa de confirmação. Número/modelo do avião não determina sozinho a franquia contratada.
- Critério: preenchimento manual sempre disponível; mostrar fonte e permitir correção. Não assumir mochila de 10 kg como regra universal, nem peso fixo de cabine/despachada. Limites variam com contexto e contrato; consultar as condições da companhia. Franquias diferentes em conexões permanecem por trecho.

### 6.12. Ordem e limites

1. API de viagens, aeroportos, registros manuais e franquias por voo.
2. Catálogo por cidade: hotéis, atrações, experiências, fontes e links externos.
3. Enriquecimento de fotos/detalhes e mapa/rotas.
4. Oferta/preço automático somente se o acesso gratuito adequado for confirmado; não bloqueia as demais entregas.
5. Autenticação, confirmação de email, duas etapas, isolamento, offline e proteção, conforme o planejamento anterior.

Não há checkout, processamento de pagamentos, confirmação automática de compra, scraping de reservas, leitura automática de email ou obrigação de parceria paga nesta versão. O acesso ao site externo não exige um SDK npm. Os computadores permanecem alinhados pelas dependências atuais e seus lockfiles.

### Referências desta revisão

- OurAirports: https://ourairports.com/data/
- Geoapify Places: https://apidocs.geoapify.com/docs/places/
- Geoapify Place Details: https://apidocs.geoapify.com/docs/place-details/
- Geoapify Free: https://www.geoapify.com/pricing/
- Wikidata: https://www.wikidata.org/wiki/Wikidata:Data_access
- Commons/MediaWiki: https://commons.wikimedia.org/wiki/Commons:API/MediaWiki
- Metadados de imagens: https://www.mediawiki.org/wiki/API:Imageinfo
- Booking: pré-requisitos https://developers.booking.com/demand/docs/getting-started/prerequisites
- Booking: preços/fotos/redirecionamento https://developers.booking.com/demand/docs/accommodations/accommodation-tutorial
- ANAC: condições de bagagem https://www.gov.br/anac/pt-br/assuntos/passageiros/bagagem
