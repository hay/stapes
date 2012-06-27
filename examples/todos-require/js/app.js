require(
    {
        paths : {
            "stapes" : "../../../stapes"
        }
    },
    ["todoController"],
    function(todoController) {
        todoController.init();
    }
);