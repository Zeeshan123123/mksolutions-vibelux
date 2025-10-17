'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

interface EnhancedChartRendererProps {
  data?: ChartData[]
  type?: 'bar' | 'line' | 'area' | 'pie'
  title?: string
  xAxisKey?: string
  yAxisKey?: string
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function EnhancedChartRenderer({ 
  data = [], 
  type = 'bar', 
  title = 'Enhanced Chart',
  xAxisKey = 'name',
  yAxisKey = 'value',
  className = ''
}: EnhancedChartRendererProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const defaultData = data.length > 0 ? data : [
    { name: 'PPFD Zones', value: 850, target: 800 },
    { name: 'Energy Usage', value: 120, target: 100 },
    { name: 'Plant Health', value: 95, target: 90 },
    { name: 'Growth Rate', value: 78, target: 75 },
    { name: 'Yield Prediction', value: 105, target: 100 }
  ]

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={defaultData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yAxisKey} stroke="#8884d8" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#82ca9d" strokeDasharray="5 5" />
          </LineChart>
        )
      
      case 'area':
        return (
          <AreaChart data={defaultData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={yAxisKey} stackId="1" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
        )
      
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={defaultData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKey}
            >
              {defaultData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )
      
      default: // bar
        return (
          <BarChart data={defaultData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxisKey} fill="#8884d8" />
            <Bar dataKey="target" fill="#82ca9d" opacity={0.7} />
          </BarChart>
        )
    }
  }

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600">
        <p>Professional-grade chart rendering with real-time data visualization</p>
      </div>
    </div>
  )
}