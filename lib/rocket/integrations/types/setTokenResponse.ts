export default interface setTokenResponse {
  newTokens: boolean,
  tokens: {
    refresh_token: string,
  },
}