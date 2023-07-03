import * as utils from '../utils'

describe("getMergedFilters", () => {
  beforeEach(() => { jest.clearAllMocks()} )
  
  it("targetingFilter should be returned if no prunedScratchSegment", () => {
    let targetingFilter = {
      name: 'sawyer'
    }

    let resp = utils.getMergedFilters(null, targetingFilter)

    expect(resp.name).toBe('sawyer')
  })
  it("prunedScratchSegment.filter should be returned if no targetingFilter", () => {
    let prunedScratchSegment = {
      filter: 'sawyer'
    }

    let resp = utils.getMergedFilters(prunedScratchSegment, null)

    expect(resp).toBe('sawyer')
  })
  it("if filter.conditions doesn't exist filter.conditions should be set to an empty array", () => {
    let prunedScratchSegment = {
      filter: 'sawyer'
    }
    let targetingFilter = {}

    let resp = utils.getMergedFilters(prunedScratchSegment, targetingFilter)

    expect(Array.isArray(resp.conditions)).toBe(true)
    expect(resp.conditions).toHaveLength(0)
  })
  it("if filter.logic doesn't exist filter.logic should be set to an empty array", () => {
    let prunedScratchSegment = {
      filter: 'sawyer'
    }
    let targetingFilter = {}

    let resp = utils.getMergedFilters(prunedScratchSegment, targetingFilter)

    expect(Array.isArray(resp.logic)).toBe(true)
    expect(resp.logic).toHaveLength(0)
  })
  it("if prunedScratchSegment.filter.logic has length it should be combined with targetingFilter.logic correctly", () => {
    let prunedScratchSegment = {
      filter: {
        conditions: ["justin"],
        logic: ["brooks"]
      }
    }
    let targetingFilter = {
      conditions: ["sawyer"],
      logic: ["jed"]
    }

    let resp = utils.getMergedFilters(prunedScratchSegment, targetingFilter)

    expect(resp.logic[0]).toBe("(")
    expect(resp.logic[1]).toBe("brooks")
    expect(resp.logic[2]).toBe(")")
    expect(resp.logic[3]).toBe("and")
    expect(resp.logic[4]).toBe("jed")
  })
  it("if prunedScratchSegment.filter.logic doesn't exist filter.logic should be set correctly", () => {
    let prunedScratchSegment = {
      filter: {
        conditions: ["justin"],
      }
    }
    let targetingFilter = {
      conditions: ["sawyer"],
      logic: ["jed"]
    }

    let resp = utils.getMergedFilters(prunedScratchSegment, targetingFilter)

    expect(resp.logic[0]).toBe("and")
    expect(resp.logic[1]).toBe("jed")
  })
  it("if prunedScratchSegment.filter.logic has no length it should be combined with targetingFilter.logic correctly", () => {
    let prunedScratchSegment = {
      filter: {
        conditions: ["justin"],
        logic: []
      }
    }
    let targetingFilter = {
      conditions: ["sawyer"],
      logic: ["jed"]
    }

    let resp = utils.getMergedFilters(prunedScratchSegment, targetingFilter)

    expect(resp.logic[0]).toBe("and")
    expect(resp.logic[1]).toBe("jed")
  })
  it("should return targetingFilter if no other conditions are met", () => {
    let prunedScratchSegment = {
      filter: {}
    }
    let targetingFilter = {
      conditions: ["sawyer"],
      logic: ["brooks", "jed"]
    }

    let resp = utils.getMergedFilters(prunedScratchSegment, targetingFilter)
    expect(resp).toEqual(targetingFilter)
  })
})

