
const urlParams = new URLSearchParams(window.location.search);
const index = parseInt(urlParams.get("index"));

// Get jobs from localStorage
const jobs = JSON.parse(localStorage.getItem("jobs")) || [];

// Check whether job exists
if (isNaN(index) || !jobs[index]) {

    document.body.innerHTML = `
        <div style="text-align:center; padding:50px;">
            <h2>Job not found</h2>
            <a href="find-jobs.html">← Back to Jobs</a>
        </div>
    `;

} else {

    const job = jobs[index];

    // Display job details
    document.getElementById("jobTitle").textContent =
        job.title || "No title";

    document.getElementById("jobType").textContent =
        job.type || "Job type not available";

    document.getElementById("jobLocation").textContent =
        "📍 " + (job.location || "Location not available");

    document.getElementById("jobSalary").textContent =
        "💰 " + (job.salary || "Salary not specified");

    document.getElementById("jobDescription").textContent =
        job.description || "No description available";

    document.getElementById("jobPostedDate").textContent =
        "Posted: " + (job.postedDate || "Today");


    // Apply button
    document.getElementById("applyBtn").addEventListener("click", function () {

        window.location.href = "apply-job.html?index=" + index;

    });
}