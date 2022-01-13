const express = require("express");
const redis = require("redis");
const { createHash } = require('crypto');
const colors = require("colors");
const { exit } = require("process");
const fetch = require("superagent");
const cheerio = require('cheerio');
const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];
const iChars = "!`@#$%^&*()+=-[]\\\';./{}|\":<>?~_1234567890";   

const app = express();

// Connecting to redis
const client = redis.createClient({
  host: "127.0.0.1",
  port: 6379,
});

let command = process.argv[2];

if (command != "mdplinks") {
  console.log(colors.red("ERROR: El comando es mdplinks"));
  exit(1); // Salida por error
} else {
  let link_or_tag = process.argv[3];
  if (link_or_tag != "--tags") {
    let data = addLink().then((res) => {
      data = res;
      client.set(hash(data.link), JSON.stringify(data)); // se tiene que convertir a cadena para enviarlo a la BD de Redis
      console.log(colors.blue("Los datos fueron añadidos correctamente!"));
      exit(0); // Salida exitosa
    });
  } else {
    let links = viewLinks();
  }
}

app.listen(3000);


/*
FUNCIONES
*/

async function getTitlePromise(url) {
  return await fetch.get(url).then(res => {
    let $ = cheerio.load(res.text);
    let title = $("title").text();
    return title;
  })
}

async function getTitle(url) {
  let title = await getTitlePromise(url);
  return title;
}


function printOutput(links) {
  links.forEach(async (element) => {
    let value = await getValue(element);
    value = JSON.parse(value);
    print(value);
  });
}
function print(value) {
  let date = new Date(value.time);
  let day = days[date.getDay()];
  let month = months[date.getMonth()];
  let year = date.getFullYear();
  let formatDate = `${day} ${date.getDate()} de ${month} de ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  console.log(colors.yellow(
  `*  ${value.title}
   URL: ${value.link}
   Etiquetas: ${Object.values(value.tags).join(', ')}
   Fecha y hora de creación: ${formatDate}`)
  );
}

async function addLink() {
  let link = process.argv[3];
  let tags = process.argv[5];
  tags = tags.split(',');
  let validator = specialCharacter(tags);
  tags = { ... tags };
  let title = await getTitle(link) || process.argv[7];
  let date = new Date();
  date = date.toISOString();
  let data = {
      link : link,
      tags: tags,
      title: title || 'Sin título', // El título es opcional
      time: date
  }
  return data;
}

async function viewLinks() {
  // Además, podríamos usar las etiquetas como llaves, en lugar de usar los links como llaves
  let links = await getLinks();
  printOutput(links);
  return links;
}

async function getLinks() {
  let links = await getLinksPromise();
  return links;
} 

function getLinksPromise() {
  return new Promise(async (resolve, reject) => {
      let keys_array = await getKeys();
      let links = await getArrayLinks(keys_array);
      resolve(links);
  });
}

function getArrayLinks(keys_array) {
  return new Promise((resolve, reject) => {
    let etiqueta = process.argv[4];
    let links = [];
    keys_array.forEach( async (element) => {
      let value = await getValue(element);
  
      let tagsPerValue = Object.values(JSON.parse(value).tags);
      
      if (tagsPerValue.indexOf(etiqueta) != -1) {
        links.push(element);
      }
    });
    setTimeout(function(){
      resolve(links);
    }, 100);
  });
}

function getKeysPromise() {
  return new Promise((resolve, reject) => {
      let reply = client.keys('*', (err, keys) => {
        resolve(keys);
      });
  });
}

async function getKeys() {
  let keys = await getKeysPromise();
  return keys;
}

function getValuePromise(element) {
  return new Promise((resolve, reject) => {
      reply = client.get(element, (err, value) => {
        resolve(value);
      });
  })
}

async function getValue(element) {
  let value = await getValuePromise(element);
  return value;
}

function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}

function specialCharacter(data) {
  data.forEach(element => {
    for (let i = 0; i < element.length; i++) {      
      if (iChars.indexOf(element[i]) != -1) {    
        console.log(colors.red("ERROR! Las etiquetas solo pueden ser alfabéticas."));
        exit(1); // Salida por error
      } 
    }
  });
}
