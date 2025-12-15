import React, { useState, useEffect, useMemo } from 'react';
import { parseRawData } from '../utils/parser';
import { generateSchedule } from '../utils/scheduler';
import { DataInput } from './DataInput';
import { ScheduleView } from './ScheduleView';
import { SubjectStats, ScheduleResult } from '../types';

interface CourseManagerProps {
  initialData: string;
  title: string;
}

type Trimester = '1' | '2' | '3';

export const CourseManager: React.FC<CourseManagerProps> = ({ initialData, title }) => {
  // State for tabs
  const [activeTrimester, setActiveTrimester] = useState<Trimester>('1');
  
  // State for data per trimester
  const [trimesterData, setTrimesterData] = useState<Record<Trimester, string>>({
    '1': initialData,
    '2': '', // Empty by default
    '3': ''  // Empty by default
  });

  const [isInputOpen, setIsInputOpen] = useState(false);
  const [parsedData, setParsedData] = useState<{ students: any[], subjectStats: SubjectStats[] } | null>(null);
  const [duration, setDuration] = useState<60 | 90>(90);

  // State for selected option among generated results
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  // Get current raw data based on active tab
  const currentRawData = trimesterData[activeTrimester];

  // Handler to update data for current tab
  const handleDataChange = (val: string) => {
    setTrimesterData(prev => ({
        ...prev,
        [activeTrimester]: val
    }));
  };

  // Parse data whenever currentRawData changes
  useEffect(() => {
    try {
      if (!currentRawData.trim()) {
          setParsedData(null);
          return;
      }
      const data = parseRawData(currentRawData);
      setParsedData(data);
    } catch (e) {
      console.error("Error parsing data", e);
      setParsedData(null);
    }
  }, [currentRawData]);

  // Generate schedule results whenever parsed data or duration changes
  // Returns an array of ScheduleResult now
  const scheduleResults: ScheduleResult[] = useMemo(() => {
    if (!parsedData) return [];
    setSelectedOptionIndex(0); // Reset selection on regeneration
    return generateSchedule(parsedData.subjectStats, duration);
  }, [parsedData, duration]);

  const currentResult = scheduleResults.length > 0 ? scheduleResults[selectedOptionIndex] : null;

  const getTrimesterLabel = (t: Trimester) => {
      if (t === '1') return '1r Trimestre';
      if (t === '2') return '2n Trimestre';
      return '3r Trimestre';
  };

  return (
    <div>
        {/* Trimester Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-fit mb-6">
            {(['1', '2', '3'] as Trimester[]).map((t) => (
                <button
                    key={t}
                    onClick={() => {
                        setActiveTrimester(t);
                        // Open input automatically if empty (UX improvement)
                        if (!trimesterData[t]) setIsInputOpen(true);
                    }}
                    className={`
                        px-4 py-2 text-sm font-medium rounded-md transition-all
                        ${activeTrimester === t 
                            ? 'bg-white text-blue-700 shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                    `}
                >
                    {getTrimesterLabel(t)}
                </button>
            ))}
        </div>

        {/* Controls Panel */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
           
           {/* Instructions */}
           <div className="flex-1 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900 shadow-sm">
             <div className="flex gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
               </svg>
               <div className="markdown-body">
                  <p className="font-semibold mb-1">
                      Configuració: {title} - {getTrimesterLabel(activeTrimester)} ({duration} min)
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800/80">
                     {duration === 90 ? (
                        <>
                           <li>Dilluns i Dijous: 15:00 - 16:30 (1 torn)</li>
                           <li>Dimarts: 15:00 - 18:00 (2 torns)</li>
                        </>
                     ) : (
                        <>
                           <li>Dilluns i Dijous: 15:00 - 17:00 (2 torns)</li>
                           <li>Dimarts: 15:00 - 18:00 (3 torns)</li>
                        </>
                     )}
                     <li>Incompatibilitats diàries:
                        <ul className="pl-4 list-square text-xs mt-1 space-y-0.5">
                           <li>Mates / Castellà</li>
                           <li>Mates / Física</li>
                           <li>Català / Castellà</li>
                           <li>Català / Mates</li>
                           <li>Català / Lit. Catalana</li>
                           <li>Física / Química (i qualsevol Cient-Tèc entre si)</li>
                           <li>Economia / F. Empresa</li>
                           <li>Dibuix Tèc. / Àmbit Cient-Tèc</li>
                        </ul>
                     </li>
                     <li>Agrupament: <strong>Mates</strong> i <strong>Mates CS</strong> al mateix horari.</li>
                     <li>Límit alumne: <strong>Màxim 2 exàmens per dia</strong>.</li>
                  </ul>
               </div>
             </div>
           </div>

           {/* Duration Toggle */}
           <div className="flex-shrink-0 bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Durada de la prova</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                 <button
                    onClick={() => setDuration(90)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${duration === 90 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    1h 30min
                 </button>
                 <button
                    onClick={() => setDuration(60)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${duration === 60 ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    1h 00min
                 </button>
              </div>
           </div>
        </div>

        {/* Data Input Section */}
        <DataInput 
          value={currentRawData} 
          onChange={handleDataChange} 
          isOpen={isInputOpen}
          onToggle={() => setIsInputOpen(!isInputOpen)}
        />

        {/* Results Selection & Display */}
        {parsedData && currentRawData.trim() ? (
            <>
                {scheduleResults.length > 0 ? (
                    <div>
                        {/* Option Selector */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-slate-700 mb-3">Opcions d'horari generades:</h3>
                            <div className="flex flex-wrap gap-3">
                                {scheduleResults.map((res, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedOptionIndex(idx)}
                                        className={`
                                            flex flex-col items-start px-4 py-2 rounded-lg border text-sm transition-all
                                            ${selectedOptionIndex === idx 
                                                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 z-10' 
                                                : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                                        `}
                                    >
                                        <div className="flex items-center gap-2 font-medium">
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${selectedOptionIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                {idx + 1}
                                            </span>
                                            <span className={selectedOptionIndex === idx ? 'text-blue-900' : 'text-slate-700'}>
                                                Opció {idx + 1}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-slate-500">
                                            {res.totalDays} dies • {res.slots[res.slots.length-1].id + 1} franges
                                            {res.unassignable.length > 0 && <span className="text-red-500 ml-1">⚠ Incidències</span>}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected Result Stats */}
                        {currentResult && (
                             <div className="mb-6 flex items-center gap-4 text-sm font-medium">
                                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full border border-green-200">
                                    {currentResult.totalDays} dies totals necessaris
                                </div>
                                <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                                    {parsedData.students.length} alumnes detectats
                                </div>
                                {currentResult.unassignable.length > 0 && (
                                    <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full border border-red-200">
                                        ⚠ {currentResult.unassignable.length} matèries sense assignar
                                    </div>
                                )}
                             </div>
                        )}

                        {/* Schedule View */}
                        {currentResult && <ScheduleView result={currentResult} />}
                    </div>
                ) : (
                    <div className="p-8 text-center text-slate-500 bg-white rounded shadow border border-slate-200">
                        No s'ha trobat cap combinació vàlida amb aquestes restriccions.
                    </div>
                )}
            </>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg border border-slate-200 border-dashed">
             <div className="py-8">
                  <p className="text-slate-400 mb-2">No hi ha dades per aquest trimestre.</p>
                  <button onClick={() => setIsInputOpen(true)} className="text-blue-600 font-medium hover:underline">
                      Afegir dades d'alumnes
                  </button>
             </div>
          </div>
        )}
    </div>
  );
};