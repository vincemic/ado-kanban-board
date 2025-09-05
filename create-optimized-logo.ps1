# PowerShell script to create a smaller PNG logo using .NET
Add-Type -AssemblyName System.Drawing

try {
    $width = 200
    $height = 80
    $outputPath = "public/logo.png"
    
    # Create a new bitmap
    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Set high quality rendering
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Create brushes and pens
    $blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 120, 212))  # Azure blue
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 2)
    
    # Fill background with Azure blue
    $graphics.FillRectangle($blueBrush, 0, 0, $width, $height)
    
    # Add rounded corners effect by drawing rounded rectangle
    $rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = 8
    $path.AddArc($rect.X, $rect.Y, $radius, $radius, 180, 90)
    $path.AddArc($rect.X + $rect.Width - $radius, $rect.Y, $radius, $radius, 270, 90)
    $path.AddArc($rect.X + $rect.Width - $radius, $rect.Y + $rect.Height - $radius, $radius, $radius, 0, 90)
    $path.AddArc($rect.X, $rect.Y + $rect.Height - $radius, $radius, $radius, 90, 90)
    $path.CloseAllFigures()
    
    $graphics.FillPath($blueBrush, $path)
    
    # Draw simple geometric shapes for Azure DevOps theme
    $graphics.FillEllipse($whiteBrush, 20, 30, 20, 20)  # Circle
    $graphics.FillRectangle($whiteBrush, 50, 30, 20, 20)  # Square
    
    # Add text
    $font1 = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
    $font2 = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Regular)
    
    $graphics.DrawString("Azure DevOps", $font1, $whiteBrush, 85, 25)
    $graphics.DrawString("Kanban Board", $font2, $whiteBrush, 85, 45)
    
    # Save the image
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    Write-Host "Created optimized logo: $outputPath"
    Write-Host "Size: $((Get-Item $outputPath).Length) bytes"
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $blueBrush.Dispose()
    $whiteBrush.Dispose()
    $whitePen.Dispose()
    $font1.Dispose()
    $font2.Dispose()
    $path.Dispose()
    
    Write-Host "Logo creation completed successfully!"
    
} catch {
    Write-Error "Failed to create logo: $($_.Exception.Message)"
}