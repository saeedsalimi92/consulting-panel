<script setup lang="ts">
const { request } = useAdminApi();
const rows = ref<any[]>([]);
const error = ref('');
const loading = ref(false);
const page = ref(1);
const lastPage = ref(1);
const search = ref('');
const saving = ref<number[]>([]);
const statuses = [
  { title: 'جدید', value: 'new' },
  { title: 'پیگیری شده', value: 'contacted' },
  { title: 'تأیید شده', value: 'confirmed' },
  { title: 'لغو شده', value: 'cancelled' },
  { title: 'انجام شده', value: 'completed' },
];
const visibleRows = computed(() => {
  const q = search.value.trim().toLocaleLowerCase('fa-IR');
  if (!q) return rows.value;
  return rows.value.filter((row) => [row.name, row.phone, row.id].some((value) => String(value || '').toLocaleLowerCase('fa-IR').includes(q)));
});
function dateTime(value: string) {
  if (!value) return 'زمانی تعیین نشده';
  const normalized = /(?:Z|[+-]\d\d:\d\d)$/.test(value) ? value : `${value.replace(' ', 'T')}Z`;
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'Asia/Tehran', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(normalized));
}
async function load() {
  loading.value = true;
  error.value = '';
  try {
    const response = await request<any>(`/admin/appointments?page=${page.value}`);
    rows.value = response.data || [];
    lastPage.value = response.last_page || 1;
  } catch (e: any) {
    error.value = e?.data?.message || 'دریافت درخواست‌های نوبت انجام نشد.';
  } finally {
    loading.value = false;
  }
}
async function change(row: any, previous: string) {
  saving.value = [...saving.value, row.id];
  error.value = '';
  try {
    await request(`/admin/appointments/${row.id}`, { method: 'PATCH', body: { status: row.status } });
  } catch (e: any) {
    row.status = previous;
    error.value = e?.data?.message || 'ذخیره وضعیت انجام نشد. وضعیت قبلی بازیابی شد.';
  } finally {
    saving.value = saving.value.filter((id) => id !== row.id);
  }
}
watch(page, load);
onMounted(load);
</script>

<template>
  <main dir="rtl" class="admin-page">
    <header class="admin-page__header">
      <div>
        <div class="admin-eyebrow">پذیرش و پیگیری</div>
        <h1>درخواست‌های نوبت</h1>
        <p>درخواست‌های ثبت‌شده در سایت را بررسی و وضعیت پیگیری را به‌روز کنید.</p>
      </div>
      <v-btn variant="tonal" color="primary" prepend-icon="mdi-refresh" :loading="loading" @click="load">به‌روزرسانی</v-btn>
    </header>

    <v-alert v-if="error" type="error" closable class="mb-4" @click:close="error = ''">{{ error }}</v-alert>

    <v-card class="admin-table-card">
      <div class="admin-table-toolbar">
        <div>
          <h2>فهرست درخواست‌ها</h2>
          <p>{{ visibleRows.length.toLocaleString('fa-IR') }} مورد در این صفحه</p>
        </div>
        <v-text-field v-model="search" label="جست‌وجوی نام، تلفن یا شناسه" prepend-inner-icon="mdi-magnify" hide-details clearable density="comfortable" class="admin-table-search" />
      </div>
      <v-progress-linear v-if="loading" indeterminate color="primary" />
      <div class="admin-table-scroll">
        <v-table>
          <thead><tr><th>مراجع</th><th>زمان پیشنهادی</th><th>توضیحات</th><th>وضعیت پیگیری</th></tr></thead>
          <tbody>
            <tr v-for="row in visibleRows" :key="row.id">
              <td><strong>{{ row.name }}</strong><div class="text-caption text-medium-emphasis">{{ row.phone }} · #{{ row.id }}</div></td>
              <td>{{ dateTime(row.preferred_at) }}</td>
              <td class="admin-appointment-notes">{{ row.notes || '—' }}</td>
              <td><v-select :model-value="row.status" :items="statuses" item-title="title" item-value="value" density="compact" hide-details :loading="saving.includes(row.id)" :disabled="saving.includes(row.id)" :aria-label="`وضعیت پیگیری ${row.name}`" @update:model-value="value => { const previous = row.status; row.status = value; change(row, previous); }" /></td>
            </tr>
            <tr v-if="!loading && !visibleRows.length"><td colspan="4"><div class="admin-empty-state"><v-icon icon="mdi-calendar-search-outline" size="28"/><strong>{{ search ? 'درخواستی با این جست‌وجو پیدا نشد' : 'هنوز درخواستی ثبت نشده است' }}</strong><span>{{ search ? 'نام، شماره تماس یا شناسه را بررسی کنید.' : 'درخواست‌های تازه از سایت در این فهرست نمایش داده می‌شوند.' }}</span></div></td></tr>
          </tbody>
        </v-table>
      </div>
      <div v-if="lastPage > 1" class="admin-table-pagination">
        <span>صفحه {{ page.toLocaleString('fa-IR') }} از {{ lastPage.toLocaleString('fa-IR') }}</span>
        <v-pagination v-model="page" :length="lastPage" :total-visible="5" rounded="lg" density="comfortable" />
      </div>
    </v-card>
  </main>
</template>
