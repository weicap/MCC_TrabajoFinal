(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
(function (global,Buffer){(function (){
//browserify -t brfs practice_4/KNN/examples/mutable/read_json_dr.js  > practice_4/KNN/examples/mutable/read_json_dr_converted.js
//browserify -t brfs read_json_dr.js > read_json_dr_converted.js



class Data {
    constructor() {
        this.r_Pca_diabetes = this.read_json_descriptor_dr();
    }

    read_json_descriptor_dr() {
        // var array_embbeding = Buffer("W1siQ2xhc3MgQSIsMC4wMDUzMjAwNjMyMjQxOTU3NzYsMC4wNDgxNjI2MjA0MDY2NTgyNF0sWyJDbGFzcyBBIiwwLjAwNDc5OTgzMjA2ODYwMTEwMiwwLjA0Nzk2MTMwOTEzNDE1NDQzXSxbIkNsYXNzIEEiLDAuMDA1MDE2NzQ5MjQ4MzY2NDk5LDAuMDQ4MDg2MjU2MjUxMDU1MTE1XSxbIkNsYXNzIEEiLC0wLjAyNTQzNTI1NzMyOTA4NjgxNiwtMC4wMTY5ODEzNzIwMzY1NTk1NTJdLFsiQ2xhc3MgQSIsLTAuMDIyNzAyOTU5MTIxMDc4OTY1LC0wLjAxMDk5NzMxMTAwNDIzMDg5M10sWyJDbGFzcyBBIiwwLjA0OTAwNzAyNzY1NjY4MzQ2NiwwLjEyMDI4OTY0Mzc4NjA1ODQ0XSxbIkNsYXNzIEEiLC0wLjAyNDEyODQ0NTEzODc1NDAwNywtMC4wMTQwOTIwODIyOTUyODY5MjddLFsiQ2xhc3MgQSIsLTAuMDIwODMwOTk2NjY0NjgyMSwtMC4wMDcyNjk3MTQ1MTA2NDc4NTldLFsiQ2xhc3MgQSIsLTAuMDI2NDA1NTI2ODcyOTMyOTkyLC0wLjAxOTMwODY4MzEwNTQ0MzA2NF0sWyJDbGFzcyBBIiwtMC4wMTg3NTY1MjY4NDM1MTQ4ODIsLTAuMDAzNjA2NzM5ODIxMjA0NjQxNV0sWyJDbGFzcyBBIiwtMC4wMjU3MTc3OTY3NDY1ODA4NzUsLTAuMDE3NjAyNTMwOTgxOTM0MzFdLFsiQ2xhc3MgQSIsLTAuMDI1MzYzNDc2OTEzMDA5MTMzLC0wLjAxNjc3Nzg4NzEzODk2NTg0OF0sWyJDbGFzcyBBIiwtMC4wMjYwODMyOTU4NDQxOTEwNzgsLTAuMDE4NTAwODQ0NjY0NDU1MDI4XSxbIkNsYXNzIEEiLC0wLjAwNzcxNzQxMDQxMDg3MjU0NywwLjAxNzk3MjQ2NTM1NzE4MjkyMl0sWyJDbGFzcyBBIiwtMC4wMjMzNjAyNjczNjc2NTQ4MzgsLTAuMDEyMzIxOTM0MTA2Njg1MzAxXSxbIkNsYXNzIEEiLC0wLjAyNjExODM1OTMyOTEzNjI2LC0wLjAxODYzMjU5MjUyNTgxMzY1XSxbIkNsYXNzIEEiLC0wLjAyNTg4MDY0NDg2NjcxNDg2LC0wLjAxODAyNTQwNTk1NTQ1ODI1NV0sWyJDbGFzcyBBIiwtMC4wMjYyODQ4MDExMTgwMjY0NDMsLTAuMDE5MDE3NzMxODk0MTY3ODU3XSxbIkNsYXNzIEEiLC0wLjAyNDYyNzM2MDc3MjI1ODU2LC0wLjAxNTExMTA5MTA4MDAyMDQzXSxbIkNsYXNzIEEiLC0wLjAyNjI1NjE0NzI4NDE1ODMyNiwtMC4wMTg5Nzc5NjY1NjU5NTAxNjhdLFsiQ2xhc3MgQSIsLTAuMDIzMzc5NjQ5MDE1NzU0OTcsLTAuMDEyNDM3MTA0MjI4NTc4NTc0XSxbIkNsYXNzIEEiLC0wLjAxMDA5NDU3OTQwMjAxNDk5NywwLjAxMDcxMDA2NzgyNDQ0MDExOV0sWyJDbGFzcyBBIiwtMC4wMTcxODE1MDMwMDk4MjMwMzIsLTAuMDAwNzcxNzU0OTI1MTk4Nzc1XSxbIkNsYXNzIEEiLC0wLjAyMDc3ODcxMjE1OTczNzA3LC0wLjAwNzEyNzM0MDczMTk4OTQ5NF0sWyJDbGFzcyBBIiwtMC4wMjMzMzczMjM0ODUxNDE0NTUsLTAuMDEyNTA4NjI0Mzc1MzI4NDIyXSxbIkNsYXNzIEEiLDAuMjYwMjczMzA2ODYxNTYwOTcsLTAuMTg3Mzg4NTkxMzc5NjM0MDddLFsiQ2xhc3MgQSIsLTAuMDE1NDA3OTMwNDg4NDg1OTc2LDAuMDAyMTk0MTQzMzQ2Njg1NzI3XSxbIkNsYXNzIEEiLDAuMDM3MzY5MzY5Nzk4MDIzMjEsMC4xMDIwMjYxODExMDU3MjYwMl0sWyJDbGFzcyBBIiwtMC4wMjMyMDQ5MDk3Nzg5NTY4MDgsLTAuMDEyMDQ2MTk0NTE2NDMzMjU1XSxbIkNsYXNzIEEiLC0wLjAyMTE3Mzk4MjYxOTcxMDE3LC0wLjAwNzczOTU0Mzc4ODc4NDQ4NF0sWyJDbGFzcyBBIiwtMC4wMjQ4ODY4MjM1OTMzODUzNjQsLTAuMDE1NzEwNTY1ODQ4MTk4MTk1XSxbIkNsYXNzIEEiLC0wLjAxNTkxMTIzODA4MDI5MTczMywwLjAwMTA1NTI5OTY1OTkwODg5ODRdLFsiQ2xhc3MgQSIsLTAuMDI1ODUxNjkxMzIyMTM3MzQ4LC0wLjAxNzk2MTEzMjI0NDI1MzE0XSxbIkNsYXNzIEEiLC0wLjAwOTc3OTgzNTMzMjI2ODk4NCwwLjAxMDQwNjIwMjc0MTM5NDQ0NF0sWyJDbGFzcyBBIiwtMC4wMDYzMjgyODMzNjE2OTg5NzEsMC4wMTYzNjc3MTU4NDAyNzc5NjNdLFsiQ2xhc3MgQSIsLTAuMDI1NzI5OTM5ODYxNTg4NjMsLTAuMDE3Njk0NjAzNDkyNDg2NDY1XSxbIkNsYXNzIEEiLC0wLjAyNDkwODk2NTc4NDQ5NzExLC0wLjAxNTc3NDY2MTI3MTAxODA0XSxbIkNsYXNzIEEiLDAuMTE1NzQ4Nzc0NjQ2Mzg5NzcsMC4xNTg4NjMzMTUzODY2NTk1N10sWyJDbGFzcyBBIiwtMC4wMjYyNDU3OTY4MjcxMDkzMjQsLTAuMDE4OTE2NTAyMjAxNjE0OTUyXSxbIkNsYXNzIEEiLC0wLjAyMjk4ODU2OTUzNzQwNzEwMiwtMC4wMTE1MTY5OTAwMjgxNDcwNF0sWyJDbGFzcyBBIiwtMC4wMjIzNDM2NjIwNzAzMDk3MjQsLTAuMDEwMjQ0MDk1NjMzMjg1Njg4XSxbIkNsYXNzIEEiLDAuMTQ4NDQ0Nzk5MTI3NjQyNSwwLjEyNjk3NDM5NjM4MDQ3Nl0sWyJDbGFzcyBBIiwwLjAzODU3MTQ0NzY4NDYxNDA3LDAuMTA3MTIwMTgxMDEyMzY2MjddLFsiQ2xhc3MgQSIsMC4wMDQ2MzcyODQ1ODAxNTMyNjI0LDAuMDQ3ODgxOTc4MjMzODcyNDA2XSxbIkNsYXNzIEEiLDAuMDcwOTA2MzkyMjk3ODE5MTMsMC4xNDYxMjA4ODMyODMxNzM2M10sWyJDbGFzcyBBIiwwLjAwNTU4OTQ3NTYxMjM0NTUzMSwwLjA0OTc4MTMwNTYwMDQzMTM1XSxbIkNsYXNzIEEiLC0wLjAyMzI2OTk1NTIxMDcyNjYyLC0wLjAxMjIxMDA4Mjg3NTI4OTM3Nl0sWyJDbGFzcyBBIiwtMC4wMjM3MDU5MTE5NzA1Mzc2NTMsLTAuMDEzMDg5NjIxNDM5MTQ1NzA1XSxbIkNsYXNzIEEiLC0wLjAyMTQ2NjEwMTUyNzAwODY5LC0wLjAwODYyMzkzNzU1MDc3NjAzNl0sWyJDbGFzcyBBIiwtMC4wMjQ1NDI2NDA0NTk0OTQxNywtMC4wMTQ5MDMwOTA3MDkwMDQxODRdLFsiQ2xhc3MgQSIsLTAuMDIzNDE5NzMxNjg1MzE1NDg4LC0wLjAxMjUwMTkxNTY1NzQ1MzY3Ml0sWyJDbGFzcyBBIiwtMC4wMjUxNjg4NTM0ODA3MjYxMSwtMC4wMTYzNzI3MTAxODY5NjIzNzVdLFsiQ2xhc3MgQSIsLTAuMDI0OTg1MzY2MDIwNjAwMjYsLTAuMDE1OTc5MzU5NTAyMDk0MTk1XSxbIkNsYXNzIEEiLC0wLjAyNDMwODk5NzYyMzIwMDg0NywtMC4wMTQ0NDYxOTAyNDI0MzQ4NzddLFsiQ2xhc3MgQSIsLTAuMDI1MTE5MjczNDUyODA3ODU4LC0wLjAxNjI0NTIwMDAwMjk3ODQ5N10sWyJDbGFzcyBBIiwtMC4wMjA2OTEyMTI3MjQ3NTA3MjIsLTAuMDA3MDMxNjAwNTEwOTU3OTMzXSxbIkNsYXNzIEEiLC0wLjAyNTQ0NDA3NjIzOTE0ODMxNSwtMC4wMTY5MzUwMjU2MjQ1MDA4NjRdLFsiQ2xhc3MgQSIsLTAuMDI1MTQzMTYxODExNTk3MTk2LC0wLjAxNjI5MTk0NTc5NTI5ODk3XSxbIkNsYXNzIEEiLC0wLjAyNDU0OTM2MTAwNjQzOTY2NywtMC4wMTQ4ODc1Mzk1MTUwNjI0MzldLFsiQ2xhc3MgQSIsLTAuMDE1NTczNDI0ODg1MjQ5OTQ5LDAuMDAxNzQ2ODc3MjMyNzc1NDgyXSxbIkNsYXNzIEEiLC0wLjAyMzg5NzI3ODc2MjM0Mzc4NiwtMC4wMTM0ODE3MTAzMjU4Nzk3MzRdLFsiQ2xhc3MgQSIsLTAuMDIwNTM0ODk0ODQwMzMzNzY2LC0wLjAwNjczMzQyMDMxMDk5NjY1MTZdLFsiQ2xhc3MgQSIsLTAuMDI0NjQ0OTQzOTM3MTE5MiwtMC4wMTUxNzQ3NzE1MTIyNzg0NDldLFsiQ2xhc3MgQSIsLTAuMDIzNzcwMjg3Mjg2OTU1LC0wLjAxMzIyMTU5NDM4MjAwNzY3N10sWyJDbGFzcyBBIiwtMC4wMTM5MzkxNjU2NjE3NDExNiwwLjAwNDEzMzk5MzUzMjU4NjkyOF0sWyJDbGFzcyBBIiwtMC4wMTM2MjIxMjc2NTU0OTk0MDYsMC4wMDQ4MTY3MzEyNDQ4NjA5MjRdLFsiQ2xhc3MgQSIsLTAuMDIzMjg0NTYxOTgyODE0NTUsLTAuMDEyMjMyNjAwMzY1MjU1MzAxXSxbIkNsYXNzIEEiLC0wLjAyNTE5MDgxNTM1NzI0NjY1LC0wLjAxNjQxMDE5MzQzMjg0MzU0Nl0sWyJDbGFzcyBBIiwwLjAzNzM1NzY1OTkyNjk5Mzg2LDAuMDk3MDYxMzg5NjUwMTAzMl0sWyJDbGFzcyBBIiwtMC4wMjI5NzE0MTQ2NTYzOTE5NiwtMC4wMTE1NDQ2ODUyMzg5Nzk0MDhdLFsiQ2xhc3MgQSIsLTAuMDI1MDk0ODY5OTk5OTAzNzk3LC0wLjAxNjE2NDM3MjMzNzIzMDc5XSxbIkNsYXNzIEEiLC0wLjAyNDYxNjcwMzU4MTMzNTY2NywtMC4wMTUwNDM0OTU3MzI4MjY4NjZdLFsiQ2xhc3MgQSIsLTAuMDI1MjE5OTA5ODYxNDk0OTA1LC0wLjAxNjUwMzQ2MzQ2MjI3Njg4Nl0sWyJDbGFzcyBBIiwtMC4wMjEzMjQzMjAwMzM5MzM2NSwtMC4wMDgzNTQ0MTg5MDUwNTg2ODNdLFsiQ2xhc3MgQSIsLTAuMDE4OTgyNjQwNjkxMTg4Mjg2LC0wLjAwNDA1MTEwMTAzMjg1ODU2M10sWyJDbGFzcyBBIiwtMC4wMjUyMTk5MDk4NjE0OTQ5MDUsLTAuMDE2NTAzNDYzNDYyMjc2ODg2XSxbIkNsYXNzIEEiLC0wLjAyMTM5ODQ1MzA4MjkwODYsLTAuMDA4NDgwMzc5OTY5NjM1NDVdLFsiQ2xhc3MgQSIsMC4wMDc3MzQzOTgyOTQyMjU2MDYsMC4wNTI1NzM2ODgzMzg5OTIyMjRdLFsiQ2xhc3MgQSIsLTAuMDE4MzE4NDg0MzIyODg4ODU0LC0wLjAwMjg1NzIyODM3MjIxNzk0MjVdLFsiQ2xhc3MgQSIsLTAuMDA3OTIyNTc0MDkwMzMzOTEsMC4wMTIyMDA0NTA1NzEzMTUyODNdLFsiQ2xhc3MgQSIsLTAuMDA1MjgzNjU0NjE3MDcyMTY3LDAuMDE0ODg5NjU5MjA3NTI5MzY1XSxbIkNsYXNzIEEiLC0wLjAxODM0MTQ5Mjg5NjE5ODM3MywtMC4wMDI4MjA4NzAzMTExNjUyOTY3XSxbIkNsYXNzIEEiLC0wLjAxNjYwNzU4MTk3NDcxNjQzLDAuMDAwMTEzODg2NDI1OTMxMzI3MzJdLFsiQ2xhc3MgQSIsLTAuMDE2OTU4MDE2MzE3NjY1MDQ2LC0wLjAwMDU3MjQ5MzY3ODY1NjYxMThdLFsiQ2xhc3MgQSIsMC4xNTIwODk4Mjc5NzI1MTEwOCwwLjExNzc5NzgzNjk1ODQ2OTQ2XSxbIkNsYXNzIEEiLDAuMjg5MjkzODY5OTc1OTQzMSwtMC4zMDU1MzI0MzcyNTYwNTMyXSxbIkNsYXNzIEEiLC0wLjAyNTE1MjE5MzYxNDcxMDE0NywtMC4wMTYyOTYwMzQ5ODYxNjY4MjZdLFsiQ2xhc3MgQSIsMC4xNTI2Nzc2OTQzNTI1MDMyOCwwLjExOTk0MzU3MTQzODYwNDQzXSxbIkNsYXNzIEEiLC0wLjAyNDA5MzMxNTU0MjE2MzY5MywtMC4wMTM5NDE5Mzk0NDI4NTc0NTRdLFsiQ2xhc3MgQSIsMC4yOTA3MzY4NDQyMTIzMzgyLC0wLjMxMjI1NjM4MTY4ODk3MjhdLFsiQ2xhc3MgQSIsLTAuMDIzOTI4ODgwMzQ0NzUwMjk3LC0wLjAxMzUzODA0NjEwNzMxNTg2OF0sWyJDbGFzcyBBIiwwLjI4Njk5NjYzNzI1NTA0ODI2LC0wLjI5NTgwNzE5NDIwNzk0NzRdLFsiQ2xhc3MgQSIsLTAuMDI2MTg1NjQ4MDQ1MzgyNTgsLTAuMDE4NzQ3MDY5MTcyMDE3NzI4XSxbIkNsYXNzIEEiLC0wLjAyMTcwNjQ0NTQzODMxNDM2MiwtMC4wMDg5NzkwNzMzNTY2MzU1MTddLFsiQ2xhc3MgQSIsMC4yMDUxMDcyOTM0OTQ2NDY0NiwwLjAwNjk2ODE1MDU3ODU3NzA0Nl0sWyJDbGFzcyBBIiwtMC4wMjUwNDc4ODM0OTMxMTY3MDQsLTAuMDE2MDY4MDAwMjM2NDI1M10sWyJDbGFzcyBBIiwwLjAwMDM5NzQ5MTY4NDU2NzM5NTE1LDAuMDM5MDYxMjY0OTQ3NzIxMDFdLFsiQ2xhc3MgQSIsLTAuMDAwNDc1Mzk4NzY5MjQzNjEzOCwwLjAzMzMxMTUwNTYzMDk0MzY2NF0sWyJDbGFzcyBBIiwtMC4wMjU1MDk3MDE3MjU4NDg3ODcsLTAuMDE3MTQ0NjIzODgxNDcwNTNdLFsiQ2xhc3MgQSIsLTAuMDIwMDA0MzI3NjQ4Njk0ODMsLTAuMDA1NzU4Njk5NTEyODYzMzUzXSxbIkNsYXNzIEEiLC0wLjAyMDU1MTMyOTYwMTQ0ODQ5LC0wLjAwNjg5OTEwNzM0MjAwNTE1MV0sWyJDbGFzcyBBIiwtMC4wMjUxNzk2MDY5Njc1NzQ3NzcsLTAuMDE2NDM2MTE1OTkzNDU0NDM4XSxbIkNsYXNzIEEiLC0wLjAxNzAwMjk2NzE4Njk5ODU2NywtMC4wMDA2NTE2MDIzMjk1NjY4NDg3XSxbIkNsYXNzIEEiLDAuMjg2NzgyNTg0NTA0NzQ3NywtMC4yOTU0MTkyMTYwMDEwMTc1XSxbIkNsYXNzIEEiLC0wLjAyNDg1OTY2OTc4MTQyNTk1MywtMC4wMTU2NDY1MzQxMDE5MDQzNF0sWyJDbGFzcyBBIiwtMC4wMjQ5MzYyMzgyMjAxODQ0MjIsLTAuMDE1ODI3NTg2MzgwNjkyNTY1XSxbIkNsYXNzIEEiLC0wLjAyNTQ2NjI0Mzc5NjM0Nzk2NiwtMC4wMTY5OTA5Nzk1MzEyMDE0MDJdLFsiQ2xhc3MgQSIsLTAuMDIxNDcxMjY5MTA4MDIzMzA3LC0wLjAwODYyMjM1NTQzNzA2MTIyN10sWyJDbGFzcyBBIiwtMC4wMjE5NjE2NDgzMTA5NjIxMTQsLTAuMDA5NTU2MDIyNzAxNjQxNjU0XSxbIkNsYXNzIEEiLC0wLjAyMzUzOTEyNDM2Mzk0MzI5NywtMC4wMTI3Njg1NzAzNzQzMTQzMzVdLFsiQ2xhc3MgQSIsLTAuMDIwOTk1MTIxOTE3NzI3NTQsLTAuMDA3NzUzNDIxMDc2NzE2MDI3Nl0sWyJDbGFzcyBBIiwtMC4wMjIwODQzMTk0NDM2MzU3NSwtMC4wMDk4MzUxODUwMjcyODQyOF0sWyJDbGFzcyBBIiwtMC4wMjU0NzI5MTYwMjY0MzE5MTcsLTAuMDE3MTA0MDk4ODg0NzEyOTZdLFsiQ2xhc3MgQSIsLTAuMDI0NTA1MDE0NDQ5NzAwNDcsLTAuMDE0ODc2NTU0NjM3Njk2MjE1XSxbIkNsYXNzIEEiLC0wLjAyNDI4NzMwNTUzNjA0MTg0NSwtMC4wMTQzMjg1Nzc2OTg5OTU0MzNdLFsiQ2xhc3MgQSIsLTAuMDIyOTUxMTA5ODc1ODg1MDk4LC0wLjAxMTU2MDg3MTg4NDc4ODc5OF0sWyJDbGFzcyBBIiwtMC4wMjY0MTM4MDQzNjA4Nzc0NSwtMC4wMTkzMjUyMDMzNDQxMzM0MjZdLFsiQ2xhc3MgQSIsLTAuMDIwMzE3NTEwNzY2ODQxNTMsLTAuMDA2NDQxOTI2ODc5MDc5NDYzNV0sWyJDbGFzcyBBIiwtMC4wMjQ2MDI4MDEwNDc4NjcwNTUsLTAuMDE1MDk2MDgwNDA1MjkyMjcyXSxbIkNsYXNzIEEiLC0wLjAyNDY4OTgyOTk5NTgzODI4MywtMC4wMTUzNTc1NzQzMTk3OTAwNl0sWyJDbGFzcyBBIiwtMC4wMjM3NTE5NDkyODI0NTY1NSwtMC4wMTMxNzQ2ODgyOTAwMzIzNzldLFsiQ2xhc3MgQSIsLTAuMDIwMTU3MDU0NDczNTE2NDksLTAuMDA2MjA5ODQ2NzEzODY2Mzk3XSxbIkNsYXNzIEEiLC0wLjAyMzI4NTQ5NzgyNzI4ODQ0LC0wLjAxMjE2NzAwNzA2OTI1NzMwNV0sWyJDbGFzcyBBIiwtMC4wMjQ4NjYxMjcyMDQ1MDcwNSwtMC4wMTU2NjUwNzQ3OTUyNTA4NDJdLFsiQ2xhc3MgQSIsLTAuMDI0ODgyNjk5MTI3ODMwODUsLTAuMDE1NjM2OTI1NDM2OTczOTY3XSxbIkNsYXNzIEEiLC0wLjAyNDQxNTk3OTA4MDA5NzEyLC0wLjAxNDU5NDU4MzU5NjE4NjQzNV0sWyJDbGFzcyBBIiwtMC4wMjMzMzA5MzU1MjkyMzMxNDQsLTAuMDEyNDE5MzczMzYwODY1NF0sWyJDbGFzcyBBIiwtMC4wMjMyNjk2MzcwOTA0MTg0NjcsLTAuMDEyMTg1NjU2MTkxMzU5MTk1XSxbIkNsYXNzIEEiLC0wLjAxODIzNzIyMjE0MDI3MjgzNiwtMC4wMDI2MjQ3OTM0ODg0MDc4OTczXSxbIkNsYXNzIEEiLC0wLjAyNDQ5NTcxNTA5MDUwMTU5NywtMC4wMTQ4NzI3ODI3MDczNzQ3NTldLFsiQ2xhc3MgQiIsLTAuMDIyMTA3NTkwMzU3MzgxNjczLC0wLjAwOTkyNzk2NDAzMTI2NDkyNF0sWyJDbGFzcyBCIiwtMC4wMjU0MjYwNjM1MTgzMDM4NCwtMC4wMTY5NzYyMDkwNzA4OTQxMzddLFsiQ2xhc3MgQiIsLTAuMDI1NDI2MDYzNTE4MzAzODQsLTAuMDE2OTc2MjA5MDcwODk0MTM3XSxbIkNsYXNzIEIiLC0wLjAyNTQyNjA2MzUxODMwMzg0LC0wLjAxNjk3NjIwOTA3MDg5NDEzN10sWyJDbGFzcyBCIiwtMC4wMjU5Nzk2ODcxMTA0NTE5NDQsLTAuMDE4MjY1NjY1MzQ3MzczOTVdLFsiQ2xhc3MgQiIsMC4xMTU1MzQwNzg0MzU5MDU0NSwwLjE2MjUzMjg1MTE0NDg3NTg3XSxbIkNsYXNzIEIiLC0wLjAyNDY0ODMxOTM2ODAzMjQ2NywtMC4wMTUxOTI0OTQ0MjE4NDA5NF0sWyJDbGFzcyBCIiwtMC4wMjYwODgyNDg5MzkyMzAyOCwtMC4wMTg1MDY0ODM4MzIyNjI0NV0sWyJDbGFzcyBCIiwtMC4wMjMyNTAzOTY0ODUyNTc5MjQsLTAuMDEyMTY1Mjg2NTYyMjU0MjMyXSxbIkNsYXNzIEIiLC0wLjAyNDI0ODE0MDMwMzcwNzU1NywtMC4wMTQyMDAxNDc4NDg0MTY3Ml0sWyJDbGFzcyBCIiwwLjExNTU0NjA1OTMyODE0MTc4LDAuMTYyNDE5MTI1MTU2MTc0NzRdLFsiQ2xhc3MgQiIsLTAuMDAxNjU0NTYyNzQ5OTUwNzcxNywwLjAzNDUwOTA1Njk5OTM2MzQxXSxbIkNsYXNzIEIiLC0wLjAyNjM0MjkwOTUxNDQxMzA4NiwtMC4wMTkxNzY4ODg1NDQ1OTI3MjVdLFsiQ2xhc3MgQiIsMC4wNzE0NTk3OTY4Nzg3NzE1MiwwLjE0NzMxODgxMjEwNzE1NzI1XSxbIkNsYXNzIEIiLC0wLjAyNTA4NDM0ODY3MTg2NTY5NCwtMC4wMTYxNjk2MzQ2ODY0ODA0NjVdLFsiQ2xhc3MgQiIsMC4xMTU1OTMxNDIxNjU5ODIxOCwwLjE2MjgyNDYyMzQwNDM1MzU4XSxbIkNsYXNzIEIiLDAuMTEyNDQ2NzQ0NjA4OTc1NTgsMC4xMjIyNTkwMDU2NDYzNDU5NF0sWyJDbGFzcyBCIiwtMC4wMjI0ODE3NzQ3NjY5MTY2NDgsLTAuMDEwNjA0MDMzODgzOTc3NjE3XSxbIkNsYXNzIEIiLC0wLjAyNjEzMTU5NTkzNTEwMzM5LC0wLjAxODYzMjU5NzU4ODExMjEzNl0sWyJDbGFzcyBCIiwwLjA2MTk4NzkyNjMzNDIyMTcyNSwwLjEzNDYxMjA1MTA5NDcyNzU0XSxbIkNsYXNzIEIiLC0wLjAyNTc2OTIxOTI2NzQ1Nzc0NiwtMC4wMTc3MjY5ODI3NjQ5MTk3OTZdLFsiQ2xhc3MgQiIsLTAuMDIyODE3MTE3NTI5Mzc5ODE2LC0wLjAxMTIyOTA2MDEwMTk0NzA4M10sWyJDbGFzcyBCIiwtMC4wMjYxNTQwOTk3MzQzOTEzMzYsLTAuMDE4NzA0ODAyMjU1NzcwOTA3XSxbIkNsYXNzIEIiLDAuMTE0NzYwNzMxNjQxMDQ4MjYsMC4xNjIyNDYzNTY0NzI3Njk2XSxbIkNsYXNzIEIiLC0wLjAyNjE2MjE0MjA0OTEwNTM4MiwtMC4wMTg3MjMxODY4NDk0NjMxMDddLFsiQ2xhc3MgQiIsLTAuMDI0ODUzMTM3NjE2MDU3NDgsLTAuMDE1NTk2MjgzNDEwNTY3MzQ4XSxbIkNsYXNzIEIiLC0wLjAyNjI1NzYwNDQzMDU2Mjg3NywtMC4wMTg5NDczNTA5NjMxNTk3NF0sWyJDbGFzcyBCIiwtMC4wMjYzODE2NzI1MzgzMDEwNjIsLTAuMDE5MjczNjQyNTA3MzEwODg1XSxbIkNsYXNzIEIiLDAuMDMwOTcwMDE0NzQ2MDQ5NTczLDAuMDk1NDE5NjAzODg4ODI1ODJdLFsiQ2xhc3MgQiIsLTAuMDI2Mjc4MDUxNjYzNDE1MDczLC0wLjAxODk2ODk2NTIwNTA2NjkzNl0sWyJDbGFzcyBCIiwtMC4wMjYzODgxODU5NjkzNzk2OCwtMC4wMTkyNjIwNDIzOTk4NDUxN10sWyJDbGFzcyBCIiwtMC4wMjU2NzM0NjMwMTU0ODYyOSwtMC4wMTc1MDY0MDQ5NzMyMjE5NThdLFsiQ2xhc3MgQiIsLTAuMDI1NjczMzk1MzExODE0NjYzLC0wLjAxNzUwNjU2MjgxODk1NTg4Nl0sWyJDbGFzcyBCIiwtMC4wMjYzODgzMjU4NjQ2NTIxNzcsLTAuMDE5MjkyMzQwMzM3MDU2NDEyXSxbIkNsYXNzIEIiLC0wLjAyNjM4ODMyNTg2NDY1MjE3NywtMC4wMTkyOTIzNDAzMzcwNTY0MTJdLFsiQ2xhc3MgQiIsLTAuMDI2Mzg4MzI1ODY0NjUyMTc3LC0wLjAxOTI5MjM0MDMzNzA1NjQxMl0sWyJDbGFzcyBCIiwtMC4wMjUyMzY3NTE0Mjk5Mzk1MiwtMC4wMTY1MzYzMTU1OTQ5NjE3NDJdLFsiQ2xhc3MgQiIsLTAuMDI1NjcwNjQ5OTM1NjY4NzgyLC0wLjAxNzU0Mjk4OTMzNTk4NDY3XSxbIkNsYXNzIEIiLC0wLjAyNjQyNTQ3NDI5Mzg3MzYyOCwtMC4wMTkzNjQ1OTQ3MjcyNTQwNDRdLFsiQ2xhc3MgQiIsLTAuMDI2NDM1NzEyNzYyNTkzMTUyLC0wLjAxOTQwMDc4OTcwMjM5MzMxNV0sWyJDbGFzcyBCIiwtMC4wMjY0ODQzNjE1MTE3Njc3NCwtMC4wMTk1Mjc0NDAyMjY2MTY1MzhdLFsiQ2xhc3MgQiIsLTAuMDI2MjgwMjg2NzU1MTYwODksLTAuMDE5MDI1NTgyODgyNTU5MDddLFsiQ2xhc3MgQiIsLTAuMDI1OTY2OTg5MTcyOTk4MDg3LC0wLjAxODI1NDc4Mjk2MDA4ODU3NV0sWyJDbGFzcyBCIiwtMC4wMjYzMDIyMzAxOTc0NjgzNjcsLTAuMDE5MDYxNzQyNjUyMTExXSxbIkNsYXNzIEIiLC0wLjAyNTQ4MDYxODc2NTk1MTM3NSwtMC4wMTcwNzI1MDE3MDE5NTUxMDJdLFsiQ2xhc3MgQiIsLTAuMDIzMjc0MjAzNzYyMjE2MDU4LC0wLjAxMjE5MjA4MjM2MzMxNjYzN10sWyJDbGFzcyBCIiwtMC4wMjIyNjM1NDU3MTk1OTc5NiwtMC4wMTAxMjc2MzI4MDQ3MjY3OThdLFsiQ2xhc3MgQiIsLTAuMDI2NDU4NzUyODkxMzE4Njk4LC0wLjAxOTQ0MzYxNjk2NDc3MjI3M10sWyJDbGFzcyBCIiwtMC4wMTAxOTQ1MzM2Njk4NzY3NDcsMC4wMTAzNjAzMzc3MjQwNzIyOV0sWyJDbGFzcyBCIiwtMC4wMjU3NzE0ODE4OTUxMzI0OCwtMC4wMTc3ODMxMTkzMjE1NDI0OTRdLFsiQ2xhc3MgQiIsMC4yMjQzODc4Njk4MDU0NDgxMSwtMC4wNTg1NzEwOTEyNzIzNjA2MDVdLFsiQ2xhc3MgQiIsMC4yMDAwODcwMjM3MTE3MDY5NywwLjAyMjQ4NTczNjQ2NjgxOTA3XSxbIkNsYXNzIEIiLDAuMjAwMDg3MDIzNzExNzA2OTcsMC4wMjI0ODU3MzY0NjY4MTkwN10sWyJDbGFzcyBCIiwwLjE2ODcyNzk0MDY5Mjg3NzQsMC4wOTIyNTA5OTA1MjYwNDA3Nl0sWyJDbGFzcyBCIiwwLjIyMzM0NDk1MjgxNDk4MzEyLC0wLjA0ODM4MjkyMjA5ODI1MTkxXSxbIkNsYXNzIEIiLC0wLjAyNTY2OTQ2MDIyMDYyOTA3MiwtMC4wMTc1MDMyNjI1NzIyODc5NF0sWyJDbGFzcyBCIiwtMC4wMjYyMDczMzAyNTI2Nzk3OTUsLTAuMDE4ODIzMzg1NDE1MzY2OTEzXSxbIkNsYXNzIEIiLC0wLjAyNDE3ODA4MDg2OTcxMTExLC0wLjAxNDE2NzUyMTcxNjgyNzg1MV0sWyJDbGFzcyBCIiwtMC4wMjYwNTE4OTU4ODE5MjYwNjUsLTAuMDE4NDI2NjgwMTg2OTkzNjc1XSxbIkNsYXNzIEIiLDAuMDk4OTE4Mzk4MjgzMjQwNzMsMC4xNjM3NzUxMzY2NTIwMjQ0Ml0sWyJDbGFzcyBCIiwtMC4wMjU5NDA3MjI3MDE0MTkwOSwtMC4wMTgyMTEzNDQ3NzQ0OTQ1OV0sWyJDbGFzcyBCIiwtMC4wMjYyMTYxNzU3MzQwMzM5MTUsLTAuMDE4ODM5NTIzMjU4NTQ4MjJdLFsiQ2xhc3MgQiIsLTAuMDI2MTY2NTE4NTE2Mjg4NjU3LC0wLjAxODc1Mjg1NzEyMTYxOTg1XSxbIkNsYXNzIEIiLC0wLjAyMDUyMDY0NDk1MTY2Mzc2LC0wLjAwNjcwMTI0ODk5MTk4MjE4OV0sWyJDbGFzcyBCIiwwLjA4OTAyNjkzMzI1MDQ1NDg1LDAuMTYxNTY4NjcyMTg5NjM3OTRdLFsiQ2xhc3MgQiIsLTAuMDI1OTE4MDc1MDI1NzQ5MDEzLC0wLjAxODA4NDY4MzE4NTAwMjkzXSxbIkNsYXNzIEIiLDAuMDQ4NjQ4NTQ4OTA1MDY2MDM2LDAuMTEzMzk2MDQyMTg0NzY2MDhdLFsiQ2xhc3MgQiIsLTAuMDIzMDc5MTgyMTc2MzA4MDYsLTAuMDExNzI1NTc1ODY1MzQ5OTEzXSxbIkNsYXNzIEIiLC0wLjAyNjE2NjUxODUxNjI4ODY1NywtMC4wMTg3NTI4NTcxMjE2MTk4NV0sWyJDbGFzcyBCIiwtMC4wMjI3NjM0NDk0NjE0NzMwNTIsLTAuMDEwODM1MzAzMTkxMzAyMDY3XSxbIkNsYXNzIEIiLC0wLjAyNjI5ODA1NjU0NTM0MTQzMiwtMC4wMTkwMjg1Mjg1MTQwNDA4NThdLFsiQ2xhc3MgQiIsLTAuMDE5MDA3OTI0ODI1NDczMDk1LC0wLjAwNDAwMzkyOTQ2NjY0MTgwMV0sWyJDbGFzcyBCIiwtMC4wMjYxNjY1MTg1MTYyODg2NTcsLTAuMDE4NzUyODU3MTIxNjE5ODVdLFsiQ2xhc3MgQiIsLTAuMDI1MTk0ODg2ODM2MDM1NDYsLTAuMDE2MzgyODY5ODQ4NDk0NTY4XSxbIkNsYXNzIEIiLC0wLjAyNjE2MzI0MTcwNjE1NzU1LC0wLjAxODc0MzU5OTI4ODQzMTgxXSxbIkNsYXNzIEIiLC0wLjAxNDUxNTYyNjk3Mzk2NTY5LDAuMDAzNjY5MTQyMDcyMDcxMDI3M10sWyJDbGFzcyBCIiwtMC4wMjU1MDM5NjMzNzM4MTg5NTMsLTAuMDE3MTAwNjc5Njc1NDk2MDFdLFsiQ2xhc3MgQiIsLTAuMDI1MTM3MDU2ODcwMzYwMDYzLC0wLjAxNjMxMDY0ODM0OTQxNjM4Ml0sWyJDbGFzcyBCIiwtMC4wMjYxNjMyNDE3MDYxNTc1NSwtMC4wMTg3NDM1OTkyODg0MzE4MV0sWyJDbGFzcyBCIiwtMC4wMjU3NjUwNzA4NzQwMzQyMSwtMC4wMTc3NTcyMDkzMDM5NDgxODZdLFsiQ2xhc3MgQiIsLTAuMDI1NzY1MDcwODc0MDM0MjEsLTAuMDE3NzU3MjA5MzAzOTQ4MTg2XSxbIkNsYXNzIEIiLC0wLjAyMjQ1MTc2NDI1NzM4NzUxLC0wLjAxMDE1NjUzNzQ2MTMyMjM5N10sWyJDbGFzcyBCIiwtMC4wMjYwNzc4Njg2NzYyNjg4MTYsLTAuMDE4NTAxNzQxNzk1MzYwMTRdLFsiQ2xhc3MgQiIsLTAuMDI1MTM3MDU2ODcwMzYwMDYzLC0wLjAxNjMxMDY0ODM0OTQxNjM4Ml0sWyJDbGFzcyBCIiwtMC4wMjI1NjU1MjY4OTUxODYyOTIsLTAuMDEwMzkxMzEzNTM3MjgwNTFdLFsiQ2xhc3MgQiIsLTAuMDI1NzIxMDgxOTM3OTEyODcsLTAuMDE3NjQ1MzA2NzA3MjQ5OTNdLFsiQ2xhc3MgQiIsLTAuMDI2NDAwNzk4MjExMjg3MzIsLTAuMDE5MzEzNTEwMzc4Njc0Njc3XSxbIkNsYXNzIEIiLC0wLjAxNDIxNTMxNjk0Nzk1MDMxOCwwLjAwMzgwNDk4MzkxODQwMTI0MV0sWyJDbGFzcyBCIiwtMC4wMjI1MzA1Mzk0MzY1MTQyOCwtMC4wMTAzNDExMDQ1MDAxMjA4NzddLFsiQ2xhc3MgQiIsMC4wMzYwNDI5NzgzNTU4NjYwOSwwLjA5NTA0NDQ2ODQwNTUxMTg3XSxbIkNsYXNzIEIiLC0wLjAyNjQxMDg1NjcwNTYwMDc1LC0wLjAxOTMzNjgwMTg3MTI4NjI1Nl0sWyJDbGFzcyBCIiwtMC4wMjU2ODk2NDMyODIxNjUxMTIsLTAuMDE3NTk0MDMwODI1Nzk4MjhdLFsiQ2xhc3MgQiIsLTAuMDI1NDg1NTA1NTE5NTM3OTMsLTAuMDE3MTA0NDM1NTc1MDAxMzI1XSxbIkNsYXNzIEIiLDAuMDkwNzY0NzU2NDY5ODEzOSwwLjE2Mjk4MDg0OTcxMjkwODI3XSxbIkNsYXNzIEIiLC0wLjAyNjIzMzA2ODc1ODk3MjcwMiwtMC4wMTg5MTA4NTAwNzc4NTg1OThdLFsiQ2xhc3MgQiIsLTAuMDI1OTExNzk5MTE2OTEwMzEsLTAuMDE4MTA0Njk3NjU4MTgyMDIyXSxbIkNsYXNzIEIiLC0wLjAyMzc4ODQ3MzE0Njk1NjEwOCwtMC4wMTMyNzg3MDg0MDA3MzMyOF0sWyJDbGFzcyBCIiwtMC4wMjU4NzgzMjU5MzEyNDIzOCwtMC4wMTc5NDU4OTMyMzAxMjg3XSxbIkNsYXNzIEIiLC0wLjAyNTkwNTY1MDQ4ODIwMzQ0MiwtMC4wMTgxNDAyNzU4MjMxMzk1Ml0sWyJDbGFzcyBCIiwwLjA5MDc2MTQ3MTQ1NTE4NzczLDAuMTYzNjk5MzgwODc3ODk2OTZdLFsiQ2xhc3MgQiIsLTAuMDI2MDUzMzI5MTMxNzkzMDUsLTAuMDE4NDcwODMxODkzMzMwNTM4XSxbIkNsYXNzIEIiLC0wLjAyNjI0NjExMzY0MjgwODc4MywtMC4wMTg4OTg0MjYwODkxNTU1NDNdLFsiQ2xhc3MgQiIsMC4wMjcxNTE5OTg5NDQ4MjI5NSwwLjA4ODk4NTMzMDQ2MzIxNTY5XSxbIkNsYXNzIEIiLC0wLjAyNTc2NTA3MDg3NDAzNDIxLC0wLjAxNzc1NzIwOTMwMzk0ODE4Nl0sWyJDbGFzcyBCIiwtMC4wMDkwNjc4MjM1MDcxMjA5NDUsMC4wMTkxMjUyMTAwNjQ0MTE5Nl0sWyJDbGFzcyBCIiwtMC4wMjYyNTE1MzIxODk1OTA4OSwtMC4wMTg5NTg4MDgxOTk0MDQ0ODNdLFsiQ2xhc3MgQiIsMC4wOTExMDA5MTE4MTgxNDUzOCwwLjE2MzI2NTc1MTQ3MzAyMzAyXSxbIkNsYXNzIEIiLC0wLjAyMjYzMzY1MjQwMjcwOTc1LC0wLjAxMDc1MDI0Mzg0ODA4NzEyNl0sWyJDbGFzcyBCIiwtMC4wMjU5Nzk1NjI2NjY0NjM1NjYsLTAuMDE4MjM5NTc5ODc1NDIzMjldLFsiQ2xhc3MgQiIsLTAuMDI2MTMwMDM1MTE5NTQ3NTc2LC0wLjAxODY1ODgzMDM2ODcyOTM5NV0sWyJDbGFzcyBCIiwtMC4wMjQ1ODA2Mjc1ODY1ODY3OTQsLTAuMDE0OTQyNDU5Mjk4MjcyOTgzXSxbIkNsYXNzIEIiLC0wLjAyNjIxMTQwMDkzMjA3ODI3LC0wLjAxODc5OTkxMTc5ODQ2NDA3XSxbIkNsYXNzIEIiLC0wLjAyMjg1NDA1ODAyMjI5Mjk4LC0wLjAxMTA5MzIzOTg4MTQ4NDk0Ml0sWyJDbGFzcyBCIiwtMC4wMjU3NzY5MjkzMjg2NDE1MzgsLTAuMDE3Nzc2ODY0NjU3MTQwNTQzXSxbIkNsYXNzIEIiLC0wLjAyMzYwNDM0Njc5MzI0NzU1NiwtMC4wMTI3Nzc0NTA2ODk2OTk3MTNdLFsiQ2xhc3MgQiIsLTAuMDI0NjkwMzg0NDU3MTY5NDY4LC0wLjAxNTI5NzU1ODgxMjM1OTQxOV0sWyJDbGFzcyBCIiwtMC4wMjUxNDM3Mzk2MDUwMjIxODMsLTAuMDE2MzI5OTk5ODk0MDc3NjA1XSxbIkNsYXNzIEIiLC0wLjAyNDAyNjIwNzMxMzkxODMzLC0wLjAxMzgzODcwNjM4NjI3NDE3NV0sWyJDbGFzcyBCIiwtMC4wMjYxNTE0ODU2OTQ4MzYyOTUsLTAuMDE4NzEzOTExNjA2ODIzOTM4XSxbIkNsYXNzIEIiLDAuMDY4OTkwNjQ0Njc5MjA0NTksMC4xNDY2NTAyMjg3NzU3NjYzXSxbIkNsYXNzIEIiLC0wLjAyNjQ2NzU4Njk5ODQ4MjU3NiwtMC4wMTk0NTIzMDU5Mjg1MzQ1MDZdLFsiQ2xhc3MgQiIsLTAuMDI1MjM3MjE0OTYxNjMwNTkyLC0wLjAxNjUyOTc3NTY4NDQzNjQxNF0sWyJDbGFzcyBCIiwtMC4wMjYxNzg4MDM4MDMyMDY5NzcsLTAuMDE4NzY5MDE5ODMyODYxMDE4XSxbIkNsYXNzIEIiLC0wLjAxODAwOTYyMTg1MjkwNTYxLC0wLjAwMTkzOTIwNDk5NTI0OTQwMjRdLFsiQ2xhc3MgQiIsLTAuMDIxMTg3MTA3NjE2OTEyMDIsLTAuMDA4MDc1NjI0OTAzNDkzMDUxXSxbIkNsYXNzIEIiLC0wLjAyNjE3OTMwNTk0Mjk5ODc1LC0wLjAxODc2MTQwMjI2NDc4MTgxOF0sWyJDbGFzcyBCIiwwLjA5MDM1NTc0ODIyMjE2NTg0LDAuMTYzMDYwNTI2MDQyNTAyM10sWyJDbGFzcyBCIiwtMC4wMjU0MjYwNjM1MTgzMDM4NCwtMC4wMTY5NzYyMDkwNzA4OTQxMzddLFsiQ2xhc3MgQiIsLTAuMDI1NDI2MDYzNTE4MzAzODQsLTAuMDE2OTc2MjA5MDcwODk0MTM3XSxbIkNsYXNzIEIiLDAuMDEwNjE5MjQxNzIxNTQ3MjAyLDAuMDI2MTQ5MjU3NTQzMTk1MjAzXV0=","base64").toString('utf-8');
        // array_embbeding = JSON.parse(array_embbeding.toString())
        // console.log('av 2');
        var arraydia = [[24.2858,64.0451,1],[17.6415,128.9096,0],[25.3698,32.0904,1],[111.0772,134.9002,0],[189.7442,97.2487,1],[19.0219,96.0554,0],[104.3513,146.9281,1],[17.8625,107.0996,0],[568.8667,68.47,1],[19.8065,81.9475,1],[18.8948,98.7933,0],[24.2582,44.238,1],[21.2834,68.8745,0],[867.4743,104.2665,1],[198.7578,62.429,1],[16.3172,121.5715,1],[250.9398,116.1928,1],[18.1906,104.4247,1],[102.0246,123.8289,0],[116.1488,107.7955,1],[256.3043,108.7787,0],[17.5801,107.8317,0],[27.2607,13.7487,1],[21.5821,94.1952,1],[169.0515,79.0902,1],[135.6535,98.3395,1],[22.2298,63.111,1],[156.9847,131.1025,0],[132.2237,74.4292,0],[19.5,91.0083,0],[19.9719,99.5292,0],[268.7577,80.243,1],[70.3434,132.4976,0],[16.8893,117.3591,0],[21.5212,89.1383,0],[210.1766,130.4352,0],[21.2826,73.1896,0],[19.9707,108.8393,1],[19.128,124.5029,1],[227.0018,119.3377,1],[96.2936,43.5363,0],[21.0214,76.3965,0],[19.3182,101.8324,0],[264.9702,57.184,1],[23.0524,54.1388,0],[27.7818,37.2624,1],[21.7359,69.482,0],[16.2648,143.0097,0],[19.748,110.8537,1],[16.4138,119.2484,0],[99.9002,117.7414,0],[53.8347,119.0351,0],[40.2551,127.8595,0],[325.1553,61.4293,1],[364.4953,96.7742,0],[15.0411,143.3178,0],[330.272,56.7426,1],[130.8738,122.4809,0],[22.2548,63.2043,0],[161.5591,124.4656,0],[14.3805,140.1981,0],[20.7173,78.1326,1],[11.7567,166.9425,0],[150.4185,89.0188,0],[18.7522,97.0624,1],[19.04,113.7046,0],[20.4644,101.27,1],[18.7873,96.2066,0],[55.3091,123.0278,0],[123.1437,76.6421,0],[108.0397,122.4171,1],[162.329,90.8068,0],[20.4487,81.3564,1],[290.0017,108.9787,0],[17.368,134.5312,0],[8.4964,214.9298,0],[13.8593,146.0697,0],[19.1209,118.5163,0],[19.5698,91.8134,1],[19.8576,103.2893,0],[19.0232,105.2982,0],[13.3988,149.7799,0],[87.9757,134.7323,0],[19.1357,114.8168,0],[21.9238,68.7368,1],[144.4481,115.5636,0],[21.3769,106.3849,0],[89.5912,120.6494,0],[132.1953,86.844,1],[19.2415,107.6451,0],[15.144,135.4077,0],[195.5795,105.0824,0],[66.0113,133.6522,0],[20.6208,74.735,1],[86.3723,78.1123,0],[249.8767,90.4413,0],[18.294,123.3378,0],[90.7358,153.1826,0],[81.8342,130.426,0],[241.792,110.5321,1],[23.7731,49.6793,1],[22.2636,65.204,0],[20.255,85.7043,0],[56.4279,136.0769,0],[16.0582,127.3005,0],[172.509,106.1552,0],[17.8121,109.3493,0],[162.2716,84.8309,0],[35.4399,134.2422,0],[54.6132,120.1563,1],[160.5782,58.0708,1],[515.8682,105.4761,1],[55.3355,128.2977,0],[15.0539,136.9744,0],[198.7756,72.9844,1],[22.2167,59.7427,1],[19.8942,86.755,1],[15.0182,137.0079,0],[18.4027,118.8659,0],[68.9518,119.3896,0],[126.6824,63.264,1],[20.8813,105.0061,0],[119.4186,116.6768,0],[20.5612,74.1261,0],[18.9042,99.4138,1],[116.8798,140.5814,1],[155.488,106.4773,0],[114.6406,108.0694,0],[164.902,106.47,1],[18.036,100.8428,1],[192.2754,57.3185,1],[19.4093,91.896,1],[249.9701,68.0287,1],[17.9153,127.0326,0],[66.3789,122.5792,0],[160.0448,103.2402,0],[68.743,119.5439,0],[109.5142,131.6433,0],[20.4824,82.5555,0],[342.6021,139.2151,0],[20.1119,80.574,0],[20.1615,104.6034,0],[82.1623,115.2857,0],[18.1537,102.8463,1],[306.6004,90.1489,0],[18.7497,113.4319,0],[15.6491,152.7331,0],[138.2506,119.7582,0],[22.1072,60.0636,0],[17.5056,123.993,0],[226.8054,99.186,0],[18.6068,98.492,0],[178.833,69.5635,1],[507.2236,107.6411,0],[26.3893,22.5458,1],[25.7588,59.5761,1],[111.2932,126.8435,0],[153.4211,120.4949,0],[70.1546,130.4208,0],[139.4229,60.4254,1],[25.0497,60.946,0],[124.4644,119.2236,0],[304.3065,125.7448,0],[18.7891,115.4968,0],[20.8023,79.0296,1],[173.8869,121.7513,1],[23.6713,68.3696,0],[19.3607,92.2918,0],[18.4003,102.8904,0],[97.029,106.775,0],[17.8313,107.4159,1],[151.3595,92.406,1],[16.4623,136.6935,0],[65.6827,141.2156,0],[70.9828,143.3819,0],[156.8809,48.5733,1],[16.0879,123.6577,0],[153.3785,91.989,1],[21.9384,65.9446,0],[20.6852,79.6866,1],[16.2391,123.2073,0],[111.7798,104.9623,0],[31.802,213.416,0],[14.6182,140.2101,0],[21.4616,70.2778,0],[28.3578,20.6178,1],[519.011,78.1472,1],[80.7616,88.2057,1],[133.9769,115.2975,1],[182.4949,90.4212,1],[18.3338,104.067,0],[115.7293,99.4138,0],[23.1416,54.2677,1],[20.0165,85.2854,1],[16.8334,128.3529,0],[234.5328,75.5335,1],[17.7104,110.4331,0],[66.3996,112.9482,1],[119.3137,116.3372,1],[339.4566,98.4931,1],[19.9153,100.1668,0],[21.5209,73.2219,0],[19.3851,105.594,0],[61.9076,118.9723,0],[208.4318,124.7132,0],[20.1888,103.3203,0],[306.7772,41.7518,1],[24.0957,43.4188,1],[105.0925,127.708,0],[27.9351,28.3777,1],[16.7632,134.0115,0],[25.7845,67.6271,0],[27.4149,28.967,0],[152.179,87.9546,1],[194.5896,115.8778,1],[294.1294,88.5069,1],[148.9079,119.3572,1],[140.8543,100.7384,0],[17.368,127.0181,1],[18.6342,98.9574,1],[501.4013,86.5935,1],[23.3502,47.6857,1],[18.0898,102.6319,0],[211.9662,88.1127,0],[73.8483,119.6575,0],[49.8323,129.0607,0],[17.7528,110.5539,0],[25.6647,56.9892,1],[768.2792,89.8957,0],[74.0406,101.0743,0],[22.0473,69.348,1],[390.8082,111.618,1],[53.7974,137.3436,0],[19.6496,90.7948,0],[61.2949,144.4507,0],[24.6386,42.5995,1],[217.5599,47.3481,1],[27.3771,34.3174,1],[25.2122,48.5637,1],[17.8005,108.3095,0],[17.9644,124.3506,0],[105.9859,131.8979,0],[20.983,77.6927,1],[195.0627,113.9505,1],[216.9646,86.6051,0],[26.7484,26.2854,1],[19.5414,89.1555,0],[701.8016,112.2448,0],[421.0905,127.6839,0],[19.9764,101.1732,0],[17.7174,106.8633,0],[20.5048,82.3736,0],[72.0577,127.4607,0],[18.1061,128.2587,0],[273.0941,143.6875,1],[20.847,103.385,1],[20.6799,105.5606,0],[20.1336,100.7473,0],[399.5897,61.9315,0],[173.5586,70.2216,1],[156.341,36.3981,0],[20.3536,82.5031,1],[18.9624,119.4483,0],[22.5546,65.8953,0],[19.5879,89.9671,1],[84.7639,120.682,0],[20.1617,85.4719,1],[22.8162,88.4699,0],[17.3336,114.1862,0],[20.8058,77.6425,1],[20.2385,108.8942,1],[75.6372,114.0347,0],[19.6051,88.4204,0],[62.5593,147.3822,0],[18.0053,102.6759,0],[77.3921,120.6488,0],[19.2894,109.198,1],[134.3515,122.4392,0],[18.7205,94.2477,0],[294.7693,133.624,0],[22.0821,67.2661,1],[143.2885,94.4392,0],[175.8198,91.731,0],[23.6197,47.9436,1],[18.2838,99.8929,1],[156.5547,87.8829,0],[567.0856,109.6632,0],[240.6551,113.7945,1],[66.4204,124.4824,0],[95.4395,112.7879,0],[57.2173,137.3186,0],[93.4443,115.536,1],[203.5058,102.2732,1],[215.4138,109.2645,1],[22.8707,51.0938,0],[143.453,76.673,0],[381.7644,103.8107,1],[235.5448,107.652,0],[201.8521,126.9305,1],[18.4649,96.3287,0],[22.9243,56.7656,1],[157.6867,86.2686,1],[59.6627,138.002,0],[19.7005,92.6128,1],[22.2943,61.9975,0],[126.1771,103.5053,0],[155.7434,64.4817,1],[168.8413,92.7184,0],[200.1112,103.949,1],[225.106,109.8657,1],[17.1619,132.3322,0],[167.44,123.0766,0],[119.2395,68.6424,1],[103.4409,111.5622,0],[20.4122,101.4437,1],[113.3626,111.1928,0],[81.5989,118.765,0],[25.5544,31.8393,1],[160.3866,113.4057,0],[26.5813,15.6615,1],[250.231,107.7502,0],[20.5599,102.1371,1],[20.9697,89.1833,1],[53.561,61.3726,1],[20.7706,102.5087,0],[191.1479,74.5239,0],[176.4593,107.8918,1],[25.2177,33.8346,0],[139.5165,121.5088,1],[87.4032,114.3552,0],[20.2423,93.2999,0],[68.6651,132.8009,0],[24.3085,42.0464,1],[18.0482,102.899,0],[75.4494,126.2796,0],[280.0394,74.379,0],[18.0043,103.349,0],[18.9855,94.5113,1],[194.5978,77.7151,1],[25.4049,32.0949,1],[125.4343,94.8982,0],[90.732,123.8293,0],[9.832,212.6165,0],[19.9187,87.6714,0],[16.9904,112.3763,0],[129.7755,93.3124,0],[104.4838,87.6878,0],[17.8306,107.6813,0],[91.7756,123.1716,0],[9.908,208.1172,1],[17.0091,117.9195,0],[21.3174,73.9801,0],[15.5425,147.3996,0],[59.7706,128.6545,0],[16.8191,121.2679,0],[24.032,43.4453,1],[187.9198,108.8303,1],[21.0603,92.8308,1],[72.3991,127.5634,0],[276.5161,43.3534,1],[350.85,59.0383,1],[23.0068,50.9684,0],[20.6113,100.465,0],[22.0722,60.5454,1],[314.6868,94.676,0],[101.2844,124.4999,0],[19.8024,88.5782,1],[18.4044,114.6316,0],[82.3682,136.6276,0],[161.9281,88.0659,1],[489.6415,86.4214,1],[108.5252,107.8589,0],[82.7982,136.9981,0],[113.6253,120.5611,0],[178.9408,110.6332,0],[346.949,100.1006,1],[101.7557,122.4896,0],[92.8906,136.14,0],[23.264,55.695,1],[91.3062,122.3715,0],[101.4698,115.271,0],[19.1462,110.3714,0],[199.3819,123.8936,0],[75.9923,130.4737,0],[130.5459,100.5236,0],[69.4221,102.5471,0],[20.8607,96.7103,1],[20.7407,102.1338,1],[306.4962,91.94,1],[99.2953,121.5006,0],[213.7949,131.0785,0],[24.2376,46.6315,1],[433.3333,124.4139,0],[106.0476,104.4719,0],[23.296,54.1881,1],[294.458,115.7123,0],[133.0092,129.7283,0],[22.9517,85.741,1],[15.5908,130.6347,0],[28.5253,23.8605,1],[16.8956,117.4652,1],[20.7559,74.0232,0],[111.1383,84.7426,1],[16.349,138.2165,0],[24.0108,45.029,1],[185.3473,110.258,0],[18.8838,94.9292,1],[17.3378,113.3288,0],[26.9118,15.957,1],[602.6424,99.6639,1],[20.4264,109.4348,0],[195.358,118.9961,0],[331.3579,99.4751,0],[83.6278,78.1755,0],[189.0935,95.4267,1],[497.6722,86.6703,1],[18.4023,117.7294,0],[23.9922,67.9786,1],[15.6129,129.8474,0],[136.1252,97.6772,1],[191.159,109.3369,0],[93.3874,127.8385,0],[98.0015,121.7974,0],[20.2109,100.8045,0],[233.2228,81.4559,1],[303.3574,57.1877,1],[15.3484,129.9609,0],[205.9007,51.6141,1],[168.2326,91.0977,0],[197.4695,131.6355,1],[16.1515,124.2922,0],[101.8104,129.9718,0],[75.8541,138.3733,0],[21.2973,73.7614,0],[16.8401,121.947,0],[20.5259,81.7087,1],[23.6634,70.8165,0],[22.1377,65.8539,0],[17.9469,117.6622,0],[18.5185,102.1291,0],[28.2574,20.4307,1],[66.8455,136.2139,0],[139.9024,109.9265,0],[18.2279,103.6743,1],[19.7158,97.3032,1],[43.5807,37.4551,1],[87.6828,119.5972,0],[111.3418,127.0911,0],[83.6458,118.1891,1],[83.1658,99.6134,0],[110.6422,141.549,0],[20.7962,80.0105,1],[227.2059,143.0771,0],[17.8971,98.1018,0],[123.3114,126.34,0],[26.4883,40.4269,1],[20.4681,75.9751,0],[88.2889,135.0358,0],[260.6805,85.1025,1],[82.1886,78.8896,0],[76.1926,96.634,0],[14.3965,142.3362,0],[66.0401,142.6203,0],[18.1733,123.3695,0],[19.264,93.0226,0],[124.5702,103.0734,0],[50.9888,145.1255,0],[118.6859,127.7793,0],[18.2499,101.2644,1],[164.6257,73.5994,0],[24.555,69.6463,0],[23.4654,79.2833,0],[21.0506,96.4506,0],[21.2205,71.2906,0],[18.7349,100.1275,0],[22.8079,71.7511,0],[210.5847,126.3959,1],[129.1008,109.0076,0],[96.7581,94.2858,0],[22.5816,75.8754,0],[350.7542,87.4375,1],[22.328,89.2066,0],[65.7713,134.5728,0],[142.2546,140.1548,0],[20.9355,77.4547,1],[271.8793,104.6851,1],[500.5145,123.8345,0],[289.9837,62.2072,0],[18.369,114.1529,0],[26.617,14.0956,0],[83.0804,137.6626,0],[18.5352,119.7844,0],[19.6635,114.8965,0],[142.0868,98.2168,1],[13.9836,143.9241,0],[23.7962,42.3304,0],[18.3441,102.7211,0],[92.0412,138.9825,0],[172.5911,31.9178,1],[216.3714,77.7687,0],[91.075,101.9789,0],[17.9777,129.0812,0],[10.2176,209.851,1],[96.7487,125.8353,0],[19.6319,115.2819,0],[15.2096,133.1835,0],[116.6446,40.4792,1],[190.4746,103.0599,0],[92.4853,140.1969,0],[19.3419,86.7934,0],[17.7301,126.6418,1],[230.6577,97.7928,0],[16.3525,117.2619,0],[16.4421,123.1721,0],[103.6245,125.5443,0],[129.0208,61.9445,1],[187.9894,79.9136,1],[20.1846,82.0503,0],[14.9296,134.8682,0],[344.5375,108.4545,0],[81.7675,152.1819,0],[151.1351,101.8864,0],[17.2889,110.2412,0],[20.3866,80.4079,1],[19.7542,90.1807,0],[17.0367,128.762,0],[99.5285,126.5045,0],[124.245,107.7128,0],[207.6909,116.7923,0],[18.3808,102.2132,0],[125.8405,104.2726,0],[18.4815,104.5497,0],[83.9023,135.0083,0],[15.4391,130.5004,0],[72.4924,144.1288,0],[19.5259,91.655,1],[18.2126,102.1617,0],[12.8495,150.5108,0],[231.1809,107.114,0],[177.6416,97.6152,1],[233.5477,131.7241,1],[210.4842,104.238,1],[18.6284,117.4207,1],[73.3756,131.5954,0],[93.6873,131.5086,0],[251.797,47.5741,1],[233.3843,43.8196,1],[186.639,99.1981,0],[93.0343,54.0321,0],[28.6429,20.6758,0],[20.7241,99.5106,0],[122.9981,140.233,0],[18.9521,90.8411,0],[61.3385,131.4013,0],[131.5098,140.6373,0],[235.2334,110.0783,0],[19.7126,116.9122,0],[18.3922,97.5087,0],[20.3177,109.0739,0],[16.0229,125.145,0],[19.9622,83.2431,1],[301.2082,44.8999,1],[94.8217,134.7215,0],[71.9254,120.4141,0],[16.7894,119.7227,0],[104.9322,129.6121,0],[37.248,117.0466,0],[143.588,132.2995,0],[149.6574,71.7708,0],[185.1901,108.9562,1],[15.3093,132.0257,0],[20.7415,80.7933,0],[63.943,110.1272,0],[137.4042,128.6422,0],[351.5016,101.9267,0],[84.4187,106.4031,0],[148.0342,120.9,0],[19.5955,93.769,1],[20.5763,79.3596,0],[32.9155,18.7515,1],[25.7716,63.0124,1],[19.7526,106.8355,0],[20.4926,86.9242,0],[17.6238,108.9612,0],[617.1209,142.8554,1],[17.1442,122.9637,0],[21.6196,68.888,1],[17.6049,110.0076,0],[181.684,48.9378,1],[13.5901,149.3855,0],[21.3564,98.5696,1],[160.9891,115.7781,0],[20.7616,77.3114,1],[130.9519,145.0181,0],[250.92,112.9425,0],[210.8983,44.1657,1],[14.4904,140.3538,0],[41.6296,134.113,0],[24.7342,39.077,1],[138.0122,121.1346,0],[19.6697,103.8065,0],[15.8532,126.3468,0],[22.0305,90.3481,0],[149.3515,72.1669,1],[24.4049,40.4628,1],[21.7065,92.9886,0],[319.2167,62.9796,1],[58.6583,127.4947,0],[295.4111,87.7038,0],[199.8863,121.7408,0],[176.009,125.4189,0],[218.5233,60.424,1],[345.8115,74.2746,1],[19.853,107.7314,0],[165.8258,86.3583,1],[18.0291,106.5175,0],[19.5151,91.7932,0],[29.7743,147.9022,0],[20.1758,97.1735,1],[18.2518,104.2674,1],[180.4658,115.5589,0],[17.9161,120.674,0],[26.0553,25.2407,0],[132.9469,130.9893,0],[18.1894,106.3372,0],[73.3628,126.7691,0],[19.8352,89.5742,0],[20.7888,80.988,0],[20.3648,81.0125,0],[18.0833,121.32,0],[18.6731,98.7208,1],[109.6833,120.4654,0],[18.347,103.9238,0],[203.1597,102.6774,0],[16.4718,120.8232,0],[17.8505,106.4326,1],[17.8288,105.0483,0],[83.6565,125.2135,0],[109.7171,123.6538,1],[63.7988,117.3152,0],[123.228,119.2424,0],[20.2766,85.4117,0],[22.1325,62.05,1],[15.3202,131.6024,0],[170.5367,125.4684,0],[462.3267,99.2773,0],[168.0184,60.8503,1],[185.0999,55.9964,1],[152.3535,87.5676,1],[19.4814,109.295,0],[117.1122,135.1979,0],[125.6953,108.5569,0],[98.7326,98.7318,0],[19.125,95.4366,0],[153.9076,121.5478,0],[560.6107,114.0701,1],[108.785,124.8181,0],[221.2039,110.9413,0],[20.7135,77.1116,0],[87.167,138.3904,1],[23.6159,46.3399,0],[30.0652,17.9593,1],[256.8449,63.9929,1],[153.9836,79.8963,1],[21.1447,99.4587,1],[152.7102,114.6867,0],[23.0375,61.853,1],[20.0903,101.4349,1],[207.7692,133.4743,0],[123.9496,67.3013,0],[192.1829,63.6096,0],[17.7467,116.7928,0],[64.9698,141.1858,0],[261.0751,109.9735,0],[16.7041,113.3604,0],[26.754,19.4015,1],[23.0268,52.1813,1],[16.7108,120.7607,0],[19.325,94.567,1],[281.516,140.0834,0],[59.2697,164.074,0],[26.102,52.6732,1],[123.758,130.4247,0],[20.1061,86.5755,1],[20.6094,71.2122,0],[225.5914,104.7317,0],[20.2279,85.1478,0],[18.9592,109.4139,0],[201.7213,92.4022,0],[203.683,84.2714,1],[18.2042,103.3715,0],[23.9422,46.6124,1],[115.9568,103.0176,0],[147.4439,96.4513,1],[16.2479,124.1863,0],[499.9912,113.2187,1],[149.5605,57.1535,1],[16.1984,124.346,0],[175.0577,98.5632,0],[19.4346,94.3735,0],[220.0683,110.571,0],[21.8091,85.7446,1],[26.1577,41.7507,1],[19.2502,91.8377,0],[119.0453,112.5365,0],[17.9885,131.8762,0],[17.365,108.6106,1],[353.773,123.0262,0],[23.8211,46.2846,1],[177.6588,137.286,1],[408.1967,94.6394,0],[43.5738,87.8201,0],[22.4682,85.228,1],[310.7888,110.8577,0],[17.704,109.2479,0],[416.9835,68.4363,1],[210.8729,59.3483,1],[17.7939,115.1282,0],[197.7509,125.7912,0],[18.8984,112.2446,1],[17.1813,126.8221,0],[219.7222,120.9085,0],[150.0579,76.7481,1],[125.5585,102.7359,0],[18.9102,95.7281,0],[21.2922,99.9438,0],[199.7813,114.4968,0],[23.3418,72.751,0],[25.0149,38.0259,0],[16.418,123.4877,0],[100.3384,90.0296,1],[19.6686,91.3787,1],[146.6346,51.1919,1],[183.3401,126.5368,0],[17.8541,103.5594,0],[18.8333,120.1519,0],[141.0744,98.8383,0],[15.4397,145.2004,0],[177.2568,131.5059,0],[17.8132,107.4145,1],[170.8829,104.1994,1],[111.8285,124.3368,0],[134.4514,118.2252,0],[21.73,67.3508,1],[164.3121,71.3385,0],[123.89,119.4285,0],[25.2184,64.8423,1],[74.9883,136.685,0],[225.9956,46.4862,1],[23.2372,50.2658,1],[21.0239,78.0524,1],[95.638,99.6272,0],[19.5319,107.6516,0],[535.0376,81.5186,1],[24.7838,57.899,1],[132.1695,93.6578,1],[23.8781,74.1336,0],[19.7566,86.0538,1],[18.265,105.5857,0],[26.5586,16.0186,1],[33.5692,129.6227,0],[26.3913,42.5666,1],[16.1256,123.6418,0],[199.2377,125.083,0],[21.3586,92.3142,0],[132.113,103.3792,0],[19.7859,85.8094,1],[18.6917,121.623,0]];
        // console.log(arraydia.length)
        return arraydia

    }

}

global.DataClass = Data;







}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"buffer":2}]},{},[4]);
