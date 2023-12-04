const csrfMiddlewareToken = document.querySelector('[name=csrfmiddlewaretoken]');
const foodDataElement = document.querySelector("#food-data");
const foodOverlay = document.getElementById("overlay");
const categorySelect = document.querySelector("#category-select");
const categoryTemplate = document.querySelector("#category-template");
const categoryAddImage = document.querySelector("#category-add-image");
const nameInput = document.querySelector("#name-input");
const kcalInput = document.querySelector("#kcal-input");
const fatInput = document.querySelector("#fat-input");
const carbohydratesInput = document.querySelector("#carbohydrates-input");
const proteinsInput = document.querySelector("#proteins-input");
const sugarInput = document.querySelector("#sugar-input");
const foodTemplate = document.querySelector("#food-template");
const foodDiv = document.querySelector("#food-div");
const foodSearchInput = document.querySelector("#food-search-input");

const categoryOverlay = document.querySelector("#category-overlay");
const categoryDataElement = document.querySelector("#category-data");
const categoryNameInput = document.querySelector("#category-name-input");
const categoryColorInput = document.querySelector("#category-color-input");

window.addEventListener("load", () => {
    const deleteCategoryImages = document.querySelectorAll(".category-delete-img");

    deleteCategoryImages.forEach(deleteCategoryImage => {
        deleteCategoryImage.addEventListener("click", onDeleteCategoryClick);
    });

    const deleteFoodImages = document.querySelectorAll(".delete-food-img");

    deleteFoodImages.forEach(deleteCategoryImage => {
        deleteCategoryImage.addEventListener("click", onDeleteFoodImageClick);
    });

    const editImages = document.querySelectorAll(".edit-food-img");

    editImages.forEach(editImage => {
        editImage.addEventListener("click", onEditFoodItemClick);
    });


    categoryAddImage.addEventListener("click", onCategoryAddClick);

    const addNewFoodButton = document.querySelector("#add-new-food-btn");
    addNewFoodButton.addEventListener("click", (event) => {
        foodOverlay.style.display = "block";
    });

    const closeFoodFormElements = document.querySelectorAll("#close-form-img, #close-btn");
    closeFoodFormElements.forEach(closeFoodFormElement => {
        closeFoodFormElement.addEventListener("click", onFormClose);
    });

    const confirmButton = document.querySelector("#confirm-btn");
    confirmButton.addEventListener("click", onFormConfirm);

    const addCategoryButton = document.querySelector("#add-category-btn");
    addCategoryButton.addEventListener("click", event => {
        categoryOverlay.style.display = "block";
    });

    const closeButtons = document.querySelectorAll("#category-close-btn, #category-close-form-img");
    closeButtons.forEach(button => {
        button.addEventListener("click", onCategoryFormClose);
    });

    const confirmImage = document.querySelector("#category-confirm-btn");
    confirmImage.addEventListener("click", onCategoryFormConfirm);

    const colorDivs = document.querySelectorAll(".color-div");
    colorDivs.forEach(colorDiv => {
        colorDiv.addEventListener("click", onEditCategory);
    });

    foodSearchInput.addEventListener("input", onFoodSearchInput);

});

function onFormClose() {
    if (confirm("Bist du sicher, dass du die Zutat nicht hinzufügen willst?")) {
        clearForm();
    }
}

function onFormConfirm() {
    if (confirm("Ist die Zutat so fertig und soll erstellt werden?")) {
        const name = nameInput.value;
        let kcal = kcalInput.value ? kcalInput.value : "0";
        let fat = fatInput.value ? fatInput.value : "0";
        let carbohydrates = fatInput.value ? carbohydratesInput.value : "0";
        let sugar = fatInput.value ? sugarInput.value : "0";
        let proteins = fatInput.value ? proteinsInput.value : "0";
        const categories = [];
        const categoryColors = [];
        const categoryNames = [];

        const categoryContainers = document.querySelectorAll(".single-category-item-container");
        categoryContainers.forEach(categoryContainer => {
            const categoryIdInput = categoryContainer.querySelector(".category-id-input");
            const categoryNameDiv = categoryContainer.querySelector(".category-name-div");
            const colorDiv = categoryContainer.querySelector(".category-color-div");

            if (categoryIdInput.parentElement.id != "category-templates") {
                categories.push(categoryIdInput.value);
                categoryNames.push(categoryNameDiv.innerText);

                if (colorDiv.style.background) {
                    categoryColors.push(colorDiv.style.background);
                }
            }


        });

        let context = {
            name: name,
            kcal: kcal,
            fat: fat,
            carbohydrates: carbohydrates,
            sugar: sugar,
            proteins: proteins,
            categories: categories
        }
        let method = "POST"

        let update = false;

        if (foodDataElement.dataset.update == "1") {
            context["id"] = foodDataElement.dataset.id;
            method = "PUT"
            update = true;
        }

        fetch("/weight-watch/food/food", {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfMiddlewareToken.value
            },
            body: JSON.stringify(context)
        }).then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Request failed.");
            }
        }).then(data => {
            foodSearchInput.value="";
            functionShowAllFoodItems();

            const newFoodItem = foodTemplate.cloneNode(true);
            newFoodItem.id = "food-item-" + data["id"];
            newFoodItem.querySelector(".food-id-input").value = data["id"];
            newFoodItem.querySelector(".food-name").innerText = name;

            const categoriesDiv = newFoodItem.querySelector(".categories-div");

            for (let i = 0; i < categories.length; i++) {
                const newColorDiv = document.createElement("div");
                newColorDiv.innerText = "W";
                newColorDiv.classList.add("color-div");
                newColorDiv.dataset.id = categories[i];
                newColorDiv.dataset.name = categoryNames[i];
                newColorDiv.style.background = categoryColors[i];
                newColorDiv.style.color = categoryColors[i];
                newColorDiv.addEventListener("click", onEditCategory);
                categoriesDiv.appendChild(newColorDiv);
            }

            const newDeleteFoodImage = newFoodItem.querySelector(".delete-food-img");
            newDeleteFoodImage.addEventListener("click", onDeleteFoodImageClick);
            newFoodItem.querySelector(".edit-food-img").addEventListener("click", onEditFoodItemClick);

            if (update) {
                let oldElement = document.querySelector("#food-item-" + data["id"]);
                let oldDeleteFoodImage = oldElement.querySelector(".delete-food-img");
                newDeleteFoodImage.classList = oldDeleteFoodImage.classList;//for the not clickable class
                foodDiv.insertBefore(newFoodItem, oldElement);
                oldElement.remove();
            }else{
                foodDiv.insertBefore(newFoodItem, foodDiv.firstChild);
            }


        }).catch((error) => console.log(error));

        clearForm();
    }
}

