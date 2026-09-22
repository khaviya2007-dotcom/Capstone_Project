document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // API
    // =====================================================

    const API_URL = "http://localhost:5000/api";


    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    const userData = localStorage.getItem("user");

    if (!userData) {
        window.location.href = "employer-login.html";
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {

        console.error("Invalid user data:", error);

        localStorage.removeItem("user");

        window.location.href = "employer-login.html";

        return;
    }


    // =====================================================
    // EMPLOYER ID
    // =====================================================

    const employerId =
        user.id ||
        user.user_id ||
        user.userId ||
        user.employer_id;

    if (!employerId) {

        console.error(
            "❌ Employer ID not found in localStorage.user",
            user
        );

        alert("Employer ID not found. Please login again.");

        localStorage.removeItem("user");

        window.location.href = "employer-login.html";

        return;
    }


    // =====================================================
    // CHECK EMPLOYER ROLE
    // =====================================================

    if (
        user.role &&
        String(user.role).toLowerCase() !== "employer"
    ) {

        alert("❌ Employer access only.");

        localStorage.removeItem("user");

        window.location.href = "employer-login.html";

        return;
    }


    // =====================================================
    // USER DETAILS
    // =====================================================

    const employerName =
        user.name ||
        user.company ||
        user.company_name ||
        "Employer";


    const companyName =
        document.getElementById("companyName");

    const welcomeName =
        document.getElementById("welcomeName");

    const userEmail =
        document.getElementById("userEmail");


    if (companyName) {
        companyName.innerText = employerName;
    }

    if (welcomeName) {
        welcomeName.innerText = employerName;
    }

    if (userEmail) {
        userEmail.innerText =
            user.email || "Employer Account";
    }


    // =====================================================
    // AVATAR
    // =====================================================

    const avatar =
        document.querySelector(".avatar");

    if (avatar) {

        avatar.innerText =
            employerName
                .charAt(0)
                .toUpperCase();
    }


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    async function loadDashboard() {

        try {

            console.log("================================");
            console.log("📊 EMPLOYER DASHBOARD");
            console.log("Employer ID:", employerId);
            console.log("================================");


            // =================================================
            // 1. LOAD ALL JOBS
            // =================================================

            const jobsResponse =
                await fetch(`${API_URL}/jobs`);


            if (!jobsResponse.ok) {
                throw new Error(
                    "Failed to load jobs"
                );
            }


            const jobsData =
                await jobsResponse.json();


            console.log(
                "📦 Jobs API:",
                jobsData
            );


            let jobs = [];


            if (Array.isArray(jobsData)) {

                jobs = jobsData;

            } else if (
                Array.isArray(jobsData.jobs)
            ) {

                jobs = jobsData.jobs;

            } else if (
                Array.isArray(jobsData.data)
            ) {

                jobs = jobsData.data;
            }


            console.log(
                "All jobs:",
                jobs
            );


            // =================================================
            // 2. FILTER THIS EMPLOYER'S JOBS
            // =================================================

            const employerJobs =
                jobs.filter(job => {

                    const jobEmployerId =
                        job.employer_id ??
                        job.employerId ??
                        job.user_id ??
                        job.userId;

                    return (
                        String(jobEmployerId) ===
                        String(employerId)
                    );

                });


            console.log(
                "✅ Employer Jobs:",
                employerJobs
            );


            // =================================================
            // 3. JOB COUNT
            // =================================================

            const jobCount =
                document.getElementById(
                    "jobCount"
                );


            if (jobCount) {

                jobCount.innerText =
                    employerJobs.length;
            }


            // =================================================
            // 4. GET EMPLOYER APPLICATIONS
            // =================================================

            const applicationsResponse =
                await fetch(
                    `${API_URL}/applications/employer/${employerId}`
                );


            if (!applicationsResponse.ok) {

                throw new Error(
                    "Failed to load employer applications"
                );
            }


            const applicationsData =
                await applicationsResponse.json();


            console.log(
                "📦 Employer Applications API:",
                applicationsData
            );


            let applications = [];


            if (
                Array.isArray(
                    applicationsData
                )
            ) {

                applications =
                    applicationsData;

            } else if (
                Array.isArray(
                    applicationsData.applications
                )
            ) {

                applications =
                    applicationsData.applications;

            } else if (
                Array.isArray(
                    applicationsData.data
                )
            ) {

                applications =
                    applicationsData.data;
            }


            console.log(
                "✅ Employer Applications:",
                applications
            );


            // =================================================
            // 5. APPLICATION COUNT
            // =================================================

            const applicationCount =
                document.getElementById(
                    "applicationCount"
                );


            if (applicationCount) {

                applicationCount.innerText =
                    applications.length;
            }


            // =================================================
            // 6. HIRED COUNT
            // =================================================

            const hiredApplications =
                applications.filter(
                    application => {

                        const status =
                            String(
                                application.status || ""
                            )
                            .trim()
                            .toLowerCase();

                        return status === "hired";
                    }
                );


            const hiredCount =
                document.getElementById(
                    "hiredCount"
                );


            if (hiredCount) {

                hiredCount.innerText =
                    hiredApplications.length;
            }


            // =================================================
            // DEBUG
            // =================================================

            console.log(
                "--------------------------------"
            );

            console.log(
                "Employer ID:",
                employerId
            );

            console.log(
                "Jobs Posted:",
                employerJobs.length
            );

            console.log(
                "Applications:",
                applications.length
            );

            console.log(
                "Candidates Hired:",
                hiredApplications.length
            );

            console.log(
                "--------------------------------"
            );


        } catch (error) {

            console.error(
                "❌ Dashboard loading error:",
                error
            );

            /*
             * Don't hide the actual problem.
             * Keep values at 0 only when API fails.
             */

            const jobCount =
                document.getElementById(
                    "jobCount"
                );

            const applicationCount =
                document.getElementById(
                    "applicationCount"
                );

            const hiredCount =
                document.getElementById(
                    "hiredCount"
                );


            if (jobCount) {
                jobCount.innerText = "0";
            }

            if (applicationCount) {
                applicationCount.innerText = "0";
            }

            if (hiredCount) {
                hiredCount.innerText = "0";
            }

        }

    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    window.goTo = function(page) {

        if (!page) {
            return;
        }

        console.log(
            "➡️ Opening:",
            page
        );

        window.location.href = page;
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    window.logout = function() {

        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmLogout) {
            return;
        }


        localStorage.removeItem("user");
        localStorage.removeItem("employer");
        localStorage.removeItem("pendingLogin");
        localStorage.removeItem("otpUserId");
        localStorage.removeItem("otpEmail");
        localStorage.removeItem("otpRole");
        localStorage.removeItem("otpExpiresAt");


        window.location.href =
            "employer-login.html";
    };


    // =====================================================
    // START
    // =====================================================

    loadDashboard();

});