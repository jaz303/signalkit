module.exports = function(target, action) {
    if (action) {
        return function() { target[action].apply(target, arguments); }
    } else {
        return target; // assume fn
    }
}