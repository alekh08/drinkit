# DRINKIT - Liquor Delivery Marketplace

A complete, production-ready liquor delivery marketplace platform built with the **MERN stack** following **Model C: Marketplace + Delivery Partner** business model.

## 🎯 Platform Overview

DRINKIT connects:
- **Customers (Users)** - Browse stores and order products
- **Licensed Stores** - Manage inventory and fulfill orders
- **Delivery Riders** - Handle third-party deliveries
- **Platform Admin** - Oversee operations and approvals

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis (OTP storage)
- **Authentication**: JWT + OTP
- **Payments**: Razorpay (test mode)
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Real-time**: Socket.IO Client
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

## 📁 Project Structure

```
drinkit/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Redis connection
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/        # OTP, Payment, Commission, Geo
│   │   ├── socket/          # WebSocket configuration
│   │   └── server.js        # Express app entry
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/           # User, Store, Rider, Admin pages
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── utils/           # API client, Socket client
│   │   ├── main.jsx         # App entry
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql           # PostgreSQL schema
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** 14 or higher
- **Redis** server
- **npm** package manager

### Installation

#### 1. Clone and Setup

```bash
cd drinkit
```

#### 2. Database Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE drinkit;

# Connect to database
\c drinkit

# Run schema
\i database/schema.sql

# Exit
\q
```

#### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with your configuration
# Required variables:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
# - REDIS_HOST, REDIS_PORT
# - JWT_SECRET
# - RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (from razorpay.com)

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

#### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📱 User Roles & Access

### 1. **Customer (USER)**
- Browse nearby stores
- View products
- Add to cart and place orders
- Track order status in real-time
- Make online payments
- View order history

### 2. **Store Owner (STORE)**
- Create and manage store profile
- Add/edit/delete products
- Accept or reject orders
- View earnings and analytics
- Track commission deductions

### 3. **Delivery Rider (RIDER)**
- Create rider profile
- View available delivery orders
- Accept deliveries
- Mark pickup and delivery status
- Confirm delivery with OTP
- Track earnings

### 4. **Admin (ADMIN)**
- View platform analytics
- Approve/reject store registrations
- Approve/reject rider registrations
- Monitor all orders
- Manage commission percentage
- Block/unblock users

## 🔐 Authentication Flow

1. User selects role (USER/STORE/RIDER/ADMIN)
2. Enters mobile number
3. OTP sent to mobile (displayed in console for testing)
4. User verifies OTP
5. JWT token issued
6. WebSocket connection established
7. Role-based dashboard displayed

### Test Credentials

**Admin Account:**
- Mobile: `9999999999`
- Role: ADMIN
- (OTP will be displayed in backend console)

**Create Test Accounts:**
- Use any 10-digit mobile number
- Select appropriate role
- OTP will be shown in backend logs

## 🔄 Order Flow

```
1. PLACED           → User places order
2. ACCEPTED         → Store accepts order
3. RIDER_ASSIGNED   → Rider accepts delivery
4. OUT_FOR_DELIVERY → Rider picks up from store
5. DELIVERED        → Rider confirms with OTP
```

## 💳 Payment Flow

1. User places order
2. Razorpay order created
3. User completes payment
4. Payment verified via signature
5. Webhook confirms payment
6. Payouts calculated:
   - **Store**: Total - Delivery Fee - Commission
   - **Rider**: Delivery Fee
   - **Platform**: Commission

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP & login
- `GET /api/auth/profile` - Get user profile

### User (Customer)
- `GET /api/users/stores/nearby` - Browse stores
- `GET /api/users/stores/:id` - Store details
- `POST /api/users/orders` - Place order
- `GET /api/users/orders` - Order history

### Store
- `POST /api/stores/profile` - Create/update store
- `GET /api/stores/dashboard` - Dashboard stats
- `POST /api/stores/products` - Add product
- `PUT /api/stores/orders/:id/accept` - Accept order
- `GET /api/stores/earnings` - View earnings

### Rider
- `POST /api/riders/profile` - Create/update profile
- `GET /api/riders/orders/available` - Available orders
- `POST /api/riders/orders/:id/accept` - Accept delivery
- `PUT /api/riders/orders/:id/pickup` - Mark picked up
- `POST /api/riders/orders/:id/deliver` - Deliver with OTP

### Admin
- `GET /api/admin/dashboard` - Platform analytics
- `GET /api/admin/stores/pending` - Pending approvals
- `PUT /api/admin/stores/:id/approve` - Approve store
- `PUT /api/admin/riders/:id/approve` - Approve rider
- `PUT /api/admin/commission` - Update commission

### Payments
- `POST /api/payments/initiate` - Create payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Razorpay webhook

## 🔌 WebSocket Events

### Client Subscribes:
- `order:update` - Order status changes
- `order:new` - New order notification (stores)
- `order:available` - Available orders (riders)

### Server Emits:
- Real-time order updates to all parties
- Room-based notifications by role

## 🎨 Frontend Features

- **Responsive Design** - Works on all devices
- **Real-time Updates** - Live order tracking
- **Role-based Routing** - Automatic dashboard routing
- **Toast Notifications** - User feedback
- **Loading States** - Better UX
- **Error Handling** - Graceful error displays
- **Protected Routes** - Secure navigation

## 🔒 Security Features

- JWT authentication with expiry
- OTP-based login (6 digits, 5-minute expiry)
- Password-less authentication
- Razorpay signature verification
- Rate limiting (100 req/min)
- Input validation
- SQL injection protection
- CORS configuration
- Helmet security headers

## 📊 Database Schema

Key tables:
- `users` - All user accounts
- `stores` - Store profiles
- `products` - Product catalog
- `orders` - Order master
- `order_items` - Order line items
- `riders` - Delivery partners
- `payments` - Payment transactions
- `commissions` - Platform commission config
- `audit_logs` - System activity tracking

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Runs Vite dev server with HMR
```

### Build for Production
```bash
# Backend (no build needed)
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 🐛 Troubleshooting

### Database Connection Failed
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists

### Redis Connection Failed
- Ensure Redis server is running
- Check `REDIS_HOST` and `REDIS_PORT`

### OTP Not Received
- Check backend console logs
- OTPs are displayed in development mode

### Payment Issues
- Ensure Razorpay keys are correct
- Use test mode keys from Razorpay dashboard
- Check webhook URL configuration

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=drinkit
DB_USER=postgres
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

## 🚢 Deployment

### Backend
- Deploy to services like Heroku, Railway, Render
- Set environment variables
- Ensure PostgreSQL and Redis are provisioned

### Frontend
- Build: `npm run build`
- Deploy `dist/` folder to Netlify, Vercel, or similar
- Configure API URL in environment

## 📄 License

MIT License - feel free to use for learning and commercial projects.

## 👥 Contributing

This is a demonstration project showing a complete marketplace implementation. Feel free to fork and customize for your needs.

## 🙏 Credits

Built as a comprehensive full-stack marketplace demonstration using modern web technologies.

---

**DRINKIT** - Your One-Stop Liquor Marketplace 🍷
