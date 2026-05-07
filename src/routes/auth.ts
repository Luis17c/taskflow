import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/auth/register',
    {
      schema: {
        tags: ['Auth'],

        summary: 'Register new user',

        description: 'Creates a new user account',

        body: {
          type: 'object',

          required: ['name', 'email', 'password'],

          properties: {
            name: {
              type: 'string',
              examples: ['John Doe']
            },

            email: {
              type: 'string',
              examples: ['john@test.com']
            },

            password: {
              type: 'string',
              examples: ['123456']
            }
          }
        },

        response: {
          201: {
            type: 'object',

            properties: {
              id: {
                type: 'string'
              },

              name: {
                type: 'string'
              },

              email: {
                type: 'string'
              },

              createdAt: {
                type: 'string'
              }
            }
          },

          400: {
            type: 'object',

            properties: {
              message: {
                type: 'string'
              }
            }
          }
        }
      }
    },

    async (request, reply) => {
      const body = request.body as {
        name: string
        email: string
        password: string
      }

      const userExists = await prisma.user.findUnique({
        where: {
          email: body.email
        }
      })

      if (userExists) {
        return reply.status(400).send({
          message: 'User already exists'
        })
      }

      const passwordHash = await bcrypt.hash(body.password, 6)

      const user = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: passwordHash
        }
      })

      return reply.status(201).send({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      })
    }
  )

  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],

        summary: 'Authenticate user',

        description: 'Authenticate user and return JWT token',

        body: {
          type: 'object',

          required: ['email', 'password'],

          properties: {
            email: {
              type: 'string',
              examples: ['john@test.com']
            },

            password: {
              type: 'string',
              examples: ['123456']
            }
          }
        },

        response: {
          200: {
            type: 'object',

            properties: {
              token: {
                type: 'string'
              }
            }
          },

          400: {
            type: 'object',

            properties: {
              message: {
                type: 'string'
              }
            }
          }
        }
      }
    },

    async (request, reply) => {
      const body = request.body as {
        email: string
        password: string
      }

      const user = await prisma.user.findUnique({
        where: {
          email: body.email
        }
      })

      if (!user) {
        return reply.status(400).send({
          message: 'Invalid credentials'
        })
      }

      const passwordMatch = await bcrypt.compare(
        body.password,
        user.password
      )

      if (!passwordMatch) {
        return reply.status(400).send({
          message: 'Invalid credentials'
        })
      }

      const token = await reply.jwtSign({
        sub: user.id
      })

      return {
        token
      }
    }
  )
}