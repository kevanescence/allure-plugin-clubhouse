

var MyTabModel = Backbone.Collection.extend({
    url: 'data/myplugindata.json'
})

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
    html = '<h3 class="pane__section-title">Clubhouse issues</h3>';
    for (var item of data.model.attributes.links) {
        console.log(item);

        html += '<a href="' + item.url + '">' + item.name + '</a>';
    }
    return html;
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

    initialize() {
        console.log("initialization");
        this.model = new MyTabModel();
        this.model.fetch();
        console.log(this.model);
    }

    template(data) {
            console.log("template of Link widget")
            console.log(data);
            return template(data);
    }

    serializeData() {
        console.log("Serizliazed")
        console.log(this.model.models);
        return {
            items: this.model.models
        }
    }
    render() {
        console.log("toto");
        this.$el.html(this.template(this.options));
        return this;
    }
}

//allure.api.addWidget('mywidget', 'mywidget', new MyWidget());

//allure.api.addWidget('widgets', 'mywidget', MyWidget);


allure.api.addTestResultBlock(MyLinkWidget, {position: 'before'});