function filterTeacherTable() {
    const teacherInput = document.getElementById("searchTeacherInput").value.toLowerCase();
    const schoolInput = document.getElementById("searchSchoolInput").value.toLowerCase();
    const table = document.getElementById("teacherTable");
    const rows = table.getElementsByTagName("tr");
    let hasVisibleRow = false;

    for (let i = 0; i < rows.length; i++) {
        const teacherCell = rows[i].getElementsByTagName("td")[0];
        const schoolCell = rows[i].getElementsByTagName("td")[1];

        if (teacherCell && schoolCell) {
            const teacherText = teacherCell.textContent || teacherCell.innerText;
            const schoolText = schoolCell.textContent || schoolCell.innerText;

            if (
                teacherText.toLowerCase().includes(teacherInput) &&
                schoolText.toLowerCase().includes(schoolInput)
            ) {
                rows[i].style.display = "";
                hasVisibleRow = true;
            } else {
                rows[i].style.display = "none";
            }
        }
    }
    const noResultRow = document.getElementById("noResultRow");
if (noResultRow) {
    noResultRow.remove();
}
// Add "No matching result" row if no visible rows
if (!hasVisibleRow) {
    const noMatchRow = table.insertRow(-1); // Add to the end of the table
    noMatchRow.id = "noResultRow";
    const noMatchCell = noMatchRow.insertCell(0);
    noMatchCell.colSpan = rows[0].cells.length; // Span across all columns
    noMatchCell.textContent = "No matching results found.";
    noMatchCell.style.textAlign = "center"; // Center the text
}
}

document.getElementById("searchTeacherInput").addEventListener("input", filterTeacherTable);
document.getElementById("searchSchoolInput").addEventListener("input", filterTeacherTable);

function clearInput(inputId) {
    document.getElementById(inputId).value = '';
    filterTeacherTable(); // Optional: Refresh the table.
}


document.addEventListener("DOMContentLoaded", () => {
    // Get the query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const schoolName = urlParams.get('school');

    if (schoolName) {
        // Set the search bar value
        const schoolFilterInput = document.getElementById("searchSchoolInput");
        schoolFilterInput.value = schoolName;

        // Trigger the filtering logic
        filterTeacherTable(schoolName);
    }
});


function toggleTeacherStatus(button) {
    const currentStatus = button.getAttribute("data-status");

    if (currentStatus === "active") {
        // Change to inactive
        button.setAttribute("data-status", "inactive");
        button.classList.add("inactive");
        button.querySelector(".status-text").textContent = "Inactive";
    } else {
        // Change to active
        button.setAttribute("data-status", "active");
        button.classList.remove("inactive");
        button.querySelector(".status-text").textContent = "Active";
    }
}


    document.querySelectorAll('.filter-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const filter = e.target.getAttribute('data-filter');
            const rows = document.querySelectorAll('#teacherTable tr');

            rows.forEach(row => {
                const isActive = row.querySelector('.indicator') !== null; // Assume rows with `.indicator` are active
                switch (filter) {
                    case 'ALL':
                        row.style.display = ''; // Show all rows
                        break;
                    case 'ACTIVE':
                        row.style.display = isActive ? '' : 'none'; // Show only active rows
                        break;
                    case 'INACTIVE':
                        row.style.display = isActive ? 'none' : ''; // Show only inactive rows
                        break;
                }
            });
        });
    });



