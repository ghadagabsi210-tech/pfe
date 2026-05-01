/* ============================================================ */
/* 💙 ESIP AI ASSISTANT – Auto-Lang · FR / EN / Derja           */
/* ============================================================ */

(async function () {
    const API_KEY = "AIzaSyAtjHezOY9Hq85xRqMCZ-NxDaxuEZvcE7g";
    const ROBOT   = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png";
    const MODELS  = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-2.0-flash-lite"];

    let db;
    let history = []; // conversation history
    let currentFile = null;

    // ── Firebase ───────────────────────────────────────────────
    try {
        const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
        const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
        const cfg = { apiKey: "AIzaSyD56AbWLar8R7qe4x__3a8dfZop6A1jew0", projectId: "pfe2026-2cd50" };
        const app = getApps().length ? getApps()[0] : initializeApp(cfg);
        db = getFirestore(app);
    } catch (_) {}

    // ── Markdown ───────────────────────────────────────────────
    function md(text) {
        return text
            .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
            .replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")
            .replace(/\*(.+?)\*/g,"<i>$1</i>")
            .replace(/`(.+?)`/g,"<code style='background:#f0f4ff;padding:1px 5px;border-radius:4px;color:#1e40af;font-family:monospace'>$1</code>")
            .replace(/^\- (.+)$/gm,"<li>$1</li>")
            .replace(/(<li>[\s\S]*?<\/li>)/g,"<ul style='margin:4px 0;padding-left:18px'>$1</ul>")
            .replace(/\n/g,"<br>");
    }

    // ── Gemini API call ────────────────────────────────────────
    async function ask(userText, imageData, imageMime) {
        // Build user parts
        const userParts = [];
        if (userText) userParts.push({ text: userText });
        if (imageData) userParts.push({ inline_data: { mime_type: imageMime, data: imageData } });

        // Add to history
        history.push({ role: "user", parts: userParts });
        if (history.length > 20) history = history.slice(-20);

        // Payload: system as first user/model pair + history
        const SYSTEM = `Tu es l'assistant IA de l'ESIP Gafsa (Tunisie). Règles :
1. Détecte automatiquement la langue de l'utilisateur et réponds dans la MÊME langue.
2. Si l'utilisateur parle Derja Tunisienne (arabe tunisien) → réponds en Derja.
3. Tu connais l'ESIP Gafsa : filières GL, IA, RS, MIC ; niveaux 1ère/2ème/3ème année.
4. Pour les questions générales, réponds normalement comme un assistant intelligent.
5. Sois concis, sympathique, utilise peu d'émojis.`;

        const payload = {
            system_instruction: { parts: [{ text: SYSTEM }] },
            contents: history
        };

        // Try each model
        for (let i = 0; i < MODELS.length; i++) {
            try {
                const res  = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${MODELS[i]}:generateContent?key=${API_KEY}`,
                    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
                );
                const data = await res.json();

                console.log(`[ESIP AI] model=${MODELS[i]} status=`, res.status, data.error || "OK");

                // Quota → try next model
                if (data.error?.code === 429 || data.error?.status === "RESOURCE_EXHAUSTED") {
                    if (i < MODELS.length - 1) continue;
                    const m = (data.error.message || "").match(/retry in (\d+\.?\d*)s/i);
                    return { quota: true, wait: m ? Math.ceil(+m[1]) : 60 };
                }

                // Any other error → try next model
                if (data.error) {
                    console.error("[ESIP AI] API Error:", JSON.stringify(data.error));
                    if (i < MODELS.length - 1) continue;
                    return { error: true, msg: data.error.message };
                }

                // Success
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    history.push({ role: "model", parts: [{ text }] });
                    return { text };
                }
                // Blocked or empty
                const reason = data.candidates?.[0]?.finishReason;
                console.warn("[ESIP AI] No text, finishReason:", reason);
                if (i < MODELS.length - 1) continue;
                return { error: true };

            } catch (e) {
                console.error("[ESIP AI] Fetch error:", e.message);
                if (i < MODELS.length - 1) continue;
                return { error: true };
            }
        }
        return { error: true };
    }

    // ── UI ─────────────────────────────────────────────────────
    function setupUI() {
        if (document.getElementById("esipCont")) return;

        const style = document.createElement("style");
        style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        #esipCont * { font-family:'Inter','Segoe UI',sans-serif; box-sizing:border-box; }

        #esipBtn {
            width:68px; height:68px; border-radius:50%; background:#fff;
            border:3px solid #1e40af; display:flex; align-items:center; justify-content:center;
            cursor:pointer; box-shadow:0 8px 32px rgba(30,64,175,.3); transition:.25s; position:relative;
        }
        #esipBtn:hover { transform:scale(1.1); }
        #esipBtn img { width:42px; height:42px; }
        .esip-pulse { position:absolute; inset:-4px; border-radius:50%; border:3px solid rgba(59,130,246,.35); animation:epulse 2s infinite; }
        @keyframes epulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.18);opacity:0} }

        #esipBox {
            display:none; flex-direction:column; position:absolute;
            bottom:80px; right:0; width:400px; height:620px;
            background:#fff; border-radius:26px;
            box-shadow:0 30px 80px rgba(0,0,0,.18); border:1px solid #e2e8f0;
            overflow:hidden; transition:opacity .3s,transform .3s;
            opacity:0; transform:translateY(18px) scale(.97);
        }
        #esipBox.open    { display:flex; }
        #esipBox.visible { opacity:1; transform:none; }

        .e-head {
            background:linear-gradient(135deg,#0f172a,#1e3a8a);
            padding:16px 20px; display:flex; align-items:center; gap:12px; flex-shrink:0;
        }
        .e-logo { width:42px; height:42px; border-radius:50%; background:rgba(255,255,255,.12); border:2px solid rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .e-logo img { width:28px; height:28px; filter:brightness(0) invert(1); }
        .e-title { color:#fff; font-weight:700; font-size:15px; }
        .e-sub { color:rgba(255,255,255,.5); font-size:11px; margin-top:2px; display:flex; align-items:center; gap:5px; }
        .e-dot { width:7px; height:7px; border-radius:50%; background:#22c55e; animation:blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .e-close { margin-left:auto; color:rgba(255,255,255,.45); font-size:20px; cursor:pointer; width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; transition:.2s; }
        .e-close:hover { background:rgba(255,255,255,.1); color:#fff; }
        #esipClear { margin-left:auto; background:transparent; border:1px solid rgba(255,255,255,.2); color:rgba(255,255,255,.5); font-size:11px; padding:3px 10px; border-radius:12px; cursor:pointer; transition:.2s; }
        #esipClear:hover { background:rgba(255,255,255,.1); color:#fff; }

        #esipMsgs {
            flex:1; overflow-y:auto; padding:18px 16px; display:flex; flex-direction:column; gap:12px; background:#f8fafc;
            scrollbar-width:thin; scrollbar-color:#cbd5e1 transparent;
        }
        #esipMsgs::-webkit-scrollbar { width:4px; }
        #esipMsgs::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }

        .e-row { display:flex; gap:8px; align-items:flex-end; }
        .e-row.u { flex-direction:row-reverse; }
        .e-ico { width:30px; height:30px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .e-ico.a { background:#fff; border:2px solid #dbeafe; }
        .e-ico.a img { width:20px; height:20px; }
        .e-ico.u { background:linear-gradient(135deg,#1e40af,#3b82f6); font-size:14px; }
        .e-bbl { padding:11px 14px; border-radius:18px; font-size:13.5px; line-height:1.6; max-width:80%; animation:bpop .22s ease; }
        @keyframes bpop { from{opacity:0;transform:scale(.92) translateY(6px)} to{opacity:1;transform:none} }
        .e-bbl.a { background:#fff; color:#1e293b; border:1px solid #e2e8f0; border-bottom-left-radius:4px; box-shadow:0 2px 6px rgba(0,0,0,.05); }
        .e-bbl.u { background:linear-gradient(135deg,#1e40af,#2563eb); color:#fff; border-bottom-right-radius:4px; box-shadow:0 4px 12px rgba(30,64,175,.3); }
        .e-bbl.w { background:#fffbeb; border:1px solid #fcd34d; color:#92400e; border-radius:14px; font-size:13px; }
        .tdot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#93c5fd; margin:0 2px; animation:td 1.2s infinite; }
        .tdot:nth-child(2){animation-delay:.2s} .tdot:nth-child(3){animation-delay:.4s}
        @keyframes td { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }

        #esipPrev { display:none; padding:8px 16px; background:#fff; border-top:1px solid #e2e8f0; align-items:center; gap:8px; flex-shrink:0; }
        #esipPrev img { height:50px; border-radius:8px; border:2px solid #dbeafe; }
        #esipPClear { color:#ef4444; font-size:12px; cursor:pointer; padding:2px 8px; border-radius:10px; border:1px solid #fca5a5; background:transparent; }

        .e-foot { padding:12px 14px; background:#fff; border-top:1px solid #e2e8f0; display:flex; gap:8px; align-items:center; flex-shrink:0; }
        #esipInp { flex:1; background:#f1f5f9; border:1.5px solid transparent; border-radius:14px; padding:10px 14px; font-size:14px; outline:none; resize:none; max-height:100px; line-height:1.5; transition:border .2s; }
        #esipInp:focus { border-color:#3b82f6; background:#fff; }
        #esipInp::placeholder { color:#94a3b8; }
        .e-ibtn { width:38px; height:38px; border-radius:11px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:.2s; flex-shrink:0; }
        #esipFile-btn { background:#f1f5f9; color:#64748b; }
        #esipFile-btn:hover { background:#dbeafe; color:#1e40af; }
        #esipSend { background:linear-gradient(135deg,#1e40af,#3b82f6); box-shadow:0 4px 12px rgba(30,64,175,.35); }
        #esipSend:hover { transform:scale(1.08); }
        #esipSend:disabled { opacity:.4; transform:none; cursor:not-allowed; }
        `;
        document.head.appendChild(style);

        const wrap = document.createElement("div");
        wrap.id = "esipCont";
        wrap.style.cssText = "position:fixed;bottom:26px;right:26px;z-index:999999;";
        wrap.innerHTML = `
            <div id="esipBtn"><div class="esip-pulse"></div><img src="${ROBOT}" alt="AI"></div>
            <div id="esipBox">
                <div class="e-head">
                    <div class="e-logo"><img src="${ROBOT}" alt="bot"></div>
                    <div>
                        <div class="e-title">Expert ESIP-AI</div>
                        <div class="e-sub"><span class="e-dot"></span>Répond en FR · EN · Derja auto</div>
                    </div>
                    <button id="esipClear">🗑 Effacer</button>
                    <div class="e-close" id="esipClose">✕</div>
                </div>
                <div id="esipMsgs"></div>
                <div id="esipPrev">
                    <img id="esipPImg" alt="">
                    <button id="esipPClear">✕</button>
                </div>
                <div class="e-foot">
                    <label for="esipFile" style="cursor:pointer;">
                        <div class="e-ibtn" id="esipFile-btn" title="Image">📎</div>
                    </label>
                    <input type="file" id="esipFile" accept="image/*" style="display:none;">
                    <textarea id="esipInp" rows="1" placeholder="Écrivez votre question..."></textarea>
                    <button class="e-ibtn" id="esipSend">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                    </button>
                </div>
            </div>`;
        document.body.appendChild(wrap);

        const btn  = document.getElementById("esipBtn");
        const box  = document.getElementById("esipBox");
        const msgs = document.getElementById("esipMsgs");
        const inp  = document.getElementById("esipInp");
        const send = document.getElementById("esipSend");
        const prev = document.getElementById("esipPrev");
        const pImg = document.getElementById("esipPImg");
        const file = document.getElementById("esipFile");

        // Welcome
        addMsg("a", "Bonjour ! 👋 Je suis votre assistant IA de l'ESIP Gafsa. Comment puis-je vous aider ?");

        // Toggle
        btn.onclick = () => {
            if (!box.classList.contains("open")) {
                box.classList.add("open");
                setTimeout(() => box.classList.add("visible"), 10);
            } else {
                box.classList.remove("visible");
                setTimeout(() => box.classList.remove("open"), 300);
            }
        };
        document.getElementById("esipClose").onclick = () => btn.click();

        // Clear
        document.getElementById("esipClear").onclick = () => {
            msgs.innerHTML = "";
            history = [];
            addMsg("a", "Bonjour ! 👋 Je suis votre assistant IA de l'ESIP Gafsa. Comment puis-je vous aider ?");
        };

        // File attach
        file.onchange = e => {
            const f = e.target.files[0];
            if (!f) return;
            currentFile = f;
            const r = new FileReader();
            r.onload = ev => { pImg.src = ev.target.result; prev.style.display = "flex"; };
            r.readAsDataURL(f);
        };
        document.getElementById("esipPClear").onclick = () => {
            currentFile = null; prev.style.display = "none"; pImg.src = ""; file.value = "";
        };

        // Auto resize
        inp.oninput = () => { inp.style.height = "auto"; inp.style.height = Math.min(inp.scrollHeight, 100) + "px"; };
        inp.onkeydown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } };
        send.onclick = go;

        // ── Send message ──────────────────────────────────────
        async function go() {
            const text = inp.value.trim();
            if (!text && !currentFile) return;

            addMsg("u", text || "📷 Image");
            inp.value = ""; inp.style.height = "auto";

            const imgSrc  = pImg.src;
            const imgMime = currentFile?.type;
            const imgB64  = imgSrc && imgSrc.includes(",") ? imgSrc.split(",")[1] : null;
            prev.style.display = "none";
            send.disabled = true;

            const loader = addTyping();

            const result = await ask(text, imgB64, imgMime);
            loader.remove();

            if (result.text) {
                addMsg("a", result.text, true);
                // Save to Firebase
                if (db) {
                    try {
                        const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
                        const docRef = await addDoc(collection(db, "chatbot"), {
                            question : text,
                            reponse  : result.text,
                            page     : window.location.pathname,
                            date     : serverTimestamp()
                        });
                        console.log("[ESIP AI] ✅ Saved to Firebase:", docRef.id);
                    } catch (fbErr) {
                        console.error("[ESIP AI] ❌ Firebase save error:", fbErr.message);
                    }
                } else {
                    console.warn("[ESIP AI] ⚠️ Firebase not initialized, skipping save.");
                }
            } else if (result.quota) {
                // Countdown + auto retry
                let sec = result.wait;
                const wRow = addWait(sec);
                const iv = setInterval(() => { sec--; updateWait(wRow, sec); if (sec <= 0) clearInterval(iv); }, 1000);
                await new Promise(r => setTimeout(r, result.wait * 1000));
                wRow.remove();
                const rl = addTyping();
                const r2 = await ask(text, imgB64, imgMime);
                rl.remove();
                addMsg("a", r2.text || "Désolé, réessayez dans quelques instants.", !!r2.text);
            } else {
                addMsg("a", "Désolé, je n'ai pas pu répondre. Réessayez.");
            }

            currentFile = null;
            send.disabled = false;
        }

        // ── Helpers ───────────────────────────────────────────
        function addMsg(role, text, isHTML = false) {
            const row = document.createElement("div");
            row.className = `e-row ${role}`;
            const ico = document.createElement("div");
            ico.className = `e-ico ${role}`;
            ico.innerHTML = role === "a" ? `<img src="${ROBOT}" alt="bot">` : "👤";
            const bbl = document.createElement("div");
            bbl.className = `e-bbl ${role}`;
            if (isHTML) bbl.innerHTML = md(text);
            else bbl.textContent = text;
            row.appendChild(ico); row.appendChild(bbl);
            msgs.appendChild(row);
            msgs.scrollTop = msgs.scrollHeight;
            return row;
        }

        function addTyping() {
            const row = document.createElement("div");
            row.className = "e-row a";
            row.innerHTML = `<div class="e-ico a"><img src="${ROBOT}" alt="bot"></div><div class="e-bbl a" style="padding:12px 16px"><span class="tdot"></span><span class="tdot"></span><span class="tdot"></span></div>`;
            msgs.appendChild(row); msgs.scrollTop = msgs.scrollHeight;
            return row;
        }

        function addWait(sec) {
            const row = document.createElement("div");
            row.className = "e-row a";
            const bbl = document.createElement("div");
            bbl.className = "e-bbl w";
            bbl.innerHTML = `⏳ Réessai dans <b>${sec}s</b>...`;
            row.innerHTML = `<div class="e-ico a"><img src="${ROBOT}" alt="bot"></div>`;
            row.appendChild(bbl);
            msgs.appendChild(row); msgs.scrollTop = msgs.scrollHeight;
            return row;
        }
        function updateWait(row, sec) {
            const b = row.querySelector(".e-bbl.w");
            if (b) b.innerHTML = `⏳ Réessai dans <b>${sec}s</b>...`;
        }
    }

    if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", setupUI);
    else setupUI();
})();
