import test from 'node:test';
import assert from 'node:assert/strict';
import { getProcessContent } from '../src/data/localizedProcesses.ts';
import { stages, sources } from '../src/data/processes.ts';
import { ui } from '../src/i18n/ui.ts';
import { waferLabels } from '../src/data/waferLabels.ts';

test('all languages retain process evidence status and valid primary-source references', () => {
  for (const locale of ['ja', 'en', 'zh']) {
    const content = getProcessContent(locale);
    assert.equal(content.stages.length, 9);
    assert.equal(content.sources.length, 13);
    content.stages.forEach((stage, index) => {
      assert.equal(stage.id, stages[index].id);
      assert.equal(stage.evidenceStatus, stages[index].evidenceStatus);
      assert.deepEqual(stage.sourceIds, stages[index].sourceIds);
      assert.equal(stage.unconfirmed.length, stages[index].unconfirmed.length);
      assert.ok(stage.sourceIds.every(id => content.sources.some(source => source.id === id)));
    });
    content.sources.forEach((source, index) => {
      assert.equal(source.id, sources[index].id);
      assert.equal(source.url, sources[index].url);
      assert.equal(source.checkedAt, sources[index].checkedAt);
      assert.deepEqual(source.date.match(/\d{4}-\d{2}-\d{2}/g), sources[index].date.match(/\d{4}-\d{2}-\d{2}/g));
    });
    assert.equal(content.stages[8].evidenceStatus, 'historical');
  }
});

test('English and Chinese fully translate process, source, UI and wafer text without Japanese fallback', () => {
  const textFields = ['title', 'shortTitle', 'equipment', 'description', 'action', 'quality', 'dx', 'waferNote', 'evidenceStatement'];
  for (const locale of ['en', 'zh']) {
    const content = getProcessContent(locale);
    for (const stage of content.stages) {
      for (const field of textFields) {
        assert.ok(stage[field].trim(), `${locale} stage ${stage.id} ${field}`);
        assert.notEqual(stage[field], stages[stage.id][field]);
      }
      assert.ok(stage.unconfirmed.every(item => item.trim()));
    }
    for (const source of content.sources) {
      for (const field of ['title', 'date', 'support', 'limits', 'verification']) assert.ok(source[field].trim());
    }
    assert.equal(waferLabels[locale].stageNames.length, 9);
    const allText = JSON.stringify({ content, ui: ui[locale], wafer: waferLabels[locale] });
    assert.doesNotMatch(allText, /[\u3040-\u30ff]/u);
    if (locale === 'en') assert.doesNotMatch(allText, /[\u4e00-\u9fff]/u);
  }
});
