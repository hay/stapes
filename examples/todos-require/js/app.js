// .bind shim for IE8
if (!Function.prototype.bind) {
    Function.prototype.bind = function(context) {
        var self = this;
        return function() {
            return self.apply(context, arguments);
        };
    };
}

require.config({
    paths : {
        "stapes" : "../../../stapes"
    },
    urlArgs : "cachebust=" + Math.random()
});

require(["todoController"], function(TodoController) {
    new TodoController();
});