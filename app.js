// app.js
const express               = require('express');
const cors                  = require('cors');
const morgan                = require('morgan');
const cookieParser          = require('cookie-parser');
const authRouter            = require('./routes/authRoutes');
const userRouter            = require('./routes/usersRoutes');
const productRouter         = require('./routes/productRoutes');
const questionRouter        = require('./routes/questionRoutes');
const answerRouter          = require('./routes/answerRoutes');
const cartRouter            = require('./routes/cartRoutes');
const orderRouter           = require('./routes/orderRoutes');
const profileRouter         = require('./routes/profileRoutes');
const mainConcernsRoutes    = require("./routes/mainConcernsRoutes");
const newPipelineRoutes     = require("./routes/newPipelineRoutes");
const servicesRoutes        = require('./routes/servicesRoutes');
const { errorHandler }      = require('./middleware/errorHandler');

const app = express();

// ---- MIDDLEWARE ----
// CORS before anything else, with credentials!
app.use(
  cors({
    origin: "http://localhost:5173", // <-- Change to your frontend URL in prod
    credentials: true,
  })
);

// Parse JSON body and cookies before routers
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// ---- ROUTES ----
app.use('/api/auth',          authRouter);
app.use('/api/users',         userRouter);
app.use('/api/products',      productRouter);
app.use('/api/questions',     questionRouter);
app.use('/api/answers',       answerRouter);
app.use('/api/cart',          cartRouter);
app.use('/api/orders',        orderRouter);
app.use('/api/profile',       profileRouter);
app.use("/api/main-concerns", mainConcernsRoutes);
app.use("/api/new-pipelines", newPipelineRoutes);
app.use('/api/services',      servicesRoutes);

// ---- ERROR HANDLER LAST ----
app.use(errorHandler);

module.exports = app;
