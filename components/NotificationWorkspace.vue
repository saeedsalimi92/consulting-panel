<script setup lang="ts">
const route = useRoute();
const { api, page, lastPage, dateTime, errorText } = useBooking();
const loading = ref(false), busy = ref(false), error = ref(''), success = ref('');
const tab = ref(String(route.params.section) === 'notification-templates' ? 'templates' : 'deliveries');
const rows = ref<any[]>([]), templates = ref<any[]>([]), pageNumber = ref(1), totalPages = ref(1);
const filters = reactive({ status: '', channel: '', event: '' });
const formOpen = ref(false), form = reactive({ event: '', channel: 'email', subject: '', body: '', is_active: true });

async function load() {
  loading.value = true; error.value = '';
  try {
    if (tab.value === 'templates') {
      const result = await api<any>('/notification-templates?page=1');
      templates.value = page(result);
    } else {
      const query = new URLSearchParams(Object.entries({ ...filters, page: String(pageNumber.value) }).filter(([, value]) => !!value));
      const result = await api<any>(`/notifications?${query}`);
      rows.value = page(result); totalPages.value = lastPage(result);
    }
  } catch (e: any) { error.value = errorText(e); }
  finally { loading.value = false; }
}

async function saveTemplate() {
  if (busy.value || !form.event.trim() || !form.body.trim()) return;
  busy.value = true; error.value = ''; success.value = '';
  try {
    await api('/notification-templates', { method: 'POST', body: { ...form, event: form.event.trim(), channel: 'email' } });
    formOpen.value = false; success.value = 'قالب ایمیل ذخیره شد.'; await load();
  } catch (e: any) { error.value = errorText(e); }
  finally { busy.value = false; }
}

function editTemplate(row: any) {
  Object.assign(form, { event: row.event, channel: 'email', subject: row.subject || '', body: row.body || '', is_active: !!row.is_active });
  formOpen.value = true;
}

async function retry(row: any) {
  if (busy.value || row.channel !== 'email' || row.status !== 'failed') return;
  if (!confirm('ارسال مجدد این اعلان ایمیلی در صف قرار گیرد؟')) return;
  busy.value = true; error.value = ''; success.value = '';
  try { await api(`/notifications/${row.id}/retry`, { method: 'POST' }); success.value = 'درخواست ارسال مجدد در صف قرار گرفت.'; await load(); }
  catch (e: any) { error.value = errorText(e); }
  finally { busy.value = false; }
}

watch([tab, pageNumber, () => filters.status, () => filters.channel, () => filters.event], load);
onMounted(load);
</script>

