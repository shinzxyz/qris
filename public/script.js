document.addEventListener('DOMContentLoaded', function() {
  const qrDataInput = document.getElementById('qr-data');
  const nominalInput = document.getElementById('nominal');
  const generateBtn = document.getElementById('generate-btn');
  const qrResult = document.getElementById('qr-result');
  const qrCodeContainer = document.getElementById('qr-code');
  const qrUrlContainer = document.getElementById('qr-url');
  const copyBtn = document.getElementById('copy-btn');

  generateBtn.addEventListener('click', generateQRCode);
  copyBtn.addEventListener('click', copyQRUrl);

  function generateQRCode() {
    const data = qrDataInput.value.trim();
    const nominal = nominalInput.value.trim();

    if (!data) {
      alert('Please enter QR code data');
      return;
    }

    // Generate QR code locally for display
    QRCode.toDataURL(data, {
      width: 300,
      margin: 2
    }, (err, url) => {
      if (err) {
        console.error(err);
        alert('Error generating QR code');
        return;
      }

      qrCodeContainer.innerHTML = `<img src="${url}" alt="QR Code">`;
      
      // Generate the URL for the API endpoint
      let apiUrl = `${window.location.origin}/qrcode?code=${encodeURIComponent(data)}`;
      if (nominal) {
        apiUrl += `&nominal=${encodeURIComponent(nominal)}`;
      }
      
      qrUrlContainer.textContent = apiUrl;
      qrResult.style.display = 'block';
    });
  }

  function copyQRUrl() {
    const url = qrUrlContainer.textContent;
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('URL copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy URL');
      });
  }
});