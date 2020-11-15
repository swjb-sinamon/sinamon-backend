// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import chalk from 'chalk';
import { addActivationCode } from '../src/services/activation-code-service';

// 인증코드 생성용 스크립트 파일

(async () => {
  const result = await addActivationCode();
  console.log(chalk.green(`${chalk.underline(result.code)} 인증코드 생성 완료`));
  process.exit(0);
})();
