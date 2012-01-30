function TodoController() {
    var todoController = Stapes(),
        todoModel = TodoModel(),
        todoView = TodoView();

    todoModel.on({
        "change" : function() {
            todoView.render( todoModel.getAll() );
            todoView.showLeft( todoModel.getLeft() );
        }
    });

    todoView.on({
        "clearcompleted" : function() {
            todoModel.clearCompleted();
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
        }
    });

    return todoController;
}