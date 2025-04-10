import { Kafka } from "kafkajs";

const loadBrokers = () => {
  return new Kafka({
    clientId: "my-app",
    brokers: ["kafka1:9092", "kafka2:9092"],
  });
};

const sendMessage = async ({ kafka, messages }: { kafka: Kafka; messages: string[] }) => {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic: "test-topic",
    messages: messages.map((message) => ({ value: message })),
  });
};
