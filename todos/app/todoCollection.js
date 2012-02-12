function TodoCollection() {
    var todoCollection = Stapes();

    function taskModel() {
        var task = Stapes();
        return task;
    }

    todoCollection.extend({
        "addTask" : function(name) {
            var task = taskModel();

            task.set({
                "done" : false,
                "name" : name
            });

            this.push( task );
        },

        "clearCompleted" : function() {
            todoCollection.remove(function(item) {
                return item.get('done') === true;
            });
        },

        "getDone" : function() {
            return this.filter(function(item) {
                return item.get('done') === true;
            }).length;
        },

        "getLeft" : function() {
            return this.filter(function(item) {
                return item.get('done') === false;
            }).length;
        }
    });

    return todoCollection;
}