import React from 'react'

type Props = {
  value: { from: Date; to: Date }
  onChange: (v: { from: Date; to: Date }) => void
}

export const DateRangePicker: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex items-center space-x-2">
      <input type="date" value={value.from.toISOString().slice(0,10)} onChange={(e) => onChange({ from: new Date(e.target.value), to: value.to })} className="p-2 rounded border" />
      <span>-</span>
      <input type="date" value={value.to.toISOString().slice(0,10)} onChange={(e) => onChange({ from: value.from, to: new Date(e.target.value) })} className="p-2 rounded border" />
    </div>
  )
}

export default DateRangePicker
