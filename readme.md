NativeScript Firebase Cloud Messaging
=====================================

This is the plugin that adds FCM support to a NativeScript app.



WORK IN PROGRESS... Stay tuned.



API Example
-----------

    var FCM = require('nativescript-fcm');

    // Register token refresh listener
    FCM.setOnTokenRefreshListener(function(e) {
      sendTokenToBackend(e.token);
    });

    // Register message listener
    FCM.setOnMessageListener(function(e) {
      // e.messageId
      // e.messageType
      // e.sentTime
      // e.ttl
      // e.from
      // e.to
      // e.data - { key: val, key2: val }
      // e.body
      // e.title
      // e.icon
      // e.sound
      // e.tag
      // e.color
    });

    // Start by requesting the token and sending it to the server.
    // When token changes, you will receive EVENT_TOKEN_REFRESH event.
    var token = FCM.getToken();
    if (token) {
      sendTokenToBackend(token);

      // (Optionally) subscribe to a topic
      FCM.subscribe("news");
    } else {
      // ... Unable to get token ...
    }
