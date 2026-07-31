import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono p-4 sm:p-10 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-4xl text-xs sm:text-sm md:text-base">
        
        {/* ASCII Art Logo - Katana Signature Orange/Amber color */}
        <pre className="text-amber-500 font-bold mb-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
          {`
___________.__              ________       __________ __________
\\__    ___/|__| _____       \\_____  \\      \\______   \\\\______   \\
  |    |   |  |/     \\       /  ____/       |       _/ |    |  _/
  |    |   |  |  Y Y  \\     /       \\       |    |   \\ |    |   \\
  |____|   |__|__|_|  /     \\_______ \\ ____ |____|_  / |______  /
                    \\/              \\//____/       \\/         \\/
          `}
        </pre>

        {/* Tool Info / Credits Layout */}
        <div className="mb-6 text-gray-500 text-sm">
          <div className="flex flex-wrap justify-between max-w-2xl mb-1">
            <span>
              <a href="#" className="hover:text-gray-300 transition-colors">
                github.com/ruangbelajar/tim-2
              </a>
            </span>
            <span className="text-amber-500 font-semibold px-2 py-0.5 bg-amber-500/10 rounded">
              v2.0.4-dev
            </span>
          </div>
          <div className="border-b border-gray-800 max-w-2xl"></div>
        </div>

        {/* Startup Logs (CLI Output) */}
        <div className="space-y-1.5 tracking-wide">
          <p>
            <span className="text-cyan-500 font-bold">[INF]</span> Current RuangBelajar Engine version: <span className="text-green-400">v2.0.4-dev</span>
          </p>
          <p>
            <span className="text-cyan-500 font-bold">[INF]</span> Initializing <span className="text-amber-500 font-bold">TIM-2</span> modules...
          </p>
          <p>
            <span className="text-yellow-500 font-bold">[WRN]</span> Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </p>
          <p>
            <span className="text-cyan-500 font-bold">[INF]</span> Rerum dicta repellendus quas deleniti dignissimos voluptas illo.
          </p>
          <p>
            <span className="text-green-500 font-bold">[DBG]</span> Modi consequuntur hic mollitia eveniet fugiat nihil et a?
          </p>
          <p>
            <span className="text-cyan-500 font-bold">[INF]</span> Aliquid hic sit asperiores assumenda?
          </p>
          <p>
            <span className="text-cyan-500 font-bold">[INF]</span> Loaded <span className="text-amber-500">1337</span> payloads from database.
          </p>

          {/* Simulating running process with loading bar */}
          <div className="mt-8 flex items-center gap-2 text-gray-400">
            <span className="text-cyan-500 font-bold">[PGL]</span>
            <span>Running background jobs:</span>
            <span className="text-amber-500">100%</span>
            <span className="text-gray-600">|████████████████████|</span>
            <span className="text-gray-500">(42/42)</span>
          </div>

          {/* Waiting Cursor */}
          <div className="mt-4 text-amber-500">
            tim-2-rb {'>'} 
            <span className="ml-2 inline-block w-2 h-4 bg-amber-500 align-middle animate-pulse"></span>
          </div>
        </div>

      </div>
      
    </div>
  );
}