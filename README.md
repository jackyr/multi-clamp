# multi-clamp

![NPM](https://img.shields.io/npm/l/multi-clamp)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/multi-clamp)
![npm](https://img.shields.io/npm/dm/multi-clamp)
[![npm](https://img.shields.io/npm/v/multi-clamp)](https://www.npmjs.com/package/multi-clamp)

Simple, efficient and easy-to-use multiline text clamp module. (supports reverse clamp)

For React? See [react-multi-clamp](https://github.com/jackyr/react-multi-clamp)
[![npm](https://img.shields.io/npm/v/react-multi-clamp)](https://www.npmjs.com/package/react-multi-clamp)

## Samples
- Default multiline text clamp:

![Default multiline text clamp](https://raw.githubusercontent.com/jackyr/multi-clamp/master/example/sample1.png)

- Custom ellipsis:

![Custom ellipsis](https://raw.githubusercontent.com/jackyr/multi-clamp/master/example/sample2.png)

- Reverse clamp:

![Reversed clamp](https://raw.githubusercontent.com/jackyr/multi-clamp/master/example/sample3.png)

[Demo Page](https://jackyr.github.io/multi-clamp/example/index.html)

## Browser compatibility
Supports IE8+ / Android4+ / IOS6+ / etc. Almost all of the common browsers on PC / mobile device.

## Installation
You can install multi-clamp from npm:

```sh
npm install multi-clamp --save
```

## Usage
Import multi-clamp.

```js
import MultiClamp from 'multi-clamp';
```

Or use [MultiClamp.min.js](https://raw.githubusercontent.com/jackyr/multi-clamp/master/MultiClamp.min.js) in browser directly.

```html
<script src="./MultiClamp.min.js"></script>
```

Just new the multi-clamp constructor.

```html
<div id="textContainer">...much...long...text...</div>

<script>
new MultiClamp(document.getElementById('textContainer'), {
  ellipsis: '...',
  clamp: 3
});
</script>
```

## Options
#### `ellipsis`: string || element
Ellipsis can be simple string, HTML string or element object. default: '...'

#### `clamp`: number || 'auto'
The max number of lines to show. It will try to fill up the available space when set to string 'auto', and at this point you should set a static height on the text container element. default: 3

#### `reverse`: boolean
You can clamp the content from back to front, the ellipsis will be in the front. default: false

#### `splitByWords`: boolean
The default behavior is to split by letters. If you want to split by words, set splitByWords to true. default: false

#### `disableCssClamp`: boolean
Multi-clamp will use native css clamp(-webkit-line-clamp) in supported browser when the ellipsis is set to '...'. If you don't want to use css clamp, set disableCssClamp to true. default: false

#### `onClampStart`: function({ needClamp: boolean }): void || false v1.1.0+
This callback function will be executed when clamp starts, and will not be executed when use native css clamp. Clamp will be prevented when return value is false. default: function() {}

#### `onClampEnd`: function({ didClamp: boolean }): void v1.1.0+
This callback function will be executed when clamp ends, and will not be executed when use native css clamp. default: function() {}

## Instance method
#### `reload()`
Call this method to re-clamp when the text content or style changes

#### `reload(options)` v2.0.0+
You can change initial options when reloading through the options param, and use the original text to re-clamp when options.useOriginalText set to true. default: { ...initOptions, useOriginalText: false }

## Changelog
#### v2.0.2
- Bugfix when passing element object to option ellipsis. [react-multi-clamp#3](https://github.com/jackyr/react-multi-clamp/issues/3)

#### v2.0.1
- Bugfix. [#6](https://github.com/jackyr/multi-clamp/issues/6)

#### v2.0.0
- Support change initial options and use the original text to re-clamp. [#2](https://github.com/jackyr/multi-clamp/issues/2)
- Refactoring. [#3](https://github.com/jackyr/multi-clamp/issues/3)

#### v1.1.0
-  Add onClampStart and onClampEnd callback functions. [react-multi-clamp#2](https://github.com/jackyr/react-multi-clamp/issues/2)

#### v1.0.3
- Bugfix. [#1](https://github.com/jackyr/multi-clamp/issues/1)

## License
MIT