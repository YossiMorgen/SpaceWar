#!/bin/sh
set -e

PORT=${PORT:-8080}
export PORT

envsubst 'PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'

