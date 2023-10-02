const startDateInput = document.querySelector("#start-date-input");
const endDateInput = document.querySelector("#end-date-input");
const typeSelect = document.querySelector("#type-select");
const statisticCanvas = document.querySelector("#statistic-canvas");

let statisticChart = null;

window.addEventListener("load", () => {
    startDateInput.addEventListener("change", onInputChange);
    endDateInput.addEventListener("change", onInputChange);
    typeSelect.addEventListener("change", onInputChange);
    statisticChart = new Chart(statisticCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Zu dir genommen',
                    data: [],
                    backgroundColor: "rgba(54, 162, 235, 0.5)",
                    borderColor: "rgb(54, 162, 235)",
                    fill: false,
                },
                {
                    label: 'Ziel',
                    data: [],
                    backgroundColor: "rgba(255, 99, 132, 0.5)",
                    borderColor: "rgb(255, 99, 132)",
                    fill: false,
                    stepped: "before",
                },
            ],
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: "day",
                        tooltipFormat: 'dd.MM.yyyy',
                        displayFormats: {
                            day: 'dd.MM.yyyy',
                        },
                    },
                    title: {
                        display: true,
                        text: 'Datum'
                    }
                },
                y: {
                    title: {
                        display: true,
                        title: ""
                    },
                    min: 0
                }
            }
        }
    });


    onInputChange();
});

function onInputChange() {
    let startDateString = startDateInput.value;
    let endDateString = endDateInput.value;
    let typeString = typeSelect.value;
    let typeStringGerman = typeSelect.options[typeSelect.selectedIndex].innerText;

    let new_url = new URL(location.protocol + "//" + location.host + "/weight-watch/statistics/get-data");
    new_url.searchParams.append("start_date", startDateString);
    new_url.searchParams.append("end_date", endDateString);
    new_url.searchParams.append("type", typeString);

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
        console.log(data)
        let userMacros = data["user_macros"]
        let dishAmounts = data["dish_amounts"];

        if (typeString == "fat" || typeString == "proteins") {
            statisticChart.data.datasets[1].borderColor = "rgb(99, 255, 132)"
            statisticChart.data.datasets[1].backgroundColor = "rgba(99, 255, 132, 0.5)"
            statisticChart.data.datasets[1].label = "Ziel";
        } else {
            statisticChart.data.datasets[1].borderColor = "rgb(255, 99, 132)"
            statisticChart.data.datasets[1].backgroundColor = "rgba(255, 99, 132, 0.5)"
            statisticChart.data.datasets[1].label = "Grenze";
        }

        statisticChart.options.scales.y.title = {
            display: true,
            text: typeStringGerman
        }

        let newLabels = [];
        let newUserMacroData = [];
        let newDishAmountData = []

        let userMacroIndex = 0;
        let lastUserMacroValue = "";
        console.log(data);
        for (let i = 0; i < dishAmounts.length; i++) {
            let date = dishAmounts[i]["date"];
            newLabels.push(date);
            newDishAmountData.push(dishAmounts[i]["dish_amount"][typeString])

            if (userMacroIndex < userMacros.length && userMacros[userMacroIndex]["date"] == date) {
                newUserMacroData.push(userMacros[userMacroIndex][typeString])
                lastUserMacroValue = userMacros[userMacroIndex][typeString];
                userMacroIndex++;
            } else {
                newUserMacroData.push(lastUserMacroValue);
            }

        }

        statisticChart.data.labels = newLabels;

        statisticChart.data.datasets[1].data = newUserMacroData;
        statisticChart.data.datasets[0].data = newDishAmountData;

        statisticChart.update();
    }).catch((error) => console.log(error));

}