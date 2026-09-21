// Post Job button

// Post Job button

const postJobBtn = document.getElementById("postJobBtn");

if (postJobBtn) {
    postJobBtn.addEventListener("click", function () {
        window.location.href = "post-job.html";
    });
}


// Logout

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function () {

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");

    window.location.href = "login.html";

});