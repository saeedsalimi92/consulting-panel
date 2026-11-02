<script setup lang="ts">
const { logout } = useAdminApi();
</script>
<template><v-container dir="rtl" class="pa-10"><v-alert type="warning" title="دسترسی غیرمجاز">شما مجوز مشاهده این صفحه را ندارید.</v-alert><v-btn class="mt-4" to="/">بازگشت به داشبورد</v-btn><v-btn class="mt-4 mr-2" @click="logout">خروج</v-btn></v-container></template>
