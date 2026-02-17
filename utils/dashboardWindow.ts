const DASHBOARD_QUERY = '?view=dashboard';

export const getDashboardUrl = (): string => `${window.location.pathname}${DASHBOARD_QUERY}`;

export const isDashboardView = (): boolean => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('view') === 'dashboard';
};

export const openDashboardWindow = (): void => {
  if (typeof window === 'undefined') return;
  window.open(getDashboardUrl(), '_blank', 'noopener,noreferrer');
};
