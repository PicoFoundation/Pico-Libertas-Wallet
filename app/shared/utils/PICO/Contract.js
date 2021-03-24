import { forOwn, find, map, pick } from 'lodash';

const Pico = require('picojs');

export const typeMap = {
  bool: 'bool',
  int8: 'int',
  int16: 'int',
  int32: 'int',
  int64: 'int',
  int128: 'int',
  int256: 'int',
  uint8: 'int',
  uint16: 'int',
  uint32: 'int',
  uint64: 'int',
  uint128: 'int',
  uint256: 'int',
};

export default class PICOContract {
  constructor(abi, account = undefined) {
    abi.actions = abi.actions.sort((a: IContractAction, b: IContractAction) => (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0));
    abi.tables = abi.tables.sort((a: IContractTable, b: IContractTable) => (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0));
    abi.structs = abi.structs.sort((a: IContractStruct, b: IContractStruct) => (a.name > b.name) ? 1 : ((a.name < b.name) ? -1 : 0));

    this.account = account;
    this.abi = abi;
    this.typeMap = typeMap;

    forOwn(abi.types, (type) => {
      if (type.type in this.typeMap) {
        this.typeMap[type.new_type_name] = this.typeMap[type.type];
      }
    });
  }

  tx(actionName, account, data) {
    const pico = Pico({
      broadcast: false,
      expireInSeconds: 3600,
      forceActionDataHex: false,
      httpEndpoint: null,
      sign: false
    });
    return pico.transaction({
      actions: [
        {
          account: this.account,
          name: actionName,
          authorization: [{
            actor: account,
            permission: 'active'
          }],
          data
        }
      ]
    }, {
      broadcast: false,
      sign: false
    });
  }

  getAction(name) {
    return find(this.abi.actions, { name });
  }

  getActions() {
    return this.abi.actions;
  }

  getField(struct, name) {
    return find(this.getStruct(struct).fields, { name });
  }

  getFields(name) {
    const struct = this.getStruct(name);
    if (struct && struct.fields) return struct.fields;
    return [];
  }

  getFieldType(struct, name) {
    const field = this.getField(struct, name);
    if (field && field.type in this.typeMap) {
      return this.typeMap[field.type];
    }
    return 'string';
  }

  getStruct(name) {
    return find(this.abi.structs, { name });
  }

  getTable(name) {
    return find(this.abi.tables, { name });
  }

  getTables() {
    return this.abi.tables;
  }

  json() {
    const fields = ['abi', 'account'];
    const data = map(this, (o) => pick(o, fields));
    return JSON.stringify(data, null, 2);
  }
}
