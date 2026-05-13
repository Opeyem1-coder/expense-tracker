# 💰 Expense Tracker

A full-stack personal finance tracker built with React, Node.js, Express, and PostgreSQL.

## Features

- 🔐 Register & login with JWT authentication
- ➕ Add income and expense transactions
- 📊 Visual spending breakdown by category (pie chart)
- 💼 Live balance, income, and expense totals
- 🔍 Filter transactions by type and category
- 🗑️ Delete transactions
- 📱 Responsive design

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | React 18 + Vite               |
| Backend  | Node.js + Express             |
| Database | PostgreSQL                    |
| Auth     | JWT + bcrypt                  |
| Charts   | Recharts                      |
| HTTP     | Axios                         |

---

## Getting Started

### 1. Set up PostgreSQL

Create the database and tables:
```bash
psql -U postgres
CREATE DATABASE expense_tracker;
\q

psql -U postgres -d expense_tracker -f database/schema.sql
```

### 2. Set up the server

```bash
cd server
npm install

# Copy the env file and fill in your values
cp .env.example .env
```

Edit `server/.env`:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/expense_tracker
JWT_SECRET=any_long_random_string_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

Server runs at: `http://localhost:5000`

### 3. Set up the client

```bash
cd client
npm install
npm run dev
```

App runs at: `http://localhost:5173`

---

## Project Structure

```
expense-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # Axios configuration
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app with routing
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                 # Express API
│   ├── src/
│   │   ├── db/            # Database connection
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   └── index.js       # Server entry point
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── schema.sql         # Database schema
│
└── package.json           # Root (workspace)
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user (requires token)

### Transactions
- `GET /api/transactions` - List all transactions (filtered)
- `POST /api/transactions` - Add transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get dashboard data

---

## Deployment

### Backend → Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a PostgreSQL plugin
4. Set environment variables (DATABASE_URL is auto-set by Railway)
5. Run the schema: Railway Console → `psql $DATABASE_URL -f database/schema.sql`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-railway-app.railway.app/api`
4. Deploy

---

## Development

```bash
# Run both client and server concurrently
npm run dev

# Or run them separately
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

---

## License

MIT — feel free to use this project as a template!
