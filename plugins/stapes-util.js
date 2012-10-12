(function() {
    var util = {
        "bind" : function(fn, ctx) {
            if (util.isObject(fn)) {
                // Bind all functions in this object to this object
                util.each(fn, function(fun, name) {
                    if (util.typeOf(fun) === "function") {
                        fn[name] = util.bind(fun, ctx || fn);
                    }
                });

                return fn;
            } else {
                if (Function.prototype.bind) {
                    // Native
                    return fn.bind(ctx);
                } else {
                    // Non-native
                    return function() {
                        return fn.apply(ctx, arguments);
                    };
                }
            }
        },

        "clone" : function(obj) {
            if (util.isArray(obj)) {
                return obj.slice();
            } else if (util.isObject(obj)) {
                var newObj = {};

                util.each(obj, function(value, key) {
                    newObj[key] = value;
                });

                return newObj;
            } else {
                return obj;
            }
        },

        "create" : function(context) {
            var instance;

            if (typeof Object.create === "function") {
                // Native
                instance = Object.create(context);
            } else {
                // Non-native
                var F = function(){};
                F.prototype = context;
                instance = new F();
            }

            return instance;
        },

        "each" : function(list, fn, context) {
            if (util.isArray(list)) {
                if (Array.prototype.forEach) {
                    // Native forEach
                    list.forEach( fn, context );
                } else {
                    for (var i = 0, l = list.length; i < l; i++) {
                        fn.call(context, list[i], i);
                    }
                }
            } else {
                for (var key in list) {
                    fn.call(context, list[key], key);
                }
            }
        },

        "filter" : function(list, fn, context) {
            var results = [];

            if (util.isArray(list) && Array.prototype.filter) {
                return list.filter(fn, context);
            }

            util.each(list, function(value) {
                if (fn.call(context, value)) {
                    results.push(value);
                }
            });

            return results;
        },

        "isArray" : function(val) {
            return util.typeOf(val) === "array";
        },

        "isObject" : function(val) {
            return util.typeOf(val) === "object";
        },

        "keys" : function(list) {
            return util.map(list, function(value, key) {
                return key;
            });
        },

        // from http://stackoverflow.com/a/2117523/152809
        "makeUuid" : function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },

        "map" : function(list, fn, context) {
            var results = [];

            if (util.isArray(list) && Array.prototype.map) {
                return list.map(fn, context);
            }

            util.each(list, function(value, index) {
                results.push( fn.call(context, value, index) );
            });

            return results;
        },

        "size" : function(list) {
            return (util.isArray(list)) ? list.length : util.keys(list).length;
        },

        "toArray" : function(val) {
            if (util.isObject(val)) {
                return util.values(val);
            } else {
                return Array.prototype.slice.call(val, 0);
            }
        },

        "typeOf" : function(val) {
            // Note we're not doing === here. That's because undefined === null
            // gives false, where undefined == null gives true
            return (val == null) ?
                String(val) :
                Object.prototype.toString.call(val).replace(/\[object |\]/g, '').toLowerCase();
        },

        "values" : function(list) {
            return util.map(list, function(value, key) {
                return value;
            });
        }
    };

    for (name in util) {
        var fn = util[name];
        Stapes[name] = fn;
    }
})();