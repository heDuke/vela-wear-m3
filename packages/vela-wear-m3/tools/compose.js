// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 heDuke. See NOTICE.
// Compile-time Wear M3-shaped DSL -> Vela UX (template/style/script with @wear includes).
'use strict';
const fs = require('fs');
const path = require('path');

const HOOKS = ['onMotionFrame', 'pageShow', 'pageHide', 'pageDestroy', 'pressSpring', 'pressStyle', 'demoClose', 'overlayBack'];
const FORBIDDEN_ARGS = new Set(['modifier', 'colors', 'shape', 'border', 'contentPadding', 'interactionSource', 'transformation', 'remember']);
const GEN_IF = new Set(['pill', 'round', 'rect', 'enhanced']);

const BUTTON_PRESET = {
  Button: { cls: 'bf', ink: 'c-onPri', iconRole: 'onPrimary', iconDp: 24 },
  FilledTonalButton: { cls: 'bt', ink: 'c-onS', iconRole: 'primary', iconDp: 24 },
  OutlinedButton: { cls: 'bo', ink: 'c-onS', iconRole: 'primary', iconDp: 24 },
  ChildButton: { cls: 'bc', ink: 'c-pri', iconRole: 'primary', iconDp: 24 }
};
const ICON_BTN_PRESET = {
  IconButton: { cls: '', iconRole: 'primary', iconDp: 26 },
  FilledIconButton: { cls: 'bf', iconRole: 'onPrimary', iconDp: 26 },
  FilledTonalIconButton: { cls: 'bt', iconRole: 'primary', iconDp: 26 },
  OutlinedIconButton: { cls: 'bo', iconRole: 'primary', iconDp: 26 }
};
const ICON_STEM = { play_arrow: 'play', music_note: 'music', delete: 'delete', close: 'close', add: 'add', remove: 'remove', favorite: 'favorite', star: 'star', alarm: 'alarm', info: 'info', wifi: 'wifi', water: 'water' };

const PACK_BY_FN = {
  ScreenScaffold: 'scaffold', TransformingLazyColumn: 'scaffold', TimeText: 'scaffold', ScrollIndicator: 'scaffold', ListHeader: 'scaffold', Note: 'scaffold',
  Button: 'buttons', FilledTonalButton: 'buttons', OutlinedButton: 'buttons', ChildButton: 'buttons',
  IconButton: 'buttons', FilledIconButton: 'buttons', FilledTonalIconButton: 'buttons', OutlinedIconButton: 'buttons',
  CompactButton: 'buttons',
  ButtonMorph: 'morph', IconButtonMorph: 'morph',
  Card: 'cards', OutlinedCard: 'cards', TitleCard: 'cards', AppCard: 'cards',
  SwitchButton: 'selection', CheckboxButton: 'selection', RadioButton: 'selection', Slider: 'selection', NativeSwitch: 'selection', NativeSlider: 'selection',
  Stepper: 'range', StepperLevelIndicator: 'range',
  HorizontalPager: 'pager', VerticalPager: 'pager',
  CircularProgressIndicator: 'progress', LinearProgressIndicator: 'progress', SegmentedCircularProgressIndicator: 'progress', ArcProgressIndicator: 'progress', ProgressIndicator: 'progress',
  AlertDialog: 'dialog', SuccessConfirmationDialog: 'confirm',
  EdgeButton: 'edge',
  ClockPanel: 'time', ArcTimeText: 'time',
  MediaColumn: 'mediaList', MediaActions: 'mediaList', MediaQueue: 'mediaList', MediaOutputPicker: 'mediaList',
  PlayerScreen: 'media', PlayPauseButton: 'media', MediaButtonRow: 'media', MediaInfo: 'media', SettingsRow: 'media', VolumeLevelIndicator: 'media', VolumeScreen: 'media'
};

const PACKS = {
  scaffold: { css: ['m3.css'], head: ['base_head.js'], data: ['base_data.js'], methods: ['base.js'] },
  buttons: { css: ['buttons.css'] },
  morph: { css: ['buttons.css'], head: ['buttons.head.js', 'buttons.timer.js'], data: ['buttons.data.js'], methods: ['buttons.methods.js'] },
  cards: { css: ['cards.css'] },
  selection: { css: ['toggles.css', 'range.css'], head: ['selection.head.js'], data: ['selection.data.js'], methods: ['selection.methods.js', 'range.js'] },
  range: { css: ['range.css'], head: ['range.head.js'], data: ['range.data.js'], methods: ['range.js'] },
  pager: { css: ['pager.css'], head: ['pager.head.js'], data: ['pager.data.js'], methods: ['pager.methods.js'] },
  progress: { css: ['motion.css'], head: ['progress.head.js'], data: ['progress.data.js'], methods: ['progress.methods.js'] },
  dialog: { css: ['overlay.css'] },
  confirm: { css: ['overlay.css', 'confirm.css'], extraHead: 'let cfTimer=null\nlet confirmEpoch=0\n', methods: ['confirm.js'] },
  edge: { css: ['edge.css', 'overlay.css', 'confirm.css'], extraHead: 'let cfTimer=null\nlet confirmEpoch=0\n', methods: ['confirm.js'] },
  time: { css: ['time.css'] },
  media: { css: ['media.css'], head: ['media.head.js'], data: ['media.data.js'], methods: ['media.methods.js'] },
  mediaList: { css: ['media-list.css'], head: ['media-list.head.js'], data: ['media-list.data.js'], methods: ['media-list.methods.js'] },
  volume: { css: ['media.css', 'range.css'], head: ['media.head.js', 'range.head.js', 'volume-screen.head.js'], data: ['media.data.js', 'range.data.js', 'volume-screen.data.js'], methods: ['volume-screen.methods.js', 'range.js', 'media.methods.js'] }
};

function err(tok, msg) { throw new Error('compose:' + (tok && tok.line || '?') + ': ' + msg); }

