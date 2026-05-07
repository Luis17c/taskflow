import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

export async function boardRoutes(app: FastifyInstance) {
  app.post(
    '/boards',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Boards'],

        summary: 'Create board',

        description: 'Create a new board inside workspace',

        security: [
          {
            bearerAuth: []
          }
        ],

        body: {
          type: 'object',

          required: ['name', 'workspaceId'],

          properties: {
            name: {
              type: 'string',
              examples: ['Backend Tasks']
            },

            workspaceId: {
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

              workspaceId: {
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
      const body = request.body as {
        name: string
        workspaceId: string
      }

      return prisma.board.create({
        data: {
          name: body.name,
          workspaceId: body.workspaceId
        }
      })
    }
  )

  app.get(
    '/boards',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Boards'],

        summary: 'List boards',

        description: 'List all boards',

        security: [
          {
            bearerAuth: []
          }
        ],

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

                createdAt: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },

    async () => {
      return prisma.board.findMany({
        include: {
          workspace: true,
          columns: true
        }
      })
    }
  )

  app.get(
    '/boards/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Boards'],

        summary: 'Get board by id',

        description: 'Returns board details with columns and cards',

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

              columns: {
                type: 'array'
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

      return prisma.board.findUnique({
        where: { id },

        include: {
          columns: {
            include: {
              cards: {
                include: {
                  assignee: true,

                  labels: {
                    include: {
                      label: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    }
  )

  app.put(
    '/boards/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Boards'],

        summary: 'Update board',

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

          required: ['name'],

          properties: {
            name: {
              type: 'string',
              examples: ['Updated Board']
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
        name: string
      }

      return prisma.board.update({
        where: { id },

        data: {
          name: body.name
        }
      })
    }
  )

  app.delete(
    '/boards/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Boards'],

        summary: 'Delete board',

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

      await prisma.board.delete({
        where: { id }
      })

      return {
        ok: true
      }
    }
  )
}