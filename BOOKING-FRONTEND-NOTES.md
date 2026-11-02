# قرارداد فعلی پنل رزرو و مشاور

این پنل به Laravel موجود متصل است. مسیرهای `useBooking()` زیر `/api/admin/booking/*` و endpointهای احراز‌شده‌ی پذیرش/مدیریت در `routes/api.php` تعریف شده‌اند. فهرست روز/هفته، رزروها، جزئیات، پرداخت/رسید، مالی، تسویه، بازپرداخت، خدمات و برنامه از منبع مشترک backend خوانده می‌شود.

## حساب و نقش

- مدیر/پذیرش مدیریتی: `/auth/login` با `POST /api/admin/login`, `GET /api/admin/me`, `POST /api/admin/logout` و مجوزهای پنل.
- مشاور: `/counselor/login` با `POST /api/counselor/login`. `/counselor` نوبت‌ها، یادداشت خصوصی، وضعیت جلسه، اطلاعات Meet/voice، شیفت/time-off، درآمد، تسویه و اعلان را از routeهای `/api/counselor/*` می‌خواند. درخواست‌های مشاور با Sanctum و `EnsureCounselor` به counselor متصل به حساب محدود هستند؛ logout با `POST /api/counselor/logout` token را revoke می‌کند.
- counselor portal داخل همین Nuxt است؛ برنامه‌ی چهارم ایجاد نشده است.

## جست‌وجوی رزرو

`GET /api/admin/booking/reservations` پارامترهای `date`, `from`, `to`, `counselor_id`, `service_id`, `client_id`, `status`, `q`, `page` را می‌پذیرد. پنل عبارت جست‌وجو را به `q` می‌فرستد تا جست‌وجوی نام/شماره/مشاور/شناسه روی backend انجام شود. تقویم شناسه رزرو را نشان می‌دهد.

## پیکربندی محلی و QA

پیش‌فرض API پنل `http://localhost:8010/api` است. برای اجرای E2E با دیتابیس جداگانه می‌توان `NUXT_PUBLIC_API_BASE=http://localhost:8011/api` تنظیم کرد؛ هرگز متغیر endpoint آزمایشی را به‌عنوان تنظیم production استفاده نکنید. گزارش اجرای واقعی و محدودیت‌ها در backend `QA-REPORT.md` است.

آخرین اجرا: build موفق؛ Playwright پنل/مشاور 6 از 6 سناریو موفق. هشدار build درباره Browserslist قدیمی و bundle سمت کاربر بزرگ‌تر از 500 KB باقی است. آزمون موبایل پنل، CRUD کامل reception، refunds/settlements از UI و مجوزهای نقش reception به‌طور کامل پوشش داده نشده‌اند.
