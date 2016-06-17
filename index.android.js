var FCM         = require("./index-common.js");

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
// Exports
// ------------------------------------------------------------------------------------------------

FCM.setTokenRefreshListener = setTokenRefreshListener;
FCM.setMessageListener      = setMessageListener;
FCM.getToken                = getToken;
FCM.subscribeToTopic        = subscribeToTopic;
FCM.unsubscribeFromTopic    = unsubscribeFromTopic;
FCM.launchNotificationData  = launchNotificationData;

module.exports = FCM;
