import React from 'react';

export default function HeroSection() {
  return (
    // Background terang dan modern dengan font sans-serif
    <div className="min-h-screen bg-slate-50 font-sans overflow-hidden relative selection:bg-blue-200">
      
      {/* Decorative Background Elements (Cahaya lembut di latar belakang) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <span className="text-white font-bold text-xl leading-none">学</span>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-wider">EduCorp LMS</span>
        </div>
        
        {/* Navigasi Utama */}
        <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
          <a href="/" className="hover:text-blue-600 transition-colors">ホーム (Home)</a>
          <a href="/" className="hover:text-blue-600 transition-colors">機能 (Fitur)</a>
          <a href="/" className="hover:text-blue-600 transition-colors">導入事例 (Studi Kasus)</a>
          <a href="/" className="hover:text-blue-600 transition-colors">料金プラン (Harga)</a>
        </div>
        
        {/* Tombol Auth */}
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
            ログイン (Login)
          </a>
          <a href="/" className="hidden sm:inline-block text-sm font-bold bg-slate-800 text-white px-5 py-2.5 rounded-full hover:bg-slate-700 transition-colors shadow-md">
            お問い合わせ (Kontak)
          </a>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between px-6 pt-12 pb-24 max-w-7xl mx-auto gap-16 md:gap-12 mt-8 md:mt-12">
        
        {/* Kiri: Teks & Call to Action */}
        <div className="w-full lg:w-1/2 flex flex-col items-start gap-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-xs font-bold text-blue-700 tracking-widest">次世代の企業向けLMS</span> {/* LMS Perusahaan Generasi Berikutnya */}
          </div>

          {/* Headline Utama */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.15] tracking-tight">
            社員の<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm">可能性</span>を<br />
            最大限に引き出す。
          </h1>
          {/* Terjemahan Headline: Memaksimalkan "Potensi" karyawan. */}

          {/* Subheadline */}
          <p className="text-lg text-slate-600 leading-relaxed max-w-xl font-medium mt-2">
            直感的なUIとAI駆動の学習パスで、組織全体のスキルアップを加速。
            いつでも、どこでも、最高の学習体験を提供します。
          </p>
          {/* Terjemahan Subheadline: Mempercepat peningkatan keterampilan seluruh organisasi dengan UI intuitif... */}

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full mt-6">
            <a 
              href="/" 
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 hover:shadow-blue-600/30 transition-all duration-300"
            >
              無料で始める (Coba Gratis)
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
            <a 
              href="/" 
              className="flex items-center justify-center px-8 py-4 rounded-xl font-bold text-lg text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              資料ダウンロード (Unduh Dokumen)
            </a>
          </div>
          
          {/* Trust Indicators / Logo Perusahaan (Opsional) */}
          <div className="mt-8 pt-8 border-t border-slate-200 w-full">
            <p className="text-xs text-slate-500 font-bold mb-4 tracking-widest uppercase">導入企業500社突破 (Dipercaya lebih dari 500 perusahaan)</p>
            <div className="flex flex-wrap items-center gap-8 opacity-40 grayscale select-none">
              <div className="text-xl font-black">SAKURA<span className="text-blue-600">.inc</span></div>
              <div className="text-xl font-bold tracking-tighter">TECH<span className="font-light">KYOTO</span></div>
              <div className="text-xl font-serif font-bold italic">NipponGlobal</div>
            </div>
          </div>
        </div>

        {/* Kanan: Visual Dashboard Mockup */}
        <div className="w-full lg:w-1/2 relative">
          {/* Aksen Latar Belakang Mockup */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 transform translate-x-4 translate-y-4 rounded-3xl -z-10"></div>
          
          <div className="relative w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 md:p-8 transform transition-transform hover:scale-[1.02] duration-500">
            
            {/* Header Mockup */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-slate-800">学習ダッシュボード (Dashboard Belajar)</span>
                <span className="text-xs text-slate-400 font-medium mt-1">こんにちは、Purwaさん </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl border-2 border-white shadow-sm">
              
              </div>
            </div>

            {/* Grid Konten Mockup */}
            <div className="grid grid-cols-2 gap-4 h-full">
              
              {/* Card 1: Kursus Saat Ini */}
              <div className="col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100/50 flex items-center justify-between relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="relative z-10">
                  <div className="text-xs font-bold text-blue-600 mb-1.5 tracking-wider">現在のコース (Kursus Saat Ini)</div>
                  <div className="text-base font-bold text-slate-800">フロントエンド開発 (React / Tailwind)</div>
                </div>
                <div className="relative z-10 w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 flex items-center justify-center bg-white shadow-sm">
                  <span className="text-sm font-bold text-blue-700">75%</span>
                </div>
              </div>

              {/* Card 2: Modul Selesai */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between hover:bg-white transition-colors cursor-default">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xl mb-4">
                  B
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800 mb-1">12</div>
                  <div className="text-xs text-slate-500 font-bold tracking-wide">完了したモジュール (Modul Selesai)</div>
                </div>
              </div>

              {/* Card 3: Poin/EXP */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between hover:bg-white transition-colors cursor-default">
                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xl mb-4">
                  A
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800 mb-1">1,450</div>
                  <div className="text-xs text-slate-500 font-bold tracking-wide">獲得ポイント (EXP Diperoleh)</div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </main>
    </div>
  );
}