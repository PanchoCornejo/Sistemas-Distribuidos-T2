const { Kafka } = require('kafkajs')

const groupId = 'test-group'

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
    })

const producer = kafka.producer()
const consumer = kafka.consumer({ groupId })
const bloqueados = []
var contador = 0
var valorkafka = 0
var valorJS = 0

const sendMessageToTopic = async ({topic, datos }) => {
    console.log('\nDatos transmitiendose a kafka 2:\n',datos)
    const valores = JSON.stringify(datos)
    console.log(valores) 
    try {
     await producer.connect()
     const responses = await producer.send({
       topic: topic,
       messages: [
           {value: valores}
        ],
     })
  
     //console.info('Operacion exitosa al escribir a Kafka ', responses)
     //await producer.disconnect()
    } catch (err) {
      console.error('Error al intentar escribir a Kafka', err)
    }
}


const readMessageFromTopic = async (topic, func) => {
  await consumer.connect()
  console.log("escuchando topic: ",topic)
  await consumer.subscribe({ topic , fromBeginning: true})
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log('\nAh llegado un individuo....\n')
      console.log({ value: message.value.toString() , })
      valorkafka = message.value.toString(),
      valorJS = JSON.parse(valorkafka)
      bloqueados[contador] = valorJS,
      contador = contador+1
      //Bloqueando cuenta
    },
  })
}

function buscarbloqueado(usuarioB){
  for(i=0; i<bloqueados.length; i++){
    if(usuarioB==bloqueados[i].usuario){
      //Denegar Acceso...
      return(true)
    }else{
      //Permitimos Acceso...
      return(false)
    }
  }
}

module.exports.readMessageFromTopic = readMessageFromTopic
module.exports.buscarbloqueado = buscarbloqueado
module.exports.sendMessageToTopic = sendMessageToTopic

