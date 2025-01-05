import pandas as pd
import os

letras = pd.read_csv("./data/otherLirycs.csv")
c_letra = letras["letra"]
letras = pd.DataFrame()
letras["Lyrics"] = c_letra

lirycs = []
for i,value in enumerate(letras["Lyrics"].tolist()):
    if(i<1000):
        lirycs.append(value)

no_regueton = []


df_final = pd.DataFrame()
df_final["Lyrics"] = lirycs

for i in range(len(df_final)):
    no_regueton.append(False)

df_final["Regueton"] = no_regueton

df_final.to_csv("./data/rapLyrics.csv",index=False,sep=";")