import type { DiscoveryService } from "@/services/contracts/operationalServices";
import { assertEligible, assertValid, db } from "./db";
import { mockRequest } from "./mockDelay";

const SERVICE = "discovery";

export const mockDiscoveryService: DiscoveryService = {
  get: () => mockRequest(() => db.discovery, { service: SERVICE }),

  update: (update, actor) =>
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
          case "ranking": {
            const total = update.factors.reduce((sum, factor) => sum + factor.weight, 0);
            assertValid(
              update.factors.every(
                (factor) =>
                  Number.isInteger(factor.weight) && factor.weight >= 0 && factor.weight <= 100,
              ),
              "Each weight must be a whole number from 0 to 100.",
            );
            assertValid(
              total === 100,
              `Ranking weights must add up to 100% (currently ${total}%).`,
            );
            assertValid(
              update.risingThreshold > 0 &&
                update.risingThreshold < update.hotThreshold &&
                update.hotThreshold <= 100,
              "The Rising threshold must be above 0 and below the Hot threshold (max 100).",
            );
            const [, revision] = config.ranking.version.split("-");
            config.ranking = {
              version: `proposal-${Number(revision ?? 0) + 1}`,
              factors: update.factors,
              risingThreshold: update.risingThreshold,
              hotThreshold: update.hotThreshold,
              updatedAt: new Date().toISOString(),
              updatedBy: actor.name,
            };
            break;
          }
        }
        return config;
      },
      { service: SERVICE },
    ),
};
