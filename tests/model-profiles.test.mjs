import test from 'node:test';
import assert from 'node:assert/strict';
import { getProcessContent } from '../src/data/localizedProcesses.ts';
import { getTransportContent } from '../src/data/transport.ts';
import { getDemoRoute } from '../src/data/modelProfiles.ts';
import { getProfileUI } from '../src/i18n/profileUI.ts';
import { ui } from '../src/i18n/ui.ts';
import { DEMO_ROUTE, sources as micronSources } from '../src/data/processes.ts';
import { nandWaferLabels } from '../src/data/nandWaferLabels.ts';

const locales = ['ja', 'en', 'zh'];
const stageIds = Array.from({ length: 9 }, (_, id) => id);
const micronNames = /Fab\s*15|Micron|マイクロン|美光|Higashihiroshima|東広島|东广岛/iu;
const eighthGeneration = {
  ja: /第?8世代/u,
  en: /(?:8th|eighth)[ -]generation/iu,
  zh: /第?8代/u,
};

function nonempty(value, label) {
  assert.equal(typeof value, 'string', label);
  assert.ok(value.trim(), label);
}

function completeText(value, label) {
  if (typeof value === 'string') nonempty(value, label);
  else if (Array.isArray(value)) {
    assert.ok(value.length, label);
    value.forEach((item, index) => completeText(item, `${label}[${index}]`));
  } else {
    assert.ok(value && typeof value === 'object', label);
    Object.entries(value).forEach(([key, item]) => completeText(item, `${label}.${key}`));
  }
}

function translated(value, locale) {
  const text = JSON.stringify(value);
  // Shared punctuation such as the middle dot is not untranslated Japanese.
  if (locale !== 'ja') assert.doesNotMatch(text, /[\p{Script=Hiragana}\p{Script=Katakana}]/u, `${locale}: no Japanese fallback`);
  if (locale === 'en') assert.doesNotMatch(text, /[\u4e00-\u9fff]/u, 'English: no untranslated CJK text');
}

test('default APIs retain Micron content and historical evidence after selecting KIOXIA', () => {
  assert.deepEqual(getDemoRoute(), DEMO_ROUTE);
  for (const locale of locales) {
    const processBefore = structuredClone(getProcessContent(locale, 'micron'));
    const transportBefore = structuredClone(getTransportContent(locale, 'micron'));
    const uiBefore = structuredClone(ui[locale]);
    getProcessContent(locale, 'kioxia');
    getTransportContent(locale, 'kioxia');
    getProfileUI(locale, 'kioxia');
    assert.deepEqual(getProcessContent(locale), processBefore, 'KIOXIA must not mutate the default process content');
    assert.deepEqual(getTransportContent(locale), transportBefore);
    assert.deepEqual(getProfileUI(locale), uiBefore);
    assert.equal(processBefore.sources.length, 13);
    assert.deepEqual(processBefore.sources.map(source => [source.id, source.url]), micronSources.map(source => [source.id, source.url]));
    assert.equal(processBefore.stages[8].evidenceStatus, 'historical');
    const oldCertificate = processBefore.sources.find(source => source.id === 'micron-iso14001-history');
    assert.ok(oldCertificate);
    assert.match(oldCertificate.date, /2025-01-15/u, 'the expired certificate date must survive localization and profile selection');
  }
});

