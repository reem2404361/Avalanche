const express  = require('express');
const dotenv   = require('dotenv');
const path     = require('path');
const mongoose = require('mongoose');
const ejs      = require('ejs');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('No MONGO_URI in .env — running in mock/in-memory mode');
}

app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/appointments', require('./routes/appointmentRoutes'));
app.use('/',             require('./routes/pageRoutes'));

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});