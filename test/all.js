var test = require('tape');
var Signal = require('../').Signal;

// synchronous test
function ts(title, fn) {
    test(title, function(assert) {
        fn(assert);
        assert.end();
    });
}

ts('callback - signal should fire', function(assert) {

    var x = 1;

    var sig = new Signal();
    sig.connect(function() { x++; });

    sig.emit();

    assert.equal(x, 2);

});

ts('target/action - signal should fire', function(assert) {

    var x = 1;
    var obj = {foo: function() { x++; }};

    var sig = new Signal();
    sig.connect(obj, 'foo');

    sig.emit();

    assert.equal(x, 2);

});

ts('multiple connections', function(assert) {

    var x = 0;
    var sig = new Signal();
    sig.connect(function() { x += 1; });
    sig.connect(function() { x += 2; });
    sig.connect(function() { x += 3; });

    sig.emit();

    assert.equals(x, 6);

});

ts('handler should receive args', function(assert) {

    var x;

    var sig = new Signal();
    sig.connect(function(a, b, c) { x = a + b + c; });

    sig.emit(1, 2, 3);

    assert.equals(x, 6);

});

ts('unsubscription', function(assert) {

    var x = 0;

    var sig = new Signal();
    sig.connect(function() { x = 10; })();

    sig.emit();

    assert.equals(x, 0);

});

ts('unsubscription should not affect other connections', function(assert) {

    var x = 0;
    var sig = new Signal();
    sig.connect(function() { x += 1; });
    sig.connect(function() { x += 2; })();
    sig.connect(function() { x += 3; });

    sig.emit();

    assert.equals(x, 4);

});

ts('unsubscription is idempotent', function(assert) {

    var x = 0;
    var sig = new Signal();

    sig.connect(function() { x += 1; });
    var un = sig.connect(function() { x += 2; });
    sig.connect(function() { x += 3; });

    un();
    un();

    sig.emit();
    assert.equals(x, 4);

    un();

    sig.emit();
    assert.equals(x, 8);

});

ts('clear', function(assert) {

    var x = 0;
    var sig = new Signal();
    sig.connect(function() { x += 1; });
    sig.connect(function() { x += 2; });
    sig.connect(function() { x += 3; });

    sig.clear();
    sig.emit();

    assert.equals(x, 0);

});

ts('error should not prevent firing of other handlers', function(assert) {

    var x = 0;
    
    var sig = new Signal();
    sig.onError = function(err) { /* swallow */ };

    sig.connect(function() { x += 1; });
    sig.connect(function() { throw "boom!"; });
    sig.connect(function() { x += 3; });

    sig.emit();

    assert.equals(x, 4);

});

ts('error handler should be called once for each error', function(assert) {

    var errCount = 0;;
    
    var sig = new Signal();
    sig.onError = function(err) { errCount++; };

    sig.connect(function() { });
    sig.connect(function() { throw "boom!"; });
    sig.connect(function() { throw "bang!"; });

    sig.emit();

    assert.equals(errCount, 2);

});