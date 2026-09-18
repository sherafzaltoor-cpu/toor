import React, { useState } from 'react';
import { 
  X, 
  Ticket, 
  Printer, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  Wifi, 
  Clock, 
  Coins 
} from 'lucide-react';
import { HotspotProfile, Language, VoucherCard } from '../types';

interface VoucherGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: HotspotProfile[];
  onGenerateBatch: (vouchers: any[]) => void;
  lang: Language;
}

export const VoucherGeneratorModal: React.FC<VoucherGeneratorModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onGenerateBatch,
  lang
}) => {
  const isUrdu = lang === 'ur';

  const [count, setCount] = useState(6);
  const [profile, setProfile] = useState(profiles[1]?.name || '1-Day-Pass');
  const [prefix, setPrefix] = useState('PIN-');
  const [price, setPrice] = useState('Rs. 50');
  const [validity, setValidity] = useState('24 Hours');
  const [generatedCards, setGeneratedCards] = useState<VoucherCard[]>([]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const cards: VoucherCard[] = [];
    const payloadForRouter: any[] = [];

    for (let i = 0; i < count; i++) {
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      const randomCode = prefix + Math.floor(100000 + Math.random() * 900000).toString();
      
      cards.push({
        id: `vc-${Date.now()}-${i}`,
        code: randomCode,
        pin: randomPin,
        profile,
        validity,
        quota: profile.includes('1-Day') ? '5 GB' : '2 GB',
        price,
        createdAt: new Date().toLocaleDateString()
      });

      payloadForRouter.push({
        name: randomCode,
        password: randomPin,
        profile,
        uptimeLimit: profile.includes('1-Day') ? '1d' : '3h',
        bytesLimit: profile.includes('1-Day') ? '5368709120' : '2147483648',
        comment: `Voucher ${price} - Valid: ${validity}`
      });
    }

    setGeneratedCards(cards);
    onGenerateBatch(payloadForRouter);
  };

  const handleCopyAll = () => {
    if (generatedCards.length === 0) return;
    const text = generatedCards
      .map(c => `User: ${c.code} | PIN: ${c.pin} | Package: ${c.profile} | Price: ${c.price}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-lg border border-amber-500/30">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isUrdu ? 'ہاٹ سپاٹ بیچ واؤچرز جنریٹر' : 'Hotspot Batch Voucher Generator'}
              </h3>
              <p className="text-xs text-slate-400">
                {isUrdu
                  ? 'دکان، مہمانوں، یا وائی فائی کسٹمرز کیلئے اسکریچ کارڈز اور پن واؤچرز بنائیں'
                  : 'Generate printable Wi-Fi PIN cards with speed limits and quota'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'تعداد (Quantity):' : 'Quantity:'}
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value={3}>3 Vouchers</option>
                <option value={6}>6 Vouchers</option>
                <option value={12}>12 Vouchers</option>
                <option value={24}>24 Vouchers</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'پیکج (Profile):' : 'Profile:'}
              </label>
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.rateLimit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'پریفکس (Prefix):' : 'Prefix:'}
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'قیمت (Price):' : 'Price:'}
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">
                {isUrdu ? 'میعاد (Validity):' : 'Validity:'}
              </label>
              <input
                type="text"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isUrdu ? 'واؤچرز تیار کریں' : 'Generate Vouchers'}</span>
            </button>

            {generatedCards.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy All List'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 shadow transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'پرنٹ کارڈز' : 'Print Cards'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Cards Grid (Printable layout) */}
          {generatedCards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
              {generatedCards.map((card) => (
                <div
                  key={card.id}
                  className="p-3.5 rounded-xl bg-slate-950 border-2 border-dashed border-amber-800/80 text-slate-200 space-y-2 relative overflow-hidden shadow"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>TOOR NET Hotspot</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
                      {card.price}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Login User:</span>
                      <span className="font-mono font-bold text-white">{card.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Password / PIN:</span>
                      <span className="font-mono font-bold text-amber-300">{card.pin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Profile / Speed:</span>
                      <span className="font-mono text-cyan-300 text-[11px]">{card.profile}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Validity:</span>
                      <span className="font-mono text-slate-300 text-[11px]">{card.validity}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-center text-slate-500 font-mono">
                    Connect Wi-Fi & open browser to login
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <Ticket className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">
                {isUrdu 
                  ? 'واؤچر کی تعداد اور پیکج منتخب کریں اور "واؤچرز تیار کریں" پر کلک کریں۔' 
                  : 'Select quantity and package, then click "Generate Vouchers".'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
