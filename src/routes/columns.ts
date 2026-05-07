import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

export async function columnRoutes(app: FastifyInstance) {
  app.post(
    '/columns',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Columns'],

        summary: 'Create column',

        description: 'Create a new board column',

        security: [
          {
            bearerAuth: []
          }
        ],

        body: {
          type: 'object',

          required: ['name', 'boardId', 'order'],

          properties: {
            name: {
              type: 'string',
              examples: ['In Progress']
            },

            boardId: {
              type: 'string',
              examples: ['clx123456']
            },

            order: {
              type: 'number',
              examples: [1]
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

              order: {
                type: 'number'
              },

              boardId: {
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
        boardId: string
        order: number
      }

      return prisma.column.create({
        data: body
      })
    }
  )

  app.get(
    '/columns/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Columns'],

        summary: 'Get column by id',

        description: 'Returns column details with cards',

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

              order: {
                type: 'number'
              },

              cards: {
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

      return prisma.column.findUnique({
        where: { id },

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
      })
    }
  )

  app.put(
    '/columns/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Columns'],

        summary: 'Update column',

        description: 'Update column data',

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
              examples: ['Done']
            },

            order: {
              type: 'number',
              examples: [3]
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

              order: {
                type: 'number'
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
        order?: number
      }

      return prisma.column.update({
        where: { id },

        data: body
      })
    }
  )

  app.patch(
    '/columns/:id/reorder',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Columns'],

        summary: 'Reorder column',

        description: 'Change column order position',

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

          required: ['order'],

          properties: {
            order: {
              type: 'number',
              examples: [2]
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
        order: number
      }

      return prisma.column.update({
        where: { id },

        data: {
          order: body.order
        }
      })
    }
  )

  app.delete(
    '/columns/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Columns'],

        summary: 'Delete column',

        description: 'Delete board column',

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

      await prisma.column.delete({
        where: { id }
      })

      return {
        ok: true
      }
    }
  )
}