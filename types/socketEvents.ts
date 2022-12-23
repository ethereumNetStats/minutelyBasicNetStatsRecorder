// ソケットサーバーに送信するデータ型、データベースの型定義のインポート
import type {basicNetStats, blockNumberWithTimestamp} from "./types";

// blockDataRecorderからソケットサーバーを介して受信するイベント名とデータ型の定義
type ServerToClientEvents = {
    newBlockDataRecorded: (blockNumberWithTimestamp: blockNumberWithTimestamp) => void,
};

// ソケットサーバーへ送信するイベント名とデータ型の定義
type ClientToServerEvents = {
    minutelyBasicNetStatsRecorded: (emitDate: basicNetStats) => void,
};

export type {ServerToClientEvents, ClientToServerEvents}
