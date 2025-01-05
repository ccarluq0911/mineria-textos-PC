import nltk
import pandas as pd
from nltk.tokenize import word_tokenize

df = pd.read_csv('data.csv')
df = df['Lyrics']
df.to_csv('lyrics.csv', index=False)

nltk.download('punkt_tab')

text = word_tokenize('¿Hola que tal estás?')
print(text)