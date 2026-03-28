import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me'
const adminInviteCode = process.env.ADMIN_INVITE_CODE || 'admin-code'
const serverUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`

app.use(cors())
app.use(express.json())

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Demo API',
      version: '1.0.0',
      description: 'JWT auth with admin/user roles and posts CRUD.',
    },
    servers: [{ url: serverUrl }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['user', 'admin'] },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            author: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            redirect: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: { 200: { description: 'Service healthy' } },
        },
      },
      '/api/auth/signup': {
        post: {
          summary: 'Create user account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin'] },
                    inviteCode: { type: 'string' },
                  },
                  required: ['name', 'email', 'password'],
                },
              },
            },
          },
          responses: {
            201: { description: 'User created', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            400: { description: 'Validation error' },
            403: { description: 'Invalid admin invite' },
            409: { description: 'Email already registered' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Login and get JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            200: { description: 'Login success', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          summary: 'Get token payload',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Current user payload' }, 401: { description: 'Missing or invalid token' } },
        },
      },
      '/api/admin/summary': {
        get: {
          summary: 'Admin-only summary',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Admin content' }, 403: { description: 'Forbidden' } },
        },
      },
      '/api/posts': {
        get: {
          summary: 'Public list of posts',
          responses: {
            200: {
              description: 'List posts',
              content: { 'application/json': { schema: { type: 'object', properties: { posts: { type: 'array', items: { $ref: '#/components/schemas/Post' } } } } } },
            },
          },
        },
      },
      '/api/admin/posts': {
        get: {
          summary: 'List posts (admin)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'List posts' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
        },
        post: {
          summary: 'Create post (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    body: { type: 'string' },
                  },
                  required: ['title'],
                },
              },
            },
          },
          responses: { 201: { description: 'Post created' }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' }, 403: { description: 'Forbidden' } },
        },
      },
      '/api/admin/posts/{id}': {
        put: {
          summary: 'Update post (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    body: { type: 'string' },
                  },
                  required: ['title'],
                },
              },
            },
          },
          responses: {
            200: { description: 'Post updated' },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Post not found' },
          },
        },
        delete: {
          summary: 'Delete post (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Deleted' },
            401: { description: 'Unauthorized' },
            403: { description: 'Forbidden' },
            404: { description: 'Post not found' },
          },
        },
      },
    },
  },
  apis: [],
})

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec))

// Mongo connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-demo'
mongoose.connect(mongoUri, { autoIndex: true }).then(() => {
  console.log('Connected to MongoDB')
}).catch((error) => {
  console.error('Mongo connection error:', error.message)
  process.exit(1)
})

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

const Post = mongoose.model('Post', postSchema)

// Helpers
const buildToken = (user) => {
  const payload = { sub: user._id.toString(), role: user.role, email: user.email }
  return jwt.sign(payload, jwtSecret, { expiresIn: '2h' })
}

const auth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })
  try {
    req.user = jwt.verify(token, jwtSecret)
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' })
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, inviteCode } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    let assignedRole = 'user'
    if (role === 'admin') {
      if (inviteCode !== adminInviteCode) {
        return res.status(403).json({ error: 'Invalid admin invite code' })
      }
      assignedRole = 'admin'
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role: assignedRole })
    const token = buildToken(user)

    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      redirect: user.role === 'admin' ? '/admin' : '/home'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = buildToken(user)
    return res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      redirect: user.role === 'admin' ? '/admin' : '/home'
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Server error' })
  }
})

app.get('/api/auth/me', auth, (req, res) => {
  return res.json({ user: req.user })
})

app.get('/api/admin/summary', auth, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin content', email: req.user.email })
})

// Public/read-only posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 })
    res.json({ posts })
  } catch (error) {
    console.error('List public posts error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin posts CRUD
app.get('/api/admin/posts', auth, requireRole('admin'), async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 })
    res.json({ posts })
  } catch (error) {
    console.error('List posts error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/admin/posts', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, body } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })
    const post = await Post.create({ title, body: body || '', author: req.user.sub })
    res.status(201).json({ post })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.put('/api/admin/posts/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, body } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, body: body || '' },
      { new: true }
    )
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json({ post })
  } catch (error) {
    console.error('Update post error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/api/admin/posts/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found' })
    res.json({ message: 'Deleted', id: req.params.id })
  } catch (error) {
    console.error('Delete post error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.get('/', (req, res) => {
  res.send('Backend service is running')
})

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