describe("getFBTotalNumber", () => {
  beforeEach(() => { jest.clearAllMocks()} )

  it("pageId should be set correctly - set to argument if exists", () => {
    let messageList = {
      statsSnapshot: {
        facebook: {
          sawyer: 4,
        }
      },      
    }

    let resp = utils.getFBTotalNumber("sawyer", messageList)

    expect(resp).toBe(4)
  })
  it("pageId should be set correctly - defaults to messageList.meta.facebookMessenger.pageId if no argument exists", () => {
    let messageList = {
      statsSnapshot: {
        facebook: {
          sawyer: 4,
        }
      },
      meta: {
        facebookMessenger: {
          pageId: 'sawyer'
        }
      }
    }

    let resp = utils.getFBTotalNumber("", messageList)

    expect(resp).toBe(4)
  })
  it("messageList.statsSnapshot.facebook[pageId] should be returned - if messageList.statsSnapshot.facebook exists and messageList.statsSnapshot.facebook[pageId] exists", () => {
    let messageList = {
      statsSnapshot: {
        facebook: {
          sawyer: 4,
        }
      },
    }

    let resp = utils.getFBTotalNumber("sawyer", messageList)

    expect(resp).toBe(4)
  })
  it("messageList.statsSnapshot.facebook[pageId] should be returned - if messageList.statsSnapshot.facebook exists and messageList.statsSnapshot.facebook[pageId] equals 0", () => {
    let messageList = {
      statsSnapshot: {
        facebook: {
          sawyer: 0,
        }
      },
    }

    let resp = utils.getFBTotalNumber("sawyer", messageList)

    expect(resp).toBe(0)
  })
  it("messageList.statsSnapshot.facebookMessenger should be returned - if messageList.statsSnapshot.facebook doesn't exist and if messageList.statsSnapshot.facebookMessenger exists", () => {
    let messageList = {
      statsSnapshot: {
        facebookMessenger: 21
      },
    }

    let resp = utils.getFBTotalNumber("", messageList)

    expect(resp).toBe(21)
  })
  it("0 should be returned if neither messageList.statsSnapshot.facebook or messageList.statsSnapshot.facebookMessenger exists", () => {
    let messageList = {
      statsSnapshot: {},
    }

    let resp = utils.getFBTotalNumber("", messageList)

    expect(resp).toBe(0)
  })
})

describe("getSMSTotalNumber", () => {
  beforeEach(() => { jest.clearAllMocks()} )

  it("if campaignOid exists - messageList.statsSnapshot.sms.validMobile should be returned if it exists and statSnapshotIsNew is true", () => {
    let messageList = {
      statsSnapshot: {
        sms: {
          validMobile: 42119,
        }
      }
    }

    let resp = utils.getSMSTotalNumber("21", messageList)

    expect(resp).toBe(42119)
  })
  it("if campaignOid exists - 0 should be returned if messageList.statsSnapshot.sms does not exist and statSnapshotIsNew is true", () => {
    let messageList = {
      statsSnapshot: {
        sms: null
      }
    }

    let resp = utils.getSMSTotalNumber("21", messageList)

    expect(resp).toBe(0)
  })
  it("if campaignOid exists - 0 should be returned if messageList.statsSnapshot.sms.validMobile does not exist and statSnapshotIsNew is true", () => {
    let messageList = {
      statsSnapshot: {
        sms: {
          validMobile: null,
        }
      }
    }

    let resp = utils.getSMSTotalNumber("21", messageList)

    expect(resp).toBe(0)
  })
  it("if campaignOid exists - messageList.statsSnapshot.mobileNumber should be returned if it exists and statSnapshotIsNew is false", () => {
    let messageList = {
      statsSnapshot: {
        sms: {},
        mobileNumber: 19,
      }
    }

    let resp = utils.getSMSTotalNumber("21", messageList)

    expect(resp).toBe(19)
  })
  it("if campaignOid exists - 0 should be returned if messageList.statsSnapshot.mobileNumber does not exist and statSnapshotIsNew is false", () => {
    let messageList = {
      statsSnapshot: {
        sms: {},
        mobileNumber: null,
      }
    }

    let resp = utils.getSMSTotalNumber("21", messageList)

    expect(resp).toBe(0)
  })
  it("if campaignOid does not exist - messageList.statsSnapshot.sms.optedIn should be returned if it exists and statSnapshotIsNew is true", () => {
    let messageList = {
      statsSnapshot: {
        sms: {
          optedIn: 19,
        }
      }
    }

    let resp = utils.getSMSTotalNumber("", messageList)

    expect(resp).toBe(19)
  })
  it("if campaignOid does not exist - 0 should be returned if messageList.statsSnapshot.sms.optedIn does not exist and statSnapshotIsNew is true", () => {
    let messageList = {
      statsSnapshot: {
        sms: {
          optedIn: null
        }
      }
    }

    let resp = utils.getSMSTotalNumber("", messageList)

    expect(resp).toBe(0)
  })
  it("if campaignOid does not exist - messageList.statsSnapshot.sms should be returned if it exists and statSnapshotIsNew is false", () => {
    let messageList = {
      statsSnapshot: {
        sms: 21
      }
    }

    let resp = utils.getSMSTotalNumber("", messageList)

    expect(resp).toBe(21)
  })
  it("if campaignOid does not exist - 0 should be returned if messageList.statsSnapshot.sms does not exist and statSnapshotIsNew is false", () => {
    let messageList = {
      statsSnapshot: {
        sms: null
      }
    }

    let resp = utils.getSMSTotalNumber("", messageList)

    expect(resp).toBe(0)
  })
})

