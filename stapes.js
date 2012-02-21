(function() {
    /** Utility functions
     *
     *  Note that these functions are only used inside Stapes, and therefore
     *  aren't that failsafe as the options in libraries
     *  such as Underscore.js, so that's why they're not usable outside
     *  the private scope.
     */
    var attributes = {},
        eventHandlers = {"-1" : {}},
        guid = 0;

    var util = {
        bind : function(fn, ctx) {
            return function() {
                return fn.apply(ctx, arguments);
            };
        },

        create : function(context, obj, newGuid) {
            var F = function(){};
            F.prototype = context;
            var instance = new F();

            if (obj) {
                instance.extend( obj );
            }

            if (newGuid) {
                instance._guid = guid++;
                attributes[instance._guid] = {};
                eventHandlers[instance._guid] = {};
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

    /** Private helper functions */
    function addEvent(event) {
        // If we don't have any handlers for this type of event, add a new
        // array we can use to push new handlers
        if (!eventHandlers[event.guid][event.type]) {
            eventHandlers[event.guid][event.type] = [];
        }

        // Push an event object
        eventHandlers[event.guid][event.type].push({
            "guid" : event.guid,
            "handler" : event.handler,
            "scope" : event.scope,
            "type" : event.type
        });
    }

    function addEventHandler(argTypeOrMap, argHandlerOrScope, argScope) {
        var eventMap = {},
            scope,
            guid = this._guid || -1;

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

                addEvent.call(this, {
                    "guid" : guid,
                    "handler" : handler,
                    "scope" : scope,
                    "type" : eventType
                });
            }
        }
    }

    function emitEvents(type, data, explicitType, explicitGuid) {
        explicitType = explicitType || false;
        explicitGuid = explicitGuid || this._guid;

        util.each(eventHandlers[explicitGuid][type], function(event) {
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
        attributes[this._guid][key] = value;

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

    var Module = {
        create : function(obj) {
            return util.create(this, obj || false, true);
        },

        emit : function(types, data) {
            data = data || null;

            util.each(types.split(" "), util.bind(function(type) {
                // First 'all' type events: is there an 'all' handler in the
                // global stack?
                if (eventHandlers[-1].all) {
                    emitEvents.call(this, "all", data, type, -1);
                }

                // 'all' event for this specific module?
                if (eventHandlers[this._guid]["all"]) {
                    emitEvents.call(this, "all", data, type);
                }

                // Finally, normal events :)
                if (eventHandlers[this._guid][type]) {
                    emitEvents.call(this, type, data);
                }
            }, this));
        },

        extend : function(objectOrValues, valuesIfObject) {
            var object = (valuesIfObject) ? objectOrValues : this,
                values = (valuesIfObject) ? valuesIfObject : objectOrValues;

            util.each(values, function(value, key) {
                object[key] = value;
            });

            return this;
        },

        filter : function(fn) {
            var items = [];

            util.each(attributes[this._guid], function(item) {
                if (fn(item)) {
                    items.push(item);
                }
            });

            return items;
        },

        get : function(input) {
            if (typeof input === "string") {
                return this.has(input) ? attributes[this._guid][input] : null;
            } else if (typeof input === "function") {
                var items = this.filter(input);
                if (items.length) {
                    return items.length[0];
                }
            }
        },

        getAll : function() {
            return attributes[this._guid];
        },

        getAllAsArray : function() {
            var arr = [];

            util.each(attributes[this._guid], function(value, key) {
                if (util.isObject(value)) {
                    value.id = key;
                }

                arr.push(value);
            });

            return arr;

        },

        has : function(key) {
            return (typeof attributes[this._guid][key] !== "undefined");
        },

        init : function() {
            this.emit('ready');
            return this;
        },

        on : function() {
            addEventHandler.apply(this, arguments);
        },

        // Akin to set(), but makes a unique id
        push : function(input) {
            if (util.isArray(input)) {
                util.each(input, function(value) {
                    setAttribute.call(this, util.makeUuid(), value);
                });
            } else {
                setAttribute.call(this, util.makeUuid(), input);
            }
        },

        remove : function(input) {
            if (typeof input === "function") {
                util.each(attributes[this._guid], util.bind(function(item, key) {
                    if (input(item)) {
                        delete attributes[this._guid][key];
                        this.emit('delete change');
                    }
                }, this));
            } else {
                if (typeof input === "string") {
                    input = [input];
                }

                util.each(util.toArray(input), util.bind(function(id) {
                    if (this.has(id)) {
                        delete attributes[this._guid][id];
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

        sub : function(obj) {
            return util.create(this, obj || false, false);
        },

        update : function(key, fn) {
            var item = this.get(key);
            fn(item);
            setAttribute.call(this, key, item);
        }
    };

    var Stapes = {
        "create" : function(obj) {
            return util.create(Module, obj || false, true);
        },

        "data" : function() {
            console.log(eventHandlers, attributes);
        },

        "extend" : function(obj) {
            util.each(obj, function(value, key) {
                Module[key] = value;
            });
        },

        "on" : function() {
            addEventHandler.apply(Module, arguments);
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
            return Stapes;
        });
    } else {
        // Global scope
        window.Stapes = Stapes;
    }
})();