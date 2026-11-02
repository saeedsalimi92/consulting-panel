# راه‌اندازی احراز هویت و مجوزهای پنل

این بسته روی نسخه development قبلی ساخته شده و شامل **پنل کامل به‌همراه backend-overlay** است. پوشه `backend-overlay` را با پروژه Laravel **ادغام** کنید، نه جایگزین کل پروژه. ابتدا از دیتابیس نسخه پشتیبان بگیرید.

## نکته بسیار مهم درباره routes/api.php
این فایل را از بسته جدید با نسخه فعلی مقایسه و ادغام کنید. نسخه قبلی `routes/api.php` ممکن است هنوز فقط ۱۵ مسیر داشته باشد. مسیرهای عمومی و مدیریتی جدید را حفظ کنید و تعریف‌های تکراری را حذف کنید.

## دستورات Laravel (از ریشه پروژه بک‌اند)
```
docker compose exec laravel composer show laravel/sanctum
docker compose exec laravel php artisan optimize:clear
docker compose exec laravel php artisan migrate:status
docker compose exec laravel php artisan migrate --pretend
```
بعد از بررسی خروجی pretend و اطمینان از نبود عملیات مخرب:
```
docker compose exec laravel php artisan migrate
docker compose exec laravel php artisan route:list --path=api/admin
docker compose exec laravel php artisan admin:create admin@example.com
```
رمز را در پرامپت وارد کنید (حداقل ۱۲ کاراکتر). اگر فرمان admin:create در دسترس نیست: `php artisan list | grep admin` و مسیر فایل Command را بررسی کنید.

## پنل
در پوشه `admin-modernize`:
```
cp .env.example .env
npm ci
npm run dev -- --port 3001
```
متغیر `.env`: `NUXT_PUBLIC_API_BASE=http://localhost:8010/api`
صفحه ورود: `http://localhost:3001/auth/login`

## API
- POST /api/admin/login با `{email,password}`؛ پاسخ token و user
- GET /api/admin/me با `Authorization: Bearer TOKEN`
- POST /api/admin/logout با همان هدر؛ توکن فعلی در Sanctum حذف می‌شود.
- مسیرهای CRUD با `auth:sanctum`، بررسی دسترسی پنل و مجوز بخش مربوطه محافظت شده‌اند.

## دسترسی‌ها
مدیر کل (`is_admin=true`) همه مجوزها را دارد. کاربر غیرمدیر فقط با `admin_permissions` می‌تواند به بخش‌های تعیین‌شده دسترسی داشته باشد. مجوزهای تعریف‌شده: dashboard.view, counselors.manage, specialties.manage, comments.manage, content.manage, appointments.manage, settings.manage. مدیریت کاربران فقط برای مدیر کل فعال است. ویرایش permissions از API مدیریت کاربران انجام می‌شود.

## خروج
خروج ابتدا توکن فعلی را از سمت Laravel لغو می‌کند؛ حتی اگر درخواست خروج با خطای شبکه مواجه شود، توکن محلی پاک و کاربر به صفحه ورود هدایت می‌شود. در حالت خطای شبکه، توکن سرور ممکن است تا زمان لغو دستی معتبر بماند؛ این موضوع را در تست امنیتی بررسی کنید.

## محدودیت‌ها
- این نسخه توکن را در localStorage نگه می‌دارد؛ برای انتشار عمومی، بهتر است به کوکی HttpOnly و محافظت CSRF مهاجرت شود.
- تمام جریان‌ها در محیط واقعی شما end-to-end تست نشده‌اند. قبل از انتشار تست ورود/خروج، 401/403، نقش‌ها و CRUD الزامی است.
- این پچ تنها لاگین، لاگ‌اوت و کنترل دسترسی پنل را هدف می‌گیرد؛ سیستم OTP، بازیابی رمز و پرداخت را شامل نمی‌شود.


## ورود مستقل مشاور

نشانی فضای کاری مشاور در همان برنامه: `http://localhost:3001/counselor/login`. API ورود `POST /api/counselor/login` است و endpointهای protected زیر `/api/counselor/*` فقط داده‌های مشاور متصل به حساب را ارائه می‌کنند. خروج با `POST /api/counselor/logout` توکن Sanctum جاری را باطل می‌کند.
