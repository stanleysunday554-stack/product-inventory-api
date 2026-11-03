# product inventory api


# Product Inventory API

A RESTful API built with Node.js, Express.js, MongoDB
and Mongoose for managing shop products and inventory.

## Features

- Create products
- Retrieve all products
- Retrieve a single product
- Update products
- Delete products
- Search products by name
- Filter products by category
- Filter products by price
- Sort products by price
- Pagination
- Stock adjustment
- Low-stock filtering
- Input validation
- Error handling

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- Thunder Client

## Installation

1. Clone the repository.

   git clone YOUR_GITHUB_REPOSITORY_URL

2. Enter the project directory.

   cd product-inventory-api

3. Install dependencies.

   npm install

4. Create a .env file.

5. Add your environment variables.

   PORT=5000
   MONGO_URI=YOUR_MONGODB_CONNECTION_STRING

6. Start the development server.

   npm run dev

## API Endpoints

| Method | Endpoint | Description |
| POST | /api/products | Create product |
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get one product |
| PATCH | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| PATCH | /api/products/:id/stock | Adjust stock |

## Example Product

{
  "name": "Samsung Galaxy S25",
  "description": "Samsung smartphone",
  "price": 850000,
  "category": "Electronics",
  "sku": "SAM-S25-001",
  "stock": 20
}

## Query Parameters

- category
- minPrice
- maxPrice
- search
- sort
- page
- limit
- lowStock

## Environment Variables

PORT=5000
MONGO_URI=your_mongodb_connection_string

## Testing

The API was tested using Thunder Client.

Tested operations include CRUD, validation,
duplicate SKU handling, searching, filtering,
sorting, pagination and stock adjustment.
