export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Compact form of a long backend id for tables, e.g. "11111111…0001". */
export function shortId(id: string | null | undefined): string {
  if (!id) return "—";
  return id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

/** "SYSTEM_BOOTSTRAP_INITIALIZATION" -> "System bootstrap initialization". */
export function humanizeCode(code: string): string {
  const words = code
    .replace(/[_.-]+/g, " ")
    .trim()
    .toLowerCase();
  return words ? words[0].toUpperCase() + words.slice(1) : code;
}

/** "jordan.reyes@x.com" -> "jo*********@x.com". */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  if (!domain) return `${email.slice(0, 2)}***`;
  return `${local.slice(0, 2)}${"*".repeat(Math.max(3, local.length - 2))}@${domain}`;
}

/** "+917983139329" -> "+91******9329". */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  if (phone.length <= 6) return "***";
  return `${phone.slice(0, 3)}${"*".repeat(phone.length - 7)}${phone.slice(-4)}`;
}
