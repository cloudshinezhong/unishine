!(function (e) {
  if ('object' == typeof exports && 'undefined' != typeof module) module.exports = e()
  else if ('function' == typeof define && define.amd) define([], e)
  else {
    var n
    ;(n =
      'undefined' != typeof window
        ? window
        : 'undefined' != typeof global
          ? global
          : 'undefined' != typeof self
            ? self
            : this),
      (n.markdownitMark = e())
  }
})(function () {
  return (function e(n, t, o) {
    function r(s, f) {
      if (!t[s]) {
        if (!n[s]) {
          var u = 'function' == typeof require && require
          if (!f && u) return u(s, !0)
          if (i) return i(s, !0)
          var l = new Error("Cannot find module '" + s + "'")
          throw ((l.code = 'MODULE_NOT_FOUND'), l)
        }
        var p = (t[s] = { exports: {} })
        n[s][0].call(
          p.exports,
          function (e) {
            var t = n[s][1][e]
            return r(t ? t : e)
          },
          p,
          p.exports,
          e,
          n,
          t,
          o,
        )
      }
      return t[s].exports
    }
    for (var i = 'function' == typeof require && require, s = 0; s < o.length; s++) r(o[s])
    return r
  })(
    {
      1: [
        function (e, n, t) {
          'use strict'
          n.exports = function (e) {
            function n(e, n) {
              var t,
                o,
                r,
                i,
                s,
                f = e.pos,
                u = e.src.charCodeAt(f)
              if (n) return !1
              if (61 !== u) return !1
              if (
                ((o = e.scanDelims(e.pos, !0)), (i = o.length), (s = String.fromCharCode(u)), 2 > i)
              )
                return !1
              for (
                i % 2 && ((r = e.push('text', '', 0)), (r.content = s), i--), t = 0;
                i > t;
                t += 2
              )
                (r = e.push('text', '', 0)),
                  (r.content = s + s),
                  e.delimiters.push({
                    marker: u,
                    jump: t,
                    token: e.tokens.length - 1,
                    level: e.level,
                    end: -1,
                    open: o.can_open,
                    close: o.can_close,
                  })
              return (e.pos += o.length), !0
            }
            function t(e) {
              var n,
                t,
                o,
                r,
                i,
                s = [],
                f = e.delimiters,
                u = e.delimiters.length
              for (n = 0; u > n; n++)
                (o = f[n]),
                  61 === o.marker &&
                    -1 !== o.end &&
                    ((r = f[o.end]),
                    (i = e.tokens[o.token]),
                    (i.type = 'mark_open'),
                    (i.tag = 'mark'),
                    (i.nesting = 1),
                    (i.markup = '=='),
                    (i.content = ''),
                    (i = e.tokens[r.token]),
                    (i.type = 'mark_close'),
                    (i.tag = 'mark'),
                    (i.nesting = -1),
                    (i.markup = '=='),
                    (i.content = ''),
                    'text' === e.tokens[r.token - 1].type &&
                      '=' === e.tokens[r.token - 1].content &&
                      s.push(r.token - 1))
              for (; s.length; ) {
                for (
                  n = s.pop(), t = n + 1;
                  t < e.tokens.length && 'mark_close' === e.tokens[t].type;

                )
                  t++
                t--, n !== t && ((i = e.tokens[t]), (e.tokens[t] = e.tokens[n]), (e.tokens[n] = i))
              }
            }
            e.inline.ruler.before('emphasis', 'mark', n),
              e.inline.ruler2.before('emphasis', 'mark', t)
          }
        },
        {},
      ],
    },
    {},
    [1],
  )(1)
})
