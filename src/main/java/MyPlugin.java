import io.qameta.allure.Aggregator;
import io.qameta.allure.Widget;
import io.qameta.allure.context.JacksonContext;
import io.qameta.allure.core.Configuration;
import io.qameta.allure.core.LaunchResults;
import io.qameta.allure.entity.Status;
import io.qameta.allure.entity.TestResult;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

public class MyPlugin implements Aggregator, Widget {

    @Override
    public void aggregate(final Configuration configuration,
                          final List<LaunchResults> launches,
                          final Path outputDirectory) throws IOException {
        final JacksonContext jacksonContext = configuration
                .requireContext(JacksonContext.class);
        final Path dataFolder = Files.createDirectories(outputDirectory.resolve("data"));
        final Path dataFile = dataFolder.resolve("myplugindata.json");
        final Stream<TestResult> resultsStream = launches.stream()
                .flatMap(launch -> launch.getAllResults().stream());
        try (OutputStream os = Files.newOutputStream(dataFile)) {
            jacksonContext.getValue().writeValue(os, extractData(resultsStream));
        }
    }

    private Collection<Map> extractData(final Stream<TestResult> testResults) {
        //extraction logic

        ArrayList<Map> am = new ArrayList<Map>();

        testResults.forEach(t -> {
            Map m = new HashMap<String, String>();
            m.put("name", t.getFullName());
            m.put("sounds", t.getLinks().toString());
            am.add(m);
        });

        return am;
    }

    @Override
    public Object getData(Configuration configuration, List<LaunchResults> launches) {
        Stream<TestResult> filteredResults = launches.stream().flatMap(launch -> launch.getAllResults().stream())
                .filter(result -> result.getStatus().equals(Status.FAILED));
        return extractData(filteredResults);
    }

    @Override
    public String getName() {
        return "mywidget";
    }

}