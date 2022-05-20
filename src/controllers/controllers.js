const { sendMessageToTopic, readMessageFromTopic } = require('../kafka')

const topic = 'quickstart-events'
const topic2 = 'bloqueo'

const writeUserDataToKafka = async (datos) => {
  try {
    //console.log('\nDatos siendo enviados a kafka\n',datos)
    await sendMessageToTopic({ topic, datos })
  } catch (err) {
    console.error(err)
  }
}
const readMessages = () => {
  //console.log("\nLeyendo mensajes\n")
  readMessageFromTopic(topic2, (data) => {
    //console.log("\nDatos desde Kafka\n")
    console.log(data)
  })
  console.log("ya se leyo\n")
}

module.exports.readMessages = readMessages
module.exports.writeUserDataToKafka = writeUserDataToKafka