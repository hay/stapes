require(
    {
        paths : {
            "stapes" : "../../../stapes",
            "mustache" : "../../lib/mustache"
        }
    },
    ["todoController"],
    function(controller) {
        controller.init();
    }
);