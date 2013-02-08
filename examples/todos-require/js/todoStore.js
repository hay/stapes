'use strict';
define(['stapes'], function(Stapes) {
	return Stapes.subclass({
		'constructor' : function() {
			if (!'localStorage' in window) {
				alert("Saving is not supported in your browser :(")
			}
		},

		'load': function() {
			var result = window.localStorage['todos-stapes'];

			return result ? JSON.parse(result) : {};
		},

		'save': function(data) {
			window.localStorage['todos-stapes'] = JSON.stringify( data );
		}
	});
});