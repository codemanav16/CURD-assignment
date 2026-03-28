import { useEffect, useState } from 'react'

function AdminPage({ apiBase }) {
  const [posts, setPosts] = useState([])
  const [draft, setDraft] = useState({ id: null, title: '', body: '' })
  const [postsLoading, setPostsLoading] = useState(false)
  const [error, setError] = useState('')

  const authorizedRequest = async (path, options = {}) => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Missing token')
    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }

  const loadPosts = () => {
    setPostsLoading(true)
    setError('')
    authorizedRequest('/api/admin/posts')
      .then((data) => setPosts(data.posts || []))
      .catch((err) => setError(err.message))
      .finally(() => setPostsLoading(false))
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const resetDraft = () => setDraft({ id: null, title: '', body: '' })

  const handleSave = (event) => {
    event.preventDefault()
    if (!draft.title.trim()) return

    setError('')
    const payload = { title: draft.title, body: draft.body }

    if (draft.id) {
      authorizedRequest(`/api/admin/posts/${draft.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
        .then((data) => {
          setPosts((list) => list.map((p) => (p._id === data.post._id ? data.post : p)))
          resetDraft()
        })
        .catch((err) => setError(err.message))
    } else {
      authorizedRequest('/api/admin/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
        .then((data) => {
          setPosts((list) => [data.post, ...list])
          resetDraft()
        })
        .catch((err) => setError(err.message))
    }
  }

  const handleEdit = (post) => {
    setDraft({ id: post._id, title: post.title, body: post.body })
  }

  const handleDelete = (id) => {
    setError('')
    authorizedRequest(`/api/admin/posts/${id}`, { method: 'DELETE' })
      .then(() => {
        setPosts((list) => list.filter((p) => p._id !== id))
        if (draft.id === id) resetDraft()
      })
      .catch((err) => setError(err.message))
  }

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role') || 'user'

  return (
    <main className="page">
      <section className="card">
        <header className="card__header">
          <p className="eyebrow">Admin</p>
          <h1>Admin dashboard</h1>
          <p className="muted">Protected area for admin role.</p>
        </header>
        <div className="card__body">
          <p className="status status--ok">Role: {role}</p>
          <p className="muted">Token stored locally for admin API calls.</p>

          <form className="form" onSubmit={handleSave}>
            <div className="field">
              <label htmlFor="post-title">Post title</label>
              <input
                id="post-title"
                name="title"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Enter a title"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="post-body">Content</label>
              <textarea
                id="post-body"
                name="body"
                rows="4"
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                placeholder="Write something..."
              />
            </div>
            <div className="form__actions">
              <button type="submit" className="primary">
                {draft.id ? 'Update post' : 'Create post'}
              </button>
              <button type="button" className="primary ghost" onClick={resetDraft}>
                Clear
              </button>
            </div>
          </form>

          {postsLoading && <p className="muted">Loading posts...</p>}
          {!postsLoading && posts.length === 0 ? (
            <p className="muted">No posts yet. Create the first one.</p>
          ) : (
            <div className="list">
              {posts.map((post) => (
                <article key={post._id} className="list__item">
                  <div>
                    <h2>{post.title}</h2>
                    <p className="muted">{post.body || 'No content provided.'}</p>
                  </div>
                  <div className="list__actions">
                    <button className="primary ghost" type="button" onClick={() => handleEdit(post)}>
                      Edit
                    </button>
                    <button className="primary danger" type="button" onClick={() => handleDelete(post._id)}>
                      Delete
                    </button>
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

export default AdminPage
