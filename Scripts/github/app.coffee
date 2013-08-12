alertModel = (title, message, severity) ->
    @title = ko.observable(title)
    @message = ko.observable(message)
    @severity = ko.observable(severity ? "alert alert-error")
    return

commitModel = (data) ->
    ko.mapping.fromJS(data, {}, this)

    @files = ko.observableArray()
    return

fileModel = (data) ->
    ko.mapping.fromJS(data, {}, this)

    @badgeStatus = ko.computed(->
        switch @status()
            when 'added' then 'badge badge-success'
            when 'modified' then 'badge badge-info'
            when 'removed' then 'badge badge-important'
            else 'badge'
    , this)
    return

alert = (title, message, severity) ->
    viewModel.alerts.push(new alertModel(title, message, severity))
    return

ViewModel = -> 
    self = this
    self.repoName = ko.observable()
    self.commits = ko.observableArray()
    self.alerts = ko.observableArray()
    
    self.getCommits = ->
        if not self.repoName()?.length
            alert("Please specify a repository")
            return
        url = "https://api.github.com/repos/" + self.repoName() + "/commits"
        $.get(url)
        .done((data) =>
            mapping = {
                'commit' : {
                    create: (options) -> new commitModel(options.data)}
            }

            ko.mapping.fromJS(data, mapping, self.commits)
        ).fail((data) ->
            alert("Error when fetching commits!", data.statusText)
        )

    self.getFiles = (commit) -> 
        if not commit.commit.files.length
            url = "https://api.github.com/repos/" + self.repoName() + "/commits/" + commit.sha()
            $.get(url)
            .done((data) ->
                mapping = {
                    'files': {
                        create: (options) -> new fileModel(options.data)
                    }
                }
                ko.mapping.fromJS(data, mapping, commit.commit)
            )
            .fail((data) ->
                alert("Error when fetching files!", data.statusText)
            )

    return @
 
$( ->
    window.viewModel = new ViewModel()
    ko.applyBindings(viewModel)
    $('#repoName').tooltip({title: "Format: <username>/<reponame>"})
    return
)
