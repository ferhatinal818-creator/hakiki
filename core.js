/* ===== HAKİKİ · kriptografik çekirdek (tarayıcı + node) ===== */
const HK=(()=>{
const subtle=globalThis.crypto&&globalThis.crypto.subtle;
const enc=new TextEncoder();
const B32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP=30;
const WORDS=('kale deniz elma kuş bulut nehir çiçek dağ yıldız ay güneş rüzgar yağmur kar orman ada köprü liman vapur simit çay bal zeytin incir nar üzüm kiraz limon ceviz fındık badem kedi köpek kuzu kartal serçe leylek martı balık yunus arı karınca kaplan aslan tilki kurt ceylan at lale gül papatya sümbül menekşe çam meşe ardıç kavak taş kum toprak ateş buz sis şimşek harita pusula fener anahtar kapı pencere çatı merdiven masa sandalye kitap kalem defter saat zil davul saz ney gitar top uçurtma bisiklet tren otobüs uçak gemi sepet bardak tabak kaşık çanta şemsiye ayna halı kilim lamba mum perde yastık battaniye bahçe tarla çeşme kuyu göl yol tepe vadi plaj kayık yelken çapa kervan rıhtım sahil dalga fırtına şafak gün akşam yaprak dal kök meyve').split(' ').slice(0,128);

function rand(n){const a=new Uint8Array(n);globalThis.crypto.getRandomValues(a);return a;}
function b32e(u8){let bits=0,val=0,out='';for(const b of u8){val=(val<<8)|b;bits+=8;while(bits>=5){out+=B32[(val>>>(bits-5))&31];bits-=5;}val&=(1<<bits)-1;}if(bits>0)out+=B32[(val<<(5-bits))&31];return out;}
function b32d(s){let bits=0,val=0;const out=[];for(const ch of s){const i=B32.indexOf(ch);if(i<0)throw new Error('geçersiz karakter');val=(val<<5)|i;bits+=5;if(bits>=8){out.push((val>>>(bits-8))&255);bits-=8;}val&=(1<<bits)-1;}return new Uint8Array(out);}
const b64e=u8=>btoa(String.fromCharCode(...u8));
const b64d=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function sha256(u8){return new Uint8Array(await subtle.digest('SHA-256',u8));}
async function hmac(key,data,hash='SHA-256'){const k=await subtle.importKey('raw',key,{name:'HMAC',hash},false,['sign']);return new Uint8Array(await subtle.sign('HMAC',k,data));}
async function hotp(key,counter,digits=6,hash='SHA-256'){const m=new Uint8Array(8);const dv=new DataView(m.buffer);dv.setUint32(0,Math.floor(counter/4294967296));dv.setUint32(4,counter>>>0);const h=await hmac(key,m,hash);const o=h[h.length-1]&15;const bin=((h[o]&127)<<24)|(h[o+1]<<16)|(h[o+2]<<8)|h[o+3];return String(bin%(10**digits)).padStart(digits,'0');}
async function deriveKey(secret,label){return hmac(secret,enc.encode('hakiki/v1/'+label));}
const counterAt=(t=Date.now())=>Math.floor(t/1000/STEP);
const secsLeft=(t=Date.now())=>STEP-Math.floor(t/1000)%STEP;
/* kind: 'C' normal kod, 'D' baskı kodu. role: kodu üreten tarafın rolü (0 davet eden, 1 davet edilen) */
async function code(secret,role,counter,kind='C'){return hotp(await deriveKey(secret,kind+role),counter);}
const clean=s=>String(s).replace(/\D/g,'');
function same(a,b){if(a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0;}
/* karşı tarafın okuduğu kodu doğrula: ok | duress | bad */
async function verify(secret,peerRole,input,t=Date.now()){const x=clean(input);if(x.length!==6)return{r:'bad',why:'uzunluk'};const c=counterAt(t);let found=null;
  for(const d of [0,-1,1]){const n=await code(secret,peerRole,c+d,'C');if(same(n,x)&&!found)found={r:'ok',drift:d};}
  if(found)return found;
  for(const d of [0,-1,1]){const n=await code(secret,peerRole,c+d,'D');if(same(n,x))return{r:'duress',drift:d};}
  return{r:'bad'};}
function newChallenge(){const u=new Uint32Array(1);globalThis.crypto.getRandomValues(u);return String(u[0]%1000000).padStart(6,'0');}
async function respond(secret,responderRole,challenge){const x=clean(challenge);if(x.length!==6)throw new Error('6 haneli sayı gerekli');return hotp(await deriveKey(secret,'R'+responderRole),parseInt(x,10));}
async function checkAnswer(secret,peerRole,challenge,answer){const exp=await respond(secret,peerRole,challenge);return same(exp,clean(answer));}
async function fingerprint(secret){const h=await sha256(secret);return [WORDS[h[0]&127],WORDS[h[1]&127],WORDS[h[2]&127]];}
async function invite(secret){const c=(await sha256(secret)).slice(0,2);const p=new Uint8Array(22);p.set(secret);p.set(c,20);const s=b32e(p);return 'HK1-'+s.match(/.{1,4}/g).join('-');}
async function parseInvite(str){let s=String(str).trim().toUpperCase();if(!s.startsWith('HK1'))throw new Error('Kod HK1 ile başlamalı.');s=s.slice(3).replace(/0/g,'O').replace(/1/g,'I').replace(/[^A-Z2-7]/g,'');if(s.length!==36)throw new Error('Kod eksik ya da fazla. 36 karakter olmalı.');const b=b32d(s);if(b32e(b)!==s)throw new Error('Kodda yazım hatası var. Karakterleri tek tek kontrol edin.');const secret=b.slice(0,20);const chk=(await sha256(secret)).slice(0,2);if(chk[0]!==b[20]||chk[1]!==b[21])throw new Error('Kodda yazım hatası var. Karakterleri tek tek kontrol edin.');return secret;}
async function pinKey(pin,salt){const km=await subtle.importKey('raw',enc.encode(pin),'PBKDF2',false,['deriveKey']);return subtle.deriveKey({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'},km,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
async function seal(obj,pin){const salt=rand(16),iv=rand(12);const k=await pinKey(pin,salt);const ct=new Uint8Array(await subtle.encrypt({name:'AES-GCM',iv},k,enc.encode(JSON.stringify(obj))));return{salt:b64e(salt),iv:b64e(iv),ct:b64e(ct)};}
async function unseal(blob,pin){const k=await pinKey(pin,b64d(blob.salt));const pt=await subtle.decrypt({name:'AES-GCM',iv:b64d(blob.iv)},k,b64d(blob.ct));return JSON.parse(new TextDecoder().decode(pt));}
const supported=!!subtle&&!!globalThis.crypto.getRandomValues;
return{STEP,WORDS,rand,b32e,b32d,b64e,b64d,hotp,code,counterAt,secsLeft,verify,newChallenge,respond,checkAnswer,fingerprint,invite,parseInvite,seal,unseal,supported,clean,enc};
})();
if(typeof module!=='undefined')module.exports=HK;
