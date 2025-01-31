document.querySelectorAll('.bi-chevron-double-down').forEach(icon => {
    // Attach event listeners to the collapse toggle icons
    const targetId = icon.dataset.bsTarget;
    const collapseElement = document.querySelector(targetId);

    collapseElement.addEventListener('show.bs.collapse', () => {
        icon.classList.remove('bi-chevron-double-down');
        icon.classList.add('bi-chevron-double-up');
    });

    collapseElement.addEventListener('hide.bs.collapse', () => {
        icon.classList.remove('bi-chevron-double-up');
        icon.classList.add('bi-chevron-double-down');
    });
});