import assert from 'node:assert/strict';
import test from 'node:test';
import { getHeroQuality } from '../src/lib/heroQuality.js';

test('constrained CPUs skip WebGL even when memory is plentiful', () => {
  assert.equal(getHeroQuality({ hardwareConcurrency: 4, deviceMemory: 16 }, false).mode, 'static');
});

test('constrained memory skips WebGL even on a many-core CPU', () => {
  assert.equal(getHeroQuality({ hardwareConcurrency: 16, deviceMemory: 4 }, false).mode, 'static');
});

test('reduced motion skips the model on high-end hardware', () => {
  assert.equal(getHeroQuality({ hardwareConcurrency: 16, deviceMemory: 16 }, true).mode, 'static');
});

test('missing hardware hints select a bounded workload without bloom', () => {
  const quality = getHeroQuality({}, false);
  assert.equal(quality.mode, 'balanced');
  assert.equal(quality.bloom, false);
  assert.ok(quality.density <= 1000);
  assert.ok(quality.dpr <= 1);
});

test('ordinary laptops use the lighter model', () => {
  assert.equal(getHeroQuality({ hardwareConcurrency: 8, deviceMemory: 8 }, false).mode, 'balanced');
});

test('full effects require both CPU and memory hints', () => {
  assert.equal(getHeroQuality({ hardwareConcurrency: 16 }, false).mode, 'balanced');
  assert.equal(getHeroQuality({ hardwareConcurrency: 16, deviceMemory: 8 }, false).mode, 'full');
});
