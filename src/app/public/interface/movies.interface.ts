export interface MoviesInterface {
  id: string;
  externalId?: number;
  title?: string;
  overview?: string;
  genres?: string;
  releaseDate?: Date;
  posterPath?: string;
  runtime?: number;
  originalLanguage?: string;
  director?: string;
}
export interface CollectionResponse {
  data: {
    id: string;
    userId: string;
    movies: MoviesInterface[];
  }[];
  total: number;
  totalPages: number;
  page: number;
  size: number;
}
