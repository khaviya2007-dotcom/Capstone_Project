const API_URL = "http://localhost:5000/api";

const jobList = document.getElementById("jobList");
const editForm = document.getElementById("editForm");

let allJobs = [];


// ==========================================
// CHECK LOGIN
// ==========================================

const savedUser = localStorage.getItem("user");

if (!savedUser) {

    alert("Please login as Employer first!");

    window.location.href = "employer-login.html";

} else {

    loadMyJobs();

}


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

    try {

        return JSON.parse(savedUser);

    } catch (error) {

        console.error("Invalid user data:", error);

        localStorage.removeItem("user");

        window.location.href = "employer-login.html";

        return null;
    }
}


// ==========================================
// LOAD MY JOBS
// ==========================================

async function loadMyJobs() {

    try {

        const user = getCurrentUser();

        if (!user) return;

        const employerId = user.id ?? user.userId;

        if (employerId == null) {

            alert("Employer ID not found. Please login again.");

            window.location.href = "employer-login.html";

            return;
        }


        const response = await fetch(`${API_URL}/jobs`);

        const text = await response.text();

        let data = {};

        try {

            data = text ? JSON.parse(text) : {};

        } catch (error) {

            console.error("Invalid GET response:", text);

            throw new Error("Backend returned invalid response.");
        }


        if (!response.ok) {

            throw new Error(
                data.message || "Failed to load jobs"
            );
        }


        let jobs = [];

        if (Array.isArray(data)) {

            jobs = data;

        } else if (Array.isArray(data.jobs)) {

            jobs = data.jobs;

        } else if (Array.isArray(data.data)) {

            jobs = data.data;

        }


        console.log("Logged-in Employer ID:", employerId);

        console.log("All Jobs:", jobs);


        allJobs = jobs.filter(job => {

            const jobEmployerId =
                job.employer_id ??
                job.employerId ??
                job.user_id ??
                job.userId;

            console.log(
                "Job:",
                job.id,
                "Employer:",
                jobEmployerId
            );

            return String(jobEmployerId) === String(employerId);

        });


        displayJobs(allJobs);


    } catch (error) {

        console.error("LOAD JOBS ERROR:", error);

        jobList.innerHTML = `
            <div class="error">
                ❌ Failed to load jobs.
                <br><br>
                ${escapeHTML(error.message)}
            </div>
        `;
    }
}


// ==========================================
// DISPLAY JOBS
// ==========================================

function displayJobs(jobs) {

    if (!jobs.length) {

        jobList.innerHTML = `
            <div class="empty">

                <h2>No Jobs Posted Yet</h2>

                <p>You haven't posted any jobs.</p>

                <br>

                <a href="post-job.html">
                    Post Your First Job
                </a>

            </div>
        `;

        return;
    }


    jobList.innerHTML = jobs.map(job => {

        return `
            <div class="job-card">

                <h2>
                    ${escapeHTML(job.title)}
                </h2>

                <div class="job-info">
                    🏢 ${escapeHTML(job.company)}
                </div>

                <div class="job-info">
                    📍 ${escapeHTML(job.location)}
                </div>

                <div class="job-info">
                    💼 ${escapeHTML(job.type)}
                </div>

                <div class="job-info">
                    💰 ${escapeHTML(job.salary)}
                </div>

                <div class="description">
                    ${escapeHTML(job.description)}
                </div>

                <div class="actions">

                    <button
                        class="edit-btn"
                        onclick="openEditModal(${Number(job.id)})"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteJob(${Number(job.id)})"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>
        `;

    }).join("");
}


// ==========================================
// OPEN EDIT MODAL
// ==========================================

function openEditModal(jobId) {

    const job = allJobs.find(
        item => String(item.id) === String(jobId)
    );


    if (!job) {

        alert("Job not found!");

        return;
    }


    document.getElementById("editJobId").value =
        job.id;

    document.getElementById("editTitle").value =
        job.title || "";

    document.getElementById("editCompany").value =
        job.company || "";

    document.getElementById("editLocation").value =
        job.location || "";

    document.getElementById("editType").value =
        job.type || "";

    document.getElementById("editSalary").value =
        job.salary || "";

    document.getElementById("editDescription").value =
        job.description || "";


    document.getElementById("editModal").style.display =
        "flex";
}


// ==========================================
// CLOSE EDIT MODAL
// ==========================================

function closeEditModal() {

    document.getElementById("editModal").style.display =
        "none";
}


// ==========================================
// SAVE EDITED JOB
// ==========================================

if (editForm) {

    editForm.addEventListener("submit", async function (e) {

        e.preventDefault();


        const jobId =
            document.getElementById("editJobId").value;


        const jobData = {

            title:
                document.getElementById("editTitle")
                    .value
                    .trim(),

            company:
                document.getElementById("editCompany")
                    .value
                    .trim(),

            location:
                document.getElementById("editLocation")
                    .value
                    .trim(),

            type:
                document.getElementById("editType")
                    .value,

            salary:
                document.getElementById("editSalary")
                    .value
                    .trim(),

            description:
                document.getElementById("editDescription")
                    .value
                    .trim()
        };


        console.log("🔥 SENDING PUT REQUEST");

        console.log(
            "URL:",
            `${API_URL}/jobs/${jobId}`
        );

        console.log(
            "DATA:",
            jobData
        );


        try {

            const response = await fetch(
                `${API_URL}/jobs/${jobId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(jobData)
                }
            );


            const text = await response.text();

            console.log(
                "PUT STATUS:",
                response.status
            );

            console.log(
                "PUT RESPONSE:",
                text
            );


            let result = {};

            if (text) {

                try {

                    result = JSON.parse(text);

                } catch (error) {

                    console.error(
                        "PUT response is not JSON:",
                        text
                    );

                    throw new Error(
                        "Backend returned invalid response."
                    );
                }
            }


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    `Update failed (${response.status})`
                );
            }


            alert(
                result.message ||
                "Job updated successfully!"
            );


            closeEditModal();

            await loadMyJobs();


        } catch (error) {

            console.error(
                "❌ UPDATE JOB ERROR:",
                error
            );

            alert(
                "❌ " + error.message
            );
        }

    });
}


// ==========================================
// DELETE JOB
// ==========================================

async function deleteJob(jobId) {

    const confirmed = confirm(
        "Are you sure you want to delete this job?"
    );


    if (!confirmed) {

        return;
    }


    console.log("🔥 SENDING DELETE REQUEST");

    console.log(
        "URL:",
        `${API_URL}/jobs/${jobId}`
    );


    try {

        const response = await fetch(
            `${API_URL}/jobs/${jobId}`,
            {
                method: "DELETE"
            }
        );


        const text = await response.text();


        console.log(
            "DELETE STATUS:",
            response.status
        );

        console.log(
            "DELETE RESPONSE:",
            text
        );


        let result = {};


        if (text) {

            try {

                result = JSON.parse(text);

            } catch (error) {

                console.error(
                    "DELETE response is not JSON:",
                    text
                );

                throw new Error(
                    "Backend returned invalid response."
                );
            }
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                `Delete failed (${response.status})`
            );
        }


        alert(
            result.message ||
            "Job deleted successfully!"
        );


        await loadMyJobs();


    } catch (error) {

        console.error(
            "❌ DELETE JOB ERROR:",
            error
        );

        alert(
            "❌ " + error.message
        );
    }
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}