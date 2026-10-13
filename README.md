# Porsche Sales Insights

Dashboard responsivo para explorar registros públicos de vendas Porsche. A interface calcula indicadores e gráficos no navegador e permite filtrar os registros por período, estado, modelo e busca livre, além de exportar os dados filtrados em CSV.

> Este projeto é um painel analítico demonstrativo. Os dados são carregados de `client/src/data/dashboard.json`; o app não consulta um sistema de vendas em tempo real nem mantém uma API ou banco de dados.

## Acesso público

- Site permanente principal: <https://porsche-dyzmz2gw.manus.space>
- GitHub Pages: <https://punkllette.github.io/porsche-sales-dashboard/>

## O que o painel mostra

- Receita total, ticket médio, entregas concluídas e estados presentes nos resultados.
- Gráficos de modelos mais vendidos, preço médio por modelo, status de entrega e vendas por estado.
- Tabela paginada, ordenada pelo ID mais recente.
- Filtros combináveis por intervalo de datas, estado, modelo e busca textual.
- Exportação CSV dos registros atualmente filtrados.
- Valores monetários em dólares americanos (USD).

## Requisitos

- Node.js 22 ou superior.
- pnpm 10.19 ou superior.

## Executar localmente

```bash
pnpm install
pnpm dev
```

Para verificar os tipos e gerar os arquivos estáticos para GitHub Pages:

```bash
pnpm check
pnpm build:github-pages
```

Esse comando grava o build em `dist/public` e sincroniza os arquivos publicados para a raiz do repositório, compatível com a configuração atual do GitHub Pages (`main` / raiz). Faça commit dos arquivos gerados junto com a alteração que deseja publicar.

## Estrutura relevante

```text
client/src/pages/Dashboard.tsx  interface e lógica do painel
client/src/data/dashboard.json  registros usados pelo dashboard
client/public/                  arquivos públicos do frontend
scripts/sync-github-pages.mjs   sincroniza o build estático na raiz publicada
```

## Tecnologias

React, TypeScript, Vite, Tailwind CSS e Recharts.
