/* global document */
import Conditionals from '../conditionals';
import * as fs from 'fs';

document.body.innerHTML = fs.readFileSync('__tests__/resources/conditional.html', 'utf-8');

describe('Conditionals', () => {
  describe('#getInputType', () => {
    it('returns select input type', () => {
      const c = new Conditionals({
        control: '#shuttle__1234 .test-select select',
        toggleClass: 'hide__1234',
        visibility: {
          first: '#shuttle__1234 .test-select .a',
          second: '#shuttle__1234 .test-select .b',
        },
      });

      expect(c.getInputType()).toBe('select');
    });

    it('returns radio input type', () => {
      const c = new Conditionals({
        control: '#shuttle__1234 .test-radio [type="radio"]',
        toggleClass: 'hide__1234',
        visibility: {
          first: '#shuttle__1234 .test-radio .a',
          second: '#shuttle__1234 .test-radio .b',
        },
      });

      expect(c.getInputType()).toBe('radio');
    });

    it('returns checkbox input type', () => {
      const c = new Conditionals({
        control: '#shuttle__1234 .test-checkbox [type="checkbox"]',
        toggleClass: 'hide__1234',
        visibility: {
          off: '#shuttle__1234 .test-checkbox .a',
          on: '#shuttle__1234 .test-checkbox .b',
        },
      });

      expect(c.getInputType()).toBe('checkbox');
    });
  });
  describe('#onChange', () => {
    const event = new Event('change');
    it('and the control changes value', () => {
      const c = new Conditionals({
        control: '#shuttle__1234 .test-select select',
        toggleClass: 'hide__1234',
        visibility: {
          first: '#shuttle__1234 .test-select .a',
          second: '#shuttle__1234 .test-select .b',
        },
      });

      const a = document.querySelector('.test-select .a');
      const b = document.querySelector('.test-select .b');
      c.control.value = 'first';
      c.control.dispatchEvent(event);

      expect(a.classList.contains('hide__1234')).toBe(false);
      expect(b.classList.contains('hide__1234')).toBe(true);
    });

    it('and the control is a radio input', () => {
      const c = new Conditionals({
        control: '#shuttle__1234 .test-radio [type=radio]',
        toggleClass: 'hide__1234',
        visibility: {
          first: '#shuttle__1234 .test-radio .a',
          second: '#shuttle__1234 .test-radio .b',
        },
      });

      const a = document.querySelector('.test-radio .a');
      const b = document.querySelector('.test-radio .b');
      c.control.checked = true;
      c.control.dispatchEvent(event);

      expect(a.classList.contains('hide__1234')).toBe(false);
      expect(b.classList.contains('hide__1234')).toBe(true);
    });

    it('and the control is a checkbox input', () => {
      const c = new Conditionals({
        control: '#shuttle__1234 .test-checkbox [type="checkbox"]',
        toggleClass: 'hide__1234',
        visibility: {
          off: '#shuttle__1234 .test-checkbox .a',
          on: '#shuttle__1234 .test-checkbox .b',
        },
      });

      const a = document.querySelector('.test-checkbox .a');
      const b = document.querySelector('.test-checkbox .b');
      c.control.checked = true;
      c.control.dispatchEvent(event);

      expect(a.classList.contains('hide__1234')).toBe(true);
      expect(b.classList.contains('hide__1234')).toBe(false);
    });
  });

  describe('#destroy', () => {
    const event = new Event('change');
    it('removes the event listener', () => {
      const c = new Conditionals({
        control: '#shuttle__1234 .test-destroy [type="checkbox"]',
        toggleClass: 'hide__1234',
        visibility: {
          off: '#shuttle__1234 .test-destroy .a',
          on: '#shuttle__1234 .test-destroy .b',
        },
      });

      const a = document.querySelector('.test-destroy .a');
      const b = document.querySelector('.test-destroy .b');
      c.control.checked = true;
      c.control.dispatchEvent(event);
      c.destroy();

      expect(a.classList.contains('hide__1234')).toBe(true);
      expect(b.classList.contains('hide__1234')).toBe(false);

      c.control.checked = false;
      c.control.dispatchEvent(event);

      expect(a.classList.contains('hide__1234')).toBe(true);
      expect(b.classList.contains('hide__1234')).toBe(false);
    });
  });
});

describe('Conditionals Exceptions', () => {
  it('control selector empty', () => {
    const c = new Conditionals({
      control: '.nononono',
      toggleClass: 'hide__1234',
      visibility: {
        first: '#shuttle__1234 .test-select .a',
        second: '#shuttle__1234 .test-select .b',
      },
    });

    expect(c.control).toBe(null);
  });
});
