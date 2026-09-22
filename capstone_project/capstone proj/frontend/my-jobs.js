// =========================================
// JOBFINDER - MY JOBS
// =========================================

const jobsList = document.getElementById("jobsList");

function displayJobs() {

    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];

    if (jobs.length === 0) {

        jobsList.innerHTML = `
            <div class="empty-jobs">
                <h2>No Jobs Posted Yet</h2>
                <p>Start by posting your first job opportunity.</p>
            </div>
        `;

        return;
    }

    jobsList.innerHTML = "";

    jobs.forEach((job, index) => {

        const jobCard = document.createElement("div");

        jobCard.className = "job-card";

        jobCard.innerHTML = `
            <div class="job-card-header">
                <h2>${job.title}</h2>
                <span>${job.type || job.jobType || ""}</span>
            </div>

            <p class="job-location">
                📍 ${job.location}
            </p>

            <p class="job-salary">
                💰 ${job.salary}
            </p>

            <p class="job-description">
                ${job.description}
            </p>

            <p class="job-date">
                Posted: ${job.postedDate || ""}
            </p>

            <button class="delete-btn" onclick="deleteJob(${index})">
                Delete Job
            </button>
        `;

        jobsList.appendChild(jobCard);
    });
}


// Delete Job
function deleteJob(index) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
        return;
    }

    const jobs = JSON.parse(localStorage.getItem("jobs")) || [];

    jobs.splice(index, 1);

    localStorage.setItem("jobs", JSON.stringify(jobs));

    displayJobs();
}


// Load jobs
displayJobs();