function filterTable() {
    const schoolInput = document.getElementById("schoolFilter").value.toLowerCase();
    const boardInput = document.getElementById("boardFilter").value.toLowerCase();
    const table = document.getElementById("schoolTable");
    const rows = table.getElementsByTagName("tr");
    let hasVisibleRow = false;

    for (let i = 0; i < rows.length; i++) {
        const schoolCell = rows[i].getElementsByTagName("td")[0];
        const boardCell = rows[i].getElementsByTagName("td")[1];

        if (schoolCell && boardCell) {
            const schoolText = schoolCell.textContent || schoolCell.innerText;
            const boardText = boardCell.textContent || boardCell.innerText;

            if (schoolText.toLowerCase().indexOf(schoolInput) > -1 && boardText.toLowerCase().indexOf(boardInput) > -1) {
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

document.getElementById("schoolFilter").addEventListener("input", filterTable);
document.getElementById("boardFilter").addEventListener("input", filterTable);

function clearInput(inputId) {
    document.getElementById(inputId).value = '';
    filterTable(); // Optional: Refresh the table.
}
