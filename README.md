# Simple Notifier
[![npm](https://img.shields.io/npm/v/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)
[![npm - downloads per week](https://img.shields.io/npm/dw/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)
[![jsdelivr - hits per week](https://img.shields.io/jsdelivr/npm/hw/@codebundlesbyvik/simple-notifier)](https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier)

<br>

A lightweight, easy to use notification library.

<br>

**[Demo page (interactive)](https://rawcdn.githack.com/vikputthiscodeongit/simple-notifier/07b291aa0688c0d92eab0f60c12f8653db14e531/demo.html)**

<br>

## Table of Contents
1. [Nice features](#nice-features)
2. [Basic usage](#basic-usage)
3. [Browser support](#browser-support)
4. [Installation](#installation)
    * I.  [Usage with a module bundler](#usage-with-a-module-bundler)
    * II. [Usage as a standalone package](#usage-as-a-standalone-package)
5. [Options](#options)
    * [JavaScript](#javascript)
    * [Sass](#sass)
6. [Methods](#methods)
7. [Events](#events)
8. [License](#license)

<br>

## Nice features

* An instance allows either at most a single notification to be shown on screen, or multiple simultaneously.
* Flexible positioning.
* Small and lightweight.
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

The distributables are compiled with the following [`browserslist`](https://github.com/browserslist/browserslist):
```
"since 2019-01 and > 0.5%",
"last 2 versions and not dead",
"Firefox ESR",
"not Explorer >= 0",
"not OperaMini all"
```

<br>

## Installation
### Usage with a module bundler

``` shell
// Install package from npm
npm install @codebundlesbyvik/simple-notifier`
```

<br>

``` javascript
// Import the module
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";
```

<br>

``` scss
// Import the stylesheet
@import "@codebundlesbyvik/simple-notifier";
// Will import the Sass file if your project utilizes Sass, should automatically import the compiled CSS file otherwise.
```

<br>

### Usage as a standalone package

#### Via CDN (jsdelivr)

``` html
<!-- Import the UMD bundle -->
<script src="https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier@1.1.2/dist/js/simple-notifier.bundle.min.js" crossorigin="anonymous"></script>
```

<br>

``` html
<!-- Link to the stylesheet -->
<link href="https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier@1.1.2/dist/css/simple-notifier.min.css" rel="stylesheet" crossorigin="anonymous">
```

<br>

#### Local

[Download the latest release](https://github.com/vikputthiscodeongit/simple-notifier/releases/latest) from the GitHub releases page.

``` html
<!-- Import the UMD bundle -->
<script src="./dist/js/simple-notifier.bundle.min.js"></script>
```

<br>

```
// Link to the stylesheet in HTML ...
<link href="./dist/simple-notifier.min.css" rel="stylesheet">

// ... or import it in your main CSS file.
@import "./dist/simple-notifier.min.css";
```

<br>

## Options
### JavaScript

Options should be passed in as an object on instance creation.

| Parameter             | Type                 | Default         | Description                                                                                                                                                   |
| :-------------------- | :------------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `autoHide`            | `Number` / `Boolean` | `3500`          | Time in milliseconds after which `.hide()` will be automatically called. `true` defaults to `3500`, set to `false` or `0` to make the notification(s) sticky. |
| `onlyOneNotification` | `Boolean`            | `true`          | Whether the instance is allowed to show multiple notifications on screen simultaneously or not.                                                               |
| `parentEl`            | `Element`            | `document.body` | Instance's parent element.                                                                                                                                    |
| `position`            | `String`             | `top center`    | On-page position of the wrapper element. Accepted value is a combination of `top` or `bottom` and `left`, `center` or `right`.                                |
| `animations`          | `String` / `Boolean` | `"auto"`        | Animation preference. `"auto"` checks user's device motion preference on each action.                                                                         |

<br>

### Sass

Colors can be customized using Sass variables.

| Variable name             | Type        | Description                                              |
| :------------------------ | :---------- | :------------------------------------------------------- |
| `$notifier-types`         | `Map`       | Notification types.                                      |
| `$notifier-font-size-base`     | `Dimension` | Base `font-size`. Internal sizing is done relative to this value. Default is `1rem`. |
| `$notifier-color-opacity` | `Number`    | Opacity applied to the defined colors. Default is `0.9`. |
| `$notifier-colors`        | `Map`       | Available colors.                                             |
| `$notifier-text-colors`   | `Map`       | Text color to use with given notification type.          |
| `$notifier-bg-colors`     | `Map`       | Background color to use with given notification type.    |

<br>

## Methods

### `.init()`

Initialize a `SimpleNotifier` instance.

<br>

### `.destroy()`

Destroy a `SimpleNotifier` instance.

<br>

### `.show(text, type)`

Show a notification.

#### Parameters

| Parameter | Type     | Default                                             | Description                                                                                                  |
| :-------- | :------- | :-------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| `text`    | `String` | Some dummy text.                                    | Text to show.                                                                                                |
| `type`    | `String` | `"dummy"` if `text` is `undefined`, else `"default"`| Element's parent. Will be added as class ([BEM modifier](http://getbem.com/naming/)) to the wrapper element. |

<br>

### `.hide(notificationId)`

Hide a currently shown notification.

If `onlyOneNotification` is set to `true`, passing in a `notificationId` is not required.

If `onlyOneNotification` is set to `false`, passing in a `notificationId` will hide that specific notification. Not passing in any `notificationId` will hide all currently shown notifications.

<br>

## Events

| Event                       | Fired when ...                                                |
| :------------------------   | :------------------------------------------------------------ |
| `notificationShown`         | The process of showing a notification has fully completed.    |
| `notificationDestroyed`     | The process of destroying a notification has fully completed. |
| `allNotificationsDestroyed` | The last visible notification has been destroyed.             |

<br>

## License

Mozilla Public License 2.0 © [Viktor Chin-Kon-Sung](https://github.com/vikputthiscodeongit)
