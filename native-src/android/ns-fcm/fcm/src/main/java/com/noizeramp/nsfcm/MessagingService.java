package com.noizeramp.nsfcm;

import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

/**
 * Message handler.
 */
public class MessagingService extends FirebaseMessagingService {
    private static final String TAG = "NSFCM.MessagingService";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        Log.d(TAG, "New Message 2: " + remoteMessage.getNotification().getBody());

        try {
            // Message package
            JsonObjectExtended message = new JsonObjectExtended();
            message.put("from", remoteMessage.getFrom());
            message.put("to", remoteMessage.getTo());
            message.put("collapseKey", remoteMessage.getCollapseKey());
            message.put("messageId", remoteMessage.getMessageId());
            message.put("messageType", remoteMessage.getMessageType());
            message.put("sentTime", remoteMessage.getSentTime());
            message.put("ttl", remoteMessage.getTtl());

            RemoteMessage.Notification notification = remoteMessage.getNotification();
            message.put("body", notification.getBody());
            message.put("title", notification.getTitle());
            message.put("color", notification.getColor());
            message.put("icon", notification.getIcon());
            message.put("sound", notification.getSound());
            message.put("tag", notification.getTag());

            // Prepare data package
            Map<String, String> dataObj = remoteMessage.getData();
            JSONObject data = new JSONObject();
            for (String key : dataObj.keySet()) data.put(key, dataObj.get(key));

            Plugin.executeOnMessageReceivedCallback(message, data);
        } catch (JSONException e) {
            Log.e(TAG, "Failed to build JSON package for message callback: " + e.getMessage());
        }
    }
}
