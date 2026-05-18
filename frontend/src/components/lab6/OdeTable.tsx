import React from 'react';
import { OdeResult } from '../../types';

interface Props {
    results: OdeResult[];
}

export const OdeTable: React.FC<Props> = ({ results }) => {

    const basePoints = results[0].points;

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b-2 border-slate-100">
                        <th className="py-3 px-2 text-[10px] font-black text-slate-400 uppercase">i</th>
                        <th className="py-3 px-2 text-[10px] font-black text-slate-400 uppercase">x</th>
                        {results.map(res => (
                            <th key={res.methodName} className="py-3 px-2 text-[10px] font-black text-slate-400 uppercase">
                                y ({res.methodName})
                            </th>
                        ))}
                        <th className="py-3 px-2 text-[10px] font-black text-blue-600 uppercase">y (Точное)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {basePoints.map((p, idx) => (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-2 font-mono text-xs text-slate-400">{idx}</td>
                            <td className="py-3 px-2 font-mono text-xs">{p.x.toFixed(5)}</td>
                            {results.map(res => (
                                <td key={res.methodName} className="py-3 px-2 font-mono text-xs">
                                    {res.points[idx]?.y.toFixed(10) || "—"}
                                </td>
                            ))}
                            <td className="py-3 px-2 font-mono text-xs font-bold text-blue-600">
                                {p.yExact}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {results.map((res, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{res.methodName}</div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-500">Погрешность (Рунге):</span>
                                <span className="text-xs font-mono font-bold">
                                    {res.errorRunge !== 0 ? res.errorRunge.toFixed(10) : "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-slate-500">Откл. от точного:</span>
                                <span className="text-xs font-mono font-bold text-red-500">
                                    {res.errorExact.toFixed(10)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};