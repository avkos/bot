const ORDER = {
  MIN_USD: 10,
  EXECUTION_TYPE: {
    CANCELED: 'CANCELED',
    NEW:'NEW',
    TRADE:'TRADE',
  },
  TYPE: {
    LIMIT: 'LIMIT',
    MARKET: 'MARKET',
    STOP: 'STOP',
    OCO: 'OCO',
    STOP_MARKET: 'STOP_MARKET',
    TAKE_PROFIT: 'TAKE_PROFIT',
    LIMIT_MAKER: 'LIMIT_MAKER',
    STOP_LOSS_LIMIT: 'STOP_LOSS_LIMIT',
    TAKE_PROFIT_MARKET: 'TAKE_PROFIT_MARKET',
    TRAILING_STOP_MARKET: 'TRAILING_STOP_MARKET',
  },
  STATUS: {
    NEW: 'NEW',
    PARTIALLY_FILLED: 'PARTIALLY_FILLED',
    FILLED: 'FILLED',
    CANCELED: 'CANCELED',
    PENDING_CANCEL: 'PENDING_CANCEL',
    REJECTED: 'REJECTED',
    EXPIRED: 'EXPIRED',
  },
  SIDE: {
    BUY: 'BUY',
    SELL: 'SELL',
  },
  SIDE_DUAL: {
    LONG: 'LONG',
    SHORT: 'SHORT',
    BOTH: 'BOTH',
  },
  TIME_IN_FORCE: {
    GTC: 'GTC',// - Good Till Cancel
    IOC: 'IOC',// - Immediate or Cancel
    FOK: 'FOK',// - Fill or Kill
    GTX: 'GTX',// - Post only or kill
  },
  WORKING_TYPE: {
    MARK_PRICE: 'MARK_PRICE',
    CONTRACT_PRICE: 'CONTRACT_PRICE',
  },
}
const K_LINE = {
  '1m': '1m',
  '3m': '3m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '2h': '2h',
  '4h': '4h',
  '6h': '6h',
  '8h': '8h',
  '12h': '12h',
  '1d': '1d',
  '3d': '3d',
  '1w': '1w',
  '1M': '1M',
}
const SYMBOL = {
  ETHUSDT: 'ETHUSDT',
  BTCUSDT: 'BTCUSDT',
}


const STRATEGY = {
  STATUS:{
    WAIT_ENTRY_POINT:'WAIT_ENTRY_POINT',
    IN_PROGRESS:'IN_PROGRESS',
    COMPLETED:'COMPLETED'
  }
}

module.exports = {
  ORDER,
  K_LINE,
  SYMBOL,
  STRATEGY
}
