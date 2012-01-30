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
            var completed = this.filter(function(item) {
                return item.done === true;
            });

            $.each(completed, function(i, item) {
                todoModel.delete(item.id);
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