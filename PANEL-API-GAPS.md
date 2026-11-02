# شکاف‌های API پنل

بازبینی: 2026-10-14. مبنا: Laravel routes/controller/validation در مخزن backend، مستند `docs/API-PHASES-1-8.md`، contracts و OpenAPI. مواردی که APIشان اضافه شده در جدول نخست از «گپ» خارج شده‌اند. فایل backend read-only باقی ماند.

## APIهایی که اکنون وجود دارند و در UI به آن‌ها متصل شده‌اند

| قابلیت که قبلاً مسدود/ناقص گزارش شده بود | قرارداد واقعی | رابط فعلی |
|---|---|---|
| نقش و انتساب permission | `GET/POST /api/admin/roles`, `GET /api/admin/permissions`, `PATCH/DELETE /api/admin/roles/{role}`, `GET/PUT /api/admin/users/{user}/roles` | `/booking/roles`, `/manage/users`; API و UI فقط Super Admin اجازه می‌دهند |
| اعلان ادمین و خواندن | `GET /api/admin/notifications`, `GET .../{id}`, `POST .../{id}/read`, `POST /api/admin/notifications/read-all` | `/booking/admin-inbox`; server مجوزهای کاربر را فیلتر می‌کند |
| تاریخچهٔ نسخه یادداشت مشاور | `GET /api/counselor/session-notes/{note}/versions[/{version}]` | پنل counselor، فقط مشاهده؛ یادداشت finalized قابل ویرایش نیست |
| برنامه و عملیات اتاق | `GET .../rooms/{room}/calendar`, `GET/PUT .../working-hours`, `GET/POST .../unavailability`, `DELETE /api/admin/booking/room-unavailability/{window}`, `DELETE .../rooms/{room}` | `/booking/rooms`؛ برنامه، ساعات، انسداد و حذف امن |
| قواعد SMS reminder | `/api/admin/settings/sms-reminders/{rules,scheduled,history,attempts}`, CRUD rule، preview، cancel، retry | `/booking/sms-reminders` |
| SMS driver status | `GET/PUT /api/admin/settings/sms` فقط `log` یا `fake` | همان بخش؛ وضعیت تحویل واقعی همیشه backend-authoritative است |
| هشت خروجی XLSX | `GET /api/admin/booking/exports/{bookings,payments,refunds,settlements,counselor-earnings,reception-performance,room-utilization,capacity}.xlsx` | `/booking/exports`; دریافت binary از backend و فیلتر تاریخ/شناسه |
| CMS media و SEO | `POST /api/admin/gallery/upload`, `GET /api/admin/content-media`, `GET .../{media}/preview`, `DELETE .../{media}`؛ CMS fields شامل `seo_title`, `seo_description`, `published_at`, `status`, `extra`, `sort_order` | `/content/{type}`, `/booking/content-media` |
| تنظیمات مرکز | `GET/PUT /api/admin/settings/center-profile`, `/working-hours`, `/seo`; `GET/POST/DELETE /api/admin/settings/holidays/{holiday}` | `/manage/settings` |
| سیاست رزرو | `GET/PUT /api/admin/booking/policy` | `/booking/booking-settings` |
| درگاه‌های پرداخت | `GET/PUT /api/admin/booking/gateways` | `/booking/payment-settings`; فقط Fake Bank در local/testing قابل تنظیم است |
| امن‌سازی نشست | `GET /api/session`, `PUT /api/password`, `POST /api/logout-all` | منوی «حساب کاربری» پنل ادمین |

## محدودیت‌های واقعی backend / وابستگی خارجی

### پیامک واقعی — `BLOCKED_EXTERNAL`

