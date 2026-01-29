import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, AlertCircle, TrendingUp, DollarSign, Calendar, Plus, User } from 'lucide-react'
import { dashboardAPI, studentsAPI, paymentsAPI } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingPayments: 0,
    inactiveStudents: 0
  })
  const [pendingStudents, setPendingStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data in parallel using BBDD endpoints
        const [studentsData, pendingPaymentsStats, pendingPaymentsList] = await Promise.all([
          studentsAPI.getAll(),
          studentsAPI.getPendingPaymentsCount(),
          studentsAPI.getPendingPayments(3)
        ])
        
        // Calculate basic stats from students data
        const totalStudents = studentsData.length
        const activeStudents = studentsData.filter(s => s.student_status === 'active').length
        const inactiveStudents = studentsData.filter(s => s.student_status === 'inactive').length
        
        setStats({
          totalStudents,
          activeStudents,
          pendingPayments: pendingPaymentsStats.count,
          inactiveStudents
        })
        
        setPendingStudents(pendingPaymentsList)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
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
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveStudents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Add Student */}
        <Link to="/students/new" className="card hover:shadow-red transition-shadow cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3 group-hover:bg-green-200 transition-colors">
              <Plus className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                Add Student
              </h3>
              <p className="text-sm text-gray-600">Create a new student account</p>
            </div>
          </div>
        </Link>

        {/* Pending Payments */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {pendingStudents.length} students
            </span>
          </div>
          <div className="space-y-3">
            {pendingStudents.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No pending payments</p>
                <p className="text-xs text-gray-400">All students are up to date!</p>
              </div>
            ) : (
              pendingStudents.map((student) => (
                <Link
                  key={student.id}
                  to={`/students/${student.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                      <User className="h-4 w-4 text-gray-600 group-hover:text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 group-hover:text-yellow-700">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.daysLate} days late</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-yellow-700">€{student.amount}</span>
                    <p className="text-xs text-gray-500">Click to view →</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <Link 
            to="/students" 
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all pending payments →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