function tokenize(src) {
  const t = [];
  let i = 0, line = 1;
  const push = (kind, value) => t.push({ kind, value, line });
  while (i < src.length) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c <= ' ') { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '"' || c === "'") {
      const q = c; i++; let s = '';
      while (i < src.length && src[i] !== q) {
        if (src[i] === '\\' && i + 1 < src.length) {
          const n = src[++i];
          s += n === 'n' ? '\n' : n === 't' ? '\t' : n === 'r' ? '\r' : n;
          i++; continue;
        }
        if (src[i] === '\n') line++;
        s += src[i++];
      }
      if (src[i] !== q) err({ line }, 'unterminated string');
      i++; push('string', s); continue;
    }
    if (c === '.' && src[i + 1] === '.') { i += 2; push('dotdot', '..'); continue; }
    if (c === '-' && src[i + 1] === '>') { i += 2; push('arrow', '->'); continue; }
    if ('(){},=.'.includes(c)) {
      const kind = { '(': 'lp', ')': 'rp', '{': 'lb', '}': 'rb', ',': 'comma', '=': 'eq', '.': 'dot' }[c];
      i++; push(kind, c); continue;
    }
    if (/[0-9]/.test(c)) {
      let s = c; i++;
      while (i < src.length && /[0-9.]/.test(src[i]) && !(src[i] === '.' && src[i + 1] === '.')) s += src[i++];
      push('number', s); continue;
    }
    if (/[A-Za-z_$@]/.test(c)) {
      let s = c; i++;
      while (i < src.length && /[A-Za-z0-9_$@]/.test(src[i])) s += src[i++];
      if (s === 'true' || s === 'false') push('bool', s === 'true');
      else if (s === 'null') push('null', null);
      else if (s === 'it') push('it', 'it');
      else push('id', s);
      continue;
    }
    err({ line }, 'unexpected ' + JSON.stringify(c));
  }
  push('eof', '');
  return t;
}

function unwrap(node) {
  if (node && node.type === 'lambda' && node.kind === 'call') return node.body;
  return node;
}

function textOf(node, itemParam) {
  node = unwrap(node);
  if (!node) return '';
  if (node.type === 'str') return node.value;
  if (node.type === 'num') return node.value;
  if (node.type === 'bool') return node.value ? 'true' : 'false';
  if (node.type === 'ref') {
    if (itemParam && node.name === itemParam) return '$item';
    return node.name;
  }
  if (node.type === 'member') {
    const o = textOf(node.obj, itemParam);
    if (o === '$item') return '$item.' + node.name;
    return o + '.' + node.name;
  }
  if (node.type === 'call' && node.name === 'Text') {
    const v = (node.pos && node.pos[0]) || node.args.value || node.children[0] || Object.values(node.args)[0];
    return textOf(v, itemParam);
  }
  if (node.type === 'call' && node.name === 'Icon') {
    const v = (node.pos && node.pos[0]) || node.args.name || node.args.src || node.children[0] || Object.values(node.args)[0];
    return textOf(v, itemParam);
  }
  err(node, 'cannot stringify ' + node.type);
}

function interpText(node, itemParam) {
  node = unwrap(node);
  if (!node) return '';
  if (node.type === 'str') return node.value;
  if (node.type === 'call' && (node.name === 'Text' || node.name === 'Icon')) return interpText(node.pos && node.pos[0] || node.args.value || node.args.name || node.children[0] || Object.values(node.args)[0], itemParam);
  const t = textOf(node, itemParam);
  if (t.startsWith('$item') || /^[A-Za-z_]/.test(t)) return '{{' + t + '}}';
  return t;
}

function parseWithPos(src) {
  const tokens = [];
  let p = 0;
  const peek = () => tokens[p];
  const eat = (kind) => { const t = tokens[p]; if (t.kind !== kind) err(t, 'expected ' + kind + ' got ' + t.kind + (t.value ? ' ' + t.value : '')); p++; return t; };
  const maybe = (kind) => { if (peek().kind === kind) { p++; return true; } return false; };

  function expr() {
    const t = peek();
    if (t.kind === 'string') { p++; return { type: 'str', value: t.value, line: t.line }; }
    if (t.kind === 'number') {
      p++;
      if (peek().kind === 'dotdot') { p++; const b = eat('number'); return { type: 'range', a: t.value, b: b.value, line: t.line }; }
      return { type: 'num', value: t.value, line: t.line };
    }
    if (t.kind === 'bool') { p++; return { type: 'bool', value: t.value, line: t.line }; }
    if (t.kind === 'null') { p++; return { type: 'null', line: t.line }; }
    if (t.kind === 'it') { p++; return { type: 'it', line: t.line }; }
    if (t.kind === 'id') {
      p++;
      let node = { type: 'ref', name: t.value, line: t.line };
      while (peek().kind === 'dot') { p++; node = { type: 'member', obj: node, name: eat('id').value, line: t.line }; }
      if (peek().kind === 'lp') {
        const { args, pos } = parseArgs();
        let children = [];
        if (peek().kind === 'lb') children = parseTrailing(t.value);
        return { type: 'call', name: t.value, args, pos, children, line: t.line };
      }
      return node;
    }
    err(t, 'expected expression');
  }

  function parseArgs() {
    eat('lp');
    const args = {}, pos = [];
    if (peek().kind !== 'rp') {
      while (true) {
        if (peek().kind === 'id' && tokens[p + 1] && tokens[p + 1].kind === 'eq') {
          const n = eat('id');
          if (FORBIDDEN_ARGS.has(n.value)) err(n, 'unsupported parameter ' + n.value);
          eat('eq');
          args[n.value] = peek().kind === 'lb' ? lambda() : expr();
        } else {
          pos.push(expr());
        }
        if (!maybe('comma')) break;
      }
    }
    eat('rp');
    return { args, pos };
  }

  function lambda() {
    const start = eat('lb');
    if (peek().kind === 'rb') { p++; return { type: 'lambda', kind: 'empty', line: start.line }; }
    const save = p;
    const left = expr();
    if (peek().kind === 'eq') {
      p++;
      const right = expr();
      eat('rb');
      return { type: 'lambda', kind: 'assign', left, right, line: start.line };
    }
    eat('rb');
    return { type: 'lambda', kind: 'call', body: left, line: start.line };
  }

  function parseTrailing(name) {
    eat('lb');
    if (name === 'items') {
      let param = 'item';
      if (peek().kind === 'id' && tokens[p + 1] && tokens[p + 1].kind === 'arrow') { param = eat('id').value; eat('arrow'); }
      const children = stmts();
      eat('rb');
      return { param, stmts: children };
    }
    if (name === 'if' || name === 'ScreenScaffold' || name === 'TransformingLazyColumn' || name === 'item' || name === 'Row' || name === 'MediaColumn') {
      const children = stmts();
      eat('rb');
      return children;
    }
    const children = [];
    while (peek().kind !== 'rb' && peek().kind !== 'eof') {
      if (peek().kind === 'id' && (tokens[p + 1] && (tokens[p + 1].kind === 'lp' || tokens[p + 1].kind === 'lb'))) children.push(callLike());
      else children.push(expr());
    }
    eat('rb');
    return children;
  }

  function callLike() {
    const n = eat('id');
    if (n.value === 'if') {
      eat('lp'); const cond = eat('id'); if (!GEN_IF.has(cond.value)) err(cond, 'if condition must be pill|round|rect|enhanced'); eat('rp');
      eat('lb'); const body = stmts(); eat('rb');
      return { type: 'if', cond: cond.value, body, line: n.line };
    }
    if (n.value === 'items') {
      eat('lp'); const list = eat('id'); eat('rp');
      const block = parseTrailing('items');
      return { type: 'items', list: list.value, param: block.param, body: block.stmts, line: n.line };
    }
    if (n.value === 'item') {
      let args = {}, pos = [];
      if (peek().kind === 'lp') { const a = parseArgs(); args = a.args; pos = a.pos; }
      eat('lb'); const body = stmts(); eat('rb');
      return { type: 'item', args, pos, body, line: n.line };
    }
    let args = {}, pos = [];
    if (peek().kind === 'lp') { const a = parseArgs(); args = a.args; pos = a.pos; }
    else if (peek().kind !== 'lb') err(n, 'expected call ' + n.value);
    let children = [];
    if (peek().kind === 'lb') children = parseTrailing(n.value);
    return { type: 'call', name: n.value, args, pos, children, line: n.line };
  }

  function stmts() {
    const out = [];
    while (peek().kind === 'id') out.push(callLike());
    return out;
  }

  function extract(tag) {
    const re = new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>', 'i');
    const m = src.match(re);
    return m ? m[1] : '';
  }
  const tpl = extract('template').trim();
  const script = extract('script');
  if (!tpl) throw new Error('compose: missing <template>');
  const inner = tpl.replace(/^\s*fun\b/, 'fun');
  tokens.length = 0; tokens.push(...tokenize(inner)); p = 0;
  if (peek().kind !== 'id' || peek().value !== 'fun') err(peek(), 'expected fun Screen()');
  eat('id'); eat('id'); eat('lp'); eat('rp'); eat('lb');
  const body = stmts();
  eat('rb');
  if (peek().kind !== 'eof') err(peek(), 'trailing input');
  return { body, script };
}

