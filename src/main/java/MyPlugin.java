import io.qameta.allure.Aggregator;
import io.qameta.allure.Widget;
import io.qameta.allure.context.JacksonContext;
import io.qameta.allure.core.Configuration;
import io.qameta.allure.core.LaunchResults;
import io.qameta.allure.entity.Link;
import io.qameta.allure.entity.Status;
import io.qameta.allure.entity.TestResult;
import io.restassured.path.json.JsonPath;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static io.restassured.RestAssured.given;

public class MyPlugin implements Aggregator, Widget {

    @Override
    public void aggregate(final Configuration configuration,
                          final List<LaunchResults> launches,
                          final Path outputDirectory) throws IOException {
        final JacksonContext jacksonContext = configuration
                .requireContext(JacksonContext.class);
        final Path dataFolder = Files.createDirectories(outputDirectory.resolve("data"));
        final Path dataFile = dataFolder.resolve("clubhouse_status.json");
        System.out.println(dataFile);
        final Stream<TestResult> resultsStream = launches.stream()
                .flatMap(launch -> launch.getAllResults().stream());
        try (OutputStream os = Files.newOutputStream(dataFile)) {
            jacksonContext.getValue().writeValue(os, extractData(resultsStream));
        }
    }

    private Map extractData(final Stream<TestResult> testResults) {
        //extraction logic

        Map<String, Map<String, String>> m = new HashMap<>();
        testResults.forEach(t -> {
            if(!t.getLinks().isEmpty()){
                for (Link l : t.getLinks()) {
                    Pattern p = Pattern.compile("(?<=/story/)\\d+");
                    Matcher id = p.matcher(l.getName());
                    while (id.find()) {
                        String s = id.group();
                        m.put(s, getClubhouseDetail(s, "Replace by your token here"));
                    }
                }
            }
        });
        return m;
    }

    /**
     * TODO: Handle error case: card not find, page not find.Œ
     */
    private Map getClubhouseDetail(String storyId, String token) {
        Map<String, String> details = new HashMap<>();
        String baseURI =  "https://app.clubhouse.io/backend/api/private/stories/";
        JsonPath jpCreate =
                given()
                        .param("token", token)
                        .when().get(baseURI + storyId).then().statusCode(200).extract().jsonPath();
        String title = jpCreate.get("name");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String generatedTime = formatter.format(LocalDateTime.now());
        Boolean completed = jpCreate.get("completed");
        String status;
        if(completed) {
            status = "Complete";
        } else {
            status = "WIP";
        }
        details.put("title", title);
        details.put("status", status);
        details.put("generatedOn", generatedTime);
        return details;
    }

    @Override
    public Object getData(Configuration configuration, List<LaunchResults> launches) {
        Stream<TestResult> filteredResults = launches.stream().flatMap(launch -> launch.getAllResults().stream())
                .filter(result -> result.getStatus().equals(Status.PASSED));
        System.out.println(extractData(filteredResults));
        return extractData(filteredResults);
    }

    @Override
    public String getName() {
        return "mywidget";
    }

}
