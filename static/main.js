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

let mediaRecorder;
let audioChunks = [];

// Función para iniciar la grabación
async function startRecording() {
    const recButton = document.getElementById("button-rec");
    const stopButton = document.getElementById("button-stop");
    try 
    {
        // Solicitar acceso al micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Crear un MediaRecorder para manejar la grabación
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.controls = true;
            document.body.appendChild(audio); // Añadir el reproductor de audio al cuerpo de la página
        };

        recButton.disabled = true;
        stopButton.disabled = false;

        // Iniciar la grabación
        mediaRecorder.start();
        console.log("Grabación iniciada...");
    } 
    catch (error)
    {
        console.error("No se pudo acceder al micrófono:", error);
        alert("Error al acceder al micrófono. Asegúrate de que el navegador tiene permisos para usarlo.");
    }
}

async function stopRecording() {
    const recButton = document.getElementById("button-rec");
    const stopButton = document.getElementById("button-stop");
    const texto = document.getElementById("text").value

    if (mediaRecorder)
    {

        recButton.disabled = false;
        stopButton.disabled = true;

        mediaRecorder.stop();
        console.log("Grabación detenida.");

        // Crear un Blob a partir de los datos de la grabación
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

        // Crear un FormData para enviar el archivo
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.webm");  // Agregar el Blob como archivo con un nombre

        try 
        {
            // Enviar el archivo al endpoint /check_genre
            const data = await fetch("http://localhost:5002/upload-audio", {
                method: "POST",
                body: formData,
            });

            if(data.ok)
            {
                infoAudio.textContent = "Audio recibido exitosamente";
                infoAudio.style.color = "green";
        
                texto = await data.text()
            }
            else
            {
                infoAudio.textContent = "El audio no ha podido ser procesado";
                infoAudio.style.color = "darkred";
            }
        } 
        catch (error) 
        {
            console.error("Error al enviar el archivo:", error);
            alert("Error al procesar la grabación.");
        }
    } 
    else 
    {
        console.log("No hay grabación en curso.");
    }
}

const onChangeFile = ()=>{
    console.log("Algo")
    const fichero = document.getElementById("file");
    const botonF = document.getElementById("subir-f");
    
    if(fichero.files.length > 0)
    {
        botonF.disabled = false
    }
    else
    {
        botonF.disabled = true
    }
}

const subirAudio = async()=>{
    const audio = document.getElementById("file").input.files[0];
    const infoAudio = document.getElementById("info-audio");
    const texto = document.getElementById("text").value
    const url = "http:localhost:5002/upload-audio";
    const formData = FormData()
    formData.append(audio)

    const data = await fetch(url,{
        method:"POST",
        body:formData
    })

    if(data.ok)
    {
        infoAudio.textContent = "Audio recibido exitosamente";
        infoAudio.style.color = "green";

        texto = await data.text()
    }
    else
    {
        infoAudio.textContent = "El audio no ha podido ser procesado";
        infoAudio.style.color = "darkred";
    }

}

const onChangeTrad = async()=>{
    const texto = document.getElementById("text").value
    const botonTrad = document.getElementById("boton-trad");
    const infoTrad = document.getElementById("info-trad");

    botonTrad.disabled = texto.trim()=="";

    infoTrad.style.color = "darkred";

    infoTrad.textContent = texto.trim()=="" ? "Hay que colocar texto para traducir" : "";
}

const traducir = async()=>{
    const texto = document.getElementById("text").value
    const infoTrad = document.getElementById("info-trad");

    const url = "http://localhost:5002/traduce";
    let body = {
        "text":texto
    }

    const data = await fetch(url,{
        method:"POST",
        body:JSON.stringify(body)
    })

    if(data.ok)
    {
        texto.value = await data.text()
        infoTrad.textContent = "Texto traducido con éxito";
        infoTrad.style.color = "green";
    }
    {
        infoTrad.textContent = "Error al traducir el texto";
        infoTrad.style.color = "darkred";
    }

}

