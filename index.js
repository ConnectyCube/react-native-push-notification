/**
 * @providesModule Notifications
 */

'use strict';

var RNNotificationsComponent = require( './component' );

var AppState = RNNotificationsComponent.state;
var RNNotifications = RNNotificationsComponent.component;

const { Platform, AppRegistry } = require('react-native')

var Notifications = {
	handler: RNNotifications,
	onRegister: false,
	onError: false,
	onNotification: false,
  onRemoteFetch: false,
	isLoaded: false,
	hasPoppedInitialNotification: false,

	isPermissionsRequestPending: false,

	permissions: {
		alert: true,
		badge: true,
		sound: true
	},

	JS_BACKGROUND_TASKS_KEYS: {
		START_CALL_TASK_KEY: 'START_CALL_TASK_KEY',
		END_CALL_TASK_KEY: 'END_CALL_TASK_KEY',
		NOTIFY_TASK_KEY: 'NOTIFY_TASK_KEY',
		MARK_AS_READ_TASK_KEY: 'MARK_AS_READ_TASK_KEY',
		REPLY_TASK_KEY: 'REPLY_TASK_KEY'
	},

	CHANNELS: {
		IN_APP_MESSAGES: 'IN_APP_MESSAGES',
		IN_APP_GROUP: 'IN_APP_GROUP',
		PUSH_MESSAGES: 'PUSH_MESSAGES',
		CALLS: 'CALLS'
	}
};

Notifications.callNative = function(name: String, params: Array) {
	if ( typeof this.handler[name] === 'function' ) {
		if ( typeof params !== 'array' &&
			 typeof params !== 'object' ) {
			params = [];
		}

		return this.handler[name](...params);
	} else {
		return null;
	}
};

/**
 * Configure local and remote notifications
 * @param {Object}		options
 * @param {function}	options.onRegister - Fired when the user registers for remote notifications.
 * @param {function}	options.onNotification - Fired when a remote notification is received.
 * @param {function} 	options.onError - None
 * @param {Object}		options.permissions - Permissions list
 * @param {Boolean}		options.requestPermissions - Check permissions when register
 */
Notifications.configure = function(options: Object) {
	if ( typeof options.onRegister !== 'undefined' ) {
		this.onRegister = options.onRegister;
	}

	if ( typeof options.onError !== 'undefined' ) {
		this.onError = options.onError;
	}

	if ( typeof options.onNotification !== 'undefined' ) {
		this.onNotification = options.onNotification;
	}

	if ( typeof options.permissions !== 'undefined' ) {
		this.permissions = options.permissions;
	}

	if ( typeof options.senderID !== 'undefined' ) {
		this.senderID = options.senderID;
	}

	if ( typeof options.onRemoteFetch !== 'undefined' ) {
		this.onRemoteFetch = options.onRemoteFetch;
	}

	if ( this.isLoaded === false ) {
		this._onRegister = this._onRegister.bind(this);
		this._onNotification = this._onNotification.bind(this);
		this._onRemoteFetch = this._onRemoteFetch.bind(this);
		this.callNative( 'addEventListener', [ 'register', this._onRegister ] );
		this.callNative( 'addEventListener', [ 'notification', this._onNotification ] );
		this.callNative( 'addEventListener', [ 'localNotification', this._onNotification ] );
		Platform.OS === 'android' ? this.callNative( 'addEventListener', [ 'remoteFetch', this._onRemoteFetch ] ) : null

		this.isLoaded = true;
	}

	if ( this.hasPoppedInitialNotification === false &&
			( options.popInitialNotification === undefined || options.popInitialNotification === true ) ) {
		this.popInitialNotification(function(firstNotification) {
			if ( firstNotification !== null ) {
				this._onNotification(firstNotification, true);
			}
		}.bind(this));
		this.hasPoppedInitialNotification = true;
	}

	if ( options.requestPermissions !== false ) {
		this._requestPermissions();
	}

};

/* Unregister */
Notifications.unregister = function() {
	this.callNative( 'removeEventListener', [ 'register', this._onRegister ] )
	this.callNative( 'removeEventListener', [ 'notification', this._onNotification ] )
	this.callNative( 'removeEventListener', [ 'localNotification', this._onNotification ] )
	Platform.OS === 'android' ? this.callNative( 'removeEventListener', [ 'remoteFetch', this._onRemoteFetch ] ) : null
	this.isLoaded = false;
};

