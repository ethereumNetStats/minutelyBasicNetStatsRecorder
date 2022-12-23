// 環境変数のインポート
import 'dotenv/config';

// パッケージのインポート
import {io} from "socket.io-client";

// 自作パッケージのインポート
import {getMysqlConnection} from "@ethereum_net_stats/get_mysql_connection";
import {currentTimeReadable, unixTimeReadable} from "@ethereum_net_stats/readable_time";
import {timeRangeArrayMaker} from "./externalFunctions/timeRangeArrayMaker";
import {recordBasicNetStats} from "./externalFunctions/recordBasicNetStats.js";

// 型定義のインポート
import type {Socket} from "socket.io-client";
import type {blockNumberWithTimestamp, timeRangeArray} from "./types/types";
import type {ServerToClientEvents} from './types/socketEvents';
import type {Pool, RowDataPacket} from "@ethereum_net_stats/get_mysql_connection";

// データベースへのプールコネクションを作成
let pool: Pool = getMysqlConnection(false);
const tableName: string = "minutelyBasicNetStats";

// socket.io-clientの定義
const socketClientName: string = "minutelyBasicNetStatsRecorder";
const socketClient: Socket<ServerToClientEvents> = io(`${process.env.SOCKET_SERVER_ADDRESS}`, {
    forceNew: true,
    query: {name: socketClientName}
});

// ソケットサーバーに接続した時の処理
socketClient.on('connect', () => {
    console.log(`${currentTimeReadable()} | Connect : socketServer`);
});

// データの記録処理中か否かを示すフラグ
let isRecording: boolean = false;

// データ収集期間を設定
const MINUTES = 60;
const DURATION = MINUTES;

// blockDataRecorderからの"newBlockDataRecorded"イベントをsocketServerを介してリスニングする
socketClient.on("newBlockDataRecorded", async (blockNumberWithTimestamp: blockNumberWithTimestamp) => {
    // "newBlockDataRecorded"イベントを受信したらブロックデータのタイムスタンプを表示
    console.log(`${currentTimeReadable()} | Receive : 'newBlockDataRecorded' | From : socketServer | Timestamp : ${unixTimeReadable(Number(blockNumberWithTimestamp.timestamp))}`);

    //　データ記録中でなければ、記録処理を開始
    if (!isRecording) {

        // データの記録中を示すようにフラグを書き換え
        isRecording = true;

        // データベース上の最新データのタイムスタンプを取得
        let [endTimeOfMinutelyBasicNetStats] = await pool.query<RowDataPacket[any]>(`SELECT endTimeUnix
                                                                                     FROM ${tableName}
                                                                                     ORDER BY endTimeUnix DESC LIMIT 1`);

        // データベースが空の場合には0のタイムスタンプを設定
        if (endTimeOfMinutelyBasicNetStats.length === 0) {
            endTimeOfMinutelyBasicNetStats[0] = {endTimeUnix: 0};
        }

        if (blockNumberWithTimestamp.timestamp) {
            // タイムスタンプの値がTruthyなら集計期間の開始時間と終了時間を示すtimeRangeArray配列を生成
            let timeRangeArray: timeRangeArray = timeRangeArrayMaker(endTimeOfMinutelyBasicNetStats[0].endTimeUnix, blockNumberWithTimestamp.timestamp, DURATION);

            if (timeRangeArray.length > 0) {
                // timeRangeArray配列の要素数が１以上で集計期間が定義されていたら集計用の関数を呼び出し
                await recordBasicNetStats(timeRangeArray, socketClient, DURATION);
            } else {
                // timeRangeArray配列の要素数が０集計期間が定義されていなかったら現在時刻が集計期間を越えるまで待つ
                console.log(`${currentTimeReadable()} | Wait : The block timestamp to pass the current time range.`);
            }
        }

        // データの集計処理が終了したらフラグを元に戻す
        isRecording = false;

    } else {
        // データの記録処理が進行中の場合はイベント受信を無視する
        console.log(`${currentTimeReadable()} | Ignore : The recording is currently running. This event emitting is ignored.`);
    }

});
