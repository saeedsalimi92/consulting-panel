# گزارش توسعهٔ پنل — مرحلهٔ اتصال APIهای جدید

تاریخ: 2026-10-14.

## نتیجه

مواردی از APIهای تازهٔ backend که پیش‌تر در UI absent بودند اکنون پیاده‌سازی شده‌اند: SMS reminder rules/history/provider state، ۸ XLSX exports، inbox و read state مدیر، role/permission management و user assignment، audit log، room calendar/hours/maintenance/deletion، history نسخه یادداشت مشاور، CMS media/SEO/scheduling، تنظیمات ساعات/تعطیلات و سیاست رزرو، gateway state و account security.

این نتیجه به معنی feature-complete بودن کل پنل نیست. ماژول‌های متعدد از مرحلهٔ static integration عبور نکرده‌اند و runtime/browser QA همچنان یک مرحلهٔ لازم است. جزئیات endpoint/صفحه/وضعیت در `PANEL-API-MATRIX.md` و tracker در `PANEL-COMPLETION-TRACKER.md` ثبت شده است.

## نقش‌ها و امنیت

- UI از permissionهای backend استفاده می‌کند. `/booking/roles` و `/manage/users` برای Super Admin طراحی شده‌اند؛ server 403/validation را مرجع نهایی نگه می‌دارد.
- inbox مدیریت بر اساس permissionهای role در backend فیلتر می‌شود.
- پیش‌نمایش فایل CMS با Bearer token fetch می‌شود و URL احرازنشده داخل `<img>` قرار نمی‌گیرد.
- clinical privacy در مرورگر و نقش‌ها هنوز باید با E2E مرور شود؛ به دلیل نبود DB/runtime تستی هیچ ادعای قطعی امنیتی از این build نمی‌شود.

## پرداخت، پیامک و خروجی‌ها

- فقط Fake Bank در محیط local/testing backend قابل تنظیم است؛ Zarinpal و SnappPay fail-closed و `BLOCKED_EXTERNAL` می‌مانند.
- SMS UI امکان rule، quiet hours، preview، scheduled/history، تلاش‌ها و retry/cancel را دارد. Provider واقعی وجود ندارد؛ log/fake موفقیت پیام واقعی محسوب نمی‌شود.
- XLSXها از سرور و هشت route تعریف‌شده دریافت می‌شوند. عملکرد روی MySQL واقعی و داده بزرگ هنوز تست نشده.

## CMS و تنظیمات

- CMS از endpointهای واقعی استفاده می‌کند؛ scheduled publish و SEO fields از resource موجود، upload از مسیر مجاز و media library از مسیر private استفاده می‌کند.
- route اختصاصی draft preview وجود ندارد و `BLOCKED_BACKEND` باقی می‌ماند.
- تنظیمات structured مرکز، ساعات، تعطیلات، SEO، policy و gateway نمایش داده می‌شوند. عملیات تعارض‌دار به backend سپرده می‌شود.

## اعتبارسنجی

- `npm run typecheck`: PASS.
- `npm run build`: PASS؛ هشدار Browserslist قدیمی و chunk client حدود 4.65MB minified.
- `npm run test:unit`: BLOCKED، `vitest` در workspace نصب نیست.
- MySQL integration / Playwright: در این نوبت اجرا نشده‌اند؛ جزئیات و blocker در `PANEL-QA-REPORT.md` و مراحل لازم در `PANEL-REMAINING-TESTS.md` آمده.
- API 8010، دیتابیس اصلی، backend repository و public website در این نوبت تغییر/درخواست نشده‌اند.

## فایل‌های این مرحله

- `components/SmsReminderWorkspace.vue` — مدیریت ruleهای یادآوری و provider/log history.
- `components/AdminOperationsWorkspace.vue` — XLSX، admin inbox، role/access، media، gateway، policy و audit log.
- `components/ReceptionWorkspace.vue` — برنامهٔ اتاق، ساعات، maintenance و حذف.
- `pages/manage/users.vue`, `pages/manage/settings.vue`, `pages/content/[type].vue`, `pages/counselor/index.vue`, `components/layout/full/Main.vue` — نقش‌ها، تنظیمات، CMS، note history و session security.
- `pages/booking/[section].vue`, sidebar و `middleware/admin.global.ts` — route dispatch و مجوزها.
- `PANEL-API-MATRIX.md`, `PANEL-API-GAPS.md`, `PANEL-IMPLEMENTATION-REPORT.md`, `PANEL-QA-REPORT.md`, `PANEL-COMPLETION-TRACKER.md`, `PANEL-REMAINING-TESTS.md`.

## آماده‌بودن برای مرحله بعد

آمادهٔ اجرای **مرحلهٔ final integration QA** پس از فراهم شدن MySQL ایزوله، backend تست روی 8011 و dependencies/browser است؛ برای production rollout آماده اعلام نمی‌شود.
