function TodoController() {
    var todoController = Stapes(),
        todoModel = TodoModel(),
        todoView = TodoView();

    todoModel.on({
        "change" : function() {
            todoView.render( todoModel.getAll() );
        }
    });

    todoView.on({
        "taskadd" : function(task) {
            todoModel.addTask(task);
            todoView.clearInput();
        },

        "taskdelete" : function(id) {
            todoModel.delete(id);
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