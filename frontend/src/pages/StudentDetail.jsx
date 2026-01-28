import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  User, 
  Calendar, 
  DollarSign, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  CreditCard,
  TrendingUp,
  Trash2
} from 'lucide-react'
import { studentsAPI, paymentsAPI, plansAPI } from '../services/api'

const StudentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [payments, setPayments] = useState([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editedStudent, setEditedStudent] = useState(null)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState(null)
  const [availablePlans, setAvailablePlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const paymentsPerPage = 6

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const [studentData, paymentsData] = await Promise.all([
          studentsAPI.getById(id),
          paymentsAPI.getByStudent(id)
        ])
        
        setStudent(studentData)
        setEditedStudent(studentData)
        setPayments(paymentsData)
        setCurrentPage(1) // Resetear a primera página cuando cargan nuevos datos
      } catch (error) {
        console.error('Error fetching student data:', error)
        setError('Failed to load student data')
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [id])

  const handleSave = async () => {
    try {
      await studentsAPI.update(id, editedStudent)
      setStudent(editedStudent)
      setEditing(false)
    } catch (error) {
      console.error('Error updating student:', error)
      setError('Failed to update student')
    }
  }

  const handleInputChange = (field, value) => {
    setEditedStudent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCancel = () => {
    setEditedStudent(student)
    setEditing(false)
  }

  const handleRecordPayment = async () => {
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      // Obtener el plan actual del alumno
      let currentPlanId = student.plan_id
      
      // Si no tiene plan_id, buscar el plan más reciente del estudiante
      if (!currentPlanId && payments.length > 0) {
        const mostRecentPayment = payments.reduce((latest, payment) => {
          const paymentDate = new Date(payment.year, payment.month - 1)
          const latestDate = new Date(latest.year, latest.month - 1)
          return paymentDate > latestDate ? payment : latest
        }, payments[0])
        currentPlanId = mostRecentPayment.plan_id
      }
      
      console.log('Current plan_id for Record Payment:', currentPlanId)
      
      if (!currentPlanId) {
        setError('Student has no assigned plan')
        return
      }
      
      // Verificar si el mes actual ya está pagado
      const currentMonthPaid = payments.some(p => 
        p.month === currentMonth && 
        p.year === currentYear && 
        p.status === 'paid'
      )
      
      if (currentMonthPaid) {
        // Mes actual pagado -> encontrar el siguiente mes no pagado
        let nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
        let nextYear = currentMonth === 12 ? currentYear + 1 : currentYear
        
        // Buscar el siguiente mes que no tenga pago
        while (payments.some(p => 
          p.month === nextMonth && 
          p.year === nextYear && 
          p.status === 'paid'
        )) {
          nextMonth = nextMonth === 12 ? 1 : nextMonth + 1
          if (nextMonth === 1) {
            nextYear++
          }
        }
        
        await paymentsAPI.create({
          student_id: parseInt(id),
          plan_id: currentPlanId,
          month: nextMonth,
          year: nextYear,
          payment_date: currentDate.toISOString().split('T')[0],
          status: 'paid',
          source: 'advanced'
        })
      } else {
        // Mes actual no pagado -> crear pago para el mes actual
        await paymentsAPI.create({
          student_id: parseInt(id),
          plan_id: currentPlanId,
          month: currentMonth,
          year: currentYear,
          payment_date: currentDate.toISOString().split('T')[0],
          status: 'paid',
          source: 'monthly'
        })
      }
      
      // Refrescar datos
      const [studentData, paymentsData] = await Promise.all([
        studentsAPI.getById(id),
        paymentsAPI.getByStudent(id)
      ])
      setStudent(studentData)
      setPayments(paymentsData)
      setCurrentPage(1) // Resetear a primera página
    } catch (error) {
      console.error('Error recording payment:', error)
      if (error.message?.includes('duplicate key')) {
        setError('Payment already exists for this month')
      } else {
        setError('Failed to record payment')
      }
    }
  }

  const handleChangePlan = async () => {
    try {
      const plansData = await plansAPI.getAll()
      
      // Filtrar planes según el tipo de estudiante
      const filteredPlans = student?.type === 'adult' 
        ? plansData.filter(plan => plan.type === 'adult')
        : plansData // Si es kid, puede adquirir todos los planes
      
      setAvailablePlans(filteredPlans)
      setShowPlanDialog(true)
    } catch (error) {
      console.error('Error loading plans:', error)
      setError('Failed to load plans')
    }
  }

  const handleDeletePayment = async (paymentId) => {
    setPaymentToDelete(paymentId)
    setShowDeleteDialog(true)
  }

  const confirmDeletePayment = async () => {
    try {
      await paymentsAPI.delete(paymentToDelete)
      
      // Refrescar datos
      const [studentData, paymentsData] = await Promise.all([
        studentsAPI.getById(id),
        paymentsAPI.getByStudent(id)
      ])
      setStudent(studentData)
      setPayments(paymentsData)
      setCurrentPage(1) // Resetear a primera página
      setShowDeleteDialog(false)
      setPaymentToDelete(null)
    } catch (error) {
      console.error('Error deleting payment:', error)
      setError('Failed to delete payment')
    }
  }

  const handlePlanChange = async () => {
    if (!selectedPlan) return
    
    try {
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      // Usar el plan seleccionado (no el plan del estudiante)
      const planIdToUse = selectedPlan.id
      
      console.log('Changing to plan_id:', planIdToUse)
      
      // Crear nuevo pago con el plan seleccionado
      await paymentsAPI.create({
        student_id: parseInt(id),
        plan_id: planIdToUse,
        month: currentMonth,
        year: currentYear,
        payment_date: currentDate.toISOString().split('T')[0],
        status: 'paid',
        source: 'changed'
      })
      
      // Refrescar datos
      const [studentData, paymentsData] = await Promise.all([
        studentsAPI.getById(id),
        paymentsAPI.getByStudent(id)
      ])
      setStudent(studentData)
      setPayments(paymentsData)
      setCurrentPage(1) // Resetear a primera página cuando cargan nuevos datos
      setLoading(false)
      setSelectedPlan(null)
    } catch (error) {
      console.error('Error changing plan:', error)
      setError('Failed to change plan')
    }
  }

  const handlePayAdditional = async (payment) => {
    try {
      console.log('Student data:', student)
      console.log('Student plan_id:', student.plan_id)
      
      // Obtener el plan actual del alumno
      let currentPlanId = student.plan_id
      
      // Si no tiene plan_id, buscar el plan más reciente del estudiante
      if (!currentPlanId && payments.length > 0) {
        const mostRecentPayment = payments.reduce((latest, payment) => {
          const paymentDate = new Date(payment.year, payment.month - 1)
          const latestDate = new Date(latest.year, latest.month - 1)
          return paymentDate > latestDate ? payment : latest
        }, payments[0])
        currentPlanId = mostRecentPayment.plan_id
      }
      
      console.log('Current plan_id to use:', currentPlanId)
      
      if (!currentPlanId) {
        setError('Student has no assigned plan')
        return
      }
      
      // Verificar si ya existe un pago para este mes/año
      const existingPayment = payments.some(p => 
        p.month === payment.month && 
        p.year === payment.year && 
        p.status === 'paid'
      )
      
      if (existingPayment) {
        setError('Payment already exists for this month')
        return
      }
      
      await paymentsAPI.create({
        student_id: parseInt(id),
        plan_id: currentPlanId,
        month: payment.month,
        year: payment.year,
        payment_date: new Date().toISOString().split('T')[0],
        status: 'paid',
        source: 'monthly'
      })
      
      // Refrescar datos
      const [studentData, paymentsData] = await Promise.all([
        studentsAPI.getById(id),
        paymentsAPI.getByStudent(id)
      ])
      setStudent(studentData)
      setPayments(paymentsData)
      setCurrentPage(1)
    } catch (error) {
      console.error('Error paying additional:', error)
      setError('Failed to process payment')
    }
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
      case 'changed':
        return 'bg-warning-100 text-warning-800'
      case 'advanced':
        return 'bg-purple-100 text-purple-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1]
  }

  // Calculate pending payments up to current month
  const calculateAdditionalPayments = () => {
    if (!student?.enrollment_date) return []
    
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    const enrollmentDate = new Date(student.enrollment_date)
    
    const additionalPayments = []
    
    // Start from enrollment date
    let checkMonth = enrollmentDate.getMonth() + 1
    let checkYear = enrollmentDate.getFullYear()
    
    // Check all months from enrollment to current month
    while (checkYear < currentYear || (checkYear === currentYear && checkMonth <= currentMonth)) {
      // Check if this month already has a paid payment
      const hasPaidPayment = payments.some(p => 
        p.month === checkMonth && 
        p.year === checkYear && 
        p.status === 'paid'
      )
      
      // Add pending payment if not paid
      if (!hasPaidPayment) {
        additionalPayments.push({
          id: `pending-${checkMonth}-${checkYear}`,
          month: checkMonth,
          year: checkYear,
          status: 'pending',
          source: 'pending',
          payment_date: null,
          price: student.price || 0,
          isAdditional: true,
          displayStatus: '⏰ Pending'
        })
      }
      
      // Move to next month
      checkMonth++
      if (checkMonth > 12) {
        checkMonth = 1
        checkYear++
      }
    }
    
    console.log('Mock payments calculated:', additionalPayments)
    return additionalPayments
  }

  // Combine real payments with additional ones
  const allPayments = [
    ...payments,
    ...calculateAdditionalPayments()
  ].sort((a, b) => {
    // Sort by date (most recent first)
    const dateA = new Date(b.year, b.month - 1)
    const dateB = new Date(a.year, a.month - 1)
    return dateA - dateB
  })

  // Pagination functions
  const indexOfLastPayment = currentPage * paymentsPerPage
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage
  const currentPayments = allPayments.slice(indexOfFirstPayment, indexOfLastPayment)
  const totalPages = Math.ceil(allPayments.length / paymentsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))

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

  if (!student) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Student not found</h3>
        <p className="mt-2 text-gray-600">The student you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/students')}
          className="mt-4 btn btn-primary"
        >
          Back to Students
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
            <button onClick={() => setEditing(true)} className="btn btn-secondary flex items-center">
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
                    value={editedStudent.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{student.first_name}</p>
                )}
              </div>
              <div>
                <label className="label">Last Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editedStudent.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{student.last_name}</p>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={editedStudent.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    value={editedStudent.enrollment_date}
                    onChange={(e) => handleInputChange('enrollment_date', e.target.value)}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(student.enrollment_date).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div>
                <label className="label">Current Plan</label>
                <p className="text-gray-900">{student.plan_name || 'No plan assigned'}</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPayments.map((payment) => (
                    <tr key={payment.id} className={`hover:bg-gray-50 ${payment.isAdditional ? 'bg-yellow-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getMonthName(payment.month)} {payment.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status === 'paid' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Paid
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </>
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
                        €{payment.price || payment.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {payment.isAdditional ? (
                          <button
                            onClick={() => handlePayAdditional(payment)}
                            className="btn btn-success flex items-center text-xs"
                            title="Pay pending month"
                          >
                            <DollarSign className="h-3 w-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete payment"
                          >
                            <Trash2 className="h-4 w-4" />    
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstPayment + 1} to {Math.min(indexOfLastPayment, allPayments.length)} of {allPayments.length} payments
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="btn btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4 mr-1 rotate-180" />
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === index + 1
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <X className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  student.student_status === 'active' ? 'bg-green-100 text-green-800' :
                  student.student_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  student.student_status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {student.student_status}
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
                <span className="text-sm font-medium text-gray-900">{student.plan_name || 'No plan'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Price</span>
                <span className="text-sm font-medium text-gray-900">€{student.price || '0'}</span>
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
              <button onClick={handleRecordPayment} className="w-full btn btn-success flex items-center justify-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </button>
              <button onClick={handleChangePlan} className="w-full btn btn-warning flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Change Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Selection Dialog */}
      {showPlanDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-warning-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Select New Plan</h3>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {student?.type === 'adult' 
                  ? '👤 Adult plans only available for adult students'
                  : '👶 All plans available for kids students'
                }
              </p>
            </div>
            
            <p className="text-gray-600 mb-6">
              Choose a new plan for this student. This will update their payment record.
            </p>
            
            <div className="space-y-3 mb-6">
              {availablePlans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No plans available for this student type.</p>
                </div>
              ) : (
                availablePlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlan?.id === plan.id
                        ? 'border-warning-500 bg-warning-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{plan.name}</h4>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">€{plan.price}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          plan.type === 'adult' 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {plan.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handlePlanChange}
                disabled={!selectedPlan || availablePlans.length === 0}
                className="flex-1 btn btn-warning flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Change Plan
              </button>
              
              <button
                onClick={() => {
                  setShowPlanDialog(false)
                  setSelectedPlan(null)
                }}
                className="flex-1 btn btn-secondary flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Trash2 className="h-6 w-6 text-danger-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Payment</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this payment record? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmDeletePayment}
                className="flex-1 btn btn-danger flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
              
              <button
                onClick={() => {
                  setShowDeleteDialog(false)
                  setPaymentToDelete(null)
                }}
                className="flex-1 btn btn-secondary flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDetail
