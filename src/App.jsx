import React, { useState, useMemo } from 'react';
import { Calculator, Users, TrendingUp, AlertCircle, Coins, User, BarChart3, Table2 } from 'lucide-react';

// --- Shared Components ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

// --- Constants ---
const NI_RATE = 0.15; // 15% (April 2025)
const NI_THRESHOLD = 5000; // £5,000 (April 2025)
const PENSION_RATE = 0.11; // 11% Pension
const APP_LEVY_RATE = 0.005; // 0.5% Levy
const BONUS_RATE = 0.10; // 10% Bonus

const fmt = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

// --- Anonymized Data (Pure Integers & Booleans) ---
// s: Salary, b: Bonus Eligible, i: Imputed (missing in original)
const STAFF_DATA = [
  {s:67500,b:true,i:false},{s:67500,b:true,i:false},{s:67500,b:true,i:false},{s:67500,b:true,i:false},{s:65000,b:true,i:false},
  {s:65000,b:true,i:false},{s:55000,b:true,i:false},{s:55000,b:true,i:false},{s:52500,b:true,i:false},{s:55000,b:true,i:false},
  {s:55000,b:true,i:false},{s:67500,b:true,i:false},{s:60000,b:true,i:false},{s:67500,b:true,i:false},{s:67500,b:true,i:false},
  {s:60000,b:true,i:false},{s:67500,b:true,i:false},{s:67500,b:true,i:false},{s:67500,b:true,i:false},{s:67500,b:true,i:false},
  {s:67500,b:true,i:false},{s:67500,b:true,i:false},{s:67500,b:true,i:false},{s:67500,b:true,i:false},{s:67500,b:true,i:false},
  {s:47500,b:true,i:false},{s:65000,b:true,i:false},{s:65000,b:true,i:false},{s:65000,b:true,i:false},{s:65000,b:true,i:false},
  {s:65000,b:true,i:false},{s:65000,b:true,i:false},{s:45000,b:true,i:false},{s:55000,b:true,i:false},{s:47500,b:true,i:false},
  {s:55000,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:55000,b:true,i:false},{s:47500,b:true,i:false},
  {s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:55000,b:true,i:false},{s:55000,b:true,i:false},
  {s:55000,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},
  {s:55000,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:false,i:false},{s:47500,b:false,i:true},
  {s:47500,b:false,i:false},{s:30000,b:false,i:false},{s:30000,b:false,i:false},{s:35000,b:true,i:false},{s:40000,b:true,i:false},
  {s:47500,b:false,i:true},{s:30000,b:false,i:false},{s:52250,b:true,i:false},{s:52250,b:true,i:false},{s:47500,b:true,i:false},
  {s:52250,b:true,i:false},{s:52250,b:true,i:false},{s:47500,b:true,i:false},{s:30000,b:false,i:false},{s:30000,b:false,i:false},
  {s:33000,b:false,i:false},{s:30000,b:false,i:false},{s:30000,b:false,i:false},{s:33000,b:false,i:false},{s:30000,b:false,i:false},
  {s:33000,b:false,i:false},{s:30000,b:false,i:false},{s:30000,b:false,i:false},{s:30000,b:false,i:false},{s:30000,b:false,i:false},
  {s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},
  {s:55000,b:true,i:false},{s:47500,b:true,i:false},{s:55000,b:true,i:false},{s:47500,b:true,i:false},{s:55000,b:true,i:false},
  {s:55000,b:true,i:false},{s:55000,b:true,i:false},{s:47500,b:true,i:false},{s:55000,b:true,i:false},{s:47500,b:true,i:false},
  {s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:55000,b:true,i:false},
  {s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:55000,b:true,i:false},{s:55000,b:true,i:false},{s:47500,b:true,i:false},
  {s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},
  {s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:55000,b:true,i:false},{s:37500,b:false,i:false},
  {s:45000,b:false,i:false},{s:45000,b:false,i:false},{s:55000,b:true,i:false},{s:45000,b:false,i:false},{s:45000,b:false,i:false},
  {s:60000,b:true,i:false},{s:45000,b:false,i:false},{s:37500,b:false,i:false},{s:55000,b:true,i:false},{s:42500,b:false,i:false},
  {s:47500,b:false,i:false},{s:47500,b:false,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},
  {s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:45000,b:false,i:false},{s:35000,b:false,i:false},
  {s:40000,b:false,i:false},{s:40000,b:false,i:false},{s:35000,b:false,i:false},{s:35000,b:false,i:false},{s:35000,b:false,i:false},
  {s:35000,b:false,i:false},{s:35000,b:false,i:false},{s:35000,b:false,i:false},{s:30000,b:false,i:false},{s:47500,b:false,i:true},
  {s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},
  {s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},
  {s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:37500,b:false,i:false},
  {s:37500,b:false,i:false},{s:37500,b:false,i:false},{s:37500,b:false,i:false},{s:37500,b:false,i:false},{s:37500,b:false,i:false},
  {s:37500,b:false,i:false},{s:37500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},
  {s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},
  {s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:42500,b:false,i:false},{s:37500,b:false,i:false},
  {s:37500,b:false,i:false},{s:37500,b:false,i:false},{s:37500,b:false,i:false},{s:37500,b:false,i:false},{s:37500,b:false,i:false},
  {s:37500,b:false,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false},{s:47500,b:true,i:false}
];

