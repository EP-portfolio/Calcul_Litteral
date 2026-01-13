import { Competence, Difficulty } from '@/types/database'

interface InvitationEmailProps {
  studentName: string
  referentEmail: string
  acceptUrl: string
  studentMessage?: string
  expiresAt: string
}

export function InvitationEmailHTML({
  studentName,
  referentEmail,
  acceptUrl,
  studentMessage,
  expiresAt,
}: InvitationEmailProps): string {
  const expiryDate = new Date(expiresAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation - Calcul Littéral</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📚 Calcul Littéral</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #667eea; margin-top: 0;">Invitation à suivre les progrès de ${studentName}</h2>

    <p>Bonjour,</p>

    <p><strong>${studentName}</strong> vous invite à suivre sa progression en calcul littéral sur notre plateforme éducative.</p>

    ${
      studentMessage
        ? `
    <div style="background: #f5f7fa; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-style: italic; color: #555;">"${studentMessage}"</p>
    </div>
    `
        : ''
    }

    <p>En acceptant cette invitation, vous pourrez :</p>
    <ul style="line-height: 1.8;">
      <li>✅ Recevoir des notifications par email à chaque défi complété</li>
      <li>📊 Consulter les statistiques de progression</li>
      <li>🎯 Voir les résultats détaillés par compétence</li>
      <li>⏱️ Suivre le temps passé et le taux de réussite</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${acceptUrl}"
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                display: inline-block;
                box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
        Accepter l'invitation
      </a>
    </div>

    <p style="font-size: 14px; color: #666;">
      <strong>Note :</strong> Cette invitation expire le <strong>${expiryDate}</strong>.
    </p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <p style="font-size: 12px; color: #999;">
      Si vous ne recevez pas l'email, vérifiez vos spams.
      <br><br>
      Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email en toute sécurité.
      <br>
      Cet email a été envoyé à ${referentEmail}.
    </p>
  </div>

</body>
</html>
  `
}

interface ChallengeCompletionEmailProps {
  studentName: string
  referentName: string
  competence: Competence
  difficulty: Difficulty
  score: number
  totalExercises: number
  timeSpent: number
  successRate: number
  dashboardUrl: string
}

export function ChallengeCompletionEmailHTML({
  studentName,
  referentName,
  competence,
  difficulty,
  score,
  totalExercises,
  timeSpent,
  successRate,
  dashboardUrl,
}: ChallengeCompletionEmailProps): string {
  const competenceLabels: Record<Competence, string> = {
    developpement: 'Développement',
    reduction: 'Réduction',
    factorisation: 'Factorisation',
  }

  const difficultyLabels: Record<Difficulty, string> = {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile',
  }

  const competenceColors: Record<Competence, string> = {
    developpement: '#3b82f6',
    reduction: '#10b981',
    factorisation: '#8b5cf6',
  }

  const minutes = Math.floor(timeSpent / 60)
  const seconds = timeSpent % 60

  const performanceColor =
    successRate >= 80 ? '#10b981' : successRate >= 60 ? '#f59e0b' : '#ef4444'

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Défi complété - Calcul Littéral</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

  <div style="background: linear-gradient(135deg, ${competenceColors[competence]} 0%, #667eea 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Nouveau défi complété !</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p>Bonjour ${referentName},</p>

    <p><strong>${studentName}</strong> vient de terminer un défi en calcul littéral !</p>

    <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: ${competenceColors[competence]};">
        ${competenceLabels[competence]} - Niveau ${difficultyLabels[difficulty]}
      </h3>

      <table style="width: 100%; margin-top: 15px;">
        <tr>
          <td style="width: 50%; padding: 10px; text-align: center; border-right: 1px solid #e0e0e0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Score</p>
            <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: ${performanceColor};">
              ${score}/${totalExercises}
            </p>
          </td>
          <td style="width: 50%; padding: 10px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #666;">Taux de réussite</p>
            <p style="margin: 5px 0 0 0; font-size: 28px; font-weight: bold; color: ${performanceColor};">
              ${successRate.toFixed(0)}%
            </p>
          </td>
        </tr>
      </table>

      <div style="margin-top: 15px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #666;">Temps passé</p>
        <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">
          ${minutes}min ${seconds}s
        </p>
      </div>

      <!-- Progress Bar -->
      <div style="margin-top: 20px;">
        <div style="background: #e0e0e0; height: 10px; border-radius: 5px; overflow: hidden;">
          <div style="background: ${performanceColor}; height: 100%; width: ${successRate}%;"></div>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}"
         style="background: ${competenceColors[competence]};
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                display: inline-block;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        Voir le tableau de bord
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

    <p style="font-size: 12px; color: #999;">
      Si vous ne recevez pas l'email, vérifiez vos spams.
      <br><br>
      Vous recevez cet email car vous suivez les progrès de ${studentName} sur Calcul Littéral.
      <br>
      Pour gérer vos préférences, connectez-vous à votre tableau de bord.
    </p>
  </div>

</body>
</html>
  `
}
