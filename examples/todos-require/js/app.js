require.config({
    paths : {
        "stapes" : "../../../stapes"
    },
    urlArgs : "cachebust=" + Math.random()
});

require(["todoController"], function(TodoController) {
    new TodoController();
});