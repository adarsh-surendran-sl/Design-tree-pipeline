var Ev = Object.defineProperty;
var xv = (n, i, s) => i in n ? Ev(n, i, { enumerable: !0, configurable: !0, writable: !0, value: s }) : n[i] = s;
var Ne = (n, i, s) => xv(n, typeof i != "symbol" ? i + "" : i, s);
function Cv(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default") ? n.default : n;
}
var Ra = { exports: {} }, Wo = {}, Ta = { exports: {} }, xe = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var lf;
function kv() {
  if (lf) return xe;
  lf = 1;
  var n = Symbol.for("react.element"), i = Symbol.for("react.portal"), s = Symbol.for("react.fragment"), a = Symbol.for("react.strict_mode"), d = Symbol.for("react.profiler"), f = Symbol.for("react.provider"), h = Symbol.for("react.context"), p = Symbol.for("react.forward_ref"), m = Symbol.for("react.suspense"), g = Symbol.for("react.memo"), w = Symbol.for("react.lazy"), y = Symbol.iterator;
  function x(T) {
    return T === null || typeof T != "object" ? null : (T = y && T[y] || T["@@iterator"], typeof T == "function" ? T : null);
  }
  var R = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, k = Object.assign, S = {};
  function I(T, O, G) {
    this.props = T, this.context = O, this.refs = S, this.updater = G || R;
  }
  I.prototype.isReactComponent = {}, I.prototype.setState = function(T, O) {
    if (typeof T != "object" && typeof T != "function" && T != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, T, O, "setState");
  }, I.prototype.forceUpdate = function(T) {
    this.updater.enqueueForceUpdate(this, T, "forceUpdate");
  };
  function L() {
  }
  L.prototype = I.prototype;
  function D(T, O, G) {
    this.props = T, this.context = O, this.refs = S, this.updater = G || R;
  }
  var M = D.prototype = new L();
  M.constructor = D, k(M, I.prototype), M.isPureReactComponent = !0;
  var P = Array.isArray, _ = Object.prototype.hasOwnProperty, $ = { current: null }, A = { key: !0, ref: !0, __self: !0, __source: !0 };
  function U(T, O, G) {
    var oe, ne = {}, de = null, he = null;
    if (O != null) for (oe in O.ref !== void 0 && (he = O.ref), O.key !== void 0 && (de = "" + O.key), O) _.call(O, oe) && !A.hasOwnProperty(oe) && (ne[oe] = O[oe]);
    var ve = arguments.length - 2;
    if (ve === 1) ne.children = G;
    else if (1 < ve) {
      for (var Se = Array(ve), Re = 0; Re < ve; Re++) Se[Re] = arguments[Re + 2];
      ne.children = Se;
    }
    if (T && T.defaultProps) for (oe in ve = T.defaultProps, ve) ne[oe] === void 0 && (ne[oe] = ve[oe]);
    return { $$typeof: n, type: T, key: de, ref: he, props: ne, _owner: $.current };
  }
  function H(T, O) {
    return { $$typeof: n, type: T.type, key: O, ref: T.ref, props: T.props, _owner: T._owner };
  }
  function K(T) {
    return typeof T == "object" && T !== null && T.$$typeof === n;
  }
  function Q(T) {
    var O = { "=": "=0", ":": "=2" };
    return "$" + T.replace(/[=:]/g, function(G) {
      return O[G];
    });
  }
  var q = /\/+/g;
  function ee(T, O) {
    return typeof T == "object" && T !== null && T.key != null ? Q("" + T.key) : O.toString(36);
  }
  function re(T, O, G, oe, ne) {
    var de = typeof T;
    (de === "undefined" || de === "boolean") && (T = null);
    var he = !1;
    if (T === null) he = !0;
    else switch (de) {
      case "string":
      case "number":
        he = !0;
        break;
      case "object":
        switch (T.$$typeof) {
          case n:
          case i:
            he = !0;
        }
    }
    if (he) return he = T, ne = ne(he), T = oe === "" ? "." + ee(he, 0) : oe, P(ne) ? (G = "", T != null && (G = T.replace(q, "$&/") + "/"), re(ne, O, G, "", function(Re) {
      return Re;
    })) : ne != null && (K(ne) && (ne = H(ne, G + (!ne.key || he && he.key === ne.key ? "" : ("" + ne.key).replace(q, "$&/") + "/") + T)), O.push(ne)), 1;
    if (he = 0, oe = oe === "" ? "." : oe + ":", P(T)) for (var ve = 0; ve < T.length; ve++) {
      de = T[ve];
      var Se = oe + ee(de, ve);
      he += re(de, O, G, Se, ne);
    }
    else if (Se = x(T), typeof Se == "function") for (T = Se.call(T), ve = 0; !(de = T.next()).done; ) de = de.value, Se = oe + ee(de, ve++), he += re(de, O, G, Se, ne);
    else if (de === "object") throw O = String(T), Error("Objects are not valid as a React child (found: " + (O === "[object Object]" ? "object with keys {" + Object.keys(T).join(", ") + "}" : O) + "). If you meant to render a collection of children, use an array instead.");
    return he;
  }
  function ie(T, O, G) {
    if (T == null) return T;
    var oe = [], ne = 0;
    return re(T, oe, "", "", function(de) {
      return O.call(G, de, ne++);
    }), oe;
  }
  function ue(T) {
    if (T._status === -1) {
      var O = T._result;
      O = O(), O.then(function(G) {
        (T._status === 0 || T._status === -1) && (T._status = 1, T._result = G);
      }, function(G) {
        (T._status === 0 || T._status === -1) && (T._status = 2, T._result = G);
      }), T._status === -1 && (T._status = 0, T._result = O);
    }
    if (T._status === 1) return T._result.default;
    throw T._result;
  }
  var W = { current: null }, F = { transition: null }, J = { ReactCurrentDispatcher: W, ReactCurrentBatchConfig: F, ReactCurrentOwner: $ };
  function B() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return xe.Children = { map: ie, forEach: function(T, O, G) {
    ie(T, function() {
      O.apply(this, arguments);
    }, G);
  }, count: function(T) {
    var O = 0;
    return ie(T, function() {
      O++;
    }), O;
  }, toArray: function(T) {
    return ie(T, function(O) {
      return O;
    }) || [];
  }, only: function(T) {
    if (!K(T)) throw Error("React.Children.only expected to receive a single React element child.");
    return T;
  } }, xe.Component = I, xe.Fragment = s, xe.Profiler = d, xe.PureComponent = D, xe.StrictMode = a, xe.Suspense = m, xe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = J, xe.act = B, xe.cloneElement = function(T, O, G) {
    if (T == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + T + ".");
    var oe = k({}, T.props), ne = T.key, de = T.ref, he = T._owner;
    if (O != null) {
      if (O.ref !== void 0 && (de = O.ref, he = $.current), O.key !== void 0 && (ne = "" + O.key), T.type && T.type.defaultProps) var ve = T.type.defaultProps;
      for (Se in O) _.call(O, Se) && !A.hasOwnProperty(Se) && (oe[Se] = O[Se] === void 0 && ve !== void 0 ? ve[Se] : O[Se]);
    }
    var Se = arguments.length - 2;
    if (Se === 1) oe.children = G;
    else if (1 < Se) {
      ve = Array(Se);
      for (var Re = 0; Re < Se; Re++) ve[Re] = arguments[Re + 2];
      oe.children = ve;
    }
    return { $$typeof: n, type: T.type, key: ne, ref: de, props: oe, _owner: he };
  }, xe.createContext = function(T) {
    return T = { $$typeof: h, _currentValue: T, _currentValue2: T, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, T.Provider = { $$typeof: f, _context: T }, T.Consumer = T;
  }, xe.createElement = U, xe.createFactory = function(T) {
    var O = U.bind(null, T);
    return O.type = T, O;
  }, xe.createRef = function() {
    return { current: null };
  }, xe.forwardRef = function(T) {
    return { $$typeof: p, render: T };
  }, xe.isValidElement = K, xe.lazy = function(T) {
    return { $$typeof: w, _payload: { _status: -1, _result: T }, _init: ue };
  }, xe.memo = function(T, O) {
    return { $$typeof: g, type: T, compare: O === void 0 ? null : O };
  }, xe.startTransition = function(T) {
    var O = F.transition;
    F.transition = {};
    try {
      T();
    } finally {
      F.transition = O;
    }
  }, xe.unstable_act = B, xe.useCallback = function(T, O) {
    return W.current.useCallback(T, O);
  }, xe.useContext = function(T) {
    return W.current.useContext(T);
  }, xe.useDebugValue = function() {
  }, xe.useDeferredValue = function(T) {
    return W.current.useDeferredValue(T);
  }, xe.useEffect = function(T, O) {
    return W.current.useEffect(T, O);
  }, xe.useId = function() {
    return W.current.useId();
  }, xe.useImperativeHandle = function(T, O, G) {
    return W.current.useImperativeHandle(T, O, G);
  }, xe.useInsertionEffect = function(T, O) {
    return W.current.useInsertionEffect(T, O);
  }, xe.useLayoutEffect = function(T, O) {
    return W.current.useLayoutEffect(T, O);
  }, xe.useMemo = function(T, O) {
    return W.current.useMemo(T, O);
  }, xe.useReducer = function(T, O, G) {
    return W.current.useReducer(T, O, G);
  }, xe.useRef = function(T) {
    return W.current.useRef(T);
  }, xe.useState = function(T) {
    return W.current.useState(T);
  }, xe.useSyncExternalStore = function(T, O, G) {
    return W.current.useSyncExternalStore(T, O, G);
  }, xe.useTransition = function() {
    return W.current.useTransition();
  }, xe.version = "18.3.1", xe;
}
var cf;
function qa() {
  return cf || (cf = 1, Ta.exports = kv()), Ta.exports;
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var df;
function Pv() {
  if (df) return Wo;
  df = 1;
  var n = qa(), i = Symbol.for("react.element"), s = Symbol.for("react.fragment"), a = Object.prototype.hasOwnProperty, d = n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, f = { key: !0, ref: !0, __self: !0, __source: !0 };
  function h(p, m, g) {
    var w, y = {}, x = null, R = null;
    g !== void 0 && (x = "" + g), m.key !== void 0 && (x = "" + m.key), m.ref !== void 0 && (R = m.ref);
    for (w in m) a.call(m, w) && !f.hasOwnProperty(w) && (y[w] = m[w]);
    if (p && p.defaultProps) for (w in m = p.defaultProps, m) y[w] === void 0 && (y[w] = m[w]);
    return { $$typeof: i, type: p, key: x, ref: R, props: y, _owner: d.current };
  }
  return Wo.Fragment = s, Wo.jsx = h, Wo.jsxs = h, Wo;
}
var ff;
function Rv() {
  return ff || (ff = 1, Ra.exports = Pv()), Ra.exports;
}
var E = Rv(), c = qa();
const ge = /* @__PURE__ */ Cv(c);
var ps = {}, ba = { exports: {} }, St = {}, Ia = { exports: {} }, Na = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var mf;
function Tv() {
  return mf || (mf = 1, (function(n) {
    function i(F, J) {
      var B = F.length;
      F.push(J);
      e: for (; 0 < B; ) {
        var T = B - 1 >>> 1, O = F[T];
        if (0 < d(O, J)) F[T] = J, F[B] = O, B = T;
        else break e;
      }
    }
    function s(F) {
      return F.length === 0 ? null : F[0];
    }
    function a(F) {
      if (F.length === 0) return null;
      var J = F[0], B = F.pop();
      if (B !== J) {
        F[0] = B;
        e: for (var T = 0, O = F.length, G = O >>> 1; T < G; ) {
          var oe = 2 * (T + 1) - 1, ne = F[oe], de = oe + 1, he = F[de];
          if (0 > d(ne, B)) de < O && 0 > d(he, ne) ? (F[T] = he, F[de] = B, T = de) : (F[T] = ne, F[oe] = B, T = oe);
          else if (de < O && 0 > d(he, B)) F[T] = he, F[de] = B, T = de;
          else break e;
        }
      }
      return J;
    }
    function d(F, J) {
      var B = F.sortIndex - J.sortIndex;
      return B !== 0 ? B : F.id - J.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var f = performance;
      n.unstable_now = function() {
        return f.now();
      };
    } else {
      var h = Date, p = h.now();
      n.unstable_now = function() {
        return h.now() - p;
      };
    }
    var m = [], g = [], w = 1, y = null, x = 3, R = !1, k = !1, S = !1, I = typeof setTimeout == "function" ? setTimeout : null, L = typeof clearTimeout == "function" ? clearTimeout : null, D = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function M(F) {
      for (var J = s(g); J !== null; ) {
        if (J.callback === null) a(g);
        else if (J.startTime <= F) a(g), J.sortIndex = J.expirationTime, i(m, J);
        else break;
        J = s(g);
      }
    }
    function P(F) {
      if (S = !1, M(F), !k) if (s(m) !== null) k = !0, ue(_);
      else {
        var J = s(g);
        J !== null && W(P, J.startTime - F);
      }
    }
    function _(F, J) {
      k = !1, S && (S = !1, L(U), U = -1), R = !0;
      var B = x;
      try {
        for (M(J), y = s(m); y !== null && (!(y.expirationTime > J) || F && !Q()); ) {
          var T = y.callback;
          if (typeof T == "function") {
            y.callback = null, x = y.priorityLevel;
            var O = T(y.expirationTime <= J);
            J = n.unstable_now(), typeof O == "function" ? y.callback = O : y === s(m) && a(m), M(J);
          } else a(m);
          y = s(m);
        }
        if (y !== null) var G = !0;
        else {
          var oe = s(g);
          oe !== null && W(P, oe.startTime - J), G = !1;
        }
        return G;
      } finally {
        y = null, x = B, R = !1;
      }
    }
    var $ = !1, A = null, U = -1, H = 5, K = -1;
    function Q() {
      return !(n.unstable_now() - K < H);
    }
    function q() {
      if (A !== null) {
        var F = n.unstable_now();
        K = F;
        var J = !0;
        try {
          J = A(!0, F);
        } finally {
          J ? ee() : ($ = !1, A = null);
        }
      } else $ = !1;
    }
    var ee;
    if (typeof D == "function") ee = function() {
      D(q);
    };
    else if (typeof MessageChannel < "u") {
      var re = new MessageChannel(), ie = re.port2;
      re.port1.onmessage = q, ee = function() {
        ie.postMessage(null);
      };
    } else ee = function() {
      I(q, 0);
    };
    function ue(F) {
      A = F, $ || ($ = !0, ee());
    }
    function W(F, J) {
      U = I(function() {
        F(n.unstable_now());
      }, J);
    }
    n.unstable_IdlePriority = 5, n.unstable_ImmediatePriority = 1, n.unstable_LowPriority = 4, n.unstable_NormalPriority = 3, n.unstable_Profiling = null, n.unstable_UserBlockingPriority = 2, n.unstable_cancelCallback = function(F) {
      F.callback = null;
    }, n.unstable_continueExecution = function() {
      k || R || (k = !0, ue(_));
    }, n.unstable_forceFrameRate = function(F) {
      0 > F || 125 < F ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : H = 0 < F ? Math.floor(1e3 / F) : 5;
    }, n.unstable_getCurrentPriorityLevel = function() {
      return x;
    }, n.unstable_getFirstCallbackNode = function() {
      return s(m);
    }, n.unstable_next = function(F) {
      switch (x) {
        case 1:
        case 2:
        case 3:
          var J = 3;
          break;
        default:
          J = x;
      }
      var B = x;
      x = J;
      try {
        return F();
      } finally {
        x = B;
      }
    }, n.unstable_pauseExecution = function() {
    }, n.unstable_requestPaint = function() {
    }, n.unstable_runWithPriority = function(F, J) {
      switch (F) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          F = 3;
      }
      var B = x;
      x = F;
      try {
        return J();
      } finally {
        x = B;
      }
    }, n.unstable_scheduleCallback = function(F, J, B) {
      var T = n.unstable_now();
      switch (typeof B == "object" && B !== null ? (B = B.delay, B = typeof B == "number" && 0 < B ? T + B : T) : B = T, F) {
        case 1:
          var O = -1;
          break;
        case 2:
          O = 250;
          break;
        case 5:
          O = 1073741823;
          break;
        case 4:
          O = 1e4;
          break;
        default:
          O = 5e3;
      }
      return O = B + O, F = { id: w++, callback: J, priorityLevel: F, startTime: B, expirationTime: O, sortIndex: -1 }, B > T ? (F.sortIndex = B, i(g, F), s(m) === null && F === s(g) && (S ? (L(U), U = -1) : S = !0, W(P, B - T))) : (F.sortIndex = O, i(m, F), k || R || (k = !0, ue(_))), F;
    }, n.unstable_shouldYield = Q, n.unstable_wrapCallback = function(F) {
      var J = x;
      return function() {
        var B = x;
        x = J;
        try {
          return F.apply(this, arguments);
        } finally {
          x = B;
        }
      };
    };
  })(Na)), Na;
}
var pf;
function bv() {
  return pf || (pf = 1, Ia.exports = Tv()), Ia.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var hf;
function Iv() {
  if (hf) return St;
  hf = 1;
  var n = qa(), i = bv();
  function s(e) {
    for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, r = 1; r < arguments.length; r++) t += "&args[]=" + encodeURIComponent(arguments[r]);
    return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var a = /* @__PURE__ */ new Set(), d = {};
  function f(e, t) {
    h(e, t), h(e + "Capture", t);
  }
  function h(e, t) {
    for (d[e] = t, e = 0; e < t.length; e++) a.add(t[e]);
  }
  var p = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), m = Object.prototype.hasOwnProperty, g = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, w = {}, y = {};
  function x(e) {
    return m.call(y, e) ? !0 : m.call(w, e) ? !1 : g.test(e) ? y[e] = !0 : (w[e] = !0, !1);
  }
  function R(e, t, r, o) {
    if (r !== null && r.type === 0) return !1;
    switch (typeof t) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return o ? !1 : r !== null ? !r.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
      default:
        return !1;
    }
  }
  function k(e, t, r, o) {
    if (t === null || typeof t > "u" || R(e, t, r, o)) return !0;
    if (o) return !1;
    if (r !== null) switch (r.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
    return !1;
  }
  function S(e, t, r, o, u, l, v) {
    this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = o, this.attributeNamespace = u, this.mustUseProperty = r, this.propertyName = e, this.type = t, this.sanitizeURL = l, this.removeEmptyString = v;
  }
  var I = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
    I[e] = new S(e, 0, !1, e, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
    var t = e[0];
    I[t] = new S(t, 1, !1, e[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
    I[e] = new S(e, 2, !1, e.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
    I[e] = new S(e, 2, !1, e, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
    I[e] = new S(e, 3, !1, e.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(e) {
    I[e] = new S(e, 3, !0, e, null, !1, !1);
  }), ["capture", "download"].forEach(function(e) {
    I[e] = new S(e, 4, !1, e, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(e) {
    I[e] = new S(e, 6, !1, e, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(e) {
    I[e] = new S(e, 5, !1, e.toLowerCase(), null, !1, !1);
  });
  var L = /[\-:]([a-z])/g;
  function D(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
    var t = e.replace(
      L,
      D
    );
    I[t] = new S(t, 1, !1, e, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
    var t = e.replace(L, D);
    I[t] = new S(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
    var t = e.replace(L, D);
    I[t] = new S(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(e) {
    I[e] = new S(e, 1, !1, e.toLowerCase(), null, !1, !1);
  }), I.xlinkHref = new S("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(e) {
    I[e] = new S(e, 1, !1, e.toLowerCase(), null, !0, !0);
  });
  function M(e, t, r, o) {
    var u = I.hasOwnProperty(t) ? I[t] : null;
    (u !== null ? u.type !== 0 : o || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (k(t, r, u, o) && (r = null), o || u === null ? x(t) && (r === null ? e.removeAttribute(t) : e.setAttribute(t, "" + r)) : u.mustUseProperty ? e[u.propertyName] = r === null ? u.type === 3 ? !1 : "" : r : (t = u.attributeName, o = u.attributeNamespace, r === null ? e.removeAttribute(t) : (u = u.type, r = u === 3 || u === 4 && r === !0 ? "" : "" + r, o ? e.setAttributeNS(o, t, r) : e.setAttribute(t, r))));
  }
  var P = n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, _ = Symbol.for("react.element"), $ = Symbol.for("react.portal"), A = Symbol.for("react.fragment"), U = Symbol.for("react.strict_mode"), H = Symbol.for("react.profiler"), K = Symbol.for("react.provider"), Q = Symbol.for("react.context"), q = Symbol.for("react.forward_ref"), ee = Symbol.for("react.suspense"), re = Symbol.for("react.suspense_list"), ie = Symbol.for("react.memo"), ue = Symbol.for("react.lazy"), W = Symbol.for("react.offscreen"), F = Symbol.iterator;
  function J(e) {
    return e === null || typeof e != "object" ? null : (e = F && e[F] || e["@@iterator"], typeof e == "function" ? e : null);
  }
  var B = Object.assign, T;
  function O(e) {
    if (T === void 0) try {
      throw Error();
    } catch (r) {
      var t = r.stack.trim().match(/\n( *(at )?)/);
      T = t && t[1] || "";
    }
    return `
` + T + e;
  }
  var G = !1;
  function oe(e, t) {
    if (!e || G) return "";
    G = !0;
    var r = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (t) if (t = function() {
        throw Error();
      }, Object.defineProperty(t.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(t, []);
        } catch (z) {
          var o = z;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (z) {
          o = z;
        }
        e.call(t.prototype);
      }
      else {
        try {
          throw Error();
        } catch (z) {
          o = z;
        }
        e();
      }
    } catch (z) {
      if (z && o && typeof z.stack == "string") {
        for (var u = z.stack.split(`
`), l = o.stack.split(`
`), v = u.length - 1, C = l.length - 1; 1 <= v && 0 <= C && u[v] !== l[C]; ) C--;
        for (; 1 <= v && 0 <= C; v--, C--) if (u[v] !== l[C]) {
          if (v !== 1 || C !== 1)
            do
              if (v--, C--, 0 > C || u[v] !== l[C]) {
                var b = `
` + u[v].replace(" at new ", " at ");
                return e.displayName && b.includes("<anonymous>") && (b = b.replace("<anonymous>", e.displayName)), b;
              }
            while (1 <= v && 0 <= C);
          break;
        }
      }
    } finally {
      G = !1, Error.prepareStackTrace = r;
    }
    return (e = e ? e.displayName || e.name : "") ? O(e) : "";
  }
  function ne(e) {
    switch (e.tag) {
      case 5:
        return O(e.type);
      case 16:
        return O("Lazy");
      case 13:
        return O("Suspense");
      case 19:
        return O("SuspenseList");
      case 0:
      case 2:
      case 15:
        return e = oe(e.type, !1), e;
      case 11:
        return e = oe(e.type.render, !1), e;
      case 1:
        return e = oe(e.type, !0), e;
      default:
        return "";
    }
  }
  function de(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case A:
        return "Fragment";
      case $:
        return "Portal";
      case H:
        return "Profiler";
      case U:
        return "StrictMode";
      case ee:
        return "Suspense";
      case re:
        return "SuspenseList";
    }
    if (typeof e == "object") switch (e.$$typeof) {
      case Q:
        return (e.displayName || "Context") + ".Consumer";
      case K:
        return (e._context.displayName || "Context") + ".Provider";
      case q:
        var t = e.render;
        return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
      case ie:
        return t = e.displayName || null, t !== null ? t : de(e.type) || "Memo";
      case ue:
        t = e._payload, e = e._init;
        try {
          return de(e(t));
        } catch {
        }
    }
    return null;
  }
  function he(e) {
    var t = e.type;
    switch (e.tag) {
      case 24:
        return "Cache";
      case 9:
        return (t.displayName || "Context") + ".Consumer";
      case 10:
        return (t._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return t;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return de(t);
      case 8:
        return t === U ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof t == "function") return t.displayName || t.name || null;
        if (typeof t == "string") return t;
    }
    return null;
  }
  function ve(e) {
    switch (typeof e) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return e;
      case "object":
        return e;
      default:
        return "";
    }
  }
  function Se(e) {
    var t = e.type;
    return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
  }
  function Re(e) {
    var t = Se(e) ? "checked" : "value", r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), o = "" + e[t];
    if (!e.hasOwnProperty(t) && typeof r < "u" && typeof r.get == "function" && typeof r.set == "function") {
      var u = r.get, l = r.set;
      return Object.defineProperty(e, t, { configurable: !0, get: function() {
        return u.call(this);
      }, set: function(v) {
        o = "" + v, l.call(this, v);
      } }), Object.defineProperty(e, t, { enumerable: r.enumerable }), { getValue: function() {
        return o;
      }, setValue: function(v) {
        o = "" + v;
      }, stopTracking: function() {
        e._valueTracker = null, delete e[t];
      } };
    }
  }
  function Ye(e) {
    e._valueTracker || (e._valueTracker = Re(e));
  }
  function ze(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var r = t.getValue(), o = "";
    return e && (o = Se(e) ? e.checked ? "true" : "false" : e.value), e = o, e !== r ? (t.setValue(e), !0) : !1;
  }
  function $e(e) {
    if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function at(e, t) {
    var r = t.checked;
    return B({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: r ?? e._wrapperState.initialChecked });
  }
  function Ce(e, t) {
    var r = t.defaultValue == null ? "" : t.defaultValue, o = t.checked != null ? t.checked : t.defaultChecked;
    r = ve(t.value != null ? t.value : r), e._wrapperState = { initialChecked: o, initialValue: r, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
  }
  function fe(e, t) {
    t = t.checked, t != null && M(e, "checked", t, !1);
  }
  function dt(e, t) {
    fe(e, t);
    var r = ve(t.value), o = t.type;
    if (r != null) o === "number" ? (r === 0 && e.value === "" || e.value != r) && (e.value = "" + r) : e.value !== "" + r && (e.value = "" + r);
    else if (o === "submit" || o === "reset") {
      e.removeAttribute("value");
      return;
    }
    t.hasOwnProperty("value") ? Ft(e, t.type, r) : t.hasOwnProperty("defaultValue") && Ft(e, t.type, ve(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
  }
  function nt(e, t, r) {
    if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
      var o = t.type;
      if (!(o !== "submit" && o !== "reset" || t.value !== void 0 && t.value !== null)) return;
      t = "" + e._wrapperState.initialValue, r || t === e.value || (e.value = t), e.defaultValue = t;
    }
    r = e.name, r !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, r !== "" && (e.name = r);
  }
  function Ft(e, t, r) {
    (t !== "number" || $e(e.ownerDocument) !== e) && (r == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + r && (e.defaultValue = "" + r));
  }
  var ft = Array.isArray;
  function Et(e, t, r, o) {
    if (e = e.options, t) {
      t = {};
      for (var u = 0; u < r.length; u++) t["$" + r[u]] = !0;
      for (r = 0; r < e.length; r++) u = t.hasOwnProperty("$" + e[r].value), e[r].selected !== u && (e[r].selected = u), u && o && (e[r].defaultSelected = !0);
    } else {
      for (r = "" + ve(r), t = null, u = 0; u < e.length; u++) {
        if (e[u].value === r) {
          e[u].selected = !0, o && (e[u].defaultSelected = !0);
          return;
        }
        t !== null || e[u].disabled || (t = e[u]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function xt(e, t) {
    if (t.dangerouslySetInnerHTML != null) throw Error(s(91));
    return B({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
  }
  function Mt(e, t) {
    var r = t.value;
    if (r == null) {
      if (r = t.children, t = t.defaultValue, r != null) {
        if (t != null) throw Error(s(92));
        if (ft(r)) {
          if (1 < r.length) throw Error(s(93));
          r = r[0];
        }
        t = r;
      }
      t == null && (t = ""), r = t;
    }
    e._wrapperState = { initialValue: ve(r) };
  }
  function Qn(e, t) {
    var r = ve(t.value), o = ve(t.defaultValue);
    r != null && (r = "" + r, r !== e.value && (e.value = r), t.defaultValue == null && e.defaultValue !== r && (e.defaultValue = r)), o != null && (e.defaultValue = "" + o);
  }
  function mt(e) {
    var t = e.textContent;
    t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
  }
  function Ue(e) {
    switch (e) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function on(e, t) {
    return e == null || e === "http://www.w3.org/1999/xhtml" ? Ue(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
  }
  var sn, gn = (function(e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, r, o, u) {
      MSApp.execUnsafeLocalFunction(function() {
        return e(t, r, o, u);
      });
    } : e;
  })(function(e, t) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
    else {
      for (sn = sn || document.createElement("div"), sn.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = sn.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
  function pt(e, t) {
    if (t) {
      var r = e.firstChild;
      if (r && r === e.lastChild && r.nodeType === 3) {
        r.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Ct = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
  }, Sr = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Ct).forEach(function(e) {
    Sr.forEach(function(t) {
      t = t + e.charAt(0).toUpperCase() + e.substring(1), Ct[t] = Ct[e];
    });
  });
  function zt(e, t, r) {
    return t == null || typeof t == "boolean" || t === "" ? "" : r || typeof t != "number" || t === 0 || Ct.hasOwnProperty(e) && Ct[e] ? ("" + t).trim() : t + "px";
  }
  function Er(e, t) {
    e = e.style;
    for (var r in t) if (t.hasOwnProperty(r)) {
      var o = r.indexOf("--") === 0, u = zt(r, t[r], o);
      r === "float" && (r = "cssFloat"), o ? e.setProperty(r, u) : e[r] = u;
    }
  }
  var Ws = B({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function xr(e, t) {
    if (t) {
      if (Ws[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(s(137, e));
      if (t.dangerouslySetInnerHTML != null) {
        if (t.children != null) throw Error(s(60));
        if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(s(61));
      }
      if (t.style != null && typeof t.style != "object") throw Error(s(62));
    }
  }
  function Cr(e, t) {
    if (e.indexOf("-") === -1) return typeof t.is == "string";
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var uo = null;
  function ao(e) {
    return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
  }
  var lo = null, yn = null, wn = null;
  function ii(e) {
    if (e = No(e)) {
      if (typeof lo != "function") throw Error(s(280));
      var t = e.stateNode;
      t && (t = Ii(t), lo(e.stateNode, e.type, t));
    }
  }
  function si(e) {
    yn ? wn ? wn.push(e) : wn = [e] : yn = e;
  }
  function Yn() {
    if (yn) {
      var e = yn, t = wn;
      if (wn = yn = null, ii(e), t) for (e = 0; e < t.length; e++) ii(t[e]);
    }
  }
  function Gn(e, t) {
    return e(t);
  }
  function ui() {
  }
  var co = !1;
  function Jn(e, t, r) {
    if (co) return e(t, r);
    co = !0;
    try {
      return Gn(e, t, r);
    } finally {
      co = !1, (yn !== null || wn !== null) && (ui(), Yn());
    }
  }
  function Sn(e, t) {
    var r = e.stateNode;
    if (r === null) return null;
    var o = Ii(r);
    if (o === null) return null;
    r = o[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (o = !o.disabled) || (e = e.type, o = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !o;
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (r && typeof r != "function") throw Error(s(231, t, typeof r));
    return r;
  }
  var ai = !1;
  if (p) try {
    var kr = {};
    Object.defineProperty(kr, "passive", { get: function() {
      ai = !0;
    } }), window.addEventListener("test", kr, kr), window.removeEventListener("test", kr, kr);
  } catch {
    ai = !1;
  }
  function Nl(e, t, r, o, u, l, v, C, b) {
    var z = Array.prototype.slice.call(arguments, 3);
    try {
      t.apply(r, z);
    } catch (X) {
      this.onError(X);
    }
  }
  var Pr = !1, Rr = null, Xn = !1, ke = null, be = { onError: function(e) {
    Pr = !0, Rr = e;
  } };
  function kt(e, t, r, o, u, l, v, C, b) {
    Pr = !1, Rr = null, Nl.apply(be, arguments);
  }
  function En(e, t, r, o, u, l, v, C, b) {
    if (kt.apply(this, arguments), Pr) {
      if (Pr) {
        var z = Rr;
        Pr = !1, Rr = null;
      } else throw Error(s(198));
      Xn || (Xn = !0, ke = z);
    }
  }
  function xn(e) {
    var t = e, r = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do
        t = e, (t.flags & 4098) !== 0 && (r = t.return), e = t.return;
      while (e);
    }
    return t.tag === 3 ? r : null;
  }
  function _l(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
    }
    return null;
  }
  function Fl(e) {
    if (xn(e) !== e) throw Error(s(188));
  }
  function _p(e) {
    var t = e.alternate;
    if (!t) {
      if (t = xn(e), t === null) throw Error(s(188));
      return t !== e ? null : e;
    }
    for (var r = e, o = t; ; ) {
      var u = r.return;
      if (u === null) break;
      var l = u.alternate;
      if (l === null) {
        if (o = u.return, o !== null) {
          r = o;
          continue;
        }
        break;
      }
      if (u.child === l.child) {
        for (l = u.child; l; ) {
          if (l === r) return Fl(u), e;
          if (l === o) return Fl(u), t;
          l = l.sibling;
        }
        throw Error(s(188));
      }
      if (r.return !== o.return) r = u, o = l;
      else {
        for (var v = !1, C = u.child; C; ) {
          if (C === r) {
            v = !0, r = u, o = l;
            break;
          }
          if (C === o) {
            v = !0, o = u, r = l;
            break;
          }
          C = C.sibling;
        }
        if (!v) {
          for (C = l.child; C; ) {
            if (C === r) {
              v = !0, r = l, o = u;
              break;
            }
            if (C === o) {
              v = !0, o = l, r = u;
              break;
            }
            C = C.sibling;
          }
          if (!v) throw Error(s(189));
        }
      }
      if (r.alternate !== o) throw Error(s(190));
    }
    if (r.tag !== 3) throw Error(s(188));
    return r.stateNode.current === r ? e : t;
  }
  function Ml(e) {
    return e = _p(e), e !== null ? Ll(e) : null;
  }
  function Ll(e) {
    if (e.tag === 5 || e.tag === 6) return e;
    for (e = e.child; e !== null; ) {
      var t = Ll(e);
      if (t !== null) return t;
      e = e.sibling;
    }
    return null;
  }
  var $l = i.unstable_scheduleCallback, jl = i.unstable_cancelCallback, Fp = i.unstable_shouldYield, Mp = i.unstable_requestPaint, De = i.unstable_now, Lp = i.unstable_getCurrentPriorityLevel, Ks = i.unstable_ImmediatePriority, Vl = i.unstable_UserBlockingPriority, li = i.unstable_NormalPriority, $p = i.unstable_LowPriority, Al = i.unstable_IdlePriority, ci = null, Xt = null;
  function jp(e) {
    if (Xt && typeof Xt.onCommitFiberRoot == "function") try {
      Xt.onCommitFiberRoot(ci, e, void 0, (e.current.flags & 128) === 128);
    } catch {
    }
  }
  var Bt = Math.clz32 ? Math.clz32 : Dp, Vp = Math.log, Ap = Math.LN2;
  function Dp(e) {
    return e >>>= 0, e === 0 ? 32 : 31 - (Vp(e) / Ap | 0) | 0;
  }
  var di = 64, fi = 4194304;
  function fo(e) {
    switch (e & -e) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return e & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return e & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return e;
    }
  }
  function mi(e, t) {
    var r = e.pendingLanes;
    if (r === 0) return 0;
    var o = 0, u = e.suspendedLanes, l = e.pingedLanes, v = r & 268435455;
    if (v !== 0) {
      var C = v & ~u;
      C !== 0 ? o = fo(C) : (l &= v, l !== 0 && (o = fo(l)));
    } else v = r & ~u, v !== 0 ? o = fo(v) : l !== 0 && (o = fo(l));
    if (o === 0) return 0;
    if (t !== 0 && t !== o && (t & u) === 0 && (u = o & -o, l = t & -t, u >= l || u === 16 && (l & 4194240) !== 0)) return t;
    if ((o & 4) !== 0 && (o |= r & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= o; 0 < t; ) r = 31 - Bt(t), u = 1 << r, o |= e[r], t &= ~u;
    return o;
  }
  function Op(e, t) {
    switch (e) {
      case 1:
      case 2:
      case 4:
        return t + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return t + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function zp(e, t) {
    for (var r = e.suspendedLanes, o = e.pingedLanes, u = e.expirationTimes, l = e.pendingLanes; 0 < l; ) {
      var v = 31 - Bt(l), C = 1 << v, b = u[v];
      b === -1 ? ((C & r) === 0 || (C & o) !== 0) && (u[v] = Op(C, t)) : b <= t && (e.expiredLanes |= C), l &= ~C;
    }
  }
  function Qs(e) {
    return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
  }
  function Dl() {
    var e = di;
    return di <<= 1, (di & 4194240) === 0 && (di = 64), e;
  }
  function Ys(e) {
    for (var t = [], r = 0; 31 > r; r++) t.push(e);
    return t;
  }
  function mo(e, t, r) {
    e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Bt(t), e[t] = r;
  }
  function Bp(e, t) {
    var r = e.pendingLanes & ~t;
    e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
    var o = e.eventTimes;
    for (e = e.expirationTimes; 0 < r; ) {
      var u = 31 - Bt(r), l = 1 << u;
      t[u] = 0, o[u] = -1, e[u] = -1, r &= ~l;
    }
  }
  function Gs(e, t) {
    var r = e.entangledLanes |= t;
    for (e = e.entanglements; r; ) {
      var o = 31 - Bt(r), u = 1 << o;
      u & t | e[o] & t && (e[o] |= t), r &= ~u;
    }
  }
  var Ie = 0;
  function Ol(e) {
    return e &= -e, 1 < e ? 4 < e ? (e & 268435455) !== 0 ? 16 : 536870912 : 4 : 1;
  }
  var zl, Js, Bl, Ul, Hl, Xs = !1, pi = [], Cn = null, kn = null, Pn = null, po = /* @__PURE__ */ new Map(), ho = /* @__PURE__ */ new Map(), Rn = [], Up = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function Wl(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        Cn = null;
        break;
      case "dragenter":
      case "dragleave":
        kn = null;
        break;
      case "mouseover":
      case "mouseout":
        Pn = null;
        break;
      case "pointerover":
      case "pointerout":
        po.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        ho.delete(t.pointerId);
    }
  }
  function vo(e, t, r, o, u, l) {
    return e === null || e.nativeEvent !== l ? (e = { blockedOn: t, domEventName: r, eventSystemFlags: o, nativeEvent: l, targetContainers: [u] }, t !== null && (t = No(t), t !== null && Js(t)), e) : (e.eventSystemFlags |= o, t = e.targetContainers, u !== null && t.indexOf(u) === -1 && t.push(u), e);
  }
  function Hp(e, t, r, o, u) {
    switch (t) {
      case "focusin":
        return Cn = vo(Cn, e, t, r, o, u), !0;
      case "dragenter":
        return kn = vo(kn, e, t, r, o, u), !0;
      case "mouseover":
        return Pn = vo(Pn, e, t, r, o, u), !0;
      case "pointerover":
        var l = u.pointerId;
        return po.set(l, vo(po.get(l) || null, e, t, r, o, u)), !0;
      case "gotpointercapture":
        return l = u.pointerId, ho.set(l, vo(ho.get(l) || null, e, t, r, o, u)), !0;
    }
    return !1;
  }
  function Kl(e) {
    var t = Zn(e.target);
    if (t !== null) {
      var r = xn(t);
      if (r !== null) {
        if (t = r.tag, t === 13) {
          if (t = _l(r), t !== null) {
            e.blockedOn = t, Hl(e.priority, function() {
              Bl(r);
            });
            return;
          }
        } else if (t === 3 && r.stateNode.current.memoizedState.isDehydrated) {
          e.blockedOn = r.tag === 3 ? r.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function hi(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var r = qs(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
      if (r === null) {
        r = e.nativeEvent;
        var o = new r.constructor(r.type, r);
        uo = o, r.target.dispatchEvent(o), uo = null;
      } else return t = No(r), t !== null && Js(t), e.blockedOn = r, !1;
      t.shift();
    }
    return !0;
  }
  function Ql(e, t, r) {
    hi(e) && r.delete(t);
  }
  function Wp() {
    Xs = !1, Cn !== null && hi(Cn) && (Cn = null), kn !== null && hi(kn) && (kn = null), Pn !== null && hi(Pn) && (Pn = null), po.forEach(Ql), ho.forEach(Ql);
  }
  function go(e, t) {
    e.blockedOn === t && (e.blockedOn = null, Xs || (Xs = !0, i.unstable_scheduleCallback(i.unstable_NormalPriority, Wp)));
  }
  function yo(e) {
    function t(u) {
      return go(u, e);
    }
    if (0 < pi.length) {
      go(pi[0], e);
      for (var r = 1; r < pi.length; r++) {
        var o = pi[r];
        o.blockedOn === e && (o.blockedOn = null);
      }
    }
    for (Cn !== null && go(Cn, e), kn !== null && go(kn, e), Pn !== null && go(Pn, e), po.forEach(t), ho.forEach(t), r = 0; r < Rn.length; r++) o = Rn[r], o.blockedOn === e && (o.blockedOn = null);
    for (; 0 < Rn.length && (r = Rn[0], r.blockedOn === null); ) Kl(r), r.blockedOn === null && Rn.shift();
  }
  var Tr = P.ReactCurrentBatchConfig, vi = !0;
  function Kp(e, t, r, o) {
    var u = Ie, l = Tr.transition;
    Tr.transition = null;
    try {
      Ie = 1, Zs(e, t, r, o);
    } finally {
      Ie = u, Tr.transition = l;
    }
  }
  function Qp(e, t, r, o) {
    var u = Ie, l = Tr.transition;
    Tr.transition = null;
    try {
      Ie = 4, Zs(e, t, r, o);
    } finally {
      Ie = u, Tr.transition = l;
    }
  }
  function Zs(e, t, r, o) {
    if (vi) {
      var u = qs(e, t, r, o);
      if (u === null) vu(e, t, o, gi, r), Wl(e, o);
      else if (Hp(u, e, t, r, o)) o.stopPropagation();
      else if (Wl(e, o), t & 4 && -1 < Up.indexOf(e)) {
        for (; u !== null; ) {
          var l = No(u);
          if (l !== null && zl(l), l = qs(e, t, r, o), l === null && vu(e, t, o, gi, r), l === u) break;
          u = l;
        }
        u !== null && o.stopPropagation();
      } else vu(e, t, o, null, r);
    }
  }
  var gi = null;
  function qs(e, t, r, o) {
    if (gi = null, e = ao(o), e = Zn(e), e !== null) if (t = xn(e), t === null) e = null;
    else if (r = t.tag, r === 13) {
      if (e = _l(t), e !== null) return e;
      e = null;
    } else if (r === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
    return gi = e, null;
  }
  function Yl(e) {
    switch (e) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (Lp()) {
          case Ks:
            return 1;
          case Vl:
            return 4;
          case li:
          case $p:
            return 16;
          case Al:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var Tn = null, eu = null, yi = null;
  function Gl() {
    if (yi) return yi;
    var e, t = eu, r = t.length, o, u = "value" in Tn ? Tn.value : Tn.textContent, l = u.length;
    for (e = 0; e < r && t[e] === u[e]; e++) ;
    var v = r - e;
    for (o = 1; o <= v && t[r - o] === u[l - o]; o++) ;
    return yi = u.slice(e, 1 < o ? 1 - o : void 0);
  }
  function wi(e) {
    var t = e.keyCode;
    return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
  }
  function Si() {
    return !0;
  }
  function Jl() {
    return !1;
  }
  function Pt(e) {
    function t(r, o, u, l, v) {
      this._reactName = r, this._targetInst = u, this.type = o, this.nativeEvent = l, this.target = v, this.currentTarget = null;
      for (var C in e) e.hasOwnProperty(C) && (r = e[C], this[C] = r ? r(l) : l[C]);
      return this.isDefaultPrevented = (l.defaultPrevented != null ? l.defaultPrevented : l.returnValue === !1) ? Si : Jl, this.isPropagationStopped = Jl, this;
    }
    return B(t.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var r = this.nativeEvent;
      r && (r.preventDefault ? r.preventDefault() : typeof r.returnValue != "unknown" && (r.returnValue = !1), this.isDefaultPrevented = Si);
    }, stopPropagation: function() {
      var r = this.nativeEvent;
      r && (r.stopPropagation ? r.stopPropagation() : typeof r.cancelBubble != "unknown" && (r.cancelBubble = !0), this.isPropagationStopped = Si);
    }, persist: function() {
    }, isPersistent: Si }), t;
  }
  var br = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
    return e.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, tu = Pt(br), wo = B({}, br, { view: 0, detail: 0 }), Yp = Pt(wo), nu, ru, So, Ei = B({}, wo, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: iu, button: 0, buttons: 0, relatedTarget: function(e) {
    return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
  }, movementX: function(e) {
    return "movementX" in e ? e.movementX : (e !== So && (So && e.type === "mousemove" ? (nu = e.screenX - So.screenX, ru = e.screenY - So.screenY) : ru = nu = 0, So = e), nu);
  }, movementY: function(e) {
    return "movementY" in e ? e.movementY : ru;
  } }), Xl = Pt(Ei), Gp = B({}, Ei, { dataTransfer: 0 }), Jp = Pt(Gp), Xp = B({}, wo, { relatedTarget: 0 }), ou = Pt(Xp), Zp = B({}, br, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), qp = Pt(Zp), eh = B({}, br, { clipboardData: function(e) {
    return "clipboardData" in e ? e.clipboardData : window.clipboardData;
  } }), th = Pt(eh), nh = B({}, br, { data: 0 }), Zl = Pt(nh), rh = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, oh = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, ih = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function sh(e) {
    var t = this.nativeEvent;
    return t.getModifierState ? t.getModifierState(e) : (e = ih[e]) ? !!t[e] : !1;
  }
  function iu() {
    return sh;
  }
  var uh = B({}, wo, { key: function(e) {
    if (e.key) {
      var t = rh[e.key] || e.key;
      if (t !== "Unidentified") return t;
    }
    return e.type === "keypress" ? (e = wi(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? oh[e.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: iu, charCode: function(e) {
    return e.type === "keypress" ? wi(e) : 0;
  }, keyCode: function(e) {
    return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  }, which: function(e) {
    return e.type === "keypress" ? wi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
  } }), ah = Pt(uh), lh = B({}, Ei, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), ql = Pt(lh), ch = B({}, wo, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: iu }), dh = Pt(ch), fh = B({}, br, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), mh = Pt(fh), ph = B({}, Ei, {
    deltaX: function(e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function(e) {
      return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), hh = Pt(ph), vh = [9, 13, 27, 32], su = p && "CompositionEvent" in window, Eo = null;
  p && "documentMode" in document && (Eo = document.documentMode);
  var gh = p && "TextEvent" in window && !Eo, ec = p && (!su || Eo && 8 < Eo && 11 >= Eo), tc = " ", nc = !1;
  function rc(e, t) {
    switch (e) {
      case "keyup":
        return vh.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function oc(e) {
    return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
  }
  var Ir = !1;
  function yh(e, t) {
    switch (e) {
      case "compositionend":
        return oc(t);
      case "keypress":
        return t.which !== 32 ? null : (nc = !0, tc);
      case "textInput":
        return e = t.data, e === tc && nc ? null : e;
      default:
        return null;
    }
  }
  function wh(e, t) {
    if (Ir) return e === "compositionend" || !su && rc(e, t) ? (e = Gl(), yi = eu = Tn = null, Ir = !1, e) : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return ec && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var Sh = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function ic(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!Sh[e.type] : t === "textarea";
  }
  function sc(e, t, r, o) {
    si(o), t = Ri(t, "onChange"), 0 < t.length && (r = new tu("onChange", "change", null, r, o), e.push({ event: r, listeners: t }));
  }
  var xo = null, Co = null;
  function Eh(e) {
    kc(e, 0);
  }
  function xi(e) {
    var t = Lr(e);
    if (ze(t)) return e;
  }
  function xh(e, t) {
    if (e === "change") return t;
  }
  var uc = !1;
  if (p) {
    var uu;
    if (p) {
      var au = "oninput" in document;
      if (!au) {
        var ac = document.createElement("div");
        ac.setAttribute("oninput", "return;"), au = typeof ac.oninput == "function";
      }
      uu = au;
    } else uu = !1;
    uc = uu && (!document.documentMode || 9 < document.documentMode);
  }
  function lc() {
    xo && (xo.detachEvent("onpropertychange", cc), Co = xo = null);
  }
  function cc(e) {
    if (e.propertyName === "value" && xi(Co)) {
      var t = [];
      sc(t, Co, e, ao(e)), Jn(Eh, t);
    }
  }
  function Ch(e, t, r) {
    e === "focusin" ? (lc(), xo = t, Co = r, xo.attachEvent("onpropertychange", cc)) : e === "focusout" && lc();
  }
  function kh(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown") return xi(Co);
  }
  function Ph(e, t) {
    if (e === "click") return xi(t);
  }
  function Rh(e, t) {
    if (e === "input" || e === "change") return xi(t);
  }
  function Th(e, t) {
    return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
  }
  var Ut = typeof Object.is == "function" ? Object.is : Th;
  function ko(e, t) {
    if (Ut(e, t)) return !0;
    if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
    var r = Object.keys(e), o = Object.keys(t);
    if (r.length !== o.length) return !1;
    for (o = 0; o < r.length; o++) {
      var u = r[o];
      if (!m.call(t, u) || !Ut(e[u], t[u])) return !1;
    }
    return !0;
  }
  function dc(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function fc(e, t) {
    var r = dc(e);
    e = 0;
    for (var o; r; ) {
      if (r.nodeType === 3) {
        if (o = e + r.textContent.length, e <= t && o >= t) return { node: r, offset: t - e };
        e = o;
      }
      e: {
        for (; r; ) {
          if (r.nextSibling) {
            r = r.nextSibling;
            break e;
          }
          r = r.parentNode;
        }
        r = void 0;
      }
      r = dc(r);
    }
  }
  function mc(e, t) {
    return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? mc(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
  }
  function pc() {
    for (var e = window, t = $e(); t instanceof e.HTMLIFrameElement; ) {
      try {
        var r = typeof t.contentWindow.location.href == "string";
      } catch {
        r = !1;
      }
      if (r) e = t.contentWindow;
      else break;
      t = $e(e.document);
    }
    return t;
  }
  function lu(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
  }
  function bh(e) {
    var t = pc(), r = e.focusedElem, o = e.selectionRange;
    if (t !== r && r && r.ownerDocument && mc(r.ownerDocument.documentElement, r)) {
      if (o !== null && lu(r)) {
        if (t = o.start, e = o.end, e === void 0 && (e = t), "selectionStart" in r) r.selectionStart = t, r.selectionEnd = Math.min(e, r.value.length);
        else if (e = (t = r.ownerDocument || document) && t.defaultView || window, e.getSelection) {
          e = e.getSelection();
          var u = r.textContent.length, l = Math.min(o.start, u);
          o = o.end === void 0 ? l : Math.min(o.end, u), !e.extend && l > o && (u = o, o = l, l = u), u = fc(r, l);
          var v = fc(
            r,
            o
          );
          u && v && (e.rangeCount !== 1 || e.anchorNode !== u.node || e.anchorOffset !== u.offset || e.focusNode !== v.node || e.focusOffset !== v.offset) && (t = t.createRange(), t.setStart(u.node, u.offset), e.removeAllRanges(), l > o ? (e.addRange(t), e.extend(v.node, v.offset)) : (t.setEnd(v.node, v.offset), e.addRange(t)));
        }
      }
      for (t = [], e = r; e = e.parentNode; ) e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
      for (typeof r.focus == "function" && r.focus(), r = 0; r < t.length; r++) e = t[r], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
    }
  }
  var Ih = p && "documentMode" in document && 11 >= document.documentMode, Nr = null, cu = null, Po = null, du = !1;
  function hc(e, t, r) {
    var o = r.window === r ? r.document : r.nodeType === 9 ? r : r.ownerDocument;
    du || Nr == null || Nr !== $e(o) || (o = Nr, "selectionStart" in o && lu(o) ? o = { start: o.selectionStart, end: o.selectionEnd } : (o = (o.ownerDocument && o.ownerDocument.defaultView || window).getSelection(), o = { anchorNode: o.anchorNode, anchorOffset: o.anchorOffset, focusNode: o.focusNode, focusOffset: o.focusOffset }), Po && ko(Po, o) || (Po = o, o = Ri(cu, "onSelect"), 0 < o.length && (t = new tu("onSelect", "select", null, t, r), e.push({ event: t, listeners: o }), t.target = Nr)));
  }
  function Ci(e, t) {
    var r = {};
    return r[e.toLowerCase()] = t.toLowerCase(), r["Webkit" + e] = "webkit" + t, r["Moz" + e] = "moz" + t, r;
  }
  var _r = { animationend: Ci("Animation", "AnimationEnd"), animationiteration: Ci("Animation", "AnimationIteration"), animationstart: Ci("Animation", "AnimationStart"), transitionend: Ci("Transition", "TransitionEnd") }, fu = {}, vc = {};
  p && (vc = document.createElement("div").style, "AnimationEvent" in window || (delete _r.animationend.animation, delete _r.animationiteration.animation, delete _r.animationstart.animation), "TransitionEvent" in window || delete _r.transitionend.transition);
  function ki(e) {
    if (fu[e]) return fu[e];
    if (!_r[e]) return e;
    var t = _r[e], r;
    for (r in t) if (t.hasOwnProperty(r) && r in vc) return fu[e] = t[r];
    return e;
  }
  var gc = ki("animationend"), yc = ki("animationiteration"), wc = ki("animationstart"), Sc = ki("transitionend"), Ec = /* @__PURE__ */ new Map(), xc = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function bn(e, t) {
    Ec.set(e, t), f(t, [e]);
  }
  for (var mu = 0; mu < xc.length; mu++) {
    var pu = xc[mu], Nh = pu.toLowerCase(), _h = pu[0].toUpperCase() + pu.slice(1);
    bn(Nh, "on" + _h);
  }
  bn(gc, "onAnimationEnd"), bn(yc, "onAnimationIteration"), bn(wc, "onAnimationStart"), bn("dblclick", "onDoubleClick"), bn("focusin", "onFocus"), bn("focusout", "onBlur"), bn(Sc, "onTransitionEnd"), h("onMouseEnter", ["mouseout", "mouseover"]), h("onMouseLeave", ["mouseout", "mouseover"]), h("onPointerEnter", ["pointerout", "pointerover"]), h("onPointerLeave", ["pointerout", "pointerover"]), f("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), f("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), f("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), f("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), f("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), f("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var Ro = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Fh = new Set("cancel close invalid load scroll toggle".split(" ").concat(Ro));
  function Cc(e, t, r) {
    var o = e.type || "unknown-event";
    e.currentTarget = r, En(o, t, void 0, e), e.currentTarget = null;
  }
  function kc(e, t) {
    t = (t & 4) !== 0;
    for (var r = 0; r < e.length; r++) {
      var o = e[r], u = o.event;
      o = o.listeners;
      e: {
        var l = void 0;
        if (t) for (var v = o.length - 1; 0 <= v; v--) {
          var C = o[v], b = C.instance, z = C.currentTarget;
          if (C = C.listener, b !== l && u.isPropagationStopped()) break e;
          Cc(u, C, z), l = b;
        }
        else for (v = 0; v < o.length; v++) {
          if (C = o[v], b = C.instance, z = C.currentTarget, C = C.listener, b !== l && u.isPropagationStopped()) break e;
          Cc(u, C, z), l = b;
        }
      }
    }
    if (Xn) throw e = ke, Xn = !1, ke = null, e;
  }
  function Fe(e, t) {
    var r = t[xu];
    r === void 0 && (r = t[xu] = /* @__PURE__ */ new Set());
    var o = e + "__bubble";
    r.has(o) || (Pc(t, e, 2, !1), r.add(o));
  }
  function hu(e, t, r) {
    var o = 0;
    t && (o |= 4), Pc(r, e, o, t);
  }
  var Pi = "_reactListening" + Math.random().toString(36).slice(2);
  function To(e) {
    if (!e[Pi]) {
      e[Pi] = !0, a.forEach(function(r) {
        r !== "selectionchange" && (Fh.has(r) || hu(r, !1, e), hu(r, !0, e));
      });
      var t = e.nodeType === 9 ? e : e.ownerDocument;
      t === null || t[Pi] || (t[Pi] = !0, hu("selectionchange", !1, t));
    }
  }
  function Pc(e, t, r, o) {
    switch (Yl(t)) {
      case 1:
        var u = Kp;
        break;
      case 4:
        u = Qp;
        break;
      default:
        u = Zs;
    }
    r = u.bind(null, t, r, e), u = void 0, !ai || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (u = !0), o ? u !== void 0 ? e.addEventListener(t, r, { capture: !0, passive: u }) : e.addEventListener(t, r, !0) : u !== void 0 ? e.addEventListener(t, r, { passive: u }) : e.addEventListener(t, r, !1);
  }
  function vu(e, t, r, o, u) {
    var l = o;
    if ((t & 1) === 0 && (t & 2) === 0 && o !== null) e: for (; ; ) {
      if (o === null) return;
      var v = o.tag;
      if (v === 3 || v === 4) {
        var C = o.stateNode.containerInfo;
        if (C === u || C.nodeType === 8 && C.parentNode === u) break;
        if (v === 4) for (v = o.return; v !== null; ) {
          var b = v.tag;
          if ((b === 3 || b === 4) && (b = v.stateNode.containerInfo, b === u || b.nodeType === 8 && b.parentNode === u)) return;
          v = v.return;
        }
        for (; C !== null; ) {
          if (v = Zn(C), v === null) return;
          if (b = v.tag, b === 5 || b === 6) {
            o = l = v;
            continue e;
          }
          C = C.parentNode;
        }
      }
      o = o.return;
    }
    Jn(function() {
      var z = l, X = ao(r), Z = [];
      e: {
        var Y = Ec.get(e);
        if (Y !== void 0) {
          var se = tu, le = e;
          switch (e) {
            case "keypress":
              if (wi(r) === 0) break e;
            case "keydown":
            case "keyup":
              se = ah;
              break;
            case "focusin":
              le = "focus", se = ou;
              break;
            case "focusout":
              le = "blur", se = ou;
              break;
            case "beforeblur":
            case "afterblur":
              se = ou;
              break;
            case "click":
              if (r.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              se = Xl;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              se = Jp;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              se = dh;
              break;
            case gc:
            case yc:
            case wc:
              se = qp;
              break;
            case Sc:
              se = mh;
              break;
            case "scroll":
              se = Yp;
              break;
            case "wheel":
              se = hh;
              break;
            case "copy":
            case "cut":
            case "paste":
              se = th;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              se = ql;
          }
          var ce = (t & 4) !== 0, Oe = !ce && e === "scroll", j = ce ? Y !== null ? Y + "Capture" : null : Y;
          ce = [];
          for (var N = z, V; N !== null; ) {
            V = N;
            var te = V.stateNode;
            if (V.tag === 5 && te !== null && (V = te, j !== null && (te = Sn(N, j), te != null && ce.push(bo(N, te, V)))), Oe) break;
            N = N.return;
          }
          0 < ce.length && (Y = new se(Y, le, null, r, X), Z.push({ event: Y, listeners: ce }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (Y = e === "mouseover" || e === "pointerover", se = e === "mouseout" || e === "pointerout", Y && r !== uo && (le = r.relatedTarget || r.fromElement) && (Zn(le) || le[un])) break e;
          if ((se || Y) && (Y = X.window === X ? X : (Y = X.ownerDocument) ? Y.defaultView || Y.parentWindow : window, se ? (le = r.relatedTarget || r.toElement, se = z, le = le ? Zn(le) : null, le !== null && (Oe = xn(le), le !== Oe || le.tag !== 5 && le.tag !== 6) && (le = null)) : (se = null, le = z), se !== le)) {
            if (ce = Xl, te = "onMouseLeave", j = "onMouseEnter", N = "mouse", (e === "pointerout" || e === "pointerover") && (ce = ql, te = "onPointerLeave", j = "onPointerEnter", N = "pointer"), Oe = se == null ? Y : Lr(se), V = le == null ? Y : Lr(le), Y = new ce(te, N + "leave", se, r, X), Y.target = Oe, Y.relatedTarget = V, te = null, Zn(X) === z && (ce = new ce(j, N + "enter", le, r, X), ce.target = V, ce.relatedTarget = Oe, te = ce), Oe = te, se && le) t: {
              for (ce = se, j = le, N = 0, V = ce; V; V = Fr(V)) N++;
              for (V = 0, te = j; te; te = Fr(te)) V++;
              for (; 0 < N - V; ) ce = Fr(ce), N--;
              for (; 0 < V - N; ) j = Fr(j), V--;
              for (; N--; ) {
                if (ce === j || j !== null && ce === j.alternate) break t;
                ce = Fr(ce), j = Fr(j);
              }
              ce = null;
            }
            else ce = null;
            se !== null && Rc(Z, Y, se, ce, !1), le !== null && Oe !== null && Rc(Z, Oe, le, ce, !0);
          }
        }
        e: {
          if (Y = z ? Lr(z) : window, se = Y.nodeName && Y.nodeName.toLowerCase(), se === "select" || se === "input" && Y.type === "file") var me = xh;
          else if (ic(Y)) if (uc) me = Rh;
          else {
            me = kh;
            var ye = Ch;
          }
          else (se = Y.nodeName) && se.toLowerCase() === "input" && (Y.type === "checkbox" || Y.type === "radio") && (me = Ph);
          if (me && (me = me(e, z))) {
            sc(Z, me, r, X);
            break e;
          }
          ye && ye(e, Y, z), e === "focusout" && (ye = Y._wrapperState) && ye.controlled && Y.type === "number" && Ft(Y, "number", Y.value);
        }
        switch (ye = z ? Lr(z) : window, e) {
          case "focusin":
            (ic(ye) || ye.contentEditable === "true") && (Nr = ye, cu = z, Po = null);
            break;
          case "focusout":
            Po = cu = Nr = null;
            break;
          case "mousedown":
            du = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            du = !1, hc(Z, r, X);
            break;
          case "selectionchange":
            if (Ih) break;
          case "keydown":
          case "keyup":
            hc(Z, r, X);
        }
        var we;
        if (su) e: {
          switch (e) {
            case "compositionstart":
              var Ee = "onCompositionStart";
              break e;
            case "compositionend":
              Ee = "onCompositionEnd";
              break e;
            case "compositionupdate":
              Ee = "onCompositionUpdate";
              break e;
          }
          Ee = void 0;
        }
        else Ir ? rc(e, r) && (Ee = "onCompositionEnd") : e === "keydown" && r.keyCode === 229 && (Ee = "onCompositionStart");
        Ee && (ec && r.locale !== "ko" && (Ir || Ee !== "onCompositionStart" ? Ee === "onCompositionEnd" && Ir && (we = Gl()) : (Tn = X, eu = "value" in Tn ? Tn.value : Tn.textContent, Ir = !0)), ye = Ri(z, Ee), 0 < ye.length && (Ee = new Zl(Ee, e, null, r, X), Z.push({ event: Ee, listeners: ye }), we ? Ee.data = we : (we = oc(r), we !== null && (Ee.data = we)))), (we = gh ? yh(e, r) : wh(e, r)) && (z = Ri(z, "onBeforeInput"), 0 < z.length && (X = new Zl("onBeforeInput", "beforeinput", null, r, X), Z.push({ event: X, listeners: z }), X.data = we));
      }
      kc(Z, t);
    });
  }
  function bo(e, t, r) {
    return { instance: e, listener: t, currentTarget: r };
  }
  function Ri(e, t) {
    for (var r = t + "Capture", o = []; e !== null; ) {
      var u = e, l = u.stateNode;
      u.tag === 5 && l !== null && (u = l, l = Sn(e, r), l != null && o.unshift(bo(e, l, u)), l = Sn(e, t), l != null && o.push(bo(e, l, u))), e = e.return;
    }
    return o;
  }
  function Fr(e) {
    if (e === null) return null;
    do
      e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function Rc(e, t, r, o, u) {
    for (var l = t._reactName, v = []; r !== null && r !== o; ) {
      var C = r, b = C.alternate, z = C.stateNode;
      if (b !== null && b === o) break;
      C.tag === 5 && z !== null && (C = z, u ? (b = Sn(r, l), b != null && v.unshift(bo(r, b, C))) : u || (b = Sn(r, l), b != null && v.push(bo(r, b, C)))), r = r.return;
    }
    v.length !== 0 && e.push({ event: t, listeners: v });
  }
  var Mh = /\r\n?/g, Lh = /\u0000|\uFFFD/g;
  function Tc(e) {
    return (typeof e == "string" ? e : "" + e).replace(Mh, `
`).replace(Lh, "");
  }
  function Ti(e, t, r) {
    if (t = Tc(t), Tc(e) !== t && r) throw Error(s(425));
  }
  function bi() {
  }
  var gu = null, yu = null;
  function wu(e, t) {
    return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
  }
  var Su = typeof setTimeout == "function" ? setTimeout : void 0, $h = typeof clearTimeout == "function" ? clearTimeout : void 0, bc = typeof Promise == "function" ? Promise : void 0, jh = typeof queueMicrotask == "function" ? queueMicrotask : typeof bc < "u" ? function(e) {
    return bc.resolve(null).then(e).catch(Vh);
  } : Su;
  function Vh(e) {
    setTimeout(function() {
      throw e;
    });
  }
  function Eu(e, t) {
    var r = t, o = 0;
    do {
      var u = r.nextSibling;
      if (e.removeChild(r), u && u.nodeType === 8) if (r = u.data, r === "/$") {
        if (o === 0) {
          e.removeChild(u), yo(t);
          return;
        }
        o--;
      } else r !== "$" && r !== "$?" && r !== "$!" || o++;
      r = u;
    } while (r);
    yo(t);
  }
  function In(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
      if (t === 8) {
        if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
        if (t === "/$") return null;
      }
    }
    return e;
  }
  function Ic(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var r = e.data;
        if (r === "$" || r === "$!" || r === "$?") {
          if (t === 0) return e;
          t--;
        } else r === "/$" && t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  var Mr = Math.random().toString(36).slice(2), Zt = "__reactFiber$" + Mr, Io = "__reactProps$" + Mr, un = "__reactContainer$" + Mr, xu = "__reactEvents$" + Mr, Ah = "__reactListeners$" + Mr, Dh = "__reactHandles$" + Mr;
  function Zn(e) {
    var t = e[Zt];
    if (t) return t;
    for (var r = e.parentNode; r; ) {
      if (t = r[un] || r[Zt]) {
        if (r = t.alternate, t.child !== null || r !== null && r.child !== null) for (e = Ic(e); e !== null; ) {
          if (r = e[Zt]) return r;
          e = Ic(e);
        }
        return t;
      }
      e = r, r = e.parentNode;
    }
    return null;
  }
  function No(e) {
    return e = e[Zt] || e[un], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
  }
  function Lr(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(s(33));
  }
  function Ii(e) {
    return e[Io] || null;
  }
  var Cu = [], $r = -1;
  function Nn(e) {
    return { current: e };
  }
  function Me(e) {
    0 > $r || (e.current = Cu[$r], Cu[$r] = null, $r--);
  }
  function _e(e, t) {
    $r++, Cu[$r] = e.current, e.current = t;
  }
  var _n = {}, rt = Nn(_n), ht = Nn(!1), qn = _n;
  function jr(e, t) {
    var r = e.type.contextTypes;
    if (!r) return _n;
    var o = e.stateNode;
    if (o && o.__reactInternalMemoizedUnmaskedChildContext === t) return o.__reactInternalMemoizedMaskedChildContext;
    var u = {}, l;
    for (l in r) u[l] = t[l];
    return o && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = u), u;
  }
  function vt(e) {
    return e = e.childContextTypes, e != null;
  }
  function Ni() {
    Me(ht), Me(rt);
  }
  function Nc(e, t, r) {
    if (rt.current !== _n) throw Error(s(168));
    _e(rt, t), _e(ht, r);
  }
  function _c(e, t, r) {
    var o = e.stateNode;
    if (t = t.childContextTypes, typeof o.getChildContext != "function") return r;
    o = o.getChildContext();
    for (var u in o) if (!(u in t)) throw Error(s(108, he(e) || "Unknown", u));
    return B({}, r, o);
  }
  function _i(e) {
    return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || _n, qn = rt.current, _e(rt, e), _e(ht, ht.current), !0;
  }
  function Fc(e, t, r) {
    var o = e.stateNode;
    if (!o) throw Error(s(169));
    r ? (e = _c(e, t, qn), o.__reactInternalMemoizedMergedChildContext = e, Me(ht), Me(rt), _e(rt, e)) : Me(ht), _e(ht, r);
  }
  var an = null, Fi = !1, ku = !1;
  function Mc(e) {
    an === null ? an = [e] : an.push(e);
  }
  function Oh(e) {
    Fi = !0, Mc(e);
  }
  function Fn() {
    if (!ku && an !== null) {
      ku = !0;
      var e = 0, t = Ie;
      try {
        var r = an;
        for (Ie = 1; e < r.length; e++) {
          var o = r[e];
          do
            o = o(!0);
          while (o !== null);
        }
        an = null, Fi = !1;
      } catch (u) {
        throw an !== null && (an = an.slice(e + 1)), $l(Ks, Fn), u;
      } finally {
        Ie = t, ku = !1;
      }
    }
    return null;
  }
  var Vr = [], Ar = 0, Mi = null, Li = 0, Lt = [], $t = 0, er = null, ln = 1, cn = "";
  function tr(e, t) {
    Vr[Ar++] = Li, Vr[Ar++] = Mi, Mi = e, Li = t;
  }
  function Lc(e, t, r) {
    Lt[$t++] = ln, Lt[$t++] = cn, Lt[$t++] = er, er = e;
    var o = ln;
    e = cn;
    var u = 32 - Bt(o) - 1;
    o &= ~(1 << u), r += 1;
    var l = 32 - Bt(t) + u;
    if (30 < l) {
      var v = u - u % 5;
      l = (o & (1 << v) - 1).toString(32), o >>= v, u -= v, ln = 1 << 32 - Bt(t) + u | r << u | o, cn = l + e;
    } else ln = 1 << l | r << u | o, cn = e;
  }
  function Pu(e) {
    e.return !== null && (tr(e, 1), Lc(e, 1, 0));
  }
  function Ru(e) {
    for (; e === Mi; ) Mi = Vr[--Ar], Vr[Ar] = null, Li = Vr[--Ar], Vr[Ar] = null;
    for (; e === er; ) er = Lt[--$t], Lt[$t] = null, cn = Lt[--$t], Lt[$t] = null, ln = Lt[--$t], Lt[$t] = null;
  }
  var Rt = null, Tt = null, Le = !1, Ht = null;
  function $c(e, t) {
    var r = Dt(5, null, null, 0);
    r.elementType = "DELETED", r.stateNode = t, r.return = e, t = e.deletions, t === null ? (e.deletions = [r], e.flags |= 16) : t.push(r);
  }
  function jc(e, t) {
    switch (e.tag) {
      case 5:
        var r = e.type;
        return t = t.nodeType !== 1 || r.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, Rt = e, Tt = In(t.firstChild), !0) : !1;
      case 6:
        return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, Rt = e, Tt = null, !0) : !1;
      case 13:
        return t = t.nodeType !== 8 ? null : t, t !== null ? (r = er !== null ? { id: ln, overflow: cn } : null, e.memoizedState = { dehydrated: t, treeContext: r, retryLane: 1073741824 }, r = Dt(18, null, null, 0), r.stateNode = t, r.return = e, e.child = r, Rt = e, Tt = null, !0) : !1;
      default:
        return !1;
    }
  }
  function Tu(e) {
    return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
  }
  function bu(e) {
    if (Le) {
      var t = Tt;
      if (t) {
        var r = t;
        if (!jc(e, t)) {
          if (Tu(e)) throw Error(s(418));
          t = In(r.nextSibling);
          var o = Rt;
          t && jc(e, t) ? $c(o, r) : (e.flags = e.flags & -4097 | 2, Le = !1, Rt = e);
        }
      } else {
        if (Tu(e)) throw Error(s(418));
        e.flags = e.flags & -4097 | 2, Le = !1, Rt = e;
      }
    }
  }
  function Vc(e) {
    for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
    Rt = e;
  }
  function $i(e) {
    if (e !== Rt) return !1;
    if (!Le) return Vc(e), Le = !0, !1;
    var t;
    if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !wu(e.type, e.memoizedProps)), t && (t = Tt)) {
      if (Tu(e)) throw Ac(), Error(s(418));
      for (; t; ) $c(e, t), t = In(t.nextSibling);
    }
    if (Vc(e), e.tag === 13) {
      if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(s(317));
      e: {
        for (e = e.nextSibling, t = 0; e; ) {
          if (e.nodeType === 8) {
            var r = e.data;
            if (r === "/$") {
              if (t === 0) {
                Tt = In(e.nextSibling);
                break e;
              }
              t--;
            } else r !== "$" && r !== "$!" && r !== "$?" || t++;
          }
          e = e.nextSibling;
        }
        Tt = null;
      }
    } else Tt = Rt ? In(e.stateNode.nextSibling) : null;
    return !0;
  }
  function Ac() {
    for (var e = Tt; e; ) e = In(e.nextSibling);
  }
  function Dr() {
    Tt = Rt = null, Le = !1;
  }
  function Iu(e) {
    Ht === null ? Ht = [e] : Ht.push(e);
  }
  var zh = P.ReactCurrentBatchConfig;
  function _o(e, t, r) {
    if (e = r.ref, e !== null && typeof e != "function" && typeof e != "object") {
      if (r._owner) {
        if (r = r._owner, r) {
          if (r.tag !== 1) throw Error(s(309));
          var o = r.stateNode;
        }
        if (!o) throw Error(s(147, e));
        var u = o, l = "" + e;
        return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === l ? t.ref : (t = function(v) {
          var C = u.refs;
          v === null ? delete C[l] : C[l] = v;
        }, t._stringRef = l, t);
      }
      if (typeof e != "string") throw Error(s(284));
      if (!r._owner) throw Error(s(290, e));
    }
    return e;
  }
  function ji(e, t) {
    throw e = Object.prototype.toString.call(t), Error(s(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
  }
  function Dc(e) {
    var t = e._init;
    return t(e._payload);
  }
  function Oc(e) {
    function t(j, N) {
      if (e) {
        var V = j.deletions;
        V === null ? (j.deletions = [N], j.flags |= 16) : V.push(N);
      }
    }
    function r(j, N) {
      if (!e) return null;
      for (; N !== null; ) t(j, N), N = N.sibling;
      return null;
    }
    function o(j, N) {
      for (j = /* @__PURE__ */ new Map(); N !== null; ) N.key !== null ? j.set(N.key, N) : j.set(N.index, N), N = N.sibling;
      return j;
    }
    function u(j, N) {
      return j = On(j, N), j.index = 0, j.sibling = null, j;
    }
    function l(j, N, V) {
      return j.index = V, e ? (V = j.alternate, V !== null ? (V = V.index, V < N ? (j.flags |= 2, N) : V) : (j.flags |= 2, N)) : (j.flags |= 1048576, N);
    }
    function v(j) {
      return e && j.alternate === null && (j.flags |= 2), j;
    }
    function C(j, N, V, te) {
      return N === null || N.tag !== 6 ? (N = Sa(V, j.mode, te), N.return = j, N) : (N = u(N, V), N.return = j, N);
    }
    function b(j, N, V, te) {
      var me = V.type;
      return me === A ? X(j, N, V.props.children, te, V.key) : N !== null && (N.elementType === me || typeof me == "object" && me !== null && me.$$typeof === ue && Dc(me) === N.type) ? (te = u(N, V.props), te.ref = _o(j, N, V), te.return = j, te) : (te = ss(V.type, V.key, V.props, null, j.mode, te), te.ref = _o(j, N, V), te.return = j, te);
    }
    function z(j, N, V, te) {
      return N === null || N.tag !== 4 || N.stateNode.containerInfo !== V.containerInfo || N.stateNode.implementation !== V.implementation ? (N = Ea(V, j.mode, te), N.return = j, N) : (N = u(N, V.children || []), N.return = j, N);
    }
    function X(j, N, V, te, me) {
      return N === null || N.tag !== 7 ? (N = lr(V, j.mode, te, me), N.return = j, N) : (N = u(N, V), N.return = j, N);
    }
    function Z(j, N, V) {
      if (typeof N == "string" && N !== "" || typeof N == "number") return N = Sa("" + N, j.mode, V), N.return = j, N;
      if (typeof N == "object" && N !== null) {
        switch (N.$$typeof) {
          case _:
            return V = ss(N.type, N.key, N.props, null, j.mode, V), V.ref = _o(j, null, N), V.return = j, V;
          case $:
            return N = Ea(N, j.mode, V), N.return = j, N;
          case ue:
            var te = N._init;
            return Z(j, te(N._payload), V);
        }
        if (ft(N) || J(N)) return N = lr(N, j.mode, V, null), N.return = j, N;
        ji(j, N);
      }
      return null;
    }
    function Y(j, N, V, te) {
      var me = N !== null ? N.key : null;
      if (typeof V == "string" && V !== "" || typeof V == "number") return me !== null ? null : C(j, N, "" + V, te);
      if (typeof V == "object" && V !== null) {
        switch (V.$$typeof) {
          case _:
            return V.key === me ? b(j, N, V, te) : null;
          case $:
            return V.key === me ? z(j, N, V, te) : null;
          case ue:
            return me = V._init, Y(
              j,
              N,
              me(V._payload),
              te
            );
        }
        if (ft(V) || J(V)) return me !== null ? null : X(j, N, V, te, null);
        ji(j, V);
      }
      return null;
    }
    function se(j, N, V, te, me) {
      if (typeof te == "string" && te !== "" || typeof te == "number") return j = j.get(V) || null, C(N, j, "" + te, me);
      if (typeof te == "object" && te !== null) {
        switch (te.$$typeof) {
          case _:
            return j = j.get(te.key === null ? V : te.key) || null, b(N, j, te, me);
          case $:
            return j = j.get(te.key === null ? V : te.key) || null, z(N, j, te, me);
          case ue:
            var ye = te._init;
            return se(j, N, V, ye(te._payload), me);
        }
        if (ft(te) || J(te)) return j = j.get(V) || null, X(N, j, te, me, null);
        ji(N, te);
      }
      return null;
    }
    function le(j, N, V, te) {
      for (var me = null, ye = null, we = N, Ee = N = 0, Xe = null; we !== null && Ee < V.length; Ee++) {
        we.index > Ee ? (Xe = we, we = null) : Xe = we.sibling;
        var Te = Y(j, we, V[Ee], te);
        if (Te === null) {
          we === null && (we = Xe);
          break;
        }
        e && we && Te.alternate === null && t(j, we), N = l(Te, N, Ee), ye === null ? me = Te : ye.sibling = Te, ye = Te, we = Xe;
      }
      if (Ee === V.length) return r(j, we), Le && tr(j, Ee), me;
      if (we === null) {
        for (; Ee < V.length; Ee++) we = Z(j, V[Ee], te), we !== null && (N = l(we, N, Ee), ye === null ? me = we : ye.sibling = we, ye = we);
        return Le && tr(j, Ee), me;
      }
      for (we = o(j, we); Ee < V.length; Ee++) Xe = se(we, j, Ee, V[Ee], te), Xe !== null && (e && Xe.alternate !== null && we.delete(Xe.key === null ? Ee : Xe.key), N = l(Xe, N, Ee), ye === null ? me = Xe : ye.sibling = Xe, ye = Xe);
      return e && we.forEach(function(zn) {
        return t(j, zn);
      }), Le && tr(j, Ee), me;
    }
    function ce(j, N, V, te) {
      var me = J(V);
      if (typeof me != "function") throw Error(s(150));
      if (V = me.call(V), V == null) throw Error(s(151));
      for (var ye = me = null, we = N, Ee = N = 0, Xe = null, Te = V.next(); we !== null && !Te.done; Ee++, Te = V.next()) {
        we.index > Ee ? (Xe = we, we = null) : Xe = we.sibling;
        var zn = Y(j, we, Te.value, te);
        if (zn === null) {
          we === null && (we = Xe);
          break;
        }
        e && we && zn.alternate === null && t(j, we), N = l(zn, N, Ee), ye === null ? me = zn : ye.sibling = zn, ye = zn, we = Xe;
      }
      if (Te.done) return r(
        j,
        we
      ), Le && tr(j, Ee), me;
      if (we === null) {
        for (; !Te.done; Ee++, Te = V.next()) Te = Z(j, Te.value, te), Te !== null && (N = l(Te, N, Ee), ye === null ? me = Te : ye.sibling = Te, ye = Te);
        return Le && tr(j, Ee), me;
      }
      for (we = o(j, we); !Te.done; Ee++, Te = V.next()) Te = se(we, j, Ee, Te.value, te), Te !== null && (e && Te.alternate !== null && we.delete(Te.key === null ? Ee : Te.key), N = l(Te, N, Ee), ye === null ? me = Te : ye.sibling = Te, ye = Te);
      return e && we.forEach(function(Sv) {
        return t(j, Sv);
      }), Le && tr(j, Ee), me;
    }
    function Oe(j, N, V, te) {
      if (typeof V == "object" && V !== null && V.type === A && V.key === null && (V = V.props.children), typeof V == "object" && V !== null) {
        switch (V.$$typeof) {
          case _:
            e: {
              for (var me = V.key, ye = N; ye !== null; ) {
                if (ye.key === me) {
                  if (me = V.type, me === A) {
                    if (ye.tag === 7) {
                      r(j, ye.sibling), N = u(ye, V.props.children), N.return = j, j = N;
                      break e;
                    }
                  } else if (ye.elementType === me || typeof me == "object" && me !== null && me.$$typeof === ue && Dc(me) === ye.type) {
                    r(j, ye.sibling), N = u(ye, V.props), N.ref = _o(j, ye, V), N.return = j, j = N;
                    break e;
                  }
                  r(j, ye);
                  break;
                } else t(j, ye);
                ye = ye.sibling;
              }
              V.type === A ? (N = lr(V.props.children, j.mode, te, V.key), N.return = j, j = N) : (te = ss(V.type, V.key, V.props, null, j.mode, te), te.ref = _o(j, N, V), te.return = j, j = te);
            }
            return v(j);
          case $:
            e: {
              for (ye = V.key; N !== null; ) {
                if (N.key === ye) if (N.tag === 4 && N.stateNode.containerInfo === V.containerInfo && N.stateNode.implementation === V.implementation) {
                  r(j, N.sibling), N = u(N, V.children || []), N.return = j, j = N;
                  break e;
                } else {
                  r(j, N);
                  break;
                }
                else t(j, N);
                N = N.sibling;
              }
              N = Ea(V, j.mode, te), N.return = j, j = N;
            }
            return v(j);
          case ue:
            return ye = V._init, Oe(j, N, ye(V._payload), te);
        }
        if (ft(V)) return le(j, N, V, te);
        if (J(V)) return ce(j, N, V, te);
        ji(j, V);
      }
      return typeof V == "string" && V !== "" || typeof V == "number" ? (V = "" + V, N !== null && N.tag === 6 ? (r(j, N.sibling), N = u(N, V), N.return = j, j = N) : (r(j, N), N = Sa(V, j.mode, te), N.return = j, j = N), v(j)) : r(j, N);
    }
    return Oe;
  }
  var Or = Oc(!0), zc = Oc(!1), Vi = Nn(null), Ai = null, zr = null, Nu = null;
  function _u() {
    Nu = zr = Ai = null;
  }
  function Fu(e) {
    var t = Vi.current;
    Me(Vi), e._currentValue = t;
  }
  function Mu(e, t, r) {
    for (; e !== null; ) {
      var o = e.alternate;
      if ((e.childLanes & t) !== t ? (e.childLanes |= t, o !== null && (o.childLanes |= t)) : o !== null && (o.childLanes & t) !== t && (o.childLanes |= t), e === r) break;
      e = e.return;
    }
  }
  function Br(e, t) {
    Ai = e, Nu = zr = null, e = e.dependencies, e !== null && e.firstContext !== null && ((e.lanes & t) !== 0 && (gt = !0), e.firstContext = null);
  }
  function jt(e) {
    var t = e._currentValue;
    if (Nu !== e) if (e = { context: e, memoizedValue: t, next: null }, zr === null) {
      if (Ai === null) throw Error(s(308));
      zr = e, Ai.dependencies = { lanes: 0, firstContext: e };
    } else zr = zr.next = e;
    return t;
  }
  var nr = null;
  function Lu(e) {
    nr === null ? nr = [e] : nr.push(e);
  }
  function Bc(e, t, r, o) {
    var u = t.interleaved;
    return u === null ? (r.next = r, Lu(t)) : (r.next = u.next, u.next = r), t.interleaved = r, dn(e, o);
  }
  function dn(e, t) {
    e.lanes |= t;
    var r = e.alternate;
    for (r !== null && (r.lanes |= t), r = e, e = e.return; e !== null; ) e.childLanes |= t, r = e.alternate, r !== null && (r.childLanes |= t), r = e, e = e.return;
    return r.tag === 3 ? r.stateNode : null;
  }
  var Mn = !1;
  function $u(e) {
    e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function Uc(e, t) {
    e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
  }
  function fn(e, t) {
    return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
  }
  function Ln(e, t, r) {
    var o = e.updateQueue;
    if (o === null) return null;
    if (o = o.shared, (Pe & 2) !== 0) {
      var u = o.pending;
      return u === null ? t.next = t : (t.next = u.next, u.next = t), o.pending = t, dn(e, r);
    }
    return u = o.interleaved, u === null ? (t.next = t, Lu(o)) : (t.next = u.next, u.next = t), o.interleaved = t, dn(e, r);
  }
  function Di(e, t, r) {
    if (t = t.updateQueue, t !== null && (t = t.shared, (r & 4194240) !== 0)) {
      var o = t.lanes;
      o &= e.pendingLanes, r |= o, t.lanes = r, Gs(e, r);
    }
  }
  function Hc(e, t) {
    var r = e.updateQueue, o = e.alternate;
    if (o !== null && (o = o.updateQueue, r === o)) {
      var u = null, l = null;
      if (r = r.firstBaseUpdate, r !== null) {
        do {
          var v = { eventTime: r.eventTime, lane: r.lane, tag: r.tag, payload: r.payload, callback: r.callback, next: null };
          l === null ? u = l = v : l = l.next = v, r = r.next;
        } while (r !== null);
        l === null ? u = l = t : l = l.next = t;
      } else u = l = t;
      r = { baseState: o.baseState, firstBaseUpdate: u, lastBaseUpdate: l, shared: o.shared, effects: o.effects }, e.updateQueue = r;
      return;
    }
    e = r.lastBaseUpdate, e === null ? r.firstBaseUpdate = t : e.next = t, r.lastBaseUpdate = t;
  }
  function Oi(e, t, r, o) {
    var u = e.updateQueue;
    Mn = !1;
    var l = u.firstBaseUpdate, v = u.lastBaseUpdate, C = u.shared.pending;
    if (C !== null) {
      u.shared.pending = null;
      var b = C, z = b.next;
      b.next = null, v === null ? l = z : v.next = z, v = b;
      var X = e.alternate;
      X !== null && (X = X.updateQueue, C = X.lastBaseUpdate, C !== v && (C === null ? X.firstBaseUpdate = z : C.next = z, X.lastBaseUpdate = b));
    }
    if (l !== null) {
      var Z = u.baseState;
      v = 0, X = z = b = null, C = l;
      do {
        var Y = C.lane, se = C.eventTime;
        if ((o & Y) === Y) {
          X !== null && (X = X.next = {
            eventTime: se,
            lane: 0,
            tag: C.tag,
            payload: C.payload,
            callback: C.callback,
            next: null
          });
          e: {
            var le = e, ce = C;
            switch (Y = t, se = r, ce.tag) {
              case 1:
                if (le = ce.payload, typeof le == "function") {
                  Z = le.call(se, Z, Y);
                  break e;
                }
                Z = le;
                break e;
              case 3:
                le.flags = le.flags & -65537 | 128;
              case 0:
                if (le = ce.payload, Y = typeof le == "function" ? le.call(se, Z, Y) : le, Y == null) break e;
                Z = B({}, Z, Y);
                break e;
              case 2:
                Mn = !0;
            }
          }
          C.callback !== null && C.lane !== 0 && (e.flags |= 64, Y = u.effects, Y === null ? u.effects = [C] : Y.push(C));
        } else se = { eventTime: se, lane: Y, tag: C.tag, payload: C.payload, callback: C.callback, next: null }, X === null ? (z = X = se, b = Z) : X = X.next = se, v |= Y;
        if (C = C.next, C === null) {
          if (C = u.shared.pending, C === null) break;
          Y = C, C = Y.next, Y.next = null, u.lastBaseUpdate = Y, u.shared.pending = null;
        }
      } while (!0);
      if (X === null && (b = Z), u.baseState = b, u.firstBaseUpdate = z, u.lastBaseUpdate = X, t = u.shared.interleaved, t !== null) {
        u = t;
        do
          v |= u.lane, u = u.next;
        while (u !== t);
      } else l === null && (u.shared.lanes = 0);
      ir |= v, e.lanes = v, e.memoizedState = Z;
    }
  }
  function Wc(e, t, r) {
    if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
      var o = e[t], u = o.callback;
      if (u !== null) {
        if (o.callback = null, o = r, typeof u != "function") throw Error(s(191, u));
        u.call(o);
      }
    }
  }
  var Fo = {}, qt = Nn(Fo), Mo = Nn(Fo), Lo = Nn(Fo);
  function rr(e) {
    if (e === Fo) throw Error(s(174));
    return e;
  }
  function ju(e, t) {
    switch (_e(Lo, t), _e(Mo, e), _e(qt, Fo), e = t.nodeType, e) {
      case 9:
      case 11:
        t = (t = t.documentElement) ? t.namespaceURI : on(null, "");
        break;
      default:
        e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = on(t, e);
    }
    Me(qt), _e(qt, t);
  }
  function Ur() {
    Me(qt), Me(Mo), Me(Lo);
  }
  function Kc(e) {
    rr(Lo.current);
    var t = rr(qt.current), r = on(t, e.type);
    t !== r && (_e(Mo, e), _e(qt, r));
  }
  function Vu(e) {
    Mo.current === e && (Me(qt), Me(Mo));
  }
  var je = Nn(0);
  function zi(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var r = t.memoizedState;
        if (r !== null && (r = r.dehydrated, r === null || r.data === "$?" || r.data === "$!")) return t;
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
        if ((t.flags & 128) !== 0) return t;
      } else if (t.child !== null) {
        t.child.return = t, t = t.child;
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
    return null;
  }
  var Au = [];
  function Du() {
    for (var e = 0; e < Au.length; e++) Au[e]._workInProgressVersionPrimary = null;
    Au.length = 0;
  }
  var Bi = P.ReactCurrentDispatcher, Ou = P.ReactCurrentBatchConfig, or = 0, Ve = null, He = null, Ge = null, Ui = !1, $o = !1, jo = 0, Bh = 0;
  function ot() {
    throw Error(s(321));
  }
  function zu(e, t) {
    if (t === null) return !1;
    for (var r = 0; r < t.length && r < e.length; r++) if (!Ut(e[r], t[r])) return !1;
    return !0;
  }
  function Bu(e, t, r, o, u, l) {
    if (or = l, Ve = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Bi.current = e === null || e.memoizedState === null ? Kh : Qh, e = r(o, u), $o) {
      l = 0;
      do {
        if ($o = !1, jo = 0, 25 <= l) throw Error(s(301));
        l += 1, Ge = He = null, t.updateQueue = null, Bi.current = Yh, e = r(o, u);
      } while ($o);
    }
    if (Bi.current = Ki, t = He !== null && He.next !== null, or = 0, Ge = He = Ve = null, Ui = !1, t) throw Error(s(300));
    return e;
  }
  function Uu() {
    var e = jo !== 0;
    return jo = 0, e;
  }
  function en() {
    var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return Ge === null ? Ve.memoizedState = Ge = e : Ge = Ge.next = e, Ge;
  }
  function Vt() {
    if (He === null) {
      var e = Ve.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = He.next;
    var t = Ge === null ? Ve.memoizedState : Ge.next;
    if (t !== null) Ge = t, He = e;
    else {
      if (e === null) throw Error(s(310));
      He = e, e = { memoizedState: He.memoizedState, baseState: He.baseState, baseQueue: He.baseQueue, queue: He.queue, next: null }, Ge === null ? Ve.memoizedState = Ge = e : Ge = Ge.next = e;
    }
    return Ge;
  }
  function Vo(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function Hu(e) {
    var t = Vt(), r = t.queue;
    if (r === null) throw Error(s(311));
    r.lastRenderedReducer = e;
    var o = He, u = o.baseQueue, l = r.pending;
    if (l !== null) {
      if (u !== null) {
        var v = u.next;
        u.next = l.next, l.next = v;
      }
      o.baseQueue = u = l, r.pending = null;
    }
    if (u !== null) {
      l = u.next, o = o.baseState;
      var C = v = null, b = null, z = l;
      do {
        var X = z.lane;
        if ((or & X) === X) b !== null && (b = b.next = { lane: 0, action: z.action, hasEagerState: z.hasEagerState, eagerState: z.eagerState, next: null }), o = z.hasEagerState ? z.eagerState : e(o, z.action);
        else {
          var Z = {
            lane: X,
            action: z.action,
            hasEagerState: z.hasEagerState,
            eagerState: z.eagerState,
            next: null
          };
          b === null ? (C = b = Z, v = o) : b = b.next = Z, Ve.lanes |= X, ir |= X;
        }
        z = z.next;
      } while (z !== null && z !== l);
      b === null ? v = o : b.next = C, Ut(o, t.memoizedState) || (gt = !0), t.memoizedState = o, t.baseState = v, t.baseQueue = b, r.lastRenderedState = o;
    }
    if (e = r.interleaved, e !== null) {
      u = e;
      do
        l = u.lane, Ve.lanes |= l, ir |= l, u = u.next;
      while (u !== e);
    } else u === null && (r.lanes = 0);
    return [t.memoizedState, r.dispatch];
  }
  function Wu(e) {
    var t = Vt(), r = t.queue;
    if (r === null) throw Error(s(311));
    r.lastRenderedReducer = e;
    var o = r.dispatch, u = r.pending, l = t.memoizedState;
    if (u !== null) {
      r.pending = null;
      var v = u = u.next;
      do
        l = e(l, v.action), v = v.next;
      while (v !== u);
      Ut(l, t.memoizedState) || (gt = !0), t.memoizedState = l, t.baseQueue === null && (t.baseState = l), r.lastRenderedState = l;
    }
    return [l, o];
  }
  function Qc() {
  }
  function Yc(e, t) {
    var r = Ve, o = Vt(), u = t(), l = !Ut(o.memoizedState, u);
    if (l && (o.memoizedState = u, gt = !0), o = o.queue, Ku(Xc.bind(null, r, o, e), [e]), o.getSnapshot !== t || l || Ge !== null && Ge.memoizedState.tag & 1) {
      if (r.flags |= 2048, Ao(9, Jc.bind(null, r, o, u, t), void 0, null), Je === null) throw Error(s(349));
      (or & 30) !== 0 || Gc(r, t, u);
    }
    return u;
  }
  function Gc(e, t, r) {
    e.flags |= 16384, e = { getSnapshot: t, value: r }, t = Ve.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, Ve.updateQueue = t, t.stores = [e]) : (r = t.stores, r === null ? t.stores = [e] : r.push(e));
  }
  function Jc(e, t, r, o) {
    t.value = r, t.getSnapshot = o, Zc(t) && qc(e);
  }
  function Xc(e, t, r) {
    return r(function() {
      Zc(t) && qc(e);
    });
  }
  function Zc(e) {
    var t = e.getSnapshot;
    e = e.value;
    try {
      var r = t();
      return !Ut(e, r);
    } catch {
      return !0;
    }
  }
  function qc(e) {
    var t = dn(e, 1);
    t !== null && Yt(t, e, 1, -1);
  }
  function ed(e) {
    var t = en();
    return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Vo, lastRenderedState: e }, t.queue = e, e = e.dispatch = Wh.bind(null, Ve, e), [t.memoizedState, e];
  }
  function Ao(e, t, r, o) {
    return e = { tag: e, create: t, destroy: r, deps: o, next: null }, t = Ve.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, Ve.updateQueue = t, t.lastEffect = e.next = e) : (r = t.lastEffect, r === null ? t.lastEffect = e.next = e : (o = r.next, r.next = e, e.next = o, t.lastEffect = e)), e;
  }
  function td() {
    return Vt().memoizedState;
  }
  function Hi(e, t, r, o) {
    var u = en();
    Ve.flags |= e, u.memoizedState = Ao(1 | t, r, void 0, o === void 0 ? null : o);
  }
  function Wi(e, t, r, o) {
    var u = Vt();
    o = o === void 0 ? null : o;
    var l = void 0;
    if (He !== null) {
      var v = He.memoizedState;
      if (l = v.destroy, o !== null && zu(o, v.deps)) {
        u.memoizedState = Ao(t, r, l, o);
        return;
      }
    }
    Ve.flags |= e, u.memoizedState = Ao(1 | t, r, l, o);
  }
  function nd(e, t) {
    return Hi(8390656, 8, e, t);
  }
  function Ku(e, t) {
    return Wi(2048, 8, e, t);
  }
  function rd(e, t) {
    return Wi(4, 2, e, t);
  }
  function od(e, t) {
    return Wi(4, 4, e, t);
  }
  function id(e, t) {
    if (typeof t == "function") return e = e(), t(e), function() {
      t(null);
    };
    if (t != null) return e = e(), t.current = e, function() {
      t.current = null;
    };
  }
  function sd(e, t, r) {
    return r = r != null ? r.concat([e]) : null, Wi(4, 4, id.bind(null, t, e), r);
  }
  function Qu() {
  }
  function ud(e, t) {
    var r = Vt();
    t = t === void 0 ? null : t;
    var o = r.memoizedState;
    return o !== null && t !== null && zu(t, o[1]) ? o[0] : (r.memoizedState = [e, t], e);
  }
  function ad(e, t) {
    var r = Vt();
    t = t === void 0 ? null : t;
    var o = r.memoizedState;
    return o !== null && t !== null && zu(t, o[1]) ? o[0] : (e = e(), r.memoizedState = [e, t], e);
  }
  function ld(e, t, r) {
    return (or & 21) === 0 ? (e.baseState && (e.baseState = !1, gt = !0), e.memoizedState = r) : (Ut(r, t) || (r = Dl(), Ve.lanes |= r, ir |= r, e.baseState = !0), t);
  }
  function Uh(e, t) {
    var r = Ie;
    Ie = r !== 0 && 4 > r ? r : 4, e(!0);
    var o = Ou.transition;
    Ou.transition = {};
    try {
      e(!1), t();
    } finally {
      Ie = r, Ou.transition = o;
    }
  }
  function cd() {
    return Vt().memoizedState;
  }
  function Hh(e, t, r) {
    var o = An(e);
    if (r = { lane: o, action: r, hasEagerState: !1, eagerState: null, next: null }, dd(e)) fd(t, r);
    else if (r = Bc(e, t, r, o), r !== null) {
      var u = ct();
      Yt(r, e, o, u), md(r, t, o);
    }
  }
  function Wh(e, t, r) {
    var o = An(e), u = { lane: o, action: r, hasEagerState: !1, eagerState: null, next: null };
    if (dd(e)) fd(t, u);
    else {
      var l = e.alternate;
      if (e.lanes === 0 && (l === null || l.lanes === 0) && (l = t.lastRenderedReducer, l !== null)) try {
        var v = t.lastRenderedState, C = l(v, r);
        if (u.hasEagerState = !0, u.eagerState = C, Ut(C, v)) {
          var b = t.interleaved;
          b === null ? (u.next = u, Lu(t)) : (u.next = b.next, b.next = u), t.interleaved = u;
          return;
        }
      } catch {
      } finally {
      }
      r = Bc(e, t, u, o), r !== null && (u = ct(), Yt(r, e, o, u), md(r, t, o));
    }
  }
  function dd(e) {
    var t = e.alternate;
    return e === Ve || t !== null && t === Ve;
  }
  function fd(e, t) {
    $o = Ui = !0;
    var r = e.pending;
    r === null ? t.next = t : (t.next = r.next, r.next = t), e.pending = t;
  }
  function md(e, t, r) {
    if ((r & 4194240) !== 0) {
      var o = t.lanes;
      o &= e.pendingLanes, r |= o, t.lanes = r, Gs(e, r);
    }
  }
  var Ki = { readContext: jt, useCallback: ot, useContext: ot, useEffect: ot, useImperativeHandle: ot, useInsertionEffect: ot, useLayoutEffect: ot, useMemo: ot, useReducer: ot, useRef: ot, useState: ot, useDebugValue: ot, useDeferredValue: ot, useTransition: ot, useMutableSource: ot, useSyncExternalStore: ot, useId: ot, unstable_isNewReconciler: !1 }, Kh = { readContext: jt, useCallback: function(e, t) {
    return en().memoizedState = [e, t === void 0 ? null : t], e;
  }, useContext: jt, useEffect: nd, useImperativeHandle: function(e, t, r) {
    return r = r != null ? r.concat([e]) : null, Hi(
      4194308,
      4,
      id.bind(null, t, e),
      r
    );
  }, useLayoutEffect: function(e, t) {
    return Hi(4194308, 4, e, t);
  }, useInsertionEffect: function(e, t) {
    return Hi(4, 2, e, t);
  }, useMemo: function(e, t) {
    var r = en();
    return t = t === void 0 ? null : t, e = e(), r.memoizedState = [e, t], e;
  }, useReducer: function(e, t, r) {
    var o = en();
    return t = r !== void 0 ? r(t) : t, o.memoizedState = o.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, o.queue = e, e = e.dispatch = Hh.bind(null, Ve, e), [o.memoizedState, e];
  }, useRef: function(e) {
    var t = en();
    return e = { current: e }, t.memoizedState = e;
  }, useState: ed, useDebugValue: Qu, useDeferredValue: function(e) {
    return en().memoizedState = e;
  }, useTransition: function() {
    var e = ed(!1), t = e[0];
    return e = Uh.bind(null, e[1]), en().memoizedState = e, [t, e];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(e, t, r) {
    var o = Ve, u = en();
    if (Le) {
      if (r === void 0) throw Error(s(407));
      r = r();
    } else {
      if (r = t(), Je === null) throw Error(s(349));
      (or & 30) !== 0 || Gc(o, t, r);
    }
    u.memoizedState = r;
    var l = { value: r, getSnapshot: t };
    return u.queue = l, nd(Xc.bind(
      null,
      o,
      l,
      e
    ), [e]), o.flags |= 2048, Ao(9, Jc.bind(null, o, l, r, t), void 0, null), r;
  }, useId: function() {
    var e = en(), t = Je.identifierPrefix;
    if (Le) {
      var r = cn, o = ln;
      r = (o & ~(1 << 32 - Bt(o) - 1)).toString(32) + r, t = ":" + t + "R" + r, r = jo++, 0 < r && (t += "H" + r.toString(32)), t += ":";
    } else r = Bh++, t = ":" + t + "r" + r.toString(32) + ":";
    return e.memoizedState = t;
  }, unstable_isNewReconciler: !1 }, Qh = {
    readContext: jt,
    useCallback: ud,
    useContext: jt,
    useEffect: Ku,
    useImperativeHandle: sd,
    useInsertionEffect: rd,
    useLayoutEffect: od,
    useMemo: ad,
    useReducer: Hu,
    useRef: td,
    useState: function() {
      return Hu(Vo);
    },
    useDebugValue: Qu,
    useDeferredValue: function(e) {
      var t = Vt();
      return ld(t, He.memoizedState, e);
    },
    useTransition: function() {
      var e = Hu(Vo)[0], t = Vt().memoizedState;
      return [e, t];
    },
    useMutableSource: Qc,
    useSyncExternalStore: Yc,
    useId: cd,
    unstable_isNewReconciler: !1
  }, Yh = { readContext: jt, useCallback: ud, useContext: jt, useEffect: Ku, useImperativeHandle: sd, useInsertionEffect: rd, useLayoutEffect: od, useMemo: ad, useReducer: Wu, useRef: td, useState: function() {
    return Wu(Vo);
  }, useDebugValue: Qu, useDeferredValue: function(e) {
    var t = Vt();
    return He === null ? t.memoizedState = e : ld(t, He.memoizedState, e);
  }, useTransition: function() {
    var e = Wu(Vo)[0], t = Vt().memoizedState;
    return [e, t];
  }, useMutableSource: Qc, useSyncExternalStore: Yc, useId: cd, unstable_isNewReconciler: !1 };
  function Wt(e, t) {
    if (e && e.defaultProps) {
      t = B({}, t), e = e.defaultProps;
      for (var r in e) t[r] === void 0 && (t[r] = e[r]);
      return t;
    }
    return t;
  }
  function Yu(e, t, r, o) {
    t = e.memoizedState, r = r(o, t), r = r == null ? t : B({}, t, r), e.memoizedState = r, e.lanes === 0 && (e.updateQueue.baseState = r);
  }
  var Qi = { isMounted: function(e) {
    return (e = e._reactInternals) ? xn(e) === e : !1;
  }, enqueueSetState: function(e, t, r) {
    e = e._reactInternals;
    var o = ct(), u = An(e), l = fn(o, u);
    l.payload = t, r != null && (l.callback = r), t = Ln(e, l, u), t !== null && (Yt(t, e, u, o), Di(t, e, u));
  }, enqueueReplaceState: function(e, t, r) {
    e = e._reactInternals;
    var o = ct(), u = An(e), l = fn(o, u);
    l.tag = 1, l.payload = t, r != null && (l.callback = r), t = Ln(e, l, u), t !== null && (Yt(t, e, u, o), Di(t, e, u));
  }, enqueueForceUpdate: function(e, t) {
    e = e._reactInternals;
    var r = ct(), o = An(e), u = fn(r, o);
    u.tag = 2, t != null && (u.callback = t), t = Ln(e, u, o), t !== null && (Yt(t, e, o, r), Di(t, e, o));
  } };
  function pd(e, t, r, o, u, l, v) {
    return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(o, l, v) : t.prototype && t.prototype.isPureReactComponent ? !ko(r, o) || !ko(u, l) : !0;
  }
  function hd(e, t, r) {
    var o = !1, u = _n, l = t.contextType;
    return typeof l == "object" && l !== null ? l = jt(l) : (u = vt(t) ? qn : rt.current, o = t.contextTypes, l = (o = o != null) ? jr(e, u) : _n), t = new t(r, l), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Qi, e.stateNode = t, t._reactInternals = e, o && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = u, e.__reactInternalMemoizedMaskedChildContext = l), t;
  }
  function vd(e, t, r, o) {
    e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(r, o), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(r, o), t.state !== e && Qi.enqueueReplaceState(t, t.state, null);
  }
  function Gu(e, t, r, o) {
    var u = e.stateNode;
    u.props = r, u.state = e.memoizedState, u.refs = {}, $u(e);
    var l = t.contextType;
    typeof l == "object" && l !== null ? u.context = jt(l) : (l = vt(t) ? qn : rt.current, u.context = jr(e, l)), u.state = e.memoizedState, l = t.getDerivedStateFromProps, typeof l == "function" && (Yu(e, t, l, r), u.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof u.getSnapshotBeforeUpdate == "function" || typeof u.UNSAFE_componentWillMount != "function" && typeof u.componentWillMount != "function" || (t = u.state, typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount(), t !== u.state && Qi.enqueueReplaceState(u, u.state, null), Oi(e, r, u, o), u.state = e.memoizedState), typeof u.componentDidMount == "function" && (e.flags |= 4194308);
  }
  function Hr(e, t) {
    try {
      var r = "", o = t;
      do
        r += ne(o), o = o.return;
      while (o);
      var u = r;
    } catch (l) {
      u = `
Error generating stack: ` + l.message + `
` + l.stack;
    }
    return { value: e, source: t, stack: u, digest: null };
  }
  function Ju(e, t, r) {
    return { value: e, source: null, stack: r ?? null, digest: t ?? null };
  }
  function Xu(e, t) {
    try {
      console.error(t.value);
    } catch (r) {
      setTimeout(function() {
        throw r;
      });
    }
  }
  var Gh = typeof WeakMap == "function" ? WeakMap : Map;
  function gd(e, t, r) {
    r = fn(-1, r), r.tag = 3, r.payload = { element: null };
    var o = t.value;
    return r.callback = function() {
      es || (es = !0, fa = o), Xu(e, t);
    }, r;
  }
  function yd(e, t, r) {
    r = fn(-1, r), r.tag = 3;
    var o = e.type.getDerivedStateFromError;
    if (typeof o == "function") {
      var u = t.value;
      r.payload = function() {
        return o(u);
      }, r.callback = function() {
        Xu(e, t);
      };
    }
    var l = e.stateNode;
    return l !== null && typeof l.componentDidCatch == "function" && (r.callback = function() {
      Xu(e, t), typeof o != "function" && (jn === null ? jn = /* @__PURE__ */ new Set([this]) : jn.add(this));
      var v = t.stack;
      this.componentDidCatch(t.value, { componentStack: v !== null ? v : "" });
    }), r;
  }
  function wd(e, t, r) {
    var o = e.pingCache;
    if (o === null) {
      o = e.pingCache = new Gh();
      var u = /* @__PURE__ */ new Set();
      o.set(t, u);
    } else u = o.get(t), u === void 0 && (u = /* @__PURE__ */ new Set(), o.set(t, u));
    u.has(r) || (u.add(r), e = lv.bind(null, e, t, r), t.then(e, e));
  }
  function Sd(e) {
    do {
      var t;
      if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
      e = e.return;
    } while (e !== null);
    return null;
  }
  function Ed(e, t, r, o, u) {
    return (e.mode & 1) === 0 ? (e === t ? e.flags |= 65536 : (e.flags |= 128, r.flags |= 131072, r.flags &= -52805, r.tag === 1 && (r.alternate === null ? r.tag = 17 : (t = fn(-1, 1), t.tag = 2, Ln(r, t, 1))), r.lanes |= 1), e) : (e.flags |= 65536, e.lanes = u, e);
  }
  var Jh = P.ReactCurrentOwner, gt = !1;
  function lt(e, t, r, o) {
    t.child = e === null ? zc(t, null, r, o) : Or(t, e.child, r, o);
  }
  function xd(e, t, r, o, u) {
    r = r.render;
    var l = t.ref;
    return Br(t, u), o = Bu(e, t, r, o, l, u), r = Uu(), e !== null && !gt ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~u, mn(e, t, u)) : (Le && r && Pu(t), t.flags |= 1, lt(e, t, o, u), t.child);
  }
  function Cd(e, t, r, o, u) {
    if (e === null) {
      var l = r.type;
      return typeof l == "function" && !wa(l) && l.defaultProps === void 0 && r.compare === null && r.defaultProps === void 0 ? (t.tag = 15, t.type = l, kd(e, t, l, o, u)) : (e = ss(r.type, null, o, t, t.mode, u), e.ref = t.ref, e.return = t, t.child = e);
    }
    if (l = e.child, (e.lanes & u) === 0) {
      var v = l.memoizedProps;
      if (r = r.compare, r = r !== null ? r : ko, r(v, o) && e.ref === t.ref) return mn(e, t, u);
    }
    return t.flags |= 1, e = On(l, o), e.ref = t.ref, e.return = t, t.child = e;
  }
  function kd(e, t, r, o, u) {
    if (e !== null) {
      var l = e.memoizedProps;
      if (ko(l, o) && e.ref === t.ref) if (gt = !1, t.pendingProps = o = l, (e.lanes & u) !== 0) (e.flags & 131072) !== 0 && (gt = !0);
      else return t.lanes = e.lanes, mn(e, t, u);
    }
    return Zu(e, t, r, o, u);
  }
  function Pd(e, t, r) {
    var o = t.pendingProps, u = o.children, l = e !== null ? e.memoizedState : null;
    if (o.mode === "hidden") if ((t.mode & 1) === 0) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, _e(Kr, bt), bt |= r;
    else {
      if ((r & 1073741824) === 0) return e = l !== null ? l.baseLanes | r : r, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, _e(Kr, bt), bt |= e, null;
      t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, o = l !== null ? l.baseLanes : r, _e(Kr, bt), bt |= o;
    }
    else l !== null ? (o = l.baseLanes | r, t.memoizedState = null) : o = r, _e(Kr, bt), bt |= o;
    return lt(e, t, u, r), t.child;
  }
  function Rd(e, t) {
    var r = t.ref;
    (e === null && r !== null || e !== null && e.ref !== r) && (t.flags |= 512, t.flags |= 2097152);
  }
  function Zu(e, t, r, o, u) {
    var l = vt(r) ? qn : rt.current;
    return l = jr(t, l), Br(t, u), r = Bu(e, t, r, o, l, u), o = Uu(), e !== null && !gt ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~u, mn(e, t, u)) : (Le && o && Pu(t), t.flags |= 1, lt(e, t, r, u), t.child);
  }
  function Td(e, t, r, o, u) {
    if (vt(r)) {
      var l = !0;
      _i(t);
    } else l = !1;
    if (Br(t, u), t.stateNode === null) Gi(e, t), hd(t, r, o), Gu(t, r, o, u), o = !0;
    else if (e === null) {
      var v = t.stateNode, C = t.memoizedProps;
      v.props = C;
      var b = v.context, z = r.contextType;
      typeof z == "object" && z !== null ? z = jt(z) : (z = vt(r) ? qn : rt.current, z = jr(t, z));
      var X = r.getDerivedStateFromProps, Z = typeof X == "function" || typeof v.getSnapshotBeforeUpdate == "function";
      Z || typeof v.UNSAFE_componentWillReceiveProps != "function" && typeof v.componentWillReceiveProps != "function" || (C !== o || b !== z) && vd(t, v, o, z), Mn = !1;
      var Y = t.memoizedState;
      v.state = Y, Oi(t, o, v, u), b = t.memoizedState, C !== o || Y !== b || ht.current || Mn ? (typeof X == "function" && (Yu(t, r, X, o), b = t.memoizedState), (C = Mn || pd(t, r, C, o, Y, b, z)) ? (Z || typeof v.UNSAFE_componentWillMount != "function" && typeof v.componentWillMount != "function" || (typeof v.componentWillMount == "function" && v.componentWillMount(), typeof v.UNSAFE_componentWillMount == "function" && v.UNSAFE_componentWillMount()), typeof v.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof v.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = o, t.memoizedState = b), v.props = o, v.state = b, v.context = z, o = C) : (typeof v.componentDidMount == "function" && (t.flags |= 4194308), o = !1);
    } else {
      v = t.stateNode, Uc(e, t), C = t.memoizedProps, z = t.type === t.elementType ? C : Wt(t.type, C), v.props = z, Z = t.pendingProps, Y = v.context, b = r.contextType, typeof b == "object" && b !== null ? b = jt(b) : (b = vt(r) ? qn : rt.current, b = jr(t, b));
      var se = r.getDerivedStateFromProps;
      (X = typeof se == "function" || typeof v.getSnapshotBeforeUpdate == "function") || typeof v.UNSAFE_componentWillReceiveProps != "function" && typeof v.componentWillReceiveProps != "function" || (C !== Z || Y !== b) && vd(t, v, o, b), Mn = !1, Y = t.memoizedState, v.state = Y, Oi(t, o, v, u);
      var le = t.memoizedState;
      C !== Z || Y !== le || ht.current || Mn ? (typeof se == "function" && (Yu(t, r, se, o), le = t.memoizedState), (z = Mn || pd(t, r, z, o, Y, le, b) || !1) ? (X || typeof v.UNSAFE_componentWillUpdate != "function" && typeof v.componentWillUpdate != "function" || (typeof v.componentWillUpdate == "function" && v.componentWillUpdate(o, le, b), typeof v.UNSAFE_componentWillUpdate == "function" && v.UNSAFE_componentWillUpdate(o, le, b)), typeof v.componentDidUpdate == "function" && (t.flags |= 4), typeof v.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof v.componentDidUpdate != "function" || C === e.memoizedProps && Y === e.memoizedState || (t.flags |= 4), typeof v.getSnapshotBeforeUpdate != "function" || C === e.memoizedProps && Y === e.memoizedState || (t.flags |= 1024), t.memoizedProps = o, t.memoizedState = le), v.props = o, v.state = le, v.context = b, o = z) : (typeof v.componentDidUpdate != "function" || C === e.memoizedProps && Y === e.memoizedState || (t.flags |= 4), typeof v.getSnapshotBeforeUpdate != "function" || C === e.memoizedProps && Y === e.memoizedState || (t.flags |= 1024), o = !1);
    }
    return qu(e, t, r, o, l, u);
  }
  function qu(e, t, r, o, u, l) {
    Rd(e, t);
    var v = (t.flags & 128) !== 0;
    if (!o && !v) return u && Fc(t, r, !1), mn(e, t, l);
    o = t.stateNode, Jh.current = t;
    var C = v && typeof r.getDerivedStateFromError != "function" ? null : o.render();
    return t.flags |= 1, e !== null && v ? (t.child = Or(t, e.child, null, l), t.child = Or(t, null, C, l)) : lt(e, t, C, l), t.memoizedState = o.state, u && Fc(t, r, !0), t.child;
  }
  function bd(e) {
    var t = e.stateNode;
    t.pendingContext ? Nc(e, t.pendingContext, t.pendingContext !== t.context) : t.context && Nc(e, t.context, !1), ju(e, t.containerInfo);
  }
  function Id(e, t, r, o, u) {
    return Dr(), Iu(u), t.flags |= 256, lt(e, t, r, o), t.child;
  }
  var ea = { dehydrated: null, treeContext: null, retryLane: 0 };
  function ta(e) {
    return { baseLanes: e, cachePool: null, transitions: null };
  }
  function Nd(e, t, r) {
    var o = t.pendingProps, u = je.current, l = !1, v = (t.flags & 128) !== 0, C;
    if ((C = v) || (C = e !== null && e.memoizedState === null ? !1 : (u & 2) !== 0), C ? (l = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (u |= 1), _e(je, u & 1), e === null)
      return bu(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? ((t.mode & 1) === 0 ? t.lanes = 1 : e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824, null) : (v = o.children, e = o.fallback, l ? (o = t.mode, l = t.child, v = { mode: "hidden", children: v }, (o & 1) === 0 && l !== null ? (l.childLanes = 0, l.pendingProps = v) : l = us(v, o, 0, null), e = lr(e, o, r, null), l.return = t, e.return = t, l.sibling = e, t.child = l, t.child.memoizedState = ta(r), t.memoizedState = ea, e) : na(t, v));
    if (u = e.memoizedState, u !== null && (C = u.dehydrated, C !== null)) return Xh(e, t, v, o, C, u, r);
    if (l) {
      l = o.fallback, v = t.mode, u = e.child, C = u.sibling;
      var b = { mode: "hidden", children: o.children };
      return (v & 1) === 0 && t.child !== u ? (o = t.child, o.childLanes = 0, o.pendingProps = b, t.deletions = null) : (o = On(u, b), o.subtreeFlags = u.subtreeFlags & 14680064), C !== null ? l = On(C, l) : (l = lr(l, v, r, null), l.flags |= 2), l.return = t, o.return = t, o.sibling = l, t.child = o, o = l, l = t.child, v = e.child.memoizedState, v = v === null ? ta(r) : { baseLanes: v.baseLanes | r, cachePool: null, transitions: v.transitions }, l.memoizedState = v, l.childLanes = e.childLanes & ~r, t.memoizedState = ea, o;
    }
    return l = e.child, e = l.sibling, o = On(l, { mode: "visible", children: o.children }), (t.mode & 1) === 0 && (o.lanes = r), o.return = t, o.sibling = null, e !== null && (r = t.deletions, r === null ? (t.deletions = [e], t.flags |= 16) : r.push(e)), t.child = o, t.memoizedState = null, o;
  }
  function na(e, t) {
    return t = us({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
  }
  function Yi(e, t, r, o) {
    return o !== null && Iu(o), Or(t, e.child, null, r), e = na(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
  }
  function Xh(e, t, r, o, u, l, v) {
    if (r)
      return t.flags & 256 ? (t.flags &= -257, o = Ju(Error(s(422))), Yi(e, t, v, o)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (l = o.fallback, u = t.mode, o = us({ mode: "visible", children: o.children }, u, 0, null), l = lr(l, u, v, null), l.flags |= 2, o.return = t, l.return = t, o.sibling = l, t.child = o, (t.mode & 1) !== 0 && Or(t, e.child, null, v), t.child.memoizedState = ta(v), t.memoizedState = ea, l);
    if ((t.mode & 1) === 0) return Yi(e, t, v, null);
    if (u.data === "$!") {
      if (o = u.nextSibling && u.nextSibling.dataset, o) var C = o.dgst;
      return o = C, l = Error(s(419)), o = Ju(l, o, void 0), Yi(e, t, v, o);
    }
    if (C = (v & e.childLanes) !== 0, gt || C) {
      if (o = Je, o !== null) {
        switch (v & -v) {
          case 4:
            u = 2;
            break;
          case 16:
            u = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            u = 32;
            break;
          case 536870912:
            u = 268435456;
            break;
          default:
            u = 0;
        }
        u = (u & (o.suspendedLanes | v)) !== 0 ? 0 : u, u !== 0 && u !== l.retryLane && (l.retryLane = u, dn(e, u), Yt(o, e, u, -1));
      }
      return ya(), o = Ju(Error(s(421))), Yi(e, t, v, o);
    }
    return u.data === "$?" ? (t.flags |= 128, t.child = e.child, t = cv.bind(null, e), u._reactRetry = t, null) : (e = l.treeContext, Tt = In(u.nextSibling), Rt = t, Le = !0, Ht = null, e !== null && (Lt[$t++] = ln, Lt[$t++] = cn, Lt[$t++] = er, ln = e.id, cn = e.overflow, er = t), t = na(t, o.children), t.flags |= 4096, t);
  }
  function _d(e, t, r) {
    e.lanes |= t;
    var o = e.alternate;
    o !== null && (o.lanes |= t), Mu(e.return, t, r);
  }
  function ra(e, t, r, o, u) {
    var l = e.memoizedState;
    l === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: o, tail: r, tailMode: u } : (l.isBackwards = t, l.rendering = null, l.renderingStartTime = 0, l.last = o, l.tail = r, l.tailMode = u);
  }
  function Fd(e, t, r) {
    var o = t.pendingProps, u = o.revealOrder, l = o.tail;
    if (lt(e, t, o.children, r), o = je.current, (o & 2) !== 0) o = o & 1 | 2, t.flags |= 128;
    else {
      if (e !== null && (e.flags & 128) !== 0) e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && _d(e, r, t);
        else if (e.tag === 19) _d(e, r, t);
        else if (e.child !== null) {
          e.child.return = e, e = e.child;
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        e.sibling.return = e.return, e = e.sibling;
      }
      o &= 1;
    }
    if (_e(je, o), (t.mode & 1) === 0) t.memoizedState = null;
    else switch (u) {
      case "forwards":
        for (r = t.child, u = null; r !== null; ) e = r.alternate, e !== null && zi(e) === null && (u = r), r = r.sibling;
        r = u, r === null ? (u = t.child, t.child = null) : (u = r.sibling, r.sibling = null), ra(t, !1, u, r, l);
        break;
      case "backwards":
        for (r = null, u = t.child, t.child = null; u !== null; ) {
          if (e = u.alternate, e !== null && zi(e) === null) {
            t.child = u;
            break;
          }
          e = u.sibling, u.sibling = r, r = u, u = e;
        }
        ra(t, !0, r, null, l);
        break;
      case "together":
        ra(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
    return t.child;
  }
  function Gi(e, t) {
    (t.mode & 1) === 0 && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
  }
  function mn(e, t, r) {
    if (e !== null && (t.dependencies = e.dependencies), ir |= t.lanes, (r & t.childLanes) === 0) return null;
    if (e !== null && t.child !== e.child) throw Error(s(153));
    if (t.child !== null) {
      for (e = t.child, r = On(e, e.pendingProps), t.child = r, r.return = t; e.sibling !== null; ) e = e.sibling, r = r.sibling = On(e, e.pendingProps), r.return = t;
      r.sibling = null;
    }
    return t.child;
  }
  function Zh(e, t, r) {
    switch (t.tag) {
      case 3:
        bd(t), Dr();
        break;
      case 5:
        Kc(t);
        break;
      case 1:
        vt(t.type) && _i(t);
        break;
      case 4:
        ju(t, t.stateNode.containerInfo);
        break;
      case 10:
        var o = t.type._context, u = t.memoizedProps.value;
        _e(Vi, o._currentValue), o._currentValue = u;
        break;
      case 13:
        if (o = t.memoizedState, o !== null)
          return o.dehydrated !== null ? (_e(je, je.current & 1), t.flags |= 128, null) : (r & t.child.childLanes) !== 0 ? Nd(e, t, r) : (_e(je, je.current & 1), e = mn(e, t, r), e !== null ? e.sibling : null);
        _e(je, je.current & 1);
        break;
      case 19:
        if (o = (r & t.childLanes) !== 0, (e.flags & 128) !== 0) {
          if (o) return Fd(e, t, r);
          t.flags |= 128;
        }
        if (u = t.memoizedState, u !== null && (u.rendering = null, u.tail = null, u.lastEffect = null), _e(je, je.current), o) break;
        return null;
      case 22:
      case 23:
        return t.lanes = 0, Pd(e, t, r);
    }
    return mn(e, t, r);
  }
  var Md, oa, Ld, $d;
  Md = function(e, t) {
    for (var r = t.child; r !== null; ) {
      if (r.tag === 5 || r.tag === 6) e.appendChild(r.stateNode);
      else if (r.tag !== 4 && r.child !== null) {
        r.child.return = r, r = r.child;
        continue;
      }
      if (r === t) break;
      for (; r.sibling === null; ) {
        if (r.return === null || r.return === t) return;
        r = r.return;
      }
      r.sibling.return = r.return, r = r.sibling;
    }
  }, oa = function() {
  }, Ld = function(e, t, r, o) {
    var u = e.memoizedProps;
    if (u !== o) {
      e = t.stateNode, rr(qt.current);
      var l = null;
      switch (r) {
        case "input":
          u = at(e, u), o = at(e, o), l = [];
          break;
        case "select":
          u = B({}, u, { value: void 0 }), o = B({}, o, { value: void 0 }), l = [];
          break;
        case "textarea":
          u = xt(e, u), o = xt(e, o), l = [];
          break;
        default:
          typeof u.onClick != "function" && typeof o.onClick == "function" && (e.onclick = bi);
      }
      xr(r, o);
      var v;
      r = null;
      for (z in u) if (!o.hasOwnProperty(z) && u.hasOwnProperty(z) && u[z] != null) if (z === "style") {
        var C = u[z];
        for (v in C) C.hasOwnProperty(v) && (r || (r = {}), r[v] = "");
      } else z !== "dangerouslySetInnerHTML" && z !== "children" && z !== "suppressContentEditableWarning" && z !== "suppressHydrationWarning" && z !== "autoFocus" && (d.hasOwnProperty(z) ? l || (l = []) : (l = l || []).push(z, null));
      for (z in o) {
        var b = o[z];
        if (C = u != null ? u[z] : void 0, o.hasOwnProperty(z) && b !== C && (b != null || C != null)) if (z === "style") if (C) {
          for (v in C) !C.hasOwnProperty(v) || b && b.hasOwnProperty(v) || (r || (r = {}), r[v] = "");
          for (v in b) b.hasOwnProperty(v) && C[v] !== b[v] && (r || (r = {}), r[v] = b[v]);
        } else r || (l || (l = []), l.push(
          z,
          r
        )), r = b;
        else z === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, C = C ? C.__html : void 0, b != null && C !== b && (l = l || []).push(z, b)) : z === "children" ? typeof b != "string" && typeof b != "number" || (l = l || []).push(z, "" + b) : z !== "suppressContentEditableWarning" && z !== "suppressHydrationWarning" && (d.hasOwnProperty(z) ? (b != null && z === "onScroll" && Fe("scroll", e), l || C === b || (l = [])) : (l = l || []).push(z, b));
      }
      r && (l = l || []).push("style", r);
      var z = l;
      (t.updateQueue = z) && (t.flags |= 4);
    }
  }, $d = function(e, t, r, o) {
    r !== o && (t.flags |= 4);
  };
  function Do(e, t) {
    if (!Le) switch (e.tailMode) {
      case "hidden":
        t = e.tail;
        for (var r = null; t !== null; ) t.alternate !== null && (r = t), t = t.sibling;
        r === null ? e.tail = null : r.sibling = null;
        break;
      case "collapsed":
        r = e.tail;
        for (var o = null; r !== null; ) r.alternate !== null && (o = r), r = r.sibling;
        o === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : o.sibling = null;
    }
  }
  function it(e) {
    var t = e.alternate !== null && e.alternate.child === e.child, r = 0, o = 0;
    if (t) for (var u = e.child; u !== null; ) r |= u.lanes | u.childLanes, o |= u.subtreeFlags & 14680064, o |= u.flags & 14680064, u.return = e, u = u.sibling;
    else for (u = e.child; u !== null; ) r |= u.lanes | u.childLanes, o |= u.subtreeFlags, o |= u.flags, u.return = e, u = u.sibling;
    return e.subtreeFlags |= o, e.childLanes = r, t;
  }
  function qh(e, t, r) {
    var o = t.pendingProps;
    switch (Ru(t), t.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return it(t), null;
      case 1:
        return vt(t.type) && Ni(), it(t), null;
      case 3:
        return o = t.stateNode, Ur(), Me(ht), Me(rt), Du(), o.pendingContext && (o.context = o.pendingContext, o.pendingContext = null), (e === null || e.child === null) && ($i(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024, Ht !== null && (ha(Ht), Ht = null))), oa(e, t), it(t), null;
      case 5:
        Vu(t);
        var u = rr(Lo.current);
        if (r = t.type, e !== null && t.stateNode != null) Ld(e, t, r, o, u), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
        else {
          if (!o) {
            if (t.stateNode === null) throw Error(s(166));
            return it(t), null;
          }
          if (e = rr(qt.current), $i(t)) {
            o = t.stateNode, r = t.type;
            var l = t.memoizedProps;
            switch (o[Zt] = t, o[Io] = l, e = (t.mode & 1) !== 0, r) {
              case "dialog":
                Fe("cancel", o), Fe("close", o);
                break;
              case "iframe":
              case "object":
              case "embed":
                Fe("load", o);
                break;
              case "video":
              case "audio":
                for (u = 0; u < Ro.length; u++) Fe(Ro[u], o);
                break;
              case "source":
                Fe("error", o);
                break;
              case "img":
              case "image":
              case "link":
                Fe(
                  "error",
                  o
                ), Fe("load", o);
                break;
              case "details":
                Fe("toggle", o);
                break;
              case "input":
                Ce(o, l), Fe("invalid", o);
                break;
              case "select":
                o._wrapperState = { wasMultiple: !!l.multiple }, Fe("invalid", o);
                break;
              case "textarea":
                Mt(o, l), Fe("invalid", o);
            }
            xr(r, l), u = null;
            for (var v in l) if (l.hasOwnProperty(v)) {
              var C = l[v];
              v === "children" ? typeof C == "string" ? o.textContent !== C && (l.suppressHydrationWarning !== !0 && Ti(o.textContent, C, e), u = ["children", C]) : typeof C == "number" && o.textContent !== "" + C && (l.suppressHydrationWarning !== !0 && Ti(
                o.textContent,
                C,
                e
              ), u = ["children", "" + C]) : d.hasOwnProperty(v) && C != null && v === "onScroll" && Fe("scroll", o);
            }
            switch (r) {
              case "input":
                Ye(o), nt(o, l, !0);
                break;
              case "textarea":
                Ye(o), mt(o);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof l.onClick == "function" && (o.onclick = bi);
            }
            o = u, t.updateQueue = o, o !== null && (t.flags |= 4);
          } else {
            v = u.nodeType === 9 ? u : u.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Ue(r)), e === "http://www.w3.org/1999/xhtml" ? r === "script" ? (e = v.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof o.is == "string" ? e = v.createElement(r, { is: o.is }) : (e = v.createElement(r), r === "select" && (v = e, o.multiple ? v.multiple = !0 : o.size && (v.size = o.size))) : e = v.createElementNS(e, r), e[Zt] = t, e[Io] = o, Md(e, t, !1, !1), t.stateNode = e;
            e: {
              switch (v = Cr(r, o), r) {
                case "dialog":
                  Fe("cancel", e), Fe("close", e), u = o;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Fe("load", e), u = o;
                  break;
                case "video":
                case "audio":
                  for (u = 0; u < Ro.length; u++) Fe(Ro[u], e);
                  u = o;
                  break;
                case "source":
                  Fe("error", e), u = o;
                  break;
                case "img":
                case "image":
                case "link":
                  Fe(
                    "error",
                    e
                  ), Fe("load", e), u = o;
                  break;
                case "details":
                  Fe("toggle", e), u = o;
                  break;
                case "input":
                  Ce(e, o), u = at(e, o), Fe("invalid", e);
                  break;
                case "option":
                  u = o;
                  break;
                case "select":
                  e._wrapperState = { wasMultiple: !!o.multiple }, u = B({}, o, { value: void 0 }), Fe("invalid", e);
                  break;
                case "textarea":
                  Mt(e, o), u = xt(e, o), Fe("invalid", e);
                  break;
                default:
                  u = o;
              }
              xr(r, u), C = u;
              for (l in C) if (C.hasOwnProperty(l)) {
                var b = C[l];
                l === "style" ? Er(e, b) : l === "dangerouslySetInnerHTML" ? (b = b ? b.__html : void 0, b != null && gn(e, b)) : l === "children" ? typeof b == "string" ? (r !== "textarea" || b !== "") && pt(e, b) : typeof b == "number" && pt(e, "" + b) : l !== "suppressContentEditableWarning" && l !== "suppressHydrationWarning" && l !== "autoFocus" && (d.hasOwnProperty(l) ? b != null && l === "onScroll" && Fe("scroll", e) : b != null && M(e, l, b, v));
              }
              switch (r) {
                case "input":
                  Ye(e), nt(e, o, !1);
                  break;
                case "textarea":
                  Ye(e), mt(e);
                  break;
                case "option":
                  o.value != null && e.setAttribute("value", "" + ve(o.value));
                  break;
                case "select":
                  e.multiple = !!o.multiple, l = o.value, l != null ? Et(e, !!o.multiple, l, !1) : o.defaultValue != null && Et(
                    e,
                    !!o.multiple,
                    o.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof u.onClick == "function" && (e.onclick = bi);
              }
              switch (r) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  o = !!o.autoFocus;
                  break e;
                case "img":
                  o = !0;
                  break e;
                default:
                  o = !1;
              }
            }
            o && (t.flags |= 4);
          }
          t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
        }
        return it(t), null;
      case 6:
        if (e && t.stateNode != null) $d(e, t, e.memoizedProps, o);
        else {
          if (typeof o != "string" && t.stateNode === null) throw Error(s(166));
          if (r = rr(Lo.current), rr(qt.current), $i(t)) {
            if (o = t.stateNode, r = t.memoizedProps, o[Zt] = t, (l = o.nodeValue !== r) && (e = Rt, e !== null)) switch (e.tag) {
              case 3:
                Ti(o.nodeValue, r, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 && Ti(o.nodeValue, r, (e.mode & 1) !== 0);
            }
            l && (t.flags |= 4);
          } else o = (r.nodeType === 9 ? r : r.ownerDocument).createTextNode(o), o[Zt] = t, t.stateNode = o;
        }
        return it(t), null;
      case 13:
        if (Me(je), o = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
          if (Le && Tt !== null && (t.mode & 1) !== 0 && (t.flags & 128) === 0) Ac(), Dr(), t.flags |= 98560, l = !1;
          else if (l = $i(t), o !== null && o.dehydrated !== null) {
            if (e === null) {
              if (!l) throw Error(s(318));
              if (l = t.memoizedState, l = l !== null ? l.dehydrated : null, !l) throw Error(s(317));
              l[Zt] = t;
            } else Dr(), (t.flags & 128) === 0 && (t.memoizedState = null), t.flags |= 4;
            it(t), l = !1;
          } else Ht !== null && (ha(Ht), Ht = null), l = !0;
          if (!l) return t.flags & 65536 ? t : null;
        }
        return (t.flags & 128) !== 0 ? (t.lanes = r, t) : (o = o !== null, o !== (e !== null && e.memoizedState !== null) && o && (t.child.flags |= 8192, (t.mode & 1) !== 0 && (e === null || (je.current & 1) !== 0 ? We === 0 && (We = 3) : ya())), t.updateQueue !== null && (t.flags |= 4), it(t), null);
      case 4:
        return Ur(), oa(e, t), e === null && To(t.stateNode.containerInfo), it(t), null;
      case 10:
        return Fu(t.type._context), it(t), null;
      case 17:
        return vt(t.type) && Ni(), it(t), null;
      case 19:
        if (Me(je), l = t.memoizedState, l === null) return it(t), null;
        if (o = (t.flags & 128) !== 0, v = l.rendering, v === null) if (o) Do(l, !1);
        else {
          if (We !== 0 || e !== null && (e.flags & 128) !== 0) for (e = t.child; e !== null; ) {
            if (v = zi(e), v !== null) {
              for (t.flags |= 128, Do(l, !1), o = v.updateQueue, o !== null && (t.updateQueue = o, t.flags |= 4), t.subtreeFlags = 0, o = r, r = t.child; r !== null; ) l = r, e = o, l.flags &= 14680066, v = l.alternate, v === null ? (l.childLanes = 0, l.lanes = e, l.child = null, l.subtreeFlags = 0, l.memoizedProps = null, l.memoizedState = null, l.updateQueue = null, l.dependencies = null, l.stateNode = null) : (l.childLanes = v.childLanes, l.lanes = v.lanes, l.child = v.child, l.subtreeFlags = 0, l.deletions = null, l.memoizedProps = v.memoizedProps, l.memoizedState = v.memoizedState, l.updateQueue = v.updateQueue, l.type = v.type, e = v.dependencies, l.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), r = r.sibling;
              return _e(je, je.current & 1 | 2), t.child;
            }
            e = e.sibling;
          }
          l.tail !== null && De() > Qr && (t.flags |= 128, o = !0, Do(l, !1), t.lanes = 4194304);
        }
        else {
          if (!o) if (e = zi(v), e !== null) {
            if (t.flags |= 128, o = !0, r = e.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), Do(l, !0), l.tail === null && l.tailMode === "hidden" && !v.alternate && !Le) return it(t), null;
          } else 2 * De() - l.renderingStartTime > Qr && r !== 1073741824 && (t.flags |= 128, o = !0, Do(l, !1), t.lanes = 4194304);
          l.isBackwards ? (v.sibling = t.child, t.child = v) : (r = l.last, r !== null ? r.sibling = v : t.child = v, l.last = v);
        }
        return l.tail !== null ? (t = l.tail, l.rendering = t, l.tail = t.sibling, l.renderingStartTime = De(), t.sibling = null, r = je.current, _e(je, o ? r & 1 | 2 : r & 1), t) : (it(t), null);
      case 22:
      case 23:
        return ga(), o = t.memoizedState !== null, e !== null && e.memoizedState !== null !== o && (t.flags |= 8192), o && (t.mode & 1) !== 0 ? (bt & 1073741824) !== 0 && (it(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : it(t), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(s(156, t.tag));
  }
  function ev(e, t) {
    switch (Ru(t), t.tag) {
      case 1:
        return vt(t.type) && Ni(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 3:
        return Ur(), Me(ht), Me(rt), Du(), e = t.flags, (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128, t) : null;
      case 5:
        return Vu(t), null;
      case 13:
        if (Me(je), e = t.memoizedState, e !== null && e.dehydrated !== null) {
          if (t.alternate === null) throw Error(s(340));
          Dr();
        }
        return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
      case 19:
        return Me(je), null;
      case 4:
        return Ur(), null;
      case 10:
        return Fu(t.type._context), null;
      case 22:
      case 23:
        return ga(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var Ji = !1, st = !1, tv = typeof WeakSet == "function" ? WeakSet : Set, ae = null;
  function Wr(e, t) {
    var r = e.ref;
    if (r !== null) if (typeof r == "function") try {
      r(null);
    } catch (o) {
      Ae(e, t, o);
    }
    else r.current = null;
  }
  function ia(e, t, r) {
    try {
      r();
    } catch (o) {
      Ae(e, t, o);
    }
  }
  var jd = !1;
  function nv(e, t) {
    if (gu = vi, e = pc(), lu(e)) {
      if ("selectionStart" in e) var r = { start: e.selectionStart, end: e.selectionEnd };
      else e: {
        r = (r = e.ownerDocument) && r.defaultView || window;
        var o = r.getSelection && r.getSelection();
        if (o && o.rangeCount !== 0) {
          r = o.anchorNode;
          var u = o.anchorOffset, l = o.focusNode;
          o = o.focusOffset;
          try {
            r.nodeType, l.nodeType;
          } catch {
            r = null;
            break e;
          }
          var v = 0, C = -1, b = -1, z = 0, X = 0, Z = e, Y = null;
          t: for (; ; ) {
            for (var se; Z !== r || u !== 0 && Z.nodeType !== 3 || (C = v + u), Z !== l || o !== 0 && Z.nodeType !== 3 || (b = v + o), Z.nodeType === 3 && (v += Z.nodeValue.length), (se = Z.firstChild) !== null; )
              Y = Z, Z = se;
            for (; ; ) {
              if (Z === e) break t;
              if (Y === r && ++z === u && (C = v), Y === l && ++X === o && (b = v), (se = Z.nextSibling) !== null) break;
              Z = Y, Y = Z.parentNode;
            }
            Z = se;
          }
          r = C === -1 || b === -1 ? null : { start: C, end: b };
        } else r = null;
      }
      r = r || { start: 0, end: 0 };
    } else r = null;
    for (yu = { focusedElem: e, selectionRange: r }, vi = !1, ae = t; ae !== null; ) if (t = ae, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, ae = e;
    else for (; ae !== null; ) {
      t = ae;
      try {
        var le = t.alternate;
        if ((t.flags & 1024) !== 0) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (le !== null) {
              var ce = le.memoizedProps, Oe = le.memoizedState, j = t.stateNode, N = j.getSnapshotBeforeUpdate(t.elementType === t.type ? ce : Wt(t.type, ce), Oe);
              j.__reactInternalSnapshotBeforeUpdate = N;
            }
            break;
          case 3:
            var V = t.stateNode.containerInfo;
            V.nodeType === 1 ? V.textContent = "" : V.nodeType === 9 && V.documentElement && V.removeChild(V.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(s(163));
        }
      } catch (te) {
        Ae(t, t.return, te);
      }
      if (e = t.sibling, e !== null) {
        e.return = t.return, ae = e;
        break;
      }
      ae = t.return;
    }
    return le = jd, jd = !1, le;
  }
  function Oo(e, t, r) {
    var o = t.updateQueue;
    if (o = o !== null ? o.lastEffect : null, o !== null) {
      var u = o = o.next;
      do {
        if ((u.tag & e) === e) {
          var l = u.destroy;
          u.destroy = void 0, l !== void 0 && ia(t, r, l);
        }
        u = u.next;
      } while (u !== o);
    }
  }
  function Xi(e, t) {
    if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
      var r = t = t.next;
      do {
        if ((r.tag & e) === e) {
          var o = r.create;
          r.destroy = o();
        }
        r = r.next;
      } while (r !== t);
    }
  }
  function sa(e) {
    var t = e.ref;
    if (t !== null) {
      var r = e.stateNode;
      switch (e.tag) {
        case 5:
          e = r;
          break;
        default:
          e = r;
      }
      typeof t == "function" ? t(e) : t.current = e;
    }
  }
  function Vd(e) {
    var t = e.alternate;
    t !== null && (e.alternate = null, Vd(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[Zt], delete t[Io], delete t[xu], delete t[Ah], delete t[Dh])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
  }
  function Ad(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function Dd(e) {
    e: for (; ; ) {
      for (; e.sibling === null; ) {
        if (e.return === null || Ad(e.return)) return null;
        e = e.return;
      }
      for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
        if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
        e.child.return = e, e = e.child;
      }
      if (!(e.flags & 2)) return e.stateNode;
    }
  }
  function ua(e, t, r) {
    var o = e.tag;
    if (o === 5 || o === 6) e = e.stateNode, t ? r.nodeType === 8 ? r.parentNode.insertBefore(e, t) : r.insertBefore(e, t) : (r.nodeType === 8 ? (t = r.parentNode, t.insertBefore(e, r)) : (t = r, t.appendChild(e)), r = r._reactRootContainer, r != null || t.onclick !== null || (t.onclick = bi));
    else if (o !== 4 && (e = e.child, e !== null)) for (ua(e, t, r), e = e.sibling; e !== null; ) ua(e, t, r), e = e.sibling;
  }
  function aa(e, t, r) {
    var o = e.tag;
    if (o === 5 || o === 6) e = e.stateNode, t ? r.insertBefore(e, t) : r.appendChild(e);
    else if (o !== 4 && (e = e.child, e !== null)) for (aa(e, t, r), e = e.sibling; e !== null; ) aa(e, t, r), e = e.sibling;
  }
  var qe = null, Kt = !1;
  function $n(e, t, r) {
    for (r = r.child; r !== null; ) Od(e, t, r), r = r.sibling;
  }
  function Od(e, t, r) {
    if (Xt && typeof Xt.onCommitFiberUnmount == "function") try {
      Xt.onCommitFiberUnmount(ci, r);
    } catch {
    }
    switch (r.tag) {
      case 5:
        st || Wr(r, t);
      case 6:
        var o = qe, u = Kt;
        qe = null, $n(e, t, r), qe = o, Kt = u, qe !== null && (Kt ? (e = qe, r = r.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(r) : e.removeChild(r)) : qe.removeChild(r.stateNode));
        break;
      case 18:
        qe !== null && (Kt ? (e = qe, r = r.stateNode, e.nodeType === 8 ? Eu(e.parentNode, r) : e.nodeType === 1 && Eu(e, r), yo(e)) : Eu(qe, r.stateNode));
        break;
      case 4:
        o = qe, u = Kt, qe = r.stateNode.containerInfo, Kt = !0, $n(e, t, r), qe = o, Kt = u;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!st && (o = r.updateQueue, o !== null && (o = o.lastEffect, o !== null))) {
          u = o = o.next;
          do {
            var l = u, v = l.destroy;
            l = l.tag, v !== void 0 && ((l & 2) !== 0 || (l & 4) !== 0) && ia(r, t, v), u = u.next;
          } while (u !== o);
        }
        $n(e, t, r);
        break;
      case 1:
        if (!st && (Wr(r, t), o = r.stateNode, typeof o.componentWillUnmount == "function")) try {
          o.props = r.memoizedProps, o.state = r.memoizedState, o.componentWillUnmount();
        } catch (C) {
          Ae(r, t, C);
        }
        $n(e, t, r);
        break;
      case 21:
        $n(e, t, r);
        break;
      case 22:
        r.mode & 1 ? (st = (o = st) || r.memoizedState !== null, $n(e, t, r), st = o) : $n(e, t, r);
        break;
      default:
        $n(e, t, r);
    }
  }
  function zd(e) {
    var t = e.updateQueue;
    if (t !== null) {
      e.updateQueue = null;
      var r = e.stateNode;
      r === null && (r = e.stateNode = new tv()), t.forEach(function(o) {
        var u = dv.bind(null, e, o);
        r.has(o) || (r.add(o), o.then(u, u));
      });
    }
  }
  function Qt(e, t) {
    var r = t.deletions;
    if (r !== null) for (var o = 0; o < r.length; o++) {
      var u = r[o];
      try {
        var l = e, v = t, C = v;
        e: for (; C !== null; ) {
          switch (C.tag) {
            case 5:
              qe = C.stateNode, Kt = !1;
              break e;
            case 3:
              qe = C.stateNode.containerInfo, Kt = !0;
              break e;
            case 4:
              qe = C.stateNode.containerInfo, Kt = !0;
              break e;
          }
          C = C.return;
        }
        if (qe === null) throw Error(s(160));
        Od(l, v, u), qe = null, Kt = !1;
        var b = u.alternate;
        b !== null && (b.return = null), u.return = null;
      } catch (z) {
        Ae(u, t, z);
      }
    }
    if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) Bd(t, e), t = t.sibling;
  }
  function Bd(e, t) {
    var r = e.alternate, o = e.flags;
    switch (e.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (Qt(t, e), tn(e), o & 4) {
          try {
            Oo(3, e, e.return), Xi(3, e);
          } catch (ce) {
            Ae(e, e.return, ce);
          }
          try {
            Oo(5, e, e.return);
          } catch (ce) {
            Ae(e, e.return, ce);
          }
        }
        break;
      case 1:
        Qt(t, e), tn(e), o & 512 && r !== null && Wr(r, r.return);
        break;
      case 5:
        if (Qt(t, e), tn(e), o & 512 && r !== null && Wr(r, r.return), e.flags & 32) {
          var u = e.stateNode;
          try {
            pt(u, "");
          } catch (ce) {
            Ae(e, e.return, ce);
          }
        }
        if (o & 4 && (u = e.stateNode, u != null)) {
          var l = e.memoizedProps, v = r !== null ? r.memoizedProps : l, C = e.type, b = e.updateQueue;
          if (e.updateQueue = null, b !== null) try {
            C === "input" && l.type === "radio" && l.name != null && fe(u, l), Cr(C, v);
            var z = Cr(C, l);
            for (v = 0; v < b.length; v += 2) {
              var X = b[v], Z = b[v + 1];
              X === "style" ? Er(u, Z) : X === "dangerouslySetInnerHTML" ? gn(u, Z) : X === "children" ? pt(u, Z) : M(u, X, Z, z);
            }
            switch (C) {
              case "input":
                dt(u, l);
                break;
              case "textarea":
                Qn(u, l);
                break;
              case "select":
                var Y = u._wrapperState.wasMultiple;
                u._wrapperState.wasMultiple = !!l.multiple;
                var se = l.value;
                se != null ? Et(u, !!l.multiple, se, !1) : Y !== !!l.multiple && (l.defaultValue != null ? Et(
                  u,
                  !!l.multiple,
                  l.defaultValue,
                  !0
                ) : Et(u, !!l.multiple, l.multiple ? [] : "", !1));
            }
            u[Io] = l;
          } catch (ce) {
            Ae(e, e.return, ce);
          }
        }
        break;
      case 6:
        if (Qt(t, e), tn(e), o & 4) {
          if (e.stateNode === null) throw Error(s(162));
          u = e.stateNode, l = e.memoizedProps;
          try {
            u.nodeValue = l;
          } catch (ce) {
            Ae(e, e.return, ce);
          }
        }
        break;
      case 3:
        if (Qt(t, e), tn(e), o & 4 && r !== null && r.memoizedState.isDehydrated) try {
          yo(t.containerInfo);
        } catch (ce) {
          Ae(e, e.return, ce);
        }
        break;
      case 4:
        Qt(t, e), tn(e);
        break;
      case 13:
        Qt(t, e), tn(e), u = e.child, u.flags & 8192 && (l = u.memoizedState !== null, u.stateNode.isHidden = l, !l || u.alternate !== null && u.alternate.memoizedState !== null || (da = De())), o & 4 && zd(e);
        break;
      case 22:
        if (X = r !== null && r.memoizedState !== null, e.mode & 1 ? (st = (z = st) || X, Qt(t, e), st = z) : Qt(t, e), tn(e), o & 8192) {
          if (z = e.memoizedState !== null, (e.stateNode.isHidden = z) && !X && (e.mode & 1) !== 0) for (ae = e, X = e.child; X !== null; ) {
            for (Z = ae = X; ae !== null; ) {
              switch (Y = ae, se = Y.child, Y.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Oo(4, Y, Y.return);
                  break;
                case 1:
                  Wr(Y, Y.return);
                  var le = Y.stateNode;
                  if (typeof le.componentWillUnmount == "function") {
                    o = Y, r = Y.return;
                    try {
                      t = o, le.props = t.memoizedProps, le.state = t.memoizedState, le.componentWillUnmount();
                    } catch (ce) {
                      Ae(o, r, ce);
                    }
                  }
                  break;
                case 5:
                  Wr(Y, Y.return);
                  break;
                case 22:
                  if (Y.memoizedState !== null) {
                    Wd(Z);
                    continue;
                  }
              }
              se !== null ? (se.return = Y, ae = se) : Wd(Z);
            }
            X = X.sibling;
          }
          e: for (X = null, Z = e; ; ) {
            if (Z.tag === 5) {
              if (X === null) {
                X = Z;
                try {
                  u = Z.stateNode, z ? (l = u.style, typeof l.setProperty == "function" ? l.setProperty("display", "none", "important") : l.display = "none") : (C = Z.stateNode, b = Z.memoizedProps.style, v = b != null && b.hasOwnProperty("display") ? b.display : null, C.style.display = zt("display", v));
                } catch (ce) {
                  Ae(e, e.return, ce);
                }
              }
            } else if (Z.tag === 6) {
              if (X === null) try {
                Z.stateNode.nodeValue = z ? "" : Z.memoizedProps;
              } catch (ce) {
                Ae(e, e.return, ce);
              }
            } else if ((Z.tag !== 22 && Z.tag !== 23 || Z.memoizedState === null || Z === e) && Z.child !== null) {
              Z.child.return = Z, Z = Z.child;
              continue;
            }
            if (Z === e) break e;
            for (; Z.sibling === null; ) {
              if (Z.return === null || Z.return === e) break e;
              X === Z && (X = null), Z = Z.return;
            }
            X === Z && (X = null), Z.sibling.return = Z.return, Z = Z.sibling;
          }
        }
        break;
      case 19:
        Qt(t, e), tn(e), o & 4 && zd(e);
        break;
      case 21:
        break;
      default:
        Qt(
          t,
          e
        ), tn(e);
    }
  }
  function tn(e) {
    var t = e.flags;
    if (t & 2) {
      try {
        e: {
          for (var r = e.return; r !== null; ) {
            if (Ad(r)) {
              var o = r;
              break e;
            }
            r = r.return;
          }
          throw Error(s(160));
        }
        switch (o.tag) {
          case 5:
            var u = o.stateNode;
            o.flags & 32 && (pt(u, ""), o.flags &= -33);
            var l = Dd(e);
            aa(e, l, u);
            break;
          case 3:
          case 4:
            var v = o.stateNode.containerInfo, C = Dd(e);
            ua(e, C, v);
            break;
          default:
            throw Error(s(161));
        }
      } catch (b) {
        Ae(e, e.return, b);
      }
      e.flags &= -3;
    }
    t & 4096 && (e.flags &= -4097);
  }
  function rv(e, t, r) {
    ae = e, Ud(e);
  }
  function Ud(e, t, r) {
    for (var o = (e.mode & 1) !== 0; ae !== null; ) {
      var u = ae, l = u.child;
      if (u.tag === 22 && o) {
        var v = u.memoizedState !== null || Ji;
        if (!v) {
          var C = u.alternate, b = C !== null && C.memoizedState !== null || st;
          C = Ji;
          var z = st;
          if (Ji = v, (st = b) && !z) for (ae = u; ae !== null; ) v = ae, b = v.child, v.tag === 22 && v.memoizedState !== null ? Kd(u) : b !== null ? (b.return = v, ae = b) : Kd(u);
          for (; l !== null; ) ae = l, Ud(l), l = l.sibling;
          ae = u, Ji = C, st = z;
        }
        Hd(e);
      } else (u.subtreeFlags & 8772) !== 0 && l !== null ? (l.return = u, ae = l) : Hd(e);
    }
  }
  function Hd(e) {
    for (; ae !== null; ) {
      var t = ae;
      if ((t.flags & 8772) !== 0) {
        var r = t.alternate;
        try {
          if ((t.flags & 8772) !== 0) switch (t.tag) {
            case 0:
            case 11:
            case 15:
              st || Xi(5, t);
              break;
            case 1:
              var o = t.stateNode;
              if (t.flags & 4 && !st) if (r === null) o.componentDidMount();
              else {
                var u = t.elementType === t.type ? r.memoizedProps : Wt(t.type, r.memoizedProps);
                o.componentDidUpdate(u, r.memoizedState, o.__reactInternalSnapshotBeforeUpdate);
              }
              var l = t.updateQueue;
              l !== null && Wc(t, l, o);
              break;
            case 3:
              var v = t.updateQueue;
              if (v !== null) {
                if (r = null, t.child !== null) switch (t.child.tag) {
                  case 5:
                    r = t.child.stateNode;
                    break;
                  case 1:
                    r = t.child.stateNode;
                }
                Wc(t, v, r);
              }
              break;
            case 5:
              var C = t.stateNode;
              if (r === null && t.flags & 4) {
                r = C;
                var b = t.memoizedProps;
                switch (t.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    b.autoFocus && r.focus();
                    break;
                  case "img":
                    b.src && (r.src = b.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var z = t.alternate;
                if (z !== null) {
                  var X = z.memoizedState;
                  if (X !== null) {
                    var Z = X.dehydrated;
                    Z !== null && yo(Z);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(s(163));
          }
          st || t.flags & 512 && sa(t);
        } catch (Y) {
          Ae(t, t.return, Y);
        }
      }
      if (t === e) {
        ae = null;
        break;
      }
      if (r = t.sibling, r !== null) {
        r.return = t.return, ae = r;
        break;
      }
      ae = t.return;
    }
  }
  function Wd(e) {
    for (; ae !== null; ) {
      var t = ae;
      if (t === e) {
        ae = null;
        break;
      }
      var r = t.sibling;
      if (r !== null) {
        r.return = t.return, ae = r;
        break;
      }
      ae = t.return;
    }
  }
  function Kd(e) {
    for (; ae !== null; ) {
      var t = ae;
      try {
        switch (t.tag) {
          case 0:
          case 11:
          case 15:
            var r = t.return;
            try {
              Xi(4, t);
            } catch (b) {
              Ae(t, r, b);
            }
            break;
          case 1:
            var o = t.stateNode;
            if (typeof o.componentDidMount == "function") {
              var u = t.return;
              try {
                o.componentDidMount();
              } catch (b) {
                Ae(t, u, b);
              }
            }
            var l = t.return;
            try {
              sa(t);
            } catch (b) {
              Ae(t, l, b);
            }
            break;
          case 5:
            var v = t.return;
            try {
              sa(t);
            } catch (b) {
              Ae(t, v, b);
            }
        }
      } catch (b) {
        Ae(t, t.return, b);
      }
      if (t === e) {
        ae = null;
        break;
      }
      var C = t.sibling;
      if (C !== null) {
        C.return = t.return, ae = C;
        break;
      }
      ae = t.return;
    }
  }
  var ov = Math.ceil, Zi = P.ReactCurrentDispatcher, la = P.ReactCurrentOwner, At = P.ReactCurrentBatchConfig, Pe = 0, Je = null, Be = null, et = 0, bt = 0, Kr = Nn(0), We = 0, zo = null, ir = 0, qi = 0, ca = 0, Bo = null, yt = null, da = 0, Qr = 1 / 0, pn = null, es = !1, fa = null, jn = null, ts = !1, Vn = null, ns = 0, Uo = 0, ma = null, rs = -1, os = 0;
  function ct() {
    return (Pe & 6) !== 0 ? De() : rs !== -1 ? rs : rs = De();
  }
  function An(e) {
    return (e.mode & 1) === 0 ? 1 : (Pe & 2) !== 0 && et !== 0 ? et & -et : zh.transition !== null ? (os === 0 && (os = Dl()), os) : (e = Ie, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Yl(e.type)), e);
  }
  function Yt(e, t, r, o) {
    if (50 < Uo) throw Uo = 0, ma = null, Error(s(185));
    mo(e, r, o), ((Pe & 2) === 0 || e !== Je) && (e === Je && ((Pe & 2) === 0 && (qi |= r), We === 4 && Dn(e, et)), wt(e, o), r === 1 && Pe === 0 && (t.mode & 1) === 0 && (Qr = De() + 500, Fi && Fn()));
  }
  function wt(e, t) {
    var r = e.callbackNode;
    zp(e, t);
    var o = mi(e, e === Je ? et : 0);
    if (o === 0) r !== null && jl(r), e.callbackNode = null, e.callbackPriority = 0;
    else if (t = o & -o, e.callbackPriority !== t) {
      if (r != null && jl(r), t === 1) e.tag === 0 ? Oh(Yd.bind(null, e)) : Mc(Yd.bind(null, e)), jh(function() {
        (Pe & 6) === 0 && Fn();
      }), r = null;
      else {
        switch (Ol(o)) {
          case 1:
            r = Ks;
            break;
          case 4:
            r = Vl;
            break;
          case 16:
            r = li;
            break;
          case 536870912:
            r = Al;
            break;
          default:
            r = li;
        }
        r = nf(r, Qd.bind(null, e));
      }
      e.callbackPriority = t, e.callbackNode = r;
    }
  }
  function Qd(e, t) {
    if (rs = -1, os = 0, (Pe & 6) !== 0) throw Error(s(327));
    var r = e.callbackNode;
    if (Yr() && e.callbackNode !== r) return null;
    var o = mi(e, e === Je ? et : 0);
    if (o === 0) return null;
    if ((o & 30) !== 0 || (o & e.expiredLanes) !== 0 || t) t = is(e, o);
    else {
      t = o;
      var u = Pe;
      Pe |= 2;
      var l = Jd();
      (Je !== e || et !== t) && (pn = null, Qr = De() + 500, ur(e, t));
      do
        try {
          uv();
          break;
        } catch (C) {
          Gd(e, C);
        }
      while (!0);
      _u(), Zi.current = l, Pe = u, Be !== null ? t = 0 : (Je = null, et = 0, t = We);
    }
    if (t !== 0) {
      if (t === 2 && (u = Qs(e), u !== 0 && (o = u, t = pa(e, u))), t === 1) throw r = zo, ur(e, 0), Dn(e, o), wt(e, De()), r;
      if (t === 6) Dn(e, o);
      else {
        if (u = e.current.alternate, (o & 30) === 0 && !iv(u) && (t = is(e, o), t === 2 && (l = Qs(e), l !== 0 && (o = l, t = pa(e, l))), t === 1)) throw r = zo, ur(e, 0), Dn(e, o), wt(e, De()), r;
        switch (e.finishedWork = u, e.finishedLanes = o, t) {
          case 0:
          case 1:
            throw Error(s(345));
          case 2:
            ar(e, yt, pn);
            break;
          case 3:
            if (Dn(e, o), (o & 130023424) === o && (t = da + 500 - De(), 10 < t)) {
              if (mi(e, 0) !== 0) break;
              if (u = e.suspendedLanes, (u & o) !== o) {
                ct(), e.pingedLanes |= e.suspendedLanes & u;
                break;
              }
              e.timeoutHandle = Su(ar.bind(null, e, yt, pn), t);
              break;
            }
            ar(e, yt, pn);
            break;
          case 4:
            if (Dn(e, o), (o & 4194240) === o) break;
            for (t = e.eventTimes, u = -1; 0 < o; ) {
              var v = 31 - Bt(o);
              l = 1 << v, v = t[v], v > u && (u = v), o &= ~l;
            }
            if (o = u, o = De() - o, o = (120 > o ? 120 : 480 > o ? 480 : 1080 > o ? 1080 : 1920 > o ? 1920 : 3e3 > o ? 3e3 : 4320 > o ? 4320 : 1960 * ov(o / 1960)) - o, 10 < o) {
              e.timeoutHandle = Su(ar.bind(null, e, yt, pn), o);
              break;
            }
            ar(e, yt, pn);
            break;
          case 5:
            ar(e, yt, pn);
            break;
          default:
            throw Error(s(329));
        }
      }
    }
    return wt(e, De()), e.callbackNode === r ? Qd.bind(null, e) : null;
  }
  function pa(e, t) {
    var r = Bo;
    return e.current.memoizedState.isDehydrated && (ur(e, t).flags |= 256), e = is(e, t), e !== 2 && (t = yt, yt = r, t !== null && ha(t)), e;
  }
  function ha(e) {
    yt === null ? yt = e : yt.push.apply(yt, e);
  }
  function iv(e) {
    for (var t = e; ; ) {
      if (t.flags & 16384) {
        var r = t.updateQueue;
        if (r !== null && (r = r.stores, r !== null)) for (var o = 0; o < r.length; o++) {
          var u = r[o], l = u.getSnapshot;
          u = u.value;
          try {
            if (!Ut(l(), u)) return !1;
          } catch {
            return !1;
          }
        }
      }
      if (r = t.child, t.subtreeFlags & 16384 && r !== null) r.return = t, t = r;
      else {
        if (t === e) break;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e) return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
    }
    return !0;
  }
  function Dn(e, t) {
    for (t &= ~ca, t &= ~qi, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
      var r = 31 - Bt(t), o = 1 << r;
      e[r] = -1, t &= ~o;
    }
  }
  function Yd(e) {
    if ((Pe & 6) !== 0) throw Error(s(327));
    Yr();
    var t = mi(e, 0);
    if ((t & 1) === 0) return wt(e, De()), null;
    var r = is(e, t);
    if (e.tag !== 0 && r === 2) {
      var o = Qs(e);
      o !== 0 && (t = o, r = pa(e, o));
    }
    if (r === 1) throw r = zo, ur(e, 0), Dn(e, t), wt(e, De()), r;
    if (r === 6) throw Error(s(345));
    return e.finishedWork = e.current.alternate, e.finishedLanes = t, ar(e, yt, pn), wt(e, De()), null;
  }
  function va(e, t) {
    var r = Pe;
    Pe |= 1;
    try {
      return e(t);
    } finally {
      Pe = r, Pe === 0 && (Qr = De() + 500, Fi && Fn());
    }
  }
  function sr(e) {
    Vn !== null && Vn.tag === 0 && (Pe & 6) === 0 && Yr();
    var t = Pe;
    Pe |= 1;
    var r = At.transition, o = Ie;
    try {
      if (At.transition = null, Ie = 1, e) return e();
    } finally {
      Ie = o, At.transition = r, Pe = t, (Pe & 6) === 0 && Fn();
    }
  }
  function ga() {
    bt = Kr.current, Me(Kr);
  }
  function ur(e, t) {
    e.finishedWork = null, e.finishedLanes = 0;
    var r = e.timeoutHandle;
    if (r !== -1 && (e.timeoutHandle = -1, $h(r)), Be !== null) for (r = Be.return; r !== null; ) {
      var o = r;
      switch (Ru(o), o.tag) {
        case 1:
          o = o.type.childContextTypes, o != null && Ni();
          break;
        case 3:
          Ur(), Me(ht), Me(rt), Du();
          break;
        case 5:
          Vu(o);
          break;
        case 4:
          Ur();
          break;
        case 13:
          Me(je);
          break;
        case 19:
          Me(je);
          break;
        case 10:
          Fu(o.type._context);
          break;
        case 22:
        case 23:
          ga();
      }
      r = r.return;
    }
    if (Je = e, Be = e = On(e.current, null), et = bt = t, We = 0, zo = null, ca = qi = ir = 0, yt = Bo = null, nr !== null) {
      for (t = 0; t < nr.length; t++) if (r = nr[t], o = r.interleaved, o !== null) {
        r.interleaved = null;
        var u = o.next, l = r.pending;
        if (l !== null) {
          var v = l.next;
          l.next = u, o.next = v;
        }
        r.pending = o;
      }
      nr = null;
    }
    return e;
  }
  function Gd(e, t) {
    do {
      var r = Be;
      try {
        if (_u(), Bi.current = Ki, Ui) {
          for (var o = Ve.memoizedState; o !== null; ) {
            var u = o.queue;
            u !== null && (u.pending = null), o = o.next;
          }
          Ui = !1;
        }
        if (or = 0, Ge = He = Ve = null, $o = !1, jo = 0, la.current = null, r === null || r.return === null) {
          We = 1, zo = t, Be = null;
          break;
        }
        e: {
          var l = e, v = r.return, C = r, b = t;
          if (t = et, C.flags |= 32768, b !== null && typeof b == "object" && typeof b.then == "function") {
            var z = b, X = C, Z = X.tag;
            if ((X.mode & 1) === 0 && (Z === 0 || Z === 11 || Z === 15)) {
              var Y = X.alternate;
              Y ? (X.updateQueue = Y.updateQueue, X.memoizedState = Y.memoizedState, X.lanes = Y.lanes) : (X.updateQueue = null, X.memoizedState = null);
            }
            var se = Sd(v);
            if (se !== null) {
              se.flags &= -257, Ed(se, v, C, l, t), se.mode & 1 && wd(l, z, t), t = se, b = z;
              var le = t.updateQueue;
              if (le === null) {
                var ce = /* @__PURE__ */ new Set();
                ce.add(b), t.updateQueue = ce;
              } else le.add(b);
              break e;
            } else {
              if ((t & 1) === 0) {
                wd(l, z, t), ya();
                break e;
              }
              b = Error(s(426));
            }
          } else if (Le && C.mode & 1) {
            var Oe = Sd(v);
            if (Oe !== null) {
              (Oe.flags & 65536) === 0 && (Oe.flags |= 256), Ed(Oe, v, C, l, t), Iu(Hr(b, C));
              break e;
            }
          }
          l = b = Hr(b, C), We !== 4 && (We = 2), Bo === null ? Bo = [l] : Bo.push(l), l = v;
          do {
            switch (l.tag) {
              case 3:
                l.flags |= 65536, t &= -t, l.lanes |= t;
                var j = gd(l, b, t);
                Hc(l, j);
                break e;
              case 1:
                C = b;
                var N = l.type, V = l.stateNode;
                if ((l.flags & 128) === 0 && (typeof N.getDerivedStateFromError == "function" || V !== null && typeof V.componentDidCatch == "function" && (jn === null || !jn.has(V)))) {
                  l.flags |= 65536, t &= -t, l.lanes |= t;
                  var te = yd(l, C, t);
                  Hc(l, te);
                  break e;
                }
            }
            l = l.return;
          } while (l !== null);
        }
        Zd(r);
      } catch (me) {
        t = me, Be === r && r !== null && (Be = r = r.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Jd() {
    var e = Zi.current;
    return Zi.current = Ki, e === null ? Ki : e;
  }
  function ya() {
    (We === 0 || We === 3 || We === 2) && (We = 4), Je === null || (ir & 268435455) === 0 && (qi & 268435455) === 0 || Dn(Je, et);
  }
  function is(e, t) {
    var r = Pe;
    Pe |= 2;
    var o = Jd();
    (Je !== e || et !== t) && (pn = null, ur(e, t));
    do
      try {
        sv();
        break;
      } catch (u) {
        Gd(e, u);
      }
    while (!0);
    if (_u(), Pe = r, Zi.current = o, Be !== null) throw Error(s(261));
    return Je = null, et = 0, We;
  }
  function sv() {
    for (; Be !== null; ) Xd(Be);
  }
  function uv() {
    for (; Be !== null && !Fp(); ) Xd(Be);
  }
  function Xd(e) {
    var t = tf(e.alternate, e, bt);
    e.memoizedProps = e.pendingProps, t === null ? Zd(e) : Be = t, la.current = null;
  }
  function Zd(e) {
    var t = e;
    do {
      var r = t.alternate;
      if (e = t.return, (t.flags & 32768) === 0) {
        if (r = qh(r, t, bt), r !== null) {
          Be = r;
          return;
        }
      } else {
        if (r = ev(r, t), r !== null) {
          r.flags &= 32767, Be = r;
          return;
        }
        if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
        else {
          We = 6, Be = null;
          return;
        }
      }
      if (t = t.sibling, t !== null) {
        Be = t;
        return;
      }
      Be = t = e;
    } while (t !== null);
    We === 0 && (We = 5);
  }
  function ar(e, t, r) {
    var o = Ie, u = At.transition;
    try {
      At.transition = null, Ie = 1, av(e, t, r, o);
    } finally {
      At.transition = u, Ie = o;
    }
    return null;
  }
  function av(e, t, r, o) {
    do
      Yr();
    while (Vn !== null);
    if ((Pe & 6) !== 0) throw Error(s(327));
    r = e.finishedWork;
    var u = e.finishedLanes;
    if (r === null) return null;
    if (e.finishedWork = null, e.finishedLanes = 0, r === e.current) throw Error(s(177));
    e.callbackNode = null, e.callbackPriority = 0;
    var l = r.lanes | r.childLanes;
    if (Bp(e, l), e === Je && (Be = Je = null, et = 0), (r.subtreeFlags & 2064) === 0 && (r.flags & 2064) === 0 || ts || (ts = !0, nf(li, function() {
      return Yr(), null;
    })), l = (r.flags & 15990) !== 0, (r.subtreeFlags & 15990) !== 0 || l) {
      l = At.transition, At.transition = null;
      var v = Ie;
      Ie = 1;
      var C = Pe;
      Pe |= 4, la.current = null, nv(e, r), Bd(r, e), bh(yu), vi = !!gu, yu = gu = null, e.current = r, rv(r), Mp(), Pe = C, Ie = v, At.transition = l;
    } else e.current = r;
    if (ts && (ts = !1, Vn = e, ns = u), l = e.pendingLanes, l === 0 && (jn = null), jp(r.stateNode), wt(e, De()), t !== null) for (o = e.onRecoverableError, r = 0; r < t.length; r++) u = t[r], o(u.value, { componentStack: u.stack, digest: u.digest });
    if (es) throw es = !1, e = fa, fa = null, e;
    return (ns & 1) !== 0 && e.tag !== 0 && Yr(), l = e.pendingLanes, (l & 1) !== 0 ? e === ma ? Uo++ : (Uo = 0, ma = e) : Uo = 0, Fn(), null;
  }
  function Yr() {
    if (Vn !== null) {
      var e = Ol(ns), t = At.transition, r = Ie;
      try {
        if (At.transition = null, Ie = 16 > e ? 16 : e, Vn === null) var o = !1;
        else {
          if (e = Vn, Vn = null, ns = 0, (Pe & 6) !== 0) throw Error(s(331));
          var u = Pe;
          for (Pe |= 4, ae = e.current; ae !== null; ) {
            var l = ae, v = l.child;
            if ((ae.flags & 16) !== 0) {
              var C = l.deletions;
              if (C !== null) {
                for (var b = 0; b < C.length; b++) {
                  var z = C[b];
                  for (ae = z; ae !== null; ) {
                    var X = ae;
                    switch (X.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Oo(8, X, l);
                    }
                    var Z = X.child;
                    if (Z !== null) Z.return = X, ae = Z;
                    else for (; ae !== null; ) {
                      X = ae;
                      var Y = X.sibling, se = X.return;
                      if (Vd(X), X === z) {
                        ae = null;
                        break;
                      }
                      if (Y !== null) {
                        Y.return = se, ae = Y;
                        break;
                      }
                      ae = se;
                    }
                  }
                }
                var le = l.alternate;
                if (le !== null) {
                  var ce = le.child;
                  if (ce !== null) {
                    le.child = null;
                    do {
                      var Oe = ce.sibling;
                      ce.sibling = null, ce = Oe;
                    } while (ce !== null);
                  }
                }
                ae = l;
              }
            }
            if ((l.subtreeFlags & 2064) !== 0 && v !== null) v.return = l, ae = v;
            else e: for (; ae !== null; ) {
              if (l = ae, (l.flags & 2048) !== 0) switch (l.tag) {
                case 0:
                case 11:
                case 15:
                  Oo(9, l, l.return);
              }
              var j = l.sibling;
              if (j !== null) {
                j.return = l.return, ae = j;
                break e;
              }
              ae = l.return;
            }
          }
          var N = e.current;
          for (ae = N; ae !== null; ) {
            v = ae;
            var V = v.child;
            if ((v.subtreeFlags & 2064) !== 0 && V !== null) V.return = v, ae = V;
            else e: for (v = N; ae !== null; ) {
              if (C = ae, (C.flags & 2048) !== 0) try {
                switch (C.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Xi(9, C);
                }
              } catch (me) {
                Ae(C, C.return, me);
              }
              if (C === v) {
                ae = null;
                break e;
              }
              var te = C.sibling;
              if (te !== null) {
                te.return = C.return, ae = te;
                break e;
              }
              ae = C.return;
            }
          }
          if (Pe = u, Fn(), Xt && typeof Xt.onPostCommitFiberRoot == "function") try {
            Xt.onPostCommitFiberRoot(ci, e);
          } catch {
          }
          o = !0;
        }
        return o;
      } finally {
        Ie = r, At.transition = t;
      }
    }
    return !1;
  }
  function qd(e, t, r) {
    t = Hr(r, t), t = gd(e, t, 1), e = Ln(e, t, 1), t = ct(), e !== null && (mo(e, 1, t), wt(e, t));
  }
  function Ae(e, t, r) {
    if (e.tag === 3) qd(e, e, r);
    else for (; t !== null; ) {
      if (t.tag === 3) {
        qd(t, e, r);
        break;
      } else if (t.tag === 1) {
        var o = t.stateNode;
        if (typeof t.type.getDerivedStateFromError == "function" || typeof o.componentDidCatch == "function" && (jn === null || !jn.has(o))) {
          e = Hr(r, e), e = yd(t, e, 1), t = Ln(t, e, 1), e = ct(), t !== null && (mo(t, 1, e), wt(t, e));
          break;
        }
      }
      t = t.return;
    }
  }
  function lv(e, t, r) {
    var o = e.pingCache;
    o !== null && o.delete(t), t = ct(), e.pingedLanes |= e.suspendedLanes & r, Je === e && (et & r) === r && (We === 4 || We === 3 && (et & 130023424) === et && 500 > De() - da ? ur(e, 0) : ca |= r), wt(e, t);
  }
  function ef(e, t) {
    t === 0 && ((e.mode & 1) === 0 ? t = 1 : (t = fi, fi <<= 1, (fi & 130023424) === 0 && (fi = 4194304)));
    var r = ct();
    e = dn(e, t), e !== null && (mo(e, t, r), wt(e, r));
  }
  function cv(e) {
    var t = e.memoizedState, r = 0;
    t !== null && (r = t.retryLane), ef(e, r);
  }
  function dv(e, t) {
    var r = 0;
    switch (e.tag) {
      case 13:
        var o = e.stateNode, u = e.memoizedState;
        u !== null && (r = u.retryLane);
        break;
      case 19:
        o = e.stateNode;
        break;
      default:
        throw Error(s(314));
    }
    o !== null && o.delete(t), ef(e, r);
  }
  var tf;
  tf = function(e, t, r) {
    if (e !== null) if (e.memoizedProps !== t.pendingProps || ht.current) gt = !0;
    else {
      if ((e.lanes & r) === 0 && (t.flags & 128) === 0) return gt = !1, Zh(e, t, r);
      gt = (e.flags & 131072) !== 0;
    }
    else gt = !1, Le && (t.flags & 1048576) !== 0 && Lc(t, Li, t.index);
    switch (t.lanes = 0, t.tag) {
      case 2:
        var o = t.type;
        Gi(e, t), e = t.pendingProps;
        var u = jr(t, rt.current);
        Br(t, r), u = Bu(null, t, o, e, u, r);
        var l = Uu();
        return t.flags |= 1, typeof u == "object" && u !== null && typeof u.render == "function" && u.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, vt(o) ? (l = !0, _i(t)) : l = !1, t.memoizedState = u.state !== null && u.state !== void 0 ? u.state : null, $u(t), u.updater = Qi, t.stateNode = u, u._reactInternals = t, Gu(t, o, e, r), t = qu(null, t, o, !0, l, r)) : (t.tag = 0, Le && l && Pu(t), lt(null, t, u, r), t = t.child), t;
      case 16:
        o = t.elementType;
        e: {
          switch (Gi(e, t), e = t.pendingProps, u = o._init, o = u(o._payload), t.type = o, u = t.tag = mv(o), e = Wt(o, e), u) {
            case 0:
              t = Zu(null, t, o, e, r);
              break e;
            case 1:
              t = Td(null, t, o, e, r);
              break e;
            case 11:
              t = xd(null, t, o, e, r);
              break e;
            case 14:
              t = Cd(null, t, o, Wt(o.type, e), r);
              break e;
          }
          throw Error(s(
            306,
            o,
            ""
          ));
        }
        return t;
      case 0:
        return o = t.type, u = t.pendingProps, u = t.elementType === o ? u : Wt(o, u), Zu(e, t, o, u, r);
      case 1:
        return o = t.type, u = t.pendingProps, u = t.elementType === o ? u : Wt(o, u), Td(e, t, o, u, r);
      case 3:
        e: {
          if (bd(t), e === null) throw Error(s(387));
          o = t.pendingProps, l = t.memoizedState, u = l.element, Uc(e, t), Oi(t, o, null, r);
          var v = t.memoizedState;
          if (o = v.element, l.isDehydrated) if (l = { element: o, isDehydrated: !1, cache: v.cache, pendingSuspenseBoundaries: v.pendingSuspenseBoundaries, transitions: v.transitions }, t.updateQueue.baseState = l, t.memoizedState = l, t.flags & 256) {
            u = Hr(Error(s(423)), t), t = Id(e, t, o, r, u);
            break e;
          } else if (o !== u) {
            u = Hr(Error(s(424)), t), t = Id(e, t, o, r, u);
            break e;
          } else for (Tt = In(t.stateNode.containerInfo.firstChild), Rt = t, Le = !0, Ht = null, r = zc(t, null, o, r), t.child = r; r; ) r.flags = r.flags & -3 | 4096, r = r.sibling;
          else {
            if (Dr(), o === u) {
              t = mn(e, t, r);
              break e;
            }
            lt(e, t, o, r);
          }
          t = t.child;
        }
        return t;
      case 5:
        return Kc(t), e === null && bu(t), o = t.type, u = t.pendingProps, l = e !== null ? e.memoizedProps : null, v = u.children, wu(o, u) ? v = null : l !== null && wu(o, l) && (t.flags |= 32), Rd(e, t), lt(e, t, v, r), t.child;
      case 6:
        return e === null && bu(t), null;
      case 13:
        return Nd(e, t, r);
      case 4:
        return ju(t, t.stateNode.containerInfo), o = t.pendingProps, e === null ? t.child = Or(t, null, o, r) : lt(e, t, o, r), t.child;
      case 11:
        return o = t.type, u = t.pendingProps, u = t.elementType === o ? u : Wt(o, u), xd(e, t, o, u, r);
      case 7:
        return lt(e, t, t.pendingProps, r), t.child;
      case 8:
        return lt(e, t, t.pendingProps.children, r), t.child;
      case 12:
        return lt(e, t, t.pendingProps.children, r), t.child;
      case 10:
        e: {
          if (o = t.type._context, u = t.pendingProps, l = t.memoizedProps, v = u.value, _e(Vi, o._currentValue), o._currentValue = v, l !== null) if (Ut(l.value, v)) {
            if (l.children === u.children && !ht.current) {
              t = mn(e, t, r);
              break e;
            }
          } else for (l = t.child, l !== null && (l.return = t); l !== null; ) {
            var C = l.dependencies;
            if (C !== null) {
              v = l.child;
              for (var b = C.firstContext; b !== null; ) {
                if (b.context === o) {
                  if (l.tag === 1) {
                    b = fn(-1, r & -r), b.tag = 2;
                    var z = l.updateQueue;
                    if (z !== null) {
                      z = z.shared;
                      var X = z.pending;
                      X === null ? b.next = b : (b.next = X.next, X.next = b), z.pending = b;
                    }
                  }
                  l.lanes |= r, b = l.alternate, b !== null && (b.lanes |= r), Mu(
                    l.return,
                    r,
                    t
                  ), C.lanes |= r;
                  break;
                }
                b = b.next;
              }
            } else if (l.tag === 10) v = l.type === t.type ? null : l.child;
            else if (l.tag === 18) {
              if (v = l.return, v === null) throw Error(s(341));
              v.lanes |= r, C = v.alternate, C !== null && (C.lanes |= r), Mu(v, r, t), v = l.sibling;
            } else v = l.child;
            if (v !== null) v.return = l;
            else for (v = l; v !== null; ) {
              if (v === t) {
                v = null;
                break;
              }
              if (l = v.sibling, l !== null) {
                l.return = v.return, v = l;
                break;
              }
              v = v.return;
            }
            l = v;
          }
          lt(e, t, u.children, r), t = t.child;
        }
        return t;
      case 9:
        return u = t.type, o = t.pendingProps.children, Br(t, r), u = jt(u), o = o(u), t.flags |= 1, lt(e, t, o, r), t.child;
      case 14:
        return o = t.type, u = Wt(o, t.pendingProps), u = Wt(o.type, u), Cd(e, t, o, u, r);
      case 15:
        return kd(e, t, t.type, t.pendingProps, r);
      case 17:
        return o = t.type, u = t.pendingProps, u = t.elementType === o ? u : Wt(o, u), Gi(e, t), t.tag = 1, vt(o) ? (e = !0, _i(t)) : e = !1, Br(t, r), hd(t, o, u), Gu(t, o, u, r), qu(null, t, o, !0, e, r);
      case 19:
        return Fd(e, t, r);
      case 22:
        return Pd(e, t, r);
    }
    throw Error(s(156, t.tag));
  };
  function nf(e, t) {
    return $l(e, t);
  }
  function fv(e, t, r, o) {
    this.tag = e, this.key = r, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = o, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Dt(e, t, r, o) {
    return new fv(e, t, r, o);
  }
  function wa(e) {
    return e = e.prototype, !(!e || !e.isReactComponent);
  }
  function mv(e) {
    if (typeof e == "function") return wa(e) ? 1 : 0;
    if (e != null) {
      if (e = e.$$typeof, e === q) return 11;
      if (e === ie) return 14;
    }
    return 2;
  }
  function On(e, t) {
    var r = e.alternate;
    return r === null ? (r = Dt(e.tag, t, e.key, e.mode), r.elementType = e.elementType, r.type = e.type, r.stateNode = e.stateNode, r.alternate = e, e.alternate = r) : (r.pendingProps = t, r.type = e.type, r.flags = 0, r.subtreeFlags = 0, r.deletions = null), r.flags = e.flags & 14680064, r.childLanes = e.childLanes, r.lanes = e.lanes, r.child = e.child, r.memoizedProps = e.memoizedProps, r.memoizedState = e.memoizedState, r.updateQueue = e.updateQueue, t = e.dependencies, r.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, r.sibling = e.sibling, r.index = e.index, r.ref = e.ref, r;
  }
  function ss(e, t, r, o, u, l) {
    var v = 2;
    if (o = e, typeof e == "function") wa(e) && (v = 1);
    else if (typeof e == "string") v = 5;
    else e: switch (e) {
      case A:
        return lr(r.children, u, l, t);
      case U:
        v = 8, u |= 8;
        break;
      case H:
        return e = Dt(12, r, t, u | 2), e.elementType = H, e.lanes = l, e;
      case ee:
        return e = Dt(13, r, t, u), e.elementType = ee, e.lanes = l, e;
      case re:
        return e = Dt(19, r, t, u), e.elementType = re, e.lanes = l, e;
      case W:
        return us(r, u, l, t);
      default:
        if (typeof e == "object" && e !== null) switch (e.$$typeof) {
          case K:
            v = 10;
            break e;
          case Q:
            v = 9;
            break e;
          case q:
            v = 11;
            break e;
          case ie:
            v = 14;
            break e;
          case ue:
            v = 16, o = null;
            break e;
        }
        throw Error(s(130, e == null ? e : typeof e, ""));
    }
    return t = Dt(v, r, t, u), t.elementType = e, t.type = o, t.lanes = l, t;
  }
  function lr(e, t, r, o) {
    return e = Dt(7, e, o, t), e.lanes = r, e;
  }
  function us(e, t, r, o) {
    return e = Dt(22, e, o, t), e.elementType = W, e.lanes = r, e.stateNode = { isHidden: !1 }, e;
  }
  function Sa(e, t, r) {
    return e = Dt(6, e, null, t), e.lanes = r, e;
  }
  function Ea(e, t, r) {
    return t = Dt(4, e.children !== null ? e.children : [], e.key, t), t.lanes = r, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
  }
  function pv(e, t, r, o, u) {
    this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Ys(0), this.expirationTimes = Ys(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ys(0), this.identifierPrefix = o, this.onRecoverableError = u, this.mutableSourceEagerHydrationData = null;
  }
  function xa(e, t, r, o, u, l, v, C, b) {
    return e = new pv(e, t, r, C, b), t === 1 ? (t = 1, l === !0 && (t |= 8)) : t = 0, l = Dt(3, null, null, t), e.current = l, l.stateNode = e, l.memoizedState = { element: o, isDehydrated: r, cache: null, transitions: null, pendingSuspenseBoundaries: null }, $u(l), e;
  }
  function hv(e, t, r) {
    var o = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: $, key: o == null ? null : "" + o, children: e, containerInfo: t, implementation: r };
  }
  function rf(e) {
    if (!e) return _n;
    e = e._reactInternals;
    e: {
      if (xn(e) !== e || e.tag !== 1) throw Error(s(170));
      var t = e;
      do {
        switch (t.tag) {
          case 3:
            t = t.stateNode.context;
            break e;
          case 1:
            if (vt(t.type)) {
              t = t.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        t = t.return;
      } while (t !== null);
      throw Error(s(171));
    }
    if (e.tag === 1) {
      var r = e.type;
      if (vt(r)) return _c(e, r, t);
    }
    return t;
  }
  function of(e, t, r, o, u, l, v, C, b) {
    return e = xa(r, o, !0, e, u, l, v, C, b), e.context = rf(null), r = e.current, o = ct(), u = An(r), l = fn(o, u), l.callback = t ?? null, Ln(r, l, u), e.current.lanes = u, mo(e, u, o), wt(e, o), e;
  }
  function as(e, t, r, o) {
    var u = t.current, l = ct(), v = An(u);
    return r = rf(r), t.context === null ? t.context = r : t.pendingContext = r, t = fn(l, v), t.payload = { element: e }, o = o === void 0 ? null : o, o !== null && (t.callback = o), e = Ln(u, t, v), e !== null && (Yt(e, u, v, l), Di(e, u, v)), v;
  }
  function ls(e) {
    if (e = e.current, !e.child) return null;
    switch (e.child.tag) {
      case 5:
        return e.child.stateNode;
      default:
        return e.child.stateNode;
    }
  }
  function sf(e, t) {
    if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
      var r = e.retryLane;
      e.retryLane = r !== 0 && r < t ? r : t;
    }
  }
  function Ca(e, t) {
    sf(e, t), (e = e.alternate) && sf(e, t);
  }
  function vv() {
    return null;
  }
  var uf = typeof reportError == "function" ? reportError : function(e) {
    console.error(e);
  };
  function ka(e) {
    this._internalRoot = e;
  }
  cs.prototype.render = ka.prototype.render = function(e) {
    var t = this._internalRoot;
    if (t === null) throw Error(s(409));
    as(e, t, null, null);
  }, cs.prototype.unmount = ka.prototype.unmount = function() {
    var e = this._internalRoot;
    if (e !== null) {
      this._internalRoot = null;
      var t = e.containerInfo;
      sr(function() {
        as(null, e, null, null);
      }), t[un] = null;
    }
  };
  function cs(e) {
    this._internalRoot = e;
  }
  cs.prototype.unstable_scheduleHydration = function(e) {
    if (e) {
      var t = Ul();
      e = { blockedOn: null, target: e, priority: t };
      for (var r = 0; r < Rn.length && t !== 0 && t < Rn[r].priority; r++) ;
      Rn.splice(r, 0, e), r === 0 && Kl(e);
    }
  };
  function Pa(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
  }
  function ds(e) {
    return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
  }
  function af() {
  }
  function gv(e, t, r, o, u) {
    if (u) {
      if (typeof o == "function") {
        var l = o;
        o = function() {
          var z = ls(v);
          l.call(z);
        };
      }
      var v = of(t, o, e, 0, null, !1, !1, "", af);
      return e._reactRootContainer = v, e[un] = v.current, To(e.nodeType === 8 ? e.parentNode : e), sr(), v;
    }
    for (; u = e.lastChild; ) e.removeChild(u);
    if (typeof o == "function") {
      var C = o;
      o = function() {
        var z = ls(b);
        C.call(z);
      };
    }
    var b = xa(e, 0, !1, null, null, !1, !1, "", af);
    return e._reactRootContainer = b, e[un] = b.current, To(e.nodeType === 8 ? e.parentNode : e), sr(function() {
      as(t, b, r, o);
    }), b;
  }
  function fs(e, t, r, o, u) {
    var l = r._reactRootContainer;
    if (l) {
      var v = l;
      if (typeof u == "function") {
        var C = u;
        u = function() {
          var b = ls(v);
          C.call(b);
        };
      }
      as(t, v, e, u);
    } else v = gv(r, t, e, u, o);
    return ls(v);
  }
  zl = function(e) {
    switch (e.tag) {
      case 3:
        var t = e.stateNode;
        if (t.current.memoizedState.isDehydrated) {
          var r = fo(t.pendingLanes);
          r !== 0 && (Gs(t, r | 1), wt(t, De()), (Pe & 6) === 0 && (Qr = De() + 500, Fn()));
        }
        break;
      case 13:
        sr(function() {
          var o = dn(e, 1);
          if (o !== null) {
            var u = ct();
            Yt(o, e, 1, u);
          }
        }), Ca(e, 1);
    }
  }, Js = function(e) {
    if (e.tag === 13) {
      var t = dn(e, 134217728);
      if (t !== null) {
        var r = ct();
        Yt(t, e, 134217728, r);
      }
      Ca(e, 134217728);
    }
  }, Bl = function(e) {
    if (e.tag === 13) {
      var t = An(e), r = dn(e, t);
      if (r !== null) {
        var o = ct();
        Yt(r, e, t, o);
      }
      Ca(e, t);
    }
  }, Ul = function() {
    return Ie;
  }, Hl = function(e, t) {
    var r = Ie;
    try {
      return Ie = e, t();
    } finally {
      Ie = r;
    }
  }, lo = function(e, t, r) {
    switch (t) {
      case "input":
        if (dt(e, r), t = r.name, r.type === "radio" && t != null) {
          for (r = e; r.parentNode; ) r = r.parentNode;
          for (r = r.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < r.length; t++) {
            var o = r[t];
            if (o !== e && o.form === e.form) {
              var u = Ii(o);
              if (!u) throw Error(s(90));
              ze(o), dt(o, u);
            }
          }
        }
        break;
      case "textarea":
        Qn(e, r);
        break;
      case "select":
        t = r.value, t != null && Et(e, !!r.multiple, t, !1);
    }
  }, Gn = va, ui = sr;
  var yv = { usingClientEntryPoint: !1, Events: [No, Lr, Ii, si, Yn, va] }, Ho = { findFiberByHostInstance: Zn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, wv = { bundleType: Ho.bundleType, version: Ho.version, rendererPackageName: Ho.rendererPackageName, rendererConfig: Ho.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: P.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
    return e = Ml(e), e === null ? null : e.stateNode;
  }, findFiberByHostInstance: Ho.findFiberByHostInstance || vv, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var ms = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!ms.isDisabled && ms.supportsFiber) try {
      ci = ms.inject(wv), Xt = ms;
    } catch {
    }
  }
  return St.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = yv, St.createPortal = function(e, t) {
    var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Pa(t)) throw Error(s(200));
    return hv(e, t, null, r);
  }, St.createRoot = function(e, t) {
    if (!Pa(e)) throw Error(s(299));
    var r = !1, o = "", u = uf;
    return t != null && (t.unstable_strictMode === !0 && (r = !0), t.identifierPrefix !== void 0 && (o = t.identifierPrefix), t.onRecoverableError !== void 0 && (u = t.onRecoverableError)), t = xa(e, 1, !1, null, null, r, !1, o, u), e[un] = t.current, To(e.nodeType === 8 ? e.parentNode : e), new ka(t);
  }, St.findDOMNode = function(e) {
    if (e == null) return null;
    if (e.nodeType === 1) return e;
    var t = e._reactInternals;
    if (t === void 0)
      throw typeof e.render == "function" ? Error(s(188)) : (e = Object.keys(e).join(","), Error(s(268, e)));
    return e = Ml(t), e = e === null ? null : e.stateNode, e;
  }, St.flushSync = function(e) {
    return sr(e);
  }, St.hydrate = function(e, t, r) {
    if (!ds(t)) throw Error(s(200));
    return fs(null, e, t, !0, r);
  }, St.hydrateRoot = function(e, t, r) {
    if (!Pa(e)) throw Error(s(405));
    var o = r != null && r.hydratedSources || null, u = !1, l = "", v = uf;
    if (r != null && (r.unstable_strictMode === !0 && (u = !0), r.identifierPrefix !== void 0 && (l = r.identifierPrefix), r.onRecoverableError !== void 0 && (v = r.onRecoverableError)), t = of(t, null, e, 1, r ?? null, u, !1, l, v), e[un] = t.current, To(e), o) for (e = 0; e < o.length; e++) r = o[e], u = r._getVersion, u = u(r._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [r, u] : t.mutableSourceEagerHydrationData.push(
      r,
      u
    );
    return new cs(t);
  }, St.render = function(e, t, r) {
    if (!ds(t)) throw Error(s(200));
    return fs(null, e, t, !1, r);
  }, St.unmountComponentAtNode = function(e) {
    if (!ds(e)) throw Error(s(40));
    return e._reactRootContainer ? (sr(function() {
      fs(null, null, e, !1, function() {
        e._reactRootContainer = null, e[un] = null;
      });
    }), !0) : !1;
  }, St.unstable_batchedUpdates = va, St.unstable_renderSubtreeIntoContainer = function(e, t, r, o) {
    if (!ds(r)) throw Error(s(200));
    if (e == null || e._reactInternals === void 0) throw Error(s(38));
    return fs(e, t, r, !1, o);
  }, St.version = "18.3.1-next-f1338f8080-20240426", St;
}
var vf;
function qf() {
  if (vf) return ba.exports;
  vf = 1;
  function n() {
    if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (i) {
        console.error(i);
      }
  }
  return n(), ba.exports = Iv(), ba.exports;
}
var gf;
function Nv() {
  if (gf) return ps;
  gf = 1;
  var n = qf();
  return ps.createRoot = n.createRoot, ps.hydrateRoot = n.hydrateRoot, ps;
}
var em = Nv(), yf = qf(), _v = Object.defineProperty, tm = (n, i) => {
  for (var s in i)
    _v(n, s, {
      get: i[s],
      enumerable: !0,
      configurable: !0,
      set: (a) => i[s] = () => a
    });
};
if (typeof c.createContext != "function") {
  const n = [
    'Remotion requires React.createContext, but it is "undefined".',
    'If you are in a React Server Component, turn it into a client component by adding "use client" at the top of the file.',
    "",
    "Before:",
    '  import {useCurrentFrame} from "remotion";',
    "",
    "After:",
    '  "use client";',
    '  import {useCurrentFrame} from "remotion";'
  ];
  throw new Error(n.join(`
`));
}
var mr = c.createContext(!1), Va = ({ children: n }) => /* @__PURE__ */ E.jsx(mr.Provider, {
  value: !0,
  children: n
}), nm = c.createContext({
  setError: () => {
  },
  clearError: () => {
  }
}), wf = () => {
  try {
    return typeof __webpack_module__ > "u" ? null : __webpack_module__.hot ?? null;
  } catch {
    return null;
  }
};
class Fv extends ge.Component {
  constructor() {
    super(...arguments);
    Ne(this, "state", { hasError: !1 });
    Ne(this, "hmrStatusHandler", null);
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidCatch(s) {
    this.props.onError(s), this.subscribeToHmrReset();
  }
  componentDidMount() {
    this.state.hasError || this.props.onClear();
  }
  componentDidUpdate(s, a) {
    a.hasError && !this.state.hasError && this.props.onClear();
  }
  componentWillUnmount() {
    this.unsubscribeFromHmrReset();
  }
  subscribeToHmrReset() {
    if (this.hmrStatusHandler)
      return;
    const s = wf();
    if (!s)
      return;
    const a = (d) => {
      d === "idle" && (this.unsubscribeFromHmrReset(), this.setState({ hasError: !1 }));
    };
    this.hmrStatusHandler = a, s.addStatusHandler(a);
  }
  unsubscribeFromHmrReset() {
    const s = this.hmrStatusHandler;
    if (!s)
      return;
    this.hmrStatusHandler = null;
    const a = wf();
    a && a.removeStatusHandler(s);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}
var Zr = c.createContext({
  compositions: [],
  folders: [],
  currentCompositionMetadata: null,
  canvasContent: null
}), Rs = c.createContext({
  registerComposition: () => {
  },
  unregisterComposition: () => {
  },
  registerFolder: () => {
  },
  unregisterFolder: () => {
  },
  setCanvasContent: () => {
  },
  onlyRenderComposition: null
}), Xo = c.createContext({
  getNonce: () => 0
}), ys = 0;
try {
  typeof __webpack_module__ < "u" && __webpack_module__.hot && __webpack_module__.hot.addStatusHandler((n) => {
    n === "idle" && ys++;
  });
} catch {
}
var el = () => {
  const i = c.useContext(Xo).getNonce(), s = c.useRef(i);
  s.current = i;
  const a = c.useRef([[ys, i]]), d = c.useCallback(() => (ys !== a.current[a.current.length - 1][0] && (a.current = [
    ...a.current,
    [ys, s.current]
  ]), a.current), [a]);
  return c.useMemo(() => ({ get: d }), [d]);
};
function Zo(n) {
  return !!n;
}
var Mv = c.createContext({
  folderName: null,
  parentName: null
});
function Sf() {
  return ["NOD", "E_EN", "V"].join("");
}
var Ef = () => ["e", "nv"].join(""), Gt = () => {
  const n = typeof window < "u" && window.remotion_isPlayer, i = typeof window < "u" && typeof window.process < "u" && typeof window.process.env < "u" && (window.process[Ef()][Sf()] === "test" || window.process[Ef()][Sf()] === "production" && typeof window < "u" && typeof window.remotion_puppeteerTimeout < "u"), s = typeof window < "u" && window.remotion_isStudio, a = typeof window < "u" && window.remotion_isReadOnlyStudio;
  return {
    isStudio: s,
    isRendering: i,
    isPlayer: n,
    isReadOnlyStudio: a,
    isClientSideRendering: !1
  };
}, Aa = "remotion-date:", Da = "remotion-file:", Lv = ({
  data: n,
  indent: i,
  staticBase: s
}) => {
  let a = !1, d = !1, f = !1, h = !1;
  try {
    return { serializedString: JSON.stringify(n, function(m, g) {
      const w = this[m];
      return w instanceof Date ? (a = !0, `${Aa}${w.toISOString()}`) : w instanceof Map ? (f = !0, g) : w instanceof Set ? (h = !0, g) : typeof w == "string" && s !== null && w.startsWith(s) ? (d = !0, `${Da}${w.replace(s + "/", "")}`) : g;
    }, i), customDateUsed: a, customFileUsed: d, mapUsed: f, setUsed: h };
  } catch (p) {
    throw new Error("Could not serialize the passed input props to JSON: " + p.message);
  }
}, rm = (n) => JSON.parse(n, (i, s) => typeof s == "string" && s.startsWith(Aa) ? new Date(s.replace(Aa, "")) : typeof s == "string" && s.startsWith(Da) ? `${window.remotion_staticBase}/${s.replace(Da, "")}` : s), $v = (n) => rm(Lv({
  data: n,
  indent: 2,
  staticBase: window.remotion_staticBase
}).serializedString), cr = (n) => Gt().isStudio ? $v(n) : n, om = c.createContext(!1), jv = ({
  children: n
}) => /* @__PURE__ */ E.jsx(om.Provider, {
  value: !0,
  children: n
}), tl = () => c.useContext(om), Bn = ({
  className: n,
  classPrefix: i,
  type: s
}) => {
  if (!n)
    return !1;
  if (s === "exact") {
    const a = n.split(" ");
    return i.some((d) => a.some((f) => f.trim() === d || f.trim().endsWith(`:${d}`) || f.trim().endsWith(`!${d}`)));
  }
  return i.some((a) => n.startsWith(a) || n.includes(` ${a}`) || n.includes(`!${a}`) || n.includes(`:${a}`));
}, Vv = (n, i) => {
  const { style: s, ...a } = n, d = c.useMemo(() => ({
    position: "absolute",
    top: Bn({
      className: a.className,
      classPrefix: ["top-", "inset-"],
      type: "prefix"
    }) ? void 0 : 0,
    left: Bn({
      className: a.className,
      classPrefix: ["left-", "inset-"],
      type: "prefix"
    }) ? void 0 : 0,
    right: Bn({
      className: a.className,
      classPrefix: ["right-", "inset-"],
      type: "prefix"
    }) ? void 0 : 0,
    bottom: Bn({
      className: a.className,
      classPrefix: ["bottom-", "inset-"],
      type: "prefix"
    }) ? void 0 : 0,
    width: Bn({
      className: a.className,
      classPrefix: ["w-"],
      type: "prefix"
    }) ? void 0 : "100%",
    height: Bn({
      className: a.className,
      classPrefix: ["h-"],
      type: "prefix"
    }) ? void 0 : "100%",
    display: Bn({
      className: a.className,
      classPrefix: [
        "block",
        "inline-block",
        "inline",
        "flex",
        "inline-flex",
        "flow-root",
        "grid",
        "inline-grid",
        "contents",
        "list-item",
        "hidden"
      ],
      type: "exact"
    }) ? void 0 : "flex",
    flexDirection: Bn({
      className: a.className,
      classPrefix: [
        "flex-row",
        "flex-col",
        "flex-row-reverse",
        "flex-col-reverse"
      ],
      type: "exact"
    }) ? void 0 : "column",
    ...s
  }), [a.className, s]);
  return /* @__PURE__ */ E.jsx("div", {
    ref: i,
    style: d,
    ...a
  });
}, nl = c.forwardRef(Vv), Av = {
  transform: "rotate(90deg)"
}, xf = 40, Dv = {
  color: "white",
  fontSize: 14,
  fontFamily: "sans-serif"
}, Ov = {
  justifyContent: "center",
  alignItems: "center"
}, zv = () => /* @__PURE__ */ E.jsxs(nl, {
  style: Ov,
  id: "remotion-comp-loading",
  children: [
    /* @__PURE__ */ E.jsx("style", {
      type: "text/css",
      children: `
				@keyframes anim {
					from {
						opacity: 0
					}
					to {
						opacity: 1
					}
				}
				#remotion-comp-loading {
					animation: anim 2s;
					animation-fill-mode: forwards;
				}
			`
    }),
    /* @__PURE__ */ E.jsx("svg", {
      width: xf,
      height: xf,
      viewBox: "-100 -100 400 400",
      style: Av,
      children: /* @__PURE__ */ E.jsx("path", {
        fill: "#555",
        stroke: "#555",
        strokeWidth: "100",
        strokeLinejoin: "round",
        d: "M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
      })
    }),
    /* @__PURE__ */ E.jsxs("p", {
      style: Dv,
      children: [
        "Resolving ",
        "<Suspense>",
        "..."
      ]
    })
  ]
}), It = null, Oa = () => {
  if (!It) {
    if (typeof document > "u")
      throw new Error("Tried to call an API that only works in the browser from outside the browser");
    It = document.createElement("div"), It.style.position = "absolute", It.style.top = "0px", It.style.left = "0px", It.style.right = "0px", It.style.bottom = "0px", It.style.width = "100%", It.style.height = "100%", It.style.display = "flex", It.style.flexDirection = "column";
    const n = document.createElement("div");
    n.style.position = "fixed", n.style.top = "-999999px", n.appendChild(It), document.body.appendChild(n);
  }
  return It;
}, za = () => "remotion_inputPropsOverride" + window.location.origin, im = () => {
  if (typeof localStorage > "u")
    return null;
  const n = localStorage.getItem(za());
  return n ? JSON.parse(n) : null;
}, Bv = (n) => {
  if (!(typeof localStorage > "u")) {
    if (n === null) {
      localStorage.removeItem(za());
      return;
    }
    localStorage.setItem(za(), JSON.stringify(n));
  }
}, Cf = !1, Uv = () => {
  Cf || (Cf = !0, console.warn("Called `getInputProps()` on the server. This function is not available server-side and has returned an empty object."), console.warn("To hide this warning, don't call this function on the server:"), console.warn("  typeof window === 'undefined' ? {} : getInputProps()"));
}, Hv = () => {
  if (typeof window > "u")
    return Uv(), {};
  if (Gt().isPlayer)
    throw new Error("You cannot call `getInputProps()` from a <Player>. Instead, the props are available as React props from component that you passed as `component` prop.");
  const n = im();
  if (n)
    return n;
  if (typeof window > "u" || typeof window.remotion_inputProps > "u")
    throw new Error("Cannot call `getInputProps()` - window.remotion_inputProps is not set. This API is only available if you are in the Studio, or while you are rendering server-side.");
  const i = window.remotion_inputProps;
  return i ? rm(i) : {};
}, rl = c.createContext({
  props: {},
  updateProps: () => {
    throw new Error("Not implemented");
  }
}), Wv = ge.createRef(), sm = ({ children: n }) => {
  const [i, s] = ge.useState({}), a = c.useCallback(({
    defaultProps: f,
    id: h,
    newProps: p
  }) => {
    s((m) => ({
      ...m,
      [h]: typeof p == "function" ? p(m[h] ?? f) : p
    }));
  }, []), d = c.useMemo(() => ({ props: i, updateProps: a }), [i, a]);
  return /* @__PURE__ */ E.jsx(rl.Provider, {
    value: d,
    children: n
  });
}, um = ge.createContext(null), Qe = () => {
  const n = c.useContext(um), [i] = c.useState(() => Gt());
  return n ?? i;
};
function xs(n, i, s) {
  if (typeof n != "number")
    throw new Error(`The "${i}" prop ${s} must be a number, but you passed a value of type ${typeof n}`);
  if (isNaN(n))
    throw new TypeError(`The "${i}" prop ${s} must not be NaN, but is NaN.`);
  if (!Number.isFinite(n))
    throw new TypeError(`The "${i}" prop ${s} must be finite, but is ${n}.`);
  if (n % 1 !== 0)
    throw new TypeError(`The "${i}" prop ${s} must be an integer, but is ${n}.`);
  if (n <= 0)
    throw new TypeError(`The "${i}" prop ${s} must be positive, but got ${n}.`);
}
function Ts(n, i) {
  const { allowFloats: s, component: a } = i;
  if (typeof n > "u")
    throw new Error(`The "durationInFrames" prop ${a} is missing.`);
  if (typeof n != "number")
    throw new Error(`The "durationInFrames" prop ${a} must be a number, but you passed a value of type ${typeof n}`);
  if (n <= 0)
    throw new TypeError(`The "durationInFrames" prop ${a} must be positive, but got ${n}.`);
  if (!s && n % 1 !== 0)
    throw new TypeError(`The "durationInFrames" prop ${a} must be an integer, but got ${n}.`);
  if (!Number.isFinite(n))
    throw new TypeError(`The "durationInFrames" prop ${a} must be finite, but got ${n}.`);
}
function am(n, i, s) {
  if (typeof n != "number")
    throw new Error(`"fps" must be a number, but you passed a value of type ${typeof n} ${i}`);
  if (!Number.isFinite(n))
    throw new Error(`"fps" must be a finite, but you passed ${n} ${i}`);
  if (isNaN(n))
    throw new Error(`"fps" must not be NaN, but got ${n} ${i}`);
  if (n <= 0)
    throw new TypeError(`"fps" must be positive, but got ${n} ${i}`);
}
var bs = c.createContext(null), Kv = c.createRef(), Qv = (n) => !!n.calculateMetadata, ol = (n) => {
  const i = c.useContext(bs), { props: s } = c.useContext(rl), { compositions: a, canvasContent: d, currentCompositionMetadata: f } = c.useContext(Zr), h = (d == null ? void 0 : d.type) === "composition" ? d.compositionId : null, p = n ?? h, m = a.find((y) => y.id === p), g = c.useMemo(() => m ? s[m.id] ?? {} : {}, [s, m]), w = Qe();
  return c.useMemo(() => m ? f ? {
    type: "success",
    result: {
      ...f,
      id: m.id,
      defaultProps: m.defaultProps ?? {}
    }
  } : Qv(m) ? !i || !i[m.id] ? null : i[m.id] : (Ts(m.durationInFrames, {
    allowFloats: !1,
    component: `in <Composition id="${m.id}">`
  }), am(m.fps, `in <Composition id="${m.id}">`), xs(m.width, "width", `in <Composition id="${m.id}">`), xs(m.height, "height", `in <Composition id="${m.id}">`), {
    type: "success",
    result: {
      width: m.width,
      height: m.height,
      fps: m.fps,
      id: m.id,
      durationInFrames: m.durationInFrames,
      defaultProps: m.defaultProps ?? {},
      props: {
        ...m.defaultProps ?? {},
        ...g ?? {},
        ...typeof window > "u" || w.isPlayer || !window.remotion_inputProps ? {} : Hv() ?? {}
      },
      defaultCodec: null,
      defaultOutName: null,
      defaultVideoImageFormat: null,
      defaultPixelFormat: null,
      defaultProResProfile: null,
      defaultSampleRate: null
    }
  }) : null, [
    m,
    i,
    f,
    g,
    w.isPlayer
  ]);
}, lm = (n) => {
  const i = n.stack ?? "";
  return i.startsWith("Error:") ? i : `${n.message}
${i}`;
}, Yv = (n) => n instanceof Error ? !0 : !(n === null || typeof n != "object" || !("stack" in n) || typeof n.stack != "string" || !("message" in n) || typeof n.message != "string");
function il(n, i) {
  let s;
  throw Yv(i) ? (s = i, s.stack || (s.stack = new Error(s.message).stack)) : typeof i == "string" ? s = Error(i) : s = Error("Rendering was cancelled"), n && (n.remotion_cancelledError = lm(s)), s;
}
function Go(n) {
  return il(typeof window < "u" ? window : void 0, n);
}
var Gv = ["trace", "verbose", "info", "warn", "error"], kf = (n) => Gv.indexOf(n), Is = (n, i) => kf(n) <= kf(i), qo = ({
  args: n,
  logLevel: i,
  tag: s
}) => {
  const a = [...n];
  return Gt().isRendering && !Gt().isClientSideRendering && a.unshift(Symbol.for(`__remotion_level_${i}`)), s && Gt().isRendering && !Gt().isClientSideRendering && a.unshift(Symbol.for(`__remotion_tag_${s}`)), a;
}, Jv = (n, ...i) => {
  if (Is(n.logLevel, "verbose"))
    return console.debug(...qo({ args: i, logLevel: "verbose", tag: n.tag }));
}, Xv = (n, ...i) => {
  if (Is(n.logLevel, "trace"))
    return console.debug(...qo({ args: i, logLevel: "trace", tag: n.tag }));
}, Zv = (n, ...i) => {
  if (Is(n.logLevel, "info"))
    return console.log(...qo({ args: i, logLevel: "info", tag: n.tag }));
}, qv = (n, ...i) => {
  if (Is(n.logLevel, "warn"))
    return console.warn(...qo({ args: i, logLevel: "warn", tag: n.tag }));
}, eg = (n, ...i) => console.error(...qo({ args: i, logLevel: "error", tag: n.tag })), Ze = {
  trace: Xv,
  verbose: Jv,
  info: Zv,
  warn: qv,
  error: eg
};
typeof window < "u" && (window.remotion_renderReady = !1, window.remotion_delayRenderTimeouts || (window.remotion_delayRenderTimeouts = {}), window.remotion_delayRenderHandles = []);
var tg = "The delayRender was called:", ng = "Retries left: ", rg = "- Rendering the frame will be retried.", og = "handle was cleared after", ig = 3e4, cm = ({
  scope: n,
  environment: i,
  label: s,
  options: a
}) => {
  var h;
  if (typeof s != "string" && s !== null)
    throw new Error("The label parameter of delayRender() must be a string or undefined, got: " + JSON.stringify(s));
  const d = Math.random();
  n.remotion_delayRenderHandles.push(d);
  const f = ((h = Error().stack) == null ? void 0 : h.replace(/^Error/g, "")) ?? "";
  if (i.isRendering) {
    const p = ((a == null ? void 0 : a.timeoutInMilliseconds) ?? n.remotion_puppeteerTimeout ?? ig) - 2e3, m = ((a == null ? void 0 : a.retries) ?? 0) - (n.remotion_attempt - 1);
    n.remotion_delayRenderTimeouts[d] = {
      label: s ?? null,
      startTime: Date.now(),
      timeout: setTimeout(() => {
        const g = [
          "A delayRender()",
          s ? `"${s}"` : null,
          `was called but not cleared after ${p}ms. See https://remotion.dev/docs/timeout for help.`,
          m > 0 ? ng + m : null,
          m > 0 ? rg : null,
          tg,
          f
        ].filter(Zo).join(" ");
        i.isClientSideRendering ? n.remotion_cancelledError = lm(Error(g)) : il(n, Error(g));
      }, p)
    };
  }
  return n.remotion_renderReady = !1, d;
}, Pf = (n, i) => typeof window > "u" ? Math.random() : cm({
  scope: window,
  environment: Gt(),
  label: n ?? null,
  options: {}
}), sg = ({
  scope: n,
  handle: i,
  environment: s,
  logLevel: a
}) => {
  if (typeof i > "u")
    throw new TypeError("The continueRender() method must be called with a parameter that is the return value of delayRender(). No value was passed.");
  if (typeof i != "number")
    throw new TypeError("The parameter passed into continueRender() must be the return value of delayRender() which is a number. Got: " + JSON.stringify(i));
  n.remotion_delayRenderHandles = n.remotion_delayRenderHandles.filter((d) => {
    if (d === i) {
      if (s.isRendering && n !== void 0) {
        if (!n.remotion_delayRenderTimeouts[i])
          return !1;
        const { label: f, startTime: h, timeout: p } = n.remotion_delayRenderTimeouts[i];
        clearTimeout(p);
        const m = [
          f ? `"${f}"` : "A handle",
          og,
          `${Date.now() - h}ms`
        ].filter(Zo).join(" ");
        Ze.verbose({ logLevel: a, tag: "delayRender()" }, m), delete n.remotion_delayRenderTimeouts[i];
      }
      return !1;
    }
    return !0;
  }), n.remotion_delayRenderHandles.length === 0 && (n.remotion_renderReady = !0);
}, pr = c.createContext({
  logLevel: "info",
  mountTime: 0
}), rn = () => {
  const { logLevel: n } = c.useContext(pr);
  if (n === null)
    throw new Error("useLogLevel must be used within a LogLevelProvider");
  return n;
}, ei = () => {
  const { mountTime: n } = c.useContext(pr);
  if (n === null)
    throw new Error("useMountTime must be used within a LogLevelProvider");
  return n;
}, dm = c.createContext(null), Jt = () => {
  const n = Qe(), i = c.useContext(dm) ?? (typeof window < "u" ? window : void 0), s = rn(), a = c.useCallback((h, p) => i ? cm({
    scope: i,
    environment: n,
    label: h ?? null,
    options: p ?? {}
  }) : Math.random(), [n, i]), d = c.useCallback((h) => {
    i && sg({
      scope: i,
      handle: h,
      environment: n,
      logLevel: s
    });
  }, [n, s, i]), f = c.useCallback((h) => il(i ?? (typeof window < "u" ? window : void 0), h), [i]);
  return { delayRender: a, continueRender: d, cancelRender: f };
}, fm = ({
  compProps: n,
  componentName: i,
  noSuspense: s
}) => {
  const a = c.useRef(null);
  return "component" in n && (a.current = n.component), c.useMemo(() => {
    if ("component" in n) {
      if (typeof document > "u" || s)
        return n.component;
      if (typeof n.component > "u")
        throw new Error(`A value of \`undefined\` was passed to the \`component\` prop. Check the value you are passing to the <${i}/> component.`);
      return (h) => {
        const p = a.current;
        return ge.createElement(p, h);
      };
    }
    if ("lazyComponent" in n && typeof n.lazyComponent < "u") {
      if (typeof n.lazyComponent > "u")
        throw new Error(`A value of \`undefined\` was passed to the \`lazyComponent\` prop. Check the value you are passing to the <${i}/> component.`);
      return ge.lazy(n.lazyComponent);
    }
    throw new Error("You must pass either 'component' or 'lazyComponent'");
  }, [n.lazyComponent]);
}, Ns = () => {
  const { canvasContent: n, compositions: i, currentCompositionMetadata: s } = c.useContext(Zr), a = i.find((f) => (n == null ? void 0 : n.type) === "composition" && f.id === n.compositionId), d = ol((a == null ? void 0 : a.id) ?? null);
  return c.useMemo(() => !d || d.type === "error" || d.type === "loading" || !a ? null : {
    ...d.result,
    defaultProps: a.defaultProps ?? {},
    id: a.id,
    ...s ?? {},
    component: a.component
  }, [s, d, a]);
}, mm = () => /^([a-zA-Z0-9-\u4E00-\u9FFF])+$/g, pm = (n) => n.match(mm()), ug = (n) => {
  if (!pm(n))
    throw new Error(`Composition id can only contain a-z, A-Z, 0-9, CJK characters and -. You passed ${n}`);
}, ag = `Composition ID must match ${String(mm())}`, lg = (n, i, s) => {
  if (n) {
    if (typeof n != "object")
      throw new Error(`"${i}" must be an object, but you passed a value of type ${typeof n}`);
    if (Array.isArray(n))
      throw new Error(`"${i}" must be an object, an array was passed ${s ? `for composition "${s}"` : ""}`);
  }
}, cg = () => {
  const { continueRender: n, delayRender: i } = Jt();
  return c.useEffect(() => {
    const s = i("Waiting for Root component to unsuspend");
    return () => n(s);
  }, [n, i]), null;
}, dg = ({
  width: n,
  height: i,
  fps: s,
  durationInFrames: a,
  id: d,
  defaultProps: f,
  schema: h,
  ...p
}) => {
  const m = c.useContext(Rs), { registerComposition: g, unregisterComposition: w } = m, y = Ns(), x = fm({
    compProps: p,
    componentName: "Composition",
    noSuspense: !1
  }), R = el(), k = tl(), S = Qe(), I = c.useContext(mr);
  if (typeof window < "u" && (window.remotion_seenCompositionIds = Array.from(/* @__PURE__ */ new Set([...window.remotion_seenCompositionIds ?? [], d]))), I)
    throw k ? new Error("<Composition> was mounted inside the `component` that was passed to the <Player>. See https://remotion.dev/docs/wrong-composition-mount for help.") : new Error("<Composition> mounted inside another composition. See https://remotion.dev/docs/wrong-composition-mount for help.");
  const { folderName: L, parentName: D } = c.useContext(Mv), M = p.stack ?? null;
  c.useEffect(() => {
    if (!d)
      throw new Error("No id for composition passed.");
    return ug(d), lg(f, "defaultProps", d), g({
      durationInFrames: a ?? void 0,
      fps: s ?? void 0,
      height: i ?? void 0,
      width: n ?? void 0,
      id: d,
      folderName: L,
      component: x,
      defaultProps: cr(f ?? {}),
      nonce: R.get(),
      parentFolderName: D,
      schema: h ?? null,
      calculateMetadata: p.calculateMetadata ?? null,
      stack: M
    }), () => {
      w(d);
    };
  }, [
    a,
    s,
    i,
    x,
    d,
    L,
    f,
    n,
    R,
    D,
    h,
    p.calculateMetadata,
    M,
    g,
    w
  ]);
  const P = ol(d), { setError: _, clearError: $ } = c.useContext(nm), A = c.useCallback((H) => {
    _(H);
  }, [_]), U = c.useCallback(() => {
    $();
  }, [$]);
  if (S.isStudio && y && y.component === x && y.id === d) {
    const H = x;
    return P === null || P.type !== "success" && P.type !== "success-and-refreshing" ? null : yf.createPortal(/* @__PURE__ */ E.jsx(Va, {
      children: /* @__PURE__ */ E.jsx(Fv, {
        onError: A,
        onClear: U,
        children: /* @__PURE__ */ E.jsx(c.Suspense, {
          fallback: /* @__PURE__ */ E.jsx(zv, {}),
          children: /* @__PURE__ */ E.jsx(H, {
            ...P.result.props ?? {}
          })
        })
      })
    }), Oa());
  }
  if (S.isRendering && y && y.component === x && y.id === d) {
    const H = x;
    return P === null || P.type !== "success" && P.type !== "success-and-refreshing" ? null : yf.createPortal(/* @__PURE__ */ E.jsx(Va, {
      children: /* @__PURE__ */ E.jsx(c.Suspense, {
        fallback: /* @__PURE__ */ E.jsx(cg, {}),
        children: /* @__PURE__ */ E.jsx(H, {
          ...P.result.props ?? {}
        })
      })
    }), Oa());
  }
  return null;
}, Ba = (n) => {
  const { onlyRenderComposition: i } = c.useContext(Rs);
  return i && i !== n.id ? null : /* @__PURE__ */ E.jsx(dg, {
    ...n
  });
}, hm = [], fg = () => hm, _t = (n) => {
  hm.push(n);
}, Yo = "4.0.468", mg = () => {
  if (typeof globalThis > "u")
    return;
  const n = () => {
    globalThis.remotion_imported = Yo, typeof window < "u" && (window.remotion_imported = Yo);
  }, i = globalThis.remotion_imported || typeof window < "u" && window.remotion_imported;
  if (i) {
    if (i === Yo)
      return;
    if (typeof i == "string" && i.includes("webcodecs")) {
      n();
      return;
    }
    throw new TypeError(`🚨 Multiple versions of Remotion detected: ${[
      Yo,
      typeof i == "string" ? i : "an older version"
    ].filter(Zo).join(" and ")}. This will cause things to break in an unexpected way.
Check that all your Remotion packages are on the same version. If your dependencies depend on Remotion, make them peer dependencies. You can also run \`npx remotion versions\` from your terminal to see which versions are mismatching.`);
  }
  n();
}, Ke = c.createContext(null), Ua = {};
tm(Ua, {
  useTimelineSetFrame: () => Em,
  useTimelinePosition: () => Wn,
  useTimelineContext: () => Hn,
  usePlayingState: () => xm,
  usePlaybackRate: () => ll,
  useAbsoluteTimelinePosition: () => Sm,
  persistCurrentFrame: () => vm,
  getInitialFrameState: () => gm,
  getFrameForComposition: () => ym
});
function Rf(n) {
  let i = n + 1831565813;
  return i = Math.imul(i ^ i >>> 15, i | 1), i ^= i + Math.imul(i ^ i >>> 7, i | 61), ((i ^ i >>> 14) >>> 0) / 4294967296;
}
function pg(n) {
  let i = 0, s = 0, a = 0;
  for (i = 0; i < n.length; i++)
    s = n.charCodeAt(i), a = (a << 5) - a + s, a |= 0;
  return a;
}
var hr = (n, i) => {
  if (n === null)
    return Math.random();
  if (typeof n == "string")
    return Rf(pg(n));
  if (typeof n == "number")
    return Rf(n * 1e10);
  throw new Error("random() argument must be a number or a string");
}, qr = c.createContext({
  setFrame: () => {
    throw new Error("default");
  },
  setPlaying: () => {
    throw new Error("default");
  }
}), eo = c.createContext(null), sl = c.createContext(null), ul = c.createContext(null), hg = ({ children: n, frameState: i }) => {
  const [s, a] = c.useState(!1), d = c.useRef(!1), [f, h] = c.useState(1), p = c.useRef([]), [m] = c.useState(() => String(hr(null))), [g, w] = c.useState(() => gm()), y = i ?? g, { delayRender: x, continueRender: R } = Jt();
  typeof window < "u" && c.useLayoutEffect(() => {
    window.remotion_setFrame = (L, D, M) => {
      window.remotion_attempt = M;
      const P = x(`Setting the current frame to ${L}`);
      let _ = !0;
      w(($) => ($[D] ?? window.remotion_initialFrame) === L ? (_ = !1, $) : {
        ...$,
        [D]: L
      }), _ ? requestAnimationFrame(() => R(P)) : R(P);
    }, window.remotion_isPlayer = !1;
  }, [R, x]);
  const k = c.useMemo(() => ({
    frame: y,
    playing: s,
    imperativePlaying: d,
    rootId: m,
    audioAndVideoTags: p
  }), [y, s, m]), S = c.useMemo(() => ({
    playbackRate: f,
    setPlaybackRate: h
  }), [f]), I = c.useMemo(() => ({
    setFrame: w,
    setPlaying: a
  }), []);
  return /* @__PURE__ */ E.jsx(ul.Provider, {
    value: k,
    children: /* @__PURE__ */ E.jsx(sl.Provider, {
      value: S,
      children: /* @__PURE__ */ E.jsx(eo.Provider, {
        value: k,
        children: /* @__PURE__ */ E.jsx(qr.Provider, {
          value: I,
          children: n
        })
      })
    })
  });
}, al = () => "remotion.time-all", vm = (n) => {
  localStorage.setItem(al(), JSON.stringify(n));
}, gm = () => {
  const n = localStorage.getItem(al()) ?? "{}";
  return JSON.parse(n);
}, ym = (n) => {
  const i = localStorage.getItem(al()) ?? "{}", s = JSON.parse(i);
  return s[n] !== void 0 ? Number(s[n]) : typeof window > "u" ? 0 : window.remotion_initialFrame ?? 0;
}, wm = (n) => {
  const i = Ns(), s = Qe();
  if (!i)
    return typeof window > "u" ? 0 : window.remotion_initialFrame ?? 0;
  const a = n.frame[i.id] ?? (s.isPlayer ? 0 : ym(i.id));
  return Math.min(i.durationInFrames - 1, a);
}, Hn = () => {
  const n = c.useContext(eo);
  if (n === null)
    throw new Error("TimelineContext is not available. This hook must be used inside a <Player> or the Remotion Studio.");
  return n;
}, ll = () => {
  const n = c.useContext(sl);
  if (n === null)
    throw new Error("PlaybackRateContext is not available. This hook must be used inside a <Player> or the Remotion Studio.");
  return n;
}, Wn = () => {
  const n = Hn();
  return wm(n);
}, Sm = () => {
  const n = c.useContext(ul);
  if (n === null)
    throw new Error("AbsoluteTimeContext is not available. This hook must be used inside a <Player> or the Remotion Studio.");
  return wm(n);
}, Em = () => {
  const { setFrame: n } = c.useContext(qr);
  return n;
}, xm = () => {
  const { playing: n, imperativePlaying: i } = Hn(), { setPlaying: s } = c.useContext(qr);
  return c.useMemo(() => [n, s, i], [i, n, s]);
}, vn = () => {
  const n = c.useContext(mr), i = Qe();
  if (!n)
    throw i.isPlayer ? new Error("useCurrentFrame can only be called inside a component that was passed to <Player>. See: https://www.remotion.dev/docs/player/examples") : new Error("useCurrentFrame() can only be called inside a component that was registered as a composition. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions");
  const s = Wn(), a = c.useContext(Ke), d = a ? a.cumulatedFrom + a.relativeFrom : 0;
  return s - d;
}, _s = () => {
  const n = c.useContext(Ke), i = (n == null ? void 0 : n.width) ?? null, s = (n == null ? void 0 : n.height) ?? null, a = (n == null ? void 0 : n.durationInFrames) ?? null, d = Ns();
  return c.useMemo(() => {
    if (!d)
      return null;
    const {
      id: f,
      durationInFrames: h,
      fps: p,
      height: m,
      width: g,
      defaultProps: w,
      props: y,
      defaultCodec: x,
      defaultOutName: R,
      defaultVideoImageFormat: k,
      defaultPixelFormat: S,
      defaultProResProfile: I,
      defaultSampleRate: L
    } = d;
    return {
      id: f,
      width: i ?? g,
      height: s ?? m,
      fps: p,
      durationInFrames: a ?? h,
      defaultProps: w,
      props: y,
      defaultCodec: x,
      defaultOutName: R,
      defaultVideoImageFormat: k,
      defaultPixelFormat: S,
      defaultProResProfile: I,
      defaultSampleRate: L
    };
  }, [a, s, i, d]);
}, Ot = () => {
  const n = _s(), i = c.useContext(mr), s = tl();
  if (!n)
    throw typeof window < "u" && window.remotion_isPlayer || s ? new Error([
      "No video config found. Likely reasons:",
      "- You are probably calling useVideoConfig() from outside the component passed to <Player />. See https://www.remotion.dev/docs/player/examples for how to set up the Player correctly.",
      "- You have multiple versions of Remotion installed which causes the React context to get lost."
    ].join("-")) : new Error("No video config found. You are probably calling useVideoConfig() from a component which has not been registered as a <Composition />. See https://www.remotion.dev/docs/the-fundamentals#defining-compositions for more information.");
  if (!i)
    throw new Error("Called useVideoConfig() outside a Remotion composition.");
  return n;
}, vg = ({
  frame: n,
  children: i,
  active: s = !0
}) => {
  const a = vn(), d = Ot();
  if (typeof n > "u")
    throw new Error("The <Freeze /> component requires a 'frame' prop, but none was passed.");
  if (typeof n != "number")
    throw new Error(`The 'frame' prop of <Freeze /> must be a number, but is of type ${typeof n}`);
  if (Number.isNaN(n))
    throw new Error("The 'frame' prop of <Freeze /> must be a real number, but it is NaN.");
  if (!Number.isFinite(n))
    throw new Error(`The 'frame' prop of <Freeze /> must be a finite number, but it is ${n}.`);
  const f = c.useMemo(() => {
    if (typeof s == "boolean")
      return s;
    if (typeof s == "function")
      return s(a);
  }, [s, a]), h = Hn(), p = c.useContext(Ke), m = (p == null ? void 0 : p.relativeFrom) ?? 0, g = c.useMemo(() => f ? {
    ...h,
    playing: !1,
    imperativePlaying: {
      current: !1
    },
    frame: {
      [d.id]: n + m
    }
  } : h, [f, h, d.id, n, m]), w = c.useMemo(() => p ? f ? {
    ...p,
    cumulatedFrom: 0
  } : p : null, [p, f]);
  return /* @__PURE__ */ E.jsx(eo.Provider, {
    value: g,
    children: /* @__PURE__ */ E.jsx(Ke.Provider, {
      value: w,
      children: i
    })
  });
}, Cm = c.createContext({
  premountFramesRemaining: 0
}), vr = {
  "style.translate": {
    type: "translate",
    step: 1,
    default: "0px 0px",
    description: "Offset"
  },
  "style.scale": {
    type: "number",
    min: 0.05,
    max: 100,
    step: 0.01,
    default: 1,
    description: "Scale"
  },
  "style.rotate": {
    type: "rotation",
    step: 1,
    default: "0deg",
    description: "Rotation"
  },
  "style.opacity": {
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
    description: "Opacity"
  }
}, km = {
  premountFor: {
    type: "number",
    default: 0,
    description: "Premount For",
    min: 0,
    step: 1
  },
  postmountFor: {
    type: "hidden"
  },
  styleWhilePremounted: {
    type: "hidden"
  },
  styleWhilePostmounted: {
    type: "hidden"
  }
}, Pm = {
  ...vr,
  ...km
}, to = {
  type: "boolean",
  default: !1,
  description: "Hidden"
}, Cs = {
  hidden: to,
  layout: {
    type: "enum",
    default: "absolute-fill",
    description: "Layout",
    variants: {
      "absolute-fill": Pm,
      none: {}
    }
  }
}, gg = {
  ...Cs,
  layout: {
    ...Cs.layout,
    default: "none"
  }
}, no = ge.createContext({
  registerSequence: () => {
    throw new Error("SequenceManagerContext not initialized");
  },
  unregisterSequence: () => {
    throw new Error("SequenceManagerContext not initialized");
  },
  sequences: []
}), hn = (n) => `${n.nodePath.join(".")}.${n.sequenceKeys.join(".")}.${n.effectKeys.map((i) => i.join(".")).join(".")}`, Fs = ge.createContext({
  codeValues: {}
}), Ms = ge.createContext({
  getDragOverrides: () => {
    throw new Error("VisualModeDragOverridesContext not initialized");
  },
  getEffectDragOverrides: () => {
    throw new Error("VisualModeDragOverridesContext not initialized");
  }
}), Rm = ge.createContext({
  setDragOverrides: () => {
    throw new Error("VisualModeSettersContext not initialized");
  },
  clearDragOverrides: () => {
    throw new Error("VisualModeSettersContext not initialized");
  },
  setEffectDragOverrides: () => {
    throw new Error("VisualModeSettersContext not initialized");
  },
  clearEffectDragOverrides: () => {
    throw new Error("VisualModeSettersContext not initialized");
  },
  setCodeValues: () => {
    throw new Error("VisualModeSettersContext not initialized");
  }
}), _a = (n, i) => `${hn(n)}.effects.${i}`, yg = ({ children: n }) => {
  const [i, s] = c.useState([]), [a, d] = c.useState({}), f = c.useRef(a);
  f.current = a;
  const [h, p] = c.useState({}), [m, g] = c.useState({}), w = c.useCallback((A, U, H) => {
    d((K) => ({
      ...K,
      [hn(A)]: {
        ...K[hn(A)],
        [U]: H
      }
    }));
  }, []), y = c.useCallback((A) => {
    d((U) => {
      const H = hn(A);
      if (!U[H])
        return U;
      const K = { ...U };
      return delete K[H], K;
    });
  }, []), x = c.useCallback((A, U, H, K) => {
    p((Q) => {
      const q = _a(A, U);
      return {
        ...Q,
        [q]: {
          ...Q[q],
          [H]: K
        }
      };
    });
  }, []), R = c.useCallback((A, U) => {
    p((H) => {
      const K = _a(A, U);
      if (!H[K])
        return H;
      const Q = { ...H };
      return delete Q[K], Q;
    });
  }, []), k = c.useCallback((A, U) => {
    g((H) => {
      const K = hn(A), Q = H[K], q = U(Q);
      return Q === q ? H : { ...H, [K]: q };
    });
  }, []), S = c.useCallback((A) => {
    s((U) => [...U, A]);
  }, []), I = c.useCallback((A) => {
    s((U) => U.filter((H) => H.id !== A));
  }, []), L = c.useMemo(() => ({
    registerSequence: S,
    sequences: i,
    unregisterSequence: I
  }), [S, i, I]), D = c.useCallback((A) => a[hn(A)] ?? {}, [a]), M = c.useCallback((A, U) => h[_a(A, U)] ?? {}, [h]), P = c.useMemo(() => ({
    codeValues: m
  }), [m]), _ = c.useMemo(() => ({
    getDragOverrides: D,
    getEffectDragOverrides: M
  }), [D, M]), $ = c.useMemo(() => ({
    setDragOverrides: w,
    clearDragOverrides: y,
    setEffectDragOverrides: x,
    clearEffectDragOverrides: R,
    setCodeValues: k
  }), [
    w,
    y,
    x,
    R,
    k
  ]);
  return /* @__PURE__ */ E.jsx(no.Provider, {
    value: L,
    children: /* @__PURE__ */ E.jsx(Fs.Provider, {
      value: P,
      children: /* @__PURE__ */ E.jsx(Ms.Provider, {
        value: _,
        children: /* @__PURE__ */ E.jsx(Rm.Provider, {
          value: $,
          children: n
        })
      })
    })
  });
}, wg = (n, i) => {
  for (const s of i) {
    const a = s.split("."), d = [n];
    let f = n;
    for (let h = 0; h < a.length - 1; h++) {
      const p = a[h], m = f[p];
      if (m == null) {
        f = null;
        break;
      }
      f = m, d.push(f);
    }
    if (f !== null) {
      delete f[a[a.length - 1]];
      for (let h = d.length - 1; h > 0; h--) {
        const p = d[h];
        if (Object.keys(p).length === 0) {
          const m = a[h - 1];
          delete d[h - 1][m];
        } else
          break;
      }
    }
  }
  return n;
}, cl = c.createContext({
  overrideIdToNodePathMappings: {}
}), Sg = c.createContext({
  setOverrideIdToNodePath: () => {
    throw new Error("OverrideIdsToNodePathsSettersContext not initialized");
  }
}), Eg = ({
  descriptor: n,
  codeOverrides: i,
  dragOverrides: s
}) => {
  if (!i && !s)
    return { params: n.params, effectKey: n.effectKey };
  const a = {
    ...n.params
  };
  if (i)
    for (const [d, f] of Object.entries(i))
      f !== void 0 && (a[d] = f);
  if (s)
    for (const [d, f] of Object.entries(s))
      a[d] = f;
  return {
    params: a,
    effectKey: n.definition.calculateKey(a)
  };
}, xg = (n) => {
  if (!n)
    return null;
  const i = {};
  let s = !1;
  for (const [a, d] of Object.entries(n))
    d.canUpdate && (i[a] = d.codeValue, s = !0);
  return s ? i : null;
}, ti = (n) => {
  const i = c.useRef(null), s = n.map((f) => f.definition), a = i.current;
  return a !== null && a.length === s.length && a.every((f, h) => f === s[h]) ? a : (i.current = s, s);
}, Tm = ({
  codeValues: n,
  nodePath: i,
  effectIndex: s
}) => {
  const a = n[hn(i)];
  if (!a)
    return { type: "cannot-update-sequence", reason: "not-found" };
  if (!a.canUpdate)
    return { type: "cannot-update-sequence", reason: a.reason };
  const d = a.effects.find((f) => f.effectIndex === s);
  return d ? d.canUpdate ? { type: "can-update-effect", props: d.props } : { type: "cannot-update-effect", reason: d.reason } : { type: "cannot-update-effect", reason: "not-found" };
}, bm = (n, i) => {
  const s = n[hn(i)];
  if (s && s.canUpdate)
    return s.props;
}, ni = ({
  effects: n,
  overrideId: i
}) => {
  const s = c.useRef(null), { codeValues: a } = c.useContext(Fs), { getEffectDragOverrides: d } = c.useContext(Ms), { overrideIdToNodePathMappings: f } = c.useContext(cl), h = s.current, p = i ? f[i] ?? null : null, m = n.map((y, x) => {
    if (p === null)
      return {
        descriptor: y,
        params: y.params,
        effectKey: y.effectKey
      };
    const R = Tm({
      codeValues: a,
      nodePath: p,
      effectIndex: x
    }), k = R.type === "can-update-effect" ? xg(R.props) : null, S = d(p, x), I = Object.keys(S).length === 0 ? null : S, { params: L, effectKey: D } = Eg({
      descriptor: y,
      codeOverrides: k,
      dragOverrides: I
    });
    return { descriptor: y, params: L, effectKey: D };
  });
  if (h !== null && h.length === m.length && h.every((y, x) => y.definition === m[x].descriptor.definition && y.effectKey === m[x].effectKey))
    return h;
  const w = m.map(({ descriptor: y, params: x, effectKey: R }) => ({
    definition: y.definition,
    effectKey: R,
    params: x,
    memoized: !0
  }));
  return s.current = w, w;
}, dl = (n, i) => {
  const s = {};
  for (const a of Object.keys(n)) {
    const d = n[a];
    if (d.type !== "hidden")
      if (d.type === "enum") {
        s[a] = d;
        const f = i(a) ?? d.default, h = d.variants[f];
        h && Object.assign(s, dl(h, i));
      } else
        s[a] = d;
  }
  return s;
}, fl = (n) => {
  const i = {}, s = (a, d) => {
    if (a in i)
      throw new Error(`Duplicate key "${a}" in schema: discriminated union variants must not share keys`);
    i[a] = d;
  };
  for (const a of Object.keys(n)) {
    const d = n[a];
    if (s(a, d), d.type === "enum")
      for (const f of Object.values(d.variants)) {
        const h = fl(f);
        for (const p of Object.keys(h))
          s(p, h[p]);
      }
  }
  return i;
}, Im = ({
  schema: n,
  key: i,
  value: s
}) => {
  const a = n[i];
  if (!a)
    throw new Error("Key " + JSON.stringify(i) + " not found in schema");
  if (typeof s != "string")
    throw new Error("Value must be a string, but is " + JSON.stringify(s));
  if (a.type !== "enum")
    throw new Error("Key " + JSON.stringify(i) + " is not an enum");
  if (!a.variants[s])
    throw new Error("Value for " + JSON.stringify(i) + " must be one of " + Object.keys(a.variants).map((p) => JSON.stringify(p)).join(", ") + ", got " + JSON.stringify(s));
  const f = Object.keys(a.variants).filter((p) => p !== s), h = /* @__PURE__ */ new Set();
  for (const p of f) {
    const m = a.variants[p], g = Object.keys(m);
    for (const w of g)
      h.add(w);
  }
  return [...h];
}, Nm = ({
  codeValue: n,
  dragOverrideValue: i,
  defaultValue: s,
  shouldResortToDefaultValueIfUndefined: a = !1
}) => i !== void 0 ? i : n.codeValue === void 0 && a ? s : n.codeValue, _m = (n, i) => {
  if (i in n)
    return n[i];
  for (const s of Object.values(n))
    if (s.type === "enum")
      for (const a of Object.values(s.variants)) {
        const d = _m(a, i);
        if (d)
          return d;
      }
}, Fm = ({
  schema: n,
  currentValue: i,
  overrideValues: s,
  propStatus: a
}) => {
  var h;
  const d = {}, f = /* @__PURE__ */ new Set();
  for (const p of Object.keys(i)) {
    const m = (a == null ? void 0 : a[p]) ?? null, g = _m(n, p);
    if ((g == null ? void 0 : g.type) === "hidden")
      continue;
    const w = m === null || m.canUpdate === !1 ? i[p] : Nm({
      codeValue: m,
      dragOverrideValue: s[p],
      defaultValue: g == null ? void 0 : g.default,
      shouldResortToDefaultValueIfUndefined: !1
    });
    w === void 0 && f.add(p), d[p] = w;
  }
  for (const p of Object.keys(s))
    if (((h = n[p]) == null ? void 0 : h.type) === "enum") {
      const m = Im({
        schema: n,
        key: p,
        value: d[p]
      });
      for (const g of m)
        f.add(g);
    }
  return { merged: d, propsToDelete: f };
}, Mm = (n, i) => {
  const s = i.split(".");
  let a = n;
  for (const d of s) {
    if (a == null || typeof a != "object")
      return;
    a = a[d];
  }
  return a;
}, Cg = (n, i) => {
  const s = {};
  for (const a of i)
    s[a] = Mm(n, a);
  return s;
}, kg = (n, i) => Object.keys(dl(n, (s) => i[s])), Pg = ({
  props: n,
  valuesDotNotation: i,
  schemaKeys: s,
  propsToDelete: a
}) => {
  const d = { ...n };
  for (const f of s) {
    const h = i[f], p = f.split(".");
    if (p.length === 1) {
      d[f] = h;
      continue;
    }
    let m = d;
    for (let g = 0; g < p.length - 1; g++) {
      const w = p[g];
      typeof m[w] == "object" && m[w] !== null ? m[w] = { ...m[w] } : m[w] = {}, m = m[w];
    }
    m[p[p.length - 1]] = h;
  }
  return wg(d, a), d;
}, Tf = {}, Kn = (n, i) => {
  const s = fl(i), a = Object.keys(s), d = c.forwardRef((f, h) => {
    const p = Qe();
    if (!p.isStudio || p.isReadOnlyStudio || p.isRendering)
      return ge.createElement(n, {
        ...f,
        _experimentalControls: null,
        ref: h
      });
    const { codeValues: m } = c.useContext(Fs), { getDragOverrides: g } = c.useContext(Ms), w = c.useContext(cl);
    if (f._experimentalControls)
      return ge.createElement(n, {
        ...f,
        ref: h
      });
    const [y] = c.useState(() => {
      const { stack: P } = f;
      if (!P)
        return String(Math.random());
      const _ = Tf[P];
      if (_)
        return _;
      const $ = String(Math.random());
      return Tf[P] = $, $;
    }), x = w.overrideIdToNodePathMappings[y] ?? null, R = a.map((P) => Mm(f, P)), k = c.useMemo(() => Cg(f, a), R), S = c.useMemo(() => ({
      schema: i,
      currentRuntimeValueDotNotation: k,
      overrideId: y
    }), [k, y]), { merged: I, propsToDelete: L } = c.useMemo(() => Fm({
      schema: i,
      currentValue: k,
      overrideValues: x === null ? {} : g(x),
      propStatus: x === null ? void 0 : bm(m, x)
    }), [
      k,
      g,
      x,
      m
    ]), D = kg(i, I), M = Pg({
      props: f,
      valuesDotNotation: I,
      schemaKeys: D,
      propsToDelete: L
    });
    return ge.createElement(n, {
      ...M,
      _experimentalControls: S,
      ref: h
    });
  });
  return d.displayName = `wrapInSchema(${n.displayName || n.name || "Component"})`, d;
}, Rg = ({
  from: n = 0,
  durationInFrames: i = 1 / 0,
  children: s,
  name: a,
  height: d,
  width: f,
  showInTimeline: h = !0,
  hidden: p = !1,
  _experimentalControls: m,
  _remotionInternalEffects: g,
  _remotionInternalLoopDisplay: w,
  _remotionInternalStack: y,
  _remotionInternalDocumentationLink: x,
  _remotionInternalPremountDisplay: R,
  _remotionInternalPostmountDisplay: k,
  _remotionInternalIsMedia: S,
  ...I
}, L) => {
  const { layout: D = "absolute-fill" } = I, [M] = c.useState(() => String(Math.random())), P = c.useContext(Ke), { rootId: _ } = Hn(), $ = P ? P.cumulatedFrom + P.relativeFrom : 0, A = el();
  if (D !== "absolute-fill" && D !== "none")
    throw new TypeError(`The layout prop of <Sequence /> expects either "absolute-fill" or "none", but you passed: ${D}`);
  if (D === "none" && typeof I.style < "u")
    throw new TypeError('If layout="none", you may not pass a style. Passed: ' + JSON.stringify(I.style));
  if (typeof i != "number")
    throw new TypeError(`You passed to durationInFrames an argument of type ${typeof i}, but it must be a number.`);
  if (i <= 0)
    throw new TypeError(`durationInFrames must be positive, but got ${i}`);
  if (typeof n != "number")
    throw new TypeError(`You passed to the "from" props of your <Sequence> an argument of type ${typeof n}, but it must be a number.`);
  if (!Number.isFinite(n))
    throw new TypeError(`The "from" prop of a sequence must be finite, but got ${n}.`);
  const U = Wn(), H = Ot(), K = P ? Math.min(P.durationInFrames - n, i) : i, Q = Math.max(0, Math.min(H.durationInFrames - n, K)), { registerSequence: q, unregisterSequence: ee } = c.useContext(no), re = c.useMemo(() => (P == null ? void 0 : P.premounting) || !!I._remotionInternalIsPremounting, [I._remotionInternalIsPremounting, P == null ? void 0 : P.premounting]), ie = c.useMemo(() => (P == null ? void 0 : P.postmounting) || !!I._remotionInternalIsPostmounting, [I._remotionInternalIsPostmounting, P == null ? void 0 : P.postmounting]), ue = $ + n, W = P ? P.cumulatedFrom + P.relativeFrom : 0, F = P ? W - P.cumulatedNegativeFrom : 0, J = Math.max(0, F, ue), B = ue - J, T = c.useMemo(() => ({
    cumulatedFrom: $,
    relativeFrom: n,
    cumulatedNegativeFrom: B,
    durationInFrames: Q,
    parentFrom: (P == null ? void 0 : P.relativeFrom) ?? 0,
    id: M,
    height: d ?? (P == null ? void 0 : P.height) ?? null,
    width: f ?? (P == null ? void 0 : P.width) ?? null,
    premounting: re,
    postmounting: ie,
    premountDisplay: R ?? null,
    postmountDisplay: k ?? null
  }), [
    $,
    n,
    Q,
    P,
    M,
    d,
    f,
    re,
    ie,
    R,
    k,
    B
  ]), O = c.useMemo(() => a ?? "", [a]), G = x ?? (a === void 0 ? "https://www.remotion.dev/docs/sequence" : null), oe = Qe(), ne = (I == null ? void 0 : I.stack) ?? null, de = c.useRef(null);
  de.current = y ?? ne, c.useEffect(() => {
    if (oe.isStudio)
      return S ? (S.type === "image" ? q({
        type: "image",
        controls: m ?? null,
        effects: g ?? [],
        displayName: O,
        documentationLink: G,
        duration: Q,
        from: n,
        id: M,
        loopDisplay: w,
        nonce: A.get(),
        parent: (P == null ? void 0 : P.id) ?? null,
        postmountDisplay: k ?? null,
        premountDisplay: R ?? null,
        rootId: _,
        showInTimeline: h,
        src: S.src,
        getStack: () => de.current
      }) : q({
        type: S.type,
        controls: m ?? null,
        effects: g ?? [],
        displayName: O,
        documentationLink: G,
        doesVolumeChange: S.data.doesVolumeChange,
        duration: Q,
        from: n,
        id: M,
        loopDisplay: w,
        nonce: A.get(),
        parent: (P == null ? void 0 : P.id) ?? null,
        playbackRate: S.data.playbackRate,
        postmountDisplay: k ?? null,
        premountDisplay: R ?? null,
        rootId: _,
        showInTimeline: h,
        src: S.data.src,
        getStack: () => de.current,
        startMediaFrom: S.data.startMediaFrom,
        volume: S.data.volumes
      }), () => {
        ee(M);
      }) : (q({
        from: n,
        duration: Q,
        id: M,
        displayName: O,
        documentationLink: G,
        parent: (P == null ? void 0 : P.id) ?? null,
        type: "sequence",
        rootId: _,
        showInTimeline: h,
        nonce: A.get(),
        loopDisplay: w,
        getStack: () => de.current,
        premountDisplay: R ?? null,
        postmountDisplay: k ?? null,
        controls: m ?? null,
        effects: g ?? []
      }), () => {
        ee(M);
      });
  }, [
    i,
    M,
    a,
    q,
    O,
    ee,
    P == null ? void 0 : P.id,
    Q,
    _,
    n,
    h,
    A,
    w,
    R,
    k,
    oe.isStudio,
    m,
    g,
    S,
    G
  ]);
  const he = Math.ceil($ + n + i - 1), ve = U < $ + n || U > he ? null : s, Se = I.layout === "none" ? void 0 : I.style, Re = c.useMemo(() => ({
    flexDirection: void 0,
    ...f ? { width: f } : {},
    ...d ? { height: d } : {},
    ...Se ?? {}
  }), [d, Se, f]);
  if (L !== null && D === "none")
    throw new TypeError('It is not supported to pass both a `ref` and `layout="none"` to <Sequence />.');
  return p ? null : /* @__PURE__ */ E.jsx(Ke.Provider, {
    value: T,
    children: ve === null ? null : I.layout === "none" ? ve : /* @__PURE__ */ E.jsx(nl, {
      ref: L,
      style: Re,
      className: I.className,
      children: ve
    })
  });
}, Tg = c.forwardRef(Rg), bg = (n, i) => {
  const s = c.useContext(Cm), a = vn() - s.premountFramesRemaining;
  if (n.layout === "none")
    throw new Error('`<Sequence>` with `premountFor` and `postmountFor` props does not support layout="none"');
  const {
    style: d,
    from: f = 0,
    durationInFrames: h = 1 / 0,
    premountFor: p = 0,
    postmountFor: m = 0,
    styleWhilePremounted: g,
    styleWhilePostmounted: w,
    ...y
  } = n, x = Math.ceil(f + h - 1), R = a < f && a >= f - p, k = a > x && a <= x + m, S = R ? f : k ? f + h - 1 : 0, I = R || k, L = c.useMemo(() => ({
    ...d,
    opacity: R || k ? 0 : 1,
    pointerEvents: R || k ? "none" : (d == null ? void 0 : d.pointerEvents) ?? void 0,
    ...R ? g : {},
    ...k ? w : {}
  }), [
    d,
    R,
    k,
    g,
    w
  ]);
  return /* @__PURE__ */ E.jsx(vg, {
    frame: S,
    active: I,
    children: /* @__PURE__ */ E.jsx(Lm, {
      ref: i,
      from: f,
      durationInFrames: h,
      style: L,
      _remotionInternalPremountDisplay: p,
      _remotionInternalPostmountDisplay: m,
      _remotionInternalIsPremounting: R,
      _remotionInternalIsPostmounting: k,
      ...y
    })
  });
}, Ig = c.forwardRef(bg), Ng = (n, i) => {
  const s = Qe(), { fps: a } = Ot();
  if (n.layout !== "none" && !s.isRendering) {
    const d = n.premountFor;
    if (d || n.postmountFor)
      return /* @__PURE__ */ E.jsx(Ig, {
        ref: i,
        ...n,
        premountFor: d
      });
  }
  return /* @__PURE__ */ E.jsx(Tg, {
    ...n,
    ref: i
  });
}, Lm = c.forwardRef(Ng), Nt = Kn(Lm, Cs), $m = (n, i, s) => {
  switch (n) {
    case "fill":
      return [
        0,
        0,
        i.width,
        i.height,
        0,
        0,
        s.width,
        s.height
      ];
    case "contain": {
      const a = Math.min(s.width / i.width, s.height / i.height), d = (s.width - i.width * a) / 2, f = (s.height - i.height * a) / 2;
      return [
        0,
        0,
        i.width,
        i.height,
        d,
        f,
        i.width * a,
        i.height * a
      ];
    }
    case "cover": {
      const a = Math.max(s.width / i.width, s.height / i.height), d = (s.width - i.width * a) / 2, f = (s.height - i.height * a) / 2;
      return [
        0,
        0,
        i.width,
        i.height,
        d,
        f,
        i.width * a,
        i.height * a
      ];
    }
    default:
      throw new Error("Unknown fit: " + n);
  }
}, _g = "https://remotion.dev/docs/troubleshooting/webgl2-context", jm = (n, i) => `Failed to acquire ${n} context for ${i}. Pass --gl=angle when using the CLI, set chromiumOptions: { gl: "angle" } when using SSR APIs, or set "OpenGL render backend" to "angle" in the Advanced section when rendering in the Studio. See ${_g}`, Fg = (n) => new Error(jm("WebGL", n)), Vm = (n) => new Error(jm("WebGL2", n));
class Mg {
  constructor(i, s) {
    Ne(this, "width");
    Ne(this, "height");
    Ne(this, "pairs", /* @__PURE__ */ new Map());
    Ne(this, "lostContexts", /* @__PURE__ */ new Set());
    this.width = i, this.height = s;
  }
  getPair(i) {
    const s = this.pairs.get(i);
    if (s)
      return s;
    const a = [
      this.allocateCanvas(i),
      this.allocateCanvas(i)
    ];
    return this.pairs.set(i, a), a;
  }
  assertContextNotLost(i) {
    if (this.lostContexts.has(i))
      throw new Error("WebGL context was lost during canvas effect rendering. This typically happens in headless or memory-constrained environments (e.g. Remotion Lambda). Try reducing concurrency or increasing the Lambda function memory.");
  }
  allocateCanvas(i) {
    const s = document.createElement("canvas");
    switch (s.width = this.width, s.height = this.height, i) {
      case "2d": {
        if (!s.getContext("2d", {
          colorSpace: "srgb"
        }))
          throw new Error("Failed to acquire 2D context for canvas effect");
        return s;
      }
      case "webgl2": {
        const a = s.getContext("webgl2", {
          premultipliedAlpha: !0,
          alpha: !0,
          preserveDrawingBuffer: !0
        });
        if (!a)
          throw Vm("canvas effect");
        return s.addEventListener("webglcontextlost", (d) => {
          d.preventDefault(), this.lostContexts.add(s);
        }), s.addEventListener("webglcontextrestored", () => {
          this.lostContexts.delete(s);
        }), a.pixelStorei(a.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0), s;
      }
      case "webgpu": {
        if (typeof navigator > "u" || !("gpu" in navigator))
          throw new Error("WebGPU is not available in this environment for canvas effect");
        return s;
      }
      default: {
        const a = i;
        throw new Error(`Unknown effect backend: ${a}`);
      }
    }
  }
}
var Lg = (n) => {
  const i = [];
  let s = [], a = null;
  for (const d of n) {
    const { backend: f } = d.definition;
    a === null || f === a ? (s.push(d), a = f) : (i.push({ backend: a, effects: s }), s = [d], a = f);
  }
  return a !== null && s.length > 0 && i.push({ backend: a, effects: s }), i;
}, hs = null, $g = () => hs || (hs = (async () => {
  if (typeof navigator > "u" || !("gpu" in navigator))
    throw new Error("WebGPU is not available in this environment");
  const { gpu: n } = navigator, i = await n.requestAdapter();
  if (!i)
    throw new Error("No WebGPU adapter available");
  return i.requestDevice();
})(), hs), jg = (n, i) => ({
  pool: new Mg(n, i),
  setupCache: /* @__PURE__ */ new WeakMap(),
  cleanupRegistry: [],
  currentRunId: 0
}), bf = (n) => {
  n.currentRunId++;
  for (const i of n.cleanupRegistry)
    i.definition.cleanup(i.state);
}, Vg = (n, i, s) => {
  const a = i;
  if (n.setupCache.has(a))
    return n.setupCache.get(a);
  const d = i.setup(s);
  return n.setupCache.set(a, d), n.cleanupRegistry.push({ definition: a, state: d }), d;
}, ri = async ({
  state: n,
  source: i,
  effects: s,
  output: a,
  width: d,
  height: f
}) => {
  const h = ++n.currentRunId, p = () => n.currentRunId !== h, m = s.filter((I) => !I.params.disabled), g = Lg(m);
  let w = i, y = null;
  if (g.length === 0) {
    if (i === a)
      return !0;
    const I = a.getContext("2d");
    if (!I)
      throw new Error("Failed to acquire 2D context for output canvas");
    return I.clearRect(0, 0, d, f), I.drawImage(w, 0, 0, d, f), !0;
  }
  let x = !1;
  for (const I of g)
    if (I.backend === "webgpu") {
      x = !0;
      break;
    }
  const R = x ? await $g() : null;
  if (p())
    return !1;
  let k = !0;
  for (let I = 0; I < g.length; I++) {
    const L = g[I], [D, M] = n.pool.getPair(L.backend);
    let P = D;
    for (const $ of L.effects) {
      const A = $.definition, U = Vg(n, A, P);
      A.apply({
        source: w,
        target: P,
        state: U,
        params: $.params,
        width: d,
        height: f,
        gpuDevice: R,
        flipSourceY: L.backend === "webgl2" ? k : !1
      }), L.backend === "webgl2" && (k = !1, n.pool.assertContextNotLost(P)), w = P, P = P === D ? M : D;
    }
    y = w ?? y;
    const _ = g[I + 1];
    if (_ && _.backend !== L.backend && y)
      if (L.backend === "2d" && _.backend === "webgl2")
        w = y, k = !0;
      else {
        const $ = await createImageBitmap(y);
        if (p())
          return $.close(), !1;
        w = $, _.backend === "webgl2" && (k = !1);
      }
  }
  if (!y)
    return !0;
  const S = a.getContext("2d");
  if (!S)
    throw new Error("Failed to acquire 2D context for output canvas");
  return S.clearRect(0, 0, d, f), S.drawImage(y, 0, 0, d, f), !0;
}, oi = () => {
  const n = c.useRef(null), i = c.useRef(null);
  return c.useEffect(() => () => {
    n.current && bf(n.current);
  }, []), c.useMemo(() => ({
    get: (s, a) => ((!i.current || i.current.width !== s || i.current.height !== a) && (n.current && bf(n.current), n.current = jg(s, a), i.current = { width: s, height: a }), n.current)
  }), []);
}, Ag = ({ width: n, height: i, fit: s, className: a, style: d, effects: f }, h) => {
  const p = c.useRef(null), m = oi(), g = c.useMemo(() => typeof document > "u" ? null : document.createElement("canvas"), []), w = c.useCallback((y) => {
    const x = p.current, R = n ?? y.displayWidth, k = i ?? y.displayHeight;
    if (!x)
      throw new Error("Canvas ref is not set");
    if (!g)
      throw new Error("Source canvas is not available");
    g.width = R, g.height = k;
    const S = g.getContext("2d");
    if (!S)
      throw new Error("Could not get 2d context for source canvas");
    return S.drawImage(y, ...$m(s, {
      height: y.displayHeight,
      width: y.displayWidth
    }, {
      width: R,
      height: k
    })), x.width = R, x.height = k, ri({
      state: m.get(R, k),
      source: g,
      effects: f,
      output: x,
      width: R,
      height: k
    });
  }, [m, f, s, i, g, n]);
  return c.useImperativeHandle(h, () => ({
    draw: w,
    getCanvas: () => {
      if (!p.current)
        throw new Error("Canvas ref is not set");
      return p.current;
    },
    clear: () => {
      var x;
      const y = (x = p.current) == null ? void 0 : x.getContext("2d");
      if (!y)
        throw new Error("Could not get 2d context");
      y.clearRect(0, 0, p.current.width, p.current.height);
    }
  }), [w]), /* @__PURE__ */ E.jsx("canvas", {
    ref: p,
    className: a,
    style: d
  });
}, Dg = ge.forwardRef(Ag), Og = 5, If = ({
  loopBehavior: n,
  durationFound: i,
  timeInSec: s
}) => n === "loop" ? i ? s % i : s : Math.min(s, i || 1 / 0), zg = async ({
  resolvedSrc: n,
  signal: i,
  currentTime: s,
  initialLoopBehavior: a
}) => {
  if (typeof ImageDecoder > "u")
    throw new Error("Your browser does not support the WebCodecs ImageDecoder API.");
  const d = await fetch(n, { signal: i }), { body: f } = d;
  if (!f)
    throw new Error("Got no body");
  const h = new ImageDecoder({
    data: f,
    type: d.headers.get("Content-Type") || "image/gif"
  });
  await h.completed;
  const { selectedTrack: p } = h.tracks;
  if (!p)
    throw new Error("No selected track");
  const m = [];
  let g = null;
  const w = async (k) => {
    const S = m.find((L) => L.frameIndex === k);
    if (S && S.frame)
      return S;
    const I = await h.decode({
      frameIndex: k,
      completeFramesOnly: !0
    });
    return S ? S.frame = I.image : m.push({
      frame: I.image,
      frameIndex: k,
      timeInSeconds: I.image.timestamp / 1e6
    }), {
      frame: I.image,
      frameIndex: k,
      timeInSeconds: I.image.timestamp / 1e6
    };
  }, y = (k) => {
    const I = m.filter((L) => L.frame).sort((L, D) => {
      const M = Math.abs(L.timeInSeconds - k), P = Math.abs(D.timeInSeconds - k);
      return M - P;
    });
    for (let L = 0; L < I.length; L++) {
      if (L < Og)
        continue;
      const D = I[L];
      D.frame = null;
    }
  }, x = async ({
    timeInSec: k,
    loopBehavior: S
  }) => {
    const I = If({
      durationFound: g,
      loopBehavior: S,
      timeInSec: k
    }), D = m.filter((P) => P.timeInSeconds <= I).map((P) => P.frameIndex).reduce((P, _) => Math.max(P, _), 0);
    let M = D;
    for (; ; ) {
      const P = await w(M);
      if (M++, !P.frame)
        throw new Error("No frame found");
      if (!P.frame.duration || (M === p.frameCount && g === null && (g = (P.frame.timestamp + P.frame.duration) / 1e6), P.timeInSeconds > I || M === p.frameCount))
        break;
    }
    p.frameCount - D < 3 && S === "loop" && await w(0), y(I);
  };
  return await x({
    timeInSec: s,
    loopBehavior: a
  }), await x({
    timeInSec: s,
    loopBehavior: a
  }), {
    getFrame: async (k, S) => {
      if (g !== null && k > g && S === "clear-after-finish")
        return null;
      const I = If({
        loopBehavior: S,
        durationFound: g,
        timeInSec: k
      });
      await x({ timeInSec: I, loopBehavior: S });
      const D = m.filter((M) => M.frame).reduce((M, P) => {
        const _ = Math.abs(M.timeInSeconds - I), $ = Math.abs(P.timeInSeconds - I);
        return _ < $ ? M : P;
      });
      if (!D.frame)
        throw new Error("No frame found");
      return D;
    },
    frameCount: p.frameCount
  };
}, Bg = (n) => typeof window > "u" ? n : new URL(n, window.origin).href, Ug = {
  playbackRate: {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    default: 1,
    description: "Playback Rate"
  },
  ...vr,
  hidden: to
}, Am = c.forwardRef(({
  src: n,
  width: i,
  height: s,
  onError: a,
  loopBehavior: d = "loop",
  playbackRate: f = 1,
  fit: h = "fill",
  effects: p,
  controls: m,
  ...g
}, w) => {
  const y = Bg(n), [x, R] = c.useState(null), { delayRender: k, continueRender: S } = Jt(), [I] = c.useState(() => k(`Rendering <AnimatedImage/> with src="${y}"`)), L = vn(), { fps: D } = Ot(), M = L / f / D, P = c.useRef(M);
  P.current = M;
  const _ = c.useRef(null), $ = ni({
    effects: p,
    overrideId: (m == null ? void 0 : m.overrideId) ?? null
  });
  c.useImperativeHandle(w, () => {
    var H;
    const U = (H = _.current) == null ? void 0 : H.getCanvas();
    if (!U)
      throw new Error("Canvas ref is not set");
    return U;
  }, []);
  const [A] = c.useState(() => d);
  return c.useEffect(() => {
    const U = new AbortController();
    return zg({
      resolvedSrc: y,
      signal: U.signal,
      currentTime: P.current,
      initialLoopBehavior: A
    }).then((H) => {
      R(H), S(I);
    }).catch((H) => {
      if (H.name === "AbortError") {
        S(I);
        return;
      }
      a ? (a == null || a(H), S(I)) : Go(H);
    }), () => {
      U.abort();
    };
  }, [
    y,
    I,
    a,
    A,
    S
  ]), c.useLayoutEffect(() => {
    if (!x)
      return;
    const U = k(`Rendering frame at ${M} of <AnimatedImage src="${n}"/>`);
    let H = !1;
    return x.getFrame(M, d).then(async (K) => {
      var q, ee;
      if (H)
        return;
      if (K === null) {
        (q = _.current) == null || q.clear(), S(U);
        return;
      }
      await ((ee = _.current) == null ? void 0 : ee.draw(K.frame)) && !H && S(U);
    }).catch((K) => {
      H || (a ? (a(K), S(U)) : Go(K));
    }), () => {
      H = !0, S(U);
    };
  }, [
    M,
    x,
    d,
    a,
    n,
    S,
    k,
    $,
    h,
    i,
    s
  ]), /* @__PURE__ */ E.jsx(Dg, {
    ref: _,
    width: i,
    height: s,
    fit: h,
    effects: $,
    ...g
  });
});
Am.displayName = "AnimatedImageContent";
var Hg = ({
  src: n,
  width: i,
  height: s,
  onError: a,
  fit: d,
  playbackRate: f,
  loopBehavior: h,
  id: p,
  className: m,
  style: g,
  durationInFrames: w,
  effects: y = [],
  _experimentalControls: x,
  ref: R,
  ...k
}) => {
  const { durationInFrames: S } = Ot(), I = w ?? S, L = ti(y), D = {
    src: n,
    width: i,
    height: s,
    onError: a,
    fit: d,
    playbackRate: f,
    loopBehavior: h,
    id: p,
    className: m,
    style: g
  };
  return /* @__PURE__ */ E.jsx(Nt, {
    layout: "none",
    durationInFrames: I,
    name: "<AnimatedImage>",
    _remotionInternalDocumentationLink: "https://www.remotion.dev/docs/animatedimage",
    _experimentalControls: x,
    _remotionInternalEffects: L,
    ...k,
    children: /* @__PURE__ */ E.jsx(Am, {
      ...D,
      ref: R,
      effects: y,
      controls: x
    })
  });
}, Dm = Kn(Hg, Ug);
Dm.displayName = "AnimatedImage";
_t(Dm);
var Wg = {
  color: {
    type: "color",
    default: "transparent",
    description: "Color"
  },
  width: {
    type: "number",
    min: 1,
    step: 1,
    default: 1920,
    description: "Width"
  },
  height: {
    type: "number",
    min: 1,
    step: 1,
    default: 1080,
    description: "Height"
  },
  ...vr
}, Kg = ({
  color: n,
  width: i,
  height: s,
  effects: a = [],
  className: d,
  style: f,
  overrideId: h,
  ref: p
}) => {
  const { delayRender: m, continueRender: g, cancelRender: w } = Jt(), [y, x] = c.useState(null), R = ni({
    effects: a,
    overrideId: h ?? null
  }), k = c.useMemo(() => {
    if (typeof document > "u")
      return null;
    const L = document.createElement("canvas");
    return L.width = 1, L.height = 1, L;
  }, []), S = oi(), I = c.useCallback((L) => {
    x(L), typeof p == "function" ? p(L) : p && (p.current = L);
  }, [p]);
  return c.useEffect(() => {
    if (!y || !k)
      return;
    const L = m("Solid effect chain");
    if (!S)
      return g(L), () => {
        g(L);
      };
    const D = k.getContext("2d", { colorSpace: "srgb" });
    if (!D) {
      w(new Error("Failed to acquire 2D context for <Solid> source"));
      return;
    }
    return D.clearRect(0, 0, 1, 1), n !== void 0 && (D.fillStyle = n, D.fillRect(0, 0, 1, 1)), ri({
      state: S.get(i, s),
      source: k,
      effects: R,
      output: y,
      width: i,
      height: s
    }).then((M) => {
      M && g(L);
    }).catch((M) => {
      w(M);
    }), () => {
      g(L);
    };
  }, [
    n,
    y,
    k,
    S,
    i,
    s,
    m,
    g,
    w,
    R
  ]), /* @__PURE__ */ E.jsx("canvas", {
    ref: I,
    width: i,
    height: s,
    className: d,
    style: f
  });
}, Qg = c.forwardRef(({
  effects: n = [],
  _experimentalControls: i,
  color: s,
  height: a,
  width: d,
  className: f,
  durationInFrames: h,
  style: p,
  name: m,
  from: g,
  hidden: w,
  showInTimeline: y,
  ...x
}, R) => {
  const k = ti(n);
  return /* @__PURE__ */ E.jsx(Nt, {
    layout: "none",
    from: g,
    hidden: w,
    showInTimeline: y,
    _experimentalControls: i,
    _remotionInternalEffects: k,
    durationInFrames: h,
    name: m ?? "<Solid>",
    _remotionInternalDocumentationLink: m === void 0 ? "https://www.remotion.dev/docs/solid" : void 0,
    ...x,
    children: /* @__PURE__ */ E.jsx(Kg, {
      ref: R,
      overrideId: (i == null ? void 0 : i.overrideId) ?? null,
      color: s,
      height: a,
      width: d,
      className: f,
      style: p,
      effects: n
    })
  });
}), Om = Kn(Qg, Wg);
Om.displayName = "Solid";
_t(Om);
var vs = null, zm = () => {
  if (vs !== null)
    return vs;
  if (typeof document > "u")
    return !1;
  const n = document.createElement("canvas"), i = n.getContext("2d");
  return vs = typeof (i == null ? void 0 : i.drawElementImage) == "function" && typeof n.requestPaint == "function" && typeof n.captureElementImage == "function" && "transferControlToOffscreen" in HTMLCanvasElement.prototype, vs;
}, Yg = "HTML in Canvas is not supported. Two common causes: Chrome is older than version 148 (update Chrome), or the HTML-in-Canvas flag is disabled at chrome://flags/#canvas-draw-element (enable it and restart Chrome).";
function Gg(n, i) {
  if (typeof n != "number" || typeof i != "number")
    throw new Error(`HtmlInCanvas: \`width\` and \`height\` must be numbers. Received width=${String(n)}, height=${String(i)}.`);
  if (!Number.isInteger(n) || n <= 0)
    throw new Error(`HtmlInCanvas: \`width\` must be a positive integer. Received: ${String(n)}.`);
  if (!Number.isInteger(i) || i <= 0)
    throw new Error(`HtmlInCanvas: \`height\` must be a positive integer. Received: ${String(i)}.`);
}
var Jg = ({
  canvas: n,
  element: i,
  elementImage: s
}) => {
  const a = n.getContext("2d");
  if (!a)
    throw new Error("Failed to acquire 2D context for <HtmlInCanvas> canvas");
  a.reset();
  const d = a.drawElementImage(s, 0, 0);
  i.style.transform = d.toString();
}, Nf = c.createContext(!1), Bm = c.forwardRef(({ width: n, height: i, effects: s, children: a, onPaint: d, onInit: f, controls: h, style: p }, m) => {
  const g = c.useContext(Nf);
  Gg(n, i);
  const { continueRender: w, cancelRender: y } = Jt();
  zm() || y(new Error(Yg));
  const x = c.useRef(null), R = c.useRef(null), k = c.useRef(null), S = `${n}x${i}`, I = c.useCallback((q) => {
    x.current = q, typeof m == "function" ? m(q) : m && (m.current = q);
  }, [m]), L = oi(), D = ni({
    effects: s,
    overrideId: (h == null ? void 0 : h.overrideId) ?? null
  }), M = c.useRef(D);
  M.current = D;
  const P = c.useRef(d);
  P.current = d;
  const _ = c.useRef(f);
  _.current = f;
  const $ = c.useRef(!1), A = c.useRef(null), U = c.useRef(!1), H = c.useCallback(async () => {
    const q = k.current;
    if (!q)
      throw new Error("Canvas or scene element not found");
    const ee = R.current;
    if (!ee)
      throw new Error("HtmlInCanvas: offscreen canvas not ready (transferControlToOffscreen failed or canvas is remounting)");
    ee.width = n, ee.height = i;
    try {
      const re = x.current;
      if (!re)
        throw new Error("Canvas not found");
      if (!ee.getContext("2d"))
        throw new Error("Failed to acquire 2D context for <HtmlInCanvas> offscreen canvas");
      const ue = Pf("onPaint");
      if (!$.current) {
        $.current = !0;
        const J = re.captureElementImage(q), B = _.current;
        if (B) {
          const T = await B({
            canvas: ee,
            element: q,
            elementImage: J
          });
          if (typeof T != "function")
            throw new Error("HtmlInCanvas: when `onInit` is provided, it must return a cleanup function, or a Promise that resolves to one.");
          U.current ? T() : A.current = T;
        }
      }
      const W = P.current ?? Jg, F = re.captureElementImage(q);
      await W({
        canvas: ee,
        element: q,
        elementImage: F
      }), await ri({
        state: L.get(n, i),
        source: ee,
        effects: M.current,
        output: ee,
        width: n,
        height: i
      }), w(ue);
    } catch (re) {
      y(re);
    }
  }, [L, w, y, n, i]);
  c.useLayoutEffect(() => {
    const q = x.current;
    if (!q)
      throw new Error("Canvas not found");
    q.layoutSubtree = !0;
    const ee = q.transferControlToOffscreen();
    return R.current = ee, ee.width = n, ee.height = i, $.current = !1, U.current = !1, q.addEventListener("paint", H), () => {
      var re;
      q.removeEventListener("paint", H), R.current = null, $.current = !1, U.current = !0, (re = A.current) == null || re.call(A), A.current = null;
    };
  }, [H, y, n, i]);
  const K = c.useRef(!1);
  c.useLayoutEffect(() => {
    var ee;
    if (!K.current) {
      K.current = !0;
      return;
    }
    const q = x.current;
    q && ((ee = q.requestPaint) == null || ee.call(q));
  }, [d, D]), c.useLayoutEffect(() => {
    const q = x.current;
    if (!q)
      return;
    const ee = Pf("waiting for first paint after canvas resize");
    return q.addEventListener("paint", () => {
      w(ee);
    }, { once: !0 }), () => {
      w(ee);
    };
  }, [n, i, w, S]);
  const Q = c.useMemo(() => ({
    width: n,
    height: i
  }), [n, i]);
  if (g)
    throw new Error("<HtmlInCanvas> effects cannot be nested together. Chrome will only display the outer effect. Consider merging the effects into one if you can.");
  return /* @__PURE__ */ E.jsx(Nf.Provider, {
    value: !0,
    children: /* @__PURE__ */ E.jsx("canvas", {
      ref: I,
      width: n,
      height: i,
      style: p,
      children: /* @__PURE__ */ E.jsx("div", {
        ref: k,
        style: Q,
        children: a
      })
    }, S)
  });
});
Bm.displayName = "HtmlInCanvasContent";
var Um = c.forwardRef(({
  width: n,
  height: i,
  effects: s = [],
  children: a,
  onPaint: d,
  onInit: f,
  _experimentalControls: h,
  style: p,
  durationInFrames: m,
  name: g,
  ...w
}, y) => {
  const { durationInFrames: x } = Ot(), R = m ?? x, k = ti(s);
  return /* @__PURE__ */ E.jsx(Nt, {
    durationInFrames: R,
    name: g ?? "<HtmlInCanvas>",
    _remotionInternalDocumentationLink: g === void 0 ? "https://www.remotion.dev/docs/remotion/html-in-canvas" : void 0,
    _experimentalControls: h,
    _remotionInternalEffects: k,
    layout: "none",
    ...w,
    children: /* @__PURE__ */ E.jsx(Bm, {
      ref: y,
      width: n,
      height: i,
      effects: s,
      onPaint: d,
      onInit: f,
      controls: h,
      style: p,
      children: a
    })
  });
});
Um.displayName = "HtmlInCanvas";
var Xg = {
  ...vr,
  hidden: to
}, Zg = Kn(Um, Xg), Hm = Object.assign(Zg, {
  isSupported: zm
});
Hm.displayName = "HtmlInCanvas";
_t(Hm);
var qg = (n) => {
  if (typeof n != "string")
    throw new TypeError(`The "filename" must be a string, but you passed a value of type ${typeof n}`);
  if (n.trim() === "")
    throw new Error("The `filename` must not be empty");
  if (!n.match(/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g))
    throw new Error('The `filename` must match "/^([0-9a-zA-Z-!_.*\'()/:&$@=;+,?]+)/g". Use forward slashes only, even on Windows.');
}, ey = (n) => {
  if (typeof n != "string" && !(n instanceof Uint8Array))
    throw new TypeError(`The "content" must be a string or Uint8Array, but you passed a value of type ${typeof n}`);
  if (typeof n == "string" && n.trim() === "")
    throw new Error("The `content` must not be empty");
}, Wm = (n) => {
  n.type === "artifact" && (qg(n.filename), n.contentType !== "thumbnail" && ey(n.content));
}, gr = c.createContext({
  registerRenderAsset: () => {
  },
  unregisterRenderAsset: () => {
  },
  renderAssets: []
}), ty = ({ children: n, collectAssets: i }) => {
  const [s, a] = c.useState([]), d = c.useRef([]), f = c.useCallback((m) => {
    Wm(m), d.current = [...d.current, m], a(d.current);
  }, []);
  i && c.useImperativeHandle(i, () => ({
    collectAssets: () => {
      const m = d.current;
      return d.current = [], a([]), m;
    }
  }), []);
  const h = c.useCallback((m) => {
    d.current = d.current.filter((g) => g.id !== m), a(d.current);
  }, []);
  c.useLayoutEffect(() => {
    typeof window < "u" && (window.remotion_collectAssets = () => {
      const m = d.current;
      return d.current = [], a([]), m;
    });
  }, []);
  const p = c.useMemo(() => ({
    registerRenderAsset: f,
    unregisterRenderAsset: h,
    renderAssets: s
  }), [s, f, h]);
  return /* @__PURE__ */ E.jsx(gr.Provider, {
    value: p,
    children: n
  });
}, nn = (n) => typeof window > "u" || n.startsWith("http://") || n.startsWith("https://") || n.startsWith("file://") || n.startsWith("blob:") || n.startsWith("data:") ? n : new URL(n, window.origin).href, Ls = ({
  trimAfter: n,
  mediaDurationInFrames: i,
  playbackRate: s,
  trimBefore: a
}) => {
  let d = i;
  typeof n < "u" && (d = n), typeof a < "u" && (d -= a);
  const f = d / s;
  return Math.floor(f);
}, Km = c.createContext(null), ny = () => ge.useContext(Km), $s = ({
  durationInFrames: n,
  times: i = 1 / 0,
  children: s,
  name: a,
  showInTimeline: d,
  ...f
}) => {
  const h = vn(), { durationInFrames: p } = Ot();
  if (Ts(n, {
    component: "of the <Loop /> component",
    allowFloats: !0
  }), typeof i != "number")
    throw new TypeError(`You passed to "times" an argument of type ${typeof i}, but it must be a number.`);
  if (i !== 1 / 0 && i % 1 !== 0)
    throw new TypeError(`The "times" prop of a loop must be an integer, but got ${i}.`);
  if (i < 0)
    throw new TypeError(`The "times" prop of a loop must be at least 0, but got ${i}`);
  const m = Math.ceil(p / n), g = Math.min(m, i), w = f.layout === "none" ? void 0 : f.style, y = n * (g - 1), R = Math.floor(h / n) * n, k = Math.min(R, y), S = c.useMemo(() => ({
    numberOfTimes: Math.min(p / n, i),
    startOffset: -k,
    durationInFrames: n
  }), [p, n, k, i]), I = c.useMemo(() => ({
    iteration: Math.floor(h / n),
    durationInFrames: n
  }), [h, n]);
  return /* @__PURE__ */ E.jsx(Km.Provider, {
    value: I,
    children: /* @__PURE__ */ E.jsx(Nt, {
      durationInFrames: n,
      from: k,
      name: a ?? "<Loop>",
      _remotionInternalDocumentationLink: a === void 0 ? "https://www.remotion.dev/docs/loop" : void 0,
      _remotionInternalLoopDisplay: S,
      layout: f.layout,
      style: w,
      showInTimeline: d,
      children: s
    })
  });
};
$s.useLoop = ny;
var ut = ({
  logLevel: n,
  tag: i,
  message: s,
  mountTime: a
}) => {
  const d = [a ? Date.now() - a + "ms " : null, i].filter(Boolean).join(" ");
  Ze.trace({ logLevel: n, tag: null }, `[${d}]`, s);
}, js = c.createContext({}), _f = {}, Fa = [], Qm = ({ children: n }) => {
  const [i, s] = c.useState(() => _f);
  return c.useEffect(() => {
    const a = () => {
      s(_f);
    };
    return Fa.push(a), () => {
      Fa = Fa.filter((d) => d !== a);
    };
  }, []), /* @__PURE__ */ E.jsx(js.Provider, {
    value: i,
    children: n
  });
}, Ym = (n) => {
  const i = n.indexOf("#");
  return i === -1 ? null : i;
}, ry = (n) => {
  const i = Ym(n);
  return i === null ? n : n.slice(0, i);
}, yr = (n) => {
  const i = c.useContext(js), s = Ym(n), a = ry(n);
  return i[a] ? s !== null ? i[a] + n.slice(s) : i[a] : n;
}, Vs = (n, i) => {
  if (typeof n.volume != "number" && typeof n.volume != "function" && typeof n.volume < "u")
    throw new TypeError(`You have passed a volume of type ${typeof n.volume} to your <${i} /> component. Volume must be a number or a function with the signature '(frame: number) => number' undefined.`);
  if (typeof n.volume == "number" && n.volume < 0)
    throw new TypeError(`You have passed a volume below 0 to your <${i} /> component. Volume must be between 0 and 1`);
  if (typeof n.playbackRate != "number" && typeof n.playbackRate < "u")
    throw new TypeError(`You have passed a playbackRate of type ${typeof n.playbackRate} to your <${i} /> component. Playback rate must a real number or undefined.`);
  if (typeof n.playbackRate == "number" && (isNaN(n.playbackRate) || !Number.isFinite(n.playbackRate) || n.playbackRate <= 0))
    throw new TypeError(`You have passed a playbackRate of ${n.playbackRate} to your <${i} /> component. Playback rate must be a real number above 0.`);
  if (typeof n.preservePitch != "boolean" && typeof n.preservePitch < "u")
    throw new TypeError(`'preservePitch' must be a boolean or undefined but got '${typeof n.preservePitch}' instead`);
}, oy = (n, i) => {
  if (typeof n < "u") {
    if (typeof n != "number")
      throw new TypeError(`type of startFrom prop must be a number, instead got type ${typeof n}.`);
    if (isNaN(n) || n === 1 / 0)
      throw new TypeError("startFrom prop can not be NaN or Infinity.");
    if (n < 0)
      throw new TypeError(`startFrom must be greater than equal to 0 instead got ${n}.`);
  }
  if (typeof i < "u") {
    if (typeof i != "number")
      throw new TypeError(`type of endAt prop must be a number, instead got type ${typeof i}.`);
    if (isNaN(i))
      throw new TypeError("endAt prop can not be NaN.");
    if (i <= 0)
      throw new TypeError(`endAt must be a positive number, instead got ${i}.`);
  }
  if (i < n)
    throw new TypeError("endAt prop must be greater than startFrom prop.");
}, iy = (n, i) => {
  if (typeof n < "u") {
    if (typeof n != "number")
      throw new TypeError(`type of trimBefore prop must be a number, instead got type ${typeof n}.`);
    if (isNaN(n) || n === 1 / 0)
      throw new TypeError("trimBefore prop can not be NaN or Infinity.");
    if (n < 0)
      throw new TypeError(`trimBefore must be greater than equal to 0 instead got ${n}.`);
  }
  if (typeof i < "u") {
    if (typeof i != "number")
      throw new TypeError(`type of trimAfter prop must be a number, instead got type ${typeof i}.`);
    if (isNaN(i))
      throw new TypeError("trimAfter prop can not be NaN.");
    if (i <= 0)
      throw new TypeError(`trimAfter must be a positive number, instead got ${i}.`);
  }
  if (i <= n)
    throw new TypeError("trimAfter prop must be greater than trimBefore prop.");
}, As = ({
  startFrom: n,
  endAt: i,
  trimBefore: s,
  trimAfter: a
}) => {
  if (typeof n < "u" && typeof s < "u")
    throw new TypeError("Cannot use both startFrom and trimBefore props. Use trimBefore instead as startFrom is deprecated.");
  if (typeof i < "u" && typeof a < "u")
    throw new TypeError("Cannot use both endAt and trimAfter props. Use trimAfter instead as endAt is deprecated.");
  typeof s < "u" || typeof a < "u" ? iy(s, a) : (typeof n < "u" || typeof i < "u") && oy(n, i);
}, Ds = ({
  startFrom: n,
  endAt: i,
  trimBefore: s,
  trimAfter: a
}) => ({ trimBeforeValue: s ?? n ?? void 0, trimAfterValue: a ?? i ?? void 0 }), sy = (n, i) => {
  switch (i.type) {
    case "got-duration": {
      const s = nn(i.src);
      return n[s] === i.durationInSeconds ? n : {
        ...n,
        [s]: i.durationInSeconds
      };
    }
    default:
      return n;
  }
}, ml = c.createContext({
  durations: {},
  setDurations: () => {
    throw new Error("context missing");
  }
}), Gm = ({ children: n }) => {
  const [i, s] = c.useReducer(sy, {}), a = c.useMemo(() => ({
    durations: i,
    setDurations: s
  }), [i]);
  return /* @__PURE__ */ E.jsx(ml.Provider, {
    value: a,
    children: n
  });
}, pl = ({
  crossOrigin: n,
  requestsVideoFrame: i,
  isClientSideRendering: s
}) => {
  if (n != null)
    return n;
  if (s || i)
    return "anonymous";
}, ks = ({
  mediaRef: n,
  mediaType: i,
  onAutoPlayError: s,
  logLevel: a,
  mountTime: d,
  reason: f,
  isPlayer: h
}) => {
  const { current: p } = n;
  if (!p)
    return;
  ut({
    logLevel: a,
    tag: "play",
    message: `Attempting to play ${p.src}. Reason: ${f}`,
    mountTime: d
  });
  const m = p.play();
  m.catch && m.catch((g) => {
    if (p && !g.message.includes("request was interrupted by a call to pause") && !g.message.includes("The operation was aborted.") && !g.message.includes("The fetching process for the media resource was aborted by the user agent") && !g.message.includes("request was interrupted by a new load request") && !g.message.includes("because the media was removed from the document") && !(g.message.includes("user didn't interact with the document") && p.muted) && (console.log(`Could not play ${i} due to following error: `, g), !p.muted)) {
      if (s) {
        s();
        return;
      }
      i === "video" && h && (Ze.info({ logLevel: a, tag: "<" + i + ">" }, "The video will be muted and we'll retry playing it."), Ze.info({ logLevel: a, tag: "<" + i + ">" }, "Use onAutoPlayError() to handle this error yourself."), p.muted = !0, p.play());
    }
  });
}, hl = ({
  audioContext: n,
  ref: i
}) => {
  let s = null, a = !1;
  return {
    attemptToConnect: () => {
      if (a)
        throw new Error("SharedElementSourceNode has been disposed");
      !s && i.current && (s = n.createMediaElementSource(i.current));
    },
    get: () => {
      if (!s)
        throw new Error("Audio element not connected");
      return s;
    },
    cleanup: () => {
      s && (s.disconnect(), s = null), a = !0;
    }
  };
}, Ff = !1, uy = (n) => {
  Ff || (Ff = !0, typeof window < "u" && Ze.warn({ logLevel: n, tag: null }, "AudioContext is not supported in this browser"));
}, ay = ({
  logLevel: n,
  latencyHint: i,
  audioEnabled: s
}) => {
  const a = Qe();
  return c.useMemo(() => {
    if (a.isRendering || !s)
      return null;
    if (typeof AudioContext > "u")
      return uy(n), null;
    const f = new AudioContext({
      latencyHint: i,
      sampleRate: 48e3
    }), h = f.createGain();
    h.connect(f.destination), Ze.trace({ logLevel: n, tag: "audio" }, "Creating new audio context"), f.suspend();
    let p = null;
    return {
      audioContext: f,
      gainNode: h,
      getState: () => {
        const y = f.state;
        return p === "running" && y !== "running" ? "suspended-to-running" : p === "suspended" && y !== "suspended" ? "running-to-suspended" : y;
      },
      resume: () => {
        p = "running";
        const y = f.resume();
        return y.finally(() => {
          p === "running" && (p = null);
        }), y;
      },
      suspend: () => {
        p = "suspended";
        const y = f.suspend();
        return y.finally(() => {
          p === "suspended" && (p = null);
        }), y;
      }
    };
  }, [n, i, a.isRendering, s]);
}, ly = (n, i) => new Promise((s) => {
  const a = n.currentTime, f = n.getOutputTimestamp().performanceTime, h = performance.now(), p = () => {
    var y;
    const { currentTime: m } = n, g = n.getOutputTimestamp(), w = performance.now() - h;
    if (f !== void 0 && g.performanceTime !== void 0 && g.performanceTime > f && g.contextTime !== void 0 && g.contextTime > a) {
      Ze.verbose({ logLevel: i, tag: "audio" }, `waitUntilActuallyResumed: getOutputTimestamp.performanceTime advanced from ${f.toFixed(6)} to ${g.performanceTime.toFixed(6)} after ${w.toFixed(1)}ms. currentTime=${m.toFixed(6)} (advanced by ${(m - a).toFixed(6)}), getOutputTimestamp.performanceTime=${((y = g.performanceTime) == null ? void 0 : y.toFixed(1)) ?? "undefined"}`), s();
      return;
    }
    requestAnimationFrame(p);
  };
  requestAnimationFrame(p);
}), Mf = "data:audio/mp3;base64,/+MYxAAJcAV8AAgAABn//////+/gQ5BAMA+D4Pg+BAQBAEAwD4Pg+D4EBAEAQDAPg++hYBH///hUFQVBUFREDQNHmf///////+MYxBUGkAGIMAAAAP/29Xt6lUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/+MYxDUAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV", cy = (n, i) => {
  const s = Object.keys(n).sort(), a = Object.keys(i).sort();
  if (s.length !== a.length)
    return !1;
  for (let d = 0; d < s.length; d++)
    if (s[d] !== a[d] || n[s[d]] !== i[a[d]])
      return !1;
  return !0;
}, dy = (n, i, s) => n === "src" && !s.startsWith("data:") && !i.startsWith("data:") ? new URL(s, window.origin).toString() !== new URL(i, window.origin).toString() : s !== i, ro = c.createContext(null), Os = c.createContext(null), fy = (n) => {
  if (n === "suspended" || n === "running-to-suspended" || n === "interrupted")
    return !0;
  if (n === "running" || n === "suspended-to-running")
    return !1;
  throw new Error(`Unexpected audio context state: ${n}`);
}, Jm = ({ children: n, audioLatencyHint: i, audioEnabled: s }) => {
  const a = rn(), d = ay({
    logLevel: a,
    latencyHint: i,
    audioEnabled: s
  }), f = c.useRef(!1), h = c.useRef(null), p = c.useMemo(() => ({ value: 0 }), []), m = c.useRef([]), g = c.useMemo(() => ({
    dispatch: (D) => {
      m.current.forEach((M) => M(D));
    },
    subscribe: (D) => (m.current.push(D), {
      remove: () => {
        m.current = m.current.filter((M) => M !== D);
      }
    })
  }), []), w = c.useRef({ scheduledEndTime: null, mediaEndTime: null }), y = c.useRef(/* @__PURE__ */ new Map()), x = c.useCallback((D) => {
    y.current.delete(D);
  }, []), R = c.useMemo(() => ({
    node: D,
    mediaTimestamp: M,
    scheduledTime: P,
    duration: _,
    offset: $,
    originalUnloopedMediaTimestamp: A
  }) => {
    if (!d)
      throw new Error("Audio context not found");
    const U = d.getState();
    if (U === "closed")
      return {
        type: "not-started",
        reason: "audio context is closed"
      };
    const H = fy(U);
    _ > 0 && (H ? y.current.set(D, {
      scheduledTime: P,
      offset: $,
      duration: _
    }) : D.start(P, $, _));
    const K = P + _ / D.playbackRate.value, Q = M + $, q = Q + _, ee = d.audioContext.baseLatency + d.audioContext.outputLatency, re = P - d.audioContext.currentTime, ie = w.current, ue = ie.scheduledEndTime !== null && Math.abs(P - ie.scheduledEndTime) > 1e-3, W = ie.mediaEndTime !== null && Math.abs(Q - ie.mediaEndTime) > 1e-3;
    return Ze.verbose({ logLevel: a, tag: "audio-scheduling" }, "scheduled %c%s%c %s %c%s%c %s %c%s%c %s %s %s %s %s", ue ? "color: red; font-weight: bold" : "", P.toFixed(4), "", K.toFixed(4), W ? "color: red; font-weight: bold" : "", Q.toFixed(4), "", q.toFixed(4), _ < 0 || re < 0 ? "color: red; font-weight: bold" : "color: blue; font-weight: bold", _ < 0 ? "missed " + Math.abs($).toFixed(2) + "s" : Math.abs(re).toFixed(2) + (re < 0 ? " delay" : " ahead"), "", "current=" + d.audioContext.currentTime.toFixed(4), "offset=" + $.toFixed(4), "latency=" + ee.toFixed(4), "state=" + d.audioContext.state, A !== Q ? "original_ts=" + A.toFixed(4) : "", "action=" + (H ? "schedule" : "start"), ""), ie.scheduledEndTime = K, ie.mediaEndTime = q, _ > 0 ? {
      type: "started",
      scheduledTime: P
    } : {
      type: "not-started",
      reason: "missed " + Math.abs($).toFixed(2) + "s"
    };
  }, [d, a]), k = c.useCallback(() => {
    if (!d || f.current)
      return Promise.resolve();
    f.current = !0, d.gainNode.gain.cancelScheduledValues(d.audioContext.currentTime), d.gainNode.gain.setValueAtTime(0, d.audioContext.currentTime), d.gainNode.gain.linearRampToValueAtTime(1, d.audioContext.currentTime + 0.03), y.current.forEach((M, P) => {
      P.start(M.scheduledTime, M.offset, M.duration);
    }), y.current.clear();
    const D = d.resume();
    return h.current = new Promise((M) => {
      ly(d.audioContext, a).then(M), D.catch((P) => {
        Ze.warn({ logLevel: a, tag: "audio" }, "AudioContext resume rejected, continuing without audio sync", P), M();
      });
    }).finally(() => {
      h.current = null;
    }), D.catch(() => {
    });
  }, [d, a]), S = c.useCallback(() => h.current, []), I = c.useCallback(() => !d || !f.current ? Promise.resolve() : (f.current = !1, d.suspend()), [d]), L = c.useMemo(() => ({
    audioContext: (d == null ? void 0 : d.audioContext) ?? null,
    getAudioContextState: () => (d == null ? void 0 : d.getState()) ?? null,
    gainNode: (d == null ? void 0 : d.gainNode) ?? null,
    audioSyncAnchor: p,
    audioSyncAnchorEmitter: g,
    scheduleAudioNode: R,
    resume: k,
    suspend: I,
    getIsResumingAudioContext: S,
    unscheduleAudioNode: x
  }), [
    d,
    p,
    g,
    R,
    k,
    I,
    S,
    x
  ]);
  return /* @__PURE__ */ E.jsx(ro.Provider, {
    value: L,
    children: n
  });
}, Xm = ({ children: n, numberOfAudioTags: i }) => {
  const s = c.useRef([]), [a] = c.useState(i);
  if (i !== a)
    throw new Error("The number of shared audio tags has changed dynamically. Once you have set this property, you cannot change it afterwards.");
  const d = rn(), f = ei(), h = Qe(), p = c.useContext(ro), m = (p == null ? void 0 : p.audioContext) ?? null, g = p == null ? void 0 : p.resume, w = c.useMemo(() => new Array(i).fill(!0).map(() => {
    const M = c.createRef();
    return {
      id: Math.random(),
      ref: M,
      mediaElementSourceNode: m ? hl({
        audioContext: m,
        ref: M
      }) : null
    };
  }), [m, i]);
  (ge.useInsertionEffect ?? ge.useLayoutEffect)(() => () => {
    requestAnimationFrame(() => {
      w.forEach(({ mediaElementSourceNode: M }) => {
        M == null || M.cleanup();
      });
    });
  }, [w]);
  const x = c.useRef(new Array(i).fill(!1)), R = c.useCallback(() => {
    w.forEach(({ ref: M, id: P }) => {
      var A;
      const _ = (A = s.current) == null ? void 0 : A.find((U) => U.id === P), { current: $ } = M;
      if ($) {
        if (_ === void 0) {
          $.src = Mf;
          return;
        }
        if (!_)
          throw new TypeError("Expected audio data to be there");
        Object.keys(_.props).forEach((U) => {
          dy(U, _.props[U], $[U]) && ($[U] = _.props[U]);
        });
      }
    });
  }, [w]), k = c.useCallback((M) => {
    var ie, ue;
    const { aud: P, audioId: _, premounting: $, postmounting: A } = M, U = (ie = s.current) == null ? void 0 : ie.find((W) => W.audioId === _);
    if (U)
      return U;
    const H = x.current.findIndex((W) => W === !1);
    if (H === -1)
      throw new Error(`Tried to simultaneously mount ${i + 1} <Html5Audio /> tags at the same time. With the current settings, the maximum amount of <Html5Audio /> tags is limited to ${i} at the same time. Remotion pre-mounts silent audio tags to help avoid browser autoplay restrictions. See https://remotion.dev/docs/player/autoplay#using-the-numberofsharedaudiotags-prop for more information on how to increase this limit.`);
    const { id: K, ref: Q, mediaElementSourceNode: q } = w[H], ee = [...x.current];
    ee[H] = K, x.current = ee;
    const re = {
      props: P,
      id: K,
      el: Q,
      audioId: _,
      mediaElementSourceNode: q,
      premounting: $,
      audioMounted: !!Q.current,
      postmounting: A,
      cleanupOnMediaTagUnmount: () => {
      }
    };
    return (ue = s.current) == null || ue.push(re), R(), re;
  }, [i, w, R]), S = c.useCallback((M) => {
    var $;
    const P = [...x.current], _ = w.findIndex((A) => A.id === M);
    if (_ === -1)
      throw new TypeError("Error occured in ");
    P[_] = !1, x.current = P, s.current = ($ = s.current) == null ? void 0 : $.filter((A) => A.id !== M), R();
  }, [w, R]), I = c.useCallback(({
    aud: M,
    audioId: P,
    id: _,
    premounting: $,
    postmounting: A
  }) => {
    var H;
    let U = !1;
    s.current = (H = s.current) == null ? void 0 : H.map((K) => {
      const Q = !!K.el.current;
      return K.audioMounted !== Q && (U = !0), K.id === _ ? cy(M, K.props) && K.premounting === $ && K.postmounting === A ? K : (U = !0, {
        ...K,
        props: M,
        premounting: $,
        postmounting: A,
        audioId: P,
        audioMounted: Q
      }) : K;
    }), U && R();
  }, [R]), L = c.useCallback(() => {
    w.forEach((M) => {
      const P = s.current.find((_) => _.el === M.ref);
      P != null && P.premounting || ks({
        mediaRef: M.ref,
        mediaType: "audio",
        onAutoPlayError: null,
        logLevel: d,
        mountTime: f,
        reason: "playing all audios",
        isPlayer: h.isPlayer
      });
    }), g == null || g();
  }, [d, f, w, h.isPlayer, g]), D = c.useMemo(() => ({
    registerAudio: k,
    unregisterAudio: S,
    updateAudio: I,
    playAllAudios: L,
    numberOfAudioTags: i
  }), [
    i,
    L,
    k,
    S,
    I
  ]);
  return /* @__PURE__ */ E.jsxs(Os.Provider, {
    value: D,
    children: [
      w.map(({ id: M, ref: P }) => /* @__PURE__ */ E.jsx("audio", {
        ref: P,
        preload: "metadata",
        src: Mf
      }, M)),
      n
    ]
  });
}, my = ({
  aud: n,
  audioId: i,
  premounting: s,
  postmounting: a
}) => {
  const d = c.useContext(ro), f = c.useContext(Os), [h] = c.useState(() => {
    if (f && f.numberOfAudioTags > 0)
      return f.registerAudio({ aud: n, audioId: i, premounting: s, postmounting: a });
    const m = ge.createRef(), g = d != null && d.audioContext ? hl({
      audioContext: d.audioContext,
      ref: m
    }) : null;
    return {
      el: m,
      id: Math.random(),
      props: n,
      audioId: i,
      mediaElementSourceNode: g,
      premounting: s,
      audioMounted: !!m.current,
      postmounting: a,
      cleanupOnMediaTagUnmount: () => {
        g == null || g.cleanup();
      }
    };
  }), p = ge.useInsertionEffect ?? ge.useLayoutEffect;
  return typeof document < "u" && (p(() => {
    f && f.numberOfAudioTags > 0 && f.updateAudio({
      id: h.id,
      aud: n,
      audioId: i,
      premounting: s,
      postmounting: a
    });
  }, [n, f, h.id, i, s, a]), p(() => () => {
    f && f.numberOfAudioTags > 0 && f.unregisterAudio(h.id);
  }, [f, h.id])), h;
}, py = 1e-5, Ps = (n, i) => Math.abs(n - i) < py, Zm = (n, i) => Math.round(n / i * 100) / 100, Ha = () => typeof window > "u" || !/AppleWebKit/.test(window.navigator.userAgent) ? !1 : !window.navigator.userAgent.includes("Chrome/"), zs = () => typeof window > "u" ? !1 : /iP(ad|od|hone)/i.test(window.navigator.userAgent) && Ha(), hy = (n) => zs() && n.startsWith("blob:"), Wa = ({
  actualFrom: n,
  fps: i
}) => Zm(Math.max(0, -n), i), Ka = ({
  duration: n,
  fps: i
}) => Zm(n, i), vy = ({
  actualSrc: n,
  actualFrom: i,
  duration: s,
  fps: a
}) => {
  if (hy(n) || n.startsWith("data:") || !!new URL(n, (typeof window > "u" ? null : window.location.href) ?? "http://localhost:3000").hash || !Number.isFinite(i))
    return n;
  const f = `${n}#t=${Wa({ actualFrom: i, fps: a })}`;
  return Number.isFinite(s) ? `${f},${Ka({ duration: s, fps: a })}` : f;
}, gy = ({
  prevStartFrom: n,
  newStartFrom: i,
  prevDuration: s,
  newDuration: a,
  fps: d
}) => {
  const f = Wa({ actualFrom: n, fps: d }), h = Wa({ actualFrom: i, fps: d }), p = Ka({ duration: s, fps: d }), m = Ka({ duration: a, fps: d });
  return !(h < f || m > p);
}, yy = ({
  actualSrc: n,
  actualFrom: i,
  duration: s,
  fps: a
}) => {
  const d = c.useRef(i), f = c.useRef(s), h = c.useRef(n);
  return (!gy({
    prevStartFrom: d.current,
    newStartFrom: i,
    prevDuration: f.current,
    newDuration: s,
    fps: a
  }) || n !== h.current) && (d.current = i, f.current = s, h.current = n), vy({
    actualSrc: h.current,
    actualFrom: d.current,
    duration: f.current,
    fps: a
  });
}, Lf = !1, wy = (n) => {
  Lf || (Lf = !0, Ze.warn({ logLevel: n, tag: null }, "In Safari, setting a volume and a playback rate at the same time is buggy."), Ze.warn({ logLevel: n, tag: null }, "In Desktop Safari, only volumes <= 1 will be applied."), Ze.warn({ logLevel: n, tag: null }, n, "In Mobile Safari, the volume will be ignored and set to 1 if a playbackRate is set."));
}, qm = ({
  mediaRef: n,
  volume: i,
  logLevel: s,
  source: a,
  shouldUseWebAudioApi: d
}) => {
  var x, R, k;
  const f = c.useRef(null), h = c.useRef(i);
  h.current = i;
  const p = c.useContext(ro);
  if (!p)
    throw new Error("useAmplification must be used within a SharedAudioContext");
  const { audioContext: m, gainNode: g } = p;
  if (typeof window < "u" && c.useLayoutEffect(() => {
    var I, L;
    if (!m || !n.current || !d)
      return;
    if (n.current.playbackRate !== 1 && Ha()) {
      wy(s);
      return;
    }
    if (!a || !g)
      return;
    const S = new GainNode(m, {
      gain: h.current
    });
    return a.attemptToConnect(), a.get().connect(S), S.connect(g), f.current = {
      gainNode: S
    }, Ze.trace({ logLevel: s, tag: null }, `Starting to amplify ${(I = n.current) == null ? void 0 : I.src}. Gain = ${h.current}, playbackRate = ${(L = n.current) == null ? void 0 : L.playbackRate}`), () => {
      f.current = null, S.disconnect(), a.get().disconnect();
    };
  }, [
    s,
    n,
    m,
    a,
    d,
    g
  ]), f.current) {
    const S = i;
    Ps(f.current.gainNode.gain.value, S) || (f.current.gainNode.gain.value = S, Ze.trace({ logLevel: s, tag: null }, `Setting gain to ${S} for ${(x = n.current) == null ? void 0 : x.src}`));
  }
  return (Ha() && n.current && ((R = n.current) == null ? void 0 : R.playbackRate) !== 1 || !d) && n.current && !Ps(i, (k = n.current) == null ? void 0 : k.volume) && (n.current.volume = Math.min(i, 1)), f;
}, fr = () => {
  const n = c.useContext(Ke);
  return (n == null ? void 0 : n.cumulatedNegativeFrom) ?? 0;
}, oo = (n) => {
  const i = $s.useLoop(), s = vn(), a = fr();
  return n === "repeat" || i === null ? s + a : s + a + i.durationInFrames * i.iteration;
}, ep = (n) => {
  if (/data:|blob:/.test(n.substring(0, 5)))
    return "Data URL";
  const i = n.split("/").map((s) => s.split("\\")).flat(1);
  return i[i.length - 1];
}, Sy = ({
  compositionDurationInFrames: n,
  playbackRate: i,
  trimBefore: s,
  trimAfter: a,
  parentSequenceDurationInFrames: d,
  loop: f
}) => {
  if (f)
    return n;
  const h = Ls({
    mediaDurationInFrames: n * i + (s ?? 0),
    playbackRate: i,
    trimBefore: s,
    trimAfter: a
  });
  if (d !== null) {
    const p = Math.min(d * i, h);
    return Number(p.toFixed(10));
  }
  return h;
}, wr = ({
  frame: n,
  volume: i,
  mediaVolume: s = 1
}) => {
  if (typeof i == "number")
    return i * s;
  if (typeof i > "u")
    return Number(s);
  const a = i(n) * s;
  if (typeof a != "number")
    throw new TypeError(`You passed in a a function to the volume prop but it did not return a number but a value of type ${typeof a} for frame ${n}`);
  if (Number.isNaN(a))
    throw new TypeError(`You passed in a function to the volume prop but it returned NaN for frame ${n}.`);
  if (!Number.isFinite(a))
    throw new TypeError(`You passed in a function to the volume prop but it returned a non-finite number for frame ${n}.`);
  return Math.max(0, a);
}, $f = {}, Ey = (n) => {
  $f[n] || (console.warn(n), $f[n] = !0);
}, tp = ({
  volume: n,
  mediaVolume: i,
  mediaType: s,
  src: a,
  displayName: d,
  trimBefore: f,
  trimAfter: h,
  playbackRate: p,
  sequenceDurationInFrames: m,
  mediaStartsAt: g,
  loop: w
}) => {
  if (!a)
    throw new Error("No src passed");
  const y = c.useContext(Ke), [x] = c.useState(() => n), R = Sy({
    compositionDurationInFrames: m,
    playbackRate: p,
    trimBefore: f,
    trimAfter: h,
    parentSequenceDurationInFrames: (y == null ? void 0 : y.durationInFrames) ?? null,
    loop: w
  }), k = c.useMemo(() => typeof n == "number" ? n : new Array(Math.floor(Math.max(0, R + g))).fill(!0).map((P, _) => wr({
    frame: _ + g,
    volume: n,
    mediaVolume: i
  })).join(","), [R, g, n, i]);
  c.useEffect(() => {
    typeof n == "number" && n !== x && Ey(`Remotion: The ${s} with src ${a} has changed it's volume. Prefer the callback syntax for setting volume to get better timeline display: https://www.remotion.dev/docs/audio/volume`);
  }, [x, s, a, n]);
  const S = typeof n == "function", I = el(), { rootId: L } = Hn(), D = 0 - g + (f ?? 0);
  return c.useMemo(() => ({
    volumes: k,
    duration: R,
    doesVolumeChange: S,
    nonce: I,
    rootId: L,
    finalDisplayName: d ?? ep(a),
    startMediaFrom: D,
    src: a,
    playbackRate: p
  }), [
    k,
    R,
    S,
    I,
    L,
    d,
    a,
    D,
    p
  ]);
}, vl = ({
  volume: n,
  mediaVolume: i,
  src: s,
  mediaType: a,
  playbackRate: d,
  displayName: f,
  id: h,
  getStack: p,
  showInTimeline: m,
  premountDisplay: g,
  postmountDisplay: w,
  loopDisplay: y,
  documentationLink: x
}) => {
  const R = c.useContext(Ke), k = fr(), { registerSequence: S, unregisterSequence: I } = c.useContext(no), { durationInFrames: L } = Ot(), D = fr(), { volumes: M, duration: P, doesVolumeChange: _, nonce: $, rootId: A, finalDisplayName: U } = tp({
    volume: n,
    mediaVolume: i,
    mediaType: a,
    src: s,
    displayName: f,
    trimAfter: void 0,
    trimBefore: void 0,
    playbackRate: d,
    sequenceDurationInFrames: L,
    mediaStartsAt: D,
    loop: !1
  }), { isStudio: H } = Qe();
  c.useEffect(() => {
    var K, Q;
    if (!s)
      throw new Error("No src passed");
    if (!(!H && ((Q = (K = window.process) == null ? void 0 : K.env) == null ? void 0 : Q.NODE_ENV) !== "test") && m)
      return S({
        type: a,
        src: s,
        id: h,
        duration: P,
        from: 0,
        parent: (R == null ? void 0 : R.id) ?? null,
        displayName: U,
        documentationLink: x,
        rootId: A,
        volume: M,
        showInTimeline: !0,
        nonce: $.get(),
        startMediaFrom: 0 - k,
        doesVolumeChange: _,
        loopDisplay: y,
        playbackRate: d,
        getStack: p,
        premountDisplay: g,
        postmountDisplay: w,
        controls: null,
        effects: []
      }), () => {
        I(h);
      };
  }, [
    P,
    h,
    R,
    s,
    S,
    I,
    M,
    _,
    $,
    a,
    k,
    d,
    p,
    m,
    g,
    w,
    y,
    x,
    A,
    U,
    H
  ]);
}, xy = (n, i) => {
  const [s, a] = c.useState([]), [d, f] = c.useState([]), [h, p] = c.useState([]), g = Qe().isRendering, w = c.useRef(!1), y = c.useCallback((k) => {
    if (g)
      return {
        unblock: () => {
        }
      };
    let S = !1;
    return a((I) => [...I, k]), {
      unblock: () => {
        S || (S = !0, a((I) => {
          const L = I.filter((D) => D !== k);
          return L.length === I.length ? I : L;
        }));
      }
    };
  }, [g]), x = c.useCallback((k) => (f((S) => [...S, k]), {
    remove: () => {
      f((S) => S.filter((I) => I !== k));
    }
  }), []), R = c.useCallback((k) => (p((S) => [...S, k]), {
    remove: () => {
      p((S) => S.filter((I) => I !== k));
    }
  }), []);
  return c.useEffect(() => {
    g || s.length > 0 && (d.forEach((k) => k()), ut({
      logLevel: n,
      message: "Player is entering buffer state",
      mountTime: i,
      tag: "player"
    }));
  }, [s]), typeof window < "u" && c.useLayoutEffect(() => {
    g || s.length === 0 && (h.forEach((k) => k()), ut({
      logLevel: n,
      message: "Player is exiting buffer state",
      mountTime: i,
      tag: "player"
    }));
  }, [s]), c.useMemo(() => ({ addBlock: y, listenForBuffering: x, listenForResume: R, buffering: w }), [y, w, x, R]);
}, io = ge.createContext(null), np = ({ children: n }) => {
  const { logLevel: i, mountTime: s } = c.useContext(pr), a = xy(i ?? "info", s);
  return /* @__PURE__ */ E.jsx(io.Provider, {
    value: a,
    children: n
  });
}, rp = (n) => {
  const [i, s] = c.useState(n.buffering.current);
  return c.useEffect(() => {
    const a = () => {
      s(!0);
    }, d = () => {
      s(!1);
    };
    return n.listenForBuffering(a), n.listenForResume(d), () => {
      n.listenForBuffering(() => {
      }), n.listenForResume(() => {
      });
    };
  }, [n]), i;
}, Bs = () => {
  const n = c.useContext(io), i = rn(), s = n ? n.addBlock : null;
  return c.useMemo(() => ({
    delayPlayback: () => {
      if (!s)
        throw new Error("Tried to enable the buffering state, but a Remotion context was not found. This API can only be called in a component that was passed to the Remotion Player or a <Composition>. Or you might have experienced a version mismatch - run `npx remotion versions` and ensure all packages have the same version. This error is thrown by the buffer state https://remotion.dev/docs/player/buffer-state");
      Ze.trace({ logLevel: i, tag: "[buffer-state]" }, "Adding buffer handle", new Error().stack);
      const { unblock: a } = s({
        id: String(Math.random())
      });
      let d = !1;
      return {
        unblock: () => {
          d || (d = !0, Ze.trace({ logLevel: i, tag: "[buffer-state]" }, "Removing buffer handle"), a());
        }
      };
    }
  }), [s, i]);
}, Cy = () => /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent), ky = ({
  mediaRef: n,
  mediaType: i,
  onVariableFpsVideoDetected: s,
  pauseWhenBuffering: a,
  logLevel: d,
  mountTime: f
}) => {
  const h = c.useRef(!1), { delayPlayback: p } = Bs(), m = c.useCallback((g) => {
    var k;
    if (i !== "video" || !a)
      return;
    const w = n.current;
    if (!w)
      return;
    if (w.readyState >= w.HAVE_FUTURE_DATA && !Cy()) {
      ut({
        logLevel: d,
        message: `Not using buffer until first frame, because readyState is ${w.readyState} and is not Safari or Desktop Chrome`,
        mountTime: f,
        tag: "buffer"
      });
      return;
    }
    if (!w.requestVideoFrameCallback) {
      ut({
        logLevel: d,
        message: "Not using buffer until first frame, because requestVideoFrameCallback is not supported",
        mountTime: f,
        tag: "buffer"
      });
      return;
    }
    h.current = !0, ut({
      logLevel: d,
      message: `Buffering ${(k = n.current) == null ? void 0 : k.src} until the first frame is received`,
      mountTime: f,
      tag: "buffer"
    });
    const y = p(), x = () => {
      y.unblock(), w.removeEventListener("ended", x, {
        once: !0
      }), w.removeEventListener("pause", x, {
        once: !0
      }), h.current = !1;
    }, R = () => {
      x();
    };
    w.requestVideoFrameCallback((S, I) => {
      Math.abs(I.mediaTime - g) > 0.5 && s(), x();
    }), w.addEventListener("ended", R, { once: !0 }), w.addEventListener("pause", R, { once: !0 }), w.addEventListener("canplay", R, {
      once: !0
    });
  }, [
    p,
    d,
    n,
    i,
    f,
    s,
    a
  ]);
  return c.useMemo(() => ({
    isBuffering: () => h.current,
    bufferUntilFirstFrame: m
  }), [m]);
}, Py = (n) => {
  var a, d;
  const i = ge.useRef({
    time: ((a = n.current) == null ? void 0 : a.currentTime) ?? 0,
    lastUpdate: performance.now()
  }), s = ((d = n.current) == null ? void 0 : d.currentTime) ?? null;
  return s !== null && i.current.time !== s && (i.current.time = s, i.current.lastUpdate = performance.now()), i;
}, ws = ({
  mediaRef: n,
  time: i,
  logLevel: s,
  why: a,
  mountTime: d
}) => {
  const f = zs() ? Number(i.toFixed(1)) : i;
  return ut({
    logLevel: s,
    tag: "seek",
    message: `Seeking from ${n.currentTime} to ${f}. src= ${n.src} Reason: ${a}`,
    mountTime: d
  }), n.currentTime = f, f;
}, Ry = ({
  element: n,
  shouldBuffer: i,
  isPremounting: s,
  isPostmounting: a,
  logLevel: d,
  mountTime: f,
  src: h
}) => {
  const p = Bs(), [m, g] = c.useState(!1);
  return c.useEffect(() => {
    let w = [];
    const { current: y } = n;
    if (!y || !i)
      return;
    if (s || a) {
      if ((s || a) && y.readyState < y.HAVE_FUTURE_DATA && !navigator.userAgent.includes("Firefox/")) {
        ut({
          logLevel: d,
          message: `Calling .load() on ${y.src} because readyState is ${y.readyState} and it is not Firefox. Element is premounted ${y.playbackRate}`,
          tag: "load",
          mountTime: f
        });
        const S = y.playbackRate;
        y.load(), y.playbackRate = S;
      }
      return;
    }
    const x = (S) => {
      let I = !1;
      w.forEach((L) => {
        L(S), I = !0;
      }), w = [], g((L) => (L && (I = !0), !1)), I && ut({
        logLevel: d,
        message: `Unmarking as buffering: ${y.src}. Reason: ${S}`,
        tag: "buffer",
        mountTime: f
      });
    }, R = (S) => {
      g(!0), ut({
        logLevel: d,
        message: `Marking as buffering: ${y.src}. Reason: ${S}`,
        tag: "buffer",
        mountTime: f
      });
      const { unblock: I } = p.delayPlayback(), L = () => {
        x('"canplay" was fired'), k();
      }, D = () => {
        x('"error" event was occurred'), k();
      };
      y.addEventListener("canplay", L, {
        once: !0
      }), w.push(() => {
        y.removeEventListener("canplay", L);
      }), y.addEventListener("error", D, {
        once: !0
      }), w.push(() => {
        y.removeEventListener("error", D);
      }), w.push((M) => {
        ut({
          logLevel: d,
          message: `Unblocking ${y.src} from buffer. Reason: ${M}`,
          tag: "buffer",
          mountTime: f
        }), I();
      });
    }, k = () => {
      if (y.readyState < y.HAVE_FUTURE_DATA) {
        if (R(`readyState is ${y.readyState}, which is less than HAVE_FUTURE_DATA`), !navigator.userAgent.includes("Firefox/")) {
          ut({
            logLevel: d,
            message: `Calling .load() on ${h} because readyState is ${y.readyState} and it is not Firefox. ${y.playbackRate}`,
            tag: "load",
            mountTime: f
          });
          const S = y.playbackRate;
          y.load(), y.playbackRate = S;
        }
      } else {
        const S = () => {
          R('"waiting" event was fired');
        };
        y.addEventListener("waiting", S), w.push(() => {
          y.removeEventListener("waiting", S);
        });
      }
    };
    return k(), () => {
      x("element was unmounted or prop changed");
    };
  }, [
    p,
    h,
    n,
    s,
    a,
    d,
    i,
    f
  ]), m;
}, Ty = ({
  mediaRef: n,
  mediaType: i,
  lastSeek: s,
  onVariableFpsVideoDetected: a
}) => {
  const d = c.useRef(null);
  return c.useEffect(() => {
    const { current: f } = n;
    if (f)
      d.current = {
        time: f.currentTime,
        lastUpdate: performance.now()
      };
    else {
      d.current = null;
      return;
    }
    if (i !== "video") {
      d.current = null;
      return;
    }
    const h = f;
    if (!h.requestVideoFrameCallback)
      return;
    let p = () => {
    };
    const m = () => {
      if (!h)
        return;
      const g = h.requestVideoFrameCallback((w, y) => {
        if (d.current !== null) {
          const x = Math.abs(d.current.time - y.mediaTime), R = Math.abs(s.current === null ? 1 / 0 : y.mediaTime - s.current);
          x > 0.5 && R > 0.5 && y.mediaTime > d.current.time && a();
        }
        d.current = {
          time: y.mediaTime,
          lastUpdate: performance.now()
        }, m();
      });
      p = () => {
        h.cancelVideoFrameCallback(g), p = () => {
        };
      };
    };
    return m(), () => {
      p();
    };
  }, [s, n, i, a]), d;
};
function by(n, i, s, a) {
  const { extrapolateLeft: d, extrapolateRight: f, easing: h } = a;
  let p = n;
  const [m, g] = i, [w, y] = s;
  if (p < m) {
    if (d === "identity")
      return p;
    if (d === "clamp")
      p = m;
    else if (d === "wrap") {
      const x = g - m;
      p = ((p - m) % x + x) % x + m;
    }
  }
  if (p > g) {
    if (f === "identity")
      return p;
    if (f === "clamp")
      p = g;
    else if (f === "wrap") {
      const x = g - m;
      p = ((p - m) % x + x) % x + m;
    }
  }
  return w === y ? w : (p = (p - m) / (g - m), p = h(p), p = p * (y - w) + w, p);
}
function Iy(n, i) {
  let s;
  for (s = 1; s < i.length - 1 && !(i[s] >= n); ++s)
    ;
  return s - 1;
}
function Ny(n) {
  for (let i = 1; i < n.length; ++i)
    if (!(n[i] > n[i - 1]))
      throw new Error(`inputRange must be strictly monotonically increasing but got [${n.join(",")}]`);
}
function jf(n, i) {
  if (i.length < 2)
    throw new Error(n + " must have at least 2 elements");
  for (const s of i) {
    if (typeof s != "number")
      throw new Error(`${n} must contain only numbers`);
    if (!Number.isFinite(s))
      throw new Error(`${n} must contain only finite numbers, but got [${i.join(",")}]`);
  }
}
function _y(n, i) {
  if (n === void 0 || typeof n == "function")
    return;
  const s = i - 1;
  if (n.length !== s)
    throw new Error(`When easing is an array, it must have one entry per segment between keyframes (length inputRange.length - 1 = ${s}), but got length ${n.length}`);
  for (let a = 0; a < n.length; a++)
    if (typeof n[a] != "function")
      throw new Error(`easing[${a}] must be a function`);
}
function op(n, i, s, a) {
  if (typeof n > "u")
    throw new Error("input can not be undefined");
  if (typeof i > "u")
    throw new Error("inputRange can not be undefined");
  if (typeof s > "u")
    throw new Error("outputRange can not be undefined");
  if (i.length !== s.length)
    throw new Error("inputRange (" + i.length + ") and outputRange (" + s.length + ") must have the same length");
  jf("inputRange", i), jf("outputRange", s), Ny(i), _y(a == null ? void 0 : a.easing, i.length);
  const d = a == null ? void 0 : a.easing, f = (w) => w, h = (w) => d === void 0 ? f : typeof d == "function" ? d : d[w];
  let p = "extend";
  (a == null ? void 0 : a.extrapolateLeft) !== void 0 && (p = a.extrapolateLeft);
  let m = "extend";
  if ((a == null ? void 0 : a.extrapolateRight) !== void 0 && (m = a.extrapolateRight), typeof n != "number")
    throw new TypeError("Cannot interpolate an input which is not a number");
  const g = Iy(n, i);
  return by(n, [i[g], i[g + 1]], [s[g], s[g + 1]], {
    easing: h(g),
    extrapolateLeft: p,
    extrapolateRight: m
  });
}
var ip = ({
  frame: n,
  playbackRate: i,
  startFrom: s
}) => op(n, [-1, s, s + 1], [-1, s, s + i]), sp = ({
  fps: n,
  frame: i,
  playbackRate: s,
  startFrom: a
}) => {
  const d = ip({
    frame: i,
    playbackRate: s,
    startFrom: a
  }), f = 1e3 / n;
  return d * f / 1e3;
}, Vf = {}, Fy = (n, i) => {
  if (n === null || n.seekable.length === 0 || n.seekable.length > 1 || Vf[n.src])
    return;
  const s = { start: n.seekable.start(0), end: n.seekable.end(0) };
  if (s.start === 0 && s.end === 0) {
    const a = [
      `The media ${n.src} cannot be seeked. This could be one of few reasons:`,
      "1) The media resource was replaced while the video is playing but it was not loaded yet.",
      "2) The media does not support seeking.",
      "3) The media was loaded with security headers prventing it from being included.",
      "Please see https://remotion.dev/docs/non-seekable-media for assistance."
    ].join(`
`);
    if (i === "console-error")
      console.error(a);
    else if (i === "console-warning")
      console.warn(`The media ${n.src} does not support seeking. The video will render fine, but may not play correctly in the Remotion Studio and in the <Player>. See https://remotion.dev/docs/non-seekable-media for an explanation.`);
    else
      throw new Error(a);
    Vf[n.src] = !0;
  }
}, up = ({
  mediaRef: n,
  src: i,
  mediaType: s,
  playbackRate: a,
  preservePitch: d = !0,
  onlyWarnForMediaSeekingError: f,
  acceptableTimeshift: h,
  pauseWhenBuffering: p,
  isPremounting: m,
  isPostmounting: g,
  onAutoPlayError: w
}) => {
  const { playbackRate: y } = ll(), x = vn(), R = Wn(), [k] = xm(), S = c.useContext(io), { fps: I } = Ot(), L = fr(), D = c.useRef(null), M = c.useRef(null), P = rn(), _ = ei();
  if (!S)
    throw new Error("useMediaPlayback must be used inside a <BufferingContext>");
  const $ = c.useRef({}), A = c.useCallback(() => {
    i && ($.current[i] || (Ze.verbose({ logLevel: P, tag: null }, `Detected ${i} as a variable FPS video. Disabling buffering while seeking.`), $.current[i] = !0));
  }, [P, i]), U = Ty({
    mediaRef: n,
    mediaType: s,
    lastSeek: M,
    onVariableFpsVideoDetected: A
  }), H = Py(n), K = sp({
    frame: x,
    playbackRate: a,
    startFrom: -L,
    fps: I
  }), Q = Ry({
    element: n,
    shouldBuffer: p,
    isPremounting: m,
    isPostmounting: g,
    logLevel: P,
    mountTime: _,
    src: i ?? null
  }), { bufferUntilFirstFrame: q, isBuffering: ee } = ky({
    mediaRef: n,
    mediaType: s,
    onVariableFpsVideoDetected: A,
    pauseWhenBuffering: p,
    logLevel: P,
    mountTime: _
  }), re = a * y, ie = (() => {
    var T;
    return (T = n.current) != null && T.duration ? Math.min(n.current.duration, h ?? 0.65) : h ?? 0.65;
  })(), ue = rp(S);
  c.useEffect(() => {
    var B, T, O, G, oe;
    if ((B = n.current) != null && B.paused)
      return;
    if (!k) {
      ut({
        logLevel: P,
        tag: "pause",
        message: `Pausing ${(T = n.current) == null ? void 0 : T.src} because ${m ? "media is premounting" : g ? "media is postmounting" : "Player is not playing"}`,
        mountTime: _
      }), (O = n.current) == null || O.pause();
      return;
    }
    const F = Q || ee();
    S.buffering.current && !F && (ut({
      logLevel: P,
      tag: "pause",
      message: `Pausing ${(G = n.current) == null ? void 0 : G.src} because player is buffering but media tag is not`,
      mountTime: _
    }), (oe = n.current) == null || oe.pause());
  }, [
    ee,
    Q,
    S,
    ue,
    m,
    P,
    n,
    s,
    _,
    k,
    g
  ]);
  const W = Qe();
  c.useLayoutEffect(() => {
    const F = Math.max(0, re);
    n.current && n.current.playbackRate !== F && (n.current.playbackRate = F), n.current && n.current.preservesPitch !== d && (n.current.preservesPitch = d);
  }, [n, re, d]), c.useEffect(() => {
    var at, Ce;
    const F = s === "audio" ? "<Html5Audio>" : "<Html5Video>";
    if (!n.current)
      throw new Error(`No ${s} ref found`);
    if (!i)
      throw new Error(`No 'src' attribute was passed to the ${F} element.`);
    const { duration: J } = n.current, B = !Number.isNaN(J) && Number.isFinite(J) ? Math.min(J, K) : K, T = H.current.time, O = ((at = U.current) == null ? void 0 : at.time) ?? null, G = $.current[i], oe = Math.abs(B - T), ne = O ? Math.abs(B - O) : null, de = (Ce = U.current) != null && Ce.lastUpdate && U.current.time > H.current.lastUpdate ? ne : oe, he = ne && !G ? de : oe;
    if (he > ie && D.current !== B) {
      M.current = ws({
        mediaRef: n.current,
        time: B,
        logLevel: P,
        why: `because time shift is too big. shouldBeTime = ${B}, isTime = ${T}, requestVideoCallbackTime = ${O}, timeShift = ${he}${G ? ", isVariableFpsVideo = true" : ""}, isPremounting = ${m}, isPostmounting = ${g}, pauseWhenBuffering = ${p}`,
        mountTime: _
      }), D.current = M.current, k && (re > 0 && q(B), n.current.paused && ks({
        mediaRef: n,
        mediaType: s,
        onAutoPlayError: w,
        logLevel: P,
        mountTime: _,
        reason: "player is playing but media tag is paused, and just seeked",
        isPlayer: W.isPlayer
      })), f || Fy(n.current, f ? "console-warning" : "console-error");
      return;
    }
    const ve = k ? 0.15 : 0.01, Se = Math.abs(n.current.currentTime - B) > ve, Re = Q || ee(), Ye = S.buffering.current && !Re;
    if (!k || Ye) {
      Se && (M.current = ws({
        mediaRef: n.current,
        time: B,
        logLevel: P,
        why: `not playing or something else is buffering. time offset is over seek threshold (${ve})`,
        mountTime: _
      }));
      return;
    }
    if (!k || S.buffering.current)
      return;
    const ze = n.current.paused && !n.current.ended;
    if (ze || R === 0) {
      const fe = ze ? "media tag is paused" : "absolute frame is 0";
      Se && (M.current = ws({
        mediaRef: n.current,
        time: B,
        logLevel: P,
        why: `is over timeshift threshold (threshold = ${ve}) and ${fe}`,
        mountTime: _
      })), ks({
        mediaRef: n,
        mediaType: s,
        onAutoPlayError: w,
        logLevel: P,
        mountTime: _,
        reason: `player is playing and ${fe}`,
        isPlayer: W.isPlayer
      }), !G && re > 0 && q(B);
    }
  }, [
    R,
    ie,
    q,
    S.buffering,
    U,
    P,
    K,
    ee,
    Q,
    n,
    s,
    f,
    re,
    k,
    i,
    w,
    m,
    g,
    p,
    _,
    H,
    W.isPlayer
  ]);
}, ap = ({
  mediaRef: n,
  id: i,
  mediaType: s,
  onAutoPlayError: a,
  isPremounting: d,
  isPostmounting: f
}) => {
  const { audioAndVideoTags: h, imperativePlaying: p } = Hn(), m = rn(), g = ei(), w = Qe();
  c.useEffect(() => {
    const y = {
      id: i,
      play: (x) => {
        if (p.current && !(d || f))
          return ks({
            mediaRef: n,
            mediaType: s,
            onAutoPlayError: a,
            logLevel: m,
            mountTime: g,
            reason: x,
            isPlayer: w.isPlayer
          });
      }
    };
    return h.current.push(y), () => {
      h.current = h.current.filter((x) => x.id !== i);
    };
  }, [
    h,
    i,
    n,
    s,
    a,
    p,
    d,
    f,
    m,
    g,
    w.isPlayer
  ]);
}, gl = c.createContext({
  mediaMuted: !1,
  mediaVolume: 1
}), yl = c.createContext({
  setMediaMuted: () => {
    throw new Error("default");
  },
  setMediaVolume: () => {
    throw new Error("default");
  }
}), wl = () => {
  const { mediaVolume: n } = c.useContext(gl), { setMediaVolume: i } = c.useContext(yl);
  return c.useMemo(() => [n, i], [n, i]);
}, Sl = () => {
  const { mediaMuted: n } = c.useContext(gl), { setMediaMuted: i } = c.useContext(yl);
  return c.useMemo(() => [n, i], [n, i]);
}, so = (n) => {
  if (n >= 100)
    throw new Error(`Volume was set to ${n}, but regular volume is 1, not 100. Did you forget to divide by 100? Set a volume of less than 100 to dismiss this error.`);
}, My = (n, i) => {
  const [s] = c.useState(n.shouldPreMountAudioTags);
  if (n.shouldPreMountAudioTags !== s)
    throw new Error("Cannot change the behavior for pre-mounting audio tags dynamically.");
  const a = rn(), {
    volume: d,
    muted: f,
    playbackRate: h,
    preservePitch: p,
    shouldPreMountAudioTags: m,
    src: g,
    onDuration: w,
    acceptableTimeShiftInSeconds: y,
    _remotionInternalNeedsDurationCalculation: x,
    _remotionInternalNativeLoopPassed: R,
    _remotionInternalStack: k,
    allowAmplificationDuringRender: S,
    name: I,
    pauseWhenBuffering: L,
    showInTimeline: D,
    loopVolumeCurveBehavior: M,
    stack: P,
    crossOrigin: _,
    delayRenderRetries: $,
    delayRenderTimeoutInMilliseconds: A,
    toneFrequency: U,
    useWebAudioApi: H,
    onError: K,
    onNativeError: Q,
    audioStreamIndex: q,
    ...ee
  } = n, [re] = wl(), [ie] = Sl(), ue = oo(M ?? "repeat");
  if (!g)
    throw new TypeError("No 'src' was passed to <Html5Audio>.");
  const W = yr(g), F = c.useContext(Ke), [J] = c.useState(() => String(Math.random())), B = wr({
    frame: ue,
    volume: d,
    mediaVolume: re
  });
  so(B);
  const T = pl({
    crossOrigin: _,
    requestsVideoFrame: !1,
    isClientSideRendering: !1
  }), O = c.useMemo(() => ({
    muted: f || ie || B <= 0,
    src: W,
    loop: R,
    crossOrigin: T,
    ...ee
  }), [
    R,
    ie,
    f,
    ee,
    W,
    B,
    T
  ]), G = c.useMemo(() => `audio-${hr(g ?? "")}-${F == null ? void 0 : F.relativeFrom}-${F == null ? void 0 : F.cumulatedFrom}-${F == null ? void 0 : F.durationInFrames}-muted:${n.muted}-loop:${n.loop}`, [
    g,
    F == null ? void 0 : F.relativeFrom,
    F == null ? void 0 : F.cumulatedFrom,
    F == null ? void 0 : F.durationInFrames,
    n.muted,
    n.loop
  ]), {
    el: oe,
    mediaElementSourceNode: ne,
    cleanupOnMediaTagUnmount: de
  } = my({
    aud: O,
    audioId: G,
    premounting: !!(F != null && F.premounting),
    postmounting: !!(F != null && F.postmounting)
  }), he = c.useCallback(() => k ?? null, [k]);
  vl({
    volume: d,
    mediaVolume: re,
    src: g,
    mediaType: "audio",
    playbackRate: h ?? 1,
    displayName: I ?? null,
    id: J,
    getStack: he,
    showInTimeline: D,
    premountDisplay: (F == null ? void 0 : F.premountDisplay) ?? null,
    postmountDisplay: (F == null ? void 0 : F.postmountDisplay) ?? null,
    loopDisplay: void 0,
    documentationLink: I === void 0 ? "https://www.remotion.dev/docs/html5-audio" : null
  }), up({
    mediaRef: oe,
    src: g,
    mediaType: "audio",
    playbackRate: h ?? 1,
    preservePitch: p,
    onlyWarnForMediaSeekingError: !1,
    acceptableTimeshift: y ?? null,
    isPremounting: !!(F != null && F.premounting),
    isPostmounting: !!(F != null && F.postmounting),
    pauseWhenBuffering: L,
    onAutoPlayError: null
  }), ap({
    id: J,
    isPostmounting: !!(F != null && F.postmounting),
    isPremounting: !!(F != null && F.premounting),
    mediaRef: oe,
    mediaType: "audio",
    onAutoPlayError: null
  }), qm({
    logLevel: a,
    mediaRef: oe,
    source: ne,
    volume: B,
    shouldUseWebAudioApi: H ?? !1
  }), (ge.useInsertionEffect ?? ge.useLayoutEffect)(() => () => {
    requestAnimationFrame(() => {
      de();
    });
  }, [de]), c.useImperativeHandle(i, () => oe.current, [oe]);
  const Se = c.useRef(w);
  return Se.current = w, c.useEffect(() => {
    var ze;
    const { current: Re } = oe;
    if (!Re)
      return;
    if (Re.duration) {
      (ze = Se.current) == null || ze.call(Se, Re.src, Re.duration);
      return;
    }
    const Ye = () => {
      var $e;
      ($e = Se.current) == null || $e.call(Se, Re.src, Re.duration);
    };
    return Re.addEventListener("loadedmetadata", Ye), () => {
      Re.removeEventListener("loadedmetadata", Ye);
    };
  }, [oe, g]), s ? null : /* @__PURE__ */ E.jsx("audio", {
    ref: oe,
    preload: "metadata",
    crossOrigin: T,
    ...O
  });
}, lp = c.forwardRef(My), Ly = (n, i) => {
  const s = c.useRef(null), {
    volume: a,
    playbackRate: d,
    allowAmplificationDuringRender: f,
    onDuration: h,
    toneFrequency: p,
    _remotionInternalNeedsDurationCalculation: m,
    _remotionInternalNativeLoopPassed: g,
    acceptableTimeShiftInSeconds: w,
    name: y,
    onNativeError: x,
    delayRenderRetries: R,
    delayRenderTimeoutInMilliseconds: k,
    loopVolumeCurveBehavior: S,
    pauseWhenBuffering: I,
    audioStreamIndex: L,
    preservePitch: D,
    ...M
  } = n, P = Wn(), _ = oo(S ?? "repeat"), $ = vn(), A = c.useContext(Ke), { registerRenderAsset: U, unregisterRenderAsset: H } = c.useContext(gr), { delayRender: K, continueRender: Q } = Jt(), q = c.useMemo(() => `audio-${hr(n.src ?? "")}-${A == null ? void 0 : A.relativeFrom}-${A == null ? void 0 : A.cumulatedFrom}-${A == null ? void 0 : A.durationInFrames}`, [
    n.src,
    A == null ? void 0 : A.relativeFrom,
    A == null ? void 0 : A.cumulatedFrom,
    A == null ? void 0 : A.durationInFrames
  ]), ee = wr({
    volume: a,
    frame: _,
    mediaVolume: 1
  });
  so(ee), c.useImperativeHandle(i, () => s.current, []), c.useEffect(() => {
    if (!n.src)
      throw new Error("No src passed");
    if (window.remotion_audioEnabled && !n.muted && !(ee <= 0))
      return U({
        type: "audio",
        src: nn(n.src),
        id: q,
        frame: P,
        volume: ee,
        mediaFrame: $,
        playbackRate: n.playbackRate ?? 1,
        toneFrequency: p ?? 1,
        audioStartFrame: Math.max(0, -((A == null ? void 0 : A.cumulatedNegativeFrom) ?? 0)),
        audioStreamIndex: L ?? 0
      }), () => H(q);
  }, [
    n.muted,
    n.src,
    U,
    P,
    q,
    H,
    ee,
    _,
    $,
    d,
    n.playbackRate,
    p,
    A == null ? void 0 : A.cumulatedNegativeFrom,
    L
  ]);
  const { src: re } = n, ie = i || m;
  return c.useLayoutEffect(() => {
    var J, B;
    if (((B = (J = window.process) == null ? void 0 : J.env) == null ? void 0 : B.NODE_ENV) === "test" || !ie)
      return;
    const ue = K("Loading <Html5Audio> duration with src=" + re, {
      retries: R ?? void 0,
      timeoutInMilliseconds: k ?? void 0
    }), { current: W } = s, F = () => {
      W != null && W.duration && h(W.src, W.duration), Q(ue);
    };
    return W != null && W.duration ? (h(W.src, W.duration), Q(ue)) : W == null || W.addEventListener("loadedmetadata", F, { once: !0 }), () => {
      W == null || W.removeEventListener("loadedmetadata", F), Q(ue);
    };
  }, [
    re,
    h,
    ie,
    R,
    k,
    Q,
    K
  ]), ie ? /* @__PURE__ */ E.jsx("audio", {
    ref: s,
    ...M,
    onError: x
  }) : null;
}, $y = c.forwardRef(Ly), jy = (n, i) => {
  const s = c.useContext(Os), {
    startFrom: a,
    endAt: d,
    trimBefore: f,
    trimAfter: h,
    name: p,
    stack: m,
    pauseWhenBuffering: g,
    showInTimeline: w,
    onError: y,
    ...x
  } = n, { loop: R, ...k } = n, { fps: S } = Ot(), I = Qe();
  if (I.isClientSideRendering)
    throw new Error("<Html5Audio> is not supported in @remotion/web-renderer. Use <Audio> from @remotion/media instead. See https://remotion.dev/docs/client-side-rendering/limitations");
  const { durations: L, setDurations: D } = c.useContext(ml);
  if (typeof n.src != "string")
    throw new TypeError(`The \`<Html5Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(n.src)} instead.`);
  const M = yr(n.src), P = c.useCallback((H) => {
    console.log(H.currentTarget.error);
    const K = `Could not play audio with src ${M}: ${H.currentTarget.error}. See https://remotion.dev/docs/media-playback-error for help.`;
    if (R) {
      if (y) {
        y(new Error(K));
        return;
      }
      Go(new Error(K));
    } else
      y == null || y(new Error(K)), console.warn(K);
  }, [R, y, M]), _ = c.useCallback((H, K) => {
    D({ type: "got-duration", durationInSeconds: K, src: H });
  }, [D]), $ = L[nn(M)] ?? L[nn(n.src)];
  As({ startFrom: a, endAt: d, trimBefore: f, trimAfter: h });
  const { trimBeforeValue: A, trimAfterValue: U } = Ds({
    startFrom: a,
    endAt: d,
    trimBefore: f,
    trimAfter: h
  });
  if (R && $ !== void 0) {
    if (!Number.isFinite($))
      return /* @__PURE__ */ E.jsx(Ss, {
        ...k,
        ref: i,
        _remotionInternalNativeLoopPassed: !0
      });
    const H = $ * S;
    return /* @__PURE__ */ E.jsx($s, {
      layout: "none",
      durationInFrames: Ls({
        trimAfter: U,
        mediaDurationInFrames: H,
        playbackRate: n.playbackRate ?? 1,
        trimBefore: A
      }),
      children: /* @__PURE__ */ E.jsx(Ss, {
        ...k,
        ref: i,
        _remotionInternalNativeLoopPassed: !0
      })
    });
  }
  return typeof A < "u" || typeof U < "u" ? /* @__PURE__ */ E.jsx(Nt, {
    layout: "none",
    from: 0 - (A ?? 0),
    showInTimeline: !1,
    durationInFrames: U,
    name: p,
    children: /* @__PURE__ */ E.jsx(Ss, {
      _remotionInternalNeedsDurationCalculation: !!R,
      pauseWhenBuffering: g ?? !1,
      ...x,
      ref: i
    })
  }) : (Vs({
    playbackRate: n.playbackRate,
    preservePitch: n.preservePitch,
    volume: n.volume
  }, "Html5Audio"), I.isRendering ? /* @__PURE__ */ E.jsx($y, {
    onDuration: _,
    ...n,
    ref: i,
    onNativeError: P,
    _remotionInternalNeedsDurationCalculation: !!R
  }) : /* @__PURE__ */ E.jsx(lp, {
    _remotionInternalNativeLoopPassed: n._remotionInternalNativeLoopPassed ?? !1,
    _remotionInternalStack: m ?? null,
    shouldPreMountAudioTags: s !== null && s.numberOfAudioTags > 0,
    ...n,
    ref: i,
    onNativeError: P,
    onDuration: _,
    pauseWhenBuffering: g ?? !1,
    _remotionInternalNeedsDurationCalculation: !!R,
    showInTimeline: w ?? !0
  }));
}, Ss = c.forwardRef(jy);
_t(Ss);
function Vy(n) {
  return 1e3 * 2 ** (n - 1);
}
function Un(n) {
  return n.startsWith("data:") && n.length > 100 ? n.slice(0, 60) + "...[" + n.length + " chars total]" : n;
}
var Ay = ({
  onError: n,
  maxRetries: i = 2,
  src: s,
  pauseWhenLoading: a,
  delayRenderRetries: d,
  delayRenderTimeoutInMilliseconds: f,
  onImageFrame: h,
  crossOrigin: p,
  decoding: m,
  ref: g,
  ...w
}) => {
  const y = c.useRef(null), x = c.useRef({}), { delayPlayback: R } = Bs(), k = c.useContext(Ke);
  c.useImperativeHandle(g, () => y.current, []);
  const S = yr(s), I = c.useCallback((U) => {
    if (!y.current)
      return;
    const H = y.current.src;
    setTimeout(() => {
      var Q;
      if (!y.current)
        return;
      const K = (Q = y.current) == null ? void 0 : Q.src;
      K === H && (y.current.removeAttribute("src"), y.current.setAttribute("src", K));
    }, U);
  }, []), { delayRender: L, continueRender: D, cancelRender: M } = Jt(), P = c.useCallback((U) => {
    var H, K, Q, q, ee, re, ie;
    if (x.current) {
      if (x.current[(H = y.current) == null ? void 0 : H.src] = (x.current[(K = y.current) == null ? void 0 : K.src] ?? 0) + 1, n && (x.current[(Q = y.current) == null ? void 0 : Q.src] ?? 0) > i) {
        n(U);
        return;
      }
      if ((x.current[(q = y.current) == null ? void 0 : q.src] ?? 0) <= i) {
        const ue = Vy(x.current[(ee = y.current) == null ? void 0 : ee.src] ?? 0);
        console.warn(`Could not load image with source ${Un((re = y.current) == null ? void 0 : re.src)}, retrying again in ${ue}ms`), I(ue);
        return;
      }
      try {
        M("Error loading image with src: " + Un((ie = y.current) == null ? void 0 : ie.src));
      } catch {
      }
    }
  }, [M, i, n, I]);
  if (typeof window < "u") {
    const U = !!(k != null && k.premounting), H = !!(k != null && k.postmounting);
    c.useLayoutEffect(() => {
      var ie, ue;
      if (((ue = (ie = window.process) == null ? void 0 : ie.env) == null ? void 0 : ue.NODE_ENV) === "test") {
        y.current && (y.current.src = S);
        return;
      }
      const { current: K } = y;
      if (!K)
        return;
      const Q = L("Loading <Img> with src=" + Un(S), {
        retries: d ?? void 0,
        timeoutInMilliseconds: f ?? void 0
      }), q = a && !U && !H ? R().unblock : () => {
      };
      let ee = !1;
      const re = () => {
        var W, F, J;
        if (ee) {
          D(Q);
          return;
        }
        (x.current[(W = y.current) == null ? void 0 : W.src] ?? 0) > 0 && (delete x.current[(F = y.current) == null ? void 0 : F.src], console.info(`Retry successful - ${Un((J = y.current) == null ? void 0 : J.src)} is now loaded`)), K && (h == null || h(K)), q(), D(Q);
      };
      if (!y.current) {
        re();
        return;
      }
      return K.src = S, K.decode().then(re).catch((W) => {
        console.warn(W), K.complete && K.naturalWidth > 0 && K.naturalHeight > 0 ? re() : K.addEventListener("load", re);
      }), () => {
        ee = !0, K.removeEventListener("load", re), q(), D(Q);
      };
    }, [
      S,
      R,
      d,
      f,
      a,
      U,
      H,
      h,
      D,
      L
    ]);
  }
  const { isClientSideRendering: _, isRendering: $ } = Qe(), A = pl({
    crossOrigin: p,
    requestsVideoFrame: !1,
    isClientSideRendering: _
  });
  return /* @__PURE__ */ E.jsx("img", {
    ...w,
    ref: y,
    crossOrigin: A,
    onError: P,
    decoding: $ ? "sync" : m
  });
}, Dy = ({
  hidden: n,
  name: i,
  stack: s,
  showInTimeline: a,
  src: d,
  from: f,
  durationInFrames: h,
  _experimentalControls: p,
  ...m
}) => {
  if (!d)
    throw new Error('No "src" prop was passed to <Img>.');
  return /* @__PURE__ */ E.jsx(Nt, {
    layout: "none",
    from: f ?? 0,
    durationInFrames: h ?? 1 / 0,
    _remotionInternalStack: s,
    _remotionInternalDocumentationLink: i === void 0 ? "https://www.remotion.dev/docs/img" : void 0,
    _remotionInternalIsMedia: { type: "image", src: d },
    name: i ?? "<Img>",
    _experimentalControls: p,
    showInTimeline: a ?? !0,
    hidden: n,
    children: /* @__PURE__ */ E.jsx(Ay, {
      src: d,
      ...m
    })
  });
}, Oy = {
  ...vr,
  hidden: to
}, cp = Kn(Dy, Oy);
_t(cp);
var zy = {
  fit: {
    type: "enum",
    default: "fill",
    description: "Fit",
    variants: {
      fill: {},
      contain: {},
      cover: {}
    }
  },
  ...vr,
  hidden: to
}, By = () => {
  if (typeof DOMException < "u")
    return new DOMException("Image loading was aborted", "AbortError");
  const n = new Error("Image loading was aborted");
  return n.name = "AbortError", n;
}, Uy = ({
  src: n,
  signal: i
}) => new Promise((s, a) => {
  const d = new Image();
  let f = !1;
  function h() {
    d.onload = null, d.onerror = null;
  }
  function p(g) {
    f || (f = !0, h(), g());
  }
  function m() {
    p(() => a(By()));
  }
  if (d.onload = () => {
    var g;
    Promise.resolve((g = d.decode) == null ? void 0 : g.call(d)).catch(() => {
    }).then(() => {
      const w = d.naturalWidth || d.width, y = d.naturalHeight || d.height;
      if (w <= 0 || y <= 0) {
        p(() => a(new Error(`Could not determine dimensions for <CanvasImage> with src="${Un(n)}"`)));
        return;
      }
      p(() => s({ element: d, width: w, height: y }));
    });
  }, d.onerror = () => {
    p(() => a(new Error(`Could not load <CanvasImage> with src="${Un(n)}"`)));
  }, i.addEventListener("abort", m, { once: !0 }), i.aborted) {
    m();
    return;
  }
  d.crossOrigin = "anonymous", d.src = n;
});
function Hy(n) {
  return 1e3 * 2 ** (n - 1);
}
var dp = c.forwardRef(({
  src: n,
  width: i,
  height: s,
  fit: a = "fill",
  effects: d,
  controls: f,
  onError: h,
  className: p,
  style: m,
  id: g,
  pauseWhenLoading: w,
  maxRetries: y = 2,
  delayRenderRetries: x,
  delayRenderTimeoutInMilliseconds: R
}, k) => {
  const { delayRender: S, continueRender: I, cancelRender: L } = Jt(), { delayPlayback: D } = Bs(), [M, P] = c.useState(null), _ = yr(n), $ = oi(), A = ni({
    effects: d,
    overrideId: (f == null ? void 0 : f.overrideId) ?? null
  }), U = c.useContext(Ke), H = c.useMemo(() => typeof document > "u" ? null : document.createElement("canvas"), []), K = c.useCallback((Q) => {
    P(Q), typeof k == "function" ? k(Q) : k && (k.current = Q);
  }, [k]);
  return c.useEffect(() => {
    if (!M || !H)
      return;
    const Q = !!(U != null && U.premounting), q = !!(U != null && U.postmounting), ee = S(`Rendering <CanvasImage> with src="${Un(_)}"`, {
      retries: x ?? void 0,
      timeoutInMilliseconds: R ?? void 0
    }), re = w && !Q && !q ? D().unblock : () => {
    }, ie = new AbortController();
    let ue = !1, W = !1, F = 0, J = null;
    const B = () => {
      W || (W = !0, re(), I(ee));
    }, T = () => {
      Uy({ src: _, signal: ie.signal }).then((O) => {
        if (ue)
          return;
        const G = i ?? O.width, oe = s ?? O.height, ne = H.getContext("2d", {
          colorSpace: "srgb"
        });
        if (!ne)
          throw new Error("Could not get 2D context for <CanvasImage> source canvas");
        return H.width = G, H.height = oe, M.width = G, M.height = oe, ne.clearRect(0, 0, G, oe), ne.drawImage(O.element, ...$m(a, { width: O.width, height: O.height }, { width: G, height: oe })), ri({
          state: $.get(G, oe),
          source: H,
          effects: A,
          output: M,
          width: G,
          height: oe
        });
      }).then((O) => {
        O && !ue && B();
      }).catch((O) => {
        if (O.name === "AbortError") {
          B();
          return;
        }
        if (F++, F <= y) {
          const G = Hy(F);
          console.warn(`Could not load <CanvasImage> with src="${Un(_)}", retrying in ${G}ms`), J = setTimeout(() => {
            ue || T();
          }, G);
        } else h ? (h(O), B()) : L(O);
      });
    };
    return T(), () => {
      ue = !0, J !== null && clearTimeout(J), ie.abort(), B();
    };
  }, [
    _,
    L,
    $,
    I,
    D,
    S,
    x,
    R,
    a,
    s,
    y,
    A,
    h,
    M,
    w,
    U == null ? void 0 : U.postmounting,
    U == null ? void 0 : U.premounting,
    H,
    i
  ]), /* @__PURE__ */ E.jsx("canvas", {
    ref: K,
    width: i,
    height: s,
    className: p,
    style: m,
    id: g
  });
});
dp.displayName = "CanvasImageContent";
var Wy = c.forwardRef(({
  src: n,
  width: i,
  height: s,
  fit: a,
  effects: d = [],
  className: f,
  style: h,
  id: p,
  onError: m,
  pauseWhenLoading: g,
  maxRetries: w,
  delayRenderRetries: y,
  delayRenderTimeoutInMilliseconds: x,
  durationInFrames: R,
  from: k,
  hidden: S,
  name: I,
  showInTimeline: L,
  stack: D,
  _experimentalControls: M
}, P) => {
  if (!n)
    throw new Error('No "src" prop was passed to <CanvasImage>.');
  const _ = ti(d);
  return /* @__PURE__ */ E.jsx(Nt, {
    layout: "none",
    from: k ?? 0,
    durationInFrames: R ?? 1 / 0,
    hidden: S,
    showInTimeline: L ?? !0,
    name: I ?? "<CanvasImage>",
    _experimentalControls: M,
    _remotionInternalEffects: _,
    _remotionInternalIsMedia: { type: "image", src: n },
    _remotionInternalStack: D,
    children: /* @__PURE__ */ E.jsx(dp, {
      ref: P,
      src: n,
      width: i,
      height: s,
      fit: a,
      effects: d,
      controls: M,
      className: f,
      style: h,
      id: p,
      onError: m,
      pauseWhenLoading: g,
      maxRetries: w,
      delayRenderRetries: y,
      delayRenderTimeoutInMilliseconds: x
    })
  });
}), fp = Kn(Wy, zy);
fp.displayName = "CanvasImage";
_t(fp);
var Ky = ({
  onLoad: n,
  onError: i,
  delayRenderRetries: s,
  delayRenderTimeoutInMilliseconds: a,
  ...d
}, f) => {
  const { delayRender: h, continueRender: p } = Jt(), [m] = c.useState(() => h(`Loading <IFrame> with source ${d.src}`, {
    retries: s ?? void 0,
    timeoutInMilliseconds: a ?? void 0
  })), g = c.useCallback((y) => {
    p(m), n == null || n(y);
  }, [m, n, p]), w = c.useCallback((y) => {
    p(m), i ? i(y) : console.error("Error loading iframe:", y, "Handle the event using the onError() prop to make this message disappear.");
  }, [m, i, p]);
  return /* @__PURE__ */ E.jsx("iframe", {
    referrerPolicy: "strict-origin-when-cross-origin",
    ...d,
    ref: f,
    onError: w,
    onLoad: g
  });
};
c.forwardRef(Ky);
var mp = ge.createRef(), Qy = ({
  children: n,
  onlyRenderComposition: i,
  currentCompositionMetadata: s,
  initialCompositions: a,
  initialCanvasContent: d
}) => {
  const [f, h] = c.useState([]), [p, m] = c.useState(d), [g, w] = c.useState(a), y = c.useRef(g), x = c.useCallback((M) => {
    w((P) => {
      const _ = M(P);
      return y.current = _, _;
    });
  }, []), R = c.useCallback((M) => {
    x((P) => {
      if (P.find((_) => _.id === M.id))
        throw new Error(`Multiple composition with id ${M.id} are registered.`);
      return [...P, M];
    });
  }, [x]), k = c.useCallback((M) => {
    w((P) => P.filter((_) => _.id !== M));
  }, []), S = c.useCallback((M, P, _) => {
    h(($) => [
      ...$,
      {
        name: M,
        parent: P,
        nonce: _
      }
    ]);
  }, []), I = c.useCallback((M, P) => {
    h((_) => _.filter(($) => !($.name === M && $.parent === P)));
  }, []);
  c.useImperativeHandle(mp, () => ({
    getCompositions: () => y.current
  }), []);
  const L = c.useMemo(() => ({
    registerComposition: R,
    unregisterComposition: k,
    registerFolder: S,
    unregisterFolder: I,
    setCanvasContent: m,
    onlyRenderComposition: i
  }), [
    R,
    S,
    k,
    I,
    i
  ]), D = c.useMemo(() => ({
    compositions: g,
    folders: f,
    currentCompositionMetadata: s,
    canvasContent: p
  }), [g, f, s, p]);
  return /* @__PURE__ */ E.jsx(Zr.Provider, {
    value: D,
    children: /* @__PURE__ */ E.jsx(Rs.Provider, {
      value: L,
      children: n
    })
  });
}, pp = {};
tm(pp, {
  makeDefaultPreviewCSS: () => Gy,
  injectCSS: () => Yy,
  OBJECTFIT_CONTAIN_CLASS_NAME: () => Jo
});
var gs = {}, Yy = (n) => {
  if (typeof document > "u")
    return () => {
    };
  if (gs[n])
    return () => {
    };
  const i = document.head || document.getElementsByTagName("head")[0], s = document.createElement("style");
  return s.appendChild(document.createTextNode(n)), i.prepend(s), gs[n] = s, () => {
    const a = gs[n];
    a && (a.parentNode && a.parentNode.removeChild(a), delete gs[n]);
  };
}, Jo = "__remotion_objectfitcontain", Gy = (n, i) => n ? `
    ${n} * {
      box-sizing: border-box;
    }
    ${n} *:-webkit-full-screen {
      width: 100%;
      height: 100%;
    }
    ${n} .${Jo} {
      object-fit: contain;
    }
  ` : `
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
	    background-color: ${i};
    }
    .${Jo} {
      object-fit: contain;
    }
    `, Jy = {
  type: "boolean",
  default: !1,
  description: "Disabled"
}, Xy = (n) => {
  const { calculateKey: i, validateParams: s } = n, a = {
    ...n,
    documentationLink: n.documentationLink ?? null,
    calculateKey: (f) => {
      const h = f.disabled ?? !1;
      return `${i(f)}-disabled-${h}`;
    },
    schema: {
      disabled: Jy,
      ...n.schema
    }
  };
  return (f = {}) => (s(f), {
    definition: a,
    params: f,
    effectKey: a.calculateKey(f),
    memoized: !1
  });
}, hp = "__remotion-studio-container", Zy = () => document.getElementById(hp), qy = ge.createContext(null), ew = null, Ma = [], tw = () => ew, nw = (n) => (Ma.push(n), () => {
  Ma = Ma.filter((i) => i !== n);
}), El = c.createContext(null), rw = () => {
  const n = c.useContext(El);
  return !n || n.videoEnabled === null ? window.remotion_videoEnabled : n.videoEnabled;
}, ow = () => {
  const n = c.useContext(El);
  return !n || n.audioEnabled === null ? window.remotion_audioEnabled : n.audioEnabled;
}, iw = ({
  children: n,
  videoEnabled: i,
  audioEnabled: s
}) => {
  const a = c.useMemo(() => ({ videoEnabled: i, audioEnabled: s }), [i, s]);
  return /* @__PURE__ */ E.jsx(El.Provider, {
    value: a,
    children: n
  });
}, sw = ({
  children: n,
  numberOfAudioTags: i,
  logLevel: s,
  audioLatencyHint: a,
  videoEnabled: d,
  audioEnabled: f,
  frameState: h
}) => {
  const p = c.useMemo(() => {
    let g = 0;
    return {
      getNonce: () => g++
    };
  }, []), m = c.useMemo(() => ({ logLevel: s, mountTime: Date.now() }), [s]);
  return /* @__PURE__ */ E.jsx(pr.Provider, {
    value: m,
    children: /* @__PURE__ */ E.jsx(Xo.Provider, {
      value: p,
      children: /* @__PURE__ */ E.jsx(hg, {
        frameState: h,
        children: /* @__PURE__ */ E.jsx(iw, {
          videoEnabled: d,
          audioEnabled: f,
          children: /* @__PURE__ */ E.jsx(sm, {
            children: /* @__PURE__ */ E.jsx(Qm, {
              children: /* @__PURE__ */ E.jsx(yg, {
                children: /* @__PURE__ */ E.jsx(Gm, {
                  children: /* @__PURE__ */ E.jsx(np, {
                    children: /* @__PURE__ */ E.jsx(Jm, {
                      audioLatencyHint: a,
                      audioEnabled: f,
                      children: /* @__PURE__ */ E.jsx(Xm, {
                        numberOfAudioTags: i,
                        children: n
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  });
}, Af = [
  "h264",
  "h265",
  "vp8",
  "vp9",
  "av1",
  "mp3",
  "aac",
  "wav",
  "prores",
  "h264-mkv",
  "h264-ts",
  "gif"
];
function uw(n, i, s) {
  if (!(typeof n > "u")) {
    if (typeof n != "string")
      throw new TypeError(`The "${s}" prop ${i} must be a string, but you passed a value of type ${typeof n}.`);
    if (!Af.includes(n))
      throw new Error(`The "${s}" prop ${i} must be one of ${Af.join(", ")}, but you passed ${n}.`);
  }
}
var Df = ({
  calculated: n,
  compositionId: i,
  compositionFps: s,
  compositionHeight: a,
  compositionWidth: d,
  compositionDurationInFrames: f
}) => {
  const h = `calculated by calculateMetadata() for the composition "${i}"`, p = `of the "<Composition />" component with the id "${i}"`, m = (n == null ? void 0 : n.width) ?? d ?? void 0;
  xs(m, "width", n != null && n.width ? h : p);
  const g = (n == null ? void 0 : n.height) ?? a ?? void 0;
  xs(g, "height", n != null && n.height ? h : p);
  const w = (n == null ? void 0 : n.fps) ?? s ?? null;
  am(w, n != null && n.fps ? h : p);
  const y = (n == null ? void 0 : n.durationInFrames) ?? f ?? null;
  Ts(y, {
    allowFloats: !1,
    component: `of the "<Composition />" component with the id "${i}"`
  });
  const x = n == null ? void 0 : n.defaultCodec;
  uw(x, h, "defaultCodec");
  const R = n == null ? void 0 : n.defaultOutName, k = n == null ? void 0 : n.defaultVideoImageFormat, S = n == null ? void 0 : n.defaultPixelFormat, I = n == null ? void 0 : n.defaultProResProfile, L = n == null ? void 0 : n.defaultSampleRate;
  return {
    width: m,
    height: g,
    fps: w,
    durationInFrames: y,
    defaultCodec: x,
    defaultOutName: R,
    defaultVideoImageFormat: k,
    defaultPixelFormat: S,
    defaultProResProfile: I,
    defaultSampleRate: L
  };
}, vp = ({
  calculateMetadata: n,
  signal: i,
  defaultProps: s,
  inputProps: a,
  compositionId: d,
  compositionDurationInFrames: f,
  compositionFps: h,
  compositionHeight: p,
  compositionWidth: m
}) => {
  const g = n ? n({
    defaultProps: s,
    props: a,
    abortSignal: i,
    compositionId: d,
    isRendering: Gt().isRendering
  }) : null;
  if (g !== null && typeof g == "object" && "then" in g)
    return g.then((y) => {
      const {
        height: x,
        width: R,
        durationInFrames: k,
        fps: S,
        defaultCodec: I,
        defaultOutName: L,
        defaultVideoImageFormat: D,
        defaultPixelFormat: M,
        defaultProResProfile: P,
        defaultSampleRate: _
      } = Df({
        calculated: y,
        compositionDurationInFrames: f,
        compositionFps: h,
        compositionHeight: p,
        compositionWidth: m,
        compositionId: d
      });
      return {
        width: R,
        height: x,
        fps: S,
        durationInFrames: k,
        id: d,
        defaultProps: cr(s),
        props: cr(y.props ?? a),
        defaultCodec: I ?? null,
        defaultOutName: L ?? null,
        defaultVideoImageFormat: D ?? null,
        defaultPixelFormat: M ?? null,
        defaultProResProfile: P ?? null,
        defaultSampleRate: _ ?? null
      };
    });
  const w = Df({
    calculated: g,
    compositionDurationInFrames: f,
    compositionFps: h,
    compositionHeight: p,
    compositionWidth: m,
    compositionId: d
  });
  return g === null ? {
    ...w,
    id: d,
    defaultProps: cr(s ?? {}),
    props: cr(a),
    defaultCodec: null,
    defaultOutName: null,
    defaultVideoImageFormat: null,
    defaultPixelFormat: null,
    defaultProResProfile: null,
    defaultSampleRate: null
  } : {
    ...w,
    id: d,
    defaultProps: cr(s ?? {}),
    props: cr(g.props ?? a),
    defaultCodec: g.defaultCodec ?? null,
    defaultOutName: g.defaultOutName ?? null,
    defaultVideoImageFormat: g.defaultVideoImageFormat ?? null,
    defaultPixelFormat: g.defaultPixelFormat ?? null,
    defaultProResProfile: g.defaultProResProfile ?? null,
    defaultSampleRate: g.defaultSampleRate ?? null
  };
}, aw = (n) => {
  try {
    return {
      type: "success",
      result: vp(n)
    };
  } catch (i) {
    return {
      type: "error",
      error: i
    };
  }
}, lw = ge.createContext(() => {
}), cw = () => {
  if (Gt().isRendering) {
    const n = window.remotion_envVariables;
    return n ? { ...JSON.parse(n), NODE_ENV: "production" } : {};
  }
  return {
    NODE_ENV: "production"
  };
}, dw = () => {
  const n = cw();
  window.process || (window.process = {}), window.process.env || (window.process.env = {}), Object.keys(n).forEach((i) => {
    window.process.env[i] = n[i];
  });
}, fw = ge.createContext(null), mw = c.createContext({
  setSize: () => {
  },
  size: { size: "auto", translation: { x: 0, y: 0 } }
}), pw = ({
  canvasSize: n,
  compositionHeight: i,
  compositionWidth: s,
  previewSize: a
}) => {
  const d = n.height / i, f = n.width / s, h = Math.min(d, f);
  return a === "auto" ? h === 0 ? 1 : h : Number(a);
}, hw = ({
  src: n,
  transparent: i,
  currentTime: s,
  toneMapped: a
}) => `http://localhost:${window.remotion_proxyPort}/proxy?src=${encodeURIComponent(nn(n))}&time=${encodeURIComponent(Math.max(0, s))}&transparent=${String(i)}&toneMapped=${String(a)}`, vw = ({
  onError: n,
  volume: i,
  playbackRate: s,
  src: a,
  muted: d,
  allowAmplificationDuringRender: f,
  transparent: h,
  toneMapped: p,
  toneFrequency: m,
  name: g,
  loopVolumeCurveBehavior: w,
  delayRenderRetries: y,
  delayRenderTimeoutInMilliseconds: x,
  onVideoFrame: R,
  crossOrigin: k,
  audioStreamIndex: S,
  preservePitch: I,
  ...L
}) => {
  const D = Wn(), M = vn(), P = oo(w), _ = _s(), $ = c.useContext(Ke), A = fr(), { registerRenderAsset: U, unregisterRenderAsset: H } = c.useContext(gr);
  if (!a)
    throw new TypeError("No `src` was passed to <OffthreadVideo>.");
  const K = c.useMemo(() => `offthreadvideo-${hr(a)}-${$ == null ? void 0 : $.cumulatedFrom}-${$ == null ? void 0 : $.relativeFrom}-${$ == null ? void 0 : $.durationInFrames}`, [
    a,
    $ == null ? void 0 : $.cumulatedFrom,
    $ == null ? void 0 : $.relativeFrom,
    $ == null ? void 0 : $.durationInFrames
  ]);
  if (!_)
    throw new Error("No video config found");
  const Q = wr({
    volume: i,
    frame: P,
    mediaVolume: 1
  });
  so(Q), c.useEffect(() => {
    if (!a)
      throw new Error("No src passed");
    if (window.remotion_audioEnabled && !d && !(Q <= 0))
      return U({
        type: "video",
        src: nn(a),
        id: K,
        frame: D,
        volume: Q,
        mediaFrame: M,
        playbackRate: s,
        toneFrequency: m,
        audioStartFrame: Math.max(0, -(($ == null ? void 0 : $.cumulatedNegativeFrom) ?? 0)),
        audioStreamIndex: S
      }), () => H(K);
  }, [
    d,
    a,
    U,
    K,
    H,
    Q,
    M,
    D,
    s,
    m,
    $ == null ? void 0 : $.cumulatedNegativeFrom,
    S
  ]);
  const q = c.useMemo(() => ip({
    frame: M,
    playbackRate: s || 1,
    startFrom: -A
  }) / _.fps, [M, A, s, _.fps]), ee = c.useMemo(() => hw({
    src: a,
    currentTime: q,
    transparent: h,
    toneMapped: p
  }), [p, q, a, h]), [re, ie] = c.useState(null), { delayRender: ue, continueRender: W } = Jt();
  c.useLayoutEffect(() => {
    if (!window.remotion_videoEnabled)
      return;
    const T = [];
    ie(null);
    const O = new AbortController(), G = ue(`Fetching ${ee} from server`, {
      retries: y ?? void 0,
      timeoutInMilliseconds: x ?? void 0
    });
    return (async () => {
      try {
        const ne = await fetch(ee, {
          signal: O.signal,
          cache: "no-store"
        });
        if (ne.status !== 200) {
          if (ne.status === 500) {
            const ve = await ne.json();
            if (ve.error) {
              const Se = ve.error.replace(/^Error: /, "");
              throw new Error(Se);
            }
          }
          throw new Error(`Server returned status ${ne.status} while fetching ${ee}`);
        }
        const de = await ne.blob(), he = URL.createObjectURL(de);
        T.push(() => URL.revokeObjectURL(he)), ie({
          src: he,
          handle: G
        });
      } catch (ne) {
        if (ne.message.includes("aborted")) {
          W(G);
          return;
        }
        if (O.signal.aborted) {
          W(G);
          return;
        }
        ne.message.includes("Failed to fetch") && (ne = new Error(`Failed to fetch ${ee}. This could be caused by Chrome rejecting the request because the disk space is low. Consider increasing the disk size of your environment.`, { cause: ne })), n ? n(ne) : Go(ne);
      }
    })(), T.push(() => {
      O.signal.aborted || O.abort();
    }), () => {
      T.forEach((ne) => ne());
    };
  }, [
    ee,
    y,
    x,
    n,
    W,
    ue
  ]);
  const F = c.useCallback(() => {
    n ? n == null || n(new Error("Failed to load image with src " + re)) : Go("Failed to load image with src " + re);
  }, [re, n]), J = c.useMemo(() => [Jo, L.className].filter(Zo).join(" "), [L.className]), B = c.useCallback((T) => {
    R && R(T);
  }, [R]);
  return !re || !window.remotion_videoEnabled ? null : (W(re.handle), /* @__PURE__ */ E.jsx(cp, {
    src: re.src,
    delayRenderRetries: y,
    delayRenderTimeoutInMilliseconds: x,
    onImageFrame: B,
    ...L,
    onError: F,
    className: J
  }));
}, gw = ({
  ref: n,
  onVideoFrame: i
}) => {
  c.useEffect(() => {
    const { current: s } = n;
    if (!s || !i)
      return;
    let a = 0;
    const d = () => {
      n.current && (i(n.current), a = n.current.requestVideoFrameCallback(d));
    };
    return d(), () => {
      s.cancelVideoFrameCallback(a);
    };
  }, [i, n]);
};
class Jr extends Error {
  constructor({ message: s, src: a }) {
    super(s);
    Ne(this, "src");
    this.name = "MediaPlaybackError", this.src = a;
  }
}
var yw = (n, i) => {
  const s = c.useContext(ro);
  if (!s)
    throw new Error("SharedAudioContext not found");
  const a = c.useRef(null), d = c.useMemo(() => s.audioContext ? hl({
    audioContext: s.audioContext,
    ref: a
  }) : null, [s.audioContext]);
  (ge.useInsertionEffect ?? ge.useLayoutEffect)(() => () => {
    requestAnimationFrame(() => {
      d == null || d.cleanup();
    });
  }, [d]);
  const {
    volume: h,
    muted: p,
    playbackRate: m,
    preservePitch: g,
    onlyWarnForMediaSeekingError: w,
    src: y,
    onDuration: x,
    acceptableTimeShift: R,
    acceptableTimeShiftInSeconds: k,
    toneFrequency: S,
    name: I,
    _remotionInternalNativeLoopPassed: L,
    _remotionInternalStack: D,
    style: M,
    pauseWhenBuffering: P,
    showInTimeline: _,
    loopVolumeCurveBehavior: $,
    onError: A,
    onAutoPlayError: U,
    onVideoFrame: H,
    crossOrigin: K,
    delayRenderRetries: Q,
    delayRenderTimeoutInMilliseconds: q,
    allowAmplificationDuringRender: ee,
    useWebAudioApi: re,
    audioStreamIndex: ie,
    ...ue
  } = n, W = oo($ ?? "repeat"), { fps: F, durationInFrames: J } = Ot(), B = c.useContext(Ke), T = rn(), O = ei(), [G] = c.useState(() => String(Math.random()));
  if (typeof R < "u")
    throw new Error("acceptableTimeShift has been removed. Use acceptableTimeShiftInSeconds instead.");
  const [oe] = wl(), [ne] = Sl(), de = wr({
    frame: W,
    volume: h,
    mediaVolume: oe
  });
  so(de);
  const he = c.useCallback(() => D ?? null, [D]);
  vl({
    volume: h,
    mediaVolume: oe,
    mediaType: "video",
    src: y,
    playbackRate: n.playbackRate ?? 1,
    displayName: I ?? null,
    id: G,
    getStack: he,
    showInTimeline: _,
    premountDisplay: (B == null ? void 0 : B.premountDisplay) ?? null,
    postmountDisplay: (B == null ? void 0 : B.postmountDisplay) ?? null,
    loopDisplay: void 0,
    documentationLink: I === void 0 ? w ? "https://www.remotion.dev/docs/offthreadvideo" : "https://www.remotion.dev/docs/html5-video" : null
  }), up({
    mediaRef: a,
    src: y,
    mediaType: "video",
    playbackRate: n.playbackRate ?? 1,
    preservePitch: g,
    onlyWarnForMediaSeekingError: w,
    acceptableTimeshift: k ?? null,
    isPremounting: !!(B != null && B.premounting),
    isPostmounting: !!(B != null && B.postmounting),
    pauseWhenBuffering: P,
    onAutoPlayError: U ?? null
  }), ap({
    id: G,
    isPostmounting: !!(B != null && B.postmounting),
    isPremounting: !!(B != null && B.premounting),
    mediaRef: a,
    mediaType: "video",
    onAutoPlayError: U ?? null
  }), qm({
    logLevel: T,
    mediaRef: a,
    volume: de,
    source: d,
    shouldUseWebAudioApi: re ?? !1
  });
  const ve = B ? B.relativeFrom : 0, Se = B ? Math.min(B.durationInFrames, J) : J, Re = yr(y), Ye = yy({
    actualSrc: Re,
    actualFrom: ve,
    duration: Se,
    fps: F
  });
  c.useImperativeHandle(i, () => a.current, []), c.useState(() => ut({
    logLevel: T,
    message: `Mounting video with source = ${Ye}, v=${Yo}, user agent=${typeof navigator > "u" ? "server" : navigator.userAgent}`,
    tag: "video",
    mountTime: O
  })), c.useEffect(() => {
    const { current: Ce } = a;
    if (!Ce)
      return;
    const fe = () => {
      var dt;
      if (Ce.error) {
        if (console.error("Error occurred in video", Ce == null ? void 0 : Ce.error), A) {
          const nt = new Jr({
            message: `Code ${Ce.error.code}: ${Ce.error.message}`,
            src: y
          });
          A(nt);
          return;
        }
        throw new Jr({
          message: `The browser threw an error while playing the video ${y}: Code ${Ce.error.code} - ${(dt = Ce == null ? void 0 : Ce.error) == null ? void 0 : dt.message}. See https://remotion.dev/docs/media-playback-error for help. Pass an onError() prop to handle the error.`,
          src: y
        });
      } else {
        if (A) {
          const nt = new Jr({
            message: `The browser threw an error while playing the video ${y}`,
            src: y
          });
          A(nt);
          return;
        }
        throw new Jr({
          message: "The browser threw an error while playing the video",
          src: y
        });
      }
    };
    return Ce.addEventListener("error", fe, { once: !0 }), () => {
      Ce.removeEventListener("error", fe);
    };
  }, [A, y]);
  const ze = c.useRef(x);
  ze.current = x, gw({ ref: a, onVideoFrame: H }), c.useEffect(() => {
    var dt;
    const { current: Ce } = a;
    if (!Ce)
      return;
    if (Ce.duration) {
      (dt = ze.current) == null || dt.call(ze, y, Ce.duration);
      return;
    }
    const fe = () => {
      var nt;
      (nt = ze.current) == null || nt.call(ze, y, Ce.duration);
    };
    return Ce.addEventListener("loadedmetadata", fe), () => {
      Ce.removeEventListener("loadedmetadata", fe);
    };
  }, [y]), c.useEffect(() => {
    const { current: Ce } = a;
    Ce && (zs() ? Ce.preload = "metadata" : Ce.preload = "auto");
  }, []);
  const $e = c.useMemo(() => ({
    ...M
  }), [M]), at = pl({
    crossOrigin: K,
    requestsVideoFrame: !!H,
    isClientSideRendering: !1
  });
  return /* @__PURE__ */ E.jsx("video", {
    ref: a,
    muted: p || ne || de <= 0,
    playsInline: !0,
    src: Ye,
    loop: L,
    style: $e,
    disableRemotePlayback: !0,
    crossOrigin: at,
    ...ue
  });
}, xl = c.forwardRef(yw), Cl = (n) => {
  const {
    startFrom: i,
    endAt: s,
    trimBefore: a,
    trimAfter: d,
    name: f,
    pauseWhenBuffering: h,
    stack: p,
    showInTimeline: m,
    ...g
  } = n, w = Qe();
  if (w.isClientSideRendering)
    throw new Error("<OffthreadVideo> is not supported in @remotion/web-renderer. Use <Video> from @remotion/media instead. See https://remotion.dev/docs/client-side-rendering/limitations");
  const y = c.useCallback(() => {
  }, []);
  if (typeof n.src != "string")
    throw new TypeError(`The \`<OffthreadVideo>\` tag requires a string for \`src\`, but got ${JSON.stringify(n.src)} instead.`);
  As({ startFrom: i, endAt: s, trimBefore: a, trimAfter: d });
  const { trimBeforeValue: x, trimAfterValue: R } = Ds({
    startFrom: i,
    endAt: s,
    trimBefore: a,
    trimAfter: d
  });
  if (typeof x < "u" || typeof R < "u")
    return /* @__PURE__ */ E.jsx(Nt, {
      layout: "none",
      from: 0 - (x ?? 0),
      showInTimeline: !1,
      durationInFrames: R,
      name: f,
      children: /* @__PURE__ */ E.jsx(Cl, {
        pauseWhenBuffering: h ?? !1,
        ...g,
        trimAfter: void 0,
        name: void 0,
        showInTimeline: m,
        trimBefore: void 0,
        stack: void 0,
        startFrom: void 0,
        endAt: void 0
      })
    });
  if (Vs(n, "Video"), w.isRendering)
    return /* @__PURE__ */ E.jsx(vw, {
      pauseWhenBuffering: h ?? !1,
      ...g,
      trimAfter: void 0,
      name: void 0,
      showInTimeline: m,
      trimBefore: void 0,
      stack: void 0,
      startFrom: void 0,
      endAt: void 0
    });
  const {
    transparent: k,
    toneMapped: S,
    onAutoPlayError: I,
    onVideoFrame: L,
    crossOrigin: D,
    delayRenderRetries: M,
    delayRenderTimeoutInMilliseconds: P,
    ..._
  } = g;
  return /* @__PURE__ */ E.jsx(xl, {
    _remotionInternalStack: p ?? null,
    onDuration: y,
    onlyWarnForMediaSeekingError: !0,
    pauseWhenBuffering: h ?? !1,
    showInTimeline: m ?? !0,
    onAutoPlayError: I ?? void 0,
    onVideoFrame: L ?? null,
    crossOrigin: D,
    ..._,
    _remotionInternalNativeLoopPassed: !1
  });
}, ww = ({
  src: n,
  acceptableTimeShiftInSeconds: i,
  allowAmplificationDuringRender: s,
  audioStreamIndex: a,
  className: d,
  crossOrigin: f,
  delayRenderRetries: h,
  delayRenderTimeoutInMilliseconds: p,
  id: m,
  loopVolumeCurveBehavior: g,
  muted: w,
  name: y,
  onAutoPlayError: x,
  onError: R,
  onVideoFrame: k,
  pauseWhenBuffering: S,
  playbackRate: I,
  preservePitch: L,
  showInTimeline: D,
  style: M,
  toneFrequency: P,
  toneMapped: _,
  transparent: $,
  trimAfter: A,
  trimBefore: U,
  useWebAudioApi: H,
  volume: K,
  _remotionInternalNativeLoopPassed: Q,
  endAt: q,
  stack: ee,
  startFrom: re,
  imageFormat: ie
}) => {
  if (ie)
    throw new TypeError("The `<OffthreadVideo>` tag does no longer accept `imageFormat`. Use the `transparent` prop if you want to render a transparent video.");
  return /* @__PURE__ */ E.jsx(Cl, {
    acceptableTimeShiftInSeconds: i,
    allowAmplificationDuringRender: s ?? !0,
    audioStreamIndex: a ?? 0,
    className: d,
    crossOrigin: f,
    delayRenderRetries: h,
    delayRenderTimeoutInMilliseconds: p,
    id: m,
    loopVolumeCurveBehavior: g ?? "repeat",
    muted: w ?? !1,
    name: y,
    onAutoPlayError: x ?? null,
    onError: R,
    onVideoFrame: k,
    pauseWhenBuffering: S ?? !0,
    playbackRate: I ?? 1,
    preservePitch: L,
    toneFrequency: P ?? 1,
    showInTimeline: D ?? !0,
    src: n,
    stack: ee,
    startFrom: re,
    _remotionInternalNativeLoopPassed: Q ?? !1,
    endAt: q,
    style: M,
    toneMapped: _ ?? !0,
    transparent: $ ?? !1,
    trimAfter: A,
    trimBefore: U,
    useWebAudioApi: H ?? !1,
    volume: K
  });
};
_t(ww);
var Sw = "remotion_staticFilesChanged";
function Ew() {
  const n = ge.useContext(Zr), i = ge.useContext(eo), s = ge.useContext(qr), a = ge.useContext(Ke), d = ge.useContext(Xo), f = ge.useContext(mr), h = ge.useContext(js), p = ge.useContext(bs), m = ge.useContext(gr), g = ge.useContext(no), w = ge.useContext(io), y = ge.useContext(pr);
  return c.useMemo(() => ({
    compositionManagerCtx: n,
    timelineContext: i,
    setTimelineContext: s,
    sequenceContext: a,
    nonceContext: d,
    canUseRemotionHooksContext: f,
    preloadContext: h,
    resolveCompositionContext: p,
    renderAssetManagerContext: m,
    sequenceManagerContext: g,
    bufferManagerContext: w,
    logLevelContext: y
  }), [
    n,
    d,
    a,
    s,
    i,
    f,
    h,
    p,
    m,
    g,
    w,
    y
  ]);
}
var xw = (n) => {
  const { children: i, contexts: s } = n;
  return /* @__PURE__ */ E.jsx(pr.Provider, {
    value: s.logLevelContext,
    children: /* @__PURE__ */ E.jsx(mr.Provider, {
      value: s.canUseRemotionHooksContext,
      children: /* @__PURE__ */ E.jsx(Xo.Provider, {
        value: s.nonceContext,
        children: /* @__PURE__ */ E.jsx(js.Provider, {
          value: s.preloadContext,
          children: /* @__PURE__ */ E.jsx(Zr.Provider, {
            value: s.compositionManagerCtx,
            children: /* @__PURE__ */ E.jsx(no.Provider, {
              value: s.sequenceManagerContext,
              children: /* @__PURE__ */ E.jsx(gr.Provider, {
                value: s.renderAssetManagerContext,
                children: /* @__PURE__ */ E.jsx(bs.Provider, {
                  value: s.resolveCompositionContext,
                  children: /* @__PURE__ */ E.jsx(eo.Provider, {
                    value: s.timelineContext,
                    children: /* @__PURE__ */ E.jsx(qr.Provider, {
                      value: s.setTimelineContext,
                      children: /* @__PURE__ */ E.jsx(Ke.Provider, {
                        value: s.sequenceContext,
                        children: /* @__PURE__ */ E.jsx(io.Provider, {
                          value: s.bufferManagerContext,
                          children: i
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  });
}, Cw = c.createRef(), pe = {
  MaxMediaCacheSizeContext: qy,
  useUnsafeVideoConfig: _s,
  useFrameForVolumeProp: oo,
  useTimelinePosition: Wn,
  useAbsoluteTimelinePosition: Sm,
  evaluateVolume: wr,
  getAbsoluteSrc: nn,
  getAssetDisplayName: ep,
  Timeline: Ua,
  validateMediaTrimProps: As,
  validateMediaProps: Vs,
  resolveTrimProps: Ds,
  VideoForPreview: xl,
  CompositionManager: Zr,
  CompositionSetters: Rs,
  VisualModeCodeValuesContext: Fs,
  VisualModeDragOverridesContext: Ms,
  VisualModeSettersContext: Rm,
  SequenceManager: no,
  SequenceStackTracesUpdateContext: lw,
  wrapInSchema: Kn,
  sequenceSchema: Cs,
  sequenceStyleSchema: Pm,
  sequenceVisualStyleSchema: vr,
  sequencePremountSchema: km,
  flattenActiveSchema: dl,
  getFlatSchemaWithAllKeys: fl,
  RemotionRootContexts: sw,
  CompositionManagerProvider: Qy,
  useVideo: Ns,
  getRoot: tw,
  useMediaVolumeState: wl,
  useMediaMutedState: Sl,
  useMediaInTimeline: vl,
  useLazyComponent: fm,
  truthy: Zo,
  SequenceContext: Ke,
  PremountContext: Cm,
  useRemotionContexts: Ew,
  RemotionContextProvider: xw,
  CSSUtils: pp,
  setupEnvVariables: dw,
  MediaVolumeContext: gl,
  SetMediaVolumeContext: yl,
  getRemotionEnvironment: Gt,
  SharedAudioContext: ro,
  SharedAudioContextProvider: Jm,
  SharedAudioTagsContext: Os,
  SharedAudioTagsContextProvider: Xm,
  invalidCompositionErrorMessage: ag,
  calculateMediaDuration: Ls,
  isCompositionIdValid: pm,
  getPreviewDomElement: Zy,
  compositionsRef: mp,
  portalNode: Oa,
  waitForRoot: nw,
  SetTimelineContext: qr,
  CanUseRemotionHooksProvider: Va,
  CanUseRemotionHooks: mr,
  PrefetchProvider: Qm,
  DurationsContextProvider: Gm,
  IsPlayerContextProvider: jv,
  useIsPlayer: tl,
  EditorPropsProvider: sm,
  EditorPropsContext: rl,
  usePreload: yr,
  NonceContext: Xo,
  resolveVideoConfig: vp,
  resolveVideoConfigOrCatch: aw,
  ResolveCompositionContext: bs,
  useResolvedVideoConfig: ol,
  resolveCompositionsRef: Kv,
  REMOTION_STUDIO_CONTAINER_ELEMENT: hp,
  RenderAssetManager: gr,
  persistCurrentFrame: vm,
  usePlaybackRate: ll,
  useTimelineContext: Hn,
  useTimelineSetFrame: Em,
  isIosSafari: zs,
  WATCH_REMOTION_STATIC_FILES: Sw,
  addSequenceStackTraces: _t,
  useMediaStartsAt: fr,
  BufferingProvider: np,
  BufferingContextReact: io,
  getComponentsToAddStacksTo: fg,
  CurrentScaleContext: fw,
  PreviewSizeContext: mw,
  calculateScale: pw,
  validateRenderAsset: Wm,
  Log: Ze,
  LogLevelContext: pr,
  useLogLevel: rn,
  playbackLogging: ut,
  timeValueRef: Wv,
  compositionSelectorRef: Cw,
  RemotionEnvironmentContext: um,
  warnAboutTooHighVolume: so,
  AudioForPreview: lp,
  OBJECTFIT_CONTAIN_CLASS_NAME: Jo,
  InnerOffthreadVideo: Cl,
  useBasicMediaInTimeline: tp,
  getInputPropsOverride: im,
  setInputPropsOverride: Bv,
  useVideoEnabled: rw,
  useAudioEnabled: ow,
  useIsPlayerBuffering: rp,
  TimelinePosition: Ua,
  DelayRenderContextType: dm,
  TimelineContext: eo,
  PlaybackRateContext: sl,
  AbsoluteTimeContext: ul,
  RenderAssetManagerProvider: ty,
  getEffectiveVisualModeValue: Nm,
  CompositionRenderErrorContext: nm,
  useEffectChainState: oi,
  runEffectChain: ri,
  useMemoizedEffects: ni,
  useMemoizedEffectDefinitions: ti,
  createEffect: Xy,
  createWebGLContextError: Fg,
  createWebGL2ContextError: Vm,
  computeEffectiveSchemaValuesDotNotation: Fm,
  OverrideIdsToNodePathsGettersContext: cl,
  OverrideIdsToNodePathsSettersContext: Sg,
  findPropsToDelete: Im,
  makeSequencePropsSubscriptionKey: hn,
  getCodeValuesCtx: bm,
  getEffectCodeValuesCtx: Tm,
  hiddenField: to
}, gp = (n) => ge.Children.toArray(n).reduce((s, a) => a.type === ge.Fragment ? s.concat(gp(a.props.children)) : (s.push(a), s), []), kl = c.createContext(!1), kw = ({ children: n }) => /* @__PURE__ */ E.jsx(kl.Provider, {
  value: !0,
  children: n
}), Pw = ({ children: n }) => /* @__PURE__ */ E.jsx(kl.Provider, {
  value: !1,
  children: n
}), Rw = () => {
  if (!ge.useContext(kl))
    throw new Error("This component must be inside a <Series /> component.");
}, Tw = ({ children: n }, i) => (Rw(), /* @__PURE__ */ E.jsx(Pw, {
  children: n
})), Pl = c.forwardRef(Tw), bw = (n) => {
  const i = c.useMemo(() => {
    let s = 0;
    const a = gp(n.children);
    return c.Children.map(a, (d, f) => {
      const h = d;
      if (typeof h == "string") {
        if (h.trim() === "")
          return null;
        throw new TypeError(`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but you passed a string "${h}"`);
      }
      if (h.type !== Pl)
        throw new TypeError(`The <Series /> component only accepts a list of <Series.Sequence /> components as its children, but got ${h} instead`);
      const p = `index = ${f}, duration = ${h.props.durationInFrames}`, m = h.props.durationInFrames, {
        durationInFrames: g,
        children: w,
        from: y,
        name: x,
        ...R
      } = h.props;
      (f !== a.length - 1 || m !== 1 / 0) && Ts(m, {
        component: "of a <Series.Sequence /> component",
        allowFloats: !0
      });
      const k = h.props.offset ?? 0;
      if (Number.isNaN(k))
        throw new TypeError(`The "offset" property of a <Series.Sequence /> must not be NaN, but got NaN (${p}).`);
      if (!Number.isFinite(k))
        throw new TypeError(`The "offset" property of a <Series.Sequence /> must be finite, but got ${k} (${p}).`);
      if (k % 1 !== 0)
        throw new TypeError(`The "offset" property of a <Series.Sequence /> must be finite, but got ${k} (${p}).`);
      const S = s + k;
      return s += m + k, /* @__PURE__ */ E.jsx(Nt, {
        name: x || "<Series.Sequence>",
        _remotionInternalDocumentationLink: x ? void 0 : "https://www.remotion.dev/docs/series",
        from: S,
        durationInFrames: m,
        ...R,
        ref: h.ref,
        children: d
      });
    });
  }, [n.children]);
  return /* @__PURE__ */ E.jsx(kw, {
    children: /* @__PURE__ */ E.jsx(Nt, {
      layout: "none",
      name: "<Series>",
      _remotionInternalDocumentationLink: "https://www.remotion.dev/docs/series",
      ...n,
      children: i
    })
  });
}, Iw = Object.assign(Kn(bw, gg), {
  Sequence: Pl
});
_t(Iw);
_t(Pl);
var Of = (n) => Math.round(n * 1e5) / 1e5, La = ({
  element: n,
  desiredTime: i,
  logLevel: s,
  mountTime: a
}) => {
  if (Ps(n.currentTime, i))
    return {
      wait: Promise.resolve(i),
      cancel: () => {
      }
    };
  ws({
    logLevel: s,
    mediaRef: n,
    time: i,
    why: "Seeking during rendering",
    mountTime: a
  });
  let d, f = null;
  const h = new Promise((m) => {
    d = n.requestVideoFrameCallback((g, w) => {
      const y = w.expectedDisplayTime - g;
      if (y <= 0) {
        m(w.mediaTime);
        return;
      }
      setTimeout(() => {
        m(w.mediaTime);
      }, y + 150);
    });
  }), p = new Promise((m) => {
    const g = () => {
      m();
    };
    n.addEventListener("seeked", g, {
      once: !0
    }), f = () => {
      n.removeEventListener("seeked", g);
    };
  });
  return {
    wait: Promise.all([h, p]).then(([m]) => m),
    cancel: () => {
      f == null || f(), n.cancelVideoFrameCallback(d);
    }
  };
}, Nw = ({
  element: n,
  desiredTime: i,
  fps: s,
  logLevel: a,
  mountTime: d
}) => {
  const f = 1 / s / 2;
  let h = () => {
  };
  return Number.isFinite(n.duration) && n.currentTime >= n.duration && i >= n.duration ? {
    prom: Promise.resolve(),
    cancel: () => {
    }
  } : {
    prom: new Promise((m, g) => {
      const w = La({
        element: n,
        desiredTime: i + f,
        logLevel: a,
        mountTime: d
      });
      w.wait.then((y) => {
        if (Math.abs(i - y) <= f)
          return m();
        const R = i > y ? 1 : -1, k = La({
          element: n,
          desiredTime: y + f * R,
          logLevel: a,
          mountTime: d
        });
        h = k.cancel, k.wait.then((S) => {
          const I = Math.abs(i - S);
          if (Of(I) <= Of(f))
            return m();
          const L = La({
            element: n,
            desiredTime: i + f,
            logLevel: a,
            mountTime: d
          });
          return h = L.cancel, L.wait.then(() => {
            m();
          }).catch((D) => {
            g(D);
          });
        }).catch((S) => {
          g(S);
        });
      }), h = w.cancel;
    }),
    cancel: () => {
      h();
    }
  };
}, _w = ({
  onError: n,
  volume: i,
  allowAmplificationDuringRender: s,
  playbackRate: a,
  onDuration: d,
  toneFrequency: f,
  name: h,
  acceptableTimeShiftInSeconds: p,
  delayRenderRetries: m,
  delayRenderTimeoutInMilliseconds: g,
  loopVolumeCurveBehavior: w,
  audioStreamIndex: y,
  onVideoFrame: x,
  preservePitch: R,
  ...k
}, S) => {
  const I = Wn(), L = vn(), D = oo(w ?? "repeat"), M = _s(), P = c.useRef(null), _ = c.useContext(Ke), $ = fr(), A = Qe(), U = rn(), H = ei(), { delayRender: K, continueRender: Q } = Jt(), { registerRenderAsset: q, unregisterRenderAsset: ee } = c.useContext(gr), re = c.useMemo(() => `video-${hr(k.src ?? "")}-${_ == null ? void 0 : _.cumulatedFrom}-${_ == null ? void 0 : _.relativeFrom}-${_ == null ? void 0 : _.durationInFrames}`, [
    k.src,
    _ == null ? void 0 : _.cumulatedFrom,
    _ == null ? void 0 : _.relativeFrom,
    _ == null ? void 0 : _.durationInFrames
  ]);
  if (!M)
    throw new Error("No video config found");
  const ie = wr({
    volume: i,
    frame: D,
    mediaVolume: 1
  });
  so(ie), c.useEffect(() => {
    if (!k.src)
      throw new Error("No src passed");
    if (!k.muted && !(ie <= 0) && window.remotion_audioEnabled)
      return q({
        type: "video",
        src: nn(k.src),
        id: re,
        frame: I,
        volume: ie,
        mediaFrame: L,
        playbackRate: a ?? 1,
        toneFrequency: f ?? 1,
        audioStartFrame: Math.max(0, -((_ == null ? void 0 : _.cumulatedNegativeFrom) ?? 0)),
        audioStreamIndex: y ?? 0
      }), () => ee(re);
  }, [
    k.muted,
    k.src,
    q,
    re,
    ee,
    ie,
    L,
    I,
    a,
    f,
    _ == null ? void 0 : _.cumulatedNegativeFrom,
    y
  ]), c.useImperativeHandle(S, () => P.current, []), c.useEffect(() => {
    var G, oe;
    if (!window.remotion_videoEnabled)
      return;
    const { current: W } = P;
    if (!W)
      return;
    const F = sp({
      frame: L,
      playbackRate: a || 1,
      startFrom: -$,
      fps: M.fps
    }), J = K(`Rendering <Html5Video /> with src="${k.src}" at time ${F}`, {
      retries: m ?? void 0,
      timeoutInMilliseconds: g ?? void 0
    });
    if (((oe = (G = window.process) == null ? void 0 : G.env) == null ? void 0 : oe.NODE_ENV) === "test") {
      Q(J);
      return;
    }
    if (Ps(W.currentTime, F)) {
      if (W.readyState >= 2) {
        Q(J);
        return;
      }
      const ne = () => {
        Q(J);
      };
      return W.addEventListener("loadeddata", ne, { once: !0 }), () => {
        W.removeEventListener("loadeddata", ne);
      };
    }
    const B = () => {
      Q(J);
    }, T = Nw({
      element: W,
      desiredTime: F,
      fps: M.fps,
      logLevel: U,
      mountTime: H
    });
    T.prom.then(() => {
      Q(J);
    }), W.addEventListener("ended", B, { once: !0 });
    const O = () => {
      var ne;
      if (W != null && W.error) {
        if (console.error("Error occurred in video", W == null ? void 0 : W.error), n)
          return;
        throw new Jr({
          message: `The browser threw an error while playing the video ${k.src}: Code ${W.error.code} - ${(ne = W == null ? void 0 : W.error) == null ? void 0 : ne.message}. See https://remotion.dev/docs/media-playback-error for help. Pass an onError() prop to handle the error.`,
          src: k.src
        });
      } else
        throw new Jr({
          message: "The browser threw an error",
          src: k.src
        });
    };
    return W.addEventListener("error", O, { once: !0 }), () => {
      T.cancel(), W.removeEventListener("ended", B), W.removeEventListener("error", O), Q(J);
    };
  }, [
    D,
    k.src,
    a,
    M.fps,
    L,
    $,
    n,
    m,
    g,
    U,
    H,
    Q,
    K
  ]);
  const { src: ue } = k;
  return A.isRendering && c.useLayoutEffect(() => {
    var B, T;
    if (((T = (B = window.process) == null ? void 0 : B.env) == null ? void 0 : T.NODE_ENV) === "test")
      return;
    const W = K("Loading <Html5Video> duration with src=" + ue, {
      retries: m ?? void 0,
      timeoutInMilliseconds: g ?? void 0
    }), { current: F } = P, J = () => {
      F != null && F.duration && d(ue, F.duration), Q(W);
    };
    return F != null && F.duration ? (d(ue, F.duration), Q(W)) : F == null || F.addEventListener("loadedmetadata", J, { once: !0 }), () => {
      F == null || F.removeEventListener("loadedmetadata", J), Q(W);
    };
  }, [
    ue,
    d,
    m,
    g,
    Q,
    K
  ]), /* @__PURE__ */ E.jsx("video", {
    ref: P,
    disableRemotePlayback: !0,
    ...k
  });
}, Fw = c.forwardRef(_w), Mw = (n, i) => {
  const {
    startFrom: s,
    endAt: a,
    trimBefore: d,
    trimAfter: f,
    name: h,
    pauseWhenBuffering: p,
    stack: m,
    _remotionInternalNativeLoopPassed: g,
    showInTimeline: w,
    onAutoPlayError: y,
    ...x
  } = n, { loop: R, ...k } = n, { fps: S } = Ot(), I = Qe();
  if (I.isClientSideRendering)
    throw new Error("<Html5Video> is not supported in @remotion/web-renderer. Use <Video> from @remotion/media instead. See https://remotion.dev/docs/client-side-rendering/limitations");
  const { durations: L, setDurations: D } = c.useContext(ml);
  if (typeof i == "string")
    throw new Error("string refs are not supported");
  if (typeof n.src != "string")
    throw new TypeError(`The \`<Html5Video>\` tag requires a string for \`src\`, but got ${JSON.stringify(n.src)} instead.`);
  const M = yr(n.src), P = c.useCallback((H, K) => {
    D({ type: "got-duration", durationInSeconds: K, src: H });
  }, [D]), _ = c.useCallback(() => {
  }, []), $ = L[nn(M)] ?? L[nn(n.src)];
  As({ startFrom: s, endAt: a, trimBefore: d, trimAfter: f });
  const { trimBeforeValue: A, trimAfterValue: U } = Ds({
    startFrom: s,
    endAt: a,
    trimBefore: d,
    trimAfter: f
  });
  if (R && $ !== void 0) {
    if (!Number.isFinite($))
      return /* @__PURE__ */ E.jsx(Es, {
        ...k,
        ref: i,
        stack: m,
        _remotionInternalNativeLoopPassed: !0
      });
    const H = $ * S;
    return /* @__PURE__ */ E.jsx($s, {
      durationInFrames: Ls({
        trimAfter: U,
        mediaDurationInFrames: H,
        playbackRate: n.playbackRate ?? 1,
        trimBefore: A
      }),
      layout: "none",
      name: h,
      showInTimeline: !1,
      children: /* @__PURE__ */ E.jsx(Es, {
        ...k,
        ref: i,
        stack: m,
        _remotionInternalNativeLoopPassed: !0
      })
    });
  }
  return typeof A < "u" || typeof U < "u" ? /* @__PURE__ */ E.jsx(Nt, {
    layout: "none",
    from: 0 - (A ?? 0),
    showInTimeline: !1,
    durationInFrames: U === void 0 ? void 0 : U / (n.playbackRate ?? 1),
    name: h,
    children: /* @__PURE__ */ E.jsx(Es, {
      pauseWhenBuffering: p ?? !1,
      ...x,
      ref: i,
      stack: m
    })
  }) : (Vs({
    playbackRate: n.playbackRate,
    preservePitch: n.preservePitch,
    volume: n.volume
  }, "Html5Video"), I.isRendering ? /* @__PURE__ */ E.jsx(Fw, {
    onDuration: P,
    onVideoFrame: _ ?? null,
    ...x,
    ref: i
  }) : /* @__PURE__ */ E.jsx(xl, {
    onlyWarnForMediaSeekingError: !1,
    ...x,
    ref: i,
    onVideoFrame: null,
    pauseWhenBuffering: p ?? !1,
    onDuration: P,
    _remotionInternalStack: m ?? null,
    _remotionInternalNativeLoopPassed: g ?? !1,
    showInTimeline: w ?? !0,
    onAutoPlayError: y ?? void 0
  }));
}, Es = c.forwardRef(Mw);
_t(Es);
mg();
var Lw = {}, $w = new Proxy(Lw, {
  get(n, i) {
    return i === "Bundling" || i === "Rendering" || i === "Log" || i === "Puppeteer" || i === "Output" ? $w : () => {
      console.warn("⚠️  The CLI configuration has been extracted from Remotion Core."), console.warn("Update the import from the config file:"), console.warn(), console.warn("- Delete:"), console.warn('import {Config} from "remotion";'), console.warn("+ Replace:"), console.warn('import {Config} from "@remotion/cli/config";'), console.warn(), console.warn("For more information, see https://www.remotion.dev/docs/4-0-migration."), process.exit(1);
    };
  }
});
Nt.displayName = "Sequence";
_t(Nt);
_t(Ba);
typeof window < "u" && (window.remotion_renderReady = !1, window.remotion_delayRenderTimeouts || (window.remotion_delayRenderTimeouts = {}), window.remotion_delayRenderHandles = []);
var jw = {
  "style.translate": {
    type: "translate",
    step: 1,
    default: "0px 0px",
    description: "Offset"
  },
  "style.scale": {
    type: "number",
    min: 0.05,
    max: 100,
    step: 0.01,
    default: 1,
    description: "Scale"
  },
  "style.rotate": {
    type: "rotation",
    step: 1,
    default: "0deg",
    description: "Rotation"
  },
  "style.opacity": {
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 1,
    description: "Opacity"
  }
}, Vw = {
  premountFor: {
    type: "number",
    default: 0,
    description: "Premount For",
    min: 0,
    step: 1
  },
  postmountFor: {
    type: "hidden"
  },
  styleWhilePremounted: {
    type: "hidden"
  },
  styleWhilePostmounted: {
    type: "hidden"
  }
}, Aw = {
  ...jw,
  ...Vw
}, Dw = {
  layout: {
    type: "enum",
    default: "absolute-fill",
    description: "Layout",
    variants: {
      "absolute-fill": Aw,
      none: {}
    }
  }
};
({
  ...Dw.layout
});
var Ow = (n, i, s) => {
  if (n) {
    if (typeof n != "object")
      throw new Error(`"${i}" must be an object, but you passed a value of type ${typeof n}`);
    if (Array.isArray(n))
      throw new Error(`"${i}" must be an object, an array was passed ${s ? `for composition "${s}"` : ""}`);
  }
};
function zw(n, i, s) {
  if (typeof n != "number")
    throw new Error(`The "${i}" prop ${s} must be a number, but you passed a value of type ${typeof n}`);
  if (isNaN(n))
    throw new TypeError(`The "${i}" prop ${s} must not be NaN, but is NaN.`);
  if (!Number.isFinite(n))
    throw new TypeError(`The "${i}" prop ${s} must be finite, but is ${n}.`);
  if (n % 1 !== 0)
    throw new TypeError(`The "${i}" prop ${s} must be an integer, but is ${n}.`);
  if (n <= 0)
    throw new TypeError(`The "${i}" prop ${s} must be positive, but got ${n}.`);
}
function Bw(n, i) {
  const { allowFloats: s, component: a } = i;
  if (typeof n > "u")
    throw new Error(`The "durationInFrames" prop ${a} is missing.`);
  if (typeof n != "number")
    throw new Error(`The "durationInFrames" prop ${a} must be a number, but you passed a value of type ${typeof n}`);
  if (n <= 0)
    throw new TypeError(`The "durationInFrames" prop ${a} must be positive, but got ${n}.`);
  if (!s && n % 1 !== 0)
    throw new TypeError(`The "durationInFrames" prop ${a} must be an integer, but got ${n}.`);
  if (!Number.isFinite(n))
    throw new TypeError(`The "durationInFrames" prop ${a} must be finite, but got ${n}.`);
}
function Uw(n, i, s) {
  if (typeof n != "number")
    throw new Error(`"fps" must be a number, but you passed a value of type ${typeof n} ${i}`);
  if (!Number.isFinite(n))
    throw new Error(`"fps" must be a finite, but you passed ${n} ${i}`);
  if (isNaN(n))
    throw new Error(`"fps" must not be NaN, but got ${n} ${i}`);
  if (n <= 0)
    throw new TypeError(`"fps" must be positive, but got ${n} ${i}`);
  if (s && n > 50)
    throw new TypeError("The FPS for a GIF cannot be higher than 50. Use the --every-nth-frame option to lower the FPS: https://remotion.dev/docs/render-as-gif");
}
var Us = {
  validateFps: Uw,
  validateDimension: zw,
  validateDurationInFrames: Bw,
  validateDefaultAndInputProps: Ow
};
if (typeof c.createContext != "function") {
  const n = [
    'Remotion requires React.createContext, but it is "undefined".',
    'If you are in a React Server Component, turn it into a client component by adding "use client" at the top of the file.',
    "",
    "Before:",
    '  import {Player} from "@remotion/player";',
    "",
    "After:",
    '  "use client";',
    '  import {Player} from "@remotion/player";'
  ];
  throw new Error(n.join(`
`));
}
var tt = 25, Qa = 16, Hw = () => /* @__PURE__ */ E.jsx("svg", {
  width: tt,
  height: tt,
  viewBox: "0 0 25 25",
  fill: "none",
  children: /* @__PURE__ */ E.jsx("path", {
    d: "M8 6.375C7.40904 8.17576 7.06921 10.2486 7.01438 12.3871C6.95955 14.5255 7.19163 16.6547 7.6875 18.5625C9.95364 18.2995 12.116 17.6164 14.009 16.5655C15.902 15.5147 17.4755 14.124 18.6088 12.5C17.5158 10.8949 15.9949 9.51103 14.1585 8.45082C12.3222 7.3906 10.2174 6.68116 8 6.375Z",
    fill: "white",
    stroke: "white",
    strokeWidth: "6.25",
    strokeLinejoin: "round"
  })
}), Ww = () => /* @__PURE__ */ E.jsxs("svg", {
  viewBox: "0 0 100 100",
  width: tt,
  height: tt,
  children: [
    /* @__PURE__ */ E.jsx("rect", {
      x: "25",
      y: "20",
      width: "20",
      height: "60",
      fill: "#fff",
      ry: "5",
      rx: "5"
    }),
    /* @__PURE__ */ E.jsx("rect", {
      x: "55",
      y: "20",
      width: "20",
      height: "60",
      fill: "#fff",
      ry: "5",
      rx: "5"
    })
  ]
}), Kw = ({
  isFullscreen: n
}) => {
  const a = n ? 0 : 3, d = n ? 6 * 1.6 : 6 / 2, f = n ? 6 * 1.6 : 12;
  return /* @__PURE__ */ E.jsxs("svg", {
    viewBox: "0 0 32 32",
    height: Qa,
    width: Qa,
    children: [
      /* @__PURE__ */ E.jsx("path", {
        d: `
				M ${a} ${f}
				L ${d} ${d}
				L ${f} ${a}
				`,
        stroke: "#fff",
        strokeWidth: 6,
        fill: "none"
      }),
      /* @__PURE__ */ E.jsx("path", {
        d: `
				M ${32 - a} ${f}
				L ${32 - d} ${d}
				L ${32 - f} ${a}
				`,
        stroke: "#fff",
        strokeWidth: 6,
        fill: "none"
      }),
      /* @__PURE__ */ E.jsx("path", {
        d: `
				M ${a} ${32 - f}
				L ${d} ${32 - d}
				L ${f} ${32 - a}
				`,
        stroke: "#fff",
        strokeWidth: 6,
        fill: "none"
      }),
      /* @__PURE__ */ E.jsx("path", {
        d: `
				M ${32 - a} ${32 - f}
				L ${32 - d} ${32 - d}
				L ${32 - f} ${32 - a}
				`,
        stroke: "#fff",
        strokeWidth: 6,
        fill: "none"
      })
    ]
  });
}, Qw = () => /* @__PURE__ */ E.jsx("svg", {
  width: tt,
  height: tt,
  viewBox: "0 0 24 24",
  children: /* @__PURE__ */ E.jsx("path", {
    d: "M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71v-4.17l4.18 4.18c-.49.37-1.02.68-1.6.91-.36.15-.58.53-.58.92 0 .72.73 1.18 1.39.91.8-.33 1.55-.77 2.22-1.31l1.34 1.34a.996.996 0 101.41-1.41L5.05 3.63c-.39-.39-1.02-.39-1.42 0zM19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4-.59-.23-1.22.23-1.22.86v.19c0 .38.25.71.61.85C17.18 6.54 19 9.06 19 12zm-8.71-6.29l-.17.17L12 7.76V6.41c0-.89-1.08-1.33-1.71-.7zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z",
    fill: "#fff"
  })
}), Yw = () => /* @__PURE__ */ E.jsx("svg", {
  width: tt,
  height: tt,
  viewBox: "0 0 24 24",
  children: /* @__PURE__ */ E.jsx("path", {
    d: "M3 10v4c0 .55.45 1 1 1h3l3.29 3.29c.63.63 1.71.18 1.71-.71V6.41c0-.89-1.08-1.34-1.71-.71L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 4.45v.2c0 .38.25.71.6.85C17.18 6.53 19 9.06 19 12s-1.82 5.47-4.4 6.5c-.36.14-.6.47-.6.85v.2c0 .63.63 1.07 1.21.85C18.6 19.11 21 15.84 21 12s-2.4-7.11-5.79-8.4c-.58-.23-1.21.22-1.21.85z",
    fill: "#fff"
  })
}), zf = "__remotion_buffering_indicator", Bf = "__remotion_buffering_animation", Gw = {
  width: tt,
  height: tt,
  overflow: "hidden",
  lineHeight: "normal",
  fontSize: "inherit"
}, Jw = {
  width: 14,
  height: 14,
  overflow: "hidden",
  lineHeight: "normal",
  fontSize: "inherit"
}, Xw = ({ type: n }) => {
  const i = n === "player" ? Gw : Jw;
  return /* @__PURE__ */ E.jsxs(E.Fragment, {
    children: [
      /* @__PURE__ */ E.jsx("style", {
        type: "text/css",
        children: `
				@keyframes ${Bf} {
          0% {
            rotate: 0deg;
          }
          100% {
            rotate: 360deg;
          }
        }
        
        .${zf} {
            animation: ${Bf} 1s linear infinite;
        }        
			`
      }),
      /* @__PURE__ */ E.jsx("div", {
        style: i,
        children: /* @__PURE__ */ E.jsx("svg", {
          viewBox: n === "player" ? "0 0 22 22" : "0 0 18 18",
          style: i,
          className: zf,
          children: /* @__PURE__ */ E.jsx("path", {
            d: n === "player" ? "M 11 4 A 7 7 0 0 1 15.1145 16.66312" : "M 9 2 A 7 7 0 0 1 13.1145 14.66312",
            stroke: "white",
            strokeLinecap: "round",
            fill: "none",
            strokeWidth: 3
          })
        })
      })
    ]
  });
}, Zw = ({
  currentSize: n,
  width: i,
  height: s,
  compositionWidth: a,
  compositionHeight: d
}) => i !== void 0 && s === void 0 ? {
  aspectRatio: [a, d].join("/")
} : s !== void 0 && i === void 0 ? {
  aspectRatio: [a, d].join("/")
} : n ? {
  width: a,
  height: d
} : {
  width: a,
  height: d
}, yp = ({
  previewSize: n,
  compositionWidth: i,
  compositionHeight: s,
  canvasSize: a
}) => {
  const d = pe.calculateScale({
    canvasSize: a,
    compositionHeight: s,
    compositionWidth: i,
    previewSize: n
  }), f = 0 - (1 - d) / 2, h = f * i, p = f * s, m = i * d, g = s * d, w = a.width / 2 - m / 2, y = a.height / 2 - g / 2;
  return {
    centerX: w,
    centerY: y,
    xCorrection: h,
    yCorrection: p,
    scale: d
  };
}, wp = ({
  config: n,
  style: i,
  canvasSize: s,
  overflowVisible: a,
  layout: d
}) => n ? {
  position: "relative",
  overflow: a ? "visible" : "hidden",
  ...Zw({
    compositionHeight: n.height,
    compositionWidth: n.width,
    currentSize: s,
    height: i == null ? void 0 : i.height,
    width: i == null ? void 0 : i.width
  }),
  opacity: d ? 1 : 0,
  ...i
} : {}, Sp = ({
  config: n,
  layout: i,
  scale: s,
  overflowVisible: a
}) => n ? i ? {
  position: "absolute",
  width: n.width,
  height: n.height,
  display: "flex",
  transform: `scale(${s})`,
  marginLeft: i.xCorrection,
  marginTop: i.yCorrection,
  overflow: a ? "visible" : "hidden"
} : {
  position: "absolute",
  width: n.width,
  height: n.height,
  display: "flex",
  transform: `scale(${s})`,
  overflow: a ? "visible" : "hidden"
} : {}, Ep = ({
  layout: n,
  scale: i,
  config: s,
  overflowVisible: a
}) => {
  if (!s)
    return {};
  if (!n)
    return {
      width: s.width * i,
      height: s.height * i,
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      overflow: a ? "visible" : "hidden"
    };
  const { centerX: d, centerY: f } = n;
  return {
    width: s.width * i,
    height: s.height * i,
    display: "flex",
    flexDirection: "column",
    position: "absolute",
    left: d,
    top: f,
    overflow: a ? "visible" : "hidden"
  };
}, xp = ge.createContext(void 0), Cp = ge.createContext(void 0);
class qw {
  constructor() {
    Ne(this, "listeners", {
      ended: [],
      error: [],
      pause: [],
      play: [],
      ratechange: [],
      scalechange: [],
      seeked: [],
      timeupdate: [],
      frameupdate: [],
      fullscreenchange: [],
      volumechange: [],
      mutechange: [],
      waiting: [],
      resume: []
    });
    Ne(this, "dispatchSeek", (i) => {
      this.dispatchEvent("seeked", {
        frame: i
      });
    });
    Ne(this, "dispatchVolumeChange", (i) => {
      this.dispatchEvent("volumechange", {
        volume: i
      });
    });
    Ne(this, "dispatchPause", () => {
      this.dispatchEvent("pause", void 0);
    });
    Ne(this, "dispatchPlay", () => {
      this.dispatchEvent("play", void 0);
    });
    Ne(this, "dispatchEnded", () => {
      this.dispatchEvent("ended", void 0);
    });
    Ne(this, "dispatchRateChange", (i) => {
      this.dispatchEvent("ratechange", {
        playbackRate: i
      });
    });
    Ne(this, "dispatchScaleChange", (i) => {
      this.dispatchEvent("scalechange", {
        scale: i
      });
    });
    Ne(this, "dispatchError", (i) => {
      this.dispatchEvent("error", {
        error: i
      });
    });
    Ne(this, "dispatchTimeUpdate", (i) => {
      this.dispatchEvent("timeupdate", i);
    });
    Ne(this, "dispatchFrameUpdate", (i) => {
      this.dispatchEvent("frameupdate", i);
    });
    Ne(this, "dispatchFullscreenChange", (i) => {
      this.dispatchEvent("fullscreenchange", i);
    });
    Ne(this, "dispatchMuteChange", (i) => {
      this.dispatchEvent("mutechange", i);
    });
    Ne(this, "dispatchWaiting", (i) => {
      this.dispatchEvent("waiting", i);
    });
    Ne(this, "dispatchResume", (i) => {
      this.dispatchEvent("resume", i);
    });
  }
  addEventListener(i, s) {
    this.listeners[i].push(s);
  }
  removeEventListener(i, s) {
    this.listeners[i] = this.listeners[i].filter((a) => a !== s);
  }
  dispatchEvent(i, s) {
    this.listeners[i].forEach((a) => {
      a({ detail: s });
    });
  }
}
class e0 {
  constructor() {
    Ne(this, "listeners", {
      error: [],
      waiting: [],
      resume: []
    });
    Ne(this, "dispatchError", (i) => {
      this.dispatchEvent("error", {
        error: i
      });
    });
    Ne(this, "dispatchWaiting", (i) => {
      this.dispatchEvent("waiting", i);
    });
    Ne(this, "dispatchResume", (i) => {
      this.dispatchEvent("resume", i);
    });
  }
  addEventListener(i, s) {
    this.listeners[i].push(s);
  }
  removeEventListener(i, s) {
    this.listeners[i] = this.listeners[i].filter((a) => a !== s);
  }
  dispatchEvent(i, s) {
    this.listeners[i].forEach((a) => {
      a({ detail: s });
    });
  }
}
var kp = (n) => {
  const i = c.useContext(pe.BufferingContextReact);
  if (!i)
    throw new Error("BufferingContextReact not found");
  c.useLayoutEffect(() => {
    const s = i.listenForBuffering(() => {
      i.buffering.current = !0, n.dispatchWaiting({});
    }), a = i.listenForResume(() => {
      i.buffering.current = !1, n.dispatchResume({});
    });
    return () => {
      s.remove(), a.remove();
    };
  }, [i, n]);
}, t0 = ({ children: n, currentPlaybackRate: i }) => {
  const [s] = c.useState(() => new qw());
  if (!c.useContext(pe.BufferingContextReact))
    throw new Error("BufferingContextReact not found");
  return c.useEffect(() => {
    i && s.dispatchRateChange(i);
  }, [s, i]), kp(s), /* @__PURE__ */ E.jsx(xp.Provider, {
    value: s,
    children: n
  });
}, Rl = (n, i) => {
  const [s, a] = c.useState(!1);
  return c.useEffect(() => {
    const { current: d } = n;
    if (!d)
      return;
    let f;
    const h = () => {
      i && (clearTimeout(f), f = setTimeout(() => {
        a(!1);
      }, i === !0 ? 3e3 : i));
    }, p = () => {
      a(!0), h();
    }, m = () => {
      a(!1), clearTimeout(f);
    }, g = () => {
      a(!0), h();
    };
    return d.addEventListener("mouseenter", p), d.addEventListener("mouseleave", m), d.addEventListener("mousemove", g), () => {
      d.removeEventListener("mouseenter", p), d.removeEventListener("mouseleave", m), d.removeEventListener("mousemove", g), clearTimeout(f);
    };
  }, [i, n]), s;
}, Hs = () => {
  const [n, i, s] = pe.Timeline.usePlayingState(), [a, d] = c.useState(!1), f = pe.Timeline.useTimelinePosition(), h = c.useRef(f), p = pe.Timeline.useTimelineSetFrame(), m = pe.Timeline.useTimelineSetFrame(), g = c.useContext(pe.SharedAudioContext), w = c.useContext(pe.SharedAudioTagsContext), { audioAndVideoTags: y } = pe.useTimelineContext(), x = c.useRef(f);
  x.current = f;
  const R = pe.useVideo(), k = pe.useUnsafeVideoConfig(), S = c.useContext(xp), I = ((k == null ? void 0 : k.durationInFrames) ?? 1) - 1, L = f === I, D = f === 0;
  if (!S)
    throw new TypeError("Expected Player event emitter context");
  const M = c.useContext(pe.BufferingContextReact);
  if (!M)
    throw new Error("Missing the buffering context. Most likely you have a Remotion version mismatch.");
  const { buffering: P } = M, _ = c.useCallback((W) => {
    R != null && R.id && m((F) => ({ ...F, [R.id]: W })), x.current = W, S.dispatchSeek(W);
  }, [S, m, R == null ? void 0 : R.id]), $ = c.useCallback((W) => {
    s.current || (d(!0), L && _(0), g == null || g.resume(), w && w.numberOfAudioTags > 0 && W && w.playAllAudios(), y.current.forEach((F) => F.play("player play() was called and playing audio from a click")), s.current = !0, i(!0), h.current = x.current, S.dispatchPlay());
  }, [
    s,
    L,
    g,
    w,
    i,
    S,
    _,
    y
  ]), A = c.useCallback(() => {
    s.current && (s.current = !1, i(!1), S.dispatchPause(), g == null || g.suspend());
  }, [S, s, i, g]), U = c.useCallback(() => {
    s.current && (s.current = !1, x.current = h.current, k && (m((W) => ({
      ...W,
      [k.id]: h.current
    })), i(!1), S.dispatchPause()));
  }, [k, S, s, i, m]), H = R == null ? void 0 : R.id, K = c.useCallback((W) => {
    if (!H)
      return null;
    s.current || p((F) => {
      const J = F[H] ?? window.remotion_initialFrame ?? 0, B = Math.max(0, J - W);
      return J === B ? F : {
        ...F,
        [H]: B
      };
    });
  }, [s, p, H]), Q = c.useCallback((W) => {
    if (!H)
      return null;
    s.current || p((F) => {
      const J = F[H] ?? window.remotion_initialFrame ?? 0, B = Math.min(I, J + W);
      return J === B ? F : {
        ...F,
        [H]: B
      };
    });
  }, [H, s, I, p]), q = c.useCallback((W) => {
    s.current ? A() : $(W);
  }, [s, A, $]), ee = c.useCallback(() => s.current, [s]), re = c.useCallback(() => x.current, [x]), ie = c.useCallback(() => P.current, [P]);
  return c.useMemo(() => ({
    frameBack: K,
    frameForward: Q,
    isLastFrame: L,
    emitter: S,
    playing: n,
    play: $,
    pause: A,
    seek: _,
    isFirstFrame: D,
    getCurrentFrame: re,
    isPlaying: ee,
    isBuffering: ie,
    pauseAndReturnToPlayStart: U,
    hasPlayed: a,
    toggle: q
  }), [
    S,
    K,
    Q,
    a,
    D,
    L,
    re,
    A,
    U,
    $,
    n,
    _,
    q,
    ee,
    ie
  ]);
}, n0 = ({
  browserMediaControlsBehavior: n,
  videoConfig: i,
  playbackRate: s
}) => {
  const { playing: a, pause: d, play: f, emitter: h, getCurrentFrame: p, seek: m } = Hs(), g = c.useRef(!1);
  c.useEffect(() => {
    a && (g.current = !0);
  }, [a]), c.useEffect(() => {
    navigator.mediaSession && n.mode !== "do-nothing" && (a ? navigator.mediaSession.playbackState = "playing" : g.current && (navigator.mediaSession.playbackState = "paused"));
  }, [n.mode, a]), c.useEffect(() => {
    if (!navigator.mediaSession || n.mode === "do-nothing")
      return;
    const w = () => {
      i && navigator.mediaSession && navigator.mediaSession.setPositionState({
        duration: i.durationInFrames / i.fps,
        playbackRate: s,
        position: p() / i.fps
      });
    };
    return h.addEventListener("timeupdate", w), () => {
      h.removeEventListener("timeupdate", w);
    };
  }, [
    n.mode,
    h,
    p,
    s,
    i
  ]), c.useEffect(() => {
    if (navigator.mediaSession && n.mode !== "do-nothing")
      return navigator.mediaSession.setActionHandler("play", () => {
        n.mode === "register-media-session" && f();
      }), navigator.mediaSession.setActionHandler("pause", () => {
        n.mode === "register-media-session" && d();
      }), navigator.mediaSession.setActionHandler("seekto", (w) => {
        n.mode === "register-media-session" && w.seekTime !== void 0 && i && m(Math.round(w.seekTime * i.fps));
      }), navigator.mediaSession.setActionHandler("seekbackward", () => {
        n.mode === "register-media-session" && i && m(Math.max(0, Math.round((p() - 10) * i.fps)));
      }), navigator.mediaSession.setActionHandler("seekforward", () => {
        n.mode === "register-media-session" && i && m(Math.max(i.durationInFrames - 1, Math.round((p() + 10) * i.fps)));
      }), navigator.mediaSession.setActionHandler("previoustrack", () => {
        n.mode === "register-media-session" && m(0);
      }), () => {
        navigator.mediaSession.metadata = null, navigator.mediaSession.setActionHandler("play", null), navigator.mediaSession.setActionHandler("pause", null), navigator.mediaSession.setActionHandler("seekto", null), navigator.mediaSession.setActionHandler("seekbackward", null), navigator.mediaSession.setActionHandler("seekforward", null), navigator.mediaSession.setActionHandler("previoustrack", null);
      };
  }, [
    n.mode,
    p,
    d,
    f,
    m,
    i
  ]);
}, r0 = ({
  time: n,
  currentFrame: i,
  playbackSpeed: s,
  fps: a,
  actualLastFrame: d,
  actualFirstFrame: f,
  framesAdvanced: h,
  shouldLoop: p
}) => {
  const g = (s < 0 ? Math.ceil : Math.floor)(n * s / (1e3 / a)) - h, w = g + i, y = i > d || i < f, x = w > d || w < f, R = !p && x && !y;
  return s > 0 ? x ? {
    nextFrame: f,
    framesToAdvance: g,
    hasEnded: R
  } : { nextFrame: w, framesToAdvance: g, hasEnded: R } : x ? { nextFrame: d, framesToAdvance: g, hasEnded: R } : { nextFrame: w, framesToAdvance: g, hasEnded: R };
}, Uf = () => typeof document > "u" ? !1 : document.visibilityState === "hidden", o0 = () => {
  const n = c.useRef(Uf());
  return c.useEffect(() => {
    const i = () => {
      n.current = Uf();
    };
    return document.addEventListener("visibilitychange", i), () => {
      document.removeEventListener("visibilitychange", i);
    };
  }, []), n;
}, i0 = 0.1, Hf = ({
  audioContext: n,
  audioSyncAnchor: i,
  absoluteTimeInSeconds: s,
  globalPlaybackRate: a,
  logLevel: d,
  force: f
}) => {
  const h = n.currentTime - s / a, p = h - i.value, { outputLatency: m } = n, g = m === 0 ? 0.3 : m, w = n.baseLatency + g;
  return Math.abs(p) < i0 + w && !f || Math.abs(p) < Number.EPSILON ? !1 : (pe.Log.verbose({ logLevel: d, tag: "audio-scheduling" }, "Anchor " + (f ? "forcibly " : "") + "changed from %s to %s with shift %s", i.value, h, p), i.value = h, !0);
}, s0 = (n) => {
  if (n === "suspended" || n === "running-to-suspended")
    return !0;
  if (n === "closed" || n === "interrupted" || n === "running" || n === "suspended-to-running")
    return !1;
  throw new Error(`Unexpected audio context state: ${n}`);
}, u0 = ({
  loop: n,
  playbackRate: i,
  moveToBeginningWhenEnded: s,
  inFrame: a,
  outFrame: d,
  browserMediaControlsBehavior: f,
  getCurrentFrame: h,
  muted: p
}) => {
  const m = pe.useUnsafeVideoConfig(), g = pe.Timeline.useTimelinePosition(), { playing: w, pause: y, emitter: x, isPlaying: R } = Hs(), k = pe.Timeline.useTimelineSetFrame(), S = c.useContext(pe.SharedAudioContext), I = pe.useLogLevel(), L = o0(), D = c.useRef(0), M = c.useContext(pe.BufferingContextReact);
  if (!M)
    throw new Error("Missing the buffering context. Most likely you have a Remotion version mismatch.");
  n0({
    browserMediaControlsBehavior: f,
    playbackRate: i,
    videoConfig: m
  }), c.useLayoutEffect(() => {
    if (!S || !S.audioContext || !m || p)
      return;
    Hf({
      audioContext: S.audioContext,
      audioSyncAnchor: S.audioSyncAnchor,
      absoluteTimeInSeconds: g / m.fps,
      globalPlaybackRate: i,
      logLevel: I,
      force: !1
    }) && S.audioSyncAnchorEmitter.dispatch("changed");
  }, [m, g, I, i, S, p]), c.useLayoutEffect(() => {
    const P = S == null ? void 0 : S.audioContext;
    if (!P || !m || p)
      return;
    const _ = () => {
      const $ = S == null ? void 0 : S.getAudioContextState();
      $ && s0($) && Hf({
        audioContext: P,
        audioSyncAnchor: S.audioSyncAnchor,
        absoluteTimeInSeconds: h() / m.fps,
        globalPlaybackRate: i,
        logLevel: I,
        force: !0
      });
    };
    return P == null || P.addEventListener("statechange", _), () => {
      P == null || P.removeEventListener("statechange", _);
    };
  }, [
    m,
    h,
    I,
    p,
    i,
    S
  ]), c.useEffect(() => {
    var ee;
    if (!m)
      return;
    if (!w) {
      (ee = S == null ? void 0 : S.suspend) == null || ee.call(S);
      return;
    }
    let P = !1, _ = null, $ = performance.now(), A = 0;
    const U = () => {
      _ !== null && (_.type === "raf" ? cancelAnimationFrame(_.id) : clearTimeout(_.id));
    }, H = () => {
      P = !0, U();
    }, K = () => {
      var T, O;
      if (P)
        return;
      if (!R()) {
        (T = S == null ? void 0 : S.suspend) == null || T.call(S);
        return;
      }
      !p && !M.buffering.current && ((O = S == null ? void 0 : S.resume) == null || O.call(S));
      const re = performance.now() - $, ie = d ?? m.durationInFrames - 1, ue = a ?? 0, W = h(), { nextFrame: F, framesToAdvance: J, hasEnded: B } = r0({
        time: re,
        currentFrame: W,
        playbackSpeed: i,
        fps: m.fps,
        actualFirstFrame: ue,
        actualLastFrame: ie,
        framesAdvanced: A,
        shouldLoop: n
      });
      if (A += J, F !== h() && (!B || s) && !M.buffering.current && k((G) => ({ ...G, [m.id]: F })), B) {
        H(), y(), x.dispatchEnded();
        return;
      }
      Q();
    }, Q = () => {
      var ie, ue;
      const re = ((ie = S == null ? void 0 : S.getIsResumingAudioContext) == null ? void 0 : ie.call(S)) ?? null;
      if (re !== null && !p) {
        re.then(() => {
          $ = performance.now(), A = 0, Q();
        });
        return;
      }
      if (M.buffering.current) {
        p || (ue = S == null ? void 0 : S.suspend) == null || ue.call(S);
        const W = M.listenForResume(() => {
          W.remove(), $ = performance.now(), A = 0, Q();
        });
        return;
      }
      if (L.current) {
        _ = {
          type: "timeout",
          id: setTimeout(K, 1e3 / m.fps)
        };
        return;
      }
      _ = { type: "raf", id: requestAnimationFrame(K) };
    };
    Q();
    const q = () => {
      document.visibilityState !== "visible" && (U(), K());
    };
    return window.addEventListener("visibilitychange", q), () => {
      window.removeEventListener("visibilitychange", q), H();
    };
  }, [
    m,
    n,
    y,
    w,
    k,
    x,
    i,
    a,
    d,
    s,
    L,
    h,
    M,
    R,
    S,
    I,
    p
  ]), c.useEffect(() => {
    const P = performance.now(), _ = P - D.current;
    if (_ >= 250) {
      x.dispatchTimeUpdate({ frame: g }), D.current = P;
      return;
    }
    const $ = setTimeout(() => {
      x.dispatchTimeUpdate({ frame: g }), D.current = performance.now();
    }, 250 - _);
    return () => clearTimeout($);
  }, [x, g]), c.useEffect(() => {
    x.dispatchFrameUpdate({ frame: g });
  }, [x, g]);
}, $a = [], Tl = (n, i) => {
  const [s, a] = c.useState(() => {
    if (!n.current)
      return null;
    const h = n.current.getClientRects();
    return h[0] ? {
      width: h[0].width,
      height: h[0].height,
      left: h[0].x,
      top: h[0].y,
      windowSize: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    } : null;
  }), d = c.useMemo(() => typeof ResizeObserver > "u" ? null : new ResizeObserver((h) => {
    const { contentRect: p, target: m } = h[0], g = m.getClientRects();
    if (!(g != null && g[0])) {
      a(null);
      return;
    }
    const w = p.width === 0 ? 1 : g[0].width / p.width, y = p.height === 0 ? 1 : g[0].height / p.height, x = i.shouldApplyCssTransforms || w === 0 ? g[0].width : g[0].width * (1 / w), R = i.shouldApplyCssTransforms || y === 0 ? g[0].height : g[0].height * (1 / y);
    a((k) => k && k.width === x && k.height === R && k.left === g[0].x && k.top === g[0].y && k.windowSize.height === window.innerHeight && k.windowSize.width === window.innerWidth ? k : {
      width: x,
      height: R,
      left: g[0].x,
      top: g[0].y,
      windowSize: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    });
  }), [i.shouldApplyCssTransforms]), f = c.useCallback(() => {
    if (!n.current)
      return;
    const h = n.current.getClientRects();
    if (!h[0]) {
      a(null);
      return;
    }
    a((p) => p && p.width === h[0].width && p.height === h[0].height && p.left === h[0].x && p.top === h[0].y && p.windowSize.height === window.innerHeight && p.windowSize.width === window.innerWidth ? p : {
      width: h[0].width,
      height: h[0].height,
      left: h[0].x,
      top: h[0].y,
      windowSize: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    });
  }, [n]);
  return c.useEffect(() => {
    if (!d)
      return;
    const { current: h } = n;
    return h && d.observe(h), () => {
      h && d.unobserve(h);
    };
  }, [d, n, f]), c.useEffect(() => {
    if (i.triggerOnWindowResize)
      return window.addEventListener("resize", f), () => {
        window.removeEventListener("resize", f);
      };
  }, [i.triggerOnWindowResize, f]), c.useEffect(() => ($a.push(f), () => {
    $a = $a.filter((h) => h !== f);
  }), [f]), c.useMemo(() => s ? { ...s, refresh: f } : null, [s, f]);
}, bl = (n) => n ?? "__remotion-player", a0 = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flex: 1,
  height: "100%",
  width: "100%"
};
class Pp extends ge.Component {
  constructor() {
    super(...arguments);
    Ne(this, "state", { hasError: null });
  }
  static getDerivedStateFromError(s) {
    return { hasError: s };
  }
  componentDidCatch(s) {
    this.props.onError(s);
  }
  render() {
    return this.state.hasError ? /* @__PURE__ */ E.jsx("div", {
      style: a0,
      children: this.props.errorFallback({
        error: this.state.hasError
      })
    }) : this.props.children;
  }
}
var l0 = async () => {
  if (typeof window > "u" || typeof window.crypto > "u" || typeof window.crypto.subtle > "u")
    return null;
  try {
    const n = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(window.location.hostname));
    return Array.from(new Uint8Array(n)).map((i) => i.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}, ja = {
  backgroundColor: "red",
  position: "absolute",
  padding: 12,
  fontFamily: "Arial"
}, c0 = [
  "28d262b44cc61fa750f1686b16ad0604dabfe193fbc263eec05c89b7ad4c2cd6",
  "4db1b0a94be33165dfefcb3ba03d04c7a2666dd27c496d3dc9fa41858e94925e",
  "fbc48530bbf245da790f63675e84e06bab38c3b114fab07eb350025119922bdc",
  "7baf10a8932757b1b3a22b3fce10a048747ac2f8eaf638603487e3705b07eb83",
  "8a6c21a598d8c667272b5207c051b85997bf5b45d5fb712378be3f27cd72c6a6",
  "a2f7aaac9c50a9255e7fc376110c4e0bfe153722dc66ed3c5d3bf2a135f65518"
], Wf = !1, d0 = () => {
  const [n, i] = ge.useState(!1);
  return c.useEffect(() => {
    Wf || (Wf = !0, l0().then((s) => {
      s && c0.includes(s) && i(!0);
    }).catch(() => {
    }));
  }, []), c.useEffect(() => {
    if (!n)
      return;
    const s = () => {
      if (!document.querySelector(".warning-banner")) {
        const f = document.createElement("div");
        f.className = "warning-banner", Object.assign(f.style, ja, {
          zIndex: "9999",
          cssText: `${ja.cssText} !important;`
        }), f.innerHTML = `
	        <a href="https://github.com/remotion-dev/remotion/pull/4589" style="color: white;">
	          Remotion Unlicensed – Contact hi@remotion.dev
	        </a>
	      `, document.body.appendChild(f);
      }
    }, a = new MutationObserver(() => s());
    return a.observe(document.body, { childList: !0, subtree: !0 }), () => {
      a.disconnect();
    };
  }, [n]), n ? /* @__PURE__ */ E.jsx("div", {
    style: ja,
    className: "warning-banner",
    children: /* @__PURE__ */ E.jsx("a", {
      style: { color: "white" },
      href: "https://github.com/remotion-dev/remotion/pull/4589",
      children: "Remotion Unlicensed – Contact hi@remotion.dev"
    })
  }) : null;
}, Kf = ({ playing: n, buffering: i }) => n && i ? /* @__PURE__ */ E.jsx(Xw, {
  type: "player"
}) : n ? /* @__PURE__ */ E.jsx(Ww, {}) : /* @__PURE__ */ E.jsx(Hw, {}), Gr = 12, Qf = 5, f0 = ({
  volume: n,
  isVertical: i,
  onBlur: s,
  inputRef: a,
  setVolume: d
}) => {
  const f = c.useMemo(() => {
    const x = {
      paddingLeft: 5,
      height: tt,
      width: dr,
      display: "inline-flex",
      alignItems: "center"
    };
    return i ? {
      ...x,
      position: "absolute",
      transform: `rotate(-90deg) translateX(${dr / 2 + tt / 2}px)`
    } : {
      ...x
    };
  }, [i]), h = typeof ge.useId > "u" ? "volume-slider" : ge.useId(), [p] = c.useState(() => `__remotion-volume-slider-${hr(h)}`.replace(".", "")), m = c.useCallback((y) => {
    d(parseFloat(y.target.value));
  }, [d]), g = c.useMemo(() => {
    const y = {
      WebkitAppearance: "none",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      borderRadius: Qf / 2,
      cursor: "pointer",
      height: Qf,
      width: dr,
      backgroundImage: `linear-gradient(
				to right,
				white ${n * 100}%, rgba(255, 255, 255, 0) ${n * 100}%
			)`
    };
    return i ? {
      ...y,
      bottom: tt + dr / 2
    } : y;
  }, [i, n]), w = `
	.${p}::-webkit-slider-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${Gr / 2}px;
		box-shadow: 0 0 2px black;
		height: ${Gr}px;
		width: ${Gr}px;
	}

	.${p}::-moz-range-thumb {
		-webkit-appearance: none;
		background-color: white;
		border-radius: ${Gr / 2}px;
		box-shadow: 0 0 2px black;
		height: ${Gr}px;
		width: ${Gr}px;
	}
`;
  return /* @__PURE__ */ E.jsxs("div", {
    style: f,
    children: [
      /* @__PURE__ */ E.jsx("style", {
        dangerouslySetInnerHTML: {
          __html: w
        }
      }),
      /* @__PURE__ */ E.jsx("input", {
        ref: a,
        "aria-label": "Change volume",
        className: p,
        max: 1,
        min: 0,
        onBlur: s,
        onChange: m,
        step: 0.01,
        type: "range",
        value: n,
        style: g
      })
    ]
  });
}, m0 = (n) => /* @__PURE__ */ E.jsx(f0, {
  ...n
}), dr = 100, p0 = ({ displayVerticalVolumeSlider: n, renderMuteButton: i, renderVolumeSlider: s }) => {
  const [a, d] = pe.useMediaMutedState(), [f, h] = pe.useMediaVolumeState(), [p, m] = c.useState(!1), g = c.useRef(null), w = c.useRef(null), y = Rl(g, !1), x = c.useCallback(() => {
    setTimeout(() => {
      w.current && document.activeElement !== w.current && m(!1);
    }, 10);
  }, []), R = f === 0, k = c.useCallback(() => {
    if (R) {
      h(1), d(!1);
      return;
    }
    d((P) => !P);
  }, [R, d, h]), S = c.useMemo(() => ({
    display: "inline-flex",
    background: "none",
    border: "none",
    justifyContent: "center",
    alignItems: "center",
    touchAction: "none",
    ...n && { position: "relative" }
  }), [n]), I = c.useMemo(() => ({
    display: "inline",
    width: tt,
    height: tt,
    cursor: "pointer",
    appearance: "none",
    background: "none",
    border: "none",
    padding: 0
  }), []), L = c.useCallback(({ muted: P, volume: _ }) => {
    const $ = P || _ === 0;
    return /* @__PURE__ */ E.jsx("button", {
      "aria-label": $ ? "Unmute sound" : "Mute sound",
      title: $ ? "Unmute sound" : "Mute sound",
      onClick: k,
      onBlur: x,
      onFocus: () => m(!0),
      style: I,
      type: "button",
      children: $ ? /* @__PURE__ */ E.jsx(Qw, {}) : /* @__PURE__ */ E.jsx(Yw, {})
    });
  }, [x, k, I]), D = c.useMemo(() => i ? i({ muted: a, volume: f }) : L({ muted: a, volume: f }), [a, f, L, i]), M = c.useMemo(() => (p || y) && !a && !pe.isIosSafari() ? (s ?? m0)({
    isVertical: n,
    volume: f,
    onBlur: () => m(!1),
    inputRef: w,
    setVolume: h
  }) : null, [
    n,
    p,
    y,
    a,
    f,
    s,
    h
  ]);
  return /* @__PURE__ */ E.jsxs("div", {
    ref: g,
    style: S,
    children: [
      D,
      M
    ]
  });
};
function h0(n) {
  const [i, s] = c.useState(n), a = c.useRef(null);
  return c.useEffect(() => {
    const d = (f) => {
      a.current && !a.current.contains(f.target) && s(!1);
    };
    return document.addEventListener("pointerup", d, !0), () => {
      document.removeEventListener("pointerup", d, !0);
    };
  }, []), { ref: a, isComponentVisible: i, setIsComponentVisible: s };
}
var v0 = 35, g0 = 70, y0 = {
  height: 30,
  paddingRight: 15,
  paddingLeft: 12,
  display: "flex",
  flexDirection: "row",
  alignItems: "center"
}, w0 = {
  width: 22,
  display: "flex",
  alignItems: "center"
}, S0 = {
  width: 14,
  height: 14,
  color: "black"
}, E0 = () => /* @__PURE__ */ E.jsx("svg", {
  viewBox: "0 0 512 512",
  style: S0,
  children: /* @__PURE__ */ E.jsx("path", {
    fill: "currentColor",
    d: "M435.848 83.466L172.804 346.51l-96.652-96.652c-4.686-4.686-12.284-4.686-16.971 0l-28.284 28.284c-4.686 4.686-4.686 12.284 0 16.971l133.421 133.421c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0z"
  })
}), x0 = (n) => {
  const i = n.toString();
  return i.includes(".") ? i : i + ".0";
}, C0 = ({ rate: n, onSelect: i, selectedRate: s, keyboardSelectedRate: a }) => {
  const d = c.useCallback((y) => {
    y.stopPropagation(), y.preventDefault(), i(n);
  }, [i, n]), [f, h] = c.useState(!1), p = c.useCallback(() => {
    h(!0);
  }, []), m = c.useCallback(() => {
    h(!1);
  }, []), g = a === n, w = c.useMemo(() => ({
    ...y0,
    backgroundColor: f || g ? "#eee" : "transparent"
  }), [f, g]);
  return /* @__PURE__ */ E.jsxs("div", {
    onPointerEnter: p,
    onPointerLeave: m,
    tabIndex: 0,
    style: w,
    onClick: d,
    children: [
      /* @__PURE__ */ E.jsx("div", {
        style: w0,
        children: n === s ? /* @__PURE__ */ E.jsx(E0, {}) : null
      }),
      x0(n),
      "x"
    ]
  }, n);
}, k0 = ({ setIsComponentVisible: n, playbackRates: i, canvasSize: s }) => {
  const { setPlaybackRate: a, playbackRate: d } = pe.usePlaybackRate(), [f, h] = c.useState(d);
  c.useEffect(() => {
    const g = (w) => {
      if (w.preventDefault(), w.key === "ArrowUp") {
        const y = i.findIndex((x) => x === f);
        if (y === 0)
          return;
        h(y === -1 ? i[0] : i[y - 1]);
      } else if (w.key === "ArrowDown") {
        const y = i.findIndex((x) => x === f);
        if (y === i.length - 1)
          return;
        h(y === -1 ? i[i.length - 1] : i[y + 1]);
      } else w.key === "Enter" && (a(f), n(!1));
    };
    return window.addEventListener("keydown", g), () => {
      window.removeEventListener("keydown", g);
    };
  }, [
    i,
    f,
    a,
    n
  ]);
  const p = c.useCallback((g) => {
    a(g), n(!1);
  }, [n, a]), m = c.useMemo(() => ({
    position: "absolute",
    right: 0,
    width: 125,
    maxHeight: s.height - g0 - v0,
    bottom: 35,
    background: "#fff",
    borderRadius: 4,
    overflow: "auto",
    color: "black",
    textAlign: "left"
  }), [s.height]);
  return /* @__PURE__ */ E.jsx("div", {
    style: m,
    children: i.map((g) => /* @__PURE__ */ E.jsx(C0, {
      selectedRate: d,
      onSelect: p,
      rate: g,
      keyboardSelectedRate: f
    }, g))
  });
}, P0 = {
  fontSize: 13,
  fontWeight: "bold",
  color: "white",
  border: "2px solid white",
  borderRadius: 20,
  paddingLeft: 8,
  paddingRight: 8,
  paddingTop: 2,
  paddingBottom: 2
}, Ya = {
  appearance: "none",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 6,
  paddingBottom: 6,
  height: 37,
  display: "inline-flex",
  marginBottom: 0,
  marginTop: 0,
  alignItems: "center"
}, R0 = {
  ...Ya,
  position: "relative"
}, T0 = ({ playbackRates: n, canvasSize: i }) => {
  const { ref: s, isComponentVisible: a, setIsComponentVisible: d } = h0(!1), { playbackRate: f } = pe.usePlaybackRate(), h = c.useCallback((p) => {
    p.stopPropagation(), p.preventDefault(), d((m) => !m);
  }, [d]);
  return /* @__PURE__ */ E.jsx("div", {
    ref: s,
    children: /* @__PURE__ */ E.jsxs("button", {
      type: "button",
      "aria-label": "Change playback rate",
      style: R0,
      onClick: h,
      children: [
        /* @__PURE__ */ E.jsxs("div", {
          style: P0,
          children: [
            f,
            "x"
          ]
        }),
        a && /* @__PURE__ */ E.jsx(k0, {
          canvasSize: i,
          playbackRates: n,
          setIsComponentVisible: d
        })
      ]
    })
  });
}, Yf = (n, i, s) => Math.round(op(n, [0, s], [0, i - 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp"
})), Xr = 5, Ko = 12, Ga = 4, b0 = {
  userSelect: "none",
  WebkitUserSelect: "none",
  paddingTop: Ga,
  paddingBottom: Ga,
  boxSizing: "border-box",
  cursor: "pointer",
  position: "relative",
  touchAction: "none"
}, I0 = {
  height: Xr,
  backgroundColor: "rgba(255, 255, 255, 0.25)",
  width: "100%",
  borderRadius: Xr / 2
}, N0 = (n) => {
  let i = n;
  for (; i.parentElement; )
    i = i.parentElement;
  return i;
}, _0 = ({ durationInFrames: n, onSeekEnd: i, onSeekStart: s, inFrame: a, outFrame: d }) => {
  const f = c.useRef(null), h = Rl(f, !1), p = Tl(f, {
    triggerOnWindowResize: !0,
    shouldApplyCssTransforms: !0
  }), { seek: m, play: g, pause: w, playing: y } = Hs(), x = pe.Timeline.useTimelinePosition(), [R, k] = c.useState({
    dragging: !1
  }), S = (p == null ? void 0 : p.width) ?? 0, I = c.useCallback(($) => {
    var H;
    if ($.button !== 0)
      return;
    const A = (H = f.current) == null ? void 0 : H.getBoundingClientRect().left, U = Yf($.clientX - A, n, S);
    w(), m(U), k({
      dragging: !0,
      wasPlaying: y
    }), s();
  }, [n, S, w, m, y, s]), L = c.useCallback(($) => {
    var H;
    if (!p)
      throw new Error("Player has no size");
    if (!R.dragging)
      return;
    const A = (H = f.current) == null ? void 0 : H.getBoundingClientRect().left, U = Yf($.clientX - A, n, p.width);
    m(U);
  }, [R.dragging, n, m, p]), D = c.useCallback(() => {
    k({
      dragging: !1
    }), R.dragging && (R.wasPlaying ? g() : w(), i());
  }, [R, i, w, g]);
  c.useEffect(() => {
    if (!R.dragging)
      return;
    const $ = N0(f.current);
    return $.addEventListener("pointermove", L), $.addEventListener("pointerup", D), () => {
      $.removeEventListener("pointermove", L), $.removeEventListener("pointerup", D);
    };
  }, [R.dragging, L, D]);
  const M = c.useMemo(() => ({
    height: Ko,
    width: Ko,
    borderRadius: Ko / 2,
    position: "absolute",
    top: Ga - Ko / 2 + 5 / 2,
    backgroundColor: "white",
    left: Math.max(0, x / Math.max(1, n - 1) * S - Ko / 2),
    boxShadow: "0 0 2px black",
    opacity: Number(h || R.dragging)
  }), [h, R.dragging, n, x, S]), P = c.useMemo(() => ({
    height: Xr,
    backgroundColor: "rgba(255, 255, 255, 1)",
    width: (x - (a ?? 0)) / (n - 1) * S,
    marginLeft: (a ?? 0) / (n - 1) * S,
    borderRadius: Xr / 2
  }), [n, x, a, S]), _ = c.useMemo(() => ({
    height: Xr,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    width: ((d ?? n - 1) - (a ?? 0)) / (n - 1) * 100 + "%",
    marginLeft: (a ?? 0) / (n - 1) * 100 + "%",
    borderRadius: Xr / 2,
    position: "absolute"
  }), [n, a, d]);
  return /* @__PURE__ */ E.jsxs("div", {
    ref: f,
    onPointerDown: I,
    style: b0,
    children: [
      /* @__PURE__ */ E.jsxs("div", {
        style: I0,
        children: [
          /* @__PURE__ */ E.jsx("div", {
            style: _
          }),
          /* @__PURE__ */ E.jsx("div", {
            style: P
          })
        ]
      }),
      /* @__PURE__ */ E.jsx("div", {
        style: M
      })
    ]
  });
}, Gf = (n) => {
  const i = Math.floor(n / 60), s = Math.floor(n - i * 60);
  return `${String(i)}:${String(s).padStart(2, "0")}`;
}, F0 = ({ durationInFrames: n, maxTimeLabelWidth: i, fps: s }) => {
  const a = pe.Timeline.useTimelinePosition(), d = c.useMemo(() => ({
    color: "white",
    fontFamily: "sans-serif",
    fontSize: 14,
    maxWidth: i === null ? void 0 : i,
    overflow: "hidden",
    textOverflow: "ellipsis"
  }), [i]), h = a === n - 1 ? a + 1 : a;
  return /* @__PURE__ */ E.jsxs("div", {
    style: d,
    children: [
      Gf(h / s),
      " / ",
      Gf(n / s)
    ]
  });
}, M0 = 10, Ja = 12, L0 = ({
  allowFullscreen: n,
  playerWidth: i
}) => c.useMemo(() => {
  const a = tt, d = tt, f = n ? Qa : 0, h = d + a + f + Ja * 2 + M0 * 2, p = i - h, m = Math.max(p, 0), g = m - dr, y = (g < dr ? m : g) + h + dr, x = i < y;
  return {
    maxTimeLabelWidth: m === 0 ? null : m,
    displayVerticalVolumeSlider: x
  };
}, [n, i]), $0 = [
  0,
  0.013,
  0.049,
  0.104,
  0.175,
  0.259,
  0.352,
  0.45,
  0.55,
  0.648,
  0.741,
  0.825,
  0.896,
  0.951,
  0.987
], j0 = [
  0,
  8.1,
  15.5,
  22.5,
  29,
  35.3,
  41.2,
  47.1,
  52.9,
  58.8,
  64.7,
  71,
  77.5,
  84.5,
  91.9
], V0 = 1 / 0.7, A0 = {
  boxSizing: "border-box",
  position: "absolute",
  bottom: 0,
  width: "100%",
  paddingTop: 40,
  paddingBottom: 10,
  backgroundImage: `linear-gradient(to bottom,${$0.map((n, i) => `hsla(0, 0%, 0%, ${n}) ${j0[i] * V0}%`).join(", ")}, hsl(0, 0%, 0%) 100%)`,
  backgroundSize: "auto 145px",
  display: "flex",
  paddingRight: Ja,
  paddingLeft: Ja,
  flexDirection: "column",
  transition: "opacity 0.3s"
}, D0 = {
  display: "flex",
  flexDirection: "row",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  WebkitUserSelect: "none"
}, O0 = {
  display: "flex",
  flexDirection: "row",
  userSelect: "none",
  WebkitUserSelect: "none",
  alignItems: "center"
}, Qo = {
  width: 12
}, z0 = {
  height: 8
}, B0 = {
  flex: 1
}, U0 = {}, H0 = ({
  durationInFrames: n,
  isFullscreen: i,
  fps: s,
  showVolumeControls: a,
  onFullscreenButtonClick: d,
  allowFullscreen: f,
  onExitFullscreenButtonClick: h,
  spaceKeyToPlayOrPause: p,
  onSeekEnd: m,
  onSeekStart: g,
  inFrame: w,
  outFrame: y,
  initiallyShowControls: x,
  canvasSize: R,
  renderPlayPauseButton: k,
  renderFullscreenButton: S,
  alwaysShowControls: I,
  showPlaybackRateControl: L,
  containerRef: D,
  buffering: M,
  hideControlsWhenPointerDoesntMove: P,
  onPointerDown: _,
  onDoubleClick: $,
  renderMuteButton: A,
  renderVolumeSlider: U,
  playing: H,
  toggle: K,
  renderCustomControls: Q
}) => {
  const q = c.useRef(null), [ee, re] = c.useState(!1), ie = Rl(D, P), { maxTimeLabelWidth: ue, displayVerticalVolumeSlider: W } = L0({
    allowFullscreen: f,
    playerWidth: (R == null ? void 0 : R.width) ?? 0
  }), [F, J] = c.useState(() => {
    if (typeof x == "boolean")
      return x;
    if (typeof x == "number") {
      if (x % 1 !== 0)
        throw new Error("initiallyShowControls must be an integer or a boolean");
      if (Number.isNaN(x))
        throw new Error("initiallyShowControls must not be NaN");
      if (!Number.isFinite(x))
        throw new Error("initiallyShowControls must be finite");
      if (x <= 0)
        throw new Error("initiallyShowControls must be a positive integer");
      return x;
    }
    throw new TypeError("initiallyShowControls must be a number or a boolean");
  }), B = c.useMemo(() => ({
    ...A0,
    opacity: Number(ie || !H || F || I)
  }), [ie, F, H, I]);
  c.useEffect(() => {
    q.current && p && q.current.focus({
      preventScroll: !0
    });
  }, [H, p]), c.useEffect(() => {
    re((typeof document < "u" && (document.fullscreenEnabled || document.webkitFullscreenEnabled)) ?? !1);
  }, []), c.useEffect(() => {
    if (F === !1)
      return;
    const ve = setTimeout(() => {
      J(!1);
    }, F === !0 ? 2e3 : F);
    return () => {
      clearInterval(ve);
    };
  }, [F]);
  const T = c.useMemo(() => {
    if (L === !0)
      return [0.5, 0.8, 1, 1.2, 1.5, 1.8, 2, 2.5, 3];
    if (Array.isArray(L)) {
      for (const he of L) {
        if (typeof he != "number")
          throw new Error("Every item in showPlaybackRateControl must be a number");
        if (he <= 0)
          throw new Error("Every item in showPlaybackRateControl must be positive");
      }
      return L;
    }
    return null;
  }, [L]), O = Q ? Q() : null, G = c.useRef(null), oe = c.useRef(null), ne = c.useCallback((he) => {
    (he.target === G.current || he.target === oe.current) && (_ == null || _(he));
  }, [_]), de = c.useCallback((he) => {
    (he.target === G.current || he.target === oe.current) && ($ == null || $(he));
  }, [$]);
  return /* @__PURE__ */ E.jsxs("div", {
    ref: G,
    style: B,
    onPointerDown: ne,
    onDoubleClick: de,
    children: [
      /* @__PURE__ */ E.jsxs("div", {
        ref: oe,
        style: D0,
        children: [
          /* @__PURE__ */ E.jsxs("div", {
            style: O0,
            children: [
              /* @__PURE__ */ E.jsx("button", {
                ref: q,
                type: "button",
                style: Ya,
                onClick: K,
                "aria-label": H ? "Pause video" : "Play video",
                title: H ? "Pause video" : "Play video",
                children: k === null ? /* @__PURE__ */ E.jsx(Kf, {
                  buffering: M,
                  playing: H
                }) : k({
                  playing: H,
                  isBuffering: M
                }) ?? /* @__PURE__ */ E.jsx(Kf, {
                  buffering: M,
                  playing: H
                })
              }),
              a ? /* @__PURE__ */ E.jsxs(E.Fragment, {
                children: [
                  /* @__PURE__ */ E.jsx("div", {
                    style: Qo
                  }),
                  /* @__PURE__ */ E.jsx(p0, {
                    renderMuteButton: A,
                    renderVolumeSlider: U,
                    displayVerticalVolumeSlider: W
                  })
                ]
              }) : null,
              /* @__PURE__ */ E.jsx("div", {
                style: Qo
              }),
              /* @__PURE__ */ E.jsx(F0, {
                durationInFrames: n,
                fps: s,
                maxTimeLabelWidth: ue
              }),
              /* @__PURE__ */ E.jsx("div", {
                style: Qo
              })
            ]
          }),
          /* @__PURE__ */ E.jsx("div", {
            style: B0
          }),
          O,
          O && T && R ? /* @__PURE__ */ E.jsx("div", {
            style: Qo
          }) : null,
          T && R && /* @__PURE__ */ E.jsx(T0, {
            canvasSize: R,
            playbackRates: T
          }),
          T && ee && f ? /* @__PURE__ */ E.jsx("div", {
            style: Qo
          }) : null,
          /* @__PURE__ */ E.jsx("div", {
            style: U0,
            children: ee && f ? /* @__PURE__ */ E.jsx("button", {
              type: "button",
              "aria-label": i ? "Exit fullscreen" : "Enter Fullscreen",
              title: i ? "Exit fullscreen" : "Enter Fullscreen",
              style: Ya,
              onClick: i ? h : d,
              children: S === null ? /* @__PURE__ */ E.jsx(Kw, {
                isFullscreen: i
              }) : S({ isFullscreen: i })
            }) : null
          })
        ]
      }),
      /* @__PURE__ */ E.jsx("div", {
        style: z0
      }),
      /* @__PURE__ */ E.jsx(_0, {
        onSeekEnd: m,
        onSeekStart: g,
        durationInFrames: n,
        inFrame: w,
        outFrame: y
      })
    ]
  });
}, Rp = typeof document > "u", W0 = (n) => {
  let i = !1;
  return {
    promise: new Promise((a, d) => {
      n.then((f) => {
        if (i) {
          d({ isCanceled: i, value: f });
          return;
        }
        a(f);
      }).catch((f) => {
        d({ isCanceled: i, error: f });
      });
    }),
    cancel: () => {
      i = !0;
    }
  };
}, K0 = (n) => new Promise((i) => setTimeout(i, n)), Q0 = () => {
  const n = c.useRef([]), i = c.useCallback((f) => {
    n.current = [...n.current, f];
  }, []), s = c.useCallback((f) => {
    n.current = n.current.filter((h) => h !== f);
  }, []), a = c.useCallback(() => n.current.map((f) => f.cancel()), []);
  return c.useMemo(() => ({
    appendPendingPromise: i,
    removePendingPromise: s,
    clearPendingPromises: a
  }), [i, a, s]);
}, Y0 = (n, i, s) => {
  const a = Q0(), d = c.useCallback(async (m) => {
    if (m instanceof PointerEvent ? m.pointerType === "touch" : m.nativeEvent.pointerType === "touch") {
      n(m);
      return;
    }
    a.clearPendingPromises();
    const g = W0(K0(200));
    a.appendPendingPromise(g);
    try {
      await g.promise, a.removePendingPromise(g), n(m);
    } catch (w) {
      const y = w;
      if (a.removePendingPromise(g), !y.isCanceled)
        throw y.error;
    }
  }, [a, n]), f = c.useCallback(() => {
    document.addEventListener("pointerup", (m) => {
      d(m);
    }, {
      once: !0
    });
  }, [d]), h = c.useCallback(() => {
    a.clearPendingPromises(), i();
  }, [a, i]);
  return c.useMemo(() => s ? { handlePointerDown: f, handleDoubleClick: h } : { handlePointerDown: n, handleDoubleClick: () => {
  } }, [s, h, f, n]);
}, Xa = ge.version.split(".")[0];
if (Xa === "0")
  throw new Error(`Version ${Xa} of "react" is not supported by Remotion`);
var G0 = parseInt(Xa, 10) >= 18, J0 = ({
  controls: n,
  style: i,
  loop: s,
  autoPlay: a,
  allowFullscreen: d,
  inputProps: f,
  clickToPlay: h,
  showVolumeControls: p,
  doubleClickToFullscreen: m,
  spaceKeyToPlayOrPause: g,
  errorFallback: w,
  playbackRate: y,
  renderLoading: x,
  renderPoster: R,
  className: k,
  moveToBeginningWhenEnded: S,
  showPosterWhenUnplayed: I,
  showPosterWhenEnded: L,
  showPosterWhenPaused: D,
  showPosterWhenBuffering: M,
  showPosterWhenBufferingAndPaused: P,
  inFrame: _,
  outFrame: $,
  initiallyShowControls: A,
  renderFullscreen: U,
  renderPlayPauseButton: H,
  renderMuteButton: K,
  renderVolumeSlider: Q,
  renderCustomControls: q,
  alwaysShowControls: ee,
  showPlaybackRateControl: re,
  posterFillMode: ie,
  bufferStateDelayInMilliseconds: ue,
  hideControlsWhenPointerDoesntMove: W,
  overflowVisible: F,
  browserMediaControlsBehavior: J,
  overrideInternalClassName: B,
  noSuspense: T
}, O) => {
  const G = pe.useUnsafeVideoConfig(), oe = pe.useVideo(), ne = c.useRef(null), de = Tl(ne, {
    triggerOnWindowResize: !1,
    shouldApplyCssTransforms: !1
  }), [he, ve] = c.useState(!1), [Se, Re] = c.useState(a), [Ye, ze] = c.useState(() => !1), [$e, at] = c.useState(!1), Ce = c.useMemo(() => typeof document > "u" ? !1 : !!(document.fullscreenEnabled || document.webkitFullscreenEnabled), []), fe = Hs(), dt = fe.toggle, { mediaMuted: nt, mediaVolume: Ft } = c.useContext(pe.MediaVolumeContext);
  c.useEffect(() => {
    fe.emitter.dispatchVolumeChange(Ft);
  }, [fe.emitter, Ft]);
  const ft = nt || Ft === 0;
  c.useEffect(() => {
    fe.emitter.dispatchMuteChange({
      isMuted: ft
    });
  }, [fe.emitter, ft]), u0({
    loop: s,
    playbackRate: y,
    moveToBeginningWhenEnded: S,
    inFrame: _,
    outFrame: $,
    getCurrentFrame: fe.getCurrentFrame,
    browserMediaControlsBehavior: J,
    muted: ft
  }), c.useEffect(() => {
    he && !fe.playing && (ve(!1), fe.play());
  }, [he, fe]), c.useEffect(() => {
    const { current: ke } = ne;
    if (!ke)
      return;
    const be = () => {
      const kt = document.fullscreenElement === ke || document.webkitFullscreenElement === ke;
      ze(kt);
    };
    return document.addEventListener("fullscreenchange", be), document.addEventListener("webkitfullscreenchange", be), () => {
      document.removeEventListener("fullscreenchange", be), document.removeEventListener("webkitfullscreenchange", be);
    };
  }, []);
  const Et = c.useCallback((ke) => {
    dt(ke);
  }, [dt]), xt = c.useCallback(() => {
    if (!d)
      throw new Error("allowFullscreen is false");
    if (!Ce)
      throw new Error("Browser doesnt support fullscreen");
    if (!ne.current)
      throw new Error("No player ref found");
    ne.current.webkitRequestFullScreen ? ne.current.webkitRequestFullScreen() : ne.current.requestFullscreen();
  }, [d, Ce]), Mt = c.useCallback(() => {
    document.webkitExitFullscreen ? document.webkitExitFullscreen() : document.exitFullscreen();
  }, []);
  c.useEffect(() => {
    const { current: ke } = ne;
    if (!ke)
      return;
    const be = () => {
      const kt = document.webkitFullscreenElement ?? document.fullscreenElement;
      kt && kt === ne.current ? fe.emitter.dispatchFullscreenChange({
        isFullscreen: !0
      }) : fe.emitter.dispatchFullscreenChange({
        isFullscreen: !1
      });
    };
    return ke.addEventListener("webkitfullscreenchange", be), ke.addEventListener("fullscreenchange", be), () => {
      ke.removeEventListener("webkitfullscreenchange", be), ke.removeEventListener("fullscreenchange", be);
    };
  }, [fe.emitter]);
  const Qn = (G == null ? void 0 : G.durationInFrames) ?? 1, mt = c.useMemo(() => !G || !de ? null : yp({
    canvasSize: de,
    compositionHeight: G.height,
    compositionWidth: G.width,
    previewSize: "auto"
  }), [de, G]), Ue = (mt == null ? void 0 : mt.scale) ?? 1, on = c.useRef(!1);
  c.useEffect(() => {
    if (!on.current) {
      on.current = !0;
      return;
    }
    fe.emitter.dispatchScaleChange(Ue);
  }, [fe.emitter, Ue]);
  const { setMediaVolume: sn, setMediaMuted: gn } = c.useContext(pe.SetMediaVolumeContext), [pt, Ct] = c.useState(!1);
  c.useEffect(() => {
    let ke = null, be = !1;
    const kt = () => {
      be = !1, requestAnimationFrame(() => {
        ue === 0 ? Ct(!0) : ke = setTimeout(() => {
          be || Ct(!0);
        }, ue);
      });
    }, En = () => {
      requestAnimationFrame(() => {
        be = !0, Ct(!1), ke && clearTimeout(ke);
      });
    };
    return fe.emitter.addEventListener("waiting", kt), fe.emitter.addEventListener("resume", En), () => {
      fe.emitter.removeEventListener("waiting", kt), fe.emitter.removeEventListener("resume", En), Ct(!1), ke && clearTimeout(ke), be = !0;
    };
  }, [ue, fe.emitter]), c.useImperativeHandle(O, () => {
    const ke = {
      play: fe.play,
      pause: () => {
        ve(!1), fe.pause();
      },
      toggle: Et,
      getContainerNode: () => ne.current,
      getCurrentFrame: fe.getCurrentFrame,
      isPlaying: fe.isPlaying,
      seekTo: (be) => {
        const kt = Qn - 1, En = Math.max(0, Math.min(kt, be));
        fe.isPlaying() && (ve(En !== kt || s), fe.pause()), En === kt && !s && fe.emitter.dispatchEnded(), fe.seek(En);
      },
      isFullscreen: () => {
        const { current: be } = ne;
        return be ? document.fullscreenElement === be || document.webkitFullscreenElement === be : !1;
      },
      requestFullscreen: xt,
      exitFullscreen: Mt,
      getVolume: () => nt ? 0 : Ft,
      setVolume: (be) => {
        if (typeof be != "number")
          throw new TypeError(`setVolume() takes a number, got value of type ${typeof be}`);
        if (isNaN(be))
          throw new TypeError("setVolume() got a number that is NaN. Volume must be between 0 and 1.");
        if (be < 0 || be > 1)
          throw new TypeError(`setVolume() got a number that is out of range. Must be between 0 and 1, got ${be}`);
        sn(be);
      },
      isMuted: () => ft,
      mute: () => {
        gn(!0);
      },
      unmute: () => {
        gn(!1);
      },
      getScale: () => Ue,
      pauseAndReturnToPlayStart: () => {
        fe.pauseAndReturnToPlayStart();
      }
    };
    return Object.assign(fe.emitter, ke);
  }, [
    Qn,
    Mt,
    s,
    nt,
    ft,
    Ft,
    fe,
    xt,
    gn,
    sn,
    Et,
    Ue
  ]);
  const Sr = oe ? oe.component : null, zt = c.useMemo(() => wp({
    canvasSize: de,
    config: G,
    style: i,
    overflowVisible: F,
    layout: mt
  }), [de, G, mt, F, i]), Er = c.useMemo(() => Ep({ config: G, layout: mt, scale: Ue, overflowVisible: F }), [G, mt, F, Ue]), Ws = c.useMemo(() => Sp({
    config: G,
    layout: mt,
    scale: Ue,
    overflowVisible: F
  }), [G, mt, F, Ue]), xr = fe.pause, Cr = fe.emitter.dispatchError, uo = c.useCallback((ke) => {
    xr(), Cr(ke);
  }, [Cr, xr]), ao = c.useCallback((ke) => {
    ke.stopPropagation(), xt();
  }, [xt]), lo = c.useCallback((ke) => {
    ke.stopPropagation(), Mt();
  }, [Mt]), yn = c.useCallback((ke) => {
    (ke instanceof MouseEvent ? ke.button === 2 : ke.nativeEvent.button) || Et(ke);
  }, [Et]), wn = c.useCallback(() => {
    at(!0);
  }, []), ii = c.useCallback(() => {
    at(!1);
  }, []), si = c.useCallback(() => {
    Ye ? Mt() : xt();
  }, [Mt, Ye, xt]), { handlePointerDown: Yn, handleDoubleClick: Gn } = Y0(yn, si, m && d && Ce);
  c.useEffect(() => {
    Se && (fe.play(), Re(!1));
  }, [Se, fe]);
  const ui = c.useMemo(() => x ? x({
    height: zt.height,
    width: zt.width,
    isBuffering: pt
  }) : null, [zt.height, zt.width, x, pt]), co = c.useMemo(() => ({
    type: "scale",
    scale: Ue
  }), [Ue]);
  if (!G)
    return null;
  const Jn = R ? R({
    height: ie === "player-size" ? zt.height : G.height,
    width: ie === "player-size" ? zt.width : G.width,
    isBuffering: pt
  }) : null;
  if (Jn === void 0)
    throw new TypeError("renderPoster() must return a React element, but undefined was returned");
  const Sn = Jn && [
    D && !fe.isPlaying() && !$e,
    L && fe.isLastFrame && !fe.isPlaying(),
    I && !fe.hasPlayed && !fe.isPlaying(),
    M && pt && fe.isPlaying(),
    P && pt && !fe.isPlaying()
  ].some(Boolean), { left: ai, top: kr, width: Nl, height: Pr, ...Rr } = Er, Xn = /* @__PURE__ */ E.jsxs(E.Fragment, {
    children: [
      /* @__PURE__ */ E.jsxs("div", {
        style: Er,
        onPointerDown: h ? Yn : void 0,
        onDoubleClick: m ? Gn : void 0,
        children: [
          /* @__PURE__ */ E.jsxs("div", {
            style: Ws,
            className: bl(B),
            children: [
              Sr ? /* @__PURE__ */ E.jsx(Pp, {
                onError: uo,
                errorFallback: w,
                children: /* @__PURE__ */ E.jsx(pe.CurrentScaleContext.Provider, {
                  value: co,
                  children: /* @__PURE__ */ E.jsx(Sr, {
                    ...(oe == null ? void 0 : oe.props) ?? {},
                    ...f ?? {}
                  })
                })
              }) : null,
              Sn && ie === "composition-size" ? /* @__PURE__ */ E.jsx("div", {
                style: {
                  ...Rr,
                  width: G.width,
                  height: G.height
                },
                onPointerDown: h ? Yn : void 0,
                onDoubleClick: m ? Gn : void 0,
                children: Jn
              }) : null
            ]
          }),
          /* @__PURE__ */ E.jsx(d0, {})
        ]
      }),
      Sn && ie === "player-size" ? /* @__PURE__ */ E.jsx("div", {
        style: Er,
        onPointerDown: h ? Yn : void 0,
        onDoubleClick: m ? Gn : void 0,
        children: Jn
      }) : null,
      n ? /* @__PURE__ */ E.jsx(H0, {
        fps: G.fps,
        playing: fe.playing,
        toggle: fe.toggle,
        durationInFrames: G.durationInFrames,
        containerRef: ne,
        onFullscreenButtonClick: ao,
        isFullscreen: Ye,
        allowFullscreen: d,
        showVolumeControls: p,
        onExitFullscreenButtonClick: lo,
        spaceKeyToPlayOrPause: g,
        onSeekEnd: ii,
        onSeekStart: wn,
        inFrame: _,
        outFrame: $,
        initiallyShowControls: A,
        canvasSize: de,
        renderFullscreenButton: U,
        renderPlayPauseButton: H,
        alwaysShowControls: ee,
        showPlaybackRateControl: re,
        buffering: pt,
        hideControlsWhenPointerDoesntMove: W,
        onDoubleClick: m ? Gn : void 0,
        onPointerDown: h ? Yn : void 0,
        renderMuteButton: K,
        renderVolumeSlider: Q,
        renderCustomControls: q
      }) : null
    ]
  });
  return T || Rp && !G0 ? /* @__PURE__ */ E.jsx("div", {
    ref: ne,
    style: zt,
    className: k,
    children: Xn
  }) : /* @__PURE__ */ E.jsx("div", {
    ref: ne,
    style: zt,
    className: k,
    children: /* @__PURE__ */ E.jsx(c.Suspense, {
      fallback: ui,
      children: Xn
    })
  });
}, X0 = c.forwardRef(J0), Tp = "remotion.volumePreference", Z0 = (n, i, s) => {
  if (!(typeof window > "u"))
    try {
      window.localStorage.setItem(s ?? Tp, String(n));
    } catch (a) {
      pe.Log.error({ logLevel: i, tag: null }, "Could not persist volume", a);
    }
}, q0 = (n) => {
  if (typeof window > "u")
    return 1;
  try {
    const i = window.localStorage.getItem(n ?? Tp);
    return i ? Number(i) : 1;
  } catch {
    return 1;
  }
}, Il = "player-comp", bp = ({
  children: n,
  timelineContext: i,
  playbackRateContext: s,
  fps: a,
  compositionHeight: d,
  compositionWidth: f,
  durationInFrames: h,
  component: p,
  numberOfSharedAudioTags: m,
  initiallyMuted: g,
  logLevel: w,
  audioLatencyHint: y,
  volumePersistenceKey: x,
  initialVolume: R,
  inputProps: k,
  audioEnabled: S
}) => {
  const I = R === void 0, L = c.useMemo(() => ({
    compositions: [
      {
        component: p,
        durationInFrames: h,
        height: d,
        width: f,
        fps: a,
        id: Il,
        nonce: [[0, 777]],
        folderName: null,
        parentFolderName: null,
        schema: null,
        calculateMetadata: null,
        stack: null
      }
    ],
    folders: [],
    currentCompositionMetadata: {
      defaultCodec: null,
      defaultOutName: null,
      defaultPixelFormat: null,
      defaultProResProfile: null,
      defaultSampleRate: null,
      defaultVideoImageFormat: null,
      durationInFrames: h,
      fps: a,
      height: d,
      width: f,
      props: k
    },
    canvasContent: { type: "composition", compositionId: "player-comp" }
  }), [
    p,
    h,
    d,
    f,
    a,
    k
  ]), [D, M] = c.useState(() => g), [P, _] = c.useState(() => I ? q0(x ?? null) : R), $ = c.useMemo(() => ({
    mediaMuted: D,
    mediaVolume: P
  }), [D, P]), A = c.useCallback((Q) => {
    _(Q), I && Z0(Q, w, x ?? null);
  }, [I, w, x]), U = c.useMemo(() => ({
    setMediaMuted: M,
    setMediaVolume: A
  }), [A]), H = c.useMemo(() => ({
    logLevel: w,
    mountTime: Date.now()
  }), [w]), K = c.useMemo(() => ({
    isPlayer: !0,
    isRendering: !1,
    isStudio: !1,
    isClientSideRendering: !1,
    isReadOnlyStudio: !1
  }), []);
  return /* @__PURE__ */ E.jsx(pe.RemotionEnvironmentContext.Provider, {
    value: K,
    children: /* @__PURE__ */ E.jsx(pe.LogLevelContext.Provider, {
      value: H,
      children: /* @__PURE__ */ E.jsx(pe.CanUseRemotionHooksProvider, {
        children: /* @__PURE__ */ E.jsx(pe.AbsoluteTimeContext.Provider, {
          value: i,
          children: /* @__PURE__ */ E.jsx(pe.PlaybackRateContext.Provider, {
            value: s,
            children: /* @__PURE__ */ E.jsx(pe.TimelineContext.Provider, {
              value: i,
              children: /* @__PURE__ */ E.jsx(pe.CompositionManager.Provider, {
                value: L,
                children: /* @__PURE__ */ E.jsx(pe.PrefetchProvider, {
                  children: /* @__PURE__ */ E.jsx(pe.DurationsContextProvider, {
                    children: /* @__PURE__ */ E.jsx(pe.MediaVolumeContext.Provider, {
                      value: $,
                      children: /* @__PURE__ */ E.jsx(pe.SetMediaVolumeContext.Provider, {
                        value: U,
                        children: /* @__PURE__ */ E.jsx(pe.BufferingProvider, {
                          children: /* @__PURE__ */ E.jsx(pe.SharedAudioContextProvider, {
                            audioLatencyHint: y,
                            audioEnabled: S,
                            children: /* @__PURE__ */ E.jsx(pe.SharedAudioTagsContextProvider, {
                              numberOfAudioTags: m,
                              children: n
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  });
}, Jf = !1, e1 = (n, i) => {
  n || Jf || (Jf = !0, pe.Log.warn({ logLevel: i, tag: null }, "Note: Some companies are required to obtain a license to use Remotion. See: https://remotion.dev/license\nPass the `acknowledgeRemotionLicense` prop to `<Player />` function to make this message disappear."));
}, Xf = (n, i) => {
  if (typeof n > "u" || n === null)
    return n ?? null;
  if (typeof n != "number")
    throw new TypeError(`"${i}" must be a number, but is ${JSON.stringify(n)}`);
  if (Number.isNaN(n))
    throw new TypeError(`"${i}" must not be NaN, but is ${JSON.stringify(n)}`);
  if (!Number.isFinite(n))
    throw new TypeError(`"${i}" must be finite, but is ${JSON.stringify(n)}`);
  if (n % 1 !== 0)
    throw new TypeError(`"${i}" must be an integer, but is ${JSON.stringify(n)}`);
  return n;
}, t1 = ({
  inFrame: n,
  durationInFrames: i,
  outFrame: s
}) => {
  const a = Xf(n, "inFrame"), d = Xf(s, "outFrame");
  if (!(a === null && d === null)) {
    if (a !== null && a > i - 1)
      throw new Error("inFrame must be less than (durationInFrames - 1), but is " + a);
    if (d !== null && d > i - 1)
      throw new Error("outFrame must be less than (durationInFrames - 1), but is " + d);
    if (a !== null && a < 0)
      throw new Error("inFrame must be greater than 0, but is " + a);
    if (d !== null && d <= 0)
      throw new Error(`outFrame must be greater than 0, but is ${d}. If you want to render a single frame, use <Thumbnail /> instead.`);
    if (d !== null && a !== null && d <= a)
      throw new Error("outFrame must be greater than inFrame, but is " + d + " <= " + a);
  }
}, n1 = ({
  initialFrame: n,
  durationInFrames: i
}) => {
  if (typeof i != "number")
    throw new Error(`\`durationInFrames\` must be a number, but is ${JSON.stringify(i)}`);
  if (!(typeof n > "u")) {
    if (typeof n != "number")
      throw new Error(`\`initialFrame\` must be a number, but is ${JSON.stringify(n)}`);
    if (Number.isNaN(n))
      throw new Error("`initialFrame` must be a number, but is NaN");
    if (!Number.isFinite(n))
      throw new Error("`initialFrame` must be a number, but is Infinity");
    if (n % 1 !== 0)
      throw new Error(`\`initialFrame\` must be an integer, but is ${JSON.stringify(n)}`);
    if (n > i - 1)
      throw new Error(`\`initialFrame\` must be less or equal than \`durationInFrames - 1\`, but is ${JSON.stringify(n)}`);
  }
}, r1 = (n) => {
  if (n !== void 0) {
    if (n > 10)
      throw new Error(`The highest possible playback rate is 10. You passed: ${n}`);
    if (n < -10)
      throw new Error(`The lowest possible playback rate is -10. You passed: ${n}`);
    if (n === 0)
      throw new Error("A playback rate of 0 is not supported.");
  }
}, o1 = Us.validateFps, Zf = Us.validateDimension, i1 = Us.validateDurationInFrames, s1 = Us.validateDefaultAndInputProps, u1 = (n) => "component" in n ? n.component : null, a1 = ({
  durationInFrames: n,
  compositionHeight: i,
  compositionWidth: s,
  fps: a,
  inputProps: d,
  style: f,
  controls: h = !1,
  loop: p = !1,
  autoPlay: m = !1,
  showVolumeControls: g = !0,
  allowFullscreen: w = !0,
  clickToPlay: y,
  doubleClickToFullscreen: x = !1,
  spaceKeyToPlayOrPause: R = !0,
  moveToBeginningWhenEnded: k = !0,
  numberOfSharedAudioTags: S = 5,
  errorFallback: I = () => "⚠️",
  playbackRate: L = 1,
  renderLoading: D,
  className: M,
  showPosterWhenUnplayed: P,
  showPosterWhenEnded: _,
  showPosterWhenPaused: $,
  showPosterWhenBuffering: A,
  showPosterWhenBufferingAndPaused: U,
  initialFrame: H,
  renderPoster: K,
  inFrame: Q,
  outFrame: q,
  initiallyShowControls: ee,
  renderFullscreenButton: re,
  renderPlayPauseButton: ie,
  renderVolumeSlider: ue,
  renderCustomControls: W,
  alwaysShowControls: F = !1,
  initiallyMuted: J = !1,
  showPlaybackRateControl: B = !1,
  posterFillMode: T = "player-size",
  bufferStateDelayInMilliseconds: O,
  hideControlsWhenPointerDoesntMove: G = !0,
  overflowVisible: oe = !1,
  renderMuteButton: ne,
  browserMediaControlsBehavior: de,
  overrideInternalClassName: he,
  logLevel: ve = "info",
  noSuspense: Se,
  acknowledgeRemotionLicense: Re,
  audioLatencyHint: Ye = "playback",
  volumePersistenceKey: ze,
  initialVolume: $e,
  ...at
}, Ce) => {
  if (typeof window < "u" && (window.remotion_isPlayer = !0), at.defaultProps !== void 0)
    throw new Error("The <Player /> component does not accept `defaultProps`, but some were passed. Use `inputProps` instead.");
  const fe = u1(at);
  if ((fe == null ? void 0 : fe.type) === Ba)
    throw new TypeError("'component' should not be an instance of <Composition/>. Pass the React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.");
  if (fe === Ba)
    throw new TypeError("'component' must not be the 'Composition' component. Pass your own React component directly, and set the duration, fps and dimensions as separate props. See https://www.remotion.dev/docs/player/examples for an example.");
  c.useState(() => e1(!!Re, ve));
  const dt = pe.useLazyComponent({
    compProps: at,
    componentName: "Player",
    noSuspense: !!Se
  });
  n1({ initialFrame: H, durationInFrames: n });
  const [nt, Ft] = c.useState(() => ({
    [Il]: H ?? 0
  })), [ft, Et] = c.useState(!1), [xt] = c.useState("player-comp"), Mt = c.useRef(null), Qn = c.useRef([]), mt = c.useRef(!1), [Ue, on] = c.useState(L);
  if (typeof i != "number")
    throw new TypeError(`'compositionHeight' must be a number but got '${typeof i}' instead`);
  if (typeof s != "number")
    throw new TypeError(`'compositionWidth' must be a number but got '${typeof s}' instead`);
  if (Zf(i, "compositionHeight", "of the <Player /> component"), Zf(s, "compositionWidth", "of the <Player /> component"), i1(n, {
    component: "of the <Player/> component",
    allowFloats: !1
  }), o1(a, "as a prop of the <Player/> component", !1), s1(d, "inputProps", null), t1({
    durationInFrames: n,
    inFrame: Q,
    outFrame: q
  }), typeof h != "boolean" && typeof h < "u")
    throw new TypeError(`'controls' must be a boolean or undefined but got '${typeof h}' instead`);
  if (typeof m != "boolean" && typeof m < "u")
    throw new TypeError(`'autoPlay' must be a boolean or undefined but got '${typeof m}' instead`);
  if (typeof p != "boolean" && typeof p < "u")
    throw new TypeError(`'loop' must be a boolean or undefined but got '${typeof p}' instead`);
  if (typeof x != "boolean" && typeof x < "u")
    throw new TypeError(`'doubleClickToFullscreen' must be a boolean or undefined but got '${typeof x}' instead`);
  if (typeof g != "boolean" && typeof g < "u")
    throw new TypeError(`'showVolumeControls' must be a boolean or undefined but got '${typeof g}' instead`);
  if (typeof w != "boolean" && typeof w < "u")
    throw new TypeError(`'allowFullscreen' must be a boolean or undefined but got '${typeof w}' instead`);
  if (typeof y != "boolean" && typeof y < "u")
    throw new TypeError(`'clickToPlay' must be a boolean or undefined but got '${typeof y}' instead`);
  if (typeof R != "boolean" && typeof R < "u")
    throw new TypeError(`'spaceKeyToPlayOrPause' must be a boolean or undefined but got '${typeof R}' instead`);
  if (typeof $e < "u" && typeof $e != "number")
    throw new TypeError(`'initialVolume' must be a number or undefined but got '${typeof $e}' instead`);
  if (typeof $e == "number" && (!Number.isFinite($e) || Number.isNaN($e) || $e < 0 || $e > 1))
    throw new TypeError(`'initialVolume' must be between 0 and 1 but got '${$e}' instead`);
  if (typeof S != "number" || S % 1 !== 0 || !Number.isFinite(S) || Number.isNaN(S) || S < 0)
    throw new TypeError(`'numberOfSharedAudioTags' must be an integer but got '${S}' instead`);
  r1(Ue), c.useEffect(() => {
    on(L);
  }, [L]), c.useImperativeHandle(Ce, () => Mt.current, []), c.useState(() => {
    pe.playbackLogging({
      logLevel: ve,
      message: `[player] Mounting <Player>. User agent = ${typeof navigator > "u" ? "server" : navigator.userAgent}`,
      tag: "player",
      mountTime: Date.now()
    });
  });
  const sn = c.useMemo(() => ({
    frame: nt,
    playing: ft,
    rootId: xt,
    imperativePlaying: mt,
    audioAndVideoTags: Qn
  }), [nt, ft, xt]), gn = c.useMemo(() => ({
    playbackRate: Ue,
    setPlaybackRate: on
  }), [Ue]), pt = c.useMemo(() => ({
    setFrame: Ft,
    setPlaying: Et
  }), [Ft]);
  typeof window < "u" && c.useLayoutEffect(() => {
    pe.CSSUtils.injectCSS(pe.CSSUtils.makeDefaultPreviewCSS(`.${bl(he)}`, "#fff"));
  }, [he]);
  const Ct = c.useMemo(() => d ?? {}, [d]), Sr = c.useMemo(() => de ?? {
    mode: "prevent-media-session"
  }, [de]);
  return /* @__PURE__ */ E.jsx(pe.IsPlayerContextProvider, {
    children: /* @__PURE__ */ E.jsx(bp, {
      timelineContext: sn,
      playbackRateContext: gn,
      component: dt,
      compositionHeight: i,
      compositionWidth: s,
      durationInFrames: n,
      fps: a,
      numberOfSharedAudioTags: S,
      initiallyMuted: J,
      logLevel: ve,
      audioLatencyHint: Ye,
      volumePersistenceKey: ze,
      initialVolume: $e,
      inputProps: Ct,
      audioEnabled: !0,
      children: /* @__PURE__ */ E.jsx(pe.SetTimelineContext.Provider, {
        value: pt,
        children: /* @__PURE__ */ E.jsx(t0, {
          currentPlaybackRate: Ue,
          children: /* @__PURE__ */ E.jsx(X0, {
            ref: Mt,
            posterFillMode: T,
            renderLoading: D,
            autoPlay: !!m,
            loop: !!p,
            controls: !!h,
            errorFallback: I,
            style: f,
            inputProps: Ct,
            allowFullscreen: !!w,
            moveToBeginningWhenEnded: !!k,
            clickToPlay: typeof y == "boolean" ? y : !!h,
            showVolumeControls: !!g,
            doubleClickToFullscreen: !!x,
            spaceKeyToPlayOrPause: !!R,
            playbackRate: Ue,
            className: M ?? void 0,
            showPosterWhenUnplayed: !!P,
            showPosterWhenEnded: !!_,
            showPosterWhenPaused: !!$,
            showPosterWhenBuffering: !!A,
            showPosterWhenBufferingAndPaused: !!U,
            renderPoster: K,
            inFrame: Q ?? null,
            outFrame: q ?? null,
            initiallyShowControls: ee ?? !0,
            renderFullscreen: re ?? null,
            renderPlayPauseButton: ie ?? null,
            renderMuteButton: ne ?? null,
            renderVolumeSlider: ue ?? null,
            renderCustomControls: W ?? null,
            alwaysShowControls: F,
            showPlaybackRateControl: B,
            bufferStateDelayInMilliseconds: O ?? 300,
            hideControlsWhenPointerDoesntMove: G,
            overflowVisible: oe,
            browserMediaControlsBehavior: Sr,
            overrideInternalClassName: he ?? void 0,
            noSuspense: !!Se
          })
        })
      })
    })
  });
}, l1 = c.forwardRef, Ip = l1(a1), c1 = () => {
  const n = c.useContext(Cp);
  if (!n)
    throw new TypeError("Expected Player event emitter context");
  return c.useMemo(() => ({
    emitter: n
  }), [n]);
}, Za = ge.version.split(".")[0];
if (Za === "0")
  throw new Error(`Version ${Za} of "react" is not supported by Remotion`);
var d1 = parseInt(Za, 10) >= 18, f1 = ({
  style: n,
  inputProps: i,
  errorFallback: s,
  renderLoading: a,
  className: d,
  overflowVisible: f,
  noSuspense: h,
  overrideInternalClassName: p
}, m) => {
  const g = pe.useUnsafeVideoConfig(), w = pe.useVideo(), y = c.useRef(null), x = Tl(y, {
    triggerOnWindowResize: !1,
    shouldApplyCssTransforms: !1
  }), R = c.useMemo(() => !g || !x ? null : yp({
    canvasSize: x,
    compositionHeight: g.height,
    compositionWidth: g.width,
    previewSize: "auto"
  }), [x, g]), k = (R == null ? void 0 : R.scale) ?? 1, S = c1();
  kp(S.emitter), c.useImperativeHandle(m, () => {
    const U = {
      getContainerNode: () => y.current,
      getScale: () => k
    };
    return Object.assign(S.emitter, U);
  }, [k, S.emitter]);
  const I = w ? w.component : null, L = c.useMemo(() => wp({
    config: g,
    style: n,
    canvasSize: x,
    overflowVisible: f,
    layout: R
  }), [x, g, R, f, n]), D = c.useMemo(() => Ep({ config: g, layout: R, scale: k, overflowVisible: f }), [g, R, f, k]), M = c.useMemo(() => Sp({
    config: g,
    layout: R,
    scale: k,
    overflowVisible: f
  }), [g, R, f, k]), P = c.useCallback((U) => {
    S.emitter.dispatchError(U);
  }, [S.emitter]), _ = c.useMemo(() => a ? a({
    height: L.height,
    width: L.width,
    isBuffering: !1
  }) : null, [L.height, L.width, a]), $ = c.useMemo(() => ({
    type: "scale",
    scale: k
  }), [k]);
  if (!g)
    return null;
  const A = /* @__PURE__ */ E.jsx("div", {
    style: D,
    children: /* @__PURE__ */ E.jsx("div", {
      style: M,
      className: bl(p),
      children: I ? /* @__PURE__ */ E.jsx(Pp, {
        onError: P,
        errorFallback: s,
        children: /* @__PURE__ */ E.jsx(pe.CurrentScaleContext.Provider, {
          value: $,
          children: /* @__PURE__ */ E.jsx(I, {
            ...(w == null ? void 0 : w.props) ?? {},
            ...i ?? {}
          })
        })
      }) : null
    })
  });
  return h || Rp && !d1 ? /* @__PURE__ */ E.jsx("div", {
    ref: y,
    style: L,
    className: d,
    children: A
  }) : /* @__PURE__ */ E.jsx("div", {
    ref: y,
    style: L,
    className: d,
    children: /* @__PURE__ */ E.jsx(c.Suspense, {
      fallback: _,
      children: A
    })
  });
}, m1 = c.forwardRef(f1), p1 = ({
  frameToDisplay: n,
  style: i,
  inputProps: s,
  compositionHeight: a,
  compositionWidth: d,
  durationInFrames: f,
  fps: h,
  className: p,
  errorFallback: m = () => "⚠️",
  renderLoading: g,
  overflowVisible: w = !1,
  overrideInternalClassName: y,
  logLevel: x = "info",
  noSuspense: R,
  ...k
}, S) => {
  typeof window < "u" && c.useLayoutEffect(() => {
    window.remotion_isPlayer = !0;
  }, []);
  const [I] = c.useState(() => String(hr(null))), L = c.useRef(null), D = c.useMemo(() => ({
    playing: !1,
    frame: {
      [Il]: n
    },
    rootId: I,
    imperativePlaying: {
      current: !1
    },
    audioAndVideoTags: { current: [] }
  }), [n, I]), M = c.useMemo(() => ({
    playbackRate: 1,
    setPlaybackRate: () => {
      throw new Error("thumbnail");
    }
  }), []);
  c.useImperativeHandle(S, () => L.current, []);
  const P = pe.useLazyComponent({
    compProps: k,
    componentName: "Thumbnail",
    noSuspense: !!R
  }), [_] = c.useState(() => new e0()), $ = c.useMemo(() => s ?? {}, [s]);
  return /* @__PURE__ */ E.jsx(pe.IsPlayerContextProvider, {
    children: /* @__PURE__ */ E.jsx(bp, {
      timelineContext: D,
      playbackRateContext: M,
      component: P,
      compositionHeight: a,
      compositionWidth: d,
      durationInFrames: f,
      fps: h,
      numberOfSharedAudioTags: 0,
      initiallyMuted: !0,
      logLevel: x,
      audioLatencyHint: "playback",
      inputProps: $,
      audioEnabled: !1,
      children: /* @__PURE__ */ E.jsx(Cp.Provider, {
        value: _,
        children: /* @__PURE__ */ E.jsx(m1, {
          ref: L,
          className: p,
          errorFallback: m,
          inputProps: $,
          renderLoading: g,
          style: i,
          overflowVisible: w,
          overrideInternalClassName: y,
          noSuspense: !!R
        })
      })
    })
  });
}, h1 = c.forwardRef;
h1(p1);
function v1(n) {
  if (n == null) return null;
  if (Array.isArray(n) && n.length && typeof n[0] == "number")
    return n.map(Number);
  if (Array.isArray(n) && n.length && typeof n[0] == "object") {
    const i = [];
    for (const s of n)
      i.push(Number(s.x ?? s.X ?? 0), Number(s.y ?? s.Y ?? 0));
    return i.length >= 6 ? i : null;
  }
  return null;
}
function g1(n, i) {
  if (!n) return null;
  if (/^(data:|blob:|https?:)/.test(n)) return n;
  const s = n.replace(/^assets\//, "");
  return `${i.replace(/\/$/, "")}/${s}`;
}
function y1(n) {
  return {
    position: "absolute",
    boxSizing: "border-box",
    left: n.x ?? 0,
    top: n.y ?? 0,
    width: n.width ?? 100,
    height: n.height ?? 40,
    zIndex: n.zIndex ?? 0,
    opacity: n.opacity ?? 1
  };
}
function w1(n) {
  return n.gradientFrom && n.gradientTo ? `linear-gradient(${n.gradientAngle ?? 90}deg, ${n.gradientFrom}, ${n.gradientTo})` : n.fill ?? n.backgroundColor ?? "transparent";
}
function S1({ node: n, assetsBaseUrl: i }) {
  const s = y1(n);
  if ((/* @__PURE__ */ new Set(["image", "logo", "background"])).has(n.type) && n.src) {
    const p = g1(n.src, i);
    let m = n.objectFit === "contain" ? "contain" : "cover";
    return (n.role === "product" || n.id === "product" || n.role === "logo" || n.id === "logo") && (m = "contain"), /* @__PURE__ */ E.jsx(
      "img",
      {
        alt: n.id,
        src: p,
        style: { ...s, objectFit: m, objectPosition: "center" }
      }
    );
  }
  if (n.type === "rating") {
    const p = Math.max(0, Math.min(5, Number(n.ratingValue ?? 5))), m = Math.min((n.height ?? 40) * 0.85, (n.width ?? 100) / 6), g = [];
    for (let w = 0; w < 5; w += 1) {
      const y = p >= w + 1 || p >= w + 0.5;
      g.push(
        /* @__PURE__ */ E.jsx("span", { style: { opacity: y ? 1 : 0.35 }, children: y ? "★" : "☆" }, w)
      );
    }
    return /* @__PURE__ */ E.jsx(
      "div",
      {
        style: {
          ...s,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          color: n.color ?? "#fff",
          fontSize: m,
          lineHeight: 1
        },
        children: g
      }
    );
  }
  if (n.type === "text") {
    const p = n.fontSize ?? 24, m = n.textAlign ?? "left";
    return /* @__PURE__ */ E.jsx(
      "div",
      {
        style: {
          ...s,
          color: n.color ?? "#000",
          fontSize: p,
          lineHeight: `${Math.ceil(p * 1.2)}px`,
          fontWeight: n.fontWeight === "bold" ? 700 : 400,
          fontFamily: n.fontFamily ?? "system-ui, sans-serif",
          textAlign: m,
          display: "flex",
          alignItems: "center",
          justifyContent: m === "center" ? "center" : m === "right" ? "flex-end" : "flex-start",
          whiteSpace: "pre-wrap",
          overflow: "hidden",
          wordBreak: "break-word",
          boxShadow: n.boxShadow
        },
        children: n.text ?? ""
      }
    );
  }
  if (n.type === "button")
    return /* @__PURE__ */ E.jsx(
      "div",
      {
        style: {
          ...s,
          background: n.backgroundColor ?? "#e11",
          borderRadius: n.borderRadius ?? 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: n.color ?? "#fff",
          fontSize: n.fontSize ?? 18,
          fontWeight: n.fontWeight === "bold" ? 700 : 500,
          boxShadow: n.boxShadow
        },
        children: n.text ?? ""
      }
    );
  const d = w1(n), f = n.stroke && n.strokeWidth ? `${n.strokeWidth}px solid ${n.stroke}` : void 0;
  if (n.shape === "ellipse")
    return /* @__PURE__ */ E.jsx(
      "div",
      {
        style: {
          ...s,
          background: d,
          borderRadius: "50%",
          border: f,
          boxShadow: n.boxShadow
        }
      }
    );
  const h = v1(n.points);
  if (h && h.length >= 6) {
    const p = [];
    for (let m = 0; m < h.length; m += 2)
      p.push(`${h[m]}px ${h[m + 1]}px`);
    return /* @__PURE__ */ E.jsx(
      "div",
      {
        style: {
          ...s,
          background: d,
          clipPath: `polygon(${p.join(", ")})`,
          border: f,
          boxShadow: n.boxShadow
        }
      }
    );
  }
  return /* @__PURE__ */ E.jsx(
    "div",
    {
      style: {
        ...s,
        background: d,
        borderRadius: n.borderRadius ?? 0,
        border: f,
        boxShadow: n.boxShadow
      }
    }
  );
}
function Np({ tree: n, assetsBaseUrl: i = "" }) {
  if (!n) return null;
  const s = [...n.children ?? []].sort(
    (a, d) => (a.zIndex ?? 0) - (d.zIndex ?? 0)
  );
  return /* @__PURE__ */ E.jsx(
    nl,
    {
      style: {
        width: n.width,
        height: n.height,
        background: n.backgroundColor ?? "#ffffff",
        overflow: "hidden",
        position: "relative"
      },
      children: /* @__PURE__ */ E.jsx(
        "div",
        {
          style: {
            position: "relative",
            width: n.width,
            height: n.height,
            background: n.backgroundColor ?? "#ffffff"
          },
          children: s.map((a) => /* @__PURE__ */ E.jsx(S1, { node: a, assetsBaseUrl: i }, a.id))
        }
      )
    }
  );
}
function E1({ design: n, assetsBaseUrl: i }) {
  const s = n.tree, a = (s == null ? void 0 : s.width) ?? 1080, d = (s == null ? void 0 : s.height) ?? 1080, f = n.previewUrl || "", h = `${(n.name || n.id || "design").replace(/[^a-z0-9_-]+/gi, "_")}.png`;
  return /* @__PURE__ */ E.jsxs("article", { className: "design-card design-card-lg", "data-design-id": n.id, children: [
    /* @__PURE__ */ E.jsx("h4", { className: "design-card-title", children: n.name || n.id }),
    /* @__PURE__ */ E.jsx("div", { className: "design-player-wrap design-player-wrap-lg", children: /* @__PURE__ */ E.jsx(
      Ip,
      {
        component: Np,
        inputProps: { tree: s, assetsBaseUrl: i },
        durationInFrames: 1,
        fps: 30,
        compositionWidth: a,
        compositionHeight: d,
        style: { width: "100%", aspectRatio: `${a}/${d}` },
        controls: !1,
        loop: !1,
        autoPlay: !1,
        clickToPlay: !1
      }
    ) }),
    /* @__PURE__ */ E.jsxs("div", { className: "design-card-actions", children: [
      f ? /* @__PURE__ */ E.jsx(
        "a",
        {
          className: "btn-link",
          href: f,
          download: h,
          target: "_blank",
          rel: "noopener",
          children: "Download PNG"
        }
      ) : null,
      /* @__PURE__ */ E.jsx(
        "button",
        {
          type: "button",
          className: "btn-link",
          "data-action": "customize-template",
          "data-design-id": n.id,
          "data-design-name": n.name || n.id,
          children: "Customize template"
        }
      ),
      /* @__PURE__ */ E.jsx(
        "button",
        {
          type: "button",
          className: "btn-link",
          "data-action": "view-tree",
          "data-design-id": n.id,
          "data-tree-url": n.treeUrl || "",
          "data-design-name": n.name || n.id,
          children: "View design tree"
        }
      )
    ] })
  ] });
}
function x1({ designs: n, assetsBaseUrl: i }) {
  return /* @__PURE__ */ E.jsx("div", { className: "design-grid-inner design-grid-inner-lg", children: n.map((s) => /* @__PURE__ */ E.jsx(E1, { design: s, assetsBaseUrl: i }, s.id)) });
}
function C1({ tree: n, assetsBaseUrl: i }) {
  if (!(n != null && n.width) || !(n != null && n.height)) return null;
  const s = n.width, a = n.height;
  return /* @__PURE__ */ E.jsx("div", { className: "template-live-preview-inner", children: /* @__PURE__ */ E.jsx(
    Ip,
    {
      component: Np,
      inputProps: { tree: n, assetsBaseUrl: i },
      durationInFrames: 1,
      fps: 30,
      compositionWidth: s,
      compositionHeight: a,
      style: {
        width: "100%",
        maxWidth: "100%",
        height: "auto",
        aspectRatio: `${s} / ${a}`,
        display: "block"
      },
      controls: !1,
      loop: !1,
      autoPlay: !1,
      clickToPlay: !1
    }
  ) });
}
window.mountDesignPreviews = function(i, s, a) {
  em.createRoot(i).render(/* @__PURE__ */ E.jsx(x1, { designs: s, assetsBaseUrl: a }));
};
window.mountTemplateLivePreview = function(i, s, a) {
  const d = em.createRoot(i), f = (h, p) => {
    d.render(/* @__PURE__ */ E.jsx(C1, { tree: h, assetsBaseUrl: p || a }));
  };
  return f(s, a), {
    update(h, p) {
      f(h, p);
    },
    unmount() {
      d.unmount();
    }
  };
};
export {
  x1 as DesignPreviewGrid,
  Np as DesignTreeFrame,
  S1 as DesignTreeNode,
  C1 as TemplateLivePreview
};
