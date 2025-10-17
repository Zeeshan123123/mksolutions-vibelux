/**
 * Simple test to verify Jest is working
 */

describe('Simple Test', () => {
  it('should pass basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect(true).toBe(true)
    expect('hello').toBe('hello')
  })

  it('should handle arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
  })

  it('should handle objects', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj).toEqual({ name: 'test', value: 42 })
    expect(obj).toHaveProperty('name', 'test')
  })

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success')
    await expect(promise).resolves.toBe('success')
  })
})