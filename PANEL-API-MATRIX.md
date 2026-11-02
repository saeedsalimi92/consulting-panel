# ماتریس نهایی API و پنل

تاریخ تطبیق: ۱۴۰۵/۰۷/۲۳. قرارداد با `routes/api.php`، FormRequest/validator و controller/resourceهای backend خوانده شد؛ OpenAPI برای کشف مسیرها استفاده شد ولی کد Laravel منبع نهایی است. مسیرهای زیر بعد از `/api` نوشته شده‌اند. `STATIC_CHECKED` صرفاً به معنی typecheck/build است و ادعای اجرای runtime API نیست. هیچ request یا mutation به 8010 در این نوبت انجام نشد.

| قابلیت | Endpoint واقعی backend | صفحه/کامپوننت | پیاده‌سازی | راستی‌آزمایی | محدودیت / باگ باز |
|---|---|---|---|---|---|
| ورود، me، خروج | `POST /admin/login`, `GET /admin/me`, `POST /admin/logout` | `/auth/login`, middleware | PARTIAL | STATIC_CHECKED | Bearer token در localStorage؛ runtime/auth E2E نیازمند backend تست ایزوله |
| نشست، تغییر رمز، خروج همه دستگاه‌ها | `GET /session`, `PUT /password`, `POST /logout-all` | منوی حساب در layout | IMPLEMENTED | STATIC_CHECKED | تغییر رمز نشست‌ها را باطل می‌کند؛ نیازمند ورود مجدد |
| داشبورد مدیریت | `GET /admin/dashboard` | `/` | PARTIAL | STATIC_CHECKED | مرورگر و payload runtime در این نوبت verify نشد |
| پذیرش روزانه و صف نوبت | `GET /admin/booking/reception/dashboard`, `GET /admin/booking/rooms?date=` | `/booking/reception` | PARTIAL | STATIC_CHECKED | API به‌صورت runtime آزمایش نشد |
| عملیات چرخه جلسه | `POST /admin/booking/reservations/{id}/check-in`, `PATCH .../{id}/status` | `/booking/reception`, booking detail | IMPLEMENTED | STATIC_CHECKED | انتقال وضعیت را server تعیین می‌کند؛ E2E نوشتنی باقی است |
| تقویم اتاق | `GET /admin/booking/rooms/{room}/calendar?from=&to=` | `/booking/rooms` > برنامه اتاق | IMPLEMENTED | STATIC_CHECKED | بازه حداکثر ۳۶۶ روز؛ دادهٔ مراجع محدود به مجاز backend |
| ساعات هفتگی و تعمیر اتاق | `GET/PUT /admin/booking/rooms/{room}/working-hours`, `GET/POST /admin/booking/rooms/{room}/unavailability`, `DELETE /admin/booking/room-unavailability/{window}` | `/booking/rooms` > ساعات/انسداد | IMPLEMENTED | STATIC_CHECKED | خطای تعارض رزرو از سرور نمایش داده می‌شود |
| CRUD اتاق | `GET/POST/PATCH/DELETE /admin/booking/rooms[/{room}]` | `/booking/rooms` | IMPLEMENTED | STATIC_CHECKED | حذف تاریخچه‌دار با 409 رد می‌شود |
| رزرو، جست‌وجو، لغو/جابجایی | `GET/POST /admin/booking/reservations`, `GET .../{id}`, `PATCH .../{id}/reschedule`, `POST .../{id}/cancel` | `/booking/appointments`, `/booking/calendar` | PARTIAL | STATIC_CHECKED | مرورگر/DB integration اجرا نشد |
| صف انتظار و تبدیل | `GET/PATCH /admin/booking/waitlist` | `/booking/waitlist` | PARTIAL | STATIC_CHECKED | تبدیل یک رزرو `held` می‌سازد؛ موفقیت پیام‌رسانی تضمین نمی‌شود |
| پرونده بالینی admin | `/admin/booking/clinical/clients/{client}[, /intake-answers, /consents, /follow-ups, /attachments]`; `GET /admin/booking/clinical/attachments/{id}` | `/booking/clinical` | PARTIAL | STATIC_CHECKED | E2E سطح دسترسی/فایل خصوصی باقی است |
| فرم‌های intake | `GET/POST /admin/booking/clinical/forms`, `POST .../forms/{form}/versions` | `/booking/forms` | PARTIAL | STATIC_CHECKED | archive/deactivate API ندارد؛ نسخهٔ موجود immutable در نظر گرفته شود |
| note مشاور و تاریخچه نسخه | `GET/POST /counselor/appointments/{booking}/notes`, `PATCH /counselor/session-notes/{note}`, `GET .../versions[/{version}]` | `/counselor` | IMPLEMENTED | STATIC_CHECKED | نسخه نهایی immutable؛ آزمون scope در UI/E2E باقی است |
| پرونده اختصاص‌یافتهٔ مشاور | `/counselor/clients/{client}/clinical-record`, `/intake-answers`, `/consents`, `/follow-ups`, `/attachments` | `/counselor` > مراجعان | PARTIAL | STATIC_CHECKED | کنترل دسترسی قطعی با backend؛ E2E نقش‌ها باقی است |
| کاربران و نقش‌ها | `/admin/users`, `/admin/roles`, `/admin/permissions`, `/admin/users/{user}/roles` | `/manage/users`, `/booking/roles` | PARTIAL | STATIC_CHECKED | مدیریت کاربران/نقش‌ها در UI نیازمند Super Admin؛ حذف نقش سیستمی با 409 |
| audit log | `GET /admin/audit-log` | `/booking/audit-log` | IMPLEMENTED | STATIC_CHECKED | فقط مرور؛ آزمون integration باقی است |
| مشاور/خدمات/شیفت | `/admin/counselors`, `/admin/booking/services`, `/admin/booking/counselors/{id}/shifts`, `.../time-off` | `/manage/counselors`, `/booking/services`, `/booking/schedule` | PARTIAL | STATIC_CHECKED | قراردادهای تجاری/نرخ اختصاصی با داده زنده verify نشد |
| مالی، پرداخت، refund، settlement | `/admin/booking/finance/dashboard`, `/payments`, `/refunds`, `/settlements`, `/reconciliation`, `/reports`, routeهای refund/settlement در controller | `/booking/finance`, `/booking/refunds`, جزئیات رزرو | PARTIAL | STATIC_CHECKED | هیچ mutation مالی در runtime اجرا نشد |
| promo code | `/admin/booking/promo-codes` و mutationهای POST/PATCH | `/booking/promos`, رزرو جدید | PARTIAL | STATIC_CHECKED | E2E رزرو واقعی با تخفیف لازم است |
| درگاه پرداخت | `GET/PUT /admin/booking/gateways` | `/booking/payment-settings` | PARTIAL | STATIC_CHECKED | UI فقط Fake Bank محلی/تستی را می‌شناسد؛ Zarinpal/SnappPay fail-closed |
| سیاست رزرو | `GET/PUT /admin/booking/policy` | `/booking/booking-settings` | IMPLEMENTED | STATIC_CHECKED | مجوز `finance.manage` و تعارض سرور |
| پیامک یادآوری | `/admin/settings/sms-reminders/rules`, `/scheduled`, `/history`, `/attempts`, `/{id}/retry`, `/{id}/cancel`, `.../preview` | `/booking/sms-reminders` | IMPLEMENTED | STATIC_CHECKED | پیام واقعی غیرفعال؛ scheduler/queue باید در deployment پیکربندی شوند |
| وضعیت driver پیامک | `GET/PUT /admin/settings/sms` | `/booking/sms-reminders` | IMPLEMENTED | STATIC_CHECKED | فقط `log` و `fake` در local/testing؛ تنظیم provider واقعی وجود ندارد |
| inbox ادمین | `GET /admin/notifications`, `GET .../{id}`, `POST .../{id}/read`, `POST /admin/notifications/read-all` | `/booking/admin-inbox` | IMPLEMENTED | STATIC_CHECKED | فهرست بر اساس permissionهای کاربر سرور فیلتر می‌شود |
| delivery logs و قالب ایمیل | `/admin/booking/notifications`, `/notification-templates`, `/{notice}/retry` | `/booking/notifications` | PARTIAL | STATIC_CHECKED | retry فقط ایمیل failed؛ پیام در صف معادل تحویل نیست |
| هشت خروجی XLSX | `GET /admin/booking/exports/{bookings\|payments\|refunds\|settlements\|counselor-earnings\|reception-performance\|room-utilization\|capacity}.xlsx` | `/booking/exports` | IMPLEMENTED | STATIC_CHECKED | پاسخ binary واقعی backend؛ MIME بررسی می‌شود؛ dataset runtime هنوز تست نشده |
| CSV مالی موجود | `GET /admin/booking/reports/export`, `/payments/export` | `/booking/finance` (اگر خروجی CSV در UI موجود باشد) | PARTIAL | STATIC_CHECKED | XLSX به‌صورت جدا به هشت route وصل شد |
| CMS CRUD و انتشار زمان‌دار | `GET/POST /admin/content/{type}`, `PUT/DELETE .../{entry}`؛ typeهای مجاز شامل `banners`, `homepage_sections` | `/content/{type}` | PARTIAL | STATIC_CHECKED | endpoint preview مستقل وجود ندارد؛ فیلدهای محتوایی مختص محصول در `extra` منعطف‌اند |
| CMS رسانه | `POST /admin/gallery/upload`, `GET /admin/content-media`, `GET .../{id}/preview`, `DELETE .../{id}` | `/content/*`, `/booking/content-media` | IMPLEMENTED | STATIC_CHECKED | حذف فایل ارجاع‌شده 409؛ E2E مجوز فایل باقی است |
| تنظیمات مرکز/ساعات/تعطیلی/SEO | `/admin/settings/center-profile`, `/working-hours`, `/holidays`, `/seo`, `/admin/settings` | `/manage/settings` | PARTIAL | STATIC_CHECKED | ساعات برای هر روز جدا ذخیره می‌شود؛ mutation تعارض‌دار توسط server رد می‌شود |
| ظرفیت و عملکرد عملیاتی | `/admin/booking/reports/operational`, XLSX `capacity`, `reception-performance`, `room-utilization` | `/booking/exports`, پذیرش | PARTIAL | STATIC_CHECKED | capacity تجمیعی تقریبی با slotهای ۱۵ دقیقه است؛ تضمین slot آزاد نیست |

## وضعیت QA

در این نوبت `npm run typecheck` و `npm run build` پس از تغییرات موفق شدند. Unit/backend tests و runtime E2E از build استنتاج نشده‌اند؛ وضعیت دقیق در `PANEL-QA-REPORT.md` و موارد باقی‌مانده در `PANEL-REMAINING-TESTS.md` است.
