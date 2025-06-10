const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// In-memory storage for QR codes (in production, use a database)
const qrStorage = {};

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const { code, nominal } = req.query;
      
      if (!code) {
        return res.status(400).json({ error: 'QR code data is required' });
      }

      // Generate a unique ID for this QR code
      const qrId = uuidv4();
      
      // Create expiration time (4 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 4);
      
      // Store QR data with expiration
      qrStorage[qrId] = {
        code,
        nominal: nominal || null,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString()
      };

      // Generate QR code image
      const qrImage = await QRCode.toDataURL(JSON.stringify({
        id: qrId,
        code,
        nominal: nominal || null
      }));

      res.status(200).json({
        qrId,
        qrImage,
        expiresAt: qrStorage[qrId].expiresAt,
        nominal: nominal || null
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  } else if (req.method === 'POST') {
    // Endpoint to validate QR code
    try {
      const { qrId } = req.body;
      
      if (!qrId) {
        return res.status(400).json({ error: 'QR ID is required' });
      }
      
      const qrData = qrStorage[qrId];
      
      if (!qrData) {
        return res.status(404).json({ error: 'QR code not found' });
      }
      
      const now = new Date();
      const expiresAt = new Date(qrData.expiresAt);
      
      if (now > expiresAt) {
        delete qrStorage[qrId];
        return res.status(410).json({ error: 'QR code has expired' });
      }
      
      res.status(200).json({
        valid: true,
        code: qrData.code,
        nominal: qrData.nominal,
        expiresAt: qrData.expiresAt
      });
    } catch (error) {
      console.error('Error validating QR code:', error);
      res.status(500).json({ error: 'Failed to validate QR code' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};