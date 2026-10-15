# Padrão de mensagens de commit

Usar este padrão no backend e no frontend:

```text
tipo: mensagem
```

Escrever o tipo em minúsculas e a descrição em português, com verbo direto e sem ponto final. Cada commit deve reunir uma mudança coerente.

- **feat**: Nova funcionalidade. Exemplo: `feat: adicionar cadastro de viagem`
- **fix**: Correção de erro. Exemplo: `fix: corrigir validação dos fusos`
- **docs**: Documentação. Exemplo: `docs: adicionar guia de instalação`
- **style**: Formatação do código, sem mudar comportamento. Exemplo: `style: ajustar formatação dos arquivos`
- **refactor**: Reorganização sem nova funcionalidade ou correção. Exemplo: `refactor: extrair regras para serviço`
- **perf**: Melhoria de desempenho. Exemplo: `perf: reduzir consultas ao banco`
- **test**: Adição ou alteração de testes. Exemplo: `test: cobrir validação das datas`
- **build**: Dependências ou processo de build. Exemplo: `build: atualizar dependências do Vite`
- **ci**: Integração e entrega contínuas. Exemplo: `ci: configurar verificação de build`
- **chore**: Manutenção e configuração geral. Exemplo: `chore: ajustar arquivos ignorados pelo Git`
- **revert**: Reverter uma alteração. Exemplo: `revert: desfazer alteração no cadastro de voo`

Mudanças visuais de funcionalidade usam `feat` ou `fix`; `style` é reservado à formatação do código.

## Mudança incompatível

Acrescentar `!` e explicar no corpo quando uma mudança quebrar compatibilidade:

```text
feat!: alterar formato das datas dos voos

BREAKING CHANGE: partida e chegada passam a exigir o fuso no novo formato
```

## Salvar e enviar alterações

Executar dentro do repositório correto. Conferir os arquivos antes de adicioná-los; não incluir `.env`, credenciais, `node_modules` ou `dist`.

```sh
git status
git diff
git add docs/COMMITS.md
git commit -m "docs: definir padrão de mensagens de commit"
git push
```

O `git add` acima é um exemplo: selecionar os arquivos correspondentes à mudança. O `git push` pressupõe uma branch com remoto configurado. Para a primeira publicação de uma branch, usar `git push -u origin NOME_DA_BRANCH`, substituindo pelo nome real.



