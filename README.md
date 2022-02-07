# Simple Notifier
[![npm](https://img.shields.io/npm/v/@codebundlesbyvik/simple-notifier)](https://www.npmjs.com/package/@codebundlesbyvik/simple-notifier)

A lightweight and easy to use notification library.

<br>

## Installation

`npm install @codebundlesbyvik/simple-notifier`

<br>

## Basic usage
```javascript
import SimpleNotifier from "@codebundlesbyvik/simple-notifier";


const notifier = new SimpleNotifier();

notifier.init();

// The following is inserted in the DOM.
// <div class="simple-notifier">
//     <p class="simple-notifier__message"></p>
// </div>


const message = "This is an example message.";
const type = "success";

notifier.show(message, type);

// Notification is shown for 3500 ms.
```

<br>

## Methods

### `.init()`

Initialize a `SimpleNotifier` instance.

A single instance shows at most a single notification. Should a message be passed to the instance whilst one is already being shown, the current one will be replaced by the new one.

<br>

### `.show(text, type)`

Show a notification.

#### Parameters

| Parameter | Type     | Default                                             | Description                                                                                                 |
| --------- | -------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `text`    | `String` | Some dummy text.                                    | Text to show.                                                                                               |
| `type`    | `String` | `"dummy"` if `text` is `undefined`, else `"default"`| Element's parent. Will be added as class ([BEM modifier](http://getbem.com/naming/)) to `.simple-notifier.` |

<br>

### `.hide()`

Hide the shown notification.

<br>

### `.destroy()`

Doesn't exist yet.

Destroy a `SimpleNotifier` instance.

<br>

## Options

Options should be passed in as an object on instance creation.

| Parameter    | Type                 | Default         | Description                                                                                                                                   |
| ------------ | -------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `autoHide`   | `Number` / `Boolean` | `3500`          | Time in milliseconds after which `.hide()` will be  called. `true` defaults to `3500`, set to `false` or `0` to make the notification sticky. |
| `parentEl`   | `Element`            | `document.body` | `.simple-notifier`'s parent element.                                                                                                          |
| `animations` | `String` / `Boolean` | `"auto"`        | Animation preference. `"auto"` checks user's device motion preference on each `.show()`.                                                      |

<br>

## License

MIT © [Viktor Chin-Kon-Sung](https://github.com/vikputthiscodeongit)
