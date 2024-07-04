import axios from "axios";
import qs from "qs";
import { AuthCallback, IPluginAuth, PluginOptions } from "@verdaccio/types";

interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  clientSecret: string;
}

class KeycloakPlugin implements IPluginAuth<{}> {
  private config: KeycloakConfig;
  private token: string | null = null;

  constructor(config: KeycloakConfig, options: PluginOptions<{}>) {
    this.config = config;
  }

  authenticate(
    username: string,
    password: string,
    cb: AuthCallback,
  ): Promise<boolean> {
    console.log("u&p", username, password);
    const tokenEndpoint = `${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/token`;

    return new Promise<boolean>(async (resolve, reject) => {
      try {
        const data = qs.stringify({
          grant_type: "password",
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          username: username,
          password: password,
        });

        const response = await axios.post(tokenEndpoint, data, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        if (response.status !== 200) {
          console.error(`Failed to authenticate: ${response.status}}`);
          cb(null, false);
          return resolve(false);
        } else {
          const json: { access_token: string } =
            await response.data.access_token;
          this.token = json.access_token;
          console.log("Authentication successful");
          const groups = await this.fetchUserGroups(username);
          cb(null, ["groups"]);
          return resolve(true);
        }
      } catch (error: any) {
        cb(error, ["authenticated"]);
        console.error("Error during authentication:", error);
        return resolve(false);
      }
    });
  }

  async fetchUserGroups(username: string): Promise<string[]> {
    try {
      const userProfileUrl = `${this.config.url}/admin/realms/${this.config.realm}/users?username=${encodeURIComponent(username)}`;

      const response = await axios.get(userProfileUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to get user profile:", error);
      throw error;
    }
  }

  getToken(): string | null {
    return this.token;
  }
}

export default KeycloakPlugin;
