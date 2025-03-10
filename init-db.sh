#!/bin/bash
set -e

mongosh --host mongodb <<EOF
use admin
db.createUser({
  user: "${MONGO_INITDB_ROOT_USERNAME:-test}",
  pwd: "${MONGO_INITDB_ROOT_PASSWORD:-123456}",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})
EOF