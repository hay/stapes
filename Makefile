.PHONY: test

all:

test:
	node_modules/.bin/qunit-cli -c stapes.js test/test.js

