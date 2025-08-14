document.addEventListener('DOMContentLoaded', () => {
    const classSelect = document.getElementById('classSelect');
    const subjectModal = new bootstrap.Modal(document.getElementById('subjectSelectModal'));
    const classSubjectList = document.getElementById('classSubjectPairs');
    const subjectModalLabel = document.getElementById('subjectSelectModalLabel');

    let selectedClass = '';
    let editingItem = null;

    // Open modal when a class is selected from dropdown
    classSelect.addEventListener('change', (e) => {
        selectedClass = e.target.value;
        const existingItem = findClassInList(selectedClass);

        if (existingItem) {
            openModalForEditing(existingItem);
        } else {
            subjectModalLabel.textContent = `Select Subjects for ${selectedClass}`;
            clearModalSelection();
            subjectModal.show();
        }
                // Reset the dropdown to avoid triggering 'change' again
                classSelect.value = '';
    });

    // Add or update class-subject pair
    document.querySelector('.btn-success').addEventListener('click', () => {
        const selectedSubjects = Array.from(document.querySelectorAll('#subjectSelectContainer input[name="subject"]:checked'))
                                      .map(input => input.value);

        if (selectedSubjects.length > 0) {
            if (editingItem) {
                updateListItem(editingItem, selectedClass, selectedSubjects);
            } else {
                addListItem(selectedClass, selectedSubjects);
            }

            clearModalSelection();
            editingItem = null;
            subjectModal.hide();
        } else {
            alert('Please select at least one subject.');
        }
    });

    // Handle edit and remove actions in the list
    classSubjectList.addEventListener('click', (e) => {
        const listItem = e.target.closest('li');

        // Use `onclick` for the edit button directly
        if (e.target.classList.contains('edit-btn')) {
            openModalForEditing(listItem);
        } else if (e.target.classList.contains('remove-btn')) {
            listItem.remove();
            toggleListVisibility();
        }
    });

    // Helper function to find an item by class name
    function findClassInList(className) {
        return Array.from(classSubjectList.children).find(item => 
            item.querySelector('span').textContent.startsWith(`${className}:`)
        );
    }

    // Open modal with pre-filled subjects for editing
    function openModalForEditing(listItem) {
        const [className, subjects] = listItem.querySelector('span').textContent.split(': ');
        selectedClass = className.trim();
        editingItem = listItem;

        subjectModalLabel.textContent = `Edit Subjects for ${selectedClass}`;
        classSelect.value = selectedClass; // Keep the selected value for editing

        document.querySelectorAll('#subjectSelectContainer input[name="subject"]').forEach(input => {
            input.checked = subjects.includes(input.value);
        });

        subjectModal.show();

        // Reset dropdown after showing modal to avoid interference
        classSelect.value = ''; 
    }

    // Add a new class-subject pair to the list
    function addListItem(className, subjects) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <span>${className}: ${subjects.join(', ')}</span>
            <div>
                
                <button class="btn btn-custom btn-sm remove-btn">Remove</button>
            </div>
        `;
        classSubjectList.appendChild(listItem);
        toggleListVisibility();
    }

    // Update an existing class-subject pair
    function updateListItem(listItem, className, subjects) {
        listItem.querySelector('span').textContent = `${className}: ${subjects.join(', ')}`;
    }

    // Clear subject selection in the modal
    function clearModalSelection() {
        document.querySelectorAll('#subjectSelectContainer input[name="subject"]').forEach(input => input.checked = false);
    }

    // Show or hide the class-subject list based on items
    function toggleListVisibility() {
        classSubjectList.parentElement.hidden = classSubjectList.children.length === 0;
    }
});
