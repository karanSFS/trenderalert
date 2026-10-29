import type { DirectoryUser } from "@/features/users/usersTypes";
import type { UserDirectoryService } from "@/services/contracts/backendServices";
import { ApiServiceError, apiRequest, listItems, pageQuery, toPaginated, utc } from "./http";

interface RawDirectoryUser {
  id?: string;
  user_id: string;
  email: string | null;
  phone_number: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  account_status: string;
  is_minor: boolean;
  age_verify_status: string;
  trender_score: number;
  admin_role: string | null;
  created_at: string;
}

const USERS = "/api/v1/admin/users";

const mapUser = (raw: RawDirectoryUser): DirectoryUser => ({
  id: raw.user_id ?? raw.id,
  email: raw.email,
  phone: raw.phone_number,
  username: raw.username,
  displayName: raw.display_name,
  avatarUrl: raw.avatar_url,
  accountStatus: raw.account_status,
  isMinor: raw.is_minor,
  ageVerifyStatus: raw.age_verify_status,
  trenderScore: raw.trender_score,
  adminRole: raw.admin_role,
  createdAt: utc(raw.created_at) ?? raw.created_at,
});

export const apiUserDirectoryService: UserDirectoryService = {
  list: async (query) => {
    const { status, minor } = query.filters ?? {};
    const raw = await apiRequest<unknown>(USERS, {
      query: {
        ...pageQuery(query.page, query.pageSize),
        q: query.search?.trim() || undefined,
        status,
        is_minor: minor === undefined ? undefined : minor === "yes",
      },
    });
    return toPaginated<RawDirectoryUser, DirectoryUser>(raw, query.page, query.pageSize, mapUser);
  },

  /** No single-user endpoint yet; the directory search matches user ids. */
  get: async (id) => {
    const raw = await apiRequest<unknown>(USERS, { query: { q: id, limit: 20 } });
    const match = listItems<RawDirectoryUser>(raw).find((item) => (item.user_id ?? item.id) === id);
    if (!match) throw new ApiServiceError("NOT_FOUND", `Member ${id} was not found.`);
    return mapUser(match);
  },
};
