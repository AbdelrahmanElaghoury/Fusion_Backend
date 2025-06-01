```
backend/
│
├── controllers/
│   └── authController.js    ← signup, login, token logic
│
├── middleware/
│   └── auth.js              ← protect & restrictTo guards
│
├── models/
│   └── userModel.js         ← Mongoose schema + password hashing/methods
│
├── routes/
│   └── authRoutes.js        ← wires up POST /signup & /login
│
└── server.js                ← boots Express, connects Mongo, mounts routes
```
