"use client";

import { Segmented } from "antd";
import { useState } from "react";
import { PREVIEW_SCOPES, PREVIEW_TRENDS, type PreviewScope } from "@/content/landing";
import { PreviewTrendCard } from "./PreviewTrendCard";
import styles from "./ProductSection.module.css";

/** Scope switcher over the illustrative Trend Cards. */
export function ProductPreview() {
  const [scope, setScope] = useState<PreviewScope>("near");
  const trends = PREVIEW_TRENDS.filter((trend) => trend.scope === scope);
  const scopeLabel = PREVIEW_SCOPES.find((option) => option.value === scope)?.label ?? "";

  return (
    <div className={styles.preview}>
      <div className={styles.previewBar}>
        <div>
          <p className={styles.previewTitle}>What&apos;s starting to trend</p>
          <p className={styles.previewNote}>Illustrative example. Not live data.</p>
        </div>
        <Segmented<PreviewScope>
          aria-label="Geographic scope"
          value={scope}
          onChange={setScope}
          options={PREVIEW_SCOPES}
        />
      </div>
      <div className={styles.cards} aria-live="polite" aria-label={`${scopeLabel} Trends`}>
        {trends.map((trend) => (
          <PreviewTrendCard key={trend.id} trend={trend} />
        ))}
      </div>
    </div>
  );
}
