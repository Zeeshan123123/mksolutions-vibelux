export function generateProfessionalLeasingReport(data: {
  equipment: any
  leaseOptions: any[]
  selectedOption: number | null
  comparison: any
  companyInfo?: {
    name?: string
    address?: string
    phone?: string
    email?: string
  }
}): string {
  const selectedLease = data.selectedOption !== null ? data.leaseOptions[data.selectedOption] : data.leaseOptions[1]
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Equipment Leasing Analysis - ${data.equipment.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          color: #1a1a1a;
          line-height: 1.6;
          background: white;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        
        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #7C3AED;
        }
        
        .logo-section {
          flex: 1;
        }
        
        .logo {
          font-size: 28px;
          font-weight: 700;
          color: #7C3AED;
          margin-bottom: 5px;
        }
        
        .tagline {
          font-size: 14px;
          color: #666;
        }
        
        .report-info {
          text-align: right;
          font-size: 14px;
          color: #666;
        }
        
        .report-date {
          font-weight: 600;
          color: #333;
        }
        
        /* Title Section */
        .title-section {
          text-align: center;
          margin-bottom: 40px;
        }
        
        h1 {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 18px;
          color: #666;
        }
        
        /* Equipment Card */
        .equipment-card {
          background: linear-gradient(135deg, #f8f4ff 0%, #f0e6ff 100%);
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 40px;
          border: 1px solid #e0d4f7;
        }
        
        .equipment-title {
          font-size: 24px;
          font-weight: 600;
          color: #7C3AED;
          margin-bottom: 20px;
        }
        
        .equipment-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .equipment-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .equipment-label {
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
          font-weight: 500;
          margin-bottom: 5px;
        }
        
        .equipment-value {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        /* Lease Options Table */
        .section {
          margin-bottom: 40px;
        }
        
        h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 20px;
        }
        
        .lease-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.07);
        }
        
        .lease-table thead {
          background: #7C3AED;
          color: white;
        }
        
        .lease-table th {
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .lease-table td {
          padding: 15px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 15px;
        }
        
        .lease-table tbody tr {
          background: white;
          transition: background 0.2s;
        }
        
        .lease-table tbody tr:hover {
          background: #f9f9f9;
        }
        
        .lease-table tbody tr.selected {
          background: #f8f4ff;
          font-weight: 500;
        }
        
        .lease-table tbody tr.selected td {
          color: #7C3AED;
        }
        
        /* Comparison Box */
        .comparison-box {
          background: linear-gradient(135deg, #7C3AED 0%, #9F7AEA 100%);
          color: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 40px;
        }
        
        .comparison-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 25px;
        }
        
        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
        }
        
        .comparison-item {
          background: rgba(255,255,255,0.15);
          padding: 20px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }
        
        .comparison-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
        }
        
        .comparison-value {
          font-size: 28px;
          font-weight: 700;
        }
        
        .highlight-box {
          grid-column: span 2;
          background: rgba(255,255,255,0.25);
          text-align: center;
          padding: 25px;
          border-radius: 8px;
          margin-top: 10px;
        }
        
        .highlight-label {
          font-size: 16px;
          margin-bottom: 10px;
          opacity: 0.9;
        }
        
        .highlight-value {
          font-size: 36px;
          font-weight: 700;
        }
        
        /* Benefits Section */
        .benefits-section {
          background: #f9f9f9;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 40px;
        }
        
        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 20px;
        }
        
        .benefit-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .benefit-icon {
          width: 48px;
          height: 48px;
          background: #7C3AED;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          font-size: 24px;
          color: white;
        }
        
        .benefit-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .benefit-desc {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }
        
        /* Footer */
        .footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 1px solid #e0e0e0;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        
        .contact-info {
          margin-top: 20px;
        }
        
        .contact-info a {
          color: #7C3AED;
          text-decoration: none;
          font-weight: 500;
        }
        
        @media print {
          body {
            font-size: 12px;
          }
          
          .container {
            padding: 20px;
          }
          
          .lease-table {
            box-shadow: none;
          }
          
          .comparison-box,
          .benefits-section {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo-section">
            <div class="logo">VibeLux</div>
            <div class="tagline">Advanced Horticultural Engineering Solutions</div>
          </div>
          <div class="report-info">
            <div>Equipment Leasing Analysis</div>
            <div class="report-date">${currentDate}</div>
          </div>
        </div>
        
        <!-- Title -->
        <div class="title-section">
          <h1>Equipment Leasing Analysis</h1>
          <div class="subtitle">Comprehensive Financial Comparison</div>
        </div>
        
        <!-- Equipment Details -->
        <div class="equipment-card">
          <div class="equipment-title">Equipment Details</div>
          <div class="equipment-grid">
            <div class="equipment-item">
              <div class="equipment-label">Equipment Type</div>
              <div class="equipment-value">${data.equipment.name}</div>
            </div>
            <div class="equipment-item">
              <div class="equipment-label">Purchase Price</div>
              <div class="equipment-value">$${data.equipment.cost.toLocaleString()}</div>
            </div>
            <div class="equipment-item">
              <div class="equipment-label">Category</div>
              <div class="equipment-value">${data.equipment.category}</div>
            </div>
            <div class="equipment-item">
              <div class="equipment-label">Expected Lifespan</div>
              <div class="equipment-value">${data.equipment.lifespan} years</div>
            </div>
          </div>
        </div>
        
        <!-- Lease Options -->
        <div class="section">
          <h2>Available Lease Options</h2>
          <table class="lease-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>APR</th>
                <th>Monthly Payment</th>
                <th>Total Cost</th>
                <th>Tax Benefit</th>
                <th>Net Cost</th>
              </tr>
            </thead>
            <tbody>
              ${data.leaseOptions.map((option: any) => `
                <tr ${option.term === selectedLease.term ? 'class="selected"' : ''}>
                  <td><strong>${option.term} months</strong></td>
                  <td>${option.rate.toFixed(1)}%</td>
                  <td>$${option.monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td>$${option.totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td style="color: #22c55e;">$${option.taxBenefit.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                  <td><strong>$${(option.totalCost - option.taxBenefit).toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <!-- Financial Comparison -->
        <div class="comparison-box">
          <div class="comparison-title">Cash vs. Lease Financial Analysis</div>
          <div class="comparison-grid">
            <div class="comparison-item">
              <div class="comparison-label">Cash Purchase Price</div>
              <div class="comparison-value">$${data.comparison.cashPrice.toLocaleString()}</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-label">Total Lease Payments</div>
              <div class="comparison-value">$${data.comparison.leaseTotal.toLocaleString()}</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-label">Tax Deduction Benefit</div>
              <div class="comparison-value">-$${data.comparison.taxSavings.toLocaleString()}</div>
            </div>
            <div class="comparison-item">
              <div class="comparison-label">Net Lease Cost</div>
              <div class="comparison-value">$${data.comparison.netLeaseCost.toLocaleString()}</div>
            </div>
            <div class="highlight-box">
              <div class="highlight-label">Cash Flow Preserved for Operations</div>
              <div class="highlight-value">$${data.comparison.cashFlowBenefit.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        <!-- Benefits -->
        <div class="benefits-section">
          <h2>Key Benefits of Leasing</h2>
          <div class="benefits-grid">
            <div class="benefit-card">
              <div class="benefit-icon">💰</div>
              <div class="benefit-title">Preserve Capital</div>
              <div class="benefit-desc">Keep cash available for core business operations and growth</div>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">📊</div>
              <div class="benefit-title">Tax Advantages</div>
              <div class="benefit-desc">Lease payments are fully deductible as business expenses</div>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">🚀</div>
              <div class="benefit-title">Technology Flexibility</div>
              <div class="benefit-desc">Upgrade to newer equipment at end of lease term</div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>This analysis is provided for informational purposes only. Please consult with your financial advisor.</p>
          <div class="contact-info">
            <p>For questions about this analysis, contact: <a href="mailto:blake@vibelux.ai">blake@vibelux.ai</a></p>
            <p>VibeLux Advanced Horticultural Engineering Solutions | www.vibelux.com</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}