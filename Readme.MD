## Hey there!

### Tech stack

- NodeJS
- Apache Kafka
- Docker

### Instructions ( docker compose )

1. Copy the contents of the docker-compose.yaml.clean file into docker-compose.yaml

- cp ./docker-compose.yaml.clean ./docker-compose.yaml

2. Open the docker-compose.yaml file and provide the following inputs:
   - MONGO_INITDB_ROOT_USERNAME - MongoDB admin username
   - MONGO_INITDB_ROOT_PASSWORD - MongoDB admin password
   - MONGO_USER - The respective MongoDB admin username
   - MONGO_USER_PASSWORD - The respesctive MongoDB admin password
   - ACCESS_TOKEN_SIGNATURE - A random string of characters - will be copied between all instances
   - REFRESH_TOKEN_SIGNATURE - A radnoms tring of characters - different from ACCESS_TOKEN_SIGNATURE

3. Within your terminal, run the stack

- bash ./run_stack.sh
