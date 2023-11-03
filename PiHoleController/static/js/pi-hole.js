const csrfMiddlewareToken = document.querySelector('[name=csrfmiddlewaretoken]');

function changePiHole(image){
    let active = !image.classList.contains("on");


    let activeGerman = image.classList.className = active ? "eingeschaltet" : "ausgeschaltet";
    if(confirm(`Bist du dir sicher, dass du den Status auf ${activeGerman} ändern willst?`)){
        if(active){
            image.classList.remove("off");
            image.classList.add("on");
        }else{
            image.classList.remove("on");
            image.classList.add("off");
        }
        fetch("/pi-hole-manager/update", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfMiddlewareToken.value
        },
        body: JSON.stringify({
            active: active
        })
    }).then((response) => {
        if (response.ok) {

        }else{
            throw new Error("Request failed.");
        }

    }).catch((error) => console.log(error));
    }

}