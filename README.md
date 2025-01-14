# mineria-textos-PC

Para iniciar el servidor desde local, se deben de tener las librerías necesarias descargadas. Para ello, se puede ejecutar el siguiente comando desde la carpeta del proyecto:

```
pip install -r requirements.txt
```

A continuación, para iniciar el servidor ejecutar:

```
python app.py
```

Tras esto, se abrirá el servidor en http://localhost:5002

Para hacer portable el proyecto y convertirlo en un .exe ejecutamos

```console
pyinstaller --onefile --add-data "templates;templates" --add-data "static;static" --add-data "model.pkl;." --add-data "vectorizer.pkl;." app.py
```

Se creareá una carpeta dist en el proyecto con un ejecutable dentro, ese ejecutable se ha de poner en la raíz del proyecto para que funcione, posteriormente borras la carpeta dist y la carpeta build