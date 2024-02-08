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
const ownProteinsInput = document.querySelector("#own-proteins-input");
const ownSugarInput = document.querySelector("#own-sugar-input");
const ownCarbohydratesInput = document.querySelector("#own-carbohydrates-input");
const ownFatInput = document.querySelector("#own-fat-input");
const ownKcalInput = document.querySelector("#own-kcal-input");
const dishDateInput = document.querySelector("#datetime-input");

const shareOverlay = document.querySelector("#shareOverlay");
const shareDishData = document.querySelector("#share-dish-data");
const shareUserSelect = document.querySelector("#user-select");

window.addEventListener("load", () => {
    const infoImage = document.querySelector("#info-img");

    infoImage.addEventListener("click", onDishInfoItemClick);

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
    dishListAddImage.addEventListener("click", onDishListAddImageClick);

    const closeFormElements = document.querySelectorAll("#close-form-img, #close-btn");
    closeFormElements.forEach(closeFormElement => {
        closeFormElement.addEventListener("click", onFormClose);
    });

    const closeShareFormElements = document.querySelectorAll("#close-user-select-form-img, #close-user-select-btn");
    closeShareFormElements.forEach(closeShareFormElement => {
        closeShareFormElement.addEventListener("click", event => {
            shareOverlay.style.display = "none";
        });
    });

    const confirmShareFormBtn = document.querySelector("#confirm-user-select-btn");
    confirmShareFormBtn.addEventListener("click", onShareUserConfirm);

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

    const ownMacroInputs = document.querySelectorAll(".own-macro-input");
    ownMacroInputs.forEach(ownMacroInput => {
        ownMacroInput.addEventListener("change", onMacroInputChange);
    });

    const shareImages = document.querySelectorAll(".share-img");
    shareImages.forEach(shareImage => {
        shareImage.addEventListener("click", onShareItemClick);
    });

    setMacroTextColors();

});

function onDishInfoItemClick() {
    const singleFoodItemContainers = document.querySelectorAll(".single-food-item-container");
    let foodIdAmountList = [];
    singleFoodItemContainers.forEach(singleFoodItemContainer => {

        if (singleFoodItemContainer.id != "food-template") {
            let foodId = singleFoodItemContainer.querySelector(".food-id-input").value;
            let foodAmount = singleFoodItemContainer.querySelector(".food-amount-input").value;
            if (!foodAmount) {
                foodAmount = 0;
            }

            foodIdAmountList.push({
                id: foodId,
                amount: foodAmount
            })
        }
    });

    const amount = parseFloat(amountInput.value) / 100

    fetch("/weight-watch/food-macros", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfMiddlewareToken.value
        },
        body: JSON.stringify({
            data: foodIdAmountList
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Request failed.");
    }).then(data => {
        alert(`Kcal: ${data["kcal"] * amount}\nFett: ${data["fat"] * amount}\nKohlenhydrate: ${data["carbohydrates"] * amount}\n   davon Zucker: ${data["sugar"] * amount}\nProteine: ${data["proteins"] * amount}`)

    }).catch((error) => console.log(error));
}

function fillMacrosFromData(data) {
    kcalDiv.querySelector("span").innerText = data["kcal"];
    fatDiv.querySelector("span").innerText = data["fat"];
    proteinsDiv.querySelector("span").innerText = data["proteins"];
    carbohydratesDiv.querySelector("span").innerText = data["carbohydrates"];
    sugarDiv.querySelector("span").innerText = data["sugar"];

    setMacroTextColors();
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
            console.log(data);

        }).catch((error) => console.log(error));
    }

}

