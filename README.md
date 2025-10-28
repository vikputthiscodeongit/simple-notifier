# Simple Notifier

[![npm](https://img.shields.io/npm/v/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)
[![npm - downloads per week](https://img.shields.io/npm/dw/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)
[![jsdelivr - hits per week](https://img.shields.io/jsdelivr/npm/hw/@codebundlesbyvik/simple-notifier)](https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier)

<br>

A fully featured yet easy to use & lightweight notification library.

**[Demo page (interactive)](https://rawcdn.githack.com/vikputthiscodeongit/simple-notifier/fdcb55d5ebfc4572e6f6d7d9247cf098aa641b15/demo.html)**

<br>

## Table of Contents

1. [Unique features](#unique-features)
4. [Usage](#usage)
3. [Browser support](#browser-support)
5. [Instance options](#instance-options)
    * [JavaScript](#javascript)
    * [CSS](#css)
6. [Methods](#methods)
    * [`.show()`](#showtextoroptions-variant)
    * [`.hide()`](#hideid-number)
    * [`.hideAll()`](#hideall)
    * [`.currentId`](#currentid)
    * [`.ids`](#ids)
7. [Events](#events)
8. [Upgrading from 2.x.x](#upgrading-from-2xx)
9. [License](#license)

<br>

## Unique features

* Show multiple notifications simultaneously, and/or
* Hide older notifications before showing one or more new notifications.
* Great accessibility.
* Module-based.

Skip to [Instance options](#instance-options) to get a complete overview of all features!

<br>

## Usage

For this example I assume the main JavaScript file is processed by a module bundler that can process CSS files.

``` shell
# Install package from npm
npm install @codebundlesbyvik/simple-notifier
```

If you're not using a module bundler then:
* Download the latest `@codebundlesbyvik/js-helpers` release [from GitHub](https://github.com/vikputthiscodeongit/js-helpers/releases/latest) or load it directly [via jsdelivr](https://cdn.jsdelivr.net/npm/@codebundlesbyvik/js-helpers@2.1.5/dist/index.js).
* Download the latest `@codebundlesbyvik/simple-notifier` release [from GitHub](https://github.com/vikputthiscodeongit/simple-notifier/releases/latest) or load [the CSS](https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier@3.0.0/dist/style.css) and [the JavaScript](https://cdn.jsdelivr.net/npm/@codebundlesbyvik/simple-notifier@3.0.0/dist/index.js) via the jsdelivr CDN.

For the example below I assume the main JavaScript file is processed by a module bundler.

``` css
/* style.css */
@import "@codebundlesbyvik/simple-notifier";
```

``` javascript
// index.js
import "./style.css";
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";

const notifier = new SimpleNotifier();

// The following element is inserted as the first child of <body>:
// <div class="simple-notifier simple-notifier--position-y-start simple-notifier--position-x-center">
// </div>

const text = "This is an example notification.";
const variant = "success";

notifier.show(text, variant);

// Notification is shown for 4000 ms.
```

<br>

## Browser support

Requires an ECMAScript 2022 (ES13) compatible browser. Practically speaking, all browsers released in 2021 and onwards are fully supported.

<br>

## Instance options
### JavaScript

**All options listed in the 2 tables below may be provided in an object as parameter on instance creation.**

| Property                    | Type                                               | Default                  | Description                                                                   |
| :-------------------------- | :------------------------------------------------- | :----------------------- | :---------------------------------------------------------------------------- |
| `parentEl`                  | `HTMLElement`                                      | `document.body`          | HTML element in which the instance's element will be inserted as first child. |
| `position`                  | `["start" \| "end", "start" \| "center" \| "end"]` | `["start", "center"]`    | Logical position in the HTML document to render the instance's HTML element.  |
| `classNames`                | `string[]`                                         | `[]`                     | Extra classes to add to the instance's HTML element.                          |
| `hideButtonElAriaLabelText` | `string`                                           | `"Dismiss notification"` | Text used as `aria-label` for the notification hide button.                   |

Options below may also be provided via [`NotificationOptions`](#notificationoptions) and if done so take preference.

| Property        | Type      | Default | Description                                                                                                                |
| :-------------- | :-------- | :------ | :------------------------------------------------------------------------------------------------------------------------- |
| `hideAfterTime` | `number`  | `4000`  | Time in milliseconds after which [`.hide()`](#hideid-number) is automatically called. Set to `0` to disable this behavior. |
| `hideOlder`     | `boolean` | `false` | Hide all currently shown notifications before showing the next.                                                            |
| `dismissible`   | `boolean` | `false` | Render a close button which if pressed calls [`.hide()`](#hideid-number).                                                  |

### CSS

| Variable name                          | Type                                                                                            | Default                                                                                  | Description                                                |
| :------------------------------------- | :---------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |:---------------------------------------------------------- |
| `--simple-notifier-z-index`            | `<integer>` \| `auto`                                                                           | `1090`                                                                                   | Z-index applied to the instance's HTML element             |
| `--simple-notifier-font-family`        | [See `font-family` values](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#values) | [Native font stack](https://getbootstrap.com/docs/5.3/content/reboot/#native-font-stack) | Font family used for all notification content.             |
| `--simple-notifier-font-size`          | [See `font-size` values](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size#values)     | `1rem`                                                                                   | Base font size by which all internal sizes are calculated. |
| `--simple-notifier-color-opacity`      | `<alpha-value>`                                                                                 | `0.9`                                                                                    | Opacity applied to all available colors                    |
| `--simple-notifier-color-<name>`       | `<color>` \| `currentColor`                                                                     | White, black, green, yellow & red (see `/src/style.css` for exact values)                | Available colors.                                          |
| `--simple-notifier-animation-duration` | `<time>` \| `auto`                                                                              | `500 ms`                                                                                 | Animation duration applied to all animations.              |

<br>

## Methods

### `.show(textOrOptions, variant?)`

Show a notification.

#### Parameters

| Parameter                         | Type                                                                    | Description                                                                                                                                                                      |
| :-------------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `textOrOptions` <br> **Required** | `string` \| `string[]` \| [`NotificationOptions`](#notificationoptions) | Text to render as notification content or `NotificationOptions`. Text may be provided as a string or multiple strings in an array. Each string is set as `innerHTML` of a `<p>`. |
| `variant`                         | See [`NotificationOptions`](#notificationoptions) below.                | Colorway of notification to render. Appended as BEM modifier to notification class list. Takes preference over `variant` provided in `NotificationOptions` if both are provided. |

##### `NotificationOptions`

`NotificationOptions` always take preference over `NotifierOptions`.

Notifications are only shown if either `text` or `title` is defined.

| Property        | Type                                                               | Default     | Description                                                                                                                                                                              |
| :-------------- | :----------------------------------------------------------------- | :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`          | `string` \| `string[]`                                             | `undefined` | Text to render as notification content. May be provided as a string or multiple strings in an array. Each string is set as `innerHTML` of a `<p>`.                                       |
| `title`         | `string` \| `[string, string]`                                     | `undefined` | Text to render as notification title. Set as `innerHTML`, of a `<p>` if provided as a string or of element of type of array `[1]` if provided as array `[0]`.                            |
| `variant`       | `"default"` \| `"success"` \| `"warning"` \| `"error"` \| `string` | `"default"` | Colorway of notification to render. Appended as BEM modifier to notification class list. Overwritten if `variant` is also provided as [`.show()`](#showtextoroptions-variant) parameter. |
| `hideAfterTime` | `number`                                                           | `4000`      | Time in milliseconds after which [`.hide()`](#hideid-number) is automatically called. Set to `0` to disable this behavior.                                                               |
| `hideOlder`     | `boolean`                                                          | `false`     | Hide all currently shown notifications before showing the next.                                                                                                                          |
| `dismissible`   | `boolean`                                                          | `false`     | Render a close button which if pressed calls [`.hide()`](#hideid-number).                                                                                                                |

### `.hide(id: number)`

Hide a currently shown notification by its ID. An `id` can be retrieved via the [`event`](#events) fired on the instance element on notification show or the `data-notification-id` attribute on the notification element.

### `.hideAll()`

Hide all currently shown notifications.

### `.currentId`

Get the current ID, i.e. the one that'll be used for the next notification.

### `.ids`

Get the IDs of all currently shown notifications.

<br>

## Events

Events are fired on the instance element `.simple-notifier`. The `detail` property contains the `id` of the notification it was fired for.

| Event       | Fired after...                     |
| :---------- | :--------------------------------- |
| `shown`     | Notification is shown.             |
| `hidden`    | Hotification is hidden.            |
| `allhidden` | Last shown notification is hidden. |

<br>

## Upgrading from 2.x.x

The following changes are breaking:
* **Removed:** `instanceId`
* **Renamed:** `notificationId` > `id`. Effects getters & event `detail`.
* **Renamed:** `dismissable` > `dismissible`
* **Changed:** Use physical directional keywords instead of logical keywords, i.e. `left` > `start`.
* **Changed:** `notificationOptions.titleLevel` must now be provided as `notificationOptions.title.el` (see [`NotificationOptions`](#notificationoptions)).
* **Changed:** If `variant` is provided both as `.show()` parameter and as `notificationOptions.variant`, `.show()` now takes preference.
* **Changed:** Undocumented but public class field names, visibility & mutability.

<br>

## License

Mozilla Public License 2.0 © 2025 [Viktor Chin-Kon-Sung](https://github.com/vikputthiscodeongit)
