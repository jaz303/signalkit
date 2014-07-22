# signalkit

Tiny signals library. Signals are an alternative to `EventEmitter` wherein each possible event is represented by a unique object to which listeners can be attached. There are a couple of benefits to this approach:

### Anonymous signal objects can be passed around independently of their owner object

In the example below, `MyObserver` could be passed any signal at all:

    function MyObserver(signal) {
        signal.connect(function() {
            // do something
        })
    }

With `EventEmitter`, we'd need to attach to a fixed event of a given object, or pass in the event name explicitly. I find this less elegant.

    function MyObserver(obj, eventName) {
        obj.on(eventName || 'data', function() {
            // do something
        })
    }

### No subtle bugs caused by misspelt event names

    obj.on('foobar', function() { ... });
    obj.emit('foobaz'); // nothing happens

Contrast with:

    var obj = {};
    obj.foobar = new Signal();
    obj.foobar.connect(function() { ... });
    obj.foobaz.emit(); // runtime error

## Example

    var Signal = require('signalkit').Signal;
    var signal = new Signal('foo');

    var unsub1 = signal.connect(function(name) {
        console.log("handler 1: " + name);
    });

    var foo = {
        bar: function(name) {
            console.log("handler 2: " + name);
        }
    };

    var unsub2 = signal.connect(foo, 'bar');

    console.log("emit fred...");
    signal.emit("fred");

    console.log("emit bob...");
    unsub1();
    signal.emit("bob");

    console.log("emit alice...");
    unsub2();
    signal.emit("alice");

## API

### Signals

#### `var signal = new Signal(name, [parent])`

Create a new signal with a given `name` and optional `parent`. If a `parent` is specified all calls to `emit()` will propagate recursively through the parent chain.

#### `signal.connect(fn)`

Connect a supplied function so it will be called when this `Signal` is `emit`ted.

Returns a function that can be called to cancel the connection.

#### `signal.connect(object, methodName)`

Connect a supplied object/method to this `Signal`, i.e. call `object[methodName]()` when signal is emitted. The method lookup is lazy; that is, `object[methodName]` is resolved each time the signal is fired, rather than being bound at the time of connection.

Returns a function that can be called to cancel the connection.

#### `signal.once(fn)`

As per `signal.connect(fn)`, except that the function is called once and once only.

Returns a function that can be called to cancel the connection.

#### `signal.once(object, methodName)`

As per `signal.connect(object, methodName)`, except that the method is called once and once only.

Returns a function that can be called to cancel the connection.

#### `signal.emit(args...)`

Emit this signal, invoking each connected function with the given arguments. All handlers are guaranteed to fire; any errors thrown by handlers will be caught and re-raised asynchronously.

The `emit()` call will propagate recursively through the signal's parent chain.

#### `signal.clear()`

Remove all connections.

#### Error handling

You can catch - and handle - any errors thrown during event handling by overriding `signal.onError`, which receives the thrown error as an argument. Your error handler may return `false` to prevent any successive handlers from being fired. The default behaviour is to continue firing the remaining handlers and rethrow the error asynchronously.

The default error handler for all signals can be changed by setting `Signal.prototype.onError`.

## TODO

  * Async emit. Not sure if this should be specified at signal creation time or emission time.