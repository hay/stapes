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
});