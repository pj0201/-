import React from 'react';
import { PERIODS } from '../../data/categories';

interface PeriodSelectorProps {
  selectedPeriods: string[];
  setSelectedPeriods: (periods: string[]) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriods, setSelectedPeriods }) => {
  // 期間選択のハンドラ
  const handlePeriodSelect = (year: string) => {
    if (selectedPeriods.includes(year)) {
      if (selectedPeriods.length > 1) {
        setSelectedPeriods(selectedPeriods.filter(p => p !== year));
      }
    } else {
      if (selectedPeriods.length < 3) {
        setSelectedPeriods([...selectedPeriods, year].sort().reverse());
      }
    }
  };

  // 比較タイプが単年か複数年か
  const comparisonType = selectedPeriods.length > 1 ? '複数年比較' : '単年分析';

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">分析期間選択</h3>
            <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
              {comparisonType}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 ml-7">
            比較する期間を最大3つ選択してください
          </p>
        </div>
        
        <div className="flex flex-wrap lg:flex-nowrap gap-2 lg:gap-3">
          {PERIODS.map((year) => {
            const isSelected = selectedPeriods.includes(year);
            const isPrimary = selectedPeriods[0] === year;
            
            // 特別なスタイルを定義
            let buttonStyle = isSelected
              ? (isPrimary 
                ? 'bg-blue-600 text-white border-transparent shadow-sm' 
                : 'bg-blue-100 text-blue-700 border-blue-300')
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
                
            return (
              <button
                key={year}
                onClick={() => handlePeriodSelect(year)}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-150 flex items-center ${buttonStyle}`}
                aria-pressed={isSelected}
              >
                {isPrimary && isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {year}年度
              </button>
            );
          })}
        </div>
      </div>
      
      {selectedPeriods.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center text-sm">
            <span className="font-medium text-gray-700 mr-2">選択期間:</span>
            <div className="flex flex-wrap gap-1">
              {selectedPeriods.map((period, index) => (
                <React.Fragment key={period}>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                    {period}年度
                  </span>
                  {index < selectedPeriods.length - 1 && (
                    <span className="text-gray-400 mx-1">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
