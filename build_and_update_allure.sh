#/bin/bash -e
./gradlew distZip
source "$HOME/.dku-tests-scripts-conf.sh"
rm -rf $DKU_TESTS_DEPS/allure-2.13.2/plugins/allure-plugin*

cp build/distributions/allure-plugin-clubhouse-0.1.zip $DKU_TESTS_DEPS/allure-2.13.2/plugins/
(cd $DKU_TESTS_DEPS/allure-2.13.2/plugins/ && unzip  allure-plugin-clubhouse-0.1.zip)

mkdir -p ./tmp/allure-html/
$DKU_TESTS_DEPS/allure generate ./dev/allure-res --clean --report-dir  ./tmp/allure-html
cp ./tmp/widgets.json tmp/allure-html/widgets/mywidget.json
mkdir -p tmp/allure-html/widgets/allure-plugin-clubhouse/
#cp ./tmp/widgets.json tmp/allure-html/widgets/allure-plugin-clubhouse/
#cp ./tmp/widgets.json tmp/allure-html/widgets/widgets.json

$DKU_TESTS_DEPS/allure open -p 14600 ./tmp/allure-html
## TODO configure the plugin.yml