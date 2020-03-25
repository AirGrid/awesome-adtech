# Changelog

## 1.0.2

- Walk the AST fewer times.

## 1.0.1

- Bump patch versions of dependencies.

## 1.0.0

- Add `skipLocalhost` option.

## 0.5.0

- Drop Node 6 support.
- Update dependencies to remove deprecation notice about `OutgoingMessage.prototype._headers`.

## 0.4.1

- Bump check-links dependency.

## 0.4.0

- Use [check-links](https://github.com/transitive-bullshit/check-links).
- Replace `baseUrl` option with `gotOptions.baseUrl`.
- Remove `cache` option. check-links does not expose similar cache configuration.
- Drop Node 4 support.

## 0.3.0

- Skip URLs with protocols other than `http:` and `https:`.
- Handle offline smoothly and add `skipOffline` option.

## 0.2.0

- Start this log.
