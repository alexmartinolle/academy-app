import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  User, 
  Calendar, 
  DollarSign, 
  Edit, 
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'

const StudentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [payments, setPayments] = useState([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editedStudent, setEditedStudent] = useState({})

  useEffect(() => {
    // Mock data - replace with API call
    const mockStudent = {
      id: parseInt(id),
      firstName: 'Robert',
      lastName: 'Taylor',
      email: 'robert.t@email.com',
      type: 'adult',
      status: 'pending',
      enrollmentDate: '2025-09-10',
      plan: 'BJJ Unlimited',
      planPrice: 90,
      amountDue: 90,
      daysLate: 59
    }

    const mockPayments = [
      { id: 1, month: 9, year: 2025, paymentDate: '2025-09-01', status: 'paid', source: 'monthly', amount: 90 },
      { id: 2, month: 10, year: 2025, paymentDate: '2025-10-01', status: 'paid', source: 'monthly', amount: 90 },
      { id: 3, month: 11, year: 2025, paymentDate: '2025-11-01', status: 'paid', source: 'monthly', amount: 90 },
      { id: 4, month: 12, year: 2025, paymentDate: null, status: 'pending', source: null, amount: 90 },
      { id: 5, month: 1, year: 2026, paymentDate: null, status: 'pending', source: null, amount: 90 }
    ]

    setTimeout(() => {
      setStudent(mockStudent)
      setEditedStudent(mockStudent)
      setPayments(mockPayments)
      setLoading(false)
    }, 500)
  }, [id])

  const handleSave = () => {
    // Save logic - replace with API call
    setStudent(editedStudent)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditedStudent(student)
    setEditing(false)
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

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Student not found</h3>
        <button onClick={() => navigate('/students')} className="mt-4 btn btn-primary">
          Back to Search
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/students')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            ← Back to Students
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {editing ? (
            <>
              <button onClick={handleSave} className="btn btn-primary flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
              <button onClick={handleCancel} className="btn btn-secondary flex items-center">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn btn-primary flex items-center">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editedStudent.firstName}
                    onChange={(e) => setEditedStudent({...editedStudent, firstName: e.target.value})}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{student.firstName}</p>
                )}
              </div>
              <div>
                <label className="label">Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editedStudent.lastName}
                    onChange={(e) => setEditedStudent({...editedStudent, lastName: e.target.value})}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{student.lastName}</p>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={editedStudent.email}
                    onChange={(e) => setEditedStudent({...editedStudent, email: e.target.value})}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{student.email}</p>
                )}
              </div>
              <div>
                <label className="label">Type</label>
                {editing ? (
                  <select
                    value={editedStudent.type}
                    onChange={(e) => setEditedStudent({...editedStudent, type: e.target.value})}
                    className="input"
                  >
                    <option value="adult">Adult</option>
                    <option value="kids">Kids</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    student.type === 'adult' ? 'bg-gray-100 text-gray-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {student.type}
                  </span>
                )}
              </div>
              <div>
                <label className="label">Enrollment Date</label>
                {editing ? (
                  <input
                    type="date"
                    value={editedStudent.enrollmentDate}
                    onChange={(e) => setEditedStudent({...editedStudent, enrollmentDate: e.target.value})}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {student.enrollmentDate}
                  </div>
                )}
              </div>
              <div>
                <label className="label">Current Plan</label>
                <p className="text-gray-900">{student.plan}</p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getMonthName(payment.month)} {payment.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paymentDate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status === 'paid' ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Paid</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> Pending</>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{payment.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.status === 'active' ? 'bg-green-100 text-green-800' :
                  student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  student.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {student.status}
                </span>
              </div>
              {student.amountDue && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Payment Due</p>
                      <p className="text-sm text-yellow-700">€{student.amountDue} ({student.daysLate} days late)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Plan Details */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Plan</span>
                <span className="text-sm font-medium text-gray-900">{student.plan}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Price</span>
                <span className="text-sm font-medium text-gray-900">€{student.planPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Student Type</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.type === 'adult' ? 'bg-gray-100 text-gray-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {student.type}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn btn-primary flex items-center justify-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </button>
              <button className="w-full btn btn-secondary flex items-center justify-center">
                <Edit className="h-4 w-4 mr-2" />
                Change Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetail
