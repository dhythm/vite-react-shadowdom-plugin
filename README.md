# vite-react-shadowdom-plugin

## How to create the environment

```sh
npm init vite@latest
✔ Project name: … vite-shadowdom-plugin
✔ Select a framework: › React
✔ Select a variant: › TypeScript

cd vite-shadowdom-plugin
npm install

npm i -D @crxjs/vite-plugin @types/chrome --legacy-peer-deps

# To avoid a known issue of Vite@3 https://github.com/crxjs/chrome-extension-tools/issues/454#issuecomment-1214461890
npm i -D vite@^2 @vitejs/plugin-react@^1

npm i react-shadow prop-types styled-components --legacy-peer-deps

# update vite.config.ts
```

## Getting Started

```sh
npm install
npm run dev
npm run build
```
