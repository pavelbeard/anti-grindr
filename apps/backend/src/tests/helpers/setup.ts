import resetDb from './reset-db.ts'
import { beforeEach } from 'vitest'

beforeEach(async () => {
  await resetDb()
})
