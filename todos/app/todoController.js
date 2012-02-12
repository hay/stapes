function TodoController() {
    var todoController = Stapes(),
        todoModel = TodoModel(),
        todoView = TodoView(),
        todoStore = TodoStore();

    todoModel.on({
        "change" : function() {
            todoStore.save( todoModel.getAll() );
            todoView.render( todoModel.getAllAsArray() );
            todoView.showLeft( todoModel.getLeft() );
        },

        "change ready" : function() {
            todoView.showClearCompleted( todoModel.getDone() > 0);
        }
    });

    todoView.on({
        "clearcompleted" : function() {
            todoModel.clearCompleted();
        },

        "ready" : function() {
            todoModel.set( todoStore.load() );
        },

        "taskadd" : function(task) {
            todoModel.addTask(task);
            todoView.clearInput();
        },

        "taskdelete" : function(id) {
            todoModel.remove(id);
        },

        "taskdone taskundone" : function(id, e) {
            todoModel.update(id, function(item) {
                item.done = e.type === "taskdone";
            });
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