var nextTick        = require('./private/next_tick');
var _makeHandler    = require('./private/make_handler');

function _remove(ary, item) {
    if (ary) {
        for (var ix = 0, len = ary.length; ix < len; ++ix) {
            if (ary[ix] === item) {
                ary.splice(ix, 1);
                return true;
            }
        }
    }
    return false;
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
    return this._connect(target, action);
}

Signal.prototype.connect_c = function(target, action) {
    var handler = this._connect(target, action);

    var listeners = this._listeners;
    var removed = false;
    return function() {
        if (removed) return;
        _remove(listeners, handler);
        removed = true;
    }
}

Signal.prototype.disconnect = function(fn) {
    if (this._listeners) {
        return _remove(this._listeners, fn);    
    } else {
        return false;
    }
    
}

Signal.prototype.once = function(target, action) {
    var handler = _makeHandler(target, action);
    function inner() { cancel(); handler.apply(null, arguments); }
    var cancel = this.connect_c(inner);
    return inner;
}

Signal.prototype.once_c = function(target, action) {
    var handler = _makeHandler(target, action);
    function inner() { cancel(); handler.apply(null, arguments); }
    var cancel = this.connect_c(inner);
    return cancel;
}

Signal.prototype.clear = function() {
    this._listeners = null;
}

//
// Private

Signal.prototype._connect = function(target, action) {
    var handler = _makeHandler(target, action);
    if (!this._listeners) this._listeners = [];
    this._listeners.push(handler);
    return handler;
}

//
// Exports

module.exports = function(name, parent) { return new Signal(name, parent); }
module.exports.Signal = Signal;

