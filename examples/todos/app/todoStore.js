var TodoStore = Stapes.create({name : "TodoStore"}).extend({
    "init" : function() {
        if (!"localStorage" in window) {
            throw new Error("Your browser doesn't support localStorage");
        }

        this.emit('ready');
    },

    "load" : function() {
        var result = window.localStorage['todos'];

        if (result) {
            return JSON.parse(result);
        }
    },

    "save" : function(data) {
        localStorage['todos'] = JSON.stringify( data );
    }
});