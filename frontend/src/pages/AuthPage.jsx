import { useState } from 'react'

const initialLogin = { email: '', password: '' }
const initialSignup = {
  name: '',
  email: '',
  password: '',
  confirm: '',
  role: 'user',
  inviteCode: '',
}

function AuthPage({ apiBase }) {
  const [activeForm, setActiveForm] = useState('login')
  const [loginData, setLoginData] = useState(initialLogin)
  const [signupData, setSignupData] = useState(initialSignup)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuthSuccess = (data) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.user.role)
    const target = data.redirect || (data.user.role === 'admin' ? '/admin' : '/home')
    setMessage(`Welcome, ${data.user.name || data.user.email}! Redirecting to ${target}...`)
    setTimeout(() => {
      window.location.assign(target)
    }, 600)
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Login failed')
        handleAuthSuccess(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handleSignupSubmit = (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (signupData.password !== signupData.confirm) {
      setError('Passwords need to match.')
      return
    }
    setLoading(true)

    const payload = { ...signupData }
    delete payload.confirm

    fetch(`${apiBase}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Signup failed')
        handleAuthSuccess(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <main className="page">
      <section className="card">
        <header className="card__header">
          <p className="eyebrow">Welcome</p>
          <h1>Access your account</h1>
          <p className="muted">
            Switch between login and sign up. Requests are sent to the backend
            with JWT auth and role-based redirects.
          </p>
          <div className="tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={activeForm === 'login' ? 'tab active' : 'tab'}
              role="tab"
              aria-selected={activeForm === 'login'}
              onClick={() => {
                setActiveForm('login')
                setMessage('')
                setError('')
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={activeForm === 'signup' ? 'tab active' : 'tab'}
              role="tab"
              aria-selected={activeForm === 'signup'}
              onClick={() => {
                setActiveForm('signup')
                setMessage('')
                setError('')
              }}
            >
              Sign Up
            </button>
          </div>
        </header>

        <div className="card__body">
          {activeForm === 'login' ? (
            <form className="form" onSubmit={handleLoginSubmit}>
              <div className="field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginData.email}
                  onChange={(event) => setLoginData({ ...loginData, email: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={(event) => setLoginData({ ...loginData, password: event.target.value })}
                />
              </div>
              <div className="form__actions">
                <label className="checkbox">
                  <input type="checkbox" name="remember" />
                  <span>Remember me</span>
                </label>
                <button type="submit" className="primary" disabled={loading}>
                  {loading ? 'Working…' : 'Log In'}
                </button>
              </div>
            </form>
          ) : (
            <form className="form" onSubmit={handleSignupSubmit}>
              <div className="field">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={signupData.name}
                  onChange={(event) => setSignupData({ ...signupData, name: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={signupData.email}
                  onChange={(event) => setSignupData({ ...signupData, email: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="signup-role">Role</label>
                <select
                  id="signup-role"
                  name="role"
                  value={signupData.role}
                  onChange={(event) => setSignupData({ ...signupData, role: event.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {signupData.role === 'admin' && (
                <div className="field">
                  <label htmlFor="signup-invite">Admin invite code</label>
                  <input
                    id="signup-invite"
                    name="inviteCode"
                    type="text"
                    value={signupData.inviteCode}
                    onChange={(event) =>
                      setSignupData({ ...signupData, inviteCode: event.target.value })
                    }
                  />
                </div>
              )}
              <div className="field">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={signupData.password}
                  onChange={(event) => setSignupData({ ...signupData, password: event.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="signup-confirm">Confirm password</label>
                <input
                  id="signup-confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={signupData.confirm}
                  onChange={(event) => setSignupData({ ...signupData, confirm: event.target.value })}
                />
              </div>
              <div className="form__actions">
                <p className="hint">By signing up you accept the demo terms.</p>
                <button type="submit" className="primary" disabled={loading}>
                  {loading ? 'Working…' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {(message || error) && (
            <p className={error ? 'status status--error' : 'status status--ok'}>{error || message}</p>
          )}
          {!message && !error && loading && <p className="muted">Contacting server…</p>}
        </div>
      </section>
    </main>
  )
}

export default AuthPage
