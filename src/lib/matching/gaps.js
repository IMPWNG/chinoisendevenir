function monthsForHskGap(gap) {
  if (gap <= 0) return 0;
  if (gap === 1) return 4;
  if (gap === 2) return 8;
  return 12;
}

export function identifyGaps(student, universities = []) {
  const gaps = [];
  const seen = new Set();

  (universities || []).forEach((item) => {
    const uni = item.university || item;
    const name = item.university_name || uni.displayName || uni.name;
    const hskMin = item.hsk_required ?? uni.hskForDegree?.(student.targetDegree) ?? uni.hsk;
    const studentHsk = student.hsk == null ? 0 : student.hsk;

    if (hskMin != null && studentHsk < hskMin) {
      const manque = hskMin - studentHsk;
      const key = `langue:${name}`;
      if (!seen.has(key)) {
        seen.add(key);
        gaps.push({
          universite: name,
          type: "langue",
          manque,
          conseil: `Suivre environ ${monthsForHskGap(manque)} mois de cours HSK avant candidature (HSK ${studentHsk} → HSK ${hskMin}).`,
        });
      }
    }

    const gpaMin = item.gpa_required ?? uni.gpaMinForDegree?.(student.targetDegree);
    if (student.gpa != null && gpaMin != null && student.gpa < gpaMin) {
      const key = `gpa:${name}`;
      if (!seen.has(key)) {
        seen.add(key);
        gaps.push({
          universite: name,
          type: "academique",
          manque: Math.round((gpaMin - student.gpa) * 10) / 10,
          conseil: `GPA ${student.gpa}/4 inférieur au seuil connu (${gpaMin}/4) pour ${name}.`,
        });
      }
    }

    const cout = item.cost_total_cny ?? uni.costTotalCny;
    const budget = student.budgetCny;
    const hasScholarship =
      uni.hasCsc || uni.hasUniScholarship || uni.hasProvincial || (item.scholarships_possible || []).length;
    if (budget != null && cout != null && budget < cout && !hasScholarship) {
      const key = `financier:${name}`;
      if (!seen.has(key)) {
        seen.add(key);
        gaps.push({
          universite: name,
          type: "financier",
          manque: Math.round(cout - budget),
          conseil:
            "Cibler des universités en province (moins chères) ou renforcer le dossier bourse CSC.",
        });
      }
    }
  });

  if (student.hsk == null || student.hskSource === "default_beginner") {
    gaps.unshift({
      universite: null,
      type: "langue",
      manque: null,
      conseil:
        "Le HSK n'est pas documenté : le matching part d'un niveau débutant. Faire évaluer le chinois, ou confirmer un cursus en anglais.",
    });
  }

  if (student.gpa == null) {
    gaps.push({
      universite: null,
      type: "academique",
      manque: null,
      conseil:
        "La moyenne / GPA n'est pas renseignée : le dossier académique reste flou pour les universités les plus sélectives.",
    });
  }

  return gaps.slice(0, 12);
}

export function summarizeGaps(gaps) {
  const byType = { langue: 0, academique: 0, financier: 0, autre: 0 };
  (gaps || []).forEach((gap) => {
    if (byType[gap.type] != null) byType[gap.type] += 1;
    else byType.autre += 1;
  });
  return byType;
}
