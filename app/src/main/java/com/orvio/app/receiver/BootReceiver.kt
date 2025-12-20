package com.orvio.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.orvio.app.data.local.SettingsManager
import com.orvio.app.service.ForegroundServiceManager
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {
    
    @Inject
    lateinit var settingsManager: SettingsManager
    
    @Inject
    lateinit var foregroundServiceManager: ForegroundServiceManager
    
    companion object {
        private const val TAG = "BootReceiver"
    }
    
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d(TAG, "Boot completed, checking if foreground service should start")
            
            // Use goAsync to allow async operations
            val pendingResult = goAsync()
            
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    // Check if user had foreground service enabled
                    val wasServiceEnabled = settingsManager.isForegroundServiceEnabled.first()
                    
                    if (wasServiceEnabled) {
                        Log.d(TAG, "Foreground service was enabled, attempting to restart")
                        foregroundServiceManager.startForegroundService()
                        Log.d(TAG, "Foreground service restarted successfully")
                    } else {
                        Log.d(TAG, "Foreground service was not enabled, skipping auto-start")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to restart foreground service on boot", e)
                } finally {
                    pendingResult.finish()
                }
            }
        }
    }
}