function clearForm() {
    foodOverlay.style.display = "none";

    document.querySelectorAll(".single-category-item-container").forEach(categoryItem => {
        if (categoryItem.id != "category-templates") {
            categoryItem.remove();
        }
    });

    document.querySelectorAll(".category-select > option").forEach(option => {
        option.className = "";
    });


    foodOverlay.querySelectorAll("input").forEach(input => {
        input.value = "";
    });

    categorySelect.hidden = false;
    categoryAddImage.hidden = false;
    foodDataElement.dataset.update = "0"

    for(let i = 0; i< categorySelect.options.length;i++){
        if([...categorySelect.options[i].classList].includes("hidden")){
            categorySelect.options[i].classList.remove("hidden");
        }
    }
}

function createNewCategoryItem(categoryId, categoryName, categoryColor) {
    const newCategoryItem = categoryTemplate.cloneNode(true);
    newCategoryItem.id = "";
    newCategoryItem.querySelector(".category-id-input").value = categoryId;
    newCategoryItem.querySelector(".category-name-div").innerText = categoryName;
    newCategoryItem.querySelector(".category-color-div").style.background = categoryColor;
    newCategoryItem.querySelector(".category-color-div").style.color = categoryColor;
    newCategoryItem.querySelector(".category-delete-img").addEventListener("click", onDeleteCategoryClick);

    categoryTemplate.parentElement.appendChild(newCategoryItem);
}

function onCategoryAddClick() {
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];

    disableCategoryOption(selectedOption);

    let categoryId = selectedOption.value;
    let categoryName = selectedOption.innerText;
    let categoryColor = selectedOption.dataset.color;

    createNewCategoryItem(categoryId, categoryName, categoryColor);

}

function disableCategoryOption(option) {
    option.classList.add("hidden");
    checkCategorySelect();
}

function enableCategoryOptionById(id) {
    for (let i = 0; i < categorySelect.options.length; i++) {
        if (categorySelect.options[i].value == id) {
            categorySelect.options[i].classList.remove("hidden");
            break;
        }
    }
    checkCategorySelect();
}

function checkCategorySelect() {
    let unHiddenItem = false;
    let firstUnHiddenItem = null;

    for (let i = 0; i < categorySelect.options.length; i++) {
        if (!categorySelect.options[i].classList.contains("hidden")) {
            unHiddenItem = true;
            firstUnHiddenItem = categorySelect.options[i];
            break;
        }
    }

    if (unHiddenItem) {
        console.log(unHiddenItem);
        categorySelect.value = firstUnHiddenItem.value;
        categorySelect.hidden = false;
        categoryAddImage.hidden = false;
    } else {
        categorySelect.hidden = true;
        categoryAddImage.hidden = true;
    }
}

function onDeleteCategoryClick(event) {
    const parentDiv = event.target.parentElement;
    const idInput = parentDiv.querySelector(".category-id-input");
    enableCategoryOptionById(idInput.value);
    parentDiv.remove()

}

function onDeleteFoodImageClick(event) {
    if (event.target.classList.contains("not-clickable")) {
        alert("Diese Zutat kann nicht gelöscht werden, da sie in Speisen vorkommt.")
    } else {
        if (confirm("Bist du sicher, dass du diese Zutat löschen willst?")) {
            const removable = event.target.parentElement;
            let id = removable.querySelector(".food-id-input").value;
            fetch("/weight-watch/food/food", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfMiddlewareToken.value
                },
                body: JSON.stringify({
                    id: id
                })
            }).then((response) => {
                if (response.ok) {
                    removable.remove();
                } else {
                    throw new Error("Request failed.");
                }

            }).catch((error) => console.log(error));
        }
    }
}

