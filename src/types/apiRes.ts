// i WILL finish it one day
// @ts-expect-error - reserved for future use
type _ApiMap = {
  [key: string]: unknown;
};

// @ts-expect-error - reserved for future use
type _ApiRes<Status extends number, T> = Status extends 200
  ? { Status: Status; Data: T; Message: string }
  : {
      Status: number;
      Data: null;
      Message: string;
    };
