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
 
   const subject = `Cảnh báo ${type === 'temperature' ? 'nhiệt độ' : 'độ ẩm'}`;
   const message = `
     <h2>Cảnh báo ${type === 'temperature' ? 'nhiệt độ' : 'độ ẩm'}</h2>
     <p>Giá trị hiện tại: ${value}${type === 'temperature' ? '°C' : '%'}</p>
     <p>Đã vượt ngưỡng ${isHigh ? 'cao' : 'thấp'}: ${threshold}${type === 'temperature' ? '°C' : '%'}</p>
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
     res.status(500).json({ error: 'Failed to send email' });
   }
 });
 
 const PORT = process.env.PORT || 5000;
 app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
 }); 