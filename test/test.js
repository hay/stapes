var undef;

// Some shims for IE
if (!Object.keys) {
    Object.keys = function(obj) {
        var arr = [];
        for (var key in obj) {
            arr.push(key);
        }

        return arr;
    };
}

module("set");

test("change events", function() {
    expect(8);

    var module = Stapes.create();

    module.set('name', 'Johnny');

    module.on({
        'change' : function(key) {
            ok(key === 'name' || key === 'instrument', 'change event when name is set');
            if (key === "silent") {
                ok(false, "Silent event should not trigger");
            }
        },

        'change:silent' : function(key) {
            ok(false, "Silent event should not trigger");
        },

        'change:name' : function(value) {
            equal(value, 'Emmylou', 'name attribute changed');
        },

        'mutate' : function(value) {
            ok(
                value.key !== undef && value.newValue !== undef && value.oldValue !== undef,
                "mutate event throws a lot of extra info"
            );
        },

        'mutate:name' : function(value) {
            deepEqual(
                value,
                {
                    key : "name",
                    newValue : "Emmylou",
                    oldValue : "Johnny"
                },
                "mutate namespaed event throws a lot of extra info"
            );
        },

        'create' : function(key) {
            equal(key, 'instrument', 'create event on attribute addition');
        },

        'update' : function(key) {
            equal(key, 'name', 'Name was updated');
        }
    });

    module.set('name', 'Emmylou');
    module.set('instrument', 'guitar');
    module.set('instrument', 'guitar'); // Change event should only be thrown once!
    module.set('silent', 'silent', true); // silent events should not trigger anything
});

module("update");

test("update", function() {
    var module = Stapes.create();

    module.set('name', 'Johnny');
    module.set('instruments', {
        "vocal" : true,
        "guitar" : true
    });
    module.set('silent', true);

    module.on('change:name', function(value) {
        ok(value === "Emmylou", "update triggers change namespaced event");
    });

    module.on('change:silent', function() {
        ok(false, "silent flag should not trigger any events");
    });

    module.update('name', function(oldValue) {
        return "Emmylou";
    });

    module.update('instruments', function(oldValue, key) {
        ok(this === module, "this should refer to the module being updated");
        ok(key === "instruments", "second argument of update should be original key");

        return {
            "vocal" : true,
            "guitar" : true
        };
    });

    module.update('silent', function(val) {
        return "silent";
    }, true /* silent flag */);
});

module("remove");

test("remove", function() {
    var module = Stapes.create();
    module.set('foo', 'bar');
    module.set('silent', 'silent');
    module.set({
        'remove1' : true,
        'remove2' : true
    });

    function isKey(key) {
        return (key === 'foo' || key === 'remove1' || key === 'remove2');
    }

    module.on({
        'change': function( key ){
            ok(isKey(key), 'change event with key of attribute');
        },

        'change:foo': function(key, e){
            ok(e.type === 'change:foo', 'change:key event');
        },

        'remove': function( key ){
            ok(isKey(key), 'remove event with key of attribute');
        },

        'remove:foo': function(key, e){
            ok(e.type === 'remove:foo', 'change:key event');
        },

        'remove:silent' : function() {
            ok(false, 'silent event should not trigger');
        }
    });

    module.remove('foo');
    module.remove('silent', true); // should not trigger because of silent flag
    module.remove('  remove1   remove2'); // note the extra spaces to FU the parser :)
    ok(module.size() === 0, 'all attributes should be removed');
})

module("iterators");

test("each and map with a single object", function() {
    var module = Stapes.create();
    module.set({
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3'
    });

    var values = [];
    var keys = [];
    module.each(function(value, key) {
        values.push(value);
        keys.push(key);
    });
    deepEqual(values, ['value1', 'value2', 'value3'], "iterates over values");
    deepEqual(keys, ['key1', 'key2', 'key3'], "and keys");

    var newList = module.map(function(value, key) {
        return value + ':' + key;
    });

    deepEqual(newList, ['value1:key1', 'value2:key2', 'value3:key3'], "map() should return an array of new items");
});

test("context of each() is set to current module", function() {
    var module = Stapes.create();
    var module2 = Stapes.create();

    module.push(1);

    module.each(function() {
        ok(this === module, "each should have context of module set");
    });

    module.map(function() {
        ok(this === module, "map should have context of module set");
    });

    module.each(function() {
        ok(this === module2, "context of each should be overwritable");
    }, module2);

    module.map(function() {
        ok(this === module2, "context of map should be overwritable");
    }, module2);
});

test("each with an array", function() {
    var module = Stapes.create();
    module.push([
       'value1',
       'value2',
       'value3'
    ]);

    var values = [];
    module.each(function(value, key) {
        values.push(value);
    });
    deepEqual(values, ['value1', 'value2', 'value3'], "iterates over values");
});

