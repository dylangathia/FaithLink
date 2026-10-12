// Shapes of the rows defined in supabase/migrations/0001_churches_and_members.sql

export type ChurchRole = "owner" | "admin" | "leader" | "member";
export type MembershipStatus = "pending" | "active" | "removed";

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

export interface Church {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  logo_url: string | null;
  require_approval: boolean;
  created_at: string;
}

export interface Membership {
  church_id: string;
  user_id: string;
  role: ChurchRole;
  status: MembershipStatus;
  joined_via: "creator" | "invite" | "code";
  created_at: string;
}

export interface MembershipWithChurch extends Membership {
  church: Church;
}

export interface MemberWithProfile extends Membership {
  profile: Pick<Profile, "full_name" | "email" | "phone">;
}

export interface JoinCode {
  id: string;
  church_id: string;
  code: string;
  label: string;
  role: ChurchRole;
  requires_approval: boolean;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

export interface Invitation {
  id: string;
  church_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: ChurchRole;
  token: string;
  status: "pending" | "accepted" | "revoked";
  created_at: string;
}

export const ROLE_LABELS: Record<ChurchRole, string> = {
  owner: "Owner",
  admin: "Admin",
  leader: "Leader",
  member: "Member",
};

export const isAdminRole = (role: ChurchRole | null | undefined) => role === "owner" || role === "admin";
