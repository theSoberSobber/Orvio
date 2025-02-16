package com.orvio

import android.Manifest
import android.app.Activity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.Uri
import android.telephony.SmsManager
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*

// TODO: use sent intents and resolve only when sent/delivered (using delivered intents)
// you have 60 seconds to handle the onbackgroundmessage thing
// https://rnfirebase.io/messaging/usage#background-handler-timeout-android
class SmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "SmsModule"
    }

    @ReactMethod
    fun sendSms(phoneNumber: String, message: String, promise: Promise) {
        val context = reactApplicationContext

        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.SEND_SMS) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_DENIED", "SMS permission not granted")
            return
        }

        val smsManager = SmsManager.getDefault();
        try {
            smsManager.sendTextMessage(phoneNumber, null, message, null, null);
            promise.resolve("Sent the Message!");
        } catch (e: Exception) {
            Log.e("SmsModule", "Failed to send SMS", e)
            promise.reject("SMS_FAILED", "Failed to send SMS: ${e.message}")
        }        
    }
}