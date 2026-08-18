# NAGI v0 Deployment

GitHub Pages source is configured to use GitHub Actions.

The deployment workflow lives at `.github/workflows/pages.yml` and publishes the static Web/PWA shell from `main`.

This file also serves as the first post-activation push so the Pages workflow is triggered after Pages has been enabled for the repository.
