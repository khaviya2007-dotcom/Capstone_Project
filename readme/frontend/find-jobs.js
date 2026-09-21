console.log("Find Jobs page loaded!");

let allJobs = [];

// Fetch jobs from backend
fetch("http://localhost:5000/api/jobs")
    .then(response => {

        if (!response.ok) {
            throw new Error("Unable to fetch jobs");
        }

        return response.json();
    })

    .then(jobs => {

        allJobs = jobs;

        displayJobs(allJobs);

    })

    .catch(error => {

        console.error(error);

        document.getElementById("jobsContainer").innerHTML = `
            <div class="empty-message">
                <h2>😔 Unable to load jobs</h2>
                <p>Please make sure the backend server is running.</p>
            </div>
        `;
    });


function displayJobs(jobs) {

    const jobsContainer =
        document.getElementById("jobsContainer");

    const jobCount =
        document.getElementById("jobCount");

    jobsContainer.innerHTML = "";

    jobCount.textContent =
        `${jobs.length} Jobs Available`;


    if (jobs.length === 0) {

        jobsContainer.innerHTML = `
            <div class="empty-message">
                <h2>🔍 No jobs found</h2>
                <p>Try searching with different keywords.</p>
            </div>
        `;

        return;
    }


    jobs.forEach((job, index) => {

        const icons = ["💻", "🌐", "📊", "🎨", "🚀"];

        const icon = icons[index % icons.length];


        const jobCard = document.createElement("div");

        jobCard.className = "job-card";


        jobCard.innerHTML = `

            <div class="job-top">

                <div class="company-icon">
                    ${icon}
                </div>

                <span class="job-type">
                    Full Time
                </span>

            </div>


            <h3>${job.title}</h3>

            <p class="company-name">
                ${job.company}
            </p>


            <div class="job-info">

                <p>
                    <span>📍</span>
                    ${job.location}
                </p>

                <p>
                    <span>💼</span>
                    Full Time
                </p>

            </div>


            <div class="job-bottom">

                <span class="salary">
                    ₹${job.salary}
                </span>


                <button
                    class="apply-btn"
                onclick="applyJob(${job.id})"
                    Apply Now →
                </button>

            </div>

        `;


        jobsContainer.appendChild(jobCard);

    });

}


// Search Function
function searchJobs() {

    const searchText =
        document.getElementById("searchInput")
            .value
            .toLowerCase();

    const locationText =
        document.getElementById("locationInput")
            .value
            .toLowerCase();

    const filteredJobs = allJobs.filter(job => {

        const matchesTitle =
            job.title.toLowerCase()
                .includes(searchText);

        const matchesLocation =
            job.location.toLowerCase()
                .includes(locationText);


        return matchesTitle && matchesLocation;

    });
    displayJobs(filteredJobs);

}
function applyJob(jobId) {

    window.location.href =
        `apply-job.html?jobId=${jobId}`;

}