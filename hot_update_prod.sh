#!/bin/sh

./slideEnv.sh prod && rm -rf ./www && npm run build --prod && scp -r www/*  work@139.199.180.239:~/test/ubbeybox
