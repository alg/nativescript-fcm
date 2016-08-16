var FCM         = require("./index-common.js");
var Application = require("application");
var types       = require("utils/types");

var tokenRefreshListener = null;
var tokenPromises = [];

var permissionPromises = [];
var permissionGranted = null;

// ------------------------------------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------------------------------------

/**
 * Initializes the handlers, but doesn't ask for permissions or requesting tokens yet.
 */
function init() {
  var nc = NSNotificationCenter.defaultCenter();

  // Subscribe to token refreshes
  nc.addObserverForNameObjectQueueUsingBlock(
    "kFIRInstanceIDTokenRefreshNotification",
    null,
    NSOperationQueue.mainQueue(),
    _onTokenRefresh);

  nc.addObserverForNameObjectQueueUsingBlock(
    "didRegisterUserNotificationSettings",
    null,
    NSOperationQueue.mainQueue(),
    _onPermissionRequestResult);

  // Signup to events
  Application.on(Application.resumeEvent, _connectToFCM);
  Application.on(Application.suspendEvent, _disconnectFromFCM);

  // Configure the application
  FIRApp.configure();
}

/**
 * Registers for notifications.
 * Returns Promise<boolean>
 */
function registerForNotifications() {
  return new Promise(function(resolve, reject) {
    try {
      // If we already asked, quick exit
      if (permissionGranted !== null) return resolve(permissionGranted);
      if (_hasPermission()) return resolve(true);

      permissionPromises.push(resolve);
      _registerForNotifications();
    } catch (ex) {
      console.log("[FCM] Notification registration failed: " + ex);
      reject(ex);
    }
  });
}

/**
 * Requests the registration token.
 */
function requestToken() {
  return new Promise(function(resolve, _reject) {
    var token = FIRInstanceID.instanceID().token();
    if (token) {
      resolve(token);

      _resolveTokenPromises(token);
      _connectToFCM();
    } else {
      tokenPromises.push(resolve);
    }
  });
}

/**
 * Registers onTokenRefresh listener.
 */
function setTokenRefreshListener(listener) {
  tokenRefreshListener = listener;
}

/**
 * Registers message listener.
 */
function setMessageListener(_listener) {
  // TODO unimplemented
  // The issue is that if the UIApplicationDelegate is already defined,
  // I can't find a way to add a method to it (applicationDidReceiveRemoteNotification),
  // so the users has to register themselves for now.
}

/**
 * Subscribes to a certain topic.
 */
function subscribeToTopic(topic) {
  FIRMessaging.messaging().subscribeToTopic(topic);
}

/**
 * Unsubscribes from a certain topic.
 */
function unsubscribeFromTopic(topic) {
  FIRMessaging.messaging().unsubscribeFromTopic(topic);
}

/**
 * Returns whatever launch options we are passed by the OS in case the app was launched
 * from a notification tap. If it's a normal launch, #false is returned.
 */
function launchNotificationData(args) {
  // TODO implement
  return false;
}

// ------------------------------------------------------------------------------------------------
// Private methods
// ------------------------------------------------------------------------------------------------

function _onTokenRefresh() {
  var token = FIRInstanceID.instanceID().token();
  if (token === null) return;

  console.log("[FCM] Token received: " + token);
  if (tokenRefreshListener) tokenRefreshListener({ token: token });

  _resolveTokenPromises(token);
  _connectToFCM();
}

function _resolveTokenPromises(token) {
  var promises = tokenPromises;
  tokenPromises = [];
  for (var p of promises) p(token);
}

function _hasPermission() {
  var settings = UIApplication.sharedApplication().currentUserNotificationSettings();
  var types = UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound;
  return settings.types & types;
}

function _registerForNotifications() {
  var notificationTypes = UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound | UIUserNotificationActivationModeBackground;
  var notificationSettings = UIUserNotificationSettings.settingsForTypesCategories(notificationTypes, null);
  var app = UIApplication.sharedApplication();
  app.registerUserNotificationSettings(notificationSettings);
  app.registerForRemoteNotifications();
}

function _onPermissionRequestResult(result) {
  permissionGranted = result.userInfo.objectForKey('message') != "false";

  var promises = permissionPromises;
  permissionPromises = [];
  for (var p of promises) p(permissionGranted);
}

function objcToJS(objCObj) {
  if (objCObj === null || typeof objCObj != "object") {
    return objCObj;
  }
  var node, key, i, l, oKeyArr = objCObj.allKeys;

  if (oKeyArr === undefined) {
    // array
    node = [];
    for (i = 0, l = objCObj.count; i < l; i++) {
      key = objCObj.objectAtIndex(i);
      node.push(objcToJS(key));
    }
  } else {
    // object
    node = {};
    for (i = 0, l = oKeyArr.count; i < l; i++) {
      key = oKeyArr.objectAtIndex(i);
      var val = objCObj.valueForKey(key);

      switch (types.getClass(val)) {
        case 'NSMutableArray':
          node[key] = objcToJS(val);
          break;
        case 'NSMutableDictionary':
          node[key] = objcToJS(val);
          break;
        case 'String':
          node[key] = String(val);
          break;
        case 'Boolean':
          node[key] = val;
          break;
        case 'Number':
          node[key] = Number(String(val));
          break;
      }
    }
  }
  return node;
}

// ------------------------------------------------------------------------------------------------
// FCM
// ------------------------------------------------------------------------------------------------

function _connectToFCM() {
  FIRMessaging.messaging().connectWithCompletion(function(error) {
    if (error) {
      console.log("[FCM] Connection failed: " + error);
    } else {
      console.log("[FCM] Connected");
    }
  });
}

function _disconnectFromFCM() {
  FIRMessaging.messaging().disconnect();
}

// ------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------

FCM.init                     = init;
FCM.setTokenRefreshListener  = setTokenRefreshListener;
FCM.setMessageListener       = setMessageListener;
FCM.registerForNotifications = registerForNotifications;
FCM.requestToken             = requestToken;
FCM.subscribeToTopic         = subscribeToTopic;
FCM.unsubscribeFromTopic     = unsubscribeFromTopic;
FCM.launchNotificationData   = launchNotificationData;

// iOS specific
FCM.objcToJS                 = objcToJS;

module.exports = FCM;
