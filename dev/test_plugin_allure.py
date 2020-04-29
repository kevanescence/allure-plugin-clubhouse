import allure
import nose

class TestAllurePlugin(object):

    @allure.issue("https://app.clubhouse.io/dataiku/story/46471")
    @allure.issue("https://app.clubhouse.io/dataiku/story/46470")
    @allure.story('My story')
    @allure.feature('My Feature')
    def test_with_an_issue(self):
        pass

    def test_without_issue(self):
        pass
