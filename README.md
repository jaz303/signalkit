# signalkit

Tiny signal/delegates library.

## Example - Signals

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

#### `var signal = new Signal(name)`

Create a new signal with a given `name`.

#### `signal.connect(fn)`

Connect a supplied function so it will be called when this `Signal` is `emit`ted.

Returns a function that can be called to cancel the connection.

#### `signal.connect(object, methodName)`

Connect a supplied object/method to this `Signal`, i.e. call `object[methodName]()` when signal is emitted. The method lookup is lazy; that is, `object[methodName]` is resolved each time the signal is fired, rather than being bound at the time of connection.

Returns a function that can be called to cancel the connection.

#### `signal.emit(args...)`

Emit this signal, invoking each connected function with the given arguments. All handlers are guaranteed to fire; any errors thrown by handlers will be caught and re-raised asynchronously.

#### `signal.clear()`

#### Error handling

You can catch - and handle - any errors thrown during event handling by overriding `signal.onError`, which receives the thrown error as an argument. The default behaviour is to rethrow the error asynchronously.

The default error handler for all signals can be changed by setting `Signal.prototype.onError`.

Remove all connections.

### Delegates

Coming soon.

## TODO

  * Async emit. Not sure if this should be specified at signal creation time or emission time.