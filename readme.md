NativeScript Firebase Cloud Messaging
=====================================

This is the plugin that adds FCM support to a NativeScript app.



WORK IN PROGRESS... Stay tuned.



Prerequisites for Android
-------------------------

* Google Play services 30
* Google Repository 28
* google-services.json generated in the Firebase Console
  (https://console.firebase.google.com) for your project.



Installation for Android
------------------------

* In `app/App_Resources/Android/app.gradle` add your app ID (you can
  find it in `package.json`):

      android {
        defaultConfig {
          ...
          applicationId "com.myapp.id"
          ...
        }
      }

* In `platforms/android/build.gradle`...

  * Near the top add Google Services to the dependencies section like
    this (gradle classpath should already be there):

        dependencies {
          classpath "com.android.tools.build:gradle:1.5.0"
         classpath "com.google.gms:google-services:3.0.0"
        }

  * At the very bottom add Google Services plugin:

          apply plugin: "com.google.gms.google-services"

* Put your `google-services.json` into `platforms/android/` folder.



Troubleshooting for Android
---------------------------

*TNS build says it can't find firebase-messaging or firebase-core.*

You don't have correct Play services / repository SDK installed. Launch
Android SDK Manager and look for them in the Extras section.

*TNS build says: "File google-services.json is missing. The Google Services Plugin cannot function without it."*

Put your `google-services.json` into `platforms/android`. You may want a
custom script that does that before the build, as this dir can be
removed.


API Example
-----------

    var FCM = require('nativescript-fcm');

    // Register token refresh listener
    FCM.setTokenRefreshListener(function(e) {
      sendTokenToBackend(e.token);
    });

    // Register message listener
    FCM.setMessageListener(function(message, data) {
      // message.messageId
      // message.messageType
      // message.sentTime
      // message.ttl
      // message.from
      // message.to
      // message.body
      // message.title
      // message.icon
      // message.sound
      // message.tag
      // message.color

      // #data contains your custom key / values
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
