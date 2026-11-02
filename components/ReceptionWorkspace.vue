<script setup lang="ts">
const { api, page, lastPage, dateTime, localDate, errorText } = useBooking();
const section = computed(() => String(useRoute().params.section || 'reception'));
const auth = useAdminApi();
const loading = ref(false);
const busy = ref(false);
const error = ref('');
const success = ref('');
const dashboard = ref<any>(null);
const rows = ref<any[]>([]);
const rooms = ref<any[]>([]);
const totalPages = ref(1);
const pageNumber = ref(1);
const selected = ref<any>(null);
const formOpen = ref(false);
const form = reactive({ id: null as number | null, name: '', location: '', capacity: 1, is_active: true });
const roomId = ref<number | null>(null);
const filters = reactive({ date: localDate(), status: 'active', counselor_id: null as number | null, service_id: null as number | null });
const counselors = ref<any[]>([]);
const services = ref<any[]>([]);
const roomDetail=ref<any>(null),roomTab=ref('calendar'),roomCalendar=ref<any[]>([]),roomHours=ref<any[]>([]),roomClosures=ref<any[]>([]);
const roomRange=reactive({from:localDate(),to:localDate()}),maintenance=reactive({starts_at:'',ends_at:'',reason:''});
const weekdays=['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'];
const statusTitle: Record<string, string> = {
  held: 'در انتظار پرداخت', confirmed: 'تأیید شده', checked_in: 'پذیرش شده', in_progress: 'در حال برگزاری',
  completed: 'برگزار شده', no_show: 'عدم حضور', cancelled: 'لغو شده', expired: 'منقضی',
  active: 'فعال', notified: 'اطلاع‌رسانی شده', assigned: 'به نوبت تبدیل شده',
};
const money = (value: unknown) => `${Number(value || 0).toLocaleString('fa-IR')} ریال`;

async function load() {
  loading.value = true;
  error.value = '';
  try {
    if (section.value === 'rooms') {
      const result = await api<any>(`/rooms?date=${filters.date}`);
      rooms.value = result.data || [];
    } else if (section.value === 'waitlist') {
      const result = await api<any>(`/waitlist?page=${pageNumber.value}&status=${filters.status}&counselor_id=${filters.counselor_id || ''}&service_id=${filters.service_id || ''}`);
      rows.value = page(result);
      totalPages.value = lastPage(result);
    } else {
      const [result, roomResult] = await Promise.all([
        api<any>('/reception/dashboard'),
        api<any>(`/rooms?date=${localDate()}`),
      ]);
      dashboard.value = result.data;
      rooms.value = roomResult.data || [];
    }
  } catch (e: any) {
    error.value = errorText(e);
  } finally {
    loading.value = false;
  }
}

async function loadChoices() {
  if (!auth.can('appointments.manage')) return;
  try {
    const [counselorsResponse, servicesResponse] = await Promise.all([
      auth.request<any>('/counselors?page=1'), api<any>('/services?page=1'),
    ]);
    counselors.value = page(counselorsResponse);
    services.value = page(servicesResponse);
  } catch (e: any) { error.value = errorText(e); }
}

async function mutate(action: () => Promise<void>, message: string) {
  if (busy.value) return;
  busy.value = true; error.value = ''; success.value = '';
  try { await action(); success.value = message; await load(); }
  catch (e: any) { error.value = errorText(e); }
  finally { busy.value = false; }
}

function editRoom(room?: any) {
  Object.assign(form, room ? { id: room.id, name: room.name, location: room.location || '', capacity: Number(room.capacity || 1), is_active: !!room.is_active }
    : { id: null, name: '', location: '', capacity: 1, is_active: true });
  formOpen.value = true;
}

async function saveRoom() {
  await mutate(async () => {
    const { id, ...body } = form;
    await api(`/rooms${id ? `/${id}` : ''}`, { method: id ? 'PATCH' : 'POST', body });
    formOpen.value = false;
  }, 'اطلاعات اتاق ذخیره شد.');
}

