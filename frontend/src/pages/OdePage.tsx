import React, { useState, useEffect } from 'react';
import { Header } from "./Header";
import { odeApi } from "../services/api";
import { OdeRequest, OdeResult, Equation } from "../types";
import { OdeFileUpload } from "../components/common/FileUpload";
import { OdeResults } from "../components/lab6/OdeResults";
import { AlertCircle, X } from 'lucide-react';

export const OdePage = () => {
    const [equations, setEquations] = useState<Equation[]>([]);
    const [params, setParams] = useState<OdeRequest>({
        equationId: 1, x0: 0, y0: 1, xn: 1, h: 0.1, epsilon: 0.001
    });
    const [results, setResults] = useState<OdeResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        odeApi.getEquations()
            .then(setEquations)
            .catch(() => {
                setError("Не удалось загрузить уравнения с сервера. Проверьте соединение.");
            });
    }, []);

    const handleSolve = async () => {
        setError(null);

        if (params.xn <= params.x0) {
            setError("Конечная точка xₙ должна быть строго больше начальной точки x₀");
            return;
        }

        if (params.h <= 0) {
            setError("Шаг h должен быть больше нуля");
            return;
        }

        if (params.xn < params.x0 + 3 * params.h) {
            setError("Интервал (xₙ - x₀) должен содержать минимум 3 шага h для корректного старта метода Милна");
            return;
        }

        setLoading(true);
        try {
            const data = await odeApi.solve(params);
            setResults(data);
        } catch (err: any) {
            const errorMessage = err.response?.data || "Произошла непредвиденная ошибка при вычислении";
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

                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-slate-800">ОДУ</h2>
                                </div>
                                <OdeFileUpload onDataLoaded={setParams} />
                            </div>

                            <div className="space-y-5">

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-black text-red-800 text-[10px] uppercase tracking-wider mb-1">
                                                Ошибка выполнения
                                            </h4>
                                            <p className="text-xs font-mono font-bold leading-relaxed">{error}</p>
                                        </div>
                                        <button
                                            onClick={() => setError(null)}
                                            className="text-red-400 hover:text-red-600 p-0.5 rounded-full hover:bg-red-100 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                        Выберите ОДУ
                                    </label>
                                    <select
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={params.equationId}
                                        onChange={e => setParams({...params, equationId: Number(e.target.value)})}
                                    >
                                        {equations.map(eq => (
                                            <option key={eq.id} value={eq.id}>{eq.formula}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Начало x₀</label>
                                        <input type="number" step="0.1" value={params.x0} onChange={e => setParams({...params, x0: +e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Условие y₀</label>
                                        <input type="number" step="0.1" value={params.y0} onChange={e => setParams({...params, y0: +e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Конец xₙ</label>
                                        <input type="number" step="0.1" value={params.xn} onChange={e => setParams({...params, xn: +e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"/>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Шаг h</label>
                                        <input type="number" step="0.01" value={params.h} onChange={e => setParams({...params, h: +e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"/>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                                        Точность (ε) для метода Милна
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={params.epsilon}
                                        onChange={e => setParams({...params, epsilon: +e.target.value})}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm"
                                    />
                                </div>

                                <button
                                    onClick={handleSolve}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? "Вычисление..." : "Решить задачу"}
                                </button>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        {results.length > 0 ? (
                            <OdeResults results={results} />
                        ) : (
                            <div className="h-full min-h-[600px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400 bg-white/50 p-6">
                                <p className="font-medium text-slate-700">Ожидание входных данных</p>
                                <p className="text-xs opacity-60 max-w-[240px] text-center mt-2 leading-relaxed">
                                    Сконфигурируйте параметры ОДУ слева или загрузите файл конфигурации, затем нажмите кнопку расчета.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};