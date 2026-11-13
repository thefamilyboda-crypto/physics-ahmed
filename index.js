const Jimp = require("jimp");
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const app = express();
const ADMIN_PASS = "mohamed123";

if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
const upload = multer({ dest: './uploads/' });
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

const dbFile = './data.json';
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ students: [], items: [] }));
const getDB = () => JSON.parse(fs.readFileSync(dbFile));
const saveDB = (d) => fs.writeFileSync(dbFile, JSON.stringify(d));

const gNames = {
    'p4': 'الصف الرابع الابتدائي', 'p5': 'الصف الخامس الابتدائي', 'p6': 'الصف السادس الابتدائي',
    'm1': 'الصف الأول الإعدادي', 'm2': 'الصف الثاني الإعدادي', 'm3': 'الصف الثالث الإعدادي',
    's1': 'الصف الأول الثانوي', 's2': 'الصف الثاني الثانوي', 'all': 'جميع الصفوف'
};

function getUser(req) {
    const c = req.headers.cookie || '';
    if (c.includes('role=admin')) return { role: 'admin', name: 'المستر محمد شعبان نصر', grade: 'all' };
    const m = c.match(/st=([^;]+)/);
    if (m) {
        const st = getDB().students.find(s => s.code === m);
        if (st) return { role: 'student', name: st.name, grade: st.grade };
    }
    return null;
}

let cachedIcon = null;
app.get("/icon.png", async (req, res) => {
  try {
    if (!cachedIcon) {
      const img = new Jimp(512, 512, 0x0f172aff);
      const cx = 256, cy = 256;
      img.scan(0, 0, 512, 512, function(x, y, idx) {
        const dx = Math.abs(x - cx), dy = Math.abs(y - cy), d = Math.sqrt(dx*dx + dy*dy);
        if (d > 195 && d < 215) this.bitmap.data.writeUInt32BE(0xf59e0bff, idx);
        else if (dx < 120 && dy < 120 && (dx > 102 || dy > 102)) this.bitmap.data.writeUInt32BE(0x10b981ff, idx);
        else if (d < 45) this.bitmap.data.writeUInt32BE(0xf59e0bff, idx);
      });
      cachedIcon = await img.getBufferAsync(Jimp.MIME_PNG);
    }
    res.writeHead(200, { "Content-Type": "image/png", "Content-Length": cachedIcon.length });
    res.end(cachedIcon);
  } catch (e) { res.status(500).end(); }
});

app.get("/manifest.json", (req, res) => {
  res.json({
    name: "منصة المستر محمد شعبان نصر للرياضيات", short_name: "مستر محمد شعبان",
    start_url: "/", display: "standalone", background_color: "#0f172a", theme_color: "#d97706",
    icons: [{ src: "/icon.png", sizes: "192x192", type: "image/png" }, { src: "/icon.png", sizes: "512x512", type: "image/png" }]
  });
});

