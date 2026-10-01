# STARK | Elite Digital Banking Platform

A modern, full-stack digital banking application built with React, TypeScript, Node.js, and MongoDB. STARK provides a secure, intelligent, and elite banking experience with real-time notifications, wealth management, and comprehensive admin controls.

![STARK](https://img.shields.io/badge/STARK-Elite%20Banking-d4af37)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)

## 🚀 Features

### For Customers
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Account Management**: View account details, balances, and transaction history
- **Money Transfers**: Send money between accounts with real-time validation
- **Wealth Management**: Fixed deposits and investment portfolio tracking
- **Loan Applications**: Apply for loans with real-time status tracking
- **Real-time Notifications**: Socket.io powered instant notifications
- **Premium UI**: Material Design with dark/light theme support
- **Responsive Design**: Optimized for desktop and mobile devices

### For Administrators
- **User Management**: View, edit, and manage customer accounts
- **Transaction Monitoring**: Real-time transaction oversight
- **Operational Controls**: System configuration and monitoring
- **Live Dashboard**: Real-time platform metrics and user activity
- **Notification Management**: Send system-wide notifications

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.5.3** - Type safety
- **Vite 8.3.1** - Build tool and dev server
- **React Router DOM 6.26.0** - Client-side routing
- **Axios 1.7.7** - HTTP client
- **Socket.io Client 4.7.5** - Real-time communication
- **Tailwind CSS 3.4.10** - Utility-first CSS framework
- **Material Symbols** - Icon library

### Backend
- **Node.js 18.x** - Runtime environment
- **Express.js** - Web framework
- **TypeScript 5.5.3** - Type safety
- **MongoDB** - Database (MongoDB Atlas)
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Joi** - Request validation
- **Helmet** - Security headers
- **Rate Limiting** - API protection

### Infrastructure
- **Render** - Cloud hosting platform
- **MongoDB Atlas** - Cloud database
- **GitHub** - Version control

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- MongoDB Atlas account (for production)
- Git

## 🔧 Installation

1. **Clone the repository**
```bash
git clone https://github.com/Dera309/STARK.git
cd STARK
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install shared dependencies
cd ../shared
npm install
```

3. **Set up environment variables**

### Server Environment Variables (`server/.env`)
```env
PORT=3003
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
NODE_ENV=development
MONGODB_URI=mongodb+srv://your-mongodb-connection-string
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

### Client Environment Variables (`client/.env`)
```env
VITE_API_URL=http://localhost:3003/api/v1
VITE_SOCKET_URL=http://localhost:3003
```

## 🚀 Running the Application

### Development Mode

1. **Start the server**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:3003`

2. **Start the client** (in a new terminal)
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

### Production Build

1. **Build the server**
```bash
cd server
npm run build
npm start
```

2. **Build the client**
```bash
cd client
npm run build
npm run preview
```

## 📁 Project Structure

```
STARK/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API and socket services
│   │   └── types/         # TypeScript definitions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Business logic
│   │   ├── config/        # Configuration
│   │   └── validators/    # Request validators
│   └── package.json
├── shared/                # Shared utilities
│   └── src/
├── render.yaml            # Render deployment config
└── README.md
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Security Headers**: Helmet.js for HTTP security
- **Input Validation**: Joi schema validation
- **Device Fingerprinting**: Session security
- **Account Lockout**: Failed login attempt protection

## 🌐 Deployment

### Render Deployment

The application is deployed on Render using the provided `render.yaml` configuration:

- **API Server**: `https://stark-api-04gm.onrender.com`
- **Client**: `https://stark-h310.onrender.com`

To deploy:

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically build and deploy using `render.yaml`

### Environment Variables on Render

Set the following environment variables in your Render dashboard:

**Server Service:**
- `PORT`: 3003
- `NODE_ENV`: production
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Your JWT secret key
- `JWT_EXPIRES_IN`: 24h
- `CLIENT_URL`: https://stark-h310.onrender.com

**Client Service:**
- `VITE_API_URL`: https://stark-api-04gm.onrender.com/api/v1
- `VITE_SOCKET_URL`: https://stark-api-04gm.onrender.com

## 🧪 Testing

### Run Tests
```bash
# Client tests
cd client
npm test

# Server tests (if configured)
cd server
npm test
```

### Build Verification
```bash
# Server build
cd server
npm run build

# Client build
cd client
npm run build
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/reset-password/request` - Request password reset
- `POST /api/v1/auth/reset-password/confirm` - Confirm password reset

### Accounts
- `GET /api/v1/accounts` - Get user accounts
- `GET /api/v1/accounts/:id` - Get account details

### Transactions
- `POST /api/v1/transactions/transfer` - Transfer money
- `GET /api/v1/transactions` - Get transaction history

### Loans
- `POST /api/v1/loans/apply` - Apply for loan
- `GET /api/v1/loans` - Get user loans

### Investments
- `POST /api/v1/investments/fd` - Create fixed deposit
- `GET /api/v1/investments` - Get user investments

### Admin
- `GET /api/v1/admin/overview` - Admin dashboard
- `GET /api/v1/admin/users` - User management
- `GET /api/v1/admin/operations` - System operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Chidera Obia** - Initial work

## 🙏 Acknowledgments

- Material Design for UI inspiration
- Socket.io for real-time communication
- MongoDB Atlas for database hosting
- Render for cloud hosting

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**STARK** - Secure, Intelligent, Elite Digital Banking
