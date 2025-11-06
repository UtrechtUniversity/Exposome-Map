const menuContainerCatalogue = document.getElementById("dynamic-populated-menu-catalogue-view");

window.dataCataloguePromise.then(data => {
    initMenu(data, menuContainerCatalogue);
});

function initMenu(dataCatalogue, container) {
    for (const category in dataCatalogue) {
        // --- Category level ---
        const categoryLi = document.createElement("li");
        categoryLi.classList.add("category");

        const categoryA = document.createElement("a");
        categoryA.href = "javascript:void(0)";
        categoryA.innerHTML = `<span>${category.replace(/_/g, " ")}</span>`;
        categoryLi.appendChild(categoryA);

        const subUl = document.createElement("ul");
        for (const subcategory in dataCatalogue[category]) {
            const subLi = document.createElement("li");
            subLi.classList.add("subcategory");

            const subA = document.createElement("a");
            subA.href = "javascript:void(0)";
            subA.textContent = subcategory.replace(/_/g, " ");
            subLi.appendChild(subA);

            subA.addEventListener("click", (e) => {
                e.stopPropagation();
                container.querySelectorAll(".subcategory a.selected").forEach(a => a.classList.remove("selected"));
                subA.classList.add("selected");
                const subcategoryItems = dataCatalogue[category][subcategory];
                openCataloguePanel(subcategoryItems);
            });

            subUl.appendChild(subLi);
        }
        categoryLi.appendChild(subUl);
        container.appendChild(categoryLi);
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

        // Only include specified keys
        const specifiedKeys = ["id", "Description", "Category", "Subcategory"];
        
        for (const key in item) {
            if (item.hasOwnProperty(key) && key !== "Description" && specifiedKeys.includes(key)) {
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
