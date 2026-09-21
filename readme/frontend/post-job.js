const jobForm = document.getElementById("jobForm");

jobForm.addEventListener("submit", async function (e) {
    e.preventDefault();
const savedUser = localStorage.getItem("user");

let user;

try {
    user = JSON.parse(savedUser);
} catch (error) {
    localStorage.removeItem("user");
    alert("Please login as Employer again!");
    window.location.href = "employer-login.html";
    return;
}

if (!user || !user.id) {
    alert("Please login as Employer first!");
    return;
}
    
    const jobData = {
        employer_id: user.id,
        title: document.getElementById("jobTitle").value.trim(),
        company: document.getElementById("company").value.trim(),
        location: document.getElementById("location").value.trim(),
        type: document.getElementById("jobType").value,
        salary: document.getElementById("salary").value.trim(),
        description: document.getElementById("description").value.trim()
    };

    if (
        !jobData.title ||
        !jobData.company ||
        !jobData.location ||
        !jobData.type ||
        !jobData.salary ||
        !jobData.description
    ) {
        alert("Please fill all fields!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/jobs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jobData)
        });

       
const text = await response.text();

console.log("Status:", response.status);
console.log("Server response:", text);

let result;

try {
    result = JSON.parse(text);
} catch (error) {
    console.error("JSON parse error:", error);
    alert("Backend returned: " + text);
    return;
}
if (response.ok) {
    alert("Job posted successfully!");
    jobForm.reset();
    window.location.href = "employer-dashboard.html";
} else {
    alert(result.message || "Failed to post job");
}
        
    } catch (error) {
        console.error("Error:", error);
        alert("Backend connection failed!");
    }
});
