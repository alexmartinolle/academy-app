import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, AlertCircle, TrendingUp, DollarSign, Calendar } from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingPayments: 0,
    monthlyRevenue: 0
  })
  const [pendingStudents, setPendingStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with API calls
    const mockStats = {
      totalStudents: 20,
      activeStudents: 9,
      pendingPayments: 3,
      monthlyRevenue: 1250
    }
    
    const mockPendingStudents = [
      { id: 10, name: 'Robert Taylor', amount: 50, daysLate: 59 },
      { id: 11, name: 'Ana Martinez', amount: 70, daysLate: 30 },
      { id: 13, name: 'Olivia Lopez', amount: 65, daysLate: 30 }
    ]

    setTimeout(() => {
      setStats(mockStats)
      setPendingStudents(mockPendingStudents)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to Martial Arts Academy Management</p>
      </div>

      {/* Stats Cards */}
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
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Student */}
        <Link to="/students" className="card hover:shadow-red transition-shadow cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3 group-hover:bg-primary-200 transition-colors">
              <Search className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                Search Student
              </h3>
              <p className="text-sm text-gray-600">Find and manage student information</p>
            </div>
          </div>
        </Link>

        {/* Pending Payments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {pendingStudents.length} students
            </span>
          </div>
          <div className="space-y-3">
            {pendingStudents.slice(0, 3).map((student) => (
              <div key={student.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.daysLate} days late</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">€{student.amount}</span>
              </div>
            ))}
          </div>
          <Link 
            to="/students" 
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all pending payments →
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">New student enrolled</p>
                <p className="text-xs text-gray-500">Liam Walker - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Payment received</p>
                <p className="text-xs text-gray-500">Maria Garcia - 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">Payment overdue</p>
                <p className="text-xs text-gray-500">Robert Taylor - 1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
