const db = require('../index.js')()

describe('Create', () => {
  beforeEach(async () => await db.drop())

  // Test that we can create a document
  it('should create a document', async () => {
    const create = await db('project').create({ name: 'hello'})
    expect(create._id).toBeDefined()
    expect(typeof create._id).toEqual('string')
    expect(create._id.length).toBe(25)
  })

  // Test that we can create multiple documents
  it('should create multiple documents', async () => {
    const { n, ids } = await db('project').create([{ name: 'hello'}, { name: 'bye' }])
    expect(n).toBe(2)
    expect(Array.isArray(ids)).toBe(true)
    expect(ids.length).toEqual(2)
    expect(typeof ids[0]).toBe('string')
    expect(ids[0].length).toBe(25)
    expect(ids[1].length).toBe(25)
  })

  // Test that date is saved as a date object
  it('should save a date as a date object', async () => {
    const date = new Date()
    const create = await db('project').create({ date })
    expect(create._id).toBeDefined()
    const get = await db('project').get({ _id: create._id })
    expect(typeof get.date).toBe('object')
    expect(get.date.constructor === Date).toBe(true)
  })
})
