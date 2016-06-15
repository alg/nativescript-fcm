package com.noizeramp.nsfcm;

import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;

public class HandlerActivity extends AppCompatActivity {

    private static final String TAG = "NSFCM.HandlerActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        boolean isPluginActive = Plugin.isActive;
        processPushBundle(isPluginActive);

        finish();

        if (!isPluginActive) forceMainActivityReload();
    }

    private void forceMainActivityReload() {
        PackageManager pm = getPackageManager();
        Intent launchIntent = pm.getLaunchIntentForPackage(getApplicationContext().getPackageName());
        Log.d(TAG, "Starting activity for package: " + getApplicationContext().getPackageName());
        launchIntent.setPackage(null);
        startActivity(launchIntent);
    }

    private void processPushBundle(boolean isPluginActive) {
        Bundle extras = getIntent().getExtras();
        Log.d(TAG, "Processing push extras: isPluginActive = " + isPluginActive);

        if (extras != null) {
            Log.d(TAG, "Has extras");
            Bundle originalExtras = extras.getBundle("pushBundle");

            originalExtras.putBoolean("foreground", false);
            originalExtras.putBoolean("coldstart", !isPluginActive);

            //Plugin.executeOnMessageReceivedCallback(originalExtras, null);
        }
    }

    @Override
    protected void onResume() {
        Log.d(TAG, "On resume");
        super.onResume();
        final NotificationManager notificationManager = (NotificationManager) this.getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.cancelAll();
    }
}
