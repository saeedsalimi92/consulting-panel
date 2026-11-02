# آزمون‌های باقیمانده پنل

این فایل چک‌لیست مرحلهٔ integration/final QA است. هر عملیات نوشتنی فقط روی MySQL test جدا با نام روشن (نه `consulting`) و backend روی 8011 یا پورت ایزوله اجرا شود. پیش از migration، نام دیتابیس فعال را از runtime config/connection تأیید کنید؛ seed یا write روی 8010 مطلقاً انجام نشود.

## آماده‌سازی محیط

- [ ] بازیابی دسترسی npm registry یا cache writable؛ نصب Vitest، Vue Test Utils، happy-dom، Playwright، TypeScript و vue-tsc با TLS استاندارد و commit lockfile.
- [ ] Playwright Chromium در runner QA نصب شود؛ app بتواند روی localhost bind شود.
- [ ] MySQL test instance مستقل، database name non-production و port 8011 ثبت و از environment پنل تزریق شود.
- [ ] fixtureهای role-scoped admin/reception/finance/counselor/client با synthetic records بسازید؛ verify connection/name قبل از writes.
- [ ] backend migrations فقط روی DB تست اجرا؛ هرگز compose default را اجرا نکنید تا `consulting` بودن volume/database منتفی شود.
- [ ] Scheduler و queue test worker را جداگانه برای SMS reminders آماده کنید؛ provider fake/log و assert کنید پیام واقعی ارسال نمی‌شود.

## Unit/component

- [ ] Vitest unit تست helperهای فیلتر/صفحه‌بندی، transition رزرو، مبلغ IRR، تهران/Jalali، XLSX download response validation.
- [ ] Vue component tests: SMS rule validation/quiet hours، role/permission gating، empty/error/loading، room maintenance conflict، CMS scheduled publish.
- [ ] `npm run typecheck`, `vue-tsc --noEmit`, lint (اگر تنظیم است)، `npm run test:unit`, `npm run build`.

## Playwright E2E با DB ایزوله

- [ ] Admin login/me/refresh/logout/change password/logout-all.
- [ ] Reception login، جست‌وجو، رزرو، room assignment/conflict، check-in، start/complete/no-show، cancel/reschedule و waitlist conversion.
- [ ] Counselor login، assigned client scope، clinical attachment authorization، draft/finalized note، version history و ممنوعیت ویرایش finalized.
- [ ] Finance payment/refund partial/full، promo, commission, settlements و ledger reconciliation؛ فقط fixture test.
- [ ] SMS rule add/edit/enable/preview، scheduler status، attempt list، retry/cancel؛ verify SMS real delivery remains false.
- [ ] Inbox role filtering/detail/read/read-all؛ email template retry behavior.
- [ ] هشت XLSX: تاریخ و فیلتر، status code، MIME `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, filename، file header و خطای range >366 days.
- [ ] Room hours/maintenance/calendar/delete conflicts، holiday conflict.
- [ ] CMS create/edit/publish/scheduled publish/upload/preview access/delete 409.
- [ ] Settings/profile/SEO/policy/gateway permission boundaries؛ Fake Bank only in local/testing.
- [ ] 401/403/404/409/422/429/network errors و refresh پس از mutation.

## Visual/responsive/security

- [ ] Desktop 1440px، tablet 768px، mobile 390px؛ sidebar، tables scroll/pagination، dialogs، forms و reports.
- [ ] Persian RTL، تاریخ Jalali/Tehran، boundary نیمه‌شب DST/time-offset assumptions، IRR/Toman label checks.
- [ ] Keyboard-only، focus order/visible focus، dialog focus return، form labels، screen-reader names، contrast.
- [ ] بازبینی storage/network: clinical fields در localStorage/global state/console نیست؛ رسانه خصوصی فقط با Bearer request؛ noteها فقط در scope مجاز.
- [ ] باگ login/booking روی 8010 هنوز OPEN است؛ برای verify نیاز به محیط تست ایزوله جدید.

## محیط/وابستگی

- Unit command فعلی `vitest: not found`; اجرای فعلی unit test BLOCKED است.
- اجرای قبلی Playwright پیش از body به bind/browser محدودیت خورد؛ در این task دوباره اجرا نشد.
- Docker daemon در اجرای قبلی اجازه نداد و compose backend default به `consulting` متصل است؛ هیچ migration/seed انجام نشود تا compose ایزوله جدا و connection تأیید شود.
