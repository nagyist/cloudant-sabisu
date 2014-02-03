// Generated by CoffeeScript 1.6.3
(function() {
  var sabisu;

  sabisu = angular.module('sabisu', []);

  sabisu.config(function($locationProvider) {
    return $locationProvider.html5Mode(true);
  });

  sabisu.filter('slice', function() {
    return function(arr, start, end) {
      return arr.slice(start, end);
    };
  });

  sabisu.filter('joinBy', function() {
    return function(input, delimiter) {
      return (input || []).join(delimiter || ',');
    };
  });

  sabisu.factory('eventsFactory', function($log, $http) {
    var factory;
    factory = {};
    factory.searchEvents = function(search_query, sort, limit) {
      if (!(sort === "issued" || sort === "status" || sort === "occurences")) {
        sort = sort + '<string>';
      }
      sort = "[\"" + sort + "\"]";
      if (search_query === '') {
        search_query = '*:*';
      }
      return $http({
        method: 'GET',
        url: '/api/events/search',
        params: {
          query: search_query,
          limit: limit,
          sort: sort
        }
      });
    };
    return factory;
  });

  sabisu.factory('stashesFactory', function($log, $http) {
    var factory;
    factory = {};
    factory.stashes = function() {
      return $http.get('/sensu/stashes');
    };
    factory.saveStash = function(stash) {
      return $http.post("/sensu/stashes", stash);
    };
    factory.deleteStash = function(path) {
      return $http["delete"]("/sensu/stashes/" + path);
    };
    return factory;
  });

  sabisu.controller('eventsController', function($scope, $log, $location, $filter, eventsFactory, stashesFactory) {
    $scope.checks = [];
    $scope.clients = [];
    $scope.events_spin = false;
    $scope.bulk = 'show';
    if ($location.search().query != null) {
      $scope.search_field = $location.search().query;
    } else {
      $scope.search_field = '';
    }
    if ($location.search().sort != null) {
      $scope.sort = $location.search().sort;
    } else {
      $scope.sort = 'client';
    }
    if ($location.search().limit != null) {
      $scope.limit = $location.search().limit;
    } else {
      $scope.limit = '50';
    }
    $scope.updateStashes = function() {
      var buildSilencePopover;
      $scope.stashes = [];
      buildSilencePopover = function(stash) {
        var html;
        stash['content']['author'] = "cbarraford";
        stash['content']['comment'] = "herp herp derp";
        stash['content']['expires'] = "8 hours";
        html = '<div class="silence_window">';
        if (stash['content']['timestamp'] != null) {
          html = "<dl class=\"dl-horizontal\">\n  <dt>Created</dt>\n  <dd>" + ($filter('date')(stash['content']['timestamp'] * 1000, "short")) + "</dd>";
        }
        if (stash['content']['author'] != null) {
          html += "<dt>Author</dt>\n<dd>" + stash['content']['author'] + "</dd>";
        }
        if (stash['content']['expires'] != null) {
          html += "<dt class=\"text-danger\">Expires in</dt>\n<dd class=\"text-danger\">" + stash['content']['expires'] + "</dd>";
        }
        if (stash['content']['on_resolve'] != null) {
          html += "<dt class=\"text-success\">Delete on resolve</dt>";
        }
        html += "</dl>";
        if (stash['content']['comment'] != null) {
          html += "<dl>\n  <dt>Comment</dt>\n  <dd>" + stash['content']['comment'] + "</dd>\n</dl>";
        }
        html += "<button type=\"button\" class=\"deleteSilenceBtn btn btn-danger btn-sm pull-right\">\n    <span class=\"glyphicon glyphicon-remove\"></span> Delete\n</button>";
        return html += "</div>";
      };
      return stashesFactory.stashes().success(function(data, status, headers, config) {
        var check, client, event, parts, stash, _base, _base1, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          stash = data[_i];
          if (stash['path'].match(/^silence\//)) {
            $scope.stashes.push(stash);
          }
        }
        _ref = $scope.stashes;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          stash = _ref[_j];
          parts = stash['path'].split('/', 3);
          client = parts[1];
          if (parts.length > 2) {
            check = parts[2];
          } else {
            check = null;
          }
          _ref1 = $scope.events;
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            event = _ref1[_k];
            if ((_base = event.client).silenced == null) {
              _base.silenced = false;
            }
            if ((_base1 = event.check).silenced == null) {
              _base1.silenced = false;
            }
            if (client === event.client.name) {
              if (check === null) {
                event.client.silenced = true;
                event.client.silence_html = buildSilencePopover(stash);
              } else {
                if (check === event.check.name) {
                  event.check.silenced = true;
                  event.check.silence_html = buildSilencePopover(stash);
                }
              }
            }
          }
        }
        $('.silenceBtn').popover({
          trigger: 'click',
          html: true,
          placement: 'top',
          container: 'body',
          title: "Silence Details <button type=\"button\" class=\"btn btn-link btn-xs pull-right\"><span class=\"glyphicon glyphicon-remove\"></span>close</button>"
        });
        return $('.glyphicon-question-sign').tooltip();
      });
    };
    $scope.closePopovers = function() {
      return $('.silenceBtn').popover('hide');
    };
    $scope.updateSilencePath = function(path) {
      return $scope.silencePath = path;
    };
    $scope.saveSilence = function() {
      var author, comment, expiration, re, stash, timerToSec, timer_val, valid;
      valid = true;
      author = $('#author').val();
      if (author === '') {
        $('.silence_author').removeClass('has-success');
        $('.silence_author').addClass('has-error');
        valid = false;
      } else {
        $('.silence_author').removeClass('has-error');
        $('.silence_author').addClass('has-success');
      }
      comment = $('#comment').val();
      if (comment === '') {
        $('.silence_comment').removeClass('has-success');
        $('.silence_comment').addClass('has-error');
        valid = false;
      } else {
        $('.silence_comment').removeClass('has-error');
        $('.silence_comment').addClass('has-success');
      }
      timer_val = $('#timer_val').val();
      expiration = $('input[name=expiration]:checked', '#silence_form').val();
      if (expiration === 'timer') {
        re = new RegExp('^\\d*(m|h|d|w)$');
        if (re.test(timer_val)) {
          $('.silence_timer_val').removeClass('has-error');
          $('.silence_timer_val').addClass('has-success');
        } else {
          $('.silence_timer_val').removeClass('has-success');
          $('.silence_timer_val').addClass('has-error');
          valid = false;
        }
      } else {
        $('.silence_timer_val').removeClass('has-error');
        $('.silence_timer_val').removeClass('has-success');
      }
      timerToSec = function(val) {
        var conversion, q, quantity, u, unit;
        q = new RegExp('^\\d.*');
        u = new RegExp('[a-z]$');
        conversion = {
          m: 60,
          h: 60 * 60,
          d: 60 * 60 * 24,
          w: 60 * 60 * 24 * 7
        };
        quantity = val.match(q)[0];
        unit = val.match(u)[0];
        return quantity * conversion[unit];
      };
      if (valid) {
        stash = {};
        stash['path'] = "silence/" + $scope.silencePath;
        stash['content'] = {};
        stash['content']['timestamp'] = Math.round((new Date().getTime()) / 1000);
        stash['content']['author'] = author;
        stash['content']['comment'] = comment;
        stash['content']['expiration'] = expiration;
        if (expiration === 'timer') {
          stash['content']['expires'] = timerToSec(timer_val);
        }
        return stashesFactory.saveStash(stash).success(function(data, status, headers, config) {
          $scope.updateStashes();
          author = $('#author').val();
          $('.silence_author').removeClass('has-success');
          $('.silence_author').removeClass('has-error');
          comment = $('#comment').val();
          $('.silence_comment').removeClass('has-success');
          $('.silence_comment').removeClass('has-error');
          timer_val = $('#timer_val').val();
          expiration = $('input[name=expiration]:checked', '#silence_form').val();
          $('.silence_timer_val').removeClass('has-error');
          $('.silence_timer_val').removeClass('has-success');
          return $('#silence_window').modal('hide');
        }).error(function(data, status, headers, config) {
          return alert("Failed to silence: (" + status + ") " + data);
        });
      }
    };
    $scope.deleteSilence = function(path) {
      return stashesFactory.deleteStash(path);
    };
    $scope.updateEvents = function() {
      $scope.events = [];
      $scope.events_spin = true;
      $location.search('query', $scope.search_field);
      $location.search('sort', $scope.sort);
      $location.search('limit', $scope.limit);
      return eventsFactory.searchEvents($scope.search_field, $scope.sort, $scope.limit).success(function(data, status, headers, config) {
        var checks, color, ctx, datapoints, event, events, k, statuses, statuses_data, v, _i, _len, _ref;
        color = ['success', 'warning', 'danger', 'info'];
        status = ['OK', 'Warning', 'Critical', 'Unknown'];
        events = [];
        if ('bookmark' in data) {
          $scope.bookmark = data['bookmark'];
        }
        if ('count' in data) {
          $scope.count = data['count'];
        }
        if ('ranges' in data) {
          statuses = data['ranges']['status'];
          $('#stats_status').find('#totals').find('.label-success').text("OK: " + statuses['OK']);
          $('#stats_status').find('#totals').find('.label-warning').text("Warning: " + statuses['Warning']);
          $('#stats_status').find('#totals').find('.label-danger').text("Critical: " + statuses['Critical']);
          $('#stats_status').find('#totals').find('.label-info').text("Unknown: " + statuses['Unknown']);
          statuses_data = [
            {
              value: statuses['OK'],
              color: "#18bc9c",
              label: 'OK',
              labelColor: 'white'
            }, {
              value: statuses['Warning'],
              color: "#f39c12",
              label: 'Warning',
              labelColor: 'white'
            }, {
              value: statuses['Critical'],
              color: "#e74c3c",
              label: 'Critical',
              labelColor: 'white'
            }, {
              value: statuses['Unknown'],
              color: "#3498db",
              label: 'Unknown',
              labelColor: 'white'
            }
          ];
          ctx = $('#chart_pie_status').get(0).getContext('2d');
          new Chart(ctx).Pie(statuses_data);
        }
        if ('counts' in data) {
          checks = data['counts']['check'];
          datapoints = [];
          for (k in checks) {
            v = checks[k];
            datapoints.push([k, v]);
          }
          datapoints.sort(function(a, b) {
            return a[1] - b[1];
          });
          $scope.checks = datapoints.reverse();
          checks = data['counts']['client'];
          datapoints = [];
          for (k in checks) {
            v = checks[k];
            datapoints.push([k, v]);
          }
          datapoints.sort(function(a, b) {
            return a[1] - b[1];
          });
          $scope.clients = datapoints.reverse();
        }
        if ('rows' in data) {
          _ref = data['rows'];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            event = _ref[_i];
            event = event['doc']['event'];
            event['id'] = Math.floor(Math.random() * 100000000000);
            event['color'] = color[event['check']['status']];
            event['wstatus'] = status[event['check']['status']];
            event['rel_time'] = "2 hours ago";
            event['check']['issued'] = event['check']['issued'] * 1000;
            if (event['check']['state_change'] != null) {
              event['check']['state_change'] = event['check']['state_change'] * 1000;
            }
            events.push(event);
          }
          $scope.updateStashes();
          $scope.events_spin = false;
          return $scope.events = events;
        }
      });
    };
    $scope.updateEvents();
    $scope.bulkToggleDetails = function() {
      var event, mySwitch, _i, _len, _ref, _results;
      mySwitch = $scope.bulk;
      _ref = $scope.events;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        _results.push($("#" + event['id']).collapse(mySwitch));
      }
      return _results;
    };
    $('.collapse').on('hide.bs.collapse', function() {
      $scope.bulk = 'show';
      $(this).parent().find('.toggleBtnIcon').removeClass('glyphicon-collapse-up');
      return $(this).parent().find('.toggleBtnIcon').addClass('glyphicon-collapse-down');
    });
    $('.collapse').on('show.bs.collapse', function() {
      $scope.bulk = 'hide';
      $(this).parent().find('.toggleBtnIcon').removeClass('glyphicon-collapse-down');
      return $(this).parent().find('.toggleBtnIcon').addClass('glyphicon-collapse-up');
    });
    $scope.toggleDetails = function(id) {
      return $("#" + id).collapse('toggle');
    };
    return $scope.togglePopover = function() {
      $(this).popover();
      return $(this).popover('toggle');
    };
  });

}).call(this);
