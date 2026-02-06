'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false })

interface ScoreLineChartProps {
  currentUserData: Array<{ date: string; score: number }>
  partnerData: Array<{ date: string; score: number }>
  currentUserName: string
  partnerName: string
}

export function ScoreLineChart({ currentUserData, partnerData, currentUserName, partnerName }: ScoreLineChartProps) {
  const option = useMemo(() => {
    const allDates = Array.from(new Set([...currentUserData.map(d => d.date), ...partnerData.map(d => d.date)])).sort()

    const currentUserScores = allDates.map(date => {
      const item = currentUserData.find(d => d.date === date)
      return item?.score || 0
    })

    const partnerScores = allDates.map(date => {
      const item = partnerData.find(d => d.date === date)
      return item?.score || 0
    })

    return {
      tooltip: {
        trigger: 'axis',
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
        boundaryGap: false,
        data: allDates,
        axisLabel: {
          formatter: (value: string) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          },
        },
      },
      yAxis: {
        type: 'value',
        name: 'Score',
      },
      series: [
        {
          name: currentUserName,
          type: 'line',
          data: currentUserScores,
          smooth: true,
          itemStyle: { color: '#3b82f6' },
        },
        {
          name: partnerName,
          type: 'line',
          data: partnerScores,
          smooth: true,
          itemStyle: { color: '#8b5cf6' },
        },
      ],
    }
  }, [currentUserData, partnerData, currentUserName, partnerName])

  return <ReactECharts option={option} style={{ height: '400px' }} />
}
