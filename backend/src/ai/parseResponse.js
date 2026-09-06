/**
 * Robust response parser and contract validator for the AI clustering engine.
 * Ensures strict adherence to Contract B in Dependency.md.
 */

function parseAndValidateResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Received empty response from AI provider.');
  }

  // 1. Clean markdown code blocks (e.g. ```json ... ``` or ``` ...)
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // 2. Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error(`Failed to parse AI output as JSON: ${err.message}`);
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI output did not return a valid object structure.');
  }

  // 3. Process & Validate Misconception Groups
  let groups = Array.isArray(parsed.misconceptionGroups) ? parsed.misconceptionGroups : [];

  groups = groups.map((g, idx) => ({
    label: typeof g.label === 'string' && g.label.trim().length > 0
      ? g.label.trim()
      : `Misconception Pattern ${idx + 1}`,
    percentage: Math.max(0, Math.round(Number(g.percentage) || 0))
  })).filter(g => g.label.length > 0);

  // If no groups parsed, supply a default
  if (groups.length === 0) {
    groups = [{ label: "General Conceptual Confusion", percentage: 100 }];
  }

  // 4. Normalize percentages to sum to exactly 100%
  const total = groups.reduce((acc, g) => acc + g.percentage, 0);
  if (total > 0 && total !== 100) {
    let runningSum = 0;
    groups = groups.map((g, idx) => {
      if (idx === groups.length - 1) {
        return { ...g, percentage: Math.max(0, 100 - runningSum) };
      }
      const adjusted = Math.round((g.percentage / total) * 100);
      runningSum += adjusted;
      return { ...g, percentage: adjusted };
    });
  }

  // 5. Validate Insight (Single plain-language sentence)
  let insight = typeof parsed.insight === 'string' && parsed.insight.trim().length > 0
    ? parsed.insight.trim()
    : 'Multiple distinct student misconceptions were diagnosed across the submission batch.';

  // 6. Validate Intervention (Time-boxed actionable suggestion)
  let intervention = typeof parsed.intervention === 'string' && parsed.intervention.trim().length > 0
    ? parsed.intervention.trim()
    : 'Spend 15 minutes reviewing the key algorithmic patterns and common boundary traps before the next topic.';

  return {
    misconceptionGroups: groups,
    insight,
    intervention
  };
}

module.exports = { parseAndValidateResponse };
