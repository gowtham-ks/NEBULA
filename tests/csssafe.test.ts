import { describe, expect, it } from 'vitest';
import { validateCss } from '../src/shared/csssafe';

describe('validateCss', () => {
  it('accepts ordinary CSS', () => {
    expect(validateCss('a:hover{color:#fff;margin:0 auto}')).toEqual([]);
  });
  it('allows data:image urls', () => {
    expect(validateCss('a{background:url("data:image/png;base64,AAAA")}')).toEqual([]);
  });
  it('blocks @import', () => {
    expect(validateCss('@import url(x.css);').length).toBeGreaterThan(0);
  });
  it('blocks remote url()', () => {
    expect(validateCss('a{background:url(https://evil.test/a.png)}').length).toBeGreaterThan(0);
  });
  it('blocks CSS-escaped url()', () => {
    expect(validateCss('a{background:\\75rl(https://evil.test/a.png)}').length).toBeGreaterThan(0);
  });
  it('blocks image-set()', () => {
    expect(validateCss('a{background:image-set("https://evil.test/a.png" 1x)}').length).toBeGreaterThan(0);
  });
  it('blocks script-like constructs', () => {
    expect(validateCss('a{width:expression(alert(1))}').length).toBeGreaterThan(0);
  });
  it('detects unbalanced braces and unterminated strings', () => {
    expect(validateCss('a{color:red').length).toBeGreaterThan(0);
    expect(validateCss('a{content:"x}').length).toBeGreaterThan(0);
  });
});
