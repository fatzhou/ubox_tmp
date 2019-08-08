#!/bin/sh


./slideEnv.sh prod && cp ubbey.keystore release-signing.properties platforms/android/ && sudo ionic cordova build android --prod --release && scp ./platforms/android/build/outputs/apk/android-release.apk work@139.199.180.239:~/test/ubox/ubbey.v2.0.0.apk
