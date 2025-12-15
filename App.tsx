import React, { useState } from 'react';
import { DATA_1BAT, DATA_2BAT } from './constants';
import { CourseManager } from './components/CourseManager';

function App() {
  const [activeTab, setActiveTab] = useState<'1bat' | '2bat'>('1bat');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
             </div>
             <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                  Coordinació Batxillerat
                </h1>
                <p className="text-xs text-slate-500 font-medium">Gestió de Recuperacions</p>
             </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-1px]">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('1bat')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === '1bat' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
              `}
            >
              1r Batxillerat
            </button>
            <button
              onClick={() => setActiveTab('2bat')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === '2bat' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
              `}
            >
              2n Batxillerat
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render 1st Bat logic (Hidden via CSS if not active to preserve state) */}
        <div style={{ display: activeTab === '1bat' ? 'block' : 'none' }}>
           <CourseManager initialData={DATA_1BAT} title="1r Batxillerat" />
        </div>

        {/* Render 2nd Bat logic */}
        <div style={{ display: activeTab === '2bat' ? 'block' : 'none' }}>
           <CourseManager initialData={DATA_2BAT} title="2n Batxillerat" />
        </div>

      </main>
    </div>
  );
}

export default App;