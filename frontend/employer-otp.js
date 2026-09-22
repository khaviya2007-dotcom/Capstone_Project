document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("otpForm");
    const otpInput = document.getElementById("otp");
    const message = document.getElementById("message");
    const emailText = document.getElementById("emailText");
    const verifyButton = document.getElementById("verifyButton");
    const timer = document.getElementById("timer");

    const userId = localStorage.getItem("otpUserId");
    const email = localStorage.getItem("otpEmail");

    // Server generated expiry time
    const expiresAt = Number(
        localStorage.getItem("otpExpiresAt")
    );

    console.log("User ID:", userId);
    console.log("Email:", email);
    console.log("Expires At:", expiresAt);


    // ==========================================
    // BASIC LOGIN DATA CHECK
    // ==========================================

    if (!userId || !email) {

        timer.textContent = "OTP unavailable";
        timer.style.color = "red";

        verifyButton.disabled = true;
        otpInput.disabled = true;

        message.style.color = "red";
        message.textContent =
            "❌ Please login again to receive a new OTP.";

        return;
    }


    emailText.textContent =
        `OTP sent to: ${email}`;


    // ==========================================
    // TIMER
    // ==========================================

    let countdown = null;

    function updateTimer() {

        const remaining =
            expiresAt - Date.now();


        // ======================================
        // ONLY WHEN 3 MINUTES ARE FINISHED
        // ======================================

        if (remaining <= 0) {

            if (countdown !== null) {
                clearInterval(countdown);
            }

            timer.textContent =
                "OTP expired";

            timer.style.color =
                "red";

            verifyButton.disabled =
                true;

            otpInput.disabled =
                true;

            message.style.color =
                "red";

            message.textContent =
                "❌ Login session expired. Please login again.";

            return;
        }


        // ======================================
        // REMAINING TIME
        // ======================================

        const totalSeconds =
            Math.ceil(remaining / 1000);

        const minutes =
            Math.floor(totalSeconds / 60);

        const seconds =
            totalSeconds % 60;


        timer.textContent =
            `OTP expires in ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


        if (totalSeconds <= 60) {
            timer.style.color = "red";
        } else {
            timer.style.color = "#007bff";
        }
    }


    // Start immediately
    updateTimer();

    // Continue every second
    countdown = setInterval(
        updateTimer,
        1000
    );


    // ==========================================
    // OTP INPUT
    // ==========================================

    otpInput.addEventListener("input", () => {

        otpInput.value =
            otpInput.value
                .replace(/\D/g, "")
                .slice(0, 6);

    });


    // ==========================================
    // VERIFY OTP
    // ==========================================

    form.addEventListener("submit", async (e) => {

        e.preventDefault();


        // Check real expiry
        if (Date.now() >= expiresAt) {

            updateTimer();

            return;
        }


        const otp =
            otpInput.value.trim();


        if (!/^\d{6}$/.test(otp)) {

            message.style.color = "red";

            message.textContent =
                "❌ Please enter the 6-digit OTP.";

            return;
        }


        try {

            verifyButton.disabled = true;
            verifyButton.textContent =
                "Verifying...";

            message.style.color = "#555";
            message.textContent =
                "⏳ Verifying OTP...";


            const response =
                await fetch(
                    "http://localhost:5000/api/verify-otp",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            userId: userId,
                            otp: otp
                        })
                    }
                );


            const data =
                await response.json();

            console.log(
                "OTP RESPONSE:",
                data
            );


            if (!response.ok || !data.success) {

                message.style.color = "red";

                message.textContent =
                    "❌ " +
                    (
                        data.message ||
                        "Invalid or expired OTP!"
                    );

                verifyButton.disabled = false;

                verifyButton.textContent =
                    "Verify OTP";

                return;
            }


            if (!data.user) {

                message.style.color = "red";

                message.textContent =
                    "❌ Server did not return user details.";

                verifyButton.disabled = false;

                verifyButton.textContent =
                    "Verify OTP";

                return;
            }


            // ======================================
            // SUCCESS
            // ======================================

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            localStorage.setItem(
                "employer",
                JSON.stringify(data.user)
            );


            // Remove OTP data
            localStorage.removeItem(
                "otpUserId"
            );

            localStorage.removeItem(
                "otpEmail"
            );

            localStorage.removeItem(
                "otpRole"
            );

            localStorage.removeItem(
                "otpExpiresAt"
            );

            localStorage.removeItem(
                "pendingLogin"
            );


            if (countdown !== null) {
                clearInterval(countdown);
            }


            message.style.color = "green";

            message.textContent =
                "✅ OTP verified successfully! Redirecting...";


            setTimeout(() => {

                window.location.href =
                    "employer-dashboard.html";

            }, 800);

        }

        catch (error) {

            console.error(
                "OTP Verification Error:",
                error
            );

            message.style.color = "red";

            message.textContent =
                "❌ Cannot connect to server.";

            verifyButton.disabled = false;

            verifyButton.textContent =
                "Verify OTP";
        }

    });

});