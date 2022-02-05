import React, { useEffect, useState, Fragment } from 'react';
import Header from './Components/Header';
import Wallet from './Components/Wallet';
import NewOrder from './Components/NewOrder';
import AllOrders from './Components/AllOrders';
import MyOrders from './Components/MyOrders';
import AllTrades from './Components/AllTrades';
import './index.css';

const SIDE = {
  BUY: 0,
  SELL: 1,
};

function App({ web3, accounts, contracts }) {
  //internal state Management
  const [tokens, setTokens] = useState([]);
  const [user, setUser] = useState({
    accounts: [],
    balances: {
      tokenDex: 0,
      tokenWallet: 0,
    },
    selectedToken: undefined,
  });

  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState({
    buy: [],
    sell: [],
  });

  const [trades, setTrades] = useState([]);
  const [listener, setListener] = useState(undefined);

  //Traders func
  const listenToTrades = token => {
    const tradeIds = new Set();
    setTrades([]);
    const listener = contracts.dex.events
      .NewTrade({
        filter: { ticker: web3.utils.fromAscii(token.ticker) },
        fromBlock: 0,
      })
      .on('data', newTrade => {
        if (tradeIds.has(newTrade.returnValues.tradeId)) return;
        tradeIds.add(newTrade.returnValues.tradeId);
        setTrades(trades => [...trades, newTrade.returnValues]);
      });
    setListener(listener);
  };

  const getBalances = async (account, token) => {
    const tokenDex = await contracts.dex.methods
      .traderBalances(account, web3.utils.fromAscii(token.ticker))
      .call();
    const tokenWallet = await contracts[token.ticker].methods
      .balanceOf(account)
      .call();
    return { tokenDex, tokenWallet };
  };

  const getOrders = async token => {
    const orders = await Promise.all([
      contracts.dex.methods
        .getOrders(web3.utils.fromAscii(token.ticker), SIDE.BUY)
        .call(),
      contracts.dex.methods
        .getOrders(web3.utils.fromAscii(token.ticker), SIDE.SELL)
        .call(),
    ]);
    return { buy: orders[0], sell: orders[1] };
  };

  const selectToken = token => {
    setUser({ ...user, selectedToken: token });
  };

  //Withdraw and DepositeFuncs
  const deposit = async amount => {
    await contracts[user.selectedToken.ticker].methods
      .approve(contracts.dex.options.address, amount)
      .send({ from: user.accounts[0] });

    await contracts.dex.methods
      .deposit(amount, web3.utils.fromAscii(user.selectedToken.ticker))
      .send({ from: user.accounts[0] });

    const balances = await getBalances(user.accounts[0], user.selectedToken);
    setUser(user => ({ ...user, balances }));
  };

  const withdraw = async amount => {
    await contracts.dex.methods
      .withdraw(amount, web3.utils.fromAscii(user.selectedToken.ticker))
      .send({ from: user.accounts[0] });

    const balances = await getBalances(user.accounts[0], user.selectedToken);
    setUser(user => ({ ...user, balances }));
  };

  // Market and Limit Orders
  const createMarketOrder = async (amount, side) => {
    await contracts.dex.methods
      .createMarketOrder(
        web3.utils.fromAscii(user.selectedToken.ticker),
        amount,
        side
      )
      .send({ from: user.accounts[0] });
    const orders = await getOrders(user.selectedToken);
    setOrders(orders);
  };

  const createLimitOrder = async (amount, price, side) => {
    await contracts.dex.methods
      .createLimitOrder(
        web3.utils.fromAscii(user.selectedToken.ticker),
        amount,
        price,
        side
      )
      .send({ from: user.accounts[0] });
    const orders = await getOrders(user.selectedToken);
    setOrders(orders);
  };

  useEffect(() => {
    const init = async () => {
      const rawTokens = await contracts.dex.methods.getTokens().call();
      const tokens = rawTokens.map(token => ({
        ...token,
        ticker: web3.utils.hexToUtf8(token.ticker),
      }));
      const balances = await getBalances(accounts[0], tokens[0]);
      const orders = await getOrders(tokens[0]);

      listenToTrades(tokens[0]);
      setTokens(tokens);
      setUser({ accounts, balances, selectedToken: tokens[0] });
      setOrders(orders);
      setLoading(false);
    };
    init();
  }, []);

  //call When user change the selected token
  useEffect(
    () => {
      const init = async () => {
        const [balances, orders] = await Promise.all([
          getBalances(user.accounts[0], user.selectedToken),
          getOrders(user.selectedToken),
        ]);
        listenToTrades(user.selectedToken);
        setUser(user => ({ ...user, balances }));
        setOrders(orders);
      };
      if (typeof user.selectedToken !== 'undefined') {
        init();
      }
    },
    [user.selectedToken],
    () => {
      listener.unsubscribe();
    }
  );

  return (
    <div id='App'>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Fragment>
          <Header
            contracts={contracts}
            tokens={tokens}
            user={user}
            selectToken={selectToken}
          />
          <main className='container-fluid'>
            <div className='row'>
              <div className='col-sm-4 first-col'>
                <Wallet user={user} deposit={deposit} withdraw={withdraw} />
                {user.selectedToken.ticker !== 'DAI' ? (
                  <NewOrder
                    createMarketOrder={createMarketOrder}
                    createLimitOrder={createLimitOrder}
                  />
                ) : null}
              </div>
              {user.selectedToken.ticker !== 'DAI' ? (
                <div className='col-sm-8'>
                  <AllTrades trades={trades} />
                  <AllOrders orders={orders} />
                  <MyOrders
                    orders={{
                      buy: orders.buy.filter(
                        order =>
                          order.trader.toLowerCase() ===
                          accounts[0].toLowerCase()
                      ),
                      sell: orders.sell.filter(
                        order =>
                          order.trader.toLowerCase() ===
                          accounts[0].toLowerCase()
                      ),
                    }}
                  />
                </div>
              ) : null}
            </div>
          </main>
        </Fragment>
      )}
    </div>
  );
}

export default App;
