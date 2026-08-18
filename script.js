const input = document.getElementById('urlInput');
const scanBtn = document.getElementById('scanBtn');
const result = document.getElementById('result');
const resultTitle = document.getElementById('resultTitle');
const resultSummary = document.getElementById('resultSummary');
const scoreBadge = document.getElementById('scoreBadge');
const meterFill = document.getElementById('meterFill');
const signals = document.getElementById('signals');

function analyzeUrl(raw) {
  let value = raw.trim();
  if (!value) return { score: 0, title: 'Enter a URL', summary: 'Paste a URL above to start the analysis.', items: [] };
  if (!/^https?:\/\//i.test(value)) value = 'https://' + value;

  let u;
  try { u = new URL(value); } catch { return { score: 100, title: 'Invalid URL', summary: 'This does not look like a valid web address.', items: [['Format','The browser could not parse this as a URL.']] }; }

  let score = 0;
  const items = [];
  const host = u.hostname.toLowerCase();
  const full = value.toLowerCase();

  if (u.protocol !== 'https:') { score += 20; items.push(['No HTTPS','The URL does not use HTTPS.']); }
  else items.push(['HTTPS detected','The connection uses HTTPS.']);
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) { score += 30; items.push(['IP address','The link uses an IP address instead of a normal domain.']); }
  if (host.includes('xn--')) { score += 25; items.push(['Punycode domain','Encoded domain characters can be used to imitate real domains.']); }
  if (host.split('.').length > 4) { score += 15; items.push(['Many subdomains','The hostname contains an unusually deep subdomain structure.']); }
  if (value.length > 100) { score += 10; items.push(['Long URL','The address is unusually long.']); }
  if ((value.match(/@/g) || []).length) { score += 25; items.push(['@ symbol','An @ in a URL can hide the actual destination.']); }
  if ((value.match(/-/g) || []).length >= 4) { score += 8; items.push(['Many hyphens','The domain has several hyphens, which can be a warning sign.']); }
  if ((value.match(/%/g) || []).length >= 3) { score += 8; items.push(['Encoded characters','The URL contains several encoded characters.']); }
  const keywords = ['login','verify','verification','secure','account','password','update','urgent','confirm','wallet','signin','bank'];
  const hits = keywords.filter(k => full.includes(k));
  if (hits.length >= 2) { score += 18; items.push(['Sensitive wording', `Found ${hits.length} security/account-related keywords.`]); }
  if (/^(www\.)?(google|microsoft|apple|paypal|amazon|instagram|facebook)\.[^./]+\./i.test(host)) { score += 15; items.push(['Brand-like hostname','A brand name appears in an unusual hostname structure.']); }
  if (u.username || u.password) { score += 30; items.push(['Embedded credentials','The URL contains username/password information.']); }

  score = Math.min(100, score);
  let title, summary;
  if (score >= 60) { title = 'High risk'; summary = 'Several common phishing indicators were detected. Treat this link as suspicious.'; }
  else if (score >= 30) { title = 'Use caution'; summary = 'Some warning signs were detected. Verify the domain before entering information.'; }
  else { title = 'Low risk signals'; summary = 'No major warning signs were detected by these simple checks. This is not a guarantee of safety.'; }
  return { score, title, summary, items };
}

function scan() {
  const data = analyzeUrl(input.value);
  result.classList.remove('hidden');
  resultTitle.textContent = data.title;
  resultSummary.textContent = data.summary;
  scoreBadge.textContent = data.score + '/100';
  meterFill.style.width = data.score + '%';
  signals.innerHTML = data.items.length ? data.items.map(([a,b]) => `<div class="signal"><strong>${a}</strong>${b}</div>`).join('') : '<div class="signal"><strong>Ready</strong>No URL signals to report yet.</div>';
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

scanBtn.addEventListener('click', scan);
input.addEventListener('keydown', e => { if (e.key === 'Enter') scan(); });
document.querySelectorAll('[data-sample]').forEach(btn => btn.addEventListener('click', () => { input.value = btn.dataset.sample; scan(); }));