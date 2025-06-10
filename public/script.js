document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generateBtn');
  const qrDataInput = document.getElementById('qrData');
  const nominalInput = document.getElementById('nominal');
  const resultDiv = document.getElementById('result');
  const qrImage = document.getElementById('qrImage');
  const qrNominal = document.getElementById('qrNominal');
  const qrExpires = document.getElementById('qrExpires');
  const directLinkUrl = document.getElementById('directLinkUrl');

  generateBtn.addEventListener('click', generateQRCode);

  function generateQRCode() {
    const qrData = qrDataInput.value.trim();
    const nominal = nominalInput.value.trim();
    
    if (!qrData) {
      alert('Please enter QR code data');
      return;
    }
    
    // Build the query parameters
    const params = new URLSearchParams();
    params.append('code', qrData);
    if (nominal) {
      params.append('nominal', nominal);
    }
    
    fetch(`/qrcode?${params.toString()}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Display the QR code
        qrImage.src = data.qrImage;
        qrNominal.textContent = data.nominal || '-';
        
        // Format expiration date
        const expiresDate = new Date(data.expiresAt);
        qrExpires.textContent = expiresDate.toLocaleString();
        
        // Create direct link
        const directLink = `${window.location.origin}/qrcode?code=${encodeURIComponent(qrData)}${nominal ? `&nominal=${nominal}` : ''}`;
        directLinkUrl.href = directLink;
        directLinkUrl.textContent = directLink;
        
        // Show result
        resultDiv.classList.remove('hidden');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to generate QR code. Please try again.');
      });
  }
  
  // Check if there are URL parameters to auto-generate QR code
  const urlParams = new URLSearchParams(window.location.search);
  const codeParam = urlParams.get('code');
  const nominalParam = urlParams.get('nominal');
  
  if (codeParam) {
    qrDataInput.value = codeParam;
    if (nominalParam) {
      nominalInput.value = nominalParam;
    }
    generateQRCode();
  }
});