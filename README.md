# Simple Poll Management System

A full-stack college poll management system where administrators create polls and students vote, built with **FastAPI**, **SQLAlchemy**, **MySQL 8**, and **React (Vite + Tailwind CSS)**.

---

## Architecture & Technology Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Axios, Recharts, React Router DOM
* **Backend:** Python 3.13, FastAPI, Uvicorn, SQLAlchemy, Pydantic, python-dotenv
* **Database Driver:** PyMySQL
* **Database:** MySQL 8 Community Server
* **Cloud Dev Environment:** GitHub Codespaces (Docker Compose)

---

## GitHub Codespaces Quickstart

The repository is configured to run entirely in **GitHub Codespaces** with zero local installations required (no local MySQL or Docker Desktop needed).

### 1. Launch Codespaces
1. Open your repository on GitHub.
2. Click the green **Code** button, select the **Codespaces** tab, and click **Create codespace on main**.
3. Codespaces will automatically:
   * Build the Python 3.13 + Node.js 22 application container.
   * Start the isolated **MySQL 8** database container with automatic health checks.
   * Install backend Python dependencies via `requirements.txt`.
   * Install frontend Node dependencies via `npm install`.

---

## Development Startup Commands

Open two terminal tabs in your Codespaces VS Code session:

### Terminal 1: FastAPI Backend
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
* API Documentation (Swagger UI): `http://localhost:8000/docs`
* API Base Endpoint: `http://localhost:8000/api`

### Terminal 2: React Frontend (Vite)
```bash
cd frontend
npm run dev
```
* Frontend Web App: `http://localhost:5173` (Codespaces will prompt to open this port automatically).

---

## Database Configuration (Docker Compose)

The backend container communicates with MySQL directly over the internal Docker network (`poll-network`) via the service hostname `db`.

| Parameter | Development Value |
| :--- | :--- |
| **Hostname** | `db` |
| **Port** | `3306` (Internal Docker network only) |
| **Database Name** | `simple_poll_db` |
| **Application User** | `poll_user` |
| **Application Password** | `poll_dev_password` |
| **Root Password** | `poll_dev_root_password` |
| **SQLAlchemy URI** | `mysql+pymysql://poll_user:poll_dev_password@db:3306/simple_poll_db` |

> [!WARNING]
> **Development-Only Credentials Notice:**  
> The database passwords and users listed above are strictly development-only defaults for Docker Compose and GitHub Codespaces testing. Never use these credentials in a public or production deployment. Production secrets should be injected via GitHub Repository Secrets or environment variables.

---

## Port Forwarding Summary

* **Port `8000` (FastAPI):** Forwarded automatically for REST API interaction.
* **Port `5173` (Vite/React):** Forwarded automatically with browser auto-open.
* **Port `3306` (MySQL):** Kept private to the internal container network for security and isolation.
