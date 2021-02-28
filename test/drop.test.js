const db = require('../index.js')()

describe('Drop', () => {
  beforeEach(async () => await db.drop())

  it('should drop the database', async () => {
    await db('project').create({ name: 'hello' })
    await db('project').create({ name: 'hello' })
    let count = await db('project').count()
    expect(count).toEqual(2)
    await db.drop()
    count = await db('project').count()
    expect(count).toEqual(0)
  })
})
