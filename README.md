# Inventory & Order Management System

A full-stack containerized application for managing products, customers, and orders.

## Tech Stack

- **Backend:** Python + FastAPI
- **Frontend:** React + Vite
- **Database:** PostgreSQL
- **Containerization:** Docker + Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose installed

### Run with Docker Compose

```bash
# Clone the repository
git clone <your-repo-url>
cd inventory-management

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Run Locally (Development)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

## API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /products | Create product |
| GET | /products | List all products |
| GET | /products/{id} | Get product by ID |
| PUT | /products/{id} | Update product |
| DELETE | /products/{id} | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /customers | Create customer |
| GET | /customers | List all customers |
| GET | /customers/{id} | Get customer by ID |
| DELETE | /customers/{id} | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orders | Create order |
| GET | /orders | List all orders |
| GET | /orders/{id} | Get order by ID |
| DELETE | /orders/{id} | Cancel order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard | Get summary stats |

## Business Rules

- Product SKU must be unique
- Customer email must be unique
- Product quantity cannot be negative
- Orders cannot be placed if inventory is insufficient
- Creating an order automatically reduces available stock
- Cancelling an order restores the stock
- Total order amount is calculated automatically

## Docker Hub

```bash
# Build and push backend image
docker build -t <your-dockerhub-username>/inventory-backend ./backend
docker push <your-dockerhub-username>/inventory-backend
```

## Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables: `DATABASE_URL`, `ALLOWED_ORIGINS`

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set root directory to `frontend`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=<your-backend-url>`
