const QRCode = require('qrcode');

module.exports = async (req, res) => {
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, nominal } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Parameter "code" diperlukan' });
    }

    // Generate QR code as SVG string
    const svg = await new Promise((resolve, reject) => {
      QRCode.toString(code, {
        type: 'svg',
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (err, svg) => {
        if (err) reject(err);
        else resolve(svg);
      });
    });

    // Set cache control (4 jam)
    res.setHeader('Cache-Control', 'public, max-age=14400');
    res.setHeader('Content-Type', 'image/svg+xml');
    
    // Jika ada nominal, tambahkan teks di bawah QR code
    let finalSvg = svg;
    if (nominal) {
      finalSvg = svg.replace('</svg>', 
        `<text x="150" y="320" font-family="Arial" font-size="20" text-anchor="middle">Nominal: Rp${nominal}</text>
        </svg>`);
    }
    
    return res.status(200).send(finalSvg);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Gagal membuat QR code',
      details: error.message 
    });
  }
};