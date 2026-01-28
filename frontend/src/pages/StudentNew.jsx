import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, User, Mail, CreditCard } from 'lucide-react'
import { studentsAPI, plansAPI, paymentsAPI } from '../services/api'

const StudentNew = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    plan_id: '',
    type: 'adult'
  })
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await plansAPI.getAll()
        setPlans(plansData)
      } catch (error) {
        console.error('Error fetching plans:', error)
        setError('Failed to load plans')
      }
    }

    fetchPlans()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.plan_id) {
      setError('Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create student
      const newStudent = await studentsAPI.create({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        plan_id: parseInt(formData.plan_id),
        type: formData.type,
        student_status: 'active',
        enrollment_date: new Date().toISOString().split('T')[0]
      })

      // Create initial payment for current month
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      await paymentsAPI.create({
        student_id: newStudent.id,
        plan_id: parseInt(formData.plan_id),
        month: currentMonth,
        year: currentYear,
        payment_date: currentDate.toISOString().split('T')[0],
        status: 'paid',
        source: 'monthly'
      })

      navigate(`/students/${newStudent.id}`)
    } catch (error) {
      console.error('Error creating student:', error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.message?.includes('duplicate key')) {
        setError('A student with this email already exists')
      } else {
        setError('Failed to create student')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/students')
  }

  if (error && !loading) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
            <p className="mt-2 text-gray-600">Create a new student account</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="input pl-10"
                    placeholder="Enter first name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="input pl-10"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="input pl-10"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  Student Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="input"
                  required
                >
                  <option value="adult">Adult</option>
                  <option value="kids">Kids</option>
                </select>
              </div>
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Selection</h2>
            <div>
              <label className="label">
                Select Plan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={formData.plan_id}
                  onChange={(e) => handleInputChange('plan_id', e.target.value)}
                  className="input pl-10"
                  required
                >
                  <option value="">Select a plan</option>
                  {plans
                    .filter(plan => formData.type === 'kids' ? plan.type === 'kids' : formData.type === 'adult' ? plan.type === 'adult' : true)
                    .map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - €{plan.price}/month
                      </option>
                    ))}
                </select>
              </div>
              {formData.type === 'adult' && (
                <p className="mt-2 text-sm text-gray-500">
                  Only adult plans are shown for adult students
                </p>
              )}
              {formData.type === 'kids' && (
                <p className="mt-2 text-sm text-gray-500">
                  Only kids plans are shown for kids students
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary flex items-center"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success flex items-center"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StudentNew
