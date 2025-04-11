require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Assuming you're using pg and have db.js

const app = express();
app.use(cors());
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Eduverse backend is running!');
});

// Add your API routes here
app.use('/api/users', require('./routes/users')); // example

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
