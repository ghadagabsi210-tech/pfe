$files = Get-ChildItem -Path "." -Filter "*.html"

foreach($f in $files) {
    $c = Get-Content $f.FullName -Raw -Encoding UTF8
    
    # CSS link
    $c = $c -replace 'https://unpkg.com/lucide-static@latest/font/lucide.css', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
    
    # Icons (order matters - specific first)
    $c = $c -replace 'lucide-graduation-cap', 'fa-solid fa-graduation-cap'
    $c = $c -replace 'lucide-book-open', 'fa-solid fa-book-open'
    $c = $c -replace 'lucide-building-2', 'fa-solid fa-building'
    $c = $c -replace 'lucide-users', 'fa-solid fa-users'
    $c = $c -replace 'lucide-message-circle', 'fa-solid fa-comment-dots'
    $c = $c -replace 'lucide-moon', 'fa-solid fa-moon'
    $c = $c -replace 'lucide-bot', 'fa-solid fa-robot'
    $c = $c -replace 'lucide-send', 'fa-solid fa-paper-plane'
    $c = $c -replace 'lucide-lock', 'fa-solid fa-lock'
    $c = $c -replace 'lucide-eye', 'fa-solid fa-eye'
    $c = $c -replace 'lucide-layout-dashboard', 'fa-solid fa-gauge-high'
    $c = $c -replace 'lucide-user-check', 'fa-solid fa-user-check'
    $c = $c -replace 'lucide-briefcase', 'fa-solid fa-briefcase'
    $c = $c -replace 'lucide-file-text', 'fa-solid fa-file-lines'
    $c = $c -replace 'lucide-settings', 'fa-solid fa-gear'
    $c = $c -replace 'lucide-mail', 'fa-solid fa-envelope'
    $c = $c -replace 'lucide-circle-info', 'fa-solid fa-circle-info'
    $c = $c -replace 'lucide-check-circle', 'fa-solid fa-circle-check'
    $c = $c -replace 'lucide-alert-triangle', 'fa-solid fa-triangle-exclamation'
    $c = $c -replace 'lucide-arrow-left', 'fa-solid fa-arrow-left'
    $c = $c -replace 'lucide-plus', 'fa-solid fa-plus'
    $c = $c -replace 'lucide-download', 'fa-solid fa-download'
    $c = $c -replace 'lucide-upload', 'fa-solid fa-upload'
    $c = $c -replace 'lucide-trash-2', 'fa-solid fa-trash'
    $c = $c -replace 'lucide-bell', 'fa-solid fa-bell'
    $c = $c -replace 'lucide-map-pin', 'fa-solid fa-location-dot'
    $c = $c -replace 'lucide-clock', 'fa-solid fa-clock'
    $c = $c -replace 'lucide-check', 'fa-solid fa-check'
    $c = $c -replace 'lucide-user', 'fa-solid fa-user'
    $c = $c -replace 'lucide-save', 'fa-solid fa-floppy-disk'
    $c = $c -replace 'lucide-rocket', 'fa-solid fa-rocket'
    $c = $c -replace 'lucide-info', 'fa-solid fa-circle-info'
    $c = $c -replace 'lucide-x', 'fa-solid fa-xmark'
    
    Set-Content $f.FullName $c -Encoding UTF8
    Write-Host ("Updated: " + $f.Name)
}