async function inspectRoom(room:any){roomDetail.value=room;roomTab.value='calendar';await loadRoomDetail();}
async function loadRoomDetail(){if(!roomDetail.value)return;loading.value=true;error.value='';try{
 if(roomTab.value==='calendar'){const r=await api<any>(`/rooms/${roomDetail.value.id}/calendar?from=${roomRange.from}&to=${roomRange.to}&per_page=100`);roomCalendar.value=page(r);}
 if(roomTab.value==='hours'){const r:any=await api(`/rooms/${roomDetail.value.id}/working-hours`);roomHours.value=r.data||[];}
 if(roomTab.value==='closures'){const r=await api<any>(`/rooms/${roomDetail.value.id}/unavailability`);roomClosures.value=page(r);}
}catch(e:any){error.value=errorText(e);}finally{loading.value=false;}}
async function saveRoomHours(){await mutate(async()=>{await api(`/rooms/${roomDetail.value.id}/working-hours`,{method:'PUT',body:{hours:roomHours.value}});await loadRoomDetail();},'ساعات اتاق ذخیره شد.');}
async function addRoomHour(){roomHours.value.push({weekday:0,opens_at:'09:00',closes_at:'17:00'});}
async function addRoomClosure(){if(!maintenance.starts_at||!maintenance.ends_at)return;await mutate(async()=>{const offset=(s:string)=>`${s}:00+03:30`;await api(`/rooms/${roomDetail.value.id}/unavailability`,{method:'POST',body:{starts_at:offset(maintenance.starts_at),ends_at:offset(maintenance.ends_at),reason:maintenance.reason}});Object.assign(maintenance,{starts_at:'',ends_at:'',reason:''});await loadRoomDetail();},'بازهٔ عدم دسترسی ثبت شد.');}
async function removeRoomClosure(row:any){if(!confirm('بازهٔ تعمیرات حذف شود و اتاق دوباره در دسترس قرار گیرد؟'))return;await mutate(async()=>{await api(`/room-unavailability/${row.id}`,{method:'DELETE'});await loadRoomDetail();},'بازهٔ عدم دسترسی حذف شد.');}
async function deleteRoom(room:any){if(!confirm('اتاق حذف شود؟ در صورت وجود تاریخچه رزرو، backend حذف را رد می‌کند.'))return;await mutate(async()=>{await api(`/rooms/${room.id}`,{method:'DELETE'});},'اتاق حذف شد.');}

async function checkIn(booking: any) {
  await mutate(async () => {
    await api(`/reservations/${booking.id}/check-in`, { method: 'POST' });
  }, 'ورود مراجع ثبت شد.');
}

async function setStatus(booking: any, status: 'in_progress' | 'completed' | 'no_show') {
  const text = status === 'in_progress' ? 'شروع جلسه ثبت شود؟' : status === 'completed' ? 'پایان جلسه ثبت شود؟' : 'عدم حضور ثبت شود؟';
  if (!confirm(text)) return;
  await mutate(async () => {
    await api(`/reservations/${booking.id}/status`, { method: 'PATCH', body: { status } });
  }, 'وضعیت جلسه ثبت شد.');
}

async function assignRoom() {
  if (!selected.value || busy.value) return;
  await mutate(async () => {
    await api(`/reservations/${selected.value.id}/room`, { method: 'PATCH', body: { room_id: roomId.value } });
    selected.value = null;
  }, 'اتاق نوبت به‌روزرسانی شد.');
}

async function assignWaitlist(row: any) {
  if (!confirm('این ورودی با استفاده از زمان انتخاب‌شده به رزرو واقعی تبدیل شود؟')) return;
  await mutate(async () => {
    await api(`/waitlist/${row.id}`, { method: 'PATCH', body: { room_id: roomId.value, payment_option: 'full' } });
  }, 'رزرو در وضعیت انتظار پرداخت ایجاد شد.');
}

const todayRows = computed(() => dashboard.value?.today || []);
watch(() => [section.value, filters.date, filters.status, filters.counselor_id, filters.service_id, pageNumber.value], load);
onMounted(async () => { await loadChoices(); await load(); });
</script>

