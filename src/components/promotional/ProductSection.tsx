import { TREND_CARD_QUESTIONS } from "@/content/landing";
import { ProductPreview } from "./ProductPreview";
import { SectionHeading } from "./SectionHeading";
import section from "./section.module.css";
import styles from "./ProductSection.module.css";

export function ProductSection() {
  return (
    <section id="product" className={section.section} aria-labelledby="product-title">
      <div className={section.container}>
        <SectionHeading
          id="product-title"
          eyebrow="Product"
          title="Every Trend Card explains itself"
          lead="Switch between Near You, your city, nationwide and global to see how Radar surfaces what is rising, and why."
        />
        <div className={styles.layout}>
          <ProductPreview />
          <aside className={styles.questions} aria-labelledby="questions-title">
            <h3 id="questions-title" className={styles.questionsTitle}>
              Every Trend Card answers
            </h3>
            <ol className={styles.questionList}>
              {TREND_CARD_QUESTIONS.map((item) => (
                <li key={item.question}>
                  <strong>{item.question}</strong>
                  <span>{item.answer}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </section>
  );
}
