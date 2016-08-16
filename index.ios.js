var FCM         = require("./index-common.js");
var Application = require("application");

var messageListener = null;
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
  if (Application.ios.delegate === undefined) {
    Application.ios.delegate = UIResponder.extend({}, { name: "AppDelegate", protocols: [UIApplicationDelegate] });
  }

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

  _addMethodsToDelegate();

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
      console.log("Error in FCM.requestPermission: " + ex);
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
function setMessageListener(listener) {
  messageListener = listener;
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

function _addMethodsToDelegate() {
  var delegate = Application.ios.delegate;

  delegate.applicationDidReceiveRemoteNotificationFetchCompletionHandler = function(_application, userInfo, _completionHandler) {
    console.log("Notification received");
    console.log(JSON.stringify(userInfo));
    messageListener(userInfo, {});
  };

  Application.on(Application.resumeEvent, _connectToFCM);
  Application.on(Application.suspendEvent, _disconnectFromFCM);
}

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

// ------------------------------------------------------------------------------------------------
// FCM
// ------------------------------------------------------------------------------------------------

function _connectToFCM() {
  console.log("Connect to FCM");
  FIRMessaging.messaging().connectWithCompletion(function(error) {
    if (error) {
      console.log("Firebase was unable to connect to FCM. Error: " + error);
    } else {
      console.log("Connected to FCM");
    }
  });
}

function _disconnectFromFCM() {
  console.log("Disconnect from FCM");
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

module.exports = FCM;
