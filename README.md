# Soletrando

Jogo para praticar a ortografia de palavras em inglês em sala de aula. O glossário e a arquitetura estão em [CONTEXT.md](CONTEXT.md).

## Reconhecimento de voz (Falar e Soletrar)

O modo Falar e Soletrar mostra ao aluno a letra que o microfone ouviu. O reconhecimento roda no próprio navegador, com [Vosk](https://alphacephei.com/vosk/) (`vosk-browser`), sem enviar áudio para nenhum serviço.

- **Modelo:** `public/models/vosk-model-small-en-us-0.15.tar.gz` (~41 MB, licença Apache-2.0). Para gerá-lo de novo a partir do zip oficial, rode `./scripts/prepare-vosk-model.sh`.
- **Microfone:** o navegador só libera o microfone em `https` ou em `localhost`. Aberto por `http://<IP-da-rede>`, o jogo funciona normalmente, mas sem a letra ouvida.
- **Primeiro uso:** o modelo é baixado e extraído uma vez; depois fica guardado no navegador (IndexedDB).

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
