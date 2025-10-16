fetch("metadata.json")
  .then(response => response.json())
  .then(data => {
    window.dataCatalogue = data; 
    initMenu(data);
  });

window.selectedDate = null;

const menuContainer = document.getElementById("dynamic-populated-menu");

function initMenu(dataCatalogue) {

  for (const category in dataCatalogue) {
    // Level 1: Category
    const categoryLi = document.createElement("li");
    categoryLi.classList.add("sub-menu");

    const categoryA = document.createElement("a");
    categoryA.href = "javascript:void(0)";
    categoryA.innerHTML = `<span>${category.replace(/_/g, " ")}</span>`;
    categoryLi.appendChild(categoryA);

    // Level 2: Subcategories
    const subUl = document.createElement("ul");

    for (const subcategory in dataCatalogue[category]) {
      const subLi = document.createElement("li");
      const subA = document.createElement("a");
      subA.href = "javascript:void(0)";
      subA.textContent = subcategory.replace(/_/g, " ");
      subLi.appendChild(subA);

      // Next to each description, make a small info icon
      // Level 3: Items
      const itemsUl = document.createElement("ul");
      dataCatalogue[category][subcategory].forEach(item => {
        const itemLi = document.createElement("li");

        const productItem = document.createElement("div");
        productItem.classList.add("product-item");
        
        const itemA = document.createElement("a");
        itemA.textContent = item.Description;
        itemA.itemData = item;

        const metadataIcon = document.createElement("span");
        metadataIcon.classList.add("metadata-icon");
        metadataIcon.innerHTML = "&#9432;";

        // Launch metadata panel
        metadataIcon.addEventListener("click", () => {
            const metadataBox = document.getElementById("metadata-box");
            const metadataContent = document.getElementById("metadata-content");


            const metadataToShow = ["Description", "File type", "Time period", "Spatial resolution", "Extent", "Owner", "CRS"];

            metadataContent.innerHTML = "";
            for (const key in item) {
              if (item.hasOwnProperty(key) && metadataToShow.includes(key)) {
                const propertyDiv = document.createElement("div");
                propertyDiv.style.textAlign = "left";

                propertyDiv.innerHTML = `<strong>${key}</strong><br>${item[key]}<br><br>`;
                metadataContent.appendChild(propertyDiv);
            }

            metadataBox.classList.remove("hidden");

        }});

        productItem.appendChild(itemA);
        productItem.appendChild(metadataIcon);

        itemLi.appendChild(productItem);
        itemsUl.appendChild(itemLi);
      });

      subLi.appendChild(itemsUl);
      subUl.appendChild(subLi);
    }

    categoryLi.appendChild(subUl);
    menuContainer.appendChild(categoryLi);
  }
}

// Toggle submenus on click
$(document).on("click", "#leftside-navigation li > a", function (e) {
  const nextUl = $(this).next("ul");
  if (nextUl.length === 0) return; // No submenu, do nothing

  e.preventDefault();

  // Toggle only the clicked submenu
  nextUl.slideToggle();

  // Optionally, close sibling submenus at the same level
  $(this).parent().siblings().find("ul").slideUp();

  e.stopPropagation();
});


menuContainer.addEventListener("click", function(e) {
  const target = e.target;

  if (target.tagName === "A" && target.itemData) {
    e.stopPropagation();

    menuContainer.querySelectorAll("a.selected").forEach(a => a.classList.remove("selected"));
    target.classList.add("selected");

    // Store globally
    window.selectedItem = target.itemData;
    window.dispatchEvent(
    new CustomEvent("itemSelected", { detail: window.selectedItem })
    
    );
    display_time_component(window.selectedItem);
  }
});


// Return info about the selected product
function getSelectedItem() {
  const selected = menuContainer.querySelector("a.selected");
  return selected ? selected.itemData : null;
}

const item = getSelectedItem();
if (item) {
  console.log(item.id, item.description, item.file_type);
}

const dateInput = document.getElementById("datePicker");

function display_time_component(item) {
  if (!item || !item.temporal_resolution) {
    console.warn("Item or temporal_resolution missing");
    return;
  }

  const timeControls = document.querySelector(".time-controls");
  timeControls.innerHTML = ""; // Clear previous picker

  const lastSelected = window.selectedDate || null;

  let options = {
    onChange: function(selectedDates, dateStr) {
      window.selectedDate = dateStr;
    }
  };

  switch (item.temporal_resolution) {
    // Add a listener to update window.selectedDate when a date is picked
    case "Daily": {
      const input = document.createElement("input");
      input.id = "datePicker";
      input.type = "text";
      input.placeholder = "Select a date";
      timeControls.appendChild(input);

      options.dateFormat = "d-M-Y";
      options.altFormat = "d_m_Y";
      options.minDate = item.start_time;
      options.maxDate = item.end_time;
      if (lastSelected) options.defaultDate = lastSelected;

      flatpickr(input, options);
      break;
    }

    case "Monthly": {
      const input = document.createElement("input");
      input.id = "datePicker";
      input.type = "text";
      input.placeholder = "Select a month";
      timeControls.appendChild(input);

      // Add a listener to update window.selectedDate when a month is picked
      options.plugins = [new monthSelectPlugin({
        shorthand: true,
        dateFormat: "M-Y",
        altFormat: "m_Y",
        theme: "dark"
      })];
      options.minDate = item.start_time;
      options.maxDate = item.end_time;
      if (lastSelected) options.defaultDate = lastSelected;

      flatpickr(input, options);
      break;
    }

    case "Annual": {
      const start_time = item.start_time;
      const end_time = item.end_time;

      const startYear = parseInt(start_time.split("_")[2]);
      const endYear = parseInt(end_time.split("_")[2]);

      const select = document.createElement("select");
      select.classList.add("year-select");
      select.id = "yearPicker";

      for (let year = startYear; year <= endYear; year++) {
        const option = document.createElement("option");
        option.classList.add("year_option");
        option.value = year;
        option.textContent = year;
        select.appendChild(option);
      }

      if (lastSelected) select.value = lastSelected;

      select.addEventListener("change", () => {
        window.selectedDate = select.value;
      });

      timeControls.appendChild(select);
      break;
    }

    default:
      console.log("Unknown temporal_resolution:", item.temporal_resolution);
      break;
  }
  setupShowOnMapListener();
}

function setupShowOnMapListener() {
  const showOnMapBtn = document.getElementById("showOnMapBtn");
  const picker = document.querySelector(".time-controls input, .time-controls select");

  if (!picker) return;

  showOnMapBtn.disabled = !picker.value;

  picker.addEventListener("change", function() {
    showOnMapBtn.disabled = !picker.value;
  });
}



document.getElementById("metadata-close").addEventListener("click", () => {
    document.getElementById("metadata-box").classList.add("hidden");
});
