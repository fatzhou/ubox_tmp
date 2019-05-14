#!/bin/sh

#password: Md5.hashStr($scope.password).toString() util.ts
#password: Md5.hashStr(password).toString()
./slideEnv.sh prod && rm -rf ./www && npm run build --prod && scp -r www/*  work@139.199.180.239:~/test/ubbeybox
