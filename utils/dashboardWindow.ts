const DASHBOARD_QUERY = '?view=dashboard';
const DASHBOARD_WINDOW_NAME = 'cissp-dashboard';
const DASHBOARD_WINDOW_FEATURES = 'noopener,noreferrer,width=1360,height=900';

export const getDashboardUrl = (): string => `${window.location.pathname}${DASHBOARD_QUERY}`;

export const isDashboardView = (): boolean => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('view') === 'dashboard';
};

export const openDashboardWindow = (): void => {
  if (typeof window === 'undefined') return;
  window.open(getDashboardUrl(), DASHBOARD_WINDOW_NAME, DASHBOARD_WINDOW_FEATURES);
};
