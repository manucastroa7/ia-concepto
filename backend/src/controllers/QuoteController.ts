import { Request, Response } from "express";
import { AIService } from "../services/AIService";
import { HotelSearchService } from "../services/HotelSearchService";
import { AppDataSource } from "../data-source";
import { Quote } from "../entities/Quote";

const aiService = new AIService();
const hotelService = new HotelSearchService();

export class QuoteController {
  static async createQuote(req: Request, res: Response) {
    console.log("POST /api/quotes - Request received", req.body);
    try {
      const { 
        originCity, destination, travelersCount, hotelCategory, 
        directFlights, tripStyle, isCentric, budget, extraInfo,
        activitiesQuote, roomDistribution, accommodationType, durationDays, travelDates, mealPlan, zone
      } = req.body;

      // 1. Generate AI itinerary first (to get real option names)
      const aiResponse = await aiService.generateItinerary({
        originCity, destination, travelersCount, hotelCategory, 
        directFlights, tripStyle, isCentric, budget, extraInfo,
        activitiesQuote, roomDistribution, accommodationType, durationDays, travelDates, mealPlan
      });

      // 2. Extract option names from AI response
      const options = aiResponse?.options || [aiResponse];
      
      // 3. Search hotels for EACH option using the AI's actual optionName
      const hotelSearches = options.map((option: any) => {
        const searchDest = option.optionName?.replace(/\(.*?\)/g, '').trim() || destination;
        return hotelService.searchHotels({
          destination: searchDest,
          accommodationType,
          hotelCategory,
          mealPlan,
          roomDistribution,
          zone: zone || '',
          isCentric: isCentric === 'true' || isCentric === true,
          count: 4
        });
      });

      const hotelResults = await Promise.all(hotelSearches);

      // 4. Inject real hotels into each option
      const enrichedOptions = options.map((option: any, idx: number) => ({
        ...option,
        hotels: hotelResults[idx] || []
      }));

      const finalResponse = { ...aiResponse, options: enrichedOptions };

      // 3. Save to Database
      const quoteRepository = AppDataSource.getRepository(Quote);
      const newQuote = quoteRepository.create({
        originCity,
        destination, 
        travelersCount, 
        hotelCategory, 
        directFlights, 
        tripStyle, 
        isCentric, 
        activitiesQuote,
        roomDistribution,
        accommodationType,
        mealPlan,
        durationDays,
        travelDates,
        budget: parseFloat(budget),
        aiResponse: finalResponse
      });

      await quoteRepository.save(newQuote);
      console.log("Quote saved successfully to DB");

      return res.status(201).json({
        id: newQuote.id,
        quote: newQuote,
        aiResponse: finalResponse
      });
    } catch (error) {
      console.error("CRITICAL ERROR in QuoteController:", error);
      return res.status(500).json({ 
        message: "Failed to create quote", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  }

  static async getQuote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quoteRepository = AppDataSource.getRepository(Quote);
      const quote = await quoteRepository.findOneBy({ id });

      if (!quote) return res.status(404).json({ message: "Quote not found" });

      return res.json(quote);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching quote" });
    }
  }

  static async getAlternativeHotels(req: Request, res: Response) {
    console.log("POST /api/quotes/alternatives/hotels - Using Google Places");
    try {
      const { destination, hotelCategory, accommodationType, mealPlan, roomDistribution, isCentric, zone } = req.body;
      const hotels = await hotelService.searchHotels({
        destination,
        hotelCategory: hotelCategory || "4 estrellas",
        accommodationType: accommodationType || "hotel",
        mealPlan,
        roomDistribution,
        zone,
        isCentric,
        count: 4,
        randomize: true
      });
      return res.json(hotels);
    } catch (error) {
       console.error(error);
       return res.status(500).json({ message: "Failed to get alternatives" });
    }
  }
}
