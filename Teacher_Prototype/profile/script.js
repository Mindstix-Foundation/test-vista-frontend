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
        
        window.location.href = '../../login_Prototype/login.html';
    });
}

