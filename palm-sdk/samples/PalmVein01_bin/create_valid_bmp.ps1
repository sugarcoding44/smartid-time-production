# Create valid BMP files for palm scanner testing
function Create-ValidBMP {
    param(
        [string]$FilePath,
        [int]$Width = 320,
        [int]$Height = 240
    )
    
    # Calculate row size (must be multiple of 4 bytes)
    $bytesPerPixel = 3  # 24-bit RGB
    $rowSize = [Math]::Ceiling(($Width * $bytesPerPixel) / 4) * 4
    $pixelArraySize = $rowSize * $Height
    $fileSize = 54 + $pixelArraySize  # 54-byte header + pixel data
    
    # Create BMP file header (14 bytes)
    $fileHeader = @()
    $fileHeader += 0x42, 0x4D  # "BM" signature
    $fileHeader += [BitConverter]::GetBytes([UInt32]$fileSize)  # File size
    $fileHeader += 0x00, 0x00, 0x00, 0x00  # Reserved
    $fileHeader += 0x36, 0x00, 0x00, 0x00  # Offset to pixel data (54 bytes)
    
    # Create DIB header (40 bytes)
    $dibHeader = @()
    $dibHeader += 0x28, 0x00, 0x00, 0x00  # DIB header size (40 bytes)
    $dibHeader += [BitConverter]::GetBytes([UInt32]$Width)  # Width
    $dibHeader += [BitConverter]::GetBytes([UInt32]$Height)  # Height
    $dibHeader += 0x01, 0x00  # Color planes (1)
    $dibHeader += 0x18, 0x00  # Bits per pixel (24)
    $dibHeader += 0x00, 0x00, 0x00, 0x00  # Compression (0 = none)
    $dibHeader += [BitConverter]::GetBytes([UInt32]$pixelArraySize)  # Image size
    $dibHeader += 0x13, 0x0B, 0x00, 0x00  # X pixels per meter
    $dibHeader += 0x13, 0x0B, 0x00, 0x00  # Y pixels per meter
    $dibHeader += 0x00, 0x00, 0x00, 0x00  # Colors in palette (0)
    $dibHeader += 0x00, 0x00, 0x00, 0x00  # Important colors (0)
    
    # Create pixel data (bottom-up bitmap)
    $pixelData = New-Object byte[] $pixelArraySize
    
    # Fill with a simple pattern (different for IR vs RGB)
    for ($y = 0; $y -lt $Height; $y++) {
        for ($x = 0; $x -lt $Width; $x++) {
            $index = $y * $rowSize + $x * $bytesPerPixel
            
            if ($FilePath -like "*ir*") {
                # IR image - grayscale pattern
                $value = [byte]((($x + $y) % 256))
                $pixelData[$index] = $value      # Blue
                $pixelData[$index + 1] = $value  # Green
                $pixelData[$index + 2] = $value  # Red
            } else {
                # RGB image - color pattern
                $pixelData[$index] = [byte](($x * 255) / $Width)      # Blue
                $pixelData[$index + 1] = [byte](($y * 255) / $Height) # Green
                $pixelData[$index + 2] = [byte]((($x + $y) * 255) / ($Width + $Height)) # Red
            }
        }
    }
    
    # Combine all data
    $allData = @()
    $allData += $fileHeader
    $allData += $dibHeader
    $allData += $pixelData
    
    # Convert to byte array
    $bmpData = [byte[]]$allData
    
    # Write to file
    [System.IO.File]::WriteAllBytes($FilePath, $bmpData)
    Write-Host "Created $FilePath - Size: $($bmpData.Length) bytes ($Width x $Height)" -ForegroundColor Green
}

# Create test images
Write-Host "Creating valid BMP files for palm scanner..." -ForegroundColor Yellow
Create-ValidBMP -FilePath "test_ir.bmp" -Width 320 -Height 240
Create-ValidBMP -FilePath "test_rgb.bmp" -Width 320 -Height 240
Write-Host "BMP files created successfully!" -ForegroundColor Green
