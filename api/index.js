const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

app.post('/api/send-alert', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, value, threshold, isHigh, email } = req.body;

  // Xác định tiêu đề và đơn vị dựa trên loại cảnh báo
  let subject, unit;
  if (type === 'temperature') {
    subject = 'Cảnh báo nhiệt độ';
    unit = '°C';
  } else if (type === 'humidity') {
    subject = 'Cảnh báo độ ẩm';
    unit = '%';
  } else if (type === 'pressure') {
    subject = 'Cảnh báo áp suất';
    unit = 'Pa';
  } else {
    return res.status(400).json({ error: 'Invalid alert type' });
  }

  const message = `
    <h2>${subject}</h2>
    <p>Giá trị hiện tại: ${value}${unit}</p>
    <p>Đã vượt ngưỡng ${isHigh ? 'cao' : 'thấp'}: ${threshold}${unit}</p>
    <p>Thời gian: ${new Date().toLocaleString('vi-VN')}</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: message
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Email configuration:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD
    });
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});