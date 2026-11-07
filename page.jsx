'use client';
// app/login/page.jsx
// update539(Kingston · 登录页重设计 = app.quantmindnevo.ai):
//   方向:独立 AI 研究机构 · 展示面。第一眼是一个权威的机构落地页(不是 trading-card show),
//   login 只是干净入口 —— 点「Log in」弹出登录框浮在落地页上(推荐流程),不跳页、老用户一下就进。
//   · 配色沿用品牌:近黑藏蓝 #05070E + 电光蓝 #5B9CFF + 纯白 logo + 蓝色氛围光。
//   · 标题:The next evolution of / trading intelligence.(第二行衬线斜体压格调)。
//   · 右侧安静的推理节点图 + 「NEVO · cross-checking evidence ▌」状态(呼吸式闪,暗示引擎在思考)。
//   · 底部战绩条 24/7 · 7-layer · 100%。手机端:节点图/战绩收起,落地页收成紧凑,点按钮弹全屏登录卡。
//   逻辑层 100% 沿用旧版:Google OAuth / 邮箱登录注册 / 忘记密码 / EN·中文全站切换(setQmLang) /
//   Supabase / auth-event 上报。只换了视觉层与「把登录收进弹窗」。
//   待办(Kingston 之后给):① 「See the public track record」的真实公开 URL(现暂时也弹登录框);
//   ② 顶部 nav(Engine/Track record/Approach)目前是展示性标签,点了也弹登录框 —— 要接真实锚点/页面再说。
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { setQmLang } from '@/lib/i18n';

