angular
    .module("trNgGridDemoLocalization", ["trNgGrid"])
    .config(["trNgGridConfigurationProvider", function(gridConfiguration: TrNgGrid.GridConfigurationProvider) {
        // default
        gridConfiguration.defaultTranslations({
            localedateFormat: "yyyy-MM-dd"
        });

        // 'en-gb'
        gridConfiguration.translations("en-gb", {
            // more date formats here: http://en.wikipedia.org/wiki/Date_format_by_country
            localeDateFormat: "dd/MM/yyyy"
        });

        // 'de', we'll re-use the default date format defined above 
        gridConfiguration.translations("de", {
            "Born": "Geboren", 
            "Search": "Suche",
            "First Page": "Erste Seite",
            "Page": "Seite",
            "Next Page": "Nächste Seite",
            "Previous Page": "Vorherige Seite",
            "Last Page": "Letzte Seite",
            "Sort": "Sortieren",
            "No items to display": "Nichts darzustellen",
            "displayed": "angezeigt",
            "in total": "insgesamt"
        });

        // 'de-ch' will automatically inherit all the localized texts from 'de', but we'll override the date format
        gridConfiguration.translations("de-ch", {
            localeDateFormat: "dd.MM.yyyy"
        });
    }
]);
  