# minutelyBasicNetStatsRecorderについて
minutelyBasicNetStatsRecorderは、[Geth](https://github.com/ethereum/go-ethereum)にアクセスし、
イーサリアムネットワークの統計情報をMySQLデータベースに記録します。  
minutelyBasicNetStatsRecorderは、Gethとの通信には[web3js](https://github.com/web3/web3.js)を使用し、その他の通信には[sokcet.io](https://socket.io/)を使用します。
minutelyBasicNetStatsRecorderは、[blockDataRecorder](https://github.com/ethereumNetStats/blockDataRecorder)から`newBlockDataRecorded`イベントを[socketServer](https://github.com/ethereumNetStats/socketServer)を介して受け取ったときに集計処理を開始し、集計結果をデータベースに記録し、記録が完了したことを`minutelyBasicNetStatsRecorded`イベントでsocketServerに通知します。

# 事前準備
以下では、ubuntu server v22.04での使用例を説明します。  
[blockDataRecorder](https://github.com/ethereumNetStats/blockDataRecorder)のDockerのインストール〜ソースコードの実行までを完了して
Gethの運用とMySQLのDBテーブル`blockData`の生成までを完了して下さい。  
また、ethereumNetStatsのバックエンドは[socketServer](https://github.com/ethereumNetStats/socketServer)を介してそれぞれのプログラムがデータをやりとりします。したがってsocketServerを稼働させて下さい。
プログラムの内容のみを知りたい場合はソースコードを参照ください。  

**ソースコード**
- メイン：[minutelyBasicNetStatsRecorder.ts](https://github.com/ethereumNetStats/minutelyBasicNetStatsRecorder/blob/main/minutelyBasicNetStatsRecorder.ts)
- 外部関数：[timeRangeArrayMaker.ts](https://github.com/ethereumNetStats/minutelyBasicNetStatsRecorder/blob/main/externalFunctions/timeRangeArrayMaker.ts)
- 外部関数：[recordBasicNetStats.ts](https://github.com/ethereumNetStats/minutelyBasicNetStatsRecorder/blob/main/externalFunctions/recordBasicNetStats.ts)

## 使い方
まずこのレポジトリを`clone`します。
```shell
git clone https://github.com/ethereumNetStats/minutelyBasicNetStats.git
```
クローンしたディレクトリ内にある`.envSample`ファイルの`MYSQL_USER`と`MYSQL_PASS`を編集します。  
[blockDataRecorder](https://github.com/ethereumNetStats/blockDataRecorder)の手順通りにMySQLコンテナを立ち上げた場合は`MYSQL_USER=root`、`MYSQL_PASS`は起動時に指定したパスワードになります。  
`.envSample`
```
GETH_LAN_HTTP_API_ADDRESS=http://127.0.0.1:8545
GETH_LAN_SOCKET_API_ADDRESS=ws://127.0.0.1:8546

MYSQL_LAN_ADDRESS=127.0.0.1
MYSQL_PORT=3308
MYSQL_USER=******
MYSQL_PASS=******

SOCKET_SERVER_ADDRESS=ws://127.0.0.1:6000
```
`.envSample`の編集が終わったらファイル名を`.env`にリネームして下さい。
```shell
mv ./.envSample ./.env 
```
`.env`の編集が終わったら関連パッケージのインストールをします。
```shell
npm install
```
関連パッケージのインストールが終わったらTypescriptソースを下記コマンドでコンパイルします。
```shell
tsc --project tsconfig.json
```
コンパイルが終わったらDockerイメージをビルドしてコンテナを起動するためにシェルスクリプト`buildAndRunDockerImage.sh`に実行権限を付与します。
```shell
chmod 755 ./buildAndRunDockerImage.sh
```
最後にシェルスクリプトを実行してDockerコンテナを起動します。
```shell
sudo ./buildAndRunDockerImage.sh
```
