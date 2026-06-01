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

const app = Fastify({
  logger: true
})

async function bootstrap() {
  try {
    await app.register(cors, {
      origin: true,
      methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS'
      ],
      allowedHeaders: [
        'Authorization',
        'Content-Type'
      ]
    })

    await app.register(swagger, {
      openapi: {
        info: {
          title: 'Kanbam API',
          description: 'Kanbam Project Management API',
          version: '1.0.0'
        },

        servers: [
          {
            url:
              process.env.RENDER_EXTERNAL_URL ||
              `http://localhost:${+(process.env?.PORT ?? '10000')}`
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

    await app.register(swaggerUI, {
      routePrefix: '/docs'
    })

    await app.register(jwt, {
      secret: process.env.JWT_SECRET || 'supersecret'
    })

    await app.register(authRoutes)
    await app.register(userRoutes)
    await app.register(workspaceRoutes)
    await app.register(boardRoutes)
    await app.register(columnRoutes)
    await app.register(cardRoutes)

    const port = +(process.env?.PORT ?? '10000')

    await app.listen({
      port,
      host: '0.0.0.0'
    })

    console.log(`HTTP Server Running on port ${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

bootstrap()