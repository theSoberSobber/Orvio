package com.orvio.app.presentation.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.orvio.app.R
import com.orvio.app.presentation.theme.ExpressiveButton
import com.orvio.app.presentation.theme.ExpressiveCard
import com.orvio.app.presentation.theme.ExpressiveTextButton
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OtpScreen(
    transactionId: String,
    phoneNumber: String,
    onNavigateBack: () -> Unit,
    onNavigateToDashboard: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val snackbarHostState = remember { SnackbarHostState() }
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.errorMessage.collectAsState()
    
    var otpValue by remember { mutableStateOf("") }
    var resendEnabled by remember { mutableStateOf(false) }
    var countdown by remember { mutableStateOf(30) }
    
    // Focus requester for OTP field
    val focusRequester = remember { FocusRequester() }
    
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
        while (countdown > 0) {
            delay(1000)
            countdown--
        }
        resendEnabled = true
    }
    
    LaunchedEffect(error) {
        error?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearError()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = ImageVector.vectorResource(id = R.drawable.ic_arrow_back),
                            contentDescription = "Back"
                        )
                    }
                }
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(24.dp))
            
            ExpressiveCard(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = stringResource(R.string.otp_title),
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Text(
                        text = stringResource(R.string.otp_subtitle),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                    
                    Text(
                        text = phoneNumber,
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // OTP input fields
            OtpInputField(
                otpText = otpValue,
                onOtpTextChange = { value, completed ->
                    if (value.length <= 6) {
                        otpValue = value
                    }
                    
                    if (completed && value.length == 6) {
                        viewModel.verifyOtp(transactionId, value) {
                            onNavigateToDashboard()
                        }
                    }
                },
                modifier = Modifier.focusRequester(focusRequester)
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Resend button
            ExpressiveTextButton(
                onClick = {
                    if (resendEnabled) {
                        viewModel.sendOtp(phoneNumber) { newTransactionId ->
                            // Reset countdown
                            countdown = 30
                            resendEnabled = false
                        }
                    }
                },
                enabled = resendEnabled && !isLoading
            ) {
                Text(
                    text = if (resendEnabled) 
                        stringResource(R.string.resend_code) 
                    else 
                        "${stringResource(R.string.resend_code)} (${countdown}s)"
                )
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Verify button
            ExpressiveButton(
                onClick = {
                    viewModel.verifyOtp(transactionId, otpValue) {
                        onNavigateToDashboard()
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading && otpValue.length == 6
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = stringResource(R.string.verify),
                        style = MaterialTheme.typography.labelLarge
                    )
                }
            }
        }
    }
}

@Composable
fun OtpInputField(
    otpText: String,
    onOtpTextChange: (String, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    BasicTextField(
        value = otpText,
        onValueChange = { value ->
            val newValue = value.filter { it.isDigit() }
            onOtpTextChange(newValue, newValue.length == 6)
        },
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
        modifier = modifier
    ) {
        Row(
            horizontalArrangement = Arrangement.SpaceEvenly,
            modifier = Modifier.fillMaxWidth()
        ) {
            repeat(6) { index ->
                val char = when {
                    index >= otpText.length -> ""
                    else -> otpText[index].toString()
                }
                
                val isFocused = index == otpText.length
                
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(
                            color = if (isSystemInDarkTheme()) 
                                MaterialTheme.colorScheme.surface 
                            else 
                                MaterialTheme.colorScheme.surface.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(8.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = char,
                        style = MaterialTheme.typography.titleLarge
                    )
                    
                    if (isFocused) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(bottom = 8.dp)
                                .width(24.dp)
                                .height(2.dp)
                                .background(MaterialTheme.colorScheme.primary)
                        )
                    }
                }
                
                if (index < 5) {
                    Spacer(modifier = Modifier.width(8.dp))
                }
            }
        }
    }
} 