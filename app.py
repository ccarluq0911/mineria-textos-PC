from flask import Flask, render_template, request
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
import pickle
import pandas as pd
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from langdetect import detect
from deep_translator import GoogleTranslator

app = Flask(__name__)
# nltk.download('stopwords')
# nltk.download('punkt ')

def translate_to_spanish(text):
    idioma = detect(text)
   
    if idioma == 'es':
        return text
    else:
        traduccion = GoogleTranslator(source='auto', target='es').translate(text)
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

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/check_genre', methods=['POST'])
def check_index():
  text = request.data.decode("utf-8") # se obtiene el texto por el body
  text = clean_text(text)
  # metemos el text en una lista para el vectorizador
  text_vect = []
  text_vect.append(text)
  text = vectorizer.transform(text_vect)
  prediction = model.predict(text)
  return {'prediction': bool(prediction[0])}

if __name__ == '__main__':
  app.run(
    host='localhost',
    port=5002,
    debug=True
  )
