<script setup lang="ts">
const auth = useAdminApi();
const { api, page, lastPage, errorText, dateTime } = useBooking();
const route = useRoute();
const section = computed(() => String(route.params.section || 'clinical'));
const loading = ref(false), busy = ref(false), error = ref(''), success = ref('');
const query = ref(''), clients = ref<any[]>([]), selected = ref<any>(null), tab = ref('record');
const record = reactive({ client_concerns: '', treatment_goals: [] as string[], progress_summary: '', primary_counselor_id: null as number | null });
const followUps = ref<any[]>([]), answers = ref<any>({ rows: [], current_page: 1, last_page: 1 }), consents = ref<any[]>([]), attachments = ref<any>({ rows: [], current_page: 1, last_page: 1 });
const followUp = reactive({ title: '', details: '', due_date: '', booking_id: null as number | null });
const file = ref<File | null>(null);
const forms = ref<any[]>([]), formDialog = ref(false), versionDialog = ref(false), selectedForm = ref<any>(null);
const schemaText = ref('[\n  {"key":"concern","label":"موضوع مراجعه","type":"textarea","required":true}\n]');
const formDraft = reactive({ title: '', key: '', is_active: true });
const noteRows = ref<any[]>([]);
const counselors = ref<any[]>([]);
const statusLabel: Record<string,string> = { draft: 'پیش‌نویس', finalized: 'نهایی‌شده', active: 'فعال', completed: 'انجام‌شده' };

async function searchClients() {
  if (query.value.trim().length < 2) { clients.value = []; return; }
  loading.value = true; error.value = '';
  try { clients.value = page(await api<any>(`/clients?q=${encodeURIComponent(query.value.trim())}`)); }
  catch (e: any) { error.value = errorText(e); }
  finally { loading.value = false; }
}

async function loadProfile() {
  if (!selected.value) return;
  loading.value = true; error.value = '';
  try {
    const id = selected.value.id;
    const [recordResult, followResult, answerResult, consentResult, attachmentResult] = await Promise.all([
      api<any>(`/clinical/clients/${id}`), api<any>(`/clinical/clients/${id}/follow-ups`),
      api<any>(`/clinical/clients/${id}/intake-answers`), api<any>(`/clinical/clients/${id}/consents`),
      api<any>(`/clinical/clients/${id}/attachments`),
    ]);
    Object.assign(record, recordResult.data || { client_concerns: '', treatment_goals: [], progress_summary: '', primary_counselor_id: null });
    if (typeof record.treatment_goals === 'string') record.treatment_goals = JSON.parse(record.treatment_goals || '[]');
    followUps.value = page(followResult); answers.value = { rows: page(answerResult), current_page: answerResult.data?.current_page || 1, last_page: answerResult.data?.last_page || 1 };
    consents.value = consentResult.data || [];
    attachments.value = { rows: page(attachmentResult), current_page: attachmentResult.data?.current_page || 1, last_page: attachmentResult.data?.last_page || 1 };
    noteRows.value = [];
    // Booking search supports client_id and keeps the clinical screen scoped to this selected client.
    const reservations = await api<any>(`/reservations?client_id=${id}&page=1`);
    const ids = page(reservations).map((item: any) => item.id);
    const notes = await Promise.all(ids.slice(0, 10).map((bookingId: number) => api<any>(`/reservations/${bookingId}/session-notes`).catch(() => ({ data: [] }))));
    noteRows.value = notes.flatMap((result: any) => result.data || []);
  } catch (e: any) { error.value = errorText(e); }
  finally { loading.value = false; }
}

async function loadClinicalPage(kind: 'intake-answers' | 'attachments', nextPage: number) {
  if (!selected.value) return;
  loading.value = true; error.value = '';
  try {
    const result = await api<any>(`/clinical/clients/${selected.value.id}/${kind}?page=${nextPage}`);
    const state = { rows: page(result), current_page: result.data?.current_page || nextPage, last_page: result.data?.last_page || 1 };
    if (kind === 'intake-answers') answers.value = state; else attachments.value = state;
  } catch (e: any) { error.value = errorText(e); }
  finally { loading.value = false; }
}

