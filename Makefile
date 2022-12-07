tests: 
	./node_modules/.bin/buster-test

init:
	npm install --dev

min:
	sed '/require\.js/d' public/index.html > build/public/index.html
	cd build;../node_modules/.bin/r.js -o build.js;
	echo "(function(){" > build/min/main.js
	cat lib/almond.min.js build/min/src/main.js >> build/min/main.js
	echo ";require('main');})()" >> build/min/main.js

sync:
	rsync -vrt --copy-links --exclude release.sh build/min/* x.29a.ch:/var/www/29a.ch/sandbox/2012/voxelworld/

release: min sync
