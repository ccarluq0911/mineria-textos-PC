const comprobar = async ()=>{
    const texto = document.getElementById("text").value
    let url = "http://localhost:5002/check_genre"
    const response = await fetch(url,{
        method:"POST",
        body:JSON.stringify(texto)
    })
    
    if(response.ok)
    {
        const data = await response.json();
        const prediction = data.prediction;

        if (prediction == true)
        {
            document.getElementById("info-resultado").textContent = "Su canción es de reguetón"
            document.getElementById("info-resultado").style.color = "green"
            document.getElementById("info-resultado").style.fontWeight = "bolder"
        }
        else
        {
            document.getElementById("info-resultado").textContent = "Su canción no es de reguetón"
            document.getElementById("info-resultado").style.color = "red"
            document.getElementById("info-resultado").style.fontWeight = "bolder"
        }
    }
    else
    {
        document.getElementById("info-resultado").textContent = "No se ha podido procesar la solicitud"
        document.getElementById("info-resultado").style.color = "darkred"
        document.getElementById("info-resultado").style.fontWeight = "bolder"
    }
}

const feedback = async(validation)=>{

    const headers = {
        "Content-Type":"application/json",
        "validation":validation
    }
    let url = "http://localhost:5002/feedback"
    const texto = document.getElementById("text").value

    const response = await fetch(url,{
        method:"POST",
        body:JSON.stringify(texto),
        headers:headers
    })

    if(response.ok)
    {
        const tipo_feed = document.createElement("b")
        tipo_feed.setAttribute("id","color-feed")
        if(validation)
        {
            const info_feedback = document.getElementById("info-feedback")
            info_feedback.textContent = "Se ha registrado la letra como "
            tipo_feed.textContent = "reggaetón"
            info_feedback.appendChild(tipo_feed)
            document.getElementById("color-feed").style.color = "forestgreen"
        }
        else
        {
            const info_feedback = document.getElementById("info-feedback")
            info_feedback.textContent = "Se ha registrado la letra como "
            tipo_feed.textContent = "no reggaetón"
            info_feedback.appendChild(tipo_feed)
            document.getElementById("color-feed").style.color = "darkred"
        }
    }
    else
    {
        document.getElementById("info-feedback").textContent = "No se ha podido procesar la solicitud"
        document.getElementById("info-feedback").style.color = "darkred"
        document.getElementById("info-feedback").style.fontWeight = "bolder"
    }
}