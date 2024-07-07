import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { AuthCallback, PluginOptions } from '@verdaccio/types';
import jwt from 'jsonwebtoken';
import KeycloakPlugin, { KeycloakConfig } from '../keycloak.plugin';

const mock = new MockAdapter(axios);

const config: KeycloakConfig = {
  url: 'http://keycloak.example.com',
  realm: 'example-realm',
  clientId: 'example-client-id',
  clientSecret: 'example-client-secret',
};



describe('KeycloakPlugin', () => {
  let plugin: KeycloakPlugin;

  beforeEach(() => {
    plugin = new KeycloakPlugin(config, {} as PluginOptions<{}>);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should authenticate user with correct credentials', async () => {
    const token = 'mock-access-token';
    const decodedToken = { groups: ['group1', 'group2'] };

    mock.onPost(`${config.url}/realms/${config.realm}/protocol/openid-connect/token`).reply(200, {
      access_token: token,
    });

    jest.spyOn(jwt, 'decode').mockReturnValue(decodedToken);

    const callback: AuthCallback = (err, groups) => {
      expect(err).toBeNull();
      expect(groups).toEqual(['group1', 'group2']);
    };

    const result = await plugin.authenticate('username', 'password', callback);
    expect(result).toBe(true);
  });

  it('should return false if authentication fails', async () => {

    mock.onPost(`${config.url}/realms/${config.realm}/protocol/openid-connect/token`).reply(401);

    const callback: AuthCallback = (err, groups) => {
      expect(err).not.toBeNull();
      expect(groups).toBe(false);
    };

    const result = await plugin.authenticate('username', 'wrong-password', callback);
    expect(result).toBe(false);

  });

  it('should return false if there is an error during authentication', async () => {
    mock.onPost(`${config.url}/realms/${config.realm}/protocol/openid-connect/token`).networkError();

    const callback: AuthCallback = (err, groups) => {
      expect(err).not.toBeNull();
      expect(groups).toEqual(false);
    };

    const result = await plugin.authenticate('username', 'password', callback);
    expect(result).toBe(false);
  });

  it('should fetch user groups from token', async () => {
    const token = 'mock-access-token';
    const decodedToken = { groups: ['group1', 'group2'] };

    jest.spyOn(jwt, 'decode').mockReturnValue(decodedToken);

    const groups = await plugin.fetchUserGroups(token);
    expect(groups).toEqual(['group1', 'group2']);
  });

  it('should return false if token is invalid', async () => {
    const token = 'invalid-token';

    jest.spyOn(jwt, 'decode').mockReturnValue(null);

    const groups = await plugin.fetchUserGroups(token);
    expect(groups).toBe(false);
  });
});
