const { Kafka } = require('kafkajs')
const { Pool } = require('pg');
//coneccion a la base de datos
const pool = new Pool({
  user: 'postgres',
  host: '172.27.0.2',
  password: 'kiwix',
  database: 'personas',
  port: '5432'
});



const groupId = 'test-group'

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
})
const topico2 = 'bloqueo'
const mensajesKafka = []
const ListaBloqueados = []
var cambio=0
const topic2 = 'bloqueo'
var contador = 0
var valorkafka = 1
var valorJS = 1
var contadorB = 0
var quinto= 0
var ultimo= 0
var enviarB = 0
var contadorblock = 0
var ultimok=0
var personita = 0
const producer = kafka.producer()
const consumer = kafka.consumer({ groupId })

async function bloquear(userk){
  console.log("Comisaria")
  ultimok= mensajesKafka.length -1
  console.log(ultimok)
  console.log(mensajesKafka[ultimok].usuario)
  for (let i=0; i<mensajesKafka.length;i++,ultimok=ultimok-1){
    console.log("revisando caso",ultimok)
    if (mensajesKafka[ultimok].usuario == userk && mensajesKafka[ultimok].fail == true){
      if(contadorB==0){
        // ultimo inicio de secion errado
        ultimo = ultimok

      }
      contadorB++
      console.log('Veces Erradas: ',contadorB)
      if(contadorB==5){
        //5to intento anterior errado
        quinto=ultimok
        console.log('Quinto intento errado')
        //Revisamos que los inicios de secion sean en menos de 1 min
        if(mensajesKafka[ultimo].hora==mensajesKafka[quinto].hora){
          //es a la misma hora
          console.log('es la misma hora')
          if((mensajesKafka[ultimo].min - mensajesKafka[quinto].min)<2){
            //hay menos de 2 min de dif comparamos mas a detalle
            console.log('hay menos de 2 min de diferencia')
            if(mensajesKafka[ultimo].min==mensajesKafka[quinto].min){
              //se va bloqueado
              console.log("Bloqueado")
              enviarB = {
                usuario: mensajesKafka[quinto].usuario
              }
              ListaBloqueados[contadorblock] = enviarB
              contadorblock++
              personita= mensajesKafka[quinto].usuario
              await pool.query('UPDATE usuarios SET bloqueado = true WHERE usuario = $1', [personita])
              
            }else{
              //revisamos los segundos
              if(mensajesKafka[ultimo].seg > mensajesKafka[quinto].seg){
                //Se salvo por segundos
                console.log("se salvo x segundos de ser bloqueado")
              }else{
                //bloqueado x segundos
                console.log("Bloqueado")
                enviarB = {
                  usuario: mensajesKafka[quinto].usuario
                }
                ListaBloqueados[contadorblock] = enviarB
                contadorblock++
                personita = mensajesKafka[quinto].usuario
                await pool.query('UPDATE usuarios SET bloqueado = true WHERE usuario = $1', [personita])
                
              }
            }
          }else{
            console.log('hay mas de un min de diferencia..')
          }
        }

      }
    }else{
    }
  }
  contadorB=0
}

const readMessageFromTopic = async (topic, func) => {
    console.log("intentando leer\n")
    await consumer.connect()
    console.log("topic: ",topic)
    await consumer.subscribe({ topic , fromBeginning: true})
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({ value: message.value.toString() , })
        valorkafka = message.value.toString(),
        valorJS = JSON.parse(valorkafka)
        //console.log("\nvalores convertidos a JSON\n"),
        //console.log(valorJS),
        //console.log(valorJS.usuario),
        mensajesKafka[contador] = valorJS,
        contador = contador+1
        if(valorJS.fail== true){
          //hay fallo en el inicio de secion
          console.log("Sapeando")
          bloquear(valorJS.usuario)
        }
      },
    })
}



function Logins(){
  console.log('\nDatos Durante la Secion\n')
  for (let i=0; i<mensajesKafka.length;i++){
    console.log(mensajesKafka[i])
  }
}

function UsuariosBloqueados(){
  for(let u=0; u<ListaBloqueados.length;u++){
    console.log(ListaBloqueados[u])
  }
  return(ListaBloqueados)
}

module.exports.readMessageFromTopic = readMessageFromTopic
module.exports.Logins = Logins
module.exports.UsuariosBloqueados = UsuariosBloqueados
