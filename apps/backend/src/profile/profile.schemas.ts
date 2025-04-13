import { z } from 'zod'

const CreateProfileSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
})

const GetProfileSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
  body: z
    .object({
      onlyNameAndPicture: z.boolean().default(false),
    })
    .optional(),
})

const SEX_ROLE = z.enum([
  'active',
  'passive',
  'versatile',
  'versatile-top',
  'versatile-bottom',
  'side',
])
const GENDER = z.enum([
  'male',
  'cismale',
  'transmale',
  'female',
  'cisfemale',
  'transfemale',
  'nonbinary',
])
// const PRONOUN = z.enum(['he_him_his', 'she_her_hers', 'they_them_theirs', 'ze_hir_hirs', 'ze_zir_zirs', 'use_my_name', 'ask_me'])

const MALE_GENDERS = new Set(['male', 'cismale', 'transmale'])
const FEMALE_GENDERS = new Set(['female', 'cisfemale', 'transfemale'])

export const validateGenderConsistency = (selected: string[]) => {
  const genderSet = new Set(selected)

  const hasMale = [...genderSet].some((gender) => MALE_GENDERS.has(gender))
  const hasFemale = [...genderSet].some((gender) => FEMALE_GENDERS.has(gender))

  if (hasMale && hasFemale) {
    return false
  }

  return true
}

const UpdateProfileSchema = z.object({
  params: z.object({
    userId: z.string(),
  }),
  body: z.object({
    name: z.string().max(50).optional(),
    age: z.number().positive().min(18).max(99).optional(),
    bio: z.string().max(1000).optional(),
    sexRole: SEX_ROLE.optional(),
    gender: z.array(GENDER).refine(validateGenderConsistency).optional(),
  }),
})

export { CreateProfileSchema, GetProfileSchema, UpdateProfileSchema }