test("filter", function() {
    var module = Stapes.create();
    module.set({
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3'
    });
    var module2 = Stapes.create().set('key', 'value');

    module2.filter(function(value, key) {
        ok(value === "value", "Value should be value");
        ok(key === "key", "Key should be the second argument");
    });

    var values = [];
    module.filter(function(value) {
        values.push(value);
    });
    deepEqual(values, ['value1', 'value2', 'value3'], "iterates over values");

    var filtered = module.filter(function(value) {
        return value == 'value1';
    });
    deepEqual(filtered, ['value1'], "returns one item");

    filtered = module.filter(function(value) {
        return value == 'value1' || value == 'value2';
    });
    deepEqual(filtered, ['value1', 'value2'], "returns several items");

    filtered = module.filter(function(value) {
        return value == 'nonexistent';
    });
    deepEqual(filtered, [], "when does not matches anything returns an empty array");
});

test("_.typeof", function() {
    ok(Stapes._.typeOf( {} ) === "object", "typeof {} = object");
    ok(Stapes._.typeOf( [] ) === "array", "typeof [] = array");
    ok(Stapes._.typeOf( function(){} ) === "function", "typeof function(){} = function");
    ok(Stapes._.typeOf( true ) === "boolean", "typeof true = boolean");
    ok(Stapes._.typeOf( 1 ) === "number", "typeof 1 = number");
    ok(Stapes._.typeOf( '' ) === "string", "typeof '' = string");
    ok(Stapes._.typeOf( null ) === "null", "typeof null = null");
    ok(Stapes._.typeOf( undefined ) === "undefined", "typeof undefined = undefined");
});

module("events");

test("off", function() {
    var module = Stapes.create();

    var handler = function(){};

    module.on({
        "foo" : handler,
        "bar" : function(){}
    });

    var events = Stapes._.eventHandlers[module._guid];

    ok(Object.keys(events).length === 2, "Event handlers are set");

    module.off("foo", handler);

    ok(!events.foo.length, "foo handler removed");

    module.off("bar");

    ok(!events.bar, "bar handler removed");

    module.off();

    ok(Object.keys(Stapes._.eventHandlers[module._guid]).length === 0, "no handlers for module");
});

test("Stapes.mixinEvents", function() {
    ok(typeof Stapes.mixinEvents() === "object", "Stapes.mixinEvents() without any arguments should return an object");

    var F = function() {
        Stapes.mixinEvents(this);
    }

    var f = new F();

    ok(typeof f.on === "function", "mixinEvents should add 'on' to a newly created class");

    var g = new F();

    ok(f._guid !== g._guid, "_guid of two newly created objects should not be the same");

    Stapes.on('foo', function(data, e) {
        ok(e.type === "foo", "Check if local events bubble through the Stapes object");
    });

    g.emit('foo');
});

test("event scope", function() {
    var module1 = Stapes.create();
    var module2 = Stapes.create();
    var firstDone = false;

    module1.on('eventscope', function(data, e) {
        ok(e.scope === module1, "Scope of event should be the emitting model");
    });

    module2.on('eventscope', function(data, e) {
        ok(e.scope === module2, "Scope of event should be the emitting model");
    });

    Stapes.on('eventscope', function(data, e) {
        if (firstDone) {
            ok(e.scope !== module1, "Scope of event from global Stapes object should not be the mixed with other models");
            ok(e.scope === module2, "Scope of event from global Stapes object should be the emitting model");
        } else {
            ok(e.scope === module1, "Scope of event from global Stapes object should be the emitting model");
            firstDone = true;
        }
    });

    Stapes.on('all', function(data, e) {
        if (e.type === "eventscope") {
            // Prevent other events from other tests getting here
            ok(e.scope === module1 || e.scope === module2, "Scope event from on 'all' handler on Stapes.on should be emitting model");
        }
    });

    module1.emit('eventscope');
    module2.emit('eventscope');
});

test("events on subclasses", function() {
    expect(3);

    var Parent = Stapes.subclass({
        constructor : function(id) {
            this.id = id;
        },

        getId : function() {
            this.emit('id', this.id);
        }
    });

    var Child = Parent.subclass({
        constructor : Parent.prototype.constructor
    });

    var parent = new Parent('parent');
    var parent2 = new Parent('parent2');
    var child = new Child('child');

    parent.on('id', function(id) {
        ok(id === 'parent', 'id of parent should be parent');
    });

    parent2.on('id', function(id) {
        ok(id === 'parent2', 'id of parent2 should be parent2');
    });

    child.on('id', function(id) {
        ok(id === 'child', 'id of child should be child');
    });

    parent.getId();
    parent2.getId();
    child.getId();
});

test("chaining", function() {
    var module = Stapes.create().set('foo', true);
    ok(!!module.get && module.get('foo'), "set() should return the object");
    module = module.update('foo', function() { return true; });
    ok(!!module.get && module.get('foo'), "update() should return the object");
    module  = module.remove('foo');
    ok(!!module.get && module.get('foo') === null, "remove() should return the object");
    module = module.push(true);
    ok(!!module.get && module.size() === 1, "push() should return the object");
});