#!/bin/sh

./slideEnv.sh dev && cp ubbey.keystore release-signing.properties platforms/android/ && sudo ionic cordova build android --release --prod && scp ./platforms/android/build/outputs/apk/android-release.apk work@139.199.180.239:~/test/ubox/ubbey-v1.3.0-test.apk
