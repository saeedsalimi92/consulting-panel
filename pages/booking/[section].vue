<script setup lang="ts">
const route = useRoute();
const section = computed(() => String(route.params.section || ''));
const advanced = ['exports', 'admin-inbox', 'roles', 'content-media', 'sms-reminders', 'payment-settings', 'booking-settings', 'audit-log'].includes(String(route.params.section || ''));
</script>
<template>
  <SmsReminderWorkspace v-if="section === 'sms-reminders'" />
  <AdminOperationsWorkspace v-else-if="advanced" />
  <ReceptionWorkspace v-else-if="['reception','rooms','waitlist'].includes(section)" />
  <ClinicalWorkspace v-else-if="['clinical','forms'].includes(section)" />
  <NotificationWorkspace v-else-if="['notifications','notification-templates'].includes(section)" />
  <PromoWorkspace v-else-if="section === 'promos'" />
  <BookingWorkspace v-else />
</template>
