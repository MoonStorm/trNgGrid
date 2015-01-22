angular.module("trNgGridDemoLocalization", ["trNgGrid"]).config(function () {
    TrNgGrid.debugMode = true;
    var defaultTranslation = {};
    var enTranslation = angular.extend({}, defaultTranslation);
    enTranslation[TrNgGrid.translationDateFormat] = "yyyy-MM-dd";
    TrNgGrid.translations["en"] = enTranslation;
    var enGbTranslation = angular.extend({}, enTranslation);
    // more date formats here: http://en.wikipedia.org/wiki/Date_format_by_country
    enGbTranslation[TrNgGrid.translationDateFormat] = "dd/MM/yyyy";
    TrNgGrid.translations["en-gb"] = enGbTranslation;
    var deTranslation = angular.extend({}, enTranslation, {
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
    TrNgGrid.translations["de"] = deTranslation;
    var deChTranslation = angular.extend({}, deTranslation);
    deChTranslation[TrNgGrid.translationDateFormat] = "dd.MM.yyyy";
    TrNgGrid.translations["de-ch"] = deChTranslation;
});
//# sourceMappingURL=translations.js.map