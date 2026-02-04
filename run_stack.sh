echo "[x] Starting up Kafka and Kafdrop"
docker compose up kafka kafdrop -d

echo "[X] Sleeping for 10 seconds to perpare Kafka"
sleep 10s

echo "[X] Installing npm packages for kafka.js"
echo "[X] Waiting 15s..."
cd kafka

npm i

sleep 15s

echo "[X] Creating Kafka topics..."
NODE_COMMAND="node kafka.js"
$NODE_COMMAND &
NODE_PID=$!

echo "[X] Sleeping for 10 seconds to let the script execute"
sleep 10s

echo "[X] Terminating kafka.js script..."
kill -INT "$NODE_PID"

wait "$NODE_PID"

echo "[X] kafka.js script terminated"

cd ..

docker compose up --build -d
