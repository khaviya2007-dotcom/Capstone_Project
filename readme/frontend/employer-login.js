document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("employerLoginForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (e) => {

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
                        // IMPORTANT
                        role: "employer"

                    })
                }
            );

            const data = await response.json();
if (data.success) {

    message.style.color = "green";

    message.innerText =
        "✅ Login successful! Redirecting...";

    const loggedInUser = {
        ...data.user,
        id: data.user.id || data.user.employer_id,
        role: "employer"
    };

    localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
    );

    setTimeout(() => {

        window.location.href =
            "employer-dashboard.html";

    }, 1200);

}

             else {
                message.style.color = "red";

                message.innerText =
                    "❌ " +
                    (data.message || "Login failed!");

            }

        } catch (error) {

            console.error("Employer Login Error:", error);

            message.style.color = "red";

            message.innerText =
                "❌ Cannot connect to server!";

        }

    });

});