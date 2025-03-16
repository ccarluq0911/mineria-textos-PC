from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
import pickle
from pydub import AudioSegment
import os
import speech_recognition as sr
import pandas as pd
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5002"}})
# nltk.download('stopwords')
# nltk.download('punkt ')

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def transcribe_audio(file):
    """Transcribe un archivo de audio y devuelve el texto."""
    filename = os.path.join("uploads", file.filename)
    file.save(filename)

    # Convertir a WAV si es necesario
    if filename.endswith('.mp3'):
        audio = AudioSegment.from_mp3(filename)
        filename = filename.replace('.mp3', '.wav')
        audio.export(filename, format="wav")

    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(filename) as source:
            audio = recognizer.record(source)
            text = recognizer.recognize_google(audio, language="es-ES")
        
        return text
    except sr.UnknownValueError:
        return "No se pudo entender el audio"
    except sr.RequestError:
        return "Error con el servicio de reconocimiento"
    except Exception as e:
        return str(e)
    finally:
        os.remove(filename)  # Eliminar archivo después de la transcripción
        
def clean_text(text):
  stop_words = set(stopwords.words('spanish')) 
  stop_words.update(['.', ',', '!', '?', ';', ':', '-', '_', '(', ')', '[', ']', '{', '}', '"', "'", '...', '``', "''"])
  text = ' '.join([word for word in word_tokenize(text) if not word in stop_words])
  return text
  
def create_model_and_vectorizer():
  X = pd.read_csv('data/lyrics.csv')
  
  X['Lyrics'] = X['Lyrics'].apply(clean_text)
  y = X.loc[:,'Regueton']
  X = X.loc[:,'Lyrics']
  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
  
  vectorizer = CountVectorizer()
  vectorizer.fit(X_train.to_list())
  
  pickle.dump(vectorizer, open('vectorizer.pkl', 'wb'))
  
  # Document Term Vector (DTV)
  dtv = vectorizer.transform(X_train)

  model = MultinomialNB()
  model.fit(dtv.toarray(), y_train)
  pickle.dump(model, open('model.pkl', 'wb'))

# Comentamos para no reiniciar el modelo cada vez que se inicia el servidor  
# create_model_and_vectorizer()
model = pickle.load(open('model.pkl', 'rb'))
vectorizer = pickle.load(open('vectorizer.pkl', 'rb'))

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/check_genre', methods=['POST'])
def check_genre():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    text = transcribe_audio(file)
    
    text = clean_text(text)
    text_vect = [text]  # Se mete el texto en una lista para el vectorizador
    text = vectorizer.transform(text_vect)
    prediction = model.predict(text)
    
    return {'prediction': bool(prediction[0])}


@app.route('/feedback', methods=['POST'])
def feedback():
  validation = request.headers.get("validation",type=bool)
  texto = request.data.decode("utf-8") #se obtiene el texto por el body
  feedback = pd.DataFrame(data={"Lyrics":[texto],"Regueton":[validation]})
  feedback['Lyrics'] = feedback['Lyrics'].apply(clean_text)
  y = feedback.loc[:,'Regueton']
  X = feedback.loc[:,'Lyrics']
  X = vectorizer.transform(X)
  model.partial_fit(X.toarray(), y)
  pickle.dump(model, open('model.pkl', 'wb'))
  return jsonify({'status': 'ok'})

if __name__ == '__main__':
  app.run(
    host='localhost',
    port=5002,
    debug=True
  )
