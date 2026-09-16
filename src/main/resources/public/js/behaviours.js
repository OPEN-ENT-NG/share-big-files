/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var entcore_1 = __webpack_require__(2);
	var entcore_toolkit_1 = __webpack_require__(4);
	var sharebigfilesBehaviours = {
	    resources: {
	        read: {
	            right: "fr-openent-sharebigfiles-controllers-ShareBigFilesController|listRights"
	        },
	        contrib: {
	            right: "fr-openent-sharebigfiles-controllers-ShareBigFilesController|update"
	        },
	        manage: {
	            right: "fr-openent-sharebigfiles-controllers-ShareBigFilesController|addRights"
	        }
	    },
	    workflow: {
	        create: "fr.openent.sharebigfiles.controllers.ShareBigFilesController|create"
	    }
	};
	entcore_1.Behaviours.register('sharebigfiles', {
	    behaviours: sharebigfilesBehaviours,
	    /**
	     * Allows to set rights for behaviours.
	     */
	    resource: function (resource) {
	        var rightsContainer = resource;
	        if (!resource.myRights) {
	            resource.myRights = {};
	        }
	        for (var behaviour in sharebigfilesBehaviours.resources) {
	            if (entcore_1.model.me.hasRight(rightsContainer, sharebigfilesBehaviours.resources[behaviour]) || entcore_1.model.me.userId === resource.owner.userId || entcore_1.model.me.userId === rightsContainer.owner.userId) {
	                if (resource.myRights[behaviour] !== undefined) {
	                    resource.myRights[behaviour] = resource.myRights[behaviour] && sharebigfilesBehaviours.resources[behaviour];
	                }
	                else {
	                    resource.myRights[behaviour] = sharebigfilesBehaviours.resources[behaviour];
	                }
	            }
	        }
	        return resource;
	    },
	    /**
	     * Allows to load workflow rights according to rights defined by the
	     * administrator for the current user in the console.
	     */
	    workflow: function () {
	        var workflow = {};
	        var sharebigfilesWorkflow = sharebigfilesBehaviours.workflow;
	        for (var prop in sharebigfilesWorkflow) {
	            if (entcore_1.model.me.hasWorkflow(sharebigfilesWorkflow[prop])) {
	                workflow[prop] = true;
	            }
	        }
	        return workflow;
	    },
	    /**
	     * Allows to define all rights to display in the share windows. Names are
	     * defined in the server part with
	     * <code>@SecuredAction(value = "xxxx.read", type = ActionType.RESOURCE)</code>
	     * without the prefix <code>xxx</code>.
	     */
	    resourceRights: function () {
	        return ['read', 'contrib', 'manager'];
	    },
	    /**
	     * Function required by the "linker" component to display the collaborative editor info
	     */
	    loadResources: function (callback) {
	        entcore_toolkit_1.http.get('/sharebigfiles/list').then(function (results) {
	            this.resources = entcore_1._.map(results.data, function (itemResult) {
	                return {
	                    title: itemResult.fileNameLabel,
	                    ownerName: itemResult.owner.displayName,
	                    owner: itemResult.owner.userId,
	                    icon: '/sharebigfiles/public/img/APPNAME-large.png',
	                    path: '/sharebigfiles#/view/' + itemResult._id,
	                    id: itemResult._id
	                };
	            });
	            if (typeof callback === 'function') {
	                callback(this.resources);
	            }
	        }.bind(this));
	    }
	});


