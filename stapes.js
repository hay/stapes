//
//  ____  _                           _
// / ___|| |_ __ _ _ __   ___  ___   (_)___  (*)
// \___ \| __/ _` | '_ \ / _ \/ __|  | / __|
//  ___) | || (_| | |_) |  __/\__ \_ | \__ \
// |____/ \__\__,_| .__/ \___||___(_)/ |___/
//              |_|              |__/
//
// (*) the Javascript MVC microframework that does just enough
//
// (c) Hay Kranen < hay@bykr.org >
// Released under the terms of the MIT license
// < http://en.wikipedia.org/wiki/MIT_License >
//
// Stapes.js : http://hay.github.com/stapes
;(function() {
    'use strict';

    var VERSION = '0.8.1';

    // Global counter for all events in all modules (including mixed in objects)
    var guid = 1;

    // Makes _.create() faster
    if (!Object.create) var CachedFunction = function(){};

    // So we can use slice.call for arguments later on
    var slice = Array.prototype.slice;

    // Private attributes and helper functions, stored in an object so they
    // are overwritable by plugins
    var _ = {
        // Properties
        attributes: {},
        eventHandlers: {
            '-1' : {} // '-1' is used for the global event handling
        },
        guid: -1,
        // Methods
        addEvent: function(event){
            // If we don't have any handlers for this type of event, add a new
            // array we can use to push new handlers
            if (!_.eventHandlers[event.guid][event.type]) _.eventHandlers[event.guid][event.type] = [];

            var obj = {}, arr = ['guid', 'handler', 'scope', 'type']

            for (var i in arr) {
                var x = arr[i];
                obj[x] = event[x]
            }

            // Push an event object
            _.eventHandlers[event.guid][event.type].push(obj);
        },
        addEventHandler: function(argTypeOrMap, argHandlerOrScope, argScope){
            var eventMap = {}, scope;

            if (_.typeOf(argTypeOrMap) === 'string') {
                scope = argScope || false;
                eventMap[argTypeOrMap] = argHandlerOrScope;
            } else {
                scope = argHandlerOrScope || false;
                eventMap = argTypeOrMap;
            }

            for (var eventString in eventMap){
                var handler = eventMap[eventString], 
                    events = eventString.split(' ');

                for (var i = 0, l = events.length; i < l; i++) {
                    var eventType = events[i], 
                        obj = {
                            guid: this._guid || this._.guid,
                            handler: handler,
                            scope: scope,
                            type: eventType
                        }

                    _.addEvent.call(this, obj);
                }
            }
        },
        addGuid: function(object, forceGuid){
            if (object._guid && !forceGuid) return;

            object._guid = guid++;

            _.attributes[object._guid] = {};
            _.eventHandlers[object._guid] = {};
        },
        // This is a really small utility function to save typing and produce
        // better optimized code
        attr: function(guid){
            return _.attributes[guid];
        },
        clone: function(obj){
            var type = _.typeOf(obj), x;

            switch (type){
                case 'object':
                    x = _.extend({}, obj);
                    break;
                case 'array':
                    x = obj.slice(0);
                    break;
            }

            return x;
        },
        create: function(proto){
            if (Object.create) {
                return Object.create(proto);
            } else {
                CachedFunction.prototype = proto;
                return new CachedFunction();
            }
        },
        createSubclass: function(props, includeEvents) {
            props = props || {};
            includeEvents = includeEvents || false;

            var superclass = props.superclass.prototype;

            // Objects always have a constructor, so we need to be sure this is
            // a property instead of something from the prototype
            var realConstructor = _.has(props, 'constructor') ? props.constructor : function(){};

            function constructor() {
                // Be kind to people forgetting new
                if (!(this instanceof constructor)) throw new Error('Please use \'new\' when initializing Stapes classes');

                // If this class has events add a GUID as well
                if (this.on) _.addGuid(this, true);

                realConstructor.apply(this, arguments);
            }

            if (includeEvents) _.extend(superclass, Events);

            constructor.prototype = _.create(superclass);
            constructor.prototype.constructor = constructor;

            var obj = {
                extend: function(){
                    return _.extendThis.apply(this, arguments);
                },
                // We can't call this 'super' because that's a reserved keyword
                // and fails in IE8
                parent: superclass,
                proto: function(){
                    return _.extendThis.apply(this.prototype, arguments);
                },
                subclass : function(obj){
                    obj = obj || {};
                    obj.superclass = this;
                    return _.createSubclass(obj);
                }
            }

            _.extend(constructor, obj);

            // Copy all props given in the definition to the prototype
            for (var key in props) {
                var test = (key !== 'constructor' && key !== 'superclass')
                if (test) constructor.prototype[key] = props[key];
            }

            return constructor;
        },
        emitEvents: function(type, data, explicitType, explicitGuid) {
            explicitType = explicitType || false;
            explicitGuid = explicitGuid || this._guid;

            // #30: make a local copy of handlers to prevent problems with
            // unbinding the event while unwinding the loop
            var handlers = slice.call(_.eventHandlers[explicitGuid][type]);

            for (var i = 0, l = handlers.length; i < l; i++){
                // Clone the event to prevent issue #19
                var event = _.extend({}, handlers[i]),
                    scope = (event.scope) ? event.scope : this;

                if (explicitType) event.type = explicitType;

                event.scope = scope;
                event.handler.call(event.scope, data, event);
            }
        },
        // Extend an object with more objects
        extend: function(){
            var args = slice.call(arguments),
                object = args.shift();

            for (var i = 0, l = args.length; i < l; i++) {
                var props = args[i];
                for (var key in props) object[key] = props[key];
            }

            return object;
        },
        // The same as extend, but uses the this value as the scope
        extendThis: function(){
            var args = slice.call(arguments);
            args.unshift(this);
            return _.extend.apply(this, args);
        },
        has: function(obj, key){
            return obj != null && hasOwnProperty.call(obj, key);
        },
        hasId: function(input){
            return (input === Object(input) && _.has(input, 'id')) ? input.id : _.makeUuid();
        },
        // from http://stackoverflow.com/a/2117523/152809
        makeUuid: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },
        removeAttribute: function(keys, silent){
            silent = silent || false;

            // Split the key, maybe we want to remove more than one item
            var attributes = _.trim(keys).split(' '),
                mutateData = {}

            // Actually delete the item
            for (var i = 0, l = attributes.length; i < l; i++) {
                var key = _.trim(attributes[i]);

                if (key){
                    // Store data for mutate event
                    mutateData.key = key;
                    mutateData.oldValue = _.attr(this._guid)[key];

                    delete _.attr(this._guid)[key];

                    // If 'silent' is set, do not throw any events
                    if (!silent) {
                        this.emit('change', key);
                        this.emit('change:' + key);
                        this.emit('mutate', mutateData);
                        this.emit('mutate:' + key, mutateData);
                        this.emit('remove', key);
                        this.emit('remove:' + key);
                    }

                    // clean up
                    delete mutateData.oldValue;
                }
            }
        },
        removeEventHandler: function(type, handler){
            var handlers = _.eventHandlers[this._guid];

            if (type && handler) {
                // Remove a specific handler
                handlers = handlers[type];
                if (!handlers) return;

                for (var i = 0, l = handlers.length, h; i < l; i++) {
                    h = handlers[i].handler;
                    if (h && h === handler) {
                        handlers.splice(i--, 1);
                        l--;
                    }
                }
            } else if (type) {
                // Remove all handlers for a specific type
                delete handlers[type];
            } else {
                // Remove all handlers for this module
                _.eventHandlers[this._guid] = {};
            }
        },
        setAttribute : function(key, value, silent) {
            silent = silent || false;

            // We need to do this before we actually add the item :)
            var itemExists = this.has(key),
                oldValue = _.attr(this._guid)[key];

            // Is the value different than the oldValue? If not, ignore this call
            if (value === oldValue) return;

            // Actually add the item to the attributes
            _.attr(this._guid)[key] = value;

            // If 'silent' flag is set, do not throw any events
            if (silent) return;

            // Throw a generic event
            this.emit('change', key);

            // And a namespaced event as well, NOTE that we pass value instead of
            // key here!
            this.emit('change:' + key, value);

            // Throw namespaced and non-namespaced 'mutate' events as well with
            // the old value data as well and some extra metadata such as the key
            var mutateData = {
                key: key,
                newValue: value,
                oldValue: oldValue || null
            }

            this.emit('mutate', mutateData);
            this.emit('mutate:' + key, mutateData);

            // Also throw a specific event for this type of set
            var specificEvent = itemExists ? 'update' : 'create';

            this.emit(specificEvent, key);

            // And a namespaced event as well, NOTE that we pass value instead of key
            this.emit(specificEvent+':'+key, value);
        },
        trim: function(str){
            return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        },
        typeOf: function(val){
            return (val === null || typeof val === 'undefined') ? String(val) : Object.prototype.toString.call(val).replace(/\[object |\]/g, '').toLowerCase();
        },
        updateAttribute: function(key, fn, silent){
            var item = this.get(key), type = _.typeOf(item);

            if (type === 'object' || type === 'array') item = _.clone(item);

            var newValue = fn.call(this, item, key);
            _.setAttribute.call(this, key, newValue, silent || false);
        }
    }

    // Can be mixed in later using Stapes.mixinEvents(object);
    var Events = {
        emit: function(types, data){
            data = _.typeOf(data) === 'undefined' ? null : data;

            var splittedTypes = types.split(' '),
                emit = _.emitEvents, handlers = _.eventHandlers,
                e = handlers[-1], eg = handlers[this._guid],
                test = (_.typeOf(this._guid) === 'number')

            for (var i = 0, l = splittedTypes.length; i < l; i++) {
                var type = splittedTypes[i];
                // First 'all' type events: is there an 'all' handler in the global stack?
                if (e.all) emit.call(this, 'all', data, type, -1);

                // Catch all events for this type?
                if (e[type]) emit.call(this, type, data, type, -1);

                if (test){
                    // 'all' event for this specific module?
                    if (eg.all) emit.call(this, 'all', data, type);

                    // Finally, normal events :)
                    if (eg[type]) emit.call(this, type, data);
                }
            }
        },
        off: function(){
            _.removeEventHandler.apply(this, arguments);
        },
        on: function(){
            _.addEventHandler.apply(this, arguments);
        }
    }

    _.Module = function(){}

    _.Module.prototype = {
        countBy: function(fn){
            if (!fn || _.typeOf(fn) !== 'function') return {};

            var arr = {}

            this.each(function(value, key){
                var x = fn.call(this, value, key)

                if (_.has(arr, x)) arr[x]++ 
                else arr[x] = 1;
            });

            return arr
        },
        each: function(fn, ctx){
            var attr = _.attr(this._guid);
            for (var key in attr) fn.call(ctx || this, attr[key], key);
        },
        extend: function(){
            return _.extendThis.apply(this, arguments);
        },
        filter: function(fn){
            var filtered = [], attributes = _.attr(this._guid);

            for (var key in attributes) {
                var value = attributes[key];

                if (fn.call(this, value, key)){
                    // return filtered object with ids (similar to getAllAsArray method)
                    if (_.typeOf(value) === 'object' && !value.id) value.id = key;
                    filtered.push(value);
                }
            }

            return filtered;
        },
        get: function(input){
            if (_.typeOf(input) === 'string') {
                // If there is more than one argument, give back an object, like Underscore's pick()
                if (arguments.length > 1) {
                    var results = {};

                    for (var i = 0, l = arguments.length; i < l; i++) {
                        var key = arguments[i];
                        results[key] = this.get(key);
                    }

                    return results;
                } else {
                    return this.has(input) ? _.attr(this._guid)[input] : null;
                }
            } else if (typeof input === "function") {
                var items = this.filter(input);
                return (items.length) ? items[0] : null;
            }
        },
        getAll: function(){
            return _.clone(_.attr(this._guid));
        },
        getAllAsArray: function(){
            var arr = [],  attributes = _.attr(this._guid);

            for (var key in attributes) {
                var value = attributes[key];

                if (_.typeOf(value) === 'object' && !value.id) value.id = key;
                arr.push(value);
            }

            return arr;
        },
        groupBy: function(fn){
            if (!fn || _.typeOf(fn) !== 'function') return {};

            var arr = {}

            this.each(function(value, key){
                var x = fn.call(this, value, key)

                if (_.has(arr, x)) arr[x].push(value)
                else arr[x] = [value]
            });

            return arr
        },
        has: function(key){
            return (_.typeOf(_.attr(this._guid)[key]) !== 'undefined');
        },
        keys: function(){
            if (Object.keys) return Object.keys(_.attr(this._guid))

            var keys = []

            this.each(function(value, key){ if (key) keys.push(key) });
            return keys;
        },
        map: function(fn, ctx){
            var mapped = [];

            this.each(function(value, key){
                mapped.push(fn.call(ctx || this, value, key));
            }, ctx || this);

            return mapped;
        },
        pluck: function(attr){
            return this.map(function(key, value){
                return key[attr]
            });
        },
        push: function(input, silent){

            if (_.typeOf(input) === 'array') {
                for (var i = 0, l = input.length; i < l; i++){
                    // don't create a unique id if input object has id property
                    var uuid = _.hasId(input[i]);
                    _.setAttribute.call(this, uuid, input[i], silent || false);
                }
            } else {
                var uuid = _.hasId(input);
                _.setAttribute.call(this, uuid, input, silent || false);
            }

            return this;
        },
        remove: function(input, silent) {
            if (_.typeOf(input) === 'undefined'){
                // With no arguments, remove deletes all attributes
                _.attributes[this._guid] = {};
                this.emit('change remove');
            } else if (_.typeOf(input) === 'function'){
                this.each(function(item, key){
                    if (input(item)) _.removeAttribute.call(this, key, silent);
                });
            } else {
                // nb: checking for exists happens in removeAttribute
                _.removeAttribute.call(this, input, silent || false);
            }

            return this;
        },
        set: function(objOrKey, valueOrSilent, silent){
            if (_.typeOf(objOrKey) === 'object') {
                for (var key in objOrKey) {
                    _.setAttribute.call(this, key, objOrKey[key], valueOrSilent || false);
                }
            } else {
                _.setAttribute.call(this, objOrKey, valueOrSilent, silent || false);
            }

            return this;
        },
        size: function(){
            var attr = _.attr(this._guid);
            return attr.length === +attr.length ? attr.length : this.keys().length;
        },
        sortBy: function(fn){
            if (!fn || _.typeOf(fn) !== 'function') return [];

            var map = this.map(function(value, key){
                return {
                    value: value,
                    key: key,
                    criteria: fn.call(this, value, key)
                }
            }).sort(function(l, r){
                var x = l.criteria, y = r.criteria;

                if (x !== y){
                    if (x > y || x === void 0) return 1;
                    if (x < y || y === void 0) return -1;
                }

                return l.index - r.index;
            });

            var arr = []

            for (var i in map){
                var x = map[i], 
                    obj = _.has(x, 'key') ? { key: x.key, value: x.value } : x.value

                arr.push(obj)
            }

            return arr
        },
        update : function(keyOrFn, fn, silent){
            if (_.typeOf(keyOrFn) === 'string'){
                _.updateAttribute.call(this, keyOrFn, fn, silent || false);
            } else if (_.typeOf(keyOrFn) === 'function') {
                this.each(function(value, key){
                    _.updateAttribute.call(this, key, keyOrFn);
                });
            }

            return this;
        }
    }

    var Stapes = {
        _: _, // private helper functions and properties
        extend: function() {
            return _.extendThis.apply(_.Module.prototype, arguments);
        },
        mixinEvents: function(obj) {
            obj = obj || {};
            _.addGuid(obj);

            return _.extend(obj, Events);
        },
        on: function() {
            _.addEventHandler.apply(this, arguments);
        },
        subclass: function(obj, classOnly) {
            classOnly = classOnly || false;
            obj = obj || {};
            obj.superclass = classOnly ? function(){} : _.Module;
            return _.createSubclass(obj, !classOnly);
        },
        version: VERSION
    }

    // This library can be used as an AMD module, a Node.js module, or an
    // old fashioned global
    if (typeof exports !== 'undefined') {
        // Server
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = Stapes;
        }

        exports.Stapes = Stapes;
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(function(){ return Stapes });
    } else {
        // Global scope
        window.Stapes = Stapes;
    }
})();