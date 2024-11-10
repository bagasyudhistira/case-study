async function handleLogin(event) {
  event.preventDefault(); // Prevent form from submitting the default way

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8082/auth/sign-in", {
      method: "GET",
      headers: {
        Authorization: "Basic " + btoa(email + ":" + password),
      },
    });

    if (response.ok) {
      const token = response.headers.get("authorization");
      console.log("Token received:", token); // Debug: Check if token is received

      if (token) {
        localStorage.setItem("authToken", token); // Store the token to maintain session
        alert("Login successful!");
        // Redirect to the desired page after login
        window.location.href = "../pages/dashboard.html"; // Replace with your redirect path
      } else {
        alert("Authorization token is missing in response.");
      }
    } else {
      alert("Login failed: Invalid credentials.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while logging in.");
  }
}
