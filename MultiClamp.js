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
  function accFix (num) {
    return Math.round(num * 100) / 100;
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
    return accFix(num(elm.clientHeight) - num(getStyle(elm, 'padding-top')) - num(getStyle(elm, 'padding-bottom')));
  }
  function getElement(html) {
    if (/^<[\w\W]+>$/.test(html)) {
      var tempNode = document.createElement('div');
      tempNode.innerHTML = html;
      return tempNode.firstElementChild || tempNode.firstChild;
    } else {
      return html;
    }
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
  };
  MultiClamp.prototype = {
    constructor: MultiClamp,
    reload: function() {
      this.init();
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
        this.contentHtml = this.element.innerHTML;
        this.contentText = getText(this.element);
        this.ellipsis = getElement(this.option.ellipsis);
        this.clamp();
      }
    },
    getSingleLineHeight: function() {  
      var lineHeight = getStyle(this.element, 'line-height');
      var self = this;

      if (lineHeight.indexOf('px') > -1) {
        return num(lineHeight);
      } else if (!isNaN(lineHeight)) {
        var fontSize = getStyle(this.element, 'font-size');
        if (fontSize.indexOf('px') > -1) return accFix(num(fontSize) * lineHeight);
        if (fontSize.indexOf('pt') > -1) return accFix(num(fontSize) * 4 / 3 * lineHeight);
        return createSingleLineAndGetHeight();
      } else {
        return createSingleLineAndGetHeight();
      }

      function createSingleLineAndGetHeight() {
        self.element.innerHTML = '.';
        var height = getHeight(self.element);
        self.element.innerHTML = self.contentHtml;
        return height;
      }
    },
    clamp: function() {
      var self = this;
      var singleLineHeight, currentHeight, maxHeight;

      singleLineHeight = this.getSingleLineHeight();

      if (this.contentText === '' || !singleLineHeight) {
        doNotNeedToClamp();
        return;
      }

      if (this.autoClamp) {
        maxHeight = getHeight(this.element);
        this.option.clamp = int(maxHeight / singleLineHeight);
        this.originalHeightStyle = this.element.style.height;
        this.element.style.height = 'auto';
      } else {
        maxHeight = accFix(singleLineHeight * this.option.clamp);
      }

      currentHeight = getHeight(this.element);

      if (!currentHeight || !maxHeight || currentHeight <= maxHeight) {
        if (this.autoClamp) this.element.style.height = this.originalHeightStyle;
        doNotNeedToClamp();
        return;
      }

      var onClampStartReturnValue = this.option.onClampStart.call(this, {
        needClamp: true
      });

      if (onClampStartReturnValue === undefined || !!onClampStartReturnValue) {
        var trunk = this.option.splitByWords ? this.contentText.match(/\w+|\W+?/g) : this.contentText;
        var defaultIncrease = int(this.option.lineTextLen || Math.min(20, this.contentText.length / this.option.clamp)) * this.option.clamp;

        this.trunkSlice(trunk, maxHeight, defaultIncrease, defaultIncrease, false);

        if (this.autoClamp) this.element.style.height = this.originalHeightStyle;

        this.option.onClampEnd.call(this, {
          didClamp: true
        });
      } else {
        if (this.autoClamp) this.element.style.height = this.originalHeightStyle;
        doNotNeedToClamp(true);
      }

      function doNotNeedToClamp(isForcePrevent) {
        if (!isForcePrevent) self.option.onClampStart.call(self, {
          needClamp: false
        });
        self.option.onClampEnd.call(self, {
          didClamp: false
        });
      }
    },
    trunkSlice: function(trunk, maxHeight, increase, len, isDecrease) {
      var self = this;
      var slicedTrunk = this.option.reverse ? trunk.slice(trunk.length - len) : trunk.slice(0, len);

      fill(this.option.splitByWords ? slicedTrunk.join('') : slicedTrunk);
  
      var i;
      if (getHeight(this.element) > maxHeight) {
        i = isDecrease ? increase : int(increase / 2) || 1;
        this.trunkSlice(trunk, maxHeight, i, len - i, true);
      } else {
        if (increase === 1 && isDecrease) {
          if (this.option.splitByWords && /\s/.test(slicedTrunk[this.option.reverse ? 0 : slicedTrunk.length - 1])) {
            fill((this.option.reverse ? slicedTrunk.slice(1) : slicedTrunk.slice(0, slicedTrunk.length - 1)).join(''));
          }
          return;
        }
        i = isDecrease ? int(increase / 2) || 1 : increase;
        this.trunkSlice(trunk, maxHeight, i, len + i, false);
      }

      function fill(text) {
        if (typeof self.ellipsis === 'object') {
          setText(self.element, text);
          if (self.option.reverse) {
            self.element.insertBefore(self.ellipsis.cloneNode(true), self.element.firstChild);
          } else {
            self.element.appendChild(self.ellipsis.cloneNode(true));
          } 
        } else {
          if (self.option.reverse) {
            setText(self.element, self.ellipsis + text);
          } else {
            setText(self.element, text + self.ellipsis);
          } 
        }
      }
    },
  };

  return MultiClamp;
}));
