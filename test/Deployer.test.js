
var assert = require('assert');

var Deployer = require('../lib/Deployer.js');

describe('Deployer', function() {

	it.skip('constructs', function() {



	});

	it('start', function() {

		var mockAxonSocketCallCount = 0;
		var mockSockBindCallCount = 0;
		var mockPullCallCount = 0;

		var mockSock = {
			bind: function(port) {
				assert(mockAxonSocketCallCount === 1);
				assert(port === 1488);
				mockSockBindCallCount++;
			}
		};

		var mock = {

			_conf: {
				port: 1488
			},

			_axon: {

				socket: function(type) {
					assert(type === 'req');
					mockAxonSocketCallCount++;
					return mockSock;
				}

			},

			_pull: function() {
				assert(mockSockBindCallCount === 1);
				mockPullCallCount++;
			}
		};

		Deployer.prototype.start.call(mock);

		assert(mock._sock === mockSock);

		assert(mockAxonSocketCallCount === 1);
		assert(mockSockBindCallCount === 1);
		assert(mockPullCallCount === 1);

	});

	it('_onPulled do nothing on error', function() {

		Deployer.prototype._onPulled.call({}, 'error');

	});

	it('_onPulled update dependencies if update is true', function() {

		var mockUpdateDepsCallCount = 0;

		var mock = {

			_updateDeps: function() {
				mockUpdateDepsCallCount++;
			}

		};

		Deployer.prototype._onPulled.call(mock, null, true);

		assert(mockUpdateDepsCallCount === 1);

	});

	it('_onPulled schedules pull if update is false', function() {

		var mockSchedulePullCallCount = 0;

		var mock = {

			_schedulePull: function() {
				mockSchedulePullCallCount++;
			}

		};

		Deployer.prototype._onPulled.call(mock, null, false);

		assert(mockSchedulePullCallCount === 1);

	});

	it('_onDepsUpdated reschedules update on error', function() {

		var mockSetTimeoutCallCount = 0;

		var mock = {

			_updateDepsBound: '_updateDepsBound',

			_setTimeout: function(callback, time) {
				mockSetTimeoutCallCount++;
				assert(callback === '_updateDepsBound');
				assert(time === 60000);
			}

		};

		Deployer.prototype._onDepsUpdated.call(mock, 'error');

		assert(mockSetTimeoutCallCount === 1);

	});

	it('_onDepsUpdated updates if there is no an error', function() {

		var mockUpdateCallCount = 0;

		var mock = {

			_update: function() {
				mockUpdateCallCount++;
			}

		};

		Deployer.prototype._onDepsUpdated.call(mock, null);

		assert(mockUpdateCallCount === 1);

	});

	it('_update', function() {

		var mockAsyncSeriesCallCount = 0;

		var mock = {

			_updateTasks: 'testTasks',
			_onUpdatedBound: 'testOnUpdatedBound',

			_async: {

				series: function(tasks, callback) {
					mockAsyncSeriesCallCount++;
					assert(tasks === 'testTasks');
					assert(callback === 'testOnUpdatedBound');
				}

			}

		};

		Deployer.prototype._update.call(mock);

		assert(mockAsyncSeriesCallCount === 1);

	});

	it('_onUpdated do nothing on error', function() {

		Deployer.prototype._onUpdated.call({}, 'error');

	});

	it('_onUpdated schedules pull if there is no an error', function() {

		var mockSchedulePullCallCount = 0;

		var mock = {

			_schedulePull: function() {
				mockSchedulePullCallCount++;
			}

		};

		Deployer.prototype._onUpdated.call(mock, null);

		assert(mockSchedulePullCallCount === 1);

	});

	it('_schedulePull', function() {

		var mockSetTimeoutCallCount = 0;

		var mock = {

			_pullBound: 'testPullBound',

			_setTimeout: function(callback, time) {
				mockSetTimeoutCallCount++;
				assert(callback === 'testPullBound');
				assert(time === 60000);
			}

		};

		Deployer.prototype._schedulePull.call(mock);

		assert(mockSetTimeoutCallCount === 1);

	});

	it('_pull', function() {

		var mockChildProcessExecCallCount = 0;

		var mock = {

			_conf: {
				dirtyPath: 'testDirtyPath'
			},

			_onPullProcessFinishedBound: 'testOnPullProcessFinishedBound',

			_childProcess: {

				exec: function(command, settings, callback) {
					mockChildProcessExecCallCount++;
					assert(command === 'git pull');
					assert.deepEqual(settings, { cwd: 'testDirtyPath' });
					assert(callback === 'testOnPullProcessFinishedBound');
				}

			}

		};

		Deployer.prototype._pull.call(mock);

		assert(mockChildProcessExecCallCount === 1);

	});

	it('_onPullProcessFinished forwards error on error', function() {

		var mockOnPulled = 0;

		var mock = {

			_onPulled: function(err) {
				assert(err === 'testError');
				mockOnPulled++;
			}

		};

		Deployer.prototype._onPullProcessFinished.call(mock, 'testError');

		assert(mockOnPulled === 1);

	});

	it('_onPullProcessFinished if already up-to-date', function() {

		var testStdout = new Buffer('Already up-to-date.\n');
		var mockOnPulled = 0;

		var mock = {

			_onPulled: function(err, updated) {
				assert(err === null);
				assert(updated === false);
				mockOnPulled++;
			}

		};

		Deployer.prototype._onPullProcessFinished.call(mock, null, testStdout);

		assert(mockOnPulled === 1);

	});

	it('_onPullProcessFinished if not up-to-date', function() {

		var testStdout = new Buffer('Bla bla.\n');
		var mockOnPulled = 0;

		var mock = {

			_onPulled: function(err, updated) {
				assert(err === null);
				assert(updated === true);
				mockOnPulled++;
			}

		};

		Deployer.prototype._onPullProcessFinished.call(mock, null, testStdout);

		assert(mockOnPulled === 1);

	});

	it('_updateDeps', function() {

		var mockChildProcessExecCallCount = 0;

		var mock = {

			_conf: {
				dirtyPath: 'testDirtyPath'
			},

			_updateDepsProcessFinishedBound: 'testUpdateDepsProcessFinishedBound',

			_childProcess: {

				exec: function(command, settings, callback) {
					assert(command === 'npm install');
					assert.deepEqual(settings, { cwd: 'testDirtyPath' });
					assert(callback === 'testUpdateDepsProcessFinishedBound');
					mockChildProcessExecCallCount++;
				}

			}

		};

		Deployer.prototype._updateDeps.call(mock);

		assert(mockChildProcessExecCallCount === 1);

	});

});
