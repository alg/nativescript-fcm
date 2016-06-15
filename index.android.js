var FCM         = require("./index-common.js");
var Application = require('application');

var context     = Application.android.context;
var Plugin      = com.noizeramp.Plugin;

// ------------------------------------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------------------------------------

/**
 * Registers onTokenRefresh listener.
 */
function setOnTokenRefreshListener(listener) {
  Plugin.setOnTokenRefreshListener(new Listener({ callback: listener }));
}

/**
 * Registers message listener.
 */
function setOnMessageListener(listener) {
  Plugin.setOnMessageListener(new Listener({ callback: listener }));
}

/**
 * Requests the registration token.
 */
function getToken() {
  return Plugin.getToken(context);
}

/**
 * Subscribes to a certain topic.
 */
function subscribe(topic) {
  Plugin.subscribe(context, topic);
}

/**
 * Unsubscribes from a certain topic.
 */
function unsubscribe(topic) {
  Plugin.unsubscribe(context, topic);
}


// ------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------

FCM.setOnTokenRefreshListener = setOnTokenRefreshListener;
FCM.setOnMessageListener      = setOnMessageListener;
FCM.getToken                  = getToken;
FCM.subscribe                 = subscribe;
FCM.unsubscribe               = unsubscribe;

module.exports = FCM;
