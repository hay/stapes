define(["../../stapes", "../lib/mustache"], function(Stapes, Mustache) {
    var todoView = Stapes.create(),
        taskTmpl;

    // Simple utility functions
    function $(selector) {
        var result = Array.prototype.slice.call(document.querySelectorAll(selector), 0);
        return result.length === 1 ? result[0] : result;
    }

    function on(selector, eventType, handler) {
        $(selector).addEventHandler(eventType, handler, false);
    }

    function httpRequest(url, cb) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onreadystatechange = function(e) {
            if (e.readyState === 4) {
                cb(e.status === 200 ? e.responseText : e.statusText);
            }
        }
        request.send(null);
    }

    function bindEventHandlers() {
        on('#tasks form', 'submit', function(e) {
            e.preventDefault();
            todoView.emit('taskadd', $(this).find("input").val());
        });

        on('#tasks .destroy', 'click', function() {
            todoView.emit('taskdelete', $(this).parents('.item').data('id'));
        });

        on('#tasks input[type=checkbox]', 'click', function(e) {
            var event = $(this).is(':checked') ? 'taskdone' : 'taskundone';
            todoView.emit(event, $(this).parents('.item').data('id'));
        });

        on('.clear', 'click', function() {
            todoView.emit('clearcompleted');
        });
    }

    function loadTemplates(cb) {
        httpRequest(window.location + 'templates/task.html', function(tmpl) {
            cb(function(view) {
                return Mustache.to_html(tmpl, view);
            });
        });
    }

    todoView.extend({
        "clearInput" : function() {
            $("#tasks input").value == "";
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
            $("#tasks .items").innerHTML = html;
        },

        "showClearCompleted" : function(bool) {
            $(".clear").style.display = (bool) ? "block" : "none";
        },

        "showLeft" : function(left) {
            $(".countVal").innerHTML = left;
        }
    });

    return todoView;
});