const CSS = `
:root{--bg:#05070E;--acc:#5B9CFF;--ink:#FFFFFF;--mut:#8FA3C8;--dim:#5F6B85;--line:#232B3D;--line2:#2C3550;--panel:rgba(10,15,28,.94)}
.ql *{box-sizing:border-box}
.ql{position:relative;min-height:100vh;min-height:100dvh;overflow-x:hidden;color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,"PingFang SC",sans-serif;-webkit-font-smoothing:antialiased;
  background:
    radial-gradient(1100px 640px at 50% 1%,rgba(74,110,190,.20),transparent 62%),
    radial-gradient(760px 520px at 8% 100%,rgba(60,86,160,.16),transparent 66%),
    radial-gradient(840px 560px at 94% 100%,rgba(60,86,160,.14),transparent 66%),
    var(--bg)}
.ql-grid{position:absolute;inset:0;z-index:0;pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);
  background-size:66px 66px;-webkit-mask:radial-gradient(1100px 680px at 34% 42%,#000 0%,transparent 78%);mask:radial-gradient(1100px 680px at 34% 42%,#000 0%,transparent 78%)}
/* reasoning node field — desktop only, right side */
.ql-nodes{position:absolute;right:2%;top:150px;width:460px;height:470px;z-index:1;opacity:.9;pointer-events:none}
.ql-nodes svg{position:absolute;inset:0;width:100%;height:100%}
.ql-nodes svg line{stroke:rgba(91,156,255,.22);stroke-width:1}
.ql-nodes svg circle{fill:rgba(91,156,255,.55)}
.ql-nd{position:absolute;display:flex;align-items:center;gap:8px;font-size:11px;color:var(--mut);background:rgba(13,20,36,.62);border:1px solid var(--line);border-radius:8px;padding:6px 11px;letter-spacing:.2px;white-space:nowrap}
.ql-nd i{width:5px;height:5px;border-radius:50%;background:var(--acc);box-shadow:0 0 8px var(--acc);animation:qlPulse 2.6s ease-in-out infinite}
.ql-status{position:absolute;right:2%;top:566px;z-index:1;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--dim);letter-spacing:.3px}
.ql-status b{color:#9FB6E6;font-weight:400}
.ql-status .cur{display:inline-block;width:7px;height:14px;background:#9FB6E6;margin-left:3px;vertical-align:-2px;animation:qlBlink 1.1s step-end infinite}
@keyframes qlPulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes qlBlink{0%,100%{opacity:1}50%{opacity:0}}
/* shell */
.ql-wrap{position:relative;z-index:3;max-width:1240px;margin:0 auto;padding:0 44px}
.ql-top{display:flex;align-items:center;height:78px}
.ql-bw{display:flex;align-items:center;gap:11px;font-size:17px;font-weight:300;letter-spacing:.4px}
.ql-bw img{width:26px;height:26px;border-radius:8px;box-shadow:0 0 16px rgba(59,123,255,.4)}
.ql-bw b{font-weight:200}.ql-bw .ai{color:var(--acc);font-weight:300}
.ql-nav{display:flex;gap:30px;margin-left:52px;font-size:13.5px;color:var(--mut)}
.ql-nav span{cursor:pointer;transition:color .15s}.ql-nav span:hover{color:var(--ink)}
.ql-right{margin-left:auto;display:flex;align-items:center;gap:18px}
.ql-lang{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--dim)}
.ql-lang span{cursor:pointer;font-weight:600}.ql-lang .on{color:var(--acc)}
.ql-loginbtn{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:500;color:#06080E;background:var(--ink);border-radius:10px;padding:9px 18px;cursor:pointer;transition:transform .15s}
.ql-loginbtn:active{transform:scale(.97)}
/* hero */
.ql-hero{max-width:640px;padding:84px 0 0}
.ql-eye{display:inline-flex;align-items:center;gap:9px;font-size:10.5px;letter-spacing:2.6px;color:var(--mut);text-transform:uppercase;border:1px solid var(--line);border-radius:999px;padding:6px 15px}
.ql-eye i{width:6px;height:6px;border-radius:50%;background:#4FB477;box-shadow:0 0 0 4px rgba(79,180,119,.14)}
.ql-h1{font-size:60px;line-height:1.05;letter-spacing:-1px;font-weight:200;margin:26px 0 0}
.ql-h1 .q{font-family:'Newsreader',Georgia,'Times New Roman',serif;font-weight:400;font-style:italic;color:#AEC6FF;letter-spacing:0}
.ql-sub{margin-top:24px;font-size:16.5px;line-height:1.72;color:var(--mut);max-width:560px;font-weight:300}
.ql-cta{display:flex;align-items:center;gap:24px;margin-top:38px;flex-wrap:wrap}
.ql-primary{display:inline-flex;align-items:center;gap:10px;font-size:15px;font-weight:500;color:#06080E;background:var(--ink);border-radius:12px;padding:14px 28px;cursor:pointer;transition:transform .15s}
.ql-primary:active{transform:scale(.98)}
.ql-ghost{font-size:14px;color:var(--mut);cursor:pointer;border-bottom:1px solid transparent;transition:color .15s}
.ql-ghost:hover{color:var(--ink)}
.ql-cred{display:flex;margin-top:70px;border-top:1px solid var(--line);max-width:640px}
.ql-cred .c{flex:1;padding:22px 0 40px}
.ql-cred .n{font-size:23px;font-weight:300;letter-spacing:-.3px}
.ql-cred .l{font-size:11.5px;color:var(--dim);margin-top:6px}
/* ===== login modal ===== */
.ql-ov{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:20px;
  background:rgba(3,5,11,.72);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);animation:qlFade .2s ease}
@keyframes qlFade{from{opacity:0}to{opacity:1}}
.ql-card{position:relative;width:100%;max-width:392px;background:var(--panel);border:1px solid var(--line);border-radius:22px;
  padding:34px 30px 26px;box-shadow:0 30px 80px rgba(0,0,0,.6);text-align:center;animation:qlPop .22s cubic-bezier(.2,.8,.2,1)}
@keyframes qlPop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}
.ql-x{position:absolute;top:14px;right:16px;width:30px;height:30px;border-radius:9px;border:1px solid var(--line);background:rgba(255,255,255,.03);color:var(--mut);font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}
.ql-x:hover{color:var(--ink)}
.ql-logowrap{position:relative;display:block;width:78px;height:78px;margin:4px auto 0}
.ql-logowrap i{position:absolute;inset:0;border-radius:20px;pointer-events:none}
.ql-logowrap i.a{box-shadow:0 0 21px 3px rgba(59,123,255,.28);animation:qlgA 3.6s ease-in-out infinite,qlgPop 3.6s ease-in-out infinite}
.ql-logowrap i.b{box-shadow:0 0 37px 8px rgba(91,156,255,.45);animation:qlgB 3.6s ease-in-out infinite,qlgPop 3.6s ease-in-out infinite}
.ql-logo{position:relative;display:block;width:100%;height:100%;border-radius:20px;object-fit:cover;animation:qlgPop 3.6s ease-in-out infinite}
@keyframes qlgA{0%,100%{opacity:1}50%{opacity:0}}@keyframes qlgB{0%,100%{opacity:0}50%{opacity:1}}@keyframes qlgPop{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
.ql-cname{margin-top:18px;font-size:25px;font-weight:200;letter-spacing:.3px}.ql-cname .ai{color:var(--acc);font-weight:300}
.ql-ctag{margin-top:9px;font-size:9px;letter-spacing:2.8px;color:rgba(255,255,255,.4);font-weight:300;line-height:1.7}
.ql-hint{margin-top:22px;font-size:12px;color:var(--mut);line-height:1.5}
.ql-gbtn{margin-top:14px;width:100%;height:50px;border:none;border-radius:14px;background:#F4F6FB;color:#0A0E17;
  font-family:inherit;font-size:15px;font-weight:500;letter-spacing:.3px;display:flex;align-items:center;justify-content:center;gap:11px;cursor:pointer;transition:transform .15s}
.ql-gbtn:active{transform:scale(.98)}.ql-gbtn:disabled{opacity:.7}
.ql-gbtn svg{width:18px;height:18px;flex:none}
.ql-or{display:flex;align-items:center;gap:12px;margin:18px 2px 0;color:var(--dim);font-size:11px;letter-spacing:1px}
.ql-or::before,.ql-or::after{content:"";flex:1;height:1px;background:var(--line)}
.ql-emaillink{margin-top:14px;font-size:12.5px;color:var(--acc);cursor:pointer}
.ql-err{margin-top:12px;font-size:12.5px;color:#E2726E}
.ql-ok{margin-top:12px;font-size:12.5px;color:#57C79C}
.ql-em{width:100%;margin-top:16px;border:1px solid var(--line);background:rgba(8,12,22,.7);border-radius:14px;padding:14px;text-align:left}
.ql-tabs{display:flex;gap:16px;font-size:13px;color:#5F6B85}
.ql-tabs b{cursor:pointer;font-weight:600}.ql-tabs .on{color:var(--acc)}
.ql-em label{display:block;font-size:10.5px;letter-spacing:1px;color:#5F6B85;margin:10px 0 4px}
.ql-em input{width:100%;height:38px;border-radius:10px;border:1px solid var(--line);background:#0A0F1C;color:#E8EDF7;padding:0 12px;font-size:13px;outline:none}
.ql-em input:focus{border-color:#3A4668}
.ql-em .row{display:flex;gap:8px;margin-top:12px}
.ql-em .row button{flex:1;height:38px;border-radius:10px;border:1px solid var(--line2);background:#131A2C;color:#C9D4E8;font-size:13px;cursor:pointer;font-family:inherit}
.ql-em .row button.pri{background:#4C6FDB;border:1px solid #4C6FDB;color:#F0F4FF;font-weight:600}
.ql-foot{margin-top:22px;font-size:10px;color:rgba(255,255,255,.4);line-height:1.8}
/* ===== mobile ===== */
@media (max-width:860px){
  .ql-nodes,.ql-status,.ql-grid{display:none}
  .ql-wrap{padding:0 20px}
  .ql-top{height:62px}
  .ql-nav{display:none}
  .ql-hero{padding:48px 0 0;max-width:100%}
  .ql-h1{font-size:40px;letter-spacing:-.5px;margin-top:22px}
  .ql-sub{font-size:15px;margin-top:20px}
  .ql-cta{margin-top:30px;gap:18px}
  .ql-primary{width:100%;justify-content:center}
  .ql-cred{margin-top:48px;flex-wrap:wrap}
  .ql-cred .c{flex:1 1 40%;padding:18px 0 10px}
  .ql-cred .n{font-size:20px}
  .ql-ov{align-items:flex-end;padding:0}
  .ql-card{max-width:100%;border-radius:22px 22px 0 0;padding:30px 22px calc(26px + env(safe-area-inset-bottom))}
}
`;

