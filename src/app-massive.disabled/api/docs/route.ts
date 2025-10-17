import { NextRequest, NextResponse } from 'next/server'

const API_DOCS = {
  openapi: '3.0.0',
  info: {
    title: 'VibeLux API',
    version: '1.0.0',
    description: 'Smart lighting and energy management platform API',
    contact: {
      name: 'VibeLux Support',
      email: 'support@vibelux.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message'
          },
          code: {
            type: 'string',
            description: 'Error code'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          subscriptionTier: { type: 'string', enum: ['free', 'startup', 'professional', 'enterprise'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Facility: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          location: { type: 'string' },
          size: { type: 'number' },
          type: { type: 'string' },
          energyUsage: { type: 'number' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      TeamInvite: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['admin', 'manager', 'operator', 'viewer'] },
          facilityId: { type: 'string' },
          message: { type: 'string', nullable: true }
        },
        required: ['email', 'role', 'facilityId']
      },
      HealthCheck: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok', 'degraded', 'error'] },
          timestamp: { type: 'string', format: 'date-time' },
          services: {
            type: 'object',
            properties: {
              database: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  responseTime: { type: 'number' },
                  error: { type: 'string', nullable: true }
                }
              },
              redis: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  responseTime: { type: 'number' },
                  error: { type: 'string', nullable: true }
                }
              },
              email: {
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  error: { type: 'string', nullable: true }
                }
              }
            }
          },
          uptime: { type: 'number' },
          environment: { type: 'string' },
          version: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Get system health status',
        description: 'Returns comprehensive health check information for all system components',
        responses: {
          '200': {
            description: 'System is healthy or degraded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthCheck' }
              }
            }
          },
          '503': {
            description: 'System is experiencing errors',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthCheck' }
              }
            }
          }
        }
      },
      head: {
        tags: ['System'],
        summary: 'Lightweight health check',
        description: 'Quick health check for load balancers',
        responses: {
          '200': { description: 'System is healthy' },
          '503': { description: 'System is unhealthy' }
        }
      }
    },
    '/api/ready': {
      get: {
        tags: ['System'],
        summary: 'Get readiness status',
        description: 'Returns readiness check for Kubernetes deployments',
        responses: {
          '200': {
            description: 'System is ready',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ready: { type: 'boolean' },
                    timestamp: { type: 'string', format: 'date-time' },
                    checks: {
                      type: 'object',
                      properties: {
                        database: { type: 'boolean' },
                        redis: { type: 'boolean' },
                        migrations: { type: 'boolean' }
                      }
                    },
                    errors: {
                      type: 'array',
                      items: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          '503': { description: 'System is not ready' }
        }
      }
    },
    '/api/team/invite': {
      post: {
        tags: ['Team'],
        summary: 'Send team invitation',
        description: 'Invite a user to join a facility team',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TeamInvite' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Invitation sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    inviteId: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          },
          '429': {
            description: 'Rate limit exceeded',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' }
              }
            }
          }
        }
      }
    },
    '/api/user/export': {
      get: {
        tags: ['User'],
        summary: 'Export user data',
        description: 'Export all user data for GDPR compliance',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User data exported successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    facilities: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Facility' }
                    },
                    exportDate: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '429': { description: 'Rate limit exceeded' }
        }
      }
    },
    '/api/user/delete': {
      delete: {
        tags: ['User'],
        summary: 'Delete user account',
        description: 'Permanently delete user account and all associated data',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  confirmation: { type: 'string', enum: ['DELETE_MY_ACCOUNT'] }
                },
                required: ['confirmation']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Account deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid confirmation' },
          '401': { description: 'Unauthorized' },
          '429': { description: 'Rate limit exceeded' }
        }
      }
    },
    '/api/monitoring': {
      get: {
        tags: ['Monitoring'],
        summary: 'Get monitoring data',
        description: 'Get system monitoring and metrics data (admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'timeRange',
            in: 'query',
            description: 'Time range in milliseconds',
            schema: { type: 'integer', default: 3600000 }
          },
          {
            name: 'alerts',
            in: 'query',
            description: 'Include alert data',
            schema: { type: 'boolean', default: false }
          }
        ],
        responses: {
          '200': {
            description: 'Monitoring data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    timestamp: { type: 'string', format: 'date-time' },
                    systemHealth: { type: 'object' },
                    cacheStats: { type: 'object' },
                    metrics: { type: 'object' },
                    alerts: { type: 'array' },
                    alertRules: { type: 'array' }
                  }
                }
              }
            }
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden - Admin access required' }
        }
      }
    }
  },
  tags: [
    {
      name: 'System',
      description: 'System health and status endpoints'
    },
    {
      name: 'Team',
      description: 'Team management endpoints'
    },
    {
      name: 'User',
      description: 'User management and privacy endpoints'
    },
    {
      name: 'Monitoring',
      description: 'System monitoring and metrics endpoints'
    }
  ]
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format')

  // Return OpenAPI spec in JSON format
  if (format === 'json') {
    return NextResponse.json(API_DOCS, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  // Return Swagger UI HTML
  const swaggerHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>VibeLux API Documentation</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin:0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              spec: ${JSON.stringify(API_DOCS)},
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout",
              tryItOutEnabled: true,
              requestInterceptor: function(request) {
                // Add authentication header if available
                const token = localStorage.getItem('auth_token');
                if (token) {
                  request.headers.Authorization = 'Bearer ' + token;
                }
                return request;
              }
            });
          };
        </script>
      </body>
    </html>
  `

  return new NextResponse(swaggerHTML, {
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}