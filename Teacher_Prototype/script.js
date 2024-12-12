// Load Navbar and Footer
function loadComponent(type, url, containerId) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(containerId).innerHTML = data;
        })
        .catch(err => console.log(err));
}

loadComponent('navbar', '../commonPart/navbar.html', 'navbar-container');
loadComponent('footer', '../commonPart/footer.html', 'footer-container');