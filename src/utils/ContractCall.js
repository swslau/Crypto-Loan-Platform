export async function initiateLoan(instance, currentUser, lender, loanAmount, collateralAmount, loanTerm, apr, repaymentSchedule, monthlyRepayment, remainingPaymentCount, initialLTV, marginLTV, liquidationLTV) {
    return new Promise((resolve, reject) => {
        instance.initiateLoan(lender, loanAmount, collateralAmount, loanTerm, apr, repaymentSchedule, monthlyRepayment, remainingPaymentCount, initialLTV, marginLTV, liquidationLTV, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "initiateLoan: Error occurred on the side of CollateralizedLoanGateway";
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function requestLoan(instance, currentUser, requester, loanId) {
    return new Promise((resolve, reject) => {
        instance.requestLoan(requester, loanId, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "requestLoan: Error occurred on the side of CollateralizedLoanGateway";
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function cancelLoan(instance, currentUser, lender, loanId) {
    return new Promise((resolve, reject) => {
        instance.cancelLoan(lender, loanId, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "cancelLoan: Error occurred on the side of CollateralizedLoanGateway";
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function disburseLoan(instance, currentUser, lender, loanId, nextRepaymentDeadline) {
    console.log(lender, loanId, nextRepaymentDeadline);
    return new Promise((resolve, reject) => {
        instance.disburseLoan(lender, loanId, nextRepaymentDeadline, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "disburseLoan: Error occurred on the side of CollateralizedLoanGateway";
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function makeRepaymentByBorrower(instance, currentUser, borrower, loanId, payValue, nextRepaymentDeadline) {
    return new Promise((resolve, reject) => {
        instance.makeRepaymentByBorrower(borrower, loanId, payValue, nextRepaymentDeadline, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function getLoanDetails(instance, currentUser, loanId) {
    return new Promise((resolve, reject) => {
        instance.methods['getLoanDetails(uint256)'].call(loanId, {from: currentUser}, function (err, res) {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "getLoanDetails: Error occurred on the side of CollateralizedLoanGateway";
            }
        });
    });
}

export async function getLenderLoans(instance, currentUser, lender) {
    return new Promise((resolve, reject) => {
        instance.methods['getLenderLoans(address)'].call(lender, {from: currentUser}, function (err, res) {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "getLenderLoans: Error occurred on the side of CollateralizedLoanGateway";
            }
        });
    });
}

export async function getBorrowerLoans(instance, currentUser, borrower) {
    return new Promise((resolve, reject) => {
        instance.methods['getBorrowerLoans(address)'].call(borrower, {from: currentUser}, function (err, res) {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "getBorrowerLoans: Error occurred on the side of CollateralizedLoanGateway";
            }
        });
    });
}

export async function storeEther(instance, currentUser, address, wei) {
    return new Promise((resolve, reject) => {
        instance.storeEther(address, wei, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "storeEther: Error occurred on the side of CollateralizedLoanGateway";
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function storeFiatMoney(instance, currentUser, address, value) {
    return new Promise((resolve, reject) => {
        instance.storeFiatMoney(address, value, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "storeFiatMoney: Error occurred on the side of CollateralizedLoanGateway";
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function withdrawEther(instance, currentUser, address, value) {
    return new Promise((resolve, reject) => {
        instance.withdrawEther(address, value, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "withdrawEther: Error occurred on the side of CollateralizedLoanGateway";
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function withdrawFiatMoney(instance, currentUser, address, value) {
    return new Promise((resolve, reject) => {
        instance.withdrawFiatMoney(address, value, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "withdrawFiatMoney: Error occurred on the side of CollateralizedLoanGateway";
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function checkEtherBalanceAmount(instance, currentUser, address) {
    return new Promise((resolve, reject) => {
        instance.methods['checkEtherBalanceAmount(address)'].call(address, {from: currentUser}, function (err, res) {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "checkEtherBalanceAmount: Error occurred on the side of CollateralizedLoanGateway";
            }
        });
    });
}

export async function checkFiatBalanceAmount(instance, currentUser, address) {
    return new Promise((resolve, reject) => {
        instance.methods['checkFiatBalanceAmount(address)'].call(address, {from: currentUser}, function (err, res) {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "checkFiatBalanceAmount: Error occurred on the side of CollateralizedLoanGateway";
            }
        });
    });
}

export async function transferFiatMoneyBackToBank(instance, currentUser, requester, bankAccountNo, value) {
    return new Promise((resolve, reject) => {
        instance.transferFiatMoneyBackToBank(requester, bankAccountNo, value, {from: currentUser}).then((res, err) => {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "transferFiatMoneyBackToBank: Error occurred on the side of CollateralizedLoanGateway";
            }
        }).catch((err) => {
            reject(err);
        });
    });
}

export async function add1(instance, currentUser) {
    return new Promise((resolve, reject) => {
        instance.methods['add1()'].call({from: currentUser}, function (err, res) {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "add1: Error occurred on the side of CollateralizedLoanGateway";
            }
        });
    });
}

export async function add2(instance, currentUser) {
    return new Promise((resolve, reject) => {
        instance.methods['add2()'].call({from: currentUser}, function (err, res) {
            if(!err) {
                console.log(res);
                resolve(res);
            } else {
                console.log(err);
                throw "add2: Error occurred on the side of CollateralizedLoanGateway";
            }
        });
    });
}