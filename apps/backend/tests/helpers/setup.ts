import resetDB from './reset-db.ts'
import { beforeEach } from 'vitest'

beforeEach(async () => {
  await resetDB()
})
