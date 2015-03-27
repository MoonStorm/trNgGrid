module TrNgGrid {
    export class LoggingService {
        constructor(private gridConfig: IGridConfiguration) {
            
        }

        log(...messageParams: any[]) {
            messageParams.splice(0, 0, Constants.tableDirective, "(" + new Date() + "): ");
            try {
                console.info(messageParams);
            }
            catch (ex) {
                console.log("trNgGrid: Logging failed " + ex);
            }
        }
    }

    gridModule.service(Constants.gridLoggingService, [Constants.gridConfigurationService, LoggingService]);
} 