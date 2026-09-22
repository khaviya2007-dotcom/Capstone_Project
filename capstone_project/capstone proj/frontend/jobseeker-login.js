document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const message = document.getElementById("message");

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        message.innerText = "";

        if (!email || !password) {

            message.style.color = "red";
            message.innerText =
                "❌ Please enter email and password!";

            return;
        }

        try {

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
                        role: "jobseeker"
                    })
                }
            );

            const data = await response.json();

            console.log("LOGIN RESPONSE:", data);

            if (!response.ok || !data.success) {

                message.style.color = "red";

                message.innerText =
                    "❌ " +
                    (data.message || "Login failed!");

                return;
            }

            // ---------------------------------
            // GET USER OBJECT
            // ---------------------------------

            const originalUser = data.user || {};

            // ---------------------------------
            // GET USER ID FROM ANY COMMON NAME
            // ---------------------------------

            const userId =
                originalUser.id ??
                originalUser.userId ??
                originalUser.user_id ??
                originalUser.ID ??
                data.userId ??
                data.user_id ??
                data.id;

            if (
                userId === undefined ||
                userId === null ||
                userId === ""
            ) {

                console.error(
                    "LOGIN SUCCESS BUT USER ID MISSING:",
                    data
                );

                message.style.color = "red";

                message.innerText =
                    "❌ Login succeeded, but User ID is missing!";

                return;
            }

            // ---------------------------------
            // CREATE NORMALIZED USER
            // ---------------------------------

            const user = {
                ...originalUser,

                // Always keep ID in these formats
                id: userId,
                userId: userId,
                user_id: userId,

                email: originalUser.email || email,

                role:
                    originalUser.role ||
                    "jobseeker"
            };

            console.log("NORMALIZED USER:", user);
            console.log("USER ID:", userId);

            // ---------------------------------
            // SAVE USER
            // ---------------------------------

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            // ---------------------------------
            // SAVE USER ID FOR OTP
            // ---------------------------------

            sessionStorage.setItem(
                "otpUserId",
                String(userId)
            );

            // Also save directly for dashboard/apply pages
            sessionStorage.setItem(
                "userId",
                String(userId)
            );

            localStorage.setItem(
                "userId",
                String(userId)
            );

            // ---------------------------------
            // DEMO OTP
            // ---------------------------------

            const demoOTP =
                Math.floor(
                    100000 + Math.random() * 900000
                ).toString();

            sessionStorage.setItem(
                "demoOTP",
                demoOTP
            );

            console.log(
                "Demo OTP:",
                demoOTP
            );

            // ---------------------------------
            // SUCCESS
            // ---------------------------------

            message.style.color = "green";

            message.innerText =
                "✅ Login successful! OTP verification...";

            setTimeout(() => {

                window.location.href =
                    "otp.html";

            }, 1000);

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

            message.style.color = "red";

            message.innerText =
                "❌ Cannot connect to server! Make sure backend is running.";

        }

    });

});