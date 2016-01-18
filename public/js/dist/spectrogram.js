(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/**
 * @license
 *
 * chroma.js - JavaScript library for color conversions
 * 
 * Copyright (c) 2011-2015, Gregor Aisch
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

(function() {
  var Color, DEG2RAD, LAB_CONSTANTS, PI, PITHIRD, RAD2DEG, TWOPI, _guess_formats, _guess_formats_sorted, _input, _interpolators, abs, atan2, bezier, blend, blend_f, brewer, burn, chroma, clip_rgb, cmyk2rgb, colors, cos, css2rgb, darken, dodge, each, floor, hex2rgb, hsi2rgb, hsl2css, hsl2rgb, hsv2rgb, interpolate, interpolate_hsx, interpolate_lab, interpolate_num, interpolate_rgb, lab2lch, lab2rgb, lab_xyz, lch2lab, lch2rgb, lighten, limit, log, luminance_x, m, max, multiply, normal, num2rgb, overlay, pow, rgb2cmyk, rgb2css, rgb2hex, rgb2hsi, rgb2hsl, rgb2hsv, rgb2lab, rgb2lch, rgb2luminance, rgb2num, rgb2temperature, rgb2xyz, rgb_xyz, rnd, root, round, screen, sin, sqrt, temperature2rgb, type, unpack, w3cx11, xyz_lab, xyz_rgb,
    slice = [].slice;

  type = (function() {

    /*
    for browser-safe type checking+
    ported from jQuery's $.type
     */
    var classToType, len, name, o, ref;
    classToType = {};
    ref = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
    for (o = 0, len = ref.length; o < len; o++) {
      name = ref[o];
      classToType["[object " + name + "]"] = name.toLowerCase();
    }
    return function(obj) {
      var strType;
      strType = Object.prototype.toString.call(obj);
      return classToType[strType] || "object";
    };
  })();

  limit = function(x, min, max) {
    if (min == null) {
      min = 0;
    }
    if (max == null) {
      max = 1;
    }
    if (x < min) {
      x = min;
    }
    if (x > max) {
      x = max;
    }
    return x;
  };

  unpack = function(args) {
    if (args.length >= 3) {
      return [].slice.call(args);
    } else {
      return args[0];
    }
  };

  clip_rgb = function(rgb) {
    var i;
    for (i in rgb) {
      if (i < 3) {
        if (rgb[i] < 0) {
          rgb[i] = 0;
        }
        if (rgb[i] > 255) {
          rgb[i] = 255;
        }
      } else if (i === 3) {
        if (rgb[i] < 0) {
          rgb[i] = 0;
        }
        if (rgb[i] > 1) {
          rgb[i] = 1;
        }
      }
    }
    return rgb;
  };

  PI = Math.PI, round = Math.round, cos = Math.cos, floor = Math.floor, pow = Math.pow, log = Math.log, sin = Math.sin, sqrt = Math.sqrt, atan2 = Math.atan2, max = Math.max, abs = Math.abs;

  TWOPI = PI * 2;

  PITHIRD = PI / 3;

  DEG2RAD = PI / 180;

  RAD2DEG = 180 / PI;

  chroma = function() {
    if (arguments[0] instanceof Color) {
      return arguments[0];
    }
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, arguments, function(){});
  };

  _interpolators = [];

  if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    module.exports = chroma;
  }

  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return chroma;
    });
  } else {
    root = typeof exports !== "undefined" && exports !== null ? exports : this;
    root.chroma = chroma;
  }

  chroma.version = '1.1.1';


  /**
      chroma.js
  
      Copyright (c) 2011-2013, Gregor Aisch
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
  
      * Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.
  
      * The name Gregor Aisch may not be used to endorse or promote products
        derived from this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
      @source: https://github.com/gka/chroma.js
   */

  _input = {};

  _guess_formats = [];

  _guess_formats_sorted = false;

  Color = (function() {
    function Color() {
      var arg, args, chk, len, len1, me, mode, o, w;
      me = this;
      args = [];
      for (o = 0, len = arguments.length; o < len; o++) {
        arg = arguments[o];
        if (arg != null) {
          args.push(arg);
        }
      }
      mode = args[args.length - 1];
      if (_input[mode] != null) {
        me._rgb = clip_rgb(_input[mode](unpack(args.slice(0, -1))));
      } else {
        if (!_guess_formats_sorted) {
          _guess_formats = _guess_formats.sort(function(a, b) {
            return b.p - a.p;
          });
          _guess_formats_sorted = true;
        }
        for (w = 0, len1 = _guess_formats.length; w < len1; w++) {
          chk = _guess_formats[w];
          mode = chk.test.apply(chk, args);
          if (mode) {
            break;
          }
        }
        if (mode) {
          me._rgb = clip_rgb(_input[mode].apply(_input, args));
        }
      }
      if (me._rgb == null) {
        console.warn('unknown format: ' + args);
      }
      if (me._rgb == null) {
        me._rgb = [0, 0, 0];
      }
      if (me._rgb.length === 3) {
        me._rgb.push(1);
      }
    }

    Color.prototype.alpha = function(alpha) {
      if (arguments.length) {
        this._rgb[3] = alpha;
        return this;
      }
      return this._rgb[3];
    };

    Color.prototype.toString = function() {
      return this.name();
    };

    return Color;

  })();

  chroma._input = _input;


  /**
  	ColorBrewer colors for chroma.js
  
  	Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The 
  	Pennsylvania State University.
  
  	Licensed under the Apache License, Version 2.0 (the "License"); 
  	you may not use this file except in compliance with the License.
  	You may obtain a copy of the License at	
  	http://www.apache.org/licenses/LICENSE-2.0
  
  	Unless required by applicable law or agreed to in writing, software distributed
  	under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
  	CONDITIONS OF ANY KIND, either express or implied. See the License for the
  	specific language governing permissions and limitations under the License.
  
      @preserve
   */

  chroma.brewer = brewer = {
    OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
    PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
    BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
    Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
    BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
    YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
    YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
    Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
    RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
    Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
    YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
    Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
    GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
    Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
    YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
    PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
    Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
    Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
    RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
    RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
    PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
    PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
    RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
    BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
    RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
    PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
    Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
    Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
    Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
    Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
    Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
    Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
    Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
    Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2']
  };


  /**
  	X11 color names
  
  	http://www.w3.org/TR/css3-color/#svg-color
   */

  w3cx11 = {
    indigo: "#4b0082",
    gold: "#ffd700",
    hotpink: "#ff69b4",
    firebrick: "#b22222",
    indianred: "#cd5c5c",
    yellow: "#ffff00",
    mistyrose: "#ffe4e1",
    darkolivegreen: "#556b2f",
    olive: "#808000",
    darkseagreen: "#8fbc8f",
    pink: "#ffc0cb",
    tomato: "#ff6347",
    lightcoral: "#f08080",
    orangered: "#ff4500",
    navajowhite: "#ffdead",
    lime: "#00ff00",
    palegreen: "#98fb98",
    darkslategrey: "#2f4f4f",
    greenyellow: "#adff2f",
    burlywood: "#deb887",
    seashell: "#fff5ee",
    mediumspringgreen: "#00fa9a",
    fuchsia: "#ff00ff",
    papayawhip: "#ffefd5",
    blanchedalmond: "#ffebcd",
    chartreuse: "#7fff00",
    dimgray: "#696969",
    black: "#000000",
    peachpuff: "#ffdab9",
    springgreen: "#00ff7f",
    aquamarine: "#7fffd4",
    white: "#ffffff",
    orange: "#ffa500",
    lightsalmon: "#ffa07a",
    darkslategray: "#2f4f4f",
    brown: "#a52a2a",
    ivory: "#fffff0",
    dodgerblue: "#1e90ff",
    peru: "#cd853f",
    lawngreen: "#7cfc00",
    chocolate: "#d2691e",
    crimson: "#dc143c",
    forestgreen: "#228b22",
    darkgrey: "#a9a9a9",
    lightseagreen: "#20b2aa",
    cyan: "#00ffff",
    mintcream: "#f5fffa",
    silver: "#c0c0c0",
    antiquewhite: "#faebd7",
    mediumorchid: "#ba55d3",
    skyblue: "#87ceeb",
    gray: "#808080",
    darkturquoise: "#00ced1",
    goldenrod: "#daa520",
    darkgreen: "#006400",
    floralwhite: "#fffaf0",
    darkviolet: "#9400d3",
    darkgray: "#a9a9a9",
    moccasin: "#ffe4b5",
    saddlebrown: "#8b4513",
    grey: "#808080",
    darkslateblue: "#483d8b",
    lightskyblue: "#87cefa",
    lightpink: "#ffb6c1",
    mediumvioletred: "#c71585",
    slategrey: "#708090",
    red: "#ff0000",
    deeppink: "#ff1493",
    limegreen: "#32cd32",
    darkmagenta: "#8b008b",
    palegoldenrod: "#eee8aa",
    plum: "#dda0dd",
    turquoise: "#40e0d0",
    lightgrey: "#d3d3d3",
    lightgoldenrodyellow: "#fafad2",
    darkgoldenrod: "#b8860b",
    lavender: "#e6e6fa",
    maroon: "#800000",
    yellowgreen: "#9acd32",
    sandybrown: "#f4a460",
    thistle: "#d8bfd8",
    violet: "#ee82ee",
    navy: "#000080",
    magenta: "#ff00ff",
    dimgrey: "#696969",
    tan: "#d2b48c",
    rosybrown: "#bc8f8f",
    olivedrab: "#6b8e23",
    blue: "#0000ff",
    lightblue: "#add8e6",
    ghostwhite: "#f8f8ff",
    honeydew: "#f0fff0",
    cornflowerblue: "#6495ed",
    slateblue: "#6a5acd",
    linen: "#faf0e6",
    darkblue: "#00008b",
    powderblue: "#b0e0e6",
    seagreen: "#2e8b57",
    darkkhaki: "#bdb76b",
    snow: "#fffafa",
    sienna: "#a0522d",
    mediumblue: "#0000cd",
    royalblue: "#4169e1",
    lightcyan: "#e0ffff",
    green: "#008000",
    mediumpurple: "#9370db",
    midnightblue: "#191970",
    cornsilk: "#fff8dc",
    paleturquoise: "#afeeee",
    bisque: "#ffe4c4",
    slategray: "#708090",
    darkcyan: "#008b8b",
    khaki: "#f0e68c",
    wheat: "#f5deb3",
    teal: "#008080",
    darkorchid: "#9932cc",
    deepskyblue: "#00bfff",
    salmon: "#fa8072",
    darkred: "#8b0000",
    steelblue: "#4682b4",
    palevioletred: "#db7093",
    lightslategray: "#778899",
    aliceblue: "#f0f8ff",
    lightslategrey: "#778899",
    lightgreen: "#90ee90",
    orchid: "#da70d6",
    gainsboro: "#dcdcdc",
    mediumseagreen: "#3cb371",
    lightgray: "#d3d3d3",
    mediumturquoise: "#48d1cc",
    lemonchiffon: "#fffacd",
    cadetblue: "#5f9ea0",
    lightyellow: "#ffffe0",
    lavenderblush: "#fff0f5",
    coral: "#ff7f50",
    purple: "#800080",
    aqua: "#00ffff",
    whitesmoke: "#f5f5f5",
    mediumslateblue: "#7b68ee",
    darkorange: "#ff8c00",
    mediumaquamarine: "#66cdaa",
    darksalmon: "#e9967a",
    beige: "#f5f5dc",
    blueviolet: "#8a2be2",
    azure: "#f0ffff",
    lightsteelblue: "#b0c4de",
    oldlace: "#fdf5e6",
    rebeccapurple: "#663399"
  };

  chroma.colors = colors = w3cx11;

  lab2rgb = function() {
    var a, args, b, g, l, r, x, y, z;
    args = unpack(arguments);
    l = args[0], a = args[1], b = args[2];
    y = (l + 16) / 116;
    x = isNaN(a) ? y : y + a / 500;
    z = isNaN(b) ? y : y - b / 200;
    y = LAB_CONSTANTS.Yn * lab_xyz(y);
    x = LAB_CONSTANTS.Xn * lab_xyz(x);
    z = LAB_CONSTANTS.Zn * lab_xyz(z);
    r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
    g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
    b = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
    r = limit(r, 0, 255);
    g = limit(g, 0, 255);
    b = limit(b, 0, 255);
    return [r, g, b, args.length > 3 ? args[3] : 1];
  };

  xyz_rgb = function(r) {
    return round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow(r, 1 / 2.4) - 0.055));
  };

  lab_xyz = function(t) {
    if (t > LAB_CONSTANTS.t1) {
      return t * t * t;
    } else {
      return LAB_CONSTANTS.t2 * (t - LAB_CONSTANTS.t0);
    }
  };

  LAB_CONSTANTS = {
    Kn: 18,
    Xn: 0.950470,
    Yn: 1,
    Zn: 1.088830,
    t0: 0.137931034,
    t1: 0.206896552,
    t2: 0.12841855,
    t3: 0.008856452
  };

  rgb2lab = function() {
    var b, g, r, ref, ref1, x, y, z;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    ref1 = rgb2xyz(r, g, b), x = ref1[0], y = ref1[1], z = ref1[2];
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  };

  rgb_xyz = function(r) {
    if ((r /= 255) <= 0.04045) {
      return r / 12.92;
    } else {
      return pow((r + 0.055) / 1.055, 2.4);
    }
  };

  xyz_lab = function(t) {
    if (t > LAB_CONSTANTS.t3) {
      return pow(t, 1 / 3);
    } else {
      return t / LAB_CONSTANTS.t2 + LAB_CONSTANTS.t0;
    }
  };

  rgb2xyz = function() {
    var b, g, r, ref, x, y, z;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    r = rgb_xyz(r);
    g = rgb_xyz(g);
    b = rgb_xyz(b);
    x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS.Xn);
    y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS.Yn);
    z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS.Zn);
    return [x, y, z];
  };

  chroma.lab = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['lab']), function(){});
  };

  _input.lab = lab2rgb;

  Color.prototype.lab = function() {
    return rgb2lab(this._rgb);
  };

  bezier = function(colors) {
    var I, I0, I1, c, lab0, lab1, lab2, lab3, ref, ref1, ref2;
    colors = (function() {
      var len, o, results;
      results = [];
      for (o = 0, len = colors.length; o < len; o++) {
        c = colors[o];
        results.push(chroma(c));
      }
      return results;
    })();
    if (colors.length === 2) {
      ref = (function() {
        var len, o, results;
        results = [];
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          results.push(c.lab());
        }
        return results;
      })(), lab0 = ref[0], lab1 = ref[1];
      I = function(t) {
        var i, lab;
        lab = (function() {
          var o, results;
          results = [];
          for (i = o = 0; o <= 2; i = ++o) {
            results.push(lab0[i] + t * (lab1[i] - lab0[i]));
          }
          return results;
        })();
        return chroma.lab.apply(chroma, lab);
      };
    } else if (colors.length === 3) {
      ref1 = (function() {
        var len, o, results;
        results = [];
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          results.push(c.lab());
        }
        return results;
      })(), lab0 = ref1[0], lab1 = ref1[1], lab2 = ref1[2];
      I = function(t) {
        var i, lab;
        lab = (function() {
          var o, results;
          results = [];
          for (i = o = 0; o <= 2; i = ++o) {
            results.push((1 - t) * (1 - t) * lab0[i] + 2 * (1 - t) * t * lab1[i] + t * t * lab2[i]);
          }
          return results;
        })();
        return chroma.lab.apply(chroma, lab);
      };
    } else if (colors.length === 4) {
      ref2 = (function() {
        var len, o, results;
        results = [];
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          results.push(c.lab());
        }
        return results;
      })(), lab0 = ref2[0], lab1 = ref2[1], lab2 = ref2[2], lab3 = ref2[3];
      I = function(t) {
        var i, lab;
        lab = (function() {
          var o, results;
          results = [];
          for (i = o = 0; o <= 2; i = ++o) {
            results.push((1 - t) * (1 - t) * (1 - t) * lab0[i] + 3 * (1 - t) * (1 - t) * t * lab1[i] + 3 * (1 - t) * t * t * lab2[i] + t * t * t * lab3[i]);
          }
          return results;
        })();
        return chroma.lab.apply(chroma, lab);
      };
    } else if (colors.length === 5) {
      I0 = bezier(colors.slice(0, 3));
      I1 = bezier(colors.slice(2, 5));
      I = function(t) {
        if (t < 0.5) {
          return I0(t * 2);
        } else {
          return I1((t - 0.5) * 2);
        }
      };
    }
    return I;
  };

  chroma.bezier = function(colors) {
    var f;
    f = bezier(colors);
    f.scale = function() {
      return chroma.scale(f);
    };
    return f;
  };


  /*
      chroma.js
  
      Copyright (c) 2011-2013, Gregor Aisch
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
  
      * Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.
  
      * The name Gregor Aisch may not be used to endorse or promote products
        derived from this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
      @source: https://github.com/gka/chroma.js
   */

  chroma.cubehelix = function(start, rotations, hue, gamma, lightness) {
    var dh, dl, f;
    if (start == null) {
      start = 300;
    }
    if (rotations == null) {
      rotations = -1.5;
    }
    if (hue == null) {
      hue = 1;
    }
    if (gamma == null) {
      gamma = 1;
    }
    if (lightness == null) {
      lightness = [0, 1];
    }
    dl = lightness[1] - lightness[0];
    dh = 0;
    f = function(fract) {
      var a, amp, b, cos_a, g, h, l, r, sin_a;
      a = TWOPI * ((start + 120) / 360 + rotations * fract);
      l = pow(lightness[0] + dl * fract, gamma);
      h = dh !== 0 ? hue[0] + fract * dh : hue;
      amp = h * l * (1 - l) / 2;
      cos_a = cos(a);
      sin_a = sin(a);
      r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a);
      g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a);
      b = l + amp * (+1.97294 * cos_a);
      return chroma(clip_rgb([r * 255, g * 255, b * 255]));
    };
    f.start = function(s) {
      if (s == null) {
        return start;
      }
      start = s;
      return f;
    };
    f.rotations = function(r) {
      if (r == null) {
        return rotations;
      }
      rotations = r;
      return f;
    };
    f.gamma = function(g) {
      if (g == null) {
        return gamma;
      }
      gamma = g;
      return f;
    };
    f.hue = function(h) {
      if (h == null) {
        return hue;
      }
      hue = h;
      if (type(hue) === 'array') {
        dh = hue[1] - hue[0];
        if (dh === 0) {
          hue = hue[1];
        }
      } else {
        dh = 0;
      }
      return f;
    };
    f.lightness = function(h) {
      if (h == null) {
        return lightness;
      }
      lightness = h;
      if (type(lightness) === 'array') {
        dl = lightness[1] - lightness[0];
        if (dl === 0) {
          lightness = lightness[1];
        }
      } else {
        dl = 0;
      }
      return f;
    };
    f.scale = function() {
      return chroma.scale(f);
    };
    f.hue(hue);
    return f;
  };

  chroma.random = function() {
    var code, digits, i, o;
    digits = '0123456789abcdef';
    code = '#';
    for (i = o = 0; o < 6; i = ++o) {
      code += digits.charAt(floor(Math.random() * 16));
    }
    return new Color(code);
  };

  _input.rgb = function() {
    var k, ref, results, v;
    ref = unpack(arguments);
    results = [];
    for (k in ref) {
      v = ref[k];
      results.push(v);
    }
    return results;
  };

  chroma.rgb = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['rgb']), function(){});
  };

  Color.prototype.rgb = function() {
    return this._rgb.slice(0, 3);
  };

  Color.prototype.rgba = function() {
    return this._rgb;
  };

  _guess_formats.push({
    p: 15,
    test: function(n) {
      var a;
      a = unpack(arguments);
      if (type(a) === 'array' && a.length === 3) {
        return 'rgb';
      }
      if (a.length === 4 && type(a[3]) === "number" && a[3] >= 0 && a[3] <= 1) {
        return 'rgb';
      }
    }
  });

  hex2rgb = function(hex) {
    var a, b, g, r, rgb, u;
    if (hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      if (hex.length === 4 || hex.length === 7) {
        hex = hex.substr(1);
      }
      if (hex.length === 3) {
        hex = hex.split("");
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      u = parseInt(hex, 16);
      r = u >> 16;
      g = u >> 8 & 0xFF;
      b = u & 0xFF;
      return [r, g, b, 1];
    }
    if (hex.match(/^#?([A-Fa-f0-9]{8})$/)) {
      if (hex.length === 9) {
        hex = hex.substr(1);
      }
      u = parseInt(hex, 16);
      r = u >> 24 & 0xFF;
      g = u >> 16 & 0xFF;
      b = u >> 8 & 0xFF;
      a = round((u & 0xFF) / 0xFF * 100) / 100;
      return [r, g, b, a];
    }
    if ((_input.css != null) && (rgb = _input.css(hex))) {
      return rgb;
    }
    throw "unknown color: " + hex;
  };

  rgb2hex = function(channels, mode) {
    var a, b, g, hxa, r, str, u;
    if (mode == null) {
      mode = 'rgb';
    }
    r = channels[0], g = channels[1], b = channels[2], a = channels[3];
    u = r << 16 | g << 8 | b;
    str = "000000" + u.toString(16);
    str = str.substr(str.length - 6);
    hxa = '0' + round(a * 255).toString(16);
    hxa = hxa.substr(hxa.length - 2);
    return "#" + (function() {
      switch (mode.toLowerCase()) {
        case 'rgba':
          return str + hxa;
        case 'argb':
          return hxa + str;
        default:
          return str;
      }
    })();
  };

  _input.hex = function(h) {
    return hex2rgb(h);
  };

  chroma.hex = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hex']), function(){});
  };

  Color.prototype.hex = function(mode) {
    if (mode == null) {
      mode = 'rgb';
    }
    return rgb2hex(this._rgb, mode);
  };

  _guess_formats.push({
    p: 10,
    test: function(n) {
      if (arguments.length === 1 && type(n) === "string") {
        return 'hex';
      }
    }
  });

  hsl2rgb = function() {
    var args, b, c, g, h, i, l, o, r, ref, s, t1, t2, t3;
    args = unpack(arguments);
    h = args[0], s = args[1], l = args[2];
    if (s === 0) {
      r = g = b = l * 255;
    } else {
      t3 = [0, 0, 0];
      c = [0, 0, 0];
      t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
      t1 = 2 * l - t2;
      h /= 360;
      t3[0] = h + 1 / 3;
      t3[1] = h;
      t3[2] = h - 1 / 3;
      for (i = o = 0; o <= 2; i = ++o) {
        if (t3[i] < 0) {
          t3[i] += 1;
        }
        if (t3[i] > 1) {
          t3[i] -= 1;
        }
        if (6 * t3[i] < 1) {
          c[i] = t1 + (t2 - t1) * 6 * t3[i];
        } else if (2 * t3[i] < 1) {
          c[i] = t2;
        } else if (3 * t3[i] < 2) {
          c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6;
        } else {
          c[i] = t1;
        }
      }
      ref = [round(c[0] * 255), round(c[1] * 255), round(c[2] * 255)], r = ref[0], g = ref[1], b = ref[2];
    }
    if (args.length > 3) {
      return [r, g, b, args[3]];
    } else {
      return [r, g, b];
    }
  };

  rgb2hsl = function(r, g, b) {
    var h, l, min, ref, s;
    if (r !== void 0 && r.length >= 3) {
      ref = r, r = ref[0], g = ref[1], b = ref[2];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      s = 0;
      h = Number.NaN;
    } else {
      s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    }
    if (r === max) {
      h = (g - b) / (max - min);
    } else if (g === max) {
      h = 2 + (b - r) / (max - min);
    } else if (b === max) {
      h = 4 + (r - g) / (max - min);
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
    return [h, s, l];
  };

  chroma.hsl = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hsl']), function(){});
  };

  _input.hsl = hsl2rgb;

  Color.prototype.hsl = function() {
    return rgb2hsl(this._rgb);
  };

  hsv2rgb = function() {
    var args, b, f, g, h, i, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, s, t, v;
    args = unpack(arguments);
    h = args[0], s = args[1], v = args[2];
    v *= 255;
    if (s === 0) {
      r = g = b = v;
    } else {
      if (h === 360) {
        h = 0;
      }
      if (h > 360) {
        h -= 360;
      }
      if (h < 0) {
        h += 360;
      }
      h /= 60;
      i = floor(h);
      f = h - i;
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));
      switch (i) {
        case 0:
          ref = [v, t, p], r = ref[0], g = ref[1], b = ref[2];
          break;
        case 1:
          ref1 = [q, v, p], r = ref1[0], g = ref1[1], b = ref1[2];
          break;
        case 2:
          ref2 = [p, v, t], r = ref2[0], g = ref2[1], b = ref2[2];
          break;
        case 3:
          ref3 = [p, q, v], r = ref3[0], g = ref3[1], b = ref3[2];
          break;
        case 4:
          ref4 = [t, p, v], r = ref4[0], g = ref4[1], b = ref4[2];
          break;
        case 5:
          ref5 = [v, p, q], r = ref5[0], g = ref5[1], b = ref5[2];
      }
    }
    r = round(r);
    g = round(g);
    b = round(b);
    return [r, g, b, args.length > 3 ? args[3] : 1];
  };

  rgb2hsv = function() {
    var b, delta, g, h, min, r, ref, s, v;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    delta = max - min;
    v = max / 255.0;
    if (max === 0) {
      h = Number.NaN;
      s = 0;
    } else {
      s = delta / max;
      if (r === max) {
        h = (g - b) / delta;
      }
      if (g === max) {
        h = 2 + (b - r) / delta;
      }
      if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }
    return [h, s, v];
  };

  chroma.hsv = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hsv']), function(){});
  };

  _input.hsv = hsv2rgb;

  Color.prototype.hsv = function() {
    return rgb2hsv(this._rgb);
  };

  num2rgb = function(num) {
    var b, g, r;
    if (type(num) === "number" && num >= 0 && num <= 0xFFFFFF) {
      r = num >> 16;
      g = (num >> 8) & 0xFF;
      b = num & 0xFF;
      return [r, g, b, 1];
    }
    console.warn("unknown num color: " + num);
    return [0, 0, 0, 1];
  };

  rgb2num = function() {
    var b, g, r, ref;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    return (r << 16) + (g << 8) + b;
  };

  chroma.num = function(num) {
    return new Color(num, 'num');
  };

  Color.prototype.num = function(mode) {
    if (mode == null) {
      mode = 'rgb';
    }
    return rgb2num(this._rgb, mode);
  };

  _input.num = num2rgb;

  _guess_formats.push({
    p: 10,
    test: function(n) {
      if (arguments.length === 1 && type(n) === "number" && n >= 0 && n <= 0xFFFFFF) {
        return 'num';
      }
    }
  });

  css2rgb = function(css) {
    var aa, ab, hsl, i, m, o, rgb, w;
    css = css.toLowerCase();
    if ((chroma.colors != null) && chroma.colors[css]) {
      return hex2rgb(chroma.colors[css]);
    }
    if (m = css.match(/rgb\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*\)/)) {
      rgb = m.slice(1, 4);
      for (i = o = 0; o <= 2; i = ++o) {
        rgb[i] = +rgb[i];
      }
      rgb[3] = 1;
    } else if (m = css.match(/rgba\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*,\s*([01]|[01]?\.\d+)\)/)) {
      rgb = m.slice(1, 5);
      for (i = w = 0; w <= 3; i = ++w) {
        rgb[i] = +rgb[i];
      }
    } else if (m = css.match(/rgb\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
      rgb = m.slice(1, 4);
      for (i = aa = 0; aa <= 2; i = ++aa) {
        rgb[i] = round(rgb[i] * 2.55);
      }
      rgb[3] = 1;
    } else if (m = css.match(/rgba\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
      rgb = m.slice(1, 5);
      for (i = ab = 0; ab <= 2; i = ++ab) {
        rgb[i] = round(rgb[i] * 2.55);
      }
      rgb[3] = +rgb[3];
    } else if (m = css.match(/hsl\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
      hsl = m.slice(1, 4);
      hsl[1] *= 0.01;
      hsl[2] *= 0.01;
      rgb = hsl2rgb(hsl);
      rgb[3] = 1;
    } else if (m = css.match(/hsla\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
      hsl = m.slice(1, 4);
      hsl[1] *= 0.01;
      hsl[2] *= 0.01;
      rgb = hsl2rgb(hsl);
      rgb[3] = +m[4];
    }
    return rgb;
  };

  rgb2css = function(rgba) {
    var mode;
    mode = rgba[3] < 1 ? 'rgba' : 'rgb';
    if (mode === 'rgb') {
      return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ')';
    } else if (mode === 'rgba') {
      return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ',' + rgba[3] + ')';
    } else {

    }
  };

  rnd = function(a) {
    return round(a * 100) / 100;
  };

  hsl2css = function(hsl, alpha) {
    var mode;
    mode = alpha < 1 ? 'hsla' : 'hsl';
    hsl[0] = rnd(hsl[0] || 0);
    hsl[1] = rnd(hsl[1] * 100) + '%';
    hsl[2] = rnd(hsl[2] * 100) + '%';
    if (mode === 'hsla') {
      hsl[3] = alpha;
    }
    return mode + '(' + hsl.join(',') + ')';
  };

  _input.css = function(h) {
    return css2rgb(h);
  };

  chroma.css = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['css']), function(){});
  };

  Color.prototype.css = function(mode) {
    if (mode == null) {
      mode = 'rgb';
    }
    if (mode.slice(0, 3) === 'rgb') {
      return rgb2css(this._rgb);
    } else if (mode.slice(0, 3) === 'hsl') {
      return hsl2css(this.hsl(), this.alpha());
    }
  };

  _input.named = function(name) {
    return hex2rgb(w3cx11[name]);
  };

  _guess_formats.push({
    p: 20,
    test: function(n) {
      if (arguments.length === 1 && (w3cx11[n] != null)) {
        return 'named';
      }
    }
  });

  Color.prototype.name = function(n) {
    var h, k;
    if (arguments.length) {
      if (w3cx11[n]) {
        this._rgb = hex2rgb(w3cx11[n]);
      }
      this._rgb[3] = 1;
      this;
    }
    h = this.hex();
    for (k in w3cx11) {
      if (h === w3cx11[k]) {
        return k;
      }
    }
    return h;
  };

  lch2lab = function() {

    /*
    Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
    These formulas were invented by David Dalrymple to obtain maximum contrast without going
    out of gamut if the parameters are in the range 0-1.
    
    A saturation multiplier was added by Gregor Aisch
     */
    var c, h, l, ref;
    ref = unpack(arguments), l = ref[0], c = ref[1], h = ref[2];
    h = h * DEG2RAD;
    return [l, cos(h) * c, sin(h) * c];
  };

  lch2rgb = function() {
    var L, a, args, b, c, g, h, l, r, ref, ref1;
    args = unpack(arguments);
    l = args[0], c = args[1], h = args[2];
    ref = lch2lab(l, c, h), L = ref[0], a = ref[1], b = ref[2];
    ref1 = lab2rgb(L, a, b), r = ref1[0], g = ref1[1], b = ref1[2];
    return [limit(r, 0, 255), limit(g, 0, 255), limit(b, 0, 255), args.length > 3 ? args[3] : 1];
  };

  lab2lch = function() {
    var a, b, c, h, l, ref;
    ref = unpack(arguments), l = ref[0], a = ref[1], b = ref[2];
    c = sqrt(a * a + b * b);
    h = (atan2(b, a) * RAD2DEG + 360) % 360;
    if (round(c * 10000) === 0) {
      h = Number.NaN;
    }
    return [l, c, h];
  };

  rgb2lch = function() {
    var a, b, g, l, r, ref, ref1;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    ref1 = rgb2lab(r, g, b), l = ref1[0], a = ref1[1], b = ref1[2];
    return lab2lch(l, a, b);
  };

  chroma.lch = function() {
    var args;
    args = unpack(arguments);
    return new Color(args, 'lch');
  };

  chroma.hcl = function() {
    var args;
    args = unpack(arguments);
    return new Color(args, 'hcl');
  };

  _input.lch = lch2rgb;

  _input.hcl = function() {
    var c, h, l, ref;
    ref = unpack(arguments), h = ref[0], c = ref[1], l = ref[2];
    return lch2rgb([l, c, h]);
  };

  Color.prototype.lch = function() {
    return rgb2lch(this._rgb);
  };

  Color.prototype.hcl = function() {
    return rgb2lch(this._rgb).reverse();
  };

  rgb2cmyk = function(mode) {
    var b, c, f, g, k, m, r, ref, y;
    if (mode == null) {
      mode = 'rgb';
    }
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    r = r / 255;
    g = g / 255;
    b = b / 255;
    k = 1 - Math.max(r, Math.max(g, b));
    f = k < 1 ? 1 / (1 - k) : 0;
    c = (1 - r - k) * f;
    m = (1 - g - k) * f;
    y = (1 - b - k) * f;
    return [c, m, y, k];
  };

  cmyk2rgb = function() {
    var alpha, args, b, c, g, k, m, r, y;
    args = unpack(arguments);
    c = args[0], m = args[1], y = args[2], k = args[3];
    alpha = args.length > 4 ? args[4] : 1;
    if (k === 1) {
      return [0, 0, 0, alpha];
    }
    r = c >= 1 ? 0 : round(255 * (1 - c) * (1 - k));
    g = m >= 1 ? 0 : round(255 * (1 - m) * (1 - k));
    b = y >= 1 ? 0 : round(255 * (1 - y) * (1 - k));
    return [r, g, b, alpha];
  };

  _input.cmyk = function() {
    return cmyk2rgb(unpack(arguments));
  };

  chroma.cmyk = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['cmyk']), function(){});
  };

  Color.prototype.cmyk = function() {
    return rgb2cmyk(this._rgb);
  };

  _input.gl = function() {
    var i, k, o, rgb, v;
    rgb = (function() {
      var ref, results;
      ref = unpack(arguments);
      results = [];
      for (k in ref) {
        v = ref[k];
        results.push(v);
      }
      return results;
    }).apply(this, arguments);
    for (i = o = 0; o <= 2; i = ++o) {
      rgb[i] *= 255;
    }
    return rgb;
  };

  chroma.gl = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['gl']), function(){});
  };

  Color.prototype.gl = function() {
    var rgb;
    rgb = this._rgb;
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, rgb[3]];
  };

  rgb2luminance = function(r, g, b) {
    var ref;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    r = luminance_x(r);
    g = luminance_x(g);
    b = luminance_x(b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  luminance_x = function(x) {
    x /= 255;
    if (x <= 0.03928) {
      return x / 12.92;
    } else {
      return pow((x + 0.055) / 1.055, 2.4);
    }
  };

  _interpolators = [];

  interpolate = function(col1, col2, f, m) {
    var interpol, len, o, res;
    if (f == null) {
      f = 0.5;
    }
    if (m == null) {
      m = 'rgb';
    }

    /*
    interpolates between colors
    f = 0 --> me
    f = 1 --> col
     */
    if (type(col1) !== 'object') {
      col1 = chroma(col1);
    }
    if (type(col2) !== 'object') {
      col2 = chroma(col2);
    }
    for (o = 0, len = _interpolators.length; o < len; o++) {
      interpol = _interpolators[o];
      if (m === interpol[0]) {
        res = interpol[1](col1, col2, f, m);
        break;
      }
    }
    if (res == null) {
      throw "color mode " + m + " is not supported";
    }
    res.alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
    return res;
  };

  chroma.interpolate = interpolate;

  Color.prototype.interpolate = function(col2, f, m) {
    return interpolate(this, col2, f, m);
  };

  chroma.mix = interpolate;

  Color.prototype.mix = Color.prototype.interpolate;

  interpolate_rgb = function(col1, col2, f, m) {
    var xyz0, xyz1;
    xyz0 = col1._rgb;
    xyz1 = col2._rgb;
    return new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
  };

  _interpolators.push(['rgb', interpolate_rgb]);

  Color.prototype.luminance = function(lum, mode) {
    var cur_lum, eps, max_iter, test;
    if (mode == null) {
      mode = 'rgb';
    }
    if (!arguments.length) {
      return rgb2luminance(this._rgb);
    }
    if (lum === 0) {
      this._rgb = [0, 0, 0, this._rgb[3]];
    } else if (lum === 1) {
      this._rgb = [255, 255, 255, this._rgb[3]];
    } else {
      eps = 1e-7;
      max_iter = 20;
      test = function(l, h) {
        var lm, m;
        m = l.interpolate(h, 0.5, mode);
        lm = m.luminance();
        if (Math.abs(lum - lm) < eps || !max_iter--) {
          return m;
        }
        if (lm > lum) {
          return test(l, m);
        }
        return test(m, h);
      };
      cur_lum = rgb2luminance(this._rgb);
      this._rgb = (cur_lum > lum ? test(chroma('black'), this) : test(this, chroma('white'))).rgba();
    }
    return this;
  };

  temperature2rgb = function(kelvin) {
    var b, g, r, temp;
    temp = kelvin / 100;
    if (temp < 66) {
      r = 255;
      g = -155.25485562709179 - 0.44596950469579133 * (g = temp - 2) + 104.49216199393888 * log(g);
      b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp - 10) + 115.67994401066147 * log(b);
    } else {
      r = 351.97690566805693 + 0.114206453784165 * (r = temp - 55) - 40.25366309332127 * log(r);
      g = 325.4494125711974 + 0.07943456536662342 * (g = temp - 50) - 28.0852963507957 * log(g);
      b = 255;
    }
    return clip_rgb([r, g, b]);
  };

  rgb2temperature = function() {
    var b, eps, g, maxTemp, minTemp, r, ref, rgb, temp;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    minTemp = 1000;
    maxTemp = 40000;
    eps = 0.4;
    while (maxTemp - minTemp > eps) {
      temp = (maxTemp + minTemp) * 0.5;
      rgb = temperature2rgb(temp);
      if ((rgb[2] / rgb[0]) >= (b / r)) {
        maxTemp = temp;
      } else {
        minTemp = temp;
      }
    }
    return round(temp);
  };

  chroma.temperature = chroma.kelvin = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['temperature']), function(){});
  };

  _input.temperature = _input.kelvin = _input.K = temperature2rgb;

  Color.prototype.temperature = function() {
    return rgb2temperature(this._rgb);
  };

  Color.prototype.kelvin = Color.prototype.temperature;

  chroma.contrast = function(a, b) {
    var l1, l2, ref, ref1;
    if ((ref = type(a)) === 'string' || ref === 'number') {
      a = new Color(a);
    }
    if ((ref1 = type(b)) === 'string' || ref1 === 'number') {
      b = new Color(b);
    }
    l1 = a.luminance();
    l2 = b.luminance();
    if (l1 > l2) {
      return (l1 + 0.05) / (l2 + 0.05);
    } else {
      return (l2 + 0.05) / (l1 + 0.05);
    }
  };

  Color.prototype.get = function(modechan) {
    var channel, i, me, mode, ref, src;
    me = this;
    ref = modechan.split('.'), mode = ref[0], channel = ref[1];
    src = me[mode]();
    if (channel) {
      i = mode.indexOf(channel);
      if (i > -1) {
        return src[i];
      } else {
        return console.warn('unknown channel ' + channel + ' in mode ' + mode);
      }
    } else {
      return src;
    }
  };

  Color.prototype.set = function(modechan, value) {
    var channel, i, me, mode, ref, src;
    me = this;
    ref = modechan.split('.'), mode = ref[0], channel = ref[1];
    if (channel) {
      src = me[mode]();
      i = mode.indexOf(channel);
      if (i > -1) {
        if (type(value) === 'string') {
          switch (value.charAt(0)) {
            case '+':
              src[i] += +value;
              break;
            case '-':
              src[i] += +value;
              break;
            case '*':
              src[i] *= +(value.substr(1));
              break;
            case '/':
              src[i] /= +(value.substr(1));
              break;
            default:
              src[i] = +value;
          }
        } else {
          src[i] = value;
        }
      } else {
        console.warn('unknown channel ' + channel + ' in mode ' + mode);
      }
    } else {
      src = value;
    }
    me._rgb = chroma(src, mode).alpha(me.alpha())._rgb;
    return me;
  };

  Color.prototype.darken = function(amount) {
    var lab, me;
    if (amount == null) {
      amount = 1;
    }
    me = this;
    lab = me.lab();
    lab[0] -= LAB_CONSTANTS.Kn * amount;
    return chroma.lab(lab).alpha(me.alpha());
  };

  Color.prototype.brighten = function(amount) {
    if (amount == null) {
      amount = 1;
    }
    return this.darken(-amount);
  };

  Color.prototype.darker = Color.prototype.darken;

  Color.prototype.brighter = Color.prototype.brighten;

  Color.prototype.saturate = function(amount) {
    var lch, me;
    if (amount == null) {
      amount = 1;
    }
    me = this;
    lch = me.lch();
    lch[1] += amount * LAB_CONSTANTS.Kn;
    if (lch[1] < 0) {
      lch[1] = 0;
    }
    return chroma.lch(lch).alpha(me.alpha());
  };

  Color.prototype.desaturate = function(amount) {
    if (amount == null) {
      amount = 1;
    }
    return this.saturate(-amount);
  };

  Color.prototype.premultiply = function() {
    var a, rgb;
    rgb = this.rgb();
    a = this.alpha();
    return chroma(rgb[0] * a, rgb[1] * a, rgb[2] * a, a);
  };

  blend = function(bottom, top, mode) {
    if (!blend[mode]) {
      throw 'unknown blend mode ' + mode;
    }
    return blend[mode](bottom, top);
  };

  blend_f = function(f) {
    return function(bottom, top) {
      var c0, c1;
      c0 = chroma(top).rgb();
      c1 = chroma(bottom).rgb();
      return chroma(f(c0, c1), 'rgb');
    };
  };

  each = function(f) {
    return function(c0, c1) {
      var i, o, out;
      out = [];
      for (i = o = 0; o <= 3; i = ++o) {
        out[i] = f(c0[i], c1[i]);
      }
      return out;
    };
  };

  normal = function(a, b) {
    return a;
  };

  multiply = function(a, b) {
    return a * b / 255;
  };

  darken = function(a, b) {
    if (a > b) {
      return b;
    } else {
      return a;
    }
  };

  lighten = function(a, b) {
    if (a > b) {
      return a;
    } else {
      return b;
    }
  };

  screen = function(a, b) {
    return 255 * (1 - (1 - a / 255) * (1 - b / 255));
  };

  overlay = function(a, b) {
    if (b < 128) {
      return 2 * a * b / 255;
    } else {
      return 255 * (1 - 2 * (1 - a / 255) * (1 - b / 255));
    }
  };

  burn = function(a, b) {
    return 255 * (1 - (1 - b / 255) / (a / 255));
  };

  dodge = function(a, b) {
    if (a === 255) {
      return 255;
    }
    a = 255 * (b / 255) / (1 - a / 255);
    if (a > 255) {
      return 255;
    } else {
      return a;
    }
  };

  blend.normal = blend_f(each(normal));

  blend.multiply = blend_f(each(multiply));

  blend.screen = blend_f(each(screen));

  blend.overlay = blend_f(each(overlay));

  blend.darken = blend_f(each(darken));

  blend.lighten = blend_f(each(lighten));

  blend.dodge = blend_f(each(dodge));

  blend.burn = blend_f(each(burn));

  chroma.blend = blend;

  chroma.analyze = function(data) {
    var len, o, r, val;
    r = {
      min: Number.MAX_VALUE,
      max: Number.MAX_VALUE * -1,
      sum: 0,
      values: [],
      count: 0
    };
    for (o = 0, len = data.length; o < len; o++) {
      val = data[o];
      if ((val != null) && !isNaN(val)) {
        r.values.push(val);
        r.sum += val;
        if (val < r.min) {
          r.min = val;
        }
        if (val > r.max) {
          r.max = val;
        }
        r.count += 1;
      }
    }
    r.domain = [r.min, r.max];
    r.limits = function(mode, num) {
      return chroma.limits(r, mode, num);
    };
    return r;
  };

  chroma.scale = function(colors, positions) {
    var _classes, _colorCache, _colors, _correctLightness, _domain, _fixed, _max, _min, _mode, _nacol, _out, _padding, _pos, _spread, classifyValue, f, getClass, getColor, resetCache, setColors, tmap;
    _mode = 'rgb';
    _nacol = chroma('#ccc');
    _spread = 0;
    _fixed = false;
    _domain = [0, 1];
    _pos = [];
    _padding = [0, 0];
    _classes = false;
    _colors = [];
    _out = false;
    _min = 0;
    _max = 1;
    _correctLightness = false;
    _colorCache = {};
    setColors = function(colors) {
      var c, col, o, ref, ref1, ref2, w;
      if (colors == null) {
        colors = ['#fff', '#000'];
      }
      if ((colors != null) && type(colors) === 'string' && (((ref = chroma.brewer) != null ? ref[colors] : void 0) != null)) {
        colors = chroma.brewer[colors];
      }
      if (type(colors) === 'array') {
        colors = colors.slice(0);
        for (c = o = 0, ref1 = colors.length - 1; 0 <= ref1 ? o <= ref1 : o >= ref1; c = 0 <= ref1 ? ++o : --o) {
          col = colors[c];
          if (type(col) === "string") {
            colors[c] = chroma(col);
          }
        }
        _pos.length = 0;
        for (c = w = 0, ref2 = colors.length - 1; 0 <= ref2 ? w <= ref2 : w >= ref2; c = 0 <= ref2 ? ++w : --w) {
          _pos.push(c / (colors.length - 1));
        }
      }
      resetCache();
      return _colors = colors;
    };
    getClass = function(value) {
      var i, n;
      if (_classes != null) {
        n = _classes.length - 1;
        i = 0;
        while (i < n && value >= _classes[i]) {
          i++;
        }
        return i - 1;
      }
      return 0;
    };
    tmap = function(t) {
      return t;
    };
    classifyValue = function(value) {
      var i, maxc, minc, n, val;
      val = value;
      if (_classes.length > 2) {
        n = _classes.length - 1;
        i = getClass(value);
        minc = _classes[0] + (_classes[1] - _classes[0]) * (0 + _spread * 0.5);
        maxc = _classes[n - 1] + (_classes[n] - _classes[n - 1]) * (1 - _spread * 0.5);
        val = _min + ((_classes[i] + (_classes[i + 1] - _classes[i]) * 0.5 - minc) / (maxc - minc)) * (_max - _min);
      }
      return val;
    };
    getColor = function(val, bypassMap) {
      var c, col, i, k, o, p, ref, t;
      if (bypassMap == null) {
        bypassMap = false;
      }
      if (isNaN(val)) {
        return _nacol;
      }
      if (!bypassMap) {
        if (_classes && _classes.length > 2) {
          c = getClass(val);
          t = c / (_classes.length - 2);
          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));
        } else if (_max !== _min) {
          t = (val - _min) / (_max - _min);
          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));
          t = Math.min(1, Math.max(0, t));
        } else {
          t = 1;
        }
      } else {
        t = val;
      }
      if (!bypassMap) {
        t = tmap(t);
      }
      k = Math.floor(t * 10000);
      if (_colorCache[k]) {
        col = _colorCache[k];
      } else {
        if (type(_colors) === 'array') {
          for (i = o = 0, ref = _pos.length - 1; 0 <= ref ? o <= ref : o >= ref; i = 0 <= ref ? ++o : --o) {
            p = _pos[i];
            if (t <= p) {
              col = _colors[i];
              break;
            }
            if (t >= p && i === _pos.length - 1) {
              col = _colors[i];
              break;
            }
            if (t > p && t < _pos[i + 1]) {
              t = (t - p) / (_pos[i + 1] - p);
              col = chroma.interpolate(_colors[i], _colors[i + 1], t, _mode);
              break;
            }
          }
        } else if (type(_colors) === 'function') {
          col = _colors(t);
        }
        _colorCache[k] = col;
      }
      return col;
    };
    resetCache = function() {
      return _colorCache = {};
    };
    setColors(colors);
    f = function(v) {
      var c;
      c = chroma(getColor(v));
      if (_out && c[_out]) {
        return c[_out]();
      } else {
        return c;
      }
    };
    f.classes = function(classes) {
      var d;
      if (classes != null) {
        if (type(classes) === 'array') {
          _classes = classes;
          _domain = [classes[0], classes[classes.length - 1]];
        } else {
          d = chroma.analyze(_domain);
          if (classes === 0) {
            _classes = [d.min, d.max];
          } else {
            _classes = chroma.limits(d, 'e', classes);
          }
        }
        return f;
      }
      return _classes;
    };
    f.domain = function(domain) {
      var c, d, k, len, o, ref, w;
      if (!arguments.length) {
        return _domain;
      }
      _min = domain[0];
      _max = domain[domain.length - 1];
      _pos = [];
      k = _colors.length;
      if (domain.length === k && _min !== _max) {
        for (o = 0, len = domain.length; o < len; o++) {
          d = domain[o];
          _pos.push((d - _min) / (_max - _min));
        }
      } else {
        for (c = w = 0, ref = k - 1; 0 <= ref ? w <= ref : w >= ref; c = 0 <= ref ? ++w : --w) {
          _pos.push(c / (k - 1));
        }
      }
      _domain = [_min, _max];
      return f;
    };
    f.mode = function(_m) {
      if (!arguments.length) {
        return _mode;
      }
      _mode = _m;
      resetCache();
      return f;
    };
    f.range = function(colors, _pos) {
      setColors(colors, _pos);
      return f;
    };
    f.out = function(_o) {
      _out = _o;
      return f;
    };
    f.spread = function(val) {
      if (!arguments.length) {
        return _spread;
      }
      _spread = val;
      return f;
    };
    f.correctLightness = function(v) {
      if (v == null) {
        v = true;
      }
      _correctLightness = v;
      resetCache();
      if (_correctLightness) {
        tmap = function(t) {
          var L0, L1, L_actual, L_diff, L_ideal, max_iter, pol, t0, t1;
          L0 = getColor(0, true).lab()[0];
          L1 = getColor(1, true).lab()[0];
          pol = L0 > L1;
          L_actual = getColor(t, true).lab()[0];
          L_ideal = L0 + (L1 - L0) * t;
          L_diff = L_actual - L_ideal;
          t0 = 0;
          t1 = 1;
          max_iter = 20;
          while (Math.abs(L_diff) > 1e-2 && max_iter-- > 0) {
            (function() {
              if (pol) {
                L_diff *= -1;
              }
              if (L_diff < 0) {
                t0 = t;
                t += (t1 - t) * 0.5;
              } else {
                t1 = t;
                t += (t0 - t) * 0.5;
              }
              L_actual = getColor(t, true).lab()[0];
              return L_diff = L_actual - L_ideal;
            })();
          }
          return t;
        };
      } else {
        tmap = function(t) {
          return t;
        };
      }
      return f;
    };
    f.padding = function(p) {
      if (p != null) {
        if (type(p) === 'number') {
          p = [p, p];
        }
        _padding = p;
        return f;
      } else {
        return _padding;
      }
    };
    f.colors = function() {
      var dd, dm, i, numColors, o, out, ref, results, samples, w;
      numColors = 0;
      out = 'hex';
      if (arguments.length === 1) {
        if (type(arguments[0]) === 'string') {
          out = arguments[0];
        } else {
          numColors = arguments[0];
        }
      }
      if (arguments.length === 2) {
        numColors = arguments[0], out = arguments[1];
      }
      if (numColors) {
        dm = _domain[0];
        dd = _domain[1] - dm;
        return (function() {
          results = [];
          for (var o = 0; 0 <= numColors ? o < numColors : o > numColors; 0 <= numColors ? o++ : o--){ results.push(o); }
          return results;
        }).apply(this).map(function(i) {
          return f(dm + i / (numColors - 1) * dd)[out]();
        });
      }
      colors = [];
      samples = [];
      if (_classes && _classes.length > 2) {
        for (i = w = 1, ref = _classes.length; 1 <= ref ? w < ref : w > ref; i = 1 <= ref ? ++w : --w) {
          samples.push((_classes[i - 1] + _classes[i]) * 0.5);
        }
      } else {
        samples = _domain;
      }
      return samples.map(function(v) {
        return f(v)[out]();
      });
    };
    return f;
  };

  if (chroma.scales == null) {
    chroma.scales = {};
  }

  chroma.scales.cool = function() {
    return chroma.scale([chroma.hsl(180, 1, .9), chroma.hsl(250, .7, .4)]);
  };

  chroma.scales.hot = function() {
    return chroma.scale(['#000', '#f00', '#ff0', '#fff'], [0, .25, .75, 1]).mode('rgb');
  };

  chroma.analyze = function(data, key, filter) {
    var add, k, len, o, r, val, visit;
    r = {
      min: Number.MAX_VALUE,
      max: Number.MAX_VALUE * -1,
      sum: 0,
      values: [],
      count: 0
    };
    if (filter == null) {
      filter = function() {
        return true;
      };
    }
    add = function(val) {
      if ((val != null) && !isNaN(val)) {
        r.values.push(val);
        r.sum += val;
        if (val < r.min) {
          r.min = val;
        }
        if (val > r.max) {
          r.max = val;
        }
        r.count += 1;
      }
    };
    visit = function(val, k) {
      if (filter(val, k)) {
        if ((key != null) && type(key) === 'function') {
          return add(key(val));
        } else if ((key != null) && type(key) === 'string' || type(key) === 'number') {
          return add(val[key]);
        } else {
          return add(val);
        }
      }
    };
    if (type(data) === 'array') {
      for (o = 0, len = data.length; o < len; o++) {
        val = data[o];
        visit(val);
      }
    } else {
      for (k in data) {
        val = data[k];
        visit(val, k);
      }
    }
    r.domain = [r.min, r.max];
    r.limits = function(mode, num) {
      return chroma.limits(r, mode, num);
    };
    return r;
  };

  chroma.limits = function(data, mode, num) {
    var aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am, assignments, best, centroids, cluster, clusterSizes, dist, i, j, kClusters, limits, max_log, min, min_log, mindist, n, nb_iters, newCentroids, o, p, pb, pr, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, repeat, sum, tmpKMeansBreaks, value, values, w;
    if (mode == null) {
      mode = 'equal';
    }
    if (num == null) {
      num = 7;
    }
    if (type(data) === 'array') {
      data = chroma.analyze(data);
    }
    min = data.min;
    max = data.max;
    sum = data.sum;
    values = data.values.sort(function(a, b) {
      return a - b;
    });
    limits = [];
    if (mode.substr(0, 1) === 'c') {
      limits.push(min);
      limits.push(max);
    }
    if (mode.substr(0, 1) === 'e') {
      limits.push(min);
      for (i = o = 1, ref = num - 1; 1 <= ref ? o <= ref : o >= ref; i = 1 <= ref ? ++o : --o) {
        limits.push(min + (i / num) * (max - min));
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'l') {
      if (min <= 0) {
        throw 'Logarithmic scales are only possible for values > 0';
      }
      min_log = Math.LOG10E * log(min);
      max_log = Math.LOG10E * log(max);
      limits.push(min);
      for (i = w = 1, ref1 = num - 1; 1 <= ref1 ? w <= ref1 : w >= ref1; i = 1 <= ref1 ? ++w : --w) {
        limits.push(pow(10, min_log + (i / num) * (max_log - min_log)));
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'q') {
      limits.push(min);
      for (i = aa = 1, ref2 = num - 1; 1 <= ref2 ? aa <= ref2 : aa >= ref2; i = 1 <= ref2 ? ++aa : --aa) {
        p = values.length * i / num;
        pb = floor(p);
        if (pb === p) {
          limits.push(values[pb]);
        } else {
          pr = p - pb;
          limits.push(values[pb] * pr + values[pb + 1] * (1 - pr));
        }
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'k') {

      /*
      implementation based on
      http://code.google.com/p/figue/source/browse/trunk/figue.js#336
      simplified for 1-d input values
       */
      n = values.length;
      assignments = new Array(n);
      clusterSizes = new Array(num);
      repeat = true;
      nb_iters = 0;
      centroids = null;
      centroids = [];
      centroids.push(min);
      for (i = ab = 1, ref3 = num - 1; 1 <= ref3 ? ab <= ref3 : ab >= ref3; i = 1 <= ref3 ? ++ab : --ab) {
        centroids.push(min + (i / num) * (max - min));
      }
      centroids.push(max);
      while (repeat) {
        for (j = ac = 0, ref4 = num - 1; 0 <= ref4 ? ac <= ref4 : ac >= ref4; j = 0 <= ref4 ? ++ac : --ac) {
          clusterSizes[j] = 0;
        }
        for (i = ad = 0, ref5 = n - 1; 0 <= ref5 ? ad <= ref5 : ad >= ref5; i = 0 <= ref5 ? ++ad : --ad) {
          value = values[i];
          mindist = Number.MAX_VALUE;
          for (j = ae = 0, ref6 = num - 1; 0 <= ref6 ? ae <= ref6 : ae >= ref6; j = 0 <= ref6 ? ++ae : --ae) {
            dist = abs(centroids[j] - value);
            if (dist < mindist) {
              mindist = dist;
              best = j;
            }
          }
          clusterSizes[best]++;
          assignments[i] = best;
        }
        newCentroids = new Array(num);
        for (j = af = 0, ref7 = num - 1; 0 <= ref7 ? af <= ref7 : af >= ref7; j = 0 <= ref7 ? ++af : --af) {
          newCentroids[j] = null;
        }
        for (i = ag = 0, ref8 = n - 1; 0 <= ref8 ? ag <= ref8 : ag >= ref8; i = 0 <= ref8 ? ++ag : --ag) {
          cluster = assignments[i];
          if (newCentroids[cluster] === null) {
            newCentroids[cluster] = values[i];
          } else {
            newCentroids[cluster] += values[i];
          }
        }
        for (j = ah = 0, ref9 = num - 1; 0 <= ref9 ? ah <= ref9 : ah >= ref9; j = 0 <= ref9 ? ++ah : --ah) {
          newCentroids[j] *= 1 / clusterSizes[j];
        }
        repeat = false;
        for (j = ai = 0, ref10 = num - 1; 0 <= ref10 ? ai <= ref10 : ai >= ref10; j = 0 <= ref10 ? ++ai : --ai) {
          if (newCentroids[j] !== centroids[i]) {
            repeat = true;
            break;
          }
        }
        centroids = newCentroids;
        nb_iters++;
        if (nb_iters > 200) {
          repeat = false;
        }
      }
      kClusters = {};
      for (j = aj = 0, ref11 = num - 1; 0 <= ref11 ? aj <= ref11 : aj >= ref11; j = 0 <= ref11 ? ++aj : --aj) {
        kClusters[j] = [];
      }
      for (i = ak = 0, ref12 = n - 1; 0 <= ref12 ? ak <= ref12 : ak >= ref12; i = 0 <= ref12 ? ++ak : --ak) {
        cluster = assignments[i];
        kClusters[cluster].push(values[i]);
      }
      tmpKMeansBreaks = [];
      for (j = al = 0, ref13 = num - 1; 0 <= ref13 ? al <= ref13 : al >= ref13; j = 0 <= ref13 ? ++al : --al) {
        tmpKMeansBreaks.push(kClusters[j][0]);
        tmpKMeansBreaks.push(kClusters[j][kClusters[j].length - 1]);
      }
      tmpKMeansBreaks = tmpKMeansBreaks.sort(function(a, b) {
        return a - b;
      });
      limits.push(tmpKMeansBreaks[0]);
      for (i = am = 1, ref14 = tmpKMeansBreaks.length - 1; am <= ref14; i = am += 2) {
        if (!isNaN(tmpKMeansBreaks[i])) {
          limits.push(tmpKMeansBreaks[i]);
        }
      }
    }
    return limits;
  };

  hsi2rgb = function(h, s, i) {

    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
     */
    var args, b, g, r;
    args = unpack(arguments);
    h = args[0], s = args[1], i = args[2];
    h /= 360;
    if (h < 1 / 3) {
      b = (1 - s) / 3;
      r = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      g = 1 - (b + r);
    } else if (h < 2 / 3) {
      h -= 1 / 3;
      r = (1 - s) / 3;
      g = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      b = 1 - (r + g);
    } else {
      h -= 2 / 3;
      g = (1 - s) / 3;
      b = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      r = 1 - (g + b);
    }
    r = limit(i * r * 3);
    g = limit(i * g * 3);
    b = limit(i * b * 3);
    return [r * 255, g * 255, b * 255, args.length > 3 ? args[3] : 1];
  };

  rgb2hsi = function() {

    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
     */
    var b, g, h, i, min, r, ref, s;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    TWOPI = Math.PI * 2;
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    i = (r + g + b) / 3;
    s = 1 - min / i;
    if (s === 0) {
      h = 0;
    } else {
      h = ((r - g) + (r - b)) / 2;
      h /= Math.sqrt((r - g) * (r - g) + (r - b) * (g - b));
      h = Math.acos(h);
      if (b > g) {
        h = TWOPI - h;
      }
      h /= TWOPI;
    }
    return [h * 360, s, i];
  };

  chroma.hsi = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hsi']), function(){});
  };

  _input.hsi = hsi2rgb;

  Color.prototype.hsi = function() {
    return rgb2hsi(this._rgb);
  };

  interpolate_hsx = function(col1, col2, f, m) {
    var dh, hue, hue0, hue1, lbv, lbv0, lbv1, res, sat, sat0, sat1, xyz0, xyz1;
    if (m === 'hsl') {
      xyz0 = col1.hsl();
      xyz1 = col2.hsl();
    } else if (m === 'hsv') {
      xyz0 = col1.hsv();
      xyz1 = col2.hsv();
    } else if (m === 'hsi') {
      xyz0 = col1.hsi();
      xyz1 = col2.hsi();
    } else if (m === 'lch' || m === 'hcl') {
      m = 'hcl';
      xyz0 = col1.hcl();
      xyz1 = col2.hcl();
    }
    if (m.substr(0, 1) === 'h') {
      hue0 = xyz0[0], sat0 = xyz0[1], lbv0 = xyz0[2];
      hue1 = xyz1[0], sat1 = xyz1[1], lbv1 = xyz1[2];
    }
    if (!isNaN(hue0) && !isNaN(hue1)) {
      if (hue1 > hue0 && hue1 - hue0 > 180) {
        dh = hue1 - (hue0 + 360);
      } else if (hue1 < hue0 && hue0 - hue1 > 180) {
        dh = hue1 + 360 - hue0;
      } else {
        dh = hue1 - hue0;
      }
      hue = hue0 + f * dh;
    } else if (!isNaN(hue0)) {
      hue = hue0;
      if ((lbv1 === 1 || lbv1 === 0) && m !== 'hsv') {
        sat = sat0;
      }
    } else if (!isNaN(hue1)) {
      hue = hue1;
      if ((lbv0 === 1 || lbv0 === 0) && m !== 'hsv') {
        sat = sat1;
      }
    } else {
      hue = Number.NaN;
    }
    if (sat == null) {
      sat = sat0 + f * (sat1 - sat0);
    }
    lbv = lbv0 + f * (lbv1 - lbv0);
    return res = chroma[m](hue, sat, lbv);
  };

  _interpolators = _interpolators.concat((function() {
    var len, o, ref, results;
    ref = ['hsv', 'hsl', 'hsi', 'hcl', 'lch'];
    results = [];
    for (o = 0, len = ref.length; o < len; o++) {
      m = ref[o];
      results.push([m, interpolate_hsx]);
    }
    return results;
  })());

  interpolate_num = function(col1, col2, f, m) {
    var n1, n2;
    n1 = col1.num();
    n2 = col2.num();
    return chroma.num(n1 + (n2 - n1) * f, 'num');
  };

  _interpolators.push(['num', interpolate_num]);

  interpolate_lab = function(col1, col2, f, m) {
    var res, xyz0, xyz1;
    xyz0 = col1.lab();
    xyz1 = col2.lab();
    return res = new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
  };

  _interpolators.push(['lab', interpolate_lab]);

}).call(this);

},{}],2:[function(require,module,exports){
'use strict';

var _utils = require('./utils');

var _chromaJs = require('chroma-js');

var _chromaJs2 = _interopRequireDefault(_chromaJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Functions */

function resizeCanvas(canvas) {
  var displayWidth = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

function loadAudio(context, sourceNode, url) {
  var request = new XMLHttpRequest();

  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function () {
    context.decodeAudioData(request.response, function (buffer) {
      sourceNode.buffer = buffer;
    }, function (error) {
      console.log(error);
    });
  };
  request.send();
}

function playSound(sourceNode) {
  sourceNode.start(0);
}

function setupAudioNodes(context) {
  /**
   * context.destination is a special node that is associated
   * with the default audio output of your system
   */
  var sourceNode = context.createBufferSource();
  sourceNode.connect(context.destination);

  var analyserNode = context.createAnalyser();
  analyserNode.fftSize = 1024;

  sourceNode.connect(analyserNode);

  return {
    sourceNode: sourceNode,
    analyserNode: analyserNode
  };
}

function visualize() {
  // audio context variables
  var context = new _utils.AudioContext();
  var nodes = setupAudioNodes(context);
  var bufferLength = nodes.analyserNode.frequencyBinCount;
  var frequencyArray = new Uint8Array(bufferLength);

  // canvas variables
  var canvas = document.getElementById('canvas');
  var canvasCtx = canvas.getContext('2d');

  resizeCanvas(canvas);
  var width = canvas.width;
  var height = canvas.height;

  var tempCanvas = document.createElement('canvas');
  var tempCanvasCtx = tempCanvas.getContext('2d');
  tempCanvas.width = width;
  tempCanvas.height = height;

  canvasCtx.clearRect(0, 0, width, height);

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, width, height);

  var cellHeight = bufferLength / height;

  // make a color scale
  var scale = _chromaJs2.default.scale(['#000000', '#ff0000', '#ffff00', '#ffffff']).domain([0, 255]).mode('rgb');

  function draw() {
    canvas = document.getElementById('canvas');
    resizeCanvas(canvas);
    width = tempCanvas.width = canvas.width;
    height = tempCanvas.height = canvas.height;

    tempCanvasCtx.drawImage(canvas, 0, 0, width, height);

    nodes.analyserNode.getByteFrequencyData(frequencyArray);

    frequencyArray.forEach(function (frequency, i) {
      canvasCtx.fillStyle = scale(frequency).hex();
      canvasCtx.fillRect(width - 1, height - i, 1, cellHeight);
    });

    canvasCtx.translate(-1, 0);

    canvasCtx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, width, height);

    canvasCtx.translate(1, 0);

    (0, _utils.requestAnimationFrame)(draw);
  }

  loadAudio(context, nodes.sourceNode, 'sounds/sunday_candy.mp3');
  playSound(nodes.sourceNode);
  draw();
}

visualize();

},{"./utils":3,"chroma-js":1}],3:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var requestAnimationFrame = exports.requestAnimationFrame = global.requestAnimationFrame || function () {
  return global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
    global.setTimeout(callback, 1000 / 60);
  };
}();

