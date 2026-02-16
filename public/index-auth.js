document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const setUserId = urlParams.get('set_user_id');
  const error = urlParams.get('error');
  const rateLimited = urlParams.get('rate_limited');

  function showToast(title, message, type = "info") {
    if (typeof window.showToast === 'function') {
      window.showToast(title, message, type);
    } else {
      alert(`${title}: ${message}`);
    }
  }

  function canUseLocalStorage() {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  function checkLastAuthAttempt() {
    try {
      const lastAttempt = localStorage.getItem("lastAuthAttempt");
      if (lastAttempt) {
        const timeDiff = Date.now() - parseInt(lastAttempt);
        return timeDiff < 300000;
      }
      return false;
    } catch {
      return false;
    }
  }

  if (setUserId) {
    if (canUseLocalStorage()) {
      localStorage.setItem("ticketSystemUserId", setUserId);
      localStorage.removeItem("lastAuthAttempt");
      showToast("Login Successful", "Session data saved successfully", "success");
    } else {
      showToast("Warning", "Your browser doesn't support local storage, you may experience session issues", "warning");
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (rateLimited) {
    showToast("Warning", "You've exceeded the allowed login attempts. Please wait 5 minutes before trying again.", "warning");
    if (canUseLocalStorage() && !localStorage.getItem("lastAuthAttempt")) {
      localStorage.setItem("lastAuthAttempt", Date.now().toString());
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (error) {
    switch(error) {
      case 'banned':
        showToast("Banned", "You have been banned from using the system", "error");
        break;
      case 'not_in_guild':
        showToast("Error", "You must be a server member to use the system", "error");
        break;
      case 'oauth_error':
        showToast("Error", "An authentication error occurred, please try again", "error");
        break;
      case 'session_error':
        showToast("Error", "A session error occurred, please try again", "error");
        break;
      case 'rate_limited':
        showToast("Warning", "You've exceeded the allowed login attempts. Please wait 5 minutes before trying again.", "warning");
        if (canUseLocalStorage()) {
          localStorage.setItem("lastAuthAttempt", Date.now().toString());
        }
        break;
      default:
        showToast("Error", "An unknown error occurred", "error");
        break;
    }
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", function(e) {
      if (checkLastAuthAttempt()) {
        e.preventDefault();
        showToast("Warning", "Please wait 5 minutes between login attempts to avoid rate limiting.", "warning");
      } else {
        if (canUseLocalStorage()) {
          localStorage.setItem("lastAuthAttempt", Date.now().toString());
        }
      }
    });
  }
});