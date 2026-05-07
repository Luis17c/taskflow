import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

export async function userRoutes(app: FastifyInstance) {
  app.get(
    '/users',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Users'],

        summary: 'List users',

        description: 'Returns all users',

        security: [
          {
            bearerAuth: []
          }
        ],

        querystring: {
          type: 'object',

          properties: {
            search: {
              type: 'string',
              examples: ['john']
            }
          }
        },

        response: {
          200: {
            type: 'array',

            items: {
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

                avatar: {
                  type: 'string'
                },

                createdAt: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },

    async (request) => {
      const query = request.query as {
        search?: string
      }

      return prisma.user.findMany({
        where: query.search
          ? {
              OR: [
                {
                  name: {
                    contains: query.search,
                    mode: 'insensitive'
                  }
                },

                {
                  email: {
                    contains: query.search,
                    mode: 'insensitive'
                  }
                }
              ]
            }
          : undefined,

        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true
        }
      })
    }
  )

  app.get(
    '/users/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Users'],

        summary: 'Get user by id',

        description: 'Returns user details',

        security: [
          {
            bearerAuth: []
          }
        ],

        params: {
          type: 'object',

          required: ['id'],

          properties: {
            id: {
              type: 'string',
              examples: ['clx123456']
            }
          }
        },

        response: {
          200: {
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

              avatar: {
                type: 'string'
              },

              createdAt: {
                type: 'string'
              }
            }
          }
        }
      }
    },

    async (request) => {
      const { id } = request.params as {
        id: string
      }

      return prisma.user.findUnique({
        where: { id },

        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
          workspaces: true,
          cards: true
        }
      })
    }
  )

  app.put(
    '/users/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Users'],

        summary: 'Update user',

        description: 'Update user information',

        security: [
          {
            bearerAuth: []
          }
        ],

        params: {
          type: 'object',

          required: ['id'],

          properties: {
            id: {
              type: 'string'
            }
          }
        },

        body: {
          type: 'object',

          properties: {
            name: {
              type: 'string',
              examples: ['John Updated']
            },

            avatar: {
              type: 'string',
              examples: ['https://cdn.test/avatar.png']
            }
          }
        },

        response: {
          200: {
            type: 'object',

            properties: {
              id: {
                type: 'string'
              },

              name: {
                type: 'string'
              },

              avatar: {
                type: 'string'
              }
            }
          }
        }
      }
    },

    async (request) => {
      const { id } = request.params as {
        id: string
      }

      const body = request.body as {
        name?: string
        avatar?: string
      }

      return prisma.user.update({
        where: { id },

        data: body,

        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      })
    }
  )

  app.delete(
    '/users/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Users'],

        summary: 'Delete user',

        description: 'Delete user account',

        security: [
          {
            bearerAuth: []
          }
        ],

        params: {
          type: 'object',

          required: ['id'],

          properties: {
            id: {
              type: 'string'
            }
          }
        },

        response: {
          200: {
            type: 'object',

            properties: {
              ok: {
                type: 'boolean'
              }
            }
          }
        }
      }
    },

    async (request) => {
      const { id } = request.params as {
        id: string
      }

      await prisma.user.delete({
        where: { id }
      })

      return {
        ok: true
      }
    }
  )
}