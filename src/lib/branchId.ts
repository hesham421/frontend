// Organization's own module hasn't been wired to a real API yet (out of
// SECURITY's scope) — useOrganizationStore's branch ids are mock string
// slugs ('br-1'), but branchIdFk (RULE-SEC-034) is a real number. Bridges
// the numeric suffix until Organization ships a real numeric-id branch list.
export function branchIdToNumber(id: string): number {
  return Number(id.replace(/^\D+/, ''));
}
