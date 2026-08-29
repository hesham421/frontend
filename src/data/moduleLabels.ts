// Business-module codes are shared across Pages, Permissions, and
// Notification Templates filters/forms, but each screen only exposes the
// subset of modules relevant to it — so this exports a code -> translation-key
// map, not one fixed option list, letting each screen build its own subset.
export const MODULE_LABEL_KEYS: Record<string, string> = {
  SEC: 'moduleSecurity',
  ORG: 'moduleOrganization',
  FILE: 'moduleFileService',
  NOTIF: 'moduleNotifications',
  FIN: 'moduleFinance',
  HR: 'moduleHR',
  INV: 'moduleInventory',
  SYS: 'moduleSystemCore',
};

export function getModuleLabel(code: string, t: (key: string) => string): string {
  const key = MODULE_LABEL_KEYS[code];
  return key ? `${code} (${t(key)})` : code;
}
