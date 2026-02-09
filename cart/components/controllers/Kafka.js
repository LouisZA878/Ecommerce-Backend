const { Kafka } = require("kafkajs");

const { KAFKA_BROKER_1, SERVICE_CLIENT_ID } = process.env;

const KafkaConnection = () => {
  const kafka = new Kafka({
    clientId: SERVICE_CLIENT_ID,
    brokers: [KAFKA_BROKER_1],
  });

  return kafka;
};

const KafkaProducer = async (topic, value) => {
  const kafkaConnection = KafkaConnection();
  const producer = kafkaConnection.producer({
    allowAutoTopicCreation: false,
    transactionTimeout: 30000,
  });

  await producer.connect();
  await producer.send({
    topic,
    messages: [
      {
        value: typeof value === "string" ? value : JSON.stringify(value),
      },
    ],
  });

  await producer.disconnect();
};

const KafkaConsumer = async (groupId, topic, customFunc) => {
  const kafkaConnection = KafkaConnection();
  const consumer = kafkaConnection.consumer({ groupId });

  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const jsonString = message.value.toString("utf8");
      const jsonObject = JSON.parse(jsonString);

      customFunc(jsonObject);
    },
  });
};

module.exports = { KafkaProducer, KafkaConsumer };
