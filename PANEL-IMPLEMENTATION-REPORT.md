# گزارش پیاده‌سازی پنل مدیریت، پذیرش و مشاور

آخرین بروزرسانی: 2026-10-14. فقط مخزن `/home/saeed/admin-modernize` تغییر کرده است؛ backend و وب‌سایت عمومی read-only مانده‌اند. هیچ request یا mutation به API اصلی 8010 و هیچ دیتابیسی انجام نشد.

## ممیزی فنی

- Nuxt 3.16.2، Vue 3.5.13 و Vuetify 3.7.18؛ برنامه SPA با `ssr:false`.
- معماری موجود حفظ شده: `useAdminApi`، `useBooking`، `useCounselorAuth` و middleware سراسری. client API جدید یا store موازی ساخته نشد.
- مجوزها از backend `admin/me` و role permissions مصرف می‌شوند؛ نام roleها/permissionهای قابل تخصیص از endpoint واقعی `/admin/roles` و `/admin/permissions` گرفته می‌شوند. backend منبع نهایی authorization است.
- قالب فارسی RTL، Vuetify، نمایش Jalali/Tehran در تقویم‌ها و فرمت مالی موجود حفظ شد.

## تغییرات واقعی این مرحله

1. **یادآوری SMS:** صفحه `/booking/sms-reminders` برای ruleهای relative/fixed-local، مخاطب، حالت جلسه، قالب، quiet hours، محدودیت تلاش، فعال‌سازی/حذف، preview، scheduled/history، attempt detail، retry و cancel. وضعیت driver از `/admin/settings/sms` می‌آید؛ فقط log/fake طبق runtime backend، بدون ادعای پیام واقعی.
2. **XLSX:** دکمهٔ دریافت برای هر ۸ نوع واقعی backend در `/booking/exports`. فیلتر تاریخ تهران، counselor/service/status؛ binary/MIME و خطای HTTP بررسی می‌شود. XLSX از ردیف‌های ناقص مرورگر ساخته نمی‌شود.
3. **Inbox مدیر:** فهرست، unread filter/count، detail، mark-read و read-all روی admin notification APIs.
4. **Role/access management:** فهرست/ویرایش/ایجاد نقش و permissionهای مجاز backend؛ تخصیص نقش به user در `/manage/users`; backend باطل شدن tokenهای کاربر را مشخص می‌کند. audit log نیز صفحه دارد.
5. **CMS:** نوع‌های مجاز جدید banners/homepage sections در پنل؛ فیلدهای واقعی SEO، scheduled publish، status، sort order، category؛ upload از `/admin/gallery/upload`؛ رسانه‌های خصوصی با preview دانلودشده و Authorization header و حذف امن 409.
6. **اتاق‌ها:** تقویم بازه‌ای، ساعات هفتگی، تعمیر/انسداد و حذف امن بر پایه routeهای جدید؛ تعارض backend نمایش داده می‌شود.
7. **مشاور:** خواندن فهرست و محتوای نسخه‌های note از مسیر counselor؛ note نهایی همچنان immutable است.
8. **Settings:** پروفایل مرکز، ساعات هفتگی، تعطیلات، SEO، generic settings؛ سیاست رزرو و پنجره انتشار لینک؛ صفحه وضعیت درگاه که فقط Fake Bank تستی را قابل تنظیم می‌داند.
9. **حساب/نشست:** مشاهدهٔ نشست جاری، تغییر رمز، خروج از همه نشست‌ها در منوی حساب. توکن پس از تغییر رمز پاک و کاربر به ورود هدایت می‌شود.

## ماژول‌ها

| ماژول | وضعیت | توضیح |
|---|---|---|
| احراز ادمین/نقش | PARTIAL | ورود/me/logout و guard موجود؛ change password/logout all اضافه؛ runtime/test role flows اجرا نشده |
| Admin dashboard | PARTIAL | داده‌های موجود از API؛ runtime و همه KPIهای درخواستی verify نشده |
| Reception/booking/calendar | PARTIAL | API و UI چرخه اصلی موجود؛ browser workflow و runtime هنوز لازم است |
| Rooms | IMPLEMENTED | CRUD، برنامه، ساعات، maintenance/closure، conflict و حذف API-integrated؛ E2E مانده |
| Waiting list | PARTIAL | مشاهده و تبدیل به رزرو held؛ notify delivery و حذف مستقل در قرارداد فعلی کامل نیست |
| Clinical CRM/forms | PARTIAL | record/forms/consent/follow-up/private files موجود؛ مرورگر/permission/E2E مانده، archive فرم API ندارد |
| Counselor workspace | PARTIAL | appointments, private records, note lifecycle, version history, follow-up, files, finance; runtime scope verification مانده |
| Users/Roles | IMPLEMENTED | role CRUD/permissions/user assignment و user screens؛ backend Super Admin guard و E2E مانده |
| Finance | PARTIAL | payment/refund/promo/settlement endpoints UI دارد؛ integration و ledger reconciliation runtime نمانده |
| Gateway settings | PARTIAL | وضعیت همه providerها؛ Fake Bank فقط local/test قابل تنظیم؛ real providers external-blocked |
| SMS reminders | IMPLEMENTED | rule/config/scheduled/history/attempts UI به API وصل؛ ارسال provider واقعی external-blocked |
| Admin inbox | IMPLEMENTED | inbox detail/read-state با API واقعی؛ runtime فقط verify نشده |
| Notification delivery/templates | PARTIAL | email template/log/retry؛ retry صرفاً صف و delivery خارجی verify نشده |
| Reports/XLSX | IMPLEMENTED | ۸ endpoint server-generated متصل؛ فایل حجیم و runtime download نیازمند QA |
| CMS/media | PARTIAL | CRUD/SEO/publish/upload/library/delete/preview؛ preview draft route backend ندارد و E2E مانده |
| Settings | PARTIAL | profile/hours/holidays/SEO/policy/gateway/SMS؛ config حساس/provider واقعی عمداً unavailable |
| RTL/responsive/accessibility | PARTIAL | RTL و responsive موجود؛ QA بصری موبایل/tablet/keyboard اجرا نشده |

## مواردی که هنوز توسعه را محدود می‌کنند

- هیچ runtime MySQL یا E2E write session ایزوله در دسترس/اجرا نشده؛ بنابراین هیچ ماژول integration-tested یا production-ready نیست.
- registry/npm cache در این workspace ابزار test جدید را تأمین نکرد؛ `vitest` برای اجرای محلی در `node_modules/.bin` موجود نیست.
- SMS واقعی، Zarinpal و SnappPay تا provider/قرارداد رسمی غیرفعال‌اند.
- preview خصوصی draft CMS endpoint ندارد؛ ظرفیت backend تجمیعی و تقریبی است.
- وضعیت bug login/booking روی 8010: `OPEN`، بدون درخواست در این مرحله.

گزارش route به feature در `PANEL-API-MATRIX.md`، شکاف‌های واقعی backend در `PANEL-API-GAPS.md` و برنامهٔ QA در `PANEL-REMAINING-TESTS.md` است.
