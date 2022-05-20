const { readMessageFromTopic } = require('./kafka')

const topic = 'quickstart-events'

const readMessages = () => {
    console.log("\nLeyendo mensajes\n")
    readMessageFromTopic(topic, (data) => {
      console.log("\nDatos desde Kafka\n")
      console.log(data)
    })
    console.log("ya se leyo\n")
}

  
module.exports.readMessages = readMessages