export interface UpdateUserProfileDTO {
  firstName?: string
  lastName?: string
  birthday?: string
  gender?: "male" | "female"
  lookingFor?: "male" | "female" | "both"
  description?: string
  location?: string
  latitude?: number
  longitude?: number
  iconUrl?: string | null
  photoUrls?: string[]
  curiousAbout?: number[]
}