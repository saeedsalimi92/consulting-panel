# consulting-panel production

This project uses **Nuxt 3.16.2 with ssr: false** (client-rendered panel). The deployment deliberately preserves this setting. GitHub Actions runs unit tests and builds Nuxt on Node 22, then publishes the complete `.output` as an artifact.

On the server, a dedicated Node/Nitro process serves the output at `127.0.0.1:3200` behind the host Nginx. This is not SSR-rendering; it is a Node-hosted SPA. A static Nginx-only deployment is also possible but is not configured here.

## Provisioning and enablement

1. Check disk capacity and confirm port 3200 is free.
2. Install a compatible Node.js 22 runtime and verify `command -v node`. Adapt ExecStart if needed.
3. Create service user `consulting-panel`, deployment identity with write permissions limited to `/var/www/consulting/panel/releases` and symlink access within `/var/www/consulting/panel`, plus read permissions for the service identity.
4. Install `consulting-panel.service` into systemd, adapt users/paths, then `systemctl daemon-reload` and enable the service when an initial release exists.
5. Give the deploy identity passwordless sudo permission **only** for `systemctl restart consulting-panel.service`, using a narrowly-scoped sudoers rule; never grant unrestricted root.
6. Configure host Nginx and HTTPS using the example, checking `nginx -t` before reload.
7. Configure `/etc/consulting/panel.env` with `NUXT_PUBLIC_API_BASE=https://YOUR_API_DOMAIN/api`. This is public configuration, not a place for private API keys.
8. Set GitHub repository **variable** `NUXT_PUBLIC_API_BASE` to the correct public API address. Set repository **secrets** `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS` (verify host key fingerprint out of band). Optionally require approvals for the GitHub `production` environment.
9. Only after server readiness and a successful build, set repository **variable** `ENABLE_PRODUCTION_DEPLOY=true`.

Before enabling, pushes to `production` only test and build, without changing the server. The deploy job transfers each build to `/var/www/consulting/panel/releases/<sha>`, atomically updates `current`, restarts only `consulting-panel`, and checks its homepage. If restart or healthcheck fails, it attempts to restore the prior release. Releases remain for manual cleanup and rollback.

No existing server applications or Docker containers are changed by the workflow. Running the build and deployment workflows successfully is not yet verified.
