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

    if (currentStatus === "grant") {
        // Change to inactive
        button.setAttribute("data-status", "revoke");
        button.classList.add("revoke");
        button.querySelector(".status-text").textContent = "Revoke";
    } else {
        // Change to active
        button.setAttribute("data-status", "grant");
        button.classList.remove("revoke");
        button.querySelector(".status-text").textContent = "Grant";
    }
}

// Get references to carousel and table
const carousel = document.getElementById('statusCarousel');
const teacherTable = document.getElementById('teacherTable');

// Function to filter rows based on status
function filterTable(status) {
    const rows = teacherTable.querySelectorAll('tr'); // Get all table rows
    
    rows.forEach(row => {
        const statusCell = row.querySelector('td:nth-child(4)'); // Target the Status column (4th column)
        if (status === 'All' || statusCell.textContent.trim() === status) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    });
}

// Event listener for carousel changes
carousel.addEventListener('slid.bs.carousel', event => {
    const activeItem = carousel.querySelector('.carousel-item.active span'); // Get active carousel item
    if (activeItem) {
        filterTable(activeItem.textContent.trim()); // Filter based on the active carousel item
    }
});

// Initial filter (set to All)
filterTable('All');
