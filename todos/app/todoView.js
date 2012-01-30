function TodoView() {
    var todoView = Stapes(),
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
            cb(
                function(view) {
                    return Mustache.to_html(tmpl, view);
                }
            );
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
            $("#tasks .items").empty();

            $.each(tasks, function(i, task) {
                $("#tasks .items").append( taskTmpl(task) );
            });
        },

        "showLeft" : function(left) {
            $(".countVal").text( left );
        }
    });

    return todoView;
}