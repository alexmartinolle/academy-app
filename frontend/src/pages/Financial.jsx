import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { paymentsAPI } from '../services/api'

const Financial = () => {
  const [payments, setPayments] = useState([])
  const [revenueStats, setRevenueStats] = useState({})
  const [filterMonth, setFilterMonth] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const currentDate = new Date()
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        
        const [paymentsData, revenueData] = await Promise.all([
          paymentsAPI.getAll(),
          paymentsAPI.getRevenueStats(year, month)
        ])
        
        setPayments(paymentsData)
        setRevenueStats(revenueData)
      } catch (error) {
        console.error('Error fetching financial data:', error)
        setError('Failed to load financial data')
      } finally {
        setLoading(false)
      }
    }

    fetchFinancialData()
  }, [])

  const filteredPayments = payments.filter(payment => {
    const matchesMonth = !filterMonth || payment.month === parseInt(filterMonth)
    const matchesYear = !filterYear || payment.year === parseInt(filterYear)
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    
    return matchesMonth && matchesYear && matchesStatus
  })

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSourceColor = (source) => {
    switch (source) {
      case 'monthly':
        return 'bg-blue-100 text-blue-800'
      case 'advanced':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
        <p className="mt-2 text-gray-600">Manage payments and track revenue</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">€{revenueStats.totalRevenue}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid Revenue</p>
              <p className="text-2xl font-bold text-gray-900">€{revenueStats.paidRevenue}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Revenue</p>
              <p className="text-2xl font-bold text-gray-900">€{revenueStats.pendingRevenue}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Payment</p>
              <p className="text-2xl font-bold text-gray-900">€{revenueStats.averagePayment}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="input"
          >
            <option value="">All Months</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {getMonthName(i + 1)}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="input"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <button className="btn btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Payments</span>
              <span className="text-sm font-medium">{revenueStats.totalPayments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Paid</span>
              <span className="text-sm font-medium text-green-600">{revenueStats.paidPayments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-medium text-yellow-600">{revenueStats.pendingPayments}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">Payment Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((revenueStats.paidPayments / revenueStats.totalPayments) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Monthly Payments</span>
              <span className="text-sm font-medium">€{revenueStats.paidRevenue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Advanced Payments</span>
              <span className="text-sm font-medium">€0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending Collection</span>
              <span className="text-sm font-medium text-yellow-600">€{revenueStats.pendingRevenue}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full btn btn-primary flex items-center justify-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </button>
            <button className="w-full btn btn-secondary flex items-center justify-center">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Reminders
            </button>
            <button className="w-full btn btn-secondary flex items-center justify-center">
              <Eye className="h-4 w-4 mr-2" />
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.planName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getMonthName(payment.month)} {payment.year}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {payment.paymentDate || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status === 'paid' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Paid</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" /> Pending</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.source && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(payment.source)}`}>
                        {payment.source}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">€{payment.amount}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPayments.length === 0 && (
          <div className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Financial