function onFormConfirm(event) {
    if (confirm("Ist die Speise so fertig und soll erstellt werden?")) {
        const name = nameInput.value;
        const datetime = dishDateInput.value;
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
                date: datetime,
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
                newDishItem.dataset.date = datetime;
                newDishItem.id = "dish-item-" + data["id"];
                newDishItem.querySelector(".name-div").innerText = name;
                newDishItem.querySelector(".amount-div").innerText = amount + " %";

                const deleteImage = newDishItem.querySelector(".delete-img");
                deleteImage.dataset.id = data["id"];
                deleteImage.addEventListener("click", onDeleteItemClick);
                newDishItem.querySelector(".edit-img").addEventListener("click", onEditItemClick);
                newDishItem.querySelector(".clone-img").addEventListener("click", onCloneItemClick);
                newDishItem.querySelector(".share-img").addEventListener("click", onShareItemClick);

                const dishItems = document.querySelectorAll(".dish-item");
                for (let i = 0; i < dishItems.length; i++) {
                    console.log(dishItems[i]);
                    console.log(dishItems[i].dataset.date);
                    console.log(datetime, dishItems[i].dataset.date < datetime);

                    if (dishItems[i].id != "dish-template" && dishItems[i].dataset.date < datetime) {
                        dishListDiv.insertBefore(newDishItem, dishItems[i]);
                        break;
                    } else if (i == dishItems.length - 1) {
                        dishListDiv.appendChild(newDishItem);
                    }
                }


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

function fetchUserDishAmountAndShowOverlay(element, update, resetDate = false) {
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

        if (resetDate) {
            let now = new Date();

            let year = now.getFullYear();
            let month = (now.getMonth() + 1).toString().padStart(2, '0');
            let day = now.getDate().toString().padStart(2, '0');
            let hours = now.getHours().toString().padStart(2, '0');
            let minutes = now.getMinutes().toString().padStart(2, '0');

            dishDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            dishDateInput.value = data["eaten"];
        }
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
    fetchUserDishAmountAndShowOverlay(element, false, true);
}

function selectFirstOptionForFoodSelectIfAllHidden() {
    let countHidden = 0;
    let notHidden = null;
    for (let i = 0; i < foodSelect.options.length; i++) {
        if (foodSelect.options[i].value) {
            if (foodSelect.options[i].style.display == "none") {
                countHidden++;
            } else if(!notHidden){
                notHidden = foodSelect.options[i];
            }
        }
    }

    if (countHidden == foodSelect.options.length - 1) {
        foodSelect.value = "";
    } else if (notHidden) {
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
    selectFirstOptionForFoodSelectIfAllHidden();
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

    const optionsArray = Array.from(foodSelect.options);

    optionsArray.sort((a, b) => {
        const aString = a.text.toLowerCase();
        const bString = b.text.toLowerCase();

        let numberOfSameCharsA = 0;
        let endOfA = false;
        let numberOfSameCharsB = 0;
        let endOfB = false;

        let minLength = aString.length;
        if (bString.length < minLength) {
            minLength = bString.length;
        }
        if (searchValue.length < minLength) {
            minLength = searchValue.length;
        }

        for (let i = 0; i < minLength; i++) {
            if (!endOfA && aString[i] == searchValue[i]) {
                numberOfSameCharsA += 1;
            } else {
                endOfA = true;
            }

            if (!endOfB && bString[i] == searchValue[i]) {
                numberOfSameCharsB += 1;
            } else {
                endOfB = true;
            }

            if (endOfA && endOfB || (endOfA && numberOfSameCharsB > numberOfSameCharsA) || (endOfB && numberOfSameCharsA > numberOfSameCharsB)) {
                break;
            }
        }

        if (numberOfSameCharsA > numberOfSameCharsB) {
            return -1;
        } else if (numberOfSameCharsA < numberOfSameCharsB) {
            return 1;
        } else {
            return 0;
        }
    });

    while (foodSelect.options.length > 0) {
        foodSelect.remove(0);
    }

    let placeholder = null;
    optionsArray.forEach(option => {
        if(option.value){
            foodSelect.appendChild(option);
        }else{
            placeholder = option;
        }
    });

    if(foodSelect.options.length > 0){
        foodSelect.insertBefore(placeholder, foodSelect.options[0]);
    }else{
        foodSelect.appendChild(placeholder);
    }
    
    selectFirstOptionForFoodSelectIfAllHidden();
}

function onDishSearchInput(event) {
    let searchString = event.target.value.toLowerCase();

    const nameDivs = document.querySelectorAll(".name-div");
    nameDivs.forEach(nameDiv => {
        if (nameDiv.innerText.toLowerCase().includes(searchString)) {
            nameDiv.parentElement.style.display = "";
        } else {
            nameDiv.parentElement.style.display = "none";
        }
    });
}

function showAllNameDivs() {
    const nameDivs = document.querySelectorAll(".name-div");
    nameDivs.forEach(nameDiv => {
        nameDiv.parentElement.style.display = "";
    });

    dishSearchInput.value = "";
}

function onMacroInputChange(event) {

    fetch("/weight-watch/user-macros", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfMiddlewareToken.value
        },
        body: JSON.stringify({
            kcal: ownKcalInput.value,
            fat: ownFatInput.value,
            sugar: ownSugarInput.value,
            proteins: ownProteinsInput.value,
            carbohydrates: ownCarbohydratesInput.value,
        })
    }).then((response) => {
        if (response.ok) {
            setMacroTextColors();
        } else {
            throw new Error("Request failed.");
        }
    }).catch((error) => console.log(error));
}

function setMacroTextColors() {
    const macroDivs = document.querySelectorAll(".single-macro-div, #single-carbohydrates-div, #sugar-div");
    macroDivs.forEach(macroDiv => {
        const valueSpan = macroDiv.querySelector("span");
        const macroInput = macroDiv.querySelector(".own-macro-input");
        let value = parseFloat(valueSpan.innerText);
        let ownValue = parseFloat(macroInput.value);

        if (!ownValue) {
            ownValue = 0;
        }
        if (macroInput.id == "own-fat-input" || macroInput.id == "own-proteins-input") {
            if (value > ownValue) {
                valueSpan.style.color = "#008000";
            } else {
                valueSpan.style.color = "#FF5733";
            }
        } else {
            if (value > ownValue) {
                valueSpan.style.color = "#FF5733";
            } else {
                valueSpan.style.color = "#008000";
            }
        }
    });
}

function onShareItemClick(event) {
    shareOverlay.style.display = "block";
    shareDishData.dataset.id = event.target.parentElement.querySelector(".delete-img").dataset.id;
    shareDishData.dataset.name = event.target.parentElement.querySelector(".name-div").innerText;
}

function onShareUserConfirm(event) {
    let username = shareUserSelect.options[shareUserSelect.selectedIndex].innerText.replace(/(^\s*)/, "").replace(/(\s*$)/, "");
    let userId = shareUserSelect.value;
    let dishName = shareDishData.dataset.name;
    let dishId = shareDishData.dataset.id;
    if (confirm(`Bist du dir sicher, dass du das Gericht ${dishName} mit dem Nutzer ${username} teilen willst?`)) {
        fetch("/weight-watch/user-dish-amount/share", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfMiddlewareToken.value
            },
            body: JSON.stringify({
                userId: userId,
                dishId: dishId
            })
        }).then((response) => {
            if (response.ok) {
                shareOverlay.style.display = "none";

            } else {
                throw new Error("Request failed.");
            }
        }).catch((error) => console.log(error));
    }

}

function onDishListAddImageClick() {
    overlay.style.display = "block";

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date();
    const options = {timeZone: timeZone};
    const formattedDate = date.toLocaleString("de-DE", options);
    console.log(formattedDate)
    // Das formatierte Datum in ein Array von Teilen aufteilen
    let dateParts = formattedDate.split(', ');
    let [day, month, year] = dateParts[0].split('.');
    const timePart = dateParts[1];

    // Uhrzeit in ein Array von Teilen aufteilen
    const [hours, minutes, seconds] = timePart.split(':');


    const currentDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    dishDateInput.value = currentDateString;

    amountInput.value = 100;
}