.PHONY: test

all:

test:
	node_modules/.bin/qunit-cli -c stapes.js test/test.js

test-browserstack: test
	# This will not work unless you have BROWSERSTACK_USERNAME
	# and BROWSERSTACK_KEY set in your envvars
	browserstack-runner