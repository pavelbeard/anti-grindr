# scripts/run-integration.sh
#!/usr/bin/env bash

DIR="$(cd "$(dirname "$0")" && pwd)"
source $DIR/setenv.sh
docker compose -f integration.docker-compose.yaml up -d
echo '🟨 Waiting for database to be ready...'
"$DIR/wait-for-it.sh" "${DATABASE_URL}" -- echo '🟩 Database is ready'
npx prisma migrate dev --name init

if [ "$#" -eq "0" ]; 
  then
    vitest -c ./vitest.config.integration.ts
else
    vitest -c ./vitest.config.integration.ts --ui
fi    