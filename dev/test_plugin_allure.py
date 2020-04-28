import allure
import nose

class TestAllurePlugin(object):

    @allure.issue("https://cloubhouse.io/stories/364555")
    @allure.issue("https://cloubhouse.io/stories/36456")
    def test_with_an_issue(self):
        pass

    def test_without_issue(self):
        pass
