#!/bin/sh
cd /home/claude/hakiki
node --check app.js && node --check core.js || exit 1
{
cat <<'H'
<title>Hakiki</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>
H
cat style.css
echo '</style>'
cat <<'B'
<div class="app" lang="tr">
 <header class="top"><div class="brand"><svg viewBox="0 0 48 48" aria-hidden="true" style="width:38px;height:38px;color:var(--seal)"><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M16 25l6 6 11-13" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><div>Hakiki<small>Karşındaki gerçek mi?</small></div></div><button class="icon" id="gear" aria-label="Ayarlar" data-act="settings"></button></header>
 <main id="view"></main>
</div>
<nav class="tabs" id="tabs" aria-label="Bölümler"></nav>
<script>
B
cat core.js
echo ';'
cat app.js
echo '</script>'
} > index.html
python3 - <<'PY'
p='/home/claude/hakiki/index.html'
s=open(p,encoding='utf-8').read()
s=s.replace('aria-label="Ayarlar" data-act="settings"></button>','aria-label="Ayarlar" data-act="settings"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg></button>')
open(p,'w',encoding='utf-8').write(s)
PY
wc -c index.html
