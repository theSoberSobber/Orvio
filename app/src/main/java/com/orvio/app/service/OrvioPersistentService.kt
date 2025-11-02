package com.orvio.app.service

import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.util.Log
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class OrvioPersistentService : Service() {
    
    @Inject
    lateinit var foregroundServiceManager: ForegroundServiceManager
    
    companion object {
        private const val TAG = "OrvioPersistentService"
    }
    
    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service created")
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "START_FOREGROUND_SERVICE" -> {
                Log.d(TAG, "Starting foreground service")
                val notification = foregroundServiceManager.createForegroundNotification()
                startForeground(ForegroundServiceManager.FOREGROUND_NOTIFICATION_ID, notification)
            }
            "STOP_FOREGROUND_SERVICE" -> {
                Log.d(TAG, "Stopping foreground service")
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
    
    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service destroyed")
    }
}
