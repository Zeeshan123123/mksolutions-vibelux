// Stub for QuickBooks integration
export class QuickBooksIntegration {
  async authenticate(code: string) {
    return { success: false, accessToken: null }
  }
  
  async getCompanyInfo() {
    return null
  }
  
  async createInvoice(invoice: any) {
    return { id: null, success: false }
  }
  
  async syncCustomers() {
    return { synced: 0 }
  }
}

export const quickBooksIntegration = new QuickBooksIntegration()

export default quickBooksIntegration