function slot(call, name) {
  if (call.args[name]) return call.args[name];
  const kids = Array.isArray(call.children) ? call.children : [];
  if (name === 'label') return kids.find(k => k.type === 'call' && k.name === 'Text') || kids.find(k => k.type === 'str');
  if (name === 'icon') return kids.find(k => k.type === 'call' && k.name === 'Icon');
  if (name === 'secondaryLabel') return kids.filter(k => k.type === 'call' && k.name === 'Text')[1] || kids.find(k => k.type === 'call' && k.name === 'SecondaryLabel');
  return null;
}

function iconSrc(node, role, dp, itemParam) {
  node = unwrap(node);
  if (!node) return '';
  const raw = node.type === 'call' ? (node.pos && node.pos[0] || node.args.name || node.args.src) : node;
  if (!raw) return '';
  if (raw.type === 'str') {
    if (raw.value.includes('/')) return raw.value;
    const stem = ICON_STEM[raw.value] || raw.value;
    return '/common/img/' + stem + '_' + role + '_' + dp + '.png';
  }
  const t = textOf(raw, itemParam);
  if (t.startsWith('$item') || /^[A-Za-z_]/.test(t)) return '{{' + t + '}}';
  return t;
}

function emitCallEvent(lambda, itemParam, setters, listName) {
  if (!lambda || lambda.kind === 'empty') return '';
  if (lambda.kind === 'call') {
    const c = lambda.body;
    if (c.type === 'call') {
      const pos = (c.pos || []).map(a => {
        if (a.type === 'str') return "'" + String(a.value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
        return textOf(a, itemParam);
      });
      return c.name + (pos.length ? '(' + pos.join(',') + ')' : '');
    }
    if (c.type === 'ref') return c.name;
    err(c, 'callback must be a method call');
  }
  if (lambda.kind === 'assign') {
    const left = textOf(lambda.left, itemParam);
    const r = lambda.right;
    if (!r) err(lambda, 'bad assignment');
    if (r.type === 'it') err(r, 'it is not provided by onClick');
    const name = '_set' + setters.length;
    const rec = { name, left, listName };
    if (r.type === 'str') { rec.rightKind = 'str'; rec.rightValue = r.value; }
    else if (r.type === 'num') { rec.rightKind = 'num'; rec.rightValue = r.value; }
    else if (r.type === 'bool') { rec.rightKind = 'bool'; rec.rightValue = r.value; }
    else if (r.type === 'ref' || r.type === 'member') { rec.rightKind = 'expr'; rec.rightValue = textOf(r, itemParam); }
    else err(r, 'assignment right-hand side must be a literal or field');
    if (rec.rightKind === 'expr' && rec.rightValue.startsWith('$item')) err(r, 'assignment cannot read $item in generated JS');
    setters.push(rec);
    return left.startsWith('$item.') ? name + '($idx)' : name;
  }
  err(lambda, 'bad lambda');
}

function setterRhs(s) {
  if (s.rightKind === 'str') return JSON.stringify(s.rightValue);
  if (s.rightKind === 'num') return String(s.rightValue);
  if (s.rightKind === 'bool') return s.rightValue ? 'true' : 'false';
  const v = s.rightValue;
  if (/^[A-Za-z_][\w.]*$/.test(v)) return 'this.' + v;
  return v;
}

function setterJs(s) {
  const list = s.listName || 'items';
  const rhs = setterRhs(s);
  if (s.left.startsWith('$item.')) {
    const field = s.left.slice(6);
    return s.name + '(i){const a=this.' + list + ';a[i].' + field + '=' + rhs + ';this.' + list + '=a.slice();},';
  }
  return s.name + '(){this.' + s.left + '=' + rhs + ';},';
}

// Button / IconButton press squish: CornerFull (26dp) -> shapes.small (8dp), see base.js sqPress.
function sqAttrs(idExpr) {
  return pressAttrs(idExpr).replace(/ontouchstart="press\(([^"]*)\)"/, 'ontouchstart="sqPress($1,$[dp(26)],$[dp(8)])"');
}

function pressAttrs(idExpr) {
  const quoted = idExpr.startsWith('$') || idExpr.includes('.');
  const id = quoted ? idExpr : "'" + idExpr + "'";
  const fb = quoted ? "feedback[" + idExpr + "] || {opacity:1}" : "feedback[" + id + "] || {opacity:1}";
  return 'style="{{' + fb + '}}" ontouchstart="press(' + id + ')" ontouchend="release(' + id + ')" ontouchmove="cancelPress"';
}

function walkFns(nodes, set) {
  (nodes || []).forEach(n => {
    if (n.type === 'call') { set.add(n.name); walkFns(n.children && n.children.stmts ? n.children.stmts : (Array.isArray(n.children) ? n.children : []), set); }
    else if (n.type === 'if') walkFns(n.body, set);
    else if (n.type === 'items') walkFns(n.body, set);
    else if (n.type === 'item') walkFns(n.body, set);
  });
}

