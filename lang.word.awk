/['"]['"]/{
    next
}
/['"][^'"].*['"]/{
    len=0;
    if(match($0,/(['"][^'"].*['"]).*(['"][^'"].*['"]).*(['"][^'"].*['"]).*/,v)){
        #print $0"--v1"v[1]"--v2"v[2]"--v3"v[3];
        len=3;
    }else if(match($0,/(['"][^'"].*['"]).*(['"][^'"].*['"]).*/,v)){
        #print $0"--v1"v[1]"--v2"v[2]
        len=2;
    }else if(match($0,/(['"][^'"].*['"]).*/,v)){
        #print $0"--v1"v[1]
        len=1;
    }else{
        print "ERRRRRRORRRRRRRRRRRRRRRRRRRRRRRRRERROR";
    }
    for (i=1; i<=len; ++i){
        if(isch(v[i])){
            print v[i];
        }else{
            #print "======="v[i]
        }
    }
}
function isch(str){
    for (ii=1; ii<=length(str); ++ii) {
        if (substr(str, ii, 1) >= "\177") {
            #print substr(str, ii, 1)
            return 1;
        }
    }
    return 0;
}
