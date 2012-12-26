if (typeof require !== "undefined") minidocs = require('./minidocs');
var docs = {
  "Stapes": "A (really) tiny Javascript MVC microframework. See also: Stapes.create",
  "create": "Create a new instance of a Stapes object. See also: mixinEvents, extend, on",
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
}
minidocs(docs).hits || setTimeout( function() { minidocs(docs); }, 500 );
if (typeof exports === "object") { exports.minidocs = minidocs, exports.docs = docs }
