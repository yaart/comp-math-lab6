import React, { useState } from 'react';
import { OdePage } from './pages/OdePage';
import { SweepPage } from './pages/SweepPage';

function App() {
    const [activeTab, setActiveTab] = useState<'ode' | 'sweep'>('ode');

    return (
        <div className="App min-h-screen bg-[#f8fafc]">
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-start gap-4 h-16">

                    <button
                        onClick={() => setActiveTab('ode')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                            activeTab === 'ode'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                    >
                        Решение ОДУ
                    </button>

                    <button
                        onClick={() => setActiveTab('sweep')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                            activeTab === 'sweep'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                        }`}
                    >
                        Метод прогонки (СЛАУ)
                    </button>

                </div>
            </div>

            <main>
                {activeTab === 'ode' ? <OdePage /> : <SweepPage />}
            </main>
        </div>
    );
}

export default App;