import { useEffect, useState } from 'react'

function UserHomePage({ apiBase }) {
  const [publicPosts, setPublicPosts] = useState([])
  const [publicLoading, setPublicLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPublicPosts = () => {
    setPublicLoading(true)
    setError('')
    fetch(`${apiBase}/api/posts`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load posts')
        setPublicPosts(data.posts || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setPublicLoading(false))
  }

  useEffect(() => {
    loadPublicPosts()
  }, [])

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') || 'user'

  return (
    <main className="page">
      <section className="card">
        <header className="card__header">
          <p className="eyebrow">User home</p>
          <h1>Welcome back</h1>
          <p className="muted">You are signed in as a user role.</p>
        </header>
        <div className="card__body">
          <p className="status status--ok">Role: {role}</p>
          <p className="muted">Token stored locally for API calls.</p>
          {publicLoading && <p className="muted">Loading posts...</p>}
          {!publicLoading && publicPosts.length === 0 ? (
            <p className="muted">No posts available yet.</p>
          ) : (
            <div className="list">
              {publicPosts.map((post) => (
                <article key={post._id} className="list__item">
                  <div>
                    <h2>{post.title}</h2>
                    <p className="muted">{post.body || 'No content provided.'}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
          {error && <p className="status status--error">{error}</p>}
          <div className="form__actions">
            <button
              className="primary"
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('role')
                window.location.assign('/')
              }}
            >
              Log out
            </button>
            {!token && <span className="status status--error">No token found</span>}
          </div>
        </div>
      </section>
    </main>
  )
}

export default UserHomePage
