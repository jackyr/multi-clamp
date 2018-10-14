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
    return 'textContent' in elm ? elm.textContent = text : elm.innerText = text;
  }
  function getText(elm) {
    return 'textContent' in elm ? elm.textContent : elm.innerText;
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
      clamp: 'clamp' in _option ? _option.clamp : 3,
      reverse: 'reverse' in _option ? !!_option.reverse : false,
      splitByWords: 'splitByWords' in _option ? !!_option.splitByWords : false,
      disableCssClamp: 'disableCssClamp' in _option ? !!_option.disableCssClamp : false,
      onClampStart: 'onClampStart' in _option && typeof _option.onClampStart === 'function'
        ? _option.onClampStart : function() {},
      onClampEnd: 'onClampEnd' in _option && typeof _option.onClampEnd === 'function'
        ? _option.onClampEnd : function() {}
    };
    if ('lineTextLen' in _option) this.option.lineTextLen = _option.lineTextLen;
    
    if (this.option.clamp === 'auto') {
      this.autoClamp = true;
    } else {
      this.option.clamp = int(this.option.clamp);
      if (isNaN(this.option.clamp) || this.option.clamp < 1) {
        throw new Error('Invaild clamp number!');
      }
      this.autoClamp = false;
    }

    this.useCssClamp = !this.option.disableCssClamp
      && !this.autoClamp
      && !this.option.reverse
      && !this.option.splitByWords
      && this.option.ellipsis === '...'
      && typeof document.body.style.webkitLineClamp !== 'undefined';

    this.init();
    this.clamp();
  };
  MultiClamp.prototype = {
    constructor: MultiClamp,
    reload: function() {
      this.init();
      this.clamp();
    },
    init: function() {
      if (this.useCssClamp) {
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
        this.wrapper = document.createElement('div');
        setText(this.content, getText(this.element));
        this.element.innerHTML = '';
        this.element.appendChild(this.wrapper);
        if (this.option.reverse) {
          this.wrapper.appendChild(this.ellipsis);
          this.wrapper.appendChild(this.content);
        } else {
          this.wrapper.appendChild(this.content);
          this.wrapper.appendChild(this.ellipsis);
        }
      }
    },
    getSingleLineHeight: function() {  
      var lineHeight = getStyle(this.wrapper, 'line-height');
      var self = this;

      if (lineHeight.indexOf('px') > -1) {
        return num(lineHeight);
      } else if (!isNaN(lineHeight)) {
        var fontSize = getStyle(this.wrapper, 'font-size');
        if (fontSize.indexOf('px') > -1) return num(fontSize) * (lineHeight * 100) / 100;
        if (fontSize.indexOf('pt') > -1) return num(fontSize) * 400 / 300 * (lineHeight * 100) / 100;
        return createSingleLineAndGetHeight();
      } else {
        return createSingleLineAndGetHeight();
      }

      function createSingleLineAndGetHeight() {
        var tempText = getText(self.content);
        setText(self.content, '.');
        var height = getHeight(self.wrapper);
        setText(self.content, tempText);
        return height;
      }
    },
    clamp: function() {
      if (this.useCssClamp) return;
      var self = this;
      var text = getText(this.content);
      var currentHeight = getHeight(this.wrapper);
      var singleLineHeight = this.getSingleLineHeight();
      if (text === '' || !currentHeight || !singleLineHeight) return doNotNeedToClamp();
      
      var maxHeight;
      if (this.autoClamp) {
        maxHeight = getHeight(this.element);
        this.option.clamp = int(maxHeight / singleLineHeight);
      } else {
        maxHeight = singleLineHeight * this.option.clamp;
      }
      if (!maxHeight) return doNotNeedToClamp();

      if (currentHeight > maxHeight) {
        var onClampStartReturnValue = this.option.onClampStart.call(this, {
          needClamp: true
        });
        if (onClampStartReturnValue === undefined || !!onClampStartReturnValue) {
          this.ellipsis.style.display = '';
          var trunk = this.option.splitByWords ? text.match(/\w+|\W+?/g) : text;
          var defaultIncrease = (this.option.lineTextLen || Math.min(20, text.length / this.option.clamp)) * this.option.clamp;
          this.trunkSlice(trunk, maxHeight, defaultIncrease, 0, false);
          this.option.onClampEnd.call(this, {
            didClamp: true
          });
        } else {
          doNotNeedToClamp(true);
        }
      } else {
        doNotNeedToClamp();
      }

      function doNotNeedToClamp(isForcePrevent) {
        if (!isForcePrevent) self.option.onClampStart.call(self, {
          needClamp: false
        });
        self.element.innerHTML = getText(self.content);
        self.clean();
        self.option.onClampEnd.call(self, {
          didClamp: false
        });
      }
    },
    trunkSlice: function(trunk, maxHeight, increase, len, isDecrease) {
      var slicedTrunk = this.option.reverse ? trunk.slice(trunk.length - len) : trunk.slice(0, len);
  
      setText(this.content, this.option.splitByWords ? slicedTrunk.join('') : slicedTrunk);
  
      var i;
      if (getHeight(this.wrapper) > maxHeight) {
        i = isDecrease ? increase : int(increase / 2) || 1;
        this.trunkSlice(trunk, maxHeight, i, len - i, true);
      } else {
        if (increase === 1 && isDecrease) {
          if (this.option.splitByWords && /\s/.test(slicedTrunk[this.option.reverse ? 0 : slicedTrunk.length - 1])) {
            setText(this.content, (this.option.reverse ? slicedTrunk.slice(1) : slicedTrunk.slice(0, slicedTrunk.length - 1)).join(''));
          }
          if (this.option.reverse) {
            this.element.innerHTML = this.ellipsis.innerHTML + getText(this.content);
          } else {
            this.element.innerHTML = getText(this.content) + this.ellipsis.innerHTML;
          }
          this.clean();
          return;
        }
        i = isDecrease ? int(increase / 2) || 1 : increase;
        this.trunkSlice(trunk, maxHeight, i, len + i, false);
      }
    },
    clean: function () {
      this.wrapper = null;
      this.ellipsis = null;
      this.content = null;
      delete this.wrapper;
      delete this.ellipsis;
      delete this.content;
    }
  };
  return MultiClamp;
}));
