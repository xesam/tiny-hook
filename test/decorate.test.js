const decorate = require('../src/decorate');

describe('decorate', () => {
    it('decorate#_function empty', () => {
        const targetFn = jest.fn();
        const decorated = decorate(targetFn);
        decorated(100, 200);
        expect(targetFn.mock.calls[0]).toEqual([100, 200]);
    });
    it('decorate#_function empty this', () => {
        const targetFn = jest.fn();

        global.name = 'global';

        function target(a, b) {
            targetFn(this.name, a, b);
        }

        const decorated = decorate(target);
        decorated(100, 200);
        expect(targetFn.mock.calls[0]).toEqual(['global', 100, 200]);
    });
    it('decorate#_function function', () => {
        const targetFn = jest.fn();
        const beforeCallback = jest.fn();
        const afterCallback = jest.fn();

        let decorated = decorate(targetFn, function (src, a, b) {
            beforeCallback(a, b);
            src(a, b);
            afterCallback(a, b);
        });
        decorated(100, 200);

        expect(beforeCallback.mock.calls[0]).toEqual([100, 200]);
        expect(targetFn.mock.calls[0]).toEqual([100, 200]);
        expect(afterCallback.mock.calls[0]).toEqual([100, 200]);
    });
    it('decorate#_function chain', () => {
        const targetFn = jest.fn();
        const beforeCallback = jest.fn();
        const afterCallback = jest.fn();

        let decorated = decorate(targetFn, function (src, a, b) {
            beforeCallback(a, b);
            src(a, b);
            afterCallback(a, b);
        });
        decorated = decorated.decorate(function (src, a, b) {
            beforeCallback(a, b);
            src(a, b);
            afterCallback(a, b);
        });
        decorated(100, 200);

        expect(beforeCallback).toBeCalledTimes(2);
        expect(targetFn).toBeCalledTimes(1);
        expect(afterCallback).toBeCalledTimes(2);
    });
    it('decorate#_function this', () => {
        const targetFn = jest.fn();

        global.extra = 'global';
        function fn(a, b) {
            targetFn(this.extra, a, b);
        }

        fn.extra = 'fn.extra';
        const thisArg = {
            extra: 'param.extra'
        };
        const decorated = decorate(fn, function (src, a, b) {
            src.call(this, a, b);
        }, thisArg);
        decorated(100, 200);
        expect(targetFn.mock.calls[0]).toEqual(['param.extra', 100, 200]);
    });
    it('decorate#_object chain', () => {
        const targetFn = jest.fn();
        const beforeCallback = jest.fn();
        const afterCallback = jest.fn();

        let decorated = decorate(targetFn, {
            before(a, b) {
                beforeCallback(a, b);
            },
            after(a, b) {
                afterCallback(a, b);
            }
        });
        decorated = decorated.decorate({
            before(a, b) {
                beforeCallback(a, b);
            },
            after(a, b) {
                afterCallback(a, b);
            }
        });
        decorated(100, 200);

        expect(beforeCallback).toBeCalledTimes(2);
        expect(targetFn).toBeCalledTimes(1);
        expect(afterCallback).toBeCalledTimes(2);
    });
    it('decorate#_object this', () => {
        const targetFn = jest.fn();
        const beforeCallback = jest.fn();
        const afterCallback = jest.fn();

        global.extra = 'global.extra';
        function fn(a, b) {
            targetFn(this.extra, a, b);
        }

        fn.extra = 'fn.extra';
        const decorated = decorate(fn, {
            before(a, b) {
                beforeCallback(this.extra, a, b);
            },
            after(a, b) {
                afterCallback(this.extra, a, b);
            }
        });
        decorated(100, 200);

        expect(beforeCallback.mock.calls[0]).toEqual(['global.extra', 100, 200]);
        expect(targetFn.mock.calls[0]).toEqual(['global.extra', 100, 200]);
        expect(afterCallback.mock.calls[0]).toEqual(['global.extra', 100, 200]);
    });
    it('decorate#_object this', () => {
        const targetFn = jest.fn();
        const beforeCallback = jest.fn();
        const afterCallback = jest.fn();

        function fn(a, b) {
            targetFn(this.name, a, b);
        }

        fn.name = 'fn.extra';
        const thisArg = {
            name: 'param.extra'
        };

        const decorated = decorate(fn, {
            before(a, b) {
                beforeCallback(this.name, a, b);
            },
            after(a, b) {
                afterCallback(this.name, a, b);
            }
        }, thisArg);
        decorated(100, 200);

        expect(beforeCallback.mock.calls[0]).toEqual(['param.extra', 100, 200]);
        expect(targetFn.mock.calls[0]).toEqual(['param.extra', 100, 200]);
        expect(afterCallback.mock.calls[0]).toEqual(['param.extra', 100, 200]);
    });
    it('decorate throw', () => {
        const beforeCallback = jest.fn();
        const afterCallback = jest.fn();
        const throwCallback = jest.fn();

        function fn() {
            throw {msg: 'fn.error'};
        }

        const decorated = decorate(fn, {
            before() {
                beforeCallback();
            },
            after() {
                afterCallback();
            },
            afterThrow(e) {
                throwCallback(e);
            }
        });
        decorated(100, 200);
        expect(beforeCallback).toBeCalled();
        expect(afterCallback).not.toBeCalled();
        expect(throwCallback).toBeCalled();
    });
});