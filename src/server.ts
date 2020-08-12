import { app, logger } from './index';

const PORT = 8080;
app.listen(PORT, () => logger.info(`Backend server listening on ${PORT}`));
