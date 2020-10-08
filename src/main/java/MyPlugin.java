import io.qameta.allure.Aggregator;
import io.qameta.allure.Widget;
import io.qameta.allure.context.JacksonContext;
import io.qameta.allure.core.Configuration;
import io.qameta.allure.core.LaunchResults;
import io.qameta.allure.entity.Link;
import io.qameta.allure.entity.Status;
import io.qameta.allure.entity.TestResult;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
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

    /**
     * Information required for sending clubhouse request. Please initiate or update when needed.
     */
    private static class ClubhouseData{
        private static final String searchURL = "https://api.clubhouse.io/api/v3/search/stories";
        private static final String baseURI  = "https://api.clubhouse.io";
        private static final String token = System.getenv("TOKEN");
    }

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

    private Map<String, Map<String, Object>> extractData(final Stream<TestResult> testResults) {
        //extraction logic
        Map<String, Map<String, Object>> m = new HashMap<>();
        List<Map<String, Object>> data = getAutotestedClubhouseCards();
        testResults.forEach(t -> {
            if(!t.getLinks().isEmpty()){
                for (Link l : t.getLinks()) {
                    Pattern p = Pattern.compile("(?<=/story/)\\d+");
                    Matcher id = p.matcher(l.getName());
                    while (id.find()) {
                        String s = id.group();
                        m.put(s, getClubhouseDetail(s, data));
                    }
                }
            }
        });
        return m;
    }

    private List<Map<String, Object>> getAutotestedClubhouseCards() {
        String token = ClubhouseData.token;
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", "label:'tests:autotested'");
        requestBody.put("page_size", 25);
        Response res = given()
                .param("token", token)
                .contentType("application/json")
                .body(requestBody)
                .when().get(ClubhouseData.searchURL);
        JsonPath resJson = res.jsonPath();
        List<Map<String, Object>> cardsData = resJson.get("data");
        int t = resJson.get("total");
        if(t >= 25) {
            double total = t;
            int pages = (int)Math.ceil(total/25.0);
            List<Map<String, Object>> data;
            String next = resJson.get("next");
            for(int i = 0; i < (pages-1); i++) {
                String path = ClubhouseData.baseURI + next + "&token=" + token;
                String p = null;
                try {
                    p = java.net.URLDecoder.decode(path, StandardCharsets.UTF_8.name());
                } catch (UnsupportedEncodingException e) {
                    // not going to happen - value came from JDK's own StandardCharsets
                }
                res = given()
                        .when().get(p);
                if(res.getStatusCode() == 200) {
                    resJson = res.jsonPath();
                    next = resJson.get("next");
                    data = resJson.get("data");
                    cardsData.addAll(data);
                } else {
                    System.out.println("Error occurs while requesting: " + res.getBody().prettyPrint());
                }
            }
        }
        return cardsData;
    }

    private Map<String, Object> getClubhouseDetail(String storyId, List<Map<String, Object>> cardsData) {
        Map<String, Object> details = new HashMap<>();
        for (Map<String, Object> card : cardsData) {
            Object url = card.get("app_url");
            Pattern p = Pattern.compile("(?<=/story/)\\d+");
            Matcher id = p.matcher((String)url);
            while (id.find()) {
                String s = id.group();
                if(s.equals(storyId)) {
                    String title = (String)card.get("name");
                    Boolean completed = (Boolean) card.get("completed");
                    String status = (completed == null) ? "Not found" : ((completed == true) ? "Completed" : "WIP");
                    details.put("title", title);
                    details.put("status", status);
                }
            }
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String generatedTime = formatter.format(LocalDateTime.now());
        details.put("generatedOn", generatedTime);
        return details;
    }

    //@Override
    public Object getData(Configuration configuration, List<LaunchResults> launches) {
        Stream<TestResult> filteredResults = launches.stream().flatMap(launch -> launch.getAllResults().stream())
                .filter(result -> result.getStatus().equals(Status.PASSED));
        return extractData(filteredResults);
    }

    //@Override
    public String getName() {
        return "mywidget";
    }
}
