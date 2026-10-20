// Writes a StackBlitz project for each docs example, so its "Open in StackBlitz" button can post
// it to https://stackblitz.com/run. Each project is a minimal Angular CLI app that installs
// bootstrap-ng from npm (the `next` dist-tag) and renders the example as its root component.
// The files land in projects/docs/public/stackblitz/<example selector>.json (ignored by git),
// so run this before `ng build docs` or `ng serve docs`.
// Usage: node scripts/stackblitz.mjs [--out projects/docs/public/stackblitz]
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    out: { type: 'string', default: 'projects/docs/public/stackblitz' },
  },
});

const SOURCE = 'projects/docs/src';
const PUBLIC = 'projects/docs/public';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const versions = { ...pkg.dependencies, ...pkg.devDependencies };

/** Pins a dependency to the version range the docs use. */
const pick = (...names) => Object.fromEntries(names.map((name) => [name, versions[name]]));

const packageJson = {
  name: 'bootstrap-ng-example',
  version: '0.0.0',
  private: true,
  scripts: { ng: 'ng', start: 'ng serve' },
  dependencies: {
    ...pick(
      '@angular/common',
      '@angular/compiler',
      '@angular/core',
      '@angular/forms',
      '@angular/platform-browser',
      '@angular/router',
      '@floating-ui/dom',
      'bootstrap',
      'rxjs',
      'tslib',
    ),
    'bootstrap-ng': 'next',
  },
  devDependencies: pick('@angular/build', '@angular/cli', '@angular/compiler-cli', 'typescript'),
};

const angularJson = {
  $schema: './node_modules/@angular/cli/lib/config/schema.json',
  version: 1,
  cli: { analytics: false },
  newProjectRoot: 'projects',
  projects: {
    example: {
      projectType: 'application',
      root: '',
      sourceRoot: 'src',
      architect: {
        build: {
          builder: '@angular/build:application',
          options: {
            browser: 'src/main.ts',
            tsConfig: 'tsconfig.json',
            assets: [{ glob: '**/*', input: 'public' }],
            styles: ['node_modules/bootstrap/dist/css/bootstrap.min.css'],
          },
          configurations: {
            development: { optimization: false, extractLicenses: false, sourceMap: true },
          },
          defaultConfiguration: 'development',
        },
        serve: {
          builder: '@angular/build:dev-server',
          configurations: { development: { buildTarget: 'example:build:development' } },
          defaultConfiguration: 'development',
        },
      },
    },
  },
};

const tsconfigJson = {
  compilerOptions: {
    strict: true,
    noImplicitOverride: true,
    noPropertyAccessFromIndexSignature: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    skipLibCheck: true,
    isolatedModules: true,
    experimentalDecorators: true,
    importHelpers: true,
    target: 'ES2022',
    module: 'preserve',
  },
  angularCompilerOptions: {
    strictInjectionParameters: true,
    strictInputAccessModifiers: true,
    strictTemplates: true,
  },
  files: ['src/main.ts'],
};

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

/** Example sources in `dir` and its subfolders. */
function* exampleFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* exampleFiles(path);
    } else if (basename(dir) === 'examples' && entry.name.endsWith('.ts')) {
      yield path;
    }
  }
}

/** The example's own files: its source, its template and the local modules it imports. */
function sourceFiles(path, files = new Map()) {
  const name = basename(path);
  if (files.has(name)) {
    return files;
  }
  const code = readFileSync(path, 'utf8');
  files.set(name, code);
  const dir = dirname(path);
  for (const [, url] of code.matchAll(/templateUrl: '\.\/([^']+)'/g)) {
    files.set(url, readFileSync(join(dir, url), 'utf8'));
  }
  for (const [, module] of code.matchAll(/from '\.\/([^']+)'/g)) {
    sourceFiles(join(dir, `${module}.ts`), files);
  }
  return files;
}

/** Files from the docs' public folder that the example's templates use, such as avatar.svg. */
function publicFiles(templates) {
  return readdirSync(PUBLIC, { withFileTypes: true })
    .filter((entry) => entry.isFile() && templates.some((html) => html.includes(entry.name)))
    .map((entry) => entry.name);
}

rmSync(values.out, { recursive: true, force: true });
mkdirSync(values.out, { recursive: true });

let count = 0;
for (const path of exampleFiles(SOURCE)) {
  const code = readFileSync(path, 'utf8');
  // A file can declare helper components, such as the dialog that dialog/examples/service.ts
  // opens, so write a project for each component, rendering that one.
  // Modules such as table/examples/employees.ts hold shared data and have none.
  for (const [, selector, className] of code.matchAll(
    /@Component\(\{[\s\S]*?selector: '([^']+)'[\s\S]*?export class (\w+)/g,
  )) {
    writeProject(path, selector, className);
    count++;
  }
}

if (count === 0) {
  throw new Error(`No examples found in ${SOURCE}`);
}
console.log(`Wrote ${count} StackBlitz projects to ${values.out}`);

/** Writes the project that renders the component `className` from the example at `path`. */
function writeProject(path, selector, className) {
  const sources = sourceFiles(path);
  const module = basename(path, '.ts');
  const template = [...sources.keys()].find((name) => name.endsWith('.html'));
  const files = {
    'package.json': json(packageJson),
    'angular.json': json(angularJson),
    'tsconfig.json': json(tsconfigJson),
    'src/index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>bootstrap-ng example</title>
  </head>
  <body class="p-7">
    <${selector}></${selector}>
  </body>
</html>
`,
    'src/main.ts': `import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ${className} } from './app/${module}';

bootstrapApplication(${className}, { providers: [provideRouter([])] }).catch((err: unknown) => {
  console.error(err);
});
`,
  };
  for (const [name, source] of sources) {
    files[`src/app/${name}`] = source;
  }
  const templates = [...sources].filter(([name]) => name.endsWith('.html')).map(([, s]) => s);
  for (const name of publicFiles(templates)) {
    files[`public/${name}`] = readFileSync(join(PUBLIC, name), 'utf8');
  }
  // docs-alert-basic-example becomes "Alert basic example".
  const words = selector.replace(/^docs-/, '').replaceAll('-', ' ');
  const project = {
    title: `${words[0].toUpperCase()}${words.slice(1)}`,
    description: 'A bootstrap-ng example from https://bootstrap-ng.com',
    openFile: `src/app/${template ?? `${module}.ts`}`,
    files,
  };
  writeFileSync(join(values.out, `${selector}.json`), JSON.stringify(project));
}
