var test = require('tape');
var Signal = require('../single').SingleSignal;

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
    sig.connect_c(function() { x++; });

    sig.emit();

    assert.equal(x, 2);

});

ts('target/action - signal should fire', function(assert) {

    var x = 1;
    var obj = {foo: function() { x++; }};

    var sig = new Signal();
    sig.connect_c(obj, 'foo');

    sig.emit();

    assert.equal(x, 2);

});

ts('second connection throws error', function(assert) {

    var sig = new Signal();

    sig.connect(function() {});
    try {
        sig.connect(function() {});
        assert.fail();
    } catch (e) {
        assert.pass();
    }

});

ts('handler should receive args', function(assert) {

    var x;

    var sig = new Signal();
    sig.connect_c(function(a, b, c) { x = a + b + c; });

    sig.emit(1, 2, 3);

    assert.equals(x, 6);

});

ts('unsubscription', function(assert) {

    var x = 0;

    var sig = new Signal();
    sig.connect_c(function() { x = 10; })();

    sig.emit();

    assert.equals(x, 0);

});

ts('unsubscription is idempotent', function(assert) {

    var x = 0;
    var sig = new Signal();

    var un = sig.connect_c(function() { x += 2; });

    un();
    un();

    sig.emit();
    assert.equals(x, 0);

    un();

    sig.emit();
    assert.equals(x, 0);

});

ts('clear', function(assert) {

    var x = 0;
    var sig = new Signal();
    sig.connect_c(function() { x += 1; });

    sig.clear();
    sig.emit();

    assert.equals(x, 0);

});

ts('error handler should be called on error', function(assert) {

    var errCount = 0;;
    
    var sig = new Signal();
    sig.onError = function(err) { errCount++; };

    sig.connect_c(function() { throw "boom!"; });

    sig.emit();

    assert.equals(errCount, 1);

});

ts('once should work with function callbacks', function(assert) {

    var sig = new Signal();

    var a = 0;
    sig.once_c(function(x, y, z) { a = x + y + z; });
    sig.emit(1, 2, 3);

    assert.equals(a, 6);

});

ts('once should work with target/action pairs', function(assert) {

    var foo = {
        a: 0,
        bar: function(x, y, z) { this.a = x + y + z; }
    };

    var sig = new Signal();

    sig.once_c(foo, 'bar');
    sig.emit(1, 2, 3);

    assert.equals(foo.a, 6);

});

ts('once should fire once only', function(assert) {

    var sig = new Signal();

    var a = 0;

    sig.once_c(function() { a++; });
    
    sig.emit();
    sig.emit();
    sig.emit();

    assert.equals(a, 1);

});

ts('once should not fire if cancelled', function(assert) {

    var sig = new Signal();

    var a = 0;

    var cancel = sig.once_c(function() { a++; });

    cancel();

    sig.emit();
    sig.emit();
    sig.emit();

    assert.equals(a, 0);

});

ts('parent propagation', function(assert) {

    var sigp = new Signal();
    var sigc = new Signal(null, sigp);

    var a = 0;

    sigp.connect_c(function(x) { a = x; });
    sigc.emit(5);

    assert.ok(a === 5);

});