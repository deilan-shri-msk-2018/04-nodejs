const { EOL } = require('os');
const { basename } = require('path');

const {
  exec
} = require('./child-process-utils');

const { spawn } = require('child_process');

function getBranchList() {
  return exec('git branch --list')
    .then(outputLines => outputLines.map(line => line.substr(2)));
}

function getTreeContents(treeIsh, path = '') {
  if (!treeIsh) {
    throw new Error(`Missing required parameter 'treeIsh'`);
  }
  if (path == null) {
    throw new Error(`Parameter 'path' can't be null or undefined`);
  }
  return exec(`git ls-tree -l '${treeIsh}' '${path}'`)
    .then(outputLines => {
      return outputLines.map(line => parseTreeContentsLine(line, path))
    });
}

function getFileContents(sha1) {
  return exec(`git cat-file -p ${sha1}`);
}

function getBlobStream(sha1) {
  if (sha1 == null) {
    throw new Error(`Parameter 'sha1' can't be null or undefined`);
  }
  const process = spawn('git', ['cat-file', 'blob', sha1]);
  return process.stdout;
}

function parseTreeContentsLine(line, path) {
  // split by tab or whitespace
  const strings = line.split(/\s+/);
  // Output format:
  // <mode> SP <type> SP <object> SP <object size> TAB <file>
  return {
    mode: strings[0],
    type: strings[1],
    object: strings[2],
    // conditionally define objectSize prop for blobs but not trees
    ...(strings[3] !== '-' && {
      objectSize: parseInt(strings[3], 10)
    }),
    file: basename(strings[4])
  };
}

// function getCurrentBranch() {
//   return exec('git rev-parse --abbrev-ref HEAD')
//     .then(({
//       stdout,
//       stderr
//     }) => {
//       return stdout;
//     });
// }

// function getTreeContents(ref) {
//   return spawn('git', ['ls-tree', ref, '-d', '--name-only'], {
//     stdio: 'inherit',
//     shell: true
//   }).then({ stdout})
// }

module.exports = {
  getBranchList,
  getTreeContents,
  getFileContents,
  getBlobStream
}