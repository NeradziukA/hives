#!/usr/bin/env bash
set -e
npm install --include=dev --prefix ./client
npm run build --prefix ./client
mkdir -p ./server/static
cp -r ./client/dist/* ./server/static/
npm install --include=dev --prefix ./server
