<script setup lang="ts">
definePageMeta({ layout: 'blank' });
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const { login } = useAdminApi();

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    const user = await login(email.value, password.value);
    await navigateTo(user.is_admin || user.permissions.includes('*') || user.permissions.includes('dashboard.view') ? '/' : '/booking');
  } catch (e: any) {
    error.value = e?.data?.message || 'ورود ناموفق بود. اطلاعات واردشده را بررسی کنید.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="login-page" dir="rtl">
    <div class="login-orb login-orb--one" aria-hidden="true" />
    <div class="login-orb login-orb--two" aria-hidden="true" />
    <section class="login-shell">
      <aside class="login-aside">
        <NuxtLink to="/" class="login-brand">
          <span class="login-brand__mark"><v-icon icon="mdi-leaf" size="25" /></span>
          <span><strong>مرکز مشاوره</strong><small>فضای آرام برای مراقبت</small></span>
        </NuxtLink>
        <div class="login-aside__copy">
          <span class="login-kicker"><i /> فضای کاری تیم درمان</span>
          <h1>مراقبت بهتر،<br /><em>با نظمی آرام.</em></h1>
          <p>قرارها، مراجعان و کارهای روزانهٔ مرکز را در یک فضای امن و یکپارچه مدیریت کنید.</p>
        </div>
        <div class="login-aside__note"><v-icon icon="mdi-shield-check-outline" size="18" /><span>دسترسی امن و متناسب با نقش شما</span></div>
        <div class="login-art" aria-hidden="true"><span class="login-art__sun" /><span class="login-art__leaf login-art__leaf--a" /><span class="login-art__leaf login-art__leaf--b" /><span class="login-art__stem" /></div>
      </aside>

      <section class="login-form-panel">
        <div class="login-mobile-brand"><span class="login-brand__mark"><v-icon icon="mdi-leaf" size="23" /></span><strong>مرکز مشاوره</strong></div>
        <div class="login-form-heading">
          <span class="login-form-heading__icon"><v-icon icon="mdi-lock-open-outline" size="22" /></span>
          <div><div class="login-eyebrow">خوش آمدید</div><h2>ورود به پنل مدیریت</h2><p>برای ادامه، اطلاعات حساب خود را وارد کنید.</p></div>
        </div>
        <v-alert v-if="error" type="error" variant="tonal" closable class="login-error" @click:close="error = ''">{{ error }}</v-alert>
        <v-form class="login-form" @submit.prevent="submit">
          <label class="login-label" for="login-email">ایمیل</label>
          <v-text-field id="login-email" v-model="email" type="email" placeholder="name@example.com" autocomplete="username" variant="outlined" density="comfortable" prepend-inner-icon="mdi-email-outline" hide-details="auto" required />
          <div class="login-password-label"><label class="login-label" for="login-password">رمز عبور</label></div>
          <v-text-field id="login-password" v-model="password" type="password" placeholder="رمز عبور خود را وارد کنید" autocomplete="current-password" variant="outlined" density="comfortable" prepend-inner-icon="mdi-lock-outline" hide-details="auto" required />
          <v-btn type="submit" color="primary" size="large" block :loading="loading" class="login-submit" append-icon="mdi-arrow-left">ورود به فضای کاری</v-btn>
        </v-form>
        <div class="login-footnote"><v-icon icon="mdi-information-outline" size="17" /><span>برای دریافت یا بازیابی دسترسی با مدیر سامانه تماس بگیرید.</span></div>
      </section>
    </section>
    <footer class="login-footer">محیط مدیریت مرکز مشاوره <span>·</span> نسخهٔ امن سازمانی</footer>
  </main>
</template>
