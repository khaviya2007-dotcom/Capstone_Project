const API_URL = "http://localhost:5000/api";

const applicationList = document.getElementById("applicationList");
const searchInput = document.getElementById("searchApplication");
const filterButtons = document.querySelectorAll(".filter-btn");

let applications = [];
let currentFilter = "All";


// ==========================================
// GET LOGGED-IN EMPLOYER
// ==========================================
function getLoggedInEmployer() {

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
        console.error("No logged-in user found.");
        return null;
    }

    try {
        const user = JSON.parse(savedUser);

        const employerId = user.id ?? user.userId;

        console.log("Logged-in User:", user);
        console.log("Current Employer ID:", employerId);

        return {
            ...user,
            employerId: employerId
        };

    } catch (error) {
        console.error("Invalid user data:", error);
        return null;
    }
}


// ==========================================
// LOAD APPLICATIONS
// ==========================================
async function loadApplications() {

    try {

        const employer = getLoggedInEmployer();

        if (!employer || employer.employerId == null) {

            applicationList.innerHTML = `
                <div class="no-applications">
                    <h3>Employer login required</h3>
                    <p>Please login again as an employer.</p>
                </div>
            `;

            return;
        }


        // ==========================================
        // GET ALL APPLICATIONS
        // ==========================================
        const response = await fetch(
            `${API_URL}/applications`
        );

        if (!response.ok) {
            throw new Error(
                `Applications API failed: ${response.status}`
            );
        }

        const data = await response.json();

        console.log("Applications API Response:", data);


        // ==========================================
        // NORMALIZE APPLICATION ARRAY
        // ==========================================
        let allApplications = [];

        if (Array.isArray(data)) {

            allApplications = data;

        } else if (Array.isArray(data.applications)) {

            allApplications = data.applications;

        } else if (Array.isArray(data.data)) {

            allApplications = data.data;

        }


        console.log(
            "All Applications:",
            allApplications
        );


        // ==========================================
        // FILTER BY JOB'S EMPLOYER ID
        // ==========================================
        const employerId = String(employer.employerId);


        applications = allApplications.filter(
            function (application) {

                const applicationEmployerId =
                    application.employer_id ??
                    application.employerId;

                console.log(
                    "Application ID:",
                    application.id,
                    "Job ID:",
                    application.job_id,
                    "Employer ID:",
                    applicationEmployerId,
                    "Current Employer:",
                    employerId
                );

                return (
                    applicationEmployerId != null &&
                    String(applicationEmployerId) === employerId
                );
            }
        );


        console.log(
            "Final Employer Applications:",
            applications
        );


        // ==========================================
        // NORMALIZE APPLICATION DATA
        // ==========================================
        applications = applications.map(
            function (application) {

                let status = application.status || "Pending";

                if (status === "Applied") {
                    status = "Pending";
                }

                return {
                    id: application.id,

                    user_id: application.user_id,

                    job_id: application.job_id,

                    name:
                        application.name ||
                        application.user_name ||
                        "Candidate",

                    email:
                        application.email ||
                        application.user_email ||
                        "",

                    title:
                        application.job_title ||
                        application.title ||
                        "Job",

                    company:
                        application.company ||
                        "",

                    type:
                        application.type ||
                        "Job",

                    location:
                        application.location ||
                        "Location not available",

                    salary:
                        application.salary ||
                        "Salary not specified",

                    appliedDate:
                        application.applied_at ||
                        null,

                    status: status
                };
            }
        );


        displayApplications();


    } catch (error) {

        console.error(
            "Error loading applications:",
            error
        );

        applicationList.innerHTML = `
            <div class="no-applications">
                <h3>Unable to load applications</h3>
                <p>${escapeHTML(error.message)}</p>
            </div>
        `;
    }
}


// ==========================================
// DISPLAY APPLICATIONS
// ==========================================
function displayApplications() {

    applicationList.innerHTML = "";

    const searchText =
        (searchInput.value || "").toLowerCase().trim();


    const filteredApplications =
        applications.filter(
            function (application) {

                const title =
                    String(application.title || "")
                        .toLowerCase();

                const location =
                    String(application.location || "")
                        .toLowerCase();

                const name =
                    String(application.name || "")
                        .toLowerCase();

                const email =
                    String(application.email || "")
                        .toLowerCase();


                const matchesSearch =
                    title.includes(searchText) ||
                    location.includes(searchText) ||
                    name.includes(searchText) ||
                    email.includes(searchText);


                const status =
                    application.status || "Pending";


                const matchesFilter =
                    currentFilter === "All" ||
                    status === currentFilter;


                return (
                    matchesSearch &&
                    matchesFilter
                );
            }
        );


    // ==========================================
    // NO APPLICATIONS
    // ==========================================
    if (filteredApplications.length === 0) {

        applicationList.innerHTML = `
            <div class="no-applications">
                <h3>No applications found</h3>
                <p>No applications are available for your jobs.</p>
            </div>
        `;

        return;
    }


    // ==========================================
    // RENDER APPLICATION CARDS
    // ==========================================
    filteredApplications.forEach(
        function (application) {

            const card =
                document.createElement("div");

            card.className = "application-card";


            const safeStatus =
                String(application.status || "Pending")
                    .toLowerCase()
                    .replace(/\s+/g, "-");


            card.innerHTML = `

                <div class="application-info">

                    <h3>
                        ${escapeHTML(application.title)}
                    </h3>

                    <p class="job-name">
                        ${escapeHTML(application.company)}
                    </p>

                    <p class="location">
                        📍 ${escapeHTML(application.location)}
                    </p>

                    <p class="salary">
                        💰 ${escapeHTML(application.salary)}
                    </p>

                    <p class="applied-date">
                        Applied:
                        ${
                            application.appliedDate
                                ? new Date(
                                    application.appliedDate
                                  ).toLocaleDateString()
                                : "Today"
                        }
                    </p>

                    <p class="candidate-name">
                        Candidate:
                        ${escapeHTML(application.name)}
                    </p>

                    <p class="candidate-email">
                        Email:
                        ${escapeHTML(application.email)}
                    </p>

                </div>


                <div class="status ${safeStatus}">
                    ${escapeHTML(application.status)}
                </div>


                <button
                    class="view-btn"
                    type="button"
                >
                    View
                </button>

            `;


            applicationList.appendChild(card);


            // ==========================================
            // VIEW APPLICATION
            // ==========================================
            const viewButton =
                card.querySelector(".view-btn");


            viewButton.addEventListener(
                "click",
                function () {

                    localStorage.setItem(
                        "selectedApplication",
                        JSON.stringify(application)
                    );

                    window.location.href =
                        "applications-details.html";
                }
            );
        }
    );
}


// ==========================================
// SEARCH
// ==========================================
searchInput.addEventListener(
    "input",
    function () {
        displayApplications();
    }
);


// ==========================================
// FILTER BUTTONS
// ==========================================
filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    function (btn) {
                        btn.classList.remove("active");
                    }
                );


                button.classList.add("active");


                currentFilter =
                    button.dataset.status;


                displayApplications();
            }
        );
    }
);


// ==========================================
// HTML ESCAPE
// ==========================================
function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// START
// ==========================================
loadApplications();