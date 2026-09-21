const API_URL = "http://localhost:5000/api";

// ===============================
// LOAD USER
// ===============================
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    window.location.href = "seeker-login.html";
}

// ===============================
// LOAD JOBS
// ===============================
async function loadJobs() {
    try {
        const response = await fetch(`${API_URL}/jobs`);
        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
            throw new Error("Failed to fetch jobs");
        }

        const jobList = document.getElementById("jobList");

        if (!jobList) return;

        jobList.innerHTML = "";

        data.forEach(job => {
            const jobCard = document.createElement("div");

            jobCard.className = "job-card";

            jobCard.innerHTML = `
                <h3>${job.title}</h3>
                <p>🏢 ${job.company}</p>
                <p>📍 ${job.location || "Location not available"}</p>
                <p>💰 ${job.salary || "Salary not specified"}</p>
                <p>💼 ${job.type || "Type not specified"}</p>

                <button onclick="applyJob(${job.id})">
                    Apply Now
                </button>
            `;

            jobList.appendChild(jobCard);
        });

    } catch (error) {
        console.error("Jobs Error:", error);
    }
}

// ===============================
// LOAD APPLICATION COUNT
// ===============================
async function loadApplications() {
    try {
        const response = await fetch(
            `${API_URL}/applications/user/${user.id}`
        );

        const data = await response.json();

        console.log("Applications:", data);

        const applicationCount =
            document.getElementById("applicationCount");

        if (!applicationCount) return;

        if (Array.isArray(data)) {
            applicationCount.textContent = data.length;
        } else if (data.applications) {
            applicationCount.textContent =
                data.applications.length;
        } else {
            applicationCount.textContent = "0";
        }

    } catch (error) {
        console.error("Applications Error:", error);

        const applicationCount =
            document.getElementById("applicationCount");

        if (applicationCount) {
            applicationCount.textContent = "0";
        }
    }
}

// ===============================
// APPLY JOB
// ===============================
async function applyJob(jobId) {

    try {
        const response = await fetch(
            `${API_URL}/applications`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    job_id: jobId,
                    user_id: user.id
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            alert("Application submitted successfully!");

            loadApplications();

        } else {

            alert(data.message || "Application failed!");

        }

    } catch (error) {

        console.error("Apply Error:", error);

        alert("Something went wrong!");

    }
}

// ===============================
// LOGOUT
// ===============================
function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");

    window.location.replace("login.html");
}

// ===============================
// PAGE LOAD
// ===============================
document.addEventListener("DOMContentLoaded", function () {

    loadJobs();

    loadApplications();

});