package com.orvio.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.settingsDataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

@Singleton
class SettingsManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val dataStore = context.settingsDataStore
    
    companion object {
        private val FOREGROUND_SERVICE_ENABLED = booleanPreferencesKey("foreground_service_enabled")
    }
    
    val isForegroundServiceEnabled: Flow<Boolean> = dataStore.data
        .map { preferences ->
            preferences[FOREGROUND_SERVICE_ENABLED] ?: false
        }
    
    suspend fun setForegroundServiceEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[FOREGROUND_SERVICE_ENABLED] = enabled
        }
    }
}
