<script setup lang="ts">
definePageMeta({ layout: false })
const auth=useCounselorAuth(),email=ref(''),password=ref(''),busy=ref(false),error=ref('')
useHead({title:'ورود مشاور | پنل مرکز مشاوره',htmlAttrs:{lang:'fa'}})
async function submit(){if(busy.value)return;busy.value=true;error.value='';try{await auth.login(email.value,password.value);await navigateTo('/counselor',{replace:true})}catch(e:any){error.value=e?.data?.message||Object.values(e?.data?.errors||{}).flat().join(' ')||'اطلاعات ورود معتبر نیست.'}finally{busy.value=false}}
</script>
<template><main class="counselor-login" dir="rtl"><form class="counselor-login__card" @submit.prevent="submit"><p>فضای کاری درمانگر</p><h1>ورود مشاور</h1><p>برای مشاهده نوبت‌ها و اطلاعات جلسات وارد شوید.</p><v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{error}}</v-alert><v-text-field v-model="email" label="ایمیل" type="email" autocomplete="username" required/><v-text-field v-model="password" label="رمز عبور" type="password" autocomplete="current-password" required/><v-btn type="submit" color="primary" block size="large" :loading="busy">ورود به پنل مشاور</v-btn></form></main></template>
<style scoped>.counselor-login{min-height:100vh;display:grid;place-items:center;padding:24px;background:#f5f4ef}.counselor-login__card{width:min(100%,480px);padding:36px;border:1px solid #e4e5df;border-radius:22px;background:white;box-shadow:0 20px 60px #243b3214}.counselor-login__card>p:first-child{color:#577067}.counselor-login h1{margin:0 0 12px}.counselor-login__card>p:nth-of-type(2){margin-bottom:24px;color:#626c68}</style>
