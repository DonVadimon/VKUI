import { baselineComponent, mockScrollContext, mountTest } from '../../testing/utils';
import { render } from '@testing-library/react';
import View from '../View/View';
import Root from './Root';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const views = [
  <View id="v1" key="1" activePanel={null} />,
  <View id="v2" key="2" activePanel={null} />,
];

describe('Root', () => {
  baselineComponent(Root);
  describe('With View', () =>
    mountTest(() => <Root activeView="view"><View id="view" activePanel={null} /></Root>));

  describe('shows active view', () => {
    it('on mount', () => {
      render(<Root activeView="v1">{views}</Root>);
      expect(document.getElementById('v1')).not.toBeNull();
      expect(document.getElementById('v2')).toBeNull();
    });
    it('after prop update', () => {
      render(<Root activeView="v1">{views}</Root>)
        .rerender(<Root activeView="v2">{views}</Root>);
      jest.runAllTimers();
      expect(document.getElementById('v1')).toBeNull();
      expect(document.getElementById('v2')).not.toBeNull();
    });
    it('calls onTransition', () => {
      const onTransition = jest.fn();
      render(<Root activeView="v1" onTransition={onTransition}>{views}</Root>)
        .rerender(<Root activeView="v2" onTransition={onTransition}>{views}</Root>);
      jest.runAllTimers();
      expect(onTransition).toBeCalledTimes(1);
      expect(onTransition).toBeCalledWith({ from: 'v1', to: 'v2', isBack: false });
    });
    it('detects back transition', () => {
      const onTransition = jest.fn();
      render(<Root activeView="v2" onTransition={onTransition}>{views}</Root>)
        .rerender(<Root activeView="v1" onTransition={onTransition}>{views}</Root>);
      jest.runAllTimers();
      expect(onTransition).toBeCalledWith({ from: 'v2', to: 'v1', isBack: true });
    });
  });

  describe('blurs active element', () => {
    const renderFocused = () => render(<input autoFocus data-testid="__autofocus__" />);
    it('on activeView change', () => {
      renderFocused();
      const views = [<View id="focus" activePanel={null} key="1" />, <View id="other" activePanel={null} key="2" />];
      render(<Root activeView="focus">{views}</Root>)
        .rerender(<Root activeView="other">{views}</Root>);
      expect(document.activeElement === document.body).toBe(true);
    });
    it('on popout', () => {
      renderFocused();
      render(<Root activeView="focus"><View id="focus" activePanel={null} /></Root>)
        .rerender(<Root activeView="focus" popout={<div />}><View id="focus" activePanel={null} /></Root>);
      expect(document.activeElement === document.body).toBe(true);
    });
  });

  describe('scroll control', () => {
    it('restores on back navigation', () => {
      let y = 101;
      const [MockScroll, scrollTo] = mockScrollContext(() => y);
      const h = render(<MockScroll><Root activeView="v1">{views}</Root></MockScroll>);
      // trigger scroll save
      h.rerender(<MockScroll><Root activeView="v2">{views}</Root></MockScroll>);
      h.rerender(<MockScroll><Root activeView="v1">{views}</Root></MockScroll>);
      jest.runAllTimers();
      expect(scrollTo).toBeCalledWith(0, y);
    });
    it('resets on forward navigation', () => {
      let y = 101;
      const [MockScroll, scrollTo] = mockScrollContext(() => y);
      const h = render(<MockScroll><Root activeView="v2">{views}</Root></MockScroll>);
      // trigger scroll save
      h.rerender(<MockScroll><Root activeView="v1">{views}</Root></MockScroll>);
      h.rerender(<MockScroll><Root activeView="v2">{views}</Root></MockScroll>);
      jest.runAllTimers();
      expect(scrollTo.mock.calls[scrollTo.mock.calls.length - 1]).toEqual([0, 0]);
    });
  });
});
