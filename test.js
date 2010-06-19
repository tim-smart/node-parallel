var parallel = require('./lib/parallel');
var sys = require('sys');

var task = new parallel.Sequence(
  function (next) {
    sys.puts('1');
    next('2');
  },
  function (next, text) {
    sys.puts(text);
    process.nextTick(next.parallel());
    process.nextTick(next.parallel());
    process.nextTick(next.parallel());
  },
  function (next, err, results) {
    sys.puts('3');
    sys.puts(sys.inspect(arguments));
    next();
  }
);
task.run(function () {
  sys.puts('Done.');
});
