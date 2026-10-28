import { AndroidFilled, AppleFilled } from "./icons";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/constants/publicSite";
import styles from "./CallToAction.module.css";

const STORES = [
  { key: "ios", label: "iOS", icon: <AppleFilled />, url: APP_STORE_URL },
  { key: "android", label: "Android", icon: <AndroidFilled />, url: GOOGLE_PLAY_URL },
];

/** Store badges become links only once approved URLs are configured in publicSite.ts. */
export function AppAvailability() {
  return (
    <ul className={styles.stores} aria-label="App availability">
      {STORES.map((store) =>
        store.url ? (
          <li key={store.key}>
            <a className={styles.store} href={store.url} target="_blank" rel="noopener noreferrer">
              <span aria-hidden="true">{store.icon}</span>
              Get it for {store.label}
            </a>
          </li>
        ) : (
          <li key={store.key} className={`${styles.store} ${styles.storePending}`}>
            <span aria-hidden="true">{store.icon}</span>
            Coming to {store.label}
          </li>
        ),
      )}
    </ul>
  );
}
