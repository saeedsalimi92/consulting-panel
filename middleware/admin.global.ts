export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  // Counselors authenticate against the dedicated counselor API and token scope.
  if (to.path === '/counselor/login') return;
  if (to.path.startsWith('/counselor')) {
    const counselor = useCounselorAuth();
    counselor.hydrate();
    if (!counselor.token.value) return navigateTo('/counselor/login', { replace: true });
    if (!counselor.verified.value) {
      try {
        await counselor.verify();
      } catch {
        counselor.clear();
        return navigateTo('/counselor/login', { replace: true });
      }
    }
    return;
  }

  const auth = useAdminApi();
  auth.hydrate();
  if (to.path.toLowerCase() === '/auth/login') {
    if (!auth.token.value) return;
    try {
      await auth.loadMe();
      return navigateTo(auth.can('dashboard.view') ? '/' : '/booking', { replace: true });
    } catch {
      auth.clear();
      return;
    }
  }
  if (!auth.token.value) return navigateTo('/auth/login', { replace: true });
  try {
    if (!auth.user.value) await auth.loadMe();
  } catch {
    auth.clear();
    return navigateTo('/auth/login', { replace: true });
  }
  if (['/manage/users','/booking/roles','/booking/audit-log'].includes(to.path) && !auth.user.value?.is_admin) return navigateTo('/forbidden', { replace: true });

  // These names are the permission strings enforced by EnsureAdmin in routes/api.php.
  const rules: Record<string, string> = {
    '/': 'dashboard.view',
    '/manage/counselors': 'counselors.manage',
    '/manage/specialties': 'specialties.manage',
    '/manage/comments': 'comments.manage',
    '/manage/users': 'users.manage',
    '/manage/appointments': 'appointments.manage',
    '/manage/settings': 'settings.manage',
    '/manage/gallery': 'content.manage',
  };
  let required = rules[to.path];
  const anyRequired = to.path === '/booking/exports'
    ? ['finance.view', 'appointments.manage']
    : to.path === '/booking/admin-inbox'
      ? ['dashboard.view', 'appointments.manage', 'finance.view', 'finance.manage', 'notes.manage', 'content.manage', 'users.manage']
      : [];
  if (!required && to.path === '/booking/sms-reminders') required = 'settings.manage';
  else if (!required && ['/booking/roles','/booking/audit-log'].includes(to.path)) required = 'users.manage';
  else if (!required && to.path === '/booking/content-media') required = 'content.manage';
  else if (!required && ['/booking/payment-settings','/booking/booking-settings'].includes(to.path)) required = 'finance.manage';
  if (!anyRequired.length) {
    if (!required && ['/booking/clinical', '/booking/forms'].includes(to.path)) required = 'notes.manage';
    else if (!required && to.path.startsWith('/booking/finance')) required = 'finance.view';
    else if (!required && to.path.startsWith('/booking/promos')) required = 'finance.manage';
    else if (!required && to.path.startsWith('/booking/refunds')) required = 'finance.view';
    else if (!required && to.path.startsWith('/booking')) required = 'appointments.manage';
    else if (!required && to.path.startsWith('/content/')) required = 'content.manage';
  }

  if (required && !auth.can(required)) return navigateTo('/forbidden', { replace: true });
  if (anyRequired.length && !anyRequired.some((permission) => auth.can(permission))) return navigateTo('/forbidden', { replace: true });
});
