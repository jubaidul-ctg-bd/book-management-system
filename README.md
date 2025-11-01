# 📚 Book Management System

<p>A Book Management System built with NestJS, MongoDB, and TypeScript</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-v20+-green.svg" alt="Node.js Version" />
  <img src="https://img.shields.io/badge/NestJS-v11+-red.svg" alt="NestJS Version" />
  <img src="https://img.shields.io/badge/MongoDB-v8+-green.svg" alt="MongoDB Version" />
  <img src="https://img.shields.io/badge/TypeScript-v5+-blue.svg" alt="TypeScript Version" />
  <img src="https://img.shields.io/badge/Tests-100%25%20Coverage-brightgreen.svg" alt="Test Coverage" />
</p>

## 📖 Description

A comprehensive Book Management System API with full CRUD operations, search functionality, pagination, validation, and robust error handling. Built following NestJS best practices and modern software development principles.

## ✨ Features

- **Complete CRUD Operations**: Manage books and authors
- **Advanced Search & Pagination**: Efficient data retrieval
- **Input Validation**: DTO-based validation with detailed error messages
- **Error Handling**: Custom exception filters with consistent responses
- **Test Coverage**: Unit and E2E tests with Jest & Supertest
- **Type Safety**: Full TypeScript implementation
- **Database Integrity**: Unique constraints and referential integrity

## 🚀 Technology Stack

- **Framework**: NestJS v11+ with TypeScript v5+
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest + Supertest + MongoDB Memory Server
- **Validation**: class-validator & class-transformer

## 🗄️ Database Choice: MongoDB

**Why MongoDB was chosen for this project:**

- **Document-Based Structure**: Books and authors are naturally document-oriented with varying metadata fields (genres, publication details, biographical information), making MongoDB's flexible schema ideal
- **JSON-Native**: Seamless integration with JavaScript/TypeScript ecosystem - no object-relational mapping complexity
- **Rapid Prototyping**: Schema flexibility allows for quick iterations and feature additions without migrations
- **Mongoose ODM**: Provides excellent TypeScript support, validation, and NestJS integration out of the box
- **Scalability**: Horizontal scaling capabilities for future growth
- **Rich Querying**: Built-in text search, regex patterns, and aggregation pipelines perfect for book/author search functionality

**Alternative Considerations:**

- **PostgreSQL**: Would be preferred for complex relational queries, ACID transactions, and strict data consistency requirements
- **SQLite**: Excellent for development/testing due to simplicity, but limited for production scalability
- **MySQL**: Good middle-ground for traditional RDBMS needs with decent performance

For this book management system, MongoDB's flexibility and JavaScript ecosystem integration make it the optimal choice.

## 🔧 Quick Start

```bash
# Install dependencies
yarn install

# Set up environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run in development mode
yarn start:dev
```

## ⚙️ Environment Configuration

```env
NODE_ENV=development
PORT=3002
MONGODB=mongodb://localhost:27017/book-management-system
```

## 🧪 Testing

```bash
# Unit test on single file
yarn test authors.service.spec.ts

# Unit tests with coverage
yarn test:cov

# E2E tests
yarn test:e2e
```

## 📚 API Endpoints

### Authors

- `POST /authors` - Create author
- `GET /authors` - List authors (pagination & search)
- `GET /authors/:id` - Get author by ID
- `PATCH /authors/:id` - Update author
- `DELETE /authors/:id` - Delete author

### Books

- `POST /books` - Create book
- `GET /books` - List books (pagination & search)
- `GET /books/:id` - Get book by ID
- `PATCH /books/:id` - Update book
- `DELETE /books/:id` - Delete book

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term

## 🎯 Response Format

**Success:**

```json
{
  "statusCode": 200,
  "message": "Request successful",
  "data": {
    /* response data */
  }
}
```

**Error:**

```json
{
  "statusCode": 404,
  "message": "Author not found",
  "error": "Not Found"
}
```

## 🗂️ Project Structure

```
src/
├── authors/              # Authors module (controller, service, DTOs, tests)
├── books/                # Books module (controller, service, DTOs, tests)
├── common/               # Shared utilities (filters, interceptors, config)
├── app.module.ts         # Root module
└── main.ts              # Application entry point
```

## 🚀 Deployment

```bash
# Build and run
yarn build
yarn start:prod
```

## ‍💻 Author

**Jubaidul Alam** - [@jubaidul-ctg-bd](https://github.com/jubaidul-ctg-bd)
