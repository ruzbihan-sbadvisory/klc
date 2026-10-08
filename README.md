# Laman Web KLC (Astro + Sveltia CMS + Cloudflare)

Laman static yang laju dan percuma, dengan panel admin di `/admin/` untuk edit semua teks, gambar, warna dan artikel tanpa sentuh kod. Setiap kali tekan **Save** di admin, satu commit masuk GitHub dan Cloudflare deploy semula dalam lebih kurang 1 minit.

## Apa yang boleh diedit di panel admin

**Artikel & Berita** — tulis artikel baharu (kategori News / Article / Guide), gambar, tag, draf. 3 terbaru keluar automatik di Newsroom halaman utama, semua keluar di `/artikel/`.

**Tetapan Laman > Tetapan Umum** — nama syarikat, no. SSM, logo (teks atau gambar), 4 warna jenama, SEO, menu atas + dropdown, butang header, harga saham (on/off), telefon/faks/emel, butang WhatsApp, borang Google Sheets, footer (alamat, cawangan, pautan servis, SDG, copyright), media sosial.

**Tetapan Laman > Halaman Utama** — setiap bahagian boleh ON/OFF dan diedit: Hero, Trusted By, kad statistik, slider servis (tambah/buang slide), jalur pencapaian, testimoni, portfolio, akreditasi, Newsroom, seruan bertindak.

**Tetapan Laman > Halaman Senarai Artikel** — tajuk, pengenalan, susunan kategori, kotak hubungi.

## Struktur fail

```
public/admin/config.yml     susunan panel admin
src/data/site.json          Tetapan Umum
src/data/home.json          Halaman Utama
src/data/articles-page.json Halaman Senarai Artikel
src/content/artikel/*.md    artikel
src/pages/                  halaman (index, artikel, 404)
src/components/             header, footer, borang, kad artikel
worker/                     login GitHub untuk admin
google-apps-script/Code.gs  kod untuk borang -> Google Sheets
```

## Langkah deploy (ikut urutan)

### Fasa 0: Sebelum push
1. Buka `public/admin/config.yml`, baris `repo: ruzbihan-sbadvisory/klc` → tukar kepada `username-github-anda/nama-repo`.
2. Kalau nama Worker di Cloudflare nanti bukan `klc-website`, tukar `name` dalam `wrangler.jsonc` supaya sama.

### Fasa 1: GitHub
1. github.com > butang **+** (atas kanan) > **New repository** > nama `klc-website` > **Create repository**.
2. Upload semua fail dalam folder ini (atau guna GitHub Desktop) ke branch `main`.

### Fasa 2: Cloudflare (deploy draf)
1. dash.cloudflare.com > **Workers & Pages** > **Create** > **Import a repository** > pilih repo `klc-website`.
2. Build command: `npm run build`. Deploy command biarkan `npx wrangler deploy`.
3. Kalau ada ruang variable build: `NODE_VERSION` = `22`.
4. Tekan **Deploy**. Bila siap, buka alamat `....workers.dev` yang diberi.

### Fasa 3: Login admin (GitHub OAuth)
1. GitHub > gambar profil > **Settings** > **Developer settings** > **OAuth Apps** > **New OAuth App**.
2. Homepage URL = alamat laman (`https://klc-website.xxx.workers.dev`).
3. **Authorization callback URL / Redirect URI** = alamat laman + `/callback` (tiada `/` di hujung).
4. Jangan tick Device Flow. Kalau ada pilihan **Expire user access tokens**, buang tick.
5. **Register application** > salin **Client ID** > tekan **Generate a new client secret** > salin.
6. Cloudflare > Worker anda > **Settings** > **Variables and Secrets** > **Add**:
   - `GITHUB_CLIENT_ID` = Client ID (pilih jenis Secret)
   - `GITHUB_CLIENT_SECRET` = client secret (pilih jenis Secret)
   - Tekan **Deploy**.
7. Buka `alamat-laman/admin/` > **Sign In with GitHub** > **Authorize**.

Ralat biasa:
- "GITHUB_CLIENT_ID dan GITHUB_CLIENT_SECRET belum ditetapkan" → variable tak sampai. Semak ejaan, dan pastikan di **Variables and Secrets** (bukan Build variables).
- "redirect_uri is not associated with this application" → Redirect URI di GitHub tak sama dengan alamat laman.

### Fasa 4: Domain sendiri
1. Cloudflare > **Add a domain** > masukkan domain > plan **Free**.
2. Salin 2 nameserver yang Cloudflare beri, tukar di tempat beli domain (registrar). Tunggu status **Active** (beberapa minit hingga 24 jam).
3. Worker > **Settings** > **Domains & Routes** > **Add** > **Custom domain** > masukkan domain (contoh `www.kurnialestari.com.my`).
4. GitHub OAuth App > tukar Homepage URL dan Redirect URI kepada domain baharu (`https://www.domain-anda/callback`).
5. Panel admin > Tetapan Umum > **URL laman web** = `https://www.domain-anda` > Save.
6. Hantar `https://www.domain-anda/sitemap-index.xml` ke Google Search Console.

### Fasa 5: Borang hubungi → Google Sheets
Ikut arahan dalam `google-apps-script/Code.gs` (run `setup` dulu, kemudian Deploy as Web app). Tampal URL `/exec` di Tetapan Umum > Borang hubungi. URL lama dari HTML asal sudah dimasukkan, jadi kalau script itu masih hidup, borang terus berfungsi.

### Tambah editor lain
Editor perlu akaun GitHub percuma. Repo > **Settings** > **Collaborators** > **Add people** > beri akses **Write**. Mereka login di `/admin/` sahaja.

## Nota teknikal
- Gambar yang di-upload melalui admin ditukar ke WebP dan dikecilkan automatik (lebar max 1920px).
- Ikon guna Font Awesome 6 — isi nama kelas, contoh `fas fa-solar-panel` (cari di fontawesome.com/icons).
- Selepas edit di admin, kalau nak `git push` dari komputer: `git pull --rebase origin main` dulu.
- Uji tempatan: `npm install` > `npm run build` > `npx wrangler dev`.
