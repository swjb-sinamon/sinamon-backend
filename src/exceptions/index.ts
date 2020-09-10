class ServiceException extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'ServiceException';
  }
}

export default ServiceException;