app.get("/sw.js", (req, res) => { res.type("application/javascript"); res.send("self.addEventListener(\"fetch\", () => {});"); });
app.get('/', (req, res) => {
    const user = getUser(req);
    if (!user) return res.send(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>منصة المستر محمد شعبان نصر للرياضيات</title>
<link href="https://googleapis.com" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:"Cairo",Tahoma,sans-serif}
body{background:#090d16;color:#f8fafc;overflow-x:hidden;line-height:1.6;background-image:radial-gradient(rgba(245,158,11,0.08) 1px, transparent 1px);background-size:28px 28px}
.bg-glow{position:fixed;top:-120px;right:-120px;width:420px;height:420px;background:radial-gradient(circle,rgba(245,158,11,0.22) 0%,rgba(9,13,22,0) 70%);z-index:-1}
.bg-glow2{position:fixed;bottom:-120px;left:-120px;width:420px;height:420px;background:radial-gradient(circle,rgba(16,185,129,0.18) 0%,rgba(9,13,22,0) 70%);z-index:-1}
header{display:flex;justify-content:space-between;align-items:center;padding:16px 6%;background:rgba(15,23,42,0.9);backdrop-filter:blur(12px);border-bottom:1px solid rgba(245,158,11,0.2);position:sticky;top:0;z-index:100}
.logo{font-size:1.2rem;font-weight:800;color:#fbbf24;display:flex;align-items:center;gap:8px}
.nav-btn{background:linear-gradient(135deg,#f59e0b,#d97706);color:#0f172a;padding:8px 18px;border-radius:10px;text-decoration:none;font-weight:800;font-size:0.9rem}
.hero{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;padding:45px 6%;gap:35px;max-width:1200px;margin:auto}
.hero-text{flex:1;min-width:280px}
.badge{display:inline-block;background:rgba(245,158,11,0.15);color:#fbbf24;padding:6px 16px;border-radius:20px;font-size:0.85rem;font-weight:700;margin-bottom:15px;border:1px solid rgba(245,158,11,0.35)}
.hero-text h1{font-size:2.1rem;font-weight:800;margin-bottom:15px;line-height:1.35}
.hero-text h1 span{color:#fbbf24}
.hero-text p{color:#cbd5e1;font-size:1rem;margin-bottom:25px}
.stats{display:flex;gap:15px;margin-top:20px;flex-wrap:wrap}
.stat{background:rgba(30,41,59,0.6);padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.06)}
.stat h3{color:#10b981;font-size:1.25rem;font-weight:800}
.stat span{color:#94a3b8;font-size:0.85rem}
.login-box{flex:1;min-width:280px;max-width:400px;background:rgba(15,23,42,0.95);border:1px solid rgba(245,158,11,0.35);padding:30px 22px;border-radius:20px;box-shadow:0 20px 50px rgba(0,0,0,0.5);margin:auto}
.login-box h2{text-align:center;color:#fbbf24;margin-bottom:8px;font-size:1.4rem}
.login-box p{text-align:center;color:#94a3b8;font-size:0.9rem;margin-bottom:20px}
input{width:100%;padding:14px;border-radius:12px;border:1px solid #334155;background:#1e293b;color:#fff;font-size:1rem;margin-bottom:15px;text-align:center;outline:none}
button{width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#0f172a;font-size:1.05rem;font-weight:800;cursor:pointer}
.section{padding:40px 6%;max-width:1200px;margin:auto}
.sec-title{text-align:center;font-size:1.65rem;font-weight:800;margin-bottom:25px}
.sec-title span{color:#fbbf24}
.grades-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:35px}
.grade-card{background:linear-gradient(145deg,#1e293b,#0f172a);border:1px solid rgba(245,158,11,0.25);padding:18px;border-radius:14px;text-align:center}
.grade-card .stage{font-size:0.78rem;color:#10b981;font-weight:700;margin-bottom:4px}
.grade-card h4{color:#fff;font-size:1.05rem}
footer{text-align:center;padding:25px;border-top:1px solid rgba(255,255,255,0.08);color:#64748b;font-size:0.9rem;margin-top:30px}
</style>
<link rel="manifest" href="/manifest.json"><link rel="icon" href="/icon.png"><meta name="theme-color" content="#d97706"></head>
<body>
<div class="bg-glow"></div><div class="bg-glow2"></div>
<header><div class="logo">📐 منصة المستر محمد شعبان نصر</div><a href="#login" class="nav-btn">دخول الطلاب</a></header>
<section class="hero">
  <div class="hero-text">
    <div class="badge">∑ طريقك للتفوق في الرياضيات</div>
    <h1>افهم الرياضيات بمتعة مع <span>المستر محمد شعبان نصر</span></h1>
    <p>منصة تعليمية متكاملة لتأسيس وتفوق الطلاب من الصف الرابع الابتدائي وحتى الصف الثاني الثانوي. شرح مبسط، تأسيس قوي، واختبارات مستمرة.</p>
    <div class="stats">
      <div class="stat"><h3>4 ابتدائي ➔ 2 ثانوي</h3><span>جميع المراحل الدراسية</span></div>
      <div class="stat"><h3>جبر وهندسة</h3><span>شرح تأسيس واحتراف</span></div>
    </div>
  </div>
  <div class="login-box" id="login">
    <h2>بوابة الدخول 🔐</h2>
    <p>أدخل كود الطالب لفتح حصصك ومذكراتك</p>
    <form action="/login" method="POST">
      <input name="code" placeholder="اكتب كود الطالب هنا..." required autocomplete="off">
      <button type="submit">دخول المنصة 📐</button>
    </form>
  </div>
</section>
<section class="section">
  <h2 class="sec-title">الصفوف <span>الدراسية المتاحة</span></h2>
  <div class="grades-grid">
    <div class="grade-card"><div class="stage">المرحلة الابتدائية</div><h4>الصف الرابع الابتدائي</h4></div>
    <div class="grade-card"><div class="stage">المرحلة الابتدائية</div><h4>الصف الخامس الابتدائي</h4></div>
    <div class="grade-card"><div class="stage">المرحلة الابتدائية</div><h4>الصف السادس الابتدائي</h4></div>
    <div class="grade-card"><div class="stage">المرحلة الإعدادية</div><h4>الصف الأول الإعدادي</h4></div>
    <div class="grade-card"><div class="stage">المرحلة الإعدادية</div><h4>الصف الثاني الإعدادي</h4></div>
    <div class="grade-card"><div class="stage">المرحلة الإعدادية</div><h4>الصف الثالث الإعدادي</h4></div>
    <div class="grade-card"><div class="stage">المرحلة الثانوية</div><h4>الصف الأول الثانوي</h4></div>
    <div class="grade-card"><div class="stage">المرحلة الثانوية</div><h4>الصف الثاني الثانوي</h4></div>
  </div>
</section>
<footer>جميع الحقوق محفوظة © منصة المستر محمد شعبان نصر للرياضيات</footer>
</body></html>`);
