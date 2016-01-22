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
  var delta = options.delta || 0.3;
  var alpha = options.alpha || 0.3;

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

  //sourceNode.connect(context.destination);
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
  /*
  var gl = twgl.getWebGLContext(document.getElementById('canvas'));
  var vertexShader = glslify('./shaders/vertex_shader.glsl');
  var fragmentShader = glslify('./shaders/circle_shader.glsl');
  var programInfo = twgl.createProgramInfo(gl, [vertexShader, fragmentShader]);
  var arrays = {
    position: {
      numComponents: 3,
      data: [
      // triangle covering lower left half of the screen
      -1, -1, 0,
       1, -1, 0,
      -1, 1, 0,
      // triangle covering upper right half of screen
      -1, 1, 0,
       1, -1, 0,
       1, 1, 0
      ]
    }
  };
  var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
  */

  function draw(time) {
    _twgl2.default.resizeCanvasToDisplaySize(canvas);
    var width = canvas.width;
    var height = canvas.height;

    alpha = document.getElementById('alpha').value || 0.5;
    delta = document.getElementById('delta').value || 0;

    /*
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
     var uniforms = {
      time: time * 0.001,
      resolution: [gl.canvas.width, gl.canvas.height],
      isNoteOnset: isOnset
    };
     gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, gl.TRIANGLES, bufferInfo);
    */

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdHdnbC5qcy9kaXN0L3R3Z2wtZnVsbC5qcyIsInNyYy9zcGVjdHJhbC1mbHV4LmpzIiwic3JjL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2prT0EsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUVqQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDcEIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDbkQsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUM7O0FBRW5ELFNBQVMsYUFBYSxDQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0FBQ3RDLE1BQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUNkLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsT0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFBLEdBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDaEU7QUFDRCxTQUFPLEdBQUcsQ0FBQztDQUNaOztBQUVELFNBQVMsV0FBVyxDQUFFLENBQUMsRUFBRSxJQUFJLEVBQWdCO01BQWQsT0FBTyx5REFBRyxFQUFFOztBQUN6QyxNQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QixNQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QixNQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUNqQyxNQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQzs7QUFFakMsTUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN6QixNQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEIsTUFBSSxDQUFDLENBQUM7O0FBRU4sTUFBSSw0QkFBNEIsR0FBRyxJQUFJLENBQUM7QUFDeEMsT0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMvQixnQ0FBNEIsR0FBRyw0QkFBNEIsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDcEg7O0FBRUQsTUFBSSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7QUFDM0IsT0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbkMsUUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUU7QUFDeEIsc0JBQWdCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzdCO0dBQ0Y7QUFDRCxNQUFJLHVCQUF1QixHQUFHLEtBQUssSUFBSyxBQUFDLGdCQUFnQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSxBQUFDLEdBQUksS0FBSyxBQUFDLENBQUM7O0FBRXRGLE1BQUksa0JBQWtCLEdBQUcsS0FBSyxJQUFJLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQzs7QUFFcEUsU0FBTyw0QkFBNEIsSUFBSSx1QkFBdUIsSUFBSSxrQkFBa0IsQ0FBQztDQUN0Rjs7QUFFRCxTQUFTLGVBQWUsQ0FBRSxPQUFPLFFBQThEO01BQTFELFFBQVEsUUFBUixRQUFRO01BQUUsZ0JBQWdCLFFBQWhCLGdCQUFnQjtNQUFFLDBCQUEwQixRQUExQiwwQkFBMEI7O0FBQ3pGLE1BQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQzlDLE1BQUksaUJBQWlCLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRWpFLG1CQUFpQixDQUFDLGNBQWMsR0FBRyxVQUFVLG9CQUFvQixFQUFFO0FBQ2pFLFFBQUksWUFBWSxHQUFHLG9CQUFvQixDQUFDLFlBQVk7O0FBQUMsQUFFckQsUUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQztBQUN6RCxRQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNuRCxRQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNuRCxXQUFPLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixFQUFFLDBCQUEwQixDQUFDLENBQUM7O0FBRXZFLFFBQUksT0FBTyxFQUFFO0FBQ1gsYUFBTyxDQUFDLEdBQUcsZ0JBQWMsWUFBWSxDQUFHLENBQUM7S0FDMUM7O0FBRUQsUUFBSSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRSxRQUFJLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzs7O0FBQUMsQUFHckUsU0FBSyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7QUFDL0UsZ0JBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDeEM7R0FDRixDQUFDOztBQUVGLFlBQVUsQ0FBQyxPQUFPLEdBQUcsWUFBWTtBQUMvQixjQUFVLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDekMscUJBQWlCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUNuRDs7O0FBQUMsQUFHRixZQUFVLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdEMsbUJBQWlCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQzs7QUFFL0MsU0FBTztBQUNMLGNBQVUsRUFBRSxVQUFVO0FBQ3RCLHFCQUFpQixFQUFFLGlCQUFpQjtHQUNyQyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyxTQUFTLEdBQUk7QUFDcEIsTUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMvQyxNQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUMsQUF3QnhDLFdBQVMsSUFBSSxDQUFFLElBQUksRUFBRTtBQUNuQixtQkFBSyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN2QyxRQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3pCLFFBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0FBRTNCLFNBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUM7QUFDdEQsU0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQUFDLEFBaUJwRCxhQUFTLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFDO0FBQzNDLGFBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRXhDLGFBQVMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLGFBQVMsQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDOztBQUV2QyxhQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBRXRCLFFBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDbEIsUUFBSSxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNuQixRQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFFBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztBQUNuQixRQUFJLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLFFBQUksS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7O0FBRWxCLFFBQUksYUFBYSxHQUFHLElBQUksQ0FBQztBQUN6QixRQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7QUFDdkIsUUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLFFBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDOztBQUU3QixTQUFLLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssSUFBSSxLQUFLLEVBQUU7QUFDcEQsUUFBRSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLGFBQWEsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQSxBQUFDLENBQUM7QUFDdkosUUFBRSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLGFBQWEsR0FBRyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsQ0FBQSxBQUFDLENBQUM7O0FBRXZKLFVBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNmLGlCQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUMxQixNQUFNO0FBQ0wsaUJBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO09BQzFCO0tBQ0Y7O0FBRUQsYUFBUyxDQUFDLE1BQU0sRUFBRSxDQUFDOztBQUVuQixlQXpLRixxQkFBcUIsRUF5S0csSUFBSSxDQUFDLENBQUM7R0FDN0I7O0FBRUQsTUFBSSxPQUFPLEdBQUcsV0E5S2QsWUFBWSxFQThLb0IsQ0FBQztBQUNqQyxNQUFJLFVBQVUsR0FBRyxXQTlLakIsTUFBTSxDQThLc0IsMkJBQTJCLENBQUMsQ0FBQzs7QUFFekQsYUE5S0EsU0FBUyxFQThLQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxXQUFXLEVBQUU7QUFDaEUsUUFBSSxlQUFlLEdBQUcsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFNUQsY0FBVSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsRUFBRTtBQUNsQyxVQUFJLEtBQUssR0FBRyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxXQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7QUFDdEMsV0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsaUJBdExKLHFCQUFxQixFQXNMSyxJQUFJLENBQUMsQ0FBQztLQUM3QixDQUFDOztBQUVGLGNBQVUsQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7R0FDbkUsQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsU0FBUyxFQUFFLENBQUM7Ozs7Ozs7OztBQ3RNWixJQUFJLHFCQUFxQixHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsSUFBSSxBQUFDLFlBQVk7QUFDdkUsU0FBUSxNQUFNLENBQUMsMkJBQTJCLElBQ2xDLE1BQU0sQ0FBQyx3QkFBd0IsSUFDL0IsTUFBTSxDQUFDLHNCQUFzQixJQUM3QixNQUFNLENBQUMsdUJBQXVCLElBQzlCLFVBQVUsUUFBUSxFQUFFO0FBQ2xCLFVBQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztHQUN4QyxDQUFDO0NBQ1gsRUFBRyxDQUFDOztBQUVMLElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLGtCQUFrQixDQUFDO0FBQ3BFLElBQUksbUJBQW1CLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixJQUFJLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQztBQUN6RixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxZQUFZLENBQUM7O0FBRWxELFNBQVMsU0FBUyxDQUFFLFlBQVksRUFBRSxHQUFHLEVBQUU7QUFDckMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDNUMsUUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQzs7QUFFbkMsV0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQy9CLFdBQU8sQ0FBQyxZQUFZLEdBQUcsYUFBYSxDQUFDOztBQUVyQyxRQUFJLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQWEsTUFBTSxFQUFFO0FBQUUsYUFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQUUsQ0FBQztBQUM3RCxRQUFJLGVBQWUsR0FBRyxTQUFsQixlQUFlLENBQWEsS0FBSyxFQUFFO0FBQUUsWUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQUUsQ0FBQzs7QUFFMUQsV0FBTyxDQUFDLE1BQU0sR0FBRyxZQUFZO0FBQzNCLGtCQUFZLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0tBQ2xGLENBQUM7O0FBRUYsV0FBTyxDQUFDLE9BQU8sR0FBRyxZQUFZO0FBQzVCLFlBQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztLQUNoQyxDQUFDOztBQUVGLFdBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNoQixDQUFDLENBQUM7Q0FDSjs7QUFFRCxTQUFTLFlBQVksQ0FBRSxNQUFNLEVBQUU7QUFDN0IsTUFBSSxZQUFZLEdBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUN2QyxNQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDOztBQUV4QyxNQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssWUFBWSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssYUFBYSxFQUFFO0FBQ3BFLFVBQU0sQ0FBQyxLQUFLLEdBQUksWUFBWSxDQUFDO0FBQzdCLFVBQU0sQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO0dBQy9CO0NBQ0Y7O1FBR0MsWUFBWSxHQUFaLFlBQVk7UUFDWixtQkFBbUIsR0FBbkIsbUJBQW1CO1FBQ25CLE1BQU0sR0FBTixNQUFNO1FBQ04scUJBQXFCLEdBQXJCLHFCQUFxQjtRQUNyQixTQUFTLEdBQVQsU0FBUztRQUNULFlBQVksR0FBWixZQUFZIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGxpY2Vuc2UgdHdnbC5qcyAwLjAuNDIgQ29weXJpZ2h0IChjKSAyMDE1LCBHcmVnZyBUYXZhcmVzIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBBdmFpbGFibGUgdmlhIHRoZSBNSVQgbGljZW5zZS5cbiAqIHNlZTogaHR0cDovL2dpdGh1Yi5jb20vZ3JlZ2dtYW4vdHdnbC5qcyBmb3IgZGV0YWlsc1xuICovXG4vKipcbiAqIEBsaWNlbnNlIGFsbW9uZCAwLjMuMSBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNCwgVGhlIERvam8gRm91bmRhdGlvbiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICogQXZhaWxhYmxlIHZpYSB0aGUgTUlUIG9yIG5ldyBCU0QgbGljZW5zZS5cbiAqIHNlZTogaHR0cDovL2dpdGh1Yi5jb20vanJidXJrZS9hbG1vbmQgZm9yIGRldGFpbHNcbiAqL1xuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICAgIH0gaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3QudHdnbCA9IGZhY3RvcnkoKTtcbiAgICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcblxuLyoqXG4gKiBAbGljZW5zZSBhbG1vbmQgMC4zLjEgQ29weXJpZ2h0IChjKSAyMDExLTIwMTQsIFRoZSBEb2pvIEZvdW5kYXRpb24gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqIEF2YWlsYWJsZSB2aWEgdGhlIE1JVCBvciBuZXcgQlNEIGxpY2Vuc2UuXG4gKiBzZWU6IGh0dHA6Ly9naXRodWIuY29tL2pyYnVya2UvYWxtb25kIGZvciBkZXRhaWxzXG4gKi9cbi8vR29pbmcgc2xvcHB5IHRvIGF2b2lkICd1c2Ugc3RyaWN0JyBzdHJpbmcgY29zdCwgYnV0IHN0cmljdCBwcmFjdGljZXMgc2hvdWxkXG4vL2JlIGZvbGxvd2VkLlxuLypqc2xpbnQgc2xvcHB5OiB0cnVlICovXG4vKmdsb2JhbCBzZXRUaW1lb3V0OiBmYWxzZSAqL1xuXG52YXIgbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cGpzLCBub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwLCBkZWZpbmU7XG4oZnVuY3Rpb24gKHVuZGVmKSB7XG4gICAgdmFyIG1haW4sIHJlcSwgbWFrZU1hcCwgaGFuZGxlcnMsXG4gICAgICAgIGRlZmluZWQgPSB7fSxcbiAgICAgICAgd2FpdGluZyA9IHt9LFxuICAgICAgICBjb25maWcgPSB7fSxcbiAgICAgICAgZGVmaW5pbmcgPSB7fSxcbiAgICAgICAgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcbiAgICAgICAgYXBzID0gW10uc2xpY2UsXG4gICAgICAgIGpzU3VmZml4UmVnRXhwID0gL1xcLmpzJC87XG5cbiAgICBmdW5jdGlvbiBoYXNQcm9wKG9iaiwgcHJvcCkge1xuICAgICAgICByZXR1cm4gaGFzT3duLmNhbGwob2JqLCBwcm9wKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHJlbGF0aXZlIG1vZHVsZSBuYW1lLCBsaWtlIC4vc29tZXRoaW5nLCBub3JtYWxpemUgaXQgdG9cbiAgICAgKiBhIHJlYWwgbmFtZSB0aGF0IGNhbiBiZSBtYXBwZWQgdG8gYSBwYXRoLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIHRoZSByZWxhdGl2ZSBuYW1lXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGJhc2VOYW1lIGEgcmVhbCBuYW1lIHRoYXQgdGhlIG5hbWUgYXJnIGlzIHJlbGF0aXZlXG4gICAgICogdG8uXG4gICAgICogQHJldHVybnMge1N0cmluZ30gbm9ybWFsaXplZCBuYW1lXG4gICAgICovXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplKG5hbWUsIGJhc2VOYW1lKSB7XG4gICAgICAgIHZhciBuYW1lUGFydHMsIG5hbWVTZWdtZW50LCBtYXBWYWx1ZSwgZm91bmRNYXAsIGxhc3RJbmRleCxcbiAgICAgICAgICAgIGZvdW5kSSwgZm91bmRTdGFyTWFwLCBzdGFySSwgaSwgaiwgcGFydCxcbiAgICAgICAgICAgIGJhc2VQYXJ0cyA9IGJhc2VOYW1lICYmIGJhc2VOYW1lLnNwbGl0KFwiL1wiKSxcbiAgICAgICAgICAgIG1hcCA9IGNvbmZpZy5tYXAsXG4gICAgICAgICAgICBzdGFyTWFwID0gKG1hcCAmJiBtYXBbJyonXSkgfHwge307XG5cbiAgICAgICAgLy9BZGp1c3QgYW55IHJlbGF0aXZlIHBhdGhzLlxuICAgICAgICBpZiAobmFtZSAmJiBuYW1lLmNoYXJBdCgwKSA9PT0gXCIuXCIpIHtcbiAgICAgICAgICAgIC8vSWYgaGF2ZSBhIGJhc2UgbmFtZSwgdHJ5IHRvIG5vcm1hbGl6ZSBhZ2FpbnN0IGl0LFxuICAgICAgICAgICAgLy9vdGhlcndpc2UsIGFzc3VtZSBpdCBpcyBhIHRvcC1sZXZlbCBub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwIHRoYXQgd2lsbFxuICAgICAgICAgICAgLy9iZSByZWxhdGl2ZSB0byBiYXNlVXJsIGluIHRoZSBlbmQuXG4gICAgICAgICAgICBpZiAoYmFzZU5hbWUpIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5zcGxpdCgnLycpO1xuICAgICAgICAgICAgICAgIGxhc3RJbmRleCA9IG5hbWUubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgICAgIC8vIE5vZGUgLmpzIGFsbG93YW5jZTpcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnLm5vZGVJZENvbXBhdCAmJiBqc1N1ZmZpeFJlZ0V4cC50ZXN0KG5hbWVbbGFzdEluZGV4XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZVtsYXN0SW5kZXhdID0gbmFtZVtsYXN0SW5kZXhdLnJlcGxhY2UoanNTdWZmaXhSZWdFeHAsICcnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL0xvcCBvZmYgdGhlIGxhc3QgcGFydCBvZiBiYXNlUGFydHMsIHNvIHRoYXQgLiBtYXRjaGVzIHRoZVxuICAgICAgICAgICAgICAgIC8vXCJkaXJlY3RvcnlcIiBhbmQgbm90IG5hbWUgb2YgdGhlIGJhc2VOYW1lJ3MgbW9kdWxlLiBGb3IgaW5zdGFuY2UsXG4gICAgICAgICAgICAgICAgLy9iYXNlTmFtZSBvZiBcIm9uZS90d28vdGhyZWVcIiwgbWFwcyB0byBcIm9uZS90d28vdGhyZWUuanNcIiwgYnV0IHdlXG4gICAgICAgICAgICAgICAgLy93YW50IHRoZSBkaXJlY3RvcnksIFwib25lL3R3b1wiIGZvciB0aGlzIG5vcm1hbGl6YXRpb24uXG4gICAgICAgICAgICAgICAgbmFtZSA9IGJhc2VQYXJ0cy5zbGljZSgwLCBiYXNlUGFydHMubGVuZ3RoIC0gMSkuY29uY2F0KG5hbWUpO1xuXG4gICAgICAgICAgICAgICAgLy9zdGFydCB0cmltRG90c1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBuYW1lLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcnQgPSBuYW1lW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFydCA9PT0gXCIuXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnQgPT09IFwiLi5cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IDEgJiYgKG5hbWVbMl0gPT09ICcuLicgfHwgbmFtZVswXSA9PT0gJy4uJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0VuZCBvZiB0aGUgbGluZS4gS2VlcCBhdCBsZWFzdCBvbmUgbm9uLWRvdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vcGF0aCBzZWdtZW50IGF0IHRoZSBmcm9udCBzbyBpdCBjYW4gYmUgbWFwcGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jb3JyZWN0bHkgdG8gZGlzay4gT3RoZXJ3aXNlLCB0aGVyZSBpcyBsaWtlbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL25vIHBhdGggbWFwcGluZyBmb3IgYSBwYXRoIHN0YXJ0aW5nIHdpdGggJy4uJy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1RoaXMgY2FuIHN0aWxsIGZhaWwsIGJ1dCBjYXRjaGVzIHRoZSBtb3N0IHJlYXNvbmFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL3VzZXMgb2YgLi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLnNwbGljZShpIC0gMSwgMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSAtPSAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vZW5kIHRyaW1Eb3RzXG5cbiAgICAgICAgICAgICAgICBuYW1lID0gbmFtZS5qb2luKFwiL1wiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobmFtZS5pbmRleE9mKCcuLycpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gYmFzZU5hbWUsIHNvIHRoaXMgaXMgSUQgaXMgcmVzb2x2ZWQgcmVsYXRpdmVcbiAgICAgICAgICAgICAgICAvLyB0byBiYXNlVXJsLCBwdWxsIG9mZiB0aGUgbGVhZGluZyBkb3QuXG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy9BcHBseSBtYXAgY29uZmlnIGlmIGF2YWlsYWJsZS5cbiAgICAgICAgaWYgKChiYXNlUGFydHMgfHwgc3Rhck1hcCkgJiYgbWFwKSB7XG4gICAgICAgICAgICBuYW1lUGFydHMgPSBuYW1lLnNwbGl0KCcvJyk7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IG5hbWVQYXJ0cy5sZW5ndGg7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgICAgICBuYW1lU2VnbWVudCA9IG5hbWVQYXJ0cy5zbGljZSgwLCBpKS5qb2luKFwiL1wiKTtcblxuICAgICAgICAgICAgICAgIGlmIChiYXNlUGFydHMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9GaW5kIHRoZSBsb25nZXN0IGJhc2VOYW1lIHNlZ21lbnQgbWF0Y2ggaW4gdGhlIGNvbmZpZy5cbiAgICAgICAgICAgICAgICAgICAgLy9TbywgZG8gam9pbnMgb24gdGhlIGJpZ2dlc3QgdG8gc21hbGxlc3QgbGVuZ3RocyBvZiBiYXNlUGFydHMuXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaiA9IGJhc2VQYXJ0cy5sZW5ndGg7IGogPiAwOyBqIC09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcFZhbHVlID0gbWFwW2Jhc2VQYXJ0cy5zbGljZSgwLCBqKS5qb2luKCcvJyldO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2Jhc2VOYW1lIHNlZ21lbnQgaGFzICBjb25maWcsIGZpbmQgaWYgaXQgaGFzIG9uZSBmb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcyBuYW1lLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwVmFsdWUgPSBtYXBWYWx1ZVtuYW1lU2VnbWVudF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vTWF0Y2gsIHVwZGF0ZSBuYW1lIHRvIHRoZSBuZXcgdmFsdWUuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kTWFwID0gbWFwVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kSSA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChmb3VuZE1hcCkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL0NoZWNrIGZvciBhIHN0YXIgbWFwIG1hdGNoLCBidXQganVzdCBob2xkIG9uIHRvIGl0LFxuICAgICAgICAgICAgICAgIC8vaWYgdGhlcmUgaXMgYSBzaG9ydGVyIHNlZ21lbnQgbWF0Y2ggbGF0ZXIgaW4gYSBtYXRjaGluZ1xuICAgICAgICAgICAgICAgIC8vY29uZmlnLCB0aGVuIGZhdm9yIG92ZXIgdGhpcyBzdGFyIG1hcC5cbiAgICAgICAgICAgICAgICBpZiAoIWZvdW5kU3Rhck1hcCAmJiBzdGFyTWFwICYmIHN0YXJNYXBbbmFtZVNlZ21lbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kU3Rhck1hcCA9IHN0YXJNYXBbbmFtZVNlZ21lbnRdO1xuICAgICAgICAgICAgICAgICAgICBzdGFySSA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWZvdW5kTWFwICYmIGZvdW5kU3Rhck1hcCkge1xuICAgICAgICAgICAgICAgIGZvdW5kTWFwID0gZm91bmRTdGFyTWFwO1xuICAgICAgICAgICAgICAgIGZvdW5kSSA9IHN0YXJJO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZm91bmRNYXApIHtcbiAgICAgICAgICAgICAgICBuYW1lUGFydHMuc3BsaWNlKDAsIGZvdW5kSSwgZm91bmRNYXApO1xuICAgICAgICAgICAgICAgIG5hbWUgPSBuYW1lUGFydHMuam9pbignLycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZVJlcXVpcmUocmVsTmFtZSwgZm9yY2VTeW5jKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvL0EgdmVyc2lvbiBvZiBhIG5vdHJlcXVpcmViZWNhc2Vicm93c2VyaWZ5bWVzc2VzdXAgZnVuY3Rpb24gdGhhdCBwYXNzZXMgYSBtb2R1bGVOYW1lXG4gICAgICAgICAgICAvL3ZhbHVlIGZvciBpdGVtcyB0aGF0IG1heSBuZWVkIHRvXG4gICAgICAgICAgICAvL2xvb2sgdXAgcGF0aHMgcmVsYXRpdmUgdG8gdGhlIG1vZHVsZU5hbWVcbiAgICAgICAgICAgIHZhciBhcmdzID0gYXBzLmNhbGwoYXJndW1lbnRzLCAwKTtcblxuICAgICAgICAgICAgLy9JZiBmaXJzdCBhcmcgaXMgbm90IG5vdHJlcXVpcmViZWNhc2Vicm93c2VyaWZ5bWVzc2VzdXAoJ3N0cmluZycpLCBhbmQgdGhlcmUgaXMgb25seVxuICAgICAgICAgICAgLy9vbmUgYXJnLCBpdCBpcyB0aGUgYXJyYXkgZm9ybSB3aXRob3V0IGEgY2FsbGJhY2suIEluc2VydFxuICAgICAgICAgICAgLy9hIG51bGwgc28gdGhhdCB0aGUgZm9sbG93aW5nIGNvbmNhdCBpcyBjb3JyZWN0LlxuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmdzWzBdICE9PSAnc3RyaW5nJyAmJiBhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXEuYXBwbHkodW5kZWYsIGFyZ3MuY29uY2F0KFtyZWxOYW1lLCBmb3JjZVN5bmNdKSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZU5vcm1hbGl6ZShyZWxOYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vcm1hbGl6ZShuYW1lLCByZWxOYW1lKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYWtlTG9hZChkZXBOYW1lKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGRlZmluZWRbZGVwTmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxsRGVwKG5hbWUpIHtcbiAgICAgICAgaWYgKGhhc1Byb3Aod2FpdGluZywgbmFtZSkpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gd2FpdGluZ1tuYW1lXTtcbiAgICAgICAgICAgIGRlbGV0ZSB3YWl0aW5nW25hbWVdO1xuICAgICAgICAgICAgZGVmaW5pbmdbbmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgbWFpbi5hcHBseSh1bmRlZiwgYXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhc1Byb3AoZGVmaW5lZCwgbmFtZSkgJiYgIWhhc1Byb3AoZGVmaW5pbmcsIG5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vICcgKyBuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmaW5lZFtuYW1lXTtcbiAgICB9XG5cbiAgICAvL1R1cm5zIGEgcGx1Z2luIXJlc291cmNlIHRvIFtwbHVnaW4sIHJlc291cmNlXVxuICAgIC8vd2l0aCB0aGUgcGx1Z2luIGJlaW5nIHVuZGVmaW5lZCBpZiB0aGUgbmFtZVxuICAgIC8vZGlkIG5vdCBoYXZlIGEgcGx1Z2luIHByZWZpeC5cbiAgICBmdW5jdGlvbiBzcGxpdFByZWZpeChuYW1lKSB7XG4gICAgICAgIHZhciBwcmVmaXgsXG4gICAgICAgICAgICBpbmRleCA9IG5hbWUgPyBuYW1lLmluZGV4T2YoJyEnKSA6IC0xO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgcHJlZml4ID0gbmFtZS5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKGluZGV4ICsgMSwgbmFtZS5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbcHJlZml4LCBuYW1lXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWtlcyBhIG5hbWUgbWFwLCBub3JtYWxpemluZyB0aGUgbmFtZSwgYW5kIHVzaW5nIGEgcGx1Z2luXG4gICAgICogZm9yIG5vcm1hbGl6YXRpb24gaWYgbmVjZXNzYXJ5LiBHcmFicyBhIHJlZiB0byBwbHVnaW5cbiAgICAgKiB0b28sIGFzIGFuIG9wdGltaXphdGlvbi5cbiAgICAgKi9cbiAgICBtYWtlTWFwID0gZnVuY3Rpb24gKG5hbWUsIHJlbE5hbWUpIHtcbiAgICAgICAgdmFyIHBsdWdpbixcbiAgICAgICAgICAgIHBhcnRzID0gc3BsaXRQcmVmaXgobmFtZSksXG4gICAgICAgICAgICBwcmVmaXggPSBwYXJ0c1swXTtcblxuICAgICAgICBuYW1lID0gcGFydHNbMV07XG5cbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgICAgcHJlZml4ID0gbm9ybWFsaXplKHByZWZpeCwgcmVsTmFtZSk7XG4gICAgICAgICAgICBwbHVnaW4gPSBjYWxsRGVwKHByZWZpeCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL05vcm1hbGl6ZSBhY2NvcmRpbmdcbiAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgICAgaWYgKHBsdWdpbiAmJiBwbHVnaW4ubm9ybWFsaXplKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IHBsdWdpbi5ub3JtYWxpemUobmFtZSwgbWFrZU5vcm1hbGl6ZShyZWxOYW1lKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5hbWUgPSBub3JtYWxpemUobmFtZSwgcmVsTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuYW1lID0gbm9ybWFsaXplKG5hbWUsIHJlbE5hbWUpO1xuICAgICAgICAgICAgcGFydHMgPSBzcGxpdFByZWZpeChuYW1lKTtcbiAgICAgICAgICAgIHByZWZpeCA9IHBhcnRzWzBdO1xuICAgICAgICAgICAgbmFtZSA9IHBhcnRzWzFdO1xuICAgICAgICAgICAgaWYgKHByZWZpeCkge1xuICAgICAgICAgICAgICAgIHBsdWdpbiA9IGNhbGxEZXAocHJlZml4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vVXNpbmcgcmlkaWN1bG91cyBwcm9wZXJ0eSBuYW1lcyBmb3Igc3BhY2UgcmVhc29uc1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZjogcHJlZml4ID8gcHJlZml4ICsgJyEnICsgbmFtZSA6IG5hbWUsIC8vZnVsbE5hbWVcbiAgICAgICAgICAgIG46IG5hbWUsXG4gICAgICAgICAgICBwcjogcHJlZml4LFxuICAgICAgICAgICAgcDogcGx1Z2luXG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG1ha2VDb25maWcobmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChjb25maWcgJiYgY29uZmlnLmNvbmZpZyAmJiBjb25maWcuY29uZmlnW25hbWVdKSB8fCB7fTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBoYW5kbGVycyA9IHtcbiAgICAgICAgbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBtYWtlUmVxdWlyZShuYW1lKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXhwb3J0czogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgIHZhciBlID0gZGVmaW5lZFtuYW1lXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChkZWZpbmVkW25hbWVdID0ge30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtb2R1bGU6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkOiBuYW1lLFxuICAgICAgICAgICAgICAgIHVyaTogJycsXG4gICAgICAgICAgICAgICAgZXhwb3J0czogZGVmaW5lZFtuYW1lXSxcbiAgICAgICAgICAgICAgICBjb25maWc6IG1ha2VDb25maWcobmFtZSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbWFpbiA9IGZ1bmN0aW9uIChuYW1lLCBkZXBzLCBjYWxsYmFjaywgcmVsTmFtZSkge1xuICAgICAgICB2YXIgY2pzTW9kdWxlLCBkZXBOYW1lLCByZXQsIG1hcCwgaSxcbiAgICAgICAgICAgIGFyZ3MgPSBbXSxcbiAgICAgICAgICAgIGNhbGxiYWNrVHlwZSA9IHR5cGVvZiBjYWxsYmFjayxcbiAgICAgICAgICAgIHVzaW5nRXhwb3J0cztcblxuICAgICAgICAvL1VzZSBuYW1lIGlmIG5vIHJlbE5hbWVcbiAgICAgICAgcmVsTmFtZSA9IHJlbE5hbWUgfHwgbmFtZTtcblxuICAgICAgICAvL0NhbGwgdGhlIGNhbGxiYWNrIHRvIGRlZmluZSB0aGUgbW9kdWxlLCBpZiBuZWNlc3NhcnkuXG4gICAgICAgIGlmIChjYWxsYmFja1R5cGUgPT09ICd1bmRlZmluZWQnIHx8IGNhbGxiYWNrVHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy9QdWxsIG91dCB0aGUgZGVmaW5lZCBkZXBlbmRlbmNpZXMgYW5kIHBhc3MgdGhlIG9yZGVyZWRcbiAgICAgICAgICAgIC8vdmFsdWVzIHRvIHRoZSBjYWxsYmFjay5cbiAgICAgICAgICAgIC8vRGVmYXVsdCB0byBbbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cCwgZXhwb3J0cywgbW9kdWxlXSBpZiBubyBkZXBzXG4gICAgICAgICAgICBkZXBzID0gIWRlcHMubGVuZ3RoICYmIGNhbGxiYWNrLmxlbmd0aCA/IFsnbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cCcsICdleHBvcnRzJywgJ21vZHVsZSddIDogZGVwcztcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBkZXBzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbWFwID0gbWFrZU1hcChkZXBzW2ldLCByZWxOYW1lKTtcbiAgICAgICAgICAgICAgICBkZXBOYW1lID0gbWFwLmY7XG5cbiAgICAgICAgICAgICAgICAvL0Zhc3QgcGF0aCBDb21tb25KUyBzdGFuZGFyZCBkZXBlbmRlbmNpZXMuXG4gICAgICAgICAgICAgICAgaWYgKGRlcE5hbWUgPT09IFwibm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbaV0gPSBoYW5kbGVycy5ub3RyZXF1aXJlYmVjYXNlYnJvd3NlcmlmeW1lc3Nlc3VwKG5hbWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVwTmFtZSA9PT0gXCJleHBvcnRzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9Db21tb25KUyBtb2R1bGUgc3BlYyAxLjFcbiAgICAgICAgICAgICAgICAgICAgYXJnc1tpXSA9IGhhbmRsZXJzLmV4cG9ydHMobmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIHVzaW5nRXhwb3J0cyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkZXBOYW1lID09PSBcIm1vZHVsZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vQ29tbW9uSlMgbW9kdWxlIHNwZWMgMS4xXG4gICAgICAgICAgICAgICAgICAgIGNqc01vZHVsZSA9IGFyZ3NbaV0gPSBoYW5kbGVycy5tb2R1bGUobmFtZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNQcm9wKGRlZmluZWQsIGRlcE5hbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNQcm9wKHdhaXRpbmcsIGRlcE5hbWUpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNQcm9wKGRlZmluaW5nLCBkZXBOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzW2ldID0gY2FsbERlcChkZXBOYW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1hcC5wKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5wLmxvYWQobWFwLm4sIG1ha2VSZXF1aXJlKHJlbE5hbWUsIHRydWUpLCBtYWtlTG9hZChkZXBOYW1lKSwge30pO1xuICAgICAgICAgICAgICAgICAgICBhcmdzW2ldID0gZGVmaW5lZFtkZXBOYW1lXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobmFtZSArICcgbWlzc2luZyAnICsgZGVwTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXQgPSBjYWxsYmFjayA/IGNhbGxiYWNrLmFwcGx5KGRlZmluZWRbbmFtZV0sIGFyZ3MpIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgICAgIC8vSWYgc2V0dGluZyBleHBvcnRzIHZpYSBcIm1vZHVsZVwiIGlzIGluIHBsYXksXG4gICAgICAgICAgICAgICAgLy9mYXZvciB0aGF0IG92ZXIgcmV0dXJuIHZhbHVlIGFuZCBleHBvcnRzLiBBZnRlciB0aGF0LFxuICAgICAgICAgICAgICAgIC8vZmF2b3IgYSBub24tdW5kZWZpbmVkIHJldHVybiB2YWx1ZSBvdmVyIGV4cG9ydHMgdXNlLlxuICAgICAgICAgICAgICAgIGlmIChjanNNb2R1bGUgJiYgY2pzTW9kdWxlLmV4cG9ydHMgIT09IHVuZGVmICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjanNNb2R1bGUuZXhwb3J0cyAhPT0gZGVmaW5lZFtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICBkZWZpbmVkW25hbWVdID0gY2pzTW9kdWxlLmV4cG9ydHM7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXQgIT09IHVuZGVmIHx8ICF1c2luZ0V4cG9ydHMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9Vc2UgdGhlIHJldHVybiB2YWx1ZSBmcm9tIHRoZSBmdW5jdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgZGVmaW5lZFtuYW1lXSA9IHJldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAobmFtZSkge1xuICAgICAgICAgICAgLy9NYXkganVzdCBiZSBhbiBvYmplY3QgZGVmaW5pdGlvbiBmb3IgdGhlIG1vZHVsZS4gT25seVxuICAgICAgICAgICAgLy93b3JyeSBhYm91dCBkZWZpbmluZyBpZiBoYXZlIGEgbW9kdWxlIG5hbWUuXG4gICAgICAgICAgICBkZWZpbmVkW25hbWVdID0gY2FsbGJhY2s7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cGpzID0gbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cCA9IHJlcSA9IGZ1bmN0aW9uIChkZXBzLCBjYWxsYmFjaywgcmVsTmFtZSwgZm9yY2VTeW5jLCBhbHQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkZXBzID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpZiAoaGFuZGxlcnNbZGVwc10pIHtcbiAgICAgICAgICAgICAgICAvL2NhbGxiYWNrIGluIHRoaXMgY2FzZSBpcyByZWFsbHkgcmVsTmFtZVxuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyc1tkZXBzXShjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL0p1c3QgcmV0dXJuIHRoZSBtb2R1bGUgd2FudGVkLiBJbiB0aGlzIHNjZW5hcmlvLCB0aGVcbiAgICAgICAgICAgIC8vZGVwcyBhcmcgaXMgdGhlIG1vZHVsZSBuYW1lLCBhbmQgc2Vjb25kIGFyZyAoaWYgcGFzc2VkKVxuICAgICAgICAgICAgLy9pcyBqdXN0IHRoZSByZWxOYW1lLlxuICAgICAgICAgICAgLy9Ob3JtYWxpemUgbW9kdWxlIG5hbWUsIGlmIGl0IGNvbnRhaW5zIC4gb3IgLi5cbiAgICAgICAgICAgIHJldHVybiBjYWxsRGVwKG1ha2VNYXAoZGVwcywgY2FsbGJhY2spLmYpO1xuICAgICAgICB9IGVsc2UgaWYgKCFkZXBzLnNwbGljZSkge1xuICAgICAgICAgICAgLy9kZXBzIGlzIGEgY29uZmlnIG9iamVjdCwgbm90IGFuIGFycmF5LlxuICAgICAgICAgICAgY29uZmlnID0gZGVwcztcbiAgICAgICAgICAgIGlmIChjb25maWcuZGVwcykge1xuICAgICAgICAgICAgICAgIHJlcShjb25maWcuZGVwcywgY29uZmlnLmNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjYWxsYmFjay5zcGxpY2UpIHtcbiAgICAgICAgICAgICAgICAvL2NhbGxiYWNrIGlzIGFuIGFycmF5LCB3aGljaCBtZWFucyBpdCBpcyBhIGRlcGVuZGVuY3kgbGlzdC5cbiAgICAgICAgICAgICAgICAvL0FkanVzdCBhcmdzIGlmIHRoZXJlIGFyZSBkZXBlbmRlbmNpZXNcbiAgICAgICAgICAgICAgICBkZXBzID0gY2FsbGJhY2s7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSByZWxOYW1lO1xuICAgICAgICAgICAgICAgIHJlbE5hbWUgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXBzID0gdW5kZWY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL1N1cHBvcnQgbm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cChbJ2EnXSlcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbiAoKSB7fTtcblxuICAgICAgICAvL0lmIHJlbE5hbWUgaXMgYSBmdW5jdGlvbiwgaXQgaXMgYW4gZXJyYmFjayBoYW5kbGVyLFxuICAgICAgICAvL3NvIHJlbW92ZSBpdC5cbiAgICAgICAgaWYgKHR5cGVvZiByZWxOYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICByZWxOYW1lID0gZm9yY2VTeW5jO1xuICAgICAgICAgICAgZm9yY2VTeW5jID0gYWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy9TaW11bGF0ZSBhc3luYyBjYWxsYmFjaztcbiAgICAgICAgaWYgKGZvcmNlU3luYykge1xuICAgICAgICAgICAgbWFpbih1bmRlZiwgZGVwcywgY2FsbGJhY2ssIHJlbE5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy9Vc2luZyBhIG5vbi16ZXJvIHZhbHVlIGJlY2F1c2Ugb2YgY29uY2VybiBmb3Igd2hhdCBvbGQgYnJvd3NlcnNcbiAgICAgICAgICAgIC8vZG8sIGFuZCBsYXRlc3QgYnJvd3NlcnMgXCJ1cGdyYWRlXCIgdG8gNCBpZiBsb3dlciB2YWx1ZSBpcyB1c2VkOlxuICAgICAgICAgICAgLy9odHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS90aW1lcnMuaHRtbCNkb20td2luZG93dGltZXJzLXNldHRpbWVvdXQ6XG4gICAgICAgICAgICAvL0lmIHdhbnQgYSB2YWx1ZSBpbW1lZGlhdGVseSwgdXNlIG5vdHJlcXVpcmViZWNhc2Vicm93c2VyaWZ5bWVzc2VzdXAoJ2lkJykgaW5zdGVhZCAtLSBzb21ldGhpbmdcbiAgICAgICAgICAgIC8vdGhhdCB3b3JrcyBpbiBhbG1vbmQgb24gdGhlIGdsb2JhbCBsZXZlbCwgYnV0IG5vdCBndWFyYW50ZWVkIGFuZFxuICAgICAgICAgICAgLy91bmxpa2VseSB0byB3b3JrIGluIG90aGVyIEFNRCBpbXBsZW1lbnRhdGlvbnMuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBtYWluKHVuZGVmLCBkZXBzLCBjYWxsYmFjaywgcmVsTmFtZSk7XG4gICAgICAgICAgICB9LCA0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXE7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEp1c3QgZHJvcHMgdGhlIGNvbmZpZyBvbiB0aGUgZmxvb3IsIGJ1dCByZXR1cm5zIHJlcSBpbiBjYXNlXG4gICAgICogdGhlIGNvbmZpZyByZXR1cm4gdmFsdWUgaXMgdXNlZC5cbiAgICAgKi9cbiAgICByZXEuY29uZmlnID0gZnVuY3Rpb24gKGNmZykge1xuICAgICAgICByZXR1cm4gcmVxKGNmZyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEV4cG9zZSBtb2R1bGUgcmVnaXN0cnkgZm9yIGRlYnVnZ2luZyBhbmQgdG9vbGluZ1xuICAgICAqL1xuICAgIG5vdHJlcXVpcmViZWNhc2Vicm93c2VyaWZ5bWVzc2VzdXBqcy5fZGVmaW5lZCA9IGRlZmluZWQ7XG5cbiAgICBkZWZpbmUgPSBmdW5jdGlvbiAobmFtZSwgZGVwcywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWUgYWxtb25kIFJFQURNRTogaW5jb3JyZWN0IG1vZHVsZSBidWlsZCwgbm8gbW9kdWxlIG5hbWUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vVGhpcyBtb2R1bGUgbWF5IG5vdCBoYXZlIGRlcGVuZGVuY2llc1xuICAgICAgICBpZiAoIWRlcHMuc3BsaWNlKSB7XG4gICAgICAgICAgICAvL2RlcHMgaXMgbm90IGFuIGFycmF5LCBzbyBwcm9iYWJseSBtZWFuc1xuICAgICAgICAgICAgLy9hbiBvYmplY3QgbGl0ZXJhbCBvciBmYWN0b3J5IGZ1bmN0aW9uIGZvclxuICAgICAgICAgICAgLy90aGUgdmFsdWUuIEFkanVzdCBhcmdzLlxuICAgICAgICAgICAgY2FsbGJhY2sgPSBkZXBzO1xuICAgICAgICAgICAgZGVwcyA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFoYXNQcm9wKGRlZmluZWQsIG5hbWUpICYmICFoYXNQcm9wKHdhaXRpbmcsIG5hbWUpKSB7XG4gICAgICAgICAgICB3YWl0aW5nW25hbWVdID0gW25hbWUsIGRlcHMsIGNhbGxiYWNrXTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBkZWZpbmUuYW1kID0ge1xuICAgICAgICBqUXVlcnk6IHRydWVcbiAgICB9O1xufSgpKTtcblxuZGVmaW5lKFwibm9kZV9tb2R1bGVzL2FsbW9uZC9hbG1vbmQuanNcIiwgZnVuY3Rpb24oKXt9KTtcblxuLypcbiAqIENvcHlyaWdodCAyMDE1LCBHcmVnZyBUYXZhcmVzLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5kZWZpbmUoJ3R3Z2wvdHlwZWRhcnJheXMnLFtdLCBmdW5jdGlvbiAoKSB7XG4gIFxuXG4gIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBzZWUgYSBnbG9iYWwgZ2xcbiAgdmFyIGdsID0gdW5kZWZpbmVkOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gIC8qIERhdGFUeXBlICovXG4gIHZhciBCWVRFICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAweDE0MDA7XG4gIHZhciBVTlNJR05FRF9CWVRFICAgICAgICAgICAgICAgICAgPSAweDE0MDE7XG4gIHZhciBTSE9SVCAgICAgICAgICAgICAgICAgICAgICAgICAgPSAweDE0MDI7XG4gIHZhciBVTlNJR05FRF9TSE9SVCAgICAgICAgICAgICAgICAgPSAweDE0MDM7XG4gIHZhciBJTlQgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAweDE0MDQ7XG4gIHZhciBVTlNJR05FRF9JTlQgICAgICAgICAgICAgICAgICAgPSAweDE0MDU7XG4gIHZhciBGTE9BVCAgICAgICAgICAgICAgICAgICAgICAgICAgPSAweDE0MDY7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgR0wgdHlwZSBmb3IgYSB0eXBlZEFycmF5XG4gICAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ8QXJyYXlCdWZmZXJWaWV3fSB0eXBlZEFycmF5IGEgdHlwZWRBcnJheVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBHTCB0eXBlIGZvciBhcnJheS4gRm9yIGV4YW1wbGUgcGFzcyBpbiBhbiBgSW50OEFycmF5YCBhbmQgYGdsLkJZVEVgIHdpbGxcbiAgICogICBiZSByZXR1cm5lZC4gUGFzcyBpbiBhIGBVaW50MzJBcnJheWAgYW5kIGBnbC5VTlNJR05FRF9JTlRgIHdpbGwgYmUgcmV0dXJuZWRcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBnZXRHTFR5cGVGb3JUeXBlZEFycmF5KHR5cGVkQXJyYXkpIHtcbiAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIEludDhBcnJheSkgICAgeyByZXR1cm4gQllURTsgfSAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgVWludDhBcnJheSkgICB7IHJldHVybiBVTlNJR05FRF9CWVRFOyB9ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBJbnQxNkFycmF5KSAgIHsgcmV0dXJuIFNIT1JUOyB9ICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIFVpbnQxNkFycmF5KSAgeyByZXR1cm4gVU5TSUdORURfU0hPUlQ7IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgSW50MzJBcnJheSkgICB7IHJldHVybiBJTlQ7IH0gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBVaW50MzJBcnJheSkgIHsgcmV0dXJuIFVOU0lHTkVEX0lOVDsgfSAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSkgeyByZXR1cm4gRkxPQVQ7IH0gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIHRocm93IFwidW5zdXBwb3J0ZWQgdHlwZWQgYXJyYXkgdHlwZVwiO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdHlwZWQgYXJyYXkgY29uc3RydWN0b3IgZm9yIGEgZ2l2ZW4gR0wgdHlwZVxuICAgKiBAcGFyYW0ge251bWJlcn0gdHlwZSB0aGUgR0wgdHlwZS4gKGVnOiBgZ2wuVU5TSUdORURfSU5UYClcbiAgICogQHJldHVybiB7ZnVuY3Rpb259IHRoZSBjb25zdHJ1Y3RvciBmb3IgYSB0aGUgY29ycmVzcG9uZGluZyB0eXBlZCBhcnJheS4gKGVnLiBgVWludDMyQXJyYXlgKS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBnZXRUeXBlZEFycmF5VHlwZUZvckdMVHlwZSh0eXBlKSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIEJZVEU6ICAgICAgICAgICByZXR1cm4gSW50OEFycmF5OyAgICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgY2FzZSBVTlNJR05FRF9CWVRFOiAgcmV0dXJuIFVpbnQ4QXJyYXk7ICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGNhc2UgU0hPUlQ6ICAgICAgICAgIHJldHVybiBJbnQxNkFycmF5OyAgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBjYXNlIFVOU0lHTkVEX1NIT1JUOiByZXR1cm4gVWludDE2QXJyYXk7ICAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgY2FzZSBJTlQ6ICAgICAgICAgICAgcmV0dXJuIEludDMyQXJyYXk7ICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGNhc2UgVU5TSUdORURfSU5UOiAgIHJldHVybiBVaW50MzJBcnJheTsgICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICBjYXNlIEZMT0FUOiAgICAgICAgICByZXR1cm4gRmxvYXQzMkFycmF5OyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgXCJ1bmtub3duIGdsIHR5cGVcIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc0FycmF5QnVmZmVyKGEpIHtcbiAgICByZXR1cm4gYSAmJiBhLmJ1ZmZlciAmJiBhLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyO1xuICB9XG5cbiAgLy8gVXNpbmcgcXVvdGVzIHByZXZlbnRzIFVnbGlmeSBmcm9tIGNoYW5naW5nIHRoZSBuYW1lcy5cbiAgcmV0dXJuIHtcbiAgICBcImdldEdMVHlwZUZvclR5cGVkQXJyYXlcIjogZ2V0R0xUeXBlRm9yVHlwZWRBcnJheSxcbiAgICBcImdldFR5cGVkQXJyYXlUeXBlRm9yR0xUeXBlXCI6IGdldFR5cGVkQXJyYXlUeXBlRm9yR0xUeXBlLFxuICAgIFwiaXNBcnJheUJ1ZmZlclwiOiBpc0FycmF5QnVmZmVyLFxuICB9O1xufSk7XG5cblxuLypcbiAqIENvcHlyaWdodCAyMDE1LCBHcmVnZyBUYXZhcmVzLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmRlZmluZSgndHdnbC9hdHRyaWJ1dGVzJyxbXG4gICAgJy4vdHlwZWRhcnJheXMnLFxuICBdLCBmdW5jdGlvbiAoXG4gICAgdHlwZWRBcnJheXMpIHtcbiAgXG5cbiAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IHNlZSBhIGdsb2JhbCBnbFxuICB2YXIgZ2wgPSB1bmRlZmluZWQ7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBhdHRyaWJQcmVmaXg6IFwiXCIsXG4gIH07XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlZmF1bHQgYXR0cmliIHByZWZpeFxuICAgKlxuICAgKiBXaGVuIHdyaXRpbmcgc2hhZGVycyBJIHByZWZlciB0byBuYW1lIGF0dHJpYnV0ZXMgd2l0aCBgYV9gLCB1bmlmb3JtcyB3aXRoIGB1X2AgYW5kIHZhcnlpbmdzIHdpdGggYHZfYFxuICAgKiBhcyBpdCBtYWtlcyBpdCBjbGVhciB3aGVyZSB0aGV5IGNhbWUgZnJvbS4gQnV0LCB3aGVuIGJ1aWxkaW5nIGdlb21ldHJ5IEkgcHJlZmVyIHVzaW5nIHVucHJlZml4ZWQgbmFtZXMuXG4gICAqXG4gICAqIEluIG90aGVyd29yZHMgSSdsbCBjcmVhdGUgYXJyYXlzIG9mIGdlb21ldHJ5IGxpa2UgdGhpc1xuICAgKlxuICAgKiAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgcG9zaXRpb246IC4uLlxuICAgKiAgICAgICBub3JtYWw6IC4uLlxuICAgKiAgICAgICB0ZXhjb29yZDogLi4uXG4gICAqICAgICB9O1xuICAgKlxuICAgKiBCdXQgbmVlZCB0aG9zZSBtYXBwZWQgdG8gYXR0cmlidXRlcyBhbmQgbXkgYXR0cmlidXRlcyBzdGFydCB3aXRoIGBhX2AuXG4gICAqXG4gICAqIEBkZXByZWNhdGVkIHNlZSB7QGxpbmsgbW9kdWxlOnR3Z2wuc2V0RGVmYXVsdHN9XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggcHJlZml4IGZvciBhdHRyaWJzXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0QXR0cmlidXRlUHJlZml4KHByZWZpeCkge1xuICAgIGRlZmF1bHRzLmF0dHJpYlByZWZpeCA9IHByZWZpeDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldERlZmF1bHRzKG5ld0RlZmF1bHRzKSB7XG4gICAgT2JqZWN0LmtleXMobmV3RGVmYXVsdHMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBkZWZhdWx0c1trZXldID0gbmV3RGVmYXVsdHNba2V5XTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCB0eXBlLCBidWZmZXIsIGFycmF5LCBkcmF3VHlwZSkge1xuICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgYnVmZmVyKTtcbiAgICBnbC5idWZmZXJEYXRhKHR5cGUsIGFycmF5LCBkcmF3VHlwZSB8fCBnbC5TVEFUSUNfRFJBVyk7XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gdHlwZWQgYXJyYXkgY3JlYXRlcyBhIFdlYkdMQnVmZmVyIGFuZCBjb3BpZXMgdGhlIHR5cGVkIGFycmF5XG4gICAqIGludG8gaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBBIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge0FycmF5QnVmZmVyfEFycmF5QnVmZmVyVmlld3xXZWJHTEJ1ZmZlcn0gdHlwZWRBcnJheSB0aGUgdHlwZWQgYXJyYXkuIE5vdGU6IElmIGEgV2ViR0xCdWZmZXIgaXMgcGFzc2VkIGluIGl0IHdpbGwganVzdCBiZSByZXR1cm5lZC4gTm8gYWN0aW9uIHdpbGwgYmUgdGFrZW5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt0eXBlXSB0aGUgR0wgYmluZCB0eXBlIGZvciB0aGUgYnVmZmVyLiBEZWZhdWx0ID0gYGdsLkFSUkFZX0JVRkZFUmAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZHJhd1R5cGVdIHRoZSBHTCBkcmF3IHR5cGUgZm9yIHRoZSBidWZmZXIuIERlZmF1bHQgPSAnZ2wuU1RBVElDX0RSQVdgLlxuICAgKiBAcmV0dXJuIHtXZWJHTEJ1ZmZlcn0gdGhlIGNyZWF0ZWQgV2ViR0xCdWZmZXJcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVCdWZmZXJGcm9tVHlwZWRBcnJheShnbCwgdHlwZWRBcnJheSwgdHlwZSwgZHJhd1R5cGUpIHtcbiAgICBpZiAodHlwZWRBcnJheSBpbnN0YW5jZW9mIFdlYkdMQnVmZmVyKSB7XG4gICAgICByZXR1cm4gdHlwZWRBcnJheTtcbiAgICB9XG4gICAgdHlwZSA9IHR5cGUgfHwgZ2wuQVJSQVlfQlVGRkVSO1xuICAgIHZhciBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICBzZXRCdWZmZXJGcm9tVHlwZWRBcnJheShnbCwgdHlwZSwgYnVmZmVyLCB0eXBlZEFycmF5LCBkcmF3VHlwZSk7XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSW5kaWNlcyhuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWUgPT09IFwiaW5kaWNlc1wiO1xuICB9XG5cbiAgLy8gVGhpcyBpcyByZWFsbHkganVzdCBhIGd1ZXNzLiBUaG91Z2ggSSBjYW4ndCByZWFsbHkgaW1hZ2luZSB1c2luZ1xuICAvLyBhbnl0aGluZyBlbHNlPyBNYXliZSBmb3Igc29tZSBjb21wcmVzc2lvbj9cbiAgZnVuY3Rpb24gZ2V0Tm9ybWFsaXphdGlvbkZvclR5cGVkQXJyYXkodHlwZWRBcnJheSkge1xuICAgIGlmICh0eXBlZEFycmF5IGluc3RhbmNlb2YgSW50OEFycmF5KSAgICB7IHJldHVybiB0cnVlOyB9ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgaWYgKHR5cGVkQXJyYXkgaW5zdGFuY2VvZiBVaW50OEFycmF5KSAgIHsgcmV0dXJuIHRydWU7IH0gIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBndWVzc051bUNvbXBvbmVudHNGcm9tTmFtZShuYW1lLCBsZW5ndGgpIHtcbiAgICB2YXIgbnVtQ29tcG9uZW50cztcbiAgICBpZiAobmFtZS5pbmRleE9mKFwiY29vcmRcIikgPj0gMCkge1xuICAgICAgbnVtQ29tcG9uZW50cyA9IDI7XG4gICAgfSBlbHNlIGlmIChuYW1lLmluZGV4T2YoXCJjb2xvclwiKSA+PSAwKSB7XG4gICAgICBudW1Db21wb25lbnRzID0gNDtcbiAgICB9IGVsc2Uge1xuICAgICAgbnVtQ29tcG9uZW50cyA9IDM7ICAvLyBwb3NpdGlvbiwgbm9ybWFscywgaW5kaWNlcyAuLi5cbiAgICB9XG5cbiAgICBpZiAobGVuZ3RoICUgbnVtQ29tcG9uZW50cyA+IDApIHtcbiAgICAgIHRocm93IFwiY2FuIG5vdCBndWVzcyBudW1Db21wb25lbnRzLiBZb3Ugc2hvdWxkIHNwZWNpZnkgaXQuXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bUNvbXBvbmVudHM7XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlVHlwZWRBcnJheShhcnJheSwgbmFtZSkge1xuICAgIGlmICh0eXBlZEFycmF5cy5pc0FycmF5QnVmZmVyKGFycmF5KSkge1xuICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cblxuICAgIGlmICh0eXBlZEFycmF5cy5pc0FycmF5QnVmZmVyKGFycmF5LmRhdGEpKSB7XG4gICAgICByZXR1cm4gYXJyYXkuZGF0YTtcbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShhcnJheSkpIHtcbiAgICAgIGFycmF5ID0ge1xuICAgICAgICBkYXRhOiBhcnJheSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIFR5cGUgPSBhcnJheS50eXBlO1xuICAgIGlmICghVHlwZSkge1xuICAgICAgaWYgKG5hbWUgPT09IFwiaW5kaWNlc1wiKSB7XG4gICAgICAgIFR5cGUgPSBVaW50MTZBcnJheTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFR5cGUgPSBGbG9hdDMyQXJyYXk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgVHlwZShhcnJheS5kYXRhKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgaW5mbyBmb3IgYW4gYXR0cmlidXRlLiBUaGlzIGlzIGVmZmVjdGl2ZWx5IGp1c3QgdGhlIGFyZ3VtZW50cyB0byBgZ2wudmVydGV4QXR0cmliUG9pbnRlcmAgcGx1cyB0aGUgV2ViR0xCdWZmZXJcbiAgICogZm9yIHRoZSBhdHRyaWJ1dGUuXG4gICAqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IEF0dHJpYkluZm9cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtudW1Db21wb25lbnRzXSB0aGUgbnVtYmVyIG9mIGNvbXBvbmVudHMgZm9yIHRoaXMgYXR0cmlidXRlLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3NpemVdIHN5bm9ueW0gZm9yIGBudW1Db21wb25lbnRzYC5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFt0eXBlXSB0aGUgdHlwZSBvZiB0aGUgYXR0cmlidXRlIChlZy4gYGdsLkZMT0FUYCwgYGdsLlVOU0lHTkVEX0JZVEVgLCBldGMuLi4pIERlZmF1bHQgPSBgZ2wuRkxPQVRgXG4gICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gW25vcm1hbGl6ZWRdIHdoZXRoZXIgb3Igbm90IHRvIG5vcm1hbGl6ZSB0aGUgZGF0YS4gRGVmYXVsdCA9IGZhbHNlXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbb2Zmc2V0XSBvZmZzZXQgaW50byBidWZmZXIgaW4gYnl0ZXMuIERlZmF1bHQgPSAwXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbc3RyaWRlXSB0aGUgc3RyaWRlIGluIGJ5dGVzIHBlciBlbGVtZW50LiBEZWZhdWx0ID0gMFxuICAgKiBAcHJvcGVydHkge1dlYkdMQnVmZmVyfSBidWZmZXIgdGhlIGJ1ZmZlciB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIGZvciB0aGlzIGF0dHJpYnV0ZVxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW2RyYXdUeXBlXSB0aGUgZHJhdyB0eXBlIHBhc3NlZCB0byBnbC5idWZmZXJEYXRhLiBEZWZhdWx0ID0gZ2wuU1RBVElDX0RSQVdcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG4gIC8qKlxuICAgKiBVc2UgdGhpcyB0eXBlIG9mIGFycmF5IHNwZWMgd2hlbiBUV0dMIGNhbid0IGd1ZXNzIHRoZSB0eXBlIG9yIG51bWJlciBvZiBjb21wb21lbnRzIG9mIGFuIGFycmF5XG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IEZ1bGxBcnJheVNwZWNcbiAgICogQHByb3BlcnR5IHsobnVtYmVyW118QXJyYXlCdWZmZXIpfSBkYXRhIFRoZSBkYXRhIG9mIHRoZSBhcnJheS5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtudW1Db21wb25lbnRzXSBudW1iZXIgb2YgY29tcG9uZW50cyBmb3IgYHZlcnRleEF0dHJpYlBvaW50ZXJgLiBEZWZhdWx0IGlzIGJhc2VkIG9uIHRoZSBuYW1lIG9mIHRoZSBhcnJheS5cbiAgICogICAgSWYgYGNvb3JkYCBpcyBpbiB0aGUgbmFtZSBhc3N1bWVzIGBudW1Db21wb25lbnRzID0gMmAuXG4gICAqICAgIElmIGBjb2xvcmAgaXMgaW4gdGhlIG5hbWUgYXNzdW1lcyBgbnVtQ29tcG9uZW50cyA9IDRgLlxuICAgKiAgICBvdGhlcndpc2UgYXNzdW1lcyBgbnVtQ29tcG9uZW50cyA9IDNgXG4gICAqIEBwcm9wZXJ0eSB7Y29uc3RydWN0b3J9IHR5cGUgVGhlIHR5cGUuIFRoaXMgaXMgb25seSB1c2VkIGlmIGBkYXRhYCBpcyBhIEphdmFTY3JpcHQgYXJyYXkuIEl0IGlzIHRoZSBjb25zdHJ1Y3RvciBmb3IgdGhlIHR5cGVkYXJyYXkuIChlZy4gYFVpbnQ4QXJyYXlgKS5cbiAgICogRm9yIGV4YW1wbGUgaWYgeW91IHdhbnQgY29sb3JzIGluIGEgYFVpbnQ4QXJyYXlgIHlvdSBtaWdodCBoYXZlIGEgYEZ1bGxBcnJheVNwZWNgIGxpa2UgYHsgdHlwZTogVWludDhBcnJheSwgZGF0YTogWzI1NSwwLDI1NSwyNTUsIC4uLl0sIH1gLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3NpemVdIHN5bm9ueW0gZm9yIGBudW1Db21wb25lbnRzYC5cbiAgICogQHByb3BlcnR5IHtib29sZWFufSBbbm9ybWFsaXplXSBub3JtYWxpemUgZm9yIGB2ZXJ0ZXhBdHRyaWJQb2ludGVyYC4gRGVmYXVsdCBpcyB0cnVlIGlmIHR5cGUgaXMgYEludDhBcnJheWAgb3IgYFVpbnQ4QXJyYXlgIG90aGVyd2lzZSBmYWxzZS5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtzdHJpZGVdIHN0cmlkZSBmb3IgYHZlcnRleEF0dHJpYlBvaW50ZXJgLiBEZWZhdWx0ID0gMFxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW29mZnNldF0gb2Zmc2V0IGZvciBgdmVydGV4QXR0cmliUG9pbnRlcmAuIERlZmF1bHQgPSAwXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbYXR0cmliXSBuYW1lIG9mIGF0dHJpYnV0ZSB0aGlzIGFycmF5IG1hcHMgdG8uIERlZmF1bHRzIHRvIHNhbWUgbmFtZSBhcyBhcnJheSBwcmVmaXhlZCBieSB0aGUgZGVmYXVsdCBhdHRyaWJQcmVmaXguXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbbmFtZV0gc3lub255bSBmb3IgYGF0dHJpYmAuXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbYXR0cmliTmFtZV0gc3lub255bSBmb3IgYGF0dHJpYmAuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogQW4gaW5kaXZpZHVhbCBhcnJheSBpbiB7QGxpbmsgbW9kdWxlOnR3Z2wuQXJyYXlzfVxuICAgKlxuICAgKiBXaGVuIHBhc3NlZCB0byB7QGxpbmsgbW9kdWxlOnR3Z2wuY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXN9IGlmIGFuIEFycmF5U3BlYyBpcyBgbnVtYmVyW11gIG9yIGBBcnJheUJ1ZmZlcmBcbiAgICogdGhlIHR5cGVzIHdpbGwgYmUgZ3Vlc3NlZCBiYXNlZCBvbiB0aGUgbmFtZS4gYGluZGljZXNgIHdpbGwgYmUgYFVpbnQxNkFycmF5YCwgZXZlcnl0aGluZyBlbHNlIHdpbGxcbiAgICogYmUgYEZsb2F0MzJBcnJheWBcbiAgICpcbiAgICogQHR5cGVkZWYgeyhudW1iZXJbXXxBcnJheUJ1ZmZlcnxtb2R1bGU6dHdnbC5GdWxsQXJyYXlTcGVjKX0gQXJyYXlTcGVjXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogVGhpcyBpcyBhIEphdmFTY3JpcHQgb2JqZWN0IG9mIGFycmF5cyBieSBuYW1lLiBUaGUgbmFtZXMgc2hvdWxkIG1hdGNoIHlvdXIgc2hhZGVyJ3MgYXR0cmlidXRlcy4gSWYgeW91clxuICAgKiBhdHRyaWJ1dGVzIGhhdmUgYSBjb21tb24gcHJlZml4IHlvdSBjYW4gc3BlY2lmeSBpdCBieSBjYWxsaW5nIHtAbGluayBtb2R1bGU6dHdnbC5zZXRBdHRyaWJ1dGVQcmVmaXh9LlxuICAgKlxuICAgKiAgICAgQmFyZSBKYXZhU2NyaXB0IEFycmF5c1xuICAgKlxuICAgKiAgICAgICAgIHZhciBhcnJheXMgPSB7XG4gICAqICAgICAgICAgICAgcG9zaXRpb246IFstMSwgMSwgMF0sXG4gICAqICAgICAgICAgICAgbm9ybWFsOiBbMCwgMSwgMF0sXG4gICAqICAgICAgICAgICAgLi4uXG4gICAqICAgICAgICAgfVxuICAgKlxuICAgKiAgICAgQmFyZSBUeXBlZEFycmF5c1xuICAgKlxuICAgKiAgICAgICAgIHZhciBhcnJheXMgPSB7XG4gICAqICAgICAgICAgICAgcG9zaXRpb246IG5ldyBGbG9hdDMyQXJyYXkoWy0xLCAxLCAwXSksXG4gICAqICAgICAgICAgICAgY29sb3I6IG5ldyBVaW50OEFycmF5KFsyNTUsIDEyOCwgNjQsIDI1NV0pLFxuICAgKiAgICAgICAgICAgIC4uLlxuICAgKiAgICAgICAgIH1cbiAgICpcbiAgICogKiAgIFdpbGwgZ3Vlc3MgYXQgYG51bUNvbXBvbmVudHNgIGlmIG5vdCBzcGVjaWZpZWQgYmFzZWQgb24gbmFtZS5cbiAgICpcbiAgICogICAgIElmIGBjb29yZGAgaXMgaW4gdGhlIG5hbWUgYXNzdW1lcyBgbnVtQ29tcG9uZW50cyA9IDJgXG4gICAqXG4gICAqICAgICBJZiBgY29sb3JgIGlzIGluIHRoZSBuYW1lIGFzc3VtZXMgYG51bUNvbXBvbmVudHMgPSA0YFxuICAgKlxuICAgKiAgICAgb3RoZXJ3aXNlIGFzc3VtZXMgYG51bUNvbXBvbmVudHMgPSAzYFxuICAgKlxuICAgKiBPYmplY3RzIHdpdGggdmFyaW91cyBmaWVsZHMuIFNlZSB7QGxpbmsgbW9kdWxlOnR3Z2wuRnVsbEFycmF5U3BlY30uXG4gICAqXG4gICAqICAgICB2YXIgYXJyYXlzID0ge1xuICAgKiAgICAgICBwb3NpdGlvbjogeyBudW1Db21wb25lbnRzOiAzLCBkYXRhOiBbMCwgMCwgMCwgMTAsIDAsIDAsIDAsIDEwLCAwLCAxMCwgMTAsIDBdLCB9LFxuICAgKiAgICAgICB0ZXhjb29yZDogeyBudW1Db21wb25lbnRzOiAyLCBkYXRhOiBbMCwgMCwgMCwgMSwgMSwgMCwgMSwgMV0sICAgICAgICAgICAgICAgICB9LFxuICAgKiAgICAgICBub3JtYWw6ICAgeyBudW1Db21wb25lbnRzOiAzLCBkYXRhOiBbMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMV0sICAgICB9LFxuICAgKiAgICAgICBpbmRpY2VzOiAgeyBudW1Db21wb25lbnRzOiAzLCBkYXRhOiBbMCwgMSwgMiwgMSwgMiwgM10sICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogQHR5cGVkZWYge09iamVjdC48c3RyaW5nLCBtb2R1bGU6dHdnbC5BcnJheVNwZWM+fSBBcnJheXNcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBzZXQgb2YgYXR0cmlidXRlIGRhdGEgYW5kIFdlYkdMQnVmZmVycyBmcm9tIHNldCBvZiBhcnJheXNcbiAgICpcbiAgICogR2l2ZW5cbiAgICpcbiAgICogICAgICB2YXIgYXJyYXlzID0ge1xuICAgKiAgICAgICAgcG9zaXRpb246IHsgbnVtQ29tcG9uZW50czogMywgZGF0YTogWzAsIDAsIDAsIDEwLCAwLCAwLCAwLCAxMCwgMCwgMTAsIDEwLCAwXSwgfSxcbiAgICogICAgICAgIHRleGNvb3JkOiB7IG51bUNvbXBvbmVudHM6IDIsIGRhdGE6IFswLCAwLCAwLCAxLCAxLCAwLCAxLCAxXSwgICAgICAgICAgICAgICAgIH0sXG4gICAqICAgICAgICBub3JtYWw6ICAgeyBudW1Db21wb25lbnRzOiAzLCBkYXRhOiBbMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMV0sICAgICB9LFxuICAgKiAgICAgICAgY29sb3I6ICAgIHsgbnVtQ29tcG9uZW50czogNCwgZGF0YTogWzI1NSwgMjU1LCAyNTUsIDI1NSwgMjU1LCAwLCAwLCAyNTUsIDAsIDAsIDI1NSwgMjU1XSwgdHlwZTogVWludDhBcnJheSwgfSxcbiAgICogICAgICAgIGluZGljZXM6ICB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IFswLCAxLCAyLCAxLCAyLCAzXSwgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAqICAgICAgfTtcbiAgICpcbiAgICogcmV0dXJucyBzb21ldGhpbmcgbGlrZVxuICAgKlxuICAgKiAgICAgIHZhciBhdHRyaWJzID0ge1xuICAgKiAgICAgICAgcG9zaXRpb246IHsgbnVtQ29tcG9uZW50czogMywgdHlwZTogZ2wuRkxPQVQsICAgICAgICAgbm9ybWFsaXplOiBmYWxzZSwgYnVmZmVyOiBXZWJHTEJ1ZmZlciwgfSxcbiAgICogICAgICAgIHRleGNvb3JkOiB7IG51bUNvbXBvbmVudHM6IDIsIHR5cGU6IGdsLkZMT0FULCAgICAgICAgIG5vcm1hbGl6ZTogZmFsc2UsIGJ1ZmZlcjogV2ViR0xCdWZmZXIsIH0sXG4gICAqICAgICAgICBub3JtYWw6ICAgeyBudW1Db21wb25lbnRzOiAzLCB0eXBlOiBnbC5GTE9BVCwgICAgICAgICBub3JtYWxpemU6IGZhbHNlLCBidWZmZXI6IFdlYkdMQnVmZmVyLCB9LFxuICAgKiAgICAgICAgY29sb3I6ICAgIHsgbnVtQ29tcG9uZW50czogNCwgdHlwZTogZ2wuVU5TSUdORURfQllURSwgbm9ybWFsaXplOiB0cnVlLCAgYnVmZmVyOiBXZWJHTEJ1ZmZlciwgfSxcbiAgICogICAgICB9O1xuICAgKlxuICAgKiBub3RlczpcbiAgICpcbiAgICogKiAgIEFycmF5cyBjYW4gdGFrZSB2YXJpb3VzIGZvcm1zXG4gICAqXG4gICAqICAgICBCYXJlIEphdmFTY3JpcHQgQXJyYXlzXG4gICAqXG4gICAqICAgICAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgICAgICBwb3NpdGlvbjogWy0xLCAxLCAwXSxcbiAgICogICAgICAgICAgICBub3JtYWw6IFswLCAxLCAwXSxcbiAgICogICAgICAgICAgICAuLi5cbiAgICogICAgICAgICB9XG4gICAqXG4gICAqICAgICBCYXJlIFR5cGVkQXJyYXlzXG4gICAqXG4gICAqICAgICAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgICAgICBwb3NpdGlvbjogbmV3IEZsb2F0MzJBcnJheShbLTEsIDEsIDBdKSxcbiAgICogICAgICAgICAgICBjb2xvcjogbmV3IFVpbnQ4QXJyYXkoWzI1NSwgMTI4LCA2NCwgMjU1XSksXG4gICAqICAgICAgICAgICAgLi4uXG4gICAqICAgICAgICAgfVxuICAgKlxuICAgKiAqICAgV2lsbCBndWVzcyBhdCBgbnVtQ29tcG9uZW50c2AgaWYgbm90IHNwZWNpZmllZCBiYXNlZCBvbiBuYW1lLlxuICAgKlxuICAgKiAgICAgSWYgYGNvb3JkYCBpcyBpbiB0aGUgbmFtZSBhc3N1bWVzIGBudW1Db21wb25lbnRzID0gMmBcbiAgICpcbiAgICogICAgIElmIGBjb2xvcmAgaXMgaW4gdGhlIG5hbWUgYXNzdW1lcyBgbnVtQ29tcG9uZW50cyA9IDRgXG4gICAqXG4gICAqICAgICBvdGhlcndpc2UgYXNzdW1lcyBgbnVtQ29tcG9uZW50cyA9IDNgXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgd2ViZ2wgcmVuZGVyaW5nIGNvbnRleHQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuQXJyYXlzfSBhcnJheXMgVGhlIGFycmF5c1xuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgbW9kdWxlOnR3Z2wuQXR0cmliSW5mbz59IHRoZSBhdHRyaWJzXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQXR0cmlic0Zyb21BcnJheXMoZ2wsIGFycmF5cykge1xuICAgIHZhciBhdHRyaWJzID0ge307XG4gICAgT2JqZWN0LmtleXMoYXJyYXlzKS5mb3JFYWNoKGZ1bmN0aW9uKGFycmF5TmFtZSkge1xuICAgICAgaWYgKCFpc0luZGljZXMoYXJyYXlOYW1lKSkge1xuICAgICAgICB2YXIgYXJyYXkgPSBhcnJheXNbYXJyYXlOYW1lXTtcbiAgICAgICAgdmFyIGF0dHJpYk5hbWUgPSBhcnJheS5hdHRyaWIgfHwgYXJyYXkubmFtZSB8fCBhcnJheS5hdHRyaWJOYW1lIHx8IChkZWZhdWx0cy5hdHRyaWJQcmVmaXggKyBhcnJheU5hbWUpO1xuICAgICAgICB2YXIgdHlwZWRBcnJheSA9IG1ha2VUeXBlZEFycmF5KGFycmF5LCBhcnJheU5hbWUpO1xuICAgICAgICBhdHRyaWJzW2F0dHJpYk5hbWVdID0ge1xuICAgICAgICAgIGJ1ZmZlcjogICAgICAgIGNyZWF0ZUJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCB0eXBlZEFycmF5LCB1bmRlZmluZWQsIGFycmF5LmRyYXdUeXBlKSxcbiAgICAgICAgICBudW1Db21wb25lbnRzOiBhcnJheS5udW1Db21wb25lbnRzIHx8IGFycmF5LnNpemUgfHwgZ3Vlc3NOdW1Db21wb25lbnRzRnJvbU5hbWUoYXJyYXlOYW1lKSxcbiAgICAgICAgICB0eXBlOiAgICAgICAgICB0eXBlZEFycmF5cy5nZXRHTFR5cGVGb3JUeXBlZEFycmF5KHR5cGVkQXJyYXkpLFxuICAgICAgICAgIG5vcm1hbGl6ZTogICAgIGFycmF5Lm5vcm1hbGl6ZSAhPT0gdW5kZWZpbmVkID8gYXJyYXkubm9ybWFsaXplIDogZ2V0Tm9ybWFsaXphdGlvbkZvclR5cGVkQXJyYXkodHlwZWRBcnJheSksXG4gICAgICAgICAgc3RyaWRlOiAgICAgICAgYXJyYXkuc3RyaWRlIHx8IDAsXG4gICAgICAgICAgb2Zmc2V0OiAgICAgICAgYXJyYXkub2Zmc2V0IHx8IDAsXG4gICAgICAgICAgZHJhd1R5cGU6ICAgICAgYXJyYXkuZHJhd1R5cGUsXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGF0dHJpYnM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY29udGVudHMgb2YgYSBidWZmZXIgYXR0YWNoZWQgdG8gYW4gYXR0cmliSW5mb1xuICAgKlxuICAgKiBUaGlzIGlzIGhlbHBlciBmdW5jdGlvbiB0byBkeW5hbWljYWxseSB1cGRhdGUgYSBidWZmZXIuXG4gICAqXG4gICAqIExldCdzIHNheSB5b3UgbWFrZSBhIGJ1ZmZlckluZm9cbiAgICpcbiAgICogICAgIHZhciBhcnJheXMgPSB7XG4gICAqICAgICAgICBwb3NpdGlvbjogbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMCwgMTAsIDAsIDAsIDAsIDEwLCAwLCAxMCwgMTAsIDBdKSxcbiAgICogICAgICAgIHRleGNvb3JkOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxLCAxLCAwLCAxLCAxXSksXG4gICAqICAgICAgICBub3JtYWw6ICAgbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMV0pLFxuICAgKiAgICAgICAgaW5kaWNlczogIG5ldyBVaW50MTZBcnJheShbMCwgMSwgMiwgMSwgMiwgM10pLFxuICAgKiAgICAgfTtcbiAgICogICAgIHZhciBidWZmZXJJbmZvID0gdHdnbC5jcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5cyhnbCwgYXJyYXlzKTtcbiAgICpcbiAgICogIEFuZCB5b3Ugd2FudCB0byBkeW5hbWljYWxseSB1cGF0ZSB0aGUgcG9zaXRpb25zLiBZb3UgY291bGQgZG8gdGhpc1xuICAgKlxuICAgKiAgICAgLy8gYXNzdW1pbmcgYXJyYXlzLnBvc2l0aW9uIGhhcyBhbHJlYWR5IGJlZW4gdXBkYXRlZCB3aXRoIG5ldyBkYXRhLlxuICAgKiAgICAgdHdnbC5zZXRBdHRyaWJJbmZvQnVmZmVyRnJvbUFycmF5KGdsLCBidWZmZXJJbmZvLmF0dHJpYnMucG9zaXRpb24sIGFycmF5cy5wb3NpdGlvbik7XG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbFxuICAgKiBAcGFyYW0ge0F0dHJpYkluZm99IGF0dHJpYkluZm8gVGhlIGF0dHJpYkluZm8gd2hvJ3MgYnVmZmVyIGNvbnRlbnRzIHRvIHNldC4gTk9URTogSWYgeW91IGhhdmUgYW4gYXR0cmlidXRlIHByZWZpeFxuICAgKiAgIHRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGUgd2lsbCBpbmNsdWRlIHRoZSBwcmVmaXguXG4gICAqIEBwYXJhbSB7QXJyYXlTcGVjfSBhcnJheSBOb3RlOiBpdCBpcyBhcmd1YWJseSBpbmVmZmllbnQgdG8gcGFzcyBpbiBhbnl0aGluZyBidXQgYSB0eXBlZCBhcnJheSBiZWNhdXNlIGFueXRoaW5nXG4gICAqICAgIGVsc2Ugd2lsbCBoYXZlIHRvIGJlIGNvbnZlcnRlZCB0byBhIHR5cGVkIGFycmF5IGJlZm9yZSBpdCBjYW4gYmUgdXNlZCBieSBXZWJHTC4gRHVyaW5nIGluaXQgdGltZSB0aGF0XG4gICAqICAgIGluZWZmaWNpZW5jeSBpcyB1c3VhbGx5IG5vdCBpbXBvcnRhbnQgYnV0IGlmIHlvdSdyZSB1cGRhdGluZyBkYXRhIGR5bmFtaWNhbGx5IGJlc3QgdG8gYmUgZWZmaWNpZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29mZnNldF0gYW4gb3B0aW9uYWwgb2Zmc2V0IGludG8gdGhlIGJ1ZmZlci4gVGhpcyBpcyBvbmx5IGFuIG9mZnNldCBpbnRvIHRoZSBXZWJHTCBidWZmZXJcbiAgICogICAgbm90IHRoZSBhcnJheS4gVG8gcGFzcyBpbiBhbiBvZmZzZXQgaW50byB0aGUgYXJyYXkgaXRzZWxmIHVzZSBhIHR5cGVkIGFycmF5IGFuZCBjcmVhdGUgYW4gYEFycmF5QnVmZmVyVmlld2BcbiAgICogICAgZm9yIHRoZSBwb3J0aW9uIG9mIHRoZSBhcnJheSB5b3Ugd2FudCB0byB1c2UuXG4gICAqXG4gICAqICAgICAgICB2YXIgc29tZUFycmF5ID0gbmV3IEZsb2F0MzJBcnJheSgxMDAwKTsgLy8gYW4gYXJyYXkgd2l0aCAxMDAwIGZsb2F0c1xuICAgKiAgICAgICAgdmFyIHNvbWVTdWJBcnJheSA9IG5ldyBGbG9hdDMyQXJyYXkoc29tZUFycmF5LmJ1ZmZlciwgb2Zmc2V0SW5CeXRlcywgc2l6ZUluVW5pdHMpOyAvLyBhIHZpZXcgaW50byBzb21lQXJyYXlcbiAgICpcbiAgICogICAgTm93IHlvdSBjYW4gcGFzcyBgc29tZVN1YkFycmF5YCBpbnRvIHNldEF0dHJpYkluZm9CdWZmZXJGcm9tQXJyYXlgXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0QXR0cmliSW5mb0J1ZmZlckZyb21BcnJheShnbCwgYXR0cmliSW5mbywgYXJyYXksIG9mZnNldCkge1xuICAgIGFycmF5ID0gbWFrZVR5cGVkQXJyYXkoYXJyYXkpO1xuICAgIGlmIChvZmZzZXQpIHtcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBhdHRyaWJJbmZvLmJ1ZmZlcik7XG4gICAgICBnbC5idWZmZXJTdWJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgb2Zmc2V0LCBhcnJheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldEJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCBnbC5BUlJBWV9CVUZGRVIsIGF0dHJpYkluZm8uYnVmZmVyLCBhcnJheSwgYXR0cmliSW5mby5kcmF3VHlwZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHRyaWVzIHRvIGdldCB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGZyb20gYSBzZXQgb2YgYXJyYXlzLlxuICAgKi9cblxuICB2YXIgZ2V0TnVtRWxlbWVudHNGcm9tTm9uSW5kZXhlZEFycmF5cyA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9zaXRpb25LZXlzID0gWydwb3NpdGlvbicsICdwb3NpdGlvbnMnLCAnYV9wb3NpdGlvbiddO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGdldE51bUVsZW1lbnRzRnJvbU5vbkluZGV4ZWRBcnJheXMoYXJyYXlzKSB7XG4gICAgICB2YXIga2V5O1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHBvc2l0aW9uS2V5cy5sZW5ndGg7ICsraWkpIHtcbiAgICAgICAga2V5ID0gcG9zaXRpb25LZXlzW2lpXTtcbiAgICAgICAgaWYgKGtleSBpbiBhcnJheXMpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGlpID09PSBwb3NpdGlvbktleXMubGVuZ3RoKSB7XG4gICAgICAgIGtleSA9IE9iamVjdC5rZXlzKGFycmF5cylbMF07XG4gICAgICB9XG4gICAgICB2YXIgYXJyYXkgPSBhcnJheXNba2V5XTtcbiAgICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggfHwgYXJyYXkuZGF0YS5sZW5ndGg7XG4gICAgICB2YXIgbnVtQ29tcG9uZW50cyA9IGFycmF5Lm51bUNvbXBvbmVudHMgfHwgZ3Vlc3NOdW1Db21wb25lbnRzRnJvbU5hbWUoa2V5LCBsZW5ndGgpO1xuICAgICAgdmFyIG51bUVsZW1lbnRzID0gbGVuZ3RoIC8gbnVtQ29tcG9uZW50cztcbiAgICAgIGlmIChsZW5ndGggJSBudW1Db21wb25lbnRzID4gMCkge1xuICAgICAgICB0aHJvdyBcIm51bUNvbXBvbmVudHMgXCIgKyBudW1Db21wb25lbnRzICsgXCIgbm90IGNvcnJlY3QgZm9yIGxlbmd0aCBcIiArIGxlbmd0aDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudW1FbGVtZW50cztcbiAgICB9O1xuICB9KCkpO1xuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBCdWZmZXJJbmZvXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBudW1FbGVtZW50cyBUaGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIHBhc3MgdG8gYGdsLmRyYXdBcnJheXNgIG9yIGBnbC5kcmF3RWxlbWVudHNgLlxuICAgKiBAcHJvcGVydHkge1dlYkdMQnVmZmVyfSBbaW5kaWNlc10gVGhlIGluZGljZXMgYEVMRU1FTlRfQVJSQVlfQlVGRkVSYCBpZiBhbnkgaW5kaWNlcyBleGlzdC5cbiAgICogQHByb3BlcnR5IHtPYmplY3QuPHN0cmluZywgbW9kdWxlOnR3Z2wuQXR0cmliSW5mbz59IGF0dHJpYnMgVGhlIGF0dHJpYnMgYXBwcm9yaWF0ZSB0byBjYWxsIGBzZXRBdHRyaWJ1dGVzYFxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIEJ1ZmZlckluZm8gZnJvbSBhbiBvYmplY3Qgb2YgYXJyYXlzLlxuICAgKlxuICAgKiBUaGlzIGNhbiBiZSBwYXNzZWQgdG8ge0BsaW5rIG1vZHVsZTp0d2dsLnNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzfSBhbmQgdG9cbiAgICoge0BsaW5rIG1vZHVsZTp0d2dsOmRyYXdCdWZmZXJJbmZvfS5cbiAgICpcbiAgICogR2l2ZW4gYW4gb2JqZWN0IGxpa2VcbiAgICpcbiAgICogICAgIHZhciBhcnJheXMgPSB7XG4gICAqICAgICAgIHBvc2l0aW9uOiB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IFswLCAwLCAwLCAxMCwgMCwgMCwgMCwgMTAsIDAsIDEwLCAxMCwgMF0sIH0sXG4gICAqICAgICAgIHRleGNvb3JkOiB7IG51bUNvbXBvbmVudHM6IDIsIGRhdGE6IFswLCAwLCAwLCAxLCAxLCAwLCAxLCAxXSwgICAgICAgICAgICAgICAgIH0sXG4gICAqICAgICAgIG5vcm1hbDogICB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IFswLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxLCAwLCAwLCAxXSwgICAgIH0sXG4gICAqICAgICAgIGluZGljZXM6ICB7IG51bUNvbXBvbmVudHM6IDMsIGRhdGE6IFswLCAxLCAyLCAxLCAyLCAzXSwgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgQ3JlYXRlcyBhbiBCdWZmZXJJbmZvIGxpa2UgdGhpc1xuICAgKlxuICAgKiAgICAgYnVmZmVySW5mbyA9IHtcbiAgICogICAgICAgbnVtRWxlbWVudHM6IDQsICAgICAgICAvLyBvciB3aGF0ZXZlciB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGlzXG4gICAqICAgICAgIGluZGljZXM6IFdlYkdMQnVmZmVyLCAgLy8gdGhpcyBwcm9wZXJ0eSB3aWxsIG5vdCBleGlzdCBpZiB0aGVyZSBhcmUgbm8gaW5kaWNlc1xuICAgKiAgICAgICBhdHRyaWJzOiB7XG4gICAqICAgICAgICAgYV9wb3NpdGlvbjogeyBidWZmZXI6IFdlYkdMQnVmZmVyLCBudW1Db21wb25lbnRzOiAzLCB9LFxuICAgKiAgICAgICAgIGFfbm9ybWFsOiAgIHsgYnVmZmVyOiBXZWJHTEJ1ZmZlciwgbnVtQ29tcG9uZW50czogMywgfSxcbiAgICogICAgICAgICBhX3RleGNvb3JkOiB7IGJ1ZmZlcjogV2ViR0xCdWZmZXIsIG51bUNvbXBvbmVudHM6IDIsIH0sXG4gICAqICAgICAgIH0sXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgVGhlIHByb3BlcnRpZXMgb2YgYXJyYXlzIGNhbiBiZSBKYXZhU2NyaXB0IGFycmF5cyBpbiB3aGljaCBjYXNlIHRoZSBudW1iZXIgb2YgY29tcG9uZW50c1xuICAgKiAgd2lsbCBiZSBndWVzc2VkLlxuICAgKlxuICAgKiAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgIHBvc2l0aW9uOiBbMCwgMCwgMCwgMTAsIDAsIDAsIDAsIDEwLCAwLCAxMCwgMTAsIDBdLFxuICAgKiAgICAgICAgdGV4Y29vcmQ6IFswLCAwLCAwLCAxLCAxLCAwLCAxLCAxXSxcbiAgICogICAgICAgIG5vcm1hbDogICBbMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMV0sXG4gICAqICAgICAgICBpbmRpY2VzOiAgWzAsIDEsIDIsIDEsIDIsIDNdLFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogIFRoZXkgY2FuIGFsc28gYnkgVHlwZWRBcnJheXNcbiAgICpcbiAgICogICAgIHZhciBhcnJheXMgPSB7XG4gICAqICAgICAgICBwb3NpdGlvbjogbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMCwgMTAsIDAsIDAsIDAsIDEwLCAwLCAxMCwgMTAsIDBdKSxcbiAgICogICAgICAgIHRleGNvb3JkOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxLCAxLCAwLCAxLCAxXSksXG4gICAqICAgICAgICBub3JtYWw6ICAgbmV3IEZsb2F0MzJBcnJheShbMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMSwgMCwgMCwgMV0pLFxuICAgKiAgICAgICAgaW5kaWNlczogIG5ldyBVaW50MTZBcnJheShbMCwgMSwgMiwgMSwgMiwgM10pLFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogIE9yIGF1Z21lbnRlZFR5cGVkQXJyYXlzXG4gICAqXG4gICAqICAgICB2YXIgcG9zaXRpb25zID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCA0KTtcbiAgICogICAgIHZhciB0ZXhjb29yZHMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDIsIDQpO1xuICAgKiAgICAgdmFyIG5vcm1hbHMgICA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgNCk7XG4gICAqICAgICB2YXIgaW5kaWNlcyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCAyLCBVaW50MTZBcnJheSk7XG4gICAqXG4gICAqICAgICBwb3NpdGlvbnMucHVzaChbMCwgMCwgMCwgMTAsIDAsIDAsIDAsIDEwLCAwLCAxMCwgMTAsIDBdKTtcbiAgICogICAgIHRleGNvb3Jkcy5wdXNoKFswLCAwLCAwLCAxLCAxLCAwLCAxLCAxXSk7XG4gICAqICAgICBub3JtYWxzLnB1c2goWzAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDEsIDAsIDAsIDFdKTtcbiAgICogICAgIGluZGljZXMucHVzaChbMCwgMSwgMiwgMSwgMiwgM10pO1xuICAgKlxuICAgKiAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbnMsXG4gICAqICAgICAgICB0ZXhjb29yZDogdGV4Y29vcmRzLFxuICAgKiAgICAgICAgbm9ybWFsOiAgIG5vcm1hbHMsXG4gICAqICAgICAgICBpbmRpY2VzOiAgaW5kaWNlcyxcbiAgICogICAgIH07XG4gICAqXG4gICAqIEZvciB0aGUgbGFzdCBleGFtcGxlIGl0IGlzIGVxdWl2YWxlbnQgdG9cbiAgICpcbiAgICogICAgIHZhciBidWZmZXJJbmZvID0ge1xuICAgKiAgICAgICBhdHRyaWJzOiB7XG4gICAqICAgICAgICAgYV9wb3NpdGlvbjogeyBudW1Db21wb25lbnRzOiAzLCBidWZmZXI6IGdsLmNyZWF0ZUJ1ZmZlcigpLCB9LFxuICAgKiAgICAgICAgIGFfdGV4Y29vZHM6IHsgbnVtQ29tcG9uZW50czogMiwgYnVmZmVyOiBnbC5jcmVhdGVCdWZmZXIoKSwgfSxcbiAgICogICAgICAgICBhX25vcm1hbHM6IHsgbnVtQ29tcG9uZW50czogMywgYnVmZmVyOiBnbC5jcmVhdGVCdWZmZXIoKSwgfSxcbiAgICogICAgICAgfSxcbiAgICogICAgICAgaW5kaWNlczogZ2wuY3JlYXRlQnVmZmVyKCksXG4gICAqICAgICAgIG51bUVsZW1lbnRzOiA2LFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXJJbmZvLmF0dHJpYnMuYV9wb3NpdGlvbi5idWZmZXIpO1xuICAgKiAgICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIGFycmF5cy5wb3NpdGlvbiwgZ2wuU1RBVElDX0RSQVcpO1xuICAgKiAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIGJ1ZmZlckluZm8uYXR0cmlicy5hX3RleGNvb3JkLmJ1ZmZlcik7XG4gICAqICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgYXJyYXlzLnRleGNvb3JkLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAqICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVySW5mby5hdHRyaWJzLmFfbm9ybWFsLmJ1ZmZlcik7XG4gICAqICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgYXJyYXlzLm5vcm1hbCwgZ2wuU1RBVElDX0RSQVcpO1xuICAgKiAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgYnVmZmVySW5mby5pbmRpY2VzKTtcbiAgICogICAgIGdsLmJ1ZmZlckRhdGEoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGFycmF5cy5pbmRpY2VzLCBnbC5TVEFUSUNfRFJBVyk7XG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBBIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkFycmF5c30gYXJyYXlzIFlvdXIgZGF0YVxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBBIEJ1ZmZlckluZm9cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5cyhnbCwgYXJyYXlzKSB7XG4gICAgdmFyIGJ1ZmZlckluZm8gPSB7XG4gICAgICBhdHRyaWJzOiBjcmVhdGVBdHRyaWJzRnJvbUFycmF5cyhnbCwgYXJyYXlzKSxcbiAgICB9O1xuICAgIHZhciBpbmRpY2VzID0gYXJyYXlzLmluZGljZXM7XG4gICAgaWYgKGluZGljZXMpIHtcbiAgICAgIGluZGljZXMgPSBtYWtlVHlwZWRBcnJheShpbmRpY2VzLCBcImluZGljZXNcIik7XG4gICAgICBidWZmZXJJbmZvLmluZGljZXMgPSBjcmVhdGVCdWZmZXJGcm9tVHlwZWRBcnJheShnbCwgaW5kaWNlcywgZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIpO1xuICAgICAgYnVmZmVySW5mby5udW1FbGVtZW50cyA9IGluZGljZXMubGVuZ3RoO1xuICAgICAgYnVmZmVySW5mby5lbGVtZW50VHlwZSA9IChpbmRpY2VzIGluc3RhbmNlb2YgVWludDMyQXJyYXkpID8gIGdsLlVOU0lHTkVEX0lOVCA6IGdsLlVOU0lHTkVEX1NIT1JUO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXJJbmZvLm51bUVsZW1lbnRzID0gZ2V0TnVtRWxlbWVudHNGcm9tTm9uSW5kZXhlZEFycmF5cyhhcnJheXMpO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXJJbmZvO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBidWZmZXIgZnJvbSBhbiBhcnJheSwgdHlwZWQgYXJyYXksIG9yIGFycmF5IHNwZWNcbiAgICpcbiAgICogR2l2ZW4gc29tZXRoaW5nIGxpa2UgdGhpc1xuICAgKlxuICAgKiAgICAgWzEsIDIsIDNdLFxuICAgKlxuICAgKiBvclxuICAgKlxuICAgKiAgICAgbmV3IFVpbnQxNkFycmF5KFsxLDIsM10pO1xuICAgKlxuICAgKiBvclxuICAgKlxuICAgKiAgICAge1xuICAgKiAgICAgICAgZGF0YTogWzEsIDIsIDNdLFxuICAgKiAgICAgICAgdHlwZTogVWludDhBcnJheSxcbiAgICogICAgIH1cbiAgICpcbiAgICogcmV0dXJucyBhIFdlYkdMQnVmZmVyIHRoYXQgY29uc3RhaW5zIHRoZSBnaXZlbiBkYXRhLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dCkgZ2wgQSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuQXJyYXlTcGVjfSBhcnJheSBhbiBhcnJheSwgdHlwZWQgYXJyYXksIG9yIGFycmF5IHNwZWMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBhcnJheU5hbWUgbmFtZSBvZiBhcnJheS4gVXNlZCB0byBndWVzcyB0aGUgdHlwZSBpZiB0eXBlIGNhbiBub3QgYmUgZGVydmllZCBvdGhlciB3aXNlLlxuICAgKiBAcmV0dXJuIHtXZWJHTEJ1ZmZlcn0gYSBXZWJHTEJ1ZmZlciBjb250YWluaW5nIHRoZSBkYXRhIGluIGFycmF5LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlckZyb21BcnJheShnbCwgYXJyYXksIGFycmF5TmFtZSkge1xuICAgIHZhciB0eXBlID0gYXJyYXlOYW1lID09PSBcImluZGljZXNcIiA/IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSIDogZ2wuQVJSQVlfQlVGRkVSO1xuICAgIHZhciB0eXBlZEFycmF5ID0gbWFrZVR5cGVkQXJyYXkoYXJyYXksIGFycmF5TmFtZSk7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlckZyb21UeXBlZEFycmF5KGdsLCB0eXBlZEFycmF5LCB0eXBlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGJ1ZmZlcnMgZnJvbSBhcnJheXMgb3IgdHlwZWQgYXJyYXlzXG4gICAqXG4gICAqIEdpdmVuIHNvbWV0aGluZyBsaWtlIHRoaXNcbiAgICpcbiAgICogICAgIHZhciBhcnJheXMgPSB7XG4gICAqICAgICAgICBwb3NpdGlvbnM6IFsxLCAyLCAzXSxcbiAgICogICAgICAgIG5vcm1hbHM6IFswLCAwLCAxXSxcbiAgICogICAgIH1cbiAgICpcbiAgICogcmV0dXJucyBzb21ldGhpbmcgbGlrZVxuICAgKlxuICAgKiAgICAgYnVmZmVycyA9IHtcbiAgICogICAgICAgcG9zaXRpb25zOiBXZWJHTEJ1ZmZlcixcbiAgICogICAgICAgbm9ybWFsczogV2ViR0xCdWZmZXIsXG4gICAqICAgICB9XG4gICAqXG4gICAqIElmIHRoZSBidWZmZXIgaXMgbmFtZWQgJ2luZGljZXMnIGl0IHdpbGwgYmUgbWFkZSBhbiBFTEVNRU5UX0FSUkFZX0JVRkZFUi5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHQpIGdsIEEgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkFycmF5c30gYXJyYXlzXG4gICAqIEByZXR1cm4ge09iamVjdDxzdHJpbmcsIFdlYkdMQnVmZmVyPn0gcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBvbmUgV2ViR0xCdWZmZXIgcGVyIGFycmF5XG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQnVmZmVyc0Zyb21BcnJheXMoZ2wsIGFycmF5cykge1xuICAgIHZhciBidWZmZXJzID0geyB9O1xuICAgIE9iamVjdC5rZXlzKGFycmF5cykuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGJ1ZmZlcnNba2V5XSA9IGNyZWF0ZUJ1ZmZlckZyb21BcnJheShnbCwgYXJyYXlzW2tleV0sIGtleSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYnVmZmVycztcbiAgfVxuXG4gIC8vIFVzaW5nIHF1b3RlcyBwcmV2ZW50cyBVZ2xpZnkgZnJvbSBjaGFuZ2luZyB0aGUgbmFtZXMuXG4gIC8vIE5vIHNwZWVkIGRpZmYgQUZBSUNULlxuICByZXR1cm4ge1xuICAgIFwiY3JlYXRlQXR0cmlic0Zyb21BcnJheXNcIjogY3JlYXRlQXR0cmlic0Zyb21BcnJheXMsXG4gICAgXCJjcmVhdGVCdWZmZXJzRnJvbUFycmF5c1wiOiBjcmVhdGVCdWZmZXJzRnJvbUFycmF5cyxcbiAgICBcImNyZWF0ZUJ1ZmZlckZyb21BcnJheVwiOiBjcmVhdGVCdWZmZXJGcm9tQXJyYXksXG4gICAgXCJjcmVhdGVCdWZmZXJGcm9tVHlwZWRBcnJheVwiOiBjcmVhdGVCdWZmZXJGcm9tVHlwZWRBcnJheSxcbiAgICBcImNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzXCI6IGNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzLFxuICAgIFwic2V0QXR0cmliSW5mb0J1ZmZlckZyb21BcnJheVwiOiBzZXRBdHRyaWJJbmZvQnVmZmVyRnJvbUFycmF5LFxuXG4gICAgXCJzZXRBdHRyaWJ1dGVQcmVmaXhcIjogc2V0QXR0cmlidXRlUHJlZml4LFxuXG4gICAgXCJzZXREZWZhdWx0c19cIjogc2V0RGVmYXVsdHMsXG4gIH07XG5cbn0pO1xuXG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSwgR3JlZ2cgVGF2YXJlcy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG5kZWZpbmUoJ3R3Z2wvcHJvZ3JhbXMnLFtdLCBmdW5jdGlvbiAoKSB7XG4gIFxuXG4gIHZhciBlcnJvciA9XG4gICAgICAoICAgIHdpbmRvdy5jb25zb2xlXG4gICAgICAgICYmIHdpbmRvdy5jb25zb2xlLmVycm9yXG4gICAgICAgICYmIHR5cGVvZiB3aW5kb3cuY29uc29sZS5lcnJvciA9PT0gXCJmdW5jdGlvblwiXG4gICAgICApXG4gICAgICA/IHdpbmRvdy5jb25zb2xlLmVycm9yLmJpbmQod2luZG93LmNvbnNvbGUpXG4gICAgICA6IGZ1bmN0aW9uKCkgeyB9O1xuICAvLyBtYWtlIHN1cmUgd2UgZG9uJ3Qgc2VlIGEgZ2xvYmFsIGdsXG4gIHZhciBnbCA9IHVuZGVmaW5lZDsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAvKipcbiAgICogRXJyb3IgQ2FsbGJhY2tcbiAgICogQGNhbGxiYWNrIEVycm9yQ2FsbGJhY2tcbiAgICogQHBhcmFtIHtzdHJpbmd9IG1zZyBlcnJvciBtZXNzYWdlLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cbiAgZnVuY3Rpb24gYWRkTGluZU51bWJlcnMoc3JjKSB7XG4gICAgcmV0dXJuIHNyYy5zcGxpdChcIlxcblwiKS5tYXAoZnVuY3Rpb24obGluZSwgbmR4KSB7XG4gICAgICByZXR1cm4gKG5keCArIDEpICsgXCI6IFwiICsgbGluZTtcbiAgICB9KS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIGEgc2hhZGVyLlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dCB0byB1c2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzaGFkZXJTb3VyY2UgVGhlIHNoYWRlciBzb3VyY2UuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzaGFkZXJUeXBlIFRoZSB0eXBlIG9mIHNoYWRlci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5FcnJvckNhbGxiYWNrfSBvcHRfZXJyb3JDYWxsYmFjayBjYWxsYmFjayBmb3IgZXJyb3JzLlxuICAgKiBAcmV0dXJuIHtXZWJHTFNoYWRlcn0gVGhlIGNyZWF0ZWQgc2hhZGVyLlxuICAgKi9cbiAgZnVuY3Rpb24gbG9hZFNoYWRlcihnbCwgc2hhZGVyU291cmNlLCBzaGFkZXJUeXBlLCBvcHRfZXJyb3JDYWxsYmFjaykge1xuICAgIHZhciBlcnJGbiA9IG9wdF9lcnJvckNhbGxiYWNrIHx8IGVycm9yO1xuICAgIC8vIENyZWF0ZSB0aGUgc2hhZGVyIG9iamVjdFxuICAgIHZhciBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoc2hhZGVyVHlwZSk7XG5cbiAgICAvLyBMb2FkIHRoZSBzaGFkZXIgc291cmNlXG4gICAgZ2wuc2hhZGVyU291cmNlKHNoYWRlciwgc2hhZGVyU291cmNlKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHNoYWRlclxuICAgIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKTtcblxuICAgIC8vIENoZWNrIHRoZSBjb21waWxlIHN0YXR1c1xuICAgIHZhciBjb21waWxlZCA9IGdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKTtcbiAgICBpZiAoIWNvbXBpbGVkKSB7XG4gICAgICAvLyBTb21ldGhpbmcgd2VudCB3cm9uZyBkdXJpbmcgY29tcGlsYXRpb247IGdldCB0aGUgZXJyb3JcbiAgICAgIHZhciBsYXN0RXJyb3IgPSBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcik7XG4gICAgICBlcnJGbihhZGRMaW5lTnVtYmVycyhzaGFkZXJTb3VyY2UpICsgXCJcXG4qKiogRXJyb3IgY29tcGlsaW5nIHNoYWRlcjogXCIgKyBsYXN0RXJyb3IpO1xuICAgICAgZ2wuZGVsZXRlU2hhZGVyKHNoYWRlcik7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2hhZGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBwcm9ncmFtLCBhdHRhY2hlcyBzaGFkZXJzLCBiaW5kcyBhdHRyaWIgbG9jYXRpb25zLCBsaW5rcyB0aGVcbiAgICogcHJvZ3JhbSBhbmQgY2FsbHMgdXNlUHJvZ3JhbS5cbiAgICogQHBhcmFtIHtXZWJHTFNoYWRlcltdfSBzaGFkZXJzIFRoZSBzaGFkZXJzIHRvIGF0dGFjaFxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBbb3B0X2F0dHJpYnNdIEFuIGFycmF5IG9mIGF0dHJpYnMgbmFtZXMuIExvY2F0aW9ucyB3aWxsIGJlIGFzc2lnbmVkIGJ5IGluZGV4IGlmIG5vdCBwYXNzZWQgaW5cbiAgICogQHBhcmFtIHtudW1iZXJbXX0gW29wdF9sb2NhdGlvbnNdIFRoZSBsb2NhdGlvbnMgZm9yIHRoZS4gQSBwYXJhbGxlbCBhcnJheSB0byBvcHRfYXR0cmlicyBsZXR0aW5nIHlvdSBhc3NpZ24gbG9jYXRpb25zLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkVycm9yQ2FsbGJhY2t9IFtvcHRfZXJyb3JDYWxsYmFja10gY2FsbGJhY2sgZm9yIGVycm9ycy4gQnkgZGVmYXVsdCBpdCBqdXN0IHByaW50cyBhbiBlcnJvciB0byB0aGUgY29uc29sZVxuICAgKiAgICAgICAgb24gZXJyb3IuIElmIHlvdSB3YW50IHNvbWV0aGluZyBlbHNlIHBhc3MgYW4gY2FsbGJhY2suIEl0J3MgcGFzc2VkIGFuIGVycm9yIG1lc3NhZ2UuXG4gICAqIEByZXR1cm4ge1dlYkdMUHJvZ3JhbT99IHRoZSBjcmVhdGVkIHByb2dyYW0gb3IgbnVsbCBpZiBlcnJvci5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVQcm9ncmFtKFxuICAgICAgZ2wsIHNoYWRlcnMsIG9wdF9hdHRyaWJzLCBvcHRfbG9jYXRpb25zLCBvcHRfZXJyb3JDYWxsYmFjaykge1xuICAgIHZhciBlcnJGbiA9IG9wdF9lcnJvckNhbGxiYWNrIHx8IGVycm9yO1xuICAgIHZhciBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgIHNoYWRlcnMuZm9yRWFjaChmdW5jdGlvbihzaGFkZXIpIHtcbiAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBzaGFkZXIpO1xuICAgIH0pO1xuICAgIGlmIChvcHRfYXR0cmlicykge1xuICAgICAgb3B0X2F0dHJpYnMuZm9yRWFjaChmdW5jdGlvbihhdHRyaWIsICBuZHgpIHtcbiAgICAgICAgZ2wuYmluZEF0dHJpYkxvY2F0aW9uKFxuICAgICAgICAgICAgcHJvZ3JhbSxcbiAgICAgICAgICAgIG9wdF9sb2NhdGlvbnMgPyBvcHRfbG9jYXRpb25zW25keF0gOiBuZHgsXG4gICAgICAgICAgICBhdHRyaWIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgLy8gQ2hlY2sgdGhlIGxpbmsgc3RhdHVzXG4gICAgdmFyIGxpbmtlZCA9IGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpO1xuICAgIGlmICghbGlua2VkKSB7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nIHdpdGggdGhlIGxpbmtcbiAgICAgICAgdmFyIGxhc3RFcnJvciA9IGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pO1xuICAgICAgICBlcnJGbihcIkVycm9yIGluIHByb2dyYW0gbGlua2luZzpcIiArIGxhc3RFcnJvcik7XG5cbiAgICAgICAgZ2wuZGVsZXRlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBwcm9ncmFtO1xuICB9XG5cbiAgLyoqXG4gICAqIExvYWRzIGEgc2hhZGVyIGZyb20gYSBzY3JpcHQgdGFnLlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dCB0byB1c2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzY3JpcHRJZCBUaGUgaWQgb2YgdGhlIHNjcmlwdCB0YWcuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0X3NoYWRlclR5cGVdIFRoZSB0eXBlIG9mIHNoYWRlci4gSWYgbm90IHBhc3NlZCBpbiBpdCB3aWxsXG4gICAqICAgICBiZSBkZXJpdmVkIGZyb20gdGhlIHR5cGUgb2YgdGhlIHNjcmlwdCB0YWcuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuRXJyb3JDYWxsYmFja30gW29wdF9lcnJvckNhbGxiYWNrXSBjYWxsYmFjayBmb3IgZXJyb3JzLlxuICAgKiBAcmV0dXJuIHtXZWJHTFNoYWRlcj99IFRoZSBjcmVhdGVkIHNoYWRlciBvciBudWxsIGlmIGVycm9yLlxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlU2hhZGVyRnJvbVNjcmlwdChcbiAgICAgIGdsLCBzY3JpcHRJZCwgb3B0X3NoYWRlclR5cGUsIG9wdF9lcnJvckNhbGxiYWNrKSB7XG4gICAgdmFyIHNoYWRlclNvdXJjZSA9IFwiXCI7XG4gICAgdmFyIHNoYWRlclR5cGU7XG4gICAgdmFyIHNoYWRlclNjcmlwdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNjcmlwdElkKTtcbiAgICBpZiAoIXNoYWRlclNjcmlwdCkge1xuICAgICAgdGhyb3cgXCIqKiogRXJyb3I6IHVua25vd24gc2NyaXB0IGVsZW1lbnRcIiArIHNjcmlwdElkO1xuICAgIH1cbiAgICBzaGFkZXJTb3VyY2UgPSBzaGFkZXJTY3JpcHQudGV4dDtcblxuICAgIGlmICghb3B0X3NoYWRlclR5cGUpIHtcbiAgICAgIGlmIChzaGFkZXJTY3JpcHQudHlwZSA9PT0gXCJ4LXNoYWRlci94LXZlcnRleFwiKSB7XG4gICAgICAgIHNoYWRlclR5cGUgPSBnbC5WRVJURVhfU0hBREVSO1xuICAgICAgfSBlbHNlIGlmIChzaGFkZXJTY3JpcHQudHlwZSA9PT0gXCJ4LXNoYWRlci94LWZyYWdtZW50XCIpIHtcbiAgICAgICAgc2hhZGVyVHlwZSA9IGdsLkZSQUdNRU5UX1NIQURFUjtcbiAgICAgIH0gZWxzZSBpZiAoc2hhZGVyVHlwZSAhPT0gZ2wuVkVSVEVYX1NIQURFUiAmJiBzaGFkZXJUeXBlICE9PSBnbC5GUkFHTUVOVF9TSEFERVIpIHtcbiAgICAgICAgdGhyb3cgXCIqKiogRXJyb3I6IHVua25vd24gc2hhZGVyIHR5cGVcIjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbG9hZFNoYWRlcihcbiAgICAgICAgZ2wsIHNoYWRlclNvdXJjZSwgb3B0X3NoYWRlclR5cGUgPyBvcHRfc2hhZGVyVHlwZSA6IHNoYWRlclR5cGUsXG4gICAgICAgIG9wdF9lcnJvckNhbGxiYWNrKTtcbiAgfVxuXG4gIHZhciBkZWZhdWx0U2hhZGVyVHlwZSA9IFtcbiAgICBcIlZFUlRFWF9TSEFERVJcIixcbiAgICBcIkZSQUdNRU5UX1NIQURFUlwiLFxuICBdO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgcHJvZ3JhbSBmcm9tIDIgc2NyaXB0IHRhZ3MuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqICAgICAgICB0byB1c2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHNoYWRlclNjcmlwdElkcyBBcnJheSBvZiBpZHMgb2YgdGhlIHNjcmlwdFxuICAgKiAgICAgICAgdGFncyBmb3IgdGhlIHNoYWRlcnMuIFRoZSBmaXJzdCBpcyBhc3N1bWVkIHRvIGJlIHRoZVxuICAgKiAgICAgICAgdmVydGV4IHNoYWRlciwgdGhlIHNlY29uZCB0aGUgZnJhZ21lbnQgc2hhZGVyLlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBbb3B0X2F0dHJpYnNdIEFuIGFycmF5IG9mIGF0dHJpYnMgbmFtZXMuIExvY2F0aW9ucyB3aWxsIGJlIGFzc2lnbmVkIGJ5IGluZGV4IGlmIG5vdCBwYXNzZWQgaW5cbiAgICogQHBhcmFtIHtudW1iZXJbXX0gW29wdF9sb2NhdGlvbnNdIFRoZSBsb2NhdGlvbnMgZm9yIHRoZS4gQSBwYXJhbGxlbCBhcnJheSB0byBvcHRfYXR0cmlicyBsZXR0aW5nIHlvdSBhc3NpZ24gbG9jYXRpb25zLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkVycm9yQ2FsbGJhY2t9IG9wdF9lcnJvckNhbGxiYWNrIGNhbGxiYWNrIGZvciBlcnJvcnMuIEJ5IGRlZmF1bHQgaXQganVzdCBwcmludHMgYW4gZXJyb3IgdG8gdGhlIGNvbnNvbGVcbiAgICogICAgICAgIG9uIGVycm9yLiBJZiB5b3Ugd2FudCBzb21ldGhpbmcgZWxzZSBwYXNzIGFuIGNhbGxiYWNrLiBJdCdzIHBhc3NlZCBhbiBlcnJvciBtZXNzYWdlLlxuICAgKiBAcmV0dXJuIHtXZWJHTFByb2dyYW19IFRoZSBjcmVhdGVkIHByb2dyYW0uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbUZyb21TY3JpcHRzKFxuICAgICAgZ2wsIHNoYWRlclNjcmlwdElkcywgb3B0X2F0dHJpYnMsIG9wdF9sb2NhdGlvbnMsIG9wdF9lcnJvckNhbGxiYWNrKSB7XG4gICAgdmFyIHNoYWRlcnMgPSBbXTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgc2hhZGVyU2NyaXB0SWRzLmxlbmd0aDsgKytpaSkge1xuICAgICAgdmFyIHNoYWRlciA9IGNyZWF0ZVNoYWRlckZyb21TY3JpcHQoXG4gICAgICAgICAgZ2wsIHNoYWRlclNjcmlwdElkc1tpaV0sIGdsW2RlZmF1bHRTaGFkZXJUeXBlW2lpXV0sIG9wdF9lcnJvckNhbGxiYWNrKTtcbiAgICAgIGlmICghc2hhZGVyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgc2hhZGVycy5wdXNoKHNoYWRlcik7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVQcm9ncmFtKGdsLCBzaGFkZXJzLCBvcHRfYXR0cmlicywgb3B0X2xvY2F0aW9ucywgb3B0X2Vycm9yQ2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBwcm9ncmFtIGZyb20gMiBzb3VyY2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiAgICAgICAgdG8gdXNlLlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBzaGFkZXJTb3VyY2VzcyBBcnJheSBvZiBzb3VyY2VzIGZvciB0aGVcbiAgICogICAgICAgIHNoYWRlcnMuIFRoZSBmaXJzdCBpcyBhc3N1bWVkIHRvIGJlIHRoZSB2ZXJ0ZXggc2hhZGVyLFxuICAgKiAgICAgICAgdGhlIHNlY29uZCB0aGUgZnJhZ21lbnQgc2hhZGVyLlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBbb3B0X2F0dHJpYnNdIEFuIGFycmF5IG9mIGF0dHJpYnMgbmFtZXMuIExvY2F0aW9ucyB3aWxsIGJlIGFzc2lnbmVkIGJ5IGluZGV4IGlmIG5vdCBwYXNzZWQgaW5cbiAgICogQHBhcmFtIHtudW1iZXJbXX0gW29wdF9sb2NhdGlvbnNdIFRoZSBsb2NhdGlvbnMgZm9yIHRoZS4gQSBwYXJhbGxlbCBhcnJheSB0byBvcHRfYXR0cmlicyBsZXR0aW5nIHlvdSBhc3NpZ24gbG9jYXRpb25zLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkVycm9yQ2FsbGJhY2t9IG9wdF9lcnJvckNhbGxiYWNrIGNhbGxiYWNrIGZvciBlcnJvcnMuIEJ5IGRlZmF1bHQgaXQganVzdCBwcmludHMgYW4gZXJyb3IgdG8gdGhlIGNvbnNvbGVcbiAgICogICAgICAgIG9uIGVycm9yLiBJZiB5b3Ugd2FudCBzb21ldGhpbmcgZWxzZSBwYXNzIGFuIGNhbGxiYWNrLiBJdCdzIHBhc3NlZCBhbiBlcnJvciBtZXNzYWdlLlxuICAgKiBAcmV0dXJuIHtXZWJHTFByb2dyYW19IFRoZSBjcmVhdGVkIHByb2dyYW0uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbUZyb21Tb3VyY2VzKFxuICAgICAgZ2wsIHNoYWRlclNvdXJjZXMsIG9wdF9hdHRyaWJzLCBvcHRfbG9jYXRpb25zLCBvcHRfZXJyb3JDYWxsYmFjaykge1xuICAgIHZhciBzaGFkZXJzID0gW107XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHNoYWRlclNvdXJjZXMubGVuZ3RoOyArK2lpKSB7XG4gICAgICB2YXIgc2hhZGVyID0gbG9hZFNoYWRlcihcbiAgICAgICAgICBnbCwgc2hhZGVyU291cmNlc1tpaV0sIGdsW2RlZmF1bHRTaGFkZXJUeXBlW2lpXV0sIG9wdF9lcnJvckNhbGxiYWNrKTtcbiAgICAgIGlmICghc2hhZGVyKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgc2hhZGVycy5wdXNoKHNoYWRlcik7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVQcm9ncmFtKGdsLCBzaGFkZXJzLCBvcHRfYXR0cmlicywgb3B0X2xvY2F0aW9ucywgb3B0X2Vycm9yQ2FsbGJhY2spO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgYmluZCBwb2ludCBmb3IgYSBnaXZlbiBzYW1wbGVyIHR5cGVcbiAgICovXG4gIGZ1bmN0aW9uIGdldEJpbmRQb2ludEZvclNhbXBsZXJUeXBlKGdsLCB0eXBlKSB7XG4gICAgaWYgKHR5cGUgPT09IGdsLlNBTVBMRVJfMkQpIHtcbiAgICAgIHJldHVybiBnbC5URVhUVVJFXzJEO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gZ2wuU0FNUExFUl9DVUJFKSB7XG4gICAgICByZXR1cm4gZ2wuVEVYVFVSRV9DVUJFX01BUDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdC48c3RyaW5nLGZ1bmN0aW9uPn0gU2V0dGVyc1xuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBzZXR0ZXIgZnVuY3Rpb25zIGZvciBhbGwgdW5pZm9ybXMgb2YgYSBzaGFkZXJcbiAgICogcHJvZ3JhbS5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnR3Z2wuc2V0VW5pZm9ybXN9XG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xQcm9ncmFtfSBwcm9ncmFtIHRoZSBwcm9ncmFtIHRvIGNyZWF0ZSBzZXR0ZXJzIGZvci5cbiAgICogQHJldHVybnMge09iamVjdC48c3RyaW5nLCBmdW5jdGlvbj59IGFuIG9iamVjdCB3aXRoIGEgc2V0dGVyIGJ5IG5hbWUgZm9yIGVhY2ggdW5pZm9ybVxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZVVuaWZvcm1TZXR0ZXJzKGdsLCBwcm9ncmFtKSB7XG4gICAgdmFyIHRleHR1cmVVbml0ID0gMDtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBzZXR0ZXIgZm9yIGEgdW5pZm9ybSBvZiB0aGUgZ2l2ZW4gcHJvZ3JhbSB3aXRoIGl0J3NcbiAgICAgKiBsb2NhdGlvbiBlbWJlZGRlZCBpbiB0aGUgc2V0dGVyLlxuICAgICAqIEBwYXJhbSB7V2ViR0xQcm9ncmFtfSBwcm9ncmFtXG4gICAgICogQHBhcmFtIHtXZWJHTFVuaWZvcm1JbmZvfSB1bmlmb3JtSW5mb1xuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbn0gdGhlIGNyZWF0ZWQgc2V0dGVyLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVVuaWZvcm1TZXR0ZXIocHJvZ3JhbSwgdW5pZm9ybUluZm8pIHtcbiAgICAgIHZhciBsb2NhdGlvbiA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCB1bmlmb3JtSW5mby5uYW1lKTtcbiAgICAgIHZhciB0eXBlID0gdW5pZm9ybUluZm8udHlwZTtcbiAgICAgIC8vIENoZWNrIGlmIHRoaXMgdW5pZm9ybSBpcyBhbiBhcnJheVxuICAgICAgdmFyIGlzQXJyYXkgPSAodW5pZm9ybUluZm8uc2l6ZSA+IDEgJiYgdW5pZm9ybUluZm8ubmFtZS5zdWJzdHIoLTMpID09PSBcIlswXVwiKTtcbiAgICAgIGlmICh0eXBlID09PSBnbC5GTE9BVCAmJiBpc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybTFmdihsb2NhdGlvbiwgdik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtMWYobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUX1ZFQzIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtMmZ2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5GTE9BVF9WRUMzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybTNmdihsb2NhdGlvbiwgdik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVRfVkVDNCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm00ZnYobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLklOVCAmJiBpc0FycmF5KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybTFpdihsb2NhdGlvbiwgdik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuSU5UKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5JTlRfVkVDMikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm0yaXYobG9jYXRpb24sIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLklOVF9WRUMzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybTNpdihsb2NhdGlvbiwgdik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuSU5UX1ZFQzQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtNGl2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5CT09MICYmIGlzQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtMWl2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5CT09MKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybTFpKGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5CT09MX1ZFQzIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtMml2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5CT09MX1ZFQzMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtM2l2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5CT09MX1ZFQzQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtNGl2KGxvY2F0aW9uLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSBnbC5GTE9BVF9NQVQyKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDJmdihsb2NhdGlvbiwgZmFsc2UsIHYpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IGdsLkZMT0FUX01BVDMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICBnbC51bmlmb3JtTWF0cml4M2Z2KGxvY2F0aW9uLCBmYWxzZSwgdik7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuRkxPQVRfTUFUNCkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24odikge1xuICAgICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYobG9jYXRpb24sIGZhbHNlLCB2KTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICgodHlwZSA9PT0gZ2wuU0FNUExFUl8yRCB8fCB0eXBlID09PSBnbC5TQU1QTEVSX0NVQkUpICYmIGlzQXJyYXkpIHtcbiAgICAgICAgdmFyIHVuaXRzID0gW107XG4gICAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCB1bmlmb3JtSW5mby5zaXplOyArK2lpKSB7XG4gICAgICAgICAgdW5pdHMucHVzaCh0ZXh0dXJlVW5pdCsrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24oYmluZFBvaW50LCB1bml0cykge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbih0ZXh0dXJlcykge1xuICAgICAgICAgICAgZ2wudW5pZm9ybTFpdihsb2NhdGlvbiwgdW5pdHMpO1xuICAgICAgICAgICAgdGV4dHVyZXMuZm9yRWFjaChmdW5jdGlvbih0ZXh0dXJlLCBpbmRleCkge1xuICAgICAgICAgICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwICsgdW5pdHNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoYmluZFBvaW50LCB0ZXh0dXJlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH0oZ2V0QmluZFBvaW50Rm9yU2FtcGxlclR5cGUoZ2wsIHR5cGUpLCB1bml0cyk7XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gZ2wuU0FNUExFUl8yRCB8fCB0eXBlID09PSBnbC5TQU1QTEVSX0NVQkUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGJpbmRQb2ludCwgdW5pdCkge1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbih0ZXh0dXJlKSB7XG4gICAgICAgICAgICBnbC51bmlmb3JtMWkobG9jYXRpb24sIHVuaXQpO1xuICAgICAgICAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArIHVuaXQpO1xuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUoYmluZFBvaW50LCB0ZXh0dXJlKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KGdldEJpbmRQb2ludEZvclNhbXBsZXJUeXBlKGdsLCB0eXBlKSwgdGV4dHVyZVVuaXQrKyk7XG4gICAgICB9XG4gICAgICB0aHJvdyAoXCJ1bmtub3duIHR5cGU6IDB4XCIgKyB0eXBlLnRvU3RyaW5nKDE2KSk7IC8vIHdlIHNob3VsZCBuZXZlciBnZXQgaGVyZS5cbiAgICB9XG5cbiAgICB2YXIgdW5pZm9ybVNldHRlcnMgPSB7IH07XG4gICAgdmFyIG51bVVuaWZvcm1zID0gZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5BQ1RJVkVfVU5JRk9STVMpO1xuXG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bVVuaWZvcm1zOyArK2lpKSB7XG4gICAgICB2YXIgdW5pZm9ybUluZm8gPSBnbC5nZXRBY3RpdmVVbmlmb3JtKHByb2dyYW0sIGlpKTtcbiAgICAgIGlmICghdW5pZm9ybUluZm8pIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB2YXIgbmFtZSA9IHVuaWZvcm1JbmZvLm5hbWU7XG4gICAgICAvLyByZW1vdmUgdGhlIGFycmF5IHN1ZmZpeC5cbiAgICAgIGlmIChuYW1lLnN1YnN0cigtMykgPT09IFwiWzBdXCIpIHtcbiAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDAsIG5hbWUubGVuZ3RoIC0gMyk7XG4gICAgICB9XG4gICAgICB2YXIgc2V0dGVyID0gY3JlYXRlVW5pZm9ybVNldHRlcihwcm9ncmFtLCB1bmlmb3JtSW5mbyk7XG4gICAgICB1bmlmb3JtU2V0dGVyc1tuYW1lXSA9IHNldHRlcjtcbiAgICB9XG4gICAgcmV0dXJuIHVuaWZvcm1TZXR0ZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldCB1bmlmb3JtcyBhbmQgYmluZHMgcmVsYXRlZCB0ZXh0dXJlcy5cbiAgICpcbiAgICogZXhhbXBsZTpcbiAgICpcbiAgICogICAgIHZhciBwcm9ncmFtSW5mbyA9IGNyZWF0ZVByb2dyYW1JbmZvKFxuICAgKiAgICAgICAgIGdsLCBbXCJzb21lLXZzXCIsIFwic29tZS1mc1wiKTtcbiAgICpcbiAgICogICAgIHZhciB0ZXgxID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgKiAgICAgdmFyIHRleDIgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAqXG4gICAqICAgICAuLi4gYXNzdW1lIHdlIHNldHVwIHRoZSB0ZXh0dXJlcyB3aXRoIGRhdGEgLi4uXG4gICAqXG4gICAqICAgICB2YXIgdW5pZm9ybXMgPSB7XG4gICAqICAgICAgIHVfc29tZVNhbXBsZXI6IHRleDEsXG4gICAqICAgICAgIHVfc29tZU90aGVyU2FtcGxlcjogdGV4MixcbiAgICogICAgICAgdV9zb21lQ29sb3I6IFsxLDAsMCwxXSxcbiAgICogICAgICAgdV9zb21lUG9zaXRpb246IFswLDEsMV0sXG4gICAqICAgICAgIHVfc29tZU1hdHJpeDogW1xuICAgKiAgICAgICAgIDEsMCwwLDAsXG4gICAqICAgICAgICAgMCwxLDAsMCxcbiAgICogICAgICAgICAwLDAsMSwwLFxuICAgKiAgICAgICAgIDAsMCwwLDAsXG4gICAqICAgICAgIF0sXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICpcbiAgICogVGhpcyB3aWxsIGF1dG9tYXRpY2FsbHkgYmluZCB0aGUgdGV4dHVyZXMgQU5EIHNldCB0aGVcbiAgICogdW5pZm9ybXMuXG4gICAqXG4gICAqICAgICBzZXRVbmlmb3Jtcyhwcm9ncmFtSW5mbywgdW5pZm9ybXMpO1xuICAgKlxuICAgKiBGb3IgdGhlIGV4YW1wbGUgYWJvdmUgaXQgaXMgZXF1aXZhbGVudCB0b1xuICAgKlxuICAgKiAgICAgdmFyIHRleFVuaXQgPSAwO1xuICAgKiAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArIHRleFVuaXQpO1xuICAgKiAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4MSk7XG4gICAqICAgICBnbC51bmlmb3JtMWkodV9zb21lU2FtcGxlckxvY2F0aW9uLCB0ZXhVbml0KyspO1xuICAgKiAgICAgZ2wuYWN0aXZlVGV4dHVyZShnbC5URVhUVVJFMCArIHRleFVuaXQpO1xuICAgKiAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgdGV4Mik7XG4gICAqICAgICBnbC51bmlmb3JtMWkodV9zb21lU2FtcGxlckxvY2F0aW9uLCB0ZXhVbml0KyspO1xuICAgKiAgICAgZ2wudW5pZm9ybTRmdih1X3NvbWVDb2xvckxvY2F0aW9uLCBbMSwgMCwgMCwgMV0pO1xuICAgKiAgICAgZ2wudW5pZm9ybTNmdih1X3NvbWVQb3NpdGlvbkxvY2F0aW9uLCBbMCwgMSwgMV0pO1xuICAgKiAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdih1X3NvbWVNYXRyaXgsIGZhbHNlLCBbXG4gICAqICAgICAgICAgMSwwLDAsMCxcbiAgICogICAgICAgICAwLDEsMCwwLFxuICAgKiAgICAgICAgIDAsMCwxLDAsXG4gICAqICAgICAgICAgMCwwLDAsMCxcbiAgICogICAgICAgXSk7XG4gICAqXG4gICAqIE5vdGUgaXQgaXMgcGVyZmVjdGx5IHJlYXNvbmFibGUgdG8gY2FsbCBgc2V0VW5pZm9ybXNgIG11bHRpcGxlIHRpbWVzLiBGb3IgZXhhbXBsZVxuICAgKlxuICAgKiAgICAgdmFyIHVuaWZvcm1zID0ge1xuICAgKiAgICAgICB1X3NvbWVTYW1wbGVyOiB0ZXgxLFxuICAgKiAgICAgICB1X3NvbWVPdGhlclNhbXBsZXI6IHRleDIsXG4gICAqICAgICB9O1xuICAgKlxuICAgKiAgICAgdmFyIG1vcmVVbmlmb3JtcyB7XG4gICAqICAgICAgIHVfc29tZUNvbG9yOiBbMSwwLDAsMV0sXG4gICAqICAgICAgIHVfc29tZVBvc2l0aW9uOiBbMCwxLDFdLFxuICAgKiAgICAgICB1X3NvbWVNYXRyaXg6IFtcbiAgICogICAgICAgICAxLDAsMCwwLFxuICAgKiAgICAgICAgIDAsMSwwLDAsXG4gICAqICAgICAgICAgMCwwLDEsMCxcbiAgICogICAgICAgICAwLDAsMCwwLFxuICAgKiAgICAgICBdLFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogICAgIHNldFVuaWZvcm1zKHByb2dyYW1JbmZvLCB1bmlmb3Jtcyk7XG4gICAqICAgICBzZXRVbmlmb3Jtcyhwcm9ncmFtSW5mbywgbW9yZVVuaWZvcm1zKTtcbiAgICpcbiAgICogQHBhcmFtIHsobW9kdWxlOnR3Z2wuUHJvZ3JhbUluZm98T2JqZWN0LjxzdHJpbmcsIGZ1bmN0aW9uPil9IHNldHRlcnMgYSBgUHJvZ3JhbUluZm9gIGFzIHJldHVybmVkIGZyb20gYGNyZWF0ZVByb2dyYW1JbmZvYCBvciB0aGUgc2V0dGVycyByZXR1cm5lZCBmcm9tXG4gICAqICAgICAgICBgY3JlYXRlVW5pZm9ybVNldHRlcnNgLlxuICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCA/Pn0gdmFsdWVzIGFuIG9iamVjdCB3aXRoIHZhbHVlcyBmb3IgdGhlXG4gICAqICAgICAgICB1bmlmb3Jtcy5cbiAgICogICBZb3UgY2FuIHBhc3MgbXVsdGlwbGUgb2JqZWN0cyBieSBwdXR0aW5nIHRoZW0gaW4gYW4gYXJyYXkgb3IgYnkgY2FsbGluZyB3aXRoIG1vcmUgYXJndW1lbnRzLkZvciBleGFtcGxlXG4gICAqXG4gICAqICAgICB2YXIgc2hhcmVkVW5pZm9ybXMgPSB7XG4gICAqICAgICAgIHVfZm9nTmVhcjogMTAsXG4gICAqICAgICAgIHVfcHJvamVjdGlvbjogLi4uXG4gICAqICAgICAgIC4uLlxuICAgKiAgICAgfTtcbiAgICpcbiAgICogICAgIHZhciBsb2NhbFVuaWZvcm1zID0ge1xuICAgKiAgICAgICB1X3dvcmxkOiAuLi5cbiAgICogICAgICAgdV9kaWZmdXNlQ29sb3I6IC4uLlxuICAgKiAgICAgfTtcbiAgICpcbiAgICogICAgIHR3Z2wuc2V0VW5pZm9ybXMocHJvZ3JhbUluZm8sIHNoYXJlZFVuaWZvcm1zLCBsb2NhbFVuaWZvcm1zKTtcbiAgICpcbiAgICogICAgIC8vIGlzIHRoZSBzYW1lIGFzXG4gICAqXG4gICAqICAgICB0d2dsLnNldFVuaWZvcm1zKHByb2dyYW1JbmZvLCBbc2hhcmVkVW5pZm9ybXMsIGxvY2FsVW5pZm9ybXNdKTtcbiAgICpcbiAgICogICAgIC8vIGlzIHRoZSBzYW1lIGFzXG4gICAqXG4gICAqICAgICB0d2dsLnNldFVuaWZvcm1zKHByb2dyYW1JbmZvLCBzaGFyZWRVbmlmb3Jtcyk7XG4gICAqICAgICB0d2dsLnNldFVuaWZvcm1zKHByb2dyYW1JbmZvLCBsb2NhbFVuaWZvcm1zfTtcbiAgICpcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBzZXRVbmlmb3JtcyhzZXR0ZXJzLCB2YWx1ZXMpIHsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICB2YXIgYWN0dWFsU2V0dGVycyA9IHNldHRlcnMudW5pZm9ybVNldHRlcnMgfHwgc2V0dGVycztcbiAgICB2YXIgbnVtQXJncyA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgYW5keCA9IDE7IGFuZHggPCBudW1BcmdzOyArK2FuZHgpIHtcbiAgICAgIHZhciB2YWxzID0gYXJndW1lbnRzW2FuZHhdO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFscykpIHtcbiAgICAgICAgdmFyIG51bVZhbHVlcyA9IHZhbHMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtVmFsdWVzOyArK2lpKSB7XG4gICAgICAgICAgc2V0VW5pZm9ybXMoYWN0dWFsU2V0dGVycywgdmFsc1tpaV0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHZhbHMpIHtcbiAgICAgICAgICB2YXIgc2V0dGVyID0gYWN0dWFsU2V0dGVyc1tuYW1lXTtcbiAgICAgICAgICBpZiAoc2V0dGVyKSB7XG4gICAgICAgICAgICBzZXR0ZXIodmFsc1tuYW1lXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgc2V0dGVyIGZ1bmN0aW9ucyBmb3IgYWxsIGF0dHJpYnV0ZXMgb2YgYSBzaGFkZXJcbiAgICogcHJvZ3JhbS4gWW91IGNhbiBwYXNzIHRoaXMgdG8ge0BsaW5rIG1vZHVsZTp0d2dsLnNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzfSB0byBzZXQgYWxsIHlvdXIgYnVmZmVycyBhbmQgYXR0cmlidXRlcy5cbiAgICpcbiAgICogQHNlZSB7QGxpbmsgbW9kdWxlOnR3Z2wuc2V0QXR0cmlidXRlc30gZm9yIGV4YW1wbGVcbiAgICogQHBhcmFtIHtXZWJHTFByb2dyYW19IHByb2dyYW0gdGhlIHByb2dyYW0gdG8gY3JlYXRlIHNldHRlcnMgZm9yLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fSBhbiBvYmplY3Qgd2l0aCBhIHNldHRlciBmb3IgZWFjaCBhdHRyaWJ1dGUgYnkgbmFtZS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzKGdsLCBwcm9ncmFtKSB7XG4gICAgdmFyIGF0dHJpYlNldHRlcnMgPSB7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUF0dHJpYlNldHRlcihpbmRleCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYi5idWZmZXIpO1xuICAgICAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGluZGV4KTtcbiAgICAgICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKFxuICAgICAgICAgICAgICBpbmRleCwgYi5udW1Db21wb25lbnRzIHx8IGIuc2l6ZSwgYi50eXBlIHx8IGdsLkZMT0FULCBiLm5vcm1hbGl6ZSB8fCBmYWxzZSwgYi5zdHJpZGUgfHwgMCwgYi5vZmZzZXQgfHwgMCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIG51bUF0dHJpYnMgPSBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkFDVElWRV9BVFRSSUJVVEVTKTtcbiAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtQXR0cmliczsgKytpaSkge1xuICAgICAgdmFyIGF0dHJpYkluZm8gPSBnbC5nZXRBY3RpdmVBdHRyaWIocHJvZ3JhbSwgaWkpO1xuICAgICAgaWYgKCFhdHRyaWJJbmZvKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdmFyIGluZGV4ID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgYXR0cmliSW5mby5uYW1lKTtcbiAgICAgIGF0dHJpYlNldHRlcnNbYXR0cmliSW5mby5uYW1lXSA9IGNyZWF0ZUF0dHJpYlNldHRlcihpbmRleCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dHJpYlNldHRlcnM7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhdHRyaWJ1dGVzIGFuZCBiaW5kcyBidWZmZXJzIChkZXByZWNhdGVkLi4uIHVzZSB7QGxpbmsgbW9kdWxlOnR3Z2wuc2V0QnVmZmVyc0FuZEF0dHJpYnV0ZXN9KVxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKlxuICAgKiAgICAgdmFyIHByb2dyYW0gPSBjcmVhdGVQcm9ncmFtRnJvbVNjcmlwdHMoXG4gICAqICAgICAgICAgZ2wsIFtcInNvbWUtdnNcIiwgXCJzb21lLWZzXCIpO1xuICAgKlxuICAgKiAgICAgdmFyIGF0dHJpYlNldHRlcnMgPSBjcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzKHByb2dyYW0pO1xuICAgKlxuICAgKiAgICAgdmFyIHBvc2l0aW9uQnVmZmVyID0gZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAqICAgICB2YXIgdGV4Y29vcmRCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICpcbiAgICogICAgIHZhciBhdHRyaWJzID0ge1xuICAgKiAgICAgICBhX3Bvc2l0aW9uOiB7YnVmZmVyOiBwb3NpdGlvbkJ1ZmZlciwgbnVtQ29tcG9uZW50czogM30sXG4gICAqICAgICAgIGFfdGV4Y29vcmQ6IHtidWZmZXI6IHRleGNvb3JkQnVmZmVyLCBudW1Db21wb25lbnRzOiAyfSxcbiAgICogICAgIH07XG4gICAqXG4gICAqICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xuICAgKlxuICAgKiBUaGlzIHdpbGwgYXV0b21hdGljYWxseSBiaW5kIHRoZSBidWZmZXJzIEFORCBzZXQgdGhlXG4gICAqIGF0dHJpYnV0ZXMuXG4gICAqXG4gICAqICAgICBzZXRBdHRyaWJ1dGVzKGF0dHJpYlNldHRlcnMsIGF0dHJpYnMpO1xuICAgKlxuICAgKiBQcm9wZXJ0aWVzIG9mIGF0dHJpYnMuIEZvciBlYWNoIGF0dHJpYiB5b3UgY2FuIGFkZFxuICAgKiBwcm9wZXJ0aWVzOlxuICAgKlxuICAgKiAqICAgdHlwZTogdGhlIHR5cGUgb2YgZGF0YSBpbiB0aGUgYnVmZmVyLiBEZWZhdWx0ID0gZ2wuRkxPQVRcbiAgICogKiAgIG5vcm1hbGl6ZTogd2hldGhlciBvciBub3QgdG8gbm9ybWFsaXplIHRoZSBkYXRhLiBEZWZhdWx0ID0gZmFsc2VcbiAgICogKiAgIHN0cmlkZTogdGhlIHN0cmlkZS4gRGVmYXVsdCA9IDBcbiAgICogKiAgIG9mZnNldDogb2Zmc2V0IGludG8gdGhlIGJ1ZmZlci4gRGVmYXVsdCA9IDBcbiAgICpcbiAgICogRm9yIGV4YW1wbGUgaWYgeW91IGhhZCAzIHZhbHVlIGZsb2F0IHBvc2l0aW9ucywgMiB2YWx1ZVxuICAgKiBmbG9hdCB0ZXhjb29yZCBhbmQgNCB2YWx1ZSB1aW50OCBjb2xvcnMgeW91J2Qgc2V0dXAgeW91clxuICAgKiBhdHRyaWJzIGxpa2UgdGhpc1xuICAgKlxuICAgKiAgICAgdmFyIGF0dHJpYnMgPSB7XG4gICAqICAgICAgIGFfcG9zaXRpb246IHtidWZmZXI6IHBvc2l0aW9uQnVmZmVyLCBudW1Db21wb25lbnRzOiAzfSxcbiAgICogICAgICAgYV90ZXhjb29yZDoge2J1ZmZlcjogdGV4Y29vcmRCdWZmZXIsIG51bUNvbXBvbmVudHM6IDJ9LFxuICAgKiAgICAgICBhX2NvbG9yOiB7XG4gICAqICAgICAgICAgYnVmZmVyOiBjb2xvckJ1ZmZlcixcbiAgICogICAgICAgICBudW1Db21wb25lbnRzOiA0LFxuICAgKiAgICAgICAgIHR5cGU6IGdsLlVOU0lHTkVEX0JZVEUsXG4gICAqICAgICAgICAgbm9ybWFsaXplOiB0cnVlLFxuICAgKiAgICAgICB9LFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgZnVuY3Rpb24+fSBzZXR0ZXJzIEF0dHJpYnV0ZSBzZXR0ZXJzIGFzIHJldHVybmVkIGZyb20gY3JlYXRlQXR0cmlidXRlU2V0dGVyc1xuICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCBtb2R1bGU6dHdnbC5BdHRyaWJJbmZvPn0gYnVmZmVycyBBdHRyaWJJbmZvcyBtYXBwZWQgYnkgYXR0cmlidXRlIG5hbWUuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKiBAZGVwcmVjYXRlZCB1c2Uge0BsaW5rIG1vZHVsZTp0d2dsLnNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzfVxuICAgKi9cbiAgZnVuY3Rpb24gc2V0QXR0cmlidXRlcyhzZXR0ZXJzLCBidWZmZXJzKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiBidWZmZXJzKSB7XG4gICAgICB2YXIgc2V0dGVyID0gc2V0dGVyc1tuYW1lXTtcbiAgICAgIGlmIChzZXR0ZXIpIHtcbiAgICAgICAgc2V0dGVyKGJ1ZmZlcnNbbmFtZV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGF0dHJpYnV0ZXMgYW5kIGJ1ZmZlcnMgaW5jbHVkaW5nIHRoZSBgRUxFTUVOVF9BUlJBWV9CVUZGRVJgIGlmIGFwcHJvcHJpYXRlXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqXG4gICAqICAgICB2YXIgcHJvZ3JhbUluZm8gPSBjcmVhdGVQcm9ncmFtSW5mbyhcbiAgICogICAgICAgICBnbCwgW1wic29tZS12c1wiLCBcInNvbWUtZnNcIik7XG4gICAqXG4gICAqICAgICB2YXIgYXJyYXlzID0ge1xuICAgKiAgICAgICBwb3NpdGlvbjogeyBudW1Db21wb25lbnRzOiAzLCBkYXRhOiBbMCwgMCwgMCwgMTAsIDAsIDAsIDAsIDEwLCAwLCAxMCwgMTAsIDBdLCB9LFxuICAgKiAgICAgICB0ZXhjb29yZDogeyBudW1Db21wb25lbnRzOiAyLCBkYXRhOiBbMCwgMCwgMCwgMSwgMSwgMCwgMSwgMV0sICAgICAgICAgICAgICAgICB9LFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogICAgIHZhciBidWZmZXJJbmZvID0gY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXMoZ2wsIGFycmF5cyk7XG4gICAqXG4gICAqICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW1JbmZvLnByb2dyYW0pO1xuICAgKlxuICAgKiBUaGlzIHdpbGwgYXV0b21hdGljYWxseSBiaW5kIHRoZSBidWZmZXJzIEFORCBzZXQgdGhlXG4gICAqIGF0dHJpYnV0ZXMuXG4gICAqXG4gICAqICAgICBzZXRCdWZmZXJzQW5kQXR0cmlidXRlcyhnbCwgcHJvZ3JhbUluZm8sIGJ1ZmZlckluZm8pO1xuICAgKlxuICAgKiBGb3IgdGhlIGV4YW1wbGUgYWJvdmUgaXQgaXMgZXF1aXZpbGVudCB0b1xuICAgKlxuICAgKiAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHBvc2l0aW9uQnVmZmVyKTtcbiAgICogICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGFfcG9zaXRpb25Mb2NhdGlvbik7XG4gICAqICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGFfcG9zaXRpb25Mb2NhdGlvbiwgMywgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcbiAgICogICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhjb29yZEJ1ZmZlcik7XG4gICAqICAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShhX3RleGNvb3JkTG9jYXRpb24pO1xuICAgKiAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihhX3RleGNvb3JkTG9jYXRpb24sIDQsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBBIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHsobW9kdWxlOnR3Z2wuUHJvZ3JhbUluZm98T2JqZWN0LjxzdHJpbmcsIGZ1bmN0aW9uPil9IHNldHRlcnMgQSBgUHJvZ3JhbUluZm9gIGFzIHJldHVybmVkIGZyb20gYGNyZWF0ZVByb2dybWFJbmZvYCBBdHRyaWJ1dGUgc2V0dGVycyBhcyByZXR1cm5lZCBmcm9tIGBjcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzYFxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IGJ1ZmZlcnMgYSBCdWZmZXJJbmZvIGFzIHJldHVybmVkIGZyb20gYGNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzYC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBzZXRCdWZmZXJzQW5kQXR0cmlidXRlcyhnbCwgcHJvZ3JhbUluZm8sIGJ1ZmZlcnMpIHtcbiAgICBzZXRBdHRyaWJ1dGVzKHByb2dyYW1JbmZvLmF0dHJpYlNldHRlcnMgfHwgcHJvZ3JhbUluZm8sIGJ1ZmZlcnMuYXR0cmlicyk7XG4gICAgaWYgKGJ1ZmZlcnMuaW5kaWNlcykge1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgYnVmZmVycy5pbmRpY2VzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gUHJvZ3JhbUluZm9cbiAgICogQHByb3BlcnR5IHtXZWJHTFByb2dyYW19IHByb2dyYW0gQSBzaGFkZXIgcHJvZ3JhbVxuICAgKiBAcHJvcGVydHkge09iamVjdDxzdHJpbmcsIGZ1bmN0aW9uPn0gdW5pZm9ybVNldHRlcnMgb2JqZWN0IG9mIHNldHRlcnMgYXMgcmV0dXJuZWQgZnJvbSBjcmVhdGVVbmlmb3JtU2V0dGVycyxcbiAgICogQHByb3BlcnR5IHtPYmplY3Q8c3RyaW5nLCBmdW5jdGlvbj59IGF0dHJpYlNldHRlcnMgb2JqZWN0IG9mIHNldHRlcnMgYXMgcmV0dXJuZWQgZnJvbSBjcmVhdGVBdHRyaWJTZXR0ZXJzLFxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBQcm9ncmFtSW5mbyBmcm9tIGFuIGV4aXN0aW5nIHByb2dyYW0uXG4gICAqXG4gICAqIEEgUHJvZ3JhbUluZm8gY29udGFpbnNcbiAgICpcbiAgICogICAgIHByb2dyYW1JbmZvID0ge1xuICAgKiAgICAgICAgcHJvZ3JhbTogV2ViR0xQcm9ncmFtLFxuICAgKiAgICAgICAgdW5pZm9ybVNldHRlcnM6IG9iamVjdCBvZiBzZXR0ZXJzIGFzIHJldHVybmVkIGZyb20gY3JlYXRlVW5pZm9ybVNldHRlcnMsXG4gICAqICAgICAgICBhdHRyaWJTZXR0ZXJzOiBvYmplY3Qgb2Ygc2V0dGVycyBhcyByZXR1cm5lZCBmcm9tIGNyZWF0ZUF0dHJpYlNldHRlcnMsXG4gICAqICAgICB9XG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqICAgICAgICB0byB1c2UuXG4gICAqIEBwYXJhbSB7V2ViR0xQcm9ncmFtfSBwcm9ncmFtIGFuIGV4aXN0aW5nIFdlYkdMUHJvZ3JhbS5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wuUHJvZ3JhbUluZm99IFRoZSBjcmVhdGVkIFByb2dyYW1JbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW1JbmZvRnJvbVByb2dyYW0oZ2wsIHByb2dyYW0pIHtcbiAgICB2YXIgdW5pZm9ybVNldHRlcnMgPSBjcmVhdGVVbmlmb3JtU2V0dGVycyhnbCwgcHJvZ3JhbSk7XG4gICAgdmFyIGF0dHJpYlNldHRlcnMgPSBjcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzKGdsLCBwcm9ncmFtKTtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvZ3JhbTogcHJvZ3JhbSxcbiAgICAgIHVuaWZvcm1TZXR0ZXJzOiB1bmlmb3JtU2V0dGVycyxcbiAgICAgIGF0dHJpYlNldHRlcnM6IGF0dHJpYlNldHRlcnMsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgUHJvZ3JhbUluZm8gZnJvbSAyIHNvdXJjZXMuXG4gICAqXG4gICAqIEEgUHJvZ3JhbUluZm8gY29udGFpbnNcbiAgICpcbiAgICogICAgIHByb2dyYW1JbmZvID0ge1xuICAgKiAgICAgICAgcHJvZ3JhbTogV2ViR0xQcm9ncmFtLFxuICAgKiAgICAgICAgdW5pZm9ybVNldHRlcnM6IG9iamVjdCBvZiBzZXR0ZXJzIGFzIHJldHVybmVkIGZyb20gY3JlYXRlVW5pZm9ybVNldHRlcnMsXG4gICAqICAgICAgICBhdHRyaWJTZXR0ZXJzOiBvYmplY3Qgb2Ygc2V0dGVycyBhcyByZXR1cm5lZCBmcm9tIGNyZWF0ZUF0dHJpYlNldHRlcnMsXG4gICAqICAgICB9XG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqICAgICAgICB0byB1c2UuXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IHNoYWRlclNvdXJjZXNzIEFycmF5IG9mIHNvdXJjZXMgZm9yIHRoZVxuICAgKiAgICAgICAgc2hhZGVycyBvciBpZHMuIFRoZSBmaXJzdCBpcyBhc3N1bWVkIHRvIGJlIHRoZSB2ZXJ0ZXggc2hhZGVyLFxuICAgKiAgICAgICAgdGhlIHNlY29uZCB0aGUgZnJhZ21lbnQgc2hhZGVyLlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBbb3B0X2F0dHJpYnNdIEFuIGFycmF5IG9mIGF0dHJpYnMgbmFtZXMuIExvY2F0aW9ucyB3aWxsIGJlIGFzc2lnbmVkIGJ5IGluZGV4IGlmIG5vdCBwYXNzZWQgaW5cbiAgICogQHBhcmFtIHtudW1iZXJbXX0gW29wdF9sb2NhdGlvbnNdIFRoZSBsb2NhdGlvbnMgZm9yIHRoZS4gQSBwYXJhbGxlbCBhcnJheSB0byBvcHRfYXR0cmlicyBsZXR0aW5nIHlvdSBhc3NpZ24gbG9jYXRpb25zLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkVycm9yQ2FsbGJhY2t9IG9wdF9lcnJvckNhbGxiYWNrIGNhbGxiYWNrIGZvciBlcnJvcnMuIEJ5IGRlZmF1bHQgaXQganVzdCBwcmludHMgYW4gZXJyb3IgdG8gdGhlIGNvbnNvbGVcbiAgICogICAgICAgIG9uIGVycm9yLiBJZiB5b3Ugd2FudCBzb21ldGhpbmcgZWxzZSBwYXNzIGFuIGNhbGxiYWNrLiBJdCdzIHBhc3NlZCBhbiBlcnJvciBtZXNzYWdlLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5Qcm9ncmFtSW5mbz99IFRoZSBjcmVhdGVkIFByb2dyYW1JbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW1JbmZvKFxuICAgICAgZ2wsIHNoYWRlclNvdXJjZXMsIG9wdF9hdHRyaWJzLCBvcHRfbG9jYXRpb25zLCBvcHRfZXJyb3JDYWxsYmFjaykge1xuICAgIHNoYWRlclNvdXJjZXMgPSBzaGFkZXJTb3VyY2VzLm1hcChmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzb3VyY2UpO1xuICAgICAgcmV0dXJuIHNjcmlwdCA/IHNjcmlwdC50ZXh0IDogc291cmNlO1xuICAgIH0pO1xuICAgIHZhciBwcm9ncmFtID0gY3JlYXRlUHJvZ3JhbUZyb21Tb3VyY2VzKGdsLCBzaGFkZXJTb3VyY2VzLCBvcHRfYXR0cmlicywgb3B0X2xvY2F0aW9ucywgb3B0X2Vycm9yQ2FsbGJhY2spO1xuICAgIGlmICghcHJvZ3JhbSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVQcm9ncmFtSW5mb0Zyb21Qcm9ncmFtKGdsLCBwcm9ncmFtKTtcbiAgfVxuXG4gIC8vIFVzaW5nIHF1b3RlcyBwcmV2ZW50cyBVZ2xpZnkgZnJvbSBjaGFuZ2luZyB0aGUgbmFtZXMuXG4gIC8vIE5vIHNwZWVkIGRpZmYgQUZBSUNULlxuICByZXR1cm4ge1xuICAgIFwiY3JlYXRlQXR0cmlidXRlU2V0dGVyc1wiOiBjcmVhdGVBdHRyaWJ1dGVTZXR0ZXJzLFxuXG4gICAgXCJjcmVhdGVQcm9ncmFtXCI6IGNyZWF0ZVByb2dyYW0sXG4gICAgXCJjcmVhdGVQcm9ncmFtRnJvbVNjcmlwdHNcIjogY3JlYXRlUHJvZ3JhbUZyb21TY3JpcHRzLFxuICAgIFwiY3JlYXRlUHJvZ3JhbUZyb21Tb3VyY2VzXCI6IGNyZWF0ZVByb2dyYW1Gcm9tU291cmNlcyxcbiAgICBcImNyZWF0ZVByb2dyYW1JbmZvXCI6IGNyZWF0ZVByb2dyYW1JbmZvLFxuICAgIFwiY3JlYXRlUHJvZ3JhbUluZm9Gcm9tUHJvZ3JhbVwiOiBjcmVhdGVQcm9ncmFtSW5mb0Zyb21Qcm9ncmFtLFxuICAgIFwiY3JlYXRlVW5pZm9ybVNldHRlcnNcIjogY3JlYXRlVW5pZm9ybVNldHRlcnMsXG5cbiAgICBcInNldEF0dHJpYnV0ZXNcIjogc2V0QXR0cmlidXRlcyxcbiAgICBcInNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzXCI6IHNldEJ1ZmZlcnNBbmRBdHRyaWJ1dGVzLFxuICAgIFwic2V0VW5pZm9ybXNcIjogc2V0VW5pZm9ybXMsXG4gIH07XG5cbn0pO1xuXG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSwgR3JlZ2cgVGF2YXJlcy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG5kZWZpbmUoJ3R3Z2wvZHJhdycsW1xuICAgICcuL3Byb2dyYW1zJyxcbiAgXSwgZnVuY3Rpb24gKFxuICAgIHByb2dyYW1zKSB7XG4gIFxuXG4gIC8qKlxuICAgKiBDYWxscyBgZ2wuZHJhd0VsZW1lbnRzYCBvciBgZ2wuZHJhd0FycmF5c2AsIHdoaWNoZXZlciBpcyBhcHByb3ByaWF0ZVxuICAgKlxuICAgKiBub3JtYWxseSB5b3UnZCBjYWxsIGBnbC5kcmF3RWxlbWVudHNgIG9yIGBnbC5kcmF3QXJyYXlzYCB5b3Vyc2VsZlxuICAgKiBidXQgY2FsbGluZyB0aGlzIG1lYW5zIGlmIHlvdSBzd2l0Y2ggZnJvbSBpbmRleGVkIGRhdGEgdG8gbm9uLWluZGV4ZWRcbiAgICogZGF0YSB5b3UgZG9uJ3QgaGF2ZSB0byByZW1lbWJlciB0byB1cGRhdGUgeW91ciBkcmF3IGNhbGwuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBBIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge2VudW19IHR5cGUgZWcgKGdsLlRSSUFOR0xFUywgZ2wuTElORVMsIGdsLlBPSU5UUywgZ2wuVFJJQU5HTEVfU1RSSVAsIC4uLilcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBidWZmZXJJbmZvIGFzIHJldHVybmVkIGZyb20gY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXNcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtjb3VudF0gQW4gb3B0aW9uYWwgY291bnQuIERlZmF1bHRzIHRvIGJ1ZmZlckluZm8ubnVtRWxlbWVudHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvZmZzZXRdIEFuIG9wdGlvbmFsIG9mZnNldC4gRGVmYXVsdHMgdG8gMC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBkcmF3QnVmZmVySW5mbyhnbCwgdHlwZSwgYnVmZmVySW5mbywgY291bnQsIG9mZnNldCkge1xuICAgIHZhciBpbmRpY2VzID0gYnVmZmVySW5mby5pbmRpY2VzO1xuICAgIHZhciBudW1FbGVtZW50cyA9IGNvdW50ID09PSB1bmRlZmluZWQgPyBidWZmZXJJbmZvLm51bUVsZW1lbnRzIDogY291bnQ7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0ID09PSB1bmRlZmluZWQgPyAwIDogb2Zmc2V0O1xuICAgIGlmIChpbmRpY2VzKSB7XG4gICAgICBnbC5kcmF3RWxlbWVudHModHlwZSwgbnVtRWxlbWVudHMsIGJ1ZmZlckluZm8uZWxlbWVudFR5cGUgPT09IHVuZGVmaW5lZCA/IGdsLlVOU0lHTkVEX1NIT1JUIDogYnVmZmVySW5mby5lbGVtZW50VHlwZSwgb2Zmc2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2wuZHJhd0FycmF5cyh0eXBlLCBvZmZzZXQsIG51bUVsZW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gRHJhd09iamVjdFxuICAgKiBAcHJvcGVydHkge2Jvb2xlYW59IFthY3RpdmVdIHdoZXRoZXIgb3Igbm90IHRvIGRyYXcuIERlZmF1bHQgPSBgdHJ1ZWAgKG11c3QgYmUgYGZhbHNlYCB0byBiZSBub3QgdHJ1ZSkuIEluIG90aGVyd29yZHMgYHVuZGVmaW5lZGAgPSBgdHJ1ZWBcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFt0eXBlXSB0eXBlIHRvIGRyYXcgZWcuIGBnbC5UUklBTkdMRVNgLCBgZ2wuTElORVNgLCBldGMuLi5cbiAgICogQHByb3BlcnR5IHttb2R1bGU6dHdnbC5Qcm9ncmFtSW5mb30gcHJvZ3JhbUluZm8gQSBQcm9ncmFtSW5mbyBhcyByZXR1cm5lZCBmcm9tIGNyZWF0ZVByb2dyYW1JbmZvXG4gICAqIEBwcm9wZXJ0eSB7bW9kdWxlOnR3Z2wuQnVmZmVySW5mb30gYnVmZmVySW5mbyBBIEJ1ZmZlckluZm8gYXMgcmV0dXJuZWQgZnJvbSBjcmVhdGVCdWZmZXJJbmZvRnJvbUFycmF5c1xuICAgKiBAcHJvcGVydHkge09iamVjdDxzdHJpbmcsID8+fSB1bmlmb3JtcyBUaGUgdmFsdWVzIGZvciB0aGUgdW5pZm9ybXMuXG4gICAqICAgWW91IGNhbiBwYXNzIG11bHRpcGxlIG9iamVjdHMgYnkgcHV0dGluZyB0aGVtIGluIGFuIGFycmF5LiBGb3IgZXhhbXBsZVxuICAgKlxuICAgKiAgICAgdmFyIHNoYXJlZFVuaWZvcm1zID0ge1xuICAgKiAgICAgICB1X2ZvZ05lYXI6IDEwLFxuICAgKiAgICAgICB1X3Byb2plY3Rpb246IC4uLlxuICAgKiAgICAgICAuLi5cbiAgICogICAgIH07XG4gICAqXG4gICAqICAgICB2YXIgbG9jYWxVbmlmb3JtcyA9IHtcbiAgICogICAgICAgdV93b3JsZDogLi4uXG4gICAqICAgICAgIHVfZGlmZnVzZUNvbG9yOiAuLi5cbiAgICogICAgIH07XG4gICAqXG4gICAqICAgICB2YXIgZHJhd09iaiA9IHtcbiAgICogICAgICAgLi4uXG4gICAqICAgICAgIHVuaWZvcm1zOiBbc2hhcmVkVW5pZm9ybXMsIGxvY2FsVW5pZm9ybXNdLFxuICAgKiAgICAgfTtcbiAgICpcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtvZmZzZXRdIHRoZSBvZmZzZXQgdG8gcGFzcyB0byBgZ2wuZHJhd0FycmF5c2Agb3IgYGdsLmRyYXdFbGVtZW50c2AuIERlZmF1bHRzIHRvIDAuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbY291bnRdIHRoZSBjb3VudCB0byBwYXNzIHRvIGBnbC5kcmF3QXJyYXlzYCBvciBgZ2wuZHJhd0VsZW1udHNgLiBEZWZhdWx0cyB0byBidWZmZXJJbmZvLm51bUVsZW1lbnRzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cbiAgLyoqXG4gICAqIERyYXdzIGEgbGlzdCBvZiBvYmplY3RzXG4gICAqIEBwYXJhbSB7RHJhd09iamVjdFtdfSBvYmplY3RzVG9EcmF3IGFuIGFycmF5IG9mIG9iamVjdHMgdG8gZHJhdy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBkcmF3T2JqZWN0TGlzdChnbCwgb2JqZWN0c1RvRHJhdykge1xuICAgIHZhciBsYXN0VXNlZFByb2dyYW1JbmZvID0gbnVsbDtcbiAgICB2YXIgbGFzdFVzZWRCdWZmZXJJbmZvID0gbnVsbDtcblxuICAgIG9iamVjdHNUb0RyYXcuZm9yRWFjaChmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QuYWN0aXZlID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9ncmFtSW5mbyA9IG9iamVjdC5wcm9ncmFtSW5mbztcbiAgICAgIHZhciBidWZmZXJJbmZvID0gb2JqZWN0LmJ1ZmZlckluZm87XG4gICAgICB2YXIgYmluZEJ1ZmZlcnMgPSBmYWxzZTtcblxuICAgICAgaWYgKHByb2dyYW1JbmZvICE9PSBsYXN0VXNlZFByb2dyYW1JbmZvKSB7XG4gICAgICAgIGxhc3RVc2VkUHJvZ3JhbUluZm8gPSBwcm9ncmFtSW5mbztcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtSW5mby5wcm9ncmFtKTtcblxuICAgICAgICAvLyBXZSBoYXZlIHRvIHJlYmluZCBidWZmZXJzIHdoZW4gY2hhbmdpbmcgcHJvZ3JhbXMgYmVjYXVzZSB3ZVxuICAgICAgICAvLyBvbmx5IGJpbmQgYnVmZmVycyB0aGUgcHJvZ3JhbSB1c2VzLiBTbyBpZiAyIHByb2dyYW1zIHVzZSB0aGUgc2FtZVxuICAgICAgICAvLyBidWZmZXJJbmZvIGJ1dCB0aGUgMXN0IG9uZSB1c2VzIG9ubHkgcG9zaXRpb25zIHRoZSB3aGVuIHRoZVxuICAgICAgICAvLyB3ZSBzd2l0Y2ggdG8gdGhlIDJuZCBvbmUgc29tZSBvZiB0aGUgYXR0cmlidXRlcyB3aWxsIG5vdCBiZSBvbi5cbiAgICAgICAgYmluZEJ1ZmZlcnMgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBTZXR1cCBhbGwgdGhlIG5lZWRlZCBhdHRyaWJ1dGVzLlxuICAgICAgaWYgKGJpbmRCdWZmZXJzIHx8IGJ1ZmZlckluZm8gIT09IGxhc3RVc2VkQnVmZmVySW5mbykge1xuICAgICAgICBsYXN0VXNlZEJ1ZmZlckluZm8gPSBidWZmZXJJbmZvO1xuICAgICAgICBwcm9ncmFtcy5zZXRCdWZmZXJzQW5kQXR0cmlidXRlcyhnbCwgcHJvZ3JhbUluZm8sIGJ1ZmZlckluZm8pO1xuICAgICAgfVxuXG4gICAgICAvLyBTZXQgdGhlIHVuaWZvcm1zLlxuICAgICAgcHJvZ3JhbXMuc2V0VW5pZm9ybXMocHJvZ3JhbUluZm8sIG9iamVjdC51bmlmb3Jtcyk7XG5cbiAgICAgIC8vIERyYXdcbiAgICAgIGRyYXdCdWZmZXJJbmZvKGdsLCBvYmplY3QudHlwZSB8fCBnbC5UUklBTkdMRVMsIGJ1ZmZlckluZm8sIG9iamVjdC5jb3VudCwgb2JqZWN0Lm9mZnNldCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBVc2luZyBxdW90ZXMgcHJldmVudHMgVWdsaWZ5IGZyb20gY2hhbmdpbmcgdGhlIG5hbWVzLlxuICAvLyBObyBzcGVlZCBkaWZmIEFGQUlDVC5cbiAgcmV0dXJuIHtcbiAgICBcImRyYXdCdWZmZXJJbmZvXCI6IGRyYXdCdWZmZXJJbmZvLFxuICAgIFwiZHJhd09iamVjdExpc3RcIjogZHJhd09iamVjdExpc3QsXG4gIH07XG5cbn0pO1xuXG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSwgR3JlZ2cgVGF2YXJlcy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG5kZWZpbmUoJ3R3Z2wvdXRpbHMnLFtdLCBmdW5jdGlvbiAoKSB7XG4gIFxuXG4gIC8qKlxuICAgKiBDb3B5IGFuIG9iamVjdCAxIGxldmVsIGRlZXBcbiAgICogQHBhcmFtIHtvYmplY3R9IHNyYyBvYmplY3QgdG8gY29weVxuICAgKiBAcmV0dXJuIHtvYmplY3R9IHRoZSBjb3B5XG4gICAqL1xuICBmdW5jdGlvbiBzaGFsbG93Q29weShzcmMpIHtcbiAgICB2YXIgZHN0ID0ge307XG4gICAgT2JqZWN0LmtleXMoc3JjKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgZHN0W2tleV0gPSBzcmNba2V5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBzaGFsbG93Q29weTogc2hhbGxvd0NvcHksXG4gIH07XG59KTtcblxuXG4vKlxuICogQ29weXJpZ2h0IDIwMTUsIEdyZWdnIFRhdmFyZXMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZVxuICogbWV0OlxuICpcbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXG4gKiBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyXG4gKiBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlXG4gKiBkaXN0cmlidXRpb24uXG4gKiAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdyZWdnIFRhdmFyZXMuIG5vciB0aGUgbmFtZXMgb2YgaGlzXG4gKiBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbVxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAqIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcbiAqIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLFxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXG4gKiBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuZGVmaW5lKCd0d2dsL3RleHR1cmVzJyxbXG4gICAgJy4vdHlwZWRhcnJheXMnLFxuICAgICcuL3V0aWxzJyxcbiAgXSwgZnVuY3Rpb24gKFxuICAgIHR5cGVkQXJyYXlzLFxuICAgIHV0aWxzKSB7XG4gIFxuXG4gIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBzZWUgYSBnbG9iYWwgZ2xcbiAgdmFyIGdsID0gdW5kZWZpbmVkOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgdGV4dHVyZUNvbG9yOiBuZXcgVWludDhBcnJheShbMTI4LCAxOTIsIDI1NSwgMjU1XSksXG4gICAgdGV4dHVyZU9wdGlvbnM6IHt9LFxuICB9O1xuICB2YXIgaXNBcnJheUJ1ZmZlciA9IHR5cGVkQXJyYXlzLmlzQXJyYXlCdWZmZXI7XG5cbiAgLyogUGl4ZWxGb3JtYXQgKi9cbiAgdmFyIEFMUEhBICAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MTkwNjtcbiAgdmFyIFJHQiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MTkwNztcbiAgdmFyIFJHQkEgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MTkwODtcbiAgdmFyIExVTUlOQU5DRSAgICAgICAgICAgICAgICAgICAgICA9IDB4MTkwOTtcbiAgdmFyIExVTUlOQU5DRV9BTFBIQSAgICAgICAgICAgICAgICA9IDB4MTkwQTtcblxuICAvKiBUZXh0dXJlV3JhcE1vZGUgKi9cbiAgdmFyIFJFUEVBVCAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MjkwMTsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgdmFyIE1JUlJPUkVEX1JFUEVBVCAgICAgICAgICAgICAgICA9IDB4ODM3MDsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAvKiBUZXh0dXJlTWFnRmlsdGVyICovXG4gIHZhciBORUFSRVNUICAgICAgICAgICAgICAgICAgICAgICAgPSAweDI2MDA7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgLyogVGV4dHVyZU1pbkZpbHRlciAqL1xuICB2YXIgTkVBUkVTVF9NSVBNQVBfTkVBUkVTVCAgICAgICAgID0gMHgyNzAwOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB2YXIgTElORUFSX01JUE1BUF9ORUFSRVNUICAgICAgICAgID0gMHgyNzAxOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB2YXIgTkVBUkVTVF9NSVBNQVBfTElORUFSICAgICAgICAgID0gMHgyNzAyOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB2YXIgTElORUFSX01JUE1BUF9MSU5FQVIgICAgICAgICAgID0gMHgyNzAzOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBkZWZhdWx0IHRleHR1cmUgY29sb3IuXG4gICAqXG4gICAqIFRoZSBkZWZhdWx0IHRleHR1cmUgY29sb3IgaXMgdXNlZCB3aGVuIGxvYWRpbmcgdGV4dHVyZXMgZnJvbVxuICAgKiB1cmxzLiBCZWNhdXNlIHRoZSBVUkwgd2lsbCBiZSBsb2FkZWQgYXN5bmMgd2UnZCBsaWtlIHRvIGJlXG4gICAqIGFibGUgdG8gdXNlIHRoZSB0ZXh0dXJlIGltbWVkaWF0ZWx5LiBCeSBwdXR0aW5nIGEgMXgxIHBpeGVsXG4gICAqIGNvbG9yIGluIHRoZSB0ZXh0dXJlIHdlIGNhbiBzdGFydCB1c2luZyB0aGUgdGV4dHVyZSBiZWZvcmVcbiAgICogdGhlIFVSTCBoYXMgbG9hZGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcltdfSBjb2xvciBBcnJheSBvZiA0IHZhbHVlcyBpbiB0aGUgcmFuZ2UgMCB0byAxXG4gICAqIEBkZXByZWNhdGVkIHNlZSB7QGxpbmsgbW9kdWxlOnR3Z2wuc2V0RGVmYXVsdHN9XG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0RGVmYXVsdFRleHR1cmVDb2xvcihjb2xvcikge1xuICAgIGRlZmF1bHRzLnRleHR1cmVDb2xvciA9IG5ldyBVaW50OEFycmF5KFtjb2xvclswXSAqIDI1NSwgY29sb3JbMV0gKiAyNTUsIGNvbG9yWzJdICogMjU1LCBjb2xvclszXSAqIDI1NV0pO1xuICB9XG5cbiAgdmFyIGludmFsaWREZWZhdWx0S2V5c1JFID0gL150ZXh0dXJlQ29sb3IkLztcbiAgZnVuY3Rpb24gdmFsaWREZWZhdWx0S2V5cyhrZXkpIHtcbiAgICByZXR1cm4gIWludmFsaWREZWZhdWx0S2V5c1JFLnRlc3Qoa2V5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldERlZmF1bHRzKG5ld0RlZmF1bHRzKSB7XG4gICAgaWYgKG5ld0RlZmF1bHRzLnRleHR1cmVDb2xvcikge1xuICAgICAgc2V0RGVmYXVsdFRleHR1cmVDb2xvcihuZXdEZWZhdWx0cy50ZXh0dXJlQ29sb3IpO1xuICAgIH1cbiAgICBPYmplY3Qua2V5cyhuZXdEZWZhdWx0cykuZmlsdGVyKHZhbGlkRGVmYXVsdEtleXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBkZWZhdWx0c1trZXldID0gbmV3RGVmYXVsdHNba2V5XTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgc3RyaW5nIGZvciBnbCBlbnVtXG4gICAqXG4gICAqIE5vdGU6IFNldmVyYWwgZW51bXMgYXJlIHRoZSBzYW1lLiBXaXRob3V0IG1vcmVcbiAgICogY29udGV4dCAod2hpY2ggZnVuY3Rpb24pIGl0J3MgaW1wb3NzaWJsZSB0byBhbHdheXNcbiAgICogZ2l2ZSB0aGUgY29ycmVjdCBlbnVtLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgQSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIHRoZSB2YWx1ZSBvZiB0aGUgZW51bSB5b3Ugd2FudCB0byBsb29rIHVwLlxuICAgKi9cbiAgdmFyIGdsRW51bVRvU3RyaW5nID0gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbnVtcztcblxuICAgIGZ1bmN0aW9uIGluaXQoZ2wpIHtcbiAgICAgIGlmICghZW51bXMpIHtcbiAgICAgICAgZW51bXMgPSB7fTtcbiAgICAgICAgT2JqZWN0LmtleXMoZ2wpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBnbFtrZXldID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgZW51bXNbZ2xba2V5XV0gPSBrZXk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gZ2xFbnVtVG9TdHJpbmcoZ2wsIHZhbHVlKSB7XG4gICAgICBpbml0KCk7XG4gICAgICByZXR1cm4gZW51bXNbdmFsdWVdIHx8IChcIjB4XCIgKyB2YWx1ZS50b1N0cmluZygxNikpO1xuICAgIH07XG4gIH0oKSk7XG5cbiAgLyoqXG4gICAqIEEgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgdGhlIHNvdXJjZSBmb3IgYSB0ZXh0dXJlLlxuICAgKiBAY2FsbGJhY2sgVGV4dHVyZUZ1bmNcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIEEgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IG9wdGlvbnMgdGhlIHRleHR1cmUgb3B0aW9uc1xuICAgKiBAcmV0dXJuIHsqfSBSZXR1cm5zIGFueSBvZiB0aGUgdGhpbmdzIGRvY3VtZW50ZW50ZWQgZm9yIGBzcmNgIGZvciB7QGxpbmsgbW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cbiAgLyoqXG4gICAqIFRleHR1cmUgb3B0aW9ucyBwYXNzZWQgdG8gbW9zdCB0ZXh0dXJlIGZ1bmN0aW9ucy4gRWFjaCBmdW5jdGlvbiB3aWxsIHVzZSB3aGF0ZXZlciBvcHRpb25zXG4gICAqIGFyZSBhcHByb3ByaWF0ZSBmb3IgaXRzIG5lZWRzLiBUaGlzIGxldHMgeW91IHBhc3MgdGhlIHNhbWUgb3B0aW9ucyB0byBhbGwgZnVuY3Rpb25zLlxuICAgKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBUZXh0dXJlT3B0aW9uc1xuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3RhcmdldF0gdGhlIHR5cGUgb2YgdGV4dHVyZSBgZ2wuVEVYVFVSRV8yRGAgb3IgYGdsLlRFWFRVUkVfQ1VCRV9NQVBgLiBEZWZhdWx0cyB0byBgZ2wuVEVYVFVSRV8yRGAuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbd2lkdGhdIHRoZSB3aWR0aCBvZiB0aGUgdGV4dHVyZS4gT25seSB1c2VkIGlmIHNyYyBpcyBhbiBhcnJheSBvciB0eXBlZCBhcnJheSBvciBudWxsLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW2hlaWdodF0gdGhlIGhlaWdodCBvZiBhIHRleHR1cmUuIE9ubHkgdXNlZCBpZiBzcmMgaXMgYW4gYXJyYXkgb3IgdHlwZWQgYXJyYXkgb3IgbnVsbC5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFttaW5dIHRoZSBtaW4gZmlsdGVyIHNldHRpbmcgKGVnLiBgZ2wuTElORUFSYCkuIERlZmF1bHRzIHRvIGBnbC5ORUFSRVNUX01JUE1BUF9MSU5FQVJgXG4gICAqICAgICBvciBpZiB0ZXh0dXJlIGlzIG5vdCBhIHBvd2VyIG9mIDIgb24gYm90aCBkaW1lbnNpb25zIHRoZW4gZGVmYXVsdHMgdG8gYGdsLkxJTkVBUmAuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbbWFnXSB0aGUgbWFnIGZpbHRlciBzZXR0aW5nIChlZy4gYGdsLkxJTkVBUmApLiBEZWZhdWx0cyB0byBgZ2wuTElORUFSYFxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW2Zvcm1hdF0gZm9ybWF0IGZvciB0ZXh0dXJlLiBEZWZhdWx0cyB0byBgZ2wuUkdCQWAuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbdHlwZV0gdHlwZSBmb3IgdGV4dHVyZS4gRGVmYXVsdHMgdG8gYGdsLlVOU0lHTkVEX0JZVEVgIHVubGVzcyBgc3JjYCBpcyBBcnJheUJ1ZmZlci4gSWYgYHNyY2BcbiAgICogICAgIGlzIEFycmF5QnVmZmVyIGRlZmF1bHRzIHRvIHR5cGUgdGhhdCBtYXRjaGVzIEFycmF5QnVmZmVyIHR5cGUuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbd3JhcF0gVGV4dHVyZSB3cmFwcGluZyBmb3IgYm90aCBTIGFuZCBULiBEZWZhdWx0cyB0byBgZ2wuUkVQRUFUYCBmb3IgMkQgYW5kIGBnbC5DTEFNUF9UT19FREdFYCBmb3IgY3ViZVxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3dyYXBTXSBUZXh0dXJlIHdyYXBwaW5nIGZvciBTLiBEZWZhdWx0cyB0byBgZ2wuUkVQRUFUYCBhbmQgYGdsLkNMQU1QX1RPX0VER0VgIGZvciBjdWJlLiBJZiBzZXQgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGB3cmFwYC5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFt3cmFwVF0gVGV4dHVyZSB3cmFwcGluZyBmb3IgVC4gRGVmYXVsdHMgdG8gYGdsLlJFUEVBVGAgYW5kIGBnbC5DTEFNUF9UT19FREdFYCBmb3IgY3ViZS4gSWYgc2V0IHRha2VzIHByZWNlZGVuY2Ugb3ZlciBgd3JhcGAuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbdW5wYWNrQWxpZ25tZW50XSBUaGUgYGdsLlVOUEFDS19BTElHTk1FTlRgIHVzZWQgd2hlbiB1cGxvYWRpbmcgYW4gYXJyYXkuIERlZmF1bHRzIHRvIDEuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbcHJlbXVsdGlwbHlBbHBoYV0gV2hldGhlciBvciBub3QgdG8gcHJlbXVsdGlwbHkgYWxwaGEuIERlZmF1bHRzIHRvIHdoYXRldmVyIHRoZSBjdXJyZW50IHNldHRpbmcgaXMuXG4gICAqICAgICBUaGlzIGxldHMgeW91IHNldCBpdCBvbmNlIGJlZm9yZSBjYWxsaW5nIGB0d2dsLmNyZWF0ZVRleHR1cmVgIG9yIGB0d2dsLmNyZWF0ZVRleHR1cmVzYCBhbmQgb25seSBvdmVycmlkZVxuICAgKiAgICAgdGhlIGN1cnJlbnQgc2V0dGluZyBmb3Igc3BlY2lmaWMgdGV4dHVyZXMuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbZmxpcFldIFdoZXRoZXIgb3Igbm90IHRvIGZsaXAgdGhlIHRleHR1cmUgdmVydGljYWxseSBvbiB1cGxvYWQuIERlZmF1bHRzIHRvIHdoYXRldmVyIHRoZSBjdXJyZW50IHNldHRpbmcgaXMuXG4gICAqICAgICBUaGlzIGxldHMgeW91IHNldCBpdCBvbmNlIGJlZm9yZSBjYWxsaW5nIGB0d2dsLmNyZWF0ZVRleHR1cmVgIG9yIGB0d2dsLmNyZWF0ZVRleHR1cmVzYCBhbmQgb25seSBvdmVycmlkZVxuICAgKiAgICAgdGhlIGN1cnJlbnQgc2V0dGluZyBmb3Igc3BlY2lmaWMgdGV4dHVyZXMuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbY29sb3JzcGFjZUNvbnZlcnNpb25dIFdoZXRoZXIgb3Igbm90IHRvIGxldCB0aGUgYnJvd3NlciBkbyBjb2xvcnNwYWNlIGNvbnZlcnNpb24gb2YgdGhlIHRleHR1cmUgb24gdXBsb2FkLiBEZWZhdWx0cyB0byB3aGF0ZXZlciB0aGUgY3VycmVudCBzZXR0aW5nIGlzLlxuICAgKiAgICAgVGhpcyBsZXRzIHlvdSBzZXQgaXQgb25jZSBiZWZvcmUgY2FsbGluZyBgdHdnbC5jcmVhdGVUZXh0dXJlYCBvciBgdHdnbC5jcmVhdGVUZXh0dXJlc2AgYW5kIG9ubHkgb3ZlcnJpZGVcbiAgICogICAgIHRoZSBjdXJyZW50IHNldHRpbmcgZm9yIHNwZWNpZmljIHRleHR1cmVzLlxuICAgKiBAcHJvcGVydHkgeyhudW1iZXJbXXxBcnJheUJ1ZmZlcil9IGNvbG9yIGNvbG9yIHVzZWQgYXMgdGVtcG9yYXJ5IDF4MSBwaXhlbCBjb2xvciBmb3IgdGV4dHVyZXMgbG9hZGVkIGFzeW5jIHdoZW4gc3JjIGlzIGEgc3RyaW5nLlxuICAgKiAgICBJZiBpdCdzIGEgSmF2YVNjcmlwdCBhcnJheSBhc3N1bWVzIGNvbG9yIGlzIDAgdG8gMSBsaWtlIG1vc3QgR0wgY29sb3JzIGFzIGluIGBbMSwgMCwgMCwgMV0gPSByZWQ9MSwgZ3JlZW49MCwgYmx1ZT0wLCBhbHBoYT0wYC5cbiAgICogICAgRGVmYXVsdHMgdG8gYFswLjUsIDAuNzUsIDEsIDFdYC4gU2VlIHtAbGluayBtb2R1bGU6dHdnbC5zZXREZWZhdWx0VGV4dHVyZUNvbG9yfS4gSWYgYGZhbHNlYCB0ZXh0dXJlIGlzIHNldC4gQ2FuIGJlIHVzZWQgdG8gcmUtbG9hZCBhIHRleHR1cmVcbiAgICogQHByb3BlcnR5IHtib29sZWFufSBbYXV0b10gSWYgbm90IGBmYWxzZWAgdGhlbiB0ZXh0dXJlIHdvcmtpbmcgZmlsdGVyaW5nIGlzIHNldCBhdXRvbWF0aWNhbGx5IGZvciBub24tcG93ZXIgb2YgMiBpbWFnZXMgYW5kXG4gICAqICAgIG1pcHMgYXJlIGdlbmVyYXRlZCBmb3IgcG93ZXIgb2YgMiBpbWFnZXMuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyW119IFtjdWJlRmFjZU9yZGVyXSBUaGUgb3JkZXIgdGhhdCBjdWJlIGZhY2VzIGFyZSBwdWxsZWQgb3V0IG9mIGFuIGltZyBvciBzZXQgb2YgaW1hZ2VzLiBUaGUgZGVmYXVsdCBpc1xuICAgKlxuICAgKiAgICAgW2dsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCxcbiAgICogICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1gsXG4gICAqICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9ZLFxuICAgKiAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWSxcbiAgICogICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1osXG4gICAqICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9aXVxuICAgKlxuICAgKiBAcHJvcGVydHkgeyhudW1iZXJbXXxBcnJheUJ1ZmZlcnxIVE1MQ2FudmFzRWxlbWVudHxIVE1MSW1hZ2VFbGVtZW50fEhUTUxWaWRlb0VsZW1lbnR8c3RyaW5nfHN0cmluZ1tdfG1vZHVsZTp0d2dsLlRleHR1cmVGdW5jKX0gW3NyY10gc291cmNlIGZvciB0ZXh0dXJlXG4gICAqXG4gICAqICAgIElmIGBzdHJpbmdgIHRoZW4gaXQncyBhc3N1bWVkIHRvIGJlIGEgVVJMIHRvIGFuIGltYWdlLiBUaGUgaW1hZ2Ugd2lsbCBiZSBkb3dubG9hZGVkIGFzeW5jLiBBIHVzYWJsZVxuICAgKiAgICAxeDEgcGl4ZWwgdGV4dHVyZSB3aWxsIGJlIHJldHVybmVkIGltbWVkaWF0bGV5LiBUaGUgdGV4dHVyZSB3aWxsIGJlIHVwZGF0ZWQgb25jZSB0aGUgaW1hZ2UgaGFzIGRvd25sb2FkZWQuXG4gICAqICAgIElmIGB0YXJnZXRgIGlzIGBnbC5URVhUVVJFX0NVQkVfTUFQYCB3aWxsIGF0dGVtcHQgdG8gZGl2aWRlIGltYWdlIGludG8gNiBzcXVhcmUgcGllY2VzLiAxeDYsIDZ4MSwgM3gyLCAyeDMuXG4gICAqICAgIFRoZSBwaWVjZXMgd2lsbCBiZSB1cGxvYWRlZCBpbiBgY3ViZUZhY2VPcmRlcmBcbiAgICpcbiAgICogICAgSWYgYHN0cmluZ1tdYCB0aGVuIGl0IG11c3QgaGF2ZSA2IGVudHJpZXMsIG9uZSBmb3IgZWFjaCBmYWNlIG9mIGEgY3ViZSBtYXAuIFRhcmdldCBtdXN0IGJlIGBnbC5URVhUVVJFX0NVQkVfTUFQYC5cbiAgICpcbiAgICogICAgSWYgYEhUTUxFbGVtZW50YCB0aGVuIGl0IHdpbCBiZSB1c2VkIGltbWVkaWF0ZWx5IHRvIGNyZWF0ZSB0aGUgY29udGVudHMgb2YgdGhlIHRleHR1cmUuIEV4YW1wbGVzIGBIVE1MSW1hZ2VFbGVtZW50YCxcbiAgICogICAgYEhUTUxDYW52YXNFbGVtZW50YCwgYEhUTUxWaWRlb0VsZW1lbnRgLlxuICAgKlxuICAgKiAgICBJZiBgbnVtYmVyW11gIG9yIGBBcnJheUJ1ZmZlcmAgaXQncyBhc3N1bWVkIHRvIGJlIGRhdGEgZm9yIGEgdGV4dHVyZS4gSWYgYHdpZHRoYCBvciBgaGVpZ2h0YCBpc1xuICAgKiAgICBub3Qgc3BlY2lmaWVkIGl0IGlzIGd1ZXNzZWQgYXMgZm9sbG93cy4gRmlyc3QgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpcyBjb21wdXRlZCBieSBgc3JjLmxlbmd0aCAvIG51bUNvbXBvbmV0c2BcbiAgICogICAgd2hlcmUgYG51bUNvbXBvbmVudHNgIGlzIGRlcml2ZWQgZnJvbSBgZm9ybWF0YC4gSWYgYHRhcmdldGAgaXMgYGdsLlRFWFRVUkVfQ1VCRV9NQVBgIHRoZW4gYG51bUVsZW1lbnRzYCBpcyBkaXZpZGVkXG4gICAqICAgIGJ5IDYuIFRoZW5cbiAgICpcbiAgICogICAgKiAgIElmIG5laXRoZXIgYHdpZHRoYCBub3IgYGhlaWdodGAgYXJlIHNwZWNpZmllZCBhbmQgYHNxcnQobnVtRWxlbWVudHMpYCBpcyBhbiBpbnRlZ2VyIHRoZW4gd2lkdGggYW5kIGhlaWdodFxuICAgKiAgICAgICAgYXJlIHNldCB0byBgc3FydChudW1FbGVtZW50cylgLiBPdGhlcndpc2UgYHdpZHRoID0gbnVtRWxlbWVudHNgIGFuZCBgaGVpZ2h0ID0gMWAuXG4gICAqXG4gICAqICAgICogICBJZiBvbmx5IG9uZSBvZiBgd2lkdGhgIG9yIGBoZWlnaHRgIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBvdGhlciBlcXVhbHMgYG51bUVsZW1lbnRzIC8gc3BlY2lmaWVkRGltZW5zaW9uYC5cbiAgICpcbiAgICogSWYgYG51bWJlcltdYCB3aWxsIGJlIGNvbnZlcnRlZCB0byBgdHlwZWAuXG4gICAqXG4gICAqIElmIGBzcmNgIGlzIGEgZnVuY3Rpb24gaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCBhIGBXZWJHTFJlbmRlcmluZ0NvbnRleHRgIGFuZCB0aGVzZSBvcHRpb25zLlxuICAgKiBXaGF0ZXZlciBpdCByZXR1cm5zIGlzIHN1YmplY3QgdG8gdGhlc2UgcnVsZXMuIFNvIGl0IGNhbiByZXR1cm4gYSBzdHJpbmcgdXJsLCBhbiBgSFRNTEVsZW1lbnRgXG4gICAqIGFuIGFycmF5IGV0Yy4uLlxuICAgKlxuICAgKiBJZiBgc3JjYCBpcyB1bmRlZmluZWQgdGhlbiBhbiBlbXB0eSB0ZXh0dXJlIHdpbGwgYmUgY3JlYXRlZCBvZiBzaXplIGB3aWR0aGAgYnkgYGhlaWdodGAuXG4gICAqXG4gICAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBbY3Jvc3NPcmlnaW5dIFdoYXQgdG8gc2V0IHRoZSBjcm9zc09yaWdpbiBwcm9wZXJ0eSBvZiBpbWFnZXMgd2hlbiB0aGV5IGFyZSBkb3dubG9hZGVkLlxuICAgKiAgICBkZWZhdWx0OiB1bmRlZmluZWQuIEFsc28gc2VlIHtAbGluayBtb2R1bGU6dHdnbC5zZXREZWZhdWx0c30uXG4gICAqXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvLyBOT1RFOiBXaGlsZSBxdWVyeWluZyBHTCBpcyBjb25zaWRlcmVkIHNsb3cgaXQncyBub3QgcmVtb3RlbHkgYXMgc2xvd1xuICAvLyBhcyB1cGxvYWRpbmcgYSB0ZXh0dXJlLiBPbiB0b3Agb2YgdGhhdCB5b3UncmUgdW5saWtlbHkgdG8gY2FsbCB0aGlzIGluXG4gIC8vIGEgcGVyZiBjcml0aWNhbCBsb29wLiBFdmVuIGlmIHVwbG9hZCBhIHRleHR1cmUgZXZlcnkgZnJhbWUgdGhhdCdzIHVubGlrZWx5XG4gIC8vIHRvIGJlIG1vcmUgdGhhbiAxIG9yIDIgdGV4dHVyZXMgYSBmcmFtZS4gSW4gb3RoZXIgd29yZHMsIHRoZSBiZW5lZml0cyBvZlxuICAvLyBtYWtpbmcgdGhlIEFQSSBlYXN5IHRvIHVzZSBvdXR3ZWlnaCBhbnkgc3VwcG9zZWQgcGVyZiBiZW5lZml0c1xuICB2YXIgbGFzdFBhY2tTdGF0ZSA9IHt9O1xuXG4gIC8qKlxuICAgKiBTYXZlcyBhbnkgcGFja2luZyBzdGF0ZSB0aGF0IHdpbGwgYmUgc2V0IGJhc2VkIG9uIHRoZSBvcHRpb25zLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBvcHRpb25zIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqL1xuICBmdW5jdGlvbiBzYXZlUGFja1N0YXRlKGdsLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuY29sb3JzcGFjZUNvbnZlcnNpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgbGFzdFBhY2tTdGF0ZS5jb2xvclNwYWNlQ29udmVyc2lvbiA9IGdsLmdldFBhcmFtZXRlcihnbC5VTlBBQ0tfQ09MT1JTUEFDRV9DT05WRVJTSU9OX1dFQkdMKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMucHJlbXVsdGlwbHlBbHBoYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBsYXN0UGFja1N0YXRlLnByZW11bHRpcGx5QWxwaGEgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuZmxpcFkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbGFzdFBhY2tTdGF0ZS5mbGlwWSA9IGdsLmdldFBhcmFtZXRlcihnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZXMgYW55IHBhY2tpbmcgc3RhdGUgdGhhdCB3YXMgc2V0IGJhc2VkIG9uIHRoZSBvcHRpb25zLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBvcHRpb25zIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqL1xuICBmdW5jdGlvbiByZXN0b3JlUGFja1N0YXRlKGdsLCBvcHRpb25zKSB7XG4gICAgaWYgKG9wdGlvbnMuY29sb3JzcGFjZUNvbnZlcnNpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgZ2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0NPTE9SU1BBQ0VfQ09OVkVSU0lPTl9XRUJHTCwgbGFzdFBhY2tTdGF0ZS5jb2xvclNwYWNlQ29udmVyc2lvbik7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLnByZW11bHRpcGx5QWxwaGEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZ2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMLCBsYXN0UGFja1N0YXRlLnByZW11bHRpcGx5QWxwaGEpO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5mbGlwWSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCBsYXN0UGFja1N0YXRlLmZsaXBZKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdGV4dHVyZSBwYXJhbWV0ZXJzIG9mIGEgdGV4dHVyZS5cbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHtXZWJHTFRleHR1cmV9IHRleCB0aGUgV2ViR0xUZXh0dXJlIHRvIHNldCBwYXJhbWV0ZXJzIGZvclxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBvcHRpb25zIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqICAgVGhpcyBpcyBvZnRlbiB0aGUgc2FtZSBvcHRpb25zIHlvdSBwYXNzZWQgaW4gd2hlbiB5b3UgY3JlYXRlZCB0aGUgdGV4dHVyZS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBzZXRUZXh0dXJlUGFyYW1ldGVycyhnbCwgdGV4LCBvcHRpb25zKSB7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQ7XG4gICAgZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXgpO1xuICAgIGlmIChvcHRpb25zLm1pbikge1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaSh0YXJnZXQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgb3B0aW9ucy5taW4pO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy5tYWcpIHtcbiAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX01BR19GSUxURVIsIG9wdGlvbnMubWFnKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMud3JhcCkge1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaSh0YXJnZXQsIGdsLlRFWFRVUkVfV1JBUF9TLCBvcHRpb25zLndyYXApO1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaSh0YXJnZXQsIGdsLlRFWFRVUkVfV1JBUF9ULCBvcHRpb25zLndyYXApO1xuICAgIH1cbiAgICBpZiAob3B0aW9ucy53cmFwUykge1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaSh0YXJnZXQsIGdsLlRFWFRVUkVfV1JBUF9TLCBvcHRpb25zLndyYXBTKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMud3JhcFQpIHtcbiAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfVCwgb3B0aW9ucy53cmFwVCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1ha2VzIGEgMXgxIHBpeGVsXG4gICAqIElmIG5vIGNvbG9yIGlzIHBhc3NlZCBpbiB1c2VzIHRoZSBkZWZhdWx0IGNvbG9yIHdoaWNoIGNhbiBiZSBzZXQgYnkgY2FsbGluZyBgc2V0RGVmYXVsdFRleHR1cmVDb2xvcmAuXG4gICAqIEBwYXJhbSB7KG51bWJlcltdfEFycmF5QnVmZmVyKX0gW2NvbG9yXSBUaGUgY29sb3IgdXNpbmcgMC0xIHZhbHVlc1xuICAgKiBAcmV0dXJuIHtVaW50OEFycmF5fSBVbml0OEFycmF5IHdpdGggY29sb3IuXG4gICAqL1xuICBmdW5jdGlvbiBtYWtlMVBpeGVsKGNvbG9yKSB7XG4gICAgY29sb3IgPSBjb2xvciB8fCBkZWZhdWx0cy50ZXh0dXJlQ29sb3I7XG4gICAgaWYgKGlzQXJyYXlCdWZmZXIoY29sb3IpKSB7XG4gICAgICByZXR1cm4gY29sb3I7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVWludDhBcnJheShbY29sb3JbMF0gKiAyNTUsIGNvbG9yWzFdICogMjU1LCBjb2xvclsyXSAqIDI1NSwgY29sb3JbM10gKiAyNTVdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdmFsdWUgaXMgcG93ZXIgb2YgMlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgbnVtYmVyIHRvIGNoZWNrLlxuICAgKiBAcmV0dXJuIHRydWUgaWYgdmFsdWUgaXMgcG93ZXIgb2YgMlxuICAgKi9cbiAgZnVuY3Rpb24gaXNQb3dlck9mMih2YWx1ZSkge1xuICAgIHJldHVybiAodmFsdWUgJiAodmFsdWUgLSAxKSkgPT09IDA7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBmaWx0ZXJpbmcgb3IgZ2VuZXJhdGVzIG1pcHMgZm9yIHRleHR1cmUgYmFzZWQgb24gd2lkdGggb3IgaGVpZ2h0XG4gICAqIElmIHdpZHRoIG9yIGhlaWdodCBpcyBub3QgcGFzc2VkIGluIHVzZXMgYG9wdGlvbnMud2lkdGhgIGFuZC8vb3IgYG9wdGlvbnMuaGVpZ2h0YFxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4IHRoZSBXZWJHTFRleHR1cmUgdG8gc2V0IHBhcmFtZXRlcnMgZm9yXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IFtvcHRpb25zXSBBIFRleHR1cmVPcHRpb25zIG9iamVjdCB3aXRoIHdoYXRldmVyIHBhcmFtZXRlcnMgeW91IHdhbnQgc2V0LlxuICAgKiAgIFRoaXMgaXMgb2Z0ZW4gdGhlIHNhbWUgb3B0aW9ucyB5b3UgcGFzc2VkIGluIHdoZW4geW91IGNyZWF0ZWQgdGhlIHRleHR1cmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIHdpZHRoIG9mIHRleHR1cmVcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtoZWlnaHRdIGhlaWdodCBvZiB0ZXh0dXJlXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gc2V0VGV4dHVyZUZpbHRlcmluZ0ZvclNpemUoZ2wsIHRleCwgb3B0aW9ucywgd2lkdGgsIGhlaWdodCkge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzLnRleHR1cmVPcHRpb25zO1xuICAgIHZhciB0YXJnZXQgPSBvcHRpb25zLnRhcmdldCB8fCBnbC5URVhUVVJFXzJEO1xuICAgIHdpZHRoID0gd2lkdGggfHwgb3B0aW9ucy53aWR0aDtcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgb3B0aW9ucy5oZWlnaHQ7XG4gICAgZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXgpO1xuICAgIGlmICghaXNQb3dlck9mMih3aWR0aCkgfHwgIWlzUG93ZXJPZjIoaGVpZ2h0KSkge1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaSh0YXJnZXQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTElORUFSKTtcbiAgICAgIGdsLnRleFBhcmFtZXRlcmkodGFyZ2V0LCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnbC5nZW5lcmF0ZU1pcG1hcCh0YXJnZXQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIGFycmF5IG9mIGN1YmVtYXAgZmFjZSBlbnVtc1xuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBvcHRpb25zIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqICAgVGhpcyBpcyBvZnRlbiB0aGUgc2FtZSBvcHRpb25zIHlvdSBwYXNzZWQgaW4gd2hlbiB5b3UgY3JlYXRlZCB0aGUgdGV4dHVyZS5cbiAgICogQHJldHVybiB7bnVtYmVyW119IGN1YmVtYXAgZmFjZSBlbnVtc1xuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Q3ViZUZhY2VPcmRlcihnbCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHJldHVybiBvcHRpb25zLmN1YmVGYWNlT3JkZXIgfHwgW1xuICAgICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1gsXG4gICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWCxcbiAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9ZLFxuICAgICAgICBnbC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1ksXG4gICAgICAgIGdsLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWixcbiAgICAgICAgZ2wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9aLFxuICAgICAgXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBGYWNlSW5mb1xuICAgKiBAcHJvcGVydHkge251bWJlcn0gZmFjZSBnbCBlbnVtIGZvciB0ZXhJbWFnZTJEXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBuZHggZmFjZSBpbmRleCAoMCAtIDUpIGludG8gc291cmNlIGRhdGFcbiAgICovXG5cbiAgLyoqXG4gICAqIEdldHMgYW4gYXJyYXkgb2YgRmFjZUluZm9zXG4gICAqIFRoZXJlJ3MgYSBidWcgaW4gc29tZSBOVmlkaWEgZHJpdmVycyB0aGF0IHdpbGwgY3Jhc2ggdGhlIGRyaXZlciBpZlxuICAgKiBgZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YYCBpcyBub3QgdXBsb2FkZWQgZmlyc3QuIFNvLCB3ZSB0YWtlXG4gICAqIHRoZSB1c2VyJ3MgZGVzaXJlZCBvcmRlciBmcm9tIGhpcyBmYWNlcyB0byBXZWJHTCBhbmQgbWFrZSBzdXJlIHdlXG4gICAqIGRvIHRoZSBmYWNlcyBpbiBXZWJHTCBvcmRlclxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBvcHRpb25zIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqIEByZXR1cm4ge0ZhY2VJbmZvW119IGN1YmVtYXAgZmFjZSBpbmZvcy4gQXJndWFibHkgdGhlIGBmYWNlYCBwcm9wZXJ0eSBvZiBlYWNoIGVsZW1lbnQgaXMgcmVkdW5kZW50IGJ1dFxuICAgKiAgICBpdCdzIG5lZWRlZCBpbnRlcm5hbGx5IHRvIHNvcnQgdGhlIGFycmF5IG9mIGBuZHhgIHByb3BlcnRpZXMgYnkgYGZhY2VgLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0Q3ViZUZhY2VzV2l0aE5keChnbCwgb3B0aW9ucykge1xuICAgIHZhciBmYWNlcyA9IGdldEN1YmVGYWNlT3JkZXIoZ2wsIG9wdGlvbnMpO1xuICAgIC8vIHdvcmsgYXJvdW5kIGJ1ZyBpbiBOVmlkaWEgZHJpdmVycy4gV2UgaGF2ZSB0byB1cGxvYWQgdGhlIGZpcnN0IGZhY2UgZmlyc3QgZWxzZSB0aGUgZHJpdmVyIGNyYXNoZXMgOihcbiAgICB2YXIgZmFjZXNXaXRoTmR4ID0gZmFjZXMubWFwKGZ1bmN0aW9uKGZhY2UsIG5keCkge1xuICAgICAgcmV0dXJuIHsgZmFjZTogZmFjZSwgbmR4OiBuZHggfTtcbiAgICB9KTtcbiAgICBmYWNlc1dpdGhOZHguc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYS5mYWNlIC0gYi5mYWNlO1xuICAgIH0pO1xuICAgIHJldHVybiBmYWNlc1dpdGhOZHg7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGEgdGV4dHVyZSBmcm9tIHRoZSBjb250ZW50cyBvZiBhbiBlbGVtZW50LiBXaWxsIGFsc28gc2V0XG4gICAqIHRleHR1cmUgZmlsdGVyaW5nIG9yIGdlbmVyYXRlIG1pcHMgYmFzZWQgb24gdGhlIGRpbWVuc2lvbnMgb2YgdGhlIGVsZW1lbnRcbiAgICogdW5sZXNzIGBvcHRpb25zLmF1dG8gPT09IGZhbHNlYC4gSWYgYHRhcmdldCA9PT0gZ2wuVEVYVFVSRV9DVUJFX01BUGAgd2lsbFxuICAgKiBhdHRlbXB0IHRvIHNsaWNlIGltYWdlIGludG8gMXg2LCAyeDMsIDN4Miwgb3IgNngxIGltYWdlcywgb25lIGZvciBlYWNoIGZhY2UuXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7V2ViR0xUZXh0dXJlfSB0ZXggdGhlIFdlYkdMVGV4dHVyZSB0byBzZXQgcGFyYW1ldGVycyBmb3JcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudCBhIGNhbnZhcywgaW1nLCBvciB2aWRlbyBlbGVtZW50LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBbb3B0aW9uc10gQSBUZXh0dXJlT3B0aW9ucyBvYmplY3Qgd2l0aCB3aGF0ZXZlciBwYXJhbWV0ZXJzIHlvdSB3YW50IHNldC5cbiAgICogICBUaGlzIGlzIG9mdGVuIHRoZSBzYW1lIG9wdGlvbnMgeW91IHBhc3NlZCBpbiB3aGVuIHlvdSBjcmVhdGVkIHRoZSB0ZXh0dXJlLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICogQGtpbmQgZnVuY3Rpb25cbiAgICovXG4gIHZhciBzZXRUZXh0dXJlRnJvbUVsZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY3R4ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKS5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHNldFRleHR1cmVGcm9tRWxlbWVudChnbCwgdGV4LCBlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cy50ZXh0dXJlT3B0aW9ucztcbiAgICAgIHZhciB0YXJnZXQgPSBvcHRpb25zLnRhcmdldCB8fCBnbC5URVhUVVJFXzJEO1xuICAgICAgdmFyIHdpZHRoID0gZWxlbWVudC53aWR0aDtcbiAgICAgIHZhciBoZWlnaHQgPSBlbGVtZW50LmhlaWdodDtcbiAgICAgIHZhciBmb3JtYXQgPSBvcHRpb25zLmZvcm1hdCB8fCBnbC5SR0JBO1xuICAgICAgdmFyIHR5cGUgPSBvcHRpb25zLnR5cGUgfHwgZ2wuVU5TSUdORURfQllURTtcbiAgICAgIHNhdmVQYWNrU3RhdGUoZ2wsIG9wdGlvbnMpO1xuICAgICAgZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXgpO1xuICAgICAgaWYgKHRhcmdldCA9PT0gZ2wuVEVYVFVSRV9DVUJFX01BUCkge1xuICAgICAgICAvLyBndWVzcyB0aGUgcGFydHNcbiAgICAgICAgdmFyIGltZ1dpZHRoICA9IGVsZW1lbnQud2lkdGg7XG4gICAgICAgIHZhciBpbWdIZWlnaHQgPSBlbGVtZW50LmhlaWdodDtcbiAgICAgICAgdmFyIHNpemU7XG4gICAgICAgIHZhciBzbGljZXM7XG4gICAgICAgIGlmIChpbWdXaWR0aCAvIDYgPT09IGltZ0hlaWdodCkge1xuICAgICAgICAgIC8vIEl0J3MgNngxXG4gICAgICAgICAgc2l6ZSA9IGltZ0hlaWdodDtcbiAgICAgICAgICBzbGljZXMgPSBbMCwgMCwgMSwgMCwgMiwgMCwgMywgMCwgNCwgMCwgNSwgMF07XG4gICAgICAgIH0gZWxzZSBpZiAoaW1nSGVpZ2h0IC8gNiA9PT0gaW1nV2lkdGgpIHtcbiAgICAgICAgICAvLyBJdCdzIDF4NlxuICAgICAgICAgIHNpemUgPSBpbWdXaWR0aDtcbiAgICAgICAgICBzbGljZXMgPSBbMCwgMCwgMCwgMSwgMCwgMiwgMCwgMywgMCwgNCwgMCwgNV07XG4gICAgICAgIH0gZWxzZSBpZiAoaW1nV2lkdGggLyAzID09PSBpbWdIZWlnaHQgLyAyKSB7XG4gICAgICAgICAgLy8gSXQncyAzeDJcbiAgICAgICAgICBzaXplID0gaW1nV2lkdGggLyAzO1xuICAgICAgICAgIHNsaWNlcyA9IFswLCAwLCAxLCAwLCAyLCAwLCAwLCAxLCAxLCAxLCAyLCAxXTtcbiAgICAgICAgfSBlbHNlIGlmIChpbWdXaWR0aCAvIDIgPT09IGltZ0hlaWdodCAvIDMpIHtcbiAgICAgICAgICAvLyBJdCdzIDJ4M1xuICAgICAgICAgIHNpemUgPSBpbWdXaWR0aCAvIDI7XG4gICAgICAgICAgc2xpY2VzID0gWzAsIDAsIDEsIDAsIDAsIDEsIDEsIDEsIDAsIDIsIDEsIDJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IFwiY2FuJ3QgZmlndXJlIG91dCBjdWJlIG1hcCBmcm9tIGVsZW1lbnQ6IFwiICsgKGVsZW1lbnQuc3JjID8gZWxlbWVudC5zcmMgOiBlbGVtZW50Lm5vZGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBjdHguY2FudmFzLndpZHRoID0gc2l6ZTtcbiAgICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSBzaXplO1xuICAgICAgICB3aWR0aCA9IHNpemU7XG4gICAgICAgIGhlaWdodCA9IHNpemU7XG4gICAgICAgIGdldEN1YmVGYWNlc1dpdGhOZHgoZ2wsIG9wdGlvbnMpLmZvckVhY2goZnVuY3Rpb24oZikge1xuICAgICAgICAgIHZhciB4T2Zmc2V0ID0gc2xpY2VzW2YubmR4ICogMiArIDBdICogc2l6ZTtcbiAgICAgICAgICB2YXIgeU9mZnNldCA9IHNsaWNlc1tmLm5keCAqIDIgKyAxXSAqIHNpemU7XG4gICAgICAgICAgY3R4LmRyYXdJbWFnZShlbGVtZW50LCB4T2Zmc2V0LCB5T2Zmc2V0LCBzaXplLCBzaXplLCAwLCAwLCBzaXplLCBzaXplKTtcbiAgICAgICAgICBnbC50ZXhJbWFnZTJEKGYuZmFjZSwgMCwgZm9ybWF0LCBmb3JtYXQsIHR5cGUsIGN0eC5jYW52YXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gRnJlZSB1cCB0aGUgY2FudmFzIG1lbW9yeVxuICAgICAgICBjdHguY2FudmFzLndpZHRoID0gMTtcbiAgICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSAxO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIDAsIGZvcm1hdCwgZm9ybWF0LCB0eXBlLCBlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgIHJlc3RvcmVQYWNrU3RhdGUoZ2wsIG9wdGlvbnMpO1xuICAgICAgaWYgKG9wdGlvbnMuYXV0byAhPT0gZmFsc2UpIHtcbiAgICAgICAgc2V0VGV4dHVyZUZpbHRlcmluZ0ZvclNpemUoZ2wsIHRleCwgb3B0aW9ucywgd2lkdGgsIGhlaWdodCk7XG4gICAgICB9XG4gICAgICBzZXRUZXh0dXJlUGFyYW1ldGVycyhnbCwgdGV4LCBvcHRpb25zKTtcbiAgICB9O1xuICB9KCk7XG5cbiAgZnVuY3Rpb24gbm9vcCgpIHtcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyBhbiBpbWFnZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIHVybCB0byBpbWFnZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKGVyciwgaW1nKX0gW2NhbGxiYWNrXSBhIGNhbGxiYWNrIHRoYXQncyBwYXNzZWQgYW4gZXJyb3IgYW5kIHRoZSBpbWFnZS4gVGhlIGVycm9yIHdpbGwgYmUgbm9uLW51bGxcbiAgICogICAgIGlmIHRoZXJlIHdhcyBhbiBlcnJvclxuICAgKiBAcmV0dXJuIHtIVE1MSW1hZ2VFbGVtZW50fSB0aGUgaW1hZ2UgYmVpbmcgbG9hZGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gbG9hZEltYWdlKHVybCwgY3Jvc3NPcmlnaW4sIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBjcm9zc09yaWdpbiA9IGNyb3NzT3JpZ2luICE9PSB1bmRlZmluZWQgPyBjcm9zc09yaWdpbiA6IGRlZmF1bHRzLmNyb3NzT3JpZ2luO1xuICAgIGlmIChjcm9zc09yaWdpbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpbWcuY3Jvc3NPcmlnaW4gPSBjcm9zc09yaWdpbjtcbiAgICB9XG4gICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBtc2cgPSBcImNvdWxkbid0IGxvYWQgaW1hZ2U6IFwiICsgdXJsO1xuICAgICAgZXJyb3IobXNnKTtcbiAgICAgIGNhbGxiYWNrKG1zZywgaW1nKTtcbiAgICB9O1xuICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGltZyk7XG4gICAgfTtcbiAgICBpbWcuc3JjID0gdXJsO1xuICAgIHJldHVybiBpbWc7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIHRleHR1cmUgdG8gYSAxeDEgcGl4ZWwgY29sb3IuIElmIGBvcHRpb25zLmNvbG9yID09PSBmYWxzZWAgaXMgbm90aGluZyBoYXBwZW5zLiBJZiBpdCdzIG5vdCBzZXRcbiAgICogdGhlIGRlZmF1bHQgdGV4dHVyZSBjb2xvciBpcyB1c2VkIHdoaWNoIGNhbiBiZSBzZXQgYnkgY2FsbGluZyBgc2V0RGVmYXVsdFRleHR1cmVDb2xvcmAuXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7V2ViR0xUZXh0dXJlfSB0ZXggdGhlIFdlYkdMVGV4dHVyZSB0byBzZXQgcGFyYW1ldGVycyBmb3JcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30gW29wdGlvbnNdIEEgVGV4dHVyZU9wdGlvbnMgb2JqZWN0IHdpdGggd2hhdGV2ZXIgcGFyYW1ldGVycyB5b3Ugd2FudCBzZXQuXG4gICAqICAgVGhpcyBpcyBvZnRlbiB0aGUgc2FtZSBvcHRpb25zIHlvdSBwYXNzZWQgaW4gd2hlbiB5b3UgY3JlYXRlZCB0aGUgdGV4dHVyZS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBzZXRUZXh0dXJlVG8xUGl4ZWxDb2xvcihnbCwgdGV4LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHMudGV4dHVyZU9wdGlvbnM7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQ7XG4gICAgZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXgpO1xuICAgIGlmIChvcHRpb25zLmNvbG9yID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBBc3N1bWUgaXQncyBhIFVSTFxuICAgIC8vIFB1dCAxeDEgcGl4ZWxzIGluIHRleHR1cmUuIFRoYXQgbWFrZXMgaXQgcmVuZGVyYWJsZSBpbW1lZGlhdGVseSByZWdhcmRsZXNzIG9mIGZpbHRlcmluZy5cbiAgICB2YXIgY29sb3IgPSBtYWtlMVBpeGVsKG9wdGlvbnMuY29sb3IpO1xuICAgIGlmICh0YXJnZXQgPT09IGdsLlRFWFRVUkVfQ1VCRV9NQVApIHtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCA2OyArK2lpKSB7XG4gICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgaWksIDAsIGdsLlJHQkEsIDEsIDEsIDAsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGNvbG9yKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZ2wudGV4SW1hZ2UyRCh0YXJnZXQsIDAsIGdsLlJHQkEsIDEsIDEsIDAsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGNvbG9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhlIHNyYyBpbWFnZShzKSB1c2VkIHRvIGNyZWF0ZSBhIHRleHR1cmUuXG4gICAqXG4gICAqIFdoZW4geW91IGNhbGwge0BsaW5rIG1vZHVsZTp0d2dsLmNyZWF0ZVRleHR1cmV9IG9yIHtAbGluayBtb2R1bGU6dHdnbC5jcmVhdGVUZXh0dXJlc31cbiAgICogeW91IGNhbiBwYXNzIGluIHVybHMgZm9yIGltYWdlcyB0byBsb2FkIGludG8gdGhlIHRleHR1cmVzLiBJZiBpdCdzIGEgc2luZ2xlIHVybFxuICAgKiB0aGVuIHRoaXMgd2lsbCBiZSBhIHNpbmdsZSBIVE1MSW1hZ2VFbGVtZW50LiBJZiBpdCdzIGFuIGFycmF5IG9mIHVybHMgdXNlZCBmb3IgYSBjdWJlbWFwXG4gICAqIHRoaXMgd2lsbCBiZSBhIGNvcnJlc3BvbmRpbmcgYXJyYXkgb2YgaW1hZ2VzIGZvciB0aGUgY3ViZW1hcC5cbiAgICpcbiAgICogQHR5cGVkZWYge0hUTUxJbWFnZUVsZW1lbnR8SFRNTEltYWdlRWxlbWVudFtdfSBUZXh0dXJlU3JjXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogQSBjYWxsYmFjayBmb3Igd2hlbiBhbiBpbWFnZSBmaW5pc2hlZCBkb3dubG9hZGluZyBhbmQgYmVlbiB1cGxvYWRlZCBpbnRvIGEgdGV4dHVyZVxuICAgKiBAY2FsbGJhY2sgVGV4dHVyZVJlYWR5Q2FsbGJhY2tcbiAgICogQHBhcmFtIHsqfSBlcnIgSWYgdHJ1dGh5IHRoZXJlIHdhcyBhbiBlcnJvci5cbiAgICogQHBhcmFtIHtXZWJHTFRleHR1cmV9IHRleHR1cmUgdGhlIHRleHR1cmUuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZVNyY30gc291Y2UgaW1hZ2UocykgdXNlZCB0byBhcyB0aGUgc3JjIGZvciB0aGUgdGV4dHVyZVxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cbiAgLyoqXG4gICAqIEEgY2FsbGJhY2sgZm9yIHdoZW4gYWxsIGltYWdlcyBoYXZlIGZpbmlzaGVkIGRvd25sb2FkaW5nIGFuZCBiZWVuIHVwbG9hZGVkIGludG8gdGhlaXIgcmVzcGVjdGl2ZSB0ZXh0dXJlc1xuICAgKiBAY2FsbGJhY2sgVGV4dHVyZXNSZWFkeUNhbGxiYWNrXG4gICAqIEBwYXJhbSB7Kn0gZXJyIElmIHRydXRoeSB0aGVyZSB3YXMgYW4gZXJyb3IuXG4gICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIFdlYkdMVGV4dHVyZT59IHRleHR1cmVzIHRoZSBjcmVhdGVkIHRleHR1cmVzIGJ5IG5hbWUuIFNhbWUgYXMgcmV0dXJuZWQgYnkge0BsaW5rIG1vZHVsZTp0d2dsLmNyZWF0ZVRleHR1cmVzfS5cbiAgICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgbW9kdWxlOnR3Z2wuVGV4dHVyZVNyYz59IHNvdXJjZXMgdGhlIGltYWdlKHMpIHVzZWQgZm9yIHRoZSB0ZXh0dXJlIGJ5IG5hbWUuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogQSBjYWxsYmFjayBmb3Igd2hlbiBhbiBpbWFnZSBmaW5pc2hlZCBkb3dubG9hZGluZyBhbmQgYmVlbiB1cGxvYWRlZCBpbnRvIGEgdGV4dHVyZVxuICAgKiBAY2FsbGJhY2sgQ3ViZW1hcFJlYWR5Q2FsbGJhY2tcbiAgICogQHBhcmFtIHsqfSBlcnIgSWYgdHJ1dGh5IHRoZXJlIHdhcyBhbiBlcnJvci5cbiAgICogQHBhcmFtIHtXZWJHTFRleHR1cmV9IHRleCB0aGUgdGV4dHVyZS5cbiAgICogQHBhcmFtIHtIVE1MSW1hZ2VFbGVtZW50W119IGltZ3MgdGhlIGltYWdlcyBmb3IgZWFjaCBmYWNlLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cbiAgLyoqXG4gICAqIExvYWRzIGEgdGV4dHVyZSBmcm9tIGFuIGltYWdlIGZyb20gYSBVcmwgYXMgc3BlY2lmaWVkIGluIGBvcHRpb25zLnNyY2BcbiAgICogSWYgYG9wdGlvbnMuY29sb3IgIT09IGZhbHNlYCB3aWxsIHNldCB0aGUgdGV4dHVyZSB0byBhIDF4MSBwaXhlbCBjb2xvciBzbyB0aGF0IHRoZSB0ZXh0dXJlIGlzXG4gICAqIGltbWVkaWF0ZWx5IHVzZWFibGUuIEl0IHdpbGwgYmUgdXBkYXRlZCB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgaW1hZ2Ugb25jZSB0aGUgaW1hZ2UgaGFzIGZpbmlzaGVkXG4gICAqIGRvd25sb2FkaW5nLiBGaWx0ZXJpbmcgb3B0aW9ucyB3aWxsIGJlIHNldCBhcyBhcHByb3JpYXRlIGZvciBpbWFnZSB1bmxlc3MgYG9wdGlvbnMuYXV0byA9PT0gZmFsc2VgLlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4IHRoZSBXZWJHTFRleHR1cmUgdG8gc2V0IHBhcmFtZXRlcnMgZm9yXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IFtvcHRpb25zXSBBIFRleHR1cmVPcHRpb25zIG9iamVjdCB3aXRoIHdoYXRldmVyIHBhcmFtZXRlcnMgeW91IHdhbnQgc2V0LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVSZWFkeUNhbGxiYWNrfSBbY2FsbGJhY2tdIEEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhlIGltYWdlIGhhcyBmaW5pc2hlZCBsb2FkaW5nLiBlcnIgd2lsbFxuICAgKiAgICBiZSBub24gbnVsbCBpZiB0aGVyZSB3YXMgYW4gZXJyb3IuXG4gICAqIEByZXR1cm4ge0hUTUxJbWFnZUVsZW1lbnR9IHRoZSBpbWFnZSBiZWluZyBkb3dubG9hZGVkLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGxvYWRUZXh0dXJlRnJvbVVybChnbCwgdGV4LCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cy50ZXh0dXJlT3B0aW9ucztcbiAgICBzZXRUZXh0dXJlVG8xUGl4ZWxDb2xvcihnbCwgdGV4LCBvcHRpb25zKTtcbiAgICAvLyBCZWNhdXNlIGl0J3MgYXN5bmMgd2UgbmVlZCB0byBjb3B5IHRoZSBvcHRpb25zLlxuICAgIG9wdGlvbnMgPSB1dGlscy5zaGFsbG93Q29weShvcHRpb25zKTtcbiAgICB2YXIgaW1nID0gbG9hZEltYWdlKG9wdGlvbnMuc3JjLCBvcHRpb25zLmNyb3NzT3JpZ2luLCBmdW5jdGlvbihlcnIsIGltZykge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBjYWxsYmFjayhlcnIsIHRleCwgaW1nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFRleHR1cmVGcm9tRWxlbWVudChnbCwgdGV4LCBpbWcsIG9wdGlvbnMpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCB0ZXgsIGltZyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGltZztcbiAgfVxuXG4gIC8qKlxuICAgKiBMb2FkcyBhIGN1YmVtYXAgZnJvbSA2IHVybHMgYXMgc3BlY2lmaWVkIGluIGBvcHRpb25zLnNyY2AuIFdpbGwgc2V0IHRoZSBjdWJlbWFwIHRvIGEgMXgxIHBpeGVsIGNvbG9yXG4gICAqIHNvIHRoYXQgaXQgaXMgdXNhYmxlIGltbWVkaWF0ZWx5IHVubGVzcyBgb3B0aW9uLmNvbG9yID09PSBmYWxzZWAuXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7V2ViR0xUZXh0dXJlfSB0ZXggdGhlIFdlYkdMVGV4dHVyZSB0byBzZXQgcGFyYW1ldGVycyBmb3JcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30gb3B0aW9ucyBBIFRleHR1cmVPcHRpb25zIG9iamVjdCB3aXRoIHdoYXRldmVyIHBhcmFtZXRlcnMgeW91IHdhbnQgc2V0LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkN1YmVtYXBSZWFkeUNhbGxiYWNrfSBbY2FsbGJhY2tdIEEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gYWxsIHRoZSBpbWFnZXMgaGF2ZSBmaW5pc2hlZCBsb2FkaW5nLiBlcnIgd2lsbFxuICAgKiAgICBiZSBub24gbnVsbCBpZiB0aGVyZSB3YXMgYW4gZXJyb3IuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gbG9hZEN1YmVtYXBGcm9tVXJscyhnbCwgdGV4LCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICB2YXIgdXJscyA9IG9wdGlvbnMuc3JjO1xuICAgIGlmICh1cmxzLmxlbmd0aCAhPT0gNikge1xuICAgICAgdGhyb3cgXCJ0aGVyZSBtdXN0IGJlIDYgdXJscyBmb3IgYSBjdWJlbWFwXCI7XG4gICAgfVxuICAgIHZhciBmb3JtYXQgPSBvcHRpb25zLmZvcm1hdCB8fCBnbC5SR0JBO1xuICAgIHZhciB0eXBlID0gb3B0aW9ucy50eXBlIHx8IGdsLlVOU0lHTkVEX0JZVEU7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQ7XG4gICAgaWYgKHRhcmdldCAhPT0gZ2wuVEVYVFVSRV9DVUJFX01BUCkge1xuICAgICAgdGhyb3cgXCJ0YXJnZXQgbXVzdCBiZSBURVhUVVJFX0NVQkVfTUFQXCI7XG4gICAgfVxuICAgIHNldFRleHR1cmVUbzFQaXhlbENvbG9yKGdsLCB0ZXgsIG9wdGlvbnMpO1xuICAgIC8vIEJlY2F1c2UgaXQncyBhc3luYyB3ZSBuZWVkIHRvIGNvcHkgdGhlIG9wdGlvbnMuXG4gICAgb3B0aW9ucyA9IHV0aWxzLnNoYWxsb3dDb3B5KG9wdGlvbnMpO1xuICAgIHZhciBudW1Ub0xvYWQgPSA2O1xuICAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICB2YXIgaW1ncztcbiAgICB2YXIgZmFjZXMgPSBnZXRDdWJlRmFjZU9yZGVyKGdsLCBvcHRpb25zKTtcblxuICAgIGZ1bmN0aW9uIHVwbG9hZEltZyhmYWNlVGFyZ2V0KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZXJyLCBpbWcpIHtcbiAgICAgICAgLS1udW1Ub0xvYWQ7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBlcnJvcnMucHVzaChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChpbWcud2lkdGggIT09IGltZy5oZWlnaHQpIHtcbiAgICAgICAgICAgIGVycm9ycy5wdXNoKFwiY3ViZW1hcCBmYWNlIGltZyBpcyBub3QgYSBzcXVhcmU6IFwiICsgaW1nLnNyYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNhdmVQYWNrU3RhdGUoZ2wsIG9wdGlvbnMpO1xuICAgICAgICAgICAgZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXgpO1xuXG4gICAgICAgICAgICAvLyBTbyBhc3N1bWluZyB0aGlzIGlzIHRoZSBmaXJzdCBpbWFnZSB3ZSBub3cgaGF2ZSBvbmUgZmFjZSB0aGF0J3MgaW1nIHNpemVkXG4gICAgICAgICAgICAvLyBhbmQgNSBmYWNlcyB0aGF0IGFyZSAxeDEgcGl4ZWwgc28gc2l6ZSB0aGUgb3RoZXIgZmFjZXNcbiAgICAgICAgICAgIGlmIChudW1Ub0xvYWQgPT09IDUpIHtcbiAgICAgICAgICAgICAgLy8gdXNlIHRoZSBkZWZhdWx0IG9yZGVyXG4gICAgICAgICAgICAgIGdldEN1YmVGYWNlT3JkZXIoZ2wpLmZvckVhY2goZnVuY3Rpb24ob3RoZXJUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICAvLyBTaG91bGQgd2UgcmUtdXNlIHRoZSBzYW1lIGZhY2Ugb3IgYSBjb2xvcj9cbiAgICAgICAgICAgICAgICBnbC50ZXhJbWFnZTJEKG90aGVyVGFyZ2V0LCAwLCBmb3JtYXQsIGZvcm1hdCwgdHlwZSwgaW1nKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBnbC50ZXhJbWFnZTJEKGZhY2VUYXJnZXQsIDAsIGZvcm1hdCwgZm9ybWF0LCB0eXBlLCBpbWcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN0b3JlUGFja1N0YXRlKGdsLCBvcHRpb25zKTtcbiAgICAgICAgICAgIGdsLmdlbmVyYXRlTWlwbWFwKHRhcmdldCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bVRvTG9hZCA9PT0gMCkge1xuICAgICAgICAgIGNhbGxiYWNrKGVycm9ycy5sZW5ndGggPyBlcnJvcnMgOiB1bmRlZmluZWQsIGltZ3MsIHRleCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgaW1ncyA9IHVybHMubWFwKGZ1bmN0aW9uKHVybCwgbmR4KSB7XG4gICAgICByZXR1cm4gbG9hZEltYWdlKHVybCwgb3B0aW9ucy5jcm9zc09yaWdpbiwgdXBsb2FkSW1nKGZhY2VzW25keF0pKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgY29tcG9udGVudHMgZm9yIGEgZ2l2ZW4gaW1hZ2UgZm9ybWF0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gZm9ybWF0IHRoZSBmb3JtYXQuXG4gICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBjb21wb25lbnRzIGZvciB0aGUgZm9ybWF0LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGdldE51bUNvbXBvbmVudHNGb3JGb3JtYXQoZm9ybWF0KSB7XG4gICAgc3dpdGNoIChmb3JtYXQpIHtcbiAgICAgIGNhc2UgQUxQSEE6XG4gICAgICBjYXNlIExVTUlOQU5DRTpcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgICBjYXNlIExVTUlOQU5DRV9BTFBIQTpcbiAgICAgICAgcmV0dXJuIDI7XG4gICAgICBjYXNlIFJHQjpcbiAgICAgICAgcmV0dXJuIDM7XG4gICAgICBjYXNlIFJHQkE6XG4gICAgICAgIHJldHVybiA0O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgXCJ1bmtub3duIHR5cGU6IFwiICsgZm9ybWF0O1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB0ZXh0dXJlIHR5cGUgZm9yIGEgZ2l2ZW4gYXJyYXkgdHlwZS5cbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgZ2wgdGV4dHVyZSB0eXBlXG4gICAqL1xuICBmdW5jdGlvbiBnZXRUZXh0dXJlVHlwZUZvckFycmF5VHlwZShnbCwgc3JjKSB7XG4gICAgaWYgKGlzQXJyYXlCdWZmZXIoc3JjKSkge1xuICAgICAgcmV0dXJuIHR5cGVkQXJyYXlzLmdldEdMVHlwZUZvclR5cGVkQXJyYXkoc3JjKTtcbiAgICB9XG4gICAgcmV0dXJuIGdsLlVOU0lHTkVEX0JZVEU7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIHRleHR1cmUgZnJvbSBhbiBhcnJheSBvciB0eXBlZCBhcnJheS4gSWYgdGhlIHdpZHRoIG9yIGhlaWdodCBpcyBub3QgcHJvdmlkZWQgd2lsbCBhdHRlbXB0IHRvXG4gICAqIGd1ZXNzIHRoZSBzaXplLiBTZWUge0BsaW5rIG1vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfS5cbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHtXZWJHTFRleHR1cmV9IHRleCB0aGUgV2ViR0xUZXh0dXJlIHRvIHNldCBwYXJhbWV0ZXJzIGZvclxuICAgKiBAcGFyYW0geyhudW1iZXJbXXxBcnJheUJ1ZmZlcil9IHNyYyBBbiBhcnJheSBvciB0eXBlZCBhcnJ5IHdpdGggdGV4dHVyZSBkYXRhLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfSBbb3B0aW9uc10gQSBUZXh0dXJlT3B0aW9ucyBvYmplY3Qgd2l0aCB3aGF0ZXZlciBwYXJhbWV0ZXJzIHlvdSB3YW50IHNldC5cbiAgICogICBUaGlzIGlzIG9mdGVuIHRoZSBzYW1lIG9wdGlvbnMgeW91IHBhc3NlZCBpbiB3aGVuIHlvdSBjcmVhdGVkIHRoZSB0ZXh0dXJlLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIHNldFRleHR1cmVGcm9tQXJyYXkoZ2wsIHRleCwgc3JjLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHMudGV4dHVyZU9wdGlvbnM7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQ7XG4gICAgZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXgpO1xuICAgIHZhciB3aWR0aCA9IG9wdGlvbnMud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0O1xuICAgIHZhciBmb3JtYXQgPSBvcHRpb25zLmZvcm1hdCB8fCBnbC5SR0JBO1xuICAgIHZhciB0eXBlID0gb3B0aW9ucy50eXBlIHx8IGdldFRleHR1cmVUeXBlRm9yQXJyYXlUeXBlKGdsLCBzcmMpO1xuICAgIHZhciBudW1Db21wb25lbnRzID0gZ2V0TnVtQ29tcG9uZW50c0ZvckZvcm1hdChmb3JtYXQpO1xuICAgIHZhciBudW1FbGVtZW50cyA9IHNyYy5sZW5ndGggLyBudW1Db21wb25lbnRzO1xuICAgIGlmIChudW1FbGVtZW50cyAlIDEpIHtcbiAgICAgIHRocm93IFwibGVuZ3RoIHdyb25nIHNpemUgZm9yIGZvcm1hdDogXCIgKyBnbEVudW1Ub1N0cmluZyhnbCwgZm9ybWF0KTtcbiAgICB9XG4gICAgaWYgKCF3aWR0aCAmJiAhaGVpZ2h0KSB7XG4gICAgICB2YXIgc2l6ZSA9IE1hdGguc3FydChudW1FbGVtZW50cyAvICh0YXJnZXQgPT09IGdsLlRFWFRVUkVfQ1VCRV9NQVAgPyA2IDogMSkpO1xuICAgICAgaWYgKHNpemUgJSAxID09PSAwKSB7XG4gICAgICAgIHdpZHRoID0gc2l6ZTtcbiAgICAgICAgaGVpZ2h0ID0gc2l6ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpZHRoID0gbnVtRWxlbWVudHM7XG4gICAgICAgIGhlaWdodCA9IDE7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghaGVpZ2h0KSB7XG4gICAgICBoZWlnaHQgPSBudW1FbGVtZW50cyAvIHdpZHRoO1xuICAgICAgaWYgKGhlaWdodCAlIDEpIHtcbiAgICAgICAgdGhyb3cgXCJjYW4ndCBndWVzcyBoZWlnaHRcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCF3aWR0aCkge1xuICAgICAgd2lkdGggPSBudW1FbGVtZW50cyAvIGhlaWdodDtcbiAgICAgIGlmICh3aWR0aCAlIDEpIHtcbiAgICAgICAgdGhyb3cgXCJjYW4ndCBndWVzcyB3aWR0aFwiO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWlzQXJyYXlCdWZmZXIoc3JjKSkge1xuICAgICAgdmFyIFR5cGUgPSB0eXBlZEFycmF5cy5nZXRUeXBlZEFycmF5VHlwZUZvckdMVHlwZSh0eXBlKTtcbiAgICAgIHNyYyA9IG5ldyBUeXBlKHNyYyk7XG4gICAgfVxuICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19BTElHTk1FTlQsIG9wdGlvbnMudW5wYWNrQWxpZ25tZW50IHx8IDEpO1xuICAgIHNhdmVQYWNrU3RhdGUoZ2wsIG9wdGlvbnMpO1xuICAgIGlmICh0YXJnZXQgPT09IGdsLlRFWFRVUkVfQ1VCRV9NQVApIHtcbiAgICAgIHZhciBmYWNlU2l6ZSA9IG51bUVsZW1lbnRzIC8gNiAqIG51bUNvbXBvbmVudHM7XG4gICAgICBnZXRDdWJlRmFjZXNXaXRoTmR4KGdsLCBvcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgdmFyIG9mZnNldCA9IGZhY2VTaXplICogZi5uZHg7XG4gICAgICAgIHZhciBkYXRhID0gc3JjLnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgZmFjZVNpemUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGYuZmFjZSwgMCwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCAwLCBmb3JtYXQsIHR5cGUsIGRhdGEpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdsLnRleEltYWdlMkQodGFyZ2V0LCAwLCBmb3JtYXQsIHdpZHRoLCBoZWlnaHQsIDAsIGZvcm1hdCwgdHlwZSwgc3JjKTtcbiAgICB9XG4gICAgcmVzdG9yZVBhY2tTdGF0ZShnbCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIHRleHR1cmUgd2l0aCBubyBjb250ZW50cyBvZiBhIGNlcnRhaW4gc2l6ZS4gSW4gb3RoZXIgd29yZHMgY2FsbHMgYGdsLnRleEltYWdlMkRgIHdpdGggYG51bGxgLlxuICAgKiBZb3UgbXVzdCBzZXQgYG9wdGlvbnMud2lkdGhgIGFuZCBgb3B0aW9ucy5oZWlnaHRgLlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge1dlYkdMVGV4dHVyZX0gdGV4IHRoZSBXZWJHTFRleHR1cmUgdG8gc2V0IHBhcmFtZXRlcnMgZm9yXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IG9wdGlvbnMgQSBUZXh0dXJlT3B0aW9ucyBvYmplY3Qgd2l0aCB3aGF0ZXZlciBwYXJhbWV0ZXJzIHlvdSB3YW50IHNldC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBzZXRFbXB0eVRleHR1cmUoZ2wsIHRleCwgb3B0aW9ucykge1xuICAgIHZhciB0YXJnZXQgPSBvcHRpb25zLnRhcmdldCB8fCBnbC5URVhUVVJFXzJEO1xuICAgIGdsLmJpbmRUZXh0dXJlKHRhcmdldCwgdGV4KTtcbiAgICB2YXIgZm9ybWF0ID0gb3B0aW9ucy5mb3JtYXQgfHwgZ2wuUkdCQTtcbiAgICB2YXIgdHlwZSA9IG9wdGlvbnMudHlwZSB8fCBnbC5VTlNJR05FRF9CWVRFO1xuICAgIHNhdmVQYWNrU3RhdGUoZ2wsIG9wdGlvbnMpO1xuICAgIGlmICh0YXJnZXQgPT09IGdsLlRFWFRVUkVfQ1VCRV9NQVApIHtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCA2OyArK2lpKSB7XG4gICAgICAgIGdsLnRleEltYWdlMkQoZ2wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YICsgaWksIDAsIGZvcm1hdCwgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQsIDAsIGZvcm1hdCwgdHlwZSwgbnVsbCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGdsLnRleEltYWdlMkQodGFyZ2V0LCAwLCBmb3JtYXQsIG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0LCAwLCBmb3JtYXQsIHR5cGUsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdGV4dHVyZSBiYXNlZCBvbiB0aGUgb3B0aW9ucyBwYXNzZWQgaW4uXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9IFtvcHRpb25zXSBBIFRleHR1cmVPcHRpb25zIG9iamVjdCB3aXRoIHdoYXRldmVyIHBhcmFtZXRlcnMgeW91IHdhbnQgc2V0LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLlRleHR1cmVSZWFkeUNhbGxiYWNrfSBbY2FsbGJhY2tdIEEgY2FsbGJhY2sgY2FsbGVkIHdoZW4gYW4gaW1hZ2UgaGFzIGJlZW4gZG93bmxvYWRlZCBhbmQgdXBsb2FkZWQgdG8gdGhlIHRleHR1cmUuXG4gICAqIEByZXR1cm4ge1dlYkdMVGV4dHVyZX0gdGhlIGNyZWF0ZWQgdGV4dHVyZS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVUZXh0dXJlKGdsLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cy50ZXh0dXJlT3B0aW9ucztcbiAgICB2YXIgdGV4ID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgIHZhciB0YXJnZXQgPSBvcHRpb25zLnRhcmdldCB8fCBnbC5URVhUVVJFXzJEO1xuICAgIHZhciB3aWR0aCAgPSBvcHRpb25zLndpZHRoICB8fCAxO1xuICAgIHZhciBoZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCAxO1xuICAgIGdsLmJpbmRUZXh0dXJlKHRhcmdldCwgdGV4KTtcbiAgICBpZiAodGFyZ2V0ID09PSBnbC5URVhUVVJFX0NVQkVfTUFQKSB7XG4gICAgICAvLyB0aGlzIHNob3VsZCBoYXZlIGJlZW4gdGhlIGRlZmF1bHQgZm9yIENVQkVNQVBTIDooXG4gICAgICBnbC50ZXhQYXJhbWV0ZXJpKHRhcmdldCwgZ2wuVEVYVFVSRV9XUkFQX1MsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgZ2wudGV4UGFyYW1ldGVyaSh0YXJnZXQsIGdsLlRFWFRVUkVfV1JBUF9ULCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICB9XG4gICAgdmFyIHNyYyA9IG9wdGlvbnMuc3JjO1xuICAgIGlmIChzcmMpIHtcbiAgICAgIGlmICh0eXBlb2Ygc3JjID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgc3JjID0gc3JjKGdsLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgKHNyYykgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgbG9hZFRleHR1cmVGcm9tVXJsKGdsLCB0ZXgsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNBcnJheUJ1ZmZlcihzcmMpIHx8XG4gICAgICAgICAgICAgICAgIChBcnJheS5pc0FycmF5KHNyYykgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBzcmNbMF0gPT09ICdudW1iZXInIHx8XG4gICAgICAgICAgICAgICAgICAgICAgQXJyYXkuaXNBcnJheShzcmNbMF0pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgaXNBcnJheUJ1ZmZlcihzcmNbMF0pKVxuICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgIHZhciBkaW1lbnNpb25zID0gc2V0VGV4dHVyZUZyb21BcnJheShnbCwgdGV4LCBzcmMsIG9wdGlvbnMpO1xuICAgICAgICB3aWR0aCAgPSBkaW1lbnNpb25zLndpZHRoO1xuICAgICAgICBoZWlnaHQgPSBkaW1lbnNpb25zLmhlaWdodDtcbiAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzcmMpICYmIHR5cGVvZiAoc3JjWzBdKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbG9hZEN1YmVtYXBGcm9tVXJscyhnbCwgdGV4LCBvcHRpb25zLCBjYWxsYmFjayk7XG4gICAgICB9IGVsc2UgaWYgKHNyYyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHNldFRleHR1cmVGcm9tRWxlbWVudChnbCwgdGV4LCBzcmMsIG9wdGlvbnMpO1xuICAgICAgICB3aWR0aCAgPSBzcmMud2lkdGg7XG4gICAgICAgIGhlaWdodCA9IHNyYy5oZWlnaHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBcInVuc3VwcG9ydGVkIHNyYyB0eXBlXCI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldEVtcHR5VGV4dHVyZShnbCwgdGV4LCBvcHRpb25zKTtcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuYXV0byAhPT0gZmFsc2UpIHtcbiAgICAgIHNldFRleHR1cmVGaWx0ZXJpbmdGb3JTaXplKGdsLCB0ZXgsIG9wdGlvbnMsIHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cbiAgICBzZXRUZXh0dXJlUGFyYW1ldGVycyhnbCwgdGV4LCBvcHRpb25zKTtcbiAgICByZXR1cm4gdGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZXMgYSB0ZXh0dXJlIGJhc2VkIG9uIHRoZSBvcHRpb25zIHBhc3NlZCBpbi5cbiAgICpcbiAgICogTm90ZTogVGhpcyBpcyBub3QgYSBnZW5lcmljIHJlc2l6ZSBhbnl0aGluZyBmdW5jdGlvbi5cbiAgICogSXQncyBtb3N0bHkgdXNlZCBieSB7QGxpbmsgbW9kdWxlOnR3Z2wucmVzaXplRnJhbWVidWZmZXJJbmZvfVxuICAgKiBJdCB3aWxsIHVzZSBgb3B0aW9ucy5zcmNgIGlmIGl0IGV4aXN0cyB0byB0cnkgdG8gZGV0ZXJtaW5lIGEgYHR5cGVgXG4gICAqIG90aGVyd2lzZSBpdCB3aWxsIGFzc3VtZSBgZ2wuVU5TSUdORURfQllURWAuIE5vIGRhdGEgaXMgcHJvdmlkZWRcbiAgICogZm9yIHRoZSB0ZXh0dXJlLiBUZXh0dXJlIHBhcmFtZXRlcnMgd2lsbCBiZSBzZXQgYWNjb3JkaW5nbHlcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHtXZWJHTFRleHR1cmV9IHRleCB0aGUgdGV4dHVyZSB0byByZXNpemVcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30gb3B0aW9ucyBBIFRleHR1cmVPcHRpb25zIG9iamVjdCB3aXRoIHdoYXRldmVyIHBhcmFtZXRlcnMgeW91IHdhbnQgc2V0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoXSB0aGUgbmV3IHdpZHRoLiBJZiBub3QgcGFzc2VkIGluIHdpbGwgdXNlIGBvcHRpb25zLndpZHRoYFxuICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodF0gdGhlIG5ldyBoZWlnaHQuIElmIG5vdCBwYXNzZWQgaW4gd2lsbCB1c2UgYG9wdGlvbnMuaGVpZ2h0YFxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIHJlc2l6ZVRleHR1cmUoZ2wsIHRleCwgb3B0aW9ucywgd2lkdGgsIGhlaWdodCkge1xuICAgIHdpZHRoID0gd2lkdGggfHwgb3B0aW9ucy53aWR0aDtcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgb3B0aW9ucy5oZWlnaHQ7XG4gICAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQ7XG4gICAgZ2wuYmluZFRleHR1cmUodGFyZ2V0LCB0ZXgpO1xuICAgIHZhciBmb3JtYXQgPSBvcHRpb25zLmZvcm1hdCB8fCBnbC5SR0JBO1xuICAgIHZhciB0eXBlO1xuICAgIHZhciBzcmMgPSBvcHRpb25zLnNyYztcbiAgICBpZiAoIXNyYykge1xuICAgICAgdHlwZSA9IG9wdGlvbnMudHlwZSB8fCBnbC5VTlNJR05FRF9CWVRFO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheUJ1ZmZlcihzcmMpIHx8IChBcnJheS5pc0FycmF5KHNyYykgJiYgdHlwZW9mIChzcmNbMF0pID09PSAnbnVtYmVyJykpIHtcbiAgICAgIHR5cGUgPSBvcHRpb25zLnR5cGUgfHwgZ2V0VGV4dHVyZVR5cGVGb3JBcnJheVR5cGUoZ2wsIHNyYyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHR5cGUgPSBvcHRpb25zLnR5cGUgfHwgZ2wuVU5TSUdORURfQllURTtcbiAgICB9XG4gICAgaWYgKHRhcmdldCA9PT0gZ2wuVEVYVFVSRV9DVUJFX01BUCkge1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IDY7ICsraWkpIHtcbiAgICAgICAgZ2wudGV4SW1hZ2UyRChnbC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyBpaSwgMCwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCAwLCBmb3JtYXQsIHR5cGUsIG51bGwpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBnbC50ZXhJbWFnZTJEKHRhcmdldCwgMCwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0LCAwLCBmb3JtYXQsIHR5cGUsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIHNyYyBpcyBhbiBhc3luYyByZXF1ZXN0LlxuICAgKiBpZiBzcmMgaXMgYSBzdHJpbmcgd2UncmUgZ29pbmcgdG8gZG93bmxvYWQgYW4gaW1hZ2VcbiAgICogaWYgc3JjIGlzIGFuIGFycmF5IG9mIHN0cmluZ3Mgd2UncmUgZ29pbmcgdG8gZG93bmxvYWQgY3ViZW1hcCBpbWFnZXNcbiAgICogQHBhcmFtIHsqfSBzcmMgVGhlIHNyYyBmcm9tIGEgVGV4dHVyZU9wdGlvbnNcbiAgICogQHJldHVybnMge2Jvb2x9IHRydWUgaWYgc3JjIGlzIGFzeW5jLlxuICAgKi9cbiAgZnVuY3Rpb24gaXNBc3luY1NyYyhzcmMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHNyYyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAgKEFycmF5LmlzQXJyYXkoc3JjKSAmJiB0eXBlb2Ygc3JjWzBdID09PSAnc3RyaW5nJyk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGJ1bmNoIG9mIHRleHR1cmVzIGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gb3B0aW9ucy5cbiAgICpcbiAgICogRXhhbXBsZTpcbiAgICpcbiAgICogICAgIHZhciB0ZXh0dXJlcyA9IHR3Z2wuY3JlYXRlVGV4dHVyZXMoZ2wsIHtcbiAgICogICAgICAgLy8gYSBwb3dlciBvZiAyIGltYWdlXG4gICAqICAgICAgIGhmdEljb246IHsgc3JjOiBcImltYWdlcy9oZnQtaWNvbi0xNi5wbmdcIiwgbWFnOiBnbC5ORUFSRVNUIH0sXG4gICAqICAgICAgIC8vIGEgbm9uLXBvd2VyIG9mIDIgaW1hZ2VcbiAgICogICAgICAgY2xvdmVyOiB7IHNyYzogXCJpbWFnZXMvY2xvdmVyLmpwZ1wiIH0sXG4gICAqICAgICAgIC8vIEZyb20gYSBjYW52YXNcbiAgICogICAgICAgZnJvbUNhbnZhczogeyBzcmM6IGN0eC5jYW52YXMgfSxcbiAgICogICAgICAgLy8gQSBjdWJlbWFwIGZyb20gNiBpbWFnZXNcbiAgICogICAgICAgeW9rb2hhbWE6IHtcbiAgICogICAgICAgICB0YXJnZXQ6IGdsLlRFWFRVUkVfQ1VCRV9NQVAsXG4gICAqICAgICAgICAgc3JjOiBbXG4gICAqICAgICAgICAgICAnaW1hZ2VzL3lva29oYW1hL3Bvc3guanBnJyxcbiAgICogICAgICAgICAgICdpbWFnZXMveW9rb2hhbWEvbmVneC5qcGcnLFxuICAgKiAgICAgICAgICAgJ2ltYWdlcy95b2tvaGFtYS9wb3N5LmpwZycsXG4gICAqICAgICAgICAgICAnaW1hZ2VzL3lva29oYW1hL25lZ3kuanBnJyxcbiAgICogICAgICAgICAgICdpbWFnZXMveW9rb2hhbWEvcG9zei5qcGcnLFxuICAgKiAgICAgICAgICAgJ2ltYWdlcy95b2tvaGFtYS9uZWd6LmpwZycsXG4gICAqICAgICAgICAgXSxcbiAgICogICAgICAgfSxcbiAgICogICAgICAgLy8gQSBjdWJlbWFwIGZyb20gMSBpbWFnZSAoY2FuIGJlIDF4NiwgMngzLCAzeDIsIDZ4MSlcbiAgICogICAgICAgZ29sZGVuZ2F0ZToge1xuICAgKiAgICAgICAgIHRhcmdldDogZ2wuVEVYVFVSRV9DVUJFX01BUCxcbiAgICogICAgICAgICBzcmM6ICdpbWFnZXMvZ29sZGVuZ2F0ZS5qcGcnLFxuICAgKiAgICAgICB9LFxuICAgKiAgICAgICAvLyBBIDJ4MiBwaXhlbCB0ZXh0dXJlIGZyb20gYSBKYXZhU2NyaXB0IGFycmF5XG4gICAqICAgICAgIGNoZWNrZXI6IHtcbiAgICogICAgICAgICBtYWc6IGdsLk5FQVJFU1QsXG4gICAqICAgICAgICAgbWluOiBnbC5MSU5FQVIsXG4gICAqICAgICAgICAgc3JjOiBbXG4gICAqICAgICAgICAgICAyNTUsMjU1LDI1NSwyNTUsXG4gICAqICAgICAgICAgICAxOTIsMTkyLDE5MiwyNTUsXG4gICAqICAgICAgICAgICAxOTIsMTkyLDE5MiwyNTUsXG4gICAqICAgICAgICAgICAyNTUsMjU1LDI1NSwyNTUsXG4gICAqICAgICAgICAgXSxcbiAgICogICAgICAgfSxcbiAgICogICAgICAgLy8gYSAxeDIgcGl4ZWwgdGV4dHVyZSBmcm9tIGEgdHlwZWQgYXJyYXkuXG4gICAqICAgICAgIHN0cmlwZToge1xuICAgKiAgICAgICAgIG1hZzogZ2wuTkVBUkVTVCxcbiAgICogICAgICAgICBtaW46IGdsLkxJTkVBUixcbiAgICogICAgICAgICBmb3JtYXQ6IGdsLkxVTUlOQU5DRSxcbiAgICogICAgICAgICBzcmM6IG5ldyBVaW50OEFycmF5KFtcbiAgICogICAgICAgICAgIDI1NSxcbiAgICogICAgICAgICAgIDEyOCxcbiAgICogICAgICAgICAgIDI1NSxcbiAgICogICAgICAgICAgIDEyOCxcbiAgICogICAgICAgICAgIDI1NSxcbiAgICogICAgICAgICAgIDEyOCxcbiAgICogICAgICAgICAgIDI1NSxcbiAgICogICAgICAgICAgIDEyOCxcbiAgICogICAgICAgICBdKSxcbiAgICogICAgICAgICB3aWR0aDogMSxcbiAgICogICAgICAgfSxcbiAgICogICAgIH0pO1xuICAgKlxuICAgKiBOb3dcbiAgICpcbiAgICogKiAgIGB0ZXh0dXJlcy5oZnRJY29uYCB3aWxsIGJlIGEgMmQgdGV4dHVyZVxuICAgKiAqICAgYHRleHR1cmVzLmNsb3ZlcmAgd2lsbCBiZSBhIDJkIHRleHR1cmVcbiAgICogKiAgIGB0ZXh0dXJlcy5mcm9tQ2FudmFzYCB3aWxsIGJlIGEgMmQgdGV4dHVyZVxuICAgKiAqICAgYHRleHR1cmVzLnlvaG9oYW1hYCB3aWxsIGJlIGEgY3ViZW1hcCB0ZXh0dXJlXG4gICAqICogICBgdGV4dHVyZXMuZ29sZGVuZ2F0ZWAgd2lsbCBiZSBhIGN1YmVtYXAgdGV4dHVyZVxuICAgKiAqICAgYHRleHR1cmVzLmNoZWNrZXJgIHdpbGwgYmUgYSAyZCB0ZXh0dXJlXG4gICAqICogICBgdGV4dHVyZXMuc3RyaXBlYCB3aWxsIGJlIGEgMmQgdGV4dHVyZVxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLG1vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zPn0gb3B0aW9ucyBBIG9iamVjdCBvZiBUZXh0dXJlT3B0aW9ucyBvbmUgcGVyIHRleHR1cmUuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuVGV4dHVyZXNSZWFkeUNhbGxiYWNrfSBbY2FsbGJhY2tdIEEgY2FsbGJhY2sgY2FsbGVkIHdoZW4gYWxsIHRleHR1cmVzIGhhdmUgYmVlbiBkb3dubG9hZGVkLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZyxXZWJHTFRleHR1cmU+fSB0aGUgY3JlYXRlZCB0ZXh0dXJlcyBieSBuYW1lXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlVGV4dHVyZXMoZ2wsIHRleHR1cmVPcHRpb25zLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICB2YXIgbnVtRG93bmxvYWRpbmcgPSAwO1xuICAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICB2YXIgdGV4dHVyZXMgPSB7fTtcbiAgICB2YXIgaW1hZ2VzID0ge307XG5cbiAgICBmdW5jdGlvbiBjYWxsQ2FsbGJhY2tJZlJlYWR5KCkge1xuICAgICAgaWYgKG51bURvd25sb2FkaW5nID09PSAwKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2FsbGJhY2soZXJyb3JzLmxlbmd0aCA/IGVycm9ycyA6IHVuZGVmaW5lZCwgdGV4dHVyZXMsIGltYWdlcyk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKHRleHR1cmVPcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBvcHRpb25zID0gdGV4dHVyZU9wdGlvbnNbbmFtZV07XG4gICAgICB2YXIgb25Mb2FkRm4gPSB1bmRlZmluZWQ7XG4gICAgICBpZiAoaXNBc3luY1NyYyhvcHRpb25zLnNyYykpIHtcbiAgICAgICAgb25Mb2FkRm4gPSBmdW5jdGlvbihlcnIsIHRleCwgaW1nKSB7XG4gICAgICAgICAgaW1hZ2VzW25hbWVdID0gaW1nO1xuICAgICAgICAgIC0tbnVtRG93bmxvYWRpbmc7XG4gICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2FsbENhbGxiYWNrSWZSZWFkeSgpO1xuICAgICAgICB9O1xuICAgICAgICArK251bURvd25sb2FkaW5nO1xuICAgICAgfVxuICAgICAgdGV4dHVyZXNbbmFtZV0gPSBjcmVhdGVUZXh0dXJlKGdsLCBvcHRpb25zLCBvbkxvYWRGbik7XG4gICAgfSk7XG5cbiAgICAvLyBxdWV1ZSB0aGUgY2FsbGJhY2sgaWYgdGhlcmUgYXJlIG5vIGltYWdlcyB0byBkb3dubG9hZC5cbiAgICAvLyBXZSBkbyB0aGlzIGJlY2F1c2UgaWYgeW91ciBjb2RlIGlzIHN0cnVjdHVyZWQgdG8gd2FpdCBmb3JcbiAgICAvLyBpbWFnZXMgdG8gZG93bmxvYWQgYnV0IHRoZW4geW91IGNvbW1lbnQgb3V0IGFsbCB0aGUgYXN5bmNcbiAgICAvLyBpbWFnZXMgeW91ciBjb2RlIHdvdWxkIGJyZWFrLlxuICAgIGNhbGxDYWxsYmFja0lmUmVhZHkoKTtcblxuICAgIHJldHVybiB0ZXh0dXJlcztcbiAgfVxuXG4gIC8vIFVzaW5nIHF1b3RlcyBwcmV2ZW50cyBVZ2xpZnkgZnJvbSBjaGFuZ2luZyB0aGUgbmFtZXMuXG4gIC8vIE5vIHNwZWVkIGRpZmYgQUZBSUNULlxuICByZXR1cm4ge1xuICAgIFwic2V0RGVmYXVsdHNfXCI6IHNldERlZmF1bHRzLFxuXG4gICAgXCJjcmVhdGVUZXh0dXJlXCI6IGNyZWF0ZVRleHR1cmUsXG4gICAgXCJzZXRFbXB0eVRleHR1cmVcIjogc2V0RW1wdHlUZXh0dXJlLFxuICAgIFwic2V0VGV4dHVyZUZyb21BcnJheVwiOiBzZXRUZXh0dXJlRnJvbUFycmF5LFxuICAgIFwibG9hZFRleHR1cmVGcm9tVXJsXCI6IGxvYWRUZXh0dXJlRnJvbVVybCxcbiAgICBcInNldFRleHR1cmVGcm9tRWxlbWVudFwiOiBzZXRUZXh0dXJlRnJvbUVsZW1lbnQsXG4gICAgXCJzZXRUZXh0dXJlRmlsdGVyaW5nRm9yU2l6ZVwiOiBzZXRUZXh0dXJlRmlsdGVyaW5nRm9yU2l6ZSxcbiAgICBcInNldFRleHR1cmVQYXJhbWV0ZXJzXCI6IHNldFRleHR1cmVQYXJhbWV0ZXJzLFxuICAgIFwic2V0RGVmYXVsdFRleHR1cmVDb2xvclwiOiBzZXREZWZhdWx0VGV4dHVyZUNvbG9yLFxuICAgIFwiY3JlYXRlVGV4dHVyZXNcIjogY3JlYXRlVGV4dHVyZXMsXG4gICAgXCJyZXNpemVUZXh0dXJlXCI6IHJlc2l6ZVRleHR1cmUsXG4gICAgXCJnZXROdW1Db21wb25lbnRzRm9yRm9ybWF0XCI6IGdldE51bUNvbXBvbmVudHNGb3JGb3JtYXQsXG4gIH07XG59KTtcblxuXG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSwgR3JlZ2cgVGF2YXJlcy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG5kZWZpbmUoJ3R3Z2wvZnJhbWVidWZmZXJzJyxbXG4gICAgJy4vdGV4dHVyZXMnLFxuICAgICcuL3V0aWxzJyxcbiAgXSwgZnVuY3Rpb24gKFxuICAgIHRleHR1cmVzLFxuICAgIHV0aWxzKSB7XG4gIFxuXG4gIC8vIG1ha2Ugc3VyZSB3ZSBkb24ndCBzZWUgYSBnbG9iYWwgZ2xcbiAgdmFyIGdsID0gdW5kZWZpbmVkOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuXG4gIHZhciBVTlNJR05FRF9CWVRFICAgICAgICAgICAgICAgICAgPSAweDE0MDE7XG5cbiAgLyogUGl4ZWxGb3JtYXQgKi9cbiAgdmFyIERFUFRIX0NPTVBPTkVOVCAgICAgICAgICAgICAgICA9IDB4MTkwMjtcbiAgdmFyIFJHQkEgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDB4MTkwODtcblxuICAvKiBGcmFtZWJ1ZmZlciBPYmplY3QuICovXG4gIHZhciBSR0JBNCAgICAgICAgICAgICAgICAgICAgICAgICAgPSAweDgwNTY7XG4gIHZhciBSR0I1X0ExICAgICAgICAgICAgICAgICAgICAgICAgPSAweDgwNTc7XG4gIHZhciBSR0I1NjUgICAgICAgICAgICAgICAgICAgICAgICAgPSAweDhENjI7XG4gIHZhciBERVBUSF9DT01QT05FTlQxNiAgICAgICAgICAgICAgPSAweDgxQTU7XG4gIHZhciBTVEVOQ0lMX0lOREVYICAgICAgICAgICAgICAgICAgPSAweDE5MDE7XG4gIHZhciBTVEVOQ0lMX0lOREVYOCAgICAgICAgICAgICAgICAgPSAweDhENDg7XG4gIHZhciBERVBUSF9TVEVOQ0lMICAgICAgICAgICAgICAgICAgPSAweDg0Rjk7XG4gIHZhciBDT0xPUl9BVFRBQ0hNRU5UMCAgICAgICAgICAgICAgPSAweDhDRTA7XG4gIHZhciBERVBUSF9BVFRBQ0hNRU5UICAgICAgICAgICAgICAgPSAweDhEMDA7XG4gIHZhciBTVEVOQ0lMX0FUVEFDSE1FTlQgICAgICAgICAgICAgPSAweDhEMjA7XG4gIHZhciBERVBUSF9TVEVOQ0lMX0FUVEFDSE1FTlQgICAgICAgPSAweDgyMUE7XG5cbiAgLyogVGV4dHVyZVdyYXBNb2RlICovXG4gIHZhciBSRVBFQVQgICAgICAgICAgICAgICAgICAgICAgICAgPSAweDI5MDE7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIHZhciBDTEFNUF9UT19FREdFICAgICAgICAgICAgICAgICAgPSAweDgxMkY7XG4gIHZhciBNSVJST1JFRF9SRVBFQVQgICAgICAgICAgICAgICAgPSAweDgzNzA7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgLyogVGV4dHVyZU1hZ0ZpbHRlciAqL1xuICB2YXIgTkVBUkVTVCAgICAgICAgICAgICAgICAgICAgICAgID0gMHgyNjAwOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB2YXIgTElORUFSICAgICAgICAgICAgICAgICAgICAgICAgID0gMHgyNjAxO1xuXG4gIC8qIFRleHR1cmVNaW5GaWx0ZXIgKi9cbiAgdmFyIE5FQVJFU1RfTUlQTUFQX05FQVJFU1QgICAgICAgICA9IDB4MjcwMDsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgdmFyIExJTkVBUl9NSVBNQVBfTkVBUkVTVCAgICAgICAgICA9IDB4MjcwMTsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgdmFyIE5FQVJFU1RfTUlQTUFQX0xJTkVBUiAgICAgICAgICA9IDB4MjcwMjsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgdmFyIExJTkVBUl9NSVBNQVBfTElORUFSICAgICAgICAgICA9IDB4MjcwMzsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAvKipcbiAgICogVGhlIG9wdGlvbnMgZm9yIGEgZnJhbWVidWZmZXIgYXR0YWNobWVudC5cbiAgICpcbiAgICogTm90ZTogRm9yIGEgYGZvcm1hdGAgdGhhdCBpcyBhIHRleHR1cmUgaW5jbHVkZSBhbGwgdGhlIHRleHR1cmVcbiAgICogb3B0aW9ucyBmcm9tIHtAbGluayBtb2R1bGU6dHdnbC5UZXh0dXJlT3B0aW9uc30gZm9yIGV4YW1wbGVcbiAgICogYG1pbmAsIGBtYWdgLCBgY2xhbXBgLCBldGMuLi4gTm90ZSB0aGF0IHVubGlrZSB7QGxpbmsgbW9kdWxlOnR3Z2wuVGV4dHVyZU9wdGlvbnN9XG4gICAqIGBhdXRvYCBkZWZhdWx0cyB0byBgZmFsc2VgIGZvciBhdHRhY2htZW50IHRleHR1cmVzXG4gICAqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IEF0dGFjaG1lbnRPcHRpb25zXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbYXR0YWNoXSBUaGUgYXR0YWNobWVudCBwb2ludC4gRGVmYXVsdHNcbiAgICogICB0byBgZ2wuQ09MT1JfQVRUQUNUTUVOVDAgKyBuZHhgIHVubGVzcyB0eXBlIGlzIGEgZGVwdGggb3Igc3RlbmNpbCB0eXBlXG4gICAqICAgdGhlbiBpdCdzIGdsLkRFUFRIX0FUVEFDSE1FTlQgb3IgYGdsLkRFUFRIX1NURU5DSUxfQVRUQUNITUVOVGAgZGVwZW5kaW5nXG4gICAqICAgb24gdGhlIGZvcm1hdCBvciBhdHRhY2htZW50IHR5cGUuXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBbZm9ybWF0XSBUaGUgZm9ybWF0LiBJZiBvbmUgb2YgYGdsLlJHQkE0YCxcbiAgICogICBgZ2wuUkdCNTY1YCwgYGdsLlJHQjVfQTFgLCBgZ2wuREVQVEhfQ09NUE9ORU5UMTZgLFxuICAgKiAgIGBnbC5TVEVOQ0lMX0lOREVYOGAgb3IgYGdsLkRFUFRIX1NURU5DSUxgIHRoZW4gd2lsbCBjcmVhdGUgYVxuICAgKiAgIHJlbmRlcmJ1ZmZlci4gT3RoZXJ3aXNlIHdpbGwgY3JlYXRlIGEgdGV4dHVyZS4gRGVmYXVsdCA9IGBnbC5SR0JBYFxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3R5cGVdIFRoZSB0eXBlLiBVc2VkIGZvciB0ZXh0dXJlLiBEZWZhdWx0ID0gYGdsLlVOU0lHTkVEX0JZVEVgLlxuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3RhcmdldF0gVGhlIHRleHR1cmUgdGFyZ2V0IGZvciBgZ2wuZnJhbWVidWZmZXJUZXh0dXJlMkRgLlxuICAgKiAgIERlZmF1bHRzIHRvIGBnbC5URVhUVVJFXzJEYC4gU2V0IHRvIGFwcHJvcHJpYXRlIGZhY2UgZm9yIGN1YmUgbWFwcy5cbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IFtsZXZlbF0gbGV2ZWwgZm9yIGBnbC5mcmFtZWJ1ZmZlclRleHR1cmUyRGAuIERlZmF1bHRzIHRvIDAuXG4gICAqIEBwcm9wZXJ0eSB7V2ViR0xPYmplY3R9IFthdHRhY2htZW50XSBBbiBleGlzdGluZyByZW5kZXJidWZmZXIgb3IgdGV4dHVyZS5cbiAgICogICAgSWYgcHJvdmlkZWQgd2lsbCBhdHRhY2ggdGhpcyBPYmplY3QuIFRoaXMgYWxsb3dzIHlvdSB0byBzaGFyZVxuICAgKiAgICBhdHRhY2hlbW50cyBhY3Jvc3MgZnJhbWVidWZmZXJzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG5cbiAgdmFyIGRlZmF1bHRBdHRhY2htZW50cyA9IFtcbiAgICB7IGZvcm1hdDogUkdCQSwgdHlwZTogVU5TSUdORURfQllURSwgbWluOiBMSU5FQVIsIHdyYXA6IENMQU1QX1RPX0VER0UsIH0sXG4gICAgeyBmb3JtYXQ6IERFUFRIX1NURU5DSUwsIH0sXG4gIF07XG5cbiAgdmFyIGF0dGFjaG1lbnRzQnlGb3JtYXQgPSB7fTtcbiAgYXR0YWNobWVudHNCeUZvcm1hdFtERVBUSF9TVEVOQ0lMXSA9IERFUFRIX1NURU5DSUxfQVRUQUNITUVOVDtcbiAgYXR0YWNobWVudHNCeUZvcm1hdFtTVEVOQ0lMX0lOREVYXSA9IFNURU5DSUxfQVRUQUNITUVOVDtcbiAgYXR0YWNobWVudHNCeUZvcm1hdFtTVEVOQ0lMX0lOREVYOF0gPSBTVEVOQ0lMX0FUVEFDSE1FTlQ7XG4gIGF0dGFjaG1lbnRzQnlGb3JtYXRbREVQVEhfQ09NUE9ORU5UXSA9IERFUFRIX0FUVEFDSE1FTlQ7XG4gIGF0dGFjaG1lbnRzQnlGb3JtYXRbREVQVEhfQ09NUE9ORU5UMTZdID0gREVQVEhfQVRUQUNITUVOVDtcblxuICBmdW5jdGlvbiBnZXRBdHRhY2htZW50UG9pbnRGb3JGb3JtYXQoZm9ybWF0KSB7XG4gICAgcmV0dXJuIGF0dGFjaG1lbnRzQnlGb3JtYXRbZm9ybWF0XTtcbiAgfVxuXG4gIHZhciByZW5kZXJidWZmZXJGb3JtYXRzID0ge307XG4gIHJlbmRlcmJ1ZmZlckZvcm1hdHNbUkdCQTRdID0gdHJ1ZTtcbiAgcmVuZGVyYnVmZmVyRm9ybWF0c1tSR0I1X0ExXSA9IHRydWU7XG4gIHJlbmRlcmJ1ZmZlckZvcm1hdHNbUkdCNTY1XSA9IHRydWU7XG4gIHJlbmRlcmJ1ZmZlckZvcm1hdHNbREVQVEhfU1RFTkNJTF0gPSB0cnVlO1xuICByZW5kZXJidWZmZXJGb3JtYXRzW0RFUFRIX0NPTVBPTkVOVDE2XSA9IHRydWU7XG4gIHJlbmRlcmJ1ZmZlckZvcm1hdHNbU1RFTkNJTF9JTkRFWF0gPSB0cnVlO1xuICByZW5kZXJidWZmZXJGb3JtYXRzW1NURU5DSUxfSU5ERVg4XSA9IHRydWU7XG5cbiAgZnVuY3Rpb24gaXNSZW5kZXJidWZmZXJGb3JtYXQoZm9ybWF0KSB7XG4gICAgcmV0dXJuIHJlbmRlcmJ1ZmZlckZvcm1hdHNbZm9ybWF0XTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBGcmFtZWJ1ZmZlckluZm9cbiAgICogQHByb3BlcnR5IHtXZWJHTEZyYW1lYnVmZmVyfSBmcmFtZWJ1ZmZlciBUaGUgV2ViR0xGcmFtZWJ1ZmZlciBmb3IgdGhpcyBmcmFtZWJ1ZmZlckluZm9cbiAgICogQHByb3BlcnR5IHtXZWJHTE9iamVjdFtdfSBhdHRhY2htZW50cyBUaGUgY3JlYXRlZCBhdHRhY2htZW50cyBpbiB0aGUgc2FtZSBvcmRlciBhcyBwYXNzZWQgaW4gdG8ge0BsaW5rIG1vZHVsZTp0d2dsLmNyZWF0ZUZyYW1lYnVmZmVySW5mb30uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGZyYW1lYnVmZmVyIGFuZCBhdHRhY2htZW50cy5cbiAgICpcbiAgICogVGhpcyByZXR1cm5zIGEge0BsaW5rIG1vZHVsZTp0d2dsLkZyYW1lYnVmZmVySW5mb30gYmVjYXVzZSBpdCBuZWVkcyB0byByZXR1cm4gdGhlIGF0dGFjaG1lbnRzIGFzIHdlbGwgYXMgdGhlIGZyYW1lYnVmZmVyLlxuICAgKlxuICAgKiBUaGUgc2ltcGxlc3QgdXNhZ2VcbiAgICpcbiAgICogICAgIC8vIGNyZWF0ZSBhbiBSR0JBL1VOU0lHTkVEX0JZVEUgdGV4dHVyZSBhbmQgREVQVEhfU1RFTkNJTCByZW5kZXJidWZmZXJcbiAgICogICAgIHZhciBmYmkgPSB0d2dsLmNyZWF0ZUZyYW1lYnVmZmVyKGdsKTtcbiAgICpcbiAgICogTW9yZSBjb21wbGV4IHVzYWdlXG4gICAqXG4gICAqICAgICAvLyBjcmVhdGUgYW4gUkdCNTY1IHJlbmRlcmJ1ZmZlciBhbmQgYSBTVEVOQ0lMX0lOREVYOCByZW5kZXJidWZmZXJcbiAgICogICAgIHZhciBhdHRhY2htZW50cyA9IFtcbiAgICogICAgICAgeyBmb3JtYXQ6IFJHQjU2NSwgbWFnOiBORUFSRVNUIH0sXG4gICAqICAgICAgIHsgZm9ybWF0OiBTVEVOQ0lMX0lOREVYOCB9LFxuICAgKiAgICAgXVxuICAgKiAgICAgdmFyIGZiaSA9IHR3Z2wuY3JlYXRlRnJhbWVidWZmZXIoZ2wsIGF0dGFjaG1lbnRzKTtcbiAgICpcbiAgICogUGFzc2luZyBpbiBhIHNwZWNpZmljIHNpemVcbiAgICpcbiAgICogICAgIHZhciB3aWR0aCA9IDI1NjtcbiAgICogICAgIHZhciBoZWlnaHQgPSAyNTY7XG4gICAqICAgICB2YXIgZmJpID0gdHdnbC5jcmVhdGVGcmFtZWJ1ZmZlcihnbCwgYXR0YWNobWVudHMsIHdpZHRoLCBoZWlnaHQpO1xuICAgKlxuICAgKiAqKk5vdGUhISoqIEl0IGlzIHVwIHRvIHlvdSB0byBjaGVjayBpZiB0aGUgZnJhbWVidWZmZXIgaXMgcmVuZGVyYWJsZSBieSBjYWxsaW5nIGBnbC5jaGVja0ZyYW1lYnVmZmVyU3RhdHVzYC5cbiAgICogW1dlYkdMIG9ubHkgZ3VhcmFudGVlcyAzIGNvbWJpbmF0aW9ucyBvZiBhdHRhY2htZW50cyB3b3JrXShodHRwczovL3d3dy5raHJvbm9zLm9yZy9yZWdpc3RyeS93ZWJnbC9zcGVjcy9sYXRlc3QvMS4wLyM2LjYpLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgdGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dFxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsLkF0dGFjaG1lbnRPcHRpb25zW119IFthdHRhY2htZW50c10gd2hpY2ggYXR0YWNobWVudHMgdG8gY3JlYXRlLiBJZiBub3QgcHJvdmlkZWQgdGhlIGRlZmF1bHQgaXMgYSBmcmFtZWJ1ZmZlciB3aXRoIGFuXG4gICAqICAgIGBSR0JBYCwgYFVOU0lHTkVEX0JZVEVgIHRleHR1cmUgYENPTE9SX0FUVEFDSE1FTlQwYCBhbmQgYSBgREVQVEhfU1RFTkNJTGAgcmVuZGVyYnVmZmVyIGBERVBUSF9TVEVOQ0lMX0FUVEFDSE1FTlRgLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoXSB0aGUgd2lkdGggZm9yIHRoZSBhdHRhY2htZW50cy4gRGVmYXVsdCA9IHNpemUgb2YgZHJhd2luZ0J1ZmZlclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodF0gdGhlIGhlaWdodCBmb3IgdGhlIGF0dGFjaG1lbnRzLiBEZWZhdXR0ID0gc2l6ZSBvZiBkcmF3aW5nQnVmZmVyXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLkZyYW1lYnVmZmVySW5mb30gdGhlIGZyYW1lYnVmZmVyIGFuZCBhdHRhY2htZW50cy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVGcmFtZWJ1ZmZlckluZm8oZ2wsIGF0dGFjaG1lbnRzLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIHRhcmdldCA9IGdsLkZSQU1FQlVGRkVSO1xuICAgIHZhciBmYiA9IGdsLmNyZWF0ZUZyYW1lYnVmZmVyKCk7XG4gICAgZ2wuYmluZEZyYW1lYnVmZmVyKHRhcmdldCwgZmIpO1xuICAgIHdpZHRoICA9IHdpZHRoICB8fCBnbC5kcmF3aW5nQnVmZmVyV2lkdGg7XG4gICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IGdsLmRyYXdpbmdCdWZmZXJIZWlnaHQ7XG4gICAgYXR0YWNobWVudHMgPSBhdHRhY2htZW50cyB8fCBkZWZhdWx0QXR0YWNobWVudHM7XG4gICAgdmFyIGNvbG9yQXR0YWNobWVudENvdW50ID0gMDtcbiAgICB2YXIgZnJhbWVidWZmZXJJbmZvID0ge1xuICAgICAgZnJhbWVidWZmZXI6IGZiLFxuICAgICAgYXR0YWNobWVudHM6IFtdLFxuICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgfTtcbiAgICBhdHRhY2htZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGF0dGFjaG1lbnRPcHRpb25zKSB7XG4gICAgICB2YXIgYXR0YWNobWVudCA9IGF0dGFjaG1lbnRPcHRpb25zLmF0dGFjaG1lbnQ7XG4gICAgICB2YXIgZm9ybWF0ID0gYXR0YWNobWVudE9wdGlvbnMuZm9ybWF0O1xuICAgICAgdmFyIGF0dGFjaG1lbnRQb2ludCA9IGdldEF0dGFjaG1lbnRQb2ludEZvckZvcm1hdChmb3JtYXQpO1xuICAgICAgaWYgKCFhdHRhY2htZW50UG9pbnQpIHtcbiAgICAgICAgYXR0YWNobWVudFBvaW50ID0gQ09MT1JfQVRUQUNITUVOVDAgKyBjb2xvckF0dGFjaG1lbnRDb3VudCsrO1xuICAgICAgfVxuICAgICAgaWYgKCFhdHRhY2htZW50KSB7XG4gICAgICAgIGlmIChpc1JlbmRlcmJ1ZmZlckZvcm1hdChmb3JtYXQpKSB7XG4gICAgICAgICAgYXR0YWNobWVudCA9IGdsLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpO1xuICAgICAgICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoZ2wuUkVOREVSQlVGRkVSLCBhdHRhY2htZW50KTtcbiAgICAgICAgICBnbC5yZW5kZXJidWZmZXJTdG9yYWdlKGdsLlJFTkRFUkJVRkZFUiwgZm9ybWF0LCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgdGV4dHVyZU9wdGlvbnMgPSB1dGlscy5zaGFsbG93Q29weShhdHRhY2htZW50T3B0aW9ucyk7XG4gICAgICAgICAgdGV4dHVyZU9wdGlvbnMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICB0ZXh0dXJlT3B0aW9ucy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgdGV4dHVyZU9wdGlvbnMuYXV0byA9IGF0dGFjaG1lbnRPcHRpb25zLmF1dG8gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXR0YWNobWVudE9wdGlvbnMuYXV0bztcbiAgICAgICAgICBhdHRhY2htZW50ID0gdGV4dHVyZXMuY3JlYXRlVGV4dHVyZShnbCwgdGV4dHVyZU9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYXR0YWNobWVudCBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyYnVmZmVyKSB7XG4gICAgICAgIGdsLmZyYW1lYnVmZmVyUmVuZGVyYnVmZmVyKHRhcmdldCwgYXR0YWNobWVudFBvaW50LCBnbC5SRU5ERVJCVUZGRVIsIGF0dGFjaG1lbnQpO1xuICAgICAgfSBlbHNlIGlmIChhdHRhY2htZW50IGluc3RhbmNlb2YgV2ViR0xUZXh0dXJlKSB7XG4gICAgICAgIGdsLmZyYW1lYnVmZmVyVGV4dHVyZTJEKFxuICAgICAgICAgICAgdGFyZ2V0LFxuICAgICAgICAgICAgYXR0YWNobWVudFBvaW50LFxuICAgICAgICAgICAgYXR0YWNobWVudE9wdGlvbnMudGV4VGFyZ2V0IHx8IGdsLlRFWFRVUkVfMkQsXG4gICAgICAgICAgICBhdHRhY2htZW50LFxuICAgICAgICAgICAgYXR0YWNobWVudE9wdGlvbnMubGV2ZWwgfHwgMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBcInVua25vd24gYXR0YWNobWVudCB0eXBlXCI7XG4gICAgICB9XG4gICAgICBmcmFtZWJ1ZmZlckluZm8uYXR0YWNobWVudHMucHVzaChhdHRhY2htZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZnJhbWVidWZmZXJJbmZvO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZXMgdGhlIGF0dGFjaG1lbnRzIG9mIGEgZnJhbWVidWZmZXIuXG4gICAqXG4gICAqIFlvdSBuZWVkIHRvIHBhc3MgaW4gdGhlIHNhbWUgYGF0dGFjaG1lbnRzYCBhcyB5b3UgcGFzc2VkIGluIHtAbGluayBtb2R1bGU6dHdnbC5jcmVhdGVGcmFtZWJ1ZmZlcn1cbiAgICogYmVjYXVzZSBUV0dMIGhhcyBubyBpZGVhIHRoZSBmb3JtYXQvdHlwZSBvZiBlYWNoIGF0dGFjaG1lbnQuXG4gICAqXG4gICAqIFRoZSBzaW1wbGVzdCB1c2FnZVxuICAgKlxuICAgKiAgICAgLy8gY3JlYXRlIGFuIFJHQkEvVU5TSUdORURfQllURSB0ZXh0dXJlIGFuZCBERVBUSF9TVEVOQ0lMIHJlbmRlcmJ1ZmZlclxuICAgKiAgICAgdmFyIGZiaSA9IHR3Z2wuY3JlYXRlRnJhbWVidWZmZXIoZ2wpO1xuICAgKlxuICAgKiAgICAgLi4uXG4gICAqXG4gICAqICAgICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAqICAgICAgIGlmICh0d2dsLnJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoZ2wuY2FudmFzKSkge1xuICAgKiAgICAgICAgIC8vIHJlc2l6ZSB0aGUgYXR0YWNobWVudHNcbiAgICogICAgICAgICB0d2dsLnJlc2l6ZUZyYW1lYnVmZmVySW5mbyhnbCwgZmJpKTtcbiAgICogICAgICAgfVxuICAgKlxuICAgKiBNb3JlIGNvbXBsZXggdXNhZ2VcbiAgICpcbiAgICogICAgIC8vIGNyZWF0ZSBhbiBSR0I1NjUgcmVuZGVyYnVmZmVyIGFuZCBhIFNURU5DSUxfSU5ERVg4IHJlbmRlcmJ1ZmZlclxuICAgKiAgICAgdmFyIGF0dGFjaG1lbnRzID0gW1xuICAgKiAgICAgICB7IGZvcm1hdDogUkdCNTY1LCBtYWc6IE5FQVJFU1QgfSxcbiAgICogICAgICAgeyBmb3JtYXQ6IFNURU5DSUxfSU5ERVg4IH0sXG4gICAqICAgICBdXG4gICAqICAgICB2YXIgZmJpID0gdHdnbC5jcmVhdGVGcmFtZWJ1ZmZlcihnbCwgYXR0YWNobWVudHMpO1xuICAgKlxuICAgKiAgICAgLi4uXG4gICAqXG4gICAqICAgICBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAqICAgICAgIGlmICh0d2dsLnJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoZ2wuY2FudmFzKSkge1xuICAgKiAgICAgICAgIC8vIHJlc2l6ZSB0aGUgYXR0YWNobWVudHMgdG8gbWF0Y2hcbiAgICogICAgICAgICB0d2dsLnJlc2l6ZUZyYW1lYnVmZmVySW5mbyhnbCwgZmJpLCBhdHRhY2htZW50cyk7XG4gICAqICAgICAgIH1cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIHRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHRcbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC5GcmFtZWJ1ZmZlckluZm99IGZyYW1lYnVmZmVySW5mbyBhIGZyYW1lYnVmZmVySW5mbyBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBtb2R1bGU6dHdnbC5jcmVhdGVGcmFtZWJ1ZmZlcn0uXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuQXR0YWNobWVudE9wdGlvbnNbXX0gW2F0dGFjaG1lbnRzXSB0aGUgc2FtZSBhdHRhY2htZW50cyBvcHRpb25zIGFzIHBhc3NlZCB0byB7QGxpbmsgbW9kdWxlOnR3Z2wuY3JlYXRlRnJhbWVidWZmZXJ9LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoXSB0aGUgd2lkdGggZm9yIHRoZSBhdHRhY2htZW50cy4gRGVmYXVsdCA9IHNpemUgb2YgZHJhd2luZ0J1ZmZlclxuICAgKiBAcGFyYW0ge251bWJlcn0gW2hlaWdodF0gdGhlIGhlaWdodCBmb3IgdGhlIGF0dGFjaG1lbnRzLiBEZWZhdXR0ID0gc2l6ZSBvZiBkcmF3aW5nQnVmZmVyXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cbiAgZnVuY3Rpb24gcmVzaXplRnJhbWVidWZmZXJJbmZvKGdsLCBmcmFtZWJ1ZmZlckluZm8sIGF0dGFjaG1lbnRzLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgd2lkdGggID0gd2lkdGggIHx8IGdsLmRyYXdpbmdCdWZmZXJXaWR0aDtcbiAgICBoZWlnaHQgPSBoZWlnaHQgfHwgZ2wuZHJhd2luZ0J1ZmZlckhlaWdodDtcbiAgICBmcmFtZWJ1ZmZlckluZm8ud2lkdGggPSB3aWR0aDtcbiAgICBmcmFtZWJ1ZmZlckluZm8uaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIGF0dGFjaG1lbnRzID0gYXR0YWNobWVudHMgfHwgZGVmYXVsdEF0dGFjaG1lbnRzO1xuICAgIGF0dGFjaG1lbnRzLmZvckVhY2goZnVuY3Rpb24oYXR0YWNobWVudE9wdGlvbnMsIG5keCkge1xuICAgICAgdmFyIGF0dGFjaG1lbnQgPSBmcmFtZWJ1ZmZlckluZm8uYXR0YWNobWVudHNbbmR4XTtcbiAgICAgIHZhciBmb3JtYXQgPSBhdHRhY2htZW50T3B0aW9ucy5mb3JtYXQ7XG4gICAgICBpZiAoYXR0YWNobWVudCBpbnN0YW5jZW9mIFdlYkdMUmVuZGVyYnVmZmVyKSB7XG4gICAgICAgIGdsLmJpbmRSZW5kZXJidWZmZXIoZ2wuUkVOREVSQlVGRkVSLCBhdHRhY2htZW50KTtcbiAgICAgICAgZ2wucmVuZGVyYnVmZmVyU3RvcmFnZShnbC5SRU5ERVJCVUZGRVIsIGZvcm1hdCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICB9IGVsc2UgaWYgKGF0dGFjaG1lbnQgaW5zdGFuY2VvZiBXZWJHTFRleHR1cmUpIHtcbiAgICAgICAgdGV4dHVyZXMucmVzaXplVGV4dHVyZShnbCwgYXR0YWNobWVudCwgYXR0YWNobWVudE9wdGlvbnMsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgXCJ1bmtub3duIGF0dGFjaG1lbnQgdHlwZVwiO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgZnJhbWVidWZmZXJcbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiBwcmV0dHkgbXVjaCBzb2xleSBleGlzdHMgYmVjYXVzZSBJIHNwZW50IGhvdXJzXG4gICAqIHRyeWluZyB0byBmaWd1cmUgb3V0IHdoeSBzb21ldGhpbmcgSSB3cm90ZSB3YXNuJ3Qgd29ya2luZyBvbmx5XG4gICAqIHRvIHJlYWxpemUgSSBmb3JnZXQgdG8gc2V0IHRoZSB2aWV3cG9ydCBkaW1lbnNpb25zLlxuICAgKiBNeSBob3BlIGlzIHRoaXMgZnVuY3Rpb24gd2lsbCBmaXggdGhhdC5cbiAgICpcbiAgICogSXQgaXMgZWZmZWN0aXZlbHkgdGhlIHNhbWUgYXNcbiAgICpcbiAgICogICAgIGdsLmJpbmRGcmFtZWJ1ZmZlcihnbC5GUkFNRUJVRkZFUiwgc29tZUZyYW1lYnVmZmVySW5mby5mcmFtZWJ1ZmZlcik7XG4gICAqICAgICBnbC52aWV3cG9ydCgwLCAwLCBzb21lRnJhbWVidWZmZXJJbmZvLndpZHRoLCBzb21lRnJhbWVidWZmZXJJbmZvLmhlaWdodCk7XG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCB0aGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuRnJhbWVidWZmZXJJbmZvfSBbZnJhbWVidWZmZXJJbmZvXSBhIGZyYW1lYnVmZmVySW5mbyBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBtb2R1bGU6dHdnbC5jcmVhdGVGcmFtZWJ1ZmZlcn0uXG4gICAqICAgSWYgbm90IHBhc3NlZCB3aWxsIGJpbmQgdGhlIGNhbnZhcy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFt0YXJnZXRdIFRoZSB0YXJnZXQuIElmIG5vdCBwYXNzZWQgYGdsLkZSQU1FQlVGRkVSYCB3aWxsIGJlIHVzZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbFxuICAgKi9cblxuICBmdW5jdGlvbiBiaW5kRnJhbWVidWZmZXJJbmZvKGdsLCBmcmFtZWJ1ZmZlckluZm8sIHRhcmdldCkge1xuICAgIHRhcmdldCA9IHRhcmdldCB8fCBnbC5GUkFNRUJVRkZFUjtcbiAgICBpZiAoZnJhbWVidWZmZXJJbmZvKSB7XG4gICAgICBnbC5iaW5kRnJhbWVidWZmZXIodGFyZ2V0LCBmcmFtZWJ1ZmZlckluZm8uZnJhbWVidWZmZXIpO1xuICAgICAgZ2wudmlld3BvcnQoMCwgMCwgZnJhbWVidWZmZXJJbmZvLndpZHRoLCBmcmFtZWJ1ZmZlckluZm8uaGVpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2wuYmluZEZyYW1lYnVmZmVyKHRhcmdldCwgbnVsbCk7XG4gICAgICBnbC52aWV3cG9ydCgwLCAwLCBnbC5kcmF3aW5nQnVmZmVyV2lkdGgsIGdsLmRyYXdpbmdCdWZmZXJIZWlnaHQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFVzaW5nIHF1b3RlcyBwcmV2ZW50cyBVZ2xpZnkgZnJvbSBjaGFuZ2luZyB0aGUgbmFtZXMuXG4gIC8vIE5vIHNwZWVkIGRpZmYgQUZBSUNULlxuICByZXR1cm4ge1xuICAgIFwiYmluZEZyYW1lYnVmZmVySW5mb1wiOiBiaW5kRnJhbWVidWZmZXJJbmZvLFxuICAgIFwiY3JlYXRlRnJhbWVidWZmZXJJbmZvXCI6IGNyZWF0ZUZyYW1lYnVmZmVySW5mbyxcbiAgICBcInJlc2l6ZUZyYW1lYnVmZmVySW5mb1wiOiByZXNpemVGcmFtZWJ1ZmZlckluZm8sXG4gIH07XG59KTtcblxuXG4vKlxuICogQ29weXJpZ2h0IDIwMTUsIEdyZWdnIFRhdmFyZXMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICogbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZVxuICogbWV0OlxuICpcbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0XG4gKiBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlXG4gKiBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyXG4gKiBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlXG4gKiBkaXN0cmlidXRpb24uXG4gKiAgICAgKiBOZWl0aGVyIHRoZSBuYW1lIG9mIEdyZWdnIFRhdmFyZXMuIG5vciB0aGUgbmFtZXMgb2YgaGlzXG4gKiBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZSBvciBwcm9tb3RlIHByb2R1Y3RzIGRlcml2ZWQgZnJvbVxuICogdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTXG4gKiBcIkFTIElTXCIgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1JcbiAqIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQ09QWVJJR0hUXG4gKiBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCxcbiAqIFNQRUNJQUwsIEVYRU1QTEFSWSwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIChJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEUgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLFxuICogREFUQSwgT1IgUFJPRklUUzsgT1IgQlVTSU5FU1MgSU5URVJSVVBUSU9OKSBIT1dFVkVSIENBVVNFRCBBTkQgT04gQU5ZXG4gKiBUSEVPUlkgT0YgTElBQklMSVRZLCBXSEVUSEVSIElOIENPTlRSQUNULCBTVFJJQ1QgTElBQklMSVRZLCBPUiBUT1JUXG4gKiAoSU5DTFVESU5HIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0VcbiAqIE9GIFRISVMgU09GVFdBUkUsIEVWRU4gSUYgQURWSVNFRCBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKi9cblxuZGVmaW5lKCd0d2dsL3R3Z2wnLFtcbiAgICAnLi9hdHRyaWJ1dGVzJyxcbiAgICAnLi9kcmF3JyxcbiAgICAnLi9mcmFtZWJ1ZmZlcnMnLFxuICAgICcuL3Byb2dyYW1zJyxcbiAgICAnLi90ZXh0dXJlcycsXG4gICAgJy4vdHlwZWRhcnJheXMnLFxuICBdLCBmdW5jdGlvbiAoXG4gICAgYXR0cmlidXRlcyxcbiAgICBkcmF3LFxuICAgIGZyYW1lYnVmZmVycyxcbiAgICBwcm9ncmFtcyxcbiAgICB0ZXh0dXJlcyxcbiAgICB0eXBlZEFycmF5cykge1xuICBcblxuICAvKipcbiAgICogVGhlIG1haW4gVFdHTCBtb2R1bGUuXG4gICAqXG4gICAqIEBtb2R1bGUgdHdnbFxuICAgKi9cblxuICAvLyBtYWtlIHN1cmUgd2UgZG9uJ3Qgc2VlIGEgZ2xvYmFsIGdsXG4gIHZhciBnbCA9IHVuZGVmaW5lZDsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAvKipcbiAgICogVmFyaW91cyBkZWZhdWx0IHNldHRpbmdzIGZvciB0d2dsLlxuICAgKlxuICAgKiBOb3RlOiBZb3UgY2FuIGNhbGwgdGhpcyBhbnkgbnVtYmVyIG9mIHRpbWVzLiBFeGFtcGxlOlxuICAgKlxuICAgKiAgICAgdHdnbC5zZXREZWZhdWx0cyh7IHRleHR1cmVDb2xvcjogWzEsIDAsIDAsIDFdIH0pO1xuICAgKiAgICAgdHdnbC5zZXREZWZhdWx0cyh7IGF0dHJpYlByZWZpeDogJ2FfJyB9KTtcbiAgICpcbiAgICogaXMgZXF1aXZhbGVudCB0b1xuICAgKlxuICAgKiAgICAgdHdnbC5zZXREZWZhdWx0cyh7XG4gICAqICAgICAgIHRleHR1cmVDb2xvcjogWzEsIDAsIDAsIDFdLFxuICAgKiAgICAgICBhdHRyaWJQcmVmaXg6ICdhXycsXG4gICAqICAgICB9KTtcbiAgICpcbiAgICogQHR5cGVkZWYge09iamVjdH0gRGVmYXVsdHNcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IGF0dHJpYlByZWZpeCBUaGUgcHJlZml4IHRvIHN0aWNrIG9uIGF0dHJpYnV0ZXNcbiAgICpcbiAgICogICBXaGVuIHdyaXRpbmcgc2hhZGVycyBJIHByZWZlciB0byBuYW1lIGF0dHJpYnV0ZXMgd2l0aCBgYV9gLCB1bmlmb3JtcyB3aXRoIGB1X2AgYW5kIHZhcnlpbmdzIHdpdGggYHZfYFxuICAgKiAgIGFzIGl0IG1ha2VzIGl0IGNsZWFyIHdoZXJlIHRoZXkgY2FtZSBmcm9tLiBCdXQsIHdoZW4gYnVpbGRpbmcgZ2VvbWV0cnkgSSBwcmVmZXIgdXNpbmcgdW5wcmVmaXhlZCBuYW1lcy5cbiAgICpcbiAgICogICBJbiBvdGhlcndvcmRzIEknbGwgY3JlYXRlIGFycmF5cyBvZiBnZW9tZXRyeSBsaWtlIHRoaXNcbiAgICpcbiAgICogICAgICAgdmFyIGFycmF5cyA9IHtcbiAgICogICAgICAgICBwb3NpdGlvbjogLi4uXG4gICAqICAgICAgICAgbm9ybWFsOiAuLi5cbiAgICogICAgICAgICB0ZXhjb29yZDogLi4uXG4gICAqICAgICAgIH07XG4gICAqXG4gICAqICAgQnV0IG5lZWQgdGhvc2UgbWFwcGVkIHRvIGF0dHJpYnV0ZXMgYW5kIG15IGF0dHJpYnV0ZXMgc3RhcnQgd2l0aCBgYV9gLlxuICAgKlxuICAgKiAgIERlZmF1bHQ6IGBcIlwiYFxuICAgKlxuICAgKiBAcHJvcGVydHkge251bWJlcltdfSB0ZXh0dXJlQ29sb3IgQXJyYXkgb2YgNCB2YWx1ZXMgaW4gdGhlIHJhbmdlIDAgdG8gMVxuICAgKlxuICAgKiAgIFRoZSBkZWZhdWx0IHRleHR1cmUgY29sb3IgaXMgdXNlZCB3aGVuIGxvYWRpbmcgdGV4dHVyZXMgZnJvbVxuICAgKiAgIHVybHMuIEJlY2F1c2UgdGhlIFVSTCB3aWxsIGJlIGxvYWRlZCBhc3luYyB3ZSdkIGxpa2UgdG8gYmVcbiAgICogICBhYmxlIHRvIHVzZSB0aGUgdGV4dHVyZSBpbW1lZGlhdGVseS4gQnkgcHV0dGluZyBhIDF4MSBwaXhlbFxuICAgKiAgIGNvbG9yIGluIHRoZSB0ZXh0dXJlIHdlIGNhbiBzdGFydCB1c2luZyB0aGUgdGV4dHVyZSBiZWZvcmVcbiAgICogICB0aGUgVVJMIGhhcyBsb2FkZWQuXG4gICAqXG4gICAqICAgRGVmYXVsdDogYFswLjUsIDAuNzUsIDEsIDFdYFxuICAgKlxuICAgKiBAcHJvcGVydHkge3N0cmluZ30gY3Jvc3NPcmlnaW5cbiAgICpcbiAgICogICBJZiBub3QgdW5kZWZpbmVkIHNldHMgdGhlIGNyb3NzT3JpZ2luIGF0dHJpYnV0ZSBvbiBpbWFnZXNcbiAgICogICB0aGF0IHR3Z2wgY3JlYXRlcyB3aGVuIGRvd25sb2FkaW5nIGltYWdlcyBmb3IgdGV4dHVyZXMuXG4gICAqXG4gICAqICAgQWxzbyBzZWUge0BsaW5rIG1vZHVsZTp0d2dsLlRleHR1cmVPcHRpb25zfS5cbiAgICpcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuXG4gIC8qKlxuICAgKiBTZXRzIHZhcmlvdXMgZGVmYXVsdHMgZm9yIHR3Z2wuXG4gICAqXG4gICAqIEluIHRoZSBpbnRlcmVzdCBvZiB0ZXJzZW5lc3Mgd2hpY2ggaXMga2luZCBvZiB0aGUgcG9pbnRcbiAgICogb2YgdHdnbCBJJ3ZlIGludGVncmF0ZWQgYSBmZXcgb2YgdGhlIG9sZGVyIGZ1bmN0aW9ucyBoZXJlXG4gICAqXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wuRGVmYXVsdHN9IG5ld0RlZmF1bHRzIFRoZSBkZWZhdWx0IHNldHRpbmdzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIHNldERlZmF1bHRzKG5ld0RlZmF1bHRzKSB7XG4gICAgYXR0cmlidXRlcy5zZXREZWZhdWx0c18obmV3RGVmYXVsdHMpOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIHRleHR1cmVzLnNldERlZmF1bHRzXyhuZXdEZWZhdWx0cyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIHdlYmdsIGNvbnRleHQuXG4gICAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhcyBUaGUgY2FudmFzIHRhZyB0byBnZXRcbiAgICogICAgIGNvbnRleHQgZnJvbS4gSWYgb25lIGlzIG5vdCBwYXNzZWQgaW4gb25lIHdpbGwgYmVcbiAgICogICAgIGNyZWF0ZWQuXG4gICAqIEByZXR1cm4ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gVGhlIGNyZWF0ZWQgY29udGV4dC5cbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZTNEQ29udGV4dChjYW52YXMsIG9wdF9hdHRyaWJzKSB7XG4gICAgdmFyIG5hbWVzID0gW1wid2ViZ2xcIiwgXCJleHBlcmltZW50YWwtd2ViZ2xcIl07XG4gICAgdmFyIGNvbnRleHQgPSBudWxsO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBuYW1lcy5sZW5ndGg7ICsraWkpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChuYW1lc1tpaV0sIG9wdF9hdHRyaWJzKTtcbiAgICAgIH0gY2F0Y2goZSkge30gIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgV2ViR0wgY29udGV4dC5cbiAgICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzIGEgY2FudmFzIGVsZW1lbnQuXG4gICAqIEBwYXJhbSB7V2ViR0xDb250ZXh0Q3JlYXRpb25BdHRpcmJ1dGVzfSBbb3B0X2F0dHJpYnNdIG9wdGlvbmFsIHdlYmdsIGNvbnRleHQgY3JlYXRpb24gYXR0cmlidXRlc1xuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIGdldFdlYkdMQ29udGV4dChjYW52YXMsIG9wdF9hdHRyaWJzKSB7XG4gICAgdmFyIGdsID0gY3JlYXRlM0RDb250ZXh0KGNhbnZhcywgb3B0X2F0dHJpYnMpO1xuICAgIHJldHVybiBnbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNpemUgYSBjYW52YXMgdG8gbWF0Y2ggdGhlIHNpemUgaXQncyBkaXNwbGF5ZWQuXG4gICAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhcyBUaGUgY2FudmFzIHRvIHJlc2l6ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFthXSBtdWx0aXBsaWVyLiBTbyB5b3UgY2FuIHBhc3MgaW4gYHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvYCBpZiB5b3Ugd2FudCB0by5cbiAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY2FudmFzIHdhcyByZXNpemVkLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2xcbiAgICovXG4gIGZ1bmN0aW9uIHJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoY2FudmFzLCBtdWx0aXBsaWVyKSB7XG4gICAgbXVsdGlwbGllciA9IG11bHRpcGxpZXIgfHwgMTtcbiAgICBtdWx0aXBsaWVyID0gTWF0aC5tYXgoMSwgbXVsdGlwbGllcik7XG4gICAgdmFyIHdpZHRoICA9IGNhbnZhcy5jbGllbnRXaWR0aCAgKiBtdWx0aXBsaWVyIHwgMDtcbiAgICB2YXIgaGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodCAqIG11bHRpcGxpZXIgfCAwO1xuICAgIGlmIChjYW52YXMud2lkdGggIT09IHdpZHRoIHx8XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgIT09IGhlaWdodCkge1xuICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFVzaW5nIHF1b3RlcyBwcmV2ZW50cyBVZ2xpZnkgZnJvbSBjaGFuZ2luZyB0aGUgbmFtZXMuXG4gIC8vIE5vIHNwZWVkIGRpZmYgQUZBSUNULlxuICB2YXIgYXBpID0ge1xuICAgIFwiZ2V0V2ViR0xDb250ZXh0XCI6IGdldFdlYkdMQ29udGV4dCxcbiAgICBcInJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemVcIjogcmVzaXplQ2FudmFzVG9EaXNwbGF5U2l6ZSxcbiAgICBcInNldERlZmF1bHRzXCI6IHNldERlZmF1bHRzLFxuICB9O1xuXG4gIGZ1bmN0aW9uIG5vdFByaXZhdGUobmFtZSkge1xuICAgIHJldHVybiBuYW1lW25hbWUubGVuZ3RoIC0gMV0gIT09ICdfJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvcHlQdWJsaWNQcm9wZXJ0aWVzKHNyYywgZHN0KSB7XG4gICAgT2JqZWN0LmtleXMoc3JjKS5maWx0ZXIobm90UHJpdmF0ZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIGRzdFtrZXldID0gc3JjW2tleV07XG4gICAgfSk7XG4gIH1cblxuICBbXG4gICAgYXR0cmlidXRlcyxcbiAgICBkcmF3LFxuICAgIGZyYW1lYnVmZmVycyxcbiAgICBwcm9ncmFtcyxcbiAgICB0ZXh0dXJlcyxcbiAgICB0eXBlZEFycmF5cyxcbiAgXS5mb3JFYWNoKGZ1bmN0aW9uKHNyYykge1xuICAgIGNvcHlQdWJsaWNQcm9wZXJ0aWVzKHNyYywgYXBpKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGFwaTtcblxufSk7XG5cblxuLypcbiAqIENvcHlyaWdodCAyMDE1LCBHcmVnZyBUYXZhcmVzLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmVcbiAqIG1ldDpcbiAqXG4gKiAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodFxuICogbm90aWNlLCB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogICAgICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZVxuICogY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lclxuICogaW4gdGhlIGRvY3VtZW50YXRpb24gYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZVxuICogZGlzdHJpYnV0aW9uLlxuICogICAgICogTmVpdGhlciB0aGUgbmFtZSBvZiBHcmVnZyBUYXZhcmVzLiBub3IgdGhlIG5hbWVzIG9mIGhpc1xuICogY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb21cbiAqIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SU1xuICogXCJBUyBJU1wiIEFORCBBTlkgRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgVEhFIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SXG4gKiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBUkUgRElTQ0xBSU1FRC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIENPUFlSSUdIVFxuICogT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsXG4gKiBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWVxuICogVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVFxuICogKElOQ0xVRElORyBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFXG4gKiBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICovXG5cbmRlZmluZSgndHdnbC92MycsW10sIGZ1bmN0aW9uICgpIHtcbiAgXG5cbiAgLyoqXG4gICAqXG4gICAqIFZlYzMgbWF0aCBtYXRoIGZ1bmN0aW9ucy5cbiAgICpcbiAgICogQWxtb3N0IGFsbCBmdW5jdGlvbnMgdGFrZSBhbiBvcHRpb25hbCBgZHN0YCBhcmd1bWVudC4gSWYgaXQgaXMgbm90IHBhc3NlZCBpbiB0aGVcbiAgICogZnVuY3Rpb25zIHdpbGwgY3JlYXRlIGEgbmV3IFZlYzMuIEluIG90aGVyIHdvcmRzIHlvdSBjYW4gZG8gdGhpc1xuICAgKlxuICAgKiAgICAgdmFyIHYgPSB2My5jcm9zcyh2MSwgdjIpOyAgLy8gQ3JlYXRlcyBhIG5ldyBWZWMzIHdpdGggdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdjEgeCB2Mi5cbiAgICpcbiAgICogb3JcbiAgICpcbiAgICogICAgIHZhciB2MyA9IHYzLmNyZWF0ZSgpO1xuICAgKiAgICAgdjMuY3Jvc3ModjEsIHYyLCB2KTsgIC8vIFB1dHMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdjEgeCB2MiBpbiB2XG4gICAqXG4gICAqIFRoZSBmaXJzdCBzdHlsZSBpcyBvZnRlbiBlYXNpZXIgYnV0IGRlcGVuZGluZyBvbiB3aGVyZSBpdCdzIHVzZWQgaXQgZ2VuZXJhdGVzIGdhcmJhZ2Ugd2hlcmVcbiAgICogYXMgdGhlcmUgaXMgYWxtb3N0IG5ldmVyIGFsbG9jYXRpb24gd2l0aCB0aGUgc2Vjb25kIHN0eWxlLlxuICAgKlxuICAgKiBJdCBpcyBhbHdheXMgc2F2ZSB0byBwYXNzIGFueSB2ZWN0b3IgYXMgdGhlIGRlc3RpbmF0aW9uLiBTbyBmb3IgZXhhbXBsZVxuICAgKlxuICAgKiAgICAgdjMuY3Jvc3ModjEsIHYyLCB2MSk7ICAvLyBQdXRzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHYxIHggdjIgaW4gdjFcbiAgICpcbiAgICogQG1vZHVsZSB0d2dsL3YzXG4gICAqL1xuXG4gIHZhciBWZWNUeXBlID0gRmxvYXQzMkFycmF5O1xuXG4gIC8qKlxuICAgKiBBIEphdmFTY3JpcHQgYXJyYXkgd2l0aCAzIHZhbHVlcyBvciBhIEZsb2F0MzJBcnJheSB3aXRoIDMgdmFsdWVzLlxuICAgKiBXaGVuIGNyZWF0ZWQgYnkgdGhlIGxpYnJhcnkgd2lsbCBjcmVhdGUgdGhlIGRlZmF1bHQgdHlwZSB3aGljaCBpcyBgRmxvYXQzMkFycmF5YFxuICAgKiBidXQgY2FuIGJlIHNldCBieSBjYWxsaW5nIHtAbGluayBtb2R1bGU6dHdnbC92My5zZXREZWZhdWx0VHlwZX0uXG4gICAqIEB0eXBlZGVmIHsobnVtYmVyW118RmxvYXQzMkFycmF5KX0gVmVjM1xuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvdjNcbiAgICovXG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHR5cGUgdGhpcyBsaWJyYXJ5IGNyZWF0ZXMgZm9yIGEgVmVjM1xuICAgKiBAcGFyYW0ge2NvbnN0cnVjdG9yfSBjdG9yIHRoZSBjb25zdHJ1Y3RvciBmb3IgdGhlIHR5cGUuIEVpdGhlciBgRmxvYXQzMkFycmF5YCBvciBgQXJyYXlgXG4gICAqL1xuICBmdW5jdGlvbiBzZXREZWZhdWx0VHlwZShjdG9yKSB7XG4gICAgICBWZWNUeXBlID0gY3RvcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgdmVjMzsgbWF5IGJlIGNhbGxlZCB3aXRoIHgsIHksIHogdG8gc2V0IGluaXRpYWwgdmFsdWVzLlxuICAgKiBAcmV0dXJuIHtWZWMzfSB0aGUgY3JlYXRlZCB2ZWN0b3JcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGUoeCwgeSwgeikge1xuICAgIHZhciBkc3QgPSBuZXcgVmVjVHlwZSgzKTtcbiAgICBpZiAoeCkge1xuICAgICAgZHN0WzBdID0geDtcbiAgICB9XG4gICAgaWYgKHkpIHtcbiAgICAgIGRzdFsxXSA9IHk7XG4gICAgfVxuICAgIGlmICh6KSB7XG4gICAgICBkc3RbMl0gPSB6O1xuICAgIH1cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdHdvIHZlY3RvcnM7IGFzc3VtZXMgYSBhbmQgYiBoYXZlIHRoZSBzYW1lIGRpbWVuc2lvbi5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBhIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGIgT3BlcmFuZCB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gW2RzdF0gdmVjdG9yIHRvIGhvbGQgcmVzdWx0LiBJZiBub3QgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBhZGQoYSwgYiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBWZWNUeXBlKDMpO1xuXG4gICAgZHN0WzBdID0gYVswXSArIGJbMF07XG4gICAgZHN0WzFdID0gYVsxXSArIGJbMV07XG4gICAgZHN0WzJdID0gYVsyXSArIGJbMl07XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YnRyYWN0cyB0d28gdmVjdG9ycy5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBhIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGIgT3BlcmFuZCB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gW2RzdF0gdmVjdG9yIHRvIGhvbGQgcmVzdWx0LiBJZiBub3QgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBzdWJ0cmFjdChhLCBiLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IFZlY1R5cGUoMyk7XG5cbiAgICBkc3RbMF0gPSBhWzBdIC0gYlswXTtcbiAgICBkc3RbMV0gPSBhWzFdIC0gYlsxXTtcbiAgICBkc3RbMl0gPSBhWzJdIC0gYlsyXTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgbGluZWFyIGludGVycG9sYXRpb24gb24gdHdvIHZlY3RvcnMuXG4gICAqIEdpdmVuIHZlY3RvcnMgYSBhbmQgYiBhbmQgaW50ZXJwb2xhdGlvbiBjb2VmZmljaWVudCB0LCByZXR1cm5zXG4gICAqICgxIC0gdCkgKiBhICsgdCAqIGIuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gYSBPcGVyYW5kIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBiIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdCBJbnRlcnBvbGF0aW9uIGNvZWZmaWNpZW50LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFtkc3RdIHZlY3RvciB0byBob2xkIHJlc3VsdC4gSWYgbm90IG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC92M1xuICAgKi9cbiAgZnVuY3Rpb24gbGVycChhLCBiLCB0LCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IFZlY1R5cGUoMyk7XG5cbiAgICBkc3RbMF0gPSAoMSAtIHQpICogYVswXSArIHQgKiBiWzBdO1xuICAgIGRzdFsxXSA9ICgxIC0gdCkgKiBhWzFdICsgdCAqIGJbMV07XG4gICAgZHN0WzJdID0gKDEgLSB0KSAqIGFbMl0gKyB0ICogYlsyXTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogTXV0aXBsaWVzIGEgdmVjdG9yIGJ5IGEgc2NhbGFyLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IHYgVGhlIHZlY3Rvci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGsgVGhlIHNjYWxhci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBbZHN0XSB2ZWN0b3IgdG8gaG9sZCByZXN1bHQuIElmIG5vdCBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC92My5WZWMzfSBkc3QuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC92M1xuICAgKi9cbiAgZnVuY3Rpb24gbXVsU2NhbGFyKHYsIGssIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgVmVjVHlwZSgzKTtcblxuICAgIGRzdFswXSA9IHZbMF0gKiBrO1xuICAgIGRzdFsxXSA9IHZbMV0gKiBrO1xuICAgIGRzdFsyXSA9IHZbMl0gKiBrO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXZpZGVzIGEgdmVjdG9yIGJ5IGEgc2NhbGFyLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IHYgVGhlIHZlY3Rvci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGsgVGhlIHNjYWxhci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBbZHN0XSB2ZWN0b3IgdG8gaG9sZCByZXN1bHQuIElmIG5vdCBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC92My5WZWMzfSBkc3QuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC92M1xuICAgKi9cbiAgZnVuY3Rpb24gZGl2U2NhbGFyKHYsIGssIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgVmVjVHlwZSgzKTtcblxuICAgIGRzdFswXSA9IHZbMF0gLyBrO1xuICAgIGRzdFsxXSA9IHZbMV0gLyBrO1xuICAgIGRzdFsyXSA9IHZbMl0gLyBrO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjdG9yczsgYXNzdW1lcyBib3RoIHZlY3RvcnMgaGF2ZVxuICAgKiB0aHJlZSBlbnRyaWVzLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGEgT3BlcmFuZCB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gYiBPcGVyYW5kIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBbZHN0XSB2ZWN0b3IgdG8gaG9sZCByZXN1bHQuIElmIG5vdCBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC92My5WZWMzfSBUaGUgdmVjdG9yIGEgY3Jvc3MgYi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBjcm9zcyhhLCBiLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IFZlY1R5cGUoMyk7XG5cbiAgICBkc3RbMF0gPSBhWzFdICogYlsyXSAtIGFbMl0gKiBiWzFdO1xuICAgIGRzdFsxXSA9IGFbMl0gKiBiWzBdIC0gYVswXSAqIGJbMl07XG4gICAgZHN0WzJdID0gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWN0b3JzOyBhc3N1bWVzIGJvdGggdmVjdG9ycyBoYXZlXG4gICAqIHRocmVlIGVudHJpZXMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gYSBPcGVyYW5kIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBiIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IGRvdCBwcm9kdWN0XG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC92M1xuICAgKi9cbiAgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgICByZXR1cm4gKGFbMF0gKiBiWzBdKSArIChhWzFdICogYlsxXSkgKyAoYVsyXSAqIGJbMl0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIHRoZSBsZW5ndGggb2YgdmVjdG9yXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gdiB2ZWN0b3IuXG4gICAqIEByZXR1cm4ge251bWJlcn0gbGVuZ3RoIG9mIHZlY3Rvci5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBsZW5ndGgodikge1xuICAgIHJldHVybiBNYXRoLnNxcnQodlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSArIHZbMl0gKiB2WzJdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyB0aGUgc3F1YXJlIG9mIHRoZSBsZW5ndGggb2YgdmVjdG9yXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gdiB2ZWN0b3IuXG4gICAqIEByZXR1cm4ge251bWJlcn0gc3F1YXJlIG9mIHRoZSBsZW5ndGggb2YgdmVjdG9yLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvdjNcbiAgICovXG4gIGZ1bmN0aW9uIGxlbmd0aFNxKHYpIHtcbiAgICByZXR1cm4gdlswXSAqIHZbMF0gKyB2WzFdICogdlsxXSArIHZbMl0gKiB2WzJdO1xuICB9XG5cbiAgLyoqXG4gICAqIERpdmlkZXMgYSB2ZWN0b3IgYnkgaXRzIEV1Y2xpZGVhbiBsZW5ndGggYW5kIHJldHVybnMgdGhlIHF1b3RpZW50LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IGEgVGhlIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBbZHN0XSB2ZWN0b3IgdG8gaG9sZCByZXN1bHQuIElmIG5vdCBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC92My5WZWMzfSBUaGUgbm9ybWFsaXplZCB2ZWN0b3IuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC92M1xuICAgKi9cbiAgZnVuY3Rpb24gbm9ybWFsaXplKGEsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgVmVjVHlwZSgzKTtcblxuICAgIHZhciBsZW5TcSA9IGFbMF0gKiBhWzBdICsgYVsxXSAqIGFbMV0gKyBhWzJdICogYVsyXTtcbiAgICB2YXIgbGVuID0gTWF0aC5zcXJ0KGxlblNxKTtcbiAgICBpZiAobGVuID4gMC4wMDAwMSkge1xuICAgICAgZHN0WzBdID0gYVswXSAvIGxlbjtcbiAgICAgIGRzdFsxXSA9IGFbMV0gLyBsZW47XG4gICAgICBkc3RbMl0gPSBhWzJdIC8gbGVuO1xuICAgIH0gZWxzZSB7XG4gICAgICBkc3RbMF0gPSAwO1xuICAgICAgZHN0WzFdID0gMDtcbiAgICAgIGRzdFsyXSA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBOZWdhdGVzIGEgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IHYgVGhlIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBbZHN0XSB2ZWN0b3IgdG8gaG9sZCByZXN1bHQuIElmIG5vdCBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC92My5WZWMzfSAtdi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBuZWdhdGUodiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBWZWNUeXBlKDMpO1xuXG4gICAgZHN0WzBdID0gLXZbMF07XG4gICAgZHN0WzFdID0gLXZbMV07XG4gICAgZHN0WzJdID0gLXZbMl07XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyBhIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSB2IFRoZSB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gW2RzdF0gdmVjdG9yIHRvIGhvbGQgcmVzdWx0LiBJZiBub3QgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gQSBjb3B5IG9mIHYuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC92M1xuICAgKi9cbiAgZnVuY3Rpb24gY29weSh2LCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IFZlY1R5cGUoMyk7XG5cbiAgICBkc3RbMF0gPSB2WzBdO1xuICAgIGRzdFsxXSA9IHZbMV07XG4gICAgZHN0WzJdID0gdlsyXTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbGllcyBhIHZlY3RvciBieSBhbm90aGVyIHZlY3RvciAoY29tcG9uZW50LXdpc2UpOyBhc3N1bWVzIGEgYW5kXG4gICAqIGIgaGF2ZSB0aGUgc2FtZSBsZW5ndGguXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gYSBPcGVyYW5kIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBiIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFtkc3RdIHZlY3RvciB0byBob2xkIHJlc3VsdC4gSWYgbm90IG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFRoZSB2ZWN0b3Igb2YgcHJvZHVjdHMgb2YgZW50cmllcyBvZiBhIGFuZFxuICAgKiAgICAgYi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3YzXG4gICAqL1xuICBmdW5jdGlvbiBtdWx0aXBseShhLCBiLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IFZlY1R5cGUoMyk7XG5cbiAgICBkc3RbMF0gPSBhWzBdICogYlswXTtcbiAgICBkc3RbMV0gPSBhWzFdICogYlsxXTtcbiAgICBkc3RbMl0gPSBhWzJdICogYlsyXTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogRGl2aWRlcyBhIHZlY3RvciBieSBhbm90aGVyIHZlY3RvciAoY29tcG9uZW50LXdpc2UpOyBhc3N1bWVzIGEgYW5kXG4gICAqIGIgaGF2ZSB0aGUgc2FtZSBsZW5ndGguXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvdjMuVmVjM30gYSBPcGVyYW5kIHZlY3Rvci5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC92My5WZWMzfSBiIE9wZXJhbmQgdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFtkc3RdIHZlY3RvciB0byBob2xkIHJlc3VsdC4gSWYgbm90IG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL3YzLlZlYzN9IFRoZSB2ZWN0b3Igb2YgcXVvdGllbnRzIG9mIGVudHJpZXMgb2YgYSBhbmRcbiAgICogICAgIGIuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC92M1xuICAgKi9cbiAgZnVuY3Rpb24gZGl2aWRlKGEsIGIsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgVmVjVHlwZSgzKTtcblxuICAgIGRzdFswXSA9IGFbMF0gLyBiWzBdO1xuICAgIGRzdFsxXSA9IGFbMV0gLyBiWzFdO1xuICAgIGRzdFsyXSA9IGFbMl0gLyBiWzJdO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8vIFVzaW5nIHF1b3RlcyBwcmV2ZW50cyBVZ2xpZnkgZnJvbSBjaGFuZ2luZyB0aGUgbmFtZXMuXG4gIC8vIE5vIHNwZWVkIGRpZmYgQUZBSUNULlxuICByZXR1cm4ge1xuICAgIFwiYWRkXCI6IGFkZCxcbiAgICBcImNvcHlcIjogY29weSxcbiAgICBcImNyZWF0ZVwiOiBjcmVhdGUsXG4gICAgXCJjcm9zc1wiOiBjcm9zcyxcbiAgICBcImRpdmlkZVwiOiBkaXZpZGUsXG4gICAgXCJkaXZTY2FsYXJcIjogZGl2U2NhbGFyLFxuICAgIFwiZG90XCI6IGRvdCxcbiAgICBcImxlcnBcIjogbGVycCxcbiAgICBcImxlbmd0aFwiOiBsZW5ndGgsXG4gICAgXCJsZW5ndGhTcVwiOiBsZW5ndGhTcSxcbiAgICBcIm11bFNjYWxhclwiOiBtdWxTY2FsYXIsXG4gICAgXCJtdWx0aXBseVwiOiBtdWx0aXBseSxcbiAgICBcIm5lZ2F0ZVwiOiBuZWdhdGUsXG4gICAgXCJub3JtYWxpemVcIjogbm9ybWFsaXplLFxuICAgIFwic2V0RGVmYXVsdFR5cGVcIjogc2V0RGVmYXVsdFR5cGUsXG4gICAgXCJzdWJ0cmFjdFwiOiBzdWJ0cmFjdCxcbiAgfTtcblxufSk7XG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSwgR3JlZ2cgVGF2YXJlcy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG5kZWZpbmUoJ3R3Z2wvbTQnLFsnLi92MyddLCBmdW5jdGlvbiAodjMpIHtcbiAgXG5cbiAgLyoqXG4gICAqIDR4NCBNYXRyaXggbWF0aCBtYXRoIGZ1bmN0aW9ucy5cbiAgICpcbiAgICogQWxtb3N0IGFsbCBmdW5jdGlvbnMgdGFrZSBhbiBvcHRpb25hbCBgZHN0YCBhcmd1bWVudC4gSWYgaXQgaXMgbm90IHBhc3NlZCBpbiB0aGVcbiAgICogZnVuY3Rpb25zIHdpbGwgY3JlYXRlIGEgbmV3IG1hdHJpeC4gSW4gb3RoZXIgd29yZHMgeW91IGNhbiBkbyB0aGlzXG4gICAqXG4gICAqICAgICB2YXIgbWF0ID0gbTQudHJhbnNsYXRpb24oWzEsIDIsIDNdKTsgIC8vIENyZWF0ZXMgYSBuZXcgdHJhbnNsYXRpb24gbWF0cml4XG4gICAqXG4gICAqIG9yXG4gICAqXG4gICAqICAgICB2YXIgbWF0ID0gbTQuY3JlYXRlKCk7XG4gICAqICAgICBtNC50cmFuc2xhdGlvbihbMSwgMiwgM10sIG1hdCk7ICAvLyBQdXRzIHRyYW5zbGF0aW9uIG1hdHJpeCBpbiBtYXQuXG4gICAqXG4gICAqIFRoZSBmaXJzdCBzdHlsZSBpcyBvZnRlbiBlYXNpZXIgYnV0IGRlcGVuZGluZyBvbiB3aGVyZSBpdCdzIHVzZWQgaXQgZ2VuZXJhdGVzIGdhcmJhZ2Ugd2hlcmVcbiAgICogYXMgdGhlcmUgaXMgYWxtb3N0IG5ldmVyIGFsbG9jYXRpb24gd2l0aCB0aGUgc2Vjb25kIHN0eWxlLlxuICAgKlxuICAgKiBJdCBpcyBhbHdheXMgc2F2ZSB0byBwYXNzIGFueSBtYXRyaXggYXMgdGhlIGRlc3RpbmF0aW9uLiBTbyBmb3IgZXhhbXBsZVxuICAgKlxuICAgKiAgICAgdmFyIG1hdCA9IG00LmlkZW50aXR5KCk7XG4gICAqICAgICB2YXIgdHJhbnMgPSBtNC50cmFuc2xhdGlvbihbMSwgMiwgM10pO1xuICAgKiAgICAgbTQubXVsdGlwbHkobWF0LCB0cmFucywgbWF0KTsgIC8vIE11bHRpcGxpZXMgbWF0ICogdHJhbnMgYW5kIHB1dHMgcmVzdWx0IGluIG1hdC5cbiAgICpcbiAgICogQG1vZHVsZSB0d2dsL200XG4gICAqL1xuICB2YXIgTWF0VHlwZSA9IEZsb2F0MzJBcnJheTtcblxuICB2YXIgdGVtcFYzYSA9IHYzLmNyZWF0ZSgpO1xuICB2YXIgdGVtcFYzYiA9IHYzLmNyZWF0ZSgpO1xuICB2YXIgdGVtcFYzYyA9IHYzLmNyZWF0ZSgpO1xuXG4gIC8qKlxuICAgKiBBIEphdmFTY3JpcHQgYXJyYXkgd2l0aCAxNiB2YWx1ZXMgb3IgYSBGbG9hdDMyQXJyYXkgd2l0aCAxNiB2YWx1ZXMuXG4gICAqIFdoZW4gY3JlYXRlZCBieSB0aGUgbGlicmFyeSB3aWxsIGNyZWF0ZSB0aGUgZGVmYXVsdCB0eXBlIHdoaWNoIGlzIGBGbG9hdDMyQXJyYXlgXG4gICAqIGJ1dCBjYW4gYmUgc2V0IGJ5IGNhbGxpbmcge0BsaW5rIG1vZHVsZTp0d2dsL200LnNldERlZmF1bHRUeXBlfS5cbiAgICogQHR5cGVkZWYgeyhudW1iZXJbXXxGbG9hdDMyQXJyYXkpfSBNYXQ0XG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cblxuICAvKipcbiAgICogU2V0cyB0aGUgdHlwZSB0aGlzIGxpYnJhcnkgY3JlYXRlcyBmb3IgYSBNYXQ0XG4gICAqIEBwYXJhbSB7Y29uc3RydWN0b3J9IGN0b3IgdGhlIGNvbnN0cnVjdG9yIGZvciB0aGUgdHlwZS4gRWl0aGVyIGBGbG9hdDMyQXJyYXlgIG9yIGBBcnJheWBcbiAgICovXG4gIGZ1bmN0aW9uIHNldERlZmF1bHRUeXBlKGN0b3IpIHtcbiAgICAgIFZlY1R5cGUgPSBjdG9yO1xuICB9XG5cbiAgLyoqXG4gICAqIE5lZ2F0ZXMgYSBtYXRyaXguXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSAtbS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBuZWdhdGUobSwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIGRzdFsgMF0gPSAtbVsgMF07XG4gICAgZHN0WyAxXSA9IC1tWyAxXTtcbiAgICBkc3RbIDJdID0gLW1bIDJdO1xuICAgIGRzdFsgM10gPSAtbVsgM107XG4gICAgZHN0WyA0XSA9IC1tWyA0XTtcbiAgICBkc3RbIDVdID0gLW1bIDVdO1xuICAgIGRzdFsgNl0gPSAtbVsgNl07XG4gICAgZHN0WyA3XSA9IC1tWyA3XTtcbiAgICBkc3RbIDhdID0gLW1bIDhdO1xuICAgIGRzdFsgOV0gPSAtbVsgOV07XG4gICAgZHN0WzEwXSA9IC1tWzEwXTtcbiAgICBkc3RbMTFdID0gLW1bMTFdO1xuICAgIGRzdFsxMl0gPSAtbVsxMl07XG4gICAgZHN0WzEzXSA9IC1tWzEzXTtcbiAgICBkc3RbMTRdID0gLW1bMTRdO1xuICAgIGRzdFsxNV0gPSAtbVsxNV07XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvcGllcyBhIG1hdHJpeC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXguXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gVGhlIG1hdHJpeC5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gQSBjb3B5IG9mIG0uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gY29weShtLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgZHN0WyAwXSA9IG1bIDBdO1xuICAgIGRzdFsgMV0gPSBtWyAxXTtcbiAgICBkc3RbIDJdID0gbVsgMl07XG4gICAgZHN0WyAzXSA9IG1bIDNdO1xuICAgIGRzdFsgNF0gPSBtWyA0XTtcbiAgICBkc3RbIDVdID0gbVsgNV07XG4gICAgZHN0WyA2XSA9IG1bIDZdO1xuICAgIGRzdFsgN10gPSBtWyA3XTtcbiAgICBkc3RbIDhdID0gbVsgOF07XG4gICAgZHN0WyA5XSA9IG1bIDldO1xuICAgIGRzdFsxMF0gPSBtWzEwXTtcbiAgICBkc3RbMTFdID0gbVsxMV07XG4gICAgZHN0WzEyXSA9IG1bMTJdO1xuICAgIGRzdFsxM10gPSBtWzEzXTtcbiAgICBkc3RbMTRdID0gbVsxNF07XG4gICAgZHN0WzE1XSA9IG1bMTVdO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIG4tYnktbiBpZGVudGl0eSBtYXRyaXguXG4gICAqXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IEFuIG4tYnktbiBpZGVudGl0eSBtYXRyaXguXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gaWRlbnRpdHkoZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIGRzdFsgMF0gPSAxO1xuICAgIGRzdFsgMV0gPSAwO1xuICAgIGRzdFsgMl0gPSAwO1xuICAgIGRzdFsgM10gPSAwO1xuICAgIGRzdFsgNF0gPSAwO1xuICAgIGRzdFsgNV0gPSAxO1xuICAgIGRzdFsgNl0gPSAwO1xuICAgIGRzdFsgN10gPSAwO1xuICAgIGRzdFsgOF0gPSAwO1xuICAgIGRzdFsgOV0gPSAwO1xuICAgIGRzdFsxMF0gPSAxO1xuICAgIGRzdFsxMV0gPSAwO1xuICAgIGRzdFsxMl0gPSAwO1xuICAgIGRzdFsxM10gPSAwO1xuICAgIGRzdFsxNF0gPSAwO1xuICAgIGRzdFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyB0aGUgdHJhbnNwb3NlIG9mIGEgbWF0cml4LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gVGhlIHRyYW5zcG9zZSBvZiBtLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gICBmdW5jdGlvbiB0cmFuc3Bvc2UobSwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcbiAgICBpZiAoZHN0ID09PSBtKSB7XG4gICAgICB2YXIgdDtcblxuICAgICAgdCA9IG1bMV07XG4gICAgICBtWzFdID0gbVs0XTtcbiAgICAgIG1bNF0gPSB0O1xuXG4gICAgICB0ID0gbVsyXTtcbiAgICAgIG1bMl0gPSBtWzhdO1xuICAgICAgbVs4XSA9IHQ7XG5cbiAgICAgIHQgPSBtWzNdO1xuICAgICAgbVszXSA9IG1bMTJdO1xuICAgICAgbVsxMl0gPSB0O1xuXG4gICAgICB0ID0gbVs2XTtcbiAgICAgIG1bNl0gPSBtWzldO1xuICAgICAgbVs5XSA9IHQ7XG5cbiAgICAgIHQgPSBtWzddO1xuICAgICAgbVs3XSA9IG1bMTNdO1xuICAgICAgbVsxM10gPSB0O1xuXG4gICAgICB0ID0gbVsxMV07XG4gICAgICBtWzExXSA9IG1bMTRdO1xuICAgICAgbVsxNF0gPSB0O1xuICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG5cbiAgICB2YXIgbTAwID0gbVswICogNCArIDBdO1xuICAgIHZhciBtMDEgPSBtWzAgKiA0ICsgMV07XG4gICAgdmFyIG0wMiA9IG1bMCAqIDQgKyAyXTtcbiAgICB2YXIgbTAzID0gbVswICogNCArIDNdO1xuICAgIHZhciBtMTAgPSBtWzEgKiA0ICsgMF07XG4gICAgdmFyIG0xMSA9IG1bMSAqIDQgKyAxXTtcbiAgICB2YXIgbTEyID0gbVsxICogNCArIDJdO1xuICAgIHZhciBtMTMgPSBtWzEgKiA0ICsgM107XG4gICAgdmFyIG0yMCA9IG1bMiAqIDQgKyAwXTtcbiAgICB2YXIgbTIxID0gbVsyICogNCArIDFdO1xuICAgIHZhciBtMjIgPSBtWzIgKiA0ICsgMl07XG4gICAgdmFyIG0yMyA9IG1bMiAqIDQgKyAzXTtcbiAgICB2YXIgbTMwID0gbVszICogNCArIDBdO1xuICAgIHZhciBtMzEgPSBtWzMgKiA0ICsgMV07XG4gICAgdmFyIG0zMiA9IG1bMyAqIDQgKyAyXTtcbiAgICB2YXIgbTMzID0gbVszICogNCArIDNdO1xuXG4gICAgZHN0WyAwXSA9IG0wMDtcbiAgICBkc3RbIDFdID0gbTEwO1xuICAgIGRzdFsgMl0gPSBtMjA7XG4gICAgZHN0WyAzXSA9IG0zMDtcbiAgICBkc3RbIDRdID0gbTAxO1xuICAgIGRzdFsgNV0gPSBtMTE7XG4gICAgZHN0WyA2XSA9IG0yMTtcbiAgICBkc3RbIDddID0gbTMxO1xuICAgIGRzdFsgOF0gPSBtMDI7XG4gICAgZHN0WyA5XSA9IG0xMjtcbiAgICBkc3RbMTBdID0gbTIyO1xuICAgIGRzdFsxMV0gPSBtMzI7XG4gICAgZHN0WzEyXSA9IG0wMztcbiAgICBkc3RbMTNdID0gbTEzO1xuICAgIGRzdFsxNF0gPSBtMjM7XG4gICAgZHN0WzE1XSA9IG0zMztcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHV0ZXMgdGhlIGludmVyc2Ugb2YgYSA0LWJ5LTQgbWF0cml4LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gVGhlIGludmVyc2Ugb2YgbS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBpbnZlcnNlKG0sIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICB2YXIgbTAwID0gbVswICogNCArIDBdO1xuICAgIHZhciBtMDEgPSBtWzAgKiA0ICsgMV07XG4gICAgdmFyIG0wMiA9IG1bMCAqIDQgKyAyXTtcbiAgICB2YXIgbTAzID0gbVswICogNCArIDNdO1xuICAgIHZhciBtMTAgPSBtWzEgKiA0ICsgMF07XG4gICAgdmFyIG0xMSA9IG1bMSAqIDQgKyAxXTtcbiAgICB2YXIgbTEyID0gbVsxICogNCArIDJdO1xuICAgIHZhciBtMTMgPSBtWzEgKiA0ICsgM107XG4gICAgdmFyIG0yMCA9IG1bMiAqIDQgKyAwXTtcbiAgICB2YXIgbTIxID0gbVsyICogNCArIDFdO1xuICAgIHZhciBtMjIgPSBtWzIgKiA0ICsgMl07XG4gICAgdmFyIG0yMyA9IG1bMiAqIDQgKyAzXTtcbiAgICB2YXIgbTMwID0gbVszICogNCArIDBdO1xuICAgIHZhciBtMzEgPSBtWzMgKiA0ICsgMV07XG4gICAgdmFyIG0zMiA9IG1bMyAqIDQgKyAyXTtcbiAgICB2YXIgbTMzID0gbVszICogNCArIDNdO1xuICAgIHZhciB0bXBfMCAgPSBtMjIgKiBtMzM7XG4gICAgdmFyIHRtcF8xICA9IG0zMiAqIG0yMztcbiAgICB2YXIgdG1wXzIgID0gbTEyICogbTMzO1xuICAgIHZhciB0bXBfMyAgPSBtMzIgKiBtMTM7XG4gICAgdmFyIHRtcF80ICA9IG0xMiAqIG0yMztcbiAgICB2YXIgdG1wXzUgID0gbTIyICogbTEzO1xuICAgIHZhciB0bXBfNiAgPSBtMDIgKiBtMzM7XG4gICAgdmFyIHRtcF83ICA9IG0zMiAqIG0wMztcbiAgICB2YXIgdG1wXzggID0gbTAyICogbTIzO1xuICAgIHZhciB0bXBfOSAgPSBtMjIgKiBtMDM7XG4gICAgdmFyIHRtcF8xMCA9IG0wMiAqIG0xMztcbiAgICB2YXIgdG1wXzExID0gbTEyICogbTAzO1xuICAgIHZhciB0bXBfMTIgPSBtMjAgKiBtMzE7XG4gICAgdmFyIHRtcF8xMyA9IG0zMCAqIG0yMTtcbiAgICB2YXIgdG1wXzE0ID0gbTEwICogbTMxO1xuICAgIHZhciB0bXBfMTUgPSBtMzAgKiBtMTE7XG4gICAgdmFyIHRtcF8xNiA9IG0xMCAqIG0yMTtcbiAgICB2YXIgdG1wXzE3ID0gbTIwICogbTExO1xuICAgIHZhciB0bXBfMTggPSBtMDAgKiBtMzE7XG4gICAgdmFyIHRtcF8xOSA9IG0zMCAqIG0wMTtcbiAgICB2YXIgdG1wXzIwID0gbTAwICogbTIxO1xuICAgIHZhciB0bXBfMjEgPSBtMjAgKiBtMDE7XG4gICAgdmFyIHRtcF8yMiA9IG0wMCAqIG0xMTtcbiAgICB2YXIgdG1wXzIzID0gbTEwICogbTAxO1xuXG4gICAgdmFyIHQwID0gKHRtcF8wICogbTExICsgdG1wXzMgKiBtMjEgKyB0bXBfNCAqIG0zMSkgLVxuICAgICAgICAodG1wXzEgKiBtMTEgKyB0bXBfMiAqIG0yMSArIHRtcF81ICogbTMxKTtcbiAgICB2YXIgdDEgPSAodG1wXzEgKiBtMDEgKyB0bXBfNiAqIG0yMSArIHRtcF85ICogbTMxKSAtXG4gICAgICAgICh0bXBfMCAqIG0wMSArIHRtcF83ICogbTIxICsgdG1wXzggKiBtMzEpO1xuICAgIHZhciB0MiA9ICh0bXBfMiAqIG0wMSArIHRtcF83ICogbTExICsgdG1wXzEwICogbTMxKSAtXG4gICAgICAgICh0bXBfMyAqIG0wMSArIHRtcF82ICogbTExICsgdG1wXzExICogbTMxKTtcbiAgICB2YXIgdDMgPSAodG1wXzUgKiBtMDEgKyB0bXBfOCAqIG0xMSArIHRtcF8xMSAqIG0yMSkgLVxuICAgICAgICAodG1wXzQgKiBtMDEgKyB0bXBfOSAqIG0xMSArIHRtcF8xMCAqIG0yMSk7XG5cbiAgICB2YXIgZCA9IDEuMCAvIChtMDAgKiB0MCArIG0xMCAqIHQxICsgbTIwICogdDIgKyBtMzAgKiB0Myk7XG5cbiAgICBkc3RbIDBdID0gZCAqIHQwO1xuICAgIGRzdFsgMV0gPSBkICogdDE7XG4gICAgZHN0WyAyXSA9IGQgKiB0MjtcbiAgICBkc3RbIDNdID0gZCAqIHQzO1xuICAgIGRzdFsgNF0gPSBkICogKCh0bXBfMSAqIG0xMCArIHRtcF8yICogbTIwICsgdG1wXzUgKiBtMzApIC1cbiAgICAgICAgICAgICh0bXBfMCAqIG0xMCArIHRtcF8zICogbTIwICsgdG1wXzQgKiBtMzApKTtcbiAgICBkc3RbIDVdID0gZCAqICgodG1wXzAgKiBtMDAgKyB0bXBfNyAqIG0yMCArIHRtcF84ICogbTMwKSAtXG4gICAgICAgICAgICAodG1wXzEgKiBtMDAgKyB0bXBfNiAqIG0yMCArIHRtcF85ICogbTMwKSk7XG4gICAgZHN0WyA2XSA9IGQgKiAoKHRtcF8zICogbTAwICsgdG1wXzYgKiBtMTAgKyB0bXBfMTEgKiBtMzApIC1cbiAgICAgICAgICAgICh0bXBfMiAqIG0wMCArIHRtcF83ICogbTEwICsgdG1wXzEwICogbTMwKSk7XG4gICAgZHN0WyA3XSA9IGQgKiAoKHRtcF80ICogbTAwICsgdG1wXzkgKiBtMTAgKyB0bXBfMTAgKiBtMjApIC1cbiAgICAgICAgICAgICh0bXBfNSAqIG0wMCArIHRtcF84ICogbTEwICsgdG1wXzExICogbTIwKSk7XG4gICAgZHN0WyA4XSA9IGQgKiAoKHRtcF8xMiAqIG0xMyArIHRtcF8xNSAqIG0yMyArIHRtcF8xNiAqIG0zMykgLVxuICAgICAgICAgICAgKHRtcF8xMyAqIG0xMyArIHRtcF8xNCAqIG0yMyArIHRtcF8xNyAqIG0zMykpO1xuICAgIGRzdFsgOV0gPSBkICogKCh0bXBfMTMgKiBtMDMgKyB0bXBfMTggKiBtMjMgKyB0bXBfMjEgKiBtMzMpIC1cbiAgICAgICAgICAgICh0bXBfMTIgKiBtMDMgKyB0bXBfMTkgKiBtMjMgKyB0bXBfMjAgKiBtMzMpKTtcbiAgICBkc3RbMTBdID0gZCAqICgodG1wXzE0ICogbTAzICsgdG1wXzE5ICogbTEzICsgdG1wXzIyICogbTMzKSAtXG4gICAgICAgICAgICAodG1wXzE1ICogbTAzICsgdG1wXzE4ICogbTEzICsgdG1wXzIzICogbTMzKSk7XG4gICAgZHN0WzExXSA9IGQgKiAoKHRtcF8xNyAqIG0wMyArIHRtcF8yMCAqIG0xMyArIHRtcF8yMyAqIG0yMykgLVxuICAgICAgICAgICAgKHRtcF8xNiAqIG0wMyArIHRtcF8yMSAqIG0xMyArIHRtcF8yMiAqIG0yMykpO1xuICAgIGRzdFsxMl0gPSBkICogKCh0bXBfMTQgKiBtMjIgKyB0bXBfMTcgKiBtMzIgKyB0bXBfMTMgKiBtMTIpIC1cbiAgICAgICAgICAgICh0bXBfMTYgKiBtMzIgKyB0bXBfMTIgKiBtMTIgKyB0bXBfMTUgKiBtMjIpKTtcbiAgICBkc3RbMTNdID0gZCAqICgodG1wXzIwICogbTMyICsgdG1wXzEyICogbTAyICsgdG1wXzE5ICogbTIyKSAtXG4gICAgICAgICAgICAodG1wXzE4ICogbTIyICsgdG1wXzIxICogbTMyICsgdG1wXzEzICogbTAyKSk7XG4gICAgZHN0WzE0XSA9IGQgKiAoKHRtcF8xOCAqIG0xMiArIHRtcF8yMyAqIG0zMiArIHRtcF8xNSAqIG0wMikgLVxuICAgICAgICAgICAgKHRtcF8yMiAqIG0zMiArIHRtcF8xNCAqIG0wMiArIHRtcF8xOSAqIG0xMikpO1xuICAgIGRzdFsxNV0gPSBkICogKCh0bXBfMjIgKiBtMjIgKyB0bXBfMTYgKiBtMDIgKyB0bXBfMjEgKiBtMTIpIC1cbiAgICAgICAgICAgICh0bXBfMjAgKiBtMTIgKyB0bXBfMjMgKiBtMjIgKyB0bXBfMTcgKiBtMDIpKTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogTXVsdGlwbGllcyB0d28gNC1ieS00IG1hdHJpY2VzOyBhc3N1bWVzIHRoYXQgdGhlIGdpdmVuIG1hdHJpY2VzIGFyZSA0LWJ5LTQ7XG4gICAqIGFzc3VtZXMgbWF0cml4IGVudHJpZXMgYXJlIGFjY2Vzc2VkIGluIFtyb3ddW2NvbHVtbl0gZmFzaGlvbi5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBhIFRoZSBtYXRyaXggb24gdGhlIGxlZnQuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gYiBUaGUgbWF0cml4IG9uIHRoZSByaWdodC5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gVGhlIG1hdHJpeCBwcm9kdWN0IG9mIGEgYW5kIGIuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gbXVsdGlwbHkoYSwgYiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciBhMDAgPSBhWzBdO1xuICAgIHZhciBhMDEgPSBhWzFdO1xuICAgIHZhciBhMDIgPSBhWzJdO1xuICAgIHZhciBhMDMgPSBhWzNdO1xuICAgIHZhciBhMTAgPSBhWyA0ICsgMF07XG4gICAgdmFyIGExMSA9IGFbIDQgKyAxXTtcbiAgICB2YXIgYTEyID0gYVsgNCArIDJdO1xuICAgIHZhciBhMTMgPSBhWyA0ICsgM107XG4gICAgdmFyIGEyMCA9IGFbIDggKyAwXTtcbiAgICB2YXIgYTIxID0gYVsgOCArIDFdO1xuICAgIHZhciBhMjIgPSBhWyA4ICsgMl07XG4gICAgdmFyIGEyMyA9IGFbIDggKyAzXTtcbiAgICB2YXIgYTMwID0gYVsxMiArIDBdO1xuICAgIHZhciBhMzEgPSBhWzEyICsgMV07XG4gICAgdmFyIGEzMiA9IGFbMTIgKyAyXTtcbiAgICB2YXIgYTMzID0gYVsxMiArIDNdO1xuICAgIHZhciBiMDAgPSBiWzBdO1xuICAgIHZhciBiMDEgPSBiWzFdO1xuICAgIHZhciBiMDIgPSBiWzJdO1xuICAgIHZhciBiMDMgPSBiWzNdO1xuICAgIHZhciBiMTAgPSBiWyA0ICsgMF07XG4gICAgdmFyIGIxMSA9IGJbIDQgKyAxXTtcbiAgICB2YXIgYjEyID0gYlsgNCArIDJdO1xuICAgIHZhciBiMTMgPSBiWyA0ICsgM107XG4gICAgdmFyIGIyMCA9IGJbIDggKyAwXTtcbiAgICB2YXIgYjIxID0gYlsgOCArIDFdO1xuICAgIHZhciBiMjIgPSBiWyA4ICsgMl07XG4gICAgdmFyIGIyMyA9IGJbIDggKyAzXTtcbiAgICB2YXIgYjMwID0gYlsxMiArIDBdO1xuICAgIHZhciBiMzEgPSBiWzEyICsgMV07XG4gICAgdmFyIGIzMiA9IGJbMTIgKyAyXTtcbiAgICB2YXIgYjMzID0gYlsxMiArIDNdO1xuXG4gICAgZHN0WyAwXSA9IGEwMCAqIGIwMCArIGEwMSAqIGIxMCArIGEwMiAqIGIyMCArIGEwMyAqIGIzMDtcbiAgICBkc3RbIDFdID0gYTAwICogYjAxICsgYTAxICogYjExICsgYTAyICogYjIxICsgYTAzICogYjMxO1xuICAgIGRzdFsgMl0gPSBhMDAgKiBiMDIgKyBhMDEgKiBiMTIgKyBhMDIgKiBiMjIgKyBhMDMgKiBiMzI7XG4gICAgZHN0WyAzXSA9IGEwMCAqIGIwMyArIGEwMSAqIGIxMyArIGEwMiAqIGIyMyArIGEwMyAqIGIzMztcbiAgICBkc3RbIDRdID0gYTEwICogYjAwICsgYTExICogYjEwICsgYTEyICogYjIwICsgYTEzICogYjMwO1xuICAgIGRzdFsgNV0gPSBhMTAgKiBiMDEgKyBhMTEgKiBiMTEgKyBhMTIgKiBiMjEgKyBhMTMgKiBiMzE7XG4gICAgZHN0WyA2XSA9IGExMCAqIGIwMiArIGExMSAqIGIxMiArIGExMiAqIGIyMiArIGExMyAqIGIzMjtcbiAgICBkc3RbIDddID0gYTEwICogYjAzICsgYTExICogYjEzICsgYTEyICogYjIzICsgYTEzICogYjMzO1xuICAgIGRzdFsgOF0gPSBhMjAgKiBiMDAgKyBhMjEgKiBiMTAgKyBhMjIgKiBiMjAgKyBhMjMgKiBiMzA7XG4gICAgZHN0WyA5XSA9IGEyMCAqIGIwMSArIGEyMSAqIGIxMSArIGEyMiAqIGIyMSArIGEyMyAqIGIzMTtcbiAgICBkc3RbMTBdID0gYTIwICogYjAyICsgYTIxICogYjEyICsgYTIyICogYjIyICsgYTIzICogYjMyO1xuICAgIGRzdFsxMV0gPSBhMjAgKiBiMDMgKyBhMjEgKiBiMTMgKyBhMjIgKiBiMjMgKyBhMjMgKiBiMzM7XG4gICAgZHN0WzEyXSA9IGEzMCAqIGIwMCArIGEzMSAqIGIxMCArIGEzMiAqIGIyMCArIGEzMyAqIGIzMDtcbiAgICBkc3RbMTNdID0gYTMwICogYjAxICsgYTMxICogYjExICsgYTMyICogYjIxICsgYTMzICogYjMxO1xuICAgIGRzdFsxNF0gPSBhMzAgKiBiMDIgKyBhMzEgKiBiMTIgKyBhMzIgKiBiMjIgKyBhMzMgKiBiMzI7XG4gICAgZHN0WzE1XSA9IGEzMCAqIGIwMyArIGEzMSAqIGIxMyArIGEzMiAqIGIyMyArIGEzMyAqIGIzMztcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdHJhbnNsYXRpb24gY29tcG9uZW50IG9mIGEgNC1ieS00IG1hdHJpeCB0byB0aGUgZ2l2ZW5cbiAgICogdmVjdG9yLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IGEgVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHtWZWMzfSB2IFRoZSB2ZWN0b3IuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IGEgb25jZSBtb2RpZmllZC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBzZXRUcmFuc2xhdGlvbihhLCB2LCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgaWRlbnRpdHkoKTtcbiAgICBpZiAoYSAhPT0gZHN0KSB7XG4gICAgICBkc3RbIDBdID0gYVsgMF07XG4gICAgICBkc3RbIDFdID0gYVsgMV07XG4gICAgICBkc3RbIDJdID0gYVsgMl07XG4gICAgICBkc3RbIDNdID0gYVsgM107XG4gICAgICBkc3RbIDRdID0gYVsgNF07XG4gICAgICBkc3RbIDVdID0gYVsgNV07XG4gICAgICBkc3RbIDZdID0gYVsgNl07XG4gICAgICBkc3RbIDddID0gYVsgN107XG4gICAgICBkc3RbIDhdID0gYVsgOF07XG4gICAgICBkc3RbIDldID0gYVsgOV07XG4gICAgICBkc3RbMTBdID0gYVsxMF07XG4gICAgICBkc3RbMTFdID0gYVsxMV07XG4gICAgfVxuICAgIGRzdFsxMl0gPSB2WzBdO1xuICAgIGRzdFsxM10gPSB2WzFdO1xuICAgIGRzdFsxNF0gPSB2WzJdO1xuICAgIGRzdFsxNV0gPSAxO1xuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdHJhbnNsYXRpb24gY29tcG9uZW50IG9mIGEgNC1ieS00IG1hdHJpeCBhcyBhIHZlY3RvciB3aXRoIDNcbiAgICogZW50cmllcy5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXguXG4gICAqIEByZXR1cm4ge1ZlYzN9IFtkc3RdIHZlY3Rvci4uXG4gICAqIEByZXR1cm4ge1ZlYzN9IFRoZSB0cmFuc2xhdGlvbiBjb21wb25lbnQgb2YgbS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbihtLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgdjMuY3JlYXRlKCk7XG4gICAgZHN0WzBdID0gbVsxMl07XG4gICAgZHN0WzFdID0gbVsxM107XG4gICAgZHN0WzJdID0gbVsxNF07XG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBheGlzIG9mIGEgNHg0IG1hdHJpeCBhcyBhIHZlY3RvciB3aXRoIDMgZW50cmllc1xuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGF4aXMgVGhlIGF4aXMgMCA9IHgsIDEgPSB5LCAyID0gejtcbiAgICogQHJldHVybiB7VmVjM30gW2RzdF0gdmVjdG9yLlxuICAgKiBAcmV0dXJuIHtWZWMzfSBUaGUgYXhpcyBjb21wb25lbnQgb2YgbS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBnZXRBeGlzKG0sIGF4aXMsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCB2My5jcmVhdGUoKTtcbiAgICB2YXIgb2ZmID0gYXhpcyAqIDQ7XG4gICAgZHN0WzBdID0gbVtvZmYgKyAwXTtcbiAgICBkc3RbMV0gPSBtW29mZiArIDFdO1xuICAgIGRzdFsyXSA9IG1bb2ZmICsgMl07XG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyBhIDQtYnktNCBwZXJzcGVjdGl2ZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXggZ2l2ZW4gdGhlIGFuZ3VsYXIgaGVpZ2h0XG4gICAqIG9mIHRoZSBmcnVzdHVtLCB0aGUgYXNwZWN0IHJhdGlvLCBhbmQgdGhlIG5lYXIgYW5kIGZhciBjbGlwcGluZyBwbGFuZXMuICBUaGVcbiAgICogYXJndW1lbnRzIGRlZmluZSBhIGZydXN0dW0gZXh0ZW5kaW5nIGluIHRoZSBuZWdhdGl2ZSB6IGRpcmVjdGlvbi4gIFRoZSBnaXZlblxuICAgKiBhbmdsZSBpcyB0aGUgdmVydGljYWwgYW5nbGUgb2YgdGhlIGZydXN0dW0sIGFuZCB0aGUgaG9yaXpvbnRhbCBhbmdsZSBpc1xuICAgKiBkZXRlcm1pbmVkIHRvIHByb2R1Y2UgdGhlIGdpdmVuIGFzcGVjdCByYXRpby4gIFRoZSBhcmd1bWVudHMgbmVhciBhbmQgZmFyIGFyZVxuICAgKiB0aGUgZGlzdGFuY2VzIHRvIHRoZSBuZWFyIGFuZCBmYXIgY2xpcHBpbmcgcGxhbmVzLiAgTm90ZSB0aGF0IG5lYXIgYW5kIGZhclxuICAgKiBhcmUgbm90IHogY29vcmRpbmF0ZXMsIGJ1dCByYXRoZXIgdGhleSBhcmUgZGlzdGFuY2VzIGFsb25nIHRoZSBuZWdhdGl2ZVxuICAgKiB6LWF4aXMuICBUaGUgbWF0cml4IGdlbmVyYXRlZCBzZW5kcyB0aGUgdmlld2luZyBmcnVzdHVtIHRvIHRoZSB1bml0IGJveC5cbiAgICogV2UgYXNzdW1lIGEgdW5pdCBib3ggZXh0ZW5kaW5nIGZyb20gLTEgdG8gMSBpbiB0aGUgeCBhbmQgeSBkaW1lbnNpb25zIGFuZFxuICAgKiBmcm9tIDAgdG8gMSBpbiB0aGUgeiBkaW1lbnNpb24uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBmaWVsZE9mVmlld1lJblJhZGlhbnMgVGhlIGNhbWVyYSBhbmdsZSBmcm9tIHRvcCB0byBib3R0b20gKGluIHJhZGlhbnMpLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IFRoZSBhc3BlY3QgcmF0aW8gd2lkdGggLyBoZWlnaHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB6TmVhciBUaGUgZGVwdGggKG5lZ2F0aXZlIHogY29vcmRpbmF0ZSlcbiAgICogICAgIG9mIHRoZSBuZWFyIGNsaXBwaW5nIHBsYW5lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gekZhciBUaGUgZGVwdGggKG5lZ2F0aXZlIHogY29vcmRpbmF0ZSlcbiAgICogICAgIG9mIHRoZSBmYXIgY2xpcHBpbmcgcGxhbmUuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IFRoZSBwZXJzcGVjdGl2ZSBtYXRyaXguXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gcGVyc3BlY3RpdmUoZmllbGRPZlZpZXdZSW5SYWRpYW5zLCBhc3BlY3QsIHpOZWFyLCB6RmFyLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIGYgPSBNYXRoLnRhbihNYXRoLlBJICogMC41IC0gMC41ICogZmllbGRPZlZpZXdZSW5SYWRpYW5zKTtcbiAgICB2YXIgcmFuZ2VJbnYgPSAxLjAgLyAoek5lYXIgLSB6RmFyKTtcblxuICAgIGRzdFswXSAgPSBmIC8gYXNwZWN0O1xuICAgIGRzdFsxXSAgPSAwO1xuICAgIGRzdFsyXSAgPSAwO1xuICAgIGRzdFszXSAgPSAwO1xuXG4gICAgZHN0WzRdICA9IDA7XG4gICAgZHN0WzVdICA9IGY7XG4gICAgZHN0WzZdICA9IDA7XG4gICAgZHN0WzddICA9IDA7XG5cbiAgICBkc3RbOF0gID0gMDtcbiAgICBkc3RbOV0gID0gMDtcbiAgICBkc3RbMTBdID0gKHpOZWFyICsgekZhcikgKiByYW5nZUludjtcbiAgICBkc3RbMTFdID0gLTE7XG5cbiAgICBkc3RbMTJdID0gMDtcbiAgICBkc3RbMTNdID0gMDtcbiAgICBkc3RbMTRdID0gek5lYXIgKiB6RmFyICogcmFuZ2VJbnYgKiAyO1xuICAgIGRzdFsxNV0gPSAwO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyBhIDQtYnktNCBvdGhvZ29uYWwgdHJhbnNmb3JtYXRpb24gbWF0cml4IGdpdmVuIHRoZSBsZWZ0LCByaWdodCxcbiAgICogYm90dG9tLCBhbmQgdG9wIGRpbWVuc2lvbnMgb2YgdGhlIG5lYXIgY2xpcHBpbmcgcGxhbmUgYXMgd2VsbCBhcyB0aGVcbiAgICogbmVhciBhbmQgZmFyIGNsaXBwaW5nIHBsYW5lIGRpc3RhbmNlcy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGxlZnQgTGVmdCBzaWRlIG9mIHRoZSBuZWFyIGNsaXBwaW5nIHBsYW5lIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmlnaHQgUmlnaHQgc2lkZSBvZiB0aGUgbmVhciBjbGlwcGluZyBwbGFuZSB2aWV3cG9ydC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvcCBUb3Agb2YgdGhlIG5lYXIgY2xpcHBpbmcgcGxhbmUgdmlld3BvcnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIG9mIHRoZSBuZWFyIGNsaXBwaW5nIHBsYW5lIHZpZXdwb3J0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gbmVhciBUaGUgZGVwdGggKG5lZ2F0aXZlIHogY29vcmRpbmF0ZSlcbiAgICogICAgIG9mIHRoZSBuZWFyIGNsaXBwaW5nIHBsYW5lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gZmFyIFRoZSBkZXB0aCAobmVnYXRpdmUgeiBjb29yZGluYXRlKVxuICAgKiAgICAgb2YgdGhlIGZhciBjbGlwcGluZyBwbGFuZS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBPdXRwdXQgbWF0cml4LlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBUaGUgcGVyc3BlY3RpdmUgbWF0cml4LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIG9ydGhvKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgZHN0WzBdICA9IDIgLyAocmlnaHQgLSBsZWZ0KTtcbiAgICBkc3RbMV0gID0gMDtcbiAgICBkc3RbMl0gID0gMDtcbiAgICBkc3RbM10gID0gMDtcblxuICAgIGRzdFs0XSAgPSAwO1xuICAgIGRzdFs1XSAgPSAyIC8gKHRvcCAtIGJvdHRvbSk7XG4gICAgZHN0WzZdICA9IDA7XG4gICAgZHN0WzddICA9IDA7XG5cbiAgICBkc3RbOF0gID0gMDtcbiAgICBkc3RbOV0gID0gMDtcbiAgICBkc3RbMTBdID0gLTEgLyAoZmFyIC0gbmVhcik7XG4gICAgZHN0WzExXSA9IDA7XG5cbiAgICBkc3RbMTJdID0gKHJpZ2h0ICsgbGVmdCkgLyAobGVmdCAtIHJpZ2h0KTtcbiAgICBkc3RbMTNdID0gKHRvcCArIGJvdHRvbSkgLyAoYm90dG9tIC0gdG9wKTtcbiAgICBkc3RbMTRdID0gLW5lYXIgLyAobmVhciAtIGZhcik7XG4gICAgZHN0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbXB1dGVzIGEgNC1ieS00IHBlcnNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBnaXZlbiB0aGUgbGVmdCwgcmlnaHQsXG4gICAqIHRvcCwgYm90dG9tLCBuZWFyIGFuZCBmYXIgY2xpcHBpbmcgcGxhbmVzLiBUaGUgYXJndW1lbnRzIGRlZmluZSBhIGZydXN0dW1cbiAgICogZXh0ZW5kaW5nIGluIHRoZSBuZWdhdGl2ZSB6IGRpcmVjdGlvbi4gVGhlIGFyZ3VtZW50cyBuZWFyIGFuZCBmYXIgYXJlIHRoZVxuICAgKiBkaXN0YW5jZXMgdG8gdGhlIG5lYXIgYW5kIGZhciBjbGlwcGluZyBwbGFuZXMuIE5vdGUgdGhhdCBuZWFyIGFuZCBmYXIgYXJlIG5vdFxuICAgKiB6IGNvb3JkaW5hdGVzLCBidXQgcmF0aGVyIHRoZXkgYXJlIGRpc3RhbmNlcyBhbG9uZyB0aGUgbmVnYXRpdmUgei1heGlzLiBUaGVcbiAgICogbWF0cml4IGdlbmVyYXRlZCBzZW5kcyB0aGUgdmlld2luZyBmcnVzdHVtIHRvIHRoZSB1bml0IGJveC4gV2UgYXNzdW1lIGEgdW5pdFxuICAgKiBib3ggZXh0ZW5kaW5nIGZyb20gLTEgdG8gMSBpbiB0aGUgeCBhbmQgeSBkaW1lbnNpb25zIGFuZCBmcm9tIDAgdG8gMSBpbiB0aGUgelxuICAgKiBkaW1lbnNpb24uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IFRoZSB4IGNvb3JkaW5hdGUgb2YgdGhlIGxlZnQgcGxhbmUgb2YgdGhlIGJveC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IFRoZSB4IGNvb3JkaW5hdGUgb2YgdGhlIHJpZ2h0IHBsYW5lIG9mIHRoZSBib3guXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gVGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgYm90dG9tIHBsYW5lIG9mIHRoZSBib3guXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVGhlIHkgY29vcmRpbmF0ZSBvZiB0aGUgcmlnaHQgcGxhbmUgb2YgdGhlIGJveC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgVGhlIG5lZ2F0aXZlIHogY29vcmRpbmF0ZSBvZiB0aGUgbmVhciBwbGFuZSBvZiB0aGUgYm94LlxuICAgKiBAcGFyYW0ge251bWJlcn0gZmFyIFRoZSBuZWdhdGl2ZSB6IGNvb3JkaW5hdGUgb2YgdGhlIGZhciBwbGFuZSBvZiB0aGUgYm94LlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIE91dHB1dCBtYXRyaXguXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IFRoZSBwZXJzcGVjdGl2ZSBwcm9qZWN0aW9uIG1hdHJpeC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBmcnVzdHVtKGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIGR4ID0gKHJpZ2h0IC0gbGVmdCk7XG4gICAgdmFyIGR5ID0gKHRvcCAtIGJvdHRvbSk7XG4gICAgdmFyIGR6ID0gKG5lYXIgLSBmYXIpO1xuXG4gICAgZHN0WyAwXSA9IDIgKiBuZWFyIC8gZHg7XG4gICAgZHN0WyAxXSA9IDA7XG4gICAgZHN0WyAyXSA9IDA7XG4gICAgZHN0WyAzXSA9IDA7XG4gICAgZHN0WyA0XSA9IDA7XG4gICAgZHN0WyA1XSA9IDIgKiBuZWFyIC8gZHk7XG4gICAgZHN0WyA2XSA9IDA7XG4gICAgZHN0WyA3XSA9IDA7XG4gICAgZHN0WyA4XSA9IChsZWZ0ICsgcmlnaHQpIC8gZHg7XG4gICAgZHN0WyA5XSA9ICh0b3AgKyBib3R0b20pIC8gZHk7XG4gICAgZHN0WzEwXSA9IGZhciAvIGR6O1xuICAgIGRzdFsxMV0gPSAtMTtcbiAgICBkc3RbMTJdID0gMDtcbiAgICBkc3RbMTNdID0gMDtcbiAgICBkc3RbMTRdID0gbmVhciAqIGZhciAvIGR6O1xuICAgIGRzdFsxNV0gPSAwO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wdXRlcyBhIDQtYnktNCBsb29rLWF0IHRyYW5zZm9ybWF0aW9uLlxuICAgKlxuICAgKiBUaGlzIGlzIGEgbWF0cml4IHdoaWNoIHBvc2l0aW9ucyB0aGUgY2FtZXJhIGl0c2VsZi4gSWYgeW91IHdhbnRcbiAgICogYSB2aWV3IG1hdHJpeCAoYSBtYXRyaXggd2hpY2ggbW92ZXMgdGhpbmdzIGluIGZyb250IG9mIHRoZSBjYW1lcmEpXG4gICAqIHRha2UgdGhlIGludmVyc2Ugb2YgdGhpcy5cbiAgICpcbiAgICogQHBhcmFtIHtWZWMzfSBleWUgVGhlIHBvc2l0aW9uIG9mIHRoZSBleWUuXG4gICAqIEBwYXJhbSB7VmVjM30gdGFyZ2V0IFRoZSBwb3NpdGlvbiBtZWFudCB0byBiZSB2aWV3ZWQuXG4gICAqIEBwYXJhbSB7VmVjM30gdXAgQSB2ZWN0b3IgcG9pbnRpbmcgdXAuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IFRoZSBsb29rLWF0IG1hdHJpeC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBsb29rQXQoZXllLCB0YXJnZXQsIHVwLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIHhBeGlzID0gdGVtcFYzYTtcbiAgICB2YXIgeUF4aXMgPSB0ZW1wVjNiO1xuICAgIHZhciB6QXhpcyA9IHRlbXBWM2M7XG5cbiAgICB2My5ub3JtYWxpemUoXG4gICAgICAgIHYzLnN1YnRyYWN0KGV5ZSwgdGFyZ2V0LCB6QXhpcyksIHpBeGlzKTtcbiAgICB2My5ub3JtYWxpemUodjMuY3Jvc3ModXAsIHpBeGlzLCB4QXhpcyksIHhBeGlzKTtcbiAgICB2My5ub3JtYWxpemUodjMuY3Jvc3MoekF4aXMsIHhBeGlzLCB5QXhpcyksIHlBeGlzKTtcblxuICAgIGRzdFsgMF0gPSB4QXhpc1swXTtcbiAgICBkc3RbIDFdID0geEF4aXNbMV07XG4gICAgZHN0WyAyXSA9IHhBeGlzWzJdO1xuICAgIGRzdFsgM10gPSAwO1xuICAgIGRzdFsgNF0gPSB5QXhpc1swXTtcbiAgICBkc3RbIDVdID0geUF4aXNbMV07XG4gICAgZHN0WyA2XSA9IHlBeGlzWzJdO1xuICAgIGRzdFsgN10gPSAwO1xuICAgIGRzdFsgOF0gPSB6QXhpc1swXTtcbiAgICBkc3RbIDldID0gekF4aXNbMV07XG4gICAgZHN0WzEwXSA9IHpBeGlzWzJdO1xuICAgIGRzdFsxMV0gPSAwO1xuICAgIGRzdFsxMl0gPSBleWVbMF07XG4gICAgZHN0WzEzXSA9IGV5ZVsxXTtcbiAgICBkc3RbMTRdID0gZXllWzJdO1xuICAgIGRzdFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgNC1ieS00IG1hdHJpeCB3aGljaCB0cmFuc2xhdGVzIGJ5IHRoZSBnaXZlbiB2ZWN0b3Igdi5cbiAgICogQHBhcmFtIHtWZWMzfSB2IFRoZSB2ZWN0b3IgYnlcbiAgICogICAgIHdoaWNoIHRvIHRyYW5zbGF0ZS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gVGhlIHRyYW5zbGF0aW9uIG1hdHJpeC5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiB0cmFuc2xhdGlvbih2LCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgZHN0WyAwXSA9IDE7XG4gICAgZHN0WyAxXSA9IDA7XG4gICAgZHN0WyAyXSA9IDA7XG4gICAgZHN0WyAzXSA9IDA7XG4gICAgZHN0WyA0XSA9IDA7XG4gICAgZHN0WyA1XSA9IDE7XG4gICAgZHN0WyA2XSA9IDA7XG4gICAgZHN0WyA3XSA9IDA7XG4gICAgZHN0WyA4XSA9IDA7XG4gICAgZHN0WyA5XSA9IDA7XG4gICAgZHN0WzEwXSA9IDE7XG4gICAgZHN0WzExXSA9IDA7XG4gICAgZHN0WzEyXSA9IHZbMF07XG4gICAgZHN0WzEzXSA9IHZbMV07XG4gICAgZHN0WzE0XSA9IHZbMl07XG4gICAgZHN0WzE1XSA9IDE7XG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGUgZ2l2ZW4gNC1ieS00IG1hdHJpeCBieSB0cmFuc2xhdGlvbiBieSB0aGUgZ2l2ZW4gdmVjdG9yIHYuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge1ZlYzN9IHYgVGhlIHZlY3RvciBieVxuICAgKiAgICAgd2hpY2ggdG8gdHJhbnNsYXRlLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIG9uY2UgbW9kaWZpZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKG0sIHYsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICB2YXIgdjAgPSB2WzBdO1xuICAgIHZhciB2MSA9IHZbMV07XG4gICAgdmFyIHYyID0gdlsyXTtcbiAgICB2YXIgbTAwID0gbVswXTtcbiAgICB2YXIgbTAxID0gbVsxXTtcbiAgICB2YXIgbTAyID0gbVsyXTtcbiAgICB2YXIgbTAzID0gbVszXTtcbiAgICB2YXIgbTEwID0gbVsxICogNCArIDBdO1xuICAgIHZhciBtMTEgPSBtWzEgKiA0ICsgMV07XG4gICAgdmFyIG0xMiA9IG1bMSAqIDQgKyAyXTtcbiAgICB2YXIgbTEzID0gbVsxICogNCArIDNdO1xuICAgIHZhciBtMjAgPSBtWzIgKiA0ICsgMF07XG4gICAgdmFyIG0yMSA9IG1bMiAqIDQgKyAxXTtcbiAgICB2YXIgbTIyID0gbVsyICogNCArIDJdO1xuICAgIHZhciBtMjMgPSBtWzIgKiA0ICsgM107XG4gICAgdmFyIG0zMCA9IG1bMyAqIDQgKyAwXTtcbiAgICB2YXIgbTMxID0gbVszICogNCArIDFdO1xuICAgIHZhciBtMzIgPSBtWzMgKiA0ICsgMl07XG4gICAgdmFyIG0zMyA9IG1bMyAqIDQgKyAzXTtcblxuICAgIGlmIChtICE9PSBkc3QpIHtcbiAgICAgIGRzdFsgMF0gPSBtMDA7XG4gICAgICBkc3RbIDFdID0gbTAxO1xuICAgICAgZHN0WyAyXSA9IG0wMjtcbiAgICAgIGRzdFsgM10gPSBtMDM7XG4gICAgICBkc3RbIDRdID0gbTEwO1xuICAgICAgZHN0WyA1XSA9IG0xMTtcbiAgICAgIGRzdFsgNl0gPSBtMTI7XG4gICAgICBkc3RbIDddID0gbTEzO1xuICAgICAgZHN0WyA4XSA9IG0yMDtcbiAgICAgIGRzdFsgOV0gPSBtMjE7XG4gICAgICBkc3RbMTBdID0gbTIyO1xuICAgICAgZHN0WzExXSA9IG0yMztcbiAgICB9XG5cbiAgICBkc3RbMTJdID0gbTAwICogdjAgKyBtMTAgKiB2MSArIG0yMCAqIHYyICsgbTMwO1xuICAgIGRzdFsxM10gPSBtMDEgKiB2MCArIG0xMSAqIHYxICsgbTIxICogdjIgKyBtMzE7XG4gICAgZHN0WzE0XSA9IG0wMiAqIHYwICsgbTEyICogdjEgKyBtMjIgKiB2MiArIG0zMjtcbiAgICBkc3RbMTVdID0gbTAzICogdjAgKyBtMTMgKiB2MSArIG0yMyAqIHYyICsgbTMzO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgNC1ieS00IG1hdHJpeCB3aGljaCByb3RhdGVzIGFyb3VuZCB0aGUgeC1heGlzIGJ5IHRoZSBnaXZlbiBhbmdsZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlSW5SYWRpYW5zIFRoZSBhbmdsZSBieSB3aGljaCB0byByb3RhdGUgKGluIHJhZGlhbnMpLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBUaGUgcm90YXRpb24gbWF0cml4LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIHJvdGF0aW9uWChhbmdsZUluUmFkaWFucywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciBjID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xuICAgIHZhciBzID0gTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xuXG4gICAgZHN0WyAwXSA9IDE7XG4gICAgZHN0WyAxXSA9IDA7XG4gICAgZHN0WyAyXSA9IDA7XG4gICAgZHN0WyAzXSA9IDA7XG4gICAgZHN0WyA0XSA9IDA7XG4gICAgZHN0WyA1XSA9IGM7XG4gICAgZHN0WyA2XSA9IHM7XG4gICAgZHN0WyA3XSA9IDA7XG4gICAgZHN0WyA4XSA9IDA7XG4gICAgZHN0WyA5XSA9IC1zO1xuICAgIGRzdFsxMF0gPSBjO1xuICAgIGRzdFsxMV0gPSAwO1xuICAgIGRzdFsxMl0gPSAwO1xuICAgIGRzdFsxM10gPSAwO1xuICAgIGRzdFsxNF0gPSAwO1xuICAgIGRzdFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGUgZ2l2ZW4gNC1ieS00IG1hdHJpeCBieSBhIHJvdGF0aW9uIGFyb3VuZCB0aGUgeC1heGlzIGJ5IHRoZSBnaXZlblxuICAgKiBhbmdsZS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXguXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZUluUmFkaWFucyBUaGUgYW5nbGUgYnkgd2hpY2ggdG8gcm90YXRlIChpbiByYWRpYW5zKS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBvbmNlIG1vZGlmaWVkLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIHJvdGF0ZVgobSwgYW5nbGVJblJhZGlhbnMsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICB2YXIgbTEwID0gbVs0XTtcbiAgICB2YXIgbTExID0gbVs1XTtcbiAgICB2YXIgbTEyID0gbVs2XTtcbiAgICB2YXIgbTEzID0gbVs3XTtcbiAgICB2YXIgbTIwID0gbVs4XTtcbiAgICB2YXIgbTIxID0gbVs5XTtcbiAgICB2YXIgbTIyID0gbVsxMF07XG4gICAgdmFyIG0yMyA9IG1bMTFdO1xuICAgIHZhciBjID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xuICAgIHZhciBzID0gTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xuXG4gICAgZHN0WzRdICA9IGMgKiBtMTAgKyBzICogbTIwO1xuICAgIGRzdFs1XSAgPSBjICogbTExICsgcyAqIG0yMTtcbiAgICBkc3RbNl0gID0gYyAqIG0xMiArIHMgKiBtMjI7XG4gICAgZHN0WzddICA9IGMgKiBtMTMgKyBzICogbTIzO1xuICAgIGRzdFs4XSAgPSBjICogbTIwIC0gcyAqIG0xMDtcbiAgICBkc3RbOV0gID0gYyAqIG0yMSAtIHMgKiBtMTE7XG4gICAgZHN0WzEwXSA9IGMgKiBtMjIgLSBzICogbTEyO1xuICAgIGRzdFsxMV0gPSBjICogbTIzIC0gcyAqIG0xMztcblxuICAgIGlmIChtICE9PSBkc3QpIHtcbiAgICAgIGRzdFsgMF0gPSBtWyAwXTtcbiAgICAgIGRzdFsgMV0gPSBtWyAxXTtcbiAgICAgIGRzdFsgMl0gPSBtWyAyXTtcbiAgICAgIGRzdFsgM10gPSBtWyAzXTtcbiAgICAgIGRzdFsxMl0gPSBtWzEyXTtcbiAgICAgIGRzdFsxM10gPSBtWzEzXTtcbiAgICAgIGRzdFsxNF0gPSBtWzE0XTtcbiAgICAgIGRzdFsxNV0gPSBtWzE1XTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSA0LWJ5LTQgbWF0cml4IHdoaWNoIHJvdGF0ZXMgYXJvdW5kIHRoZSB5LWF4aXMgYnkgdGhlIGdpdmVuIGFuZ2xlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYW5nbGVJblJhZGlhbnMgVGhlIGFuZ2xlIGJ5IHdoaWNoIHRvIHJvdGF0ZSAoaW4gcmFkaWFucykuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gW2RzdF0gbWF0cml4IHRvIGhvbGQgcmVzdWx0LiBJZiBub25lIG5ldyBvbmUgaXMgY3JlYXRlZC4uXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsL200Lk1hdDR9IFRoZSByb3RhdGlvbiBtYXRyaXguXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gcm90YXRpb25ZKGFuZ2xlSW5SYWRpYW5zLCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgdmFyIGMgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XG5cbiAgICBkc3RbIDBdID0gYztcbiAgICBkc3RbIDFdID0gMDtcbiAgICBkc3RbIDJdID0gLXM7XG4gICAgZHN0WyAzXSA9IDA7XG4gICAgZHN0WyA0XSA9IDA7XG4gICAgZHN0WyA1XSA9IDE7XG4gICAgZHN0WyA2XSA9IDA7XG4gICAgZHN0WyA3XSA9IDA7XG4gICAgZHN0WyA4XSA9IHM7XG4gICAgZHN0WyA5XSA9IDA7XG4gICAgZHN0WzEwXSA9IGM7XG4gICAgZHN0WzExXSA9IDA7XG4gICAgZHN0WzEyXSA9IDA7XG4gICAgZHN0WzEzXSA9IDA7XG4gICAgZHN0WzE0XSA9IDA7XG4gICAgZHN0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSBnaXZlbiA0LWJ5LTQgbWF0cml4IGJ5IGEgcm90YXRpb24gYXJvdW5kIHRoZSB5LWF4aXMgYnkgdGhlIGdpdmVuXG4gICAqIGFuZ2xlLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlSW5SYWRpYW5zIFRoZSBhbmdsZSBieSB3aGljaCB0byByb3RhdGUgKGluIHJhZGlhbnMpLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIG9uY2UgbW9kaWZpZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gcm90YXRlWShtLCBhbmdsZUluUmFkaWFucywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciBtMDAgPSBtWzAgKiA0ICsgMF07XG4gICAgdmFyIG0wMSA9IG1bMCAqIDQgKyAxXTtcbiAgICB2YXIgbTAyID0gbVswICogNCArIDJdO1xuICAgIHZhciBtMDMgPSBtWzAgKiA0ICsgM107XG4gICAgdmFyIG0yMCA9IG1bMiAqIDQgKyAwXTtcbiAgICB2YXIgbTIxID0gbVsyICogNCArIDFdO1xuICAgIHZhciBtMjIgPSBtWzIgKiA0ICsgMl07XG4gICAgdmFyIG0yMyA9IG1bMiAqIDQgKyAzXTtcbiAgICB2YXIgYyA9IE1hdGguY29zKGFuZ2xlSW5SYWRpYW5zKTtcbiAgICB2YXIgcyA9IE1hdGguc2luKGFuZ2xlSW5SYWRpYW5zKTtcblxuICAgIGRzdFsgMF0gPSBjICogbTAwIC0gcyAqIG0yMDtcbiAgICBkc3RbIDFdID0gYyAqIG0wMSAtIHMgKiBtMjE7XG4gICAgZHN0WyAyXSA9IGMgKiBtMDIgLSBzICogbTIyO1xuICAgIGRzdFsgM10gPSBjICogbTAzIC0gcyAqIG0yMztcbiAgICBkc3RbIDhdID0gYyAqIG0yMCArIHMgKiBtMDA7XG4gICAgZHN0WyA5XSA9IGMgKiBtMjEgKyBzICogbTAxO1xuICAgIGRzdFsxMF0gPSBjICogbTIyICsgcyAqIG0wMjtcbiAgICBkc3RbMTFdID0gYyAqIG0yMyArIHMgKiBtMDM7XG5cbiAgICBpZiAobSAhPT0gZHN0KSB7XG4gICAgICBkc3RbIDRdID0gbVsgNF07XG4gICAgICBkc3RbIDVdID0gbVsgNV07XG4gICAgICBkc3RbIDZdID0gbVsgNl07XG4gICAgICBkc3RbIDddID0gbVsgN107XG4gICAgICBkc3RbMTJdID0gbVsxMl07XG4gICAgICBkc3RbMTNdID0gbVsxM107XG4gICAgICBkc3RbMTRdID0gbVsxNF07XG4gICAgICBkc3RbMTVdID0gbVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgNC1ieS00IG1hdHJpeCB3aGljaCByb3RhdGVzIGFyb3VuZCB0aGUgei1heGlzIGJ5IHRoZSBnaXZlbiBhbmdsZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlSW5SYWRpYW5zIFRoZSBhbmdsZSBieSB3aGljaCB0byByb3RhdGUgKGluIHJhZGlhbnMpLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBUaGUgcm90YXRpb24gbWF0cml4LlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIHJvdGF0aW9uWihhbmdsZUluUmFkaWFucywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciBjID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xuICAgIHZhciBzID0gTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xuXG4gICAgZHN0WyAwXSA9IGM7XG4gICAgZHN0WyAxXSA9IHM7XG4gICAgZHN0WyAyXSA9IDA7XG4gICAgZHN0WyAzXSA9IDA7XG4gICAgZHN0WyA0XSA9IC1zO1xuICAgIGRzdFsgNV0gPSBjO1xuICAgIGRzdFsgNl0gPSAwO1xuICAgIGRzdFsgN10gPSAwO1xuICAgIGRzdFsgOF0gPSAwO1xuICAgIGRzdFsgOV0gPSAwO1xuICAgIGRzdFsxMF0gPSAxO1xuICAgIGRzdFsxMV0gPSAwO1xuICAgIGRzdFsxMl0gPSAwO1xuICAgIGRzdFsxM10gPSAwO1xuICAgIGRzdFsxNF0gPSAwO1xuICAgIGRzdFsxNV0gPSAxO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGUgZ2l2ZW4gNC1ieS00IG1hdHJpeCBieSBhIHJvdGF0aW9uIGFyb3VuZCB0aGUgei1heGlzIGJ5IHRoZSBnaXZlblxuICAgKiBhbmdsZS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXguXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZUluUmFkaWFucyBUaGUgYW5nbGUgYnkgd2hpY2ggdG8gcm90YXRlIChpbiByYWRpYW5zKS5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBbZHN0XSBtYXRyaXggdG8gaG9sZCByZXN1bHQuIElmIG5vbmUgbmV3IG9uZSBpcyBjcmVhdGVkLi5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBvbmNlIG1vZGlmaWVkLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvbTRcbiAgICovXG4gIGZ1bmN0aW9uIHJvdGF0ZVoobSwgYW5nbGVJblJhZGlhbnMsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICB2YXIgbTAwID0gbVswICogNCArIDBdO1xuICAgIHZhciBtMDEgPSBtWzAgKiA0ICsgMV07XG4gICAgdmFyIG0wMiA9IG1bMCAqIDQgKyAyXTtcbiAgICB2YXIgbTAzID0gbVswICogNCArIDNdO1xuICAgIHZhciBtMTAgPSBtWzEgKiA0ICsgMF07XG4gICAgdmFyIG0xMSA9IG1bMSAqIDQgKyAxXTtcbiAgICB2YXIgbTEyID0gbVsxICogNCArIDJdO1xuICAgIHZhciBtMTMgPSBtWzEgKiA0ICsgM107XG4gICAgdmFyIGMgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XG5cbiAgICBkc3RbIDBdID0gYyAqIG0wMCArIHMgKiBtMTA7XG4gICAgZHN0WyAxXSA9IGMgKiBtMDEgKyBzICogbTExO1xuICAgIGRzdFsgMl0gPSBjICogbTAyICsgcyAqIG0xMjtcbiAgICBkc3RbIDNdID0gYyAqIG0wMyArIHMgKiBtMTM7XG4gICAgZHN0WyA0XSA9IGMgKiBtMTAgLSBzICogbTAwO1xuICAgIGRzdFsgNV0gPSBjICogbTExIC0gcyAqIG0wMTtcbiAgICBkc3RbIDZdID0gYyAqIG0xMiAtIHMgKiBtMDI7XG4gICAgZHN0WyA3XSA9IGMgKiBtMTMgLSBzICogbTAzO1xuXG4gICAgaWYgKG0gIT09IGRzdCkge1xuICAgICAgZHN0WyA4XSA9IG1bIDhdO1xuICAgICAgZHN0WyA5XSA9IG1bIDldO1xuICAgICAgZHN0WzEwXSA9IG1bMTBdO1xuICAgICAgZHN0WzExXSA9IG1bMTFdO1xuICAgICAgZHN0WzEyXSA9IG1bMTJdO1xuICAgICAgZHN0WzEzXSA9IG1bMTNdO1xuICAgICAgZHN0WzE0XSA9IG1bMTRdO1xuICAgICAgZHN0WzE1XSA9IG1bMTVdO1xuICAgIH1cblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIDQtYnktNCBtYXRyaXggd2hpY2ggcm90YXRlcyBhcm91bmQgdGhlIGdpdmVuIGF4aXMgYnkgdGhlIGdpdmVuXG4gICAqIGFuZ2xlLlxuICAgKiBAcGFyYW0ge1ZlYzN9IGF4aXMgVGhlIGF4aXNcbiAgICogICAgIGFib3V0IHdoaWNoIHRvIHJvdGF0ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlSW5SYWRpYW5zIFRoZSBhbmdsZSBieSB3aGljaCB0byByb3RhdGUgKGluIHJhZGlhbnMpLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBBIG1hdHJpeCB3aGljaCByb3RhdGVzIGFuZ2xlIHJhZGlhbnNcbiAgICogICAgIGFyb3VuZCB0aGUgYXhpcy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiBheGlzUm90YXRpb24oYXhpcywgYW5nbGVJblJhZGlhbnMsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCBuZXcgTWF0VHlwZSgxNik7XG5cbiAgICB2YXIgeCA9IGF4aXNbMF07XG4gICAgdmFyIHkgPSBheGlzWzFdO1xuICAgIHZhciB6ID0gYXhpc1syXTtcbiAgICB2YXIgbiA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5ICsgeiAqIHopO1xuICAgIHggLz0gbjtcbiAgICB5IC89IG47XG4gICAgeiAvPSBuO1xuICAgIHZhciB4eCA9IHggKiB4O1xuICAgIHZhciB5eSA9IHkgKiB5O1xuICAgIHZhciB6eiA9IHogKiB6O1xuICAgIHZhciBjID0gTWF0aC5jb3MoYW5nbGVJblJhZGlhbnMpO1xuICAgIHZhciBzID0gTWF0aC5zaW4oYW5nbGVJblJhZGlhbnMpO1xuICAgIHZhciBvbmVNaW51c0Nvc2luZSA9IDEgLSBjO1xuXG4gICAgZHN0WyAwXSA9IHh4ICsgKDEgLSB4eCkgKiBjO1xuICAgIGRzdFsgMV0gPSB4ICogeSAqIG9uZU1pbnVzQ29zaW5lICsgeiAqIHM7XG4gICAgZHN0WyAyXSA9IHggKiB6ICogb25lTWludXNDb3NpbmUgLSB5ICogcztcbiAgICBkc3RbIDNdID0gMDtcbiAgICBkc3RbIDRdID0geCAqIHkgKiBvbmVNaW51c0Nvc2luZSAtIHogKiBzO1xuICAgIGRzdFsgNV0gPSB5eSArICgxIC0geXkpICogYztcbiAgICBkc3RbIDZdID0geSAqIHogKiBvbmVNaW51c0Nvc2luZSArIHggKiBzO1xuICAgIGRzdFsgN10gPSAwO1xuICAgIGRzdFsgOF0gPSB4ICogeiAqIG9uZU1pbnVzQ29zaW5lICsgeSAqIHM7XG4gICAgZHN0WyA5XSA9IHkgKiB6ICogb25lTWludXNDb3NpbmUgLSB4ICogcztcbiAgICBkc3RbMTBdID0genogKyAoMSAtIHp6KSAqIGM7XG4gICAgZHN0WzExXSA9IDA7XG4gICAgZHN0WzEyXSA9IDA7XG4gICAgZHN0WzEzXSA9IDA7XG4gICAgZHN0WzE0XSA9IDA7XG4gICAgZHN0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSBnaXZlbiA0LWJ5LTQgbWF0cml4IGJ5IHJvdGF0aW9uIGFyb3VuZCB0aGUgZ2l2ZW4gYXhpcyBieSB0aGVcbiAgICogZ2l2ZW4gYW5nbGUuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge1ZlYzN9IGF4aXMgVGhlIGF4aXNcbiAgICogICAgIGFib3V0IHdoaWNoIHRvIHJvdGF0ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlSW5SYWRpYW5zIFRoZSBhbmdsZSBieSB3aGljaCB0byByb3RhdGUgKGluIHJhZGlhbnMpLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIG9uY2UgbW9kaWZpZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gYXhpc1JvdGF0ZShtLCBheGlzLCBhbmdsZUluUmFkaWFucywgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciB4ID0gYXhpc1swXTtcbiAgICB2YXIgeSA9IGF4aXNbMV07XG4gICAgdmFyIHogPSBheGlzWzJdO1xuICAgIHZhciBuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gICAgeCAvPSBuO1xuICAgIHkgLz0gbjtcbiAgICB6IC89IG47XG4gICAgdmFyIHh4ID0geCAqIHg7XG4gICAgdmFyIHl5ID0geSAqIHk7XG4gICAgdmFyIHp6ID0geiAqIHo7XG4gICAgdmFyIGMgPSBNYXRoLmNvcyhhbmdsZUluUmFkaWFucyk7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihhbmdsZUluUmFkaWFucyk7XG4gICAgdmFyIG9uZU1pbnVzQ29zaW5lID0gMSAtIGM7XG5cbiAgICB2YXIgcjAwID0geHggKyAoMSAtIHh4KSAqIGM7XG4gICAgdmFyIHIwMSA9IHggKiB5ICogb25lTWludXNDb3NpbmUgKyB6ICogcztcbiAgICB2YXIgcjAyID0geCAqIHogKiBvbmVNaW51c0Nvc2luZSAtIHkgKiBzO1xuICAgIHZhciByMTAgPSB4ICogeSAqIG9uZU1pbnVzQ29zaW5lIC0geiAqIHM7XG4gICAgdmFyIHIxMSA9IHl5ICsgKDEgLSB5eSkgKiBjO1xuICAgIHZhciByMTIgPSB5ICogeiAqIG9uZU1pbnVzQ29zaW5lICsgeCAqIHM7XG4gICAgdmFyIHIyMCA9IHggKiB6ICogb25lTWludXNDb3NpbmUgKyB5ICogcztcbiAgICB2YXIgcjIxID0geSAqIHogKiBvbmVNaW51c0Nvc2luZSAtIHggKiBzO1xuICAgIHZhciByMjIgPSB6eiArICgxIC0genopICogYztcblxuICAgIHZhciBtMDAgPSBtWzBdO1xuICAgIHZhciBtMDEgPSBtWzFdO1xuICAgIHZhciBtMDIgPSBtWzJdO1xuICAgIHZhciBtMDMgPSBtWzNdO1xuICAgIHZhciBtMTAgPSBtWzRdO1xuICAgIHZhciBtMTEgPSBtWzVdO1xuICAgIHZhciBtMTIgPSBtWzZdO1xuICAgIHZhciBtMTMgPSBtWzddO1xuICAgIHZhciBtMjAgPSBtWzhdO1xuICAgIHZhciBtMjEgPSBtWzldO1xuICAgIHZhciBtMjIgPSBtWzEwXTtcbiAgICB2YXIgbTIzID0gbVsxMV07XG5cbiAgICBkc3RbIDBdID0gcjAwICogbTAwICsgcjAxICogbTEwICsgcjAyICogbTIwO1xuICAgIGRzdFsgMV0gPSByMDAgKiBtMDEgKyByMDEgKiBtMTEgKyByMDIgKiBtMjE7XG4gICAgZHN0WyAyXSA9IHIwMCAqIG0wMiArIHIwMSAqIG0xMiArIHIwMiAqIG0yMjtcbiAgICBkc3RbIDNdID0gcjAwICogbTAzICsgcjAxICogbTEzICsgcjAyICogbTIzO1xuICAgIGRzdFsgNF0gPSByMTAgKiBtMDAgKyByMTEgKiBtMTAgKyByMTIgKiBtMjA7XG4gICAgZHN0WyA1XSA9IHIxMCAqIG0wMSArIHIxMSAqIG0xMSArIHIxMiAqIG0yMTtcbiAgICBkc3RbIDZdID0gcjEwICogbTAyICsgcjExICogbTEyICsgcjEyICogbTIyO1xuICAgIGRzdFsgN10gPSByMTAgKiBtMDMgKyByMTEgKiBtMTMgKyByMTIgKiBtMjM7XG4gICAgZHN0WyA4XSA9IHIyMCAqIG0wMCArIHIyMSAqIG0xMCArIHIyMiAqIG0yMDtcbiAgICBkc3RbIDldID0gcjIwICogbTAxICsgcjIxICogbTExICsgcjIyICogbTIxO1xuICAgIGRzdFsxMF0gPSByMjAgKiBtMDIgKyByMjEgKiBtMTIgKyByMjIgKiBtMjI7XG4gICAgZHN0WzExXSA9IHIyMCAqIG0wMyArIHIyMSAqIG0xMyArIHIyMiAqIG0yMztcblxuICAgIGlmIChtICE9PSBkc3QpIHtcbiAgICAgIGRzdFsxMl0gPSBtWzEyXTtcbiAgICAgIGRzdFsxM10gPSBtWzEzXTtcbiAgICAgIGRzdFsxNF0gPSBtWzE0XTtcbiAgICAgIGRzdFsxNV0gPSBtWzE1XTtcbiAgICB9XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSA0LWJ5LTQgbWF0cml4IHdoaWNoIHNjYWxlcyBpbiBlYWNoIGRpbWVuc2lvbiBieSBhbiBhbW91bnQgZ2l2ZW4gYnlcbiAgICogdGhlIGNvcnJlc3BvbmRpbmcgZW50cnkgaW4gdGhlIGdpdmVuIHZlY3RvcjsgYXNzdW1lcyB0aGUgdmVjdG9yIGhhcyB0aHJlZVxuICAgKiBlbnRyaWVzLlxuICAgKiBAcGFyYW0ge1ZlYzN9IHYgQSB2ZWN0b3Igb2ZcbiAgICogICAgIHRocmVlIGVudHJpZXMgc3BlY2lmeWluZyB0aGUgZmFjdG9yIGJ5IHdoaWNoIHRvIHNjYWxlIGluIGVhY2ggZGltZW5zaW9uLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBUaGUgc2NhbGluZyBtYXRyaXguXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gc2NhbGluZyh2LCBkc3QpIHtcbiAgICBkc3QgPSBkc3QgfHwgbmV3IE1hdFR5cGUoMTYpO1xuXG4gICAgZHN0WyAwXSA9IHZbMF07XG4gICAgZHN0WyAxXSA9IDA7XG4gICAgZHN0WyAyXSA9IDA7XG4gICAgZHN0WyAzXSA9IDA7XG4gICAgZHN0WyA0XSA9IDA7XG4gICAgZHN0WyA1XSA9IHZbMV07XG4gICAgZHN0WyA2XSA9IDA7XG4gICAgZHN0WyA3XSA9IDA7XG4gICAgZHN0WyA4XSA9IDA7XG4gICAgZHN0WyA5XSA9IDA7XG4gICAgZHN0WzEwXSA9IHZbMl07XG4gICAgZHN0WzExXSA9IDA7XG4gICAgZHN0WzEyXSA9IDA7XG4gICAgZHN0WzEzXSA9IDA7XG4gICAgZHN0WzE0XSA9IDA7XG4gICAgZHN0WzE1XSA9IDE7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVzIHRoZSBnaXZlbiA0LWJ5LTQgbWF0cml4LCBzY2FsaW5nIGluIGVhY2ggZGltZW5zaW9uIGJ5IGFuIGFtb3VudFxuICAgKiBnaXZlbiBieSB0aGUgY29ycmVzcG9uZGluZyBlbnRyeSBpbiB0aGUgZ2l2ZW4gdmVjdG9yOyBhc3N1bWVzIHRoZSB2ZWN0b3IgaGFzXG4gICAqIHRocmVlIGVudHJpZXMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4IHRvIGJlIG1vZGlmaWVkLlxuICAgKiBAcGFyYW0ge1ZlYzN9IHYgQSB2ZWN0b3Igb2YgdGhyZWUgZW50cmllcyBzcGVjaWZ5aW5nIHRoZVxuICAgKiAgICAgZmFjdG9yIGJ5IHdoaWNoIHRvIHNjYWxlIGluIGVhY2ggZGltZW5zaW9uLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IFtkc3RdIG1hdHJpeCB0byBob2xkIHJlc3VsdC4gSWYgbm9uZSBuZXcgb25lIGlzIGNyZWF0ZWQuLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIG9uY2UgbW9kaWZpZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gc2NhbGUobSwgdiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IG5ldyBNYXRUeXBlKDE2KTtcblxuICAgIHZhciB2MCA9IHZbMF07XG4gICAgdmFyIHYxID0gdlsxXTtcbiAgICB2YXIgdjIgPSB2WzJdO1xuXG4gICAgZHN0WyAwXSA9IHYwICogbVswICogNCArIDBdO1xuICAgIGRzdFsgMV0gPSB2MCAqIG1bMCAqIDQgKyAxXTtcbiAgICBkc3RbIDJdID0gdjAgKiBtWzAgKiA0ICsgMl07XG4gICAgZHN0WyAzXSA9IHYwICogbVswICogNCArIDNdO1xuICAgIGRzdFsgNF0gPSB2MSAqIG1bMSAqIDQgKyAwXTtcbiAgICBkc3RbIDVdID0gdjEgKiBtWzEgKiA0ICsgMV07XG4gICAgZHN0WyA2XSA9IHYxICogbVsxICogNCArIDJdO1xuICAgIGRzdFsgN10gPSB2MSAqIG1bMSAqIDQgKyAzXTtcbiAgICBkc3RbIDhdID0gdjIgKiBtWzIgKiA0ICsgMF07XG4gICAgZHN0WyA5XSA9IHYyICogbVsyICogNCArIDFdO1xuICAgIGRzdFsxMF0gPSB2MiAqIG1bMiAqIDQgKyAyXTtcbiAgICBkc3RbMTFdID0gdjIgKiBtWzIgKiA0ICsgM107XG5cbiAgICBpZiAobSAhPT0gZHN0KSB7XG4gICAgICBkc3RbMTJdID0gbVsxMl07XG4gICAgICBkc3RbMTNdID0gbVsxM107XG4gICAgICBkc3RbMTRdID0gbVsxNF07XG4gICAgICBkc3RbMTVdID0gbVsxNV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIDQtYnktNCBtYXRyaXggYW5kIGEgdmVjdG9yIHdpdGggMyBlbnRyaWVzLFxuICAgKiBpbnRlcnByZXRzIHRoZSB2ZWN0b3IgYXMgYSBwb2ludCwgdHJhbnNmb3JtcyB0aGF0IHBvaW50IGJ5IHRoZSBtYXRyaXgsIGFuZFxuICAgKiByZXR1cm5zIHRoZSByZXN1bHQgYXMgYSB2ZWN0b3Igd2l0aCAzIGVudHJpZXMuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnR3Z2wvbTQuTWF0NH0gbSBUaGUgbWF0cml4LlxuICAgKiBAcGFyYW0ge1ZlYzN9IHYgVGhlIHBvaW50LlxuICAgKiBAcGFyYW0ge1ZlYzN9IGRzdCBvcHRpb25hbCB2ZWMzIHRvIHN0b3JlIHJlc3VsdFxuICAgKiBAcmV0dXJuIHtWZWMzfSBkc3Qgb3IgbmV3IHZlYzMgaWYgbm90IHByb3ZpZGVkXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gdHJhbnNmb3JtUG9pbnQobSwgdiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IHYzLmNyZWF0ZSgpO1xuICAgIHZhciB2MCA9IHZbMF07XG4gICAgdmFyIHYxID0gdlsxXTtcbiAgICB2YXIgdjIgPSB2WzJdO1xuICAgIHZhciBkID0gdjAgKiBtWzAgKiA0ICsgM10gKyB2MSAqIG1bMSAqIDQgKyAzXSArIHYyICogbVsyICogNCArIDNdICsgbVszICogNCArIDNdO1xuXG4gICAgZHN0WzBdID0gKHYwICogbVswICogNCArIDBdICsgdjEgKiBtWzEgKiA0ICsgMF0gKyB2MiAqIG1bMiAqIDQgKyAwXSArIG1bMyAqIDQgKyAwXSkgLyBkO1xuICAgIGRzdFsxXSA9ICh2MCAqIG1bMCAqIDQgKyAxXSArIHYxICogbVsxICogNCArIDFdICsgdjIgKiBtWzIgKiA0ICsgMV0gKyBtWzMgKiA0ICsgMV0pIC8gZDtcbiAgICBkc3RbMl0gPSAodjAgKiBtWzAgKiA0ICsgMl0gKyB2MSAqIG1bMSAqIDQgKyAyXSArIHYyICogbVsyICogNCArIDJdICsgbVszICogNCArIDJdKSAvIGQ7XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgNC1ieS00IG1hdHJpeCBhbmQgYSB2ZWN0b3Igd2l0aCAzIGVudHJpZXMsIGludGVycHJldHMgdGhlIHZlY3RvciBhcyBhXG4gICAqIGRpcmVjdGlvbiwgdHJhbnNmb3JtcyB0aGF0IGRpcmVjdGlvbiBieSB0aGUgbWF0cml4LCBhbmQgcmV0dXJucyB0aGUgcmVzdWx0O1xuICAgKiBhc3N1bWVzIHRoZSB0cmFuc2Zvcm1hdGlvbiBvZiAzLWRpbWVuc2lvbmFsIHNwYWNlIHJlcHJlc2VudGVkIGJ5IHRoZSBtYXRyaXhcbiAgICogaXMgcGFyYWxsZWwtcHJlc2VydmluZywgaS5lLiBhbnkgY29tYmluYXRpb24gb2Ygcm90YXRpb24sIHNjYWxpbmcgYW5kXG4gICAqIHRyYW5zbGF0aW9uLCBidXQgbm90IGEgcGVyc3BlY3RpdmUgZGlzdG9ydGlvbi4gUmV0dXJucyBhIHZlY3RvciB3aXRoIDNcbiAgICogZW50cmllcy5cbiAgICogQHBhcmFtIHttb2R1bGU6dHdnbC9tNC5NYXQ0fSBtIFRoZSBtYXRyaXguXG4gICAqIEBwYXJhbSB7VmVjM30gdiBUaGUgZGlyZWN0aW9uLlxuICAgKiBAcGFyYW0ge1ZlYzN9IGRzdCBvcHRpb25hbCBWZWMzIHRvIHN0b3JlIHJlc3VsdFxuICAgKiBAcmV0dXJuIHtWZWMzfSBkc3Qgb3IgbmV3IFZlYzMgaWYgbm90IHByb3ZpZGVkXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9tNFxuICAgKi9cbiAgZnVuY3Rpb24gdHJhbnNmb3JtRGlyZWN0aW9uKG0sIHYsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCB2My5jcmVhdGUoKTtcblxuICAgIHZhciB2MCA9IHZbMF07XG4gICAgdmFyIHYxID0gdlsxXTtcbiAgICB2YXIgdjIgPSB2WzJdO1xuXG4gICAgZHN0WzBdID0gdjAgKiBtWzAgKiA0ICsgMF0gKyB2MSAqIG1bMSAqIDQgKyAwXSArIHYyICogbVsyICogNCArIDBdO1xuICAgIGRzdFsxXSA9IHYwICogbVswICogNCArIDFdICsgdjEgKiBtWzEgKiA0ICsgMV0gKyB2MiAqIG1bMiAqIDQgKyAxXTtcbiAgICBkc3RbMl0gPSB2MCAqIG1bMCAqIDQgKyAyXSArIHYxICogbVsxICogNCArIDJdICsgdjIgKiBtWzIgKiA0ICsgMl07XG5cbiAgICByZXR1cm4gZHN0O1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgNC1ieS00IG1hdHJpeCBtIGFuZCBhIHZlY3RvciB2IHdpdGggMyBlbnRyaWVzLCBpbnRlcnByZXRzIHRoZSB2ZWN0b3JcbiAgICogYXMgYSBub3JtYWwgdG8gYSBzdXJmYWNlLCBhbmQgY29tcHV0ZXMgYSB2ZWN0b3Igd2hpY2ggaXMgbm9ybWFsIHVwb25cbiAgICogdHJhbnNmb3JtaW5nIHRoYXQgc3VyZmFjZSBieSB0aGUgbWF0cml4LiBUaGUgZWZmZWN0IG9mIHRoaXMgZnVuY3Rpb24gaXMgdGhlXG4gICAqIHNhbWUgYXMgdHJhbnNmb3JtaW5nIHYgKGFzIGEgZGlyZWN0aW9uKSBieSB0aGUgaW52ZXJzZS10cmFuc3Bvc2Ugb2YgbS4gIFRoaXNcbiAgICogZnVuY3Rpb24gYXNzdW1lcyB0aGUgdHJhbnNmb3JtYXRpb24gb2YgMy1kaW1lbnNpb25hbCBzcGFjZSByZXByZXNlbnRlZCBieSB0aGVcbiAgICogbWF0cml4IGlzIHBhcmFsbGVsLXByZXNlcnZpbmcsIGkuZS4gYW55IGNvbWJpbmF0aW9uIG9mIHJvdGF0aW9uLCBzY2FsaW5nIGFuZFxuICAgKiB0cmFuc2xhdGlvbiwgYnV0IG5vdCBhIHBlcnNwZWN0aXZlIGRpc3RvcnRpb24uICBSZXR1cm5zIGEgdmVjdG9yIHdpdGggM1xuICAgKiBlbnRyaWVzLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL200Lk1hdDR9IG0gVGhlIG1hdHJpeC5cbiAgICogQHBhcmFtIHtWZWMzfSB2IFRoZSBub3JtYWwuXG4gICAqIEBwYXJhbSB7VmVjM30gW2RzdF0gVGhlIGRpcmVjdGlvbi5cbiAgICogQHJldHVybiB7VmVjM30gVGhlIHRyYW5zZm9ybWVkIGRpcmVjdGlvbi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL200XG4gICAqL1xuICBmdW5jdGlvbiB0cmFuc2Zvcm1Ob3JtYWwobSwgdiwgZHN0KSB7XG4gICAgZHN0ID0gZHN0IHx8IHYzLmNyZWF0ZSgpO1xuICAgIHZhciBtaSA9IGludmVyc2UobSk7XG4gICAgdmFyIHYwID0gdlswXTtcbiAgICB2YXIgdjEgPSB2WzFdO1xuICAgIHZhciB2MiA9IHZbMl07XG5cbiAgICBkc3RbMF0gPSB2MCAqIG1pWzAgKiA0ICsgMF0gKyB2MSAqIG1pWzAgKiA0ICsgMV0gKyB2MiAqIG1pWzAgKiA0ICsgMl07XG4gICAgZHN0WzFdID0gdjAgKiBtaVsxICogNCArIDBdICsgdjEgKiBtaVsxICogNCArIDFdICsgdjIgKiBtaVsxICogNCArIDJdO1xuICAgIGRzdFsyXSA9IHYwICogbWlbMiAqIDQgKyAwXSArIHYxICogbWlbMiAqIDQgKyAxXSArIHYyICogbWlbMiAqIDQgKyAyXTtcblxuICAgIHJldHVybiBkc3Q7XG4gIH1cblxuICAvLyBVc2luZyBxdW90ZXMgcHJldmVudHMgVWdsaWZ5IGZyb20gY2hhbmdpbmcgdGhlIG5hbWVzLlxuICAvLyBObyBzcGVlZCBkaWZmIEFGQUlDVC5cbiAgcmV0dXJuIHtcbiAgICBcImF4aXNSb3RhdGVcIjogYXhpc1JvdGF0ZSxcbiAgICBcImF4aXNSb3RhdGlvblwiOiBheGlzUm90YXRpb24sXG4gICAgXCJjcmVhdGVcIjogaWRlbnRpdHksXG4gICAgXCJjb3B5XCI6IGNvcHksXG4gICAgXCJmcnVzdHVtXCI6IGZydXN0dW0sXG4gICAgXCJnZXRBeGlzXCI6IGdldEF4aXMsXG4gICAgXCJnZXRUcmFuc2xhdGlvblwiOiBnZXRUcmFuc2xhdGlvbixcbiAgICBcImlkZW50aXR5XCI6IGlkZW50aXR5LFxuICAgIFwiaW52ZXJzZVwiOiBpbnZlcnNlLFxuICAgIFwibG9va0F0XCI6IGxvb2tBdCxcbiAgICBcIm11bHRpcGx5XCI6IG11bHRpcGx5LFxuICAgIFwibmVnYXRlXCI6IG5lZ2F0ZSxcbiAgICBcIm9ydGhvXCI6IG9ydGhvLFxuICAgIFwicGVyc3BlY3RpdmVcIjogcGVyc3BlY3RpdmUsXG4gICAgXCJyb3RhdGVYXCI6IHJvdGF0ZVgsXG4gICAgXCJyb3RhdGVZXCI6IHJvdGF0ZVksXG4gICAgXCJyb3RhdGVaXCI6IHJvdGF0ZVosXG4gICAgXCJyb3RhdGVBeGlzXCI6IGF4aXNSb3RhdGUsXG4gICAgXCJyb3RhdGlvblhcIjogcm90YXRpb25YLFxuICAgIFwicm90YXRpb25ZXCI6IHJvdGF0aW9uWSxcbiAgICBcInJvdGF0aW9uWlwiOiByb3RhdGlvblosXG4gICAgXCJzY2FsZVwiOiBzY2FsZSxcbiAgICBcInNjYWxpbmdcIjogc2NhbGluZyxcbiAgICBcInNldERlZmF1bHRUeXBlXCI6IHNldERlZmF1bHRUeXBlLFxuICAgIFwic2V0VHJhbnNsYXRpb25cIjogc2V0VHJhbnNsYXRpb24sXG4gICAgXCJ0cmFuc2Zvcm1EaXJlY3Rpb25cIjogdHJhbnNmb3JtRGlyZWN0aW9uLFxuICAgIFwidHJhbnNmb3JtTm9ybWFsXCI6IHRyYW5zZm9ybU5vcm1hbCxcbiAgICBcInRyYW5zZm9ybVBvaW50XCI6IHRyYW5zZm9ybVBvaW50LFxuICAgIFwidHJhbnNsYXRlXCI6IHRyYW5zbGF0ZSxcbiAgICBcInRyYW5zbGF0aW9uXCI6IHRyYW5zbGF0aW9uLFxuICAgIFwidHJhbnNwb3NlXCI6IHRyYW5zcG9zZSxcbiAgfTtcbn0pO1xuXG5cbi8qXG4gKiBDb3B5cmlnaHQgMjAxNSwgR3JlZ2cgVGF2YXJlcy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICAgICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAgICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXJcbiAqIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWQgd2l0aCB0aGVcbiAqIGRpc3RyaWJ1dGlvbi5cbiAqICAgICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR3JlZ2cgVGF2YXJlcy4gbm9yIHRoZSBuYW1lcyBvZiBoaXNcbiAqIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tXG4gKiB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG4vKipcbiAqIFZhcmlvdXMgZnVuY3Rpb25zIHRvIG1ha2Ugc2ltcGxlIHByaW1pdGl2ZXNcbiAqXG4gKiBub3RlOiBNb3N0IHByaW1pdGl2ZSBmdW5jdGlvbnMgY29tZSBpbiAzIHN0eWxlc1xuICpcbiAqICogIGBjcmVhdGVTb21lU2hhcGVCdWZmZXJJbmZvYFxuICpcbiAqICAgIFRoZXNlIGZ1bmN0aW9ucyBhcmUgYWxtb3N0IGFsd2F5cyB0aGUgZnVuY3Rpb25zIHlvdSB3YW50IHRvIGNhbGwuIFRoZXlcbiAqICAgIGNyZWF0ZSB2ZXJ0aWNlcyB0aGVuIG1ha2UgV2ViR0xCdWZmZXJzIGFuZCBjcmVhdGUge0BsaW5rIG1vZHVsZTp0d2dsLkF0dHJpYkluZm99c1xuICogICAgcmV0dXJpbmcgYSB7QGxpbmsgbW9kdWxlOnR3Z2wuQnVmZmVySW5mb30geW91IGNhbiBwYXNzIHRvIHtAbGluayBtb2R1bGU6dHdnbC5zZXRCdWZmZXJzQW5kQXR0cmlidXRlc31cbiAqICAgIGFuZCB7QGxpbmsgbW9kdWxlOnR3Z2wuZHJhd0J1ZmZlckluZm99IGV0Yy4uLlxuICpcbiAqICogIGBjcmVhdGVTb21lU2hhcGVCdWZmZXJzYFxuICpcbiAqICAgIFRoZXNlIGNyZWF0ZSBXZWJHTEJ1ZmZlcnMgYW5kIHB1dCB5b3VyIGRhdGEgaW4gdGhlbSBidXQgbm90aGluZyBlbHNlLlxuICogICAgSXQncyBhIHNob3J0Y3V0IHRvIGRvaW5nIGl0IHlvdXJzZWxmIGlmIHlvdSBkb24ndCB3YW50IHRvIHVzZVxuICogICAgdGhlIGhpZ2hlciBsZXZlbCBmdW5jdGlvbnMuXG4gKlxuICogKiAgYGNyZWF0ZVNvbWVTaGFwZVZlcnRpY2VzYFxuICpcbiAqICAgIFRoZXNlIGp1c3QgY3JlYXRlIHZlcnRpY2VzLCBubyBidWZmZXJzLiBUaGlzIGFsbG93cyB5b3UgdG8gbWFuaXB1bGF0ZSB0aGUgdmVydGljZXNcbiAqICAgIG9yIGFkZCBtb3JlIGRhdGEgYmVmb3JlIGdlbmVyYXRpbmcgYSB7QGxpbmsgbW9kdWxlOnR3Z2wuQnVmZmVySW5mb30uIE9uY2UgeW91J3JlIGZpbmlzaGVkXG4gKiAgICBtYW5pcHVsYXRpbmcgdGhlIHZlcnRpY2VzIGNhbGwge0BsaW5rIG1vZHVsZTp0d2dsLmNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzfS5cbiAqXG4gKiAgICBleGFtcGxlOlxuICpcbiAqICAgICAgICB2YXIgYXJyYXlzID0gdHdnbC5wcmltaXRpdmVzLmNyZWF0ZVBsYW5lQXJyYXlzKDEpO1xuICogICAgICAgIHR3Z2wucHJpbWl0aXZlcy5yZW9yaWVudFZlcnRpY2VzKGFycmF5cywgbTQucm90YXRpb25YKE1hdGguUEkgKiAwLjUpKTtcbiAqICAgICAgICB2YXIgYnVmZmVySW5mbyA9IHR3Z2wuY3JlYXRlQnVmZmVySW5mb0Zyb21BcnJheXMoZ2wsIGFycmF5cyk7XG4gKlxuICogQG1vZHVsZSB0d2dsL3ByaW1pdGl2ZXNcbiAqL1xuZGVmaW5lKCd0d2dsL3ByaW1pdGl2ZXMnLFtcbiAgICAnLi90d2dsJyxcbiAgICAnLi9tNCcsXG4gICAgJy4vdjMnLFxuICBdLCBmdW5jdGlvbiAoXG4gICAgdHdnbCxcbiAgICBtNCxcbiAgICB2M1xuICApIHtcbiAgXG5cbiAgLyoqXG4gICAqIEFkZCBgcHVzaGAgdG8gYSB0eXBlZCBhcnJheS4gSXQganVzdCBrZWVwcyBhICdjdXJzb3InXG4gICAqIGFuZCBhbGxvd3MgdXNlIHRvIGBwdXNoYCB2YWx1ZXMgaW50byB0aGUgYXJyYXkgc28gd2VcbiAgICogZG9uJ3QgaGF2ZSB0byBtYW51YWxseSBjb21wdXRlIG9mZnNldHNcbiAgICogQHBhcmFtIHtUeXBlZEFycmF5fSB0eXBlZEFycmF5IFR5cGVkQXJyYXkgdG8gYXVnbWVudFxuICAgKiBAcGFyYW0ge251bWJlcn0gbnVtQ29tcG9uZW50cyBudW1iZXIgb2YgY29tcG9uZW50cy5cbiAgICovXG4gIGZ1bmN0aW9uIGF1Z21lbnRUeXBlZEFycmF5KHR5cGVkQXJyYXksIG51bUNvbXBvbmVudHMpIHtcbiAgICB2YXIgY3Vyc29yID0gMDtcbiAgICB0eXBlZEFycmF5LnB1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2lpKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGFyZ3VtZW50c1tpaV07XG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5IHx8ICh2YWx1ZS5idWZmZXIgJiYgdmFsdWUuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpKSB7XG4gICAgICAgICAgZm9yICh2YXIgamogPSAwOyBqaiA8IHZhbHVlLmxlbmd0aDsgKytqaikge1xuICAgICAgICAgICAgdHlwZWRBcnJheVtjdXJzb3IrK10gPSB2YWx1ZVtqal07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHR5cGVkQXJyYXlbY3Vyc29yKytdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIHR5cGVkQXJyYXkucmVzZXQgPSBmdW5jdGlvbihvcHRfaW5kZXgpIHtcbiAgICAgIGN1cnNvciA9IG9wdF9pbmRleCB8fCAwO1xuICAgIH07XG4gICAgdHlwZWRBcnJheS5udW1Db21wb25lbnRzID0gbnVtQ29tcG9uZW50cztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodHlwZWRBcnJheSwgJ251bUVsZW1lbnRzJywge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGVuZ3RoIC8gdGhpcy5udW1Db21wb25lbnRzIHwgMDtcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgcmV0dXJuIHR5cGVkQXJyYXk7XG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlcyBhIHR5cGVkIGFycmF5IHdpdGggYSBgcHVzaGAgZnVuY3Rpb24gYXR0YWNoZWRcbiAgICogc28gdGhhdCB5b3UgY2FuIGVhc2lseSAqcHVzaCogdmFsdWVzLlxuICAgKlxuICAgKiBgcHVzaGAgY2FuIHRha2UgbXVsdGlwbGUgYXJndW1lbnRzLiBJZiBhbiBhcmd1bWVudCBpcyBhbiBhcnJheSBlYWNoIGVsZW1lbnRcbiAgICogb2YgdGhlIGFycmF5IHdpbGwgYmUgYWRkZWQgdG8gdGhlIHR5cGVkIGFycmF5LlxuICAgKlxuICAgKiBFeGFtcGxlOlxuICAgKlxuICAgKiAgICAgdmFyIGFycmF5ID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCAyKTsgIC8vIGNyZWF0ZXMgYSBGbG9hdDMyQXJyYXkgd2l0aCA2IHZhbHVlc1xuICAgKiAgICAgYXJyYXkucHVzaCgxLCAyLCAzKTtcbiAgICogICAgIGFycmF5LnB1c2goWzQsIDUsIDZdKTtcbiAgICogICAgIC8vIGFycmF5IG5vdyBjb250YWlucyBbMSwgMiwgMywgNCwgNSwgNl1cbiAgICpcbiAgICogQWxzbyBoYXMgYG51bUNvbXBvbmVudHNgIGFuZCBgbnVtRWxlbWVudHNgIHByb3BlcnRpZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1Db21wb25lbnRzIG51bWJlciBvZiBjb21wb25lbnRzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBudW1FbGVtZW50cyBudW1iZXIgb2YgZWxlbWVudHMuIFRoZSB0b3RhbCBzaXplIG9mIHRoZSBhcnJheSB3aWxsIGJlIGBudW1Db21wb25lbnRzICogbnVtRWxlbWVudHNgLlxuICAgKiBAcGFyYW0ge2NvbnN0cnVjdG9yfSBvcHRfdHlwZSBBIGNvbnN0cnVjdG9yIGZvciB0aGUgdHlwZS4gRGVmYXVsdCA9IGBGbG9hdDMyQXJyYXlgLlxuICAgKiBAcmV0dXJuIHtBcnJheUJ1ZmZlcn0gQSB0eXBlZCBhcnJheS5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KG51bUNvbXBvbmVudHMsIG51bUVsZW1lbnRzLCBvcHRfdHlwZSkge1xuICAgIHZhciBUeXBlID0gb3B0X3R5cGUgfHwgRmxvYXQzMkFycmF5O1xuICAgIHJldHVybiBhdWdtZW50VHlwZWRBcnJheShuZXcgVHlwZShudW1Db21wb25lbnRzICogbnVtRWxlbWVudHMpLCBudW1Db21wb25lbnRzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFsbEJ1dEluZGljZXMobmFtZSkge1xuICAgIHJldHVybiBuYW1lICE9PSBcImluZGljZXNcIjtcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiBpbmRleGVkIHZlcnRpY2VzIGNyZWF0ZXMgYSBuZXcgc2V0IG9mIHZlcnRpY2VzIHVuaW5kZXhlZCBieSBleHBhbmRpbmcgdGhlIGluZGV4ZWQgdmVydGljZXMuXG4gICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+fSB2ZXJ0aWNlcyBUaGUgaW5kZXhlZCB2ZXJ0aWNlcyB0byBkZWluZGV4XG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBUeXBlZEFycmF5Pn0gVGhlIGRlaW5kZXhlZCB2ZXJ0aWNlc1xuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gZGVpbmRleFZlcnRpY2VzKHZlcnRpY2VzKSB7XG4gICAgdmFyIGluZGljZXMgPSB2ZXJ0aWNlcy5pbmRpY2VzO1xuICAgIHZhciBuZXdWZXJ0aWNlcyA9IHt9O1xuICAgIHZhciBudW1FbGVtZW50cyA9IGluZGljZXMubGVuZ3RoO1xuXG4gICAgZnVuY3Rpb24gZXhwYW5kVG9VbmluZGV4ZWQoY2hhbm5lbCkge1xuICAgICAgdmFyIHNyY0J1ZmZlciA9IHZlcnRpY2VzW2NoYW5uZWxdO1xuICAgICAgdmFyIG51bUNvbXBvbmVudHMgPSBzcmNCdWZmZXIubnVtQ29tcG9uZW50cztcbiAgICAgIHZhciBkc3RCdWZmZXIgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KG51bUNvbXBvbmVudHMsIG51bUVsZW1lbnRzLCBzcmNCdWZmZXIuY29uc3RydWN0b3IpO1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG51bUVsZW1lbnRzOyArK2lpKSB7XG4gICAgICAgIHZhciBuZHggPSBpbmRpY2VzW2lpXTtcbiAgICAgICAgdmFyIG9mZnNldCA9IG5keCAqIG51bUNvbXBvbmVudHM7XG4gICAgICAgIGZvciAodmFyIGpqID0gMDsgamogPCBudW1Db21wb25lbnRzOyArK2pqKSB7XG4gICAgICAgICAgZHN0QnVmZmVyLnB1c2goc3JjQnVmZmVyW29mZnNldCArIGpqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG5ld1ZlcnRpY2VzW2NoYW5uZWxdID0gZHN0QnVmZmVyO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKHZlcnRpY2VzKS5maWx0ZXIoYWxsQnV0SW5kaWNlcykuZm9yRWFjaChleHBhbmRUb1VuaW5kZXhlZCk7XG5cbiAgICByZXR1cm4gbmV3VmVydGljZXM7XG4gIH1cblxuICAvKipcbiAgICogZmxhdHRlbnMgdGhlIG5vcm1hbHMgb2YgZGVpbmRleGVkIHZlcnRpY2VzIGluIHBsYWNlLlxuICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCBUeXBlZEFycmF5Pn0gdmVydGljZXMgVGhlIGRlaW5kZXhlZCB2ZXJ0aWNlcyB3aG8ncyBub3JtYWxzIHRvIGZsYXR0ZW5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+fSBUaGUgZmxhdHRlbmVkIHZlcnRpY2VzIChzYW1lIGFzIHdhcyBwYXNzZWQgaW4pXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuICBmdW5jdGlvbiBmbGF0dGVuTm9ybWFscyh2ZXJ0aWNlcykge1xuICAgIGlmICh2ZXJ0aWNlcy5pbmRpY2VzKSB7XG4gICAgICB0aHJvdyBcImNhbid0IGZsYXR0ZW4gbm9ybWFscyBvZiBpbmRleGVkIHZlcnRpY2VzLiBkZWluZGV4IHRoZW0gZmlyc3RcIjtcbiAgICB9XG5cbiAgICB2YXIgbm9ybWFscyA9IHZlcnRpY2VzLm5vcm1hbDtcbiAgICB2YXIgbnVtTm9ybWFscyA9IG5vcm1hbHMubGVuZ3RoO1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1Ob3JtYWxzOyBpaSArPSA5KSB7XG4gICAgICAvLyBwdWxsIG91dCB0aGUgMyBub3JtYWxzIGZvciB0aGlzIHRyaWFuZ2xlXG4gICAgICB2YXIgbmF4ID0gbm9ybWFsc1tpaSArIDBdO1xuICAgICAgdmFyIG5heSA9IG5vcm1hbHNbaWkgKyAxXTtcbiAgICAgIHZhciBuYXogPSBub3JtYWxzW2lpICsgMl07XG5cbiAgICAgIHZhciBuYnggPSBub3JtYWxzW2lpICsgM107XG4gICAgICB2YXIgbmJ5ID0gbm9ybWFsc1tpaSArIDRdO1xuICAgICAgdmFyIG5ieiA9IG5vcm1hbHNbaWkgKyA1XTtcblxuICAgICAgdmFyIG5jeCA9IG5vcm1hbHNbaWkgKyA2XTtcbiAgICAgIHZhciBuY3kgPSBub3JtYWxzW2lpICsgN107XG4gICAgICB2YXIgbmN6ID0gbm9ybWFsc1tpaSArIDhdO1xuXG4gICAgICAvLyBhZGQgdGhlbVxuICAgICAgdmFyIG54ID0gbmF4ICsgbmJ4ICsgbmN4O1xuICAgICAgdmFyIG55ID0gbmF5ICsgbmJ5ICsgbmN5O1xuICAgICAgdmFyIG56ID0gbmF6ICsgbmJ6ICsgbmN6O1xuXG4gICAgICAvLyBub3JtYWxpemUgdGhlbVxuICAgICAgdmFyIGxlbmd0aCA9IE1hdGguc3FydChueCAqIG54ICsgbnkgKiBueSArIG56ICogbnopO1xuXG4gICAgICBueCAvPSBsZW5ndGg7XG4gICAgICBueSAvPSBsZW5ndGg7XG4gICAgICBueiAvPSBsZW5ndGg7XG5cbiAgICAgIC8vIGNvcHkgdGhlbSBiYWNrIGluXG4gICAgICBub3JtYWxzW2lpICsgMF0gPSBueDtcbiAgICAgIG5vcm1hbHNbaWkgKyAxXSA9IG55O1xuICAgICAgbm9ybWFsc1tpaSArIDJdID0gbno7XG5cbiAgICAgIG5vcm1hbHNbaWkgKyAzXSA9IG54O1xuICAgICAgbm9ybWFsc1tpaSArIDRdID0gbnk7XG4gICAgICBub3JtYWxzW2lpICsgNV0gPSBuejtcblxuICAgICAgbm9ybWFsc1tpaSArIDZdID0gbng7XG4gICAgICBub3JtYWxzW2lpICsgN10gPSBueTtcbiAgICAgIG5vcm1hbHNbaWkgKyA4XSA9IG56O1xuICAgIH1cblxuICAgIHJldHVybiB2ZXJ0aWNlcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGx5RnVuY1RvVjNBcnJheShhcnJheSwgbWF0cml4LCBmbikge1xuICAgIHZhciBsZW4gPSBhcnJheS5sZW5ndGg7XG4gICAgdmFyIHRtcCA9IG5ldyBGbG9hdDMyQXJyYXkoMyk7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGxlbjsgaWkgKz0gMykge1xuICAgICAgZm4obWF0cml4LCBbYXJyYXlbaWldLCBhcnJheVtpaSArIDFdLCBhcnJheVtpaSArIDJdXSwgdG1wKTtcbiAgICAgIGFycmF5W2lpICAgIF0gPSB0bXBbMF07XG4gICAgICBhcnJheVtpaSArIDFdID0gdG1wWzFdO1xuICAgICAgYXJyYXlbaWkgKyAyXSA9IHRtcFsyXTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0cmFuc2Zvcm1Ob3JtYWwobWksIHYsIGRzdCkge1xuICAgIGRzdCA9IGRzdCB8fCB2My5jcmVhdGUoKTtcbiAgICB2YXIgdjAgPSB2WzBdO1xuICAgIHZhciB2MSA9IHZbMV07XG4gICAgdmFyIHYyID0gdlsyXTtcblxuICAgIGRzdFswXSA9IHYwICogbWlbMCAqIDQgKyAwXSArIHYxICogbWlbMCAqIDQgKyAxXSArIHYyICogbWlbMCAqIDQgKyAyXTtcbiAgICBkc3RbMV0gPSB2MCAqIG1pWzEgKiA0ICsgMF0gKyB2MSAqIG1pWzEgKiA0ICsgMV0gKyB2MiAqIG1pWzEgKiA0ICsgMl07XG4gICAgZHN0WzJdID0gdjAgKiBtaVsyICogNCArIDBdICsgdjEgKiBtaVsyICogNCArIDFdICsgdjIgKiBtaVsyICogNCArIDJdO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW9yaWVudHMgZGlyZWN0aW9ucyBieSB0aGUgZ2l2ZW4gbWF0cml4Li5cbiAgICogQHBhcmFtIHtudW1iZXJbXXxUeXBlZEFycmF5fSBhcnJheSBUaGUgYXJyYXkuIEFzc3VtZXMgdmFsdWUgZmxvYXRzIHBlciBlbGVtZW50LlxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4IEEgbWF0cml4IHRvIG11bHRpcGx5IGJ5LlxuICAgKiBAcmV0dXJuIHtudW1iZXJbXXxUeXBlZEFycmF5fSB0aGUgc2FtZSBhcnJheSB0aGF0IHdhcyBwYXNzZWQgaW5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIHJlb3JpZW50RGlyZWN0aW9ucyhhcnJheSwgbWF0cml4KSB7XG4gICAgYXBwbHlGdW5jVG9WM0FycmF5KGFycmF5LCBtYXRyaXgsIG00LnRyYW5zZm9ybURpcmVjdGlvbik7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlb3JpZW50cyBub3JtYWxzIGJ5IHRoZSBpbnZlcnNlLXRyYW5zcG9zZSBvZiB0aGUgZ2l2ZW5cbiAgICogbWF0cml4Li5cbiAgICogQHBhcmFtIHtudW1iZXJbXXxUeXBlZEFycmF5fSBhcnJheSBUaGUgYXJyYXkuIEFzc3VtZXMgdmFsdWUgZmxvYXRzIHBlciBlbGVtZW50LlxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4IEEgbWF0cml4IHRvIG11bHRpcGx5IGJ5LlxuICAgKiBAcmV0dXJuIHtudW1iZXJbXXxUeXBlZEFycmF5fSB0aGUgc2FtZSBhcnJheSB0aGF0IHdhcyBwYXNzZWQgaW5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIHJlb3JpZW50Tm9ybWFscyhhcnJheSwgbWF0cml4KSB7XG4gICAgYXBwbHlGdW5jVG9WM0FycmF5KGFycmF5LCBtNC5pbnZlcnNlKG1hdHJpeCksIHRyYW5zZm9ybU5vcm1hbCk7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlb3JpZW50cyBwb3NpdGlvbnMgYnkgdGhlIGdpdmVuIG1hdHJpeC4gSW4gb3RoZXIgd29yZHMsIGl0XG4gICAqIG11bHRpcGxpZXMgZWFjaCB2ZXJ0ZXggYnkgdGhlIGdpdmVuIG1hdHJpeC5cbiAgICogQHBhcmFtIHtudW1iZXJbXXxUeXBlZEFycmF5fSBhcnJheSBUaGUgYXJyYXkuIEFzc3VtZXMgdmFsdWUgZmxvYXRzIHBlciBlbGVtZW50LlxuICAgKiBAcGFyYW0ge01hdHJpeH0gbWF0cml4IEEgbWF0cml4IHRvIG11bHRpcGx5IGJ5LlxuICAgKiBAcmV0dXJuIHtudW1iZXJbXXxUeXBlZEFycmF5fSB0aGUgc2FtZSBhcnJheSB0aGF0IHdhcyBwYXNzZWQgaW5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIHJlb3JpZW50UG9zaXRpb25zKGFycmF5LCBtYXRyaXgpIHtcbiAgICBhcHBseUZ1bmNUb1YzQXJyYXkoYXJyYXksIG1hdHJpeCwgbTQudHJhbnNmb3JtUG9pbnQpO1xuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW9yaWVudHMgYXJyYXlzIGJ5IHRoZSBnaXZlbiBtYXRyaXguIEFzc3VtZXMgYXJyYXlzIGhhdmVcbiAgICogbmFtZXMgdGhhdCBjb250YWlucyAncG9zJyBjb3VsZCBiZSByZW9yaWVudGVkIGFzIHBvc2l0aW9ucyxcbiAgICogJ2Jpbm9ybScgb3IgJ3RhbicgYXMgZGlyZWN0aW9ucywgYW5kICdub3JtJyBhcyBub3JtYWxzLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdC48c3RyaW5nLCAobnVtYmVyW118VHlwZWRBcnJheSk+fSBhcnJheXMgVGhlIHZlcnRpY2VzIHRvIHJlb3JpZW50XG4gICAqIEBwYXJhbSB7TWF0cml4fSBtYXRyaXggbWF0cml4IHRvIHJlb3JpZW50IGJ5LlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgKG51bWJlcltdfFR5cGVkQXJyYXkpPn0gc2FtZSBhcnJheXMgdGhhdCB3ZXJlIHBhc3NlZCBpbi5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIHJlb3JpZW50VmVydGljZXMoYXJyYXlzLCBtYXRyaXgpIHtcbiAgICBPYmplY3Qua2V5cyhhcnJheXMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGFycmF5ID0gYXJyYXlzW25hbWVdO1xuICAgICAgaWYgKG5hbWUuaW5kZXhPZihcInBvc1wiKSA+PSAwKSB7XG4gICAgICAgIHJlb3JpZW50UG9zaXRpb25zKGFycmF5LCBtYXRyaXgpO1xuICAgICAgfSBlbHNlIGlmIChuYW1lLmluZGV4T2YoXCJ0YW5cIikgPj0gMCB8fCBuYW1lLmluZGV4T2YoXCJiaW5vcm1cIikgPj0gMCkge1xuICAgICAgICByZW9yaWVudERpcmVjdGlvbnMoYXJyYXksIG1hdHJpeCk7XG4gICAgICB9IGVsc2UgaWYgKG5hbWUuaW5kZXhPZihcIm5vcm1cIikgPj0gMCkge1xuICAgICAgICByZW9yaWVudE5vcm1hbHMoYXJyYXksIG1hdHJpeCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGFycmF5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIFhZIHF1YWQgQnVmZmVySW5mb1xuICAgKlxuICAgKiBUaGUgZGVmYXVsdCB3aXRoIG5vIHBhcmFtZXRlcnMgd2lsbCByZXR1cm4gYSAyeDIgcXVhZCB3aXRoIHZhbHVlcyBmcm9tIC0xIHRvICsxLlxuICAgKiBJZiB5b3Ugd2FudCBhIHVuaXQgcXVhZCB3aXRoIHRoYXQgZ29lcyBmcm9tIDAgdG8gMSB5b3UnZCBjYWxsIGl0IHdpdGhcbiAgICpcbiAgICogICAgIHR3Z2wucHJpbWl0aXZlcy5jcmVhdGVYWVF1YWRCdWZmZXJJbmZvKGdsLCAxLCAwLjUsIDAuNSk7XG4gICAqXG4gICAqIElmIHlvdSB3YW50IGEgdW5pdCBxdWFkIGNlbnRlcmVkIGFib3ZlIDAsMCB5b3UnZCBjYWxsIGl0IHdpdGhcbiAgICpcbiAgICogICAgIHR3Z2wucHJpbWl0aXZlcy5jcmVhdGVYWVF1YWRCdWZmZXJJbmZvKGdsLCAxLCAwLCAwLjUpO1xuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzaXplXSB0aGUgc2l6ZSBhY3Jvc3MgdGhlIHF1YWQuIERlZmF1bHRzIHRvIDIgd2hpY2ggbWVhbnMgdmVydGljZXMgd2lsbCBnbyBmcm9tIC0xIHRvICsxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbeE9mZnNldF0gdGhlIGFtb3VudCB0byBvZmZzZXQgdGhlIHF1YWQgaW4gWFxuICAgKiBAcGFyYW0ge251bWJlcn0gW3lPZmZzZXRdIHRoZSBhbW91bnQgdG8gb2Zmc2V0IHRoZSBxdWFkIGluIFlcbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFdlYkdMQnVmZmVyPn0gdGhlIGNyZWF0ZWQgWFkgUXVhZCBCdWZmZXJJbmZvXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVYWVF1YWRCdWZmZXJJbmZvXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIFhZIHF1YWQgQnVmZmVyc1xuICAgKlxuICAgKiBUaGUgZGVmYXVsdCB3aXRoIG5vIHBhcmFtZXRlcnMgd2lsbCByZXR1cm4gYSAyeDIgcXVhZCB3aXRoIHZhbHVlcyBmcm9tIC0xIHRvICsxLlxuICAgKiBJZiB5b3Ugd2FudCBhIHVuaXQgcXVhZCB3aXRoIHRoYXQgZ29lcyBmcm9tIDAgdG8gMSB5b3UnZCBjYWxsIGl0IHdpdGhcbiAgICpcbiAgICogICAgIHR3Z2wucHJpbWl0aXZlcy5jcmVhdGVYWVF1YWRCdWZmZXJJbmZvKGdsLCAxLCAwLjUsIDAuNSk7XG4gICAqXG4gICAqIElmIHlvdSB3YW50IGEgdW5pdCBxdWFkIGNlbnRlcmVkIGFib3ZlIDAsMCB5b3UnZCBjYWxsIGl0IHdpdGhcbiAgICpcbiAgICogICAgIHR3Z2wucHJpbWl0aXZlcy5jcmVhdGVYWVF1YWRCdWZmZXJJbmZvKGdsLCAxLCAwLCAwLjUpO1xuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzaXplXSB0aGUgc2l6ZSBhY3Jvc3MgdGhlIHF1YWQuIERlZmF1bHRzIHRvIDIgd2hpY2ggbWVhbnMgdmVydGljZXMgd2lsbCBnbyBmcm9tIC0xIHRvICsxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbeE9mZnNldF0gdGhlIGFtb3VudCB0byBvZmZzZXQgdGhlIHF1YWQgaW4gWFxuICAgKiBAcGFyYW0ge251bWJlcn0gW3lPZmZzZXRdIHRoZSBhbW91bnQgdG8gb2Zmc2V0IHRoZSBxdWFkIGluIFlcbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wuQnVmZmVySW5mb30gdGhlIGNyZWF0ZWQgWFkgUXVhZCBidWZmZXJzXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVYWVF1YWRCdWZmZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIFhZIHF1YWQgdmVydGljZXNcbiAgICpcbiAgICogVGhlIGRlZmF1bHQgd2l0aCBubyBwYXJhbWV0ZXJzIHdpbGwgcmV0dXJuIGEgMngyIHF1YWQgd2l0aCB2YWx1ZXMgZnJvbSAtMSB0byArMS5cbiAgICogSWYgeW91IHdhbnQgYSB1bml0IHF1YWQgd2l0aCB0aGF0IGdvZXMgZnJvbSAwIHRvIDEgeW91J2QgY2FsbCBpdCB3aXRoXG4gICAqXG4gICAqICAgICB0d2dsLnByaW1pdGl2ZXMuY3JlYXRlWFlRdWFkVmVydGljZXMoMSwgMC41LCAwLjUpO1xuICAgKlxuICAgKiBJZiB5b3Ugd2FudCBhIHVuaXQgcXVhZCBjZW50ZXJlZCBhYm92ZSAwLDAgeW91J2QgY2FsbCBpdCB3aXRoXG4gICAqXG4gICAqICAgICB0d2dsLnByaW1pdGl2ZXMuY3JlYXRlWFlRdWFkVmVydGljZXMoMSwgMCwgMC41KTtcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzaXplXSB0aGUgc2l6ZSBhY3Jvc3MgdGhlIHF1YWQuIERlZmF1bHRzIHRvIDIgd2hpY2ggbWVhbnMgdmVydGljZXMgd2lsbCBnbyBmcm9tIC0xIHRvICsxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbeE9mZnNldF0gdGhlIGFtb3VudCB0byBvZmZzZXQgdGhlIHF1YWQgaW4gWFxuICAgKiBAcGFyYW0ge251bWJlcn0gW3lPZmZzZXRdIHRoZSBhbW91bnQgdG8gb2Zmc2V0IHRoZSBxdWFkIGluIFlcbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+IHRoZSBjcmVhdGVkIFhZIFF1YWQgdmVydGljZXNcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZVhZUXVhZFZlcnRpY2VzKHNpemUsIHhPZmZzZXQsIHlPZmZzZXQpIHtcbiAgICBzaXplID0gc2l6ZSB8fCAyO1xuICAgIHhPZmZzZXQgPSB4T2Zmc2V0IHx8IDA7XG4gICAgeU9mZnNldCA9IHlPZmZzZXQgfHwgMDtcbiAgICBzaXplICo9IDAuNTtcbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IHtcbiAgICAgICAgbnVtQ29tcG9uZW50czogMixcbiAgICAgICAgZGF0YTogW1xuICAgICAgICAgIHhPZmZzZXQgKyAtMSAqIHNpemUsIHlPZmZzZXQgKyAtMSAqIHNpemUsXG4gICAgICAgICAgeE9mZnNldCArICAxICogc2l6ZSwgeU9mZnNldCArIC0xICogc2l6ZSxcbiAgICAgICAgICB4T2Zmc2V0ICsgLTEgKiBzaXplLCB5T2Zmc2V0ICsgIDEgKiBzaXplLFxuICAgICAgICAgIHhPZmZzZXQgKyAgMSAqIHNpemUsIHlPZmZzZXQgKyAgMSAqIHNpemUsXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgbm9ybWFsOiBbXG4gICAgICAgIDAsIDAsIDEsXG4gICAgICAgIDAsIDAsIDEsXG4gICAgICAgIDAsIDAsIDEsXG4gICAgICAgIDAsIDAsIDEsXG4gICAgICBdLFxuICAgICAgdGV4Y29vcmQ6IFtcbiAgICAgICAgMCwgMCxcbiAgICAgICAgMSwgMCxcbiAgICAgICAgMCwgMSxcbiAgICAgICAgMSwgMSxcbiAgICAgIF0sXG4gICAgICBpbmRpY2VzOiBbIDAsIDEsIDIsIDIsIDEsIDMgXSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgWFogcGxhbmUgQnVmZmVySW5mby5cbiAgICpcbiAgICogVGhlIGNyZWF0ZWQgcGxhbmUgaGFzIHBvc2l0aW9uLCBub3JtYWwsIGFuZCB0ZXhjb29yZCBkYXRhXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoXSBXaWR0aCBvZiB0aGUgcGxhbmUuIERlZmF1bHQgPSAxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZGVwdGhdIERlcHRoIG9mIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdWJkaXZpc2lvbnNXaWR0aF0gTnVtYmVyIG9mIHN0ZXBzIGFjcm9zcyB0aGUgcGxhbmUuIERlZmF1bHQgPSAxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3ViZGl2aXNpb25zRGVwdGhdIE51bWJlciBvZiBzdGVwcyBkb3duIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBbbWF0cml4XSBBIG1hdHJpeCBieSB3aGljaCB0byBtdWx0aXBseSBhbGwgdGhlIHZlcnRpY2VzLlxuICAgKiBAcmV0dXJuIHtAbW9kdWxlOnR3Z2wuQnVmZmVySW5mb30gVGhlIGNyZWF0ZWQgcGxhbmUgQnVmZmVySW5mby5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZVBsYW5lQnVmZmVySW5mb1xuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyBYWiBwbGFuZSBidWZmZXJzLlxuICAgKlxuICAgKiBUaGUgY3JlYXRlZCBwbGFuZSBoYXMgcG9zaXRpb24sIG5vcm1hbCwgYW5kIHRleGNvb3JkIGRhdGFcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbd2lkdGhdIFdpZHRoIG9mIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtkZXB0aF0gRGVwdGggb2YgdGhlIHBsYW5lLiBEZWZhdWx0ID0gMVxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N1YmRpdmlzaW9uc1dpZHRoXSBOdW1iZXIgb2Ygc3RlcHMgYWNyb3NzIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdWJkaXZpc2lvbnNEZXB0aF0gTnVtYmVyIG9mIHN0ZXBzIGRvd24gdGhlIHBsYW5lLiBEZWZhdWx0ID0gMVxuICAgKiBAcGFyYW0ge01hdHJpeDR9IFttYXRyaXhdIEEgbWF0cml4IGJ5IHdoaWNoIHRvIG11bHRpcGx5IGFsbCB0aGUgdmVydGljZXMuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBXZWJHTEJ1ZmZlcj59IFRoZSBjcmVhdGVkIHBsYW5lIGJ1ZmZlcnMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVQbGFuZUJ1ZmZlcnNcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgWFogcGxhbmUgdmVydGljZXMuXG4gICAqXG4gICAqIFRoZSBjcmVhdGVkIHBsYW5lIGhhcyBwb3NpdGlvbiwgbm9ybWFsLCBhbmQgdGV4Y29vcmQgZGF0YVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3dpZHRoXSBXaWR0aCBvZiB0aGUgcGxhbmUuIERlZmF1bHQgPSAxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbZGVwdGhdIERlcHRoIG9mIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdWJkaXZpc2lvbnNXaWR0aF0gTnVtYmVyIG9mIHN0ZXBzIGFjcm9zcyB0aGUgcGxhbmUuIERlZmF1bHQgPSAxXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3ViZGl2aXNpb25zRGVwdGhdIE51bWJlciBvZiBzdGVwcyBkb3duIHRoZSBwbGFuZS4gRGVmYXVsdCA9IDFcbiAgICogQHBhcmFtIHtNYXRyaXg0fSBbbWF0cml4XSBBIG1hdHJpeCBieSB3aGljaCB0byBtdWx0aXBseSBhbGwgdGhlIHZlcnRpY2VzLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgVHlwZWRBcnJheT59IFRoZSBjcmVhdGVkIHBsYW5lIHZlcnRpY2VzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlUGxhbmVWZXJ0aWNlcyhcbiAgICAgIHdpZHRoLFxuICAgICAgZGVwdGgsXG4gICAgICBzdWJkaXZpc2lvbnNXaWR0aCxcbiAgICAgIHN1YmRpdmlzaW9uc0RlcHRoLFxuICAgICAgbWF0cml4KSB7XG4gICAgd2lkdGggPSB3aWR0aCB8fCAxO1xuICAgIGRlcHRoID0gZGVwdGggfHwgMTtcbiAgICBzdWJkaXZpc2lvbnNXaWR0aCA9IHN1YmRpdmlzaW9uc1dpZHRoIHx8IDE7XG4gICAgc3ViZGl2aXNpb25zRGVwdGggPSBzdWJkaXZpc2lvbnNEZXB0aCB8fCAxO1xuICAgIG1hdHJpeCA9IG1hdHJpeCB8fCBtNC5pZGVudGl0eSgpO1xuXG4gICAgdmFyIG51bVZlcnRpY2VzID0gKHN1YmRpdmlzaW9uc1dpZHRoICsgMSkgKiAoc3ViZGl2aXNpb25zRGVwdGggKyAxKTtcbiAgICB2YXIgcG9zaXRpb25zID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIG5vcm1hbHMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgdGV4Y29vcmRzID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgyLCBudW1WZXJ0aWNlcyk7XG5cbiAgICBmb3IgKHZhciB6ID0gMDsgeiA8PSBzdWJkaXZpc2lvbnNEZXB0aDsgeisrKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8PSBzdWJkaXZpc2lvbnNXaWR0aDsgeCsrKSB7XG4gICAgICAgIHZhciB1ID0geCAvIHN1YmRpdmlzaW9uc1dpZHRoO1xuICAgICAgICB2YXIgdiA9IHogLyBzdWJkaXZpc2lvbnNEZXB0aDtcbiAgICAgICAgcG9zaXRpb25zLnB1c2goXG4gICAgICAgICAgICB3aWR0aCAqIHUgLSB3aWR0aCAqIDAuNSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBkZXB0aCAqIHYgLSBkZXB0aCAqIDAuNSk7XG4gICAgICAgIG5vcm1hbHMucHVzaCgwLCAxLCAwKTtcbiAgICAgICAgdGV4Y29vcmRzLnB1c2godSwgdik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG51bVZlcnRzQWNyb3NzID0gc3ViZGl2aXNpb25zV2lkdGggKyAxO1xuICAgIHZhciBpbmRpY2VzID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheShcbiAgICAgICAgMywgc3ViZGl2aXNpb25zV2lkdGggKiBzdWJkaXZpc2lvbnNEZXB0aCAqIDIsIFVpbnQxNkFycmF5KTtcblxuICAgIGZvciAodmFyIHogPSAwOyB6IDwgc3ViZGl2aXNpb25zRGVwdGg7IHorKykgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBzdWJkaXZpc2lvbnNXaWR0aDsgeCsrKSB7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIC8vIE1ha2UgdHJpYW5nbGUgMSBvZiBxdWFkLlxuICAgICAgICBpbmRpY2VzLnB1c2goXG4gICAgICAgICAgICAoeiArIDApICogbnVtVmVydHNBY3Jvc3MgKyB4LFxuICAgICAgICAgICAgKHogKyAxKSAqIG51bVZlcnRzQWNyb3NzICsgeCxcbiAgICAgICAgICAgICh6ICsgMCkgKiBudW1WZXJ0c0Fjcm9zcyArIHggKyAxKTtcblxuICAgICAgICAvLyBNYWtlIHRyaWFuZ2xlIDIgb2YgcXVhZC5cbiAgICAgICAgaW5kaWNlcy5wdXNoKFxuICAgICAgICAgICAgKHogKyAxKSAqIG51bVZlcnRzQWNyb3NzICsgeCxcbiAgICAgICAgICAgICh6ICsgMSkgKiBudW1WZXJ0c0Fjcm9zcyArIHggKyAxLFxuICAgICAgICAgICAgKHogKyAwKSAqIG51bVZlcnRzQWNyb3NzICsgeCArIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBhcnJheXMgPSByZW9yaWVudFZlcnRpY2VzKHtcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbnMsXG4gICAgICBub3JtYWw6IG5vcm1hbHMsXG4gICAgICB0ZXhjb29yZDogdGV4Y29vcmRzLFxuICAgICAgaW5kaWNlczogaW5kaWNlcyxcbiAgICB9LCBtYXRyaXgpO1xuICAgIHJldHVybiBhcnJheXM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBzcGhlcmUgQnVmZmVySW5mby5cbiAgICpcbiAgICogVGhlIGNyZWF0ZWQgc3BoZXJlIGhhcyBwb3NpdGlvbiwgbm9ybWFsLCBhbmQgdGV4Y29vcmQgZGF0YVxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyByYWRpdXMgb2YgdGhlIHNwaGVyZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc0F4aXMgbnVtYmVyIG9mIHN0ZXBzIGFyb3VuZCB0aGUgc3BoZXJlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zSGVpZ2h0IG51bWJlciBvZiB2ZXJ0aWNhbGx5IG9uIHRoZSBzcGhlcmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0X3N0YXJ0TGF0aXR1ZGVJblJhZGlhbnNdIHdoZXJlIHRvIHN0YXJ0IHRoZVxuICAgKiAgICAgdG9wIG9mIHRoZSBzcGhlcmUuIERlZmF1bHQgPSAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdF9lbmRMYXRpdHVkZUluUmFkaWFuc10gV2hlcmUgdG8gZW5kIHRoZVxuICAgKiAgICAgYm90dG9tIG9mIHRoZSBzcGhlcmUuIERlZmF1bHQgPSBNYXRoLlBJLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdF9zdGFydExvbmdpdHVkZUluUmFkaWFuc10gd2hlcmUgdG8gc3RhcnRcbiAgICogICAgIHdyYXBwaW5nIHRoZSBzcGhlcmUuIERlZmF1bHQgPSAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdF9lbmRMb25naXR1ZGVJblJhZGlhbnNdIHdoZXJlIHRvIGVuZFxuICAgKiAgICAgd3JhcHBpbmcgdGhlIHNwaGVyZS4gRGVmYXVsdCA9IDIgKiBNYXRoLlBJLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBUaGUgY3JlYXRlZCBzcGhlcmUgQnVmZmVySW5mby5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZVNwaGVyZUJ1ZmZlckluZm9cbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgc3BoZXJlIGJ1ZmZlcnMuXG4gICAqXG4gICAqIFRoZSBjcmVhdGVkIHNwaGVyZSBoYXMgcG9zaXRpb24sIG5vcm1hbCwgYW5kIHRleGNvb3JkIGRhdGFcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgcmFkaXVzIG9mIHRoZSBzcGhlcmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdWJkaXZpc2lvbnNBeGlzIG51bWJlciBvZiBzdGVwcyBhcm91bmQgdGhlIHNwaGVyZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc0hlaWdodCBudW1iZXIgb2YgdmVydGljYWxseSBvbiB0aGUgc3BoZXJlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW29wdF9zdGFydExhdGl0dWRlSW5SYWRpYW5zXSB3aGVyZSB0byBzdGFydCB0aGVcbiAgICogICAgIHRvcCBvZiB0aGUgc3BoZXJlLiBEZWZhdWx0ID0gMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRfZW5kTGF0aXR1ZGVJblJhZGlhbnNdIFdoZXJlIHRvIGVuZCB0aGVcbiAgICogICAgIGJvdHRvbSBvZiB0aGUgc3BoZXJlLiBEZWZhdWx0ID0gTWF0aC5QSS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRfc3RhcnRMb25naXR1ZGVJblJhZGlhbnNdIHdoZXJlIHRvIHN0YXJ0XG4gICAqICAgICB3cmFwcGluZyB0aGUgc3BoZXJlLiBEZWZhdWx0ID0gMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRfZW5kTG9uZ2l0dWRlSW5SYWRpYW5zXSB3aGVyZSB0byBlbmRcbiAgICogICAgIHdyYXBwaW5nIHRoZSBzcGhlcmUuIERlZmF1bHQgPSAyICogTWF0aC5QSS5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFdlYkdMQnVmZmVyPn0gVGhlIGNyZWF0ZWQgc3BoZXJlIGJ1ZmZlcnMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVTcGhlcmVCdWZmZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHNwaGVyZSB2ZXJ0aWNlcy5cbiAgICpcbiAgICogVGhlIGNyZWF0ZWQgc3BoZXJlIGhhcyBwb3NpdGlvbiwgbm9ybWFsLCBhbmQgdGV4Y29vcmQgZGF0YVxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIHJhZGl1cyBvZiB0aGUgc3BoZXJlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3ViZGl2aXNpb25zQXhpcyBudW1iZXIgb2Ygc3RlcHMgYXJvdW5kIHRoZSBzcGhlcmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdWJkaXZpc2lvbnNIZWlnaHQgbnVtYmVyIG9mIHZlcnRpY2FsbHkgb24gdGhlIHNwaGVyZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtvcHRfc3RhcnRMYXRpdHVkZUluUmFkaWFuc10gd2hlcmUgdG8gc3RhcnQgdGhlXG4gICAqICAgICB0b3Agb2YgdGhlIHNwaGVyZS4gRGVmYXVsdCA9IDAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0X2VuZExhdGl0dWRlSW5SYWRpYW5zXSBXaGVyZSB0byBlbmQgdGhlXG4gICAqICAgICBib3R0b20gb2YgdGhlIHNwaGVyZS4gRGVmYXVsdCA9IE1hdGguUEkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0X3N0YXJ0TG9uZ2l0dWRlSW5SYWRpYW5zXSB3aGVyZSB0byBzdGFydFxuICAgKiAgICAgd3JhcHBpbmcgdGhlIHNwaGVyZS4gRGVmYXVsdCA9IDAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0X2VuZExvbmdpdHVkZUluUmFkaWFuc10gd2hlcmUgdG8gZW5kXG4gICAqICAgICB3cmFwcGluZyB0aGUgc3BoZXJlLiBEZWZhdWx0ID0gMiAqIE1hdGguUEkuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBUeXBlZEFycmF5Pn0gVGhlIGNyZWF0ZWQgc3BoZXJlIHZlcnRpY2VzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlU3BoZXJlVmVydGljZXMoXG4gICAgICByYWRpdXMsXG4gICAgICBzdWJkaXZpc2lvbnNBeGlzLFxuICAgICAgc3ViZGl2aXNpb25zSGVpZ2h0LFxuICAgICAgb3B0X3N0YXJ0TGF0aXR1ZGVJblJhZGlhbnMsXG4gICAgICBvcHRfZW5kTGF0aXR1ZGVJblJhZGlhbnMsXG4gICAgICBvcHRfc3RhcnRMb25naXR1ZGVJblJhZGlhbnMsXG4gICAgICBvcHRfZW5kTG9uZ2l0dWRlSW5SYWRpYW5zKSB7XG4gICAgaWYgKHN1YmRpdmlzaW9uc0F4aXMgPD0gMCB8fCBzdWJkaXZpc2lvbnNIZWlnaHQgPD0gMCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ3N1YmRpdmlzaW9uQXhpcyBhbmQgc3ViZGl2aXNpb25IZWlnaHQgbXVzdCBiZSA+IDAnKTtcbiAgICB9XG5cbiAgICBvcHRfc3RhcnRMYXRpdHVkZUluUmFkaWFucyA9IG9wdF9zdGFydExhdGl0dWRlSW5SYWRpYW5zIHx8IDA7XG4gICAgb3B0X2VuZExhdGl0dWRlSW5SYWRpYW5zID0gb3B0X2VuZExhdGl0dWRlSW5SYWRpYW5zIHx8IE1hdGguUEk7XG4gICAgb3B0X3N0YXJ0TG9uZ2l0dWRlSW5SYWRpYW5zID0gb3B0X3N0YXJ0TG9uZ2l0dWRlSW5SYWRpYW5zIHx8IDA7XG4gICAgb3B0X2VuZExvbmdpdHVkZUluUmFkaWFucyA9IG9wdF9lbmRMb25naXR1ZGVJblJhZGlhbnMgfHwgKE1hdGguUEkgKiAyKTtcblxuICAgIHZhciBsYXRSYW5nZSA9IG9wdF9lbmRMYXRpdHVkZUluUmFkaWFucyAtIG9wdF9zdGFydExhdGl0dWRlSW5SYWRpYW5zO1xuICAgIHZhciBsb25nUmFuZ2UgPSBvcHRfZW5kTG9uZ2l0dWRlSW5SYWRpYW5zIC0gb3B0X3N0YXJ0TG9uZ2l0dWRlSW5SYWRpYW5zO1xuXG4gICAgLy8gV2UgYXJlIGdvaW5nIHRvIGdlbmVyYXRlIG91ciBzcGhlcmUgYnkgaXRlcmF0aW5nIHRocm91Z2ggaXRzXG4gICAgLy8gc3BoZXJpY2FsIGNvb3JkaW5hdGVzIGFuZCBnZW5lcmF0aW5nIDIgdHJpYW5nbGVzIGZvciBlYWNoIHF1YWQgb24gYVxuICAgIC8vIHJpbmcgb2YgdGhlIHNwaGVyZS5cbiAgICB2YXIgbnVtVmVydGljZXMgPSAoc3ViZGl2aXNpb25zQXhpcyArIDEpICogKHN1YmRpdmlzaW9uc0hlaWdodCArIDEpO1xuICAgIHZhciBwb3NpdGlvbnMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgbm9ybWFscyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIHRleGNvb3JkcyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMiAsIG51bVZlcnRpY2VzKTtcblxuICAgIC8vIEdlbmVyYXRlIHRoZSBpbmRpdmlkdWFsIHZlcnRpY2VzIGluIG91ciB2ZXJ0ZXggYnVmZmVyLlxuICAgIGZvciAodmFyIHkgPSAwOyB5IDw9IHN1YmRpdmlzaW9uc0hlaWdodDsgeSsrKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8PSBzdWJkaXZpc2lvbnNBeGlzOyB4KyspIHtcbiAgICAgICAgLy8gR2VuZXJhdGUgYSB2ZXJ0ZXggYmFzZWQgb24gaXRzIHNwaGVyaWNhbCBjb29yZGluYXRlc1xuICAgICAgICB2YXIgdSA9IHggLyBzdWJkaXZpc2lvbnNBeGlzO1xuICAgICAgICB2YXIgdiA9IHkgLyBzdWJkaXZpc2lvbnNIZWlnaHQ7XG4gICAgICAgIHZhciB0aGV0YSA9IGxvbmdSYW5nZSAqIHU7XG4gICAgICAgIHZhciBwaGkgPSBsYXRSYW5nZSAqIHY7XG4gICAgICAgIHZhciBzaW5UaGV0YSA9IE1hdGguc2luKHRoZXRhKTtcbiAgICAgICAgdmFyIGNvc1RoZXRhID0gTWF0aC5jb3ModGhldGEpO1xuICAgICAgICB2YXIgc2luUGhpID0gTWF0aC5zaW4ocGhpKTtcbiAgICAgICAgdmFyIGNvc1BoaSA9IE1hdGguY29zKHBoaSk7XG4gICAgICAgIHZhciB1eCA9IGNvc1RoZXRhICogc2luUGhpO1xuICAgICAgICB2YXIgdXkgPSBjb3NQaGk7XG4gICAgICAgIHZhciB1eiA9IHNpblRoZXRhICogc2luUGhpO1xuICAgICAgICBwb3NpdGlvbnMucHVzaChyYWRpdXMgKiB1eCwgcmFkaXVzICogdXksIHJhZGl1cyAqIHV6KTtcbiAgICAgICAgbm9ybWFscy5wdXNoKHV4LCB1eSwgdXopO1xuICAgICAgICB0ZXhjb29yZHMucHVzaCgxIC0gdSwgdik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG51bVZlcnRzQXJvdW5kID0gc3ViZGl2aXNpb25zQXhpcyArIDE7XG4gICAgdmFyIGluZGljZXMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIHN1YmRpdmlzaW9uc0F4aXMgKiBzdWJkaXZpc2lvbnNIZWlnaHQgKiAyLCBVaW50MTZBcnJheSk7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCBzdWJkaXZpc2lvbnNBeGlzOyB4KyspIHsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgc3ViZGl2aXNpb25zSGVpZ2h0OyB5KyspIHsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgLy8gTWFrZSB0cmlhbmdsZSAxIG9mIHF1YWQuXG4gICAgICAgIGluZGljZXMucHVzaChcbiAgICAgICAgICAgICh5ICsgMCkgKiBudW1WZXJ0c0Fyb3VuZCArIHgsXG4gICAgICAgICAgICAoeSArIDApICogbnVtVmVydHNBcm91bmQgKyB4ICsgMSxcbiAgICAgICAgICAgICh5ICsgMSkgKiBudW1WZXJ0c0Fyb3VuZCArIHgpO1xuXG4gICAgICAgIC8vIE1ha2UgdHJpYW5nbGUgMiBvZiBxdWFkLlxuICAgICAgICBpbmRpY2VzLnB1c2goXG4gICAgICAgICAgICAoeSArIDEpICogbnVtVmVydHNBcm91bmQgKyB4LFxuICAgICAgICAgICAgKHkgKyAwKSAqIG51bVZlcnRzQXJvdW5kICsgeCArIDEsXG4gICAgICAgICAgICAoeSArIDEpICogbnVtVmVydHNBcm91bmQgKyB4ICsgMSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbnMsXG4gICAgICBub3JtYWw6IG5vcm1hbHMsXG4gICAgICB0ZXhjb29yZDogdGV4Y29vcmRzLFxuICAgICAgaW5kaWNlczogaW5kaWNlcyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEFycmF5IG9mIHRoZSBpbmRpY2VzIG9mIGNvcm5lcnMgb2YgZWFjaCBmYWNlIG9mIGEgY3ViZS5cbiAgICogQHR5cGUge0FycmF5LjxudW1iZXJbXT59XG4gICAqL1xuICB2YXIgQ1VCRV9GQUNFX0lORElDRVMgPSBbXG4gICAgWzMsIDcsIDUsIDFdLCAgLy8gcmlnaHRcbiAgICBbNiwgMiwgMCwgNF0sICAvLyBsZWZ0XG4gICAgWzYsIDcsIDMsIDJdLCAgLy8gPz9cbiAgICBbMCwgMSwgNSwgNF0sICAvLyA/P1xuICAgIFs3LCA2LCA0LCA1XSwgIC8vIGZyb250XG4gICAgWzIsIDMsIDEsIDBdLCAgLy8gYmFja1xuICBdO1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgQnVmZmVySW5mbyBmb3IgYSBjdWJlLlxuICAgKlxuICAgKiBUaGUgY3ViZSBpcyBjcmVhdGVkIGFyb3VuZCB0aGUgb3JpZ2luLiAoLXNpemUgLyAyLCBzaXplIC8gMikuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3NpemVdIHdpZHRoLCBoZWlnaHQgYW5kIGRlcHRoIG9mIHRoZSBjdWJlLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBUaGUgY3JlYXRlZCBCdWZmZXJJbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlQ3ViZUJ1ZmZlckluZm9cbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdGhlIGJ1ZmZlcnMgYW5kIGluZGljZXMgZm9yIGEgY3ViZS5cbiAgICpcbiAgICogVGhlIGN1YmUgaXMgY3JlYXRlZCBhcm91bmQgdGhlIG9yaWdpbi4gKC1zaXplIC8gMiwgc2l6ZSAvIDIpLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzaXplXSB3aWR0aCwgaGVpZ2h0IGFuZCBkZXB0aCBvZiB0aGUgY3ViZS5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFdlYkdMQnVmZmVyPn0gVGhlIGNyZWF0ZWQgYnVmZmVycy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZUN1YmVCdWZmZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIHRoZSB2ZXJ0aWNlcyBhbmQgaW5kaWNlcyBmb3IgYSBjdWJlLlxuICAgKlxuICAgKiBUaGUgY3ViZSBpcyBjcmVhdGVkIGFyb3VuZCB0aGUgb3JpZ2luLiAoLXNpemUgLyAyLCBzaXplIC8gMikuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc2l6ZV0gd2lkdGgsIGhlaWdodCBhbmQgZGVwdGggb2YgdGhlIGN1YmUuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBUeXBlZEFycmF5Pn0gVGhlIGNyZWF0ZWQgdmVydGljZXMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVDdWJlVmVydGljZXMoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplIHx8IDE7XG4gICAgdmFyIGsgPSBzaXplIC8gMjtcblxuICAgIHZhciBjb3JuZXJWZXJ0aWNlcyA9IFtcbiAgICAgIFstaywgLWssIC1rXSxcbiAgICAgIFsraywgLWssIC1rXSxcbiAgICAgIFstaywgK2ssIC1rXSxcbiAgICAgIFsraywgK2ssIC1rXSxcbiAgICAgIFstaywgLWssICtrXSxcbiAgICAgIFsraywgLWssICtrXSxcbiAgICAgIFstaywgK2ssICtrXSxcbiAgICAgIFsraywgK2ssICtrXSxcbiAgICBdO1xuXG4gICAgdmFyIGZhY2VOb3JtYWxzID0gW1xuICAgICAgWysxLCArMCwgKzBdLFxuICAgICAgWy0xLCArMCwgKzBdLFxuICAgICAgWyswLCArMSwgKzBdLFxuICAgICAgWyswLCAtMSwgKzBdLFxuICAgICAgWyswLCArMCwgKzFdLFxuICAgICAgWyswLCArMCwgLTFdLFxuICAgIF07XG5cbiAgICB2YXIgdXZDb29yZHMgPSBbXG4gICAgICBbMSwgMF0sXG4gICAgICBbMCwgMF0sXG4gICAgICBbMCwgMV0sXG4gICAgICBbMSwgMV0sXG4gICAgXTtcblxuICAgIHZhciBudW1WZXJ0aWNlcyA9IDYgKiA0O1xuICAgIHZhciBwb3NpdGlvbnMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgbm9ybWFscyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIHRleGNvb3JkcyA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMiAsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgaW5kaWNlcyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCA2ICogMiwgVWludDE2QXJyYXkpO1xuXG4gICAgZm9yICh2YXIgZiA9IDA7IGYgPCA2OyArK2YpIHtcbiAgICAgIHZhciBmYWNlSW5kaWNlcyA9IENVQkVfRkFDRV9JTkRJQ0VTW2ZdO1xuICAgICAgZm9yICh2YXIgdiA9IDA7IHYgPCA0OyArK3YpIHtcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gY29ybmVyVmVydGljZXNbZmFjZUluZGljZXNbdl1dO1xuICAgICAgICB2YXIgbm9ybWFsID0gZmFjZU5vcm1hbHNbZl07XG4gICAgICAgIHZhciB1diA9IHV2Q29vcmRzW3ZdO1xuXG4gICAgICAgIC8vIEVhY2ggZmFjZSBuZWVkcyBhbGwgZm91ciB2ZXJ0aWNlcyBiZWNhdXNlIHRoZSBub3JtYWxzIGFuZCB0ZXh0dXJlXG4gICAgICAgIC8vIGNvb3JkaW5hdGVzIGFyZSBub3QgYWxsIHRoZSBzYW1lLlxuICAgICAgICBwb3NpdGlvbnMucHVzaChwb3NpdGlvbik7XG4gICAgICAgIG5vcm1hbHMucHVzaChub3JtYWwpO1xuICAgICAgICB0ZXhjb29yZHMucHVzaCh1dik7XG5cbiAgICAgIH1cbiAgICAgIC8vIFR3byB0cmlhbmdsZXMgbWFrZSBhIHNxdWFyZSBmYWNlLlxuICAgICAgdmFyIG9mZnNldCA9IDQgKiBmO1xuICAgICAgaW5kaWNlcy5wdXNoKG9mZnNldCArIDAsIG9mZnNldCArIDEsIG9mZnNldCArIDIpO1xuICAgICAgaW5kaWNlcy5wdXNoKG9mZnNldCArIDAsIG9mZnNldCArIDIsIG9mZnNldCArIDMpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25zLFxuICAgICAgbm9ybWFsOiBub3JtYWxzLFxuICAgICAgdGV4Y29vcmQ6IHRleGNvb3JkcyxcbiAgICAgIGluZGljZXM6IGluZGljZXMsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgQnVmZmVySW5mbyBmb3IgYSB0cnVuY2F0ZWQgY29uZSwgd2hpY2ggaXMgbGlrZSBhIGN5bGluZGVyXG4gICAqIGV4Y2VwdCB0aGF0IGl0IGhhcyBkaWZmZXJlbnQgdG9wIGFuZCBib3R0b20gcmFkaWkuIEEgdHJ1bmNhdGVkIGNvbmVcbiAgICogY2FuIGFsc28gYmUgdXNlZCB0byBjcmVhdGUgY3lsaW5kZXJzIGFuZCByZWd1bGFyIGNvbmVzLiBUaGVcbiAgICogdHJ1bmNhdGVkIGNvbmUgd2lsbCBiZSBjcmVhdGVkIGNlbnRlcmVkIGFib3V0IHRoZSBvcmlnaW4sIHdpdGggdGhlXG4gICAqIHkgYXhpcyBhcyBpdHMgdmVydGljYWwgYXhpcy5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b21SYWRpdXMgQm90dG9tIHJhZGl1cyBvZiB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvcFJhZGl1cyBUb3AgcmFkaXVzIG9mIHRydW5jYXRlZCBjb25lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlXG4gICAqICAgICB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsU3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGRvd24gdGhlXG4gICAqICAgICB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0X3RvcENhcF0gQ3JlYXRlIHRvcCBjYXAuIERlZmF1bHQgPSB0cnVlLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRfYm90dG9tQ2FwXSBDcmVhdGUgYm90dG9tIGNhcC4gRGVmYXVsdCA9IHRydWUuXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IFRoZSBjcmVhdGVkIGNvbmUgQnVmZmVySW5mby5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZVRydW5jYXRlZENvbmVCdWZmZXJJbmZvXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGJ1ZmZlcnMgZm9yIGEgdHJ1bmNhdGVkIGNvbmUsIHdoaWNoIGlzIGxpa2UgYSBjeWxpbmRlclxuICAgKiBleGNlcHQgdGhhdCBpdCBoYXMgZGlmZmVyZW50IHRvcCBhbmQgYm90dG9tIHJhZGlpLiBBIHRydW5jYXRlZCBjb25lXG4gICAqIGNhbiBhbHNvIGJlIHVzZWQgdG8gY3JlYXRlIGN5bGluZGVycyBhbmQgcmVndWxhciBjb25lcy4gVGhlXG4gICAqIHRydW5jYXRlZCBjb25lIHdpbGwgYmUgY3JlYXRlZCBjZW50ZXJlZCBhYm91dCB0aGUgb3JpZ2luLCB3aXRoIHRoZVxuICAgKiB5IGF4aXMgYXMgaXRzIHZlcnRpY2FsIGF4aXMuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gYm90dG9tUmFkaXVzIEJvdHRvbSByYWRpdXMgb2YgdHJ1bmNhdGVkIGNvbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0b3BSYWRpdXMgVG9wIHJhZGl1cyBvZiB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBIZWlnaHQgb2YgdHJ1bmNhdGVkIGNvbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYWxTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgYXJvdW5kIHRoZVxuICAgKiAgICAgdHJ1bmNhdGVkIGNvbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZXJ0aWNhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBkb3duIHRoZVxuICAgKiAgICAgdHJ1bmNhdGVkIGNvbmUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdF90b3BDYXBdIENyZWF0ZSB0b3AgY2FwLiBEZWZhdWx0ID0gdHJ1ZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0X2JvdHRvbUNhcF0gQ3JlYXRlIGJvdHRvbSBjYXAuIERlZmF1bHQgPSB0cnVlLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgV2ViR0xCdWZmZXI+fSBUaGUgY3JlYXRlZCBjb25lIGJ1ZmZlcnMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVUcnVuY2F0ZWRDb25lQnVmZmVyc1xuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyB2ZXJ0aWNlcyBmb3IgYSB0cnVuY2F0ZWQgY29uZSwgd2hpY2ggaXMgbGlrZSBhIGN5bGluZGVyXG4gICAqIGV4Y2VwdCB0aGF0IGl0IGhhcyBkaWZmZXJlbnQgdG9wIGFuZCBib3R0b20gcmFkaWkuIEEgdHJ1bmNhdGVkIGNvbmVcbiAgICogY2FuIGFsc28gYmUgdXNlZCB0byBjcmVhdGUgY3lsaW5kZXJzIGFuZCByZWd1bGFyIGNvbmVzLiBUaGVcbiAgICogdHJ1bmNhdGVkIGNvbmUgd2lsbCBiZSBjcmVhdGVkIGNlbnRlcmVkIGFib3V0IHRoZSBvcmlnaW4sIHdpdGggdGhlXG4gICAqIHkgYXhpcyBhcyBpdHMgdmVydGljYWwgYXhpcy4gLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gYm90dG9tUmFkaXVzIEJvdHRvbSByYWRpdXMgb2YgdHJ1bmNhdGVkIGNvbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0b3BSYWRpdXMgVG9wIHJhZGl1cyBvZiB0cnVuY2F0ZWQgY29uZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBIZWlnaHQgb2YgdHJ1bmNhdGVkIGNvbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYWxTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgYXJvdW5kIHRoZVxuICAgKiAgICAgdHJ1bmNhdGVkIGNvbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZXJ0aWNhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBkb3duIHRoZVxuICAgKiAgICAgdHJ1bmNhdGVkIGNvbmUuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdF90b3BDYXBdIENyZWF0ZSB0b3AgY2FwLiBEZWZhdWx0ID0gdHJ1ZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0X2JvdHRvbUNhcF0gQ3JlYXRlIGJvdHRvbSBjYXAuIERlZmF1bHQgPSB0cnVlLlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgVHlwZWRBcnJheT59IFRoZSBjcmVhdGVkIGNvbmUgdmVydGljZXMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVUcnVuY2F0ZWRDb25lVmVydGljZXMoXG4gICAgICBib3R0b21SYWRpdXMsXG4gICAgICB0b3BSYWRpdXMsXG4gICAgICBoZWlnaHQsXG4gICAgICByYWRpYWxTdWJkaXZpc2lvbnMsXG4gICAgICB2ZXJ0aWNhbFN1YmRpdmlzaW9ucyxcbiAgICAgIG9wdF90b3BDYXAsXG4gICAgICBvcHRfYm90dG9tQ2FwKSB7XG4gICAgaWYgKHJhZGlhbFN1YmRpdmlzaW9ucyA8IDMpIHtcbiAgICAgIHRocm93IEVycm9yKCdyYWRpYWxTdWJkaXZpc2lvbnMgbXVzdCBiZSAzIG9yIGdyZWF0ZXInKTtcbiAgICB9XG5cbiAgICBpZiAodmVydGljYWxTdWJkaXZpc2lvbnMgPCAxKSB7XG4gICAgICB0aHJvdyBFcnJvcigndmVydGljYWxTdWJkaXZpc2lvbnMgbXVzdCBiZSAxIG9yIGdyZWF0ZXInKTtcbiAgICB9XG5cbiAgICB2YXIgdG9wQ2FwID0gKG9wdF90b3BDYXAgPT09IHVuZGVmaW5lZCkgPyB0cnVlIDogb3B0X3RvcENhcDtcbiAgICB2YXIgYm90dG9tQ2FwID0gKG9wdF9ib3R0b21DYXAgPT09IHVuZGVmaW5lZCkgPyB0cnVlIDogb3B0X2JvdHRvbUNhcDtcblxuICAgIHZhciBleHRyYSA9ICh0b3BDYXAgPyAyIDogMCkgKyAoYm90dG9tQ2FwID8gMiA6IDApO1xuXG4gICAgdmFyIG51bVZlcnRpY2VzID0gKHJhZGlhbFN1YmRpdmlzaW9ucyArIDEpICogKHZlcnRpY2FsU3ViZGl2aXNpb25zICsgMSArIGV4dHJhKTtcbiAgICB2YXIgcG9zaXRpb25zID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIG5vcm1hbHMgICA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgbnVtVmVydGljZXMpO1xuICAgIHZhciB0ZXhjb29yZHMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDIsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgaW5kaWNlcyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCByYWRpYWxTdWJkaXZpc2lvbnMgKiAodmVydGljYWxTdWJkaXZpc2lvbnMgKyBleHRyYSkgKiAyLCBVaW50MTZBcnJheSk7XG5cbiAgICB2YXIgdmVydHNBcm91bmRFZGdlID0gcmFkaWFsU3ViZGl2aXNpb25zICsgMTtcblxuICAgIC8vIFRoZSBzbGFudCBvZiB0aGUgY29uZSBpcyBjb25zdGFudCBhY3Jvc3MgaXRzIHN1cmZhY2VcbiAgICB2YXIgc2xhbnQgPSBNYXRoLmF0YW4yKGJvdHRvbVJhZGl1cyAtIHRvcFJhZGl1cywgaGVpZ2h0KTtcbiAgICB2YXIgY29zU2xhbnQgPSBNYXRoLmNvcyhzbGFudCk7XG4gICAgdmFyIHNpblNsYW50ID0gTWF0aC5zaW4oc2xhbnQpO1xuXG4gICAgdmFyIHN0YXJ0ID0gdG9wQ2FwID8gLTIgOiAwO1xuICAgIHZhciBlbmQgPSB2ZXJ0aWNhbFN1YmRpdmlzaW9ucyArIChib3R0b21DYXAgPyAyIDogMCk7XG5cbiAgICBmb3IgKHZhciB5eSA9IHN0YXJ0OyB5eSA8PSBlbmQ7ICsreXkpIHtcbiAgICAgIHZhciB2ID0geXkgLyB2ZXJ0aWNhbFN1YmRpdmlzaW9ucztcbiAgICAgIHZhciB5ID0gaGVpZ2h0ICogdjtcbiAgICAgIHZhciByaW5nUmFkaXVzO1xuICAgICAgaWYgKHl5IDwgMCkge1xuICAgICAgICB5ID0gMDtcbiAgICAgICAgdiA9IDE7XG4gICAgICAgIHJpbmdSYWRpdXMgPSBib3R0b21SYWRpdXM7XG4gICAgICB9IGVsc2UgaWYgKHl5ID4gdmVydGljYWxTdWJkaXZpc2lvbnMpIHtcbiAgICAgICAgeSA9IGhlaWdodDtcbiAgICAgICAgdiA9IDE7XG4gICAgICAgIHJpbmdSYWRpdXMgPSB0b3BSYWRpdXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByaW5nUmFkaXVzID0gYm90dG9tUmFkaXVzICtcbiAgICAgICAgICAodG9wUmFkaXVzIC0gYm90dG9tUmFkaXVzKSAqICh5eSAvIHZlcnRpY2FsU3ViZGl2aXNpb25zKTtcbiAgICAgIH1cbiAgICAgIGlmICh5eSA9PT0gLTIgfHwgeXkgPT09IHZlcnRpY2FsU3ViZGl2aXNpb25zICsgMikge1xuICAgICAgICByaW5nUmFkaXVzID0gMDtcbiAgICAgICAgdiA9IDA7XG4gICAgICB9XG4gICAgICB5IC09IGhlaWdodCAvIDI7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgdmVydHNBcm91bmRFZGdlOyArK2lpKSB7XG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihpaSAqIE1hdGguUEkgKiAyIC8gcmFkaWFsU3ViZGl2aXNpb25zKTtcbiAgICAgICAgdmFyIGNvcyA9IE1hdGguY29zKGlpICogTWF0aC5QSSAqIDIgLyByYWRpYWxTdWJkaXZpc2lvbnMpO1xuICAgICAgICBwb3NpdGlvbnMucHVzaChzaW4gKiByaW5nUmFkaXVzLCB5LCBjb3MgKiByaW5nUmFkaXVzKTtcbiAgICAgICAgbm9ybWFscy5wdXNoKFxuICAgICAgICAgICAgKHl5IDwgMCB8fCB5eSA+IHZlcnRpY2FsU3ViZGl2aXNpb25zKSA/IDAgOiAoc2luICogY29zU2xhbnQpLFxuICAgICAgICAgICAgKHl5IDwgMCkgPyAtMSA6ICh5eSA+IHZlcnRpY2FsU3ViZGl2aXNpb25zID8gMSA6IHNpblNsYW50KSxcbiAgICAgICAgICAgICh5eSA8IDAgfHwgeXkgPiB2ZXJ0aWNhbFN1YmRpdmlzaW9ucykgPyAwIDogKGNvcyAqIGNvc1NsYW50KSk7XG4gICAgICAgIHRleGNvb3Jkcy5wdXNoKChpaSAvIHJhZGlhbFN1YmRpdmlzaW9ucyksIDEgLSB2KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciB5eSA9IDA7IHl5IDwgdmVydGljYWxTdWJkaXZpc2lvbnMgKyBleHRyYTsgKyt5eSkgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHJhZGlhbFN1YmRpdmlzaW9uczsgKytpaSkgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICBpbmRpY2VzLnB1c2godmVydHNBcm91bmRFZGdlICogKHl5ICsgMCkgKyAwICsgaWksXG4gICAgICAgICAgICAgICAgICAgICB2ZXJ0c0Fyb3VuZEVkZ2UgKiAoeXkgKyAwKSArIDEgKyBpaSxcbiAgICAgICAgICAgICAgICAgICAgIHZlcnRzQXJvdW5kRWRnZSAqICh5eSArIDEpICsgMSArIGlpKTtcbiAgICAgICAgaW5kaWNlcy5wdXNoKHZlcnRzQXJvdW5kRWRnZSAqICh5eSArIDApICsgMCArIGlpLFxuICAgICAgICAgICAgICAgICAgICAgdmVydHNBcm91bmRFZGdlICogKHl5ICsgMSkgKyAxICsgaWksXG4gICAgICAgICAgICAgICAgICAgICB2ZXJ0c0Fyb3VuZEVkZ2UgKiAoeXkgKyAxKSArIDAgKyBpaSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHBvc2l0aW9uOiBwb3NpdGlvbnMsXG4gICAgICBub3JtYWw6IG5vcm1hbHMsXG4gICAgICB0ZXhjb29yZDogdGV4Y29vcmRzLFxuICAgICAgaW5kaWNlczogaW5kaWNlcyxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgUkxFIGRhdGFcbiAgICogQHBhcmFtIHtudW1iZXJbXX0gcmxlRGF0YSBkYXRhIGluIGZvcm1hdCBvZiBydW4tbGVuZ3RoLCB4LCB5LCB6LCBydW4tbGVuZ3RoLCB4LCB5LCB6XG4gICAqIEBwYXJhbSB7bnVtYmVyW119IFtwYWRkaW5nXSB2YWx1ZSB0byBhZGQgZWFjaCBlbnRyeSB3aXRoLlxuICAgKiBAcmV0dXJuIHtudW1iZXJbXX0gdGhlIGV4cGFuZGVkIHJsZURhdGFcbiAgICovXG4gIGZ1bmN0aW9uIGV4cGFuZFJMRURhdGEocmxlRGF0YSwgcGFkZGluZykge1xuICAgIHBhZGRpbmcgPSBwYWRkaW5nIHx8IFtdO1xuICAgIHZhciBkYXRhID0gW107XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHJsZURhdGEubGVuZ3RoOyBpaSArPSA0KSB7XG4gICAgICB2YXIgcnVuTGVuZ3RoID0gcmxlRGF0YVtpaV07XG4gICAgICB2YXIgZWxlbWVudCA9IHJsZURhdGEuc2xpY2UoaWkgKyAxLCBpaSArIDQpO1xuICAgICAgZWxlbWVudC5wdXNoLmFwcGx5KGVsZW1lbnQsIHBhZGRpbmcpO1xuICAgICAgZm9yICh2YXIgamogPSAwOyBqaiA8IHJ1bkxlbmd0aDsgKytqaikge1xuICAgICAgICBkYXRhLnB1c2guYXBwbHkoZGF0YSwgZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgM0QgJ0YnIEJ1ZmZlckluZm8uXG4gICAqIEFuICdGJyBpcyB1c2VmdWwgYmVjYXVzZSB5b3UgY2FuIGVhc2lseSB0ZWxsIHdoaWNoIHdheSBpdCBpcyBvcmllbnRlZC5cbiAgICogVGhlIGNyZWF0ZWQgJ0YnIGhhcyBwb3NpdGlvbiwgbm9ybWFsLCB0ZXhjb29yZCwgYW5kIGNvbG9yIGJ1ZmZlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBUaGUgY3JlYXRlZCBCdWZmZXJJbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlM0RGQnVmZmVySW5mb1xuICAgKi9cblxuICAvKipcbiAgICogQ3JlYXRlcyAzRCAnRicgYnVmZmVycy5cbiAgICogQW4gJ0YnIGlzIHVzZWZ1bCBiZWNhdXNlIHlvdSBjYW4gZWFzaWx5IHRlbGwgd2hpY2ggd2F5IGl0IGlzIG9yaWVudGVkLlxuICAgKiBUaGUgY3JlYXRlZCAnRicgaGFzIHBvc2l0aW9uLCBub3JtYWwsIHRleGNvb3JkLCBhbmQgY29sb3IgYnVmZmVycy5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBXZWJHTEJ1ZmZlcj59IFRoZSBjcmVhdGVkIGJ1ZmZlcnMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGUzREZCdWZmZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIDNEICdGJyB2ZXJ0aWNlcy5cbiAgICogQW4gJ0YnIGlzIHVzZWZ1bCBiZWNhdXNlIHlvdSBjYW4gZWFzaWx5IHRlbGwgd2hpY2ggd2F5IGl0IGlzIG9yaWVudGVkLlxuICAgKiBUaGUgY3JlYXRlZCAnRicgaGFzIHBvc2l0aW9uLCBub3JtYWwsIHRleGNvb3JkLCBhbmQgY29sb3IgYXJyYXlzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgVHlwZWRBcnJheT59IFRoZSBjcmVhdGVkIHZlcnRpY2VzLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlM0RGVmVydGljZXMoKSB7XG5cbiAgICB2YXIgcG9zaXRpb25zID0gW1xuICAgICAgLy8gbGVmdCBjb2x1bW4gZnJvbnRcbiAgICAgIDAsICAgMCwgIDAsXG4gICAgICAwLCAxNTAsICAwLFxuICAgICAgMzAsICAgMCwgIDAsXG4gICAgICAwLCAxNTAsICAwLFxuICAgICAgMzAsIDE1MCwgIDAsXG4gICAgICAzMCwgICAwLCAgMCxcblxuICAgICAgLy8gdG9wIHJ1bmcgZnJvbnRcbiAgICAgIDMwLCAgIDAsICAwLFxuICAgICAgMzAsICAzMCwgIDAsXG4gICAgICAxMDAsICAgMCwgIDAsXG4gICAgICAzMCwgIDMwLCAgMCxcbiAgICAgIDEwMCwgIDMwLCAgMCxcbiAgICAgIDEwMCwgICAwLCAgMCxcblxuICAgICAgLy8gbWlkZGxlIHJ1bmcgZnJvbnRcbiAgICAgIDMwLCAgNjAsICAwLFxuICAgICAgMzAsICA5MCwgIDAsXG4gICAgICA2NywgIDYwLCAgMCxcbiAgICAgIDMwLCAgOTAsICAwLFxuICAgICAgNjcsICA5MCwgIDAsXG4gICAgICA2NywgIDYwLCAgMCxcblxuICAgICAgLy8gbGVmdCBjb2x1bW4gYmFja1xuICAgICAgICAwLCAgIDAsICAzMCxcbiAgICAgICAzMCwgICAwLCAgMzAsXG4gICAgICAgIDAsIDE1MCwgIDMwLFxuICAgICAgICAwLCAxNTAsICAzMCxcbiAgICAgICAzMCwgICAwLCAgMzAsXG4gICAgICAgMzAsIDE1MCwgIDMwLFxuXG4gICAgICAvLyB0b3AgcnVuZyBiYWNrXG4gICAgICAgMzAsICAgMCwgIDMwLFxuICAgICAgMTAwLCAgIDAsICAzMCxcbiAgICAgICAzMCwgIDMwLCAgMzAsXG4gICAgICAgMzAsICAzMCwgIDMwLFxuICAgICAgMTAwLCAgIDAsICAzMCxcbiAgICAgIDEwMCwgIDMwLCAgMzAsXG5cbiAgICAgIC8vIG1pZGRsZSBydW5nIGJhY2tcbiAgICAgICAzMCwgIDYwLCAgMzAsXG4gICAgICAgNjcsICA2MCwgIDMwLFxuICAgICAgIDMwLCAgOTAsICAzMCxcbiAgICAgICAzMCwgIDkwLCAgMzAsXG4gICAgICAgNjcsICA2MCwgIDMwLFxuICAgICAgIDY3LCAgOTAsICAzMCxcblxuICAgICAgLy8gdG9wXG4gICAgICAgIDAsICAgMCwgICAwLFxuICAgICAgMTAwLCAgIDAsICAgMCxcbiAgICAgIDEwMCwgICAwLCAgMzAsXG4gICAgICAgIDAsICAgMCwgICAwLFxuICAgICAgMTAwLCAgIDAsICAzMCxcbiAgICAgICAgMCwgICAwLCAgMzAsXG5cbiAgICAgIC8vIHRvcCBydW5nIGZyb250XG4gICAgICAxMDAsICAgMCwgICAwLFxuICAgICAgMTAwLCAgMzAsICAgMCxcbiAgICAgIDEwMCwgIDMwLCAgMzAsXG4gICAgICAxMDAsICAgMCwgICAwLFxuICAgICAgMTAwLCAgMzAsICAzMCxcbiAgICAgIDEwMCwgICAwLCAgMzAsXG5cbiAgICAgIC8vIHVuZGVyIHRvcCBydW5nXG4gICAgICAzMCwgICAzMCwgICAwLFxuICAgICAgMzAsICAgMzAsICAzMCxcbiAgICAgIDEwMCwgIDMwLCAgMzAsXG4gICAgICAzMCwgICAzMCwgICAwLFxuICAgICAgMTAwLCAgMzAsICAzMCxcbiAgICAgIDEwMCwgIDMwLCAgIDAsXG5cbiAgICAgIC8vIGJldHdlZW4gdG9wIHJ1bmcgYW5kIG1pZGRsZVxuICAgICAgMzAsICAgMzAsICAgMCxcbiAgICAgIDMwLCAgIDYwLCAgMzAsXG4gICAgICAzMCwgICAzMCwgIDMwLFxuICAgICAgMzAsICAgMzAsICAgMCxcbiAgICAgIDMwLCAgIDYwLCAgIDAsXG4gICAgICAzMCwgICA2MCwgIDMwLFxuXG4gICAgICAvLyB0b3Agb2YgbWlkZGxlIHJ1bmdcbiAgICAgIDMwLCAgIDYwLCAgIDAsXG4gICAgICA2NywgICA2MCwgIDMwLFxuICAgICAgMzAsICAgNjAsICAzMCxcbiAgICAgIDMwLCAgIDYwLCAgIDAsXG4gICAgICA2NywgICA2MCwgICAwLFxuICAgICAgNjcsICAgNjAsICAzMCxcblxuICAgICAgLy8gZnJvbnQgb2YgbWlkZGxlIHJ1bmdcbiAgICAgIDY3LCAgIDYwLCAgIDAsXG4gICAgICA2NywgICA5MCwgIDMwLFxuICAgICAgNjcsICAgNjAsICAzMCxcbiAgICAgIDY3LCAgIDYwLCAgIDAsXG4gICAgICA2NywgICA5MCwgICAwLFxuICAgICAgNjcsICAgOTAsICAzMCxcblxuICAgICAgLy8gYm90dG9tIG9mIG1pZGRsZSBydW5nLlxuICAgICAgMzAsICAgOTAsICAgMCxcbiAgICAgIDMwLCAgIDkwLCAgMzAsXG4gICAgICA2NywgICA5MCwgIDMwLFxuICAgICAgMzAsICAgOTAsICAgMCxcbiAgICAgIDY3LCAgIDkwLCAgMzAsXG4gICAgICA2NywgICA5MCwgICAwLFxuXG4gICAgICAvLyBmcm9udCBvZiBib3R0b21cbiAgICAgIDMwLCAgIDkwLCAgIDAsXG4gICAgICAzMCwgIDE1MCwgIDMwLFxuICAgICAgMzAsICAgOTAsICAzMCxcbiAgICAgIDMwLCAgIDkwLCAgIDAsXG4gICAgICAzMCwgIDE1MCwgICAwLFxuICAgICAgMzAsICAxNTAsICAzMCxcblxuICAgICAgLy8gYm90dG9tXG4gICAgICAwLCAgIDE1MCwgICAwLFxuICAgICAgMCwgICAxNTAsICAzMCxcbiAgICAgIDMwLCAgMTUwLCAgMzAsXG4gICAgICAwLCAgIDE1MCwgICAwLFxuICAgICAgMzAsICAxNTAsICAzMCxcbiAgICAgIDMwLCAgMTUwLCAgIDAsXG5cbiAgICAgIC8vIGxlZnQgc2lkZVxuICAgICAgMCwgICAwLCAgIDAsXG4gICAgICAwLCAgIDAsICAzMCxcbiAgICAgIDAsIDE1MCwgIDMwLFxuICAgICAgMCwgICAwLCAgIDAsXG4gICAgICAwLCAxNTAsICAzMCxcbiAgICAgIDAsIDE1MCwgICAwLFxuICAgIF07XG5cbiAgICB2YXIgdGV4Y29vcmRzID0gW1xuICAgICAgLy8gbGVmdCBjb2x1bW4gZnJvbnRcbiAgICAgIDAuMjIsIDAuMTksXG4gICAgICAwLjIyLCAwLjc5LFxuICAgICAgMC4zNCwgMC4xOSxcbiAgICAgIDAuMjIsIDAuNzksXG4gICAgICAwLjM0LCAwLjc5LFxuICAgICAgMC4zNCwgMC4xOSxcblxuICAgICAgLy8gdG9wIHJ1bmcgZnJvbnRcbiAgICAgIDAuMzQsIDAuMTksXG4gICAgICAwLjM0LCAwLjMxLFxuICAgICAgMC42MiwgMC4xOSxcbiAgICAgIDAuMzQsIDAuMzEsXG4gICAgICAwLjYyLCAwLjMxLFxuICAgICAgMC42MiwgMC4xOSxcblxuICAgICAgLy8gbWlkZGxlIHJ1bmcgZnJvbnRcbiAgICAgIDAuMzQsIDAuNDMsXG4gICAgICAwLjM0LCAwLjU1LFxuICAgICAgMC40OSwgMC40MyxcbiAgICAgIDAuMzQsIDAuNTUsXG4gICAgICAwLjQ5LCAwLjU1LFxuICAgICAgMC40OSwgMC40MyxcblxuICAgICAgLy8gbGVmdCBjb2x1bW4gYmFja1xuICAgICAgMCwgMCxcbiAgICAgIDEsIDAsXG4gICAgICAwLCAxLFxuICAgICAgMCwgMSxcbiAgICAgIDEsIDAsXG4gICAgICAxLCAxLFxuXG4gICAgICAvLyB0b3AgcnVuZyBiYWNrXG4gICAgICAwLCAwLFxuICAgICAgMSwgMCxcbiAgICAgIDAsIDEsXG4gICAgICAwLCAxLFxuICAgICAgMSwgMCxcbiAgICAgIDEsIDEsXG5cbiAgICAgIC8vIG1pZGRsZSBydW5nIGJhY2tcbiAgICAgIDAsIDAsXG4gICAgICAxLCAwLFxuICAgICAgMCwgMSxcbiAgICAgIDAsIDEsXG4gICAgICAxLCAwLFxuICAgICAgMSwgMSxcblxuICAgICAgLy8gdG9wXG4gICAgICAwLCAwLFxuICAgICAgMSwgMCxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAwLFxuICAgICAgMSwgMSxcbiAgICAgIDAsIDEsXG5cbiAgICAgIC8vIHRvcCBydW5nIGZyb250XG4gICAgICAwLCAwLFxuICAgICAgMSwgMCxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAwLFxuICAgICAgMSwgMSxcbiAgICAgIDAsIDEsXG5cbiAgICAgIC8vIHVuZGVyIHRvcCBydW5nXG4gICAgICAwLCAwLFxuICAgICAgMCwgMSxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAwLFxuICAgICAgMSwgMSxcbiAgICAgIDEsIDAsXG5cbiAgICAgIC8vIGJldHdlZW4gdG9wIHJ1bmcgYW5kIG1pZGRsZVxuICAgICAgMCwgMCxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAxLFxuICAgICAgMCwgMCxcbiAgICAgIDEsIDAsXG4gICAgICAxLCAxLFxuXG4gICAgICAvLyB0b3Agb2YgbWlkZGxlIHJ1bmdcbiAgICAgIDAsIDAsXG4gICAgICAxLCAxLFxuICAgICAgMCwgMSxcbiAgICAgIDAsIDAsXG4gICAgICAxLCAwLFxuICAgICAgMSwgMSxcblxuICAgICAgLy8gZnJvbnQgb2YgbWlkZGxlIHJ1bmdcbiAgICAgIDAsIDAsXG4gICAgICAxLCAxLFxuICAgICAgMCwgMSxcbiAgICAgIDAsIDAsXG4gICAgICAxLCAwLFxuICAgICAgMSwgMSxcblxuICAgICAgLy8gYm90dG9tIG9mIG1pZGRsZSBydW5nLlxuICAgICAgMCwgMCxcbiAgICAgIDAsIDEsXG4gICAgICAxLCAxLFxuICAgICAgMCwgMCxcbiAgICAgIDEsIDEsXG4gICAgICAxLCAwLFxuXG4gICAgICAvLyBmcm9udCBvZiBib3R0b21cbiAgICAgIDAsIDAsXG4gICAgICAxLCAxLFxuICAgICAgMCwgMSxcbiAgICAgIDAsIDAsXG4gICAgICAxLCAwLFxuICAgICAgMSwgMSxcblxuICAgICAgLy8gYm90dG9tXG4gICAgICAwLCAwLFxuICAgICAgMCwgMSxcbiAgICAgIDEsIDEsXG4gICAgICAwLCAwLFxuICAgICAgMSwgMSxcbiAgICAgIDEsIDAsXG5cbiAgICAgIC8vIGxlZnQgc2lkZVxuICAgICAgMCwgMCxcbiAgICAgIDAsIDEsXG4gICAgICAxLCAxLFxuICAgICAgMCwgMCxcbiAgICAgIDEsIDEsXG4gICAgICAxLCAwLFxuICAgIF07XG5cbiAgICB2YXIgbm9ybWFscyA9IGV4cGFuZFJMRURhdGEoW1xuICAgICAgLy8gbGVmdCBjb2x1bW4gZnJvbnRcbiAgICAgIC8vIHRvcCBydW5nIGZyb250XG4gICAgICAvLyBtaWRkbGUgcnVuZyBmcm9udFxuICAgICAgMTgsIDAsIDAsIDEsXG5cbiAgICAgIC8vIGxlZnQgY29sdW1uIGJhY2tcbiAgICAgIC8vIHRvcCBydW5nIGJhY2tcbiAgICAgIC8vIG1pZGRsZSBydW5nIGJhY2tcbiAgICAgIDE4LCAwLCAwLCAtMSxcblxuICAgICAgLy8gdG9wXG4gICAgICA2LCAwLCAxLCAwLFxuXG4gICAgICAvLyB0b3AgcnVuZyBmcm9udFxuICAgICAgNiwgMSwgMCwgMCxcblxuICAgICAgLy8gdW5kZXIgdG9wIHJ1bmdcbiAgICAgIDYsIDAsIC0xLCAwLFxuXG4gICAgICAvLyBiZXR3ZWVuIHRvcCBydW5nIGFuZCBtaWRkbGVcbiAgICAgIDYsIDEsIDAsIDAsXG5cbiAgICAgIC8vIHRvcCBvZiBtaWRkbGUgcnVuZ1xuICAgICAgNiwgMCwgMSwgMCxcblxuICAgICAgLy8gZnJvbnQgb2YgbWlkZGxlIHJ1bmdcbiAgICAgIDYsIDEsIDAsIDAsXG5cbiAgICAgIC8vIGJvdHRvbSBvZiBtaWRkbGUgcnVuZy5cbiAgICAgIDYsIDAsIC0xLCAwLFxuXG4gICAgICAvLyBmcm9udCBvZiBib3R0b21cbiAgICAgIDYsIDEsIDAsIDAsXG5cbiAgICAgIC8vIGJvdHRvbVxuICAgICAgNiwgMCwgLTEsIDAsXG5cbiAgICAgIC8vIGxlZnQgc2lkZVxuICAgICAgNiwgLTEsIDAsIDAsXG4gICAgXSk7XG5cbiAgICB2YXIgY29sb3JzID0gZXhwYW5kUkxFRGF0YShbXG4gICAgICAgICAgLy8gbGVmdCBjb2x1bW4gZnJvbnRcbiAgICAgICAgICAvLyB0b3AgcnVuZyBmcm9udFxuICAgICAgICAgIC8vIG1pZGRsZSBydW5nIGZyb250XG4gICAgICAgIDE4LCAyMDAsICA3MCwgMTIwLFxuXG4gICAgICAgICAgLy8gbGVmdCBjb2x1bW4gYmFja1xuICAgICAgICAgIC8vIHRvcCBydW5nIGJhY2tcbiAgICAgICAgICAvLyBtaWRkbGUgcnVuZyBiYWNrXG4gICAgICAgIDE4LCA4MCwgNzAsIDIwMCxcblxuICAgICAgICAgIC8vIHRvcFxuICAgICAgICA2LCA3MCwgMjAwLCAyMTAsXG5cbiAgICAgICAgICAvLyB0b3AgcnVuZyBmcm9udFxuICAgICAgICA2LCAyMDAsIDIwMCwgNzAsXG5cbiAgICAgICAgICAvLyB1bmRlciB0b3AgcnVuZ1xuICAgICAgICA2LCAyMTAsIDEwMCwgNzAsXG5cbiAgICAgICAgICAvLyBiZXR3ZWVuIHRvcCBydW5nIGFuZCBtaWRkbGVcbiAgICAgICAgNiwgMjEwLCAxNjAsIDcwLFxuXG4gICAgICAgICAgLy8gdG9wIG9mIG1pZGRsZSBydW5nXG4gICAgICAgIDYsIDcwLCAxODAsIDIxMCxcblxuICAgICAgICAgIC8vIGZyb250IG9mIG1pZGRsZSBydW5nXG4gICAgICAgIDYsIDEwMCwgNzAsIDIxMCxcblxuICAgICAgICAgIC8vIGJvdHRvbSBvZiBtaWRkbGUgcnVuZy5cbiAgICAgICAgNiwgNzYsIDIxMCwgMTAwLFxuXG4gICAgICAgICAgLy8gZnJvbnQgb2YgYm90dG9tXG4gICAgICAgIDYsIDE0MCwgMjEwLCA4MCxcblxuICAgICAgICAgIC8vIGJvdHRvbVxuICAgICAgICA2LCA5MCwgMTMwLCAxMTAsXG5cbiAgICAgICAgICAvLyBsZWZ0IHNpZGVcbiAgICAgICAgNiwgMTYwLCAxNjAsIDIyMCxcbiAgICBdLCBbMjU1XSk7XG5cbiAgICB2YXIgbnVtVmVydHMgPSBwb3NpdGlvbnMubGVuZ3RoIC8gMztcblxuICAgIHZhciBhcnJheXMgPSB7XG4gICAgICBwb3NpdGlvbjogY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0cyksXG4gICAgICB0ZXhjb29yZDogY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgyLCAgbnVtVmVydHMpLFxuICAgICAgbm9ybWFsOiBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRzKSxcbiAgICAgIGNvbG9yOiBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDQsIG51bVZlcnRzLCBVaW50OEFycmF5KSxcbiAgICAgIGluZGljZXM6IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgbnVtVmVydHMgLyAzLCBVaW50MTZBcnJheSksXG4gICAgfTtcblxuICAgIGFycmF5cy5wb3NpdGlvbi5wdXNoKHBvc2l0aW9ucyk7XG4gICAgYXJyYXlzLnRleGNvb3JkLnB1c2godGV4Y29vcmRzKTtcbiAgICBhcnJheXMubm9ybWFsLnB1c2gobm9ybWFscyk7XG4gICAgYXJyYXlzLmNvbG9yLnB1c2goY29sb3JzKTtcblxuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1WZXJ0czsgKytpaSkge1xuICAgICAgYXJyYXlzLmluZGljZXMucHVzaChpaSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycmF5cztcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGNyZXNlbnQgQnVmZmVySW5mby5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZXJ0aWNhbFJhZGl1cyBUaGUgdmVydGljYWwgcmFkaXVzIG9mIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3V0ZXJSYWRpdXMgVGhlIG91dGVyIHJhZGl1cyBvZiB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGlubmVyUmFkaXVzIFRoZSBpbm5lciByYWRpdXMgb2YgdGhlIGNyZXNlbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aGlja25lc3MgVGhlIHRoaWNrbmVzcyBvZiB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc0Rvd24gbnVtYmVyIG9mIHN0ZXBzIGFyb3VuZCB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc1RoaWNrIG51bWJlciBvZiB2ZXJ0aWNhbGx5IG9uIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0T2Zmc2V0XSBXaGVyZSB0byBzdGFydCBhcmMuIERlZmF1bHQgMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtlbmRPZmZzZXRdIFdoZXJlIHRvIGVuZCBhcmcuIERlZmF1bHQgMS5cbiAgICogQHJldHVybiB7bW9kdWxlOnR3Z2wuQnVmZmVySW5mb30gVGhlIGNyZWF0ZWQgQnVmZmVySW5mby5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZUNyZXNlbnRCdWZmZXJJbmZvXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGNyZXNlbnQgYnVmZmVycy5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZXJ0aWNhbFJhZGl1cyBUaGUgdmVydGljYWwgcmFkaXVzIG9mIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3V0ZXJSYWRpdXMgVGhlIG91dGVyIHJhZGl1cyBvZiB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGlubmVyUmFkaXVzIFRoZSBpbm5lciByYWRpdXMgb2YgdGhlIGNyZXNlbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aGlja25lc3MgVGhlIHRoaWNrbmVzcyBvZiB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc0Rvd24gbnVtYmVyIG9mIHN0ZXBzIGFyb3VuZCB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc1RoaWNrIG51bWJlciBvZiB2ZXJ0aWNhbGx5IG9uIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0T2Zmc2V0XSBXaGVyZSB0byBzdGFydCBhcmMuIERlZmF1bHQgMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtlbmRPZmZzZXRdIFdoZXJlIHRvIGVuZCBhcmcuIERlZmF1bHQgMS5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFdlYkdMQnVmZmVyPn0gVGhlIGNyZWF0ZWQgYnVmZmVycy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZUNyZXNlbnRCdWZmZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGNyZXNlbnQgdmVydGljZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2ZXJ0aWNhbFJhZGl1cyBUaGUgdmVydGljYWwgcmFkaXVzIG9mIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3V0ZXJSYWRpdXMgVGhlIG91dGVyIHJhZGl1cyBvZiB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGlubmVyUmFkaXVzIFRoZSBpbm5lciByYWRpdXMgb2YgdGhlIGNyZXNlbnQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aGlja25lc3MgVGhlIHRoaWNrbmVzcyBvZiB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc0Rvd24gbnVtYmVyIG9mIHN0ZXBzIGFyb3VuZCB0aGUgY3Jlc2VudC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHN1YmRpdmlzaW9uc1RoaWNrIG51bWJlciBvZiB2ZXJ0aWNhbGx5IG9uIHRoZSBjcmVzZW50LlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0T2Zmc2V0XSBXaGVyZSB0byBzdGFydCBhcmMuIERlZmF1bHQgMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtlbmRPZmZzZXRdIFdoZXJlIHRvIGVuZCBhcmcuIERlZmF1bHQgMS5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+fSBUaGUgY3JlYXRlZCB2ZXJ0aWNlcy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gICBmdW5jdGlvbiBjcmVhdGVDcmVzZW50VmVydGljZXMoXG4gICAgICB2ZXJ0aWNhbFJhZGl1cyxcbiAgICAgIG91dGVyUmFkaXVzLFxuICAgICAgaW5uZXJSYWRpdXMsXG4gICAgICB0aGlja25lc3MsXG4gICAgICBzdWJkaXZpc2lvbnNEb3duLFxuICAgICAgc3RhcnRPZmZzZXQsXG4gICAgICBlbmRPZmZzZXQpIHtcbiAgICBpZiAoc3ViZGl2aXNpb25zRG93biA8PSAwKSB7XG4gICAgICB0aHJvdyBFcnJvcignc3ViZGl2aXNpb25Eb3duIG11c3QgYmUgPiAwJyk7XG4gICAgfVxuXG4gICAgc3RhcnRPZmZzZXQgPSBzdGFydE9mZnNldCB8fCAwO1xuICAgIGVuZE9mZnNldCAgID0gZW5kT2Zmc2V0IHx8IDE7XG5cbiAgICB2YXIgc3ViZGl2aXNpb25zVGhpY2sgPSAyO1xuXG4gICAgdmFyIG9mZnNldFJhbmdlID0gZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXQ7XG4gICAgdmFyIG51bVZlcnRpY2VzID0gKHN1YmRpdmlzaW9uc0Rvd24gKyAxKSAqIDIgKiAoMiArIHN1YmRpdmlzaW9uc1RoaWNrKTtcbiAgICB2YXIgcG9zaXRpb25zICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgbm9ybWFscyAgICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgdGV4Y29vcmRzICAgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDIsIG51bVZlcnRpY2VzKTtcblxuICAgIGZ1bmN0aW9uIGxlcnAoYSwgYiwgcykge1xuICAgICAgcmV0dXJuIGEgKyAoYiAtIGEpICogcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVBcmMoYXJjUmFkaXVzLCB4LCBub3JtYWxNdWx0LCBub3JtYWxBZGQsIHVNdWx0LCB1QWRkKSB7XG4gICAgICBmb3IgKHZhciB6ID0gMDsgeiA8PSBzdWJkaXZpc2lvbnNEb3duOyB6KyspIHtcbiAgICAgICAgdmFyIHVCYWNrID0geCAvIChzdWJkaXZpc2lvbnNUaGljayAtIDEpO1xuICAgICAgICB2YXIgdiA9IHogLyBzdWJkaXZpc2lvbnNEb3duO1xuICAgICAgICB2YXIgeEJhY2sgPSAodUJhY2sgLSAwLjUpICogMjtcbiAgICAgICAgdmFyIGFuZ2xlID0gKHN0YXJ0T2Zmc2V0ICsgKHYgKiBvZmZzZXRSYW5nZSkpICogTWF0aC5QSTtcbiAgICAgICAgdmFyIHMgPSBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgIHZhciBjID0gTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICB2YXIgcmFkaXVzID0gbGVycCh2ZXJ0aWNhbFJhZGl1cywgYXJjUmFkaXVzLCBzKTtcbiAgICAgICAgdmFyIHB4ID0geEJhY2sgKiB0aGlja25lc3M7XG4gICAgICAgIHZhciBweSA9IGMgKiB2ZXJ0aWNhbFJhZGl1cztcbiAgICAgICAgdmFyIHB6ID0gcyAqIHJhZGl1cztcbiAgICAgICAgcG9zaXRpb25zLnB1c2gocHgsIHB5LCBweik7XG4gICAgICAgIHZhciBuID0gdjMuYWRkKHYzLm11bHRpcGx5KFswLCBzLCBjXSwgbm9ybWFsTXVsdCksIG5vcm1hbEFkZCk7XG4gICAgICAgIG5vcm1hbHMucHVzaChuKTtcbiAgICAgICAgdGV4Y29vcmRzLnB1c2godUJhY2sgKiB1TXVsdCArIHVBZGQsIHYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIHRoZSBpbmRpdmlkdWFsIHZlcnRpY2VzIGluIG91ciB2ZXJ0ZXggYnVmZmVyLlxuICAgIGZvciAodmFyIHggPSAwOyB4IDwgc3ViZGl2aXNpb25zVGhpY2s7IHgrKykge1xuICAgICAgdmFyIHVCYWNrID0gKHggLyAoc3ViZGl2aXNpb25zVGhpY2sgLSAxKSAtIDAuNSkgKiAyO1xuICAgICAgY3JlYXRlQXJjKG91dGVyUmFkaXVzLCB4LCBbMSwgMSwgMV0sIFswLCAgICAgMCwgMF0sIDEsIDApO1xuICAgICAgY3JlYXRlQXJjKG91dGVyUmFkaXVzLCB4LCBbMCwgMCwgMF0sIFt1QmFjaywgMCwgMF0sIDAsIDApO1xuICAgICAgY3JlYXRlQXJjKGlubmVyUmFkaXVzLCB4LCBbMSwgMSwgMV0sIFswLCAgICAgMCwgMF0sIDEsIDApO1xuICAgICAgY3JlYXRlQXJjKGlubmVyUmFkaXVzLCB4LCBbMCwgMCwgMF0sIFt1QmFjaywgMCwgMF0sIDAsIDEpO1xuICAgIH1cblxuICAgIC8vIERvIG91dGVyIHN1cmZhY2UuXG4gICAgdmFyIGluZGljZXMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDMsIChzdWJkaXZpc2lvbnNEb3duICogMikgKiAoMiArIHN1YmRpdmlzaW9uc1RoaWNrKSwgVWludDE2QXJyYXkpO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlU3VyZmFjZShsZWZ0QXJjT2Zmc2V0LCByaWdodEFyY09mZnNldCkge1xuICAgICAgZm9yICh2YXIgeiA9IDA7IHogPCBzdWJkaXZpc2lvbnNEb3duOyArK3opIHtcbiAgICAgICAgLy8gTWFrZSB0cmlhbmdsZSAxIG9mIHF1YWQuXG4gICAgICAgIGluZGljZXMucHVzaChcbiAgICAgICAgICAgIGxlZnRBcmNPZmZzZXQgKyB6ICsgMCxcbiAgICAgICAgICAgIGxlZnRBcmNPZmZzZXQgKyB6ICsgMSxcbiAgICAgICAgICAgIHJpZ2h0QXJjT2Zmc2V0ICsgeiArIDApO1xuXG4gICAgICAgIC8vIE1ha2UgdHJpYW5nbGUgMiBvZiBxdWFkLlxuICAgICAgICBpbmRpY2VzLnB1c2goXG4gICAgICAgICAgICBsZWZ0QXJjT2Zmc2V0ICsgeiArIDEsXG4gICAgICAgICAgICByaWdodEFyY09mZnNldCArIHogKyAxLFxuICAgICAgICAgICAgcmlnaHRBcmNPZmZzZXQgKyB6ICsgMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG51bVZlcnRpY2VzRG93biA9IHN1YmRpdmlzaW9uc0Rvd24gKyAxO1xuICAgIC8vIGZyb250XG4gICAgY3JlYXRlU3VyZmFjZShudW1WZXJ0aWNlc0Rvd24gKiAwLCBudW1WZXJ0aWNlc0Rvd24gKiA0KTtcbiAgICAvLyByaWdodFxuICAgIGNyZWF0ZVN1cmZhY2UobnVtVmVydGljZXNEb3duICogNSwgbnVtVmVydGljZXNEb3duICogNyk7XG4gICAgLy8gYmFja1xuICAgIGNyZWF0ZVN1cmZhY2UobnVtVmVydGljZXNEb3duICogNiwgbnVtVmVydGljZXNEb3duICogMik7XG4gICAgLy8gbGVmdFxuICAgIGNyZWF0ZVN1cmZhY2UobnVtVmVydGljZXNEb3duICogMywgbnVtVmVydGljZXNEb3duICogMSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcG9zaXRpb246IHBvc2l0aW9ucyxcbiAgICAgIG5vcm1hbDogICBub3JtYWxzLFxuICAgICAgdGV4Y29vcmQ6IHRleGNvb3JkcyxcbiAgICAgIGluZGljZXM6ICBpbmRpY2VzLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBjeWxpbmRlciBCdWZmZXJJbmZvLiBUaGUgY3lsaW5kZXIgd2lsbCBiZSBjcmVhdGVkIGFyb3VuZCB0aGUgb3JpZ2luXG4gICAqIGFsb25nIHRoZSB5LWF4aXMuXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIFJhZGl1cyBvZiBjeWxpbmRlci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBIZWlnaHQgb2YgY3lsaW5kZXIuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYWxTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgYXJvdW5kIHRoZSBjeWxpbmRlci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZlcnRpY2FsU3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGRvd24gdGhlIGN5bGluZGVyLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt0b3BDYXBdIENyZWF0ZSB0b3AgY2FwLiBEZWZhdWx0ID0gdHJ1ZS5cbiAgICogQHBhcmFtIHtib29sZWFufSBbYm90dG9tQ2FwXSBDcmVhdGUgYm90dG9tIGNhcC4gRGVmYXVsdCA9IHRydWUuXG4gICAqIEByZXR1cm4ge21vZHVsZTp0d2dsLkJ1ZmZlckluZm99IFRoZSBjcmVhdGVkIEJ1ZmZlckluZm8uXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVDeWxpbmRlckJ1ZmZlckluZm9cbiAgICovXG5cbiAgIC8qKlxuICAgICogQ3JlYXRlcyBjeWxpbmRlciBidWZmZXJzLiBUaGUgY3lsaW5kZXIgd2lsbCBiZSBjcmVhdGVkIGFyb3VuZCB0aGUgb3JpZ2luXG4gICAgKiBhbG9uZyB0aGUgeS1heGlzLlxuICAgICpcbiAgICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyBSYWRpdXMgb2YgY3lsaW5kZXIuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiBjeWxpbmRlci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYWxTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgYXJvdW5kIHRoZSBjeWxpbmRlci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2ZXJ0aWNhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBkb3duIHRoZSBjeWxpbmRlci5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3RvcENhcF0gQ3JlYXRlIHRvcCBjYXAuIERlZmF1bHQgPSB0cnVlLlxuICAgICogQHBhcmFtIHtib29sZWFufSBbYm90dG9tQ2FwXSBDcmVhdGUgYm90dG9tIGNhcC4gRGVmYXVsdCA9IHRydWUuXG4gICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgV2ViR0xCdWZmZXI+fSBUaGUgY3JlYXRlZCBidWZmZXJzLlxuICAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICAqIEBmdW5jdGlvbiBjcmVhdGVDeWxpbmRlckJ1ZmZlcnNcbiAgICAqL1xuXG4gICAvKipcbiAgICAqIENyZWF0ZXMgY3lsaW5kZXIgdmVydGljZXMuIFRoZSBjeWxpbmRlciB3aWxsIGJlIGNyZWF0ZWQgYXJvdW5kIHRoZSBvcmlnaW5cbiAgICAqIGFsb25nIHRoZSB5LWF4aXMuXG4gICAgKlxuICAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyBSYWRpdXMgb2YgY3lsaW5kZXIuXG4gICAgKiBAcGFyYW0ge251bWJlcn0gaGVpZ2h0IEhlaWdodCBvZiBjeWxpbmRlci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYWxTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgYXJvdW5kIHRoZSBjeWxpbmRlci5cbiAgICAqIEBwYXJhbSB7bnVtYmVyfSB2ZXJ0aWNhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBkb3duIHRoZSBjeWxpbmRlci5cbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3RvcENhcF0gQ3JlYXRlIHRvcCBjYXAuIERlZmF1bHQgPSB0cnVlLlxuICAgICogQHBhcmFtIHtib29sZWFufSBbYm90dG9tQ2FwXSBDcmVhdGUgYm90dG9tIGNhcC4gRGVmYXVsdCA9IHRydWUuXG4gICAgKiBAcmV0dXJuIHtPYmplY3QuPHN0cmluZywgVHlwZWRBcnJheT59IFRoZSBjcmVhdGVkIHZlcnRpY2VzLlxuICAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICAqL1xuICBmdW5jdGlvbiBjcmVhdGVDeWxpbmRlclZlcnRpY2VzKFxuICAgICAgcmFkaXVzLFxuICAgICAgaGVpZ2h0LFxuICAgICAgcmFkaWFsU3ViZGl2aXNpb25zLFxuICAgICAgdmVydGljYWxTdWJkaXZpc2lvbnMsXG4gICAgICB0b3BDYXAsXG4gICAgICBib3R0b21DYXApIHtcbiAgICByZXR1cm4gY3JlYXRlVHJ1bmNhdGVkQ29uZVZlcnRpY2VzKFxuICAgICAgICByYWRpdXMsXG4gICAgICAgIHJhZGl1cyxcbiAgICAgICAgaGVpZ2h0LFxuICAgICAgICByYWRpYWxTdWJkaXZpc2lvbnMsXG4gICAgICAgIHZlcnRpY2FsU3ViZGl2aXNpb25zLFxuICAgICAgICB0b3BDYXAsXG4gICAgICAgIGJvdHRvbUNhcCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBCdWZmZXJJbmZvIGZvciBhIHRvcnVzXG4gICAqXG4gICAqIEBwYXJhbSB7V2ViR0xSZW5kZXJpbmdDb250ZXh0fSBnbCBUaGUgV2ViR0xSZW5kZXJpbmdDb250ZXh0LlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIHJhZGl1cyBvZiBjZW50ZXIgb2YgdG9ydXMgY2lyY2xlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gdGhpY2tuZXNzIHJhZGl1cyBvZiB0b3J1cyByaW5nLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaWFsU3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGFyb3VuZCB0aGUgdG9ydXMuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBib2R5U3ViZGl2aXNpb25zIFRoZSBudW1iZXIgb2Ygc3ViZGl2aXNpb25zIGFyb3VuZCB0aGUgYm9keSB0b3J1cy5cbiAgICogQHBhcmFtIHtib29sZWFufSBbc3RhcnRBbmdsZV0gc3RhcnQgYW5nbGUgaW4gcmFkaWFucy4gRGVmYXVsdCA9IDAuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2VuZEFuZ2xlXSBlbmQgYW5nbGUgaW4gcmFkaWFucy4gRGVmYXVsdCA9IE1hdGguUEkgKiAyLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBUaGUgY3JlYXRlZCBCdWZmZXJJbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlVG9ydXNCdWZmZXJJbmZvXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGJ1ZmZlcnMgZm9yIGEgdG9ydXNcbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgcmFkaXVzIG9mIGNlbnRlciBvZiB0b3J1cyBjaXJjbGUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB0aGlja25lc3MgcmFkaXVzIG9mIHRvcnVzIHJpbmcuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpYWxTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgYXJvdW5kIHRoZSB0b3J1cy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJvZHlTdWJkaXZpc2lvbnMgVGhlIG51bWJlciBvZiBzdWJkaXZpc2lvbnMgYXJvdW5kIHRoZSBib2R5IHRvcnVzLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtzdGFydEFuZ2xlXSBzdGFydCBhbmdsZSBpbiByYWRpYW5zLiBEZWZhdWx0ID0gMC5cbiAgICogQHBhcmFtIHtib29sZWFufSBbZW5kQW5nbGVdIGVuZCBhbmdsZSBpbiByYWRpYW5zLiBEZWZhdWx0ID0gTWF0aC5QSSAqIDIuXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBXZWJHTEJ1ZmZlcj59IFRoZSBjcmVhdGVkIGJ1ZmZlcnMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVUb3J1c0J1ZmZlcnNcbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgdmVydGljZXMgZm9yIGEgdG9ydXNcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyByYWRpdXMgb2YgY2VudGVyIG9mIHRvcnVzIGNpcmNsZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHRoaWNrbmVzcyByYWRpdXMgb2YgdG9ydXMgcmluZy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGlhbFN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlIHRvcnVzLlxuICAgKiBAcGFyYW0ge251bWJlcn0gYm9keVN1YmRpdmlzaW9ucyBUaGUgbnVtYmVyIG9mIHN1YmRpdmlzaW9ucyBhcm91bmQgdGhlIGJvZHkgdG9ydXMuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW3N0YXJ0QW5nbGVdIHN0YXJ0IGFuZ2xlIGluIHJhZGlhbnMuIERlZmF1bHQgPSAwLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtlbmRBbmdsZV0gZW5kIGFuZ2xlIGluIHJhZGlhbnMuIERlZmF1bHQgPSBNYXRoLlBJICogMi5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFR5cGVkQXJyYXk+fSBUaGUgY3JlYXRlZCB2ZXJ0aWNlcy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG4gIGZ1bmN0aW9uIGNyZWF0ZVRvcnVzVmVydGljZXMoXG4gICAgICByYWRpdXMsXG4gICAgICB0aGlja25lc3MsXG4gICAgICByYWRpYWxTdWJkaXZpc2lvbnMsXG4gICAgICBib2R5U3ViZGl2aXNpb25zLFxuICAgICAgc3RhcnRBbmdsZSxcbiAgICAgIGVuZEFuZ2xlKSB7XG4gICAgaWYgKHJhZGlhbFN1YmRpdmlzaW9ucyA8IDMpIHtcbiAgICAgIHRocm93IEVycm9yKCdyYWRpYWxTdWJkaXZpc2lvbnMgbXVzdCBiZSAzIG9yIGdyZWF0ZXInKTtcbiAgICB9XG5cbiAgICBpZiAoYm9keVN1YmRpdmlzaW9ucyA8IDMpIHtcbiAgICAgIHRocm93IEVycm9yKCd2ZXJ0aWNhbFN1YmRpdmlzaW9ucyBtdXN0IGJlIDMgb3IgZ3JlYXRlcicpO1xuICAgIH1cblxuICAgIHN0YXJ0QW5nbGUgPSBzdGFydEFuZ2xlIHx8IDA7XG4gICAgZW5kQW5nbGUgPSBlbmRBbmdsZSB8fCBNYXRoLlBJICogMjtcbiAgICByYW5nZSA9IGVuZEFuZ2xlIC0gc3RhcnRBbmdsZTtcblxuICAgIHZhciByYWRpYWxQYXJ0cyA9IHJhZGlhbFN1YmRpdmlzaW9ucyArIDE7XG4gICAgdmFyIGJvZHlQYXJ0cyAgID0gYm9keVN1YmRpdmlzaW9ucyArIDE7XG4gICAgdmFyIG51bVZlcnRpY2VzID0gcmFkaWFsUGFydHMgKiBib2R5UGFydHM7XG4gICAgdmFyIHBvc2l0aW9ucyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIG5vcm1hbHMgICAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIHRleGNvb3JkcyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgyLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIGluZGljZXMgICAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCAocmFkaWFsU3ViZGl2aXNpb25zKSAqIChib2R5U3ViZGl2aXNpb25zKSAqIDIsIFVpbnQxNkFycmF5KTtcblxuICAgIGZvciAodmFyIHNsaWNlID0gMDsgc2xpY2UgPCBib2R5UGFydHM7ICsrc2xpY2UpIHtcbiAgICAgIHZhciB2ID0gc2xpY2UgLyBib2R5U3ViZGl2aXNpb25zO1xuICAgICAgdmFyIHNsaWNlQW5nbGUgPSB2ICogTWF0aC5QSSAqIDI7XG4gICAgICB2YXIgc2xpY2VTaW4gPSBNYXRoLnNpbihzbGljZUFuZ2xlKTtcbiAgICAgIHZhciByaW5nUmFkaXVzID0gcmFkaXVzICsgc2xpY2VTaW4gKiB0aGlja25lc3M7XG4gICAgICB2YXIgbnkgPSBNYXRoLmNvcyhzbGljZUFuZ2xlKTtcbiAgICAgIHZhciB5ID0gbnkgKiB0aGlja25lc3M7XG4gICAgICBmb3IgKHZhciByaW5nID0gMDsgcmluZyA8IHJhZGlhbFBhcnRzOyArK3JpbmcpIHtcbiAgICAgICAgdmFyIHUgPSByaW5nIC8gcmFkaWFsU3ViZGl2aXNpb25zO1xuICAgICAgICB2YXIgcmluZ0FuZ2xlID0gc3RhcnRBbmdsZSArIHUgKiByYW5nZTtcbiAgICAgICAgdmFyIHhTaW4gPSBNYXRoLnNpbihyaW5nQW5nbGUpO1xuICAgICAgICB2YXIgekNvcyA9IE1hdGguY29zKHJpbmdBbmdsZSk7XG4gICAgICAgIHZhciB4ID0geFNpbiAqIHJpbmdSYWRpdXM7XG4gICAgICAgIHZhciB6ID0gekNvcyAqIHJpbmdSYWRpdXM7XG4gICAgICAgIHZhciBueCA9IHhTaW4gKiBzbGljZVNpbjtcbiAgICAgICAgdmFyIG56ID0gekNvcyAqIHNsaWNlU2luO1xuICAgICAgICBwb3NpdGlvbnMucHVzaCh4LCB5LCB6KTtcbiAgICAgICAgbm9ybWFscy5wdXNoKG54LCBueSwgbnopO1xuICAgICAgICB0ZXhjb29yZHMucHVzaCh1LCAxIC0gdik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgc2xpY2UgPSAwOyBzbGljZSA8IGJvZHlTdWJkaXZpc2lvbnM7ICsrc2xpY2UpIHsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIGZvciAodmFyIHJpbmcgPSAwOyByaW5nIDwgcmFkaWFsU3ViZGl2aXNpb25zOyArK3JpbmcpIHsgIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgdmFyIG5leHRSaW5nSW5kZXggID0gMSArIHJpbmc7XG4gICAgICAgIHZhciBuZXh0U2xpY2VJbmRleCA9IDEgKyBzbGljZTtcbiAgICAgICAgaW5kaWNlcy5wdXNoKHJhZGlhbFBhcnRzICogc2xpY2UgICAgICAgICAgKyByaW5nLFxuICAgICAgICAgICAgICAgICAgICAgcmFkaWFsUGFydHMgKiBuZXh0U2xpY2VJbmRleCArIHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICByYWRpYWxQYXJ0cyAqIHNsaWNlICAgICAgICAgICsgbmV4dFJpbmdJbmRleCk7XG4gICAgICAgIGluZGljZXMucHVzaChyYWRpYWxQYXJ0cyAqIG5leHRTbGljZUluZGV4ICsgcmluZyxcbiAgICAgICAgICAgICAgICAgICAgIHJhZGlhbFBhcnRzICogbmV4dFNsaWNlSW5kZXggKyBuZXh0UmluZ0luZGV4LFxuICAgICAgICAgICAgICAgICAgICAgcmFkaWFsUGFydHMgKiBzbGljZSAgICAgICAgICArIG5leHRSaW5nSW5kZXgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25zLFxuICAgICAgbm9ybWFsOiAgIG5vcm1hbHMsXG4gICAgICB0ZXhjb29yZDogdGV4Y29vcmRzLFxuICAgICAgaW5kaWNlczogIGluZGljZXMsXG4gICAgfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkaXNjIEJ1ZmZlckluZm8uIFRoZSBkaXNjIHdpbGwgYmUgaW4gdGhlIHh6IHBsYW5lLCBjZW50ZXJlZCBhdFxuICAgKiB0aGUgb3JpZ2luLiBXaGVuIGNyZWF0aW5nLCBhdCBsZWFzdCAzIGRpdmlzaW9ucywgb3IgcGllXG4gICAqIHBpZWNlcywgbmVlZCB0byBiZSBzcGVjaWZpZWQsIG90aGVyd2lzZSB0aGUgdHJpYW5nbGVzIG1ha2luZ1xuICAgKiB1cCB0aGUgZGlzYyB3aWxsIGJlIGRlZ2VuZXJhdGUuIFlvdSBjYW4gYWxzbyBzcGVjaWZ5IHRoZVxuICAgKiBudW1iZXIgb2YgcmFkaWFsIHBpZWNlcyBgc3RhY2tzYC4gQSB2YWx1ZSBvZiAxIGZvclxuICAgKiBzdGFja3Mgd2lsbCBnaXZlIHlvdSBhIHNpbXBsZSBkaXNjIG9mIHBpZSBwaWVjZXMuICBJZiB5b3VcbiAgICogd2FudCB0byBjcmVhdGUgYW4gYW5udWx1cyB5b3UgY2FuIHNldCBgaW5uZXJSYWRpdXNgIHRvIGFcbiAgICogdmFsdWUgPiAwLiBGaW5hbGx5LCBgc3RhY2tQb3dlcmAgYWxsb3dzIHlvdSB0byBoYXZlIHRoZSB3aWR0aHNcbiAgICogaW5jcmVhc2Ugb3IgZGVjcmVhc2UgYXMgeW91IG1vdmUgYXdheSBmcm9tIHRoZSBjZW50ZXIuIFRoaXNcbiAgICogaXMgcGFydGljdWxhcmx5IHVzZWZ1bCB3aGVuIHVzaW5nIHRoZSBkaXNjIGFzIGEgZ3JvdW5kIHBsYW5lXG4gICAqIHdpdGggYSBmaXhlZCBjYW1lcmEgc3VjaCB0aGF0IHlvdSBkb24ndCBuZWVkIHRoZSByZXNvbHV0aW9uXG4gICAqIG9mIHNtYWxsIHRyaWFuZ2xlcyBuZWFyIHRoZSBwZXJpbWV0ZXIuIEZvciBleGFtcGxlLCBhIHZhbHVlXG4gICAqIG9mIDIgd2lsbCBwcm9kdWNlIHN0YWNrcyB3aG9zZSBvdXNpZGUgcmFkaXVzIGluY3JlYXNlcyB3aXRoXG4gICAqIHRoZSBzcXVhcmUgb2YgdGhlIHN0YWNrIGluZGV4LiBBIHZhbHVlIG9mIDEgd2lsbCBnaXZlIHVuaWZvcm1cbiAgICogc3RhY2tzLlxuICAgKlxuICAgKiBAcGFyYW0ge1dlYkdMUmVuZGVyaW5nQ29udGV4dH0gZ2wgVGhlIFdlYkdMUmVuZGVyaW5nQ29udGV4dC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHJhZGl1cyBSYWRpdXMgb2YgdGhlIGdyb3VuZCBwbGFuZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGRpdmlzaW9ucyBOdW1iZXIgb2YgdHJpYW5nbGVzIGluIHRoZSBncm91bmQgcGxhbmUgKGF0IGxlYXN0IDMpLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YWNrc10gTnVtYmVyIG9mIHJhZGlhbCBkaXZpc2lvbnMgKGRlZmF1bHQ9MSkuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbaW5uZXJSYWRpdXNdIERlZmF1bHQgMC5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdGFja1Bvd2VyXSBQb3dlciB0byByYWlzZSBzdGFjayBzaXplIHRvIGZvciBkZWNyZWFzaW5nIHdpZHRoLlxuICAgKiBAcmV0dXJuIHttb2R1bGU6dHdnbC5CdWZmZXJJbmZvfSBUaGUgY3JlYXRlZCBCdWZmZXJJbmZvLlxuICAgKiBAbWVtYmVyT2YgbW9kdWxlOnR3Z2wvcHJpbWl0aXZlc1xuICAgKiBAZnVuY3Rpb24gY3JlYXRlRGlzY0J1ZmZlckluZm9cbiAgICovXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgZGlzYyBidWZmZXJzLiBUaGUgZGlzYyB3aWxsIGJlIGluIHRoZSB4eiBwbGFuZSwgY2VudGVyZWQgYXRcbiAgICogdGhlIG9yaWdpbi4gV2hlbiBjcmVhdGluZywgYXQgbGVhc3QgMyBkaXZpc2lvbnMsIG9yIHBpZVxuICAgKiBwaWVjZXMsIG5lZWQgdG8gYmUgc3BlY2lmaWVkLCBvdGhlcndpc2UgdGhlIHRyaWFuZ2xlcyBtYWtpbmdcbiAgICogdXAgdGhlIGRpc2Mgd2lsbCBiZSBkZWdlbmVyYXRlLiBZb3UgY2FuIGFsc28gc3BlY2lmeSB0aGVcbiAgICogbnVtYmVyIG9mIHJhZGlhbCBwaWVjZXMgYHN0YWNrc2AuIEEgdmFsdWUgb2YgMSBmb3JcbiAgICogc3RhY2tzIHdpbGwgZ2l2ZSB5b3UgYSBzaW1wbGUgZGlzYyBvZiBwaWUgcGllY2VzLiAgSWYgeW91XG4gICAqIHdhbnQgdG8gY3JlYXRlIGFuIGFubnVsdXMgeW91IGNhbiBzZXQgYGlubmVyUmFkaXVzYCB0byBhXG4gICAqIHZhbHVlID4gMC4gRmluYWxseSwgYHN0YWNrUG93ZXJgIGFsbG93cyB5b3UgdG8gaGF2ZSB0aGUgd2lkdGhzXG4gICAqIGluY3JlYXNlIG9yIGRlY3JlYXNlIGFzIHlvdSBtb3ZlIGF3YXkgZnJvbSB0aGUgY2VudGVyLiBUaGlzXG4gICAqIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgd2hlbiB1c2luZyB0aGUgZGlzYyBhcyBhIGdyb3VuZCBwbGFuZVxuICAgKiB3aXRoIGEgZml4ZWQgY2FtZXJhIHN1Y2ggdGhhdCB5b3UgZG9uJ3QgbmVlZCB0aGUgcmVzb2x1dGlvblxuICAgKiBvZiBzbWFsbCB0cmlhbmdsZXMgbmVhciB0aGUgcGVyaW1ldGVyLiBGb3IgZXhhbXBsZSwgYSB2YWx1ZVxuICAgKiBvZiAyIHdpbGwgcHJvZHVjZSBzdGFja3Mgd2hvc2Ugb3VzaWRlIHJhZGl1cyBpbmNyZWFzZXMgd2l0aFxuICAgKiB0aGUgc3F1YXJlIG9mIHRoZSBzdGFjayBpbmRleC4gQSB2YWx1ZSBvZiAxIHdpbGwgZ2l2ZSB1bmlmb3JtXG4gICAqIHN0YWNrcy5cbiAgICpcbiAgICogQHBhcmFtIHtXZWJHTFJlbmRlcmluZ0NvbnRleHR9IGdsIFRoZSBXZWJHTFJlbmRlcmluZ0NvbnRleHQuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSByYWRpdXMgUmFkaXVzIG9mIHRoZSBncm91bmQgcGxhbmUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBkaXZpc2lvbnMgTnVtYmVyIG9mIHRyaWFuZ2xlcyBpbiB0aGUgZ3JvdW5kIHBsYW5lIChhdCBsZWFzdCAzKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtzdGFja3NdIE51bWJlciBvZiByYWRpYWwgZGl2aXNpb25zIChkZWZhdWx0PTEpLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW2lubmVyUmFkaXVzXSBEZWZhdWx0IDAuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhY2tQb3dlcl0gUG93ZXIgdG8gcmFpc2Ugc3RhY2sgc2l6ZSB0byBmb3IgZGVjcmVhc2luZyB3aWR0aC5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIFdlYkdMQnVmZmVyPn0gVGhlIGNyZWF0ZWQgYnVmZmVycy5cbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICogQGZ1bmN0aW9uIGNyZWF0ZURpc2NCdWZmZXJzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGRpc2MgdmVydGljZXMuIFRoZSBkaXNjIHdpbGwgYmUgaW4gdGhlIHh6IHBsYW5lLCBjZW50ZXJlZCBhdFxuICAgKiB0aGUgb3JpZ2luLiBXaGVuIGNyZWF0aW5nLCBhdCBsZWFzdCAzIGRpdmlzaW9ucywgb3IgcGllXG4gICAqIHBpZWNlcywgbmVlZCB0byBiZSBzcGVjaWZpZWQsIG90aGVyd2lzZSB0aGUgdHJpYW5nbGVzIG1ha2luZ1xuICAgKiB1cCB0aGUgZGlzYyB3aWxsIGJlIGRlZ2VuZXJhdGUuIFlvdSBjYW4gYWxzbyBzcGVjaWZ5IHRoZVxuICAgKiBudW1iZXIgb2YgcmFkaWFsIHBpZWNlcyBgc3RhY2tzYC4gQSB2YWx1ZSBvZiAxIGZvclxuICAgKiBzdGFja3Mgd2lsbCBnaXZlIHlvdSBhIHNpbXBsZSBkaXNjIG9mIHBpZSBwaWVjZXMuICBJZiB5b3VcbiAgICogd2FudCB0byBjcmVhdGUgYW4gYW5udWx1cyB5b3UgY2FuIHNldCBgaW5uZXJSYWRpdXNgIHRvIGFcbiAgICogdmFsdWUgPiAwLiBGaW5hbGx5LCBgc3RhY2tQb3dlcmAgYWxsb3dzIHlvdSB0byBoYXZlIHRoZSB3aWR0aHNcbiAgICogaW5jcmVhc2Ugb3IgZGVjcmVhc2UgYXMgeW91IG1vdmUgYXdheSBmcm9tIHRoZSBjZW50ZXIuIFRoaXNcbiAgICogaXMgcGFydGljdWxhcmx5IHVzZWZ1bCB3aGVuIHVzaW5nIHRoZSBkaXNjIGFzIGEgZ3JvdW5kIHBsYW5lXG4gICAqIHdpdGggYSBmaXhlZCBjYW1lcmEgc3VjaCB0aGF0IHlvdSBkb24ndCBuZWVkIHRoZSByZXNvbHV0aW9uXG4gICAqIG9mIHNtYWxsIHRyaWFuZ2xlcyBuZWFyIHRoZSBwZXJpbWV0ZXIuIEZvciBleGFtcGxlLCBhIHZhbHVlXG4gICAqIG9mIDIgd2lsbCBwcm9kdWNlIHN0YWNrcyB3aG9zZSBvdXNpZGUgcmFkaXVzIGluY3JlYXNlcyB3aXRoXG4gICAqIHRoZSBzcXVhcmUgb2YgdGhlIHN0YWNrIGluZGV4LiBBIHZhbHVlIG9mIDEgd2lsbCBnaXZlIHVuaWZvcm1cbiAgICogc3RhY2tzLlxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIFJhZGl1cyBvZiB0aGUgZ3JvdW5kIHBsYW5lLlxuICAgKiBAcGFyYW0ge251bWJlcn0gZGl2aXNpb25zIE51bWJlciBvZiB0cmlhbmdsZXMgaW4gdGhlIGdyb3VuZCBwbGFuZSAoYXQgbGVhc3QgMykuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhY2tzXSBOdW1iZXIgb2YgcmFkaWFsIGRpdmlzaW9ucyAoZGVmYXVsdD0xKS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtpbm5lclJhZGl1c10gRGVmYXVsdCAwLlxuICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YWNrUG93ZXJdIFBvd2VyIHRvIHJhaXNlIHN0YWNrIHNpemUgdG8gZm9yIGRlY3JlYXNpbmcgd2lkdGguXG4gICAqIEByZXR1cm4ge09iamVjdC48c3RyaW5nLCBUeXBlZEFycmF5Pn0gVGhlIGNyZWF0ZWQgdmVydGljZXMuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVEaXNjVmVydGljZXMoXG4gICAgICByYWRpdXMsXG4gICAgICBkaXZpc2lvbnMsXG4gICAgICBzdGFja3MsXG4gICAgICBpbm5lclJhZGl1cyxcbiAgICAgIHN0YWNrUG93ZXIpIHtcbiAgICBpZiAoZGl2aXNpb25zIDwgMykge1xuICAgICAgdGhyb3cgRXJyb3IoJ2RpdmlzaW9ucyBtdXN0IGJlIGF0IGxlYXN0IDMnKTtcbiAgICB9XG5cbiAgICBzdGFja3MgPSBzdGFja3MgPyBzdGFja3MgOiAxO1xuICAgIHN0YWNrUG93ZXIgPSBzdGFja1Bvd2VyID8gc3RhY2tQb3dlciA6IDE7XG4gICAgaW5uZXJSYWRpdXMgPSBpbm5lclJhZGl1cyA/IGlubmVyUmFkaXVzIDogMDtcblxuICAgIC8vIE5vdGU6IFdlIGRvbid0IHNoYXJlIHRoZSBjZW50ZXIgdmVydGV4IGJlY2F1c2UgdGhhdCB3b3VsZFxuICAgIC8vIG1lc3MgdXAgdGV4dHVyZSBjb29yZGluYXRlcy5cbiAgICB2YXIgbnVtVmVydGljZXMgPSAoZGl2aXNpb25zICsgMSkgKiAoc3RhY2tzICsgMSk7XG5cbiAgICB2YXIgcG9zaXRpb25zID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBudW1WZXJ0aWNlcyk7XG4gICAgdmFyIG5vcm1hbHMgICA9IGNyZWF0ZUF1Z21lbnRlZFR5cGVkQXJyYXkoMywgbnVtVmVydGljZXMpO1xuICAgIHZhciB0ZXhjb29yZHMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDIsIG51bVZlcnRpY2VzKTtcbiAgICB2YXIgaW5kaWNlcyAgID0gY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheSgzLCBzdGFja3MgKiBkaXZpc2lvbnMgKiAyLCBVaW50MTZBcnJheSk7XG5cbiAgICB2YXIgZmlyc3RJbmRleCA9IDA7XG4gICAgdmFyIHJhZGl1c1NwYW4gPSByYWRpdXMgLSBpbm5lclJhZGl1cztcblxuICAgIC8vIEJ1aWxkIHRoZSBkaXNrIG9uZSBzdGFjayBhdCBhIHRpbWUuXG4gICAgZm9yICh2YXIgc3RhY2sgPSAwOyBzdGFjayA8PSBzdGFja3M7ICsrc3RhY2spIHtcbiAgICAgIHZhciBzdGFja1JhZGl1cyA9IGlubmVyUmFkaXVzICsgcmFkaXVzU3BhbiAqIE1hdGgucG93KHN0YWNrIC8gc3RhY2tzLCBzdGFja1Bvd2VyKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gZGl2aXNpb25zOyArK2kpIHtcbiAgICAgICAgdmFyIHRoZXRhID0gMi4wICogTWF0aC5QSSAqIGkgLyBkaXZpc2lvbnM7XG4gICAgICAgIHZhciB4ID0gc3RhY2tSYWRpdXMgKiBNYXRoLmNvcyh0aGV0YSk7XG4gICAgICAgIHZhciB6ID0gc3RhY2tSYWRpdXMgKiBNYXRoLnNpbih0aGV0YSk7XG5cbiAgICAgICAgcG9zaXRpb25zLnB1c2goeCwgMCwgeik7XG4gICAgICAgIG5vcm1hbHMucHVzaCgwLCAxLCAwKTtcbiAgICAgICAgdGV4Y29vcmRzLnB1c2goMSAtIChpIC8gZGl2aXNpb25zKSwgc3RhY2sgLyBzdGFja3MpO1xuICAgICAgICBpZiAoc3RhY2sgPiAwICYmIGkgIT09IGRpdmlzaW9ucykge1xuICAgICAgICAgIC8vIGEsIGIsIGMgYW5kIGQgYXJlIHRoZSBpbmRpY2VzIG9mIHRoZSB2ZXJ0aWNlcyBvZiBhIHF1YWQuICB1bmxlc3NcbiAgICAgICAgICAvLyB0aGUgY3VycmVudCBzdGFjayBpcyB0aGUgb25lIGNsb3Nlc3QgdG8gdGhlIGNlbnRlciwgaW4gd2hpY2ggY2FzZVxuICAgICAgICAgIC8vIHRoZSB2ZXJ0aWNlcyBhIGFuZCBiIGNvbm5lY3QgdG8gdGhlIGNlbnRlciB2ZXJ0ZXguXG4gICAgICAgICAgdmFyIGEgPSBmaXJzdEluZGV4ICsgKGkgKyAxKTtcbiAgICAgICAgICB2YXIgYiA9IGZpcnN0SW5kZXggKyBpO1xuICAgICAgICAgIHZhciBjID0gZmlyc3RJbmRleCArIGkgLSBkaXZpc2lvbnM7XG4gICAgICAgICAgdmFyIGQgPSBmaXJzdEluZGV4ICsgKGkgKyAxKSAtIGRpdmlzaW9ucztcblxuICAgICAgICAgIC8vIE1ha2UgYSBxdWFkIG9mIHRoZSB2ZXJ0aWNlcyBhLCBiLCBjLCBkLlxuICAgICAgICAgIGluZGljZXMucHVzaChhLCBiLCBjKTtcbiAgICAgICAgICBpbmRpY2VzLnB1c2goYSwgYywgZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZmlyc3RJbmRleCArPSBkaXZpc2lvbnMgKyAxO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogcG9zaXRpb25zLFxuICAgICAgbm9ybWFsOiBub3JtYWxzLFxuICAgICAgdGV4Y29vcmQ6IHRleGNvb3JkcyxcbiAgICAgIGluZGljZXM6IGluZGljZXMsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiAwIGFuZCByYW5nZSAtIDEgaW5jbHVzaXZlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFuZ2VcbiAgICogQHJldHVybiB7bnVtYmVyfSByYW5kb20gdmFsdWUgYmV0d2VlbiAwIGFuZCByYW5nZSAtIDEgaW5jbHVzaXZlLlxuICAgKi9cbiAgZnVuY3Rpb24gcmFuZEludChyYW5nZSkge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogcmFuZ2UgfCAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gc3VwcGx5IHJhbmRvbSBjb2xvcnNcbiAgICogQGNhbGxiYWNrIFJhbmRvbUNvbG9yRnVuY1xuICAgKiBAcGFyYW0ge251bWJlcn0gbmR4IGluZGV4IG9mIHRyaWFuZ2xlL3F1YWQgaWYgdW5pbmRleGVkIG9yIGluZGV4IG9mIHZlcnRleCBpZiBpbmRleGVkXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBjaGFubmVsIDAgPSByZWQsIDEgPSBncmVlbiwgMiA9IGJsdWUsIDMgPSBhbHBoYVxuICAgKiBAcmV0dXJuIHtudW1iZXJ9IGEgbnVtYmVyIGZyb20gMCB0byAyNTVcbiAgICogQG1lbWJlck9mIG1vZHVsZTp0d2dsL3ByaW1pdGl2ZXNcbiAgICovXG5cbiAgLyoqXG4gICAqIEB0eXBlZGVmIHtPYmplY3R9IFJhbmRvbVZlcnRpY2VzT3B0aW9uc1xuICAgKiBAcHJvcGVydHkge251bWJlcn0gW3ZlcnRzUGVyQ29sb3JdIERlZmF1bHRzIHRvIDMgZm9yIG5vbi1pbmRleGVkIHZlcnRpY2VzXG4gICAqIEBwcm9wZXJ0eSB7bW9kdWxlOnR3Z2wvcHJpbWl0aXZlcy5SYW5kb21Db2xvckZ1bmN9IFtyYW5kXSBBIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIHJhbmRvbSBudW1iZXJzXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIGF1Z21lbnRlZFR5cGVkQXJyYXkgb2YgcmFuZG9tIHZlcnRleCBjb2xvcnMuXG4gICAqIElmIHRoZSB2ZXJ0aWNlcyBhcmUgaW5kZXhlZCAoaGF2ZSBhbiBpbmRpY2VzIGFycmF5KSB0aGVuIHdpbGxcbiAgICoganVzdCBtYWtlIHJhbmRvbSBjb2xvcnMuIE90aGVyd2lzZSBhc3N1bWVzIHRoZXkgYXJlIHRyaWFuZ2xlc3NcbiAgICogYW5kIG1ha2VzIG9uZSByYW5kb20gY29sb3IgZm9yIGV2ZXJ5IDMgdmVydGljZXMuXG4gICAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIGF1Z21lbnRlZFR5cGVkQXJyYXk+fSB2ZXJ0aWNlcyBWZXJ0aWNlcyBhcyByZXR1cm5lZCBmcm9tIG9uZSBvZiB0aGUgY3JlYXRlWFhYVmVydGljZXMgZnVuY3Rpb25zLlxuICAgKiBAcGFyYW0ge21vZHVsZTp0d2dsL3ByaW1pdGl2ZXMuUmFuZG9tVmVydGljZXNPcHRpb25zfSBbb3B0aW9uc10gb3B0aW9ucy5cbiAgICogQHJldHVybiB7T2JqZWN0LjxzdHJpbmcsIGF1Z21lbnRlZFR5cGVkQXJyYXk+fSBzYW1lIHZlcnRpY2VzIGFzIHBhc3NlZCBpbiB3aXRoIGBjb2xvcmAgYWRkZWQuXG4gICAqIEBtZW1iZXJPZiBtb2R1bGU6dHdnbC9wcmltaXRpdmVzXG4gICAqL1xuICBmdW5jdGlvbiBtYWtlUmFuZG9tVmVydGV4Q29sb3JzKHZlcnRpY2VzLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG51bUVsZW1lbnRzID0gdmVydGljZXMucG9zaXRpb24ubnVtRWxlbWVudHM7XG4gICAgdmFyIHZjb2xvcnMgPSBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5KDQsIG51bUVsZW1lbnRzLCBVaW50OEFycmF5KTtcbiAgICB2YXIgcmFuZCA9IG9wdGlvbnMucmFuZCB8fCBmdW5jdGlvbihuZHgsIGNoYW5uZWwpIHtcbiAgICAgIHJldHVybiBjaGFubmVsIDwgMyA/IHJhbmRJbnQoMjU2KSA6IDI1NTtcbiAgICB9O1xuICAgIHZlcnRpY2VzLmNvbG9yID0gdmNvbG9ycztcbiAgICBpZiAodmVydGljZXMuaW5kaWNlcykge1xuICAgICAgLy8ganVzdCBtYWtlIHJhbmRvbSBjb2xvcnMgaWYgaW5kZXhcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBudW1FbGVtZW50czsgKytpaSkge1xuICAgICAgICB2Y29sb3JzLnB1c2gocmFuZChpaSwgMCksIHJhbmQoaWksIDEpLCByYW5kKGlpLCAyKSwgcmFuZChpaSwgMykpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBtYWtlIHJhbmRvbSBjb2xvcnMgcGVyIHRyaWFuZ2xlXG4gICAgICB2YXIgbnVtVmVydHNQZXJDb2xvciA9IG9wdGlvbnMudmVydHNQZXJDb2xvciB8fCAzO1xuICAgICAgdmFyIG51bVNldHMgPSBudW1FbGVtZW50cyAvIG51bVZlcnRzUGVyQ29sb3I7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbnVtU2V0czsgKytpaSkgeyAgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICB2YXIgY29sb3IgPSBbcmFuZChpaSwgMCksIHJhbmQoaWksIDEpLCByYW5kKGlpLCAyKSwgcmFuZChpaSwgMyldO1xuICAgICAgICBmb3IgKHZhciBqaiA9IDA7IGpqIDwgbnVtVmVydHNQZXJDb2xvcjsgKytqaikge1xuICAgICAgICAgIHZjb2xvcnMucHVzaChjb2xvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZlcnRpY2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIGZuIHRvIGNyZWF0ZSB2ZXJ0aWNlcyBhbmQgdGhlblxuICAgKiBjcmVhdGVzIGEgYnVmZmVycyBmb3IgdGhlbVxuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQnVmZmVyRnVuYyhmbikge1xuICAgIHJldHVybiBmdW5jdGlvbihnbCkge1xuICAgICAgdmFyIGFycmF5cyA9IGZuLmFwcGx5KHRoaXMsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgcmV0dXJuIHR3Z2wuY3JlYXRlQnVmZmVyc0Zyb21BcnJheXMoZ2wsIGFycmF5cyk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBjYWxscyBmbiB0byBjcmVhdGUgdmVydGljZXMgYW5kIHRoZW5cbiAgICogY3JlYXRlcyBhIGJ1ZmZlckluZm8gb2JqZWN0IGZvciB0aGVtXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVCdWZmZXJJbmZvRnVuYyhmbikge1xuICAgIHJldHVybiBmdW5jdGlvbihnbCkge1xuICAgICAgdmFyIGFycmF5cyA9IGZuLmFwcGx5KG51bGwsICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgIHJldHVybiB0d2dsLmNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzKGdsLCBhcnJheXMpO1xuICAgIH07XG4gIH1cblxuICAvLyBVc2luZyBxdW90ZXMgcHJldmVudHMgVWdsaWZ5IGZyb20gY2hhbmdpbmcgdGhlIG5hbWVzLlxuICAvLyBObyBzcGVlZCBkaWZmIEFGQUlDVC5cbiAgcmV0dXJuIHtcbiAgICBcImNyZWF0ZTNERkJ1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlM0RGVmVydGljZXMpLFxuICAgIFwiY3JlYXRlM0RGQnVmZmVyc1wiOiBjcmVhdGVCdWZmZXJGdW5jKGNyZWF0ZTNERlZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZTNERlZlcnRpY2VzXCI6IGNyZWF0ZTNERlZlcnRpY2VzLFxuICAgIFwiY3JlYXRlQXVnbWVudGVkVHlwZWRBcnJheVwiOiBjcmVhdGVBdWdtZW50ZWRUeXBlZEFycmF5LFxuICAgIFwiY3JlYXRlQ3ViZUJ1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlQ3ViZVZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZUN1YmVCdWZmZXJzXCI6IGNyZWF0ZUJ1ZmZlckZ1bmMoY3JlYXRlQ3ViZVZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZUN1YmVWZXJ0aWNlc1wiOiBjcmVhdGVDdWJlVmVydGljZXMsXG4gICAgXCJjcmVhdGVQbGFuZUJ1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlUGxhbmVWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVQbGFuZUJ1ZmZlcnNcIjogY3JlYXRlQnVmZmVyRnVuYyhjcmVhdGVQbGFuZVZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZVBsYW5lVmVydGljZXNcIjogY3JlYXRlUGxhbmVWZXJ0aWNlcyxcbiAgICBcImNyZWF0ZVNwaGVyZUJ1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlU3BoZXJlVmVydGljZXMpLFxuICAgIFwiY3JlYXRlU3BoZXJlQnVmZmVyc1wiOiBjcmVhdGVCdWZmZXJGdW5jKGNyZWF0ZVNwaGVyZVZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZVNwaGVyZVZlcnRpY2VzXCI6IGNyZWF0ZVNwaGVyZVZlcnRpY2VzLFxuICAgIFwiY3JlYXRlVHJ1bmNhdGVkQ29uZUJ1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlVHJ1bmNhdGVkQ29uZVZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZVRydW5jYXRlZENvbmVCdWZmZXJzXCI6IGNyZWF0ZUJ1ZmZlckZ1bmMoY3JlYXRlVHJ1bmNhdGVkQ29uZVZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZVRydW5jYXRlZENvbmVWZXJ0aWNlc1wiOiBjcmVhdGVUcnVuY2F0ZWRDb25lVmVydGljZXMsXG4gICAgXCJjcmVhdGVYWVF1YWRCdWZmZXJJbmZvXCI6IGNyZWF0ZUJ1ZmZlckluZm9GdW5jKGNyZWF0ZVhZUXVhZFZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZVhZUXVhZEJ1ZmZlcnNcIjogY3JlYXRlQnVmZmVyRnVuYyhjcmVhdGVYWVF1YWRWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVYWVF1YWRWZXJ0aWNlc1wiOiBjcmVhdGVYWVF1YWRWZXJ0aWNlcyxcbiAgICBcImNyZWF0ZUNyZXNlbnRCdWZmZXJJbmZvXCI6IGNyZWF0ZUJ1ZmZlckluZm9GdW5jKGNyZWF0ZUNyZXNlbnRWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVDcmVzZW50QnVmZmVyc1wiOiBjcmVhdGVCdWZmZXJGdW5jKGNyZWF0ZUNyZXNlbnRWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVDcmVzZW50VmVydGljZXNcIjogY3JlYXRlQ3Jlc2VudFZlcnRpY2VzLFxuICAgIFwiY3JlYXRlQ3lsaW5kZXJCdWZmZXJJbmZvXCI6IGNyZWF0ZUJ1ZmZlckluZm9GdW5jKGNyZWF0ZUN5bGluZGVyVmVydGljZXMpLFxuICAgIFwiY3JlYXRlQ3lsaW5kZXJCdWZmZXJzXCI6IGNyZWF0ZUJ1ZmZlckZ1bmMoY3JlYXRlQ3lsaW5kZXJWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVDeWxpbmRlclZlcnRpY2VzXCI6IGNyZWF0ZUN5bGluZGVyVmVydGljZXMsXG4gICAgXCJjcmVhdGVUb3J1c0J1ZmZlckluZm9cIjogY3JlYXRlQnVmZmVySW5mb0Z1bmMoY3JlYXRlVG9ydXNWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVUb3J1c0J1ZmZlcnNcIjogY3JlYXRlQnVmZmVyRnVuYyhjcmVhdGVUb3J1c1ZlcnRpY2VzKSxcbiAgICBcImNyZWF0ZVRvcnVzVmVydGljZXNcIjogY3JlYXRlVG9ydXNWZXJ0aWNlcyxcbiAgICBcImNyZWF0ZURpc2NCdWZmZXJJbmZvXCI6IGNyZWF0ZUJ1ZmZlckluZm9GdW5jKGNyZWF0ZURpc2NWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVEaXNjQnVmZmVyc1wiOiBjcmVhdGVCdWZmZXJGdW5jKGNyZWF0ZURpc2NWZXJ0aWNlcyksXG4gICAgXCJjcmVhdGVEaXNjVmVydGljZXNcIjogY3JlYXRlRGlzY1ZlcnRpY2VzLFxuICAgIFwiZGVpbmRleFZlcnRpY2VzXCI6IGRlaW5kZXhWZXJ0aWNlcyxcbiAgICBcImZsYXR0ZW5Ob3JtYWxzXCI6IGZsYXR0ZW5Ob3JtYWxzLFxuICAgIFwibWFrZVJhbmRvbVZlcnRleENvbG9yc1wiOiBtYWtlUmFuZG9tVmVydGV4Q29sb3JzLFxuICAgIFwicmVvcmllbnREaXJlY3Rpb25zXCI6IHJlb3JpZW50RGlyZWN0aW9ucyxcbiAgICBcInJlb3JpZW50Tm9ybWFsc1wiOiByZW9yaWVudE5vcm1hbHMsXG4gICAgXCJyZW9yaWVudFBvc2l0aW9uc1wiOiByZW9yaWVudFBvc2l0aW9ucyxcbiAgICBcInJlb3JpZW50VmVydGljZXNcIjogcmVvcmllbnRWZXJ0aWNlcyxcbiAgfTtcblxufSk7XG5cbmRlZmluZSgnbWFpbicsIFtcbiAgICAndHdnbC90d2dsJyxcbiAgICAndHdnbC9tNCcsXG4gICAgJ3R3Z2wvdjMnLFxuICAgICd0d2dsL3ByaW1pdGl2ZXMnLFxuICBdLCBmdW5jdGlvbihcbiAgICB0d2dsLFxuICAgIG00LFxuICAgIHYzLFxuICAgIHByaW1pdGl2ZXNcbiAgKSB7XG4gICAgdHdnbC5tNCA9IG00O1xuICAgIHR3Z2wudjMgPSB2MztcbiAgICB0d2dsLnByaW1pdGl2ZXMgPSBwcmltaXRpdmVzO1xuICAgIHJldHVybiB0d2dsO1xufSlcblxubm90cmVxdWlyZWJlY2FzZWJyb3dzZXJpZnltZXNzZXN1cChbJ21haW4nXSwgZnVuY3Rpb24obWFpbikge1xuICByZXR1cm4gbWFpbjtcbn0sIHVuZGVmaW5lZCwgdHJ1ZSk7ICAgLy8gZm9yY2VTeW5jID0gdHJ1ZVxuXG5cbjtcbmRlZmluZShcImJ1aWxkL2pzL3R3Z2wtaW5jbHVkZXItZnVsbFwiLCBmdW5jdGlvbigpe30pO1xuXG4gICAgcmV0dXJuIG5vdHJlcXVpcmViZWNhc2Vicm93c2VyaWZ5bWVzc2VzdXAoJ21haW4nKTtcbn0pKTtcbiIsIi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgdGhlIFNwZWN0cmFsIEZsdXggb25zZXQgZGV0ZWN0aW9uIG1ldGhvZFxuICogZGVzY3JpYmVkIGluIFwiU2ltcGxlIFNwZWN0cnVtLUJhc2VkIE9uc2V0IERldGVjdGlvblwiIChodHRwOi8vd3d3Lm11c2ljLWlyLm9yZy9ldmFsdWF0aW9uL01JUkVYLzIwMDZfYWJzdHJhY3RzL09EX2RpeG9uLnBkZilcbiAqL1xuXG5pbXBvcnQgdHdnbCBmcm9tICd0d2dsLmpzJztcbmltcG9ydCB7XG4gIEF1ZGlvQ29udGV4dCxcbiAgV29ya2VyLFxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsXG4gIGxvYWRBdWRpbyxcbiAgcmVzaXplQ2FudmFzXG59IGZyb20gJy4vdXRpbHMnO1xuXG52YXIgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxudmFyIGlzT25zZXQgPSBmYWxzZTtcbnZhciBhbHBoYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbHBoYScpLnZhbHVlO1xudmFyIGRlbHRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbHRhJykudmFsdWU7XG5cbmZ1bmN0aW9uIGxvd1Bhc3NGaWx0ZXIgKG4sIGFscGhhLCBkYXRhKSB7XG4gIHZhciBhY2MgPSAwLjA7XG4gIGZvciAodmFyIGkgPSAwOyBpIDw9IG47IGkrKykge1xuICAgIGFjYyA9IE1hdGgubWF4KGRhdGFbbl0sIGFscGhhICogYWNjICsgKDEuMCAtIGFscGhhKSAqIGRhdGFbbl0pO1xuICB9XG4gIHJldHVybiBhY2M7XG59XG5cbmZ1bmN0aW9uIGRldGVjdE9uc2V0IChuLCBkYXRhLCBvcHRpb25zID0ge30pIHtcbiAgdmFyIHcgPSBvcHRpb25zLncgfHwgMztcbiAgdmFyIG0gPSBvcHRpb25zLm0gfHwgMztcbiAgdmFyIGRlbHRhID0gb3B0aW9ucy5kZWx0YSB8fCAwLjM7XG4gIHZhciBhbHBoYSA9IG9wdGlvbnMuYWxwaGEgfHwgMC4zO1xuXG4gIHZhciBsZW5ndGggPSBkYXRhLmxlbmd0aDtcbiAgdmFyIHZhbHVlID0gZGF0YVtuXTtcbiAgdmFyIGs7XG5cbiAgdmFyIGdyZWF0ZXJUaGFuU3Vycm91bmRpbmdWYWx1ZXMgPSB0cnVlO1xuICBmb3IgKGsgPSBuIC0gdzsgayA8PSBuICsgdzsgaysrKSB7XG4gICAgZ3JlYXRlclRoYW5TdXJyb3VuZGluZ1ZhbHVlcyA9IGdyZWF0ZXJUaGFuU3Vycm91bmRpbmdWYWx1ZXMgJiYgdmFsdWUgPj0gZGF0YVtNYXRoLm1heCgwLCBNYXRoLm1pbihrLCBsZW5ndGggLSAxKSldO1xuICB9XG5cbiAgdmFyIHN1bU9mTG9jYWxWYWx1ZXMgPSAwLjA7XG4gIGZvciAoayA9IG4gLSBtICogdzsgayA8PSBuICsgdzsgaysrKSB7XG4gICAgaWYgKGsgPj0gMCAmJiBrIDwgbGVuZ3RoKSB7XG4gICAgICBzdW1PZkxvY2FsVmFsdWVzICs9IGRhdGFba107XG4gICAgfVxuICB9XG4gIHZhciBhYm92ZUxvY2FsTWVhblRocmVzaG9sZCA9IHZhbHVlID49ICgoc3VtT2ZMb2NhbFZhbHVlcyAvIChtICogdyArIHcgKyAxKSkgKyBkZWx0YSk7XG5cbiAgdmFyIGFib3ZlTG93UGFzc0ZpbHRlciA9IHZhbHVlID49IGxvd1Bhc3NGaWx0ZXIobiAtIDEsIGFscGhhLCBkYXRhKTtcblxuICByZXR1cm4gZ3JlYXRlclRoYW5TdXJyb3VuZGluZ1ZhbHVlcyAmJiBhYm92ZUxvY2FsTWVhblRocmVzaG9sZCAmJiBhYm92ZUxvd1Bhc3NGaWx0ZXI7XG59XG5cbmZ1bmN0aW9uIHNldHVwQXVkaW9Ob2RlcyAoY29udGV4dCwgeyBzdGZ0RGF0YSwgc3BlY3RyYWxGbHV4RGF0YSwgbm9ybWFsaXplZFNwZWN0cmFsRmx1eERhdGEgfSkge1xuICB2YXIgc291cmNlTm9kZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gIHZhciBvbnNldERldGVjdG9yTm9kZSA9IGNvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKDUxMiwgMSwgMSk7XG5cbiAgb25zZXREZXRlY3Rvck5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiAoYXVkaW9Qcm9jZXNzaW5nRXZlbnQpIHtcbiAgICB2YXIgcGxheWJhY2tUaW1lID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQucGxheWJhY2tUaW1lO1xuICAgIC8vIHByZXByb2Nlc3NlZERhdGFCaW4gPSBwbGF5YmFja1RpbWUgKiA0NDEwMCAoc2FtcGxlIHJhdGUpIC8gNDQxIChTVEZUIGhvcCBzaXplKVxuICAgIHZhciBzcGVjdHJhbEZsdXhEYXRhQmluID0gTWF0aC5mbG9vcihwbGF5YmFja1RpbWUgKiAxMDApO1xuICAgIHZhciBhbHBoYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbHBoYScpLnZhbHVlO1xuICAgIHZhciBkZWx0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWx0YScpLnZhbHVlO1xuICAgIGlzT25zZXQgPSBkZXRlY3RPbnNldChzcGVjdHJhbEZsdXhEYXRhQmluLCBub3JtYWxpemVkU3BlY3RyYWxGbHV4RGF0YSk7XG5cbiAgICBpZiAoaXNPbnNldCkge1xuICAgICAgY29uc29sZS5sb2coYG9uc2V0IGF0OiAke3BsYXliYWNrVGltZX1gKTtcbiAgICB9XG5cbiAgICB2YXIgaW5wdXREYXRhID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQuaW5wdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG4gICAgdmFyIG91dHB1dERhdGEgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG5cbiAgICAvLyBwYXNzIGF1ZGlvIGRhdGEgdGhyb3VnaCB0byBkZXN0aW5hdGlvblxuICAgIGZvciAodmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50LmlucHV0QnVmZmVyLmxlbmd0aDsgc2FtcGxlKyspIHtcbiAgICAgIG91dHB1dERhdGFbc2FtcGxlXSA9IGlucHV0RGF0YVtzYW1wbGVdO1xuICAgIH1cbiAgfTtcblxuICBzb3VyY2VOb2RlLm9uZW5kZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgc291cmNlTm9kZS5kaXNjb25uZWN0KG9uc2V0RGV0ZWN0b3JOb2RlKTtcbiAgICBvbnNldERldGVjdG9yTm9kZS5kaXNjb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICB9O1xuXG4gIC8vc291cmNlTm9kZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICBzb3VyY2VOb2RlLmNvbm5lY3Qob25zZXREZXRlY3Rvck5vZGUpO1xuICBvbnNldERldGVjdG9yTm9kZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gIHJldHVybiB7XG4gICAgc291cmNlTm9kZTogc291cmNlTm9kZSxcbiAgICBvbnNldERldGVjdG9yTm9kZTogb25zZXREZXRlY3Rvck5vZGVcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmlzdWFsaXplICgpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYW52YXMnKTtcbiAgdmFyIGNhbnZhc0N0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAvKlxuICB2YXIgZ2wgPSB0d2dsLmdldFdlYkdMQ29udGV4dChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJykpO1xuICB2YXIgdmVydGV4U2hhZGVyID0gZ2xzbGlmeSgnLi9zaGFkZXJzL3ZlcnRleF9zaGFkZXIuZ2xzbCcpO1xuICB2YXIgZnJhZ21lbnRTaGFkZXIgPSBnbHNsaWZ5KCcuL3NoYWRlcnMvY2lyY2xlX3NoYWRlci5nbHNsJyk7XG4gIHZhciBwcm9ncmFtSW5mbyA9IHR3Z2wuY3JlYXRlUHJvZ3JhbUluZm8oZ2wsIFt2ZXJ0ZXhTaGFkZXIsIGZyYWdtZW50U2hhZGVyXSk7XG4gIHZhciBhcnJheXMgPSB7XG4gICAgcG9zaXRpb246IHtcbiAgICAgIG51bUNvbXBvbmVudHM6IDMsXG4gICAgICBkYXRhOiBbXG4gICAgICAvLyB0cmlhbmdsZSBjb3ZlcmluZyBsb3dlciBsZWZ0IGhhbGYgb2YgdGhlIHNjcmVlblxuICAgICAgLTEsIC0xLCAwLFxuICAgICAgIDEsIC0xLCAwLFxuICAgICAgLTEsIDEsIDAsXG4gICAgICAvLyB0cmlhbmdsZSBjb3ZlcmluZyB1cHBlciByaWdodCBoYWxmIG9mIHNjcmVlblxuICAgICAgLTEsIDEsIDAsXG4gICAgICAgMSwgLTEsIDAsXG4gICAgICAgMSwgMSwgMFxuICAgICAgXVxuICAgIH1cbiAgfTtcbiAgdmFyIGJ1ZmZlckluZm8gPSB0d2dsLmNyZWF0ZUJ1ZmZlckluZm9Gcm9tQXJyYXlzKGdsLCBhcnJheXMpO1xuICAqL1xuXG4gIGZ1bmN0aW9uIGRyYXcgKHRpbWUpIHtcbiAgICB0d2dsLnJlc2l6ZUNhbnZhc1RvRGlzcGxheVNpemUoY2FudmFzKTtcbiAgICB2YXIgd2lkdGggPSBjYW52YXMud2lkdGg7XG4gICAgdmFyIGhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG5cbiAgICBhbHBoYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhbHBoYScpLnZhbHVlIHx8IDAuNTtcbiAgICBkZWx0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWx0YScpLnZhbHVlIHx8IDA7XG5cbiAgICAvKlxuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG5cbiAgICB2YXIgdW5pZm9ybXMgPSB7XG4gICAgICB0aW1lOiB0aW1lICogMC4wMDEsXG4gICAgICByZXNvbHV0aW9uOiBbZ2wuY2FudmFzLndpZHRoLCBnbC5jYW52YXMuaGVpZ2h0XSxcbiAgICAgIGlzTm90ZU9uc2V0OiBpc09uc2V0XG4gICAgfTtcblxuICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbUluZm8ucHJvZ3JhbSk7XG4gICAgdHdnbC5zZXRCdWZmZXJzQW5kQXR0cmlidXRlcyhnbCwgcHJvZ3JhbUluZm8sIGJ1ZmZlckluZm8pO1xuICAgIHR3Z2wuc2V0VW5pZm9ybXMocHJvZ3JhbUluZm8sIHVuaWZvcm1zKTtcbiAgICB0d2dsLmRyYXdCdWZmZXJJbmZvKGdsLCBnbC5UUklBTkdMRVMsIGJ1ZmZlckluZm8pO1xuICAgICovXG5cbiAgICBjYW52YXNDdHguZmlsbFN0eWxlID0gJ3JnYigyMDAsIDIwMCwgMjAwKSc7XG4gICAgY2FudmFzQ3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgY2FudmFzQ3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgY2FudmFzQ3R4LnN0cm9rZVN0eWxlID0gJ3JnYigwLCAwLCAwKSc7XG5cbiAgICBjYW52YXNDdHguYmVnaW5QYXRoKCk7XG5cbiAgICB2YXIgeCA9IHdpZHRoIC8gMjtcbiAgICB2YXIgeSA9IGhlaWdodCAvIDI7XG4gICAgdmFyIHJhZGl1cyA9IGhlaWdodCAvIDM7XG4gICAgdmFyIGZyZXF1ZW5jeSA9IDEwO1xuICAgIHZhciBhbXAgPSAwLjEgKiB0aW1lO1xuICAgIHZhciBhbmdsZSwgZHgsIGR5O1xuXG4gICAgdmFyIHdhdmVBbXBsaXR1ZGUgPSAwLjAzO1xuICAgIHZhciB3YXZlRnJlcXVlbmN5ID0gNTA7XG4gICAgdmFyIHJvdGF0aW9uU3BlZWQgPSAwLjA1O1xuICAgIHZhciBvc2NpbGxhdGlvblNwZWVkID0gMC4wMDU7XG5cbiAgICBmb3IgKGFuZ2xlID0gMDsgYW5nbGUgPD0gMiAqIE1hdGguUEk7IGFuZ2xlICs9IDAuMDAxKSB7XG4gICAgICBkeCA9IHggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSkgKiAoMS4wICsgd2F2ZUFtcGxpdHVkZSAqIE1hdGguc2luKGFuZ2xlICogd2F2ZUZyZXF1ZW5jeSArIHJvdGF0aW9uU3BlZWQgKiB0aW1lKSAqIE1hdGguc2luKG9zY2lsbGF0aW9uU3BlZWQgKiB0aW1lKSk7XG4gICAgICBkeSA9IHkgKyByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSkgKiAoMS4wICsgd2F2ZUFtcGxpdHVkZSAqIE1hdGguc2luKGFuZ2xlICogd2F2ZUZyZXF1ZW5jeSArIHJvdGF0aW9uU3BlZWQgKiB0aW1lKSAqIE1hdGguc2luKG9zY2lsbGF0aW9uU3BlZWQgKiB0aW1lKSk7XG5cbiAgICAgIGlmIChhbmdsZSA9PT0gMCkge1xuICAgICAgICBjYW52YXNDdHgubW92ZVRvKGR4LCBkeSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYW52YXNDdHgubGluZVRvKGR4LCBkeSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY2FudmFzQ3R4LnN0cm9rZSgpO1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xuICB9XG5cbiAgdmFyIGNvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG4gIHZhciBzdGZ0V29ya2VyID0gbmV3IFdvcmtlcignanMvd29ya2Vycy9zdGZ0LXdvcmtlci5qcycpO1xuXG4gIGxvYWRBdWRpbyhjb250ZXh0LCAnc291bmRzL2ZsaW0ubXAzJykudGhlbihmdW5jdGlvbiAoYXVkaW9CdWZmZXIpIHtcbiAgICBsZXQgYXVkaW9CdWZmZXJEYXRhID0gYXVkaW9CdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCkuc2xpY2UoKTtcblxuICAgIHN0ZnRXb3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIGxldCBub2RlcyA9IHNldHVwQXVkaW9Ob2Rlcyhjb250ZXh0LCBlLmRhdGEpO1xuICAgICAgbm9kZXMuc291cmNlTm9kZS5idWZmZXIgPSBhdWRpb0J1ZmZlcjtcbiAgICAgIG5vZGVzLnNvdXJjZU5vZGUuc3RhcnQoMCk7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG4gICAgfTtcblxuICAgIHN0ZnRXb3JrZXIucG9zdE1lc3NhZ2UoYXVkaW9CdWZmZXJEYXRhLCBbYXVkaW9CdWZmZXJEYXRhLmJ1ZmZlcl0pO1xuICB9KTtcbn1cblxudmlzdWFsaXplKCk7XG4iLCJ2YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZ2xvYmFsLnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gIGdsb2JhbC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBnbG9iYWwubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgZ2xvYmFsLm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBnbG9iYWwubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGdsb2JhbC5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgICAgICAgIH07XG59KSgpO1xuXG52YXIgQXVkaW9Db250ZXh0ID0gZ2xvYmFsLkF1ZGlvQ29udGV4dCB8fCBnbG9iYWwud2Via2l0QXVkaW9Db250ZXh0O1xudmFyIE9mZmxpbmVBdWRpb0NvbnRleHQgPSBnbG9iYWwuT2ZmbGluZUF1ZGlvQ29udGV4dCB8fCBnbG9iYWwud2Via2l0T2ZmbGluZUF1ZGlvQ29udGV4dDtcbnZhciBXb3JrZXIgPSBnbG9iYWwuV29ya2VyIHx8IGdsb2JhbC53ZWJraXRXb3JrZXI7XG5cbmZ1bmN0aW9uIGxvYWRBdWRpbyAoYXVkaW9Db250ZXh0LCB1cmwpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcblxuICAgIHZhciBvbkRlY29kZVN1Y2Nlc3MgPSBmdW5jdGlvbiAoYnVmZmVyKSB7IHJlc29sdmUoYnVmZmVyKTsgfTtcbiAgICB2YXIgb25EZWNvZGVGYWlsdXJlID0gZnVuY3Rpb24gKGVycm9yKSB7IHJlamVjdChlcnJvcik7IH07XG5cbiAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGF1ZGlvQ29udGV4dC5kZWNvZGVBdWRpb0RhdGEocmVxdWVzdC5yZXNwb25zZSwgb25EZWNvZGVTdWNjZXNzLCBvbkRlY29kZUZhaWx1cmUpO1xuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZWplY3QoRXJyb3IoJ05ldHdvcmsgRXJyb3InKSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Quc2VuZCgpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVzaXplQ2FudmFzIChjYW52YXMpIHtcbiAgdmFyIGRpc3BsYXlXaWR0aCAgPSBjYW52YXMuY2xpZW50V2lkdGg7XG4gIHZhciBkaXNwbGF5SGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodDtcblxuICBpZiAoY2FudmFzLndpZHRoICE9PSBkaXNwbGF5V2lkdGggfHwgY2FudmFzLmhlaWdodCAhPT0gZGlzcGxheUhlaWdodCkge1xuICAgIGNhbnZhcy53aWR0aCAgPSBkaXNwbGF5V2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGRpc3BsYXlIZWlnaHQ7XG4gIH1cbn1cblxuZXhwb3J0IHtcbiAgQXVkaW9Db250ZXh0LFxuICBPZmZsaW5lQXVkaW9Db250ZXh0LFxuICBXb3JrZXIsXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgbG9hZEF1ZGlvLFxuICByZXNpemVDYW52YXNcbn07XG4iXX0=
