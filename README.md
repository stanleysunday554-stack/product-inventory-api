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


Feature	Method	URL
Search by name	GET	/api/products?search=samsung
Filter by category	GET	/api/products?category=Electronics
Minimum price	GET	/api/products?minPrice=100000
Maximum price	GET	/api/products?maxPrice=900000
Sort low to high	GET	/api/products?sort=price_asc
Sort high to low	GET	/api/products?sort=price_desc
Pagination	GET	/api/products?page=1&limit=10
Low stock	GET	/api/products?lowStock=true

You can combine filters:
http://localhost:5000/api/products?category=Electronics&minPrice=100000&maxPrice=900000


These query features won't work unless their logic is included in your getProducts controller.
5. Your complete endpoint checklist
Use this to track your testing.
API testing progress
0/15



[ ] Create a product — POST
[ ] Get all products — GET
[ ] Get one product — GET
[ ] Update a product — PATCH
[ ] Delete a product — DELETE
[ ] Adjust stock — PATCH
[ ] Search products
[ ] Filter by category
[ ] Filter by price
[ ] Sort products
[ ] Test pagination
[ ] Test low stock
[ ] Test duplicate SKU error
[ ] Test invalid product ID
[ ] Test missing product
Reset checklist
One important testing tip: Create a product first, copy its ID, and use that same ID for GET, PATCH and DELETE. Test DELETE last because it removes the product.

Once you finish, open MongoDB Compass, refresh your productInventory database and check the products collection. You should see the records that your API has saved.

















explain the stock













In your Product Inventory API, stock means the quantity of a particular product that a shop currently has available.

For example, imagine you own a shop that sells Samsung phones.

You receive 20 Samsung phones from your supplier. Your inventory should show:
{
    "name": "Samsung Galaxy S25",
    "price": 850000,
    "stock": 20
}


The stock: 20 means your shop currently has 20 units of that phone.

Let's understand how the stock feature works in your code.
1. The stock field in your Product model
In models/product.js, you have:
stock: {
    type: Number,
    default: 0,
    min: [0, "Stock cannot be negative"],
    validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number"
    }
}


Let's explain each line.

stock:

This is the name of the field that stores the quantity of products.

type: Number

Stock must be a number.

Examples:
- 10
- 20
- 50
default: 0

If you create a product without specifying stock, MongoDB will store its stock as zero through Mongoose.

For example:
{
    "name": "HP Laptop",
    "price": 750000,
    "category": "Electronics",
    "sku": "HP-001"
}


The resulting product will have:
"stock": 0


min: [0, "Stock cannot be negative"]

This prevents the stock value from being less than zero when schema validation runs.

Number.isInteger

This checks that stock is a whole number.

For example:
- 10 is accepted.
- 5.5 is rejected.
Mongoose supports minimum values and custom validation rules in schemas. 
Mongoose v9.11.5+1

2. How stock increases and decreases
Imagine your shop has 20 Samsung phones.
Samsung Galaxy S25
Available stock
20 units


New delivery
+5
Stock increases

Items sold
-3
Stock decreases



Remaining stock
22

20 + 5 - 3 = 22 units
There are two basic stock operations:
- Increase stock: When new products arrive.
- Decrease stock: When products are sold or removed from inventory.
3. Understanding the adjustStock controller
This is the function that handles stock adjustments.
const adjustStock = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity === 0) {
            return res.status(400).json({
                message: "Quantity must be a non-zero integer"
            });
        }

        const filter = { _id: req.params.id };

        if (quantity < 0) {
            filter.stock = { $gte: Math.abs(quantity) };
        }

        const product = await Product.findOneAndUpdate(
            filter,
            { $inc: { stock: quantity } },
            { new: true }
        );

        if (!product) {
            const exists = await Product.exists({ _id: req.params.id });

            if (!exists) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        res.status(200).json({
            message: "Stock adjusted successfully",
            product
        });
    } catch (error) {
        next(error);
    }
};


Let's focus on the important parts.

A. Receive the quantity
const { quantity } = req.body;


This extracts quantity from the JSON body sent through Thunder Client.

For example:
{
    "quantity": 5
}


Here, quantity is 5.

B. Validate the quantity
if (!Number.isInteger(quantity) || quantity === 0)


This checks two things:
1. Is the quantity a whole number?
2. Is the quantity different from zero?
The || means OR. If either condition is true, the request is rejected.

C. Identify the product
const filter = { _id: req.params.id };


This tells MongoDB which product we want to adjust.

req.params.id gets the product ID from the URL.

D. Prevent insufficient stock
if (quantity < 0) {
    filter.stock = { $gte: Math.abs(quantity) };
}


This part is important.
- quantity < 0 checks whether we are reducing stock.
- $gte means greater than or equal to.
- Math.abs() converts a negative number into a positive number.
Suppose you have 4 phones and want to remove 6.

The condition checks whether the current stock is at least 6.

Since 4 is less than 6, the operation is rejected.

E. Update the stock
const product = await Product.findOneAndUpdate(
    filter,
    { $inc: { stock: quantity } },
    { new: true }
);


The most important part is:
$inc: { stock: quantity }


$inc is a MongoDB update operator that increases or decreases a numeric field.

For example:
Existing stock	Quantity	New stock
20	+5	25
20	-3	17
10	+10	20
5	-2	3

{ new: true } tells Mongoose to return the updated product.

F. Check if the product exists
if (!product) {


If the update didn't find a matching product, we check whether the product exists at all.
const exists = await Product.exists({ _id: req.params.id });


If it doesn't exist, we return 404.

If it exists but doesn't have enough stock, we return 400 with the message Insufficient stock.
4. How to test stock in Thunder Client
First, create a product and copy its MongoDB _id.

Increase stock

Method: PATCH

URL:
http://localhost:5000/api/products/YOUR_PRODUCT_ID/stock


Body → JSON:
{
    "quantity": 5
}


Decrease stock

Use the same URL, but change the JSON:
{
    "quantity": -3
}


Test insufficient stock

If the product has only 2 items, try:
{
    "quantity": -5
}


Expected response:
{
    "message": "Insufficient stock"
}


5. Small practice exercise
Stock adjustment simulator

Practise how the stock changes. This is only a learning simulator; it does not modify your database.
Current stock
20 units

Enter quantity

Positive number adds stock. Negative number reduces stock.
Adjust stock
The most important thing to remember: Your stock field tells you how many products are available, while your adjustStock function controls how that quantity changes when products arrive or leave the shop.