const TXT = {
  en: {
    navEngine: 'Engine', navTrack: 'Track record', navApproach: 'Approach',
    loginTop: 'Log in',
    eyebrow: 'Independent AI research engine',
    h1a: 'The next evolution of', h1b: 'trading intelligence.',
    sub: 'NEVO scans global markets without pause, cross-checks every piece of evidence, writes a layered report, and settles each call in public — the discipline of a research desk, run end-to-end by one engine.',
    cta: 'Log in to QuantMind', ghost: 'See the public track record',
    n1: 'Market structure', n2: 'Macro · real yields', n3: 'Cross-market', n4: 'Risk regime',
    status: 'cross-checking evidence',
    c1: '24/7', c1l: 'Continuous market scanning',
    c2: '7-layer', c2l: 'Evidence cross-checked',
    c3: '100%', c3l: 'Every call settled in public',
    mtag: 'THE NEXT EVOLUTION OF TRADING INTELLIGENCE',
    hint: 'Sign in or sign up in one step · Secured by Google',
    gbtn: 'Continue with Google', busy: 'Redirecting…',
    emaillink: 'Continue with email →',
    tIn: 'Sign in', tUp: 'Sign up', emailL: 'EMAIL', passL: 'PASSWORD', pass2L: 'CONFIRM PASSWORD',
    doIn: 'Sign in', doUp: 'Create account', forgot: 'Forgot password', processing: 'Processing…',
    phPass: 'Your password', phPass2: 'Re-enter password', phPassUp: 'At least 6 characters',
    foot1: 'By continuing you agree to our Terms of Service and Privacy Policy',
    foot2: 'AI analysis only · Not investment advice',
    eNeed: 'Enter your email and password', eLen: 'Password must be at least 6 characters',
    eMatch: 'Passwords do not match', eBad: 'Wrong email or password',
    eFirst: 'Enter your email above first, then tap Forgot password',
    okUp: 'Account created! Check your inbox to confirm, then sign in.',
    okReset: 'Password reset email sent — please check your inbox.',
  },
  zh: {
    navEngine: '引擎', navTrack: '公开战绩', navApproach: '研究方法',
    loginTop: '登录',
    eyebrow: '独立 AI 研究引擎',
    h1a: 'The next evolution of', h1b: 'trading intelligence.',
    sub: 'NEVO 全天候扫描全球市场，交叉验证每一项证据，写出分层研判报告，并把每一个判断公开结算 —— 一支研究台的纪律，由一个引擎端到端完成。',
    cta: '登录 QuantMind', ghost: '查看公开战绩',
    n1: '市场结构', n2: '宏观 · 实际利率', n3: '跨市场', n4: '风险状态',
    status: 'cross-checking evidence',
    c1: '24/7', c1l: '全天候市场扫描',
    c2: '7 层', c2l: '证据交叉验证',
    c3: '100%', c3l: '每个判断公开结算',
    mtag: 'THE NEXT EVOLUTION OF TRADING INTELLIGENCE',
    hint: '登录与注册一步完成 · 由 Google 安全验证',
    gbtn: '使用 Google 继续', busy: '跳转中…',
    emaillink: '使用邮箱继续 →',
    tIn: '登录', tUp: '注册', emailL: '邮箱', passL: '密码', pass2L: '确认密码',
    doIn: '登录', doUp: '创建账号', forgot: '忘记密码', processing: '处理中…',
    phPass: '你的密码', phPass2: '再输入一次密码', phPassUp: '至少 6 位',
    foot1: '继续即表示您同意我们的服务条款和隐私政策',
    foot2: 'AI analysis only · 非投资建议',
    eNeed: '请输入邮箱和密码', eLen: '密码至少 6 位',
    eMatch: '两次密码不一致', eBad: '邮箱或密码错误',
    eFirst: '先在上方填写你的邮箱，再点忘记密码',
    okUp: '注册成功！请到邮箱点击确认链接后再登录。',
    okReset: '重设密码邮件已发送，请查收邮箱。',
  },
};

