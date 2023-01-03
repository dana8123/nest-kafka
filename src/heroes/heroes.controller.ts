import { Controller } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

@Controller('heroes')
export class HeroesController {
  constructor(private readonly client: ClientKafka) {}

  // ClientKafka 인스턴스가 비동기적으로 생성된다면, connect() 메서드를 호출해야한다.
  async onModuleInit() {
    this.client.subscribeToResponseOf('hero.kill.dragon');
    await this.client.connect();
  }

  // Incoming
  // Nest는 카프카 메세지를 key, value로 이루어진 오브젝트로써 수신한다. 그리고 버퍼타입의 value를 가진 헤더와 함께.
  // Nest는 버퍼를 스트링으로 파싱한다.
  // 스트링이 object like라면? Nest는 json으로 파싱한다.
  // value는 다음 핸들러로 전달된다.

  // Outgoing
  //

  @MessagePattern('hero.kill.dragon')
  killDragon(@Payload() message: KillDragonMessage): any {
    const realm = 'Nest';
    const heroId = message.heroId;
    const dragonId = message.dragonId;
    const items = [
      { id: 1, name: 'Mythical Sword' },
      { id: 2, name: 'Key to Dungeon' },
    ];

    return {
      headers: {
        kafka_nestRealm: realm,
      },
      key: heroId,
      value: items,
    };
  }

  // request-response method는 서비스간의 메세지 교환에 대한 이상인 반면,
  // 이벤트 기반의 메세지 스타일일 때, 별로 적합하지않다. (응답을 기다리지 않고 이벤트를 publish 하고싶을 때)

  @MessagePattern('hero.kill.slime')
  killSlime(
    @Payload() message: KillSlimeMessage,
    @Ctx() context: KafkaContext,
  ): any {
    const originalMessage = context.getMessage();
    const { headers, timestamp, partition } = originalMessage;
    console.log(`Topic: ${context.getTopic}`);
  }

  // 핸들러가 slow processing time을 갖는다면 hearbeat 콜백을 고려해야한다..
  @MessagePattern('hero.kill.somthing')
  async killSomething(
    @Payload() message: KillSomething,
    @Ctx() context: KafkaContext,
  ) {
    const heartbeat = context.getHeartbeat();
    // Do some slow processing
    await doWorkPart1();

    // Send heartbeat to not exceed the sessionTimeout, heartbeat을 sessionTimeout
    // slow prcessing이 머..?
    await heartbeat();

    // Do slow processing again
    await doWorkPart2();
  }
}
