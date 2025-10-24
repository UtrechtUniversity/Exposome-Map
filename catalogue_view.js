window.dataCataloguePromise.then(data => {
    initMenu(data);
});

const menuContainerCatalogue = document.getElementById("dynamic-populated-menu-catalogue-view");
function initMenu(dataCatalogue) {
    for (const category in dataCatalogue) {
        // --- Top-level category ---
        const categoryLi = document.createElement("li");
        categoryLi.classList.add("category");
        categoryLi.textContent = category;

        // --- Subcategory list ---
        const subUl = document.createElement("ul");

        for (const subcategory in dataCatalogue[category]) {
            const subLi = document.createElement("li");
            subLi.classList.add("subcategory");
            subLi.textContent = subcategory;

            // Attach the data for this subcategory
            subLi.subcategoryData = dataCatalogue[category][subcategory];

            // Subcategory click opens the catalogue panel
            subLi.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent bubbling to category toggle

                // Remove "selected" from all subcategories
                menuContainerCatalogue.querySelectorAll("li.subcategory").forEach(li => li.classList.remove("selected"));

                // Highlight this subcategory
                subLi.classList.add("selected");

                // Open catalogue panel
                openCataloguePanel(subLi.subcategoryData);
            });

            subUl.appendChild(subLi);
        }

        categoryLi.appendChild(subUl);
        menuContainerCatalogue.appendChild(categoryLi);
    }
}

// Toggle submenus on category click
$(document).on("click", "#dynamic-populated-menu-catalogue-view > li.category", function (e) {
    const subUl = $(this).children("ul");
    if (subUl.length === 0) return;

    e.preventDefault();
    subUl.slideToggle();                 // Toggle this category
    $(this).siblings().children("ul").slideUp(); // Close siblings
});

// Build catalogue panel content
function openCataloguePanel(subcategoryItems) {
    const cataloguePanel = document.getElementById("catalogue-panel");
    cataloguePanel.innerHTML = ""; // clear previous content

    subcategoryItems.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.classList.add("catalogue-item");

        // Title
        const titleDiv = document.createElement("div");
        titleDiv.classList.add("catalogue-item-title");
        titleDiv.textContent = item.Description || item.id || "No Title";
        itemDiv.appendChild(titleDiv);

        // Content (keys/values aligned)
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("catalogue-item-content");

        for (const key in item) {
            if (item.hasOwnProperty(key) && key !== "Description") {
                const rowDiv = document.createElement("div");
                rowDiv.classList.add("catalogue-item-row");

                const keyDiv = document.createElement("div");
                keyDiv.classList.add("catalogue-item-key");
                keyDiv.textContent = key;

                const valueDiv = document.createElement("div");
                valueDiv.classList.add("catalogue-item-value");
                valueDiv.textContent = item[key];

                rowDiv.appendChild(keyDiv);
                rowDiv.appendChild(valueDiv);
                contentDiv.appendChild(rowDiv);
            }
        }

        itemDiv.appendChild(contentDiv);
        cataloguePanel.appendChild(itemDiv);
    });
}
