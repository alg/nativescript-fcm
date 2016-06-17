package com.noizeramp.nsfcm;

import android.content.Context;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.messaging.FirebaseMessaging;

import org.json.JSONObject;

/**
 * NativeScript FCM plugin core.
 */
public class Plugin {

    static boolean isActive = false;

    private static Listener tokenRefreshListener = null;
    private static Listener messageListener = null;

    /**
     * Requests the registration token from Firebase.
     *
     * @return registration token.
     */
    public static String getToken() {
        return FirebaseInstanceId.getInstance().getToken();
    }

    /**
     * Sets token refresh listener.
     *
     * @param listener listener.
     */
    public static void setTokenRefreshListener(Listener listener) {
        tokenRefreshListener = listener;
    }

    /**
     * Sets message listener.
     *
     * @param listener listener.
     */
    public static void setMessageListener(Listener listener) {
        messageListener = listener;
    }

    /**
     * Subscribes to the given topic.
     *
     * @param topic     topic name.
     */
    public static void subscribeToTopic(String topic) {
        FirebaseMessaging.getInstance().subscribeToTopic(topic);
    }

    /**
     * Unsubscribes from the given topic.
     *
     * @param topic     topic name.
     */
    public static void unsubscribeFromTopic(String topic) {
        FirebaseMessaging.getInstance().unsubscribeFromTopic(topic);
    }

    static void executeOnMessageReceivedCallback(JSONObject message, JSONObject data) {
        if (messageListener != null) messageListener.callback(message.toString(), data.toString());
    }

    static void executeOnTokenRefreshCallback(String token) {
        if (tokenRefreshListener != null) tokenRefreshListener.callback(token);
    }
}
