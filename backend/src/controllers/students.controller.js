import {
  getStudentsWithStatus,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByStatus,
  getInactiveStudents
} from '../repositories/students.repository.js';

export const getAllStudents = async (req, res) => {
  try {
    const students = await getStudentsWithStatus();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await getStudentById(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addStudent = async (req, res) => {
  try {
    const student = await createStudent(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const modifyStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await updateStudent(id, req.body);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await deleteStudent(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStudentsByStatusFilter = async (req, res) => {
  try {
    const { status } = req.params;
    const students = await getStudentsByStatus(status);
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getInactiveStudentsList = async (req, res) => {
  try {
    const students = await getInactiveStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