function onEditFoodItemClick(event) {
    const foodItem = event.target.parentElement;
    let id = foodItem.querySelector(".food-id-input").value;

    let new_url = new URL(location.protocol + "//" + location.host + "/weight-watch/food/food");
    new_url.searchParams.append("id", id);

    fetch(new_url.toString(), {
        method: "GET",
        headers: {
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
        },
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Request failed.");
    }).then(data => {
        foodDataElement.dataset.update = "1";
        foodDataElement.dataset.id = id;

        let food = data["food"];
        nameInput.value = food["name"];
        kcalInput.value = food["kcal"];
        proteinsInput.value = food["proteins"];
        sugarInput.value = food["sugar"];
        carbohydratesInput.value = food["carbohydrates"];
        fatInput.value = food["fat"];

        data["categories"].forEach(category => {
            let categoryId = category["id"];
            createNewCategoryItem(categoryId, category["name"], category["color"]);
            for (let i = 0; categorySelect.options.length; i++) {
                if (categorySelect.options[i].value == categoryId) {
                    categorySelect.options[i].classList.add("hidden");
                    checkCategorySelect();
                    break;
                }
            }
        });

        foodOverlay.style.display = "block";

    }).catch((error) => console.log(error));
}

function onCategoryFormClose(event) {
    if (confirm("Bist du sicher, dass du die Kategorie nicht erstellen willst?")) {
        clearCategoryForm();
    }
}

function clearCategoryForm() {
    categoryOverlay.style.display = "none";

    categoryOverlay.querySelector("#category-color-input").value = "#ffff90";
    categoryOverlay.querySelector("#category-name-input").value = "";
    categoryDataElement.dataset.update = 0;

}

function onCategoryFormConfirm() {
    if (confirm("Ist die Kategorie so fertig und soll erstellt werden?")) {
        let name = categoryNameInput.value;
        let color = categoryColorInput.value;
        let context = {
            name: name,
            color: color
        }
        let method = "POST"

        let update = false;

        if (categoryDataElement.dataset.update == "1") {
            context["id"] = categoryDataElement.dataset.id;
            method = "PUT"
            update = true;
        }

        fetch("/weight-watch/category", {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfMiddlewareToken.value
            },
            body: JSON.stringify(context)
        }).then((response) => {
            if (response.ok) {
                if (!update) {
                    return response.json();
                } else {
                    const colorDivs = document.querySelectorAll(".color-div");
                    colorDivs.forEach(colorDiv => {
                        if (colorDiv.dataset.id == categoryDataElement.dataset.id) {
                            colorDiv.dataset.name = name;
                            colorDiv.style.background = color;
                            colorDiv.style.color = color;
                        }
                    });

                    for (let i = 0; i < categorySelect.options.length; i++) {
                        let option = categorySelect.options[i];
                        if (option.value == categoryDataElement.dataset.id) {
                            option.dataset.color = color;
                            option.innerText = name;
                            option.style.background = color;
                        }
                    }
                }

            } else {
                throw new Error("Request failed.");
            }
        }).then(data => {

            const newOption = document.createElement("option");
            newOption.dataset.color = color;
            newOption.innerText = name;
            newOption.style.background = color;
            newOption.value = data["id"];
            categorySelect.appendChild(newOption);
        }).catch((error) => console.log(error));

        clearCategoryForm();
    }
}

function onEditCategory(event) {
    categoryDataElement.dataset.update = 1;
    categoryDataElement.dataset.id = event.target.dataset.id;
    categoryNameInput.value = event.target.dataset.name;
    categoryColorInput.value = rgbToHex(event.target.style.background);

    categoryOverlay.style.display = "block";
}

function rgbToHex(rgb) {
    // Zerlegen Sie die RGB-Zeichenkette in die R-, G- und B-Komponenten
    let parts = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!parts) return rgb;

    // Konvertieren Sie die Komponenten in Hex-Werte und formatieren Sie diese als Hex-Farbe
    let hex = '#';
    for (let i = 1; i <= 3; i++) {
        let hexPart = parseInt(parts[i]).toString(16);
        if (hexPart.length === 1) {
            hexPart = '0' + hexPart;
        }
        hex += hexPart;
    }
    return hex;
}

function onFoodSearchInput(event){
    let searchText = event.target.value.toLowerCase();

    const foodNames = document.querySelectorAll(".food-name");
    foodNames.forEach(foodName =>{
        if(foodName.innerText.toLowerCase().includes(searchText)){
            foodName.parentElement.style.display = "";
        }else{
            foodName.parentElement.style.display = "none";
        }
    });
}

function functionShowAllFoodItems(){
    const foodItems = document.querySelectorAll(".single-food-item");
    foodItems.forEach(foodItem =>{
        foodItem.style.display="";
    });
}
