
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

});
