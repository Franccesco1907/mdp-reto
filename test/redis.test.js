const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');

async function main() {
  const source = fs.readFileSync(path.join(__dirname, '../src/index.js'), 'utf8');
  let failure;
  const context = {
    process: { argv: ['node', 'index.js', 'mdplinks', '--tags', 'empresa'] },
    client: {
      keys: (_, callback) => callback(failure, ['slow', 'other', 'deleted']),
      get: (key, callback) => setTimeout(() => callback(failure, key === 'deleted' ? null : JSON.stringify({ tags: { 0: key === 'slow' ? 'empresa' : 'otro' } })), 150)
    },
    setTimeout
  };
  vm.runInNewContext(source.slice(source.indexOf('async function getTitlePromise')), context);
  assert.deepEqual(Array.from(await context.getLinksPromise()), ['slow']);
  assert.deepEqual(Array.from(await context.getArrayLinks([])), []);
  failure = new Error('Redis unavailable');
  await assert.rejects(context.getKeysPromise(), error => error === failure);
  await assert.rejects(context.getValuePromise('slow'), error => error === failure);

  let writeCallback;
  const exits = [];
  const colors = { red: x => x, blue: x => x };
  const dependencies = {
    express: () => ({ listen() {} }),
    redis: { createClient: () => ({ set: (_, __, callback) => { writeCallback = callback; } }) },
    crypto: require('crypto'), colors,
    process: { exit: code => exits.push(code) },
    superagent: { get: async () => ({ text: '<title>Example</title>' }) },
    cheerio: { load: () => () => ({ text: () => 'Example' }) }
  };
  vm.runInNewContext(source, {
    require: name => dependencies[name],
    process: { argv: ['node', 'index.js', 'mdplinks', 'https://example.com', '--tags', 'empresa'] },
    console: { log() {}, error() {} }, setTimeout
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(exits, [], 'must wait for Redis write acknowledgment');
  assert.equal(typeof writeCallback, 'function');
  writeCallback(null);
  assert.deepEqual(exits, [0]);
  console.log('PASS: slow reads, deleted keys, Redis errors and write acknowledgment');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
