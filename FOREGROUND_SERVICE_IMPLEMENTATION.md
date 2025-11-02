# Orvio Foreground Service Implementation

## Summary of Changes

This document outlines all the changes made to implement an optional foreground service for reliable FCM message handling in the background, plus the fix for cashback points handling.

## Features Added

### 1. Optional Foreground Service
- **Purpose**: Keeps the app alive in the background to reliably receive and process FCM messages for SMS sending
- **User Control**: Completely optional - users can enable/disable via a toggle in the home screen
- **Smart Permissions**: Automatically requests POST_NOTIFICATIONS permission only when user enables the service (Android 13+)
- **Persistent Notification**: Shows a low-priority, non-intrusive notification when service is running

### 2. Cashback Points Float Support
- **Fixed**: Changed cashback points from Int to Float to handle decimal values
- **Display**: Shows cashback points with 2 decimal places (e.g., "123.45")

## Files Created

### 1. SettingsManager.kt
**Location**: `app/src/main/java/com/orvio/app/data/local/SettingsManager.kt`
- Uses DataStore Preferences to persist user's foreground service preference
- Provides Flow-based state management for reactive UI updates
- Singleton scoped for app-wide access

### 2. ForegroundServiceManager.kt
**Location**: `app/src/main/java/com/orvio/app/service/ForegroundServiceManager.kt`
- Manages foreground service lifecycle (start/stop)
- Creates and manages the persistent notification
- Handles notification channel setup for Android 8+
- Provides service running state tracking

### 3. ForegroundServiceCard.kt
**Location**: `app/src/main/java/com/orvio/app/presentation/dashboard/ForegroundServiceCard.kt`
- UI component for the foreground service toggle
- Displays service status (active/inactive)
- Handles permission request flow for Android 13+
- Shows helpful description of what the service does

## Files Modified

### 1. AndroidManifest.xml
**Changes**:
- Added `FOREGROUND_SERVICE` permission
- Added `FOREGROUND_SERVICE_DATA_SYNC` permission
- Updated FCM service with `foregroundServiceType="dataSync"`

### 2. OrvioFirebaseMessagingService.kt
**Changes**:
- Injected `ForegroundServiceManager`
- Added `onStartCommand()` to handle foreground service lifecycle
- Supports START_FOREGROUND_SERVICE and STOP_FOREGROUND_SERVICE actions
- Tracks foreground running state with `isRunningInForeground` flag
- Returns `START_STICKY` to ensure service restarts if killed

### 3. HomeViewModel.kt
**Changes**:
- Injected `SettingsManager` and `ForegroundServiceManager`
- Added `_isForegroundServiceEnabled` state flow
- Changed `_cashbackPoints` from Int to Float
- Added `setForegroundServiceEnabled()` function to handle toggle
- Loads and applies foreground service preference on init
- Automatically starts service if preference is enabled

### 4. HomeTab.kt
**Changes**:
- Added `ForegroundServiceCard` to the home screen layout
- Positioned after WelcomeCard for visibility
- Wired up toggle to ViewModel's `setForegroundServiceEnabled()`
- Collects and displays `isForegroundServiceEnabled` state

### 5. UserStats.kt (Model)
**Changes**:
- Changed `CreditStats.cashbackPoints` from `Int` to `Float`
- Changed default value from `0` to `0f`

## How It Works

### Foreground Service Flow:

1. **User Enables Service**:
   - User toggles switch on home screen
   - If Android 13+: App requests POST_NOTIFICATIONS permission
   - Once permission granted (or not needed): ViewModel calls `setForegroundServiceEnabled(true)`
   - Preference is saved to DataStore
   - `ForegroundServiceManager.startForegroundService()` is called
   - FCM service receives START_FOREGROUND_SERVICE intent
   - Service calls `startForeground()` with persistent notification
   - Service continues running even when app is backgrounded

2. **User Disables Service**:
   - User toggles switch off
   - ViewModel calls `setForegroundServiceEnabled(false)`
   - Preference is saved to DataStore
   - `ForegroundServiceManager.stopForegroundService()` is called
   - FCM service receives STOP_FOREGROUND_SERVICE intent
   - Service calls `stopForeground(STOP_FOREGROUND_REMOVE)`
   - Notification is removed

3. **App Restart**:
   - On init, HomeViewModel loads preference from DataStore
   - If enabled: Automatically starts foreground service
   - Service state is restored without user action

### Notification Details:
- **Channel**: "Orvio Service" (low importance = no sound)
- **Title**: "Orvio is running"
- **Content**: "Ready to receive and send SMS messages"
- **Type**: Ongoing (cannot be dismissed by user while service running)
- **Priority**: Low (minimally intrusive)
- **Tap Action**: Opens MainActivity

## Benefits

1. **Reliability**: FCM messages are processed even when device kills background apps
2. **User Control**: Users decide if they want the persistent notification
3. **Battery Aware**: Low-priority notification, service only runs when needed
4. **Persistent**: Service automatically restarts after device optimization or app kill
5. **Clean UX**: Permission only requested when user opts in
6. **State Persistence**: User's preference survives app restarts

## Testing Checklist

- [ ] Toggle service on/off multiple times
- [ ] Verify notification appears when enabled
- [ ] Verify notification disappears when disabled
- [ ] Test FCM message reception with service enabled vs disabled
- [ ] Test on Android 13+ devices (permission flow)
- [ ] Test on Android <13 devices (no permission needed)
- [ ] Kill app and verify service restarts if enabled
- [ ] Restart device and verify preference is restored
- [ ] Check battery usage with service running
- [ ] Verify SMS sending works in background with service enabled
- [ ] Test cashback points display with decimal values (e.g., 123.45)

## Dependencies Used

- **DataStore Preferences**: Already included (`androidx.datastore:datastore-preferences:1.0.0`)
- **Hilt**: Already included for dependency injection
- **Accompanist Permissions**: Already included for permission handling

## Architecture Notes

- Follows MVVM pattern
- Uses Kotlin Flows for reactive state management
- Leverages Hilt for dependency injection
- Maintains separation of concerns (Manager → ViewModel → UI)
- Persistent storage via DataStore (replaces SharedPreferences)
