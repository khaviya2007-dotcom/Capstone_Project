document.addEventListener("DOMContentLoaded", () => {

    const candidatesList =
        document.getElementById("candidateList");

    async function loadCandidates() {

        try {

            const response =
                await fetch("http://localhost:5000/api/applications");

            const data = await response.json();

            const applications = Array.isArray(data)
                ? data
                : (Array.isArray(data.applications)
                    ? data.applications
                    : []);

            if (applications.length === 0) {

                candidatesList.innerHTML =
                    "<p>No applications received yet.</p>";

                return;
            }

            candidatesList.innerHTML = "";

            applications.forEach(application => {

                const card = document.createElement("div");

                card.className = "candidate-card";

                card.innerHTML = `
                    <h3>${application.name || "Unknown Candidate"}</h3>

                    <p>
                        📧 ${application.email || "Not available"}
                    </p>

                    <p>
                        💼 Applied for:
                        <strong>
                            ${application.title || "Not specified"}
                        </strong>
                    </p>

                    <p>
                        🏢 ${application.company || "Not specified"}
                    </p>

                    <p>
                        📌 Status:
                        <strong>
                            ${application.status || "Pending"}
                        </strong>
                    </p>

                    <p>
                        📅 Applied:
                        ${application.applied_at
                            ? new Date(application.applied_at)
                                .toLocaleString()
                            : "Not available"}
                    </p>
                `;

                const button =
                    document.createElement("button");

                button.className = "view-btn";

                button.textContent = "View Profile";

                button.addEventListener("click", () => {

                    viewProfile(application);

                });

                card.appendChild(button);

                candidatesList.appendChild(card);

            });

        } catch (error) {

            console.error(error);

            candidatesList.innerHTML =
                "<p>❌ Cannot connect to server.</p>";

        }

    }

    loadCandidates();

});

function viewProfile(application) {

    const params = new URLSearchParams({

        name: application.name || "Unknown Candidate",

        position: application.title || "Not specified",

        location: application.location || "Not specified",

        email: application.email || "Not available",

        phone: application.phone || "Not available",

        about: application.about || "No information available.",

        userId: application.user_id

    });

    window.location.href =
        "candidate-profile.html?" + params.toString();

}