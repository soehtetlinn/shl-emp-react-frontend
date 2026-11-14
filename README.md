# SHL Employee Management — frontend

React frontend for the SHL employee management system. Three kinds of account sign in to
three different workspaces:

| Account  | Screens |
| -------- | ------- |
| Admin    | Roles, Positions, Departments, Project Bidding, Portal Master |
| HR       | Employees (with each employee's personal info, education, dependents, work experience), Salaries, Leave Applications, Companies, Roles, Positions, Departments, Countries, States, Cities |
| Employee | Own personal information, education, dependents, work experience, leave applications |

## Getting started

```bash
npm install
npm run dev
```

The app opens on <http://localhost:3000>. With no backend configured it runs against a
**demo backend** that lives in the browser (data is kept in `localStorage`), and the login
page offers one-click demo accounts.

| Command           | What it does |
| ----------------- | ------------ |
| `npm run dev`     | Development server with hot reload |
| `npm run build`   | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test`        | Run the test suite |

## Connecting a real backend

Copy `.env.example` to `.env.local` and set `VITE_API_URL` to the server's base URL:

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
  app/navigation.js      sidebar items and landing page per role
  api/
    client.js            the one place HTTP requests are made
    dynamo.js            unwraps DynamoDB-shaped Lambda responses
    mock/                demo backend and its seed data
  auth/                  session (AuthContext) and JWT decoding
  components/
    AppLayout.jsx        sidebar + top bar shell
    ResourcePage.jsx     generic list / add / edit / delete screen
    ResourceForm.jsx     generic form built from field definitions
    DataTable.jsx        table with search, sorting and paging
    Modal.jsx            dialog
  pages/                 screens that are not plain CRUD (login, personal info, employee detail)
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
