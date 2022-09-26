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

function findListenerIndex(listenerObjects: any, args: any) {
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
  eventTarget: any;
  type: string;
  handler: EventListener;
  nativeAddEventListener: any;
  options: boolean | AddEventListenerOptions | undefined;
};

const listenerObjectsByType: Map<string, ListenerObject[]> = new Map();

["click"].forEach((eventType) => {
  window.addEventListener(
    eventType,
    (event) => {
      const listenerObjects = listenerObjectsByType.get(eventType);
      if (!listenerObjects) return;

      const listenersInCapturing = listenerObjects.filter(
        (listenerObject) => listenerObject.options === true
      );
      const listenersInBubbling = listenerObjects.filter(
        (listenerObject) => !listenerObject.options
      );

      const paths = event.composedPath();
      const isShadowDOM = paths.some((path: any) => path?.shadowRoot);
      if (isShadowDOM) {
        // event.stopImmediatePropagation();
        listenersInCapturing.forEach((listener) => {
          paths.reverse().forEach((path) => {
            listener.handler.call(path, event);
            listener.handler.call(listener.eventTarget, event);
            listener.handler.call(event.target, event);
            listener.handler.call(event.currentTarget, event);
            // listener.nativeAddEventListener.call(
            //   path,
            //   listener.type,
            //   listener.handler,
            //   listener.options
            // );
          });
        });
        listenersInBubbling.forEach((listener) => {
          paths.forEach((path) => {
            // debugger;
            listener.handler.call(path, event);
            listener.handler.call(listener.eventTarget, event);
            listener.handler.call(event.target, event);
            listener.handler.call(event.currentTarget, event);
            // listener.nativeAddEventListener.call(
            //   path,
            //   listener.type,
            //   listener.handler,
            //   listener.options
            // );
          });
        });
        return;
      }

      // The following statements could make no sense
      // because the original DOM is not on the same context for Chrome extension.
      listenersInCapturing.forEach((listener) => {
        listener.handler.call(listener.eventTarget, event);
      });
      listenersInBubbling.forEach((listener) => {
        listener.handler.call(listener.eventTarget, event);
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
      let listenerObjects = listenerObjectsByType.get(args[0]);
      if (!listenerObjects) {
        listenerObjects = [];
        listenerObjectsByType.set(args[0], listenerObjects);
      }

      let listenerIndex = findListenerIndex(listenerObjects, {
        type: args[0],
        handler: args[1],
        options: args[2],
      });
      if (listenerIndex === -1) {
        const listenerObject = {
          eventTarget: this,
          type: args[0],
          handler: args[1],
          options: args[2],
          nativeAddEventListener,
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
      const listenerObjects = listenerObjectsByType.get(args[0]) || [];
      const listenerIndex = findListenerIndex(listenerObjects, {
        type: args[0],
        handler: args[1],
        options: args[2],
      });

      if (listenerIndex !== -1) {
        removeEventListener.call(
          eventTarget,
          args[0],
          listenerObjects[listenerIndex].handler,
          args[2]
        );
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
