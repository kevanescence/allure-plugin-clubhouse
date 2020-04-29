

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

function retrieveDSS(test_id, ids) {
    last_status =     {
                       "47133": {
                           "status": "Ready for review",
                           "title": "Refactor DynamoDB tests to make them more easily runnable"
                       }
                   }
    var settings = {
      "url": "http://dku17.dataiku.com:16110/public/api/v1/clubhouse-status-api/ch-status-ep/lookup",
      "method": "POST",
      "timeout": 0,
      "headers": {
        "Content-Type": "application/json"
      },
      "data": ""
    };

    table_of_test = window.document.querySelectorAll("[data-clubhouse-test-uid=\"" + test_id + "\"]")[0];

    ids.forEach(function(chid, index) {
        settings["data"] = JSON.stringify({"data":{"id":chid}})
        Backbone.ajax(settings).done(function(data, error) {
            last_status=data["results"][0]["data"]["status_name"]
            if (last_status != null) {
               status_cell = table_of_test.querySelectorAll("[data-clubhouse-last-status-card-id=\"" + chid + '\"]')[0];
               status_cell.innerText = last_status;
            }
        });

    });



    // Call the api node on the given ids
    return
}
const template = function (data) {
    h3_html = '<div class="pane__section"><h3 class="pane__section-title">Related Clubhouse issues details</h3>'
    console.log(data.model.attributes.uid)

    html_table = '<table data-clubhouse-test-uid="' + data.model.attributes.uid + '" class="tb-table">' +
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
            time_info = card_info["generatedOn"]
            badge_classes = "label";
            console.log(card_info["status"])
            if (card_info['status'] == 'Complete') {
                badge_classes += " label_status_passed"
            }
            card_status_run_html = '<span title="Generated on ' + time_info + '" class="' + badge_classes + '">' +
                                        card_info['status'] +
                                   '</span>'
        }

        card_status_last_html = "Not yet fetched"

        html_table += '<tr scope="row">' +
                    '<td><a href="' + item.url + '">CH' + clubhouse_id + '</a></td>' +
                    '<td>' + card_info["title"] + '</td>' +
                    '<td>' + card_status_run_html + '</td>' +
                    '<td data-clubhouse-last-status-card-id="' + clubhouse_id + '">' + card_status_last_html + '</td>' +
                '</div>'
        chids.push(clubhouse_id)
    }
    fetch_info_html = '<button class="clubhouse-plugin-fetch tb-btn tb-btn-primary"' +
                               'onclick="retrieveDSS(\''+ data.model.attributes.uid + '\',' + '[ ' + chids.join(',') + ']);">' +
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