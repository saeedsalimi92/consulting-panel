export function useBooking() {
  const { request } = useAdminApi();
  const base = '/admin/booking';
  const api = <T = any>(path: string, options: any = {}) => request<T>(`${base}${path}`, options);
  const page = (response: any) => Array.isArray(response?.data) ? response.data : response?.data?.data || [];
  const lastPage = (response: any) => response?.meta?.last_page || response?.data?.last_page || response?.last_page || 1;
  const errorText = (error: any) => {
    const status = error?.status || error?.statusCode || error?.response?.status;
    if (status === 403) return 'دسترسی به این بخش مجاز نیست.';
    if (status === 409) return 'این عملیات با وضعیت فعلی تداخل دارد. اطلاعات را تازه کنید.';
    if (status === 422) {
      const fields = error?.data?.errors;
      return fields ? Object.values(fields).flat().join('، ') : (error?.data?.message || 'اطلاعات واردشده معتبر نیست.');
    }
    if (status === 401) return 'نشست شما پایان یافته است. دوباره وارد شوید.';
    return error?.data?.message || 'دریافت یا ذخیره اطلاعات انجام نشد.';
  };
  const money = (value: any) => `${Number(value || 0).toLocaleString('fa-IR')} ریال (${Math.round(Number(value || 0) / 10).toLocaleString('fa-IR')} تومان)`;
  const dateTime = (value: any) => value ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', {timeZone:'Asia/Tehran', dateStyle:'medium', timeStyle:'short'}).format(new Date(value.endsWith?.('Z') || /[+-]\d\d:\d\d$/.test(value) ? value : `${value.replace(' ', 'T')}Z`)) : '—';
  const localDate = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Tehran', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(date);
    const value = (name: string) => parts.find(part => part.type === name)?.value || '';
    return `${value('year')}-${value('month')}-${value('day')}`;
  };
  const iso = (value: string) => value ? new Date(value).toISOString().replace('.000Z', '+00:00') : '';
  const query = (values: Record<string, any>) => new URLSearchParams(Object.entries(values).filter(([,v]) => v !== '' && v !== null && v !== undefined).map(([k,v]) => [k,String(v)])).toString();
  return {api,page,lastPage,errorText,money,dateTime,localDate,iso,query};
}
