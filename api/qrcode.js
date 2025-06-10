const QRCode = require('qrcode');

// Fungsi untuk memodifikasi data QRIS dengan nominal tertentu
function updateQRISNominal(qrisData, nominal) {
  // Validasi nominal
  if (!nominal || isNaN(nominal) return qrisData;
  
  nominal = parseInt(nominal);
  if (nominal <= 0) return qrisData;
  
  // Format nominal ke string 12 digit (standar QRIS)
  const formattedNominal = nominal.toString().padStart(12, '0');
  
  // Temukan dan ganti segment 54 (nominal) jika ada
  const amountTag = '54';
  const tagIndex = qrisData.indexOf(amountTag);
  
  if (tagIndex !== -1) {
    const lengthIndex = tagIndex + 2;
    const length = parseInt(qrisData.substr(lengthIndex, 2));
    const startIndex = lengthIndex + 2;
    const endIndex = startIndex + length;
    
    return qrisData.substring(0, startIndex) + formattedNominal + qrisData.substring(endIndex);
  }
  
  // Jika tidak ada tag 54, tambahkan (format standar QRIS)
  return qrisData + amountTag + '12' + formattedNominal;
}

module.exports = async (req, res) => {
  try {
    let { code, nominal } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Parameter code diperlukan' });
    }

    // Modifikasi data QRIS jika ada nominal
    if (nominal) {
      code = updateQRISNominal(code, nominal);
    }

    // Generate QR code sebagai PNG buffer
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

    // Set header cache 4 jam (14400 detik)
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