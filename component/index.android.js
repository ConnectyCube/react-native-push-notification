'use strict';

var {
  NativeModules,
  DeviceEventEmitter,
  AppRegistry
} = require('react-native');

var RNPushNotification = NativeModules.RNPushNotification;
var _notifHandlers = new Map();

var DEVICE_NOTIF_EVENT = 'remoteNotificationReceived';
var NOTIF_REGISTER_EVENT = 'remoteNotificationsRegistered';
var REMOTE_FETCH_EVENT = 'remoteFetch';

var NotificationsComponent = function() {

};

NotificationsComponent.prototype.getInitialNotification = function () {
    return RNPushNotification.getInitialNotification()
        .then(function (notification) {
            if (notification && notification.dataJSON) {
                return JSON.parse(notification.dataJSON);
            }
            return null;
        });
};

NotificationsComponent.prototype.requestPermissions = function(senderID: string) {
	RNPushNotification.requestPermissions(senderID);
};

NotificationsComponent.prototype.subscribeToTopic = function(topic: string) {
	RNPushNotification.subscribeToTopic(topic);
};

NotificationsComponent.prototype.cancelLocalNotifications = function(details: Object) {
	RNPushNotification.cancelLocalNotifications(details);
};

NotificationsComponent.prototype.clearLocalNotification = function(details: Object) {
	RNPushNotification.clearLocalNotification(details);
};

NotificationsComponent.prototype.clearLocalNotificationByString = function(details: Object) {
	RNPushNotification.clearLocalNotificationByString(details);
};

NotificationsComponent.prototype.cancelAllLocalNotifications = function() {
	RNPushNotification.cancelAllLocalNotifications();
};

NotificationsComponent.prototype.presentLocalNotification = function(details: Object) {
	RNPushNotification.presentLocalNotification(details);
};

/** ConnectyCube Group Notifications */

NotificationsComponent.prototype.createCallNotification = function(details: Object) {
  console.log('[createCallNotification][params][index.android]', details)
	RNPushNotification.createCallNotification(details);
}

NotificationsComponent.prototype.createMessageNotification = function(details: Object) {
	console.log('[RNLocalNotifications][params][index.android]', details)
	RNPushNotification.createMessageNotification(details);
};

NotificationsComponent.prototype.createGroupNotification = function(details: Object) {
	//console.log('[RNLocalNotifications][params][index.android]', details)
	RNPushNotification.createGroupNotification(details);
};

NotificationsComponent.prototype.scheduleLocalNotification = function(details: Object) {
	RNPushNotification.scheduleLocalNotification(details);
};

NotificationsComponent.prototype.setApplicationIconBadgeNumber = function(number: number) {
       if (!RNPushNotification.setApplicationIconBadgeNumber) {
               return;
       }
       RNPushNotification.setApplicationIconBadgeNumber(number);
};

NotificationsComponent.prototype.abandonPermissions = function() {
	/* Void */
};

NotificationsComponent.prototype.checkPermissions = function(callback: Function) {
	RNPushNotification.checkPermissions().then(alert => callback({ alert }));
};

NotificationsComponent.prototype.addEventListener = function(type: string, handler: Function) {
	var listener;
	if (type === 'notification') {
		listener =  DeviceEventEmitter.addListener(
			DEVICE_NOTIF_EVENT,
			function(notifData) {
				var data = JSON.parse(notifData.dataJSON);
				handler(data);
			}
		);
	} else if (type === 'register') {
		listener = DeviceEventEmitter.addListener(
			NOTIF_REGISTER_EVENT,
			function(registrationInfo) {
				handler(registrationInfo.deviceToken);
			}
		);
	} else if (type === 'remoteFetch') {
		listener = DeviceEventEmitter.addListener(
			REMOTE_FETCH_EVENT,
			function(notifData) {
				var notificationData = JSON.parse(notifData.dataJSON)
				handler(notificationData);
			}
		);
	}

	_notifHandlers.set(type, listener);
};

NotificationsComponent.prototype.removeEventListener = function(type: string, handler: Function) {
	var listener = _notifHandlers.get(type);
	if (!listener) {
		return;
	}
	listener.remove();
	_notifHandlers.delete(type);
}

NotificationsComponent.prototype.registerNotificationActions = function(details: Object) {
	RNPushNotification.registerNotificationActions(details);
}

NotificationsComponent.prototype.clearAllNotifications = function() {
	RNPushNotification.clearAllNotifications()
}

NotificationsComponent.prototype.launchApp = function(launchOptions) {
	return RNPushNotification.launchApp(launchOptions);
}

NotificationsComponent.prototype.backToForeground = function(options = {}) {
	return RNPushNotification.backToForeground(options);
}

NotificationsComponent.prototype.cancelCallNotification = function() {
	return RNPushNotification.cancelCallNotification();
}

NotificationsComponent.prototype.updateMessageNotificationSettings = function(options = {}) {
	return RNPushNotification.updateMessageNotificationSettings(options);
}

module.exports = {
	state: false,
	component: new NotificationsComponent()
};
