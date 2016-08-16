var FCM         = require("./index-common.js");

var Plugin      = com.noizeramp.nsfcm.Plugin;
var Listener    = com.noizeramp.nsfcm.Listener;

var tokenPromises = [];
var tokenRefreshListener = null;

// ------------------------------------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------------------------------------

/**
 * Initializes the handlers, but doesn't ask for permissions or requesting tokens yet.
 */
function init() {
  Plugin.setTokenRefreshListener(new Listener({ callback: _onTokenRefresh }));
}

/**
 * Registers for notifications.
 * Returns Promise<boolean>
 */
function registerForNotifications() {
  return new Promise(function(resolve, _reject) { resolve(true); });
}

/**
 * Requests the registration token.
 */
function requestToken() {
  return new Promise(function(resolve, _reject) {
    var token = Plugin.getToken();
    if (token) {
      resolve(token);

      _resolveTokenPromises(token);
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
  Plugin.setMessageListener(new Listener({ callback: function(messageJSON, dataJSON) {
    var message = messageJSON && JSON.parse(messageJSON);
    var data    = dataJSON && JSON.parse(dataJSON);

    listener(message, data);
  }}));
}

/**
 * Subscribes to a certain topic.
 */
function subscribeToTopic(topic) {
  Plugin.subscribeToTopic(topic);
}

/**
 * Unsubscribes from a certain topic.
 */
function unsubscribeFromTopic(topic) {
  Plugin.unsubscribeFromTopic(topic);
}

/**
 * Returns whatever launch options we are passed by the OS in case the app was launched
 * from a notification tap. If it's a normal launch, #false is returned.
 */
function launchNotificationData(args) {
  if (args.android) {
    var extras = args.android.getExtras();
    if (extras) {
      var from = extras.getString("from");
      if (from) {
        var keys = extras.keySet().toArray();
        var data = {};
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          data[key] = extras.getString(key);
        }
        return data;
      }
    }
  }

  return false;
}

// ------------------------------------------------------------------------------------------------
// Private methods
// ------------------------------------------------------------------------------------------------

function _resolveTokenPromises(token) {
  var promises = tokenPromises;
  tokenPromises = null;

  for (var p of promises) p(token);
}

function _onTokenRefresh() {
  var token = Plugin.getToken();
  if (token === null) return;

  console.log("[FCM] Token received: " + token);
  if (tokenRefreshListener) tokenRefreshListener({ token: token });

  _resolveTokenPromises(token);
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
