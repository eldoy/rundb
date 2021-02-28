const db = require('../index.js')()

describe('Null', () => {

  beforeEach(async () => await db.drop())

  it('should not insert null', async () => {
    await db('project').create({ name: null })
    const first = await db('project').get()
    expect(first.name).toBeUndefined()
  })

  it('should not update with null', async () => {
    await db('project').create({ name: 'hello' })
    let first = await db('project').get()
    expect(first.name).toBe('hello')
    const update = await db('project').update({ _id: first._id }, { name: null })
    first = await db('project').get()
    expect(first.name).toBeUndefined()
  })
})
