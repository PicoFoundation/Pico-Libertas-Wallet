import { get, set } from 'dot-prop-immutable';

import * as types from './types';
import pico from './helpers/pico';
import pico2 from './helpers/pico2';

export function buildTransaction(contract, action, account, data) {
  return (dispatch: () => void, getState) => {
    const {
      connection,
      settings
    } = getState();
    // Modify forceActionDataHex to allow for viewing of the action data
    const modified = set(connection, 'forceActionDataHex', false);
    // Reset system state to clear any previous transactions
    dispatch({
      type: types.RESET_SYSTEM_STATES
    });
    // Issue the pending transaction event
    dispatch({
      type: types.SYSTEM_TRANSACTION_BUILD_PENDING
    });
    // Build the operation to perform
    const op = {
      actions: [
        {
          account: contract.account,
          name: action,
          authorization: [{
            actor: account,
            permission: settings.authorization || 'active'
          }],
          data
        }
      ]
    };

    // weird precision,symbol hack - use picojs2 to build valid transaction obj, 
    // pass back to normal picojs for processing
    pico2(modified, true).transact(op, {
      broadcast: false,
      blocksBehind: 3,
      expireSeconds: 120
    }).then((tempTx) => {
      const buffer = Buffer.from(tempTx.serializedTransaction, 'hex');
      pico2(modified, false).deserializeTransactionWithActions(buffer)
      .then((newTx) => {
        pico(modified).transaction(op, {
          broadcast: false,
          forceActionDataHex: false,
          sign: false
        })
        .then((tx) => {
          tx.transaction.transaction = Object.assign({}, newTx);
          dispatch(setTransaction(JSON.stringify({
            contract,
            transaction: tx
          })));
          return dispatch({
            payload: { tx },
            type: types.SYSTEM_TRANSACTION_BUILD_SUCCESS
          });
        })
        .catch((err) => dispatch({
          payload: { err },
          type: types.SYSTEM_TRANSACTION_BUILD_FAILURE
        }));
      });
    })
    .catch((err) => dispatch({
      payload: { err },
      type: types.SYSTEM_TRANSACTION_BUILD_FAILURE
    }));
  };
}

export function broadcastTransaction(tx) {
  return (dispatch: () => void, getState) => {
    const {
      connection
    } = getState();
    pico(connection)
      .pushTransaction(tx.transaction).then((response) =>
        dispatch({
          payload: { tx: response },
          type: types.SYSTEM_TRANSACTION_BROADCAST_SUCCESS
        }))
      .catch((err) => dispatch({
        payload: { err, tx },
        type: types.SYSTEM_TRANSACTION_BROADCAST_FAILURE
      }));
  };
}

export function cancelTransaction() {
  return (dispatch: () => void) => {
    dispatch({
      type: types.CLEAR_TRANSACTION
    });
  };
}

export function clearTransaction() {
  return (dispatch: () => void) => {
    dispatch({
      type: types.CLEAR_TRANSACTION
    });
  };
}

export function setTransaction(data) {
  return (dispatch: () => void) => {
    try {
      dispatch({
        type: types.SET_TRANSACTION,
        payload: JSON.parse(data)
      });
    } catch (err) {
      dispatch({
        type: types.SET_TRANSACTION_FAILURE,
        payload: { err, data }
      });
    }
  };
}

export function signTransaction(tx, contract = false) {
  return (dispatch: () => void, getState) => {
    const {
      connection
    } = getState();
    const signer = pico(connection, true);
    // If a contract was specified along with the transaction, load it.
    if (contract && contract.account && contract.abi) {
      signer.fc.abiCache.abi(contract.account, contract.abi);
    }
    // Sign the transaction
    signer
      .transaction(tx.transaction.transaction, {
        broadcast: connection.broadcast,
        expireInSeconds: connection.expireInSeconds,
        sign: connection.sign
      })
      .then((signed) => {
        if (signed.broadcast) {
          return dispatch({
            payload: { tx: signed },
            type: types.SYSTEM_TRANSACTION_BROADCAST_SUCCESS
          });
        }
        return dispatch(setTransaction(JSON.stringify({
          contract,
          transaction: signed
        })));
      })
      .catch((err) => {
        dispatch({
        payload: { err, tx },
        type: types.SYSTEM_TRANSACTION_SIGN_FAILURE
      })});
  };
}

export default {
  buildTransaction,
  broadcastTransaction,
  clearTransaction,
  setTransaction,
  signTransaction
};
