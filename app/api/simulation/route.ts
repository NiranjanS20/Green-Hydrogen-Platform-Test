import { calculateWaterConsumption, calculateCarbonOffset } from '@/lib/calculations';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { energyInput, efficiency } = await req.json();
  const hydrogenProduced = (energyInput * efficiency) / (100 * 39.4);
  const waterUsed = calculateWaterConsumption(hydrogenProduced);
  const carbonOffset = calculateCarbonOffset(hydrogenProduced);

  return NextResponse.json({
    hydrogenProduced,
    waterUsed,
    carbonOffset,
  });
}
