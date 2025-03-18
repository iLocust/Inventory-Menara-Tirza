# School Inventory Management System

A simple CRUD (Create, Read, Update, Delete) application for managing school inventory items using Next.js and SQLite.

## Features

- List all inventory items
- Add new items with details like name, category, quantity, location, etc.
- Edit existing item details
- Delete items from inventory
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository or extract the project files to your desired location.

2. Navigate to the project directory:
   ```bash
   cd school-inventory
   ```

3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Database Structure

The application uses SQLite with a single `items` table:

- `id`: Primary key
- `name`: Item name
- `category`: Item category
- `quantity`: Number of items
- `location`: Storage location
- `condition`: Item condition status
- `acquisitionDate`: When the item was acquired
- `notes`: Additional information
- `createdAt`: Timestamp when the record was created
- `updatedAt`: Timestamp when the record was last updated

## API Endpoints

- `GET /api/items`: Retrieve all items
- `POST /api/items`: Create a new item
- `GET /api/items/[id]`: Retrieve a specific item
- `PUT /api/items/[id]`: Update a specific item
- `DELETE /api/items/[id]`: Delete a specific item

## License

This project is open-source and available under the MIT License.