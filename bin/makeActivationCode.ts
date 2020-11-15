import { addActivationCode } from '../src/services/activation-code-service';

(async () => {
  await addActivationCode();
  console.log('인증코드 생성 완료');
  process.exit(0);
})();
