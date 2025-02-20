const comprobar = async ()=>{
    const texto = document.getElementById("text").value
    if(texto.trim()=="")
    {
        document.getElementById("info-resultado").textContent = "Debe de colocar una letra antes de subirla a evaluar"
        document.getElementById("info-resultado").style.color = "darkred"
        document.getElementById("info-resultado").style.fontWeight = "bolder"
    }
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

    const comprobacion = document.getElementById("info-resultado").textContent
    const texto = document.getElementById("text").value
    if(comprobacion!="" && texto!="" && (comprobacion=="Su canción es de reguetón" || comprobacion=="Su canción no es de reguetón"))
    {
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
                info_feedback.style.color = "black"
                tipo_feed.textContent = "reggaetón"
                info_feedback.appendChild(tipo_feed)
                document.getElementById("color-feed").style.color = "forestgreen"
                let interval = setInterval(() => cortar(interval), 3000);
            }
            else
            {
                const info_feedback = document.getElementById("info-feedback")
                info_feedback.textContent = "Se ha registrado la letra como "
                info_feedback.style.color = "black"
                tipo_feed.textContent = "no reggaetón"
                info_feedback.appendChild(tipo_feed)
                document.getElementById("color-feed").style.color = "darkred"
                let interval = setInterval(() => cortar(interval), 3000);
            }
        }
        else
        {
            document.getElementById("info-feedback").textContent = "No se ha podido procesar la solicitud"
            document.getElementById("info-feedback").style.color = "darkred"
            document.getElementById("info-feedback").style.fontWeight = "bolder"
        }
    }
    else
    {
        document.getElementById("info-feedback").textContent = "Antes de validar la canción debes comprobar su género subiendo la letra"
        document.getElementById("info-feedback").style.color = "darkred"
        document.getElementById("info-feedback").style.fontWeight = "bolder"
    }

    
}

const cortar = (interval)=>{
    const tipo_feed = document.createElement("b")
    tipo_feed.setAttribute("id","color-feed")
    const info_feedback = document.getElementById("info-feedback")
    info_feedback.textContent = ""
    tipo_feed.textContent = ""
    info_feedback.appendChild(tipo_feed)
    document.getElementById("color-feed").style.color = "black"
    clearInterval(interval)
}