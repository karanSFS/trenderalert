import { notFound } from "next/navigation";

/** Every registered admin route has its own folder; anything else under /admin is a 404. */
export default function AdminCatchAllPage() {
  notFound();
}
