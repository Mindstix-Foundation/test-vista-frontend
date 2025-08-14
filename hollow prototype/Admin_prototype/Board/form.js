// Initialize data arrays
let countries = [];
let states = [];
let cities = [];

// Load data from the uploaded JSON files
async function loadData() {
  const countryData = await fetch('../../commonPart/country.json').then(res => res.json());
  const stateData = await fetch('../../commonPart/state.json').then(res => res.json());
  const cityData = await fetch('../../commonPart/city.json').then(res => res.json());
  
  countries = countryData;
  states = stateData;
  cities = cityData;

  populateCountryList();
}

// Populate country datalist
function populateCountryList() {
  const countryList = document.getElementById('countryList');
  countryList.innerHTML = '';
  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country.country_name;
    option.dataset.id = country.country_id;
    countryList.appendChild(option);
  });
}

// Populate state datalist based on selected country
function populateStateList(countryId) {
  const stateList = document.getElementById('stateList');
  stateList.innerHTML = '';
  const filteredStates = states.filter(state => state.country_id === countryId);
  filteredStates.forEach(state => {
    const option = document.createElement('option');
    option.value = state.state_name;
    option.dataset.id = state.state_id;
    stateList.appendChild(option);
  });
}

// Populate city datalist based on selected state
function populateCityList(stateId) {
  const cityList = document.getElementById('cityList');
  cityList.innerHTML = '';
  const filteredCities = cities.filter(city => city.state_id === stateId);
  filteredCities.forEach(city => {
    const option = document.createElement('option');
    option.value = city.city_name;
    cityList.appendChild(option);
  });
}

// Event listeners for filtering
document.getElementById('countryName').addEventListener('input', event => {
  const selectedCountry = countries.find(country => country.country_name === event.target.value);
  if (selectedCountry) {
    populateStateList(selectedCountry.country_id);
  }
});

document.getElementById('stateName').addEventListener('input', event => {
  const selectedState = states.find(state => state.state_name === event.target.value);
  if (selectedState) {
    populateCityList(selectedState.state_id);
  }
});

// Load initial data
loadData();


function handleInput(inputElement) {
  // Determine the parent container dynamically
  const container = inputElement.closest("fieldset").querySelector(".row");

  // Get all input fields within the container
  const inputFields = container.querySelectorAll("input");

  // Add a new input field when the last input field is filled
  if (inputFields[inputFields.length - 1] === inputElement && inputElement.value.trim() !== "") {
    const newInputDiv = document.createElement("div");
    newInputDiv.classList.add("col", "col-12");

    newInputDiv.innerHTML = `
      <div class="form-floating">
        <input
          type="text"
          class="form-control ${inputElement.classList[1]}"
          placeholder="${inputElement.placeholder}"
          oninput="handleInput(this)"
        />
        <label class="form-label">${inputElement.placeholder}</label>
      </div>
    `;

    container.appendChild(newInputDiv);
  }

  // Remove an input field if it is empty and not the last one
  if (inputElement.value.trim() === "" && inputFields.length > 1) {
    const parentDiv = inputElement.closest(".col");
    parentDiv.remove();
  }
}