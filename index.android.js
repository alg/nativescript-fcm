var FCM = require("./index-common.js");

// ------------------------------------------------------------------------------------------------
// Events
// ------------------------------------------------------------------------------------------------

/**
 * Sent on token refresh.
 */
var EVENT_TOKEN_REFRESH    = "token";

/**
 * Sent on new message.
 */
var EVENT_MESSAGE_RECEIVED = "message";

// ------------------------------------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------------------------------------

/**
 * Adds event listener.
 */
function addEventListener(event, listener) {
}

/**
 * Removes event listener.
 */
function removeEventListener(event, listener) {
}

/**
 * Requests the registration token.
 */
function getToken() {
}

/**
 * Subscribes to a certain topic.
 */
function subscribe(topic) {
}

/**
 * Unsubscribes from a certain topic.
 */
function unsubscribe(topic) {
}


// ------------------------------------------------------------------------------------------------
// Exports
// ------------------------------------------------------------------------------------------------

FCM.addEventListener    = addEventListener;
FCM.removeEventListener = removeEventListener;
FCM.getToken            = getToken;
FCM.subscribe           = subscribe;
FCM.unsubscribe         = unsubscribe;

module.exports = FCM;
