document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("employerLoginForm");
    const message = document.getElementById("message");

    if (!form) {
        console.error("❌ Employer login form not found!");
        return;
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        message.innerText = "";

        // ================================
        // VALIDATION
        // ================================

        if (!email || !password) {

            message.style.color = "red";

            message.innerText =
                "❌ Please enter email and password!";

            return;
        }

        try {

            message.style.color = "#555";
            message.innerText = "⏳ Signing in...";

            // ================================
            // LOGIN API
            // ================================

            const response = await fetch(
                "http://localhost:5000/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password,
                        role: "employer"
                    })
                }
            );

            // ================================
            // READ RESPONSE
            // ================================

            const data = await response.json();

            console.log("LOGIN RESPONSE:", data);

            // ================================
            // SERVER ERROR
            // ================================

            if (!response.ok) {

                message.style.color = "red";

                message.innerText =
                    "❌ " +
                    (
                        data.message ||
                        "Login failed!"
                    );

                return;
            }

            // ================================
            // LOGIN SUCCESS + OTP REQUIRED
            // ================================

            if (
                data.success === true &&
                data.requiresOtp === true
            ) {

                console.log(
                    "✅ Password correct. OTP required."
                );

                console.log(
                    "User ID:",
                    data.userId
                );

                console.log(
                    "Email:",
                    data.email
                );

                console.log(
                    "Role:",
                    data.role
                );

                console.log(
                    "OTP Expires At:",
                    data.expiresAt
                );


                // ================================
                // CHECK SERVER EXPIRY TIME
                // ================================

                if (!data.expiresAt) {

                    console.error(
                        "❌ Server did not send OTP expiry time!"
                    );

                    message.style.color = "red";

                    message.innerText =
                        "❌ OTP expiry time missing. Please try again.";

                    return;
                }


                // ================================
                // SAVE OTP LOGIN INFORMATION
                // ================================

                localStorage.setItem(
                    "otpUserId",
                    String(data.userId)
                );

                localStorage.setItem(
                    "otpEmail",
                    data.email
                );

                localStorage.setItem(
                    "otpRole",
                    data.role
                );


                // IMPORTANT:
                // Save the EXACT server-generated
                // OTP expiry timestamp.

                localStorage.setItem(
                    "otpExpiresAt",
                    String(data.expiresAt)
                );


                // ================================
                // PENDING LOGIN
                // ================================

                localStorage.setItem(
                    "pendingLogin",
                    JSON.stringify({
                        userId: data.userId,
                        email: data.email,
                        role: data.role,
                        expiresAt: data.expiresAt
                    })
                );


                // ================================
                // SHOW MESSAGE
                // ================================

                message.style.color = "green";

                message.innerText =
                    "✅ Login verified! OTP sent to your email.";


                // ================================
                // GO TO OTP PAGE
                // ================================

                setTimeout(() => {

                    window.location.href =
                        "http://127.0.0.1:5500/frontend/employer-otp.html";

                }, 800);

                return;
            }


            // ================================
            // UNEXPECTED SUCCESS RESPONSE
            // ================================

            if (data.success === true) {

                console.warn(
                    "Login succeeded but OTP information was missing:",
                    data
                );

                message.style.color = "red";

                message.innerText =
                    "❌ Unexpected server response. Please try again.";

                return;
            }


            // ================================
            // LOGIN FAILED
            // ================================

            message.style.color = "red";

            message.innerText =
                "❌ " +
                (
                    data.message ||
                    "Invalid email or password!"
                );

        } catch (error) {

            console.error(
                "❌ Employer Login Error:",
                error
            );

            message.style.color = "red";

            message.innerText =
                "❌ Cannot connect to server!";

        }

    });

});