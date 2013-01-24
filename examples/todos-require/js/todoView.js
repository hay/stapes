'use strict';
define(['stapes'], function(Stapes) {
	var TodoView = Stapes.subclass({
		'constructor' : function() {
			this.bindEventHandlers();
			this.loadTemplates();
		}
	});

	// Static methods and properties
	TodoView.extend({
		ENTER_KEY_KEYCODE : 13
	});

	// Prototype methods and properties
	TodoView.proto({
		'bindEventHandlers' : function() {
			$('#new-todo').on('keyup', function(e) {
				var todoVal = $.trim($(e.target).val());

				if (e.which === TodoView.ENTER_KEY_KEYCODE && todoVal !== '') {
					e.preventDefault();
					this.emit('todoadd', todoVal);
				}
			}.bind(this));

			$('#todo-list').on('click', '.destroy', function(e) {
				this.emit('tododelete', $(e.target).parents('li').data('id'));
			}.bind(this));

			$('#todo-list').on('click', 'input.toggle', function(e) {
				var event = $(e.target).is(':checked') ? 'todocompleted' : 'todouncompleted';
				this.emit(event, $(e.target).parents('li').data('id'));
			}.bind(this));

			$('#todo-list').on('dblclick', 'li', function(e) {
				this.emit('edittodo', $(e.target).closest('li').data('id'));
			}.bind(this));

			$('#todo-list').on('keyup focusout', 'input.edit', function(e) {
				if (e.type === 'keyup') {
					if (e.which === TodoView.ENTER_KEY_KEYCODE) {
						e.preventDefault();
					} else {
						return false;
					}
				}

				var $li = $(e.target).closest('li');

				this.emit('todoedit', {
					id : $li.data('id'),
					title : $.trim($li.find('.edit').val())
				});
			}.bind(this));

			$('#clear-completed').on('click', function() {
				this.emit('clearcompleted');
			}.bind(this));

			$('#toggle-all').on('click', function(e) {
				var isChecked = $(e.target).is(':checked');
				this.emit( isChecked ? 'completedall' : 'uncompletedall', isChecked);
			}.bind(this));

			window.onhashchange = function() {
				this.emit('statechange', this.getState());
			}.bind(this)
		},

		'clearInput': function() {
			$('#new-todo').val('');
		},

		'getState': function() {
			return window.location.hash.replace('#/', '') || 'all';
		},

		'hide': function() {
			$('#main, #footer').hide();
		},

		'loadTemplates' : function() {
			this.template = Handlebars.compile( $('#todo-template').html() );
		},

		'makeEditable' : function(id) {
			var $item = $('#todo-list li[data-id=' + id + ']');
			$item.addClass('editing').find('input.edit').focus();
		},

		'render': function(todos) {
			var html = this.template({ 'todos' : todos });
			$('#todo-list').html( html );
		},

		'setActiveRoute': function(route) {
			$('#filters a').removeClass('selected').filter('[href="#/' + route + '"]').addClass('selected');
		},

		'show': function() {
			$('#main, footer').show();
		},

		'showClearCompleted': function(completed) {
			var bool = completed > 0;
			$('#clear-completed').toggle(bool);
			$('#clear-completed').html('Clear completed (' + completed + ')');
		},

		'showLeft': function(left) {
			var word = (left === 1) ? 'item' : 'items';
			$('#todo-count').html('<strong>' + left + '</strong> ' + word + ' left');
			$("#toggle-all").get(0).checked = (left === 0);
		}
	});

	return TodoView;
});