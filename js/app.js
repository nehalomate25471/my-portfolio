pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ---------- i18n ----------
const I18N = {
  en:{
    subtitle:"Build a resume + portfolio just by typing",
    tabResume:"Resume", tabPortfolio:"Portfolio",
    step1:"Resume upload (optional)",
    uploadText:"Click to upload PDF / DOCX",
    step2:"Type a prompt",
    promptPlaceholder:"e.g. My name is Rohan Patil, I'm a Graphic Designer, add 3 years experience at Pixel Studio",
    genBtn:"✨ Ask AI to update",
    step3:"Portfolio template",
    tplMinimal:"Minimal", tplEditorial:"Editorial", tplVivid:"Vivid",
    exportHeader:"Export / Publish",
    downloadResume:"⬇ Download resume (HTML)",
    downloadZip:"⬇ Download portfolio (ZIP)",
    githubBtn:"⬆ Push to GitHub",
    exportNote:"Both the ZIP and GitHub push contain ready-to-use code — upload directly to any hosting (GitHub Pages, Netlify, Vercel).",
    modalTitle:"Push to GitHub",
    ghUser:"GitHub username", ghRepo:"Repository name", ghToken:"Personal access token (repo scope)",
    ghNote:"How to get a token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) → check the 'repo' scope. The token goes straight from your browser to GitHub, never stored anywhere.",
    cancel:"Cancel", push:"Push",
    statusAiThinking:"AI is thinking...",
    statusUpdated:"Done ✅ preview updated",
    statusReadingResume:"Reading your resume...",
    statusExtracting:"Extracting resume data...",
    statusResumeDone:"Portfolio data built from your resume ✅",
    statusZip:"Building ZIP...",
    statusZipDone:"ZIP downloaded ✅",
    statusFillFields:"Please fill all fields",
    statusCreatingRepo:"Creating repository...",
    statusPushingFile:(f)=>`Pushing ${f}...`,
    statusPushDone:(o,r)=>`Pushed ✅ <a href="https://github.com/${o}/${r}" target="_blank" style="color:var(--accent)">view repo</a>`,
    previewResume:"preview — resume.html",
    previewPortfolio:"preview — index.html (portfolio)"
  },
  mr:{
    subtitle:"Prompt वरून Resume + Portfolio",
    tabResume:"Resume", tabPortfolio:"Portfolio",
    step1:"Resume Upload (ऐच्छिक)",
    uploadText:"इथे क्लिक करून PDF / DOCX टाका",
    step2:"Prompt टाका",
    promptPlaceholder:"उदा: माझं नाव Rohan Patil, मी Graphic Designer आहे, 3 वर्षांचा अनुभव Pixel Studio इथे जोडा",
    genBtn:"✨ AI ला सांग — Update कर",
    step3:"Portfolio Template",
    tplMinimal:"Minimal", tplEditorial:"Editorial", tplVivid:"Vivid",
    exportHeader:"Export / Publish",
    downloadResume:"⬇ Resume Download (HTML)",
    downloadZip:"⬇ Portfolio ZIP Download",
    githubBtn:"⬆ GitHub वर Push कर",
    exportNote:"ZIP आणि GitHub दोन्हीत तयार code असतो — कुठल्याही होस्टिंगवर (GitHub Pages, Netlify, Vercel) थेट अपलोड करता येतो.",
    modalTitle:"GitHub वर Push कर",
    ghUser:"GitHub Username", ghRepo:"Repository नाव", ghToken:"Personal Access Token (repo scope)",
    ghNote:'Token कसा बनवायचा: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic) → "repo" scope टिक करा. Token फक्त तुझ्या ब्राउझरमधून थेट GitHub ला जातो, कुठेही save होत नाही.',
    cancel:"रद्द कर", push:"Push कर",
    statusAiThinking:"AI विचार करत आहे...",
    statusUpdated:"झालं ✅ Preview update झाली",
    statusReadingResume:"Resume वाचला जात आहे...",
    statusExtracting:"Resume मधून माहिती काढली जात आहे...",
    statusResumeDone:"Resume मधून portfolio data तयार झाला ✅",
    statusZip:"ZIP तयार होत आहे...",
    statusZipDone:"ZIP download झाला ✅",
    statusFillFields:"सगळे fields भरा",
    statusCreatingRepo:"Repository तयार होत आहे...",
    statusPushingFile:(f)=>`${f} push होत आहे...`,
    statusPushDone:(o,r)=>`Push झालं ✅ <a href="https://github.com/${o}/${r}" target="_blank" style="color:var(--accent)">repo बघ</a>`,
    previewResume:"preview — resume.html",
    previewPortfolio:"preview — index.html (portfolio)"
  }
};
let lang = "mr";
function t(key){ const v = I18N[lang][key]; return typeof v === "function" ? v : v; }
function applyLang(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.dataset.i18n;
    if(I18N[lang][key] !== undefined) el.textContent = I18N[lang][key];
  });
  document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
    const key = el.dataset.i18nPh;
    if(I18N[lang][key] !== undefined) el.placeholder = I18N[lang][key];
  });
  document.querySelectorAll(".chip").forEach(chip=>{
    chip.textContent = lang === "en" ? chip.dataset.pEn.split(" ").slice(0,3).join(" ")+"…" : chip.textContent;
  });
  // restore chip labels properly (short display labels per language)
  const chipLabels = {
    en:["Write summary","Add skills","Add project","Make it bold","Simplify language"],
    mr:["Summary लिही","Skills जोडा","Project जोडा","Bold बनव","सोप्या भाषेत"]
  };
  document.querySelectorAll(".chip").forEach((chip,i)=>{ chip.textContent = chipLabels[lang][i]; });
  $("#canvasUrl").textContent = activeView === "resume" ? t("previewResume") : t("previewPortfolio");
  document.documentElement.lang = lang;
}
$ = (sel)=>document.querySelector(sel);
document.getElementById("lang-en").addEventListener("click", ()=>setLang("en"));
document.getElementById("lang-mr").addEventListener("click", ()=>setLang("mr"));
function setLang(l){
  lang = l;
  document.getElementById("lang-en").classList.toggle("active", l==="en");
  document.getElementById("lang-mr").classList.toggle("active", l==="mr");
  applyLang();
}

