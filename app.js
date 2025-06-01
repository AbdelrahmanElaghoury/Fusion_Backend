// app.js
const express          = require('express');
const cors             = require('cors');
const morgan           = require('morgan');
const authRouter       = require('./routes/authRoutes');
const userRouter       = require('./routes/usersRoutes');
const productRouter    = require('./routes/productRoutes');
const questionRouter   = require('./routes/questionRoutes');
const answerRouter     = require('./routes/answerRoutes');
const cartRouter       = require('./routes/cartRoutes');
const orderRouter      = require('./routes/orderRoutes');
const profileRouter      = require('./routes/profileRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth',      authRouter);
app.use('/api/users',     userRouter);
app.use('/api/products',  productRouter);
app.use('/api/questions', questionRouter);
app.use('/api/answers',   answerRouter);
app.use('/api/cart',      cartRouter);
app.use('/api/orders',    orderRouter);
app.use('/api/profile',    profileRouter);
app.use(errorHandler);

module.exports = app;
