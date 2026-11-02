# پیگیری تکمیل پنل

آخرین بروزرسانی: 2026-10-14. وضعیت اجرا از وضعیت پیاده‌سازی جداست. `IMPLEMENTED` فقط به معنی اتصال UI به قرارداد API موجود است؛ build یا backend test به معنی آزمون end-to-end نیست.

| ماژول | پیاده‌سازی | راستی‌آزمایی | مانده اصلی |
|---|---|---|---|
| احراز هویت admin/session | PARTIAL | STATIC_CHECKED | تست ورود/نشست/401/403 در browser backend ایزوله |
| Dashboard مدیریت | PARTIAL | STATIC_CHECKED | تطبیق metrics با runtime و UX E2E |
| Reception dashboard/actions | PARTIAL | STATIC_CHECKED | runtime workflows و نقش reception |
| Booking list/detail/reschedule/cancel | PARTIAL | STATIC_CHECKED | E2E نوشتنی با DB مجزا |
| Calendar | PARTIAL | STATIC_CHECKED | مرورگر desktop/mobile و timezone |
| Room CRUD/calendar/hours/closures | IMPLEMENTED | STATIC_CHECKED | MySQL conflict، تست action و mobile |
| Waiting list | PARTIAL | STATIC_CHECKED | ثبت offer/notify lifecycle و E2E؛ فقط conversion موجود وصل است |
| Client list/clinical CRM | PARTIAL | STATIC_CHECKED | role privacy، upload/download و فرم‌ها در E2E |
| Intake/forms/consents | PARTIAL | STATIC_CHECKED | answer history، validation و permission scenario |
| Counselor sessions/notes/history | IMPLEMENTED | STATIC_CHECKED | مالکیت counselor و immutability در E2E |
| User/role/permission admin | IMPLEMENTED | STATIC_CHECKED | Super Admin workflow و session invalidation در E2E |
| Counselor/services management | PARTIAL | STATIC_CHECKED | فیلدها/association و تعارض 409 در runtime |
| Finance/payments/refunds/settlements | PARTIAL | STATIC_CHECKED | DB isolation و ledger validation |
| Payment gateways | PARTIAL | STATIC_CHECKED | فقط Fake Bank local/testing؛ provider واقعی BLOCKED_EXTERNAL |
| SMS reminders | IMPLEMENTED | STATIC_CHECKED | queue scheduler و delivery فقط در پیکربندی ایزوله؛ پیام واقعی BLOCKED_EXTERNAL |
| Notification inbox | IMPLEMENTED | STATIC_CHECKED | permission-specific inbox/runtime |
| Email templates/delivery retry | PARTIAL | STATIC_CHECKED | queue/provider delivery confirmation |
| Reports/eight XLSX | IMPLEMENTED | STATIC_CHECKED | فایل‌ها/فیلترها/MIME در runtime و داده حجیم |
| CMS content/media | PARTIAL | STATIC_CHECKED | draft preview endpoint BLOCKED_BACKEND؛ editor E2E |
| Structured settings | PARTIAL | STATIC_CHECKED | backend conflict edge cases/runtime |
| Persian RTL/Jalali/responsive/a11y | PARTIAL | STATIC_CHECKED | visual/manual browser verification |
| Automated test dependencies | BLOCKED_EXTERNAL | NOT_TESTED | نصب package با registry/cache قابل دسترس |
| Browser/MySQL integration | BLOCKED_EXTERNAL | NOT_TESTED | Playwright browser و DB ایزوله/port آزاد |

## معنی وضعیت‌ها

- پیاده‌سازی: `IMPLEMENTED`, `PARTIAL`, `BLOCKED_BACKEND`, `BLOCKED_EXTERNAL`, `NOT_STARTED`.
- تست: `NOT_TESTED`, `STATIC_CHECKED`, `UNIT_TESTED`, `E2E_TESTED`.
- هر دو ستون مستقل‌اند؛ `STATIC_CHECKED` به‌تنهایی feature completion یا production readiness نیست.
