#!/bin/bash
sudo docker build -t ethereum_minutely_basic_net_stats_recorder .
sudo docker save ethereum_minutely_basic_net_stats_recorder:latest > ethereum_minutely_basic_net_stats_recorder.tar
sudo docker stop ethereum_minutely_basic_net_stats_recorder
sudo docker ps -a -q -f name=ethereum_minutely_basic_net_stats_recorder | xargs sudo docker rm
sudo docker rmi ethereum_minutely_basic_net_stats_recorder:latest
sudo docker load < ethereum_minutely_basic_net_stats_recorder.tar
sudo docker run -d --name ethereum_minutely_basic_net_stats_recorder ethereum_minutely_basic_net_stats_recorder:latest
