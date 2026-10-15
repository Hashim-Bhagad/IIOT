# Deploy to Vercel

The deployable app is the `code/` folder. It contains all notes, question data, fonts, animation data and PDF references needed at runtime. The sibling Word documents and original PYQ folders are authoring sources and are not required on Vercel.

## Import the app repository

1. Push the contents of `code/` to your GitHub repository, including `package-lock.json`, `content/`, `public/` and `vercel.json`.
2. In Vercel, choose **Add New → Project**, then import that GitHub repository.
3. Use the **Next.js** preset. If the repository contains only the contents of `code/`, leave **Root Directory** at its default. If you pushed the entire parent workspace instead, select **code** as the Root Directory.
4. Click **Deploy**. No environment variables or database setup are required.

The checked-in configuration selects `npm ci` for installation and `npm run build` for the build. That build validates the weekly content and the full PYQ coverage record before compiling Next.js. Keep the Output Directory at its framework default.

Node.js is pinned to **24.x** in `package.json` and `.nvmrc`. Vercel supports that major version and installs its maintained minor/patch release. See [Vercel's Node.js version documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions) and [build/root-directory settings](https://vercel.com/docs/builds/configure-a-build).

## Check locally first

Run these from the app folder:

```bash
npm ci
npm run build
npm start
```

Open `/week/12` and `/pyqs`. The PYQ page should show the comparison totals and let you check an answer, open its explanation and view its original PDF.

The app is configured for the normal Next.js deployment on Vercel. Do not set the output to `public/`, and do not add a static HTML export override.

## Progress and updates

Study results are stored in browser local storage. The localhost app and the deployed domain have separate progress. Later commits to the connected branch trigger new Vercel deployments.

Local credentials, `.env*`, `.vercel/`, dependencies and build output are excluded by `.gitignore`. An example environment file can be committed if a future feature needs one.
