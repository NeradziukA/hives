#!/usr/bin/env bash
set -e
npm run build --prefix ./client
cp -r ./client/dist/* ./server/static/
