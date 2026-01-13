import { assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { AuthService } from '../src/application/services/auth.service.ts';
import { ManagerRepository } from '../src/infrastructure/database/repositories/manager.repository.ts';

Deno.test('AuthService - hashPassword should return a hash', async () => {
  const mockRepo: Partial<ManagerRepository> = {};

  const service = new AuthService(mockRepo as ManagerRepository);

  const hash = await service.hashPassword('testpassword123');

  assertEquals(typeof hash, 'string');
  assertEquals(hash.length > 50, true);
});

Deno.test('AuthService - comparePassword should validate correctly', async () => {
  const mockRepo: Partial<ManagerRepository> = {};

  const service = new AuthService(mockRepo as ManagerRepository);

  const hash = await service.hashPassword('testpassword123');
  const isValid = await service.comparePassword('testpassword123', hash);
  const isInvalid = await service.comparePassword('wrongpassword', hash);

  assertEquals(isValid, true);
  assertEquals(isInvalid, false);
});

