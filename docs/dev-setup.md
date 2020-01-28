## Development Setup

1.  Install latest LTS version of Node `https://nodejs.org/en/download`.
2.  Install yarn package manager `https://yarnpkg.com/en/docs/install`. Alternatively, you can replace any `yarn` command with `npm`.
3.  Fork the upstream repo `https://github.com/box/box-annotations`.
4.  Clone your fork locally `git clone git@github.com:[YOUR GITHUB USERNAME]/box-annotations.git`.
5.  Navigate to the cloned folder `cd box-annotations`
6.  Add the upstream repo to your remotes `git remote add upstream git@github.com:box/box-annotations.git`.
7.  Verify your remotes are properly set up `git remote -v`. You should pull updates from the Box repo `upstream` and push changes to your fork `origin`.
8.  Install dependencies `yarn install`
9.  Test your first build! `yarn build`
10. To test only local annotation changes, see [instantiating a custom instance of Box Annotations](https://github.com/box/box-annotations/#passing-an-instance-of-box-annotations-into-box-content-preview).
11. To link and test your local code changes along with your local Preview changes, run `yarn link` in this repository and `yarn link box-annotations` wherever [Box Content Preview](github.com/box/box-content-preview/) is cloned locally.
12. To automatically rsync files after a Webpack build, add a scripts/rsync.json file with a `location` field. This file should look like:

```
{
    "location": "YOUR_DESIRED_RSYNC_LOCATION_HERE"
}
```

## While Developing

Install the following plugins in your preferred editor

- Editor Config (standardizes basic editor configuration)
- ESLint (Javascript linting)
- Prettier & Prettier - ESLint (Automatic Javascript formatting following ESLint config)
- Stylelint (CSS linting)

### Yarn commands

- `yarn build` to generate resource bundles and JS webpack bundles.
- `yarn start` to only generate JS webpack bundles on file changes.
- `yarn test` launches Jest.
- `yarn test:watch` launches Jest for debugging.

For more script commands see `package.json`. Test coverage reports are available under reports/coverage.
