import * as utils from '../utils'

describe('optimizeData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('trimIncrementalData case where variable i can be 1', () => {
    const testedArray = Array(1173).fill({ tickets: 0, sales: 0, ts: 0 })
    const rate = 2

    let resp = utils.trimIncrementalData(testedArray, rate)

    expect(resp.length).toBe(587)
  })

  it('trimIncrementalData case other data', () => {
    const testedArray = Array(1174).fill({ tickets: 0, sales: 0, ts: 0 })
    const rate = 2

    let resp = utils.trimIncrementalData(testedArray, rate)

    expect(resp.length).toBe(587)
  })
})
