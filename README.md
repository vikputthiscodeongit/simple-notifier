# Simple Notifier
[![npm](https://img.shields.io/npm/v/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)
[![npm - downloads per month](https://img.shields.io/npm/dm/@codebundlesbyvik/simple-notifier)](https://img.shields.io/npm/dm/@codebundlesbyvik/simple-notifier)

A lightweight and easy to use notification library, written using modern ECMAScript features.

<br>

## Table of Contents
1. [Nice features](#nice-features)
2. [Basic usage](#basic-usage)
3. [Browser support](#browser-support)
4. [Installation](#installation)
    * I.  [Usage with a module bundler like Webpack](#usage-with-a-module-bundler-like-webpack)
    * II. [Usage as a standalone ES6 module](#usage-as-a-standalone-es6-module)
5. [Options](#options)
    * [JavaScript](#javascript)
    * [Sass](#sass)
6. [Methods](#methods)
7. [License](#license)

<br>

## Nice features

* An instance allows either at most a single notification to be shown on screen, or multiple simultaneously.
* Flexible positioning.
* Check out the [options](#options) for more!

<br>

## Basic usage
``` javascript
const notifier = new SimpleNotifier();

notifier.init();

// Wrapper element is inserted at the top of <body>.
// <div class="simple-notifier simple-notifier--pos-y-top simple-notifier--pos-x-center">
// </div>


const message = "This is an example message.";
const type = "success";

notifier.show(message, type);

// Notification is shown for 3500 ms.
```

<br>

## Browser support

This library is written as an ES6 module.

The distributables are built with Webpack, utilizing [Babel](https://github.com/babel/babel) and [Autoprefixer](https://github.com/postcss/autoprefixer) in the process. The following [`browserslist`](https://github.com/browserslist/browserslist) is used:
```
"since 2019-01 and > 0.5%",
"last 2 versions and not dead",
"Firefox ESR",
"not Explorer >= 0",
"not OperaMini all"
```

ES2022 & CSS3 features are used in the source. <strong>Make sure to include a JavaScript transpiler in your own project and use it in conjunction with a reasonable `browserslist` should you choose to include the JavaScript source file instead of the distributable, else the browser support may be mediocre.</strong>

<br>

## Installation
### Usage with a module bundler like Webpack

```
// Install from npm
npm install @codebundlesbyvik/simple-notifier
```

<br>

``` javascript
// Import the module
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";

// ... if your project doesn't utilize a JavaScript transpiler, import the distributable (see "Browser support" for details).
import SimpleNotifier from "@codebundlesbyvik/simple-notifier/dist/simple-notifier";
```

<br>

``` scss
// Import the stylesheet
@import "@codebundlesbyvik/simple-notifier";
// Will import the Sass file if your project utilizes Sass, should automatically import the compiled CSS file otherwise.
```

### Usage as a standalone ES6 module

[Download the latest release](https://github.com/vikputthiscodeongit/simple-notifier/releases/latest) and include the distributables on the target page.

``` html
<!-- Import the module -->
<script type="module">
    import SimpleNotifier from "./dist/simple-notifier.js";

    // Code (see "Basic usage")
</script>
```

<br>

```
// Link to the stylesheet in HTML ...
<link href="./dist/simple-notifier.css" rel="stylesheet">

// ... or import it in your main CSS file.
@import "./dist/simple-notifier.css";
```

<br>

## Options
### JavaScript

Options should be passed in as an object on instance creation.

| Parameter             | Type                 | Default         | Description                                                                                                                                                   |
| --------------------- | -------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoHide`            | `Number` / `Boolean` | `3500`          | Time in milliseconds after which `.hide()` will be automatically called. `true` defaults to `3500`, set to `false` or `0` to make the notification(s) sticky. |
| `onlyOneNotification` | `Boolean`            | `true`          | Whether the instance is allowed to show multiple notifications on screen simultaneously or not.                                                               |
| `parentEl`            | `Element`            | `document.body` | Instance's parent element.                                                                                                                                    |
| `position`            | `String`             | `top center`    | On-page position of the wrapper element. Accepted value is a combination of `top` or `bottom` and `left`, `center` or `right`.                                |
| `animations`          | `String` / `Boolean` | `"auto"`        | Animation preference. `"auto"` checks user's device motion preference on each action.                                                                         |

### Sass

Colors can be customized using Sass variables.

| Variable name             | Type   | Description                                              |
| ------------------------- | ------ | -------------------------------------------------------- |
| `$notifier-color-opacity` | Number | Opacity applied to the defined colors. Default is `0.9`. |
| `$notifier-colors`        | Map    | Used colors.                                             |
| `$notifier-types`         | Map    | Notification types.                                      |
| `$notifier-text-colors`   | Map    | Text color to use with given notification type.          |
| `$notifier-bg-colors`     | Map    | Background color to use with given notification type.    |

<br>

## Methods

### `.init()`

Initialize a `SimpleNotifier` instance.

<br>

### `.show(text, type)`

Show a notification.

#### Parameters

| Parameter | Type     | Default                                             | Description                                                                                                  |
| --------- | -------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `text`    | `String` | Some dummy text.                                    | Text to show.                                                                                                |
| `type`    | `String` | `"dummy"` if `text` is `undefined`, else `"default"`| Element's parent. Will be added as class ([BEM modifier](http://getbem.com/naming/)) to the wrapper element. |

<br>

### `.hide(notificationId)`

Hide a currently shown notification.

If `onlyOneNotification` is set to `true`, passing in a `notificationId` is not required.

If `onlyOneNotification` is set to `false`, passing in a `notificationId` will hide that specific notification. Not passing in any `notificationId` will hide all currently shown notifications.

<br>

### `.destroy()`

TBD

Destroy a `SimpleNotifier` instance.

<br>

## License

MIT © [Viktor Chin-Kon-Sung](https://github.com/vikputthiscodeongit)