test('KIOXIA process translations preserve official sources and CBA/inspection evidence boundaries', () => {
  const canonical = getProcessContent('ja', 'kioxia');
  assert.ok(canonical.sources.length > 0);
  assert.equal(new Set(canonical.sources.map(source => source.id)).size, canonical.sources.length);
  for (const locale of locales) {
    const content = getProcessContent(locale, 'kioxia');
    assert.deepEqual(content.stages.map(stage => stage.id), stageIds);
    assert.deepEqual(content.sources.map(source => source.id), canonical.sources.map(source => source.id));
    ['modelTitle', 'scopeNote', 'disclaimer'].forEach(field => nonempty(content[field], `${locale}.${field}`));
    completeText(content.evidenceLabels, `${locale}.evidenceLabels`);
    assert.doesNotMatch(JSON.stringify(content), micronNames, 'KIOXIA data must not carry Micron factory/source text');
    const sourceIds = new Set(content.sources.map(source => source.id));
    for (const [index, source] of content.sources.entries()) {
      assert.ok(source.id.startsWith('kioxia-'));
      assert.match(new URL(source.url).hostname, /(?:^|\.)kioxia\.com$/iu, 'KIOXIA sources must be on the official domain');
      ['title', 'date', 'checkedAt', 'support', 'limits', 'verification'].forEach(field => nonempty(source[field], `${locale}.${source.id}.${field}`));
      assert.equal(source.url, canonical.sources[index].url);
      assert.equal(source.checkedAt, canonical.sources[index].checkedAt);
      assert.deepEqual(source.date.match(/\d{4}-\d{2}-\d{2}/gu), canonical.sources[index].date.match(/\d{4}-\d{2}-\d{2}/gu));
    }
    for (const [index, stage] of content.stages.entries()) {
      ['title', 'shortTitle', 'equipment', 'description', 'action', 'quality', 'dx', 'waferNote', 'evidenceStatement'].forEach(field => nonempty(stage[field], `${locale}.stage${stage.id}.${field}`));
      completeText(stage.unconfirmed, `${locale}.stage${stage.id}.unconfirmed`);
      assert.ok(stage.sourceIds.length && stage.sourceIds.every(id => sourceIds.has(id)), 'every stage must resolve sources within its active profile');
      assert.deepEqual(stage.sourceIds, canonical.stages[index].sourceIds);
      assert.equal(stage.evidenceStatus, canonical.stages[index].evidenceStatus);
    }
    assert.match(content.stages[7].title, /CBA/u);
    assert.match(content.stages[7].evidenceStatement, eighthGeneration[locale], 'CBA evidence must remain tied to the public eighth-generation example');
    assert.equal(content.stages[8].evidenceStatus, 'illustrative', 'current Yokkaichi probe scope cannot become a confirmed public fact');
    translated(content, locale);
  }
});

test('routes, transport sources and translated UI follow the active model profile', () => {
  for (const profile of ['micron', 'kioxia']) {
    const route = getDemoRoute(profile);
    assert.ok(route.length > 0);
    assert.ok(route.every(id => Number.isInteger(id) && stageIds.includes(id)));
    assert.deepEqual([...new Set(route)].sort((a, b) => a - b), stageIds, 'the learning route covers all nine categories');
    assert.equal(route.at(-1), 8);
    for (const locale of locales) {
      const content = getProcessContent(locale, profile);
      const sourceIds = new Set(content.sources.map(source => source.id));
      const transport = getTransportContent(locale, profile);
      completeText(transport, `${locale}.${profile}.transport`);
      assert.deepEqual(Object.keys(transport.items).sort(), ['foup', 'oht']);
      for (const [id, item] of Object.entries(transport.items)) {
        assert.equal(item.id, id);
        assert.ok(item.sourceIds.length && item.sourceIds.every(sourceId => sourceId.startsWith(`${profile}-`) && sourceIds.has(sourceId)), 'transport evidence must belong to the active profile');
      }
      const text = getProfileUI(locale, profile);
      completeText(text, `${locale}.${profile}.ui`);
      assert.equal(text.inspector.changes.length, 9);
      assert.equal(text.inspector.checks.length, 9);
      translated({ transport, text }, locale);
      if (profile === 'kioxia') {
        // Explicit comparison copy may name Micron; active-brand and other copy may not.
        const { comparisonTitle, comparisonIntro, comparison, ...about } = text.about;
        assert.ok(comparisonTitle && comparisonIntro && comparison.length);
        assert.doesNotMatch(JSON.stringify({ ...text, about }), micronNames);
      }
    }
  }
});

test('all NAND wafer labels explain stacks, vertical holes and the scoped two-wafer CBA example', () => {
  const terms = {
    ja: { stack: /多層/u, holes: /垂直.*ホール/u, cell: /セル/u, lines: /ワード線/u, scope: /模式/u },
    en: { stack: /multilayer/iu, holes: /vertical.*holes/iu, cell: /cell/iu, lines: /word lines/iu, scope: /schematic/iu },
    zh: { stack: /多层/u, holes: /垂直.*孔/u, cell: /单元/u, lines: /字线/u, scope: /示意/u },
  };
  for (const locale of locales) {
    const labels = nandWaferLabels[locale];
    completeText(labels, `${locale}.nandWaferLabels`);
    assert.equal(labels.stageNames.length, 9);
    assert.match(labels.stack, terms[locale].stack);
    assert.match(labels.memoryHoles, terms[locale].holes);
    assert.match(labels.cellFilm, terms[locale].cell);
    assert.match(labels.wordLines, terms[locale].lines);
    assert.match(labels.stageNames[7], /CBA/u);
    assert.match(labels.cmosWafer, /CMOS/u);
    assert.match(labels.cbaCaption, eighthGeneration[locale]);
    assert.match(labels.caption, terms[locale].scope);
    assert.doesNotMatch(JSON.stringify(labels), micronNames);
    translated(labels, locale);
  }
});
