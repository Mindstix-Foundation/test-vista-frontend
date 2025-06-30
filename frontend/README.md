# Test Vista Frontend

Vue.js frontend application for the Test Vista educational platform.

## Development Setup

```bash
npm install
npm run dev
```

## Student Login Testing

The application includes an ITI Student Login system. For testing purposes, you can use the following approach:

### Testing Student Login

1. Go to the login page: `http://localhost:5174/`
2. Click on "Student Login" 
3. On the ITI Student Login page, click "Show Test Students" to see available test data
4. Click "Use Data" next to any student to auto-fill the form
5. Click "Login" to test the authentication

### Available Test Data

The system contains several test students in "Test School" under "Test Board" and "Jr Kg" standard. Some examples:
- Name: "preman sokande", Roll: "10"
- Name: "uday", Roll: "2" 
- Name: "hitesh", Roll: "4"

### Manual Entry

If entering data manually, ensure:
- Name matches exactly (case-sensitive)
- Roll number matches exactly
- Select "Test Board" → "Test School" → "Jr Kg"

### Troubleshooting

- **Login Failed**: Check that name and roll number match exactly with database entries
- **Server Error**: Ensure backend is running on port 3000
- **Network Issues**: Check proxy configuration in vite.config.ts

## API Integration

The frontend connects to the backend API at `http://localhost:3000` via proxy configuration.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
