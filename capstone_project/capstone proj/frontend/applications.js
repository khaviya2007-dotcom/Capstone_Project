const applicationList =
    document.getElementById("applicationList");

const searchInput =
    document.getElementById("searchApplication");

const filterButtons =
    document.querySelectorAll(".filter-btn");

let applications = [];

let currentFilter = "All";


// ===============================
// GET APPLICATIONS FROM BACKEND
// ===============================

async function loadApplications() {

    try {

        const response =
            await fetch("http://localhost:5000/api/applications");

        const data = await response.json();

        console.log("Applications from backend:", data);

const applicationData = Array.isArray(data)
    ? data
    : (data.applications || []);

applications = applicationData.map(function (application) {

    return {
        id: application.id,
        user_id: application.user_id,
        job_id: application.job_id,

        name: application.name,
        email: application.email,

        title: application.title,
        company: application.company,

        type: application.type,
        location: application.location,
        salary: application.salary,

        appliedDate: application.applied_at,

        status:
            application.status === "Applied"
                ? "Pending"
                : (application.status || "Pending")
    };

});

    } catch (error) {

        console.error("Error loading applications:", error);

        applicationList.innerHTML = `
            <div class="no-applications">
                <h3>Unable to load applications</h3>
                <p>Please check whether the backend server is running.</p>
            </div>
        `;
    }
}


// ===============================
// DISPLAY APPLICATIONS
// ===============================

function displayApplications() {

    applicationList.innerHTML = "";

    const searchText =
        searchInput.value.toLowerCase();


    const filteredApplications =
        applications.filter(function (application) {

            const title =
                (application.title || "").toLowerCase();

            const location =
                (application.location || "").toLowerCase();

            const name =
                (application.name || "").toLowerCase();

            const email =
                (application.email || "").toLowerCase();


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


            return matchesSearch && matchesFilter;

        });


    // No applications
    if (filteredApplications.length === 0) {

        applicationList.innerHTML = `
            <div class="no-applications">
                <h3>No applications found</h3>
                <p>No applications available.</p>
            </div>
        `;

        return;
    }


    // Create application cards
    filteredApplications.forEach(function (application) {

        const card =
            document.createElement("div");

        card.className = "application-card";


        card.innerHTML = `
            <div class="application-info">

                <h3>
                    ${application.title || "Job"}
                </h3>

                <p class="job-name">
                    ${application.type || "Job"}
                </p>

                <p class="location">
                    📍 ${application.location || "Location not available"}
                </p>

                <p class="salary">
                    💰 ${application.salary || "Salary not specified"}
                </p>

                <p class="applied-date">
                    Applied:
                    ${application.appliedDate
                        ? new Date(application.appliedDate).toLocaleDateString()
                        : "Today"}
                </p>

            </div>


            <div class="status ${(application.status || "Pending").toLowerCase()}">
                ${application.status || "Pending"}
            </div>


            <button class="view-btn">
                View
            </button>
        `;


        applicationList.appendChild(card);


        // ===============================
        // VIEW BUTTON
        // ===============================

        const viewButton =
            card.querySelector(".view-btn");


        viewButton.addEventListener(
            "click",
            function () {

                localStorage.setItem(
                    "selectedApplication",
                    JSON.stringify(application)
                );


                window.open(
                    "applications-details.html",
                    "_blank"
                );

            });
    

    });
}


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener(
    "input",
    displayApplications
);


// ===============================
// FILTER BUTTONS
// ===============================

filterButtons.forEach(function (button) {

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

});


// ===============================
// FIRST LOAD
// ===============================

loadApplications();