# Control Money App

App para registrar e analisar gastos e receitas pessoais. Objetivo: manter tudo organizado e gerar relatórios detalhados do fluxo de dinheiro.

## Objetivo do projeto

Manter um controle claro das finanças pessoais com relatórios úteis como:

- **Gastos do mês** — total e detalhamento por categoria
- **Maior gasto do mês** — o que mais custou
- **Maior receita** — de onde vem a maior entrada de dinheiro
- **Melhor produto/serviço** — análise de gastos por conceito
- **Gasto semanal** — tendências por semana
- E muito mais relatórios no futuro

## Stack técnico

- **Expo** (React Native) + **Expo Router** (file-based routing)
- **Firebase** — Auth (email, Google) e banco de dados
- **TypeScript**

## Estrutura do projeto

```
app/              # Rotas (Expo Router)
  (home)/         # Tabs principais
  login.tsx
  _layout.tsx
lib/              # Lógica compartilhada
  firebase/       # Configuração e clientes do Firebase
context/          # React Context (Auth, etc.)
components/       # Componentes reutilizáveis
```

## Como começar

1. **Instalar dependências**

   ```bash
   npm install
   ```

2. **Iniciar a app**

   ```bash
   npx expo start
   ```

3. Rodar em Android, iOS ou Expo Go conforme o output do comando.

## Requisitos

- Node.js (recomendado >= 20)
- Conta Firebase configurada (`google-services.json` na raiz)
- Configuração em `lib/firebase/config.ts` com as credenciais do projeto

## Scripts

| Comando              | Descrição               |
|----------------------|-------------------------|
| `npm start`          | Inicia o servidor Expo  |
| `npm run android`    | Executa no Android      |
| `npm run ios`        | Executa no iOS          |
| `npm run web`        | Executa na web          |
| `npm run lint`       | Executa ESLint          |
