
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
	})

});
