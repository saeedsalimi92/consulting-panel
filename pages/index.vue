<script setup lang="ts">
const { request } = useAdminApi();
const auth = useAdminApi();
const stats = ref<any>({});
const error = ref('');
const loading = ref(true);
async function load() {
  loading.value = true; error.value = '';
  try { stats.value = await request('/admin/dashboard'); }
  catch (e: any) { error.value = e?.data?.message || 'خطا در دریافت آمار داشبورد'; }
  finally { loading.value = false; }
}
onMounted(load);
const items = computed(() => [
  { label: 'مشاوران', key: 'counselors', permission: 'counselors.manage', icon: 'mdi-account-group-outline', to: '/manage/counselors', tone: 'sage' },
  { label: 'تخصص‌ها', key: 'specialties', permission: 'specialties.manage', icon: 'mdi-shape-outline', to: '/manage/specialties', tone: 'sage' },
  { label: 'نظرات', key: 'comments', permission: 'comments.manage', icon: 'mdi-message-text-outline', to: '/manage/comments', tone: 'lavender' },
  { label: 'نظرات در انتظار', key: 'pending_comments', permission: 'comments.manage', icon: 'mdi-message-alert-outline', to: '/manage/comments', tone: 'peach' },
  { label: 'کاربران', key: 'users', permission: 'users.manage', icon: 'mdi-account-multiple-outline', to: '/manage/users', tone: 'lavender' },
  { label: 'درخواست‌های نوبت', key: 'appointments', permission: 'appointments.manage', icon: 'mdi-calendar-clock-outline', to: '/manage/appointments', tone: 'peach' },
].filter((item) => auth.can(item.permission)));
</script>

<template>
  <main dir="rtl" class="admin-dashboard">
    <section class="admin-welcome mb-6">
      <div>
        <div class="admin-eyebrow">مرکز مشاوره · پنل مدیریت</div>
        <h1>به فضای مدیریت خوش آمدید</h1>
        <p>نمایی روشن از وضعیت امروز مرکز و دسترسی سریع به بخش‌های اصلی.</p>
      </div>
      <v-btn variant="tonal" color="primary" prepend-icon="mdi-refresh" :loading="loading" @click="load">به‌روزرسانی</v-btn>
    </section>
    <v-alert v-if="error" type="error" closable class="mb-5" @click:close="error = ''">{{ error }}</v-alert>
    <div class="d-flex align-center justify-space-between mb-3">
      <div><h2 class="mb-1">خلاصه مرکز</h2><div class="text-medium-emphasis text-body-2">آمار دریافت‌شده از سامانه</div></div>
    </div>
    <v-row>
      <v-col v-for="item in items" :key="item.key" cols="12" sm="6" lg="4">
        <v-card :to="item.to" class="admin-stat-card" :class="`tone-${item.tone}`" hover>
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="admin-stat-label">{{ item.label }}</div>
              <v-skeleton-loader v-if="loading" type="text" width="70" class="mt-2" />
              <div v-else class="admin-stat-number">{{ stats[item.key] ?? '—' }}</div>
            </div>
            <div class="admin-stat-icon"><v-icon :icon="item.icon" size="23" /></div>
          </div>
          <div class="admin-stat-footer"><span>مشاهده و مدیریت</span><v-icon icon="mdi-arrow-left" size="16" /></div>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-if="!loading && !items.length" type="info" variant="tonal" class="mt-2">
      برای نمایش آمار مدیریتی، دست‌کم یکی از مجوزهای مدیریت بخش‌ها باید به حساب شما داده شود.
    </v-alert>
  </main>
</template>
