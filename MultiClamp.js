'use strict';
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.MultiClamp = root.MultiClamp || factory();
  }
}(this, function() {
  function int(str) {
    return parseInt(str, 10);
  }
  function num(str) {
    return (str + '').replace(/[^\d.]/g, '') - 0;
  }
  function setText(elm, text) {
    return elm.textContent ? elm.textContent = text : elm.innerText = text;
  }
  function getText(elm) {
    return elm.textContent ? elm.textContent : elm.innerText;
  }
  function getStyle(elm, style) {
    if (window.getComputedStyle) return window.getComputedStyle(elm, null).getPropertyValue(style);
    return elm.currentStyle.getAttribute(style.replace(/-(\w)/g, function(v, v1) {
      return v1.toUpperCase();
    }));
  }
  function getHeight(elm) {
    var height = getStyle(elm, 'height');
    if (height.indexOf('px') > -1) return num(height);
    return num(elm.clientHeight) - num(getStyle(elm, 'padding-top')) - num(getStyle(elm, 'padding-bottom'));
  }

  var MultiClamp = function(element, option) {
    if (!element) return;
    this.element = element.length ? element[0] : element;
    var _option = option || {};

    this.option = {
      ellipsis: 'ellipsis' in _option ? _option.ellipsis : '...',
      clamp: 'clamp' in _option ? int(_option.clamp) : 3,
      reverse: 'reverse' in _option ? !!_option.reverse : false,
      splitByWords: 'splitByWords' in _option ? !!_option.splitByWords : false,
      disableCssClamp: 'disableCssClamp' in _option ? !!_option.disableCssClamp : false,
      lineTextLen: _option.lineTextLen,
    };

    if (isNaN(this.option.clamp) || this.option.clamp < 1) {
      throw new Error('Invaild clamp number!');
    }
    
    this.hasCssClamp = !this.option.disableCssClamp
      && !this.option.reverse
      && this.option.ellipsis === '...'
      && typeof document.body.style.webkitLineClamp !== 'undefined';

    this.init();
    this.clamp();
  };
  MultiClamp.prototype = {
    constructor: MultiClamp,
    refresh: function() {
      this.init();
      this.clamp();
    },
    init: function() {
      if (this.hasCssClamp) {
        var cssClampStyle = {
          display: '-webkit-box',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          WebkitLineClamp: this.option.clamp,
          WebkitBoxOrient: 'vertical'
        };
        for (var i in cssClampStyle) {
          this.element.style[i] = cssClampStyle[i];
        }
      } else {
        this.ellipsis = document.createElement('span');
        this.ellipsis.style.display = 'none';
        this.ellipsis.innerHTML = this.option.ellipsis;
        this.content = document.createElement('span');
        setText(this.content, getText(this.element));
        this.element.innerHTML = '';
        if (this.option.reverse) {
          this.element.appendChild(this.ellipsis);
          this.element.appendChild(this.content);
        } else {
          this.element.appendChild(this.content);
          this.element.appendChild(this.ellipsis);
        }
      }
    },
    getSingleLineHeight: function() {  
      var lineHeight = getStyle(this.element, 'line-height');
      var self = this;

      if (lineHeight.indexOf('px') > -1) {
        return num(lineHeight);
      } else if (!isNaN(lineHeight)) {
        var fontSize = getStyle(this.element, 'font-size');
        if (fontSize.indexOf('px') > -1) return num(fontSize) * (lineHeight * 100) / 100;
        if (fontSize.indexOf('pt') > -1) return num(fontSize) * 400 / 300 * (lineHeight * 100) / 100;
        return createSingleLineAndGetHeight();
      } else {
        return createSingleLineAndGetHeight();
      }

      function createSingleLineAndGetHeight() {
        var tempText = getText(self.content);
        setText(self.content, '.');
        var height = getHeight(self.element);
        setText(self.content, tempText);
        return height;
      }
    },
    clamp: function() {
      var text = getText(this.element);
      if (text === '' || this.hasCssClamp) return;

      var currentHeight = getHeight(this.element);
      var singleLineHeight = this.getSingleLineHeight();
      if (!currentHeight || !singleLineHeight) return;
      
      var maxHeight = singleLineHeight * this.option.clamp;
      var defaultIncrease = (this.option.lineTextLen || Math.min(20, text.length / this.option.clamp)) * this.option.clamp;

      if (currentHeight > maxHeight) {
        this.ellipsis.style.display = '';
        var trunk = this.option.splitByWords ? text.match(/\w+|\W+?/g) : text;
        this.trunkSlice(trunk, maxHeight, defaultIncrease, 0, false);
      } else {
        this.ellipsis.style.display = 'none';
      }
    },
    trunkSlice: function(trunk, maxHeight, increase, len, isDecrease) {
      var slicedTrunk = this.option.reverse ? trunk.slice(trunk.length - len) : trunk.slice(0, len);
  
      setText(this.content, this.option.splitByWords ? slicedTrunk.join('') : slicedTrunk);
  
      var i;
      if (getHeight(this.element) > maxHeight) {
        i = isDecrease ? increase : int(increase / 2) || 1;
        this.trunkSlice(trunk, maxHeight, i, len - i, true);
      } else {
        if (increase === 1 && isDecrease) {
          if (this.option.splitByWords && /\s/.test(slicedTrunk[this.option.reverse ? 0 : slicedTrunk.length - 1])) {
            setText(this.content, (this.option.reverse ? slicedTrunk.slice(1) : slicedTrunk.slice(0, slicedTrunk.length - 1)).join(''));
          }
          return;
        }
        i = isDecrease ? int(increase / 2) || 1 : increase;
        this.trunkSlice(trunk, maxHeight, i, len + i, false);
      }
    }
  };
  return MultiClamp;
}));
