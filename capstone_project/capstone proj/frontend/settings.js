document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("settingsForm");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const notificationsInput = document.getElementById("notifications");

    // Load saved settings
    const savedSettings = JSON.parse(
        localStorage.getItem("jobFinderSettings")
    );

    if (savedSettings) {
        nameInput.value = savedSettings.name || "";
        emailInput.value = savedSettings.email || "";
        notificationsInput.checked =
            savedSettings.notifications !== false;
    }

    // Save settings
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const settings = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            notifications: notificationsInput.checked
        };

        localStorage.setItem(
            "jobFinderSettings",
            JSON.stringify(settings)
        );

        alert("Settings saved successfully!");

    });

});