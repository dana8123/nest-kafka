# nest-kafka

[https://docs.nestjs.com/microservices/kafka](nest.js) 를 읽고 공부한 것을 정리

## Client

[https://docs.nestjs.com/microservices/kafka#client](공식문서)
[https://learn.microsoft.com/ko-kr/dotnet/architecture/microservices/architect-microservice-container-applications/direct-client-to-microservice-communication-versus-the-api-gateway-pattern](참고)

- 다른 마이크로 서비스 transporters와 다른점
  -ClientProxy 대신 clientProxy class 사용

### message pattern

- kafka 마이크로 서비스 메세지 패턴은 요청과 응답 채널을 위한 두가지 토픽으로 활용된다.
- ClientKafka#send() 는 요청 메세지와 함께 correlationId, 응답 토픽, 응답 파티션과 연결된 return address와 함께 메세지를 보낸다.
- 응답에 회신하기 위해서는 ClientKafka 인스턴스에 대해 응답토픽을 구독하고, 하나 이상의 파티션에 할당되어야합니다.

  - 실행중인 모든 Nest 애플리케이션에 대해 하나 이상의 응답 토픽 파티션이 있어야합니다.
  - 새 ClientKafka 인스턴스가 실행될 때 그들은 consumer group에 가입하고 각각의 토픽을 구독합니다.
  - 이 프로세스는 파티션이 consumer group 내의 consumer들에게 토픽 파티션이 할당되는 리밸런스가 트리거입니다.

    Normally, topic partitions are assigned using the round robin partitioner, which assigns topic partitions to a collection of consumers sorted by consumer names which are randomly set on application launch. However, when a new consumer joins the consumer group, the new consumer can be positioned anywhere within the collection of consumers. This creates a condition where pre-existing consumers can be assigned different partitions when the pre-existing consumer is positioned after the new consumer. As a result, the consumers that are assigned different partitions will lose response messages of requests sent before the rebalance.

- 일반적으로 카프카 파티션은 round robin 파티셔너를 이용하여 할당됨
- 새로운 consumer가 consumer group에 가입하면?

## client와 consumer

- consumer는 메세지를 받는 입장?
- client는 메세지를 생성해서 보내는 입장?
- 아니면 쌍방?
- client는 마이크로서비스 입장에서의 client? api gateway ?

## 명령어

- 토픽 생성 `kafka-topics.sh`
- consumer 실행 `kafka-console-producer.sh`
- producer 실행하여 메세지 전송, `kafka-console-producer.sh`
- `kafka-reassign-partitions.sh` 토픽의 파티션과 위치 변경 등을 위해 사용
- `kafka-dump-log.sh` 파티션에 저장된 로그파일의 내용 확인

## 공식문서 읽고 정리한 내용

### event streaming flatform

- 지속적인 읽기(subscribe), 쓰기(publish가 필요한 시스템
  - 주식, 버스 위치 추적, 지속적인 캡쳐가 필요한 IOT device
- 원하는 만큼 신뢰성과 내구성을 갖고 이벤트의 스트림을 저장해야함
- 이벤트가 발생한 시점이나 소급하여 이벤트 스트림을 처리

## how to work

- 고성능 TCP 네트워크 프로토콜을 통해 통신하는 서버와 클라이언트로 구성된 분산 시스템
- server :
  - 여러 데이터 센터, 클라우드 리전에 걸쳐 있는 하나 이상의 서버 클러스터로 실행됨
  - 일부 서버를 브로커라 칭함
  - 다른 서버는 kafka connect를 실행하여 이벤트 스트림을 지속적으로 가져오고 내보내는 역할을 함
- client :
  - 스트림을 병렬로 읽고 쓰고 처리하는 분산 애플리케이션 및 마이크로 서비스를 작성할 수 있음
  - [clients](https://cwiki.apache.org/confluence/display/KAFKA/Clients)
