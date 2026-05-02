import React, { useState, useEffect } from 'react';
import { Ticket, Ship, User, CheckCircle2, ChevronRight, Anchor, Send, Navigation, Timer, RotateCcw, Activity, Wallet, Power } from 'lucide-react';

// --- TYPES (TypeScript için zorunlu) ---
interface TekneKartiProps {
  ad: string;
  kapasite: number;
  turda: boolean;
  kalanSure: number;
  onLaunch: () => void;
  onReset: () => void;
  tema: 'mavi' | 'turkuaz';
}

export default function App() {
  // --- AYARLAR ---
  const TUR_SURESI_DAKIKA = 40; 
  const MIN_KALKIS_SAYISI = 6;
  const API_URL = "http://127.0.0.1:8081";

  // --- STATE TANIMLAMALARI ---
  const [turNumarasi, setTurNumarasi] = useState<number>(() => parseInt(localStorage.getItem('turNumarasi') || '1'));
  const [gunlukCiro, setGunlukCiro] = useState<number>(0);
  const [kucukBitis, setKucukBitis] = useState<number | null>(() => parseInt(localStorage.getItem('kucukTekneBitis') || '0') || null);
  const [buyukBitis, setBuyukBitis] = useState<number | null>(() => parseInt(localStorage.getItem('buyukTekneBitis') || '0') || null);
  const [kucukKalan, setKucukKalan] = useState<number>(0);
  const [buyukKalan, setBuyukKalan] = useState<number>(0);
  const [yetiskinSayisi, setYetiskinSayisi] = useState<number>(0);
  const [cocukSayisi, setCocukSayisi] = useState<number>(0);
  const [iskeledekiYolcu, setIskeledekiYolcu] = useState<number>(0); 
  const [yukleniyor, setYukleniyor] = useState<boolean>(false);

  // --- SENKRONİZASYON ---
  useEffect(() => {
    const veriGuncelle = async () => {
        try {
            const havuzRes = await fetch(`${API_URL}/havuz-bilgi`);
            if(havuzRes.ok) {
                const havuzData = await havuzRes.json();
                setIskeledekiYolcu(havuzData.toplam);
            }
            const ciroRes = await fetch(`${API_URL}/gunluk-ciro`);
            if(ciroRes.ok) {
                const ciroData = await ciroRes.json();
                setGunlukCiro(ciroData.ciro);
            }
        } catch(e) { console.error("Sunucu hatası:", e); }
    };
    veriGuncelle();
    const interval = setInterval(veriGuncelle, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- ZAMANLAYICI ---
  useEffect(() => {
    const zamanlayici = setInterval(() => {
      const suan = Date.now();
      if (kucukBitis) {
        const fark = Math.floor((kucukBitis - suan) / 1000);
        if (fark > 0) setKucukKalan(fark); else manuelDonus('kucuk', false); 
      }
      if (buyukBitis) {
        const fark = Math.floor((buyukBitis - suan) / 1000);
        if (fark > 0) setBuyukKalan(fark); else manuelDonus('buyuk', false);
      }
    }, 1000);
    return () => clearInterval(zamanlayici);
  }, [kucukBitis, buyukBitis]);

  // --- İŞLEVLER ---
  const satisYap = async () => {
    const anlikSepet = yetiskinSayisi + cocukSayisi;
    if (anlikSepet === 0) return alert("Lütfen bilet seçin.");
    setYukleniyor(true);
    try {
      const cevap = await fetch(`${API_URL}/satis-yap`, {
        method: "POST", headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ yetiskin_sayisi: yetiskinSayisi, cocuk_sayisi: cocukSayisi, toplam_tutar: yetiskinSayisi * 250, tur_no: turNumarasi })
      });
      if (cevap.ok) { setYetiskinSayisi(0); setCocukSayisi(0); }
    } catch (hata) { console.error(hata); } finally { setYukleniyor(false); }
  };

  const tekneKaldir = async (tip: 'kucuk' | 'buyuk') => {
    const kapasite = tip === 'kucuk' ? 20 : 40;
    const binecek = Math.min(iskeledekiYolcu, kapasite);
    if (binecek < MIN_KALKIS_SAYISI) return alert(`En az ${MIN_KALKIS_SAYISI} yolcu gerekli.`);
    
    if (window.confirm("Sefer başlasın mı?")) {
        const bitis = Date.now() + (TUR_SURESI_DAKIKA * 60 * 1000);
        if (tip === 'kucuk') { setKucukBitis(bitis); localStorage.setItem('kucukTekneBitis', bitis.toString()); }
        else { setBuyukBitis(bitis); localStorage.setItem('buyukTekneBitis', bitis.toString()); }
        setTurNumarasi(prev => prev + 1);
    }
  };

  const manuelDonus = (tip: 'kucuk' | 'buyuk', elle = true) => {
    if (elle && !window.confirm("Manuel sıfırlansın mı?")) return;
    if (tip === 'kucuk') { setKucukBitis(null); localStorage.removeItem('kucukTekneBitis'); } 
    else { setBuyukBitis(null); localStorage.removeItem('buyukTekneBitis'); }
  };

  const formatSure = (saniye: number) => {
    const dk = Math.floor(saniye / 60);
    const sn = saniye % 60;
    return `${dk}:${sn < 10 ? '0' : ''}${sn}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* SEMANTİK HEADER [cite: 741-743] */}
      <header className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-50 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Ship size={24} className="text-blue-900" />
            <h1 className="text-xl font-black uppercase">Dark Canyon Cafe</h1>
          </div>
          <nav aria-label="Hızlı Erişim">
            <button onClick={() => window.confirm("Sıfırlansın mı?") && localStorage.clear()} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Power size={14} /> GÜN SONU
            </button>
          </nav>
        </div>
      </header>

      {/* SEMANTİK MAIN [cite: 747-748] */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BİLET GİŞESİ SECTION [cite: 750-752] */}
        <section className="lg:col-span-4 bg-white rounded-3xl shadow-xl p-6 border" aria-labelledby="gise-baslik">
          <h2 id="gise-baslik" className="font-bold text-lg flex items-center gap-2 mb-6"><Ticket className="text-blue-600" /> Bilet Gişesi</h2>
          
          <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-2xl flex justify-between items-center" role="status">
               <span className="text-sm font-bold text-emerald-600">Günlük Hasılat</span>
               <span className="text-2xl font-black text-emerald-700">{gunlukCiro} ₺</span>
            </div>

            {/* ERİŞİLEBİLİR FORM ELEMANI [cite: 1050-1051] */}
            <div className="space-y-4">
              <label htmlFor="yetiskin-input" className="block font-bold text-slate-700">Yetişkin Sayısı (250 ₺)</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setYetiskinSayisi(Math.max(0, yetiskinSayisi - 1))} className="w-12 h-12 bg-slate-100 rounded-xl">-</button>
                <input id="yetiskin-input" type="number" readOnly value={yetiskinSayisi} className="flex-1 text-center font-black text-2xl bg-transparent border-none" />
                <button onClick={() => setYetiskinSayisi(yetiskinSayisi + 1)} className="w-12 h-12 bg-slate-900 text-white rounded-xl">+</button>
              </div>
            </div>

            <button onClick={satisYap} disabled={yukleniyor} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200">
              {yukleniyor ? "İşleniyor..." : "BİLETİ KES & HAVUZA EKLE"}
            </button>
          </div>
        </section>

        {/* İSKELE ALANI SECTION [cite: 750-752] */}
        <section className="lg:col-span-8 space-y-6" aria-labelledby="iskele-baslik">
          <div className="bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm">
            <h2 id="iskele-baslik" className="text-lg font-bold flex items-center gap-3">İskele Bekleme Alanı</h2>
            <div className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black flex items-center gap-2" role="status">
              <User size={16} /> {iskeledekiYolcu} Bekliyor
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <TekneKarti 
                ad="Kanyon Runner" kapasite={20} turda={kucukBitis !== null} 
                kalanSure={kucukKalan} onLaunch={() => tekneKaldir('kucuk')} 
                onReset={() => manuelDonus('kucuk')} tema="mavi" 
             />
             <TekneKarti 
                ad="Eğin Tur" kapasite={40} turda={buyukBitis !== null} 
                kalanSure={buyukKalan} onLaunch={() => tekneKaldir('buyuk')} 
                onReset={() => manuelDonus('buyuk')} tema="turkuaz" 
             />
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto p-6 text-center text-slate-400 text-xs border-t mt-12">
        <p>&copy; 2026 Dark Canyon Cafe. Tüm hakları saklıdır. [Beyza Kuzu - Lab 2]</p>
      </footer>
    </div>
  );
}

// --- TEKNE KARTI BİLEŞENİ (TS UYUMLU) ---
const TekneKarti: React.FC<TekneKartiProps> = ({ ad, kapasite, turda, kalanSure, onLaunch, onReset, tema }) => {
    return (
        <article className={`rounded-3xl p-6 min-h-[400px] flex flex-col justify-between border transition-all ${turda ? 'bg-[#0f172a] text-white' : 'bg-white'}`}>
            <header className="flex justify-between items-start">
                <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-60">{turda ? "Yayında" : "Beklemede"}</span>
                    <h3 className="text-2xl font-black mt-1">{ad}</h3>
                </div>
                <Ship size={32} className={turda ? 'text-blue-400' : 'text-slate-300'} />
            </header>

            {turda ? (
                <div className="text-center" role="timer" aria-live="polite">
                    <p className="text-xs text-slate-400 uppercase">Dönüşe Kalan</p>
                    <div className="text-5xl font-black font-mono tracking-tighter my-4">{Math.floor(kalanSure/60)}:{(kalanSure%60).toString().padStart(2,'0')}</div>
                    <button onClick={onReset} className="text-xs text-red-400 font-bold flex items-center gap-2 mx-auto"><RotateCcw size={14}/> Manuel Sıfırla</button>
                </div>
            ) : (
                <button onClick={onLaunch} className={`w-full py-4 rounded-xl font-bold ${tema === 'mavi' ? 'bg-blue-600 text-white' : 'bg-cyan-600 text-white'}`}>
                   KALDIR ({kapasite} Kişilik)
                </button>
            )}
        </article>
    );
};