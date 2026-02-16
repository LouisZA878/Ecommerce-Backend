### Hey there!

## Instructions ( docker compose )

1. Copy the contents of the docker-compose.yaml.clean file into docker-compose.yaml

- cp ./docker-compose.yaml.clean ./docker-compose.yaml

2. Open the docker-compose.yaml file and provide the following inputs:
   1. MONGO_INITDB_ROOT_USERNAME - MongoDB admin username
   2. MONGO_INITDB_ROOT_PASSWORD - MongoDB admin password
   3. MONGO_USER - The respective MongoDB admin username
   4. MONGO_USER_PASSWORD - The respesctive MongoDB admin password
   5. ACCESS_TOKEN_SIGNATURE - A random string of characters - will be copied between all instances
   6. REFRESH_TOKEN_SIGNATURE - A radnoms tring of characters - different from ACCESS_TOKEN_SIGNATURE
   7.

3. Within your terminal, run the stack

- bash ./run_stack.sh
