param(
    [string]$SitePath
)

$index = Join-Path $SitePath "index.html"

$content = Get-Content $index -Raw

$content = $content -replace '<base href=".*?">', "<base href=""$env:BASE_HREF"">"

Set-Content $index $content

Write-Host "index.html updated successfully."