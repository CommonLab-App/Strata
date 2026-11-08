# Strata

A free, open-source browser app for self-learning introductory physical geology: interactive explorers, virtual
labs and live real-world data, laid out as a sixteen-week course with two optional extension weeks. It is the
geology counterpart of [Valence](https://github.com/zebadrabbit/Valence), and shares its shell.

There are no accounts: progress is saved in the browser. Live data is fetched from public sources and cached
in the browser for a short time; every live layer names its source and when it was fetched.

## Development

Requires Node 22.22 or later 22, Node 24, or Node 26 or newer.

    npm install
    npm run dev      # start the app locally
    npm run build    # lint, test, type-check and build to dist/

| Command | What it does |
|---|---|
| `npm test` | Runs the tests. |
| `npm run lint` | Checks the architecture rules: data and engine code stay pure; network only in adapters. |
| `npm run typecheck` | Type-checks the project. |

## Documents

- [Plan](docs/PLAN.md), [phase specs](docs/specs/), [decisions](docs/DECISIONS.md), [data sources](docs/DATA-SOURCES.md).
- [CHANGELOG](CHANGELOG.md).

## License

MIT, like Valence.
