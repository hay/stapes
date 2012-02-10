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
            var todo = todoModel.get(id);
            todo.done = e.type === "taskdone";
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