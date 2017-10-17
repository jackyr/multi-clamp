# multi-clamp [![npm](https://img.shields.io/npm/v/multi-clamp.svg?style=flat-square)](https://www.npmjs.com/package/multi-clamp)
Simple, efficient and easy-to-use multiline text clamp module. (supports reverse clamp)

## Samples
- Default multiline text clamp:

![Default multiline text clamp](https://raw.githubusercontent.com/jackyr/multi-clamp/master/example/sample1.png)

- Custom ellipsis:

![Custom ellipsis](https://raw.githubusercontent.com/jackyr/multi-clamp/master/example/sample2.png)

- Resverse clamp:

![Resversed clamp](https://raw.githubusercontent.com/jackyr/multi-clamp/master/example/sample3.png)

[Demo Page](https://jackyr.github.io/multi-clamp/example/index.html)

## Browser compatibility
Supports IE8+ / Android4+ / IOS6+ / modern browsers

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
#### `ellipsis`: string
Ellipsis can be simple string or HTML string. default: '...'

#### `clamp`: number
The max number of lines to show. default: 3

#### `reverse`: boolean
You can clamp the content from back to front, the ellipsis will be in the front. default: false

#### `splitByWords`: boolean
The default behavior is to split by letters. If you want to split by words, set splitByWords to true. default: false

#### `disableCssClamp`: boolean
Multi-clamp will use native css clamp(-webkit-line-clamp) in supported browser when the ellipsis is set to '...'. If you don't want to use css clamp, set disableCssClamp to true. default: false

## License
MIT