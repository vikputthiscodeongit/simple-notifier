# Simple Notifier
[![npm](https://img.shields.io/npm/v/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)
[![npm - downloads per week](https://img.shields.io/npm/dw/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)
[![jsdelivr - hits per week](https://img.shields.io/jsdelivr/npm/hw/@codebundlesbyvik/simple-notifier)](https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier)

<br>

A fully featured yet easy to use & lightweight notification library.

__[Demo page (interactive)](https://rawcdn.githack.com/vikputthiscodeongit/simple-notifier/1db6513f2033fca96313a32b8b246d871987b391/demo.html)__

<br>

## Table of Contents
1. [Unique features](#unique-features)
4. [Usage](#usage)
3. [Browser support](#browser-support)
5. [Options](#options)
    * [JavaScript](#javascript)
    * [Sass](#sass)
6. [Methods](#methods)
    * [.show(textOrOptions, variant?)](#showtextoroptions-variant)
    * [.hide(notificationId)](#hidenotificationid-number)
    * [.hideAll()](#hideall)
    * [.notificationIds (getter)](#notificationids-getter)
7. [Events](#events)
8. [License](#license)

<br>

## Unique features

* Show multiple notifications simultaneously, and/or
* Hide older notifications before showing one or more new notifications.
* Fully accessible.
* Module-based.

Check out [options](#options) for a complete overview of all features.

<br>

## Usage

For this example I assume the main JavaScript file is processed by a module bundler and Sass is installed.

``` shell
// Install package from npm
npm install @codebundlesbyvik/simple-notifier
```

``` scss
// style.scss
@import "@codebundlesbyvik/simple-notifier";
```

``` javascript
// index.js
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";
import "./style.scss";

const notifier = new SimpleNotifier();

// The following element is inserted as the first child of <body>:
// <div class="simple-notifier simple-notifier--position-y-top simple-notifier--position-x-center">
// </div>

const text = "This is an example notification.";
const variant = "success";

notifier.show(text, variant);

// Notification is shown for 4000 ms.
```

If you're not using a module bundler then either [download the latest release from the GitHub releases page](https://github.com/vikputthiscodeongit/simple-notifier/releases/latest) or [load the JavaScript](https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier@2.0.0) [and the CSS](https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier@2.0.0/dist/simple-notifier.css) via the jsdelivr CDN. Then in your HTML link to the CSS stylesheet and import the JavaScript as a module.

<br>

## Browser support

Practically speaking, all browsers released in 2021 and onwards are fully supported.

The newest JavaScript feature used is [static fields](https://caniuse.com/mdn-javascript_classes_static_class_fields).

The CSS distributables are prefixed with the following [`browserslist`](https://github.com/browserslist/browserslist):
```
"> 0.2%",
"last 3 versions and not dead",
"Firefox ESR"
```

<br>

## Options
### JavaScript
#### Instance and notification

These options can be passed in as an object on instance creation (applying to all notifications) as well as when creating a notification, overriding the preference defined on the instance.

| Property        | Type      | Default | Description                                                                                                          |
| :-------------- | :-------- | :------ | :------------------------------------------------------------------------------------------------------------------- |
| `hideAfterTime` | `number`  | `4000`  | Time in milliseconds after which `.hide()` will be called. Set to `0` to disable hiding notifications automatically. |
| `hideOlder`     | `boolean` | `false` | Hide older notifications before showing the one most recently created.                                               |
| `dismissable`   | `boolean` | `false` | Render a close button allowing for manual notification dismissal.                                                    |

#### Instance only

These options can only be passed in as an object on instance creation.

| Property     | Type                                                 | Default             | Description                                                                       |
| :----------- | :--------------------------------------------------- | :------------------ | :-------------------------------------------------------------------------------- |
| `parentEl`   | `HTMLElement`                                        | `document.body`     | HTML element in which the instance's element will be inserted as first child.     |
| `position`   | `["top" \| "bottom", "left" \| "center" \| "right"]` | `["top", "center"]` | Position in the HTML document where the instance's HTML element will be rendered. |
| `classNames` | `string[]`                                           | `[]`                | Extra classes to add to the instance's HTML element.                              |

#### Notification only

These options can only be passed in as an object on notification creation. `text` is required and may be passed in directly, optionally alongside `variant` (see [.show()](#showtextoroptions-variant)).

| Property     | Type                                           | Default                              | Description                                                                                                                                                                                                                     |
| :----------- | :--------------------------------------------- | :----------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `variant`    | `string`                                       | `"default"`                          | "Flavor" of notification to show. You can use any variant you desire but when using a custom value you should define some styling for it (see [Sass](#sass)). Default variants are `default`, `success`, `warning` and `error`. |
| `text`       | `string \| string[]`                           | `undefined` - **required attribute** | Text rendered in the notification as content. Render multiple paragraphs by passing in an array.                                                                                                                                |
| `title`      | `string`                                       | `undefined`                          | Text rendered in the notification as title.                                                                                                                                                                                     |
| `titleLevel` | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"h6"`                               | Heading level used for `title`.                                                                                                                                                                                                 |

<br>

### Sass

See `/src/scss/_variables.scss` if you want to inspect the default values.

| Variable name     | Type                     | Description                                                           |
| :---------------- | :----------------------- | :-------------------------------------------------------------------- |
| `$variants`       | `Sass Map`               | Notification variants.                                                |
| `$z-index`        | `integer`                | Z-index applied to the instance's HTML element                        |
| `$colors`         | `Sass Map`               | Available colors.                                                     |
| `$text-colors`    | `Sass Map`               | Text color to use with the defined notification variants.             |
| `$bg-colors`      | `Sass Map`               | Background color to use with the defined notification variants.       |
| `$font-family`    | `string \| custom-ident` | `font-family` used for the notification's text content.               |
| `$font-size-base` | `dimension`              | Base `font-size`. All internal sizing is done relative to this value. |

<br>

## Methods

### `.show(textOrOptions, variant?)`

Show a notification.

#### Parameters

| Parameter       | Type                                        | Description                                                                                                                                                                                              |
| :-------------- | :------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `textOrOptions` | `string \| string[] \| NotificationOptions` | Text rendered in the notification as content or an object with notification options (see [NotificationOptions](#notification-only)).                                                                     |
| `variant`       | `string`                                    | "Flavor" of notification to show. May also be passed in as a property of `textOrOptions` which takes preference over this parameter. See [NotificationOptions](#notification-only) for more information. |

<br>

### `.hide(notificationId: number)`

Hide a currently shown notification.

<br>

### `.hideAll()`

Hide all currently shown notifications.

<br>

### `.notificationIds` (getter)

Get the IDs of all currently shown notifications.

<br>

## Events

| Event       | Fired when...                                              |
| :---------- | :--------------------------------------------------------- |
| `shown`     | The process of showing a notification has fully completed. |
| `hidden`    | The process of hiding a notification has fully completed.  |
| `allhidden` | The latest visible notification has been destroyed.        |

<br>

## License

Mozilla Public License 2.0 © 2025 [Viktor Chin-Kon-Sung](https://github.com/vikputthiscodeongit)
