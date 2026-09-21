const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        // Get input values
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message = document.getElementById("message");


        // Clear previous message
        message.textContent = "";
        message.style.color = "red";


        // Name validation
        if (name.length < 3) {

            message.textContent =
                "Please enter a valid name (minimum 3 characters)";

            return;
        }


        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            message.textContent =
                "Please enter a valid email address";

            return;
        }


        // Password validation
        if (password.length < 6) {

            message.textContent =
                "Password must be at least 6 characters";

            return;
        }


        // Confirm password validation
        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match";

            return;
        }


        // Sending message
        message.style.color = "#2563eb";
        message.textContent = "Creating your account...";


        try {

            // API call
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

                        // Automatically Job Seeker
                        role: "jobseeker"

                    })

                }
            );


            const data = await response.json();


            // Registration successful
            if (data.success) {

                message.style.color = "green";

                message.textContent =
                    "🎉 Registration successful! Redirecting to login...";


                // Redirect after 2 seconds
                setTimeout(() => {

                    window.location.href =
                        "seeker-login.html";

                }, 2000);

            }

            // Registration failed
            else {

                message.style.color = "red";

                message.textContent =
                    data.message || "Registration failed";

            }

        }

        catch (error) {

            console.error(error);

            message.style.color = "red";

            message.textContent =
                "❌ Cannot connect to server. Please try again.";

        }

    });

}