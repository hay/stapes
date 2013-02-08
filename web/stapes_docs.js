if (typeof require !== "undefined") { 
    try { 
        var minidocs = require('./minidocs'), Stapes = require('../stapes.js'); 
    } catch(e) { 
        console.log(e); 
    } 
}
var docs = {
  "Stapes": "A (really) tiny Javascript MVC microframework. See also: Stapes.create",
  "create": "DEPRECATED for `subclass`. Create a new instance of a Stapes object. See also: subclass, proto, mixinEvents, extend, on",
  "each": "Iterate over all attributes of a module. Args: function, optional context (default: this module).",
  "emit": "Send event(s) to the module. Args: string eventName(s), optional data.",
  "extend": "Extend your module by giving an object from which to copy attributes. Args: optional context (default=this module), object.",
  "filter": "Iterate over all attributes of a module. Args: function, optional context",
  "get": "Gets an attribute by key. If the item is not available will return null. See also: set, has, getAll. Args: key (string) or filter function.",
  "getAll": "Returns copy of all the attributes of a module as an object. See also: get, getAllAsArray",
  "getAllAsArray": "Returns all attributes as an array. See also: get, getAll. Args: (None).",
  "has": "Checks if a key is available and returns true or false. See also: get, set.",
  "mixinEvents": "Add Stapes event handlers to existing (or new if blank) object. Args: optional object.",
  "off": "Removes event handler(s) from this object. Args: optional string eventType, optional function handler.",
  "on": "Add an event listener triggered by emit. Args: string eventName, function handler, optional context OR object {eventName1: handler1, eventName2: handler2, ...}, optional context.",
  "push": "Sets a value, automatically generates an unique uuid as a key. Args: array or value, optional boolean silent.",
  "remove": "Deletes an attribute. Opposite of `.set(key)`. Args: key or function, optional boolean silent.",
  "set": "Sets an attribute of key to value, triggering an event unless `silent` is true. See also: get, emit. Args: string key, value, optional boolean silent.",
  "size": "Returns the number of attributes in a module.",
  "update": "Updates an attribute with a new value, based on the return value of a function. Args: optional key, function."
  , // new to version 0.7
  "subclass": "Create a new Stapes class that you can instantiate later on with new.",
  "proto": "Adds properties and methods to the prototype of the module."
};

;(function(self,minidocs){
    // minidocs(docs).hits || setTimeout( function() { minidocs(docs); }, 1200 );
    if (typeof Rainbow !== "undefined") { 
        if ("undefined" !== typeof console) console.log("Rainbow.onHighlight"); 
        var count = 0;
        Rainbow.onHighlight(function(code, language) { 
            if ("undefined" !== typeof console) console.log(++count, language, typeof code, code && code.children && code.children.length, typeof code.querySelectorAll); 
            minidocs(docs, code.querySelectorAll ? code.querySelectorAll('span.function,span.method') : '');
        }); 
    } else if ("undefined" !== typeof console) console.log("No Rainbow");
})(this,minidocs);

if (typeof exports === "object") { 
    minidocs(docs, Stapes);
    if (Stapes && Stapes._) minidocs(docs, Stapes._.Module);
    exports.minidocs = minidocs;
    exports.docs = docs;
    exports.Stapes = Stapes;
    exports.help = minidocs.help;
}