<template>
  <main dir="rtl" class="admin-page">
    <header class="admin-page__header"><div><div class="admin-eyebrow">اعلان‌های عملیاتی</div><h1>اعلان‌ها و قالب‌ها</h1><p>لاگ‌ها نتیجهٔ گزارش‌شدهٔ backend هستند؛ SMS در این محیط ارسال واقعی ندارد.</p></div><v-btn v-if="tab === 'templates'" color="primary" prepend-icon="mdi-plus" @click="Object.assign(form,{event:'',channel:'email',subject:'',body:'',is_active:true});formOpen=true">قالب ایمیل جدید</v-btn><v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">به‌روزرسانی</v-btn></header>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">{{ error }}</v-alert><v-alert v-if="success" type="success" variant="tonal" class="mb-4" closable @click:close="success = ''">{{ success }}</v-alert>
    <v-tabs v-model="tab" class="mb-4"><v-tab value="deliveries">تاریخچهٔ ارسال</v-tab><v-tab value="templates">قالب‌های ایمیل</v-tab></v-tabs>
    <v-alert v-if="tab === 'deliveries'" type="info" variant="tonal" class="mb-4">وضعیت SMS در backend با کانال `not_configured` ثبت می‌شود؛ این صفحه آن را ارسال موفق نشان نمی‌دهد. retry فقط برای ایمیل ناموفق فعال است.</v-alert>
    <template v-if="tab === 'deliveries'"><v-row><v-col cols="12" md="4"><v-select v-model="filters.status" :items="['pending','sent','failed','not_configured']" label="وضعیت" clearable/></v-col><v-col cols="12" md="4"><v-select v-model="filters.channel" :items="['email','sms','in_app']" label="کانال" clearable/></v-col><v-col cols="12" md="4"><v-text-field v-model="filters.event" label="رویداد" clearable/></v-col></v-row><v-card class="admin-table-card"><div class="admin-table-scroll"><v-table><thead><tr><th>نوبت</th><th>کانال</th><th>رویداد</th><th>وضعیت</th><th>تلاش‌ها</th><th>زمان</th><th></th></tr></thead><tbody><tr v-for="row in rows" :key="row.id"><td>{{ row.booking_id || '—' }}</td><td>{{ row.channel }}</td><td>{{ row.event }}</td><td>{{ row.status === 'not_configured' ? 'ارائه‌دهنده پیکربندی نشده' : row.status }}</td><td>{{ row.attempts ?? '—' }}</td><td>{{ dateTime(row.created_at) }}</td><td><v-btn v-if="row.channel === 'email' && row.status === 'failed'" size="small" :loading="busy" :disabled="busy" @click="retry(row)">ارسال مجدد ایمیل</v-btn></td></tr><tr v-if="!loading && !rows.length"><td colspan="7"><div class="admin-empty-state">لاگی با این فیلترها وجود ندارد.</div></td></tr></tbody></v-table></div><div v-if="totalPages > 1" class="admin-table-pagination"><v-btn :disabled="pageNumber <= 1" @click="pageNumber--">قبلی</v-btn><span>صفحهٔ {{ pageNumber }} از {{ totalPages }}</span><v-btn :disabled="pageNumber >= totalPages" @click="pageNumber++">بعدی</v-btn></div></v-card></template>
    <template v-else><v-alert type="info" variant="tonal" class="mb-4">ویرایش قالب با همان کلید رویداد و کانال انجام می‌شود. متغیرهای قابل استفاده در body باید مطابق قرارداد backend تنظیم شوند.</v-alert><v-card class="admin-table-card"><div class="admin-table-scroll"><v-table><thead><tr><th>رویداد</th><th>کانال</th><th>موضوع</th><th>وضعیت</th><th>متن</th><th></th></tr></thead><tbody><tr v-for="row in templates" :key="`${row.event}-${row.channel}`"><td>{{ row.event }}</td><td>{{ row.channel === 'sms' ? 'SMS · پیکربندی نشده' : row.channel }}</td><td>{{ row.subject || '—' }}</td><td>{{ row.is_active ? 'فعال' : 'غیرفعال' }}</td><td class="text-truncate" style="max-width:300px">{{ row.body }}</td><td><v-btn size="small" :disabled="row.channel !== 'email'" @click="editTemplate(row)">ویرایش</v-btn></td></tr><tr v-if="!loading && !templates.length"><td colspan="6"><div class="admin-empty-state">قالبی ثبت نشده است.</div></td></tr></tbody></v-table></div></v-card></template>
    <v-dialog v-model="formOpen" max-width="700"><v-card class="pa-5" dir="rtl"><h2>{{ form.event ? 'ویرایش قالب ایمیل' : 'قالب ایمیل جدید' }}</h2><v-text-field v-model="form.event" label="کلید رویداد (مانند booking.confirmed)" :disabled="templates.some(item=>item.event===form.event && item.channel==='email')"/><v-text-field v-model="form.subject" label="موضوع ایمیل"/><v-textarea v-model="form.body" label="متن قالب" rows="8"/><v-switch v-model="form.is_active" label="فعال"/><v-btn color="primary" :loading="busy" :disabled="!form.event || !form.body.trim()" @click="saveTemplate">ذخیرهٔ قالب</v-btn></v-card></v-dialog>
  </main>
</template>
