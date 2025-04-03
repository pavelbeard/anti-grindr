import { createProfile } from '@/profile/profile.controller.ts'
import type { Request, Response } from 'express'
import { Router } from 'express'

const profileRouter: Router = Router()

profileRouter.post('/:userId/create', async (req: Request, res: Response) => {
  const profile = await createProfile(req.params.userId)
  res.status(201).json(profile)
})

export default profileRouter
