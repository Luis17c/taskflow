import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middlewares/auth'

export async function workspaceRoutes(app: FastifyInstance) {
  app.post(
    '/workspaces',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Workspaces'],

        summary: 'Create workspace',

        description: 'Create a new workspace',

        security: [
          {
            bearerAuth: []
          }
        ],

        body: {
          type: 'object',

          required: ['name'],

          properties: {
            name: {
              type: 'string',
              examples: ['Engineering Team']
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

              createdAt: {
                type: 'string'
              }
            }
          }
        }
      }
    },

    async (request: any) => {
      const body = request.body as {
        name: string
      }

      const userId = request.user.sub

      const workspace = await prisma.workspace.create({
        data: {
          name: body.name,

          members: {
            create: {
              userId,
              role: 'OWNER'
            }
          }
        },

        include: {
          members: true
        }
      })

      return workspace
    }
  )

  app.get(
    '/workspaces',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Workspaces'],

        summary: 'List workspaces',

        description: 'Returns user workspaces',

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

    async (request: any) => {
      const userId = request.user.sub

      return prisma.workspace.findMany({
        where: {
          members: {
            some: {
              userId
            }
          }
        },

        include: {
          members: {
            include: {
              user: true
            }
          }
        }
      })
    }
  )

  app.get(
    '/workspaces/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Workspaces'],

        summary: 'Get workspace by id',

        description: 'Returns workspace details',

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

      return prisma.workspace.findUnique({
        where: { id },

        include: {
          members: {
            include: {
              user: true
            }
          },

          boards: true
        }
      })
    }
  )

  app.put(
    '/workspaces/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Workspaces'],

        summary: 'Update workspace',

        description: 'Update workspace information',

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
              examples: ['Updated Workspace']
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

      return prisma.workspace.update({
        where: { id },

        data: {
          name: body.name
        }
      })
    }
  )

  app.delete(
    '/workspaces/:id',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Workspaces'],

        summary: 'Delete workspace',

        description: 'Delete workspace',

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

      await prisma.workspace.delete({
        where: { id }
      })

      return {
        ok: true
      }
    }
  )

  app.post(
    '/workspaces/:id/members',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Workspace Members'],

        summary: 'Add workspace member',

        description: 'Add new member to workspace',

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

          required: ['userId', 'role'],

          properties: {
            userId: {
              type: 'string'
            },

            role: {
              type: 'string',

              enum: ['ADMIN', 'MEMBER'],

              examples: ['MEMBER']
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
        userId: string
        role: 'ADMIN' | 'MEMBER'
      }

      return prisma.workspaceMember.create({
        data: {
          workspaceId: id,
          userId: body.userId,
          role: body.role
        }
      })
    }
  )

  app.get(
    '/workspaces/:id/members',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Workspace Members'],

        summary: 'List workspace members',

        description: 'Returns all workspace members',

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

      return prisma.workspaceMember.findMany({
        where: {
          workspaceId: id
        },

        include: {
          user: true
        }
      })
    }
  )

  app.delete(
    '/workspaces/:id/members/:memberId',
    {
      preHandler: [authMiddleware],

      schema: {
        tags: ['Workspace Members'],

        summary: 'Remove workspace member',

        description: 'Remove member from workspace',

        security: [
          {
            bearerAuth: []
          }
        ],

        params: {
          type: 'object',

          required: ['id', 'memberId'],

          properties: {
            id: {
              type: 'string'
            },

            memberId: {
              type: 'string'
            }
          }
        }
      }
    },

    async (request) => {
      const { memberId } = request.params as {
        id: string
        memberId: string
      }

      await prisma.workspaceMember.delete({
        where: {
          id: memberId
        }
      })

      return {
        ok: true
      }
    }
  )
}