import React from 'react';
import { Card } from '@/components/ui/Card';

// FIX: Changed icon prop type from React.ReactNode to React.ReactElement to allow cloning with className.
interface StatCardProps {
  title: string;
  value: string | number;
  // FIX: Explicitly type the icon prop to accept a className, which resolves the TypeScript error with React.cloneElement.
  icon: React.ReactElement<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
  };

  const selectedColor = colorClasses[color];

  const WrapperComponent = onClick ? 'button' : 'div';
  const wrapperProps = onClick
    ? {
        onClick,
        className:
          'text-left w-full h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg',
      }
    : { className: 'w-full h-full' };

  return (
    <WrapperComponent {...wrapperProps}>
      <Card className="flex items-center w-full h-full">
        <div
          className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${selectedColor.bg}`}
        >
          {React.cloneElement(icon, {
            className: `w-6 h-6 ${selectedColor.text}`,
          })}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </Card>
    </WrapperComponent>
  );
};
