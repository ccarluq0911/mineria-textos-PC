let mediaRecorder;
let audioChunks = [];

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


// Función para iniciar la grabación
async function startRecording() {
    const recButton = document.getElementById("boton-grabar");
    const stopButton = document.getElementById("boton-stop");
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
    const recButton = document.getElementById("boton-grabar");
    const stopButton = document.getElementById("boton-stop");
    const infoAudio = document.getElementById("info-audio");
    let texto = document.getElementById("text").value

    if (mediaRecorder) {
        recButton.disabled = false;
        stopButton.disabled = true;

        mediaRecorder.stop();
        console.log("Grabación detenida.");

        // Crear un Blob a partir de los datos de la grabación
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });

        // Crear un FormData para enviar el archivo
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.mp3");  // Agregar el Blob como archivo con un nombre

        try {
            // Enviar el archivo al endpoint /check_genre
            const data = await fetch("http://localhost:5002/upload-audio", {
                method: "POST",
                body: formData,
            });

            if (data.ok) {
                infoAudio.textContent = "Audio recibido exitosamente";
                infoAudio.style.color = "green";
        
                texto = await data.text()
            } else {
                infoAudio.textContent = "El audio no ha podido ser procesado";
                infoAudio.style.color = "darkred";
            }
        } catch (error) {
            console.error("Error al enviar el archivo:", error);
            alert("Error al procesar la grabación.");
        }
    } else {
        console.log("No hay grabación en curso.");
    }
}

const onChangeFile = ()=>{
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
    let texto = document.getElementById("text").value
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