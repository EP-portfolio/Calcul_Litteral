# ralph-windows.ps1
# Boucle Ralph Wiggum adaptée PowerShell

param(
    [int]$MaxIterations = 50,
    [int]$PauseSeconds = 5
)

$iteration = 0
$complete = $false
$blocked = $false

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   RALPH WIGGUM - PowerShell Edition   " -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Max iterations: $MaxIterations"
Write-Host "Dossier: $(Get-Location)"
Write-Host ""

$prompt = @"
Lis PROMPT.md pour comprendre le projet et TODO.md pour les tâches.

PROCESSUS:
1. Identifie la prochaine tâche non cochée (- [ ])
2. Implémente cette tâche
3. Teste (lint, tests si applicable)
4. Si OK, coche la tâche dans TODO.md : - [x]
5. Commit avec message descriptif

IMPORTANT:
- Une seule tâche par itération
- Toujours cocher la tâche terminée dans TODO.md
- Si TOUTES les tâches sont cochées et les critères de succès validés, écris exactement sur une ligne: <promise>COMPLETE</promise>
- Si tu es bloqué après plusieurs tentatives, écris exactement: <promise>BLOCKED</promise>
"@

while (($iteration -lt $MaxIterations) -and (-not $complete) -and (-not $blocked)) {
    $iteration++
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  ITERATION $iteration / $MaxIterations" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    # Compte les tâches restantes
    $todoContent = Get-Content "TODO.md" -Raw -ErrorAction SilentlyContinue
    $remaining = ([regex]::Matches($todoContent, "\- \[ \]")).Count
    $done = ([regex]::Matches($todoContent, "\- \[x\]")).Count
    Write-Host "Tâches: $done terminées, $remaining restantes" -ForegroundColor Yellow
    Write-Host ""
    
    # Lance Claude avec le prompt
    $output = claude -p $prompt --max-turns 50 2>&1 | Tee-Object -Variable claudeOutput
    
    # Affiche la sortie
    Write-Host $claudeOutput
    
    # Vérifie les conditions de sortie
    if ($claudeOutput -match "<promise>COMPLETE</promise>") {
        Write-Host ""
        Write-Host "✓ COMPLETE détecté !" -ForegroundColor Green
        $complete = $true
    }
    elseif ($claudeOutput -match "<promise>BLOCKED</promise>") {
        Write-Host ""
        Write-Host "✗ BLOCKED détecté. Voir BLOCKED.md" -ForegroundColor Red
        $blocked = $true
    }
    else {
        # Vérifie si toutes les tâches sont cochées
        $todoContent = Get-Content "TODO.md" -Raw -ErrorAction SilentlyContinue
        $remaining = ([regex]::Matches($todoContent, "\- \[ \]")).Count
        
        if ($remaining -eq 0) {
            Write-Host ""
            Write-Host "Toutes les tâches semblent cochées. Dernière vérification..." -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Pause de $PauseSeconds secondes avant prochaine itération..." -ForegroundColor Gray
        Start-Sleep -Seconds $PauseSeconds
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "           RÉSUMÉ FINAL                " -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Itérations effectuées: $iteration"

if ($complete) {
    Write-Host "Statut: COMPLETE ✓" -ForegroundColor Green
} elseif ($blocked) {
    Write-Host "Statut: BLOCKED ✗" -ForegroundColor Red
} else {
    Write-Host "Statut: MAX ITERATIONS ATTEINT" -ForegroundColor Yellow
}

# Affiche l'état final de TODO.md
Write-Host ""
Write-Host "État final des tâches:" -ForegroundColor Cyan
$todoContent = Get-Content "TODO.md" -Raw -ErrorAction SilentlyContinue
$remaining = ([regex]::Matches($todoContent, "\- \[ \]")).Count
$done = ([regex]::Matches($todoContent, "\- \[x\]")).Count
Write-Host "  Terminées: $done"
Write-Host "  Restantes: $remaining"
