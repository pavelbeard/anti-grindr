import { it, describe, vi, beforeEach, afterEach, expect } from "vitest";
import type { Request, Response } from "express";
import * as ProfileController from "./profile.controller.ts";
import * as ProfileService from "@/profile/profile.service.ts";
import { AppError } from "@/lib/utility-classes";
import { CreateProfileSchema, GetProfileSchema } from "./profile.types";
import { Profile } from "@prisma/client";

vi.mock("profile/profile.service", () => ({
  createProfile: vi.fn(),
  getProfileByUserId: vi.fn(),
  getProfileNameAndMainPicture: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("lib/utility-classes", () => ({
  AppError: class {
    constructor(
      public type: string,
      public message: string,
    ) {}
  },
}));

describe("profile.controller", () => {
  let request: Request;
  let response: Response;
  const next = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();

    response = {
      status: vi.fn().mockReturnThis(),
      cookie: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createProfile", () => {
    it("should throw an error if user ID is not provided.", async () => {
      request = {
        params: { userId: undefined },
      } as unknown as Request<CreateProfileSchema["params"], unknown, unknown>;

      vi.mocked(ProfileService.createProfile).mockResolvedValueOnce(
        null as unknown as Profile,
      );

      await ProfileController.createProfile(
        request as Request<CreateProfileSchema["params"], unknown, unknown>,
        response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new AppError("validation", "User ID is required"),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toBe("User ID is required");
      expect(next.mock.calls[0][0].type).toBe("validation");
    });

    it("should throw an error if profile already exists.", async () => {
      request = {
        params: { userId: "1" },
      } as unknown as Request<CreateProfileSchema["params"], unknown, unknown>;

      vi.mocked(ProfileService.getProfileByUserId).mockResolvedValueOnce({
        id: "1",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
        name: "Alan De`logan",
        age: 33,
        height: 189,
        weight: 85,
        sexRole: "active" as Profile["sexRole"],
        bio: "I am a bio",
        genders: [{ name: "male" }],
        pronouns: [{ name: "he_him_his" }],
        pictures: [{ albumId: "1", url: "https://example.com" }],
        albums: [{ id: "1", name: "Album 1", profileId: "1" }],
      });

      await ProfileController.createProfile(
        request as Request<CreateProfileSchema["params"], unknown, unknown>,
        response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new AppError("validation", "Profile already exists"),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toBe("Profile already exists");
      expect(next.mock.calls[0][0].type).toBe("validation");
    });

    it("should create a new profile.", async () => {
      request = {
        params: { userId: "1" },
      } as unknown as Request<CreateProfileSchema["params"], unknown, unknown>;

      vi.mocked(ProfileService.getProfileByUserId).mockResolvedValueOnce(null);
      vi.mocked(ProfileService.createProfile).mockResolvedValueOnce({
        id: "1",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Profile);

      await ProfileController.createProfile(
        request as Request<CreateProfileSchema["params"], unknown, unknown>,
        response,
        next,
      );

      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith({
        id: "1",
        userId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  });

  describe("getProfile", () => {
    it("should throw an error if profile not found.", async () => {
      request = {
        params: { userId: "1" },
      } as unknown as Request<GetProfileSchema["params"], unknown, unknown>;

      vi.mocked(ProfileService.getProfileByUserId).mockResolvedValueOnce(null);

      await ProfileController.getProfile(
        request as Request<GetProfileSchema["params"], unknown, unknown>,
        response,
        next,
      );

      expect(next).toHaveBeenCalledWith(
        new AppError("notFound", "Profile not found"),
      );
      expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
      expect(next.mock.calls[0][0].message).toBe("Profile not found");
      expect(next.mock.calls[0][0].type).toBe("notFound");
    });

    describe("test onlyNameAndPicture body parameter", () => {
      it("should return profile with only name and picture.", async () => {
        request = {
          params: { userId: "1" },
          body: { onlyNameAndPicture: true },
        } as unknown as Request<
          GetProfileSchema["params"],
          unknown,
          GetProfileSchema["body"]
        >;

        vi.mocked(
          ProfileService.getProfileNameAndMainPicture,
        ).mockResolvedValueOnce({
          name: "John Doe",
          pictures: [
            {
              id: "1",
              createdAt: new Date(),
              updatedAt: new Date(),
              order: 1,
              url: "https://example.com",
              albumId: null,
              profileId: "1",
            },
          ],
        });

        await ProfileController.getProfile(
          request as Request<
            GetProfileSchema["params"],
            unknown,
            GetProfileSchema["body"]
          >,
          response,
          next,
        );

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({
          name: "John Doe",
          pictures: [
            {
              id: "1",
              createdAt: new Date(),
              updatedAt: new Date(),
              order: 1,
              url: "https://example.com",
              albumId: null,

              profileId: "1",
            },
          ],
        });
      });

      it("should return profile with all fields.", async () => {
        request = {
          params: { userId: "1" },
          body: { onlyNameAndPicture: false },
        } as unknown as Request<
          GetProfileSchema["params"],
          unknown,
          GetProfileSchema["body"]
        >;

        vi.mocked(ProfileService.getProfileByUserId).mockResolvedValueOnce({
          id: "1",
          userId: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
          name: "John Doe",
          age: 25,
          height: 180,
          weight: 75,
          sexRole: "active" as Profile["sexRole"],
          bio: "I am a bio",
          genders: [{ name: "male" }],
          pronouns: [{ name: "he_him_his" }],
          pictures: [
            {
              albumId: "1",
              url: "https://example.com",
            },
          ],
          albums: [
            {
              id: "1",
              name: "Album 1",
              profileId: "1",
            },
          ],
        });

        await ProfileController.getProfile(
          request as Request<
            GetProfileSchema["params"],
            unknown,
            GetProfileSchema["body"]
          >,
          response,
          next,
        );

        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.json).toHaveBeenCalledWith({
          id: "1",
          userId: "1",
          createdAt: new Date(),
          updatedAt: new Date(),
          name: "John Doe",
          age: 25,
          height: 180,
          weight: 75,
          sexRole: "active" as Profile["sexRole"],
          bio: "I am a bio",
          genders: [{ name: "male" }],
          pronouns: [{ name: "he_him_his" }],
          pictures: [
            {
              albumId: "1",
              url: "https://example.com",
            },
          ],
          albums: [
            {
              id: "1",
              name: "Album 1",
              profileId: "1",
            },
          ],
        });
      });
    });
  });
});
