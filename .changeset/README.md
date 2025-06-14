# Changesets

This directory contains changesets for the monorepo. Changesets are used to manage package versions and create changelogs.

## How to use

1. When you make changes to any package, you should create a changeset by running:

```bash
bun run changeset:add
```

This will guide you through creating a changeset:
- Select which packages have changed
- Choose the type of change for each package (major, minor, patch)
- Write a summary and description of the changes

2. When you're ready to release a new version, run:

```bash
bun run version
```

This will update all package versions based on the changesets and generate changelogs.

3. To publish the packages, run:

```bash
bun run publish
```

## Version types

- **major** (1.0.0 -> 2.0.0): Breaking changes
- **minor** (1.0.0 -> 1.1.0): New features, no breaking changes
- **patch** (1.0.0 -> 1.0.1): Bug fixes, no breaking changes

## For more information

See the [Changesets documentation](https://github.com/changesets/changesets)
