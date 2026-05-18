import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OdeResult } from '../../types';

export const OdeChart = ({ results }: { results: OdeResult[] }) => {
    const [visibility, setVisibility] = useState<Record<string, boolean>>({
        "Точное решение": true,
        "Метод Эйлера (усов.)": true,
        "Метод Рунге-Кутта 4": true,
        "Метод Милна": true
    });

    const toggleVisibility = (name: string) => {
        setVisibility(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const chartData = results[0].points.map((p, idx) => {
        const point: any = { x: Number(p.x.toFixed(4)) };
        point["Точное решение"] = p.yExact;
        results.forEach(res => {
            point[res.methodName] = res.points[idx]?.y;
        });
        return point;
    });

    const colors: Record<string, string> = {
        "Метод Эйлера (усов.)": "#2563eb",
        "Метод Рунге-Кутта 4": "#10b981",
        "Метод Милна": "#f59e0b",
        "Точное решение": "#000000"
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(visibility).map((name) => (
                    <button
                        key={name}
                        onClick={() => toggleVisibility(name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                            visibility[name]
                                ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
                                : 'bg-slate-100 border-transparent text-slate-400'
                        }`}
                    >
                        {name}
                        {visibility[name] && (
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: colors[name] }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={['auto', 'auto']}
                            fontSize={10}
                            tickFormatter={(val) => val.toFixed(2)}
                        />
                        <YAxis fontSize={10} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="Точное решение"
                            stroke={colors["Точное решение"]}
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="5 5"
                            hide={!visibility["Точное решение"]}
                        />

                        {results.map((res) => (
                            <Line
                                key={res.methodName}
                                type="monotone"
                                dataKey={res.methodName}
                                stroke={colors[res.methodName] || "#6366f1"}
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                                hide={!visibility[res.methodName]}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};