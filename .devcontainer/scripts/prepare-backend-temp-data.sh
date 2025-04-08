#!/bin/bash

cat << EOF > /tmp/players.json
[
    {
        "id": "1",
        "name": "조성채",
        "email": "seongchae7330@daum.net"
    },
    {
        "id": "2",
        "name": "이현제",
        "email": "dlguswp010731@gmail.com"
    },
    {
        "id": "3",
        "name": "이성호",
        "email": "tjdgh2626@gmail.com"
    }
]
EOF

cat << EOF > /tmp/game-stages.json
[
    {
        "id": "1",
        "name": "1단계",
        "description": "1단계 설명"
    },
    {
        "id": "2",
        "name": "2단계",
        "description": "2단계 설명"
    },
    {
        "id": "3",
        "name": "3단계",
        "description": "3단계 설명"
    }
]
EOF