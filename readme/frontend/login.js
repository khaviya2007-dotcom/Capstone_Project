const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");


// Show / Hide Password
togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";

        togglePassword.textContent = "Show";
    }

});


// Login Form
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();


    if (!email || !password) {

        alert("Please enter your email and password.");

        return;
    }
     localStorage.setItem("isLoggedIn", "true");
localStorage.setItem("userEmail", email);

window.location.href = "dashboard.html";
    

    

});