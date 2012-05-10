var undef;

module("set");

test("change events", function() {
    expect(8);

    var module = Stapes.create();

    module.set('name', 'Johnny');

    module.on({
        'change' : function(key) {
            ok(key === 'name' || key === 'instrument', 'change event when name is set');
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
});

module("update");

test("update", function() {
    var module = Stapes.create();

    module.set('name', 'Johnny');
    module.set('instruments', {
        "vocal" : true,
        "guitar" : true
    });

    module.on('change:name', function(value) {
        ok(value === "Emmylou", "update triggers change namespaced event");
    });

    module.on('change:instruments', function(value) {
        console.log(value);
    });

    module.update('name', function(oldValue) {
        return "Emmylou";
    });

    module.update('instruments', function(oldValue) {
        return {
            "vocal" : true,
            "guitar" : true
        };
    });
});

module("iterators");

test("each with a single object", function() {
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
});

test("context of each() is set to current module", function() {
    var module = Stapes.create();
    module.set('val', true);
    module.push([1,2,3]);
    module.each(function(nr) {
        ok(this === module);
    });
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

test("util.typeof", function() {
    ok(Stapes.util.typeOf( {} ) === "object", "typeof {} = object");
    ok(Stapes.util.typeOf( [] ) === "array", "typeof [] = array");
    ok(Stapes.util.typeOf( function(){} ) === "function", "typeof function(){} = function");
    ok(Stapes.util.typeOf( true ) === "boolean", "typeof true = boolean");
    ok(Stapes.util.typeOf( 1 ) === "number", "typeof 1 = number");
    ok(Stapes.util.typeOf( '' ) === "string", "typeof '' = string");
    ok(Stapes.util.typeOf( null ) === "null", "typeof null = null");
    ok(Stapes.util.typeOf( undefined ) === "undefined", "typeof undefined = undefined");
});