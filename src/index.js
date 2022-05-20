const express = require('express');
const session = require('express-session');
const path = require('path');
const { writeUserDataToKafka, readMessages } = require('./controllers/controllers.js');
const { request } = require('http');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const { constants } = require('buffer');
const { urlencoded } = require('express');



//coneccion a la base de datos
const pool = new Pool({
    user: 'postgres',
    host: '172.27.0.2',
    password: 'kiwix',
    database: 'personas',
    port: '5432'
});


const app = express()
const port = 3000

//middlewares
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'static')));

var estado=false
var estado2=false


app.get('/db', async (req, res) => {
	const datos = await pool.query('SELECT * FROM usuarios');
    console.log(datos.rows);
    res.send(datos.rows)
  })

app.get('/send', async (req, res) => {
    await writeUserDataToKafka({ nombre: 'JoseCornejo' })
    res.send('Hola para enviar mensajes por kafka haga esto')
  })

app.post('/login',async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  console.log('\nRegistrando con Usuario: ', username, ' y contraseña: ', password, '\n')
  if (username && password) {
	// Buscamos el usuario y contraseña en la base
	estado = await pool.query('SELECT bloqueado FROM Usuarios WHERE usuario=$1',[username])
	console.log('Esta persona tiene su estado:',estado.rows[0].bloqueado)
	estado2 = estado.rows[0].bloqueado
	if(estado2==true){
		//persona bloqueada
		console.log('Estas bloqueado, no puedes acceder a tu cuenta')

	}else{
		//Persona aun no bloqueada
		const datos = await pool.query('SELECT * FROM Usuarios WHERE usuario=$1 and contraseña=$2',[username,password])
		console.log(datos.rows)
		if (datos.rows.length > 0) {
			// Autenticamos al usuario
			console.log("\nAccediendo a su cuenta :", username )
			//Notificamos por Kafka el inicio de secion correcto
			const date = new Date();
			let hora = date.getHours()
			let min = date.getMinutes()
			let seg = date.getSeconds()
			await writeUserDataToKafka({ usuario: username, contraseña: password, fail: false , hora: hora, min: min, seg:seg})
		} else {
			console.log('Incorrect Username and/or Password!');
			//Notificamos por Kafka el inicio de secion incorrecto
			const date = new Date();
			let hora = date.getHours()
			let min = date.getMinutes()
			let seg = date.getSeconds()
			await writeUserDataToKafka({ usuario: username, contraseña: password, fail: true ,hora: hora, min: min, seg:seg})
		}
	}
	
} else {
	response.send('Please enter Username and Password!');
	response.end();
}
})


app.get('/login', async (req, res) => {
	const username = "Panchosky";
	const password = "hola123";
	console.log('\nRegistrando con Usuario: ', username, ' y contraseña: ', password, '\n')
	if (username && password) {
		// Buscamos el usuario y contraseña en la base
		estado = await pool.query('SELECT bloqueado FROM Usuarios WHERE usuario=$1',[username])
		console.log('Esta persona tiene su estado:',estado.rows[0].bloqueado)
		estado2 = estado.rows[0].bloqueado
		if(estado2==true){
			//persona bloqueada
			console.log('Estas bloqueado, no puedes acceder a tu cuenta')
	
		}else{
			//Persona aun no bloqueada
			const datos = await pool.query('SELECT * FROM Usuarios WHERE usuario=$1 and contraseña=$2',[username,password])
			console.log(datos.rows)
			if (datos.rows.length > 0) {
				// Autenticamos al usuario
				console.log("\nAccediendo a su cuenta :", username )
				//Notificamos por Kafka el inicio de secion correcto
				const date = new Date();
				let hora = date.getHours()
				let min = date.getMinutes()
				let seg = date.getSeconds()
				await writeUserDataToKafka({ usuario: username, contraseña: password, fail: false , hora: hora, min: min, seg:seg})
			} else {
				console.log('Incorrect Username and/or Password!');
				//Notificamos por Kafka el inicio de secion incorrecto
				const date = new Date();
				let hora = date.getHours()
				let min = date.getMinutes()
				let seg = date.getSeconds()
				await writeUserDataToKafka({ usuario: username, contraseña: password, fail: true ,hora: hora, min: min, seg:seg})
			}
		}
		
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
  })

const date = new Date();
let hora = date.getHours()
let min = date.getMinutes()
let seg = date.getSeconds()
console.log(hora,":", min,":" , seg)



app.listen(port, () => {
    console.log(`Escuchando la app en http://localhost:${port}`)
  })