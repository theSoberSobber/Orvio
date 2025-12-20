package com.orvio.app.presentation.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.orvio.app.R
import com.orvio.app.presentation.theme.ExpressiveButton
import com.orvio.app.presentation.theme.ExpressiveCard
import com.orvio.app.presentation.theme.ExpressiveOutlinedTextField
import com.orvio.app.utils.DeviceUtils
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject

@Composable
fun LoginScreen(
    onNavigateToOtp: (String, String) -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val snackbarHostState = remember { SnackbarHostState() }
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.errorMessage.collectAsState()
    
    var phoneNumber by remember { mutableStateOf("") }
    var showError by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        val devicePhoneNumber = viewModel.getDevicePhoneNumber()
        if (devicePhoneNumber.isNotEmpty()) {
            // Clean the phone number: remove country code, spaces, dashes, etc.
            val cleanNumber = devicePhoneNumber
                .replace("+91", "")
                .replace("+", "")
                .replace(Regex("[^0-9]"), "")
                .takeLast(10) // Take last 10 digits in case there's country code
            
            if (cleanNumber.length == 10) {
                phoneNumber = cleanNumber
            } else if (cleanNumber.length > 10) {
                // If more than 10 digits, take the last 10
                phoneNumber = cleanNumber.takeLast(10)
            } else {
                phoneNumber = cleanNumber
            }
        }
    }
    
    LaunchedEffect(error) {
        error?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearError()
        }
    }
    
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(80.dp))
            
            // App branding
            ExpressiveCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 32.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = stringResource(R.string.login_title),
                        style = MaterialTheme.typography.headlineMedium
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = stringResource(R.string.login_subtitle),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            // Phone input card
            ExpressiveCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    ExpressiveOutlinedTextField(
                        value = phoneNumber,
                        onValueChange = { },
                        leadingIcon = {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(start = 12.dp)
                            ) {
                                Text(
                                    text = "🇮🇳",
                                    fontSize = 24.sp,
                                    modifier = Modifier.padding(end = 8.dp)
                                )
                                
                                Text(
                                    text = "+91",
                                    style = MaterialTheme.typography.titleMedium,
                                    modifier = Modifier.padding(end = 12.dp)
                                )
                            }
                        },
                        label = { Text("Phone Number") },
                        placeholder = { Text(stringResource(R.string.enter_phone_hint)) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine = true,
                        enabled = false,
                        isError = phoneNumber.isEmpty() || phoneNumber.length != 10,
                        supportingText = if (phoneNumber.isEmpty()) {
                            { 
                                Text(
                                    "Unable to read phone number from device",
                                    color = MaterialTheme.colorScheme.error
                                )
                            }
                        } else if (phoneNumber.length != 10) {
                            {
                                Text(
                                    "Invalid phone number format",
                                    color = MaterialTheme.colorScheme.error
                                )
                            }
                        } else null,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            ExpressiveButton(
                onClick = {
                    if (phoneNumber.length == 10) {
                        viewModel.sendOtp("+91$phoneNumber") { transactionId ->
                            onNavigateToOtp(transactionId, "+91$phoneNumber")
                        }
                    } else {
                        viewModel.showError("Unable to read phone number from device")
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading && phoneNumber.length == 10
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = stringResource(R.string.continue_button),
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            }
            
            Spacer(modifier = Modifier.weight(1f))
        }
    }
} 