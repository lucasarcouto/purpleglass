const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'PurpleGlass backend is running' });
});

app.get('/api/data', (_, res) => {
  res.json({
    message: 'Hello from PurpleGlass!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
