# Beer Sheva Streets Search 🏙️

A high-performance street search system for the city of Beer Sheva, powered by Elasticsearch. Features include fast CSV data uploading, streaming processing, and advanced search capabilities.

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

## ☸️ Helm & Kubernetes
The project includes a Helm Chart for managing Kubernetes deployments.

**Location:** `helm/beer-sheva-streets/`

**Render Project Manifests (Configuration):**
```bash
helm template beer-sheva-streets ./helm/beer-sheva-streets
```

You can customize environment settings (ports, memory limits, image tags, etc.) in the `values.yaml` file.

---

## ⚡ Key Features & Optimizations
- **Fast Parsing**: Uses Node.js Streams to process large CSV files without loading the entire file into memory.
- **Bulk Indexing**: Writes to Elasticsearch in optimized batches to minimize network overhead and indexing time.
- **Elasticsearch Optimization**: Controlled index refreshing for maximum ingestion speed.
- **Clean Architecture**: Separated into Controllers, Services, and Configuration layers for easy maintenance and debugging.
- **Type Safety**: Fully written in TypeScript for both Frontend and Backend.
