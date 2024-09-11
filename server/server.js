const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// API endpoints
app.post('/api/admin-login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect password' });
  }
});

app.post('/api/book-appointment', (req, res) => {
  const { date, time, email, oneTimePassword } = req.body;
  const validOTPs = [process.env.OTP_1, process.env.OTP_2, process.env.OTP_3];
  
  if (validOTPs.includes(oneTimePassword)) {
    // In a real app, you would save this booking to a database
    res.json({ success: true, message: 'Booking successful' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid one-time password' });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});