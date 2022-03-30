let config = {};

config.webProvider = "http://localhost:7545";

config.bankTransferAirnodeHost = "localhost";
config.bankTransferAirnodePort = "8082";

config.getAccountInfoEndpoint = `http://${config.bankTransferAirnodeHost}:${config.bankTransferAirnodePort}/bankTransfer/getAccountInfo`;
config.transferFiatToDEXEndpoint = `http://${config.bankTransferAirnodeHost}:${config.bankTransferAirnodePort}/bankTransfer/transferFiatToDEX`;
config.postLoginEndpoint = `http://${config.bankTransferAirnodeHost}:${config.bankTransferAirnodePort}/bankTransfer/postLogin`;

config.searchLoanAirnodeHost = "localhost";
config.searchLoanAirnodePort = "8082";

config.initiatedLoansByFilterEndpoint = `http://${config.searchLoanAirnodeHost}:${config.searchLoanAirnodePort}/searchLoan/initiatedLoansByFilter`;
config.initiatedLoansByDefaultEndpoint = `http://${config.searchLoanAirnodeHost}:${config.searchLoanAirnodePort}/searchLoan/initiatedLoansByDefault`;

module.exports = config;