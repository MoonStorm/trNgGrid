var TrNgGrid;
(function (TrNgGrid) {
    var LoggingService = (function () {
        function LoggingService(gridConfig) {
            this.gridConfig = gridConfig;
        }
        LoggingService.prototype.log = function () {
            var messageParams = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                messageParams[_i - 0] = arguments[_i];
            }
            messageParams.splice(0, 0, TrNgGrid.Constants.tableDirective, "(" + new Date() + "): ");
            try {
                console.info(messageParams);
            }
            catch (ex) {
                console.log("trNgGrid: Logging failed " + ex);
            }
        };
        return LoggingService;
    })();
    TrNgGrid.LoggingService = LoggingService;
    TrNgGrid.gridModule.service(TrNgGrid.Constants.gridLoggingService, [TrNgGrid.Constants.gridConfigurationService, LoggingService]);
})(TrNgGrid || (TrNgGrid = {}));
