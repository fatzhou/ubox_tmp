#!/bin/sh

devhotpath="https:\/\/www.yqtc.co\/iamtest\/ubox"
prodpath="https:\/\/m.yqtc.co\/ubox"


#获取命令行参数
if [[ $1 = "prod" ]]
then
	echo "切换到正式环境"
	echo "-------替换config.xml--------"
	sed -i "" "s/$devhotpath/$prodpath/g" config.xml	
	echo "-------替换cordova-hcp.json----------"
	sed -i "" "s/$devhotpath/$prodpath/g" cordova-hcp.json	
	echo "-------替换Global.ts----------"
	sed -i "" "s/ENV = \"dev\"/ENV = \"prod\"/g" src/providers/GlobalService.ts
	echo "----------替换Login.html--------------"
	sed -i "" "s/({{global.L(\"InnerTestVersion\")}})//g" src/pages/login/login.html
else
	echo "切换到测试环境"
	echo "-------替换config.xml--------"
	sed -i "" "s/$prodpath/$devhotpath/g" config.xml
	echo "-------替换cordova-hcp.json----------"
	sed -i "" "s/$prodpath/$devhotpath/g" cordova-hcp.json	
	echo "-------替换Global.ts----------"
	sed -i "" "s/ENV = \"prod\"/ENV = \"dev\"/g" src/providers/GlobalService.ts
	echo "----------替换Login.html--------------"
	sed -i "" "s/({{global.L(\"InnerTestVersion\")}})//g" src/pages/login/login.html
	sed -i "" "s/{{global.L(\"Login\")}}/{{global.L(\"Login\")}}({{global.L(\"InnerTestVersion\")}})/g" src/pages/login/login.html	

fi

if [[ $1 = "prod-no-md5" ]]
then
    sed -i "" "s/Md5.hashStr(\$scope.password).toString()/(((\$scope.password)))/g"   src/providers/Util.ts
    sed -i "" "s/Md5.hashStr(password).toString()/password/g"                   src/providers/Util.ts
else
    sed -i "" "s/(((\$scope.password)))/Md5.hashStr(\$scope.password).toString()/g"   src/providers/Util.ts
    sed -i "" "s/(((password)))/Md5.hashStr(password).toString()/g"                   src/providers/Util.ts
fi
