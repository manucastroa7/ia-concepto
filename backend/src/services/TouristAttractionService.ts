import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PLACES_KEY = (process.env.GOOGLE_PLACES_API_KEY || "").trim();

export interface TouristAttraction {
  name: string;
  rating: number | null;
  numReviews: number;
  address: string;
  mapsUrl: string;
  photoUrl?: string;
  placeId: string;
  primaryType?: string;
}

export class TouristAttractionService {
  async searchAttractions(destination: string, limit = 6): Promise<TouristAttraction[]> {
    if (!PLACES_KEY || !destination?.trim()) return [];

    try {
      const response = await axios.post(
        "https://places.googleapis.com/v1/places:searchText",
        {
          textQuery: `atracciones turisticas en ${destination}`,
          languageCode: "es",
          maxResultCount: 12,
          rankPreference: "RELEVANCE",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": PLACES_KEY,
            "X-Goog-FieldMask": [
              "places.displayName",
              "places.rating",
              "places.userRatingCount",
              "places.formattedAddress",
              "places.id",
              "places.googleMapsUri",
              "places.photos",
              "places.primaryTypeDisplayName"
            ].join(","),
          },
        }
      );

      const places = response.data?.places || [];

      return places
        .filter((place: any) => (place.userRatingCount || 0) >= 20)
        .slice(0, limit)
        .map((place: any) => {
          const photoName = place.photos?.[0]?.name;
          const photoUrl = photoName
            ? `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&key=${PLACES_KEY}`
            : undefined;

          return {
            name: place.displayName?.text || "Atracción turística",
            rating: place.rating ?? null,
            numReviews: place.userRatingCount || 0,
            address: place.formattedAddress || destination,
            mapsUrl: place.googleMapsUri || "",
            photoUrl,
            placeId: place.id || "",
            primaryType: place.primaryTypeDisplayName?.text || undefined,
          };
        });
    } catch (error: any) {
      console.error("TouristAttractionService Error:", error.response?.data || error.message);
      return [];
    }
  }
}
