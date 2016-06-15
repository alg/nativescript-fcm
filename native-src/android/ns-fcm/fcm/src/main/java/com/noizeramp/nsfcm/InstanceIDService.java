package com.noizeramp.nsfcm;

import android.util.Log;

import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.FirebaseInstanceIdService;

/**
 * Instance ID listener service.
 */
public class InstanceIDService extends FirebaseInstanceIdService {
    private static final String TAG = "NSFCM.InstanceIDService";

    @Override
    public void onTokenRefresh() {
        String refreshedToken = FirebaseInstanceId.getInstance().getToken();
        Log.d(TAG, "Refreshed token: " + refreshedToken);
        Plugin.executeOnTokenRefreshCallback(refreshedToken);
    }
}
