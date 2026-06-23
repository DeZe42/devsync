# Devsync

# DevSync: Engineering Metrics & Productivity Platform

## Project Overview
DevSync is an enterprise-grade, full-stack application designed to aggregate, analyze, and visualize engineering productivity metrics. By synchronizing repository data and evaluating Pull Requests, DevSync provides actionable insights into team performance, code quality, and delivery speed (focusing on DORA metrics like Lead Time).

Beyond standard data visualization, DevSync features a custom-built Artificial Intelligence module that analyzes structural patterns in Pull Requests to proactively predict deployment risks.

## Core Features
* **Data Synchronization Engine:** Asynchronous background processing to fetch and normalize Pull Request data from external Git providers without blocking the main event loop.
* **Advanced Metric Calculation:** Automated tracking of developer productivity metrics, specifically focusing on `lead time`, PR `status` lifecycles, and `author` performance analytics.
* **Real-Time Analytics Dashboard:** A modern, reactive SPA providing live data visualizations, updated instantly via WebSockets as background synchronizations complete.
* **AI-Powered PR Risk Predictor:** A custom-built neural network architecture that processes 4 distinct input values from a given Pull Request to output a binary (Yes/No) decision, predicting the likelihood of the PR breaking the build or introducing critical bugs.

## Architecture & Tech Stack
This project is built using a modern, scalable Monorepo architecture managed by **Nx**, ensuring strict boundary enforcement and code sharing between the frontend and backend.

### Backend (NestJS v11)
* **Framework:** NestJS (TypeScript) utilizing enterprise design patterns (Dependency Injection, Repository Pattern, CQRS).
* **Database:** PostgreSQL.
* **ORM:** TypeORM for complex data modeling and persistence (e.g., `PullRequestEntity`).
* **Async Processing:** Redis & BullMQ for handling heavy background synchronization tasks.
* **Real-time Communication:** WebSockets (Socket.io).

### Frontend (Angular v21)
* **Framework:** Angular strictly utilizing Standalone Components (no NgModules).
* **State Management:** Angular Signals for highly optimized, reactive state updates.
* **Data Visualization:** Chart.js / ECharts integration.

### Shared Infrastructure
* **Shared Libraries:** Internal Nx libraries (e.g., `@devsync/shared-types`) to guarantee 100% type safety and contract synchronization between the Angular client and NestJS API.
* **Quality Assurance:** * Unit & Integration Testing: **Jest** (Targeting 80%+ coverage for business logic).
    * End-to-End Testing: **Playwright**.
    * Strict linting (ESLint) and formatting (Prettier).

## CI/CD Pipeline & DevOps
The repository enforces strict quality gates utilizing **GitHub Actions**:
* **Parallel Execution:** Linting, Unit Testing, and Building processes run concurrently across isolated Ubuntu containers.
* **Optimized Caching:** Implements advanced `actions/cache` for `node_modules` and the Nx computation cache to achieve sub-minute pipeline executions.
* **Security & Integrity:** Automated `npm audit` blocking high-severity vulnerabilities, paired with strict `npm ci` dependency resolution.
* **Branch Protection:** Main branch is locked behind mandatory Pull Request reviews and successful automated status checks.

## 🗄️ Domain Model Highlights
The core of the data layer resolves around tracking code changes. The primary model, `PullRequestEntity`, is designed to store complex metadata:
* `author`: The developer initiating the change.
* `status`: The current lifecycle stage of the PR (Open, Merged, Closed, Draft).
* `lead time`: The calculated duration from the first commit to the final merge.

## 👤 Author
**Zsolt Denes**
Software Developer

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Run tasks

To run the dev server for your app, use:

```sh
npx nx serve frontend
```

To create a production bundle:

```sh
npx nx build frontend
```

To see all available targets to run for a project, run:

```sh
npx nx show project frontend
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/angular:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/angular:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