describe("getFilteredRecipientListCount", () => {
  beforeEach(() => { jest.clearAllMocks()} )

  it("should return messageList.statsSnapshot.total if channel equals 'email' && campaignOid exists", () => {
    let messageList = {
      statsSnapshot: {
        total: 19,
      }
    }
    let resp = utils.getFilteredRecipientListCount("", "email", 21, "", messageList)
    expect(resp).toBe(19)
  })
  it("getSMSTotalNumber should be called if channel equals 'sms'", () => {
    let messageList = {
      statsSnapshot: {
        total: 19,
      }
    }
    let spy = jest.spyOn(utils, 'getSMSTotalNumber').mockImplementationOnce()

    let resp = utils.getFilteredRecipientListCount("", "sms", 21, "", messageList)
    expect(spy).toHaveBeenCalledTimes(1)
  })
  it("getFBTotalNumber should be called if channel equals 'facebookMessenger'", () => {
    let messageList = {
      statsSnapshot: {
        total: 19,
      }
    }
    let spy = jest.spyOn(utils, 'getFBTotalNumber').mockImplementationOnce()

    let resp = utils.getFilteredRecipientListCount("", "facebookMessenger", 21, "", messageList)
    expect(spy).toHaveBeenCalledTimes(1)
  })
  it("getFBTotalNumber should be called if channel equals 'facebook'", () => {
    let messageList = {
      statsSnapshot: {
        total: 19,
      }
    }
    let spy = jest.spyOn(utils, 'getFBTotalNumber').mockImplementationOnce()

    let resp = utils.getFilteredRecipientListCount("", "facebook", 21, "", messageList)
    expect(spy).toHaveBeenCalledTimes(1)
  })
  it("if channel is neither email, sms, or FB related - if deDupedName exists and messageList.statsSnapshot[deDupedName] exists, messageList.statsSnapshot[deDupedName] should be returned", () => {
    let messageList = {
      statsSnapshot: {
        total: 19,
        sawyer: 21,
      }
    }
    let spy = jest.spyOn(utils, 'getFBTotalNumber').mockImplementationOnce()

    let resp = utils.getFilteredRecipientListCount("sawyer", "other", 21, "", messageList)

    expect(resp).toBe(21)
  })
  it("messageList.statsSnapshot[channel] should be returned - if channel is neither email, sms, or FB related and deDupedName doesn't exist", () => {
    let messageList = {
      statsSnapshot: {
        total: 19,
        sawyer: 21,
        brooks: 'jed'
      }
    }
    let spy = jest.spyOn(utils, 'getFBTotalNumber').mockImplementationOnce()

    let resp = utils.getFilteredRecipientListCount("", "brooks", 21, "", messageList)

    expect(resp).toBe('jed')
  })
  it("messageList.statsSnapshot[channel] should be returned - if channel is neither email, sms, or FB related and messageList.statsSnapshot[deDupedName] doesn't exist", () => {
    let messageList = {
      statsSnapshot: {
        total: 19,
        sawyer: 21,
        brooks: 'jed'
      }
    }
    let spy = jest.spyOn(utils, 'getFBTotalNumber').mockImplementationOnce()

    let resp = utils.getFilteredRecipientListCount("other", "brooks", 21, "", messageList)

    expect(resp).toBe('jed')
  })
  it("undefined should be returned - if channel is neither email, sms, or FB related, and both deDupedName and messageList.statsSnapshot do not exist", () => {
    let messageList = {
      statsSnapshot: {}
    }
    let spy = jest.spyOn(utils, 'getFBTotalNumber').mockImplementationOnce()

    let resp = utils.getFilteredRecipientListCount("", "brooks", 21, "", messageList)

    expect(resp).toBe(undefined)
  })
  it("undefined should be returned - if channel is neither email, sms, or FB related, and both deDupedName and messageList.statsSnapshot[deDupedName] do not exist", () => {
    let messageList = {
      statsSnapshot: {
        total: 19,
        sawyer: 21,
      }
    }
    let spy = jest.spyOn(utils, 'getFBTotalNumber').mockImplementationOnce()

    let resp = utils.getFilteredRecipientListCount("", "brooks", 21, "", messageList)

    expect(resp).toBe(undefined)
  })
})