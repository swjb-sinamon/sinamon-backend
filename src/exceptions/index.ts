class ServiceException extends Error {
  public httpStatus: number;

  constructor(message: string, httpStatus: number) {
    super(message);
    this.message = message;
    this.name = 'ServiceException';
    this.httpStatus = httpStatus;
  }
}

export default ServiceException;
