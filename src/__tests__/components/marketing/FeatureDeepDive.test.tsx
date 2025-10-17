/**
 * FeatureDeepDive Component Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import FeatureDeepDive from '@/components/marketing/FeatureDeepDive'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, whileInView, whileHover, whileTap, transition, ...props }: any) => 
      <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, onClick, ...props }: any) => 
      <button onClick={onClick} {...props}>{children}</button>
  }
}))

describe('FeatureDeepDive', () => {
  it('should render with default state', () => {
    render(<FeatureDeepDive />)
    
    expect(screen.getByText('Deep Dive: How Our Technology Works')).toBeInTheDocument()
    expect(screen.getByText(/Select any feature below/)).toBeInTheDocument()
    expect(screen.getByText('Select a Feature')).toBeInTheDocument()
    
    // Should show all 4 features
    expect(screen.getByText('Energy Optimization System')).toBeInTheDocument()
    expect(screen.getByText('AI-Powered Lighting Design')).toBeInTheDocument()
    expect(screen.getByText('Predictive Analytics Engine')).toBeInTheDocument()
    expect(screen.getByText('Revenue Sharing Platform')).toBeInTheDocument()
  })

  it('should display first feature by default', () => {
    render(<FeatureDeepDive />)
    
    // Energy Optimization should be selected by default
    expect(screen.getByText('AI-powered energy management that reduces costs by 20-50%')).toBeInTheDocument()
    
    // Should show feature details
    expect(screen.getByText(/Our energy optimization system uses machine learning/)).toBeInTheDocument()
    
    // Should show "How It Works" tab as active
    expect(screen.getByRole('button', { name: 'How It Works' })).toHaveClass('bg-purple-600')
  })

  it('should switch features when clicked', () => {
    render(<FeatureDeepDive />)
    
    // Click on AI-Powered Lighting Design
    const aiDesignButton = screen.getByText('AI-Powered Lighting Design')
    fireEvent.click(aiDesignButton)
    
    // Should show AI design content
    expect(screen.getByText(/Using Claude 4 Sonnet and proprietary algorithms/)).toBeInTheDocument()
  })

  it('should switch tabs correctly', () => {
    render(<FeatureDeepDive />)
    
    // Click on Specifications tab
    const specsTab = screen.getByRole('button', { name: 'Specifications' })
    fireEvent.click(specsTab)
    
    // Should show specifications
    expect(screen.getByText('Savings Range')).toBeInTheDocument()
    expect(screen.getByText('20-50%')).toBeInTheDocument()
    expect(screen.getByText('ROI Period')).toBeInTheDocument()
    expect(screen.getByText('3-6 months')).toBeInTheDocument()
    
    // Specs tab should be active
    expect(specsTab).toHaveClass('bg-purple-600')
  })

  it('should show benefits when Benefits tab is clicked', () => {
    render(<FeatureDeepDive />)
    
    // Click on Benefits tab
    const benefitsTab = screen.getByRole('button', { name: 'Benefits' })
    fireEvent.click(benefitsTab)
    
    // Should show benefits
    expect(screen.getByText('Reduce energy costs by up to 50%')).toBeInTheDocument()
    expect(screen.getByText('Participate in demand response programs')).toBeInTheDocument()
    expect(screen.getByText('Prevent peak demand charges')).toBeInTheDocument()
  })

  it('should show correct How It Works steps for each feature', () => {
    render(<FeatureDeepDive />)
    
    // Energy Optimization steps
    expect(screen.getByText('Data Collection')).toBeInTheDocument()
    expect(screen.getByText('Pattern Analysis')).toBeInTheDocument()
    expect(screen.getByText('Optimization Engine')).toBeInTheDocument()
    expect(screen.getByText('Automated Control')).toBeInTheDocument()
    
    // Switch to AI Design
    fireEvent.click(screen.getByText('AI-Powered Lighting Design'))
    
    // AI Design steps
    expect(screen.getByText('Natural Language Input')).toBeInTheDocument()
    expect(screen.getByText('Space Analysis')).toBeInTheDocument()
    expect(screen.getByText('Fixture Selection')).toBeInTheDocument()
    expect(screen.getByText('Layout Generation')).toBeInTheDocument()
  })

  it('should display technical details for How It Works steps', () => {
    render(<FeatureDeepDive />)
    
    // Should show technical info
    expect(screen.getByText(/Polling frequency: 1-minute intervals/)).toBeInTheDocument()
    expect(screen.getByText(/Uses LSTM neural networks/)).toBeInTheDocument()
    expect(screen.getByText(/Linear programming solver/)).toBeInTheDocument()
  })

  it('should show different specifications for each feature', () => {
    render(<FeatureDeepDive />)
    
    // Click on Specifications tab
    fireEvent.click(screen.getByRole('button', { name: 'Specifications' }))
    
    // Energy Optimization specs
    expect(screen.getByText('10ms latency')).toBeInTheDocument()
    
    // Switch to AI Design
    fireEvent.click(screen.getByText('AI-Powered Lighting Design'))
    
    // AI Design specs
    expect(screen.getByText('Design Time')).toBeInTheDocument()
    expect(screen.getByText('10-30 seconds')).toBeInTheDocument()
    expect(screen.getByText('Claude 4')).toBeInTheDocument()
  })

  it('should display CTA section for each feature', () => {
    render(<FeatureDeepDive />)
    
    expect(screen.getByText('Ready to implement this feature?')).toBeInTheDocument()
    expect(screen.getByText('Get started with a free consultation')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Learn More/ })).toBeInTheDocument()
  })

  it('should apply correct styling to selected feature', () => {
    render(<FeatureDeepDive />)
    
    const energyOptButton = screen.getByText('Energy Optimization System').closest('button')
    const aiDesignButton = screen.getByText('AI-Powered Lighting Design').closest('button')
    
    // Energy Optimization should be selected by default
    expect(energyOptButton).toHaveClass('bg-gradient-to-r', 'from-yellow-500', 'to-orange-500')
    expect(aiDesignButton).toHaveClass('bg-gray-800')
    
    // Click AI Design
    fireEvent.click(aiDesignButton!)
    
    // Styles should switch
    expect(aiDesignButton).toHaveClass('bg-gradient-to-r', 'from-purple-500', 'to-blue-500')
    expect(energyOptButton).toHaveClass('bg-gray-800')
  })

  it('should handle all four features correctly', () => {
    render(<FeatureDeepDive />)
    
    const features = [
      {
        name: 'Energy Optimization System',
        description: 'AI-powered energy management'
      },
      {
        name: 'AI-Powered Lighting Design',
        description: 'Conversational AI that designs'
      },
      {
        name: 'Predictive Analytics Engine',
        description: 'ML-powered predictions'
      },
      {
        name: 'Revenue Sharing Platform',
        description: 'Blockchain-secured equipment'
      }
    ]
    
    features.forEach(feature => {
      fireEvent.click(screen.getByText(feature.name))
      expect(screen.getByText(new RegExp(feature.description))).toBeInTheDocument()
    })
  })

  it('should show validation error details correctly', () => {
    render(<FeatureDeepDive />)
    
    // Switch to Predictive Analytics
    fireEvent.click(screen.getByText('Predictive Analytics Engine'))
    
    // Check for specific content
    expect(screen.getByText(/Advanced machine learning models/)).toBeInTheDocument()
    
    // Switch to Benefits tab
    fireEvent.click(screen.getByRole('button', { name: 'Benefits' }))
    
    // Should show predictive analytics benefits
    expect(screen.getByText('Prevent crop losses')).toBeInTheDocument()
    expect(screen.getByText('Optimize resource usage')).toBeInTheDocument()
  })

  it('should handle Revenue Sharing Platform correctly', () => {
    render(<FeatureDeepDive />)
    
    // Click on Revenue Sharing Platform
    fireEvent.click(screen.getByText('Revenue Sharing Platform'))
    
    // Should show blockchain content
    expect(screen.getByText(/Revolutionary platform that connects/)).toBeInTheDocument()
    
    // Click on Specifications
    fireEvent.click(screen.getByRole('button', { name: 'Specifications' }))
    
    // Should show revenue sharing specs
    expect(screen.getByText('Platform Fee')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })
})