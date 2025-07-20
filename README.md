# Beat22 Microservices

A two‑service Node.js microservice stack built around **Auth** and **File** functionality.

---

## 📂 Project Structure

```text
beat22Microservice/
├── auth-service/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   └── server.js
├── file-service/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── utils/
│   └── server.js
└── docker-compose.yml (optional)
```

---

## 🖇️ Clone the Repository

```bash
# Grab the code
git clone https://github.com/hitesharya/beat22Microservice.git
cd beat22Microservice
```

---

## 📦 Install Dependencies

Each service manages its own `node_modules`. Install them separately:

```bash
# Auth Service
cd auth-service
npm install

# File Service
cd ../file-service
npm install
```

---

## 🔐 Environment Variables

Both services expect a **`.env`** file **inside their own folder**. Create the file in **both** `auth-service` and `file-service`.

### Auth Service `.env`

```dotenv
MONGO_URI=mongodb+srv://hitesh:hitesh@cluster0.mgon4dt.mongodb.net/test_project?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
AWS_KEY=your_aws_access_key
AWS_SECRET=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET=your_bucket_name
```

### File Service `.env`

```dotenv
MONGO_URI=mongodb+srv://hitesh:hitesh@cluster0.mgon4dt.mongodb.net/test_project?retryWrites=true&w=majority
PORT=4000
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
AWS_KEY=your_aws_access_key
AWS_SECRET=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET=your_bucket_name
```

---

## ⚡ Install & Run Redis Locally

Redis powers the cache / token‑blacklist layer.

### macOS (Homebrew)

```bash
brew install redis
brew services start redis
```

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis-server.service
sudo systemctl start redis-server.service
```

Verify it’s up:

```bash
redis-cli ping   # → PONG
```

---

## 🚀 Start the Services

In **two separate terminals**, run the following:

```bash
# Terminal 1 – Auth Service
cd auth-service
npm run start
```

```bash
# Terminal 2 – File Service
cd file-service
npm run start
```

---

## 🌐 Swagger Documentation

Access Swagger UI for both services:

* **Auth Service** → [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
* **File Service** → [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

---


