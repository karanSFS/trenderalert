import { HOW_IT_WORKS_STEPS } from "@/content/landing";
import { SectionHeading } from "./SectionHeading";
import section from "./section.module.css";
import styles from "./HowItWorksSection.module.css";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className={section.section} aria-labelledby="how-title">
      <div className={section.container}>
        <SectionHeading
          id="how-title"
          eyebrow="How it works"
          title="From first spark to lasting credit"
          lead="No long questionnaire, no friends required to get started."
        />
        <ol className={styles.steps}>
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.text}>{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
