package com.orvio.app.presentation.navigation

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.orvio.app.presentation.auth.AuthViewModel
import com.orvio.app.presentation.auth.LoginScreen
import com.orvio.app.presentation.auth.OtpScreen
import com.orvio.app.presentation.dashboard.DashboardScreen
import com.orvio.app.presentation.splash.SplashScreen
import com.orvio.app.screens.onboarding.PhonePermissionScreen
import com.orvio.app.screens.onboarding.SmsPermissionScreen
import com.orvio.app.utils.PermissionHandler
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject

@Composable
fun Navigation(
    @ApplicationContext context: Context
) {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = hiltViewModel()
    val isLoggedIn by authViewModel.isLoggedIn.collectAsState(initial = null)
    
    // Flag to track whether auth status has been checked
    var hasCheckedAuthStatus by rememberSaveable { mutableStateOf(false) }
    
    // Check permissions - use rememberSaveable to survive config changes
    val hasPhonePermissions = rememberSaveable { 
        PermissionHandler.hasPermissions(context, PermissionHandler.phonePermissions)
    }
    val hasSmsPermissions = rememberSaveable {
        PermissionHandler.hasPermissions(context, PermissionHandler.smsPermissions)
    }
    
    // Start with the splash screen
    NavHost(
        navController = navController,
        startDestination = Route.Splash.route
    ) {
        composable(Route.Splash.route) {
            SplashScreen(
                onCheckComplete = {
                    // Only check auth once we have a definite value (not null)
                    if (isLoggedIn != null) {
                        hasCheckedAuthStatus = true
                        if (isLoggedIn == true) {
                            navController.navigate(Route.Dashboard.route) {
                                popUpTo(Route.Splash.route) { inclusive = true }
                            }
                        } else if (!hasPhonePermissions) {
                            navController.navigate(Route.PhonePermission.route) {
                                popUpTo(Route.Splash.route) { inclusive = true }
                            }
                        } else if (!hasSmsPermissions) {
                            navController.navigate(Route.SmsPermission.route) {
                                popUpTo(Route.Splash.route) { inclusive = true }
                            }
                        } else {
                            navController.navigate(Route.Login.route) {
                                popUpTo(Route.Splash.route) { inclusive = true }
                            }
                        }
                    }
                }
            )
        }
        
        composable(Route.PhonePermission.route) {
            PhonePermissionScreen(
                navController = navController,
                onPermissionGranted = {
                    if (PermissionHandler.hasPermissions(context, PermissionHandler.smsPermissions)) {
                        navController.navigate(Route.Login.route) {
                            popUpTo(Route.PhonePermission.route) { inclusive = true }
                        }
                    } else {
                        navController.navigate(Route.SmsPermission.route)
                    }
                }
            )
        }

        composable(Route.SmsPermission.route) {
            SmsPermissionScreen(
                navController = navController,
                onPermissionGranted = {
                    navController.navigate(Route.Login.route) {
                        popUpTo(Route.PhonePermission.route) { inclusive = true }
                    }
                }
            )
        }
    
        composable(Route.Login.route) {
            LoginScreen(
                onNavigateToOtp = { transactionId, phoneNumber ->
                    navController.navigate(Route.Otp.createRoute(transactionId, phoneNumber))
                }
            )
        }
        
        composable(
            route = Route.Otp.route,
            arguments = listOf(
                navArgument("transactionId") { type = NavType.StringType },
                navArgument("phoneNumber") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val transactionId = backStackEntry.arguments?.getString("transactionId") ?: ""
            val phoneNumber = backStackEntry.arguments?.getString("phoneNumber") ?: ""
            
            OtpScreen(
                transactionId = transactionId,
                phoneNumber = phoneNumber,
                onNavigateBack = { navController.popBackStack() },
                onNavigateToDashboard = {
                    navController.navigate(Route.Dashboard.route) {
                        popUpTo(Route.PhonePermission.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Route.Dashboard.route) {
            DashboardScreen(
                onLogout = {
                    authViewModel.logout()
                    navController.navigate(Route.PhonePermission.route) {
                        popUpTo(Route.Dashboard.route) { inclusive = true }
                    }
                }
            )
        }
    }
    
    // If auth status changes after initial check (e.g., token expires), handle it
    LaunchedEffect(isLoggedIn, hasCheckedAuthStatus) {
        // Only react to auth changes after initial check and when we have a definite value
        if (hasCheckedAuthStatus && isLoggedIn != null) {
            val currentRoute = navController.currentDestination?.route
            
            // Navigate to dashboard if logged in and not already there
            if (isLoggedIn == true && currentRoute != Route.Dashboard.route) {
                navController.navigate(Route.Dashboard.route) {
                    popUpTo(0) { inclusive = true }
                }
            } 
            // Navigate to login flow if logged out and currently in dashboard
            else if (isLoggedIn == false && currentRoute == Route.Dashboard.route) {
                navController.navigate(Route.PhonePermission.route) {
                    popUpTo(0) { inclusive = true }
                }
            }
        }
    }
} 