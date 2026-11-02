<script setup lang="ts">
const {request}=useAdminApi();
const rows=ref<any[]>([]),error=ref(''),success=ref(''),busy=ref(false),dialog=ref(false),file=ref<File|null>(null),page=ref(1),lastPage=ref(1);
const editId=ref<number|null>(null);
const form=reactive({title:'',slug:'',body:'',image:'',is_active:true});
async function load(){error.value='';try{const r:any=await request(`/admin/content/gallery?page=${page.value}`);rows.value=r.data||[];lastPage.value=r.last_page||r.meta?.last_page||1;}catch(e:any){error.value=e?.data?.message||'خطا در دریافت گالری';}}
onMounted(load);
function add(){editId.value=null;Object.assign(form,{title:'',slug:'',body:'',image:'',is_active:true});file.value=null;dialog.value=true;}
function edit(r:any){editId.value=r.id;Object.assign(form,{title:r.title,slug:r.slug,body:r.body||'',image:r.image||'',is_active:!!r.is_active});file.value=null;dialog.value=true;}
function imageUrl(path:string){if(!path)return '';if(/^https?:\/\//.test(path))return path;const base=String(useRuntimeConfig().public.apiBase).replace(/\/api\/?$/,'');return `${base}/storage/${path.replace(/^\/storage\//,'')}`;}
async function save(){busy.value=true;error.value='';success.value='';try{
 if(file.value){const fd=new FormData();fd.append('image',file.value);const uploaded:any=await request('/admin/gallery/upload',{method:'POST',body:fd});form.image=uploaded.path;}
 await request(`/admin/content/gallery${editId.value?'/'+editId.value:''}`,{method:editId.value?'PUT':'POST',body:{...form}});
 dialog.value=false;success.value='ذخیره شد';await load();
 }catch(e:any){error.value=JSON.stringify(e?.data?.errors||e?.data?.message||'خطای ذخیره');}finally{busy.value=false;}}
async function remove(r:any){if(!confirm(`آیتم «${r.title}» حذف شود؟`))return;try{await request(`/admin/content/gallery/${r.id}`,{method:'DELETE'});if(rows.value.length===1&&page.value>1)page.value--;await load();}catch(e:any){error.value=e?.data?.message||'خطا در حذف';}}
async function go(n:number){if(n<1||n>lastPage.value)return;page.value=n;await load();}
</script>
<template><div dir="rtl"><div class="d-flex justify-space-between align-center mb-5"><h2>مدیریت گالری</h2><v-btn color="primary" @click="add">افزودن تصویر</v-btn></div>
<v-alert v-if="error" type="error" class="mb-3">{{error}}</v-alert><v-alert v-if="success" type="success" class="mb-3">{{success}}</v-alert>
<v-table><thead><tr><th>تصویر</th><th>عنوان</th><th>اسلاگ</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody><tr v-for="r in rows" :key="r.id"><td><v-img v-if="r.image" :src="imageUrl(r.image)" width="90" height="65" cover/></td><td>{{r.title}}</td><td>{{r.slug}}</td><td>{{r.is_active?'منتشرشده':'پیش‌نویس'}}</td><td><v-btn size="small" @click="edit(r)">ویرایش</v-btn> <v-btn size="small" color="error" @click="remove(r)">حذف</v-btn></td></tr><tr v-if="!rows.length"><td colspan="5">هنوز تصویری ثبت نشده است.</td></tr></tbody></v-table>
<div class="d-flex align-center ga-3 mt-4"><v-btn :disabled="page<=1" @click="go(page-1)">قبلی</v-btn><span>صفحه {{page}} از {{lastPage}}</span><v-btn :disabled="page>=lastPage" @click="go(page+1)">بعدی</v-btn></div>
<v-dialog v-model="dialog" max-width="650"><v-card class="pa-6" dir="rtl"><h3 class="mb-4">{{editId?'ویرایش تصویر':'افزودن تصویر'}}</h3>
<v-text-field v-model="form.title" label="عنوان"/><v-text-field v-model="form.slug" label="اسلاگ انگلیسی"/><v-textarea v-model="form.body" label="توضیح تصویر" rows="3"/>
<v-file-input label="انتخاب تصویر (حداکثر ۵ مگابایت)" accept="image/png,image/jpeg,image/webp,image/gif" @update:model-value="(v:any)=>file=Array.isArray(v)?v[0]:v"/>
<v-img v-if="form.image" :src="imageUrl(form.image)" max-height="170" contain class="mb-3"/>
<v-text-field v-model="form.image" label="مسیر تصویر (اختیاری، برای تصاویر موجود)"/><v-switch v-model="form.is_active" label="انتشار"/>
<div class="d-flex ga-3"><v-btn color="primary" :loading="busy" @click="save">ذخیره</v-btn><v-btn @click="dialog=false">انصراف</v-btn></div></v-card></v-dialog></div></template>