function collectPacks(fnSet) {
  const packs = new Set(['scaffold']);
  fnSet.forEach(n => { if (PACK_BY_FN[n]) packs.add(PACK_BY_FN[n]); });
  if (fnSet.has('VolumeScreen')) { packs.delete('media'); packs.add('volume'); }
  if (fnSet.has('Slider') && !fnSet.has('Stepper')) packs.add('selection');
  return [...packs];
}

function emitWidget(node, ctx) {
  if (node.type === 'if') {
    return '\n<!-- #if ' + node.cond + ' -->\n' + node.body.map(c => emitRow(c, ctx)).join('\n') + '\n<!-- #endif -->\n';
  }
  if (node.type === 'item') return emitItem(node, ctx, null);
  if (node.type === 'items') return emitItem({ type: 'item', args: {}, body: node.body, list: node.list, param: node.param }, ctx, node);
  if (node.type === 'call') return emitControl(node, ctx);
  return '';
}

function inferClass(body) {
  const names = body.filter(x => x.type === 'call').map(x => x.name);
  if (names.includes('ClockPanel')) return 'clock-row';
  if (names.includes('ArcTimeText')) return 'arc-row';
  if (names.includes('SwitchButton')) return 'switch-row';
  if (names.includes('Slider')) return 'slider-row';
  if (names.includes('IconButtonMorph') || names.includes('ButtonMorph')) return 'morph-row';
  if (names.includes('CompactButton')) return 'compact-row';
  if (names.some(n => n in ICON_BTN_PRESET) && names.includes('Note')) return 'icon-group';
  if (names.some(n => n in BUTTON_PRESET) && names.includes('Note')) return 'button-row';
  if (names.includes('AppCard')) return 'li-c3';
  if (names.includes('TitleCard')) return 'li-c2';
  if (names.includes('Card') || names.includes('OutlinedCard')) return 'li-c1';
  if (names.includes('ProgressIndicator') || names.includes('CircularProgressIndicator') || names.includes('LinearProgressIndicator') || names.includes('SegmentedCircularProgressIndicator') || names.includes('ArcProgressIndicator')) return 'progress-stage';
  if (names.includes('ListHeader')) return 'li-hdr';
  if (names.length === 1 && names[0] === 'Note') return 'li-note';
  if (names.includes('NativeSwitch') || names.includes('NativeSlider')) return 'li-48';
  if (names.includes('Text') && names.length === 1) return 'li-56';
  return 'li-56';
}

function emitItem(node, ctx, itemsNode) {
  const list = itemsNode ? itemsNode.list : node.list;
  const param = itemsNode ? itemsNode.param : (node.param || 'item');
  const prevItem = ctx.itemParam, prevList = ctx.listName, prevClass = ctx.itemClass;
  ctx.itemParam = list ? param : ctx.itemParam;
  ctx.listName = list || ctx.listName;
  const cls = (node.args && node.args.class) ? textOf(node.args.class) : inferClass(node.body);
  ctx.itemClass = cls;
  const type = (node.args && node.args.type) ? textOf(node.args.type) : ('r' + (ctx.seq++));
  const names = node.body.filter(x => x.type === 'call').map(x => x.name);
  const nativeSlider = names.includes('NativeSlider');
  const swipe = nativeSlider ? ' ontouchstart="controlStart" ontouchend="controlEnd"' : (ctx.listSwipe ? ' onswipe="onPageSwipe"' : '');
  const forAttr = list ? ' for="{{' + list + '}}" tid="id"' : '';
  let inner = node.body.map(ch => {
    if (ch.type === 'if') return emitWidget(ch, ctx);
    return emitControl(ch, ctx);
  }).join('');
  ctx.itemParam = prevItem;
  ctx.listName = prevList;
  ctx.itemClass = prevClass;
  if (list === 'items') {
    inner = '\n<!-- #component transforming-list-item {"style": "$item.st", "content": ' + JSON.stringify('\n' + inner + '\n') + '} -->\n';
  }
  return '<list-item type="' + type + '" class="' + cls + '"' + swipe + forAttr + '>\n' + inner + '\n</list-item>\n';
}

