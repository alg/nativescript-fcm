var FCM         = require("./index-common.js");
var Application = require('application');

var context     = Application.android.context;
var Plugin      = com.noizeramp.nsfcm.Plugin;
var Listener    = com.noizeramp.nsfcm.Listener;

// ------------------------------------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------------------------------------

/**
 * Registers onTokenRefresh listener.
 */
function setTokenRefreshListener(listener) {
  Plugin.setTokenRefreshListener(new Listener({ callback: listener}));
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
 * Requests the registration token.
 */
function getToken() {
  return Plugin.getToken();
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

FCM.setTokenRefreshListener = setTokenRefreshListener;
FCM.setMessageListener      = setMessageListener;
FCM.getToken                = getToken;
FCM.subscribe               = subscribe;
FCM.unsubscribe             = unsubscribe;

module.exports = FCM;
