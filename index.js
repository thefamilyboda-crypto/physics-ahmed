const Jimp = require("jimp");
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const ADMIN_PASS = "ahmed123";

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
const upload = multer({ dest: './uploads/' });
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

const dbFile = './data.json';
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ students: [], items: [] }));
const getDB = () => JSON.parse(fs.readFileSync(dbFile));
const saveDB = (d) => fs.writeFileSync(dbFile, JSON.stringify(d));

function getUser(req) {
    const c = req.headers.cookie || '';
    if (c.includes('role=admin')) return { role: 'admin', name: 'المعلم أحمد', grade: 'all' };
    const m = c.match(/st=([^;]+)/);
    if (m) {
        const st = getDB().students.find(s => s.code === m[1]);
        if (st) return { role: 'student', name: st.name, grade: st.grade };
    }
    return null;
}




let cachedIcon = null;
app.get("/icon.png", async (req, res) => {
  try {
    if (!cachedIcon) {
      const img = new Jimp(512, 512, 0x070d19ff);
      const cx = 256, cy = 256;
      img.scan(0, 0, 512, 512, function(x, y, idx) {
        const dx = x - cx, dy = y - cy;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 42) { this.bitmap.data.writeUInt32BE(0x38bdf8ff, idx); }
        else if (d > 210 && d < 228) { this.bitmap.data.writeUInt32BE(0x0284c7ff, idx); }
        else {
          const a1 = Math.PI / 6, a2 = -Math.PI / 6, a3 = Math.PI / 2;
          const checkE = (a) => {
            const rx = dx * Math.cos(a) + dy * Math.sin(a);
            const ry = -dx * Math.sin(a) + dy * Math.cos(a);
            const val = (rx*rx)/(190*190) + (ry*ry)/(68*68);
            return Math.abs(val - 1) < 0.14;
          };
          if (checkE(a1) || checkE(a2) || checkE(a3)) {
            this.bitmap.data.writeUInt32BE(0x38bdf8ff, idx);
          }
        }
      });
      cachedIcon = await img.getBufferAsync(Jimp.MIME_PNG);
    }
    res.writeHead(200, { "Content-Type": "image/png", "Content-Length": cachedIcon.length });
    res.end(cachedIcon);
  } catch (e) { res.status(500).end(); }
});

app.get("/manifest.json", (req, res) => {
  res.json({
    name: "Eng. Ahmed Mohamed - Physics",
    short_name: "Eng. Ahmed Mohamed",
    start_url: "/",
    display: "standalone",
    background_color: "#070d19",
    theme_color: "#0284c7",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }, { src: "/icon.png", sizes: "512x512", type: "image/png" }]
  });
});

app.get("/sw.js", (req, res) => {
  res.type("application/javascript");
  res.send("self.addEventListener(\"fetch\", () => {});");
});

