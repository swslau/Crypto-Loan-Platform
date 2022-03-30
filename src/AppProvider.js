import React, { createContext, useState } from "react";
// import TransactionsContract from "./contracts/Transactions.json";
// import CollateralizedLoanContract from "./contracts/CollateralizedLoan.json";
// import TruffleContract from "truffle-contract";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [username, setUsername] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [transactionsContract, setTransactionsContract] = useState(null);
  const [collateralizedLoanContract, setCollateralizedLoanContract] = useState(null);
  const [collateralizedLoanGateway, setCollateralizedLoanGateway] = useState(null);

  const changeUsername = (username) => {
    setUsername(username);
  }

  const changeUserAddress = (userAddress) => {
    setUserAddress(userAddress);
  }

  const changeTransactionsContract = (transactionsContract) => {
    setTransactionsContract(transactionsContract);
  }

  const changeCollateralizedLoanContract = (collateralizedLoanContract) => {
    setCollateralizedLoanContract(collateralizedLoanContract);
  }

  const changeCollateralizedLoanGateway = (collateralizedLoanGateway) => {
    setCollateralizedLoanGateway(collateralizedLoanGateway);
  }

  const value = {
    username, changeUsername,
    userAddress, changeUserAddress,
    transactionsContract, changeTransactionsContract,
    collateralizedLoanContract, changeCollateralizedLoanContract,
    collateralizedLoanGateway, changeCollateralizedLoanGateway,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;