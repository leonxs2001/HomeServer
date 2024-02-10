const startDateInput = document.querySelector("#start-date-input");
const endDateInput = document.querySelector("#end-date-input");
const typeSelect = document.querySelector("#type-select");
const weightLossDiv = document.querySelector("#weight-loss-div");
const kcalNeedInput = document.querySelector("#kcal-need-input");
const statisticCanvas = document.querySelector("#statistic-canvas");
const weightLossSpan = document.querySelector("#weight-loss-span");

let statisticChart = null;

window.addEventListener("load", () => {
    startDateInput.addEventListener("change", onInputChange);
    endDateInput.addEventListener("change", onInputChange);
    typeSelect.addEventListener("change", onInputChange);
    kcalNeedInput.addEventListener("change", onKcalNeedInputChange);
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

        if (typeString == "kcal") {
            weightLossDiv.style.display = "block"
        } else {
            weightLossDiv.style.display = "none";
        }

        statisticChart.update();

        onKcalNeedInputChange();
    }).catch((error) => console.log(error));

}

function onKcalNeedInputChange() {
    let kcalSum = 0;

    const newDishAmountData = statisticChart.data.datasets[0].data;
    newDishAmountData.forEach(newDishAmountDate => {
        if (newDishAmountDate != "") {
            kcalSum += parseFloat(newDishAmountDate);
        }
    });

    const averageKcal = kcalSum / newDishAmountData.length;

    const kcalDifference = parseFloat(kcalNeedInput.value) - averageKcal;

    const kcalLossPerDay = kcalDifference / 7000;

    const startDateString = startDateInput.value;
    const endDateString = endDateInput.value;

    const startTimestamp = new Date(startDateString).getTime();
    const endTimestamp = new Date(endDateString).getTime();

    // Number of milliseconds per day (1000 milliseconds * 60 seconds * 60 minutes * 24 hours)
    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const daysBetween = (endTimestamp - startTimestamp) / millisecondsPerDay;

    let resultString = `Du nimmst ca. ${(kcalLossPerDay).toFixed(2)}kg pro Tag, ${(kcalLossPerDay * 7).toFixed(2)}kg pro Woche, ${(kcalLossPerDay * 30.44).toFixed(2)}kg pro Monat, ${(kcalLossPerDay * 365.25).toFixed(2)}kg pro Jahr und ${(kcalLossPerDay * daysBetween).toFixed(2)}kg in der angegeben Zeit ab. Zumindest, wenn die durchschnittliche Abweichung so bleibt wie in dem angegeben Zeitraum.`;

    weightLossSpan.textContent = resultString;
}