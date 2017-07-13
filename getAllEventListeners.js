
// get all listeners from element to root of doc.
var getAllEventListeners = function(el) {
  var allListeners = {};
  var listeners;

  function isElement(o) {
    return typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string";
  }
  if (el && isElement(el)) {
    while (el) {
      listeners = getEventListeners(el);
      for (var event in listeners) {
        allListeners[event] = allListeners[event] || [];
        allListeners[event].push({
          listener: listeners[event],
          element: el
        });
      }
      el = el.parentNode;
    }
  }
  return allListeners;
};

// example call:
getAllEventListeners(document.body);
