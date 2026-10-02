import React, { useState } from 'react';
import { Header } from "./Header";
import { sweepApi } from "../services/api";
import { AlertCircle, X, Hash } from 'lucide-react';

export const SweepPage = () => {
    const [n, setN] = useState<number>(4);
    const [matrix, setMatrix] = useState({
        a: [0, 1, 1, 1],
        c: [4, 4, 4, 4],
        b: [1, 1, 1, 0],
        f: [5, 6, 6, 5]
    });
    const [results, setResults] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDimensionChange = (newN: number) => {
        if (newN < 2 || newN > 10) return;
        setN(newN);
        setMatrix({
            a: Array(newN).fill(1).map((_, i) => i === 0 ? 0 : 1),
            c: Array(newN).fill(4),
            b: Array(newN).fill(1).map((_, i) => i === newN - 1 ? 0 : 1),
            f: Array(newN).fill(5)
        });
        setResults([]);
        setError(null);
    };

    const handleCellChange = (diagonal: 'a' | 'c' | 'b' | 'f', index: number, value: number) => {
        const updated = [...matrix[diagonal]];
        updated[index] = value;
        setMatrix({ ...matrix, [diagonal]: updated });
    };

    const handleSolve = async () => {
        setError(null);
        setLoading(true);

        if (matrix.c.some(val => val === 0)) {
            setError("Элементы главной диагонали (C) не должны быть равны нулю");
            setLoading(false);
            return;
        }

        try {
            const data = await sweepApi.solve({
                a: matrix.a,
                c: matrix.c,
                b: matrix.b,
                f: matrix.f
            });
            setResults(data);
        } catch (err: any) {
            const errorMessage = err.response?.data || "Не удалось решить систему уравнений";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Header />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

                    <div className="lg:col-span-7 space-y-6">
                        <section className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-800">Метод прогонки (СЛАУ)</h2>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                                    <Hash className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-500 uppercase">Размерность N:</span>
                                    <input
                                        type="number"
                                        value={n}
                                        onChange={e => handleDimensionChange(Number(e.target.value))}
                                        className="w-12 bg-transparent text-center font-mono text-sm font-bold outline-none text-blue-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-5">
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-black text-red-800 text-[10px] uppercase tracking-wider mb-1">
                                                Ошибка матрицы / вычислений
                                            </h4>
                                            <p className="text-xs font-mono font-bold leading-relaxed">{error}</p>
                                        </div>
                                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 p-0.5 rounded-full hover:bg-red-100 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                            <th className="p-3 text-center">Узел i</th>
                                            <th className="p-3">Aᵢ (нижняя)</th>
                                            <th className="p-3">Cᵢ (главная)</th>
                                            <th className="p-3">Bᵢ (верхняя)</th>
                                            <th className="p-3">F_i (правая часть)</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-mono text-sm">
                                        {Array(n).fill(0).map((_, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-3 text-center font-bold text-slate-400">{i + 1}</td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        value={matrix.a[i]}
                                                        disabled={i === 0}
                                                        onChange={e => handleCellChange('a', i, Number(e.target.value))}
                                                        className={`w-full p-2 border rounded-xl text-center transition-all ${i === 0 ? 'bg-slate-100 text-slate-300 border-transparent' : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500'}`}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        value={matrix.c[i]}
                                                        onChange={e => handleCellChange('c', i, Number(e.target.value))}
                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-center focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        value={matrix.b[i]}
                                                        disabled={i === n - 1}
                                                        onChange={e => handleCellChange('b', i, Number(e.target.value))}
                                                        className={`w-full p-2 border rounded-xl text-center transition-all ${i === n - 1 ? 'bg-slate-100 text-slate-300 border-transparent' : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500'}`}
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        value={matrix.f[i]}
                                                        onChange={e => handleCellChange('f', i, Number(e.target.value))}
                                                        className="w-full p-2 bg-blue-50/50 border border-blue-100 rounded-xl text-center focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-blue-700 font-bold"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button
                                    onClick={handleSolve}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? "Вычисление..." : "Решить методом прогонки"}
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <section className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 h-full min-h-[400px] flex flex-col">
                            <h3 className="text-base font-bold text-slate-800 mb-4">Вектор неизвестных (Решение X)</h3>

                            {results.length > 0 ? (
                                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                                    {results.map((val, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono">
                                            <span className="text-xs font-bold text-slate-400">X〔{idx + 1}〕=</span>
                                            <span className="text-sm font-black text-blue-600">{val.toFixed(6)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl p-4">
                                    <p className="text-sm font-medium">Решение отсутствует</p>
                                    <p className="text-[11px] opacity-60 text-center mt-1">Заполните трехдиагональную матрицу и запустите алгоритм прогонки.</p>
                                </div>
                            )}
                        </section>
                    </div>

                </div>
            </div>
        </div>
    );
};