import React from 'react'
import Card from './ui/card';
import Badge from './ui/badge';
import { formatNumber } from '@/lib/utils';

type Props = {
  name?: string;
  type?: 'solar' | 'wind' | 'hydro' | string;
  capacityMw?: number;
  capacityFactor?: number;
};

const EnergySourceCard: React.FC<Props> = ({ name = 'Source', type = 'solar', capacityMw = 1, capacityFactor = 0.25 }) => {
  const colorMap: Record<string, string> = {
    solar: 'bg-amber-500',
    wind: 'bg-indigo-500',
    hydro: 'bg-blue-500',
  };

  const dailyEnergyKWh = capacityMw * 1000 * 24 * capacityFactor;

  return (
    <Card title={name}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-600">Type</div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${colorMap[type] || 'bg-gray-400'}`} />
              <div className="text-sm font-medium capitalize">{type}</div>
            </div>
          </div>
          <Badge variant="info">Renewable</Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500">Capacity</div>
            <div className="font-medium">{capacityMw} MW</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Cap. Factor</div>
            <div className="font-medium">{(capacityFactor * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Est. Daily</div>
            <div className="font-medium">{formatNumber(dailyEnergyKWh / 1000, 1)} MWh</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnergySourceCard
//
