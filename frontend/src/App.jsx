import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import StudentSearch from './pages/StudentSearch'
import StudentDetail from './pages/StudentDetail'
import StudentNew from './pages/StudentNew'
import Statistics from './pages/Statistics'
import Financial from './pages/Financial'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<StudentSearch />} />
        <Route path="/students/new" element={<StudentNew />} />
        <Route path="/students/:id" element={<StudentDetail />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/financial" element={<Financial />} />
      </Routes>
    </Layout>
  )
}

export default App
