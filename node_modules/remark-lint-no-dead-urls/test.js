'use strict';

jest.mock('check-links', () => {
  return jest.fn(() => Promise.resolve({}));
});

jest.mock('is-online', () => {
  return jest.fn(() => Promise.resolve(true));
});

const remark = require('remark');
const dedent = require('dedent');
const checkLinks = require('check-links');
const isOnline = require('is-online');
const plugin = require('.');

const processMarkdown = (md, opts) => {
  return remark()
    .use(plugin, opts)
    .process(md);
};

describe('remark-lint-no-dead-urls', () => {
  test('works with no URLs', () => {
    const lint = processMarkdown(dedent`
      # Title

      No URLs in here.
    `);

    return lint.then((vFile) => {
      expect(checkLinks).toHaveBeenCalledTimes(1);
      expect(vFile.messages.length).toBe(0);
    });
  });

  test('works', () => {
    const lint = processMarkdown(
      dedent`
      # Title

      Here is a [good link](https://www.github.com).

      Here is a [bad link](https://github.com/unified/oops).

      Here is a [local link](http://localhost:3000).
    `,
      {
        gotOptions: {
          retry: 0
        }
      }
    );

    checkLinks.mockReturnValue(
      Promise.resolve({
        'https://www.github.com': { status: 'alive', statusCode: 200 },
        'https://github.com/unified/oops': {
          status: 'dead',
          statusCode: 404
        },
        'http://localhost:3000': { status: 'dead', statusCode: 404 }
      })
    );

    return lint.then((vFile) => {
      expect(checkLinks).toHaveBeenCalledTimes(1);
      expect(checkLinks.mock.calls[0][0]).toEqual([
        'https://www.github.com',
        'https://github.com/unified/oops',
        'http://localhost:3000'
      ]);

      expect(vFile.messages.length).toBe(2);
      expect(vFile.messages[0].reason).toBe(
        'Link to https://github.com/unified/oops is dead'
      );
      expect(vFile.messages[1].reason).toBe(
        'Link to http://localhost:3000 is dead'
      );
    });
  }, 15000);

  test('works with definitions and images', () => {
    const lint = processMarkdown(
      dedent`
      # Title

      Here is a good pig: ![picture of pig](/pig-photos/384).

      Download the pig picture [here](/pig-photos/384).

      Here is a [bad link]. Here is that [bad link] again.

      [bad link]: /oops/broken
    `,
      {
        gotOptions: {
          baseUrl: 'http://my.domain.com'
        }
      }
    );

    checkLinks.mockReturnValue(
      Promise.resolve({
        '/pig-photos/384': { status: 'alive', statusCode: 200 },
        '/oops/broken': { status: 'dead', statusCode: 404 }
      })
    );

    return lint.then((vFile) => {
      expect(checkLinks).toHaveBeenCalledTimes(1);
      expect(checkLinks.mock.calls[0][0]).toEqual([
        '/pig-photos/384',
        '/oops/broken'
      ]);
      expect(checkLinks.mock.calls[0][1]).toEqual({
        baseUrl: 'http://my.domain.com'
      });
      expect(vFile.messages.length).toBe(1);
      expect(vFile.messages[0].reason).toBe('Link to /oops/broken is dead');
    });
  });

  test('skips URLs with unsupported protocols', () => {
    const lint = processMarkdown(dedent`
      [Send me an email.](mailto:me@me.com)
      [Look at this file.](ftp://path/to/file.txt)
      [Special schema.](flopper://a/b/c)
    `);

    return lint.then((vFile) => {
      expect(checkLinks).toHaveBeenCalledTimes(1);
      expect(checkLinks.mock.calls[0][0]).toEqual([
        'mailto:me@me.com',
        'ftp://path/to/file.txt',
        'flopper://a/b/c'
      ]);
      expect(checkLinks.mock.calls[0][1]).toEqual(undefined);
      expect(vFile.messages.length).toBe(0);
    });
  });

  test('warns if you are not online', () => {
    isOnline.mockReturnValueOnce(Promise.resolve(false));

    const lint = processMarkdown(dedent`
      Here is a [bad link](https://github.com/davidtheclark/oops).
    `);

    return lint.then((vFile) => {
      expect(vFile.messages.length).toBe(1);
      expect(vFile.messages[0].reason).toMatch('You are not online');
    });
  });

  test('skipOffline: true', () => {
    isOnline.mockReturnValueOnce(Promise.resolve(false));

    const lint = processMarkdown(
      dedent`
      Here is a [bad link](https://github.com/davidtheclark/oops).
    `,
      {
        skipOffline: true
      }
    );

    return lint.then((vFile) => {
      expect(vFile.messages.length).toBe(0);
    });
  });

  describe('skipLocalhost: true', () => {
    test('localhost', () => {
      const lint = processMarkdown(
        dedent`
          - [http://localhost](http://localhost)
          - [http://localhost/alex/test](http://localhost/alex/test)
          - [http://localhost:3000](http://localhost:3000)
          - [http://localhost:3000/alex/test](http://localhost:3000/alex/test)
          - [https://localhost](http://localhost)
          - [https://localhost/alex/test](http://localhost/alex/test)
          - [https://localhost:3000](http://localhost:3000)
          - [https://localhost:3000/alex/test](http://localhost:3000/alex/test)
        `,
        {
          skipLocalhost: true
        }
      );

      return lint.then((vFile) => {
        expect(vFile.messages.length).toBe(0);
      });
    });

    test('local IP 127.0.0.1', () => {
      const lint = processMarkdown(
        dedent`
          - [http://127.0.0.1](http://127.0.0.1)
          - [http://127.0.0.1:3000](http://127.0.0.1:3000)
          - [http://127.0.0.1/alex/test](http://127.0.0.1)
          - [http://127.0.0.1:3000/alex/test](http://127.0.0.1:3000)
          - [https://127.0.0.1](http://127.0.0.1)
          - [https://127.0.0.1:3000](http://127.0.0.1:3000)
          - [https://127.0.0.1/alex/test](http://127.0.0.1)
          - [https://127.0.0.1:3000/alex/test](http://127.0.0.1:3000)
        `,
        {
          skipLocalhost: true
        }
      );

      return lint.then((vFile) => {
        expect(vFile.messages.length).toBe(0);
      });
    });
  });
});
