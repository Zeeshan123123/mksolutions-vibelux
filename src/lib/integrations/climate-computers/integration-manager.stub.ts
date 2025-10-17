// Stub for integration manager
export class IntegrationManager {
  constructor() {}
  
  async scanForDevices() {
    return []
  }
  
  async connectToDevice(deviceId: string) {
    return null
  }
  
  async readData(deviceId: string) {
    return {}
  }
}

export default IntegrationManager