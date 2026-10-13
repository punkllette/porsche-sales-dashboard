# Porsche Sales Insights

Dashboard responsivo para explorar registros públicos de vendas Porsche. A interface calcula indicadores e gráficos no navegador e permite filtrar registros por período, estado, modelo e busca livre, além de exportar os dados filtrados em CSV.

> Este projeto é um painel analítico demonstrativo. Os dados são carregados de `client/src/data/dashboard.json`; o app não consulta um sistema de vendas em tempo real nem mantém uma API ou banco de dados.

## Acesso público

O dashboard está publicado permanentemente em <https://porsche-dyzmz2gw.manus.space>.

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

O Vite informa no terminal o endereço local para abrir no navegador. Para verificar os tipos e gerar o build:

```bash
pnpm check
pnpm build:pages
```

Os arquivos estáticos de produção são gerados em `dist/public`.

## Estrutura relevante

```text
client/src/pages/Dashboard.tsx  interface e lógica do painel
client/src/data/dashboard.json  registros usados pelo dashboard
client/public/                  arquivos públicos do frontend
```

## Tecnologias

React, TypeScript, Vite, Tailwind CSS e Recharts.
