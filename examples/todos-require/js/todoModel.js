'use strict';
define(['stapes'], function(Stapes) {
	return Stapes.subclass({
		'constructor' : function(todos) {
			this.set( todos );
		},

		'addTodo': function(title) {
			this.push({
				'completed' : false,
				'title' : title
			});
		},

		'clearCompleted': function() {
			this.remove(function(item) {
				return item.completed === true;
			});
		},

		// Returns items on the basis of the current state
		'getItemsByState' : function(state) {
			state = state || "all"; // default

			if (state === 'all') {
				return this.getAllAsArray();
			} else if (state === 'active') {
				return this.getLeft();
			} else if (state === 'completed') {
				return this.getComplete();
			}
		},

		'getComplete': function() {
			return this.filter(function(item) {
				return item.completed === true;
			});
		},

		'getLeft': function() {
			return this.filter(function(item) {
				return item.completed === false;
			});
		}
	});
});