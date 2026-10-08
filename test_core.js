const HK=require('./core.js');
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m);}};
(async()=>{
// RFC 6238 (SHA-1, 8 hane) test vektörleri
const key=new TextEncoder().encode('12345678901234567890');
for(const [t,e] of [[59,'94287082'],[1111111109,'07081804'],[1111111111,'14050471'],[1234567890,'89005924'],[2000000000,'69279037'],[20000000000,'65353130']]){
  const g=await HK.hotp(key,Math.floor(t/30),8,'SHA-1');ok(g===e,`RFC6238 t=${t} got ${g} want ${e}`);}
// base32 RFC 4648 vektörleri
const te=s=>new TextEncoder().encode(s);
for(const [s,e] of [['f','MY'],['fo','MZXQ'],['foo','MZXW6'],['foob','MZXW6YQ'],['fooba','MZXW6YTB'],['foobar','MZXW6YTBOI']]){ok(HK.b32e(te(s))===e,'b32 '+s+' '+HK.b32e(te(s)));ok(new TextDecoder().decode(HK.b32d(e))===s,'b32d '+s);}
// kelime listesi
ok(HK.WORDS.length===128,'128 kelime: '+HK.WORDS.length);ok(new Set(HK.WORDS).size===128,'kelimeler benzersiz');
// davet gidiş-dönüş
const sec=HK.rand(20);const inv=await HK.invite(sec);ok(/^HK1(-[A-Z2-7]{4}){9}$/.test(inv),'davet biçimi '+inv);
const back=await HK.parseInvite(inv.toLowerCase().replace(/-/g,' '));ok(Buffer.from(back).equals(Buffer.from(sec)),'davet gidiş-dönüş');
let threw=false;try{await HK.parseInvite(inv.slice(0,-1)+(inv.slice(-1)==='A'?'B':'A'));}catch(e){threw=true;}ok(threw,'son karakter hatası yakalanmalı');
threw=false;{const i=10;const ch=inv[i]==='A'?'B':'A';try{await HK.parseInvite(inv.slice(0,i)+ch+inv.slice(i+1));}catch(e){threw=true;}}ok(threw,'orta karakter hatası yakalanmalı');
threw=false;try{await HK.parseInvite('HK1-ABCD');}catch(e){threw=true;}ok(threw,'kısa kod reddedilmeli');
// yön bağlama ve doğrulama
const T=1790000000000;const c=HK.counterAt(T);
const a0=await HK.code(sec,0,c),a1=await HK.code(sec,1,c);ok(a0!==a1,'iki yön farklı kod üretmeli');
ok((await HK.verify(sec,0,a0,T)).r==='ok','rol 0 kodu doğrulanır');
ok((await HK.verify(sec,1,a0,T)).r==='bad','yansıtma saldırısı: kendi kodunu geri okutma reddedilir');
ok((await HK.verify(sec,0,a0.slice(0,3)+' '+a0.slice(3),T)).r==='ok','boşluklu giriş kabul');
// zaman penceresi
ok((await HK.verify(sec,0,a0,T+30000)).r==='ok','+30 sn kayma kabul');
ok((await HK.verify(sec,0,a0,T-30000)).r==='ok','-30 sn kayma kabul');
ok((await HK.verify(sec,0,a0,T+95000)).r==='bad','95 sn sonra reddedilir');
// baskı kodu
const d0=await HK.code(sec,0,c,'D');ok(d0!==a0,'baskı kodu farklı');ok((await HK.verify(sec,0,d0,T)).r==='duress','baskı kodu tanınır');
// farklı sır
const sec2=HK.rand(20);ok((await HK.verify(sec2,0,a0,T)).r==='bad','başka sırla doğrulanmaz');
// soru-cevap
const ch=HK.newChallenge();ok(/^\d{6}$/.test(ch),'soru 6 hane');
const ans=await HK.respond(sec,1,ch);ok(await HK.checkAnswer(sec,1,ch,ans),'doğru cevap');ok(!(await HK.checkAnswer(sec,0,ch,ans)),'yanlış rol cevabı reddedilir');ok(!(await HK.checkAnswer(sec,1,'123456',ans))||ch==='123456','başka soruya cevap geçmez');
// parmak izi
const f=await HK.fingerprint(sec);ok(f.length===3&&f.every(w=>HK.WORDS.includes(w)),'parmak izi');ok(JSON.stringify(f)===JSON.stringify(await HK.fingerprint(back)),'parmak izi iki tarafta aynı');
// PIN şifreleme
const blob=await HK.seal({a:1,b:'ç'},'4821');ok((await HK.unseal(blob,'4821')).b==='ç','PIN ile aç');
threw=false;try{await HK.unseal(blob,'0000');}catch(e){threw=true;}ok(threw,'yanlış PIN açmaz');
// dağılım: 3000 kod, tekrar oranı
const seen=new Set();for(let i=0;i<3000;i++)seen.add(await HK.code(sec,0,i));ok(seen.size>2900,'kod çeşitliliği '+seen.size);
console.log(bad?'SORUN '+bad:'TÜM ÇEKİRDEK TESTLER GEÇTİ');})();
