(function() {
    var todoView = Stapes.create(),
        taskTmpl;

    function bindEventHandlers() {
        $("#tasks").on('submit', 'form', function(e) {
            e.preventDefault();
            todoView.emit('taskadd', $(this).find("input").val());
        });

        $("#tasks").on('click', '.destroy', function() {
            todoView.emit('taskdelete', $(this).parents('.item').data('id'));
        });

        $("#tasks").on('click', 'input[type=checkbox]', function(e) {
            var event = $(this).is(':checked') ? 'taskdone' : 'taskundone';
            todoView.emit(event, $(this).parents('.item').data('id'));
        });

        $(".clear").on('click', function() {
            todoView.emit('clearcompleted');
        })
    }

    function loadTemplates(cb) {
        $.get(window.location + 'templates/task.html', function(tmpl) {
            cb(function(view) {
                return Mustache.to_html(tmpl, view);
            });
        });
    }

    todoView.extend({
        "clearInput" : function() {
            $("#tasks input").val('');
        },

        "init" : function() {
            bindEventHandlers();

            loadTemplates(function(tmpl) {
                taskTmpl = tmpl;
                todoView.emit('ready');
            });
        },

        "render" : function(tasks) {
            var html = taskTmpl({ "tasks" : tasks });
            $("#tasks .items").html( html );
        },

        "showClearCompleted" : function(bool) {
            $(".clear").toggle(bool);
        },

        "showLeft" : function(left) {
            $(".countVal").text( left );
        }
    });

    window.TodoView = todoView;
})();