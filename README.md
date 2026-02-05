# Beer Sheva Streets Search 🏙️

A high-performance street search system for the city of Beer Sheva, powered by Elasticsearch. Features include fast CSV data uploading, streaming processing, and advanced search capabilities.

## ⚡ Key Features & Optimizations
- **High-Throughput Data Ingestion**: Engineered for large datasets using Node.js Streams and Elasticsearch Bulk API to process millions of records with minimal memory footprint and zero duplicate entries.
- **Microservices Orchestration**: Fully containerized architecture (Docker/K8s) ensuring portability and scalability across any cloud or local environment.
- **Production Ready Infrastructure**: Includes Helm Charts for Kubernetes, automated CI/CD pipelines (GitHub Actions), and comprehensive unit testing.
- **Optimized Full-Text Search**: Leverages Elasticsearch for millisecond-latency queries over complex Hebrew datasets.
- **Modern Localized UI**: Fast, responsive, and fully Right-to-Left (RTL) enabled React interface.
- **Enterprise Grade Quality**: Built with TypeScript for end-to-end type safety and maintainability.

## 🏗️ Architecture
- **Frontend**: React + Vite + TypeScript (Port 3000)
- **Backend**: Node.js + Express + TypeScript (Port 4000)
- **Database**: Elasticsearch 8.12.0 (For high-speed full-text search)

---

## 🚀 Getting Started

The easiest way to run the entire stack is using Docker Compose:

```bash
docker-compose up --build
```

Once the containers are running:
- **Frontend**: Accessible at [http://localhost:3000](http://localhost:3000)
- **Backend API**: Accessible at [http://localhost:4000](http://localhost:4000)
- **Elasticsearch**: Accessible at [http://localhost:9200](http://localhost:9200)

---

## 🔌 API Documentation

The Backend service exposes the following endpoints:

### 1. Search Streets
**URL:** `GET /api/search`  
**Description:** Search for street names in the database.  
**Query Parameters:**
- `q`: The search string (e.g., "Herzl").
- `type`: The search algorithm (`free`, `at-least-one`, `full-phrase`).

### 2. Upload CSV Data
**URL:** `POST /api/streets/upload`  
**Method:** Multipart Form Data  
**Body:** `file` (CSV file)  
**Details:** Processing is done via high-performance streaming and batching (1,000 records per batch) to ensure scalability and low memory footprint. Deterministic IDs are generated based on street properties to prevent duplicate entries if the same file is uploaded multiple times.

### 3. Clear All Records
**URL:** `DELETE /api/streets`  
**Description:** Deletes all street records by truncating the index.

### 4. Delete Record (Soft Delete)
**URL:** `DELETE /api/streets/:id`  
**Description:** Performs a "soft delete" by setting an `is_deleted` flag to true on the specified record.

---

## 🧪 Testing
The project includes unit tests for core services (e.g., Elasticsearch connectivity, data processing).
To run tests locally:
```bash
cd backend
npm test
```

## 🚀 CI/CD Pipeline
A GitHub Actions pipeline is configured in `.github/workflows/ci.yml`. It automatically:
1. Installs dependencies.
2. Runs backend tests.
3. Builds the frontend to ensure no build regressions.

## ☸️ Kubernetes Deployment (Optional / Minikube)
While Docker Compose is the primary way to run the app locally, a Helm chart is provided for Kubernetes environments.

### 1. Start Minikube
```bash
minikube start
```

### 2. Deploy using Helm
```bash
helm upgrade --install beer-sheva-streets ./helm/beer-sheva-streets
```

### 3. Access the App
```bash
minikube service beer-sheva-streets-frontend --url
```
