import React, { useEffect, useState } from 'react';
import { getContracts, getWeb3 } from '../uitls';
import App from '../App';

const LoadingContainer = () => {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [contracts, setContracts] = useState(undefined);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      console.log(web3);
      const accounts = await web3.eth.getAccounts();
      console.log(accounts);
      const contracts = await getContracts(web3);
      console.log(contracts);
      setWeb3(web3);
      setContracts(contracts);
      setAccounts(accounts);
      setLoading(false);
    };
    init();
  }, []);

  return (
    <div>
      {loading ? (
        <div>...Loading</div>
      ) : (
        <App web3={web3} contracts={contracts} accounts={accounts}></App>
      )}
    </div>
  );
};

export default LoadingContainer;
