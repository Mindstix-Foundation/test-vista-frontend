function resetPassword1() {
    // Redirect to the 'checkPassword.html' page
    window.location.href = 'http://127.0.0.1:5500/Teacher_Prototype/profile/checkPassword.html';
}

function logout1() {
    // Show the logout confirmation modal
    const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
    logoutModal.show();

    // Attach an event listener to the confirm button
    document.getElementById('confirmLogout').addEventListener('click', function () {
        // Clear session or token (if applicable)
        // Example: localStorage.removeItem('authToken');

        // Redirect to the 'login.html' page in the 'login_Prototype' folder
        window.location.href = '../login_Prototype/login.html';
    });
}


