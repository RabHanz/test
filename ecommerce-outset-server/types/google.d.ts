declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        requestAccessToken(): void;
      }

      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
      }

      interface TokenResponse {
        access_token: string;
        token_type: string;
        expires_in: number;
        scope: string;
        error?: string;
        credential?: string;
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;
    }
  }
} 