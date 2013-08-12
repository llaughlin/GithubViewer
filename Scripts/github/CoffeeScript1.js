(function() {
  var _this = this;

  ViewModel(function() {
    return this.repoName = ko.observable();
  });

  authorize(function() {
    return true;
  });

}).call(this);
