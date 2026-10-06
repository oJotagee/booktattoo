#!/bin/sh
set -e

cp /kong/kong.yml "$KONG_DECLARATIVE_CONFIG"

replace_host() {
  if [ -n "$2" ]; then
    if ! printf '%s' "$2" | grep -Eq '^[A-Za-z0-9.-]+$'; then
      echo "Host inválido para $1: '$2' (use só o domínio, ex: $1.railway.internal)" >&2
      exit 1
    fi
    sed -i "s#http://$1:#http://$2:#" "$KONG_DECLARATIVE_CONFIG"
  fi
}

replace_host user "$USER_HOST"
replace_host catalog "$CATALOG_HOST"
replace_host appointment "$APPOINTMENT_HOST"
replace_host payment "$PAYMENT_HOST"

exec /docker-entrypoint.sh "$@"
