const csrfMiddlewareToken = document.querySelector('[name=csrfmiddlewaretoken]');
const overlay = document.getElementById("overlay");
const foodSelect = document.querySelector("#food-select")
const foodTemplate = document.querySelector("#food-template");
const dishTemplate = document.querySelector("#dish-template");
const foodItemContainer = document.querySelector("#food-item-container")
const nameInput = document.querySelector("#name-input");
const amountInput = document.querySelector("#amount-input");
const dishListDiv = document.querySelector("#dish-list");
const kcalDiv = document.querySelector("#kcal-div");
const fatDiv = document.querySelector("#fat-div");
const carbohydratesDiv = document.querySelector("#single-carbohydrates-div");
const sugarDiv = document.querySelector("#sugar-div");
const proteinsDiv = document.querySelector("#proteins-div");
const foodDataElement = document.querySelector("#food-data");
const categorySelect = document.querySelector("#category-select");
const searchInput = document.querySelector("#search-input");
const dishSearchInput = document.querySelector("#dish-search-input");

window.addEventListener("load", () => {
    const deleteImages = document.querySelectorAll(".delete-img");

    deleteImages.forEach(deleteImage => {
        deleteImage.addEventListener("click", onDeleteItemClick);
    });

    const editImages = document.querySelectorAll(".edit-img");

    editImages.forEach(editImage => {
        editImage.addEventListener("click", onEditItemClick);
    });

    const cloneImages = document.querySelectorAll(".clone-img");

    cloneImages.forEach(cloneImage => {
        cloneImage.addEventListener("click", onCloneItemClick);
    });

    const dishListAddImage = document.querySelector("#dish-list-add-image");
    dishListAddImage.addEventListener("click", (event) => {
        overlay.style.display = "block";
    });

    const closeFormElements = document.querySelectorAll("#close-form-img, #close-btn");
    closeFormElements.forEach(closeFormElement => {
        closeFormElement.addEventListener("click", onFormClose);
    });

    const confirmButton = document.querySelector("#confirm-btn");
    confirmButton.addEventListener("click", onFormConfirm);

    const foodDeleteImages = document.querySelectorAll(".food-delete-img");
    foodDeleteImages.forEach(foodDeleteImage => {
        foodDeleteImage.addEventListener("click", onFoodDeleteClick);
    });

    const foodAddImage = document.querySelector("#food-add-image");
    foodAddImage.addEventListener("click", addNewFoodDiv);

    categorySelect.addEventListener("change", onCategoryChange);
    searchInput.addEventListener("input", onFoodSearchChange);

    const dishSearchInput = document.querySelector("#dish-search-input");
    dishSearchInput.addEventListener("input", onDishSearchInput);
});


function fillMacrosFromData(data) {
    kcalDiv.innerText = "kcal: " + data["kcal"];
    fatDiv.innerText = "Fett: " + data["fat"] + "g";
    proteinsDiv.innerText = "Proteine: " + data["proteins"] + "g";
    carbohydratesDiv.innerText = "Kohlenhydrate: " + data["carbohydrates"] + "g";
    sugarDiv.innerText = "davon Zucker: " + data["sugar"] + "g";
}

function onDeleteItemClick(event) {
    const image = event.target;
    const amountDiv = image.previousElementSibling.previousElementSibling;
    if (confirm(`Bist du sicher, dass du das Gericht "${amountDiv.innerText}" löschen willst?`)) {
        id = image.dataset.id;
        image.parentElement.remove()

        fetch("/weight-watch/user-dish-amount", {
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
                return response.json();
            }
            throw new Error("Request failed.");
        }).then(data => {
            fillMacrosFromData(data);

        }).catch((error) => console.log(error));
    }

}

function onFormConfirm(event) {
    if (confirm("Ist die Speise so fertig und soll erstellt werden?")) {
        const name = nameInput.value;
        let amount = amountInput.value;
        if (amount == "") {
            amount = 100;
        }
        const dishFoodAmounts = []

        const singleFoodItemContainers = document.querySelectorAll(".single-food-item-container");
        singleFoodItemContainers.forEach(singleFoodItemContainer => {
            let amount = singleFoodItemContainer.querySelector(".food-amount-input").value;
            if (amount == "") {
                amount = 0;
            }
            if (singleFoodItemContainer.id == "") {
                dishFoodAmounts.push(
                    {
                        id: singleFoodItemContainer.querySelector(".food-id-input").value,
                        amount: amount
                    }
                )
            }
        });


        if (dishFoodAmounts.length > 0) {
            let context = {
                name: name,
                amount: amount,
                dishFoodAmounts: dishFoodAmounts
            }
            let method = "POST"
            let update = false;
            if (foodDataElement.dataset.update == "1") {
                context["id"] = foodDataElement.dataset.id;
                method = "PUT"
                update = true;
            }

            fetch("/weight-watch/user-dish-amount", {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfMiddlewareToken.value
                },
                body: JSON.stringify(context)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("Request failed.");
            }).then(data => {
                if (update) {
                    let oldElement = document.querySelector("#dish-item-" + data["id"]);
                    oldElement.remove();
                }

                const newDishItem = dishTemplate.cloneNode(true);
                newDishItem.id = "dish-item-" + data["id"];
                newDishItem.querySelector(".name-div").innerText = name;
                newDishItem.querySelector(".amount-div").innerText = amount + " %";

                const deleteImage = newDishItem.querySelector(".delete-img");
                deleteImage.dataset.id = data["id"];
                deleteImage.addEventListener("click", onDeleteItemClick);
                newDishItem.querySelector(".edit-img").addEventListener("click", onEditItemClick);
                newDishItem.querySelector(".clone-img").addEventListener("click", onCloneItemClick);
                dishListDiv.insertBefore(newDishItem, dishListDiv.firstChild);

                fillMacrosFromData(data);

            }).catch((error) => console.log(error));
        }
        showAllNameDivs();
        clearForm();
    }
}