async function loadForms() {
  loading.value = true; error.value = '';
  try { forms.value = page(await api<any>('/clinical/forms')); }
  catch (e: any) { error.value = errorText(e); }
  finally { loading.value = false; }
}

async function saveRecord() {
  if (!selected.value || busy.value) return;
  busy.value = true; error.value = ''; success.value = '';
  try { await api(`/clinical/clients/${selected.value.id}`, { method: 'PUT', body: { ...record } }); success.value = 'پرونده بالینی ذخیره شد.'; await loadProfile(); }
  catch (e: any) { error.value = errorText(e); }
  finally { busy.value = false; }
}

async function addFollowUp() {
  if (!selected.value || busy.value) return;
  busy.value = true; error.value = ''; success.value = '';
  try { await api(`/clinical/clients/${selected.value.id}/follow-ups`, { method: 'POST', body: { ...followUp } }); Object.assign(followUp, { title: '', details: '', due_date: '', booking_id: null }); success.value = 'پیگیری ثبت شد.'; await loadProfile(); }
  catch (e: any) { error.value = errorText(e); }
  finally { busy.value = false; }
}

async function completeFollowUp(task: any) {
  if (busy.value || task.completed_at) return;
  busy.value = true; error.value = ''; success.value = '';
  try { await api(`/clinical/follow-ups/${task.id}/complete`, { method: 'POST' }); success.value = 'پیگیری تکمیل شد.'; await loadProfile(); }
  catch (e: any) { error.value = errorText(e); }
  finally { busy.value = false; }
}

async function uploadAttachment() {
  if (!selected.value || !file.value || busy.value) return;
  busy.value = true; error.value = ''; success.value = '';
  try { const body = new FormData(); body.append('file', file.value); await api(`/clinical/clients/${selected.value.id}/attachments`, { method: 'POST', body }); file.value = null; success.value = 'فایل خصوصی بارگذاری شد.'; await loadProfile(); }
  catch (e: any) { error.value = errorText(e); }
  finally { busy.value = false; }
}

async function downloadAttachment(item: any) {
  error.value = '';
  try {
    const config = useRuntimeConfig();
    const response = await fetch(`${config.public.apiBase}/admin/booking/clinical/attachments/${item.id}`, { headers: { Authorization: `Bearer ${auth.token.value}`, Accept: 'application/octet-stream' } });
    if (!response.ok) throw { status: response.status, data: { message: response.status === 403 ? 'دانلود این فایل مجاز نیست.' : 'دانلود فایل انجام نشد.' } };
    const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement('a'); anchor.href = url; anchor.download = item.original_name; anchor.click(); URL.revokeObjectURL(url);
  } catch (e: any) { error.value = errorText(e); }
}

