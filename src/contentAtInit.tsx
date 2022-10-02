// react > DOMEventNames.js
const eventTypes = [
  "abort",
  "afterblur",
  "beforeblur",
  "beforeinput",
  "blur",
  "canplay",
  "canplaythrough",
  "cancel",
  "change",
  "click",
  "close",
  "compositionend",
  "compositionstart",
  "compositionupdate",
  "contextmenu",
  "copy",
  "cut",
  "dblclick",
  "auxclick",
  "drag",
  "dragend",
  "dragenter",
  "dragexit",
  "dragleave",
  "dragover",
  "dragstart",
  "drop",
  "durationchange",
  "emptied",
  "encrypted",
  "ended",
  "error",
  "focus",
  "focusin",
  "focusout",
  "fullscreenchange",
  "gotpointercapture",
  "hashchange",
  "input",
  "invalid",
  "keydown",
  "keypress",
  "keyup",
  "load",
  "loadstart",
  "loadeddata",
  "loadedmetadata",
  "lostpointercapture",
  "message",
  "mousedown",
  "mouseenter",
  "mouseleave",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "paste",
  "pause",
  "play",
  "playing",
  "pointercancel",
  "pointerdown",
  "pointerenter",
  "pointerleave",
  "pointermove",
  "pointerout",
  "pointerover",
  "pointerup",
  "popstate",
  "progress",
  "ratechange",
  "reset",
  "resize",
  "scroll",
  "seeked",
  "seeking",
  "select",
  "selectstart",
  "selectionchange",
  "stalled",
  "submit",
  "suspend",
  "textInput",
  "timeupdate",
  "toggle",
  "touchcancel",
  "touchend",
  "touchmove",
  "touchstart",
  "volumechange",
  "waiting",
  "wheel",
];

function findListenerIndex(listenerObjects: ListenerObject[], args: any) {
  for (var i = 0; i < listenerObjects.length; i++) {
    if (
      deepEqual(
        {
          type: listenerObjects[i].type,
          handler: listenerObjects[i].handler,
          options: listenerObjects[i].options,
        },
        args
      )
    ) {
      return i;
    }
  }
  return -1;
}

type ListenerObject = {
  type: string;
  handler: EventListener;
  options: boolean | AddEventListenerOptions | undefined;
};

type ListenerObjectByEventTarget = Map<EventTarget, ListenerObject[]>;
type ListenerObjectByType = Map<string, ListenerObjectByEventTarget>;

const listenerObjectsByType: ListenerObjectByType = new Map();

function AdaptedEvent(event: Event) {
  // TODO: shadowDOMの中かどうかによってtargetを正しく変える
  const newTarget = event.composedPath()[0];
  return {
    get: (target: Event, prop: keyof Event) => {
      const property = target[prop];
      if (typeof property === "function") {
        return property.bind(event);
      } else if (prop === "target") {
        return newTarget ? newTarget : event.target;
      }
      return target[prop];
    },
  };
}

eventTypes.forEach((eventType) => {
  window.addEventListener(
    eventType,
    (event) => {
      const listenerObjects = listenerObjectsByType.get(eventType);
      if (!listenerObjects) return;

      const paths = event.composedPath();
      const isShadowDOM = paths.some((path: any) => path?.shadowRoot);
      if (!isShadowDOM) return;
      event.stopImmediatePropagation();
      // const proxyEvent = new Proxy(event, new AdaptedEvent(event));
      const proxyEvent = new Proxy(event, new (AdaptedEvent as any)(event));
      [...paths].reverse().forEach((path) => {
        listenerObjects
          .get(path)
          ?.filter(
            (listenerObject) =>
              listenerObject.options === true ||
              (typeof listenerObject.options === "object" &&
                listenerObject.options.capture)
          )
          .forEach((listener) => {
            listener.handler.call(path, proxyEvent);
          });
      });
      paths.forEach((path) => {
        listenerObjects
          .get(path)
          ?.filter(
            (listenerObject) =>
              !listenerObject.options ||
              (typeof listenerObject.options === "object" &&
                !listenerObject.options.capture)
          )
          .forEach((listener) => {
            listener.handler.call(path, proxyEvent);
          });
      });
    },
    true
  );
});

[window, document, Element.prototype, EventTarget.prototype].forEach(
  (eventTarget) => {
    const nativeAddEventListener = eventTarget.addEventListener;
    const nativeRemoveEventListener = eventTarget.removeEventListener;
    eventTarget.addEventListener = function (
      ...args: [
        string,
        EventListener,
        boolean | AddEventListenerOptions | undefined
      ]
    ) {
      if (!eventTypes.includes(args[0])) {
        return nativeAddEventListener.call(this, ...args);
      }
      let listenerObjectsByEventTarget = listenerObjectsByType.get(args[0]);
      if (!listenerObjectsByEventTarget) {
        listenerObjectsByEventTarget = new Map();
        listenerObjectsByType.set(args[0], listenerObjectsByEventTarget);
      }

      let listenerObjects = listenerObjectsByEventTarget.get(this);
      if (!listenerObjects) {
        listenerObjects = [];
        listenerObjectsByEventTarget.set(this, listenerObjects);
      }

      let listenerIndex = findListenerIndex(listenerObjects, {
        type: args[0],
        handler: args[1],
        options: args[2],
      });
      if (listenerIndex === -1) {
        const listenerObject = {
          type: args[0],
          handler: args[1],
          options: args[2],
        };
        listenerObjects.push(listenerObject);
      }
    };

    eventTarget.removeEventListener = function (
      ...args: [
        string,
        EventListener,
        boolean | AddEventListenerOptions | undefined
      ]
    ) {
      if (!eventTypes.includes(args[0])) {
        return nativeRemoveEventListener.call(this, ...args);
      }
      const listenerObjectsByEventTarget = listenerObjectsByType.get(args[0]);
      if (!listenerObjectsByEventTarget) return;
      const listenerObjects = listenerObjectsByEventTarget.get(this);
      if (!listenerObjects) return;
      const listenerIndex = findListenerIndex(listenerObjects, {
        type: args[0],
        handler: args[1],
        options: args[2],
      });
      if (listenerIndex !== -1) {
        listenerObjects.splice(listenerIndex, 1);
      }
    };
  }
);

function deepEqual(obj1: any, obj2: any) {
  if (obj1 === obj2) {
    return true;
  } else if (isObject(obj1) && isObject(obj2)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (var prop in obj1) {
      if (!deepEqual(obj1[prop], obj2[prop])) {
        return false;
      }
    }
    return true;
  }
  function isObject(obj: unknown) {
    if (typeof obj === "object" && obj != null) {
      return true;
    } else {
      return false;
    }
  }
}

function contains(node: any, targetNode: any) {
  if (node.contains) return node.contains(targetNode);
  var el = targetNode;

  while (el) {
    if (el === node) return true;
    el = el.parentNode;
  }

  return false;
}
