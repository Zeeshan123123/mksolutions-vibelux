import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { logger } from '@/lib/logging/production-logger';
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const facilityId = searchParams.get('facilityId')
    const includePubic = searchParams.get('includePublic') === 'true'

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 })
    }

    // TODO: Fix customDashboard database schema
    const userDashboards: any[] = [];
    // const userDashboards = await prisma.customDashboard.findMany({
    //   where: {
    //     OR: [
    //       { createdBy: userId, facilityId },
    //       ...(includePubic ? [{ isPublic: true, facilityId }] : [])
    //     ]
    //   },
    //   orderBy: { updatedAt: 'desc' }
    // })

    // TODO: Fix dashboardTemplate database schema
    const templates: any[] = [];
    // const templates = await prisma.dashboardTemplate.findMany({
    //   where: { isActive: true },
    //   orderBy: { name: 'asc' }
    // })

    return NextResponse.json({
      success: true,
      dashboards: userDashboards.map(dashboard => ({
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description,
        isPublic: dashboard.isPublic,
        widgets: dashboard.config?.widgets || [],
        layout: dashboard.config?.layout || 'grid',
        createdAt: dashboard.createdAt,
        updatedAt: dashboard.updatedAt,
        createdBy: dashboard.createdBy,
        tags: dashboard.tags || []
      })),
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        widgets: template.config?.widgets || [],
        layout: template.config?.layout || 'grid',
        previewImage: template.previewImage
      }))
    })
  } catch (error) {
    logger.error('api', 'Error fetching dashboards:', error )
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, facilityId, widgets, layout, isPublic, tags } = body

    if (!name || !facilityId || !widgets) {
      return NextResponse.json(
        { error: 'Missing required fields: name, facilityId, widgets' },
        { status: 400 }
      )
    }

    // Validate widgets configuration
    const validatedWidgets = widgets.map((widget: any) => {
      if (!widget.id || !widget.type || !widget.title) {
        throw new Error('Invalid widget configuration')
      }
      return {
        id: widget.id,
        type: widget.type,
        title: widget.title,
        dataSource: widget.dataSource || 'sensor_data',
        metrics: widget.metrics || [],
        chartType: widget.chartType,
        filters: widget.filters || {},
        aggregation: widget.aggregation || 'avg',
        timeRange: widget.timeRange || '24h',
        refreshInterval: widget.refreshInterval || 300,
        size: widget.size || 'medium',
        position: widget.position || { x: 0, y: 0, w: 6, h: 4 },
        styling: widget.styling || {}
      }
    })

    // TODO: Fix customDashboard database schema
    const dashboard = {
      id: 'temp-' + Date.now(),
      name,
      description: description || '',
      facilityId,
      createdBy: userId,
      isPublic: isPublic || false,
      tags: tags || [],
      config: {
        widgets: validatedWidgets,
        layout: layout || 'grid',
        refreshInterval: 300
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    // const dashboard = await prisma.customDashboard.create({
    //   data: {
    //     name,
    //     description: description || '',
    //     facilityId,
    //     createdBy: userId,
    //     isPublic: isPublic || false,
    //     tags: tags || [],
    //     config: {
    //       widgets: validatedWidgets,
    //       layout: layout || 'grid',
    //       refreshInterval: 300
    //     }
    //   }
    // })

    return NextResponse.json({
      success: true,
      dashboard: {
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description,
        facilityId: dashboard.facilityId,
        isPublic: dashboard.isPublic,
        widgets: validatedWidgets,
        layout: layout || 'grid',
        createdAt: dashboard.createdAt,
        updatedAt: dashboard.updatedAt,
        createdBy: dashboard.createdBy,
        tags: dashboard.tags
      }
    })
  } catch (error) {
    logger.error('api', 'Error creating dashboard:', error )
    return NextResponse.json(
      { error: 'Failed to create dashboard', details: String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description, widgets, layout, isPublic, tags } = body

    if (!id) {
      return NextResponse.json({ error: 'Dashboard ID is required' }, { status: 400 })
    }

    // TODO: Fix customDashboard database schema for PATCH requests
    // const existingDashboard = await prisma.customDashboard.findUnique({
    //   where: { id }
    // })

    // if (!existingDashboard) {
    //   return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    // }

    // if (existingDashboard.createdBy !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized to edit this dashboard' }, { status: 403 })
    // }

    // Validate widgets if provided
    let validatedWidgets: any[] = []
    if (widgets) {
      validatedWidgets = widgets.map((widget: any) => {
        if (!widget.id || !widget.type || !widget.title) {
          throw new Error('Invalid widget configuration')
        }
        return {
          id: widget.id,
          type: widget.type,
          title: widget.title,
          dataSource: widget.dataSource || 'sensor_data',
          metrics: widget.metrics || [],
          chartType: widget.chartType,
          filters: widget.filters || {},
          aggregation: widget.aggregation || 'avg',
          timeRange: widget.timeRange || '24h',
          refreshInterval: widget.refreshInterval || 300,
          size: widget.size || 'medium',
          position: widget.position || { x: 0, y: 0, w: 6, h: 4 },
          styling: widget.styling || {}
        }
      })
    }

    // TODO: Fix customDashboard database schema for updates
    const updatedDashboard = {
      id,
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic }),
      ...(tags && { tags }),
      config: {
        widgets: validatedWidgets,
        layout: layout || 'grid',
        refreshInterval: 300
      },
      updatedAt: new Date()
    };
    // const updatedDashboard = await prisma.customDashboard.update({
    //   where: { id },
    //   data: {
    //     ...(name && { name }),
    //     ...(description !== undefined && { description }),
    //     ...(isPublic !== undefined && { isPublic }),
    //     ...(tags && { tags }),
    //     config: {
    //       widgets: validatedWidgets,
    //       layout: layout || existingDashboard.config?.layout || 'grid',
    //       refreshInterval: existingDashboard.config?.refreshInterval || 300
    //     },
    //     updatedAt: new Date()
    //   }
    // })

    return NextResponse.json({
      success: true,
      dashboard: {
        id: updatedDashboard.id,
        name: updatedDashboard.name,
        description: updatedDashboard.description,
        facilityId: updatedDashboard.facilityId,
        isPublic: updatedDashboard.isPublic,
        widgets: validatedWidgets,
        layout: layout || 'grid',
        createdAt: updatedDashboard.createdAt,
        updatedAt: updatedDashboard.updatedAt,
        createdBy: updatedDashboard.createdBy,
        tags: updatedDashboard.tags
      }
    })
  } catch (error) {
    logger.error('api', 'Error updating dashboard:', error )
    return NextResponse.json(
      { error: 'Failed to update dashboard', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const dashboardId = searchParams.get('id')

    if (!dashboardId) {
      return NextResponse.json({ error: 'Dashboard ID is required' }, { status: 400 })
    }

    // TODO: Fix customDashboard database schema for DELETE requests
    // const existingDashboard = await prisma.customDashboard.findUnique({
    //   where: { id: dashboardId }
    // })

    // if (!existingDashboard) {
    //   return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    // }

    // if (existingDashboard.createdBy !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized to delete this dashboard' }, { status: 403 })
    // }

    // await prisma.customDashboard.delete({
    //   where: { id: dashboardId }
    // })

    return NextResponse.json({
      success: true,
      message: 'Dashboard deleted successfully'
    })
  } catch (error) {
    logger.error('api', 'Error deleting dashboard:', error )
    return NextResponse.json(
      { error: 'Failed to delete dashboard' },
      { status: 500 }
    )
  }
}