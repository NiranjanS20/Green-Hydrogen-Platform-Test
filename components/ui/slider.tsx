import React from 'react'

type Props = {
  value: number[]
  min?: number
  max?: number
  step?: number
  onValueChange: (v: number[]) => void
}

export const Slider: React.FC<Props> = ({ value, min = 0, max = 100, step = 1, onValueChange }) => {
  const v = value[0] ?? min
  return (
    <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onValueChange([Number(e.target.value)])} className="w-full" />
  )
}

export default Slider
