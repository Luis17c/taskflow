import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

export async function cardRoutes(app: FastifyInstance) {
  app.post(
    '/cards',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Cards'],

        summary: 'Create card',

        description: 'Create a new kanban card',

        security: [
          {
            bearerAuth: []
          }
        ],

        body: {
          type: 'object',

          required: ['title', 'columnId'],

          properties: {
            title: {
              type: 'string',
              examples: ['Fix login bug']
            },

            description: {
              type: 'string',
              examples: ['JWT token expiring incorrectly']
            },

            priority: {
              type: 'string',

              enum: ['LOW', 'MEDIUM', 'HIGH'],

              examples: ['HIGH']
            },

            columnId: {
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

              title: {
                type: 'string'
              },

              priority: {
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
        title: string
        description?: string
        priority?: 'LOW' | 'MEDIUM' | 'HIGH'
        columnId: string
      }

      return prisma.card.create({
        data: body
      })
    }
  )

  app.get(
    '/cards',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Cards'],

        summary: 'List cards',

        description: 'Returns all cards',

        security: [
          {
            bearerAuth: []
          }
        ],

        querystring: {
          type: 'object',

          properties: {
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH']
            },

            assigneeId: {
              type: 'string'
            },

            columnId: {
              type: 'string'
            }
          }
        }
      }
    },

    async (request) => {
      const query = request.query as {
        priority?: 'LOW' | 'MEDIUM' | 'HIGH'
        assigneeId?: string
        columnId?: string
      }

      return prisma.card.findMany({
        where: {
          priority: query.priority,
          assigneeId: query.assigneeId,
          columnId: query.columnId
        },

        include: {
          assignee: true,

          column: true,

          comments: true,

          labels: {
            include: {
              label: true
            }
          }
        }
      })
    }
  )

  app.get(
    '/cards/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Cards'],

        summary: 'Get card by id',

        description: 'Returns full card details',

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
        }
      }
    },

    async (request) => {
      const { id } = request.params as {
        id: string
      }

      return prisma.card.findUnique({
        where: { id },

        include: {
          assignee: true,

          comments: {
            include: {
              user: true
            }
          },

          attachments: true,

          labels: {
            include: {
              label: true
            }
          },

          activities: true
        }
      })
    }
  )

  app.put(
    '/cards/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Cards'],

        summary: 'Update card',

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
            title: {
              type: 'string'
            },

            description: {
              type: 'string'
            },

            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH']
            },

            dueDate: {
              type: 'string',
              examples: ['2026-05-10T10:00:00.000Z']
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
        title?: string
        description?: string
        priority?: 'LOW' | 'MEDIUM' | 'HIGH'
        dueDate?: string
      }

      const data: any = {
        ...body
      }

      if (body.dueDate) {
        data.dueDate = new Date(body.dueDate)
      }

      return prisma.card.update({
        where: { id },

        data
      })
    }
  )

  app.patch(
    '/cards/:id/move',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Cards'],

        summary: 'Move card',

        description: 'Move card to another column',

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

          required: ['columnId'],

          properties: {
            columnId: {
              type: 'string'
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
        columnId: string
      }

      return prisma.card.update({
        where: { id },

        data: {
          columnId: body.columnId
        }
      })
    }
  )

  app.patch(
    '/cards/:id/assign',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Cards'],

        summary: 'Assign card',

        description: 'Assign card to user',

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

          required: ['assigneeId'],

          properties: {
            assigneeId: {
              type: 'string'
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
        assigneeId: string
      }

      return prisma.card.update({
        where: { id },

        data: {
          assigneeId: body.assigneeId
        }
      })
    }
  )

  app.delete(
    '/cards/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Cards'],

        summary: 'Delete card',

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
        }
      }
    },

    async (request) => {
      const { id } = request.params as {
        id: string
      }

      await prisma.card.delete({
        where: { id }
      })

      return {
        ok: true
      }
    }
  )
}