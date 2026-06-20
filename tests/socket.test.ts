import { Server } from 'socket.io';
import Client from 'socket.io-client';
import http from 'http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import setupSocket from '../src/config/socket.js';

let io: Server, server: http.Server, clientSocket: any;

beforeEach((done) => {
  server = http.createServer().listen();
  io = new Server(server);
  setupSocket(io);

  clientSocket = new Client(`http://localhost:${(server.address() as any).port}`, {
    auth: { userId: 1, tenantId: 1 },
  });

  clientSocket.on('connect', done);
});

afterEach(() => {
  io.close();
  clientSocket.close();
  server.close();
});

describe('Socket.IO Server', () => {
  it('should receive location updates', (done) => {
    clientSocket.on('locationUpdate', (data: any) => {
      expect(data).toStrictEqual({ userId: 1, lat: 123, lng: 456 });
      done();
    });

    clientSocket.emit('trackLocation', { lat: 123, lng: 456 });
  });

  it('should receive task status updates', (done) => {
    clientSocket.on('taskStatusUpdate', (data: any) => {
      expect(data).toStrictEqual({ taskId: 1, status: 'Completed' });
      done();
    });

    clientSocket.emit('taskStatus', { taskId: 1, status: 'Completed' });
  });
});
