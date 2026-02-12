$path = "src/data/exercises.ts"
$lines = Get-Content $path
# Find the line that starts the muscleGroupLabels (index 888 in the file roughly)
$labelsIndex = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -like "*export const muscleGroupLabels*") {
        $labelsIndex = $i
        break
    }
}

if ($labelsIndex -ge 0) {
    $newLines = $lines[0..($labelsIndex-1)]
    $newLines += 'export const muscleGroupLabels: Record<MuscleGroup, string> = {'
    $newLines += '  pecho: "Pecho",'
    $newLines += '  espalda: "Espalda",'
    $newLines += '  hombros: "Hombros",'
    $newLines += '  bíceps: "Bíceps",'
    $newLines += '  tríceps: "Tríceps",'
    $newLines += '  piernas: "Piernas",'
    $newLines += '  glúteos: "Glúteos",'
    $newLines += '  abdominales: "Abdominales",'
    $newLines += '  antebrazos: "Antebrazos",'
    $newLines += '  trapecio: "Trapecio",'
    $newLines += '};'
    $newLines += 'export const muscleGroupIcons: Record<MuscleGroup, string> = {'
    $newLines += '  pecho: "🍒",'
    $newLines += '  espalda: "🐢",'
    $newLines += '  hombros: "🏐",'
    $newLines += '  bíceps: "💪",'
    $newLines += '  tríceps: "🔱",'
    $newLines += '  piernas: "🍗",'
    $newLines += '  glúteos: "🍑",'
    $newLines += '  abdominales: "🍫",'
    $newLines += '  antebrazos: "⚓",'
    $newLines += '  trapecio: "🦅",'
    $newLines += '};'
    $newLines | Set-Content $path -Encoding UTF8
} else {
    Write-Error "Could not find muscleGroupLabels"
}
