# School Inventory Management System

A simple CRUD (Create, Read, Update, Delete) application for managing school inventory items using Next.js and SQLite.

## Features

- User authentication system with role-based access control (Admin, Kepala Sekolah, Guru, Staff, Murid)
- School management for multiple institutions
- Room and inventory tracking
- Transfer items between rooms
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

The application uses SQLite with the following tables:

### Schools Table
- `id`: Primary key
- `name`: School name
- `address`: School address
- `phone`: Contact phone number
- `email`: Contact email

### Users Table
- `id`: Primary key
- `name`: Full name
- `no_induk`: Unique identification number (NIP/NIK/NIS) - also used as password
- `school_id`: Foreign key to schools table
- `phone`: Phone number - used for login
- `role`: User role (admin, kepala_sekolah, guru, staff, murid)

### Rooms Table
- `id`: Primary key
- `name`: Room name
- `school_id`: Foreign key to schools table
- `status_id`: Room status reference
- `type_id`: Room type reference
- `responsible_user_id`: User responsible for the room

### Items Table
- `id`: Primary key
- `name`: Item name
- `category_id`: Item category reference
- `room_id`: Current room location
- `quantity`: Number of items
- `condition`: Item condition status
- `acquisition_date`: When the item was acquired
- `notes`: Additional information

### Item Transfers Table
- `id`: Primary key
- `item_id`: Item being transferred
- `source_room_id`: Room the item is being transferred from
- `destination_room_id`: Room the item is being transferred to
- `quantity`: Number of items being transferred
- `transfer_date`: When the transfer occurred

## Authentication System

The application uses a simple authentication system:

- Users log in with their phone number
- The password is the user's identification number (no_induk)
- Example: User with phone 085691638082 and no_induk 0405028 would use:
  - Username: 085691638082
  - Password: 0405028

User roles determine access to different parts of the system:
- **Admin**: Full access to all features
- **Kepala Sekolah**: Access to their school's data
- **Guru**: Access to rooms and items they're responsible for
- **Staff**: Limited access to inventory
- **Murid**: Minimal access (view only)

## API Endpoints

### Authentication
- `POST /api/auth/login`: Log in with phone and password (no_induk)
- `POST /api/auth/logout`: Log out current user
- `GET /api/auth/me`: Get current user information

### Users
- `GET /api/users`: Retrieve all users
- `POST /api/users`: Create a new user
- `GET /api/users/[id]`: Retrieve a specific user
- `PUT /api/users/[id]`: Update a specific user
- `DELETE /api/users/[id]`: Delete a specific user

### Schools
- `GET /api/schools`: Retrieve all schools
- `POST /api/schools`: Create a new school
- `GET /api/schools/[id]`: Retrieve a specific school
- `PUT /api/schools/[id]`: Update a specific school
- `DELETE /api/schools/[id]`: Delete a specific school

### Rooms
- `GET /api/rooms`: Retrieve all rooms
- `POST /api/rooms`: Create a new room
- `GET /api/rooms/[id]`: Retrieve a specific room
- `PUT /api/rooms/[id]`: Update a specific room
- `DELETE /api/rooms/[id]`: Delete a specific room

### Items
- `GET /api/items`: Retrieve all items
- `POST /api/items`: Create a new item
- `GET /api/items/[id]`: Retrieve a specific item
- `PUT /api/items/[id]`: Update a specific item
- `DELETE /api/items/[id]`: Delete a specific item

### Transfers
- `GET /api/transfers`: Retrieve all transfers
- `POST /api/transfers`: Create a new transfer
- `GET /api/transfers/[id]`: Retrieve a specific transfer

## License

This project is open-source and available under the MIT License.