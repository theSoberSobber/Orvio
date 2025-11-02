package com.orvio.app.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.orvio.app.R
import com.orvio.app.presentation.MainActivity
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ForegroundServiceManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "ForegroundServiceMgr"
        private const val FOREGROUND_CHANNEL_ID = "orvio_foreground_service"
        const val FOREGROUND_NOTIFICATION_ID = 1001
        
        var isForegroundServiceRunning = false
            private set
    }
    
    init {
        createForegroundNotificationChannel()
    }
    
    private fun createForegroundNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Orvio Service"
            val descriptionText = "Keeps Orvio running to receive SMS requests"
            val importance = NotificationManager.IMPORTANCE_LOW // Low importance = no sound
            val channel = NotificationChannel(FOREGROUND_CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
            }
            
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    fun createForegroundNotification(): Notification {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        return NotificationCompat.Builder(context, FOREGROUND_CHANNEL_ID)
            .setContentTitle("Orvio is running")
            .setContentText("Ready to receive and send SMS messages")
            .setSmallIcon(R.drawable.ic_notification)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }
    
    fun startForegroundService() {
        try {
            Log.d(TAG, "Starting foreground service")
            val intent = Intent(context, OrvioPersistentService::class.java).apply {
                action = "START_FOREGROUND_SERVICE"
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
            
            isForegroundServiceRunning = true
            Log.d(TAG, "Foreground service started successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start foreground service", e)
            isForegroundServiceRunning = false
        }
    }
    
    fun stopForegroundService() {
        try {
            Log.d(TAG, "Stopping foreground service")
            val intent = Intent(context, OrvioPersistentService::class.java).apply {
                action = "STOP_FOREGROUND_SERVICE"
            }
            context.startService(intent)
            
            isForegroundServiceRunning = false
            Log.d(TAG, "Foreground service stopped successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop foreground service", e)
        }
    }
}
