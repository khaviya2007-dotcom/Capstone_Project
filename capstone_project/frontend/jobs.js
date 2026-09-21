
// ============================================
// JOBFINDER - POST JOB
// ============================================


// Get the job form
const jobForm = document.getElementById("jobForm");


// Check whether form exists
if (jobForm) {

    jobForm.addEventListener("submit", function (e) {

        // Stop page refresh
        e.preventDefault();


        // ============================================
        // GET JOB DETAILS
        // ============================================

        const job = {

            title: document
                .getElementById("jobTitle")
                .value
                .trim(),

            location: document
                .getElementById("location")
                .value
                .trim(),

            type: document
                .getElementById("jobType")
                .value,

            salary: document
                .getElementById("salary")
                .value
                .trim(),

            description: document
                .getElementById("description")
                .value
                .trim(),

            postedDate: new Date()
                .toLocaleDateString()

        };


        // ============================================
        // GET EXISTING JOBS
        // ============================================

        let jobs = [];

        try {

            const storedJobs =
                localStorage.getItem("jobs");

            if (storedJobs) {

                jobs = JSON.parse(storedJobs);

            }

        } catch (error) {

            console.error(
                "Error reading jobs:",
                error
            );

            jobs = [];

        }


        // Make sure jobs is an array

        if (!Array.isArray(jobs)) {

            jobs = [];

        }


        // ============================================
        // ADD NEW JOB
        // ============================================

        jobs.push(job);


        // ============================================
        // SAVE JOBS
        // ============================================

        try {

            localStorage.setItem(
                "jobs",
                JSON.stringify(jobs)
            );

        } catch (error) {

            console.error(
                "Error saving job:",
                error
            );

            alert(
                "Unable to save the job."
            );

            return;

        }


        // ============================================
        // SUCCESS MESSAGE
        // ============================================

        alert(
            "Job posted successfully!"
        );


        // ============================================
        // GO TO DASHBOARD
        // ============================================

        window.location.href =
            "dashboard.html";

    });

}