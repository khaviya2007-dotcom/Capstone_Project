const jobForm = document.getElementById("jobForm");

if (!jobForm) {
    console.error("❌ jobForm not found!");
} else {

    jobForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        console.log("✅ PUBLISH JOB BUTTON CLICKED");

        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            alert("Please login again.");
            window.location.href = "employer-login.html";
            return;
        }

        let user;

        try {
            user = JSON.parse(storedUser);
        } catch (error) {
            console.error("Invalid user data:", error);
            alert("Login data is invalid. Please login again.");
            return;
        }

        const employerId = user.id || user.userId;

        console.log("LOGGED IN USER:", user);
        console.log("EMPLOYER ID USED FOR JOB:", employerId);

        if (!employerId) {
            alert("Employer ID not found. Please login again.");
            return;
        }

        const jobData = {
            employer_id: employerId,
            title: document.getElementById("jobTitle").value.trim(),
            company: document.getElementById("company").value.trim(),
            location: document.getElementById("location").value.trim(),
            type: document.getElementById("jobType").value,
            salary: document.getElementById("salary").value.trim(),
            description: document.getElementById("description").value.trim()
        };

        console.log("JOB DATA SENT TO BACKEND:", jobData);
        console.log("🚀 SENDING POST REQUEST...");

        try {

            const response = await fetch("http://localhost:5000/api/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jobData)
            });

            console.log("📡 RESPONSE STATUS:", response.status);

            const text = await response.text();

            console.log("📡 RAW BACKEND RESPONSE:", text);

            let data = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch (error) {
                console.error("❌ Backend response is not JSON:", text);
            }

            if (!response.ok) {
                alert(data.message || "Failed to post job.");
                return;
            }

            if (!data.success) {
                alert(data.message || "Failed to post job.");
                return;
            }

            console.log("✅ JOB POSTED SUCCESSFULLY:", data);

            alert("✅ Job posted successfully!");

            jobForm.reset();

            window.location.href = "employer-dashboard.html";

        } catch (error) {

            console.error("❌ POST JOB ERROR:", error);

            alert(
                "Unable to connect to backend.\n\n" +
                error.message
            );
        }
    });
}