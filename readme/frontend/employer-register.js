document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("employerRegisterForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        // ==========================
        // GET FORM VALUES
        // ==========================

        const companyName =
            document.getElementById("companyName").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const contactPerson =
            document.getElementById("contactPerson").value.trim();

        const mobile =
            document.getElementById("mobile").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const location =
            document.getElementById("location").value.trim();

        const website =
            document.getElementById("website").value.trim();

        const description =
            document.getElementById("description").value.trim();

        const terms =
            document.getElementById("terms").checked;


        message.innerText = "";


        // ==========================
        // VALIDATION
        // ==========================

        if (
            !companyName ||
            !email ||
            !contactPerson ||
            !mobile ||
            !password ||
            !confirmPassword ||
            !location
        ) {

            message.style.color = "red";

            message.innerText =
                "❌ Please fill all required fields!";

            return;
        }


        if (!terms) {

            message.style.color = "red";

            message.innerText =
                "❌ Please accept Terms & Conditions!";

            return;
        }


        if (password !== confirmPassword) {

            message.style.color = "red";

            message.innerText =
                "❌ Passwords do not match!";

            return;
        }


        if (password.length < 6) {

            message.style.color = "red";

            message.innerText =
                "❌ Password must contain at least 6 characters!";

            return;
        }


        if (!/^[0-9]{10}$/.test(mobile)) {

            message.style.color = "red";

            message.innerText =
                "❌ Enter a valid 10-digit mobile number!";

            return;
        }


        // ==========================
        // SEND TO BACKEND
        // ==========================

        try {

            const response = await fetch(
                "http://localhost:5000/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        // IMPORTANT
                        // Backend expects "name"
                        name: companyName,

                        email: email,

                        password: password,

                        role: "employer",

                        contactPerson: contactPerson,

                        mobile: mobile,

                        location: location,

                        website: website,

                        description: description

                    })
                }
            );


            const data = await response.json();


            // ==========================
            // SUCCESS
            // ==========================

            if (data.success) {

                message.style.color = "green";

                message.innerText =
                    "✅ Employer account created successfully! Check your email to verify your account.";

                form.reset();


                setTimeout(() => {

                    window.location.href =
                        "employer-login.html";

                }, 2000);

            }

            // ==========================
            // ERROR
            // ==========================

            else {

                message.style.color = "red";

                message.innerText =
                    "❌ " +
                    (data.message ||
                    "Registration failed!");

            }

        }

        catch (error) {

            console.error(
                "Employer Registration Error:",
                error
            );

            message.style.color = "red";

            message.innerText =
                "❌ Cannot connect to server! Make sure backend is running.";

        }

    });

});