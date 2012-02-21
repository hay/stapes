(function() {
    /** Utility functions
     *
     *  Note that these functions are only used inside Stapes, and therefore
     *  aren't that failsafe as the options in libraries
     *  such as Underscore.js, so that's why they're not usable outside
     *  the private scope.
     */
    var util = {
        bind : function(fn, ctx) {
            return function() {
                return fn.apply(ctx, arguments);
            };
        },

        create : function(context, obj) {
            var F = function(){};
            F.prototype = context;
            var instance = new F();

            if (obj) {
                instance.extend( obj );
            }

            return instance;
        },

        each : function(obj, fn) {
            for (var key in obj) {
                fn( obj[key], key );
            }
        },

        isArray : function(val) {
            return Object.prototype.toString.call( val ) === "[object Array]";
        },

        isObject : function(val) {
            return (typeof val === "object") && (!util.isArray(val) && val !== null);
        },

        // from http://stackoverflow.com/a/2117523/152809
        makeUuid : function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },

        toArray : function(arr) {
            return Array.prototype.slice.call(arr, 0);
        }
    };

    function Stapes() {
        var eventHandlers = {},
            attributes = {},
            Module;

        /** Private helper functions */
        function addEvent(event) {
            // If we don't have any handlers for this type of event, add a new
            // array we can use to push new handlers
            if (!eventHandlers[event.type]) {
                eventHandlers[event.type] = [];
            }

            // Push an event object
            eventHandlers[event.type].push({
                "handler" : event.handler,
                "scope" : event.scope,
                "type" : event.type
            });
        }

        function emitEvents(type, data, explicitType) {
            explicitType = explicitType || false;

            util.each(eventHandlers[type], function(event) {
                var scope = (event.scope) ? event.scope : this;
                if (explicitType) {
                    event.type = explicitType;
                }
                event.scope = scope;
                event.handler.call(event.scope, data, event);
            });
        }

        function setAttribute(key, value) {
            // We need to do this before we actually add the item :)
            var itemExists = this.has(key);

            // Actually add the item to the attributes
            attributes[key] = value;

            // Throw a generic event
            this.emit('change', key);

            // And a namespaced event as well, NOTE that we pass value instead of
            // key here!
            this.emit('change:' + key, value);

            // Also throw a specific event for this type of set
            var specificEvent = itemExists ? 'update' : 'create';

            this.emit(specificEvent, key);

            // And a namespaced event as well, NOTE that we pass value instead of key
            this.emit(specificEvent + ':' + key, value);
        }

        Module = {
            create : function(obj) {
                return util.create(this, obj || false);
            },

            emit : function(types, data) {
                data = data || null;

                util.each(types.split(" "), util.bind(function(type) {
                    if (eventHandlers["all"]) {
                        emitEvents.call(this, "all", data, type);
                    }

                    if (!eventHandlers[type]) return;

                    emitEvents.call(this, type, data);
                }, this));
            },

            extend : function(objectOrValues, valuesIfObject) {
                var object = (valuesIfObject) ? objectOrValues : this,
                    values = (valuesIfObject) ? valuesIfObject : objectOrValues;

                for (var key in values) {
                    var val = values[key];

                    object[key] = val;
                }

                return this;
            },

            filter : function(fn) {
                var items = [];

                util.each(attributes, function(item) {
                    if (fn(item)) {
                        items.push(item);
                    }
                });

                return items;
            },

            get : function(input) {
                if (typeof input === "string") {
                    return this.has(input) ? attributes[input] : null;
                } else if (typeof input === "function") {
                    var items = this.filter(input);
                    if (items.length) {
                        return items.length[0];
                    }
                }
            },

            getAll : function() {
                return attributes;
            },

            getAllAsArray : function() {
                var arr = [];

                util.each(attributes, function(value, key) {
                    if (util.isObject(value)) {
                        value.id = key;
                    }

                    arr.push(value);
                });

                return arr;

            },

            has : function(key) {
                return (typeof attributes[key] !== "undefined");
            },

            init : function() {
                this.emit('ready');
                return this;
            },

            // 'Eventparam' can either be a string with space-seperated events
            // or an object with key / value pairs for events and handlers
            on : function(argTypeOrMap, argHandlerOrScope, argScope) {
                var eventMap = {},
                    scope;

                if (typeof argTypeOrMap === "string") {
                    scope = argScope || false;
                    eventMap[ argTypeOrMap ] = argHandlerOrScope;
                } else {
                    scope = argHandlerOrScope || false;
                    eventMap = argTypeOrMap;
                }

                for (var eventString in eventMap) {
                    var handler = eventMap[ eventString ],
                        events = eventString.split(" ");

                    for (var i = 0, l = events.length; i < l; i++) {
                        var eventType = events[i];

                        addEvent({
                            "handler" : handler,
                            "scope" : scope,
                            "type" : eventType
                        });
                    }
                }
            },

            // Akin to set(), but makes a unique id
            push : function(input) {
                if (util.isArray(input)) {
                    util.each(input, util.bind(function(value) {
                        setAttribute.call(this, util.makeUuid(), value);
                    }, this));
                } else {
                    setAttribute.call(this, util.makeUuid(), input);
                }
            },

            remove : function(input) {
                if (typeof input === "function") {
                    util.each(attributes, util.bind(function(item, key) {
                        if (input(item)) {
                            delete attributes[key];
                            this.emit('delete change');
                        }
                    }, this));
                } else {
                    if (typeof input === "string") {
                        input = [input];
                    }

                    util.each(util.toArray(input), util.bind(function(id) {
                        if (this.has(id)) {
                            delete attributes[id];
                            this.emit('delete change');
                        }
                    }, this));
                }
            },


            set : function(objOrKey, value) {
                if (util.isObject(objOrKey)) {
                    util.each(objOrKey, util.bind(function(value, key) {
                        setAttribute.call(this, key, value);
                    }, this));
                } else {
                    setAttribute.call(this, objOrKey, value);
                }
            },

            update : function(key, fn) {
                var item = this.get(key);
                fn(item);
                setAttribute.call(this, key, item);
            }
        };

        return Module;
    }

    var initalizer = {
        "create" : function(obj) {
            return util.create(Stapes(), obj || false);
        }
    };

    // This library can be used as an AMD module, a Node.js module, or an
    // old fashioned global
    if (typeof exports !== "undefined") {
        // Server
        if (typeof module !== "undefined" && module.exports) {
            exports = module.exports = initalizer;
        }
        exports.Stapes = Stapes;
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(function() {
            return initalizer;
        });
    } else {
        // Global scope
        window.Stapes = initalizer;
    }
})();