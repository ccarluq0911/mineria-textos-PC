from flask import Flask, render_template, request, Response, jsonify
from threading import Thread
import json

app = Flask(__name__)

@app.route('/')
def index():
  return render_template('index.html')

if __name__ == '__main__':
  app.run(
    host='localhost',
    port=5002,
    debug=True
  )