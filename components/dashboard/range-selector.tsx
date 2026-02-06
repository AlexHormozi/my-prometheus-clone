'use client'

import { Button } from '@/components/ui/button'

interface RangeSelectorProps {
  selected: '7' | '30' | '90'
  onChange: (range: '7' | '30' | '90') => void
}

export function RangeSelector({ selected, onChange }: RangeSelectorProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={selected === '7' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('7')}
      >
        7 Days
      </Button>
      <Button
        variant={selected === '30' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('30')}
      >
        30 Days
      </Button>
      <Button
        variant={selected === '90' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('90')}
      >
        90 Days
      </Button>
    </div>
  )
}
