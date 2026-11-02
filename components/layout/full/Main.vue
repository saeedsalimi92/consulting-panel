<script setup lang="ts">
import { ref, computed } from "vue";
import sidebarItems from "@/components/layout/full/vertical-sidebar/sidebarItem";
import { Menu2Icon } from "vue-tabler-icons";
const auth = useAdminApi();
const adminName = computed(() => auth.user.value?.name || '');
const sidebarMenu = computed(() => {
  const visible: any[] = [];
  let pendingHeader: any = null;
  for (const item of sidebarItems as any[]) {
    if (item.header) {
      pendingHeader = item;
      continue;
    }
    if (item.permissionAny) {
      if (!item.permissionAny.some((permission: string) => auth.can(permission))) continue;
    } else if (item.permission && !auth.can(item.permission)) continue;
    if (item.adminOnly && !auth.user.value?.is_admin) continue;
    if (pendingHeader) visible.push(pendingHeader);
    visible.push(item);
    pendingHeader = null;
  }
  return visible;
});
const sDrawer = ref(true);
const accountOpen = ref(false), accountBusy = ref(false), accountError = ref(''), accountSuccess = ref(''), sessionInfo = ref<any>(null);
const passwordForm = reactive({ current_password: '', password: '', password_confirmation: '' });
async function openAccount() { accountOpen.value = true; accountError.value=''; try { const result:any=await auth.request('/session'); sessionInfo.value=result.data; } catch(e:any) { accountError.value=e?.data?.message||'اطلاعات نشست دریافت نشد.'; } }
async function changePassword() { if(accountBusy.value)return;accountBusy.value=true;accountError.value='';try{await auth.request('/password',{method:'PUT',body:{...passwordForm}});accountSuccess.value='رمز تغییر کرد؛ برای امنیت باید دوباره وارد شوید.';auth.clear();setTimeout(()=>navigateTo('/auth/login',{replace:true}),600);}catch(e:any){accountError.value=e?.data?.message||Object.values(e?.data?.errors||{}).flat().join(' · ')||'تغییر رمز انجام نشد.';}finally{accountBusy.value=false;} }
async function logoutAll() { if(!confirm('از همهٔ نشست‌های این حساب خارج شوید؟'))return;accountBusy.value=true;try{await auth.request('/logout-all',{method:'POST'});auth.clear();await navigateTo('/auth/login',{replace:true});}catch(e:any){accountError.value=e?.data?.message||'خروج از نشست‌ها انجام نشد.';accountBusy.value=false;} }
</script>

<template>
  <!------Sidebar-------->
  <v-navigation-drawer
    location="right"
    elevation="0"
    app
    class="leftSidebar"
    v-model="sDrawer"
    width="270"
  >
    <!---Logo part -->
    <div class="pa-5">
      <LayoutFullLogo />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <div>
      <perfect-scrollbar class="scrollnavbar">
        <v-list class="pa-6">
          <!---Menu Loop -->
          <template v-for="(item, i) in sidebarMenu">
            <!---Item Sub Header -->
            <LayoutFullVerticalSidebarNavGroup
              :item="item"
              v-if="item.header"
              :key="item.to || item.header"
            />

            <!---If Has Child -->
            <LayoutFullVerticalSidebarNavCollapse
              class="leftPadding"
              :item="item"
              :level="0"
              v-else-if="item.children"
            />

            <!---Single Item-->
            <LayoutFullVerticalSidebarNavItem
              :item="item"
              v-else
              class="leftPadding"
            />
            <!---End Single Item-->
          </template>
        </v-list>
      </perfect-scrollbar>
    </div>
  </v-navigation-drawer>
  <!------Header-------->
  <v-app-bar elevation="0" height="70" class="top-header">
    <div class="d-flex align-center justify-space-between w-100">
      <div>
        <v-btn
          class="hidden-lg-and-up ms-md-3 ms-sm-5 ms-3 text-muted"
          @click="sDrawer = !sDrawer"
          icon
          variant="flat"
          size="small"
        >
          <Menu2Icon size="20" stroke-width="1.5" />
        </v-btn>
        <span class="text-body-2 text-medium-emphasis hidden-sm-and-down">پنل مدیریت مرکز مشاوره</span>
      </div>
      <div>
        <span v-if="adminName" class="text-body-2 mx-3">{{ adminName }}</span>
        <v-btn v-if="adminName" size="small" variant="text" class="mx-1" @click="openAccount">حساب کاربری</v-btn>
        <v-btn size="small" variant="tonal" color="primary" @click="auth.logout">خروج</v-btn>
      </div>
    </div>
  </v-app-bar>
  <v-dialog v-model="accountOpen" max-width="560"><v-card class="pa-5" dir="rtl"><h2 class="mb-3">حساب و امنیت</h2><v-alert v-if="accountError" type="error" variant="tonal" class="mb-3">{{accountError}}</v-alert><v-alert v-if="accountSuccess" type="success" variant="tonal" class="mb-3">{{accountSuccess}}</v-alert><v-list v-if="sessionInfo?.token"><v-list-item title="نشست جاری" :subtitle="`ایجاد: ${sessionInfo.token.created_at||'—'} · آخرین استفاده: ${sessionInfo.token.last_used_at||'—'} · انقضا: ${sessionInfo.token.expires_at||'طبق تنظیم سرور'}`"/></v-list><h3 class="my-3">تغییر رمز عبور</h3><v-text-field v-model="passwordForm.current_password" type="password" autocomplete="current-password" label="رمز فعلی"/><v-text-field v-model="passwordForm.password" type="password" autocomplete="new-password" label="رمز جدید (حداقل ۱۲ نویسه)"/><v-text-field v-model="passwordForm.password_confirmation" type="password" autocomplete="new-password" label="تکرار رمز جدید"/><div class="d-flex flex-wrap ga-2"><v-btn color="primary" :loading="accountBusy" :disabled="passwordForm.password.length<12||passwordForm.password!==passwordForm.password_confirmation||!passwordForm.current_password" @click="changePassword">تغییر رمز</v-btn><v-btn color="error" variant="outlined" :loading="accountBusy" @click="logoutAll">خروج از همهٔ نشست‌ها</v-btn><v-btn variant="text" @click="accountOpen=false">بستن</v-btn></div></v-card></v-dialog>
</template>
