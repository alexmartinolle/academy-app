import {
  getPaymentsByStudent,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentsByMonth,
  getMonthlyRevenue,
  getYearlyRevenue
} from '../repositories/payments.repository.js';

export const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const payments = await getPaymentsByStudent(studentId);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addPayment = async (req, res) => {
  try {
    const payment = await createPayment(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const modifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await updatePayment(id, req.body);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await deletePayment(id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMonthlyPayments = async (req, res) => {
  try {
    const { year, month } = req.params;
    const payments = await getPaymentsByMonth(parseInt(year), parseInt(month));
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRevenueStats = async (req, res) => {
  try {
    const { year, month } = req.params;
    const revenue = await getMonthlyRevenue(parseInt(year), parseInt(month));
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getYearlyRevenueStats = async (req, res) => {
  try {
    const { year } = req.params;
    const revenue = await getYearlyRevenue(parseInt(year));
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
