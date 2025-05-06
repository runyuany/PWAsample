// Handle service worker updates
let updateNotification = null;

// Function to show update notification
function showUpdateNotification(message) {
  // Create notification element if it doesn't exist
  if (!updateNotification) {
    updateNotification = document.createElement('div');
    updateNotification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.3s ease-out;
    `;

    // Add styles for animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // Update notification content
  updateNotification.innerHTML = `
    <span>${message}</span>
    <button onclick="window.location.reload()" style="
      background: white;
      color: #4CAF50;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    ">Update Now</button>
  `;

  // Add to document if not already present
  if (!document.body.contains(updateNotification)) {
    document.body.appendChild(updateNotification);
  }
}

// Listen for messages from the service worker
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
    showUpdateNotification(event.data.message);
  }
});

// Check for updates periodically
function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.update();
      }
    });
  }
}

// Check for updates every hour
setInterval(checkForUpdates, 60 * 60 * 1000); 