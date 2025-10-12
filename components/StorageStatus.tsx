import React from 'react';
import Card from './ui/card';
import Progress from './ui/progress';
import Badge from './ui/badge';
import { calculateStorageUtilization, calculateCompressionEnergy } from '../lib/calculations';
import { formatNumber } from '@/lib/utils';

type StorageStatusProps = {
  name?: string;
  currentLevelKg?: number;
  capacityKg?: number;
  pressureBar?: number;
  maxPressureBar?: number;
};

const StorageStatus: React.FC<StorageStatusProps> = ({ name = 'Storage', currentLevelKg = 0, capacityKg = 1000, pressureBar = 350, maxPressureBar = 400 }) => {
  const utilization = calculateStorageUtilization(currentLevelKg, capacityKg);
  const compressionEnergy = calculateCompressionEnergy(currentLevelKg, pressureBar);

  const getPressureStatus = () => {
    if (!pressureBar) return { text: 'Unknown', variant: 'default' as const };
    const ratio = pressureBar / maxPressureBar;
    if (ratio > 0.9) return { text: 'Critical', variant: 'error' as const };
    if (ratio > 0.75) return { text: 'High', variant: 'warning' as const };
    return { text: 'Normal', variant: 'success' as const };
  };

  const pressureStatus = getPressureStatus();

  return (
    <Card title={name}>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Level</span>
            <span className="font-medium">{formatNumber(currentLevelKg, 1)} / {formatNumber(capacityKg, 0)} kg</span>
          </div>
          <Progress value={utilization} max={100} className="mt-1" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <div className="text-xs text-gray-500">Utilization</div>
            <div className="font-medium">{utilization.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Compression Cost</div>
            <div className="font-medium">{formatNumber(compressionEnergy, 1)} kWh</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Pressure</div>
            <div className="font-medium">{pressureBar} bar</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Status</div>
            <Badge variant={pressureStatus.variant}>{pressureStatus.text}</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StorageStatus
//
