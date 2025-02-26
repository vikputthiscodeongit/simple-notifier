# Simple Notifier

[![npm](https://img.shields.io/npm/v/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)
[![npm - downloads per week](https://img.shields.io/npm/dw/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)
[![jsdelivr - hits per week](https://img.shields.io/jsdelivr/npm/hw/@codebundlesbyvik/simple-notifier)](https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier)

<br>

A fully featured yet easy to use & lightweight notification library.

__[Demo page (interactive)](https://rawcdn.githack.com/vikputthiscodeongit/simple-notifier/6154d65a7dfe18144228b60f1859de295c40bf10/demo.html)__

<br>

## Table of Contents

1. [Unique features](#unique-features)
4. [Usage](#usage)
3. [Browser support](#browser-support)
5. [Instance options](#instance-options)
    * [JavaScript](#javascript)
    * [Sass](#sass)
6. [Methods](#methods)
    * [`.show()`](#showtextoroptions-variant)
    * [`.hide()`](#hidenotificationid-number)
    * [`.hideAll()`](#hideall)
    * [`.notificationIds` (getter)](#notificationids-getter)
7. [Events](#events)
8. [Quick migration from version 1](#quick-migration-from-version-1)
9. [License](#license)

<br>

## Unique features

* Show multiple notifications simultaneously, and/or
* Hide older notifications before showing one or more new notifications.
* Fully accessible.
* Module-based.

Skip to [Instance options](#instance-options) to get a complete overview of all features!

<br>

## Usage

For this example I assume the main JavaScript file is processed by a module bundler and Sass is installed.

``` shell
# Install package from npm
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

## Instance options
### JavaScript

**All options listed in the 2 tables below can be provided in a `NotifierOptions` object as parameter on instance creation.**

| Property     | Type                                                 | Default             | Description                                                                   |
| :----------- | :--------------------------------------------------- | :------------------ | :---------------------------------------------------------------------------- |
| `parentEl`   | `HTMLElement`                                        | `document.body`     | HTML element in which the instance's element will be inserted as first child. |
| `position`   | `["top" \| "bottom", "left" \| "center" \| "right"]` | `["top", "center"]` | Position in the HTML document to render the instance's HTML element.          |
| `classNames` | `string[]`                                           | `[]`                | Extra classes to add to the instance's HTML element.                          |

Options below can also be provided via [NotificationOptions](#notificationoptions) and if done so will take preference.

| Property        | Type      | Default | Description                                                                                                                                                                            |
| :-------------- | :-------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hideAfterTime` | `number`  | `4000`  | Time in milliseconds after which [`.hide()`](#hidenotificationid-number) is automatically called. Set to `0` to show notifications until `.hide()` or `.hideAll()` is manually called. |
| `hideOlder`     | `boolean` | `false` | Hide all previously shown (to be exact, triggered) notifications before showing the one most recently created.                                                                         |
| `dismissable`   | `boolean` | `false` | Render a close button allowing for manual notification dismissal.                                                                                                                      |

### Sass

See `/src/scss/_variables.scss` if you want to inspect the default values.

| Variable name     | Type                       | Description                                                           |
| :---------------- | :------------------------  | :-------------------------------------------------------------------- |
| `$variants`       | `Sass Map`                 | Notification variants.                                                |
| `$z-index`        | `integer`                  | Z-index applied to the instance's HTML element                        |
| `$colors`         | `Sass Map`                 | Available colors.                                                     |
| `$text-colors`    | `Sass Map`                 | Text color to use with the defined notification variants.             |
| `$bg-colors`      | `Sass Map`                 | Background color to use with the defined notification variants.       |
| `$font-family`    | `string` \| `custom-ident` | `font-family` used for the notification's text content.               |
| `$font-size-base` | `dimension`                | Base `font-size`. All internal sizing is done relative to this value. |

<br>

## Methods

### `.show(textOrOptions, variant?)`

Show a notification.

#### Parameters

| Parameter                        | Type                                                                    | Description                                                                              |
| :------------------------------- | :---------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| **! REQUIRED !** `textOrOptions` | `string` \| `string[]` \| [`NotificationOptions`](#notificationoptions) | Text to render as notification content or [`NotificationOptions`](#notificationoptions). |
| `variant`                        | See [`NotificationOptions`](#notificationoptions) below.                |

##### `NotificationOptions`

**All options listed in the 2 tables below can be provided in a `NotificationOptions` object as the `textOrOptions` parameter.**

Either `text` or `title` must be defined.

| Property     | Type                                                               | Default     | Description                                                                                                                          |
| :----------- | :----------------------------------------------------------------- | :---------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `variant`    | `"default"` \| `"success"` \| `"warning"` \| `"error"` \| `string` | `"default"` | Variant (colorway) of notification to render. If you set a custom variant you should define some styling for it (see [Sass](#sass)). |
| `text`       | `string` \| `string[]`                                             | `undefined` | Text to render as notification content. Render multiple paragraphs by passing in an array.                                           |
| `title`      | `string`                                                           | `undefined` | Text to render as notification title.                                                                                                |
| `titleLevel` | `"h1"` \| `"h2"` \| `"h3"` \| `"h4"` \| `"h5"` \| `"h6"`           | `"h6"`      | `title` [heading level](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements).                                 |

Options below can also be provided via [`NotifierOptions`](#javascript), but those will never take preference.

| Property        | Type      | Default | Description                                                                                                                                                                           |
| :-------------- | :-------- | :------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `hideAfterTime` | `number`  | `4000`  | Time in milliseconds after which [`.hide()`](#hidenotificationid-number) is automatically called. Set to `0` to show notification until `.hide()` or `.hideAll()` is manually called. |
| `hideOlder`     | `boolean` | `false` | Hide all previously shown (to be exact, triggered) notifications before showing the one just created.                                                                                 |
| `dismissable`   | `boolean` | `false` | Render a close button allowing for manual notification dismissal.                                                                                                                     |

<br>

### `.hide(notificationId: number)`

Hide a currently shown notification by its ID. A `notificationId` can be retrieved via an [`Event` object](#events) of the instance element `.simple-notifier` or the `data-notification-id` attribute on the notification element `.simple-notification`.

<br>

### `.hideAll()`

Hide all currently shown notifications.

<br>

### `.notificationIds` (getter)

Get the IDs of all currently shown notifications.

<br>

## Events

Events are fired on the instance element `.simple-notifier`. The `Event` object contains the `notificationId` of the notification it was fired for and the `instanceId` it belongs to.

| Event       | Fired when...                                        |
| :---------- | :--------------------------------------------------- |
| `shown`     | The process of showing a notification has completed. |
| `hidden`    | The process of hiding a notification has completed.  |
| `allhidden` | The last shown notification has been hidden.         |

<br>

<br>

## Quick migration from version 1

If you were using the previous version as a JavaScript module and want to perform a quick update keeping everything as is, all you need to do is:

1. Change `new SimpleNotifier()` to `new SimpleNotifier({ hideAfterTime: 3500, hideOlder: true })`.
2. Remove call to `.init()` since instance initialization is now done when constructing the class.

<br>

## License

Mozilla Public License 2.0 © 2025 [Viktor Chin-Kon-Sung](https://github.com/vikputthiscodeongit)
