var parallel = require('./lib/parallel');
var fs = require('fs');
var sys = require('sys');

var task = new parallel.Task({
  1: [fs.readFile, __filename],
  'tick': [process.nextTick]
});

task.add('dir', [fs.readdir, __dirname]);

task.bind(1, function (err, buffer) {
  sys.puts('parallel-1: ' + buffer.length);
});

task.run(function (task_name, err, data) {
  if (task_name === null) {
    seq.run(function () {
      sys.puts('Done.');
    });
  } else if (task_name === 'dir') {
    sys.puts('parallel-dir: ' + data.join(', '))
  } else if (task_name === 'tick') {
    sys.puts('parallel-tick');
  }
});

// Also accepts an array
var seq = new parallel.Sequence(
  function (next) {
    sys.puts('sequence-1');
    next('sequence-2');
  },
  function (next, text) {
    sys.puts(text);
    process.nextTick(next.parallel);
    process.nextTick(next.parallel);
    process.nextTick(next.parallel);
  },
  function (next, err, results) {
    sys.puts('sequence-3');
    sys.puts(sys.inspect(arguments));
    next();
  }
);
