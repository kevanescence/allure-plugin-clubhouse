

var MyTabModel = Backbone.Collection.extend({
    url: 'data/clubhouse_status.json'
})

var mymodel = new MyTabModel();
mymodel.fetch();

class MyLayout extends allure.components.AppLayout {

    initialize() {
        this.model = new MyTabModel();
    }

    loadData() {
        return this.model.fetch();
    }

    getContentView() {
        return new MyView({items: this.model.models});
    }
}

function retrieveDSS(ids) {
    // Wait it
    console.log(ids)
    // Call the api node on the given ids
    return {
        "46470": {
            "status": "Ready for review",
            "title": "Refactor DynamoDB tests to make them more easily runnable"
        }
    }
}
const template = function (data) {
    h3_html = '<h3 class="pane__section-title">Related Clubhouse issues details</h3>'

    html_table = '<table class="tb-table">' +
         '<thead>'+
                '<tr>' +
                   '<th scope="col">Id</th>' +
                   '<th scope="col">Title</th>' +
                   '<th scope="col">Runtime</th>' +
                   '<th scope="col">Last</th>' +
                '</tr>' +
         '</thead>'
    var chids = [];

    for (var item of data.model.attributes.links) {
        var myString = item.url ;
        var myRegexp = /.*story\/([0-9]+).*/g;
        var groups = myRegexp.exec(myString);
        var clubhouse_id = groups[1];
        card_info = mymodel.models[0].attributes[clubhouse_id]
        if (! card_info["status"]) {
            card_status_run_html = ""
        }
        // Add section regarding DSS info
        else {
            card_status_run_html = '<span title="Fetched on Monday April 28th, 7 am UTC" class="label label_status_passed">' +  card_info['status'] + '</span>'
        }
        card_status_dss = retrieveDSS([clubhouse_id])
        if (clubhouse_id in card_status_dss) {
            card_status_last_html = card_status_dss[clubhouse_id]["status"]
        }
        html_table += '<tr scope="row">' +
                    '<td><a href="' + item.url + '">CH' + clubhouse_id + '</a></td>' +
                    '<td>' + card_info["title"] + '</td>' +
                    '<td>' + card_status_run_html + '</td>' +
                    '<td>' + card_status_last_html + '</td>' +
                '</div>'
        chids.push(clubhouse_id)
    }
    fetch_info_html = '<button class="clubhouse-plugin-fetch"' +
                               'onclick="retrieveDSS([ ' + chids.join(',') + ']);">' +
                            "Fetch last information" +
                      '</button>';
    if (chids.length == 0) {
        return h3_html + 'No attached clubhouse issues on this test'
    }
    else {
        return h3_html + fetch_info_html + html_table
    }
}

var MyView = Backbone.Marionette.View.extend({
    template: template,

    render: function () {
        this.$el.html(this.template(this.options));
        return this;
    }
})

//allure.api.addTab('mytab', {
//    title: 'My Tab', icon: 'fa fa-trophy',
//    route: 'mytab',
//    onEnter: (function () {
//        return new MyLayout()
//    })
//});


class MyLinkWidget extends Backbone.Marionette.View {


    template(data) {
            return template(data);
    }

    serializeData() {
        return {
            items: this.model.models
        }
    }
    render() {
        this.$el.html(this.template(this.options));
        return this;
    }
}

//allure.api.addWidget('mywidget', 'mywidget', new MyWidget());

//allure.api.addWidget('widgets', 'mywidget', MyWidget);


allure.api.addTestResultBlock(MyLinkWidget, {position: 'before'});