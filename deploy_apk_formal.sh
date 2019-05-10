#!/bin/sh


./slideEnv.sh prod && cp ubbey.keystore release-signing.properties platforms/android/ && sudo ionic cordova build android --prod --release && scp ./platforms/android/build/outputs/apk/release/android-release.apk work@211.159.189.190:~/public/download/ubbey.v2.0.0.apk
