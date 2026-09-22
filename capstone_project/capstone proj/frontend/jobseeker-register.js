document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("message");

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        // Get input values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        // Clear previous message
        message.innerText = "";

        // Validate passwords
        if (password !== confirmPassword) {

            message.style.color = "red";
            message.innerText = "❌ Passwords do not match!";

            return;
        }

        // Password length validation
        if (password.length < 6) {

            message.style.color = "red";
            message.innerText =
                "❌ Password must be at least 6 characters!";

            return;
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password,
                        role: "jobseeker"
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                message.style.color = "green";

                message.innerText =
                    "✅ Registration successful! Please check your email for verification.";

                // Clear form
                registerForm.reset();

                // Redirect after 3 seconds
                setTimeout(() => {

                    window.location.href =
                        "jobseeker-login.html";

                }, 3000);

            } else {

                message.style.color = "red";

                message.innerText =
                    "❌ " +
                    (data.message || "Registration failed!");

            }

        } catch (error) {

            console.error("Error:", error);

            message.style.color = "red";

            message.innerText =
                "❌ Cannot connect to server. Make sure backend is running!";

        }

    });

});