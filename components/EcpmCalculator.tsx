import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Layers, DollarSign, BarChart3, Copy, FileDown, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { LineItem, BlenderResult } from '../types';

// Custom Blender Icon Component
const BlenderIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Jar */}
    <path d="M6 6h12l-1.5 11h-9L6 6Z" />
    {/* Base */}
    <path d="M8 21h8v-4H8v4Z" />
    {/* Lid Handle */}
    <path d="M12 2v4" />
    {/* Blade/Mix line */}
    <path d="M12 12v3" />
    <path d="M10 15h4" />
  </svg>
);

const EcpmCalculator: React.FC = () => {
  // --- State Management ---
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', budget: '', cpm: '' },
    { id: '2', budget: '', cpm: '' }
  ]);
  
  const [blenderResult, setBlenderResult] = useState<BlenderResult>({
    totalBudget: 0,
    totalImpressions: 0,
    blendedEcpm: 0
  });

  const [copied, setCopied] = useState(false);

  // --- Logic ---
  const calculateBlender = useCallback(() => {
    let totalBudget = 0;
    let totalImpressions = 0;

    if (lineItems.length > 0) {
      lineItems.forEach(item => {
        const budget = Number(item.budget) || 0;
        const cpm = Number(item.cpm) || 0;
        
        if (cpm > 0) {
          const impressions = (budget / cpm) * 1000;
          totalBudget += budget;
          totalImpressions += impressions;
        }
      });
    }

    const blendedEcpm = totalImpressions > 0 ? (totalBudget / totalImpressions) * 1000 : 0;

    setBlenderResult({
      totalBudget,
      totalImpressions,
      blendedEcpm
    });
  }, [lineItems]);

  useEffect(() => {
    calculateBlender();
  }, [calculateBlender]);

  // --- Handlers ---
  const handleLineItemChange = (id: string, field: keyof LineItem, value: string) => {
    const numValue = value === '' ? '' : parseFloat(value);
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: numValue } : item
    ));
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), budget: '', cpm: '' }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  // --- Actions ---
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  
  const formatNumber = (val: number) => 
    new Intl.NumberFormat('en-US').format(Math.round(val));

  const handleCopy = () => {
    const lines = lineItems.map((item, i) => 
      `Line ${i+1}: Budget $${item.budget || 0} @ $${item.cpm || 0} CPM`
    ).join('\n');

    const text = `MEDIA DRIVE - BLENDER REPORT\n\n${lines}\n\nRESULTS:\nBlended eCPM: ${formatCurrency(blenderResult.blendedEcpm)}\nTotal Budget: ${formatCurrency(blenderResult.totalBudget)}\nTotal Impressions: ${formatNumber(blenderResult.totalImpressions)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235); // Brand Blue
    doc.text('Media Drive', 20, 20);
    
    doc.setFontSize(24);
    doc.setTextColor(17, 24, 39); // Gray 900
    doc.text('eCPM Blender Report', 20, 32);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128); // Gray 500
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);

    // Results Box
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.rect(20, 50, 170, 40, 'FD');

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('BLENDED ECPM', 30, 62);
    doc.text('TOTAL BUDGET', 90, 62);
    doc.text('TOTAL IMPRESSIONS', 150, 62);

    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text(formatCurrency(blenderResult.blendedEcpm), 30, 72);
    doc.text(formatCurrency(blenderResult.totalBudget), 90, 72);
    doc.text(formatNumber(blenderResult.totalImpressions), 150, 72);

    // Line Items
    let yPos = 110;
    doc.setFontSize(12);
    doc.text('Media Plan Inputs', 20, 100);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('#', 20, yPos);
    doc.text('BUDGET', 40, yPos);
    doc.text('CPM', 100, yPos);
    doc.text('EST. IMPRESSIONS', 160, yPos);

    yPos += 10;
    doc.setTextColor(17, 24, 39);

    lineItems.forEach((item, index) => {
       const budget = Number(item.budget) || 0;
       const cpm = Number(item.cpm) || 0;
       const imps = cpm > 0 ? (budget / cpm) * 1000 : 0;

       doc.text(`${index + 1}`, 20, yPos);
       doc.text(formatCurrency(budget), 40, yPos);
       doc.text(formatCurrency(cpm), 100, yPos);
       doc.text(formatNumber(imps), 160, yPos);
       yPos += 10;
    });

    doc.save('media-drive-ecpm-blender.pdf');
  };

  return (
    <div className="w-full max-w-[460px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-2xl shadow-lg shadow-blue-600/10 dark:shadow-blue-500/20 mb-5 text-white transform -rotate-6 flex items-center justify-center hover:scale-105 duration-300 transition-transform">
          <BlenderIcon size={28} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight text-center">
          eCPM Blender
        </h1>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[420px] mx-auto font-normal leading-relaxed text-center">
          Calculate the weighted average eCPM across multiple line items in your media plan.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-200 dark:border-zinc-800 p-5 transition-colors duration-300">
        
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Media Plan Inputs
          </h3>
        </div>

        <div className="space-y-3">
          
          {/* Column Headers */}
          <div className="flex gap-3 px-1 mb-1">
            <div className="flex-1 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              Budget
            </div>
            <div className="flex-1 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">
              CPM
            </div>
            <div className="w-8"></div>
          </div>

          {/* Line Items List */}
          <div className="space-y-2">
            {lineItems.map((item, index) => (
              <div key={item.id} className="flex gap-3 items-center group">
                {/* Budget */}
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                    <DollarSign size={13} />
                  </div>
                  <input
                    type="number"
                    value={item.budget}
                    onChange={(e) => handleLineItemChange(item.id, 'budget', e.target.value)}
                    placeholder={index === 0 ? "500" : index === 1 ? "1000" : "50"}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 outline-none"
                  />
                </div>

                {/* CPM */}
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                    <DollarSign size={13} />
                  </div>
                  <input
                    type="number"
                    value={item.cpm}
                    onChange={(e) => handleLineItemChange(item.id, 'cpm', e.target.value)}
                    placeholder={index === 0 ? "12.50" : index === 1 ? "4.25" : "10"}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 outline-none"
                  />
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeLineItem(item.id)}
                  disabled={lineItems.length <= 1}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-0"
                  aria-label="Remove line item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <button
            onClick={addLineItem}
            className="w-full py-2.5 flex items-center justify-center gap-2 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all shadow-sm mt-2"
          >
            <Plus size={14} />
            <span>ADD LINE ITEM</span>
          </button>

          {/* Results Section */}
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-zinc-800">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                 <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                   Results
                 </h3>
               </div>
               
               {/* Action Buttons */}
               <div className="flex gap-2">
                 <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                 >
                   {copied ? <Check size={12} className="text-green-500 dark:text-green-400"/> : <Copy size={12} />}
                   {copied ? 'Copied' : 'Copy'}
                 </button>
                 <button 
                    onClick={handleExportPDF}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-600 dark:text-gray-300 shadow-sm hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                 >
                   <FileDown size={12} />
                   PDF
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Primary Metric: Blended eCPM */}
              <div className="col-span-2 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-colors group">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Blended eCPM
                </div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">
                  {formatCurrency(blenderResult.blendedEcpm)}
                </div>
              </div>

              {/* Secondary Metric: Total Budget */}
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Total Budget
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {formatCurrency(blenderResult.totalBudget)}
                </div>
              </div>

              {/* Secondary Metric: Total Impressions */}
              <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Total Impressions
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {formatNumber(blenderResult.totalImpressions)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default EcpmCalculator;