app.get('/', (req, res) => {
    const user = getUser(req);
    if (!user) return res.send(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>منصة Eng. Ahmed Mohamed للفيزياء | الثانوية العامة</title>
<link href="https://googleapis.com" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:"Cairo",Tahoma,sans-serif}
body{background:#070d19;color:#fff;overflow-x:hidden;line-height:1.6}
.bg-glow{position:fixed;top:-150px;right:-150px;width:450px;height:450px;background:radial-gradient(circle,rgba(13,71,161,0.45) 0%,rgba(7,13,25,0) 70%);z-index:-1}
.bg-glow2{position:fixed;bottom:-150px;left:-150px;width:450px;height:450px;background:radial-gradient(circle,rgba(0,188,212,0.25) 0%,rgba(7,13,25,0) 70%);z-index:-1}
header{display:flex;justify-content:space-between;align-items:center;padding:18px 6%;background:rgba(13,23,42,0.85);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.08);position:sticky;top:0;z-index:100}
.logo{font-size:1.3rem;font-weight:800;color:#38bdf8;display:flex;align-items:center;gap:8px}
.nav-btn{background:#0284c7;color:#fff;padding:8px 18px;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9rem;transition:0.3s}
.nav-btn:hover{background:#0369a1}
.hero{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:50px 6%;gap:40px;max-width:1200px;margin:auto}
.hero-text{flex:1;min-width:290px}
.badge{display:inline-block;background:rgba(56,189,248,0.15);color:#38bdf8;padding:6px 14px;border-radius:20px;font-size:0.85rem;font-weight:600;margin-bottom:15px;border:1px solid rgba(56,189,248,0.3)}
.hero-text h1{font-size:2.3rem;font-weight:800;margin-bottom:15px;line-height:1.3}
.hero-text h1 span{color:#38bdf8}
.hero-text p{color:#94a3b8;font-size:1.05rem;margin-bottom:25px}
.stats{display:flex;gap:25px;margin-top:20px}
.stat h3{color:#38bdf8;font-size:1.5rem;font-weight:800}
.stat span{color:#94a3b8;font-size:0.85rem}
.login-box{flex:1;min-width:290px;max-width:400px;background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.3);padding:30px 25px;border-radius:18px;box-shadow:0 20px 40px rgba(0,0,0,0.4);margin:auto}
.login-box h2{text-align:center;color:#fff;margin-bottom:8px;font-size:1.4rem}
.login-box p{text-align:center;color:#94a3b8;font-size:0.9rem;margin-bottom:20px}
input{width:100%;padding:14px;border-radius:10px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:1rem;margin-bottom:15px;text-align:center;outline:none;transition:0.3s}
input:focus{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,0.2)}
button{width:100%;padding:14px;border-radius:10px;border:none;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;font-size:1.05rem;font-weight:800;cursor:pointer;transition:0.3s}
button:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(2,132,199,0.4)}
.section{padding:50px 6%;max-width:1200px;margin:auto}
.sec-title{text-align:center;font-size:1.8rem;font-weight:800;margin-bottom:35px}
.sec-title span{color:#38bdf8}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
.card{background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.08);padding:25px;border-radius:15px;text-align:center;transition:0.3s}
.card:hover{border-color:#38bdf8;transform:translateY(-5px)}
.card .icon{font-size:2.5rem;margin-bottom:12px}
.card h3{margin-bottom:8px;color:#f8fafc}
.card p{color:#94a3b8;font-size:0.9rem}
footer{text-align:center;padding:25px;border-top:1px solid rgba(255,255,255,0.08);color:#64748b;font-size:0.9rem;margin-top:40px}
</style>
<link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.png"><meta name="theme-color" content="#0284c7"></head>
<body>
<div class="bg-glow"></div><div class="bg-glow2"></div>
<header>
  <div class="logo">⚛️ منصة Eng. Ahmed Mohamed للفيزياء</div>
  <a href="#login" class="nav-btn">دخول المنصة</a>
</header>
<section class="hero">
  <div class="hero-text">
    <div class="badge">🚀 طريقك للدرجة النهائية في الفيزياء</div>
    <h1>افهم الفيزياء ببساطة مع <span>Eng. Ahmed Mohamed</span></h1>
    <p>منصة تعليمية متكاملة لطلاب المرحلة الثانوية. شرح مبسط بأحدث الطرق، مذكرات شاملة، وامتحانات تفاعلية تؤهلك للتفوق بأعلى الدرجات.</p>
    <div class="stats">
      <div class="stat"><h3>1, 2, 3</h3><span>الصفوف الثانوية</span></div>
      <div class="stat"><h3>+100</h3><span>فيديو ومذكرة</span></div>
      <div class="stat"><h3>24/7</h3><span>متابعة مستمرة</span></div>
    </div>
  </div>
  <div class="login-box" id="login">
    <h2>تسجيل الدخول 🔐</h2>
    <p>أدخل كود الطالب الخاص بك لبدء المذاكرة</p>
    <form action="/login" method="POST">
      <input name="code" placeholder="اكتب الكود هنا..." required autocomplete="off">
      <button type="submit">دخول للمنصة 🚀</button>
    </form>
  </div>
</section>
<section class="section">
  <h2 class="sec-title">ليه تذاكر على <span>منصتنا؟</span></h2>
  <div class="grid">
    <div class="card"><div class="icon">🎥</div><h3>محاضرات فيديو عالية الجودة</h3><p>شرح تفصيلي لكل جزئية في المنهج وحل أفكار ومسائل مستويات عليا.</p></div>
    <div class="card"><div class="icon">📄</div><h3>مذكرات PDF منظمة</h3><p>ملخصات القوانين وأهم الأسئلة جاهزة للتحميل والمراجعة في أي وقت.</p></div>
    <div class="card"><div class="icon">✍️</div><h3>امتحانات دورية</h3><p>اختبارات مستمرة لتقييم مستواك وتدريبك على نظام الأسئلة الحديث.</p></div>
    <div class="card"><div class="icon">📱</div><h3>سهلة من أي مكان</h3><p>تصفح دروسك من الموبايل أو الكمبيوتر بكل سهولة وسرعة.</p></div>
  </div>
</section>
<footer>جميع الحقوق محفوظة © منصة Eng. Ahmed Mohamed للفيزياء</footer>

<style>
.wa-float{position:fixed;bottom:22px;left:22px;background:#25d366;color:#fff;padding:12px 18px;border-radius:50px;text-decoration:none;font-weight:800;font-size:0.95rem;display:flex;align-items:center;gap:8px;box-shadow:0 8px 20px rgba(37,211,102,0.4);z-index:999;transition:0.3s}
.wa-float:hover{transform:scale(1.06);background:#1ebe5d}
</style>
<a href="https://wa.me{phone}?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%20%D9%8A%D8%A7%20%D9%85%D8%B3%D8%AA%D8%B1%20%D8%A3%D8%AD%D9%85%D8%AF%D8%8C%20%D9%85%D8%AD%D8%AA%D8%A7%D8%AC%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%B1%20%D8%B9%D9%86%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D9%85%D9%86%D8%B5%D8%A9%20%D8%A7%D9%84%D9%81%D9%8A%D8%B2%D9%8A%D8%A7%D8%A1" target="_blank" class="wa-float">💬 تواصل واتساب</a>

<button id="installBtn" style="display:none;background:#10b981;margin-top:12px;font-size:0.95rem">📲 تثبيت التطبيق على الشاشة</button>
<script>
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
let deferredPrompt;
const btn = document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btn.style.display = "block";
});
btn.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt = null;
    btn.style.display = "none";
  }
});
</script>
</body>
</html>`);

    const db = getDB();
    const isAdmin = user.role === 'admin';
    const g = isAdmin ? (req.query.g || 'all') : user.grade;
    const t = req.query.t || 'video';
    const gNames = { '1': '1 ثانوي', '2': '2 ثانوي', '3': '3 ثانوي', 'all': 'الكل' };

    const items = db.items.filter(it => (g === 'all' || it.grade === g) && it.type === t);
    const itemsHtml = items.length ? items.map(it => {
        const del = isAdmin ? `<a href="/del-item/${it.id}" style="color:red;float:left;text-decoration:none">حذف</a>` : '';
        const bdg = isAdmin ? `<small style="background:#e3f2fd;color:#0d47a1;padding:2px 6px;border-radius:5px">${gNames[it.grade]}</small>` : '';
        if (it.type === 'video') return `<div class="card"><h4>🎥 ${it.title} ${bdg} ${del}</h4><video width="100%" controls controlsList="nodownload" src="/uploads/${it.file}"></video></div>`;
        if (it.type === 'pdf') return `<div class="card"><h4>📄 ${it.title} ${bdg} ${del}</h4><a href="/uploads/${it.file}" target="_blank" class="btn">📥 فتح المذكرة</a></div>`;
        if (it.type === 'note') return `<div class="card note"><h4>📝 ${it.title} ${bdg} ${del}</h4><p style="white-space:pre-line">${it.content}</p></div>`;
        if (it.type === 'exam') return `<div class="card exam"><h4>✍️ ${it.title} ${bdg} ${del}</h4><p>${it.content}</p>${it.link?`<a href="${it.link}" target="_blank" class="btn" style="background:#e65100">🚀 فتح الامتحان</a>`:''}</div>`;
    }).join('') : `<div class="card" style="text-align:center;color:#888">لا يوجد محتوى هنا بعد 📭</div>`;

    const stList = db.students.map(s => `<div style="padding:5px 0;border-bottom:1px solid #eee;font-size:13px">👤 ${s.name} (${gNames[s.grade]}) - كود: <b>${s.code}</b> <a href="/del-st/${s.code}" style="color:red;float:left">حذف</a></div>`).join('');

    const adminUI = isAdmin ? `
    <details class="card" style="border:2px solid #0d47a1">
        <summary style="font-weight:bold;color:#0d47a1;cursor:pointer">⚙️ لوحة تحكم المعلم (اضغط للفتح)</summary>
        <div style="margin-top:10px">
            <h4>👥 إضافة طالب</h4>
            <form action="/add-st" method="POST"><input name="name" placeholder="اسم الطالب" required><input name="code" placeholder="كود الطالب" required><select name="grade"><option value="1">1 ثانوي</option><option value="2">2 ثانوي</option><option value="3">3 ثانوي</option></select><button>إضافة طالب</button></form>
            <div style="max-height:100px;overflow-y:auto;margin:10px 0">${stList}</div><hr>
            <h4>📤 إضافة محتوى</h4>
            <form action="/add-item" method="POST" enctype="multipart/form-data">
                <select name="type" id="tp" onchange="tgl()"><option value="video">🎥 فيديو</option><option value="pdf">📄 مذكرة PDF</option><option value="note">📝 ملحوظة</option><option value="exam">✍️ واجب/امتحان</option></select>
                <select name="grade"><option value="1">1 ثانوي</option><option value="2">2 ثانوي</option><option value="3">3 ثانوي</option></select>
                <input name="title" placeholder="العنوان..." required>
                <div id="fb"><input type="file" name="file"></div>
                <div id="tb" style="display:none"><textarea name="content" placeholder="التفاصيل أو القوانين..."></textarea><input name="link" placeholder="رابط امتحان (اختياري)"></div>
                <button style="background:#2e7d32">نشر الآن</button>
            </form>
        </div>
    </details>
    <div style="display:flex;gap:5px;margin-bottom:10px">
        <a href="/?g=all&t=${t}" class="pill ${g==='all'?'act':''}">الكل</a>
        <a href="/?g=1&t=${t}" class="pill ${g==='1'?'act':''}">1 ثانوي</a>
        <a href="/?g=2&t=${t}" class="pill ${g==='2'?'act':''}">2 ثانوي</a>
        <a href="/?g=3&t=${t}" class="pill ${g==='3'?'act':''}">3 ثانوي</a>
    </div>` : '';

    res.send(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>منصة الفيزياء</title><style>
    body{font-family:Tahoma;background:#f0f2f5;padding:12px;max-width:700px;margin:auto}
    .hdr{background:#0d47a1;color:#fff;padding:15px;border-radius:10px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:12px}
    .tab{background:#fff;text-align:center;padding:10px 4px;border-radius:8px;text-decoration:none;color:#333;font-size:12px;font-weight:bold}
    .tab.act{background:#0d47a1;color:#fff}
    .pill{background:#fff;padding:5px 12px;border-radius:15px;text-decoration:none;color:#333;font-size:12px}
    .pill.act{background:#1976d2;color:#fff}
    .card{background:#fff;padding:15px;border-radius:10px;margin-bottom:10px;border-right:5px solid #0d47a1}
    .card.note{border-right-color:#2e7d32}.card.exam{border-right-color:#e65100}
    input,select,textarea,button{width:100%;padding:10px;margin:4px 0;border-radius:6px;border:1px solid #ccc;box-sizing:border-box}
    button{background:#0d47a1;color:#fff;border:none;font-weight:bold}
    .btn{display:inline-block;background:#0d47a1;color:#fff;padding:7px 14px;border-radius:6px;text-decoration:none;font-size:13px}
    </style></head><body>
    <div class="hdr"><span>⚛️ <b>${user.name}</b> (${gNames[user.grade]})</span><a href="/out" style="background:#fff;color:#0d47a1;padding:5px 10px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:bold">خروج</a></div>
    ${adminUI}
    <div class="tabs">
        <a href="/?g=${g}&t=video" class="tab ${t==='video'?'act':''}">🎥 الفيديوهات</a>
        <a href="/?g=${g}&t=pdf" class="tab ${t==='pdf'?'act':''}">📄 المذكرات</a>
        <a href="/?g=${g}&t=note" class="tab ${t==='note'?'act':''}">📝 الملحوظات</a>
        <a href="/?g=${g}&t=exam" class="tab ${t==='exam'?'act':''}">✍️ الواجبات</a>
    </div>
    ${itemsHtml}
    <script>function tgl(){const v=document.getElementById('tp').value;document.getElementById('fb').style.display=(v==='video'||v==='pdf')?'block':'none';document.getElementById('tb').style.display=(v==='note'||v==='exam')?'block':'none';}</script>
    </body></html>`);
});

app.post('/login', (req, res) => {
    const c = req.body.code.trim();
    if (c === ADMIN_PASS) { res.setHeader('Set-Cookie', 'role=admin'); return res.redirect('/'); }
    const st = getDB().students.find(s => s.code === c);
    if (st) { res.setHeader('Set-Cookie', 'st=' + st.code); return res.redirect('/'); }
    res.redirect('/');
});
app.get('/out', (req, res) => { res.setHeader('Set-Cookie', ['role=;Max-Age=0', 'st=;Max-Age=0']); res.redirect('/'); });
app.post('/add-st', (req, res) => { if (getUser(req)?.role === 'admin') { const db = getDB(); db.students.push({ name: req.body.name, code: req.body.code.trim(), grade: req.body.grade }); saveDB(db); } res.redirect('/'); });
app.get('/del-st/:c', (req, res) => { if (getUser(req)?.role === 'admin') { const db = getDB(); db.students = db.students.filter(s => s.code !== req.params.c); saveDB(db); } res.redirect('/'); });
app.post('/add-item', upload.single('file'), (req, res) => {
    if (getUser(req)?.role === 'admin') {
        const db = getDB();
        let fn = '';
        if (req.file) { fn = Date.now() + '-' + req.file.originalname; fs.renameSync(req.file.path, './uploads/' + fn); }
        db.items.unshift({ id: Date.now().toString(), type: req.body.type, grade: req.body.grade, title: req.body.title, content: req.body.content || '', link: req.body.link || '', file: fn });
        saveDB(db);
    }
    res.redirect('/');
});
app.get('/del-item/:id', (req, res) => {
    if (getUser(req)?.role === 'admin') {
        const db = getDB();
        const it = db.items.find(x => x.id === req.params.id);
        if (it?.file && fs.existsSync('./uploads/' + it.file)) fs.unlinkSync('./uploads/' + it.file);
        db.items = db.items.filter(x => x.id !== req.params.id);
        saveDB(db);
    }
    res.redirect('/');
});

app.listen(process.env.PORT || 3000, () => console.log('✅ المنصة المنظمة شغالة 100%!'));

