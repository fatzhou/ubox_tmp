#!/bin/sh

./slideEnv.sh dev  &&  rm -rf ./www && sudo npm run build --prod && cordova-hcp build && scp -r www/* work@139.199.180.239:~/test/ubbeybox_test
