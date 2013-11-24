
var _  = require('lodash');
var async = require('async');
var axon = require('axon');
var childProcess = require('child_process');
var log4js = require('log4js');
var ncp = require('ncp');
var fs = require('fs.extra');

var conf = require('./conf.js');

//

var logger = log4js.getLogger('deployer');

logger.debug(conf);

//

function Deployer() {
	logger.trace('Deployer');

	this._axon = axon;
	this._conf = conf;
	this._setTimeout = setTimeout;
	this._async = async;
	this._childProcess = childProcess;
	this._fs = fs;

	this._updateDepsProcessFinishedBound = _.bind(this._updateDepsProcessFinished, this);
	this._updateDepsBound = _.bind(this._updateDeps, this);
	this._pullBound = _.bind(this._pull, this);
	this._onPullProcessFinishedBound = _.bind(this._onPullProcessFinished, this);
	this._onUpdatedBound = _.bind(this._onUpdated, this);
	this._updateTasks = [
		_.bind(this._prepareServiceToStop, this),
		_.bind(this._stopService, this),
		_.bind(this._removeOld, this),
		_.bind(this._createNew, this),
		_.bind(this._copyUpdated, this),
		_.bind(this._startService, this)
	];
}

var p = Deployer.prototype;

p.start = function() {
	logger.trace('start');
	var sock = this._axon.socket('req');
	sock.bind(this._conf.port); // TODO: unref it
	this._sock = sock;
	this._pull();
};

p._onPulled = function(err, updated) {
	logger.trace('_onPulled');
	if (err) {
		logger.error(new Error(err));
		return;
	}
	if (updated) {
		this._updateDeps();
		return;
	}
	this._schedulePull();
};

p._onDepsUpdated = function(err) {
	logger.trace('_onDepsUpdated');
	if (err) {
		logger.warn(new Error(err));
		this._setTimeout(this._updateDepsBound, 60000);
		return;
	}
	this._update();
};

p._update = function() {
	logger.trace('_update');
	this._async.series(this._updateTasks, this._onUpdatedBound);
};

p._onUpdated = function(err) {
	logger.trace('_onUpdated');
	if (err) {
		logger.error(new Error(err));
		return;
	}
	this._schedulePull();
};

p._schedulePull = function() {
	logger.trace('_schedulePull');
	this._setTimeout(this._pullBound, 60000);
};

p._pull = function() {
	logger.trace('_pull');
	var settings = {
		cwd: this._conf.dirtyPath
	};
	this._childProcess.exec('git pull', settings, this._onPullProcessFinishedBound);
};

p._onPullProcessFinished = function(err, stdout, stderr) {
	logger.trace('_onPullProcessFinished');
	if (err) {
		this._onPulled(err);
		return;
	}
	var message = stdout.toString();
	var updated = message.indexOf('Already up-to-date.') === -1;
	this._onPulled(null, updated);
};

p._updateDeps = function() {
	logger.trace('_updateDeps');
	var settings = { cwd: this._conf.dirtyPath };
	this._childProcess.exec('npm install', settings, this._updateDepsProcessFinishedBound);
};

p._updateDepsProcessFinished = function(err, stdout, stderr) {
	logger.trace('_onInstalled');
	if (err) {
		this._onDepsUpdated(err);
		return;
	}
	this._onDepsUpdated(null);
};

p._prepareServiceToStop = function(callback) {
	logger.trace('_prepareServiceToStop');
	var onServiceReplied = _.bind(this._onServiceReplied, this, callback);
	this._sock.send('stop', onServiceReplied);
};

p._onServiceReplied = function(callback, message) {
	logger.trace('_onServiceReplied');
	logger.debug(message.toString());
	callback(null);
};

p._stopService = function(callback) {
	logger.trace('_stopService');
	var conf = this._conf;
	logger.debug('Stop using: cd %s && %s', conf.prodPath, conf.stopCommand);
	var settings = {
		cwd: conf.prodPath
	};
	this._childProcess.exec(conf.stopCommand, settings, callback);
};

p._removeOld = function(callback) {
	logger.trace('_removeOld');
	this._fs.rmrf(this._conf.prodPath, callback);
};

p._startService = function(callback) {
	logger.trace('_startService');
	var conf = this._conf;
	this._childProcess.exec(conf.startCommand, { cwd: conf.prodPath }, callback);
};

p._createNew = function(callback) {
	logger.trace('_createNew');
	var conf = this._conf;
	this._fs.mkdir(conf.prodPath, callback);
};

p._copyUpdated = function(callback) {
	logger.trace('_copyUpdated');
	var conf = this._conf;
	logger.debug('Copy from %s to %s', conf.dirtyPath, conf.prodPath);
	this._fs.copyRecursive(conf.dirtyPath, conf.prodPath, callback);
};

delete p;

//

module.exports = Deployer;
