const express = require('express');
const session = require('express-session');
const path = require('path');
const { readMessages , writeUserDataToKafka} = require('./controllers.js');
const { Logins, UsuariosBloqueados } = require('./kafka.js');
const { request } = require('http');
const bodyParser = require('body-parser');
const { constants } = require('buffer');
const { urlencoded } = require('express');



const app = express()
const port = 3001
var usernamex = 0

//middlewares
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'static')));


readMessages()


//Servicio de Seguridad

app.get('/bloqueados', async (req, res) => {
  res.json(UsuariosBloqueados())
})

app.get('/datos', async (req, res) => {
  Logins()
})

app.get('/read', async (req, res) => {
    const datos = readMessages()
    const datos2 = JSON.parse(datos)
    console.log(datos2.rows);
    res.send(datos.rows)
  })


app.listen(port, () => {
    console.log(`Escuchando la app en http://localhost:${port}`)
  })