import { Component, Mount, signal } from "@mini/core";
import { Route } from "@mini/router";
import { fromEvent, Subject, takeUntil } from "rxjs";

interface CoinChange {
  amount: string;
  coinType: string;
  balance: string;
  logo: string;
  symbol: string;
  decimals: number;
}

interface TradeData {
  type: "buy" | "sell";
  txDigest: string;
  eventSeq: number;
  timestamp: number;
  sender: string;
  dex: string;
  poolId: string;
  coinChanges: CoinChange[];
  coinType: string;
  price: string;
  usdValue: string;
}

interface Trade {
  id: string;
  type: "buy" | "sell";
  txDigest: string;
  timestamp: number;
  dex: string;
  price: number;
  usdValue: number;
  amount: number;
  symbol: string;
  coinSymbols: string[];
}

interface WebSocketMessage {
  type: string;
  data: TradeData;
}

@Route("/sui-orderbook")
export class SUIOrderBook extends Component {
  private trades = signal<Trade[]>([]);
  private connectionStatus = signal<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  private ws: WebSocket | null = null;
  private readonly MAX_TRADES = 50;

  @Mount()
  onMount() {
    console.log("📊 SUI OrderBook mounted - Starting WebSocket connection");
    this.connectWebSocket();

    // Cleanup on unmount
    return () => {
      console.log("🔌 Disconnecting WebSocket");
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    };
  }

  private connectWebSocket() {
    try {
      this.connectionStatus.set("connecting");
      console.log("🔌 Connecting to wss://ws-api.suivision.xyz/ws");

      this.ws = new WebSocket("wss://ws-api.suivision.xyz/ws");

      // Connection opened
      fromEvent(this.ws, "open")
        .pipe(takeUntil(this.$.unmount$))
        .subscribe(() => {
          console.log("✅ WebSocket connected");
          this.connectionStatus.set("connected");

          // Subscribe to trades
          const subscribeMessage = {
            action: "SUBSCRIBE_TRADES",
            data: {
              tokenId:
                "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            },
          };

          console.log("📤 Sending subscription:", subscribeMessage);
          this.ws?.send(JSON.stringify(subscribeMessage));
        });

      // Listen for messages
      fromEvent<MessageEvent>(this.ws, "message")
        .pipe(takeUntil(this.$.unmount$))
        .subscribe((event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log("📥 Received message:", message);

            // Handle TRADE_DATA messages
            if (message.type === "TRADE_DATA" && message.data) {
              this.handleTradeUpdate(message.data);
            }
          } catch (error) {
            console.error("❌ Error parsing message:", error, event.data);
          }
        });

      // Connection closed
      fromEvent(this.ws, "close")
        .pipe(takeUntil(this.$.unmount$))
        .subscribe(() => {
          console.log("🔴 WebSocket disconnected");
          this.connectionStatus.set("disconnected");
        });

      // Connection error
      fromEvent(this.ws, "error")
        .pipe(takeUntil(this.$.unmount$))
        .subscribe((error) => {
          console.error("❌ WebSocket error:", error);
          this.connectionStatus.set("error");
        });
    } catch (error) {
      console.error("❌ Failed to create WebSocket:", error);
      this.connectionStatus.set("error");
    }
  }

  private handleTradeUpdate(tradeData: TradeData) {
    // Extract coin symbols from coinChanges
    const coinSymbols = tradeData.coinChanges.map((coin) => coin.symbol);

    // Get the amount from the first coin change (usually SUI)
    const mainCoin = tradeData.coinChanges[0];
    const amount = parseFloat(mainCoin?.balance || "0");

    // Create a trade object from the received data
    const trade: Trade = {
      id: `${tradeData.txDigest}-${tradeData.eventSeq}`,
      type: tradeData.type,
      txDigest: tradeData.txDigest,
      timestamp: tradeData.timestamp,
      dex: tradeData.dex,
      price: parseFloat(tradeData.price),
      usdValue: parseFloat(tradeData.usdValue),
      amount: amount,
      symbol: mainCoin?.symbol || "SUI",
      coinSymbols: coinSymbols,
    };

    console.log("💹 Processing trade:", trade);

    // Add to the beginning of the array and limit to MAX_TRADES
    this.trades.set((current) => {
      const newTrades = [trade, ...current];
      return newTrades.slice(0, this.MAX_TRADES);
    });
  }

  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  private formatNumber(num: number, decimals: number = 2): string {
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  private reconnect() {
    console.log("🔄 Attempting to reconnect...");
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.trades.set([]);
    this.connectWebSocket();
  }

  render() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  🌊 SUI Blockchain Order Book
                </h1>
                <p className="text-slate-300">
                  Real-time trades from SUI network • Memory leak test with{" "}
                  {this.MAX_TRADES} item limit
                </p>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-4">
                {this.connectionStatus.map((status) => (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        status === "connected"
                          ? "bg-green-500 animate-pulse"
                          : status === "connecting"
                          ? "bg-yellow-500 animate-pulse"
                          : status === "error"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }`}
                    />
                    <span className="text-sm text-slate-300 capitalize">
                      {status}
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => this.reconnect()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Reconnect
                </button>
              </div>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-slate-400 text-sm mb-1">Total Trades</p>
              <p className="text-3xl font-bold text-white">
                {this.trades.length()}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-slate-400 text-sm mb-1">Max Items</p>
              <p className="text-3xl font-bold text-white">{this.MAX_TRADES}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-slate-400 text-sm mb-1">Memory Test</p>
              <p className="text-3xl font-bold text-green-400">Active</p>
            </div>
          </div>

          {/* Trades Table */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      DEX
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      USD Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Pair
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      TX Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {this.trades
                    .map((trade) => (
                      <tr
                        key={trade.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {this.formatTimestamp(trade.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              trade.type === "buy"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {trade.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300 uppercase">
                          {trade.dex}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-white">
                          ${this.formatNumber(trade.price, 4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-slate-300">
                          {this.formatNumber(trade.amount, 2)} {trade.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-green-400">
                          ${this.formatNumber(trade.usdValue, 2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {trade.coinSymbols.join(" / ")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono truncate max-w-xs">
                          {trade.txDigest.substring(0, 12)}...
                        </td>
                      </tr>
                    ))
                    .orElse(() => (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-12 text-center text-slate-400"
                        >
                          {this.connectionStatus.map((status) =>
                            status === "connecting"
                              ? "Connecting to WebSocket..."
                              : status === "connected"
                              ? "Waiting for trades..."
                              : status === "error"
                              ? "Connection error. Click Reconnect to retry."
                              : "Disconnected. Click Reconnect to start."
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-slate-400 text-sm">
            <p>
              This component tests memory leaks by maintaining a maximum of{" "}
              {this.MAX_TRADES} trades in memory. New trades appear at the top
              and old ones are automatically removed.
            </p>
            <p className="mt-2">
              WebSocket:{" "}
              <code className="bg-white/10 px-2 py-1 rounded">
                wss://ws-api.suivision.xyz/ws
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }
}
