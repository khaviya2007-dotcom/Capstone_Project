// =====================================
// OTP TIMER - 5 MINUTES
// =====================================

let timeLeft = 300;

const timerElement = document.getElementById("timer");

const timer = setInterval(() => {

    timeLeft--;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    if (timerElement) {
        timerElement.textContent =
            `Time remaining: ${minutes}:${seconds
                .toString()
                .padStart(2, "0")}`;
    }

    if (timeLeft <= 0) {

        clearInterval(timer);

        if (timerElement) {
            timerElement.textContent = "OTP expired!";
        }
    }

}, 1000);


// =====================================
// GET OTP USER ID
// =====================================

function getOTPUserId() {

    // First check sessionStorage
    let userId =
        sessionStorage.getItem("otpUserId");

    // If not found, check localStorage
    if (!userId) {
        userId =
            localStorage.getItem("otpUserId");
    }

    return userId;
}


// =====================================
// VERIFY OTP
// =====================================

async function verifyOTP() {

    const otpInput =
        document.getElementById("otpInput");

    const message =
        document.getElementById("message");

    const enteredOTP =
        otpInput ? otpInput.value.trim() : "";

    // Get user ID from BOTH storages
    const userId = getOTPUserId();


    // ---------------------------------
    // OTP EMPTY
    // ---------------------------------

    if (!enteredOTP) {

        message.textContent =
            "Please enter the OTP.";

        return;
    }


    // ---------------------------------
    // OTP TIMER EXPIRED
    // ---------------------------------

    if (timeLeft <= 0) {

        message.textContent =
            "OTP expired. Please login again.";

        return;
    }


    // ---------------------------------
    // USER ID NOT FOUND
    // ---------------------------------

    if (!userId) {

        console.error(
            "OTP USER ID NOT FOUND"
        );

        message.textContent =
            "Login session expired. Please login again.";

        return;
    }


    // ---------------------------------
    // VERIFY WITH BACKEND
    // ---------------------------------

    try {

        message.textContent =
            "Verifying OTP...";


        const response = await fetch(
            "http://localhost:5000/api/verify-otp",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    userId: Number(userId),

                    otp: enteredOTP

                })
            }
        );


        const data =
            await response.json();


        console.log(
            "OTP VERIFY RESPONSE:",
            data
        );


        // ---------------------------------
        // BACKEND ERROR
        // ---------------------------------

        if (!response.ok || !data.success) {

            message.textContent =
                data.message ||
                "Invalid OTP.";

            return;
        }


        // ---------------------------------
        // OTP SUCCESS
        // ---------------------------------

        message.textContent =
            "OTP verified successfully!";


        clearInterval(timer);


        // ---------------------------------
        // SAVE LOGGED USER
        // ---------------------------------

        if (data.user) {

            const loggedUser =
                JSON.stringify(data.user);

            sessionStorage.setItem(
                "loggedInUser",
                loggedUser
            );

            localStorage.setItem(
                "loggedInUser",
                loggedUser
            );
        }


        // ---------------------------------
        // REMOVE OTP SESSION
        // ---------------------------------

        sessionStorage.removeItem(
            "otpUserId"
        );

        localStorage.removeItem(
            "otpUserId"
        );


        // ---------------------------------
        // REDIRECT
        // ---------------------------------

        setTimeout(() => {

            if (
                data.user &&
                data.user.role === "jobseeker"
            ) {

                window.location.href =
                    "jobseeker-dashboard.html";

            }

            else if (
                data.user &&
                data.user.role === "employer"
            ) {

                window.location.href =
                    "employer-dashboard.html";

            }

            else {

                message.textContent =
                    "Login successful, but user role was not found.";
            }

        }, 1000);


    } catch (error) {

        console.error(
            "OTP VERIFY ERROR:",
            error
        );

        message.textContent =
            "Server connection failed!";
    }
}