// --- Helper Functions ---
const calculateTCOE = (baseSalary, bonusAmount = 0) => {
  const pension = baseSalary * PENSION_RATE; // Pension on Base only
  const totalEarnings = baseSalary + bonusAmount;
  const niableAmount = Math.max(0, totalEarnings - NI_THRESHOLD);
  const ni = niableAmount * NI_RATE;
  const levy = totalEarnings * APP_LEVY_RATE;
  return baseSalary + bonusAmount + pension + ni + levy;
};

// --- Sub-Component: Salary Modeler ---
const SalaryModeler = () => {
  const [underpin, setUnderpin] = useState(3000);
  const [percent, setPercent] = useState(8);
  const [testSalary, setTestSalary] = useState(55000);
  const [includeTCOE, setIncludeTCOE] = useState(false);
  const [includeBonuses, setIncludeBonuses] = useState(false);

  const stats = useMemo(() => {
    let totalOld = 0;
    let totalNew = 0;
    let countUnderpin = 0;
    let countPercent = 0;
    
    const rows = STAFF_DATA.map((emp, idx) => {
      const pctIncrease = emp.s * (percent / 100);
      const increase = Math.max(pctIncrease, underpin);
      const newSalary = emp.s + increase;
      const isUnderpin = increase === underpin;

      // Bonus Logic
      const oldBonus = (emp.b && includeBonuses) ? emp.s * BONUS_RATE : 0;
      const newBonus = (emp.b && includeBonuses) ? newSalary * BONUS_RATE : 0;

      // Calculate TCOE versions
      const tcoeOld = calculateTCOE(emp.s, oldBonus);
      const tcoeNew = calculateTCOE(newSalary, newBonus);
      const tcoeIncrease = tcoeNew - tcoeOld;

      if (includeTCOE) {
        totalOld += tcoeOld;
        totalNew += tcoeNew;
      } else {
        totalOld += emp.s + oldBonus;
        totalNew += newSalary + newBonus;
      }

      if (isUnderpin) countUnderpin++; else countPercent++;

      return { 
        id: idx + 1,
        salary: emp.s,
        newSalary, 
        increase, 
        isUnderpin,
        tcoeOld, tcoeNew, tcoeIncrease, oldBonus, newBonus,
        hasBonus: emp.b,
        isImputed: emp.i
      };
    });

    return {
      totalOld, totalNew,
      totalIncrease: totalNew - totalOld,
      pctIncreaseTotal: totalOld ? ((totalNew - totalOld) / totalOld) * 100 : 0,
      countUnderpin, countPercent, rows
    };
  }, [underpin, percent, includeTCOE, includeBonuses]);

  // Individual Calculator
  const potUnderpin = underpin;
  const potPercent = testSalary * (percent / 100);
  const indIncrease = Math.max(potPercent, potUnderpin);
  const indNew = parseFloat(testSalary) + indIncrease;
  
  // Individual TCOE
  const indPension = indNew * PENSION_RATE;
  const indNI = Math.max(0, indNew - NI_THRESHOLD) * NI_RATE;
  const indLevy = indNew * APP_LEVY_RATE;
  const indTotalTCOE = indNew + indPension + indNI + indLevy;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Scenario Configuration
          </h2>
          <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-lg border border-slate-200">
                <span className={`text-xs font-bold ${includeTCOE ? 'text-slate-400' : 'text-blue-600'}`}>Gross Pay</span>
                <button 
                    onClick={() => setIncludeTCOE(!includeTCOE)}
                    className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-300 data-[checked=true]:bg-blue-600 transition-colors"
                    data-checked={includeTCOE}
                >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${includeTCOE ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <span className={`text-xs font-bold ${includeTCOE ? 'text-blue-600' : 'text-slate-400'}`}>Total Cost (TCOE)</span>
             </div>
             <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 cursor-pointer select-none" onClick={() => setIncludeBonuses(!includeBonuses)}>
                    Include 10% Bonuses?
                </label>
                <button 
                    onClick={() => setIncludeBonuses(!includeBonuses)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${includeBonuses ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white'}`}
                >
                    {includeBonuses && <span className="text-[10px]">✓</span>}
                </button>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Underpin Amount (£)</label>
            <input type="number" value={underpin} onChange={(e) => setUnderpin(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Percentage Increase (%)</label>
            <input type="number" value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`p-4 border-l-4 ${includeTCOE ? 'border-indigo-500 bg-indigo-50' : 'border-blue-500'}`}>
          <div className="text-slate-500 text-sm mb-1">{includeTCOE ? "Total Cost (TCOE)" : "Total Gross Pay"}</div>
          <div className="text-2xl font-bold text-slate-800">{fmt(stats.totalOld)}</div>
        </Card>
        <Card className={`p-4 border-l-4 ${includeTCOE ? 'border-indigo-500 bg-indigo-50' : 'border-green-500'}`}>
          <div className="text-slate-500 text-sm mb-1">{includeTCOE ? "New Cost (TCOE)" : "New Gross Pay"}</div>
          <div className="text-2xl font-bold text-slate-800">{fmt(stats.totalNew)}</div>
        </Card>
        <Card className="p-4 border-l-4 border-amber-500">
          <div className="text-slate-500 text-sm mb-1">Net Cost Increase</div>
          <div className="text-2xl font-bold text-slate-800">{fmt(stats.totalIncrease)}</div>
          <div className="text-sm font-medium text-amber-600 mt-1">+{stats.pctIncreaseTotal.toFixed(2)}%</div>
        </Card>
        <Card className="p-4 border-l-4 border-purple-500">
          <div className="text-slate-500 text-sm mb-1">Staff Impact</div>
          <div className="flex justify-between items-end mt-2">
            <div className="text-xs text-center"><div className="font-bold text-lg">{stats.countUnderpin}</div><div className="text-slate-400">Underpin</div></div>
            <div className="text-xs text-center"><div className="font-bold text-lg">{stats.countPercent}</div><div className="text-slate-400">Percentage</div></div>
          </div>
        </Card>
      </div>

      {/* Individual Check */}
      <Card className="p-6 border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <Calculator size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Individual Check</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">My Base Salary</label>
              <input type="number" value={testSalary} onChange={(e) => setTestSalary(Number(e.target.value))} className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className={`flex justify-between text-sm ${potUnderpin >= potPercent ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
                <span>Option A (Underpin):</span><span>+{fmt(potUnderpin)}</span>
              </div>
              <div className={`flex justify-between text-sm ${potPercent > potUnderpin ? 'text-green-600 font-bold' : 'text-slate-400'}`}>
                <span>Option B ({percent}%):</span><span>+{fmt(potPercent)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-600 font-medium">New Gross Salary:</span>
                <span className="font-bold text-slate-800">{fmt(indNew)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-md mt-2 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Employer Cost Breakdown (New)</div>
                <div className="flex justify-between text-xs text-slate-600 mb-1"><span>Pension (11%):</span><span>{fmt(indPension)}</span></div>
                <div className="flex justify-between text-xs text-slate-600 mb-1"><span>Employer NI (15%):</span><span>{fmt(indNI)}</span></div>
                <div className="flex justify-between text-xs text-slate-600 mb-1"><span>Levy (0.5%):</span><span>{fmt(indLevy)}</span></div>
                <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                    <span className="text-slate-800 font-bold text-xs">Total Cost to Company:</span>
                    <span className="font-bold text-slate-900 text-sm">{fmt(indTotalTCOE)}</span>
                </div>
              </div>
            </div>
          </div>
      </Card>

      {/* Assumptions Banner */}
      {(includeTCOE || includeBonuses) && (
         <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <div>
               <strong>Active Cost Assumptions:</strong>
               <ul className="list-disc ml-4 mt-1 space-y-1">
                 {includeTCOE && <li><strong>TCOE (April 2025):</strong> 15% NI ({'>'}£5k), 0.5% Levy, 11% Pension (on Base Salary).</li>}
                 {includeBonuses && <li><strong>Bonuses:</strong> 10% added to base salary for eligible roles (indicated by <Coins size={12} className="inline"/>). NI/Levy applied to bonus; Pension applied to Base only.</li>}
               </ul>
            </div>
         </div>
      )}

      {/* Staff Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2"><Table2 size={18} /> Staff List ({STATS_DATA_LENGTH})</h3>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-medium sticky top-0">
              <tr>
                <th className="p-3">Staff ID</th>
                <th className="p-3 text-right">Current {includeTCOE ? '(Cost)' : '(Pay)'}</th>
                <th className="p-3 text-right">Increase {includeTCOE ? '(Cost)' : '(Pay)'}</th>
                <th className="p-3 text-right">New {includeTCOE ? '(Cost)' : '(Pay)'}</th>
                <th className="p-3 text-center">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.rows.sort((a,b) => b.increase - a.increase).map((row) => {
                 const displaySalary = includeTCOE ? row.tcoeOld : (row.salary + (includeBonuses ? row.oldBonus : 0));
                 const displayGrossIncrease = (row.newSalary + (includeBonuses ? row.newBonus : 0)) - (row.salary + (includeBonuses ? row.oldBonus : 0));
                 const finalDisplayIncrease = includeTCOE ? row.tcoeIncrease : displayGrossIncrease;
                 const displayNew = includeTCOE ? row.tcoeNew : (row.newSalary + (includeBonuses ? row.newBonus : 0));

                 return (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-700 flex items-center gap-2">
                        Member {row.id}
                        {row.hasBonus && includeBonuses && <Coins size={12} className="text-amber-500" title="Bonus Eligible" />}
                        {row.isImputed && <span className="text-amber-500 text-xs ml-1" title="Imputed">*</span>}
                    </td>
                    <td className="p-3 text-right font-mono">{fmt(displaySalary)}</td>
                    <td className={`p-3 text-right font-mono ${includeTCOE ? 'text-amber-700' : 'text-green-600'}`}>+{fmt(finalDisplayIncrease)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-700">{fmt(displayNew)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${row.isUnderpin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {row.isUnderpin ? 'Underpin' : `${percent}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const STATS_DATA_LENGTH = STAFF_DATA.length;

// --- Sub-Component: Break-Even Visualizer ---
const BreakEvenVisualizer = () => {
  const [underpin, setUnderpin] = useState(3000);
  const [percent, setPercent] = useState(8);
  const [userSalary, setUserSalary] = useState(45000);

  const breakEvenSalary = percent > 0 ? underpin / (percent / 100) : 0;
  const userPctIncrease = userSalary * (percent / 100);
  const userIncrease = Math.max(underpin, userPctIncrease);
  const isUnderpinBetter = underpin >= userPctIncrease;

  const maxSalary = 100000;
  const maxIncrease = 12000;
  const width = 800;
  const height = 400;
  const padding = 60;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const plotX = (salary) => padding + (salary / maxSalary) * graphWidth;
  const plotY = (increase) => (height - padding) - (increase / maxIncrease) * graphHeight;

  const lineUnderpinY = plotY(underpin);
  const linePercentEnd = plotY(maxSalary * (percent / 100));
  const breakEvenX = plotX(breakEvenSalary);
  const breakEvenY = plotY(underpin);
  const userX = plotX(userSalary);
  const userY = plotY(userIncrease);

  const fmt = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 h-fit space-y-8">
          <div className="flex items-center gap-2 text-blue-600 border-b border-slate-100 pb-4">
            <TrendingUp size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Parameters</h2>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-medium text-slate-700">Underpin Amount</label>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{fmt(underpin)}</span>
            </div>
            <input type="range" min="0" max="10000" step="100" value={underpin} onChange={(e) => setUnderpin(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-medium text-slate-700">Percentage Increase</label>
              <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded">{percent}%</span>
            </div>
            <input type="range" min="0.5" max="20" step="0.5" value={percent} onChange={(e) => setPercent(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600" />
          </div>
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-purple-600">
                <User size={20} />
                <h3 className="font-bold text-slate-800">Check Your Position</h3>
            </div>
            <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">My Salary</label>
                <input type="number" value={userSalary} onChange={(e) => setUserSalary(Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="space-y-2">
                <div className={`flex justify-between items-center p-2 rounded text-sm transition-colors ${isUnderpinBetter ? 'bg-purple-100 border border-purple-200 text-purple-900 font-bold shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                    <span>Option A (Underpin):</span><span>+{fmt(underpin)}</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded text-sm transition-colors ${!isUnderpinBetter ? 'bg-purple-100 border border-purple-200 text-purple-900 font-bold shadow-sm' : 'bg-slate-50 text-slate-400'}`}>
                    <span>Option B ({percent}%):</span><span>+{fmt(userPctIncrease)}</span>
                </div>
            </div>
            <div className="mt-4 text-center p-3 bg-slate-50 rounded border border-slate-100">
                 <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">You Receive</div>
                 <div className="text-2xl font-bold text-purple-700">+{fmt(userIncrease)}</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2 overflow-hidden flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-slate-800 w-full mb-4">Visualizing the Trade-off</h2>
          <div className="relative w-full overflow-x-auto">
            <svg width={width} height={height} className="border border-slate-100 bg-white shadow-sm rounded">
              {[0, 2500, 5000, 7500, 10000, 12500].map(val => (val <= maxIncrease && (<g key={val}><line x1={padding} y1={plotY(val)} x2={width - padding} y2={plotY(val)} stroke="#e2e8f0" strokeDasharray="4 4" /><text x={padding - 10} y={plotY(val) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">£{val}</text></g>)))}
              {[0, 25000, 50000, 75000, 100000].map(val => (<g key={val}><line x1={plotX(val)} y1={padding} x2={plotX(val)} y2={height - padding} stroke="#e2e8f0" strokeDasharray="4 4" /><text x={plotX(val)} y={height - padding + 20} textAnchor="middle" fontSize="10" fill="#94a3b8">£{val/1000}k</text></g>))}
              <text x={width / 2} y={height - 15} textAnchor="middle" fill="#475569" fontWeight="bold" fontSize="12">Base Salary (£)</text>
              <text x={15} y={height / 2} textAnchor="middle" fill="#475569" fontWeight="bold" fontSize="12" transform={`rotate(-90, 15, ${height / 2})`}>Increase Amount (£)</text>
              <line x1={padding} y1={lineUnderpinY} x2={width - padding} y2={lineUnderpinY} stroke="#2563eb" strokeWidth="3" />
              <text x={width - padding + 5} y={lineUnderpinY + 4} fill="#2563eb" fontSize="11" fontWeight="bold">Underpin</text>
              <line x1={padding} y1={plotY(0)} x2={plotX(maxSalary)} y2={linePercentEnd} stroke="#16a34a" strokeWidth="3" />
              <text x={plotX(maxSalary) + 5} y={linePercentEnd} fill="#16a34a" fontSize="11" fontWeight="bold">% Inc</text>
              {breakEvenSalary <= maxSalary && (<g><circle cx={breakEvenX} cy={breakEvenY} r="6" fill="#dc2626" stroke="white" strokeWidth="2" /><text x={breakEvenX} y={breakEvenY - 15} textAnchor="middle" fill="#dc2626" fontWeight="bold" fontSize="12">{fmt(breakEvenSalary)}</text></g>)}
              {userSalary <= maxSalary && (<g><line x1={userX} y1={userY} x2={userX} y2={height - padding} stroke="#9333ea" strokeDasharray="3 3" strokeWidth="2" opacity="0.5" /><circle cx={userX} cy={userY} r="8" fill="#9333ea" stroke="white" strokeWidth="2" /><g transform={`translate(${userX}, ${userY - 40})`}><rect x="-50" y="0" width="100" height="30" rx="4" fill="#9333ea" /><text x="0" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">You: {fmt(userIncrease)}</text><polygon points="-5,30 5,30 0,35" fill="#9333ea" /></g></g>)}
            </svg>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [activeTab, setActiveTab] = useState('modeler');

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Union Pay Calculator</h1>
          <p className="text-slate-600">Cost modelling and break-even analysis for 2026 pay claim.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-4 border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('modeler')}
            className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'modeler' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Table2 size={16} /> Salary Modeler
          </button>
          <button 
            onClick={() => setActiveTab('visualizer')}
            className={`pb-3 px-1 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'visualizer' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <BarChart3 size={16} /> Break-Even Graph
          </button>
        </div>

        {/* Content */}
        {activeTab === 'modeler' ? <SalaryModeler /> : <BreakEvenVisualizer />}
      </div>
    </div>
  );
};

export default App;
