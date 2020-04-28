

var MyTabModel = Backbone.Collection.extend({
    url: 'data/clubhouse_status.json'
})

var mymodel = new MyTabModel();
mymodel.fetch();


console.log("blallbl")
console.log(mymodel);
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

const template = function (data) {
    html = '<h3 class="pane__section-title">Clubhouse issues</h3><table class="table">';
    for (var item of data.model.attributes.links) {
        var myString = item.url ;
        var myRegexp = /.*story\/([0-9]+).*/g;
        var groups = myRegexp.exec(myString);
        var clubhouse_id = groups[1];
        card_info = mymodel.models[0].attributes[clubhouse_id]
        if (! card_info["status"]) {
            card_status_html = ""
        }
        else {
            card_status_html = '<span class="label label_status_passed">' +  card_info['status'] + '</span>'
        }
        html += '<tr scope="row">' +
                    '<td><a href="' + item.url + '">CH' + clubhouse_id + '</a></td>' +
                    '<td>' + card_info["title"] + '</td>' +
                    '<td>' + card_status_html + '</td>' +
                '</div>'
    }
    return html + '</table>';
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
        console.log(mymodel);
        console.log(this.model);
        this.$el.html(this.template(this.options));
        return this;
    }
}

//allure.api.addWidget('mywidget', 'mywidget', new MyWidget());

//allure.api.addWidget('widgets', 'mywidget', MyWidget);


allure.api.addTestResultBlock(MyLinkWidget, {position: 'before'});