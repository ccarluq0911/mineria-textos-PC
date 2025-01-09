import nltk
import pandas as pd
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords 

lyrics = pd.read_csv('data/lyrics.csv')
first_lyric = lyrics.iloc[0]['Lyrics']
print(type(first_lyric))