const urlParams = new URLSearchParams(window.location.search);

const jobId = urlParams.get("jobId");

const user = JSON.parse(localStorage.getItem("user"));

if (!user || !user.id) {

    alert("Please login as Job Seeker first!");

} else if (!jobId) {

    alert("Job not found!");

} else {

    const applicationData = {
        job_id: Number(jobId),
        user_id: user.id
    };

    fetch("http://localhost:5000/api/applications", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(applicationData)
    })

    .then(response => response.json())

    .then(data => {

        if (data.success || data.message === "Application submitted successfully!") {

            alert("Application submitted successfully!");

            window.location.href = "applications.html";

        } else {

            alert(data.message || "Application failed!");

        }

    })

    .catch(error => {

        console.error("Application Error:", error);

        alert("Backend connection failed!");

    });

}