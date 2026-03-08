# Cyber/AI Python Lab (Grades 10–11)

[![Netlify Status](https://api.netlify.com/api/v1/badges/418ddb2b-69d7-4a60-8915-2e4ff366c59f/deploy-status)](https://app.netlify.com/projects/pythoncyber-lab/deploys)

A React + Vite app for learning Python in a cyber/AI context. Teacher/student roles, lessons with videos (MP4, YouTube, NotebookLM), Run/Reset/Mastery Check, and teacher notifications.

## How to run the app

**If you only see “Loading Cyber/AI Python Lab…”**, the app needs to be run locally (it does not run from the raw GitHub page).

1. Clone the repo and open a terminal in the project folder:
   ```bash
   cd PythonLab
   npm install
   npm run dev
   ```
2. In your browser, open **http://localhost:5173** (or the URL Vite prints).

You should then see the **Teacher / Student** role picker, then the full lab.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
