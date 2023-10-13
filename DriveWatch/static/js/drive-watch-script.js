const csrfMiddlewareToken = document.querySelector('[name=csrfmiddlewaretoken]');
const rideUserSelect = document.querySelector("#ride-user-select");
const rideDistanceInput = document.querySelector("#ride-distance-input");
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

    document.querySelector("#add-drive-img").addEventListener("click", onCreateNewRideClick);
    document.querySelector("#add-tank-filling-img").addEventListener("click", onCreateNewTankFillingClick);

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

function onCreateNewRideClick(event) {
    let userId = rideUserSelect.value ? rideUserSelect.value : null;
    let distance = rideDistanceInput.value ? rideDistanceInput.value : "0";
    if (!distance.includes(".")) {
        distance += ".0"
    }
    fetch("/drive-watch/ride", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfMiddlewareToken.value
        },
        body: JSON.stringify({
            userId: userId,
            distance: distance
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        throw new Error("Request failed.");
    }).then(data => {

        const newRideItem = rideItemTemplate.cloneNode(true);
        newRideItem.id = "";
        newRideItem.querySelector(".user-div").innerText = rideUserSelect.options[rideUserSelect.selectedIndex].innerText;
        newRideItem.querySelector(".distance-span").innerText = distance;
        newRideItem.querySelector(".date-div").innerText = data["formatted_date"];
        const deleteImage = newRideItem.querySelector(".delete-img");
        deleteImage.dataset.id = data["id"];
        deleteImage.addEventListener("click", onDeleteRideItemClick);

        rideItemTemplate.parentElement.insertBefore(newRideItem, rideItemTemplate.parentElement.firstChild);

    }).catch((error) => console.log(error));
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

            document.querySelectorAll(".ride-item").forEach(rideItem => {
                if (rideItem.id != "ride-item-template") {
                    rideItem.remove();
                }
            });
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