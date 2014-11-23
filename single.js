var nextTick = require('./private/next_tick');
var _makeHandler = require('./private/make_handler');

function SingleSignal(name, parent) {
    this.name = name;
    this.parent = parent;
    this._listener = null;
}

SingleSignal.prototype.onError = function(err) {
    nextTick(function() { throw err; });
}

SingleSignal.prototype.emit = function() {
    if (this._listener) {
        try {
            this._listener.apply(null, arguments);  
        } catch (err) {
            this.onError(err);
        }
    }
    if (this.parent) {
        this.parent.emit.apply(this.parent, arguments);
    }
}

SingleSignal.prototype.connect = function(target, action) {
    return this._connect(target, action);
}

SingleSignal.prototype.connect_c = function(target, action) {
    var handler = this._connect(target, action);

    var self = this;
    var removed = false;
    return function() {
        if (removed) return;
        self._listener = null;
        removed = true;
    }
}

SingleSignal.prototype.disconnect = function(fn) {
    if (this._listener === fn) {
        return this._listener = null;
        return true;
    } else {
        return false;
    }
}

SingleSignal.prototype.once = function(target, action) {
    var handler = _makeHandler(target, action);
    function inner() { cancel(); handler.apply(null, arguments); }
    var cancel = this.connect_c(inner);
    return inner;
}

SingleSignal.prototype.once_c = function(target, action) {
    var handler = _makeHandler(target, action);
    function inner() { cancel(); handler.apply(null, arguments); }
    var cancel = this.connect_c(inner);
    return cancel;
}

SingleSignal.prototype.clear = function() {
    this._listener = null;
}

SingleSignal.prototype._connect = function(target, action) {
    if (this._listener) {
        throw new Error("single signal is already connected!")
    }
    var handler = this._listener = _makeHandler(target, action);
    return handler;
}

module.exports = function(name, parent) { return new SingleSignal(name, parent); }
module.exports.SingleSignal = SingleSignal;