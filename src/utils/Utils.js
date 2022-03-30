import Web3 from 'web3';
const web3 = new Web3(window.ethereum);

export const getAvailableCoin = () => [
    'ETH'
];

export const getAvailableLoanTerm = () => [
    7, 14, 30, 60, 120, 180
];

export const getAvailableRangeOption = () => [
    {key: "Less than", value: "LESS_THAN"}
    , {key: "Less than or equal to", value: "LESS_THAN_OR_EQUAL_TO"}
    , {key: "Equal to", value: "EQAUL_TO"}
    , {key: "Greater than", value: "GREATER_THAN"}
    , {key: "Greater than or equal to", value: "GREATER_THAN_OR_EQAUL_TO"}
    , {key: "Not equal to", value: "NOT_EQUAL_TO"}
    , {key: "Between", value: "BETWEEN"}
];

export const getRepaymentSchedule = (loanTerm) => {
    let repaymentSchedule = null;
    switch(parseInt(loanTerm)) {
      case 7: repaymentSchedule = 7; break; 
      case 14: repaymentSchedule = 7; break; 
      case 30: repaymentSchedule = 15; break; 
      case 60: repaymentSchedule = 15; break; 
      case 120: repaymentSchedule = 15; break; 
      case 180: repaymentSchedule = 15; break; 
    }
    return repaymentSchedule;
}

export const getRemainingPaymentCount = (loanTerm) => {
    let remainingPaymentCount = null;
    switch(loanTerm) {
      case 7: remainingPaymentCount = 1; break; 
      case 14: remainingPaymentCount = 2; break; 
      case 30: remainingPaymentCount = 2; break; 
      case 60: remainingPaymentCount = 4; break; 
      case 120: remainingPaymentCount = 8; break; 
      case 180: remainingPaymentCount = 12; break; 
    }
    return remainingPaymentCount;
}

export function displayAddress(address, defaultText) {
    return address != "0x0000000000000000000000000000000000000000" && web3.utils.isAddress(address) ? address : defaultText;
}

export function displayEtherAmount(etherAmount, unit = "gas") {
    if(unit === "gas")
        return web3.utils.fromWei(etherAmount.toString(), "ether") + " ETH";
    else
        return etherAmount + " ETH";
}

export function displayFiatAmount(fiatAmount) {
    return "USD " + parseFloat(fiatAmount).toLocaleString("en");
}

export function displayLoanStatus(rawLoanStatus) {
    let loanStatus = null;
    switch(parseInt(rawLoanStatus)) {
        case 0: loanStatus = "Loan Initiated"; break;
        case 1: loanStatus = "Loan Requested"; break;
        case 2: loanStatus = "Loan Cancelled"; break;
        case 3: loanStatus = "Loan Repaying"; break;
        case 4: loanStatus = "Loan Defaulted"; break;
        case 5: loanStatus = "Loan Fully Repaid"; break;
    }
    return loanStatus;
}

export function displayAPR(rawAPR, multiplied=true) {
    return multiplied ? (rawAPR / 10) + "%" : rawAPR + "%";
}

export function displayLTV(rawLTV) {
    return rawLTV + "%";
}

export function displayLoanTerm(rawLoanTerm) {
    return rawLoanTerm + " days";
}

export function displayRepaymentSchedule(rawRepaymentSchedule) {
    let repaymentSchedule = null;
    switch(parseInt(rawRepaymentSchedule)) {
        case 7: repaymentSchedule = "Weekly"; break;
        case 15: repaymentSchedule = "Half-monthly"; break;
        case 30: repaymentSchedule = "Monthly"; break;
    }
    return repaymentSchedule;
}

export function calculateRepaymentPerInterval(loanAmount, repaymentSchedule, remainingPaymentCount, apr) {
    return Math.ceil(loanAmount / remainingPaymentCount + loanAmount * (apr / (12 * 100)) * (repaymentSchedule / 30));
}

export function calculateTotalRepaymentAmount(monthlyRepaymentAmount, loanTerm, repaymentSchedule) {
    return monthlyRepaymentAmount * loanTerm / repaymentSchedule;
}

export function calculateTotalInterestAmount(monthlyRepaymentAmount, loanTerm, repaymentSchedule, loanAmount) {
    return calculateTotalRepaymentAmount(monthlyRepaymentAmount, loanTerm, repaymentSchedule) - loanAmount;
}

export function calculateNextRepaymentDeadline(nextRepaymentDeadline, repaymentSchedule) {
    if(nextRepaymentDeadline === null) {
        var today = new Date();
        var numberOfDaysToAdd = parseInt(repaymentSchedule);
        var nextDeadline = new Date(today.setDate(today.getDate() + numberOfDaysToAdd)).setHours(23,59,59,999);
        return Math.floor(nextDeadline / 1000);
    } else {
        var nextRepaymentDeadlineTime = new Date(nextRepaymentDeadline * 1000);
        var numberOfDaysToAdd = parseInt(repaymentSchedule);
        var nextDeadline = new Date(nextRepaymentDeadlineTime.setDate(nextRepaymentDeadlineTime.getDate() + numberOfDaysToAdd)).setHours(23,59,59,999);
        return Math.floor(nextDeadline / 1000);
    }
}

export function timeConverter(UNIX_timestamp) {
    if(UNIX_timestamp === "0" || UNIX_timestamp === 0) return "N/A";
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours().toString().padStart(2, '0');
    var min = a.getMinutes().toString().padStart(2, '0');
    var sec = a.getSeconds().toString().padStart(2, '0');
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
}

export function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}