function TodoController() {
    var todoController = Stapes(),
        todoModel = TodoModel(),
        todoView = TodoView(),
        todoStore = TodoStore();

    todoModel.on({
        "change" : function() {
            todoStore.save( todoModel.getAll() );
            todoView.render( todoModel.getAll() );
            todoView.showLeft( todoModel.getLeft() );
        }
    });

    todoView.on({
        "clearcompleted" : function() {
            todoModel.clearCompleted();
        },

        "ready" : function() {
            var data = todoStore.load();
            if (data) {
                for (var key in data) {
                    var value = data[key];
                    todoModel.set(key, value);
                }
            }
        },

        "taskadd" : function(task) {
            todoModel.addTask(task);
            todoView.clearInput();
        },

        "taskdelete" : function(id) {
            todoModel.delete(id);
        },

        "taskdone" : function(id) {
            var todo = todoModel.get(id);
            todo.done = true;
            todoModel.set(id, todo);
        },

        "taskundone" : function(id) {
            var todo = todoModel.get(id);
            todo.done = false;
            todoModel.set(id, todo);
        }
    })

    todoController.extend({
        "init" : function() {
            todoModel.init();
            todoView.init();
            todoStore.init();
        }
    });

    return todoController;
}