/***/ }),
/* 1 */,
/* 2 */
/***/ (function(module, exports) {

	module.exports = entcore;

/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(5));

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, setImmediate, process) {var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getOwnPropSymbols = Object.getOwnPropertySymbols;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __propIsEnum = Object.prototype.propertyIsEnumerable;
	var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
	var __spreadValues = (a, b) => {
	  for (var prop in b || (b = {}))
	    if (__hasOwnProp.call(b, prop))
	      __defNormalProp(a, prop, b[prop]);
	  if (__getOwnPropSymbols)
	    for (var prop of __getOwnPropSymbols(b)) {
	      if (__propIsEnum.call(b, prop))
	        __defNormalProp(a, prop, b[prop]);
	    }
	  return a;
	};
	var __export = (target, all3) => {
	  for (var name in all3)
	    __defProp(target, name, { get: all3[name], enumerable: true });
	};
	var __copyProps = (to, from, except, desc) => {
	  if (from && typeof from === "object" || typeof from === "function") {
	    for (let key of __getOwnPropNames(from))
	      if (!__hasOwnProp.call(to, key) && key !== except)
	        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
	  }
	  return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var __async = (__this, __arguments, generator) => {
	  return new Promise((resolve, reject) => {
	    var fulfilled = (value) => {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var rejected = (value) => {
	      try {
	        step(generator.throw(value));
	      } catch (e) {
	        reject(e);
	      }
	    };
	    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
	    step((generator = generator.apply(__this, __arguments)).next());
	  });
	};
	
	// src/index.ts
	var index_exports = {};
	__export(index_exports, {
	  AbstractCollection: () => AbstractCollection,
	  AbstractCrud: () => AbstractCrud,
	  AbstractModel: () => AbstractModel,
	  Autosave: () => Autosave,
	  Collection: () => Collection,
	  Crud: () => Crud,
	  Eventer: () => Eventer,
	  Mix: () => Mix,
	  Model: () => Model,
	  Provider: () => Provider,
	  Selection: () => Selection,
	  TypedArray: () => TypedArray,
	  http: () => http
	});
	module.exports = __toCommonJS(index_exports);
	
	// src/minicast.ts
	function mapToArray(map) {
	  var result = [];
	  map.forEach(function(item) {
	    result.push(item);
	  });
	  return result;
	}
	var Mix = class _Mix {
	  static extend(obj, mixin, casts) {
	    for (var property in mixin) {
	      let value = mixin[property];
	      if (casts && casts[property] && value) {
	        let castItem = casts[property];
	        let cast;
	        if (castItem instanceof Function) {
	          cast = {
	            type: castItem,
	            deps: []
	          };
	        } else {
	          cast = {
	            type: castItem.type,
	            single: castItem.single,
	            deps: castItem.deps ? castItem.deps : []
	          };
	        }
	        let doCast = (v) => {
	          let instance = new cast.type(...cast.deps);
	          if (instance.mixin)
	            instance.mixin(v);
	          else
	            _Mix.extend(instance, v);
	          return instance;
	        };
	        if (value instanceof Array && cast.single) {
	          obj[property] = [];
	          value.forEach((v) => {
	            obj[property].push(doCast(v));
	          });
	        } else {
	          obj[property] = doCast(value);
	        }
	      } else if (!value || typeof value !== "object" || value instanceof Array) {
	        obj[property] = value;
	      } else {
	        if (obj[property] instanceof TypedArray) {
	          obj[property].load(value);
	        } else {
	          if (!obj[property]) {
	            obj[property] = {};
	          }
	          this.extend(obj[property], value);
	        }
	      }
	    }
	    if (obj && obj.fromJSON) {
	      obj.fromJSON(mixin);
	    }
	  }
	  static castAs(className, obj, params = {}) {
	    var newObj = new className(params);
	    this.extend(newObj, obj);
	    return newObj;
	  }
	  static castArrayAs(className, arr, params = {}) {
	    var newArr = [];
	    arr.forEach((item) => {
	      newArr.push(
	        _Mix.castAs(className, item, params)
	      );
	    });
	    return newArr;
	  }
	};
	var TypedArray = class extends Array {
	  constructor(className, mixin = {}) {
	    super();
	    this.className = className;
	    this.mixin = mixin;
	  }
	  push(...items) {
	    items.forEach((item) => {
	      if (!(item instanceof this.className)) {
	        item = Mix.castAs(this.className, item);
	      }
	      for (var prop in this.mixin) {
	        item[prop] = this.mixin[prop];
	      }
	      Array.prototype.push.call(this, item);
	    });
	    return this.length;
	  }
	  load(data) {
	    data.forEach((item) => {
	      this.push(item);
	    });
	  }
	  asArray() {
	    return mapToArray(this);
	  }
	  toJSON() {
	    return mapToArray(this);
	  }
	};
	
	// src/eventer.ts
	var Eventer = class {
	  constructor() {
	    this.events = /* @__PURE__ */ new Map();
	  }
	  trigger(eventName, data) {
	    if (this.events[eventName]) {
	      this.events[eventName].forEach((f) => f(data));
	    }
	  }
	  on(eventName, cb) {
	    if (!this.events[eventName]) {
	      this.events[eventName] = [];
	    }
	    this.events[eventName].push(cb);
	  }
	  off(eventName, cb) {
	    if (!this.events[eventName]) {
	      return;
	    }
	    if (cb === void 0) {
	      this.events[eventName] = [];
	      return;
	    }
	    let index = this.events[eventName].indexOf(cb);
	    if (index !== -1) {
	      this.events[eventName].splice(index, 1);
	    }
	  }
	  once(eventName, cb) {
	    let callback = (data) => {
	      cb(data);
	      this.off(eventName, callback);
	    };
	    this.on(eventName, callback);
	  }
	};
	
	// src/selection.ts
	var Selection = class {
	  constructor(arr) {
	    this.arr = arr;
	    this.selectedElements = [];
	  }
	  get all() {
	    return this.arr;
	  }
	  set all(all3) {
	    this.arr = all3;
	  }
	  filter(filter2) {
	    return this.arr.filter(filter2);
	  }
	  push(item) {
	    this.arr.push(item);
	  }
	  addRange(arr) {
	    for (let i = 0; i < arr.length; i++) {
	      this.all.push(arr[i]);
	    }
	  }
	  get colLength() {
	    return this.arr.length;
	  }
	  get length() {
	    return this.selected.length;
	  }
	  forEach(func) {
	    this.arr.forEach(func);
	  }
	  selectAll() {
	    for (let i = 0; i < this.arr.length; i++) {
	      this.arr[i].selected = true;
	    }
	  }
	  select(filter2) {
	    for (let i = 0; i < this.arr.length; i++) {
	      this.arr[i].selected = filter2(this.arr[i]);
	    }
	  }
	  deselect(filter2) {
	    for (let i = 0; i < this.arr.length; i++) {
	      this.arr[i].selected = !filter2(this.arr[i]);
	    }
	  }
	  deselectAll() {
	    for (let i = 0; i < this.arr.length; i++) {
	      this.arr[i].selected = false;
	    }
	  }
	  removeSelection() {
	    let newArr = [];
	    for (let i = 0; i < this.arr.length; i++) {
	      if (!this.arr[i].selected) {
	        newArr.push(this.arr[i]);
	      }
	    }
	    this.arr.splice(0, this.arr.length);
	    for (let i = 0; i < newArr.length; i++) {
	      this.arr.push(newArr[i]);
	    }
	  }
	  updateSelected() {
	    for (let i = 0; i < this.arr.length; i++) {
	      let index = this.selectedElements.indexOf(this.arr[i]);
	      if (this.arr[i].selected && index === -1) {
	        this.selectedElements.push(this.arr[i]);
	      } else if (!this.arr[i].selected && index !== -1) {
	        this.selectedElements.splice(index, 1);
	      }
	    }
	    for (let i = 0; i < this.selectedElements.length; i++) {
	      let index = this.arr.indexOf(this.selectedElements[i]);
	      if (index === -1) {
	        this.selectedElements.splice(index, 1);
	      }
	    }
	  }
	  // a specific array is maintained to avoid references breaking all the time
	  get selected() {
	    this.updateSelected();
	    return this.selectedElements;
	  }
	};
	
	// src/crud/abstract.crud.ts
	var AbstractCrud = class {
	  constructor(api, model, initialCast, childrenCasts, customMixin) {
	    this.api = api;
	    this.model = model;
	    this.initialCast = initialCast;
	    this.childrenCasts = childrenCasts;
	    this.customMixin = customMixin;
	  }
	  parseApi(api, parameters) {
	    if (typeof api === "function") {
	      api = api();
	    }
	    return api.split(/(:[a-zA-Z0-9_.]+)/).map((fragment) => {
	      return fragment.charAt(0) === ":" ? parameters && parameters[fragment.substr(1)] || this.model[fragment.substr(1)] || this[fragment.substr(1)] || fragment : fragment;
	    }).join("");
	  }
	  defaultMixin(payload) {
	    if (payload instanceof Array && this.model instanceof Array) {
	      this.model = [];
	      let model = this.model;
	      payload.forEach((item) => {
	        let instance = {};
	        if (this.initialCast) {
	          if (this.initialCast instanceof Function) {
	            instance = new this.initialCast();
	          } else {
	            instance = new this.initialCast.type(...this.initialCast.deps);
	          }
	        }
	        Mix.extend(instance, item, this.childrenCasts);
	        model.push(instance);
	      });
	    } else {
	      Mix.extend(this.model, payload, this.childrenCasts);
	    }
	  }
	  create(item, opts = {}) {
	    if (!this.api.create) {
	      throw '[Crud][Api] "create" route is undefined';
	    }
	    return this.http.post(this.parseApi(this.api.create, item), item || this.model, opts).then((response) => {
	      if (this.model instanceof Array) {
	        this.model.push(item);
	      }
	      return response;
	    });
	  }
	  sync(opts = {}) {
	    if (!this.api.sync) {
	      throw '[Crud][Api] "sync" route is undefined';
	    }
	    return this.http.get(this.parseApi(this.api.sync), opts).then((response) => {
	      (this.customMixin || this.defaultMixin).bind(this)(response.data);
	      return response;
	    });
	  }
	  update(item, opts = {}) {
	    if (!this.api.update) {
	      throw '[Crud][Api] "update" route is undefined';
	    }
	    return this.http.put(this.parseApi(this.api.update, item), item || this.model, opts);
	  }
	  delete(item, opts = {}) {
	    if (!this.api.delete) {
	      throw '[Crud][Api] "delete" route is undefined';
	    }
	    return this.http.delete(this.parseApi(this.api.delete, item), opts).then((response) => {
	      if (this.model instanceof Array) {
	        const index = this.model.indexOf(item);
	        if (index !== -1) {
	          this.model.splice(this.model.indexOf(item), 1);
	        }
	      }
	      return response;
	    });
	  }
	};
	
	// node_modules/axios/lib/helpers/bind.js
	function bind(fn, thisArg) {
	  return function wrap() {
	    return fn.apply(thisArg, arguments);
	  };
	}
	
	// node_modules/axios/lib/utils.js
	var { toString } = Object.prototype;
	var { getPrototypeOf } = Object;
	var { iterator, toStringTag } = Symbol;
	var hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
	var isUnsafeObjectKey = (prop) => typeof prop === "string" && (prop === "__proto__" || prop === "constructor" || prop === "prototype");
	var isPrototypeBoundary = (obj, prototype2, source) => obj === Object.prototype || !source && prototype2 === null;
	var isSafeAndFullyMutable = (obj) => {
	  if (!Object.isExtensible(obj)) {
	    return false;
	  }
	  const props = Object.getOwnPropertyNames(obj);
	  if (Object.getOwnPropertySymbols) {
	    props.push(...Object.getOwnPropertySymbols(obj));
	  }
	  return props.every((prop) => {
	    if (isUnsafeObjectKey(prop)) {
	      return false;
	    }
	    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
	    return !!descriptor && descriptor.configurable && descriptor.writable === true;
	  });
	};
	var hasOwnInPrototypeChain = (thing, prop) => {
	  let obj = thing;
	  const seen = [];
	  while (obj != null) {
	    if (seen.indexOf(obj) !== -1) {
	      return false;
	    }
	    seen.push(obj);
	    const prototype2 = getPrototypeOf(obj);
	    if (isPrototypeBoundary(obj, prototype2, obj === thing)) {
	      return false;
	    }
	    if (hasOwnProperty(obj, prop)) {
	      return true;
	    }
	    obj = prototype2;
	  }
	  return false;
	};
	var getSafeProp = (obj, prop) => obj != null && hasOwnInPrototypeChain(obj, prop) ? obj[prop] : void 0;
	var toSafeFlatObject = (thing) => {
	  if (thing == null || typeof thing !== "object" && typeof thing !== "function") {
	    return thing;
	  }
	  const sourcePrototype = getPrototypeOf(thing);
	  if (sourcePrototype === null && isSafeAndFullyMutable(thing)) {
	    return thing;
	  }
	  const result = /* @__PURE__ */ Object.create(null);
	  const merged = /* @__PURE__ */ Object.create(null);
	  const seen = [];
	  let current = thing;
	  while (current != null) {
	    if (seen.indexOf(current) !== -1) {
	      break;
	    }
	    seen.push(current);
	    const prototype2 = current === thing ? sourcePrototype : getPrototypeOf(current);
	    if (isPrototypeBoundary(current, prototype2, current === thing)) {
	      break;
	    }
	    const props = Object.getOwnPropertyNames(current);
	    if (Object.getOwnPropertySymbols) {
	      props.push(...Object.getOwnPropertySymbols(current));
	    }
	    for (const prop of props) {
	      if (isUnsafeObjectKey(prop)) {
	        continue;
	      }
	      if (!hasOwnProperty(merged, prop)) {
	        result[prop] = thing[prop];
	        merged[prop] = true;
	      }
	    }
	    current = prototype2;
	  }
	  return result;
	};
	var kindOf = /* @__PURE__ */ ((cache) => (thing) => {
	  const str = toString.call(thing);
	  return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
	})(/* @__PURE__ */ Object.create(null));
	var kindOfTest = (type) => {
	  type = type.toLowerCase();
	  return (thing) => kindOf(thing) === type;
	};
	var typeOfTest = (type) => (thing) => typeof thing === type;
	var { isArray } = Array;
	var isUndefined = typeOfTest("undefined");
	function isBuffer(val) {
	  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
	}
	var isArrayBuffer = kindOfTest("ArrayBuffer");
	function isArrayBufferView(val) {
	  let result;
	  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = val && val.buffer && isArrayBuffer(val.buffer);
	  }
	  return result;
	}
	var isString = typeOfTest("string");
	var isFunction = typeOfTest("function");
	var isNumber = typeOfTest("number");
	var isObject = (thing) => thing !== null && typeof thing === "object";
	var isBoolean = (thing) => thing === true || thing === false;
	var isPlainObject = (val) => {
	  if (!isObject(val)) {
	    return false;
	  }
	  const prototype2 = getPrototypeOf(val);
	  return (prototype2 === null || prototype2 === Object.prototype || getPrototypeOf(prototype2) === null) && // Treat safe own/inherited Symbol.toStringTag or Symbol.iterator members as
	  // evidence the value is tagged/iterable, while ignoring members reachable
	  // only through shared or terminal prototype boundaries.
	  !hasOwnInPrototypeChain(val, toStringTag) && !hasOwnInPrototypeChain(val, iterator);
	};
	var isEmptyObject = (val) => {
	  if (!isObject(val) || isBuffer(val)) {
	    return false;
	  }
	  try {
	    return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
	  } catch (e) {
	    return false;
	  }
	};
	var isDate = kindOfTest("Date");
	var isFile = kindOfTest("File");
	var isReactNativeBlob = (value) => {
	  return !!(value && typeof value.uri !== "undefined");
	};
	var isReactNative = (formData) => formData && typeof formData.getParts !== "undefined";
	var isBlob = kindOfTest("Blob");
	var isFileList = kindOfTest("FileList");
	var isSet = kindOfTest("Set");
	var isStream = (val) => isObject(val) && isFunction(val.pipe);
	function getGlobal() {
	  if (typeof globalThis !== "undefined") return globalThis;
	  if (typeof self !== "undefined") return self;
	  if (typeof window !== "undefined") return window;
	  if (typeof global !== "undefined") return global;
	  return {};
	}
	var G = getGlobal();
	var FormDataCtor = typeof G.FormData !== "undefined" ? G.FormData : void 0;
	var isFormData = (thing) => {
	  if (!thing) return false;
	  if (FormDataCtor && thing instanceof FormDataCtor) return true;
	  const proto = getPrototypeOf(thing);
	  if (!proto || proto === Object.prototype) return false;
	  if (!isFunction(thing.append)) return false;
	  const kind = kindOf(thing);
	  return kind === "formdata" || // detect form-data instance
	  kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]";
	};
	var isURLSearchParams = kindOfTest("URLSearchParams");
	var [isReadableStream, isRequest, isResponse, isHeaders] = [
	  "ReadableStream",
	  "Request",
	  "Response",
	  "Headers"
	].map(kindOfTest);
	var trim = (str) => {
	  return str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
	};
	function forEach(obj, fn, { allOwnKeys = false } = {}) {
	  if (obj === null || typeof obj === "undefined") {
	    return;
	  }
	  let i;
	  let l;
	  if (typeof obj !== "object") {
	    obj = [obj];
	  }
	  if (isArray(obj)) {
	    for (i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    if (isBuffer(obj)) {
	      return;
	    }
	    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
	    const len = keys.length;
	    let key;
	    for (i = 0; i < len; i++) {
	      key = keys[i];
	      fn.call(null, obj[key], key, obj);
	    }
	  }
	}
	function findKey(obj, key) {
	  if (isBuffer(obj)) {
	    return null;
	  }
	  key = key.toLowerCase();
	  const keys = Object.keys(obj);
	  let i = keys.length;
	  let _key;
	  while (i-- > 0) {
	    _key = keys[i];
	    if (key === _key.toLowerCase()) {
	      return _key;
	    }
	  }
	  return null;
	}
	var _global = (() => {
	  if (typeof globalThis !== "undefined") return globalThis;
	  return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
	})();
	var isContextDefined = (context) => !isUndefined(context) && context !== _global;
	function merge(...objs) {
	  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
	  const result = {};
	  const assignValue = (val, key) => {
	    if (key === "__proto__" || key === "constructor" || key === "prototype") {
	      return;
	    }
	    const targetKey = caseless && typeof key === "string" && findKey(result, key) || key;
	    const existing = hasOwnProperty(result, targetKey) ? result[targetKey] : void 0;
	    if (isPlainObject(existing) && isPlainObject(val)) {
	      result[targetKey] = merge(existing, val);
	    } else if (isPlainObject(val)) {
	      result[targetKey] = merge({}, val);
	    } else if (isArray(val)) {
	      result[targetKey] = val.slice();
	    } else if (!skipUndefined || !isUndefined(val)) {
	      result[targetKey] = val;
	    }
	  };
	  for (let i = 0, l = objs.length; i < l; i++) {
	    const source = objs[i];
	    if (!source || isBuffer(source)) {
	      continue;
	    }
	    forEach(source, assignValue);
	    if (typeof source !== "object" || isArray(source)) {
	      continue;
	    }
	    const symbols = Object.getOwnPropertySymbols(source);
	    for (let j = 0; j < symbols.length; j++) {
	      const symbol = symbols[j];
	      if (propertyIsEnumerable.call(source, symbol)) {
	        assignValue(source[symbol], symbol);
	      }
	    }
	  }
	  return result;
	}
	var extend = (a, b, thisArg, { allOwnKeys } = {}) => {
	  forEach(
	    b,
	    (val, key) => {
	      if (thisArg && isFunction(val)) {
	        Object.defineProperty(a, key, {
	          // Null-proto descriptor so a polluted Object.prototype.get cannot
	          // hijack defineProperty's accessor-vs-data resolution.
	          __proto__: null,
	          value: bind(val, thisArg),
	          writable: true,
	          enumerable: true,
	          configurable: true
	        });
	      } else {
	        Object.defineProperty(a, key, {
	          __proto__: null,
	          value: val,
	          writable: true,
	          enumerable: true,
	          configurable: true
	        });
	      }
	    },
	    { allOwnKeys }
	  );
	  return a;
	};
	var stripBOM = (content) => {
	  if (content.charCodeAt(0) === 65279) {
	    content = content.slice(1);
	  }
	  return content;
	};
	var inherits = (constructor, superConstructor, props, descriptors) => {
	  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
	  Object.defineProperty(constructor.prototype, "constructor", {
	    __proto__: null,
	    value: constructor,
	    writable: true,
	    enumerable: false,
	    configurable: true
	  });
	  Object.defineProperty(constructor, "super", {
	    __proto__: null,
	    value: superConstructor.prototype
	  });
	  props && Object.assign(constructor.prototype, props);
	};
	var toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
	  let props;
	  let i;
	  let prop;
	  const merged = {};
	  destObj = destObj || {};
	  if (sourceObj == null) return destObj;
	  do {
	    props = Object.getOwnPropertyNames(sourceObj);
	    i = props.length;
	    while (i-- > 0) {
	      prop = props[i];
	      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
	        destObj[prop] = sourceObj[prop];
	        merged[prop] = true;
	      }
	    }
	    sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
	  } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
	  return destObj;
	};
	var endsWith = (str, searchString, position) => {
	  str = String(str);
	  if (position === void 0 || position > str.length) {
	    position = str.length;
	  }
	  position -= searchString.length;
	  const lastIndex = str.indexOf(searchString, position);
	  return lastIndex !== -1 && lastIndex === position;
	};
	var toArray = (thing) => {
	  if (!thing) return null;
	  if (isArray(thing)) return thing;
	  let i = thing.length;
	  if (!isNumber(i)) return null;
	  const arr = new Array(i);
	  while (i-- > 0) {
	    arr[i] = thing[i];
	  }
	  return arr;
	};
	var isTypedArray = /* @__PURE__ */ ((TypedArray2) => {
	  return (thing) => {
	    return TypedArray2 && thing instanceof TypedArray2;
	  };
	})(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
	var forEachEntry = (obj, fn) => {
	  const generator = obj && obj[iterator];
	  const _iterator = generator.call(obj);
	  let result;
	  while ((result = _iterator.next()) && !result.done) {
	    const pair = result.value;
	    fn.call(obj, pair[0], pair[1]);
	  }
	};
	var matchAll = (regExp, str) => {
	  let matches;
	  const arr = [];
	  while ((matches = regExp.exec(str)) !== null) {
	    arr.push(matches);
	  }
	  return arr;
	};
	var isHTMLForm = kindOfTest("HTMLFormElement");
	var toCamelCase = (str) => {
	  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
	    return p1.toUpperCase() + p2;
	  });
	};
	var { propertyIsEnumerable } = Object.prototype;
	var isRegExp = kindOfTest("RegExp");
	var reduceDescriptors = (obj, reducer) => {
	  const descriptors = Object.getOwnPropertyDescriptors(obj);
	  const reducedDescriptors = {};
	  forEach(descriptors, (descriptor, name) => {
	    let ret;
	    if ((ret = reducer(descriptor, name, obj)) !== false) {
	      reducedDescriptors[name] = ret || descriptor;
	    }
	  });
	  Object.defineProperties(obj, reducedDescriptors);
	};
	var freezeMethods = (obj) => {
	  reduceDescriptors(obj, (descriptor, name) => {
	    if (isFunction(obj) && ["arguments", "caller", "callee"].includes(name)) {
	      return false;
	    }
	    const value = obj[name];
	    if (!isFunction(value)) return;
	    descriptor.enumerable = false;
	    if ("writable" in descriptor) {
	      descriptor.writable = false;
	      return;
	    }
	    if (!descriptor.set) {
	      descriptor.set = () => {
	        throw Error("Can not rewrite read-only method '" + name + "'");
	      };
	    }
	  });
	};
	var toObjectSet = (arrayOrString, delimiter) => {
	  const obj = {};
	  const define = (arr) => {
	    arr.forEach((value) => {
	      obj[value] = true;
	    });
	  };
	  isArray(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));
	  return obj;
	};
	var noop = () => {
	};
	var toFiniteNumber = (value, defaultValue) => {
	  return value != null && Number.isFinite(value = +value) ? value : defaultValue;
	};
	function isSpecCompliantForm(thing) {
	  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
	}
	var toJSONObject = (obj) => {
	  const visited = /* @__PURE__ */ new WeakSet();
	  const visit = (source) => {
	    if (isObject(source)) {
	      if (visited.has(source)) {
	        return;
	      }
	      if (isBuffer(source)) {
	        return source;
	      }
	      if (!("toJSON" in source)) {
	        visited.add(source);
	        let target;
	        if (isSet(source)) {
	          target = [];
	          for (const value of source) {
	            const reducedValue = visit(value);
	            !isUndefined(reducedValue) && target.push(reducedValue);
	          }
	        } else {
	          target = isArray(source) ? [] : {};
	          forEach(source, (value, key) => {
	            const reducedValue = visit(value);
	            !isUndefined(reducedValue) && (target[key] = reducedValue);
	          });
	        }
	        visited.delete(source);
	        return target;
	      }
	    }
	    return source;
	  };
	  return visit(obj);
	};
	var isAsyncFn = kindOfTest("AsyncFunction");
	var isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
	var _setImmediate = ((setImmediateSupported, postMessageSupported) => {
	  if (setImmediateSupported) {
	    return setImmediate;
	  }
	  return postMessageSupported ? ((token2, callbacks) => {
	    _global.addEventListener(
	      "message",
	      ({ source, data }) => {
	        if (source === _global && data === token2) {
	          callbacks.length && callbacks.shift()();
	        }
	      },
	      false
	    );
	    return (cb) => {
	      callbacks.push(cb);
	      _global.postMessage(token2, "*");
	    };
	  })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
	})(typeof setImmediate === "function", isFunction(_global.postMessage));
	var asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
	var isIterable = (thing) => thing != null && isFunction(thing[iterator]);
	var isSafeIterable = (thing) => thing != null && hasOwnInPrototypeChain(thing, iterator) && isIterable(thing);
	var utils_default = {
	  isArray,
	  isArrayBuffer,
	  isBuffer,
	  isFormData,
	  isArrayBufferView,
	  isString,
	  isNumber,
	  isBoolean,
	  isObject,
	  isPlainObject,
	  isEmptyObject,
	  isReadableStream,
	  isRequest,
	  isResponse,
	  isHeaders,
	  isUndefined,
	  isDate,
	  isFile,
	  isReactNativeBlob,
	  isReactNative,
	  isBlob,
	  isRegExp,
	  isFunction,
	  isStream,
	  isURLSearchParams,
	  isTypedArray,
	  isFileList,
	  forEach,
	  merge,
	  extend,
	  trim,
	  stripBOM,
	  inherits,
	  toFlatObject,
	  kindOf,
	  kindOfTest,
	  endsWith,
	  toArray,
	  forEachEntry,
	  matchAll,
	  isHTMLForm,
	  hasOwnProperty,
	  hasOwnProp: hasOwnProperty,
	  // an alias to avoid ESLint no-prototype-builtins detection
	  hasOwnInPrototypeChain,
	  getSafeProp,
	  toSafeFlatObject,
	  reduceDescriptors,
	  freezeMethods,
	  toObjectSet,
	  toCamelCase,
	  noop,
	  toFiniteNumber,
	  findKey,
	  global: _global,
	  isContextDefined,
	  isSpecCompliantForm,
	  toJSONObject,
	  isAsyncFn,
	  isThenable,
	  setImmediate: _setImmediate,
	  asap,
	  isIterable,
	  isSafeIterable
	};
	
	// node_modules/axios/lib/helpers/parseHeaders.js
	var ignoreDuplicateOf = utils_default.toObjectSet([
	  "age",
	  "authorization",
	  "content-length",
	  "content-type",
	  "etag",
	  "expires",
	  "from",
	  "host",
	  "if-modified-since",
	  "if-unmodified-since",
	  "last-modified",
	  "location",
	  "max-forwards",
	  "proxy-authorization",
	  "referer",
	  "retry-after",
	  "user-agent"
	]);
	var parseHeaders_default = (rawHeaders) => {
	  const parsed = {};
	  let key;
	  let val;
	  let i;
	  rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
	    i = line.indexOf(":");
	    key = line.substring(0, i).trim().toLowerCase();
	    val = line.substring(i + 1).trim();
	    const hasKey = utils_default.hasOwnProp(parsed, key);
	    if (!key || hasKey && utils_default.hasOwnProp(ignoreDuplicateOf, key)) {
	      return;
	    }
	    if (key === "set-cookie") {
	      if (hasKey) {
	        parsed[key].push(val);
	      } else {
	        parsed[key] = [val];
	      }
	    } else {
	      parsed[key] = hasKey ? parsed[key] + ", " + val : val;
	    }
	  });
	  return parsed;
	};
	
	// node_modules/axios/lib/helpers/sanitizeHeaderValue.js
	function trimSPorHTAB(str) {
	  let start = 0;
	  let end = str.length;
	  while (start < end) {
	    const code = str.charCodeAt(start);
	    if (code !== 9 && code !== 32) {
	      break;
	    }
	    start += 1;
	  }
	  while (end > start) {
	    const code = str.charCodeAt(end - 1);
	    if (code !== 9 && code !== 32) {
	      break;
	    }
	    end -= 1;
	  }
	  return start === 0 && end === str.length ? str : str.slice(start, end);
	}
	var INVALID_UNICODE_HEADER_VALUE_CHARS = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g");
	var INVALID_BYTE_STRING_HEADER_VALUE_CHARS = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
	function sanitizeValue(value, invalidChars) {
	  if (utils_default.isArray(value)) {
	    return value.map((item) => sanitizeValue(item, invalidChars));
	  }
	  return trimSPorHTAB(String(value).replace(invalidChars, ""));
	}
	var sanitizeHeaderValue = (value) => sanitizeValue(value, INVALID_UNICODE_HEADER_VALUE_CHARS);
	var sanitizeByteStringHeaderValue = (value) => sanitizeValue(value, INVALID_BYTE_STRING_HEADER_VALUE_CHARS);
	function toByteStringHeaderObject(headers) {
	  const byteStringHeaders = /* @__PURE__ */ Object.create(null);
	  utils_default.forEach(headers.toJSON(), (value, header) => {
	    byteStringHeaders[header] = sanitizeByteStringHeaderValue(value);
	  });
	  return byteStringHeaders;
	}
	
	// node_modules/axios/lib/core/AxiosHeaders.js
	var $internals = /* @__PURE__ */ Symbol("internals");
	function normalizeHeader(header) {
	  return header && String(header).trim().toLowerCase();
	}
	function normalizeValue(value) {
	  if (value === false || value == null) {
	    return value;
	  }
	  return utils_default.isArray(value) ? value.map(normalizeValue) : sanitizeHeaderValue(String(value));
	}
	function parseTokens(str) {
	  const tokens = /* @__PURE__ */ Object.create(null);
	  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
	  let match;
	  while (match = tokensRE.exec(str)) {
	    tokens[match[1]] = match[2];
	  }
	  return tokens;
	}
	var parameterNameRE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
	function trimOWS(value) {
	  let start = 0;
	  let end = value.length;
	  while (start < end) {
	    const code = value.charCodeAt(start);
	    if (code !== 9 && code !== 32) {
	      break;
	    }
	    start += 1;
	  }
	  while (end > start) {
	    const code = value.charCodeAt(end - 1);
	    if (code !== 9 && code !== 32) {
	      break;
	    }
	    end -= 1;
	  }
	  return start === 0 && end === value.length ? value : value.slice(start, end);
	}
	function decodeQuotedString(value) {
	  const last = value.length - 1;
	  if (last < 1 || value.charCodeAt(0) !== 34 || value.charCodeAt(last) !== 34) {
	    return value;
	  }
	  let decoded = "";
	  for (let i = 1; i < last; i++) {
	    const code = value.charCodeAt(i);
	    if (code === 34) {
	      return value;
	    }
	    if (code === 92) {
	      i += 1;
	      if (i >= last) {
	        return value;
	      }
	    }
	    decoded += value[i];
	  }
	  return decoded;
	}
	function parseParameters(value) {
	  const parameters = /* @__PURE__ */ Object.create(null);
	  const str = String(value);
	  let start = 0;
	  let quoted = false;
	  let escaped = false;
	  function parseParameter(end) {
	    const part = trimOWS(str.slice(start, end));
	    const equals = part.indexOf("=");
	    if (equals < 1) {
	      return;
	    }
	    const name = trimOWS(part.slice(0, equals));
	    if (!parameterNameRE.test(name)) {
	      return;
	    }
	    const normalizedName = name.toLowerCase();
	    if (normalizedName === "__proto__" || normalizedName === "constructor" || normalizedName === "prototype") {
	      return;
	    }
	    const parameterValue = trimOWS(part.slice(equals + 1));
	    parameters[normalizedName] = decodeQuotedString(parameterValue);
	  }
	  for (let i = 0; i < str.length; i++) {
	    const code = str.charCodeAt(i);
	    if (quoted) {
	      if (escaped) {
	        escaped = false;
	      } else if (code === 92) {
	        escaped = true;
	      } else if (code === 34) {
	        quoted = false;
	      }
	    } else if (code === 34) {
	      quoted = true;
	    } else if (code === 44 || code === 59) {
	      parseParameter(i);
	      start = i + 1;
	    }
	  }
	  parseParameter(str.length);
	  return parameters;
	}
	var isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
	function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
	  if (utils_default.isFunction(filter2)) {
	    return filter2.call(this, value, header);
	  }
	  if (isHeaderNameFilter) {
	    value = header;
	  }
	  if (!utils_default.isString(value)) return;
	  if (utils_default.isString(filter2)) {
	    return value.indexOf(filter2) !== -1;
	  }
	  if (utils_default.isRegExp(filter2)) {
	    return filter2.test(value);
	  }
	}
	function formatHeader(header) {
	  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
	    return char.toUpperCase() + str;
	  });
	}
	function buildAccessors(obj, header) {
	  const accessorName = utils_default.toCamelCase(" " + header);
	  ["get", "set", "has"].forEach((methodName) => {
	    Object.defineProperty(obj, methodName + accessorName, {
	      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
	      // this data descriptor into an accessor descriptor on the way in.
	      __proto__: null,
	      value: function(arg1, arg2, arg3) {
	        return this[methodName].call(this, header, arg1, arg2, arg3);
	      },
	      configurable: true
	    });
	  });
	}
	var AxiosHeaders = class {
	  constructor(headers) {
	    headers && this.set(headers);
	  }
	  set(header, valueOrRewrite, rewrite) {
	    const self2 = this;
	    function setHeader(_value, _header, _rewrite) {
	      const lHeader = normalizeHeader(_header);
	      if (!lHeader) {
	        return;
	      }
	      const key = utils_default.findKey(self2, lHeader);
	      if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
	        self2[key || _header] = normalizeValue(_value);
	      }
	    }
	    const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
	    if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
	      setHeaders(header, valueOrRewrite);
	    } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
	      setHeaders(parseHeaders_default(header), valueOrRewrite);
	    } else if (utils_default.isObject(header) && utils_default.isSafeIterable(header)) {
	      let obj = /* @__PURE__ */ Object.create(null), dest, key;
	      for (const entry of header) {
	        if (!utils_default.isArray(entry)) {
	          throw new TypeError("Object iterator must return a key-value pair");
	        }
	        key = entry[0];
	        if (utils_default.hasOwnProp(obj, key)) {
	          dest = obj[key];
	          obj[key] = utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]];
	        } else {
	          obj[key] = entry[1];
	        }
	      }
	      setHeaders(obj, valueOrRewrite);
	    } else {
	      header != null && setHeader(valueOrRewrite, header, rewrite);
	    }
	    return this;
	  }
	  get(header, parser) {
	    header = normalizeHeader(header);
	    if (header) {
	      const key = utils_default.findKey(this, header);
	      if (key) {
	        const value = this[key];
	        if (!parser) {
	          return value;
	        }
	        if (parser === true) {
	          return parseTokens(value);
	        }
	        if (utils_default.isFunction(parser)) {
	          return parser.call(this, value, key);
	        }
	        if (utils_default.isRegExp(parser)) {
	          return parser.exec(value);
	        }
	        throw new TypeError("parser must be boolean|regexp|function");
	      }
	    }
	  }
	  has(header, matcher) {
	    header = normalizeHeader(header);
	    if (header) {
	      const key = utils_default.findKey(this, header);
	      return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
	    }
	    return false;
	  }
	  delete(header, matcher) {
	    const self2 = this;
	    let deleted = false;
	    function deleteHeader(_header) {
	      _header = normalizeHeader(_header);
	      if (_header) {
	        const key = utils_default.findKey(self2, _header);
	        if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
	          delete self2[key];
	          deleted = true;
	        }
	      }
	    }
	    if (utils_default.isArray(header)) {
	      header.forEach(deleteHeader);
	    } else {
	      deleteHeader(header);
	    }
	    return deleted;
	  }
	  clear(matcher) {
	    const keys = Object.keys(this);
	    let i = keys.length;
	    let deleted = false;
	    while (i--) {
	      const key = keys[i];
	      if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
	        delete this[key];
	        deleted = true;
	      }
	    }
	    return deleted;
	  }
	  normalize(format) {
	    const self2 = this;
	    const headers = {};
	    utils_default.forEach(this, (value, header) => {
	      const key = utils_default.findKey(headers, header);
	      if (key) {
	        self2[key] = normalizeValue(value);
	        delete self2[header];
	        return;
	      }
	      const normalized = format ? formatHeader(header) : String(header).trim();
	      if (normalized !== header) {
	        delete self2[header];
	      }
	      self2[normalized] = normalizeValue(value);
	      headers[normalized] = true;
	    });
	    return this;
	  }
	  concat(...targets) {
	    return this.constructor.concat(this, ...targets);
	  }
	  toJSON(asStrings) {
	    const obj = /* @__PURE__ */ Object.create(null);
	    utils_default.forEach(this, (value, header) => {
	      value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
	    });
	    return obj;
	  }
	  [Symbol.iterator]() {
	    return Object.entries(this.toJSON())[Symbol.iterator]();
	  }
	  toString() {
	    return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
	  }
	  getSetCookie() {
	    const value = this.get("set-cookie");
	    return utils_default.isArray(value) ? value : value == null || value === false ? [] : [value];
	  }
	  get [Symbol.toStringTag]() {
	    return "AxiosHeaders";
	  }
	  static from(thing) {
	    return thing instanceof this ? thing : new this(thing);
	  }
	  static parseParameters(value) {
	    return parseParameters(value);
	  }
	  static concat(first, ...targets) {
	    const computed = new this(first);
	    targets.forEach((target) => computed.set(target));
	    return computed;
	  }
	  static accessor(header) {
	    const internals = this[$internals] = this[$internals] = {
	      accessors: {}
	    };
	    const accessors = internals.accessors;
	    const prototype2 = this.prototype;
	    function defineAccessor(_header) {
	      const lHeader = normalizeHeader(_header);
	      if (!accessors[lHeader]) {
	        buildAccessors(prototype2, _header);
	        accessors[lHeader] = true;
	      }
	    }
	    utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
	    return this;
	  }
	};
	AxiosHeaders.accessor([
	  "Content-Type",
	  "Content-Length",
	  "Accept",
	  "Accept-Encoding",
	  "User-Agent",
	  "Authorization"
	]);
	utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
	  let mapped = key[0].toUpperCase() + key.slice(1);
	  return {
	    get: () => value,
	    set(headerValue) {
	      this[mapped] = headerValue;
	    }
	  };
	});
	utils_default.freezeMethods(AxiosHeaders);
	var AxiosHeaders_default = AxiosHeaders;
	
	// node_modules/axios/lib/core/AxiosError.js
	var REDACTED = "[REDACTED ****]";
	function hasOwnOrPrototypeToJSON(source) {
	  if (utils_default.hasOwnProp(source, "toJSON")) {
	    return true;
	  }
	  let prototype2 = Object.getPrototypeOf(source);
	  while (prototype2 && prototype2 !== Object.prototype) {
	    if (utils_default.hasOwnProp(prototype2, "toJSON")) {
	      return true;
	    }
	    prototype2 = Object.getPrototypeOf(prototype2);
	  }
	  return false;
	}
	function redactConfig(config, redactKeys) {
	  const lowerKeys = new Set(redactKeys.map((k) => String(k).toLowerCase()));
	  const seen = [];
	  const visit = (source) => {
	    if (source === null || typeof source !== "object") return source;
	    if (utils_default.isBuffer(source)) return source;
	    if (seen.indexOf(source) !== -1) return void 0;
	    if (source instanceof AxiosHeaders_default) {
	      source = source.toJSON();
	    }
	    seen.push(source);
	    let result;
	    if (utils_default.isArray(source)) {
	      result = [];
	      source.forEach((v, i) => {
	        const reducedValue = visit(v);
	        if (!utils_default.isUndefined(reducedValue)) {
	          result[i] = reducedValue;
	        }
	      });
	    } else {
	      if (!utils_default.isPlainObject(source) && hasOwnOrPrototypeToJSON(source)) {
	        seen.pop();
	        return source;
	      }
	      result = /* @__PURE__ */ Object.create(null);
	      for (const [key, value] of Object.entries(source)) {
	        const reducedValue = lowerKeys.has(key.toLowerCase()) ? REDACTED : visit(value);
	        if (!utils_default.isUndefined(reducedValue)) {
	          result[key] = reducedValue;
	        }
	      }
	    }
	    seen.pop();
	    return result;
	  };
	  return visit(config);
	}
	function stringifySafely(value) {
	  try {
	    return String(value);
	  } catch (err) {
	    return "";
	  }
	}
	function aggregateErrorMessage(error) {
	  const message = error.errors.map((entry) => {
	    try {
	      return entry && entry.message ? stringifySafely(entry.message) : stringifySafely(entry);
	    } catch (err) {
	      return "";
	    }
	  }).filter(Boolean).join("; ");
	  return message || error.name || "AggregateError";
	}
	var AxiosError = class _AxiosError extends Error {
	  static from(error, code, config, request, response, customProps) {
	    let message = error.message;
	    if (!message && utils_default.isArray(error.errors) && error.errors.length) {
	      message = aggregateErrorMessage(error);
	    }
	    const axiosError = new _AxiosError(message, code || error.code, config, request, response);
	    Object.defineProperty(axiosError, "cause", {
	      __proto__: null,
	      value: error,
	      writable: true,
	      enumerable: false,
	      configurable: true
	    });
	    axiosError.name = error.name;
	    if (error.status != null && axiosError.status == null) {
	      axiosError.status = error.status;
	    }
	    customProps && Object.assign(axiosError, customProps);
	    return axiosError;
	  }
	  /**
	   * Create an Error with the specified message, config, error code, request and response.
	   *
	   * @param {string} message The error message.
	   * @param {string} [code] The error code (for example, 'ECONNABORTED').
	   * @param {Object} [config] The config.
	   * @param {Object} [request] The request.
	   * @param {Object} [response] The response.
	   *
	   * @returns {Error} The created error.
	   */
	  constructor(message, code, config, request, response) {
	    super(message);
	    Object.defineProperty(this, "message", {
	      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
	      // this data descriptor into an accessor descriptor on the way in.
	      __proto__: null,
	      value: message,
	      enumerable: true,
	      writable: true,
	      configurable: true
	    });
	    this.name = "AxiosError";
	    this.isAxiosError = true;
	    code && (this.code = code);
	    config && (this.config = config);
	    request && (this.request = request);
	    if (response) {
	      this.response = response;
	      this.status = response.status;
	    }
	  }
	  toJSON() {
	    const config = this.config;
	    const redactKeys = config && utils_default.hasOwnProp(config, "redact") ? config.redact : void 0;
	    const serializedConfig = utils_default.isArray(redactKeys) && redactKeys.length > 0 ? redactConfig(config, redactKeys) : utils_default.toJSONObject(config);
	    return {
	      // Standard
	      message: this.message,
	      name: this.name,
	      // Microsoft
	      description: this.description,
	      number: this.number,
	      // Mozilla
	      fileName: this.fileName,
	      lineNumber: this.lineNumber,
	      columnNumber: this.columnNumber,
	      stack: this.stack,
	      // Axios
	      config: serializedConfig,
	      code: this.code,
	      status: this.status
	    };
	  }
	};
	AxiosError.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
	AxiosError.ERR_BAD_OPTION = "ERR_BAD_OPTION";
	AxiosError.ECONNABORTED = "ECONNABORTED";
	AxiosError.ETIMEDOUT = "ETIMEDOUT";
	AxiosError.ECONNREFUSED = "ECONNREFUSED";
	AxiosError.ERR_NETWORK = "ERR_NETWORK";
	AxiosError.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
	AxiosError.ERR_DEPRECATED = "ERR_DEPRECATED";
	AxiosError.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
	AxiosError.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
	AxiosError.ERR_CANCELED = "ERR_CANCELED";
	AxiosError.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
	AxiosError.ERR_INVALID_URL = "ERR_INVALID_URL";
	AxiosError.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
	var AxiosError_default = AxiosError;
	
	// node_modules/axios/lib/helpers/null.js
	var null_default = null;
	
	// node_modules/axios/lib/helpers/toFormData.js
	var DEFAULT_FORM_DATA_MAX_DEPTH = 100;
	function isVisitable(thing) {
	  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
	}
	function removeBrackets(key) {
	  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
	}
	function renderKey(path, key, dots) {
	  if (!path) return key;
	  return path.concat(key).map(function each(token2, i) {
	    token2 = removeBrackets(token2);
	    return !dots && i ? "[" + token2 + "]" : token2;
	  }).join(dots ? "." : "");
	}
	function isFlatArray(arr) {
	  return utils_default.isArray(arr) && !arr.some(isVisitable);
	}
	var predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
	  return /^is[A-Z]/.test(prop);
	});
	function toFormData(obj, formData, options) {
	  if (!utils_default.isObject(obj)) {
	    throw new TypeError("target must be an object");
	  }
	  formData = formData || new (null_default || FormData)();
	  const option = (name, fallback) => {
	    const value = utils_default.getSafeProp(options, name);
	    return utils_default.isUndefined(value) ? fallback : value;
	  };
	  const metaTokens = option("metaTokens", true);
	  const visitor = option("visitor") || defaultVisitor;
	  const dots = option("dots", false);
	  const indexes = option("indexes", false);
	  const _Blob = option("Blob") || typeof Blob !== "undefined" && Blob;
	  const maxDepth = option("maxDepth", DEFAULT_FORM_DATA_MAX_DEPTH);
	  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
	  const stack = [];
	  if (!utils_default.isFunction(visitor)) {
	    throw new TypeError("visitor must be a function");
	  }
	  function convertValue(value) {
	    if (value === null) return "";
	    if (utils_default.isDate(value)) {
	      return value.toISOString();
	    }
	    if (utils_default.isBoolean(value)) {
	      return value.toString();
	    }
	    if (!useBlob && utils_default.isBlob(value)) {
	      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
	    }
	    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
	      if (useBlob && typeof _Blob === "function") {
	        return new _Blob([value]);
	      }
	      if (null_default && null_default.isBufferAvailable()) {
	        return null_default.from(value);
	      }
	      throw new AxiosError_default(
	        "Blob is not supported. Use a Buffer instead.",
	        AxiosError_default.ERR_NOT_SUPPORT
	      );
	    }
	    return value;
	  }
	  function throwIfMaxDepthExceeded(depth) {
	    if (depth > maxDepth) {
	      throw new AxiosError_default(
	        "Object is too deeply nested (" + depth + " levels). Max depth: " + maxDepth,
	        AxiosError_default.ERR_FORM_DATA_DEPTH_EXCEEDED
	      );
	    }
	  }
	  function stringifyWithDepthLimit(value, depth) {
	    if (maxDepth === Infinity) {
	      return JSON.stringify(value);
	    }
	    const ancestors = [];
	    return JSON.stringify(value, function limitDepth(_key, currentValue) {
	      if (!utils_default.isObject(currentValue)) {
	        return currentValue;
	      }
	      while (ancestors.length && ancestors[ancestors.length - 1] !== this) {
	        ancestors.pop();
	      }
	      ancestors.push(currentValue);
	      throwIfMaxDepthExceeded(depth + ancestors.length - 1);
	      return currentValue;
	    });
	  }
	  function defaultVisitor(value, key, path) {
	    let arr = value;
	    if (utils_default.isReactNative(formData) && utils_default.isReactNativeBlob(value)) {
	      formData.append(renderKey(path, key, dots), convertValue(value));
	      return false;
	    }
	    if (value && !path && typeof value === "object") {
	      if (utils_default.endsWith(key, "{}")) {
	        key = metaTokens ? key : key.slice(0, -2);
	        value = stringifyWithDepthLimit(value, 1);
	      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
	        key = removeBrackets(key);
	        arr.forEach(function each(el, index) {
	          !(utils_default.isUndefined(el) || el === null) && formData.append(
	            // eslint-disable-next-line no-nested-ternary
	            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
	            convertValue(el)
	          );
	        });
	        return false;
	      }
	    }
	    if (isVisitable(value)) {
	      return true;
	    }
	    formData.append(renderKey(path, key, dots), convertValue(value));
	    return false;
	  }
	  const exposedHelpers = Object.assign(predicates, {
	    defaultVisitor,
	    convertValue,
	    isVisitable
	  });
	  function build(value, path, depth = 0) {
	    if (utils_default.isUndefined(value)) return;
	    throwIfMaxDepthExceeded(depth);
	    if (stack.indexOf(value) !== -1) {
	      throw new Error("Circular reference detected in " + path.join("."));
	    }
	    stack.push(value);
	    utils_default.forEach(value, function each(el, key) {
	      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(formData, el, utils_default.isString(key) ? key.trim() : key, path, exposedHelpers);
	      if (result === true) {
	        build(el, path ? path.concat(key) : [key], depth + 1);
	      }
	    });
	    stack.pop();
	  }
	  if (!utils_default.isObject(obj)) {
	    throw new TypeError("data must be an object");
	  }
	  build(obj);
	  return formData;
	}
	var toFormData_default = toFormData;
	
	// node_modules/axios/lib/helpers/AxiosURLSearchParams.js
	function encode(str) {
	  const charMap = {
	    "!": "%21",
	    "'": "%27",
	    "(": "%28",
	    ")": "%29",
	    "~": "%7E",
	    "%20": "+"
	  };
	  return encodeURIComponent(str).replace(/[!'()~]|%20/g, function replacer(match) {
	    return charMap[match];
	  });
	}
	function AxiosURLSearchParams(params, options) {
	  this._pairs = [];
	  params && toFormData_default(params, this, options);
	}
	var prototype = AxiosURLSearchParams.prototype;
	prototype.append = function append(name, value) {
	  this._pairs.push([name, value]);
	};
	prototype.toString = function toString2(encoder) {
	  const _encode = encoder ? (value) => encoder.call(this, value, encode) : encode;
	  return this._pairs.map(function each(pair) {
	    return _encode(pair[0]) + "=" + _encode(pair[1]);
	  }, "").join("&");
	};
	var AxiosURLSearchParams_default = AxiosURLSearchParams;
	
	// node_modules/axios/lib/helpers/buildURL.js
	function encode2(val) {
	  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
	}
	function buildURL(url, params, options) {
	  if (!params) {
	    return url;
	  }
	  url = url || "";
	  const _options = utils_default.isFunction(options) ? {
	    serialize: options
	  } : options;
	  const _encode = utils_default.getSafeProp(_options, "encode") || encode2;
	  const serializeFn = utils_default.getSafeProp(_options, "serialize");
	  let serializedParams;
	  if (serializeFn) {
	    serializedParams = serializeFn(params, _options);
	  } else {
	    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, _options).toString(_encode);
	  }
	  if (serializedParams) {
	    const hashmarkIndex = url.indexOf("#");
	    if (hashmarkIndex !== -1) {
	      url = url.slice(0, hashmarkIndex);
	    }
	    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
	  }
	  return url;
	}
	
	// node_modules/axios/lib/core/InterceptorManager.js
	var $internals2 = /* @__PURE__ */ Symbol("internals");
	function countHandlers(handlers) {
	  return handlers ? handlers.length : 0;
	}
	function trimHandlers(handlers) {
	  if (!handlers) {
	    return;
	  }
	  while (handlers.length && handlers[handlers.length - 1] === null) {
	    handlers.pop();
	  }
	}
	function syncHandlerEntries(manager, internals) {
	  const handlers = manager.handlers;
	  const length = countHandlers(handlers);
	  if (handlers !== internals.handlersRef) {
	    internals.handlersRef = handlers;
	    internals.handlerEntries.clear();
	  } else if (length !== internals.handlersLength) {
	    if (!length) {
	      internals.handlerEntries.clear();
	    } else {
	      internals.handlerEntries.forEach(function removeStaleEntry(entry, id) {
	        if (handlers[entry.index] !== entry.handler) {
	          internals.handlerEntries.delete(id);
	        }
	      });
	    }
	  }
	  internals.handlersLength = length;
	}
	var InterceptorManager = class {
	  constructor() {
	    this.handlers = [];
	    this[$internals2] = {
	      handlersRef: this.handlers,
	      handlersLength: this.handlers.length,
	      handlerEntries: /* @__PURE__ */ new Map(),
	      iterationDepth: 0,
	      nextId: 0
	    };
	  }
	  /**
	   * Add a new interceptor to the stack
	   *
	   * @param {Function} fulfilled The function to handle `then` for a `Promise`
	   * @param {Function} rejected The function to handle `reject` for a `Promise`
	   * @param {Object} options The options for the interceptor, synchronous and runWhen
	   *
	   * @return {Number} An ID used to remove interceptor later
	   */
	  use(fulfilled, rejected, options) {
	    const handler = {
	      fulfilled,
	      rejected,
	      synchronous: options ? options.synchronous : false,
	      runWhen: options ? options.runWhen : null
	    };
	    const internals = this[$internals2];
	    if (this.handlers == null) {
	      this.handlers = [];
	    }
	    syncHandlerEntries(this, internals);
	    const id = internals.nextId++;
	    this.handlers.push(handler);
	    internals.handlerEntries.set(id, {
	      handler,
	      index: this.handlers.length - 1
	    });
	    internals.handlersLength = this.handlers.length;
	    return id;
	  }
	  /**
	   * Remove an interceptor from the stack
	   *
	   * @param {Number} id The ID that was returned by `use`
	   *
	   * @returns {void}
	   */
	  eject(id) {
	    const internals = this[$internals2];
	    syncHandlerEntries(this, internals);
	    const entry = internals.handlerEntries.get(id);
	    if (entry) {
	      internals.handlerEntries.delete(id);
	      if (this.handlers[entry.index] !== entry.handler) {
	        return;
	      }
	      this.handlers[entry.index] = null;
	      if (!internals.iterationDepth) {
	        trimHandlers(this.handlers);
	        internals.handlersLength = this.handlers.length;
	      }
	    }
	  }
	  /**
	   * Clear all interceptors from the stack
	   *
	   * @returns {void}
	   */
	  clear() {
	    if (this.handlers) {
	      this.handlers = [];
	      syncHandlerEntries(this, this[$internals2]);
	    }
	  }
	  /**
	   * Iterate over all the registered interceptors
	   *
	   * This method is particularly useful for skipping over any
	   * interceptors that may have become `null` calling `eject`.
	   *
	   * @param {Function} fn The function to call for each interceptor
	   *
	   * @returns {void}
	   */
	  forEach(fn) {
	    const internals = this[$internals2];
	    syncHandlerEntries(this, internals);
	    internals.iterationDepth++;
	    try {
	      utils_default.forEach(this.handlers, function forEachHandler(h) {
	        if (h !== null) {
	          fn(h);
	        }
	      });
	    } finally {
	      if (!--internals.iterationDepth) {
	        syncHandlerEntries(this, internals);
	        trimHandlers(this.handlers);
	        internals.handlersLength = countHandlers(this.handlers);
	      }
	    }
	  }
	};
	var InterceptorManager_default = InterceptorManager;
	
	// node_modules/axios/lib/defaults/transitional.js
	var transitional_default = {
	  silentJSONParsing: true,
	  forcedJSONParsing: true,
	  clarifyTimeoutError: false,
	  legacyInterceptorReqResOrdering: true,
	  advertiseZstdAcceptEncoding: false,
	  validateStatusUndefinedResolves: true
	};
	
	// node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
	var URLSearchParams_default = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams_default;
	
	// node_modules/axios/lib/platform/browser/classes/FormData.js
	var FormData_default = typeof FormData !== "undefined" ? FormData : null;
	
	// node_modules/axios/lib/platform/browser/classes/Blob.js
	var Blob_default = typeof Blob !== "undefined" ? Blob : null;
	
	// node_modules/axios/lib/platform/browser/index.js
	var browser_default = {
	  isBrowser: true,
	  classes: {
	    URLSearchParams: URLSearchParams_default,
	    FormData: FormData_default,
	    Blob: Blob_default
	  },
	  protocols: ["http", "https", "file", "blob", "url", "data"]
	};
	
	// node_modules/axios/lib/platform/common/utils.js
	var utils_exports = {};
	__export(utils_exports, {
	  hasBrowserEnv: () => hasBrowserEnv,
	  hasStandardBrowserEnv: () => hasStandardBrowserEnv,
	  hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
	  navigator: () => _navigator,
	  origin: () => origin
	});
	var hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
	var _navigator = typeof navigator === "object" && navigator || void 0;
	var hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
	var hasStandardBrowserWebWorkerEnv = (() => {
	  return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
	  self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
	})();
	var origin = hasBrowserEnv && window.location.href || "http://localhost";
	
	// node_modules/axios/lib/platform/index.js
	var platform_default = __spreadValues(__spreadValues({}, utils_exports), browser_default);
	
	// node_modules/axios/lib/helpers/toURLEncodedForm.js
	function toURLEncodedForm(data, options) {
	  return toFormData_default(data, new platform_default.classes.URLSearchParams(), __spreadValues({
	    visitor: function(value, key, path, helpers) {
	      if (platform_default.isNode && utils_default.isBuffer(value)) {
	        this.append(key, value.toString("base64"));
	        return false;
	      }
	      return helpers.defaultVisitor.apply(this, arguments);
	    }
	  }, options));
	}
	
	// node_modules/axios/lib/helpers/formDataToJSON.js
	var MAX_DEPTH = DEFAULT_FORM_DATA_MAX_DEPTH;
	function throwIfDepthExceeded(index) {
	  if (index > MAX_DEPTH) {
	    throw new AxiosError_default(
	      "FormData field is too deeply nested (" + index + " levels). Max depth: " + MAX_DEPTH,
	      AxiosError_default.ERR_FORM_DATA_DEPTH_EXCEEDED
	    );
	  }
	}
	function parsePropPath(name) {
	  const path = [];
	  const pattern = /[^.[\]]+|\[([^.[\]]*)]/g;
	  let match;
	  while ((match = pattern.exec(name)) !== null) {
	    throwIfDepthExceeded(path.length);
	    path.push(match[0] === "[]" ? "" : match[1] || match[0]);
	  }
	  return path;
	}
	function arrayToObject(arr) {
	  const obj = {};
	  const keys = Object.keys(arr);
	  let i;
	  const len = keys.length;
	  let key;
	  for (i = 0; i < len; i++) {
	    key = keys[i];
	    obj[key] = arr[key];
	  }
	  return obj;
	}
	function formDataToJSON(formData) {
	  function buildPath(path, value, target, index) {
	    throwIfDepthExceeded(index);
	    let name = path[index++];
	    if (name === "__proto__") return true;
	    const isNumericKey = Number.isFinite(+name);
	    const isLast = index >= path.length;
	    name = !name && utils_default.isArray(target) ? target.length : name;
	    if (isLast) {
	      if (utils_default.hasOwnProp(target, name)) {
	        target[name] = utils_default.isArray(target[name]) ? target[name].concat(value) : [target[name], value];
	      } else {
	        target[name] = value;
	      }
	      return !isNumericKey;
	    }
	    if (!utils_default.hasOwnProp(target, name) || !utils_default.isObject(target[name])) {
	      target[name] = [];
	    }
	    const result = buildPath(path, value, target[name], index);
	    if (result && utils_default.isArray(target[name])) {
	      target[name] = arrayToObject(target[name]);
	    }
	    return !isNumericKey;
	  }
	  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
	    const obj = {};
	    utils_default.forEachEntry(formData, (name, value) => {
	      buildPath(parsePropPath(name), value, obj, 0);
	    });
	    return obj;
	  }
	  return null;
	}
	var formDataToJSON_default = formDataToJSON;
	
	// node_modules/axios/lib/core/methodList.js
	var methodList = Object.freeze([
	  "get",
	  "delete",
	  "head",
	  "options",
	  "post",
	  "put",
	  "patch",
	  "purge",
	  "link",
	  "unlink",
	  "query"
	]);
	var methodList_default = methodList;
	
	// node_modules/axios/lib/defaults/index.js
	var own = (obj, key) => obj != null && utils_default.hasOwnProp(obj, key) ? obj[key] : void 0;
	function stringifySafely2(rawValue, parser, encoder) {
	  if (utils_default.isString(rawValue)) {
	    try {
	      (parser || JSON.parse)(rawValue);
	      return utils_default.trim(rawValue);
	    } catch (e) {
	      if (e.name !== "SyntaxError") {
	        throw e;
	      }
	    }
	  }
	  return (encoder || JSON.stringify)(rawValue);
	}
	var defaults = {
	  transitional: transitional_default,
	  adapter: ["xhr", "http", "fetch"],
	  transformRequest: [
	    function transformRequest(data, headers) {
	      const contentType = headers.getContentType() || "";
	      const hasJSONContentType = contentType.indexOf("application/json") > -1;
	      const isObjectPayload = utils_default.isObject(data);
	      if (isObjectPayload && utils_default.isHTMLForm(data)) {
	        data = new FormData(data);
	      }
	      const isFormData2 = utils_default.isFormData(data);
	      if (isFormData2) {
	        return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
	      }
	      if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
	        return data;
	      }
	      if (utils_default.isArrayBufferView(data)) {
	        return data.buffer;
	      }
	      if (utils_default.isURLSearchParams(data)) {
	        headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
	        return data.toString();
	      }
	      let isFileList2;
	      if (isObjectPayload) {
	        const formSerializer = own(this, "formSerializer");
	        if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
	          return toURLEncodedForm(data, formSerializer).toString();
	        }
	        if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
	          const env = own(this, "env");
	          const _FormData = env && env.FormData;
	          return toFormData_default(
	            isFileList2 ? { "files[]": data } : data,
	            _FormData && new _FormData(),
	            formSerializer
	          );
	        }
	      }
	      if (isObjectPayload || hasJSONContentType) {
	        headers.setContentType("application/json", false);
	        return stringifySafely2(data);
	      }
	      return data;
	    }
	  ],
	  transformResponse: [
	    function transformResponse(data) {
	      const transitional2 = own(this, "transitional") || defaults.transitional;
	      const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
	      const responseType = own(this, "responseType");
	      const JSONRequested = responseType === "json";
	      if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
	        return data;
	      }
	      if (data && utils_default.isString(data) && (forcedJSONParsing && !responseType || JSONRequested)) {
	        const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
	        const strictJSONParsing = !silentJSONParsing && JSONRequested;
	        try {
	          return JSON.parse(data, own(this, "parseReviver"));
	        } catch (e) {
	          if (strictJSONParsing) {
	            if (e.name === "SyntaxError") {
	              throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, own(this, "response"));
	            }
	            throw e;
	          }
	        }
	      }
	      return data;
	    }
	  ],
	  /**
	   * A timeout in milliseconds to abort a request. If set to 0 (default) a
	   * timeout is not created.
	   */
	  timeout: 0,
	  xsrfCookieName: "XSRF-TOKEN",
	  xsrfHeaderName: "X-XSRF-TOKEN",
	  maxContentLength: -1,
	  maxBodyLength: -1,
	  env: {
	    FormData: platform_default.classes.FormData,
	    Blob: platform_default.classes.Blob
	  },
	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  },
	  headers: {
	    common: {
	      Accept: "application/json, text/plain, */*",
	      "Content-Type": void 0
	    }
	  }
	};
	utils_default.forEach(methodList_default, (method) => {
	  defaults.headers[method] = {};
	});
	var defaults_default = defaults;
	
	// node_modules/axios/lib/core/transformData.js
	function transformData(fns, response) {
	  const config = this || defaults_default;
	  const context = response || config;
	  const headers = AxiosHeaders_default.from(context.headers);
	  let data = context.data;
	  utils_default.forEach(fns, function transform(fn) {
	    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
	  });
	  headers.normalize();
	  return data;
	}
	
	// node_modules/axios/lib/cancel/isCancel.js
	function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	}
	
	// node_modules/axios/lib/cancel/CanceledError.js
	var CanceledError = class extends AxiosError_default {
	  /**
	   * A `CanceledError` is an object that is thrown when an operation is canceled.
	   *
	   * @param {string=} message The message.
	   * @param {Object=} config The config.
	   * @param {Object=} request The request.
	   *
	   * @returns {CanceledError} The created error.
	   */
	  constructor(message, config, request) {
	    super(message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
	    this.name = "CanceledError";
	    this.__CANCEL__ = true;
	  }
	};
	var CanceledError_default = CanceledError;
	
	// node_modules/axios/lib/core/settle.js
	function settle(resolve, reject, response) {
	  const validateStatus2 = response.config.validateStatus;
	  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
	    resolve(response);
	  } else {
	    reject(new AxiosError_default(
	      "Request failed with status code " + response.status,
	      response.status >= 400 && response.status < 500 ? AxiosError_default.ERR_BAD_REQUEST : AxiosError_default.ERR_BAD_RESPONSE,
	      response.config,
	      response.request,
	      response
	    ));
	  }
	}
	
	// node_modules/axios/lib/helpers/normalizeURLForProtocolCheck.js
	var urlParserControlCharacters = /[\t\n\r]/g;
	function normalizeURLForProtocolCheck(url) {
	  if (typeof url !== "string") {
	    return url;
	  }
	  let start = 0;
	  while (start < url.length && url.charCodeAt(start) <= 32) {
	    start++;
	  }
	  return url.slice(start).replace(urlParserControlCharacters, "");
	}
	
	// node_modules/axios/lib/helpers/parseProtocol.js
	function parseProtocol(url) {
	  const match = /^([-+\w]{1,25}):(?:\/\/)?/.exec(url);
	  return match && match[1] || "";
	}
	
	// node_modules/axios/lib/helpers/speedometer.js
	function speedometer(samplesCount, min) {
	  samplesCount = samplesCount || 10;
	  const bytes = new Array(samplesCount);
	  const timestamps = new Array(samplesCount);
	  let head = 0;
	  let tail = 0;
	  let firstSampleTS;
	  min = min !== void 0 ? min : 1e3;
	  return function push(chunkLength) {
	    const now = Date.now();
	    const startedAt = timestamps[tail];
	    if (!firstSampleTS) {
	      firstSampleTS = now;
	    }
	    bytes[head] = chunkLength;
	    timestamps[head] = now;
	    let i = tail;
	    let bytesCount = 0;
	    while (i !== head) {
	      bytesCount += bytes[i++];
	      i = i % samplesCount;
	    }
	    head = (head + 1) % samplesCount;
	    if (head === tail) {
	      tail = (tail + 1) % samplesCount;
	    }
	    if (now - firstSampleTS < min) {
	      return;
	    }
	    const passed = startedAt && now - startedAt;
	    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
	  };
	}
	var speedometer_default = speedometer;
	
	// node_modules/axios/lib/helpers/throttle.js
	function throttle(fn, freq) {
	  let timestamp = 0;
	  let threshold = 1e3 / freq;
	  let lastArgs;
	  let timer;
	  const invoke = (args, now = Date.now()) => {
	    timestamp = now;
	    lastArgs = null;
	    if (timer) {
	      clearTimeout(timer);
	      timer = null;
	    }
	    fn(...args);
	  };
	  const throttled = (...args) => {
	    const now = Date.now();
	    const passed = now - timestamp;
	    if (passed >= threshold) {
	      invoke(args, now);
	    } else {
	      lastArgs = args;
	      if (!timer) {
	        timer = setTimeout(() => {
	          timer = null;
	          invoke(lastArgs);
	        }, threshold - passed);
	      }
	    }
	  };
	  const flush = () => lastArgs && invoke(lastArgs);
	  const flushWith = (...args) => invoke(args);
	  return [throttled, flush, flushWith];
	}
	var throttle_default = throttle;
	
	// node_modules/axios/lib/helpers/progressEventReducer.js
	var progressEventReducer = (listener, isDownloadStream, freq = 3) => {
	  let bytesNotified = 0;
	  const _speedometer = speedometer_default(50, 250);
	  return throttle_default((e) => {
	    if (!e || !utils_default.isNumber(e.loaded)) {
	      return;
	    }
	    const rawLoaded = e.loaded;
	    const total = e.lengthComputable ? e.total : void 0;
	    const loaded = Math.max(0, total != null ? Math.min(rawLoaded, total) : rawLoaded);
	    const progressBytes = Math.max(0, loaded - bytesNotified);
	    const rate = _speedometer(progressBytes);
	    bytesNotified = Math.max(bytesNotified, loaded);
	    const data = {
	      loaded,
	      total,
	      progress: total ? loaded / total : void 0,
	      bytes: progressBytes,
	      rate: rate ? rate : void 0,
	      estimated: rate && total ? (total - loaded) / rate : void 0,
	      event: e,
	      lengthComputable: total != null,
	      [isDownloadStream ? "download" : "upload"]: true
	    };
	    listener(data);
	  }, freq);
	};
	
	// node_modules/axios/lib/helpers/isURLSameOrigin.js
	var isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
	  url = new URL(url, platform_default.origin);
	  return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
	})(
	  new URL(platform_default.origin),
	  platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)
	) : () => true;
	
	// node_modules/axios/lib/helpers/cookies.js
	var cookies_default = platform_default.hasStandardBrowserEnv ? (
	  // Standard browser envs support document.cookie
	  {
	    write(name, value, expires, path, domain, secure, sameSite) {
	      if (typeof document === "undefined") return;
	      const cookie = [`${name}=${encodeURIComponent(value)}`];
	      if (utils_default.isNumber(expires)) {
	        cookie.push(`expires=${new Date(expires).toUTCString()}`);
	      }
	      if (utils_default.isString(path)) {
	        cookie.push(`path=${path}`);
	      }
	      if (utils_default.isString(domain)) {
	        cookie.push(`domain=${domain}`);
	      }
	      if (secure === true) {
	        cookie.push("secure");
	      }
	      if (utils_default.isString(sameSite)) {
	        cookie.push(`SameSite=${sameSite}`);
	      }
	      document.cookie = cookie.join("; ");
	    },
	    read(name) {
	      if (typeof document === "undefined") return null;
	      const cookies = document.cookie.split(";");
	      for (let i = 0; i < cookies.length; i++) {
	        const cookie = cookies[i].replace(/^\s+/, "");
	        const eq = cookie.indexOf("=");
	        if (eq !== -1 && cookie.slice(0, eq) === name) {
	          try {
	            return decodeURIComponent(cookie.slice(eq + 1));
	          } catch (e) {
	            return cookie.slice(eq + 1);
	          }
	        }
	      }
	      return null;
	    },
	    remove(name) {
	      this.write(name, "", Date.now() - 864e5, "/");
	    }
	  }
	) : (
	  // Non-standard browser env (web workers, react-native) lack needed support.
	  {
	    write() {
	    },
	    read() {
	      return null;
	    },
	    remove() {
	    }
	  }
	);
	
	// node_modules/axios/lib/helpers/isAbsoluteURL.js
	function isAbsoluteURL(url) {
	  if (typeof url !== "string") {
	    return false;
	  }
	  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
	}
	
	// node_modules/axios/lib/helpers/combineURLs.js
	function combineURLs(baseURL, relativeURL) {
	  if (!relativeURL) {
	    return baseURL;
	  }
	  let end = baseURL.length;
	  while (end > 0 && baseURL.charCodeAt(end - 1) === 47) {
	    end--;
	  }
	  return baseURL.slice(0, end) + "/" + relativeURL.replace(/^\/+/, "");
	}
	
	// node_modules/axios/lib/core/buildFullPath.js
	var malformedHttpProtocol = /^https?:(?!\/\/)/i;
	function redactFragment(fragment) {
	  if (!fragment) {
	    return fragment;
	  }
	  return fragment.replace(/(^|&)([^=&]*=)?[^&]+/g, (match, separator, parameterName = "") => {
	    return `${separator}${parameterName}${REDACTED}`;
	  });
	}
	function redactSensitiveURLParts(url) {
	  const redactedURL = url.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${REDACTED}@`);
	  const fragmentIndex = redactedURL.indexOf("#");
	  const urlWithoutFragment = fragmentIndex === -1 ? redactedURL : redactedURL.slice(0, fragmentIndex);
	  const redactedURLWithoutFragment = urlWithoutFragment.replace(
	    /([?&][^=&#]*=)[^&#]*/g,
	    `$1${REDACTED}`
	  );
	  if (fragmentIndex === -1) {
	    return redactedURLWithoutFragment;
	  }
	  return `${redactedURLWithoutFragment}#${redactFragment(redactedURL.slice(fragmentIndex + 1))}`;
	}
	function assertValidHttpProtocolURL(url, config) {
	  if (typeof url === "string") {
	    const normalizedURL = normalizeURLForProtocolCheck(url);
	    if (malformedHttpProtocol.test(normalizedURL)) {
	      throw new AxiosError_default(
	        `Invalid URL ${JSON.stringify(redactSensitiveURLParts(normalizedURL))}: missing "//" after protocol`,
	        AxiosError_default.ERR_INVALID_URL,
	        config
	      );
	    }
	  }
	}
	function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls, config) {
	  assertValidHttpProtocolURL(requestedURL, config);
	  let isRelativeUrl = !isAbsoluteURL(requestedURL);
	  if (baseURL && (isRelativeUrl || allowAbsoluteUrls === false)) {
	    assertValidHttpProtocolURL(baseURL, config);
	    return combineURLs(baseURL, requestedURL);
	  }
	  return requestedURL;
	}
	
	// node_modules/axios/lib/core/mergeConfig.js
	var headersToObject = (thing) => thing instanceof AxiosHeaders_default ? __spreadValues({}, thing) : thing;
	var ownEnumerableKeys = (thing) => {
	  if (Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor) {
	    return Object.keys(thing).concat(
	      Object.getOwnPropertySymbols(thing).filter(
	        (symbol) => Object.getOwnPropertyDescriptor(thing, symbol).enumerable
	      )
	    );
	  }
	  return Object.keys(thing);
	};
	function mergeConfig(config1, config2) {
	  config1 = config1 || {};
	  config2 = config2 || {};
	  const config = /* @__PURE__ */ Object.create(null);
	  Object.defineProperty(config, "hasOwnProperty", {
	    // Null-proto descriptor so a polluted Object.prototype.get cannot turn
	    // this data descriptor into an accessor descriptor on the way in.
	    __proto__: null,
	    value: Object.prototype.hasOwnProperty,
	    enumerable: false,
	    writable: true,
	    configurable: true
	  });
	  function getMergedValue(target, source, prop, caseless) {
	    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
	      return utils_default.merge.call({ caseless }, target, source);
	    } else if (utils_default.isPlainObject(source)) {
	      return utils_default.merge({}, source);
	    } else if (utils_default.isArray(source)) {
	      return source.slice();
	    }
	    return source;
	  }
	  function mergeDeepProperties(a, b, prop, caseless) {
	    if (!utils_default.isUndefined(b)) {
	      return getMergedValue(a, b, prop, caseless);
	    } else if (!utils_default.isUndefined(a)) {
	      return getMergedValue(void 0, a, prop, caseless);
	    }
	  }
	  function valueFromConfig2(a, b) {
	    if (!utils_default.isUndefined(b)) {
	      return getMergedValue(void 0, b);
	    }
	  }
	  function defaultToConfig2(a, b) {
	    if (!utils_default.isUndefined(b)) {
	      return getMergedValue(void 0, b);
	    } else if (!utils_default.isUndefined(a)) {
	      return getMergedValue(void 0, a);
	    }
	  }
	  function getMergedTransitionalOption(prop) {
	    const transitional2 = utils_default.hasOwnProp(config2, "transitional") ? config2.transitional : void 0;
	    if (!utils_default.isUndefined(transitional2)) {
	      if (utils_default.isPlainObject(transitional2)) {
	        if (utils_default.hasOwnProp(transitional2, prop)) {
	          return transitional2[prop];
	        }
	      } else {
	        return void 0;
	      }
	    }
	    const transitional1 = utils_default.hasOwnProp(config1, "transitional") ? config1.transitional : void 0;
	    if (utils_default.isPlainObject(transitional1) && utils_default.hasOwnProp(transitional1, prop)) {
	      return transitional1[prop];
	    }
	    return void 0;
	  }
	  function mergeDirectKeys(a, b, prop) {
	    if (utils_default.hasOwnProp(config2, prop)) {
	      return getMergedValue(a, b);
	    } else if (utils_default.hasOwnProp(config1, prop)) {
	      return getMergedValue(void 0, a);
	    }
	  }
	  const mergeMap = {
	    url: valueFromConfig2,
	    method: valueFromConfig2,
	    data: valueFromConfig2,
	    baseURL: defaultToConfig2,
	    transformRequest: defaultToConfig2,
	    transformResponse: defaultToConfig2,
	    paramsSerializer: defaultToConfig2,
	    timeout: defaultToConfig2,
	    timeoutErrorMessage: defaultToConfig2,
	    withCredentials: defaultToConfig2,
	    withXSRFToken: defaultToConfig2,
	    adapter: defaultToConfig2,
	    responseType: defaultToConfig2,
	    xsrfCookieName: defaultToConfig2,
	    xsrfHeaderName: defaultToConfig2,
	    onUploadProgress: defaultToConfig2,
	    onDownloadProgress: defaultToConfig2,
	    decompress: defaultToConfig2,
	    maxContentLength: defaultToConfig2,
	    maxBodyLength: defaultToConfig2,
	    beforeRedirect: defaultToConfig2,
	    transport: defaultToConfig2,
	    httpAgent: defaultToConfig2,
	    httpsAgent: defaultToConfig2,
	    cancelToken: defaultToConfig2,
	    socketPath: defaultToConfig2,
	    allowedSocketPaths: defaultToConfig2,
	    responseEncoding: defaultToConfig2,
	    validateStatus: mergeDirectKeys,
	    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
	  };
	  utils_default.forEach(ownEnumerableKeys(__spreadValues(__spreadValues({}, config1), config2)), function computeConfigValue(prop) {
	    if (prop === "__proto__" || prop === "constructor" || prop === "prototype") return;
	    const merge2 = utils_default.hasOwnProp(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
	    const a = utils_default.hasOwnProp(config1, prop) ? config1[prop] : void 0;
	    const b = utils_default.hasOwnProp(config2, prop) ? config2[prop] : void 0;
	    const configValue = merge2(a, b, prop);
	    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
	  });
	  if (utils_default.hasOwnProp(config2, "validateStatus") && utils_default.isUndefined(config2.validateStatus) && getMergedTransitionalOption("validateStatusUndefinedResolves") === false) {
	    if (utils_default.hasOwnProp(config1, "validateStatus")) {
	      config.validateStatus = getMergedValue(void 0, config1.validateStatus);
	    } else {
	      delete config.validateStatus;
	    }
	  }
	  return config;
	}
	
	// node_modules/axios/lib/core/setFormDataHeaders.js
	var FORM_DATA_CONTENT_HEADERS = ["content-type", "content-length"];
	function setFormDataHeaders(headers, formHeaders, policy) {
	  if (policy !== "content-only") {
	    headers.set(formHeaders);
	    return;
	  }
	  Object.entries(formHeaders || {}).forEach(([key, val]) => {
	    if (FORM_DATA_CONTENT_HEADERS.includes(key.toLowerCase())) {
	      headers.set(key, val);
	    }
	  });
	}
	
	// node_modules/axios/lib/helpers/resolveConfig.js
	var encodeUTF8 = (str) => encodeURIComponent(str).replace(
	  /%([0-9A-F]{2})/gi,
	  (_, hex) => String.fromCharCode(parseInt(hex, 16))
	);
	function resolveConfig(config) {
	  const newConfig = mergeConfig({}, config);
	  const own2 = (key) => utils_default.hasOwnProp(newConfig, key) ? newConfig[key] : void 0;
	  const data = own2("data");
	  let withXSRFToken = own2("withXSRFToken");
	  const xsrfHeaderName = own2("xsrfHeaderName");
	  const xsrfCookieName = own2("xsrfCookieName");
	  let headers = own2("headers");
	  const auth = own2("auth");
	  const baseURL = own2("baseURL");
	  const allowAbsoluteUrls = own2("allowAbsoluteUrls");
	  const url = own2("url");
	  newConfig.headers = headers = AxiosHeaders_default.from(headers);
	  newConfig.url = buildURL(
	    buildFullPath(baseURL, url, allowAbsoluteUrls, newConfig),
	    own2("params"),
	    own2("paramsSerializer")
	  );
	  if (auth) {
	    const username = utils_default.getSafeProp(auth, "username") || "";
	    const password = utils_default.getSafeProp(auth, "password") || "";
	    try {
	      headers.set(
	        "Authorization",
	        "Basic " + btoa(username + ":" + (password ? encodeUTF8(password) : ""))
	      );
	    } catch (e) {
	      throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_OPTION_VALUE, config);
	    }
	  }
	  if (utils_default.isFormData(data)) {
	    const getHeaders = utils_default.getSafeProp(data, "getHeaders");
	    if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv || utils_default.isReactNative(data)) {
	      headers.setContentType(void 0);
	    } else if (utils_default.isFunction(getHeaders)) {
	      setFormDataHeaders(headers, getHeaders.call(data), own2("formDataHeaderPolicy"));
	    }
	  }
	  if (platform_default.hasStandardBrowserEnv) {
	    if (utils_default.isFunction(withXSRFToken)) {
	      withXSRFToken = withXSRFToken(newConfig);
	    }
	    const shouldSendXSRF = withXSRFToken === true || withXSRFToken == null && isURLSameOrigin_default(newConfig.url);
	    if (shouldSendXSRF) {
	      const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
	      if (xsrfValue) {
	        headers.set(xsrfHeaderName, xsrfValue);
	      }
	    }
	  }
	  return newConfig;
	}
	var resolveConfig_default = resolveConfig;
	
	// node_modules/axios/lib/adapters/xhr.js
	var isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
	var xhr_default = isXHRAdapterSupported && function(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    const _config = resolveConfig_default(config);
	    let requestData = _config.data;
	    const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
	    let { responseType, onUploadProgress, onDownloadProgress } = _config;
	    let onCanceled;
	    let uploadThrottled, downloadThrottled;
	    let flushUpload, flushDownload, flushDownloadWithEvent;
	    function done() {
	      flushUpload && flushUpload();
	      flushDownload && flushDownload();
	      _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
	      _config.signal && _config.signal.removeEventListener("abort", onCanceled);
	    }
	    let request = new XMLHttpRequest();
	    request.open(_config.method.toUpperCase(), _config.url, true);
	    request.timeout = _config.timeout;
	    function onloadend(event) {
	      if (!request) {
	        return;
	      }
	      if (request.status === 0 && (parseProtocol(normalizeURLForProtocolCheck(_config.url)) || parseProtocol(platform_default.origin)) !== "file" && !(request.responseURL && request.responseURL.startsWith("file:"))) {
	        reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
	        done();
	        request = null;
	        return;
	      }
	      try {
	        if (event) {
	          flushDownloadWithEvent && flushDownloadWithEvent(event);
	        } else {
	          flushDownload && flushDownload();
	        }
	      } catch (err) {
	        setTimeout(() => {
	          throw err;
	        });
	      }
	      if (!request) {
	        return;
	      }
	      const responseHeaders = AxiosHeaders_default.from(
	        "getAllResponseHeaders" in request && request.getAllResponseHeaders()
	      );
	      const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
	      const response = {
	        data: responseData,
	        status: request.status,
	        statusText: request.statusText,
	        headers: responseHeaders,
	        config,
	        request
	      };
	      settle(
	        function _resolve(value) {
	          resolve(value);
	          done();
	        },
	        function _reject(err) {
	          reject(err);
	          done();
	        },
	        response
	      );
	      request = null;
	    }
	    if ("onloadend" in request) {
	      request.onloadend = onloadend;
	    } else {
	      request.onreadystatechange = function handleLoad() {
	        if (!request || request.readyState !== 4) {
	          return;
	        }
	        if (request.status === 0 && !(request.responseURL && request.responseURL.startsWith("file:"))) {
	          return;
	        }
	        setTimeout(onloadend);
	      };
	    }
	    request.onabort = function handleAbort() {
	      if (!request) {
	        return;
	      }
	      reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
	      done();
	      request = null;
	    };
	    request.onerror = function handleError(event) {
	      const msg = event && event.message ? event.message : "Network Error";
	      const err = new AxiosError_default(msg, AxiosError_default.ERR_NETWORK, config, request);
	      err.event = event || null;
	      reject(err);
	      done();
	      request = null;
	    };
	    request.ontimeout = function handleTimeout() {
	      let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
	      const transitional2 = _config.transitional || transitional_default;
	      if (_config.timeoutErrorMessage) {
	        timeoutErrorMessage = _config.timeoutErrorMessage;
	      }
	      reject(
	        new AxiosError_default(
	          timeoutErrorMessage,
	          transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
	          config,
	          request
	        )
	      );
	      done();
	      request = null;
	    };
	    requestData === void 0 && requestHeaders.setContentType(null);
	    if ("setRequestHeader" in request) {
	      utils_default.forEach(toByteStringHeaderObject(requestHeaders), function setRequestHeader(val, key) {
	        request.setRequestHeader(key, val);
	      });
	    }
	    if (!utils_default.isUndefined(_config.withCredentials)) {
	      request.withCredentials = !!_config.withCredentials;
	    }
	    if (responseType && responseType !== "json") {
	      request.responseType = _config.responseType;
	    }
	    if (onDownloadProgress) {
	      [downloadThrottled, flushDownload, flushDownloadWithEvent] = progressEventReducer(
	        onDownloadProgress,
	        true
	      );
	      request.addEventListener("progress", downloadThrottled);
	    }
	    if (onUploadProgress && request.upload) {
	      [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
	      request.upload.addEventListener("progress", uploadThrottled);
	      request.upload.addEventListener("loadend", flushUpload);
	    }
	    if (_config.cancelToken || _config.signal) {
	      onCanceled = (cancel) => {
	        if (!request) {
	          return;
	        }
	        reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
	        request.abort();
	        done();
	        request = null;
	      };
	      _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
	      if (_config.signal) {
	        _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
	      }
	    }
	    const protocol = parseProtocol(_config.url);
	    if (protocol && !platform_default.protocols.includes(protocol)) {
	      reject(
	        new AxiosError_default(
	          "Unsupported protocol " + protocol + ":",
	          AxiosError_default.ERR_BAD_REQUEST,
	          config
	        )
	      );
	      done();
	      return;
	    }
	    request.send(requestData || null);
	  });
	};
	
	// stub-fetch-adapter:./fetch.js
	function getFetch() {
	  return void 0;
	}
	
	// node_modules/axios/lib/adapters/adapters.js
	var knownAdapters = {
	  http: null_default,
	  xhr: xhr_default,
	  fetch: {
	    get: getFetch
	  }
	};
	utils_default.forEach(knownAdapters, (fn, value) => {
	  if (fn) {
	    try {
	      Object.defineProperty(fn, "name", { __proto__: null, value });
	    } catch (e) {
	    }
	    Object.defineProperty(fn, "adapterName", { __proto__: null, value });
	  }
	});
	var renderReason = (reason) => `- ${reason}`;
	var isResolvedHandle = (adapter) => utils_default.isFunction(adapter) || adapter === null || adapter === false;
	function getAdapter(adapters, config) {
	  adapters = utils_default.isArray(adapters) ? adapters : [adapters];
	  const { length } = adapters;
	  let nameOrAdapter;
	  let adapter;
	  const rejectedReasons = {};
	  for (let i = 0; i < length; i++) {
	    nameOrAdapter = adapters[i];
	    let id;
	    adapter = nameOrAdapter;
	    if (!isResolvedHandle(nameOrAdapter)) {
	      adapter = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
	      if (adapter === void 0) {
	        throw new AxiosError_default(`Unknown adapter '${id}'`);
	      }
	    }
	    if (adapter && (utils_default.isFunction(adapter) || (adapter = adapter.get(config)))) {
	      break;
	    }
	    rejectedReasons[id || "#" + i] = adapter;
	  }
	  if (!adapter) {
	    const reasons = Object.entries(rejectedReasons).map(
	      ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
	    );
	    let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
	    throw new AxiosError_default(
	      `There is no suitable adapter to dispatch the request ` + s,
	      AxiosError_default.ERR_NOT_SUPPORT
	    );
	  }
	  return adapter;
	}
	var adapters_default = {
	  /**
	   * Resolve an adapter from a list of adapter names or functions.
	   * @type {Function}
	   */
	  getAdapter,
	  /**
	   * Exposes all known adapters
	   * @type {Object<string, Function|Object>}
	   */
	  adapters: knownAdapters
	};
	
	// node_modules/axios/lib/core/dispatchRequest.js
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }
	  if (config.signal && config.signal.aborted) {
	    throw new CanceledError_default(null, config);
	  }
	}
	function dispatchRequest(_config) {
	  const config = utils_default.toSafeFlatObject(_config);
	  throwIfCancellationRequested(config);
	  config.headers = AxiosHeaders_default.from(utils_default.getSafeProp(config, "headers"));
	  config.data = transformData.call(config, config.transformRequest);
	  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
	    config.headers.setContentType("application/x-www-form-urlencoded", false);
	  }
	  const adapter = adapters_default.getAdapter(config.adapter || defaults_default.adapter, config);
	  return adapter(config).then(
	    function onAdapterResolution(response) {
	      throwIfCancellationRequested(config);
	      config.response = response;
	      try {
	        response.data = transformData.call(config, config.transformResponse, response);
	      } finally {
	        delete config.response;
	      }
	      response.headers = AxiosHeaders_default.from(response.headers);
	      return response;
	    },
	    function onAdapterRejection(reason) {
	      if (!isCancel(reason)) {
	        throwIfCancellationRequested(config);
	        if (reason && reason.response) {
	          config.response = reason.response;
	          try {
	            reason.response.data = transformData.call(
	              config,
	              config.transformResponse,
	              reason.response
	            );
	          } finally {
	            delete config.response;
	          }
	          reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
	        }
	      }
	      return Promise.reject(reason);
	    }
	  );
	}
	
	// node_modules/axios/lib/env/data.js
	var VERSION = "1.20.0";
	
	// node_modules/axios/lib/helpers/validator.js
	var validators = {};
	["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
	  validators[type] = function validator(thing) {
	    return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
	  };
	});
	var deprecatedWarnings = {};
	validators.transitional = function transitional(validator, version, message) {
	  function formatMessage(opt, desc) {
	    return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
	  }
	  return (value, opt, opts) => {
	    if (validator === false) {
	      throw new AxiosError_default(
	        formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
	        AxiosError_default.ERR_DEPRECATED
	      );
	    }
	    if (version && !deprecatedWarnings[opt]) {
	      deprecatedWarnings[opt] = true;
	      console.warn(
	        formatMessage(
	          opt,
	          " has been deprecated since v" + version + " and will be removed in the near future"
	        )
	      );
	    }
	    return validator ? validator(value, opt, opts) : true;
	  };
	};
	validators.spelling = function spelling(correctSpelling) {
	  return (value, opt) => {
	    console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
	    return true;
	  };
	};
	function assertOptions(options, schema, allowUnknown) {
	  if (typeof options !== "object" || options === null) {
	    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
	  }
	  const keys = Object.keys(options);
	  let i = keys.length;
	  while (i-- > 0) {
	    const opt = keys[i];
	    const validator = Object.prototype.hasOwnProperty.call(schema, opt) ? schema[opt] : void 0;
	    if (validator) {
	      const value = options[opt];
	      const result = value === void 0 || validator(value, opt, options);
	      if (result !== true) {
	        throw new AxiosError_default(
	          "option " + opt + " must be " + result,
	          AxiosError_default.ERR_BAD_OPTION_VALUE
	        );
	      }
	      continue;
	    }
	    if (allowUnknown !== true) {
	      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
	    }
	  }
	}
	var validator_default = {
	  assertOptions,
	  validators
	};
	
	// node_modules/axios/lib/core/Axios.js
	var validators2 = validator_default.validators;
	var Axios = class {
	  constructor(instanceConfig) {
	    this.defaults = instanceConfig || {};
	    this.interceptors = {
	      request: new InterceptorManager_default(),
	      response: new InterceptorManager_default()
	    };
	  }
	  /**
	   * Dispatch a request
	   *
	   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
	   * @param {?Object} config
	   *
	   * @returns {Promise} The Promise to be fulfilled
	   */
	  request(configOrUrl, config) {
	    return __async(this, null, function* () {
	      try {
	        return yield this._request(configOrUrl, config);
	      } catch (err) {
	        if (err instanceof Error) {
	          try {
	            let dummy = {};
	            Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
	            const dummyStack = dummy.stack;
	            let stack = "";
	            if (typeof dummyStack === "string") {
	              const firstNewlineIndex = dummyStack.indexOf("\n");
	              stack = firstNewlineIndex === -1 ? "" : dummyStack.slice(firstNewlineIndex + 1);
	            }
	            if (!err.stack) {
	              err.stack = stack;
	            } else if (stack) {
	              const firstNewlineIndex = stack.indexOf("\n");
	              const secondNewlineIndex = firstNewlineIndex === -1 ? -1 : stack.indexOf("\n", firstNewlineIndex + 1);
	              const stackWithoutTwoTopLines = secondNewlineIndex === -1 ? "" : stack.slice(secondNewlineIndex + 1);
	              if (!String(err.stack).endsWith(stackWithoutTwoTopLines)) {
	                err.stack += "\n" + stack;
	              }
	            }
	          } catch (e) {
	          }
	        }
	        throw err;
	      }
	    });
	  }
	  _request(configOrUrl, config) {
	    if (typeof configOrUrl === "string") {
	      config = config || {};
	      config.url = configOrUrl;
	    } else {
	      config = configOrUrl || {};
	    }
	    config = mergeConfig(this.defaults, config);
	    const { transitional: transitional2, paramsSerializer, headers } = config;
	    if (transitional2 !== void 0) {
	      validator_default.assertOptions(
	        transitional2,
	        {
	          silentJSONParsing: validators2.transitional(validators2.boolean),
	          forcedJSONParsing: validators2.transitional(validators2.boolean),
	          clarifyTimeoutError: validators2.transitional(validators2.boolean),
	          legacyInterceptorReqResOrdering: validators2.transitional(validators2.boolean),
	          advertiseZstdAcceptEncoding: validators2.transitional(validators2.boolean),
	          validateStatusUndefinedResolves: validators2.transitional(validators2.boolean)
	        },
	        false
	      );
	    }
	    if (paramsSerializer != null) {
	      if (utils_default.isFunction(paramsSerializer)) {
	        config.paramsSerializer = {
	          serialize: paramsSerializer
	        };
	      } else {
	        validator_default.assertOptions(
	          paramsSerializer,
	          {
	            encode: validators2.function,
	            serialize: validators2.function
	          },
	          true
	        );
	      }
	    }
	    if (config.allowAbsoluteUrls !== void 0) {
	    } else if (this.defaults.allowAbsoluteUrls !== void 0) {
	      config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
	    } else {
	      config.allowAbsoluteUrls = true;
	    }
	    validator_default.assertOptions(
	      config,
	      {
	        baseUrl: validators2.spelling("baseURL"),
	        withXsrfToken: validators2.spelling("withXSRFToken")
	      },
	      true
	    );
	    config.method = (utils_default.getSafeProp(config, "method") || utils_default.getSafeProp(this.defaults, "method") || "get").toLowerCase();
	    let contextHeaders = headers && utils_default.merge(headers.common, headers[config.method]);
	    headers && utils_default.forEach(methodList_default.concat("common"), (method) => {
	      delete headers[method];
	    });
	    config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
	    const requestInterceptorChain = [];
	    let synchronousRequestInterceptors = true;
	    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	      if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
	        return;
	      }
	      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
	      const transitional3 = config.transitional || transitional_default;
	      const legacyInterceptorReqResOrdering = transitional3 && transitional3.legacyInterceptorReqResOrdering;
	      if (legacyInterceptorReqResOrdering) {
	        requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
	      } else {
	        requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
	      }
	    });
	    const responseInterceptorChain = [];
	    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
	    });
	    let promise;
	    let i = 0;
	    let len;
	    if (!synchronousRequestInterceptors) {
	      const chain = [dispatchRequest.bind(this), void 0];
	      chain.unshift(...requestInterceptorChain);
	      chain.push(...responseInterceptorChain);
	      len = chain.length;
	      promise = Promise.resolve(config);
	      while (i < len) {
	        promise = promise.then(chain[i++], chain[i++]);
	      }
	      return promise;
	    }
	    len = requestInterceptorChain.length;
	    let newConfig = config;
	    while (i < len) {
	      const onFulfilled = requestInterceptorChain[i++];
	      const onRejected = requestInterceptorChain[i++];
	      try {
	        newConfig = onFulfilled ? onFulfilled(newConfig) : newConfig;
	      } catch (error) {
	        if (!onRejected) {
	          promise = Promise.reject(error);
	          break;
	        }
	        try {
	          const rejectedResult = onRejected.call(this, error);
	          if (utils_default.isThenable(rejectedResult)) {
	            promise = Promise.resolve(rejectedResult).then(
	              () => dispatchRequest.call(this, newConfig)
	            );
	          }
	        } catch (rejectedError) {
	          promise = Promise.reject(rejectedError);
	        }
	        break;
	      }
	    }
	    if (!promise) {
	      try {
	        promise = dispatchRequest.call(this, newConfig);
	      } catch (error) {
	        promise = Promise.reject(error);
	      }
	    }
	    i = 0;
	    len = responseInterceptorChain.length;
	    while (i < len) {
	      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
	    }
	    return promise;
	  }
	  getUri(config) {
	    config = mergeConfig(this.defaults, config);
	    const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls, config);
	    return buildURL(fullPath, config.params, config.paramsSerializer);
	  }
	};
	utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
	  Axios.prototype[method] = function(url, config) {
	    return this.request(
	      mergeConfig(config || {}, {
	        method,
	        url,
	        data: config && utils_default.hasOwnProp(config, "data") ? config.data : void 0
	      })
	    );
	  };
	});
	utils_default.forEach(["post", "put", "patch", "query"], function forEachMethodWithData(method) {
	  function generateHTTPMethod(isForm) {
	    return function httpMethod(url, data, config) {
	      return this.request(
	        mergeConfig(config || {}, {
	          method,
	          headers: isForm ? {
	            "Content-Type": "multipart/form-data"
	          } : {},
	          url,
	          data
	        })
	      );
	    };
	  }
	  Axios.prototype[method] = generateHTTPMethod();
	  if (method !== "query") {
	    Axios.prototype[method + "Form"] = generateHTTPMethod(true);
	  }
	});
	var Axios_default = Axios;
	
	// node_modules/axios/lib/cancel/CancelToken.js
	var CancelToken = class _CancelToken {
	  constructor(executor) {
	    if (typeof executor !== "function") {
	      throw new TypeError("executor must be a function.");
	    }
	    let resolvePromise;
	    this.promise = new Promise(function promiseExecutor(resolve) {
	      resolvePromise = resolve;
	    });
	    const token2 = this;
	    this.promise.then((cancel) => {
	      if (!token2._listeners) return;
	      let i = token2._listeners.length;
	      while (i-- > 0) {
	        token2._listeners[i](cancel);
	      }
	      token2._listeners = null;
	    });
	    this.promise.then = (onfulfilled) => {
	      let _resolve;
	      const promise = new Promise((resolve) => {
	        token2.subscribe(resolve);
	        _resolve = resolve;
	      }).then(onfulfilled);
	      promise.cancel = function reject() {
	        token2.unsubscribe(_resolve);
	      };
	      return promise;
	    };
	    executor(function cancel(message, config, request) {
	      if (token2.reason) {
	        return;
	      }
	      token2.reason = new CanceledError_default(message, config, request);
	      resolvePromise(token2.reason);
	    });
	  }
	  /**
	   * Throws a `CanceledError` if cancellation has been requested.
	   */
	  throwIfRequested() {
	    if (this.reason) {
	      throw this.reason;
	    }
	  }
	  /**
	   * Subscribe to the cancel signal
	   */
	  subscribe(listener) {
	    if (this.reason) {
	      listener(this.reason);
	      return;
	    }
	    if (this._listeners) {
	      this._listeners.push(listener);
	    } else {
	      this._listeners = [listener];
	    }
	  }
	  /**
	   * Unsubscribe from the cancel signal
	   */
	  unsubscribe(listener) {
	    if (!this._listeners) {
	      return;
	    }
	    const index = this._listeners.indexOf(listener);
	    if (index !== -1) {
	      this._listeners.splice(index, 1);
	    }
	  }
	  toAbortSignal() {
	    const controller = new AbortController();
	    const abort = (err) => {
	      controller.abort(err);
	    };
	    this.subscribe(abort);
	    controller.signal.unsubscribe = () => this.unsubscribe(abort);
	    return controller.signal;
	  }
	  /**
	   * Returns an object that contains a new `CancelToken` and a function that, when called,
	   * cancels the `CancelToken`.
	   */
	  static source() {
	    let cancel;
	    const token2 = new _CancelToken(function executor(c) {
	      cancel = c;
	    });
	    return {
	      token: token2,
	      cancel
	    };
	  }
	};
	var CancelToken_default = CancelToken;
	
	// node_modules/axios/lib/helpers/spread.js
	function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	}
	
	// node_modules/axios/lib/helpers/isAxiosError.js
	function isAxiosError(payload) {
	  return utils_default.isObject(payload) && payload.isAxiosError === true;
	}
	
	// node_modules/axios/lib/helpers/HttpStatusCode.js
	var HttpStatusCode = {
	  Continue: 100,
	  SwitchingProtocols: 101,
	  Processing: 102,
	  EarlyHints: 103,
	  Ok: 200,
	  Created: 201,
	  Accepted: 202,
	  NonAuthoritativeInformation: 203,
	  NoContent: 204,
	  ResetContent: 205,
	  PartialContent: 206,
	  MultiStatus: 207,
	  AlreadyReported: 208,
	  ImUsed: 226,
	  MultipleChoices: 300,
	  MovedPermanently: 301,
	  Found: 302,
	  SeeOther: 303,
	  NotModified: 304,
	  UseProxy: 305,
	  Unused: 306,
	  TemporaryRedirect: 307,
	  PermanentRedirect: 308,
	  BadRequest: 400,
	  Unauthorized: 401,
	  PaymentRequired: 402,
	  Forbidden: 403,
	  NotFound: 404,
	  MethodNotAllowed: 405,
	  NotAcceptable: 406,
	  ProxyAuthenticationRequired: 407,
	  RequestTimeout: 408,
	  Conflict: 409,
	  Gone: 410,
	  LengthRequired: 411,
	  PreconditionFailed: 412,
	  /**
	   * @deprecated Use `ContentTooLarge` instead.
	   */
	  PayloadTooLarge: 413,
	  ContentTooLarge: 413,
	  UriTooLong: 414,
	  UnsupportedMediaType: 415,
	  RangeNotSatisfiable: 416,
	  ExpectationFailed: 417,
	  ImATeapot: 418,
	  MisdirectedRequest: 421,
	  /**
	   * @deprecated Use `UnprocessableContent` instead.
	   */
	  UnprocessableEntity: 422,
	  UnprocessableContent: 422,
	  Locked: 423,
	  FailedDependency: 424,
	  TooEarly: 425,
	  UpgradeRequired: 426,
	  PreconditionRequired: 428,
	  TooManyRequests: 429,
	  RequestHeaderFieldsTooLarge: 431,
	  UnavailableForLegalReasons: 451,
	  InternalServerError: 500,
	  NotImplemented: 501,
	  BadGateway: 502,
	  ServiceUnavailable: 503,
	  GatewayTimeout: 504,
	  HttpVersionNotSupported: 505,
	  VariantAlsoNegotiates: 506,
	  InsufficientStorage: 507,
	  LoopDetected: 508,
	  NotExtended: 510,
	  NetworkAuthenticationRequired: 511,
	  WebServerReturnsAnUnknownError: 520,
	  WebServerIsDown: 521,
	  ConnectionTimedOut: 522,
	  OriginIsUnreachable: 523,
	  TimeoutOccurred: 524,
	  SslHandshakeFailed: 525,
	  InvalidSslCertificate: 526
	};
	Object.entries(HttpStatusCode).forEach(([key, value]) => {
	  if (HttpStatusCode[value] === void 0) {
	    HttpStatusCode[value] = key;
	  }
	});
	var HttpStatusCode_default = HttpStatusCode;
	
	// node_modules/axios/lib/axios.js
	function createInstance(defaultConfig) {
	  const context = new Axios_default(defaultConfig);
	  const instance = bind(Axios_default.prototype.request, context);
	  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
	  utils_default.extend(instance, context, null, { allOwnKeys: true });
	  instance.create = function create2(instanceConfig) {
	    return createInstance(mergeConfig(defaultConfig, instanceConfig));
	  };
	  return instance;
	}
	var axios = createInstance(defaults_default);
	axios.Axios = Axios_default;
	axios.CanceledError = CanceledError_default;
	axios.CancelToken = CancelToken_default;
	axios.isCancel = isCancel;
	axios.VERSION = VERSION;
	axios.toFormData = toFormData_default;
	axios.AxiosError = AxiosError_default;
	axios.Cancel = axios.CanceledError;
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = spread;
	axios.isAxiosError = isAxiosError;
	axios.mergeConfig = mergeConfig;
	axios.AxiosHeaders = AxiosHeaders_default;
	axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
	axios.getAdapter = adapters_default.getAdapter;
	axios.HttpStatusCode = HttpStatusCode_default;
	axios.default = axios;
	var axios_default = axios;
	
	// node_modules/axios/index.js
	var {
	  Axios: Axios2,
	  AxiosError: AxiosError2,
	  CanceledError: CanceledError2,
	  isCancel: isCancel2,
	  CancelToken: CancelToken2,
	  VERSION: VERSION2,
	  all: all2,
	  Cancel,
	  isAxiosError: isAxiosError2,
	  spread: spread2,
	  toFormData: toFormData2,
	  AxiosHeaders: AxiosHeaders2,
	  HttpStatusCode: HttpStatusCode2,
	  formToJSON,
	  getAdapter: getAdapter2,
	  mergeConfig: mergeConfig2,
	  create
	} = axios_default;
	
	// src/crud/crud.ts
	var Crud = class extends AbstractCrud {
	  constructor() {
	    super(...arguments);
	    this.http = axios_default;
	  }
	};
	
	// src/crud/abstract.collection.ts
	var AbstractCollection = class extends AbstractCrud {
	  constructor(api, initialCast, childrenCasts) {
	    super(api, null, initialCast, childrenCasts);
	    this.data = [];
	    this.model = this.data;
	    this.customMixin = this.mixin;
	  }
	  mixin(data) {
	    if (!data || !(data instanceof Array)) {
	      throw "[Crud][Collection] An Array payload is expected.";
	    }
	    this.data = [];
	    data.forEach((item) => {
	      let instance = {};
	      if (this.initialCast) {
	        if (this.initialCast instanceof Function) {
	          instance = new this.initialCast();
	        } else {
	          instance = new this.initialCast.type(...this.initialCast.deps);
	        }
	      }
	      Mix.extend(instance, item, this.childrenCasts);
	      this.data.push(instance);
	    });
	  }
	};
	
	// src/crud/collection.ts
	var Collection = class extends AbstractCollection {
	  constructor(api, initialCast, childrenCasts) {
	    super(api, initialCast, childrenCasts);
	    this.http = axios_default;
	  }
	};
	
	// src/crud/abstract.model.ts
	var AbstractModel = class extends AbstractCrud {
	  constructor(api, childrenCasts) {
	    super(api, null, null, childrenCasts);
	    this.model = this;
	    this.customMixin = this.mixin;
	  }
	  mixin(data) {
	    if (!data || !(data instanceof Object)) {
	      throw "[Crud][Collection] An Object payload is expected.";
	    }
	    Mix.extend(this, data, this.childrenCasts);
	  }
	};
	
	// src/crud/model.ts
	var Model = class extends AbstractModel {
	  constructor(api, childrenCasts) {
	    super(api, childrenCasts);
	    this.http = axios_default;
	  }
	};
	
	// src/provider.ts
	var Provider = class {
	  constructor(path, className) {
	    this.path = path;
	    this.className = className;
	    this._data = [];
	    this.eventer = new Eventer();
	  }
	  data() {
	    return __async(this, null, function* () {
	      if (!this.isSynced && !this.syncing) {
	        yield this.sync();
	      }
	      if (this.syncing) {
	        yield this.syncDone();
	      }
	      return this._data;
	    });
	  }
	  syncDone() {
	    return __async(this, null, function* () {
	      return new Promise((resolve, reject) => {
	        this.eventer.once("sync", () => resolve());
	      });
	    });
	  }
	  sync() {
	    return __async(this, null, function* () {
	      this.syncing = true;
	      let response = yield axios_default.get(this.path);
	      this._data = Mix.castArrayAs(this.className, response.data);
	      this.isSynced = true;
	      this.eventer.trigger("sync");
	      this.syncing = false;
	    });
	  }
	  refresh() {
	    return __async(this, null, function* () {
	      this.isSynced = false;
	      yield this.sync();
	      this.eventer.trigger("refresh");
	    });
	  }
	  push(data) {
	    this._data.push(data);
	  }
	  remove(data) {
	    let index = this._data.indexOf(data);
	    if (index === -1) return;
	    this._data.splice(index, 1);
	  }
	};
	
	// src/autosaver.ts
	var autosaved = [];
	var loopStarted = false;
	var token;
	var loop = () => {
	  autosaved.forEach((item) => {
	    if (item._backup !== JSON.stringify(item.model)) {
	      if (item.fn) {
	        item.fn();
	      } else {
	        axios_default[item.method](item.path, item.model);
	      }
	      item._backup = JSON.stringify(item.model);
	    }
	  });
	  loopStarted = true;
	  token = setTimeout(loop, 500);
	};
	var Autosave = class {
	  static watch(path, model, method = "put") {
	    if (autosaved.findIndex((e) => e.model === model && e.path === path) !== -1) {
	      return;
	    }
	    let autosave;
	    if (typeof path === "string") {
	      autosave = {
	        model,
	        path,
	        method
	      };
	    } else {
	      autosave = {
	        model,
	        fn: path,
	        method
	      };
	    }
	    autosaved.push(autosave);
	    if (!loopStarted) {
	      loop();
	    }
	  }
	  static unwatch(model) {
	    let index = autosaved.findIndex((e) => e.model === model);
	    autosaved.splice(index, 1);
	    if (autosaved.length === 0) {
	      this.unwatchAll();
	    }
	  }
	  static unwatchAll() {
	    autosaved = [];
	    clearTimeout(token);
	    loopStarted = false;
	  }
	};
	
	// src/http.ts
	var http = {
	  get(url, opts) {
	    return axios_default.get(url, opts);
	  },
	  post(url, data, opts) {
	    return axios_default.post(url, data, opts);
	  },
	  postFile(url, data, opts) {
	    return axios_default.post(url, data, opts);
	  },
	  put(url, data, opts) {
	    return axios_default.put(url, data, opts);
	  },
	  putFile(url, data, opts) {
	    return axios_default.put(url, data, opts);
	  },
	  delete(url, opts) {
	    return axios_default.delete(url, opts);
	  }
	};
	//# sourceMappingURL=index.js.map
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(6).setImmediate, __webpack_require__(8)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var scope = (typeof global !== "undefined" && global) ||
	            (typeof self !== "undefined" && self) ||
	            window;
	var apply = Function.prototype.apply;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(scope, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// setimmediate attaches itself to the global object
	__webpack_require__(7);
	// On some exotic environments, it's not clear which object `setimmediate` was
	// able to install onto.  Search each possibility in the same order as the
	// `setimmediate` library.
	exports.setImmediate = (typeof self !== "undefined" && self.setImmediate) ||
	                       (typeof global !== "undefined" && global.setImmediate) ||
	                       (this && this.setImmediate);
	exports.clearImmediate = (typeof self !== "undefined" && self.clearImmediate) ||
	                         (typeof global !== "undefined" && global.clearImmediate) ||
	                         (this && this.clearImmediate);
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";
	
	    if (global.setImmediate) {
	        return;
	    }
	
	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;
	
	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }
	
	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }
	
	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }
	
	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }
	
	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }
	
	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }
	
	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
	
	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };
	
	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }
	
	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }
	
	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };
	
	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }
	
	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }
	
	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }
	
	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;
	
	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();
	
	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();
	
	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();
	
	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();
	
	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }
	
	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(8)))

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ })
/******/ ]);
//# sourceMappingURL=behaviours.js.map