

fetch("metadata.json")
  .then(response => response.json())
  .then(data => {
    window.dataCatalogue = data; 
    initMenu(data);
  });

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
        itemA.textContent = item.description;
        itemA.itemData = item;

        const metadataIcon = document.createElement("span");
        metadataIcon.classList.add("metadata-icon");
        metadataIcon.innerHTML = "&#9432;";

        // Launch metadata panel
        metadataIcon.addEventListener("click", () => {
            const metadataBox = document.getElementById("metadata-box");
            const metadataContent = document.getElementById("metadata-content");

            metadataContent.innerHTML = "";
            for (const key in item) {
              if (item.hasOwnProperty(key)) {
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


    // Use it immediately
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
const fp = flatpickr(dateInput, {
  dateFormat: "Y-m-d",
  minDate: "2023-01-01",
  maxDate: "2025-12-31",
  onChange: function(selectedDates, dateStr, instance) {
    console.log("Selected date:", dateStr);
  }
});

function display_time_component(item) {
  if (!item || !item.temporal_resolution) {
    console.warn("Item or temporal_resolution missing:", item);
    return;
  }

  const dateInput = document.getElementById("datePicker");

  if (dateInput._flatpickr) {
    dateInput._flatpickr.destroy();
  }

  let options = {
    onChange: function(selectedDates, dateStr, instance) {
      console.log("Selected date:", dateStr, "for", item.description);
    }
  };
  switch (item.temporal_resolution) {
    case "Daily":
      options.dateFormat = "d-M-Y";
      options.minDate = item.start_time;
      options.maxDate = item.end_time;
      flatpickr(dateInput, options);
      break;

    case "Monthly":
      options.dateFormat = "d-m-Y";
      options.plugins = [new monthSelectPlugin({
        shorthand: true,
        dateFormat: "M-Y",
        altFormat: "M-Y",
        theme: "dark"
      })];
      options.minDate = item.start_time;
      options.maxDate = item.end_time;
      flatpickr(dateInput, options);
      break;


    case "Annual":
        const start_time = item.start_time;
        const end_time = item.end_time;

      default:
      console.log("Unknown temporal_resolution:", item.temporal_resolution, "for", item.description);
      // handleDefault(item);
      break;
  }
  
}


// Add a "Add to map" button that's clickable only when a date is selected 
const showOnMapBtn = document.getElementById("showOnMapBtn");
dateInput.addEventListener("change", function() {
  showOnMapBtn.disabled = !dateInput.value;
  if (!dateInput.value) {
    console.log("Date cleared, button disabled");
    // Optionally, remove the layer from the map if date is cleared
    // removeLayerFromMap();
  } else {
    console.log("Date selected:", dateInput.value, "button enabled");
  }
});


document.getElementById("metadata-close").addEventListener("click", () => {
    document.getElementById("metadata-box").classList.add("hidden");
});
