const csrfMiddlewareToken = document.querySelector('[name=csrfmiddlewaretoken]');
const rideUserSelect = document.querySelector("#ride-user-select");
const rideDistanceInput = document.querySelector("#ride-distance-input");
const rideNameInput = document.querySelector("#ride-name-input");
const rideItemTemplate = document.querySelector("#ride-item-template");
const tankFillingMoneyInput = document.querySelector("#tank-filling-money-input");
const driveDataDiv = document.querySelector("#drive-data-div");
const togetherDistanceDiv = document.querySelector("#together-distance");
const togetherMoneyDiv = document.querySelector("#together-money");
const totalMoneyDiv = document.querySelector("#total-money");

window.addEventListener("load", () => {
    const deleteImages = document.querySelectorAll(".delete-img");
    deleteImages.forEach(deleteImage => {
        deleteImage.addEventListener("click", onDeleteRideItemClick);
    });

    const cloneImages = document.querySelectorAll(".clone-img");
    cloneImages.forEach(cloneImage => {
        cloneImage.addEventListener("click", onCloneRideClick);
    });

    document.querySelector("#add-drive-img").addEventListener("click", onCreateNewRideClick);
    document.querySelector("#add-tank-filling-img").addEventListener("click", onCreateNewTankFillingClick);

    document.querySelector("#search-ride-input").addEventListener("input", onSearchRideInput);

    fillTankFillingDataSummary();
});

function onDeleteRideItemClick(event) {

    if (confirm("Bist du Sicher, dass du diese Fahrt löschen willst?")) {
        let id = event.target.dataset.id;

        fetch("/drive-watch/ride", {
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
                event.target.parentElement.remove();
            } else {
                throw new Error("Request failed.");
            }
        }).catch((error) => console.log(error));
    }
}

function fetchNewRideToServer(userId, distance, name) {
    fetch("/drive-watch/ride", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfMiddlewareToken.value
        },
        body: JSON.stringify({
            userId: userId,
            distance: distance,
            name: name
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Request failed.");
    }).then(data => {

        const newRideItem = rideItemTemplate.cloneNode(true);
        newRideItem.id = "";
        newRideItem.style.display = "";

        const userDiv = newRideItem.querySelector(".user-div");
        userDiv.innerText = rideUserSelect.options[rideUserSelect.selectedIndex].innerText;
        userDiv.dataset.id = rideUserSelect.value;

        newRideItem.querySelector(".distance-span").innerText = distance;
        newRideItem.querySelector(".date-div").innerText = data["formatted_date"];
        newRideItem.querySelector(".name-div").innerText = name;

        const deleteImage = newRideItem.querySelector(".delete-img");
        deleteImage.dataset.id = data["id"];
        deleteImage.addEventListener("click", onDeleteRideItemClick);

        newRideItem.querySelector(".clone-img").addEventListener("click", onCloneRideClick);

        rideItemTemplate.parentElement.insertBefore(newRideItem, rideItemTemplate.parentElement.firstChild);

    }).catch((error) => console.log(error));
}

function onCreateNewRideClick(event) {
    let userId = rideUserSelect.value ? rideUserSelect.value : null;
    let name = rideNameInput.value;
    let distance = rideDistanceInput.value ? rideDistanceInput.value : "0";

    if (!distance.includes(".")) {
        distance += ".0"
    }
    fetchNewRideToServer(userId, distance, name);
}

function onCreateNewTankFillingClick() {
    let tankFillingMoney = tankFillingMoneyInput.value ? tankFillingMoneyInput.value : "0";

    fetch("/drive-watch/tank-filling", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfMiddlewareToken.value
        },
        body: JSON.stringify({
            money: tankFillingMoney
        })
    }).then((response) => {
        if (response.ok) {
            fillTankFillingDataSummary();
        } else {
            throw new Error("Request failed.");
        }
    }).catch((error) => console.log(error));

}

function fillTankFillingDataSummary() {
    fetch("/drive-watch/tank-filling", {
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
        if (Object.keys(data).length > 0) {
            driveDataDiv.style.display = "flex";
            togetherMoneyDiv.innerText = data["together_money"]
            togetherDistanceDiv.innerText = data["together_distance"]
            totalMoneyDiv.innerText = data["total_money"]

            let userData = data["user_data"]

            userData.forEach(userDate => {
                let id = userDate["id"];
                driveDataDiv.querySelector(`#user${id}-distance`).innerText = userDate["distance"];
                driveDataDiv.querySelector(`#user${id}-money`).innerText = userDate["money"];
                driveDataDiv.querySelector(`#user${id}-calculated-money`).innerText = userDate["calculated_money"];
            });
        } else {
            driveDataDiv.style.display = "none";
        }


    }).catch((error) => console.log(error));
}

function onCloneRideClick(event){
    const rideItem = event.target.parentElement;
    const userDiv = rideItem.querySelector(".user-div");
    let userId = userDiv.dataset.id ? userDiv.dataset.id : null;
    let name = rideItem.querySelector(".name-div").innerText;
    let distance = rideItem.querySelector(".distance-span").innerText;

    fetchNewRideToServer(userId, distance, name);
}

function onSearchRideInput(event){
    let searchText = event.target.value.toLowerCase();

    document.querySelectorAll(".name-div").forEach(nameDiv =>{
        if(nameDiv.id != "ride-item-template"){
            if(nameDiv.innerText.toLowerCase().includes(searchText)){
                nameDiv.parentElement.style.display = "";
            }else {
                nameDiv.parentElement.style.display = "none";
            }
        }
    });
}