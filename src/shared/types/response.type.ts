export type TMeta = {
  page: number;
  limit: number;
  total: number;
};

export type TResponseData<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: TMeta;
};