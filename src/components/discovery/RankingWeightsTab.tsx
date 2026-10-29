"use client";

import { Alert, Button, Input, InputNumber } from "antd";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ErrorState } from "@/components/ui/ErrorState";
import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { selectFeatureFlags } from "@/features/moduleSelectors";
import { fetchFeatureFlags, saveFeatureFlag } from "@/features/platform/platformSlices";
import { RANKING_FLAG_KEY } from "@/features/platform/platformTypes";
import { formatDateTime } from "@/lib/formatters/date";
import { humanizeCode } from "@/lib/formatters/text";
import { useAdminLabel } from "@/lib/hooks/useAdminLabel";
import { useApiAction } from "@/lib/hooks/useApiAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const Banner = styled(Alert)`
  margin-bottom: ${({ theme }) => theme.space(4)};
`;

const Factors = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(3)};
  max-width: 560px;
`;

const FactorRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space(3)};
`;

const Total = styled.div<{ $valid: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.space(3)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 650;
  color: ${({ $valid, theme }) => ($valid ? theme.colors.textPrimary : theme.colors.error)};
`;

const Actions = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space(3)};
  max-width: 560px;
  margin-top: ${({ theme }) => theme.space(5)};

  small {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space(2)};
`;

/** Payload keys that hold percent weights, e.g. `velocity_weight_pct`. */
const isWeightKey = (key: string) => key.endsWith("_weight_pct");
const factorLabel = (key: string) => humanizeCode(key.replace(/_weight_pct$/, ""));

/**
 * Edits the live TrendScore weights stored in the `RANKING_ALGORITHM_V14` feature flag.
 * Weights must total 100%. Other settings in the flag are kept unchanged.
 */
export function RankingWeightsTab({ canManage }: { canManage: boolean }) {
  const dispatch = useAppDispatch();
  const { data, status, error, save } = useAppSelector(selectFeatureFlags);
  const adminLabel = useAdminLabel();
  const { run } = useApiAction();
  const flag = data?.find((item) => item.key === RANKING_FLAG_KEY) ?? null;

  const saved = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(flag?.payload ?? {})
          .filter(([key, value]) => isWeightKey(key) && typeof value === "number")
          .map(([key, value]) => [key, value as number]),
      ),
    [flag],
  );
  const [weights, setWeights] = useState<Record<string, number>>(saved);
  const [justification, setJustification] = useState("");
  const [seen, setSeen] = useState(saved);
  if (seen !== saved) {
    setSeen(saved);
    setWeights(saved);
  }

  useEffect(() => {
    if (!data && status === "idle") dispatch(fetchFeatureFlags());
  }, [data, status, dispatch]);

  if (!data) {
    if (status === "failed")
      return (
        <ErrorState
          title="Ranking weights could not be loaded"
          message={error?.message}
          onRetry={() => dispatch(fetchFeatureFlags())}
        />
      );
    return <SectionCard title="Ranking weights">Loading…</SectionCard>;
  }

  if (!flag || Object.keys(saved).length === 0) {
    return (
      <SectionCard title="Ranking weights">
        <Alert
          type="info"
          showIcon
          title="No ranking weights found"
          description={`The backend has no ${RANKING_FLAG_KEY} flag with weight settings.`}
        />
      </SectionCard>
    );
  }

  const keys = Object.keys(saved);
  const total = Math.round(keys.reduce((sum, key) => sum + (weights[key] ?? 0), 0) * 100) / 100;
  const dirty = keys.some((key) => weights[key] !== saved[key]);
  const reasonValid = justification.trim().length >= 10;
  const saving = save.status === "loading";

  return (
    <SectionCard
      title="TrendScore weights"
      extra={
        <StatusBadge
          label={flag.enabled ? "Live" : "Flag off"}
          tone={flag.enabled ? "success" : "neutral"}
        />
      }
    >
      <Banner
        type="info"
        showIcon
        title={`Stored in the ${RANKING_FLAG_KEY} feature flag`}
        description="Changes apply to the live ranking as soon as they are saved. Weights must total 100%."
      />
      <Factors>
        {keys.map((key) => (
          <FactorRow key={key}>
            <span>{factorLabel(key)}</span>
            <InputNumber
              aria-label={`${factorLabel(key)} weight`}
              min={0}
              max={100}
              step={1}
              precision={1}
              suffix="%"
              disabled={!canManage}
              value={weights[key]}
              onChange={(next) => setWeights((current) => ({ ...current, [key]: next ?? 0 }))}
            />
          </FactorRow>
        ))}
        <Total $valid={total === 100} aria-live="polite">
          <span>Total</span>
          <span>{total}%</span>
        </Total>
      </Factors>
      {total !== 100 ? (
        <Banner
          type="error"
          showIcon
          title={`Weights must add up to 100% (currently ${total}%).`}
        />
      ) : null}
      <Actions>
        {canManage ? (
          <>
            <Input.TextArea
              aria-label="Justification"
              placeholder="Justification for the audit log (at least 10 characters)"
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={500}
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
              disabled={!dirty}
            />
            <Buttons>
              <Button
                type="primary"
                loading={saving}
                disabled={!dirty || total !== 100 || !reasonValid}
                onClick={async () => {
                  try {
                    await run(
                      dispatch(
                        saveFeatureFlag({
                          key: flag.key,
                          enabled: flag.enabled,
                          regions: flag.regions,
                          payload: { ...flag.payload, ...weights },
                          justification: justification.trim(),
                        }),
                      ).unwrap(),
                      { success: "Ranking weights saved", after: () => setJustification("") },
                    );
                  } catch {
                    // The error is shown below from the save state.
                  }
                }}
              >
                Save weights
              </Button>
              <Button disabled={!dirty || saving} onClick={() => setWeights(saved)}>
                Discard changes
              </Button>
            </Buttons>
            {save.status === "failed" && save.error ? (
              <Alert type="error" showIcon title={save.error.message} />
            ) : null}
          </>
        ) : null}
        <small>
          Last updated {formatDateTime(flag.updatedAt)} by {adminLabel(flag.updatedBy)}
        </small>
      </Actions>
    </SectionCard>
  );
}
