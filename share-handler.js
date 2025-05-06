// Handle sharing functionality
function createShareButton() {
  const shareButton = document.createElement('button');
  shareButton.className = 'share-button';
  shareButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <polyline points="16 6 12 2 8 6"></polyline>
      <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
    Share
  `;
  
  shareButton.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  `;

  shareButton.addEventListener('mouseover', () => {
    shareButton.style.backgroundColor = '#45a049';
  });

  shareButton.addEventListener('mouseout', () => {
    shareButton.style.backgroundColor = '#4CAF50';
  });

  return shareButton;
}

async function shareApp() {
  const shareData = {
    title: 'Cycle Tracker',
    text: 'Check out Cycle Tracker - A secure and private way to track your menstrual cycle!',
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback for browsers that don't support the Web Share API
      const url = encodeURIComponent(shareData.url);
      const text = encodeURIComponent(shareData.text);
      window.open(`mailto:?subject=${shareData.title}&body=${text}%0A%0A${url}`);
    }
  } catch (err) {
    console.log('Error sharing:', err);
  }
}

// Add share button to the page
function addShareButton() {
  if (navigator.share || navigator.clipboard) {
    const shareButton = createShareButton();
    shareButton.addEventListener('click', shareApp);
    
    // Add to the header navigation
    const nav = document.querySelector('nav');
    if (nav) {
      nav.appendChild(shareButton);
    }
  }
}

// Initialize share functionality when the page loads
document.addEventListener('DOMContentLoaded', addShareButton); 