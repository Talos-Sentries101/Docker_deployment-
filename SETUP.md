# Local Setup Guide

This guide will help you set up the Letushack platform locally.

## Prerequisites

1. Install these tools first:
   - [Node.js](https://nodejs.org/) (v18 or higher)
   - [PostgreSQL](https://www.postgresql.org/download/) (v14 or higher)
   - [Git](https://git-scm.com/downloads)
   - A code editor like [VS Code](https://code.visualstudio.com/)

## Step 1: Clone the Repository

```bash
git clone -b letushack-fixed https://github.com/cyberparadigmofficial/basic-website.git
cd basic-website
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Database Setup

1. Start PostgreSQL service
2. Create a new database:
   ```sql
   CREATE DATABASE letushack_db;
   ```
3. The tables will be created automatically when you start the app

## Step 4: Environment Setup

1. Create a file named `.env.local` in the REPO ROOT (same folder as `package.json`) with these contents. Do not move this file to `scripts/` or any subfolder:
   ```bash
   # PostgreSQL Connection
   PGHOST=localhost
   PGPORT=5432
   PGUSER=postgres
   PGPASSWORD=your_password_here
   PGDATABASE=letushack_db

   # JWT Configuration
   JWT_SECRET="your-super-secret-key-change-in-production-45chars+"
   JWT_SECRET_LOCAL="your-super-secret-key-change-in-production-45chars+"

   # Node Environment
   NODE_ENV="development"
   ```

2. Replace `your_password_here` with your local PostgreSQL password

Tip (Windows PowerShell): create from the template

```
Copy-Item .env.example .env.local
```

## Step 5: Initialize the Database

There are two ways to get the schema:

- Automatic (on first API call): Some API routes will auto-create required tables (e.g., `users`, `points`, `notifications`) if they don't exist.
- Scripted: Run the init script to create all core tables up front (recommended for fresh clones):

```
npm run init:db
```

If you see an error like "SASL: ... client password must be a string", it means `PGPASSWORD` is missing or empty. Ensure `.env.local` exists at the repo root and has a non-empty PGPASSWORD.

## Step 6: Start the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Test the Setup

1. Visit http://localhost:3000
2. Click "Register" to create a new account
3. Try logging in with your credentials
4. You should be redirected to the dashboard if everything is working

## Common Issues & Solutions

### Database Connection Issues

If you see database connection errors:
1. Check if PostgreSQL is running
2. Verify your database credentials in `.env.local`
3. Make sure the database exists
4. Check if PostgreSQL accepts connections from localhost

### JWT Token Issues

If authentication isn't working:
1. Make sure both JWT_SECRET and JWT_SECRET_LOCAL are set
2. Clear your browser cookies
3. Try logging out and back in

### Build Errors

If you get build errors:
1. Delete the `.next` folder
2. Run `npm install` again
3. Start the dev server with `npm run dev`

## Available Scripts

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm start`: Run production server
- `npm run reset:challenges`: Reset challenge data

## Need Help?

If you run into any issues:
1. Check the console for error messages
2. Look for errors in the VS Code terminal
3. Make sure all environment variables are set correctly
4. Verify PostgreSQL is running and accessible

For additional help, contact the repository maintainers.
