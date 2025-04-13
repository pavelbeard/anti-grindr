import { beforeEach } from 'vitest'
import resetDb from './reset-db.ts'

beforeEach(async () => {
  await resetDb()
})