// ---------- state ----------
let data = {
  personal:{name:"",title:"",email:"",phone:"",location:"",summary:""},
  experience:[],
  education:[],
  skills:[],
  projects:[],
  theme:{template:"minimal",accent:"#E6A23C"}
};
let activeView = "resume";

const statusEl = document.getElementById("status");
function setStatus(msg, kind){
  statusEl.innerHTML = msg;
  statusEl.className = "status" + (kind ? " "+kind : "");
}

// ---------- AI call ----------
async function callClaude(promptText){
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role:"user", content: promptText }]
    })
  });
  const json = await response.json();
  if(json.error) throw new Error(json.error.message || "AI call failed");
  return json.content.map(c=>c.text||"").join("\n");
}

const SCHEMA_HINT = `{"personal":{"name":"","title":"","email":"","phone":"","location":"","summary":""},"experience":[{"company":"","role":"","duration":"","points":["..."]}],"education":[{"school":"","degree":"","year":""}],"skills":["..."],"projects":[{"name":"","description":"","link":""}],"theme":{"template":"minimal|editorial|vivid","accent":"#hexcolor"}}`;

function extractJson(text){
  const cleaned = text.replace(/```json/gi,"").replace(/```/g,"").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return JSON.parse(cleaned.slice(start, end+1));
}

async function updateFromPrompt(promptText){
  if(!promptText.trim()) return;
  document.getElementById("genBtn").disabled = true;
  setStatus(t("statusAiThinking"), "busy");
  try{
    const full = `You are helping build a resume/portfolio. Current data as JSON:\n${JSON.stringify(data)}\n\nUser instruction (may be in Marathi/Hinglish/English): "${promptText}"\n\nApply the user's instruction to the JSON. Keep all existing fields the user did not ask to change. Never invent fake companies, schools or links the user did not mention or upload — if info is missing, leave that field empty or as a short empty string/array. Respond with ONLY valid minified JSON, no markdown, no explanation, matching exactly this schema:\n${SCHEMA_HINT}`;
    const raw = await callClaude(full);
    const parsed = extractJson(raw);
    data = {...data, ...parsed, theme:{...data.theme, ...(parsed.theme||{})}};
    render();
    setStatus(t("statusUpdated"), "ok");
  }catch(e){
    setStatus("Error: "+e.message, "err");
  }
  document.getElementById("genBtn").disabled = false;
}

