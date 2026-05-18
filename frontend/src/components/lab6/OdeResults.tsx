import React from 'react';
import { OdeResult } from '../../types';
import { OdeChart } from './OdeChart';
import { OdeTable } from './OdeTable';

interface OdeResultsProps {
    results: OdeResult[];
}

export const OdeResults: React.FC<OdeResultsProps> = ({ results }) => {
    if (!results || results.length === 0) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-none">Графики решений</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">Визуальное сравнение методов</p>
                    </div>
                </div>

                <div className="h-[450px] w-full">
                    <OdeChart results={results} />
                </div>

            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 leading-none">Результаты вычислений</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-wider">Сравнение численных значений</p>
                    </div>
                </div>

                <OdeTable results={results} />

            </div>
        </div>
    );
};