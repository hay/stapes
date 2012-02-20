var TodoController = Stapes.create({ name : "TodoController"}).extend({
    "bindEventHandlers" : function() {
        this.model.on({
            "change" : function() {
                this.store.save( this.model.getAll() );
                this.view.render( this.model.getAllAsArray() );
                this.view.showLeft( this.model.getLeft() );
            },

            "change ready" : function() {
                this.view.showClearCompleted( this.model.getDone() > 0);
            }
        }, this);

        this.view.on({
            "clearcompleted" : function() {
                this.model.clearCompleted();
            },

            "ready" : function() {
                this.model.set( this.store.load() );
            },

            "taskadd" : function(task) {
                this.model.addTask(task);
                this.view.clearInput();
            },

            "taskdelete" : function(id) {
                this.model.remove(id);
            },

            "taskdone taskundone" : function(id, e) {
                this.model.update(id, function(item) {
                    item.done = e.type === "taskdone";
                });
            }
        }, this);
    },

    "init" : function() {
        this.model = TodoModel.create();
        this.view = TodoView.create();
        this.store = TodoStore.create();

        this.bindEventHandlers();

        this.model.init();
        this.view.init();
        this.store.init();
    }
});