// ---------- file parsing ----------
async function extractPdfText(file){
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({data:buf}).promise;
  let text = "";
  for(let i=1;i<=pdf.numPages;i++){
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it=>it.str).join(" ") + "\n";
  }
  return text;
}
async function extractDocxText(file){
  const buf = await file.arrayBuffer();
  const result = await mammoth.extractRawText({arrayBuffer:buf});
  return result.value;
}

document.getElementById("fileInput").addEventListener("change", async (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  document.getElementById("fname").textContent = file.name;
  setStatus(t("statusReadingResume"), "busy");
  try{
    let text = "";
    if(file.type === "application/pdf" || file.name.endsWith(".pdf")){
      text = await extractPdfText(file);
    }else if(file.name.endsWith(".docx")){
      text = await extractDocxText(file);
    }else{
      text = await file.text();
    }
    setStatus(t("statusExtracting"), "busy");
    const full = `Extract structured resume information from the text below and output ONLY valid minified JSON, no markdown, no explanation, matching exactly this schema:\n${SCHEMA_HINT}\nDo not invent any information that isn't in the text. If a field isn't present, leave it empty.\n\nResume text:\n"""${text.slice(0,8000)}"""`;
    const raw = await callClaude(full);
    const parsed = extractJson(raw);
    data = {...data, ...parsed, theme:{...data.theme, ...(parsed.theme||{})}};
    render();
    setStatus(t("statusResumeDone"), "ok");
  }catch(err){
    setStatus("Error: "+err.message, "err");
  }
});

document.getElementById("genBtn").addEventListener("click", ()=>{
  updateFromPrompt(document.getElementById("promptBox").value);
});
document.querySelectorAll(".chip").forEach((chip,i)=>{
  chip.addEventListener("click", ()=>{
    document.getElementById("promptBox").value = lang === "en" ? chip.dataset.pEn : chip.dataset.pMr;
  });
});

// ---------- template picker ----------
document.querySelectorAll(".tpl").forEach(tpl=>{
  tpl.addEventListener("click", ()=>{
    document.querySelectorAll(".tpl").forEach(x=>x.classList.remove("active"));
    tpl.classList.add("active");
    data.theme.template = tpl.dataset.t;
    render();
  });
});

// ---------- view tabs ----------
document.getElementById("tab-resume").addEventListener("click", ()=>switchView("resume"));
document.getElementById("tab-portfolio").addEventListener("click", ()=>switchView("portfolio"));
function switchView(v){
  activeView = v;
  document.getElementById("tab-resume").classList.toggle("active", v==="resume");
  document.getElementById("tab-portfolio").classList.toggle("active", v==="portfolio");
  document.getElementById("portfolioOnly").style.display = v==="portfolio" ? "block":"none";
  document.getElementById("canvasUrl").textContent = v==="resume" ? t("previewResume") : t("previewPortfolio");
  render();
}

