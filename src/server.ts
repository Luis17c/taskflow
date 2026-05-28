
import dotenv from 'dotenv'
dotenv.config()

import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'

import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { workspaceRoutes } from './routes/workspaces'
import { boardRoutes } from './routes/boards'
import { columnRoutes } from './routes/columns'
import { cardRoutes } from './routes/cards'


const app = Fastify()

app.register(cors)

app.register(swagger, {
  openapi: {
    info: {
      title: 'Kanbam API',
      description: 'Kanbam Project Management API',
      version: '1.0.0'
    },

    servers: [
      {
        url: `http://localhost:${+(process.env?.PORT ?? '10000')}`
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
})

app.register(swaggerUI, {
  routePrefix: '/docs'
})

app.register(jwt, {
  secret: 'supersecret'
})

app.register(authRoutes)
app.register(userRoutes)
app.register(workspaceRoutes)
app.register(boardRoutes)
app.register(columnRoutes)
app.register(cardRoutes)

app.listen({
  port: +(process.env?.PORT ?? '10000')
}).then(() => {
  console.log('HTTP Server Running')
})