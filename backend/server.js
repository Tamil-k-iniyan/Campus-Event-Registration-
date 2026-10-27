require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Campus Event Management API Server Running`);
    console.log(` Port: ${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(` URL:  http://localhost:${PORT}`);
    console.log(`===============================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
