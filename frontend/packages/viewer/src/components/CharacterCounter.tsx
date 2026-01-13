import React from 'react';

interface CharacterCounterProps {
  current: number;
  max: number;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({ current, max }) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 90;
  const isOverLimit = current > max;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className={isOverLimit ? 'text-red-600 font-semibold' : 'text-gray-600'}>
          {current.toLocaleString()} / {max.toLocaleString()} characters
        </span>
        {isNearLimit && !isOverLimit && (
          <span className="text-amber-600 text-xs">Approaching limit</span>
        )}
        {isOverLimit && <span className="text-red-600 text-xs font-semibold">Over limit!</span>}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isOverLimit
              ? 'bg-red-500'
              : isNearLimit
              ? 'bg-amber-500'
              : 'bg-gradient-to-r from-purple-500 to-indigo-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

