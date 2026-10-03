# Documentação e versionamento — AeroClima

## 1. Identidade, acesso e repositórios

Em cada PC, configure Git com nome e email da pessoa que fará os commits:

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@example.com"
```

Isso identifica commits, não autentica. A conta GitHub deve ter acesso aos dois repositórios. Login HTTPS normalmente é solicitado pelo Git Credential Manager no primeiro push. Nunca publique tokens ou .env.

Backend e frontend são repositórios diferentes. Cada pasta tem seu próprio git status, histórico, commit e push. Trabalhem direto na main por enquanto; combinem quem altera cada funcionalidade e arquivos compartilhados.

## 2. Rotina de pull, commit e push

Antes de começar, com árvore limpa, dentro do clone:

```powershell
git status
git pull --ff-only
```

Depois de implementar e verificar build/lint, publique no mesmo clone:

```powershell
git diff
git add .
git commit -m "feat: adicionar cadastro de viagens"
git pull --no-rebase --no-edit
git push origin main
```

Se mexeu nos dois projetos, repita em cada um. O pull após commit recebe alterações enviadas enquanto você trabalhava. Se houver conflito, o Git pausa: abra arquivos apontados, combine o conteúdo, remova marcadores de conflito, valide e finalize:

```powershell
git add .
git commit -m "merge: conciliar alterações da equipe"
git push origin main
```

Se push for rejeitado por atualização recente, faça pull novamente e resolva conflitos. Não use push --force para substituir o trabalho do colega. Regras do repositório podem exigir PR; push direto depende das permissões do GitHub.

Após atualizar os dois clones, execute npm.cmd ci em cada clone com dependências alteradas e docker compose up --build -d na pasta backend. Dados do banco não são enviados pelo Git; enviem também o SQL manual necessário à funcionalidade.

## 3. Modelos de commit

Use uma mensagem curta descrevendo o resultado. O comando é git commit -m "mensagem". O prefixo abaixo é uma convenção da equipe, não uma exigência do Git:

```powershell
git commit -m "feat: adicionar busca de pontos turísticos"
git commit -m "fix: corrigir validação das datas da viagem"
git commit -m "docs: explicar configuração da chave Geoapify"
git commit -m "refactor: separar regras de viagens no service"
git commit -m "chore: atualizar dependências do mapa"
git commit -m "test: adicionar testes unitários de viagens"
```

Feat adiciona comportamento; fix corrige; docs documenta; refactor reorganiza sem mudar comportamento; chore trata manutenção; test será usado quando vocês adicionarem testes. Evitem mensagens como ajuste ou update sem contexto. Enviem mudanças coerentes que deixem a main funcionando.

## 4. Documentar cada funcionalidade

No commit da funcionalidade, atualizem a documentação correspondente. Modelo para copiar:

```markdown
### Nome da funcionalidade
- Objetivo:
- Endpoint e método HTTP:
- Entrada esperada:
- Exemplo de resposta:
- Validações e erros:
- Tabelas e arquivo SQL necessário:
- Variáveis de ambiente novas (sem valores secretos):
- Como verificar manualmente:
- Limitações:
```

Use decoradores Swagger nos controllers/DTOs quando criar endpoints. Documentação automática fica em /docs; informações de instalação/ambiente ficam em INSTALACAO.md; funcionamento do código em DESENVOLVIMENTO.md; proposta de banco em BANCO.md.

## 5. Versões e releases

Para marcos que vocês decidirem publicar, usem MAJOR.MINOR.PATCH, por exemplo 0.1.0. Patch corrige mantendo compatibilidade; minor adiciona comportamento compatível; major indica mudança incompatível após 1.0. Antes de 1.0, definam claramente a estabilidade esperada. Commits feat/fix não criam versões automaticamente.

O backend e frontend têm versões independentes. Só quando decidirem marcar uma entrega, com main limpa e verificada, no repositório correspondente:

```powershell
npm.cmd version 0.1.0 --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: preparar versão 0.1.0"
git tag -a v0.1.0 -m "AeroClima 0.1.0"
git push origin main
git push origin v0.1.0
```

Esse bloco é um modelo, não deve ser executado a cada funcionalidade. Não foi criada uma release nesta configuração. Uma tag aponta para um commit; no GitHub, vocês podem criar uma release dessa tag com mudanças, SQL necessário e instruções de atualização. Não reutilizem uma tag já publicada para outro commit.

## 6. O que enviar

Versionem código, configuração, package.json, package-lock.json, documentação, .env.example e SQL manual. Não enviem .env, node_modules, dist, credenciais ou dados do PostgreSQL. Confiram git status e git diff antes de commit.

A CI atual verifica build, lint, formatação e construção da imagem Docker. Não há testes unitários configurados por enquanto; quando forem desenvolvê-los, adicionem ferramentas, arquivos e etapas de CI na mesma tarefa.
