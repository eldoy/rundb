# RunDB

RunDB in-memory database with persistence for NodeJS. Fast database for small to medium size data sets.

Based on [NeDB](https://github.com/louischatriot/nedb) and follows the [Waveorb database adapter spec.](https://github.com/eldoy/waveorb-db)

### Install
`npm i rundb`

### Usage
**Connect to database**
```js
const connection = require('rundb')
const db = await connection()
```

**Create document**
```js
// Returns the created id: { id: '507f191e810c19729de860ea' }
// Takes only 1 argument: values
const result = await db('project').create({ name: 'hello' })
```

**Create multiple documents**
```js
// Returns the the created count and the created ids:
// { n: 2, ids: ['507f191e810c19729de860ea', '607f191e810c19729de860eb'] }
// Takes only 1 argument: values, must be array of objects
const result = await db('project').create([{ name: 'hello' }, { name: 'bye' }])
```

**Update document (updates multiple if query matches)**
```js
// Returns the number of updated documents: { n: 1 }
// Takes 2 arguments: query, values
const result = await db('project').update({ id: '507f191e810c19729de860ea' }, { name: 'bye' })
```

**Delete document (deletes multiple if query matches)**
```js
// Returns the number of deleted documents: { n: 1 }
// Takes 1 argument: query
const result = await db('project').delete({ id: '507f191e810c19729de860ea' })
```

**Find document**
```js
// Returns an array of matching documents
// Takes 2 arguments: query, options

// Find all
const result = await db('project').find()

// Find all with name 'bye'
const result = await db('project').find({ name: 'bye' })

// Find with sorting on 'name' field descending, use 1 for ascending
const result = await db('project').find({}, { sort: { name: -1 } })

// Find only 2
const result = await db('project').find({}, { limit: 2 })

// Find but skip 2
const result = await db('project').find({}, { skip: 2 })

// Find all but don't include the 'name' field in the result
const result = await db('project').find({}, { fields: { name: false } })

// Find all with 'level' field greater than 5
const result = await db('project').find({ level: { $gt: 5 }})
```
All of the [mongodb query operators](https://docs.mongodb.com/manual/reference/operator/query/) should work.

**Get document**
```js
// Returns the first matching document
// Takes 2 arguments: query, options
const result = await db('project').get({ name: 'bye' })
```

**Count documents**
```js
// Returns the count of the matching query
// Takes 2 arguments: query, options
const result = await db('project').count({ name: 'bye' })
```

**The database client**
```js
db.client
```

MIT Licensed. Enjoy!
