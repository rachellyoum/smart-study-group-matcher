const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Time block overlap in minutes
function overlapMinutes(a, b) {
  // a/b: { dayOfWeek, startMin, endMin }
  if (a.dayOfWeek !== b.dayOfWeek) return 0;

  const start = Math.max(a.startMin, b.startMin);
  const end = Math.min(a.endMin, b.endMin);

  return Math.max(0, end - start);
}

export function overlapBreakdownByDay(userBlocks, otherBlocks) {
    const byDay = new Map();    // dayOfWeek -> minutes

    for (const a of userBlocks) {
        for (const b of otherBlocks) {
            const mins = overlapMinutes(a, b);
            if (mins > 0) {
                byDay.set(a.dayOfWeek, (byDay.get(a.dayOfWeek) ?? 0) + mins);
            }
        }
    }

    const breakdown = {};
    for (const [day, mins] of byDay.entries()) {
        breakdown[DAY_NAMES[day]] = mins;
    }

    return breakdown;
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
    const CAP = 240;
    const capped = Math.min(Math.max(overlapMins, 0), CAP);
    return Math.round((capped / CAP) * 100);
}
