var TrNgGrid;
(function (TrNgGrid) {
    TrNgGrid.gridModule.filter(TrNgGrid.Constants.sortFilter, [
        "$filter",
        "$parse",
        function ($filter, $parse) {
            return function (input, gridOptions, gridColumnOptions) {
                if (!gridOptions.orderBy || !gridColumnOptions) {
                    return input;
                }
                var sortedInput = $filter("orderBy")(input, function (item) {
                    var fieldValue = undefined;
                    try {
                        fieldValue = $parse("item.trNgGridDataItem." + gridOptions.orderBy)({ item: item });
                    }
                    catch (ex) {
                    }
                    if (fieldValue === undefined) {
                        try {
                            fieldValue = $parse("item." + gridColumnOptions.displayItemFieldName)({ item: item });
                        }
                        catch (ex) {
                        }
                    }
                    return fieldValue;
                }, gridOptions.orderByReverse);
                return sortedInput;
            };
        }
    ]).filter(TrNgGrid.Constants.dataPagingFilter, function () {
        return function (input, gridOptions) {
            if (input)
                gridOptions.totalItems = input.length;
            if (!gridOptions.pageItems || !input || input.length === 0)
                return input;
            if (!gridOptions.currentPage) {
                gridOptions.currentPage = 0;
            }
            var startIndex = gridOptions.currentPage * gridOptions.pageItems;
            if (startIndex >= input.length) {
                gridOptions.currentPage = 0;
                startIndex = 0;
            }
            var endIndex = gridOptions.currentPage * gridOptions.pageItems + gridOptions.pageItems;
            return input.slice(startIndex, endIndex);
        };
    }).filter(TrNgGrid.Constants.translateFilter, [
        "$filter",
        "$injector",
        TrNgGrid.Constants.gridConfigurationService,
        function ($filter, $injector, gridConfiguration) {
            var translateFilterAvailable = true;
            function getTranslation(languageId, retrieveTranslationFct) {
                var foundTranslation = null;
                var languageIdParts = languageId.split(/[-_]/);
                for (var languageIdPartIndex = languageIdParts.length; (languageIdPartIndex >= 0) && (!foundTranslation); languageIdPartIndex--) {
                    var subLanguageId = languageIdPartIndex === 0 ? TrNgGrid.Constants.defaultTranslationLocale : languageIdParts.slice(0, languageIdPartIndex).join("-");
                    var langTranslations = gridConfiguration.translations[subLanguageId];
                    if (langTranslations) {
                        foundTranslation = retrieveTranslationFct(langTranslations);
                    }
                }
                return foundTranslation;
            }
            ;
            return function (input, languageId) {
                if (!input) {
                    return input;
                }
                if (!languageId) {
                    languageId = TrNgGrid.Constants.defaultTranslationLocale;
                }
                var translatedText;
                if (input instanceof Date) {
                    var dateFormat = getTranslation(languageId, function (localeTranslations) { return localeTranslations.localeDateFormat; });
                    translatedText = $filter("date")(input, dateFormat);
                    return translatedText;
                }
                translatedText = getTranslation(languageId, function (localeTranslations) { return localeTranslations[input]; });
                if (!translatedText && $injector.has("translateFilter")) {
                    try {
                        translatedText = $filter("translate")(input);
                    }
                    catch (ex) {
                    }
                }
                if (!translatedText) {
                    translatedText = input;
                }
                return translatedText;
            };
        }
    ]);
})(TrNgGrid || (TrNgGrid = {}));
