define(
["stapes", "todoModel", "todoView", "todoStore"],
function(Stapes, TodoModel, TodoView, TodoStore) {
    return Stapes.create().extend({
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
                        return item;
                    });
                }
            }, this);
        },

        "init" : function() {
            this.model = TodoModel;
            this.view = TodoView;
            this.store = TodoStore;

            this.bindEventHandlers();

            this.model.init();
            this.view.init();
            this.store.init();
        }
    });
});