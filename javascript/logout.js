// Logout Function
function logout() {
  localStorage.removeItem("authToken"); // Remove the token from local storage
  window.location.href = "../pages/login.html"; // Redirect to login page
}
