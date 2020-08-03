import { getPackagesSync } from '@lerna/project';
import filterPackages from '@lerna/filter-packages';
import batchPackages from '@lerna/batch-packages';
import minimist from 'minimist';
import path from 'path';
import typescript from 'rollup-plugin-typescript2';

/**
 * @param {string}[scope] - packages to only build (if you don't
 *    want to build everything)
 * @param {string}[ignore] - packages to not build
 *
 * @returns {string[]} - sorted list of Package objects that
 *    represent packages to be built.
 */
function getSortedPackages(scope, ignore) {    
  const packages = getPackagesSync(__dirname);
  const filtered = filterPackages(packages, scope, ignore, false);
  
  return batchPackages(filtered)
    .reduce((arr, batch) => arr.concat(batch), []);
}

const baseConfig = (base, main) => ({
    input: path.join(base, 'src', 'index.ts'),
    output: [{
      file: path.join(base, main),
      format: 'cjs',
      sourcemap: true
    }, /* Add any other configs (for esm or iife format?) */],
    plugins: [
        typescript(),
    ]
  });


const config = [];
// Support --scope and --ignore globs if passed in via commandline
const { scope, ignore } = minimist(process.argv.slice(2));
const packages = getSortedPackages(scope, ignore);

packages.forEach(pkg => {
    /* Absolute path to package directory */
    const basePath = path.relative(__dirname, pkg.location);
    /* "input" and "main" field from package.json file. */
    const { main } = pkg.toJSON();

    /* Push build config for this package. */
    config.push(baseConfig(basePath, main));
});

export default config;