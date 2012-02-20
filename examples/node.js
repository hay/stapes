var Stapes = require('../stapes');

var module = Stapes.create().extend({
    "foo" : true
});

console.log(module.foo);

var module2 = module.create().extend({
    "foo" : false
})

console.log(module2.foo);

console.log(Stapes.create().get());