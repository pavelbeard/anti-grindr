import 'core-js/proposals/set-methods'
import { describe, expect, it } from 'vitest'
import {
  UpdateProfileSchema,
  validateGenderConsistency,
} from './profile.schemas.ts'

describe('profile.schemas', () => {
  describe('validateGenderConsistency', () => {
    it('should return true for valid gender consistency with all MALE', () => {
      const genders = ['male', 'cismale', 'transmale', 'nonbinary']
      expect(validateGenderConsistency(genders)).toBe(true)
    })

    it('should return true for valid gender consistency with all FEMALE', () => {
      const genders = ['female', 'cisfemale', 'transfemale', 'nonbinary']
      expect(validateGenderConsistency(genders)).toBe(true)
    })

    it('should return true for valid gender consistency with only MALE or FEMALE', () => {
      const genders1 = ['male']
      expect(validateGenderConsistency(genders1)).toBe(true)

      const genders2 = ['female']
      expect(validateGenderConsistency(genders2)).toBe(true)

      const genders3 = ['nonbinary']
      expect(validateGenderConsistency(genders3)).toBe(true)
    })

    it('should return true for valid gender consistency with CISMALE + NONBINARY and CISFEMALE + NONBINARY', () => {
      const genders1 = ['cismale', 'nonbinary']
      expect(validateGenderConsistency(genders1)).toBe(true)

      const genders2 = ['cisfemale', 'nonbinary']
      expect(validateGenderConsistency(genders2)).toBe(true)
    })

    it('should return false for invalid gender consistency', () => {
      const genders = ['male', 'female']
      expect(validateGenderConsistency(genders)).toBe(false)
    })
  })

  describe('UpdateProfileSchema', () => {
    it('should validate valid data', () => {
      const data = {
        name: 'John Doe',
        age: 25,
        bio: 'I am a bio',
        sexRole: 'active',
        gender: ['male'],
      }
      expect(
        UpdateProfileSchema.parse({ params: { userId: '1' }, body: data }),
      ).toEqual({
        params: { userId: '1' },
        body: data,
      })
    })

    it('should throw error for invalid data', () => {
      const data = {
        name: 'John Doe',
        age: 25,
        bio: 'I am a bio',
        sexRole: 'active',
        gender: ['male', 'female'],
      }
      expect(() =>
        UpdateProfileSchema.parse({ params: { userId: '1' }, body: data }),
      ).toThrow()
    })
  })
})
