The plugin is still in WIP

# Overview

This GitHub project provides a plugin for integrating Keycloak authentication with the Verdaccio registry. Verdaccio is a lightweight private npm proxy registry, and Keycloak is an open-source identity and access management solution. This plugin allows Verdaccio to use Keycloak for user authentication, enabling centralized user management and enhanced security for your npm registry.

# Introduction

This plugin allows Verdaccio to authenticate users through Keycloak, an open-source Identity and Access Management solution. By integrating with Keycloak, you can leverage its robust authentication and authorization features for managing your npm repository access.

## Prerequisites

- Node.js
- Verdaccio
- Keycloak server

# Installation

To install the Verdaccio Keycloak authentication plugin, run:

```bash
npm install -g verdaccio-keycloak
```

# Configuration

## **Verdaccio Configuration:**

Edit your Verdaccio configuration file (usually `config.yaml`) to include the Keycloak authentication plugin:

```yaml
auth:
  verdaccio-keycloak:
    url: "your_keycloak_url"
    realm: "your_realm"
    clientId: "your_clientId"
    clientSecret: "your_clientSecret"
```

## Keycloak Configuration

### Create a Realm

A realm in Keycloak is essentially a space where you manage objects, including users, applications, roles, and groups.

1. **Log in to Keycloak Admin Console:**
    - Open your Keycloak Admin Console in a web browser (`http://<your-keycloak-server>/auth/admin/`).
    - Log in with your admin credentials.
2. **Create a Realm:**
    - On the left menu, click on the drop-down menu next to the `Master` realm.
    - Select `Add realm`.
    - Enter a `Name` for your realm (e.g., `verdaccio-realm`).
    - Click `Create`.

### Create a Client

A client in Keycloak represents an application that wants to interact with Keycloak to authenticate users.

1. **Navigate to Clients:**
    - In your newly created realm, click on `Clients` in the left menu.
    - Click `Create`.
2. **Configure the Client:**
    - Enter a `Client ID` (e.g., `verdaccio-client`).
    - Choose `openid-connect` as the `Client Protocol`.
    - Set `Root URL` to the base URL of your Verdaccio instance (e.g., `http://localhost:4873`).
    - Click `Save`.
3. **Set Up Client Details:**
    - After saving, you will be taken to the client settings page.
    - Set `Access Type` to `confidential`.
    - Enable `Standard Flow Enabled`.
    - Set `Valid Redirect URIs` to the URLs that will handle authentication responses (e.g., `http://localhost:4873/*`).
    - Set `Base URL` and `Admin URL` if necessary.
    - Save your changes.
4. **Obtain Client Secret:**
    - Go to the `Credentials` tab of the client settings.
    - Copy the `Secret` value. This will be used in the Verdaccio configuration.

### Create a User

Users are individuals who need access to your application.

1. **Navigate to Users:**
    - In your realm, click on `Users` in the left menu.
    - Click `Add user`.
2. **Configure User Details:**
    - Enter a `Username` (e.g., `testuser`).
    - Fill in other optional fields like `Email`, `First Name`, and `Last Name`.
    - Click `Save`.
3. **Set User Credentials:**
    - After saving, go to the `Credentials` tab.
    - Set a password for the user.
    - Disable `Temporary` to make the password permanent.
    - Click `Set Password`.

### Create Groups

Groups in Keycloak are used to manage sets of users and their permissions.

1. **Navigate to Groups:**
    - Click on `Groups` in the left menu.
    - Click `New`.
2. **Create a Group:**
    - Enter a `Name` for the group (e.g., `verdaccio-users`).
    - Click `Save`.
3. **Assign Users to Groups:**
    - Click on the group name you just created.
    - Go to the `Members` tab.
    - Click `Add` to assign users to this group.
    - Select the users you want to add and click `Join`.

### Add Groups to Access Token

To include group membership information in the access token issued by Keycloak, you need to configure a `Client Scope`.

1. **Create a Client Scope:**
    - In the left menu, click on `Client Scopes`.
    - Click `Create`.
2. **Configure Client Scope:**
    - Enter a `Name` (e.g., `group-membership`).
    - Set the `Protocol` to `openid-connect`.
    - Click `Save`.
3. **Add a Mapper:**
    - After saving, go to the `Mappers` tab.
    - Click `Create`.
4. **Configure the Mapper:**
    - Enter a `Name` (e.g., `groups`).
    - Set `Mapper Type` to `Group Membership`.
    - Set `Token Claim Name` to `groups`.
    - Set `Full group path` to `false` if you want to include only the group names.
    - Click `Save`.
5. **Assign Client Scope to Client:**
    - Go back to your client settings (Clients -> `verdaccio-client`).
    - Go to the `Client Scopes` tab.
    - Add `group-membership` to `Assigned Default Client Scopes`.

# Usage

Once the plugin is installed and configured, users can authenticate using their Keycloak credentials when accessing the Verdaccio repository.

```bash
npm login --registry your_verdaccio_registry
```
