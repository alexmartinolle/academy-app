import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, User, Calendar, AlertCircle, Plus } from 'lucide-react'
import { studentsAPI, paymentsAPI } from '../services/api'

const StudentSearch = () => {
  const [students, setStudents] = useState([])
  const [studentsWithPayments, setStudentsWithPayments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudentsWithPayments = async () => {
      try {
        const studentsData = await studentsAPI.getAll()
        
        // Fetch payments for each student to get last payment info
        const studentsWithPaymentInfo = await Promise.all(
          studentsData.map(async (student) => {
            try {
              const payments = await paymentsAPI.getByStudent(student.id)
              const paidPayments = payments.filter(p => p.status === 'paid')
              
              // Find the last paid payment
              let lastPayment = null
              if (paidPayments.length > 0) {
                lastPayment = paidPayments.reduce((latest, payment) => {
                  const latestDate = new Date(latest.year, latest.month - 1)
                  const paymentDate = new Date(payment.year, payment.month - 1)
                  return paymentDate > latestDate ? payment : latest
                }, paidPayments[0])
              }
              
              return {
                ...student,
                lastPayment: lastPayment
              }
            } catch (error) {
              console.error(`Error fetching payments for student ${student.id}:`, error)
              return {
                ...student,
                lastPayment: null
              }
            }
          })
        )
        
        setStudents(studentsData)
        setStudentsWithPayments(studentsWithPaymentInfo)
      } catch (error) {
        console.error('Error fetching students:', error)
        setError('Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentsWithPayments()
  }, [])

  const filteredStudents = studentsWithPayments.filter(student => {
    const matchesSearch = 
      (student.first_name && student.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.last_name && student.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatusFilter = filterStatus === 'all' || student.student_status === filterStatus
    const matchesTypeFilter = filterType === 'all' || student.type === filterType
    
    return matchesSearch && matchesStatusFilter && matchesTypeFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    return type === 'adult' ? 'bg-gray-100 text-gray-800' : 'bg-purple-100 text-purple-800'
  }

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1]
  }

  const formatLastPayment = (lastPayment) => {
    if (!lastPayment) return 'No payments'
    
    const paymentDate = new Date(lastPayment.date)
    const formattedDate = paymentDate.toLocaleDateString()
    const monthYear = `${getMonthName(lastPayment.month)} ${lastPayment.year}`
    
    return `${monthYear} (€${lastPayment.amount})`
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Search</h1>
          <p className="mt-2 text-gray-600">Find and manage student information</p>
        </div>
        <Link
          to="/students/new"
          className="btn btn-secondary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="adult">Adult</option>
              <option value="kids">Kids</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found <span className="font-semibold">{filteredStudents.length}</span> students
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Inactive</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Adult</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Kids</span>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <Link
            key={student.id}
            to={`/students/${student.id}`}
            className="card hover:shadow-red transition-shadow cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <User className="h-6 w-6 text-gray-600 group-hover:text-primary-600" />
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{student.email}</div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(student.student_status)}`}>
                      {student.student_status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(student.type)}`}>
                      {student.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{student.plan}</p>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatLastPayment(student.lastPayment)}
                </div>
                {student.amountDue && (
                  <div className="flex items-center text-sm font-semibold text-yellow-600 mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    €{student.amountDue} due
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  )
}

export default StudentSearch