function emitControl(node, ctx) {
  if (node.type === 'if') return emitWidget(node, ctx);
  if (node.type === 'item' || node.type === 'items') return emitWidget(node, ctx);
  const n = node.name;
  const itemParam = ctx.itemParam;
  if (n === 'Note') {
    const v = node.pos[0] || node.args.text || node.children[0];
    const noteCls = ctx.itemClass === 'icon-group' ? 'icon-note' : 'note';
    return '<text class="' + noteCls + '">' + interpText(v, itemParam) + '</text>';
  }
  if (n === 'ListHeader') {
    const t = slot(node, 'label') || (node.children && node.children[0]);
    return '<div class="lh"><text class="t-titleS c-onSV">' + interpText(t, itemParam) + '</text></div>';
  }
  if (n === 'Text' && !ctx.insideButton) {
    const v = node.pos[0] || node.args.text || node.children[0];
    const cls = node.args.typography ? textOf(node.args.typography) : 't-labelM c-onS';
    return '<text class="' + (cls.includes(' ') ? cls : cls) + '">' + interpText(v && v.type ? v : node.pos[0], itemParam) + '</text>';
  }
  if (n in BUTTON_PRESET) return emitButton(node, ctx, BUTTON_PRESET[n]);
  if (n in ICON_BTN_PRESET) return emitIconButton(node, ctx, ICON_BTN_PRESET[n]);
  if (n === 'CompactButton') return emitCompact(node, ctx);
  if (n === 'ButtonMorph') return '\n<!-- #component button-morph {} -->\n';
  if (n === 'IconButtonMorph') return '\n<!-- #component icon-button-morph {} -->\n';
  if (n === 'SwitchButton') return emitSwitch(node, ctx);
  if (n === 'CheckboxButton') return '\n<!-- #component checkbox-button {} -->\n';
  if (n === 'RadioButton') return emitRadio(node, ctx);
  if (n === 'Slider') return '\n<!-- #component inline-slider {} -->\n';
  if (n === 'NativeSwitch') return '<switch checked="{{wifi}}" onchange="nWifi"></switch>';
  if (n === 'NativeSlider') return '<slider class="nsl" min="0" max="5" step="1" value="{{lvl}}" onchange="nLvl"></slider>';
  if (n === 'Card' || n === 'OutlinedCard' || n === 'TitleCard' || n === 'AppCard') return emitCard(node, ctx, n);
  if (n === 'CircularProgressIndicator' || n === 'LinearProgressIndicator' || n === 'SegmentedCircularProgressIndicator' || n === 'ArcProgressIndicator' || n === 'ProgressIndicator') return '\n<!-- #component progress-indicator {} -->\n';
  if (n === 'PresetRow') return '<list-item type="presets" class="preset-row"><div class="preset" for="{{presets}}" onclick="setProgress($item)"><text class="preset-text">{{$item}}%</text></div></list-item>';
  if (n === 'DemoTap') return '<div class="demo-tap" onclick="demoNext"></div>';
  if (n === 'MediaColumn') return emitMediaColumn(node, ctx);
  if (n === 'MediaActions') return '\n<!-- #component media-actions {} -->\n';
  if (n === 'MediaQueue') {
    const hd = node.args.header && node.args.header.type === 'bool' && node.args.header.value;
    return '\n<!-- #component media-queue {"header":"' + (hd ? 'true' : 'false') + '"} -->\n';
  }
  if (n === 'MediaOutputPicker') return '\n<!-- #component media-output-picker {} -->\n';
  if (n === 'PlayerScreen') return emitPlayer(node, ctx.inColumn);
  if (n === 'VolumeScreen') {
    const c = node.args.content ? textOf(node.args.content) : 'device';
    return '\n<!-- #component volume-screen {"content":"\'' + c + '\'"} -->\n';
  }
  if (n === 'MediaInfo') {
    const marquee = node.args.marquee && (node.args.marquee.type === 'bool' ? node.args.marquee.value : textOf(node.args.marquee) === 'true');
    return '<div class="md-at-info">\n<!-- #component media-info {"marquee":"' + (marquee ? 'true' : 'false') + '"} -->\n</div>';
  }
  if (n === 'MediaButtonRow') {
    const left = node.args.left ? textOf(node.args.left) : 'prev';
    const right = node.args.right ? textOf(node.args.right) : 'next';
    return '<div class="md-at-ctl">\n<!-- #component media-controls {"left":"\'' + left + '\'","right":"\'' + right + '\'"} -->\n</div>';
  }
  if (n === 'ClockPanel') return emitClock();
  if (n === 'ArcTimeText') {
    const st = node.args.status && textOf(node.args.status) === 'true';
    return '<div class="arc-panel">$[arcTemplate(' + st + ')]</div>';
  }
  if (n === 'Stepper') return '\n<!-- #include @wear/range.tpl -->\n';
  if (n === 'StepperLevelIndicator') return '\n<!-- #component level-indicator {} -->\n';
  if (n === 'HorizontalPager' || n === 'VerticalPager') return '\n<!-- #include @wear/pager.tpl -->\n';
  if (n === 'EdgeButton') return emitEdge(node, ctx);
  if (n === 'AlertDialog') return '\n<!-- #include @wear/dialog.tpl -->\n';
  if (n === 'SuccessConfirmationDialog') return '\n<!-- #include @wear/confirm.tpl -->\n';
  if (n === 'TimeText') return '\n<!-- #include @wear/timetext.tpl -->\n';
  if (n === 'ScrollIndicator') return '\n<!-- #include @wear/scrollind.tpl -->\n';
  if (n === 'FilledTonalButton' || n === 'Button') return emitButton(node, ctx, BUTTON_PRESET[n] || BUTTON_PRESET.Button);
  err(node, 'unknown component ' + n);
}

function emitButton(node, ctx, preset) {
  const itemParam = ctx.itemParam;
  let clsName = preset.cls, inkName = preset.ink;
  if (node.args.variant) clsName = textOf(node.args.variant, itemParam);
  if (node.args.ink) inkName = textOf(node.args.ink, itemParam);
  const clsAttr = clsName.startsWith('$item') ? 'btn {{' + clsName + '}}' : 'btn ' + clsName;
  const inkAttr = inkName.startsWith('$item') ? '{{' + inkName + '}}' : inkName;
  const enabledNode = node.args.enabled;
  const enabled = enabledNode && (enabledNode.type === 'bool' ? enabledNode.value : true);
  if (enabledNode && enabledNode.type === 'bool' && enabledNode.value === false) {
    const lab = interpText(slot(node, 'label') || node.args.label, itemParam);
    return '<div class="btn bd"><text class="t-labelM c-dis">' + lab + '</text></div>';
  }
  const id = ctx.listName ? '$item.id' : ('b' + ctx.press++);
  const click = emitCallEvent(node.args.onClick, itemParam, ctx.setters, ctx.listName) || 'vib';
  const labelNode = slot(node, 'label') || node.args.label;
  const sec = node.args.secondaryLabel || (Array.isArray(node.children) && node.children.filter(k => k.type === 'call' && k.name === 'Text')[1]);
  const iconNode = slot(node, 'icon') || node.args.icon;
  const useIcc = !!(iconNode && sec);
  if (sec || useIcc) {
    const lab = interpText(labelNode, itemParam);
    const sub = sec ? interpText(sec, itemParam) : '';
    const ink = useIcc ? 'c-onS' : (preset.cls === 'bf' ? 'c-onPri' : preset.cls === 'bpc' || sec ? 'c-onPC' : preset.ink);
    let lead = '';
    if (iconNode && useIcc) {
      lead = '<div class="icc {{$item.bg}}"><image class="ic-sec" src="' + iconSrc(iconNode, preset.iconRole, 24, itemParam) + '"></image></div>';
    } else if (iconNode) {
      lead = '<image class="ic24" src="' + iconSrc(iconNode, preset.iconRole, preset.iconDp, itemParam) + '"></image>';
    }
    const cls = useIcc ? 'btn btn-ic ' + (clsName.startsWith('$item') ? '{{' + clsName + '}}' : clsName) : (sec && !iconNode ? 'btn bpc' : clsAttr);
    const subCls = useIcc ? 't-labelS c-onSV lab' : 't-labelS c-onSV';
    const labCls = useIcc ? 't-labelM ' + ink + ' lab' : 't-labelM ' + (sec && preset.cls === 'bf' ? 'c-onPC' : ink);
    return '<div class="' + cls + '" ' + sqAttrs(id) + ' onclick="' + click + '">' + lead + '<div class="bcol"><text class="' + labCls + '">' + lab + '</text>' + (sub ? '<text class="' + subCls + '">' + sub + '</text>' : '') + '</div></div>';
  }
  const lab = interpText(labelNode, itemParam);
  const icon = iconNode ? '<image class="ic24" src="' + iconSrc(iconNode, preset.iconRole, preset.iconDp, itemParam) + '"></image>' : '';
  return '<div class="' + clsAttr + '" ' + sqAttrs(id) + ' onclick="' + click + '">' + icon + '<text class="t-labelM ' + inkAttr + ' button-label">' + lab + '</text></div>';
}

