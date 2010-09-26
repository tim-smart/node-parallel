
var Task = exports.Task = function Task(actions) {
  this.actions  = {};
  this._emitter = new process.EventEmitter();
  this.length   = 0;

  if ('object' === typeof actions) {
    var keys = Object.keys(actions);
    for (var i = 0, key; key = keys[i++]; ) {
      this.add(key, actions[key]);
    }
  }

  return this;
};

Task.prototype.add = function add(name, action) {
  if (!this.actions[name]) {
    ++this.length;
  }

  this.actions[name] = action;

  return this;
};

Task.prototype.bind = function bind() {
  var callback = arguments[arguments.length - 1],
      names = Array.prototype.slice.call(arguments, 0, -1);

  for (var i = 0, name; name = names[i++]; ) {
    this._emitter.addListener(name, callback);
  }

  return this;
};

Task.prototype.run = function run(callback) {
  var keys  = Object.keys(this.actions),
      count = keys.length,
      self  = this;

  if (0 >= count) {
    callback(null);
    return this;
  }

  keys.forEach(function (key) {
    var action = self.actions[key][0],
        args   = self.actions[key].slice(1);

    args.push(function() {
      arguments = Array.prototype.slice.call(arguments);
      arguments.unshift(key);
      self._emitter.emit.apply(self._emitter, arguments);
      callback.apply(self, arguments);

      count--;
      if (0 >= count) {
        callback.call(self, null);
      }
    });

    action.apply(null, args);
  });

  return this;
};

var Sequence = exports.Sequence = function Sequence(tasks) {
  if (typeof tasks === 'function') {
    tasks = Array.prototype.slice.call(arguments);
  }
  this._tasks = tasks || [];
  return this;
};

Sequence.prototype.add = function add() {
  var tasks = Array.prototype.slice.call(arguments);
  this._tasks.push.apply(this._tasks, tasks);
  return this;
};

Sequence.prototype.run = function run(callback) {
  var tasks = this._tasks.slice();
  var next = function next() {
    counter = 0; results = []; error = null;

    var task = tasks.shift();
    if (typeof task !== 'function') {
      return callback ? callback.apply(this, arguments) : null;
    }
    var args = Array.prototype.slice.call(arguments);
    args.unshift(next);
    try {
      task.apply(null, args);
    } catch (error) {
      next(error)
    }
  };
  var counter = 0,
      results = [],
      error = null;
  next.__defineGetter__('parallel', function parallel() {
    var i = counter++;
    results[i] = null;
    return function () {
      if (arguments[0]) {
        error = arguments[0];
      }
      results[i] = arguments[1];
      counter--;
      if (counter <= 0) {
        results.unshift(results.slice());
        results.unshift(error);
        next.apply(null, results);
      }
    };
  });

  if (tasks.length > 0) {
    tasks.shift()(next);
  }
  return this;
};