- در این backend هیچ provider واقعی SMS نصب/پیکربندی نشده است؛ `BOOKING_SMS_DRIVER=log` پیش‌فرض است و driver `fake` صرفاً در محیط local/testing مجاز است.
- API تنظیم provider واقعی یا secretهای آن وجود ندارد و نباید با generic settings ساخته شود. رابط فقط وضعیت را نشان می‌دهد و driver مستندشده را کنترل می‌کند.
- برای فعال‌سازی لازم است provider رسمی انتخاب شود، قرارداد adapter و متغیرهای محرمانه در server تعیین شوند، consent/quiet-hours حفظ شود و delivery callback/receipt مشخص شود. کلید محرمانه نباید به frontend بازگردد.

### Zarinpal و SnappPay — `BLOCKED_EXTERNAL`

- API مدیریت gateway وجود دارد اما backend adapter این دو provider را `implemented:false`, `ready:false` بازمی‌گرداند و درخواست فعال‌سازی رد می‌شود.
- اطلاعات موردنیاز: قرارداد رسمی جاری، sandbox، merchant credentials و چرخه‌های callback/verify/refund از مرجع رسمی هر provider. پنل آن‌ها را فعال نمی‌کند و secret دریافت/نمایش نمی‌دهد.

## قراردادهایی که برای قابلیت بعدی لازم می‌شوند

این موارد gap محصول/قرارداد هستند، نه مجوزی برای جعل endpoint در فرانت‌اند:

1. **پیش‌نمایش CMS**: مسیر preview امن برای draft/scheduled content که فقط editor مجاز ببیند؛ قرارداد پیشنهادی `GET /api/admin/content/{type}/{entry}/preview` با authorization و پاسخ همان CMS resource. فعلی CMS در UI قابل ویرایش/انتشار است، اما public page preview endpoint در Laravel وجود ندارد.
2. **محتوای ویژهٔ homepage**: API عمومی CRUD نوع‌های `banners` و `homepage_sections` را می‌پذیرد و فیلد `extra` دارد؛ اگر editor نیازمند schema تصویب‌شده و مرتب‌سازی ساختاریافته باشد، backend باید schema/validator محصول را تعریف کند. پنل نوع‌ها را از route معتبر مدیریت می‌کند ولی ادعای builder اختصاصی ندارد.
3. **تعریف ظرفیت/گزارش**: endpoint و XLSX وجود دارد. ظرفیت برآورد تجمیعی است و بر مبنای الگوریتم slotهای ۱۵ دقیقه‌ای/ساعات اتاق محاسبه می‌شود؛ ترکیب مدت‌های متفاوت سرویس و قیود تخصصی را مدل نمی‌کند. آن را «slot آزاد قطعی» یا exact availability تلقی نکنید.
4. **تاریخچه پاسخ فرم/بایگانی فرم**: endpointهای فرم و نسخه‌گذاری و پاسخ/consent وجود دارند؛ مسیر archive/deactivate فرم ندارد. فرم‌های استفاده‌شده را حذف/ویرایش مخرب نکنید؛ archive امن باید از سمت backend افزوده شود.
5. **اسکیماهای CMS تخصصی**: resource عمومی فیلدهای SEO/وضعیت/زمان را دارد ولی field schema اختصاصی هر نوع به `extra` وابسته است؛ لازم است نیاز نهایی مدل هر صفحه با backend محصول تثبیت شود.

## موارد پیاده‌سازی ناقص frontend (API موجود است)

- «در دسترس API» با «integration-test شده» یکسان نیست. رزرو/پرداخت/clinical/forms/notifications/CMS/settings هنوز runtime در MySQL ایزوله و مرورگر verify نشده‌اند.
- مدیریت کاربر و نقش backend به Super Admin محدود است؛ مدیر با permission محدود ممکن است 403 بگیرد. UI باید خطای permission را نمایش دهد و backend همچنان مرجع است.
- برای ابزارهای عملیاتی، اعمال فیلتر/خروجی‌ها با MySQL واقعی، date boundary تهران، و فرمت فایل باید در QA بعدی بررسی شود.
- وضعیت مشکل شناخته‌شدهٔ login/booking روی `http://localhost:8010` همچنان `OPEN` است؛ در این توسعه به آن درخواست زده نشد.
