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

echo "[X] Starting service DB's"

docker compose up -d product_db cart_db auth_db

echo "[X] Sleeping 10s to give DB's time"
sleep 10s

echo "[X] Starting services"
docker compose up --build -d auth_service product_service cart_service