// ---------- templates (HTML builders) ----------
function esc(s){ return (s||"").toString().replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function buildResumeHTML(d){
  const p = d.personal;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    body{font-family:'Georgia',serif;max-width:760px;margin:40px auto;color:#222;padding:0 24px;}
    h1{font-size:28px;margin-bottom:2px;}
    .title{color:#555;font-size:15px;margin-bottom:10px;}
    .meta{font-size:12.5px;color:#666;margin-bottom:18px;}
    h2{font-size:14px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:26px;color:#333;}
    .item{margin:12px 0;}
    .item b{font-size:14.5px;}
    .sub{color:#666;font-size:12.5px;}
    ul{margin:6px 0 0 18px;padding:0;font-size:13.5px;}
    .skills span{display:inline-block;background:#f0f0f0;padding:3px 9px;border-radius:4px;margin:3px 4px 0 0;font-size:12px;}
  </style></head><body>
  <h1>${esc(p.name)||"तुझं नाव"}</h1>
  <div class="title">${esc(p.title)}</div>
  <div class="meta">${[p.email,p.phone,p.location].filter(Boolean).map(esc).join(" · ")}</div>
  ${p.summary ? `<p>${esc(p.summary)}</p>` : ""}
  ${d.experience.length ? `<h2>Experience</h2>${d.experience.map(e=>`<div class="item"><b>${esc(e.role)}</b> — ${esc(e.company)}<div class="sub">${esc(e.duration)}</div><ul>${(e.points||[]).map(pt=>`<li>${esc(pt)}</li>`).join("")}</ul></div>`).join("")}` : ""}
  ${d.education.length ? `<h2>Education</h2>${d.education.map(ed=>`<div class="item"><b>${esc(ed.degree)}</b> — ${esc(ed.school)}<div class="sub">${esc(ed.year)}</div></div>`).join("")}` : ""}
  ${d.skills.length ? `<h2>Skills</h2><div class="skills">${d.skills.map(s=>`<span>${esc(s)}</span>`).join("")}</div>` : ""}
  ${d.projects.length ? `<h2>Projects</h2>${d.projects.map(pr=>`<div class="item"><b>${esc(pr.name)}</b>${pr.link?` — <a href="${esc(pr.link)}">${esc(pr.link)}</a>`:""}<div class="sub">${esc(pr.description)}</div></div>`).join("")}` : ""}
  </body></html>`;
}

function buildPortfolioHTML(d){
  const tmpl = d.theme.template || "minimal";
  const accent = d.theme.accent || "#E6A23C";
  if(tmpl === "editorial") return portfolioEditorial(d, accent);
  if(tmpl === "vivid") return portfolioVivid(d, accent);
  return portfolioMinimal(d, accent);
}

function portfolioMinimal(d, accent){
  const p = d.personal;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body{font-family:'Inter',sans-serif;margin:0;background:#fff;color:#1a1a1a;}
    .wrap{max-width:760px;margin:0 auto;padding:80px 24px;}
    h1{font-size:40px;margin:0 0 6px;font-weight:800;}
    .title{color:${accent};font-weight:600;margin-bottom:20px;}
    .summary{font-size:16px;line-height:1.7;color:#444;max-width:600px;}
    section{margin-top:56px;}
    h2{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#999;margin-bottom:18px;}
    .card{padding:18px 0;border-top:1px solid #eee;}
    .card b{font-size:16px;}
    .sub{color:#888;font-size:13px;margin:4px 0 8px;}
    ul{margin:0;padding-left:18px;color:#444;font-size:14px;}
    .skills span{display:inline-block;border:1px solid #ddd;padding:5px 12px;border-radius:999px;margin:0 6px 6px 0;font-size:13px;}
    .contact{margin-top:60px;font-size:14px;color:#666;}
    a{color:${accent};}
  </style></head><body><div class="wrap">
    <h1>${esc(p.name)||"तुझं नाव"}</h1>
    <div class="title">${esc(p.title)}</div>
    ${p.summary?`<p class="summary">${esc(p.summary)}</p>`:""}
    ${d.experience.length?`<section><h2>Experience</h2>${d.experience.map(e=>`<div class="card"><b>${esc(e.role)} · ${esc(e.company)}</b><div class="sub">${esc(e.duration)}</div><ul>${(e.points||[]).map(pt=>`<li>${esc(pt)}</li>`).join("")}</ul></div>`).join("")}</section>`:""}
    ${d.projects.length?`<section><h2>Projects</h2>${d.projects.map(pr=>`<div class="card"><b>${esc(pr.name)}</b><div class="sub">${pr.link?`<a href="${esc(pr.link)}">${esc(pr.link)}</a>`:""}</div><div>${esc(pr.description)}</div></div>`).join("")}</section>`:""}
    ${d.skills.length?`<section><h2>Skills</h2><div class="skills">${d.skills.map(s=>`<span>${esc(s)}</span>`).join("")}</div></section>`:""}
    ${d.education.length?`<section><h2>Education</h2>${d.education.map(ed=>`<div class="card"><b>${esc(ed.degree)}</b><div class="sub">${esc(ed.school)} · ${esc(ed.year)}</div></div>`).join("")}</section>`:""}
    <div class="contact">${[p.email,p.phone,p.location].filter(Boolean).map(esc).join(" · ")}</div>
  </div></body></html>`;
}

function portfolioEditorial(d, accent){
  const p = d.personal;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,500;0,700;1,500&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body{font-family:'Inter',sans-serif;margin:0;background:#FAF9F6;color:#1c1c1c;}
    .grid{display:grid;grid-template-columns:280px 1fr;min-height:100vh;}
    .side{border-right:1px solid #ddd;padding:60px 30px;}
    .side h1{font-family:'Newsreader',serif;font-size:34px;margin:0 0 4px;}
    .side .title{color:${accent};font-weight:600;margin-bottom:16px;}
    .side p{font-size:14px;color:#555;line-height:1.6;}
    .side .contact{margin-top:30px;font-size:13px;color:#777;}
    .main{padding:60px 40px;}
    h2{font-family:'Newsreader',serif;font-style:italic;font-size:22px;border-bottom:2px solid ${accent};display:inline-block;padding-bottom:4px;margin-top:0;}
    .card{margin-bottom:26px;padding-bottom:20px;border-bottom:1px dashed #ddd;}
    .card b{font-size:16px;}
    .sub{color:#888;font-size:12.5px;margin:2px 0 8px;}
    ul{margin:0;padding-left:18px;font-size:14px;color:#444;}
    .skills span{display:inline-block;background:#eee;padding:5px 11px;border-radius:4px;margin:0 6px 6px 0;font-size:12.5px;}
    a{color:${accent};}
  </style></head><body><div class="grid">
    <div class="side">
      <h1>${esc(p.name)||"तुझं नाव"}</h1>
      <div class="title">${esc(p.title)}</div>
      ${p.summary?`<p>${esc(p.summary)}</p>`:""}
      <div class="contact">${[p.email,p.phone,p.location].filter(Boolean).map(esc).join("<br>")}</div>
      ${d.skills.length?`<h2 style="font-size:16px;margin-top:30px;">Skills</h2><div class="skills">${d.skills.map(s=>`<span>${esc(s)}</span>`).join("")}</div>`:""}
    </div>
    <div class="main">
      ${d.experience.length?`<h2>Experience</h2>${d.experience.map(e=>`<div class="card"><b>${esc(e.role)} — ${esc(e.company)}</b><div class="sub">${esc(e.duration)}</div><ul>${(e.points||[]).map(pt=>`<li>${esc(pt)}</li>`).join("")}</ul></div>`).join("")}`:""}
      ${d.projects.length?`<h2>Projects</h2>${d.projects.map(pr=>`<div class="card"><b>${esc(pr.name)}</b><div class="sub">${pr.link?`<a href="${esc(pr.link)}">${esc(pr.link)}</a>`:""}</div><div>${esc(pr.description)}</div></div>`).join("")}`:""}
      ${d.education.length?`<h2>Education</h2>${d.education.map(ed=>`<div class="card"><b>${esc(ed.degree)}</b><div class="sub">${esc(ed.school)} · ${esc(ed.year)}</div></div>`).join("")}`:""}
    </div>
  </div></body></html>`;
}

function portfolioVivid(d, accent){
  const p = d.personal;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;700;800&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body{font-family:'Inter',sans-serif;margin:0;background:#101014;color:#f2f2f2;}
    .hero{padding:90px 40px 60px;background:radial-gradient(circle at 20% 20%, ${accent}33, transparent 60%);}
    .hero h1{font-family:'Bricolage Grotesque',sans-serif;font-size:52px;margin:0;font-weight:800;}
    .hero .title{color:${accent};font-weight:700;font-size:18px;margin-top:6px;}
    .hero p{max-width:560px;color:#ccc;font-size:16px;line-height:1.7;margin-top:18px;}
    .wrap{max-width:840px;margin:0 auto;padding:0 40px 80px;}
    h2{font-family:'Bricolage Grotesque',sans-serif;font-size:22px;margin-top:60px;color:${accent};}
    .card{background:#18181d;border:1px solid #2a2a30;border-radius:14px;padding:20px;margin-top:14px;}
    .card b{font-size:16px;}
    .sub{color:#999;font-size:12.5px;margin:4px 0 8px;}
    ul{margin:0;padding-left:18px;color:#ddd;font-size:14px;}
    .skills span{display:inline-block;background:${accent};color:#1a1a1a;padding:6px 13px;border-radius:999px;margin:0 8px 8px 0;font-weight:700;font-size:12.5px;}
    a{color:${accent};}
    .contact{margin-top:50px;color:#999;font-size:13px;}
  </style></head><body>
    <div class="hero"><h1>${esc(p.name)||"तुझं नाव"}</h1><div class="title">${esc(p.title)}</div>${p.summary?`<p>${esc(p.summary)}</p>`:""}</div>
    <div class="wrap">
      ${d.skills.length?`<h2>Skills</h2><div class="skills">${d.skills.map(s=>`<span>${esc(s)}</span>`).join("")}</div>`:""}
      ${d.projects.length?`<h2>Projects</h2>${d.projects.map(pr=>`<div class="card"><b>${esc(pr.name)}</b><div class="sub">${pr.link?`<a href="${esc(pr.link)}">${esc(pr.link)}</a>`:""}</div><div>${esc(pr.description)}</div></div>`).join("")}`:""}
      ${d.experience.length?`<h2>Experience</h2>${d.experience.map(e=>`<div class="card"><b>${esc(e.role)} · ${esc(e.company)}</b><div class="sub">${esc(e.duration)}</div><ul>${(e.points||[]).map(pt=>`<li>${esc(pt)}</li>`).join("")}</ul></div>`).join("")}`:""}
      ${d.education.length?`<h2>Education</h2>${d.education.map(ed=>`<div class="card"><b>${esc(ed.degree)}</b><div class="sub">${esc(ed.school)} · ${esc(ed.year)}</div></div>`).join("")}`:""}
      <div class="contact">${[p.email,p.phone,p.location].filter(Boolean).map(esc).join(" · ")}</div>
    </div>
  </body></html>`;
}

function render(){
  const html = activeView === "resume" ? buildResumeHTML(data) : buildPortfolioHTML(data);
  document.getElementById("preview").srcdoc = html;
}

// ---------- export ----------
document.getElementById("downloadResumeBtn").addEventListener("click", ()=>{
  const blob = new Blob([buildResumeHTML(data)], {type:"text/html"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "resume.html";
  a.click();
});

document.getElementById("downloadZipBtn").addEventListener("click", async ()=>{
  setStatus(t("statusZip"), "busy");
  const zip = new JSZip();
  zip.file("index.html", buildPortfolioHTML(data));
  zip.file("resume.html", buildResumeHTML(data));
  zip.file("data.json", JSON.stringify(data, null, 2));
  zip.file("README.md", `# ${data.personal.name || "My"} Portfolio\n\nGenerated with PromptFolio.\nOpen index.html for the portfolio site, resume.html for the resume.\nEdit data.json and regenerate anytime, or host index.html directly on GitHub Pages / Netlify / Vercel.`);
  const blob = await zip.generateAsync({type:"blob"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "portfolio.zip";
  a.click();
  setStatus(t("statusZipDone"), "ok");
});

// ---------- github push ----------
document.getElementById("githubBtn").addEventListener("click", ()=> document.getElementById("githubModal").classList.add("show"));
document.getElementById("closeModal").addEventListener("click", ()=> document.getElementById("githubModal").classList.remove("show"));
document.getElementById("ghCancel").addEventListener("click", ()=> document.getElementById("githubModal").classList.remove("show"));

document.getElementById("ghSubmit").addEventListener("click", async ()=>{
  const owner = document.getElementById("ghUser").value.trim();
  const repo = document.getElementById("ghRepo").value.trim();
  const token = document.getElementById("ghToken").value.trim();
  const ghStatus = document.getElementById("ghStatus");
  if(!owner || !repo || !token){ ghStatus.textContent = t("statusFillFields"); ghStatus.className="status err"; return; }
  ghStatus.textContent = t("statusCreatingRepo"); ghStatus.className = "status busy";
  const headers = { "Authorization": `token ${token}`, "Accept": "application/vnd.github+json" };
  try{
    await fetch("https://api.github.com/user/repos", {
      method:"POST", headers:{...headers,"Content-Type":"application/json"},
      body: JSON.stringify({ name: repo, description: "Portfolio built with PromptFolio", auto_init:true })
    });
    const files = {
      "index.html": buildPortfolioHTML(data),
      "resume.html": buildResumeHTML(data),
      "data.json": JSON.stringify(data, null, 2)
    };
    for(const [path, content] of Object.entries(files)){
      ghStatus.textContent = t("statusPushingFile")(path);
      let sha;
      try{
        const getResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {headers});
        if(getResp.ok){ const j = await getResp.json(); sha = j.sha; }
      }catch(e){}
      const body = { message:`Add/update ${path} via PromptFolio`, content: btoa(unescape(encodeURIComponent(content))) };
      if(sha) body.sha = sha;
      const putResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method:"PUT", headers:{...headers,"Content-Type":"application/json"}, body: JSON.stringify(body)
      });
      if(!putResp.ok){ const j = await putResp.json(); throw new Error(j.message || `${path} push failed`); }
    }
    ghStatus.innerHTML = t("statusPushDone")(owner, repo);
    ghStatus.className = "status ok";
  }catch(err){
    ghStatus.textContent = "Error: " + err.message;
    ghStatus.className = "status err";
  }
});

applyLang();
render();
