import React, { useState } from 'react';
import { X, Delete, Equal } from 'lucide-react';
import { playTapSound } from '../utils/audio';

interface FloatingCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const FloatingCalculator: React.FC<FloatingCalculatorProps> = ({
  isOpen,
  onClose,
  soundEnabled,
}) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');

  if (!isOpen) return null;

  const handleBtn = (val: string) => {
    playTapSound(soundEnabled);
    if (val === 'C') {
      setExpression('');
      setResult('');
      return;
    }
    if (val === 'DEL') {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }
    if (val === '=') {
      try {
        // Safe evaluation
        const cleanExpr = expression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/%/g, '/100');
        // Validate expression format
        if (/^[\d+\-*/. ]+$/.test(cleanExpr)) {
          // eslint-disable-next-line no-eval
          const evaluated = Function(`"use strict"; return (${cleanExpr})`)();
          setResult(String(Number(evaluated.toFixed(4))));
        }
      } catch {
        setResult('Error');
      }
      return;
    }

    setExpression((prev) => prev + val);
  };

  const keys = [
    ['C', 'DEL', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '00', '.', '='],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xs bg-slate-900 border border-slate-700 text-white rounded-3xl shadow-2xl p-4 space-y-3 z-10 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🧮</span>
            <span className="text-xs font-bold tracking-tight text-slate-200">
              Quick Calculator
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-950 rounded-2xl p-3 text-right border border-slate-800 min-h-[64px] flex flex-col justify-end">
          <div className="text-xs text-slate-400 font-mono truncate overflow-hidden h-4">
            {expression || '0'}
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 truncate">
            {result ? `= ${result}` : ''}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-4 gap-2">
          {keys.flat().map((k, idx) => {
            const isOperator = ['÷', '×', '-', '+', '='].includes(k);
            const isSpecial = ['C', 'DEL', '%'].includes(k);

            let btnClass = 'bg-slate-800 text-slate-100 hover:bg-slate-700';
            if (isOperator) {
              btnClass = k === '=' 
                ? 'bg-blue-600 hover:bg-blue-500 text-white font-bold' 
                : 'bg-amber-600/80 hover:bg-amber-500 text-white font-bold';
            } else if (isSpecial) {
              btnClass = 'bg-slate-700 text-amber-300 font-semibold';
            }

            return (
              <button
                key={idx}
                onClick={() => handleBtn(k)}
                className={`h-11 rounded-xl text-sm font-bold flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-xs ${btnClass}`}
              >
                {k === 'DEL' ? <Delete className="w-4 h-4" /> : k}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
