/**
 * Rule-Based Priority Engine for JANSETU
 * Transparent, deterministic civic prioritization logic.
 * Note: Purely rule-based algorithmic scoring without AI/ML.
 */

export const PRIORITY_RULES = {
  SEVERITY: {
    Critical: 40,
    High: 30,
    Medium: 20,
    Low: 10,
  },
  PUBLIC_INSTITUTION: 20,
  AGE_OVER_48H: 15,
  AGE_OVER_24H: 10,
};

export const PRIORITY_THRESHOLDS = {
  CRITICAL: 50,
  HIGH: 35,
  MEDIUM: 20,
};

export const PRIORITY_DEADLINES_HOURS = {
  Critical: 6,
  High: 24,
  Medium: 48,
  Low: 72,
};

/**
 * Calculates priority score, factors, level, and deadline for a complaint.
 * @param {Object} params
 * @param {string} params.severity - 'Low' | 'Medium' | 'High' | 'Critical'
 * @param {boolean} params.isPublicInstitutionAffected - boolean
 * @param {Date|string} [params.createdAt] - Creation timestamp
 * @returns {Object} { score, level, factors, targetHours }
 */
export const calculatePriority = ({
  severity = 'Medium',
  isPublicInstitutionAffected = false,
  createdAt = new Date(),
}) => {
  let score = 0;
  const factors = [];

  // 1. Severity contribution
  const normalizedSeverity =
    ['Critical', 'High', 'Medium', 'Low'].find(
      (s) => s.toLowerCase() === (severity || '').toLowerCase()
    ) || 'Medium';

  const severityScore = PRIORITY_RULES.SEVERITY[normalizedSeverity] || 20;
  score += severityScore;
  factors.push(`${normalizedSeverity} severity (+${severityScore} pts)`);

  // 2. Public institution proximity / affection
  if (isPublicInstitutionAffected) {
    score += PRIORITY_RULES.PUBLIC_INSTITUTION;
    factors.push(`Public institution affected (+${PRIORITY_RULES.PUBLIC_INSTITUTION} pts)`);
  }

  // 3. Time pending calculation (for dynamic recalibration)
  if (createdAt) {
    const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (ageInHours >= 48) {
      score += PRIORITY_RULES.AGE_OVER_48H;
      factors.push(`Pending > 48 hours (+${PRIORITY_RULES.AGE_OVER_48H} pts)`);
    } else if (ageInHours >= 24) {
      score += PRIORITY_RULES.AGE_OVER_24H;
      factors.push(`Pending > 24 hours (+${PRIORITY_RULES.AGE_OVER_24H} pts)`);
    }
  }

  // 4. Determine Priority Level from Score
  let level = 'Low';
  if (score >= PRIORITY_THRESHOLDS.CRITICAL) {
    level = 'Critical';
  } else if (score >= PRIORITY_THRESHOLDS.HIGH) {
    level = 'High';
  } else if (score >= PRIORITY_THRESHOLDS.MEDIUM) {
    level = 'Medium';
  } else {
    level = 'Low';
  }

  const targetHours = PRIORITY_DEADLINES_HOURS[level] || 48;

  return {
    score,
    level,
    factors,
    targetHours,
  };
};

/**
 * Maps category to default department name
 */
export const suggestDepartment = (category) => {
  const map = {
    'Roads and potholes': 'Roads and Infrastructure',
    'Water supply and leakage': 'Water Supply',
    'Garbage and sanitation': 'Sanitation',
    'Drainage and sewage': 'Drainage Department',
    'Streetlights and electricity': 'Electrical Department',
    'Public infrastructure': 'Roads and Infrastructure',
    'Other civic issues': 'General Administration',
  };
  return map[category] || 'General Administration';
};
