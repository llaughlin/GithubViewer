(function() {
  var ViewModel, alert, alertModel, commitModel, fileModel;

  alertModel = function(title, message, severity) {
    this.title = ko.observable(title);
    this.message = ko.observable(message);
    this.severity = ko.observable(severity != null ? severity : "alert alert-error");
  };

  commitModel = function(data) {
    ko.mapping.fromJS(data, {}, this);
    this.files = ko.observableArray();
  };

  fileModel = function(data) {
    ko.mapping.fromJS(data, {}, this);
    this.badgeStatus = ko.computed(function() {
      switch (this.status()) {
        case 'added':
          return 'badge badge-success';
        case 'modified':
          return 'badge badge-info';
        case 'removed':
          return 'badge badge-important';
        default:
          return 'badge';
      }
    }, this);
  };

  alert = function(title, message, severity) {
    viewModel.alerts.push(new alertModel(title, message, severity));
  };

  ViewModel = function() {
    var self;
    self = this;
    self.repoName = ko.observable();
    self.commits = ko.observableArray();
    self.alerts = ko.observableArray();
    self.getCommits = function() {
      var url, _ref,
        _this = this;
      if (!((_ref = self.repoName()) != null ? _ref.length : void 0)) {
        alert("Please specify a repository");
        return;
      }
      url = "https://api.github.com/repos/" + self.repoName() + "/commits";
      return $.get(url).done(function(data) {
        var mapping;
        mapping = {
          'commit': {
            create: function(options) {
              return new commitModel(options.data);
            }
          }
        };
        return ko.mapping.fromJS(data, mapping, self.commits);
      }).fail(function(data) {
        return alert("Error when fetching commits!", data.statusText);
      });
    };
    self.getFiles = function(commit) {
      var url;
      if (!commit.commit.files.length) {
        url = "https://api.github.com/repos/" + self.repoName() + "/commits/" + commit.sha();
        return $.get(url).done(function(data) {
          var mapping;
          mapping = {
            'files': {
              create: function(options) {
                return new fileModel(options.data);
              }
            }
          };
          return ko.mapping.fromJS(data, mapping, commit.commit);
        }).fail(function(data) {
          return alert("Error when fetching files!", data.statusText);
        });
      }
    };
    return this;
  };

  $(function() {
    window.viewModel = new ViewModel();
    ko.applyBindings(viewModel);
    $('#repoName').tooltip({
      title: "Format: <username>/<reponame>"
    });
  });

}).call(this);
