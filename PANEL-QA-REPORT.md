# گزارش QA پنل

آخرین ارزیابی: 2026-10-14. اجرای build/typecheck فقط static verification است، نه runtime integration یا آماده‌بودن production.

## اجرای همین مرحله

| فرمان/آزمون | نتیجه | توضیح |
|---|---|---|
| `npm run typecheck` | **PASS** | `tsc --noEmit` پس از آخرین تغییرات اجرا شد. |
| `npm run build` | **PASS** | Nuxt 3.16.2 و Nitro build کامل شدند. هشدار Browserslist با caniuse-lite قدیمی و chunk کلاینت حدود 4.65MB minified باقی است. |
| `npm run test:unit` | **BLOCKED** | در همین مخزن `vitest: not found`، exit 127؛ test body اجرا نشد. نصب dependency در این workspace قبلاً به registry DNS `EAI_AGAIN` و npm cache read-only/ناقص `EROFS` و `ENOTCACHED` برخورد کرده بود. TLS غیرفعال نشد. |
| Playwright browser E2E | **BLOCKED / deferred** | محیط قبلی اجازه bind پورت Nuxt dev server نداد و Chromium در cache نبود. طبق سیاست task مجدداً تلاش نشد. ۴ سناریو در اجرای قبلی discover شدند ولی هیچ‌کدام test body را اجرا نکردند. |
| API/MySQL integration | **BLOCKED** | Docker daemon قبلاً `permission denied` داده و compose backend به دیتابیس/volume `consulting` اشاره می‌کند؛ compose، migration، seed و نوشتن به 8010 انجام نشدند. |
| API اصلی 8010 | **NOT TOUCHED** | هیچ درخواست runtime به API 8010 ارسال نشده؛ bug شناخته‌شده login/booking همچنان **OPEN** است. |

## تست‌هایی که در اجرای پیشین گزارش شده‌اند

این موارد از QA قبلی حفظ شده‌اند و در این مرحله دوباره اجرا نشدند:

- Vitest: ۳ تست transition PASS با Vitest 3.2.7 از dependency بیرونی موقت؛ این dependency در package manifest/lockfile پنل نصب نیست و `npm run test:unit` فعلی قابل تکرار نیست.
- Backend PHPUnit: ۴۴ تست / ۳۵۶ assertion در کپی backend و SQLite `:memory:` PASS، طبق گزارش QA مورخ ۱۴۰۵/۰۷/۲۱. هیچ داده‌ای از `consulting` استفاده نشد.
- سند فعلی backend اعلام می‌کند ۵۹ تست / ۵۱۰ assertion PASS؛ این عدد از `BACKEND-FINAL-DEVELOPMENT-REPORT.md` خوانده شده و در QA frontend همین نوبت دوباره اجرا/تأیید نشده است.
- Vue typecheck و E2E قدیمی در گزارش پیشین هستند؛ static `npm run typecheck` در همین نوبت نیز جداگانه PASS شد.

## شمارش صریح

- همین مرحله: **۲ PASS** (typecheck/build)، **۰ تست assertion اجراشده**، **۱ BLOCKED** (unit command اجرا شد ولی Vitest نبود)، **۰ browser E2E اجراشده**، integration **BLOCKED**.
- سوابق آزمون پیشین: ۳ Vitest PASS و ۴۴ backend PHPUnit PASS (نه آزمون UI integration). چهار Playwright مورد صرفاً discover شدند و BLOCKED ماندند.
- هیچ frontend module به‌عنوان integration-tested یا production-ready علامت نمی‌خورد.

## محدودیت ابزار

در صورت فعال‌شدن دسترسی استاندارد registry/cache، dependencyهای Vitest، Vue Test Utils، happy-dom، Playwright، TypeScript و vue-tsc باید به package/lockfile همین repository افزوده و lockfile بررسی شود. Chromium نیز باید در محیط QA نصب شود. registry TLS را غیرفعال نکنید.

## اصلاحات و ریسک‌های باز

- build/typecheck پس از افزودن صفحات یادآور SMS، خروجی‌های XLSX، inbox ادمین، مدیریت role/media، برنامهٔ اتاق و تنظیمات structured مجدداً اجرا و PASS شد.
- 8010 و DB اصلی دست‌نخورده‌اند.
- هنوز تست مرورگر/DB با نقش‌های واقعی، فیلترهای XLSX، download MIME، rule preview، privacy attachment، finalized-note history، room conflict، Persian RTL در viewportهای واقعی، و خطاهای 401/403/409/422 اجرا نشده‌اند.
- ابعاد bundle و هشدار Browserslist نیازمند رسیدگی در final QA/performance pass است.
