#!/bin/sh
./slideEnv.sh dev && cp ubbey.keystore release-signing.properties platforms/android/ && ionic cordova build android --release --prod && scp ./platforms/android/build/outputs/apk/android-release.apk work@139.199.180.239:~/test/ubox/ubbey-v2.0.0-test.apk
#./slideEnv.sh prod && cp ubbey.keystore release-signing.properties platforms/android/ && ionic cordova build android --release --prod && scp ./platforms/android/build/outputs/apk/android-release.apk work@139.199.180.239:~/test/ubox/ubbey.v2.0.0.apk
# ./slideEnv.sh dev && cp ubbey.keystore release-signing.properties platforms/android/ && ionic cordova build android --release --prod && scp ./platforms/android/build/outputs/apk/android-release.apk work@139.199.180.239:~/test/ubox/ubbey-v2.0.0.1-test.apk
