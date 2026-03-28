import './App.css'
import AdminPage from './pages/AdminPage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import UserHomePage from './pages/UserHomePage.jsx'

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

function App() {
  const currentPath = window.location.pathname

  if (currentPath === '/admin') {
    return <AdminPage apiBase={apiBase} />
  }

  if (currentPath === '/home') {
    return <UserHomePage apiBase={apiBase} />
  }

  return <AuthPage apiBase={apiBase} />
}

export default App
