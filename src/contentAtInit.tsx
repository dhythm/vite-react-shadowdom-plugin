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
  type: string;
  handler: EventListener;
  _handler: EventListener;
  options: boolean | AddEventListenerOptions | undefined;
  self: any;
};

const listenerObjectsByType: Map<string, ListenerObject[]> = new Map();

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

["click"].forEach((eventType) => {
  window.addEventListener(
    eventType,
    (e) => {
      console.count(eventType);
      const listenerObjects = listenerObjectsByType.get(eventType);
      const listenersCapturing =
        listenerObjects?.filter((v) => v.options === true) ?? [];
      listenersCapturing.forEach((listener) => {
        listener.handler.call(listener.self, e);
      });
      const listenersBubbling =
        listenerObjects?.filter((v) => !v.options) ?? [];
      listenersBubbling.forEach((listener) => {
        listener.handler.call(listener.self, e);
      });
    },
    true
  );
});

[window, document, Element.prototype, EventTarget.prototype].forEach(
  (eventTarget) => {
    const target = document.getElementById("crx-root");

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
        const _handler = function _handler(event: any) {
          if (
            event.eventPhase === event.CAPTURING_PHASE &&
            target &&
            contains(target, event.target)
          ) {
            return;
          }
          if (event.isTrusted) {
            // const paths = event.composedPath();
            // const isShadowDOM = paths.some((path: any) => path?.shadowRoot);
            // if (isShadowDOM) {
            //   event.stopImmediatePropagation();
            //   const listenerObjects: {
            //     type: string;
            //     handler: EventListener;
            //     options: boolean | AddEventListenerOptions | undefined;
            //     _handler: EventListener;
            //   }[] = listenerObjectsByType.get(event.type);
            //   const listenerBubbling = listenerObjects.find((v) => !v.options);
            //   listenerBubbling?.handler(event);
            //   return;
            // }
            // args[1].call(event.currentTarget, event);
          }
          args[1].call(event.currentTarget, event);
        };

        // nativeAddEventListener.call(this, args[0], _handler, args[2]);

        const listenerObject = {
          type: args[0],
          handler: args[1],
          options: args[2],
          _handler,
          self: this,
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
          listenerObjects[listenerIndex]._handler,
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
