import KeycloakAuthenticator from "./keycloak.plugin";

export default function (config: any, options: any) {
  return new KeycloakAuthenticator(config, options);
}
