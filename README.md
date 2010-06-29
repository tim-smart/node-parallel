Usage
=====

    var Task = require('parallel').Task;

    // Here is your typical async function
    var myAsyncFunction = function myAsyncFunction(id, callback) {
      database.getEntry(id, function (data) {
        callback(data);
      });
    };

    // We want to make a task that executes `myAsyncFunction` and passes
    // 1 & 3 as the first argument. Note: You do not need to supply a
    // callback argument

    // Every 'task entry' needs a unique id so it can be identified later.
    var myTask = new Task({
      1: [myAsyncFunction, 1], // This task has the id `1`, calls myAsyncFunction
                               // and passes `1` as the first argument
      2: [myAsyncFunction, 3]  // This task has the id `2`, calls myAsyncFunction
                               // and passes `3` as the first argument
    });

    // We can then add 'listeners' to task entries using `bind`, and
    // referencing the entry id

    // We pass a callback as the last argument, which is called like
    // it was passed directly to the async function.
    myTask.bind(1, function (data) {
      doSomethingWith(data);
    });

    // We can also bind to multiple entries
    myTask.bind(1, 2, function (data) {
      doSomethingElseWith(data);
    });

    // We then run the task with `run`. The only argument is a callback
    // which is passed the entry id as the first argument, and the additional
    // returned arguments are suffixed. The task id is `null` when everything
    // is finished.
    myTask.run(function (entry_id, data) {
      // This will be true when everything is done
      if (entry_id === null) {
        moveOnAndDoSomethingElse();
      }

      // This is true when entry 1 is done
      else if (entry_id === 1) {
        doSomethingWith(data);
      }

      // This is true when entry 2 is done
      else if (entry_id === 2) {
        doSomethingElseWith(data);
      }
    });

    // You can also add tasks dynamically
    // This will create 2 task entries that have the id's 0 & 1, and call
    // `myAsyncFunction` with the first argument as 0 & 2 respectivly
    myTask = new Task();

    for (var i = 0; i < 2; i++) {
      myTask.add(i, [myAsyncFunction, i * 2]);
    }

    // We can then bind and run the task like before

Also some usage of `Sequence`:

    var Sequence = require('parallel').Sequence,
        fs       = require('fs'),
        path     = require('path'),
        sys      = require('sys');

    // Create a new sequence, pass in an array of funcions, or
    // pass them as arguments
    var task = new Sequence([
      function (next) {
        // First argument is always a function that gets called on completion
        sys.puts('Hello world. We are starting!');
        fs.readFile(__filename, next);
      },
      function (next, err, buffer) {
        // The extra args gets suffixed onto the arguments
        sys.puts('The size of this example is: ' + buffer.length);

        // next.parallel is a variable you can pass which
        // enables you to do  multiple tasks at once.
        // It should only be used in cases where the expected
        // arguments passed to the callback are: error, result
        fs.readdir(__dirname, next.parallel);
        fs.readdir(path.join(__dirname, 'lib'), next.parallel);
      }
    ]);

    // You can also add tasks with the add method. This also opens
    // up dynamic task creation as an option
    task.add(function (next, err, results, first, second) {
      // The returned arguments from a parallel sequence
      // are as follows:
      // * Callback for next task (as usual)
      // * Error is there was one, otherwise will be null
      // * All the results as an array in order
      // * The result of the first task
      // * Result of second task
      // etc.
      sys.puts('This dir had ' + results[0].length + ' items.');
      sys.puts('The lib directory has ' + second.length + ' items.');

      // You can either make the last changes here, or call next
      // to run the callback passed to run(). You can pass arguments
      // as usual.
      next('Done.');
    });

    task.run(function (text) {
      // The callback to run is optional, and only gets called if the last
      // entry called next, or next.parallel.
      // Only difference is that callback function will not be the first
      // arguments.
      sys.puts(text);
    });
