import type { DiscoveryService } from "@/services/contracts/operationalServices";
import { assertEligible, assertValid, db } from "./db";
import { mockRequest } from "./mockDelay";

const SERVICE = "discovery";

export const mockDiscoveryService: DiscoveryService = {
  get: () => mockRequest(() => db.discovery, { service: SERVICE }),

  update: (update) =>
    mockRequest(
      () => {
        const config = db.discovery;
        switch (update.type) {
          case "market": {
            const market = config.markets.find((item) => item.id === update.id);
            assertValid(Boolean(market), `Market ${update.id} was not found.`);
            assertEligible(market!.status !== update.status, "The market already has this status.");
            market!.status = update.status;
            break;
          }
          case "location": {
            const location = config.featuredLocations.find((item) => item.id === update.id);
            assertValid(Boolean(location), `Location ${update.id} was not found.`);
            location!.active = update.active;
            break;
          }
          case "source": {
            const source = config.sources.find((item) => item.id === update.id);
            assertValid(Boolean(source), `Source ${update.id} was not found.`);
            source!.enabled = update.enabled;
            break;
          }
          case "relevance": {
            const radius = config.relevance.find((item) => item.scope === update.scope);
            assertValid(Boolean(radius), `Scope ${update.scope} was not found.`);
            assertEligible(radius!.radiusKm !== null, "This scope has no radius to configure.");
            assertValid(
              Number.isInteger(update.radiusKm) && update.radiusKm >= 1 && update.radiusKm <= 500,
              "Radius must be a whole number between 1 and 500 km.",
            );
            radius!.radiusKm = update.radiusKm;
            break;
          }
        }
        return config;
      },
      { service: SERVICE },
    ),
};
