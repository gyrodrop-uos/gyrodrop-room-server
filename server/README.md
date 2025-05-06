# Room Manager

## Room Manager 서버가 왜 필요한가?

- 여러 디바이스의 자이로 센서 정보를 한 곳에 취합해야 할 필요가 있음.
  - 왜 한 곳에서 취합해야 하는가? Single Source of Truth를 추구하기 위해서.
- 그렇다면 왜 하필이면 Node.js로 따로 서버를 뺐는가? Unity 서버에서 취합하면 안되는가?
  - Unity는 게임 화면만 그리는 용도. 그러니까 게임 클라이언트의 역할만을 수행하기 위함임.
  - Unity에서 웹소켓 서버를 여는데 기본 라이브러리로 제공되지 않아 보임(더 조사가 필요하긴 함). 이는 추후 멀티 디바이스에 배포할 때 여러 문제점이 생길 수 있음.
- Room 기능은 왜 필요한가? 사용자 인증 및 게임 ID 구별을 위해서. 데이터를 취합하는데 이게 어느 게임 플레이어들/게임 스테이지에 해당되는 정보인가? 이것을 알아야 서로 신뢰할 수 있는 데이터 전송이 가능해짐.
  - roomId: 이건 uuid로 유니티에서 새로운 게임을 시작할 때, 스테이지 상관 없이 어쨋든 하나의 새로운 게임 자체를 의미하는 아이디로 나타내는게 좋을 듯.
  - playerIds: 플레이어 아이디 배열
  - gameState: 공용 게임 상태. 이게 중요하고 사용자로부터 자이로 센서 데이터를 받아 여기서 취합할 것임.
    - TODO: 그러면,,, 누가 roll, pitch를 제어하느냐는 어떻게 알지?
- 근데 애초에 Room Manager를 따로 뺄거면, Unity 서버는 왜 여는 거임?
  - 물리 연산 동기화를 위해서. Unity의 Mirror Networking 사용해야 함.

## 데이터 플로우

1. 플레이어들은 게임 클라이언트를 통해 룸 번호 입력 또는 그에 준하는 인증 방식으로 Room Manager과 연결
   - Unity에서 할 수 있음
   - Web Browser에서도 할 수 있음
2. 연결된 정보를 통해 지속적으로 자이로 센서 정보를 보냄
   - Unity Web Socket Client를 이용해서 보냄
   - Web Browser에서의 Web Socket 사용은 매우 쉬움
3. 중앙에서 취합된 자이로 정보는 그냥 그 자체로 보관되고 있을 것
   - 이걸 어떻게 관리하면 좋을까?
   - 쿠버네티스 등으로 스케일러블하게 만들려면 어떻게 해야할까?
4. Unity 중앙 서버에서는(Mirror Networking Host) Room Manager에 연결하여 gameState 정보를 가져와서 판을 기울임.
   - Unity 중앙 서버도 gameId를 기반으로 새로운 인스턴스를 켤 수 있겠군.
   - 하나의 인스턴스에서 n개의 Scene을 열어 제어하는 것도 재밌곘네.
   - 사실 기울기와 공의 위치 그리고 움직일 수 있는 오브젝트의 위치만 동기화되어야 함. 근데 사실 이게 동기화지. "사실"이라는 말을 붙일 이유는 없음.
   - 판을 기울이는 것도 어떻게 할 지 고민해야 함. Room Manager에서 데이터를 가져왔어. 이걸 바로 적용할거야? 그러면 너무 뚝뚝 끊기는 것처럼 보일텐데?

## 만약, 동기화 속도가 기준에 못미친다면?

- 통신 방식 변경이 필요할 것
- 이를 위해 언제든 통신 방식을 쉽게 변경할 수 있도록 아키텍처를 잘 설계해야 할 것.

## 룸 생성과 동시에 Unity Headless Mode를 켤 수 있는가?

- 쉘 스크립트로 돌릴 수 있을 것.
- 또는 Unity Headless Mode를 켜는 또 다른 매니저를 둔다거나. 왜냐하면 쿠버네티스로 자동으로 띄우게 하려면 어느 정도는 로직 처리가 필요할 것. 이걸 어떻게 라우팅할 것인지도 문제이고.

## 여담

### 타입스크립트 절대경로 설정

타입스크립트 절대경로를 설정 후(`@` 같은 류), tsc 빌드 후 node 실행할 때 모듈을 못 불러 오거나, ts-node 할 때에에도 그러는 경우가 있음. 그럴 땐 아래의 패키지도 설치하고 [여기](https://stackoverflow.com/questions/63744943/absolute-path-in-the-tsconfig-doesnt-work)의 내용을 잘 확인하도록 하자.

- ts-patch

  - Directly patch typescript installation to allow custom transformers (plugins).
  - The main difference why I prefer ts-patch over ttypescript is that there is no need to change the compiler (ttsc) because (hence the name) tsc is patched.

- typescript-transform-paths

  - Transforms absolute imports to relative from paths in your tsconfig.json.

- tsconfig-paths
  - Load modules whose location is specified in the paths section of tsconfig.json. Both loading at run-time and via API are supported.
