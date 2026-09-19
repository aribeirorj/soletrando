# Um build, duas Versões por endereço

O Jogo de Soletrar tem uma Versão em inglês (Spelling Bee) e outra em português (Soletrando). Mantemos um único código e um único build, com duas páginas de entrada: `/` para o inglês e `/pt/` para o português. O Idioma vem da página aberta, nunca de uma escolha na tela.

Restrição: o Spelling Bee não muda para quem joga (endereço, textos, regras, pontuação e as chaves `soletrando:*` do `localStorage`), e os testes que já existiam continuam passando sem alteração. Por isso o português entra de forma aditiva, e o inglês é o Idioma padrão quando nada o define.

## Considered Options

- **Fork (cópia do projeto):** descartado. O Spelling Bee continua evoluindo, e cada melhoria teria de ser feita duas vezes.
- **Dois builds (`build:en` e `build:pt`):** descartados. Dobrariam deploy, comandos de dev e rodadas de teste. O ganho seria só que o pacote publicado de cada Idioma não carregaria o modelo de voz do outro, e isso já não acontece porque o modelo só é baixado quando o Falar e Soletrar abre.
- **Um app com seletor de idioma:** descartado. As duas Versões deixariam de ter nome e link próprios.

## Consequences

- As duas páginas ficam na mesma origem, então o Soletrando grava com o prefixo `soletrando-pt:` para não misturar o Recorde e a Turma com os do Spelling Bee.
- As stores leem o `localStorage` quando o módulo carrega. O Idioma precisa estar definido antes disso, e por isso vem de um atributo da página (`data-idioma`), não de um estado React.
- A hospedagem precisa servir `/pt/` pelo `pt/index.html`, sem uma regra de SPA que reescreva tudo para `/index.html`.
