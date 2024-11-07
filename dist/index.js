var NotificationState,__webpack_require__={d:function(exports,definition){for(var key in definition)__webpack_require__.o(definition,key)&&!__webpack_require__.o(exports,key)&&Object.defineProperty(exports,key,{enumerable:!0,get:definition[key]})},o:function(obj,prop){return Object.prototype.hasOwnProperty.call(obj,prop)}},__webpack_exports__={};function createEl(tagName,attrs){if("string"!=typeof tagName)throw new Error("`tagName` must be a `String`.");if(attrs&&"object"!=typeof attrs)throw new Error("`attrs` must be an `Object`.");const el=document.createElement(tagName);if(attrs)for(const[prop,rawVal]of Object.entries(attrs)){if("string"!=typeof rawVal&&"number"!=typeof rawVal&&"boolean"!=typeof rawVal||!1===rawVal||null===rawVal)continue;const val=rawVal.toString();if("textContent"===prop){el.textContent=val;continue}const propKebab=prop.replace(/[A-Z]/g,(letter=>"-"+letter.toLowerCase()));el.setAttribute(propKebab,val)}return el}__webpack_require__.d(__webpack_exports__,{A:function(){return SN}}),function(NotificationState){NotificationState.HIDE_BUSY="HIDE_BUSY",NotificationState.SHOW_BUSY="SHOW_BUSY",NotificationState.SHOWN="SHOWN",NotificationState.WAITING_ON_HIDE="WAITING_ON_HIDE"}(NotificationState||(NotificationState={}));const makeInstanceId=(min,max,excludeIds,tryCount)=>{tryCount=tryCount||1;const id=function(min,max){if("number"!=typeof min||"number"!=typeof max)throw new Error("`min` and `max` must both be `Number`s.");if(min<0||max<0||max<min)throw new Error("`min` and `max` must both be 0 or greater and `max` must be greater than `min`.");return min=Math.ceil(min),max=Math.floor(max),Math.floor(Math.random()*(max-min)+min)}(min,max);if(excludeIds.includes(id)){if(tryCount>3)throw new Error("Failed to generate a unique instanceId 3 times!");makeInstanceId(min,max,excludeIds,++tryCount)}return id},DEFAULT_INSTANCE_OPTIONS={parentEl:document.body,position:["top","center"],hideAfterTime:4e3,hideOlder:!1,dismissable:!1,animationClasses:["fade-in","fade-out"],animationDuration:500};class SN{parentEl;position;hideAfterTime;hideOlder;dismissable;animationClasses;animationDuration;notifierEl;notifications;currentNotificationId;queuedNotifications;waitingForHideOlderHideAll;instanceId;constructor(options={}){try{const mergedOptions={...DEFAULT_INSTANCE_OPTIONS,...options};this.parentEl=mergedOptions.parentEl,this.position=mergedOptions.position,this.hideAfterTime=mergedOptions.hideAfterTime,this.hideOlder=mergedOptions.hideOlder,this.dismissable=mergedOptions.dismissable,this.animationClasses=mergedOptions.animationClasses,this.animationDuration=mergedOptions.animationDuration,this.notifierEl=createEl("div",{class:`simple-notifier simple-notifier--pos-x-${this.position[1]} simple-notifier--pos-y-${this.position[0]}`,ariaLive:"assertive"}),this.notifications={},this.currentNotificationId=0,this.queuedNotifications=[],this.waitingForHideOlderHideAll=!1,this.instanceId=makeInstanceId(1e5,1e6,SN.#instanceIds),SN.#instanceIds.push(this.instanceId),this.parentEl.insertBefore(this.notifierEl,this.parentEl.firstElementChild)}catch(error){throw error instanceof Error?error:new Error("Unknown error during instance initialization!")}}static#instanceIds=[];get notificationIds(){return Object.keys(this.notifications).map((key=>Number.parseInt(key)))}get#notificationIdsStateShowBusy(){const notifications=[];for(const id in this.notifications)this.notifications[id].state===NotificationState.SHOW_BUSY&&notifications.push(Number.parseInt(id));return notifications}get#notificationIdsStateHideBusy(){const notifications=[];for(const id in this.notifications)this.notifications[id].state===NotificationState.HIDE_BUSY&&notifications.push(Number.parseInt(id));return notifications}get#notificationIdsStateWaitingOnHide(){const notifications=[];for(const id in this.notifications)this.notifications[id].state===NotificationState.WAITING_ON_HIDE&&notifications.push(Number.parseInt(id));return notifications}show(textOrOptions,type){try{if("object"!=typeof textOrOptions&&"string"!=typeof textOrOptions)throw new Error("'textOrOptions' is required and must be a `String` or an `Object`.");if(void 0!==type&&"string"!=typeof type)throw new Error("'type' must be a `String`.");if("object"==typeof textOrOptions&&(textOrOptions.hideOlder&&Object.keys(this.notifications).length>0||this.queuedNotifications.length>0)){if(this.queuedNotifications.push(textOrOptions),this.waitingForHideOlderHideAll)return;return this.waitingForHideOlderHideAll=!0,this.hideAll(),void this.notifierEl.addEventListener("allhidden",(()=>{this.waitingForHideOlderHideAll=!1;const queueCopyReversed=[...this.queuedNotifications].reverse();this.queuedNotifications=[];let notificationsToShowReversed=[],count=0;for(const notificationOptions of queueCopyReversed)if(count++,notificationOptions.hideOlder){notificationsToShowReversed=queueCopyReversed.slice(0,count);break}notificationsToShowReversed.reverse().forEach((notificationOptions=>{this.show(notificationOptions)}))}),{once:!0})}const currentNotificationId=this.currentNotificationId;this.currentNotificationId++;const notificationOptions=this.#getNotificationOptions(textOrOptions,type),notificationEl=this.#makeNotificationEl(currentNotificationId,notificationOptions),notificationProps={...notificationOptions,state:NotificationState.SHOW_BUSY,el:notificationEl,abortController:new AbortController};this.notifications[currentNotificationId]=notificationProps,this.notifierEl.append(notificationEl),notificationEl.addEventListener("animationend",(()=>{this.notifications[currentNotificationId].state=NotificationState.SHOWN;const notificationShownEvent=new CustomEvent("shown",{detail:{instanceId:this.instanceId,notificationId:currentNotificationId}});this.notifierEl.dispatchEvent(notificationShownEvent),notificationOptions.hideAfterTime>0&&(async()=>await this.#scheduleHide(currentNotificationId))().catch((reason=>{}))}),{once:!0,signal:notificationProps.abortController.signal}),notificationEl.addEventListener("animationcancel",(()=>{}),{once:!0})}catch(error){throw error instanceof Error?error:new Error("Unknown error during notification show!")}}#getNotificationOptions(textOrOptions,type){const notificationOptions="object"==typeof textOrOptions?textOrOptions:void 0,animationDuration=notificationOptions?.animationDuration??this.animationDuration;return{hideAfterTime:notificationOptions?.hideAfterTime??this.hideAfterTime,hideOlder:notificationOptions?.hideOlder??this.hideOlder,dismissable:notificationOptions?.dismissable??this.dismissable,animationClasses:notificationOptions?.animationClasses??this.animationClasses,animationDuration:!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&animationDuration>0?animationDuration:1,text:notificationOptions?notificationOptions.text:textOrOptions,title:notificationOptions?.title,type:notificationOptions?.type??type??"default"}}#makeNotificationEl(id,options){const notificationEl=createEl("div",{class:`simple-notification simple-notification--${options.type} ${options.animationClasses[0]}`,style:`animation-duration: ${options.animationDuration}ms;`,role:"alert",dataNotificationId:id.toString()}),contentEl=createEl("div",{class:"simple-notification__part simple-notification__part--main"});if(options.title){const titleEl=createEl("h6",{class:"simple-notification__title",textContent:options.title});contentEl.append(titleEl)}if(options.text){const messageEl=createEl("p",{class:"simple-notification__message",textContent:options.text});contentEl.append(messageEl)}if(notificationEl.append(contentEl),options.dismissable){const sideContentEl=createEl("div",{class:"simple-notification__part simple-notification__part--side"}),hideButtonEl=createEl("button",{type:"button",class:"simple-notification__hide-button",ariaLabel:"Dismiss notification"});hideButtonEl.addEventListener("click",(()=>this.hide(id)),{once:!0}),sideContentEl.append(hideButtonEl),notificationEl.append(sideContentEl)}return notificationEl}async#scheduleHide(id){this.notifications[id].state=NotificationState.WAITING_ON_HIDE;const notificationProps=this.notifications[id];try{await function(duration,resolveValue,abortSignal){if("number"!=typeof duration)throw new Error("`time` must be a `Number`.");return new Promise(((resolve,reject)=>{const listener=()=>{clearTimeout(timer),reject(null==abortSignal?void 0:abortSignal.reason)};null==abortSignal||abortSignal.throwIfAborted();const timer=setTimeout((()=>{null==abortSignal||abortSignal.removeEventListener("abort",listener),resolve(true)}),duration>=0?duration:0);null==abortSignal||abortSignal.addEventListener("abort",listener)}))}(notificationProps.hideAfterTime,0,notificationProps.abortController.signal),this.hide(id)}catch{}}hide(notificationId){try{if("number"!=typeof notificationId)throw new Error("'notificationId' must be a `Number`.");if(this.#notificationIdsStateHideBusy.includes(notificationId))return void console.warn(`Already hiding notification ${notificationId}.`);const notificationProps=this.notifications[notificationId];if(!notificationProps)return void console.warn(`Notification ${notificationId} doesn't exist.`);(this.#notificationIdsStateShowBusy.includes(notificationId)||this.#notificationIdsStateWaitingOnHide.includes(notificationId))&&notificationProps.abortController.abort(),this.notifications[notificationId].state=NotificationState.HIDE_BUSY,notificationProps.el.classList.remove(notificationProps.animationClasses[0]),notificationProps.el.classList.add(notificationProps.animationClasses[1]),notificationProps.el.addEventListener("animationend",(()=>{notificationProps.el.remove(),delete this.notifications[notificationId];const notificationHiddenEvent=new CustomEvent("hidden",{detail:{instanceId:this.instanceId,notificationId:notificationId}});if(this.notifierEl.dispatchEvent(notificationHiddenEvent),0===this.notificationIds.length){const allNotificationsHiddenEvent=new CustomEvent("allhidden",{detail:{instanceId:this.instanceId}});this.notifierEl.dispatchEvent(allNotificationsHiddenEvent)}}),{once:!0})}catch(error){throw error instanceof Error?error:new Error("Unknown error during notification hide!")}}hideAll(){const notificationIdsToHide=this.notificationIds.filter((id=>!this.#notificationIdsStateHideBusy.includes(id)));0!==notificationIdsToHide.length&&notificationIdsToHide.forEach((notificationId=>this.hide(notificationId)))}}var __webpack_exports__default=__webpack_exports__.A;export{__webpack_exports__default as default};