/**
 * Local Notifications
 * @param {Object}		details
 * @param {String}		details.title  -  The title displayed in the notification alert.
 * @param {String}		details.message - The message displayed in the notification alert.
 * @param {String}		details.ticker -  ANDROID ONLY: The ticker displayed in the status bar.
 * @param {Object}		details.userInfo -  iOS ONLY: The userInfo used in the notification alert.
 */
Notifications.localNotification = function(details: Object) {
	if ( Platform.OS === 'ios' ) {
		// https://developer.apple.com/reference/uikit/uilocalnotification

		let soundName = details.soundName ? details.soundName : 'default'; // play sound (and vibrate) as default behaviour

		if (details.hasOwnProperty('playSound') && !details.playSound) {
			soundName = ''; // empty string results in no sound (and no vibration)
		}

		// for valid fields see: https://developer.apple.com/library/ios/documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Chapters/IPhoneOSClientImp.html
		// alertTitle only valid for apple watch: https://developer.apple.com/library/ios/documentation/iPhone/Reference/UILocalNotification_Class/#//apple_ref/occ/instp/UILocalNotification/alertTitle

		this.handler.presentLocalNotification({
			alertTitle: details.title,
			alertBody: details.message,
			alertAction: details.alertAction,
			category: details.category,
			soundName: soundName,
			applicationIconBadgeNumber: details.number,
			userInfo: details.userInfo
		});
	} else {
		this.handler.presentLocalNotification(details);
	}
};

/* ConnectyCube Group notifications */

Notifications.createCallNotification = function(details: Object) {
  if (Platform.OS === 'android') {
		this.handler.createCallNotification(details)
	}
}

Notifications.createMessageNotification = function(details: Object) {
	if (Platform.OS === 'android') {
		this.handler.createMessageNotification(details)
	} else {
		Notifications.localNotification(details)
	}
}

Notifications.createGroupNotification = function(details: Object) {
	if (Platform.OS === 'android') {
		//console.log('[RNLocalNotifications][params][index]', details)
		this.handler.createGroupNotification(details)
	} else {
		Notifications.localNotification(details)
	}
}

Notifications.registerBackgroundTask = function(taskName, taskFunction) {
  if (Platform.OS == 'android') {
    console.log('[Notifications][registerBackgroundTask]', taskName, taskFunction)
    AppRegistry.registerHeadlessTask(taskName, taskFunction)
  }
}

/**
 * Local Notifications Schedule
 * @param {Object}		details (same as localNotification)
 * @param {Date}		details.date - The date and time when the system should deliver the notification
 */
Notifications.localNotificationSchedule = function(details: Object) {
	if ( Platform.OS === 'ios' ) {
		let soundName = details.soundName ? details.soundName : 'default'; // play sound (and vibrate) as default behaviour

		if (details.hasOwnProperty('playSound') && !details.playSound) {
			soundName = ''; // empty string results in no sound (and no vibration)
		}

		const iosDetails = {
			fireDate: details.date.toISOString(),
			alertTitle: details.title,
			alertBody: details.message,
			category: details.category,
			soundName: soundName,
			userInfo: details.userInfo,
			repeatInterval: details.repeatType
		};

		if(details.number) {
			iosDetails.applicationIconBadgeNumber = parseInt(details.number, 10);
		}

		// ignore Android only repeatType
		if (!details.repeatType || details.repeatType === 'time') {
			delete iosDetails.repeatInterval;
		}
		this.handler.scheduleLocalNotification(iosDetails);
	} else {
		details.fireDate = details.date.getTime();
		delete details.date;
		// ignore iOS only repeatType
		if (['year', 'month'].includes(details.repeatType)) {
			delete details.repeatType;
		}
		this.handler.scheduleLocalNotification(details);
	}
};

/* Internal Functions */
Notifications._onRegister = function(token: String) {
	if ( this.onRegister !== false ) {
		this.onRegister({
			token: token,
			os: Platform.OS
		});
	}
};

Notifications._onRemoteFetch = function(notificationData: Object) {
	if ( this.onRemoteFetch !== false ) {
		this.onRemoteFetch(notificationData)
	}
};

