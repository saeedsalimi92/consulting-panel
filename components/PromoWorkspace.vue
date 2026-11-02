<script setup lang="ts">
const { api, page, lastPage, errorText, dateTime, money } = useBooking();
const loading = ref(false), busy = ref(false), error = ref(''), success = ref('');
const rows = ref<any[]>([]), currentPage = ref(1), totalPages = ref(1), dialog = ref(false), editing = ref<any>(null);
const form = reactive({ code: '', label: '', discount_type: 'fixed', discount_value: 0, max_redemptions: null as number | null, max_per_client: 1, starts_at: '', ends_at: '', is_active: true });
const dateValue = (value: string) => value ? `${value}:00+03:30` : null;
const valueForInput = (value: string | null) => value ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)).replace(' ', 'T') : '';

async function load() {
  loading.value = true; error.value = '';
  try { const result = await api<any>(`/promo-codes?page=${currentPage.value}`); rows.value = page(result); totalPages.value = lastPage(result); }
  catch (e: any) { error.value = errorText(e); }
  finally { loading.value = false; }
}
function open(item?: any) {
  editing.value = item || null;
  Object.assign(form, item ? { ...item, starts_at: valueForInput(item.starts_at), ends_at: valueForInput(item.ends_at) }
    : { code: '', label: '', discount_type: 'fixed', discount_value: 0, max_redemptions: null, max_per_client: 1, starts_at: '', ends_at: '', is_active: true });
  dialog.value = true;
}
async function save() {
  if (busy.value) return;
  busy.value = true; error.value = ''; success.value = '';
  const body: any = { ...form, starts_at: dateValue(form.starts_at), ends_at: dateValue(form.ends_at) };
  if (editing.value) { delete body.code; delete body.discount_type; }
  try { await api(`/promo-codes${editing.value ? `/${editing.value.id}` : ''}`, { method: editing.value ? 'PATCH' : 'POST', body }); dialog.value = false; success.value = 'کد تخفیف ذخیره شد.'; await load(); }
  catch (e: any) { error.value = errorText(e); }
  finally { busy.value = false; }
}
watch(currentPage, load);
onMounted(load);
</script>

<template>
  <main dir="rtl" class="admin-page">
    <header class="admin-page__header"><div><div class="admin-eyebrow">مالی · ترویج فروش</div><h1>کدهای تخفیف</h1><p>اعتبارسنجی و محدودیت استفاده را backend هنگام رزرو اعمال می‌کند.</p></div><div class="d-flex ga-2"><v-btn color="primary" prepend-icon="mdi-plus" @click="open()">کد جدید</v-btn><v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">به‌روزرسانی</v-btn></div></header>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">{{ error }}</v-alert><v-alert v-if="success" type="success" variant="tonal" class="mb-4" closable @click:close="success = ''">{{ success }}</v-alert>
    <v-alert type="info" variant="tonal" class="mb-4">درصد تخفیف برحسب basis point ذخیره می‌شود؛ ۱۰۰ یعنی ۱٪. قیمت رزرو و مبلغ تخفیف snapshot backend است.</v-alert>
    <v-card class="admin-table-card"><div class="admin-table-scroll"><v-table><thead><tr><th>کد</th><th>عنوان</th><th>مقدار</th><th>بازهٔ اعتبار</th><th>استفاده</th><th>محدودیت هر مراجع</th><th>وضعیت</th><th></th></tr></thead><tbody><tr v-for="item in rows" :key="item.id"><td><strong>{{ item.code }}</strong></td><td>{{ item.label || '—' }}</td><td>{{ item.discount_type === 'percentage' ? `${(Number(item.discount_value)/100).toLocaleString('fa-IR')}٪` : money(item.discount_value) }}</td><td>{{ item.starts_at ? dateTime(item.starts_at) : 'از ابتدا' }}<br>{{ item.ends_at ? dateTime(item.ends_at) : 'بدون پایان' }}</td><td>{{ item.redemptions }} / {{ item.max_redemptions ?? '∞' }}</td><td>{{ item.max_per_client }}</td><td>{{ item.is_active ? 'فعال' : 'غیرفعال' }}</td><td><v-btn size="small" @click="open(item)">ویرایش</v-btn></td></tr><tr v-if="!loading && !rows.length"><td colspan="8"><div class="admin-empty-state">کد تخفیفی ثبت نشده است.</div></td></tr></tbody></v-table></div><div v-if="totalPages > 1" class="admin-table-pagination"><v-btn :disabled="currentPage <= 1" @click="currentPage--">قبلی</v-btn><span>صفحهٔ {{ currentPage }} از {{ totalPages }}</span><v-btn :disabled="currentPage >= totalPages" @click="currentPage++">بعدی</v-btn></div></v-card>
    <v-dialog v-model="dialog" max-width="720"><v-card class="pa-5" dir="rtl"><h2>{{ editing ? 'ویرایش کد' : 'کد تخفیف جدید' }}</h2><v-text-field v-model="form.code" label="کد" :disabled="!!editing"/><v-text-field v-model="form.label" label="عنوان داخلی"/><v-select v-model="form.discount_type" :items="[{title:'مبلغ ثابت (ریال)',value:'fixed'},{title:'درصد (basis point)',value:'percentage'}]" label="نوع تخفیف" :disabled="!!editing"/><v-text-field v-model.number="form.discount_value" type="number" min="1" :max="form.discount_type==='percentage'?9999:1000000000" :label="form.discount_type==='percentage'?'مقدار (۱۰۰ = ۱٪)':'مبلغ (ریال)'"/><v-row><v-col cols="12" md="4"><v-text-field v-model.number="form.max_redemptions" type="number" min="1" label="حداکثر استفادهٔ کل (اختیاری)"/></v-col><v-col cols="12" md="4"><v-text-field v-model.number="form.max_per_client" type="number" min="1" max="100" label="حداکثر هر مراجع"/></v-col><v-col cols="12" md="4"><v-switch v-model="form.is_active" label="فعال"/></v-col></v-row><v-text-field v-model="form.starts_at" type="datetime-local" label="شروع اعتبار (تهران)"/><v-text-field v-model="form.ends_at" type="datetime-local" label="پایان اعتبار (تهران)"/><v-btn color="primary" :loading="busy" :disabled="!editing && !form.code.trim() || !form.discount_value || form.max_per_client < 1" @click="save">ذخیره</v-btn></v-card></v-dialog>
  </main>
</template>
