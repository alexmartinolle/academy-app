import { useState, useEffect } from 'react'
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { statisticsAPI } from '../services/api'

const Statistics = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingStudents: 0,
    inactiveStudents: 0,
    trialStudents: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0
  })
  const [planDistribution, setPlanDistribution] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStatisticsData = async () => {
      try {
        const [overviewData, statusData, planData, trendData] = await Promise.all([
          statisticsAPI.getOverview(),
          statisticsAPI.getStudentStatus(),
          statisticsAPI.getPlanDistribution(),
          statisticsAPI.getMonthlyTrend()
        ])
        
        setStats(overviewData)
        setPlanDistribution(planData)
        setMonthlyTrend(trendData)
      } catch (error) {
        console.error('Error fetching statistics data:', error)
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchStatisticsData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    )
  }

  const statusData = [
    { name: 'Active', value: stats.activeStudents, color: '#16a34a' },
    { name: 'Pending', value: stats.pendingStudents, color: '#ca8a04' },
    { name: 'Inactive', value: stats.inactiveStudents, color: '#dc2626' },
    { name: 'Trial', value: stats.trialStudents, color: '#2563eb' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistics Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of academy performance and student metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.monthlyRevenue}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Yearly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">€{stats.yearlyRevenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={planDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="students" fill="#dc2626" name="Students" />
            <Bar yAxisId="right" dataKey="revenue" fill="#2563eb" name="Revenue (€)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Student Types</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Adults</span>
              <span className="text-sm font-medium">14</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Kids</span>
              <span className="text-sm font-medium">6</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Payment Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Paid Current Month</span>
              <span className="text-sm font-medium">9</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Pending</span>
              <span className="text-sm font-medium">3</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Average Revenue</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Per Student</span>
              <span className="text-sm font-medium">€62.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Per Active Student</span>
              <span className="text-sm font-medium">€138.89</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Growth Rate</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Monthly</span>
              <span className="text-sm font-medium text-green-600">+5.3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-900">Yearly</span>
              <span className="text-sm font-medium text-green-600">+33.3%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
