'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

interface WeeklyBarChartProps {
  currentUserData: Array<{ week: string; score: number }>
  partnerData: Array<{ week: string; score: number }>
  currentUserName: string
  partnerName: string
}

export function WeeklyBarChart({ currentUserData, partnerData, currentUserName, partnerName }: WeeklyBarChartProps) {
  const option = useMemo(() => {
    const allWeeks = Array.from(new Set([...currentUserData.map(d => d.week), ...partnerData.map(d => d.week)])).sort()

    const currentUserScores = allWeeks.map(week => {
      const item = currentUserData.find(d => d.week === week)
      return item?.score || 0
    })

    const partnerScores = allWeeks.map(week => {
      const item = partnerData.find(d => d.week === week)
      return item?.score || 0
    })

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
      },
      legend: {
        data: [currentUserName, partnerName],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: allWeeks,
        axisLabel: {
          formatter: (value: string) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Weekly Score',
      },
      series: [
        {
          name: currentUserName,
          type: 'bar',
          data: currentUserScores,
          itemStyle: { color: '#3b82f6' },
        },
        {
          name: partnerName,
          type: 'bar',
          data: partnerScores,
          itemStyle: { color: '#8b5cf6' },
        },
      ],
    }
  }, [currentUserData, partnerData, currentUserName, partnerName])

  return <ReactECharts option={option} style={{ height: '400px' }} />
}