function emitIconButton(node, ctx, preset) {
  const id = ctx.listName ? '$item.id' : ('ib' + ctx.press++);
  const click = emitCallEvent(node.args.onClick, ctx.itemParam, ctx.setters, ctx.listName) || 'vib';
  const src = iconSrc(slot(node, 'icon') || node.args.icon || (node.children && node.children[0]), preset.iconRole, preset.iconDp, ctx.itemParam);
  let extra = preset.cls;
  if (node.args.variant) extra = textOf(node.args.variant, ctx.itemParam);
  const cls = extra ? (extra.startsWith('$item') ? 'ib {{' + extra + '}}' : 'ib ' + extra) : 'ib';
  return '<div class="' + cls + '" ' + sqAttrs(id) + ' onclick="' + click + '"><image class="ic26" src="' + src + '"></image></div>';
}

function emitCompact(node, ctx) {
  const kids = Array.isArray(node.children) ? node.children : [];
  const hasLabel = slot(node, 'label') || node.args.label || kids.find(k => k.type === 'call' && k.name === 'Text');
  if (!hasLabel && !node.args.onClick) return '\n<!-- #component compact-button {} -->\n';
  const click = emitCallEvent(node.args.onClick, ctx.itemParam, ctx.setters, ctx.listName) || 'vib';
  const lab = interpText(hasLabel, ctx.itemParam);
  const id = 'compactStatic';
  return '<div class="compact-hit" ' + pressAttrs(id) + ' onclick="' + click + '"><div class="cbtn bt"><text class="t-labelM c-onS">' + lab + '</text></div></div>';
}

function emitSwitch(node, ctx) {
  return '\n<!-- #component switch-button {"item":"$item","index":"$idx"} -->\n';
}

function emitRadio(node, ctx) {
  return '\n<!-- #component radio-button {"item":"$item","index":"$idx"} -->\n';
}

function emitCard(node, ctx, name) {
  const id = 'c' + ctx.press++;
  const variant = name === 'OutlinedCard' ? 'card co' : 'card cs';
  const html = (Array.isArray(node.children) ? node.children : []).map(ch => emitCardChild(ch, ctx)).join('');
  const content = JSON.stringify('\n' + html + '\n');
  return '\n<!-- #component card {"variant": ' + JSON.stringify(variant) + ', "id": ' + JSON.stringify(id) + ', "content": ' + content + '} -->\n';
}

function emitCardChild(ch, ctx) {
  if (ch.type === 'call' && ch.name === 'Row') {
    return '<div class="row">' + (ch.children || []).map(x => emitCardChild(x, ctx)).join('') + '</div>';
  }
  if (ch.type === 'call' && ch.name === 'Icon') {
    return '<image class="appic" src="' + iconSrc(ch, 'primary', 18, ctx.itemParam) + '"></image>';
  }
  if (ch.type === 'call' && ch.name === 'Text') {
    const ty = ch.args.typography ? textOf(ch.args.typography) : 'body';
    const map = { title: 't-titleS c-onS one', titleSmall: 't-titleS c-onS one grow', body: 't-bodyM c-onSV body', bodyMedium: 't-bodyM c-onSV body', bodySmall: 't-bodyS c-onSV', label: 't-labelS c-onSV one grow ml', time: 't-bodyS c-onSV', headline: 't-titleS c-onS one mt' };
    const cls = map[ty] || ty;
    const extra = ch.args.class ? ' ' + textOf(ch.args.class) : '';
    return '<text class="' + cls + extra + '">' + interpText(ch.pos[0] || ch.args.text, ctx.itemParam) + '</text>';
  }
  return '';
}

// MediaColumn { PlayerScreen(..) DemoTap() MediaActions() MediaQueue() } : one vertical <scroll> (Wear OS media app: the
// player is the first full screen, the entity page continues below it). The volume level, ScrollIndicator and TimeText
// stay outside the scroll; the player inside drops its own level / TimeText. Also hosts MediaOutputPicker alone.
function emitMediaColumn(node, ctx) {
  const kids = Array.isArray(node.children) ? node.children : [];
  const isScreen = k => k.type === 'call' && (k.name === 'PlayerScreen' || k.name === 'DemoTap');
  const hasPlayer = kids.some(k => k.type === 'call' && k.name === 'PlayerScreen');
  ctx.inColumn = true;
  let h = hasPlayer ? '\n<!-- #component media-volume-level {} -->\n' : '';
  h += '<scroll class="ml-scroll" scroll-y="true" onscroll="onScroll">\n<div class="ml-col">\n';
  if (hasPlayer) h += '<div class="ml-screen">' + kids.filter(isScreen).map(k => emitControl(k, ctx)).join('') + '</div>\n';
  h += kids.filter(k => !isScreen(k)).map(k => emitControl(k, ctx)).join('');
  h += '<div class="ml-padb"></div>\n</div>\n</scroll>\n<!-- #include @wear/scrollind.tpl -->\n<!-- #include @wear/timetext.tpl -->\n';
  ctx.inColumn = false;
  return h;
}

function emitPlayer(node, inColumn) {
  const marquee = node.args.marquee && (node.args.marquee.type === 'bool' ? node.args.marquee.value : textOf(node.args.marquee) === 'true');
  const left = node.args.left ? textOf(node.args.left) : 'prev';
  const right = node.args.right ? textOf(node.args.right) : 'next';
  const bind = { marquee: marquee ? 'true' : 'false', left: "'" + left + "'", right: "'" + right + "'" };
  if (inColumn) { bind.time = 'false'; bind.level = 'false'; }
  return '\n<!-- #component media-player ' + JSON.stringify(bind) + ' -->\n';
}

function emitEdge(node, ctx) {
  return '<image class="scrim" src="/common/img/scrim.png" style="{{ebSt}}"></image><div class="scrim2" style="{{ebSt}}"></div>\n<!-- #component edge-button {} -->\n';
}

function emitClock() {
  return '<div class="clock-col"><text class="date-label">{{dateStr}}</text>\n<!-- #if pill -->\n<text class="clock-digit">{{hours}}</text><text class="clock-digit">{{minutes}}</text>\n<!-- #else -->\n<text class="clock-digit">{{hm}}</text>\n<!-- #endif -->\n<text class="seconds-label">{{ss}} 秒 · {{ampm}}</text><image class="seconds-bar" src="{{secondsImage}}"></image><div class="clock-action" onclick="toggleH"><div class="cbtn bf"><text class="t-labelM c-onPri">{{h24 ? \'改为 12 小时\' : \'改为 24 小时\'}}</text></div></div></div>';
}

function emitRow(node, ctx) {
  if (node.type === 'call' && (node.name === 'ScreenScaffold' || node.name === 'TransformingLazyColumn')) return emitWidget(node, ctx);
  if (node.type === 'item' || node.type === 'items' || node.type === 'if') return emitWidget(node, ctx);
  return emitControl(node, ctx);
}

