define(["../../stapes", "../lib/mustache"], function(Stapes, Mustache) {
    var todoView = Stapes.create(),
        taskTmpl;

    // Simple utility functions
    function $(selector) {
        var result = Array.prototype.slice.call(document.querySelectorAll(selector), 0);
        return result.length === 1 ? result[0] : result;
    }

    function on(selector, eventType, handler) {
        $(selector).addEventListener(eventType, function(e) {
            handler.call(e.target, e);
        }, false);
    }

    function httpRequest(url, cb) {
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                cb(request.status === 200 ? request.responseText : request.statusText);
            }
        }
        request.send(null);
    }

    function bindEventHandlers() {
        on('#tasks', 'submit', function(e) {
            if (this === $("#tasks form")) {
                e.preventDefault();
                todoView.emit('taskadd', $("#tasks form input").value);
            }
        });

        on('#tasks', 'click', function() {
            if (this.classList.contains('destroy')) {
                todoView.emit('taskdelete', this.dataset.id);
            }
        });

        on('#tasks', 'click', function(e) {
            if (this.type === "checkbox") {
                var event = this.checked ? 'taskdone' : 'taskundone';
                todoView.emit(event, this.dataset.id);
            }
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
            $("#tasks form input").value = "";
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