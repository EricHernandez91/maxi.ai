function updateStatus(message) {
  document.getElementById('status-message').textContent = message;
}

function updateProgressBar(percentage) {
  const progressBar = document.getElementById('progress-bar');
  progressBar.style.width = percentage + '%';
  progressBar.textContent = percentage + '%';
  document.getElementById('progress-container').style.display = 'block';
}

document.getElementById('submitBtn').addEventListener('click', () => {
  const imageInput = document.getElementById('imageInput');
  const imageFile = imageInput.files[0];
  
  if (imageFile) {
    updateStatus('Uploading image...');
    updateProgressBar(10);
    resizeImage(imageFile, 768, 2000, (resizedBase64Image) => {
      fetch('/process_image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: resizedBase64Image.split(',')[1] }) // Remove the Data-URI prefix.
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        updateProgressBar(50);
        updateStatus('Processing image...'); // Update status after successful upload
        return response.json();
      })
      .then(data => {
        updateProgressBar(100);
        updateStatus('Image processed. Here are your suggestions:'); // Update status after processing
        document.getElementById('suggestions').value = data.suggestions;
      })
      .catch(error => {
        console.error('Error:', error);
        updateStatus('An error occurred. Check console for details.');
      });
    });
  } else {
    alert('Please select an image to upload.');
  }
});

function resizeImage(file, maxWidth, maxHeight, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg'));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
