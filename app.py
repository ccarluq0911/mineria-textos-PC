from flask import Flask, render_template, request, jsonify
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
import pickle
import pandas as pd
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from langdetect import detect
from deep_translator import GoogleTranslator
import os
import speech_recognition as sr
from pydub import AudioSegment
import tempfile
import subprocess

app = Flask(__name__)
# nltk.download('stopwords')
# nltk.download('punkt ')

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def transcribe_audio(file):
    """Transcribe un archivo de audio y devuelve el texto."""
    suffix = ".webm"
    if file.name.endswith('.mp3'):
        suffix = ".mp3"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_input:
        file.save(temp_input.name)

    temp_output = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    temp_output.close()

    # Convertir a .wav usando ffmpeg en un proceso separado
    result = subprocess.run([
        "ffmpeg", "-y",  # sobrescribir si existe
        "-i", temp_input.name,
        "-ar", "16000",  # sample rate recomendado para STT
        "-ac", "1",      # mono
        temp_output.name
    ], capture_output=True, text=True)

    if result.returncode != 0:
        print("FFmpeg error:", result.stderr)
        return f"El proceso de conversión ha fallado con el error: {result.stderr}"
    else:   
      recognizer = sr.Recognizer()

      try:
        
        with sr.AudioFile(temp_output.name) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language="es-ES")
        return text
      except sr.RequestError as e:
          return f"Error con el servicio de reconocimiento: {e}"
      except Exception as e:
          return f"Error general: {e}"
      finally:
        os.remove(temp_input.name)
        os.remove(temp_output.name)
       

def translate_to_spanish(text):
    idioma = detect(text)
    print(idioma)
    if idioma == 'es':
        return text
    else:
        traduccion = GoogleTranslator(source='auto', target='es').translate(text)
        print(traduccion)
        return traduccion
      
def clean_text(text):
  text = translate_to_spanish(text)
  text = text.lower()
  text = text.replace('\n', ' ')
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

def make_prediction(text):
  text = clean_text(text)
  # Metemos el text en una lista para el vectorizador
  text_vect = []
  text_vect.append(text)
  text = vectorizer.transform(text_vect)
  prediction = model.predict(text)
  return bool(prediction[0])

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/check_genre', methods=['POST'])
def check_index():
  text = request.data.decode("utf-8") # se obtiene el texto por el body
  return {'prediction': make_prediction(text)}
  
@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    text = transcribe_audio(file)
    return {'text': text}

if __name__ == '__main__':
  app.run(
    host='localhost',
    port=5002,
    debug=True
  )