function splitScaffold(body) {
  const sc = body.find(n => n.type === 'call' && n.name === 'ScreenScaffold');
  if (!sc) return { chrome: false, list: [], overlay: body, siFrac: 5, title: '' };
  const kids = Array.isArray(sc.children) ? sc.children : [];
  const tlc = kids.find(n => n.type === 'call' && n.name === 'TransformingLazyColumn');
  const overlay = kids.filter(n => n !== tlc);
  const list = tlc ? (Array.isArray(tlc.children) ? tlc.children : []) : [];
  const siFrac = sc.args.siFrac ? +textOf(sc.args.siFrac) : 5;
  const title = sc.args.title ? textOf(sc.args.title) : '';
  const showBack = !(sc.args.showBack && sc.args.showBack.type === 'bool' && sc.args.showBack.value === false);
  const showTime = !(sc.args.timeText && sc.args.timeText.type === 'bool' && sc.args.timeText.value === false);
  const showSi = !(sc.args.scrollIndicator && sc.args.scrollIndicator.type === 'bool' && sc.args.scrollIndicator.value === false);
  return { chrome: true, list, overlay, siFrac, title, showBack, showTime, showSi, hasEdge: overlay.some(n => n.type === 'call' && n.name === 'EdgeButton') };
}

function emitPage(ast) {
  const ctx = { seq: 0, press: 0, setters: [], itemParam: null, listName: null, listSwipe: true };
  const sc = splitScaffold(ast.body);
  const fns = new Set();
  walkFns(ast.body, fns);
  let html = '';
  if (sc.chrome && sc.list.length) {
    const padb = sc.hasEdge ? 'li-ebpad' : 'li-padb';
    const listId = [...fns].some(n => n === 'ProgressIndicator' || n === 'CircularProgressIndicator' || n === 'LinearProgressIndicator' || n === 'SegmentedCircularProgressIndicator' || n === 'ArcProgressIndicator') ? ' id="motionList"' : '';
    html += '<div class="page {{exiting ? \'pg-exit\' : \'pg-enter\'}}" onswipe="onPageSwipe">\n';
    html += '<list' + listId + ' class="lst" onscroll="onScroll" onscrolltop="onTop" onscrollbottom="onBottom" onswipe="onPageSwipe">\n';
    html += '<list-item type="padt" class="li-padt"></list-item>\n';
    if (sc.showBack) {
      html += '<list-item type="back" class="li-nav" onswipe="onPageSwipe">\n';
      html += '<!-- #if !round -->\n';
      html += '<div class="nav-back {{pressId === \'back\' ? \'nav-in\' : \'nav-out\'}}" ontouchstart="press(\'back\')" ontouchend="release(\'back\')" onclick="goBack"><image class="nav-arrow" src="/common/img/back_onSurface_24.png"></image></div>\n';
      html += '<!-- #endif -->\n';
      html += '<!-- #if !pill -->\n';
      html += '<text class="nav-title">{{pageTitle}}</text>\n';
      html += '<!-- #endif -->\n';
      html += '</list-item>\n';
    }
    if (sc.title) {
      html += '<!-- #if pill -->\n<list-item type="title" class="li-page-title"><text class="t-titleM c-on">' + sc.title + '</text></list-item>\n<!-- #endif -->\n';
    }
    sc.list.forEach(n => { html += emitRow(n, ctx); });
    html += '<list-item type="padb" class="' + padb + '"></list-item>\n</list>\n';
    if (sc.showTime) html += '<!-- #include @wear/timetext.tpl -->\n';
    if (sc.showSi) html += '<!-- #include @wear/scrollind.tpl -->\n';
    sc.overlay.forEach(n => { html += emitControl(n, ctx); });
    html += '</div>';
  } else {
    html += '<div class="page" onswipe="onPageSwipe">\n';
    ast.body.forEach(n => {
      if (n.type === 'call' && n.name === 'ScreenScaffold') {
        const kids = Array.isArray(n.children) ? n.children : [];
        kids.forEach(k => { html += emitControl(k, ctx); });
      } else html += emitControl(n, ctx);
    });
    if (![...fns].some(x => x === 'PlayerScreen' || x === 'VolumeScreen' || x === 'TimeText' || x === 'MediaInfo' || x === 'MediaColumn')) {
      html += '\n<!-- #include @wear/timetext.tpl -->\n';
    }
    html += '</div>';
  }
  return { html, fns, setters: ctx.setters, siFrac: sc.siFrac, title: sc.title, chrome: sc.chrome };
}

function renameHooks(src, suffix) {
  let out = src;
  HOOKS.forEach(h => {
    out = out.replace(new RegExp('\\b' + h + '\\s*\\(', 'g'), h + '_' + suffix + '(');
  });
  return out;
}

function mergeHooks(aliases) {
  let s = '';
  HOOKS.forEach(h => {
    const list = aliases[h];
    if (!list || !list.length) return;
    if (h === 'pressSpring' || h === 'pressStyle') {
      s += h + '(id,p){' + list.map(a => '{const r=this.' + a + '(id,p);if(r!=null)return r}').join('') + 'return null;},\n';
    } else if (h === 'overlayBack') {
      s += 'overlayBack(){' + list.map(a => 'if(this.' + a + '() )return true;').join('') + 'return false;},\n';
    } else {
      const extra = h === 'onMotionFrame' ? 'id,p' : '';
      s += h + '(' + extra + '){' + list.map(a => 'this.' + a + '(' + extra + ');').join('') + '},\n';
    }
  });
  return s;
}

