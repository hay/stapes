function TodoModel() {
    var todoModel = Stapes();

    todoModel.extend({
        "addTask" : function(name) {
            this.push({
                "done" : false,
                "name" : name
            });
        },

        "clearCompleted" : function() {
            todoModel.remove(function(item) {
                return item.done === true;
            });
        },

        "getLeft" : function() {
            return this.filter(function(item) {
                return item.done === false;
            }).length;
        }
    })

    return todoModel;
}