// Stub for control system manager
export class ControlSystemManager {
  async getDevices() {
    return []
  }
  
  async connect(deviceId: string) {
    return { connected: false }
  }
  
  async sendCommand(deviceId: string, command: any) {
    return { success: false }
  }
}

export default new ControlSystemManager()