//
// Helpers

if (typeof process !== 'undefined') {
    var nextTick = process.nextTick;
} else {
    var nextTick = function(fn) { setTimeout(fn, 0); }
}

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

function Signal(name, parent) {
    this.name = name;
    this.parent = parent;
    this._listeners = null;
}

Signal.prototype.onError = function(err) {
    nextTick(function() { throw err; });
}

Signal.prototype.emit = function() {
    
    if (this._listeners) {
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
    
    if (this.parent) {
        this.parent.emit.apply(this.parent, arguments);
    }

}

Signal.prototype.connect = function(target, action) {
    if (!this._listeners) this._listeners = [];
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

Signal.prototype.once = function(target, action) {
    var cancel = this.connect(function() {
        if (target && action) {
            target[action].apply(target, arguments);
        } else if (typeof target === 'function') {
            target.apply(null, arguments);
        } else {
            throw "signal connect expects either handler function or target/action pair";
        }
        cancel();
    });
    return cancel;
}

Signal.prototype.clear = function() {
    this._listeners = null;
}

//
// Exports

module.exports = function(name) { return new Signal(name); }
module.exports.Signal = Signal;