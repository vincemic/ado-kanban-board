# PowerShell script to compress PNG image
Add-Type -AssemblyName System.Drawing

try {
    # Load the original image
    $originalPath = "public/logo-original.png"
    $compressedPath = "public/logo.png"
    
    $originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $originalPath).Path)
    
    # Get original dimensions
    $originalWidth = $originalImage.Width
    $originalHeight = $originalImage.Height
    
    Write-Host "Original dimensions: $originalWidth x $originalHeight"
    Write-Host "Original size: $((Get-Item $originalPath).Length) bytes"
    
    # Calculate new dimensions (reduce to 50% if very large, or keep original if reasonable)
    if ($originalWidth -gt 800 -or $originalHeight -gt 300) {
        $newWidth = [math]::Round($originalWidth * 0.5)
        $newHeight = [math]::Round($originalHeight * 0.5)
    } else {
        $newWidth = $originalWidth
        $newHeight = $originalHeight
    }
    
    Write-Host "New dimensions: $newWidth x $newHeight"
    
    # Create new bitmap with reduced size
    $newImage = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($newImage)
    
    # Set high quality settings
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Draw the resized image
    $graphics.DrawImage($originalImage, 0, 0, $newWidth, $newHeight)
    
    # Save as PNG with compression
    $newImage.Save($compressedPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    Write-Host "Compressed size: $((Get-Item $compressedPath).Length) bytes"
    Write-Host "Compression ratio: $([math]::Round(((Get-Item $compressedPath).Length / (Get-Item $originalPath).Length) * 100, 2))%"
    
    # Cleanup
    $graphics.Dispose()
    $newImage.Dispose()
    $originalImage.Dispose()
    
    Write-Host "Logo compression completed successfully!"
    
} catch {
    Write-Error "Failed to compress image: $($_.Exception.Message)"
}