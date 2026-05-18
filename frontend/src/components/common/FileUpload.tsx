import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { OdeRequest } from '../../types';

interface OdeFileUploadProps {
    onDataLoaded: (data: OdeRequest) => void;
}

export const OdeFileUpload: React.FC<OdeFileUploadProps> = ({ onDataLoaded }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>('');

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            parseOdeFile(content);
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
        setFileName(file.name);
    };

    const parseOdeFile = (content: string) => {
        try {
            const matches = content.replace(/,/g, '.').match(/-?\d+(\.\d+)?/g);

            if (!matches || matches.length < 6) {
                throw new Error("Файл должен содержать минимум 6 чисел: ID, x0, y0, xn, h, eps");
            }

            const values = matches.map(Number);
            const [equationId, x0, y0, xn, h, epsilon] = values;

            if (values.some(isNaN)) throw new Error("Ошибка в формате чисел");
            if (equationId < 1 || equationId > 3) throw new Error("ID уравнения: 1, 2 или 3");
            if (xn <= x0) throw new Error("xn должен быть больше x0 (интервал слева направо)");
            if (h <= 0) throw new Error("Шаг h должен быть > 0");

            onDataLoaded({
                equationId: Math.floor(equationId),
                x0, y0, xn, h, epsilon
            });

            toast.success(`Данные загружены! x0: ${x0}, y0: ${y0}`);
        } catch (err: any) {
            toast.error(err.message);
            setFileName('');
        }
    };

    const clearFile = () => {
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-[10px] font-black uppercase tracking-widest rounded shadow-sm"
            >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                {fileName ? 'Сменить конфиг' : 'Загрузить .txt'}
            </button>

            <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />

            {fileName && (
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
                    <span className="text-[9px] text-blue-600 font-mono font-bold truncate max-w-[100px]">{fileName}</span>
                    <button onClick={clearFile} className="hover:bg-blue-200 rounded-full p-0.5"><X className="w-2.5 h-2.5 text-blue-400" /></button>
                </div>
            )}
        </div>
    );
};