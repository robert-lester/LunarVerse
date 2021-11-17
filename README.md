# LunarVerse

LunarVerse is Lunar's SaaS monorepo. To understand why we adopted this pattern, please see [Becoming One With the LunarVerse](https://docs.google.com/presentation/d/1D7Cp2UtDuWkApHtEDedU3vgYf9Hm4vpsiA1xzpPQCPA/edit#slide=id.p).

## Table of Contents (TODO)

## File Structure

```sh
├── /cli                                # Global CLI
├──── package.json                      # CLI dependencies
├── /config                             # Global configuration variables
├── /core                               # Auth and user management
├──── package.json                      # Core dependencies
├── /lib                                # Global code sharing
├── /shuttle                            # Shuttle application
├──── /api                              # Shuttle API
├──── package.json                      # Shuttle API dependencies (TODO: relocate)
├── /telescope                          # Telescope API (TODO: deprecate)
├──── /client                           # Telescope JS client
├────── package.json                    # Telescope JS client dependencies
├──── package.json                      # Telescope API dependencies
├── /uplink                             # Uplink application
├──── /api                              # Uplink API
├────── package.json                    # Uplink API dependencies
├──── /lib                              # Uplink code sharing
├──── /web-ui                           # Uplink React UI
├────── package.json                    # Uplink React UI dependencies
├──── package.json                      # Uplink shared dependencies
└── package.json                        # Global shared depdendencies
```

## Getting Started

**Note:** Before starting, ensure your `[default]` entry in your `~/.aws/credentials` file is set to the Lunar sub-account.

1. Clone this repo.
2. Install all dependencies in `LunarVerse` and `LunarVerse/cli`.
3. From the root, decrypt your environment variables using `yarn decrypt`.
4. Follow the directions below for the relevant app you're working in.

## Stage Compatibility

| X | `staging` | `qa` | `production` | `uplink-prod` |
| --- | --- | --- | --- | --- |
| AWS account | `lunar` | `lunar` | `lunar` | `uplink` |
| Core | + | + | + | + |
| Shuttle | + | + | + | |
| Telescope | + | + | + | |
| Uplink | + | + | | + |

## CLI (TODO)

## Config (TODO)

## Core (TODO)

## Lib (TODO)

## Shuttle (TODO)

## Telescope (TODO)

## Uplink

[Active Development Board](https://trello.com/b/h68adAvC/products-uplink-active-development)
[Backlog Board](https://trello.com/b/XfhctZAZ/uplink-backlog)

### The Uplink Workflow

### Running the API Locally

1. First, ensure all dependencies are installed in `LunarVerse/uplink`, `LunarVerse/uplink/api`, and `LunarVerse/uplink/web-ui`.
2. From `LunarVerse/uplink/api`, run `serverless offline start --stage=<stage>[ --port=<port:3000>]`.
3. Wait for Serverless to come up and make the API locally available.

**Note:** If you intend to run a local instance of the Web UI against your local API:

1. Start a new terminal instance.
2. Follow [Running the Web UI Locally](#running-the-web-ui-locally) below, replacing the `.env` variable `REACT_APP_API_URL` with `http://localhost:<port>`.

### Running the Web UI Locally

1. First, ensure all dependencies are installed in `LunarVerse/uplink`, `LunarVerse/uplink/api`, and `LunarVerse/uplink/web-ui`.
2. Ensure `LunarVerse/uplink/web-ui/.env` is configured correctly. `REACT_APP_API_URL` and `REACT_APP_CORE_URL` should point to valid API URLs (TODO: Use global config).
3. From `LunarVerse/uplink/web-ui`, run `yarn start`.
4. Wait for the UI to come up in your browser.

#### Uplink Feature Workflow

1. Create a feature branch by branching off `master`.
2. Write and commit changes to your branch.
  * Commit messages should follow the format `feat|fix|infra(app) Short description`.
3. Push your feature branch up to `origin`.
4. Open a PR against `staging` in the GitHub Web UI.
  * Be sure to add relevant reviewers and notify them of the PR.
5. After tests pass and changes are approved, the PR can be merged.
6. CircleCI will deploy the feature to `staging` (TODO: Include frontend in this).

#### Uplink Hotfix Workflow

1. Create a hotfix branch by branching off `master`.
2. Write and commit changes to your branch.
  * Commit messages should follow the format `feat|fix|infra(app) Short description`.
3. Push your feature branch up to `origin`.
4. Open a PR against `master` in the GitHub Web UI.
5. After changes are approved, the PR can be merged. Skip to [Releasing](#releasing) below.

#### Testing a Release

**Note**: Releases should be tested by QA as a unit. Don't follow these steps until all code for the sprint is in.

1. Open a PR against `qa` from `staging` in the GitHub Web UI.
2. After tests pass, the PR can be merged.
3. CircleCI will deploy the release to `qa` (TODO: Include frontend in this).

If the release fails QA review, repeat the feature workflow, but start by branching off `qa`. Do this until the release passes.

#### Releasing

After passing QA review:

1. Pull down `qa`.
2. Bump the version number in `LunarVerse/uplink/package.json` according to Semantic Versioning and commit it.
3. Tag the release using `git tag -a <version> -m <description>`.
4. Push your commit and tag up to `qa`.
5. Open a PR against `master` from `qa`.
6. After final sign-off, the PR can be merged.

##### Deploying the Backend Manually (TODO: Work this in to CircleCI):

1. Pull down `master`.
2. Deploy using `serverless deploy --stage=uplink-prod`.

##### Deploying the Frontend Manually (TODO: Work this in to CircleCI):

**Note:** Make sure the `.env` is configured to point to the live URLs before deploying.

1. Pull down `master`.
2. Build the package using `yarn build`.
3. Go to the AWS Dashboard and navigate to the Uplink UI S3 bucket.
4. Drag the contents of the `LunarVerse/uplink/web-ui/static` folder onto the screen.
5. Upload the files (ensure public read access is enabled).

## Troubleshooting (TODO)