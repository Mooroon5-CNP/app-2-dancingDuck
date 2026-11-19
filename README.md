# Dancing Duck

The non-secret demo variable `CHANGE` is defined in `.env` and displayed in a small badge at the top right of the home page. The production image copies this file and loads it when Node starts. A runtime `CHANGE` environment variable takes precedence over `.env`, so a later platform variable can override the demo value without changing the application code.

To change the built-in demo value, edit `.env`, run `npm run lint` and `npm test`, then promote the application through `main` and `prod`. Do not put credentials in this file: it is committed to Git and included in the image.
