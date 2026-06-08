import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

export async function sprintRoutes(app: FastifyInstance) {
  app.post(
    '/boards/:boardId/sprints',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Sprints'],

        summary: 'Create sprint',

        description: 'Create a new sprint inside a board',

        security: [
          {
            bearerAuth: []
          }
        ],

        params: {
          type: 'object',

          required: ['boardId'],

          properties: {
            boardId: {
              type: 'string',
              examples: ['clx123456']
            }
          }
        },

        body: {
          type: 'object',

          required: ['name', 'startDate', 'endDate'],

          properties: {
            name: {
              type: 'string',
              examples: ['Sprint 1']
            },

            goal: {
              type: 'string',
              examples: ['Ship authentication flow']
            },

            startDate: {
              type: 'string',
              examples: ['2026-06-09T00:00:00.000Z']
            },

            endDate: {
              type: 'string',
              examples: ['2026-06-23T00:00:00.000Z']
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

              status: {
                type: 'string'
              },

              boardId: {
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
      const { boardId } = request.params as {
        boardId: string
      }

      const body = request.body as {
        name: string
        goal?: string
        startDate: string
        endDate: string
      }

      return prisma.sprint.create({
        data: {
          name: body.name,
          goal: body.goal,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          boardId
        }
      })
    }
  )

  app.get(
    '/boards/:boardId/sprints',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Sprints'],

        summary: 'List sprints',

        description: 'List all sprints of a board',

        security: [
          {
            bearerAuth: []
          }
        ],

        params: {
          type: 'object',

          required: ['boardId'],

          properties: {
            boardId: {
              type: 'string'
            }
          }
        }
      }
    },

    async (request) => {
      const { boardId } = request.params as {
        boardId: string
      }

      return prisma.sprint.findMany({
        where: { boardId },

        orderBy: {
          startDate: 'asc'
        },

        include: {
          cards: true
        }
      })
    }
  )

  app.get(
    '/sprints/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Sprints'],

        summary: 'Get sprint by id',

        description: 'Returns sprint details with cards',

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

      return prisma.sprint.findUnique({
        where: { id },

        include: {
          cards: {
            include: {
              assignee: true,

              column: true,

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
    '/sprints/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Sprints'],

        summary: 'Update sprint',

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
              type: 'string'
            },

            goal: {
              type: 'string'
            },

            startDate: {
              type: 'string'
            },

            endDate: {
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
        name?: string
        goal?: string
        startDate?: string
        endDate?: string
      }

      const data: any = {
        ...body
      }

      if (body.startDate) {
        data.startDate = new Date(body.startDate)
      }

      if (body.endDate) {
        data.endDate = new Date(body.endDate)
      }

      return prisma.sprint.update({
        where: { id },

        data
      })
    }
  )

  app.patch(
    '/sprints/:id/start',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Sprints'],

        summary: 'Start sprint',

        description: 'Activate a sprint. Only one ACTIVE sprint per board is allowed',

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

    async (request, reply) => {
      const { id } = request.params as {
        id: string
      }

      const sprint = await prisma.sprint.findUnique({
        where: { id }
      })

      if (!sprint) {
        return reply.code(404).send({
          message: 'Sprint not found'
        })
      }

      const activeSprint = await prisma.sprint.findFirst({
        where: {
          boardId: sprint.boardId,
          status: 'ACTIVE',
          id: {
            not: id
          }
        }
      })

      if (activeSprint) {
        return reply.code(409).send({
          message: 'This board already has an active sprint'
        })
      }

      return prisma.sprint.update({
        where: { id },

        data: {
          status: 'ACTIVE'
        }
      })
    }
  )

  app.patch(
    '/sprints/:id/complete',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Sprints'],

        summary: 'Complete sprint',

        description:
          'Complete a sprint. Cards not in the done column (last column by order) return to the backlog',

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

    async (request, reply) => {
      const { id } = request.params as {
        id: string
      }

      const sprint = await prisma.sprint.findUnique({
        where: { id }
      })

      if (!sprint) {
        return reply.code(404).send({
          message: 'Sprint not found'
        })
      }

      // "Done" = last column of the board (highest order)
      const doneColumn = await prisma.column.findFirst({
        where: {
          boardId: sprint.boardId
        },

        orderBy: {
          order: 'desc'
        }
      })

      // Unfinished cards of this sprint go back to the backlog (sprintId = null)
      await prisma.card.updateMany({
        where: {
          sprintId: id,

          columnId: doneColumn
            ? {
                not: doneColumn.id
              }
            : undefined
        },

        data: {
          sprintId: null
        }
      })

      return prisma.sprint.update({
        where: { id },

        data: {
          status: 'COMPLETED'
        }
      })
    }
  )

  app.delete(
    '/sprints/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Sprints'],

        summary: 'Delete sprint',

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

      // Detach cards so deleting a sprint sends them back to the backlog
      await prisma.card.updateMany({
        where: { sprintId: id },

        data: {
          sprintId: null
        }
      })

      await prisma.sprint.delete({
        where: { id }
      })

      return {
        ok: true
      }
    }
  )
}
