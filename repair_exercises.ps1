$path = "src/data/exercises.ts"
$content = [System.IO.File]::ReadAllText($path)
$content = $content -replace "b\?\?[\s]?ceps", "bíceps"
$content = $content -replace "tr\?\?[\s]?ceps", "tríceps"
$content = $content -replace "gl\?\?[\s]?teos", "glúteos"
$content = $content -replace "m\?\?quina", "máquina"
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
