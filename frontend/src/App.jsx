import React from 'react';

export default function App() {
  return (
    // Background ala Arabian Nights gelap
    <div className="min-h-screen bg-[#0a1128] font-mono flex items-center justify-center p-4 sm:p-10 text-white selection:bg-amber-500/30">
      
      {/* Game UI Window / Console Container */}
      <div className="relative w-full max-w-5xl bg-[#0d1b2a] border-4 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        
        {/* Pixel Corners (Efek Sudut Retro) */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-500"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-500"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-500"></div>

        <div className="p-6 md:p-12 border-[3px] border-amber-900/40 m-1">
          
          {/* Game HUD (Heads-Up Display) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            
            {/* Player/System Badge */}
            <div className="flex items-center gap-3 bg-amber-500 text-black px-4 py-1.5 font-bold tracking-widest uppercase">
              <span className="text-xl">۞</span>
              LMS
            </div>

            {/* EXP / Level Bar (Teks Arab untuk Experience) */}
            <div className="flex items-center gap-3 w-full sm:w-64">
              <span className="text-amber-500 font-bold" dir="rtl">خبرة :</span>
              <div className="flex-1 h-4 bg-[#1b263b] border-2 border-slate-600 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[75%] bg-gradient-to-r from-emerald-500 to-green-400"></div>
                {/* Scanline effect pada bar */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')]"></div>
              </div>
            </div>

          </div>

          {/* Main Title (Sesuai Request: Indonesia) */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 drop-shadow-[0_4px_0_rgba(146,64,14,1)] mb-4 hover:scale-105 transition-transform duration-300">
              TIM 2 - ruangBelajar
            </h1>
          </div>

          {/* Quest Dialog Box (Sesuai Request: Sisa Teks Arab) */}
          <div className="relative bg-[#1b263b] border-2 border-dashed border-amber-600/50 p-6 md:p-8 mb-12">
            {/* Ornamen Box */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0d1b2a] px-4 text-emerald-400 font-bold tracking-widest">
              [ مَهمَّة جَدِيدَة ] {/* Terjemahan: Misi Baru (New Quest) */}
            </div>

            <p 
              className="text-amber-100/90 text-lg md:text-2xl leading-loose text-center drop-shadow-md"
              style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", lineHeight: '2' }}
              dir="rtl"
            >
              مَرْحَبًا بِكُمْ أَيُّهَا الْأَبْطَالُ فِي نِظَامِ إِدَارَةِ التَّعَلُّمِ.
              <br />
              هُنَا تَبْدَأُ رِحْلَتُكُمْ لِكَسْبِ الْمَعْرِفَةِ، إِتْمَامِ الْمَهَامِ، وَالِارْتِقَاءِ بِمُسْتَوَياتِكُمْ. 
              <br />
              هَلْ أَنْتُمْ مُسْتَعِدُّونَ لِبَدْءِ الْمُغَامَرَةِ؟
            </p>
          </div>

          {/* Action Button (Press Start) */}
          <div className="flex justify-center">
            {/* Path langsung dikembalikan ke halaman Home ("/") sesuai konfigurasi navigasi */}
            <a 
              href="/"
              className="group relative inline-block bg-[#0d1b2a] border-2 border-amber-500 text-amber-500 px-8 py-3 text-xl font-bold uppercase transition-all hover:bg-amber-500 hover:text-black focus:outline-none focus:ring-4 focus:ring-amber-500/50"
            >
              <span className="animate-pulse" dir="rtl">
                [ اِبْدَأْ ] {/* Terjemahan: Start / Mulai */}
              </span>
            </a>
          </div>

        </div>
      </div>
      
    </div>
  );
}