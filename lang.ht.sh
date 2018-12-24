for f in `cat list.html.txt`;do 
    echo "////"$f////; 
    item=`cat $f | sh ./lang.sh | awk -F '|' '{for(i=1;i<=NF;i++){print $i}}'`;
    #item=`awk -f word.awk $f`
    
    newf="/tmp/"$f
    cp -rf $f $newf;
    for w in $item ;  do
        tw=$w
        if [ "$tw" = "" ]
        then
            continue;
        fi
        wname=`echo $tw | md5`
        wname="WORD"${wname:0:8}
        echo "static $wname = {cn:\""$tw"\",en:\"\",kr:\"\"};"
        #sed "s/[^console.log\(\"]$w[^(\"\)\}\})]/{{global.L(\"${wname}\")}}/g" $newf > $f.newnew; 
        awk "{
            if(!match(\$0, /console.log/, c) && match(\$0, /$w/)){
                gsub(/$w/, \"{{global.L('$wname')}}\", \$0);
                print \$0;
            }else
            {
                print \$0;
            }
        }" wn="$wname" $newf > $f.newnew;
        mv $f.newnew $newf; 
    done; 
done
