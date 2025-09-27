# Test palm registration with TCP server
# This script automates the palm_test.exe interaction

Write-Host "Starting palm registration test..."

# Commands to initialize device and create client
$commands = @(
    "c",          # Create device
    "o",          # Open device  
    "l",          # Set LED mode
    "20",         # LED mode 20
    "s",          # Start device
    "E",          # Enable DimPalm
    "C",          # Create palm client
    "smartid_test",  # Company ID
    "PALM001",       # Device SN
    "127.0.0.1",     # Server IP
    "8888",          # Server port
    "",              # Host name (empty)
    "2",             # Register to server
    ".\sample.jpg",  # IR image path
    ".\sample.jpg",  # RGB image path
    "q"              # Quit
)

# Join commands with newlines
$input_data = $commands -join "`r`n"

Write-Host "Sending commands to palm_test.exe..."
Write-Host "Commands: $($commands -join ' -> ')"

# Run palm_test.exe with piped input
$process = Start-Process -FilePath ".\palm_test.exe" -ArgumentList "" -PassThru -NoNewWindow -RedirectStandardInput -RedirectStandardOutput -RedirectStandardError

# Send input
$input_data | Out-String | ForEach-Object { $process.StandardInput.WriteLine($_) }
$process.StandardInput.Close()

# Wait for completion and capture output
$process.WaitForExit()
$stdout = $process.StandardOutput.ReadToEnd()
$stderr = $process.StandardError.ReadToEnd()

Write-Host "STDOUT:"
Write-Host $stdout
Write-Host "STDERR:"  
Write-Host $stderr
Write-Host "Exit Code:" $process.ExitCode