var AudioContext = exports.AudioContext = global.AudioContext || global.webkitAudioContext;
var OfflineAudioContext = exports.OfflineAudioContext = global.OfflineAudioContext || global.webkitOfflineAudioContext;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY2hyb21hLWpzL2Nocm9tYS5qcyIsInNyYy9zcGVjdHJvZ3JhbS5qcyIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUM1NUVBLFNBQVMsWUFBWSxDQUFFLE1BQU0sRUFBRTtBQUM3QixNQUFJLFlBQVksR0FBSSxNQUFNLENBQUMsV0FBVyxDQUFDO0FBQ3ZDLE1BQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7O0FBRXhDLE1BQUksTUFBTSxDQUFDLEtBQUssS0FBSyxZQUFZLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxhQUFhLEVBQUU7QUFDcEUsVUFBTSxDQUFDLEtBQUssR0FBSSxZQUFZLENBQUM7QUFDN0IsVUFBTSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUM7R0FDL0I7Q0FDRjs7QUFFRCxTQUFTLFNBQVMsQ0FBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRTtBQUM1QyxNQUFJLE9BQU8sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDOztBQUVuQyxTQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0IsU0FBTyxDQUFDLFlBQVksR0FBRyxhQUFhLENBQUM7O0FBRXJDLFNBQU8sQ0FBQyxNQUFNLEdBQUcsWUFBWTtBQUMzQixXQUFPLENBQUMsZUFBZSxDQUNyQixPQUFPLENBQUMsUUFBUSxFQUNoQixVQUFVLE1BQU0sRUFBRTtBQUFFLGdCQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztLQUFFLEVBQ2pELFVBQVUsS0FBSyxFQUFFO0FBQUUsYUFBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUFFLENBQ3pDLENBQUM7R0FDSCxDQUFDO0FBQ0YsU0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0NBQ2hCOztBQUVELFNBQVMsU0FBUyxDQUFFLFVBQVUsRUFBRTtBQUM5QixZQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ3JCOztBQUVELFNBQVMsZUFBZSxDQUFFLE9BQU8sRUFBRTs7Ozs7QUFLakMsTUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDOUMsWUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRXhDLE1BQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM1QyxjQUFZLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7QUFFNUIsWUFBVSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFakMsU0FBTztBQUNMLGNBQVUsRUFBRSxVQUFVO0FBQ3RCLGdCQUFZLEVBQUUsWUFBWTtHQUMzQixDQUFDO0NBQ0g7O0FBRUQsU0FBUyxTQUFTLEdBQUk7O0FBRXBCLE1BQUksT0FBTyxHQUFHLFdBeERQLFlBQVksRUF3RGEsQ0FBQztBQUNqQyxNQUFJLEtBQUssR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDckMsTUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztBQUN4RCxNQUFJLGNBQWMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxZQUFZLENBQUM7OztBQUFDLEFBR2xELE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0MsTUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFeEMsY0FBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3JCLE1BQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDekIsTUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7QUFFM0IsTUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsRCxNQUFJLGFBQWEsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hELFlBQVUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFlBQVUsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUUzQixXQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUV6QyxXQUFTLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQztBQUNyQyxXQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUV4QyxNQUFJLFVBQVUsR0FBRyxZQUFZLEdBQUcsTUFBTTs7O0FBQUMsQUFHdkMsTUFBSSxLQUFLLEdBQUcsbUJBQU8sS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXBHLFdBQVMsSUFBSSxHQUFJO0FBQ2YsVUFBTSxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsZ0JBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNyQixTQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3hDLFVBQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0FBRTNDLGlCQUFhLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFckQsU0FBSyxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFeEQsa0JBQWMsQ0FBQyxPQUFPLENBQUMsVUFBVSxTQUFTLEVBQUUsQ0FBQyxFQUFFO0FBQzdDLGVBQVMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzdDLGVBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUMxRCxDQUFDLENBQUM7O0FBRUgsYUFBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFM0IsYUFBUyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUUxRSxhQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7QUFFMUIsZUF6R21CLHFCQUFxQixFQXlHbEIsSUFBSSxDQUFDLENBQUM7R0FDN0I7O0FBRUQsV0FBUyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLHlCQUF5QixDQUFDLENBQUM7QUFDaEUsV0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUM1QixNQUFJLEVBQUUsQ0FBQztDQUNSOztBQUVELFNBQVMsRUFBRSxDQUFDOzs7Ozs7Ozs7QUNqSEwsSUFBSSxxQkFBcUIsV0FBckIscUJBQXFCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixJQUFJLEFBQUMsWUFBWTtBQUM5RSxTQUFRLE1BQU0sQ0FBQywyQkFBMkIsSUFDbEMsTUFBTSxDQUFDLHdCQUF3QixJQUMvQixNQUFNLENBQUMsc0JBQXNCLElBQzdCLE1BQU0sQ0FBQyx1QkFBdUIsSUFDOUIsVUFBVSxRQUFRLEVBQUU7QUFDbEIsVUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0dBQ3hDLENBQUM7Q0FDWCxFQUFHLENBQUM7O0FBRUUsSUFBSSxZQUFZLFdBQVosWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFDLGtCQUFrQixDQUFDO0FBQ3BFLElBQUksbUJBQW1CLFdBQW5CLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsSUFBSSxNQUFNLENBQUMseUJBQXlCLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKipcbiAqIEBsaWNlbnNlXG4gKlxuICogY2hyb21hLmpzIC0gSmF2YVNjcmlwdCBsaWJyYXJ5IGZvciBjb2xvciBjb252ZXJzaW9uc1xuICogXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxNSwgR3JlZ29yIEFpc2NoXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXRcbiAqIG1vZGlmaWNhdGlvbiwgYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICogXG4gKiAxLiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAqICAgIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogXG4gKiAyLiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gKiAgICB0aGlzIGxpc3Qgb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uXG4gKiAgICBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqIFxuICogMy4gVGhlIG5hbWUgR3JlZ29yIEFpc2NoIG1heSBub3QgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHNcbiAqICAgIGRlcml2ZWQgZnJvbSB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICogXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICogQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxuICogSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gKiBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBHUkVHT1IgQUlTQ0ggT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAqIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLFxuICogQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAqIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUllcbiAqIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HXG4gKiBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsXG4gKiBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICpcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBDb2xvciwgREVHMlJBRCwgTEFCX0NPTlNUQU5UUywgUEksIFBJVEhJUkQsIFJBRDJERUcsIFRXT1BJLCBfZ3Vlc3NfZm9ybWF0cywgX2d1ZXNzX2Zvcm1hdHNfc29ydGVkLCBfaW5wdXQsIF9pbnRlcnBvbGF0b3JzLCBhYnMsIGF0YW4yLCBiZXppZXIsIGJsZW5kLCBibGVuZF9mLCBicmV3ZXIsIGJ1cm4sIGNocm9tYSwgY2xpcF9yZ2IsIGNteWsycmdiLCBjb2xvcnMsIGNvcywgY3NzMnJnYiwgZGFya2VuLCBkb2RnZSwgZWFjaCwgZmxvb3IsIGhleDJyZ2IsIGhzaTJyZ2IsIGhzbDJjc3MsIGhzbDJyZ2IsIGhzdjJyZ2IsIGludGVycG9sYXRlLCBpbnRlcnBvbGF0ZV9oc3gsIGludGVycG9sYXRlX2xhYiwgaW50ZXJwb2xhdGVfbnVtLCBpbnRlcnBvbGF0ZV9yZ2IsIGxhYjJsY2gsIGxhYjJyZ2IsIGxhYl94eXosIGxjaDJsYWIsIGxjaDJyZ2IsIGxpZ2h0ZW4sIGxpbWl0LCBsb2csIGx1bWluYW5jZV94LCBtLCBtYXgsIG11bHRpcGx5LCBub3JtYWwsIG51bTJyZ2IsIG92ZXJsYXksIHBvdywgcmdiMmNteWssIHJnYjJjc3MsIHJnYjJoZXgsIHJnYjJoc2ksIHJnYjJoc2wsIHJnYjJoc3YsIHJnYjJsYWIsIHJnYjJsY2gsIHJnYjJsdW1pbmFuY2UsIHJnYjJudW0sIHJnYjJ0ZW1wZXJhdHVyZSwgcmdiMnh5eiwgcmdiX3h5eiwgcm5kLCByb290LCByb3VuZCwgc2NyZWVuLCBzaW4sIHNxcnQsIHRlbXBlcmF0dXJlMnJnYiwgdHlwZSwgdW5wYWNrLCB3M2N4MTEsIHh5el9sYWIsIHh5el9yZ2IsXG4gICAgc2xpY2UgPSBbXS5zbGljZTtcblxuICB0eXBlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgLypcbiAgICBmb3IgYnJvd3Nlci1zYWZlIHR5cGUgY2hlY2tpbmcrXG4gICAgcG9ydGVkIGZyb20galF1ZXJ5J3MgJC50eXBlXG4gICAgICovXG4gICAgdmFyIGNsYXNzVG9UeXBlLCBsZW4sIG5hbWUsIG8sIHJlZjtcbiAgICBjbGFzc1RvVHlwZSA9IHt9O1xuICAgIHJlZiA9IFwiQm9vbGVhbiBOdW1iZXIgU3RyaW5nIEZ1bmN0aW9uIEFycmF5IERhdGUgUmVnRXhwIFVuZGVmaW5lZCBOdWxsXCIuc3BsaXQoXCIgXCIpO1xuICAgIGZvciAobyA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgbmFtZSA9IHJlZltvXTtcbiAgICAgIGNsYXNzVG9UeXBlW1wiW29iamVjdCBcIiArIG5hbWUgKyBcIl1cIl0gPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBzdHJUeXBlO1xuICAgICAgc3RyVHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopO1xuICAgICAgcmV0dXJuIGNsYXNzVG9UeXBlW3N0clR5cGVdIHx8IFwib2JqZWN0XCI7XG4gICAgfTtcbiAgfSkoKTtcblxuICBsaW1pdCA9IGZ1bmN0aW9uKHgsIG1pbiwgbWF4KSB7XG4gICAgaWYgKG1pbiA9PSBudWxsKSB7XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IDE7XG4gICAgfVxuICAgIGlmICh4IDwgbWluKSB7XG4gICAgICB4ID0gbWluO1xuICAgIH1cbiAgICBpZiAoeCA+IG1heCkge1xuICAgICAgeCA9IG1heDtcbiAgICB9XG4gICAgcmV0dXJuIHg7XG4gIH07XG5cbiAgdW5wYWNrID0gZnVuY3Rpb24oYXJncykge1xuICAgIGlmIChhcmdzLmxlbmd0aCA+PSAzKSB7XG4gICAgICByZXR1cm4gW10uc2xpY2UuY2FsbChhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFyZ3NbMF07XG4gICAgfVxuICB9O1xuXG4gIGNsaXBfcmdiID0gZnVuY3Rpb24ocmdiKSB7XG4gICAgdmFyIGk7XG4gICAgZm9yIChpIGluIHJnYikge1xuICAgICAgaWYgKGkgPCAzKSB7XG4gICAgICAgIGlmIChyZ2JbaV0gPCAwKSB7XG4gICAgICAgICAgcmdiW2ldID0gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmdiW2ldID4gMjU1KSB7XG4gICAgICAgICAgcmdiW2ldID0gMjU1O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGkgPT09IDMpIHtcbiAgICAgICAgaWYgKHJnYltpXSA8IDApIHtcbiAgICAgICAgICByZ2JbaV0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZ2JbaV0gPiAxKSB7XG4gICAgICAgICAgcmdiW2ldID0gMTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmdiO1xuICB9O1xuXG4gIFBJID0gTWF0aC5QSSwgcm91bmQgPSBNYXRoLnJvdW5kLCBjb3MgPSBNYXRoLmNvcywgZmxvb3IgPSBNYXRoLmZsb29yLCBwb3cgPSBNYXRoLnBvdywgbG9nID0gTWF0aC5sb2csIHNpbiA9IE1hdGguc2luLCBzcXJ0ID0gTWF0aC5zcXJ0LCBhdGFuMiA9IE1hdGguYXRhbjIsIG1heCA9IE1hdGgubWF4LCBhYnMgPSBNYXRoLmFicztcblxuICBUV09QSSA9IFBJICogMjtcblxuICBQSVRISVJEID0gUEkgLyAzO1xuXG4gIERFRzJSQUQgPSBQSSAvIDE4MDtcblxuICBSQUQyREVHID0gMTgwIC8gUEk7XG5cbiAgY2hyb21hID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKGFyZ3VtZW50c1swXSBpbnN0YW5jZW9mIENvbG9yKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuICAgIH1cbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBhcmd1bWVudHMsIGZ1bmN0aW9uKCl7fSk7XG4gIH07XG5cbiAgX2ludGVycG9sYXRvcnMgPSBbXTtcblxuICBpZiAoKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlICE9PSBudWxsKSAmJiAobW9kdWxlLmV4cG9ydHMgIT0gbnVsbCkpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGNocm9tYTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNocm9tYTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByb290ID0gdHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIgJiYgZXhwb3J0cyAhPT0gbnVsbCA/IGV4cG9ydHMgOiB0aGlzO1xuICAgIHJvb3QuY2hyb21hID0gY2hyb21hO1xuICB9XG5cbiAgY2hyb21hLnZlcnNpb24gPSAnMS4xLjEnO1xuXG5cbiAgLyoqXG4gICAgICBjaHJvbWEuanNcbiAgXG4gICAgICBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMywgR3JlZ29yIEFpc2NoXG4gICAgICBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICBcbiAgICAgIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICAgICAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gIFxuICAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICAgICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gIFxuICAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb25cbiAgICAgICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gIFxuICAgICAgKiBUaGUgbmFtZSBHcmVnb3IgQWlzY2ggbWF5IG5vdCBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0c1xuICAgICAgICBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAgXG4gICAgICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICAgICAgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxuICAgICAgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gICAgICBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBHUkVHT1IgQUlTQ0ggT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAgICAgIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLFxuICAgICAgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAgICAgIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUllcbiAgICAgIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HXG4gICAgICBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsXG4gICAgICBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICBcbiAgICAgIEBzb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9na2EvY2hyb21hLmpzXG4gICAqL1xuXG4gIF9pbnB1dCA9IHt9O1xuXG4gIF9ndWVzc19mb3JtYXRzID0gW107XG5cbiAgX2d1ZXNzX2Zvcm1hdHNfc29ydGVkID0gZmFsc2U7XG5cbiAgQ29sb3IgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gQ29sb3IoKSB7XG4gICAgICB2YXIgYXJnLCBhcmdzLCBjaGssIGxlbiwgbGVuMSwgbWUsIG1vZGUsIG8sIHc7XG4gICAgICBtZSA9IHRoaXM7XG4gICAgICBhcmdzID0gW107XG4gICAgICBmb3IgKG8gPSAwLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoOyBvIDwgbGVuOyBvKyspIHtcbiAgICAgICAgYXJnID0gYXJndW1lbnRzW29dO1xuICAgICAgICBpZiAoYXJnICE9IG51bGwpIHtcbiAgICAgICAgICBhcmdzLnB1c2goYXJnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbW9kZSA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgIGlmIChfaW5wdXRbbW9kZV0gIT0gbnVsbCkge1xuICAgICAgICBtZS5fcmdiID0gY2xpcF9yZ2IoX2lucHV0W21vZGVdKHVucGFjayhhcmdzLnNsaWNlKDAsIC0xKSkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghX2d1ZXNzX2Zvcm1hdHNfc29ydGVkKSB7XG4gICAgICAgICAgX2d1ZXNzX2Zvcm1hdHMgPSBfZ3Vlc3NfZm9ybWF0cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBiLnAgLSBhLnA7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgX2d1ZXNzX2Zvcm1hdHNfc29ydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHcgPSAwLCBsZW4xID0gX2d1ZXNzX2Zvcm1hdHMubGVuZ3RoOyB3IDwgbGVuMTsgdysrKSB7XG4gICAgICAgICAgY2hrID0gX2d1ZXNzX2Zvcm1hdHNbd107XG4gICAgICAgICAgbW9kZSA9IGNoay50ZXN0LmFwcGx5KGNoaywgYXJncyk7XG4gICAgICAgICAgaWYgKG1vZGUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobW9kZSkge1xuICAgICAgICAgIG1lLl9yZ2IgPSBjbGlwX3JnYihfaW5wdXRbbW9kZV0uYXBwbHkoX2lucHV0LCBhcmdzKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChtZS5fcmdiID09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS53YXJuKCd1bmtub3duIGZvcm1hdDogJyArIGFyZ3MpO1xuICAgICAgfVxuICAgICAgaWYgKG1lLl9yZ2IgPT0gbnVsbCkge1xuICAgICAgICBtZS5fcmdiID0gWzAsIDAsIDBdO1xuICAgICAgfVxuICAgICAgaWYgKG1lLl9yZ2IubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIG1lLl9yZ2IucHVzaCgxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBDb2xvci5wcm90b3R5cGUuYWxwaGEgPSBmdW5jdGlvbihhbHBoYSkge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fcmdiWzNdID0gYWxwaGE7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX3JnYlszXTtcbiAgICB9O1xuXG4gICAgQ29sb3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5uYW1lKCk7XG4gICAgfTtcblxuICAgIHJldHVybiBDb2xvcjtcblxuICB9KSgpO1xuXG4gIGNocm9tYS5faW5wdXQgPSBfaW5wdXQ7XG5cblxuICAvKipcbiAgXHRDb2xvckJyZXdlciBjb2xvcnMgZm9yIGNocm9tYS5qc1xuICBcbiAgXHRDb3B5cmlnaHQgKGMpIDIwMDIgQ3ludGhpYSBCcmV3ZXIsIE1hcmsgSGFycm93ZXIsIGFuZCBUaGUgXG4gIFx0UGVubnN5bHZhbmlhIFN0YXRlIFVuaXZlcnNpdHkuXG4gIFxuICBcdExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IFxuICBcdHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgXHRZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcdFxuICBcdGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICBcbiAgXHRVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlIGRpc3RyaWJ1dGVkXG4gIFx0dW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1JcbiAgXHRDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZVxuICBcdHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gIFxuICAgICAgQHByZXNlcnZlXG4gICAqL1xuXG4gIGNocm9tYS5icmV3ZXIgPSBicmV3ZXIgPSB7XG4gICAgT3JSZDogWycjZmZmN2VjJywgJyNmZWU4YzgnLCAnI2ZkZDQ5ZScsICcjZmRiYjg0JywgJyNmYzhkNTknLCAnI2VmNjU0OCcsICcjZDczMDFmJywgJyNiMzAwMDAnLCAnIzdmMDAwMCddLFxuICAgIFB1QnU6IFsnI2ZmZjdmYicsICcjZWNlN2YyJywgJyNkMGQxZTYnLCAnI2E2YmRkYicsICcjNzRhOWNmJywgJyMzNjkwYzAnLCAnIzA1NzBiMCcsICcjMDQ1YThkJywgJyMwMjM4NTgnXSxcbiAgICBCdVB1OiBbJyNmN2ZjZmQnLCAnI2UwZWNmNCcsICcjYmZkM2U2JywgJyM5ZWJjZGEnLCAnIzhjOTZjNicsICcjOGM2YmIxJywgJyM4ODQxOWQnLCAnIzgxMGY3YycsICcjNGQwMDRiJ10sXG4gICAgT3JhbmdlczogWycjZmZmNWViJywgJyNmZWU2Y2UnLCAnI2ZkZDBhMicsICcjZmRhZTZiJywgJyNmZDhkM2MnLCAnI2YxNjkxMycsICcjZDk0ODAxJywgJyNhNjM2MDMnLCAnIzdmMjcwNCddLFxuICAgIEJ1R246IFsnI2Y3ZmNmZCcsICcjZTVmNWY5JywgJyNjY2VjZTYnLCAnIzk5ZDhjOScsICcjNjZjMmE0JywgJyM0MWFlNzYnLCAnIzIzOGI0NScsICcjMDA2ZDJjJywgJyMwMDQ0MWInXSxcbiAgICBZbE9yQnI6IFsnI2ZmZmZlNScsICcjZmZmN2JjJywgJyNmZWUzOTEnLCAnI2ZlYzQ0ZicsICcjZmU5OTI5JywgJyNlYzcwMTQnLCAnI2NjNGMwMicsICcjOTkzNDA0JywgJyM2NjI1MDYnXSxcbiAgICBZbEduOiBbJyNmZmZmZTUnLCAnI2Y3ZmNiOScsICcjZDlmMGEzJywgJyNhZGRkOGUnLCAnIzc4YzY3OScsICcjNDFhYjVkJywgJyMyMzg0NDMnLCAnIzAwNjgzNycsICcjMDA0NTI5J10sXG4gICAgUmVkczogWycjZmZmNWYwJywgJyNmZWUwZDInLCAnI2ZjYmJhMScsICcjZmM5MjcyJywgJyNmYjZhNGEnLCAnI2VmM2IyYycsICcjY2IxODFkJywgJyNhNTBmMTUnLCAnIzY3MDAwZCddLFxuICAgIFJkUHU6IFsnI2ZmZjdmMycsICcjZmRlMGRkJywgJyNmY2M1YzAnLCAnI2ZhOWZiNScsICcjZjc2OGExJywgJyNkZDM0OTcnLCAnI2FlMDE3ZScsICcjN2EwMTc3JywgJyM0OTAwNmEnXSxcbiAgICBHcmVlbnM6IFsnI2Y3ZmNmNScsICcjZTVmNWUwJywgJyNjN2U5YzAnLCAnI2ExZDk5YicsICcjNzRjNDc2JywgJyM0MWFiNWQnLCAnIzIzOGI0NScsICcjMDA2ZDJjJywgJyMwMDQ0MWInXSxcbiAgICBZbEduQnU6IFsnI2ZmZmZkOScsICcjZWRmOGIxJywgJyNjN2U5YjQnLCAnIzdmY2RiYicsICcjNDFiNmM0JywgJyMxZDkxYzAnLCAnIzIyNWVhOCcsICcjMjUzNDk0JywgJyMwODFkNTgnXSxcbiAgICBQdXJwbGVzOiBbJyNmY2ZiZmQnLCAnI2VmZWRmNScsICcjZGFkYWViJywgJyNiY2JkZGMnLCAnIzllOWFjOCcsICcjODA3ZGJhJywgJyM2YTUxYTMnLCAnIzU0Mjc4ZicsICcjM2YwMDdkJ10sXG4gICAgR25CdTogWycjZjdmY2YwJywgJyNlMGYzZGInLCAnI2NjZWJjNScsICcjYThkZGI1JywgJyM3YmNjYzQnLCAnIzRlYjNkMycsICcjMmI4Y2JlJywgJyMwODY4YWMnLCAnIzA4NDA4MSddLFxuICAgIEdyZXlzOiBbJyNmZmZmZmYnLCAnI2YwZjBmMCcsICcjZDlkOWQ5JywgJyNiZGJkYmQnLCAnIzk2OTY5NicsICcjNzM3MzczJywgJyM1MjUyNTInLCAnIzI1MjUyNScsICcjMDAwMDAwJ10sXG4gICAgWWxPclJkOiBbJyNmZmZmY2MnLCAnI2ZmZWRhMCcsICcjZmVkOTc2JywgJyNmZWIyNGMnLCAnI2ZkOGQzYycsICcjZmM0ZTJhJywgJyNlMzFhMWMnLCAnI2JkMDAyNicsICcjODAwMDI2J10sXG4gICAgUHVSZDogWycjZjdmNGY5JywgJyNlN2UxZWYnLCAnI2Q0YjlkYScsICcjYzk5NGM3JywgJyNkZjY1YjAnLCAnI2U3Mjk4YScsICcjY2UxMjU2JywgJyM5ODAwNDMnLCAnIzY3MDAxZiddLFxuICAgIEJsdWVzOiBbJyNmN2ZiZmYnLCAnI2RlZWJmNycsICcjYzZkYmVmJywgJyM5ZWNhZTEnLCAnIzZiYWVkNicsICcjNDI5MmM2JywgJyMyMTcxYjUnLCAnIzA4NTE5YycsICcjMDgzMDZiJ10sXG4gICAgUHVCdUduOiBbJyNmZmY3ZmInLCAnI2VjZTJmMCcsICcjZDBkMWU2JywgJyNhNmJkZGInLCAnIzY3YTljZicsICcjMzY5MGMwJywgJyMwMjgxOGEnLCAnIzAxNmM1OScsICcjMDE0NjM2J10sXG4gICAgU3BlY3RyYWw6IFsnIzllMDE0MicsICcjZDUzZTRmJywgJyNmNDZkNDMnLCAnI2ZkYWU2MScsICcjZmVlMDhiJywgJyNmZmZmYmYnLCAnI2U2ZjU5OCcsICcjYWJkZGE0JywgJyM2NmMyYTUnLCAnIzMyODhiZCcsICcjNWU0ZmEyJ10sXG4gICAgUmRZbEduOiBbJyNhNTAwMjYnLCAnI2Q3MzAyNycsICcjZjQ2ZDQzJywgJyNmZGFlNjEnLCAnI2ZlZTA4YicsICcjZmZmZmJmJywgJyNkOWVmOGInLCAnI2E2ZDk2YScsICcjNjZiZDYzJywgJyMxYTk4NTAnLCAnIzAwNjgzNyddLFxuICAgIFJkQnU6IFsnIzY3MDAxZicsICcjYjIxODJiJywgJyNkNjYwNGQnLCAnI2Y0YTU4MicsICcjZmRkYmM3JywgJyNmN2Y3ZjcnLCAnI2QxZTVmMCcsICcjOTJjNWRlJywgJyM0MzkzYzMnLCAnIzIxNjZhYycsICcjMDUzMDYxJ10sXG4gICAgUGlZRzogWycjOGUwMTUyJywgJyNjNTFiN2QnLCAnI2RlNzdhZScsICcjZjFiNmRhJywgJyNmZGUwZWYnLCAnI2Y3ZjdmNycsICcjZTZmNWQwJywgJyNiOGUxODYnLCAnIzdmYmM0MScsICcjNGQ5MjIxJywgJyMyNzY0MTknXSxcbiAgICBQUkduOiBbJyM0MDAwNGInLCAnIzc2MmE4MycsICcjOTk3MGFiJywgJyNjMmE1Y2YnLCAnI2U3ZDRlOCcsICcjZjdmN2Y3JywgJyNkOWYwZDMnLCAnI2E2ZGJhMCcsICcjNWFhZTYxJywgJyMxYjc4MzcnLCAnIzAwNDQxYiddLFxuICAgIFJkWWxCdTogWycjYTUwMDI2JywgJyNkNzMwMjcnLCAnI2Y0NmQ0MycsICcjZmRhZTYxJywgJyNmZWUwOTAnLCAnI2ZmZmZiZicsICcjZTBmM2Y4JywgJyNhYmQ5ZTknLCAnIzc0YWRkMScsICcjNDU3NWI0JywgJyMzMTM2OTUnXSxcbiAgICBCckJHOiBbJyM1NDMwMDUnLCAnIzhjNTEwYScsICcjYmY4MTJkJywgJyNkZmMyN2QnLCAnI2Y2ZThjMycsICcjZjVmNWY1JywgJyNjN2VhZTUnLCAnIzgwY2RjMScsICcjMzU5NzhmJywgJyMwMTY2NWUnLCAnIzAwM2MzMCddLFxuICAgIFJkR3k6IFsnIzY3MDAxZicsICcjYjIxODJiJywgJyNkNjYwNGQnLCAnI2Y0YTU4MicsICcjZmRkYmM3JywgJyNmZmZmZmYnLCAnI2UwZTBlMCcsICcjYmFiYWJhJywgJyM4Nzg3ODcnLCAnIzRkNGQ0ZCcsICcjMWExYTFhJ10sXG4gICAgUHVPcjogWycjN2YzYjA4JywgJyNiMzU4MDYnLCAnI2UwODIxNCcsICcjZmRiODYzJywgJyNmZWUwYjYnLCAnI2Y3ZjdmNycsICcjZDhkYWViJywgJyNiMmFiZDInLCAnIzgwNzNhYycsICcjNTQyNzg4JywgJyMyZDAwNGInXSxcbiAgICBTZXQyOiBbJyM2NmMyYTUnLCAnI2ZjOGQ2MicsICcjOGRhMGNiJywgJyNlNzhhYzMnLCAnI2E2ZDg1NCcsICcjZmZkOTJmJywgJyNlNWM0OTQnLCAnI2IzYjNiMyddLFxuICAgIEFjY2VudDogWycjN2ZjOTdmJywgJyNiZWFlZDQnLCAnI2ZkYzA4NicsICcjZmZmZjk5JywgJyMzODZjYjAnLCAnI2YwMDI3ZicsICcjYmY1YjE3JywgJyM2NjY2NjYnXSxcbiAgICBTZXQxOiBbJyNlNDFhMWMnLCAnIzM3N2ViOCcsICcjNGRhZjRhJywgJyM5ODRlYTMnLCAnI2ZmN2YwMCcsICcjZmZmZjMzJywgJyNhNjU2MjgnLCAnI2Y3ODFiZicsICcjOTk5OTk5J10sXG4gICAgU2V0MzogWycjOGRkM2M3JywgJyNmZmZmYjMnLCAnI2JlYmFkYScsICcjZmI4MDcyJywgJyM4MGIxZDMnLCAnI2ZkYjQ2MicsICcjYjNkZTY5JywgJyNmY2NkZTUnLCAnI2Q5ZDlkOScsICcjYmM4MGJkJywgJyNjY2ViYzUnLCAnI2ZmZWQ2ZiddLFxuICAgIERhcmsyOiBbJyMxYjllNzcnLCAnI2Q5NWYwMicsICcjNzU3MGIzJywgJyNlNzI5OGEnLCAnIzY2YTYxZScsICcjZTZhYjAyJywgJyNhNjc2MWQnLCAnIzY2NjY2NiddLFxuICAgIFBhaXJlZDogWycjYTZjZWUzJywgJyMxZjc4YjQnLCAnI2IyZGY4YScsICcjMzNhMDJjJywgJyNmYjlhOTknLCAnI2UzMWExYycsICcjZmRiZjZmJywgJyNmZjdmMDAnLCAnI2NhYjJkNicsICcjNmEzZDlhJywgJyNmZmZmOTknLCAnI2IxNTkyOCddLFxuICAgIFBhc3RlbDI6IFsnI2IzZTJjZCcsICcjZmRjZGFjJywgJyNjYmQ1ZTgnLCAnI2Y0Y2FlNCcsICcjZTZmNWM5JywgJyNmZmYyYWUnLCAnI2YxZTJjYycsICcjY2NjY2NjJ10sXG4gICAgUGFzdGVsMTogWycjZmJiNGFlJywgJyNiM2NkZTMnLCAnI2NjZWJjNScsICcjZGVjYmU0JywgJyNmZWQ5YTYnLCAnI2ZmZmZjYycsICcjZTVkOGJkJywgJyNmZGRhZWMnLCAnI2YyZjJmMiddXG4gIH07XG5cblxuICAvKipcbiAgXHRYMTEgY29sb3IgbmFtZXNcbiAgXG4gIFx0aHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1jb2xvci8jc3ZnLWNvbG9yXG4gICAqL1xuXG4gIHczY3gxMSA9IHtcbiAgICBpbmRpZ286IFwiIzRiMDA4MlwiLFxuICAgIGdvbGQ6IFwiI2ZmZDcwMFwiLFxuICAgIGhvdHBpbms6IFwiI2ZmNjliNFwiLFxuICAgIGZpcmVicmljazogXCIjYjIyMjIyXCIsXG4gICAgaW5kaWFucmVkOiBcIiNjZDVjNWNcIixcbiAgICB5ZWxsb3c6IFwiI2ZmZmYwMFwiLFxuICAgIG1pc3R5cm9zZTogXCIjZmZlNGUxXCIsXG4gICAgZGFya29saXZlZ3JlZW46IFwiIzU1NmIyZlwiLFxuICAgIG9saXZlOiBcIiM4MDgwMDBcIixcbiAgICBkYXJrc2VhZ3JlZW46IFwiIzhmYmM4ZlwiLFxuICAgIHBpbms6IFwiI2ZmYzBjYlwiLFxuICAgIHRvbWF0bzogXCIjZmY2MzQ3XCIsXG4gICAgbGlnaHRjb3JhbDogXCIjZjA4MDgwXCIsXG4gICAgb3JhbmdlcmVkOiBcIiNmZjQ1MDBcIixcbiAgICBuYXZham93aGl0ZTogXCIjZmZkZWFkXCIsXG4gICAgbGltZTogXCIjMDBmZjAwXCIsXG4gICAgcGFsZWdyZWVuOiBcIiM5OGZiOThcIixcbiAgICBkYXJrc2xhdGVncmV5OiBcIiMyZjRmNGZcIixcbiAgICBncmVlbnllbGxvdzogXCIjYWRmZjJmXCIsXG4gICAgYnVybHl3b29kOiBcIiNkZWI4ODdcIixcbiAgICBzZWFzaGVsbDogXCIjZmZmNWVlXCIsXG4gICAgbWVkaXVtc3ByaW5nZ3JlZW46IFwiIzAwZmE5YVwiLFxuICAgIGZ1Y2hzaWE6IFwiI2ZmMDBmZlwiLFxuICAgIHBhcGF5YXdoaXA6IFwiI2ZmZWZkNVwiLFxuICAgIGJsYW5jaGVkYWxtb25kOiBcIiNmZmViY2RcIixcbiAgICBjaGFydHJldXNlOiBcIiM3ZmZmMDBcIixcbiAgICBkaW1ncmF5OiBcIiM2OTY5NjlcIixcbiAgICBibGFjazogXCIjMDAwMDAwXCIsXG4gICAgcGVhY2hwdWZmOiBcIiNmZmRhYjlcIixcbiAgICBzcHJpbmdncmVlbjogXCIjMDBmZjdmXCIsXG4gICAgYXF1YW1hcmluZTogXCIjN2ZmZmQ0XCIsXG4gICAgd2hpdGU6IFwiI2ZmZmZmZlwiLFxuICAgIG9yYW5nZTogXCIjZmZhNTAwXCIsXG4gICAgbGlnaHRzYWxtb246IFwiI2ZmYTA3YVwiLFxuICAgIGRhcmtzbGF0ZWdyYXk6IFwiIzJmNGY0ZlwiLFxuICAgIGJyb3duOiBcIiNhNTJhMmFcIixcbiAgICBpdm9yeTogXCIjZmZmZmYwXCIsXG4gICAgZG9kZ2VyYmx1ZTogXCIjMWU5MGZmXCIsXG4gICAgcGVydTogXCIjY2Q4NTNmXCIsXG4gICAgbGF3bmdyZWVuOiBcIiM3Y2ZjMDBcIixcbiAgICBjaG9jb2xhdGU6IFwiI2QyNjkxZVwiLFxuICAgIGNyaW1zb246IFwiI2RjMTQzY1wiLFxuICAgIGZvcmVzdGdyZWVuOiBcIiMyMjhiMjJcIixcbiAgICBkYXJrZ3JleTogXCIjYTlhOWE5XCIsXG4gICAgbGlnaHRzZWFncmVlbjogXCIjMjBiMmFhXCIsXG4gICAgY3lhbjogXCIjMDBmZmZmXCIsXG4gICAgbWludGNyZWFtOiBcIiNmNWZmZmFcIixcbiAgICBzaWx2ZXI6IFwiI2MwYzBjMFwiLFxuICAgIGFudGlxdWV3aGl0ZTogXCIjZmFlYmQ3XCIsXG4gICAgbWVkaXVtb3JjaGlkOiBcIiNiYTU1ZDNcIixcbiAgICBza3libHVlOiBcIiM4N2NlZWJcIixcbiAgICBncmF5OiBcIiM4MDgwODBcIixcbiAgICBkYXJrdHVycXVvaXNlOiBcIiMwMGNlZDFcIixcbiAgICBnb2xkZW5yb2Q6IFwiI2RhYTUyMFwiLFxuICAgIGRhcmtncmVlbjogXCIjMDA2NDAwXCIsXG4gICAgZmxvcmFsd2hpdGU6IFwiI2ZmZmFmMFwiLFxuICAgIGRhcmt2aW9sZXQ6IFwiIzk0MDBkM1wiLFxuICAgIGRhcmtncmF5OiBcIiNhOWE5YTlcIixcbiAgICBtb2NjYXNpbjogXCIjZmZlNGI1XCIsXG4gICAgc2FkZGxlYnJvd246IFwiIzhiNDUxM1wiLFxuICAgIGdyZXk6IFwiIzgwODA4MFwiLFxuICAgIGRhcmtzbGF0ZWJsdWU6IFwiIzQ4M2Q4YlwiLFxuICAgIGxpZ2h0c2t5Ymx1ZTogXCIjODdjZWZhXCIsXG4gICAgbGlnaHRwaW5rOiBcIiNmZmI2YzFcIixcbiAgICBtZWRpdW12aW9sZXRyZWQ6IFwiI2M3MTU4NVwiLFxuICAgIHNsYXRlZ3JleTogXCIjNzA4MDkwXCIsXG4gICAgcmVkOiBcIiNmZjAwMDBcIixcbiAgICBkZWVwcGluazogXCIjZmYxNDkzXCIsXG4gICAgbGltZWdyZWVuOiBcIiMzMmNkMzJcIixcbiAgICBkYXJrbWFnZW50YTogXCIjOGIwMDhiXCIsXG4gICAgcGFsZWdvbGRlbnJvZDogXCIjZWVlOGFhXCIsXG4gICAgcGx1bTogXCIjZGRhMGRkXCIsXG4gICAgdHVycXVvaXNlOiBcIiM0MGUwZDBcIixcbiAgICBsaWdodGdyZXk6IFwiI2QzZDNkM1wiLFxuICAgIGxpZ2h0Z29sZGVucm9keWVsbG93OiBcIiNmYWZhZDJcIixcbiAgICBkYXJrZ29sZGVucm9kOiBcIiNiODg2MGJcIixcbiAgICBsYXZlbmRlcjogXCIjZTZlNmZhXCIsXG4gICAgbWFyb29uOiBcIiM4MDAwMDBcIixcbiAgICB5ZWxsb3dncmVlbjogXCIjOWFjZDMyXCIsXG4gICAgc2FuZHlicm93bjogXCIjZjRhNDYwXCIsXG4gICAgdGhpc3RsZTogXCIjZDhiZmQ4XCIsXG4gICAgdmlvbGV0OiBcIiNlZTgyZWVcIixcbiAgICBuYXZ5OiBcIiMwMDAwODBcIixcbiAgICBtYWdlbnRhOiBcIiNmZjAwZmZcIixcbiAgICBkaW1ncmV5OiBcIiM2OTY5NjlcIixcbiAgICB0YW46IFwiI2QyYjQ4Y1wiLFxuICAgIHJvc3licm93bjogXCIjYmM4ZjhmXCIsXG4gICAgb2xpdmVkcmFiOiBcIiM2YjhlMjNcIixcbiAgICBibHVlOiBcIiMwMDAwZmZcIixcbiAgICBsaWdodGJsdWU6IFwiI2FkZDhlNlwiLFxuICAgIGdob3N0d2hpdGU6IFwiI2Y4ZjhmZlwiLFxuICAgIGhvbmV5ZGV3OiBcIiNmMGZmZjBcIixcbiAgICBjb3JuZmxvd2VyYmx1ZTogXCIjNjQ5NWVkXCIsXG4gICAgc2xhdGVibHVlOiBcIiM2YTVhY2RcIixcbiAgICBsaW5lbjogXCIjZmFmMGU2XCIsXG4gICAgZGFya2JsdWU6IFwiIzAwMDA4YlwiLFxuICAgIHBvd2RlcmJsdWU6IFwiI2IwZTBlNlwiLFxuICAgIHNlYWdyZWVuOiBcIiMyZThiNTdcIixcbiAgICBkYXJra2hha2k6IFwiI2JkYjc2YlwiLFxuICAgIHNub3c6IFwiI2ZmZmFmYVwiLFxuICAgIHNpZW5uYTogXCIjYTA1MjJkXCIsXG4gICAgbWVkaXVtYmx1ZTogXCIjMDAwMGNkXCIsXG4gICAgcm95YWxibHVlOiBcIiM0MTY5ZTFcIixcbiAgICBsaWdodGN5YW46IFwiI2UwZmZmZlwiLFxuICAgIGdyZWVuOiBcIiMwMDgwMDBcIixcbiAgICBtZWRpdW1wdXJwbGU6IFwiIzkzNzBkYlwiLFxuICAgIG1pZG5pZ2h0Ymx1ZTogXCIjMTkxOTcwXCIsXG4gICAgY29ybnNpbGs6IFwiI2ZmZjhkY1wiLFxuICAgIHBhbGV0dXJxdW9pc2U6IFwiI2FmZWVlZVwiLFxuICAgIGJpc3F1ZTogXCIjZmZlNGM0XCIsXG4gICAgc2xhdGVncmF5OiBcIiM3MDgwOTBcIixcbiAgICBkYXJrY3lhbjogXCIjMDA4YjhiXCIsXG4gICAga2hha2k6IFwiI2YwZTY4Y1wiLFxuICAgIHdoZWF0OiBcIiNmNWRlYjNcIixcbiAgICB0ZWFsOiBcIiMwMDgwODBcIixcbiAgICBkYXJrb3JjaGlkOiBcIiM5OTMyY2NcIixcbiAgICBkZWVwc2t5Ymx1ZTogXCIjMDBiZmZmXCIsXG4gICAgc2FsbW9uOiBcIiNmYTgwNzJcIixcbiAgICBkYXJrcmVkOiBcIiM4YjAwMDBcIixcbiAgICBzdGVlbGJsdWU6IFwiIzQ2ODJiNFwiLFxuICAgIHBhbGV2aW9sZXRyZWQ6IFwiI2RiNzA5M1wiLFxuICAgIGxpZ2h0c2xhdGVncmF5OiBcIiM3Nzg4OTlcIixcbiAgICBhbGljZWJsdWU6IFwiI2YwZjhmZlwiLFxuICAgIGxpZ2h0c2xhdGVncmV5OiBcIiM3Nzg4OTlcIixcbiAgICBsaWdodGdyZWVuOiBcIiM5MGVlOTBcIixcbiAgICBvcmNoaWQ6IFwiI2RhNzBkNlwiLFxuICAgIGdhaW5zYm9ybzogXCIjZGNkY2RjXCIsXG4gICAgbWVkaXVtc2VhZ3JlZW46IFwiIzNjYjM3MVwiLFxuICAgIGxpZ2h0Z3JheTogXCIjZDNkM2QzXCIsXG4gICAgbWVkaXVtdHVycXVvaXNlOiBcIiM0OGQxY2NcIixcbiAgICBsZW1vbmNoaWZmb246IFwiI2ZmZmFjZFwiLFxuICAgIGNhZGV0Ymx1ZTogXCIjNWY5ZWEwXCIsXG4gICAgbGlnaHR5ZWxsb3c6IFwiI2ZmZmZlMFwiLFxuICAgIGxhdmVuZGVyYmx1c2g6IFwiI2ZmZjBmNVwiLFxuICAgIGNvcmFsOiBcIiNmZjdmNTBcIixcbiAgICBwdXJwbGU6IFwiIzgwMDA4MFwiLFxuICAgIGFxdWE6IFwiIzAwZmZmZlwiLFxuICAgIHdoaXRlc21va2U6IFwiI2Y1ZjVmNVwiLFxuICAgIG1lZGl1bXNsYXRlYmx1ZTogXCIjN2I2OGVlXCIsXG4gICAgZGFya29yYW5nZTogXCIjZmY4YzAwXCIsXG4gICAgbWVkaXVtYXF1YW1hcmluZTogXCIjNjZjZGFhXCIsXG4gICAgZGFya3NhbG1vbjogXCIjZTk5NjdhXCIsXG4gICAgYmVpZ2U6IFwiI2Y1ZjVkY1wiLFxuICAgIGJsdWV2aW9sZXQ6IFwiIzhhMmJlMlwiLFxuICAgIGF6dXJlOiBcIiNmMGZmZmZcIixcbiAgICBsaWdodHN0ZWVsYmx1ZTogXCIjYjBjNGRlXCIsXG4gICAgb2xkbGFjZTogXCIjZmRmNWU2XCIsXG4gICAgcmViZWNjYXB1cnBsZTogXCIjNjYzMzk5XCJcbiAgfTtcblxuICBjaHJvbWEuY29sb3JzID0gY29sb3JzID0gdzNjeDExO1xuXG4gIGxhYjJyZ2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYSwgYXJncywgYiwgZywgbCwgciwgeCwgeSwgejtcbiAgICBhcmdzID0gdW5wYWNrKGFyZ3VtZW50cyk7XG4gICAgbCA9IGFyZ3NbMF0sIGEgPSBhcmdzWzFdLCBiID0gYXJnc1syXTtcbiAgICB5ID0gKGwgKyAxNikgLyAxMTY7XG4gICAgeCA9IGlzTmFOKGEpID8geSA6IHkgKyBhIC8gNTAwO1xuICAgIHogPSBpc05hTihiKSA/IHkgOiB5IC0gYiAvIDIwMDtcbiAgICB5ID0gTEFCX0NPTlNUQU5UUy5ZbiAqIGxhYl94eXooeSk7XG4gICAgeCA9IExBQl9DT05TVEFOVFMuWG4gKiBsYWJfeHl6KHgpO1xuICAgIHogPSBMQUJfQ09OU1RBTlRTLlpuICogbGFiX3h5eih6KTtcbiAgICByID0geHl6X3JnYigzLjI0MDQ1NDIgKiB4IC0gMS41MzcxMzg1ICogeSAtIDAuNDk4NTMxNCAqIHopO1xuICAgIGcgPSB4eXpfcmdiKC0wLjk2OTI2NjAgKiB4ICsgMS44NzYwMTA4ICogeSArIDAuMDQxNTU2MCAqIHopO1xuICAgIGIgPSB4eXpfcmdiKDAuMDU1NjQzNCAqIHggLSAwLjIwNDAyNTkgKiB5ICsgMS4wNTcyMjUyICogeik7XG4gICAgciA9IGxpbWl0KHIsIDAsIDI1NSk7XG4gICAgZyA9IGxpbWl0KGcsIDAsIDI1NSk7XG4gICAgYiA9IGxpbWl0KGIsIDAsIDI1NSk7XG4gICAgcmV0dXJuIFtyLCBnLCBiLCBhcmdzLmxlbmd0aCA+IDMgPyBhcmdzWzNdIDogMV07XG4gIH07XG5cbiAgeHl6X3JnYiA9IGZ1bmN0aW9uKHIpIHtcbiAgICByZXR1cm4gcm91bmQoMjU1ICogKHIgPD0gMC4wMDMwNCA/IDEyLjkyICogciA6IDEuMDU1ICogcG93KHIsIDEgLyAyLjQpIC0gMC4wNTUpKTtcbiAgfTtcblxuICBsYWJfeHl6ID0gZnVuY3Rpb24odCkge1xuICAgIGlmICh0ID4gTEFCX0NPTlNUQU5UUy50MSkge1xuICAgICAgcmV0dXJuIHQgKiB0ICogdDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIExBQl9DT05TVEFOVFMudDIgKiAodCAtIExBQl9DT05TVEFOVFMudDApO1xuICAgIH1cbiAgfTtcblxuICBMQUJfQ09OU1RBTlRTID0ge1xuICAgIEtuOiAxOCxcbiAgICBYbjogMC45NTA0NzAsXG4gICAgWW46IDEsXG4gICAgWm46IDEuMDg4ODMwLFxuICAgIHQwOiAwLjEzNzkzMTAzNCxcbiAgICB0MTogMC4yMDY4OTY1NTIsXG4gICAgdDI6IDAuMTI4NDE4NTUsXG4gICAgdDM6IDAuMDA4ODU2NDUyXG4gIH07XG5cbiAgcmdiMmxhYiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBiLCBnLCByLCByZWYsIHJlZjEsIHgsIHksIHo7XG4gICAgcmVmID0gdW5wYWNrKGFyZ3VtZW50cyksIHIgPSByZWZbMF0sIGcgPSByZWZbMV0sIGIgPSByZWZbMl07XG4gICAgcmVmMSA9IHJnYjJ4eXoociwgZywgYiksIHggPSByZWYxWzBdLCB5ID0gcmVmMVsxXSwgeiA9IHJlZjFbMl07XG4gICAgcmV0dXJuIFsxMTYgKiB5IC0gMTYsIDUwMCAqICh4IC0geSksIDIwMCAqICh5IC0geildO1xuICB9O1xuXG4gIHJnYl94eXogPSBmdW5jdGlvbihyKSB7XG4gICAgaWYgKChyIC89IDI1NSkgPD0gMC4wNDA0NSkge1xuICAgICAgcmV0dXJuIHIgLyAxMi45MjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBvdygociArIDAuMDU1KSAvIDEuMDU1LCAyLjQpO1xuICAgIH1cbiAgfTtcblxuICB4eXpfbGFiID0gZnVuY3Rpb24odCkge1xuICAgIGlmICh0ID4gTEFCX0NPTlNUQU5UUy50Mykge1xuICAgICAgcmV0dXJuIHBvdyh0LCAxIC8gMyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0IC8gTEFCX0NPTlNUQU5UUy50MiArIExBQl9DT05TVEFOVFMudDA7XG4gICAgfVxuICB9O1xuXG4gIHJnYjJ4eXogPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiwgZywgciwgcmVmLCB4LCB5LCB6O1xuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIHIgPSByZ2JfeHl6KHIpO1xuICAgIGcgPSByZ2JfeHl6KGcpO1xuICAgIGIgPSByZ2JfeHl6KGIpO1xuICAgIHggPSB4eXpfbGFiKCgwLjQxMjQ1NjQgKiByICsgMC4zNTc1NzYxICogZyArIDAuMTgwNDM3NSAqIGIpIC8gTEFCX0NPTlNUQU5UUy5Ybik7XG4gICAgeSA9IHh5el9sYWIoKDAuMjEyNjcyOSAqIHIgKyAwLjcxNTE1MjIgKiBnICsgMC4wNzIxNzUwICogYikgLyBMQUJfQ09OU1RBTlRTLlluKTtcbiAgICB6ID0geHl6X2xhYigoMC4wMTkzMzM5ICogciArIDAuMTE5MTkyMCAqIGcgKyAwLjk1MDMwNDEgKiBiKSAvIExBQl9DT05TVEFOVFMuWm4pO1xuICAgIHJldHVybiBbeCwgeSwgel07XG4gIH07XG5cbiAgY2hyb21hLmxhYiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKTtcbiAgICAgIHJldHVybiBPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0ID8gcmVzdWx0IDogY2hpbGQ7XG4gICAgfSkoQ29sb3IsIHNsaWNlLmNhbGwoYXJndW1lbnRzKS5jb25jYXQoWydsYWInXSksIGZ1bmN0aW9uKCl7fSk7XG4gIH07XG5cbiAgX2lucHV0LmxhYiA9IGxhYjJyZ2I7XG5cbiAgQ29sb3IucHJvdG90eXBlLmxhYiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiByZ2IybGFiKHRoaXMuX3JnYik7XG4gIH07XG5cbiAgYmV6aWVyID0gZnVuY3Rpb24oY29sb3JzKSB7XG4gICAgdmFyIEksIEkwLCBJMSwgYywgbGFiMCwgbGFiMSwgbGFiMiwgbGFiMywgcmVmLCByZWYxLCByZWYyO1xuICAgIGNvbG9ycyA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsZW4sIG8sIHJlc3VsdHM7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKG8gPSAwLCBsZW4gPSBjb2xvcnMubGVuZ3RoOyBvIDwgbGVuOyBvKyspIHtcbiAgICAgICAgYyA9IGNvbG9yc1tvXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGNocm9tYShjKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9KSgpO1xuICAgIGlmIChjb2xvcnMubGVuZ3RoID09PSAyKSB7XG4gICAgICByZWYgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsZW4sIG8sIHJlc3VsdHM7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChvID0gMCwgbGVuID0gY29sb3JzLmxlbmd0aDsgbyA8IGxlbjsgbysrKSB7XG4gICAgICAgICAgYyA9IGNvbG9yc1tvXTtcbiAgICAgICAgICByZXN1bHRzLnB1c2goYy5sYWIoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KSgpLCBsYWIwID0gcmVmWzBdLCBsYWIxID0gcmVmWzFdO1xuICAgICAgSSA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdmFyIGksIGxhYjtcbiAgICAgICAgbGFiID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBvLCByZXN1bHRzO1xuICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKGkgPSBvID0gMDsgbyA8PSAyOyBpID0gKytvKSB7XG4gICAgICAgICAgICByZXN1bHRzLnB1c2gobGFiMFtpXSArIHQgKiAobGFiMVtpXSAtIGxhYjBbaV0pKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0pKCk7XG4gICAgICAgIHJldHVybiBjaHJvbWEubGFiLmFwcGx5KGNocm9tYSwgbGFiKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIGlmIChjb2xvcnMubGVuZ3RoID09PSAzKSB7XG4gICAgICByZWYxID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbGVuLCBvLCByZXN1bHRzO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAobyA9IDAsIGxlbiA9IGNvbG9ycy5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgICAgIGMgPSBjb2xvcnNbb107XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKGMubGFiKCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgfSkoKSwgbGFiMCA9IHJlZjFbMF0sIGxhYjEgPSByZWYxWzFdLCBsYWIyID0gcmVmMVsyXTtcbiAgICAgIEkgPSBmdW5jdGlvbih0KSB7XG4gICAgICAgIHZhciBpLCBsYWI7XG4gICAgICAgIGxhYiA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgbywgcmVzdWx0cztcbiAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChpID0gbyA9IDA7IG8gPD0gMjsgaSA9ICsrbykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCgxIC0gdCkgKiAoMSAtIHQpICogbGFiMFtpXSArIDIgKiAoMSAtIHQpICogdCAqIGxhYjFbaV0gKyB0ICogdCAqIGxhYjJbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSkoKTtcbiAgICAgICAgcmV0dXJuIGNocm9tYS5sYWIuYXBwbHkoY2hyb21hLCBsYWIpO1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGNvbG9ycy5sZW5ndGggPT09IDQpIHtcbiAgICAgIHJlZjIgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBsZW4sIG8sIHJlc3VsdHM7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChvID0gMCwgbGVuID0gY29sb3JzLmxlbmd0aDsgbyA8IGxlbjsgbysrKSB7XG4gICAgICAgICAgYyA9IGNvbG9yc1tvXTtcbiAgICAgICAgICByZXN1bHRzLnB1c2goYy5sYWIoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KSgpLCBsYWIwID0gcmVmMlswXSwgbGFiMSA9IHJlZjJbMV0sIGxhYjIgPSByZWYyWzJdLCBsYWIzID0gcmVmMlszXTtcbiAgICAgIEkgPSBmdW5jdGlvbih0KSB7XG4gICAgICAgIHZhciBpLCBsYWI7XG4gICAgICAgIGxhYiA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgbywgcmVzdWx0cztcbiAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChpID0gbyA9IDA7IG8gPD0gMjsgaSA9ICsrbykge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCgxIC0gdCkgKiAoMSAtIHQpICogKDEgLSB0KSAqIGxhYjBbaV0gKyAzICogKDEgLSB0KSAqICgxIC0gdCkgKiB0ICogbGFiMVtpXSArIDMgKiAoMSAtIHQpICogdCAqIHQgKiBsYWIyW2ldICsgdCAqIHQgKiB0ICogbGFiM1tpXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KSgpO1xuICAgICAgICByZXR1cm4gY2hyb21hLmxhYi5hcHBseShjaHJvbWEsIGxhYik7XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAoY29sb3JzLmxlbmd0aCA9PT0gNSkge1xuICAgICAgSTAgPSBiZXppZXIoY29sb3JzLnNsaWNlKDAsIDMpKTtcbiAgICAgIEkxID0gYmV6aWVyKGNvbG9ycy5zbGljZSgyLCA1KSk7XG4gICAgICBJID0gZnVuY3Rpb24odCkge1xuICAgICAgICBpZiAodCA8IDAuNSkge1xuICAgICAgICAgIHJldHVybiBJMCh0ICogMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIEkxKCh0IC0gMC41KSAqIDIpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gSTtcbiAgfTtcblxuICBjaHJvbWEuYmV6aWVyID0gZnVuY3Rpb24oY29sb3JzKSB7XG4gICAgdmFyIGY7XG4gICAgZiA9IGJlemllcihjb2xvcnMpO1xuICAgIGYuc2NhbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjaHJvbWEuc2NhbGUoZik7XG4gICAgfTtcbiAgICByZXR1cm4gZjtcbiAgfTtcblxuXG4gIC8qXG4gICAgICBjaHJvbWEuanNcbiAgXG4gICAgICBDb3B5cmlnaHQgKGMpIDIwMTEtMjAxMywgR3JlZ29yIEFpc2NoXG4gICAgICBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICBcbiAgICAgIFJlZGlzdHJpYnV0aW9uIGFuZCB1c2UgaW4gc291cmNlIGFuZCBiaW5hcnkgZm9ybXMsIHdpdGggb3Igd2l0aG91dFxuICAgICAgbW9kaWZpY2F0aW9uLCBhcmUgcGVybWl0dGVkIHByb3ZpZGVkIHRoYXQgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGFyZSBtZXQ6XG4gIFxuICAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXNcbiAgICAgICAgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gIFxuICAgICAgKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsXG4gICAgICAgIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIgaW4gdGhlIGRvY3VtZW50YXRpb25cbiAgICAgICAgYW5kL29yIG90aGVyIG1hdGVyaWFscyBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gIFxuICAgICAgKiBUaGUgbmFtZSBHcmVnb3IgQWlzY2ggbWF5IG5vdCBiZSB1c2VkIHRvIGVuZG9yc2Ugb3IgcHJvbW90ZSBwcm9kdWN0c1xuICAgICAgICBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAgXG4gICAgICBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIlxuICAgICAgQU5EIEFOWSBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRVxuICAgICAgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFXG4gICAgICBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBHUkVHT1IgQUlTQ0ggT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCxcbiAgICAgIElORElSRUNULCBJTkNJREVOVEFMLCBTUEVDSUFMLCBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLFxuICAgICAgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFIEdPT0RTIE9SIFNFUlZJQ0VTOyBMT1NTIE9GIFVTRSxcbiAgICAgIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRUQgQU5EIE9OIEFOWSBUSEVPUllcbiAgICAgIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HXG4gICAgICBORUdMSUdFTkNFIE9SIE9USEVSV0lTRSkgQVJJU0lORyBJTiBBTlkgV0FZIE9VVCBPRiBUSEUgVVNFIE9GIFRISVMgU09GVFdBUkUsXG4gICAgICBFVkVOIElGIEFEVklTRUQgT0YgVEhFIFBPU1NJQklMSVRZIE9GIFNVQ0ggREFNQUdFLlxuICBcbiAgICAgIEBzb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9na2EvY2hyb21hLmpzXG4gICAqL1xuXG4gIGNocm9tYS5jdWJlaGVsaXggPSBmdW5jdGlvbihzdGFydCwgcm90YXRpb25zLCBodWUsIGdhbW1hLCBsaWdodG5lc3MpIHtcbiAgICB2YXIgZGgsIGRsLCBmO1xuICAgIGlmIChzdGFydCA9PSBudWxsKSB7XG4gICAgICBzdGFydCA9IDMwMDtcbiAgICB9XG4gICAgaWYgKHJvdGF0aW9ucyA9PSBudWxsKSB7XG4gICAgICByb3RhdGlvbnMgPSAtMS41O1xuICAgIH1cbiAgICBpZiAoaHVlID09IG51bGwpIHtcbiAgICAgIGh1ZSA9IDE7XG4gICAgfVxuICAgIGlmIChnYW1tYSA9PSBudWxsKSB7XG4gICAgICBnYW1tYSA9IDE7XG4gICAgfVxuICAgIGlmIChsaWdodG5lc3MgPT0gbnVsbCkge1xuICAgICAgbGlnaHRuZXNzID0gWzAsIDFdO1xuICAgIH1cbiAgICBkbCA9IGxpZ2h0bmVzc1sxXSAtIGxpZ2h0bmVzc1swXTtcbiAgICBkaCA9IDA7XG4gICAgZiA9IGZ1bmN0aW9uKGZyYWN0KSB7XG4gICAgICB2YXIgYSwgYW1wLCBiLCBjb3NfYSwgZywgaCwgbCwgciwgc2luX2E7XG4gICAgICBhID0gVFdPUEkgKiAoKHN0YXJ0ICsgMTIwKSAvIDM2MCArIHJvdGF0aW9ucyAqIGZyYWN0KTtcbiAgICAgIGwgPSBwb3cobGlnaHRuZXNzWzBdICsgZGwgKiBmcmFjdCwgZ2FtbWEpO1xuICAgICAgaCA9IGRoICE9PSAwID8gaHVlWzBdICsgZnJhY3QgKiBkaCA6IGh1ZTtcbiAgICAgIGFtcCA9IGggKiBsICogKDEgLSBsKSAvIDI7XG4gICAgICBjb3NfYSA9IGNvcyhhKTtcbiAgICAgIHNpbl9hID0gc2luKGEpO1xuICAgICAgciA9IGwgKyBhbXAgKiAoLTAuMTQ4NjEgKiBjb3NfYSArIDEuNzgyNzcgKiBzaW5fYSk7XG4gICAgICBnID0gbCArIGFtcCAqICgtMC4yOTIyNyAqIGNvc19hIC0gMC45MDY0OSAqIHNpbl9hKTtcbiAgICAgIGIgPSBsICsgYW1wICogKCsxLjk3Mjk0ICogY29zX2EpO1xuICAgICAgcmV0dXJuIGNocm9tYShjbGlwX3JnYihbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV0pKTtcbiAgICB9O1xuICAgIGYuc3RhcnQgPSBmdW5jdGlvbihzKSB7XG4gICAgICBpZiAocyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBzdGFydDtcbiAgICAgIH1cbiAgICAgIHN0YXJ0ID0gcztcbiAgICAgIHJldHVybiBmO1xuICAgIH07XG4gICAgZi5yb3RhdGlvbnMgPSBmdW5jdGlvbihyKSB7XG4gICAgICBpZiAociA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiByb3RhdGlvbnM7XG4gICAgICB9XG4gICAgICByb3RhdGlvbnMgPSByO1xuICAgICAgcmV0dXJuIGY7XG4gICAgfTtcbiAgICBmLmdhbW1hID0gZnVuY3Rpb24oZykge1xuICAgICAgaWYgKGcgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZ2FtbWE7XG4gICAgICB9XG4gICAgICBnYW1tYSA9IGc7XG4gICAgICByZXR1cm4gZjtcbiAgICB9O1xuICAgIGYuaHVlID0gZnVuY3Rpb24oaCkge1xuICAgICAgaWYgKGggPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gaHVlO1xuICAgICAgfVxuICAgICAgaHVlID0gaDtcbiAgICAgIGlmICh0eXBlKGh1ZSkgPT09ICdhcnJheScpIHtcbiAgICAgICAgZGggPSBodWVbMV0gLSBodWVbMF07XG4gICAgICAgIGlmIChkaCA9PT0gMCkge1xuICAgICAgICAgIGh1ZSA9IGh1ZVsxXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGggPSAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGY7XG4gICAgfTtcbiAgICBmLmxpZ2h0bmVzcyA9IGZ1bmN0aW9uKGgpIHtcbiAgICAgIGlmIChoID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGxpZ2h0bmVzcztcbiAgICAgIH1cbiAgICAgIGxpZ2h0bmVzcyA9IGg7XG4gICAgICBpZiAodHlwZShsaWdodG5lc3MpID09PSAnYXJyYXknKSB7XG4gICAgICAgIGRsID0gbGlnaHRuZXNzWzFdIC0gbGlnaHRuZXNzWzBdO1xuICAgICAgICBpZiAoZGwgPT09IDApIHtcbiAgICAgICAgICBsaWdodG5lc3MgPSBsaWdodG5lc3NbMV07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRsID0gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmO1xuICAgIH07XG4gICAgZi5zY2FsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNocm9tYS5zY2FsZShmKTtcbiAgICB9O1xuICAgIGYuaHVlKGh1ZSk7XG4gICAgcmV0dXJuIGY7XG4gIH07XG5cbiAgY2hyb21hLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb2RlLCBkaWdpdHMsIGksIG87XG4gICAgZGlnaXRzID0gJzAxMjM0NTY3ODlhYmNkZWYnO1xuICAgIGNvZGUgPSAnIyc7XG4gICAgZm9yIChpID0gbyA9IDA7IG8gPCA2OyBpID0gKytvKSB7XG4gICAgICBjb2RlICs9IGRpZ2l0cy5jaGFyQXQoZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQ29sb3IoY29kZSk7XG4gIH07XG5cbiAgX2lucHV0LnJnYiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrLCByZWYsIHJlc3VsdHMsIHY7XG4gICAgcmVmID0gdW5wYWNrKGFyZ3VtZW50cyk7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoayBpbiByZWYpIHtcbiAgICAgIHYgPSByZWZba107XG4gICAgICByZXN1bHRzLnB1c2godik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIGNocm9tYS5yZ2IgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBzbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KFsncmdiJ10pLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5yZ2IgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fcmdiLnNsaWNlKDAsIDMpO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5yZ2JhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3JnYjtcbiAgfTtcblxuICBfZ3Vlc3NfZm9ybWF0cy5wdXNoKHtcbiAgICBwOiAxNSxcbiAgICB0ZXN0OiBmdW5jdGlvbihuKSB7XG4gICAgICB2YXIgYTtcbiAgICAgIGEgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICAgIGlmICh0eXBlKGEpID09PSAnYXJyYXknICYmIGEubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIHJldHVybiAncmdiJztcbiAgICAgIH1cbiAgICAgIGlmIChhLmxlbmd0aCA9PT0gNCAmJiB0eXBlKGFbM10pID09PSBcIm51bWJlclwiICYmIGFbM10gPj0gMCAmJiBhWzNdIDw9IDEpIHtcbiAgICAgICAgcmV0dXJuICdyZ2InO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgaGV4MnJnYiA9IGZ1bmN0aW9uKGhleCkge1xuICAgIHZhciBhLCBiLCBnLCByLCByZ2IsIHU7XG4gICAgaWYgKGhleC5tYXRjaCgvXiM/KFtBLUZhLWYwLTldezZ9fFtBLUZhLWYwLTldezN9KSQvKSkge1xuICAgICAgaWYgKGhleC5sZW5ndGggPT09IDQgfHwgaGV4Lmxlbmd0aCA9PT0gNykge1xuICAgICAgICBoZXggPSBoZXguc3Vic3RyKDEpO1xuICAgICAgfVxuICAgICAgaWYgKGhleC5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgaGV4ID0gaGV4LnNwbGl0KFwiXCIpO1xuICAgICAgICBoZXggPSBoZXhbMF0gKyBoZXhbMF0gKyBoZXhbMV0gKyBoZXhbMV0gKyBoZXhbMl0gKyBoZXhbMl07XG4gICAgICB9XG4gICAgICB1ID0gcGFyc2VJbnQoaGV4LCAxNik7XG4gICAgICByID0gdSA+PiAxNjtcbiAgICAgIGcgPSB1ID4+IDggJiAweEZGO1xuICAgICAgYiA9IHUgJiAweEZGO1xuICAgICAgcmV0dXJuIFtyLCBnLCBiLCAxXTtcbiAgICB9XG4gICAgaWYgKGhleC5tYXRjaCgvXiM/KFtBLUZhLWYwLTldezh9KSQvKSkge1xuICAgICAgaWYgKGhleC5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgaGV4ID0gaGV4LnN1YnN0cigxKTtcbiAgICAgIH1cbiAgICAgIHUgPSBwYXJzZUludChoZXgsIDE2KTtcbiAgICAgIHIgPSB1ID4+IDI0ICYgMHhGRjtcbiAgICAgIGcgPSB1ID4+IDE2ICYgMHhGRjtcbiAgICAgIGIgPSB1ID4+IDggJiAweEZGO1xuICAgICAgYSA9IHJvdW5kKCh1ICYgMHhGRikgLyAweEZGICogMTAwKSAvIDEwMDtcbiAgICAgIHJldHVybiBbciwgZywgYiwgYV07XG4gICAgfVxuICAgIGlmICgoX2lucHV0LmNzcyAhPSBudWxsKSAmJiAocmdiID0gX2lucHV0LmNzcyhoZXgpKSkge1xuICAgICAgcmV0dXJuIHJnYjtcbiAgICB9XG4gICAgdGhyb3cgXCJ1bmtub3duIGNvbG9yOiBcIiArIGhleDtcbiAgfTtcblxuICByZ2IyaGV4ID0gZnVuY3Rpb24oY2hhbm5lbHMsIG1vZGUpIHtcbiAgICB2YXIgYSwgYiwgZywgaHhhLCByLCBzdHIsIHU7XG4gICAgaWYgKG1vZGUgPT0gbnVsbCkge1xuICAgICAgbW9kZSA9ICdyZ2InO1xuICAgIH1cbiAgICByID0gY2hhbm5lbHNbMF0sIGcgPSBjaGFubmVsc1sxXSwgYiA9IGNoYW5uZWxzWzJdLCBhID0gY2hhbm5lbHNbM107XG4gICAgdSA9IHIgPDwgMTYgfCBnIDw8IDggfCBiO1xuICAgIHN0ciA9IFwiMDAwMDAwXCIgKyB1LnRvU3RyaW5nKDE2KTtcbiAgICBzdHIgPSBzdHIuc3Vic3RyKHN0ci5sZW5ndGggLSA2KTtcbiAgICBoeGEgPSAnMCcgKyByb3VuZChhICogMjU1KS50b1N0cmluZygxNik7XG4gICAgaHhhID0gaHhhLnN1YnN0cihoeGEubGVuZ3RoIC0gMik7XG4gICAgcmV0dXJuIFwiI1wiICsgKGZ1bmN0aW9uKCkge1xuICAgICAgc3dpdGNoIChtb2RlLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAncmdiYSc6XG4gICAgICAgICAgcmV0dXJuIHN0ciArIGh4YTtcbiAgICAgICAgY2FzZSAnYXJnYic6XG4gICAgICAgICAgcmV0dXJuIGh4YSArIHN0cjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgfVxuICAgIH0pKCk7XG4gIH07XG5cbiAgX2lucHV0LmhleCA9IGZ1bmN0aW9uKGgpIHtcbiAgICByZXR1cm4gaGV4MnJnYihoKTtcbiAgfTtcblxuICBjaHJvbWEuaGV4ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIE9iamVjdChyZXN1bHQpID09PSByZXN1bHQgPyByZXN1bHQgOiBjaGlsZDtcbiAgICB9KShDb2xvciwgc2xpY2UuY2FsbChhcmd1bWVudHMpLmNvbmNhdChbJ2hleCddKSwgZnVuY3Rpb24oKXt9KTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuaGV4ID0gZnVuY3Rpb24obW9kZSkge1xuICAgIGlmIChtb2RlID09IG51bGwpIHtcbiAgICAgIG1vZGUgPSAncmdiJztcbiAgICB9XG4gICAgcmV0dXJuIHJnYjJoZXgodGhpcy5fcmdiLCBtb2RlKTtcbiAgfTtcblxuICBfZ3Vlc3NfZm9ybWF0cy5wdXNoKHtcbiAgICBwOiAxMCxcbiAgICB0ZXN0OiBmdW5jdGlvbihuKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiB0eXBlKG4pID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiAnaGV4JztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIGhzbDJyZ2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgYiwgYywgZywgaCwgaSwgbCwgbywgciwgcmVmLCBzLCB0MSwgdDIsIHQzO1xuICAgIGFyZ3MgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICBoID0gYXJnc1swXSwgcyA9IGFyZ3NbMV0sIGwgPSBhcmdzWzJdO1xuICAgIGlmIChzID09PSAwKSB7XG4gICAgICByID0gZyA9IGIgPSBsICogMjU1O1xuICAgIH0gZWxzZSB7XG4gICAgICB0MyA9IFswLCAwLCAwXTtcbiAgICAgIGMgPSBbMCwgMCwgMF07XG4gICAgICB0MiA9IGwgPCAwLjUgPyBsICogKDEgKyBzKSA6IGwgKyBzIC0gbCAqIHM7XG4gICAgICB0MSA9IDIgKiBsIC0gdDI7XG4gICAgICBoIC89IDM2MDtcbiAgICAgIHQzWzBdID0gaCArIDEgLyAzO1xuICAgICAgdDNbMV0gPSBoO1xuICAgICAgdDNbMl0gPSBoIC0gMSAvIDM7XG4gICAgICBmb3IgKGkgPSBvID0gMDsgbyA8PSAyOyBpID0gKytvKSB7XG4gICAgICAgIGlmICh0M1tpXSA8IDApIHtcbiAgICAgICAgICB0M1tpXSArPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0M1tpXSA+IDEpIHtcbiAgICAgICAgICB0M1tpXSAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICg2ICogdDNbaV0gPCAxKSB7XG4gICAgICAgICAgY1tpXSA9IHQxICsgKHQyIC0gdDEpICogNiAqIHQzW2ldO1xuICAgICAgICB9IGVsc2UgaWYgKDIgKiB0M1tpXSA8IDEpIHtcbiAgICAgICAgICBjW2ldID0gdDI7XG4gICAgICAgIH0gZWxzZSBpZiAoMyAqIHQzW2ldIDwgMikge1xuICAgICAgICAgIGNbaV0gPSB0MSArICh0MiAtIHQxKSAqICgoMiAvIDMpIC0gdDNbaV0pICogNjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjW2ldID0gdDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlZiA9IFtyb3VuZChjWzBdICogMjU1KSwgcm91bmQoY1sxXSAqIDI1NSksIHJvdW5kKGNbMl0gKiAyNTUpXSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICB9XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMykge1xuICAgICAgcmV0dXJuIFtyLCBnLCBiLCBhcmdzWzNdXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgICB9XG4gIH07XG5cbiAgcmdiMmhzbCA9IGZ1bmN0aW9uKHIsIGcsIGIpIHtcbiAgICB2YXIgaCwgbCwgbWluLCByZWYsIHM7XG4gICAgaWYgKHIgIT09IHZvaWQgMCAmJiByLmxlbmd0aCA+PSAzKSB7XG4gICAgICByZWYgPSByLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIH1cbiAgICByIC89IDI1NTtcbiAgICBnIC89IDI1NTtcbiAgICBiIC89IDI1NTtcbiAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKTtcbiAgICBsID0gKG1heCArIG1pbikgLyAyO1xuICAgIGlmIChtYXggPT09IG1pbikge1xuICAgICAgcyA9IDA7XG4gICAgICBoID0gTnVtYmVyLk5hTjtcbiAgICB9IGVsc2Uge1xuICAgICAgcyA9IGwgPCAwLjUgPyAobWF4IC0gbWluKSAvIChtYXggKyBtaW4pIDogKG1heCAtIG1pbikgLyAoMiAtIG1heCAtIG1pbik7XG4gICAgfVxuICAgIGlmIChyID09PSBtYXgpIHtcbiAgICAgIGggPSAoZyAtIGIpIC8gKG1heCAtIG1pbik7XG4gICAgfSBlbHNlIGlmIChnID09PSBtYXgpIHtcbiAgICAgIGggPSAyICsgKGIgLSByKSAvIChtYXggLSBtaW4pO1xuICAgIH0gZWxzZSBpZiAoYiA9PT0gbWF4KSB7XG4gICAgICBoID0gNCArIChyIC0gZykgLyAobWF4IC0gbWluKTtcbiAgICB9XG4gICAgaCAqPSA2MDtcbiAgICBpZiAoaCA8IDApIHtcbiAgICAgIGggKz0gMzYwO1xuICAgIH1cbiAgICByZXR1cm4gW2gsIHMsIGxdO1xuICB9O1xuXG4gIGNocm9tYS5oc2wgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBzbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KFsnaHNsJ10pLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIF9pbnB1dC5oc2wgPSBoc2wycmdiO1xuXG4gIENvbG9yLnByb3RvdHlwZS5oc2wgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcmdiMmhzbCh0aGlzLl9yZ2IpO1xuICB9O1xuXG4gIGhzdjJyZ2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgYiwgZiwgZywgaCwgaSwgcCwgcSwgciwgcmVmLCByZWYxLCByZWYyLCByZWYzLCByZWY0LCByZWY1LCBzLCB0LCB2O1xuICAgIGFyZ3MgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICBoID0gYXJnc1swXSwgcyA9IGFyZ3NbMV0sIHYgPSBhcmdzWzJdO1xuICAgIHYgKj0gMjU1O1xuICAgIGlmIChzID09PSAwKSB7XG4gICAgICByID0gZyA9IGIgPSB2O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaCA9PT0gMzYwKSB7XG4gICAgICAgIGggPSAwO1xuICAgICAgfVxuICAgICAgaWYgKGggPiAzNjApIHtcbiAgICAgICAgaCAtPSAzNjA7XG4gICAgICB9XG4gICAgICBpZiAoaCA8IDApIHtcbiAgICAgICAgaCArPSAzNjA7XG4gICAgICB9XG4gICAgICBoIC89IDYwO1xuICAgICAgaSA9IGZsb29yKGgpO1xuICAgICAgZiA9IGggLSBpO1xuICAgICAgcCA9IHYgKiAoMSAtIHMpO1xuICAgICAgcSA9IHYgKiAoMSAtIHMgKiBmKTtcbiAgICAgIHQgPSB2ICogKDEgLSBzICogKDEgLSBmKSk7XG4gICAgICBzd2l0Y2ggKGkpIHtcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIHJlZiA9IFt2LCB0LCBwXSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHJlZjEgPSBbcSwgdiwgcF0sIHIgPSByZWYxWzBdLCBnID0gcmVmMVsxXSwgYiA9IHJlZjFbMl07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICByZWYyID0gW3AsIHYsIHRdLCByID0gcmVmMlswXSwgZyA9IHJlZjJbMV0sIGIgPSByZWYyWzJdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgcmVmMyA9IFtwLCBxLCB2XSwgciA9IHJlZjNbMF0sIGcgPSByZWYzWzFdLCBiID0gcmVmM1syXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHJlZjQgPSBbdCwgcCwgdl0sIHIgPSByZWY0WzBdLCBnID0gcmVmNFsxXSwgYiA9IHJlZjRbMl07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICByZWY1ID0gW3YsIHAsIHFdLCByID0gcmVmNVswXSwgZyA9IHJlZjVbMV0sIGIgPSByZWY1WzJdO1xuICAgICAgfVxuICAgIH1cbiAgICByID0gcm91bmQocik7XG4gICAgZyA9IHJvdW5kKGcpO1xuICAgIGIgPSByb3VuZChiKTtcbiAgICByZXR1cm4gW3IsIGcsIGIsIGFyZ3MubGVuZ3RoID4gMyA/IGFyZ3NbM10gOiAxXTtcbiAgfTtcblxuICByZ2IyaHN2ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGIsIGRlbHRhLCBnLCBoLCBtaW4sIHIsIHJlZiwgcywgdjtcbiAgICByZWYgPSB1bnBhY2soYXJndW1lbnRzKSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKTtcbiAgICBkZWx0YSA9IG1heCAtIG1pbjtcbiAgICB2ID0gbWF4IC8gMjU1LjA7XG4gICAgaWYgKG1heCA9PT0gMCkge1xuICAgICAgaCA9IE51bWJlci5OYU47XG4gICAgICBzID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgcyA9IGRlbHRhIC8gbWF4O1xuICAgICAgaWYgKHIgPT09IG1heCkge1xuICAgICAgICBoID0gKGcgLSBiKSAvIGRlbHRhO1xuICAgICAgfVxuICAgICAgaWYgKGcgPT09IG1heCkge1xuICAgICAgICBoID0gMiArIChiIC0gcikgLyBkZWx0YTtcbiAgICAgIH1cbiAgICAgIGlmIChiID09PSBtYXgpIHtcbiAgICAgICAgaCA9IDQgKyAociAtIGcpIC8gZGVsdGE7XG4gICAgICB9XG4gICAgICBoICo9IDYwO1xuICAgICAgaWYgKGggPCAwKSB7XG4gICAgICAgIGggKz0gMzYwO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW2gsIHMsIHZdO1xuICB9O1xuXG4gIGNocm9tYS5oc3YgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBzbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KFsnaHN2J10pLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIF9pbnB1dC5oc3YgPSBoc3YycmdiO1xuXG4gIENvbG9yLnByb3RvdHlwZS5oc3YgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcmdiMmhzdih0aGlzLl9yZ2IpO1xuICB9O1xuXG4gIG51bTJyZ2IgPSBmdW5jdGlvbihudW0pIHtcbiAgICB2YXIgYiwgZywgcjtcbiAgICBpZiAodHlwZShudW0pID09PSBcIm51bWJlclwiICYmIG51bSA+PSAwICYmIG51bSA8PSAweEZGRkZGRikge1xuICAgICAgciA9IG51bSA+PiAxNjtcbiAgICAgIGcgPSAobnVtID4+IDgpICYgMHhGRjtcbiAgICAgIGIgPSBudW0gJiAweEZGO1xuICAgICAgcmV0dXJuIFtyLCBnLCBiLCAxXTtcbiAgICB9XG4gICAgY29uc29sZS53YXJuKFwidW5rbm93biBudW0gY29sb3I6IFwiICsgbnVtKTtcbiAgICByZXR1cm4gWzAsIDAsIDAsIDFdO1xuICB9O1xuXG4gIHJnYjJudW0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiwgZywgciwgcmVmO1xuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIHJldHVybiAociA8PCAxNikgKyAoZyA8PCA4KSArIGI7XG4gIH07XG5cbiAgY2hyb21hLm51bSA9IGZ1bmN0aW9uKG51bSkge1xuICAgIHJldHVybiBuZXcgQ29sb3IobnVtLCAnbnVtJyk7XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLm51bSA9IGZ1bmN0aW9uKG1vZGUpIHtcbiAgICBpZiAobW9kZSA9PSBudWxsKSB7XG4gICAgICBtb2RlID0gJ3JnYic7XG4gICAgfVxuICAgIHJldHVybiByZ2IybnVtKHRoaXMuX3JnYiwgbW9kZSk7XG4gIH07XG5cbiAgX2lucHV0Lm51bSA9IG51bTJyZ2I7XG5cbiAgX2d1ZXNzX2Zvcm1hdHMucHVzaCh7XG4gICAgcDogMTAsXG4gICAgdGVzdDogZnVuY3Rpb24obikge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgdHlwZShuKSA9PT0gXCJudW1iZXJcIiAmJiBuID49IDAgJiYgbiA8PSAweEZGRkZGRikge1xuICAgICAgICByZXR1cm4gJ251bSc7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBjc3MycmdiID0gZnVuY3Rpb24oY3NzKSB7XG4gICAgdmFyIGFhLCBhYiwgaHNsLCBpLCBtLCBvLCByZ2IsIHc7XG4gICAgY3NzID0gY3NzLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKChjaHJvbWEuY29sb3JzICE9IG51bGwpICYmIGNocm9tYS5jb2xvcnNbY3NzXSkge1xuICAgICAgcmV0dXJuIGhleDJyZ2IoY2hyb21hLmNvbG9yc1tjc3NdKTtcbiAgICB9XG4gICAgaWYgKG0gPSBjc3MubWF0Y2goL3JnYlxcKFxccyooXFwtP1xcZCspLFxccyooXFwtP1xcZCspXFxzKixcXHMqKFxcLT9cXGQrKVxccypcXCkvKSkge1xuICAgICAgcmdiID0gbS5zbGljZSgxLCA0KTtcbiAgICAgIGZvciAoaSA9IG8gPSAwOyBvIDw9IDI7IGkgPSArK28pIHtcbiAgICAgICAgcmdiW2ldID0gK3JnYltpXTtcbiAgICAgIH1cbiAgICAgIHJnYlszXSA9IDE7XG4gICAgfSBlbHNlIGlmIChtID0gY3NzLm1hdGNoKC9yZ2JhXFwoXFxzKihcXC0/XFxkKyksXFxzKihcXC0/XFxkKylcXHMqLFxccyooXFwtP1xcZCspXFxzKixcXHMqKFswMV18WzAxXT9cXC5cXGQrKVxcKS8pKSB7XG4gICAgICByZ2IgPSBtLnNsaWNlKDEsIDUpO1xuICAgICAgZm9yIChpID0gdyA9IDA7IHcgPD0gMzsgaSA9ICsrdykge1xuICAgICAgICByZ2JbaV0gPSArcmdiW2ldO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAobSA9IGNzcy5tYXRjaCgvcmdiXFwoXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklLFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pJVxccyosXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklXFxzKlxcKS8pKSB7XG4gICAgICByZ2IgPSBtLnNsaWNlKDEsIDQpO1xuICAgICAgZm9yIChpID0gYWEgPSAwOyBhYSA8PSAyOyBpID0gKythYSkge1xuICAgICAgICByZ2JbaV0gPSByb3VuZChyZ2JbaV0gKiAyLjU1KTtcbiAgICAgIH1cbiAgICAgIHJnYlszXSA9IDE7XG4gICAgfSBlbHNlIGlmIChtID0gY3NzLm1hdGNoKC9yZ2JhXFwoXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklLFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pJVxccyosXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklXFxzKixcXHMqKFswMV18WzAxXT9cXC5cXGQrKVxcKS8pKSB7XG4gICAgICByZ2IgPSBtLnNsaWNlKDEsIDUpO1xuICAgICAgZm9yIChpID0gYWIgPSAwOyBhYiA8PSAyOyBpID0gKythYikge1xuICAgICAgICByZ2JbaV0gPSByb3VuZChyZ2JbaV0gKiAyLjU1KTtcbiAgICAgIH1cbiAgICAgIHJnYlszXSA9ICtyZ2JbM107XG4gICAgfSBlbHNlIGlmIChtID0gY3NzLm1hdGNoKC9oc2xcXChcXHMqKFxcLT9cXGQrKD86XFwuXFxkKyk/KSxcXHMqKFxcLT9cXGQrKD86XFwuXFxkKyk/KSVcXHMqLFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pJVxccypcXCkvKSkge1xuICAgICAgaHNsID0gbS5zbGljZSgxLCA0KTtcbiAgICAgIGhzbFsxXSAqPSAwLjAxO1xuICAgICAgaHNsWzJdICo9IDAuMDE7XG4gICAgICByZ2IgPSBoc2wycmdiKGhzbCk7XG4gICAgICByZ2JbM10gPSAxO1xuICAgIH0gZWxzZSBpZiAobSA9IGNzcy5tYXRjaCgvaHNsYVxcKFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pLFxccyooXFwtP1xcZCsoPzpcXC5cXGQrKT8pJVxccyosXFxzKihcXC0/XFxkKyg/OlxcLlxcZCspPyklXFxzKixcXHMqKFswMV18WzAxXT9cXC5cXGQrKVxcKS8pKSB7XG4gICAgICBoc2wgPSBtLnNsaWNlKDEsIDQpO1xuICAgICAgaHNsWzFdICo9IDAuMDE7XG4gICAgICBoc2xbMl0gKj0gMC4wMTtcbiAgICAgIHJnYiA9IGhzbDJyZ2IoaHNsKTtcbiAgICAgIHJnYlszXSA9ICttWzRdO1xuICAgIH1cbiAgICByZXR1cm4gcmdiO1xuICB9O1xuXG4gIHJnYjJjc3MgPSBmdW5jdGlvbihyZ2JhKSB7XG4gICAgdmFyIG1vZGU7XG4gICAgbW9kZSA9IHJnYmFbM10gPCAxID8gJ3JnYmEnIDogJ3JnYic7XG4gICAgaWYgKG1vZGUgPT09ICdyZ2InKSB7XG4gICAgICByZXR1cm4gbW9kZSArICcoJyArIHJnYmEuc2xpY2UoMCwgMykubWFwKHJvdW5kKS5qb2luKCcsJykgKyAnKSc7XG4gICAgfSBlbHNlIGlmIChtb2RlID09PSAncmdiYScpIHtcbiAgICAgIHJldHVybiBtb2RlICsgJygnICsgcmdiYS5zbGljZSgwLCAzKS5tYXAocm91bmQpLmpvaW4oJywnKSArICcsJyArIHJnYmFbM10gKyAnKSc7XG4gICAgfSBlbHNlIHtcblxuICAgIH1cbiAgfTtcblxuICBybmQgPSBmdW5jdGlvbihhKSB7XG4gICAgcmV0dXJuIHJvdW5kKGEgKiAxMDApIC8gMTAwO1xuICB9O1xuXG4gIGhzbDJjc3MgPSBmdW5jdGlvbihoc2wsIGFscGhhKSB7XG4gICAgdmFyIG1vZGU7XG4gICAgbW9kZSA9IGFscGhhIDwgMSA/ICdoc2xhJyA6ICdoc2wnO1xuICAgIGhzbFswXSA9IHJuZChoc2xbMF0gfHwgMCk7XG4gICAgaHNsWzFdID0gcm5kKGhzbFsxXSAqIDEwMCkgKyAnJSc7XG4gICAgaHNsWzJdID0gcm5kKGhzbFsyXSAqIDEwMCkgKyAnJSc7XG4gICAgaWYgKG1vZGUgPT09ICdoc2xhJykge1xuICAgICAgaHNsWzNdID0gYWxwaGE7XG4gICAgfVxuICAgIHJldHVybiBtb2RlICsgJygnICsgaHNsLmpvaW4oJywnKSArICcpJztcbiAgfTtcblxuICBfaW5wdXQuY3NzID0gZnVuY3Rpb24oaCkge1xuICAgIHJldHVybiBjc3MycmdiKGgpO1xuICB9O1xuXG4gIGNocm9tYS5jc3MgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKGZ1bmN0aW9uKGZ1bmMsIGFyZ3MsIGN0b3IpIHtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gZnVuYy5wcm90b3R5cGU7XG4gICAgICB2YXIgY2hpbGQgPSBuZXcgY3RvciwgcmVzdWx0ID0gZnVuYy5hcHBseShjaGlsZCwgYXJncyk7XG4gICAgICByZXR1cm4gT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCA/IHJlc3VsdCA6IGNoaWxkO1xuICAgIH0pKENvbG9yLCBzbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KFsnY3NzJ10pLCBmdW5jdGlvbigpe30pO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5jc3MgPSBmdW5jdGlvbihtb2RlKSB7XG4gICAgaWYgKG1vZGUgPT0gbnVsbCkge1xuICAgICAgbW9kZSA9ICdyZ2InO1xuICAgIH1cbiAgICBpZiAobW9kZS5zbGljZSgwLCAzKSA9PT0gJ3JnYicpIHtcbiAgICAgIHJldHVybiByZ2IyY3NzKHRoaXMuX3JnYik7XG4gICAgfSBlbHNlIGlmIChtb2RlLnNsaWNlKDAsIDMpID09PSAnaHNsJykge1xuICAgICAgcmV0dXJuIGhzbDJjc3ModGhpcy5oc2woKSwgdGhpcy5hbHBoYSgpKTtcbiAgICB9XG4gIH07XG5cbiAgX2lucHV0Lm5hbWVkID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiBoZXgycmdiKHczY3gxMVtuYW1lXSk7XG4gIH07XG5cbiAgX2d1ZXNzX2Zvcm1hdHMucHVzaCh7XG4gICAgcDogMjAsXG4gICAgdGVzdDogZnVuY3Rpb24obikge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgKHczY3gxMVtuXSAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gJ25hbWVkJztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIENvbG9yLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24obikge1xuICAgIHZhciBoLCBrO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICBpZiAodzNjeDExW25dKSB7XG4gICAgICAgIHRoaXMuX3JnYiA9IGhleDJyZ2IodzNjeDExW25dKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3JnYlszXSA9IDE7XG4gICAgICB0aGlzO1xuICAgIH1cbiAgICBoID0gdGhpcy5oZXgoKTtcbiAgICBmb3IgKGsgaW4gdzNjeDExKSB7XG4gICAgICBpZiAoaCA9PT0gdzNjeDExW2tdKSB7XG4gICAgICAgIHJldHVybiBrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaDtcbiAgfTtcblxuICBsY2gybGFiID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvKlxuICAgIENvbnZlcnQgZnJvbSBhIHF1YWxpdGF0aXZlIHBhcmFtZXRlciBoIGFuZCBhIHF1YW50aXRhdGl2ZSBwYXJhbWV0ZXIgbCB0byBhIDI0LWJpdCBwaXhlbC5cbiAgICBUaGVzZSBmb3JtdWxhcyB3ZXJlIGludmVudGVkIGJ5IERhdmlkIERhbHJ5bXBsZSB0byBvYnRhaW4gbWF4aW11bSBjb250cmFzdCB3aXRob3V0IGdvaW5nXG4gICAgb3V0IG9mIGdhbXV0IGlmIHRoZSBwYXJhbWV0ZXJzIGFyZSBpbiB0aGUgcmFuZ2UgMC0xLlxuICAgIFxuICAgIEEgc2F0dXJhdGlvbiBtdWx0aXBsaWVyIHdhcyBhZGRlZCBieSBHcmVnb3IgQWlzY2hcbiAgICAgKi9cbiAgICB2YXIgYywgaCwgbCwgcmVmO1xuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCBsID0gcmVmWzBdLCBjID0gcmVmWzFdLCBoID0gcmVmWzJdO1xuICAgIGggPSBoICogREVHMlJBRDtcbiAgICByZXR1cm4gW2wsIGNvcyhoKSAqIGMsIHNpbihoKSAqIGNdO1xuICB9O1xuXG4gIGxjaDJyZ2IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgTCwgYSwgYXJncywgYiwgYywgZywgaCwgbCwgciwgcmVmLCByZWYxO1xuICAgIGFyZ3MgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICBsID0gYXJnc1swXSwgYyA9IGFyZ3NbMV0sIGggPSBhcmdzWzJdO1xuICAgIHJlZiA9IGxjaDJsYWIobCwgYywgaCksIEwgPSByZWZbMF0sIGEgPSByZWZbMV0sIGIgPSByZWZbMl07XG4gICAgcmVmMSA9IGxhYjJyZ2IoTCwgYSwgYiksIHIgPSByZWYxWzBdLCBnID0gcmVmMVsxXSwgYiA9IHJlZjFbMl07XG4gICAgcmV0dXJuIFtsaW1pdChyLCAwLCAyNTUpLCBsaW1pdChnLCAwLCAyNTUpLCBsaW1pdChiLCAwLCAyNTUpLCBhcmdzLmxlbmd0aCA+IDMgPyBhcmdzWzNdIDogMV07XG4gIH07XG5cbiAgbGFiMmxjaCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhLCBiLCBjLCBoLCBsLCByZWY7XG4gICAgcmVmID0gdW5wYWNrKGFyZ3VtZW50cyksIGwgPSByZWZbMF0sIGEgPSByZWZbMV0sIGIgPSByZWZbMl07XG4gICAgYyA9IHNxcnQoYSAqIGEgKyBiICogYik7XG4gICAgaCA9IChhdGFuMihiLCBhKSAqIFJBRDJERUcgKyAzNjApICUgMzYwO1xuICAgIGlmIChyb3VuZChjICogMTAwMDApID09PSAwKSB7XG4gICAgICBoID0gTnVtYmVyLk5hTjtcbiAgICB9XG4gICAgcmV0dXJuIFtsLCBjLCBoXTtcbiAgfTtcblxuICByZ2IybGNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGEsIGIsIGcsIGwsIHIsIHJlZiwgcmVmMTtcbiAgICByZWYgPSB1bnBhY2soYXJndW1lbnRzKSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICByZWYxID0gcmdiMmxhYihyLCBnLCBiKSwgbCA9IHJlZjFbMF0sIGEgPSByZWYxWzFdLCBiID0gcmVmMVsyXTtcbiAgICByZXR1cm4gbGFiMmxjaChsLCBhLCBiKTtcbiAgfTtcblxuICBjaHJvbWEubGNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3M7XG4gICAgYXJncyA9IHVucGFjayhhcmd1bWVudHMpO1xuICAgIHJldHVybiBuZXcgQ29sb3IoYXJncywgJ2xjaCcpO1xuICB9O1xuXG4gIGNocm9tYS5oY2wgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gdW5wYWNrKGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIG5ldyBDb2xvcihhcmdzLCAnaGNsJyk7XG4gIH07XG5cbiAgX2lucHV0LmxjaCA9IGxjaDJyZ2I7XG5cbiAgX2lucHV0LmhjbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjLCBoLCBsLCByZWY7XG4gICAgcmVmID0gdW5wYWNrKGFyZ3VtZW50cyksIGggPSByZWZbMF0sIGMgPSByZWZbMV0sIGwgPSByZWZbMl07XG4gICAgcmV0dXJuIGxjaDJyZ2IoW2wsIGMsIGhdKTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUubGNoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJnYjJsY2godGhpcy5fcmdiKTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuaGNsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJnYjJsY2godGhpcy5fcmdiKS5yZXZlcnNlKCk7XG4gIH07XG5cbiAgcmdiMmNteWsgPSBmdW5jdGlvbihtb2RlKSB7XG4gICAgdmFyIGIsIGMsIGYsIGcsIGssIG0sIHIsIHJlZiwgeTtcbiAgICBpZiAobW9kZSA9PSBudWxsKSB7XG4gICAgICBtb2RlID0gJ3JnYic7XG4gICAgfVxuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIHIgPSByIC8gMjU1O1xuICAgIGcgPSBnIC8gMjU1O1xuICAgIGIgPSBiIC8gMjU1O1xuICAgIGsgPSAxIC0gTWF0aC5tYXgociwgTWF0aC5tYXgoZywgYikpO1xuICAgIGYgPSBrIDwgMSA/IDEgLyAoMSAtIGspIDogMDtcbiAgICBjID0gKDEgLSByIC0gaykgKiBmO1xuICAgIG0gPSAoMSAtIGcgLSBrKSAqIGY7XG4gICAgeSA9ICgxIC0gYiAtIGspICogZjtcbiAgICByZXR1cm4gW2MsIG0sIHksIGtdO1xuICB9O1xuXG4gIGNteWsycmdiID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFscGhhLCBhcmdzLCBiLCBjLCBnLCBrLCBtLCByLCB5O1xuICAgIGFyZ3MgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICBjID0gYXJnc1swXSwgbSA9IGFyZ3NbMV0sIHkgPSBhcmdzWzJdLCBrID0gYXJnc1szXTtcbiAgICBhbHBoYSA9IGFyZ3MubGVuZ3RoID4gNCA/IGFyZ3NbNF0gOiAxO1xuICAgIGlmIChrID09PSAxKSB7XG4gICAgICByZXR1cm4gWzAsIDAsIDAsIGFscGhhXTtcbiAgICB9XG4gICAgciA9IGMgPj0gMSA/IDAgOiByb3VuZCgyNTUgKiAoMSAtIGMpICogKDEgLSBrKSk7XG4gICAgZyA9IG0gPj0gMSA/IDAgOiByb3VuZCgyNTUgKiAoMSAtIG0pICogKDEgLSBrKSk7XG4gICAgYiA9IHkgPj0gMSA/IDAgOiByb3VuZCgyNTUgKiAoMSAtIHkpICogKDEgLSBrKSk7XG4gICAgcmV0dXJuIFtyLCBnLCBiLCBhbHBoYV07XG4gIH07XG5cbiAgX2lucHV0LmNteWsgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY215azJyZ2IodW5wYWNrKGFyZ3VtZW50cykpO1xuICB9O1xuXG4gIGNocm9tYS5jbXlrID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIE9iamVjdChyZXN1bHQpID09PSByZXN1bHQgPyByZXN1bHQgOiBjaGlsZDtcbiAgICB9KShDb2xvciwgc2xpY2UuY2FsbChhcmd1bWVudHMpLmNvbmNhdChbJ2NteWsnXSksIGZ1bmN0aW9uKCl7fSk7XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLmNteWsgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcmdiMmNteWsodGhpcy5fcmdiKTtcbiAgfTtcblxuICBfaW5wdXQuZ2wgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaywgbywgcmdiLCB2O1xuICAgIHJnYiA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciByZWYsIHJlc3VsdHM7XG4gICAgICByZWYgPSB1bnBhY2soYXJndW1lbnRzKTtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoayBpbiByZWYpIHtcbiAgICAgICAgdiA9IHJlZltrXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHYpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSkuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBmb3IgKGkgPSBvID0gMDsgbyA8PSAyOyBpID0gKytvKSB7XG4gICAgICByZ2JbaV0gKj0gMjU1O1xuICAgIH1cbiAgICByZXR1cm4gcmdiO1xuICB9O1xuXG4gIGNocm9tYS5nbCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKTtcbiAgICAgIHJldHVybiBPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0ID8gcmVzdWx0IDogY2hpbGQ7XG4gICAgfSkoQ29sb3IsIHNsaWNlLmNhbGwoYXJndW1lbnRzKS5jb25jYXQoWydnbCddKSwgZnVuY3Rpb24oKXt9KTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuZ2wgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmdiO1xuICAgIHJnYiA9IHRoaXMuX3JnYjtcbiAgICByZXR1cm4gW3JnYlswXSAvIDI1NSwgcmdiWzFdIC8gMjU1LCByZ2JbMl0gLyAyNTUsIHJnYlszXV07XG4gIH07XG5cbiAgcmdiMmx1bWluYW5jZSA9IGZ1bmN0aW9uKHIsIGcsIGIpIHtcbiAgICB2YXIgcmVmO1xuICAgIHJlZiA9IHVucGFjayhhcmd1bWVudHMpLCByID0gcmVmWzBdLCBnID0gcmVmWzFdLCBiID0gcmVmWzJdO1xuICAgIHIgPSBsdW1pbmFuY2VfeChyKTtcbiAgICBnID0gbHVtaW5hbmNlX3goZyk7XG4gICAgYiA9IGx1bWluYW5jZV94KGIpO1xuICAgIHJldHVybiAwLjIxMjYgKiByICsgMC43MTUyICogZyArIDAuMDcyMiAqIGI7XG4gIH07XG5cbiAgbHVtaW5hbmNlX3ggPSBmdW5jdGlvbih4KSB7XG4gICAgeCAvPSAyNTU7XG4gICAgaWYgKHggPD0gMC4wMzkyOCkge1xuICAgICAgcmV0dXJuIHggLyAxMi45MjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHBvdygoeCArIDAuMDU1KSAvIDEuMDU1LCAyLjQpO1xuICAgIH1cbiAgfTtcblxuICBfaW50ZXJwb2xhdG9ycyA9IFtdO1xuXG4gIGludGVycG9sYXRlID0gZnVuY3Rpb24oY29sMSwgY29sMiwgZiwgbSkge1xuICAgIHZhciBpbnRlcnBvbCwgbGVuLCBvLCByZXM7XG4gICAgaWYgKGYgPT0gbnVsbCkge1xuICAgICAgZiA9IDAuNTtcbiAgICB9XG4gICAgaWYgKG0gPT0gbnVsbCkge1xuICAgICAgbSA9ICdyZ2InO1xuICAgIH1cblxuICAgIC8qXG4gICAgaW50ZXJwb2xhdGVzIGJldHdlZW4gY29sb3JzXG4gICAgZiA9IDAgLS0+IG1lXG4gICAgZiA9IDEgLS0+IGNvbFxuICAgICAqL1xuICAgIGlmICh0eXBlKGNvbDEpICE9PSAnb2JqZWN0Jykge1xuICAgICAgY29sMSA9IGNocm9tYShjb2wxKTtcbiAgICB9XG4gICAgaWYgKHR5cGUoY29sMikgIT09ICdvYmplY3QnKSB7XG4gICAgICBjb2wyID0gY2hyb21hKGNvbDIpO1xuICAgIH1cbiAgICBmb3IgKG8gPSAwLCBsZW4gPSBfaW50ZXJwb2xhdG9ycy5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgaW50ZXJwb2wgPSBfaW50ZXJwb2xhdG9yc1tvXTtcbiAgICAgIGlmIChtID09PSBpbnRlcnBvbFswXSkge1xuICAgICAgICByZXMgPSBpbnRlcnBvbFsxXShjb2wxLCBjb2wyLCBmLCBtKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZXMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgXCJjb2xvciBtb2RlIFwiICsgbSArIFwiIGlzIG5vdCBzdXBwb3J0ZWRcIjtcbiAgICB9XG4gICAgcmVzLmFscGhhKGNvbDEuYWxwaGEoKSArIGYgKiAoY29sMi5hbHBoYSgpIC0gY29sMS5hbHBoYSgpKSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfTtcblxuICBjaHJvbWEuaW50ZXJwb2xhdGUgPSBpbnRlcnBvbGF0ZTtcblxuICBDb2xvci5wcm90b3R5cGUuaW50ZXJwb2xhdGUgPSBmdW5jdGlvbihjb2wyLCBmLCBtKSB7XG4gICAgcmV0dXJuIGludGVycG9sYXRlKHRoaXMsIGNvbDIsIGYsIG0pO1xuICB9O1xuXG4gIGNocm9tYS5taXggPSBpbnRlcnBvbGF0ZTtcblxuICBDb2xvci5wcm90b3R5cGUubWl4ID0gQ29sb3IucHJvdG90eXBlLmludGVycG9sYXRlO1xuXG4gIGludGVycG9sYXRlX3JnYiA9IGZ1bmN0aW9uKGNvbDEsIGNvbDIsIGYsIG0pIHtcbiAgICB2YXIgeHl6MCwgeHl6MTtcbiAgICB4eXowID0gY29sMS5fcmdiO1xuICAgIHh5ejEgPSBjb2wyLl9yZ2I7XG4gICAgcmV0dXJuIG5ldyBDb2xvcih4eXowWzBdICsgZiAqICh4eXoxWzBdIC0geHl6MFswXSksIHh5ejBbMV0gKyBmICogKHh5ejFbMV0gLSB4eXowWzFdKSwgeHl6MFsyXSArIGYgKiAoeHl6MVsyXSAtIHh5ejBbMl0pLCBtKTtcbiAgfTtcblxuICBfaW50ZXJwb2xhdG9ycy5wdXNoKFsncmdiJywgaW50ZXJwb2xhdGVfcmdiXSk7XG5cbiAgQ29sb3IucHJvdG90eXBlLmx1bWluYW5jZSA9IGZ1bmN0aW9uKGx1bSwgbW9kZSkge1xuICAgIHZhciBjdXJfbHVtLCBlcHMsIG1heF9pdGVyLCB0ZXN0O1xuICAgIGlmIChtb2RlID09IG51bGwpIHtcbiAgICAgIG1vZGUgPSAncmdiJztcbiAgICB9XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gcmdiMmx1bWluYW5jZSh0aGlzLl9yZ2IpO1xuICAgIH1cbiAgICBpZiAobHVtID09PSAwKSB7XG4gICAgICB0aGlzLl9yZ2IgPSBbMCwgMCwgMCwgdGhpcy5fcmdiWzNdXTtcbiAgICB9IGVsc2UgaWYgKGx1bSA9PT0gMSkge1xuICAgICAgdGhpcy5fcmdiID0gWzI1NSwgMjU1LCAyNTUsIHRoaXMuX3JnYlszXV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGVwcyA9IDFlLTc7XG4gICAgICBtYXhfaXRlciA9IDIwO1xuICAgICAgdGVzdCA9IGZ1bmN0aW9uKGwsIGgpIHtcbiAgICAgICAgdmFyIGxtLCBtO1xuICAgICAgICBtID0gbC5pbnRlcnBvbGF0ZShoLCAwLjUsIG1vZGUpO1xuICAgICAgICBsbSA9IG0ubHVtaW5hbmNlKCk7XG4gICAgICAgIGlmIChNYXRoLmFicyhsdW0gLSBsbSkgPCBlcHMgfHwgIW1heF9pdGVyLS0pIHtcbiAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG0gPiBsdW0pIHtcbiAgICAgICAgICByZXR1cm4gdGVzdChsLCBtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGVzdChtLCBoKTtcbiAgICAgIH07XG4gICAgICBjdXJfbHVtID0gcmdiMmx1bWluYW5jZSh0aGlzLl9yZ2IpO1xuICAgICAgdGhpcy5fcmdiID0gKGN1cl9sdW0gPiBsdW0gPyB0ZXN0KGNocm9tYSgnYmxhY2snKSwgdGhpcykgOiB0ZXN0KHRoaXMsIGNocm9tYSgnd2hpdGUnKSkpLnJnYmEoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGVtcGVyYXR1cmUycmdiID0gZnVuY3Rpb24oa2VsdmluKSB7XG4gICAgdmFyIGIsIGcsIHIsIHRlbXA7XG4gICAgdGVtcCA9IGtlbHZpbiAvIDEwMDtcbiAgICBpZiAodGVtcCA8IDY2KSB7XG4gICAgICByID0gMjU1O1xuICAgICAgZyA9IC0xNTUuMjU0ODU1NjI3MDkxNzkgLSAwLjQ0NTk2OTUwNDY5NTc5MTMzICogKGcgPSB0ZW1wIC0gMikgKyAxMDQuNDkyMTYxOTkzOTM4ODggKiBsb2coZyk7XG4gICAgICBiID0gdGVtcCA8IDIwID8gMCA6IC0yNTQuNzY5MzUxODQxMjA5MDIgKyAwLjgyNzQwOTYwNjQwMDczOTUgKiAoYiA9IHRlbXAgLSAxMCkgKyAxMTUuNjc5OTQ0MDEwNjYxNDcgKiBsb2coYik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHIgPSAzNTEuOTc2OTA1NjY4MDU2OTMgKyAwLjExNDIwNjQ1Mzc4NDE2NSAqIChyID0gdGVtcCAtIDU1KSAtIDQwLjI1MzY2MzA5MzMyMTI3ICogbG9nKHIpO1xuICAgICAgZyA9IDMyNS40NDk0MTI1NzExOTc0ICsgMC4wNzk0MzQ1NjUzNjY2MjM0MiAqIChnID0gdGVtcCAtIDUwKSAtIDI4LjA4NTI5NjM1MDc5NTcgKiBsb2coZyk7XG4gICAgICBiID0gMjU1O1xuICAgIH1cbiAgICByZXR1cm4gY2xpcF9yZ2IoW3IsIGcsIGJdKTtcbiAgfTtcblxuICByZ2IydGVtcGVyYXR1cmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYiwgZXBzLCBnLCBtYXhUZW1wLCBtaW5UZW1wLCByLCByZWYsIHJnYiwgdGVtcDtcbiAgICByZWYgPSB1bnBhY2soYXJndW1lbnRzKSwgciA9IHJlZlswXSwgZyA9IHJlZlsxXSwgYiA9IHJlZlsyXTtcbiAgICBtaW5UZW1wID0gMTAwMDtcbiAgICBtYXhUZW1wID0gNDAwMDA7XG4gICAgZXBzID0gMC40O1xuICAgIHdoaWxlIChtYXhUZW1wIC0gbWluVGVtcCA+IGVwcykge1xuICAgICAgdGVtcCA9IChtYXhUZW1wICsgbWluVGVtcCkgKiAwLjU7XG4gICAgICByZ2IgPSB0ZW1wZXJhdHVyZTJyZ2IodGVtcCk7XG4gICAgICBpZiAoKHJnYlsyXSAvIHJnYlswXSkgPj0gKGIgLyByKSkge1xuICAgICAgICBtYXhUZW1wID0gdGVtcDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1pblRlbXAgPSB0ZW1wO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcm91bmQodGVtcCk7XG4gIH07XG5cbiAgY2hyb21hLnRlbXBlcmF0dXJlID0gY2hyb21hLmtlbHZpbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoZnVuY3Rpb24oZnVuYywgYXJncywgY3Rvcikge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBjaGlsZCA9IG5ldyBjdG9yLCByZXN1bHQgPSBmdW5jLmFwcGx5KGNoaWxkLCBhcmdzKTtcbiAgICAgIHJldHVybiBPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0ID8gcmVzdWx0IDogY2hpbGQ7XG4gICAgfSkoQ29sb3IsIHNsaWNlLmNhbGwoYXJndW1lbnRzKS5jb25jYXQoWyd0ZW1wZXJhdHVyZSddKSwgZnVuY3Rpb24oKXt9KTtcbiAgfTtcblxuICBfaW5wdXQudGVtcGVyYXR1cmUgPSBfaW5wdXQua2VsdmluID0gX2lucHV0LksgPSB0ZW1wZXJhdHVyZTJyZ2I7XG5cbiAgQ29sb3IucHJvdG90eXBlLnRlbXBlcmF0dXJlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJnYjJ0ZW1wZXJhdHVyZSh0aGlzLl9yZ2IpO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5rZWx2aW4gPSBDb2xvci5wcm90b3R5cGUudGVtcGVyYXR1cmU7XG5cbiAgY2hyb21hLmNvbnRyYXN0ID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHZhciBsMSwgbDIsIHJlZiwgcmVmMTtcbiAgICBpZiAoKHJlZiA9IHR5cGUoYSkpID09PSAnc3RyaW5nJyB8fCByZWYgPT09ICdudW1iZXInKSB7XG4gICAgICBhID0gbmV3IENvbG9yKGEpO1xuICAgIH1cbiAgICBpZiAoKHJlZjEgPSB0eXBlKGIpKSA9PT0gJ3N0cmluZycgfHwgcmVmMSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGIgPSBuZXcgQ29sb3IoYik7XG4gICAgfVxuICAgIGwxID0gYS5sdW1pbmFuY2UoKTtcbiAgICBsMiA9IGIubHVtaW5hbmNlKCk7XG4gICAgaWYgKGwxID4gbDIpIHtcbiAgICAgIHJldHVybiAobDEgKyAwLjA1KSAvIChsMiArIDAuMDUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKGwyICsgMC4wNSkgLyAobDEgKyAwLjA1KTtcbiAgICB9XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG1vZGVjaGFuKSB7XG4gICAgdmFyIGNoYW5uZWwsIGksIG1lLCBtb2RlLCByZWYsIHNyYztcbiAgICBtZSA9IHRoaXM7XG4gICAgcmVmID0gbW9kZWNoYW4uc3BsaXQoJy4nKSwgbW9kZSA9IHJlZlswXSwgY2hhbm5lbCA9IHJlZlsxXTtcbiAgICBzcmMgPSBtZVttb2RlXSgpO1xuICAgIGlmIChjaGFubmVsKSB7XG4gICAgICBpID0gbW9kZS5pbmRleE9mKGNoYW5uZWwpO1xuICAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgICByZXR1cm4gc3JjW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUud2FybigndW5rbm93biBjaGFubmVsICcgKyBjaGFubmVsICsgJyBpbiBtb2RlICcgKyBtb2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNyYztcbiAgICB9XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG1vZGVjaGFuLCB2YWx1ZSkge1xuICAgIHZhciBjaGFubmVsLCBpLCBtZSwgbW9kZSwgcmVmLCBzcmM7XG4gICAgbWUgPSB0aGlzO1xuICAgIHJlZiA9IG1vZGVjaGFuLnNwbGl0KCcuJyksIG1vZGUgPSByZWZbMF0sIGNoYW5uZWwgPSByZWZbMV07XG4gICAgaWYgKGNoYW5uZWwpIHtcbiAgICAgIHNyYyA9IG1lW21vZGVdKCk7XG4gICAgICBpID0gbW9kZS5pbmRleE9mKGNoYW5uZWwpO1xuICAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgICBpZiAodHlwZSh2YWx1ZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgc3dpdGNoICh2YWx1ZS5jaGFyQXQoMCkpIHtcbiAgICAgICAgICAgIGNhc2UgJysnOlxuICAgICAgICAgICAgICBzcmNbaV0gKz0gK3ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICBzcmNbaV0gKz0gK3ZhbHVlO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJyonOlxuICAgICAgICAgICAgICBzcmNbaV0gKj0gKyh2YWx1ZS5zdWJzdHIoMSkpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgICAgICBzcmNbaV0gLz0gKyh2YWx1ZS5zdWJzdHIoMSkpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHNyY1tpXSA9ICt2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3JjW2ldID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUud2FybigndW5rbm93biBjaGFubmVsICcgKyBjaGFubmVsICsgJyBpbiBtb2RlICcgKyBtb2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3JjID0gdmFsdWU7XG4gICAgfVxuICAgIG1lLl9yZ2IgPSBjaHJvbWEoc3JjLCBtb2RlKS5hbHBoYShtZS5hbHBoYSgpKS5fcmdiO1xuICAgIHJldHVybiBtZTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuZGFya2VuID0gZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgdmFyIGxhYiwgbWU7XG4gICAgaWYgKGFtb3VudCA9PSBudWxsKSB7XG4gICAgICBhbW91bnQgPSAxO1xuICAgIH1cbiAgICBtZSA9IHRoaXM7XG4gICAgbGFiID0gbWUubGFiKCk7XG4gICAgbGFiWzBdIC09IExBQl9DT05TVEFOVFMuS24gKiBhbW91bnQ7XG4gICAgcmV0dXJuIGNocm9tYS5sYWIobGFiKS5hbHBoYShtZS5hbHBoYSgpKTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuYnJpZ2h0ZW4gPSBmdW5jdGlvbihhbW91bnQpIHtcbiAgICBpZiAoYW1vdW50ID09IG51bGwpIHtcbiAgICAgIGFtb3VudCA9IDE7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmRhcmtlbigtYW1vdW50KTtcbiAgfTtcblxuICBDb2xvci5wcm90b3R5cGUuZGFya2VyID0gQ29sb3IucHJvdG90eXBlLmRhcmtlbjtcblxuICBDb2xvci5wcm90b3R5cGUuYnJpZ2h0ZXIgPSBDb2xvci5wcm90b3R5cGUuYnJpZ2h0ZW47XG5cbiAgQ29sb3IucHJvdG90eXBlLnNhdHVyYXRlID0gZnVuY3Rpb24oYW1vdW50KSB7XG4gICAgdmFyIGxjaCwgbWU7XG4gICAgaWYgKGFtb3VudCA9PSBudWxsKSB7XG4gICAgICBhbW91bnQgPSAxO1xuICAgIH1cbiAgICBtZSA9IHRoaXM7XG4gICAgbGNoID0gbWUubGNoKCk7XG4gICAgbGNoWzFdICs9IGFtb3VudCAqIExBQl9DT05TVEFOVFMuS247XG4gICAgaWYgKGxjaFsxXSA8IDApIHtcbiAgICAgIGxjaFsxXSA9IDA7XG4gICAgfVxuICAgIHJldHVybiBjaHJvbWEubGNoKGxjaCkuYWxwaGEobWUuYWxwaGEoKSk7XG4gIH07XG5cbiAgQ29sb3IucHJvdG90eXBlLmRlc2F0dXJhdGUgPSBmdW5jdGlvbihhbW91bnQpIHtcbiAgICBpZiAoYW1vdW50ID09IG51bGwpIHtcbiAgICAgIGFtb3VudCA9IDE7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNhdHVyYXRlKC1hbW91bnQpO1xuICB9O1xuXG4gIENvbG9yLnByb3RvdHlwZS5wcmVtdWx0aXBseSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhLCByZ2I7XG4gICAgcmdiID0gdGhpcy5yZ2IoKTtcbiAgICBhID0gdGhpcy5hbHBoYSgpO1xuICAgIHJldHVybiBjaHJvbWEocmdiWzBdICogYSwgcmdiWzFdICogYSwgcmdiWzJdICogYSwgYSk7XG4gIH07XG5cbiAgYmxlbmQgPSBmdW5jdGlvbihib3R0b20sIHRvcCwgbW9kZSkge1xuICAgIGlmICghYmxlbmRbbW9kZV0pIHtcbiAgICAgIHRocm93ICd1bmtub3duIGJsZW5kIG1vZGUgJyArIG1vZGU7XG4gICAgfVxuICAgIHJldHVybiBibGVuZFttb2RlXShib3R0b20sIHRvcCk7XG4gIH07XG5cbiAgYmxlbmRfZiA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYm90dG9tLCB0b3ApIHtcbiAgICAgIHZhciBjMCwgYzE7XG4gICAgICBjMCA9IGNocm9tYSh0b3ApLnJnYigpO1xuICAgICAgYzEgPSBjaHJvbWEoYm90dG9tKS5yZ2IoKTtcbiAgICAgIHJldHVybiBjaHJvbWEoZihjMCwgYzEpLCAncmdiJyk7XG4gICAgfTtcbiAgfTtcblxuICBlYWNoID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBmdW5jdGlvbihjMCwgYzEpIHtcbiAgICAgIHZhciBpLCBvLCBvdXQ7XG4gICAgICBvdXQgPSBbXTtcbiAgICAgIGZvciAoaSA9IG8gPSAwOyBvIDw9IDM7IGkgPSArK28pIHtcbiAgICAgICAgb3V0W2ldID0gZihjMFtpXSwgYzFbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9O1xuICB9O1xuXG4gIG5vcm1hbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYTtcbiAgfTtcblxuICBtdWx0aXBseSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYSAqIGIgLyAyNTU7XG4gIH07XG5cbiAgZGFya2VuID0gZnVuY3Rpb24oYSwgYikge1xuICAgIGlmIChhID4gYikge1xuICAgICAgcmV0dXJuIGI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgfTtcblxuICBsaWdodGVuID0gZnVuY3Rpb24oYSwgYikge1xuICAgIGlmIChhID4gYikge1xuICAgICAgcmV0dXJuIGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBiO1xuICAgIH1cbiAgfTtcblxuICBzY3JlZW4gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIDI1NSAqICgxIC0gKDEgLSBhIC8gMjU1KSAqICgxIC0gYiAvIDI1NSkpO1xuICB9O1xuXG4gIG92ZXJsYXkgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKGIgPCAxMjgpIHtcbiAgICAgIHJldHVybiAyICogYSAqIGIgLyAyNTU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAyNTUgKiAoMSAtIDIgKiAoMSAtIGEgLyAyNTUpICogKDEgLSBiIC8gMjU1KSk7XG4gICAgfVxuICB9O1xuXG4gIGJ1cm4gPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIDI1NSAqICgxIC0gKDEgLSBiIC8gMjU1KSAvIChhIC8gMjU1KSk7XG4gIH07XG5cbiAgZG9kZ2UgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKGEgPT09IDI1NSkge1xuICAgICAgcmV0dXJuIDI1NTtcbiAgICB9XG4gICAgYSA9IDI1NSAqIChiIC8gMjU1KSAvICgxIC0gYSAvIDI1NSk7XG4gICAgaWYgKGEgPiAyNTUpIHtcbiAgICAgIHJldHVybiAyNTU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgfTtcblxuICBibGVuZC5ub3JtYWwgPSBibGVuZF9mKGVhY2gobm9ybWFsKSk7XG5cbiAgYmxlbmQubXVsdGlwbHkgPSBibGVuZF9mKGVhY2gobXVsdGlwbHkpKTtcblxuICBibGVuZC5zY3JlZW4gPSBibGVuZF9mKGVhY2goc2NyZWVuKSk7XG5cbiAgYmxlbmQub3ZlcmxheSA9IGJsZW5kX2YoZWFjaChvdmVybGF5KSk7XG5cbiAgYmxlbmQuZGFya2VuID0gYmxlbmRfZihlYWNoKGRhcmtlbikpO1xuXG4gIGJsZW5kLmxpZ2h0ZW4gPSBibGVuZF9mKGVhY2gobGlnaHRlbikpO1xuXG4gIGJsZW5kLmRvZGdlID0gYmxlbmRfZihlYWNoKGRvZGdlKSk7XG5cbiAgYmxlbmQuYnVybiA9IGJsZW5kX2YoZWFjaChidXJuKSk7XG5cbiAgY2hyb21hLmJsZW5kID0gYmxlbmQ7XG5cbiAgY2hyb21hLmFuYWx5emUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIGxlbiwgbywgciwgdmFsO1xuICAgIHIgPSB7XG4gICAgICBtaW46IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICBtYXg6IE51bWJlci5NQVhfVkFMVUUgKiAtMSxcbiAgICAgIHN1bTogMCxcbiAgICAgIHZhbHVlczogW10sXG4gICAgICBjb3VudDogMFxuICAgIH07XG4gICAgZm9yIChvID0gMCwgbGVuID0gZGF0YS5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgdmFsID0gZGF0YVtvXTtcbiAgICAgIGlmICgodmFsICE9IG51bGwpICYmICFpc05hTih2YWwpKSB7XG4gICAgICAgIHIudmFsdWVzLnB1c2godmFsKTtcbiAgICAgICAgci5zdW0gKz0gdmFsO1xuICAgICAgICBpZiAodmFsIDwgci5taW4pIHtcbiAgICAgICAgICByLm1pbiA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsID4gci5tYXgpIHtcbiAgICAgICAgICByLm1heCA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByLmNvdW50ICs9IDE7XG4gICAgICB9XG4gICAgfVxuICAgIHIuZG9tYWluID0gW3IubWluLCByLm1heF07XG4gICAgci5saW1pdHMgPSBmdW5jdGlvbihtb2RlLCBudW0pIHtcbiAgICAgIHJldHVybiBjaHJvbWEubGltaXRzKHIsIG1vZGUsIG51bSk7XG4gICAgfTtcbiAgICByZXR1cm4gcjtcbiAgfTtcblxuICBjaHJvbWEuc2NhbGUgPSBmdW5jdGlvbihjb2xvcnMsIHBvc2l0aW9ucykge1xuICAgIHZhciBfY2xhc3NlcywgX2NvbG9yQ2FjaGUsIF9jb2xvcnMsIF9jb3JyZWN0TGlnaHRuZXNzLCBfZG9tYWluLCBfZml4ZWQsIF9tYXgsIF9taW4sIF9tb2RlLCBfbmFjb2wsIF9vdXQsIF9wYWRkaW5nLCBfcG9zLCBfc3ByZWFkLCBjbGFzc2lmeVZhbHVlLCBmLCBnZXRDbGFzcywgZ2V0Q29sb3IsIHJlc2V0Q2FjaGUsIHNldENvbG9ycywgdG1hcDtcbiAgICBfbW9kZSA9ICdyZ2InO1xuICAgIF9uYWNvbCA9IGNocm9tYSgnI2NjYycpO1xuICAgIF9zcHJlYWQgPSAwO1xuICAgIF9maXhlZCA9IGZhbHNlO1xuICAgIF9kb21haW4gPSBbMCwgMV07XG4gICAgX3BvcyA9IFtdO1xuICAgIF9wYWRkaW5nID0gWzAsIDBdO1xuICAgIF9jbGFzc2VzID0gZmFsc2U7XG4gICAgX2NvbG9ycyA9IFtdO1xuICAgIF9vdXQgPSBmYWxzZTtcbiAgICBfbWluID0gMDtcbiAgICBfbWF4ID0gMTtcbiAgICBfY29ycmVjdExpZ2h0bmVzcyA9IGZhbHNlO1xuICAgIF9jb2xvckNhY2hlID0ge307XG4gICAgc2V0Q29sb3JzID0gZnVuY3Rpb24oY29sb3JzKSB7XG4gICAgICB2YXIgYywgY29sLCBvLCByZWYsIHJlZjEsIHJlZjIsIHc7XG4gICAgICBpZiAoY29sb3JzID09IG51bGwpIHtcbiAgICAgICAgY29sb3JzID0gWycjZmZmJywgJyMwMDAnXTtcbiAgICAgIH1cbiAgICAgIGlmICgoY29sb3JzICE9IG51bGwpICYmIHR5cGUoY29sb3JzKSA9PT0gJ3N0cmluZycgJiYgKCgocmVmID0gY2hyb21hLmJyZXdlcikgIT0gbnVsbCA/IHJlZltjb2xvcnNdIDogdm9pZCAwKSAhPSBudWxsKSkge1xuICAgICAgICBjb2xvcnMgPSBjaHJvbWEuYnJld2VyW2NvbG9yc107XG4gICAgICB9XG4gICAgICBpZiAodHlwZShjb2xvcnMpID09PSAnYXJyYXknKSB7XG4gICAgICAgIGNvbG9ycyA9IGNvbG9ycy5zbGljZSgwKTtcbiAgICAgICAgZm9yIChjID0gbyA9IDAsIHJlZjEgPSBjb2xvcnMubGVuZ3RoIC0gMTsgMCA8PSByZWYxID8gbyA8PSByZWYxIDogbyA+PSByZWYxOyBjID0gMCA8PSByZWYxID8gKytvIDogLS1vKSB7XG4gICAgICAgICAgY29sID0gY29sb3JzW2NdO1xuICAgICAgICAgIGlmICh0eXBlKGNvbCkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbG9yc1tjXSA9IGNocm9tYShjb2wpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBfcG9zLmxlbmd0aCA9IDA7XG4gICAgICAgIGZvciAoYyA9IHcgPSAwLCByZWYyID0gY29sb3JzLmxlbmd0aCAtIDE7IDAgPD0gcmVmMiA/IHcgPD0gcmVmMiA6IHcgPj0gcmVmMjsgYyA9IDAgPD0gcmVmMiA/ICsrdyA6IC0tdykge1xuICAgICAgICAgIF9wb3MucHVzaChjIC8gKGNvbG9ycy5sZW5ndGggLSAxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJlc2V0Q2FjaGUoKTtcbiAgICAgIHJldHVybiBfY29sb3JzID0gY29sb3JzO1xuICAgIH07XG4gICAgZ2V0Q2xhc3MgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIGksIG47XG4gICAgICBpZiAoX2NsYXNzZXMgIT0gbnVsbCkge1xuICAgICAgICBuID0gX2NsYXNzZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgbiAmJiB2YWx1ZSA+PSBfY2xhc3Nlc1tpXSkge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaSAtIDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gMDtcbiAgICB9O1xuICAgIHRtYXAgPSBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIGNsYXNzaWZ5VmFsdWUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIGksIG1heGMsIG1pbmMsIG4sIHZhbDtcbiAgICAgIHZhbCA9IHZhbHVlO1xuICAgICAgaWYgKF9jbGFzc2VzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgbiA9IF9jbGFzc2VzLmxlbmd0aCAtIDE7XG4gICAgICAgIGkgPSBnZXRDbGFzcyh2YWx1ZSk7XG4gICAgICAgIG1pbmMgPSBfY2xhc3Nlc1swXSArIChfY2xhc3Nlc1sxXSAtIF9jbGFzc2VzWzBdKSAqICgwICsgX3NwcmVhZCAqIDAuNSk7XG4gICAgICAgIG1heGMgPSBfY2xhc3Nlc1tuIC0gMV0gKyAoX2NsYXNzZXNbbl0gLSBfY2xhc3Nlc1tuIC0gMV0pICogKDEgLSBfc3ByZWFkICogMC41KTtcbiAgICAgICAgdmFsID0gX21pbiArICgoX2NsYXNzZXNbaV0gKyAoX2NsYXNzZXNbaSArIDFdIC0gX2NsYXNzZXNbaV0pICogMC41IC0gbWluYykgLyAobWF4YyAtIG1pbmMpKSAqIChfbWF4IC0gX21pbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH07XG4gICAgZ2V0Q29sb3IgPSBmdW5jdGlvbih2YWwsIGJ5cGFzc01hcCkge1xuICAgICAgdmFyIGMsIGNvbCwgaSwgaywgbywgcCwgcmVmLCB0O1xuICAgICAgaWYgKGJ5cGFzc01hcCA9PSBudWxsKSB7XG4gICAgICAgIGJ5cGFzc01hcCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGlzTmFOKHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIF9uYWNvbDtcbiAgICAgIH1cbiAgICAgIGlmICghYnlwYXNzTWFwKSB7XG4gICAgICAgIGlmIChfY2xhc3NlcyAmJiBfY2xhc3Nlcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgYyA9IGdldENsYXNzKHZhbCk7XG4gICAgICAgICAgdCA9IGMgLyAoX2NsYXNzZXMubGVuZ3RoIC0gMik7XG4gICAgICAgICAgdCA9IF9wYWRkaW5nWzBdICsgKHQgKiAoMSAtIF9wYWRkaW5nWzBdIC0gX3BhZGRpbmdbMV0pKTtcbiAgICAgICAgfSBlbHNlIGlmIChfbWF4ICE9PSBfbWluKSB7XG4gICAgICAgICAgdCA9ICh2YWwgLSBfbWluKSAvIChfbWF4IC0gX21pbik7XG4gICAgICAgICAgdCA9IF9wYWRkaW5nWzBdICsgKHQgKiAoMSAtIF9wYWRkaW5nWzBdIC0gX3BhZGRpbmdbMV0pKTtcbiAgICAgICAgICB0ID0gTWF0aC5taW4oMSwgTWF0aC5tYXgoMCwgdCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHQgPSAxO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ID0gdmFsO1xuICAgICAgfVxuICAgICAgaWYgKCFieXBhc3NNYXApIHtcbiAgICAgICAgdCA9IHRtYXAodCk7XG4gICAgICB9XG4gICAgICBrID0gTWF0aC5mbG9vcih0ICogMTAwMDApO1xuICAgICAgaWYgKF9jb2xvckNhY2hlW2tdKSB7XG4gICAgICAgIGNvbCA9IF9jb2xvckNhY2hlW2tdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHR5cGUoX2NvbG9ycykgPT09ICdhcnJheScpIHtcbiAgICAgICAgICBmb3IgKGkgPSBvID0gMCwgcmVmID0gX3Bvcy5sZW5ndGggLSAxOyAwIDw9IHJlZiA/IG8gPD0gcmVmIDogbyA+PSByZWY7IGkgPSAwIDw9IHJlZiA/ICsrbyA6IC0tbykge1xuICAgICAgICAgICAgcCA9IF9wb3NbaV07XG4gICAgICAgICAgICBpZiAodCA8PSBwKSB7XG4gICAgICAgICAgICAgIGNvbCA9IF9jb2xvcnNbaV07XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHQgPj0gcCAmJiBpID09PSBfcG9zLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgY29sID0gX2NvbG9yc1tpXTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodCA+IHAgJiYgdCA8IF9wb3NbaSArIDFdKSB7XG4gICAgICAgICAgICAgIHQgPSAodCAtIHApIC8gKF9wb3NbaSArIDFdIC0gcCk7XG4gICAgICAgICAgICAgIGNvbCA9IGNocm9tYS5pbnRlcnBvbGF0ZShfY29sb3JzW2ldLCBfY29sb3JzW2kgKyAxXSwgdCwgX21vZGUpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZShfY29sb3JzKSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbCA9IF9jb2xvcnModCk7XG4gICAgICAgIH1cbiAgICAgICAgX2NvbG9yQ2FjaGVba10gPSBjb2w7XG4gICAgICB9XG4gICAgICByZXR1cm4gY29sO1xuICAgIH07XG4gICAgcmVzZXRDYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF9jb2xvckNhY2hlID0ge307XG4gICAgfTtcbiAgICBzZXRDb2xvcnMoY29sb3JzKTtcbiAgICBmID0gZnVuY3Rpb24odikge1xuICAgICAgdmFyIGM7XG4gICAgICBjID0gY2hyb21hKGdldENvbG9yKHYpKTtcbiAgICAgIGlmIChfb3V0ICYmIGNbX291dF0pIHtcbiAgICAgICAgcmV0dXJuIGNbX291dF0oKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjO1xuICAgICAgfVxuICAgIH07XG4gICAgZi5jbGFzc2VzID0gZnVuY3Rpb24oY2xhc3Nlcykge1xuICAgICAgdmFyIGQ7XG4gICAgICBpZiAoY2xhc3NlcyAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlKGNsYXNzZXMpID09PSAnYXJyYXknKSB7XG4gICAgICAgICAgX2NsYXNzZXMgPSBjbGFzc2VzO1xuICAgICAgICAgIF9kb21haW4gPSBbY2xhc3Nlc1swXSwgY2xhc3Nlc1tjbGFzc2VzLmxlbmd0aCAtIDFdXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkID0gY2hyb21hLmFuYWx5emUoX2RvbWFpbik7XG4gICAgICAgICAgaWYgKGNsYXNzZXMgPT09IDApIHtcbiAgICAgICAgICAgIF9jbGFzc2VzID0gW2QubWluLCBkLm1heF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9jbGFzc2VzID0gY2hyb21hLmxpbWl0cyhkLCAnZScsIGNsYXNzZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfY2xhc3NlcztcbiAgICB9O1xuICAgIGYuZG9tYWluID0gZnVuY3Rpb24oZG9tYWluKSB7XG4gICAgICB2YXIgYywgZCwgaywgbGVuLCBvLCByZWYsIHc7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIF9kb21haW47XG4gICAgICB9XG4gICAgICBfbWluID0gZG9tYWluWzBdO1xuICAgICAgX21heCA9IGRvbWFpbltkb21haW4ubGVuZ3RoIC0gMV07XG4gICAgICBfcG9zID0gW107XG4gICAgICBrID0gX2NvbG9ycy5sZW5ndGg7XG4gICAgICBpZiAoZG9tYWluLmxlbmd0aCA9PT0gayAmJiBfbWluICE9PSBfbWF4KSB7XG4gICAgICAgIGZvciAobyA9IDAsIGxlbiA9IGRvbWFpbi5sZW5ndGg7IG8gPCBsZW47IG8rKykge1xuICAgICAgICAgIGQgPSBkb21haW5bb107XG4gICAgICAgICAgX3Bvcy5wdXNoKChkIC0gX21pbikgLyAoX21heCAtIF9taW4pKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChjID0gdyA9IDAsIHJlZiA9IGsgLSAxOyAwIDw9IHJlZiA/IHcgPD0gcmVmIDogdyA+PSByZWY7IGMgPSAwIDw9IHJlZiA/ICsrdyA6IC0tdykge1xuICAgICAgICAgIF9wb3MucHVzaChjIC8gKGsgLSAxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF9kb21haW4gPSBbX21pbiwgX21heF07XG4gICAgICByZXR1cm4gZjtcbiAgICB9O1xuICAgIGYubW9kZSA9IGZ1bmN0aW9uKF9tKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIF9tb2RlO1xuICAgICAgfVxuICAgICAgX21vZGUgPSBfbTtcbiAgICAgIHJlc2V0Q2FjaGUoKTtcbiAgICAgIHJldHVybiBmO1xuICAgIH07XG4gICAgZi5yYW5nZSA9IGZ1bmN0aW9uKGNvbG9ycywgX3Bvcykge1xuICAgICAgc2V0Q29sb3JzKGNvbG9ycywgX3Bvcyk7XG4gICAgICByZXR1cm4gZjtcbiAgICB9O1xuICAgIGYub3V0ID0gZnVuY3Rpb24oX28pIHtcbiAgICAgIF9vdXQgPSBfbztcbiAgICAgIHJldHVybiBmO1xuICAgIH07XG4gICAgZi5zcHJlYWQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gX3NwcmVhZDtcbiAgICAgIH1cbiAgICAgIF9zcHJlYWQgPSB2YWw7XG4gICAgICByZXR1cm4gZjtcbiAgICB9O1xuICAgIGYuY29ycmVjdExpZ2h0bmVzcyA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICh2ID09IG51bGwpIHtcbiAgICAgICAgdiA9IHRydWU7XG4gICAgICB9XG4gICAgICBfY29ycmVjdExpZ2h0bmVzcyA9IHY7XG4gICAgICByZXNldENhY2hlKCk7XG4gICAgICBpZiAoX2NvcnJlY3RMaWdodG5lc3MpIHtcbiAgICAgICAgdG1hcCA9IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICB2YXIgTDAsIEwxLCBMX2FjdHVhbCwgTF9kaWZmLCBMX2lkZWFsLCBtYXhfaXRlciwgcG9sLCB0MCwgdDE7XG4gICAgICAgICAgTDAgPSBnZXRDb2xvcigwLCB0cnVlKS5sYWIoKVswXTtcbiAgICAgICAgICBMMSA9IGdldENvbG9yKDEsIHRydWUpLmxhYigpWzBdO1xuICAgICAgICAgIHBvbCA9IEwwID4gTDE7XG4gICAgICAgICAgTF9hY3R1YWwgPSBnZXRDb2xvcih0LCB0cnVlKS5sYWIoKVswXTtcbiAgICAgICAgICBMX2lkZWFsID0gTDAgKyAoTDEgLSBMMCkgKiB0O1xuICAgICAgICAgIExfZGlmZiA9IExfYWN0dWFsIC0gTF9pZGVhbDtcbiAgICAgICAgICB0MCA9IDA7XG4gICAgICAgICAgdDEgPSAxO1xuICAgICAgICAgIG1heF9pdGVyID0gMjA7XG4gICAgICAgICAgd2hpbGUgKE1hdGguYWJzKExfZGlmZikgPiAxZS0yICYmIG1heF9pdGVyLS0gPiAwKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGlmIChwb2wpIHtcbiAgICAgICAgICAgICAgICBMX2RpZmYgKj0gLTE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKExfZGlmZiA8IDApIHtcbiAgICAgICAgICAgICAgICB0MCA9IHQ7XG4gICAgICAgICAgICAgICAgdCArPSAodDEgLSB0KSAqIDAuNTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0MSA9IHQ7XG4gICAgICAgICAgICAgICAgdCArPSAodDAgLSB0KSAqIDAuNTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBMX2FjdHVhbCA9IGdldENvbG9yKHQsIHRydWUpLmxhYigpWzBdO1xuICAgICAgICAgICAgICByZXR1cm4gTF9kaWZmID0gTF9hY3R1YWwgLSBMX2lkZWFsO1xuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHQ7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0bWFwID0gZnVuY3Rpb24odCkge1xuICAgICAgICAgIHJldHVybiB0O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGY7XG4gICAgfTtcbiAgICBmLnBhZGRpbmcgPSBmdW5jdGlvbihwKSB7XG4gICAgICBpZiAocCAhPSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlKHApID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHAgPSBbcCwgcF07XG4gICAgICAgIH1cbiAgICAgICAgX3BhZGRpbmcgPSBwO1xuICAgICAgICByZXR1cm4gZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfcGFkZGluZztcbiAgICAgIH1cbiAgICB9O1xuICAgIGYuY29sb3JzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGQsIGRtLCBpLCBudW1Db2xvcnMsIG8sIG91dCwgcmVmLCByZXN1bHRzLCBzYW1wbGVzLCB3O1xuICAgICAgbnVtQ29sb3JzID0gMDtcbiAgICAgIG91dCA9ICdoZXgnO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKHR5cGUoYXJndW1lbnRzWzBdKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBvdXQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbnVtQ29sb3JzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBudW1Db2xvcnMgPSBhcmd1bWVudHNbMF0sIG91dCA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIH1cbiAgICAgIGlmIChudW1Db2xvcnMpIHtcbiAgICAgICAgZG0gPSBfZG9tYWluWzBdO1xuICAgICAgICBkZCA9IF9kb21haW5bMV0gLSBkbTtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yICh2YXIgbyA9IDA7IDAgPD0gbnVtQ29sb3JzID8gbyA8IG51bUNvbG9ycyA6IG8gPiBudW1Db2xvcnM7IDAgPD0gbnVtQ29sb3JzID8gbysrIDogby0tKXsgcmVzdWx0cy5wdXNoKG8pOyB9XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICAgIH0pLmFwcGx5KHRoaXMpLm1hcChmdW5jdGlvbihpKSB7XG4gICAgICAgICAgcmV0dXJuIGYoZG0gKyBpIC8gKG51bUNvbG9ycyAtIDEpICogZGQpW291dF0oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBjb2xvcnMgPSBbXTtcbiAgICAgIHNhbXBsZXMgPSBbXTtcbiAgICAgIGlmIChfY2xhc3NlcyAmJiBfY2xhc3Nlcy5sZW5ndGggPiAyKSB7XG4gICAgICAgIGZvciAoaSA9IHcgPSAxLCByZWYgPSBfY2xhc3Nlcy5sZW5ndGg7IDEgPD0gcmVmID8gdyA8IHJlZiA6IHcgPiByZWY7IGkgPSAxIDw9IHJlZiA/ICsrdyA6IC0tdykge1xuICAgICAgICAgIHNhbXBsZXMucHVzaCgoX2NsYXNzZXNbaSAtIDFdICsgX2NsYXNzZXNbaV0pICogMC41KTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2FtcGxlcyA9IF9kb21haW47XG4gICAgICB9XG4gICAgICByZXR1cm4gc2FtcGxlcy5tYXAoZnVuY3Rpb24odikge1xuICAgICAgICByZXR1cm4gZih2KVtvdXRdKCk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBmO1xuICB9O1xuXG4gIGlmIChjaHJvbWEuc2NhbGVzID09IG51bGwpIHtcbiAgICBjaHJvbWEuc2NhbGVzID0ge307XG4gIH1cblxuICBjaHJvbWEuc2NhbGVzLmNvb2wgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY2hyb21hLnNjYWxlKFtjaHJvbWEuaHNsKDE4MCwgMSwgLjkpLCBjaHJvbWEuaHNsKDI1MCwgLjcsIC40KV0pO1xuICB9O1xuXG4gIGNocm9tYS5zY2FsZXMuaG90ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNocm9tYS5zY2FsZShbJyMwMDAnLCAnI2YwMCcsICcjZmYwJywgJyNmZmYnXSwgWzAsIC4yNSwgLjc1LCAxXSkubW9kZSgncmdiJyk7XG4gIH07XG5cbiAgY2hyb21hLmFuYWx5emUgPSBmdW5jdGlvbihkYXRhLCBrZXksIGZpbHRlcikge1xuICAgIHZhciBhZGQsIGssIGxlbiwgbywgciwgdmFsLCB2aXNpdDtcbiAgICByID0ge1xuICAgICAgbWluOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgbWF4OiBOdW1iZXIuTUFYX1ZBTFVFICogLTEsXG4gICAgICBzdW06IDAsXG4gICAgICB2YWx1ZXM6IFtdLFxuICAgICAgY291bnQ6IDBcbiAgICB9O1xuICAgIGlmIChmaWx0ZXIgPT0gbnVsbCkge1xuICAgICAgZmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9XG4gICAgYWRkID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICBpZiAoKHZhbCAhPSBudWxsKSAmJiAhaXNOYU4odmFsKSkge1xuICAgICAgICByLnZhbHVlcy5wdXNoKHZhbCk7XG4gICAgICAgIHIuc3VtICs9IHZhbDtcbiAgICAgICAgaWYgKHZhbCA8IHIubWluKSB7XG4gICAgICAgICAgci5taW4gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbCA+IHIubWF4KSB7XG4gICAgICAgICAgci5tYXggPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgci5jb3VudCArPSAxO1xuICAgICAgfVxuICAgIH07XG4gICAgdmlzaXQgPSBmdW5jdGlvbih2YWwsIGspIHtcbiAgICAgIGlmIChmaWx0ZXIodmFsLCBrKSkge1xuICAgICAgICBpZiAoKGtleSAhPSBudWxsKSAmJiB0eXBlKGtleSkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gYWRkKGtleSh2YWwpKTtcbiAgICAgICAgfSBlbHNlIGlmICgoa2V5ICE9IG51bGwpICYmIHR5cGUoa2V5KSA9PT0gJ3N0cmluZycgfHwgdHlwZShrZXkpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHJldHVybiBhZGQodmFsW2tleV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBhZGQodmFsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgaWYgKHR5cGUoZGF0YSkgPT09ICdhcnJheScpIHtcbiAgICAgIGZvciAobyA9IDAsIGxlbiA9IGRhdGEubGVuZ3RoOyBvIDwgbGVuOyBvKyspIHtcbiAgICAgICAgdmFsID0gZGF0YVtvXTtcbiAgICAgICAgdmlzaXQodmFsKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChrIGluIGRhdGEpIHtcbiAgICAgICAgdmFsID0gZGF0YVtrXTtcbiAgICAgICAgdmlzaXQodmFsLCBrKTtcbiAgICAgIH1cbiAgICB9XG4gICAgci5kb21haW4gPSBbci5taW4sIHIubWF4XTtcbiAgICByLmxpbWl0cyA9IGZ1bmN0aW9uKG1vZGUsIG51bSkge1xuICAgICAgcmV0dXJuIGNocm9tYS5saW1pdHMociwgbW9kZSwgbnVtKTtcbiAgICB9O1xuICAgIHJldHVybiByO1xuICB9O1xuXG4gIGNocm9tYS5saW1pdHMgPSBmdW5jdGlvbihkYXRhLCBtb2RlLCBudW0pIHtcbiAgICB2YXIgYWEsIGFiLCBhYywgYWQsIGFlLCBhZiwgYWcsIGFoLCBhaSwgYWosIGFrLCBhbCwgYW0sIGFzc2lnbm1lbnRzLCBiZXN0LCBjZW50cm9pZHMsIGNsdXN0ZXIsIGNsdXN0ZXJTaXplcywgZGlzdCwgaSwgaiwga0NsdXN0ZXJzLCBsaW1pdHMsIG1heF9sb2csIG1pbiwgbWluX2xvZywgbWluZGlzdCwgbiwgbmJfaXRlcnMsIG5ld0NlbnRyb2lkcywgbywgcCwgcGIsIHByLCByZWYsIHJlZjEsIHJlZjEwLCByZWYxMSwgcmVmMTIsIHJlZjEzLCByZWYxNCwgcmVmMiwgcmVmMywgcmVmNCwgcmVmNSwgcmVmNiwgcmVmNywgcmVmOCwgcmVmOSwgcmVwZWF0LCBzdW0sIHRtcEtNZWFuc0JyZWFrcywgdmFsdWUsIHZhbHVlcywgdztcbiAgICBpZiAobW9kZSA9PSBudWxsKSB7XG4gICAgICBtb2RlID0gJ2VxdWFsJztcbiAgICB9XG4gICAgaWYgKG51bSA9PSBudWxsKSB7XG4gICAgICBudW0gPSA3O1xuICAgIH1cbiAgICBpZiAodHlwZShkYXRhKSA9PT0gJ2FycmF5Jykge1xuICAgICAgZGF0YSA9IGNocm9tYS5hbmFseXplKGRhdGEpO1xuICAgIH1cbiAgICBtaW4gPSBkYXRhLm1pbjtcbiAgICBtYXggPSBkYXRhLm1heDtcbiAgICBzdW0gPSBkYXRhLnN1bTtcbiAgICB2YWx1ZXMgPSBkYXRhLnZhbHVlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBhIC0gYjtcbiAgICB9KTtcbiAgICBsaW1pdHMgPSBbXTtcbiAgICBpZiAobW9kZS5zdWJzdHIoMCwgMSkgPT09ICdjJykge1xuICAgICAgbGltaXRzLnB1c2gobWluKTtcbiAgICAgIGxpbWl0cy5wdXNoKG1heCk7XG4gICAgfVxuICAgIGlmIChtb2RlLnN1YnN0cigwLCAxKSA9PT0gJ2UnKSB7XG4gICAgICBsaW1pdHMucHVzaChtaW4pO1xuICAgICAgZm9yIChpID0gbyA9IDEsIHJlZiA9IG51bSAtIDE7IDEgPD0gcmVmID8gbyA8PSByZWYgOiBvID49IHJlZjsgaSA9IDEgPD0gcmVmID8gKytvIDogLS1vKSB7XG4gICAgICAgIGxpbWl0cy5wdXNoKG1pbiArIChpIC8gbnVtKSAqIChtYXggLSBtaW4pKTtcbiAgICAgIH1cbiAgICAgIGxpbWl0cy5wdXNoKG1heCk7XG4gICAgfSBlbHNlIGlmIChtb2RlLnN1YnN0cigwLCAxKSA9PT0gJ2wnKSB7XG4gICAgICBpZiAobWluIDw9IDApIHtcbiAgICAgICAgdGhyb3cgJ0xvZ2FyaXRobWljIHNjYWxlcyBhcmUgb25seSBwb3NzaWJsZSBmb3IgdmFsdWVzID4gMCc7XG4gICAgICB9XG4gICAgICBtaW5fbG9nID0gTWF0aC5MT0cxMEUgKiBsb2cobWluKTtcbiAgICAgIG1heF9sb2cgPSBNYXRoLkxPRzEwRSAqIGxvZyhtYXgpO1xuICAgICAgbGltaXRzLnB1c2gobWluKTtcbiAgICAgIGZvciAoaSA9IHcgPSAxLCByZWYxID0gbnVtIC0gMTsgMSA8PSByZWYxID8gdyA8PSByZWYxIDogdyA+PSByZWYxOyBpID0gMSA8PSByZWYxID8gKyt3IDogLS13KSB7XG4gICAgICAgIGxpbWl0cy5wdXNoKHBvdygxMCwgbWluX2xvZyArIChpIC8gbnVtKSAqIChtYXhfbG9nIC0gbWluX2xvZykpKTtcbiAgICAgIH1cbiAgICAgIGxpbWl0cy5wdXNoKG1heCk7XG4gICAgfSBlbHNlIGlmIChtb2RlLnN1YnN0cigwLCAxKSA9PT0gJ3EnKSB7XG4gICAgICBsaW1pdHMucHVzaChtaW4pO1xuICAgICAgZm9yIChpID0gYWEgPSAxLCByZWYyID0gbnVtIC0gMTsgMSA8PSByZWYyID8gYWEgPD0gcmVmMiA6IGFhID49IHJlZjI7IGkgPSAxIDw9IHJlZjIgPyArK2FhIDogLS1hYSkge1xuICAgICAgICBwID0gdmFsdWVzLmxlbmd0aCAqIGkgLyBudW07XG4gICAgICAgIHBiID0gZmxvb3IocCk7XG4gICAgICAgIGlmIChwYiA9PT0gcCkge1xuICAgICAgICAgIGxpbWl0cy5wdXNoKHZhbHVlc1twYl0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByID0gcCAtIHBiO1xuICAgICAgICAgIGxpbWl0cy5wdXNoKHZhbHVlc1twYl0gKiBwciArIHZhbHVlc1twYiArIDFdICogKDEgLSBwcikpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsaW1pdHMucHVzaChtYXgpO1xuICAgIH0gZWxzZSBpZiAobW9kZS5zdWJzdHIoMCwgMSkgPT09ICdrJykge1xuXG4gICAgICAvKlxuICAgICAgaW1wbGVtZW50YXRpb24gYmFzZWQgb25cbiAgICAgIGh0dHA6Ly9jb2RlLmdvb2dsZS5jb20vcC9maWd1ZS9zb3VyY2UvYnJvd3NlL3RydW5rL2ZpZ3VlLmpzIzMzNlxuICAgICAgc2ltcGxpZmllZCBmb3IgMS1kIGlucHV0IHZhbHVlc1xuICAgICAgICovXG4gICAgICBuID0gdmFsdWVzLmxlbmd0aDtcbiAgICAgIGFzc2lnbm1lbnRzID0gbmV3IEFycmF5KG4pO1xuICAgICAgY2x1c3RlclNpemVzID0gbmV3IEFycmF5KG51bSk7XG4gICAgICByZXBlYXQgPSB0cnVlO1xuICAgICAgbmJfaXRlcnMgPSAwO1xuICAgICAgY2VudHJvaWRzID0gbnVsbDtcbiAgICAgIGNlbnRyb2lkcyA9IFtdO1xuICAgICAgY2VudHJvaWRzLnB1c2gobWluKTtcbiAgICAgIGZvciAoaSA9IGFiID0gMSwgcmVmMyA9IG51bSAtIDE7IDEgPD0gcmVmMyA/IGFiIDw9IHJlZjMgOiBhYiA+PSByZWYzOyBpID0gMSA8PSByZWYzID8gKythYiA6IC0tYWIpIHtcbiAgICAgICAgY2VudHJvaWRzLnB1c2gobWluICsgKGkgLyBudW0pICogKG1heCAtIG1pbikpO1xuICAgICAgfVxuICAgICAgY2VudHJvaWRzLnB1c2gobWF4KTtcbiAgICAgIHdoaWxlIChyZXBlYXQpIHtcbiAgICAgICAgZm9yIChqID0gYWMgPSAwLCByZWY0ID0gbnVtIC0gMTsgMCA8PSByZWY0ID8gYWMgPD0gcmVmNCA6IGFjID49IHJlZjQ7IGogPSAwIDw9IHJlZjQgPyArK2FjIDogLS1hYykge1xuICAgICAgICAgIGNsdXN0ZXJTaXplc1tqXSA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gYWQgPSAwLCByZWY1ID0gbiAtIDE7IDAgPD0gcmVmNSA/IGFkIDw9IHJlZjUgOiBhZCA+PSByZWY1OyBpID0gMCA8PSByZWY1ID8gKythZCA6IC0tYWQpIHtcbiAgICAgICAgICB2YWx1ZSA9IHZhbHVlc1tpXTtcbiAgICAgICAgICBtaW5kaXN0ID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICAgICAgICBmb3IgKGogPSBhZSA9IDAsIHJlZjYgPSBudW0gLSAxOyAwIDw9IHJlZjYgPyBhZSA8PSByZWY2IDogYWUgPj0gcmVmNjsgaiA9IDAgPD0gcmVmNiA/ICsrYWUgOiAtLWFlKSB7XG4gICAgICAgICAgICBkaXN0ID0gYWJzKGNlbnRyb2lkc1tqXSAtIHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChkaXN0IDwgbWluZGlzdCkge1xuICAgICAgICAgICAgICBtaW5kaXN0ID0gZGlzdDtcbiAgICAgICAgICAgICAgYmVzdCA9IGo7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGNsdXN0ZXJTaXplc1tiZXN0XSsrO1xuICAgICAgICAgIGFzc2lnbm1lbnRzW2ldID0gYmVzdDtcbiAgICAgICAgfVxuICAgICAgICBuZXdDZW50cm9pZHMgPSBuZXcgQXJyYXkobnVtKTtcbiAgICAgICAgZm9yIChqID0gYWYgPSAwLCByZWY3ID0gbnVtIC0gMTsgMCA8PSByZWY3ID8gYWYgPD0gcmVmNyA6IGFmID49IHJlZjc7IGogPSAwIDw9IHJlZjcgPyArK2FmIDogLS1hZikge1xuICAgICAgICAgIG5ld0NlbnRyb2lkc1tqXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gYWcgPSAwLCByZWY4ID0gbiAtIDE7IDAgPD0gcmVmOCA/IGFnIDw9IHJlZjggOiBhZyA+PSByZWY4OyBpID0gMCA8PSByZWY4ID8gKythZyA6IC0tYWcpIHtcbiAgICAgICAgICBjbHVzdGVyID0gYXNzaWdubWVudHNbaV07XG4gICAgICAgICAgaWYgKG5ld0NlbnRyb2lkc1tjbHVzdGVyXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbmV3Q2VudHJvaWRzW2NsdXN0ZXJdID0gdmFsdWVzW2ldO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdDZW50cm9pZHNbY2x1c3Rlcl0gKz0gdmFsdWVzW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGogPSBhaCA9IDAsIHJlZjkgPSBudW0gLSAxOyAwIDw9IHJlZjkgPyBhaCA8PSByZWY5IDogYWggPj0gcmVmOTsgaiA9IDAgPD0gcmVmOSA/ICsrYWggOiAtLWFoKSB7XG4gICAgICAgICAgbmV3Q2VudHJvaWRzW2pdICo9IDEgLyBjbHVzdGVyU2l6ZXNbal07XG4gICAgICAgIH1cbiAgICAgICAgcmVwZWF0ID0gZmFsc2U7XG4gICAgICAgIGZvciAoaiA9IGFpID0gMCwgcmVmMTAgPSBudW0gLSAxOyAwIDw9IHJlZjEwID8gYWkgPD0gcmVmMTAgOiBhaSA+PSByZWYxMDsgaiA9IDAgPD0gcmVmMTAgPyArK2FpIDogLS1haSkge1xuICAgICAgICAgIGlmIChuZXdDZW50cm9pZHNbal0gIT09IGNlbnRyb2lkc1tpXSkge1xuICAgICAgICAgICAgcmVwZWF0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjZW50cm9pZHMgPSBuZXdDZW50cm9pZHM7XG4gICAgICAgIG5iX2l0ZXJzKys7XG4gICAgICAgIGlmIChuYl9pdGVycyA+IDIwMCkge1xuICAgICAgICAgIHJlcGVhdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBrQ2x1c3RlcnMgPSB7fTtcbiAgICAgIGZvciAoaiA9IGFqID0gMCwgcmVmMTEgPSBudW0gLSAxOyAwIDw9IHJlZjExID8gYWogPD0gcmVmMTEgOiBhaiA+PSByZWYxMTsgaiA9IDAgPD0gcmVmMTEgPyArK2FqIDogLS1haikge1xuICAgICAgICBrQ2x1c3RlcnNbal0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IGFrID0gMCwgcmVmMTIgPSBuIC0gMTsgMCA8PSByZWYxMiA/IGFrIDw9IHJlZjEyIDogYWsgPj0gcmVmMTI7IGkgPSAwIDw9IHJlZjEyID8gKythayA6IC0tYWspIHtcbiAgICAgICAgY2x1c3RlciA9IGFzc2lnbm1lbnRzW2ldO1xuICAgICAgICBrQ2x1c3RlcnNbY2x1c3Rlcl0ucHVzaCh2YWx1ZXNbaV0pO1xuICAgICAgfVxuICAgICAgdG1wS01lYW5zQnJlYWtzID0gW107XG4gICAgICBmb3IgKGogPSBhbCA9IDAsIHJlZjEzID0gbnVtIC0gMTsgMCA8PSByZWYxMyA/IGFsIDw9IHJlZjEzIDogYWwgPj0gcmVmMTM7IGogPSAwIDw9IHJlZjEzID8gKythbCA6IC0tYWwpIHtcbiAgICAgICAgdG1wS01lYW5zQnJlYWtzLnB1c2goa0NsdXN0ZXJzW2pdWzBdKTtcbiAgICAgICAgdG1wS01lYW5zQnJlYWtzLnB1c2goa0NsdXN0ZXJzW2pdW2tDbHVzdGVyc1tqXS5sZW5ndGggLSAxXSk7XG4gICAgICB9XG4gICAgICB0bXBLTWVhbnNCcmVha3MgPSB0bXBLTWVhbnNCcmVha3Muc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhIC0gYjtcbiAgICAgIH0pO1xuICAgICAgbGltaXRzLnB1c2godG1wS01lYW5zQnJlYWtzWzBdKTtcbiAgICAgIGZvciAoaSA9IGFtID0gMSwgcmVmMTQgPSB0bXBLTWVhbnNCcmVha3MubGVuZ3RoIC0gMTsgYW0gPD0gcmVmMTQ7IGkgPSBhbSArPSAyKSB7XG4gICAgICAgIGlmICghaXNOYU4odG1wS01lYW5zQnJlYWtzW2ldKSkge1xuICAgICAgICAgIGxpbWl0cy5wdXNoKHRtcEtNZWFuc0JyZWFrc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxpbWl0cztcbiAgfTtcblxuICBoc2kycmdiID0gZnVuY3Rpb24oaCwgcywgaSkge1xuXG4gICAgLypcbiAgICBib3Jyb3dlZCBmcm9tIGhlcmU6XG4gICAgaHR0cDovL2h1bW1lci5zdGFuZm9yZC5lZHUvbXVzZWluZm8vZG9jL2V4YW1wbGVzL2h1bWRydW0va2V5c2NhcGUyL2hzaTJyZ2IuY3BwXG4gICAgICovXG4gICAgdmFyIGFyZ3MsIGIsIGcsIHI7XG4gICAgYXJncyA9IHVucGFjayhhcmd1bWVudHMpO1xuICAgIGggPSBhcmdzWzBdLCBzID0gYXJnc1sxXSwgaSA9IGFyZ3NbMl07XG4gICAgaCAvPSAzNjA7XG4gICAgaWYgKGggPCAxIC8gMykge1xuICAgICAgYiA9ICgxIC0gcykgLyAzO1xuICAgICAgciA9ICgxICsgcyAqIGNvcyhUV09QSSAqIGgpIC8gY29zKFBJVEhJUkQgLSBUV09QSSAqIGgpKSAvIDM7XG4gICAgICBnID0gMSAtIChiICsgcik7XG4gICAgfSBlbHNlIGlmIChoIDwgMiAvIDMpIHtcbiAgICAgIGggLT0gMSAvIDM7XG4gICAgICByID0gKDEgLSBzKSAvIDM7XG4gICAgICBnID0gKDEgKyBzICogY29zKFRXT1BJICogaCkgLyBjb3MoUElUSElSRCAtIFRXT1BJICogaCkpIC8gMztcbiAgICAgIGIgPSAxIC0gKHIgKyBnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaCAtPSAyIC8gMztcbiAgICAgIGcgPSAoMSAtIHMpIC8gMztcbiAgICAgIGIgPSAoMSArIHMgKiBjb3MoVFdPUEkgKiBoKSAvIGNvcyhQSVRISVJEIC0gVFdPUEkgKiBoKSkgLyAzO1xuICAgICAgciA9IDEgLSAoZyArIGIpO1xuICAgIH1cbiAgICByID0gbGltaXQoaSAqIHIgKiAzKTtcbiAgICBnID0gbGltaXQoaSAqIGcgKiAzKTtcbiAgICBiID0gbGltaXQoaSAqIGIgKiAzKTtcbiAgICByZXR1cm4gW3IgKiAyNTUsIGcgKiAyNTUsIGIgKiAyNTUsIGFyZ3MubGVuZ3RoID4gMyA/IGFyZ3NbM10gOiAxXTtcbiAgfTtcblxuICByZ2IyaHNpID0gZnVuY3Rpb24oKSB7XG5cbiAgICAvKlxuICAgIGJvcnJvd2VkIGZyb20gaGVyZTpcbiAgICBodHRwOi8vaHVtbWVyLnN0YW5mb3JkLmVkdS9tdXNlaW5mby9kb2MvZXhhbXBsZXMvaHVtZHJ1bS9rZXlzY2FwZTIvcmdiMmhzaS5jcHBcbiAgICAgKi9cbiAgICB2YXIgYiwgZywgaCwgaSwgbWluLCByLCByZWYsIHM7XG4gICAgcmVmID0gdW5wYWNrKGFyZ3VtZW50cyksIHIgPSByZWZbMF0sIGcgPSByZWZbMV0sIGIgPSByZWZbMl07XG4gICAgVFdPUEkgPSBNYXRoLlBJICogMjtcbiAgICByIC89IDI1NTtcbiAgICBnIC89IDI1NTtcbiAgICBiIC89IDI1NTtcbiAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKTtcbiAgICBpID0gKHIgKyBnICsgYikgLyAzO1xuICAgIHMgPSAxIC0gbWluIC8gaTtcbiAgICBpZiAocyA9PT0gMCkge1xuICAgICAgaCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGggPSAoKHIgLSBnKSArIChyIC0gYikpIC8gMjtcbiAgICAgIGggLz0gTWF0aC5zcXJ0KChyIC0gZykgKiAociAtIGcpICsgKHIgLSBiKSAqIChnIC0gYikpO1xuICAgICAgaCA9IE1hdGguYWNvcyhoKTtcbiAgICAgIGlmIChiID4gZykge1xuICAgICAgICBoID0gVFdPUEkgLSBoO1xuICAgICAgfVxuICAgICAgaCAvPSBUV09QSTtcbiAgICB9XG4gICAgcmV0dXJuIFtoICogMzYwLCBzLCBpXTtcbiAgfTtcblxuICBjaHJvbWEuaHNpID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChmdW5jdGlvbihmdW5jLCBhcmdzLCBjdG9yKSB7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIGNoaWxkID0gbmV3IGN0b3IsIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY2hpbGQsIGFyZ3MpO1xuICAgICAgcmV0dXJuIE9iamVjdChyZXN1bHQpID09PSByZXN1bHQgPyByZXN1bHQgOiBjaGlsZDtcbiAgICB9KShDb2xvciwgc2xpY2UuY2FsbChhcmd1bWVudHMpLmNvbmNhdChbJ2hzaSddKSwgZnVuY3Rpb24oKXt9KTtcbiAgfTtcblxuICBfaW5wdXQuaHNpID0gaHNpMnJnYjtcblxuICBDb2xvci5wcm90b3R5cGUuaHNpID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHJnYjJoc2kodGhpcy5fcmdiKTtcbiAgfTtcblxuICBpbnRlcnBvbGF0ZV9oc3ggPSBmdW5jdGlvbihjb2wxLCBjb2wyLCBmLCBtKSB7XG4gICAgdmFyIGRoLCBodWUsIGh1ZTAsIGh1ZTEsIGxidiwgbGJ2MCwgbGJ2MSwgcmVzLCBzYXQsIHNhdDAsIHNhdDEsIHh5ejAsIHh5ejE7XG4gICAgaWYgKG0gPT09ICdoc2wnKSB7XG4gICAgICB4eXowID0gY29sMS5oc2woKTtcbiAgICAgIHh5ejEgPSBjb2wyLmhzbCgpO1xuICAgIH0gZWxzZSBpZiAobSA9PT0gJ2hzdicpIHtcbiAgICAgIHh5ejAgPSBjb2wxLmhzdigpO1xuICAgICAgeHl6MSA9IGNvbDIuaHN2KCk7XG4gICAgfSBlbHNlIGlmIChtID09PSAnaHNpJykge1xuICAgICAgeHl6MCA9IGNvbDEuaHNpKCk7XG4gICAgICB4eXoxID0gY29sMi5oc2koKTtcbiAgICB9IGVsc2UgaWYgKG0gPT09ICdsY2gnIHx8IG0gPT09ICdoY2wnKSB7XG4gICAgICBtID0gJ2hjbCc7XG4gICAgICB4eXowID0gY29sMS5oY2woKTtcbiAgICAgIHh5ejEgPSBjb2wyLmhjbCgpO1xuICAgIH1cbiAgICBpZiAobS5zdWJzdHIoMCwgMSkgPT09ICdoJykge1xuICAgICAgaHVlMCA9IHh5ejBbMF0sIHNhdDAgPSB4eXowWzFdLCBsYnYwID0geHl6MFsyXTtcbiAgICAgIGh1ZTEgPSB4eXoxWzBdLCBzYXQxID0geHl6MVsxXSwgbGJ2MSA9IHh5ejFbMl07XG4gICAgfVxuICAgIGlmICghaXNOYU4oaHVlMCkgJiYgIWlzTmFOKGh1ZTEpKSB7XG4gICAgICBpZiAoaHVlMSA+IGh1ZTAgJiYgaHVlMSAtIGh1ZTAgPiAxODApIHtcbiAgICAgICAgZGggPSBodWUxIC0gKGh1ZTAgKyAzNjApO1xuICAgICAgfSBlbHNlIGlmIChodWUxIDwgaHVlMCAmJiBodWUwIC0gaHVlMSA+IDE4MCkge1xuICAgICAgICBkaCA9IGh1ZTEgKyAzNjAgLSBodWUwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGggPSBodWUxIC0gaHVlMDtcbiAgICAgIH1cbiAgICAgIGh1ZSA9IGh1ZTAgKyBmICogZGg7XG4gICAgfSBlbHNlIGlmICghaXNOYU4oaHVlMCkpIHtcbiAgICAgIGh1ZSA9IGh1ZTA7XG4gICAgICBpZiAoKGxidjEgPT09IDEgfHwgbGJ2MSA9PT0gMCkgJiYgbSAhPT0gJ2hzdicpIHtcbiAgICAgICAgc2F0ID0gc2F0MDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFpc05hTihodWUxKSkge1xuICAgICAgaHVlID0gaHVlMTtcbiAgICAgIGlmICgobGJ2MCA9PT0gMSB8fCBsYnYwID09PSAwKSAmJiBtICE9PSAnaHN2Jykge1xuICAgICAgICBzYXQgPSBzYXQxO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBodWUgPSBOdW1iZXIuTmFOO1xuICAgIH1cbiAgICBpZiAoc2F0ID09IG51bGwpIHtcbiAgICAgIHNhdCA9IHNhdDAgKyBmICogKHNhdDEgLSBzYXQwKTtcbiAgICB9XG4gICAgbGJ2ID0gbGJ2MCArIGYgKiAobGJ2MSAtIGxidjApO1xuICAgIHJldHVybiByZXMgPSBjaHJvbWFbbV0oaHVlLCBzYXQsIGxidik7XG4gIH07XG5cbiAgX2ludGVycG9sYXRvcnMgPSBfaW50ZXJwb2xhdG9ycy5jb25jYXQoKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW4sIG8sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSBbJ2hzdicsICdoc2wnLCAnaHNpJywgJ2hjbCcsICdsY2gnXTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChvID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgbyA8IGxlbjsgbysrKSB7XG4gICAgICBtID0gcmVmW29dO1xuICAgICAgcmVzdWx0cy5wdXNoKFttLCBpbnRlcnBvbGF0ZV9oc3hdKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH0pKCkpO1xuXG4gIGludGVycG9sYXRlX251bSA9IGZ1bmN0aW9uKGNvbDEsIGNvbDIsIGYsIG0pIHtcbiAgICB2YXIgbjEsIG4yO1xuICAgIG4xID0gY29sMS5udW0oKTtcbiAgICBuMiA9IGNvbDIubnVtKCk7XG4gICAgcmV0dXJuIGNocm9tYS5udW0objEgKyAobjIgLSBuMSkgKiBmLCAnbnVtJyk7XG4gIH07XG5cbiAgX2ludGVycG9sYXRvcnMucHVzaChbJ251bScsIGludGVycG9sYXRlX251bV0pO1xuXG4gIGludGVycG9sYXRlX2xhYiA9IGZ1bmN0aW9uKGNvbDEsIGNvbDIsIGYsIG0pIHtcbiAgICB2YXIgcmVzLCB4eXowLCB4eXoxO1xuICAgIHh5ejAgPSBjb2wxLmxhYigpO1xuICAgIHh5ejEgPSBjb2wyLmxhYigpO1xuICAgIHJldHVybiByZXMgPSBuZXcgQ29sb3IoeHl6MFswXSArIGYgKiAoeHl6MVswXSAtIHh5ejBbMF0pLCB4eXowWzFdICsgZiAqICh4eXoxWzFdIC0geHl6MFsxXSksIHh5ejBbMl0gKyBmICogKHh5ejFbMl0gLSB4eXowWzJdKSwgbSk7XG4gIH07XG5cbiAgX2ludGVycG9sYXRvcnMucHVzaChbJ2xhYicsIGludGVycG9sYXRlX2xhYl0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiaW1wb3J0IHsgQXVkaW9Db250ZXh0LCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBjaHJvbWEgZnJvbSAnY2hyb21hLWpzJztcblxuLyogRnVuY3Rpb25zICovXG5cbmZ1bmN0aW9uIHJlc2l6ZUNhbnZhcyAoY2FudmFzKSB7XG4gIHZhciBkaXNwbGF5V2lkdGggID0gY2FudmFzLmNsaWVudFdpZHRoO1xuICB2YXIgZGlzcGxheUhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQ7XG5cbiAgaWYgKGNhbnZhcy53aWR0aCAhPT0gZGlzcGxheVdpZHRoIHx8IGNhbnZhcy5oZWlnaHQgIT09IGRpc3BsYXlIZWlnaHQpIHtcbiAgICBjYW52YXMud2lkdGggID0gZGlzcGxheVdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBkaXNwbGF5SGVpZ2h0O1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRBdWRpbyAoY29udGV4dCwgc291cmNlTm9kZSwgdXJsKSB7XG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cbiAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgY29udGV4dC5kZWNvZGVBdWRpb0RhdGEoXG4gICAgICByZXF1ZXN0LnJlc3BvbnNlLFxuICAgICAgZnVuY3Rpb24gKGJ1ZmZlcikgeyBzb3VyY2VOb2RlLmJ1ZmZlciA9IGJ1ZmZlcjsgfSxcbiAgICAgIGZ1bmN0aW9uIChlcnJvcikgeyBjb25zb2xlLmxvZyhlcnJvcik7IH1cbiAgICApO1xuICB9O1xuICByZXF1ZXN0LnNlbmQoKTtcbn1cblxuZnVuY3Rpb24gcGxheVNvdW5kIChzb3VyY2VOb2RlKSB7XG4gIHNvdXJjZU5vZGUuc3RhcnQoMCk7XG59XG5cbmZ1bmN0aW9uIHNldHVwQXVkaW9Ob2RlcyAoY29udGV4dCkge1xuICAvKipcbiAgICogY29udGV4dC5kZXN0aW5hdGlvbiBpcyBhIHNwZWNpYWwgbm9kZSB0aGF0IGlzIGFzc29jaWF0ZWRcbiAgICogd2l0aCB0aGUgZGVmYXVsdCBhdWRpbyBvdXRwdXQgb2YgeW91ciBzeXN0ZW1cbiAgICovXG4gIHZhciBzb3VyY2VOb2RlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgc291cmNlTm9kZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gIHZhciBhbmFseXNlck5vZGUgPSBjb250ZXh0LmNyZWF0ZUFuYWx5c2VyKCk7XG4gIGFuYWx5c2VyTm9kZS5mZnRTaXplID0gMTAyNDtcblxuICBzb3VyY2VOb2RlLmNvbm5lY3QoYW5hbHlzZXJOb2RlKTtcblxuICByZXR1cm4ge1xuICAgIHNvdXJjZU5vZGU6IHNvdXJjZU5vZGUsXG4gICAgYW5hbHlzZXJOb2RlOiBhbmFseXNlck5vZGVcbiAgfTtcbn1cblxuZnVuY3Rpb24gdmlzdWFsaXplICgpIHtcbiAgLy8gYXVkaW8gY29udGV4dCB2YXJpYWJsZXNcbiAgdmFyIGNvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG4gIHZhciBub2RlcyA9IHNldHVwQXVkaW9Ob2Rlcyhjb250ZXh0KTtcbiAgdmFyIGJ1ZmZlckxlbmd0aCA9IG5vZGVzLmFuYWx5c2VyTm9kZS5mcmVxdWVuY3lCaW5Db3VudDtcbiAgdmFyIGZyZXF1ZW5jeUFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyTGVuZ3RoKTtcblxuICAvLyBjYW52YXMgdmFyaWFibGVzXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FudmFzJyk7XG4gIHZhciBjYW52YXNDdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICByZXNpemVDYW52YXMoY2FudmFzKTtcbiAgdmFyIHdpZHRoID0gY2FudmFzLndpZHRoO1xuICB2YXIgaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcblxuICB2YXIgdGVtcENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICB2YXIgdGVtcENhbnZhc0N0eCA9IHRlbXBDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGVtcENhbnZhcy53aWR0aCA9IHdpZHRoO1xuICB0ZW1wQ2FudmFzLmhlaWdodCA9IGhlaWdodDtcblxuICBjYW52YXNDdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gIGNhbnZhc0N0eC5maWxsU3R5bGUgPSAncmdiKDAsIDAsIDApJztcbiAgY2FudmFzQ3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gIHZhciBjZWxsSGVpZ2h0ID0gYnVmZmVyTGVuZ3RoIC8gaGVpZ2h0O1xuXG4gIC8vIG1ha2UgYSBjb2xvciBzY2FsZVxuICB2YXIgc2NhbGUgPSBjaHJvbWEuc2NhbGUoWycjMDAwMDAwJywgJyNmZjAwMDAnLCAnI2ZmZmYwMCcsICcjZmZmZmZmJ10pLmRvbWFpbihbMCwgMjU1XSkubW9kZSgncmdiJyk7XG5cbiAgZnVuY3Rpb24gZHJhdyAoKSB7XG4gICAgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpO1xuICAgIHJlc2l6ZUNhbnZhcyhjYW52YXMpO1xuICAgIHdpZHRoID0gdGVtcENhbnZhcy53aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICBoZWlnaHQgPSB0ZW1wQ2FudmFzLmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG5cbiAgICB0ZW1wQ2FudmFzQ3R4LmRyYXdJbWFnZShjYW52YXMsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgbm9kZXMuYW5hbHlzZXJOb2RlLmdldEJ5dGVGcmVxdWVuY3lEYXRhKGZyZXF1ZW5jeUFycmF5KTtcblxuICAgIGZyZXF1ZW5jeUFycmF5LmZvckVhY2goZnVuY3Rpb24gKGZyZXF1ZW5jeSwgaSkge1xuICAgICAgY2FudmFzQ3R4LmZpbGxTdHlsZSA9IHNjYWxlKGZyZXF1ZW5jeSkuaGV4KCk7XG4gICAgICBjYW52YXNDdHguZmlsbFJlY3Qod2lkdGggLSAxLCBoZWlnaHQgLSBpLCAxLCBjZWxsSGVpZ2h0KTtcbiAgICB9KTtcblxuICAgIGNhbnZhc0N0eC50cmFuc2xhdGUoLTEsIDApO1xuXG4gICAgY2FudmFzQ3R4LmRyYXdJbWFnZSh0ZW1wQ2FudmFzLCAwLCAwLCB3aWR0aCwgaGVpZ2h0LCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIGNhbnZhc0N0eC50cmFuc2xhdGUoMSwgMCk7XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhdyk7XG4gIH1cblxuICBsb2FkQXVkaW8oY29udGV4dCwgbm9kZXMuc291cmNlTm9kZSwgJ3NvdW5kcy9zdW5kYXlfY2FuZHkubXAzJyk7XG4gIHBsYXlTb3VuZChub2Rlcy5zb3VyY2VOb2RlKTtcbiAgZHJhdygpO1xufVxuXG52aXN1YWxpemUoKTtcblxuIiwiZXhwb3J0IGxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBnbG9iYWwucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IChmdW5jdGlvbiAoKSB7XG4gIHJldHVybiAgZ2xvYmFsLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGdsb2JhbC5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICBnbG9iYWwub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGdsb2JhbC5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgZ2xvYmFsLnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCk7XG4gICAgICAgICAgfTtcbn0pKCk7XG5cbmV4cG9ydCBsZXQgQXVkaW9Db250ZXh0ID0gZ2xvYmFsLkF1ZGlvQ29udGV4dCB8fCBnbG9iYWwud2Via2l0QXVkaW9Db250ZXh0O1xuZXhwb3J0IGxldCBPZmZsaW5lQXVkaW9Db250ZXh0ID0gZ2xvYmFsLk9mZmxpbmVBdWRpb0NvbnRleHQgfHwgZ2xvYmFsLndlYmtpdE9mZmxpbmVBdWRpb0NvbnRleHQ7XG4iXX0=