function openNewForm() { Object.assign(formDraft, { title: '', key: '', is_active: true }); schemaText.value = '[\n  {"key":"concern","label":"موضوع مراجعه","type":"textarea","required":true}\n]'; formDialog.value = true; }
function openVersion(form: any) { selectedForm.value = form; schemaText.value = JSON.stringify(JSON.parse(form.schema || '[]'), null, 2); versionDialog.value = true; }
function parseSchema() {
  const schema = JSON.parse(schemaText.value);
  if (!Array.isArray(schema) || !schema.length) throw new Error('حداقل یک پرسش لازم است.');
  const keys = new Set<string>();
  for (const field of schema) {
    if (!field.key || !field.label || !['text','textarea','number','boolean','select','multiselect','date'].includes(field.type) || typeof field.required !== 'boolean') throw new Error('هر پرسش باید key، label، type معتبر و required بولی داشته باشد.');
    if (keys.has(field.key)) throw new Error('کلید پرسش‌ها باید یکتا باشد.');
    keys.add(field.key);
    if (['select','multiselect'].includes(field.type) && (!Array.isArray(field.options) || !field.options.length)) throw new Error('برای پرسش انتخابی، options غیرخالی لازم است.');
  }
  return schema;
}
async function saveForm() {
  if (busy.value) return;
  busy.value = true; error.value = '';
  try { await api('/clinical/forms', { method: 'POST', body: { ...formDraft, schema: parseSchema() } }); formDialog.value = false; success.value = 'فرم با نسخهٔ اول منتشر شد.'; await loadForms(); }
  catch (e: any) { error.value = e instanceof Error ? e.message : errorText(e); }
  finally { busy.value = false; }
}
async function publishVersion() {
  if (busy.value || !selectedForm.value) return;
  busy.value = true; error.value = '';
  try { await api(`/clinical/forms/${selectedForm.value.id}/versions`, { method: 'POST', body: { schema: parseSchema() } }); versionDialog.value = false; success.value = 'نسخهٔ جدید فرم منتشر شد.'; await loadForms(); }
  catch (e: any) { error.value = e instanceof Error ? e.message : errorText(e); }
  finally { busy.value = false; }
}

onMounted(async () => {
  if (!auth.can('notes.manage')) return;
  if (auth.can('counselors.manage')) { try { counselors.value = page(await auth.request<any>('/admin/counselors')); } catch { /* Optional display only */ } }
  if (section.value === 'forms') await loadForms();
});
watch(section, async value => { if (value === 'forms') await loadForms(); });
</script>

