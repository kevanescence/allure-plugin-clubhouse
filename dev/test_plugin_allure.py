import allure
import nose

class TestAllurePlugin(object):

    @allure.issue("https://app.clubhouse.io/dataiku/story/28092")
    @allure.issue("https://app.clubhouse.io/dataiku/story/46470")
    @allure.story('My story')
    @allure.feature('My Feature')
    def test_with_an_issue(self):
        pass

    def test_without_issue(self):
        pass

    def test_that_fail_without_issue(self):
        assert False

    @allure.issue("https://app.clubhouse.io/dataiku/story/47133")
    def test_that_fail_with_issue(self):
        assert False