function authReason(err) {
  const m = String((err && err.message) || '').toLowerCase();
  if (m.indexOf('invalid login') >= 0) return 'bad_credentials';
  if (m.indexOf('not confirmed') >= 0) return 'unconfirmed';
  if (m.indexOf('rate limit') >= 0 || m.indexOf('too many') >= 0) return 'rate_limited';
  return 'other';
}
function reportAuth(payload) {
  try {
    fetch('/api/auth-event', { method: 'POST', headers: { 'content-type': 'application/json' }, keepalive: true, credentials: 'same-origin', body: JSON.stringify(payload) }).catch(function () {});
  } catch (e) {}
}

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState('en');       // update534:登录页默认英文
  const [modal, setModal] = useState(false);     // update539:登录弹窗
  const [showEmail, setShowEmail] = useState(false);
  const [tab, setTab] = useState('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const l = localStorage.getItem('qm_lang');
      if (l === 'en' || l === 'zh') setLang(l);
      const s = window.location.search;
      if (s.indexOf('email=1') > -1) { setModal(true); setShowEmail(true); }
      else if (s.indexOf('login=1') > -1) setModal(true);
    } catch (e) {}
  }, []);

  // update539:弹窗开着时锁背景滚动 + Esc 关闭
  useEffect(() => {
    if (!modal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setModal(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [modal]);

  const t = TXT[lang];
  const setL = (l) => { setLang(l); setQmLang(l); };
  const openLogin = () => { setErr(''); setOk(''); setModal(true); };

  const google = async () => {
    setErr(''); setOk(''); setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
    if (error) { setErr('Google: ' + error.message); setBusy(false); }
  };

  const submit = async () => {
    setErr(''); setOk('');
    if (!email || !password) { setErr(t.eNeed); return; }
    if (tab === 'up' && password.length < 6) { setErr(t.eLen); return; }
    if (tab === 'up' && password !== pw2) { setErr(t.eMatch); return; }
    setBusy(true);
    const supabase = createClient();
    try {
      if (tab === 'in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { reportAuth({ type: 'fail', email: email, reason: authReason(error) }); throw error; }
        reportAuth({ type: 'ok' });
        router.push('/');
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          router.push('/');
          router.refresh();
        } else {
          setOk(t.okUp);
        }
      }
    } catch (e) {
      setErr(e.message === 'Invalid login credentials' ? t.eBad : e.message);
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    setErr(''); setOk('');
    if (!email) { setErr(t.eFirst); return; }
    const supabase = createClient();
    reportAuth({ type: 'reset', email: email });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/callback?next=/reset-password',
    });
    if (error) setErr(error.message);
    else setOk(t.okReset);
  };

  return (
    <div className="ql">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ql-grid" />

      {/* reasoning node field (desktop) */}
      <div className="ql-nodes">
        <svg viewBox="0 0 460 470" preserveAspectRatio="none" aria-hidden="true">
          <line x1="70" y1="40" x2="250" y2="130" /><line x1="250" y1="130" x2="150" y2="290" /><line x1="250" y1="130" x2="400" y2="210" />
          <line x1="150" y1="290" x2="350" y2="360" /><line x1="400" y1="210" x2="350" y2="360" /><line x1="70" y1="40" x2="150" y2="290" />
          <circle cx="70" cy="40" r="3" /><circle cx="250" cy="130" r="4.5" /><circle cx="150" cy="290" r="3" /><circle cx="400" cy="210" r="3.5" /><circle cx="350" cy="360" r="3" />
        </svg>
        <div className="ql-nd" style={{ left: 170, top: 108 }}><i />{t.n1}</div>
        <div className="ql-nd" style={{ left: 60, top: 268 }}><i />{t.n2}</div>
        <div className="ql-nd" style={{ left: 300, top: 190 }}><i />{t.n3}</div>
        <div className="ql-nd" style={{ left: 268, top: 342 }}><i />{t.n4}</div>
      </div>
      <div className="ql-status">NEVO · <b>{t.status}</b><span className="cur" /></div>

      <div className="ql-wrap">
        <div className="ql-top">
          <div className="ql-bw"><img src="/icons/qm-192.png" alt="QuantMind" /><b>QuantMind</b><span className="ai">.AI</span></div>
          <div className="ql-nav">
            <span onClick={openLogin}>{t.navEngine}</span>
            <span onClick={openLogin}>{t.navTrack}</span>
            <span onClick={openLogin}>{t.navApproach}</span>
          </div>
          <div className="ql-right">
            <div className="ql-lang">
              <span className={lang === 'en' ? 'on' : ''} onClick={() => setL('en')}>EN</span>
              <span style={{ color: '#2C3550' }}>·</span>
              <span className={lang === 'zh' ? 'on' : ''} onClick={() => setL('zh')}>中</span>
            </div>
            <span className="ql-loginbtn" onClick={openLogin}>{t.loginTop} →</span>
          </div>
        </div>

        <div className="ql-hero">
          <span className="ql-eye"><i />{t.eyebrow}</span>
          <h1 className="ql-h1">{t.h1a}<br /><span className="q">{t.h1b}</span></h1>
          <div className="ql-sub">{t.sub}</div>
          <div className="ql-cta">
            <span className="ql-primary" onClick={openLogin}>{t.cta} →</span>
            <span className="ql-ghost" onClick={openLogin}>{t.ghost}</span>
          </div>
          <div className="ql-cred">
            <div className="c"><div className="n">{t.c1}</div><div className="l">{t.c1l}</div></div>
            <div className="c"><div className="n">{t.c2}</div><div className="l">{t.c2l}</div></div>
            <div className="c"><div className="n">{t.c3}</div><div className="l">{t.c3l}</div></div>
          </div>
        </div>
      </div>

      {/* ===== login modal ===== */}
      {modal && (
        <div className="ql-ov" onClick={() => setModal(false)}>
          <div className="ql-card" onClick={(e) => e.stopPropagation()}>
            <button className="ql-x" onClick={() => setModal(false)} aria-label="Close">×</button>
            <span className="ql-logowrap">
              <i className="a" aria-hidden="true" />
              <i className="b" aria-hidden="true" />
              <img className="ql-logo" src="/icons/qm-192.png" alt="QuantMind" />
            </span>
            <div className="ql-cname">QuantMind<span className="ai">.AI</span></div>
            <div className="ql-ctag">{t.mtag}</div>
            <div className="ql-hint">{t.hint}</div>
            <button className="ql-gbtn" disabled={busy} onClick={google}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.4-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41 35.2 44 30 44 24c0-1.2-.1-2.4-.4-3.5z" /></svg>
              {busy ? t.busy : t.gbtn}
            </button>
            {err && <div className="ql-err">{err}</div>}
            {ok && <div className="ql-ok">{ok}</div>}
            {!showEmail && <div className="ql-or">OR</div>}
            {!showEmail && <div className="ql-emaillink" onClick={() => { setShowEmail(true); setErr(''); setOk(''); }}>{t.emaillink}</div>}
            {showEmail && (
              <div className="ql-em">
                <div className="ql-tabs">
                  <b className={tab === 'in' ? 'on' : ''} onClick={() => { setTab('in'); setErr(''); setOk(''); }}>{t.tIn}</b>
                  <b className={tab === 'up' ? 'on' : ''} onClick={() => { setTab('up'); setErr(''); setOk(''); }}>{t.tUp}</b>
                </div>
                <label>{t.emailL}</label>
                <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                <label>{t.passL}</label>
                <input type="password" autoComplete={tab === 'in' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder={tab === 'up' ? t.phPassUp : t.phPass} />
                {tab === 'up' && (
                  <div>
                    <label>{t.pass2L}</label>
                    <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder={t.phPass2} />
                  </div>
                )}
                <div className="row">
                  <button className="pri" disabled={busy} onClick={submit}>{busy ? t.processing : tab === 'in' ? t.doIn : t.doUp}</button>
                  {tab === 'in' && <button onClick={forgot}>{t.forgot}</button>}
                </div>
              </div>
            )}
            <div className="ql-foot">{t.foot1}<br />{t.foot2}</div>
          </div>
        </div>
      )}
    </div>
  );
}
