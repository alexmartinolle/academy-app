import {
  getAllPlans,
  getPlanById,
  getPlansByType,
  createPlan,
  updatePlan,
  deletePlan
} from '../repositories/plans.repository.js';

export const getPlans = async (req, res) => {
  try {
    const { type } = req.query;
    
    if (type) {
      const plans = await getPlansByType(type);
      return res.json(plans);
    }
    
    const plans = await getAllPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await getPlanById(id);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addPlan = async (req, res) => {
  try {
    const plan = await createPlan(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const modifyPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await updatePlan(id, req.body);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await deletePlan(id);
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
