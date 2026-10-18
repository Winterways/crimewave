#!/bin/sh
# Builds index.html (and dist/index.html) from game.html. See build.js.
cd "$(dirname "$0")" && node build.js
