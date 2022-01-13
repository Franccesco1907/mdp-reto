# mdp-reto
Para este reto usé una base de datos clave valor llamada Redis.
En ese sentido, ejecuté redis en docker para activar la base de datos.

Una vez instalado docker y todas las dependencias, se podrá ejecutar los comandos que se encuentran a continuación.

EJEMPLOS DE COMANDOS:

Para enviar información:

- node src/index.js mdplinks "https://www.mdp.com.pe" --tags empresa,programacion,software --title "Página web de MDP"
- node src/index.js mdplinks "https://www.facebook.com/" --tags empresa,lider,entretenimiento --title "Facebook"
- node src/index.js mdplinks "https://twitter.com/" --tags empresa,noticias,entretenimiento --title "Twitter"
- node src/index.js mdplinks "https://www.youtube.com/watch?v=adMC9gFeITc" --tags empresa,videos,entretenimiento --title "Youtube"
- node src/index.js mdplinks "https://translate.google.com/" --tags empresa,traduccion,aprendizaje --title "Traductor"

Para recibir información

- node src/index.js mdplinks --tags empresa


/img/prueba.png
