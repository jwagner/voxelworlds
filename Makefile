tests: 
	./node_modules/.bin/buster-test

init:
	npm install --dev

min:
	cd build;../node_modules/.bin/r.js -o build.js;
	echo "(function(){" > build/min/main.js
	cat lib/almond.min.js build/min/src/main.js >> build/min/main.js
	echo ";require('main');})()" >> build/min/main.js
