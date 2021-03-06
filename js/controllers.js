// Generated by CoffeeScript 1.7.1
(function() {
  var app;

  app = angular.module('CoffeeModule');

  app.controller("FieldMarshalCtrl", function($scope, $store, $http, $location, FieldMarshal) {
    var currentMarshal, fieldmarshalInfo, getManifest, intervals, mungeSlavesToProcs, selected;
    $store.bind($scope, "fieldmarshalInfo");
    if ($scope.fieldmarshalInfo == null) {
      $scope.fieldmarshalInfo = {};
    }
    if ($scope.fieldmarshalInfo === "") {
      $scope.fieldmarshalInfo = {};
    }
    fieldmarshalInfo = $scope.fieldmarshalInfo;
    $scope.newMarshal = {
      port: 4001
    };
    if (fieldmarshalInfo.marshals == null) {
      fieldmarshalInfo.marshals = {};
    }
    if (fieldmarshalInfo.selected == null) {
      fieldmarshalInfo.selected = '';
    }
    selected = fieldmarshalInfo.selected;
    $scope.currentMarshal = currentMarshal = fieldmarshalInfo.marshals[selected] || {};
    if (selected == null) {
      $location.path('settings');
    }
    $http.defaults.headers.common.authorization = "Basic " + (btoa("quartermaster:" + currentMarshal.pass));
    mungeSlavesToProcs = function(slaves) {
      var name, pid, proc, slave, _results;
      $scope.allProcs = [];
      _results = [];
      for (name in slaves) {
        slave = slaves[name];
        _results.push((function() {
          var _ref, _results1;
          _ref = slave.processes;
          _results1 = [];
          for (pid in _ref) {
            proc = _ref[pid];
            proc.slave = name;
            proc.port = proc.opts.env.PORT;
            proc.commit = proc.opts.commit;
            _results1.push($scope.allProcs.push(proc));
          }
          return _results1;
        })());
      }
      return _results;
    };
    $scope.getSlaves = function() {
      return FieldMarshal.get({
        action: 'slaves',
        host: "" + currentMarshal.host + ":" + currentMarshal.port
      }, function(data, status, headers, config) {
        var name, slave;
        mungeSlavesToProcs(data);
        $scope.slavesStr = JSON.stringify(data, null, "  ");
        for (name in data) {
          slave = data[name];
          if (name[0] === '$') {
            continue;
          }
          slave.numProcs = Object.keys(slave.processes).length;
        }
        return $scope.slaves = data;
      });
    };
    getManifest = function() {
      return FieldMarshal.get({
        action: 'manifest',
        host: "" + currentMarshal.host + ":" + currentMarshal.port
      }, function(manifest) {
        var data, name, proc, running, _i, _len, _ref;
        for (name in manifest) {
          data = manifest[name];
          if ($scope.allProcs == null) {
            continue;
          }
          if (name[0] === '$') {
            continue;
          }
          running = 0;
          _ref = $scope.allProcs;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            proc = _ref[_i];
            if (proc.repo === name && proc.opts.commit === data.opts.commit) {
              running++;
            }
          }
          data.running = running;
        }
        return $scope.manifest = manifest;
      });
    };
    $scope.getRawManifest = function() {
      return FieldMarshal.get({
        action: 'manifest',
        host: "" + currentMarshal.host + ":" + currentMarshal.port
      }, function(manifest) {
        return $scope.rawManifest = JSON.stringify(manifest, null, '  ');
      });
    };
    intervals = [];
    intervals.push(setInterval(getManifest, 3000));
    getManifest();
    intervals.push(setInterval($scope.getSlaves, 3000));
    $scope.getSlaves();
    $scope.$on('$destroy', function(e) {
      var interval, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = intervals.length; _i < _len; _i++) {
        interval = intervals[_i];
        _results.push(clearInterval(interval));
      }
      return _results;
    });
    $scope.conditionalStyle = function(instances, running) {
      if (instances > running) {
        return "instancesBelow";
      }
      if (instances < running) {
        return "instancesAbove";
      }
      return "";
    };
    $scope.sort = {
      column: 'port',
      descending: 'true'
    };
    $scope.changeSorting = function(column) {
      var sort;
      sort = $scope.sort;
      if (sort.column === column) {
        return sort.descending = !sort.descending;
      } else {
        sort.column = column;
        return sort.descending = false;
      }
    };
    $scope.stop = function(slave, pid) {
      return FieldMarshal.save({
        action: 'stop',
        host: "" + currentMarshal.host + ":" + currentMarshal.port,
        slave: slave,
        ids: [pid]
      });
    };
    return $scope.addFieldMarshal = function(newMarshal) {
      var name, _, _ref, _results;
      $scope.fieldmarshalInfo.marshals[newMarshal.name] = newMarshal;
      $scope.fieldmarshalInfo.marshalNames = [];
      _ref = $scope.fieldmarshalInfo.marshals;
      _results = [];
      for (name in _ref) {
        _ = _ref[name];
        _results.push($scope.fieldmarshalInfo.marshalNames.push(name));
      }
      return _results;
    };
  });

}).call(this);
