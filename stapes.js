//
//  ____  _                           _
// / ___|| |_ __ _ _ __   ___  ___   (_)___  (*)
// \___ \| __/ _` | '_ \ / _ \/ __|  | / __|
//  ___) | || (_| | |_) |  __/\__ \_ | \__ \
// |____/ \__\__,_| .__/ \___||___(_)/ |___/
//              |_|              |__/
//
// (*) a (really) tiny Javascript MVC microframework
//
// (c) Hay Kranen < hay@bykr.org >
// Released under the terms of the MIT license
// < http://en.wikipedia.org/wiki/MIT_License >
//
// Stapes.js : http://hay.github.com/stapes

(function() {
    'use strict';

    var VERSION = "0.5";

    // Global counter for all events in all modules (including mixed in objects)
    var guid = 1;

    /** Utility functions
     *
     *  These are more or less modelled on the ones used in Underscore.js,
     *  but might not be as extensive or failproof.
     *  However, they are pretty damn useful and can be accessed by using
     *  the Stapes.util global
     */
    var util = {
        "bind" : function(fn, ctx) {
            if (util.isObject(fn)) {
                // Bind all functions in this object to this object
                util.each(fn, function(fun, name) {
                    if (util.typeOf(fun) === "function") {
                        fn[name] = util.bind(fun, fn);
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
            return Object.prototype.toString.call(val).replace(/\[object |\]/g, '').toLowerCase();
        },

        "values" : function(list) {
            return util.map(list, function(value, key) {
                return value;
            });
        }
    };

    // Private attributes and helper functions, stored in an object so they
    // are overwritable by plugins
    var _ = {
        // Properties
        attributes : {},

        eventHandlers : {
            "-1" : {} // '-1' is used for the global event handling
        },

        guid : -1,

        // Methods
        addEvent : function(event) {
            // If we don't have any handlers for this type of event, add a new
            // array we can use to push new handlers
            if (!_.eventHandlers[event.guid][event.type]) {
                _.eventHandlers[event.guid][event.type] = [];
            }

            // Push an event object
            _.eventHandlers[event.guid][event.type].push({
                "guid" : event.guid,
                "handler" : event.handler,
                "scope" : event.scope,
                "type" : event.type
            });
        },

        addEventHandler : function(argTypeOrMap, argHandlerOrScope, argScope) {
            var eventMap = {},
                scope;

            if (typeof argTypeOrMap === "string") {
                scope = argScope || false;
                eventMap[ argTypeOrMap ] = argHandlerOrScope;
            } else {
                scope = argHandlerOrScope || false;
                eventMap = argTypeOrMap;
            }

            util.each(eventMap, function(handler, eventString) {
                var events = eventString.split(" ");

                util.each(events, function(eventType) {
                    _.addEvent.call(this, {
                        "guid" : this._guid,
                        "handler" : handler,
                        "scope" : scope,
                        "type" : eventType
                    });
                }, this);
            }, this);
        },

        addGuid : function(object, forceGuid) {
            if (object._guid && !forceGuid) return;

            object._guid = guid++;

            _.attributes[object._guid] = {};
            _.eventHandlers[object._guid] = {};
        },

        // This is a really small utility function to save typing and produce
        // better optimized code
        attr : function(guid) {
            return _.attributes[guid];
        },

        // Stapes objects have some extra properties that are set on creation
        createModule : function( context ) {
            var instance = util.create( context );

            _.addGuid( instance, true );

            // Mixin events
            Stapes.mixinEvents( instance );

            return instance;
        },

        emitEvents : function(type, data, explicitType, explicitGuid) {
            explicitType = explicitType || false;
            explicitGuid = explicitGuid || this._guid;

            util.each(_.eventHandlers[explicitGuid][type], function(event) {
                var scope = (event.scope) ? event.scope : this;
                if (explicitType) {
                    event.type = explicitType;
                }
                event.scope = scope;
                event.handler.call(event.scope, data, event);
            }, this);
        },

        removeEventHandler : function(type, handler) {
            var handlers = _.eventHandlers[this._guid];

            if (type && handler) {
                // Remove a specific handler
                util.each(handlers[type], function(eventObject, index) {
                    if (eventObject.handler === handler) {
                        handlers[type].splice(index--, 1);
                    }
                }, this);
            } else if (type) {
                // Remove all handlers for a specific type
                delete handlers[type];
            } else {
                // Remove all handlers for this module
                _.eventHandlers[this._guid] = {};
            }
        },

        setAttribute : function(key, value) {
            // We need to do this before we actually add the item :)
            var itemExists = this.has(key),
                oldValue = _.attr(this._guid)[key];

            // Is the value different than the oldValue? If not, ignore this call
            if (value === oldValue) {
                return;
            }

            // Actually add the item to the attributes
            _.attr(this._guid)[key] = value;

            // Throw a generic event
            this.emit('change', key);

            // And a namespaced event as well, NOTE that we pass value instead of
            // key here!
            this.emit('change:' + key, value);

            // Throw namespaced and non-namespaced 'mutate' events as well with
            // the old value data as well and some extra metadata such as the key
            var mutateData = {
                "key" : key,
                "newValue" : value,
                "oldValue" : oldValue || null
            };

            this.emit('mutate', mutateData);
            this.emit('mutate:' + key, mutateData);

            // Also throw a specific event for this type of set
            var specificEvent = itemExists ? 'update' : 'create';

            this.emit(specificEvent, key);

            // And a namespaced event as well, NOTE that we pass value instead of key
            this.emit(specificEvent + ':' + key, value);
        },

        updateAttribute : function(key, fn) {
            var item = this.get(key),
                newValue = fn( util.clone(item) );

            _.setAttribute.call(this, key, newValue);
        }
    };

    // Can be mixed in later using Stapes.mixinEvents(object);
    var Events = {
        emit : function(types, data) {
            data = (typeof data === "undefined") ? null : data;

            util.each(types.split(" "), function(type) {
                // First 'all' type events: is there an 'all' handler in the
                // global stack?
                if (_.eventHandlers[-1].all) {
                    _.emitEvents.call(this, "all", data, type, -1);
                }

                // Catch all events for this type?
                if (_.eventHandlers[-1][type]) {
                    _.emitEvents.call(this, type, data, type, -1);
                }

                if (typeof this._guid === 'number') {
                    // 'all' event for this specific module?
                    if (_.eventHandlers[this._guid].all) {
                        _.emitEvents.call(this, "all", data, type);
                    }

                    // Finally, normal events :)
                    if (_.eventHandlers[this._guid][type]) {
                        _.emitEvents.call(this, type, data);
                    }
                }
            }, this);
        },

        off : function() {
            _.removeEventHandler.apply(this, arguments);
        },

        on : function() {
            _.addEventHandler.apply(this, arguments);
        }
    };

    _.Module = {
        create : function() {
            return _.createModule( this );
        },

        each : function(fn, ctx) {
            util.each(_.attr(this._guid), fn, ctx || this);
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
            return util.filter(_.attr(this._guid), fn);
        },

        get : function(input) {
            if (typeof input === "string") {
                return this.has(input) ? _.attr(this._guid)[input] : null;
            } else if (typeof input === "function") {
                var items = this.filter(input);
                return (items.length) ? items[0] : null;
            }
        },

        getAll : function() {
            return util.clone( _.attr(this._guid) );
        },

        getAllAsArray : function() {
            var arr = util.map(_.attr(this._guid), function(value, key) {
                if (util.isObject(value)) {
                    value.id = key;
                }

                return value;
            });

            return util.clone( arr );
        },

        has : function(key) {
            return (typeof _.attr(this._guid)[key] !== "undefined");
        },

        // Akin to set(), but makes a unique id
        push : function(input) {
            if (util.isArray(input)) {
                util.each(input, function(value) {
                    _.setAttribute.call(this, util.makeUuid(), value);
                }, this);
            } else {
                _.setAttribute.call(this, util.makeUuid(), input);
            }
        },

        remove : function(input) {
            if (typeof input === "function") {
                this.each(function(item, key) {
                    if (input(item)) {
                        delete _.attr(this._guid)[key];
                        this.emit('remove change');
                    }
                });
            } else {
                if (this.has(input)) {
                    delete _.attr(this._guid)[input];
                    this.emit('remove change');
                }
            }
        },

        set : function(objOrKey, value) {
            if (util.isObject(objOrKey)) {
                util.each(objOrKey, function(value, key) {
                    _.setAttribute.call(this, key, value);
                }, this);
            } else {
                _.setAttribute.call(this, objOrKey, value);
            }
        },

        size : function() {
            return util.size( _.attributes[this._guid] );
        },

        update : function(keyOrFn, fn) {
            if (typeof keyOrFn === "string") {
                _.updateAttribute.call(this, keyOrFn, fn);
            } else if (typeof keyOrFn === "function") {
                this.each(function(value, key) {
                    _.updateAttribute.call(this, key, keyOrFn);
                });
            }
        }
    };

    var Stapes = {
        "_" : _, // private helper functions and properties

        "create" : function() {
            return _.createModule( _.Module );
        },

        "extend" : function(obj) {
            util.each(obj, function(value, key) {
                _.Module[key] = value;
            });
        },

        "mixinEvents" : function(obj) {
            obj = obj || {};

            _.addGuid(obj);

            util.each(Events, function(value, key) {
                obj[key] = value;
            });

            return obj;
        },

        "on" : function() {
            _.addEventHandler.apply(this, arguments);
        },

        "util" : util,

        "version" : VERSION
    };

    // This library can be used as an AMD module, a Node.js module, or an
    // old fashioned global
    if (typeof exports !== "undefined") {
        // Server
        if (typeof module !== "undefined" && module.exports) {
            exports = module.exports = Stapes;
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