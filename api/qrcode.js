const QRCode = require('qrcode');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, nominal } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Parameter "code" diperlukan' });
    }

    // Generate QR code as PNG buffer
    const qrBuffer = await new Promise((resolve, reject) => {
      QRCode.toBuffer(code, {
        type: 'png',
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer);
      });
    });

    // Set cache control (4 jam)
    res.setHeader('Cache-Control', 'public, max-age=14400');
    res.setHeader('Content-Type', 'image/png');
    
    return res.status(200).send(qrBuffer);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Gagal membuat QR code',
      details: error.message 
    });
  }
};