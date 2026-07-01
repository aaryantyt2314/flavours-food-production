declare module 'socket.io-client' {
  export type Socket = {
    on: (event: string, listener: (...args: any[]) => void) => Socket;
    emit: (event: string, ...args: any[]) => Socket;
    disconnect: () => Socket;
  };

  export function io(...args: any[]): Socket;
}

declare module 'socket.io' {
  export class Server {
    constructor(...args: any[]);
    on(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
  }
}