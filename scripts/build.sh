#!/usr/bin/env bash
set -e
npm run build --prefix ./client
mkdir -p ./server/static/client
cp -r ./client/dist/* ./server/static/client/
npm run build --prefix ./admin
