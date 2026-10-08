# Hakiki

Dolandırıcılığa karşı **ortak sır tabanlı doğrulama** uygulaması (Türkçe, tarayıcıda çalışır, sunucusuz).
Yakınlarınızla bir kez eşleşirsiniz; sonra telefonda "gerçekten o mu?" sorusunu 6 haneli kodla yanıtlarsınız.
Deepfake ses/görüntü ve "numaram değişti" dolandırıcılıklarına karşı tasarlanmıştır.

## Özellikler
- 160 bit ortak sır, HMAC-SHA-256 ile türetilmiş anahtarlar, HOTP tarzı 6 haneli kod (30 sn adım, ±1 tolerans)
- Yön bağlı kodlar (davet eden / katılan) – yansıtma saldırısını engeller
- Baskı (duress) kodu: zorla kod verdirilirse sessiz alarm
- Soru-cevap modu (challenge-response)
- Davet kodu `HK1-…` (checksum'lı), 3 kelimelik parmak izi
- İsteğe bağlı PIN şifreleme (PBKDF2 150k → AES-GCM)
- Türkçe dolandırıcılık senaryoları ile eğitim, acil durum rehberi (155, Jandarma, BTK İhbar), büyük yazı ve sesli okuma

## Çalıştırma
`index.html` tek dosyadır; güvenli bağlamda (https veya localhost) açın (WebCrypto gerekir):

    python3 -m http.server 8000   # sonra http://localhost:8000

## Derleme ve test

    node test_core.js   # RFC 6238 / RFC 4648 vektörleri dahil çekirdek testleri
    ./build.sh          # style.css + core.js + app.js -> index.html

## Sınırlamalar (dürüst liste)
- Önceden eşleşme gerekir (soğuk başlangıç problemi)
- Bağımsız güvenlik denetiminden geçmedi; prototiptir
- Röle saldırıları ve çalınmış telefon kapsam dışı
- Saat kayması ±1 adım ile sınırlı telafi edilir
- Rakipler: Trust Onion, Codeword, World ID + Zoom

## İlham
Y Combinator RFS (2026): yapay zekâ çağında kimlik/güven doğrulama.

`hakiki_sunum.html`: 15 slaytlık ürün sunumu.
