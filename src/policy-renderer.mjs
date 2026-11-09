export function renderManagedPolicy(profile) {
  return [
    `## ${profile.policyTitle}`,
    '',
    profile.decisionRule,
    '',
    profile.technicalRule,
    '',
    profile.projectRule,
    '',
    profile.approvalRule,
    '',
    'Technical examples such as `createSession()`, `ECONNREFUSED`, `src/index.ts`, and `npm test` remain unchanged.',
  ].join('\n');
}
