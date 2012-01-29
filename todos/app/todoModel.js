function TodoModel() {
    var todoModel = Stapes();

    todoModel.extend({
        "addTask" : function(name) {
            this.push({
                "done" : false,
                "name" : name
            });
        }
    })

    return todoModel;
}