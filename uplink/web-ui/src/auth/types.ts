export type AuthResponse = {
  tokenDetail: {
    accessToken: string;
    refreshToken: string;
    status: string;
    session?: string;
  };
};

export interface AuthStorage extends Storage {
  refreshToken: string;
  status: string;
  uplinkAuth: string;
  uplinkAuthenticated: string;
  uplinkOrgSlug: string;
}
