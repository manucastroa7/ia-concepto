import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PLACES_KEY = (process.env.GOOGLE_PLACES_API_KEY || "").trim();

// Map of star categories to minimum Places API ratings
const RATING_MAP: Record<string, number> = {
  "3 estrellas":  4.0,
  "4 estrellas":  4.4,
  "5 estrellas":  4.6,
  "Gran Lujo":    4.7,
};

export interface RealHotel {
  name: string;
  rating: number;
  numReviews: number;
  address: string;
  location: string;
  category: string;
  mapsUrl: string;
  photoUrl?: string;
  placeId: string;
  roomType?: string;
  mealPlan?: string;
  reviewSummary?: string;
  reviews?: {
    authorName?: string;
    rating?: number;
    text?: string;
    relativePublishTimeDescription?: string;
    publishTime?: string;
  }[];
}

export class HotelSearchService {
  // Keep a pool of all fetched hotels, to rotate without re-calling API
  private poolCache: Map<string, RealHotel[]> = new Map();

  private shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  private getPhotoUrl(photoName?: string) {
    return photoName
      ? `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&key=${PLACES_KEY}`
      : undefined;
  }

  private mapReview(review: any) {
    return {
      authorName: review.authorAttribution?.displayName,
      rating: review.rating,
      text: review.text?.text || review.originalText?.text || "",
      relativePublishTimeDescription: review.relativePublishTimeDescription,
      publishTime: review.publishTime,
    };
  }

  private mapPlaceToHotel(place: any, params: {
    destination: string;
    hotelCategory: string;
    roomDistribution?: string;
    mealPlan?: string;
  }): RealHotel & { priceLevel?: string | null } {
    const PRICE_MAP: Record<string, string> = {
      PRICE_LEVEL_FREE: 'Gratis',
      PRICE_LEVEL_INEXPENSIVE: '$',
      PRICE_LEVEL_MODERATE: '$$',
      PRICE_LEVEL_EXPENSIVE: '$$$',
      PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
    };

    const photoName = place.photos?.[0]?.name;
    const summaryText =
      place.reviewSummary?.text?.text ||
      place.reviewSummary?.text ||
      place.editorialSummary?.text ||
      undefined;

    return {
      name: place.displayName?.text || "Sin nombre",
      rating: place.rating,
      numReviews: place.userRatingCount || 0,
      address: place.formattedAddress || params.destination,
      location: place.formattedAddress?.split(",")[1]?.trim() || params.destination,
      category: params.hotelCategory,
      mapsUrl: place.googleMapsUri || "",
      photoUrl: this.getPhotoUrl(photoName),
      placeId: place.id || "",
      priceLevel: PRICE_MAP[place.priceLevel] || null,
      roomType: params.roomDistribution ? `${params.roomDistribution}` : undefined,
      mealPlan: params.mealPlan,
      reviewSummary: summaryText,
      reviews: Array.isArray(place.reviews)
        ? place.reviews.map((review: any) => this.mapReview(review)).filter((review: any) => review.text || review.rating)
        : undefined,
    };
  }

  async getPlaceDetails(placeId: string, params: {
    destination: string;
    hotelCategory: string;
    roomDistribution?: string;
    mealPlan?: string;
  }): Promise<RealHotel | null> {
    if (!PLACES_KEY || !placeId) return null;

    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    const baseFields = [
      "id",
      "displayName",
      "rating",
      "userRatingCount",
      "formattedAddress",
      "googleMapsUri",
      "photos",
      "primaryTypeDisplayName",
      "priceLevel",
      "reviews",
    ];

    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": PLACES_KEY,
          "X-Goog-FieldMask": [...baseFields, "reviewSummary"].join(","),
        },
        params: { languageCode: "es" },
      });

      return this.mapPlaceToHotel(response.data, params);
    } catch (error: any) {
      try {
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": PLACES_KEY,
            "X-Goog-FieldMask": baseFields.join(","),
          },
          params: { languageCode: "es" },
        });

        return this.mapPlaceToHotel(response.data, params);
      } catch (fallbackError: any) {
        console.error("HotelSearchService Details Error:", fallbackError.response?.data || fallbackError.message);
        return null;
      }
    }
  }

  async searchHotels(params: {
    destination: string;
    accommodationType: string;
    hotelCategory: string;
    mealPlan?: string;
    roomDistribution?: string;
    isCentric?: boolean;
    zone?: string;
    count?: number;
    minReviews?: number;
    randomize?: boolean;
    includeReviews?: boolean;
  }): Promise<RealHotel[]> {

    const minRating = RATING_MAP[params.hotelCategory] || 4.0;
    const count = params.count || 4;
    const minReviews = params.minReviews ?? 20;
    const randomize = params.randomize ?? false;

    // Build a focused text query
    const accommodationKeyword = params.accommodationType || "hotel";
    const centricNote = params.isCentric ? "centro" : "";
    const zoneNote = params.zone ? params.zone : "";
    const textQuery = `${accommodationKeyword} ${params.destination} ${zoneNote} ${centricNote}`.trim();
    const cacheKey = textQuery + minRating + minReviews;

    console.log(`HotelSearchService - Searching: "${textQuery}", minRating: ${minRating}`);

    let allResults = this.poolCache.get(cacheKey);

    // Only call API if we don't have a cached pool
    if (!allResults) {
      try {
        const response = await axios.post(
          "https://places.googleapis.com/v1/places:searchText",
          {
            textQuery,
            languageCode: "es",
            maxResultCount: 20,
            rankPreference: "RELEVANCE",
            minRating,
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
                "places.primaryTypeDisplayName",
                "places.priceLevel"
              ].join(","),
            },
          }
        );

        const places = response.data.places || [];
        console.log(`HotelSearchService - Found ${places.length} places`);

        allResults = places
          .filter((p: any) => p.rating && p.rating >= minRating && (p.userRatingCount || 0) >= minReviews)
          .map((p: any) => this.mapPlaceToHotel(p, params));

        // Cache the full pool (expires on server restart)
        this.poolCache.set(cacheKey, allResults as RealHotel[]);
      } catch (error: any) {
        console.error("HotelSearchService Error:", error.response?.data || error.message);
        return [];
      }
    }

    // Shuffle for randomized/alternative requests, keep top for normal
    const source = randomize ? this.shuffle(allResults as RealHotel[]) : (allResults as RealHotel[]);
    const selected = source.slice(0, count);

    if (!params.includeReviews) return selected;

    const detailed = await Promise.all(selected.map(async (hotel) => {
      const details = await this.getPlaceDetails(hotel.placeId, params);
      return details ? { ...hotel, ...details } : hotel;
    }));

    return detailed;
  }
}
