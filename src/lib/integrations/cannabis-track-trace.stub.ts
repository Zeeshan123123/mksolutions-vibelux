// Stub for cannabis track and trace
export class CannabisTrackTrace {
  async connect() {
    return { connected: false }
  }
  
  async syncInventory() {
    return { synced: 0 }
  }
  
  async reportHarvest(data: any) {
    return { success: false, id: null }
  }
  
  async createPackage(data: any) {
    return { success: false, packageId: null }
  }
}

export default new CannabisTrackTrace()