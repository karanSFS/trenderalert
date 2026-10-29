import type { OperationsSnapshot } from "@/features/operations/operationsTypes";
import type { OperationsService } from "@/services/contracts/operationalServices";
import { assertEligible, assertValid, db } from "./db";
import { mockRequest } from "./mockDelay";

const SERVICE = "operations";

function snapshot(): OperationsSnapshot {
  const { abuseSignals, ...rest } = db.operations;
  return {
    ...rest,
    backlog: {
      openSupportCases: db.support.filter((item) => item.status !== "resolved").length,
      openFinancialExceptions: db.reconciliation.filter((item) => item.status !== "resolved")
        .length,
      abuseSignals,
    },
  };
}

export const mockOperationsService: OperationsService = {
  getSnapshot: () => mockRequest(snapshot, { service: SERVICE }),

  acknowledgeIncident: (id, actor) =>
    mockRequest(
      () => {
        const incident = db.operations.incidents.find((item) => item.id === id);
        assertValid(Boolean(incident), `Incident ${id} was not found.`);
        assertEligible(
          incident!.status !== "resolved",
          "Resolved incidents cannot be acknowledged.",
        );
        assertEligible(!incident!.acknowledgedBy, "This incident is already acknowledged.");
        incident!.acknowledgedBy = actor.name;
        return snapshot();
      },
      { service: SERVICE },
    ),
};
