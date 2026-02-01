// Time block overlap in minutes
function overlapMinutes(a, b) {
  // a/b: { dayOfWeek, startMin, endMin }
  if (a.dayOfWeek !== b.dayOfWeek) return 0;

  const start = Math.max(a.startMin, b.startMin);
  const end = Math.min(a.endMin, b.endMin);

  return Math.max(0, end - start);
}

// Total overlap between two users’ availability lists
export function totalOverlapMinutes(userBlocks, otherBlocks) {
  let total = 0;

  for (const a of userBlocks) {
    for (const b of otherBlocks) {
      total += overlapMinutes(a, b);
    }
  }

  return total;
}

// Convert overlap to a score (simple, explainable)
export function overlapScore(overlapMins) {
  // Example scoring: cap at 300 mins (5 hours) so it doesn’t explode
  const capped = Math.min(overlapMins, 300);
  return capped; // 1 point per minute (simple for now)
}
