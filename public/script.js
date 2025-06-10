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
    alert('Harap masukkan data QR code');
    return;
  }

  // Generate QR code
  QRCode.toDataURL(data, {
    width: 300,
    margin: 2
  }, (err, url) => {
    if (err) {
      console.error(err);
      alert('Error membuat QR code');
      return;
    }

    qrCodeContainer.innerHTML = `<img src="${url}" alt="QR Code">`;
    qrUrlContainer.textContent = data; // Tampilkan data asli
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