<template>
  <main dir="rtl" class="admin-page">
    <header class="admin-page__header">
      <div><div class="admin-eyebrow">پذیرش و عملیات روزانه</div><h1>{{ section === 'rooms' ? 'مدیریت اتاق‌ها' : section === 'waitlist' ? 'فهرست انتظار' : 'داشبورد پذیرش' }}</h1><p>اطلاعات زنده از سامانهٔ رزرو مرکز</p></div>
      <div class="d-flex ga-2"><v-btn v-if="section === 'rooms'" color="primary" prepend-icon="mdi-plus" @click="editRoom()">اتاق جدید</v-btn><v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">به‌روزرسانی</v-btn></div>
    </header>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable @click:close="error = ''">{{ error }}</v-alert>
    <v-alert v-if="success" type="success" variant="tonal" class="mb-4" closable @click:close="success = ''">{{ success }}</v-alert>
    <v-progress-linear v-if="loading" indeterminate class="mb-3" />

    <template v-if="section === 'reception'">
      <v-row v-if="dashboard" class="mb-2">
        <v-col v-for="item in [
          { title: 'نوبت‌های امروز', value: todayRows.length },
          { title: 'در انتظار پرداخت', value: dashboard.pending_confirmations?.length || 0 },
          { title: 'لغو امروز', value: dashboard.cancellations_today || 0 },
          { title: 'عدم حضور امروز', value: dashboard.no_shows_today || 0 },
        ]" :key="item.title" cols="12" sm="6" lg="3"><v-card class="pa-5"><div class="text-medium-emphasis">{{ item.title }}</div><strong class="text-h5">{{ Number(item.value).toLocaleString('fa-IR') }}</strong></v-card></v-col>
      </v-row>
      <v-row>
        <v-col cols="12" lg="8"><v-card class="admin-table-card"><div class="admin-table-toolbar"><div><h2>نوبت‌های امروز</h2><p>زمان‌ها بر اساس منطقهٔ تهران نمایش داده می‌شوند.</p></div></div><div class="admin-table-scroll"><v-table><thead><tr><th>زمان / مراجع</th><th>مشاور و خدمت</th><th>اتاق</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>
          <tr v-for="row in todayRows" :key="row.id"><td><strong>{{ dateTime(row.starts_at) }}</strong><div>{{ row.client_name }} · {{ row.client_phone }}</div></td><td>{{ row.counselor_name }}<div>{{ row.service_name }}</div></td><td>{{ row.room_name || 'تعیین نشده' }}</td><td>{{ statusTitle[row.status] || row.status }}</td><td class="text-no-wrap"><v-btn v-if="row.status === 'confirmed'" size="small" color="primary" :disabled="busy" @click="checkIn(row)">پذیرش</v-btn><v-btn v-if="row.status === 'checked_in'" size="small" :disabled="busy" @click="setStatus(row, 'in_progress')">شروع جلسه</v-btn><v-btn v-if="['confirmed','checked_in','in_progress'].includes(row.status)" size="small" color="success" :disabled="busy" @click="setStatus(row, 'completed')">اتمام</v-btn><v-btn v-if="row.status === 'confirmed'" size="small" color="error" variant="text" :disabled="busy" @click="setStatus(row, 'no_show')">عدم حضور</v-btn><v-btn size="small" variant="text" @click="selected = row; roomId = row.room_id || null">اتاق</v-btn></td></tr>
          <tr v-if="!loading && !todayRows.length"><td colspan="5"><div class="admin-empty-state"><v-icon icon="mdi-calendar-blank-outline"/><strong>برای امروز نوبتی وجود ندارد</strong></div></td></tr>
        </tbody></v-table></div></v-card></v-col>
        <v-col cols="12" lg="4"><v-card class="pa-4 mb-4"><h2>اتاق‌های اشغال</h2><v-list><v-list-item v-for="room in dashboard?.occupied_rooms || []" :key="room.id" :title="room.name" :subtitle="`نوبت #${room.booking_id} · پایان ${dateTime(room.ends_at)}`"/><v-list-item v-if="!dashboard?.occupied_rooms?.length" title="اتاق اشغالی گزارش نشده است."/></v-list></v-card><v-card class="pa-4"><h2>مشاوران در دسترس</h2><v-list><v-list-item v-for="c in dashboard?.available_counselors || []" :key="c.id" :title="c.name"/><v-list-item v-if="!dashboard?.available_counselors?.length" title="مشاوری در دسترس گزارش نشده است."/></v-list><v-alert type="info" variant="tonal" density="compact">این فهرست وضعیت لحظه‌ای ساعات کاری را نشان می‌دهد.</v-alert></v-card></v-col>
      </v-row>
      <v-card v-if="dashboard?.upcoming?.length" class="pa-4 mt-4"><h2>نوبت‌های پیش‌رو</h2><v-list><v-list-item v-for="row in dashboard.upcoming" :key="row.id" :title="`${dateTime(row.starts_at)} · ${row.client_name}`" :subtitle="`${row.counselor_name} · ${row.service_name} · ${statusTitle[row.status] || row.status}`"/></v-list></v-card>
    </template>

    <template v-else-if="section === 'rooms'">
      <v-text-field v-model="filters.date" type="date" label="تاریخ برنامه (تهران)" class="mb-3" style="max-width: 280px" />
      <v-card class="admin-table-card"><div class="admin-table-scroll"><v-table><thead><tr><th>اتاق</th><th>موقعیت</th><th>ظرفیت</th><th>رزروهای روز</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody><tr v-for="room in rooms" :key="room.id"><td>{{ room.name }}</td><td>{{ room.location || '—' }}</td><td>{{ room.capacity }}</td><td>{{ room.appointments_count }}</td><td>{{ room.is_active ? 'فعال' : 'غیرفعال' }}</td><td class="text-no-wrap"><v-btn size="small" @click="inspectRoom(room)">برنامه اتاق</v-btn><v-btn size="small" @click="editRoom(room)">ویرایش</v-btn><v-btn size="small" color="error" variant="text" @click="deleteRoom(room)">حذف</v-btn></td></tr><tr v-if="!loading && !rooms.length"><td colspan="6"><div class="admin-empty-state">اتاقی ثبت نشده است.</div></td></tr></tbody></v-table></div></v-card>
    </template>

    <template v-else>
      <v-row><v-col cols="12" md="3"><v-select v-model="filters.status" :items="[{title:'فعال و اطلاع‌رسانی‌شده',value:'active'},{title:'اطلاع‌رسانی‌شده',value:'notified'},{title:'تبدیل‌شده',value:'assigned'},{title:'لغوشده',value:'cancelled'}]" item-title="title" item-value="value" label="وضعیت"/></v-col><v-col cols="12" md="3"><v-select v-model="filters.counselor_id" :items="counselors" item-title="name" item-value="id" label="مشاور" clearable/></v-col><v-col cols="12" md="3"><v-select v-model="filters.service_id" :items="services" item-title="title" item-value="id" label="خدمت" clearable/></v-col></v-row>
      <v-card class="admin-table-card"><div class="admin-table-scroll"><v-table><thead><tr><th>مراجع</th><th>زمان درخواستی</th><th>مشاور و خدمت</th><th>وضعیت</th><th>رزرو ایجادشده</th><th></th></tr></thead><tbody><tr v-for="row in rows" :key="row.id"><td>{{ row.client_name }}<div>{{ row.client_phone }}</div></td><td>{{ dateTime(row.starts_at) }}</td><td>{{ row.counselor_name }}<div>{{ row.service_name }}</div></td><td>{{ statusTitle[row.status] || row.status }}</td><td>{{ row.assigned_booking_id ? `#${row.assigned_booking_id} · ${statusTitle[row.booking_status] || row.booking_status}` : '—' }}</td><td><v-btn v-if="['active','notified'].includes(row.status)" color="primary" size="small" :disabled="busy" @click="assignWaitlist(row)">ایجاد رزرو</v-btn></td></tr><tr v-if="!loading && !rows.length"><td colspan="6"><div class="admin-empty-state">موردی در فهرست انتظار نیست.</div></td></tr></tbody></v-table></div><div v-if="totalPages > 1" class="admin-table-pagination"><v-btn :disabled="pageNumber <= 1" @click="pageNumber--">قبلی</v-btn><span>صفحهٔ {{ pageNumber }} از {{ totalPages }}</span><v-btn :disabled="pageNumber >= totalPages" @click="pageNumber++">بعدی</v-btn></div></v-card>
    </template>

    <v-dialog v-model="formOpen" max-width="600"><v-card class="pa-5" dir="rtl"><h2>{{ form.id ? 'ویرایش اتاق' : 'افزودن اتاق' }}</h2><v-text-field v-model="form.name" label="نام اتاق" maxlength="120"/><v-text-field v-model="form.location" label="موقعیت"/><v-text-field v-model.number="form.capacity" type="number" min="1" max="100" label="ظرفیت"/><v-switch v-model="form.is_active" label="فعال"/><v-btn color="primary" :loading="busy" :disabled="!form.name.trim()" @click="saveRoom">ذخیره</v-btn></v-card></v-dialog>
    <v-dialog :model-value="!!roomDetail" max-width="1000" scrollable @update:model-value="v=>{if(!v)roomDetail=null}"><v-card v-if="roomDetail" class="pa-5" dir="rtl"><div class="d-flex justify-space-between align-center"><h2>مدیریت اتاق · {{roomDetail.name}}</h2><v-btn icon="mdi-close" variant="text" aria-label="بستن" @click="roomDetail=null"/></div><v-tabs v-model="roomTab" @update:model-value="loadRoomDetail"><v-tab value="calendar">تقویم</v-tab><v-tab value="hours">ساعات هفتگی</v-tab><v-tab value="closures">تعمیرات و انسداد</v-tab></v-tabs><v-progress-linear v-if="loading" indeterminate/><template v-if="roomTab==='calendar'"><v-row class="mt-2"><v-col cols="12" md="6"><v-text-field v-model="roomRange.from" type="date" label="از تاریخ"/></v-col><v-col cols="12" md="6"><v-text-field v-model="roomRange.to" type="date" label="تا تاریخ"/></v-col></v-row><v-btn class="mb-3" :disabled="!roomRange.from||!roomRange.to" @click="loadRoomDetail">نمایش برنامه</v-btn><v-table><thead><tr><th>نوبت</th><th>زمان</th><th>مراجع</th><th>مشاور/خدمت</th><th>وضعیت</th></tr></thead><tbody><tr v-for="item in roomCalendar" :key="item.booking_id"><td>#{{item.booking_id}}</td><td>{{dateTime(item.starts_at)}} – {{dateTime(item.ends_at)}}</td><td>{{item.client_name}}</td><td>{{item.counselor_name}} · {{item.service_name}}</td><td>{{statusTitle[item.status]||item.status}}</td></tr><tr v-if="!roomCalendar.length"><td colspan="5">رزروی برای این بازه ثبت نشده است.</td></tr></tbody></v-table></template><template v-else-if="roomTab==='hours'"><v-alert type="info" variant="tonal" class="my-3">ذخیرهٔ ساعات جدید ممکن است به‌دلیل رزروهای فعال آینده با خطای تعارض رد شود.</v-alert><v-row v-for="(hour,i) in roomHours" :key="i" align="center"><v-col cols="12" md="4"><v-select v-model="hour.weekday" :items="weekdays.map((title,value)=>({title,value}))" label="روز هفته"/></v-col><v-col cols="5" md="3"><v-text-field v-model="hour.opens_at" type="time" label="شروع"/></v-col><v-col cols="5" md="3"><v-text-field v-model="hour.closes_at" type="time" label="پایان"/></v-col><v-col cols="2" md="2"><v-btn icon="mdi-delete" variant="text" color="error" aria-label="حذف بازه" @click="roomHours.splice(i,1)"/></v-col></v-row><v-btn variant="tonal" @click="addRoomHour">افزودن بازه</v-btn><v-btn color="primary" class="mr-2" :disabled="busy" @click="saveRoomHours">ذخیره ساعات هفتگی</v-btn></template><template v-else><v-row class="mt-2"><v-col cols="12" md="4"><v-text-field v-model="maintenance.starts_at" type="datetime-local" label="شروع به وقت تهران"/></v-col><v-col cols="12" md="4"><v-text-field v-model="maintenance.ends_at" type="datetime-local" label="پایان به وقت تهران"/></v-col><v-col cols="12" md="4"><v-text-field v-model="maintenance.reason" label="علت"/></v-col></v-row><v-btn color="primary" class="mb-3" :disabled="busy||!maintenance.starts_at||!maintenance.ends_at" @click="addRoomClosure">ثبت انسداد</v-btn><v-table><thead><tr><th>شروع</th><th>پایان</th><th>علت</th><th></th></tr></thead><tbody><tr v-for="item in roomClosures" :key="item.id"><td>{{dateTime(item.starts_at)}}</td><td>{{dateTime(item.ends_at)}}</td><td>{{item.reason||'—'}}</td><td><v-btn color="error" size="small" @click="removeRoomClosure(item)">حذف انسداد</v-btn></td></tr><tr v-if="!roomClosures.length"><td colspan="4">انسدادی وجود ندارد.</td></tr></tbody></v-table></template></v-card></v-dialog>
    <v-dialog :model-value="!!selected" max-width="500" @update:model-value="v => { if (!v) selected = null }"><v-card class="pa-5" dir="rtl"><h2>تخصیص اتاق · نوبت #{{ selected?.id }}</h2><v-select v-model="roomId" :items="rooms.filter(room => room.is_active)" item-title="name" item-value="id" label="اتاق فعال" clearable/><v-alert type="info" variant="tonal">در صورت تداخل بازه، سرور خطای ۴۰۹ می‌دهد و اتاق تغییر نمی‌کند.</v-alert><v-btn color="primary" :loading="busy" @click="assignRoom">ثبت اتاق</v-btn></v-card></v-dialog>
  </main>
</template>