function inject(script, packs, setters, title, extraOnInit, extraImports, extraPacks) {
  const user = script || '';
  const imports = [];
  const restLines = [];
  user.split('\n').forEach(line => {
    if (/^\s*import\s/.test(line)) imports.push(line);
    else restLines.push(line);
  });
  let rest = restLines.join('\n').replace(/^\s*\/\/[^\n]*\n/g, '');
  const exp = rest.match(/export\s+default\s*\{([\s\S]*)\}\s*$/);
  if (!exp) throw new Error('compose: script must contain export default { ... }');
  let body = exp[1];
  const priv = body.match(/private\s*:\s*\{/);
  let privBody = '', methods = body;
  if (priv) {
    const start = priv.index + priv[0].length;
    let d = 1, i = start;
    while (i < body.length && d) { if (body[i] === '{') d++; else if (body[i] === '}') d--; i++; }
    privBody = body.slice(start, i - 1);
    methods = body.slice(i).replace(/^\s*,/, '');
  }
  const aliases = {};
  const heads = [];
  const datas = [];
  const meths = [];
  const css = [];
  const seenFile = new Set();
  function addPack(name) {
    const pack = PACKS[name] || (extraPacks && extraPacks[name]);
    if (!pack) return;
    const skipRangeShare = name === 'range' && packs.includes('selection');
    (pack.css || []).forEach(f => { if (!css.includes(f)) css.push(f); });
    (pack.head || []).forEach(f => {
      if (skipRangeShare && f === 'range.head.js') return;
      if (!seenFile.has(f)) { seenFile.add(f); heads.push('// #include @wear/' + f); }
    });
    if (pack.extraHead && !seenFile.has('eh:' + pack.extraHead)) {
      seenFile.add('eh:' + pack.extraHead);
      heads.push(pack.extraHead.trimEnd());
    }
    (pack.data || []).forEach(f => {
      if (skipRangeShare && f === 'range.data.js') return;
      if (!seenFile.has('d' + f)) { seenFile.add('d' + f); datas.push('// #include @wear/' + f); }
    });
    (pack.methods || []).forEach(f => {
      if (f === 'base.js') return;
      if (seenFile.has('m' + f)) return;
      seenFile.add('m' + f);
      meths.push({ file: f, suffix: f.replace(/[^a-z]/g, '') });
    });
  }
  packs.forEach(addPack);
  const methodOrder = { 'media-audio.methods.js': 0, 'media-volume.methods.js': 1, 'volume-screen.methods.js': 2, 'media.methods.js': 3 };
  meths.sort((a, b) => (methodOrder[a.file] != null ? methodOrder[a.file] : 10) - (methodOrder[b.file] != null ? methodOrder[b.file] : 10));
  const methodBits = [];
  meths.forEach(({ file, suffix }) => {
    methodBits.push('// #include @wear/' + file);
  });
  // Rename hooks in included method files via generated aliases after include is expanded? We rewrite at compile by reading files.
  const ROOT = path.join(__dirname, '..');
  const rewritten = [];
  meths.forEach(({ file, suffix }) => {
    let t = fs.readFileSync(path.join(ROOT, 'components/shared', file), 'utf8');
    HOOKS.forEach(h => {
      if (new RegExp('\\b' + h + '\\s*\\(').test(t)) {
        aliases[h] = aliases[h] || [];
        aliases[h].push(h + '_' + suffix);
      }
    });
    rewritten.push(renameHooks(t, suffix));
  });
  HOOKS.forEach(h => {
    if (new RegExp('\\b' + h + '\\s*\\(').test(methods)) {
      aliases[h] = aliases[h] || [];
      aliases[h].push(h + '_user');
      methods = methods.replace(new RegExp('\\b' + h + '\\s*\\(', 'g'), h + '_user(');
    }
  });
  const setterCode = setters.map(setterJs).join('\n');
  methods = methods.replace(/\s*$/, '');
  if (methods.trim() && !/,\s*$/.test(methods)) methods += ',';
  let onInit = 'onInit(){this.setLayout([]);' + (extraOnInit || '') + '},';
  if (/\bonInit\s*\(/.test(methods)) {
    methods = methods.replace(/\bonInit\s*\(/, 'onInit_user(');
    onInit = 'onInit(){this.setLayout([]);' + (extraOnInit || '') + 'this.onInit_user();},';
  }
  privBody = privBody.replace(/\s*$/, '');
  if (privBody && !/,\s*$/.test(privBody)) privBody += ',';
  if (packs.includes('confirm') || packs.includes('edge') || packs.includes('dialog')) {
    privBody += '\n// #if enhanced\ncheckFrames: $[frames(\'check\')],\n// #endif\n';
  }
  const titleField = title ? 'pageTitle:' + JSON.stringify(title) + ',' : '';
  const pre = user.match(/export\s+default/) ? rest.slice(0, rest.search(/export\s+default/)) : '';
  const style = css.map(f => '/* #include @wear/' + f + ' */').join('\n');
  const head = ['// #include @wear/base_head.js'].concat(extraImports || []).concat(imports).concat(heads.filter(h => h !== '// #include @wear/base_head.js')).join('\n');
  const outScript = head + '\n' + pre + '\nexport default {\nprivate:{\n// #include @wear/base_data.js\n' + titleField + 'tlcBase:-1,\n' + datas.filter(d => d !== '// #include @wear/base_data.js').join('\n') + '\n' + privBody + '\n},\n' + onInit + '\n' + setterCode + '\n' + methods + '\n' + rewritten.join('\n') + '\n' + mergeHooks(aliases) + '\n// #include @wear/base.js\n}\n';
  return { script: outScript, style };
}

function extraInit(fns) {
  let s = '';
  if ([...fns].some(n => n === 'Slider' || n === 'SwitchButton')) s += 'if(this.updateSlider)this.updateSlider();';
  if ([...fns].some(n => n === 'Stepper' || n === 'StepperLevelIndicator')) s += 'if(this.updateRange)this.updateRange();';
  return s;
}

function extraImportsFor(script, fns) {
  const out = [];
  if ([...fns].some(n => /Progress|Circular|Linear|Arc/.test(n)) && !/progressImage/.test(script || '')) out.push("import { progressImage } from '../../common/m3.js'");
  if ([...fns].some(n => n === 'HorizontalPager' || n === 'VerticalPager') && !/pageDots/.test(script || '')) out.push("import { pageDots, pagerState } from '../../common/m3.js'");
  if (/@system.audio/.test(script || '')) { /* user imported */ }
  return out;
}

function extraPacksFrom(script) {
  const extra = {};
  if (/mdaOpen|media-audio/.test(script || '')) extra.mediaAudio = { head: ['media-audio.head.js'], methods: ['media-audio.methods.js'] };
  if (/mdvSet|media-volume/.test(script || '')) extra.mediaVolume = { head: ['media-volume.head.js'], methods: ['media-volume.methods.js'] };
  return extra;
}

function compileM3(source) {
  const ast = parseWithPos(source);
  const page = emitPage(ast);
  const packs = collectPacks(page.fns);
  const extras = extraPacksFrom(ast.script);
  const localPacks = [];
  packs.forEach(p => {
    if (p === 'media') {
      if (extras.mediaAudio) localPacks.push('mediaAudio');
      if (extras.mediaVolume) localPacks.push('mediaVolume');
    }
    localPacks.push(p);
  });
  Object.keys(extras).forEach(k => { if (!localPacks.includes(k)) localPacks.push(k); });
  const inj = inject(ast.script || 'export default {\nprivate:{}\n}', localPacks, page.setters, page.title, extraInit(page.fns), extraImportsFor(ast.script, page.fns), extras);
  const extraStyle = (source.match(/<style>([\s\S]*?)<\/style>/i) || [])[1] || '';
  const setLine = page.siFrac && page.siFrac !== 5 ? '<!-- #set siFrac = ' + page.siFrac + ' -->\n' : '';
  const ux = setLine + '<template>\n' + page.html + '\n</template>\n<style>\n' + inj.style + '\n' + extraStyle + '\n</style>\n<script>\n' + inj.script + '\n</script>\n';
  return ux;
}

module.exports = { compileM3, parse: parseWithPos, tokenize, collectPacks, emitPage };
