(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @license twgl.js 0.0.42 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
 * Available via the MIT license.
 * see: http://github.com/greggman/twgl.js for details
 */
/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.twgl = factory();
    }
}(this, function () {

/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var notrequirebecasebrowserifymessesupjs, notrequirebecasebrowserifymessesup, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level notrequirebecasebrowserifymessesup that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a notrequirebecasebrowserifymessesup function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not notrequirebecasebrowserifymessesup('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        notrequirebecasebrowserifymessesup: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [notrequirebecasebrowserifymessesup, exports, module] if no deps
            deps = !deps.length && callback.length ? ['notrequirebecasebrowserifymessesup', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "notrequirebecasebrowserifymessesup") {
                    args[i] = handlers.notrequirebecasebrowserifymessesup(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    notrequirebecasebrowserifymessesupjs = notrequirebecasebrowserifymessesup = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support notrequirebecasebrowserifymessesup(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use notrequirebecasebrowserifymessesup('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    notrequirebecasebrowserifymessesupjs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("node_modules/almond/almond.js", function(){});

/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
define('twgl/typedarrays',[], function () {
  

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line

  /* DataType */
  var BYTE                           = 0x1400;
  var UNSIGNED_BYTE                  = 0x1401;
  var SHORT                          = 0x1402;
  var UNSIGNED_SHORT                 = 0x1403;
  var INT                            = 0x1404;
  var UNSIGNED_INT                   = 0x1405;
  var FLOAT                          = 0x1406;

  /**
   * Get the GL type for a typedArray
   * @param {ArrayBuffer|ArrayBufferView} typedArray a typedArray
   * @return {number} the GL type for array. For example pass in an `Int8Array` and `gl.BYTE` will
   *   be returned. Pass in a `Uint32Array` and `gl.UNSIGNED_INT` will be returned
   * @memberOf module:twgl
   */
  function getGLTypeForTypedArray(typedArray) {
    if (typedArray instanceof Int8Array)    { return BYTE; }           // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return UNSIGNED_BYTE; }  // eslint-disable-line
    if (typedArray instanceof Int16Array)   { return SHORT; }          // eslint-disable-line
    if (typedArray instanceof Uint16Array)  { return UNSIGNED_SHORT; } // eslint-disable-line
    if (typedArray instanceof Int32Array)   { return INT; }            // eslint-disable-line
    if (typedArray instanceof Uint32Array)  { return UNSIGNED_INT; }   // eslint-disable-line
    if (typedArray instanceof Float32Array) { return FLOAT; }          // eslint-disable-line
    throw "unsupported typed array type";
  }

  /**
   * Get the typed array constructor for a given GL type
   * @param {number} type the GL type. (eg: `gl.UNSIGNED_INT`)
   * @return {function} the constructor for a the corresponding typed array. (eg. `Uint32Array`).
   * @memberOf module:twgl
   */
  function getTypedArrayTypeForGLType(type) {
    switch (type) {
      case BYTE:           return Int8Array;     // eslint-disable-line
      case UNSIGNED_BYTE:  return Uint8Array;    // eslint-disable-line
      case SHORT:          return Int16Array;    // eslint-disable-line
      case UNSIGNED_SHORT: return Uint16Array;   // eslint-disable-line
      case INT:            return Int32Array;    // eslint-disable-line
      case UNSIGNED_INT:   return Uint32Array;   // eslint-disable-line
      case FLOAT:          return Float32Array;  // eslint-disable-line
      default:
        throw "unknown gl type";
    }
  }

  function isArrayBuffer(a) {
    return a && a.buffer && a.buffer instanceof ArrayBuffer;
  }

  // Using quotes prevents Uglify from changing the names.
  return {
    "getGLTypeForTypedArray": getGLTypeForTypedArray,
    "getTypedArrayTypeForGLType": getTypedArrayTypeForGLType,
    "isArrayBuffer": isArrayBuffer,
  };
});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define('twgl/attributes',[
    './typedarrays',
  ], function (
    typedArrays) {
  

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line
  var defaults = {
    attribPrefix: "",
  };

  /**
   * Sets the default attrib prefix
   *
   * When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
   * as it makes it clear where they came from. But, when building geometry I prefer using unprefixed names.
   *
   * In otherwords I'll create arrays of geometry like this
   *
   *     var arrays = {
   *       position: ...
   *       normal: ...
   *       texcoord: ...
   *     };
   *
   * But need those mapped to attributes and my attributes start with `a_`.
   *
   * @deprecated see {@link module:twgl.setDefaults}
   * @param {string} prefix prefix for attribs
   * @memberOf module:twgl
   */
  function setAttributePrefix(prefix) {
    defaults.attribPrefix = prefix;
  }

  function setDefaults(newDefaults) {
    Object.keys(newDefaults).forEach(function(key) {
      defaults[key] = newDefaults[key];
    });
  }

  function setBufferFromTypedArray(gl, type, buffer, array, drawType) {
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
  }

  /**
   * Given typed array creates a WebGLBuffer and copies the typed array
   * into it.
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {ArrayBuffer|ArrayBufferView|WebGLBuffer} typedArray the typed array. Note: If a WebGLBuffer is passed in it will just be returned. No action will be taken
   * @param {number} [type] the GL bind type for the buffer. Default = `gl.ARRAY_BUFFER`.
   * @param {number} [drawType] the GL draw type for the buffer. Default = 'gl.STATIC_DRAW`.
   * @return {WebGLBuffer} the created WebGLBuffer
   * @memberOf module:twgl
   */
  function createBufferFromTypedArray(gl, typedArray, type, drawType) {
    if (typedArray instanceof WebGLBuffer) {
      return typedArray;
    }
    type = type || gl.ARRAY_BUFFER;
    var buffer = gl.createBuffer();
    setBufferFromTypedArray(gl, type, buffer, typedArray, drawType);
    return buffer;
  }

  function isIndices(name) {
    return name === "indices";
  }

  // This is really just a guess. Though I can't really imagine using
  // anything else? Maybe for some compression?
  function getNormalizationForTypedArray(typedArray) {
    if (typedArray instanceof Int8Array)    { return true; }  // eslint-disable-line
    if (typedArray instanceof Uint8Array)   { return true; }  // eslint-disable-line
    return false;
  }

  function guessNumComponentsFromName(name, length) {
    var numComponents;
    if (name.indexOf("coord") >= 0) {
      numComponents = 2;
    } else if (name.indexOf("color") >= 0) {
      numComponents = 4;
    } else {
      numComponents = 3;  // position, normals, indices ...
    }

    if (length % numComponents > 0) {
      throw "can not guess numComponents. You should specify it.";
    }

    return numComponents;
  }

  function makeTypedArray(array, name) {
    if (typedArrays.isArrayBuffer(array)) {
      return array;
    }

    if (typedArrays.isArrayBuffer(array.data)) {
      return array.data;
    }

    if (Array.isArray(array)) {
      array = {
        data: array,
      };
    }

    var Type = array.type;
    if (!Type) {
      if (name === "indices") {
        Type = Uint16Array;
      } else {
        Type = Float32Array;
      }
    }
    return new Type(array.data);
  }

  /**
   * The info for an attribute. This is effectively just the arguments to `gl.vertexAttribPointer` plus the WebGLBuffer
   * for the attribute.
   *
   * @typedef {Object} AttribInfo
   * @property {number} [numComponents] the number of components for this attribute.
   * @property {number} [size] synonym for `numComponents`.
   * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
   * @property {boolean} [normalized] whether or not to normalize the data. Default = false
   * @property {number} [offset] offset into buffer in bytes. Default = 0
   * @property {number} [stride] the stride in bytes per element. Default = 0
   * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
   * @property {number} [drawType] the draw type passed to gl.bufferData. Default = gl.STATIC_DRAW
   * @memberOf module:twgl
   */

  /**
   * Use this type of array spec when TWGL can't guess the type or number of compoments of an array
   * @typedef {Object} FullArraySpec
   * @property {(number[]|ArrayBuffer)} data The data of the array.
   * @property {number} [numComponents] number of components for `vertexAttribPointer`. Default is based on the name of the array.
   *    If `coord` is in the name assumes `numComponents = 2`.
   *    If `color` is in the name assumes `numComponents = 4`.
   *    otherwise assumes `numComponents = 3`
   * @property {constructor} type The type. This is only used if `data` is a JavaScript array. It is the constructor for the typedarray. (eg. `Uint8Array`).
   * For example if you want colors in a `Uint8Array` you might have a `FullArraySpec` like `{ type: Uint8Array, data: [255,0,255,255, ...], }`.
   * @property {number} [size] synonym for `numComponents`.
   * @property {boolean} [normalize] normalize for `vertexAttribPointer`. Default is true if type is `Int8Array` or `Uint8Array` otherwise false.
   * @property {number} [stride] stride for `vertexAttribPointer`. Default = 0
   * @property {number} [offset] offset for `vertexAttribPointer`. Default = 0
   * @property {string} [attrib] name of attribute this array maps to. Defaults to same name as array prefixed by the default attribPrefix.
   * @property {string} [name] synonym for `attrib`.
   * @property {string} [attribName] synonym for `attrib`.
   * @memberOf module:twgl
   */

  /**
   * An individual array in {@link module:twgl.Arrays}
   *
   * When passed to {@link module:twgl.createBufferInfoFromArrays} if an ArraySpec is `number[]` or `ArrayBuffer`
   * the types will be guessed based on the name. `indices` will be `Uint16Array`, everything else will
   * be `Float32Array`
   *
   * @typedef {(number[]|ArrayBuffer|module:twgl.FullArraySpec)} ArraySpec
   * @memberOf module:twgl
   */

  /**
   * This is a JavaScript object of arrays by name. The names should match your shader's attributes. If your
   * attributes have a common prefix you can specify it by calling {@link module:twgl.setAttributePrefix}.
   *
   *     Bare JavaScript Arrays
   *
   *         var arrays = {
   *            position: [-1, 1, 0],
   *            normal: [0, 1, 0],
   *            ...
   *         }
   *
   *     Bare TypedArrays
   *
   *         var arrays = {
   *            position: new Float32Array([-1, 1, 0]),
   *            color: new Uint8Array([255, 128, 64, 255]),
   *            ...
   *         }
   *
   * *   Will guess at `numComponents` if not specified based on name.
   *
   *     If `coord` is in the name assumes `numComponents = 2`
   *
   *     If `color` is in the name assumes `numComponents = 4`
   *
   *     otherwise assumes `numComponents = 3`
   *
   * Objects with various fields. See {@link module:twgl.FullArraySpec}.
   *
   *     var arrays = {
   *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
   *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
   *     };
   *
   * @typedef {Object.<string, module:twgl.ArraySpec>} Arrays
   * @memberOf module:twgl
   */


  /**
   * Creates a set of attribute data and WebGLBuffers from set of arrays
   *
   * Given
   *
   *      var arrays = {
   *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
   *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
   *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
   *      };
   *
   * returns something like
   *
   *      var attribs = {
   *        position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
   *        color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
   *      };
   *
   * notes:
   *
   * *   Arrays can take various forms
   *
   *     Bare JavaScript Arrays
   *
   *         var arrays = {
   *            position: [-1, 1, 0],
   *            normal: [0, 1, 0],
   *            ...
   *         }
   *
   *     Bare TypedArrays
   *
   *         var arrays = {
   *            position: new Float32Array([-1, 1, 0]),
   *            color: new Uint8Array([255, 128, 64, 255]),
   *            ...
   *         }
   *
   * *   Will guess at `numComponents` if not specified based on name.
   *
   *     If `coord` is in the name assumes `numComponents = 2`
   *
   *     If `color` is in the name assumes `numComponents = 4`
   *
   *     otherwise assumes `numComponents = 3`
   *
   * @param {WebGLRenderingContext} gl The webgl rendering context.
   * @param {module:twgl.Arrays} arrays The arrays
   * @return {Object.<string, module:twgl.AttribInfo>} the attribs
   * @memberOf module:twgl
   */
  function createAttribsFromArrays(gl, arrays) {
    var attribs = {};
    Object.keys(arrays).forEach(function(arrayName) {
      if (!isIndices(arrayName)) {
        var array = arrays[arrayName];
        var attribName = array.attrib || array.name || array.attribName || (defaults.attribPrefix + arrayName);
        var typedArray = makeTypedArray(array, arrayName);
        attribs[attribName] = {
          buffer:        createBufferFromTypedArray(gl, typedArray, undefined, array.drawType),
          numComponents: array.numComponents || array.size || guessNumComponentsFromName(arrayName),
          type:          typedArrays.getGLTypeForTypedArray(typedArray),
          normalize:     array.normalize !== undefined ? array.normalize : getNormalizationForTypedArray(typedArray),
          stride:        array.stride || 0,
          offset:        array.offset || 0,
          drawType:      array.drawType,
        };
      }
    });
    return attribs;
  }

  /**
   * Sets the contents of a buffer attached to an attribInfo
   *
   * This is helper function to dynamically update a buffer.
   *
   * Let's say you make a bufferInfo
   *
   *     var arrays = {
   *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
   *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
   *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
   *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
   *     };
   *     var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
   *
   *  And you want to dynamically upate the positions. You could do this
   *
   *     // assuming arrays.position has already been updated with new data.
   *     twgl.setAttribInfoBufferFromArray(gl, bufferInfo.attribs.position, arrays.position);
   *
   * @param {WebGLRenderingContext} gl
   * @param {AttribInfo} attribInfo The attribInfo who's buffer contents to set. NOTE: If you have an attribute prefix
   *   the name of the attribute will include the prefix.
   * @param {ArraySpec} array Note: it is arguably ineffient to pass in anything but a typed array because anything
   *    else will have to be converted to a typed array before it can be used by WebGL. During init time that
   *    inefficiency is usually not important but if you're updating data dynamically best to be efficient.
   * @param {number} [offset] an optional offset into the buffer. This is only an offset into the WebGL buffer
   *    not the array. To pass in an offset into the array itself use a typed array and create an `ArrayBufferView`
   *    for the portion of the array you want to use.
   *
   *        var someArray = new Float32Array(1000); // an array with 1000 floats
   *        var someSubArray = new Float32Array(someArray.buffer, offsetInBytes, sizeInUnits); // a view into someArray
   *
   *    Now you can pass `someSubArray` into setAttribInfoBufferFromArray`
   * @memberOf module:twgl
   */
  function setAttribInfoBufferFromArray(gl, attribInfo, array, offset) {
    array = makeTypedArray(array);
    if (offset) {
      gl.bindBuffer(gl.ARRAY_BUFFER, attribInfo.buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, offset, array);
    } else {
      setBufferFromTypedArray(gl, gl.ARRAY_BUFFER, attribInfo.buffer, array, attribInfo.drawType);
    }
  }

  /**
   * tries to get the number of elements from a set of arrays.
   */

  var getNumElementsFromNonIndexedArrays = (function() {
    var positionKeys = ['position', 'positions', 'a_position'];

    return function getNumElementsFromNonIndexedArrays(arrays) {
      var key;
      for (var ii = 0; ii < positionKeys.length; ++ii) {
        key = positionKeys[ii];
        if (key in arrays) {
          break;
        }
      }
      if (ii === positionKeys.length) {
        key = Object.keys(arrays)[0];
      }
      var array = arrays[key];
      var length = array.length || array.data.length;
      var numComponents = array.numComponents || guessNumComponentsFromName(key, length);
      var numElements = length / numComponents;
      if (length % numComponents > 0) {
        throw "numComponents " + numComponents + " not correct for length " + length;
      }
      return numElements;
    };
  }());

  /**
   * @typedef {Object} BufferInfo
   * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
   * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
   * @property {Object.<string, module:twgl.AttribInfo>} attribs The attribs approriate to call `setAttributes`
   * @memberOf module:twgl
   */


  /**
   * Creates a BufferInfo from an object of arrays.
   *
   * This can be passed to {@link module:twgl.setBuffersAndAttributes} and to
   * {@link module:twgl:drawBufferInfo}.
   *
   * Given an object like
   *
   *     var arrays = {
   *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
   *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
   *     };
   *
   *  Creates an BufferInfo like this
   *
   *     bufferInfo = {
   *       numElements: 4,        // or whatever the number of elements is
   *       indices: WebGLBuffer,  // this property will not exist if there are no indices
   *       attribs: {
   *         a_position: { buffer: WebGLBuffer, numComponents: 3, },
   *         a_normal:   { buffer: WebGLBuffer, numComponents: 3, },
   *         a_texcoord: { buffer: WebGLBuffer, numComponents: 2, },
   *       },
   *     };
   *
   *  The properties of arrays can be JavaScript arrays in which case the number of components
   *  will be guessed.
   *
   *     var arrays = {
   *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
   *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
   *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
   *        indices:  [0, 1, 2, 1, 2, 3],
   *     };
   *
   *  They can also by TypedArrays
   *
   *     var arrays = {
   *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
   *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
   *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
   *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
   *     };
   *
   *  Or augmentedTypedArrays
   *
   *     var positions = createAugmentedTypedArray(3, 4);
   *     var texcoords = createAugmentedTypedArray(2, 4);
   *     var normals   = createAugmentedTypedArray(3, 4);
   *     var indices   = createAugmentedTypedArray(3, 2, Uint16Array);
   *
   *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
   *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
   *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
   *     indices.push([0, 1, 2, 1, 2, 3]);
   *
   *     var arrays = {
   *        position: positions,
   *        texcoord: texcoords,
   *        normal:   normals,
   *        indices:  indices,
   *     };
   *
   * For the last example it is equivalent to
   *
   *     var bufferInfo = {
   *       attribs: {
   *         a_position: { numComponents: 3, buffer: gl.createBuffer(), },
   *         a_texcoods: { numComponents: 2, buffer: gl.createBuffer(), },
   *         a_normals: { numComponents: 3, buffer: gl.createBuffer(), },
   *       },
   *       indices: gl.createBuffer(),
   *       numElements: 6,
   *     };
   *
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
   *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
   *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
   *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {module:twgl.Arrays} arrays Your data
   * @return {module:twgl.BufferInfo} A BufferInfo
   * @memberOf module:twgl
   */
  function createBufferInfoFromArrays(gl, arrays) {
    var bufferInfo = {
      attribs: createAttribsFromArrays(gl, arrays),
    };
    var indices = arrays.indices;
    if (indices) {
      indices = makeTypedArray(indices, "indices");
      bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
      bufferInfo.numElements = indices.length;
      bufferInfo.elementType = (indices instanceof Uint32Array) ?  gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
    } else {
      bufferInfo.numElements = getNumElementsFromNonIndexedArrays(arrays);
    }

    return bufferInfo;
  }

  /**
   * Creates a buffer from an array, typed array, or array spec
   *
   * Given something like this
   *
   *     [1, 2, 3],
   *
   * or
   *
   *     new Uint16Array([1,2,3]);
   *
   * or
   *
   *     {
   *        data: [1, 2, 3],
   *        type: Uint8Array,
   *     }
   *
   * returns a WebGLBuffer that constains the given data.
   *
   * @param {WebGLRenderingContext) gl A WebGLRenderingContext.
   * @param {module:twgl.ArraySpec} array an array, typed array, or array spec.
   * @param {string} arrayName name of array. Used to guess the type if type can not be dervied other wise.
   * @return {WebGLBuffer} a WebGLBuffer containing the data in array.
   * @memberOf module:twgl
   */
  function createBufferFromArray(gl, array, arrayName) {
    var type = arrayName === "indices" ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    var typedArray = makeTypedArray(array, arrayName);
    return createBufferFromTypedArray(gl, typedArray, type);
  }

  /**
   * Creates buffers from arrays or typed arrays
   *
   * Given something like this
   *
   *     var arrays = {
   *        positions: [1, 2, 3],
   *        normals: [0, 0, 1],
   *     }
   *
   * returns something like
   *
   *     buffers = {
   *       positions: WebGLBuffer,
   *       normals: WebGLBuffer,
   *     }
   *
   * If the buffer is named 'indices' it will be made an ELEMENT_ARRAY_BUFFER.
   *
   * @param {WebGLRenderingContext) gl A WebGLRenderingContext.
   * @param {module:twgl.Arrays} arrays
   * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
   * @memberOf module:twgl
   */
  function createBuffersFromArrays(gl, arrays) {
    var buffers = { };
    Object.keys(arrays).forEach(function(key) {
      buffers[key] = createBufferFromArray(gl, arrays[key], key);
    });

    return buffers;
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "createAttribsFromArrays": createAttribsFromArrays,
    "createBuffersFromArrays": createBuffersFromArrays,
    "createBufferFromArray": createBufferFromArray,
    "createBufferFromTypedArray": createBufferFromTypedArray,
    "createBufferInfoFromArrays": createBufferInfoFromArrays,
    "setAttribInfoBufferFromArray": setAttribInfoBufferFromArray,

    "setAttributePrefix": setAttributePrefix,

    "setDefaults_": setDefaults,
  };

});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define('twgl/programs',[], function () {
  

  var error =
      (    window.console
        && window.console.error
        && typeof window.console.error === "function"
      )
      ? window.console.error.bind(window.console)
      : function() { };
  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line

  /**
   * Error Callback
   * @callback ErrorCallback
   * @param {string} msg error message.
   * @memberOf module:twgl
   */

  function addLineNumbers(src) {
    return src.split("\n").map(function(line, ndx) {
      return (ndx + 1) + ": " + line;
    }).join("\n");
  }

  /**
   * Loads a shader.
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
   * @param {string} shaderSource The shader source.
   * @param {number} shaderType The type of shader.
   * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors.
   * @return {WebGLShader} The created shader.
   */
  function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
    var errFn = opt_errorCallback || error;
    // Create the shader object
    var shader = gl.createShader(shaderType);

    // Load the shader source
    gl.shaderSource(shader, shaderSource);

    // Compile the shader
    gl.compileShader(shader);

    // Check the compile status
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      // Something went wrong during compilation; get the error
      var lastError = gl.getShaderInfoLog(shader);
      errFn(addLineNumbers(shaderSource) + "\n*** Error compiling shader: " + lastError);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Creates a program, attaches shaders, binds attrib locations, links the
   * program and calls useProgram.
   * @param {WebGLShader[]} shaders The shaders to attach
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram?} the created program or null if error.
   * @memberOf module:twgl
   */
  function createProgram(
      gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
    var errFn = opt_errorCallback || error;
    var program = gl.createProgram();
    shaders.forEach(function(shader) {
      gl.attachShader(program, shader);
    });
    if (opt_attribs) {
      opt_attribs.forEach(function(attrib,  ndx) {
        gl.bindAttribLocation(
            program,
            opt_locations ? opt_locations[ndx] : ndx,
            attrib);
      });
    }
    gl.linkProgram(program);

    // Check the link status
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        // something went wrong with the link
        var lastError = gl.getProgramInfoLog(program);
        errFn("Error in program linking:" + lastError);

        gl.deleteProgram(program);
        return null;
    }
    return program;
  }

  /**
   * Loads a shader from a script tag.
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
   * @param {string} scriptId The id of the script tag.
   * @param {number} [opt_shaderType] The type of shader. If not passed in it will
   *     be derived from the type of the script tag.
   * @param {module:twgl.ErrorCallback} [opt_errorCallback] callback for errors.
   * @return {WebGLShader?} The created shader or null if error.
   */
  function createShaderFromScript(
      gl, scriptId, opt_shaderType, opt_errorCallback) {
    var shaderSource = "";
    var shaderType;
    var shaderScript = document.getElementById(scriptId);
    if (!shaderScript) {
      throw "*** Error: unknown script element" + scriptId;
    }
    shaderSource = shaderScript.text;

    if (!opt_shaderType) {
      if (shaderScript.type === "x-shader/x-vertex") {
        shaderType = gl.VERTEX_SHADER;
      } else if (shaderScript.type === "x-shader/x-fragment") {
        shaderType = gl.FRAGMENT_SHADER;
      } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
        throw "*** Error: unknown shader type";
      }
    }

    return loadShader(
        gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
        opt_errorCallback);
  }

  var defaultShaderType = [
    "VERTEX_SHADER",
    "FRAGMENT_SHADER",
  ];

  /**
   * Creates a program from 2 script tags.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderScriptIds Array of ids of the script
   *        tags for the shaders. The first is assumed to be the
   *        vertex shader, the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:twgl
   */
  function createProgramFromScripts(
      gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
    var shaders = [];
    for (var ii = 0; ii < shaderScriptIds.length; ++ii) {
      var shader = createShaderFromScript(
          gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], opt_errorCallback);
      if (!shader) {
        return null;
      }
      shaders.push(shader);
    }
    return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
  }

  /**
   * Creates a program from 2 sources.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {WebGLProgram} The created program.
   * @memberOf module:twgl
   */
  function createProgramFromSources(
      gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
    var shaders = [];
    for (var ii = 0; ii < shaderSources.length; ++ii) {
      var shader = loadShader(
          gl, shaderSources[ii], gl[defaultShaderType[ii]], opt_errorCallback);
      if (!shader) {
        return null;
      }
      shaders.push(shader);
    }
    return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
  }

  /**
   * Returns the corresponding bind point for a given sampler type
   */
  function getBindPointForSamplerType(gl, type) {
    if (type === gl.SAMPLER_2D) {
      return gl.TEXTURE_2D;
    }
    if (type === gl.SAMPLER_CUBE) {
      return gl.TEXTURE_CUBE_MAP;
    }
  }

  /**
   * @typedef {Object.<string,function>} Setters
   */

  /**
   * Creates setter functions for all uniforms of a shader
   * program.
   *
   * @see {@link module:twgl.setUniforms}
   *
   * @param {WebGLProgram} program the program to create setters for.
   * @returns {Object.<string, function>} an object with a setter by name for each uniform
   * @memberOf module:twgl
   */
  function createUniformSetters(gl, program) {
    var textureUnit = 0;

    /**
     * Creates a setter for a uniform of the given program with it's
     * location embedded in the setter.
     * @param {WebGLProgram} program
     * @param {WebGLUniformInfo} uniformInfo
     * @returns {function} the created setter.
     */
    function createUniformSetter(program, uniformInfo) {
      var location = gl.getUniformLocation(program, uniformInfo.name);
      var type = uniformInfo.type;
      // Check if this uniform is an array
      var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
      if (type === gl.FLOAT && isArray) {
        return function(v) {
          gl.uniform1fv(location, v);
        };
      }
      if (type === gl.FLOAT) {
        return function(v) {
          gl.uniform1f(location, v);
        };
      }
      if (type === gl.FLOAT_VEC2) {
        return function(v) {
          gl.uniform2fv(location, v);
        };
      }
      if (type === gl.FLOAT_VEC3) {
        return function(v) {
          gl.uniform3fv(location, v);
        };
      }
      if (type === gl.FLOAT_VEC4) {
        return function(v) {
          gl.uniform4fv(location, v);
        };
      }
      if (type === gl.INT && isArray) {
        return function(v) {
          gl.uniform1iv(location, v);
        };
      }
      if (type === gl.INT) {
        return function(v) {
          gl.uniform1i(location, v);
        };
      }
      if (type === gl.INT_VEC2) {
        return function(v) {
          gl.uniform2iv(location, v);
        };
      }
      if (type === gl.INT_VEC3) {
        return function(v) {
          gl.uniform3iv(location, v);
        };
      }
      if (type === gl.INT_VEC4) {
        return function(v) {
          gl.uniform4iv(location, v);
        };
      }
      if (type === gl.BOOL && isArray) {
        return function(v) {
          gl.uniform1iv(location, v);
        };
      }
      if (type === gl.BOOL) {
        return function(v) {
          gl.uniform1i(location, v);
        };
      }
      if (type === gl.BOOL_VEC2) {
        return function(v) {
          gl.uniform2iv(location, v);
        };
      }
      if (type === gl.BOOL_VEC3) {
        return function(v) {
          gl.uniform3iv(location, v);
        };
      }
      if (type === gl.BOOL_VEC4) {
        return function(v) {
          gl.uniform4iv(location, v);
        };
      }
      if (type === gl.FLOAT_MAT2) {
        return function(v) {
          gl.uniformMatrix2fv(location, false, v);
        };
      }
      if (type === gl.FLOAT_MAT3) {
        return function(v) {
          gl.uniformMatrix3fv(location, false, v);
        };
      }
      if (type === gl.FLOAT_MAT4) {
        return function(v) {
          gl.uniformMatrix4fv(location, false, v);
        };
      }
      if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
        var units = [];
        for (var ii = 0; ii < uniformInfo.size; ++ii) {
          units.push(textureUnit++);
        }
        return function(bindPoint, units) {
          return function(textures) {
            gl.uniform1iv(location, units);
            textures.forEach(function(texture, index) {
              gl.activeTexture(gl.TEXTURE0 + units[index]);
              gl.bindTexture(bindPoint, texture);
            });
          };
        }(getBindPointForSamplerType(gl, type), units);
      }
      if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
        return function(bindPoint, unit) {
          return function(texture) {
            gl.uniform1i(location, unit);
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(bindPoint, texture);
          };
        }(getBindPointForSamplerType(gl, type), textureUnit++);
      }
      throw ("unknown type: 0x" + type.toString(16)); // we should never get here.
    }

    var uniformSetters = { };
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (var ii = 0; ii < numUniforms; ++ii) {
      var uniformInfo = gl.getActiveUniform(program, ii);
      if (!uniformInfo) {
        break;
      }
      var name = uniformInfo.name;
      // remove the array suffix.
      if (name.substr(-3) === "[0]") {
        name = name.substr(0, name.length - 3);
      }
      var setter = createUniformSetter(program, uniformInfo);
      uniformSetters[name] = setter;
    }
    return uniformSetters;
  }

  /**
   * Set uniforms and binds related textures.
   *
   * example:
   *
   *     var programInfo = createProgramInfo(
   *         gl, ["some-vs", "some-fs");
   *
   *     var tex1 = gl.createTexture();
   *     var tex2 = gl.createTexture();
   *
   *     ... assume we setup the textures with data ...
   *
   *     var uniforms = {
   *       u_someSampler: tex1,
   *       u_someOtherSampler: tex2,
   *       u_someColor: [1,0,0,1],
   *       u_somePosition: [0,1,1],
   *       u_someMatrix: [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ],
   *     };
   *
   *     gl.useProgram(program);
   *
   * This will automatically bind the textures AND set the
   * uniforms.
   *
   *     setUniforms(programInfo, uniforms);
   *
   * For the example above it is equivalent to
   *
   *     var texUnit = 0;
   *     gl.activeTexture(gl.TEXTURE0 + texUnit);
   *     gl.bindTexture(gl.TEXTURE_2D, tex1);
   *     gl.uniform1i(u_someSamplerLocation, texUnit++);
   *     gl.activeTexture(gl.TEXTURE0 + texUnit);
   *     gl.bindTexture(gl.TEXTURE_2D, tex2);
   *     gl.uniform1i(u_someSamplerLocation, texUnit++);
   *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
   *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
   *     gl.uniformMatrix4fv(u_someMatrix, false, [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ]);
   *
   * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
   *
   *     var uniforms = {
   *       u_someSampler: tex1,
   *       u_someOtherSampler: tex2,
   *     };
   *
   *     var moreUniforms {
   *       u_someColor: [1,0,0,1],
   *       u_somePosition: [0,1,1],
   *       u_someMatrix: [
   *         1,0,0,0,
   *         0,1,0,0,
   *         0,0,1,0,
   *         0,0,0,0,
   *       ],
   *     };
   *
   *     setUniforms(programInfo, uniforms);
   *     setUniforms(programInfo, moreUniforms);
   *
   * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters a `ProgramInfo` as returned from `createProgramInfo` or the setters returned from
   *        `createUniformSetters`.
   * @param {Object.<string, ?>} values an object with values for the
   *        uniforms.
   *   You can pass multiple objects by putting them in an array or by calling with more arguments.For example
   *
   *     var sharedUniforms = {
   *       u_fogNear: 10,
   *       u_projection: ...
   *       ...
   *     };
   *
   *     var localUniforms = {
   *       u_world: ...
   *       u_diffuseColor: ...
   *     };
   *
   *     twgl.setUniforms(programInfo, sharedUniforms, localUniforms);
   *
   *     // is the same as
   *
   *     twgl.setUniforms(programInfo, [sharedUniforms, localUniforms]);
   *
   *     // is the same as
   *
   *     twgl.setUniforms(programInfo, sharedUniforms);
   *     twgl.setUniforms(programInfo, localUniforms};
   *
   * @memberOf module:twgl
   */
  function setUniforms(setters, values) {  // eslint-disable-line
    var actualSetters = setters.uniformSetters || setters;
    var numArgs = arguments.length;
    for (var andx = 1; andx < numArgs; ++andx) {
      var vals = arguments[andx];
      if (Array.isArray(vals)) {
        var numValues = vals.length;
        for (var ii = 0; ii < numValues; ++ii) {
          setUniforms(actualSetters, vals[ii]);
        }
      } else {
        for (var name in vals) {
          var setter = actualSetters[name];
          if (setter) {
            setter(vals[name]);
          }
        }
      }
    }
  }

  /**
   * Creates setter functions for all attributes of a shader
   * program. You can pass this to {@link module:twgl.setBuffersAndAttributes} to set all your buffers and attributes.
   *
   * @see {@link module:twgl.setAttributes} for example
   * @param {WebGLProgram} program the program to create setters for.
   * @return {Object.<string, function>} an object with a setter for each attribute by name.
   * @memberOf module:twgl
   */
  function createAttributeSetters(gl, program) {
    var attribSetters = {
    };

    function createAttribSetter(index) {
      return function(b) {
          gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
          gl.enableVertexAttribArray(index);
          gl.vertexAttribPointer(
              index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
        };
    }

    var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (var ii = 0; ii < numAttribs; ++ii) {
      var attribInfo = gl.getActiveAttrib(program, ii);
      if (!attribInfo) {
        break;
      }
      var index = gl.getAttribLocation(program, attribInfo.name);
      attribSetters[attribInfo.name] = createAttribSetter(index);
    }

    return attribSetters;
  }

  /**
   * Sets attributes and binds buffers (deprecated... use {@link module:twgl.setBuffersAndAttributes})
   *
   * Example:
   *
   *     var program = createProgramFromScripts(
   *         gl, ["some-vs", "some-fs");
   *
   *     var attribSetters = createAttributeSetters(program);
   *
   *     var positionBuffer = gl.createBuffer();
   *     var texcoordBuffer = gl.createBuffer();
   *
   *     var attribs = {
   *       a_position: {buffer: positionBuffer, numComponents: 3},
   *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
   *     };
   *
   *     gl.useProgram(program);
   *
   * This will automatically bind the buffers AND set the
   * attributes.
   *
   *     setAttributes(attribSetters, attribs);
   *
   * Properties of attribs. For each attrib you can add
   * properties:
   *
   * *   type: the type of data in the buffer. Default = gl.FLOAT
   * *   normalize: whether or not to normalize the data. Default = false
   * *   stride: the stride. Default = 0
   * *   offset: offset into the buffer. Default = 0
   *
   * For example if you had 3 value float positions, 2 value
   * float texcoord and 4 value uint8 colors you'd setup your
   * attribs like this
   *
   *     var attribs = {
   *       a_position: {buffer: positionBuffer, numComponents: 3},
   *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
   *       a_color: {
   *         buffer: colorBuffer,
   *         numComponents: 4,
   *         type: gl.UNSIGNED_BYTE,
   *         normalize: true,
   *       },
   *     };
   *
   * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
   * @param {Object.<string, module:twgl.AttribInfo>} buffers AttribInfos mapped by attribute name.
   * @memberOf module:twgl
   * @deprecated use {@link module:twgl.setBuffersAndAttributes}
   */
  function setAttributes(setters, buffers) {
    for (var name in buffers) {
      var setter = setters[name];
      if (setter) {
        setter(buffers[name]);
      }
    }
  }

  /**
   * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
   *
   * Example:
   *
   *     var programInfo = createProgramInfo(
   *         gl, ["some-vs", "some-fs");
   *
   *     var arrays = {
   *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
   *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
   *     };
   *
   *     var bufferInfo = createBufferInfoFromArrays(gl, arrays);
   *
   *     gl.useProgram(programInfo.program);
   *
   * This will automatically bind the buffers AND set the
   * attributes.
   *
   *     setBuffersAndAttributes(gl, programInfo, bufferInfo);
   *
   * For the example above it is equivilent to
   *
   *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
   *     gl.enableVertexAttribArray(a_positionLocation);
   *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
   *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
   *     gl.enableVertexAttribArray(a_texcoordLocation);
   *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
   * @param {(module:twgl.ProgramInfo|Object.<string, function>)} setters A `ProgramInfo` as returned from `createProgrmaInfo` Attribute setters as returned from `createAttributeSetters`
   * @param {module:twgl.BufferInfo} buffers a BufferInfo as returned from `createBufferInfoFromArrays`.
   * @memberOf module:twgl
   */
  function setBuffersAndAttributes(gl, programInfo, buffers) {
    setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
    if (buffers.indices) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    }
  }

  /**
   * @typedef {Object} ProgramInfo
   * @property {WebGLProgram} program A shader program
   * @property {Object<string, function>} uniformSetters object of setters as returned from createUniformSetters,
   * @property {Object<string, function>} attribSetters object of setters as returned from createAttribSetters,
   * @memberOf module:twgl
   */

  /**
   * Creates a ProgramInfo from an existing program.
   *
   * A ProgramInfo contains
   *
   *     programInfo = {
   *        program: WebGLProgram,
   *        uniformSetters: object of setters as returned from createUniformSetters,
   *        attribSetters: object of setters as returned from createAttribSetters,
   *     }
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {WebGLProgram} program an existing WebGLProgram.
   * @return {module:twgl.ProgramInfo} The created ProgramInfo.
   * @memberOf module:twgl
   */
  function createProgramInfoFromProgram(gl, program) {
    var uniformSetters = createUniformSetters(gl, program);
    var attribSetters = createAttributeSetters(gl, program);
    return {
      program: program,
      uniformSetters: uniformSetters,
      attribSetters: attribSetters,
    };
  }

  /**
   * Creates a ProgramInfo from 2 sources.
   *
   * A ProgramInfo contains
   *
   *     programInfo = {
   *        program: WebGLProgram,
   *        uniformSetters: object of setters as returned from createUniformSetters,
   *        attribSetters: object of setters as returned from createAttribSetters,
   *     }
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext
   *        to use.
   * @param {string[]} shaderSourcess Array of sources for the
   *        shaders or ids. The first is assumed to be the vertex shader,
   *        the second the fragment shader.
   * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
   * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
   * @param {module:twgl.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
   *        on error. If you want something else pass an callback. It's passed an error message.
   * @return {module:twgl.ProgramInfo?} The created ProgramInfo.
   * @memberOf module:twgl
   */
  function createProgramInfo(
      gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
    shaderSources = shaderSources.map(function(source) {
      var script = document.getElementById(source);
      return script ? script.text : source;
    });
    var program = createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
    if (!program) {
      return null;
    }
    return createProgramInfoFromProgram(gl, program);
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "createAttributeSetters": createAttributeSetters,

    "createProgram": createProgram,
    "createProgramFromScripts": createProgramFromScripts,
    "createProgramFromSources": createProgramFromSources,
    "createProgramInfo": createProgramInfo,
    "createProgramInfoFromProgram": createProgramInfoFromProgram,
    "createUniformSetters": createUniformSetters,

    "setAttributes": setAttributes,
    "setBuffersAndAttributes": setBuffersAndAttributes,
    "setUniforms": setUniforms,
  };

});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define('twgl/draw',[
    './programs',
  ], function (
    programs) {
  

  /**
   * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
   *
   * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
   * but calling this means if you switch from indexed data to non-indexed
   * data you don't have to remember to update your draw call.
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {enum} type eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...)
   * @param {module:twgl.BufferInfo} bufferInfo as returned from createBufferInfoFromArrays
   * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
   * @param {number} [offset] An optional offset. Defaults to 0.
   * @memberOf module:twgl
   */
  function drawBufferInfo(gl, type, bufferInfo, count, offset) {
    var indices = bufferInfo.indices;
    var numElements = count === undefined ? bufferInfo.numElements : count;
    offset = offset === undefined ? 0 : offset;
    if (indices) {
      gl.drawElements(type, numElements, bufferInfo.elementType === undefined ? gl.UNSIGNED_SHORT : bufferInfo.elementType, offset);
    } else {
      gl.drawArrays(type, offset, numElements);
    }
  }

  /**
   * @typedef {Object} DrawObject
   * @property {boolean} [active] whether or not to draw. Default = `true` (must be `false` to be not true). In otherwords `undefined` = `true`
   * @property {number} [type] type to draw eg. `gl.TRIANGLES`, `gl.LINES`, etc...
   * @property {module:twgl.ProgramInfo} programInfo A ProgramInfo as returned from createProgramInfo
   * @property {module:twgl.BufferInfo} bufferInfo A BufferInfo as returned from createBufferInfoFromArrays
   * @property {Object<string, ?>} uniforms The values for the uniforms.
   *   You can pass multiple objects by putting them in an array. For example
   *
   *     var sharedUniforms = {
   *       u_fogNear: 10,
   *       u_projection: ...
   *       ...
   *     };
   *
   *     var localUniforms = {
   *       u_world: ...
   *       u_diffuseColor: ...
   *     };
   *
   *     var drawObj = {
   *       ...
   *       uniforms: [sharedUniforms, localUniforms],
   *     };
   *
   * @property {number} [offset] the offset to pass to `gl.drawArrays` or `gl.drawElements`. Defaults to 0.
   * @property {number} [count] the count to pass to `gl.drawArrays` or `gl.drawElemnts`. Defaults to bufferInfo.numElements.
   * @memberOf module:twgl
   */

  /**
   * Draws a list of objects
   * @param {DrawObject[]} objectsToDraw an array of objects to draw.
   * @memberOf module:twgl
   */
  function drawObjectList(gl, objectsToDraw) {
    var lastUsedProgramInfo = null;
    var lastUsedBufferInfo = null;

    objectsToDraw.forEach(function(object) {
      if (object.active === false) {
        return;
      }

      var programInfo = object.programInfo;
      var bufferInfo = object.bufferInfo;
      var bindBuffers = false;

      if (programInfo !== lastUsedProgramInfo) {
        lastUsedProgramInfo = programInfo;
        gl.useProgram(programInfo.program);

        // We have to rebind buffers when changing programs because we
        // only bind buffers the program uses. So if 2 programs use the same
        // bufferInfo but the 1st one uses only positions the when the
        // we switch to the 2nd one some of the attributes will not be on.
        bindBuffers = true;
      }

      // Setup all the needed attributes.
      if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
        lastUsedBufferInfo = bufferInfo;
        programs.setBuffersAndAttributes(gl, programInfo, bufferInfo);
      }

      // Set the uniforms.
      programs.setUniforms(programInfo, object.uniforms);

      // Draw
      drawBufferInfo(gl, object.type || gl.TRIANGLES, bufferInfo, object.count, object.offset);
    });
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "drawBufferInfo": drawBufferInfo,
    "drawObjectList": drawObjectList,
  };

});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define('twgl/utils',[], function () {
  

  /**
   * Copy an object 1 level deep
   * @param {object} src object to copy
   * @return {object} the copy
   */
  function shallowCopy(src) {
    var dst = {};
    Object.keys(src).forEach(function(key) {
      dst[key] = src[key];
    });
    return dst;
  }

  return {
    shallowCopy: shallowCopy,
  };
});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define('twgl/textures',[
    './typedarrays',
    './utils',
  ], function (
    typedArrays,
    utils) {
  

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line
  var defaults = {
    textureColor: new Uint8Array([128, 192, 255, 255]),
    textureOptions: {},
  };
  var isArrayBuffer = typedArrays.isArrayBuffer;

  /* PixelFormat */
  var ALPHA                          = 0x1906;
  var RGB                            = 0x1907;
  var RGBA                           = 0x1908;
  var LUMINANCE                      = 0x1909;
  var LUMINANCE_ALPHA                = 0x190A;

  /* TextureWrapMode */
  var REPEAT                         = 0x2901;  // eslint-disable-line
  var MIRRORED_REPEAT                = 0x8370;  // eslint-disable-line

  /* TextureMagFilter */
  var NEAREST                        = 0x2600;  // eslint-disable-line

  /* TextureMinFilter */
  var NEAREST_MIPMAP_NEAREST         = 0x2700;  // eslint-disable-line
  var LINEAR_MIPMAP_NEAREST          = 0x2701;  // eslint-disable-line
  var NEAREST_MIPMAP_LINEAR          = 0x2702;  // eslint-disable-line
  var LINEAR_MIPMAP_LINEAR           = 0x2703;  // eslint-disable-line

  /**
   * Sets the default texture color.
   *
   * The default texture color is used when loading textures from
   * urls. Because the URL will be loaded async we'd like to be
   * able to use the texture immediately. By putting a 1x1 pixel
   * color in the texture we can start using the texture before
   * the URL has loaded.
   *
   * @param {number[]} color Array of 4 values in the range 0 to 1
   * @deprecated see {@link module:twgl.setDefaults}
   * @memberOf module:twgl
   */
  function setDefaultTextureColor(color) {
    defaults.textureColor = new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
  }

  var invalidDefaultKeysRE = /^textureColor$/;
  function validDefaultKeys(key) {
    return !invalidDefaultKeysRE.test(key);
  }

  function setDefaults(newDefaults) {
    if (newDefaults.textureColor) {
      setDefaultTextureColor(newDefaults.textureColor);
    }
    Object.keys(newDefaults).filter(validDefaultKeys).forEach(function(key) {
      defaults[key] = newDefaults[key];
    });
  }

  /**
   * Gets a string for gl enum
   *
   * Note: Several enums are the same. Without more
   * context (which function) it's impossible to always
   * give the correct enum.
   *
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {number} value the value of the enum you want to look up.
   */
  var glEnumToString = (function() {
    var enums;

    function init(gl) {
      if (!enums) {
        enums = {};
        Object.keys(gl).forEach(function(key) {
          if (typeof gl[key] === 'number') {
            enums[gl[key]] = key;
          }
        });
      }
    }

    return function glEnumToString(gl, value) {
      init();
      return enums[value] || ("0x" + value.toString(16));
    };
  }());

  /**
   * A function to generate the source for a texture.
   * @callback TextureFunc
   * @param {WebGLRenderingContext} gl A WebGLRenderingContext
   * @param {module:twgl.TextureOptions} options the texture options
   * @return {*} Returns any of the things documentented for `src` for {@link module:twgl.TextureOptions}.
   * @memberOf module:twgl
   */

  /**
   * Texture options passed to most texture functions. Each function will use whatever options
   * are appropriate for its needs. This lets you pass the same options to all functions.
   *
   * @typedef {Object} TextureOptions
   * @property {number} [target] the type of texture `gl.TEXTURE_2D` or `gl.TEXTURE_CUBE_MAP`. Defaults to `gl.TEXTURE_2D`.
   * @property {number} [width] the width of the texture. Only used if src is an array or typed array or null.
   * @property {number} [height] the height of a texture. Only used if src is an array or typed array or null.
   * @property {number} [min] the min filter setting (eg. `gl.LINEAR`). Defaults to `gl.NEAREST_MIPMAP_LINEAR`
   *     or if texture is not a power of 2 on both dimensions then defaults to `gl.LINEAR`.
   * @property {number} [mag] the mag filter setting (eg. `gl.LINEAR`). Defaults to `gl.LINEAR`
   * @property {number} [format] format for texture. Defaults to `gl.RGBA`.
   * @property {number} [type] type for texture. Defaults to `gl.UNSIGNED_BYTE` unless `src` is ArrayBuffer. If `src`
   *     is ArrayBuffer defaults to type that matches ArrayBuffer type.
   * @property {number} [wrap] Texture wrapping for both S and T. Defaults to `gl.REPEAT` for 2D and `gl.CLAMP_TO_EDGE` for cube
   * @property {number} [wrapS] Texture wrapping for S. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
   * @property {number} [wrapT] Texture wrapping for T. Defaults to `gl.REPEAT` and `gl.CLAMP_TO_EDGE` for cube. If set takes precedence over `wrap`.
   * @property {number} [unpackAlignment] The `gl.UNPACK_ALIGNMENT` used when uploading an array. Defaults to 1.
   * @property {number} [premultiplyAlpha] Whether or not to premultiply alpha. Defaults to whatever the current setting is.
   *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
   *     the current setting for specific textures.
   * @property {number} [flipY] Whether or not to flip the texture vertically on upload. Defaults to whatever the current setting is.
   *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
   *     the current setting for specific textures.
   * @property {number} [colorspaceConversion] Whether or not to let the browser do colorspace conversion of the texture on upload. Defaults to whatever the current setting is.
   *     This lets you set it once before calling `twgl.createTexture` or `twgl.createTextures` and only override
   *     the current setting for specific textures.
   * @property {(number[]|ArrayBuffer)} color color used as temporary 1x1 pixel color for textures loaded async when src is a string.
   *    If it's a JavaScript array assumes color is 0 to 1 like most GL colors as in `[1, 0, 0, 1] = red=1, green=0, blue=0, alpha=0`.
   *    Defaults to `[0.5, 0.75, 1, 1]`. See {@link module:twgl.setDefaultTextureColor}. If `false` texture is set. Can be used to re-load a texture
   * @property {boolean} [auto] If not `false` then texture working filtering is set automatically for non-power of 2 images and
   *    mips are generated for power of 2 images.
   * @property {number[]} [cubeFaceOrder] The order that cube faces are pulled out of an img or set of images. The default is
   *
   *     [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
   *      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
   *      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
   *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
   *      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
   *      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
   *
   * @property {(number[]|ArrayBuffer|HTMLCanvasElement|HTMLImageElement|HTMLVideoElement|string|string[]|module:twgl.TextureFunc)} [src] source for texture
   *
   *    If `string` then it's assumed to be a URL to an image. The image will be downloaded async. A usable
   *    1x1 pixel texture will be returned immediatley. The texture will be updated once the image has downloaded.
   *    If `target` is `gl.TEXTURE_CUBE_MAP` will attempt to divide image into 6 square pieces. 1x6, 6x1, 3x2, 2x3.
   *    The pieces will be uploaded in `cubeFaceOrder`
   *
   *    If `string[]` then it must have 6 entries, one for each face of a cube map. Target must be `gl.TEXTURE_CUBE_MAP`.
   *
   *    If `HTMLElement` then it wil be used immediately to create the contents of the texture. Examples `HTMLImageElement`,
   *    `HTMLCanvasElement`, `HTMLVideoElement`.
   *
   *    If `number[]` or `ArrayBuffer` it's assumed to be data for a texture. If `width` or `height` is
   *    not specified it is guessed as follows. First the number of elements is computed by `src.length / numComponets`
   *    where `numComponents` is derived from `format`. If `target` is `gl.TEXTURE_CUBE_MAP` then `numElements` is divided
   *    by 6. Then
   *
   *    *   If neither `width` nor `height` are specified and `sqrt(numElements)` is an integer then width and height
   *        are set to `sqrt(numElements)`. Otherwise `width = numElements` and `height = 1`.
   *
   *    *   If only one of `width` or `height` is specified then the other equals `numElements / specifiedDimension`.
   *
   * If `number[]` will be converted to `type`.
   *
   * If `src` is a function it will be called with a `WebGLRenderingContext` and these options.
   * Whatever it returns is subject to these rules. So it can return a string url, an `HTMLElement`
   * an array etc...
   *
   * If `src` is undefined then an empty texture will be created of size `width` by `height`.
   *
   * @property {string} [crossOrigin] What to set the crossOrigin property of images when they are downloaded.
   *    default: undefined. Also see {@link module:twgl.setDefaults}.
   *
   * @memberOf module:twgl
   */

  // NOTE: While querying GL is considered slow it's not remotely as slow
  // as uploading a texture. On top of that you're unlikely to call this in
  // a perf critical loop. Even if upload a texture every frame that's unlikely
  // to be more than 1 or 2 textures a frame. In other words, the benefits of
  // making the API easy to use outweigh any supposed perf benefits
  var lastPackState = {};

  /**
   * Saves any packing state that will be set based on the options.
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   */
  function savePackState(gl, options) {
    if (options.colorspaceConversion !== undefined) {
      lastPackState.colorSpaceConversion = gl.getParameter(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL);
    }
    if (options.premultiplyAlpha !== undefined) {
      lastPackState.premultiplyAlpha = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
    }
    if (options.flipY !== undefined) {
      lastPackState.flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
    }
  }

  /**
   * Restores any packing state that was set based on the options.
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   */
  function restorePackState(gl, options) {
    if (options.colorspaceConversion !== undefined) {
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, lastPackState.colorSpaceConversion);
    }
    if (options.premultiplyAlpha !== undefined) {
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, lastPackState.premultiplyAlpha);
    }
    if (options.flipY !== undefined) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, lastPackState.flipY);
    }
  }

  /**
   * Sets the texture parameters of a texture.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   *   This is often the same options you passed in when you created the texture.
   * @memberOf module:twgl
   */
  function setTextureParameters(gl, tex, options) {
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    if (options.min) {
      gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, options.min);
    }
    if (options.mag) {
      gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, options.mag);
    }
    if (options.wrap) {
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrap);
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrap);
    }
    if (options.wrapS) {
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, options.wrapS);
    }
    if (options.wrapT) {
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, options.wrapT);
    }
  }

  /**
   * Makes a 1x1 pixel
   * If no color is passed in uses the default color which can be set by calling `setDefaultTextureColor`.
   * @param {(number[]|ArrayBuffer)} [color] The color using 0-1 values
   * @return {Uint8Array} Unit8Array with color.
   */
  function make1Pixel(color) {
    color = color || defaults.textureColor;
    if (isArrayBuffer(color)) {
      return color;
    }
    return new Uint8Array([color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255]);
  }

  /**
   * Returns true if value is power of 2
   * @param {number} value number to check.
   * @return true if value is power of 2
   */
  function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  /**
   * Sets filtering or generates mips for texture based on width or height
   * If width or height is not passed in uses `options.width` and//or `options.height`
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   *   This is often the same options you passed in when you created the texture.
   * @param {number} [width] width of texture
   * @param {number} [height] height of texture
   * @memberOf module:twgl
   */
  function setTextureFilteringForSize(gl, tex, options, width, height) {
    options = options || defaults.textureOptions;
    var target = options.target || gl.TEXTURE_2D;
    width = width || options.width;
    height = height || options.height;
    gl.bindTexture(target, tex);
    if (!isPowerOf2(width) || !isPowerOf2(height)) {
      gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    } else {
      gl.generateMipmap(target);
    }
  }

  /**
   * Gets an array of cubemap face enums
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   *   This is often the same options you passed in when you created the texture.
   * @return {number[]} cubemap face enums
   */
  function getCubeFaceOrder(gl, options) {
    options = options || {};
    return options.cubeFaceOrder || [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      ];
  }

  /**
   * @typedef {Object} FaceInfo
   * @property {number} face gl enum for texImage2D
   * @property {number} ndx face index (0 - 5) into source data
   */

  /**
   * Gets an array of FaceInfos
   * There's a bug in some NVidia drivers that will crash the driver if
   * `gl.TEXTURE_CUBE_MAP_POSITIVE_X` is not uploaded first. So, we take
   * the user's desired order from his faces to WebGL and make sure we
   * do the faces in WebGL order
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @return {FaceInfo[]} cubemap face infos. Arguably the `face` property of each element is redundent but
   *    it's needed internally to sort the array of `ndx` properties by `face`.
   */
  function getCubeFacesWithNdx(gl, options) {
    var faces = getCubeFaceOrder(gl, options);
    // work around bug in NVidia drivers. We have to upload the first face first else the driver crashes :(
    var facesWithNdx = faces.map(function(face, ndx) {
      return { face: face, ndx: ndx };
    });
    facesWithNdx.sort(function(a, b) {
      return a.face - b.face;
    });
    return facesWithNdx;
  }

  /**
   * Set a texture from the contents of an element. Will also set
   * texture filtering or generate mips based on the dimensions of the element
   * unless `options.auto === false`. If `target === gl.TEXTURE_CUBE_MAP` will
   * attempt to slice image into 1x6, 2x3, 3x2, or 6x1 images, one for each face.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {HTMLElement} element a canvas, img, or video element.
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   *   This is often the same options you passed in when you created the texture.
   * @memberOf module:twgl
   * @kind function
   */
  var setTextureFromElement = function() {
    var ctx = document.createElement("canvas").getContext("2d");
    return function setTextureFromElement(gl, tex, element, options) {
      options = options || defaults.textureOptions;
      var target = options.target || gl.TEXTURE_2D;
      var width = element.width;
      var height = element.height;
      var format = options.format || gl.RGBA;
      var type = options.type || gl.UNSIGNED_BYTE;
      savePackState(gl, options);
      gl.bindTexture(target, tex);
      if (target === gl.TEXTURE_CUBE_MAP) {
        // guess the parts
        var imgWidth  = element.width;
        var imgHeight = element.height;
        var size;
        var slices;
        if (imgWidth / 6 === imgHeight) {
          // It's 6x1
          size = imgHeight;
          slices = [0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0];
        } else if (imgHeight / 6 === imgWidth) {
          // It's 1x6
          size = imgWidth;
          slices = [0, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0, 5];
        } else if (imgWidth / 3 === imgHeight / 2) {
          // It's 3x2
          size = imgWidth / 3;
          slices = [0, 0, 1, 0, 2, 0, 0, 1, 1, 1, 2, 1];
        } else if (imgWidth / 2 === imgHeight / 3) {
          // It's 2x3
          size = imgWidth / 2;
          slices = [0, 0, 1, 0, 0, 1, 1, 1, 0, 2, 1, 2];
        } else {
          throw "can't figure out cube map from element: " + (element.src ? element.src : element.nodeName);
        }
        ctx.canvas.width = size;
        ctx.canvas.height = size;
        width = size;
        height = size;
        getCubeFacesWithNdx(gl, options).forEach(function(f) {
          var xOffset = slices[f.ndx * 2 + 0] * size;
          var yOffset = slices[f.ndx * 2 + 1] * size;
          ctx.drawImage(element, xOffset, yOffset, size, size, 0, 0, size, size);
          gl.texImage2D(f.face, 0, format, format, type, ctx.canvas);
        });
        // Free up the canvas memory
        ctx.canvas.width = 1;
        ctx.canvas.height = 1;
      } else {
        gl.texImage2D(target, 0, format, format, type, element);
      }
      restorePackState(gl, options);
      if (options.auto !== false) {
        setTextureFilteringForSize(gl, tex, options, width, height);
      }
      setTextureParameters(gl, tex, options);
    };
  }();

  function noop() {
  }

  /**
   * Loads an image
   * @param {string} url url to image
   * @param {function(err, img)} [callback] a callback that's passed an error and the image. The error will be non-null
   *     if there was an error
   * @return {HTMLImageElement} the image being loaded.
   */
  function loadImage(url, crossOrigin, callback) {
    callback = callback || noop;
    var img = new Image();
    crossOrigin = crossOrigin !== undefined ? crossOrigin : defaults.crossOrigin;
    if (crossOrigin !== undefined) {
      img.crossOrigin = crossOrigin;
    }
    img.onerror = function() {
      var msg = "couldn't load image: " + url;
      error(msg);
      callback(msg, img);
    };
    img.onload = function() {
      callback(null, img);
    };
    img.src = url;
    return img;
  }

  /**
   * Sets a texture to a 1x1 pixel color. If `options.color === false` is nothing happens. If it's not set
   * the default texture color is used which can be set by calling `setDefaultTextureColor`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   *   This is often the same options you passed in when you created the texture.
   * @memberOf module:twgl
   */
  function setTextureTo1PixelColor(gl, tex, options) {
    options = options || defaults.textureOptions;
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    if (options.color === false) {
      return;
    }
    // Assume it's a URL
    // Put 1x1 pixels in texture. That makes it renderable immediately regardless of filtering.
    var color = make1Pixel(options.color);
    if (target === gl.TEXTURE_CUBE_MAP) {
      for (var ii = 0; ii < 6; ++ii) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
      }
    } else {
      gl.texImage2D(target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, color);
    }
  }

  /**
   * The src image(s) used to create a texture.
   *
   * When you call {@link module:twgl.createTexture} or {@link module:twgl.createTextures}
   * you can pass in urls for images to load into the textures. If it's a single url
   * then this will be a single HTMLImageElement. If it's an array of urls used for a cubemap
   * this will be a corresponding array of images for the cubemap.
   *
   * @typedef {HTMLImageElement|HTMLImageElement[]} TextureSrc
   * @memberOf module:twgl
   */

  /**
   * A callback for when an image finished downloading and been uploaded into a texture
   * @callback TextureReadyCallback
   * @param {*} err If truthy there was an error.
   * @param {WebGLTexture} texture the texture.
   * @param {module:twgl.TextureSrc} souce image(s) used to as the src for the texture
   * @memberOf module:twgl
   */

  /**
   * A callback for when all images have finished downloading and been uploaded into their respective textures
   * @callback TexturesReadyCallback
   * @param {*} err If truthy there was an error.
   * @param {Object.<string, WebGLTexture>} textures the created textures by name. Same as returned by {@link module:twgl.createTextures}.
   * @param {Object.<string, module:twgl.TextureSrc>} sources the image(s) used for the texture by name.
   * @memberOf module:twgl
   */

  /**
   * A callback for when an image finished downloading and been uploaded into a texture
   * @callback CubemapReadyCallback
   * @param {*} err If truthy there was an error.
   * @param {WebGLTexture} tex the texture.
   * @param {HTMLImageElement[]} imgs the images for each face.
   * @memberOf module:twgl
   */

  /**
   * Loads a texture from an image from a Url as specified in `options.src`
   * If `options.color !== false` will set the texture to a 1x1 pixel color so that the texture is
   * immediately useable. It will be updated with the contents of the image once the image has finished
   * downloading. Filtering options will be set as approriate for image unless `options.auto === false`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   * @param {module:twgl.TextureReadyCallback} [callback] A function to be called when the image has finished loading. err will
   *    be non null if there was an error.
   * @return {HTMLImageElement} the image being downloaded.
   * @memberOf module:twgl
   */
  function loadTextureFromUrl(gl, tex, options, callback) {
    callback = callback || noop;
    options = options || defaults.textureOptions;
    setTextureTo1PixelColor(gl, tex, options);
    // Because it's async we need to copy the options.
    options = utils.shallowCopy(options);
    var img = loadImage(options.src, options.crossOrigin, function(err, img) {
      if (err) {
        callback(err, tex, img);
      } else {
        setTextureFromElement(gl, tex, img, options);
        callback(null, tex, img);
      }
    });
    return img;
  }

  /**
   * Loads a cubemap from 6 urls as specified in `options.src`. Will set the cubemap to a 1x1 pixel color
   * so that it is usable immediately unless `option.color === false`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @param {module:twgl.CubemapReadyCallback} [callback] A function to be called when all the images have finished loading. err will
   *    be non null if there was an error.
   * @memberOf module:twgl
   */
  function loadCubemapFromUrls(gl, tex, options, callback) {
    callback = callback || noop;
    var urls = options.src;
    if (urls.length !== 6) {
      throw "there must be 6 urls for a cubemap";
    }
    var format = options.format || gl.RGBA;
    var type = options.type || gl.UNSIGNED_BYTE;
    var target = options.target || gl.TEXTURE_2D;
    if (target !== gl.TEXTURE_CUBE_MAP) {
      throw "target must be TEXTURE_CUBE_MAP";
    }
    setTextureTo1PixelColor(gl, tex, options);
    // Because it's async we need to copy the options.
    options = utils.shallowCopy(options);
    var numToLoad = 6;
    var errors = [];
    var imgs;
    var faces = getCubeFaceOrder(gl, options);

    function uploadImg(faceTarget) {
      return function(err, img) {
        --numToLoad;
        if (err) {
          errors.push(err);
        } else {
          if (img.width !== img.height) {
            errors.push("cubemap face img is not a square: " + img.src);
          } else {
            savePackState(gl, options);
            gl.bindTexture(target, tex);

            // So assuming this is the first image we now have one face that's img sized
            // and 5 faces that are 1x1 pixel so size the other faces
            if (numToLoad === 5) {
              // use the default order
              getCubeFaceOrder(gl).forEach(function(otherTarget) {
                // Should we re-use the same face or a color?
                gl.texImage2D(otherTarget, 0, format, format, type, img);
              });
            } else {
              gl.texImage2D(faceTarget, 0, format, format, type, img);
            }

            restorePackState(gl, options);
            gl.generateMipmap(target);
          }
        }

        if (numToLoad === 0) {
          callback(errors.length ? errors : undefined, imgs, tex);
        }
      };
    }

    imgs = urls.map(function(url, ndx) {
      return loadImage(url, options.crossOrigin, uploadImg(faces[ndx]));
    });
  }

  /**
   * Gets the number of compontents for a given image format.
   * @param {number} format the format.
   * @return {number} the number of components for the format.
   * @memberOf module:twgl
   */
  function getNumComponentsForFormat(format) {
    switch (format) {
      case ALPHA:
      case LUMINANCE:
        return 1;
      case LUMINANCE_ALPHA:
        return 2;
      case RGB:
        return 3;
      case RGBA:
        return 4;
      default:
        throw "unknown type: " + format;
    }
  }

  /**
   * Gets the texture type for a given array type.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @return {number} the gl texture type
   */
  function getTextureTypeForArrayType(gl, src) {
    if (isArrayBuffer(src)) {
      return typedArrays.getGLTypeForTypedArray(src);
    }
    return gl.UNSIGNED_BYTE;
  }

  /**
   * Sets a texture from an array or typed array. If the width or height is not provided will attempt to
   * guess the size. See {@link module:twgl.TextureOptions}.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {(number[]|ArrayBuffer)} src An array or typed arry with texture data.
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   *   This is often the same options you passed in when you created the texture.
   * @memberOf module:twgl
   */
  function setTextureFromArray(gl, tex, src, options) {
    options = options || defaults.textureOptions;
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    var width = options.width;
    var height = options.height;
    var format = options.format || gl.RGBA;
    var type = options.type || getTextureTypeForArrayType(gl, src);
    var numComponents = getNumComponentsForFormat(format);
    var numElements = src.length / numComponents;
    if (numElements % 1) {
      throw "length wrong size for format: " + glEnumToString(gl, format);
    }
    if (!width && !height) {
      var size = Math.sqrt(numElements / (target === gl.TEXTURE_CUBE_MAP ? 6 : 1));
      if (size % 1 === 0) {
        width = size;
        height = size;
      } else {
        width = numElements;
        height = 1;
      }
    } else if (!height) {
      height = numElements / width;
      if (height % 1) {
        throw "can't guess height";
      }
    } else if (!width) {
      width = numElements / height;
      if (width % 1) {
        throw "can't guess width";
      }
    }
    if (!isArrayBuffer(src)) {
      var Type = typedArrays.getTypedArrayTypeForGLType(type);
      src = new Type(src);
    }
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, options.unpackAlignment || 1);
    savePackState(gl, options);
    if (target === gl.TEXTURE_CUBE_MAP) {
      var faceSize = numElements / 6 * numComponents;
      getCubeFacesWithNdx(gl, options).forEach(function(f) {
        var offset = faceSize * f.ndx;
        var data = src.subarray(offset, offset + faceSize);
        gl.texImage2D(f.face, 0, format, width, height, 0, format, type, data);
      });
    } else {
      gl.texImage2D(target, 0, format, width, height, 0, format, type, src);
    }
    restorePackState(gl, options);
    return {
      width: width,
      height: height,
    };
  }

  /**
   * Sets a texture with no contents of a certain size. In other words calls `gl.texImage2D` with `null`.
   * You must set `options.width` and `options.height`.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the WebGLTexture to set parameters for
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @memberOf module:twgl
   */
  function setEmptyTexture(gl, tex, options) {
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    var format = options.format || gl.RGBA;
    var type = options.type || gl.UNSIGNED_BYTE;
    savePackState(gl, options);
    if (target === gl.TEXTURE_CUBE_MAP) {
      for (var ii = 0; ii < 6; ++ii) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, format, options.width, options.height, 0, format, type, null);
      }
    } else {
      gl.texImage2D(target, 0, format, options.width, options.height, 0, format, type, null);
    }
  }

  /**
   * Creates a texture based on the options passed in.
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.TextureOptions} [options] A TextureOptions object with whatever parameters you want set.
   * @param {module:twgl.TextureReadyCallback} [callback] A callback called when an image has been downloaded and uploaded to the texture.
   * @return {WebGLTexture} the created texture.
   * @memberOf module:twgl
   */
  function createTexture(gl, options, callback) {
    callback = callback || noop;
    options = options || defaults.textureOptions;
    var tex = gl.createTexture();
    var target = options.target || gl.TEXTURE_2D;
    var width  = options.width  || 1;
    var height = options.height || 1;
    gl.bindTexture(target, tex);
    if (target === gl.TEXTURE_CUBE_MAP) {
      // this should have been the default for CUBEMAPS :(
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    var src = options.src;
    if (src) {
      if (typeof src === "function") {
        src = src(gl, options);
      }
      if (typeof (src) === "string") {
        loadTextureFromUrl(gl, tex, options, callback);
      } else if (isArrayBuffer(src) ||
                 (Array.isArray(src) && (
                      typeof src[0] === 'number' ||
                      Array.isArray(src[0]) ||
                      isArrayBuffer(src[0]))
                 )
                ) {
        var dimensions = setTextureFromArray(gl, tex, src, options);
        width  = dimensions.width;
        height = dimensions.height;
      } else if (Array.isArray(src) && typeof (src[0]) === 'string') {
        loadCubemapFromUrls(gl, tex, options, callback);
      } else if (src instanceof HTMLElement) {
        setTextureFromElement(gl, tex, src, options);
        width  = src.width;
        height = src.height;
      } else {
        throw "unsupported src type";
      }
    } else {
      setEmptyTexture(gl, tex, options);
    }
    if (options.auto !== false) {
      setTextureFilteringForSize(gl, tex, options, width, height);
    }
    setTextureParameters(gl, tex, options);
    return tex;
  }

  /**
   * Resizes a texture based on the options passed in.
   *
   * Note: This is not a generic resize anything function.
   * It's mostly used by {@link module:twgl.resizeFramebufferInfo}
   * It will use `options.src` if it exists to try to determine a `type`
   * otherwise it will assume `gl.UNSIGNED_BYTE`. No data is provided
   * for the texture. Texture parameters will be set accordingly
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {WebGLTexture} tex the texture to resize
   * @param {module:twgl.TextureOptions} options A TextureOptions object with whatever parameters you want set.
   * @param {number} [width] the new width. If not passed in will use `options.width`
   * @param {number} [height] the new height. If not passed in will use `options.height`
   * @memberOf module:twgl
   */
  function resizeTexture(gl, tex, options, width, height) {
    width = width || options.width;
    height = height || options.height;
    var target = options.target || gl.TEXTURE_2D;
    gl.bindTexture(target, tex);
    var format = options.format || gl.RGBA;
    var type;
    var src = options.src;
    if (!src) {
      type = options.type || gl.UNSIGNED_BYTE;
    } else if (isArrayBuffer(src) || (Array.isArray(src) && typeof (src[0]) === 'number')) {
      type = options.type || getTextureTypeForArrayType(gl, src);
    } else {
      type = options.type || gl.UNSIGNED_BYTE;
    }
    if (target === gl.TEXTURE_CUBE_MAP) {
      for (var ii = 0; ii < 6; ++ii) {
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii, 0, format, width, height, 0, format, type, null);
      }
    } else {
      gl.texImage2D(target, 0, format, width, height, 0, format, type, null);
    }
  }

  /**
   * Check if a src is an async request.
   * if src is a string we're going to download an image
   * if src is an array of strings we're going to download cubemap images
   * @param {*} src The src from a TextureOptions
   * @returns {bool} true if src is async.
   */
  function isAsyncSrc(src) {
    return typeof src === 'string' ||
           (Array.isArray(src) && typeof src[0] === 'string');
  }

  /**
   * Creates a bunch of textures based on the passed in options.
   *
   * Example:
   *
   *     var textures = twgl.createTextures(gl, {
   *       // a power of 2 image
   *       hftIcon: { src: "images/hft-icon-16.png", mag: gl.NEAREST },
   *       // a non-power of 2 image
   *       clover: { src: "images/clover.jpg" },
   *       // From a canvas
   *       fromCanvas: { src: ctx.canvas },
   *       // A cubemap from 6 images
   *       yokohama: {
   *         target: gl.TEXTURE_CUBE_MAP,
   *         src: [
   *           'images/yokohama/posx.jpg',
   *           'images/yokohama/negx.jpg',
   *           'images/yokohama/posy.jpg',
   *           'images/yokohama/negy.jpg',
   *           'images/yokohama/posz.jpg',
   *           'images/yokohama/negz.jpg',
   *         ],
   *       },
   *       // A cubemap from 1 image (can be 1x6, 2x3, 3x2, 6x1)
   *       goldengate: {
   *         target: gl.TEXTURE_CUBE_MAP,
   *         src: 'images/goldengate.jpg',
   *       },
   *       // A 2x2 pixel texture from a JavaScript array
   *       checker: {
   *         mag: gl.NEAREST,
   *         min: gl.LINEAR,
   *         src: [
   *           255,255,255,255,
   *           192,192,192,255,
   *           192,192,192,255,
   *           255,255,255,255,
   *         ],
   *       },
   *       // a 1x2 pixel texture from a typed array.
   *       stripe: {
   *         mag: gl.NEAREST,
   *         min: gl.LINEAR,
   *         format: gl.LUMINANCE,
   *         src: new Uint8Array([
   *           255,
   *           128,
   *           255,
   *           128,
   *           255,
   *           128,
   *           255,
   *           128,
   *         ]),
   *         width: 1,
   *       },
   *     });
   *
   * Now
   *
   * *   `textures.hftIcon` will be a 2d texture
   * *   `textures.clover` will be a 2d texture
   * *   `textures.fromCanvas` will be a 2d texture
   * *   `textures.yohohama` will be a cubemap texture
   * *   `textures.goldengate` will be a cubemap texture
   * *   `textures.checker` will be a 2d texture
   * *   `textures.stripe` will be a 2d texture
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {Object.<string,module:twgl.TextureOptions>} options A object of TextureOptions one per texture.
   * @param {module:twgl.TexturesReadyCallback} [callback] A callback called when all textures have been downloaded.
   * @return {Object.<string,WebGLTexture>} the created textures by name
   * @memberOf module:twgl
   */
  function createTextures(gl, textureOptions, callback) {
    callback = callback || noop;
    var numDownloading = 0;
    var errors = [];
    var textures = {};
    var images = {};

    function callCallbackIfReady() {
      if (numDownloading === 0) {
        setTimeout(function() {
          callback(errors.length ? errors : undefined, textures, images);
        }, 0);
      }
    }

    Object.keys(textureOptions).forEach(function(name) {
      var options = textureOptions[name];
      var onLoadFn = undefined;
      if (isAsyncSrc(options.src)) {
        onLoadFn = function(err, tex, img) {
          images[name] = img;
          --numDownloading;
          if (err) {
            errors.push(err);
          }
          callCallbackIfReady();
        };
        ++numDownloading;
      }
      textures[name] = createTexture(gl, options, onLoadFn);
    });

    // queue the callback if there are no images to download.
    // We do this because if your code is structured to wait for
    // images to download but then you comment out all the async
    // images your code would break.
    callCallbackIfReady();

    return textures;
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "setDefaults_": setDefaults,

    "createTexture": createTexture,
    "setEmptyTexture": setEmptyTexture,
    "setTextureFromArray": setTextureFromArray,
    "loadTextureFromUrl": loadTextureFromUrl,
    "setTextureFromElement": setTextureFromElement,
    "setTextureFilteringForSize": setTextureFilteringForSize,
    "setTextureParameters": setTextureParameters,
    "setDefaultTextureColor": setDefaultTextureColor,
    "createTextures": createTextures,
    "resizeTexture": resizeTexture,
    "getNumComponentsForFormat": getNumComponentsForFormat,
  };
});



/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define('twgl/framebuffers',[
    './textures',
    './utils',
  ], function (
    textures,
    utils) {
  

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line

  var UNSIGNED_BYTE                  = 0x1401;

  /* PixelFormat */
  var DEPTH_COMPONENT                = 0x1902;
  var RGBA                           = 0x1908;

  /* Framebuffer Object. */
  var RGBA4                          = 0x8056;
  var RGB5_A1                        = 0x8057;
  var RGB565                         = 0x8D62;
  var DEPTH_COMPONENT16              = 0x81A5;
  var STENCIL_INDEX                  = 0x1901;
  var STENCIL_INDEX8                 = 0x8D48;
  var DEPTH_STENCIL                  = 0x84F9;
  var COLOR_ATTACHMENT0              = 0x8CE0;
  var DEPTH_ATTACHMENT               = 0x8D00;
  var STENCIL_ATTACHMENT             = 0x8D20;
  var DEPTH_STENCIL_ATTACHMENT       = 0x821A;

  /* TextureWrapMode */
  var REPEAT                         = 0x2901;  // eslint-disable-line
  var CLAMP_TO_EDGE                  = 0x812F;
  var MIRRORED_REPEAT                = 0x8370;  // eslint-disable-line

  /* TextureMagFilter */
  var NEAREST                        = 0x2600;  // eslint-disable-line
  var LINEAR                         = 0x2601;

  /* TextureMinFilter */
  var NEAREST_MIPMAP_NEAREST         = 0x2700;  // eslint-disable-line
  var LINEAR_MIPMAP_NEAREST          = 0x2701;  // eslint-disable-line
  var NEAREST_MIPMAP_LINEAR          = 0x2702;  // eslint-disable-line
  var LINEAR_MIPMAP_LINEAR           = 0x2703;  // eslint-disable-line

  /**
   * The options for a framebuffer attachment.
   *
   * Note: For a `format` that is a texture include all the texture
   * options from {@link module:twgl.TextureOptions} for example
   * `min`, `mag`, `clamp`, etc... Note that unlike {@link module:twgl.TextureOptions}
   * `auto` defaults to `false` for attachment textures
   *
   * @typedef {Object} AttachmentOptions
   * @property {number} [attach] The attachment point. Defaults
   *   to `gl.COLOR_ATTACTMENT0 + ndx` unless type is a depth or stencil type
   *   then it's gl.DEPTH_ATTACHMENT or `gl.DEPTH_STENCIL_ATTACHMENT` depending
   *   on the format or attachment type.
   * @property {number} [format] The format. If one of `gl.RGBA4`,
   *   `gl.RGB565`, `gl.RGB5_A1`, `gl.DEPTH_COMPONENT16`,
   *   `gl.STENCIL_INDEX8` or `gl.DEPTH_STENCIL` then will create a
   *   renderbuffer. Otherwise will create a texture. Default = `gl.RGBA`
   * @property {number} [type] The type. Used for texture. Default = `gl.UNSIGNED_BYTE`.
   * @property {number} [target] The texture target for `gl.framebufferTexture2D`.
   *   Defaults to `gl.TEXTURE_2D`. Set to appropriate face for cube maps.
   * @property {number} [level] level for `gl.framebufferTexture2D`. Defaults to 0.
   * @property {WebGLObject} [attachment] An existing renderbuffer or texture.
   *    If provided will attach this Object. This allows you to share
   *    attachemnts across framebuffers.
   * @memberOf module:twgl
   */

  var defaultAttachments = [
    { format: RGBA, type: UNSIGNED_BYTE, min: LINEAR, wrap: CLAMP_TO_EDGE, },
    { format: DEPTH_STENCIL, },
  ];

  var attachmentsByFormat = {};
  attachmentsByFormat[DEPTH_STENCIL] = DEPTH_STENCIL_ATTACHMENT;
  attachmentsByFormat[STENCIL_INDEX] = STENCIL_ATTACHMENT;
  attachmentsByFormat[STENCIL_INDEX8] = STENCIL_ATTACHMENT;
  attachmentsByFormat[DEPTH_COMPONENT] = DEPTH_ATTACHMENT;
  attachmentsByFormat[DEPTH_COMPONENT16] = DEPTH_ATTACHMENT;

  function getAttachmentPointForFormat(format) {
    return attachmentsByFormat[format];
  }

  var renderbufferFormats = {};
  renderbufferFormats[RGBA4] = true;
  renderbufferFormats[RGB5_A1] = true;
  renderbufferFormats[RGB565] = true;
  renderbufferFormats[DEPTH_STENCIL] = true;
  renderbufferFormats[DEPTH_COMPONENT16] = true;
  renderbufferFormats[STENCIL_INDEX] = true;
  renderbufferFormats[STENCIL_INDEX8] = true;

  function isRenderbufferFormat(format) {
    return renderbufferFormats[format];
  }

  /**
   * @typedef {Object} FramebufferInfo
   * @property {WebGLFramebuffer} framebuffer The WebGLFramebuffer for this framebufferInfo
   * @property {WebGLObject[]} attachments The created attachments in the same order as passed in to {@link module:twgl.createFramebufferInfo}.
   * @memberOf module:twgl
   */

  /**
   * Creates a framebuffer and attachments.
   *
   * This returns a {@link module:twgl.FramebufferInfo} because it needs to return the attachments as well as the framebuffer.
   *
   * The simplest usage
   *
   *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
   *     var fbi = twgl.createFramebuffer(gl);
   *
   * More complex usage
   *
   *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
   *     var attachments = [
   *       { format: RGB565, mag: NEAREST },
   *       { format: STENCIL_INDEX8 },
   *     ]
   *     var fbi = twgl.createFramebuffer(gl, attachments);
   *
   * Passing in a specific size
   *
   *     var width = 256;
   *     var height = 256;
   *     var fbi = twgl.createFramebuffer(gl, attachments, width, height);
   *
   * **Note!!** It is up to you to check if the framebuffer is renderable by calling `gl.checkFramebufferStatus`.
   * [WebGL only guarantees 3 combinations of attachments work](https://www.khronos.org/registry/webgl/specs/latest/1.0/#6.6).
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.AttachmentOptions[]} [attachments] which attachments to create. If not provided the default is a framebuffer with an
   *    `RGBA`, `UNSIGNED_BYTE` texture `COLOR_ATTACHMENT0` and a `DEPTH_STENCIL` renderbuffer `DEPTH_STENCIL_ATTACHMENT`.
   * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
   * @param {number} [height] the height for the attachments. Defautt = size of drawingBuffer
   * @return {module:twgl.FramebufferInfo} the framebuffer and attachments.
   * @memberOf module:twgl
   */
  function createFramebufferInfo(gl, attachments, width, height) {
    var target = gl.FRAMEBUFFER;
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(target, fb);
    width  = width  || gl.drawingBufferWidth;
    height = height || gl.drawingBufferHeight;
    attachments = attachments || defaultAttachments;
    var colorAttachmentCount = 0;
    var framebufferInfo = {
      framebuffer: fb,
      attachments: [],
      width: width,
      height: height,
    };
    attachments.forEach(function(attachmentOptions) {
      var attachment = attachmentOptions.attachment;
      var format = attachmentOptions.format;
      var attachmentPoint = getAttachmentPointForFormat(format);
      if (!attachmentPoint) {
        attachmentPoint = COLOR_ATTACHMENT0 + colorAttachmentCount++;
      }
      if (!attachment) {
        if (isRenderbufferFormat(format)) {
          attachment = gl.createRenderbuffer();
          gl.bindRenderbuffer(gl.RENDERBUFFER, attachment);
          gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
        } else {
          var textureOptions = utils.shallowCopy(attachmentOptions);
          textureOptions.width = width;
          textureOptions.height = height;
          textureOptions.auto = attachmentOptions.auto === undefined ? false : attachmentOptions.auto;
          attachment = textures.createTexture(gl, textureOptions);
        }
      }
      if (attachment instanceof WebGLRenderbuffer) {
        gl.framebufferRenderbuffer(target, attachmentPoint, gl.RENDERBUFFER, attachment);
      } else if (attachment instanceof WebGLTexture) {
        gl.framebufferTexture2D(
            target,
            attachmentPoint,
            attachmentOptions.texTarget || gl.TEXTURE_2D,
            attachment,
            attachmentOptions.level || 0);
      } else {
        throw "unknown attachment type";
      }
      framebufferInfo.attachments.push(attachment);
    });
    return framebufferInfo;
  }

  /**
   * Resizes the attachments of a framebuffer.
   *
   * You need to pass in the same `attachments` as you passed in {@link module:twgl.createFramebuffer}
   * because TWGL has no idea the format/type of each attachment.
   *
   * The simplest usage
   *
   *     // create an RGBA/UNSIGNED_BYTE texture and DEPTH_STENCIL renderbuffer
   *     var fbi = twgl.createFramebuffer(gl);
   *
   *     ...
   *
   *     function render() {
   *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
   *         // resize the attachments
   *         twgl.resizeFramebufferInfo(gl, fbi);
   *       }
   *
   * More complex usage
   *
   *     // create an RGB565 renderbuffer and a STENCIL_INDEX8 renderbuffer
   *     var attachments = [
   *       { format: RGB565, mag: NEAREST },
   *       { format: STENCIL_INDEX8 },
   *     ]
   *     var fbi = twgl.createFramebuffer(gl, attachments);
   *
   *     ...
   *
   *     function render() {
   *       if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
   *         // resize the attachments to match
   *         twgl.resizeFramebufferInfo(gl, fbi, attachments);
   *       }
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.FramebufferInfo} framebufferInfo a framebufferInfo as returned from {@link module:twgl.createFramebuffer}.
   * @param {module:twgl.AttachmentOptions[]} [attachments] the same attachments options as passed to {@link module:twgl.createFramebuffer}.
   * @param {number} [width] the width for the attachments. Default = size of drawingBuffer
   * @param {number} [height] the height for the attachments. Defautt = size of drawingBuffer
   * @memberOf module:twgl
   */
  function resizeFramebufferInfo(gl, framebufferInfo, attachments, width, height) {
    width  = width  || gl.drawingBufferWidth;
    height = height || gl.drawingBufferHeight;
    framebufferInfo.width = width;
    framebufferInfo.height = height;
    attachments = attachments || defaultAttachments;
    attachments.forEach(function(attachmentOptions, ndx) {
      var attachment = framebufferInfo.attachments[ndx];
      var format = attachmentOptions.format;
      if (attachment instanceof WebGLRenderbuffer) {
        gl.bindRenderbuffer(gl.RENDERBUFFER, attachment);
        gl.renderbufferStorage(gl.RENDERBUFFER, format, width, height);
      } else if (attachment instanceof WebGLTexture) {
        textures.resizeTexture(gl, attachment, attachmentOptions, width, height);
      } else {
        throw "unknown attachment type";
      }
    });
  }

  /**
   * Binds a framebuffer
   *
   * This function pretty much soley exists because I spent hours
   * trying to figure out why something I wrote wasn't working only
   * to realize I forget to set the viewport dimensions.
   * My hope is this function will fix that.
   *
   * It is effectively the same as
   *
   *     gl.bindFramebuffer(gl.FRAMEBUFFER, someFramebufferInfo.framebuffer);
   *     gl.viewport(0, 0, someFramebufferInfo.width, someFramebufferInfo.height);
   *
   * @param {WebGLRenderingContext} gl the WebGLRenderingContext
   * @param {module:twgl.FramebufferInfo} [framebufferInfo] a framebufferInfo as returned from {@link module:twgl.createFramebuffer}.
   *   If not passed will bind the canvas.
   * @param {number} [target] The target. If not passed `gl.FRAMEBUFFER` will be used.
   * @memberOf module:twgl
   */

  function bindFramebufferInfo(gl, framebufferInfo, target) {
    target = target || gl.FRAMEBUFFER;
    if (framebufferInfo) {
      gl.bindFramebuffer(target, framebufferInfo.framebuffer);
      gl.viewport(0, 0, framebufferInfo.width, framebufferInfo.height);
    } else {
      gl.bindFramebuffer(target, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "bindFramebufferInfo": bindFramebufferInfo,
    "createFramebufferInfo": createFramebufferInfo,
    "resizeFramebufferInfo": resizeFramebufferInfo,
  };
});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define('twgl/twgl',[
    './attributes',
    './draw',
    './framebuffers',
    './programs',
    './textures',
    './typedarrays',
  ], function (
    attributes,
    draw,
    framebuffers,
    programs,
    textures,
    typedArrays) {
  

  /**
   * The main TWGL module.
   *
   * @module twgl
   */

  // make sure we don't see a global gl
  var gl = undefined;  // eslint-disable-line

  /**
   * Various default settings for twgl.
   *
   * Note: You can call this any number of times. Example:
   *
   *     twgl.setDefaults({ textureColor: [1, 0, 0, 1] });
   *     twgl.setDefaults({ attribPrefix: 'a_' });
   *
   * is equivalent to
   *
   *     twgl.setDefaults({
   *       textureColor: [1, 0, 0, 1],
   *       attribPrefix: 'a_',
   *     });
   *
   * @typedef {Object} Defaults
   * @property {string} attribPrefix The prefix to stick on attributes
   *
   *   When writing shaders I prefer to name attributes with `a_`, uniforms with `u_` and varyings with `v_`
   *   as it makes it clear where they came from. But, when building geometry I prefer using unprefixed names.
   *
   *   In otherwords I'll create arrays of geometry like this
   *
   *       var arrays = {
   *         position: ...
   *         normal: ...
   *         texcoord: ...
   *       };
   *
   *   But need those mapped to attributes and my attributes start with `a_`.
   *
   *   Default: `""`
   *
   * @property {number[]} textureColor Array of 4 values in the range 0 to 1
   *
   *   The default texture color is used when loading textures from
   *   urls. Because the URL will be loaded async we'd like to be
   *   able to use the texture immediately. By putting a 1x1 pixel
   *   color in the texture we can start using the texture before
   *   the URL has loaded.
   *
   *   Default: `[0.5, 0.75, 1, 1]`
   *
   * @property {string} crossOrigin
   *
   *   If not undefined sets the crossOrigin attribute on images
   *   that twgl creates when downloading images for textures.
   *
   *   Also see {@link module:twgl.TextureOptions}.
   *
   * @memberOf module:twgl
   */

  /**
   * Sets various defaults for twgl.
   *
   * In the interest of terseness which is kind of the point
   * of twgl I've integrated a few of the older functions here
   *
   * @param {module:twgl.Defaults} newDefaults The default settings.
   * @memberOf module:twgl
   */
  function setDefaults(newDefaults) {
    attributes.setDefaults_(newDefaults);  // eslint-disable-line
    textures.setDefaults_(newDefaults);  // eslint-disable-line
  }

  /**
   * Creates a webgl context.
   * @param {HTMLCanvasElement} canvas The canvas tag to get
   *     context from. If one is not passed in one will be
   *     created.
   * @return {WebGLRenderingContext} The created context.
   */
  function create3DContext(canvas, opt_attribs) {
    var names = ["webgl", "experimental-webgl"];
    var context = null;
    for (var ii = 0; ii < names.length; ++ii) {
      try {
        context = canvas.getContext(names[ii], opt_attribs);
      } catch(e) {}  // eslint-disable-line
      if (context) {
        break;
      }
    }
    return context;
  }

  /**
   * Gets a WebGL context.
   * @param {HTMLCanvasElement} canvas a canvas element.
   * @param {WebGLContextCreationAttirbutes} [opt_attribs] optional webgl context creation attributes
   * @memberOf module:twgl
   */
  function getWebGLContext(canvas, opt_attribs) {
    var gl = create3DContext(canvas, opt_attribs);
    return gl;
  }

  /**
   * Resize a canvas to match the size it's displayed.
   * @param {HTMLCanvasElement} canvas The canvas to resize.
   * @param {number} [a] multiplier. So you can pass in `window.devicePixelRatio` if you want to.
   * @return {boolean} true if the canvas was resized.
   * @memberOf module:twgl
   */
  function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    multiplier = Math.max(1, multiplier);
    var width  = canvas.clientWidth  * multiplier | 0;
    var height = canvas.clientHeight * multiplier | 0;
    if (canvas.width !== width ||
        canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  var api = {
    "getWebGLContext": getWebGLContext,
    "resizeCanvasToDisplaySize": resizeCanvasToDisplaySize,
    "setDefaults": setDefaults,
  };

  function notPrivate(name) {
    return name[name.length - 1] !== '_';
  }

  function copyPublicProperties(src, dst) {
    Object.keys(src).filter(notPrivate).forEach(function(key) {
      dst[key] = src[key];
    });
  }

  [
    attributes,
    draw,
    framebuffers,
    programs,
    textures,
    typedArrays,
  ].forEach(function(src) {
    copyPublicProperties(src, api);
  });

  return api;

});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define('twgl/v3',[], function () {
  

  /**
   *
   * Vec3 math math functions.
   *
   * Almost all functions take an optional `dst` argument. If it is not passed in the
   * functions will create a new Vec3. In other words you can do this
   *
   *     var v = v3.cross(v1, v2);  // Creates a new Vec3 with the cross product of v1 x v2.
   *
   * or
   *
   *     var v3 = v3.create();
   *     v3.cross(v1, v2, v);  // Puts the cross product of v1 x v2 in v
   *
   * The first style is often easier but depending on where it's used it generates garbage where
   * as there is almost never allocation with the second style.
   *
   * It is always save to pass any vector as the destination. So for example
   *
   *     v3.cross(v1, v2, v1);  // Puts the cross product of v1 x v2 in v1
   *
   * @module twgl/v3
   */

  var VecType = Float32Array;

  /**
   * A JavaScript array with 3 values or a Float32Array with 3 values.
   * When created by the library will create the default type which is `Float32Array`
   * but can be set by calling {@link module:twgl/v3.setDefaultType}.
   * @typedef {(number[]|Float32Array)} Vec3
   * @memberOf module:twgl/v3
   */

  /**
   * Sets the type this library creates for a Vec3
   * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
   */
  function setDefaultType(ctor) {
      VecType = ctor;
  }

  /**
   * Creates a vec3; may be called with x, y, z to set initial values.
   * @return {Vec3} the created vector
   * @memberOf module:twgl/v3
   */
  function create(x, y, z) {
    var dst = new VecType(3);
    if (x) {
      dst[0] = x;
    }
    if (y) {
      dst[1] = y;
    }
    if (z) {
      dst[2] = z;
    }
    return dst;
  }

  /**
   * Adds two vectors; assumes a and b have the same dimension.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @memberOf module:twgl/v3
   */
  function add(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] + b[0];
    dst[1] = a[1] + b[1];
    dst[2] = a[2] + b[2];

    return dst;
  }

  /**
   * Subtracts two vectors.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @memberOf module:twgl/v3
   */
  function subtract(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] - b[0];
    dst[1] = a[1] - b[1];
    dst[2] = a[2] - b[2];

    return dst;
  }

  /**
   * Performs linear interpolation on two vectors.
   * Given vectors a and b and interpolation coefficient t, returns
   * (1 - t) * a + t * b.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {number} t Interpolation coefficient.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @memberOf module:twgl/v3
   */
  function lerp(a, b, t, dst) {
    dst = dst || new VecType(3);

    dst[0] = (1 - t) * a[0] + t * b[0];
    dst[1] = (1 - t) * a[1] + t * b[1];
    dst[2] = (1 - t) * a[2] + t * b[2];

    return dst;
  }

  /**
   * Mutiplies a vector by a scalar.
   * @param {module:twgl/v3.Vec3} v The vector.
   * @param {number} k The scalar.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} dst.
   * @memberOf module:twgl/v3
   */
  function mulScalar(v, k, dst) {
    dst = dst || new VecType(3);

    dst[0] = v[0] * k;
    dst[1] = v[1] * k;
    dst[2] = v[2] * k;

    return dst;
  }

  /**
   * Divides a vector by a scalar.
   * @param {module:twgl/v3.Vec3} v The vector.
   * @param {number} k The scalar.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} dst.
   * @memberOf module:twgl/v3
   */
  function divScalar(v, k, dst) {
    dst = dst || new VecType(3);

    dst[0] = v[0] / k;
    dst[1] = v[1] / k;
    dst[2] = v[2] / k;

    return dst;
  }

  /**
   * Computes the cross product of two vectors; assumes both vectors have
   * three entries.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} The vector a cross b.
   * @memberOf module:twgl/v3
   */
  function cross(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[1] * b[2] - a[2] * b[1];
    dst[1] = a[2] * b[0] - a[0] * b[2];
    dst[2] = a[0] * b[1] - a[1] * b[0];

    return dst;
  }

  /**
   * Computes the dot product of two vectors; assumes both vectors have
   * three entries.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @return {number} dot product
   * @memberOf module:twgl/v3
   */
  function dot(a, b) {
    return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
  }

  /**
   * Computes the length of vector
   * @param {module:twgl/v3.Vec3} v vector.
   * @return {number} length of vector.
   * @memberOf module:twgl/v3
   */
  function length(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }

  /**
   * Computes the square of the length of vector
   * @param {module:twgl/v3.Vec3} v vector.
   * @return {number} square of the length of vector.
   * @memberOf module:twgl/v3
   */
  function lengthSq(v) {
    return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
  }

  /**
   * Divides a vector by its Euclidean length and returns the quotient.
   * @param {module:twgl/v3.Vec3} a The vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} The normalized vector.
   * @memberOf module:twgl/v3
   */
  function normalize(a, dst) {
    dst = dst || new VecType(3);

    var lenSq = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    var len = Math.sqrt(lenSq);
    if (len > 0.00001) {
      dst[0] = a[0] / len;
      dst[1] = a[1] / len;
      dst[2] = a[2] / len;
    } else {
      dst[0] = 0;
      dst[1] = 0;
      dst[2] = 0;
    }

    return dst;
  }

  /**
   * Negates a vector.
   * @param {module:twgl/v3.Vec3} v The vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} -v.
   * @memberOf module:twgl/v3
   */
  function negate(v, dst) {
    dst = dst || new VecType(3);

    dst[0] = -v[0];
    dst[1] = -v[1];
    dst[2] = -v[2];

    return dst;
  }

  /**
   * Copies a vector.
   * @param {module:twgl/v3.Vec3} v The vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} A copy of v.
   * @memberOf module:twgl/v3
   */
  function copy(v, dst) {
    dst = dst || new VecType(3);

    dst[0] = v[0];
    dst[1] = v[1];
    dst[2] = v[2];

    return dst;
  }

  /**
   * Multiplies a vector by another vector (component-wise); assumes a and
   * b have the same length.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} The vector of products of entries of a and
   *     b.
   * @memberOf module:twgl/v3
   */
  function multiply(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] * b[0];
    dst[1] = a[1] * b[1];
    dst[2] = a[2] * b[2];

    return dst;
  }

  /**
   * Divides a vector by another vector (component-wise); assumes a and
   * b have the same length.
   * @param {module:twgl/v3.Vec3} a Operand vector.
   * @param {module:twgl/v3.Vec3} b Operand vector.
   * @param {module:twgl/v3.Vec3} [dst] vector to hold result. If not new one is created..
   * @return {module:twgl/v3.Vec3} The vector of quotients of entries of a and
   *     b.
   * @memberOf module:twgl/v3
   */
  function divide(a, b, dst) {
    dst = dst || new VecType(3);

    dst[0] = a[0] / b[0];
    dst[1] = a[1] / b[1];
    dst[2] = a[2] / b[2];

    return dst;
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "add": add,
    "copy": copy,
    "create": create,
    "cross": cross,
    "divide": divide,
    "divScalar": divScalar,
    "dot": dot,
    "lerp": lerp,
    "length": length,
    "lengthSq": lengthSq,
    "mulScalar": mulScalar,
    "multiply": multiply,
    "negate": negate,
    "normalize": normalize,
    "setDefaultType": setDefaultType,
    "subtract": subtract,
  };

});

/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

define('twgl/m4',['./v3'], function (v3) {
  

  /**
   * 4x4 Matrix math math functions.
   *
   * Almost all functions take an optional `dst` argument. If it is not passed in the
   * functions will create a new matrix. In other words you can do this
   *
   *     var mat = m4.translation([1, 2, 3]);  // Creates a new translation matrix
   *
   * or
   *
   *     var mat = m4.create();
   *     m4.translation([1, 2, 3], mat);  // Puts translation matrix in mat.
   *
   * The first style is often easier but depending on where it's used it generates garbage where
   * as there is almost never allocation with the second style.
   *
   * It is always save to pass any matrix as the destination. So for example
   *
   *     var mat = m4.identity();
   *     var trans = m4.translation([1, 2, 3]);
   *     m4.multiply(mat, trans, mat);  // Multiplies mat * trans and puts result in mat.
   *
   * @module twgl/m4
   */
  var MatType = Float32Array;

  var tempV3a = v3.create();
  var tempV3b = v3.create();
  var tempV3c = v3.create();

  /**
   * A JavaScript array with 16 values or a Float32Array with 16 values.
   * When created by the library will create the default type which is `Float32Array`
   * but can be set by calling {@link module:twgl/m4.setDefaultType}.
   * @typedef {(number[]|Float32Array)} Mat4
   * @memberOf module:twgl/m4
   */

  /**
   * Sets the type this library creates for a Mat4
   * @param {constructor} ctor the constructor for the type. Either `Float32Array` or `Array`
   */
  function setDefaultType(ctor) {
      VecType = ctor;
  }

  /**
   * Negates a matrix.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} -m.
   * @memberOf module:twgl/m4
   */
  function negate(m, dst) {
    dst = dst || new MatType(16);

    dst[ 0] = -m[ 0];
    dst[ 1] = -m[ 1];
    dst[ 2] = -m[ 2];
    dst[ 3] = -m[ 3];
    dst[ 4] = -m[ 4];
    dst[ 5] = -m[ 5];
    dst[ 6] = -m[ 6];
    dst[ 7] = -m[ 7];
    dst[ 8] = -m[ 8];
    dst[ 9] = -m[ 9];
    dst[10] = -m[10];
    dst[11] = -m[11];
    dst[12] = -m[12];
    dst[13] = -m[13];
    dst[14] = -m[14];
    dst[15] = -m[15];

    return dst;
  }

  /**
   * Copies a matrix.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {module:twgl/m4.Mat4} [dst] The matrix.
   * @return {module:twgl/m4.Mat4} A copy of m.
   * @memberOf module:twgl/m4
   */
  function copy(m, dst) {
    dst = dst || new MatType(16);

    dst[ 0] = m[ 0];
    dst[ 1] = m[ 1];
    dst[ 2] = m[ 2];
    dst[ 3] = m[ 3];
    dst[ 4] = m[ 4];
    dst[ 5] = m[ 5];
    dst[ 6] = m[ 6];
    dst[ 7] = m[ 7];
    dst[ 8] = m[ 8];
    dst[ 9] = m[ 9];
    dst[10] = m[10];
    dst[11] = m[11];
    dst[12] = m[12];
    dst[13] = m[13];
    dst[14] = m[14];
    dst[15] = m[15];

    return dst;
  }

  /**
   * Creates an n-by-n identity matrix.
   *
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} An n-by-n identity matrix.
   * @memberOf module:twgl/m4
   */
  function identity(dst) {
    dst = dst || new MatType(16);

    dst[ 0] = 1;
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = 1;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = 0;
    dst[10] = 1;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Takes the transpose of a matrix.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The transpose of m.
   * @memberOf module:twgl/m4
   */
   function transpose(m, dst) {
    dst = dst || new MatType(16);
    if (dst === m) {
      var t;

      t = m[1];
      m[1] = m[4];
      m[4] = t;

      t = m[2];
      m[2] = m[8];
      m[8] = t;

      t = m[3];
      m[3] = m[12];
      m[12] = t;

      t = m[6];
      m[6] = m[9];
      m[9] = t;

      t = m[7];
      m[7] = m[13];
      m[13] = t;

      t = m[11];
      m[11] = m[14];
      m[14] = t;
      return dst;
    }

    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];

    dst[ 0] = m00;
    dst[ 1] = m10;
    dst[ 2] = m20;
    dst[ 3] = m30;
    dst[ 4] = m01;
    dst[ 5] = m11;
    dst[ 6] = m21;
    dst[ 7] = m31;
    dst[ 8] = m02;
    dst[ 9] = m12;
    dst[10] = m22;
    dst[11] = m32;
    dst[12] = m03;
    dst[13] = m13;
    dst[14] = m23;
    dst[15] = m33;

    return dst;
  }

  /**
   * Computes the inverse of a 4-by-4 matrix.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The inverse of m.
   * @memberOf module:twgl/m4
   */
  function inverse(m, dst) {
    dst = dst || new MatType(16);

    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0  = m22 * m33;
    var tmp_1  = m32 * m23;
    var tmp_2  = m12 * m33;
    var tmp_3  = m32 * m13;
    var tmp_4  = m12 * m23;
    var tmp_5  = m22 * m13;
    var tmp_6  = m02 * m33;
    var tmp_7  = m32 * m03;
    var tmp_8  = m02 * m23;
    var tmp_9  = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    dst[ 0] = d * t0;
    dst[ 1] = d * t1;
    dst[ 2] = d * t2;
    dst[ 3] = d * t3;
    dst[ 4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
    dst[ 5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
    dst[ 6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
    dst[ 7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
    dst[ 8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
    dst[ 9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
    dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
    dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
    dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
    dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
    dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
    dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

    return dst;
  }

  /**
   * Multiplies two 4-by-4 matrices; assumes that the given matrices are 4-by-4;
   * assumes matrix entries are accessed in [row][column] fashion.
   * @param {module:twgl/m4.Mat4} a The matrix on the left.
   * @param {module:twgl/m4.Mat4} b The matrix on the right.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The matrix product of a and b.
   * @memberOf module:twgl/m4
   */
  function multiply(a, b, dst) {
    dst = dst || new MatType(16);

    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a10 = a[ 4 + 0];
    var a11 = a[ 4 + 1];
    var a12 = a[ 4 + 2];
    var a13 = a[ 4 + 3];
    var a20 = a[ 8 + 0];
    var a21 = a[ 8 + 1];
    var a22 = a[ 8 + 2];
    var a23 = a[ 8 + 3];
    var a30 = a[12 + 0];
    var a31 = a[12 + 1];
    var a32 = a[12 + 2];
    var a33 = a[12 + 3];
    var b00 = b[0];
    var b01 = b[1];
    var b02 = b[2];
    var b03 = b[3];
    var b10 = b[ 4 + 0];
    var b11 = b[ 4 + 1];
    var b12 = b[ 4 + 2];
    var b13 = b[ 4 + 3];
    var b20 = b[ 8 + 0];
    var b21 = b[ 8 + 1];
    var b22 = b[ 8 + 2];
    var b23 = b[ 8 + 3];
    var b30 = b[12 + 0];
    var b31 = b[12 + 1];
    var b32 = b[12 + 2];
    var b33 = b[12 + 3];

    dst[ 0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    dst[ 1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    dst[ 2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    dst[ 3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;
    dst[ 4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    dst[ 5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    dst[ 6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    dst[ 7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;
    dst[ 8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    dst[ 9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    dst[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    dst[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;
    dst[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    dst[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    dst[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    dst[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

    return dst;
  }

  /**
   * Sets the translation component of a 4-by-4 matrix to the given
   * vector.
   * @param {module:twgl/m4.Mat4} a The matrix.
   * @param {Vec3} v The vector.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} a once modified.
   * @memberOf module:twgl/m4
   */
  function setTranslation(a, v, dst) {
    dst = dst || identity();
    if (a !== dst) {
      dst[ 0] = a[ 0];
      dst[ 1] = a[ 1];
      dst[ 2] = a[ 2];
      dst[ 3] = a[ 3];
      dst[ 4] = a[ 4];
      dst[ 5] = a[ 5];
      dst[ 6] = a[ 6];
      dst[ 7] = a[ 7];
      dst[ 8] = a[ 8];
      dst[ 9] = a[ 9];
      dst[10] = a[10];
      dst[11] = a[11];
    }
    dst[12] = v[0];
    dst[13] = v[1];
    dst[14] = v[2];
    dst[15] = 1;
    return dst;
  }

  /**
   * Returns the translation component of a 4-by-4 matrix as a vector with 3
   * entries.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @return {Vec3} [dst] vector..
   * @return {Vec3} The translation component of m.
   * @memberOf module:twgl/m4
   */
  function getTranslation(m, dst) {
    dst = dst || v3.create();
    dst[0] = m[12];
    dst[1] = m[13];
    dst[2] = m[14];
    return dst;
  }

  /**
   * Returns the axis of a 4x4 matrix as a vector with 3 entries
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {number} axis The axis 0 = x, 1 = y, 2 = z;
   * @return {Vec3} [dst] vector.
   * @return {Vec3} The axis component of m.
   * @memberOf module:twgl/m4
   */
  function getAxis(m, axis, dst) {
    dst = dst || v3.create();
    var off = axis * 4;
    dst[0] = m[off + 0];
    dst[1] = m[off + 1];
    dst[2] = m[off + 2];
    return dst;
  }

  /**
   * Computes a 4-by-4 perspective transformation matrix given the angular height
   * of the frustum, the aspect ratio, and the near and far clipping planes.  The
   * arguments define a frustum extending in the negative z direction.  The given
   * angle is the vertical angle of the frustum, and the horizontal angle is
   * determined to produce the given aspect ratio.  The arguments near and far are
   * the distances to the near and far clipping planes.  Note that near and far
   * are not z coordinates, but rather they are distances along the negative
   * z-axis.  The matrix generated sends the viewing frustum to the unit box.
   * We assume a unit box extending from -1 to 1 in the x and y dimensions and
   * from 0 to 1 in the z dimension.
   * @param {number} fieldOfViewYInRadians The camera angle from top to bottom (in radians).
   * @param {number} aspect The aspect ratio width / height.
   * @param {number} zNear The depth (negative z coordinate)
   *     of the near clipping plane.
   * @param {number} zFar The depth (negative z coordinate)
   *     of the far clipping plane.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The perspective matrix.
   * @memberOf module:twgl/m4
   */
  function perspective(fieldOfViewYInRadians, aspect, zNear, zFar, dst) {
    dst = dst || new MatType(16);

    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewYInRadians);
    var rangeInv = 1.0 / (zNear - zFar);

    dst[0]  = f / aspect;
    dst[1]  = 0;
    dst[2]  = 0;
    dst[3]  = 0;

    dst[4]  = 0;
    dst[5]  = f;
    dst[6]  = 0;
    dst[7]  = 0;

    dst[8]  = 0;
    dst[9]  = 0;
    dst[10] = (zNear + zFar) * rangeInv;
    dst[11] = -1;

    dst[12] = 0;
    dst[13] = 0;
    dst[14] = zNear * zFar * rangeInv * 2;
    dst[15] = 0;

    return dst;
  }

  /**
   * Computes a 4-by-4 othogonal transformation matrix given the left, right,
   * bottom, and top dimensions of the near clipping plane as well as the
   * near and far clipping plane distances.
   * @param {number} left Left side of the near clipping plane viewport.
   * @param {number} right Right side of the near clipping plane viewport.
   * @param {number} top Top of the near clipping plane viewport.
   * @param {number} bottom Bottom of the near clipping plane viewport.
   * @param {number} near The depth (negative z coordinate)
   *     of the near clipping plane.
   * @param {number} far The depth (negative z coordinate)
   *     of the far clipping plane.
   * @param {module:twgl/m4.Mat4} [dst] Output matrix.
   * @return {module:twgl/m4.Mat4} The perspective matrix.
   * @memberOf module:twgl/m4
   */
  function ortho(left, right, bottom, top, near, far, dst) {
    dst = dst || new MatType(16);

    dst[0]  = 2 / (right - left);
    dst[1]  = 0;
    dst[2]  = 0;
    dst[3]  = 0;

    dst[4]  = 0;
    dst[5]  = 2 / (top - bottom);
    dst[6]  = 0;
    dst[7]  = 0;

    dst[8]  = 0;
    dst[9]  = 0;
    dst[10] = -1 / (far - near);
    dst[11] = 0;

    dst[12] = (right + left) / (left - right);
    dst[13] = (top + bottom) / (bottom - top);
    dst[14] = -near / (near - far);
    dst[15] = 1;

    return dst;
  }

  /**
   * Computes a 4-by-4 perspective transformation matrix given the left, right,
   * top, bottom, near and far clipping planes. The arguments define a frustum
   * extending in the negative z direction. The arguments near and far are the
   * distances to the near and far clipping planes. Note that near and far are not
   * z coordinates, but rather they are distances along the negative z-axis. The
   * matrix generated sends the viewing frustum to the unit box. We assume a unit
   * box extending from -1 to 1 in the x and y dimensions and from 0 to 1 in the z
   * dimension.
   * @param {number} left The x coordinate of the left plane of the box.
   * @param {number} right The x coordinate of the right plane of the box.
   * @param {number} bottom The y coordinate of the bottom plane of the box.
   * @param {number} top The y coordinate of the right plane of the box.
   * @param {number} near The negative z coordinate of the near plane of the box.
   * @param {number} far The negative z coordinate of the far plane of the box.
   * @param {module:twgl/m4.Mat4} [dst] Output matrix.
   * @return {module:twgl/m4.Mat4} The perspective projection matrix.
   * @memberOf module:twgl/m4
   */
  function frustum(left, right, bottom, top, near, far, dst) {
    dst = dst || new MatType(16);

    var dx = (right - left);
    var dy = (top - bottom);
    var dz = (near - far);

    dst[ 0] = 2 * near / dx;
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = 2 * near / dy;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = (left + right) / dx;
    dst[ 9] = (top + bottom) / dy;
    dst[10] = far / dz;
    dst[11] = -1;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = near * far / dz;
    dst[15] = 0;

    return dst;
  }

  /**
   * Computes a 4-by-4 look-at transformation.
   *
   * This is a matrix which positions the camera itself. If you want
   * a view matrix (a matrix which moves things in front of the camera)
   * take the inverse of this.
   *
   * @param {Vec3} eye The position of the eye.
   * @param {Vec3} target The position meant to be viewed.
   * @param {Vec3} up A vector pointing up.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The look-at matrix.
   * @memberOf module:twgl/m4
   */
  function lookAt(eye, target, up, dst) {
    dst = dst || new MatType(16);

    var xAxis = tempV3a;
    var yAxis = tempV3b;
    var zAxis = tempV3c;

    v3.normalize(
        v3.subtract(eye, target, zAxis), zAxis);
    v3.normalize(v3.cross(up, zAxis, xAxis), xAxis);
    v3.normalize(v3.cross(zAxis, xAxis, yAxis), yAxis);

    dst[ 0] = xAxis[0];
    dst[ 1] = xAxis[1];
    dst[ 2] = xAxis[2];
    dst[ 3] = 0;
    dst[ 4] = yAxis[0];
    dst[ 5] = yAxis[1];
    dst[ 6] = yAxis[2];
    dst[ 7] = 0;
    dst[ 8] = zAxis[0];
    dst[ 9] = zAxis[1];
    dst[10] = zAxis[2];
    dst[11] = 0;
    dst[12] = eye[0];
    dst[13] = eye[1];
    dst[14] = eye[2];
    dst[15] = 1;

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which translates by the given vector v.
   * @param {Vec3} v The vector by
   *     which to translate.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The translation matrix.
   * @memberOf module:twgl/m4
   */
  function translation(v, dst) {
    dst = dst || new MatType(16);

    dst[ 0] = 1;
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = 1;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = 0;
    dst[10] = 1;
    dst[11] = 0;
    dst[12] = v[0];
    dst[13] = v[1];
    dst[14] = v[2];
    dst[15] = 1;
    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by translation by the given vector v.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} v The vector by
   *     which to translate.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function translate(m, v, dst) {
    dst = dst || new MatType(16);

    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];
    var m00 = m[0];
    var m01 = m[1];
    var m02 = m[2];
    var m03 = m[3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];

    if (m !== dst) {
      dst[ 0] = m00;
      dst[ 1] = m01;
      dst[ 2] = m02;
      dst[ 3] = m03;
      dst[ 4] = m10;
      dst[ 5] = m11;
      dst[ 6] = m12;
      dst[ 7] = m13;
      dst[ 8] = m20;
      dst[ 9] = m21;
      dst[10] = m22;
      dst[11] = m23;
    }

    dst[12] = m00 * v0 + m10 * v1 + m20 * v2 + m30;
    dst[13] = m01 * v0 + m11 * v1 + m21 * v2 + m31;
    dst[14] = m02 * v0 + m12 * v1 + m22 * v2 + m32;
    dst[15] = m03 * v0 + m13 * v1 + m23 * v2 + m33;

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which rotates around the x-axis by the given angle.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The rotation matrix.
   * @memberOf module:twgl/m4
   */
  function rotationX(angleInRadians, dst) {
    dst = dst || new MatType(16);

    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = 1;
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = c;
    dst[ 6] = s;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = -s;
    dst[10] = c;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by a rotation around the x-axis by the given
   * angle.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function rotateX(m, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var m10 = m[4];
    var m11 = m[5];
    var m12 = m[6];
    var m13 = m[7];
    var m20 = m[8];
    var m21 = m[9];
    var m22 = m[10];
    var m23 = m[11];
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[4]  = c * m10 + s * m20;
    dst[5]  = c * m11 + s * m21;
    dst[6]  = c * m12 + s * m22;
    dst[7]  = c * m13 + s * m23;
    dst[8]  = c * m20 - s * m10;
    dst[9]  = c * m21 - s * m11;
    dst[10] = c * m22 - s * m12;
    dst[11] = c * m23 - s * m13;

    if (m !== dst) {
      dst[ 0] = m[ 0];
      dst[ 1] = m[ 1];
      dst[ 2] = m[ 2];
      dst[ 3] = m[ 3];
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which rotates around the y-axis by the given angle.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The rotation matrix.
   * @memberOf module:twgl/m4
   */
  function rotationY(angleInRadians, dst) {
    dst = dst || new MatType(16);

    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = c;
    dst[ 1] = 0;
    dst[ 2] = -s;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = 1;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = s;
    dst[ 9] = 0;
    dst[10] = c;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by a rotation around the y-axis by the given
   * angle.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function rotateY(m, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = c * m00 - s * m20;
    dst[ 1] = c * m01 - s * m21;
    dst[ 2] = c * m02 - s * m22;
    dst[ 3] = c * m03 - s * m23;
    dst[ 8] = c * m20 + s * m00;
    dst[ 9] = c * m21 + s * m01;
    dst[10] = c * m22 + s * m02;
    dst[11] = c * m23 + s * m03;

    if (m !== dst) {
      dst[ 4] = m[ 4];
      dst[ 5] = m[ 5];
      dst[ 6] = m[ 6];
      dst[ 7] = m[ 7];
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which rotates around the z-axis by the given angle.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The rotation matrix.
   * @memberOf module:twgl/m4
   */
  function rotationZ(angleInRadians, dst) {
    dst = dst || new MatType(16);

    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = c;
    dst[ 1] = s;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = -s;
    dst[ 5] = c;
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = 0;
    dst[10] = 1;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by a rotation around the z-axis by the given
   * angle.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function rotateZ(m, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    dst[ 0] = c * m00 + s * m10;
    dst[ 1] = c * m01 + s * m11;
    dst[ 2] = c * m02 + s * m12;
    dst[ 3] = c * m03 + s * m13;
    dst[ 4] = c * m10 - s * m00;
    dst[ 5] = c * m11 - s * m01;
    dst[ 6] = c * m12 - s * m02;
    dst[ 7] = c * m13 - s * m03;

    if (m !== dst) {
      dst[ 8] = m[ 8];
      dst[ 9] = m[ 9];
      dst[10] = m[10];
      dst[11] = m[11];
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which rotates around the given axis by the given
   * angle.
   * @param {Vec3} axis The axis
   *     about which to rotate.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} A matrix which rotates angle radians
   *     around the axis.
   * @memberOf module:twgl/m4
   */
  function axisRotation(axis, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var x = axis[0];
    var y = axis[1];
    var z = axis[2];
    var n = Math.sqrt(x * x + y * y + z * z);
    x /= n;
    y /= n;
    z /= n;
    var xx = x * x;
    var yy = y * y;
    var zz = z * z;
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    var oneMinusCosine = 1 - c;

    dst[ 0] = xx + (1 - xx) * c;
    dst[ 1] = x * y * oneMinusCosine + z * s;
    dst[ 2] = x * z * oneMinusCosine - y * s;
    dst[ 3] = 0;
    dst[ 4] = x * y * oneMinusCosine - z * s;
    dst[ 5] = yy + (1 - yy) * c;
    dst[ 6] = y * z * oneMinusCosine + x * s;
    dst[ 7] = 0;
    dst[ 8] = x * z * oneMinusCosine + y * s;
    dst[ 9] = y * z * oneMinusCosine - x * s;
    dst[10] = zz + (1 - zz) * c;
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix by rotation around the given axis by the
   * given angle.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} axis The axis
   *     about which to rotate.
   * @param {number} angleInRadians The angle by which to rotate (in radians).
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function axisRotate(m, axis, angleInRadians, dst) {
    dst = dst || new MatType(16);

    var x = axis[0];
    var y = axis[1];
    var z = axis[2];
    var n = Math.sqrt(x * x + y * y + z * z);
    x /= n;
    y /= n;
    z /= n;
    var xx = x * x;
    var yy = y * y;
    var zz = z * z;
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    var oneMinusCosine = 1 - c;

    var r00 = xx + (1 - xx) * c;
    var r01 = x * y * oneMinusCosine + z * s;
    var r02 = x * z * oneMinusCosine - y * s;
    var r10 = x * y * oneMinusCosine - z * s;
    var r11 = yy + (1 - yy) * c;
    var r12 = y * z * oneMinusCosine + x * s;
    var r20 = x * z * oneMinusCosine + y * s;
    var r21 = y * z * oneMinusCosine - x * s;
    var r22 = zz + (1 - zz) * c;

    var m00 = m[0];
    var m01 = m[1];
    var m02 = m[2];
    var m03 = m[3];
    var m10 = m[4];
    var m11 = m[5];
    var m12 = m[6];
    var m13 = m[7];
    var m20 = m[8];
    var m21 = m[9];
    var m22 = m[10];
    var m23 = m[11];

    dst[ 0] = r00 * m00 + r01 * m10 + r02 * m20;
    dst[ 1] = r00 * m01 + r01 * m11 + r02 * m21;
    dst[ 2] = r00 * m02 + r01 * m12 + r02 * m22;
    dst[ 3] = r00 * m03 + r01 * m13 + r02 * m23;
    dst[ 4] = r10 * m00 + r11 * m10 + r12 * m20;
    dst[ 5] = r10 * m01 + r11 * m11 + r12 * m21;
    dst[ 6] = r10 * m02 + r11 * m12 + r12 * m22;
    dst[ 7] = r10 * m03 + r11 * m13 + r12 * m23;
    dst[ 8] = r20 * m00 + r21 * m10 + r22 * m20;
    dst[ 9] = r20 * m01 + r21 * m11 + r22 * m21;
    dst[10] = r20 * m02 + r21 * m12 + r22 * m22;
    dst[11] = r20 * m03 + r21 * m13 + r22 * m23;

    if (m !== dst) {
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  /**
   * Creates a 4-by-4 matrix which scales in each dimension by an amount given by
   * the corresponding entry in the given vector; assumes the vector has three
   * entries.
   * @param {Vec3} v A vector of
   *     three entries specifying the factor by which to scale in each dimension.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} The scaling matrix.
   * @memberOf module:twgl/m4
   */
  function scaling(v, dst) {
    dst = dst || new MatType(16);

    dst[ 0] = v[0];
    dst[ 1] = 0;
    dst[ 2] = 0;
    dst[ 3] = 0;
    dst[ 4] = 0;
    dst[ 5] = v[1];
    dst[ 6] = 0;
    dst[ 7] = 0;
    dst[ 8] = 0;
    dst[ 9] = 0;
    dst[10] = v[2];
    dst[11] = 0;
    dst[12] = 0;
    dst[13] = 0;
    dst[14] = 0;
    dst[15] = 1;

    return dst;
  }

  /**
   * Modifies the given 4-by-4 matrix, scaling in each dimension by an amount
   * given by the corresponding entry in the given vector; assumes the vector has
   * three entries.
   * @param {module:twgl/m4.Mat4} m The matrix to be modified.
   * @param {Vec3} v A vector of three entries specifying the
   *     factor by which to scale in each dimension.
   * @param {module:twgl/m4.Mat4} [dst] matrix to hold result. If none new one is created..
   * @return {module:twgl/m4.Mat4} m once modified.
   * @memberOf module:twgl/m4
   */
  function scale(m, v, dst) {
    dst = dst || new MatType(16);

    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];

    dst[ 0] = v0 * m[0 * 4 + 0];
    dst[ 1] = v0 * m[0 * 4 + 1];
    dst[ 2] = v0 * m[0 * 4 + 2];
    dst[ 3] = v0 * m[0 * 4 + 3];
    dst[ 4] = v1 * m[1 * 4 + 0];
    dst[ 5] = v1 * m[1 * 4 + 1];
    dst[ 6] = v1 * m[1 * 4 + 2];
    dst[ 7] = v1 * m[1 * 4 + 3];
    dst[ 8] = v2 * m[2 * 4 + 0];
    dst[ 9] = v2 * m[2 * 4 + 1];
    dst[10] = v2 * m[2 * 4 + 2];
    dst[11] = v2 * m[2 * 4 + 3];

    if (m !== dst) {
      dst[12] = m[12];
      dst[13] = m[13];
      dst[14] = m[14];
      dst[15] = m[15];
    }

    return dst;
  }

  /**
   * Takes a 4-by-4 matrix and a vector with 3 entries,
   * interprets the vector as a point, transforms that point by the matrix, and
   * returns the result as a vector with 3 entries.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} v The point.
   * @param {Vec3} dst optional vec3 to store result
   * @return {Vec3} dst or new vec3 if not provided
   * @memberOf module:twgl/m4
   */
  function transformPoint(m, v, dst) {
    dst = dst || v3.create();
    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];
    var d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];

    dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
    dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
    dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;

    return dst;
  }

  /**
   * Takes a 4-by-4 matrix and a vector with 3 entries, interprets the vector as a
   * direction, transforms that direction by the matrix, and returns the result;
   * assumes the transformation of 3-dimensional space represented by the matrix
   * is parallel-preserving, i.e. any combination of rotation, scaling and
   * translation, but not a perspective distortion. Returns a vector with 3
   * entries.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} v The direction.
   * @param {Vec3} dst optional Vec3 to store result
   * @return {Vec3} dst or new Vec3 if not provided
   * @memberOf module:twgl/m4
   */
  function transformDirection(m, v, dst) {
    dst = dst || v3.create();

    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];

    dst[0] = v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0];
    dst[1] = v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1];
    dst[2] = v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2];

    return dst;
  }

  /**
   * Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector
   * as a normal to a surface, and computes a vector which is normal upon
   * transforming that surface by the matrix. The effect of this function is the
   * same as transforming v (as a direction) by the inverse-transpose of m.  This
   * function assumes the transformation of 3-dimensional space represented by the
   * matrix is parallel-preserving, i.e. any combination of rotation, scaling and
   * translation, but not a perspective distortion.  Returns a vector with 3
   * entries.
   * @param {module:twgl/m4.Mat4} m The matrix.
   * @param {Vec3} v The normal.
   * @param {Vec3} [dst] The direction.
   * @return {Vec3} The transformed direction.
   * @memberOf module:twgl/m4
   */
  function transformNormal(m, v, dst) {
    dst = dst || v3.create();
    var mi = inverse(m);
    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];

    dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
    dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
    dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

    return dst;
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "axisRotate": axisRotate,
    "axisRotation": axisRotation,
    "create": identity,
    "copy": copy,
    "frustum": frustum,
    "getAxis": getAxis,
    "getTranslation": getTranslation,
    "identity": identity,
    "inverse": inverse,
    "lookAt": lookAt,
    "multiply": multiply,
    "negate": negate,
    "ortho": ortho,
    "perspective": perspective,
    "rotateX": rotateX,
    "rotateY": rotateY,
    "rotateZ": rotateZ,
    "rotateAxis": axisRotate,
    "rotationX": rotationX,
    "rotationY": rotationY,
    "rotationZ": rotationZ,
    "scale": scale,
    "scaling": scaling,
    "setDefaultType": setDefaultType,
    "setTranslation": setTranslation,
    "transformDirection": transformDirection,
    "transformNormal": transformNormal,
    "transformPoint": transformPoint,
    "translate": translate,
    "translation": translation,
    "transpose": transpose,
  };
});


/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Various functions to make simple primitives
 *
 * note: Most primitive functions come in 3 styles
 *
 * *  `createSomeShapeBufferInfo`
 *
 *    These functions are almost always the functions you want to call. They
 *    create vertices then make WebGLBuffers and create {@link module:twgl.AttribInfo}s
 *    returing a {@link module:twgl.BufferInfo} you can pass to {@link module:twgl.setBuffersAndAttributes}
 *    and {@link module:twgl.drawBufferInfo} etc...
 *
 * *  `createSomeShapeBuffers`
 *
 *    These create WebGLBuffers and put your data in them but nothing else.
 *    It's a shortcut to doing it yourself if you don't want to use
 *    the higher level functions.
 *
 * *  `createSomeShapeVertices`
 *
 *    These just create vertices, no buffers. This allows you to manipulate the vertices
 *    or add more data before generating a {@link module:twgl.BufferInfo}. Once you're finished
 *    manipulating the vertices call {@link module:twgl.createBufferInfoFromArrays}.
 *
 *    example:
 *
 *        var arrays = twgl.primitives.createPlaneArrays(1);
 *        twgl.primitives.reorientVertices(arrays, m4.rotationX(Math.PI * 0.5));
 *        var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
 *
 * @module twgl/primitives
 */
define('twgl/primitives',[
    './twgl',
    './m4',
    './v3',
  ], function (
    twgl,
    m4,
    v3
  ) {
  

  /**
   * Add `push` to a typed array. It just keeps a 'cursor'
   * and allows use to `push` values into the array so we
   * don't have to manually compute offsets
   * @param {TypedArray} typedArray TypedArray to augment
   * @param {number} numComponents number of components.
   */
  function augmentTypedArray(typedArray, numComponents) {
    var cursor = 0;
    typedArray.push = function() {
      for (var ii = 0; ii < arguments.length; ++ii) {
        var value = arguments[ii];
        if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
          for (var jj = 0; jj < value.length; ++jj) {
            typedArray[cursor++] = value[jj];
          }
        } else {
          typedArray[cursor++] = value;
        }
      }
    };
    typedArray.reset = function(opt_index) {
      cursor = opt_index || 0;
    };
    typedArray.numComponents = numComponents;
    Object.defineProperty(typedArray, 'numElements', {
      get: function() {
        return this.length / this.numComponents | 0;
      },
    });
    return typedArray;
  }

  /**
   * creates a typed array with a `push` function attached
   * so that you can easily *push* values.
   *
   * `push` can take multiple arguments. If an argument is an array each element
   * of the array will be added to the typed array.
   *
   * Example:
   *
   *     var array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
   *     array.push(1, 2, 3);
   *     array.push([4, 5, 6]);
   *     // array now contains [1, 2, 3, 4, 5, 6]
   *
   * Also has `numComponents` and `numElements` properties.
   *
   * @param {number} numComponents number of components
   * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
   * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
   * @return {ArrayBuffer} A typed array.
   * @memberOf module:twgl
   */
  function createAugmentedTypedArray(numComponents, numElements, opt_type) {
    var Type = opt_type || Float32Array;
    return augmentTypedArray(new Type(numComponents * numElements), numComponents);
  }

  function allButIndices(name) {
    return name !== "indices";
  }

  /**
   * Given indexed vertices creates a new set of vertices unindexed by expanding the indexed vertices.
   * @param {Object.<string, TypedArray>} vertices The indexed vertices to deindex
   * @return {Object.<string, TypedArray>} The deindexed vertices
   * @memberOf module:twgl/primitives
   */
  function deindexVertices(vertices) {
    var indices = vertices.indices;
    var newVertices = {};
    var numElements = indices.length;

    function expandToUnindexed(channel) {
      var srcBuffer = vertices[channel];
      var numComponents = srcBuffer.numComponents;
      var dstBuffer = createAugmentedTypedArray(numComponents, numElements, srcBuffer.constructor);
      for (var ii = 0; ii < numElements; ++ii) {
        var ndx = indices[ii];
        var offset = ndx * numComponents;
        for (var jj = 0; jj < numComponents; ++jj) {
          dstBuffer.push(srcBuffer[offset + jj]);
        }
      }
      newVertices[channel] = dstBuffer;
    }

    Object.keys(vertices).filter(allButIndices).forEach(expandToUnindexed);

    return newVertices;
  }

  /**
   * flattens the normals of deindexed vertices in place.
   * @param {Object.<string, TypedArray>} vertices The deindexed vertices who's normals to flatten
   * @return {Object.<string, TypedArray>} The flattened vertices (same as was passed in)
   * @memberOf module:twgl/primitives
   */
  function flattenNormals(vertices) {
    if (vertices.indices) {
      throw "can't flatten normals of indexed vertices. deindex them first";
    }

    var normals = vertices.normal;
    var numNormals = normals.length;
    for (var ii = 0; ii < numNormals; ii += 9) {
      // pull out the 3 normals for this triangle
      var nax = normals[ii + 0];
      var nay = normals[ii + 1];
      var naz = normals[ii + 2];

      var nbx = normals[ii + 3];
      var nby = normals[ii + 4];
      var nbz = normals[ii + 5];

      var ncx = normals[ii + 6];
      var ncy = normals[ii + 7];
      var ncz = normals[ii + 8];

      // add them
      var nx = nax + nbx + ncx;
      var ny = nay + nby + ncy;
      var nz = naz + nbz + ncz;

      // normalize them
      var length = Math.sqrt(nx * nx + ny * ny + nz * nz);

      nx /= length;
      ny /= length;
      nz /= length;

      // copy them back in
      normals[ii + 0] = nx;
      normals[ii + 1] = ny;
      normals[ii + 2] = nz;

      normals[ii + 3] = nx;
      normals[ii + 4] = ny;
      normals[ii + 5] = nz;

      normals[ii + 6] = nx;
      normals[ii + 7] = ny;
      normals[ii + 8] = nz;
    }

    return vertices;
  }

  function applyFuncToV3Array(array, matrix, fn) {
    var len = array.length;
    var tmp = new Float32Array(3);
    for (var ii = 0; ii < len; ii += 3) {
      fn(matrix, [array[ii], array[ii + 1], array[ii + 2]], tmp);
      array[ii    ] = tmp[0];
      array[ii + 1] = tmp[1];
      array[ii + 2] = tmp[2];
    }
  }

  function transformNormal(mi, v, dst) {
    dst = dst || v3.create();
    var v0 = v[0];
    var v1 = v[1];
    var v2 = v[2];

    dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
    dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
    dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

    return dst;
  }

  /**
   * Reorients directions by the given matrix..
   * @param {number[]|TypedArray} array The array. Assumes value floats per element.
   * @param {Matrix} matrix A matrix to multiply by.
   * @return {number[]|TypedArray} the same array that was passed in
   * @memberOf module:twgl/primitives
   */
  function reorientDirections(array, matrix) {
    applyFuncToV3Array(array, matrix, m4.transformDirection);
    return array;
  }

  /**
   * Reorients normals by the inverse-transpose of the given
   * matrix..
   * @param {number[]|TypedArray} array The array. Assumes value floats per element.
   * @param {Matrix} matrix A matrix to multiply by.
   * @return {number[]|TypedArray} the same array that was passed in
   * @memberOf module:twgl/primitives
   */
  function reorientNormals(array, matrix) {
    applyFuncToV3Array(array, m4.inverse(matrix), transformNormal);
    return array;
  }

  /**
   * Reorients positions by the given matrix. In other words, it
   * multiplies each vertex by the given matrix.
   * @param {number[]|TypedArray} array The array. Assumes value floats per element.
   * @param {Matrix} matrix A matrix to multiply by.
   * @return {number[]|TypedArray} the same array that was passed in
   * @memberOf module:twgl/primitives
   */
  function reorientPositions(array, matrix) {
    applyFuncToV3Array(array, matrix, m4.transformPoint);
    return array;
  }

  /**
   * Reorients arrays by the given matrix. Assumes arrays have
   * names that contains 'pos' could be reoriented as positions,
   * 'binorm' or 'tan' as directions, and 'norm' as normals.
   *
   * @param {Object.<string, (number[]|TypedArray)>} arrays The vertices to reorient
   * @param {Matrix} matrix matrix to reorient by.
   * @return {Object.<string, (number[]|TypedArray)>} same arrays that were passed in.
   * @memberOf module:twgl/primitives
   */
  function reorientVertices(arrays, matrix) {
    Object.keys(arrays).forEach(function(name) {
      var array = arrays[name];
      if (name.indexOf("pos") >= 0) {
        reorientPositions(array, matrix);
      } else if (name.indexOf("tan") >= 0 || name.indexOf("binorm") >= 0) {
        reorientDirections(array, matrix);
      } else if (name.indexOf("norm") >= 0) {
        reorientNormals(array, matrix);
      }
    });
    return arrays;
  }

  /**
   * Creates XY quad BufferInfo
   *
   * The default with no parameters will return a 2x2 quad with values from -1 to +1.
   * If you want a unit quad with that goes from 0 to 1 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
   *
   * If you want a unit quad centered above 0,0 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
   * @param {number} [xOffset] the amount to offset the quad in X
   * @param {number} [yOffset] the amount to offset the quad in Y
   * @return {Object.<string, WebGLBuffer>} the created XY Quad BufferInfo
   * @memberOf module:twgl/primitives
   * @function createXYQuadBufferInfo
   */

  /**
   * Creates XY quad Buffers
   *
   * The default with no parameters will return a 2x2 quad with values from -1 to +1.
   * If you want a unit quad with that goes from 0 to 1 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0.5, 0.5);
   *
   * If you want a unit quad centered above 0,0 you'd call it with
   *
   *     twgl.primitives.createXYQuadBufferInfo(gl, 1, 0, 0.5);
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
   * @param {number} [xOffset] the amount to offset the quad in X
   * @param {number} [yOffset] the amount to offset the quad in Y
   * @return {module:twgl.BufferInfo} the created XY Quad buffers
   * @memberOf module:twgl/primitives
   * @function createXYQuadBuffers
   */

  /**
   * Creates XY quad vertices
   *
   * The default with no parameters will return a 2x2 quad with values from -1 to +1.
   * If you want a unit quad with that goes from 0 to 1 you'd call it with
   *
   *     twgl.primitives.createXYQuadVertices(1, 0.5, 0.5);
   *
   * If you want a unit quad centered above 0,0 you'd call it with
   *
   *     twgl.primitives.createXYQuadVertices(1, 0, 0.5);
   *
   * @param {number} [size] the size across the quad. Defaults to 2 which means vertices will go from -1 to +1
   * @param {number} [xOffset] the amount to offset the quad in X
   * @param {number} [yOffset] the amount to offset the quad in Y
   * @return {Object.<string, TypedArray> the created XY Quad vertices
   * @memberOf module:twgl/primitives
   */
  function createXYQuadVertices(size, xOffset, yOffset) {
    size = size || 2;
    xOffset = xOffset || 0;
    yOffset = yOffset || 0;
    size *= 0.5;
    return {
      position: {
        numComponents: 2,
        data: [
          xOffset + -1 * size, yOffset + -1 * size,
          xOffset +  1 * size, yOffset + -1 * size,
          xOffset + -1 * size, yOffset +  1 * size,
          xOffset +  1 * size, yOffset +  1 * size,
        ],
      },
      normal: [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
      ],
      texcoord: [
        0, 0,
        1, 0,
        0, 1,
        1, 1,
      ],
      indices: [ 0, 1, 2, 2, 1, 3 ],
    };
  }

  /**
   * Creates XZ plane BufferInfo.
   *
   * The created plane has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [width] Width of the plane. Default = 1
   * @param {number} [depth] Depth of the plane. Default = 1
   * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
   * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
   * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
   * @return {@module:twgl.BufferInfo} The created plane BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createPlaneBufferInfo
   */

  /**
   * Creates XZ plane buffers.
   *
   * The created plane has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [width] Width of the plane. Default = 1
   * @param {number} [depth] Depth of the plane. Default = 1
   * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
   * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
   * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
   * @return {Object.<string, WebGLBuffer>} The created plane buffers.
   * @memberOf module:twgl/primitives
   * @function createPlaneBuffers
   */

  /**
   * Creates XZ plane vertices.
   *
   * The created plane has position, normal, and texcoord data
   *
   * @param {number} [width] Width of the plane. Default = 1
   * @param {number} [depth] Depth of the plane. Default = 1
   * @param {number} [subdivisionsWidth] Number of steps across the plane. Default = 1
   * @param {number} [subdivisionsDepth] Number of steps down the plane. Default = 1
   * @param {Matrix4} [matrix] A matrix by which to multiply all the vertices.
   * @return {Object.<string, TypedArray>} The created plane vertices.
   * @memberOf module:twgl/primitives
   */
  function createPlaneVertices(
      width,
      depth,
      subdivisionsWidth,
      subdivisionsDepth,
      matrix) {
    width = width || 1;
    depth = depth || 1;
    subdivisionsWidth = subdivisionsWidth || 1;
    subdivisionsDepth = subdivisionsDepth || 1;
    matrix = matrix || m4.identity();

    var numVertices = (subdivisionsWidth + 1) * (subdivisionsDepth + 1);
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2, numVertices);

    for (var z = 0; z <= subdivisionsDepth; z++) {
      for (var x = 0; x <= subdivisionsWidth; x++) {
        var u = x / subdivisionsWidth;
        var v = z / subdivisionsDepth;
        positions.push(
            width * u - width * 0.5,
            0,
            depth * v - depth * 0.5);
        normals.push(0, 1, 0);
        texcoords.push(u, v);
      }
    }

    var numVertsAcross = subdivisionsWidth + 1;
    var indices = createAugmentedTypedArray(
        3, subdivisionsWidth * subdivisionsDepth * 2, Uint16Array);

    for (var z = 0; z < subdivisionsDepth; z++) {  // eslint-disable-line
      for (var x = 0; x < subdivisionsWidth; x++) {  // eslint-disable-line
        // Make triangle 1 of quad.
        indices.push(
            (z + 0) * numVertsAcross + x,
            (z + 1) * numVertsAcross + x,
            (z + 0) * numVertsAcross + x + 1);

        // Make triangle 2 of quad.
        indices.push(
            (z + 1) * numVertsAcross + x,
            (z + 1) * numVertsAcross + x + 1,
            (z + 0) * numVertsAcross + x + 1);
      }
    }

    var arrays = reorientVertices({
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    }, matrix);
    return arrays;
  }

  /**
   * Creates sphere BufferInfo.
   *
   * The created sphere has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of the sphere.
   * @param {number} subdivisionsAxis number of steps around the sphere.
   * @param {number} subdivisionsHeight number of vertically on the sphere.
   * @param {number} [opt_startLatitudeInRadians] where to start the
   *     top of the sphere. Default = 0.
   * @param {number} [opt_endLatitudeInRadians] Where to end the
   *     bottom of the sphere. Default = Math.PI.
   * @param {number} [opt_startLongitudeInRadians] where to start
   *     wrapping the sphere. Default = 0.
   * @param {number} [opt_endLongitudeInRadians] where to end
   *     wrapping the sphere. Default = 2 * Math.PI.
   * @return {module:twgl.BufferInfo} The created sphere BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createSphereBufferInfo
   */

  /**
   * Creates sphere buffers.
   *
   * The created sphere has position, normal, and texcoord data
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of the sphere.
   * @param {number} subdivisionsAxis number of steps around the sphere.
   * @param {number} subdivisionsHeight number of vertically on the sphere.
   * @param {number} [opt_startLatitudeInRadians] where to start the
   *     top of the sphere. Default = 0.
   * @param {number} [opt_endLatitudeInRadians] Where to end the
   *     bottom of the sphere. Default = Math.PI.
   * @param {number} [opt_startLongitudeInRadians] where to start
   *     wrapping the sphere. Default = 0.
   * @param {number} [opt_endLongitudeInRadians] where to end
   *     wrapping the sphere. Default = 2 * Math.PI.
   * @return {Object.<string, WebGLBuffer>} The created sphere buffers.
   * @memberOf module:twgl/primitives
   * @function createSphereBuffers
   */

  /**
   * Creates sphere vertices.
   *
   * The created sphere has position, normal, and texcoord data
   *
   * @param {number} radius radius of the sphere.
   * @param {number} subdivisionsAxis number of steps around the sphere.
   * @param {number} subdivisionsHeight number of vertically on the sphere.
   * @param {number} [opt_startLatitudeInRadians] where to start the
   *     top of the sphere. Default = 0.
   * @param {number} [opt_endLatitudeInRadians] Where to end the
   *     bottom of the sphere. Default = Math.PI.
   * @param {number} [opt_startLongitudeInRadians] where to start
   *     wrapping the sphere. Default = 0.
   * @param {number} [opt_endLongitudeInRadians] where to end
   *     wrapping the sphere. Default = 2 * Math.PI.
   * @return {Object.<string, TypedArray>} The created sphere vertices.
   * @memberOf module:twgl/primitives
   */
  function createSphereVertices(
      radius,
      subdivisionsAxis,
      subdivisionsHeight,
      opt_startLatitudeInRadians,
      opt_endLatitudeInRadians,
      opt_startLongitudeInRadians,
      opt_endLongitudeInRadians) {
    if (subdivisionsAxis <= 0 || subdivisionsHeight <= 0) {
      throw Error('subdivisionAxis and subdivisionHeight must be > 0');
    }

    opt_startLatitudeInRadians = opt_startLatitudeInRadians || 0;
    opt_endLatitudeInRadians = opt_endLatitudeInRadians || Math.PI;
    opt_startLongitudeInRadians = opt_startLongitudeInRadians || 0;
    opt_endLongitudeInRadians = opt_endLongitudeInRadians || (Math.PI * 2);

    var latRange = opt_endLatitudeInRadians - opt_startLatitudeInRadians;
    var longRange = opt_endLongitudeInRadians - opt_startLongitudeInRadians;

    // We are going to generate our sphere by iterating through its
    // spherical coordinates and generating 2 triangles for each quad on a
    // ring of the sphere.
    var numVertices = (subdivisionsAxis + 1) * (subdivisionsHeight + 1);
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2 , numVertices);

    // Generate the individual vertices in our vertex buffer.
    for (var y = 0; y <= subdivisionsHeight; y++) {
      for (var x = 0; x <= subdivisionsAxis; x++) {
        // Generate a vertex based on its spherical coordinates
        var u = x / subdivisionsAxis;
        var v = y / subdivisionsHeight;
        var theta = longRange * u;
        var phi = latRange * v;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);
        var ux = cosTheta * sinPhi;
        var uy = cosPhi;
        var uz = sinTheta * sinPhi;
        positions.push(radius * ux, radius * uy, radius * uz);
        normals.push(ux, uy, uz);
        texcoords.push(1 - u, v);
      }
    }

    var numVertsAround = subdivisionsAxis + 1;
    var indices = createAugmentedTypedArray(3, subdivisionsAxis * subdivisionsHeight * 2, Uint16Array);
    for (var x = 0; x < subdivisionsAxis; x++) {  // eslint-disable-line
      for (var y = 0; y < subdivisionsHeight; y++) {  // eslint-disable-line
        // Make triangle 1 of quad.
        indices.push(
            (y + 0) * numVertsAround + x,
            (y + 0) * numVertsAround + x + 1,
            (y + 1) * numVertsAround + x);

        // Make triangle 2 of quad.
        indices.push(
            (y + 1) * numVertsAround + x,
            (y + 0) * numVertsAround + x + 1,
            (y + 1) * numVertsAround + x + 1);
      }
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * Array of the indices of corners of each face of a cube.
   * @type {Array.<number[]>}
   */
  var CUBE_FACE_INDICES = [
    [3, 7, 5, 1],  // right
    [6, 2, 0, 4],  // left
    [6, 7, 3, 2],  // ??
    [0, 1, 5, 4],  // ??
    [7, 6, 4, 5],  // front
    [2, 3, 1, 0],  // back
  ];

  /**
   * Creates a BufferInfo for a cube.
   *
   * The cube is created around the origin. (-size / 2, size / 2).
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] width, height and depth of the cube.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createCubeBufferInfo
   */

  /**
   * Creates the buffers and indices for a cube.
   *
   * The cube is created around the origin. (-size / 2, size / 2).
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} [size] width, height and depth of the cube.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createCubeBuffers
   */

  /**
   * Creates the vertices and indices for a cube.
   *
   * The cube is created around the origin. (-size / 2, size / 2).
   *
   * @param {number} [size] width, height and depth of the cube.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function createCubeVertices(size) {
    size = size || 1;
    var k = size / 2;

    var cornerVertices = [
      [-k, -k, -k],
      [+k, -k, -k],
      [-k, +k, -k],
      [+k, +k, -k],
      [-k, -k, +k],
      [+k, -k, +k],
      [-k, +k, +k],
      [+k, +k, +k],
    ];

    var faceNormals = [
      [+1, +0, +0],
      [-1, +0, +0],
      [+0, +1, +0],
      [+0, -1, +0],
      [+0, +0, +1],
      [+0, +0, -1],
    ];

    var uvCoords = [
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ];

    var numVertices = 6 * 4;
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2 , numVertices);
    var indices   = createAugmentedTypedArray(3, 6 * 2, Uint16Array);

    for (var f = 0; f < 6; ++f) {
      var faceIndices = CUBE_FACE_INDICES[f];
      for (var v = 0; v < 4; ++v) {
        var position = cornerVertices[faceIndices[v]];
        var normal = faceNormals[f];
        var uv = uvCoords[v];

        // Each face needs all four vertices because the normals and texture
        // coordinates are not all the same.
        positions.push(position);
        normals.push(normal);
        texcoords.push(uv);

      }
      // Two triangles make a square face.
      var offset = 4 * f;
      indices.push(offset + 0, offset + 1, offset + 2);
      indices.push(offset + 0, offset + 2, offset + 3);
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * Creates a BufferInfo for a truncated cone, which is like a cylinder
   * except that it has different top and bottom radii. A truncated cone
   * can also be used to create cylinders and regular cones. The
   * truncated cone will be created centered about the origin, with the
   * y axis as its vertical axis.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} bottomRadius Bottom radius of truncated cone.
   * @param {number} topRadius Top radius of truncated cone.
   * @param {number} height Height of truncated cone.
   * @param {number} radialSubdivisions The number of subdivisions around the
   *     truncated cone.
   * @param {number} verticalSubdivisions The number of subdivisions down the
   *     truncated cone.
   * @param {boolean} [opt_topCap] Create top cap. Default = true.
   * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
   * @return {module:twgl.BufferInfo} The created cone BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createTruncatedConeBufferInfo
   */

  /**
   * Creates buffers for a truncated cone, which is like a cylinder
   * except that it has different top and bottom radii. A truncated cone
   * can also be used to create cylinders and regular cones. The
   * truncated cone will be created centered about the origin, with the
   * y axis as its vertical axis.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} bottomRadius Bottom radius of truncated cone.
   * @param {number} topRadius Top radius of truncated cone.
   * @param {number} height Height of truncated cone.
   * @param {number} radialSubdivisions The number of subdivisions around the
   *     truncated cone.
   * @param {number} verticalSubdivisions The number of subdivisions down the
   *     truncated cone.
   * @param {boolean} [opt_topCap] Create top cap. Default = true.
   * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
   * @return {Object.<string, WebGLBuffer>} The created cone buffers.
   * @memberOf module:twgl/primitives
   * @function createTruncatedConeBuffers
   */

  /**
   * Creates vertices for a truncated cone, which is like a cylinder
   * except that it has different top and bottom radii. A truncated cone
   * can also be used to create cylinders and regular cones. The
   * truncated cone will be created centered about the origin, with the
   * y axis as its vertical axis. .
   *
   * @param {number} bottomRadius Bottom radius of truncated cone.
   * @param {number} topRadius Top radius of truncated cone.
   * @param {number} height Height of truncated cone.
   * @param {number} radialSubdivisions The number of subdivisions around the
   *     truncated cone.
   * @param {number} verticalSubdivisions The number of subdivisions down the
   *     truncated cone.
   * @param {boolean} [opt_topCap] Create top cap. Default = true.
   * @param {boolean} [opt_bottomCap] Create bottom cap. Default = true.
   * @return {Object.<string, TypedArray>} The created cone vertices.
   * @memberOf module:twgl/primitives
   */
  function createTruncatedConeVertices(
      bottomRadius,
      topRadius,
      height,
      radialSubdivisions,
      verticalSubdivisions,
      opt_topCap,
      opt_bottomCap) {
    if (radialSubdivisions < 3) {
      throw Error('radialSubdivisions must be 3 or greater');
    }

    if (verticalSubdivisions < 1) {
      throw Error('verticalSubdivisions must be 1 or greater');
    }

    var topCap = (opt_topCap === undefined) ? true : opt_topCap;
    var bottomCap = (opt_bottomCap === undefined) ? true : opt_bottomCap;

    var extra = (topCap ? 2 : 0) + (bottomCap ? 2 : 0);

    var numVertices = (radialSubdivisions + 1) * (verticalSubdivisions + 1 + extra);
    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2, numVertices);
    var indices   = createAugmentedTypedArray(3, radialSubdivisions * (verticalSubdivisions + extra) * 2, Uint16Array);

    var vertsAroundEdge = radialSubdivisions + 1;

    // The slant of the cone is constant across its surface
    var slant = Math.atan2(bottomRadius - topRadius, height);
    var cosSlant = Math.cos(slant);
    var sinSlant = Math.sin(slant);

    var start = topCap ? -2 : 0;
    var end = verticalSubdivisions + (bottomCap ? 2 : 0);

    for (var yy = start; yy <= end; ++yy) {
      var v = yy / verticalSubdivisions;
      var y = height * v;
      var ringRadius;
      if (yy < 0) {
        y = 0;
        v = 1;
        ringRadius = bottomRadius;
      } else if (yy > verticalSubdivisions) {
        y = height;
        v = 1;
        ringRadius = topRadius;
      } else {
        ringRadius = bottomRadius +
          (topRadius - bottomRadius) * (yy / verticalSubdivisions);
      }
      if (yy === -2 || yy === verticalSubdivisions + 2) {
        ringRadius = 0;
        v = 0;
      }
      y -= height / 2;
      for (var ii = 0; ii < vertsAroundEdge; ++ii) {
        var sin = Math.sin(ii * Math.PI * 2 / radialSubdivisions);
        var cos = Math.cos(ii * Math.PI * 2 / radialSubdivisions);
        positions.push(sin * ringRadius, y, cos * ringRadius);
        normals.push(
            (yy < 0 || yy > verticalSubdivisions) ? 0 : (sin * cosSlant),
            (yy < 0) ? -1 : (yy > verticalSubdivisions ? 1 : sinSlant),
            (yy < 0 || yy > verticalSubdivisions) ? 0 : (cos * cosSlant));
        texcoords.push((ii / radialSubdivisions), 1 - v);
      }
    }

    for (var yy = 0; yy < verticalSubdivisions + extra; ++yy) {  // eslint-disable-line
      for (var ii = 0; ii < radialSubdivisions; ++ii) {  // eslint-disable-line
        indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
                     vertsAroundEdge * (yy + 0) + 1 + ii,
                     vertsAroundEdge * (yy + 1) + 1 + ii);
        indices.push(vertsAroundEdge * (yy + 0) + 0 + ii,
                     vertsAroundEdge * (yy + 1) + 1 + ii,
                     vertsAroundEdge * (yy + 1) + 0 + ii);
      }
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * Expands RLE data
   * @param {number[]} rleData data in format of run-length, x, y, z, run-length, x, y, z
   * @param {number[]} [padding] value to add each entry with.
   * @return {number[]} the expanded rleData
   */
  function expandRLEData(rleData, padding) {
    padding = padding || [];
    var data = [];
    for (var ii = 0; ii < rleData.length; ii += 4) {
      var runLength = rleData[ii];
      var element = rleData.slice(ii + 1, ii + 4);
      element.push.apply(element, padding);
      for (var jj = 0; jj < runLength; ++jj) {
        data.push.apply(data, element);
      }
    }
    return data;
  }

  /**
   * Creates 3D 'F' BufferInfo.
   * An 'F' is useful because you can easily tell which way it is oriented.
   * The created 'F' has position, normal, texcoord, and color buffers.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function create3DFBufferInfo
   */

  /**
   * Creates 3D 'F' buffers.
   * An 'F' is useful because you can easily tell which way it is oriented.
   * The created 'F' has position, normal, texcoord, and color buffers.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function create3DFBuffers
   */

  /**
   * Creates 3D 'F' vertices.
   * An 'F' is useful because you can easily tell which way it is oriented.
   * The created 'F' has position, normal, texcoord, and color arrays.
   *
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function create3DFVertices() {

    var positions = [
      // left column front
      0,   0,  0,
      0, 150,  0,
      30,   0,  0,
      0, 150,  0,
      30, 150,  0,
      30,   0,  0,

      // top rung front
      30,   0,  0,
      30,  30,  0,
      100,   0,  0,
      30,  30,  0,
      100,  30,  0,
      100,   0,  0,

      // middle rung front
      30,  60,  0,
      30,  90,  0,
      67,  60,  0,
      30,  90,  0,
      67,  90,  0,
      67,  60,  0,

      // left column back
        0,   0,  30,
       30,   0,  30,
        0, 150,  30,
        0, 150,  30,
       30,   0,  30,
       30, 150,  30,

      // top rung back
       30,   0,  30,
      100,   0,  30,
       30,  30,  30,
       30,  30,  30,
      100,   0,  30,
      100,  30,  30,

      // middle rung back
       30,  60,  30,
       67,  60,  30,
       30,  90,  30,
       30,  90,  30,
       67,  60,  30,
       67,  90,  30,

      // top
        0,   0,   0,
      100,   0,   0,
      100,   0,  30,
        0,   0,   0,
      100,   0,  30,
        0,   0,  30,

      // top rung front
      100,   0,   0,
      100,  30,   0,
      100,  30,  30,
      100,   0,   0,
      100,  30,  30,
      100,   0,  30,

      // under top rung
      30,   30,   0,
      30,   30,  30,
      100,  30,  30,
      30,   30,   0,
      100,  30,  30,
      100,  30,   0,

      // between top rung and middle
      30,   30,   0,
      30,   60,  30,
      30,   30,  30,
      30,   30,   0,
      30,   60,   0,
      30,   60,  30,

      // top of middle rung
      30,   60,   0,
      67,   60,  30,
      30,   60,  30,
      30,   60,   0,
      67,   60,   0,
      67,   60,  30,

      // front of middle rung
      67,   60,   0,
      67,   90,  30,
      67,   60,  30,
      67,   60,   0,
      67,   90,   0,
      67,   90,  30,

      // bottom of middle rung.
      30,   90,   0,
      30,   90,  30,
      67,   90,  30,
      30,   90,   0,
      67,   90,  30,
      67,   90,   0,

      // front of bottom
      30,   90,   0,
      30,  150,  30,
      30,   90,  30,
      30,   90,   0,
      30,  150,   0,
      30,  150,  30,

      // bottom
      0,   150,   0,
      0,   150,  30,
      30,  150,  30,
      0,   150,   0,
      30,  150,  30,
      30,  150,   0,

      // left side
      0,   0,   0,
      0,   0,  30,
      0, 150,  30,
      0,   0,   0,
      0, 150,  30,
      0, 150,   0,
    ];

    var texcoords = [
      // left column front
      0.22, 0.19,
      0.22, 0.79,
      0.34, 0.19,
      0.22, 0.79,
      0.34, 0.79,
      0.34, 0.19,

      // top rung front
      0.34, 0.19,
      0.34, 0.31,
      0.62, 0.19,
      0.34, 0.31,
      0.62, 0.31,
      0.62, 0.19,

      // middle rung front
      0.34, 0.43,
      0.34, 0.55,
      0.49, 0.43,
      0.34, 0.55,
      0.49, 0.55,
      0.49, 0.43,

      // left column back
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,

      // top rung back
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,

      // middle rung back
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,

      // top
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,

      // top rung front
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,

      // under top rung
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,

      // between top rung and middle
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // top of middle rung
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // front of middle rung
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // bottom of middle rung.
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,

      // front of bottom
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,

      // bottom
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,

      // left side
      0, 0,
      0, 1,
      1, 1,
      0, 0,
      1, 1,
      1, 0,
    ];

    var normals = expandRLEData([
      // left column front
      // top rung front
      // middle rung front
      18, 0, 0, 1,

      // left column back
      // top rung back
      // middle rung back
      18, 0, 0, -1,

      // top
      6, 0, 1, 0,

      // top rung front
      6, 1, 0, 0,

      // under top rung
      6, 0, -1, 0,

      // between top rung and middle
      6, 1, 0, 0,

      // top of middle rung
      6, 0, 1, 0,

      // front of middle rung
      6, 1, 0, 0,

      // bottom of middle rung.
      6, 0, -1, 0,

      // front of bottom
      6, 1, 0, 0,

      // bottom
      6, 0, -1, 0,

      // left side
      6, -1, 0, 0,
    ]);

    var colors = expandRLEData([
          // left column front
          // top rung front
          // middle rung front
        18, 200,  70, 120,

          // left column back
          // top rung back
          // middle rung back
        18, 80, 70, 200,

          // top
        6, 70, 200, 210,

          // top rung front
        6, 200, 200, 70,

          // under top rung
        6, 210, 100, 70,

          // between top rung and middle
        6, 210, 160, 70,

          // top of middle rung
        6, 70, 180, 210,

          // front of middle rung
        6, 100, 70, 210,

          // bottom of middle rung.
        6, 76, 210, 100,

          // front of bottom
        6, 140, 210, 80,

          // bottom
        6, 90, 130, 110,

          // left side
        6, 160, 160, 220,
    ], [255]);

    var numVerts = positions.length / 3;

    var arrays = {
      position: createAugmentedTypedArray(3, numVerts),
      texcoord: createAugmentedTypedArray(2,  numVerts),
      normal: createAugmentedTypedArray(3, numVerts),
      color: createAugmentedTypedArray(4, numVerts, Uint8Array),
      indices: createAugmentedTypedArray(3, numVerts / 3, Uint16Array),
    };

    arrays.position.push(positions);
    arrays.texcoord.push(texcoords);
    arrays.normal.push(normals);
    arrays.color.push(colors);

    for (var ii = 0; ii < numVerts; ++ii) {
      arrays.indices.push(ii);
    }

    return arrays;
  }

  /**
   * Creates cresent BufferInfo.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} verticalRadius The vertical radius of the cresent.
   * @param {number} outerRadius The outer radius of the cresent.
   * @param {number} innerRadius The inner radius of the cresent.
   * @param {number} thickness The thickness of the cresent.
   * @param {number} subdivisionsDown number of steps around the cresent.
   * @param {number} subdivisionsThick number of vertically on the cresent.
   * @param {number} [startOffset] Where to start arc. Default 0.
   * @param {number} [endOffset] Where to end arg. Default 1.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createCresentBufferInfo
   */

  /**
   * Creates cresent buffers.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} verticalRadius The vertical radius of the cresent.
   * @param {number} outerRadius The outer radius of the cresent.
   * @param {number} innerRadius The inner radius of the cresent.
   * @param {number} thickness The thickness of the cresent.
   * @param {number} subdivisionsDown number of steps around the cresent.
   * @param {number} subdivisionsThick number of vertically on the cresent.
   * @param {number} [startOffset] Where to start arc. Default 0.
   * @param {number} [endOffset] Where to end arg. Default 1.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createCresentBuffers
   */

  /**
   * Creates cresent vertices.
   *
   * @param {number} verticalRadius The vertical radius of the cresent.
   * @param {number} outerRadius The outer radius of the cresent.
   * @param {number} innerRadius The inner radius of the cresent.
   * @param {number} thickness The thickness of the cresent.
   * @param {number} subdivisionsDown number of steps around the cresent.
   * @param {number} subdivisionsThick number of vertically on the cresent.
   * @param {number} [startOffset] Where to start arc. Default 0.
   * @param {number} [endOffset] Where to end arg. Default 1.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
   function createCresentVertices(
      verticalRadius,
      outerRadius,
      innerRadius,
      thickness,
      subdivisionsDown,
      startOffset,
      endOffset) {
    if (subdivisionsDown <= 0) {
      throw Error('subdivisionDown must be > 0');
    }

    startOffset = startOffset || 0;
    endOffset   = endOffset || 1;

    var subdivisionsThick = 2;

    var offsetRange = endOffset - startOffset;
    var numVertices = (subdivisionsDown + 1) * 2 * (2 + subdivisionsThick);
    var positions   = createAugmentedTypedArray(3, numVertices);
    var normals     = createAugmentedTypedArray(3, numVertices);
    var texcoords   = createAugmentedTypedArray(2, numVertices);

    function lerp(a, b, s) {
      return a + (b - a) * s;
    }

    function createArc(arcRadius, x, normalMult, normalAdd, uMult, uAdd) {
      for (var z = 0; z <= subdivisionsDown; z++) {
        var uBack = x / (subdivisionsThick - 1);
        var v = z / subdivisionsDown;
        var xBack = (uBack - 0.5) * 2;
        var angle = (startOffset + (v * offsetRange)) * Math.PI;
        var s = Math.sin(angle);
        var c = Math.cos(angle);
        var radius = lerp(verticalRadius, arcRadius, s);
        var px = xBack * thickness;
        var py = c * verticalRadius;
        var pz = s * radius;
        positions.push(px, py, pz);
        var n = v3.add(v3.multiply([0, s, c], normalMult), normalAdd);
        normals.push(n);
        texcoords.push(uBack * uMult + uAdd, v);
      }
    }

    // Generate the individual vertices in our vertex buffer.
    for (var x = 0; x < subdivisionsThick; x++) {
      var uBack = (x / (subdivisionsThick - 1) - 0.5) * 2;
      createArc(outerRadius, x, [1, 1, 1], [0,     0, 0], 1, 0);
      createArc(outerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 0);
      createArc(innerRadius, x, [1, 1, 1], [0,     0, 0], 1, 0);
      createArc(innerRadius, x, [0, 0, 0], [uBack, 0, 0], 0, 1);
    }

    // Do outer surface.
    var indices = createAugmentedTypedArray(3, (subdivisionsDown * 2) * (2 + subdivisionsThick), Uint16Array);

    function createSurface(leftArcOffset, rightArcOffset) {
      for (var z = 0; z < subdivisionsDown; ++z) {
        // Make triangle 1 of quad.
        indices.push(
            leftArcOffset + z + 0,
            leftArcOffset + z + 1,
            rightArcOffset + z + 0);

        // Make triangle 2 of quad.
        indices.push(
            leftArcOffset + z + 1,
            rightArcOffset + z + 1,
            rightArcOffset + z + 0);
      }
    }

    var numVerticesDown = subdivisionsDown + 1;
    // front
    createSurface(numVerticesDown * 0, numVerticesDown * 4);
    // right
    createSurface(numVerticesDown * 5, numVerticesDown * 7);
    // back
    createSurface(numVerticesDown * 6, numVerticesDown * 2);
    // left
    createSurface(numVerticesDown * 3, numVerticesDown * 1);

    return {
      position: positions,
      normal:   normals,
      texcoord: texcoords,
      indices:  indices,
    };
  }

  /**
   * Creates cylinder BufferInfo. The cylinder will be created around the origin
   * along the y-axis.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius Radius of cylinder.
   * @param {number} height Height of cylinder.
   * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
   * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
   * @param {boolean} [topCap] Create top cap. Default = true.
   * @param {boolean} [bottomCap] Create bottom cap. Default = true.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createCylinderBufferInfo
   */

   /**
    * Creates cylinder buffers. The cylinder will be created around the origin
    * along the y-axis.
    *
    * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
    * @param {number} radius Radius of cylinder.
    * @param {number} height Height of cylinder.
    * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
    * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
    * @param {boolean} [topCap] Create top cap. Default = true.
    * @param {boolean} [bottomCap] Create bottom cap. Default = true.
    * @return {Object.<string, WebGLBuffer>} The created buffers.
    * @memberOf module:twgl/primitives
    * @function createCylinderBuffers
    */

   /**
    * Creates cylinder vertices. The cylinder will be created around the origin
    * along the y-axis.
    *
    * @param {number} radius Radius of cylinder.
    * @param {number} height Height of cylinder.
    * @param {number} radialSubdivisions The number of subdivisions around the cylinder.
    * @param {number} verticalSubdivisions The number of subdivisions down the cylinder.
    * @param {boolean} [topCap] Create top cap. Default = true.
    * @param {boolean} [bottomCap] Create bottom cap. Default = true.
    * @return {Object.<string, TypedArray>} The created vertices.
    * @memberOf module:twgl/primitives
    */
  function createCylinderVertices(
      radius,
      height,
      radialSubdivisions,
      verticalSubdivisions,
      topCap,
      bottomCap) {
    return createTruncatedConeVertices(
        radius,
        radius,
        height,
        radialSubdivisions,
        verticalSubdivisions,
        topCap,
        bottomCap);
  }

  /**
   * Creates BufferInfo for a torus
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of center of torus circle.
   * @param {number} thickness radius of torus ring.
   * @param {number} radialSubdivisions The number of subdivisions around the torus.
   * @param {number} bodySubdivisions The number of subdivisions around the body torus.
   * @param {boolean} [startAngle] start angle in radians. Default = 0.
   * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createTorusBufferInfo
   */

  /**
   * Creates buffers for a torus
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius radius of center of torus circle.
   * @param {number} thickness radius of torus ring.
   * @param {number} radialSubdivisions The number of subdivisions around the torus.
   * @param {number} bodySubdivisions The number of subdivisions around the body torus.
   * @param {boolean} [startAngle] start angle in radians. Default = 0.
   * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createTorusBuffers
   */

  /**
   * Creates vertices for a torus
   *
   * @param {number} radius radius of center of torus circle.
   * @param {number} thickness radius of torus ring.
   * @param {number} radialSubdivisions The number of subdivisions around the torus.
   * @param {number} bodySubdivisions The number of subdivisions around the body torus.
   * @param {boolean} [startAngle] start angle in radians. Default = 0.
   * @param {boolean} [endAngle] end angle in radians. Default = Math.PI * 2.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function createTorusVertices(
      radius,
      thickness,
      radialSubdivisions,
      bodySubdivisions,
      startAngle,
      endAngle) {
    if (radialSubdivisions < 3) {
      throw Error('radialSubdivisions must be 3 or greater');
    }

    if (bodySubdivisions < 3) {
      throw Error('verticalSubdivisions must be 3 or greater');
    }

    startAngle = startAngle || 0;
    endAngle = endAngle || Math.PI * 2;
    range = endAngle - startAngle;

    var radialParts = radialSubdivisions + 1;
    var bodyParts   = bodySubdivisions + 1;
    var numVertices = radialParts * bodyParts;
    var positions   = createAugmentedTypedArray(3, numVertices);
    var normals     = createAugmentedTypedArray(3, numVertices);
    var texcoords   = createAugmentedTypedArray(2, numVertices);
    var indices     = createAugmentedTypedArray(3, (radialSubdivisions) * (bodySubdivisions) * 2, Uint16Array);

    for (var slice = 0; slice < bodyParts; ++slice) {
      var v = slice / bodySubdivisions;
      var sliceAngle = v * Math.PI * 2;
      var sliceSin = Math.sin(sliceAngle);
      var ringRadius = radius + sliceSin * thickness;
      var ny = Math.cos(sliceAngle);
      var y = ny * thickness;
      for (var ring = 0; ring < radialParts; ++ring) {
        var u = ring / radialSubdivisions;
        var ringAngle = startAngle + u * range;
        var xSin = Math.sin(ringAngle);
        var zCos = Math.cos(ringAngle);
        var x = xSin * ringRadius;
        var z = zCos * ringRadius;
        var nx = xSin * sliceSin;
        var nz = zCos * sliceSin;
        positions.push(x, y, z);
        normals.push(nx, ny, nz);
        texcoords.push(u, 1 - v);
      }
    }

    for (var slice = 0; slice < bodySubdivisions; ++slice) {  // eslint-disable-line
      for (var ring = 0; ring < radialSubdivisions; ++ring) {  // eslint-disable-line
        var nextRingIndex  = 1 + ring;
        var nextSliceIndex = 1 + slice;
        indices.push(radialParts * slice          + ring,
                     radialParts * nextSliceIndex + ring,
                     radialParts * slice          + nextRingIndex);
        indices.push(radialParts * nextSliceIndex + ring,
                     radialParts * nextSliceIndex + nextRingIndex,
                     radialParts * slice          + nextRingIndex);
      }
    }

    return {
      position: positions,
      normal:   normals,
      texcoord: texcoords,
      indices:  indices,
    };
  }


  /**
   * Creates a disc BufferInfo. The disc will be in the xz plane, centered at
   * the origin. When creating, at least 3 divisions, or pie
   * pieces, need to be specified, otherwise the triangles making
   * up the disc will be degenerate. You can also specify the
   * number of radial pieces `stacks`. A value of 1 for
   * stacks will give you a simple disc of pie pieces.  If you
   * want to create an annulus you can set `innerRadius` to a
   * value > 0. Finally, `stackPower` allows you to have the widths
   * increase or decrease as you move away from the center. This
   * is particularly useful when using the disc as a ground plane
   * with a fixed camera such that you don't need the resolution
   * of small triangles near the perimeter. For example, a value
   * of 2 will produce stacks whose ouside radius increases with
   * the square of the stack index. A value of 1 will give uniform
   * stacks.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius Radius of the ground plane.
   * @param {number} divisions Number of triangles in the ground plane (at least 3).
   * @param {number} [stacks] Number of radial divisions (default=1).
   * @param {number} [innerRadius] Default 0.
   * @param {number} [stackPower] Power to raise stack size to for decreasing width.
   * @return {module:twgl.BufferInfo} The created BufferInfo.
   * @memberOf module:twgl/primitives
   * @function createDiscBufferInfo
   */

  /**
   * Creates disc buffers. The disc will be in the xz plane, centered at
   * the origin. When creating, at least 3 divisions, or pie
   * pieces, need to be specified, otherwise the triangles making
   * up the disc will be degenerate. You can also specify the
   * number of radial pieces `stacks`. A value of 1 for
   * stacks will give you a simple disc of pie pieces.  If you
   * want to create an annulus you can set `innerRadius` to a
   * value > 0. Finally, `stackPower` allows you to have the widths
   * increase or decrease as you move away from the center. This
   * is particularly useful when using the disc as a ground plane
   * with a fixed camera such that you don't need the resolution
   * of small triangles near the perimeter. For example, a value
   * of 2 will produce stacks whose ouside radius increases with
   * the square of the stack index. A value of 1 will give uniform
   * stacks.
   *
   * @param {WebGLRenderingContext} gl The WebGLRenderingContext.
   * @param {number} radius Radius of the ground plane.
   * @param {number} divisions Number of triangles in the ground plane (at least 3).
   * @param {number} [stacks] Number of radial divisions (default=1).
   * @param {number} [innerRadius] Default 0.
   * @param {number} [stackPower] Power to raise stack size to for decreasing width.
   * @return {Object.<string, WebGLBuffer>} The created buffers.
   * @memberOf module:twgl/primitives
   * @function createDiscBuffers
   */

  /**
   * Creates disc vertices. The disc will be in the xz plane, centered at
   * the origin. When creating, at least 3 divisions, or pie
   * pieces, need to be specified, otherwise the triangles making
   * up the disc will be degenerate. You can also specify the
   * number of radial pieces `stacks`. A value of 1 for
   * stacks will give you a simple disc of pie pieces.  If you
   * want to create an annulus you can set `innerRadius` to a
   * value > 0. Finally, `stackPower` allows you to have the widths
   * increase or decrease as you move away from the center. This
   * is particularly useful when using the disc as a ground plane
   * with a fixed camera such that you don't need the resolution
   * of small triangles near the perimeter. For example, a value
   * of 2 will produce stacks whose ouside radius increases with
   * the square of the stack index. A value of 1 will give uniform
   * stacks.
   *
   * @param {number} radius Radius of the ground plane.
   * @param {number} divisions Number of triangles in the ground plane (at least 3).
   * @param {number} [stacks] Number of radial divisions (default=1).
   * @param {number} [innerRadius] Default 0.
   * @param {number} [stackPower] Power to raise stack size to for decreasing width.
   * @return {Object.<string, TypedArray>} The created vertices.
   * @memberOf module:twgl/primitives
   */
  function createDiscVertices(
      radius,
      divisions,
      stacks,
      innerRadius,
      stackPower) {
    if (divisions < 3) {
      throw Error('divisions must be at least 3');
    }

    stacks = stacks ? stacks : 1;
    stackPower = stackPower ? stackPower : 1;
    innerRadius = innerRadius ? innerRadius : 0;

    // Note: We don't share the center vertex because that would
    // mess up texture coordinates.
    var numVertices = (divisions + 1) * (stacks + 1);

    var positions = createAugmentedTypedArray(3, numVertices);
    var normals   = createAugmentedTypedArray(3, numVertices);
    var texcoords = createAugmentedTypedArray(2, numVertices);
    var indices   = createAugmentedTypedArray(3, stacks * divisions * 2, Uint16Array);

    var firstIndex = 0;
    var radiusSpan = radius - innerRadius;

    // Build the disk one stack at a time.
    for (var stack = 0; stack <= stacks; ++stack) {
      var stackRadius = innerRadius + radiusSpan * Math.pow(stack / stacks, stackPower);

      for (var i = 0; i <= divisions; ++i) {
        var theta = 2.0 * Math.PI * i / divisions;
        var x = stackRadius * Math.cos(theta);
        var z = stackRadius * Math.sin(theta);

        positions.push(x, 0, z);
        normals.push(0, 1, 0);
        texcoords.push(1 - (i / divisions), stack / stacks);
        if (stack > 0 && i !== divisions) {
          // a, b, c and d are the indices of the vertices of a quad.  unless
          // the current stack is the one closest to the center, in which case
          // the vertices a and b connect to the center vertex.
          var a = firstIndex + (i + 1);
          var b = firstIndex + i;
          var c = firstIndex + i - divisions;
          var d = firstIndex + (i + 1) - divisions;

          // Make a quad of the vertices a, b, c, d.
          indices.push(a, b, c);
          indices.push(a, c, d);
        }
      }

      firstIndex += divisions + 1;
    }

    return {
      position: positions,
      normal: normals,
      texcoord: texcoords,
      indices: indices,
    };
  }

  /**
   * creates a random integer between 0 and range - 1 inclusive.
   * @param {number} range
   * @return {number} random value between 0 and range - 1 inclusive.
   */
  function randInt(range) {
    return Math.random() * range | 0;
  }

  /**
   * Used to supply random colors
   * @callback RandomColorFunc
   * @param {number} ndx index of triangle/quad if unindexed or index of vertex if indexed
   * @param {number} channel 0 = red, 1 = green, 2 = blue, 3 = alpha
   * @return {number} a number from 0 to 255
   * @memberOf module:twgl/primitives
   */

  /**
   * @typedef {Object} RandomVerticesOptions
   * @property {number} [vertsPerColor] Defaults to 3 for non-indexed vertices
   * @property {module:twgl/primitives.RandomColorFunc} [rand] A function to generate random numbers
   * @memberOf module:twgl/primitives
   */

  /**
   * Creates an augmentedTypedArray of random vertex colors.
   * If the vertices are indexed (have an indices array) then will
   * just make random colors. Otherwise assumes they are triangless
   * and makes one random color for every 3 vertices.
   * @param {Object.<string, augmentedTypedArray>} vertices Vertices as returned from one of the createXXXVertices functions.
   * @param {module:twgl/primitives.RandomVerticesOptions} [options] options.
   * @return {Object.<string, augmentedTypedArray>} same vertices as passed in with `color` added.
   * @memberOf module:twgl/primitives
   */
  function makeRandomVertexColors(vertices, options) {
    options = options || {};
    var numElements = vertices.position.numElements;
    var vcolors = createAugmentedTypedArray(4, numElements, Uint8Array);
    var rand = options.rand || function(ndx, channel) {
      return channel < 3 ? randInt(256) : 255;
    };
    vertices.color = vcolors;
    if (vertices.indices) {
      // just make random colors if index
      for (var ii = 0; ii < numElements; ++ii) {
        vcolors.push(rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3));
      }
    } else {
      // make random colors per triangle
      var numVertsPerColor = options.vertsPerColor || 3;
      var numSets = numElements / numVertsPerColor;
      for (var ii = 0; ii < numSets; ++ii) {  // eslint-disable-line
        var color = [rand(ii, 0), rand(ii, 1), rand(ii, 2), rand(ii, 3)];
        for (var jj = 0; jj < numVertsPerColor; ++jj) {
          vcolors.push(color);
        }
      }
    }
    return vertices;
  }

  /**
   * creates a function that calls fn to create vertices and then
   * creates a buffers for them
   */
  function createBufferFunc(fn) {
    return function(gl) {
      var arrays = fn.apply(this, Array.prototype.slice.call(arguments, 1));
      return twgl.createBuffersFromArrays(gl, arrays);
    };
  }

  /**
   * creates a function that calls fn to create vertices and then
   * creates a bufferInfo object for them
   */
  function createBufferInfoFunc(fn) {
    return function(gl) {
      var arrays = fn.apply(null,  Array.prototype.slice.call(arguments, 1));
      return twgl.createBufferInfoFromArrays(gl, arrays);
    };
  }

  // Using quotes prevents Uglify from changing the names.
  // No speed diff AFAICT.
  return {
    "create3DFBufferInfo": createBufferInfoFunc(create3DFVertices),
    "create3DFBuffers": createBufferFunc(create3DFVertices),
    "create3DFVertices": create3DFVertices,
    "createAugmentedTypedArray": createAugmentedTypedArray,
    "createCubeBufferInfo": createBufferInfoFunc(createCubeVertices),
    "createCubeBuffers": createBufferFunc(createCubeVertices),
    "createCubeVertices": createCubeVertices,
    "createPlaneBufferInfo": createBufferInfoFunc(createPlaneVertices),
    "createPlaneBuffers": createBufferFunc(createPlaneVertices),
    "createPlaneVertices": createPlaneVertices,
    "createSphereBufferInfo": createBufferInfoFunc(createSphereVertices),
    "createSphereBuffers": createBufferFunc(createSphereVertices),
    "createSphereVertices": createSphereVertices,
    "createTruncatedConeBufferInfo": createBufferInfoFunc(createTruncatedConeVertices),
    "createTruncatedConeBuffers": createBufferFunc(createTruncatedConeVertices),
    "createTruncatedConeVertices": createTruncatedConeVertices,
    "createXYQuadBufferInfo": createBufferInfoFunc(createXYQuadVertices),
    "createXYQuadBuffers": createBufferFunc(createXYQuadVertices),
    "createXYQuadVertices": createXYQuadVertices,
    "createCresentBufferInfo": createBufferInfoFunc(createCresentVertices),
    "createCresentBuffers": createBufferFunc(createCresentVertices),
    "createCresentVertices": createCresentVertices,
    "createCylinderBufferInfo": createBufferInfoFunc(createCylinderVertices),
    "createCylinderBuffers": createBufferFunc(createCylinderVertices),
    "createCylinderVertices": createCylinderVertices,
    "createTorusBufferInfo": createBufferInfoFunc(createTorusVertices),
    "createTorusBuffers": createBufferFunc(createTorusVertices),
    "createTorusVertices": createTorusVertices,
    "createDiscBufferInfo": createBufferInfoFunc(createDiscVertices),
    "createDiscBuffers": createBufferFunc(createDiscVertices),
    "createDiscVertices": createDiscVertices,
    "deindexVertices": deindexVertices,
    "flattenNormals": flattenNormals,
    "makeRandomVertexColors": makeRandomVertexColors,
    "reorientDirections": reorientDirections,
    "reorientNormals": reorientNormals,
    "reorientPositions": reorientPositions,
    "reorientVertices": reorientVertices,
  };

});

define('main', [
    'twgl/twgl',
    'twgl/m4',
    'twgl/v3',
    'twgl/primitives',
  ], function(
    twgl,
    m4,
    v3,
    primitives
  ) {
    twgl.m4 = m4;
    twgl.v3 = v3;
    twgl.primitives = primitives;
    return twgl;
})

notrequirebecasebrowserifymessesup(['main'], function(main) {
  return main;
}, undefined, true);   // forceSync = true


;
define("build/js/twgl-includer-full", function(){});

    return notrequirebecasebrowserifymessesup('main');
}));

},{}],2:[function(require,module,exports){
'use strict';

var _twgl = require('twgl.js');

var _twgl2 = _interopRequireDefault(_twgl);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Implementation of the Spectral Flux onset detection method
 * described in "Simple Spectrum-Based Onset Detection" (http://www.music-ir.org/evaluation/MIREX/2006_abstracts/OD_dixon.pdf)
 */



var isOnset = false;
var alpha = document.getElementById('alpha').value;
var delta = document.getElementById('delta').value;
debugger;

function lowPassFilter(n, alpha, data) {
  var acc = 0.0;
  for (var i = 0; i <= n; i++) {
    acc = Math.max(data[n], alpha * acc + (1.0 - alpha) * data[n]);
  }
  return acc;
}

function detectOnset(n, data) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var w = options.w || 3;
  var m = options.m || 3;
  var delta = options.delta || 0.35;
  var alpha = options.alpha || 0.84;

  var length = data.length;
  var value = data[n];
  var k;

  var greaterThanSurroundingValues = true;
  for (k = n - w; k <= n + w; k++) {
    greaterThanSurroundingValues = greaterThanSurroundingValues && value >= data[Math.max(0, Math.min(k, length - 1))];
  }

  var sumOfLocalValues = 0.0;
  for (k = n - m * w; k <= n + w; k++) {
    if (k >= 0 && k < length) {
      sumOfLocalValues += data[k];
    }
  }
  var aboveLocalMeanThreshold = value >= sumOfLocalValues / (m * w + w + 1) + delta;

  var aboveLowPassFilter = value >= lowPassFilter(n - 1, alpha, data);

  return greaterThanSurroundingValues && aboveLocalMeanThreshold && aboveLowPassFilter;
}

function setupAudioNodes(context, _ref) {
  var stftData = _ref.stftData;
  var spectralFluxData = _ref.spectralFluxData;
  var normalizedSpectralFluxData = _ref.normalizedSpectralFluxData;

  var sourceNode = context.createBufferSource();
  var onsetDetectorNode = context.createScriptProcessor(512, 1, 1);

  onsetDetectorNode.onaudioprocess = function (audioProcessingEvent) {
    var playbackTime = audioProcessingEvent.playbackTime;
    // preprocessedDataBin = playbackTime * 44100 (sample rate) / 441 (STFT hop size)
    var spectralFluxDataBin = Math.floor(playbackTime * 100);
    var alpha = document.getElementById('alpha').value;
    var delta = document.getElementById('delta').value;
    isOnset = detectOnset(spectralFluxDataBin, normalizedSpectralFluxData);

    if (isOnset) {
      console.log('onset at: ' + playbackTime);
    }

    var inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
    var outputData = audioProcessingEvent.outputBuffer.getChannelData(0);

    // pass audio data through to destination
    for (var sample = 0; sample < audioProcessingEvent.inputBuffer.length; sample++) {
      outputData[sample] = inputData[sample];
    }
  };

  sourceNode.onended = function () {
    sourceNode.disconnect(onsetDetectorNode);
    onsetDetectorNode.disconnect(context.destination);
  };

  sourceNode.connect(onsetDetectorNode);
  onsetDetectorNode.connect(context.destination);

  return {
    sourceNode: sourceNode,
    onsetDetectorNode: onsetDetectorNode
  };
}

function visualize() {
  var canvas = document.getElementById('canvas');
  var canvasCtx = canvas.getContext('2d');

  function draw(time) {
    _twgl2.default.resizeCanvasToDisplaySize(canvas);
    var width = canvas.width;
    var height = canvas.height;

    alpha = document.getElementById('alpha').value || 0.5;
    delta = document.getElementById('delta').value || 0;

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, width, height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var x = width / 2;
    var y = height / 2;
    var radius = height / 3;
    var frequency = 10;
    var amp = 0.1 * time;
    var angle, dx, dy;

    var waveAmplitude = 0.03;
    var waveFrequency = 50;
    var rotationSpeed = 0.05;
    var oscillationSpeed = 0.005;

    for (angle = 0; angle <= 2 * Math.PI; angle += 0.001) {
      dx = x + radius * Math.cos(angle) * (1.0 + waveAmplitude * Math.sin(angle * waveFrequency + rotationSpeed * time) * Math.sin(oscillationSpeed * time));
      dy = y + radius * Math.sin(angle) * (1.0 + waveAmplitude * Math.sin(angle * waveFrequency + rotationSpeed * time) * Math.sin(oscillationSpeed * time));

      if (angle === 0) {
        canvasCtx.moveTo(dx, dy);
      } else {
        canvasCtx.lineTo(dx, dy);
      }
    }

    canvasCtx.stroke();

    (0, _utils.requestAnimationFrame)(draw);
  }

  var context = new _utils.AudioContext();
  var stftWorker = new _utils.Worker('js/workers/stft-worker.js');

  (0, _utils.loadAudio)(context, 'sounds/flim.mp3').then(function (audioBuffer) {
    var audioBufferData = audioBuffer.getChannelData(0).slice();

    stftWorker.onmessage = function (e) {
      var nodes = setupAudioNodes(context, e.data);
      nodes.sourceNode.buffer = audioBuffer;
      nodes.sourceNode.start(0);
      (0, _utils.requestAnimationFrame)(draw);
    };

    stftWorker.postMessage(audioBufferData, [audioBufferData.buffer]);
  });
}

visualize();

},{"./utils":3,"twgl.js":1}],3:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var requestAnimationFrame = global.requestAnimationFrame || function () {
  return global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    global.setTimeout(callback, 1000 / 60);
  };
}();

var AudioContext = global.AudioContext || global.webkitAudioContext;
var OfflineAudioContext = global.OfflineAudioContext || global.webkitOfflineAudioContext;
var Worker = global.Worker || global.webkitWorker;

function loadAudio(audioContext, url) {
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    var onDecodeSuccess = function onDecodeSuccess(buffer) {
      resolve(buffer);
    };
    var onDecodeFailure = function onDecodeFailure(error) {
      reject(error);
    };

    request.onload = function () {
      audioContext.decodeAudioData(request.response, onDecodeSuccess, onDecodeFailure);
    };

    request.onerror = function () {
      reject(Error('Network Error'));
    };

    request.send();
  });
}

function resizeCanvas(canvas) {
  var displayWidth = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

exports.AudioContext = AudioContext;
exports.OfflineAudioContext = OfflineAudioContext;
exports.Worker = Worker;
exports.requestAnimationFrame = requestAnimationFrame;
exports.loadAudio = loadAudio;
exports.resizeCanvas = resizeCanvas;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdHdnbC5qcy9kaXN0L3R3Z2wtZnVsbC5qcyIsInNyYy9zcGVjdHJhbC1mbHV4LmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2prT0EsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUVqQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDcEIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDbkQsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDbkQsU0FBUzs7QUFFVCxTQUFTLGFBQWEsQ0FBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtBQUN0QyxNQUFJLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFDZCxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNCLE9BQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQSxHQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ2hFO0FBQ0QsU0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFRCxTQUFTLFdBQVcsQ0FBRSxDQUFDLEVBQUUsSUFBSSxFQUFnQjtNQUFkLE9BQU8seURBQUcsRUFBRTs7QUFDekMsTUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkIsTUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkIsTUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7QUFDbEMsTUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUM7O0FBRWxDLE1BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekIsTUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLE1BQUksQ0FBQyxDQUFDOztBQUVOLE1BQUksNEJBQTRCLEdBQUcsSUFBSSxDQUFDO0FBQ3hDLE9BQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDL0IsZ0NBQTRCLEdBQUcsNEJBQTRCLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ3BIOztBQUVELE1BQUksZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO0FBQzNCLE9BQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ25DLFFBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxFQUFFO0FBQ3hCLHNCQUFnQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM3QjtHQUNGO0FBQ0QsTUFBSSx1QkFBdUIsR0FBRyxLQUFLLElBQUssQUFBQyxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEsQUFBQyxHQUFJLEtBQUssQUFBQyxDQUFDOztBQUV0RixNQUFJLGtCQUFrQixHQUFHLEtBQUssSUFBSSxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0FBRXBFLFNBQU8sNEJBQTRCLElBQUksdUJBQXVCLElBQUksa0JBQWtCLENBQUM7Q0FDdEY7O0FBRUQsU0FBUyxlQUFlLENBQUUsT0FBTyxRQUE4RDtNQUExRCxRQUFRLFFBQVIsUUFBUTtNQUFFLGdCQUFnQixRQUFoQixnQkFBZ0I7TUFBRSwwQkFBMEIsUUFBMUIsMEJBQTBCOztBQUN6RixNQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUM5QyxNQUFJLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUVqRSxtQkFBaUIsQ0FBQyxjQUFjLEdBQUcsVUFBVSxvQkFBb0IsRUFBRTtBQUNqRSxRQUFJLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxZQUFZOztBQUFDLEFBRXJELFFBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDekQsUUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDbkQsUUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDbkQsV0FBTyxHQUFHLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDOztBQUV2RSxRQUFJLE9BQU8sRUFBRTtBQUNYLGFBQU8sQ0FBQyxHQUFHLGdCQUFjLFlBQVksQ0FBRyxDQUFDO0tBQzFDOztBQUVELFFBQUksU0FBUyxHQUFHLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkUsUUFBSSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7OztBQUFDLEFBR3JFLFNBQUssSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0FBQy9FLGdCQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hDO0dBQ0YsQ0FBQzs7QUFFRixZQUFVLENBQUMsT0FBTyxHQUFHLFlBQVk7QUFDL0IsY0FBVSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ3pDLHFCQUFpQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDbkQsQ0FBQzs7QUFFRixZQUFVLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdEMsbUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFL0MsU0FBTztBQUNMLGNBQVUsRUFBRSxVQUFVO0FBQ3RCLHFCQUFpQixFQUFFLGlCQUFpQjtHQUNyQyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxTQUFTLEdBQUk7QUFDcEIsTUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxNQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV4QyxXQUFTLElBQUksQ0FBRSxJQUFJLEVBQUU7QUFDbkIsbUJBQUsseUJBQXlCLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdkMsUUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUN6QixRQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDOztBQUUzQixTQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDO0FBQ3RELFNBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUM7O0FBRXBELGFBQVMsQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUM7QUFDM0MsYUFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFeEMsYUFBUyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDeEIsYUFBUyxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUM7O0FBRXZDLGFBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFdEIsUUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNsQixRQUFJLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFFBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDeEIsUUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFDckIsUUFBSSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7QUFFbEIsUUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLFFBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUN2QixRQUFJLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFDekIsUUFBSSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7O0FBRTdCLFNBQUssS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxJQUFJLEtBQUssRUFBRTtBQUNwRCxRQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsYUFBYSxHQUFHLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFBLEFBQUMsQ0FBQztBQUN2SixRQUFFLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsYUFBYSxHQUFHLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxDQUFBLEFBQUMsQ0FBQzs7QUFFdkosVUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2YsaUJBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BQzFCLE1BQU07QUFDTCxpQkFBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7T0FDMUI7S0FDRjs7QUFFRCxhQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRW5CLGVBcElGLHFCQUFxQixFQW9JRyxJQUFJLENBQUMsQ0FBQztHQUM3Qjs7QUFFRCxNQUFJLE9BQU8sR0FBRyxXQXpJZCxZQUFZLEVBeUlvQixDQUFDO0FBQ2pDLE1BQUksVUFBVSxHQUFHLFdBeklqQixNQUFNLENBeUlzQiwyQkFBMkIsQ0FBQyxDQUFDOztBQUV6RCxhQXpJQSxTQUFTLEVBeUlDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLFdBQVcsRUFBRTtBQUNoRSxRQUFJLGVBQWUsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUU1RCxjQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQ2xDLFVBQUksS0FBSyxHQUFHLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdDLFdBQUssQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQztBQUN0QyxXQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQixpQkFqSkoscUJBQXFCLEVBaUpLLElBQUksQ0FBQyxDQUFDO0tBQzdCLENBQUM7O0FBRUYsY0FBVSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztHQUNuRSxDQUFDLENBQUM7Q0FDSjs7QUFFRCxTQUFTLEVBQUUsQ0FBQzs7Ozs7Ozs7O0FDaktaLElBQUkscUJBQXFCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixJQUFJLEFBQUMsWUFBWTtBQUN2RSxTQUFRLE1BQU0sQ0FBQywyQkFBMkIsSUFDbEMsTUFBTSxDQUFDLHdCQUF3QixJQUMvQixNQUFNLENBQUMsc0JBQXNCLElBQzdCLE1BQU0sQ0FBQyx1QkFBdUIsSUFDOUIsVUFBVSxRQUFRLEVBQUU7QUFDbEIsVUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0dBQ3hDLENBQUM7Q0FDWCxFQUFHLENBQUM7O0FBRUwsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsa0JBQWtCLENBQUM7QUFDcEUsSUFBSSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsbUJBQW1CLElBQUksTUFBTSxDQUFDLHlCQUF5QixDQUFDO0FBQ3pGLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQzs7QUFFbEQsU0FBUyxTQUFTLENBQUUsWUFBWSxFQUFFLEdBQUcsRUFBRTtBQUNyQyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUM1QyxRQUFJLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDOztBQUVuQyxXQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0IsV0FBTyxDQUFDLFlBQVksR0FBRyxhQUFhLENBQUM7O0FBRXJDLFFBQUksZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBYSxNQUFNLEVBQUU7QUFBRSxhQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7S0FBRSxDQUFDO0FBQzdELFFBQUksZUFBZSxHQUFHLFNBQWxCLGVBQWUsQ0FBYSxLQUFLLEVBQUU7QUFBRSxZQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FBRSxDQUFDOztBQUUxRCxXQUFPLENBQUMsTUFBTSxHQUFHLFlBQVk7QUFDM0Isa0JBQVksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7S0FDbEYsQ0FBQzs7QUFFRixXQUFPLENBQUMsT0FBTyxHQUFHLFlBQVk7QUFDNUIsWUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0tBQ2hDLENBQUM7O0FBRUYsV0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0dBQ2hCLENBQUMsQ0FBQztDQUNKOztBQUVELFNBQVMsWUFBWSxDQUFFLE1BQU0sRUFBRTtBQUM3QixNQUFJLFlBQVksR0FBSSxNQUFNLENBQUMsV0FBVyxDQUFDO0FBQ3ZDLE1BQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7O0FBRXhDLE1BQUksTUFBTSxDQUFDLEtBQUssS0FBSyxZQUFZLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxhQUFhLEVBQUU7QUFDcEUsVUFBTSxDQUFDLEtBQUssR0FBSSxZQUFZLENBQUM7QUFDN0IsVUFBTSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7R0FDL0I7Q0FDRjs7UUFHQyxZQUFZLEdBQVosWUFBWTtRQUNaLG1CQUFtQixHQUFuQixtQkFBbUI7UUFDbkIsTUFBTSxHQUFOLE1BQU07UUFDTixxQkFBcUIsR0FBckIscUJBQXFCO1FBQ3JCLFNBQVMsR0FBVCxTQUFTO1FBQ1QsWUFBWSxHQUFaLFlBQVkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAbGljZW5zZSB0d2dsLmpzIDAuMC40MiBDb3B5cmlnaHQgKGMpIDIwMTUsIEdyZWdnIFRhdmFyZXMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIEF2YWlsYWJsZSB2aWEgdGhlIE1JVCBsaWNlbnNlLlxuICogc2VlOiBodHRwOi8vZ2l0aHViLmNvbS9ncmVnZ21hbi90d2dsLmpzIGZvciBkZXRhaWxzXG4gKi9cbi8qKlxuICogQGxpY2Vuc2UgYWxtb25kIDAuMy4xIENvcHlyaWdodCAoYykgMjAxMS0yMDE0LCBUaGUgRG9qbyBGb3VuZGF0aW9uIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBBdmFpbGFibGUgdmlhIHRoZSBNSVQgb3IgbmV3IEJTRCBsaWNlbnNlLlxuICogc2VlOiBodHRwOi8vZ2l0aHViLmNvbS9qcmJ1cmtlL2FsbW9uZCBmb3IgZGV0YWlsc1xuICovXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gICAgfSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcm9vdC50d2dsID0gZmFjdG9yeSgpO1xuICAgIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG4vKipcbiAqIEBsaWNlbnNlIGFsbW9uZCAwLjMuMSBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCwgVGhlIERvam8gRm91bmRhdGlvbiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogQXZhaWxhYmxlIHZpYSB0aGUgTUlUIG9yIG5ldyBCU0QgbGljZW5zZS5cbiAqIHNlZTogaHR0cDovL2dpdGh1Yi5jb20vanJidXJrZS9hbG1vbmQgZm9yIGRldGFpbHNcbiAqL1xuLy9Hb2luZyBzbG9wcHkgdG8gYXZvaWQgJ3VzZSBzdHJpY3QnIHN0cmluZyBjb3N0LCBidXQgc3RyaWN0IHByYWN0aWNlcyBzaG91bGRcbi8vYmUgZm9sbG93ZWQuXG4vKmpzbGludCBzbG9wcHk6IHRydWUgKi9cbi8qZ2xvYmFsIHNldFRpbWVvdXQ6IGZhbHNlICovXG5cbnZhciBub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwanMsIG5vdHJlcXVpcmViZWNhc2Vicm93c2VyaWZ5bWVzc2VzdXAsIGRlZmluZTtcbihmdW5jdGlvbiAodW5kZWYpIHtcbiAgICB2YXIgbWFpbiwgcmVxLCBtYWtlTWFwLCBoYW5kbGVycyxcbiAgICAgICAgZGVmaW5lZCA9IHt9LFxuICAgICAgICB3YWl0aW5nID0ge30sXG4gICAgICAgIGNvbmZpZyA9IHt9LFxuICAgICAgICBkZWZpbmluZyA9IHt9LFxuICAgICAgICBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LFxuICAgICAgICBhcHMgPSBbXS5zbGljZSxcbiAgICAgICAganNTdWZmaXhSZWdFeHAgPSAvXFwuanMkLztcblxuICAgIGZ1bmN0aW9uIGhhc1Byb3Aob2JqLCBwcm9wKSB7XG4gICAgICAgIHJldHVybiBoYXNPd24uY2FsbChvYmosIHByb3ApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgcmVsYXRpdmUgbW9kdWxlIG5hbWUsIGxpa2UgLi9zb21ldGhpbmcsIG5vcm1hbGl6ZSBpdCB0b1xuICAgICAqIGEgcmVhbCBuYW1lIHRoYXQgY2FuIGJlIG1hcHBlZCB0byBhIHBhdGguXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgdGhlIHJlbGF0aXZlIG5hbWVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gYmFzZU5hbWUgYSByZWFsIG5hbWUgdGhhdCB0aGUgbmFtZSBhcmcgaXMgcmVsYXRpdmVcbiAgICAgKiB0by5cbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBub3JtYWxpemVkIG5hbWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBub3JtYWxpemUobmFtZSwgYmFzZU5hbWUpIHtcbiAgICAgICAgdmFyIG5hbWVQYXJ0cywgbmFtZVNlZ21lbnQsIG1hcFZhbHVlLCBmb3VuZE1hcCwgbGFzdEluZGV4LFxuICAgICAgICAgICAgZm91bmRJLCBmb3VuZFN0YXJNYXAsIHN0YXJJLCBpLCBqLCBwYXJ0LFxuICAgICAgICAgICAgYmFzZVBhcnRzID0gYmFzZU5hbWUgJiYgYmFzZU5hbWUuc3BsaXQoXCIvXCIpLFxuICAgICAgICAgICAgbWFwID0gY29uZmlnLm1hcCxcbiAgICAgICAgICAgIHN0YXJNYXAgPSAobWFwICYmIG1hcFsnKiddKSB8fCB7fTtcblxuICAgICAgICAvL0FkanVzdCBhbnkgcmVsYXRpdmUgcGF0aHMuXG4gICAgICAgIGlmIChuYW1lICYmIG5hbWUuY2hhckF0KDApID09PSBcIi5cIikge1xuICAgICAgICAgICAgLy9JZiBoYXZlIGEgYmFzZSBuYW1lLCB0cnkgdG8gbm9ybWFsaXplIGFnYWluc3QgaXQsXG4gICAgICAgICAgICAvL290aGVyd2lzZSwgYXNzdW1lIGl0IGlzIGEgdG9wLWxldmVsIG5vdHJlcXVpcmViZWNhc2Vicm93c2VyaWZ5bWVzc2VzdXAgdGhhdCB3aWxsXG4gICAgICAgICAgICAvL2JlIHJlbGF0aXZlIHRvIGJhc2VVcmwgaW4gdGhlIGVuZC5cbiAgICAgICAgICAgIGlmIChiYXNlTmFtZSkge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgbGFzdEluZGV4ID0gbmFtZS5sZW5ndGggLSAxO1xuXG4gICAgICAgICAgICAgICAgLy8gTm9kZSAuanMgYWxsb3dhbmNlOlxuICAgICAgICAgICAgICAgIGlmIChjb25maWcubm9kZUlkQ29tcGF0ICYmIGpzU3VmZml4UmVnRXhwLnRlc3QobmFtZVtsYXN0SW5kZXhdKSkge1xuICAgICAgICAgICAgICAgICAgICBuYW1lW2xhc3RJbmRleF0gPSBuYW1lW2xhc3RJbmRleF0ucmVwbGFjZShqc1N1ZmZpeFJlZ0V4cCwgJycpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vTG9wIG9mZiB0aGUgbGFzdCBwYXJ0IG9mIGJhc2VQYXJ0cywgc28gdGhhdCAuIG1hdGNoZXMgdGhlXG4gICAgICAgICAgICAgICAgLy9cImRpcmVjdG9yeVwiIGFuZCBub3QgbmFtZSBvZiB0aGUgYmFzZU5hbWUncyBtb2R1bGUuIEZvciBpbnN0YW5jZSxcbiAgICAgICAgICAgICAgICAvL2Jhc2VOYW1lIG9mIFwib25lL3R3by90aHJlZVwiLCBtYXBzIHRvIFwib25lL3R3by90aHJlZS5qc1wiLCBidXQgd2VcbiAgICAgICAgICAgICAgICAvL3dhbnQgdGhlIGRpcmVjdG9yeSwgXCJvbmUvdHdvXCIgZm9yIHRoaXMgbm9ybWFsaXphdGlvbi5cbiAgICAgICAgICAgICAgICBuYW1lID0gYmFzZVBhcnRzLnNsaWNlKDAsIGJhc2VQYXJ0cy5sZW5ndGggLSAxKS5jb25jYXQobmFtZSk7XG5cbiAgICAgICAgICAgICAgICAvL3N0YXJ0IHRyaW1Eb3RzXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG5hbWUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFydCA9IG5hbWVbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0ID09PSBcIi5cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpIC09IDE7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFydCA9PT0gXCIuLlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMSAmJiAobmFtZVsyXSA9PT0gJy4uJyB8fCBuYW1lWzBdID09PSAnLi4nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vRW5kIG9mIHRoZSBsaW5lLiBLZWVwIGF0IGxlYXN0IG9uZSBub24tZG90XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9wYXRoIHNlZ21lbnQgYXQgdGhlIGZyb250IHNvIGl0IGNhbiBiZSBtYXBwZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvcnJlY3RseSB0byBkaXNrLiBPdGhlcndpc2UsIHRoZXJlIGlzIGxpa2VseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vbm8gcGF0aCBtYXBwaW5nIGZvciBhIHBhdGggc3RhcnRpbmcgd2l0aCAnLi4nLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vVGhpcyBjYW4gc3RpbGwgZmFpbCwgYnV0IGNhdGNoZXMgdGhlIG1vc3QgcmVhc29uYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdXNlcyBvZiAuLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUuc3BsaWNlKGkgLSAxLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpIC09IDI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9lbmQgdHJpbURvdHNcblxuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lLmpvaW4oXCIvXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChuYW1lLmluZGV4T2YoJy4vJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBObyBiYXNlTmFtZSwgc28gdGhpcyBpcyBJRCBpcyByZXNvbHZlZCByZWxhdGl2ZVxuICAgICAgICAgICAgICAgIC8vIHRvIGJhc2VVcmwsIHB1bGwgb2ZmIHRoZSBsZWFkaW5nIGRvdC5cbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL0FwcGx5IG1hcCBjb25maWcgaWYgYXZhaWxhYmxlLlxuICAgICAgICBpZiAoKGJhc2VQYXJ0cyB8fCBzdGFyTWFwKSAmJiBtYXApIHtcbiAgICAgICAgICAgIG5hbWVQYXJ0cyA9IG5hbWUuc3BsaXQoJy8nKTtcblxuICAgICAgICAgICAgZm9yIChpID0gbmFtZVBhcnRzLmxlbmd0aDsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgICAgIG5hbWVTZWdtZW50ID0gbmFtZVBhcnRzLnNsaWNlKDAsIGkpLmpvaW4oXCIvXCIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2VQYXJ0cykge1xuICAgICAgICAgICAgICAgICAgICAvL0ZpbmQgdGhlIGxvbmdlc3QgYmFzZU5hbWUgc2VnbWVudCBtYXRjaCBpbiB0aGUgY29uZmlnLlxuICAgICAgICAgICAgICAgICAgICAvL1NvLCBkbyBqb2lucyBvbiB0aGUgYmlnZ2VzdCB0byBzbWFsbGVzdCBsZW5ndGhzIG9mIGJhc2VQYXJ0cy5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gYmFzZVBhcnRzLmxlbmd0aDsgaiA+IDA7IGogLT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVmFsdWUgPSBtYXBbYmFzZVBhcnRzLnNsaWNlKDAsIGopLmpvaW4oJy8nKV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vYmFzZU5hbWUgc2VnbWVudCBoYXMgIGNvbmZpZywgZmluZCBpZiBpdCBoYXMgb25lIGZvclxuICAgICAgICAgICAgICAgICAgICAgICAgLy90aGlzIG5hbWUuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBWYWx1ZSA9IG1hcFZhbHVlW25hbWVTZWdtZW50XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9NYXRjaCwgdXBkYXRlIG5hbWUgdG8gdGhlIG5ldyB2YWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRNYXAgPSBtYXBWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmRJID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kTWFwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vQ2hlY2sgZm9yIGEgc3RhciBtYXAgbWF0Y2gsIGJ1dCBqdXN0IGhvbGQgb24gdG8gaXQsXG4gICAgICAgICAgICAgICAgLy9pZiB0aGVyZSBpcyBhIHNob3J0ZXIgc2VnbWVudCBtYXRjaCBsYXRlciBpbiBhIG1hdGNoaW5nXG4gICAgICAgICAgICAgICAgLy9jb25maWcsIHRoZW4gZmF2b3Igb3ZlciB0aGlzIHN0YXIgbWFwLlxuICAgICAgICAgICAgICAgIGlmICghZm91bmRTdGFyTWFwICYmIHN0YXJNYXAgJiYgc3Rhck1hcFtuYW1lU2VnbWVudF0pIHtcbiAgICAgICAgICAgICAgICAgICAgZm91bmRTdGFyTWFwID0gc3Rhck1hcFtuYW1lU2VnbWVudF07XG4gICAgICAgICAgICAgICAgICAgIHN0YXJJID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZm91bmRNYXAgJiYgZm91bmRTdGFyTWFwKSB7XG4gICAgICAgICAgICAgICAgZm91bmRNYXAgPSBmb3VuZFN0YXJNYXA7XG4gICAgICAgICAgICAgICAgZm91bmRJID0gc3Rhckk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmb3VuZE1hcCkge1xuICAgICAgICAgICAgICAgIG5hbWVQYXJ0cy5zcGxpY2UoMCwgZm91bmRJLCBmb3VuZE1hcCk7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWVQYXJ0cy5qb2luKCcvJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlUmVxdWlyZShyZWxOYW1lLCBmb3JjZVN5bmMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vQSB2ZXJzaW9uIG9mIGEgbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cCBmdW5jdGlvbiB0aGF0IHBhc3NlcyBhIG1vZHVsZU5hbWVcbiAgICAgICAgICAgIC8vdmFsdWUgZm9yIGl0ZW1zIHRoYXQgbWF5IG5lZWQgdG9cbiAgICAgICAgICAgIC8vbG9vayB1cCBwYXRocyByZWxhdGl2ZSB0byB0aGUgbW9kdWxlTmFtZVxuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcHMuY2FsbChhcmd1bWVudHMsIDApO1xuXG4gICAgICAgICAgICAvL0lmIGZpcnN0IGFyZyBpcyBub3Qgbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cCgnc3RyaW5nJyksIGFuZCB0aGVyZSBpcyBvbmx5XG4gICAgICAgICAgICAvL29uZSBhcmcsIGl0IGlzIHRoZSBhcnJheSBmb3JtIHdpdGhvdXQgYSBjYWxsYmFjay4gSW5zZXJ0XG4gICAgICAgICAgICAvL2EgbnVsbCBzbyB0aGF0IHRoZSBmb2xsb3dpbmcgY29uY2F0IGlzIGNvcnJlY3QuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gIT09ICdzdHJpbmcnICYmIGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlcS5hcHBseSh1bmRlZiwgYXJncy5jb25jYXQoW3JlbE5hbWUsIGZvcmNlU3luY10pKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlTm9ybWFsaXplKHJlbE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9ybWFsaXplKG5hbWUsIHJlbE5hbWUpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VMb2FkKGRlcE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgZGVmaW5lZFtkZXBOYW1lXSA9IHZhbHVlO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbGxEZXAobmFtZSkge1xuICAgICAgICBpZiAoaGFzUHJvcCh3YWl0aW5nLCBuYW1lKSkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSB3YWl0aW5nW25hbWVdO1xuICAgICAgICAgICAgZGVsZXRlIHdhaXRpbmdbbmFtZV07XG4gICAgICAgICAgICBkZWZpbmluZ1tuYW1lXSA9IHRydWU7XG4gICAgICAgICAgICBtYWluLmFwcGx5KHVuZGVmLCBhcmdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaGFzUHJvcChkZWZpbmVkLCBuYW1lKSAmJiAhaGFzUHJvcChkZWZpbmluZywgbmFtZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gJyArIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZpbmVkW25hbWVdO1xuICAgIH1cblxuICAgIC8vVHVybnMgYSBwbHVnaW4hcmVzb3VyY2UgdG8gW3BsdWdpbiwgcmVzb3VyY2VdXG4gICAgLy93aXRoIHRoZSBwbHVnaW4gYmVpbmcgdW5kZWZpbmVkIGlmIHRoZSBuYW1lXG4gICAgLy9kaWQgbm90IGhhdmUgYSBwbHVnaW4gcHJlZml4LlxuICAgIGZ1bmN0aW9uIHNwbGl0UHJlZml4KG5hbWUpIHtcbiAgICAgICAgdmFyIHByZWZpeCxcbiAgICAgICAgICAgIGluZGV4ID0gbmFtZSA/IG5hbWUuaW5kZXhPZignIScpIDogLTE7XG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICBwcmVmaXggPSBuYW1lLnN1YnN0cmluZygwLCBpbmRleCk7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoaW5kZXggKyAxLCBuYW1lLmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtwcmVmaXgsIG5hbWVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgbmFtZSBtYXAsIG5vcm1hbGl6aW5nIHRoZSBuYW1lLCBhbmQgdXNpbmcgYSBwbHVnaW5cbiAgICAgKiBmb3Igbm9ybWFsaXphdGlvbiBpZiBuZWNlc3NhcnkuIEdyYWJzIGEgcmVmIHRvIHBsdWdpblxuICAgICAqIHRvbywgYXMgYW4gb3B0aW1pemF0aW9uLlxuICAgICAqL1xuICAgIG1ha2VNYXAgPSBmdW5jdGlvbiAobmFtZSwgcmVsTmFtZSkge1xuICAgICAgICB2YXIgcGx1Z2luLFxuICAgICAgICAgICAgcGFydHMgPSBzcGxpdFByZWZpeChuYW1lKSxcbiAgICAgICAgICAgIHByZWZpeCA9IHBhcnRzWzBdO1xuXG4gICAgICAgIG5hbWUgPSBwYXJ0c1sxXTtcblxuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgICBwcmVmaXggPSBub3JtYWxpemUocHJlZml4LCByZWxOYW1lKTtcbiAgICAgICAgICAgIHBsdWdpbiA9IGNhbGxEZXAocHJlZml4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vTm9ybWFsaXplIGFjY29yZGluZ1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgICBpZiAocGx1Z2luICYmIHBsdWdpbi5ub3JtYWxpemUpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gcGx1Z2luLm5vcm1hbGl6ZShuYW1lLCBtYWtlTm9ybWFsaXplKHJlbE5hbWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5vcm1hbGl6ZShuYW1lLCByZWxOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5hbWUgPSBub3JtYWxpemUobmFtZSwgcmVsTmFtZSk7XG4gICAgICAgICAgICBwYXJ0cyA9IHNwbGl0UHJlZml4KG5hbWUpO1xuICAgICAgICAgICAgcHJlZml4ID0gcGFydHNbMF07XG4gICAgICAgICAgICBuYW1lID0gcGFydHNbMV07XG4gICAgICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgICAgICAgcGx1Z2luID0gY2FsbERlcChwcmVmaXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9Vc2luZyByaWRpY3Vsb3VzIHByb3BlcnR5IG5hbWVzIGZvciBzcGFjZSByZWFzb25zXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmOiBwcmVmaXggPyBwcmVmaXggKyAnIScgKyBuYW1lIDogbmFtZSwgLy9mdWxsTmFtZVxuICAgICAgICAgICAgbjogbmFtZSxcbiAgICAgICAgICAgIHByOiBwcmVmaXgsXG4gICAgICAgICAgICBwOiBwbHVnaW5cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbWFrZUNvbmZpZyhuYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKGNvbmZpZyAmJiBjb25maWcuY29uZmlnICYmIGNvbmZpZy5jb25maWdbbmFtZV0pIHx8IHt9O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGhhbmRsZXJzID0ge1xuICAgICAgICBub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG1ha2VSZXF1aXJlKG5hbWUpO1xuICAgICAgICB9LFxuICAgICAgICBleHBvcnRzOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgdmFyIGUgPSBkZWZpbmVkW25hbWVdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGRlZmluZWRbbmFtZV0gPSB7fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1vZHVsZTogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQ6IG5hbWUsXG4gICAgICAgICAgICAgICAgdXJpOiAnJyxcbiAgICAgICAgICAgICAgICBleHBvcnRzOiBkZWZpbmVkW25hbWVdLFxuICAgICAgICAgICAgICAgIGNvbmZpZzogbWFrZUNvbmZpZyhuYW1lKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBtYWluID0gZnVuY3Rpb24gKG5hbWUsIGRlcHMsIGNhbGxiYWNrLCByZWxOYW1lKSB7XG4gICAgICAgIHZhciBjanNNb2R1bGUsIGRlcE5hbWUsIHJldCwgbWFwLCBpLFxuICAgICAgICAgICAgYXJncyA9IFtdLFxuICAgICAgICAgICAgY2FsbGJhY2tUeXBlID0gdHlwZW9mIGNhbGxiYWNrLFxuICAgICAgICAgICAgdXNpbmdFeHBvcnRzO1xuXG4gICAgICAgIC8vVXNlIG5hbWUgaWYgbm8gcmVsTmFtZVxuICAgICAgICByZWxOYW1lID0gcmVsTmFtZSB8fCBuYW1lO1xuXG4gICAgICAgIC8vQ2FsbCB0aGUgY2FsbGJhY2sgdG8gZGVmaW5lIHRoZSBtb2R1bGUsIGlmIG5lY2Vzc2FyeS5cbiAgICAgICAgaWYgKGNhbGxiYWNrVHlwZSA9PT0gJ3VuZGVmaW5lZCcgfHwgY2FsbGJhY2tUeXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvL1B1bGwgb3V0IHRoZSBkZWZpbmVkIGRlcGVuZGVuY2llcyBhbmQgcGFzcyB0aGUgb3JkZXJlZFxuICAgICAgICAgICAgLy92YWx1ZXMgdG8gdGhlIGNhbGxiYWNrLlxuICAgICAgICAgICAgLy9EZWZhdWx0IHRvIFtub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwLCBleHBvcnRzLCBtb2R1bGVdIGlmIG5vIGRlcHNcbiAgICAgICAgICAgIGRlcHMgPSAhZGVwcy5sZW5ndGggJiYgY2FsbGJhY2subGVuZ3RoID8gWydub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwJywgJ2V4cG9ydHMnLCAnbW9kdWxlJ10gOiBkZXBzO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGRlcHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBtYXAgPSBtYWtlTWFwKGRlcHNbaV0sIHJlbE5hbWUpO1xuICAgICAgICAgICAgICAgIGRlcE5hbWUgPSBtYXAuZjtcblxuICAgICAgICAgICAgICAgIC8vRmFzdCBwYXRoIENvbW1vbkpTIHN0YW5kYXJkIGRlcGVuZGVuY2llcy5cbiAgICAgICAgICAgICAgICBpZiAoZGVwTmFtZSA9PT0gXCJub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJnc1tpXSA9IGhhbmRsZXJzLm5vdHJlcXVpcmViZWNhc2Vicm93c2VyaWZ5bWVzc2VzdXAobmFtZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkZXBOYW1lID09PSBcImV4cG9ydHNcIikge1xuICAgICAgICAgICAgICAgICAgICAvL0NvbW1vbkpTIG1vZHVsZSBzcGVjIDEuMVxuICAgICAgICAgICAgICAgICAgICBhcmdzW2ldID0gaGFuZGxlcnMuZXhwb3J0cyhuYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgdXNpbmdFeHBvcnRzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRlcE5hbWUgPT09IFwibW9kdWxlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9Db21tb25KUyBtb2R1bGUgc3BlYyAxLjFcbiAgICAgICAgICAgICAgICAgICAgY2pzTW9kdWxlID0gYXJnc1tpXSA9IGhhbmRsZXJzLm1vZHVsZShuYW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGhhc1Byb3AoZGVmaW5lZCwgZGVwTmFtZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1Byb3Aod2FpdGluZywgZGVwTmFtZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc1Byb3AoZGVmaW5pbmcsIGRlcE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbaV0gPSBjYWxsRGVwKGRlcE5hbWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWFwLnApIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnAubG9hZChtYXAubiwgbWFrZVJlcXVpcmUocmVsTmFtZSwgdHJ1ZSksIG1ha2VMb2FkKGRlcE5hbWUpLCB7fSk7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbaV0gPSBkZWZpbmVkW2RlcE5hbWVdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihuYW1lICsgJyBtaXNzaW5nICcgKyBkZXBOYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldCA9IGNhbGxiYWNrID8gY2FsbGJhY2suYXBwbHkoZGVmaW5lZFtuYW1lXSwgYXJncykgOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgLy9JZiBzZXR0aW5nIGV4cG9ydHMgdmlhIFwibW9kdWxlXCIgaXMgaW4gcGxheSxcbiAgICAgICAgICAgICAgICAvL2Zhdm9yIHRoYXQgb3ZlciByZXR1cm4gdmFsdWUgYW5kIGV4cG9ydHMuIEFmdGVyIHRoYXQsXG4gICAgICAgICAgICAgICAgLy9mYXZvciBhIG5vbi11bmRlZmluZWQgcmV0dXJuIHZhbHVlIG92ZXIgZXhwb3J0cyB1c2UuXG4gICAgICAgICAgICAgICAgaWYgKGNqc01vZHVsZSAmJiBjanNNb2R1bGUuZXhwb3J0cyAhPT0gdW5kZWYgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGNqc01vZHVsZS5leHBvcnRzICE9PSBkZWZpbmVkW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmluZWRbbmFtZV0gPSBjanNNb2R1bGUuZXhwb3J0cztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJldCAhPT0gdW5kZWYgfHwgIXVzaW5nRXhwb3J0cykge1xuICAgICAgICAgICAgICAgICAgICAvL1VzZSB0aGUgcmV0dXJuIHZhbHVlIGZyb20gdGhlIGZ1bmN0aW9uLlxuICAgICAgICAgICAgICAgICAgICBkZWZpbmVkW25hbWVdID0gcmV0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChuYW1lKSB7XG4gICAgICAgICAgICAvL01heSBqdXN0IGJlIGFuIG9iamVjdCBkZWZpbml0aW9uIGZvciB0aGUgbW9kdWxlLiBPbmx5XG4gICAgICAgICAgICAvL3dvcnJ5IGFib3V0IGRlZmluaW5nIGlmIGhhdmUgYSBtb2R1bGUgbmFtZS5cbiAgICAgICAgICAgIGRlZmluZWRbbmFtZV0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwanMgPSBub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwID0gcmVxID0gZnVuY3Rpb24gKGRlcHMsIGNhbGxiYWNrLCByZWxOYW1lLCBmb3JjZVN5bmMsIGFsdCkge1xuICAgICAgICBpZiAodHlwZW9mIGRlcHMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGlmIChoYW5kbGVyc1tkZXBzXSkge1xuICAgICAgICAgICAgICAgIC8vY2FsbGJhY2sgaW4gdGhpcyBjYXNlIGlzIHJlYWxseSByZWxOYW1lXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXJzW2RlcHNdKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vSnVzdCByZXR1cm4gdGhlIG1vZHVsZSB3YW50ZWQuIEluIHRoaXMgc2NlbmFyaW8sIHRoZVxuICAgICAgICAgICAgLy9kZXBzIGFyZyBpcyB0aGUgbW9kdWxlIG5hbWUsIGFuZCBzZWNvbmQgYXJnIChpZiBwYXNzZWQpXG4gICAgICAgICAgICAvL2lzIGp1c3QgdGhlIHJlbE5hbWUuXG4gICAgICAgICAgICAvL05vcm1hbGl6ZSBtb2R1bGUgbmFtZSwgaWYgaXQgY29udGFpbnMgLiBvciAuLlxuICAgICAgICAgICAgcmV0dXJuIGNhbGxEZXAobWFrZU1hcChkZXBzLCBjYWxsYmFjaykuZik7XG4gICAgICAgIH0gZWxzZSBpZiAoIWRlcHMuc3BsaWNlKSB7XG4gICAgICAgICAgICAvL2RlcHMgaXMgYSBjb25maWcgb2JqZWN0LCBub3QgYW4gYXJyYXkuXG4gICAgICAgICAgICBjb25maWcgPSBkZXBzO1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5kZXBzKSB7XG4gICAgICAgICAgICAgICAgcmVxKGNvbmZpZy5kZXBzLCBjb25maWcuY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrLnNwbGljZSkge1xuICAgICAgICAgICAgICAgIC8vY2FsbGJhY2sgaXMgYW4gYXJyYXksIHdoaWNoIG1lYW5zIGl0IGlzIGEgZGVwZW5kZW5jeSBsaXN0LlxuICAgICAgICAgICAgICAgIC8vQWRqdXN0IGFyZ3MgaWYgdGhlcmUgYXJlIGRlcGVuZGVuY2llc1xuICAgICAgICAgICAgICAgIGRlcHMgPSBjYWxsYmFjaztcbiAgICAgICAgICAgICAgICBjYWxsYmFjayA9IHJlbE5hbWU7XG4gICAgICAgICAgICAgICAgcmVsTmFtZSA9IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlcHMgPSB1bmRlZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vU3VwcG9ydCBub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwKFsnYSddKVxuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgICAgIC8vSWYgcmVsTmFtZSBpcyBhIGZ1bmN0aW9uLCBpdCBpcyBhbiBlcnJiYWNrIGhhbmRsZXIsXG4gICAgICAgIC8vc28gcmVtb3ZlIGl0LlxuICAgICAgICBpZiAodHlwZW9mIHJlbE5hbWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJlbE5hbWUgPSBmb3JjZVN5bmM7XG4gICAgICAgICAgICBmb3JjZVN5bmMgPSBhbHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvL1NpbXVsYXRlIGFzeW5jIGNhbGxiYWNrO1xuICAgICAgICBpZiAoZm9yY2VTeW5jKSB7XG4gICAgICAgICAgICBtYWluKHVuZGVmLCBkZXBzLCBjYWxsYmFjaywgcmVsTmFtZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL1VzaW5nIGEgbm9uLXplcm8gdmFsdWUgYmVjYXVzZSBvZiBjb25jZXJuIGZvciB3aGF0IG9sZCBicm93c2Vyc1xuICAgICAgICAgICAgLy9kbywgYW5kIGxhdGVzdCBicm93c2VycyBcInVwZ3JhZGVcIiB0byA0IGlmIGxvd2VyIHZhbHVlIGlzIHVzZWQ6XG4gICAgICAgICAgICAvL2h0dHA6Ly93d3cud2hhdHdnLm9yZy9zcGVjcy93ZWItYXBwcy9jdXJyZW50LXdvcmsvbXVsdGlwYWdlL3RpbWVycy5odG1sI2RvbS13aW5kb3d0aW1lcnMtc2V0dGltZW91dDpcbiAgICAgICAgICAgIC8vSWYgd2FudCBhIHZhbHVlIGltbWVkaWF0ZWx5LCB1c2Ugbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cCgnaWQnKSBpbnN0ZWFkIC0tIHNvbWV0aGluZ1xuICAgICAgICAgICAgLy90aGF0IHdvcmtzIGluIGFsbW9uZCBvbiB0aGUgZ2xvYmFsIGxldmVsLCBidXQgbm90IGd1YXJhbnRlZWQgYW5kXG4gICAgICAgICAgICAvL3VubGlrZWx5IHRvIHdvcmsgaW4gb3RoZXIgQU1EIGltcGxlbWVudGF0aW9ucy5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIG1haW4odW5kZWYsIGRlcHMsIGNhbGxiYWNrLCByZWxOYW1lKTtcbiAgICAgICAgICAgIH0sIDQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlcTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSnVzdCBkcm9wcyB0aGUgY29uZmlnIG9uIHRoZSBmbG9vciwgYnV0IHJldHVybnMgcmVxIGluIGNhc2VcbiAgICAgKiB0aGUgY29uZmlnIHJldHVybiB2YWx1ZSBpcyB1c2VkLlxuICAgICAqL1xuICAgIHJlcS5jb25maWcgPSBmdW5jdGlvbiAoY2ZnKSB7XG4gICAgICAgIHJldHVybiByZXEoY2ZnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIG1vZHVsZSByZWdpc3RyeSBmb3IgZGVidWdnaW5nIGFuZCB0b29saW5nXG4gICAgICovXG4gICAgbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cGpzLl9kZWZpbmVkID0gZGVmaW5lZDtcblxuICAgIGRlZmluZSA9IGZ1bmN0aW9uIChuYW1lLCBkZXBzLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlZSBhbG1vbmQgUkVBRE1FOiBpbmNvcnJlY3QgbW9kdWxlIGJ1aWxkLCBubyBtb2R1bGUgbmFtZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9UaGlzIG1vZHVsZSBtYXkgbm90IGhhdmUgZGVwZW5kZW5jaWVzXG4gICAgICAgIGlmICghZGVwcy5zcGxpY2UpIHtcbiAgICAgICAgICAgIC8vZGVwcyBpcyBub3QgYW4gYXJyYXksIHNvIHByb2JhYmx5IG1lYW5zXG4gICAgICAgICAgICAvL2FuIG9iamVjdCBsaXRlcmFsIG9yIGZhY3RvcnkgZnVuY3Rpb24gZm9yXG4gICAgICAgICAgICAvL3RoZSB2YWx1ZS4gQWRqdXN0IGFyZ3MuXG4gICAgICAgICAgICBjYWxsYmFjayA9IGRlcHM7XG4gICAgICAgICAgICBkZXBzID0gW107XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhc1Byb3AoZGVmaW5lZCwgbmFtZSkgJiYgIWhhc1Byb3Aod2FpdGluZywgbmFtZSkpIHtcbiAgICAgICAgICAgIHdhaXRpbmdbbmFtZV0gPSBbbmFtZSwgZGVwcywgY2FsbGJhY2tdO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGRlZmluZS5hbWQgPSB7XG4gICAgICAgIGpRdWVyeTogdHJ1ZVxuICAgIH07XG59KCkpO1xuXG5kZWZpbmUoXCJub2RlX21vZHVsZXMvYWxtb25kL2FsbW9uZC5qc1wiLCBmdW5jdGlvbigpe30pO1xuXG4vKlxuICogQ29weXJpZ2h0IDIwMTUsIEdyZWdnIFRhdmFyZXMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZVxuICogbWV0OlxuICpcbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXG4gKiBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyXG4gKiBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlXG4gKiBkaXN0cmlidXRpb24uXG4gKiAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdyZWdnIFRhdmFyZXMuIG5vciB0aGUgbmFtZXMgb2YgaGlzXG4gKiBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbVxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAqIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcbiAqIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLFxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXG4gKiBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cbmRlZmluZSgndHdnbC90eXBlZGFycmF5cycsW10sIGZ1bmN0aW9uICgpIHtcbiAgXG5cbiAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IHNlZSBhIGdsb2JhbCBnbFxuICB2YXIgZ2wgPSB1bmRlZmluZWQ7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgLyogRGF0YVR5cGUgKi9cbiAgdmFyIEJZVEUgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MTQwMDtcbiAgdmFyIFVOU0lHTkVEX0JZVEUgICAgICAgICAgICAgICAgICA9IDB4MTQwMTtcbiAgdmFyIFNIT1JUICAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MTQwMjtcbiAgdmFyIFVOU0lHTkVEX1NIT1JUICAgICAgICAgICAgICAgICA9IDB4MTQwMztcbiAgdmFyIElOVCAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MTQwNDtcbiAgdmFyIFVOU0lHTkVEX0lOVCAgICAgICAgICAgICAgICAgICA9IDB4MTQwNTtcbiAgdmFyIEZMT0FUICAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MTQwNjtcblxuICAvKipcbiAgICogR2V0IHRoZSBHTCB0eXBlIGZvciBhIHR5cGVkQXJyYXlcbiAgICogQHBhcmFtIHtBcnJheUJ1ZmZlcnxBcnJheUJ1ZmZlclZpZXd9IHR5cGVkQXJyYXkgYSB0eXBlZEFycmF5XG4gICAqIEByZXR1cm4ge251bWJlcn0gdGhlIEdMIHR5cGUgZm9yIGFycmF5LiBGb3IgZXhhbXBsZSBwYXNzIGluIGFuIGBJbnQ4QXJyYXlgIGFuZCBgZ2wuQllURWAgd2lsbFxuICAgKiAgIGJlIHJldHVybmVkLiBQYXNzIGluIGEgYFVpbnQzMkFycmF5YCBhbmQgYGdsLlVOU0lHTkVEX0lOVGAgd2lsbCBiZSByZXR1cm5lZFxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGdldEdMVHlwZUZvclR5cGVkQXJyYXkodHlwZWRBcnJheSkge1xuICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgSW50OEFycmF5KSAgICB7IHJldHVybiBCWVRFOyB9ICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBVaW50OEFycmF5KSAgIHsgcmV0dXJuIFVOU0lHTkVEX0JZVEU7IH0gIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIEludDE2QXJyYXkpICAgeyByZXR1cm4gU0hPUlQ7IH0gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgVWludDE2QXJyYXkpICB7IHJldHVybiBVTlNJR05FRF9TSE9SVDsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBJbnQzMkFycmF5KSAgIHsgcmV0dXJuIElOVDsgfSAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIFVpbnQzMkFycmF5KSAgeyByZXR1cm4gVU5TSUdORURfSU5UOyB9ICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7IHJldHVybiBGTE9BVDsgfSAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgdGhyb3cgXCJ1bnN1cHBvcnRlZCB0eXBlZCBhcnJheSB0eXBlXCI7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSB0eXBlZCBhcnJheSBjb25zdHJ1Y3RvciBmb3IgYSBnaXZlbiBHTCB0eXBlXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0eXBlIHRoZSBHTCB0eXBlLiAoZWc6IGBnbC5VTlNJR05FRF9JTlRgKVxuICAgKiBAcmV0dXJuIHtmdW5jdGlvbn0gdGhlIGNvbnN0cnVjdG9yIGZvciBhIHRoZSBjb3JyZXNwb25kaW5nIHR5cGVkIGFycmF5LiAoZWcuIGBVaW50MzJBcnJheWApLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGdldFR5cGVkQXJyYXlUeXBlRm9yR0xUeXBlKHR5cGUpIHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgQllURTogICAgICAgICAgIHJldHVybiBJbnQ4QXJyYXk7ICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBjYXNlIFVOU0lHTkVEX0JZVEU6ICByZXR1cm4gVWludDhBcnJheTsgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgY2FzZSBTSE9SVDogICAgICAgICAgcmV0dXJuIEludDE2QXJyYXk7ICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGNhc2UgVU5TSUdORURfU0hPUlQ6IHJldHVybiBVaW50MTZBcnJheTsgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBjYXNlIElOVDogICAgICAgICAgICByZXR1cm4gSW50MzJBcnJheTsgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgY2FzZSBVTlNJR05FRF9JTlQ6ICAgcmV0dXJuIFVpbnQzMkFycmF5OyAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGNhc2UgRkxPQVQ6ICAgICAgICAgIHJldHVybiBGbG9hdDMyQXJyYXk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBcInVua25vd24gZ2wgdHlwZVwiO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQXJyYXlCdWZmZXIoYSkge1xuICAgIHJldHVybiBhICYmIGEuYnVmZmVyICYmIGEuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXI7XG4gIH1cblxuICAvLyBVc2luZyBxdW90ZXMgcHJldmVudHMgVWdsaWZ5IGZyb20gY2hhbmdpbmcgdGhlIG5hbWVzLlxuICByZXR1cm4ge1xuICAgIFwiZ2V0R0xUeXBlRm9yVHlwZWRBcnJheVwiOiBnZXRHTFR5cGVGb3JUeXBlZEFycmF5LFxuICAgIFwiZ2V0VHlwZWRBcnJheVR5cGVGb3JHTFR5cGVcIjogZ2V0VHlwZWRBcnJheVR5cGVGb3JHTFR5cGUsXG4gICAgXCJpc0FycmF5QnVmZmVyXCI6IGlzQXJyYXlCdWZmZXIsXG4gIH07XG59KTtcblxuXG4vKlxuICogQ29weXJpZ2h0IDIwMTUsIEdyZWdnIFRhdmFyZXMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZVxuICogbWV0OlxuICpcbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXG4gKiBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyXG4gKiBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlXG4gKiBkaXN0cmlidXRpb24uXG4gKiAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdyZWdnIFRhdmFyZXMuIG5vciB0aGUgbmFtZXMgb2YgaGlzXG4gKiBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbVxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAqIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcbiAqIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLFxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXG4gKiBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuZGVmaW5lKCd0d2dsL2F0dHJpYnV0ZXMnLFtcbiAgICAnLi90eXBlZGFycmF5cycsXG4gIF0sIGZ1bmN0aW9uIChcbiAgICB0eXBlZEFycmF5cykge1xuICBcblxuICAvLyBtYWtlIHN1cmUgd2UgZG9uJ3Qgc2VlIGEgZ2xvYmFsIGdsXG4gIHZhciBnbCA9IHVuZGVmaW5lZDsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIGF0dHJpYlByZWZpeDogXCJcIixcbiAgfTtcblxuICAvKipcbiAgICogU2V0cyB0aGUgZGVmYXVsdCBhdHRyaWIgcHJlZml4XG4gICAqXG4gICAqIFdoZW4gd3JpdGluZyBzaGFkZXJzIEkgcHJlZmVyIHRvIG5hbWUgYXR0cmlidXRlcyB3aXRoIGBhX2AsIHVuaWZvcm1zIHdpdGggYHVfYCBhbmQgdmFyeWluZ3Mgd2l0aCBgdl9gXG4gICAqIGFzIGl0IG1ha2VzIGl0IGNsZWFyIHdoZXJlIHRoZXkgY2FtZSBmcm9tLiBCdXQsIHdoZW4gYnVpbGRpbmcgZ2VvbWV0cnkgSSBwcmVmZXIgdXNpbmcgdW5wcmVmaXhlZCBuYW1lcy5cbiAgICpcbiAgICogSW4gb3RoZXJ3b3JkcyBJJ2xsIGNyZWF0ZSBhcnJheXMgb2YgZ2VvbWV0cnkgbGlrZSB0aGlzXG4gICAqXG4gICAqICAgICB2YXIgYXJyYXlzID0ge1xuICAgKiAgICAgICBwb3NpdGlvbjogLi4uXG4gICAqICAgICAgIG5vcm1hbDogLi4uXG4gICAqICAgICAgIHRleGNvb3JkOiAuLi5cbiAgICogICAgIH07XG4gICAqXG4gICAqIEJ1dCBuZWVkIHRob3NlIG1hcHBlZCB0byBhdHRyaWJ1dGVzIGFuZCBteSBhdHRyaWJ1dGVzIHN0YXJ0IHdpdGggYGFfYC5cbiAgICpcbiAgICogQGRlcHJlY2F0ZWQgc2VlIHtAbGluayBtb2R1bGU6dHdnbC5zZXREZWZhdWx0c31cbiAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCBwcmVmaXggZm9yIGF0dHJpYnNcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBzZXRBdHRyaWJ1dGVQcmVmaXgocHJlZml4KSB7XG4gICAgZGVmYXVsdHMuYXR0cmliUHJlZml4ID0gcHJlZml4O1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0RGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICBPYmplY3Qua2V5cyhuZXdEZWZhdWx0cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGRlZmF1bHRzW2tleV0gPSBuZXdEZWZhdWx0c1trZXldO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0QnVmZmVyRnJvbVR5cGVkQXJyYXkoZ2wsIHR5cGUsIGJ1ZmZlciwgYXJyYXksIGRyYXdUeXBlKSB7XG4gICAgZ2wuYmluZEJ1ZmZlcih0eXBlLCBidWZmZXIpO1xuICAgIGdsLmJ1ZmZlckRhdGEodHlwZSwgYXJyYXksIGRyYXdUeXBlIHx8IGdsLlNUQVRJQ19EUkFXKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiB0eXBlZCBhcnJheSBjcmVhdGVzIGEgV2ViR0xCdWZmZXIgYW5kIGNvcGllcyB0aGUgdHlwZWQgYXJyYXlcbiAgICogaW50byBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIEEgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ8QXJyYXlCdWZmZXJWaWV3fFdlYkdMQnVmZmVyfSB0eXBlZEFycmF5IHRoZSB0eXBlZCBhcnJheS4gTm90ZTogSWYgYSBXZWJHTEJ1ZmZlciBpcyBwYXNzZWQgaW4gaXQgd2lsbCBqdXN0IGJlIHJldHVybmVkLiBObyBhY3Rpb24gd2lsbCBiZSB0YWtlblxuICAgKiBAcGFyYW0ge251bWJlcn0gW3R5cGVdIHRoZSBHTCBiaW5kIHR5cGUgZm9yIHRoZSBidWZmZXIuIERlZmF1bHQgPSBgZ2wuQVJSQVlfQlVGRkVSYC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtkcmF3VHlwZV0gdGhlIEdMIGRyYXcgdHlwZSBmb3IgdGhlIGJ1ZmZlci4gRGVmYXVsdCA9ICdnbC5TVEFUSUNfRFJBV2AuXG4gICAqIEByZXR1cm4ge1dlYkdMQnVmZmVyfSB0aGUgY3JlYXRlZCBXZWJHTEJ1ZmZlclxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCB0eXBlZEFycmF5LCB0eXBlLCBkcmF3VHlwZSkge1xuICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgV2ViR0xCdWZmZXIpIHtcbiAgICAgIHJldHVybiB0eXBlZEFycmF5O1xuICAgIH1cbiAgICB0eXBlID0gdHlwZSB8fCBnbC5BUlJBWV9CVUZGRVI7XG4gICAgdmFyIGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIHNldEJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCB0eXBlLCBidWZmZXIsIHR5cGVkQXJyYXksIGRyYXdUeXBlKTtcbiAgICByZXR1cm4gYnVmZmVyO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNJbmRpY2VzKG5hbWUpIHtcbiAgICByZXR1cm4gbmFtZSA9PT0gXCJpbmRpY2VzXCI7XG4gIH1cblxuICAvLyBUaGlzIGlzIHJlYWxseSBqdXN0IGEgZ3Vlc3MuIFRob3VnaCBJIGNhbid0IHJlYWxseSBpbWFnaW5lIHVzaW5nXG4gIC8vIGFueXRoaW5nIGVsc2U/IE1heWJlIGZvciBzb21lIGNvbXByZXNzaW9uP1xuICBmdW5jdGlvbiBnZXROb3JtYWxpemF0aW9uRm9yVHlwZWRBcnJheSh0eXBlZEFycmF5KSB7XG4gICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpICAgIHsgcmV0dXJuIHRydWU7IH0gIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpICAgeyByZXR1cm4gdHJ1ZTsgfSAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGd1ZXNzTnVtQ29tcG9uZW50c0Zyb21OYW1lKG5hbWUsIGxlbmd0aCkge1xuICAgIHZhciBudW1Db21wb25lbnRzO1xuICAgIGlmIChuYW1lLmluZGV4T2YoXCJjb29yZFwiKSA+PSAwKSB7XG4gICAgICBudW1Db21wb25lbnRzID0gMjtcbiAgICB9IGVsc2UgaWYgKG5hbWUuaW5kZXhPZihcImNvbG9yXCIpID49IDApIHtcbiAgICAgIG51bUNvbXBvbmVudHMgPSA0O1xuICAgIH0gZWxzZSB7XG4gICAgICBudW1Db21wb25lbnRzID0gMzsgIC8vIHBvc2l0aW9uLCBub3JtYWxzLCBpbmRpY2VzIC4uLlxuICAgIH1cblxuICAgIGlmIChsZW5ndGggJSBudW1Db21wb25lbnRzID4gMCkge1xuICAgICAgdGhyb3cgXCJjYW4gbm90IGd1ZXNzIG51bUNvbXBvbmVudHMuIFlvdSBzaG91bGQgc3BlY2lmeSBpdC5cIjtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVtQ29tcG9uZW50cztcbiAgfVxuXG4gIGZ1bmN0aW9uIG1ha2VUeXBlZEFycmF5KGFycmF5LCBuYW1lKSB7XG4gICAgaWYgKHR5cGVkQXJyYXlzLmlzQXJyYXlCdWZmZXIoYXJyYXkpKSB7XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVkQXJyYXlzLmlzQXJyYXlCdWZmZXIoYXJyYXkuZGF0YSkpIHtcbiAgICAgIHJldHVybiBhcnJheS5kYXRhO1xuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGFycmF5KSkge1xuICAgICAgYXJyYXkgPSB7XG4gICAgICAgIGRhdGE6IGFycmF5LFxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgVHlwZSA9IGFycmF5LnR5cGU7XG4gICAgaWYgKCFUeXBlKSB7XG4gICAgICBpZiAobmFtZSA9PT0gXCJpbmRpY2VzXCIpIHtcbiAgICAgICAgVHlwZSA9IFVpbnQxNkFycmF5O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgVHlwZSA9IEZsb2F0MzJBcnJheTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUeXBlKGFycmF5LmRhdGEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBpbmZvIGZvciBhbiBhdHRyaWJ1dGUuIFRoaXMgaXMgZWZmZWN0aXZlbHkganVzdCB0aGUgYXJndW1lbnRzIHRvIGBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyYCBwbHVzIHRoZSBXZWJHTEJ1ZmZlclxuICAgKiBmb3IgdGhlIGF0dHJpYnV0ZS5cbiAgICpcbiAgICogQHR5cGVkZWYge09iamVjdH0gQXR0cmliSW5mb1xuICAgKiBAcHJvcGVydHkge251bWJlcn0gW251bUNvbXBvbmVudHNdIHRoZSBudW1iZXIgb2YgY29tcG9uZW50cyBmb3IgdGhpcyBhdHRyaWJ1dGUuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbc2l6ZV0gc3lub255bSBmb3IgYG51bUNvbXBvbmVudHNgLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3R5cGVdIHRoZSB0eXBlIG9mIHRoZSBhdHRyaWJ1dGUgKGVnLiBgZ2wuRkxPQVRgLCBgZ2wuVU5TSUdORURfQllURWAsIGV0Yy4uLikgRGVmYXVsdCA9IGBnbC5GTE9BVGBcbiAgICogQHByb3BlcnR5IHtib29sZWFufSBbbm9ybWFsaXplZF0gd2hldGhlciBvciBub3QgdG8gbm9ybWFsaXplIHRoZSBkYXRhLiBEZWZhdWx0ID0gZmFsc2VcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtvZmZzZXRdIG9mZnNldCBpbnRvIGJ1ZmZlciBpbiBieXRlcy4gRGVmYXVsdCA9IDBcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtzdHJpZGVdIHRoZSBzdHJpZGUgaW4gYnl0ZXMgcGVyIGVsZW1lbnQuIERlZmF1bHQgPSAwXG4gICAqIEBwcm9wZXJ0eSB7V2ViR0xCdWZmZXJ9IGJ1ZmZlciB0aGUgYnVmZmVyIHRoYXQgY29udGFpbnMgdGhlIGRhdGEgZm9yIHRoaXMgYXR0cmlidXRlXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbZHJhd1R5cGVdIHRoZSBkcmF3IHR5cGUgcGFzc2VkIHRvIGdsLmJ1ZmZlckRhdGEuIERlZmF1bHQgPSBnbC5TVEFUSUNfRFJBV1xuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cbiAgLyoqXG4gICAqIFVzZSB0aGlzIHR5cGUgb2YgYXJyYXkgc3BlYyB3aGVuIFRXR0wgY2FuJ3QgZ3Vlc3MgdGhlIHR5cGUgb3IgbnVtYmVyIG9mIGNvbXBvbWVudHMgb2YgYW4gYXJyYXlcbiAgICogQHR5cGVkZWYge09iamVjdH0gRnVsbEFycmF5U3BlY1xuICAgKiBAcHJvcGVydHkgeyhudW1iZXJbXXxBcnJheUJ1ZmZlcil9IGRhdGEgVGhlIGRhdGEgb2YgdGhlIGFycmF5LlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW251bUNvbXBvbmVudHNdIG51bWJlciBvZiBjb21wb25lbnRzIGZvciBgdmVydGV4QXR0cmliUG9pbnRlcmAuIERlZmF1bHQgaXMgYmFzZWQgb24gdGhlIG5hbWUgb2YgdGhlIGFycmF5LlxuICAgKiAgICBJZiBgY29vcmRgIGlzIGluIHRoZSBuYW1lIGFzc3VtZXMgYG51bUNvbXBvbmVudHMgPSAyYC5cbiAgICogICAgSWYgYGNvbG9yYCBpcyBpbiB0aGUgbmFtZSBhc3N1bWVzIGBudW1Db21wb25lbnRzID0gNGAuXG4gICAqICAgIG90aGVyd2lzZSBhc3N1bWVzIGBudW1Db21wb25lbnRzID0gM2BcbiAgICogQHByb3BlcnR5IHtjb25zdHJ1Y3Rvcn0gdHlwZSBUaGUgdHlwZS4gVGhpcyBpcyBvbmx5IHVzZWQgaWYgYGRhdGFgIGlzIGEgSmF2YVNjcmlwdCBhcnJheS4gSXQgaXMgdGhlIGNvbnN0cnVjdG9yIGZvciB0aGUgdHlwZWRhcnJheS4gKGVnLiBgVWludDhBcnJheWApLlxuICAgKiBGb3IgZXhhbXBsZSBpZiB5b3Ugd2FudCBjb2xvcnMgaW4gYSBgVWludDhBcnJheWAgeW91IG1pZ2h0IGhhdmUgYSBgRnVsbEFycmF5U3BlY2AgbGlrZSBgeyB0eXBlOiBVaW50OEFycmF5LCBkYXRhOiBbMjU1LDAsMjU1LDI1NSwgLi4uXSwgfWAuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbc2l6ZV0gc3lub255bSBmb3IgYG51bUNvbXBvbmVudHNgLlxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IFtub3JtYWxpemVdIG5vcm1hbGl6ZSBmb3IgYHZlcnRleEF0dHJpYlBvaW50ZXJgLiBEZWZhdWx0IGlzIHRydWUgaWYgdHlwZSBpcyBgSW50OEFycmF5YCBvciBgVWludDhBcnJheWAgb3RoZXJ3aXNlIGZhbHNlLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3N0cmlkZV0gc3RyaWRlIGZvciBgdmVydGV4QXR0cmliUG9pbnRlcmAuIERlZmF1bHQgPSAwXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbb2Zmc2V0XSBvZmZzZXQgZm9yIGB2ZXJ0ZXhBdHRyaWJQb2ludGVyYC4gRGVmYXVsdCA9IDBcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IFthdHRyaWJdIG5hbWUgb2YgYXR0cmlidXRlIHRoaXMgYXJyYXkgbWFwcyB0by4gRGVmYXVsdHMgdG8gc2FtZSBuYW1lIGFzIGFycmF5IHByZWZpeGVkIGJ5IHRoZSBkZWZhdWx0IGF0dHJpYlByZWZpeC5cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IFtuYW1lXSBzeW5vbnltIGZvciBgYXR0cmliYC5cbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IFthdHRyaWJOYW1lXSBzeW5vbnltIGZvciBgYXR0cmliYC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG4gIC8qKlxuICAgKiBBbiBpbmRpdmlkdWFsIGFycmF5IGluIHtAbGluayBtb2R1bGU6dHdnbC5BcnJheXN9XG4gICAqXG4gICAqIFdoZW4gcGFzc2VkIHRvIHtAbGluayBtb2R1bGU6dHdnbC5jcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5c30gaWYgYW4gQXJyYXlTcGVjIGlzIGBudW1iZXJbXWAgb3IgYEFycmF5QnVmZmVyYFxuICAgKiB0aGUgdHlwZXMgd2lsbCBiZSBndWVzc2VkIGJhc2VkIG9uIHRoZSBuYW1lLiBgaW5kaWNlc2Agd2lsbCBiZSBgVWludDE2QXJyYXlgLCBldmVyeXRoaW5nIGVsc2Ugd2lsbFxuICAgKiBiZSBgRmxvYXQzMkFycmF5YFxuICAgKlxuICAgKiBAdHlwZWRlZiB7KG51bWJlcltdfEFycmF5QnVmZmVyfG1vZHVsZTp0d2dsLkZ1bGxBcnJheVNwZWMpfSBBcnJheVNwZWNcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgSmF2YVNjcmlwdCBvYmplY3Qgb2YgYXJyYXlzIGJ5IG5hbWUuIFRoZSBuYW1lcyBzaG91bGQgbWF0Y2ggeW91ciBzaGFkZXIncyBhdHRyaWJ1dGVzLiBJZiB5b3VyXG4gICAqIGF0dHJpYnV0ZXMgaGF2ZSBhIGNvbW1vbiBwcmVmaXggeW91IGNhbiBzcGVjaWZ5IGl0IGJ5IGNhbGxpbmcge0BsaW5rIG1vZHVsZTp0d2dsLnNldEF0dHJpYnV0ZVByZWZpeH0uXG4gICAqXG4gICAqICAgICBCYXJlIEphdmFTY3JpcHQgQXJyYXlzXG4gICAqXG4gICAqICAgICAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgICAgICBwb3NpdGlvbjogWy0xLCAxLCAwXSxcbiAgICogICAgICAgICAgICBub3JtYWw6IFswLCAxLCAwXSxcbiAgICogICAgICAgICAgICAuLi5cbiAgICogICAgICAgICB9XG4gICAqXG4gICAqICAgICBCYXJlIFR5cGVkQXJyYXlzXG4gICAqXG4gICAqICAgICAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgICAgICBwb3NpdGlvbjogbmV3IEZsb2F0MzJBcnJheShbLTEsIDEsIDBdKSxcbiAgICogICAgICAgICAgICBjb2xvcjogbmV3IFVpbnQ4QXJyYXkoWzI1NSwgMTI4LCA2NCwgMjU1XSksXG4gICAqICAgICAgICAgICAgLi4uXG4gICAqICAgICAgICAgfVxuICAgKlxuICAgKiAqICAgV2lsbCBndWVzcyBhdCBgbnVtQ29tcG9uZW50c2AgaWYgbm90IHNwZWNpZmllZCBiYXNlZCBvbiBuYW1lLlxuICAgKlxuICAgKiAgICAgSWYgYGNvb3JkYCBpcyBpbiB0aGUgbmFtZSBhc3N1bWVzIGBudW1Db21wb25lbnRzID0gMmBcbiAgICpcbiAgICogICAgIElmIGBjb2xvcmAgaXMgaW4gdGhlIG5hbWUgYXNzdW1lcyBgbnVtQ29tcG9uZW50cyA9IDRgXG4gICAqXG4gICAqICAgICBvdGhlcndpc2UgYXNzdW1lcyBgbnVtQ29tcG9uZW50cyA9IDNgXG4gICAqXG4gICAqIE9iamVjdHMgd2l0aCB2YXJpb3VzIGZpZWxkcy4gU2VlIHtAbGluayBtb2R1bGU6dHdnbC5GdWxsQXJyYXlTcGVjfS5cbiAgICpcbiAgICogICAgIHZhciBhcnJheXMgPSB7XG4gICAqICAgICAgIHBvc2l0aW9uOiB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IFswLCAwLCAwLCAxMCwgMCwgMCwgMCwgMTAsIDAsIDEwLCAxMCwgMF0sIH0sXG4gICAqICAgICAgIHRleGNvb3JkOiB7IG51bUNvbXBvbmVudHM6IDIsIGRhdGE6IFswLCAwLCAwLCAxLCAxLCAwLCAxLCAxXSwgICAgICAgICAgICAgICAgIH0sXG4gICAqICAgICAgIG5vcm1hbDogICB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IFswLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxXSwgICAgIH0sXG4gICAqICAgICAgIGluZGljZXM6ICB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IFswLCAxLCAyLCAxLCAyLCAzXSwgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAqICAgICB9O1xuICAgKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0LjxzdHJpbmcsIG1vZHVsZTp0d2dsLkFycmF5U3BlYz59IEFycmF5c1xuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHNldCBvZiBhdHRyaWJ1dGUgZGF0YSBhbmQgV2ViR0xCdWZmZXJzIGZyb20gc2V0IG9mIGFycmF5c1xuICAgKlxuICAgKiBHaXZlblxuICAgKlxuICAgKiAgICAgIHZhciBhcnJheXMgPSB7XG4gICAqICAgICAgICBwb3NpdGlvbjogeyBudW1Db21wb25lbnRzOiAzLCBkYXRhOiBbMCwgMCwgMCwgMTAsIDAsIDAsIDAsIDEwLCAwLCAxMCwgMTAsIDBdLCB9LFxuICAgKiAgICAgICAgdGV4Y29vcmQ6IHsgbnVtQ29tcG9uZW50czogMiwgZGF0YTogWzAsIDAsIDAsIDEsIDEsIDAsIDEsIDFdLCAgICAgICAgICAgICAgICAgfSxcbiAgICogICAgICAgIG5vcm1hbDogICB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IFswLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxXSwgICAgIH0sXG4gICAqICAgICAgICBjb2xvcjogICAgeyBudW1Db21wb25lbnRzOiA0LCBkYXRhOiBbMjU1LCAyNTUsIDI1NSwgMjU1LCAyNTUsIDAsIDAsIDI1NSwgMCwgMCwgMjU1LCAyNTVdLCB0eXBlOiBVaW50OEFycmF5LCB9LFxuICAgKiAgICAgICAgaW5kaWNlczogIHsgbnVtQ29tcG9uZW50czogMywgZGF0YTogWzAsIDEsIDIsIDEsIDIsIDNdLCAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICogICAgICB9O1xuICAgKlxuICAgKiByZXR1cm5zIHNvbWV0aGluZyBsaWtlXG4gICAqXG4gICAqICAgICAgdmFyIGF0dHJpYnMgPSB7XG4gICAqICAgICAgICBwb3NpdGlvbjogeyBudW1Db21wb25lbnRzOiAzLCB0eXBlOiBnbC5GTE9BVCwgICAgICAgICBub3JtYWxpemU6IGZhbHNlLCBidWZmZXI6IFdlYkdMQnVmZmVyLCB9LFxuICAgKiAgICAgICAgdGV4Y29vcmQ6IHsgbnVtQ29tcG9uZW50czogMiwgdHlwZTogZ2wuRkxPQVQsICAgICAgICAgbm9ybWFsaXplOiBmYWxzZSwgYnVmZmVyOiBXZWJHTEJ1ZmZlciwgfSxcbiAgICogICAgICAgIG5vcm1hbDogICB7IG51bUNvbXBvbmVudHM6IDMsIHR5cGU6IGdsLkZMT0FULCAgICAgICAgIG5vcm1hbGl6ZTogZmFsc2UsIGJ1ZmZlcjogV2ViR0xCdWZmZXIsIH0sXG4gICAqICAgICAgICBjb2xvcjogICAgeyBudW1Db21wb25lbnRzOiA0LCB0eXBlOiBnbC5VTlNJR05FRF9CWVRFLCBub3JtYWxpemU6IHRydWUsICBidWZmZXI6IFdlYkdMQnVmZmVyLCB9LFxuICAgKiAgICAgIH07XG4gICAqXG4gICAqIG5vdGVzOlxuICAgKlxuICAgKiAqICAgQXJyYXlzIGNhbiB0YWtlIHZhcmlvdXMgZm9ybXNcbiAgICpcbiAgICogICAgIEJhcmUgSmF2YVNjcmlwdCBBcnJheXNcbiAgICpcbiAgICogICAgICAgICB2YXIgYXJyYXlzID0ge1xuICAgKiAgICAgICAgICAgIHBvc2l0aW9uOiBbLTEsIDEsIDBdLFxuICAgKiAgICAgICAgICAgIG5vcm1hbDogWzAsIDEsIDBdLFxuICAgKiAgICAgICAgICAgIC4uLlxuICAgKiAgICAgICAgIH1cbiAgICpcbiAgICogICAgIEJhcmUgVHlwZWRBcnJheXNcbiAgICpcbiAgICogICAgICAgICB2YXIgYXJyYXlzID0ge1xuICAgKiAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgRmxvYXQzMkFycmF5KFstMSwgMSwgMF0pLFxuICAgKiAgICAgICAgICAgIGNvbG9yOiBuZXcgVWludDhBcnJheShbMjU1LCAxMjgsIDY0LCAyNTVdKSxcbiAgICogICAgICAgICAgICAuLi5cbiAgICogICAgICAgICB9XG4gICAqXG4gICAqICogICBXaWxsIGd1ZXNzIGF0IGBudW1Db21wb25lbnRzYCBpZiBub3Qgc3BlY2lmaWVkIGJhc2VkIG9uIG5hbWUuXG4gICAqXG4gICAqICAgICBJZiBgY29vcmRgIGlzIGluIHRoZSBuYW1lIGFzc3VtZXMgYG51bUNvbXBvbmVudHMgPSAyYFxuICAgKlxuICAgKiAgICAgSWYgYGNvbG9yYCBpcyBpbiB0aGUgbmFtZSBhc3N1bWVzIGBudW1Db21wb25lbnRzID0gNGBcbiAgICpcbiAgICogICAgIG90aGVyd2lzZSBhc3N1bWVzIGBudW1Db21wb25lbnRzID0gM2BcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSB3ZWJnbCByZW5kZXJpbmcgY29udGV4dC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5BcnJheXN9IGFycmF5cyBUaGUgYXJyYXlzXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBtb2R1bGU6dHdnbC5BdHRyaWJJbmZvPn0gdGhlIGF0dHJpYnNcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVBdHRyaWJzRnJvbUFycmF5cyhnbCwgYXJyYXlzKSB7XG4gICAgdmFyIGF0dHJpYnMgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhhcnJheXMpLmZvckVhY2goZnVuY3Rpb24oYXJyYXlOYW1lKSB7XG4gICAgICBpZiAoIWlzSW5kaWNlcyhhcnJheU5hbWUpKSB7XG4gICAgICAgIHZhciBhcnJheSA9IGFycmF5c1thcnJheU5hbWVdO1xuICAgICAgICB2YXIgYXR0cmliTmFtZSA9IGFycmF5LmF0dHJpYiB8fCBhcnJheS5uYW1lIHx8IGFycmF5LmF0dHJpYk5hbWUgfHwgKGRlZmF1bHRzLmF0dHJpYlByZWZpeCArIGFycmF5TmFtZSk7XG4gICAgICAgIHZhciB0eXBlZEFycmF5ID0gbWFrZVR5cGVkQXJyYXkoYXJyYXksIGFycmF5TmFtZSk7XG4gICAgICAgIGF0dHJpYnNbYXR0cmliTmFtZV0gPSB7XG4gICAgICAgICAgYnVmZmVyOiAgICAgICAgY3JlYXRlQnVmZmVyRnJvbVR5cGVkQXJyYXkoZ2wsIHR5cGVkQXJyYXksIHVuZGVmaW5lZCwgYXJyYXkuZHJhd1R5cGUpLFxuICAgICAgICAgIG51bUNvbXBvbmVudHM6IGFycmF5Lm51bUNvbXBvbmVudHMgfHwgYXJyYXkuc2l6ZSB8fCBndWVzc051bUNvbXBvbmVudHNGcm9tTmFtZShhcnJheU5hbWUpLFxuICAgICAgICAgIHR5cGU6ICAgICAgICAgIHR5cGVkQXJyYXlzLmdldEdMVHlwZUZvclR5cGVkQXJyYXkodHlwZWRBcnJheSksXG4gICAgICAgICAgbm9ybWFsaXplOiAgICAgYXJyYXkubm9ybWFsaXplICE9PSB1bmRlZmluZWQgPyBhcnJheS5ub3JtYWxpemUgOiBnZXROb3JtYWxpemF0aW9uRm9yVHlwZWRBcnJheSh0eXBlZEFycmF5KSxcbiAgICAgICAgICBzdHJpZGU6ICAgICAgICBhcnJheS5zdHJpZGUgfHwgMCxcbiAgICAgICAgICBvZmZzZXQ6ICAgICAgICBhcnJheS5vZmZzZXQgfHwgMCxcbiAgICAgICAgICBkcmF3VHlwZTogICAgICBhcnJheS5kcmF3VHlwZSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYXR0cmlicztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBjb250ZW50cyBvZiBhIGJ1ZmZlciBhdHRhY2hlZCB0byBhbiBhdHRyaWJJbmZvXG4gICAqXG4gICAqIFRoaXMgaXMgaGVscGVyIGZ1bmN0aW9uIHRvIGR5bmFtaWNhbGx5IHVwZGF0ZSBhIGJ1ZmZlci5cbiAgICpcbiAgICogTGV0J3Mgc2F5IHlvdSBtYWtlIGEgYnVmZmVySW5mb1xuICAgKlxuICAgKiAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgIHBvc2l0aW9uOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxMCwgMCwgMCwgMCwgMTAsIDAsIDEwLCAxMCwgMF0pLFxuICAgKiAgICAgICAgdGV4Y29vcmQ6IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDAsIDEsIDEsIDAsIDEsIDFdKSxcbiAgICogICAgICAgIG5vcm1hbDogICBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxXSksXG4gICAqICAgICAgICBpbmRpY2VzOiAgbmV3IFVpbnQxNkFycmF5KFswLCAxLCAyLCAxLCAyLCAzXSksXG4gICAqICAgICB9O1xuICAgKiAgICAgdmFyIGJ1ZmZlckluZm8gPSB0d2dsLmNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzKGdsLCBhcnJheXMpO1xuICAgKlxuICAgKiAgQW5kIHlvdSB3YW50IHRvIGR5bmFtaWNhbGx5IHVwYXRlIHRoZSBwb3NpdGlvbnMuIFlvdSBjb3VsZCBkbyB0aGlzXG4gICAqXG4gICAqICAgICAvLyBhc3N1bWluZyBhcnJheXMucG9zaXRpb24gaGFzIGFscmVhZHkgYmVlbiB1cGRhdGVkIHdpdGggbmV3IGRhdGEuXG4gICAqICAgICB0d2dsLnNldEF0dHJpYkluZm9CdWZmZXJGcm9tQXJyYXkoZ2wsIGJ1ZmZlckluZm8uYXR0cmlicy5wb3NpdGlvbiwgYXJyYXlzLnBvc2l0aW9uKTtcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsXG4gICAqIEBwYXJhbSB7QXR0cmliSW5mb30gYXR0cmliSW5mbyBUaGUgYXR0cmliSW5mbyB3aG8ncyBidWZmZXIgY29udGVudHMgdG8gc2V0LiBOT1RFOiBJZiB5b3UgaGF2ZSBhbiBhdHRyaWJ1dGUgcHJlZml4XG4gICAqICAgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZSB3aWxsIGluY2x1ZGUgdGhlIHByZWZpeC5cbiAgICogQHBhcmFtIHtBcnJheVNwZWN9IGFycmF5IE5vdGU6IGl0IGlzIGFyZ3VhYmx5IGluZWZmaWVudCB0byBwYXNzIGluIGFueXRoaW5nIGJ1dCBhIHR5cGVkIGFycmF5IGJlY2F1c2UgYW55dGhpbmdcbiAgICogICAgZWxzZSB3aWxsIGhhdmUgdG8gYmUgY29udmVydGVkIHRvIGEgdHlwZWQgYXJyYXkgYmVmb3JlIGl0IGNhbiBiZSB1c2VkIGJ5IFdlYkdMLiBEdXJpbmcgaW5pdCB0aW1lIHRoYXRcbiAgICogICAgaW5lZmZpY2llbmN5IGlzIHVzdWFsbHkgbm90IGltcG9ydGFudCBidXQgaWYgeW91J3JlIHVwZGF0aW5nIGRhdGEgZHluYW1pY2FsbHkgYmVzdCB0byBiZSBlZmZpY2llbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb2Zmc2V0XSBhbiBvcHRpb25hbCBvZmZzZXQgaW50byB0aGUgYnVmZmVyLiBUaGlzIGlzIG9ubHkgYW4gb2Zmc2V0IGludG8gdGhlIFdlYkdMIGJ1ZmZlclxuICAgKiAgICBub3QgdGhlIGFycmF5LiBUbyBwYXNzIGluIGFuIG9mZnNldCBpbnRvIHRoZSBhcnJheSBpdHNlbGYgdXNlIGEgdHlwZWQgYXJyYXkgYW5kIGNyZWF0ZSBhbiBgQXJyYXlCdWZmZXJWaWV3YFxuICAgKiAgICBmb3IgdGhlIHBvcnRpb24gb2YgdGhlIGFycmF5IHlvdSB3YW50IHRvIHVzZS5cbiAgICpcbiAgICogICAgICAgIHZhciBzb21lQXJyYXkgPSBuZXcgRmxvYXQzMkFycmF5KDEwMDApOyAvLyBhbiBhcnJheSB3aXRoIDEwMDAgZmxvYXRzXG4gICAqICAgICAgICB2YXIgc29tZVN1YkFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShzb21lQXJyYXkuYnVmZmVyLCBvZmZzZXRJbkJ5dGVzLCBzaXplSW5Vbml0cyk7IC8vIGEgdmlldyBpbnRvIHNvbWVBcnJheVxuICAgKlxuICAgKiAgICBOb3cgeW91IGNhbiBwYXNzIGBzb21lU3ViQXJyYXlgIGludG8gc2V0QXR0cmliSW5mb0J1ZmZlckZyb21BcnJheWBcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBzZXRBdHRyaWJJbmZvQnVmZmVyRnJvbUFycmF5KGdsLCBhdHRyaWJJbmZvLCBhcnJheSwgb2Zmc2V0KSB7XG4gICAgYXJyYXkgPSBtYWtlVHlwZWRBcnJheShhcnJheSk7XG4gICAgaWYgKG9mZnNldCkge1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGF0dHJpYkluZm8uYnVmZmVyKTtcbiAgICAgIGdsLmJ1ZmZlclN1YkRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBvZmZzZXQsIGFycmF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0QnVmZmVyRnJvbVR5cGVkQXJyYXkoZ2wsIGdsLkFSUkFZX0JVRkZFUiwgYXR0cmliSW5mby5idWZmZXIsIGFycmF5LCBhdHRyaWJJbmZvLmRyYXdUeXBlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogdHJpZXMgdG8gZ2V0IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgZnJvbSBhIHNldCBvZiBhcnJheXMuXG4gICAqL1xuXG4gIHZhciBnZXROdW1FbGVtZW50c0Zyb21Ob25JbmRleGVkQXJyYXlzID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb3NpdGlvbktleXMgPSBbJ3Bvc2l0aW9uJywgJ3Bvc2l0aW9ucycsICdhX3Bvc2l0aW9uJ107XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZ2V0TnVtRWxlbWVudHNGcm9tTm9uSW5kZXhlZEFycmF5cyhhcnJheXMpIHtcbiAgICAgIHZhciBrZXk7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgcG9zaXRpb25LZXlzLmxlbmd0aDsgKytpaSkge1xuICAgICAgICBrZXkgPSBwb3NpdGlvbktleXNbaWldO1xuICAgICAgICBpZiAoa2V5IGluIGFycmF5cykge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaWkgPT09IHBvc2l0aW9uS2V5cy5sZW5ndGgpIHtcbiAgICAgICAga2V5ID0gT2JqZWN0LmtleXMoYXJyYXlzKVswXTtcbiAgICAgIH1cbiAgICAgIHZhciBhcnJheSA9IGFycmF5c1trZXldO1xuICAgICAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCB8fCBhcnJheS5kYXRhLmxlbmd0aDtcbiAgICAgIHZhciBudW1Db21wb25lbnRzID0gYXJyYXkubnVtQ29tcG9uZW50cyB8fCBndWVzc051bUNvbXBvbmVudHNGcm9tTmFtZShrZXksIGxlbmd0aCk7XG4gICAgICB2YXIgbnVtRWxlbWVudHMgPSBsZW5ndGggLyBudW1Db21wb25lbnRzO1xuICAgICAgaWYgKGxlbmd0aCAlIG51bUNvbXBvbmVudHMgPiAwKSB7XG4gICAgICAgIHRocm93IFwibnVtQ29tcG9uZW50cyBcIiArIG51bUNvbXBvbmVudHMgKyBcIiBub3QgY29ycmVjdCBmb3IgbGVuZ3RoIFwiICsgbGVuZ3RoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bUVsZW1lbnRzO1xuICAgIH07XG4gIH0oKSk7XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IEJ1ZmZlckluZm9cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IG51bUVsZW1lbnRzIFRoZSBudW1iZXIgb2YgZWxlbWVudHMgdG8gcGFzcyB0byBgZ2wuZHJhd0FycmF5c2Agb3IgYGdsLmRyYXdFbGVtZW50c2AuXG4gICAqIEBwcm9wZXJ0eSB7V2ViR0xCdWZmZXJ9IFtpbmRpY2VzXSBUaGUgaW5kaWNlcyBgRUxFTUVOVF9BUlJBWV9CVUZGRVJgIGlmIGFueSBpbmRpY2VzIGV4aXN0LlxuICAgKiBAcHJvcGVydHkge09iamVjdC48c3RyaW5nLCBtb2R1bGU6dHdnbC5BdHRyaWJJbmZvPn0gYXR0cmlicyBUaGUgYXR0cmlicyBhcHByb3JpYXRlIHRvIGNhbGwgYHNldEF0dHJpYnV0ZXNgXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgQnVmZmVySW5mbyBmcm9tIGFuIG9iamVjdCBvZiBhcnJheXMuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHBhc3NlZCB0byB7QGxpbmsgbW9kdWxlOnR3Z2wuc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXN9IGFuZCB0b1xuICAgKiB7QGxpbmsgbW9kdWxlOnR3Z2w6ZHJhd0J1ZmZlckluZm99LlxuICAgKlxuICAgKiBHaXZlbiBhbiBvYmplY3QgbGlrZVxuICAgKlxuICAgKiAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgcG9zaXRpb246IHsgbnVtQ29tcG9uZW50czogMywgZGF0YTogWzAsIDAsIDAsIDEwLCAwLCAwLCAwLCAxMCwgMCwgMTAsIDEwLCAwXSwgfSxcbiAgICogICAgICAgdGV4Y29vcmQ6IHsgbnVtQ29tcG9uZW50czogMiwgZGF0YTogWzAsIDAsIDAsIDEsIDEsIDAsIDEsIDFdLCAgICAgICAgICAgICAgICAgfSxcbiAgICogICAgICAgbm9ybWFsOiAgIHsgbnVtQ29tcG9uZW50czogMywgZGF0YTogWzAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDFdLCAgICAgfSxcbiAgICogICAgICAgaW5kaWNlczogIHsgbnVtQ29tcG9uZW50czogMywgZGF0YTogWzAsIDEsIDIsIDEsIDIsIDNdLCAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICogICAgIH07XG4gICAqXG4gICAqICBDcmVhdGVzIGFuIEJ1ZmZlckluZm8gbGlrZSB0aGlzXG4gICAqXG4gICAqICAgICBidWZmZXJJbmZvID0ge1xuICAgKiAgICAgICBudW1FbGVtZW50czogNCwgICAgICAgIC8vIG9yIHdoYXRldmVyIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaXNcbiAgICogICAgICAgaW5kaWNlczogV2ViR0xCdWZmZXIsICAvLyB0aGlzIHByb3BlcnR5IHdpbGwgbm90IGV4aXN0IGlmIHRoZXJlIGFyZSBubyBpbmRpY2VzXG4gICAqICAgICAgIGF0dHJpYnM6IHtcbiAgICogICAgICAgICBhX3Bvc2l0aW9uOiB7IGJ1ZmZlcjogV2ViR0xCdWZmZXIsIG51bUNvbXBvbmVudHM6IDMsIH0sXG4gICAqICAgICAgICAgYV9ub3JtYWw6ICAgeyBidWZmZXI6IFdlYkdMQnVmZmVyLCBudW1Db21wb25lbnRzOiAzLCB9LFxuICAgKiAgICAgICAgIGFfdGV4Y29vcmQ6IHsgYnVmZmVyOiBXZWJHTEJ1ZmZlciwgbnVtQ29tcG9uZW50czogMiwgfSxcbiAgICogICAgICAgfSxcbiAgICogICAgIH07XG4gICAqXG4gICAqICBUaGUgcHJvcGVydGllcyBvZiBhcnJheXMgY2FuIGJlIEphdmFTY3JpcHQgYXJyYXlzIGluIHdoaWNoIGNhc2UgdGhlIG51bWJlciBvZiBjb21wb25lbnRzXG4gICAqICB3aWxsIGJlIGd1ZXNzZWQuXG4gICAqXG4gICAqICAgICB2YXIgYXJyYXlzID0ge1xuICAgKiAgICAgICAgcG9zaXRpb246IFswLCAwLCAwLCAxMCwgMCwgMCwgMCwgMTAsIDAsIDEwLCAxMCwgMF0sXG4gICAqICAgICAgICB0ZXhjb29yZDogWzAsIDAsIDAsIDEsIDEsIDAsIDEsIDFdLFxuICAgKiAgICAgICAgbm9ybWFsOiAgIFswLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxXSxcbiAgICogICAgICAgIGluZGljZXM6ICBbMCwgMSwgMiwgMSwgMiwgM10sXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgVGhleSBjYW4gYWxzbyBieSBUeXBlZEFycmF5c1xuICAgKlxuICAgKiAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgIHBvc2l0aW9uOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxMCwgMCwgMCwgMCwgMTAsIDAsIDEwLCAxMCwgMF0pLFxuICAgKiAgICAgICAgdGV4Y29vcmQ6IG5ldyBGbG9hdDMyQXJyYXkoWzAsIDAsIDAsIDEsIDEsIDAsIDEsIDFdKSxcbiAgICogICAgICAgIG5vcm1hbDogICBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxXSksXG4gICAqICAgICAgICBpbmRpY2VzOiAgbmV3IFVpbnQxNkFycmF5KFswLCAxLCAyLCAxLCAyLCAzXSksXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgT3IgYXVnbWVudGVkVHlwZWRBcnJheXNcbiAgICpcbiAgICogICAgIHZhciBwb3NpdGlvbnMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIDQpO1xuICAgKiAgICAgdmFyIHRleGNvb3JkcyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMiwgNCk7XG4gICAqICAgICB2YXIgbm9ybWFscyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCA0KTtcbiAgICogICAgIHZhciBpbmRpY2VzICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIDIsIFVpbnQxNkFycmF5KTtcbiAgICpcbiAgICogICAgIHBvc2l0aW9ucy5wdXNoKFswLCAwLCAwLCAxMCwgMCwgMCwgMCwgMTAsIDAsIDEwLCAxMCwgMF0pO1xuICAgKiAgICAgdGV4Y29vcmRzLnB1c2goWzAsIDAsIDAsIDEsIDEsIDAsIDEsIDFdKTtcbiAgICogICAgIG5vcm1hbHMucHVzaChbMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMV0pO1xuICAgKiAgICAgaW5kaWNlcy5wdXNoKFswLCAxLCAyLCAxLCAyLCAzXSk7XG4gICAqXG4gICAqICAgICB2YXIgYXJyYXlzID0ge1xuICAgKiAgICAgICAgcG9zaXRpb246IHBvc2l0aW9ucyxcbiAgICogICAgICAgIHRleGNvb3JkOiB0ZXhjb29yZHMsXG4gICAqICAgICAgICBub3JtYWw6ICAgbm9ybWFscyxcbiAgICogICAgICAgIGluZGljZXM6ICBpbmRpY2VzLFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogRm9yIHRoZSBsYXN0IGV4YW1wbGUgaXQgaXMgZXF1aXZhbGVudCB0b1xuICAgKlxuICAgKiAgICAgdmFyIGJ1ZmZlckluZm8gPSB7XG4gICAqICAgICAgIGF0dHJpYnM6IHtcbiAgICogICAgICAgICBhX3Bvc2l0aW9uOiB7IG51bUNvbXBvbmVudHM6IDMsIGJ1ZmZlcjogZ2wuY3JlYXRlQnVmZmVyKCksIH0sXG4gICAqICAgICAgICAgYV90ZXhjb29kczogeyBudW1Db21wb25lbnRzOiAyLCBidWZmZXI6IGdsLmNyZWF0ZUJ1ZmZlcigpLCB9LFxuICAgKiAgICAgICAgIGFfbm9ybWFsczogeyBudW1Db21wb25lbnRzOiAzLCBidWZmZXI6IGdsLmNyZWF0ZUJ1ZmZlcigpLCB9LFxuICAgKiAgICAgICB9LFxuICAgKiAgICAgICBpbmRpY2VzOiBnbC5jcmVhdGVCdWZmZXIoKSxcbiAgICogICAgICAgbnVtRWxlbWVudHM6IDYsXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlckluZm8uYXR0cmlicy5hX3Bvc2l0aW9uLmJ1ZmZlcik7XG4gICAqICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgYXJyYXlzLnBvc2l0aW9uLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAqICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVySW5mby5hdHRyaWJzLmFfdGV4Y29vcmQuYnVmZmVyKTtcbiAgICogICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBhcnJheXMudGV4Y29vcmQsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICogICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXJJbmZvLmF0dHJpYnMuYV9ub3JtYWwuYnVmZmVyKTtcbiAgICogICAgIGdsLmJ1ZmZlckRhdGEoZ2wuQVJSQVlfQlVGRkVSLCBhcnJheXMubm9ybWFsLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAqICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBidWZmZXJJbmZvLmluZGljZXMpO1xuICAgKiAgICAgZ2wuYnVmZmVyRGF0YShnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgYXJyYXlzLmluZGljZXMsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIEEgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuQXJyYXlzfSBhcnJheXMgWW91ciBkYXRhXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IEEgQnVmZmVySW5mb1xuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzKGdsLCBhcnJheXMpIHtcbiAgICB2YXIgYnVmZmVySW5mbyA9IHtcbiAgICAgIGF0dHJpYnM6IGNyZWF0ZUF0dHJpYnNGcm9tQXJyYXlzKGdsLCBhcnJheXMpLFxuICAgIH07XG4gICAgdmFyIGluZGljZXMgPSBhcnJheXMuaW5kaWNlcztcbiAgICBpZiAoaW5kaWNlcykge1xuICAgICAgaW5kaWNlcyA9IG1ha2VUeXBlZEFycmF5KGluZGljZXMsIFwiaW5kaWNlc1wiKTtcbiAgICAgIGJ1ZmZlckluZm8uaW5kaWNlcyA9IGNyZWF0ZUJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCBpbmRpY2VzLCBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUik7XG4gICAgICBidWZmZXJJbmZvLm51bUVsZW1lbnRzID0gaW5kaWNlcy5sZW5ndGg7XG4gICAgICBidWZmZXJJbmZvLmVsZW1lbnRUeXBlID0gKGluZGljZXMgaW5zdGFuY2VvZiBVaW50MzJBcnJheSkgPyAgZ2wuVU5TSUdORURfSU5UIDogZ2wuVU5TSUdORURfU0hPUlQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlckluZm8ubnVtRWxlbWVudHMgPSBnZXROdW1FbGVtZW50c0Zyb21Ob25JbmRleGVkQXJyYXlzKGFycmF5cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZmZlckluZm87XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGJ1ZmZlciBmcm9tIGFuIGFycmF5LCB0eXBlZCBhcnJheSwgb3IgYXJyYXkgc3BlY1xuICAgKlxuICAgKiBHaXZlbiBzb21ldGhpbmcgbGlrZSB0aGlzXG4gICAqXG4gICAqICAgICBbMSwgMiwgM10sXG4gICAqXG4gICAqIG9yXG4gICAqXG4gICAqICAgICBuZXcgVWludDE2QXJyYXkoWzEsMiwzXSk7XG4gICAqXG4gICAqIG9yXG4gICAqXG4gICAqICAgICB7XG4gICAqICAgICAgICBkYXRhOiBbMSwgMiwgM10sXG4gICAqICAgICAgICB0eXBlOiBVaW50OEFycmF5LFxuICAgKiAgICAgfVxuICAgKlxuICAgKiByZXR1cm5zIGEgV2ViR0xCdWZmZXIgdGhhdCBjb25zdGFpbnMgdGhlIGdpdmVuIGRhdGEuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0KSBnbCBBIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5BcnJheVNwZWN9IGFycmF5IGFuIGFycmF5LCB0eXBlZCBhcnJheSwgb3IgYXJyYXkgc3BlYy5cbiAgICogQHBhcmFtIHtzdHJpbmd9IGFycmF5TmFtZSBuYW1lIG9mIGFycmF5LiBVc2VkIHRvIGd1ZXNzIHRoZSB0eXBlIGlmIHR5cGUgY2FuIG5vdCBiZSBkZXJ2aWVkIG90aGVyIHdpc2UuXG4gICAqIEByZXR1cm4ge1dlYkdMQnVmZmVyfSBhIFdlYkdMQnVmZmVyIGNvbnRhaW5pbmcgdGhlIGRhdGEgaW4gYXJyYXkuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQnVmZmVyRnJvbUFycmF5KGdsLCBhcnJheSwgYXJyYXlOYW1lKSB7XG4gICAgdmFyIHR5cGUgPSBhcnJheU5hbWUgPT09IFwiaW5kaWNlc1wiID8gZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIgOiBnbC5BUlJBWV9CVUZGRVI7XG4gICAgdmFyIHR5cGVkQXJyYXkgPSBtYWtlVHlwZWRBcnJheShhcnJheSwgYXJyYXlOYW1lKTtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyRnJvbVR5cGVkQXJyYXkoZ2wsIHR5cGVkQXJyYXksIHR5cGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYnVmZmVycyBmcm9tIGFycmF5cyBvciB0eXBlZCBhcnJheXNcbiAgICpcbiAgICogR2l2ZW4gc29tZXRoaW5nIGxpa2UgdGhpc1xuICAgKlxuICAgKiAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgIHBvc2l0aW9uczogWzEsIDIsIDNdLFxuICAgKiAgICAgICAgbm9ybWFsczogWzAsIDAsIDFdLFxuICAgKiAgICAgfVxuICAgKlxuICAgKiByZXR1cm5zIHNvbWV0aGluZyBsaWtlXG4gICAqXG4gICAqICAgICBidWZmZXJzID0ge1xuICAgKiAgICAgICBwb3NpdGlvbnM6IFdlYkdMQnVmZmVyLFxuICAgKiAgICAgICBub3JtYWxzOiBXZWJHTEJ1ZmZlcixcbiAgICogICAgIH1cbiAgICpcbiAgICogSWYgdGhlIGJ1ZmZlciBpcyBuYW1lZCAnaW5kaWNlcycgaXQgd2lsbCBiZSBtYWRlIGFuIEVMRU1FTlRfQVJSQVlfQlVGRkVSLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dCkgZ2wgQSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuQXJyYXlzfSBhcnJheXNcbiAgICogQHJldHVybiB7T2JqZWN0PHN0cmluZywgV2ViR0xCdWZmZXI+fSByZXR1cm5zIGFuIG9iamVjdCB3aXRoIG9uZSBXZWJHTEJ1ZmZlciBwZXIgYXJyYXlcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVCdWZmZXJzRnJvbUFycmF5cyhnbCwgYXJyYXlzKSB7XG4gICAgdmFyIGJ1ZmZlcnMgPSB7IH07XG4gICAgT2JqZWN0LmtleXMoYXJyYXlzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgYnVmZmVyc1trZXldID0gY3JlYXRlQnVmZmVyRnJvbUFycmF5KGdsLCBhcnJheXNba2V5XSwga2V5KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBidWZmZXJzO1xuICB9XG5cbiAgLy8gVXNpbmcgcXVvdGVzIHByZXZlbnRzIFVnbGlmeSBmcm9tIGNoYW5naW5nIHRoZSBuYW1lcy5cbiAgLy8gTm8gc3BlZWQgZGlmZiBBRkFJQ1QuXG4gIHJldHVybiB7XG4gICAgXCJjcmVhdGVBdHRyaWJzRnJvbUFycmF5c1wiOiBjcmVhdGVBdHRyaWJzRnJvbUFycmF5cyxcbiAgICBcImNyZWF0ZUJ1ZmZlcnNGcm9tQXJyYXlzXCI6IGNyZWF0ZUJ1ZmZlcnNGcm9tQXJyYXlzLFxuICAgIFwiY3JlYXRlQnVmZmVyRnJvbUFycmF5XCI6IGNyZWF0ZUJ1ZmZlckZyb21BcnJheSxcbiAgICBcImNyZWF0ZUJ1ZmZlckZyb21UeXBlZEFycmF5XCI6IGNyZWF0ZUJ1ZmZlckZyb21UeXBlZEFycmF5LFxuICAgIFwiY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXNcIjogY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXMsXG4gICAgXCJzZXRBdHRyaWJJbmZvQnVmZmVyRnJvbUFycmF5XCI6IHNldEF0dHJpYkluZm9CdWZmZXJGcm9tQXJyYXksXG5cbiAgICBcInNldEF0dHJpYnV0ZVByZWZpeFwiOiBzZXRBdHRyaWJ1dGVQcmVmaXgsXG5cbiAgICBcInNldERlZmF1bHRzX1wiOiBzZXREZWZhdWx0cyxcbiAgfTtcblxufSk7XG5cblxuLypcbiAqIENvcHlyaWdodCAyMDE1LCBHcmVnZyBUYXZhcmVzLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmRlZmluZSgndHdnbC9wcm9ncmFtcycsW10sIGZ1bmN0aW9uICgpIHtcbiAgXG5cbiAgdmFyIGVycm9yID1cbiAgICAgICggICAgd2luZG93LmNvbnNvbGVcbiAgICAgICAgJiYgd2luZG93LmNvbnNvbGUuZXJyb3JcbiAgICAgICAgJiYgdHlwZW9mIHdpbmRvdy5jb25zb2xlLmVycm9yID09PSBcImZ1bmN0aW9uXCJcbiAgICAgIClcbiAgICAgID8gd2luZG93LmNvbnNvbGUuZXJyb3IuYmluZCh3aW5kb3cuY29uc29sZSlcbiAgICAgIDogZnVuY3Rpb24oKSB7IH07XG4gIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBzZWUgYSBnbG9iYWwgZ2xcbiAgdmFyIGdsID0gdW5kZWZpbmVkOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gIC8qKlxuICAgKiBFcnJvciBDYWxsYmFja1xuICAgKiBAY2FsbGJhY2sgRXJyb3JDYWxsYmFja1xuICAgKiBAcGFyYW0ge3N0cmluZ30gbXNnIGVycm9yIG1lc3NhZ2UuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICBmdW5jdGlvbiBhZGRMaW5lTnVtYmVycyhzcmMpIHtcbiAgICByZXR1cm4gc3JjLnNwbGl0KFwiXFxuXCIpLm1hcChmdW5jdGlvbihsaW5lLCBuZHgpIHtcbiAgICAgIHJldHVybiAobmR4ICsgMSkgKyBcIjogXCIgKyBsaW5lO1xuICAgIH0pLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgYSBzaGFkZXIuXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0IHRvIHVzZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNoYWRlclNvdXJjZSBUaGUgc2hhZGVyIHNvdXJjZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHNoYWRlclR5cGUgVGhlIHR5cGUgb2Ygc2hhZGVyLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkVycm9yQ2FsbGJhY2t9IG9wdF9lcnJvckNhbGxiYWNrIGNhbGxiYWNrIGZvciBlcnJvcnMuXG4gICAqIEByZXR1cm4ge1dlYkdMU2hhZGVyfSBUaGUgY3JlYXRlZCBzaGFkZXIuXG4gICAqL1xuICBmdW5jdGlvbiBsb2FkU2hhZGVyKGdsLCBzaGFkZXJTb3VyY2UsIHNoYWRlclR5cGUsIG9wdF9lcnJvckNhbGxiYWNrKSB7XG4gICAgdmFyIGVyckZuID0gb3B0X2Vycm9yQ2FsbGJhY2sgfHwgZXJyb3I7XG4gICAgLy8gQ3JlYXRlIHRoZSBzaGFkZXIgb2JqZWN0XG4gICAgdmFyIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihzaGFkZXJUeXBlKTtcblxuICAgIC8vIExvYWQgdGhlIHNoYWRlciBzb3VyY2VcbiAgICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzaGFkZXJTb3VyY2UpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgc2hhZGVyXG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGNvbXBpbGUgc3RhdHVzXG4gICAgdmFyIGNvbXBpbGVkID0gZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpO1xuICAgIGlmICghY29tcGlsZWQpIHtcbiAgICAgIC8vIFNvbWV0aGluZyB3ZW50IHdyb25nIGR1cmluZyBjb21waWxhdGlvbjsgZ2V0IHRoZSBlcnJvclxuICAgICAgdmFyIGxhc3RFcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2coc2hhZGVyKTtcbiAgICAgIGVyckZuKGFkZExpbmVOdW1iZXJzKHNoYWRlclNvdXJjZSkgKyBcIlxcbioqKiBFcnJvciBjb21waWxpbmcgc2hhZGVyOiBcIiArIGxhc3RFcnJvcik7XG4gICAgICBnbC5kZWxldGVTaGFkZXIoc2hhZGVyKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBzaGFkZXI7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHByb2dyYW0sIGF0dGFjaGVzIHNoYWRlcnMsIGJpbmRzIGF0dHJpYiBsb2NhdGlvbnMsIGxpbmtzIHRoZVxuICAgKiBwcm9ncmFtIGFuZCBjYWxscyB1c2VQcm9ncmFtLlxuICAgKiBAcGFyYW0ge1dlYkdMU2hhZGVyW119IHNoYWRlcnMgVGhlIHNoYWRlcnMgdG8gYXR0YWNoXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IFtvcHRfYXR0cmlic10gQW4gYXJyYXkgb2YgYXR0cmlicyBuYW1lcy4gTG9jYXRpb25zIHdpbGwgYmUgYXNzaWduZWQgYnkgaW5kZXggaWYgbm90IHBhc3NlZCBpblxuICAgKiBAcGFyYW0ge251bWJlcltdfSBbb3B0X2xvY2F0aW9uc10gVGhlIGxvY2F0aW9ucyBmb3IgdGhlLiBBIHBhcmFsbGVsIGFycmF5IHRvIG9wdF9hdHRyaWJzIGxldHRpbmcgeW91IGFzc2lnbiBsb2NhdGlvbnMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuRXJyb3JDYWxsYmFja30gW29wdF9lcnJvckNhbGxiYWNrXSBjYWxsYmFjayBmb3IgZXJyb3JzLiBCeSBkZWZhdWx0IGl0IGp1c3QgcHJpbnRzIGFuIGVycm9yIHRvIHRoZSBjb25zb2xlXG4gICAqICAgICAgICBvbiBlcnJvci4gSWYgeW91IHdhbnQgc29tZXRoaW5nIGVsc2UgcGFzcyBhbiBjYWxsYmFjay4gSXQncyBwYXNzZWQgYW4gZXJyb3IgbWVzc2FnZS5cbiAgICogQHJldHVybiB7V2ViR0xQcm9ncmFtP30gdGhlIGNyZWF0ZWQgcHJvZ3JhbSBvciBudWxsIGlmIGVycm9yLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW0oXG4gICAgICBnbCwgc2hhZGVycywgb3B0X2F0dHJpYnMsIG9wdF9sb2NhdGlvbnMsIG9wdF9lcnJvckNhbGxiYWNrKSB7XG4gICAgdmFyIGVyckZuID0gb3B0X2Vycm9yQ2FsbGJhY2sgfHwgZXJyb3I7XG4gICAgdmFyIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgc2hhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHNoYWRlcikge1xuICAgICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHNoYWRlcik7XG4gICAgfSk7XG4gICAgaWYgKG9wdF9hdHRyaWJzKSB7XG4gICAgICBvcHRfYXR0cmlicy5mb3JFYWNoKGZ1bmN0aW9uKGF0dHJpYiwgIG5keCkge1xuICAgICAgICBnbC5iaW5kQXR0cmliTG9jYXRpb24oXG4gICAgICAgICAgICBwcm9ncmFtLFxuICAgICAgICAgICAgb3B0X2xvY2F0aW9ucyA/IG9wdF9sb2NhdGlvbnNbbmR4XSA6IG5keCxcbiAgICAgICAgICAgIGF0dHJpYik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG5cbiAgICAvLyBDaGVjayB0aGUgbGluayBzdGF0dXNcbiAgICB2YXIgbGlua2VkID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUyk7XG4gICAgaWYgKCFsaW5rZWQpIHtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3Jvbmcgd2l0aCB0aGUgbGlua1xuICAgICAgICB2YXIgbGFzdEVycm9yID0gZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSk7XG4gICAgICAgIGVyckZuKFwiRXJyb3IgaW4gcHJvZ3JhbSBsaW5raW5nOlwiICsgbGFzdEVycm9yKTtcblxuICAgICAgICBnbC5kZWxldGVQcm9ncmFtKHByb2dyYW0pO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHByb2dyYW07XG4gIH1cblxuICAvKipcbiAgICogTG9hZHMgYSBzaGFkZXIgZnJvbSBhIHNjcmlwdCB0YWcuXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0IHRvIHVzZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHNjcmlwdElkIFRoZSBpZCBvZiB0aGUgc2NyaXB0IHRhZy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRfc2hhZGVyVHlwZV0gVGhlIHR5cGUgb2Ygc2hhZGVyLiBJZiBub3QgcGFzc2VkIGluIGl0IHdpbGxcbiAgICogICAgIGJlIGRlcml2ZWQgZnJvbSB0aGUgdHlwZSBvZiB0aGUgc2NyaXB0IHRhZy5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5FcnJvckNhbGxiYWNrfSBbb3B0X2Vycm9yQ2FsbGJhY2tdIGNhbGxiYWNrIGZvciBlcnJvcnMuXG4gICAqIEByZXR1cm4ge1dlYkdMU2hhZGVyP30gVGhlIGNyZWF0ZWQgc2hhZGVyIG9yIG51bGwgaWYgZXJyb3IuXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVTaGFkZXJGcm9tU2NyaXB0KFxuICAgICAgZ2wsIHNjcmlwdElkLCBvcHRfc2hhZGVyVHlwZSwgb3B0X2Vycm9yQ2FsbGJhY2spIHtcbiAgICB2YXIgc2hhZGVyU291cmNlID0gXCJcIjtcbiAgICB2YXIgc2hhZGVyVHlwZTtcbiAgICB2YXIgc2hhZGVyU2NyaXB0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2NyaXB0SWQpO1xuICAgIGlmICghc2hhZGVyU2NyaXB0KSB7XG4gICAgICB0aHJvdyBcIioqKiBFcnJvcjogdW5rbm93biBzY3JpcHQgZWxlbWVudFwiICsgc2NyaXB0SWQ7XG4gICAgfVxuICAgIHNoYWRlclNvdXJjZSA9IHNoYWRlclNjcmlwdC50ZXh0O1xuXG4gICAgaWYgKCFvcHRfc2hhZGVyVHlwZSkge1xuICAgICAgaWYgKHNoYWRlclNjcmlwdC50eXBlID09PSBcIngtc2hhZGVyL3gtdmVydGV4XCIpIHtcbiAgICAgICAgc2hhZGVyVHlwZSA9IGdsLlZFUlRFWF9TSEFERVI7XG4gICAgICB9IGVsc2UgaWYgKHNoYWRlclNjcmlwdC50eXBlID09PSBcIngtc2hhZGVyL3gtZnJhZ21lbnRcIikge1xuICAgICAgICBzaGFkZXJUeXBlID0gZ2wuRlJBR01FTlRfU0hBREVSO1xuICAgICAgfSBlbHNlIGlmIChzaGFkZXJUeXBlICE9PSBnbC5WRVJURVhfU0hBREVSICYmIHNoYWRlclR5cGUgIT09IGdsLkZSQUdNRU5UX1NIQURFUikge1xuICAgICAgICB0aHJvdyBcIioqKiBFcnJvcjogdW5rbm93biBzaGFkZXIgdHlwZVwiO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsb2FkU2hhZGVyKFxuICAgICAgICBnbCwgc2hhZGVyU291cmNlLCBvcHRfc2hhZGVyVHlwZSA/IG9wdF9zaGFkZXJUeXBlIDogc2hhZGVyVHlwZSxcbiAgICAgICAgb3B0X2Vycm9yQ2FsbGJhY2spO1xuICB9XG5cbiAgdmFyIGRlZmF1bHRTaGFkZXJUeXBlID0gW1xuICAgIFwiVkVSVEVYX1NIQURFUlwiLFxuICAgIFwiRlJBR01FTlRfU0hBREVSXCIsXG4gIF07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBwcm9ncmFtIGZyb20gMiBzY3JpcHQgdGFncy5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogICAgICAgIHRvIHVzZS5cbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gc2hhZGVyU2NyaXB0SWRzIEFycmF5IG9mIGlkcyBvZiB0aGUgc2NyaXB0XG4gICAqICAgICAgICB0YWdzIGZvciB0aGUgc2hhZGVycy4gVGhlIGZpcnN0IGlzIGFzc3VtZWQgdG8gYmUgdGhlXG4gICAqICAgICAgICB2ZXJ0ZXggc2hhZGVyLCB0aGUgc2Vjb25kIHRoZSBmcmFnbWVudCBzaGFkZXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IFtvcHRfYXR0cmlic10gQW4gYXJyYXkgb2YgYXR0cmlicyBuYW1lcy4gTG9jYXRpb25zIHdpbGwgYmUgYXNzaWduZWQgYnkgaW5kZXggaWYgbm90IHBhc3NlZCBpblxuICAgKiBAcGFyYW0ge251bWJlcltdfSBbb3B0X2xvY2F0aW9uc10gVGhlIGxvY2F0aW9ucyBmb3IgdGhlLiBBIHBhcmFsbGVsIGFycmF5IHRvIG9wdF9hdHRyaWJzIGxldHRpbmcgeW91IGFzc2lnbiBsb2NhdGlvbnMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuRXJyb3JDYWxsYmFja30gb3B0X2Vycm9yQ2FsbGJhY2sgY2FsbGJhY2sgZm9yIGVycm9ycy4gQnkgZGVmYXVsdCBpdCBqdXN0IHByaW50cyBhbiBlcnJvciB0byB0aGUgY29uc29sZVxuICAgKiAgICAgICAgb24gZXJyb3IuIElmIHlvdSB3YW50IHNvbWV0aGluZyBlbHNlIHBhc3MgYW4gY2FsbGJhY2suIEl0J3MgcGFzc2VkIGFuIGVycm9yIG1lc3NhZ2UuXG4gICAqIEByZXR1cm4ge1dlYkdMUHJvZ3JhbX0gVGhlIGNyZWF0ZWQgcHJvZ3JhbS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVQcm9ncmFtRnJvbVNjcmlwdHMoXG4gICAgICBnbCwgc2hhZGVyU2NyaXB0SWRzLCBvcHRfYXR0cmlicywgb3B0X2xvY2F0aW9ucywgb3B0X2Vycm9yQ2FsbGJhY2spIHtcbiAgICB2YXIgc2hhZGVycyA9IFtdO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBzaGFkZXJTY3JpcHRJZHMubGVuZ3RoOyArK2lpKSB7XG4gICAgICB2YXIgc2hhZGVyID0gY3JlYXRlU2hhZGVyRnJvbVNjcmlwdChcbiAgICAgICAgICBnbCwgc2hhZGVyU2NyaXB0SWRzW2lpXSwgZ2xbZGVmYXVsdFNoYWRlclR5cGVbaWldXSwgb3B0X2Vycm9yQ2FsbGJhY2spO1xuICAgICAgaWYgKCFzaGFkZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBzaGFkZXJzLnB1c2goc2hhZGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVByb2dyYW0oZ2wsIHNoYWRlcnMsIG9wdF9hdHRyaWJzLCBvcHRfbG9jYXRpb25zLCBvcHRfZXJyb3JDYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHByb2dyYW0gZnJvbSAyIHNvdXJjZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqICAgICAgICB0byB1c2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHNoYWRlclNvdXJjZXNzIEFycmF5IG9mIHNvdXJjZXMgZm9yIHRoZVxuICAgKiAgICAgICAgc2hhZGVycy4gVGhlIGZpcnN0IGlzIGFzc3VtZWQgdG8gYmUgdGhlIHZlcnRleCBzaGFkZXIsXG4gICAqICAgICAgICB0aGUgc2Vjb25kIHRoZSBmcmFnbWVudCBzaGFkZXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IFtvcHRfYXR0cmlic10gQW4gYXJyYXkgb2YgYXR0cmlicyBuYW1lcy4gTG9jYXRpb25zIHdpbGwgYmUgYXNzaWduZWQgYnkgaW5kZXggaWYgbm90IHBhc3NlZCBpblxuICAgKiBAcGFyYW0ge251bWJlcltdfSBbb3B0X2xvY2F0aW9uc10gVGhlIGxvY2F0aW9ucyBmb3IgdGhlLiBBIHBhcmFsbGVsIGFycmF5IHRvIG9wdF9hdHRyaWJzIGxldHRpbmcgeW91IGFzc2lnbiBsb2NhdGlvbnMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuRXJyb3JDYWxsYmFja30gb3B0X2Vycm9yQ2FsbGJhY2sgY2FsbGJhY2sgZm9yIGVycm9ycy4gQnkgZGVmYXVsdCBpdCBqdXN0IHByaW50cyBhbiBlcnJvciB0byB0aGUgY29uc29sZVxuICAgKiAgICAgICAgb24gZXJyb3IuIElmIHlvdSB3YW50IHNvbWV0aGluZyBlbHNlIHBhc3MgYW4gY2FsbGJhY2suIEl0J3MgcGFzc2VkIGFuIGVycm9yIG1lc3NhZ2UuXG4gICAqIEByZXR1cm4ge1dlYkdMUHJvZ3JhbX0gVGhlIGNyZWF0ZWQgcHJvZ3JhbS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVQcm9ncmFtRnJvbVNvdXJjZXMoXG4gICAgICBnbCwgc2hhZGVyU291cmNlcywgb3B0X2F0dHJpYnMsIG9wdF9sb2NhdGlvbnMsIG9wdF9lcnJvckNhbGxiYWNrKSB7XG4gICAgdmFyIHNoYWRlcnMgPSBbXTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgc2hhZGVyU291cmNlcy5sZW5ndGg7ICsraWkpIHtcbiAgICAgIHZhciBzaGFkZXIgPSBsb2FkU2hhZGVyKFxuICAgICAgICAgIGdsLCBzaGFkZXJTb3VyY2VzW2lpXSwgZ2xbZGVmYXVsdFNoYWRlclR5cGVbaWldXSwgb3B0X2Vycm9yQ2FsbGJhY2spO1xuICAgICAgaWYgKCFzaGFkZXIpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBzaGFkZXJzLnB1c2goc2hhZGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVByb2dyYW0oZ2wsIHNoYWRlcnMsIG9wdF9hdHRyaWJzLCBvcHRfbG9jYXRpb25zLCBvcHRfZXJyb3JDYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBiaW5kIHBvaW50IGZvciBhIGdpdmVuIHNhbXBsZXIgdHlwZVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0QmluZFBvaW50Rm9yU2FtcGxlclR5cGUoZ2wsIHR5cGUpIHtcbiAgICBpZiAodHlwZSA9PT0gZ2wuU0FNUExFUl8yRCkge1xuICAgICAgcmV0dXJuIGdsLlRFWFRVUkVfMkQ7XG4gICAgfVxuICAgIGlmICh0eXBlID09PSBnbC5TQU1QTEVSX0NVQkUpIHtcbiAgICAgIHJldHVybiBnbC5URVhUVVJFX0NVQkVfTUFQO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0LjxzdHJpbmcsZnVuY3Rpb24+fSBTZXR0ZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHNldHRlciBmdW5jdGlvbnMgZm9yIGFsbCB1bmlmb3JtcyBvZiBhIHNoYWRlclxuICAgKiBwcm9ncmFtLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayBtb2R1bGU6dHdnbC5zZXRVbmlmb3Jtc31cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFByb2dyYW19IHByb2dyYW0gdGhlIHByb2dyYW0gdG8gY3JlYXRlIHNldHRlcnMgZm9yLlxuICAgKiBAcmV0dXJucyB7T2JqZWN0LjxzdHJpbmcsIGZ1bmN0aW9uPn0gYW4gb2JqZWN0IHdpdGggYSBzZXR0ZXIgYnkgbmFtZSBmb3IgZWFjaCB1bmlmb3JtXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlVW5pZm9ybVNldHRlcnMoZ2wsIHByb2dyYW0pIHtcbiAgICB2YXIgdGV4dHVyZVVuaXQgPSAwO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNldHRlciBmb3IgYSB1bmlmb3JtIG9mIHRoZSBnaXZlbiBwcm9ncmFtIHdpdGggaXQnc1xuICAgICAqIGxvY2F0aW9uIGVtYmVkZGVkIGluIHRoZSBzZXR0ZXIuXG4gICAgICogQHBhcmFtIHtXZWJHTFByb2dyYW19IHByb2dyYW1cbiAgICAgKiBAcGFyYW0ge1dlYkdMVW5pZm9ybUluZm99IHVuaWZvcm1JbmZvXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9ufSB0aGUgY3JlYXRlZCBzZXR0ZXIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlVW5pZm9ybVNldHRlcihwcm9ncmFtLCB1bmlmb3JtSW5mbykge1xuICAgICAgdmFyIGxvY2F0aW9uID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIHVuaWZvcm1JbmZvLm5hbWUpO1xuICAgICAgdmFyIHR5cGUgPSB1bmlmb3JtSW5mby50eXBlO1xuICAgICAgLy8gQ2hlY2sgaWYgdGhpcyB1bmlmb3JtIGlzIGFuIGFycmF5XG4gICAgICB2YXIgaXNBcnJheSA9ICh1bmlmb3JtSW5mby5zaXplID4gMSAmJiB1bmlmb3JtSW5mby5uYW1lLnN1YnN0cigtMykgPT09IFwiWzBdXCIpO1xuICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUICYmIGlzQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtMWZ2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5GTE9BVCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm0xZihsb2NhdGlvbiwgdik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVRfVkVDMikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm0yZnYobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUX1ZFQzMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtM2Z2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5GTE9BVF9WRUM0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybTRmdihsb2NhdGlvbiwgdik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuSU5UICYmIGlzQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtMWl2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5JTlQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtMWkobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLklOVF9WRUMyKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybTJpdihsb2NhdGlvbiwgdik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuSU5UX1ZFQzMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtM2l2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5JTlRfVkVDNCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm00aXYobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLkJPT0wgJiYgaXNBcnJheSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm0xaXYobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLkJPT0wpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtMWkobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLkJPT0xfVkVDMikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm0yaXYobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLkJPT0xfVkVDMykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm0zaXYobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLkJPT0xfVkVDNCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm00aXYobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUX01BVDIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtTWF0cml4MmZ2KGxvY2F0aW9uLCBmYWxzZSwgdik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVRfTUFUMykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm1NYXRyaXgzZnYobG9jYXRpb24sIGZhbHNlLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5GTE9BVF9NQVQ0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihsb2NhdGlvbiwgZmFsc2UsIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCh0eXBlID09PSBnbC5TQU1QTEVSXzJEIHx8IHR5cGUgPT09IGdsLlNBTVBMRVJfQ1VCRSkgJiYgaXNBcnJheSkge1xuICAgICAgICB2YXIgdW5pdHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHVuaWZvcm1JbmZvLnNpemU7ICsraWkpIHtcbiAgICAgICAgICB1bml0cy5wdXNoKHRleHR1cmVVbml0KyspO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihiaW5kUG9pbnQsIHVuaXRzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRleHR1cmVzKSB7XG4gICAgICAgICAgICBnbC51bmlmb3JtMWl2KGxvY2F0aW9uLCB1bml0cyk7XG4gICAgICAgICAgICB0ZXh0dXJlcy5mb3JFYWNoKGZ1bmN0aW9uKHRleHR1cmUsIGluZGV4KSB7XG4gICAgICAgICAgICAgIGdsLmFjdGl2ZVRleHR1cmUoZ2wuVEVYVFVSRTAgKyB1bml0c1tpbmRleF0pO1xuICAgICAgICAgICAgICBnbC5iaW5kVGV4dHVyZShiaW5kUG9pbnQsIHRleHR1cmUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfShnZXRCaW5kUG9pbnRGb3JTYW1wbGVyVHlwZShnbCwgdHlwZSksIHVuaXRzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5TQU1QTEVSXzJEIHx8IHR5cGUgPT09IGdsLlNBTVBMRVJfQ1VCRSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYmluZFBvaW50LCB1bml0KSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHRleHR1cmUpIHtcbiAgICAgICAgICAgIGdsLnVuaWZvcm0xaShsb2NhdGlvbiwgdW5pdCk7XG4gICAgICAgICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgdW5pdCk7XG4gICAgICAgICAgICBnbC5iaW5kVGV4dHVyZShiaW5kUG9pbnQsIHRleHR1cmUpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0oZ2V0QmluZFBvaW50Rm9yU2FtcGxlclR5cGUoZ2wsIHR5cGUpLCB0ZXh0dXJlVW5pdCsrKTtcbiAgICAgIH1cbiAgICAgIHRocm93IChcInVua25vd24gdHlwZTogMHhcIiArIHR5cGUudG9TdHJpbmcoMTYpKTsgLy8gd2Ugc2hvdWxkIG5ldmVyIGdldCBoZXJlLlxuICAgIH1cblxuICAgIHZhciB1bmlmb3JtU2V0dGVycyA9IHsgfTtcbiAgICB2YXIgbnVtVW5pZm9ybXMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkFDVElWRV9VTklGT1JNUyk7XG5cbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtVW5pZm9ybXM7ICsraWkpIHtcbiAgICAgIHZhciB1bmlmb3JtSW5mbyA9IGdsLmdldEFjdGl2ZVVuaWZvcm0ocHJvZ3JhbSwgaWkpO1xuICAgICAgaWYgKCF1bmlmb3JtSW5mbykge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHZhciBuYW1lID0gdW5pZm9ybUluZm8ubmFtZTtcbiAgICAgIC8vIHJlbW92ZSB0aGUgYXJyYXkgc3VmZml4LlxuICAgICAgaWYgKG5hbWUuc3Vic3RyKC0zKSA9PT0gXCJbMF1cIikge1xuICAgICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMCwgbmFtZS5sZW5ndGggLSAzKTtcbiAgICAgIH1cbiAgICAgIHZhciBzZXR0ZXIgPSBjcmVhdGVVbmlmb3JtU2V0dGVyKHByb2dyYW0sIHVuaWZvcm1JbmZvKTtcbiAgICAgIHVuaWZvcm1TZXR0ZXJzW25hbWVdID0gc2V0dGVyO1xuICAgIH1cbiAgICByZXR1cm4gdW5pZm9ybVNldHRlcnM7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHVuaWZvcm1zIGFuZCBiaW5kcyByZWxhdGVkIHRleHR1cmVzLlxuICAgKlxuICAgKiBleGFtcGxlOlxuICAgKlxuICAgKiAgICAgdmFyIHByb2dyYW1JbmZvID0gY3JlYXRlUHJvZ3JhbUluZm8oXG4gICAqICAgICAgICAgZ2wsIFtcInNvbWUtdnNcIiwgXCJzb21lLWZzXCIpO1xuICAgKlxuICAgKiAgICAgdmFyIHRleDEgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAqICAgICB2YXIgdGV4MiA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcbiAgICpcbiAgICogICAgIC4uLiBhc3N1bWUgd2Ugc2V0dXAgdGhlIHRleHR1cmVzIHdpdGggZGF0YSAuLi5cbiAgICpcbiAgICogICAgIHZhciB1bmlmb3JtcyA9IHtcbiAgICogICAgICAgdV9zb21lU2FtcGxlcjogdGV4MSxcbiAgICogICAgICAgdV9zb21lT3RoZXJTYW1wbGVyOiB0ZXgyLFxuICAgKiAgICAgICB1X3NvbWVDb2xvcjogWzEsMCwwLDFdLFxuICAgKiAgICAgICB1X3NvbWVQb3NpdGlvbjogWzAsMSwxXSxcbiAgICogICAgICAgdV9zb21lTWF0cml4OiBbXG4gICAqICAgICAgICAgMSwwLDAsMCxcbiAgICogICAgICAgICAwLDEsMCwwLFxuICAgKiAgICAgICAgIDAsMCwxLDAsXG4gICAqICAgICAgICAgMCwwLDAsMCxcbiAgICogICAgICAgXSxcbiAgICogICAgIH07XG4gICAqXG4gICAqICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xuICAgKlxuICAgKiBUaGlzIHdpbGwgYXV0b21hdGljYWxseSBiaW5kIHRoZSB0ZXh0dXJlcyBBTkQgc2V0IHRoZVxuICAgKiB1bmlmb3Jtcy5cbiAgICpcbiAgICogICAgIHNldFVuaWZvcm1zKHByb2dyYW1JbmZvLCB1bmlmb3Jtcyk7XG4gICAqXG4gICAqIEZvciB0aGUgZXhhbXBsZSBhYm92ZSBpdCBpcyBlcXVpdmFsZW50IHRvXG4gICAqXG4gICAqICAgICB2YXIgdGV4VW5pdCA9IDA7XG4gICAqICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgdGV4VW5pdCk7XG4gICAqICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXgxKTtcbiAgICogICAgIGdsLnVuaWZvcm0xaSh1X3NvbWVTYW1wbGVyTG9jYXRpb24sIHRleFVuaXQrKyk7XG4gICAqICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgdGV4VW5pdCk7XG4gICAqICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXgyKTtcbiAgICogICAgIGdsLnVuaWZvcm0xaSh1X3NvbWVTYW1wbGVyTG9jYXRpb24sIHRleFVuaXQrKyk7XG4gICAqICAgICBnbC51bmlmb3JtNGZ2KHVfc29tZUNvbG9yTG9jYXRpb24sIFsxLCAwLCAwLCAxXSk7XG4gICAqICAgICBnbC51bmlmb3JtM2Z2KHVfc29tZVBvc2l0aW9uTG9jYXRpb24sIFswLCAxLCAxXSk7XG4gICAqICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KHVfc29tZU1hdHJpeCwgZmFsc2UsIFtcbiAgICogICAgICAgICAxLDAsMCwwLFxuICAgKiAgICAgICAgIDAsMSwwLDAsXG4gICAqICAgICAgICAgMCwwLDEsMCxcbiAgICogICAgICAgICAwLDAsMCwwLFxuICAgKiAgICAgICBdKTtcbiAgICpcbiAgICogTm90ZSBpdCBpcyBwZXJmZWN0bHkgcmVhc29uYWJsZSB0byBjYWxsIGBzZXRVbmlmb3Jtc2AgbXVsdGlwbGUgdGltZXMuIEZvciBleGFtcGxlXG4gICAqXG4gICAqICAgICB2YXIgdW5pZm9ybXMgPSB7XG4gICAqICAgICAgIHVfc29tZVNhbXBsZXI6IHRleDEsXG4gICAqICAgICAgIHVfc29tZU90aGVyU2FtcGxlcjogdGV4MixcbiAgICogICAgIH07XG4gICAqXG4gICAqICAgICB2YXIgbW9yZVVuaWZvcm1zIHtcbiAgICogICAgICAgdV9zb21lQ29sb3I6IFsxLDAsMCwxXSxcbiAgICogICAgICAgdV9zb21lUG9zaXRpb246IFswLDEsMV0sXG4gICAqICAgICAgIHVfc29tZU1hdHJpeDogW1xuICAgKiAgICAgICAgIDEsMCwwLDAsXG4gICAqICAgICAgICAgMCwxLDAsMCxcbiAgICogICAgICAgICAwLDAsMSwwLFxuICAgKiAgICAgICAgIDAsMCwwLDAsXG4gICAqICAgICAgIF0sXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgICAgc2V0VW5pZm9ybXMocHJvZ3JhbUluZm8sIHVuaWZvcm1zKTtcbiAgICogICAgIHNldFVuaWZvcm1zKHByb2dyYW1JbmZvLCBtb3JlVW5pZm9ybXMpO1xuICAgKlxuICAgKiBAcGFyYW0geyhtb2R1bGU6dHdnbC5Qcm9ncmFtSW5mb3xPYmplY3QuPHN0cmluZywgZnVuY3Rpb24+KX0gc2V0dGVycyBhIGBQcm9ncmFtSW5mb2AgYXMgcmV0dXJuZWQgZnJvbSBgY3JlYXRlUHJvZ3JhbUluZm9gIG9yIHRoZSBzZXR0ZXJzIHJldHVybmVkIGZyb21cbiAgICogICAgICAgIGBjcmVhdGVVbmlmb3JtU2V0dGVyc2AuXG4gICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsID8+fSB2YWx1ZXMgYW4gb2JqZWN0IHdpdGggdmFsdWVzIGZvciB0aGVcbiAgICogICAgICAgIHVuaWZvcm1zLlxuICAgKiAgIFlvdSBjYW4gcGFzcyBtdWx0aXBsZSBvYmplY3RzIGJ5IHB1dHRpbmcgdGhlbSBpbiBhbiBhcnJheSBvciBieSBjYWxsaW5nIHdpdGggbW9yZSBhcmd1bWVudHMuRm9yIGV4YW1wbGVcbiAgICpcbiAgICogICAgIHZhciBzaGFyZWRVbmlmb3JtcyA9IHtcbiAgICogICAgICAgdV9mb2dOZWFyOiAxMCxcbiAgICogICAgICAgdV9wcm9qZWN0aW9uOiAuLi5cbiAgICogICAgICAgLi4uXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgICAgdmFyIGxvY2FsVW5pZm9ybXMgPSB7XG4gICAqICAgICAgIHVfd29ybGQ6IC4uLlxuICAgKiAgICAgICB1X2RpZmZ1c2VDb2xvcjogLi4uXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgICAgdHdnbC5zZXRVbmlmb3Jtcyhwcm9ncmFtSW5mbywgc2hhcmVkVW5pZm9ybXMsIGxvY2FsVW5pZm9ybXMpO1xuICAgKlxuICAgKiAgICAgLy8gaXMgdGhlIHNhbWUgYXNcbiAgICpcbiAgICogICAgIHR3Z2wuc2V0VW5pZm9ybXMocHJvZ3JhbUluZm8sIFtzaGFyZWRVbmlmb3JtcywgbG9jYWxVbmlmb3Jtc10pO1xuICAgKlxuICAgKiAgICAgLy8gaXMgdGhlIHNhbWUgYXNcbiAgICpcbiAgICogICAgIHR3Z2wuc2V0VW5pZm9ybXMocHJvZ3JhbUluZm8sIHNoYXJlZFVuaWZvcm1zKTtcbiAgICogICAgIHR3Z2wuc2V0VW5pZm9ybXMocHJvZ3JhbUluZm8sIGxvY2FsVW5pZm9ybXN9O1xuICAgKlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIHNldFVuaWZvcm1zKHNldHRlcnMsIHZhbHVlcykgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIHZhciBhY3R1YWxTZXR0ZXJzID0gc2V0dGVycy51bmlmb3JtU2V0dGVycyB8fCBzZXR0ZXJzO1xuICAgIHZhciBudW1BcmdzID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBhbmR4ID0gMTsgYW5keCA8IG51bUFyZ3M7ICsrYW5keCkge1xuICAgICAgdmFyIHZhbHMgPSBhcmd1bWVudHNbYW5keF07XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWxzKSkge1xuICAgICAgICB2YXIgbnVtVmFsdWVzID0gdmFscy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1WYWx1ZXM7ICsraWkpIHtcbiAgICAgICAgICBzZXRVbmlmb3JtcyhhY3R1YWxTZXR0ZXJzLCB2YWxzW2lpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFscykge1xuICAgICAgICAgIHZhciBzZXR0ZXIgPSBhY3R1YWxTZXR0ZXJzW25hbWVdO1xuICAgICAgICAgIGlmIChzZXR0ZXIpIHtcbiAgICAgICAgICAgIHNldHRlcih2YWxzW25hbWVdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBzZXR0ZXIgZnVuY3Rpb25zIGZvciBhbGwgYXR0cmlidXRlcyBvZiBhIHNoYWRlclxuICAgKiBwcm9ncmFtLiBZb3UgY2FuIHBhc3MgdGhpcyB0byB7QGxpbmsgbW9kdWxlOnR3Z2wuc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXN9IHRvIHNldCBhbGwgeW91ciBidWZmZXJzIGFuZCBhdHRyaWJ1dGVzLlxuICAgKlxuICAgKiBAc2VlIHtAbGluayBtb2R1bGU6dHdnbC5zZXRBdHRyaWJ1dGVzfSBmb3IgZXhhbXBsZVxuICAgKiBAcGFyYW0ge1dlYkdMUHJvZ3JhbX0gcHJvZ3JhbSB0aGUgcHJvZ3JhbSB0byBjcmVhdGUgc2V0dGVycyBmb3IuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBmdW5jdGlvbj59IGFuIG9iamVjdCB3aXRoIGEgc2V0dGVyIGZvciBlYWNoIGF0dHJpYnV0ZSBieSBuYW1lLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYnV0ZVNldHRlcnMoZ2wsIHByb2dyYW0pIHtcbiAgICB2YXIgYXR0cmliU2V0dGVycyA9IHtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlQXR0cmliU2V0dGVyKGluZGV4KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oYikge1xuICAgICAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBiLmJ1ZmZlcik7XG4gICAgICAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoaW5kZXgpO1xuICAgICAgICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoXG4gICAgICAgICAgICAgIGluZGV4LCBiLm51bUNvbXBvbmVudHMgfHwgYi5zaXplLCBiLnR5cGUgfHwgZ2wuRkxPQVQsIGIubm9ybWFsaXplIHx8IGZhbHNlLCBiLnN0cmlkZSB8fCAwLCBiLm9mZnNldCB8fCAwKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgbnVtQXR0cmlicyA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuQUNUSVZFX0FUVFJJQlVURVMpO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1BdHRyaWJzOyArK2lpKSB7XG4gICAgICB2YXIgYXR0cmliSW5mbyA9IGdsLmdldEFjdGl2ZUF0dHJpYihwcm9ncmFtLCBpaSk7XG4gICAgICBpZiAoIWF0dHJpYkluZm8pIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB2YXIgaW5kZXggPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBhdHRyaWJJbmZvLm5hbWUpO1xuICAgICAgYXR0cmliU2V0dGVyc1thdHRyaWJJbmZvLm5hbWVdID0gY3JlYXRlQXR0cmliU2V0dGVyKGluZGV4KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0cmliU2V0dGVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGF0dHJpYnV0ZXMgYW5kIGJpbmRzIGJ1ZmZlcnMgKGRlcHJlY2F0ZWQuLi4gdXNlIHtAbGluayBtb2R1bGU6dHdnbC5zZXRCdWZmZXJzQW5kQXR0cmlidXRlc30pXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqXG4gICAqICAgICB2YXIgcHJvZ3JhbSA9IGNyZWF0ZVByb2dyYW1Gcm9tU2NyaXB0cyhcbiAgICogICAgICAgICBnbCwgW1wic29tZS12c1wiLCBcInNvbWUtZnNcIik7XG4gICAqXG4gICAqICAgICB2YXIgYXR0cmliU2V0dGVycyA9IGNyZWF0ZUF0dHJpYnV0ZVNldHRlcnMocHJvZ3JhbSk7XG4gICAqXG4gICAqICAgICB2YXIgcG9zaXRpb25CdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICogICAgIHZhciB0ZXhjb29yZEJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgKlxuICAgKiAgICAgdmFyIGF0dHJpYnMgPSB7XG4gICAqICAgICAgIGFfcG9zaXRpb246IHtidWZmZXI6IHBvc2l0aW9uQnVmZmVyLCBudW1Db21wb25lbnRzOiAzfSxcbiAgICogICAgICAgYV90ZXhjb29yZDoge2J1ZmZlcjogdGV4Y29vcmRCdWZmZXIsIG51bUNvbXBvbmVudHM6IDJ9LFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XG4gICAqXG4gICAqIFRoaXMgd2lsbCBhdXRvbWF0aWNhbGx5IGJpbmQgdGhlIGJ1ZmZlcnMgQU5EIHNldCB0aGVcbiAgICogYXR0cmlidXRlcy5cbiAgICpcbiAgICogICAgIHNldEF0dHJpYnV0ZXMoYXR0cmliU2V0dGVycywgYXR0cmlicyk7XG4gICAqXG4gICAqIFByb3BlcnRpZXMgb2YgYXR0cmlicy4gRm9yIGVhY2ggYXR0cmliIHlvdSBjYW4gYWRkXG4gICAqIHByb3BlcnRpZXM6XG4gICAqXG4gICAqICogICB0eXBlOiB0aGUgdHlwZSBvZiBkYXRhIGluIHRoZSBidWZmZXIuIERlZmF1bHQgPSBnbC5GTE9BVFxuICAgKiAqICAgbm9ybWFsaXplOiB3aGV0aGVyIG9yIG5vdCB0byBub3JtYWxpemUgdGhlIGRhdGEuIERlZmF1bHQgPSBmYWxzZVxuICAgKiAqICAgc3RyaWRlOiB0aGUgc3RyaWRlLiBEZWZhdWx0ID0gMFxuICAgKiAqICAgb2Zmc2V0OiBvZmZzZXQgaW50byB0aGUgYnVmZmVyLiBEZWZhdWx0ID0gMFxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSBpZiB5b3UgaGFkIDMgdmFsdWUgZmxvYXQgcG9zaXRpb25zLCAyIHZhbHVlXG4gICAqIGZsb2F0IHRleGNvb3JkIGFuZCA0IHZhbHVlIHVpbnQ4IGNvbG9ycyB5b3UnZCBzZXR1cCB5b3VyXG4gICAqIGF0dHJpYnMgbGlrZSB0aGlzXG4gICAqXG4gICAqICAgICB2YXIgYXR0cmlicyA9IHtcbiAgICogICAgICAgYV9wb3NpdGlvbjoge2J1ZmZlcjogcG9zaXRpb25CdWZmZXIsIG51bUNvbXBvbmVudHM6IDN9LFxuICAgKiAgICAgICBhX3RleGNvb3JkOiB7YnVmZmVyOiB0ZXhjb29yZEJ1ZmZlciwgbnVtQ29tcG9uZW50czogMn0sXG4gICAqICAgICAgIGFfY29sb3I6IHtcbiAgICogICAgICAgICBidWZmZXI6IGNvbG9yQnVmZmVyLFxuICAgKiAgICAgICAgIG51bUNvbXBvbmVudHM6IDQsXG4gICAqICAgICAgICAgdHlwZTogZ2wuVU5TSUdORURfQllURSxcbiAgICogICAgICAgICBub3JtYWxpemU6IHRydWUsXG4gICAqICAgICAgIH0sXG4gICAqICAgICB9O1xuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCBmdW5jdGlvbj59IHNldHRlcnMgQXR0cmlidXRlIHNldHRlcnMgYXMgcmV0dXJuZWQgZnJvbSBjcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzXG4gICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIG1vZHVsZTp0d2dsLkF0dHJpYkluZm8+fSBidWZmZXJzIEF0dHJpYkluZm9zIG1hcHBlZCBieSBhdHRyaWJ1dGUgbmFtZS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqIEBkZXByZWNhdGVkIHVzZSB7QGxpbmsgbW9kdWxlOnR3Z2wuc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXN9XG4gICAqL1xuICBmdW5jdGlvbiBzZXRBdHRyaWJ1dGVzKHNldHRlcnMsIGJ1ZmZlcnMpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIGJ1ZmZlcnMpIHtcbiAgICAgIHZhciBzZXR0ZXIgPSBzZXR0ZXJzW25hbWVdO1xuICAgICAgaWYgKHNldHRlcikge1xuICAgICAgICBzZXR0ZXIoYnVmZmVyc1tuYW1lXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYXR0cmlidXRlcyBhbmQgYnVmZmVycyBpbmNsdWRpbmcgdGhlIGBFTEVNRU5UX0FSUkFZX0JVRkZFUmAgaWYgYXBwcm9wcmlhdGVcbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICpcbiAgICogICAgIHZhciBwcm9ncmFtSW5mbyA9IGNyZWF0ZVByb2dyYW1JbmZvKFxuICAgKiAgICAgICAgIGdsLCBbXCJzb21lLXZzXCIsIFwic29tZS1mc1wiKTtcbiAgICpcbiAgICogICAgIHZhciBhcnJheXMgPSB7XG4gICAqICAgICAgIHBvc2l0aW9uOiB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IFswLCAwLCAwLCAxMCwgMCwgMCwgMCwgMTAsIDAsIDEwLCAxMCwgMF0sIH0sXG4gICAqICAgICAgIHRleGNvb3JkOiB7IG51bUNvbXBvbmVudHM6IDIsIGRhdGE6IFswLCAwLCAwLCAxLCAxLCAwLCAxLCAxXSwgICAgICAgICAgICAgICAgIH0sXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgICAgdmFyIGJ1ZmZlckluZm8gPSBjcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5cyhnbCwgYXJyYXlzKTtcbiAgICpcbiAgICogICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbUluZm8ucHJvZ3JhbSk7XG4gICAqXG4gICAqIFRoaXMgd2lsbCBhdXRvbWF0aWNhbGx5IGJpbmQgdGhlIGJ1ZmZlcnMgQU5EIHNldCB0aGVcbiAgICogYXR0cmlidXRlcy5cbiAgICpcbiAgICogICAgIHNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzKGdsLCBwcm9ncmFtSW5mbywgYnVmZmVySW5mbyk7XG4gICAqXG4gICAqIEZvciB0aGUgZXhhbXBsZSBhYm92ZSBpdCBpcyBlcXVpdmlsZW50IHRvXG4gICAqXG4gICAqICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgcG9zaXRpb25CdWZmZXIpO1xuICAgKiAgICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYV9wb3NpdGlvbkxvY2F0aW9uKTtcbiAgICogICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIoYV9wb3NpdGlvbkxvY2F0aW9uLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgKiAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleGNvb3JkQnVmZmVyKTtcbiAgICogICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGFfdGV4Y29vcmRMb2NhdGlvbik7XG4gICAqICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGFfdGV4Y29vcmRMb2NhdGlvbiwgNCwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIEEgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0geyhtb2R1bGU6dHdnbC5Qcm9ncmFtSW5mb3xPYmplY3QuPHN0cmluZywgZnVuY3Rpb24+KX0gc2V0dGVycyBBIGBQcm9ncmFtSW5mb2AgYXMgcmV0dXJuZWQgZnJvbSBgY3JlYXRlUHJvZ3JtYUluZm9gIEF0dHJpYnV0ZSBzZXR0ZXJzIGFzIHJldHVybmVkIGZyb20gYGNyZWF0ZUF0dHJpYnV0ZVNldHRlcnNgXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuQnVmZmVySW5mb30gYnVmZmVycyBhIEJ1ZmZlckluZm8gYXMgcmV0dXJuZWQgZnJvbSBgY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXNgLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIHNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzKGdsLCBwcm9ncmFtSW5mbywgYnVmZmVycykge1xuICAgIHNldEF0dHJpYnV0ZXMocHJvZ3JhbUluZm8uYXR0cmliU2V0dGVycyB8fCBwcm9ncmFtSW5mbywgYnVmZmVycy5hdHRyaWJzKTtcbiAgICBpZiAoYnVmZmVycy5pbmRpY2VzKSB7XG4gICAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBidWZmZXJzLmluZGljZXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBQcm9ncmFtSW5mb1xuICAgKiBAcHJvcGVydHkge1dlYkdMUHJvZ3JhbX0gcHJvZ3JhbSBBIHNoYWRlciBwcm9ncmFtXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0PHN0cmluZywgZnVuY3Rpb24+fSB1bmlmb3JtU2V0dGVycyBvYmplY3Qgb2Ygc2V0dGVycyBhcyByZXR1cm5lZCBmcm9tIGNyZWF0ZVVuaWZvcm1TZXR0ZXJzLFxuICAgKiBAcHJvcGVydHkge09iamVjdDxzdHJpbmcsIGZ1bmN0aW9uPn0gYXR0cmliU2V0dGVycyBvYmplY3Qgb2Ygc2V0dGVycyBhcyByZXR1cm5lZCBmcm9tIGNyZWF0ZUF0dHJpYlNldHRlcnMsXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIFByb2dyYW1JbmZvIGZyb20gYW4gZXhpc3RpbmcgcHJvZ3JhbS5cbiAgICpcbiAgICogQSBQcm9ncmFtSW5mbyBjb250YWluc1xuICAgKlxuICAgKiAgICAgcHJvZ3JhbUluZm8gPSB7XG4gICAqICAgICAgICBwcm9ncmFtOiBXZWJHTFByb2dyYW0sXG4gICAqICAgICAgICB1bmlmb3JtU2V0dGVyczogb2JqZWN0IG9mIHNldHRlcnMgYXMgcmV0dXJuZWQgZnJvbSBjcmVhdGVVbmlmb3JtU2V0dGVycyxcbiAgICogICAgICAgIGF0dHJpYlNldHRlcnM6IG9iamVjdCBvZiBzZXR0ZXJzIGFzIHJldHVybmVkIGZyb20gY3JlYXRlQXR0cmliU2V0dGVycyxcbiAgICogICAgIH1cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogICAgICAgIHRvIHVzZS5cbiAgICogQHBhcmFtIHtXZWJHTFByb2dyYW19IHByb2dyYW0gYW4gZXhpc3RpbmcgV2ViR0xQcm9ncmFtLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5Qcm9ncmFtSW5mb30gVGhlIGNyZWF0ZWQgUHJvZ3JhbUluZm8uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbUluZm9Gcm9tUHJvZ3JhbShnbCwgcHJvZ3JhbSkge1xuICAgIHZhciB1bmlmb3JtU2V0dGVycyA9IGNyZWF0ZVVuaWZvcm1TZXR0ZXJzKGdsLCBwcm9ncmFtKTtcbiAgICB2YXIgYXR0cmliU2V0dGVycyA9IGNyZWF0ZUF0dHJpYnV0ZVNldHRlcnMoZ2wsIHByb2dyYW0pO1xuICAgIHJldHVybiB7XG4gICAgICBwcm9ncmFtOiBwcm9ncmFtLFxuICAgICAgdW5pZm9ybVNldHRlcnM6IHVuaWZvcm1TZXR0ZXJzLFxuICAgICAgYXR0cmliU2V0dGVyczogYXR0cmliU2V0dGVycyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBQcm9ncmFtSW5mbyBmcm9tIDIgc291cmNlcy5cbiAgICpcbiAgICogQSBQcm9ncmFtSW5mbyBjb250YWluc1xuICAgKlxuICAgKiAgICAgcHJvZ3JhbUluZm8gPSB7XG4gICAqICAgICAgICBwcm9ncmFtOiBXZWJHTFByb2dyYW0sXG4gICAqICAgICAgICB1bmlmb3JtU2V0dGVyczogb2JqZWN0IG9mIHNldHRlcnMgYXMgcmV0dXJuZWQgZnJvbSBjcmVhdGVVbmlmb3JtU2V0dGVycyxcbiAgICogICAgICAgIGF0dHJpYlNldHRlcnM6IG9iamVjdCBvZiBzZXR0ZXJzIGFzIHJldHVybmVkIGZyb20gY3JlYXRlQXR0cmliU2V0dGVycyxcbiAgICogICAgIH1cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogICAgICAgIHRvIHVzZS5cbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gc2hhZGVyU291cmNlc3MgQXJyYXkgb2Ygc291cmNlcyBmb3IgdGhlXG4gICAqICAgICAgICBzaGFkZXJzIG9yIGlkcy4gVGhlIGZpcnN0IGlzIGFzc3VtZWQgdG8gYmUgdGhlIHZlcnRleCBzaGFkZXIsXG4gICAqICAgICAgICB0aGUgc2Vjb25kIHRoZSBmcmFnbWVudCBzaGFkZXIuXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IFtvcHRfYXR0cmlic10gQW4gYXJyYXkgb2YgYXR0cmlicyBuYW1lcy4gTG9jYXRpb25zIHdpbGwgYmUgYXNzaWduZWQgYnkgaW5kZXggaWYgbm90IHBhc3NlZCBpblxuICAgKiBAcGFyYW0ge251bWJlcltdfSBbb3B0X2xvY2F0aW9uc10gVGhlIGxvY2F0aW9ucyBmb3IgdGhlLiBBIHBhcmFsbGVsIGFycmF5IHRvIG9wdF9hdHRyaWJzIGxldHRpbmcgeW91IGFzc2lnbiBsb2NhdGlvbnMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuRXJyb3JDYWxsYmFja30gb3B0X2Vycm9yQ2FsbGJhY2sgY2FsbGJhY2sgZm9yIGVycm9ycy4gQnkgZGVmYXVsdCBpdCBqdXN0IHByaW50cyBhbiBlcnJvciB0byB0aGUgY29uc29sZVxuICAgKiAgICAgICAgb24gZXJyb3IuIElmIHlvdSB3YW50IHNvbWV0aGluZyBlbHNlIHBhc3MgYW4gY2FsbGJhY2suIEl0J3MgcGFzc2VkIGFuIGVycm9yIG1lc3NhZ2UuXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLlByb2dyYW1JbmZvP30gVGhlIGNyZWF0ZWQgUHJvZ3JhbUluZm8uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbUluZm8oXG4gICAgICBnbCwgc2hhZGVyU291cmNlcywgb3B0X2F0dHJpYnMsIG9wdF9sb2NhdGlvbnMsIG9wdF9lcnJvckNhbGxiYWNrKSB7XG4gICAgc2hhZGVyU291cmNlcyA9IHNoYWRlclNvdXJjZXMubWFwKGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgdmFyIHNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNvdXJjZSk7XG4gICAgICByZXR1cm4gc2NyaXB0ID8gc2NyaXB0LnRleHQgOiBzb3VyY2U7XG4gICAgfSk7XG4gICAgdmFyIHByb2dyYW0gPSBjcmVhdGVQcm9ncmFtRnJvbVNvdXJjZXMoZ2wsIHNoYWRlclNvdXJjZXMsIG9wdF9hdHRyaWJzLCBvcHRfbG9jYXRpb25zLCBvcHRfZXJyb3JDYWxsYmFjayk7XG4gICAgaWYgKCFwcm9ncmFtKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVByb2dyYW1JbmZvRnJvbVByb2dyYW0oZ2wsIHByb2dyYW0pO1xuICB9XG5cbiAgLy8gVXNpbmcgcXVvdGVzIHByZXZlbnRzIFVnbGlmeSBmcm9tIGNoYW5naW5nIHRoZSBuYW1lcy5cbiAgLy8gTm8gc3BlZWQgZGlmZiBBRkFJQ1QuXG4gIHJldHVybiB7XG4gICAgXCJjcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzXCI6IGNyZWF0ZUF0dHJpYnV0ZVNldHRlcnMsXG5cbiAgICBcImNyZWF0ZVByb2dyYW1cIjogY3JlYXRlUHJvZ3JhbSxcbiAgICBcImNyZWF0ZVByb2dyYW1Gcm9tU2NyaXB0c1wiOiBjcmVhdGVQcm9ncmFtRnJvbVNjcmlwdHMsXG4gICAgXCJjcmVhdGVQcm9ncmFtRnJvbVNvdXJjZXNcIjogY3JlYXRlUHJvZ3JhbUZyb21Tb3VyY2VzLFxuICAgIFwiY3JlYXRlUHJvZ3JhbUluZm9cIjogY3JlYXRlUHJvZ3JhbUluZm8sXG4gICAgXCJjcmVhdGVQcm9ncmFtSW5mb0Zyb21Qcm9ncmFtXCI6IGNyZWF0ZVByb2dyYW1JbmZvRnJvbVByb2dyYW0sXG4gICAgXCJjcmVhdGVVbmlmb3JtU2V0dGVyc1wiOiBjcmVhdGVVbmlmb3JtU2V0dGVycyxcblxuICAgIFwic2V0QXR0cmlidXRlc1wiOiBzZXRBdHRyaWJ1dGVzLFxuICAgIFwic2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXNcIjogc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXMsXG4gICAgXCJzZXRVbmlmb3Jtc1wiOiBzZXRVbmlmb3JtcyxcbiAgfTtcblxufSk7XG5cblxuLypcbiAqIENvcHlyaWdodCAyMDE1LCBHcmVnZyBUYXZhcmVzLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmRlZmluZSgndHdnbC9kcmF3JyxbXG4gICAgJy4vcHJvZ3JhbXMnLFxuICBdLCBmdW5jdGlvbiAoXG4gICAgcHJvZ3JhbXMpIHtcbiAgXG5cbiAgLyoqXG4gICAqIENhbGxzIGBnbC5kcmF3RWxlbWVudHNgIG9yIGBnbC5kcmF3QXJyYXlzYCwgd2hpY2hldmVyIGlzIGFwcHJvcHJpYXRlXG4gICAqXG4gICAqIG5vcm1hbGx5IHlvdSdkIGNhbGwgYGdsLmRyYXdFbGVtZW50c2Agb3IgYGdsLmRyYXdBcnJheXNgIHlvdXJzZWxmXG4gICAqIGJ1dCBjYWxsaW5nIHRoaXMgbWVhbnMgaWYgeW91IHN3aXRjaCBmcm9tIGluZGV4ZWQgZGF0YSB0byBub24taW5kZXhlZFxuICAgKiBkYXRhIHlvdSBkb24ndCBoYXZlIHRvIHJlbWVtYmVyIHRvIHVwZGF0ZSB5b3VyIGRyYXcgY2FsbC5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIEEgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7ZW51bX0gdHlwZSBlZyAoZ2wuVFJJQU5HTEVTLCBnbC5MSU5FUywgZ2wuUE9JTlRTLCBnbC5UUklBTkdMRV9TVFJJUCwgLi4uKVxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IGJ1ZmZlckluZm8gYXMgcmV0dXJuZWQgZnJvbSBjcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5c1xuICAgKiBAcGFyYW0ge251bWJlcn0gW2NvdW50XSBBbiBvcHRpb25hbCBjb3VudC4gRGVmYXVsdHMgdG8gYnVmZmVySW5mby5udW1FbGVtZW50c1xuICAgKiBAcGFyYW0ge251bWJlcn0gW29mZnNldF0gQW4gb3B0aW9uYWwgb2Zmc2V0LiBEZWZhdWx0cyB0byAwLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGRyYXdCdWZmZXJJbmZvKGdsLCB0eXBlLCBidWZmZXJJbmZvLCBjb3VudCwgb2Zmc2V0KSB7XG4gICAgdmFyIGluZGljZXMgPSBidWZmZXJJbmZvLmluZGljZXM7XG4gICAgdmFyIG51bUVsZW1lbnRzID0gY291bnQgPT09IHVuZGVmaW5lZCA/IGJ1ZmZlckluZm8ubnVtRWxlbWVudHMgOiBjb3VudDtcbiAgICBvZmZzZXQgPSBvZmZzZXQgPT09IHVuZGVmaW5lZCA/IDAgOiBvZmZzZXQ7XG4gICAgaWYgKGluZGljZXMpIHtcbiAgICAgIGdsLmRyYXdFbGVtZW50cyh0eXBlLCBudW1FbGVtZW50cywgYnVmZmVySW5mby5lbGVtZW50VHlwZSA9PT0gdW5kZWZpbmVkID8gZ2wuVU5TSUdORURfU0hPUlQgOiBidWZmZXJJbmZvLmVsZW1lbnRUeXBlLCBvZmZzZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnbC5kcmF3QXJyYXlzKHR5cGUsIG9mZnNldCwgbnVtRWxlbWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBEcmF3T2JqZWN0XG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW2FjdGl2ZV0gd2hldGhlciBvciBub3QgdG8gZHJhdy4gRGVmYXVsdCA9IGB0cnVlYCAobXVzdCBiZSBgZmFsc2VgIHRvIGJlIG5vdCB0cnVlKS4gSW4gb3RoZXJ3b3JkcyBgdW5kZWZpbmVkYCA9IGB0cnVlYFxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3R5cGVdIHR5cGUgdG8gZHJhdyBlZy4gYGdsLlRSSUFOR0xFU2AsIGBnbC5MSU5FU2AsIGV0Yy4uLlxuICAgKiBAcHJvcGVydHkge21vZHVsZTp0d2dsLlByb2dyYW1JbmZvfSBwcm9ncmFtSW5mbyBBIFByb2dyYW1JbmZvIGFzIHJldHVybmVkIGZyb20gY3JlYXRlUHJvZ3JhbUluZm9cbiAgICogQHByb3BlcnR5IHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBidWZmZXJJbmZvIEEgQnVmZmVySW5mbyBhcyByZXR1cm5lZCBmcm9tIGNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzXG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0PHN0cmluZywgPz59IHVuaWZvcm1zIFRoZSB2YWx1ZXMgZm9yIHRoZSB1bmlmb3Jtcy5cbiAgICogICBZb3UgY2FuIHBhc3MgbXVsdGlwbGUgb2JqZWN0cyBieSBwdXR0aW5nIHRoZW0gaW4gYW4gYXJyYXkuIEZvciBleGFtcGxlXG4gICAqXG4gICAqICAgICB2YXIgc2hhcmVkVW5pZm9ybXMgPSB7XG4gICAqICAgICAgIHVfZm9nTmVhcjogMTAsXG4gICAqICAgICAgIHVfcHJvamVjdGlvbjogLi4uXG4gICAqICAgICAgIC4uLlxuICAgKiAgICAgfTtcbiAgICpcbiAgICogICAgIHZhciBsb2NhbFVuaWZvcm1zID0ge1xuICAgKiAgICAgICB1X3dvcmxkOiAuLi5cbiAgICogICAgICAgdV9kaWZmdXNlQ29sb3I6IC4uLlxuICAgKiAgICAgfTtcbiAgICpcbiAgICogICAgIHZhciBkcmF3T2JqID0ge1xuICAgKiAgICAgICAuLi5cbiAgICogICAgICAgdW5pZm9ybXM6IFtzaGFyZWRVbmlmb3JtcywgbG9jYWxVbmlmb3Jtc10sXG4gICAqICAgICB9O1xuICAgKlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW29mZnNldF0gdGhlIG9mZnNldCB0byBwYXNzIHRvIGBnbC5kcmF3QXJyYXlzYCBvciBgZ2wuZHJhd0VsZW1lbnRzYC4gRGVmYXVsdHMgdG8gMC5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtjb3VudF0gdGhlIGNvdW50IHRvIHBhc3MgdG8gYGdsLmRyYXdBcnJheXNgIG9yIGBnbC5kcmF3RWxlbW50c2AuIERlZmF1bHRzIHRvIGJ1ZmZlckluZm8ubnVtRWxlbWVudHMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogRHJhd3MgYSBsaXN0IG9mIG9iamVjdHNcbiAgICogQHBhcmFtIHtEcmF3T2JqZWN0W119IG9iamVjdHNUb0RyYXcgYW4gYXJyYXkgb2Ygb2JqZWN0cyB0byBkcmF3LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGRyYXdPYmplY3RMaXN0KGdsLCBvYmplY3RzVG9EcmF3KSB7XG4gICAgdmFyIGxhc3RVc2VkUHJvZ3JhbUluZm8gPSBudWxsO1xuICAgIHZhciBsYXN0VXNlZEJ1ZmZlckluZm8gPSBudWxsO1xuXG4gICAgb2JqZWN0c1RvRHJhdy5mb3JFYWNoKGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgaWYgKG9iamVjdC5hY3RpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb2dyYW1JbmZvID0gb2JqZWN0LnByb2dyYW1JbmZvO1xuICAgICAgdmFyIGJ1ZmZlckluZm8gPSBvYmplY3QuYnVmZmVySW5mbztcbiAgICAgIHZhciBiaW5kQnVmZmVycyA9IGZhbHNlO1xuXG4gICAgICBpZiAocHJvZ3JhbUluZm8gIT09IGxhc3RVc2VkUHJvZ3JhbUluZm8pIHtcbiAgICAgICAgbGFzdFVzZWRQcm9ncmFtSW5mbyA9IHByb2dyYW1JbmZvO1xuICAgICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW1JbmZvLnByb2dyYW0pO1xuXG4gICAgICAgIC8vIFdlIGhhdmUgdG8gcmViaW5kIGJ1ZmZlcnMgd2hlbiBjaGFuZ2luZyBwcm9ncmFtcyBiZWNhdXNlIHdlXG4gICAgICAgIC8vIG9ubHkgYmluZCBidWZmZXJzIHRoZSBwcm9ncmFtIHVzZXMuIFNvIGlmIDIgcHJvZ3JhbXMgdXNlIHRoZSBzYW1lXG4gICAgICAgIC8vIGJ1ZmZlckluZm8gYnV0IHRoZSAxc3Qgb25lIHVzZXMgb25seSBwb3NpdGlvbnMgdGhlIHdoZW4gdGhlXG4gICAgICAgIC8vIHdlIHN3aXRjaCB0byB0aGUgMm5kIG9uZSBzb21lIG9mIHRoZSBhdHRyaWJ1dGVzIHdpbGwgbm90IGJlIG9uLlxuICAgICAgICBiaW5kQnVmZmVycyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldHVwIGFsbCB0aGUgbmVlZGVkIGF0dHJpYnV0ZXMuXG4gICAgICBpZiAoYmluZEJ1ZmZlcnMgfHwgYnVmZmVySW5mbyAhPT0gbGFzdFVzZWRCdWZmZXJJbmZvKSB7XG4gICAgICAgIGxhc3RVc2VkQnVmZmVySW5mbyA9IGJ1ZmZlckluZm87XG4gICAgICAgIHByb2dyYW1zLnNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzKGdsLCBwcm9ncmFtSW5mbywgYnVmZmVySW5mbyk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0aGUgdW5pZm9ybXMuXG4gICAgICBwcm9ncmFtcy5zZXRVbmlmb3Jtcyhwcm9ncmFtSW5mbywgb2JqZWN0LnVuaWZvcm1zKTtcblxuICAgICAgLy8gRHJhd1xuICAgICAgZHJhd0J1ZmZlckluZm8oZ2wsIG9iamVjdC50eXBlIHx8IGdsLlRSSUFOR0xFUywgYnVmZmVySW5mbywgb2JqZWN0LmNvdW50LCBvYmplY3Qub2Zmc2V0KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFVzaW5nIHF1b3RlcyBwcmV2ZW50cyBVZ2xpZnkgZnJvbSBjaGFuZ2luZyB0aGUgbmFtZXMuXG4gIC8vIE5vIHNwZWVkIGRpZmYgQUZBSUNULlxuICByZXR1cm4ge1xuICAgIFwiZHJhd0J1ZmZlckluZm9cIjogZHJhd0J1ZmZlckluZm8sXG4gICAgXCJkcmF3T2JqZWN0TGlzdFwiOiBkcmF3T2JqZWN0TGlzdCxcbiAgfTtcblxufSk7XG5cblxuLypcbiAqIENvcHlyaWdodCAyMDE1LCBHcmVnZyBUYXZhcmVzLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmRlZmluZSgndHdnbC91dGlscycsW10sIGZ1bmN0aW9uICgpIHtcbiAgXG5cbiAgLyoqXG4gICAqIENvcHkgYW4gb2JqZWN0IDEgbGV2ZWwgZGVlcFxuICAgKiBAcGFyYW0ge29iamVjdH0gc3JjIG9iamVjdCB0byBjb3B5XG4gICAqIEByZXR1cm4ge29iamVjdH0gdGhlIGNvcHlcbiAgICovXG4gIGZ1bmN0aW9uIHNoYWxsb3dDb3B5KHNyYykge1xuICAgIHZhciBkc3QgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhzcmMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBkc3Rba2V5XSA9IHNyY1trZXldO1xuICAgIH0pO1xuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHNoYWxsb3dDb3B5OiBzaGFsbG93Q29weSxcbiAgfTtcbn0pO1xuXG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSwgR3JlZ2cgVGF2YXJlcy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG5kZWZpbmUoJ3R3Z2wvdGV4dHVyZXMnLFtcbiAgICAnLi90eXBlZGFycmF5cycsXG4gICAgJy4vdXRpbHMnLFxuICBdLCBmdW5jdGlvbiAoXG4gICAgdHlwZWRBcnJheXMsXG4gICAgdXRpbHMpIHtcbiAgXG5cbiAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IHNlZSBhIGdsb2JhbCBnbFxuICB2YXIgZ2wgPSB1bmRlZmluZWQ7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICB0ZXh0dXJlQ29sb3I6IG5ldyBVaW50OEFycmF5KFsxMjgsIDE5MiwgMjU1LCAyNTVdKSxcbiAgICB0ZXh0dXJlT3B0aW9uczoge30sXG4gIH07XG4gIHZhciBpc0FycmF5QnVmZmVyID0gdHlwZWRBcnJheXMuaXNBcnJheUJ1ZmZlcjtcblxuICAvKiBQaXhlbEZvcm1hdCAqL1xuICB2YXIgQUxQSEEgICAgICAgICAgICAgICAgICAgICAgICAgID0gMHgxOTA2O1xuICB2YXIgUkdCICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gMHgxOTA3O1xuICB2YXIgUkdCQSAgICAgICAgICAgICAgICAgICAgICAgICAgID0gMHgxOTA4O1xuICB2YXIgTFVNSU5BTkNFICAgICAgICAgICAgICAgICAgICAgID0gMHgxOTA5O1xuICB2YXIgTFVNSU5BTkNFX0FMUEhBICAgICAgICAgICAgICAgID0gMHgxOTBBO1xuXG4gIC8qIFRleHR1cmVXcmFwTW9kZSAqL1xuICB2YXIgUkVQRUFUICAgICAgICAgICAgICAgICAgICAgICAgID0gMHgyOTAxOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB2YXIgTUlSUk9SRURfUkVQRUFUICAgICAgICAgICAgICAgID0gMHg4MzcwOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gIC8qIFRleHR1cmVNYWdGaWx0ZXIgKi9cbiAgdmFyIE5FQVJFU1QgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MjYwMDsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAvKiBUZXh0dXJlTWluRmlsdGVyICovXG4gIHZhciBORUFSRVNUX01JUE1BUF9ORUFSRVNUICAgICAgICAgPSAweDI3MDA7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIHZhciBMSU5FQVJfTUlQTUFQX05FQVJFU1QgICAgICAgICAgPSAweDI3MDE7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIHZhciBORUFSRVNUX01JUE1BUF9MSU5FQVIgICAgICAgICAgPSAweDI3MDI7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIHZhciBMSU5FQVJfTUlQTUFQX0xJTkVBUiAgICAgICAgICAgPSAweDI3MDM7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlZmF1bHQgdGV4dHVyZSBjb2xvci5cbiAgICpcbiAgICogVGhlIGRlZmF1bHQgdGV4dHVyZSBjb2xvciBpcyB1c2VkIHdoZW4gbG9hZGluZyB0ZXh0dXJlcyBmcm9tXG4gICAqIHVybHMuIEJlY2F1c2UgdGhlIFVSTCB3aWxsIGJlIGxvYWRlZCBhc3luYyB3ZSdkIGxpa2UgdG8gYmVcbiAgICogYWJsZSB0byB1c2UgdGhlIHRleHR1cmUgaW1tZWRpYXRlbHkuIEJ5IHB1dHRpbmcgYSAxeDEgcGl4ZWxcbiAgICogY29sb3IgaW4gdGhlIHRleHR1cmUgd2UgY2FuIHN0YXJ0IHVzaW5nIHRoZSB0ZXh0dXJlIGJlZm9yZVxuICAgKiB0aGUgVVJMIGhhcyBsb2FkZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyW119IGNvbG9yIEFycmF5IG9mIDQgdmFsdWVzIGluIHRoZSByYW5nZSAwIHRvIDFcbiAgICogQGRlcHJlY2F0ZWQgc2VlIHtAbGluayBtb2R1bGU6dHdnbC5zZXREZWZhdWx0c31cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBzZXREZWZhdWx0VGV4dHVyZUNvbG9yKGNvbG9yKSB7XG4gICAgZGVmYXVsdHMudGV4dHVyZUNvbG9yID0gbmV3IFVpbnQ4QXJyYXkoW2NvbG9yWzBdICogMjU1LCBjb2xvclsxXSAqIDI1NSwgY29sb3JbMl0gKiAyNTUsIGNvbG9yWzNdICogMjU1XSk7XG4gIH1cblxuICB2YXIgaW52YWxpZERlZmF1bHRLZXlzUkUgPSAvXnRleHR1cmVDb2xvciQvO1xuICBmdW5jdGlvbiB2YWxpZERlZmF1bHRLZXlzKGtleSkge1xuICAgIHJldHVybiAhaW52YWxpZERlZmF1bHRLZXlzUkUudGVzdChrZXkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0RGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICBpZiAobmV3RGVmYXVsdHMudGV4dHVyZUNvbG9yKSB7XG4gICAgICBzZXREZWZhdWx0VGV4dHVyZUNvbG9yKG5ld0RlZmF1bHRzLnRleHR1cmVDb2xvcik7XG4gICAgfVxuICAgIE9iamVjdC5rZXlzKG5ld0RlZmF1bHRzKS5maWx0ZXIodmFsaWREZWZhdWx0S2V5cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGRlZmF1bHRzW2tleV0gPSBuZXdEZWZhdWx0c1trZXldO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBzdHJpbmcgZm9yIGdsIGVudW1cbiAgICpcbiAgICogTm90ZTogU2V2ZXJhbCBlbnVtcyBhcmUgdGhlIHNhbWUuIFdpdGhvdXQgbW9yZVxuICAgKiBjb250ZXh0ICh3aGljaCBmdW5jdGlvbikgaXQncyBpbXBvc3NpYmxlIHRvIGFsd2F5c1xuICAgKiBnaXZlIHRoZSBjb3JyZWN0IGVudW0uXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBBIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoZSBlbnVtIHlvdSB3YW50IHRvIGxvb2sgdXAuXG4gICAqL1xuICB2YXIgZ2xFbnVtVG9TdHJpbmcgPSAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVudW1zO1xuXG4gICAgZnVuY3Rpb24gaW5pdChnbCkge1xuICAgICAgaWYgKCFlbnVtcykge1xuICAgICAgICBlbnVtcyA9IHt9O1xuICAgICAgICBPYmplY3Qua2V5cyhnbCkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGdsW2tleV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBlbnVtc1tnbFtrZXldXSA9IGtleTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBnbEVudW1Ub1N0cmluZyhnbCwgdmFsdWUpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIHJldHVybiBlbnVtc1t2YWx1ZV0gfHwgKFwiMHhcIiArIHZhbHVlLnRvU3RyaW5nKDE2KSk7XG4gICAgfTtcbiAgfSgpKTtcblxuICAvKipcbiAgICogQSBmdW5jdGlvbiB0byBnZW5lcmF0ZSB0aGUgc291cmNlIGZvciBhIHRleHR1cmUuXG4gICAqIEBjYWxsYmFjayBUZXh0dXJlRnVuY1xuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgQSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30gb3B0aW9ucyB0aGUgdGV4dHVyZSBvcHRpb25zXG4gICAqIEByZXR1cm4geyp9IFJldHVybnMgYW55IG9mIHRoZSB0aGluZ3MgZG9jdW1lbnRlbnRlZCBmb3IgYHNyY2AgZm9yIHtAbGluayBtb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogVGV4dHVyZSBvcHRpb25zIHBhc3NlZCB0byBtb3N0IHRleHR1cmUgZnVuY3Rpb25zLiBFYWNoIGZ1bmN0aW9uIHdpbGwgdXNlIHdoYXRldmVyIG9wdGlvbnNcbiAgICogYXJlIGFwcHJvcHJpYXRlIGZvciBpdHMgbmVlZHMuIFRoaXMgbGV0cyB5b3UgcGFzcyB0aGUgc2FtZSBvcHRpb25zIHRvIGFsbCBmdW5jdGlvbnMuXG4gICAqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IFRleHR1cmVPcHRpb25zXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbdGFyZ2V0XSB0aGUgdHlwZSBvZiB0ZXh0dXJlIGBnbC5URVhUVVJFXzJEYCBvciBgZ2wuVEVYVFVSRV9DVUJFX01BUGAuIERlZmF1bHRzIHRvIGBnbC5URVhUVVJFXzJEYC5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFt3aWR0aF0gdGhlIHdpZHRoIG9mIHRoZSB0ZXh0dXJlLiBPbmx5IHVzZWQgaWYgc3JjIGlzIGFuIGFycmF5IG9yIHR5cGVkIGFycmF5IG9yIG51bGwuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbaGVpZ2h0XSB0aGUgaGVpZ2h0IG9mIGEgdGV4dHVyZS4gT25seSB1c2VkIGlmIHNyYyBpcyBhbiBhcnJheSBvciB0eXBlZCBhcnJheSBvciBudWxsLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW21pbl0gdGhlIG1pbiBmaWx0ZXIgc2V0dGluZyAoZWcuIGBnbC5MSU5FQVJgKS4gRGVmYXVsdHMgdG8gYGdsLk5FQVJFU1RfTUlQTUFQX0xJTkVBUmBcbiAgICogICAgIG9yIGlmIHRleHR1cmUgaXMgbm90IGEgcG93ZXIgb2YgMiBvbiBib3RoIGRpbWVuc2lvbnMgdGhlbiBkZWZhdWx0cyB0byBgZ2wuTElORUFSYC5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFttYWddIHRoZSBtYWcgZmlsdGVyIHNldHRpbmcgKGVnLiBgZ2wuTElORUFSYCkuIERlZmF1bHRzIHRvIGBnbC5MSU5FQVJgXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbZm9ybWF0XSBmb3JtYXQgZm9yIHRleHR1cmUuIERlZmF1bHRzIHRvIGBnbC5SR0JBYC5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFt0eXBlXSB0eXBlIGZvciB0ZXh0dXJlLiBEZWZhdWx0cyB0byBgZ2wuVU5TSUdORURfQllURWAgdW5sZXNzIGBzcmNgIGlzIEFycmF5QnVmZmVyLiBJZiBgc3JjYFxuICAgKiAgICAgaXMgQXJyYXlCdWZmZXIgZGVmYXVsdHMgdG8gdHlwZSB0aGF0IG1hdGNoZXMgQXJyYXlCdWZmZXIgdHlwZS5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFt3cmFwXSBUZXh0dXJlIHdyYXBwaW5nIGZvciBib3RoIFMgYW5kIFQuIERlZmF1bHRzIHRvIGBnbC5SRVBFQVRgIGZvciAyRCBhbmQgYGdsLkNMQU1QX1RPX0VER0VgIGZvciBjdWJlXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbd3JhcFNdIFRleHR1cmUgd3JhcHBpbmcgZm9yIFMuIERlZmF1bHRzIHRvIGBnbC5SRVBFQVRgIGFuZCBgZ2wuQ0xBTVBfVE9fRURHRWAgZm9yIGN1YmUuIElmIHNldCB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgYHdyYXBgLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3dyYXBUXSBUZXh0dXJlIHdyYXBwaW5nIGZvciBULiBEZWZhdWx0cyB0byBgZ2wuUkVQRUFUYCBhbmQgYGdsLkNMQU1QX1RPX0VER0VgIGZvciBjdWJlLiBJZiBzZXQgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGB3cmFwYC5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFt1bnBhY2tBbGlnbm1lbnRdIFRoZSBgZ2wuVU5QQUNLX0FMSUdOTUVOVGAgdXNlZCB3aGVuIHVwbG9hZGluZyBhbiBhcnJheS4gRGVmYXVsdHMgdG8gMS5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtwcmVtdWx0aXBseUFscGhhXSBXaGV0aGVyIG9yIG5vdCB0byBwcmVtdWx0aXBseSBhbHBoYS4gRGVmYXVsdHMgdG8gd2hhdGV2ZXIgdGhlIGN1cnJlbnQgc2V0dGluZyBpcy5cbiAgICogICAgIFRoaXMgbGV0cyB5b3Ugc2V0IGl0IG9uY2UgYmVmb3JlIGNhbGxpbmcgYHR3Z2wuY3JlYXRlVGV4dHVyZWAgb3IgYHR3Z2wuY3JlYXRlVGV4dHVyZXNgIGFuZCBvbmx5IG92ZXJyaWRlXG4gICAqICAgICB0aGUgY3VycmVudCBzZXR0aW5nIGZvciBzcGVjaWZpYyB0ZXh0dXJlcy5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtmbGlwWV0gV2hldGhlciBvciBub3QgdG8gZmxpcCB0aGUgdGV4dHVyZSB2ZXJ0aWNhbGx5IG9uIHVwbG9hZC4gRGVmYXVsdHMgdG8gd2hhdGV2ZXIgdGhlIGN1cnJlbnQgc2V0dGluZyBpcy5cbiAgICogICAgIFRoaXMgbGV0cyB5b3Ugc2V0IGl0IG9uY2UgYmVmb3JlIGNhbGxpbmcgYHR3Z2wuY3JlYXRlVGV4dHVyZWAgb3IgYHR3Z2wuY3JlYXRlVGV4dHVyZXNgIGFuZCBvbmx5IG92ZXJyaWRlXG4gICAqICAgICB0aGUgY3VycmVudCBzZXR0aW5nIGZvciBzcGVjaWZpYyB0ZXh0dXJlcy5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtjb2xvcnNwYWNlQ29udmVyc2lvbl0gV2hldGhlciBvciBub3QgdG8gbGV0IHRoZSBicm93c2VyIGRvIGNvbG9yc3BhY2UgY29udmVyc2lvbiBvZiB0aGUgdGV4dHVyZSBvbiB1cGxvYWQuIERlZmF1bHRzIHRvIHdoYXRldmVyIHRoZSBjdXJyZW50IHNldHRpbmcgaXMuXG4gICAqICAgICBUaGlzIGxldHMgeW91IHNldCBpdCBvbmNlIGJlZm9yZSBjYWxsaW5nIGB0d2dsLmNyZWF0ZVRleHR1cmVgIG9yIGB0d2dsLmNyZWF0ZVRleHR1cmVzYCBhbmQgb25seSBvdmVycmlkZVxuICAgKiAgICAgdGhlIGN1cnJlbnQgc2V0dGluZyBmb3Igc3BlY2lmaWMgdGV4dHVyZXMuXG4gICAqIEBwcm9wZXJ0eSB7KG51bWJlcltdfEFycmF5QnVmZmVyKX0gY29sb3IgY29sb3IgdXNlZCBhcyB0ZW1wb3JhcnkgMXgxIHBpeGVsIGNvbG9yIGZvciB0ZXh0dXJlcyBsb2FkZWQgYXN5bmMgd2hlbiBzcmMgaXMgYSBzdHJpbmcuXG4gICAqICAgIElmIGl0J3MgYSBKYXZhU2NyaXB0IGFycmF5IGFzc3VtZXMgY29sb3IgaXMgMCB0byAxIGxpa2UgbW9zdCBHTCBjb2xvcnMgYXMgaW4gYFsxLCAwLCAwLCAxXSA9IHJlZD0xLCBncmVlbj0wLCBibHVlPTAsIGFscGhhPTBgLlxuICAgKiAgICBEZWZhdWx0cyB0byBgWzAuNSwgMC43NSwgMSwgMV1gLiBTZWUge0BsaW5rIG1vZHVsZTp0d2dsLnNldERlZmF1bHRUZXh0dXJlQ29sb3J9LiBJZiBgZmFsc2VgIHRleHR1cmUgaXMgc2V0LiBDYW4gYmUgdXNlZCB0byByZS1sb2FkIGEgdGV4dHVyZVxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IFthdXRvXSBJZiBub3QgYGZhbHNlYCB0aGVuIHRleHR1cmUgd29ya2luZyBmaWx0ZXJpbmcgaXMgc2V0IGF1dG9tYXRpY2FsbHkgZm9yIG5vbi1wb3dlciBvZiAyIGltYWdlcyBhbmRcbiAgICogICAgbWlwcyBhcmUgZ2VuZXJhdGVkIGZvciBwb3dlciBvZiAyIGltYWdlcy5cbiAgICogQHByb3BlcnR5IHtudW1iZXJbXX0gW2N1YmVGYWNlT3JkZXJdIFRoZSBvcmRlciB0aGF0IGN1YmUgZmFjZXMgYXJlIHB1bGxlZCBvdXQgb2YgYW4gaW1nIG9yIHNldCBvZiBpbWFnZXMuIFRoZSBkZWZhdWx0IGlzXG4gICAqXG4gICAqICAgICBbZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YLFxuICAgKiAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWCxcbiAgICogICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ksXG4gICAqICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9ZLFxuICAgKiAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWixcbiAgICogICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1pdXG4gICAqXG4gICAqIEBwcm9wZXJ0eSB7KG51bWJlcltdfEFycmF5QnVmZmVyfEhUTUxDYW52YXNFbGVtZW50fEhUTUxJbWFnZUVsZW1lbnR8SFRNTFZpZGVvRWxlbWVudHxzdHJpbmd8c3RyaW5nW118bW9kdWxlOnR3Z2wuVGV4dHVyZUZ1bmMpfSBbc3JjXSBzb3VyY2UgZm9yIHRleHR1cmVcbiAgICpcbiAgICogICAgSWYgYHN0cmluZ2AgdGhlbiBpdCdzIGFzc3VtZWQgdG8gYmUgYSBVUkwgdG8gYW4gaW1hZ2UuIFRoZSBpbWFnZSB3aWxsIGJlIGRvd25sb2FkZWQgYXN5bmMuIEEgdXNhYmxlXG4gICAqICAgIDF4MSBwaXhlbCB0ZXh0dXJlIHdpbGwgYmUgcmV0dXJuZWQgaW1tZWRpYXRsZXkuIFRoZSB0ZXh0dXJlIHdpbGwgYmUgdXBkYXRlZCBvbmNlIHRoZSBpbWFnZSBoYXMgZG93bmxvYWRlZC5cbiAgICogICAgSWYgYHRhcmdldGAgaXMgYGdsLlRFWFRVUkVfQ1VCRV9NQVBgIHdpbGwgYXR0ZW1wdCB0byBkaXZpZGUgaW1hZ2UgaW50byA2IHNxdWFyZSBwaWVjZXMuIDF4NiwgNngxLCAzeDIsIDJ4My5cbiAgICogICAgVGhlIHBpZWNlcyB3aWxsIGJlIHVwbG9hZGVkIGluIGBjdWJlRmFjZU9yZGVyYFxuICAgKlxuICAgKiAgICBJZiBgc3RyaW5nW11gIHRoZW4gaXQgbXVzdCBoYXZlIDYgZW50cmllcywgb25lIGZvciBlYWNoIGZhY2Ugb2YgYSBjdWJlIG1hcC4gVGFyZ2V0IG11c3QgYmUgYGdsLlRFWFRVUkVfQ1VCRV9NQVBgLlxuICAgKlxuICAgKiAgICBJZiBgSFRNTEVsZW1lbnRgIHRoZW4gaXQgd2lsIGJlIHVzZWQgaW1tZWRpYXRlbHkgdG8gY3JlYXRlIHRoZSBjb250ZW50cyBvZiB0aGUgdGV4dHVyZS4gRXhhbXBsZXMgYEhUTUxJbWFnZUVsZW1lbnRgLFxuICAgKiAgICBgSFRNTENhbnZhc0VsZW1lbnRgLCBgSFRNTFZpZGVvRWxlbWVudGAuXG4gICAqXG4gICAqICAgIElmIGBudW1iZXJbXWAgb3IgYEFycmF5QnVmZmVyYCBpdCdzIGFzc3VtZWQgdG8gYmUgZGF0YSBmb3IgYSB0ZXh0dXJlLiBJZiBgd2lkdGhgIG9yIGBoZWlnaHRgIGlzXG4gICAqICAgIG5vdCBzcGVjaWZpZWQgaXQgaXMgZ3Vlc3NlZCBhcyBmb2xsb3dzLiBGaXJzdCB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGlzIGNvbXB1dGVkIGJ5IGBzcmMubGVuZ3RoIC8gbnVtQ29tcG9uZXRzYFxuICAgKiAgICB3aGVyZSBgbnVtQ29tcG9uZW50c2AgaXMgZGVyaXZlZCBmcm9tIGBmb3JtYXRgLiBJZiBgdGFyZ2V0YCBpcyBgZ2wuVEVYVFVSRV9DVUJFX01BUGAgdGhlbiBgbnVtRWxlbWVudHNgIGlzIGRpdmlkZWRcbiAgICogICAgYnkgNi4gVGhlblxuICAgKlxuICAgKiAgICAqICAgSWYgbmVpdGhlciBgd2lkdGhgIG5vciBgaGVpZ2h0YCBhcmUgc3BlY2lmaWVkIGFuZCBgc3FydChudW1FbGVtZW50cylgIGlzIGFuIGludGVnZXIgdGhlbiB3aWR0aCBhbmQgaGVpZ2h0XG4gICAqICAgICAgICBhcmUgc2V0IHRvIGBzcXJ0KG51bUVsZW1lbnRzKWAuIE90aGVyd2lzZSBgd2lkdGggPSBudW1FbGVtZW50c2AgYW5kIGBoZWlnaHQgPSAxYC5cbiAgICpcbiAgICogICAgKiAgIElmIG9ubHkgb25lIG9mIGB3aWR0aGAgb3IgYGhlaWdodGAgaXMgc3BlY2lmaWVkIHRoZW4gdGhlIG90aGVyIGVxdWFscyBgbnVtRWxlbWVudHMgLyBzcGVjaWZpZWREaW1lbnNpb25gLlxuICAgKlxuICAgKiBJZiBgbnVtYmVyW11gIHdpbGwgYmUgY29udmVydGVkIHRvIGB0eXBlYC5cbiAgICpcbiAgICogSWYgYHNyY2AgaXMgYSBmdW5jdGlvbiBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIGEgYFdlYkdMUmVuZGVyaW5nQ29udGV4dGAgYW5kIHRoZXNlIG9wdGlvbnMuXG4gICAqIFdoYXRldmVyIGl0IHJldHVybnMgaXMgc3ViamVjdCB0byB0aGVzZSBydWxlcy4gU28gaXQgY2FuIHJldHVybiBhIHN0cmluZyB1cmwsIGFuIGBIVE1MRWxlbWVudGBcbiAgICogYW4gYXJyYXkgZXRjLi4uXG4gICAqXG4gICAqIElmIGBzcmNgIGlzIHVuZGVmaW5lZCB0aGVuIGFuIGVtcHR5IHRleHR1cmUgd2lsbCBiZSBjcmVhdGVkIG9mIHNpemUgYHdpZHRoYCBieSBgaGVpZ2h0YC5cbiAgICpcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IFtjcm9zc09yaWdpbl0gV2hhdCB0byBzZXQgdGhlIGNyb3NzT3JpZ2luIHByb3BlcnR5IG9mIGltYWdlcyB3aGVuIHRoZXkgYXJlIGRvd25sb2FkZWQuXG4gICAqICAgIGRlZmF1bHQ6IHVuZGVmaW5lZC4gQWxzbyBzZWUge0BsaW5rIG1vZHVsZTp0d2dsLnNldERlZmF1bHRzfS5cbiAgICpcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG4gIC8vIE5PVEU6IFdoaWxlIHF1ZXJ5aW5nIEdMIGlzIGNvbnNpZGVyZWQgc2xvdyBpdCdzIG5vdCByZW1vdGVseSBhcyBzbG93XG4gIC8vIGFzIHVwbG9hZGluZyBhIHRleHR1cmUuIE9uIHRvcCBvZiB0aGF0IHlvdSdyZSB1bmxpa2VseSB0byBjYWxsIHRoaXMgaW5cbiAgLy8gYSBwZXJmIGNyaXRpY2FsIGxvb3AuIEV2ZW4gaWYgdXBsb2FkIGEgdGV4dHVyZSBldmVyeSBmcmFtZSB0aGF0J3MgdW5saWtlbHlcbiAgLy8gdG8gYmUgbW9yZSB0aGFuIDEgb3IgMiB0ZXh0dXJlcyBhIGZyYW1lLiBJbiBvdGhlciB3b3JkcywgdGhlIGJlbmVmaXRzIG9mXG4gIC8vIG1ha2luZyB0aGUgQVBJIGVhc3kgdG8gdXNlIG91dHdlaWdoIGFueSBzdXBwb3NlZCBwZXJmIGJlbmVmaXRzXG4gIHZhciBsYXN0UGFja1N0YXRlID0ge307XG5cbiAgLyoqXG4gICAqIFNhdmVzIGFueSBwYWNraW5nIHN0YXRlIHRoYXQgd2lsbCBiZSBzZXQgYmFzZWQgb24gdGhlIG9wdGlvbnMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IG9wdGlvbnMgQSBUZXh0dXJlT3B0aW9ucyBvYmplY3Qgd2l0aCB3aGF0ZXZlciBwYXJhbWV0ZXJzIHlvdSB3YW50IHNldC5cbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICovXG4gIGZ1bmN0aW9uIHNhdmVQYWNrU3RhdGUoZ2wsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5jb2xvcnNwYWNlQ29udmVyc2lvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsYXN0UGFja1N0YXRlLmNvbG9yU3BhY2VDb252ZXJzaW9uID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLlVOUEFDS19DT0xPUlNQQUNFX0NPTlZFUlNJT05fV0VCR0wpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5wcmVtdWx0aXBseUFscGhhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGxhc3RQYWNrU3RhdGUucHJlbXVsdGlwbHlBbHBoYSA9IGdsLmdldFBhcmFtZXRlcihnbC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5mbGlwWSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsYXN0UGFja1N0YXRlLmZsaXBZID0gZ2wuZ2V0UGFyYW1ldGVyKGdsLlVOUEFDS19GTElQX1lfV0VCR0wpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0b3JlcyBhbnkgcGFja2luZyBzdGF0ZSB0aGF0IHdhcyBzZXQgYmFzZWQgb24gdGhlIG9wdGlvbnMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IG9wdGlvbnMgQSBUZXh0dXJlT3B0aW9ucyBvYmplY3Qgd2l0aCB3aGF0ZXZlciBwYXJhbWV0ZXJzIHlvdSB3YW50IHNldC5cbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICovXG4gIGZ1bmN0aW9uIHJlc3RvcmVQYWNrU3RhdGUoZ2wsIG9wdGlvbnMpIHtcbiAgICBpZiAob3B0aW9ucy5jb2xvcnNwYWNlQ29udmVyc2lvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfQ09MT1JTUEFDRV9DT05WRVJTSU9OX1dFQkdMLCBsYXN0UGFja1N0YXRlLmNvbG9yU3BhY2VDb252ZXJzaW9uKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucHJlbXVsdGlwbHlBbHBoYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIGxhc3RQYWNrU3RhdGUucHJlbXVsdGlwbHlBbHBoYSk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmZsaXBZICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIGxhc3RQYWNrU3RhdGUuZmxpcFkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0ZXh0dXJlIHBhcmFtZXRlcnMgb2YgYSB0ZXh0dXJlLlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4IHRoZSBXZWJHTFRleHR1cmUgdG8gc2V0IHBhcmFtZXRlcnMgZm9yXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IG9wdGlvbnMgQSBUZXh0dXJlT3B0aW9ucyBvYmplY3Qgd2l0aCB3aGF0ZXZlciBwYXJhbWV0ZXJzIHlvdSB3YW50IHNldC5cbiAgICogICBUaGlzIGlzIG9mdGVuIHRoZSBzYW1lIG9wdGlvbnMgeW91IHBhc3NlZCBpbiB3aGVuIHlvdSBjcmVhdGVkIHRoZSB0ZXh0dXJlLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIHNldFRleHR1cmVQYXJhbWV0ZXJzKGdsLCB0ZXgsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQgfHwgZ2wuVEVYVFVSRV8yRDtcbiAgICBnbC5iaW5kVGV4dHVyZSh0YXJnZXQsIHRleCk7XG4gICAgaWYgKG9wdGlvbnMubWluKSB7XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBvcHRpb25zLm1pbik7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLm1hZykge1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaSh0YXJnZXQsIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgb3B0aW9ucy5tYWcpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy53cmFwKSB7XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1MsIG9wdGlvbnMud3JhcCk7XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1QsIG9wdGlvbnMud3JhcCk7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLndyYXBTKSB7XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1MsIG9wdGlvbnMud3JhcFMpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy53cmFwVCkge1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaSh0YXJnZXQsIGdsLlRFWFRVUkVfV1JBUF9ULCBvcHRpb25zLndyYXBUKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWFrZXMgYSAxeDEgcGl4ZWxcbiAgICogSWYgbm8gY29sb3IgaXMgcGFzc2VkIGluIHVzZXMgdGhlIGRlZmF1bHQgY29sb3Igd2hpY2ggY2FuIGJlIHNldCBieSBjYWxsaW5nIGBzZXREZWZhdWx0VGV4dHVyZUNvbG9yYC5cbiAgICogQHBhcmFtIHsobnVtYmVyW118QXJyYXlCdWZmZXIpfSBbY29sb3JdIFRoZSBjb2xvciB1c2luZyAwLTEgdmFsdWVzXG4gICAqIEByZXR1cm4ge1VpbnQ4QXJyYXl9IFVuaXQ4QXJyYXkgd2l0aCBjb2xvci5cbiAgICovXG4gIGZ1bmN0aW9uIG1ha2UxUGl4ZWwoY29sb3IpIHtcbiAgICBjb2xvciA9IGNvbG9yIHx8IGRlZmF1bHRzLnRleHR1cmVDb2xvcjtcbiAgICBpZiAoaXNBcnJheUJ1ZmZlcihjb2xvcikpIHtcbiAgICAgIHJldHVybiBjb2xvcjtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KFtjb2xvclswXSAqIDI1NSwgY29sb3JbMV0gKiAyNTUsIGNvbG9yWzJdICogMjU1LCBjb2xvclszXSAqIDI1NV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB2YWx1ZSBpcyBwb3dlciBvZiAyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBudW1iZXIgdG8gY2hlY2suXG4gICAqIEByZXR1cm4gdHJ1ZSBpZiB2YWx1ZSBpcyBwb3dlciBvZiAyXG4gICAqL1xuICBmdW5jdGlvbiBpc1Bvd2VyT2YyKHZhbHVlKSB7XG4gICAgcmV0dXJuICh2YWx1ZSAmICh2YWx1ZSAtIDEpKSA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGZpbHRlcmluZyBvciBnZW5lcmF0ZXMgbWlwcyBmb3IgdGV4dHVyZSBiYXNlZCBvbiB3aWR0aCBvciBoZWlnaHRcbiAgICogSWYgd2lkdGggb3IgaGVpZ2h0IGlzIG5vdCBwYXNzZWQgaW4gdXNlcyBgb3B0aW9ucy53aWR0aGAgYW5kLy9vciBgb3B0aW9ucy5oZWlnaHRgXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7V2ViR0xUZXh0dXJlfSB0ZXggdGhlIFdlYkdMVGV4dHVyZSB0byBzZXQgcGFyYW1ldGVycyBmb3JcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30gW29wdGlvbnNdIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqICAgVGhpcyBpcyBvZnRlbiB0aGUgc2FtZSBvcHRpb25zIHlvdSBwYXNzZWQgaW4gd2hlbiB5b3UgY3JlYXRlZCB0aGUgdGV4dHVyZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aF0gd2lkdGggb2YgdGV4dHVyZVxuICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodF0gaGVpZ2h0IG9mIHRleHR1cmVcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBzZXRUZXh0dXJlRmlsdGVyaW5nRm9yU2l6ZShnbCwgdGV4LCBvcHRpb25zLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHMudGV4dHVyZU9wdGlvbnM7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQ7XG4gICAgd2lkdGggPSB3aWR0aCB8fCBvcHRpb25zLndpZHRoO1xuICAgIGhlaWdodCA9IGhlaWdodCB8fCBvcHRpb25zLmhlaWdodDtcbiAgICBnbC5iaW5kVGV4dHVyZSh0YXJnZXQsIHRleCk7XG4gICAgaWYgKCFpc1Bvd2VyT2YyKHdpZHRoKSB8fCAhaXNQb3dlck9mMihoZWlnaHQpKSB7XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVIpO1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaSh0YXJnZXQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKHRhcmdldCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gYXJyYXkgb2YgY3ViZW1hcCBmYWNlIGVudW1zXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IG9wdGlvbnMgQSBUZXh0dXJlT3B0aW9ucyBvYmplY3Qgd2l0aCB3aGF0ZXZlciBwYXJhbWV0ZXJzIHlvdSB3YW50IHNldC5cbiAgICogICBUaGlzIGlzIG9mdGVuIHRoZSBzYW1lIG9wdGlvbnMgeW91IHBhc3NlZCBpbiB3aGVuIHlvdSBjcmVhdGVkIHRoZSB0ZXh0dXJlLlxuICAgKiBAcmV0dXJuIHtudW1iZXJbXX0gY3ViZW1hcCBmYWNlIGVudW1zXG4gICAqL1xuICBmdW5jdGlvbiBnZXRDdWJlRmFjZU9yZGVyKGdsLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgcmV0dXJuIG9wdGlvbnMuY3ViZUZhY2VPcmRlciB8fCBbXG4gICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCxcbiAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YLFxuICAgICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ksXG4gICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWSxcbiAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9aLFxuICAgICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1osXG4gICAgICBdO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IEZhY2VJbmZvXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBmYWNlIGdsIGVudW0gZm9yIHRleEltYWdlMkRcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IG5keCBmYWNlIGluZGV4ICgwIC0gNSkgaW50byBzb3VyY2UgZGF0YVxuICAgKi9cblxuICAvKipcbiAgICogR2V0cyBhbiBhcnJheSBvZiBGYWNlSW5mb3NcbiAgICogVGhlcmUncyBhIGJ1ZyBpbiBzb21lIE5WaWRpYSBkcml2ZXJzIHRoYXQgd2lsbCBjcmFzaCB0aGUgZHJpdmVyIGlmXG4gICAqIGBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1hgIGlzIG5vdCB1cGxvYWRlZCBmaXJzdC4gU28sIHdlIHRha2VcbiAgICogdGhlIHVzZXIncyBkZXNpcmVkIG9yZGVyIGZyb20gaGlzIGZhY2VzIHRvIFdlYkdMIGFuZCBtYWtlIHN1cmUgd2VcbiAgICogZG8gdGhlIGZhY2VzIGluIFdlYkdMIG9yZGVyXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IG9wdGlvbnMgQSBUZXh0dXJlT3B0aW9ucyBvYmplY3Qgd2l0aCB3aGF0ZXZlciBwYXJhbWV0ZXJzIHlvdSB3YW50IHNldC5cbiAgICogQHJldHVybiB7RmFjZUluZm9bXX0gY3ViZW1hcCBmYWNlIGluZm9zLiBBcmd1YWJseSB0aGUgYGZhY2VgIHByb3BlcnR5IG9mIGVhY2ggZWxlbWVudCBpcyByZWR1bmRlbnQgYnV0XG4gICAqICAgIGl0J3MgbmVlZGVkIGludGVybmFsbHkgdG8gc29ydCB0aGUgYXJyYXkgb2YgYG5keGAgcHJvcGVydGllcyBieSBgZmFjZWAuXG4gICAqL1xuICBmdW5jdGlvbiBnZXRDdWJlRmFjZXNXaXRoTmR4KGdsLCBvcHRpb25zKSB7XG4gICAgdmFyIGZhY2VzID0gZ2V0Q3ViZUZhY2VPcmRlcihnbCwgb3B0aW9ucyk7XG4gICAgLy8gd29yayBhcm91bmQgYnVnIGluIE5WaWRpYSBkcml2ZXJzLiBXZSBoYXZlIHRvIHVwbG9hZCB0aGUgZmlyc3QgZmFjZSBmaXJzdCBlbHNlIHRoZSBkcml2ZXIgY3Jhc2hlcyA6KFxuICAgIHZhciBmYWNlc1dpdGhOZHggPSBmYWNlcy5tYXAoZnVuY3Rpb24oZmFjZSwgbmR4KSB7XG4gICAgICByZXR1cm4geyBmYWNlOiBmYWNlLCBuZHg6IG5keCB9O1xuICAgIH0pO1xuICAgIGZhY2VzV2l0aE5keC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhLmZhY2UgLSBiLmZhY2U7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZhY2VzV2l0aE5keDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYSB0ZXh0dXJlIGZyb20gdGhlIGNvbnRlbnRzIG9mIGFuIGVsZW1lbnQuIFdpbGwgYWxzbyBzZXRcbiAgICogdGV4dHVyZSBmaWx0ZXJpbmcgb3IgZ2VuZXJhdGUgbWlwcyBiYXNlZCBvbiB0aGUgZGltZW5zaW9ucyBvZiB0aGUgZWxlbWVudFxuICAgKiB1bmxlc3MgYG9wdGlvbnMuYXV0byA9PT0gZmFsc2VgLiBJZiBgdGFyZ2V0ID09PSBnbC5URVhUVVJFX0NVQkVfTUFQYCB3aWxsXG4gICAqIGF0dGVtcHQgdG8gc2xpY2UgaW1hZ2UgaW50byAxeDYsIDJ4MywgM3gyLCBvciA2eDEgaW1hZ2VzLCBvbmUgZm9yIGVhY2ggZmFjZS5cbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHtXZWJHTFRleHR1cmV9IHRleCB0aGUgV2ViR0xUZXh0dXJlIHRvIHNldCBwYXJhbWV0ZXJzIGZvclxuICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50IGEgY2FudmFzLCBpbWcsIG9yIHZpZGVvIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IFtvcHRpb25zXSBBIFRleHR1cmVPcHRpb25zIG9iamVjdCB3aXRoIHdoYXRldmVyIHBhcmFtZXRlcnMgeW91IHdhbnQgc2V0LlxuICAgKiAgIFRoaXMgaXMgb2Z0ZW4gdGhlIHNhbWUgb3B0aW9ucyB5b3UgcGFzc2VkIGluIHdoZW4geW91IGNyZWF0ZWQgdGhlIHRleHR1cmUuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKiBAa2luZCBmdW5jdGlvblxuICAgKi9cbiAgdmFyIHNldFRleHR1cmVGcm9tRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjdHggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICByZXR1cm4gZnVuY3Rpb24gc2V0VGV4dHVyZUZyb21FbGVtZW50KGdsLCB0ZXgsIGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzLnRleHR1cmVPcHRpb25zO1xuICAgICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQ7XG4gICAgICB2YXIgd2lkdGggPSBlbGVtZW50LndpZHRoO1xuICAgICAgdmFyIGhlaWdodCA9IGVsZW1lbnQuaGVpZ2h0O1xuICAgICAgdmFyIGZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0IHx8IGdsLlJHQkE7XG4gICAgICB2YXIgdHlwZSA9IG9wdGlvbnMudHlwZSB8fCBnbC5VTlNJR05FRF9CWVRFO1xuICAgICAgc2F2ZVBhY2tTdGF0ZShnbCwgb3B0aW9ucyk7XG4gICAgICBnbC5iaW5kVGV4dHVyZSh0YXJnZXQsIHRleCk7XG4gICAgICBpZiAodGFyZ2V0ID09PSBnbC5URVhUVVJFX0NVQkVfTUFQKSB7XG4gICAgICAgIC8vIGd1ZXNzIHRoZSBwYXJ0c1xuICAgICAgICB2YXIgaW1nV2lkdGggID0gZWxlbWVudC53aWR0aDtcbiAgICAgICAgdmFyIGltZ0hlaWdodCA9IGVsZW1lbnQuaGVpZ2h0O1xuICAgICAgICB2YXIgc2l6ZTtcbiAgICAgICAgdmFyIHNsaWNlcztcbiAgICAgICAgaWYgKGltZ1dpZHRoIC8gNiA9PT0gaW1nSGVpZ2h0KSB7XG4gICAgICAgICAgLy8gSXQncyA2eDFcbiAgICAgICAgICBzaXplID0gaW1nSGVpZ2h0O1xuICAgICAgICAgIHNsaWNlcyA9IFswLCAwLCAxLCAwLCAyLCAwLCAzLCAwLCA0LCAwLCA1LCAwXTtcbiAgICAgICAgfSBlbHNlIGlmIChpbWdIZWlnaHQgLyA2ID09PSBpbWdXaWR0aCkge1xuICAgICAgICAgIC8vIEl0J3MgMXg2XG4gICAgICAgICAgc2l6ZSA9IGltZ1dpZHRoO1xuICAgICAgICAgIHNsaWNlcyA9IFswLCAwLCAwLCAxLCAwLCAyLCAwLCAzLCAwLCA0LCAwLCA1XTtcbiAgICAgICAgfSBlbHNlIGlmIChpbWdXaWR0aCAvIDMgPT09IGltZ0hlaWdodCAvIDIpIHtcbiAgICAgICAgICAvLyBJdCdzIDN4MlxuICAgICAgICAgIHNpemUgPSBpbWdXaWR0aCAvIDM7XG4gICAgICAgICAgc2xpY2VzID0gWzAsIDAsIDEsIDAsIDIsIDAsIDAsIDEsIDEsIDEsIDIsIDFdO1xuICAgICAgICB9IGVsc2UgaWYgKGltZ1dpZHRoIC8gMiA9PT0gaW1nSGVpZ2h0IC8gMykge1xuICAgICAgICAgIC8vIEl0J3MgMngzXG4gICAgICAgICAgc2l6ZSA9IGltZ1dpZHRoIC8gMjtcbiAgICAgICAgICBzbGljZXMgPSBbMCwgMCwgMSwgMCwgMCwgMSwgMSwgMSwgMCwgMiwgMSwgMl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgXCJjYW4ndCBmaWd1cmUgb3V0IGN1YmUgbWFwIGZyb20gZWxlbWVudDogXCIgKyAoZWxlbWVudC5zcmMgPyBlbGVtZW50LnNyYyA6IGVsZW1lbnQubm9kZU5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIGN0eC5jYW52YXMud2lkdGggPSBzaXplO1xuICAgICAgICBjdHguY2FudmFzLmhlaWdodCA9IHNpemU7XG4gICAgICAgIHdpZHRoID0gc2l6ZTtcbiAgICAgICAgaGVpZ2h0ID0gc2l6ZTtcbiAgICAgICAgZ2V0Q3ViZUZhY2VzV2l0aE5keChnbCwgb3B0aW9ucykuZm9yRWFjaChmdW5jdGlvbihmKSB7XG4gICAgICAgICAgdmFyIHhPZmZzZXQgPSBzbGljZXNbZi5uZHggKiAyICsgMF0gKiBzaXplO1xuICAgICAgICAgIHZhciB5T2Zmc2V0ID0gc2xpY2VzW2YubmR4ICogMiArIDFdICogc2l6ZTtcbiAgICAgICAgICBjdHguZHJhd0ltYWdlKGVsZW1lbnQsIHhPZmZzZXQsIHlPZmZzZXQsIHNpemUsIHNpemUsIDAsIDAsIHNpemUsIHNpemUpO1xuICAgICAgICAgIGdsLnRleEltYWdlMkQoZi5mYWNlLCAwLCBmb3JtYXQsIGZvcm1hdCwgdHlwZSwgY3R4LmNhbnZhcyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBGcmVlIHVwIHRoZSBjYW52YXMgbWVtb3J5XG4gICAgICAgIGN0eC5jYW52YXMud2lkdGggPSAxO1xuICAgICAgICBjdHguY2FudmFzLmhlaWdodCA9IDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnbC50ZXhJbWFnZTJEKHRhcmdldCwgMCwgZm9ybWF0LCBmb3JtYXQsIHR5cGUsIGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgcmVzdG9yZVBhY2tTdGF0ZShnbCwgb3B0aW9ucyk7XG4gICAgICBpZiAob3B0aW9ucy5hdXRvICE9PSBmYWxzZSkge1xuICAgICAgICBzZXRUZXh0dXJlRmlsdGVyaW5nRm9yU2l6ZShnbCwgdGV4LCBvcHRpb25zLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgIH1cbiAgICAgIHNldFRleHR1cmVQYXJhbWV0ZXJzKGdsLCB0ZXgsIG9wdGlvbnMpO1xuICAgIH07XG4gIH0oKTtcblxuICBmdW5jdGlvbiBub29wKCkge1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIGFuIGltYWdlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgdXJsIHRvIGltYWdlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb24oZXJyLCBpbWcpfSBbY2FsbGJhY2tdIGEgY2FsbGJhY2sgdGhhdCdzIHBhc3NlZCBhbiBlcnJvciBhbmQgdGhlIGltYWdlLiBUaGUgZXJyb3Igd2lsbCBiZSBub24tbnVsbFxuICAgKiAgICAgaWYgdGhlcmUgd2FzIGFuIGVycm9yXG4gICAqIEByZXR1cm4ge0hUTUxJbWFnZUVsZW1lbnR9IHRoZSBpbWFnZSBiZWluZyBsb2FkZWQuXG4gICAqL1xuICBmdW5jdGlvbiBsb2FkSW1hZ2UodXJsLCBjcm9zc09yaWdpbiwgY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGNyb3NzT3JpZ2luID0gY3Jvc3NPcmlnaW4gIT09IHVuZGVmaW5lZCA/IGNyb3NzT3JpZ2luIDogZGVmYXVsdHMuY3Jvc3NPcmlnaW47XG4gICAgaWYgKGNyb3NzT3JpZ2luICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGltZy5jcm9zc09yaWdpbiA9IGNyb3NzT3JpZ2luO1xuICAgIH1cbiAgICBpbWcub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG1zZyA9IFwiY291bGRuJ3QgbG9hZCBpbWFnZTogXCIgKyB1cmw7XG4gICAgICBlcnJvcihtc2cpO1xuICAgICAgY2FsbGJhY2sobXNnLCBpbWcpO1xuICAgIH07XG4gICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgaW1nKTtcbiAgICB9O1xuICAgIGltZy5zcmMgPSB1cmw7XG4gICAgcmV0dXJuIGltZztcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgdGV4dHVyZSB0byBhIDF4MSBwaXhlbCBjb2xvci4gSWYgYG9wdGlvbnMuY29sb3IgPT09IGZhbHNlYCBpcyBub3RoaW5nIGhhcHBlbnMuIElmIGl0J3Mgbm90IHNldFxuICAgKiB0aGUgZGVmYXVsdCB0ZXh0dXJlIGNvbG9yIGlzIHVzZWQgd2hpY2ggY2FuIGJlIHNldCBieSBjYWxsaW5nIGBzZXREZWZhdWx0VGV4dHVyZUNvbG9yYC5cbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHtXZWJHTFRleHR1cmV9IHRleCB0aGUgV2ViR0xUZXh0dXJlIHRvIHNldCBwYXJhbWV0ZXJzIGZvclxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBbb3B0aW9uc10gQSBUZXh0dXJlT3B0aW9ucyBvYmplY3Qgd2l0aCB3aGF0ZXZlciBwYXJhbWV0ZXJzIHlvdSB3YW50IHNldC5cbiAgICogICBUaGlzIGlzIG9mdGVuIHRoZSBzYW1lIG9wdGlvbnMgeW91IHBhc3NlZCBpbiB3aGVuIHlvdSBjcmVhdGVkIHRoZSB0ZXh0dXJlLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIHNldFRleHR1cmVUbzFQaXhlbENvbG9yKGdsLCB0ZXgsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cy50ZXh0dXJlT3B0aW9ucztcbiAgICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQgfHwgZ2wuVEVYVFVSRV8yRDtcbiAgICBnbC5iaW5kVGV4dHVyZSh0YXJnZXQsIHRleCk7XG4gICAgaWYgKG9wdGlvbnMuY29sb3IgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIEFzc3VtZSBpdCdzIGEgVVJMXG4gICAgLy8gUHV0IDF4MSBwaXhlbHMgaW4gdGV4dHVyZS4gVGhhdCBtYWtlcyBpdCByZW5kZXJhYmxlIGltbWVkaWF0ZWx5IHJlZ2FyZGxlc3Mgb2YgZmlsdGVyaW5nLlxuICAgIHZhciBjb2xvciA9IG1ha2UxUGl4ZWwob3B0aW9ucy5jb2xvcik7XG4gICAgaWYgKHRhcmdldCA9PT0gZ2wuVEVYVFVSRV9DVUJFX01BUCkge1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDY7ICsraWkpIHtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyBpaSwgMCwgZ2wuUkdCQSwgMSwgMSwgMCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgY29sb3IpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBnbC50ZXhJbWFnZTJEKHRhcmdldCwgMCwgZ2wuUkdCQSwgMSwgMSwgMCwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgY29sb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgc3JjIGltYWdlKHMpIHVzZWQgdG8gY3JlYXRlIGEgdGV4dHVyZS5cbiAgICpcbiAgICogV2hlbiB5b3UgY2FsbCB7QGxpbmsgbW9kdWxlOnR3Z2wuY3JlYXRlVGV4dHVyZX0gb3Ige0BsaW5rIG1vZHVsZTp0d2dsLmNyZWF0ZVRleHR1cmVzfVxuICAgKiB5b3UgY2FuIHBhc3MgaW4gdXJscyBmb3IgaW1hZ2VzIHRvIGxvYWQgaW50byB0aGUgdGV4dHVyZXMuIElmIGl0J3MgYSBzaW5nbGUgdXJsXG4gICAqIHRoZW4gdGhpcyB3aWxsIGJlIGEgc2luZ2xlIEhUTUxJbWFnZUVsZW1lbnQuIElmIGl0J3MgYW4gYXJyYXkgb2YgdXJscyB1c2VkIGZvciBhIGN1YmVtYXBcbiAgICogdGhpcyB3aWxsIGJlIGEgY29ycmVzcG9uZGluZyBhcnJheSBvZiBpbWFnZXMgZm9yIHRoZSBjdWJlbWFwLlxuICAgKlxuICAgKiBAdHlwZWRlZiB7SFRNTEltYWdlRWxlbWVudHxIVE1MSW1hZ2VFbGVtZW50W119IFRleHR1cmVTcmNcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG4gIC8qKlxuICAgKiBBIGNhbGxiYWNrIGZvciB3aGVuIGFuIGltYWdlIGZpbmlzaGVkIGRvd25sb2FkaW5nIGFuZCBiZWVuIHVwbG9hZGVkIGludG8gYSB0ZXh0dXJlXG4gICAqIEBjYWxsYmFjayBUZXh0dXJlUmVhZHlDYWxsYmFja1xuICAgKiBAcGFyYW0geyp9IGVyciBJZiB0cnV0aHkgdGhlcmUgd2FzIGFuIGVycm9yLlxuICAgKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4dHVyZSB0aGUgdGV4dHVyZS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlU3JjfSBzb3VjZSBpbWFnZShzKSB1c2VkIHRvIGFzIHRoZSBzcmMgZm9yIHRoZSB0ZXh0dXJlXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogQSBjYWxsYmFjayBmb3Igd2hlbiBhbGwgaW1hZ2VzIGhhdmUgZmluaXNoZWQgZG93bmxvYWRpbmcgYW5kIGJlZW4gdXBsb2FkZWQgaW50byB0aGVpciByZXNwZWN0aXZlIHRleHR1cmVzXG4gICAqIEBjYWxsYmFjayBUZXh0dXJlc1JlYWR5Q2FsbGJhY2tcbiAgICogQHBhcmFtIHsqfSBlcnIgSWYgdHJ1dGh5IHRoZXJlIHdhcyBhbiBlcnJvci5cbiAgICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgV2ViR0xUZXh0dXJlPn0gdGV4dHVyZXMgdGhlIGNyZWF0ZWQgdGV4dHVyZXMgYnkgbmFtZS4gU2FtZSBhcyByZXR1cm5lZCBieSB7QGxpbmsgbW9kdWxlOnR3Z2wuY3JlYXRlVGV4dHVyZXN9LlxuICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCBtb2R1bGU6dHdnbC5UZXh0dXJlU3JjPn0gc291cmNlcyB0aGUgaW1hZ2UocykgdXNlZCBmb3IgdGhlIHRleHR1cmUgYnkgbmFtZS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG4gIC8qKlxuICAgKiBBIGNhbGxiYWNrIGZvciB3aGVuIGFuIGltYWdlIGZpbmlzaGVkIGRvd25sb2FkaW5nIGFuZCBiZWVuIHVwbG9hZGVkIGludG8gYSB0ZXh0dXJlXG4gICAqIEBjYWxsYmFjayBDdWJlbWFwUmVhZHlDYWxsYmFja1xuICAgKiBAcGFyYW0geyp9IGVyciBJZiB0cnV0aHkgdGhlcmUgd2FzIGFuIGVycm9yLlxuICAgKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4IHRoZSB0ZXh0dXJlLlxuICAgKiBAcGFyYW0ge0hUTUxJbWFnZUVsZW1lbnRbXX0gaW1ncyB0aGUgaW1hZ2VzIGZvciBlYWNoIGZhY2UuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogTG9hZHMgYSB0ZXh0dXJlIGZyb20gYW4gaW1hZ2UgZnJvbSBhIFVybCBhcyBzcGVjaWZpZWQgaW4gYG9wdGlvbnMuc3JjYFxuICAgKiBJZiBgb3B0aW9ucy5jb2xvciAhPT0gZmFsc2VgIHdpbGwgc2V0IHRoZSB0ZXh0dXJlIHRvIGEgMXgxIHBpeGVsIGNvbG9yIHNvIHRoYXQgdGhlIHRleHR1cmUgaXNcbiAgICogaW1tZWRpYXRlbHkgdXNlYWJsZS4gSXQgd2lsbCBiZSB1cGRhdGVkIHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSBpbWFnZSBvbmNlIHRoZSBpbWFnZSBoYXMgZmluaXNoZWRcbiAgICogZG93bmxvYWRpbmcuIEZpbHRlcmluZyBvcHRpb25zIHdpbGwgYmUgc2V0IGFzIGFwcHJvcmlhdGUgZm9yIGltYWdlIHVubGVzcyBgb3B0aW9ucy5hdXRvID09PSBmYWxzZWAuXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7V2ViR0xUZXh0dXJlfSB0ZXggdGhlIFdlYkdMVGV4dHVyZSB0byBzZXQgcGFyYW1ldGVycyBmb3JcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30gW29wdGlvbnNdIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZVJlYWR5Q2FsbGJhY2t9IFtjYWxsYmFja10gQSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgaW1hZ2UgaGFzIGZpbmlzaGVkIGxvYWRpbmcuIGVyciB3aWxsXG4gICAqICAgIGJlIG5vbiBudWxsIGlmIHRoZXJlIHdhcyBhbiBlcnJvci5cbiAgICogQHJldHVybiB7SFRNTEltYWdlRWxlbWVudH0gdGhlIGltYWdlIGJlaW5nIGRvd25sb2FkZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gbG9hZFRleHR1cmVGcm9tVXJsKGdsLCB0ZXgsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzLnRleHR1cmVPcHRpb25zO1xuICAgIHNldFRleHR1cmVUbzFQaXhlbENvbG9yKGdsLCB0ZXgsIG9wdGlvbnMpO1xuICAgIC8vIEJlY2F1c2UgaXQncyBhc3luYyB3ZSBuZWVkIHRvIGNvcHkgdGhlIG9wdGlvbnMuXG4gICAgb3B0aW9ucyA9IHV0aWxzLnNoYWxsb3dDb3B5KG9wdGlvbnMpO1xuICAgIHZhciBpbWcgPSBsb2FkSW1hZ2Uob3B0aW9ucy5zcmMsIG9wdGlvbnMuY3Jvc3NPcmlnaW4sIGZ1bmN0aW9uKGVyciwgaW1nKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNhbGxiYWNrKGVyciwgdGV4LCBpbWcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGV4dHVyZUZyb21FbGVtZW50KGdsLCB0ZXgsIGltZywgb3B0aW9ucyk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHRleCwgaW1nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gaW1nO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIGEgY3ViZW1hcCBmcm9tIDYgdXJscyBhcyBzcGVjaWZpZWQgaW4gYG9wdGlvbnMuc3JjYC4gV2lsbCBzZXQgdGhlIGN1YmVtYXAgdG8gYSAxeDEgcGl4ZWwgY29sb3JcbiAgICogc28gdGhhdCBpdCBpcyB1c2FibGUgaW1tZWRpYXRlbHkgdW5sZXNzIGBvcHRpb24uY29sb3IgPT09IGZhbHNlYC5cbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHtXZWJHTFRleHR1cmV9IHRleCB0aGUgV2ViR0xUZXh0dXJlIHRvIHNldCBwYXJhbWV0ZXJzIGZvclxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBvcHRpb25zIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuQ3ViZW1hcFJlYWR5Q2FsbGJhY2t9IFtjYWxsYmFja10gQSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiBhbGwgdGhlIGltYWdlcyBoYXZlIGZpbmlzaGVkIGxvYWRpbmcuIGVyciB3aWxsXG4gICAqICAgIGJlIG5vbiBudWxsIGlmIHRoZXJlIHdhcyBhbiBlcnJvci5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBsb2FkQ3ViZW1hcEZyb21VcmxzKGdsLCB0ZXgsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgIHZhciB1cmxzID0gb3B0aW9ucy5zcmM7XG4gICAgaWYgKHVybHMubGVuZ3RoICE9PSA2KSB7XG4gICAgICB0aHJvdyBcInRoZXJlIG11c3QgYmUgNiB1cmxzIGZvciBhIGN1YmVtYXBcIjtcbiAgICB9XG4gICAgdmFyIGZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0IHx8IGdsLlJHQkE7XG4gICAgdmFyIHR5cGUgPSBvcHRpb25zLnR5cGUgfHwgZ2wuVU5TSUdORURfQllURTtcbiAgICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQgfHwgZ2wuVEVYVFVSRV8yRDtcbiAgICBpZiAodGFyZ2V0ICE9PSBnbC5URVhUVVJFX0NVQkVfTUFQKSB7XG4gICAgICB0aHJvdyBcInRhcmdldCBtdXN0IGJlIFRFWFRVUkVfQ1VCRV9NQVBcIjtcbiAgICB9XG4gICAgc2V0VGV4dHVyZVRvMVBpeGVsQ29sb3IoZ2wsIHRleCwgb3B0aW9ucyk7XG4gICAgLy8gQmVjYXVzZSBpdCdzIGFzeW5jIHdlIG5lZWQgdG8gY29weSB0aGUgb3B0aW9ucy5cbiAgICBvcHRpb25zID0gdXRpbHMuc2hhbGxvd0NvcHkob3B0aW9ucyk7XG4gICAgdmFyIG51bVRvTG9hZCA9IDY7XG4gICAgdmFyIGVycm9ycyA9IFtdO1xuICAgIHZhciBpbWdzO1xuICAgIHZhciBmYWNlcyA9IGdldEN1YmVGYWNlT3JkZXIoZ2wsIG9wdGlvbnMpO1xuXG4gICAgZnVuY3Rpb24gdXBsb2FkSW1nKGZhY2VUYXJnZXQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlcnIsIGltZykge1xuICAgICAgICAtLW51bVRvTG9hZDtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGVycm9ycy5wdXNoKGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGltZy53aWR0aCAhPT0gaW1nLmhlaWdodCkge1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goXCJjdWJlbWFwIGZhY2UgaW1nIGlzIG5vdCBhIHNxdWFyZTogXCIgKyBpbWcuc3JjKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2F2ZVBhY2tTdGF0ZShnbCwgb3B0aW9ucyk7XG4gICAgICAgICAgICBnbC5iaW5kVGV4dHVyZSh0YXJnZXQsIHRleCk7XG5cbiAgICAgICAgICAgIC8vIFNvIGFzc3VtaW5nIHRoaXMgaXMgdGhlIGZpcnN0IGltYWdlIHdlIG5vdyBoYXZlIG9uZSBmYWNlIHRoYXQncyBpbWcgc2l6ZWRcbiAgICAgICAgICAgIC8vIGFuZCA1IGZhY2VzIHRoYXQgYXJlIDF4MSBwaXhlbCBzbyBzaXplIHRoZSBvdGhlciBmYWNlc1xuICAgICAgICAgICAgaWYgKG51bVRvTG9hZCA9PT0gNSkge1xuICAgICAgICAgICAgICAvLyB1c2UgdGhlIGRlZmF1bHQgb3JkZXJcbiAgICAgICAgICAgICAgZ2V0Q3ViZUZhY2VPcmRlcihnbCkuZm9yRWFjaChmdW5jdGlvbihvdGhlclRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8vIFNob3VsZCB3ZSByZS11c2UgdGhlIHNhbWUgZmFjZSBvciBhIGNvbG9yP1xuICAgICAgICAgICAgICAgIGdsLnRleEltYWdlMkQob3RoZXJUYXJnZXQsIDAsIGZvcm1hdCwgZm9ybWF0LCB0eXBlLCBpbWcpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGdsLnRleEltYWdlMkQoZmFjZVRhcmdldCwgMCwgZm9ybWF0LCBmb3JtYXQsIHR5cGUsIGltZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3RvcmVQYWNrU3RhdGUoZ2wsIG9wdGlvbnMpO1xuICAgICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAodGFyZ2V0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobnVtVG9Mb2FkID09PSAwKSB7XG4gICAgICAgICAgY2FsbGJhY2soZXJyb3JzLmxlbmd0aCA/IGVycm9ycyA6IHVuZGVmaW5lZCwgaW1ncywgdGV4KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpbWdzID0gdXJscy5tYXAoZnVuY3Rpb24odXJsLCBuZHgpIHtcbiAgICAgIHJldHVybiBsb2FkSW1hZ2UodXJsLCBvcHRpb25zLmNyb3NzT3JpZ2luLCB1cGxvYWRJbWcoZmFjZXNbbmR4XSkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG51bWJlciBvZiBjb21wb250ZW50cyBmb3IgYSBnaXZlbiBpbWFnZSBmb3JtYXQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmb3JtYXQgdGhlIGZvcm1hdC5cbiAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGNvbXBvbmVudHMgZm9yIHRoZSBmb3JtYXQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0TnVtQ29tcG9uZW50c0ZvckZvcm1hdChmb3JtYXQpIHtcbiAgICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgICAgY2FzZSBBTFBIQTpcbiAgICAgIGNhc2UgTFVNSU5BTkNFOlxuICAgICAgICByZXR1cm4gMTtcbiAgICAgIGNhc2UgTFVNSU5BTkNFX0FMUEhBOlxuICAgICAgICByZXR1cm4gMjtcbiAgICAgIGNhc2UgUkdCOlxuICAgICAgICByZXR1cm4gMztcbiAgICAgIGNhc2UgUkdCQTpcbiAgICAgICAgcmV0dXJuIDQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBcInVua25vd24gdHlwZTogXCIgKyBmb3JtYXQ7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHRleHR1cmUgdHlwZSBmb3IgYSBnaXZlbiBhcnJheSB0eXBlLlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBnbCB0ZXh0dXJlIHR5cGVcbiAgICovXG4gIGZ1bmN0aW9uIGdldFRleHR1cmVUeXBlRm9yQXJyYXlUeXBlKGdsLCBzcmMpIHtcbiAgICBpZiAoaXNBcnJheUJ1ZmZlcihzcmMpKSB7XG4gICAgICByZXR1cm4gdHlwZWRBcnJheXMuZ2V0R0xUeXBlRm9yVHlwZWRBcnJheShzcmMpO1xuICAgIH1cbiAgICByZXR1cm4gZ2wuVU5TSUdORURfQllURTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgdGV4dHVyZSBmcm9tIGFuIGFycmF5IG9yIHR5cGVkIGFycmF5LiBJZiB0aGUgd2lkdGggb3IgaGVpZ2h0IGlzIG5vdCBwcm92aWRlZCB3aWxsIGF0dGVtcHQgdG9cbiAgICogZ3Vlc3MgdGhlIHNpemUuIFNlZSB7QGxpbmsgbW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9LlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4IHRoZSBXZWJHTFRleHR1cmUgdG8gc2V0IHBhcmFtZXRlcnMgZm9yXG4gICAqIEBwYXJhbSB7KG51bWJlcltdfEFycmF5QnVmZmVyKX0gc3JjIEFuIGFycmF5IG9yIHR5cGVkIGFycnkgd2l0aCB0ZXh0dXJlIGRhdGEuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IFtvcHRpb25zXSBBIFRleHR1cmVPcHRpb25zIG9iamVjdCB3aXRoIHdoYXRldmVyIHBhcmFtZXRlcnMgeW91IHdhbnQgc2V0LlxuICAgKiAgIFRoaXMgaXMgb2Z0ZW4gdGhlIHNhbWUgb3B0aW9ucyB5b3UgcGFzc2VkIGluIHdoZW4geW91IGNyZWF0ZWQgdGhlIHRleHR1cmUuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0VGV4dHVyZUZyb21BcnJheShnbCwgdGV4LCBzcmMsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cy50ZXh0dXJlT3B0aW9ucztcbiAgICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQgfHwgZ2wuVEVYVFVSRV8yRDtcbiAgICBnbC5iaW5kVGV4dHVyZSh0YXJnZXQsIHRleCk7XG4gICAgdmFyIHdpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgdmFyIGZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0IHx8IGdsLlJHQkE7XG4gICAgdmFyIHR5cGUgPSBvcHRpb25zLnR5cGUgfHwgZ2V0VGV4dHVyZVR5cGVGb3JBcnJheVR5cGUoZ2wsIHNyYyk7XG4gICAgdmFyIG51bUNvbXBvbmVudHMgPSBnZXROdW1Db21wb25lbnRzRm9yRm9ybWF0KGZvcm1hdCk7XG4gICAgdmFyIG51bUVsZW1lbnRzID0gc3JjLmxlbmd0aCAvIG51bUNvbXBvbmVudHM7XG4gICAgaWYgKG51bUVsZW1lbnRzICUgMSkge1xuICAgICAgdGhyb3cgXCJsZW5ndGggd3Jvbmcgc2l6ZSBmb3IgZm9ybWF0OiBcIiArIGdsRW51bVRvU3RyaW5nKGdsLCBmb3JtYXQpO1xuICAgIH1cbiAgICBpZiAoIXdpZHRoICYmICFoZWlnaHQpIHtcbiAgICAgIHZhciBzaXplID0gTWF0aC5zcXJ0KG51bUVsZW1lbnRzIC8gKHRhcmdldCA9PT0gZ2wuVEVYVFVSRV9DVUJFX01BUCA/IDYgOiAxKSk7XG4gICAgICBpZiAoc2l6ZSAlIDEgPT09IDApIHtcbiAgICAgICAgd2lkdGggPSBzaXplO1xuICAgICAgICBoZWlnaHQgPSBzaXplO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2lkdGggPSBudW1FbGVtZW50cztcbiAgICAgICAgaGVpZ2h0ID0gMTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFoZWlnaHQpIHtcbiAgICAgIGhlaWdodCA9IG51bUVsZW1lbnRzIC8gd2lkdGg7XG4gICAgICBpZiAoaGVpZ2h0ICUgMSkge1xuICAgICAgICB0aHJvdyBcImNhbid0IGd1ZXNzIGhlaWdodFwiO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIXdpZHRoKSB7XG4gICAgICB3aWR0aCA9IG51bUVsZW1lbnRzIC8gaGVpZ2h0O1xuICAgICAgaWYgKHdpZHRoICUgMSkge1xuICAgICAgICB0aHJvdyBcImNhbid0IGd1ZXNzIHdpZHRoXCI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghaXNBcnJheUJ1ZmZlcihzcmMpKSB7XG4gICAgICB2YXIgVHlwZSA9IHR5cGVkQXJyYXlzLmdldFR5cGVkQXJyYXlUeXBlRm9yR0xUeXBlKHR5cGUpO1xuICAgICAgc3JjID0gbmV3IFR5cGUoc3JjKTtcbiAgICB9XG4gICAgZ2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0FMSUdOTUVOVCwgb3B0aW9ucy51bnBhY2tBbGlnbm1lbnQgfHwgMSk7XG4gICAgc2F2ZVBhY2tTdGF0ZShnbCwgb3B0aW9ucyk7XG4gICAgaWYgKHRhcmdldCA9PT0gZ2wuVEVYVFVSRV9DVUJFX01BUCkge1xuICAgICAgdmFyIGZhY2VTaXplID0gbnVtRWxlbWVudHMgLyA2ICogbnVtQ29tcG9uZW50cztcbiAgICAgIGdldEN1YmVGYWNlc1dpdGhOZHgoZ2wsIG9wdGlvbnMpLmZvckVhY2goZnVuY3Rpb24oZikge1xuICAgICAgICB2YXIgb2Zmc2V0ID0gZmFjZVNpemUgKiBmLm5keDtcbiAgICAgICAgdmFyIGRhdGEgPSBzcmMuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyBmYWNlU2l6ZSk7XG4gICAgICAgIGdsLnRleEltYWdlMkQoZi5mYWNlLCAwLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIDAsIGZvcm1hdCwgdHlwZSwgZGF0YSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIDAsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCwgMCwgZm9ybWF0LCB0eXBlLCBzcmMpO1xuICAgIH1cbiAgICByZXN0b3JlUGFja1N0YXRlKGdsLCBvcHRpb25zKTtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgdGV4dHVyZSB3aXRoIG5vIGNvbnRlbnRzIG9mIGEgY2VydGFpbiBzaXplLiBJbiBvdGhlciB3b3JkcyBjYWxscyBgZ2wudGV4SW1hZ2UyRGAgd2l0aCBgbnVsbGAuXG4gICAqIFlvdSBtdXN0IHNldCBgb3B0aW9ucy53aWR0aGAgYW5kIGBvcHRpb25zLmhlaWdodGAuXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7V2ViR0xUZXh0dXJlfSB0ZXggdGhlIFdlYkdMVGV4dHVyZSB0byBzZXQgcGFyYW1ldGVycyBmb3JcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30gb3B0aW9ucyBBIFRleHR1cmVPcHRpb25zIG9iamVjdCB3aXRoIHdoYXRldmVyIHBhcmFtZXRlcnMgeW91IHdhbnQgc2V0LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIHNldEVtcHR5VGV4dHVyZShnbCwgdGV4LCBvcHRpb25zKSB7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQ7XG4gICAgZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXgpO1xuICAgIHZhciBmb3JtYXQgPSBvcHRpb25zLmZvcm1hdCB8fCBnbC5SR0JBO1xuICAgIHZhciB0eXBlID0gb3B0aW9ucy50eXBlIHx8IGdsLlVOU0lHTkVEX0JZVEU7XG4gICAgc2F2ZVBhY2tTdGF0ZShnbCwgb3B0aW9ucyk7XG4gICAgaWYgKHRhcmdldCA9PT0gZ2wuVEVYVFVSRV9DVUJFX01BUCkge1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDY7ICsraWkpIHtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyBpaSwgMCwgZm9ybWF0LCBvcHRpb25zLndpZHRoLCBvcHRpb25zLmhlaWdodCwgMCwgZm9ybWF0LCB0eXBlLCBudWxsKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIDAsIGZvcm1hdCwgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQsIDAsIGZvcm1hdCwgdHlwZSwgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB0ZXh0dXJlIGJhc2VkIG9uIHRoZSBvcHRpb25zIHBhc3NlZCBpbi5cbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30gW29wdGlvbnNdIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZVJlYWR5Q2FsbGJhY2t9IFtjYWxsYmFja10gQSBjYWxsYmFjayBjYWxsZWQgd2hlbiBhbiBpbWFnZSBoYXMgYmVlbiBkb3dubG9hZGVkIGFuZCB1cGxvYWRlZCB0byB0aGUgdGV4dHVyZS5cbiAgICogQHJldHVybiB7V2ViR0xUZXh0dXJlfSB0aGUgY3JlYXRlZCB0ZXh0dXJlLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZVRleHR1cmUoZ2wsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzLnRleHR1cmVPcHRpb25zO1xuICAgIHZhciB0ZXggPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQ7XG4gICAgdmFyIHdpZHRoICA9IG9wdGlvbnMud2lkdGggIHx8IDE7XG4gICAgdmFyIGhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0IHx8IDE7XG4gICAgZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXgpO1xuICAgIGlmICh0YXJnZXQgPT09IGdsLlRFWFRVUkVfQ1VCRV9NQVApIHtcbiAgICAgIC8vIHRoaXMgc2hvdWxkIGhhdmUgYmVlbiB0aGUgZGVmYXVsdCBmb3IgQ1VCRU1BUFMgOihcbiAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgIH1cbiAgICB2YXIgc3JjID0gb3B0aW9ucy5zcmM7XG4gICAgaWYgKHNyYykge1xuICAgICAgaWYgKHR5cGVvZiBzcmMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBzcmMgPSBzcmMoZ2wsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiAoc3JjKSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBsb2FkVGV4dHVyZUZyb21VcmwoZ2wsIHRleCwgb3B0aW9ucywgY2FsbGJhY2spO1xuICAgICAgfSBlbHNlIGlmIChpc0FycmF5QnVmZmVyKHNyYykgfHxcbiAgICAgICAgICAgICAgICAgKEFycmF5LmlzQXJyYXkoc3JjKSAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIHNyY1swXSA9PT0gJ251bWJlcicgfHxcbiAgICAgICAgICAgICAgICAgICAgICBBcnJheS5pc0FycmF5KHNyY1swXSkgfHxcbiAgICAgICAgICAgICAgICAgICAgICBpc0FycmF5QnVmZmVyKHNyY1swXSkpXG4gICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgdmFyIGRpbWVuc2lvbnMgPSBzZXRUZXh0dXJlRnJvbUFycmF5KGdsLCB0ZXgsIHNyYywgb3B0aW9ucyk7XG4gICAgICAgIHdpZHRoICA9IGRpbWVuc2lvbnMud2lkdGg7XG4gICAgICAgIGhlaWdodCA9IGRpbWVuc2lvbnMuaGVpZ2h0O1xuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNyYykgJiYgdHlwZW9mIChzcmNbMF0pID09PSAnc3RyaW5nJykge1xuICAgICAgICBsb2FkQ3ViZW1hcEZyb21VcmxzKGdsLCB0ZXgsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSBpZiAoc3JjIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgc2V0VGV4dHVyZUZyb21FbGVtZW50KGdsLCB0ZXgsIHNyYywgb3B0aW9ucyk7XG4gICAgICAgIHdpZHRoICA9IHNyYy53aWR0aDtcbiAgICAgICAgaGVpZ2h0ID0gc3JjLmhlaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFwidW5zdXBwb3J0ZWQgc3JjIHR5cGVcIjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc2V0RW1wdHlUZXh0dXJlKGdsLCB0ZXgsIG9wdGlvbnMpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5hdXRvICE9PSBmYWxzZSkge1xuICAgICAgc2V0VGV4dHVyZUZpbHRlcmluZ0ZvclNpemUoZ2wsIHRleCwgb3B0aW9ucywgd2lkdGgsIGhlaWdodCk7XG4gICAgfVxuICAgIHNldFRleHR1cmVQYXJhbWV0ZXJzKGdsLCB0ZXgsIG9wdGlvbnMpO1xuICAgIHJldHVybiB0ZXg7XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplcyBhIHRleHR1cmUgYmFzZWQgb24gdGhlIG9wdGlvbnMgcGFzc2VkIGluLlxuICAgKlxuICAgKiBOb3RlOiBUaGlzIGlzIG5vdCBhIGdlbmVyaWMgcmVzaXplIGFueXRoaW5nIGZ1bmN0aW9uLlxuICAgKiBJdCdzIG1vc3RseSB1c2VkIGJ5IHtAbGluayBtb2R1bGU6dHdnbC5yZXNpemVGcmFtZWJ1ZmZlckluZm99XG4gICAqIEl0IHdpbGwgdXNlIGBvcHRpb25zLnNyY2AgaWYgaXQgZXhpc3RzIHRvIHRyeSB0byBkZXRlcm1pbmUgYSBgdHlwZWBcbiAgICogb3RoZXJ3aXNlIGl0IHdpbGwgYXNzdW1lIGBnbC5VTlNJR05FRF9CWVRFYC4gTm8gZGF0YSBpcyBwcm92aWRlZFxuICAgKiBmb3IgdGhlIHRleHR1cmUuIFRleHR1cmUgcGFyYW1ldGVycyB3aWxsIGJlIHNldCBhY2NvcmRpbmdseVxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4IHRoZSB0ZXh0dXJlIHRvIHJlc2l6ZVxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBvcHRpb25zIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIHRoZSBuZXcgd2lkdGguIElmIG5vdCBwYXNzZWQgaW4gd2lsbCB1c2UgYG9wdGlvbnMud2lkdGhgXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0XSB0aGUgbmV3IGhlaWdodC4gSWYgbm90IHBhc3NlZCBpbiB3aWxsIHVzZSBgb3B0aW9ucy5oZWlnaHRgXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gcmVzaXplVGV4dHVyZShnbCwgdGV4LCBvcHRpb25zLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgd2lkdGggPSB3aWR0aCB8fCBvcHRpb25zLndpZHRoO1xuICAgIGhlaWdodCA9IGhlaWdodCB8fCBvcHRpb25zLmhlaWdodDtcbiAgICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQgfHwgZ2wuVEVYVFVSRV8yRDtcbiAgICBnbC5iaW5kVGV4dHVyZSh0YXJnZXQsIHRleCk7XG4gICAgdmFyIGZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0IHx8IGdsLlJHQkE7XG4gICAgdmFyIHR5cGU7XG4gICAgdmFyIHNyYyA9IG9wdGlvbnMuc3JjO1xuICAgIGlmICghc3JjKSB7XG4gICAgICB0eXBlID0gb3B0aW9ucy50eXBlIHx8IGdsLlVOU0lHTkVEX0JZVEU7XG4gICAgfSBlbHNlIGlmIChpc0FycmF5QnVmZmVyKHNyYykgfHwgKEFycmF5LmlzQXJyYXkoc3JjKSAmJiB0eXBlb2YgKHNyY1swXSkgPT09ICdudW1iZXInKSkge1xuICAgICAgdHlwZSA9IG9wdGlvbnMudHlwZSB8fCBnZXRUZXh0dXJlVHlwZUZvckFycmF5VHlwZShnbCwgc3JjKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdHlwZSA9IG9wdGlvbnMudHlwZSB8fCBnbC5VTlNJR05FRF9CWVRFO1xuICAgIH1cbiAgICBpZiAodGFyZ2V0ID09PSBnbC5URVhUVVJFX0NVQkVfTUFQKSB7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgNjsgKytpaSkge1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCArIGlpLCAwLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIDAsIGZvcm1hdCwgdHlwZSwgbnVsbCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGdsLnRleEltYWdlMkQodGFyZ2V0LCAwLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIDAsIGZvcm1hdCwgdHlwZSwgbnVsbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGEgc3JjIGlzIGFuIGFzeW5jIHJlcXVlc3QuXG4gICAqIGlmIHNyYyBpcyBhIHN0cmluZyB3ZSdyZSBnb2luZyB0byBkb3dubG9hZCBhbiBpbWFnZVxuICAgKiBpZiBzcmMgaXMgYW4gYXJyYXkgb2Ygc3RyaW5ncyB3ZSdyZSBnb2luZyB0byBkb3dubG9hZCBjdWJlbWFwIGltYWdlc1xuICAgKiBAcGFyYW0geyp9IHNyYyBUaGUgc3JjIGZyb20gYSBUZXh0dXJlT3B0aW9uc1xuICAgKiBAcmV0dXJucyB7Ym9vbH0gdHJ1ZSBpZiBzcmMgaXMgYXN5bmMuXG4gICAqL1xuICBmdW5jdGlvbiBpc0FzeW5jU3JjKHNyYykge1xuICAgIHJldHVybiB0eXBlb2Ygc3JjID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgICAoQXJyYXkuaXNBcnJheShzcmMpICYmIHR5cGVvZiBzcmNbMF0gPT09ICdzdHJpbmcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgYnVuY2ggb2YgdGV4dHVyZXMgYmFzZWQgb24gdGhlIHBhc3NlZCBpbiBvcHRpb25zLlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKlxuICAgKiAgICAgdmFyIHRleHR1cmVzID0gdHdnbC5jcmVhdGVUZXh0dXJlcyhnbCwge1xuICAgKiAgICAgICAvLyBhIHBvd2VyIG9mIDIgaW1hZ2VcbiAgICogICAgICAgaGZ0SWNvbjogeyBzcmM6IFwiaW1hZ2VzL2hmdC1pY29uLTE2LnBuZ1wiLCBtYWc6IGdsLk5FQVJFU1QgfSxcbiAgICogICAgICAgLy8gYSBub24tcG93ZXIgb2YgMiBpbWFnZVxuICAgKiAgICAgICBjbG92ZXI6IHsgc3JjOiBcImltYWdlcy9jbG92ZXIuanBnXCIgfSxcbiAgICogICAgICAgLy8gRnJvbSBhIGNhbnZhc1xuICAgKiAgICAgICBmcm9tQ2FudmFzOiB7IHNyYzogY3R4LmNhbnZhcyB9LFxuICAgKiAgICAgICAvLyBBIGN1YmVtYXAgZnJvbSA2IGltYWdlc1xuICAgKiAgICAgICB5b2tvaGFtYToge1xuICAgKiAgICAgICAgIHRhcmdldDogZ2wuVEVYVFVSRV9DVUJFX01BUCxcbiAgICogICAgICAgICBzcmM6IFtcbiAgICogICAgICAgICAgICdpbWFnZXMveW9rb2hhbWEvcG9zeC5qcGcnLFxuICAgKiAgICAgICAgICAgJ2ltYWdlcy95b2tvaGFtYS9uZWd4LmpwZycsXG4gICAqICAgICAgICAgICAnaW1hZ2VzL3lva29oYW1hL3Bvc3kuanBnJyxcbiAgICogICAgICAgICAgICdpbWFnZXMveW9rb2hhbWEvbmVneS5qcGcnLFxuICAgKiAgICAgICAgICAgJ2ltYWdlcy95b2tvaGFtYS9wb3N6LmpwZycsXG4gICAqICAgICAgICAgICAnaW1hZ2VzL3lva29oYW1hL25lZ3ouanBnJyxcbiAgICogICAgICAgICBdLFxuICAgKiAgICAgICB9LFxuICAgKiAgICAgICAvLyBBIGN1YmVtYXAgZnJvbSAxIGltYWdlIChjYW4gYmUgMXg2LCAyeDMsIDN4MiwgNngxKVxuICAgKiAgICAgICBnb2xkZW5nYXRlOiB7XG4gICAqICAgICAgICAgdGFyZ2V0OiBnbC5URVhUVVJFX0NVQkVfTUFQLFxuICAgKiAgICAgICAgIHNyYzogJ2ltYWdlcy9nb2xkZW5nYXRlLmpwZycsXG4gICAqICAgICAgIH0sXG4gICAqICAgICAgIC8vIEEgMngyIHBpeGVsIHRleHR1cmUgZnJvbSBhIEphdmFTY3JpcHQgYXJyYXlcbiAgICogICAgICAgY2hlY2tlcjoge1xuICAgKiAgICAgICAgIG1hZzogZ2wuTkVBUkVTVCxcbiAgICogICAgICAgICBtaW46IGdsLkxJTkVBUixcbiAgICogICAgICAgICBzcmM6IFtcbiAgICogICAgICAgICAgIDI1NSwyNTUsMjU1LDI1NSxcbiAgICogICAgICAgICAgIDE5MiwxOTIsMTkyLDI1NSxcbiAgICogICAgICAgICAgIDE5MiwxOTIsMTkyLDI1NSxcbiAgICogICAgICAgICAgIDI1NSwyNTUsMjU1LDI1NSxcbiAgICogICAgICAgICBdLFxuICAgKiAgICAgICB9LFxuICAgKiAgICAgICAvLyBhIDF4MiBwaXhlbCB0ZXh0dXJlIGZyb20gYSB0eXBlZCBhcnJheS5cbiAgICogICAgICAgc3RyaXBlOiB7XG4gICAqICAgICAgICAgbWFnOiBnbC5ORUFSRVNULFxuICAgKiAgICAgICAgIG1pbjogZ2wuTElORUFSLFxuICAgKiAgICAgICAgIGZvcm1hdDogZ2wuTFVNSU5BTkNFLFxuICAgKiAgICAgICAgIHNyYzogbmV3IFVpbnQ4QXJyYXkoW1xuICAgKiAgICAgICAgICAgMjU1LFxuICAgKiAgICAgICAgICAgMTI4LFxuICAgKiAgICAgICAgICAgMjU1LFxuICAgKiAgICAgICAgICAgMTI4LFxuICAgKiAgICAgICAgICAgMjU1LFxuICAgKiAgICAgICAgICAgMTI4LFxuICAgKiAgICAgICAgICAgMjU1LFxuICAgKiAgICAgICAgICAgMTI4LFxuICAgKiAgICAgICAgIF0pLFxuICAgKiAgICAgICAgIHdpZHRoOiAxLFxuICAgKiAgICAgICB9LFxuICAgKiAgICAgfSk7XG4gICAqXG4gICAqIE5vd1xuICAgKlxuICAgKiAqICAgYHRleHR1cmVzLmhmdEljb25gIHdpbGwgYmUgYSAyZCB0ZXh0dXJlXG4gICAqICogICBgdGV4dHVyZXMuY2xvdmVyYCB3aWxsIGJlIGEgMmQgdGV4dHVyZVxuICAgKiAqICAgYHRleHR1cmVzLmZyb21DYW52YXNgIHdpbGwgYmUgYSAyZCB0ZXh0dXJlXG4gICAqICogICBgdGV4dHVyZXMueW9ob2hhbWFgIHdpbGwgYmUgYSBjdWJlbWFwIHRleHR1cmVcbiAgICogKiAgIGB0ZXh0dXJlcy5nb2xkZW5nYXRlYCB3aWxsIGJlIGEgY3ViZW1hcCB0ZXh0dXJlXG4gICAqICogICBgdGV4dHVyZXMuY2hlY2tlcmAgd2lsbCBiZSBhIDJkIHRleHR1cmVcbiAgICogKiAgIGB0ZXh0dXJlcy5zdHJpcGVgIHdpbGwgYmUgYSAyZCB0ZXh0dXJlXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsbW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnM+fSBvcHRpb25zIEEgb2JqZWN0IG9mIFRleHR1cmVPcHRpb25zIG9uZSBwZXIgdGV4dHVyZS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlc1JlYWR5Q2FsbGJhY2t9IFtjYWxsYmFja10gQSBjYWxsYmFjayBjYWxsZWQgd2hlbiBhbGwgdGV4dHVyZXMgaGF2ZSBiZWVuIGRvd25sb2FkZWQuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLFdlYkdMVGV4dHVyZT59IHRoZSBjcmVhdGVkIHRleHR1cmVzIGJ5IG5hbWVcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVUZXh0dXJlcyhnbCwgdGV4dHVyZU9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgIHZhciBudW1Eb3dubG9hZGluZyA9IDA7XG4gICAgdmFyIGVycm9ycyA9IFtdO1xuICAgIHZhciB0ZXh0dXJlcyA9IHt9O1xuICAgIHZhciBpbWFnZXMgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGNhbGxDYWxsYmFja0lmUmVhZHkoKSB7XG4gICAgICBpZiAobnVtRG93bmxvYWRpbmcgPT09IDApIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBjYWxsYmFjayhlcnJvcnMubGVuZ3RoID8gZXJyb3JzIDogdW5kZWZpbmVkLCB0ZXh0dXJlcywgaW1hZ2VzKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXModGV4dHVyZU9wdGlvbnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSB0ZXh0dXJlT3B0aW9uc1tuYW1lXTtcbiAgICAgIHZhciBvbkxvYWRGbiA9IHVuZGVmaW5lZDtcbiAgICAgIGlmIChpc0FzeW5jU3JjKG9wdGlvbnMuc3JjKSkge1xuICAgICAgICBvbkxvYWRGbiA9IGZ1bmN0aW9uKGVyciwgdGV4LCBpbWcpIHtcbiAgICAgICAgICBpbWFnZXNbbmFtZV0gPSBpbWc7XG4gICAgICAgICAgLS1udW1Eb3dubG9hZGluZztcbiAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBlcnJvcnMucHVzaChlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjYWxsQ2FsbGJhY2tJZlJlYWR5KCk7XG4gICAgICAgIH07XG4gICAgICAgICsrbnVtRG93bmxvYWRpbmc7XG4gICAgICB9XG4gICAgICB0ZXh0dXJlc1tuYW1lXSA9IGNyZWF0ZVRleHR1cmUoZ2wsIG9wdGlvbnMsIG9uTG9hZEZuKTtcbiAgICB9KTtcblxuICAgIC8vIHF1ZXVlIHRoZSBjYWxsYmFjayBpZiB0aGVyZSBhcmUgbm8gaW1hZ2VzIHRvIGRvd25sb2FkLlxuICAgIC8vIFdlIGRvIHRoaXMgYmVjYXVzZSBpZiB5b3VyIGNvZGUgaXMgc3RydWN0dXJlZCB0byB3YWl0IGZvclxuICAgIC8vIGltYWdlcyB0byBkb3dubG9hZCBidXQgdGhlbiB5b3UgY29tbWVudCBvdXQgYWxsIHRoZSBhc3luY1xuICAgIC8vIGltYWdlcyB5b3VyIGNvZGUgd291bGQgYnJlYWsuXG4gICAgY2FsbENhbGxiYWNrSWZSZWFkeSgpO1xuXG4gICAgcmV0dXJuIHRleHR1cmVzO1xuICB9XG5cbiAgLy8gVXNpbmcgcXVvdGVzIHByZXZlbnRzIFVnbGlmeSBmcm9tIGNoYW5naW5nIHRoZSBuYW1lcy5cbiAgLy8gTm8gc3BlZWQgZGlmZiBBRkFJQ1QuXG4gIHJldHVybiB7XG4gICAgXCJzZXREZWZhdWx0c19cIjogc2V0RGVmYXVsdHMsXG5cbiAgICBcImNyZWF0ZVRleHR1cmVcIjogY3JlYXRlVGV4dHVyZSxcbiAgICBcInNldEVtcHR5VGV4dHVyZVwiOiBzZXRFbXB0eVRleHR1cmUsXG4gICAgXCJzZXRUZXh0dXJlRnJvbUFycmF5XCI6IHNldFRleHR1cmVGcm9tQXJyYXksXG4gICAgXCJsb2FkVGV4dHVyZUZyb21VcmxcIjogbG9hZFRleHR1cmVGcm9tVXJsLFxuICAgIFwic2V0VGV4dHVyZUZyb21FbGVtZW50XCI6IHNldFRleHR1cmVGcm9tRWxlbWVudCxcbiAgICBcInNldFRleHR1cmVGaWx0ZXJpbmdGb3JTaXplXCI6IHNldFRleHR1cmVGaWx0ZXJpbmdGb3JTaXplLFxuICAgIFwic2V0VGV4dHVyZVBhcmFtZXRlcnNcIjogc2V0VGV4dHVyZVBhcmFtZXRlcnMsXG4gICAgXCJzZXREZWZhdWx0VGV4dHVyZUNvbG9yXCI6IHNldERlZmF1bHRUZXh0dXJlQ29sb3IsXG4gICAgXCJjcmVhdGVUZXh0dXJlc1wiOiBjcmVhdGVUZXh0dXJlcyxcbiAgICBcInJlc2l6ZVRleHR1cmVcIjogcmVzaXplVGV4dHVyZSxcbiAgICBcImdldE51bUNvbXBvbmVudHNGb3JGb3JtYXRcIjogZ2V0TnVtQ29tcG9uZW50c0ZvckZvcm1hdCxcbiAgfTtcbn0pO1xuXG5cblxuLypcbiAqIENvcHlyaWdodCAyMDE1LCBHcmVnZyBUYXZhcmVzLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmRlZmluZSgndHdnbC9mcmFtZWJ1ZmZlcnMnLFtcbiAgICAnLi90ZXh0dXJlcycsXG4gICAgJy4vdXRpbHMnLFxuICBdLCBmdW5jdGlvbiAoXG4gICAgdGV4dHVyZXMsXG4gICAgdXRpbHMpIHtcbiAgXG5cbiAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IHNlZSBhIGdsb2JhbCBnbFxuICB2YXIgZ2wgPSB1bmRlZmluZWQ7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgdmFyIFVOU0lHTkVEX0JZVEUgICAgICAgICAgICAgICAgICA9IDB4MTQwMTtcblxuICAvKiBQaXhlbEZvcm1hdCAqL1xuICB2YXIgREVQVEhfQ09NUE9ORU5UICAgICAgICAgICAgICAgID0gMHgxOTAyO1xuICB2YXIgUkdCQSAgICAgICAgICAgICAgICAgICAgICAgICAgID0gMHgxOTA4O1xuXG4gIC8qIEZyYW1lYnVmZmVyIE9iamVjdC4gKi9cbiAgdmFyIFJHQkE0ICAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4ODA1NjtcbiAgdmFyIFJHQjVfQTEgICAgICAgICAgICAgICAgICAgICAgICA9IDB4ODA1NztcbiAgdmFyIFJHQjU2NSAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4OEQ2MjtcbiAgdmFyIERFUFRIX0NPTVBPTkVOVDE2ICAgICAgICAgICAgICA9IDB4ODFBNTtcbiAgdmFyIFNURU5DSUxfSU5ERVggICAgICAgICAgICAgICAgICA9IDB4MTkwMTtcbiAgdmFyIFNURU5DSUxfSU5ERVg4ICAgICAgICAgICAgICAgICA9IDB4OEQ0ODtcbiAgdmFyIERFUFRIX1NURU5DSUwgICAgICAgICAgICAgICAgICA9IDB4ODRGOTtcbiAgdmFyIENPTE9SX0FUVEFDSE1FTlQwICAgICAgICAgICAgICA9IDB4OENFMDtcbiAgdmFyIERFUFRIX0FUVEFDSE1FTlQgICAgICAgICAgICAgICA9IDB4OEQwMDtcbiAgdmFyIFNURU5DSUxfQVRUQUNITUVOVCAgICAgICAgICAgICA9IDB4OEQyMDtcbiAgdmFyIERFUFRIX1NURU5DSUxfQVRUQUNITUVOVCAgICAgICA9IDB4ODIxQTtcblxuICAvKiBUZXh0dXJlV3JhcE1vZGUgKi9cbiAgdmFyIFJFUEVBVCAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MjkwMTsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgdmFyIENMQU1QX1RPX0VER0UgICAgICAgICAgICAgICAgICA9IDB4ODEyRjtcbiAgdmFyIE1JUlJPUkVEX1JFUEVBVCAgICAgICAgICAgICAgICA9IDB4ODM3MDsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAvKiBUZXh0dXJlTWFnRmlsdGVyICovXG4gIHZhciBORUFSRVNUICAgICAgICAgICAgICAgICAgICAgICAgPSAweDI2MDA7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIHZhciBMSU5FQVIgICAgICAgICAgICAgICAgICAgICAgICAgPSAweDI2MDE7XG5cbiAgLyogVGV4dHVyZU1pbkZpbHRlciAqL1xuICB2YXIgTkVBUkVTVF9NSVBNQVBfTkVBUkVTVCAgICAgICAgID0gMHgyNzAwOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB2YXIgTElORUFSX01JUE1BUF9ORUFSRVNUICAgICAgICAgID0gMHgyNzAxOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB2YXIgTkVBUkVTVF9NSVBNQVBfTElORUFSICAgICAgICAgID0gMHgyNzAyOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB2YXIgTElORUFSX01JUE1BUF9MSU5FQVIgICAgICAgICAgID0gMHgyNzAzOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gIC8qKlxuICAgKiBUaGUgb3B0aW9ucyBmb3IgYSBmcmFtZWJ1ZmZlciBhdHRhY2htZW50LlxuICAgKlxuICAgKiBOb3RlOiBGb3IgYSBgZm9ybWF0YCB0aGF0IGlzIGEgdGV4dHVyZSBpbmNsdWRlIGFsbCB0aGUgdGV4dHVyZVxuICAgKiBvcHRpb25zIGZyb20ge0BsaW5rIG1vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBmb3IgZXhhbXBsZVxuICAgKiBgbWluYCwgYG1hZ2AsIGBjbGFtcGAsIGV0Yy4uLiBOb3RlIHRoYXQgdW5saWtlIHtAbGluayBtb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc31cbiAgICogYGF1dG9gIGRlZmF1bHRzIHRvIGBmYWxzZWAgZm9yIGF0dGFjaG1lbnQgdGV4dHVyZXNcbiAgICpcbiAgICogQHR5cGVkZWYge09iamVjdH0gQXR0YWNobWVudE9wdGlvbnNcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFthdHRhY2hdIFRoZSBhdHRhY2htZW50IHBvaW50LiBEZWZhdWx0c1xuICAgKiAgIHRvIGBnbC5DT0xPUl9BVFRBQ1RNRU5UMCArIG5keGAgdW5sZXNzIHR5cGUgaXMgYSBkZXB0aCBvciBzdGVuY2lsIHR5cGVcbiAgICogICB0aGVuIGl0J3MgZ2wuREVQVEhfQVRUQUNITUVOVCBvciBgZ2wuREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5UYCBkZXBlbmRpbmdcbiAgICogICBvbiB0aGUgZm9ybWF0IG9yIGF0dGFjaG1lbnQgdHlwZS5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtmb3JtYXRdIFRoZSBmb3JtYXQuIElmIG9uZSBvZiBgZ2wuUkdCQTRgLFxuICAgKiAgIGBnbC5SR0I1NjVgLCBgZ2wuUkdCNV9BMWAsIGBnbC5ERVBUSF9DT01QT05FTlQxNmAsXG4gICAqICAgYGdsLlNURU5DSUxfSU5ERVg4YCBvciBgZ2wuREVQVEhfU1RFTkNJTGAgdGhlbiB3aWxsIGNyZWF0ZSBhXG4gICAqICAgcmVuZGVyYnVmZmVyLiBPdGhlcndpc2Ugd2lsbCBjcmVhdGUgYSB0ZXh0dXJlLiBEZWZhdWx0ID0gYGdsLlJHQkFgXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbdHlwZV0gVGhlIHR5cGUuIFVzZWQgZm9yIHRleHR1cmUuIERlZmF1bHQgPSBgZ2wuVU5TSUdORURfQllURWAuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbdGFyZ2V0XSBUaGUgdGV4dHVyZSB0YXJnZXQgZm9yIGBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRGAuXG4gICAqICAgRGVmYXVsdHMgdG8gYGdsLlRFWFRVUkVfMkRgLiBTZXQgdG8gYXBwcm9wcmlhdGUgZmFjZSBmb3IgY3ViZSBtYXBzLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW2xldmVsXSBsZXZlbCBmb3IgYGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEYC4gRGVmYXVsdHMgdG8gMC5cbiAgICogQHByb3BlcnR5IHtXZWJHTE9iamVjdH0gW2F0dGFjaG1lbnRdIEFuIGV4aXN0aW5nIHJlbmRlcmJ1ZmZlciBvciB0ZXh0dXJlLlxuICAgKiAgICBJZiBwcm92aWRlZCB3aWxsIGF0dGFjaCB0aGlzIE9iamVjdC4gVGhpcyBhbGxvd3MgeW91IHRvIHNoYXJlXG4gICAqICAgIGF0dGFjaGVtbnRzIGFjcm9zcyBmcmFtZWJ1ZmZlcnMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICB2YXIgZGVmYXVsdEF0dGFjaG1lbnRzID0gW1xuICAgIHsgZm9ybWF0OiBSR0JBLCB0eXBlOiBVTlNJR05FRF9CWVRFLCBtaW46IExJTkVBUiwgd3JhcDogQ0xBTVBfVE9fRURHRSwgfSxcbiAgICB7IGZvcm1hdDogREVQVEhfU1RFTkNJTCwgfSxcbiAgXTtcblxuICB2YXIgYXR0YWNobWVudHNCeUZvcm1hdCA9IHt9O1xuICBhdHRhY2htZW50c0J5Rm9ybWF0W0RFUFRIX1NURU5DSUxdID0gREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5UO1xuICBhdHRhY2htZW50c0J5Rm9ybWF0W1NURU5DSUxfSU5ERVhdID0gU1RFTkNJTF9BVFRBQ0hNRU5UO1xuICBhdHRhY2htZW50c0J5Rm9ybWF0W1NURU5DSUxfSU5ERVg4XSA9IFNURU5DSUxfQVRUQUNITUVOVDtcbiAgYXR0YWNobWVudHNCeUZvcm1hdFtERVBUSF9DT01QT05FTlRdID0gREVQVEhfQVRUQUNITUVOVDtcbiAgYXR0YWNobWVudHNCeUZvcm1hdFtERVBUSF9DT01QT05FTlQxNl0gPSBERVBUSF9BVFRBQ0hNRU5UO1xuXG4gIGZ1bmN0aW9uIGdldEF0dGFjaG1lbnRQb2ludEZvckZvcm1hdChmb3JtYXQpIHtcbiAgICByZXR1cm4gYXR0YWNobWVudHNCeUZvcm1hdFtmb3JtYXRdO1xuICB9XG5cbiAgdmFyIHJlbmRlcmJ1ZmZlckZvcm1hdHMgPSB7fTtcbiAgcmVuZGVyYnVmZmVyRm9ybWF0c1tSR0JBNF0gPSB0cnVlO1xuICByZW5kZXJidWZmZXJGb3JtYXRzW1JHQjVfQTFdID0gdHJ1ZTtcbiAgcmVuZGVyYnVmZmVyRm9ybWF0c1tSR0I1NjVdID0gdHJ1ZTtcbiAgcmVuZGVyYnVmZmVyRm9ybWF0c1tERVBUSF9TVEVOQ0lMXSA9IHRydWU7XG4gIHJlbmRlcmJ1ZmZlckZvcm1hdHNbREVQVEhfQ09NUE9ORU5UMTZdID0gdHJ1ZTtcbiAgcmVuZGVyYnVmZmVyRm9ybWF0c1tTVEVOQ0lMX0lOREVYXSA9IHRydWU7XG4gIHJlbmRlcmJ1ZmZlckZvcm1hdHNbU1RFTkNJTF9JTkRFWDhdID0gdHJ1ZTtcblxuICBmdW5jdGlvbiBpc1JlbmRlcmJ1ZmZlckZvcm1hdChmb3JtYXQpIHtcbiAgICByZXR1cm4gcmVuZGVyYnVmZmVyRm9ybWF0c1tmb3JtYXRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IEZyYW1lYnVmZmVySW5mb1xuICAgKiBAcHJvcGVydHkge1dlYkdMRnJhbWVidWZmZXJ9IGZyYW1lYnVmZmVyIFRoZSBXZWJHTEZyYW1lYnVmZmVyIGZvciB0aGlzIGZyYW1lYnVmZmVySW5mb1xuICAgKiBAcHJvcGVydHkge1dlYkdMT2JqZWN0W119IGF0dGFjaG1lbnRzIFRoZSBjcmVhdGVkIGF0dGFjaG1lbnRzIGluIHRoZSBzYW1lIG9yZGVyIGFzIHBhc3NlZCBpbiB0byB7QGxpbmsgbW9kdWxlOnR3Z2wuY3JlYXRlRnJhbWVidWZmZXJJbmZvfS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgZnJhbWVidWZmZXIgYW5kIGF0dGFjaG1lbnRzLlxuICAgKlxuICAgKiBUaGlzIHJldHVybnMgYSB7QGxpbmsgbW9kdWxlOnR3Z2wuRnJhbWVidWZmZXJJbmZvfSBiZWNhdXNlIGl0IG5lZWRzIHRvIHJldHVybiB0aGUgYXR0YWNobWVudHMgYXMgd2VsbCBhcyB0aGUgZnJhbWVidWZmZXIuXG4gICAqXG4gICAqIFRoZSBzaW1wbGVzdCB1c2FnZVxuICAgKlxuICAgKiAgICAgLy8gY3JlYXRlIGFuIFJHQkEvVU5TSUdORURfQllURSB0ZXh0dXJlIGFuZCBERVBUSF9TVEVOQ0lMIHJlbmRlcmJ1ZmZlclxuICAgKiAgICAgdmFyIGZiaSA9IHR3Z2wuY3JlYXRlRnJhbWVidWZmZXIoZ2wpO1xuICAgKlxuICAgKiBNb3JlIGNvbXBsZXggdXNhZ2VcbiAgICpcbiAgICogICAgIC8vIGNyZWF0ZSBhbiBSR0I1NjUgcmVuZGVyYnVmZmVyIGFuZCBhIFNURU5DSUxfSU5ERVg4IHJlbmRlcmJ1ZmZlclxuICAgKiAgICAgdmFyIGF0dGFjaG1lbnRzID0gW1xuICAgKiAgICAgICB7IGZvcm1hdDogUkdCNTY1LCBtYWc6IE5FQVJFU1QgfSxcbiAgICogICAgICAgeyBmb3JtYXQ6IFNURU5DSUxfSU5ERVg4IH0sXG4gICAqICAgICBdXG4gICAqICAgICB2YXIgZmJpID0gdHdnbC5jcmVhdGVGcmFtZWJ1ZmZlcihnbCwgYXR0YWNobWVudHMpO1xuICAgKlxuICAgKiBQYXNzaW5nIGluIGEgc3BlY2lmaWMgc2l6ZVxuICAgKlxuICAgKiAgICAgdmFyIHdpZHRoID0gMjU2O1xuICAgKiAgICAgdmFyIGhlaWdodCA9IDI1NjtcbiAgICogICAgIHZhciBmYmkgPSB0d2dsLmNyZWF0ZUZyYW1lYnVmZmVyKGdsLCBhdHRhY2htZW50cywgd2lkdGgsIGhlaWdodCk7XG4gICAqXG4gICAqICoqTm90ZSEhKiogSXQgaXMgdXAgdG8geW91IHRvIGNoZWNrIGlmIHRoZSBmcmFtZWJ1ZmZlciBpcyByZW5kZXJhYmxlIGJ5IGNhbGxpbmcgYGdsLmNoZWNrRnJhbWVidWZmZXJTdGF0dXNgLlxuICAgKiBbV2ViR0wgb25seSBndWFyYW50ZWVzIDMgY29tYmluYXRpb25zIG9mIGF0dGFjaG1lbnRzIHdvcmtdKGh0dHBzOi8vd3d3Lmtocm9ub3Mub3JnL3JlZ2lzdHJ5L3dlYmdsL3NwZWNzL2xhdGVzdC8xLjAvIzYuNikuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuQXR0YWNobWVudE9wdGlvbnNbXX0gW2F0dGFjaG1lbnRzXSB3aGljaCBhdHRhY2htZW50cyB0byBjcmVhdGUuIElmIG5vdCBwcm92aWRlZCB0aGUgZGVmYXVsdCBpcyBhIGZyYW1lYnVmZmVyIHdpdGggYW5cbiAgICogICAgYFJHQkFgLCBgVU5TSUdORURfQllURWAgdGV4dHVyZSBgQ09MT1JfQVRUQUNITUVOVDBgIGFuZCBhIGBERVBUSF9TVEVOQ0lMYCByZW5kZXJidWZmZXIgYERFUFRIX1NURU5DSUxfQVRUQUNITUVOVGAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIHRoZSB3aWR0aCBmb3IgdGhlIGF0dGFjaG1lbnRzLiBEZWZhdWx0ID0gc2l6ZSBvZiBkcmF3aW5nQnVmZmVyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0XSB0aGUgaGVpZ2h0IGZvciB0aGUgYXR0YWNobWVudHMuIERlZmF1dHQgPSBzaXplIG9mIGRyYXdpbmdCdWZmZXJcbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wuRnJhbWVidWZmZXJJbmZvfSB0aGUgZnJhbWVidWZmZXIgYW5kIGF0dGFjaG1lbnRzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUZyYW1lYnVmZmVySW5mbyhnbCwgYXR0YWNobWVudHMsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgdGFyZ2V0ID0gZ2wuRlJBTUVCVUZGRVI7XG4gICAgdmFyIGZiID0gZ2wuY3JlYXRlRnJhbWVidWZmZXIoKTtcbiAgICBnbC5iaW5kRnJhbWVidWZmZXIodGFyZ2V0LCBmYik7XG4gICAgd2lkdGggID0gd2lkdGggIHx8IGdsLmRyYXdpbmdCdWZmZXJXaWR0aDtcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgZ2wuZHJhd2luZ0J1ZmZlckhlaWdodDtcbiAgICBhdHRhY2htZW50cyA9IGF0dGFjaG1lbnRzIHx8IGRlZmF1bHRBdHRhY2htZW50cztcbiAgICB2YXIgY29sb3JBdHRhY2htZW50Q291bnQgPSAwO1xuICAgIHZhciBmcmFtZWJ1ZmZlckluZm8gPSB7XG4gICAgICBmcmFtZWJ1ZmZlcjogZmIsXG4gICAgICBhdHRhY2htZW50czogW10sXG4gICAgICB3aWR0aDogd2lkdGgsXG4gICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICB9O1xuICAgIGF0dGFjaG1lbnRzLmZvckVhY2goZnVuY3Rpb24oYXR0YWNobWVudE9wdGlvbnMpIHtcbiAgICAgIHZhciBhdHRhY2htZW50ID0gYXR0YWNobWVudE9wdGlvbnMuYXR0YWNobWVudDtcbiAgICAgIHZhciBmb3JtYXQgPSBhdHRhY2htZW50T3B0aW9ucy5mb3JtYXQ7XG4gICAgICB2YXIgYXR0YWNobWVudFBvaW50ID0gZ2V0QXR0YWNobWVudFBvaW50Rm9yRm9ybWF0KGZvcm1hdCk7XG4gICAgICBpZiAoIWF0dGFjaG1lbnRQb2ludCkge1xuICAgICAgICBhdHRhY2htZW50UG9pbnQgPSBDT0xPUl9BVFRBQ0hNRU5UMCArIGNvbG9yQXR0YWNobWVudENvdW50Kys7XG4gICAgICB9XG4gICAgICBpZiAoIWF0dGFjaG1lbnQpIHtcbiAgICAgICAgaWYgKGlzUmVuZGVyYnVmZmVyRm9ybWF0KGZvcm1hdCkpIHtcbiAgICAgICAgICBhdHRhY2htZW50ID0gZ2wuY3JlYXRlUmVuZGVyYnVmZmVyKCk7XG4gICAgICAgICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIGF0dGFjaG1lbnQpO1xuICAgICAgICAgIGdsLnJlbmRlcmJ1ZmZlclN0b3JhZ2UoZ2wuUkVOREVSQlVGRkVSLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB0ZXh0dXJlT3B0aW9ucyA9IHV0aWxzLnNoYWxsb3dDb3B5KGF0dGFjaG1lbnRPcHRpb25zKTtcbiAgICAgICAgICB0ZXh0dXJlT3B0aW9ucy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgIHRleHR1cmVPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICB0ZXh0dXJlT3B0aW9ucy5hdXRvID0gYXR0YWNobWVudE9wdGlvbnMuYXV0byA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhdHRhY2htZW50T3B0aW9ucy5hdXRvO1xuICAgICAgICAgIGF0dGFjaG1lbnQgPSB0ZXh0dXJlcy5jcmVhdGVUZXh0dXJlKGdsLCB0ZXh0dXJlT3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChhdHRhY2htZW50IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJidWZmZXIpIHtcbiAgICAgICAgZ2wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIodGFyZ2V0LCBhdHRhY2htZW50UG9pbnQsIGdsLlJFTkRFUkJVRkZFUiwgYXR0YWNobWVudCk7XG4gICAgICB9IGVsc2UgaWYgKGF0dGFjaG1lbnQgaW5zdGFuY2VvZiBXZWJHTFRleHR1cmUpIHtcbiAgICAgICAgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkQoXG4gICAgICAgICAgICB0YXJnZXQsXG4gICAgICAgICAgICBhdHRhY2htZW50UG9pbnQsXG4gICAgICAgICAgICBhdHRhY2htZW50T3B0aW9ucy50ZXhUYXJnZXQgfHwgZ2wuVEVYVFVSRV8yRCxcbiAgICAgICAgICAgIGF0dGFjaG1lbnQsXG4gICAgICAgICAgICBhdHRhY2htZW50T3B0aW9ucy5sZXZlbCB8fCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IFwidW5rbm93biBhdHRhY2htZW50IHR5cGVcIjtcbiAgICAgIH1cbiAgICAgIGZyYW1lYnVmZmVySW5mby5hdHRhY2htZW50cy5wdXNoKGF0dGFjaG1lbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiBmcmFtZWJ1ZmZlckluZm87XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplcyB0aGUgYXR0YWNobWVudHMgb2YgYSBmcmFtZWJ1ZmZlci5cbiAgICpcbiAgICogWW91IG5lZWQgdG8gcGFzcyBpbiB0aGUgc2FtZSBgYXR0YWNobWVudHNgIGFzIHlvdSBwYXNzZWQgaW4ge0BsaW5rIG1vZHVsZTp0d2dsLmNyZWF0ZUZyYW1lYnVmZmVyfVxuICAgKiBiZWNhdXNlIFRXR0wgaGFzIG5vIGlkZWEgdGhlIGZvcm1hdC90eXBlIG9mIGVhY2ggYXR0YWNobWVudC5cbiAgICpcbiAgICogVGhlIHNpbXBsZXN0IHVzYWdlXG4gICAqXG4gICAqICAgICAvLyBjcmVhdGUgYW4gUkdCQS9VTlNJR05FRF9CWVRFIHRleHR1cmUgYW5kIERFUFRIX1NURU5DSUwgcmVuZGVyYnVmZmVyXG4gICAqICAgICB2YXIgZmJpID0gdHdnbC5jcmVhdGVGcmFtZWJ1ZmZlcihnbCk7XG4gICAqXG4gICAqICAgICAuLi5cbiAgICpcbiAgICogICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICogICAgICAgaWYgKHR3Z2wucmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShnbC5jYW52YXMpKSB7XG4gICAqICAgICAgICAgLy8gcmVzaXplIHRoZSBhdHRhY2htZW50c1xuICAgKiAgICAgICAgIHR3Z2wucmVzaXplRnJhbWVidWZmZXJJbmZvKGdsLCBmYmkpO1xuICAgKiAgICAgICB9XG4gICAqXG4gICAqIE1vcmUgY29tcGxleCB1c2FnZVxuICAgKlxuICAgKiAgICAgLy8gY3JlYXRlIGFuIFJHQjU2NSByZW5kZXJidWZmZXIgYW5kIGEgU1RFTkNJTF9JTkRFWDggcmVuZGVyYnVmZmVyXG4gICAqICAgICB2YXIgYXR0YWNobWVudHMgPSBbXG4gICAqICAgICAgIHsgZm9ybWF0OiBSR0I1NjUsIG1hZzogTkVBUkVTVCB9LFxuICAgKiAgICAgICB7IGZvcm1hdDogU1RFTkNJTF9JTkRFWDggfSxcbiAgICogICAgIF1cbiAgICogICAgIHZhciBmYmkgPSB0d2dsLmNyZWF0ZUZyYW1lYnVmZmVyKGdsLCBhdHRhY2htZW50cyk7XG4gICAqXG4gICAqICAgICAuLi5cbiAgICpcbiAgICogICAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICogICAgICAgaWYgKHR3Z2wucmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShnbC5jYW52YXMpKSB7XG4gICAqICAgICAgICAgLy8gcmVzaXplIHRoZSBhdHRhY2htZW50cyB0byBtYXRjaFxuICAgKiAgICAgICAgIHR3Z2wucmVzaXplRnJhbWVidWZmZXJJbmZvKGdsLCBmYmksIGF0dGFjaG1lbnRzKTtcbiAgICogICAgICAgfVxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkZyYW1lYnVmZmVySW5mb30gZnJhbWVidWZmZXJJbmZvIGEgZnJhbWVidWZmZXJJbmZvIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIG1vZHVsZTp0d2dsLmNyZWF0ZUZyYW1lYnVmZmVyfS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5BdHRhY2htZW50T3B0aW9uc1tdfSBbYXR0YWNobWVudHNdIHRoZSBzYW1lIGF0dGFjaG1lbnRzIG9wdGlvbnMgYXMgcGFzc2VkIHRvIHtAbGluayBtb2R1bGU6dHdnbC5jcmVhdGVGcmFtZWJ1ZmZlcn0uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIHRoZSB3aWR0aCBmb3IgdGhlIGF0dGFjaG1lbnRzLiBEZWZhdWx0ID0gc2l6ZSBvZiBkcmF3aW5nQnVmZmVyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbaGVpZ2h0XSB0aGUgaGVpZ2h0IGZvciB0aGUgYXR0YWNobWVudHMuIERlZmF1dHQgPSBzaXplIG9mIGRyYXdpbmdCdWZmZXJcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiByZXNpemVGcmFtZWJ1ZmZlckluZm8oZ2wsIGZyYW1lYnVmZmVySW5mbywgYXR0YWNobWVudHMsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB3aWR0aCAgPSB3aWR0aCAgfHwgZ2wuZHJhd2luZ0J1ZmZlcldpZHRoO1xuICAgIGhlaWdodCA9IGhlaWdodCB8fCBnbC5kcmF3aW5nQnVmZmVySGVpZ2h0O1xuICAgIGZyYW1lYnVmZmVySW5mby53aWR0aCA9IHdpZHRoO1xuICAgIGZyYW1lYnVmZmVySW5mby5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgYXR0YWNobWVudHMgPSBhdHRhY2htZW50cyB8fCBkZWZhdWx0QXR0YWNobWVudHM7XG4gICAgYXR0YWNobWVudHMuZm9yRWFjaChmdW5jdGlvbihhdHRhY2htZW50T3B0aW9ucywgbmR4KSB7XG4gICAgICB2YXIgYXR0YWNobWVudCA9IGZyYW1lYnVmZmVySW5mby5hdHRhY2htZW50c1tuZHhdO1xuICAgICAgdmFyIGZvcm1hdCA9IGF0dGFjaG1lbnRPcHRpb25zLmZvcm1hdDtcbiAgICAgIGlmIChhdHRhY2htZW50IGluc3RhbmNlb2YgV2ViR0xSZW5kZXJidWZmZXIpIHtcbiAgICAgICAgZ2wuYmluZFJlbmRlcmJ1ZmZlcihnbC5SRU5ERVJCVUZGRVIsIGF0dGFjaG1lbnQpO1xuICAgICAgICBnbC5yZW5kZXJidWZmZXJTdG9yYWdlKGdsLlJFTkRFUkJVRkZFUiwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0YWNobWVudCBpbnN0YW5jZW9mIFdlYkdMVGV4dHVyZSkge1xuICAgICAgICB0ZXh0dXJlcy5yZXNpemVUZXh0dXJlKGdsLCBhdHRhY2htZW50LCBhdHRhY2htZW50T3B0aW9ucywgd2lkdGgsIGhlaWdodCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBcInVua25vd24gYXR0YWNobWVudCB0eXBlXCI7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQmluZHMgYSBmcmFtZWJ1ZmZlclxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIHByZXR0eSBtdWNoIHNvbGV5IGV4aXN0cyBiZWNhdXNlIEkgc3BlbnQgaG91cnNcbiAgICogdHJ5aW5nIHRvIGZpZ3VyZSBvdXQgd2h5IHNvbWV0aGluZyBJIHdyb3RlIHdhc24ndCB3b3JraW5nIG9ubHlcbiAgICogdG8gcmVhbGl6ZSBJIGZvcmdldCB0byBzZXQgdGhlIHZpZXdwb3J0IGRpbWVuc2lvbnMuXG4gICAqIE15IGhvcGUgaXMgdGhpcyBmdW5jdGlvbiB3aWxsIGZpeCB0aGF0LlxuICAgKlxuICAgKiBJdCBpcyBlZmZlY3RpdmVseSB0aGUgc2FtZSBhc1xuICAgKlxuICAgKiAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKGdsLkZSQU1FQlVGRkVSLCBzb21lRnJhbWVidWZmZXJJbmZvLmZyYW1lYnVmZmVyKTtcbiAgICogICAgIGdsLnZpZXdwb3J0KDAsIDAsIHNvbWVGcmFtZWJ1ZmZlckluZm8ud2lkdGgsIHNvbWVGcmFtZWJ1ZmZlckluZm8uaGVpZ2h0KTtcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5GcmFtZWJ1ZmZlckluZm99IFtmcmFtZWJ1ZmZlckluZm9dIGEgZnJhbWVidWZmZXJJbmZvIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIG1vZHVsZTp0d2dsLmNyZWF0ZUZyYW1lYnVmZmVyfS5cbiAgICogICBJZiBub3QgcGFzc2VkIHdpbGwgYmluZCB0aGUgY2FudmFzLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3RhcmdldF0gVGhlIHRhcmdldC4gSWYgbm90IHBhc3NlZCBgZ2wuRlJBTUVCVUZGRVJgIHdpbGwgYmUgdXNlZC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGJpbmRGcmFtZWJ1ZmZlckluZm8oZ2wsIGZyYW1lYnVmZmVySW5mbywgdGFyZ2V0KSB7XG4gICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IGdsLkZSQU1FQlVGRkVSO1xuICAgIGlmIChmcmFtZWJ1ZmZlckluZm8pIHtcbiAgICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcih0YXJnZXQsIGZyYW1lYnVmZmVySW5mby5mcmFtZWJ1ZmZlcik7XG4gICAgICBnbC52aWV3cG9ydCgwLCAwLCBmcmFtZWJ1ZmZlckluZm8ud2lkdGgsIGZyYW1lYnVmZmVySW5mby5oZWlnaHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnbC5iaW5kRnJhbWVidWZmZXIodGFyZ2V0LCBudWxsKTtcbiAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmRyYXdpbmdCdWZmZXJXaWR0aCwgZ2wuZHJhd2luZ0J1ZmZlckhlaWdodCk7XG4gICAgfVxuICB9XG5cbiAgLy8gVXNpbmcgcXVvdGVzIHByZXZlbnRzIFVnbGlmeSBmcm9tIGNoYW5naW5nIHRoZSBuYW1lcy5cbiAgLy8gTm8gc3BlZWQgZGlmZiBBRkFJQ1QuXG4gIHJldHVybiB7XG4gICAgXCJiaW5kRnJhbWVidWZmZXJJbmZvXCI6IGJpbmRGcmFtZWJ1ZmZlckluZm8sXG4gICAgXCJjcmVhdGVGcmFtZWJ1ZmZlckluZm9cIjogY3JlYXRlRnJhbWVidWZmZXJJbmZvLFxuICAgIFwicmVzaXplRnJhbWVidWZmZXJJbmZvXCI6IHJlc2l6ZUZyYW1lYnVmZmVySW5mbyxcbiAgfTtcbn0pO1xuXG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSwgR3JlZ2cgVGF2YXJlcy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG5kZWZpbmUoJ3R3Z2wvdHdnbCcsW1xuICAgICcuL2F0dHJpYnV0ZXMnLFxuICAgICcuL2RyYXcnLFxuICAgICcuL2ZyYW1lYnVmZmVycycsXG4gICAgJy4vcHJvZ3JhbXMnLFxuICAgICcuL3RleHR1cmVzJyxcbiAgICAnLi90eXBlZGFycmF5cycsXG4gIF0sIGZ1bmN0aW9uIChcbiAgICBhdHRyaWJ1dGVzLFxuICAgIGRyYXcsXG4gICAgZnJhbWVidWZmZXJzLFxuICAgIHByb2dyYW1zLFxuICAgIHRleHR1cmVzLFxuICAgIHR5cGVkQXJyYXlzKSB7XG4gIFxuXG4gIC8qKlxuICAgKiBUaGUgbWFpbiBUV0dMIG1vZHVsZS5cbiAgICpcbiAgICogQG1vZHVsZSB0d2dsXG4gICAqL1xuXG4gIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBzZWUgYSBnbG9iYWwgZ2xcbiAgdmFyIGdsID0gdW5kZWZpbmVkOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gIC8qKlxuICAgKiBWYXJpb3VzIGRlZmF1bHQgc2V0dGluZ3MgZm9yIHR3Z2wuXG4gICAqXG4gICAqIE5vdGU6IFlvdSBjYW4gY2FsbCB0aGlzIGFueSBudW1iZXIgb2YgdGltZXMuIEV4YW1wbGU6XG4gICAqXG4gICAqICAgICB0d2dsLnNldERlZmF1bHRzKHsgdGV4dHVyZUNvbG9yOiBbMSwgMCwgMCwgMV0gfSk7XG4gICAqICAgICB0d2dsLnNldERlZmF1bHRzKHsgYXR0cmliUHJlZml4OiAnYV8nIH0pO1xuICAgKlxuICAgKiBpcyBlcXVpdmFsZW50IHRvXG4gICAqXG4gICAqICAgICB0d2dsLnNldERlZmF1bHRzKHtcbiAgICogICAgICAgdGV4dHVyZUNvbG9yOiBbMSwgMCwgMCwgMV0sXG4gICAqICAgICAgIGF0dHJpYlByZWZpeDogJ2FfJyxcbiAgICogICAgIH0pO1xuICAgKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBEZWZhdWx0c1xuICAgKiBAcHJvcGVydHkge3N0cmluZ30gYXR0cmliUHJlZml4IFRoZSBwcmVmaXggdG8gc3RpY2sgb24gYXR0cmlidXRlc1xuICAgKlxuICAgKiAgIFdoZW4gd3JpdGluZyBzaGFkZXJzIEkgcHJlZmVyIHRvIG5hbWUgYXR0cmlidXRlcyB3aXRoIGBhX2AsIHVuaWZvcm1zIHdpdGggYHVfYCBhbmQgdmFyeWluZ3Mgd2l0aCBgdl9gXG4gICAqICAgYXMgaXQgbWFrZXMgaXQgY2xlYXIgd2hlcmUgdGhleSBjYW1lIGZyb20uIEJ1dCwgd2hlbiBidWlsZGluZyBnZW9tZXRyeSBJIHByZWZlciB1c2luZyB1bnByZWZpeGVkIG5hbWVzLlxuICAgKlxuICAgKiAgIEluIG90aGVyd29yZHMgSSdsbCBjcmVhdGUgYXJyYXlzIG9mIGdlb21ldHJ5IGxpa2UgdGhpc1xuICAgKlxuICAgKiAgICAgICB2YXIgYXJyYXlzID0ge1xuICAgKiAgICAgICAgIHBvc2l0aW9uOiAuLi5cbiAgICogICAgICAgICBub3JtYWw6IC4uLlxuICAgKiAgICAgICAgIHRleGNvb3JkOiAuLi5cbiAgICogICAgICAgfTtcbiAgICpcbiAgICogICBCdXQgbmVlZCB0aG9zZSBtYXBwZWQgdG8gYXR0cmlidXRlcyBhbmQgbXkgYXR0cmlidXRlcyBzdGFydCB3aXRoIGBhX2AuXG4gICAqXG4gICAqICAgRGVmYXVsdDogYFwiXCJgXG4gICAqXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyW119IHRleHR1cmVDb2xvciBBcnJheSBvZiA0IHZhbHVlcyBpbiB0aGUgcmFuZ2UgMCB0byAxXG4gICAqXG4gICAqICAgVGhlIGRlZmF1bHQgdGV4dHVyZSBjb2xvciBpcyB1c2VkIHdoZW4gbG9hZGluZyB0ZXh0dXJlcyBmcm9tXG4gICAqICAgdXJscy4gQmVjYXVzZSB0aGUgVVJMIHdpbGwgYmUgbG9hZGVkIGFzeW5jIHdlJ2QgbGlrZSB0byBiZVxuICAgKiAgIGFibGUgdG8gdXNlIHRoZSB0ZXh0dXJlIGltbWVkaWF0ZWx5LiBCeSBwdXR0aW5nIGEgMXgxIHBpeGVsXG4gICAqICAgY29sb3IgaW4gdGhlIHRleHR1cmUgd2UgY2FuIHN0YXJ0IHVzaW5nIHRoZSB0ZXh0dXJlIGJlZm9yZVxuICAgKiAgIHRoZSBVUkwgaGFzIGxvYWRlZC5cbiAgICpcbiAgICogICBEZWZhdWx0OiBgWzAuNSwgMC43NSwgMSwgMV1gXG4gICAqXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBjcm9zc09yaWdpblxuICAgKlxuICAgKiAgIElmIG5vdCB1bmRlZmluZWQgc2V0cyB0aGUgY3Jvc3NPcmlnaW4gYXR0cmlidXRlIG9uIGltYWdlc1xuICAgKiAgIHRoYXQgdHdnbCBjcmVhdGVzIHdoZW4gZG93bmxvYWRpbmcgaW1hZ2VzIGZvciB0ZXh0dXJlcy5cbiAgICpcbiAgICogICBBbHNvIHNlZSB7QGxpbmsgbW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9LlxuICAgKlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cbiAgLyoqXG4gICAqIFNldHMgdmFyaW91cyBkZWZhdWx0cyBmb3IgdHdnbC5cbiAgICpcbiAgICogSW4gdGhlIGludGVyZXN0IG9mIHRlcnNlbmVzcyB3aGljaCBpcyBraW5kIG9mIHRoZSBwb2ludFxuICAgKiBvZiB0d2dsIEkndmUgaW50ZWdyYXRlZCBhIGZldyBvZiB0aGUgb2xkZXIgZnVuY3Rpb25zIGhlcmVcbiAgICpcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5EZWZhdWx0c30gbmV3RGVmYXVsdHMgVGhlIGRlZmF1bHQgc2V0dGluZ3MuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0RGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgICBhdHRyaWJ1dGVzLnNldERlZmF1bHRzXyhuZXdEZWZhdWx0cyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgdGV4dHVyZXMuc2V0RGVmYXVsdHNfKG5ld0RlZmF1bHRzKTsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgd2ViZ2wgY29udGV4dC5cbiAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzIFRoZSBjYW52YXMgdGFnIHRvIGdldFxuICAgKiAgICAgY29udGV4dCBmcm9tLiBJZiBvbmUgaXMgbm90IHBhc3NlZCBpbiBvbmUgd2lsbCBiZVxuICAgKiAgICAgY3JlYXRlZC5cbiAgICogQHJldHVybiB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBUaGUgY3JlYXRlZCBjb250ZXh0LlxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlM0RDb250ZXh0KGNhbnZhcywgb3B0X2F0dHJpYnMpIHtcbiAgICB2YXIgbmFtZXMgPSBbXCJ3ZWJnbFwiLCBcImV4cGVyaW1lbnRhbC13ZWJnbFwiXTtcbiAgICB2YXIgY29udGV4dCA9IG51bGw7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG5hbWVzLmxlbmd0aDsgKytpaSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KG5hbWVzW2lpXSwgb3B0X2F0dHJpYnMpO1xuICAgICAgfSBjYXRjaChlKSB7fSAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb250ZXh0O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBXZWJHTCBjb250ZXh0LlxuICAgKiBAcGFyYW0ge0hUTUxDYW52YXNFbGVtZW50fSBjYW52YXMgYSBjYW52YXMgZWxlbWVudC5cbiAgICogQHBhcmFtIHtXZWJHTENvbnRleHRDcmVhdGlvbkF0dGlyYnV0ZXN9IFtvcHRfYXR0cmlic10gb3B0aW9uYWwgd2ViZ2wgY29udGV4dCBjcmVhdGlvbiBhdHRyaWJ1dGVzXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0V2ViR0xDb250ZXh0KGNhbnZhcywgb3B0X2F0dHJpYnMpIHtcbiAgICB2YXIgZ2wgPSBjcmVhdGUzRENvbnRleHQoY2FudmFzLCBvcHRfYXR0cmlicyk7XG4gICAgcmV0dXJuIGdsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZSBhIGNhbnZhcyB0byBtYXRjaCB0aGUgc2l6ZSBpdCdzIGRpc3BsYXllZC5cbiAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzIFRoZSBjYW52YXMgdG8gcmVzaXplLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW2FdIG11bHRpcGxpZXIuIFNvIHlvdSBjYW4gcGFzcyBpbiBgd2luZG93LmRldmljZVBpeGVsUmF0aW9gIGlmIHlvdSB3YW50IHRvLlxuICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBjYW52YXMgd2FzIHJlc2l6ZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gcmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShjYW52YXMsIG11bHRpcGxpZXIpIHtcbiAgICBtdWx0aXBsaWVyID0gbXVsdGlwbGllciB8fCAxO1xuICAgIG11bHRpcGxpZXIgPSBNYXRoLm1heCgxLCBtdWx0aXBsaWVyKTtcbiAgICB2YXIgd2lkdGggID0gY2FudmFzLmNsaWVudFdpZHRoICAqIG11bHRpcGxpZXIgfCAwO1xuICAgIHZhciBoZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0ICogbXVsdGlwbGllciB8IDA7XG4gICAgaWYgKGNhbnZhcy53aWR0aCAhPT0gd2lkdGggfHxcbiAgICAgICAgY2FudmFzLmhlaWdodCAhPT0gaGVpZ2h0KSB7XG4gICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gVXNpbmcgcXVvdGVzIHByZXZlbnRzIFVnbGlmeSBmcm9tIGNoYW5naW5nIHRoZSBuYW1lcy5cbiAgLy8gTm8gc3BlZWQgZGlmZiBBRkFJQ1QuXG4gIHZhciBhcGkgPSB7XG4gICAgXCJnZXRXZWJHTENvbnRleHRcIjogZ2V0V2ViR0xDb250ZXh0LFxuICAgIFwicmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZVwiOiByZXNpemVDYW52YXNUb0Rpc3BsYXlTaXplLFxuICAgIFwic2V0RGVmYXVsdHNcIjogc2V0RGVmYXVsdHMsXG4gIH07XG5cbiAgZnVuY3Rpb24gbm90UHJpdmF0ZShuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWVbbmFtZS5sZW5ndGggLSAxXSAhPT0gJ18nO1xuICB9XG5cbiAgZnVuY3Rpb24gY29weVB1YmxpY1Byb3BlcnRpZXMoc3JjLCBkc3QpIHtcbiAgICBPYmplY3Qua2V5cyhzcmMpLmZpbHRlcihub3RQcml2YXRlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgZHN0W2tleV0gPSBzcmNba2V5XTtcbiAgICB9KTtcbiAgfVxuXG4gIFtcbiAgICBhdHRyaWJ1dGVzLFxuICAgIGRyYXcsXG4gICAgZnJhbWVidWZmZXJzLFxuICAgIHByb2dyYW1zLFxuICAgIHRleHR1cmVzLFxuICAgIHR5cGVkQXJyYXlzLFxuICBdLmZvckVhY2goZnVuY3Rpb24oc3JjKSB7XG4gICAgY29weVB1YmxpY1Byb3BlcnRpZXMoc3JjLCBhcGkpO1xuICB9KTtcblxuICByZXR1cm4gYXBpO1xuXG59KTtcblxuXG4vKlxuICogQ29weXJpZ2h0IDIwMTUsIEdyZWdnIFRhdmFyZXMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZVxuICogbWV0OlxuICpcbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXG4gKiBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyXG4gKiBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlXG4gKiBkaXN0cmlidXRpb24uXG4gKiAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdyZWdnIFRhdmFyZXMuIG5vciB0aGUgbmFtZXMgb2YgaGlzXG4gKiBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbVxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAqIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcbiAqIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLFxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXG4gKiBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuZGVmaW5lKCd0d2dsL3YzJyxbXSwgZnVuY3Rpb24gKCkge1xuICBcblxuICAvKipcbiAgICpcbiAgICogVmVjMyBtYXRoIG1hdGggZnVuY3Rpb25zLlxuICAgKlxuICAgKiBBbG1vc3QgYWxsIGZ1bmN0aW9ucyB0YWtlIGFuIG9wdGlvbmFsIGBkc3RgIGFyZ3VtZW50LiBJZiBpdCBpcyBub3QgcGFzc2VkIGluIHRoZVxuICAgKiBmdW5jdGlvbnMgd2lsbCBjcmVhdGUgYSBuZXcgVmVjMy4gSW4gb3RoZXIgd29yZHMgeW91IGNhbiBkbyB0aGlzXG4gICAqXG4gICAqICAgICB2YXIgdiA9IHYzLmNyb3NzKHYxLCB2Mik7ICAvLyBDcmVhdGVzIGEgbmV3IFZlYzMgd2l0aCB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB2MSB4IHYyLlxuICAgKlxuICAgKiBvclxuICAgKlxuICAgKiAgICAgdmFyIHYzID0gdjMuY3JlYXRlKCk7XG4gICAqICAgICB2My5jcm9zcyh2MSwgdjIsIHYpOyAgLy8gUHV0cyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB2MSB4IHYyIGluIHZcbiAgICpcbiAgICogVGhlIGZpcnN0IHN0eWxlIGlzIG9mdGVuIGVhc2llciBidXQgZGVwZW5kaW5nIG9uIHdoZXJlIGl0J3MgdXNlZCBpdCBnZW5lcmF0ZXMgZ2FyYmFnZSB3aGVyZVxuICAgKiBhcyB0aGVyZSBpcyBhbG1vc3QgbmV2ZXIgYWxsb2NhdGlvbiB3aXRoIHRoZSBzZWNvbmQgc3R5bGUuXG4gICAqXG4gICAqIEl0IGlzIGFsd2F5cyBzYXZlIHRvIHBhc3MgYW55IHZlY3RvciBhcyB0aGUgZGVzdGluYXRpb24uIFNvIGZvciBleGFtcGxlXG4gICAqXG4gICAqICAgICB2My5jcm9zcyh2MSwgdjIsIHYxKTsgIC8vIFB1dHMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdjEgeCB2MiBpbiB2MVxuICAgKlxuICAgKiBAbW9kdWxlIHR3Z2wvdjNcbiAgICovXG5cbiAgdmFyIFZlY1R5cGUgPSBGbG9hdDMyQXJyYXk7XG5cbiAgLyoqXG4gICAqIEEgSmF2YVNjcmlwdCBhcnJheSB3aXRoIDMgdmFsdWVzIG9yIGEgRmxvYXQzMkFycmF5IHdpdGggMyB2YWx1ZXMuXG4gICAqIFdoZW4gY3JlYXRlZCBieSB0aGUgbGlicmFyeSB3aWxsIGNyZWF0ZSB0aGUgZGVmYXVsdCB0eXBlIHdoaWNoIGlzIGBGbG9hdDMyQXJyYXlgXG4gICAqIGJ1dCBjYW4gYmUgc2V0IGJ5IGNhbGxpbmcge0BsaW5rIG1vZHVsZTp0d2dsL3YzLnNldERlZmF1bHRUeXBlfS5cbiAgICogQHR5cGVkZWYgeyhudW1iZXJbXXxGbG9hdDMyQXJyYXkpfSBWZWMzXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC92M1xuICAgKi9cblxuICAvKipcbiAgICogU2V0cyB0aGUgdHlwZSB0aGlzIGxpYnJhcnkgY3JlYXRlcyBmb3IgYSBWZWMzXG4gICAqIEBwYXJhbSB7Y29uc3RydWN0b3J9IGN0b3IgdGhlIGNvbnN0cnVjdG9yIGZvciB0aGUgdHlwZS4gRWl0aGVyIGBGbG9hdDMyQXJyYXlgIG9yIGBBcnJheWBcbiAgICovXG4gIGZ1bmN0aW9uIHNldERlZmF1bHRUeXBlKGN0b3IpIHtcbiAgICAgIFZlY1R5cGUgPSBjdG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSB2ZWMzOyBtYXkgYmUgY2FsbGVkIHdpdGggeCwgeSwgeiB0byBzZXQgaW5pdGlhbCB2YWx1ZXMuXG4gICAqIEByZXR1cm4ge1ZlYzN9IHRoZSBjcmVhdGVkIHZlY3RvclxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvdjNcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZSh4LCB5LCB6KSB7XG4gICAgdmFyIGRzdCA9IG5ldyBWZWNUeXBlKDMpO1xuICAgIGlmICh4KSB7XG4gICAgICBkc3RbMF0gPSB4O1xuICAgIH1cbiAgICBpZiAoeSkge1xuICAgICAgZHN0WzFdID0geTtcbiAgICB9XG4gICAgaWYgKHopIHtcbiAgICAgIGRzdFsyXSA9IHo7XG4gICAgfVxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0d28gdmVjdG9yczsgYXNzdW1lcyBhIGFuZCBiIGhhdmUgdGhlIHNhbWUgZGltZW5zaW9uLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGEgT3BlcmFuZCB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gYiBPcGVyYW5kIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBbZHN0XSB2ZWN0b3IgdG8gaG9sZCByZXN1bHQuIElmIG5vdCBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvdjNcbiAgICovXG4gIGZ1bmN0aW9uIGFkZChhLCBiLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IFZlY1R5cGUoMyk7XG5cbiAgICBkc3RbMF0gPSBhWzBdICsgYlswXTtcbiAgICBkc3RbMV0gPSBhWzFdICsgYlsxXTtcbiAgICBkc3RbMl0gPSBhWzJdICsgYlsyXTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogU3VidHJhY3RzIHR3byB2ZWN0b3JzLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGEgT3BlcmFuZCB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gYiBPcGVyYW5kIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBbZHN0XSB2ZWN0b3IgdG8gaG9sZCByZXN1bHQuIElmIG5vdCBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvdjNcbiAgICovXG4gIGZ1bmN0aW9uIHN1YnRyYWN0KGEsIGIsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgVmVjVHlwZSgzKTtcblxuICAgIGRzdFswXSA9IGFbMF0gLSBiWzBdO1xuICAgIGRzdFsxXSA9IGFbMV0gLSBiWzFdO1xuICAgIGRzdFsyXSA9IGFbMl0gLSBiWzJdO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyBsaW5lYXIgaW50ZXJwb2xhdGlvbiBvbiB0d28gdmVjdG9ycy5cbiAgICogR2l2ZW4gdmVjdG9ycyBhIGFuZCBiIGFuZCBpbnRlcnBvbGF0aW9uIGNvZWZmaWNpZW50IHQsIHJldHVybnNcbiAgICogKDEgLSB0KSAqIGEgKyB0ICogYi5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBhIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGIgT3BlcmFuZCB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0IEludGVycG9sYXRpb24gY29lZmZpY2llbnQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gW2RzdF0gdmVjdG9yIHRvIGhvbGQgcmVzdWx0LiBJZiBub3QgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBsZXJwKGEsIGIsIHQsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgVmVjVHlwZSgzKTtcblxuICAgIGRzdFswXSA9ICgxIC0gdCkgKiBhWzBdICsgdCAqIGJbMF07XG4gICAgZHN0WzFdID0gKDEgLSB0KSAqIGFbMV0gKyB0ICogYlsxXTtcbiAgICBkc3RbMl0gPSAoMSAtIHQpICogYVsyXSArIHQgKiBiWzJdO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdXRpcGxpZXMgYSB2ZWN0b3IgYnkgYSBzY2FsYXIuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gdiBUaGUgdmVjdG9yLlxuICAgKiBAcGFyYW0ge251bWJlcn0gayBUaGUgc2NhbGFyLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFtkc3RdIHZlY3RvciB0byBob2xkIHJlc3VsdC4gSWYgbm90IG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGRzdC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBtdWxTY2FsYXIodiwgaywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBWZWNUeXBlKDMpO1xuXG4gICAgZHN0WzBdID0gdlswXSAqIGs7XG4gICAgZHN0WzFdID0gdlsxXSAqIGs7XG4gICAgZHN0WzJdID0gdlsyXSAqIGs7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIERpdmlkZXMgYSB2ZWN0b3IgYnkgYSBzY2FsYXIuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gdiBUaGUgdmVjdG9yLlxuICAgKiBAcGFyYW0ge251bWJlcn0gayBUaGUgc2NhbGFyLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFtkc3RdIHZlY3RvciB0byBob2xkIHJlc3VsdC4gSWYgbm90IG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGRzdC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBkaXZTY2FsYXIodiwgaywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBWZWNUeXBlKDMpO1xuXG4gICAgZHN0WzBdID0gdlswXSAvIGs7XG4gICAgZHN0WzFdID0gdlsxXSAvIGs7XG4gICAgZHN0WzJdID0gdlsyXSAvIGs7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWN0b3JzOyBhc3N1bWVzIGJvdGggdmVjdG9ycyBoYXZlXG4gICAqIHRocmVlIGVudHJpZXMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gYSBPcGVyYW5kIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBiIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFtkc3RdIHZlY3RvciB0byBob2xkIHJlc3VsdC4gSWYgbm90IG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFRoZSB2ZWN0b3IgYSBjcm9zcyBiLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvdjNcbiAgICovXG4gIGZ1bmN0aW9uIGNyb3NzKGEsIGIsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgVmVjVHlwZSgzKTtcblxuICAgIGRzdFswXSA9IGFbMV0gKiBiWzJdIC0gYVsyXSAqIGJbMV07XG4gICAgZHN0WzFdID0gYVsyXSAqIGJbMF0gLSBhWzBdICogYlsyXTtcbiAgICBkc3RbMl0gPSBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlY3RvcnM7IGFzc3VtZXMgYm90aCB2ZWN0b3JzIGhhdmVcbiAgICogdGhyZWUgZW50cmllcy5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBhIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGIgT3BlcmFuZCB2ZWN0b3IuXG4gICAqIEByZXR1cm4ge251bWJlcn0gZG90IHByb2R1Y3RcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBkb3QoYSwgYikge1xuICAgIHJldHVybiAoYVswXSAqIGJbMF0pICsgKGFbMV0gKiBiWzFdKSArIChhWzJdICogYlsyXSk7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIGxlbmd0aCBvZiB2ZWN0b3JcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSB2IHZlY3Rvci5cbiAgICogQHJldHVybiB7bnVtYmVyfSBsZW5ndGggb2YgdmVjdG9yLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvdjNcbiAgICovXG4gIGZ1bmN0aW9uIGxlbmd0aCh2KSB7XG4gICAgcmV0dXJuIE1hdGguc3FydCh2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBzcXVhcmUgb2YgdGhlIGxlbmd0aCBvZiB2ZWN0b3JcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSB2IHZlY3Rvci5cbiAgICogQHJldHVybiB7bnVtYmVyfSBzcXVhcmUgb2YgdGhlIGxlbmd0aCBvZiB2ZWN0b3IuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC92M1xuICAgKi9cbiAgZnVuY3Rpb24gbGVuZ3RoU3Eodikge1xuICAgIHJldHVybiB2WzBdICogdlswXSArIHZbMV0gKiB2WzFdICsgdlsyXSAqIHZbMl07XG4gIH1cblxuICAvKipcbiAgICogRGl2aWRlcyBhIHZlY3RvciBieSBpdHMgRXVjbGlkZWFuIGxlbmd0aCBhbmQgcmV0dXJucyB0aGUgcXVvdGllbnQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gYSBUaGUgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFtkc3RdIHZlY3RvciB0byBob2xkIHJlc3VsdC4gSWYgbm90IG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFRoZSBub3JtYWxpemVkIHZlY3Rvci5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBub3JtYWxpemUoYSwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBWZWNUeXBlKDMpO1xuXG4gICAgdmFyIGxlblNxID0gYVswXSAqIGFbMF0gKyBhWzFdICogYVsxXSArIGFbMl0gKiBhWzJdO1xuICAgIHZhciBsZW4gPSBNYXRoLnNxcnQobGVuU3EpO1xuICAgIGlmIChsZW4gPiAwLjAwMDAxKSB7XG4gICAgICBkc3RbMF0gPSBhWzBdIC8gbGVuO1xuICAgICAgZHN0WzFdID0gYVsxXSAvIGxlbjtcbiAgICAgIGRzdFsyXSA9IGFbMl0gLyBsZW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGRzdFswXSA9IDA7XG4gICAgICBkc3RbMV0gPSAwO1xuICAgICAgZHN0WzJdID0gMDtcbiAgICB9XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIE5lZ2F0ZXMgYSB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gdiBUaGUgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFtkc3RdIHZlY3RvciB0byBob2xkIHJlc3VsdC4gSWYgbm90IG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL3YzLlZlYzN9IC12LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvdjNcbiAgICovXG4gIGZ1bmN0aW9uIG5lZ2F0ZSh2LCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IFZlY1R5cGUoMyk7XG5cbiAgICBkc3RbMF0gPSAtdlswXTtcbiAgICBkc3RbMV0gPSAtdlsxXTtcbiAgICBkc3RbMl0gPSAtdlsyXTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIGEgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IHYgVGhlIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBbZHN0XSB2ZWN0b3IgdG8gaG9sZCByZXN1bHQuIElmIG5vdCBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC92My5WZWMzfSBBIGNvcHkgb2Ygdi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBjb3B5KHYsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgVmVjVHlwZSgzKTtcblxuICAgIGRzdFswXSA9IHZbMF07XG4gICAgZHN0WzFdID0gdlsxXTtcbiAgICBkc3RbMl0gPSB2WzJdO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBsaWVzIGEgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yIChjb21wb25lbnQtd2lzZSk7IGFzc3VtZXMgYSBhbmRcbiAgICogYiBoYXZlIHRoZSBzYW1lIGxlbmd0aC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBhIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGIgT3BlcmFuZCB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gW2RzdF0gdmVjdG9yIHRvIGhvbGQgcmVzdWx0LiBJZiBub3QgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gVGhlIHZlY3RvciBvZiBwcm9kdWN0cyBvZiBlbnRyaWVzIG9mIGEgYW5kXG4gICAqICAgICBiLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvdjNcbiAgICovXG4gIGZ1bmN0aW9uIG11bHRpcGx5KGEsIGIsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgVmVjVHlwZSgzKTtcblxuICAgIGRzdFswXSA9IGFbMF0gKiBiWzBdO1xuICAgIGRzdFsxXSA9IGFbMV0gKiBiWzFdO1xuICAgIGRzdFsyXSA9IGFbMl0gKiBiWzJdO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXZpZGVzIGEgdmVjdG9yIGJ5IGFub3RoZXIgdmVjdG9yIChjb21wb25lbnQtd2lzZSk7IGFzc3VtZXMgYSBhbmRcbiAgICogYiBoYXZlIHRoZSBzYW1lIGxlbmd0aC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBhIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGIgT3BlcmFuZCB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gW2RzdF0gdmVjdG9yIHRvIGhvbGQgcmVzdWx0LiBJZiBub3QgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gVGhlIHZlY3RvciBvZiBxdW90aWVudHMgb2YgZW50cmllcyBvZiBhIGFuZFxuICAgKiAgICAgYi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBkaXZpZGUoYSwgYiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBWZWNUeXBlKDMpO1xuXG4gICAgZHN0WzBdID0gYVswXSAvIGJbMF07XG4gICAgZHN0WzFdID0gYVsxXSAvIGJbMV07XG4gICAgZHN0WzJdID0gYVsyXSAvIGJbMl07XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLy8gVXNpbmcgcXVvdGVzIHByZXZlbnRzIFVnbGlmeSBmcm9tIGNoYW5naW5nIHRoZSBuYW1lcy5cbiAgLy8gTm8gc3BlZWQgZGlmZiBBRkFJQ1QuXG4gIHJldHVybiB7XG4gICAgXCJhZGRcIjogYWRkLFxuICAgIFwiY29weVwiOiBjb3B5LFxuICAgIFwiY3JlYXRlXCI6IGNyZWF0ZSxcbiAgICBcImNyb3NzXCI6IGNyb3NzLFxuICAgIFwiZGl2aWRlXCI6IGRpdmlkZSxcbiAgICBcImRpdlNjYWxhclwiOiBkaXZTY2FsYXIsXG4gICAgXCJkb3RcIjogZG90LFxuICAgIFwibGVycFwiOiBsZXJwLFxuICAgIFwibGVuZ3RoXCI6IGxlbmd0aCxcbiAgICBcImxlbmd0aFNxXCI6IGxlbmd0aFNxLFxuICAgIFwibXVsU2NhbGFyXCI6IG11bFNjYWxhcixcbiAgICBcIm11bHRpcGx5XCI6IG11bHRpcGx5LFxuICAgIFwibmVnYXRlXCI6IG5lZ2F0ZSxcbiAgICBcIm5vcm1hbGl6ZVwiOiBub3JtYWxpemUsXG4gICAgXCJzZXREZWZhdWx0VHlwZVwiOiBzZXREZWZhdWx0VHlwZSxcbiAgICBcInN1YnRyYWN0XCI6IHN1YnRyYWN0LFxuICB9O1xuXG59KTtcblxuLypcbiAqIENvcHlyaWdodCAyMDE1LCBHcmVnZyBUYXZhcmVzLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmRlZmluZSgndHdnbC9tNCcsWycuL3YzJ10sIGZ1bmN0aW9uICh2Mykge1xuICBcblxuICAvKipcbiAgICogNHg0IE1hdHJpeCBtYXRoIG1hdGggZnVuY3Rpb25zLlxuICAgKlxuICAgKiBBbG1vc3QgYWxsIGZ1bmN0aW9ucyB0YWtlIGFuIG9wdGlvbmFsIGBkc3RgIGFyZ3VtZW50LiBJZiBpdCBpcyBub3QgcGFzc2VkIGluIHRoZVxuICAgKiBmdW5jdGlvbnMgd2lsbCBjcmVhdGUgYSBuZXcgbWF0cml4LiBJbiBvdGhlciB3b3JkcyB5b3UgY2FuIGRvIHRoaXNcbiAgICpcbiAgICogICAgIHZhciBtYXQgPSBtNC50cmFuc2xhdGlvbihbMSwgMiwgM10pOyAgLy8gQ3JlYXRlcyBhIG5ldyB0cmFuc2xhdGlvbiBtYXRyaXhcbiAgICpcbiAgICogb3JcbiAgICpcbiAgICogICAgIHZhciBtYXQgPSBtNC5jcmVhdGUoKTtcbiAgICogICAgIG00LnRyYW5zbGF0aW9uKFsxLCAyLCAzXSwgbWF0KTsgIC8vIFB1dHMgdHJhbnNsYXRpb24gbWF0cml4IGluIG1hdC5cbiAgICpcbiAgICogVGhlIGZpcnN0IHN0eWxlIGlzIG9mdGVuIGVhc2llciBidXQgZGVwZW5kaW5nIG9uIHdoZXJlIGl0J3MgdXNlZCBpdCBnZW5lcmF0ZXMgZ2FyYmFnZSB3aGVyZVxuICAgKiBhcyB0aGVyZSBpcyBhbG1vc3QgbmV2ZXIgYWxsb2NhdGlvbiB3aXRoIHRoZSBzZWNvbmQgc3R5bGUuXG4gICAqXG4gICAqIEl0IGlzIGFsd2F5cyBzYXZlIHRvIHBhc3MgYW55IG1hdHJpeCBhcyB0aGUgZGVzdGluYXRpb24uIFNvIGZvciBleGFtcGxlXG4gICAqXG4gICAqICAgICB2YXIgbWF0ID0gbTQuaWRlbnRpdHkoKTtcbiAgICogICAgIHZhciB0cmFucyA9IG00LnRyYW5zbGF0aW9uKFsxLCAyLCAzXSk7XG4gICAqICAgICBtNC5tdWx0aXBseShtYXQsIHRyYW5zLCBtYXQpOyAgLy8gTXVsdGlwbGllcyBtYXQgKiB0cmFucyBhbmQgcHV0cyByZXN1bHQgaW4gbWF0LlxuICAgKlxuICAgKiBAbW9kdWxlIHR3Z2wvbTRcbiAgICovXG4gIHZhciBNYXRUeXBlID0gRmxvYXQzMkFycmF5O1xuXG4gIHZhciB0ZW1wVjNhID0gdjMuY3JlYXRlKCk7XG4gIHZhciB0ZW1wVjNiID0gdjMuY3JlYXRlKCk7XG4gIHZhciB0ZW1wVjNjID0gdjMuY3JlYXRlKCk7XG5cbiAgLyoqXG4gICAqIEEgSmF2YVNjcmlwdCBhcnJheSB3aXRoIDE2IHZhbHVlcyBvciBhIEZsb2F0MzJBcnJheSB3aXRoIDE2IHZhbHVlcy5cbiAgICogV2hlbiBjcmVhdGVkIGJ5IHRoZSBsaWJyYXJ5IHdpbGwgY3JlYXRlIHRoZSBkZWZhdWx0IHR5cGUgd2hpY2ggaXMgYEZsb2F0MzJBcnJheWBcbiAgICogYnV0IGNhbiBiZSBzZXQgYnkgY2FsbGluZyB7QGxpbmsgbW9kdWxlOnR3Z2wvbTQuc2V0RGVmYXVsdFR5cGV9LlxuICAgKiBAdHlwZWRlZiB7KG51bWJlcltdfEZsb2F0MzJBcnJheSl9IE1hdDRcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0eXBlIHRoaXMgbGlicmFyeSBjcmVhdGVzIGZvciBhIE1hdDRcbiAgICogQHBhcmFtIHtjb25zdHJ1Y3Rvcn0gY3RvciB0aGUgY29uc3RydWN0b3IgZm9yIHRoZSB0eXBlLiBFaXRoZXIgYEZsb2F0MzJBcnJheWAgb3IgYEFycmF5YFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0RGVmYXVsdFR5cGUoY3Rvcikge1xuICAgICAgVmVjVHlwZSA9IGN0b3I7XG4gIH1cblxuICAvKipcbiAgICogTmVnYXRlcyBhIG1hdHJpeC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXguXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IC1tLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIG5lZ2F0ZShtLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgZHN0WyAwXSA9IC1tWyAwXTtcbiAgICBkc3RbIDFdID0gLW1bIDFdO1xuICAgIGRzdFsgMl0gPSAtbVsgMl07XG4gICAgZHN0WyAzXSA9IC1tWyAzXTtcbiAgICBkc3RbIDRdID0gLW1bIDRdO1xuICAgIGRzdFsgNV0gPSAtbVsgNV07XG4gICAgZHN0WyA2XSA9IC1tWyA2XTtcbiAgICBkc3RbIDddID0gLW1bIDddO1xuICAgIGRzdFsgOF0gPSAtbVsgOF07XG4gICAgZHN0WyA5XSA9IC1tWyA5XTtcbiAgICBkc3RbMTBdID0gLW1bMTBdO1xuICAgIGRzdFsxMV0gPSAtbVsxMV07XG4gICAgZHN0WzEyXSA9IC1tWzEyXTtcbiAgICBkc3RbMTNdID0gLW1bMTNdO1xuICAgIGRzdFsxNF0gPSAtbVsxNF07XG4gICAgZHN0WzE1XSA9IC1tWzE1XTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIGEgbWF0cml4LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBUaGUgbWF0cml4LlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBBIGNvcHkgb2YgbS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBjb3B5KG0sIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICBkc3RbIDBdID0gbVsgMF07XG4gICAgZHN0WyAxXSA9IG1bIDFdO1xuICAgIGRzdFsgMl0gPSBtWyAyXTtcbiAgICBkc3RbIDNdID0gbVsgM107XG4gICAgZHN0WyA0XSA9IG1bIDRdO1xuICAgIGRzdFsgNV0gPSBtWyA1XTtcbiAgICBkc3RbIDZdID0gbVsgNl07XG4gICAgZHN0WyA3XSA9IG1bIDddO1xuICAgIGRzdFsgOF0gPSBtWyA4XTtcbiAgICBkc3RbIDldID0gbVsgOV07XG4gICAgZHN0WzEwXSA9IG1bMTBdO1xuICAgIGRzdFsxMV0gPSBtWzExXTtcbiAgICBkc3RbMTJdID0gbVsxMl07XG4gICAgZHN0WzEzXSA9IG1bMTNdO1xuICAgIGRzdFsxNF0gPSBtWzE0XTtcbiAgICBkc3RbMTVdID0gbVsxNV07XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gbi1ieS1uIGlkZW50aXR5IG1hdHJpeC5cbiAgICpcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gQW4gbi1ieS1uIGlkZW50aXR5IG1hdHJpeC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBpZGVudGl0eShkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgZHN0WyAwXSA9IDE7XG4gICAgZHN0WyAxXSA9IDA7XG4gICAgZHN0WyAyXSA9IDA7XG4gICAgZHN0WyAzXSA9IDA7XG4gICAgZHN0WyA0XSA9IDA7XG4gICAgZHN0WyA1XSA9IDE7XG4gICAgZHN0WyA2XSA9IDA7XG4gICAgZHN0WyA3XSA9IDA7XG4gICAgZHN0WyA4XSA9IDA7XG4gICAgZHN0WyA5XSA9IDA7XG4gICAgZHN0WzEwXSA9IDE7XG4gICAgZHN0WzExXSA9IDA7XG4gICAgZHN0WzEyXSA9IDA7XG4gICAgZHN0WzEzXSA9IDA7XG4gICAgZHN0WzE0XSA9IDA7XG4gICAgZHN0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIHRoZSB0cmFuc3Bvc2Ugb2YgYSBtYXRyaXguXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBUaGUgdHJhbnNwb3NlIG9mIG0uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgIGZ1bmN0aW9uIHRyYW5zcG9zZShtLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuICAgIGlmIChkc3QgPT09IG0pIHtcbiAgICAgIHZhciB0O1xuXG4gICAgICB0ID0gbVsxXTtcbiAgICAgIG1bMV0gPSBtWzRdO1xuICAgICAgbVs0XSA9IHQ7XG5cbiAgICAgIHQgPSBtWzJdO1xuICAgICAgbVsyXSA9IG1bOF07XG4gICAgICBtWzhdID0gdDtcblxuICAgICAgdCA9IG1bM107XG4gICAgICBtWzNdID0gbVsxMl07XG4gICAgICBtWzEyXSA9IHQ7XG5cbiAgICAgIHQgPSBtWzZdO1xuICAgICAgbVs2XSA9IG1bOV07XG4gICAgICBtWzldID0gdDtcblxuICAgICAgdCA9IG1bN107XG4gICAgICBtWzddID0gbVsxM107XG4gICAgICBtWzEzXSA9IHQ7XG5cbiAgICAgIHQgPSBtWzExXTtcbiAgICAgIG1bMTFdID0gbVsxNF07XG4gICAgICBtWzE0XSA9IHQ7XG4gICAgICByZXR1cm4gZHN0O1xuICAgIH1cblxuICAgIHZhciBtMDAgPSBtWzAgKiA0ICsgMF07XG4gICAgdmFyIG0wMSA9IG1bMCAqIDQgKyAxXTtcbiAgICB2YXIgbTAyID0gbVswICogNCArIDJdO1xuICAgIHZhciBtMDMgPSBtWzAgKiA0ICsgM107XG4gICAgdmFyIG0xMCA9IG1bMSAqIDQgKyAwXTtcbiAgICB2YXIgbTExID0gbVsxICogNCArIDFdO1xuICAgIHZhciBtMTIgPSBtWzEgKiA0ICsgMl07XG4gICAgdmFyIG0xMyA9IG1bMSAqIDQgKyAzXTtcbiAgICB2YXIgbTIwID0gbVsyICogNCArIDBdO1xuICAgIHZhciBtMjEgPSBtWzIgKiA0ICsgMV07XG4gICAgdmFyIG0yMiA9IG1bMiAqIDQgKyAyXTtcbiAgICB2YXIgbTIzID0gbVsyICogNCArIDNdO1xuICAgIHZhciBtMzAgPSBtWzMgKiA0ICsgMF07XG4gICAgdmFyIG0zMSA9IG1bMyAqIDQgKyAxXTtcbiAgICB2YXIgbTMyID0gbVszICogNCArIDJdO1xuICAgIHZhciBtMzMgPSBtWzMgKiA0ICsgM107XG5cbiAgICBkc3RbIDBdID0gbTAwO1xuICAgIGRzdFsgMV0gPSBtMTA7XG4gICAgZHN0WyAyXSA9IG0yMDtcbiAgICBkc3RbIDNdID0gbTMwO1xuICAgIGRzdFsgNF0gPSBtMDE7XG4gICAgZHN0WyA1XSA9IG0xMTtcbiAgICBkc3RbIDZdID0gbTIxO1xuICAgIGRzdFsgN10gPSBtMzE7XG4gICAgZHN0WyA4XSA9IG0wMjtcbiAgICBkc3RbIDldID0gbTEyO1xuICAgIGRzdFsxMF0gPSBtMjI7XG4gICAgZHN0WzExXSA9IG0zMjtcbiAgICBkc3RbMTJdID0gbTAzO1xuICAgIGRzdFsxM10gPSBtMTM7XG4gICAgZHN0WzE0XSA9IG0yMztcbiAgICBkc3RbMTVdID0gbTMzO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgaW52ZXJzZSBvZiBhIDQtYnktNCBtYXRyaXguXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBUaGUgaW52ZXJzZSBvZiBtLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIGludmVyc2UobSwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciBtMDAgPSBtWzAgKiA0ICsgMF07XG4gICAgdmFyIG0wMSA9IG1bMCAqIDQgKyAxXTtcbiAgICB2YXIgbTAyID0gbVswICogNCArIDJdO1xuICAgIHZhciBtMDMgPSBtWzAgKiA0ICsgM107XG4gICAgdmFyIG0xMCA9IG1bMSAqIDQgKyAwXTtcbiAgICB2YXIgbTExID0gbVsxICogNCArIDFdO1xuICAgIHZhciBtMTIgPSBtWzEgKiA0ICsgMl07XG4gICAgdmFyIG0xMyA9IG1bMSAqIDQgKyAzXTtcbiAgICB2YXIgbTIwID0gbVsyICogNCArIDBdO1xuICAgIHZhciBtMjEgPSBtWzIgKiA0ICsgMV07XG4gICAgdmFyIG0yMiA9IG1bMiAqIDQgKyAyXTtcbiAgICB2YXIgbTIzID0gbVsyICogNCArIDNdO1xuICAgIHZhciBtMzAgPSBtWzMgKiA0ICsgMF07XG4gICAgdmFyIG0zMSA9IG1bMyAqIDQgKyAxXTtcbiAgICB2YXIgbTMyID0gbVszICogNCArIDJdO1xuICAgIHZhciBtMzMgPSBtWzMgKiA0ICsgM107XG4gICAgdmFyIHRtcF8wICA9IG0yMiAqIG0zMztcbiAgICB2YXIgdG1wXzEgID0gbTMyICogbTIzO1xuICAgIHZhciB0bXBfMiAgPSBtMTIgKiBtMzM7XG4gICAgdmFyIHRtcF8zICA9IG0zMiAqIG0xMztcbiAgICB2YXIgdG1wXzQgID0gbTEyICogbTIzO1xuICAgIHZhciB0bXBfNSAgPSBtMjIgKiBtMTM7XG4gICAgdmFyIHRtcF82ICA9IG0wMiAqIG0zMztcbiAgICB2YXIgdG1wXzcgID0gbTMyICogbTAzO1xuICAgIHZhciB0bXBfOCAgPSBtMDIgKiBtMjM7XG4gICAgdmFyIHRtcF85ICA9IG0yMiAqIG0wMztcbiAgICB2YXIgdG1wXzEwID0gbTAyICogbTEzO1xuICAgIHZhciB0bXBfMTEgPSBtMTIgKiBtMDM7XG4gICAgdmFyIHRtcF8xMiA9IG0yMCAqIG0zMTtcbiAgICB2YXIgdG1wXzEzID0gbTMwICogbTIxO1xuICAgIHZhciB0bXBfMTQgPSBtMTAgKiBtMzE7XG4gICAgdmFyIHRtcF8xNSA9IG0zMCAqIG0xMTtcbiAgICB2YXIgdG1wXzE2ID0gbTEwICogbTIxO1xuICAgIHZhciB0bXBfMTcgPSBtMjAgKiBtMTE7XG4gICAgdmFyIHRtcF8xOCA9IG0wMCAqIG0zMTtcbiAgICB2YXIgdG1wXzE5ID0gbTMwICogbTAxO1xuICAgIHZhciB0bXBfMjAgPSBtMDAgKiBtMjE7XG4gICAgdmFyIHRtcF8yMSA9IG0yMCAqIG0wMTtcbiAgICB2YXIgdG1wXzIyID0gbTAwICogbTExO1xuICAgIHZhciB0bXBfMjMgPSBtMTAgKiBtMDE7XG5cbiAgICB2YXIgdDAgPSAodG1wXzAgKiBtMTEgKyB0bXBfMyAqIG0yMSArIHRtcF80ICogbTMxKSAtXG4gICAgICAgICh0bXBfMSAqIG0xMSArIHRtcF8yICogbTIxICsgdG1wXzUgKiBtMzEpO1xuICAgIHZhciB0MSA9ICh0bXBfMSAqIG0wMSArIHRtcF82ICogbTIxICsgdG1wXzkgKiBtMzEpIC1cbiAgICAgICAgKHRtcF8wICogbTAxICsgdG1wXzcgKiBtMjEgKyB0bXBfOCAqIG0zMSk7XG4gICAgdmFyIHQyID0gKHRtcF8yICogbTAxICsgdG1wXzcgKiBtMTEgKyB0bXBfMTAgKiBtMzEpIC1cbiAgICAgICAgKHRtcF8zICogbTAxICsgdG1wXzYgKiBtMTEgKyB0bXBfMTEgKiBtMzEpO1xuICAgIHZhciB0MyA9ICh0bXBfNSAqIG0wMSArIHRtcF84ICogbTExICsgdG1wXzExICogbTIxKSAtXG4gICAgICAgICh0bXBfNCAqIG0wMSArIHRtcF85ICogbTExICsgdG1wXzEwICogbTIxKTtcblxuICAgIHZhciBkID0gMS4wIC8gKG0wMCAqIHQwICsgbTEwICogdDEgKyBtMjAgKiB0MiArIG0zMCAqIHQzKTtcblxuICAgIGRzdFsgMF0gPSBkICogdDA7XG4gICAgZHN0WyAxXSA9IGQgKiB0MTtcbiAgICBkc3RbIDJdID0gZCAqIHQyO1xuICAgIGRzdFsgM10gPSBkICogdDM7XG4gICAgZHN0WyA0XSA9IGQgKiAoKHRtcF8xICogbTEwICsgdG1wXzIgKiBtMjAgKyB0bXBfNSAqIG0zMCkgLVxuICAgICAgICAgICAgKHRtcF8wICogbTEwICsgdG1wXzMgKiBtMjAgKyB0bXBfNCAqIG0zMCkpO1xuICAgIGRzdFsgNV0gPSBkICogKCh0bXBfMCAqIG0wMCArIHRtcF83ICogbTIwICsgdG1wXzggKiBtMzApIC1cbiAgICAgICAgICAgICh0bXBfMSAqIG0wMCArIHRtcF82ICogbTIwICsgdG1wXzkgKiBtMzApKTtcbiAgICBkc3RbIDZdID0gZCAqICgodG1wXzMgKiBtMDAgKyB0bXBfNiAqIG0xMCArIHRtcF8xMSAqIG0zMCkgLVxuICAgICAgICAgICAgKHRtcF8yICogbTAwICsgdG1wXzcgKiBtMTAgKyB0bXBfMTAgKiBtMzApKTtcbiAgICBkc3RbIDddID0gZCAqICgodG1wXzQgKiBtMDAgKyB0bXBfOSAqIG0xMCArIHRtcF8xMCAqIG0yMCkgLVxuICAgICAgICAgICAgKHRtcF81ICogbTAwICsgdG1wXzggKiBtMTAgKyB0bXBfMTEgKiBtMjApKTtcbiAgICBkc3RbIDhdID0gZCAqICgodG1wXzEyICogbTEzICsgdG1wXzE1ICogbTIzICsgdG1wXzE2ICogbTMzKSAtXG4gICAgICAgICAgICAodG1wXzEzICogbTEzICsgdG1wXzE0ICogbTIzICsgdG1wXzE3ICogbTMzKSk7XG4gICAgZHN0WyA5XSA9IGQgKiAoKHRtcF8xMyAqIG0wMyArIHRtcF8xOCAqIG0yMyArIHRtcF8yMSAqIG0zMykgLVxuICAgICAgICAgICAgKHRtcF8xMiAqIG0wMyArIHRtcF8xOSAqIG0yMyArIHRtcF8yMCAqIG0zMykpO1xuICAgIGRzdFsxMF0gPSBkICogKCh0bXBfMTQgKiBtMDMgKyB0bXBfMTkgKiBtMTMgKyB0bXBfMjIgKiBtMzMpIC1cbiAgICAgICAgICAgICh0bXBfMTUgKiBtMDMgKyB0bXBfMTggKiBtMTMgKyB0bXBfMjMgKiBtMzMpKTtcbiAgICBkc3RbMTFdID0gZCAqICgodG1wXzE3ICogbTAzICsgdG1wXzIwICogbTEzICsgdG1wXzIzICogbTIzKSAtXG4gICAgICAgICAgICAodG1wXzE2ICogbTAzICsgdG1wXzIxICogbTEzICsgdG1wXzIyICogbTIzKSk7XG4gICAgZHN0WzEyXSA9IGQgKiAoKHRtcF8xNCAqIG0yMiArIHRtcF8xNyAqIG0zMiArIHRtcF8xMyAqIG0xMikgLVxuICAgICAgICAgICAgKHRtcF8xNiAqIG0zMiArIHRtcF8xMiAqIG0xMiArIHRtcF8xNSAqIG0yMikpO1xuICAgIGRzdFsxM10gPSBkICogKCh0bXBfMjAgKiBtMzIgKyB0bXBfMTIgKiBtMDIgKyB0bXBfMTkgKiBtMjIpIC1cbiAgICAgICAgICAgICh0bXBfMTggKiBtMjIgKyB0bXBfMjEgKiBtMzIgKyB0bXBfMTMgKiBtMDIpKTtcbiAgICBkc3RbMTRdID0gZCAqICgodG1wXzE4ICogbTEyICsgdG1wXzIzICogbTMyICsgdG1wXzE1ICogbTAyKSAtXG4gICAgICAgICAgICAodG1wXzIyICogbTMyICsgdG1wXzE0ICogbTAyICsgdG1wXzE5ICogbTEyKSk7XG4gICAgZHN0WzE1XSA9IGQgKiAoKHRtcF8yMiAqIG0yMiArIHRtcF8xNiAqIG0wMiArIHRtcF8yMSAqIG0xMikgLVxuICAgICAgICAgICAgKHRtcF8yMCAqIG0xMiArIHRtcF8yMyAqIG0yMiArIHRtcF8xNyAqIG0wMikpO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNdWx0aXBsaWVzIHR3byA0LWJ5LTQgbWF0cmljZXM7IGFzc3VtZXMgdGhhdCB0aGUgZ2l2ZW4gbWF0cmljZXMgYXJlIDQtYnktNDtcbiAgICogYXNzdW1lcyBtYXRyaXggZW50cmllcyBhcmUgYWNjZXNzZWQgaW4gW3Jvd11bY29sdW1uXSBmYXNoaW9uLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IGEgVGhlIG1hdHJpeCBvbiB0aGUgbGVmdC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBiIFRoZSBtYXRyaXggb24gdGhlIHJpZ2h0LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBUaGUgbWF0cml4IHByb2R1Y3Qgb2YgYSBhbmQgYi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBtdWx0aXBseShhLCBiLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIGEwMCA9IGFbMF07XG4gICAgdmFyIGEwMSA9IGFbMV07XG4gICAgdmFyIGEwMiA9IGFbMl07XG4gICAgdmFyIGEwMyA9IGFbM107XG4gICAgdmFyIGExMCA9IGFbIDQgKyAwXTtcbiAgICB2YXIgYTExID0gYVsgNCArIDFdO1xuICAgIHZhciBhMTIgPSBhWyA0ICsgMl07XG4gICAgdmFyIGExMyA9IGFbIDQgKyAzXTtcbiAgICB2YXIgYTIwID0gYVsgOCArIDBdO1xuICAgIHZhciBhMjEgPSBhWyA4ICsgMV07XG4gICAgdmFyIGEyMiA9IGFbIDggKyAyXTtcbiAgICB2YXIgYTIzID0gYVsgOCArIDNdO1xuICAgIHZhciBhMzAgPSBhWzEyICsgMF07XG4gICAgdmFyIGEzMSA9IGFbMTIgKyAxXTtcbiAgICB2YXIgYTMyID0gYVsxMiArIDJdO1xuICAgIHZhciBhMzMgPSBhWzEyICsgM107XG4gICAgdmFyIGIwMCA9IGJbMF07XG4gICAgdmFyIGIwMSA9IGJbMV07XG4gICAgdmFyIGIwMiA9IGJbMl07XG4gICAgdmFyIGIwMyA9IGJbM107XG4gICAgdmFyIGIxMCA9IGJbIDQgKyAwXTtcbiAgICB2YXIgYjExID0gYlsgNCArIDFdO1xuICAgIHZhciBiMTIgPSBiWyA0ICsgMl07XG4gICAgdmFyIGIxMyA9IGJbIDQgKyAzXTtcbiAgICB2YXIgYjIwID0gYlsgOCArIDBdO1xuICAgIHZhciBiMjEgPSBiWyA4ICsgMV07XG4gICAgdmFyIGIyMiA9IGJbIDggKyAyXTtcbiAgICB2YXIgYjIzID0gYlsgOCArIDNdO1xuICAgIHZhciBiMzAgPSBiWzEyICsgMF07XG4gICAgdmFyIGIzMSA9IGJbMTIgKyAxXTtcbiAgICB2YXIgYjMyID0gYlsxMiArIDJdO1xuICAgIHZhciBiMzMgPSBiWzEyICsgM107XG5cbiAgICBkc3RbIDBdID0gYTAwICogYjAwICsgYTAxICogYjEwICsgYTAyICogYjIwICsgYTAzICogYjMwO1xuICAgIGRzdFsgMV0gPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjEgKyBhMDMgKiBiMzE7XG4gICAgZHN0WyAyXSA9IGEwMCAqIGIwMiArIGEwMSAqIGIxMiArIGEwMiAqIGIyMiArIGEwMyAqIGIzMjtcbiAgICBkc3RbIDNdID0gYTAwICogYjAzICsgYTAxICogYjEzICsgYTAyICogYjIzICsgYTAzICogYjMzO1xuICAgIGRzdFsgNF0gPSBhMTAgKiBiMDAgKyBhMTEgKiBiMTAgKyBhMTIgKiBiMjAgKyBhMTMgKiBiMzA7XG4gICAgZHN0WyA1XSA9IGExMCAqIGIwMSArIGExMSAqIGIxMSArIGExMiAqIGIyMSArIGExMyAqIGIzMTtcbiAgICBkc3RbIDZdID0gYTEwICogYjAyICsgYTExICogYjEyICsgYTEyICogYjIyICsgYTEzICogYjMyO1xuICAgIGRzdFsgN10gPSBhMTAgKiBiMDMgKyBhMTEgKiBiMTMgKyBhMTIgKiBiMjMgKyBhMTMgKiBiMzM7XG4gICAgZHN0WyA4XSA9IGEyMCAqIGIwMCArIGEyMSAqIGIxMCArIGEyMiAqIGIyMCArIGEyMyAqIGIzMDtcbiAgICBkc3RbIDldID0gYTIwICogYjAxICsgYTIxICogYjExICsgYTIyICogYjIxICsgYTIzICogYjMxO1xuICAgIGRzdFsxMF0gPSBhMjAgKiBiMDIgKyBhMjEgKiBiMTIgKyBhMjIgKiBiMjIgKyBhMjMgKiBiMzI7XG4gICAgZHN0WzExXSA9IGEyMCAqIGIwMyArIGEyMSAqIGIxMyArIGEyMiAqIGIyMyArIGEyMyAqIGIzMztcbiAgICBkc3RbMTJdID0gYTMwICogYjAwICsgYTMxICogYjEwICsgYTMyICogYjIwICsgYTMzICogYjMwO1xuICAgIGRzdFsxM10gPSBhMzAgKiBiMDEgKyBhMzEgKiBiMTEgKyBhMzIgKiBiMjEgKyBhMzMgKiBiMzE7XG4gICAgZHN0WzE0XSA9IGEzMCAqIGIwMiArIGEzMSAqIGIxMiArIGEzMiAqIGIyMiArIGEzMyAqIGIzMjtcbiAgICBkc3RbMTVdID0gYTMwICogYjAzICsgYTMxICogYjEzICsgYTMyICogYjIzICsgYTMzICogYjMzO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSB0cmFuc2xhdGlvbiBjb21wb25lbnQgb2YgYSA0LWJ5LTQgbWF0cml4IHRvIHRoZSBnaXZlblxuICAgKiB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gYSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge1ZlYzN9IHYgVGhlIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gYSBvbmNlIG1vZGlmaWVkLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIHNldFRyYW5zbGF0aW9uKGEsIHYsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBpZGVudGl0eSgpO1xuICAgIGlmIChhICE9PSBkc3QpIHtcbiAgICAgIGRzdFsgMF0gPSBhWyAwXTtcbiAgICAgIGRzdFsgMV0gPSBhWyAxXTtcbiAgICAgIGRzdFsgMl0gPSBhWyAyXTtcbiAgICAgIGRzdFsgM10gPSBhWyAzXTtcbiAgICAgIGRzdFsgNF0gPSBhWyA0XTtcbiAgICAgIGRzdFsgNV0gPSBhWyA1XTtcbiAgICAgIGRzdFsgNl0gPSBhWyA2XTtcbiAgICAgIGRzdFsgN10gPSBhWyA3XTtcbiAgICAgIGRzdFsgOF0gPSBhWyA4XTtcbiAgICAgIGRzdFsgOV0gPSBhWyA5XTtcbiAgICAgIGRzdFsxMF0gPSBhWzEwXTtcbiAgICAgIGRzdFsxMV0gPSBhWzExXTtcbiAgICB9XG4gICAgZHN0WzEyXSA9IHZbMF07XG4gICAgZHN0WzEzXSA9IHZbMV07XG4gICAgZHN0WzE0XSA9IHZbMl07XG4gICAgZHN0WzE1XSA9IDE7XG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiBjb21wb25lbnQgb2YgYSA0LWJ5LTQgbWF0cml4IGFzIGEgdmVjdG9yIHdpdGggM1xuICAgKiBlbnRyaWVzLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHJldHVybiB7VmVjM30gW2RzdF0gdmVjdG9yLi5cbiAgICogQHJldHVybiB7VmVjM30gVGhlIHRyYW5zbGF0aW9uIGNvbXBvbmVudCBvZiBtLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uKG0sIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCB2My5jcmVhdGUoKTtcbiAgICBkc3RbMF0gPSBtWzEyXTtcbiAgICBkc3RbMV0gPSBtWzEzXTtcbiAgICBkc3RbMl0gPSBtWzE0XTtcbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGF4aXMgb2YgYSA0eDQgbWF0cml4IGFzIGEgdmVjdG9yIHdpdGggMyBlbnRyaWVzXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge251bWJlcn0gYXhpcyBUaGUgYXhpcyAwID0geCwgMSA9IHksIDIgPSB6O1xuICAgKiBAcmV0dXJuIHtWZWMzfSBbZHN0XSB2ZWN0b3IuXG4gICAqIEByZXR1cm4ge1ZlYzN9IFRoZSBheGlzIGNvbXBvbmVudCBvZiBtLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIGdldEF4aXMobSwgYXhpcywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IHYzLmNyZWF0ZSgpO1xuICAgIHZhciBvZmYgPSBheGlzICogNDtcbiAgICBkc3RbMF0gPSBtW29mZiArIDBdO1xuICAgIGRzdFsxXSA9IG1bb2ZmICsgMV07XG4gICAgZHN0WzJdID0gbVtvZmYgKyAyXTtcbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIGEgNC1ieS00IHBlcnNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBnaXZlbiB0aGUgYW5ndWxhciBoZWlnaHRcbiAgICogb2YgdGhlIGZydXN0dW0sIHRoZSBhc3BlY3QgcmF0aW8sIGFuZCB0aGUgbmVhciBhbmQgZmFyIGNsaXBwaW5nIHBsYW5lcy4gIFRoZVxuICAgKiBhcmd1bWVudHMgZGVmaW5lIGEgZnJ1c3R1bSBleHRlbmRpbmcgaW4gdGhlIG5lZ2F0aXZlIHogZGlyZWN0aW9uLiAgVGhlIGdpdmVuXG4gICAqIGFuZ2xlIGlzIHRoZSB2ZXJ0aWNhbCBhbmdsZSBvZiB0aGUgZnJ1c3R1bSwgYW5kIHRoZSBob3Jpem9udGFsIGFuZ2xlIGlzXG4gICAqIGRldGVybWluZWQgdG8gcHJvZHVjZSB0aGUgZ2l2ZW4gYXNwZWN0IHJhdGlvLiAgVGhlIGFyZ3VtZW50cyBuZWFyIGFuZCBmYXIgYXJlXG4gICAqIHRoZSBkaXN0YW5jZXMgdG8gdGhlIG5lYXIgYW5kIGZhciBjbGlwcGluZyBwbGFuZXMuICBOb3RlIHRoYXQgbmVhciBhbmQgZmFyXG4gICAqIGFyZSBub3QgeiBjb29yZGluYXRlcywgYnV0IHJhdGhlciB0aGV5IGFyZSBkaXN0YW5jZXMgYWxvbmcgdGhlIG5lZ2F0aXZlXG4gICAqIHotYXhpcy4gIFRoZSBtYXRyaXggZ2VuZXJhdGVkIHNlbmRzIHRoZSB2aWV3aW5nIGZydXN0dW0gdG8gdGhlIHVuaXQgYm94LlxuICAgKiBXZSBhc3N1bWUgYSB1bml0IGJveCBleHRlbmRpbmcgZnJvbSAtMSB0byAxIGluIHRoZSB4IGFuZCB5IGRpbWVuc2lvbnMgYW5kXG4gICAqIGZyb20gMCB0byAxIGluIHRoZSB6IGRpbWVuc2lvbi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGZpZWxkT2ZWaWV3WUluUmFkaWFucyBUaGUgY2FtZXJhIGFuZ2xlIGZyb20gdG9wIHRvIGJvdHRvbSAoaW4gcmFkaWFucykuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhc3BlY3QgVGhlIGFzcGVjdCByYXRpbyB3aWR0aCAvIGhlaWdodC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHpOZWFyIFRoZSBkZXB0aCAobmVnYXRpdmUgeiBjb29yZGluYXRlKVxuICAgKiAgICAgb2YgdGhlIG5lYXIgY2xpcHBpbmcgcGxhbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6RmFyIFRoZSBkZXB0aCAobmVnYXRpdmUgeiBjb29yZGluYXRlKVxuICAgKiAgICAgb2YgdGhlIGZhciBjbGlwcGluZyBwbGFuZS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gVGhlIHBlcnNwZWN0aXZlIG1hdHJpeC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBwZXJzcGVjdGl2ZShmaWVsZE9mVmlld1lJblJhZGlhbnMsIGFzcGVjdCwgek5lYXIsIHpGYXIsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICB2YXIgZiA9IE1hdGgudGFuKE1hdGguUEkgKiAwLjUgLSAwLjUgKiBmaWVsZE9mVmlld1lJblJhZGlhbnMpO1xuICAgIHZhciByYW5nZUludiA9IDEuMCAvICh6TmVhciAtIHpGYXIpO1xuXG4gICAgZHN0WzBdICA9IGYgLyBhc3BlY3Q7XG4gICAgZHN0WzFdICA9IDA7XG4gICAgZHN0WzJdICA9IDA7XG4gICAgZHN0WzNdICA9IDA7XG5cbiAgICBkc3RbNF0gID0gMDtcbiAgICBkc3RbNV0gID0gZjtcbiAgICBkc3RbNl0gID0gMDtcbiAgICBkc3RbN10gID0gMDtcblxuICAgIGRzdFs4XSAgPSAwO1xuICAgIGRzdFs5XSAgPSAwO1xuICAgIGRzdFsxMF0gPSAoek5lYXIgKyB6RmFyKSAqIHJhbmdlSW52O1xuICAgIGRzdFsxMV0gPSAtMTtcblxuICAgIGRzdFsxMl0gPSAwO1xuICAgIGRzdFsxM10gPSAwO1xuICAgIGRzdFsxNF0gPSB6TmVhciAqIHpGYXIgKiByYW5nZUludiAqIDI7XG4gICAgZHN0WzE1XSA9IDA7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIGEgNC1ieS00IG90aG9nb25hbCB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggZ2l2ZW4gdGhlIGxlZnQsIHJpZ2h0LFxuICAgKiBib3R0b20sIGFuZCB0b3AgZGltZW5zaW9ucyBvZiB0aGUgbmVhciBjbGlwcGluZyBwbGFuZSBhcyB3ZWxsIGFzIHRoZVxuICAgKiBuZWFyIGFuZCBmYXIgY2xpcHBpbmcgcGxhbmUgZGlzdGFuY2VzLlxuICAgKiBAcGFyYW0ge251bWJlcn0gbGVmdCBMZWZ0IHNpZGUgb2YgdGhlIG5lYXIgY2xpcHBpbmcgcGxhbmUgdmlld3BvcnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBzaWRlIG9mIHRoZSBuZWFyIGNsaXBwaW5nIHBsYW5lIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gdG9wIFRvcCBvZiB0aGUgbmVhciBjbGlwcGluZyBwbGFuZSB2aWV3cG9ydC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gb2YgdGhlIG5lYXIgY2xpcHBpbmcgcGxhbmUgdmlld3BvcnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIFRoZSBkZXB0aCAobmVnYXRpdmUgeiBjb29yZGluYXRlKVxuICAgKiAgICAgb2YgdGhlIG5lYXIgY2xpcHBpbmcgcGxhbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgVGhlIGRlcHRoIChuZWdhdGl2ZSB6IGNvb3JkaW5hdGUpXG4gICAqICAgICBvZiB0aGUgZmFyIGNsaXBwaW5nIHBsYW5lLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIE91dHB1dCBtYXRyaXguXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IFRoZSBwZXJzcGVjdGl2ZSBtYXRyaXguXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gb3J0aG8obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICBkc3RbMF0gID0gMiAvIChyaWdodCAtIGxlZnQpO1xuICAgIGRzdFsxXSAgPSAwO1xuICAgIGRzdFsyXSAgPSAwO1xuICAgIGRzdFszXSAgPSAwO1xuXG4gICAgZHN0WzRdICA9IDA7XG4gICAgZHN0WzVdICA9IDIgLyAodG9wIC0gYm90dG9tKTtcbiAgICBkc3RbNl0gID0gMDtcbiAgICBkc3RbN10gID0gMDtcblxuICAgIGRzdFs4XSAgPSAwO1xuICAgIGRzdFs5XSAgPSAwO1xuICAgIGRzdFsxMF0gPSAtMSAvIChmYXIgLSBuZWFyKTtcbiAgICBkc3RbMTFdID0gMDtcblxuICAgIGRzdFsxMl0gPSAocmlnaHQgKyBsZWZ0KSAvIChsZWZ0IC0gcmlnaHQpO1xuICAgIGRzdFsxM10gPSAodG9wICsgYm90dG9tKSAvIChib3R0b20gLSB0b3ApO1xuICAgIGRzdFsxNF0gPSAtbmVhciAvIChuZWFyIC0gZmFyKTtcbiAgICBkc3RbMTVdID0gMTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgYSA0LWJ5LTQgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gbWF0cml4IGdpdmVuIHRoZSBsZWZ0LCByaWdodCxcbiAgICogdG9wLCBib3R0b20sIG5lYXIgYW5kIGZhciBjbGlwcGluZyBwbGFuZXMuIFRoZSBhcmd1bWVudHMgZGVmaW5lIGEgZnJ1c3R1bVxuICAgKiBleHRlbmRpbmcgaW4gdGhlIG5lZ2F0aXZlIHogZGlyZWN0aW9uLiBUaGUgYXJndW1lbnRzIG5lYXIgYW5kIGZhciBhcmUgdGhlXG4gICAqIGRpc3RhbmNlcyB0byB0aGUgbmVhciBhbmQgZmFyIGNsaXBwaW5nIHBsYW5lcy4gTm90ZSB0aGF0IG5lYXIgYW5kIGZhciBhcmUgbm90XG4gICAqIHogY29vcmRpbmF0ZXMsIGJ1dCByYXRoZXIgdGhleSBhcmUgZGlzdGFuY2VzIGFsb25nIHRoZSBuZWdhdGl2ZSB6LWF4aXMuIFRoZVxuICAgKiBtYXRyaXggZ2VuZXJhdGVkIHNlbmRzIHRoZSB2aWV3aW5nIGZydXN0dW0gdG8gdGhlIHVuaXQgYm94LiBXZSBhc3N1bWUgYSB1bml0XG4gICAqIGJveCBleHRlbmRpbmcgZnJvbSAtMSB0byAxIGluIHRoZSB4IGFuZCB5IGRpbWVuc2lvbnMgYW5kIGZyb20gMCB0byAxIGluIHRoZSB6XG4gICAqIGRpbWVuc2lvbi5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgVGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCBwbGFuZSBvZiB0aGUgYm94LlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgVGhlIHggY29vcmRpbmF0ZSBvZiB0aGUgcmlnaHQgcGxhbmUgb2YgdGhlIGJveC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBUaGUgeSBjb29yZGluYXRlIG9mIHRoZSBib3R0b20gcGxhbmUgb2YgdGhlIGJveC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCBUaGUgeSBjb29yZGluYXRlIG9mIHRoZSByaWdodCBwbGFuZSBvZiB0aGUgYm94LlxuICAgKiBAcGFyYW0ge251bWJlcn0gbmVhciBUaGUgbmVnYXRpdmUgeiBjb29yZGluYXRlIG9mIHRoZSBuZWFyIHBsYW5lIG9mIHRoZSBib3guXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmYXIgVGhlIG5lZ2F0aXZlIHogY29vcmRpbmF0ZSBvZiB0aGUgZmFyIHBsYW5lIG9mIHRoZSBib3guXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gT3V0cHV0IG1hdHJpeC5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gVGhlIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIGZydXN0dW0obGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICB2YXIgZHggPSAocmlnaHQgLSBsZWZ0KTtcbiAgICB2YXIgZHkgPSAodG9wIC0gYm90dG9tKTtcbiAgICB2YXIgZHogPSAobmVhciAtIGZhcik7XG5cbiAgICBkc3RbIDBdID0gMiAqIG5lYXIgLyBkeDtcbiAgICBkc3RbIDFdID0gMDtcbiAgICBkc3RbIDJdID0gMDtcbiAgICBkc3RbIDNdID0gMDtcbiAgICBkc3RbIDRdID0gMDtcbiAgICBkc3RbIDVdID0gMiAqIG5lYXIgLyBkeTtcbiAgICBkc3RbIDZdID0gMDtcbiAgICBkc3RbIDddID0gMDtcbiAgICBkc3RbIDhdID0gKGxlZnQgKyByaWdodCkgLyBkeDtcbiAgICBkc3RbIDldID0gKHRvcCArIGJvdHRvbSkgLyBkeTtcbiAgICBkc3RbMTBdID0gZmFyIC8gZHo7XG4gICAgZHN0WzExXSA9IC0xO1xuICAgIGRzdFsxMl0gPSAwO1xuICAgIGRzdFsxM10gPSAwO1xuICAgIGRzdFsxNF0gPSBuZWFyICogZmFyIC8gZHo7XG4gICAgZHN0WzE1XSA9IDA7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIGEgNC1ieS00IGxvb2stYXQgdHJhbnNmb3JtYXRpb24uXG4gICAqXG4gICAqIFRoaXMgaXMgYSBtYXRyaXggd2hpY2ggcG9zaXRpb25zIHRoZSBjYW1lcmEgaXRzZWxmLiBJZiB5b3Ugd2FudFxuICAgKiBhIHZpZXcgbWF0cml4IChhIG1hdHJpeCB3aGljaCBtb3ZlcyB0aGluZ3MgaW4gZnJvbnQgb2YgdGhlIGNhbWVyYSlcbiAgICogdGFrZSB0aGUgaW52ZXJzZSBvZiB0aGlzLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZlYzN9IGV5ZSBUaGUgcG9zaXRpb24gb2YgdGhlIGV5ZS5cbiAgICogQHBhcmFtIHtWZWMzfSB0YXJnZXQgVGhlIHBvc2l0aW9uIG1lYW50IHRvIGJlIHZpZXdlZC5cbiAgICogQHBhcmFtIHtWZWMzfSB1cCBBIHZlY3RvciBwb2ludGluZyB1cC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gVGhlIGxvb2stYXQgbWF0cml4LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIGxvb2tBdChleWUsIHRhcmdldCwgdXAsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICB2YXIgeEF4aXMgPSB0ZW1wVjNhO1xuICAgIHZhciB5QXhpcyA9IHRlbXBWM2I7XG4gICAgdmFyIHpBeGlzID0gdGVtcFYzYztcblxuICAgIHYzLm5vcm1hbGl6ZShcbiAgICAgICAgdjMuc3VidHJhY3QoZXllLCB0YXJnZXQsIHpBeGlzKSwgekF4aXMpO1xuICAgIHYzLm5vcm1hbGl6ZSh2My5jcm9zcyh1cCwgekF4aXMsIHhBeGlzKSwgeEF4aXMpO1xuICAgIHYzLm5vcm1hbGl6ZSh2My5jcm9zcyh6QXhpcywgeEF4aXMsIHlBeGlzKSwgeUF4aXMpO1xuXG4gICAgZHN0WyAwXSA9IHhBeGlzWzBdO1xuICAgIGRzdFsgMV0gPSB4QXhpc1sxXTtcbiAgICBkc3RbIDJdID0geEF4aXNbMl07XG4gICAgZHN0WyAzXSA9IDA7XG4gICAgZHN0WyA0XSA9IHlBeGlzWzBdO1xuICAgIGRzdFsgNV0gPSB5QXhpc1sxXTtcbiAgICBkc3RbIDZdID0geUF4aXNbMl07XG4gICAgZHN0WyA3XSA9IDA7XG4gICAgZHN0WyA4XSA9IHpBeGlzWzBdO1xuICAgIGRzdFsgOV0gPSB6QXhpc1sxXTtcbiAgICBkc3RbMTBdID0gekF4aXNbMl07XG4gICAgZHN0WzExXSA9IDA7XG4gICAgZHN0WzEyXSA9IGV5ZVswXTtcbiAgICBkc3RbMTNdID0gZXllWzFdO1xuICAgIGRzdFsxNF0gPSBleWVbMl07XG4gICAgZHN0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSA0LWJ5LTQgbWF0cml4IHdoaWNoIHRyYW5zbGF0ZXMgYnkgdGhlIGdpdmVuIHZlY3RvciB2LlxuICAgKiBAcGFyYW0ge1ZlYzN9IHYgVGhlIHZlY3RvciBieVxuICAgKiAgICAgd2hpY2ggdG8gdHJhbnNsYXRlLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBUaGUgdHJhbnNsYXRpb24gbWF0cml4LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIHRyYW5zbGF0aW9uKHYsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICBkc3RbIDBdID0gMTtcbiAgICBkc3RbIDFdID0gMDtcbiAgICBkc3RbIDJdID0gMDtcbiAgICBkc3RbIDNdID0gMDtcbiAgICBkc3RbIDRdID0gMDtcbiAgICBkc3RbIDVdID0gMTtcbiAgICBkc3RbIDZdID0gMDtcbiAgICBkc3RbIDddID0gMDtcbiAgICBkc3RbIDhdID0gMDtcbiAgICBkc3RbIDldID0gMDtcbiAgICBkc3RbMTBdID0gMTtcbiAgICBkc3RbMTFdID0gMDtcbiAgICBkc3RbMTJdID0gdlswXTtcbiAgICBkc3RbMTNdID0gdlsxXTtcbiAgICBkc3RbMTRdID0gdlsyXTtcbiAgICBkc3RbMTVdID0gMTtcbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSBnaXZlbiA0LWJ5LTQgbWF0cml4IGJ5IHRyYW5zbGF0aW9uIGJ5IHRoZSBnaXZlbiB2ZWN0b3Igdi5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXguXG4gICAqIEBwYXJhbSB7VmVjM30gdiBUaGUgdmVjdG9yIGJ5XG4gICAqICAgICB3aGljaCB0byB0cmFuc2xhdGUuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gb25jZSBtb2RpZmllZC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiB0cmFuc2xhdGUobSwgdiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciB2MCA9IHZbMF07XG4gICAgdmFyIHYxID0gdlsxXTtcbiAgICB2YXIgdjIgPSB2WzJdO1xuICAgIHZhciBtMDAgPSBtWzBdO1xuICAgIHZhciBtMDEgPSBtWzFdO1xuICAgIHZhciBtMDIgPSBtWzJdO1xuICAgIHZhciBtMDMgPSBtWzNdO1xuICAgIHZhciBtMTAgPSBtWzEgKiA0ICsgMF07XG4gICAgdmFyIG0xMSA9IG1bMSAqIDQgKyAxXTtcbiAgICB2YXIgbTEyID0gbVsxICogNCArIDJdO1xuICAgIHZhciBtMTMgPSBtWzEgKiA0ICsgM107XG4gICAgdmFyIG0yMCA9IG1bMiAqIDQgKyAwXTtcbiAgICB2YXIgbTIxID0gbVsyICogNCArIDFdO1xuICAgIHZhciBtMjIgPSBtWzIgKiA0ICsgMl07XG4gICAgdmFyIG0yMyA9IG1bMiAqIDQgKyAzXTtcbiAgICB2YXIgbTMwID0gbVszICogNCArIDBdO1xuICAgIHZhciBtMzEgPSBtWzMgKiA0ICsgMV07XG4gICAgdmFyIG0zMiA9IG1bMyAqIDQgKyAyXTtcbiAgICB2YXIgbTMzID0gbVszICogNCArIDNdO1xuXG4gICAgaWYgKG0gIT09IGRzdCkge1xuICAgICAgZHN0WyAwXSA9IG0wMDtcbiAgICAgIGRzdFsgMV0gPSBtMDE7XG4gICAgICBkc3RbIDJdID0gbTAyO1xuICAgICAgZHN0WyAzXSA9IG0wMztcbiAgICAgIGRzdFsgNF0gPSBtMTA7XG4gICAgICBkc3RbIDVdID0gbTExO1xuICAgICAgZHN0WyA2XSA9IG0xMjtcbiAgICAgIGRzdFsgN10gPSBtMTM7XG4gICAgICBkc3RbIDhdID0gbTIwO1xuICAgICAgZHN0WyA5XSA9IG0yMTtcbiAgICAgIGRzdFsxMF0gPSBtMjI7XG4gICAgICBkc3RbMTFdID0gbTIzO1xuICAgIH1cblxuICAgIGRzdFsxMl0gPSBtMDAgKiB2MCArIG0xMCAqIHYxICsgbTIwICogdjIgKyBtMzA7XG4gICAgZHN0WzEzXSA9IG0wMSAqIHYwICsgbTExICogdjEgKyBtMjEgKiB2MiArIG0zMTtcbiAgICBkc3RbMTRdID0gbTAyICogdjAgKyBtMTIgKiB2MSArIG0yMiAqIHYyICsgbTMyO1xuICAgIGRzdFsxNV0gPSBtMDMgKiB2MCArIG0xMyAqIHYxICsgbTIzICogdjIgKyBtMzM7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSA0LWJ5LTQgbWF0cml4IHdoaWNoIHJvdGF0ZXMgYXJvdW5kIHRoZSB4LWF4aXMgYnkgdGhlIGdpdmVuIGFuZ2xlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVJblJhZGlhbnMgVGhlIGFuZ2xlIGJ5IHdoaWNoIHRvIHJvdGF0ZSAoaW4gcmFkaWFucykuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IFRoZSByb3RhdGlvbiBtYXRyaXguXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gcm90YXRpb25YKGFuZ2xlSW5SYWRpYW5zLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIGMgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XG5cbiAgICBkc3RbIDBdID0gMTtcbiAgICBkc3RbIDFdID0gMDtcbiAgICBkc3RbIDJdID0gMDtcbiAgICBkc3RbIDNdID0gMDtcbiAgICBkc3RbIDRdID0gMDtcbiAgICBkc3RbIDVdID0gYztcbiAgICBkc3RbIDZdID0gcztcbiAgICBkc3RbIDddID0gMDtcbiAgICBkc3RbIDhdID0gMDtcbiAgICBkc3RbIDldID0gLXM7XG4gICAgZHN0WzEwXSA9IGM7XG4gICAgZHN0WzExXSA9IDA7XG4gICAgZHN0WzEyXSA9IDA7XG4gICAgZHN0WzEzXSA9IDA7XG4gICAgZHN0WzE0XSA9IDA7XG4gICAgZHN0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSBnaXZlbiA0LWJ5LTQgbWF0cml4IGJ5IGEgcm90YXRpb24gYXJvdW5kIHRoZSB4LWF4aXMgYnkgdGhlIGdpdmVuXG4gICAqIGFuZ2xlLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlSW5SYWRpYW5zIFRoZSBhbmdsZSBieSB3aGljaCB0byByb3RhdGUgKGluIHJhZGlhbnMpLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIG9uY2UgbW9kaWZpZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gcm90YXRlWChtLCBhbmdsZUluUmFkaWFucywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciBtMTAgPSBtWzRdO1xuICAgIHZhciBtMTEgPSBtWzVdO1xuICAgIHZhciBtMTIgPSBtWzZdO1xuICAgIHZhciBtMTMgPSBtWzddO1xuICAgIHZhciBtMjAgPSBtWzhdO1xuICAgIHZhciBtMjEgPSBtWzldO1xuICAgIHZhciBtMjIgPSBtWzEwXTtcbiAgICB2YXIgbTIzID0gbVsxMV07XG4gICAgdmFyIGMgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XG5cbiAgICBkc3RbNF0gID0gYyAqIG0xMCArIHMgKiBtMjA7XG4gICAgZHN0WzVdICA9IGMgKiBtMTEgKyBzICogbTIxO1xuICAgIGRzdFs2XSAgPSBjICogbTEyICsgcyAqIG0yMjtcbiAgICBkc3RbN10gID0gYyAqIG0xMyArIHMgKiBtMjM7XG4gICAgZHN0WzhdICA9IGMgKiBtMjAgLSBzICogbTEwO1xuICAgIGRzdFs5XSAgPSBjICogbTIxIC0gcyAqIG0xMTtcbiAgICBkc3RbMTBdID0gYyAqIG0yMiAtIHMgKiBtMTI7XG4gICAgZHN0WzExXSA9IGMgKiBtMjMgLSBzICogbTEzO1xuXG4gICAgaWYgKG0gIT09IGRzdCkge1xuICAgICAgZHN0WyAwXSA9IG1bIDBdO1xuICAgICAgZHN0WyAxXSA9IG1bIDFdO1xuICAgICAgZHN0WyAyXSA9IG1bIDJdO1xuICAgICAgZHN0WyAzXSA9IG1bIDNdO1xuICAgICAgZHN0WzEyXSA9IG1bMTJdO1xuICAgICAgZHN0WzEzXSA9IG1bMTNdO1xuICAgICAgZHN0WzE0XSA9IG1bMTRdO1xuICAgICAgZHN0WzE1XSA9IG1bMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIDQtYnktNCBtYXRyaXggd2hpY2ggcm90YXRlcyBhcm91bmQgdGhlIHktYXhpcyBieSB0aGUgZ2l2ZW4gYW5nbGUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZUluUmFkaWFucyBUaGUgYW5nbGUgYnkgd2hpY2ggdG8gcm90YXRlIChpbiByYWRpYW5zKS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gVGhlIHJvdGF0aW9uIG1hdHJpeC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiByb3RhdGlvblkoYW5nbGVJblJhZGlhbnMsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICB2YXIgYyA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcbiAgICB2YXIgcyA9IE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcblxuICAgIGRzdFsgMF0gPSBjO1xuICAgIGRzdFsgMV0gPSAwO1xuICAgIGRzdFsgMl0gPSAtcztcbiAgICBkc3RbIDNdID0gMDtcbiAgICBkc3RbIDRdID0gMDtcbiAgICBkc3RbIDVdID0gMTtcbiAgICBkc3RbIDZdID0gMDtcbiAgICBkc3RbIDddID0gMDtcbiAgICBkc3RbIDhdID0gcztcbiAgICBkc3RbIDldID0gMDtcbiAgICBkc3RbMTBdID0gYztcbiAgICBkc3RbMTFdID0gMDtcbiAgICBkc3RbMTJdID0gMDtcbiAgICBkc3RbMTNdID0gMDtcbiAgICBkc3RbMTRdID0gMDtcbiAgICBkc3RbMTVdID0gMTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhlIGdpdmVuIDQtYnktNCBtYXRyaXggYnkgYSByb3RhdGlvbiBhcm91bmQgdGhlIHktYXhpcyBieSB0aGUgZ2l2ZW5cbiAgICogYW5nbGUuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVJblJhZGlhbnMgVGhlIGFuZ2xlIGJ5IHdoaWNoIHRvIHJvdGF0ZSAoaW4gcmFkaWFucykuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gb25jZSBtb2RpZmllZC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiByb3RhdGVZKG0sIGFuZ2xlSW5SYWRpYW5zLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIG0wMCA9IG1bMCAqIDQgKyAwXTtcbiAgICB2YXIgbTAxID0gbVswICogNCArIDFdO1xuICAgIHZhciBtMDIgPSBtWzAgKiA0ICsgMl07XG4gICAgdmFyIG0wMyA9IG1bMCAqIDQgKyAzXTtcbiAgICB2YXIgbTIwID0gbVsyICogNCArIDBdO1xuICAgIHZhciBtMjEgPSBtWzIgKiA0ICsgMV07XG4gICAgdmFyIG0yMiA9IG1bMiAqIDQgKyAyXTtcbiAgICB2YXIgbTIzID0gbVsyICogNCArIDNdO1xuICAgIHZhciBjID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xuICAgIHZhciBzID0gTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xuXG4gICAgZHN0WyAwXSA9IGMgKiBtMDAgLSBzICogbTIwO1xuICAgIGRzdFsgMV0gPSBjICogbTAxIC0gcyAqIG0yMTtcbiAgICBkc3RbIDJdID0gYyAqIG0wMiAtIHMgKiBtMjI7XG4gICAgZHN0WyAzXSA9IGMgKiBtMDMgLSBzICogbTIzO1xuICAgIGRzdFsgOF0gPSBjICogbTIwICsgcyAqIG0wMDtcbiAgICBkc3RbIDldID0gYyAqIG0yMSArIHMgKiBtMDE7XG4gICAgZHN0WzEwXSA9IGMgKiBtMjIgKyBzICogbTAyO1xuICAgIGRzdFsxMV0gPSBjICogbTIzICsgcyAqIG0wMztcblxuICAgIGlmIChtICE9PSBkc3QpIHtcbiAgICAgIGRzdFsgNF0gPSBtWyA0XTtcbiAgICAgIGRzdFsgNV0gPSBtWyA1XTtcbiAgICAgIGRzdFsgNl0gPSBtWyA2XTtcbiAgICAgIGRzdFsgN10gPSBtWyA3XTtcbiAgICAgIGRzdFsxMl0gPSBtWzEyXTtcbiAgICAgIGRzdFsxM10gPSBtWzEzXTtcbiAgICAgIGRzdFsxNF0gPSBtWzE0XTtcbiAgICAgIGRzdFsxNV0gPSBtWzE1XTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSA0LWJ5LTQgbWF0cml4IHdoaWNoIHJvdGF0ZXMgYXJvdW5kIHRoZSB6LWF4aXMgYnkgdGhlIGdpdmVuIGFuZ2xlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVJblJhZGlhbnMgVGhlIGFuZ2xlIGJ5IHdoaWNoIHRvIHJvdGF0ZSAoaW4gcmFkaWFucykuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IFRoZSByb3RhdGlvbiBtYXRyaXguXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gcm90YXRpb25aKGFuZ2xlSW5SYWRpYW5zLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIGMgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XG5cbiAgICBkc3RbIDBdID0gYztcbiAgICBkc3RbIDFdID0gcztcbiAgICBkc3RbIDJdID0gMDtcbiAgICBkc3RbIDNdID0gMDtcbiAgICBkc3RbIDRdID0gLXM7XG4gICAgZHN0WyA1XSA9IGM7XG4gICAgZHN0WyA2XSA9IDA7XG4gICAgZHN0WyA3XSA9IDA7XG4gICAgZHN0WyA4XSA9IDA7XG4gICAgZHN0WyA5XSA9IDA7XG4gICAgZHN0WzEwXSA9IDE7XG4gICAgZHN0WzExXSA9IDA7XG4gICAgZHN0WzEyXSA9IDA7XG4gICAgZHN0WzEzXSA9IDA7XG4gICAgZHN0WzE0XSA9IDA7XG4gICAgZHN0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSBnaXZlbiA0LWJ5LTQgbWF0cml4IGJ5IGEgcm90YXRpb24gYXJvdW5kIHRoZSB6LWF4aXMgYnkgdGhlIGdpdmVuXG4gICAqIGFuZ2xlLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlSW5SYWRpYW5zIFRoZSBhbmdsZSBieSB3aGljaCB0byByb3RhdGUgKGluIHJhZGlhbnMpLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIG9uY2UgbW9kaWZpZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gcm90YXRlWihtLCBhbmdsZUluUmFkaWFucywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciBtMDAgPSBtWzAgKiA0ICsgMF07XG4gICAgdmFyIG0wMSA9IG1bMCAqIDQgKyAxXTtcbiAgICB2YXIgbTAyID0gbVswICogNCArIDJdO1xuICAgIHZhciBtMDMgPSBtWzAgKiA0ICsgM107XG4gICAgdmFyIG0xMCA9IG1bMSAqIDQgKyAwXTtcbiAgICB2YXIgbTExID0gbVsxICogNCArIDFdO1xuICAgIHZhciBtMTIgPSBtWzEgKiA0ICsgMl07XG4gICAgdmFyIG0xMyA9IG1bMSAqIDQgKyAzXTtcbiAgICB2YXIgYyA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcbiAgICB2YXIgcyA9IE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcblxuICAgIGRzdFsgMF0gPSBjICogbTAwICsgcyAqIG0xMDtcbiAgICBkc3RbIDFdID0gYyAqIG0wMSArIHMgKiBtMTE7XG4gICAgZHN0WyAyXSA9IGMgKiBtMDIgKyBzICogbTEyO1xuICAgIGRzdFsgM10gPSBjICogbTAzICsgcyAqIG0xMztcbiAgICBkc3RbIDRdID0gYyAqIG0xMCAtIHMgKiBtMDA7XG4gICAgZHN0WyA1XSA9IGMgKiBtMTEgLSBzICogbTAxO1xuICAgIGRzdFsgNl0gPSBjICogbTEyIC0gcyAqIG0wMjtcbiAgICBkc3RbIDddID0gYyAqIG0xMyAtIHMgKiBtMDM7XG5cbiAgICBpZiAobSAhPT0gZHN0KSB7XG4gICAgICBkc3RbIDhdID0gbVsgOF07XG4gICAgICBkc3RbIDldID0gbVsgOV07XG4gICAgICBkc3RbMTBdID0gbVsxMF07XG4gICAgICBkc3RbMTFdID0gbVsxMV07XG4gICAgICBkc3RbMTJdID0gbVsxMl07XG4gICAgICBkc3RbMTNdID0gbVsxM107XG4gICAgICBkc3RbMTRdID0gbVsxNF07XG4gICAgICBkc3RbMTVdID0gbVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgNC1ieS00IG1hdHJpeCB3aGljaCByb3RhdGVzIGFyb3VuZCB0aGUgZ2l2ZW4gYXhpcyBieSB0aGUgZ2l2ZW5cbiAgICogYW5nbGUuXG4gICAqIEBwYXJhbSB7VmVjM30gYXhpcyBUaGUgYXhpc1xuICAgKiAgICAgYWJvdXQgd2hpY2ggdG8gcm90YXRlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVJblJhZGlhbnMgVGhlIGFuZ2xlIGJ5IHdoaWNoIHRvIHJvdGF0ZSAoaW4gcmFkaWFucykuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IEEgbWF0cml4IHdoaWNoIHJvdGF0ZXMgYW5nbGUgcmFkaWFuc1xuICAgKiAgICAgYXJvdW5kIHRoZSBheGlzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIGF4aXNSb3RhdGlvbihheGlzLCBhbmdsZUluUmFkaWFucywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciB4ID0gYXhpc1swXTtcbiAgICB2YXIgeSA9IGF4aXNbMV07XG4gICAgdmFyIHogPSBheGlzWzJdO1xuICAgIHZhciBuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gICAgeCAvPSBuO1xuICAgIHkgLz0gbjtcbiAgICB6IC89IG47XG4gICAgdmFyIHh4ID0geCAqIHg7XG4gICAgdmFyIHl5ID0geSAqIHk7XG4gICAgdmFyIHp6ID0geiAqIHo7XG4gICAgdmFyIGMgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XG4gICAgdmFyIG9uZU1pbnVzQ29zaW5lID0gMSAtIGM7XG5cbiAgICBkc3RbIDBdID0geHggKyAoMSAtIHh4KSAqIGM7XG4gICAgZHN0WyAxXSA9IHggKiB5ICogb25lTWludXNDb3NpbmUgKyB6ICogcztcbiAgICBkc3RbIDJdID0geCAqIHogKiBvbmVNaW51c0Nvc2luZSAtIHkgKiBzO1xuICAgIGRzdFsgM10gPSAwO1xuICAgIGRzdFsgNF0gPSB4ICogeSAqIG9uZU1pbnVzQ29zaW5lIC0geiAqIHM7XG4gICAgZHN0WyA1XSA9IHl5ICsgKDEgLSB5eSkgKiBjO1xuICAgIGRzdFsgNl0gPSB5ICogeiAqIG9uZU1pbnVzQ29zaW5lICsgeCAqIHM7XG4gICAgZHN0WyA3XSA9IDA7XG4gICAgZHN0WyA4XSA9IHggKiB6ICogb25lTWludXNDb3NpbmUgKyB5ICogcztcbiAgICBkc3RbIDldID0geSAqIHogKiBvbmVNaW51c0Nvc2luZSAtIHggKiBzO1xuICAgIGRzdFsxMF0gPSB6eiArICgxIC0genopICogYztcbiAgICBkc3RbMTFdID0gMDtcbiAgICBkc3RbMTJdID0gMDtcbiAgICBkc3RbMTNdID0gMDtcbiAgICBkc3RbMTRdID0gMDtcbiAgICBkc3RbMTVdID0gMTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhlIGdpdmVuIDQtYnktNCBtYXRyaXggYnkgcm90YXRpb24gYXJvdW5kIHRoZSBnaXZlbiBheGlzIGJ5IHRoZVxuICAgKiBnaXZlbiBhbmdsZS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXguXG4gICAqIEBwYXJhbSB7VmVjM30gYXhpcyBUaGUgYXhpc1xuICAgKiAgICAgYWJvdXQgd2hpY2ggdG8gcm90YXRlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVJblJhZGlhbnMgVGhlIGFuZ2xlIGJ5IHdoaWNoIHRvIHJvdGF0ZSAoaW4gcmFkaWFucykuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gb25jZSBtb2RpZmllZC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBheGlzUm90YXRlKG0sIGF4aXMsIGFuZ2xlSW5SYWRpYW5zLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIHggPSBheGlzWzBdO1xuICAgIHZhciB5ID0gYXhpc1sxXTtcbiAgICB2YXIgeiA9IGF4aXNbMl07XG4gICAgdmFyIG4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcbiAgICB4IC89IG47XG4gICAgeSAvPSBuO1xuICAgIHogLz0gbjtcbiAgICB2YXIgeHggPSB4ICogeDtcbiAgICB2YXIgeXkgPSB5ICogeTtcbiAgICB2YXIgenogPSB6ICogejtcbiAgICB2YXIgYyA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcbiAgICB2YXIgcyA9IE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcbiAgICB2YXIgb25lTWludXNDb3NpbmUgPSAxIC0gYztcblxuICAgIHZhciByMDAgPSB4eCArICgxIC0geHgpICogYztcbiAgICB2YXIgcjAxID0geCAqIHkgKiBvbmVNaW51c0Nvc2luZSArIHogKiBzO1xuICAgIHZhciByMDIgPSB4ICogeiAqIG9uZU1pbnVzQ29zaW5lIC0geSAqIHM7XG4gICAgdmFyIHIxMCA9IHggKiB5ICogb25lTWludXNDb3NpbmUgLSB6ICogcztcbiAgICB2YXIgcjExID0geXkgKyAoMSAtIHl5KSAqIGM7XG4gICAgdmFyIHIxMiA9IHkgKiB6ICogb25lTWludXNDb3NpbmUgKyB4ICogcztcbiAgICB2YXIgcjIwID0geCAqIHogKiBvbmVNaW51c0Nvc2luZSArIHkgKiBzO1xuICAgIHZhciByMjEgPSB5ICogeiAqIG9uZU1pbnVzQ29zaW5lIC0geCAqIHM7XG4gICAgdmFyIHIyMiA9IHp6ICsgKDEgLSB6eikgKiBjO1xuXG4gICAgdmFyIG0wMCA9IG1bMF07XG4gICAgdmFyIG0wMSA9IG1bMV07XG4gICAgdmFyIG0wMiA9IG1bMl07XG4gICAgdmFyIG0wMyA9IG1bM107XG4gICAgdmFyIG0xMCA9IG1bNF07XG4gICAgdmFyIG0xMSA9IG1bNV07XG4gICAgdmFyIG0xMiA9IG1bNl07XG4gICAgdmFyIG0xMyA9IG1bN107XG4gICAgdmFyIG0yMCA9IG1bOF07XG4gICAgdmFyIG0yMSA9IG1bOV07XG4gICAgdmFyIG0yMiA9IG1bMTBdO1xuICAgIHZhciBtMjMgPSBtWzExXTtcblxuICAgIGRzdFsgMF0gPSByMDAgKiBtMDAgKyByMDEgKiBtMTAgKyByMDIgKiBtMjA7XG4gICAgZHN0WyAxXSA9IHIwMCAqIG0wMSArIHIwMSAqIG0xMSArIHIwMiAqIG0yMTtcbiAgICBkc3RbIDJdID0gcjAwICogbTAyICsgcjAxICogbTEyICsgcjAyICogbTIyO1xuICAgIGRzdFsgM10gPSByMDAgKiBtMDMgKyByMDEgKiBtMTMgKyByMDIgKiBtMjM7XG4gICAgZHN0WyA0XSA9IHIxMCAqIG0wMCArIHIxMSAqIG0xMCArIHIxMiAqIG0yMDtcbiAgICBkc3RbIDVdID0gcjEwICogbTAxICsgcjExICogbTExICsgcjEyICogbTIxO1xuICAgIGRzdFsgNl0gPSByMTAgKiBtMDIgKyByMTEgKiBtMTIgKyByMTIgKiBtMjI7XG4gICAgZHN0WyA3XSA9IHIxMCAqIG0wMyArIHIxMSAqIG0xMyArIHIxMiAqIG0yMztcbiAgICBkc3RbIDhdID0gcjIwICogbTAwICsgcjIxICogbTEwICsgcjIyICogbTIwO1xuICAgIGRzdFsgOV0gPSByMjAgKiBtMDEgKyByMjEgKiBtMTEgKyByMjIgKiBtMjE7XG4gICAgZHN0WzEwXSA9IHIyMCAqIG0wMiArIHIyMSAqIG0xMiArIHIyMiAqIG0yMjtcbiAgICBkc3RbMTFdID0gcjIwICogbTAzICsgcjIxICogbTEzICsgcjIyICogbTIzO1xuXG4gICAgaWYgKG0gIT09IGRzdCkge1xuICAgICAgZHN0WzEyXSA9IG1bMTJdO1xuICAgICAgZHN0WzEzXSA9IG1bMTNdO1xuICAgICAgZHN0WzE0XSA9IG1bMTRdO1xuICAgICAgZHN0WzE1XSA9IG1bMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIDQtYnktNCBtYXRyaXggd2hpY2ggc2NhbGVzIGluIGVhY2ggZGltZW5zaW9uIGJ5IGFuIGFtb3VudCBnaXZlbiBieVxuICAgKiB0aGUgY29ycmVzcG9uZGluZyBlbnRyeSBpbiB0aGUgZ2l2ZW4gdmVjdG9yOyBhc3N1bWVzIHRoZSB2ZWN0b3IgaGFzIHRocmVlXG4gICAqIGVudHJpZXMuXG4gICAqIEBwYXJhbSB7VmVjM30gdiBBIHZlY3RvciBvZlxuICAgKiAgICAgdGhyZWUgZW50cmllcyBzcGVjaWZ5aW5nIHRoZSBmYWN0b3IgYnkgd2hpY2ggdG8gc2NhbGUgaW4gZWFjaCBkaW1lbnNpb24uXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IFRoZSBzY2FsaW5nIG1hdHJpeC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBzY2FsaW5nKHYsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICBkc3RbIDBdID0gdlswXTtcbiAgICBkc3RbIDFdID0gMDtcbiAgICBkc3RbIDJdID0gMDtcbiAgICBkc3RbIDNdID0gMDtcbiAgICBkc3RbIDRdID0gMDtcbiAgICBkc3RbIDVdID0gdlsxXTtcbiAgICBkc3RbIDZdID0gMDtcbiAgICBkc3RbIDddID0gMDtcbiAgICBkc3RbIDhdID0gMDtcbiAgICBkc3RbIDldID0gMDtcbiAgICBkc3RbMTBdID0gdlsyXTtcbiAgICBkc3RbMTFdID0gMDtcbiAgICBkc3RbMTJdID0gMDtcbiAgICBkc3RbMTNdID0gMDtcbiAgICBkc3RbMTRdID0gMDtcbiAgICBkc3RbMTVdID0gMTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhlIGdpdmVuIDQtYnktNCBtYXRyaXgsIHNjYWxpbmcgaW4gZWFjaCBkaW1lbnNpb24gYnkgYW4gYW1vdW50XG4gICAqIGdpdmVuIGJ5IHRoZSBjb3JyZXNwb25kaW5nIGVudHJ5IGluIHRoZSBnaXZlbiB2ZWN0b3I7IGFzc3VtZXMgdGhlIHZlY3RvciBoYXNcbiAgICogdGhyZWUgZW50cmllcy5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXggdG8gYmUgbW9kaWZpZWQuXG4gICAqIEBwYXJhbSB7VmVjM30gdiBBIHZlY3RvciBvZiB0aHJlZSBlbnRyaWVzIHNwZWNpZnlpbmcgdGhlXG4gICAqICAgICBmYWN0b3IgYnkgd2hpY2ggdG8gc2NhbGUgaW4gZWFjaCBkaW1lbnNpb24uXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gb25jZSBtb2RpZmllZC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBzY2FsZShtLCB2LCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIHYwID0gdlswXTtcbiAgICB2YXIgdjEgPSB2WzFdO1xuICAgIHZhciB2MiA9IHZbMl07XG5cbiAgICBkc3RbIDBdID0gdjAgKiBtWzAgKiA0ICsgMF07XG4gICAgZHN0WyAxXSA9IHYwICogbVswICogNCArIDFdO1xuICAgIGRzdFsgMl0gPSB2MCAqIG1bMCAqIDQgKyAyXTtcbiAgICBkc3RbIDNdID0gdjAgKiBtWzAgKiA0ICsgM107XG4gICAgZHN0WyA0XSA9IHYxICogbVsxICogNCArIDBdO1xuICAgIGRzdFsgNV0gPSB2MSAqIG1bMSAqIDQgKyAxXTtcbiAgICBkc3RbIDZdID0gdjEgKiBtWzEgKiA0ICsgMl07XG4gICAgZHN0WyA3XSA9IHYxICogbVsxICogNCArIDNdO1xuICAgIGRzdFsgOF0gPSB2MiAqIG1bMiAqIDQgKyAwXTtcbiAgICBkc3RbIDldID0gdjIgKiBtWzIgKiA0ICsgMV07XG4gICAgZHN0WzEwXSA9IHYyICogbVsyICogNCArIDJdO1xuICAgIGRzdFsxMV0gPSB2MiAqIG1bMiAqIDQgKyAzXTtcblxuICAgIGlmIChtICE9PSBkc3QpIHtcbiAgICAgIGRzdFsxMl0gPSBtWzEyXTtcbiAgICAgIGRzdFsxM10gPSBtWzEzXTtcbiAgICAgIGRzdFsxNF0gPSBtWzE0XTtcbiAgICAgIGRzdFsxNV0gPSBtWzE1XTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgNC1ieS00IG1hdHJpeCBhbmQgYSB2ZWN0b3Igd2l0aCAzIGVudHJpZXMsXG4gICAqIGludGVycHJldHMgdGhlIHZlY3RvciBhcyBhIHBvaW50LCB0cmFuc2Zvcm1zIHRoYXQgcG9pbnQgYnkgdGhlIG1hdHJpeCwgYW5kXG4gICAqIHJldHVybnMgdGhlIHJlc3VsdCBhcyBhIHZlY3RvciB3aXRoIDMgZW50cmllcy5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXguXG4gICAqIEBwYXJhbSB7VmVjM30gdiBUaGUgcG9pbnQuXG4gICAqIEBwYXJhbSB7VmVjM30gZHN0IG9wdGlvbmFsIHZlYzMgdG8gc3RvcmUgcmVzdWx0XG4gICAqIEByZXR1cm4ge1ZlYzN9IGRzdCBvciBuZXcgdmVjMyBpZiBub3QgcHJvdmlkZWRcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiB0cmFuc2Zvcm1Qb2ludChtLCB2LCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgdjMuY3JlYXRlKCk7XG4gICAgdmFyIHYwID0gdlswXTtcbiAgICB2YXIgdjEgPSB2WzFdO1xuICAgIHZhciB2MiA9IHZbMl07XG4gICAgdmFyIGQgPSB2MCAqIG1bMCAqIDQgKyAzXSArIHYxICogbVsxICogNCArIDNdICsgdjIgKiBtWzIgKiA0ICsgM10gKyBtWzMgKiA0ICsgM107XG5cbiAgICBkc3RbMF0gPSAodjAgKiBtWzAgKiA0ICsgMF0gKyB2MSAqIG1bMSAqIDQgKyAwXSArIHYyICogbVsyICogNCArIDBdICsgbVszICogNCArIDBdKSAvIGQ7XG4gICAgZHN0WzFdID0gKHYwICogbVswICogNCArIDFdICsgdjEgKiBtWzEgKiA0ICsgMV0gKyB2MiAqIG1bMiAqIDQgKyAxXSArIG1bMyAqIDQgKyAxXSkgLyBkO1xuICAgIGRzdFsyXSA9ICh2MCAqIG1bMCAqIDQgKyAyXSArIHYxICogbVsxICogNCArIDJdICsgdjIgKiBtWzIgKiA0ICsgMl0gKyBtWzMgKiA0ICsgMl0pIC8gZDtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSA0LWJ5LTQgbWF0cml4IGFuZCBhIHZlY3RvciB3aXRoIDMgZW50cmllcywgaW50ZXJwcmV0cyB0aGUgdmVjdG9yIGFzIGFcbiAgICogZGlyZWN0aW9uLCB0cmFuc2Zvcm1zIHRoYXQgZGlyZWN0aW9uIGJ5IHRoZSBtYXRyaXgsIGFuZCByZXR1cm5zIHRoZSByZXN1bHQ7XG4gICAqIGFzc3VtZXMgdGhlIHRyYW5zZm9ybWF0aW9uIG9mIDMtZGltZW5zaW9uYWwgc3BhY2UgcmVwcmVzZW50ZWQgYnkgdGhlIG1hdHJpeFxuICAgKiBpcyBwYXJhbGxlbC1wcmVzZXJ2aW5nLCBpLmUuIGFueSBjb21iaW5hdGlvbiBvZiByb3RhdGlvbiwgc2NhbGluZyBhbmRcbiAgICogdHJhbnNsYXRpb24sIGJ1dCBub3QgYSBwZXJzcGVjdGl2ZSBkaXN0b3J0aW9uLiBSZXR1cm5zIGEgdmVjdG9yIHdpdGggM1xuICAgKiBlbnRyaWVzLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHtWZWMzfSB2IFRoZSBkaXJlY3Rpb24uXG4gICAqIEBwYXJhbSB7VmVjM30gZHN0IG9wdGlvbmFsIFZlYzMgdG8gc3RvcmUgcmVzdWx0XG4gICAqIEByZXR1cm4ge1ZlYzN9IGRzdCBvciBuZXcgVmVjMyBpZiBub3QgcHJvdmlkZWRcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiB0cmFuc2Zvcm1EaXJlY3Rpb24obSwgdiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IHYzLmNyZWF0ZSgpO1xuXG4gICAgdmFyIHYwID0gdlswXTtcbiAgICB2YXIgdjEgPSB2WzFdO1xuICAgIHZhciB2MiA9IHZbMl07XG5cbiAgICBkc3RbMF0gPSB2MCAqIG1bMCAqIDQgKyAwXSArIHYxICogbVsxICogNCArIDBdICsgdjIgKiBtWzIgKiA0ICsgMF07XG4gICAgZHN0WzFdID0gdjAgKiBtWzAgKiA0ICsgMV0gKyB2MSAqIG1bMSAqIDQgKyAxXSArIHYyICogbVsyICogNCArIDFdO1xuICAgIGRzdFsyXSA9IHYwICogbVswICogNCArIDJdICsgdjEgKiBtWzEgKiA0ICsgMl0gKyB2MiAqIG1bMiAqIDQgKyAyXTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSA0LWJ5LTQgbWF0cml4IG0gYW5kIGEgdmVjdG9yIHYgd2l0aCAzIGVudHJpZXMsIGludGVycHJldHMgdGhlIHZlY3RvclxuICAgKiBhcyBhIG5vcm1hbCB0byBhIHN1cmZhY2UsIGFuZCBjb21wdXRlcyBhIHZlY3RvciB3aGljaCBpcyBub3JtYWwgdXBvblxuICAgKiB0cmFuc2Zvcm1pbmcgdGhhdCBzdXJmYWNlIGJ5IHRoZSBtYXRyaXguIFRoZSBlZmZlY3Qgb2YgdGhpcyBmdW5jdGlvbiBpcyB0aGVcbiAgICogc2FtZSBhcyB0cmFuc2Zvcm1pbmcgdiAoYXMgYSBkaXJlY3Rpb24pIGJ5IHRoZSBpbnZlcnNlLXRyYW5zcG9zZSBvZiBtLiAgVGhpc1xuICAgKiBmdW5jdGlvbiBhc3N1bWVzIHRoZSB0cmFuc2Zvcm1hdGlvbiBvZiAzLWRpbWVuc2lvbmFsIHNwYWNlIHJlcHJlc2VudGVkIGJ5IHRoZVxuICAgKiBtYXRyaXggaXMgcGFyYWxsZWwtcHJlc2VydmluZywgaS5lLiBhbnkgY29tYmluYXRpb24gb2Ygcm90YXRpb24sIHNjYWxpbmcgYW5kXG4gICAqIHRyYW5zbGF0aW9uLCBidXQgbm90IGEgcGVyc3BlY3RpdmUgZGlzdG9ydGlvbi4gIFJldHVybnMgYSB2ZWN0b3Igd2l0aCAzXG4gICAqIGVudHJpZXMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge1ZlYzN9IHYgVGhlIG5vcm1hbC5cbiAgICogQHBhcmFtIHtWZWMzfSBbZHN0XSBUaGUgZGlyZWN0aW9uLlxuICAgKiBAcmV0dXJuIHtWZWMzfSBUaGUgdHJhbnNmb3JtZWQgZGlyZWN0aW9uLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIHRyYW5zZm9ybU5vcm1hbChtLCB2LCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgdjMuY3JlYXRlKCk7XG4gICAgdmFyIG1pID0gaW52ZXJzZShtKTtcbiAgICB2YXIgdjAgPSB2WzBdO1xuICAgIHZhciB2MSA9IHZbMV07XG4gICAgdmFyIHYyID0gdlsyXTtcblxuICAgIGRzdFswXSA9IHYwICogbWlbMCAqIDQgKyAwXSArIHYxICogbWlbMCAqIDQgKyAxXSArIHYyICogbWlbMCAqIDQgKyAyXTtcbiAgICBkc3RbMV0gPSB2MCAqIG1pWzEgKiA0ICsgMF0gKyB2MSAqIG1pWzEgKiA0ICsgMV0gKyB2MiAqIG1pWzEgKiA0ICsgMl07XG4gICAgZHN0WzJdID0gdjAgKiBtaVsyICogNCArIDBdICsgdjEgKiBtaVsyICogNCArIDFdICsgdjIgKiBtaVsyICogNCArIDJdO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8vIFVzaW5nIHF1b3RlcyBwcmV2ZW50cyBVZ2xpZnkgZnJvbSBjaGFuZ2luZyB0aGUgbmFtZXMuXG4gIC8vIE5vIHNwZWVkIGRpZmYgQUZBSUNULlxuICByZXR1cm4ge1xuICAgIFwiYXhpc1JvdGF0ZVwiOiBheGlzUm90YXRlLFxuICAgIFwiYXhpc1JvdGF0aW9uXCI6IGF4aXNSb3RhdGlvbixcbiAgICBcImNyZWF0ZVwiOiBpZGVudGl0eSxcbiAgICBcImNvcHlcIjogY29weSxcbiAgICBcImZydXN0dW1cIjogZnJ1c3R1bSxcbiAgICBcImdldEF4aXNcIjogZ2V0QXhpcyxcbiAgICBcImdldFRyYW5zbGF0aW9uXCI6IGdldFRyYW5zbGF0aW9uLFxuICAgIFwiaWRlbnRpdHlcIjogaWRlbnRpdHksXG4gICAgXCJpbnZlcnNlXCI6IGludmVyc2UsXG4gICAgXCJsb29rQXRcIjogbG9va0F0LFxuICAgIFwibXVsdGlwbHlcIjogbXVsdGlwbHksXG4gICAgXCJuZWdhdGVcIjogbmVnYXRlLFxuICAgIFwib3J0aG9cIjogb3J0aG8sXG4gICAgXCJwZXJzcGVjdGl2ZVwiOiBwZXJzcGVjdGl2ZSxcbiAgICBcInJvdGF0ZVhcIjogcm90YXRlWCxcbiAgICBcInJvdGF0ZVlcIjogcm90YXRlWSxcbiAgICBcInJvdGF0ZVpcIjogcm90YXRlWixcbiAgICBcInJvdGF0ZUF4aXNcIjogYXhpc1JvdGF0ZSxcbiAgICBcInJvdGF0aW9uWFwiOiByb3RhdGlvblgsXG4gICAgXCJyb3RhdGlvbllcIjogcm90YXRpb25ZLFxuICAgIFwicm90YXRpb25aXCI6IHJvdGF0aW9uWixcbiAgICBcInNjYWxlXCI6IHNjYWxlLFxuICAgIFwic2NhbGluZ1wiOiBzY2FsaW5nLFxuICAgIFwic2V0RGVmYXVsdFR5cGVcIjogc2V0RGVmYXVsdFR5cGUsXG4gICAgXCJzZXRUcmFuc2xhdGlvblwiOiBzZXRUcmFuc2xhdGlvbixcbiAgICBcInRyYW5zZm9ybURpcmVjdGlvblwiOiB0cmFuc2Zvcm1EaXJlY3Rpb24sXG4gICAgXCJ0cmFuc2Zvcm1Ob3JtYWxcIjogdHJhbnNmb3JtTm9ybWFsLFxuICAgIFwidHJhbnNmb3JtUG9pbnRcIjogdHJhbnNmb3JtUG9pbnQsXG4gICAgXCJ0cmFuc2xhdGVcIjogdHJhbnNsYXRlLFxuICAgIFwidHJhbnNsYXRpb25cIjogdHJhbnNsYXRpb24sXG4gICAgXCJ0cmFuc3Bvc2VcIjogdHJhbnNwb3NlLFxuICB9O1xufSk7XG5cblxuLypcbiAqIENvcHlyaWdodCAyMDE1LCBHcmVnZyBUYXZhcmVzLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbi8qKlxuICogVmFyaW91cyBmdW5jdGlvbnMgdG8gbWFrZSBzaW1wbGUgcHJpbWl0aXZlc1xuICpcbiAqIG5vdGU6IE1vc3QgcHJpbWl0aXZlIGZ1bmN0aW9ucyBjb21lIGluIDMgc3R5bGVzXG4gKlxuICogKiAgYGNyZWF0ZVNvbWVTaGFwZUJ1ZmZlckluZm9gXG4gKlxuICogICAgVGhlc2UgZnVuY3Rpb25zIGFyZSBhbG1vc3QgYWx3YXlzIHRoZSBmdW5jdGlvbnMgeW91IHdhbnQgdG8gY2FsbC4gVGhleVxuICogICAgY3JlYXRlIHZlcnRpY2VzIHRoZW4gbWFrZSBXZWJHTEJ1ZmZlcnMgYW5kIGNyZWF0ZSB7QGxpbmsgbW9kdWxlOnR3Z2wuQXR0cmliSW5mb31zXG4gKiAgICByZXR1cmluZyBhIHtAbGluayBtb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSB5b3UgY2FuIHBhc3MgdG8ge0BsaW5rIG1vZHVsZTp0d2dsLnNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzfVxuICogICAgYW5kIHtAbGluayBtb2R1bGU6dHdnbC5kcmF3QnVmZmVySW5mb30gZXRjLi4uXG4gKlxuICogKiAgYGNyZWF0ZVNvbWVTaGFwZUJ1ZmZlcnNgXG4gKlxuICogICAgVGhlc2UgY3JlYXRlIFdlYkdMQnVmZmVycyBhbmQgcHV0IHlvdXIgZGF0YSBpbiB0aGVtIGJ1dCBub3RoaW5nIGVsc2UuXG4gKiAgICBJdCdzIGEgc2hvcnRjdXQgdG8gZG9pbmcgaXQgeW91cnNlbGYgaWYgeW91IGRvbid0IHdhbnQgdG8gdXNlXG4gKiAgICB0aGUgaGlnaGVyIGxldmVsIGZ1bmN0aW9ucy5cbiAqXG4gKiAqICBgY3JlYXRlU29tZVNoYXBlVmVydGljZXNgXG4gKlxuICogICAgVGhlc2UganVzdCBjcmVhdGUgdmVydGljZXMsIG5vIGJ1ZmZlcnMuIFRoaXMgYWxsb3dzIHlvdSB0byBtYW5pcHVsYXRlIHRoZSB2ZXJ0aWNlc1xuICogICAgb3IgYWRkIG1vcmUgZGF0YSBiZWZvcmUgZ2VuZXJhdGluZyBhIHtAbGluayBtb2R1bGU6dHdnbC5CdWZmZXJJbmZvfS4gT25jZSB5b3UncmUgZmluaXNoZWRcbiAqICAgIG1hbmlwdWxhdGluZyB0aGUgdmVydGljZXMgY2FsbCB7QGxpbmsgbW9kdWxlOnR3Z2wuY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXN9LlxuICpcbiAqICAgIGV4YW1wbGU6XG4gKlxuICogICAgICAgIHZhciBhcnJheXMgPSB0d2dsLnByaW1pdGl2ZXMuY3JlYXRlUGxhbmVBcnJheXMoMSk7XG4gKiAgICAgICAgdHdnbC5wcmltaXRpdmVzLnJlb3JpZW50VmVydGljZXMoYXJyYXlzLCBtNC5yb3RhdGlvblgoTWF0aC5QSSAqIDAuNSkpO1xuICogICAgICAgIHZhciBidWZmZXJJbmZvID0gdHdnbC5jcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5cyhnbCwgYXJyYXlzKTtcbiAqXG4gKiBAbW9kdWxlIHR3Z2wvcHJpbWl0aXZlc1xuICovXG5kZWZpbmUoJ3R3Z2wvcHJpbWl0aXZlcycsW1xuICAgICcuL3R3Z2wnLFxuICAgICcuL200JyxcbiAgICAnLi92MycsXG4gIF0sIGZ1bmN0aW9uIChcbiAgICB0d2dsLFxuICAgIG00LFxuICAgIHYzXG4gICkge1xuICBcblxuICAvKipcbiAgICogQWRkIGBwdXNoYCB0byBhIHR5cGVkIGFycmF5LiBJdCBqdXN0IGtlZXBzIGEgJ2N1cnNvcidcbiAgICogYW5kIGFsbG93cyB1c2UgdG8gYHB1c2hgIHZhbHVlcyBpbnRvIHRoZSBhcnJheSBzbyB3ZVxuICAgKiBkb24ndCBoYXZlIHRvIG1hbnVhbGx5IGNvbXB1dGUgb2Zmc2V0c1xuICAgKiBAcGFyYW0ge1R5cGVkQXJyYXl9IHR5cGVkQXJyYXkgVHlwZWRBcnJheSB0byBhdWdtZW50XG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1Db21wb25lbnRzIG51bWJlciBvZiBjb21wb25lbnRzLlxuICAgKi9cbiAgZnVuY3Rpb24gYXVnbWVudFR5cGVkQXJyYXkodHlwZWRBcnJheSwgbnVtQ29tcG9uZW50cykge1xuICAgIHZhciBjdXJzb3IgPSAwO1xuICAgIHR5cGVkQXJyYXkucHVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraWkpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gYXJndW1lbnRzW2lpXTtcbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkgfHwgKHZhbHVlLmJ1ZmZlciAmJiB2YWx1ZS5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcbiAgICAgICAgICBmb3IgKHZhciBqaiA9IDA7IGpqIDwgdmFsdWUubGVuZ3RoOyArK2pqKSB7XG4gICAgICAgICAgICB0eXBlZEFycmF5W2N1cnNvcisrXSA9IHZhbHVlW2pqXTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHlwZWRBcnJheVtjdXJzb3IrK10gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdHlwZWRBcnJheS5yZXNldCA9IGZ1bmN0aW9uKG9wdF9pbmRleCkge1xuICAgICAgY3Vyc29yID0gb3B0X2luZGV4IHx8IDA7XG4gICAgfTtcbiAgICB0eXBlZEFycmF5Lm51bUNvbXBvbmVudHMgPSBudW1Db21wb25lbnRzO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlZEFycmF5LCAnbnVtRWxlbWVudHMnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sZW5ndGggLyB0aGlzLm51bUNvbXBvbmVudHMgfCAwO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4gdHlwZWRBcnJheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgdHlwZWQgYXJyYXkgd2l0aCBhIGBwdXNoYCBmdW5jdGlvbiBhdHRhY2hlZFxuICAgKiBzbyB0aGF0IHlvdSBjYW4gZWFzaWx5ICpwdXNoKiB2YWx1ZXMuXG4gICAqXG4gICAqIGBwdXNoYCBjYW4gdGFrZSBtdWx0aXBsZSBhcmd1bWVudHMuIElmIGFuIGFyZ3VtZW50IGlzIGFuIGFycmF5IGVhY2ggZWxlbWVudFxuICAgKiBvZiB0aGUgYXJyYXkgd2lsbCBiZSBhZGRlZCB0byB0aGUgdHlwZWQgYXJyYXkuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqXG4gICAqICAgICB2YXIgYXJyYXkgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIDIpOyAgLy8gY3JlYXRlcyBhIEZsb2F0MzJBcnJheSB3aXRoIDYgdmFsdWVzXG4gICAqICAgICBhcnJheS5wdXNoKDEsIDIsIDMpO1xuICAgKiAgICAgYXJyYXkucHVzaChbNCwgNSwgNl0pO1xuICAgKiAgICAgLy8gYXJyYXkgbm93IGNvbnRhaW5zIFsxLCAyLCAzLCA0LCA1LCA2XVxuICAgKlxuICAgKiBBbHNvIGhhcyBgbnVtQ29tcG9uZW50c2AgYW5kIGBudW1FbGVtZW50c2AgcHJvcGVydGllcy5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bUNvbXBvbmVudHMgbnVtYmVyIG9mIGNvbXBvbmVudHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IG51bUVsZW1lbnRzIG51bWJlciBvZiBlbGVtZW50cy4gVGhlIHRvdGFsIHNpemUgb2YgdGhlIGFycmF5IHdpbGwgYmUgYG51bUNvbXBvbmVudHMgKiBudW1FbGVtZW50c2AuXG4gICAqIEBwYXJhbSB7Y29uc3RydWN0b3J9IG9wdF90eXBlIEEgY29uc3RydWN0b3IgZm9yIHRoZSB0eXBlLiBEZWZhdWx0ID0gYEZsb2F0MzJBcnJheWAuXG4gICAqIEByZXR1cm4ge0FycmF5QnVmZmVyfSBBIHR5cGVkIGFycmF5LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkobnVtQ29tcG9uZW50cywgbnVtRWxlbWVudHMsIG9wdF90eXBlKSB7XG4gICAgdmFyIFR5cGUgPSBvcHRfdHlwZSB8fCBGbG9hdDMyQXJyYXk7XG4gICAgcmV0dXJuIGF1Z21lbnRUeXBlZEFycmF5KG5ldyBUeXBlKG51bUNvbXBvbmVudHMgKiBudW1FbGVtZW50cyksIG51bUNvbXBvbmVudHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWxsQnV0SW5kaWNlcyhuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWUgIT09IFwiaW5kaWNlc1wiO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGluZGV4ZWQgdmVydGljZXMgY3JlYXRlcyBhIG5ldyBzZXQgb2YgdmVydGljZXMgdW5pbmRleGVkIGJ5IGV4cGFuZGluZyB0aGUgaW5kZXhlZCB2ZXJ0aWNlcy5cbiAgICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgVHlwZWRBcnJheT59IHZlcnRpY2VzIFRoZSBpbmRleGVkIHZlcnRpY2VzIHRvIGRlaW5kZXhcbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+fSBUaGUgZGVpbmRleGVkIHZlcnRpY2VzXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuICBmdW5jdGlvbiBkZWluZGV4VmVydGljZXModmVydGljZXMpIHtcbiAgICB2YXIgaW5kaWNlcyA9IHZlcnRpY2VzLmluZGljZXM7XG4gICAgdmFyIG5ld1ZlcnRpY2VzID0ge307XG4gICAgdmFyIG51bUVsZW1lbnRzID0gaW5kaWNlcy5sZW5ndGg7XG5cbiAgICBmdW5jdGlvbiBleHBhbmRUb1VuaW5kZXhlZChjaGFubmVsKSB7XG4gICAgICB2YXIgc3JjQnVmZmVyID0gdmVydGljZXNbY2hhbm5lbF07XG4gICAgICB2YXIgbnVtQ29tcG9uZW50cyA9IHNyY0J1ZmZlci5udW1Db21wb25lbnRzO1xuICAgICAgdmFyIGRzdEJ1ZmZlciA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkobnVtQ29tcG9uZW50cywgbnVtRWxlbWVudHMsIHNyY0J1ZmZlci5jb25zdHJ1Y3Rvcik7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtRWxlbWVudHM7ICsraWkpIHtcbiAgICAgICAgdmFyIG5keCA9IGluZGljZXNbaWldO1xuICAgICAgICB2YXIgb2Zmc2V0ID0gbmR4ICogbnVtQ29tcG9uZW50cztcbiAgICAgICAgZm9yICh2YXIgamogPSAwOyBqaiA8IG51bUNvbXBvbmVudHM7ICsramopIHtcbiAgICAgICAgICBkc3RCdWZmZXIucHVzaChzcmNCdWZmZXJbb2Zmc2V0ICsgampdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3VmVydGljZXNbY2hhbm5lbF0gPSBkc3RCdWZmZXI7XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXModmVydGljZXMpLmZpbHRlcihhbGxCdXRJbmRpY2VzKS5mb3JFYWNoKGV4cGFuZFRvVW5pbmRleGVkKTtcblxuICAgIHJldHVybiBuZXdWZXJ0aWNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBmbGF0dGVucyB0aGUgbm9ybWFscyBvZiBkZWluZGV4ZWQgdmVydGljZXMgaW4gcGxhY2UuXG4gICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+fSB2ZXJ0aWNlcyBUaGUgZGVpbmRleGVkIHZlcnRpY2VzIHdobydzIG5vcm1hbHMgdG8gZmxhdHRlblxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgVHlwZWRBcnJheT59IFRoZSBmbGF0dGVuZWQgdmVydGljZXMgKHNhbWUgYXMgd2FzIHBhc3NlZCBpbilcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIGZsYXR0ZW5Ob3JtYWxzKHZlcnRpY2VzKSB7XG4gICAgaWYgKHZlcnRpY2VzLmluZGljZXMpIHtcbiAgICAgIHRocm93IFwiY2FuJ3QgZmxhdHRlbiBub3JtYWxzIG9mIGluZGV4ZWQgdmVydGljZXMuIGRlaW5kZXggdGhlbSBmaXJzdFwiO1xuICAgIH1cblxuICAgIHZhciBub3JtYWxzID0gdmVydGljZXMubm9ybWFsO1xuICAgIHZhciBudW1Ob3JtYWxzID0gbm9ybWFscy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bU5vcm1hbHM7IGlpICs9IDkpIHtcbiAgICAgIC8vIHB1bGwgb3V0IHRoZSAzIG5vcm1hbHMgZm9yIHRoaXMgdHJpYW5nbGVcbiAgICAgIHZhciBuYXggPSBub3JtYWxzW2lpICsgMF07XG4gICAgICB2YXIgbmF5ID0gbm9ybWFsc1tpaSArIDFdO1xuICAgICAgdmFyIG5heiA9IG5vcm1hbHNbaWkgKyAyXTtcblxuICAgICAgdmFyIG5ieCA9IG5vcm1hbHNbaWkgKyAzXTtcbiAgICAgIHZhciBuYnkgPSBub3JtYWxzW2lpICsgNF07XG4gICAgICB2YXIgbmJ6ID0gbm9ybWFsc1tpaSArIDVdO1xuXG4gICAgICB2YXIgbmN4ID0gbm9ybWFsc1tpaSArIDZdO1xuICAgICAgdmFyIG5jeSA9IG5vcm1hbHNbaWkgKyA3XTtcbiAgICAgIHZhciBuY3ogPSBub3JtYWxzW2lpICsgOF07XG5cbiAgICAgIC8vIGFkZCB0aGVtXG4gICAgICB2YXIgbnggPSBuYXggKyBuYnggKyBuY3g7XG4gICAgICB2YXIgbnkgPSBuYXkgKyBuYnkgKyBuY3k7XG4gICAgICB2YXIgbnogPSBuYXogKyBuYnogKyBuY3o7XG5cbiAgICAgIC8vIG5vcm1hbGl6ZSB0aGVtXG4gICAgICB2YXIgbGVuZ3RoID0gTWF0aC5zcXJ0KG54ICogbnggKyBueSAqIG55ICsgbnogKiBueik7XG5cbiAgICAgIG54IC89IGxlbmd0aDtcbiAgICAgIG55IC89IGxlbmd0aDtcbiAgICAgIG56IC89IGxlbmd0aDtcblxuICAgICAgLy8gY29weSB0aGVtIGJhY2sgaW5cbiAgICAgIG5vcm1hbHNbaWkgKyAwXSA9IG54O1xuICAgICAgbm9ybWFsc1tpaSArIDFdID0gbnk7XG4gICAgICBub3JtYWxzW2lpICsgMl0gPSBuejtcblxuICAgICAgbm9ybWFsc1tpaSArIDNdID0gbng7XG4gICAgICBub3JtYWxzW2lpICsgNF0gPSBueTtcbiAgICAgIG5vcm1hbHNbaWkgKyA1XSA9IG56O1xuXG4gICAgICBub3JtYWxzW2lpICsgNl0gPSBueDtcbiAgICAgIG5vcm1hbHNbaWkgKyA3XSA9IG55O1xuICAgICAgbm9ybWFsc1tpaSArIDhdID0gbno7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRpY2VzO1xuICB9XG5cbiAgZnVuY3Rpb24gYXBwbHlGdW5jVG9WM0FycmF5KGFycmF5LCBtYXRyaXgsIGZuKSB7XG4gICAgdmFyIGxlbiA9IGFycmF5Lmxlbmd0aDtcbiAgICB2YXIgdG1wID0gbmV3IEZsb2F0MzJBcnJheSgzKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbGVuOyBpaSArPSAzKSB7XG4gICAgICBmbihtYXRyaXgsIFthcnJheVtpaV0sIGFycmF5W2lpICsgMV0sIGFycmF5W2lpICsgMl1dLCB0bXApO1xuICAgICAgYXJyYXlbaWkgICAgXSA9IHRtcFswXTtcbiAgICAgIGFycmF5W2lpICsgMV0gPSB0bXBbMV07XG4gICAgICBhcnJheVtpaSArIDJdID0gdG1wWzJdO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYW5zZm9ybU5vcm1hbChtaSwgdiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IHYzLmNyZWF0ZSgpO1xuICAgIHZhciB2MCA9IHZbMF07XG4gICAgdmFyIHYxID0gdlsxXTtcbiAgICB2YXIgdjIgPSB2WzJdO1xuXG4gICAgZHN0WzBdID0gdjAgKiBtaVswICogNCArIDBdICsgdjEgKiBtaVswICogNCArIDFdICsgdjIgKiBtaVswICogNCArIDJdO1xuICAgIGRzdFsxXSA9IHYwICogbWlbMSAqIDQgKyAwXSArIHYxICogbWlbMSAqIDQgKyAxXSArIHYyICogbWlbMSAqIDQgKyAyXTtcbiAgICBkc3RbMl0gPSB2MCAqIG1pWzIgKiA0ICsgMF0gKyB2MSAqIG1pWzIgKiA0ICsgMV0gKyB2MiAqIG1pWzIgKiA0ICsgMl07XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlb3JpZW50cyBkaXJlY3Rpb25zIGJ5IHRoZSBnaXZlbiBtYXRyaXguLlxuICAgKiBAcGFyYW0ge251bWJlcltdfFR5cGVkQXJyYXl9IGFycmF5IFRoZSBhcnJheS4gQXNzdW1lcyB2YWx1ZSBmbG9hdHMgcGVyIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXggQSBtYXRyaXggdG8gbXVsdGlwbHkgYnkuXG4gICAqIEByZXR1cm4ge251bWJlcltdfFR5cGVkQXJyYXl9IHRoZSBzYW1lIGFycmF5IHRoYXQgd2FzIHBhc3NlZCBpblxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gcmVvcmllbnREaXJlY3Rpb25zKGFycmF5LCBtYXRyaXgpIHtcbiAgICBhcHBseUZ1bmNUb1YzQXJyYXkoYXJyYXksIG1hdHJpeCwgbTQudHJhbnNmb3JtRGlyZWN0aW9uKTtcbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICAvKipcbiAgICogUmVvcmllbnRzIG5vcm1hbHMgYnkgdGhlIGludmVyc2UtdHJhbnNwb3NlIG9mIHRoZSBnaXZlblxuICAgKiBtYXRyaXguLlxuICAgKiBAcGFyYW0ge251bWJlcltdfFR5cGVkQXJyYXl9IGFycmF5IFRoZSBhcnJheS4gQXNzdW1lcyB2YWx1ZSBmbG9hdHMgcGVyIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXggQSBtYXRyaXggdG8gbXVsdGlwbHkgYnkuXG4gICAqIEByZXR1cm4ge251bWJlcltdfFR5cGVkQXJyYXl9IHRoZSBzYW1lIGFycmF5IHRoYXQgd2FzIHBhc3NlZCBpblxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gcmVvcmllbnROb3JtYWxzKGFycmF5LCBtYXRyaXgpIHtcbiAgICBhcHBseUZ1bmNUb1YzQXJyYXkoYXJyYXksIG00LmludmVyc2UobWF0cml4KSwgdHJhbnNmb3JtTm9ybWFsKTtcbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICAvKipcbiAgICogUmVvcmllbnRzIHBvc2l0aW9ucyBieSB0aGUgZ2l2ZW4gbWF0cml4LiBJbiBvdGhlciB3b3JkcywgaXRcbiAgICogbXVsdGlwbGllcyBlYWNoIHZlcnRleCBieSB0aGUgZ2l2ZW4gbWF0cml4LlxuICAgKiBAcGFyYW0ge251bWJlcltdfFR5cGVkQXJyYXl9IGFycmF5IFRoZSBhcnJheS4gQXNzdW1lcyB2YWx1ZSBmbG9hdHMgcGVyIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXggQSBtYXRyaXggdG8gbXVsdGlwbHkgYnkuXG4gICAqIEByZXR1cm4ge251bWJlcltdfFR5cGVkQXJyYXl9IHRoZSBzYW1lIGFycmF5IHRoYXQgd2FzIHBhc3NlZCBpblxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gcmVvcmllbnRQb3NpdGlvbnMoYXJyYXksIG1hdHJpeCkge1xuICAgIGFwcGx5RnVuY1RvVjNBcnJheShhcnJheSwgbWF0cml4LCBtNC50cmFuc2Zvcm1Qb2ludCk7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlb3JpZW50cyBhcnJheXMgYnkgdGhlIGdpdmVuIG1hdHJpeC4gQXNzdW1lcyBhcnJheXMgaGF2ZVxuICAgKiBuYW1lcyB0aGF0IGNvbnRhaW5zICdwb3MnIGNvdWxkIGJlIHJlb3JpZW50ZWQgYXMgcG9zaXRpb25zLFxuICAgKiAnYmlub3JtJyBvciAndGFuJyBhcyBkaXJlY3Rpb25zLCBhbmQgJ25vcm0nIGFzIG5vcm1hbHMuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIChudW1iZXJbXXxUeXBlZEFycmF5KT59IGFycmF5cyBUaGUgdmVydGljZXMgdG8gcmVvcmllbnRcbiAgICogQHBhcmFtIHtNYXRyaXh9IG1hdHJpeCBtYXRyaXggdG8gcmVvcmllbnQgYnkuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCAobnVtYmVyW118VHlwZWRBcnJheSk+fSBzYW1lIGFycmF5cyB0aGF0IHdlcmUgcGFzc2VkIGluLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gcmVvcmllbnRWZXJ0aWNlcyhhcnJheXMsIG1hdHJpeCkge1xuICAgIE9iamVjdC5rZXlzKGFycmF5cykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgYXJyYXkgPSBhcnJheXNbbmFtZV07XG4gICAgICBpZiAobmFtZS5pbmRleE9mKFwicG9zXCIpID49IDApIHtcbiAgICAgICAgcmVvcmllbnRQb3NpdGlvbnMoYXJyYXksIG1hdHJpeCk7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUuaW5kZXhPZihcInRhblwiKSA+PSAwIHx8IG5hbWUuaW5kZXhPZihcImJpbm9ybVwiKSA+PSAwKSB7XG4gICAgICAgIHJlb3JpZW50RGlyZWN0aW9ucyhhcnJheSwgbWF0cml4KTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZS5pbmRleE9mKFwibm9ybVwiKSA+PSAwKSB7XG4gICAgICAgIHJlb3JpZW50Tm9ybWFscyhhcnJheSwgbWF0cml4KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gYXJyYXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgWFkgcXVhZCBCdWZmZXJJbmZvXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IHdpdGggbm8gcGFyYW1ldGVycyB3aWxsIHJldHVybiBhIDJ4MiBxdWFkIHdpdGggdmFsdWVzIGZyb20gLTEgdG8gKzEuXG4gICAqIElmIHlvdSB3YW50IGEgdW5pdCBxdWFkIHdpdGggdGhhdCBnb2VzIGZyb20gMCB0byAxIHlvdSdkIGNhbGwgaXQgd2l0aFxuICAgKlxuICAgKiAgICAgdHdnbC5wcmltaXRpdmVzLmNyZWF0ZVhZUXVhZEJ1ZmZlckluZm8oZ2wsIDEsIDAuNSwgMC41KTtcbiAgICpcbiAgICogSWYgeW91IHdhbnQgYSB1bml0IHF1YWQgY2VudGVyZWQgYWJvdmUgMCwwIHlvdSdkIGNhbGwgaXQgd2l0aFxuICAgKlxuICAgKiAgICAgdHdnbC5wcmltaXRpdmVzLmNyZWF0ZVhZUXVhZEJ1ZmZlckluZm8oZ2wsIDEsIDAsIDAuNSk7XG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3NpemVdIHRoZSBzaXplIGFjcm9zcyB0aGUgcXVhZC4gRGVmYXVsdHMgdG8gMiB3aGljaCBtZWFucyB2ZXJ0aWNlcyB3aWxsIGdvIGZyb20gLTEgdG8gKzFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt4T2Zmc2V0XSB0aGUgYW1vdW50IHRvIG9mZnNldCB0aGUgcXVhZCBpbiBYXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbeU9mZnNldF0gdGhlIGFtb3VudCB0byBvZmZzZXQgdGhlIHF1YWQgaW4gWVxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgV2ViR0xCdWZmZXI+fSB0aGUgY3JlYXRlZCBYWSBRdWFkIEJ1ZmZlckluZm9cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZVhZUXVhZEJ1ZmZlckluZm9cbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgWFkgcXVhZCBCdWZmZXJzXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IHdpdGggbm8gcGFyYW1ldGVycyB3aWxsIHJldHVybiBhIDJ4MiBxdWFkIHdpdGggdmFsdWVzIGZyb20gLTEgdG8gKzEuXG4gICAqIElmIHlvdSB3YW50IGEgdW5pdCBxdWFkIHdpdGggdGhhdCBnb2VzIGZyb20gMCB0byAxIHlvdSdkIGNhbGwgaXQgd2l0aFxuICAgKlxuICAgKiAgICAgdHdnbC5wcmltaXRpdmVzLmNyZWF0ZVhZUXVhZEJ1ZmZlckluZm8oZ2wsIDEsIDAuNSwgMC41KTtcbiAgICpcbiAgICogSWYgeW91IHdhbnQgYSB1bml0IHF1YWQgY2VudGVyZWQgYWJvdmUgMCwwIHlvdSdkIGNhbGwgaXQgd2l0aFxuICAgKlxuICAgKiAgICAgdHdnbC5wcmltaXRpdmVzLmNyZWF0ZVhZUXVhZEJ1ZmZlckluZm8oZ2wsIDEsIDAsIDAuNSk7XG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3NpemVdIHRoZSBzaXplIGFjcm9zcyB0aGUgcXVhZC4gRGVmYXVsdHMgdG8gMiB3aGljaCBtZWFucyB2ZXJ0aWNlcyB3aWxsIGdvIGZyb20gLTEgdG8gKzFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt4T2Zmc2V0XSB0aGUgYW1vdW50IHRvIG9mZnNldCB0aGUgcXVhZCBpbiBYXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbeU9mZnNldF0gdGhlIGFtb3VudCB0byBvZmZzZXQgdGhlIHF1YWQgaW4gWVxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSB0aGUgY3JlYXRlZCBYWSBRdWFkIGJ1ZmZlcnNcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZVhZUXVhZEJ1ZmZlcnNcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgWFkgcXVhZCB2ZXJ0aWNlc1xuICAgKlxuICAgKiBUaGUgZGVmYXVsdCB3aXRoIG5vIHBhcmFtZXRlcnMgd2lsbCByZXR1cm4gYSAyeDIgcXVhZCB3aXRoIHZhbHVlcyBmcm9tIC0xIHRvICsxLlxuICAgKiBJZiB5b3Ugd2FudCBhIHVuaXQgcXVhZCB3aXRoIHRoYXQgZ29lcyBmcm9tIDAgdG8gMSB5b3UnZCBjYWxsIGl0IHdpdGhcbiAgICpcbiAgICogICAgIHR3Z2wucHJpbWl0aXZlcy5jcmVhdGVYWVF1YWRWZXJ0aWNlcygxLCAwLjUsIDAuNSk7XG4gICAqXG4gICAqIElmIHlvdSB3YW50IGEgdW5pdCBxdWFkIGNlbnRlcmVkIGFib3ZlIDAsMCB5b3UnZCBjYWxsIGl0IHdpdGhcbiAgICpcbiAgICogICAgIHR3Z2wucHJpbWl0aXZlcy5jcmVhdGVYWVF1YWRWZXJ0aWNlcygxLCAwLCAwLjUpO1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3NpemVdIHRoZSBzaXplIGFjcm9zcyB0aGUgcXVhZC4gRGVmYXVsdHMgdG8gMiB3aGljaCBtZWFucyB2ZXJ0aWNlcyB3aWxsIGdvIGZyb20gLTEgdG8gKzFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFt4T2Zmc2V0XSB0aGUgYW1vdW50IHRvIG9mZnNldCB0aGUgcXVhZCBpbiBYXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbeU9mZnNldF0gdGhlIGFtb3VudCB0byBvZmZzZXQgdGhlIHF1YWQgaW4gWVxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgVHlwZWRBcnJheT4gdGhlIGNyZWF0ZWQgWFkgUXVhZCB2ZXJ0aWNlc1xuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlWFlRdWFkVmVydGljZXMoc2l6ZSwgeE9mZnNldCwgeU9mZnNldCkge1xuICAgIHNpemUgPSBzaXplIHx8IDI7XG4gICAgeE9mZnNldCA9IHhPZmZzZXQgfHwgMDtcbiAgICB5T2Zmc2V0ID0geU9mZnNldCB8fCAwO1xuICAgIHNpemUgKj0gMC41O1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjoge1xuICAgICAgICBudW1Db21wb25lbnRzOiAyLFxuICAgICAgICBkYXRhOiBbXG4gICAgICAgICAgeE9mZnNldCArIC0xICogc2l6ZSwgeU9mZnNldCArIC0xICogc2l6ZSxcbiAgICAgICAgICB4T2Zmc2V0ICsgIDEgKiBzaXplLCB5T2Zmc2V0ICsgLTEgKiBzaXplLFxuICAgICAgICAgIHhPZmZzZXQgKyAtMSAqIHNpemUsIHlPZmZzZXQgKyAgMSAqIHNpemUsXG4gICAgICAgICAgeE9mZnNldCArICAxICogc2l6ZSwgeU9mZnNldCArICAxICogc2l6ZSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBub3JtYWw6IFtcbiAgICAgICAgMCwgMCwgMSxcbiAgICAgICAgMCwgMCwgMSxcbiAgICAgICAgMCwgMCwgMSxcbiAgICAgICAgMCwgMCwgMSxcbiAgICAgIF0sXG4gICAgICB0ZXhjb29yZDogW1xuICAgICAgICAwLCAwLFxuICAgICAgICAxLCAwLFxuICAgICAgICAwLCAxLFxuICAgICAgICAxLCAxLFxuICAgICAgXSxcbiAgICAgIGluZGljZXM6IFsgMCwgMSwgMiwgMiwgMSwgMyBdLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBYWiBwbGFuZSBCdWZmZXJJbmZvLlxuICAgKlxuICAgKiBUaGUgY3JlYXRlZCBwbGFuZSBoYXMgcG9zaXRpb24sIG5vcm1hbCwgYW5kIHRleGNvb3JkIGRhdGFcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIFdpZHRoIG9mIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtkZXB0aF0gRGVwdGggb2YgdGhlIHBsYW5lLiBEZWZhdWx0ID0gMVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N1YmRpdmlzaW9uc1dpZHRoXSBOdW1iZXIgb2Ygc3RlcHMgYWNyb3NzIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdWJkaXZpc2lvbnNEZXB0aF0gTnVtYmVyIG9mIHN0ZXBzIGRvd24gdGhlIHBsYW5lLiBEZWZhdWx0ID0gMVxuICAgKiBAcGFyYW0ge01hdHJpeDR9IFttYXRyaXhdIEEgbWF0cml4IGJ5IHdoaWNoIHRvIG11bHRpcGx5IGFsbCB0aGUgdmVydGljZXMuXG4gICAqIEByZXR1cm4ge0Btb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBUaGUgY3JlYXRlZCBwbGFuZSBCdWZmZXJJbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlUGxhbmVCdWZmZXJJbmZvXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIFhaIHBsYW5lIGJ1ZmZlcnMuXG4gICAqXG4gICAqIFRoZSBjcmVhdGVkIHBsYW5lIGhhcyBwb3NpdGlvbiwgbm9ybWFsLCBhbmQgdGV4Y29vcmQgZGF0YVxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt3aWR0aF0gV2lkdGggb2YgdGhlIHBsYW5lLiBEZWZhdWx0ID0gMVxuICAgKiBAcGFyYW0ge251bWJlcn0gW2RlcHRoXSBEZXB0aCBvZiB0aGUgcGxhbmUuIERlZmF1bHQgPSAxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3ViZGl2aXNpb25zV2lkdGhdIE51bWJlciBvZiBzdGVwcyBhY3Jvc3MgdGhlIHBsYW5lLiBEZWZhdWx0ID0gMVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N1YmRpdmlzaW9uc0RlcHRoXSBOdW1iZXIgb2Ygc3RlcHMgZG93biB0aGUgcGxhbmUuIERlZmF1bHQgPSAxXG4gICAqIEBwYXJhbSB7TWF0cml4NH0gW21hdHJpeF0gQSBtYXRyaXggYnkgd2hpY2ggdG8gbXVsdGlwbHkgYWxsIHRoZSB2ZXJ0aWNlcy5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFdlYkdMQnVmZmVyPn0gVGhlIGNyZWF0ZWQgcGxhbmUgYnVmZmVycy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZVBsYW5lQnVmZmVyc1xuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBYWiBwbGFuZSB2ZXJ0aWNlcy5cbiAgICpcbiAgICogVGhlIGNyZWF0ZWQgcGxhbmUgaGFzIHBvc2l0aW9uLCBub3JtYWwsIGFuZCB0ZXhjb29yZCBkYXRhXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIFdpZHRoIG9mIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtkZXB0aF0gRGVwdGggb2YgdGhlIHBsYW5lLiBEZWZhdWx0ID0gMVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N1YmRpdmlzaW9uc1dpZHRoXSBOdW1iZXIgb2Ygc3RlcHMgYWNyb3NzIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdWJkaXZpc2lvbnNEZXB0aF0gTnVtYmVyIG9mIHN0ZXBzIGRvd24gdGhlIHBsYW5lLiBEZWZhdWx0ID0gMVxuICAgKiBAcGFyYW0ge01hdHJpeDR9IFttYXRyaXhdIEEgbWF0cml4IGJ5IHdoaWNoIHRvIG11bHRpcGx5IGFsbCB0aGUgdmVydGljZXMuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBUeXBlZEFycmF5Pn0gVGhlIGNyZWF0ZWQgcGxhbmUgdmVydGljZXMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVQbGFuZVZlcnRpY2VzKFxuICAgICAgd2lkdGgsXG4gICAgICBkZXB0aCxcbiAgICAgIHN1YmRpdmlzaW9uc1dpZHRoLFxuICAgICAgc3ViZGl2aXNpb25zRGVwdGgsXG4gICAgICBtYXRyaXgpIHtcbiAgICB3aWR0aCA9IHdpZHRoIHx8IDE7XG4gICAgZGVwdGggPSBkZXB0aCB8fCAxO1xuICAgIHN1YmRpdmlzaW9uc1dpZHRoID0gc3ViZGl2aXNpb25zV2lkdGggfHwgMTtcbiAgICBzdWJkaXZpc2lvbnNEZXB0aCA9IHN1YmRpdmlzaW9uc0RlcHRoIHx8IDE7XG4gICAgbWF0cml4ID0gbWF0cml4IHx8IG00LmlkZW50aXR5KCk7XG5cbiAgICB2YXIgbnVtVmVydGljZXMgPSAoc3ViZGl2aXNpb25zV2lkdGggKyAxKSAqIChzdWJkaXZpc2lvbnNEZXB0aCArIDEpO1xuICAgIHZhciBwb3NpdGlvbnMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgbm9ybWFscyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgbnVtVmVydGljZXMpO1xuICAgIHZhciB0ZXhjb29yZHMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDIsIG51bVZlcnRpY2VzKTtcblxuICAgIGZvciAodmFyIHogPSAwOyB6IDw9IHN1YmRpdmlzaW9uc0RlcHRoOyB6KyspIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDw9IHN1YmRpdmlzaW9uc1dpZHRoOyB4KyspIHtcbiAgICAgICAgdmFyIHUgPSB4IC8gc3ViZGl2aXNpb25zV2lkdGg7XG4gICAgICAgIHZhciB2ID0geiAvIHN1YmRpdmlzaW9uc0RlcHRoO1xuICAgICAgICBwb3NpdGlvbnMucHVzaChcbiAgICAgICAgICAgIHdpZHRoICogdSAtIHdpZHRoICogMC41LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIGRlcHRoICogdiAtIGRlcHRoICogMC41KTtcbiAgICAgICAgbm9ybWFscy5wdXNoKDAsIDEsIDApO1xuICAgICAgICB0ZXhjb29yZHMucHVzaCh1LCB2KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbnVtVmVydHNBY3Jvc3MgPSBzdWJkaXZpc2lvbnNXaWR0aCArIDE7XG4gICAgdmFyIGluZGljZXMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KFxuICAgICAgICAzLCBzdWJkaXZpc2lvbnNXaWR0aCAqIHN1YmRpdmlzaW9uc0RlcHRoICogMiwgVWludDE2QXJyYXkpO1xuXG4gICAgZm9yICh2YXIgeiA9IDA7IHogPCBzdWJkaXZpc2lvbnNEZXB0aDsgeisrKSB7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHN1YmRpdmlzaW9uc1dpZHRoOyB4KyspIHsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgLy8gTWFrZSB0cmlhbmdsZSAxIG9mIHF1YWQuXG4gICAgICAgIGluZGljZXMucHVzaChcbiAgICAgICAgICAgICh6ICsgMCkgKiBudW1WZXJ0c0Fjcm9zcyArIHgsXG4gICAgICAgICAgICAoeiArIDEpICogbnVtVmVydHNBY3Jvc3MgKyB4LFxuICAgICAgICAgICAgKHogKyAwKSAqIG51bVZlcnRzQWNyb3NzICsgeCArIDEpO1xuXG4gICAgICAgIC8vIE1ha2UgdHJpYW5nbGUgMiBvZiBxdWFkLlxuICAgICAgICBpbmRpY2VzLnB1c2goXG4gICAgICAgICAgICAoeiArIDEpICogbnVtVmVydHNBY3Jvc3MgKyB4LFxuICAgICAgICAgICAgKHogKyAxKSAqIG51bVZlcnRzQWNyb3NzICsgeCArIDEsXG4gICAgICAgICAgICAoeiArIDApICogbnVtVmVydHNBY3Jvc3MgKyB4ICsgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGFycmF5cyA9IHJlb3JpZW50VmVydGljZXMoe1xuICAgICAgcG9zaXRpb246IHBvc2l0aW9ucyxcbiAgICAgIG5vcm1hbDogbm9ybWFscyxcbiAgICAgIHRleGNvb3JkOiB0ZXhjb29yZHMsXG4gICAgICBpbmRpY2VzOiBpbmRpY2VzLFxuICAgIH0sIG1hdHJpeCk7XG4gICAgcmV0dXJuIGFycmF5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHNwaGVyZSBCdWZmZXJJbmZvLlxuICAgKlxuICAgKiBUaGUgY3JlYXRlZCBzcGhlcmUgaGFzIHBvc2l0aW9uLCBub3JtYWwsIGFuZCB0ZXhjb29yZCBkYXRhXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIHJhZGl1cyBvZiB0aGUgc3BoZXJlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zQXhpcyBudW1iZXIgb2Ygc3RlcHMgYXJvdW5kIHRoZSBzcGhlcmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdWJkaXZpc2lvbnNIZWlnaHQgbnVtYmVyIG9mIHZlcnRpY2FsbHkgb24gdGhlIHNwaGVyZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRfc3RhcnRMYXRpdHVkZUluUmFkaWFuc10gd2hlcmUgdG8gc3RhcnQgdGhlXG4gICAqICAgICB0b3Agb2YgdGhlIHNwaGVyZS4gRGVmYXVsdCA9IDAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0X2VuZExhdGl0dWRlSW5SYWRpYW5zXSBXaGVyZSB0byBlbmQgdGhlXG4gICAqICAgICBib3R0b20gb2YgdGhlIHNwaGVyZS4gRGVmYXVsdCA9IE1hdGguUEkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0X3N0YXJ0TG9uZ2l0dWRlSW5SYWRpYW5zXSB3aGVyZSB0byBzdGFydFxuICAgKiAgICAgd3JhcHBpbmcgdGhlIHNwaGVyZS4gRGVmYXVsdCA9IDAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0X2VuZExvbmdpdHVkZUluUmFkaWFuc10gd2hlcmUgdG8gZW5kXG4gICAqICAgICB3cmFwcGluZyB0aGUgc3BoZXJlLiBEZWZhdWx0ID0gMiAqIE1hdGguUEkuXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IFRoZSBjcmVhdGVkIHNwaGVyZSBCdWZmZXJJbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlU3BoZXJlQnVmZmVySW5mb1xuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBzcGhlcmUgYnVmZmVycy5cbiAgICpcbiAgICogVGhlIGNyZWF0ZWQgc3BoZXJlIGhhcyBwb3NpdGlvbiwgbm9ybWFsLCBhbmQgdGV4Y29vcmQgZGF0YVxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyByYWRpdXMgb2YgdGhlIHNwaGVyZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc0F4aXMgbnVtYmVyIG9mIHN0ZXBzIGFyb3VuZCB0aGUgc3BoZXJlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zSGVpZ2h0IG51bWJlciBvZiB2ZXJ0aWNhbGx5IG9uIHRoZSBzcGhlcmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0X3N0YXJ0TGF0aXR1ZGVJblJhZGlhbnNdIHdoZXJlIHRvIHN0YXJ0IHRoZVxuICAgKiAgICAgdG9wIG9mIHRoZSBzcGhlcmUuIERlZmF1bHQgPSAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdF9lbmRMYXRpdHVkZUluUmFkaWFuc10gV2hlcmUgdG8gZW5kIHRoZVxuICAgKiAgICAgYm90dG9tIG9mIHRoZSBzcGhlcmUuIERlZmF1bHQgPSBNYXRoLlBJLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdF9zdGFydExvbmdpdHVkZUluUmFkaWFuc10gd2hlcmUgdG8gc3RhcnRcbiAgICogICAgIHdyYXBwaW5nIHRoZSBzcGhlcmUuIERlZmF1bHQgPSAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdF9lbmRMb25naXR1ZGVJblJhZGlhbnNdIHdoZXJlIHRvIGVuZFxuICAgKiAgICAgd3JhcHBpbmcgdGhlIHNwaGVyZS4gRGVmYXVsdCA9IDIgKiBNYXRoLlBJLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgV2ViR0xCdWZmZXI+fSBUaGUgY3JlYXRlZCBzcGhlcmUgYnVmZmVycy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZVNwaGVyZUJ1ZmZlcnNcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgc3BoZXJlIHZlcnRpY2VzLlxuICAgKlxuICAgKiBUaGUgY3JlYXRlZCBzcGhlcmUgaGFzIHBvc2l0aW9uLCBub3JtYWwsIGFuZCB0ZXhjb29yZCBkYXRhXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgcmFkaXVzIG9mIHRoZSBzcGhlcmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdWJkaXZpc2lvbnNBeGlzIG51bWJlciBvZiBzdGVwcyBhcm91bmQgdGhlIHNwaGVyZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc0hlaWdodCBudW1iZXIgb2YgdmVydGljYWxseSBvbiB0aGUgc3BoZXJlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdF9zdGFydExhdGl0dWRlSW5SYWRpYW5zXSB3aGVyZSB0byBzdGFydCB0aGVcbiAgICogICAgIHRvcCBvZiB0aGUgc3BoZXJlLiBEZWZhdWx0ID0gMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRfZW5kTGF0aXR1ZGVJblJhZGlhbnNdIFdoZXJlIHRvIGVuZCB0aGVcbiAgICogICAgIGJvdHRvbSBvZiB0aGUgc3BoZXJlLiBEZWZhdWx0ID0gTWF0aC5QSS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRfc3RhcnRMb25naXR1ZGVJblJhZGlhbnNdIHdoZXJlIHRvIHN0YXJ0XG4gICAqICAgICB3cmFwcGluZyB0aGUgc3BoZXJlLiBEZWZhdWx0ID0gMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRfZW5kTG9uZ2l0dWRlSW5SYWRpYW5zXSB3aGVyZSB0byBlbmRcbiAgICogICAgIHdyYXBwaW5nIHRoZSBzcGhlcmUuIERlZmF1bHQgPSAyICogTWF0aC5QSS5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+fSBUaGUgY3JlYXRlZCBzcGhlcmUgdmVydGljZXMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVTcGhlcmVWZXJ0aWNlcyhcbiAgICAgIHJhZGl1cyxcbiAgICAgIHN1YmRpdmlzaW9uc0F4aXMsXG4gICAgICBzdWJkaXZpc2lvbnNIZWlnaHQsXG4gICAgICBvcHRfc3RhcnRMYXRpdHVkZUluUmFkaWFucyxcbiAgICAgIG9wdF9lbmRMYXRpdHVkZUluUmFkaWFucyxcbiAgICAgIG9wdF9zdGFydExvbmdpdHVkZUluUmFkaWFucyxcbiAgICAgIG9wdF9lbmRMb25naXR1ZGVJblJhZGlhbnMpIHtcbiAgICBpZiAoc3ViZGl2aXNpb25zQXhpcyA8PSAwIHx8IHN1YmRpdmlzaW9uc0hlaWdodCA8PSAwKSB7XG4gICAgICB0aHJvdyBFcnJvcignc3ViZGl2aXNpb25BeGlzIGFuZCBzdWJkaXZpc2lvbkhlaWdodCBtdXN0IGJlID4gMCcpO1xuICAgIH1cblxuICAgIG9wdF9zdGFydExhdGl0dWRlSW5SYWRpYW5zID0gb3B0X3N0YXJ0TGF0aXR1ZGVJblJhZGlhbnMgfHwgMDtcbiAgICBvcHRfZW5kTGF0aXR1ZGVJblJhZGlhbnMgPSBvcHRfZW5kTGF0aXR1ZGVJblJhZGlhbnMgfHwgTWF0aC5QSTtcbiAgICBvcHRfc3RhcnRMb25naXR1ZGVJblJhZGlhbnMgPSBvcHRfc3RhcnRMb25naXR1ZGVJblJhZGlhbnMgfHwgMDtcbiAgICBvcHRfZW5kTG9uZ2l0dWRlSW5SYWRpYW5zID0gb3B0X2VuZExvbmdpdHVkZUluUmFkaWFucyB8fCAoTWF0aC5QSSAqIDIpO1xuXG4gICAgdmFyIGxhdFJhbmdlID0gb3B0X2VuZExhdGl0dWRlSW5SYWRpYW5zIC0gb3B0X3N0YXJ0TGF0aXR1ZGVJblJhZGlhbnM7XG4gICAgdmFyIGxvbmdSYW5nZSA9IG9wdF9lbmRMb25naXR1ZGVJblJhZGlhbnMgLSBvcHRfc3RhcnRMb25naXR1ZGVJblJhZGlhbnM7XG5cbiAgICAvLyBXZSBhcmUgZ29pbmcgdG8gZ2VuZXJhdGUgb3VyIHNwaGVyZSBieSBpdGVyYXRpbmcgdGhyb3VnaCBpdHNcbiAgICAvLyBzcGhlcmljYWwgY29vcmRpbmF0ZXMgYW5kIGdlbmVyYXRpbmcgMiB0cmlhbmdsZXMgZm9yIGVhY2ggcXVhZCBvbiBhXG4gICAgLy8gcmluZyBvZiB0aGUgc3BoZXJlLlxuICAgIHZhciBudW1WZXJ0aWNlcyA9IChzdWJkaXZpc2lvbnNBeGlzICsgMSkgKiAoc3ViZGl2aXNpb25zSGVpZ2h0ICsgMSk7XG4gICAgdmFyIHBvc2l0aW9ucyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgbnVtVmVydGljZXMpO1xuICAgIHZhciBub3JtYWxzICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgdGV4Y29vcmRzID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgyICwgbnVtVmVydGljZXMpO1xuXG4gICAgLy8gR2VuZXJhdGUgdGhlIGluZGl2aWR1YWwgdmVydGljZXMgaW4gb3VyIHZlcnRleCBidWZmZXIuXG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPD0gc3ViZGl2aXNpb25zSGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDw9IHN1YmRpdmlzaW9uc0F4aXM7IHgrKykge1xuICAgICAgICAvLyBHZW5lcmF0ZSBhIHZlcnRleCBiYXNlZCBvbiBpdHMgc3BoZXJpY2FsIGNvb3JkaW5hdGVzXG4gICAgICAgIHZhciB1ID0geCAvIHN1YmRpdmlzaW9uc0F4aXM7XG4gICAgICAgIHZhciB2ID0geSAvIHN1YmRpdmlzaW9uc0hlaWdodDtcbiAgICAgICAgdmFyIHRoZXRhID0gbG9uZ1JhbmdlICogdTtcbiAgICAgICAgdmFyIHBoaSA9IGxhdFJhbmdlICogdjtcbiAgICAgICAgdmFyIHNpblRoZXRhID0gTWF0aC5zaW4odGhldGEpO1xuICAgICAgICB2YXIgY29zVGhldGEgPSBNYXRoLmNvcyh0aGV0YSk7XG4gICAgICAgIHZhciBzaW5QaGkgPSBNYXRoLnNpbihwaGkpO1xuICAgICAgICB2YXIgY29zUGhpID0gTWF0aC5jb3MocGhpKTtcbiAgICAgICAgdmFyIHV4ID0gY29zVGhldGEgKiBzaW5QaGk7XG4gICAgICAgIHZhciB1eSA9IGNvc1BoaTtcbiAgICAgICAgdmFyIHV6ID0gc2luVGhldGEgKiBzaW5QaGk7XG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKHJhZGl1cyAqIHV4LCByYWRpdXMgKiB1eSwgcmFkaXVzICogdXopO1xuICAgICAgICBub3JtYWxzLnB1c2godXgsIHV5LCB1eik7XG4gICAgICAgIHRleGNvb3Jkcy5wdXNoKDEgLSB1LCB2KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbnVtVmVydHNBcm91bmQgPSBzdWJkaXZpc2lvbnNBeGlzICsgMTtcbiAgICB2YXIgaW5kaWNlcyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgc3ViZGl2aXNpb25zQXhpcyAqIHN1YmRpdmlzaW9uc0hlaWdodCAqIDIsIFVpbnQxNkFycmF5KTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHN1YmRpdmlzaW9uc0F4aXM7IHgrKykgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCBzdWJkaXZpc2lvbnNIZWlnaHQ7IHkrKykgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICAvLyBNYWtlIHRyaWFuZ2xlIDEgb2YgcXVhZC5cbiAgICAgICAgaW5kaWNlcy5wdXNoKFxuICAgICAgICAgICAgKHkgKyAwKSAqIG51bVZlcnRzQXJvdW5kICsgeCxcbiAgICAgICAgICAgICh5ICsgMCkgKiBudW1WZXJ0c0Fyb3VuZCArIHggKyAxLFxuICAgICAgICAgICAgKHkgKyAxKSAqIG51bVZlcnRzQXJvdW5kICsgeCk7XG5cbiAgICAgICAgLy8gTWFrZSB0cmlhbmdsZSAyIG9mIHF1YWQuXG4gICAgICAgIGluZGljZXMucHVzaChcbiAgICAgICAgICAgICh5ICsgMSkgKiBudW1WZXJ0c0Fyb3VuZCArIHgsXG4gICAgICAgICAgICAoeSArIDApICogbnVtVmVydHNBcm91bmQgKyB4ICsgMSxcbiAgICAgICAgICAgICh5ICsgMSkgKiBudW1WZXJ0c0Fyb3VuZCArIHggKyAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IHBvc2l0aW9ucyxcbiAgICAgIG5vcm1hbDogbm9ybWFscyxcbiAgICAgIHRleGNvb3JkOiB0ZXhjb29yZHMsXG4gICAgICBpbmRpY2VzOiBpbmRpY2VzLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQXJyYXkgb2YgdGhlIGluZGljZXMgb2YgY29ybmVycyBvZiBlYWNoIGZhY2Ugb2YgYSBjdWJlLlxuICAgKiBAdHlwZSB7QXJyYXkuPG51bWJlcltdPn1cbiAgICovXG4gIHZhciBDVUJFX0ZBQ0VfSU5ESUNFUyA9IFtcbiAgICBbMywgNywgNSwgMV0sICAvLyByaWdodFxuICAgIFs2LCAyLCAwLCA0XSwgIC8vIGxlZnRcbiAgICBbNiwgNywgMywgMl0sICAvLyA/P1xuICAgIFswLCAxLCA1LCA0XSwgIC8vID8/XG4gICAgWzcsIDYsIDQsIDVdLCAgLy8gZnJvbnRcbiAgICBbMiwgMywgMSwgMF0sICAvLyBiYWNrXG4gIF07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBCdWZmZXJJbmZvIGZvciBhIGN1YmUuXG4gICAqXG4gICAqIFRoZSBjdWJlIGlzIGNyZWF0ZWQgYXJvdW5kIHRoZSBvcmlnaW4uICgtc2l6ZSAvIDIsIHNpemUgLyAyKS5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc2l6ZV0gd2lkdGgsIGhlaWdodCBhbmQgZGVwdGggb2YgdGhlIGN1YmUuXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IFRoZSBjcmVhdGVkIEJ1ZmZlckluZm8uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVDdWJlQnVmZmVySW5mb1xuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgYnVmZmVycyBhbmQgaW5kaWNlcyBmb3IgYSBjdWJlLlxuICAgKlxuICAgKiBUaGUgY3ViZSBpcyBjcmVhdGVkIGFyb3VuZCB0aGUgb3JpZ2luLiAoLXNpemUgLyAyLCBzaXplIC8gMikuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3NpemVdIHdpZHRoLCBoZWlnaHQgYW5kIGRlcHRoIG9mIHRoZSBjdWJlLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgV2ViR0xCdWZmZXI+fSBUaGUgY3JlYXRlZCBidWZmZXJzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlQ3ViZUJ1ZmZlcnNcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIHZlcnRpY2VzIGFuZCBpbmRpY2VzIGZvciBhIGN1YmUuXG4gICAqXG4gICAqIFRoZSBjdWJlIGlzIGNyZWF0ZWQgYXJvdW5kIHRoZSBvcmlnaW4uICgtc2l6ZSAvIDIsIHNpemUgLyAyKS5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzaXplXSB3aWR0aCwgaGVpZ2h0IGFuZCBkZXB0aCBvZiB0aGUgY3ViZS5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+fSBUaGUgY3JlYXRlZCB2ZXJ0aWNlcy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUN1YmVWZXJ0aWNlcyhzaXplKSB7XG4gICAgc2l6ZSA9IHNpemUgfHwgMTtcbiAgICB2YXIgayA9IHNpemUgLyAyO1xuXG4gICAgdmFyIGNvcm5lclZlcnRpY2VzID0gW1xuICAgICAgWy1rLCAtaywgLWtdLFxuICAgICAgWytrLCAtaywgLWtdLFxuICAgICAgWy1rLCAraywgLWtdLFxuICAgICAgWytrLCAraywgLWtdLFxuICAgICAgWy1rLCAtaywgK2tdLFxuICAgICAgWytrLCAtaywgK2tdLFxuICAgICAgWy1rLCAraywgK2tdLFxuICAgICAgWytrLCAraywgK2tdLFxuICAgIF07XG5cbiAgICB2YXIgZmFjZU5vcm1hbHMgPSBbXG4gICAgICBbKzEsICswLCArMF0sXG4gICAgICBbLTEsICswLCArMF0sXG4gICAgICBbKzAsICsxLCArMF0sXG4gICAgICBbKzAsIC0xLCArMF0sXG4gICAgICBbKzAsICswLCArMV0sXG4gICAgICBbKzAsICswLCAtMV0sXG4gICAgXTtcblxuICAgIHZhciB1dkNvb3JkcyA9IFtcbiAgICAgIFsxLCAwXSxcbiAgICAgIFswLCAwXSxcbiAgICAgIFswLCAxXSxcbiAgICAgIFsxLCAxXSxcbiAgICBdO1xuXG4gICAgdmFyIG51bVZlcnRpY2VzID0gNiAqIDQ7XG4gICAgdmFyIHBvc2l0aW9ucyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgbnVtVmVydGljZXMpO1xuICAgIHZhciBub3JtYWxzICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgdGV4Y29vcmRzID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgyICwgbnVtVmVydGljZXMpO1xuICAgIHZhciBpbmRpY2VzICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIDYgKiAyLCBVaW50MTZBcnJheSk7XG5cbiAgICBmb3IgKHZhciBmID0gMDsgZiA8IDY7ICsrZikge1xuICAgICAgdmFyIGZhY2VJbmRpY2VzID0gQ1VCRV9GQUNFX0lORElDRVNbZl07XG4gICAgICBmb3IgKHZhciB2ID0gMDsgdiA8IDQ7ICsrdikge1xuICAgICAgICB2YXIgcG9zaXRpb24gPSBjb3JuZXJWZXJ0aWNlc1tmYWNlSW5kaWNlc1t2XV07XG4gICAgICAgIHZhciBub3JtYWwgPSBmYWNlTm9ybWFsc1tmXTtcbiAgICAgICAgdmFyIHV2ID0gdXZDb29yZHNbdl07XG5cbiAgICAgICAgLy8gRWFjaCBmYWNlIG5lZWRzIGFsbCBmb3VyIHZlcnRpY2VzIGJlY2F1c2UgdGhlIG5vcm1hbHMgYW5kIHRleHR1cmVcbiAgICAgICAgLy8gY29vcmRpbmF0ZXMgYXJlIG5vdCBhbGwgdGhlIHNhbWUuXG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uKTtcbiAgICAgICAgbm9ybWFscy5wdXNoKG5vcm1hbCk7XG4gICAgICAgIHRleGNvb3Jkcy5wdXNoKHV2KTtcblxuICAgICAgfVxuICAgICAgLy8gVHdvIHRyaWFuZ2xlcyBtYWtlIGEgc3F1YXJlIGZhY2UuXG4gICAgICB2YXIgb2Zmc2V0ID0gNCAqIGY7XG4gICAgICBpbmRpY2VzLnB1c2gob2Zmc2V0ICsgMCwgb2Zmc2V0ICsgMSwgb2Zmc2V0ICsgMik7XG4gICAgICBpbmRpY2VzLnB1c2gob2Zmc2V0ICsgMCwgb2Zmc2V0ICsgMiwgb2Zmc2V0ICsgMyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbnMsXG4gICAgICBub3JtYWw6IG5vcm1hbHMsXG4gICAgICB0ZXhjb29yZDogdGV4Y29vcmRzLFxuICAgICAgaW5kaWNlczogaW5kaWNlcyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBCdWZmZXJJbmZvIGZvciBhIHRydW5jYXRlZCBjb25lLCB3aGljaCBpcyBsaWtlIGEgY3lsaW5kZXJcbiAgICogZXhjZXB0IHRoYXQgaXQgaGFzIGRpZmZlcmVudCB0b3AgYW5kIGJvdHRvbSByYWRpaS4gQSB0cnVuY2F0ZWQgY29uZVxuICAgKiBjYW4gYWxzbyBiZSB1c2VkIHRvIGNyZWF0ZSBjeWxpbmRlcnMgYW5kIHJlZ3VsYXIgY29uZXMuIFRoZVxuICAgKiB0cnVuY2F0ZWQgY29uZSB3aWxsIGJlIGNyZWF0ZWQgY2VudGVyZWQgYWJvdXQgdGhlIG9yaWdpbiwgd2l0aCB0aGVcbiAgICogeSBheGlzIGFzIGl0cyB2ZXJ0aWNhbCBheGlzLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbVJhZGl1cyBCb3R0b20gcmFkaXVzIG9mIHRydW5jYXRlZCBjb25lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdG9wUmFkaXVzIFRvcCByYWRpdXMgb2YgdHJ1bmNhdGVkIGNvbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIHRydW5jYXRlZCBjb25lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaWFsU3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGFyb3VuZCB0aGVcbiAgICogICAgIHRydW5jYXRlZCBjb25lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmVydGljYWxTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgZG93biB0aGVcbiAgICogICAgIHRydW5jYXRlZCBjb25lLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRfdG9wQ2FwXSBDcmVhdGUgdG9wIGNhcC4gRGVmYXVsdCA9IHRydWUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdF9ib3R0b21DYXBdIENyZWF0ZSBib3R0b20gY2FwLiBEZWZhdWx0ID0gdHJ1ZS5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wuQnVmZmVySW5mb30gVGhlIGNyZWF0ZWQgY29uZSBCdWZmZXJJbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlVHJ1bmNhdGVkQ29uZUJ1ZmZlckluZm9cbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYnVmZmVycyBmb3IgYSB0cnVuY2F0ZWQgY29uZSwgd2hpY2ggaXMgbGlrZSBhIGN5bGluZGVyXG4gICAqIGV4Y2VwdCB0aGF0IGl0IGhhcyBkaWZmZXJlbnQgdG9wIGFuZCBib3R0b20gcmFkaWkuIEEgdHJ1bmNhdGVkIGNvbmVcbiAgICogY2FuIGFsc28gYmUgdXNlZCB0byBjcmVhdGUgY3lsaW5kZXJzIGFuZCByZWd1bGFyIGNvbmVzLiBUaGVcbiAgICogdHJ1bmNhdGVkIGNvbmUgd2lsbCBiZSBjcmVhdGVkIGNlbnRlcmVkIGFib3V0IHRoZSBvcmlnaW4sIHdpdGggdGhlXG4gICAqIHkgYXhpcyBhcyBpdHMgdmVydGljYWwgYXhpcy5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b21SYWRpdXMgQm90dG9tIHJhZGl1cyBvZiB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvcFJhZGl1cyBUb3AgcmFkaXVzIG9mIHRydW5jYXRlZCBjb25lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlXG4gICAqICAgICB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsU3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGRvd24gdGhlXG4gICAqICAgICB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0X3RvcENhcF0gQ3JlYXRlIHRvcCBjYXAuIERlZmF1bHQgPSB0cnVlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRfYm90dG9tQ2FwXSBDcmVhdGUgYm90dG9tIGNhcC4gRGVmYXVsdCA9IHRydWUuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBXZWJHTEJ1ZmZlcj59IFRoZSBjcmVhdGVkIGNvbmUgYnVmZmVycy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZVRydW5jYXRlZENvbmVCdWZmZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHZlcnRpY2VzIGZvciBhIHRydW5jYXRlZCBjb25lLCB3aGljaCBpcyBsaWtlIGEgY3lsaW5kZXJcbiAgICogZXhjZXB0IHRoYXQgaXQgaGFzIGRpZmZlcmVudCB0b3AgYW5kIGJvdHRvbSByYWRpaS4gQSB0cnVuY2F0ZWQgY29uZVxuICAgKiBjYW4gYWxzbyBiZSB1c2VkIHRvIGNyZWF0ZSBjeWxpbmRlcnMgYW5kIHJlZ3VsYXIgY29uZXMuIFRoZVxuICAgKiB0cnVuY2F0ZWQgY29uZSB3aWxsIGJlIGNyZWF0ZWQgY2VudGVyZWQgYWJvdXQgdGhlIG9yaWdpbiwgd2l0aCB0aGVcbiAgICogeSBheGlzIGFzIGl0cyB2ZXJ0aWNhbCBheGlzLiAuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b21SYWRpdXMgQm90dG9tIHJhZGl1cyBvZiB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvcFJhZGl1cyBUb3AgcmFkaXVzIG9mIHRydW5jYXRlZCBjb25lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlXG4gICAqICAgICB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsU3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGRvd24gdGhlXG4gICAqICAgICB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0X3RvcENhcF0gQ3JlYXRlIHRvcCBjYXAuIERlZmF1bHQgPSB0cnVlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRfYm90dG9tQ2FwXSBDcmVhdGUgYm90dG9tIGNhcC4gRGVmYXVsdCA9IHRydWUuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBUeXBlZEFycmF5Pn0gVGhlIGNyZWF0ZWQgY29uZSB2ZXJ0aWNlcy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZVRydW5jYXRlZENvbmVWZXJ0aWNlcyhcbiAgICAgIGJvdHRvbVJhZGl1cyxcbiAgICAgIHRvcFJhZGl1cyxcbiAgICAgIGhlaWdodCxcbiAgICAgIHJhZGlhbFN1YmRpdmlzaW9ucyxcbiAgICAgIHZlcnRpY2FsU3ViZGl2aXNpb25zLFxuICAgICAgb3B0X3RvcENhcCxcbiAgICAgIG9wdF9ib3R0b21DYXApIHtcbiAgICBpZiAocmFkaWFsU3ViZGl2aXNpb25zIDwgMykge1xuICAgICAgdGhyb3cgRXJyb3IoJ3JhZGlhbFN1YmRpdmlzaW9ucyBtdXN0IGJlIDMgb3IgZ3JlYXRlcicpO1xuICAgIH1cblxuICAgIGlmICh2ZXJ0aWNhbFN1YmRpdmlzaW9ucyA8IDEpIHtcbiAgICAgIHRocm93IEVycm9yKCd2ZXJ0aWNhbFN1YmRpdmlzaW9ucyBtdXN0IGJlIDEgb3IgZ3JlYXRlcicpO1xuICAgIH1cblxuICAgIHZhciB0b3BDYXAgPSAob3B0X3RvcENhcCA9PT0gdW5kZWZpbmVkKSA/IHRydWUgOiBvcHRfdG9wQ2FwO1xuICAgIHZhciBib3R0b21DYXAgPSAob3B0X2JvdHRvbUNhcCA9PT0gdW5kZWZpbmVkKSA/IHRydWUgOiBvcHRfYm90dG9tQ2FwO1xuXG4gICAgdmFyIGV4dHJhID0gKHRvcENhcCA/IDIgOiAwKSArIChib3R0b21DYXAgPyAyIDogMCk7XG5cbiAgICB2YXIgbnVtVmVydGljZXMgPSAocmFkaWFsU3ViZGl2aXNpb25zICsgMSkgKiAodmVydGljYWxTdWJkaXZpc2lvbnMgKyAxICsgZXh0cmEpO1xuICAgIHZhciBwb3NpdGlvbnMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgbm9ybWFscyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIHRleGNvb3JkcyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMiwgbnVtVmVydGljZXMpO1xuICAgIHZhciBpbmRpY2VzICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIHJhZGlhbFN1YmRpdmlzaW9ucyAqICh2ZXJ0aWNhbFN1YmRpdmlzaW9ucyArIGV4dHJhKSAqIDIsIFVpbnQxNkFycmF5KTtcblxuICAgIHZhciB2ZXJ0c0Fyb3VuZEVkZ2UgPSByYWRpYWxTdWJkaXZpc2lvbnMgKyAxO1xuXG4gICAgLy8gVGhlIHNsYW50IG9mIHRoZSBjb25lIGlzIGNvbnN0YW50IGFjcm9zcyBpdHMgc3VyZmFjZVxuICAgIHZhciBzbGFudCA9IE1hdGguYXRhbjIoYm90dG9tUmFkaXVzIC0gdG9wUmFkaXVzLCBoZWlnaHQpO1xuICAgIHZhciBjb3NTbGFudCA9IE1hdGguY29zKHNsYW50KTtcbiAgICB2YXIgc2luU2xhbnQgPSBNYXRoLnNpbihzbGFudCk7XG5cbiAgICB2YXIgc3RhcnQgPSB0b3BDYXAgPyAtMiA6IDA7XG4gICAgdmFyIGVuZCA9IHZlcnRpY2FsU3ViZGl2aXNpb25zICsgKGJvdHRvbUNhcCA/IDIgOiAwKTtcblxuICAgIGZvciAodmFyIHl5ID0gc3RhcnQ7IHl5IDw9IGVuZDsgKyt5eSkge1xuICAgICAgdmFyIHYgPSB5eSAvIHZlcnRpY2FsU3ViZGl2aXNpb25zO1xuICAgICAgdmFyIHkgPSBoZWlnaHQgKiB2O1xuICAgICAgdmFyIHJpbmdSYWRpdXM7XG4gICAgICBpZiAoeXkgPCAwKSB7XG4gICAgICAgIHkgPSAwO1xuICAgICAgICB2ID0gMTtcbiAgICAgICAgcmluZ1JhZGl1cyA9IGJvdHRvbVJhZGl1cztcbiAgICAgIH0gZWxzZSBpZiAoeXkgPiB2ZXJ0aWNhbFN1YmRpdmlzaW9ucykge1xuICAgICAgICB5ID0gaGVpZ2h0O1xuICAgICAgICB2ID0gMTtcbiAgICAgICAgcmluZ1JhZGl1cyA9IHRvcFJhZGl1cztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJpbmdSYWRpdXMgPSBib3R0b21SYWRpdXMgK1xuICAgICAgICAgICh0b3BSYWRpdXMgLSBib3R0b21SYWRpdXMpICogKHl5IC8gdmVydGljYWxTdWJkaXZpc2lvbnMpO1xuICAgICAgfVxuICAgICAgaWYgKHl5ID09PSAtMiB8fCB5eSA9PT0gdmVydGljYWxTdWJkaXZpc2lvbnMgKyAyKSB7XG4gICAgICAgIHJpbmdSYWRpdXMgPSAwO1xuICAgICAgICB2ID0gMDtcbiAgICAgIH1cbiAgICAgIHkgLT0gaGVpZ2h0IC8gMjtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCB2ZXJ0c0Fyb3VuZEVkZ2U7ICsraWkpIHtcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKGlpICogTWF0aC5QSSAqIDIgLyByYWRpYWxTdWJkaXZpc2lvbnMpO1xuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3MoaWkgKiBNYXRoLlBJICogMiAvIHJhZGlhbFN1YmRpdmlzaW9ucyk7XG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKHNpbiAqIHJpbmdSYWRpdXMsIHksIGNvcyAqIHJpbmdSYWRpdXMpO1xuICAgICAgICBub3JtYWxzLnB1c2goXG4gICAgICAgICAgICAoeXkgPCAwIHx8IHl5ID4gdmVydGljYWxTdWJkaXZpc2lvbnMpID8gMCA6IChzaW4gKiBjb3NTbGFudCksXG4gICAgICAgICAgICAoeXkgPCAwKSA/IC0xIDogKHl5ID4gdmVydGljYWxTdWJkaXZpc2lvbnMgPyAxIDogc2luU2xhbnQpLFxuICAgICAgICAgICAgKHl5IDwgMCB8fCB5eSA+IHZlcnRpY2FsU3ViZGl2aXNpb25zKSA/IDAgOiAoY29zICogY29zU2xhbnQpKTtcbiAgICAgICAgdGV4Y29vcmRzLnB1c2goKGlpIC8gcmFkaWFsU3ViZGl2aXNpb25zKSwgMSAtIHYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIHl5ID0gMDsgeXkgPCB2ZXJ0aWNhbFN1YmRpdmlzaW9ucyArIGV4dHJhOyArK3l5KSB7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgcmFkaWFsU3ViZGl2aXNpb25zOyArK2lpKSB7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGluZGljZXMucHVzaCh2ZXJ0c0Fyb3VuZEVkZ2UgKiAoeXkgKyAwKSArIDAgKyBpaSxcbiAgICAgICAgICAgICAgICAgICAgIHZlcnRzQXJvdW5kRWRnZSAqICh5eSArIDApICsgMSArIGlpLFxuICAgICAgICAgICAgICAgICAgICAgdmVydHNBcm91bmRFZGdlICogKHl5ICsgMSkgKyAxICsgaWkpO1xuICAgICAgICBpbmRpY2VzLnB1c2godmVydHNBcm91bmRFZGdlICogKHl5ICsgMCkgKyAwICsgaWksXG4gICAgICAgICAgICAgICAgICAgICB2ZXJ0c0Fyb3VuZEVkZ2UgKiAoeXkgKyAxKSArIDEgKyBpaSxcbiAgICAgICAgICAgICAgICAgICAgIHZlcnRzQXJvdW5kRWRnZSAqICh5eSArIDEpICsgMCArIGlpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IHBvc2l0aW9ucyxcbiAgICAgIG5vcm1hbDogbm9ybWFscyxcbiAgICAgIHRleGNvb3JkOiB0ZXhjb29yZHMsXG4gICAgICBpbmRpY2VzOiBpbmRpY2VzLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyBSTEUgZGF0YVxuICAgKiBAcGFyYW0ge251bWJlcltdfSBybGVEYXRhIGRhdGEgaW4gZm9ybWF0IG9mIHJ1bi1sZW5ndGgsIHgsIHksIHosIHJ1bi1sZW5ndGgsIHgsIHksIHpcbiAgICogQHBhcmFtIHtudW1iZXJbXX0gW3BhZGRpbmddIHZhbHVlIHRvIGFkZCBlYWNoIGVudHJ5IHdpdGguXG4gICAqIEByZXR1cm4ge251bWJlcltdfSB0aGUgZXhwYW5kZWQgcmxlRGF0YVxuICAgKi9cbiAgZnVuY3Rpb24gZXhwYW5kUkxFRGF0YShybGVEYXRhLCBwYWRkaW5nKSB7XG4gICAgcGFkZGluZyA9IHBhZGRpbmcgfHwgW107XG4gICAgdmFyIGRhdGEgPSBbXTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgcmxlRGF0YS5sZW5ndGg7IGlpICs9IDQpIHtcbiAgICAgIHZhciBydW5MZW5ndGggPSBybGVEYXRhW2lpXTtcbiAgICAgIHZhciBlbGVtZW50ID0gcmxlRGF0YS5zbGljZShpaSArIDEsIGlpICsgNCk7XG4gICAgICBlbGVtZW50LnB1c2guYXBwbHkoZWxlbWVudCwgcGFkZGluZyk7XG4gICAgICBmb3IgKHZhciBqaiA9IDA7IGpqIDwgcnVuTGVuZ3RoOyArK2pqKSB7XG4gICAgICAgIGRhdGEucHVzaC5hcHBseShkYXRhLCBlbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyAzRCAnRicgQnVmZmVySW5mby5cbiAgICogQW4gJ0YnIGlzIHVzZWZ1bCBiZWNhdXNlIHlvdSBjYW4gZWFzaWx5IHRlbGwgd2hpY2ggd2F5IGl0IGlzIG9yaWVudGVkLlxuICAgKiBUaGUgY3JlYXRlZCAnRicgaGFzIHBvc2l0aW9uLCBub3JtYWwsIHRleGNvb3JkLCBhbmQgY29sb3IgYnVmZmVycy5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IFRoZSBjcmVhdGVkIEJ1ZmZlckluZm8uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGUzREZCdWZmZXJJbmZvXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIDNEICdGJyBidWZmZXJzLlxuICAgKiBBbiAnRicgaXMgdXNlZnVsIGJlY2F1c2UgeW91IGNhbiBlYXNpbHkgdGVsbCB3aGljaCB3YXkgaXQgaXMgb3JpZW50ZWQuXG4gICAqIFRoZSBjcmVhdGVkICdGJyBoYXMgcG9zaXRpb24sIG5vcm1hbCwgdGV4Y29vcmQsIGFuZCBjb2xvciBidWZmZXJzLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFdlYkdMQnVmZmVyPn0gVGhlIGNyZWF0ZWQgYnVmZmVycy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZTNERkJ1ZmZlcnNcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgM0QgJ0YnIHZlcnRpY2VzLlxuICAgKiBBbiAnRicgaXMgdXNlZnVsIGJlY2F1c2UgeW91IGNhbiBlYXNpbHkgdGVsbCB3aGljaCB3YXkgaXQgaXMgb3JpZW50ZWQuXG4gICAqIFRoZSBjcmVhdGVkICdGJyBoYXMgcG9zaXRpb24sIG5vcm1hbCwgdGV4Y29vcmQsIGFuZCBjb2xvciBhcnJheXMuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBUeXBlZEFycmF5Pn0gVGhlIGNyZWF0ZWQgdmVydGljZXMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGUzREZWZXJ0aWNlcygpIHtcblxuICAgIHZhciBwb3NpdGlvbnMgPSBbXG4gICAgICAvLyBsZWZ0IGNvbHVtbiBmcm9udFxuICAgICAgMCwgICAwLCAgMCxcbiAgICAgIDAsIDE1MCwgIDAsXG4gICAgICAzMCwgICAwLCAgMCxcbiAgICAgIDAsIDE1MCwgIDAsXG4gICAgICAzMCwgMTUwLCAgMCxcbiAgICAgIDMwLCAgIDAsICAwLFxuXG4gICAgICAvLyB0b3AgcnVuZyBmcm9udFxuICAgICAgMzAsICAgMCwgIDAsXG4gICAgICAzMCwgIDMwLCAgMCxcbiAgICAgIDEwMCwgICAwLCAgMCxcbiAgICAgIDMwLCAgMzAsICAwLFxuICAgICAgMTAwLCAgMzAsICAwLFxuICAgICAgMTAwLCAgIDAsICAwLFxuXG4gICAgICAvLyBtaWRkbGUgcnVuZyBmcm9udFxuICAgICAgMzAsICA2MCwgIDAsXG4gICAgICAzMCwgIDkwLCAgMCxcbiAgICAgIDY3LCAgNjAsICAwLFxuICAgICAgMzAsICA5MCwgIDAsXG4gICAgICA2NywgIDkwLCAgMCxcbiAgICAgIDY3LCAgNjAsICAwLFxuXG4gICAgICAvLyBsZWZ0IGNvbHVtbiBiYWNrXG4gICAgICAgIDAsICAgMCwgIDMwLFxuICAgICAgIDMwLCAgIDAsICAzMCxcbiAgICAgICAgMCwgMTUwLCAgMzAsXG4gICAgICAgIDAsIDE1MCwgIDMwLFxuICAgICAgIDMwLCAgIDAsICAzMCxcbiAgICAgICAzMCwgMTUwLCAgMzAsXG5cbiAgICAgIC8vIHRvcCBydW5nIGJhY2tcbiAgICAgICAzMCwgICAwLCAgMzAsXG4gICAgICAxMDAsICAgMCwgIDMwLFxuICAgICAgIDMwLCAgMzAsICAzMCxcbiAgICAgICAzMCwgIDMwLCAgMzAsXG4gICAgICAxMDAsICAgMCwgIDMwLFxuICAgICAgMTAwLCAgMzAsICAzMCxcblxuICAgICAgLy8gbWlkZGxlIHJ1bmcgYmFja1xuICAgICAgIDMwLCAgNjAsICAzMCxcbiAgICAgICA2NywgIDYwLCAgMzAsXG4gICAgICAgMzAsICA5MCwgIDMwLFxuICAgICAgIDMwLCAgOTAsICAzMCxcbiAgICAgICA2NywgIDYwLCAgMzAsXG4gICAgICAgNjcsICA5MCwgIDMwLFxuXG4gICAgICAvLyB0b3BcbiAgICAgICAgMCwgICAwLCAgIDAsXG4gICAgICAxMDAsICAgMCwgICAwLFxuICAgICAgMTAwLCAgIDAsICAzMCxcbiAgICAgICAgMCwgICAwLCAgIDAsXG4gICAgICAxMDAsICAgMCwgIDMwLFxuICAgICAgICAwLCAgIDAsICAzMCxcblxuICAgICAgLy8gdG9wIHJ1bmcgZnJvbnRcbiAgICAgIDEwMCwgICAwLCAgIDAsXG4gICAgICAxMDAsICAzMCwgICAwLFxuICAgICAgMTAwLCAgMzAsICAzMCxcbiAgICAgIDEwMCwgICAwLCAgIDAsXG4gICAgICAxMDAsICAzMCwgIDMwLFxuICAgICAgMTAwLCAgIDAsICAzMCxcblxuICAgICAgLy8gdW5kZXIgdG9wIHJ1bmdcbiAgICAgIDMwLCAgIDMwLCAgIDAsXG4gICAgICAzMCwgICAzMCwgIDMwLFxuICAgICAgMTAwLCAgMzAsICAzMCxcbiAgICAgIDMwLCAgIDMwLCAgIDAsXG4gICAgICAxMDAsICAzMCwgIDMwLFxuICAgICAgMTAwLCAgMzAsICAgMCxcblxuICAgICAgLy8gYmV0d2VlbiB0b3AgcnVuZyBhbmQgbWlkZGxlXG4gICAgICAzMCwgICAzMCwgICAwLFxuICAgICAgMzAsICAgNjAsICAzMCxcbiAgICAgIDMwLCAgIDMwLCAgMzAsXG4gICAgICAzMCwgICAzMCwgICAwLFxuICAgICAgMzAsICAgNjAsICAgMCxcbiAgICAgIDMwLCAgIDYwLCAgMzAsXG5cbiAgICAgIC8vIHRvcCBvZiBtaWRkbGUgcnVuZ1xuICAgICAgMzAsICAgNjAsICAgMCxcbiAgICAgIDY3LCAgIDYwLCAgMzAsXG4gICAgICAzMCwgICA2MCwgIDMwLFxuICAgICAgMzAsICAgNjAsICAgMCxcbiAgICAgIDY3LCAgIDYwLCAgIDAsXG4gICAgICA2NywgICA2MCwgIDMwLFxuXG4gICAgICAvLyBmcm9udCBvZiBtaWRkbGUgcnVuZ1xuICAgICAgNjcsICAgNjAsICAgMCxcbiAgICAgIDY3LCAgIDkwLCAgMzAsXG4gICAgICA2NywgICA2MCwgIDMwLFxuICAgICAgNjcsICAgNjAsICAgMCxcbiAgICAgIDY3LCAgIDkwLCAgIDAsXG4gICAgICA2NywgICA5MCwgIDMwLFxuXG4gICAgICAvLyBib3R0b20gb2YgbWlkZGxlIHJ1bmcuXG4gICAgICAzMCwgICA5MCwgICAwLFxuICAgICAgMzAsICAgOTAsICAzMCxcbiAgICAgIDY3LCAgIDkwLCAgMzAsXG4gICAgICAzMCwgICA5MCwgICAwLFxuICAgICAgNjcsICAgOTAsICAzMCxcbiAgICAgIDY3LCAgIDkwLCAgIDAsXG5cbiAgICAgIC8vIGZyb250IG9mIGJvdHRvbVxuICAgICAgMzAsICAgOTAsICAgMCxcbiAgICAgIDMwLCAgMTUwLCAgMzAsXG4gICAgICAzMCwgICA5MCwgIDMwLFxuICAgICAgMzAsICAgOTAsICAgMCxcbiAgICAgIDMwLCAgMTUwLCAgIDAsXG4gICAgICAzMCwgIDE1MCwgIDMwLFxuXG4gICAgICAvLyBib3R0b21cbiAgICAgIDAsICAgMTUwLCAgIDAsXG4gICAgICAwLCAgIDE1MCwgIDMwLFxuICAgICAgMzAsICAxNTAsICAzMCxcbiAgICAgIDAsICAgMTUwLCAgIDAsXG4gICAgICAzMCwgIDE1MCwgIDMwLFxuICAgICAgMzAsICAxNTAsICAgMCxcblxuICAgICAgLy8gbGVmdCBzaWRlXG4gICAgICAwLCAgIDAsICAgMCxcbiAgICAgIDAsICAgMCwgIDMwLFxuICAgICAgMCwgMTUwLCAgMzAsXG4gICAgICAwLCAgIDAsICAgMCxcbiAgICAgIDAsIDE1MCwgIDMwLFxuICAgICAgMCwgMTUwLCAgIDAsXG4gICAgXTtcblxuICAgIHZhciB0ZXhjb29yZHMgPSBbXG4gICAgICAvLyBsZWZ0IGNvbHVtbiBmcm9udFxuICAgICAgMC4yMiwgMC4xOSxcbiAgICAgIDAuMjIsIDAuNzksXG4gICAgICAwLjM0LCAwLjE5LFxuICAgICAgMC4yMiwgMC43OSxcbiAgICAgIDAuMzQsIDAuNzksXG4gICAgICAwLjM0LCAwLjE5LFxuXG4gICAgICAvLyB0b3AgcnVuZyBmcm9udFxuICAgICAgMC4zNCwgMC4xOSxcbiAgICAgIDAuMzQsIDAuMzEsXG4gICAgICAwLjYyLCAwLjE5LFxuICAgICAgMC4zNCwgMC4zMSxcbiAgICAgIDAuNjIsIDAuMzEsXG4gICAgICAwLjYyLCAwLjE5LFxuXG4gICAgICAvLyBtaWRkbGUgcnVuZyBmcm9udFxuICAgICAgMC4zNCwgMC40MyxcbiAgICAgIDAuMzQsIDAuNTUsXG4gICAgICAwLjQ5LCAwLjQzLFxuICAgICAgMC4zNCwgMC41NSxcbiAgICAgIDAuNDksIDAuNTUsXG4gICAgICAwLjQ5LCAwLjQzLFxuXG4gICAgICAvLyBsZWZ0IGNvbHVtbiBiYWNrXG4gICAgICAwLCAwLFxuICAgICAgMSwgMCxcbiAgICAgIDAsIDEsXG4gICAgICAwLCAxLFxuICAgICAgMSwgMCxcbiAgICAgIDEsIDEsXG5cbiAgICAgIC8vIHRvcCBydW5nIGJhY2tcbiAgICAgIDAsIDAsXG4gICAgICAxLCAwLFxuICAgICAgMCwgMSxcbiAgICAgIDAsIDEsXG4gICAgICAxLCAwLFxuICAgICAgMSwgMSxcblxuICAgICAgLy8gbWlkZGxlIHJ1bmcgYmFja1xuICAgICAgMCwgMCxcbiAgICAgIDEsIDAsXG4gICAgICAwLCAxLFxuICAgICAgMCwgMSxcbiAgICAgIDEsIDAsXG4gICAgICAxLCAxLFxuXG4gICAgICAvLyB0b3BcbiAgICAgIDAsIDAsXG4gICAgICAxLCAwLFxuICAgICAgMSwgMSxcbiAgICAgIDAsIDAsXG4gICAgICAxLCAxLFxuICAgICAgMCwgMSxcblxuICAgICAgLy8gdG9wIHJ1bmcgZnJvbnRcbiAgICAgIDAsIDAsXG4gICAgICAxLCAwLFxuICAgICAgMSwgMSxcbiAgICAgIDAsIDAsXG4gICAgICAxLCAxLFxuICAgICAgMCwgMSxcblxuICAgICAgLy8gdW5kZXIgdG9wIHJ1bmdcbiAgICAgIDAsIDAsXG4gICAgICAwLCAxLFxuICAgICAgMSwgMSxcbiAgICAgIDAsIDAsXG4gICAgICAxLCAxLFxuICAgICAgMSwgMCxcblxuICAgICAgLy8gYmV0d2VlbiB0b3AgcnVuZyBhbmQgbWlkZGxlXG4gICAgICAwLCAwLFxuICAgICAgMSwgMSxcbiAgICAgIDAsIDEsXG4gICAgICAwLCAwLFxuICAgICAgMSwgMCxcbiAgICAgIDEsIDEsXG5cbiAgICAgIC8vIHRvcCBvZiBtaWRkbGUgcnVuZ1xuICAgICAgMCwgMCxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAxLFxuICAgICAgMCwgMCxcbiAgICAgIDEsIDAsXG4gICAgICAxLCAxLFxuXG4gICAgICAvLyBmcm9udCBvZiBtaWRkbGUgcnVuZ1xuICAgICAgMCwgMCxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAxLFxuICAgICAgMCwgMCxcbiAgICAgIDEsIDAsXG4gICAgICAxLCAxLFxuXG4gICAgICAvLyBib3R0b20gb2YgbWlkZGxlIHJ1bmcuXG4gICAgICAwLCAwLFxuICAgICAgMCwgMSxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAwLFxuICAgICAgMSwgMSxcbiAgICAgIDEsIDAsXG5cbiAgICAgIC8vIGZyb250IG9mIGJvdHRvbVxuICAgICAgMCwgMCxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAxLFxuICAgICAgMCwgMCxcbiAgICAgIDEsIDAsXG4gICAgICAxLCAxLFxuXG4gICAgICAvLyBib3R0b21cbiAgICAgIDAsIDAsXG4gICAgICAwLCAxLFxuICAgICAgMSwgMSxcbiAgICAgIDAsIDAsXG4gICAgICAxLCAxLFxuICAgICAgMSwgMCxcblxuICAgICAgLy8gbGVmdCBzaWRlXG4gICAgICAwLCAwLFxuICAgICAgMCwgMSxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAwLFxuICAgICAgMSwgMSxcbiAgICAgIDEsIDAsXG4gICAgXTtcblxuICAgIHZhciBub3JtYWxzID0gZXhwYW5kUkxFRGF0YShbXG4gICAgICAvLyBsZWZ0IGNvbHVtbiBmcm9udFxuICAgICAgLy8gdG9wIHJ1bmcgZnJvbnRcbiAgICAgIC8vIG1pZGRsZSBydW5nIGZyb250XG4gICAgICAxOCwgMCwgMCwgMSxcblxuICAgICAgLy8gbGVmdCBjb2x1bW4gYmFja1xuICAgICAgLy8gdG9wIHJ1bmcgYmFja1xuICAgICAgLy8gbWlkZGxlIHJ1bmcgYmFja1xuICAgICAgMTgsIDAsIDAsIC0xLFxuXG4gICAgICAvLyB0b3BcbiAgICAgIDYsIDAsIDEsIDAsXG5cbiAgICAgIC8vIHRvcCBydW5nIGZyb250XG4gICAgICA2LCAxLCAwLCAwLFxuXG4gICAgICAvLyB1bmRlciB0b3AgcnVuZ1xuICAgICAgNiwgMCwgLTEsIDAsXG5cbiAgICAgIC8vIGJldHdlZW4gdG9wIHJ1bmcgYW5kIG1pZGRsZVxuICAgICAgNiwgMSwgMCwgMCxcblxuICAgICAgLy8gdG9wIG9mIG1pZGRsZSBydW5nXG4gICAgICA2LCAwLCAxLCAwLFxuXG4gICAgICAvLyBmcm9udCBvZiBtaWRkbGUgcnVuZ1xuICAgICAgNiwgMSwgMCwgMCxcblxuICAgICAgLy8gYm90dG9tIG9mIG1pZGRsZSBydW5nLlxuICAgICAgNiwgMCwgLTEsIDAsXG5cbiAgICAgIC8vIGZyb250IG9mIGJvdHRvbVxuICAgICAgNiwgMSwgMCwgMCxcblxuICAgICAgLy8gYm90dG9tXG4gICAgICA2LCAwLCAtMSwgMCxcblxuICAgICAgLy8gbGVmdCBzaWRlXG4gICAgICA2LCAtMSwgMCwgMCxcbiAgICBdKTtcblxuICAgIHZhciBjb2xvcnMgPSBleHBhbmRSTEVEYXRhKFtcbiAgICAgICAgICAvLyBsZWZ0IGNvbHVtbiBmcm9udFxuICAgICAgICAgIC8vIHRvcCBydW5nIGZyb250XG4gICAgICAgICAgLy8gbWlkZGxlIHJ1bmcgZnJvbnRcbiAgICAgICAgMTgsIDIwMCwgIDcwLCAxMjAsXG5cbiAgICAgICAgICAvLyBsZWZ0IGNvbHVtbiBiYWNrXG4gICAgICAgICAgLy8gdG9wIHJ1bmcgYmFja1xuICAgICAgICAgIC8vIG1pZGRsZSBydW5nIGJhY2tcbiAgICAgICAgMTgsIDgwLCA3MCwgMjAwLFxuXG4gICAgICAgICAgLy8gdG9wXG4gICAgICAgIDYsIDcwLCAyMDAsIDIxMCxcblxuICAgICAgICAgIC8vIHRvcCBydW5nIGZyb250XG4gICAgICAgIDYsIDIwMCwgMjAwLCA3MCxcblxuICAgICAgICAgIC8vIHVuZGVyIHRvcCBydW5nXG4gICAgICAgIDYsIDIxMCwgMTAwLCA3MCxcblxuICAgICAgICAgIC8vIGJldHdlZW4gdG9wIHJ1bmcgYW5kIG1pZGRsZVxuICAgICAgICA2LCAyMTAsIDE2MCwgNzAsXG5cbiAgICAgICAgICAvLyB0b3Agb2YgbWlkZGxlIHJ1bmdcbiAgICAgICAgNiwgNzAsIDE4MCwgMjEwLFxuXG4gICAgICAgICAgLy8gZnJvbnQgb2YgbWlkZGxlIHJ1bmdcbiAgICAgICAgNiwgMTAwLCA3MCwgMjEwLFxuXG4gICAgICAgICAgLy8gYm90dG9tIG9mIG1pZGRsZSBydW5nLlxuICAgICAgICA2LCA3NiwgMjEwLCAxMDAsXG5cbiAgICAgICAgICAvLyBmcm9udCBvZiBib3R0b21cbiAgICAgICAgNiwgMTQwLCAyMTAsIDgwLFxuXG4gICAgICAgICAgLy8gYm90dG9tXG4gICAgICAgIDYsIDkwLCAxMzAsIDExMCxcblxuICAgICAgICAgIC8vIGxlZnQgc2lkZVxuICAgICAgICA2LCAxNjAsIDE2MCwgMjIwLFxuICAgIF0sIFsyNTVdKTtcblxuICAgIHZhciBudW1WZXJ0cyA9IHBvc2l0aW9ucy5sZW5ndGggLyAzO1xuXG4gICAgdmFyIGFycmF5cyA9IHtcbiAgICAgIHBvc2l0aW9uOiBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRzKSxcbiAgICAgIHRleGNvb3JkOiBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDIsICBudW1WZXJ0cyksXG4gICAgICBub3JtYWw6IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgbnVtVmVydHMpLFxuICAgICAgY29sb3I6IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoNCwgbnVtVmVydHMsIFVpbnQ4QXJyYXkpLFxuICAgICAgaW5kaWNlczogY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0cyAvIDMsIFVpbnQxNkFycmF5KSxcbiAgICB9O1xuXG4gICAgYXJyYXlzLnBvc2l0aW9uLnB1c2gocG9zaXRpb25zKTtcbiAgICBhcnJheXMudGV4Y29vcmQucHVzaCh0ZXhjb29yZHMpO1xuICAgIGFycmF5cy5ub3JtYWwucHVzaChub3JtYWxzKTtcbiAgICBhcnJheXMuY29sb3IucHVzaChjb2xvcnMpO1xuXG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bVZlcnRzOyArK2lpKSB7XG4gICAgICBhcnJheXMuaW5kaWNlcy5wdXNoKGlpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgY3Jlc2VudCBCdWZmZXJJbmZvLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsUmFkaXVzIFRoZSB2ZXJ0aWNhbCByYWRpdXMgb2YgdGhlIGNyZXNlbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvdXRlclJhZGl1cyBUaGUgb3V0ZXIgcmFkaXVzIG9mIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5uZXJSYWRpdXMgVGhlIGlubmVyIHJhZGl1cyBvZiB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRoaWNrbmVzcyBUaGUgdGhpY2tuZXNzIG9mIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zRG93biBudW1iZXIgb2Ygc3RlcHMgYXJvdW5kIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zVGhpY2sgbnVtYmVyIG9mIHZlcnRpY2FsbHkgb24gdGhlIGNyZXNlbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnRPZmZzZXRdIFdoZXJlIHRvIHN0YXJ0IGFyYy4gRGVmYXVsdCAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW2VuZE9mZnNldF0gV2hlcmUgdG8gZW5kIGFyZy4gRGVmYXVsdCAxLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBUaGUgY3JlYXRlZCBCdWZmZXJJbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlQ3Jlc2VudEJ1ZmZlckluZm9cbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgY3Jlc2VudCBidWZmZXJzLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsUmFkaXVzIFRoZSB2ZXJ0aWNhbCByYWRpdXMgb2YgdGhlIGNyZXNlbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvdXRlclJhZGl1cyBUaGUgb3V0ZXIgcmFkaXVzIG9mIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5uZXJSYWRpdXMgVGhlIGlubmVyIHJhZGl1cyBvZiB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRoaWNrbmVzcyBUaGUgdGhpY2tuZXNzIG9mIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zRG93biBudW1iZXIgb2Ygc3RlcHMgYXJvdW5kIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zVGhpY2sgbnVtYmVyIG9mIHZlcnRpY2FsbHkgb24gdGhlIGNyZXNlbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnRPZmZzZXRdIFdoZXJlIHRvIHN0YXJ0IGFyYy4gRGVmYXVsdCAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW2VuZE9mZnNldF0gV2hlcmUgdG8gZW5kIGFyZy4gRGVmYXVsdCAxLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgV2ViR0xCdWZmZXI+fSBUaGUgY3JlYXRlZCBidWZmZXJzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlQ3Jlc2VudEJ1ZmZlcnNcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgY3Jlc2VudCB2ZXJ0aWNlcy5cbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsUmFkaXVzIFRoZSB2ZXJ0aWNhbCByYWRpdXMgb2YgdGhlIGNyZXNlbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBvdXRlclJhZGl1cyBUaGUgb3V0ZXIgcmFkaXVzIG9mIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5uZXJSYWRpdXMgVGhlIGlubmVyIHJhZGl1cyBvZiB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRoaWNrbmVzcyBUaGUgdGhpY2tuZXNzIG9mIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zRG93biBudW1iZXIgb2Ygc3RlcHMgYXJvdW5kIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zVGhpY2sgbnVtYmVyIG9mIHZlcnRpY2FsbHkgb24gdGhlIGNyZXNlbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnRPZmZzZXRdIFdoZXJlIHRvIHN0YXJ0IGFyYy4gRGVmYXVsdCAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW2VuZE9mZnNldF0gV2hlcmUgdG8gZW5kIGFyZy4gRGVmYXVsdCAxLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgVHlwZWRBcnJheT59IFRoZSBjcmVhdGVkIHZlcnRpY2VzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgIGZ1bmN0aW9uIGNyZWF0ZUNyZXNlbnRWZXJ0aWNlcyhcbiAgICAgIHZlcnRpY2FsUmFkaXVzLFxuICAgICAgb3V0ZXJSYWRpdXMsXG4gICAgICBpbm5lclJhZGl1cyxcbiAgICAgIHRoaWNrbmVzcyxcbiAgICAgIHN1YmRpdmlzaW9uc0Rvd24sXG4gICAgICBzdGFydE9mZnNldCxcbiAgICAgIGVuZE9mZnNldCkge1xuICAgIGlmIChzdWJkaXZpc2lvbnNEb3duIDw9IDApIHtcbiAgICAgIHRocm93IEVycm9yKCdzdWJkaXZpc2lvbkRvd24gbXVzdCBiZSA+IDAnKTtcbiAgICB9XG5cbiAgICBzdGFydE9mZnNldCA9IHN0YXJ0T2Zmc2V0IHx8IDA7XG4gICAgZW5kT2Zmc2V0ICAgPSBlbmRPZmZzZXQgfHwgMTtcblxuICAgIHZhciBzdWJkaXZpc2lvbnNUaGljayA9IDI7XG5cbiAgICB2YXIgb2Zmc2V0UmFuZ2UgPSBlbmRPZmZzZXQgLSBzdGFydE9mZnNldDtcbiAgICB2YXIgbnVtVmVydGljZXMgPSAoc3ViZGl2aXNpb25zRG93biArIDEpICogMiAqICgyICsgc3ViZGl2aXNpb25zVGhpY2spO1xuICAgIHZhciBwb3NpdGlvbnMgICA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgbnVtVmVydGljZXMpO1xuICAgIHZhciBub3JtYWxzICAgICA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgbnVtVmVydGljZXMpO1xuICAgIHZhciB0ZXhjb29yZHMgICA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMiwgbnVtVmVydGljZXMpO1xuXG4gICAgZnVuY3Rpb24gbGVycChhLCBiLCBzKSB7XG4gICAgICByZXR1cm4gYSArIChiIC0gYSkgKiBzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUFyYyhhcmNSYWRpdXMsIHgsIG5vcm1hbE11bHQsIG5vcm1hbEFkZCwgdU11bHQsIHVBZGQpIHtcbiAgICAgIGZvciAodmFyIHogPSAwOyB6IDw9IHN1YmRpdmlzaW9uc0Rvd247IHorKykge1xuICAgICAgICB2YXIgdUJhY2sgPSB4IC8gKHN1YmRpdmlzaW9uc1RoaWNrIC0gMSk7XG4gICAgICAgIHZhciB2ID0geiAvIHN1YmRpdmlzaW9uc0Rvd247XG4gICAgICAgIHZhciB4QmFjayA9ICh1QmFjayAtIDAuNSkgKiAyO1xuICAgICAgICB2YXIgYW5nbGUgPSAoc3RhcnRPZmZzZXQgKyAodiAqIG9mZnNldFJhbmdlKSkgKiBNYXRoLlBJO1xuICAgICAgICB2YXIgcyA9IE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgdmFyIGMgPSBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgIHZhciByYWRpdXMgPSBsZXJwKHZlcnRpY2FsUmFkaXVzLCBhcmNSYWRpdXMsIHMpO1xuICAgICAgICB2YXIgcHggPSB4QmFjayAqIHRoaWNrbmVzcztcbiAgICAgICAgdmFyIHB5ID0gYyAqIHZlcnRpY2FsUmFkaXVzO1xuICAgICAgICB2YXIgcHogPSBzICogcmFkaXVzO1xuICAgICAgICBwb3NpdGlvbnMucHVzaChweCwgcHksIHB6KTtcbiAgICAgICAgdmFyIG4gPSB2My5hZGQodjMubXVsdGlwbHkoWzAsIHMsIGNdLCBub3JtYWxNdWx0KSwgbm9ybWFsQWRkKTtcbiAgICAgICAgbm9ybWFscy5wdXNoKG4pO1xuICAgICAgICB0ZXhjb29yZHMucHVzaCh1QmFjayAqIHVNdWx0ICsgdUFkZCwgdik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgdGhlIGluZGl2aWR1YWwgdmVydGljZXMgaW4gb3VyIHZlcnRleCBidWZmZXIuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCBzdWJkaXZpc2lvbnNUaGljazsgeCsrKSB7XG4gICAgICB2YXIgdUJhY2sgPSAoeCAvIChzdWJkaXZpc2lvbnNUaGljayAtIDEpIC0gMC41KSAqIDI7XG4gICAgICBjcmVhdGVBcmMob3V0ZXJSYWRpdXMsIHgsIFsxLCAxLCAxXSwgWzAsICAgICAwLCAwXSwgMSwgMCk7XG4gICAgICBjcmVhdGVBcmMob3V0ZXJSYWRpdXMsIHgsIFswLCAwLCAwXSwgW3VCYWNrLCAwLCAwXSwgMCwgMCk7XG4gICAgICBjcmVhdGVBcmMoaW5uZXJSYWRpdXMsIHgsIFsxLCAxLCAxXSwgWzAsICAgICAwLCAwXSwgMSwgMCk7XG4gICAgICBjcmVhdGVBcmMoaW5uZXJSYWRpdXMsIHgsIFswLCAwLCAwXSwgW3VCYWNrLCAwLCAwXSwgMCwgMSk7XG4gICAgfVxuXG4gICAgLy8gRG8gb3V0ZXIgc3VyZmFjZS5cbiAgICB2YXIgaW5kaWNlcyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgKHN1YmRpdmlzaW9uc0Rvd24gKiAyKSAqICgyICsgc3ViZGl2aXNpb25zVGhpY2spLCBVaW50MTZBcnJheSk7XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTdXJmYWNlKGxlZnRBcmNPZmZzZXQsIHJpZ2h0QXJjT2Zmc2V0KSB7XG4gICAgICBmb3IgKHZhciB6ID0gMDsgeiA8IHN1YmRpdmlzaW9uc0Rvd247ICsreikge1xuICAgICAgICAvLyBNYWtlIHRyaWFuZ2xlIDEgb2YgcXVhZC5cbiAgICAgICAgaW5kaWNlcy5wdXNoKFxuICAgICAgICAgICAgbGVmdEFyY09mZnNldCArIHogKyAwLFxuICAgICAgICAgICAgbGVmdEFyY09mZnNldCArIHogKyAxLFxuICAgICAgICAgICAgcmlnaHRBcmNPZmZzZXQgKyB6ICsgMCk7XG5cbiAgICAgICAgLy8gTWFrZSB0cmlhbmdsZSAyIG9mIHF1YWQuXG4gICAgICAgIGluZGljZXMucHVzaChcbiAgICAgICAgICAgIGxlZnRBcmNPZmZzZXQgKyB6ICsgMSxcbiAgICAgICAgICAgIHJpZ2h0QXJjT2Zmc2V0ICsgeiArIDEsXG4gICAgICAgICAgICByaWdodEFyY09mZnNldCArIHogKyAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbnVtVmVydGljZXNEb3duID0gc3ViZGl2aXNpb25zRG93biArIDE7XG4gICAgLy8gZnJvbnRcbiAgICBjcmVhdGVTdXJmYWNlKG51bVZlcnRpY2VzRG93biAqIDAsIG51bVZlcnRpY2VzRG93biAqIDQpO1xuICAgIC8vIHJpZ2h0XG4gICAgY3JlYXRlU3VyZmFjZShudW1WZXJ0aWNlc0Rvd24gKiA1LCBudW1WZXJ0aWNlc0Rvd24gKiA3KTtcbiAgICAvLyBiYWNrXG4gICAgY3JlYXRlU3VyZmFjZShudW1WZXJ0aWNlc0Rvd24gKiA2LCBudW1WZXJ0aWNlc0Rvd24gKiAyKTtcbiAgICAvLyBsZWZ0XG4gICAgY3JlYXRlU3VyZmFjZShudW1WZXJ0aWNlc0Rvd24gKiAzLCBudW1WZXJ0aWNlc0Rvd24gKiAxKTtcblxuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25zLFxuICAgICAgbm9ybWFsOiAgIG5vcm1hbHMsXG4gICAgICB0ZXhjb29yZDogdGV4Y29vcmRzLFxuICAgICAgaW5kaWNlczogIGluZGljZXMsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGN5bGluZGVyIEJ1ZmZlckluZm8uIFRoZSBjeWxpbmRlciB3aWxsIGJlIGNyZWF0ZWQgYXJvdW5kIHRoZSBvcmlnaW5cbiAgICogYWxvbmcgdGhlIHktYXhpcy5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgUmFkaXVzIG9mIGN5bGluZGVyLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiBjeWxpbmRlci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlIGN5bGluZGVyLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmVydGljYWxTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgZG93biB0aGUgY3lsaW5kZXIuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3RvcENhcF0gQ3JlYXRlIHRvcCBjYXAuIERlZmF1bHQgPSB0cnVlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtib3R0b21DYXBdIENyZWF0ZSBib3R0b20gY2FwLiBEZWZhdWx0ID0gdHJ1ZS5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wuQnVmZmVySW5mb30gVGhlIGNyZWF0ZWQgQnVmZmVySW5mby5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZUN5bGluZGVyQnVmZmVySW5mb1xuICAgKi9cblxuICAgLyoqXG4gICAgKiBDcmVhdGVzIGN5bGluZGVyIGJ1ZmZlcnMuIFRoZSBjeWxpbmRlciB3aWxsIGJlIGNyZWF0ZWQgYXJvdW5kIHRoZSBvcmlnaW5cbiAgICAqIGFsb25nIHRoZSB5LWF4aXMuXG4gICAgKlxuICAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIFJhZGl1cyBvZiBjeWxpbmRlci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGN5bGluZGVyLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlIGN5bGluZGVyLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsU3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGRvd24gdGhlIGN5bGluZGVyLlxuICAgICogQHBhcmFtIHtib29sZWFufSBbdG9wQ2FwXSBDcmVhdGUgdG9wIGNhcC4gRGVmYXVsdCA9IHRydWUuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtib3R0b21DYXBdIENyZWF0ZSBib3R0b20gY2FwLiBEZWZhdWx0ID0gdHJ1ZS5cbiAgICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBXZWJHTEJ1ZmZlcj59IFRoZSBjcmVhdGVkIGJ1ZmZlcnMuXG4gICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgICogQGZ1bmN0aW9uIGNyZWF0ZUN5bGluZGVyQnVmZmVyc1xuICAgICovXG5cbiAgIC8qKlxuICAgICogQ3JlYXRlcyBjeWxpbmRlciB2ZXJ0aWNlcy4gVGhlIGN5bGluZGVyIHdpbGwgYmUgY3JlYXRlZCBhcm91bmQgdGhlIG9yaWdpblxuICAgICogYWxvbmcgdGhlIHktYXhpcy5cbiAgICAqXG4gICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIFJhZGl1cyBvZiBjeWxpbmRlci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGN5bGluZGVyLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlIGN5bGluZGVyLlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsU3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGRvd24gdGhlIGN5bGluZGVyLlxuICAgICogQHBhcmFtIHtib29sZWFufSBbdG9wQ2FwXSBDcmVhdGUgdG9wIGNhcC4gRGVmYXVsdCA9IHRydWUuXG4gICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtib3R0b21DYXBdIENyZWF0ZSBib3R0b20gY2FwLiBEZWZhdWx0ID0gdHJ1ZS5cbiAgICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBUeXBlZEFycmF5Pn0gVGhlIGNyZWF0ZWQgdmVydGljZXMuXG4gICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUN5bGluZGVyVmVydGljZXMoXG4gICAgICByYWRpdXMsXG4gICAgICBoZWlnaHQsXG4gICAgICByYWRpYWxTdWJkaXZpc2lvbnMsXG4gICAgICB2ZXJ0aWNhbFN1YmRpdmlzaW9ucyxcbiAgICAgIHRvcENhcCxcbiAgICAgIGJvdHRvbUNhcCkge1xuICAgIHJldHVybiBjcmVhdGVUcnVuY2F0ZWRDb25lVmVydGljZXMoXG4gICAgICAgIHJhZGl1cyxcbiAgICAgICAgcmFkaXVzLFxuICAgICAgICBoZWlnaHQsXG4gICAgICAgIHJhZGlhbFN1YmRpdmlzaW9ucyxcbiAgICAgICAgdmVydGljYWxTdWJkaXZpc2lvbnMsXG4gICAgICAgIHRvcENhcCxcbiAgICAgICAgYm90dG9tQ2FwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIEJ1ZmZlckluZm8gZm9yIGEgdG9ydXNcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgcmFkaXVzIG9mIGNlbnRlciBvZiB0b3J1cyBjaXJjbGUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aGlja25lc3MgcmFkaXVzIG9mIHRvcnVzIHJpbmcuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYWxTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgYXJvdW5kIHRoZSB0b3J1cy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJvZHlTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgYXJvdW5kIHRoZSBib2R5IHRvcnVzLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtzdGFydEFuZ2xlXSBzdGFydCBhbmdsZSBpbiByYWRpYW5zLiBEZWZhdWx0ID0gMC5cbiAgICogQHBhcmFtIHtib29sZWFufSBbZW5kQW5nbGVdIGVuZCBhbmdsZSBpbiByYWRpYW5zLiBEZWZhdWx0ID0gTWF0aC5QSSAqIDIuXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IFRoZSBjcmVhdGVkIEJ1ZmZlckluZm8uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVUb3J1c0J1ZmZlckluZm9cbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYnVmZmVycyBmb3IgYSB0b3J1c1xuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyByYWRpdXMgb2YgY2VudGVyIG9mIHRvcnVzIGNpcmNsZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRoaWNrbmVzcyByYWRpdXMgb2YgdG9ydXMgcmluZy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlIHRvcnVzLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYm9keVN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlIGJvZHkgdG9ydXMuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3N0YXJ0QW5nbGVdIHN0YXJ0IGFuZ2xlIGluIHJhZGlhbnMuIERlZmF1bHQgPSAwLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtlbmRBbmdsZV0gZW5kIGFuZ2xlIGluIHJhZGlhbnMuIERlZmF1bHQgPSBNYXRoLlBJICogMi5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFdlYkdMQnVmZmVyPn0gVGhlIGNyZWF0ZWQgYnVmZmVycy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZVRvcnVzQnVmZmVyc1xuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyB2ZXJ0aWNlcyBmb3IgYSB0b3J1c1xuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIHJhZGl1cyBvZiBjZW50ZXIgb2YgdG9ydXMgY2lyY2xlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdGhpY2tuZXNzIHJhZGl1cyBvZiB0b3J1cyByaW5nLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaWFsU3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGFyb3VuZCB0aGUgdG9ydXMuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib2R5U3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGFyb3VuZCB0aGUgYm9keSB0b3J1cy5cbiAgICogQHBhcmFtIHtib29sZWFufSBbc3RhcnRBbmdsZV0gc3RhcnQgYW5nbGUgaW4gcmFkaWFucy4gRGVmYXVsdCA9IDAuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2VuZEFuZ2xlXSBlbmQgYW5nbGUgaW4gcmFkaWFucy4gRGVmYXVsdCA9IE1hdGguUEkgKiAyLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgVHlwZWRBcnJheT59IFRoZSBjcmVhdGVkIHZlcnRpY2VzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlVG9ydXNWZXJ0aWNlcyhcbiAgICAgIHJhZGl1cyxcbiAgICAgIHRoaWNrbmVzcyxcbiAgICAgIHJhZGlhbFN1YmRpdmlzaW9ucyxcbiAgICAgIGJvZHlTdWJkaXZpc2lvbnMsXG4gICAgICBzdGFydEFuZ2xlLFxuICAgICAgZW5kQW5nbGUpIHtcbiAgICBpZiAocmFkaWFsU3ViZGl2aXNpb25zIDwgMykge1xuICAgICAgdGhyb3cgRXJyb3IoJ3JhZGlhbFN1YmRpdmlzaW9ucyBtdXN0IGJlIDMgb3IgZ3JlYXRlcicpO1xuICAgIH1cblxuICAgIGlmIChib2R5U3ViZGl2aXNpb25zIDwgMykge1xuICAgICAgdGhyb3cgRXJyb3IoJ3ZlcnRpY2FsU3ViZGl2aXNpb25zIG11c3QgYmUgMyBvciBncmVhdGVyJyk7XG4gICAgfVxuXG4gICAgc3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGUgfHwgMDtcbiAgICBlbmRBbmdsZSA9IGVuZEFuZ2xlIHx8IE1hdGguUEkgKiAyO1xuICAgIHJhbmdlID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlO1xuXG4gICAgdmFyIHJhZGlhbFBhcnRzID0gcmFkaWFsU3ViZGl2aXNpb25zICsgMTtcbiAgICB2YXIgYm9keVBhcnRzICAgPSBib2R5U3ViZGl2aXNpb25zICsgMTtcbiAgICB2YXIgbnVtVmVydGljZXMgPSByYWRpYWxQYXJ0cyAqIGJvZHlQYXJ0cztcbiAgICB2YXIgcG9zaXRpb25zICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgbm9ybWFscyAgICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgdGV4Y29vcmRzICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDIsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgaW5kaWNlcyAgICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIChyYWRpYWxTdWJkaXZpc2lvbnMpICogKGJvZHlTdWJkaXZpc2lvbnMpICogMiwgVWludDE2QXJyYXkpO1xuXG4gICAgZm9yICh2YXIgc2xpY2UgPSAwOyBzbGljZSA8IGJvZHlQYXJ0czsgKytzbGljZSkge1xuICAgICAgdmFyIHYgPSBzbGljZSAvIGJvZHlTdWJkaXZpc2lvbnM7XG4gICAgICB2YXIgc2xpY2VBbmdsZSA9IHYgKiBNYXRoLlBJICogMjtcbiAgICAgIHZhciBzbGljZVNpbiA9IE1hdGguc2luKHNsaWNlQW5nbGUpO1xuICAgICAgdmFyIHJpbmdSYWRpdXMgPSByYWRpdXMgKyBzbGljZVNpbiAqIHRoaWNrbmVzcztcbiAgICAgIHZhciBueSA9IE1hdGguY29zKHNsaWNlQW5nbGUpO1xuICAgICAgdmFyIHkgPSBueSAqIHRoaWNrbmVzcztcbiAgICAgIGZvciAodmFyIHJpbmcgPSAwOyByaW5nIDwgcmFkaWFsUGFydHM7ICsrcmluZykge1xuICAgICAgICB2YXIgdSA9IHJpbmcgLyByYWRpYWxTdWJkaXZpc2lvbnM7XG4gICAgICAgIHZhciByaW5nQW5nbGUgPSBzdGFydEFuZ2xlICsgdSAqIHJhbmdlO1xuICAgICAgICB2YXIgeFNpbiA9IE1hdGguc2luKHJpbmdBbmdsZSk7XG4gICAgICAgIHZhciB6Q29zID0gTWF0aC5jb3MocmluZ0FuZ2xlKTtcbiAgICAgICAgdmFyIHggPSB4U2luICogcmluZ1JhZGl1cztcbiAgICAgICAgdmFyIHogPSB6Q29zICogcmluZ1JhZGl1cztcbiAgICAgICAgdmFyIG54ID0geFNpbiAqIHNsaWNlU2luO1xuICAgICAgICB2YXIgbnogPSB6Q29zICogc2xpY2VTaW47XG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKHgsIHksIHopO1xuICAgICAgICBub3JtYWxzLnB1c2gobngsIG55LCBueik7XG4gICAgICAgIHRleGNvb3Jkcy5wdXNoKHUsIDEgLSB2KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBzbGljZSA9IDA7IHNsaWNlIDwgYm9keVN1YmRpdmlzaW9uczsgKytzbGljZSkgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgZm9yICh2YXIgcmluZyA9IDA7IHJpbmcgPCByYWRpYWxTdWJkaXZpc2lvbnM7ICsrcmluZykgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICB2YXIgbmV4dFJpbmdJbmRleCAgPSAxICsgcmluZztcbiAgICAgICAgdmFyIG5leHRTbGljZUluZGV4ID0gMSArIHNsaWNlO1xuICAgICAgICBpbmRpY2VzLnB1c2gocmFkaWFsUGFydHMgKiBzbGljZSAgICAgICAgICArIHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICByYWRpYWxQYXJ0cyAqIG5leHRTbGljZUluZGV4ICsgcmluZyxcbiAgICAgICAgICAgICAgICAgICAgIHJhZGlhbFBhcnRzICogc2xpY2UgICAgICAgICAgKyBuZXh0UmluZ0luZGV4KTtcbiAgICAgICAgaW5kaWNlcy5wdXNoKHJhZGlhbFBhcnRzICogbmV4dFNsaWNlSW5kZXggKyByaW5nLFxuICAgICAgICAgICAgICAgICAgICAgcmFkaWFsUGFydHMgKiBuZXh0U2xpY2VJbmRleCArIG5leHRSaW5nSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICByYWRpYWxQYXJ0cyAqIHNsaWNlICAgICAgICAgICsgbmV4dFJpbmdJbmRleCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbnMsXG4gICAgICBub3JtYWw6ICAgbm9ybWFscyxcbiAgICAgIHRleGNvb3JkOiB0ZXhjb29yZHMsXG4gICAgICBpbmRpY2VzOiAgaW5kaWNlcyxcbiAgICB9O1xuICB9XG5cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGRpc2MgQnVmZmVySW5mby4gVGhlIGRpc2Mgd2lsbCBiZSBpbiB0aGUgeHogcGxhbmUsIGNlbnRlcmVkIGF0XG4gICAqIHRoZSBvcmlnaW4uIFdoZW4gY3JlYXRpbmcsIGF0IGxlYXN0IDMgZGl2aXNpb25zLCBvciBwaWVcbiAgICogcGllY2VzLCBuZWVkIHRvIGJlIHNwZWNpZmllZCwgb3RoZXJ3aXNlIHRoZSB0cmlhbmdsZXMgbWFraW5nXG4gICAqIHVwIHRoZSBkaXNjIHdpbGwgYmUgZGVnZW5lcmF0ZS4gWW91IGNhbiBhbHNvIHNwZWNpZnkgdGhlXG4gICAqIG51bWJlciBvZiByYWRpYWwgcGllY2VzIGBzdGFja3NgLiBBIHZhbHVlIG9mIDEgZm9yXG4gICAqIHN0YWNrcyB3aWxsIGdpdmUgeW91IGEgc2ltcGxlIGRpc2Mgb2YgcGllIHBpZWNlcy4gIElmIHlvdVxuICAgKiB3YW50IHRvIGNyZWF0ZSBhbiBhbm51bHVzIHlvdSBjYW4gc2V0IGBpbm5lclJhZGl1c2AgdG8gYVxuICAgKiB2YWx1ZSA+IDAuIEZpbmFsbHksIGBzdGFja1Bvd2VyYCBhbGxvd3MgeW91IHRvIGhhdmUgdGhlIHdpZHRoc1xuICAgKiBpbmNyZWFzZSBvciBkZWNyZWFzZSBhcyB5b3UgbW92ZSBhd2F5IGZyb20gdGhlIGNlbnRlci4gVGhpc1xuICAgKiBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIHdoZW4gdXNpbmcgdGhlIGRpc2MgYXMgYSBncm91bmQgcGxhbmVcbiAgICogd2l0aCBhIGZpeGVkIGNhbWVyYSBzdWNoIHRoYXQgeW91IGRvbid0IG5lZWQgdGhlIHJlc29sdXRpb25cbiAgICogb2Ygc21hbGwgdHJpYW5nbGVzIG5lYXIgdGhlIHBlcmltZXRlci4gRm9yIGV4YW1wbGUsIGEgdmFsdWVcbiAgICogb2YgMiB3aWxsIHByb2R1Y2Ugc3RhY2tzIHdob3NlIG91c2lkZSByYWRpdXMgaW5jcmVhc2VzIHdpdGhcbiAgICogdGhlIHNxdWFyZSBvZiB0aGUgc3RhY2sgaW5kZXguIEEgdmFsdWUgb2YgMSB3aWxsIGdpdmUgdW5pZm9ybVxuICAgKiBzdGFja3MuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIFJhZGl1cyBvZiB0aGUgZ3JvdW5kIHBsYW5lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gZGl2aXNpb25zIE51bWJlciBvZiB0cmlhbmdsZXMgaW4gdGhlIGdyb3VuZCBwbGFuZSAoYXQgbGVhc3QgMykuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhY2tzXSBOdW1iZXIgb2YgcmFkaWFsIGRpdmlzaW9ucyAoZGVmYXVsdD0xKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtpbm5lclJhZGl1c10gRGVmYXVsdCAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YWNrUG93ZXJdIFBvd2VyIHRvIHJhaXNlIHN0YWNrIHNpemUgdG8gZm9yIGRlY3JlYXNpbmcgd2lkdGguXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IFRoZSBjcmVhdGVkIEJ1ZmZlckluZm8uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVEaXNjQnVmZmVySW5mb1xuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBkaXNjIGJ1ZmZlcnMuIFRoZSBkaXNjIHdpbGwgYmUgaW4gdGhlIHh6IHBsYW5lLCBjZW50ZXJlZCBhdFxuICAgKiB0aGUgb3JpZ2luLiBXaGVuIGNyZWF0aW5nLCBhdCBsZWFzdCAzIGRpdmlzaW9ucywgb3IgcGllXG4gICAqIHBpZWNlcywgbmVlZCB0byBiZSBzcGVjaWZpZWQsIG90aGVyd2lzZSB0aGUgdHJpYW5nbGVzIG1ha2luZ1xuICAgKiB1cCB0aGUgZGlzYyB3aWxsIGJlIGRlZ2VuZXJhdGUuIFlvdSBjYW4gYWxzbyBzcGVjaWZ5IHRoZVxuICAgKiBudW1iZXIgb2YgcmFkaWFsIHBpZWNlcyBgc3RhY2tzYC4gQSB2YWx1ZSBvZiAxIGZvclxuICAgKiBzdGFja3Mgd2lsbCBnaXZlIHlvdSBhIHNpbXBsZSBkaXNjIG9mIHBpZSBwaWVjZXMuICBJZiB5b3VcbiAgICogd2FudCB0byBjcmVhdGUgYW4gYW5udWx1cyB5b3UgY2FuIHNldCBgaW5uZXJSYWRpdXNgIHRvIGFcbiAgICogdmFsdWUgPiAwLiBGaW5hbGx5LCBgc3RhY2tQb3dlcmAgYWxsb3dzIHlvdSB0byBoYXZlIHRoZSB3aWR0aHNcbiAgICogaW5jcmVhc2Ugb3IgZGVjcmVhc2UgYXMgeW91IG1vdmUgYXdheSBmcm9tIHRoZSBjZW50ZXIuIFRoaXNcbiAgICogaXMgcGFydGljdWxhcmx5IHVzZWZ1bCB3aGVuIHVzaW5nIHRoZSBkaXNjIGFzIGEgZ3JvdW5kIHBsYW5lXG4gICAqIHdpdGggYSBmaXhlZCBjYW1lcmEgc3VjaCB0aGF0IHlvdSBkb24ndCBuZWVkIHRoZSByZXNvbHV0aW9uXG4gICAqIG9mIHNtYWxsIHRyaWFuZ2xlcyBuZWFyIHRoZSBwZXJpbWV0ZXIuIEZvciBleGFtcGxlLCBhIHZhbHVlXG4gICAqIG9mIDIgd2lsbCBwcm9kdWNlIHN0YWNrcyB3aG9zZSBvdXNpZGUgcmFkaXVzIGluY3JlYXNlcyB3aXRoXG4gICAqIHRoZSBzcXVhcmUgb2YgdGhlIHN0YWNrIGluZGV4LiBBIHZhbHVlIG9mIDEgd2lsbCBnaXZlIHVuaWZvcm1cbiAgICogc3RhY2tzLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyBSYWRpdXMgb2YgdGhlIGdyb3VuZCBwbGFuZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGRpdmlzaW9ucyBOdW1iZXIgb2YgdHJpYW5nbGVzIGluIHRoZSBncm91bmQgcGxhbmUgKGF0IGxlYXN0IDMpLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YWNrc10gTnVtYmVyIG9mIHJhZGlhbCBkaXZpc2lvbnMgKGRlZmF1bHQ9MSkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbaW5uZXJSYWRpdXNdIERlZmF1bHQgMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdGFja1Bvd2VyXSBQb3dlciB0byByYWlzZSBzdGFjayBzaXplIHRvIGZvciBkZWNyZWFzaW5nIHdpZHRoLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgV2ViR0xCdWZmZXI+fSBUaGUgY3JlYXRlZCBidWZmZXJzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlRGlzY0J1ZmZlcnNcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgZGlzYyB2ZXJ0aWNlcy4gVGhlIGRpc2Mgd2lsbCBiZSBpbiB0aGUgeHogcGxhbmUsIGNlbnRlcmVkIGF0XG4gICAqIHRoZSBvcmlnaW4uIFdoZW4gY3JlYXRpbmcsIGF0IGxlYXN0IDMgZGl2aXNpb25zLCBvciBwaWVcbiAgICogcGllY2VzLCBuZWVkIHRvIGJlIHNwZWNpZmllZCwgb3RoZXJ3aXNlIHRoZSB0cmlhbmdsZXMgbWFraW5nXG4gICAqIHVwIHRoZSBkaXNjIHdpbGwgYmUgZGVnZW5lcmF0ZS4gWW91IGNhbiBhbHNvIHNwZWNpZnkgdGhlXG4gICAqIG51bWJlciBvZiByYWRpYWwgcGllY2VzIGBzdGFja3NgLiBBIHZhbHVlIG9mIDEgZm9yXG4gICAqIHN0YWNrcyB3aWxsIGdpdmUgeW91IGEgc2ltcGxlIGRpc2Mgb2YgcGllIHBpZWNlcy4gIElmIHlvdVxuICAgKiB3YW50IHRvIGNyZWF0ZSBhbiBhbm51bHVzIHlvdSBjYW4gc2V0IGBpbm5lclJhZGl1c2AgdG8gYVxuICAgKiB2YWx1ZSA+IDAuIEZpbmFsbHksIGBzdGFja1Bvd2VyYCBhbGxvd3MgeW91IHRvIGhhdmUgdGhlIHdpZHRoc1xuICAgKiBpbmNyZWFzZSBvciBkZWNyZWFzZSBhcyB5b3UgbW92ZSBhd2F5IGZyb20gdGhlIGNlbnRlci4gVGhpc1xuICAgKiBpcyBwYXJ0aWN1bGFybHkgdXNlZnVsIHdoZW4gdXNpbmcgdGhlIGRpc2MgYXMgYSBncm91bmQgcGxhbmVcbiAgICogd2l0aCBhIGZpeGVkIGNhbWVyYSBzdWNoIHRoYXQgeW91IGRvbid0IG5lZWQgdGhlIHJlc29sdXRpb25cbiAgICogb2Ygc21hbGwgdHJpYW5nbGVzIG5lYXIgdGhlIHBlcmltZXRlci4gRm9yIGV4YW1wbGUsIGEgdmFsdWVcbiAgICogb2YgMiB3aWxsIHByb2R1Y2Ugc3RhY2tzIHdob3NlIG91c2lkZSByYWRpdXMgaW5jcmVhc2VzIHdpdGhcbiAgICogdGhlIHNxdWFyZSBvZiB0aGUgc3RhY2sgaW5kZXguIEEgdmFsdWUgb2YgMSB3aWxsIGdpdmUgdW5pZm9ybVxuICAgKiBzdGFja3MuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgUmFkaXVzIG9mIHRoZSBncm91bmQgcGxhbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXZpc2lvbnMgTnVtYmVyIG9mIHRyaWFuZ2xlcyBpbiB0aGUgZ3JvdW5kIHBsYW5lIChhdCBsZWFzdCAzKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdGFja3NdIE51bWJlciBvZiByYWRpYWwgZGl2aXNpb25zIChkZWZhdWx0PTEpLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW2lubmVyUmFkaXVzXSBEZWZhdWx0IDAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhY2tQb3dlcl0gUG93ZXIgdG8gcmFpc2Ugc3RhY2sgc2l6ZSB0byBmb3IgZGVjcmVhc2luZyB3aWR0aC5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+fSBUaGUgY3JlYXRlZCB2ZXJ0aWNlcy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZURpc2NWZXJ0aWNlcyhcbiAgICAgIHJhZGl1cyxcbiAgICAgIGRpdmlzaW9ucyxcbiAgICAgIHN0YWNrcyxcbiAgICAgIGlubmVyUmFkaXVzLFxuICAgICAgc3RhY2tQb3dlcikge1xuICAgIGlmIChkaXZpc2lvbnMgPCAzKSB7XG4gICAgICB0aHJvdyBFcnJvcignZGl2aXNpb25zIG11c3QgYmUgYXQgbGVhc3QgMycpO1xuICAgIH1cblxuICAgIHN0YWNrcyA9IHN0YWNrcyA/IHN0YWNrcyA6IDE7XG4gICAgc3RhY2tQb3dlciA9IHN0YWNrUG93ZXIgPyBzdGFja1Bvd2VyIDogMTtcbiAgICBpbm5lclJhZGl1cyA9IGlubmVyUmFkaXVzID8gaW5uZXJSYWRpdXMgOiAwO1xuXG4gICAgLy8gTm90ZTogV2UgZG9uJ3Qgc2hhcmUgdGhlIGNlbnRlciB2ZXJ0ZXggYmVjYXVzZSB0aGF0IHdvdWxkXG4gICAgLy8gbWVzcyB1cCB0ZXh0dXJlIGNvb3JkaW5hdGVzLlxuICAgIHZhciBudW1WZXJ0aWNlcyA9IChkaXZpc2lvbnMgKyAxKSAqIChzdGFja3MgKyAxKTtcblxuICAgIHZhciBwb3NpdGlvbnMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgbm9ybWFscyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIHRleGNvb3JkcyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMiwgbnVtVmVydGljZXMpO1xuICAgIHZhciBpbmRpY2VzICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIHN0YWNrcyAqIGRpdmlzaW9ucyAqIDIsIFVpbnQxNkFycmF5KTtcblxuICAgIHZhciBmaXJzdEluZGV4ID0gMDtcbiAgICB2YXIgcmFkaXVzU3BhbiA9IHJhZGl1cyAtIGlubmVyUmFkaXVzO1xuXG4gICAgLy8gQnVpbGQgdGhlIGRpc2sgb25lIHN0YWNrIGF0IGEgdGltZS5cbiAgICBmb3IgKHZhciBzdGFjayA9IDA7IHN0YWNrIDw9IHN0YWNrczsgKytzdGFjaykge1xuICAgICAgdmFyIHN0YWNrUmFkaXVzID0gaW5uZXJSYWRpdXMgKyByYWRpdXNTcGFuICogTWF0aC5wb3coc3RhY2sgLyBzdGFja3MsIHN0YWNrUG93ZXIpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBkaXZpc2lvbnM7ICsraSkge1xuICAgICAgICB2YXIgdGhldGEgPSAyLjAgKiBNYXRoLlBJICogaSAvIGRpdmlzaW9ucztcbiAgICAgICAgdmFyIHggPSBzdGFja1JhZGl1cyAqIE1hdGguY29zKHRoZXRhKTtcbiAgICAgICAgdmFyIHogPSBzdGFja1JhZGl1cyAqIE1hdGguc2luKHRoZXRhKTtcblxuICAgICAgICBwb3NpdGlvbnMucHVzaCh4LCAwLCB6KTtcbiAgICAgICAgbm9ybWFscy5wdXNoKDAsIDEsIDApO1xuICAgICAgICB0ZXhjb29yZHMucHVzaCgxIC0gKGkgLyBkaXZpc2lvbnMpLCBzdGFjayAvIHN0YWNrcyk7XG4gICAgICAgIGlmIChzdGFjayA+IDAgJiYgaSAhPT0gZGl2aXNpb25zKSB7XG4gICAgICAgICAgLy8gYSwgYiwgYyBhbmQgZCBhcmUgdGhlIGluZGljZXMgb2YgdGhlIHZlcnRpY2VzIG9mIGEgcXVhZC4gIHVubGVzc1xuICAgICAgICAgIC8vIHRoZSBjdXJyZW50IHN0YWNrIGlzIHRoZSBvbmUgY2xvc2VzdCB0byB0aGUgY2VudGVyLCBpbiB3aGljaCBjYXNlXG4gICAgICAgICAgLy8gdGhlIHZlcnRpY2VzIGEgYW5kIGIgY29ubmVjdCB0byB0aGUgY2VudGVyIHZlcnRleC5cbiAgICAgICAgICB2YXIgYSA9IGZpcnN0SW5kZXggKyAoaSArIDEpO1xuICAgICAgICAgIHZhciBiID0gZmlyc3RJbmRleCArIGk7XG4gICAgICAgICAgdmFyIGMgPSBmaXJzdEluZGV4ICsgaSAtIGRpdmlzaW9ucztcbiAgICAgICAgICB2YXIgZCA9IGZpcnN0SW5kZXggKyAoaSArIDEpIC0gZGl2aXNpb25zO1xuXG4gICAgICAgICAgLy8gTWFrZSBhIHF1YWQgb2YgdGhlIHZlcnRpY2VzIGEsIGIsIGMsIGQuXG4gICAgICAgICAgaW5kaWNlcy5wdXNoKGEsIGIsIGMpO1xuICAgICAgICAgIGluZGljZXMucHVzaChhLCBjLCBkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmaXJzdEluZGV4ICs9IGRpdmlzaW9ucyArIDE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbnMsXG4gICAgICBub3JtYWw6IG5vcm1hbHMsXG4gICAgICB0ZXhjb29yZDogdGV4Y29vcmRzLFxuICAgICAgaW5kaWNlczogaW5kaWNlcyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZXMgYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIDAgYW5kIHJhbmdlIC0gMSBpbmNsdXNpdmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYW5nZVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IHJhbmRvbSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIHJhbmdlIC0gMSBpbmNsdXNpdmUuXG4gICAqL1xuICBmdW5jdGlvbiByYW5kSW50KHJhbmdlKSB7XG4gICAgcmV0dXJuIE1hdGgucmFuZG9tKCkgKiByYW5nZSB8IDA7XG4gIH1cblxuICAvKipcbiAgICogVXNlZCB0byBzdXBwbHkgcmFuZG9tIGNvbG9yc1xuICAgKiBAY2FsbGJhY2sgUmFuZG9tQ29sb3JGdW5jXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBuZHggaW5kZXggb2YgdHJpYW5nbGUvcXVhZCBpZiB1bmluZGV4ZWQgb3IgaW5kZXggb2YgdmVydGV4IGlmIGluZGV4ZWRcbiAgICogQHBhcmFtIHtudW1iZXJ9IGNoYW5uZWwgMCA9IHJlZCwgMSA9IGdyZWVuLCAyID0gYmx1ZSwgMyA9IGFscGhhXG4gICAqIEByZXR1cm4ge251bWJlcn0gYSBudW1iZXIgZnJvbSAwIHRvIDI1NVxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cblxuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gUmFuZG9tVmVydGljZXNPcHRpb25zXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbdmVydHNQZXJDb2xvcl0gRGVmYXVsdHMgdG8gMyBmb3Igbm9uLWluZGV4ZWQgdmVydGljZXNcbiAgICogQHByb3BlcnR5IHttb2R1bGU6dHdnbC9wcmltaXRpdmVzLlJhbmRvbUNvbG9yRnVuY30gW3JhbmRdIEEgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgcmFuZG9tIG51bWJlcnNcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gYXVnbWVudGVkVHlwZWRBcnJheSBvZiByYW5kb20gdmVydGV4IGNvbG9ycy5cbiAgICogSWYgdGhlIHZlcnRpY2VzIGFyZSBpbmRleGVkIChoYXZlIGFuIGluZGljZXMgYXJyYXkpIHRoZW4gd2lsbFxuICAgKiBqdXN0IG1ha2UgcmFuZG9tIGNvbG9ycy4gT3RoZXJ3aXNlIGFzc3VtZXMgdGhleSBhcmUgdHJpYW5nbGVzc1xuICAgKiBhbmQgbWFrZXMgb25lIHJhbmRvbSBjb2xvciBmb3IgZXZlcnkgMyB2ZXJ0aWNlcy5cbiAgICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgYXVnbWVudGVkVHlwZWRBcnJheT59IHZlcnRpY2VzIFZlcnRpY2VzIGFzIHJldHVybmVkIGZyb20gb25lIG9mIHRoZSBjcmVhdGVYWFhWZXJ0aWNlcyBmdW5jdGlvbnMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvcHJpbWl0aXZlcy5SYW5kb21WZXJ0aWNlc09wdGlvbnN9IFtvcHRpb25zXSBvcHRpb25zLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgYXVnbWVudGVkVHlwZWRBcnJheT59IHNhbWUgdmVydGljZXMgYXMgcGFzc2VkIGluIHdpdGggYGNvbG9yYCBhZGRlZC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIG1ha2VSYW5kb21WZXJ0ZXhDb2xvcnModmVydGljZXMsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgbnVtRWxlbWVudHMgPSB2ZXJ0aWNlcy5wb3NpdGlvbi5udW1FbGVtZW50cztcbiAgICB2YXIgdmNvbG9ycyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoNCwgbnVtRWxlbWVudHMsIFVpbnQ4QXJyYXkpO1xuICAgIHZhciByYW5kID0gb3B0aW9ucy5yYW5kIHx8IGZ1bmN0aW9uKG5keCwgY2hhbm5lbCkge1xuICAgICAgcmV0dXJuIGNoYW5uZWwgPCAzID8gcmFuZEludCgyNTYpIDogMjU1O1xuICAgIH07XG4gICAgdmVydGljZXMuY29sb3IgPSB2Y29sb3JzO1xuICAgIGlmICh2ZXJ0aWNlcy5pbmRpY2VzKSB7XG4gICAgICAvLyBqdXN0IG1ha2UgcmFuZG9tIGNvbG9ycyBpZiBpbmRleFxuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bUVsZW1lbnRzOyArK2lpKSB7XG4gICAgICAgIHZjb2xvcnMucHVzaChyYW5kKGlpLCAwKSwgcmFuZChpaSwgMSksIHJhbmQoaWksIDIpLCByYW5kKGlpLCAzKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIG1ha2UgcmFuZG9tIGNvbG9ycyBwZXIgdHJpYW5nbGVcbiAgICAgIHZhciBudW1WZXJ0c1BlckNvbG9yID0gb3B0aW9ucy52ZXJ0c1BlckNvbG9yIHx8IDM7XG4gICAgICB2YXIgbnVtU2V0cyA9IG51bUVsZW1lbnRzIC8gbnVtVmVydHNQZXJDb2xvcjtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1TZXRzOyArK2lpKSB7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIHZhciBjb2xvciA9IFtyYW5kKGlpLCAwKSwgcmFuZChpaSwgMSksIHJhbmQoaWksIDIpLCByYW5kKGlpLCAzKV07XG4gICAgICAgIGZvciAodmFyIGpqID0gMDsgamogPCBudW1WZXJ0c1BlckNvbG9yOyArK2pqKSB7XG4gICAgICAgICAgdmNvbG9ycy5wdXNoKGNvbG9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmVydGljZXM7XG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgY2FsbHMgZm4gdG8gY3JlYXRlIHZlcnRpY2VzIGFuZCB0aGVuXG4gICAqIGNyZWF0ZXMgYSBidWZmZXJzIGZvciB0aGVtXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVCdWZmZXJGdW5jKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGdsKSB7XG4gICAgICB2YXIgYXJyYXlzID0gZm4uYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICByZXR1cm4gdHdnbC5jcmVhdGVCdWZmZXJzRnJvbUFycmF5cyhnbCwgYXJyYXlzKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIGZuIHRvIGNyZWF0ZSB2ZXJ0aWNlcyBhbmQgdGhlblxuICAgKiBjcmVhdGVzIGEgYnVmZmVySW5mbyBvYmplY3QgZm9yIHRoZW1cbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlckluZm9GdW5jKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGdsKSB7XG4gICAgICB2YXIgYXJyYXlzID0gZm4uYXBwbHkobnVsbCwgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgcmV0dXJuIHR3Z2wuY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXMoZ2wsIGFycmF5cyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIFVzaW5nIHF1b3RlcyBwcmV2ZW50cyBVZ2xpZnkgZnJvbSBjaGFuZ2luZyB0aGUgbmFtZXMuXG4gIC8vIE5vIHNwZWVkIGRpZmYgQUZBSUNULlxuICByZXR1cm4ge1xuICAgIFwiY3JlYXRlM0RGQnVmZmVySW5mb1wiOiBjcmVhdGVCdWZmZXJJbmZvRnVuYyhjcmVhdGUzREZWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGUzREZCdWZmZXJzXCI6IGNyZWF0ZUJ1ZmZlckZ1bmMoY3JlYXRlM0RGVmVydGljZXMpLFxuICAgIFwiY3JlYXRlM0RGVmVydGljZXNcIjogY3JlYXRlM0RGVmVydGljZXMsXG4gICAgXCJjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5XCI6IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXksXG4gICAgXCJjcmVhdGVDdWJlQnVmZmVySW5mb1wiOiBjcmVhdGVCdWZmZXJJbmZvRnVuYyhjcmVhdGVDdWJlVmVydGljZXMpLFxuICAgIFwiY3JlYXRlQ3ViZUJ1ZmZlcnNcIjogY3JlYXRlQnVmZmVyRnVuYyhjcmVhdGVDdWJlVmVydGljZXMpLFxuICAgIFwiY3JlYXRlQ3ViZVZlcnRpY2VzXCI6IGNyZWF0ZUN1YmVWZXJ0aWNlcyxcbiAgICBcImNyZWF0ZVBsYW5lQnVmZmVySW5mb1wiOiBjcmVhdGVCdWZmZXJJbmZvRnVuYyhjcmVhdGVQbGFuZVZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZVBsYW5lQnVmZmVyc1wiOiBjcmVhdGVCdWZmZXJGdW5jKGNyZWF0ZVBsYW5lVmVydGljZXMpLFxuICAgIFwiY3JlYXRlUGxhbmVWZXJ0aWNlc1wiOiBjcmVhdGVQbGFuZVZlcnRpY2VzLFxuICAgIFwiY3JlYXRlU3BoZXJlQnVmZmVySW5mb1wiOiBjcmVhdGVCdWZmZXJJbmZvRnVuYyhjcmVhdGVTcGhlcmVWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVTcGhlcmVCdWZmZXJzXCI6IGNyZWF0ZUJ1ZmZlckZ1bmMoY3JlYXRlU3BoZXJlVmVydGljZXMpLFxuICAgIFwiY3JlYXRlU3BoZXJlVmVydGljZXNcIjogY3JlYXRlU3BoZXJlVmVydGljZXMsXG4gICAgXCJjcmVhdGVUcnVuY2F0ZWRDb25lQnVmZmVySW5mb1wiOiBjcmVhdGVCdWZmZXJJbmZvRnVuYyhjcmVhdGVUcnVuY2F0ZWRDb25lVmVydGljZXMpLFxuICAgIFwiY3JlYXRlVHJ1bmNhdGVkQ29uZUJ1ZmZlcnNcIjogY3JlYXRlQnVmZmVyRnVuYyhjcmVhdGVUcnVuY2F0ZWRDb25lVmVydGljZXMpLFxuICAgIFwiY3JlYXRlVHJ1bmNhdGVkQ29uZVZlcnRpY2VzXCI6IGNyZWF0ZVRydW5jYXRlZENvbmVWZXJ0aWNlcyxcbiAgICBcImNyZWF0ZVhZUXVhZEJ1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlWFlRdWFkVmVydGljZXMpLFxuICAgIFwiY3JlYXRlWFlRdWFkQnVmZmVyc1wiOiBjcmVhdGVCdWZmZXJGdW5jKGNyZWF0ZVhZUXVhZFZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZVhZUXVhZFZlcnRpY2VzXCI6IGNyZWF0ZVhZUXVhZFZlcnRpY2VzLFxuICAgIFwiY3JlYXRlQ3Jlc2VudEJ1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlQ3Jlc2VudFZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZUNyZXNlbnRCdWZmZXJzXCI6IGNyZWF0ZUJ1ZmZlckZ1bmMoY3JlYXRlQ3Jlc2VudFZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZUNyZXNlbnRWZXJ0aWNlc1wiOiBjcmVhdGVDcmVzZW50VmVydGljZXMsXG4gICAgXCJjcmVhdGVDeWxpbmRlckJ1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlQ3lsaW5kZXJWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVDeWxpbmRlckJ1ZmZlcnNcIjogY3JlYXRlQnVmZmVyRnVuYyhjcmVhdGVDeWxpbmRlclZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZUN5bGluZGVyVmVydGljZXNcIjogY3JlYXRlQ3lsaW5kZXJWZXJ0aWNlcyxcbiAgICBcImNyZWF0ZVRvcnVzQnVmZmVySW5mb1wiOiBjcmVhdGVCdWZmZXJJbmZvRnVuYyhjcmVhdGVUb3J1c1ZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZVRvcnVzQnVmZmVyc1wiOiBjcmVhdGVCdWZmZXJGdW5jKGNyZWF0ZVRvcnVzVmVydGljZXMpLFxuICAgIFwiY3JlYXRlVG9ydXNWZXJ0aWNlc1wiOiBjcmVhdGVUb3J1c1ZlcnRpY2VzLFxuICAgIFwiY3JlYXRlRGlzY0J1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlRGlzY1ZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZURpc2NCdWZmZXJzXCI6IGNyZWF0ZUJ1ZmZlckZ1bmMoY3JlYXRlRGlzY1ZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZURpc2NWZXJ0aWNlc1wiOiBjcmVhdGVEaXNjVmVydGljZXMsXG4gICAgXCJkZWluZGV4VmVydGljZXNcIjogZGVpbmRleFZlcnRpY2VzLFxuICAgIFwiZmxhdHRlbk5vcm1hbHNcIjogZmxhdHRlbk5vcm1hbHMsXG4gICAgXCJtYWtlUmFuZG9tVmVydGV4Q29sb3JzXCI6IG1ha2VSYW5kb21WZXJ0ZXhDb2xvcnMsXG4gICAgXCJyZW9yaWVudERpcmVjdGlvbnNcIjogcmVvcmllbnREaXJlY3Rpb25zLFxuICAgIFwicmVvcmllbnROb3JtYWxzXCI6IHJlb3JpZW50Tm9ybWFscyxcbiAgICBcInJlb3JpZW50UG9zaXRpb25zXCI6IHJlb3JpZW50UG9zaXRpb25zLFxuICAgIFwicmVvcmllbnRWZXJ0aWNlc1wiOiByZW9yaWVudFZlcnRpY2VzLFxuICB9O1xuXG59KTtcblxuZGVmaW5lKCdtYWluJywgW1xuICAgICd0d2dsL3R3Z2wnLFxuICAgICd0d2dsL200JyxcbiAgICAndHdnbC92MycsXG4gICAgJ3R3Z2wvcHJpbWl0aXZlcycsXG4gIF0sIGZ1bmN0aW9uKFxuICAgIHR3Z2wsXG4gICAgbTQsXG4gICAgdjMsXG4gICAgcHJpbWl0aXZlc1xuICApIHtcbiAgICB0d2dsLm00ID0gbTQ7XG4gICAgdHdnbC52MyA9IHYzO1xuICAgIHR3Z2wucHJpbWl0aXZlcyA9IHByaW1pdGl2ZXM7XG4gICAgcmV0dXJuIHR3Z2w7XG59KVxuXG5ub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwKFsnbWFpbiddLCBmdW5jdGlvbihtYWluKSB7XG4gIHJldHVybiBtYWluO1xufSwgdW5kZWZpbmVkLCB0cnVlKTsgICAvLyBmb3JjZVN5bmMgPSB0cnVlXG5cblxuO1xuZGVmaW5lKFwiYnVpbGQvanMvdHdnbC1pbmNsdWRlci1mdWxsXCIsIGZ1bmN0aW9uKCl7fSk7XG5cbiAgICByZXR1cm4gbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cCgnbWFpbicpO1xufSkpO1xuIiwiLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgU3BlY3RyYWwgRmx1eCBvbnNldCBkZXRlY3Rpb24gbWV0aG9kXG4gKiBkZXNjcmliZWQgaW4gXCJTaW1wbGUgU3BlY3RydW0tQmFzZWQgT25zZXQgRGV0ZWN0aW9uXCIgKGh0dHA6Ly93d3cubXVzaWMtaXIub3JnL2V2YWx1YXRpb24vTUlSRVgvMjAwNl9hYnN0cmFjdHMvT0RfZGl4b24ucGRmKVxuICovXG5cbmltcG9ydCB0d2dsIGZyb20gJ3R3Z2wuanMnO1xuaW1wb3J0IHtcbiAgQXVkaW9Db250ZXh0LFxuICBXb3JrZXIsXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgbG9hZEF1ZGlvLFxuICByZXNpemVDYW52YXNcbn0gZnJvbSAnLi91dGlscyc7XG5cbnZhciBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG52YXIgaXNPbnNldCA9IGZhbHNlO1xudmFyIGFscGhhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FscGhhJykudmFsdWU7XG52YXIgZGVsdGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVsdGEnKS52YWx1ZTtcbmRlYnVnZ2VyO1xuXG5mdW5jdGlvbiBsb3dQYXNzRmlsdGVyIChuLCBhbHBoYSwgZGF0YSkge1xuICB2YXIgYWNjID0gMC4wO1xuICBmb3IgKHZhciBpID0gMDsgaSA8PSBuOyBpKyspIHtcbiAgICBhY2MgPSBNYXRoLm1heChkYXRhW25dLCBhbHBoYSAqIGFjYyArICgxLjAgLSBhbHBoYSkgKiBkYXRhW25dKTtcbiAgfVxuICByZXR1cm4gYWNjO1xufVxuXG5mdW5jdGlvbiBkZXRlY3RPbnNldCAobiwgZGF0YSwgb3B0aW9ucyA9IHt9KSB7XG4gIHZhciB3ID0gb3B0aW9ucy53IHx8IDM7XG4gIHZhciBtID0gb3B0aW9ucy5tIHx8IDM7XG4gIHZhciBkZWx0YSA9IG9wdGlvbnMuZGVsdGEgfHwgMC4zNTtcbiAgdmFyIGFscGhhID0gb3B0aW9ucy5hbHBoYSB8fCAwLjg0O1xuXG4gIHZhciBsZW5ndGggPSBkYXRhLmxlbmd0aDtcbiAgdmFyIHZhbHVlID0gZGF0YVtuXTtcbiAgdmFyIGs7XG5cbiAgdmFyIGdyZWF0ZXJUaGFuU3Vycm91bmRpbmdWYWx1ZXMgPSB0cnVlO1xuICBmb3IgKGsgPSBuIC0gdzsgayA8PSBuICsgdzsgaysrKSB7XG4gICAgZ3JlYXRlclRoYW5TdXJyb3VuZGluZ1ZhbHVlcyA9IGdyZWF0ZXJUaGFuU3Vycm91bmRpbmdWYWx1ZXMgJiYgdmFsdWUgPj0gZGF0YVtNYXRoLm1heCgwLCBNYXRoLm1pbihrLCBsZW5ndGggLSAxKSldO1xuICB9XG5cbiAgdmFyIHN1bU9mTG9jYWxWYWx1ZXMgPSAwLjA7XG4gIGZvciAoayA9IG4gLSBtICogdzsgayA8PSBuICsgdzsgaysrKSB7XG4gICAgaWYgKGsgPj0gMCAmJiBrIDwgbGVuZ3RoKSB7XG4gICAgICBzdW1PZkxvY2FsVmFsdWVzICs9IGRhdGFba107XG4gICAgfVxuICB9XG4gIHZhciBhYm92ZUxvY2FsTWVhblRocmVzaG9sZCA9IHZhbHVlID49ICgoc3VtT2ZMb2NhbFZhbHVlcyAvIChtICogdyArIHcgKyAxKSkgKyBkZWx0YSk7XG5cbiAgdmFyIGFib3ZlTG93UGFzc0ZpbHRlciA9IHZhbHVlID49IGxvd1Bhc3NGaWx0ZXIobiAtIDEsIGFscGhhLCBkYXRhKTtcblxuICByZXR1cm4gZ3JlYXRlclRoYW5TdXJyb3VuZGluZ1ZhbHVlcyAmJiBhYm92ZUxvY2FsTWVhblRocmVzaG9sZCAmJiBhYm92ZUxvd1Bhc3NGaWx0ZXI7XG59XG5cbmZ1bmN0aW9uIHNldHVwQXVkaW9Ob2RlcyAoY29udGV4dCwgeyBzdGZ0RGF0YSwgc3BlY3RyYWxGbHV4RGF0YSwgbm9ybWFsaXplZFNwZWN0cmFsRmx1eERhdGEgfSkge1xuICB2YXIgc291cmNlTm9kZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gIHZhciBvbnNldERldGVjdG9yTm9kZSA9IGNvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKDUxMiwgMSwgMSk7XG5cbiAgb25zZXREZXRlY3Rvck5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiAoYXVkaW9Qcm9jZXNzaW5nRXZlbnQpIHtcbiAgICB2YXIgcGxheWJhY2tUaW1lID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQucGxheWJhY2tUaW1lO1xuICAgIC8vIHByZXByb2Nlc3NlZERhdGFCaW4gPSBwbGF5YmFja1RpbWUgKiA0NDEwMCAoc2FtcGxlIHJhdGUpIC8gNDQxIChTVEZUIGhvcCBzaXplKVxuICAgIHZhciBzcGVjdHJhbEZsdXhEYXRhQmluID0gTWF0aC5mbG9vcihwbGF5YmFja1RpbWUgKiAxMDApO1xuICAgIHZhciBhbHBoYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbHBoYScpLnZhbHVlO1xuICAgIHZhciBkZWx0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWx0YScpLnZhbHVlO1xuICAgIGlzT25zZXQgPSBkZXRlY3RPbnNldChzcGVjdHJhbEZsdXhEYXRhQmluLCBub3JtYWxpemVkU3BlY3RyYWxGbHV4RGF0YSk7XG5cbiAgICBpZiAoaXNPbnNldCkge1xuICAgICAgY29uc29sZS5sb2coYG9uc2V0IGF0OiAke3BsYXliYWNrVGltZX1gKTtcbiAgICB9XG5cbiAgICB2YXIgaW5wdXREYXRhID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQuaW5wdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG4gICAgdmFyIG91dHB1dERhdGEgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG5cbiAgICAvLyBwYXNzIGF1ZGlvIGRhdGEgdGhyb3VnaCB0byBkZXN0aW5hdGlvblxuICAgIGZvciAodmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50LmlucHV0QnVmZmVyLmxlbmd0aDsgc2FtcGxlKyspIHtcbiAgICAgIG91dHB1dERhdGFbc2FtcGxlXSA9IGlucHV0RGF0YVtzYW1wbGVdO1xuICAgIH1cbiAgfTtcblxuICBzb3VyY2VOb2RlLm9uZW5kZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgc291cmNlTm9kZS5kaXNjb25uZWN0KG9uc2V0RGV0ZWN0b3JOb2RlKTtcbiAgICBvbnNldERldGVjdG9yTm9kZS5kaXNjb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICB9O1xuXG4gIHNvdXJjZU5vZGUuY29ubmVjdChvbnNldERldGVjdG9yTm9kZSk7XG4gIG9uc2V0RGV0ZWN0b3JOb2RlLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG5cbiAgcmV0dXJuIHtcbiAgICBzb3VyY2VOb2RlOiBzb3VyY2VOb2RlLFxuICAgIG9uc2V0RGV0ZWN0b3JOb2RlOiBvbnNldERldGVjdG9yTm9kZVxuICB9O1xufVxuXG5mdW5jdGlvbiB2aXN1YWxpemUgKCkge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuICB2YXIgY2FudmFzQ3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgZnVuY3Rpb24gZHJhdyAodGltZSkge1xuICAgIHR3Z2wucmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZShjYW52YXMpO1xuICAgIHZhciB3aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcblxuICAgIGFscGhhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FscGhhJykudmFsdWUgfHwgMC41O1xuICAgIGRlbHRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbHRhJykudmFsdWUgfHwgMDtcblxuICAgIGNhbnZhc0N0eC5maWxsU3R5bGUgPSAncmdiKDIwMCwgMjAwLCAyMDApJztcbiAgICBjYW52YXNDdHguZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICBjYW52YXNDdHgubGluZVdpZHRoID0gMjtcbiAgICBjYW52YXNDdHguc3Ryb2tlU3R5bGUgPSAncmdiKDAsIDAsIDApJztcblxuICAgIGNhbnZhc0N0eC5iZWdpblBhdGgoKTtcblxuICAgIHZhciB4ID0gd2lkdGggLyAyO1xuICAgIHZhciB5ID0gaGVpZ2h0IC8gMjtcbiAgICB2YXIgcmFkaXVzID0gaGVpZ2h0IC8gMztcbiAgICB2YXIgZnJlcXVlbmN5ID0gMTA7XG4gICAgdmFyIGFtcCA9IDAuMSAqIHRpbWU7XG4gICAgdmFyIGFuZ2xlLCBkeCwgZHk7XG5cbiAgICB2YXIgd2F2ZUFtcGxpdHVkZSA9IDAuMDM7XG4gICAgdmFyIHdhdmVGcmVxdWVuY3kgPSA1MDtcbiAgICB2YXIgcm90YXRpb25TcGVlZCA9IDAuMDU7XG4gICAgdmFyIG9zY2lsbGF0aW9uU3BlZWQgPSAwLjAwNTtcblxuICAgIGZvciAoYW5nbGUgPSAwOyBhbmdsZSA8PSAyICogTWF0aC5QSTsgYW5nbGUgKz0gMC4wMDEpIHtcbiAgICAgIGR4ID0geCArIHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKSAqICgxLjAgKyB3YXZlQW1wbGl0dWRlICogTWF0aC5zaW4oYW5nbGUgKiB3YXZlRnJlcXVlbmN5ICsgcm90YXRpb25TcGVlZCAqIHRpbWUpICogTWF0aC5zaW4ob3NjaWxsYXRpb25TcGVlZCAqIHRpbWUpKTtcbiAgICAgIGR5ID0geSArIHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKSAqICgxLjAgKyB3YXZlQW1wbGl0dWRlICogTWF0aC5zaW4oYW5nbGUgKiB3YXZlRnJlcXVlbmN5ICsgcm90YXRpb25TcGVlZCAqIHRpbWUpICogTWF0aC5zaW4ob3NjaWxsYXRpb25TcGVlZCAqIHRpbWUpKTtcblxuICAgICAgaWYgKGFuZ2xlID09PSAwKSB7XG4gICAgICAgIGNhbnZhc0N0eC5tb3ZlVG8oZHgsIGR5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbnZhc0N0eC5saW5lVG8oZHgsIGR5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjYW52YXNDdHguc3Ryb2tlKCk7XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG4gIH1cblxuICB2YXIgY29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgdmFyIHN0ZnRXb3JrZXIgPSBuZXcgV29ya2VyKCdqcy93b3JrZXJzL3N0ZnQtd29ya2VyLmpzJyk7XG5cbiAgbG9hZEF1ZGlvKGNvbnRleHQsICdzb3VuZHMvZmxpbS5tcDMnKS50aGVuKGZ1bmN0aW9uIChhdWRpb0J1ZmZlcikge1xuICAgIGxldCBhdWRpb0J1ZmZlckRhdGEgPSBhdWRpb0J1ZmZlci5nZXRDaGFubmVsRGF0YSgwKS5zbGljZSgpO1xuXG4gICAgc3RmdFdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgbGV0IG5vZGVzID0gc2V0dXBBdWRpb05vZGVzKGNvbnRleHQsIGUuZGF0YSk7XG4gICAgICBub2Rlcy5zb3VyY2VOb2RlLmJ1ZmZlciA9IGF1ZGlvQnVmZmVyO1xuICAgICAgbm9kZXMuc291cmNlTm9kZS5zdGFydCgwKTtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcbiAgICB9O1xuXG4gICAgc3RmdFdvcmtlci5wb3N0TWVzc2FnZShhdWRpb0J1ZmZlckRhdGEsIFthdWRpb0J1ZmZlckRhdGEuYnVmZmVyXSk7XG4gIH0pO1xufVxuXG52aXN1YWxpemUoKTtcbiIsInZhciByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAgZ2xvYmFsLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGdsb2JhbC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBnbG9iYWwub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGdsb2JhbC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgZ2xvYmFsLnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgICAgICAgfTtcbn0pKCk7XG5cbnZhciBBdWRpb0NvbnRleHQgPSBnbG9iYWwuQXVkaW9Db250ZXh0IHx8IGdsb2JhbC53ZWJraXRBdWRpb0NvbnRleHQ7XG52YXIgT2ZmbGluZUF1ZGlvQ29udGV4dCA9IGdsb2JhbC5PZmZsaW5lQXVkaW9Db250ZXh0IHx8IGdsb2JhbC53ZWJraXRPZmZsaW5lQXVkaW9Db250ZXh0O1xudmFyIFdvcmtlciA9IGdsb2JhbC5Xb3JrZXIgfHwgZ2xvYmFsLndlYmtpdFdvcmtlcjtcblxuZnVuY3Rpb24gbG9hZEF1ZGlvIChhdWRpb0NvbnRleHQsIHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgdmFyIG9uRGVjb2RlU3VjY2VzcyA9IGZ1bmN0aW9uIChidWZmZXIpIHsgcmVzb2x2ZShidWZmZXIpOyB9O1xuICAgIHZhciBvbkRlY29kZUZhaWx1cmUgPSBmdW5jdGlvbiAoZXJyb3IpIHsgcmVqZWN0KGVycm9yKTsgfTtcblxuICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgYXVkaW9Db250ZXh0LmRlY29kZUF1ZGlvRGF0YShyZXF1ZXN0LnJlc3BvbnNlLCBvbkRlY29kZVN1Y2Nlc3MsIG9uRGVjb2RlRmFpbHVyZSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJlamVjdChFcnJvcignTmV0d29yayBFcnJvcicpKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdC5zZW5kKCk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXNpemVDYW52YXMgKGNhbnZhcykge1xuICB2YXIgZGlzcGxheVdpZHRoICA9IGNhbnZhcy5jbGllbnRXaWR0aDtcbiAgdmFyIGRpc3BsYXlIZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0O1xuXG4gIGlmIChjYW52YXMud2lkdGggIT09IGRpc3BsYXlXaWR0aCB8fCBjYW52YXMuaGVpZ2h0ICE9PSBkaXNwbGF5SGVpZ2h0KSB7XG4gICAgY2FudmFzLndpZHRoICA9IGRpc3BsYXlXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gZGlzcGxheUhlaWdodDtcbiAgfVxufVxuXG5leHBvcnQge1xuICBBdWRpb0NvbnRleHQsXG4gIE9mZmxpbmVBdWRpb0NvbnRleHQsXG4gIFdvcmtlcixcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLFxuICBsb2FkQXVkaW8sXG4gIHJlc2l6ZUNhbnZhc1xufTtcbiJdfQ==
