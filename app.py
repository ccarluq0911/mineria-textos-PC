from flask import Flask, render_template, request, Response, jsonify
from sklearn.naive_bayes import MultinomialNB
import json
import pickle
import pandas as pd
from nltk.tokenize import word_tokenize
from collections import defaultdict
from sklearn.feature_extraction.text import CountVectorizer

model = pickle.load(open('model.pkl', 'rb'))
app = Flask(__name__)

def tokenize_text(text):
  return word_tokenize(text)

def create_model():
  X = pd.read_csv('data/lyrics.csv')
  X = X['Lyrics'].apply(tokenize_text)
  
  regueton = []
  for i in range(len(X)):
    X[i] = ' '.join(X[i])
    regueton.append(True)
  
  vectorizer = CountVectorizer()
  X = vectorizer.fit_transform(X)
  print(X.toarray())
  
  vocab = vectorizer.get_feature_names_out()
  print(vocab)
  
  X["Regueton"] = regueton

  model = MultinomialNB()
  model.fit(X["Lyrics"], X["Regueton"])
  pickle.dump(model, open('model.pkl', 'wb'))
  
create_model()

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/check_genre', methods=['POST'])
def check_index():
  text = request.json['text']
  text = word_tokenize(text)
  
'''
if __name__ == '__main__':
  app.run(
    host='localhost',
    port=5002,
    debug=True
  )
  '''