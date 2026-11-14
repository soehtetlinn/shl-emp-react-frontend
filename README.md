# SHL Employee Management — frontend

Employee management system that runs entirely in the browser: there is no server to deploy.
The data layer is an in-browser backend seeded with sample data and saved in `localStorage`.
Three kinds of account sign in to three different workspaces:

| Account  | Screens |
| -------- | ------- |
| Admin    | Dashboard, Roles, Positions, Departments, Project Bidding, Portal Master |
| HR       | Dashboard with one-click leave approval, Employees (with each employee's personal info, education, dependents, work experience), Salaries, Leave Applications, Companies, Roles, Positions, Departments, Countries, States, Cities |
| Employee | Dashboard, own personal information, education, dependents, work experience, leave applications, salary |

## Getting started

```bash
npm install
npm run dev
```

The app opens on <http://localhost:3000>. The login page offers one-click sample accounts
(Admin, HR, Employee). Changes are kept in that browser only; the reset button in the top bar
restores the original sample data, which lives in `src/api/mock/seed.js`.

| Command           | What it does |
| ----------------- | ------------ |
| `npm run dev`     | Development server with hot reload |
| `npm run build`   | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test`        | Run the test suite |

## Connecting a real backend (optional)

The app does not need one. If a server is added later, copy `.env.example` to `.env.local` and set `VITE_API_URL` to the server's base URL:

```
VITE_API_URL=http://localhost:4000
```

The backend is expected to provide:

- `POST /api/login` with `{ email, password }`, answering with a JWT whose payload has
  `_id`, `Account` (1 admin, 2 HR, 3 employee), `FirstName` and `LastName`.
- The token is sent back on every request in the `authorization` header.
- A `401` answer signs the user out; a `403` answer's text is shown to the user.

Every endpoint the app calls is listed in one place: the resource definitions in
`src/resources/`. `src/api/mock/server.js` is a working reference of the expected routes
and response shapes.

## Project layout

```
src/
  main.jsx               entry point
  App.jsx                routes and role guards
  app/                   sidebar navigation per role, theme, data-loading hook
  api/
    client.js            the one place HTTP requests are made
    dynamo.js            unwraps DynamoDB-shaped Lambda responses
    mock/                the in-browser backend and its sample data
  auth/                  session (AuthContext) and JWT decoding
  components/
    AppLayout.jsx        sidebar + top bar shell
    ResourcePage.jsx     generic list / add / edit / delete screen
    ResourceForm.jsx     generic form built from field definitions
    DataTable.jsx        table with search, sorting and paging
    Modal.jsx            dialog
    dashboard.jsx        stat cards, panels and bar lists
    Toast.jsx, Avatar.jsx
  pages/                 screens that are not plain CRUD (login, dashboards, personal info,
                         employee detail, my salary)
  resources/             one definition per CRUD screen: endpoints, columns, fields
  styles/                design tokens, layout, components
```

### Adding a CRUD screen

1. Describe it in `src/resources/` (see the comment at the top of `helpers.js` for the shape).
2. Add a route in `src/App.jsx` with `crud("path", yourResource)`.
3. Add a sidebar entry in `src/app/navigation.js`.

## Deployment

`npm run build` produces a static site in `dist/`. The app uses hash routing, so it can be
served from any static host without rewrite rules. `netlify.toml` is set up for Netlify.
