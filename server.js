const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Hàm set CORS headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

module.exports = async (req, res) => {
  try {
    // Xử lý CORS preflight (OPTIONS)
    if (req.method === 'OPTIONS') {
      setCorsHeaders(res);
      return res.status(200).end();
    }

    // Chỉ chấp nhận POST
    if (req.method !== 'POST') {
      setCorsHeaders(res);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, value, threshold, isHigh } = req.body;

    // Validate input
    if (!type || !value || !threshold || isHigh === undefined) {
      setCorsHeaders(res);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const subject = `Cảnh báo ${type === 'temperature' ? 'nhiệt độ' : 'độ ẩm'}`;
    const message = `
      <h2>Cảnh báo ${type === 'temperature' ? 'nhiệt độ' : 'độ ẩm'}</h2>
      <p>Giá trị hiện tại: ${value}${type === 'temperature' ? '°C' : '%'}</p>
      <p>Đã vượt ngưỡng ${isHigh ? 'cao' : 'thấp'}: ${threshold}${type === 'temperature' ? '°C' : '%'}</p>
      <p>Thời gian: ${new Date().toLocaleString('vi-VN')}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ALERT_EMAIL_RECIPIENT,
      subject,
      html: message,
    });

    setCorsHeaders(res);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    setCorsHeaders(res);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};