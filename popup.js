document.addEventListener("DOMContentLoaded", function() {
  const extractButton = document.getElementById("extractButton");
  const imageContainer = document.getElementById("imageContainer");
  const downloadButton = document.getElementById("downloadButton");

  let imageUrls = [];

  extractButton.addEventListener("click", function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: extractImageInfo
      }, function(results) {
        imageUrls = results[0].result;
        renderImages(imageUrls);
        downloadButton.disabled = false; // Enable the download button
      });
    });
  });

  downloadButton.addEventListener("click", function() {
    if (imageUrls.length > 0) {
      downloadImages(imageUrls);
    }
  });
});

function downloadImages(imageUrls) {
  const zip = new JSZip();

  imageUrls.forEach((imageUrl, index) => {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        zip.file(fileName, blob);

        if (index === imageUrls.length - 1) {
          zip.generateAsync({ type: "blob" })
            .then(content => {
              const zipFileName = "downloaded_images.zip";
              saveAs(content, zipFileName);
            });
        }
      });
  });
}


function extractImageInfo() {
  const imageElements = document.querySelectorAll("img");
  if (imageElements.length > 0) {
    const imageUrls = Array.from(imageElements).map(image => image.src);
    return imageUrls;
  } else {
    return [];
  }
}

function renderImages(imageUrls) {
  const imageContainer = document.getElementById("imageContainer");
  imageContainer.innerHTML = ''; // Clear previous images

  if (imageUrls.length > 0) {
    imageUrls.forEach(imageUrl => {
      const imgElement = document.createElement("img");
      imgElement.src = imageUrl;
      imgElement.style.maxWidth = "100%";
      imgElement.style.marginTop = "10px";
      imageContainer.appendChild(imgElement);
    });
  } else {
    imageContainer.textContent = "No images found.";
  }
}
