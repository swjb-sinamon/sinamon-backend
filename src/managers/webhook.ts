import axios from 'axios';
import config from '../config';

interface EmbedContent {
  readonly title: string;
  readonly description: string;
  readonly color: number;
}

const sendToDiscord = async (content: EmbedContent): Promise<void> => {
  await axios.post(config.discordWebhook, {
    embeds: [
      content
    ]
  });
};

export const sendErrorToDiscord = async (method: string, url: string): Promise<void> => {
  await sendToDiscord({
    title: '500 Internal Server Error',
    description: `500 오류가 발생하였습니다. ${method} ${url}`,
    color: 15412998
  });
};