<template>
  <main dir="rtl" class="admin-page">
    <header class="admin-page__header"><div><div class="admin-eyebrow">دسترسی بالینی محدود</div><h1>{{ section === 'forms' ? 'فرم‌های پذیرش و ارزیابی' : 'پرونده بالینی مراجع' }}</h1><p>اطلاعات فقط در حافظهٔ صفحه نگهداری و فقط از endpoint مجاز backend دریافت می‌شود.</p></div><v-btn v-if="section === 'forms'" color="primary" prepend-icon="mdi-plus" @click="openNewForm">فرم جدید</v-btn></header>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">{{ error }}</v-alert><v-alert v-if="success" type="success" variant="tonal" class="mb-4" closable @click:close="success = ''">{{ success }}</v-alert><v-progress-linear v-if="loading" indeterminate class="mb-3" />

    <template v-if="section === 'forms'"><v-card><v-table><thead><tr><th>عنوان</th><th>شناسه</th><th>نسخه منتشرشده</th><th>وضعیت</th><th></th></tr></thead><tbody><tr v-for="item in forms" :key="item.id"><td>{{ item.title }}</td><td>{{ item.key }}</td><td>{{ item.version || '—' }}</td><td>{{ item.is_active ? 'فعال' : 'غیرفعال' }}</td><td><v-btn size="small" @click="openVersion(item)">انتشار نسخهٔ جدید</v-btn></td></tr><tr v-if="!loading && !forms.length"><td colspan="5"><div class="admin-empty-state">فرمی ثبت نشده است.</div></td></tr></tbody></v-table></v-card><v-alert type="info" variant="tonal" class="mt-4">نسخه‌های منتشرشده immutable هستند. ارسال پاسخ توسط مراجع در این پنل انجام نمی‌شود؛ API submission متعلق به نشست مراجع است.</v-alert></template>

    <template v-else>
      <v-card class="pa-4 mb-4"><div class="d-flex flex-wrap ga-2"><v-text-field v-model="query" label="جست‌وجوی مراجع با نام یا تلفن" hide-details @keyup.enter="searchClients"/><v-btn color="primary" :loading="loading" @click="searchClients">جست‌وجو</v-btn></div><v-list v-if="clients.length"><v-list-item v-for="client in clients" :key="client.id" :title="client.name" :subtitle="client.phone || ''" @click="selected = client; tab = 'record'; loadProfile()"/></v-list></v-card>
      <section v-if="selected"><v-card class="pa-4 mb-4"><div class="d-flex justify-space-between align-center"><div><h2>{{ selected.name }}</h2><div class="text-medium-emphasis">شناسهٔ مراجع: {{ selected.id }} · {{ selected.phone }}</div></div><v-btn variant="text" @click="selected = null">بستن پرونده</v-btn></div></v-card>
        <v-tabs v-model="tab" color="primary" class="mb-4"><v-tab value="record">خلاصهٔ بالینی</v-tab><v-tab value="answers">پاسخ فرم‌ها</v-tab><v-tab value="consents">رضایت‌ها</v-tab><v-tab value="followups">پیگیری‌ها</v-tab><v-tab value="attachments">فایل‌های خصوصی</v-tab><v-tab value="notes">یادداشت جلسات</v-tab></v-tabs>
        <v-card v-if="tab === 'record'" class="pa-5"><v-textarea v-model="record.client_concerns" label="نگرانی‌های مطرح‌شده" rows="3"/><v-combobox v-model="record.treatment_goals" label="هدف‌های درمانی" multiple chips/><v-textarea v-model="record.progress_summary" label="خلاصهٔ پیشرفت" rows="3"/><v-select v-if="auth.can('counselors.manage') && counselors.length" v-model="record.primary_counselor_id" :items="counselors" item-title="name" item-value="id" label="مشاور اصلی" clearable/><v-btn color="primary" :loading="busy" @click="saveRecord">ذخیرهٔ پرونده</v-btn></v-card>
        <v-card v-else-if="tab === 'answers'" class="pa-4"><v-list><v-list-item v-for="answer in answers.rows" :key="answer.id" :title="`${answer.form_title} · نسخه ${answer.version}`" :subtitle="`${dateTime(answer.submitted_at)} · ${answer.answers}`"/><v-list-item v-if="!answers.rows.length" title="پاسخی برای نمایش وجود ندارد."/></v-list><div v-if="answers.last_page > 1" class="admin-table-pagination"><v-btn :disabled="answers.current_page <= 1 || loading" @click="loadClinicalPage('intake-answers', answers.current_page - 1)">قبلی</v-btn><span>صفحه {{ answers.current_page }} از {{ answers.last_page }}</span><v-btn :disabled="answers.current_page >= answers.last_page || loading" @click="loadClinicalPage('intake-answers', answers.current_page + 1)">بعدی</v-btn></div></v-card>
        <v-card v-else-if="tab === 'consents'" class="pa-4"><v-table><thead><tr><th>کلید</th><th>نسخه</th><th>ثبت‌شده در</th></tr></thead><tbody><tr v-for="item in consents" :key="item.id"><td>{{ item.consent_key }}</td><td>{{ item.version }}</td><td>{{ dateTime(item.accepted_at) }}</td></tr><tr v-if="!consents.length"><td colspan="3">رضایتی ثبت نشده است.</td></tr></tbody></v-table></v-card>
        <v-card v-else-if="tab === 'followups'" class="pa-4"><v-row><v-col cols="12" md="4"><v-text-field v-model="followUp.title" label="عنوان پیگیری"/></v-col><v-col cols="12" md="4"><v-text-field v-model="followUp.due_date" type="date" label="سررسید"/></v-col><v-col cols="12" md="4"><v-text-field v-model="followUp.booking_id" type="number" label="شناسه نوبت (اختیاری)"/></v-col><v-col cols="12"><v-textarea v-model="followUp.details" label="جزئیات" rows="2"/></v-col></v-row><v-btn class="mb-4" :disabled="busy || !followUp.title.trim()" @click="addFollowUp">ثبت پیگیری</v-btn><v-list><v-list-item v-for="task in followUps" :key="task.id" :title="task.title" :subtitle="`${task.due_date || 'بدون سررسید'} · ${task.details || ''} · ${task.completed_at ? 'تکمیل‌شده' : 'باز'}`"><template #append><v-btn v-if="!task.completed_at" size="small" :disabled="busy" @click="completeFollowUp(task)">تکمیل</v-btn></template></v-list-item><v-list-item v-if="!followUps.length" title="پیگیری‌ای ثبت نشده است."/></v-list></v-card>
        <v-card v-else-if="tab === 'attachments'" class="pa-4"><v-file-input v-model="file" label="فایل خصوصی (PDF، تصویر یا سند، حداکثر ۱۰ مگابایت)" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"/><v-btn :disabled="busy || !file" :loading="busy" @click="uploadAttachment">بارگذاری امن</v-btn><v-list class="mt-3"><v-list-item v-for="item in attachments.rows" :key="item.id" :title="item.original_name" :subtitle="`${item.mime_type} · ${Number(item.size_bytes).toLocaleString('fa-IR')} بایت · ${dateTime(item.created_at)}`"><template #append><v-btn size="small" @click="downloadAttachment(item)">دانلود امن</v-btn></template></v-list-item><v-list-item v-if="!attachments.rows.length" title="فایل خصوصی بارگذاری نشده است."/></v-list><div v-if="attachments.last_page > 1" class="admin-table-pagination"><v-btn :disabled="attachments.current_page<=1 || loading" @click="loadClinicalPage('attachments',attachments.current_page-1)">قبلی</v-btn><span>صفحهٔ {{ attachments.current_page }} از {{ attachments.last_page }}</span><v-btn :disabled="attachments.current_page>=attachments.last_page || loading" @click="loadClinicalPage('attachments',attachments.current_page+1)">بعدی</v-btn></div></v-card>
        <v-card v-else class="pa-4"><v-list><v-list-item v-for="item in noteRows" :key="item.id" :title="`نوبت #${item.booking_id} · ${statusLabel[item.status] || item.status}`" :subtitle="`${dateTime(item.updated_at)} · ${item.body}`"/><v-list-item v-if="!noteRows.length" title="یادداشتی برای نوبت‌های این مراجع پیدا نشد."/></v-list></v-card>
      </section>
      <v-alert v-else type="info" variant="tonal">برای مشاهدهٔ پروندهٔ بالینی، ابتدا مراجع را جست‌وجو و انتخاب کنید.</v-alert>
    </template>

    <v-dialog v-model="formDialog" max-width="800"><v-card class="pa-5" dir="rtl"><h2>فرم جدید</h2><v-text-field v-model="formDraft.title" label="عنوان"/><v-text-field v-model="formDraft.key" label="کلید انگلیسی (حروف کوچک، عدد، خط تیره یا زیرخط)"/><v-switch v-model="formDraft.is_active" label="فعال"/><v-textarea v-model="schemaText" label="ساختار پرسش‌ها (JSON)" rows="12"/><v-alert type="info" variant="tonal">نوع‌های مجاز: text, textarea, number, boolean, select, multiselect, date. برای گزینه‌ای، options آرایهٔ رشته‌هاست.</v-alert><v-btn color="primary" :loading="busy" :disabled="!formDraft.title || !formDraft.key" @click="saveForm">ایجاد و انتشار نسخهٔ ۱</v-btn></v-card></v-dialog>
    <v-dialog v-model="versionDialog" max-width="800"><v-card class="pa-5" dir="rtl"><h2>انتشار نسخهٔ جدید · {{ selectedForm?.title }}</h2><v-textarea v-model="schemaText" label="ساختار JSON جدید" rows="14"/><v-alert type="warning" variant="tonal">نسخهٔ منتشرشده تغییرناپذیر است؛ پاسخ‌های قبلی با نسخهٔ قبلی باقی می‌مانند.</v-alert><v-btn color="primary" :loading="busy" @click="publishVersion">انتشار نسخه</v-btn></v-card></v-dialog>
  </main>
</template>
