# Create minimal valid BMP files for testing
function Create-SimpleBMP {
    param(
        [string]$FilePath,
        [int]$Width = 64,
        [int]$Height = 64
    )
    
    # Calculate padding for 4-byte alignment
    $rowSize = [Math]::Ceiling(($Width * 3) / 4) * 4
    $pixelDataSize = $rowSize * $Height
    $fileSize = 54 + $pixelDataSize
    
    # BMP header (54 bytes)
    $header = [byte[]](
        # BMP File Header (14 bytes)
        0x42, 0x4D,                                           # "BM" signature
        [BitConverter]::GetBytes($fileSize)[0..3] +           # File size
        0x00, 0x00, 0x00, 0x00 +                             # Reserved
        0x36, 0x00, 0x00, 0x00 +                             # Offset to pixel data
        
        # DIB Header (40 bytes)
        0x28, 0x00, 0x00, 0x00 +                             # DIB header size
        [BitConverter]::GetBytes($Width)[0..3] +             # Width
        [BitConverter]::GetBytes($Height)[0..3] +            # Height
        0x01, 0x00 +                                         # Color planes
        0x18, 0x00 +                                         # Bits per pixel (24)
        0x00, 0x00, 0x00, 0x00 +                             # Compression (none)
        [BitConverter]::GetBytes($pixelDataSize)[0..3] +     # Image size
        0x13, 0x0B, 0x00, 0x00 +                             # X pixels per meter
        0x13, 0x0B, 0x00, 0x00 +                             # Y pixels per meter
        0x00, 0x00, 0x00, 0x00 +                             # Colors used
        0x00, 0x00, 0x00, 0x00                               # Important colors
    )
    
    # Create pixel data (white pixels with padding)
    $pixelData = New-Object byte[] $pixelDataSize
    for ($i = 0; $i -lt $pixelDataSize; $i++) {
        $pixelData[$i] = 0xFF  # White pixels
    }
    
    # Combine header and pixel data
    $bmpData = $header + $pixelData
    
    # Write to file
    [System.IO.File]::WriteAllBytes($FilePath, $bmpData)
    Write-Host "Created $FilePath (Size: $($bmpData.Length) bytes)"
}

# Create test images
Create-SimpleBMP -FilePath "test_ir.bmp" -Width 64 -Height 64
Create-SimpleBMP -FilePath "test_rgb.bmp" -Width 64 -Height 64

Write-Host "BMP files created successfully!"