Notifications._onNotification = function(data, isFromBackground = null) {
	if ( isFromBackground === null ) {
		isFromBackground = (
			data.foreground === false ||
			AppState.currentState === 'background'
		);
	}

	if ( this.onNotification !== false ) {
		if ( Platform.OS === 'ios' ) {
			this.onNotification({
				foreground: ! isFromBackground,
				userInteraction: isFromBackground,
				message: data.getMessage(),
				data: data.getData(),
				badge: data.getBadgeCount(),
				alert: data.getAlert(),
				sound: data.getSound(),
  			finish: (res) => data.finish(res)
			});
		} else {
			var notificationData = {
				foreground: ! isFromBackground,
  			finish: () => {},
				...data
			};

			if ( typeof notificationData.data === 'string' ) {
				try {
					notificationData.data = JSON.parse(notificationData.data);
				} catch(e) {
					/* void */
				}
			}

			this.onNotification(notificationData);
		}
	}
};

/* onResultPermissionResult */
Notifications._onPermissionResult = function() {
	this.isPermissionsRequestPending = false;
};

// Prevent requestPermissions called twice if ios result is pending
Notifications._requestPermissions = function() {
	if ( Platform.OS === 'ios' ) {
		if ( this.isPermissionsRequestPending === false ) {
			this.isPermissionsRequestPending = true;
			return this.callNative( 'requestPermissions', [ this.permissions ])
							.then(this._onPermissionResult.bind(this))
							.catch(this._onPermissionResult.bind(this));
		}
	} else if ( typeof this.senderID !== 'undefined' ) {
		return this.callNative( 'requestPermissions', [ this.senderID ]);
	}
};

// Stock requestPermissions function
Notifications.requestPermissions = function() {
	if ( Platform.OS === 'ios' ) {
		return this.callNative( 'requestPermissions', [ this.permissions ]);
	} else if ( typeof this.senderID !== 'undefined' ) {
		return this.callNative( 'requestPermissions', [ this.senderID ]);
	}
};

/* Fallback functions */
Notifications.subscribeToTopic = function() {
	return this.callNative('subscribeToTopic', arguments);
};

Notifications.presentLocalNotification = function() {
	return this.callNative('presentLocalNotification', arguments);
};

Notifications.scheduleLocalNotification = function() {
	return this.callNative('scheduleLocalNotification', arguments);
};

Notifications.cancelLocalNotifications = function() {
	return this.callNative('cancelLocalNotifications', arguments);
};

Notifications.clearLocalNotification = function() {
    return this.callNative('clearLocalNotification', arguments);
};

Notifications.clearLocalNotificationByString = function() {
  return this.callNative('clearLocalNotificationByString', arguments);
};

Notifications.cancelAllLocalNotifications = function() {
	return this.callNative('cancelAllLocalNotifications', arguments);
};

Notifications.setApplicationIconBadgeNumber = function() {
	return this.callNative('setApplicationIconBadgeNumber', arguments);
};

Notifications.getApplicationIconBadgeNumber = function() {
	return this.callNative('getApplicationIconBadgeNumber', arguments);
};

Notifications.popInitialNotification = function(handler) {
	this.callNative('getInitialNotification').then(function(result){
		handler(result);
	});
};

Notifications.launchApp = function(launchApp) {
	return this.callNative('launchApp', arguments);
}

Notifications.backToForeground = function() {
	return this.callNative('backToForeground', arguments);
}

Notifications.abandonPermissions = function() {
	return this.callNative('abandonPermissions', arguments);
};

Notifications.checkPermissions = function() {
	return this.callNative('checkPermissions', arguments);
};

Notifications.registerNotificationActions = function() {
	return this.callNative('registerNotificationActions', arguments)
}

Notifications.cancelCallNotification = function() {
	// Only available for Android
	if (Platform.OS === 'android') {
		return this.callNative('cancelCallNotification', arguments)
	}
	return Promise.resolve();
}

Notifications.clearAllNotifications = function() {
	// Only available for Android
	return this.callNative('clearAllNotifications', arguments)
}

Notifications.updateMessageNotificationSettings = function() {
	// Only available for Android
	if (Platform.OS === 'android') {
		return this.callNative('updateMessageNotificationSettings', arguments)
	}
	return Promise.resolve()
}

module.exports = Notifications;