function createNewFoodItem(foodName, foodId, foodAmount = "") {
    const newFoodDiv = foodTemplate.cloneNode(true);
    newFoodDiv.removeAttribute('id');
    const foodNameDiv = newFoodDiv.querySelector(".food-name-div");
    const foodIdInput = newFoodDiv.querySelector(".food-id-input");
    const foodAmountInput = newFoodDiv.querySelector(".food-amount-input");
    const foodDeleteImage = newFoodDiv.querySelector(".food-delete-img");

    foodNameDiv.innerText = foodName;
    foodIdInput.value = foodId;
    foodAmountInput.value = foodAmount;

    foodDeleteImage.addEventListener("click", onFoodDeleteClick)

    foodItemContainer.appendChild(newFoodDiv);
}

function addNewFoodDiv(event) {
    const foodId = foodSelect.value;
    const foodName = foodSelect.options[foodSelect.selectedIndex].textContent;
    if (foodId) {
        createNewFoodItem(foodName, foodId);
    }

}

function onFoodDeleteClick(event) {
    if (confirm("Bist du sicher, dass du die Zutat löschen willst?")) {
        event.target.parentElement.remove();
    }
}

function onFormClose() {
    if (confirm("Bist du sicher, dass du die Speise nicht hinzufügen willst?")) {
        clearForm();
    }
}

function clearForm() {
    overlay.style.display = "none";

    nameInput.value = "";
    amountInput.value = "";

    foodDataElement.dataset.update = "0";

    const singleFoodItemContainers = document.querySelectorAll(".single-food-item-container");
    singleFoodItemContainers.forEach(singleFoodItemContainer => {
        if (singleFoodItemContainer.id == "") {
            singleFoodItemContainer.remove();
        }
    });
}

function fetchUserDishAmountAndShowOverlay(element, update) {
    const userDishAmountId = element.parentElement.querySelector(".delete-img").dataset.id;
    let new_url = new URL(location.protocol + "//" + location.host + "/weight-watch/user-dish-amount");
    new_url.searchParams.append("id", userDishAmountId);

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
        nameInput.value = data["dishName"];
        amountInput.value = data["amount"];

        data["dishFoodAmounts"].forEach(dishFoodAmount => {
            createNewFoodItem(dishFoodAmount["name"], dishFoodAmount["food_id"], dishFoodAmount["amount"]);
        })

        overlay.style.display = "block";

        if (update) {
            foodDataElement.dataset.update = "1";
            foodDataElement.dataset.id = data["userDishAmountId"];
        }


    }).catch((error) => console.log(error));
}

function onEditItemClick(event) {
    const element = event.target;
    fetchUserDishAmountAndShowOverlay(element, true);
}

function onCloneItemClick(event) {
    const element = event.target;
    fetchUserDishAmountAndShowOverlay(element, false);
}

function selectEmptyOptionForFoodSelectIfAllHidden() {
    let countHidden = 0;
    let notHidden = null;
    for (let i = 0; i < foodSelect.options.length; i++) {
        if(foodSelect.options[i].value) {
            if (foodSelect.options[i].style.display == "none") {
                countHidden++;
            } else {
                notHidden = foodSelect.options[i];
            }
        }
    }

    if (countHidden == foodSelect.options.length - 1) {
        foodSelect.value = "";
    }else if(notHidden){
        foodSelect.value = notHidden.value;
    }
}

function onCategoryChange(event) {
    let categoryId = parseInt(event.target.value);
    for (let i = 0; i < foodSelect.options.length; i++) {
        const option = foodSelect.options[i];
        if (option.value) {
            if (categoryId) {
                let categoryIds = option.dataset.categories.replaceAll("\n", "").split(",").map(Number);
                categoryIds.pop();

                if (categoryIds.includes(categoryId)) {
                    if (!option.dataset.searched) {
                        option.style.display = "block";
                    }
                    option.dataset.categorised = "";
                    foodSelect.value = option.value;
                } else {
                    option.style.display = "none";
                    option.dataset.categorised = "true";
                }
            } else {
                if (!option.dataset.searched) {
                    option.style.display = "block";
                }
                option.dataset.categorised = "";
            }
        }
    }
    selectEmptyOptionForFoodSelectIfAllHidden();
}

function onFoodSearchChange(event) {
    let searchInput = event.target;
    let searchValue = searchInput.value.toLowerCase();
    for (let i = 0; i < foodSelect.options.length; i++) {
        if (foodSelect.options[i].value) {
            if (!searchValue || foodSelect.options[i].innerText.toLowerCase().includes(searchValue)) {
                if (!foodSelect.options[i].dataset.categorised) {
                    foodSelect.options[i].style.display = "block";
                }
                foodSelect.options[i].dataset.searched = "";
            } else {
                foodSelect.options[i].style.display = "none";
                foodSelect.options[i].dataset.searched = "true";
            }
        }
    }

    selectEmptyOptionForFoodSelectIfAllHidden();
}

function onDishSearchInput(event){
    let searchString = event.target.value.toLowerCase();

    const nameDivs = document.querySelectorAll(".name-div");
    nameDivs.forEach(nameDiv =>{
        if(nameDiv.innerText.toLowerCase().includes(searchString)){
            nameDiv.parentElement.style.display="";
        }else{
            nameDiv.parentElement.style.display="none";
        }
    });
}

function showAllNameDivs(){
    const nameDivs = document.querySelectorAll(".name-div");
    nameDivs.forEach(nameDiv =>{
        nameDiv.parentElement.style.display="";
    });

    dishSearchInput.value = "";
}
