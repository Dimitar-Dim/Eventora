export const GENRES = ["Rock", "Pop", "Folk", "Classical", "Jazz", "Metal", "Techno"] as const
export type IGenre = typeof GENRES[number]
