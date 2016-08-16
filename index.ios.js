var FCM         = require("./index-common.js");
var Application = require("application");

var messageListener = null;
var tokenRefreshListener = null;
var tokenPromises = [];

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

  // Subscribe to token refreshes
  NSNotificationCenter.defaultCenter().addObserverForNameObjectQueueUsingBlock(
    "kFIRInstanceIDTokenRefreshNotification",
    null,
    NSOperationQueue.mainQueue(),
    _onTokenRefresh);

  _addMethodsToDelegate();

  // Configure the application
  FIRApp.configure();
}

/**
 * Registers for notifications.
 */
function registerForNotifications() {
  var notificationTypes = UIUserNotificationTypeAlert | UIUserNotificationTypeBadge | UIUserNotificationTypeSound | UIUserNotificationActivationModeBackground;
  var notificationSettings = UIUserNotificationSettings.settingsForTypesCategories(notificationTypes, null);
  Application.registerUserNotificationSettings(notificationSettings);
  Application.registerForRemoteNotifications();
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

  delegate.applicationDidBecomeActive = function(_application) {
    _connectToFCM();
  };

  delegate.applicationDidEnterBackground = function(_application) {
    _disconnectFromFCM();
  };
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
  tokenPromises = null;

  for (var p of promises) p(token);
}

// ------------------------------------------------------------------------------------------------
// FCM
// ------------------------------------------------------------------------------------------------

function _connectToFCM() {
  console.log("Connect to FCM");
}

function _disconnectFromFCM() {
  console.log("Disconnect from FCM");
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
