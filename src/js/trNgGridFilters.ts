module TrNgGrid {
    angular.module(tableDirective, [])
        .filter(sortFilter, [
            "$filter", "$parse", ($filter: ng.IFilterService, $parse: ng.IParseService) => {
                return (input: Array<any>, gridOptions: IGridOptions, gridColumnOptions: IGridColumnsOptions) => {

                    if (!gridOptions.orderBy || !gridColumnOptions) {
                        // not ready to sort, return the input array
                        return input;
                    }

                    // we'll need the column options
                    var columnOptions: IGridColumnOptions = gridColumnOptions[gridOptions.orderBy];

                    if (!columnOptions) {
                        // unable to find any info about the selected field
                        return input;
                    }

                    var sortedInput = $filter("orderBy")(
                        input,
                        (item: any) => {
                            var fieldValue: any = undefined;
                            try {
                                // get the value associated with the original grid item
                                fieldValue = $parse("item.trNgGridDataItem." + gridOptions.orderBy)({ item: item });
                            }
                            catch (ex) {
                            }
                            if (fieldValue === undefined) {
                                try {
                                    // next try the field on the display item, in case of computed fields
                                    fieldValue = $parse("item." + columnOptions.displayFieldName)({ item: item });
                                }
                                catch (ex) {
                                }
                            }

                            return fieldValue;
                        },
                        gridOptions.orderByReverse);

                    return sortedInput;
                }
            }
        ])
        .filter(dataPagingFilter, () => {
            // when server-side logic is enabled, this directive should not be used!
            return (input: Array<any>, gridOptions: IGridOptions) => {
                //currentPage?:number, pageItems?:number
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
        })
        .filter(translateFilter, [
            "$filter", gridConfigurationService, ($filter: ng.IFilterService, gridConfiguration: IGridConfiguration) => {
                var translateFilterAvailable = true;

                function getTranslation<T>(languageId: string, retrieveTranslationFct: (getLocaleTranslation: IGridLocaleTranslations) => T) {
                    var foundTranslation: T = null;

                    var languageIdParts = languageId.split(/[-_]/);
                    for (var languageIdPartIndex = languageIdParts.length; (languageIdPartIndex >= 0) && (!foundTranslation); languageIdPartIndex--) {
                        var subLanguageId = languageIdPartIndex === 0 ? defaultTranslationLocale : languageIdParts.slice(0, languageIdPartIndex).join("-");
                        var langTranslations = gridConfiguration.translations[subLanguageId];
                        if (langTranslations) {
                            foundTranslation = retrieveTranslationFct(langTranslations);
                        }
                    }

                    return foundTranslation;
                };

                return (input: any, languageId: string) => {
                    var translatedText: string;

                    // dates require special attention
                    if (input instanceof Date) {
                        // we're dealing with a date object, see if we have a localized format for it
                        var dateFormat = getTranslation(languageId, (localeTranslations: IGridLocaleTranslations) => localeTranslations.localeDateFormat);
                        // call the date filter
                        translatedText = $filter("date")(input, dateFormat);
                        return translatedText;
                    }

                    translatedText = getTranslation(languageId, (localeTranslations: IGridLocaleTranslations) => localeTranslations[input]);

                    if (translateFilterAvailable && !translatedText) {
                        // check for a filter directive
                        try {

                            debugger; 

                            var externalTranslationFilter = $filter("translate");
                            if (externalTranslationFilter) {
                                translatedText = externalTranslationFilter(input);
                            }
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
} 