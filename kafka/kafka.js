const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "kafka-service",
  brokers: ["localhost:9092"],
});

const admin = kafka.admin();

const run = async () => {
  await admin.connect();
  await admin.createTopics({
    topics: [
      { topic: "user-created" },
      { topic: "user-deleted" },
      { topic: "error-message" },
      { topic: "info-message" },
    ],
  });
  console.log("Topics created");
};

run();
