
// Function to filter test papers based on search input
function searchTestPapers() {
    const searchQuery = document.getElementById("searchInput").value.toLowerCase();
    const papers = document.querySelectorAll(".test-paper");

    papers.forEach(paper => {
        const name = paper.getAttribute("data-name").toLowerCase();
        const subject = paper.getAttribute("data-subject").toLowerCase();
        const marks = paper.getAttribute("data-marks");
        const date = paper.getAttribute("data-date").toLowerCase();

        if (name.includes(searchQuery) || subject.includes(searchQuery) || marks.includes(searchQuery) || date.includes(searchQuery)) {
            paper.style.display = "block";
        } else {
            paper.style.display = "none";
        }
    });
}

// Function to sort test papers based on selected criteria
function sortTestPapers() {
    const sortOption = document.getElementById("sortSelect").value;
    const papers = Array.from(document.querySelectorAll(".test-paper"));

    papers.sort((a, b) => {
        let compareValue = 0;

        if (sortOption.includes("name")) {
            const nameA = a.getAttribute("data-name").toLowerCase();
            const nameB = b.getAttribute("data-name").toLowerCase();
            compareValue = nameA.localeCompare(nameB);
        } else if (sortOption.includes("date")) {
            const dateA = new Date(a.getAttribute("data-date"));
            const dateB = new Date(b.getAttribute("data-date"));
            compareValue = dateA - dateB;
        } else if (sortOption.includes("marks")) {
            const marksA = parseInt(a.getAttribute("data-marks"));
            const marksB = parseInt(b.getAttribute("data-marks"));
            compareValue = marksA - marksB;
        }

        // Handle ascending or descending sorting
        if (sortOption.includes("desc")) {
            compareValue = -compareValue;
        }

        return compareValue;
    });

    const container = document.getElementById("testPaperCards");
    papers.forEach(paper => {
        container.appendChild(paper);  // Reorder cards in the DOM
    });
}