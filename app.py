from flask import Flask, render_template, request, jsonify
from sklearn.naive_bayes import MultinomialNB
import json
import pickle
import pandas as pd
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import CountVectorizer

app = Flask(__name__)

def tokenize_text(text):
  return word_tokenize(text)

def create_model():
  X = pd.read_csv('data/lyrics.csv')
  y = X['Regueton']
  X = X['Lyrics'].apply(tokenize_text)
  
  for i in range(len(X)):
    X[i] = ' '.join(X[i])
  
  vectorizer = CountVectorizer()
  X = vectorizer.fit_transform(X)

  model = MultinomialNB()
  model.fit(X, y)
  pickle.dump(model, open('model.pkl', 'wb'))
  pickle.dump(vectorizer, open('vectorizer.pkl', 'wb'))

create_model()
model = pickle.load(open('model.pkl', 'rb'))
vectorizer = pickle.load(open('vectorizer.pkl', 'rb'))

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/check_genre', methods=['POST'])
def check_index():
  text = request.form['text']
  text = tokenize_text(text)
  text = vectorizer.transform(text)
  prediction = model.predict(text)
  return render_template('index.html', prediction=bool(prediction[0]))

if __name__ == '__main__':
  app.run(
    host='localhost',
    port=5002,
    debug=True
  )
