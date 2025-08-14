// /commonPart/loadComponents.js
function loadComponent(componentName, filePath, containerId) {
  fetch(filePath)
      .then(response => response.text())
      .then(data => {
          document.getElementById(containerId).innerHTML = data;
      })
      .catch(error => console.error(`Error loading ${componentName}: `, error));
} 