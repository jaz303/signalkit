//
// Helpers

function makeUnsubscriber(listeners, handlerFn) {
    var cancelled = false;
    return function() {
        if (cancelled) return;
        for (var i = listeners.length - 1; i >= 0; --i) {
            if (listeners[i] === handlerFn) {
                listeners.splice(i, 1);
                cancelled = true;
                break;
            }
        }
    }
}

//
// Signals

function Signal(name) {
    this.name = name;
    this._listeners = [];
}

Signal.prototype.onError = function(err) {
    setTimeout(function() { throw err; }, 0);
}

Signal.prototype.emit = function() {
    for (var ls = this._listeners, i = ls.length - 1; i >= 0; --i) {
        try {
            ls[i].apply(null, arguments);
        } catch (err) {
            if (this.onError(err) === false) {
                break;
            }
        }
    }
}

Signal.prototype.connect = function(target, action) {
    if (target && action) {
        var handler = function() {
            target[action].apply(target, arguments);
        }
    } else if (typeof target === 'function') {
        var handler = target;
    } else {
        throw "signal connect expects either handler function or target/action pair";
    }
    this._listeners.push(handler);
    return makeUnsubscriber(this._listeners, handler);
}

Signal.prototype.clear = function() {
    this._listeners = [];
}

//
// Exports

module.exports = function(name) { return new Signal(name); }
module.exports.Signal = Signal;